import { assertFinite, normalizeTangent } from './lib.mjs';

export function matrixEllipseQ(delta, ellipse) {
  const [tx, ty] = normalizeTangent(ellipse);
  const nx = -ty;
  const ny = tx;
  const invMajor2 = 1 / (ellipse.majorRadius * ellipse.majorRadius);
  const invMinor2 = 1 / (ellipse.minorRadius * ellipse.minorRadius);
  const a00 = tx * tx * invMajor2 + nx * nx * invMinor2;
  const a01 = tx * ty * invMajor2 + nx * ny * invMinor2;
  const a11 = ty * ty * invMajor2 + ny * ny * invMinor2;
  const q = delta[0] * (a00 * delta[0] + a01 * delta[1]) + delta[1] * (a01 * delta[0] + a11 * delta[1]);
  return assertFinite(q, 'matrix-ellipse-q');
}
