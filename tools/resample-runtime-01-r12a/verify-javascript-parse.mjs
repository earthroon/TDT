import { spawnSync } from 'node:child_process';
import { check, sourceArtifact, seal } from './lib.mjs';
const files = [
  'electron.mjs','preload.cjs',
  'app/features/resample-runtime/r11a/main-session-authority.mjs','app/features/resample-runtime/r11a/electron-admission-controller.mjs',
  'app/features/resample-runtime/r12a/r12a-contract.mjs','app/features/resample-runtime/r12a/crypto-utils.mjs','app/features/resample-runtime/r12a/main-update-coordinator.mjs','app/features/resample-runtime/r12a/r10a-transition-admission.mjs','app/features/resample-runtime/r12a/r11a-drain-adapter.mjs','app/features/resample-runtime/r12a/update-lock.mjs','app/features/resample-runtime/r12a/update-transaction-v2.mjs','app/features/resample-runtime/r12a/update-journal-v2.mjs','app/features/resample-runtime/r12a/staged-package-orchestrator.mjs','app/features/resample-runtime/r12a/activation-controller.mjs','app/features/resample-runtime/r12a/launcher-handoff.mjs','app/features/resample-runtime/r12a/boot-recovery-controller.mjs','app/features/resample-runtime/r12a/post-activation-reattestation.mjs','app/features/resample-runtime/r12a/finalizer.mjs','app/features/resample-runtime/r12a/privacy-policy.mjs',
  'launcher/resample-runtime-r12a/read-local-pointer.mjs','launcher/resample-runtime-r12a/verify-relaunch-request.mjs','launcher/resample-runtime-r12a/verify-package-closure.mjs','launcher/resample-runtime-r12a/launch-target.mjs','launcher/resample-runtime-r12a/write-launch-ack.mjs','launcher/resample-runtime-r12a/index.mjs'
];
const results = files.map((file) => { const run = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' }); check(run.status === 0, 'E_R12A_FINAL_RECEIPT_INCOMPLETE', `JavaScript parse failed: ${file}`, run.stderr); return { file, pass: true }; });
sourceArtifact('R12A_JAVASCRIPT_PARSE_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R12A', pass: true, files: results }));
console.log(`R12A JavaScript parse PASS ${results.length}/${results.length}`);
