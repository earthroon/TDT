import {spawnSync} from 'node:child_process';
const scripts=['tools/spectral-qmap-02/verify-source-contract.mjs','tools/spectral-qmap-02/verify-wgsl-contract.mjs','tools/spectral-qmap-02/runtime-smoke.mjs','tools/spectral-qmap-02/gate.mjs'];for(const script of scripts){const r=spawnSync(process.execPath,[script],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);}
