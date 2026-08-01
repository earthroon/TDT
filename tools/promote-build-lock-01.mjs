import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ARTIFACT_DIR, readJson, writeJson, sha256File, promoteLockAtomic } from './build-lock-01-lib.mjs';
const candidate = process.env.TDT_BUILD_LOCK_CANDIDATE;
if (!candidate || !fs.existsSync(candidate)) throw new Error('E_BUILD_LOCK_CANDIDATE_GENERATION_FAILED');
const mutation = readJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_LOCK_MUTATION_ZERO_REPORT.json'));
const repro = readJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_INSTALL_REPRODUCIBILITY_REPORT.json'));
const oldReport = readJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_OLD_LOCK_FORENSIC_REPORT.json'));
if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('E_BUILD_LOCK_HOST_PLATFORM_MISMATCH');
if (mutation.status !== 'PASS' || repro.status !== 'PASS') throw new Error('E_BUILD_LOCK_PROMOTION_PRECONDITION');
const result = promoteLockAtomic({ candidateLock: candidate, destinationLock: path.join(ROOT,'package-lock.json'), expectedOldSha256: oldReport.packageLockSha256 });
const receipt = {
  schemaVersion: 1,
  patchId: 'TDT-BUILD-LOCK-01',
  status: 'DEPENDENCY_LOCK_PROMOTED',
  state: 'DEPENDENCY_LOCK_PROMOTED',
  promoted: true,
  atomicReplace: true,
  readbackVerified: true,
  pointerMutationPerformed: false,
  ...result,
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json'), receipt);
console.log(`PASS DEPENDENCY_LOCK_PROMOTED ${sha256File(path.join(ROOT,'package-lock.json'))}`);
