import { spawnSync } from 'node:child_process';

const scripts = [
  'tools/generate-runtime-manifest.mjs',
  'tools/verify-index-entry.mjs',
  'tools/verify-pinia-serializable.mjs',
  'tools/verify-runtime-ownership.mjs',
  'tools/verify-legacy-manifest.mjs',
  'tools/verify-legacy-global-ownership.mjs',
  'tools/verify-async-global-reservation.mjs',
  'tools/verify-deferred-global-attribution.mjs',
  'tools/verify-placeholder-quarantine.mjs',
  'tools/verify-diagnostic-single-emission.mjs',
  'tools/verify-boot-determinism.mjs',
  'tools/verify-ts-syntax.mjs',
  'tools/verify-stable-error-codes.mjs',
  'tools/verify-r7-export-truth.mjs',
  'tools/gate-export-worker-01.mjs',
  'tools/gate-export-worker-02.mjs',
  'tools/gate-export-worker-03.mjs',
  'tools/gate-export-worker-04.mjs',
  'tools/gate-export-worker-05.mjs',
  'tools/verify-ew05-jxl-structure-runtime.mjs',
  'tools/verify-ew06-jpeg-structure-runtime.mjs',
  'tools/gate-export-worker-06.mjs'
];

for (const script of scripts) {
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('PASS_TDT_EXPORT_WORKER_06_SOURCE_BAKE_UNPROMOTED');
