import { check, read, sourceArtifact, seal } from './lib.mjs';
import { COORDINATOR_STATES, TRANSACTION_STATES, IDS } from '../../app/features/resample-runtime/r12a/r12a-contract.mjs';
const requiredFiles = [
  'r12a-contract.mjs','main-update-coordinator.mjs','r10a-transition-admission.mjs','r11a-drain-adapter.mjs','update-lock.mjs','update-transaction-v2.mjs','update-journal-v2.mjs','staged-package-orchestrator.mjs','activation-controller.mjs','launcher-handoff.mjs','boot-recovery-controller.mjs','post-activation-reattestation.mjs','finalizer.mjs','privacy-policy.mjs'
].map((name) => `app/features/resample-runtime/r12a/${name}`);
for (const file of requiredFiles) check(read(file).length > 100, 'E_R12A_TRANSACTION_INVALID', `R12A authority file missing or empty: ${file}`);
check(COORDINATOR_STATES.length === 15 && COORDINATOR_STATES[0] === 'BOOT_RECOVERY_PREFLIGHT' && COORDINATOR_STATES.at(-1) === 'QUARANTINED', 'E_R12A_TRANSACTION_INVALID', 'coordinator state model invalid');
check(TRANSACTION_STATES.length === 16 && TRANSACTION_STATES[0] === 'CREATED' && TRANSACTION_STATES.at(-1) === 'COMMITTED', 'E_R12A_TRANSACTION_INVALID', 'transaction v2 state model invalid');
const coordinator = read('app/features/resample-runtime/r12a/main-update-coordinator.mjs');
check(coordinator.includes('bootRecoveryPreflight') && coordinator.includes("ipcMain.handle('dadum:r12a-status'") && coordinator.includes('canShowNormalWindow'), 'E_R12A_TRANSACTION_INVALID', 'main coordinator authority incomplete');
check(!coordinator.includes('writeProductionPointer') && !coordinator.includes('casProductionPointer'), 'E_R12A_PRODUCTION_POINTER_WRITE_ATTEMPT', 'R12A imports Production Pointer writer authority');
sourceArtifact('R12A_AUTHORITY_AND_STATE_MODEL_RECEIPT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, authorityId: IDS.coordinator, persistentSsot: ['transaction-v2','journal-v2','local-activation-pointer'], liveSsot: 'Electron-main-R12A-coordinator', sessionSsot: 'R11A-main-HMAC-authority', releaseSsot: 'R10A-production-pointer-read-only', launchSsot: 'stable-launcher-handoff', coordinatorStates: COORDINATOR_STATES, transactionStates: TRANSACTION_STATES, rendererPointerWriteAllowed: false, rendererJournalWriteAllowed: false, hotPatchAuthority: false, deltaPatchAuthority: false }));
console.log('R12A authority and state model PASS');
