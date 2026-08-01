import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, assert, readJson, seal, writeFailure, writeJsonAtomic } from './lib.mjs';

try {
  const launch = readJson(path.join(ARTIFACT_ROOT, 'runtime', 'primary-launch-receipt.json'));
  const health = readJson(path.join(launch.exportRootLocal, 'promotion-baseline-00', 'runtime-health.json'));
  assert(health.status === 'PASS' && health.state === 'PACKAGED_RUNTIME_ADMITTED', 'P0C_RUNTIME_HEALTH_REJECTED', { health });
  assert(health.launch?.packaged === true && health.launch?.e2eMode === true, 'P0C_RUNTIME_NOT_PACKAGED', { launch: health.launch });
  assert(['READY','DEGRADED'].includes(health.bootTerminalState), 'P0C_RUNTIME_NOT_READY', { bootTerminalState: health.bootTerminalState });
  assert(health.stableRuntimeApi === 'dadum.runtime.pipeline-r7', 'P0C_RUNTIME_API_MISMATCH', { stableRuntimeApi: health.stableRuntimeApi });
  assert(health.stableExportApi === 'dadum.runtime.export.v1', 'P0C_EXPORT_API_MISMATCH', { stableExportApi: health.stableExportApi });
  assert(health.workerAuthority === 'dadum.runtime.encoder-worker-broker-ew02', 'P0C_WORKER_API_MISMATCH', { workerAuthority: health.workerAuthority });
  assert(health.crossOriginIsolated === true && health.sharedArrayBufferAvailable === true, 'P0C_COI_RUNTIME_MISSING', { crossOriginIsolated: health.crossOriginIsolated, sharedArrayBufferAvailable: health.sharedArrayBufferAvailable });
  assert(health.legacyExportFacadeRetired === true, 'P0C_LEGACY_EXPORT_FACADE_ACTIVE');
  const receipt = seal({ schemaVersion: 1, specId: SPEC_ID, status: 'PASS', state: 'PACKAGED_RUNTIME_HEALTH_VERIFIED', healthReceiptDigest: health.selfDigest, createdAt: new Date().toISOString() });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'runtime', 'runtime-health-verification-receipt.json'), receipt);
  console.log(`PASS ${SPEC_ID} state=${receipt.state}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0C_RUNTIME_HEALTH_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
