import { drainR11ARuntime, assertZeroCounts } from '../../app/features/resample-runtime/r12a/r11a-drain-adapter.mjs';
import { check, sourceArtifact, seal } from './lib.mjs';
let blocked = false; let revoked = false; let savesAborted = false; let hidden = false;
const controller = {
  blockNewAdmissions(reason) { blocked = Boolean(reason); },
  drainAllSessions(reason) { revoked = Boolean(reason); },
  abortAllSaveSessions() { savesAborted = true; return 1; },
  runtimeSnapshot() { return { activeNormalSessions: 0, openPreviewGrants: 0, openExportGrants: 0, openSaveSessions: 0 }; },
};
const win = { isDestroyed: () => false, isVisible: () => !hidden, hide: () => { hidden = true; } };
const receipt = await drainR11ARuntime({ r11aController: controller, windows: [win], updateTransactionId: 'ab'.repeat(24), deadlineMs: 30000, notifyRenderer: async () => true, awaitRendererAcks: async () => ({ acknowledged: true, missing: [] }), runtimeCounts: async () => ({ activeNormalSessions: 0, openPreviewGrants: 0, openExportGrants: 0, openSaveSessions: 0, pendingEncoderJobs: 0, pendingWorkerRpc: 0, pinnedFinalSurfaces: 0, unsettledSubmissionTickets: 0, visibleNormalWindows: 0 }), now: (() => { let value = 1000; return () => value++; })() });
check(blocked && revoked && savesAborted && hidden && receipt.pass === true, 'E_R12A_DRAIN_TIMEOUT', 'session drain did not close all live authority');
assertZeroCounts(receipt.counts);
sourceArtifact('R12A_SESSION_DRAIN_SELF_TEST.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, admissionBlockedBeforeDrain: blocked, rendererAckRequired: true, sessionsRevoked: revoked, saveSessionsAborted: savesAborted, windowsHidden: hidden, deadlineMs: 30000, receipt }));
console.log('R12A session drain PASS');
