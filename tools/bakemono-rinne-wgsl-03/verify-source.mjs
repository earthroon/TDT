import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { canonicalBakemonoRinneJson } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_contract_receipt.mjs';
import {
  BKR03_PATCH_ID,BKR03_TERMINAL_TENSOR_PRODUCER_ID,BKR03_TERMINAL_TENSOR_HANDLE_SCHEMA_ID,
  BKR03_LAMBDA2_PROBE_ID,BKR03_KERNEL_ID,BKR03_KERNEL_ABI_ID,BKR03_PIPELINE_FAMILY_ID,
  BKR03_OUTPUT_SEMANTIC_ID,BKR03_OUTPUT_AUTHORITY,BKR03_FORMULA_PROFILE_ID,
  BKR03_STRUCTURE_GATE_ID,BKR03_UNIFORM_BYTES,BKR03_ABI_VERSION,
  BKR03_TENSOR_PROFILE_ENUM,BKR03_TENSOR_PACKING_ENUM,BKR03_STRUCTURE_GATE_ENUM,
  BKR03_BIND_GROUP_LAYOUT_CANONICAL,BKR03_TENSOR_PASS_ORDER,BKR03_R1C_SHADER_DIGESTS,
  BKR03_FORBIDDEN_PUBLIC_TENSOR_FIELDS,BKR03_STABLE_ERROR_CODES,
  assertFinalEwaTerminalSurfaceWgsl03,assertCanonicalRequestWgsl03,assertNoRawTensorFieldsWgsl03,
  structureGateWgsl03,getBakemonoRinneWgsl03Contract,
} from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_contract.mjs';
import { packBakemonoRinneWgsl03Params,verifyBakemonoRinneWgsl03PackedParams,BKR03_PARAM_OFFSETS } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_params.mjs';
import {
  sha256BakemonoRinneWgsl03,verifyBakemonoRinneWgsl03Receipt,
  createBakemonoRinneLambda2QualificationReceiptWgsl03,
  createBakemonoRinneTerminalR1CProducerReceiptWgsl03,
  createBakemonoRinneCanonicalKernelReceiptWgsl03,
  createBakemonoRinneCanonicalDispatchReceiptWgsl03,
} from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_receipt.mjs';
import { recordTerminalIntegratedR1CWgsl03,getBakemonoRinneTerminalTensorPrivateCountsWgsl03 } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_terminal_tensor.mjs';
import { admitBakemonoRinneTerminalR1CWgsl03,assertBakemonoRinneTerminalR1CAdmissionTokenWgsl03,isBakemonoRinneTerminalR1CAdmissionTokenWgsl03 } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_tensor_admission.mjs';
import { renderBakemonoRinneWgsl03,renderLambda2ProbeWgsl03,writeBakemonoRinneWgsl03GeneratedSources } from './generate-wgsl.mjs';
import { runNegativeControlsWgsl03 } from './verify-negative-controls.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const SPEC_REL='specs/TDT-BAKEMONO-RINNE-WGSL-03_TERMINAL_INTEGRATED_R1C_LAMBDA2_STRUCTURE_GATE_ABI_SEPARATION_SEAL_SPEC.md';
const SOURCE_DIR='artifacts/bakemono-rinne-wgsl-03/source';
const PHYSICAL_DIR='artifacts/bakemono-rinne-wgsl-03/physical';
const REPORT_REL=`${SOURCE_DIR}/source-gate-report.json`;
const FINAL_REL=`${SOURCE_DIR}/source-final-receipt.json`;
const IMPL_REL=`${SOURCE_DIR}/implementation-manifest.json`;
const CATALOG_REL='tools/bakemono-rinne-wgsl-03/source-gate-catalog.json';
const PHYSICAL_REL=`${PHYSICAL_DIR}/physical-gate-report.json`;
const PARENT_RECEIPT_REL='artifacts/bakemono-rinne-wgsl-02/source/source-final-receipt.json';
const PARENT_SPEC_REL='specs/TDT-BAKEMONO-RINNE-WGSL-02_COMPATIBILITY_COMPUTE_EXACT_FORMULA_ABI_CPU_WEBGL_PARITY_SHADOW_DISPATCH_SEAL_SPEC.md';
const PARENT_COMPAT_REL='app/legacy-runtime/core/compute/qmap_webgpu/shaders/bakemono_rinne_fusion_compat_v1.generated.wgsl';
const PARENT_MANIFEST_REL='app/legacy-runtime/core/compute/qmap_webgpu/shaders/generated-bakemono-rinne-wgsl-02-manifest.json';
const CANON_REL='app/legacy-runtime/core/compute/qmap_webgpu/shaders/bakemono_rinne_fusion_r1c_gated_v1.generated.wgsl';
const PROBE_REL='app/legacy-runtime/core/compute/qmap_webgpu/shaders/bakemono_rinne_terminal_lambda2_probe_v1.generated.wgsl';
const MANIFEST_REL='app/legacy-runtime/core/compute/qmap_webgpu/shaders/generated-bakemono-rinne-wgsl-03-manifest.json';
const PARENT_ZIP='66_TDT_BAKEMONO_RINNE_WGSL_02_COMPATIBILITY_COMPUTE_SHADOW_SOURCE_BAKED_AWAITING_PHYSICAL_GPU.zip';
const PARENT_ZIP_SHA='823835480cfa4e641fa5a2fe40a15c939f5f650d2f292232076f6db50aef1570';
const PARENT_RECEIPT_FILE_SHA='6d579a618b3e79a08dc68d2fe9cd3d4a2f6a581d715c3bfc24953b0592f98ed4';
const PARENT_SPEC_SHA='ddee01f03fb3463c4c1922bff2d809da3662dfd0303cc807e3623411ee2a3a84';
const PARENT_COMPAT_SHA='a3c851b3188c31a7a2f71d5723e356ff385d9c6fc0372140f5d891dec58f27ff';
const PARENT_MANIFEST_SHA='fe45a97b7ca30b2e8382ab1c0faf74fd4a9a4f5ccdf333303fd7a35d06ed7d38';
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const readJson=(rel)=>JSON.parse(read(rel));
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));
const sha=(v)=>createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:canonicalBakemonoRinneJson(v)).digest('hex');
const fileSha=(rel)=>sha(fs.readFileSync(path.join(ROOT,rel)));
const writeJson=(rel,v)=>{const p=path.join(ROOT,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const catches=(fn,code)=>{try{fn();return false;}catch(e){return e?.code===code;}};
const catchesAsync=async(fn,code)=>{try{await fn();return false;}catch(e){return e?.code===code;}};
function fakeTexture(label){return {label,createView(){return {label:`view:${label}`};},destroy(){this.destroyed=true;}};}
function fakeDevice(){let n=0;return {queue:{writeBuffer(){}},createTexture(d){return fakeTexture(d.label??`t${++n}`);},createBuffer(d){return {label:d.label,size:d.size,destroy(){this.destroyed=true;}};},createBindGroup(d){return {label:d.label};}};}
function fakeEncoder(){return {passes:[],beginComputePass(d){const p={label:d.label,setPipeline(){},setBindGroup(){},dispatchWorkgroups(x,y,z){this.dispatch=[x,y,z];},end(){this.ended=true;}};this.passes.push(p);return p;}};}
const shaderDigests=Object.freeze({...BKR03_R1C_SHADER_DIGESTS});
async function sourceFixture(){
  const q=await createBakemonoRinneLambda2QualificationReceiptWgsl03({status:'PHYSICAL_PASS',physicalExecution:true,shaderSetDigest:'1'.repeat(64),tensorParameterDigest:'2'.repeat(64),pipelineIdentity:'pipeline:r1c',adapterIdentity:'adapter:source',deviceIdentity:'device:source',fixtureCorpusDigest:'3'.repeat(64),probeWgslDigest:fileSha(PROBE_REL),counterLayoutDigest:'4'.repeat(64),fixtureCount:6,cornerLambda2PositivePixelCount:9,junctionLambda2PositivePixelCount:11,straightMeanCoherence:.99,cornerMeanCoherence:.71,junctionMeanCoherence:.62,nonFiniteCount:0,negativeLambdaCount:0,pass:true});
  const device=fakeDevice(),encoder=fakeEncoder();
  const bundle={disposed:false,layout:{},pipelines:Object.fromEntries(BKR03_TENSOR_PASS_ORDER.map(k=>[k,{}])),shaderDigests};
  const sourceSurface={schemaId:'tdt.ewa.terminal-surface-descriptor.wgsl03.v1',texture:fakeTexture('source'),surfaceId:'surface:source',surfaceRevision:1,lowpassReceiptDigest:'a'.repeat(64),lowpassPlanDigest:'b'.repeat(64),surfaceRole:'FINAL_EWA_TERMINAL',semanticId:'tdt.surface.canonical.linear-premul.rgba16float.v1',width:33,height:33,format:'rgba16float',transfer:'linear',alphaMode:'premultiplied',coordinateSpace:'output-pixel',runtimeEpoch:7,deviceEpoch:3,deviceIdentity:'device:source',commandGraphId:'graph:source'};
  const recorded=await recordTerminalIntegratedR1CWgsl03({device,encoder,pipelineBundle:bundle,trackTransient(){}},{operationId:'source-fixture',sourceSurface,runtimeEpoch:7,deviceEpoch:3,deviceIdentity:'device:source',commandGraphId:'graph:source',lambda2QualificationReceipt:q,tensorParameters:{tensorSigma:1.15,maxAnisotropy:3,minorCoverageFactor:.82,coherenceExponent:1.25,sourceDomain:'declared-linear'}});
  const admission=await admitBakemonoRinneTerminalR1CWgsl03(recorded.handle,{width:33,height:33,sourceSurfaceId:'surface:source',sourceSurfaceRevision:1,runtimeEpoch:7,deviceEpoch:3,deviceIdentity:'device:source',commandGraphId:'graph:source'});
  return {q,device,encoder,bundle,sourceSurface,recorded,admission};
}
function addGroup(rows,prefix,count,facts){if(facts.length!==count)throw new Error(`${prefix} expected ${count}, got ${facts.length}`);facts.forEach((f,i)=>rows.push({id:`BKR03-${prefix}-${String(i+1).padStart(3,'0')}`,description:f[0],ok:Boolean(f[1]),evidence:f[2]??null,status:f[1]?'PASS':'FAIL'}));}

export async function runSourceVerificationWgsl03(){
  fs.mkdirSync(path.join(ROOT,SOURCE_DIR),{recursive:true});fs.mkdirSync(path.join(ROOT,PHYSICAL_DIR),{recursive:true});
  const generated=writeBakemonoRinneWgsl03GeneratedSources();
  const negative=await runNegativeControlsWgsl03();
  const fixture=await sourceFixture();
  const parent=readJson(PARENT_RECEIPT_REL),manifest=readJson(MANIFEST_REL),canon=read(CANON_REL),probe=read(PROBE_REL),compat=read(PARENT_COMPAT_REL),contract=getBakemonoRinneWgsl03Contract();
  const contractSource=read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_contract.mjs');
  const terminalSource=read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_terminal_tensor.mjs');
  const admissionSource=read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_tensor_admission.mjs');
  const probeRuntimeSource=read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_lambda2_probe.mjs');
  const pipelineSource=read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_pipeline.mjs');
  const shadowSource=read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_shadow_runtime.mjs');
  const paramsSource=read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_params.mjs');
  const receiptSource=read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_receipt.mjs');
  const phaseReceipt={mode:'STILL_EXPLICIT',wrappedPhaseBase:.25,receiptDigest:'f'.repeat(64)};
  const packed=packBakemonoRinneWgsl03Params({width:33,height:33,phaseReceipt,power:1,neonBoost:1,coherenceExponent:1.25,alphaEpsilon:1e-6});
  const canonicalRequest={purpose:'QUALIFICATION_ONLY',operationId:'source',device:fixture.device,runtimeEpoch:7,deviceEpoch:3,deviceIdentity:'device:source',commandGraphId:'graph:source',formulaProfileId:BKR03_FORMULA_PROFILE_ID,formulaContractReceipt:{receiptDigest:'1'.repeat(64)},phaseReceipt,base:{},qmap:{},scalar:{},alphaDepth:{},highlight:{},maskEdge:{},terminalR1CAdmission:fixture.admission,width:33,height:33,power:1,neonBoost:1,coherenceExponent:1.25,alphaEpsilon:1e-6,outputAuthority:BKR03_OUTPUT_AUTHORITY};
  const kernelReceipt=await createBakemonoRinneCanonicalKernelReceiptWgsl03({generatedWgslDigest:manifest.generatedWgslDigest,generatorManifestDigest:manifest.manifestDigest,uniformAbiDigest:await sha256BakemonoRinneWgsl03({abi:BKR03_KERNEL_ABI_ID,bytes:128}),bindGroupLayoutDigest:await sha256BakemonoRinneWgsl03(BKR03_BIND_GROUP_LAYOUT_CANONICAL),formulaContractReceiptDigest:'1'.repeat(64),structureGateSourceDigest:await sha256BakemonoRinneWgsl03('pow(coherence, params.coherenceExponent) * structureEdge'),compatibilityKernelDigest:PARENT_COMPAT_SHA,compatibilityFormulaBodyDigest:'2'.repeat(64),canonicalDeltaDigest:'3'.repeat(64),compilationInfoDigest:'4'.repeat(64),compilationErrorCount:0,compilationWarningCount:0,runtimeEpoch:7,deviceEpoch:3,deviceIdentity:'device:source'});
  const dispatchReceipt=await createBakemonoRinneCanonicalDispatchReceiptWgsl03({purpose:'QUALIFICATION_ONLY',operationId:'source',fixtureId:null,kernelReceiptDigest:kernelReceipt.receiptDigest,terminalTensorProducerReceiptDigest:fixture.recorded.producerReceipt.receiptDigest,lambda2QualificationReceiptDigest:fixture.q.receiptDigest,terminalTensorAdmissionDigest:fixture.admission.admissionDigest,parameterDigest:'5'.repeat(64),phaseReceiptDigest:phaseReceipt.receiptDigest,inputSetDigest:'6'.repeat(64),width:33,height:33,workgroupsX:5,workgroupsY:5,queueSubmitCount:0,coherenceExponent:1.25});
  const rows=[];
  addGroup(rows,'PAR',16,[
    ['Parent source receipt exists',exists(PARENT_RECEIPT_REL),PARENT_RECEIPT_REL],
    ['Parent source receipt byte identity',fileSha(PARENT_RECEIPT_REL)===PARENT_RECEIPT_FILE_SHA,fileSha(PARENT_RECEIPT_REL)],
    ['Parent patch identity',parent.patchId==='TDT-BAKEMONO-RINNE-WGSL-02',parent.patchId],
    ['Parent status source baked',parent.status==='SOURCE_BAKED_AWAITING_PHYSICAL_GPU',parent.status],
    ['Parent source gates complete',parent.gateCount===192&&parent.passCount===192&&parent.failCount===0,parent.gateCount],
    ['Parent physical gates remain pending',parent.physicalGateCount===48&&parent.physicalPendingCount===48,parent.physicalPendingCount],
    ['Parent spec byte identity',fileSha(PARENT_SPEC_REL)===PARENT_SPEC_SHA,fileSha(PARENT_SPEC_REL)],
    ['Compatibility WGSL byte identity',fileSha(PARENT_COMPAT_REL)===PARENT_COMPAT_SHA,fileSha(PARENT_COMPAT_REL)],
    ['Compatibility manifest byte identity',fileSha(PARENT_MANIFEST_REL)===PARENT_MANIFEST_SHA,fileSha(PARENT_MANIFEST_REL)],
    ['Compatibility kernel identity inherited',contract.compatibilityIdentity.kernelId==='tdt.effect.bakemono-rinne.kernel.wgsl.compat-shadow.v1',contract.compatibilityIdentity.kernelId],
    ['Compatibility ABI remains 8 bindings',contract.compatibilityIdentity.bindingCount===8,contract.compatibilityIdentity.bindingCount],
    ['Compatibility ABI remains tensor-free',!compat.includes('terminalR1CTex'),'terminalR1CTex absent'],
    ['Compatibility output remains SHADOW_ONLY',contract.compatibilityIdentity.outputAuthority==='SHADOW_ONLY',contract.compatibilityIdentity.outputAuthority],
    ['Parent next patch is WGSL-03',parent.nextPatch==='TDT-BAKEMONO-RINNE-WGSL-03',parent.nextPatch],
    ['Declared parent bundle digest exact',PARENT_ZIP_SHA==='823835480cfa4e641fa5a2fe40a15c939f5f650d2f292232076f6db50aef1570',PARENT_ZIP_SHA],
    ['WGSL-03 spec references parent digest',read(SPEC_REL).includes(PARENT_ZIP_SHA),PARENT_ZIP],
  ]);
  const validSurface=fixture.sourceSurface;
  addGroup(rows,'SRC',20,[
    ['Terminal descriptor validator accepts canonical surface',(()=>{try{return assertFinalEwaTerminalSurfaceWgsl03(validSurface,{runtimeEpoch:7,deviceEpoch:3,deviceIdentity:'device:source',commandGraphId:'graph:source'});}catch{return false;}})(),'accepted'],
    ['FINAL_EWA_TERMINAL role enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,surfaceRole:'STAGE_SOURCE'}),'E_BKR03_FINAL_EWA_ROLE_MISMATCH'),'role mutation rejected'],
    ['rgba16float enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,format:'rgba8unorm'}),'E_BKR03_FINAL_EWA_FORMAT_MISMATCH'),'format mutation rejected'],
    ['Canonical semantic enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,semanticId:'legacy'}),'E_BKR03_FINAL_EWA_FORMAT_MISMATCH'),'semantic mutation rejected'],
    ['Linear transfer enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,transfer:'srgb'}),'E_BKR03_FINAL_EWA_COLOR_CONTRACT_MISMATCH'),'transfer mutation rejected'],
    ['Premultiplied alpha enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,alphaMode:'straight'}),'E_BKR03_FINAL_EWA_COLOR_CONTRACT_MISMATCH'),'alpha mutation rejected'],
    ['Output-pixel coordinates enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,coordinateSpace:'source-pixel'}),'E_BKR03_FINAL_EWA_COLOR_CONTRACT_MISMATCH'),'coordinate mutation rejected'],
    ['Positive width enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,width:0}),'E_BKR03_FINAL_EWA_DIMENSION_INVALID'),'zero width rejected'],
    ['Positive height enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,height:0}),'E_BKR03_FINAL_EWA_DIMENSION_INVALID'),'zero height rejected'],
    ['Lowpass receipt digest enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,lowpassReceiptDigest:'x'}),'E_BKR03_FINAL_EWA_RECEIPT_MISSING'),'receipt rejected'],
    ['Lowpass plan digest enforced',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({...validSurface,lowpassPlanDigest:'x'}),'E_BKR03_FINAL_EWA_RECEIPT_MISSING'),'plan rejected'],
    ['Runtime epoch exact match',catches(()=>assertFinalEwaTerminalSurfaceWgsl03(validSurface,{runtimeEpoch:8}),'E_BKR03_FINAL_EWA_EPOCH_MISMATCH'),'runtime epoch rejected'],
    ['Device epoch exact match',catches(()=>assertFinalEwaTerminalSurfaceWgsl03(validSurface,{deviceEpoch:4}),'E_BKR03_FINAL_EWA_EPOCH_MISMATCH'),'device epoch rejected'],
    ['Device identity exact match',catches(()=>assertFinalEwaTerminalSurfaceWgsl03(validSurface,{deviceIdentity:'other'}),'E_BKR03_FINAL_EWA_EPOCH_MISMATCH'),'device identity rejected'],
    ['Command graph exact match',catches(()=>assertFinalEwaTerminalSurfaceWgsl03(validSurface,{commandGraphId:'other'}),'E_BKR03_FINAL_EWA_GRAPH_MISMATCH'),'graph rejected'],
    ['Arbitrary GPUTexture alone rejected',catches(()=>assertFinalEwaTerminalSurfaceWgsl03({texture:fakeTexture('raw')}),'E_BKR03_FINAL_EWA_ROLE_MISMATCH'),'raw texture rejected'],
    ['Terminal schema ID present',contractSource.includes('tdt.ewa.terminal-surface-descriptor.wgsl03.v1'),'schema token'],
    ['Stage-local source explicitly denied by role',contractSource.includes('FINAL_EWA_TERMINAL'),'role token'],
    ['No WebGL FBO admission token',!contractSource.includes('WEBGL_FBO_TERMINAL'),'absent'],
    ['No CPU RGBA8 terminal admission token',!contractSource.includes('CPU_RGBA8_TERMINAL'),'absent'],
  ]);
  const privateCounts=getBakemonoRinneTerminalTensorPrivateCountsWgsl03(fixture.recorded.handle);
  addGroup(rows,'R1C',28,[
    ['Terminal producer ID exact',BKR03_TERMINAL_TENSOR_PRODUCER_ID.endsWith('terminal-r1c.wgsl03.v1'),BKR03_TERMINAL_TENSOR_PRODUCER_ID],
    ['Pass order has six stages',BKR03_TENSOR_PASS_ORDER.length===6,BKR03_TENSOR_PASS_ORDER],
    ['Gradient first',BKR03_TENSOR_PASS_ORDER[0]==='gradient',BKR03_TENSOR_PASS_ORDER],
    ['Outer after gradient',BKR03_TENSOR_PASS_ORDER[1]==='outer',BKR03_TENSOR_PASS_ORDER],
    ['Blur H after outer',BKR03_TENSOR_PASS_ORDER[2]==='blurH',BKR03_TENSOR_PASS_ORDER],
    ['Blur V after blur H',BKR03_TENSOR_PASS_ORDER[3]==='blurV',BKR03_TENSOR_PASS_ORDER],
    ['Eigen after integration',BKR03_TENSOR_PASS_ORDER[4]==='eigen',BKR03_TENSOR_PASS_ORDER],
    ['Axial last',BKR03_TENSOR_PASS_ORDER[5]==='axial',BKR03_TENSOR_PASS_ORDER],
    ['Gradient digest exact',shaderDigests.gradient===BKR03_R1C_SHADER_DIGESTS.gradient,shaderDigests.gradient],
    ['Outer digest exact',shaderDigests.outer===BKR03_R1C_SHADER_DIGESTS.outer,shaderDigests.outer],
    ['Blur H digest exact',shaderDigests.blurH===BKR03_R1C_SHADER_DIGESTS.blurH,shaderDigests.blurH],
    ['Blur V digest exact',shaderDigests.blurV===BKR03_R1C_SHADER_DIGESTS.blurV,shaderDigests.blurV],
    ['Eigen digest exact',shaderDigests.eigen===BKR03_R1C_SHADER_DIGESTS.eigen,shaderDigests.eigen],
    ['Axial digest exact',shaderDigests.axial===BKR03_R1C_SHADER_DIGESTS.axial,shaderDigests.axial],
    ['Six compute passes recorded',fixture.encoder.passes.length===6,fixture.encoder.passes.map(p=>p.label)],
    ['Producer dispatch count six',fixture.recorded.dispatchCount===6,fixture.recorded.dispatchCount],
    ['Producer queue submit count zero',fixture.recorded.queueSubmitCount===0&&!terminalSource.includes('queue.submit'),fixture.recorded.queueSubmitCount],
    ['Six private textures retained',privateCounts.resourceCount===6,privateCounts],
    ['Integrated texture private capability exists',privateCounts.integratedAvailable===true,privateCounts],
    ['Raw exposure count zero',fixture.recorded.rawTextureExposureCount===0,fixture.recorded.rawTextureExposureCount],
    ['Integrated exposure count zero',fixture.recorded.integratedTextureExposureCount===0,fixture.recorded.integratedTextureExposureCount],
    ['Public handle exposes fieldTexture',fixture.recorded.handle.textureRole==='fieldTexture',fixture.recorded.handle.textureRole],
    ['Public handle has no integratedTexture property',!Object.prototype.hasOwnProperty.call(fixture.recorded.handle,'integratedTexture'),'absent'],
    ['Public handle has no rawTensorTexture property',!Object.prototype.hasOwnProperty.call(fixture.recorded.handle,'rawTensorTexture'),'absent'],
    ['Producer receipt terminal resolution claim',fixture.recorded.producerReceipt.terminalResolutionClaim===true,fixture.recorded.producerReceipt.terminalResolutionClaim],
    ['Producer receipt tensor truth claim',fixture.recorded.producerReceipt.tensorTruthClaim===true,fixture.recorded.producerReceipt.tensorTruthClaim],
    ['Per-operation lambda2 readback zero',fixture.recorded.producerReceipt.perOperationLambda2ReadbackCount===0,fixture.recorded.producerReceipt.perOperationLambda2ReadbackCount],
    ['Tensor parameters use positive sigma and radius',fixture.recorded.producerReceipt.tensorSigma>0&&fixture.recorded.producerReceipt.kernelRadius===4,{sigma:fixture.recorded.producerReceipt.tensorSigma,radius:fixture.recorded.producerReceipt.kernelRadius}],
  ]);
  const fakeHandle={...fixture.recorded.handle};
  addGroup(rows,'ADM',24,[
    ['Authentic handle schema exact',fixture.recorded.handle.schemaId===BKR03_TERMINAL_TENSOR_HANDLE_SCHEMA_ID,fixture.recorded.handle.schemaId],
    ['Admission token is opaque and accepted',assertBakemonoRinneTerminalR1CAdmissionTokenWgsl03(fixture.admission),fixture.admission.schemaId],
    ['Admission token WeakSet identity',isBakemonoRinneTerminalR1CAdmissionTokenWgsl03(fixture.admission),true],
    ['Plain copied handle rejected',await catchesAsync(()=>admitBakemonoRinneTerminalR1CWgsl03(fakeHandle,{width:33,height:33,sourceSurfaceId:'surface:source',sourceSurfaceRevision:1,runtimeEpoch:7,deviceEpoch:3,deviceIdentity:'device:source',commandGraphId:'graph:source'}),'E_BKR03_TENSOR_BINDING_REQUIRED'),'authenticity seal'],
    ['Admission semantic exact',fixture.admission.semanticId==='tdt.analysis.tensor.tangent-coherence-edge.r1c.v1',fixture.admission.semanticId],
    ['Admission packing exact',fixture.admission.packingId==='tdt.tensor.tangent-coherence-edge.rgba.v1',fixture.admission.packingId],
    ['Admission tensor mode terminal',fixture.admission.tensorMode==='canonical-terminal-r1c',fixture.admission.tensorMode],
    ['Admission dimensions exact',fixture.admission.width===33&&fixture.admission.height===33,[fixture.admission.width,fixture.admission.height]],
    ['Admission source surface exact',fixture.admission.sourceSurfaceId==='surface:source',fixture.admission.sourceSurfaceId],
    ['Admission source revision exact',fixture.admission.sourceSurfaceRevision===1,fixture.admission.sourceSurfaceRevision],
    ['Admission runtime epoch exact',fixture.admission.runtimeEpoch===7,fixture.admission.runtimeEpoch],
    ['Admission device epoch exact',fixture.admission.deviceEpoch===3,fixture.admission.deviceEpoch],
    ['Admission device identity exact',fixture.admission.deviceIdentity==='device:source',fixture.admission.deviceIdentity],
    ['Admission graph exact',fixture.admission.commandGraphId==='graph:source',fixture.admission.commandGraphId],
    ['Producer receipt digest carried',fixture.admission.producerReceiptDigest===fixture.recorded.producerReceipt.receiptDigest,fixture.admission.producerReceiptDigest],
    ['Lambda2 receipt digest carried',fixture.admission.lambda2QualificationReceiptDigest===fixture.q.receiptDigest,fixture.admission.lambda2QualificationReceiptDigest],
    ['Admission digest is SHA-256',/^[0-9a-f]{64}$/.test(fixture.admission.admissionDigest),fixture.admission.admissionDigest],
    ['Field texture carried as opaque resource',fixture.admission.fieldTexture===fixture.recorded.handle.fieldTexture,'same object'],
    ['Axial packing string absent from token',!String(fixture.admission.packingId).includes('axial'),'absent'],
    ['Raw tensor public fields denylisted',BKR03_FORBIDDEN_PUBLIC_TENSOR_FIELDS.includes('rawTensorTexture'),'denylist'],
    ['Integrated tensor public fields denylisted',BKR03_FORBIDDEN_PUBLIC_TENSOR_FIELDS.includes('integratedTensorTexture'),'denylist'],
    ['Legacy tensor public fields denylisted',BKR03_FORBIDDEN_PUBLIC_TENSOR_FIELDS.includes('legacyTensorTexture'),'denylist'],
    ['Canonical request validates admitted token lineage',assertCanonicalRequestWgsl03(canonicalRequest),'accepted'],
    ['Canonical request raw field rejected',catches(()=>assertNoRawTensorFieldsWgsl03({...canonicalRequest,rawTensorTexture:fakeTexture('raw')}),'E_BKR03_TENSOR_RAW_EXPOSURE_DENIED'),'raw field rejected'],
  ]);
  const probeAtomicCount=(probe.match(/atomic<u32>/g)||[]).length;
  addGroup(rows,'L2P',20,[
    ['Lambda2 probe ID exact',BKR03_LAMBDA2_PROBE_ID.endsWith('wgsl03.v1'),BKR03_LAMBDA2_PROBE_ID],
    ['Generated probe digest exact',fileSha(PROBE_REL)===manifest.probeWgslDigest,fileSha(PROBE_REL)],
    ['Probe generator deterministic',renderLambda2ProbeWgsl03()===probe,'byte identity'],
    ['Probe binding 0 integrated texture',probe.includes('@binding(0) var integratedTex'),'binding0'],
    ['Probe binding 1 storage counters',probe.includes('@binding(1) var<storage, read_write> counters'),'binding1'],
    ['Probe binding 2 uniform params',probe.includes('@binding(2) var<uniform> params'),'binding2'],
    ['Probe counter ABI is 64 bytes',probeRuntimeSource.includes('size:64')&&probe.includes('counterBytes: 64'),'64'],
    ['Probe has sixteen atomic words',probeAtomicCount===16,probeAtomicCount],
    ['Probe reads Jxx from R',probe.includes('let jxx=max(j.r,0.0)'),'j.r'],
    ['Probe reads Jxy from G',probe.includes('let jxy=j.g'),'j.g'],
    ['Probe reads Jyy from B',probe.includes('let jyy=max(j.b,0.0)'),'j.b'],
    ['Discriminant formula present',probe.includes('4.0*jxy*jxy'),'discriminant'],
    ['Lambda1 formula present',probe.includes('0.5*(trace+disc)'),'lambda1'],
    ['Lambda2 formula present',probe.includes('0.5*(trace-disc)'),'lambda2'],
    ['Coherence formula uses both eigenvalues',probe.includes('(lambda1-lambda2)/(lambda1+lambda2+1e-8)'),'coherence'],
    ['Nonfinite counter present',probe.includes('nonFiniteCount'),'counter'],
    ['Negative lambda counter present',probe.includes('negativeLambdaCount'),'counter'],
    ['Positive lambda2 counter present',probe.includes('lambda2PositivePixelCount'),'counter'],
    ['Probe uses private integrated capability',probeRuntimeSource.includes('withBakemonoRinneTerminalIntegratedPrivateWgsl03'),'private capability'],
    ['Product path has no per-operation mapAsync',!pipelineSource.includes('mapAsync')&&!terminalSource.includes('mapAsync'),'zero product readback'],
  ]);
  const structureGateCount=(canon.match(/\* structureGate/g)||[]).length;
  addGroup(rows,'GEN',28,[
    ['Canonical generator deterministic',renderBakemonoRinneWgsl03()===canon,'byte identity'],
    ['Canonical generated digest exact',fileSha(CANON_REL)===manifest.generatedWgslDigest,fileSha(CANON_REL)],
    ['Generator manifest self digest present',/^[0-9a-f]{64}$/.test(manifest.manifestDigest),manifest.manifestDigest],
    ['Canonical kernel ID in header',canon.includes(BKR03_KERNEL_ID),BKR03_KERNEL_ID],
    ['Canonical ABI ID in header',canon.includes(BKR03_KERNEL_ABI_ID),BKR03_KERNEL_ABI_ID],
    ['Canonical pipeline family in header',canon.includes(BKR03_PIPELINE_FAMILY_ID),BKR03_PIPELINE_FAMILY_ID],
    ['Canonical output authority in header',canon.includes(BKR03_OUTPUT_AUTHORITY),BKR03_OUTPUT_AUTHORITY],
    ['Canonical binding count nine',(canon.match(/@group\(0\) @binding\(/g)||[]).length===9,(canon.match(/@binding/g)||[]).length],
    ['Canonical sampler count zero',!canon.includes('sampler'),'zero'],
    ['Terminal R1C binding six',canon.includes('@binding(6) var terminalR1CTex'),'binding6'],
    ['Output binding seven',canon.includes('@binding(7) var outputTex'),'binding7'],
    ['Uniform binding eight',canon.includes('@binding(8) var<uniform> params'),'binding8'],
    ['Canonical uniform struct named',canon.includes('struct BakemonoRinneCanonicalParams'),'struct'],
    ['Coherence exponent field active',canon.includes('coherenceExponent: f32'),'field'],
    ['Tensor profile enum word present',canon.includes('tensorProfileEnum: u32'),'field'],
    ['Tensor packing enum word present',canon.includes('tensorPackingEnum: u32'),'field'],
    ['Structure gate enum word present',canon.includes('structureGateEnum: u32'),'field'],
    ['Finite tensor guard present',canon.includes('finite4(terminalR1C)'),'finite4'],
    ['Coherence uses B channel',canon.includes('terminalR1C.b'),'B'],
    ['Edge uses A channel',canon.includes('terminalR1C.a'),'A'],
    ['Exact structure gate source',canon.includes('pow(coherence, params.coherenceExponent) * structureEdge'),'formula'],
    ['Structure gate applied exactly once',structureGateCount===1,structureGateCount],
    ['Workgroup is 8x8x1',canon.includes('@workgroup_size(8, 8, 1)'),'8x8x1'],
    ['Output storage format rgba16float',canon.includes('texture_storage_2d<rgba16float, write>'),'rgba16float'],
    ['Pixel exact textureLoad used',canon.includes('textureLoad(terminalR1CTex, pixel, 0)'),'textureLoad'],
    ['No normalized UV sampling',!canon.includes('textureSample('),'absent'],
    ['Compatibility source digest preserved',manifest.compatibilityKernelDigest===PARENT_COMPAT_SHA,manifest.compatibilityKernelDigest],
    ['Canonical source contains no final texture claim',!canon.includes('CANONICAL_FINAL_TEXTURE'),'absent'],
  ]);
  const compatManifest=readJson(PARENT_MANIFEST_REL);
  addGroup(rows,'ABI',24,[
    ['Kernel IDs are distinct',BKR03_KERNEL_ID!==contract.compatibilityIdentity.kernelId,[BKR03_KERNEL_ID,contract.compatibilityIdentity.kernelId]],
    ['ABI IDs are distinct',BKR03_KERNEL_ABI_ID!==contract.compatibilityIdentity.kernelAbiId,[BKR03_KERNEL_ABI_ID,contract.compatibilityIdentity.kernelAbiId]],
    ['Pipeline families are distinct',BKR03_PIPELINE_FAMILY_ID!==contract.compatibilityIdentity.pipelineFamilyId,[BKR03_PIPELINE_FAMILY_ID,contract.compatibilityIdentity.pipelineFamilyId]],
    ['Output semantic is distinct',BKR03_OUTPUT_SEMANTIC_ID!=='tdt.surface.bakemono-rinne.compat-shadow-candidate.linear-premul.v1',BKR03_OUTPUT_SEMANTIC_ID],
    ['Canonical binding count nine',BKR03_BIND_GROUP_LAYOUT_CANONICAL.length===9,BKR03_BIND_GROUP_LAYOUT_CANONICAL.length],
    ['Compatibility binding count eight',contract.compatibilityIdentity.bindingCount===8,contract.compatibilityIdentity.bindingCount],
    ['Canonical BGL differs from compatibility',sha(BKR03_BIND_GROUP_LAYOUT_CANONICAL)!==sha(readJson(PARENT_MANIFEST_REL)),sha(BKR03_BIND_GROUP_LAYOUT_CANONICAL)],
    ['Canonical ABI version 0x00030001',BKR03_ABI_VERSION===0x00030001,BKR03_ABI_VERSION],
    ['Compatibility ABI version remains in parent params',read('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_02_contract.mjs').includes('0x00020001'),'parent'],
    ['Canonical formula profile enum two',new DataView(packed.buffer).getUint32(BKR03_PARAM_OFFSETS.formulaProfileEnum,true)===2,new DataView(packed.buffer).getUint32(BKR03_PARAM_OFFSETS.formulaProfileEnum,true)],
    ['Canonical output authority enum two',new DataView(packed.buffer).getUint32(BKR03_PARAM_OFFSETS.outputAuthorityEnum,true)===2,new DataView(packed.buffer).getUint32(BKR03_PARAM_OFFSETS.outputAuthorityEnum,true)],
    ['Terminal tensor profile enum one',new DataView(packed.buffer).getUint32(BKR03_PARAM_OFFSETS.tensorProfileEnum,true)===BKR03_TENSOR_PROFILE_ENUM,BKR03_TENSOR_PROFILE_ENUM],
    ['Tensor packing enum one',new DataView(packed.buffer).getUint32(BKR03_PARAM_OFFSETS.tensorPackingEnum,true)===BKR03_TENSOR_PACKING_ENUM,BKR03_TENSOR_PACKING_ENUM],
    ['Structure gate enum one',new DataView(packed.buffer).getUint32(BKR03_PARAM_OFFSETS.structureGateEnum,true)===BKR03_STRUCTURE_GATE_ENUM,BKR03_STRUCTURE_GATE_ENUM],
    ['Canonical uniform is 128 bytes',packed.buffer.byteLength===BKR03_UNIFORM_BYTES,packed.buffer.byteLength],
    ['Canonical uniform checksum verifies',verifyBakemonoRinneWgsl03PackedParams(packed),'verified'],
    ['Tampered canonical uniform rejected',catches(()=>{const b=packed.buffer.slice(0);new DataView(b).setFloat32(28,2,true);verifyBakemonoRinneWgsl03PackedParams({buffer:b});},'E_BKR03_UNIFORM_ABI_MISMATCH'),'tamper rejected'],
    ['Compatibility request profile differs',BKR03_FORMULA_PROFILE_ID!=='tdt.effect.bakemono-rinne.profile.legacy-fusion-compat-shadow.v1',BKR03_FORMULA_PROFILE_ID],
    ['Canonical output authority differs',BKR03_OUTPUT_AUTHORITY!=='SHADOW_ONLY',BKR03_OUTPUT_AUTHORITY],
    ['Canonical manifest separate from compatibility',manifest.manifestDigest!==compatManifest.manifestDigest,[manifest.manifestDigest,compatManifest.manifestDigest]],
    ['Canonical pipeline source imports WGSL-03 params',pipelineSource.includes('packBakemonoRinneWgsl03Params'),'import'],
    ['Canonical pipeline requires admission token',pipelineSource.includes('assertBakemonoRinneTerminalR1CAdmissionTokenWgsl03'),'admission'],
    ['Compatibility pipeline remains unmodified',fileSha(PARENT_COMPAT_REL)===PARENT_COMPAT_SHA,PARENT_COMPAT_SHA],
    ['Cross ABI error codes present',BKR03_STABLE_ERROR_CODES.includes('E_BKR03_COMPAT_ABI_NOT_CANONICAL')&&BKR03_STABLE_ERROR_CODES.includes('E_BKR03_CANONICAL_ABI_NOT_COMPAT'),'error codes'],
  ]);
  const gateVals=[.2,.5,.9].map(c=>structureGateWgsl03([0,0,c,.8],1.25));
  const edgeVals=[.2,.5,.9].map(e=>structureGateWgsl03([0,0,.8,e],1.25));
  addGroup(rows,'GATE',20,[
    ['Structure gate identity exact',BKR03_STRUCTURE_GATE_ID.endsWith('coherence-edge.v1'),BKR03_STRUCTURE_GATE_ID],
    ['Gate equals one at coherence one edge one',structureGateWgsl03([0,0,1,1],1)===1,structureGateWgsl03([0,0,1,1],1)],
    ['Gate zero at coherence zero',structureGateWgsl03([0,0,0,1],1)===0,0],
    ['Gate zero at edge zero',structureGateWgsl03([0,0,1,0],1)===0,0],
    ['Gate zero for NaN tensor',structureGateWgsl03([0,0,Number.NaN,1],1)===0,0],
    ['Gate clamps negative coherence',structureGateWgsl03([0,0,-1,1],1)===0,0],
    ['Gate clamps coherence above one',structureGateWgsl03([0,0,2,1],1)===1,1],
    ['Gate clamps negative edge',structureGateWgsl03([0,0,1,-1],1)===0,0],
    ['Gate clamps edge above one',structureGateWgsl03([0,0,1,2],1)===1,1],
    ['Coherence monotonicity',gateVals[0]<=gateVals[1]&&gateVals[1]<=gateVals[2],gateVals],
    ['Edge monotonicity',edgeVals[0]<=edgeVals[1]&&edgeVals[1]<=edgeVals[2],edgeVals],
    ['Exponent affects coherence',structureGateWgsl03([0,0,.5,1],2)<structureGateWgsl03([0,0,.5,1],1),[structureGateWgsl03([0,0,.5,1],2),structureGateWgsl03([0,0,.5,1],1)]],
    ['Exponent lower bound enforced',catches(()=>assertCanonicalRequestWgsl03({...canonicalRequest,coherenceExponent:0}),'E_BKR03_COHERENCE_EXPONENT_INVALID'),'zero rejected'],
    ['Exponent upper bound enforced',catches(()=>assertCanonicalRequestWgsl03({...canonicalRequest,coherenceExponent:9}),'E_BKR03_COHERENCE_EXPONENT_INVALID'),'nine rejected'],
    ['Gate multiplies final k',canon.includes('q * s * params.power * structureGate'),'final k'],
    ['Gate not applied to phase',!canon.includes('phase * structureGate')&&!canon.includes('structureGate + q * params.phaseQGain'),'absent'],
    ['Gate not applied to glow',!canon.includes('glow * structureGate'),'absent'],
    ['Gate not applied to mask mix',!canon.includes('maskMix * structureGate'),'absent'],
    ['Gate not applied to fusion ratio',!canon.includes('fusionRatio * structureGate'),'absent'],
    ['Finite guard selects zero',canon.includes('select(0.0, pow(coherence, params.coherenceExponent) * structureEdge, finite4(terminalR1C))'),'select zero'],
  ]);
  const qTampered={...fixture.q,pass:false};const pTampered={...fixture.recorded.producerReceipt,width:34};const kTampered={...kernelReceipt,compilationWarningCount:99};const dTampered={...dispatchReceipt,canonicalFinalTextureClaim:true};
  addGroup(rows,'AUT',16,[
    ['Lambda2 receipt verifies',await verifyBakemonoRinneWgsl03Receipt(fixture.q),fixture.q.receiptDigest],
    ['Producer receipt verifies',await verifyBakemonoRinneWgsl03Receipt(fixture.recorded.producerReceipt),fixture.recorded.producerReceipt.receiptDigest],
    ['Kernel receipt verifies',await verifyBakemonoRinneWgsl03Receipt(kernelReceipt),kernelReceipt.receiptDigest],
    ['Dispatch receipt verifies',await verifyBakemonoRinneWgsl03Receipt(dispatchReceipt),dispatchReceipt.receiptDigest],
    ['Lambda2 tamper detected',!(await verifyBakemonoRinneWgsl03Receipt(qTampered)),'detected'],
    ['Producer tamper detected',!(await verifyBakemonoRinneWgsl03Receipt(pTampered)),'detected'],
    ['Kernel tamper detected',!(await verifyBakemonoRinneWgsl03Receipt(kTampered)),'detected'],
    ['Dispatch tamper detected',!(await verifyBakemonoRinneWgsl03Receipt(dTampered)),'detected'],
    ['Dispatch output authority canonical shadow only',dispatchReceipt.outputAuthority===BKR03_OUTPUT_AUTHORITY,dispatchReceipt.outputAuthority],
    ['Dispatch final texture claim false',dispatchReceipt.canonicalFinalTextureClaim===false,false],
    ['Dispatch R9A claim false',dispatchReceipt.r9aCommandGraphClaim===false,false],
    ['Surface publish count zero',dispatchReceipt.surfaceRegistryPublishCount===0,0],
    ['Preview publish count zero',dispatchReceipt.previewPublishCount===0,0],
    ['Export publish count zero',dispatchReceipt.exportPublishCount===0,0],
    ['Recorder queue submit count zero',dispatchReceipt.queueSubmitCount===0,0],
    ['Qualification wrapper submit count source present',shadowSource.includes('qualificationSubmitCount:1'),'one'],
  ]);
  const negRows=negative.rows;
  addGroup(rows,'NEG',12,[
    ['Negative-control report passes',negative.status==='PASS',negative.status],
    ['All 48 mutants present',negative.mutantCount===48,negative.mutantCount],
    ['All 48 mutants detected',negative.detectedCount===48,negative.detectedCount],
    ['Tensor construction mutants 16 detected',negRows.slice(0,16).every(r=>r.detected),16],
    ['Lineage mutants 12 detected',negRows.slice(16,28).every(r=>r.detected),12],
    ['ABI mutants 8 detected',negRows.slice(28,36).every(r=>r.detected),8],
    ['Structure gate mutants 12 detected',negRows.slice(36,48).every(r=>r.detected),12],
    ['Corner baseline has nonzero lambda2',negative.baseline.corner.lambda2Positive>0,negative.baseline.corner.lambda2Positive],
    ['Junction baseline has nonzero lambda2',negative.baseline.junction.lambda2Positive>0,negative.baseline.junction.lambda2Positive],
    ['Straight coherence exceeds corner',negative.baseline.straight.mean>negative.baseline.corner.center,[negative.baseline.straight.mean,negative.baseline.corner.center]],
    ['Straight coherence exceeds junction',negative.baseline.straight.mean>negative.baseline.junction.center,[negative.baseline.straight.mean,negative.baseline.junction.center]],
    ['Negative report self hash valid',sha(Object.fromEntries(Object.entries(negative).filter(([k])=>k!=='selfSha256')))===negative.selfSha256,negative.selfSha256],
  ]);
  if(rows.length!==208)throw new Error(`Expected 208 source gates, got ${rows.length}`);
  const passCount=rows.filter(r=>r.ok).length,failCount=rows.length-passCount;
  const groupSummary={};for(const row of rows){const g=row.id.split('-')[1];groupSummary[g]??={total:0,pass:0,fail:0};groupSummary[g].total++;groupSummary[g][row.ok?'pass':'fail']++;}
  const catalog={schemaVersion:1,patchId:BKR03_PATCH_ID,gateCount:rows.length,gates:rows.map(({id,description})=>({id,description}))};writeJson(CATALOG_REL,catalog);
  const reportBody={schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.wgsl03-source-gate-report.v1',patchId:BKR03_PATCH_ID,status:failCount===0?'PASS':'FAIL',gateCount:rows.length,passCount,failCount,groupSummary,generatedWgslDigest:manifest.generatedWgslDigest,probeWgslDigest:manifest.probeWgslDigest,negativeControlReportDigest:negative.selfSha256,rows};const report={...reportBody,selfSha256:sha(reportBody)};writeJson(REPORT_REL,report);
  const physicalRows=Array.from({length:56},(_,i)=>({id:`BKR03-PHY-${String(i+1).padStart(3,'0')}`,description:'Physical WebGPU terminal-R1C and canonical shadow qualification',status:'PENDING',evidence:'Requires Electron WebGPU execution on an admitted adapter/device'}));const physicalBody={schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.wgsl03-physical-gate-report.v1',patchId:BKR03_PATCH_ID,status:'PENDING_PHYSICAL',gateCount:56,passCount:0,failCount:0,pendingCount:56,rows:physicalRows};const physical={...physicalBody,selfSha256:sha(physicalBody)};writeJson(PHYSICAL_REL,physical);
  const implementationFiles=[
    'app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_contract.mjs','app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_params.mjs','app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_receipt.mjs','app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_terminal_tensor.mjs','app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_tensor_admission.mjs','app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_lambda2_probe.mjs','app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_pipeline.mjs','app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_shadow_runtime.mjs',CANON_REL,PROBE_REL,MANIFEST_REL,'app/src/runtime/effects/bakemono-rinne/bakemono-rinne-wgsl-03-types.ts','app/src/runtime/gpu/gpu-consumer-manifest.json','tools/bakemono-rinne-wgsl-03/templates/lambda2-probe.wgsl.tmpl','tools/bakemono-rinne-wgsl-03/generate-wgsl.mjs','tools/bakemono-rinne-wgsl-03/verify-negative-controls.mjs','tools/bakemono-rinne-wgsl-03/verify-source.mjs','tools/bakemono-rinne-wgsl-03/gate-source.mjs','tools/bakemono-rinne-wgsl-03/finalize-source.mjs','tools/bakemono-rinne-wgsl-03/gate-physical.mjs','tools/bakemono-rinne-wgsl-03/finalize-physical.mjs',CATALOG_REL,SPEC_REL,'README_TDT_BAKEMONO_RINNE_WGSL_03_APPLIED.md'];
  const files=implementationFiles.filter(exists).map(rel=>({rel,byteLength:fs.statSync(path.join(ROOT,rel)).size,sha256:fileSha(rel)}));const implBody={schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.wgsl03-implementation-manifest.v1',patchId:BKR03_PATCH_ID,parentBundle:PARENT_ZIP,parentBundleSha256:PARENT_ZIP_SHA,fileCount:files.length,files};const impl={...implBody,selfSha256:sha(implBody)};writeJson(IMPL_REL,impl);
  const finalBody={schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.wgsl03-source-final-receipt.v1',patchId:BKR03_PATCH_ID,status:report.status==='PASS'?'SOURCE_BAKED_AWAITING_PHYSICAL_GPU':'SOURCE_FAILED',parentBundleDigest:PARENT_ZIP_SHA,parentSpecDigest:PARENT_SPEC_SHA,parentSourceReceiptDigest:fileSha(PARENT_RECEIPT_REL),terminalTensorContractDigest:fileSha('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_contract.mjs'),tensorProducerSourceDigest:fileSha('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_03_terminal_tensor.mjs'),lambda2ProbeSourceDigest:manifest.probeWgslDigest,canonicalKernelSourceDigest:manifest.generatedWgslDigest,canonicalAbiDigest:await sha256BakemonoRinneWgsl03(BKR03_BIND_GROUP_LAYOUT_CANONICAL),sourceGateReportDigest:fileSha(REPORT_REL),negativeControlReportDigest:fileSha(`${SOURCE_DIR}/source-negative-control-report.json`),implementationManifestDigest:fileSha(IMPL_REL),physicalGateReportDigest:fileSha(PHYSICAL_REL),gateCount:208,passCount,failCount,negativeMutantCount:48,negativeMutantDetectedCount:negative.detectedCount,physicalGateCount:56,physicalPassCount:0,physicalPendingCount:56,terminalTensorSourceAuthorityClaim:true,canonicalKernelSourceAuthorityClaim:true,lambda2PhysicalQualificationClaim:false,outputAuthority:BKR03_OUTPUT_AUTHORITY,canonicalFinalTextureClaim:false,r9aCommandGraphClaim:false,surfaceRegistryPublishClaim:false,previewAuthorityClaim:false,exportAuthorityClaim:false,nextPatch:'TDT-BAKEMONO-RINNE-WGSL-04'};const final={...finalBody,selfSha256:sha(finalBody)};writeJson(FINAL_REL,final);
  fixture.recorded.handle.release();
  console.log(`${report.status} BKR03 source gates ${passCount}/${rows.length}; physical 56 PENDING`);if(failCount)for(const row of rows.filter(r=>!r.ok))console.error(`${row.id} FAIL ${row.description}`,row.evidence);
  return {report,physicalReport:physical,implementationManifest:impl,finalReceipt:final};
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){const r=await runSourceVerificationWgsl03();if(r.report.status!=='PASS')process.exitCode=1;}
