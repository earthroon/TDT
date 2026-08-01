import {check,writeJson} from './lib.mjs';
globalThis.window={DadumGPUParams:{qThresh:.4,deThresh:1.2,deSoft:.3,deK:.8}};
globalThis.self={addEventListener(){},onmessage:null};
globalThis.postMessage=()=>{};
const policyMod=await import('../../app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_contract.mjs');
const compatibility=await import('../../app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs');
const worker=await import('../../app/src/workers/pipeline.worker.js');
const exportSSOT=await import('../../app/legacy-runtime/input/export_surface_ssot.js');
const p1=await policyMod.normalizeAdaptivePolicyR1D({qThreshold:.3,anisoAngle:1.2});
const p2=await policyMod.normalizeAdaptivePolicyR1D({qThreshold:.7,anisoAngle:2.4});
const legacy=compatibility.createLegacyEngineAutoReceipt('aniso',{w:32,h:24});
const env1=worker.normalizePipelineWorkerEnvelope({cmd:'process',id:'x',runtimeEpoch:3,w:2,h:2,rgba:new Uint8Array(16),options:{}});
const env2=worker.normalizePipelineWorkerEnvelope({type:'resample-request-v1',request:{requestId:'y',runtimeEpoch:3,deviceEpoch:2,sourceWidth:8,sourceHeight:8,targetWidth:4,targetHeight:4,sourceBackend:'webgpu',requestedPolicy:'adaptive',payload:{}}});
const surface={width:2,height:2,storage:'rgba8unorm-srgb',data:new Uint8Array(16),alphaMode:'straight'};
const exact=await exportSSOT.resolveExportPayload({__runtimeExact:true,surface,surfaceId:'surface:1',sourceRevision:1,finalRevision:2,pipelineReceiptId:'pipe:1'});
let authoritativeRejected=false;try{await exportSSOT.resolveExportPayload({width:2,height:2,rgba:new Uint8Array(16),exportSourceMode:'authoritative-final-required'});}catch(e){authoritativeRejected=String(e?.message).includes('E_EXPORT_FINAL_SURFACE_REQUIRED');}
const compat=await exportSSOT.resolveExportPayload({width:2,height:2,rgba:new Uint8Array(16),exportSourceMode:'legacy-compatibility'});
const checks=[
 check(p1.schemaId==='tdt.adaptive-policy.r1d.v1','policy-schema','policy schema'),
 check(p1.orientationAuthority==='r1c-integrated-structure-tensor','policy-orientation','R1C orientation'),
 check(p1.fixedAnisoAngleAuthority===false,'policy-angle-denied','fixed angle denied'),
 check(p1.policyDigest!==p2.policyDigest,'policy-sensitivity','Q threshold changes digest'),
 check(p1.fastTextureMixAllowed===false,'policy-no-fast-mix','fast mix denied'),
 check(legacy.executedKernelId==='legacy-webgl-lanczos-compat-v1','legacy-kernel-truth','legacy kernel truthful'),
 check(legacy.canonicalAnisotropicClaim===false&&legacy.allowFinalPublication===false,'legacy-claim','legacy cannot claim/publish'),
 check(env1.mode==='worker-compatibility-bytes'&&env1.allowFinalPublication===false,'worker-legacy-envelope','legacy worker normalized'),
 check(env2.mode==='worker-canonical-surface'&&env2.allowFinalPublication===true,'worker-canonical-envelope','canonical worker normalized'),
 check(exact.authoritativeFinalSurface===true&&exact.exportSourceMode==='authoritative-final-required','export-exact','exact final accepted'),
 check(authoritativeRejected,'export-fallback-rejected','authoritative fallback rejected'),
 check(compat.exportSource==='payload-rgba','export-compat','explicit compatibility payload preserved'),
 check(typeof globalThis.self.onmessage==='function','worker-handler','worker handler installed'),
];
const failed=checks.filter(x=>!x.pass);const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R1D',pass:failed.length===0,counts:{pass:checks.length-failed.length,fail:failed.length},checks,policy1:p1,policy2:p2,legacy,env1,env2};writeJson('r1d-runtime-smoke.json',report);if(failed.length){console.error(failed);process.exit(1);}console.log(`PASS R1D runtime smoke ${checks.length}/${checks.length}`);
