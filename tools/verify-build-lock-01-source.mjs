import { spawnSync } from 'node:child_process';
const scripts = [
  'tools/generate-runtime-worker-manifest.mjs',
  'tools/generate-runtime-manifest.mjs',
  'tools/verify-r7-export-truth.mjs',
  ...['01','02','03','04','05','06','07'].map((id)=>`tools/gate-export-worker-${id}.mjs`),
  'tools/gate-export-promotion-01.mjs',
  'tools/gate-export-promotion-02.mjs',
  'tools/gate-export-promotion-03.mjs',
  'tools/verify-stable-error-codes.mjs',
  'tools/verify-ts-syntax.mjs',
  'tools/verify-promotion-pointer.mjs',
  'tools/verify-ew05-jxl-structure-runtime.mjs',
  'tools/verify-ew06-jpeg-structure-runtime.mjs',
  'tools/verify-ew07-psd-worker-closure-runtime.mjs',
  'tools/verify-ep03-source-runtime.mjs',
  'tools/verify-build-lock-01-runtime.mjs',
  'tools/gate-build-lock-01.mjs'
];
for (const script of scripts) {
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('PASS_TDT_BUILD_LOCK_01_SOURCE_BAKE_UNPROMOTED');
