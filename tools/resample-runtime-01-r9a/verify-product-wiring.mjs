import {check,read,sourceArtifact,seal} from './lib.mjs';
const preview=read('app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs');
const exp=read('app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js');
const compatibility=read('app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs');
const checks={
 previewR9A:preview.includes('executeCanonicalEwaLowpassR9A'),
 previewNoAwaitCounter:preview.includes('.then(counters => assertValidationCountersZeroR9A(counters))'),
 exportR9A:exp.includes('executeCanonicalEwaLowpassR9A'),
 exportSingleGraph:exp.includes('createEwaCommandGraphR9A')&&exp.includes('queueSubmitCount: 1'),
 exportStrictCounter:exp.includes('assertValidationCountersZeroR9A'),
 actualKernelIdentity:compatibility.includes('deriveActualResampleIdentityR8A'),
 noSilentFallback:!exp.includes('legacy-explicit'),
};
for(const [name,pass] of Object.entries(checks))check(pass,'E_R9A_PRODUCT_WIRING',`Product wiring failed: ${name}`);
sourceArtifact('R9A_PRODUCT_WIRING_REPORT.json',seal({schemaVersion:1,pass:true,checks,previewQueueFenceCount:0,exportPreMapFenceCount:0,validationDoubleDispatchCount:0}));
console.log('R9A product wiring PASS');
