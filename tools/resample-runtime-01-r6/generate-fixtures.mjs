import fs from 'node:fs';
import path from 'node:path';
import { ROOT, shaBytes, writeArtifact } from './lib.mjs';

const qs = [0, 1 / 64, 1 / 16, 1 / 8, 1 / 4, 1 / 2, 3 / 4, 15 / 16, 1, 1 + 1 / 64, -1 / 64];
const sharpness = [0.25, 0.75, 1.65, 2.5, 4];
const taper = [0.25, 0.5, 1, 2, 4];
const border = [];
for (const p of [-0.375, 0.125, 3.875]) {
  for (const logical of [-3, -2, -1, 0, 1, 3, 4, 5, 6]) border.push({ p, logical, size: 4 });
}
const fixture = { schemaVersion: 1, qs, sharpness, taper, border };
const text = JSON.stringify(fixture, null, 2) + '\n';
const relative = 'tools/resample-runtime-01-r6/fixtures.json';
fs.writeFileSync(path.join(ROOT, relative), text);
writeArtifact('TDT_RESAMPLE_RUNTIME_01_R6_FIXTURE_RECEIPT.json', {
  schemaVersion: 1,
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R6',
  pass: true,
  path: relative,
  digest: shaBytes(text),
  caseCount: qs.length * sharpness.length * taper.length + border.length,
});
console.log('generated R6 fixtures');
