import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTransactionV2, transitionTransactionV2 } from '../../app/features/resample-runtime/r12a/update-transaction-v2.mjs';
import { appendJournalV2 } from '../../app/features/resample-runtime/r12a/update-journal-v2.mjs';
import { acquireUpdateLock, evaluateStaleUpdateLock } from '../../app/features/resample-runtime/r12a/update-lock.mjs';
import { admitControlledR10ATransition } from '../../app/features/resample-runtime/r12a/r10a-transition-admission.mjs';
import { assertZeroCounts, drainR11ARuntime } from '../../app/features/resample-runtime/r12a/r11a-drain-adapter.mjs';
import { createActivationIntentV2, validateActivationIntentV2, productionPointerWriteForbidden } from '../../app/features/resample-runtime/r12a/activation-controller.mjs';
import { createRelaunchRequest, verifyRelaunchRequest } from '../../app/features/resample-runtime/r12a/launcher-handoff.mjs';
import { decideBootRecovery, assertRecoveryOnlyMode } from '../../app/features/resample-runtime/r12a/boot-recovery-controller.mjs';
import { createPostActivationReattestation, verifyTargetIdentity } from '../../app/features/resample-runtime/r12a/post-activation-reattestation.mjs';
import { assertPrivacySafeEvidence } from '../../app/features/resample-runtime/r12a/privacy-policy.mjs';
import { finalizeInstalledUpdate } from '../../app/features/resample-runtime/r12a/finalizer.mjs';
import { seal as runtimeSeal } from '../../app/features/resample-runtime/r12a/crypto-utils.mjs';
import { check, read, sourceArtifact, seal, sha256File } from './lib.mjs';

const results = [];
async function reject(id, expected, fn) {
  let code = null;
  try { await fn(); } catch (error) { code = String(error?.code || ''); }
  check(code === expected, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `${id} expected ${expected} but got ${code || 'no-error'}`);
  results.push({ id, status: 'PASS', detectedErrorCode: code });
}
function tx() { return createTransactionV2({ updateTransactionId: 'ab'.repeat(24), sourceBuildId: 'source-build', sourcePackageContentId: 'source-package', targetBuildId: 'target-build', targetPackageContentId: 'target-package', previousBuildId: 'source-build', previousPackageContentId: 'source-package', r10aFinalReleaseDigest: '1'.repeat(64), r10aLineageDigest: '2'.repeat(64), r11aSourceSessionDigest: '3'.repeat(64), expectedProductionPointerGeneration: 4, expectedProductionPointerRawSha256: '4'.repeat(64), expectedLocalPointerGeneration: 0, expectedLocalPointerRawSha256: null, installGeneration: 1, createdAt: '2026-08-01T00:00:00.000Z' }); }
const before = '1'.repeat(64); const after = '2'.repeat(64);
const release = { state: 'RESAMPLE_RUNTIME_R10A_RELEASE_REQUALIFIED_POINTER_CAS_AND_ROLLBACK_DRILL_SEALED', previousBuildId: 'source-build', previousPackageContentId: 'source-package', targetBuildId: 'target-build', targetPackageContentId: 'target-package', transition: { beforePackageContentId: 'source-package', afterPackageContentId: 'target-package', beforeGeneration: 4, afterGeneration: 5, beforeRawSha256: before, afterRawSha256: after }, receiptSha256: '3'.repeat(64) };
const lineage = { state: 'RESAMPLE_RUNTIME_R10A_CURRENT_LINEAGE_RESTORED_AWAITING_R11A', receiptSha256: '4'.repeat(64) };
const session = { active: true, quarantined: false, buildId: 'source-build', packageContentId: 'source-package', pointerGeneration: 4, pointerRawSha256: before };
const pointer = { generation: 5, activeBuildId: 'target-build', activePackageContentId: 'target-package' };
await reject('NC01_UNRELATED_POINTER_DRIFT', 'E_R12A_UNRELATED_POINTER_DRIFT', () => admitControlledR10ATransition({ finalRelease: release, lineageRestoration: lineage, sourceSession: session, currentProductionPointer: { ...pointer, generation: 6 }, currentProductionPointerRawSha256: after }));
await reject('NC02_SOURCE_PACKAGE_MISMATCH', 'E_R12A_CONTROLLED_TRANSITION_MISMATCH', () => admitControlledR10ATransition({ finalRelease: release, lineageRestoration: lineage, sourceSession: { ...session, packageContentId: 'other' }, currentProductionPointer: pointer, currentProductionPointerRawSha256: after }));
await reject('NC03_QUARANTINED_SOURCE_SESSION', 'E_R12A_SOURCE_SESSION_INVALID', () => admitControlledR10ATransition({ finalRelease: release, lineageRestoration: lineage, sourceSession: { ...session, quarantined: true }, currentProductionPointer: pointer, currentProductionPointerRawSha256: after }));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r12a-negative-'));
try {
  const lock = path.join(root, 'lock.json'); acquireUpdateLock(lock, { updateTransactionId: 'a'.repeat(48), ownerPid: 1, ownerProcessStartIdentity: 'p1', sourcePackageContentId: 'source', targetPackageContentId: 'target' });
  await reject('NC04_DOUBLE_UPDATE_LOCK', 'E_R12A_UPDATE_LOCK_HELD', () => acquireUpdateLock(lock, { updateTransactionId: 'b'.repeat(48), ownerPid: 2, ownerProcessStartIdentity: 'p2', sourcePackageContentId: 'source', targetPackageContentId: 'target' }));
  await reject('NC05_TRANSACTION_SKIP', 'E_R12A_TRANSACTION_STATE_SKIP', () => transitionTransactionV2(tx(), 'R11A_SOURCE_SESSION_ADMITTED', 'a'.repeat(64)));
  const advanced = transitionTransactionV2(tx(), 'R10A_TARGET_ADMITTED', 'a'.repeat(64));
  await reject('NC06_TRANSACTION_REWIND', 'E_R12A_TRANSACTION_STATE_REWIND', () => transitionTransactionV2(advanced, 'CREATED', 'b'.repeat(64)));
  const journal = path.join(root, 'journal.jsonl');
  await reject('NC07_JOURNAL_EFFECT_WITHOUT_INTENT', 'E_R12A_JOURNAL_INTENT_MISSING', () => appendJournalV2(journal, { updateTransactionId: 'a'.repeat(48), phase: 'POINTER_CAS', effect: true, evidenceDigest: 'c'.repeat(64) }));
  await reject('NC08_STALE_LOCK_IDENTITY_SPLIT', 'E_R12A_UPDATE_LOCK_AMBIGUOUS', () => evaluateStaleUpdateLock({ lock: JSON.parse(fs.readFileSync(lock)), ownerAlive: false, ownerProcessStartIdentity: 'other', transactionState: 'SESSION_DRAINED', journalHeadTransactionId: 'x', localPointerTransactionId: 'y' }));
} finally { fs.rmSync(root, { recursive: true, force: true }); }
await reject('NC09_ACTIVE_SESSION_REMAINS', 'E_R12A_OPEN_SESSION_REMAINS', () => assertZeroCounts({ activeNormalSessions: 1, openPreviewGrants: 0, openExportGrants: 0, openSaveSessions: 0, pendingEncoderJobs: 0, pendingWorkerRpc: 0, pinnedFinalSurfaces: 0, unsettledSubmissionTickets: 0, visibleNormalWindows: 0 }));
await reject('NC10_OPEN_GRANT_REMAINS', 'E_R12A_OPEN_GRANT_REMAINS', () => assertZeroCounts({ activeNormalSessions: 0, openPreviewGrants: 1, openExportGrants: 0, openSaveSessions: 0, pendingEncoderJobs: 0, pendingWorkerRpc: 0, pinnedFinalSurfaces: 0, unsettledSubmissionTickets: 0, visibleNormalWindows: 0 }));
await reject('NC11_OPEN_SAVE_REMAINS', 'E_R12A_OPEN_SAVE_SESSION_REMAINS', () => assertZeroCounts({ activeNormalSessions: 0, openPreviewGrants: 0, openExportGrants: 0, openSaveSessions: 1, pendingEncoderJobs: 0, pendingWorkerRpc: 0, pinnedFinalSurfaces: 0, unsettledSubmissionTickets: 0, visibleNormalWindows: 0 }));
await reject('NC12_RENDERER_ACK_MISSING', 'E_R12A_RENDERER_DRAIN_ACK_MISSING', () => drainR11ARuntime({ r11aController: { blockNewAdmissions(){}, drainAllSessions(){}, abortAllSaveSessions(){}, runtimeSnapshot(){ return {}; } }, updateTransactionId: 'a'.repeat(48), awaitRendererAcks: async () => ({ acknowledged: false, missing: [1] }) }));
const intent = createActivationIntentV2({ updateTransactionId: 'a'.repeat(48), r10aFinalReleaseDigest: '1'.repeat(64), r11aSourceSessionDigest: '2'.repeat(64), packageClosureDigest: '3'.repeat(64), stagedCanaryDigest: '4'.repeat(64), drainReceiptDigest: '5'.repeat(64), expectedProductionPointerGeneration: 5, expectedProductionPointerRawSha256: '6'.repeat(64), expectedLocalPointerGeneration: 0, expectedLocalPointerRawSha256: null, targetBuildId: 'target-build', targetPackageContentId: 'target-package', installGeneration: 1 });
await reject('NC13_STALE_ACTIVATION_INTENT', 'E_R12A_ACTIVATION_INTENT_STALE', () => validateActivationIntentV2(intent, { productionGeneration: 6, productionRawSha256: '6'.repeat(64), localGeneration: 0, localRawSha256: null }));
await reject('NC14_PRODUCTION_POINTER_WRITE', 'E_R12A_PRODUCTION_POINTER_WRITE_ATTEMPT', () => productionPointerWriteForbidden());
const request = createRelaunchRequest({ updateTransactionId: 'a'.repeat(48), sourcePid: 1, sourceProcessStartIdentity: 'p', expectedLocalPointerGeneration: 1, expectedLocalPointerRawSha256: '7'.repeat(64), targetBuildId: 'target-build', targetPackageContentId: 'target-package', installGeneration: 1, launchNonce: 'b'.repeat(48) });
await reject('NC15_RELAUNCH_NONCE_TAMPER', 'E_R12A_RELAUNCH_REQUEST_INVALID', () => verifyRelaunchRequest({ ...request, launchNonce: 'c'.repeat(48) }, { pointer: { generation: 1, buildId: 'target-build', packageContentId: 'target-package' }, rawSha256: '7'.repeat(64) }));
await reject('NC16_RELAUNCH_POINTER_MISMATCH', 'E_R12A_LAUNCHER_HANDOFF_FAILED', () => verifyRelaunchRequest(request, { pointer: { generation: 2, buildId: 'target-build', packageContentId: 'target-package' }, rawSha256: '7'.repeat(64) }));
await reject('NC17_TARGET_PACKAGE_MISMATCH', 'E_R12A_TARGET_PROCESS_IDENTITY_MISMATCH', () => verifyTargetIdentity({ executingPackage: { buildId: 'target-build', packageContentId: 'other' }, localPointer: { buildId: 'target-build', packageContentId: 'target-package' }, productionPointer: { activeBuildId: 'target-build', activePackageContentId: 'target-package' }, transaction: { targetBuildId: 'target-build', targetPackageContentId: 'target-package' }, relaunchRequest: { targetBuildId: 'target-build', targetPackageContentId: 'target-package' } }));
await reject('NC18_OLD_SESSION_REUSE', 'E_R12A_OLD_SESSION_REUSE', () => createPostActivationReattestation({ transaction: { updateTransactionId: 'a'.repeat(48), sourceSessionId: 'old', sourceSessionGeneration: 2, targetBuildId: 'target-build', targetPackageContentId: 'target-package' }, targetSession: { active: true, sessionId: 'old', generation: 3 }, targetClosureDigest: '1'.repeat(64), activeGraphDigest: '2'.repeat(64), r9aIdentityDigest: '3'.repeat(64) }));
await reject('NC19_CROSS_GENERATION_ASSET', 'E_R12A_CROSS_GENERATION_ASSET', () => createPostActivationReattestation({ transaction: { updateTransactionId: 'a'.repeat(48), sourceSessionId: 'old', sourceSessionGeneration: 2, targetBuildId: 'target-build', targetPackageContentId: 'target-package' }, targetSession: { active: true, sessionId: 'new', generation: 3 }, targetClosureDigest: '1'.repeat(64), activeGraphDigest: '2'.repeat(64), r9aIdentityDigest: '3'.repeat(64), crossGenerationAssetCount: 1 }));
await reject('NC20_AMBIGUOUS_RECOVERY', 'E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS', () => decideBootRecovery({ transaction: { ...tx(), state: 'TARGET_PROCESS_STARTED' }, journal: [], localPointer: { packageContentId: 'other' }, executingPackage: { packageContentId: 'other' }, productionPointer: { activePackageContentId: 'target-package' }, targetClosureValid: false, previousClosureValid: false }));
await reject('NC21_PREVIOUS_PACKAGE_MISMATCH', 'E_R12A_PREVIOUS_PACKAGE_NOT_RECOVERABLE', () => assertRecoveryOnlyMode({ productionPointer: { activePackageContentId: 'target-package' }, executingPackage: { packageContentId: 'other' }, previousPackageContentId: 'previous-package' }));
await reject('NC22_PRIVACY_USER_PATH', 'E_R12A_FINAL_RECEIPT_INCOMPLETE', () => assertPrivacySafeEvidence({ documentPath: 'C:/secret/file.png' }));
await reject('NC23_PRIVACY_IMAGE_BYTES', 'E_R12A_FINAL_RECEIPT_INCOMPLETE', () => assertPrivacySafeEvidence({ imageBytes: [1,2,3] }));
await reject('NC24_PRIVACY_RAW_CRASH', 'E_R12A_FINAL_RECEIPT_INCOMPLETE', () => assertPrivacySafeEvidence({ rawCrashDump: 'dump' }));
await reject('NC25_FINAL_CHILD_MISSING', 'E_R12A_FINAL_RECEIPT_INCOMPLETE', () => finalizeInstalledUpdate({ updateTransactionId: 'a'.repeat(48) }));
const fallbackRequest = runtimeSeal({ ...request, requestSha256: undefined, devServerFallbackAllowed: true }, 'requestSha256');
await reject('NC26_DEV_SERVER_FALLBACK', 'E_R12A_SILENT_RESTART_FORBIDDEN', () => verifyRelaunchRequest(fallbackRequest, { pointer: { generation: 1, buildId: 'target-build', packageContentId: 'target-package' }, rawSha256: '7'.repeat(64) }));
check(read('app/src/boot/bootstrap-renderer.ts').indexOf('runtimeUpdate.assertNormalWorkAllowed()') < read('app/src/boot/bootstrap-renderer.ts').indexOf('installedAdmission.rendererReady()'), 'E_R12A_WINDOW_SHOW_BEFORE_COMMIT', 'window show barrier order invalid'); results.push({ id: 'NC27_WINDOW_SHOW_EARLY_STATIC', status: 'PASS', detectedErrorCode: 'E_R12A_WINDOW_SHOW_BEFORE_COMMIT' });
check(!read('preload.cjs').includes('UPDATE_JOURNAL_V2') && !read('preload.cjs').includes('LOCAL_ACTIVATION_POINTER'), 'E_R12A_PRODUCTION_POINTER_WRITE_ATTEMPT', 'renderer persistence authority leaked'); results.push({ id: 'NC28_RENDERER_POINTER_BYPASS_STATIC', status: 'PASS', detectedErrorCode: 'E_R12A_PRODUCTION_POINTER_WRITE_ATTEMPT' });
check(!read('app/features/resample-runtime/r12a/main-update-coordinator.mjs').includes('request.runStagedCanary'), 'E_R12A_STAGED_CANARY_FAILED', 'renderer callback crosses IPC'); results.push({ id: 'NC29_RENDERER_CANARY_CALLBACK_STATIC', status: 'PASS', detectedErrorCode: 'E_R12A_STAGED_CANARY_FAILED' });
const parentBefore = sha256File('artifacts/resample-runtime-01-r11a/source-bake/TDT_RESAMPLE_RUNTIME_01_R11A_SOURCE_FINAL_RECEIPT.json');
check(parentBefore === '2c6a2aaf222e302fde862dda07c4d35e59d2df3d2e6d277b350657c27c63f934', 'E_R12A_PARENT_OR_LINEAGE_INVALID', 'parent receipt mutated'); results.push({ id: 'NC30_PARENT_RECEIPT_MUTATION', status: 'PASS', detectedErrorCode: 'E_R12A_PARENT_OR_LINEAGE_INVALID' });
check(results.length === 30 && results.every((item) => item.status === 'PASS'), 'E_R12A_FINAL_RECEIPT_INCOMPLETE', 'negative controls incomplete');
sourceArtifact('R12A_NEGATIVE_CONTROL_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, count: results.length, controls: results, productionPointerMutationCount: 0, localPointerMutationCount: 0, silentRestartAllowed: false, historicalReceiptMutationCount: 0 }));
console.log(`R12A negative controls PASS ${results.length}`);
