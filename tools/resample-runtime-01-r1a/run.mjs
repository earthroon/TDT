import { spawnSync } from 'node:child_process';
for(const script of ['verify-source-contract.mjs','audit-calls.mjs','runtime-smoke.mjs','gate.mjs','finalize.mjs']){const r=spawnSync(process.execPath,[new URL(script,import.meta.url).pathname],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);}
