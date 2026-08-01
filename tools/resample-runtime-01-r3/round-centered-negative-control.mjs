import {
  FIXTURE_SCHEMA_ID,
  NeumaierSum,
  assertFinite,
  clamp,
  fail,
  loadFixtureManifest,
  resolveFixture,
} from './lib.mjs';

export function wgslRoundScalar(value) {
  assertFinite(value, 'wgsl-round-input');
  if (value === 0) return 0;
  return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}

export function negativeRoundedCenter(position) {
  return [wgslRoundScalar(position[0]), wgslRoundScalar(position[1])];
}

export function negativeCandidateCoordinate(roundedCenter, offsetX, offsetY) {
  return [roundedCenter[0] + offsetX, roundedCenter[1] + offsetY];
}

export function negativeDistance(offsetX, offsetY) {
  return [offsetX, offsetY];
}

function negativeQ(delta, ellipse) {
  const nx = -ellipse.tangentY;
  const ny = ellipse.tangentX;
  const tangentProjection = delta[0] * ellipse.tangentX + delta[1] * ellipse.tangentY;
  const normalProjection = delta[0] * nx + delta[1] * ny;
  return assertFinite((tangentProjection / ellipse.majorRadius) ** 2 + (normalProjection / ellipse.minorRadius) ** 2, 'negative-q');
}

function negativeWeight(q, ellipse) {
  if (q > 1) return 0;
  const value = Math.exp(-ellipse.kernelSharpness * q) * (Math.max(0, 1 - q) ** ellipse.taperExponent);
  return assertFinite(value, 'negative-weight');
}

function fetchPixel(source, x, y) {
  const xx = clamp(x, 0, source.width - 1);
  const yy = clamp(y, 0, source.height - 1);
  const index = (yy * source.width + xx) * 4;
  return source.pixels.slice(index, index + 4);
}

export function evaluateNegativeResolved({ fixture, source, ellipse, position }) {
  if (fixture.fixtureSchemaId !== FIXTURE_SCHEMA_ID) fail('E_R3_FIXTURE_SCHEMA_INVALID', 'negative control requires sealed fixture');
  const roundedCenter = negativeRoundedCenter(position);
  const weightSum = new NeumaierSum();
  const channels = [new NeumaierSum(), new NeumaierSum(), new NeumaierSum(), new NeumaierSum()];
  let candidateCount = 0;
  let contributingCount = 0;
  for (let offsetY = -ellipse.maxReach; offsetY <= ellipse.maxReach; offsetY += 1) {
    for (let offsetX = -ellipse.maxReach; offsetX <= ellipse.maxReach; offsetX += 1) {
      candidateCount += 1;
      const sampleCoordinate = negativeCandidateCoordinate(roundedCenter, offsetX, offsetY);
      const delta = negativeDistance(offsetX, offsetY);
      const q = negativeQ(delta, ellipse);
      const weight = negativeWeight(q, ellipse);
      if (!(weight > 0)) continue;
      const pixel = fetchPixel(source, sampleCoordinate[0], sampleCoordinate[1]);
      weightSum.add(weight);
      for (let channel = 0; channel < 4; channel += 1) channels[channel].add(pixel[channel] * weight);
      contributingCount += 1;
    }
  }
  const totalWeight = weightSum.value();
  if (!(totalWeight > 0)) fail('E_R3_ORACLE_ZERO_WEIGHT_SUM', 'negative control produced zero weight');
  return {
    fixtureId: fixture.fixtureId,
    rgba: channels.map((sum) => sum.value() / totalWeight),
    weightSum: totalWeight,
    candidateCount,
    contributingCount,
    phase: [position[0] - Math.floor(position[0]), position[1] - Math.floor(position[1])],
    position: [...position],
    roundedCenter,
  };
}

export function evaluateNegativeControlFixture(fixtureOrId, manifest = loadFixtureManifest()) {
  return evaluateNegativeResolved(resolveFixture(manifest, fixtureOrId));
}
