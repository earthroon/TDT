import {beginR7Convergence,appendR7LowpassStage,finalizeR7LowpassReceipt} from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_convergence_receipt_r7.mjs';
import {buildCanonicalEwaStagePlanR7} from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner_v2.mjs';
import {report,capture,check} from './lib.mjs';
const parameters={sigmaMain:1.25,sigmaCross:0.65,shrinkClamp:2.5,maxAnisotropy:3,kernelSharpness:1.65,kernelTaperExponent:1};
const plan=await buildCanonicalEwaStagePlanR7({sourceWidth:64,sourceHeight:64,targetWidth:16,targetHeight:16,parameters});
async function make(role){const c=beginR7Convergence(plan,role);for(const s of plan.stages)appendR7LowpassStage(c,{stageIndex:s.stageIndex,stageCount:s.stageCount,sourceWidth:s.sourceWidth,sourceHeight:s.sourceHeight,outputWidth:s.outputWidth,outputHeight:s.outputHeight,outputFormat:'rgba16float',residualApplied:false,finalizationApplied:false});return await finalizeR7LowpassReceipt(c,{consumerEnvelope:role});}
const preview=await make('preview'),exp=await make('export');
const checks=[
 capture('canonical-digest-equal',()=>check(preview.receiptDigest===exp.receiptDigest,'E_R7_CONVERGENCE_DIGEST_DIVERGED','Preview and Export canonical receipts diverged')),
 capture('stage-pure',()=>check(preview.stages.every(s=>s.outputFormat==='rgba16float'&&!s.residualApplied&&!s.finalizationApplied),'E_R7_STAGE_RECEIPT_CONTAMINATED','Lowpass stage receipt contains residual/finalization')),
 capture('ids-present',()=>check(preview.plannerId&&preview.kernelId&&preview.parameterAbiId&&preview.axialFieldSchemaId,'E_R7_RECEIPT_IDENTITY_MISSING','Canonical identities missing')),
 capture('role-outside-digest',()=>check(preview.consumerEnvelope!==exp.consumerEnvelope,'E_R7_ENVELOPE_TEST_INVALID','Consumer envelopes not distinct')),
];
report('TDT_RESAMPLE_RUNTIME_01_R7_CONVERGENCE_REPORT.json',checks,{previewDigest:preview.receiptDigest,exportDigest:exp.receiptDigest});if(checks.some(x=>!x.pass))process.exit(1);
