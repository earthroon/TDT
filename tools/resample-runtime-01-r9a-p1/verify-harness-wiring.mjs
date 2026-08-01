import {capture,check,read,sourceArtifact,seal} from './lib.mjs';
const tests=[
 capture('R9AP1-ELECTRON-COORDINATOR',()=>check(read('electron.mjs').includes('createPhysicalRunCoordinatorR9AP1'),'E_R9AP1_HARNESS','coordinator import missing')),
 capture('R9AP1-HIDDEN-WINDOW',()=>{const s=read('electron.mjs');check(/createR9AP1PhysicalWindow[\s\S]*show: false/.test(s),'E_R9AP1_HARNESS','qualification window is not hidden');return true;}),
 capture('R9AP1-PHYSICAL-BRANCH-FIRST',()=>{const s=read('electron.mjs');check(s.indexOf('DADUM_R9A_P1_PHYSICAL_MODE')<s.indexOf('DADUM_R9_PHYSICAL_MODE'),'E_R9AP1_HARNESS','P1 physical branch order wrong');return true;}),
 capture('R9AP1-PRELOAD-NARROW',()=>{const s=read('preload.cjs');for(const method of ['context','write','memory','complete','fail'])check(s.includes(`${method}:`),'E_R9AP1_HARNESS','preload method missing',{method});check(!/r9aP1Physical[\s\S]{0,800}packageRoot/.test(s),'E_R9AP1_HARNESS','package path leaked');return true;}),
 capture('R9AP1-VITE-ENTRY',()=>check(read('vite.config.ts').includes('physical-r9a-p1/index.html'),'E_R9AP1_HARNESS','Vite entry missing')),
 capture('R9AP1-RUN-LOCK',()=>{const s=read('app/electron/resample-runtime-r9a-p1/run-lock.mjs');check(s.includes('exclusive:true')&&s.includes('R9AP1_ACTIVE_RUN_LOCK.json'),'E_R9AP1_HARNESS','exclusive run lock missing');return true;}),
 capture('R9AP1-CHALLENGE-HMAC',()=>{const s=read('app/electron/resample-runtime-r9a-p1/challenge-authority.mjs');check(s.includes('createHmac')&&s.includes('windowId')&&s.includes('rendererPid'),'E_R9AP1_HARNESS','challenge authority incomplete');return true;}),
 capture('R9AP1-ARTIFACT-ATOMIC',()=>{const s=read('app/electron/resample-runtime-r9a-p1/artifact-publisher.mjs');check(s.includes('atomicWrite')&&s.includes('ARTIFACT_MANIFEST'),'E_R9AP1_HARNESS','artifact publication not atomic');return true;}),
 capture('R9AP1-NETWORK-DISABLED-FILE-ONLY',()=>{const s=read('electron.mjs');check(s.includes("url.protocol !== 'file:'")&&s.includes('onBeforeRequest')&&s.includes('loadFile('),'E_R9AP1_HARNESS','file-only network policy missing');return true;}),
 capture('R9AP1-BUILD-LOCK-FINAL-REQUIRED',()=>{const s=read('app/electron/resample-runtime-r9a-p1/physical-run-coordinator.mjs');check(s.includes('E_BUILD_LOCK_R2_WIN32_RECEIPT_MISSING')&&s.includes('productionBuildAdmitted'),'E_R9AP1_HARNESS','Build Lock R2 final not required');return true;}),
];
const failCount=tests.filter(x=>x.status==='FAIL').length;sourceArtifact('R9AP1_HARNESS_WIRING_REPORT.json',seal({schemaVersion:1,passCount:tests.length-failCount,failCount,tests}));check(failCount===0,'E_R9AP1_HARNESS','harness wiring failed',{tests});console.log('R9A-P1 harness wiring PASS '+tests.length+'/'+tests.length);
