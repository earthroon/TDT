import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, assert, readJson, seal, sha256File, structuralProbe, writeFailure, writeJsonAtomic } from './lib.mjs';

try {
  const launch = readJson(path.join(ARTIFACT_ROOT, 'runtime', 'primary-launch-receipt.json'));
  const smoke = readJson(path.join(launch.exportRootLocal, 'promotion-baseline-00', 'cross-format-save-smoke.json'));
  assert(smoke.status === 'PASS' && Array.isArray(smoke.outputs), 'P0C_SAVE_SMOKE_RECEIPT_REJECTED');
  const records = [];
  for (const output of smoke.outputs) {
    const file = path.join(launch.exportRootLocal, output.filename);
    assert(fs.existsSync(file), 'P0C_SAVE_SMOKE_OUTPUT_MISSING', { format: output.format, filename: output.filename });
    const onDiskSha256 = sha256File(file);
    assert(onDiskSha256 === output.outputSha256, 'P0C_SAVE_SMOKE_DIGEST_MISMATCH', { format: output.format, expected: output.outputSha256, actual: onDiskSha256 });
    const structure = structuralProbe(file);
    records.push({ format: output.format, filename: output.filename, byteLength: fs.statSync(file).size, onDiskSha256, structure });
  }
  const present = new Set(records.map((record) => record.format));
  for (const required of smoke.requiredFormats) assert(present.has(required), 'P0C_SAVE_SMOKE_FORMAT_MISSING', { required });
  const receipt = seal({ schemaVersion: 1, specId: SPEC_ID, status: 'PASS', state: 'CROSS_FORMAT_SAVE_SMOKE_VERIFIED', records, createdAt: new Date().toISOString() });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'save-smoke', 'cross-format-save-smoke-verification-receipt.json'), receipt);
  console.log(`PASS ${SPEC_ID} state=${receipt.state} outputs=${records.length}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0C_SAVE_SMOKE_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
