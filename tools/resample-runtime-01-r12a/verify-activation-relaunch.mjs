import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createActivationIntentV2, commitLocalActivationPointer } from '../../app/features/resample-runtime/r12a/activation-controller.mjs';
import { createRelaunchRequest, verifyRelaunchRequest, writeRelaunchRequest, createLaunchAck } from '../../app/features/resample-runtime/r12a/launcher-handoff.mjs';
import { readLocalPointer } from '../../app/features/resample-runtime/r12/local-activation-pointer.mjs';
import { check, sourceArtifact, seal } from './lib.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r12a-activation-'));
try {
  const pointerPath = path.join(root, 'local-pointer.json'); const requestPath = path.join(root, 'relaunch.json');
  const intent = createActivationIntentV2({ updateTransactionId: 'ab'.repeat(24), r10aFinalReleaseDigest: '1'.repeat(64), r11aSourceSessionDigest: '2'.repeat(64), packageClosureDigest: '3'.repeat(64), stagedCanaryDigest: '4'.repeat(64), drainReceiptDigest: '5'.repeat(64), expectedProductionPointerGeneration: 7, expectedProductionPointerRawSha256: '6'.repeat(64), expectedLocalPointerGeneration: 0, expectedLocalPointerRawSha256: null, targetBuildId: 'target-build', targetPackageContentId: 'target-package', installGeneration: 1 });
  const cas = commitLocalActivationPointer({ pointerPath, intent, currentProduction: { generation: 7, rawSha256: '6'.repeat(64) } });
  const after = readLocalPointer(pointerPath);
  const request = createRelaunchRequest({ updateTransactionId: intent.updateTransactionId, sourcePid: 123, sourceProcessStartIdentity: '123:start', expectedLocalPointerGeneration: after.pointer.generation, expectedLocalPointerRawSha256: after.rawSha256, targetBuildId: intent.targetBuildId, targetPackageContentId: intent.targetPackageContentId, installGeneration: 1, launchNonce: 'cd'.repeat(24) });
  writeRelaunchRequest(requestPath, request);
  check(verifyRelaunchRequest(request, after) === true, 'E_R12A_LAUNCHER_HANDOFF_FAILED', 'relaunch request verification failed');
  const ack = createLaunchAck({ updateTransactionId: intent.updateTransactionId, launchNonce: request.launchNonce, targetPid: 456, targetProcessStartIdentity: '456:start', targetBuildId: intent.targetBuildId, targetPackageContentId: intent.targetPackageContentId, startedHidden: true });
  sourceArtifact('R12A_ACTIVATION_RELAUNCH_SELF_TEST.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, activationIntentDigest: intent.intentSha256, localPointerCasReceipt: cas, relaunchRequestDigest: request.requestSha256, launchAckDigest: ack.ackSha256, localActivationPointerCasCount: 1, productionPointerMutated: false, devServerFallbackAllowed: false, sourcePackageFallbackAllowed: false }));
  console.log('R12A activation relaunch PASS');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
