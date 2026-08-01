import { spawnSync } from 'node:child_process';
const scripts = ['verify-source-contract.mjs','audit-visible-canvas.mjs','run-preview-runtime-smoke.mjs','gate-preview-presenter-01.mjs','finalize-preview-presenter-01-source-bake.mjs'];
for (const script of scripts) {
  const result = spawnSync(process.execPath, [new URL(script, import.meta.url).pathname], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
