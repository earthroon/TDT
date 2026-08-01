import fs from 'node:fs';import path from 'node:path';import {ROOT,check,writeJson,ensure} from './lib.mjs';
if(process.platform!=='win32'){const e=new Error('R12 installed update execution requires packaged Windows');e.code='E_R12_R10_RELEASE_MISSING';throw e;}
for(const key of ['DADUM_R12_INSTALL_ROOT','DADUM_R12_R10_FINAL_RECEIPT','DADUM_R12_R11_ACTIVE_RECEIPT','DADUM_R12_TARGET_PACKAGE_ROOT','DADUM_R12_RUN_ID'])check(process.env[key],'E_R12_R10_RELEASE_MISSING',`missing ${key}`);
check(process.env.DADUM_R12_PACKAGED_EXECUTION==='1','E_R12_R10_RELEASE_MISSING','packaged execution marker required');
const out=ensure(path.join(ROOT,'artifacts/resample-runtime-01-r12/installed',process.env.DADUM_R12_RUN_ID));
writeJson(path.join(out,'R12_INSTALLED_EXECUTION_STARTED.json'),{schemaVersion:1,runId:process.env.DADUM_R12_RUN_ID,status:'STARTED',platform:process.platform,productionPointerMutated:false});
console.log('R12 packaged Windows installed update execution admitted; external launcher must invoke update-agent and persist child evidence.');
