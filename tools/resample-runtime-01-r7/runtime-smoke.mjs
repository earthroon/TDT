import {buildCanonicalEwaStagePlanR7} from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner_v2.mjs';
import {normalizeExportResidualR7} from '../../app/legacy-runtime/modules/dk_resample/export_residual_runtime_r7.mjs';
import {writeArtifact} from './lib.mjs';
const params={sigmaMain:1.25,sigmaCross:0.65,shrinkClamp:2.5,maxAnisotropy:3,kernelSharpness:1.65,kernelTaperExponent:1};
const preview=await buildCanonicalEwaStagePlanR7({sourceWidth:513,sourceHeight:257,targetWidth:121,targetHeight:73,parameters:params,role:'preview'});
const exp=await buildCanonicalEwaStagePlanR7({sourceWidth:513,sourceHeight:257,targetWidth:121,targetHeight:73,parameters:{...params,detailMix:0.7},role:'export',readback:true});
const residualDisabled=normalizeExportResidualR7({detailMix:0});const residualEnabled=normalizeExportResidualR7({detailMix:0.32});
const pass=preview.planDigest===exp.planDigest&&preview.stageCount===exp.stageCount&&residualDisabled.detailMix===0&&residualEnabled.detailMix>0;
writeArtifact('TDT_RESAMPLE_RUNTIME_01_R7_MOCK_RUNTIME_REPORT.json',{schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R7',pass,previewPlanDigest:preview.planDigest,exportPlanDigest:exp.planDigest,stageCount:preview.stageCount,traceOrder:['upload','canonical-lowpass-stage(s)','optional-residual','finalization','terminal-readback'],intermediateReadbackCount:0,residualExecutionLimit:1});if(!pass)process.exit(1);
