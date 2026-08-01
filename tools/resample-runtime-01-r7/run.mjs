import {spawnSync} from 'node:child_process';
const scripts=['generate-fixtures.mjs','verify-parent.mjs','verify-planner.mjs','verify-runtime-wiring.mjs','verify-residual-separation.mjs','verify-receipts.mjs','verify-active-graph.mjs','verify-predecessor-regression.mjs','runtime-smoke.mjs','gate.mjs','finalize.mjs'];
for(const script of scripts){const r=spawnSync(process.execPath,[new URL(script,import.meta.url).pathname],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);}
