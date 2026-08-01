import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const artifactDir = path.join(root, 'artifacts', 'runtime');
fs.mkdirSync(artifactDir, { recursive: true });

const scripts = [
  'tools/generate-legacy-static-admission.mjs',
  'tools/generate-runtime-worker-manifest.mjs',
  'tools/generate-runtime-manifest.mjs',
  'tools/run-build-emit-01.mjs',
  'tools/verify-build-emit-01-runtime.mjs',
  'tools/gate-build-emit-01.mjs',
  'tools/verify-r7-export-truth.mjs',
  ...['01', '02', '03', '04', '05', '06', '07'].map((id) => `tools/gate-export-worker-${id}.mjs`),
  'tools/gate-export-promotion-01.mjs',
  'tools/gate-export-promotion-02.mjs',
  'tools/gate-export-promotion-03.mjs',
  'tools/verify-promotion-pointer.mjs',
  'tools/verify-ew05-jxl-structure-runtime.mjs',
  'tools/verify-ew06-jpeg-structure-runtime.mjs',
  'tools/verify-ew07-psd-worker-closure-runtime.mjs',
  'tools/verify-ep03-source-runtime.mjs',
  'tools/verify-build-lock-01-runtime.mjs',
  'tools/gate-build-lock-01.mjs',
  'tools/verify-stable-error-codes.mjs',
  'tools/verify-ts-syntax.mjs',
];

const lines = [];
for (const script of scripts) {
  const args = script === 'tools/run-build-emit-01.mjs' ? [script, '--mode=source'] : [script];
  lines.push(`RUN ${args.join(' ')}`);
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, TERM: 'dumb', NO_COLOR: '1' },
  });
  if (result.stdout) {
    process.stdout.write(result.stdout);
    lines.push(result.stdout.trimEnd());
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
    lines.push(result.stderr.trimEnd());
  }
  lines.push(`EXIT ${result.status ?? 1}`);
  if (result.status !== 0) {
    fs.writeFileSync(path.join(artifactDir, 'TDT_BUILD_EMIT_01_FINAL_VERIFY.txt'), lines.join('\n') + '\n');
    process.exit(result.status ?? 1);
  }
}
lines.push('PASS_TDT_BUILD_EMIT_01_SOURCE_BAKE_UNPROMOTED');
fs.writeFileSync(path.join(artifactDir, 'TDT_BUILD_EMIT_01_FINAL_VERIFY.txt'), lines.join('\n') + '\n');
console.log('PASS_TDT_BUILD_EMIT_01_SOURCE_BAKE_UNPROMOTED');
