import { spawnSync } from 'node:child_process';
const scripts = ['verify-source-contract.mjs','audit-surface-call-sites.mjs','run-surface-runtime-smoke.mjs','gate-surface-lifecycle-01.mjs'];
for (const script of scripts) {
  const result = spawnSync(process.execPath, [new URL(script, import.meta.url).pathname], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
