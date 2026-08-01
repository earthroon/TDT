import {
  COORDINATE_CONVENTION_ID,
  FIXTURE_SCHEMA_ID,
  NeumaierSum,
  assertFinite,
  clamp,
  fail,
  loadFixtureManifest,
  resolveFixture,
} from './lib.mjs';

export function oracleSourcePosition(destinationCoordinate, srcPerDst) {
  assertFinite(destinationCoordinate, 'destinationCoordinate');
  assertFinite(srcPerDst, 'srcPerDst');
  return (destinationCoordinate + 0.5) * srcPerDst - 0.5;
}

export function oracleCandidateBase(position) {
  return [Math.floor(position[0]), Math.floor(position[1])];
}

export function oracleCandidateCoordinate(base, offsetX, offsetY) {
  return [base[0] + offsetX, base[1] + offsetY];
}

export function oracleDistance(logicalSampleCoordinate, position) {
  return [logicalSampleCoordinate[0] - position[0], logicalSampleCoordinate[1] - position[1]];
}

export function oracleEllipseQ(delta, ellipse) {
  const nx = -ellipse.tangentY;
  const ny = ellipse.tangentX;
  const alongTangent = delta[0] * ellipse.tangentX + delta[1] * ellipse.tangentY;
  const alongNormal = delta[0] * nx + delta[1] * ny;
  const q = (alongTangent / ellipse.majorRadius) ** 2 + (alongNormal / ellipse.minorRadius) ** 2;
  return assertFinite(q, 'ellipse-q');
}

export function oracleWeight(q, ellipse) {
  if (q > 1) return 0;
  const radial = Math.exp(-ellipse.kernelSharpness * q);
  const taper = Math.max(0, 1 - q) ** ellipse.taperExponent;
  const weight = radial * taper;
  if (!Number.isFinite(weight)) fail('E_R3_ORACLE_NONFINITE', 'oracle weight is non-finite', { q, weight });
  if (weight < 0) fail('E_R3_ORACLE_NONFINITE', 'oracle weight is negative', { q, weight });
  return weight;
}

function fetchPixel(source, x, y) {
  const fetchX = clamp(x, 0, source.width - 1);
  const fetchY = clamp(y, 0, source.height - 1);
  const index = (fetchY * source.width + fetchX) * 4;
  return [source.pixels[index], source.pixels[index + 1], source.pixels[index + 2], source.pixels[index + 3]];
}

export function evaluateOracleResolved({ fixture, source, ellipse, position }) {
  if (fixture.fixtureSchemaId !== FIXTURE_SCHEMA_ID) fail('E_R3_FIXTURE_SCHEMA_INVALID', 'fixture schema mismatch');
  if (fixture.coordinateConventionId !== COORDINATE_CONVENTION_ID) {
    fail('E_R3_COORDINATE_CONVENTION_MISMATCH', 'coordinate convention mismatch', fixture.coordinateConventionId);
  }
  const base = oracleCandidateBase(position);
  const weightSum = new NeumaierSum();
  const channels = [new NeumaierSum(), new NeumaierSum(), new NeumaierSum(), new NeumaierSum()];
  let candidateCount = 0;
  let contributingCount = 0;
  const contributions = [];
  for (let offsetY = -ellipse.maxReach; offsetY <= ellipse.maxReach; offsetY += 1) {
    for (let offsetX = -ellipse.maxReach; offsetX <= ellipse.maxReach; offsetX += 1) {
      candidateCount += 1;
      const logicalSampleCoordinate = oracleCandidateCoordinate(base, offsetX, offsetY);
      const delta = oracleDistance(logicalSampleCoordinate, position);
      const q = oracleEllipseQ(delta, ellipse);
      const weight = oracleWeight(q, ellipse);
      if (!(weight > 0)) continue;
      const pixel = fetchPixel(source, logicalSampleCoordinate[0], logicalSampleCoordinate[1]);
      weightSum.add(weight);
      for (let channel = 0; channel < 4; channel += 1) channels[channel].add(pixel[channel] * weight);
      contributingCount += 1;
      contributions.push({ offsetX, offsetY, logicalSampleCoordinate, delta, q, weight });
    }
  }
  const totalWeight = weightSum.value();
  if (!(totalWeight > 0) || !Number.isFinite(totalWeight)) {
    fail('E_R3_ORACLE_ZERO_WEIGHT_SUM', 'oracle weight sum must be finite and positive', { totalWeight, fixtureId: fixture.fixtureId });
  }
  const rgba = channels.map((sum) => assertFinite(sum.value() / totalWeight, 'oracle-output-channel'));
  return {
    fixtureId: fixture.fixtureId,
    rgba,
    weightSum: totalWeight,
    candidateCount,
    contributingCount,
    phase: [position[0] - Math.floor(position[0]), position[1] - Math.floor(position[1])],
    position: [...position],
    base,
    contributions,
  };
}

export function evaluateOracleFixture(fixtureOrId, manifest = loadFixtureManifest()) {
  return evaluateOracleResolved(resolveFixture(manifest, fixtureOrId));
}
