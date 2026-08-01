import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './lib.mjs';
const scripts=['generate-phase-fixtures.mjs','verify-oracle-self-tests.mjs','verify-fractional-phase.mjs','verify-source-contract.mjs','verify-shared-error-source.mjs','verify-zero-runtime-cpu-fallback.mjs','runtime-smoke.mjs','gate.mjs','finalize.mjs'];
for(const script of scripts){const result=spawnSync(process.execPath,[path.join(ROOT,'tools/resample-runtime-01-r3',script)],{cwd:ROOT,stdio:'inherit'});if(result.status!==0)process.exit(result.status??1);}
