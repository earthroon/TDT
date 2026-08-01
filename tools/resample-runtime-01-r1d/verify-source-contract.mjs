import {read,check,writeJson,sha256File} from './lib.mjs';
const files={
 spec:read('specs/TDT-RESAMPLE-RUNTIME-01-R1D_ADAPTIVE_ENGINEAUTO_WORKER_COMPATIBILITY_MIGRATION_PREVIEW_EXPORT_SHARED_SURFACE_SEAL_SPEC.md'),
 policy:read('app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_contract.mjs'),
 policyRuntime:read('app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_runtime.mjs'),
 policyShader:read('app/legacy-runtime/core/compute/qmap_webgpu/shaders/adaptive_policy_projection_r1d.wgsl'),
 compatibility:read('app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs'),
 adaptive:read('app/legacy-runtime/core/compute/downscale_webgpu/adaptive_ewa_downscale_pass.js'),
 chain:read('app/legacy-runtime/core/compute/qmap_webgpu/qmap_preprocess_adaptive_ewa_chain.js'),
 engine:read('app/legacy-runtime/modules/dk_resample/engineAuto.js'),
 worker:read('app/src/workers/pipeline.worker.js'),
 broker:read('app/src/runtime/resample/resample-worker-broker-service.ts'),
 pipeline:read('app/src/runtime/pipeline/pipeline-service.ts'),
 bridge:read('app/src/runtime/pipeline/legacy-final-surface-bridge-service.ts'),
 ledger:read('app/src/runtime/pipeline/final-surface-consumption-ledger-service.ts'),
 preview:read('app/src/runtime/preview/preview-presenter-service.ts'),
 previewTypes:read('app/src/runtime/preview/preview-presenter-types.ts'),
 exportAuthority:read('app/src/runtime/export/export-authority-service.ts'),
 exportReceipt:read('app/src/runtime/export/export-receipt.ts'),
 exportSSOT:read('app/legacy-runtime/input/export_surface_ssot.js'),
 resize:read('app/legacy-runtime/resize_export_bind.js'),
 bind:read('app/legacy-runtime/patches/pipeline_bind.js'),
 modules:read('app/src/boot/runtime-modules.ts'),
 token:read('app/src/runtime/service-token.ts'),
 ewa:read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs'),
 ewaProduct:read('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v3.wgsl'),
 ewaReference:read('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v2_r1c.wgsl'),
};
const checks=[];let n=0;const C=(pass,msg,detail=null)=>checks.push(check(pass,`RD-S${String(++n).padStart(3,'0')}`,msg,detail));
C(files.spec.includes('TDT-RESAMPLE-RUNTIME-01-R1D'),'spec identity');
C(files.policy.includes("tdt.adaptive-policy.r1d.v1"),'adaptive policy schema');
C(files.policy.includes("tdt.adaptation-field.r1d.v1"),'adaptation field schema');
C(/orientationAuthority: 'r1c-integrated-structure-tensor'/.test(files.policy),'R1C orientation authority');
C(/fixedAnisoAngleAuthority: false/.test(files.policy),'fixed angle denied');
C(/fastTextureMixAllowed: false/.test(files.policy),'fast texture mix denied');
C(/policyDigest/.test(files.policy),'policy digest');
C(/readAdaptiveGlobalsAtFacadeBoundary/.test(files.policy),'globals limited to facade');
C(/qThreshold/.test(files.policy)&&/deThreshold/.test(files.policy),'Q and DeltaE policy');
C(/maxAnisotropy/.test(files.policy)&&/tensorSigma/.test(files.policy),'tensor parameters mapped');
C(/createAdaptivePolicyR1DPipeline/.test(files.policyRuntime),'policy pipeline');
C(/buildAdaptivePolicyFieldR1D/.test(files.policyRuntime),'stage aligned policy build');
C(/rgba16float/.test(files.policyRuntime),'policy field rgba16float');
C(/queue\.onSubmittedWorkDone/.test(files.policyRuntime),'policy fence');
C(/textureStore\(policyTex/.test(files.policyShader),'policy shader writes field');
C(/tensorInfluence/.test(files.policyShader),'policy tensor influence');
C(/footprintScale/.test(files.policyShader),'policy footprint scale');
C(/executeCanonicalAdaptiveR1D/.test(files.compatibility),'canonical adaptive adapter');
C(/runDeltaKStack/.test(files.compatibility),'adapter reuses R1C facade');
C(/executedKernelId: 'tdt-ewa-aniso-r1c-v3'/.test(files.compatibility),'kernel truth');
C(/canonicalAnisotropicClaim: true/.test(files.compatibility),'canonical claim true only canonical');
C(/allowFinalPublication: true/.test(files.compatibility),'canonical publication allowed');
C(/legacy-webgl-lanczos-compat-v1/.test(files.compatibility),'legacy kernel truth');
C(/canonicalAnisotropicClaim: false/.test(files.compatibility),'legacy claim false');
C(/allowFinalPublication: false/.test(files.compatibility),'legacy publication denied');
C(/compatibilityMode === 'canonical-webgpu'/.test(files.adaptive),'adaptive canonical default path');
C(/executeCanonicalAdaptiveR1D/.test(files.adaptive),'adaptive calls canonical adapter');
C(/independentAdaptiveProductDispatch: false/.test(files.adaptive),'independent adaptive not product path');
C(/compatibilityMode: opts.compatibilityMode \|\| 'canonical-webgpu'/.test(files.chain),'adaptive chain requests canonical mode');
C(/executeCanonicalAdaptiveR1D/.test(files.engine),'EngineAuto canonical overload');
C(/createLegacyEngineAutoReceipt/.test(files.engine),'EngineAuto legacy receipt');
C(/requestedPolicy/.test(files.engine)&&/compatibilityReceipt/.test(files.engine),'requested/executed identity split');
C(/createLegacyEngineAutoReceipt\(engine, cur\)/.test(files.engine),'WebGL Lanczos truthful identity');
C(/createLegacyEngineAutoReceipt/.test(files.engine)&&/executeCanonicalAdaptiveR1D/.test(files.engine),'EngineAuto claim field');
C(!/getContext\(['\"]webgl/.test(files.worker)&&!/requestAdapter\(/.test(files.worker),'worker owns no GPU/WebGL');
C(/attach-renderer-port/.test(files.worker),'worker renderer port');
C(/worker-compatibility-bytes/.test(files.worker),'worker compatibility mode');
C(/worker-canonical-surface/.test(files.worker),'worker canonical mode');
C(/E_RESAMPLE_WORKER_ZERO_OUTPUT/.test(files.worker),'zero output rejected');
C(/resampleReceiptId/.test(files.worker)&&/resampleReceiptDigest/.test(files.worker),'worker canonical receipt required');
C(/allowFinalPublication: false/.test(files.worker),'worker compatibility cannot publish');
C(/renderer-owned-resample-worker-broker-r1d/.test(files.broker),'renderer broker authority');
C(/registerRecoveryParticipant/.test(files.broker),'broker recovery participant');
C(/E_RESAMPLE_WORKER_RUNTIME_EPOCH_STALE/.test(files.broker),'runtime epoch gate');
C(/E_RESAMPLE_WORKER_GENERATION_STALE/.test(files.broker),'generation gate');
C(/#executeCompatibilityBytes/.test(files.broker),'truthful compatibility executor');
C(/targetWidth !== request.sourceWidth/.test(files.broker),'scaled compatibility requires canonical executor');
C(/workerOwnsGpuDevice: false/.test(files.broker),'worker GPU ownership false');
C(/resampleReceiptId: string/.test(files.pipeline),'Pipeline resample receipt binding');
C(/canonicalResampleResult/.test(files.pipeline),'canonical surface evidence gate');
C(/compatibility-untracked-v1/.test(files.pipeline),'legacy continuity identity');
C(/E_SHARED_SURFACE_RECEIPT_MISMATCH/.test(files.pipeline),'Pipeline mismatch gate');
C(/compatibilityMode/.test(files.bridge),'bridge compatibility mode');
C(/E_RESAMPLE_COMPATIBILITY_FINAL_PUBLICATION_FORBIDDEN/.test(files.bridge),'compatibility bytes denied');
C(/canonicalAnisotropicClaim/.test(files.bridge),'bridge claim evidence');
C(/canonicalResampleResult/.test(files.bridge),'bridge canonical evidence');
C(/resampleReceiptId/.test(files.bridge)&&/resampleReceiptDigest/.test(files.bridge),'bridge receipt propagation');
C(/preview-export-shared-final-surface-ledger-r1d/.test(files.ledger),'shared ledger authority');
C(/FinalSurfaceSharedTuple/.test(files.ledger),'shared tuple type');
C(/sha256Hex\(canonicalJson\(tuple\)\)/.test(files.ledger),'tuple digest');
C(/consumer === 'preview' \? 'export' : 'preview'/.test(files.ledger),'opposite consumer comparison');
C(/E_SHARED_SURFACE_TUPLE_MISMATCH/.test(files.ledger),'tuple mismatch fail closed');
C(/consumptionLedger\.validateTuple/.test(files.preview),'Preview validates tuple');
C(/consumptionLedger\.record\('preview'/.test(files.preview),'Preview records consumption');
C(/sharedSurfaceTupleDigest/.test(files.previewTypes),'Preview receipt shared digest');
C(/resampleReceiptId/.test(files.previewTypes),'Preview receipt resample identity');
C(!/runDeltaKStack|executeCanonicalAdaptiveR1D/.test(files.preview),'Preview does not invoke resample');
C(/consumptionLedger\.validateTuple/.test(files.exportAuthority),'Export validates tuple');
C(/consumptionLedger\.record\('export'/.test(files.exportAuthority),'Export records consumption');
C(/E_EXPORT_FINAL_DIMENSION_MISMATCH/.test(files.exportAuthority),'Export dimension mismatch gate');
C(/sharedSurfaceTupleDigest/.test(files.exportReceipt),'Export receipt shared digest');
C(/resampleReceiptId/.test(files.exportReceipt)&&/resampleReceiptDigest/.test(files.exportReceipt),'Export receipt resample identity');
C(/authoritative-final-required/.test(files.exportSSOT),'authoritative export mode');
C(/E_EXPORT_FINAL_SURFACE_REQUIRED/.test(files.exportSSOT),'export final required');
C(/legacy-compatibility/.test(files.exportSSOT),'legacy mode explicit');
C(/targetWidth/.test(files.resize)&&/targetHeight/.test(files.resize),'UI exact target forwarded');
C(/DadumRuntimeExport/.test(files.resize),'UI delegates Runtime Export');
C(/allowFinalPublication: false/.test(files.bind),'canvas compatibility cannot publish');
C(/MessageChannel/.test(files.bind)&&/DadumResampleWorkerBroker/.test(files.bind),'compatibility worker brokered');
C(/finalSurfaceConsumptionLedger/.test(files.token),'ledger service ID');
C(/resampleWorkerBroker/.test(files.token),'worker broker service ID');
C(/FinalSurfaceConsumptionLedgerService/.test(files.modules),'ledger composition');
C(/ResampleWorkerBrokerService/.test(files.modules),'broker composition');
C(/dadum\.module\.resample-compatibility-v1/.test(files.modules),'compatibility module');
C(/dadum\.final-surface\.consumption-ledger/.test(files.modules),'ledger capability');
C(/@binding\(4\) var policyTex/.test(files.ewaProduct),'product EWA policy binding');
C(/@binding\(4\)var policyTex/.test(files.ewaReference),'reference EWA policy binding');
C(/policyTex/.test(files.ewa),'runtime policy texture bind');
C(/adaptivePolicyFieldConsumed/.test(files.ewa),'policy consumption receipt');
C(sha256File('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v3.wgsl')!==sha256File('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v2_r1c.wgsl'),'product/reference remain independent');
C(!/productionPointer|promote:pointer/.test(Object.values(files).join('\n')),'production pointer untouched');
const failed=checks.filter(x=>!x.pass);const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R1D',pass:failed.length===0,counts:{pass:checks.length-failed.length,fail:failed.length},checks};writeJson('r1d-source-contract.json',report);if(failed.length){console.error(failed);process.exit(1);}console.log(`PASS R1D source contract ${checks.length}/${checks.length}`);
