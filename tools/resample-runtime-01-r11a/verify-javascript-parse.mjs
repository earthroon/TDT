import { spawnSync } from 'node:child_process';
import { check, sourceArtifact, seal } from './lib.mjs';
const files = [
  'electron.mjs',
  'preload.cjs',
  'app/features/resample-runtime/r11a/r11a-contract.mjs',
  'app/features/resample-runtime/r11a/crypto-utils.mjs',
  'app/features/resample-runtime/r11a/installed-release-admission.mjs',
  'app/features/resample-runtime/r11a/quarantine-ledger.mjs',
  'app/features/resample-runtime/r11a/main-session-authority.mjs',
  'app/features/resample-runtime/r11a/electron-admission-controller.mjs',
];
const results = files.map((file) => { const run = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' }); check(run.status === 0, 'E_R11A_JAVASCRIPT_PARSE_FAILED', `JavaScript parse failed: ${file}`, run.stderr); return { file, pass: true }; });
sourceArtifact('R11A_JAVASCRIPT_PARSE_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A', pass: true, files: results }));
console.log(`R11A JavaScript parse PASS ${results.length}/${results.length}`);
