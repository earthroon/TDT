import {buildCanonicalEwaStagePlanR7} from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner_v2.mjs';
import {writeFixture,writeArtifact} from './lib.mjs';
const dimensions=[[64,64,64,64],[128,128,64,64],[96,80,64,53],[257,129,137,73],[512,512,128,128],[1024,512,128,64],[17,9,9,5],[1,128,1,63],[129,1,65,1],[65,65,33,33]];
const parameters={sigmaMain:1.25,sigmaCross:0.65,shrinkClamp:2.5,maxAnisotropy:3,edgeLow:0.025,edgeHigh:0.22,minorCoverageFactor:0.82,coherenceExponent:1.25,kernelSharpness:1.65,kernelTaperExponent:1,tensorSigma:1.15,alphaEpsilon:1e-6};
const plans=[];for(const [sourceWidth,sourceHeight,targetWidth,targetHeight] of dimensions){plans.push(await buildCanonicalEwaStagePlanR7({sourceWidth,sourceHeight,targetWidth,targetHeight,parameters}));}
writeFixture('TDT_RESAMPLE_RUNTIME_01_R7_PLAN_FIXTURES.json',{schemaVersion:1,parameters,plans});
writeFixture('TDT_RESAMPLE_RUNTIME_01_R7_CONVERGENCE_FIXTURES.json',{schemaVersion:1,cases:dimensions.map((d,i)=>({id:`case-${i}`,dimensions:d,planDigest:plans[i].planDigest,residualModes:['disabled','enabled']}))});
writeFixture('TDT_RESAMPLE_RUNTIME_01_R7_NEGATIVE_CONTROLS.json',{schemaVersion:1,controls:['legacy-export-profile','role-in-plan-digest','residual-in-plan-digest','hardware-filtered-lowpass','legacy-export-lowpass-fetch','intermediate-residual','residual-feedback','residual-lowpass-id-collision','intermediate-readback']});
writeArtifact('TDT_RESAMPLE_RUNTIME_01_R7_FIXTURE_REPORT.json',{schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R7',pass:true,planCount:plans.length,identityPlanCount:plans.filter(p=>p.stageCount===0).length,multiStagePlanCount:plans.filter(p=>p.stageCount>1).length});
