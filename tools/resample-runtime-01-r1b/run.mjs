import { spawnSync } from 'node:child_process';
for (const script of ['verify-planner.mjs', 'verify-source-contract.mjs', 'runtime-smoke.mjs', 'gate.mjs', 'finalize.mjs']) {
  const result = spawnSync(process.execPath, [new URL(script, import.meta.url).pathname], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
