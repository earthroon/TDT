import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, assert, productionPointerPreflight, seal, sha256Bytes, writeFailure, writeJsonAtomic } from './lib.mjs';

try {
  const productionBefore = productionPointerPreflight();
  const pointerDir = path.join(ARTIFACT_ROOT, 'test-pointer');
  fs.mkdirSync(pointerDir, { recursive: true });
  const pointer = path.join(pointerDir, 'isolated-test-pointer.json');
  const originalBytes = Buffer.from(JSON.stringify({ schemaVersion: 1, authority: 'isolated-test-only', generation: 1, target: 'baseline-a' }, null, 2) + '\n');
  fs.writeFileSync(pointer, originalBytes);
  const originalSha256 = sha256Bytes(originalBytes);
  const observed = fs.readFileSync(pointer);
  assert(sha256Bytes(observed) === originalSha256, 'P0C_TEST_POINTER_PREFLIGHT_FAILED');
  const candidateBytes = Buffer.from(JSON.stringify({ schemaVersion: 1, authority: 'isolated-test-only', generation: 2, target: 'candidate-b', compareAndSwapParentSha256: originalSha256 }, null, 2) + '\n');
  const currentSha256 = sha256Bytes(fs.readFileSync(pointer));
  assert(currentSha256 === originalSha256, 'P0C_TEST_POINTER_CAS_CONFLICT', { expected: originalSha256, actual: currentSha256 });
  const temp = `${pointer}.tmp`;
  fs.writeFileSync(temp, candidateBytes);
  fs.renameSync(temp, pointer);
  const candidateSha256 = sha256Bytes(fs.readFileSync(pointer));
  fs.writeFileSync(temp, originalBytes);
  fs.renameSync(temp, pointer);
  const restoredBytes = fs.readFileSync(pointer);
  assert(restoredBytes.equals(originalBytes), 'P0C_TEST_POINTER_ROLLBACK_MISMATCH');
  const productionAfter = productionPointerPreflight();
  assert(productionAfter.digest === productionBefore.digest, 'P0_PRODUCTION_POINTER_MUTATED', { productionBefore, productionAfter });
  const receipt = seal({ schemaVersion: 1, specId: SPEC_ID, status: 'PASS', state: 'ISOLATED_TEST_POINTER_CAS_ROLLBACK_VERIFIED', originalSha256, candidateSha256, restoredSha256: sha256Bytes(restoredBytes), byteExactRestore: true, productionPointerMutationPerformed: false, productionPointerPreflightDigest: productionBefore.digest, createdAt: new Date().toISOString() });
  writeJsonAtomic(path.join(pointerDir, 'test-pointer-recovery-receipt.json'), receipt);
  console.log(`PASS ${SPEC_ID} state=${receipt.state}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0C_TEST_POINTER_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
