import { spawnSync } from 'node:child_process';
const scripts=['generate-consumer-manifest.mjs','scan-direct-gpu-authority.mjs','scan-pipeline-ownership.mjs','verify-gpu-boot-order.mjs','verify-gpu-authority-source.mjs','run-gpu-authority-contract-smoke.mjs','run-gpu-authority-runtime-smoke.mjs','gate-gpu-device-ssot-01.mjs','finalize-gpu-device-ssot-01.mjs'];
for(const script of scripts){const r=spawnSync(process.execPath,[new URL(script,import.meta.url).pathname],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);}
