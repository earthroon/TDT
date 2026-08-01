import path from 'node:path';
import { ROOT, SPEC_ID, run, writeFailure } from './lib.mjs';

const steps = [
  ['audit-input.mjs', ['--require-canonical']],
  ['run-lock-promotion.mjs', []],
  ['verify-lock-receipt.mjs', []],
  ['run-dual-emit.mjs', []],
  ['verify-emitted-identity.mjs', []],
  ['run-dual-package.mjs', []],
  ['verify-package-identity.mjs', []],
  ['launch-packaged-candidate.mjs', ['--phase=primary']],
  ['probe-runtime-health.mjs', []],
  ['run-cross-format-save-smoke.mjs', []],
  ['verify-worker-restart.mjs', []],
  ['launch-packaged-candidate.mjs', ['--phase=relaunch']],
  ['verify-relaunch.mjs', []],
  ['run-test-pointer-recovery.mjs', []],
  ['issue-baseline-receipt.mjs', []],
];

for (const [script, args] of steps) {
  const result = run(process.execPath, [path.join('tools','promotion-baseline-00',script), ...args], { cwd: ROOT, env: process.env, timeoutMs: 1_800_000, stdio: 'inherit' });
  if (result.exitCode !== 0) {
    writeFailure('P0_PIPELINE_STEP_FAILED', { script, args, exitCode: result.exitCode, signal: result.signal });
    process.exitCode = 1;
    break;
  }
}
if (!process.exitCode) console.log(`PASS ${SPEC_ID} pipeline=PACKAGED_BASELINE_VERIFIED`);
