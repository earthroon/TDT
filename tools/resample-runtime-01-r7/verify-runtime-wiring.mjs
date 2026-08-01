import {read,report,capture,check} from './lib.mjs';
const shared=read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r7.mjs');
const preview=read('app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs');
const exp=read('app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js');
const checks=[
 capture('shared-single-loop',()=>check((shared.match(/for \(const stage of plan\.stages\)/g)||[]).length===1,'E_R7_SHARED_LOOP_COUNT','Shared runtime must own one canonical stage loop')),
 capture('preview-delegates',()=>check(/executeCanonicalEwaLowpassR7/.test(preview),'E_R7_PREVIEW_NOT_DELEGATED','Preview does not delegate')),
 capture('export-delegates',()=>check(/executeCanonicalEwaLowpassR7/.test(exp),'E_R7_EXPORT_NOT_DELEGATED','Export does not delegate')),
 capture('r6-dispatch',()=>check(/dispatchEWAAniso/.test(shared),'E_R7_R6_DISPATCH_MISSING','Shared runtime does not use R6 dispatcher')),
 capture('axial-only',()=>check(/axialFieldTexture/.test(shared)&&/EWA_R5_TENSOR_FIELD_MODE/.test(shared),'E_R7_AXIAL_BINDING_MISSING','Shared runtime lacks R5 axial binding')),
 capture('rgba16-stages',()=>check(/format: 'rgba16float'/.test(shared),'E_R7_STAGE_FORMAT_WRONG','Canonical stage is not rgba16float')),
 capture('no-role-pixel-branch',()=>check(!/consumerEnvelope\s*===/.test(shared),'E_R7_ROLE_PIXEL_BRANCH','Shared pixel path branches on caller role')),
 capture('no-legacy-export-fetch',()=>check(!/export_ewa_lowpass\.wgsl|export_ewa_recompose/.test(exp),'E_R7_LEGACY_EXPORT_SHADER_ACTIVE','Export still fetches legacy lowpass/recompose shader')),
 capture('no-filtering-sampler',()=>check(!/createSampler|minFilter|textureSampleLevel/.test(shared+exp),'E_R7_FILTERED_LOWPASS_ACTIVE','Canonical lowpass uses filtering sampler')),
 capture('intermediate-readback-zero',()=>check(!/mapAsync|copyTextureToBuffer/.test(shared),'E_R7_INTERMEDIATE_READBACK_FORBIDDEN','Shared lowpass contains readback')),
];
report('TDT_RESAMPLE_RUNTIME_01_R7_RUNTIME_WIRING_REPORT.json',checks,{sharedRuntime:'tdt.ewa.canonical-lowpass-runtime.r7.v1'});if(checks.some(x=>!x.pass))process.exit(1);
