import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, assert, readJson, seal, writeFailure, writeJsonAtomic } from './lib.mjs';

try {
  const launch = readJson(path.join(ARTIFACT_ROOT, 'runtime', 'primary-launch-receipt.json'));
  const observed = readJson(path.join(launch.exportRootLocal, 'promotion-baseline-00', 'worker-restart.json'));
  assert(observed.status === 'PASS' && observed.state === 'WORKER_RESTART_VERIFIED', 'P0C_WORKER_RESTART_RECEIPT_REJECTED');
  assert(observed.restart?.nextGeneration > observed.restart?.previousGeneration, 'P0C_WORKER_GENERATION_NOT_ADVANCED', { restart: observed.restart });
  assert(observed.restart?.pendingAfter === 0 && observed.pendingLeakCount === 0, 'P0C_WORKER_PENDING_LEAK', { restart: observed.restart });
  assert(observed.restart?.circuitOpen === false, 'P0C_WORKER_CIRCUIT_OPEN');
  assert(observed.retryPng?.outputSha256 && observed.retryPng.outputSha256 === observed.initialPng?.outputSha256, 'P0C_WORKER_RESTART_OUTPUT_MISMATCH');
  const receipt = seal({ schemaVersion: 1, specId: SPEC_ID, status: 'PASS', state: 'WORKER_RESTART_AND_PENDING_CLOSURE_VERIFIED', observationDigest: observed.selfDigest, createdAt: new Date().toISOString() });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'worker-restart', 'worker-restart-verification-receipt.json'), receipt);
  console.log(`PASS ${SPEC_ID} state=${receipt.state}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0C_WORKER_RESTART_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
