import {spawnSync} from 'node:child_process';import {ROOT,check,sourceArtifact,seal} from './lib.mjs';
const r=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','verify:resample-runtime-01-r11','--silent'],{cwd:ROOT,encoding:'utf8',maxBuffer:32*1024*1024});
check(r.status===0,'E_R12_PREDECESSOR_NOT_QUALIFIED','R11 predecessor regression failed',{stdout:r.stdout,stderr:r.stderr,status:r.status});
check(/148 SOURCE PASS \/ 228 INSTALLED PENDING \/ 0 FAIL/.test(r.stdout+r.stderr),'E_R12_PREDECESSOR_NOT_QUALIFIED','R11 predecessor summary missing');
sourceArtifact('R12_PREDECESSOR_REGRESSION_REPORT.json',seal({schemaVersion:1,schemaId:'tdt.resample-runtime.r12.predecessor-regression.v1',command:'npm run verify:resample-runtime-01-r11 --silent',exitCode:r.status,summary:'R11 148 SOURCE PASS / 228 INSTALLED PENDING / 0 FAIL',includesR1AThroughR10:true,pass:true}));
console.log('PASS R12 isolated R11 predecessor source regression including R1A-R10 1/1');
