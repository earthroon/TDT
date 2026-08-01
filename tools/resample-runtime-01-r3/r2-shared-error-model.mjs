import { NeumaierSum, assertFinite, clamp, loadFixtureManifest, resolveFixture } from './lib.mjs';

function r2Round(value) {
  if (value === 0) return 0;
  return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}

function r2Weight(offsetX, offsetY, ellipse) {
  const nx = -ellipse.tangentY;
  const ny = ellipse.tangentX;
  const alongTangent = offsetX * ellipse.tangentX + offsetY * ellipse.tangentY;
  const alongNormal = offsetX * nx + offsetY * ny;
  const q = (alongTangent / ellipse.majorRadius) ** 2 + (alongNormal / ellipse.minorRadius) ** 2;
  if (q > 1) return 0;
  return assertFinite(Math.exp(-ellipse.kernelSharpness * q) * Math.max(0, 1 - q) ** ellipse.taperExponent, 'r2-shared-weight');
}

function r2Fetch(source, x, y) {
  const xx = clamp(x, 0, source.width - 1);
  const yy = clamp(y, 0, source.height - 1);
  const index = (yy * source.width + xx) * 4;
  return source.pixels.slice(index, index + 4);
}

export function evaluateR2SharedErrorResolved({ fixture, source, ellipse, position }) {
  const anchorX = r2Round(position[0]);
  const anchorY = r2Round(position[1]);
  const weight = new NeumaierSum();
  const channels = [new NeumaierSum(), new NeumaierSum(), new NeumaierSum(), new NeumaierSum()];
  let contributingCount = 0;
  for (let y = -ellipse.maxReach; y <= ellipse.maxReach; y += 1) {
    for (let x = -ellipse.maxReach; x <= ellipse.maxReach; x += 1) {
      const w = r2Weight(x, y, ellipse);
      if (!(w > 0)) continue;
      const pixel = r2Fetch(source, anchorX + x, anchorY + y);
      weight.add(w);
      for (let c = 0; c < 4; c += 1) channels[c].add(pixel[c] * w);
      contributingCount += 1;
    }
  }
  const sum = weight.value();
  return { fixtureId: fixture.fixtureId, rgba: channels.map((entry) => entry.value() / sum), weightSum: sum, contributingCount };
}

export function evaluateR2SharedErrorFixture(fixtureOrId, manifest = loadFixtureManifest()) {
  return evaluateR2SharedErrorResolved(resolveFixture(manifest, fixtureOrId));
}
