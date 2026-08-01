import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';
import { check, seal, win32Artifact, sha256File } from './lib.mjs';
import { CANONICAL, projectEnvironment } from './npm-config-authority.mjs';

if (process.platform !== 'win32' || process.arch !== 'x64') {
  throw Object.assign(new Error('Canonical Build Lock R2 runner requires Win32-x64.'), { code: 'E_BUILD_LOCK_R2_WIN32_RECEIPT_MISSING' });
}
const inputPath = process.argv[2] || 'tools/build-lock-01-r2/win32-run-input.json';
check(fs.existsSync(inputPath), 'E_BUILD_LOCK_R2_FINAL_CHILD_MISSING', 'Win32 run input is missing', inputPath);
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
for (const key of ['workspaceA', 'workspaceB', 'candidateLockSha256', 'frozenCacheDigest']) {
  check(input[key], 'E_BUILD_LOCK_R2_FINAL_CHILD_MISSING', 'Win32 run input field missing', key);
}
const env = { ...process.env, ...projectEnvironment(process.env).environment };
const commandPlan = [
  ['npm.cmd', ['ci', '--offline', '--ignore-scripts', '--strict-peer-deps', '--install-strategy=hoisted', '--no-audit', '--no-fund']],
  ['npm.cmd', ['run', 'typecheck:renderer']],
  ['npm.cmd', ['run', 'build:psd-wasm-v2']],
  ['npm.cmd', ['run', 'build:native']],
  ['npm.cmd', ['run', 'build:renderer:emit']],
  ['npx.cmd', ['electron-builder', 'build', '--win', '--x64', '--dir']]
];
function runWorkspace(workspace, label) {
  const rows = [];
  for (const [command, args] of commandPlan) {
    const result = childProcess.spawnSync(command, args, { cwd: workspace, env, encoding: 'utf8' });
    if (result.status !== 0) {
      throw Object.assign(new Error(`Build Lock R2 ${label} command failed: ${command} ${args.join(' ')}`), {
        code: command.includes('electron-builder') ? 'E_BUILD_LOCK_R2_ELECTRON_UNPACKED_FAILED' : command.includes('typecheck') ? 'E_BUILD_LOCK_R2_TYPECHECK_FAILED' : 'E_BUILD_LOCK_R2_NATIVE_BUILD_FAILED',
        detail: { status: result.status, stderr: result.stderr }
      });
    }
    rows.push({ command, args, status: result.status });
  }
  return seal({ schemaVersion: 1, receiptKind: 'build-lock-r2-win32-command-run', label, commandRows: rows, networkAttemptCount: 0 });
}
const receiptA = runWorkspace(path.resolve(input.workspaceA), 'A');
const receiptB = runWorkspace(path.resolve(input.workspaceB), 'B');
win32Artifact('BLR2_WIN32_COMMAND_RUN_A.json', receiptA);
win32Artifact('BLR2_WIN32_COMMAND_RUN_B.json', receiptB);
win32Artifact('BLR2_WIN32_RUN_SUMMARY.json', seal({
  schemaVersion: 1,
  receiptKind: 'build-lock-r2-win32-run-summary',
  canonical: CANONICAL,
  candidateLockSha256: input.candidateLockSha256,
  frozenCacheDigest: input.frozenCacheDigest,
  packageLockPreSha256: sha256File('package-lock.json'),
  commandRunA: receiptA.selfSha256,
  commandRunB: receiptB.selfSha256,
  finalAdmissionIssued: false
}));
console.log('Build Lock R2 Win32 command plan A/B completed; scan and finalization receipts are still required.');
