import fs from 'node:fs';import path from 'node:path';import { ROOT,read,check,writeJson,sha256File } from './lib.mjs';
const planner=read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner.mjs');
const stack=read('app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs');
const contract=read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs');
const exportJs=read('app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js');
const product=read('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v2.wgsl');
const reference=read('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v1.wgsl');
const low=read('app/legacy-runtime/modules/dk_resample/shaders/export_ewa_lowpass.wgsl');
const final=read('app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose.wgsl');
const linear=read('app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose_linear.wgsl');
const receipt=read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_multistage_runtime_receipt.mjs');
const spec=read('specs/TDT-RESAMPLE-RUNTIME-01-R1B_DETERMINISTIC_MULTI_STAGE_EXPORT_EWA_SCALE_CORRECT_FOOTPRINT_COVERAGE_SPEC.md');
const checks=[
 check(spec.includes('TDT-RESAMPLE-RUNTIME-01-R1B'),'RB01','spec identity'),
 check(/export async function runDeltaKStack/.test(stack),'RB02','DeltaK facade preserved'),
 check(/export async function downscaleRGBAWithWGSL/.test(exportJs),'RB03','Export facade preserved'),
 check(/tdt\.ewa\.multistage\.planner\.v1/.test(planner)&&/EWA_STAGE_PLANNER_VERSION = 1/.test(planner),'RB04','planner identity'),
 check(/checkedMul|ceilDiv/.test(planner),'RB05','checked integer planning'),
 check(!/Math\.log|Math\.log2|Math\.random/.test(planner),'RB06','no floating log or randomness'),
 check(/stageCount === 0/.test(stack)&&/plan\.stageCount === 0/.test(exportJs),'RB07','identity plan handled'),
 check(/targetWidth: request\.outputWidth/.test(stack)&&/targetWidth: dstW/.test(exportJs),'RB08','exact target passed'),
 check(/while \(currentWidth !== targetWidth \|\| currentHeight !== targetHeight\)/.test(planner),'RB09','monotonic planner loop'),
 check(/E_R1B_UPSCALE_NOT_ADMITTED/.test(planner)&&/E_R1B_UPSCALE_NOT_ADMITTED/.test(exportJs),'RB10','upscale rejected'),
 check(/planDigest/.test(planner)&&/profileId/.test(planner)&&/parameterDigest/.test(planner),'RB11','plan identity fields'),
 check(/EWA_STAGE_COUNT_LIMIT = 32/.test(planner),'RB12','stage count limit'),
 check(/terminalDiscreteAxis/.test(planner),'RB13','integer terminal exception explicit'),
 check(/Object\.freeze/.test(planner),'RB14','planner records frozen'),
 check(/delta-k-tiled-v2/.test(planner)&&/export-ewa-7x7-v1/.test(planner),'RB15','profiles present'),
 check(/verifyStageAgainstPlan/.test(stack)&&/verifyStageAgainstPlan/.test(exportJs),'RB16','support revalidated before dispatch'),
 check(/for \(const stage of plan\.stages\)/.test(stack),'RB17','DeltaK stage loop'),
 check(/stageIndex: stage\.stageIndex/.test(stack)&&/stageCount: stage\.stageCount/.test(stack),'RB18','DeltaK stage ABI'),
 check(/deltaKCoreExecutionCount/.test(stack)&&/runDeltaKCore/.test(stack),'RB19','DeltaK core one final execution receipt'),
 check(/normalizedOriginal/.test(product)&&/normalizedOriginal/.test(reference),'RB20','normalized tensor field mapping'),
 check(/if \(currentOwned\) destroyOwned\(currentTexture\)/.test(stack),'RB21','DeltaK intermediate disposal'),
 check(/validateEwaDeviceOwnership\(request\)/.test(stack),'RB22','per-stage device validation'),
 check(/assertEwaRequestNotCancelled/.test(stack),'RB23','DeltaK cancellation checks'),
 check(/return currentTexture|return request\.srcTex/.test(stack),'RB24','GPUTexture return preserved'),
 check(/writeTexture/.test(exportJs)&&/uploadCount: 1/.test(exportJs),'RB25','single upload contract'),
 check((exportJs.match(/mapAsync/g)||[]).length===1&&/readbackCount: 1/.test(exportJs),'RB26','single final readback'),
 check(/intermediateReadbackCount: 0/.test(exportJs),'RB27','zero intermediate readback'),
 check(/finalStage \? 'rgba8unorm' : 'rgba16float'/.test(exportJs),'RB28','format split'),
 check(/linearPipeline/.test(exportJs)&&/export_ewa_recompose_linear\.wgsl/.test(exportJs),'RB29','linear intermediate recompose'),
 check(/u32\[12\] = stage\.stageIndex/.test(exportJs)&&/u32\[13\] = stage\.stageCount/.test(exportJs),'RB30','export ABI stage offsets'),
 check(/__dadumWGSLSerial/.test(exportJs),'RB31','uniform writes serialized'),
 check(/finalArray\.length !== dstW \* dstH \* 4/.test(exportJs),'RB32','final byte length exact'),
 check(/bytesPerRowAligned/.test(exportJs),'RB33','row padding stripped'),
 check(/destroyOnce/.test(exportJs),'RB34','export disposal'),
 check(/new Uint8Array\(rgba\)/.test(exportJs),'RB35','identity returns copy'),
 check(/min\(3\.0/.test(low)&&/min\(3\.0/.test(final)&&/min\(3\.0/.test(linear),'RB36','physical lattice radius clamp'),
 check(/stageIndex:?\s*u32/.test(low)&&/stageCount:?\s*u32/.test(final)&&/abiVersion:?\s*u32/.test(linear),'RB37','WGSL stage ABI fields'),
 check(/appendEwaR1BStageReceipt/.test(stack)&&/appendEwaR1BStageReceipt/.test(exportJs),'RB38','stage receipts'),
 check(/finalizeEwaR1BChain/.test(receipt)&&/planDigest/.test(receipt),'RB39','chain receipt'),
 check(/originalSourceFallbackCount/.test(receipt)&&/canvasFallbackCount/.test(receipt)&&/webglFallbackCount/.test(receipt),'RB40','forbidden fallback telemetry'),
 check(!/drawImage|WebGL|bilinear fallback|return rgba;\s*\/\/ fallback/i.test(exportJs),'RB41','no hidden resize fallback'),
 check(fs.existsSync(path.join(ROOT,'app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose_linear.wgsl')),'RB42','new WGSL asset exists'),
 check(/export-ewa-recompose-linear-r1b/.test(read('tools/active-graph-01/generate-runtime-asset-manifest.mjs')),'RB43','WGSL asset generator sealed'),
 check(!/productionPointer|promote:pointer/.test([planner,stack,exportJs,receipt].join('\n')),'RB44','no production pointer mutation'),
];
const failed=checks.filter(x=>!x.pass);const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R1B',pass:failed.length===0,counts:{pass:checks.length-failed.length,fail:failed.length},checks,shaderDigests:{product:sha256File('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v2.wgsl'),reference:sha256File('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v1.wgsl'),lowpass:sha256File('app/legacy-runtime/modules/dk_resample/shaders/export_ewa_lowpass.wgsl'),final:sha256File('app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose.wgsl'),linear:sha256File('app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose_linear.wgsl')}};writeJson('r1b-source-contract.json',report);if(failed.length){console.error(failed);process.exit(1);}console.log(`PASS R1B source contract ${checks.length}/${checks.length}`);
