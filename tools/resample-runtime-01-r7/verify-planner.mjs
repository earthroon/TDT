import {buildCanonicalEwaStagePlanR7,EWA_STAGE_PLANNER_R7_ID,EWA_STAGE_PLANNER_R7_PROFILE_ID,verifyR7StageAgainstPlan} from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner_v2.mjs';
import {report,capture,check} from './lib.mjs';
const base={sourceWidth:257,sourceHeight:129,targetWidth:73,targetHeight:37,parameters:{sigmaMain:1.25,sigmaCross:0.65,shrinkClamp:2.5,maxAnisotropy:3,kernelSharpness:1.65,kernelTaperExponent:1}};
const a=await buildCanonicalEwaStagePlanR7(base);const b=await buildCanonicalEwaStagePlanR7({...base,role:'export',parameters:{...base.parameters,detailMix:0.75},outputFormat:'png',jobId:'other',readback:true});
const c=await buildCanonicalEwaStagePlanR7({...base,parameters:{...base.parameters,kernelSharpness:2.2}});
const checks=[
 capture('planner-id',()=>check(a.plannerId===EWA_STAGE_PLANNER_R7_ID,'E_R7_PLANNER_ID','Planner ID mismatch')),
 capture('profile-id',()=>check(a.profileId===EWA_STAGE_PLANNER_R7_PROFILE_ID,'E_R7_PROFILE_ID','Profile ID mismatch')),
 capture('role-neutral',()=>check(a.planDigest===b.planDigest,'E_R7_PLAN_ROLE_SENSITIVITY','Role/residual/finalization changed plan digest',{a:a.planDigest,b:b.planDigest})),
 capture('kernel-sensitive',()=>check(a.planDigest!==c.planDigest,'E_R7_PLAN_KERNEL_INSENSITIVE','Kernel change did not change plan digest')),
 capture('exact-target',()=>{const last=a.stages.at(-1);check(last.outputWidth===base.targetWidth&&last.outputHeight===base.targetHeight,'E_R7_PLAN_TARGET_MISMATCH','Plan target mismatch');}),
 capture('support',()=>{for(const s of a.stages)verifyR7StageAgainstPlan(s,base.parameters);}),
 capture('legacy-reject',async()=>{let ok=false;try{await buildCanonicalEwaStagePlanR7({...base,profileId:'export-ewa-7x7-v1'});}catch(e){ok=e.code==='E_R7_LEGACY_PROFILE_REJECTED';}check(ok,'E_R7_LEGACY_PROFILE_NOT_REJECTED','Strict R7 planner accepted legacy Export profile');}),
];
for(let i=0;i<checks.length;i++)if(checks[i].value instanceof Promise){try{await checks[i].value;checks[i].value=true;}catch(e){checks[i]={id:checks[i].id,pass:false,errorCode:e.code,message:e.message};}}
report('TDT_RESAMPLE_RUNTIME_01_R7_PLANNER_REPORT.json',checks,{planDigest:a.planDigest,stageCount:a.stageCount});if(checks.some(x=>!x.pass))process.exit(1);
