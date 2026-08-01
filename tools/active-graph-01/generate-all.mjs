import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { projectRoot } from './lib.mjs';
for (const script of ['generate-runtime-asset-manifest.mjs', 'audit-randomness.mjs', 'generate-active-graph.mjs']) {
  const result = spawnSync(process.execPath, [path.join(path.dirname(new URL(import.meta.url).pathname), script)], { cwd: projectRoot, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
