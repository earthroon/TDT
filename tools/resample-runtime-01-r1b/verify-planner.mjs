import { buildEwaStagePlan, EWA_STAGE_COUNT_LIMIT } from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner.mjs';
import { check, writeJson } from './lib.mjs';
if(!globalThis.crypto) globalThis.crypto=(await import('node:crypto')).webcrypto;
const parameters={radiusMul:1.9,sigma:1.05};
const fixtures=[
  ['identity',100,100,100,100,0],['one-stage',100,100,75,75,1],['exact-half',100,100,50,50,2],
  ['odd-half',17,17,8,8,2],['deep',8192,8192,512,512,7],['non-square',8000,6000,1000,750,6],
  ['non-uniform',8192,4096,640,640,null],['one-axis',4096,2048,4096,512,null],['one-pixel',3,3,1,1,2],
];
const records=[];const checks=[];
for(const [name,sw,sh,tw,th,expected] of fixtures){
 const a=await buildEwaStagePlan({sourceWidth:sw,sourceHeight:sh,targetWidth:tw,targetHeight:th,profileId:'export-ewa-7x7-v1',parameters});
 const b=await buildEwaStagePlan({sourceWidth:sw,sourceHeight:sh,targetWidth:tw,targetHeight:th,profileId:'export-ewa-7x7-v1',parameters});
 records.push({name,stageCount:a.stageCount,outputs:a.stages.map(s=>[s.outputWidth,s.outputHeight]),digest:a.planDigest});
 checks.push(check(a.planDigest===b.planDigest,`planner-${name}-deterministic`,'deterministic digest'));
 checks.push(check(a.targetWidth===tw&&a.targetHeight===th,`planner-${name}-exact`,'exact final target'));
 checks.push(check(Object.isFrozen(a)&&Object.isFrozen(a.stages)&&a.stages.every(Object.isFrozen),`planner-${name}-frozen`,'plan frozen'));
 if(expected!=null)checks.push(check(a.stageCount===expected,`planner-${name}-count`,'stage count exact',{expected,actual:a.stageCount}));
 let cw=sw,ch=sh;for(const s of a.stages){checks.push(check(s.sourceWidth===cw&&s.sourceHeight===ch&&s.outputWidth<=cw&&s.outputHeight<=ch,`planner-${name}-monotonic-${s.stageIndex}`,'monotonic chain'));cw=s.outputWidth;ch=s.outputHeight;}
 checks.push(check(a.stageCount<=EWA_STAGE_COUNT_LIMIT,`planner-${name}-limit`,'stage limit'));
}
let upscale=false;try{await buildEwaStagePlan({sourceWidth:100,sourceHeight:100,targetWidth:101,targetHeight:100,profileId:'export-ewa-7x7-v1',parameters});}catch(e){upscale=e.code==='E_R1B_UPSCALE_NOT_ADMITTED';}
checks.push(check(upscale,'planner-upscale-reject','upscale rejected'));
const failed=checks.filter(x=>!x.pass);const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R1B',pass:failed.length===0,counts:{pass:checks.length-failed.length,fail:failed.length},checks,records};writeJson('r1b-planner-fixtures.json',report);if(failed.length){console.error(failed);process.exit(1);}console.log(`PASS R1B planner fixtures ${checks.length}/${checks.length}`);
