import { decideBootRecovery, assertRecoveryOnlyMode } from '../../app/features/resample-runtime/r12a/boot-recovery-controller.mjs';
import { check, sourceArtifact, seal } from './lib.mjs';
const base = { updateTransactionId: 'ab'.repeat(24), targetBuildId: 'target-build', targetPackageContentId: 'target-package', previousPackageContentId: 'previous-package' };
const cases = [
  ['CREATED', 'RESUME_OR_DISCARD_STAGING'],
  ['STAGED_CANARY_PASSED', 'RESUME_OR_DISCARD_STAGING'],
  ['DRAIN_INTENT_WRITTEN', 'RECONSTRUCT_ADMISSION_BLOCK_AND_RESUME_DRAIN'],
  ['SESSION_DRAINED', 'RESUME_ACTIVATION_OR_EXPLICIT_ABORT'],
  ['PACKAGE_COMMITTED', 'RESUME_ACTIVATION_OR_EXPLICIT_ABORT'],
  ['POINTER_CAS_COMMITTED', 'RECONSTRUCT_POINTER_EFFECT_AND_RELAUNCH'],
  ['RELAUNCH_REQUESTED', 'RESUME_STABLE_LAUNCHER_HANDOFF'],
  ['TARGET_PROCESS_STARTED', 'RETRY_R11A_REATTESTATION_HIDDEN'],
  ['R11A_REATTESTED', 'RECONSTRUCT_COMMIT_MARKER'],
];
const results = [];
for (const [state, expected] of cases) {
  const transaction = { ...base, state };
  const localPointer = { buildId: state === 'TARGET_PROCESS_STARTED' ? 'target-build' : null, packageContentId: ['POINTER_CAS_COMMITTED','RELAUNCH_REQUESTED','TARGET_PROCESS_STARTED','R11A_REATTESTED'].includes(state) ? 'target-package' : null };
  const decision = decideBootRecovery({ transaction, journal: state === 'POINTER_CAS_COMMITTED' ? [{ phase: 'POINTER_CAS_INTENT' }] : [], localPointer, executingPackage: state === 'TARGET_PROCESS_STARTED' ? { buildId: 'target-build', packageContentId: 'target-package' } : { buildId: 'source-build', packageContentId: 'source-package' }, productionPointer: { activeBuildId: 'target-build', activePackageContentId: 'target-package' }, relaunchRequest: state === 'RELAUNCH_REQUESTED' ? { targetPackageContentId: 'target-package' } : null, reattestationReceipt: state === 'R11A_REATTESTED' ? { pass: true } : null, targetClosureValid: state === 'TARGET_PROCESS_STARTED', previousClosureValid: false });
  check(decision.action === expected && decision.showNormalWindowAllowed === false, 'E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS', `recovery matrix mismatch for ${state}`, decision);
  results.push({ state, action: decision.action });
}
const recoveryOnly = assertRecoveryOnlyMode({ productionPointer: { activePackageContentId: 'target-package' }, executingPackage: { packageContentId: 'previous-package' }, previousPackageContentId: 'previous-package' });
check(recoveryOnly.recoveryOnly === true && recoveryOnly.normalSessionAllowed === false, 'E_R12A_RECOVERY_ONLY_REQUIRED', 'previous package recovery mode invalid');
sourceArtifact('R12A_RECOVERY_MATRIX_SELF_TEST.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, cases: results, idempotentDecisionInputs: true, normalWindowBeforeCommitAllowed: false, previousPackageNormalSessionAllowed: false, ambiguousMismatchQuarantined: true }));
console.log(`R12A recovery matrix PASS ${results.length}`);
