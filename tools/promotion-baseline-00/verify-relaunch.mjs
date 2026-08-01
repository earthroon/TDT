import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, assert, readJson, seal, writeFailure, writeJsonAtomic } from './lib.mjs';

try {
  const primaryLaunch = readJson(path.join(ARTIFACT_ROOT, 'runtime', 'primary-launch-receipt.json'));
  const relaunchLaunch = readJson(path.join(ARTIFACT_ROOT, 'runtime', 'relaunch-launch-receipt.json'));
  const primaryHealth = readJson(path.join(primaryLaunch.exportRootLocal, 'promotion-baseline-00', 'runtime-health.json'));
  const relaunch = readJson(path.join(relaunchLaunch.exportRootLocal, 'promotion-baseline-00', 'relaunch.json'));
  assert(relaunch.status === 'PASS' && relaunch.state === 'RELAUNCH_VERIFIED', 'P0C_RELAUNCH_RECEIPT_REJECTED');
  assert(relaunch.health?.launch?.packageContentId === undefined || relaunchLaunch.packageContentId === primaryLaunch.packageContentId, 'P0C_RELAUNCH_PACKAGE_IDENTITY_MISMATCH');
  assert(relaunch.health?.stableExportApi === primaryHealth.stableExportApi, 'P0C_RELAUNCH_API_IDENTITY_MISMATCH');
  assert(relaunch.png?.outputSha256, 'P0C_RELAUNCH_OUTPUT_MISSING');
  const receipt = seal({ schemaVersion: 1, specId: SPEC_ID, status: 'PASS', state: 'PACKAGED_RELAUNCH_VERIFIED', packageContentId: relaunchLaunch.packageContentId, primaryRuntimeIdentity: primaryHealth.exportImplementationId, relaunchRuntimeIdentity: relaunch.health.exportImplementationId, relaunchPngSha256: relaunch.png.outputSha256, createdAt: new Date().toISOString() });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'runtime', 'relaunch-verification-receipt.json'), receipt);
  console.log(`PASS ${SPEC_ID} state=${receipt.state}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0C_RELAUNCH_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
