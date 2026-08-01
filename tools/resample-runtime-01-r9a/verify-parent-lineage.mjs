import fs from 'node:fs';
import {check,json,sha256File,sourceArtifact,seal} from './lib.mjs';
import {PARENT_ZIP_SHA256} from './identity.mjs';
const r8a=json('artifacts/resample-runtime-01-r8a/source-bake/TDT_RESAMPLE_RUNTIME_01_R8A_SOURCE_FINAL_RECEIPT.json');
check(r8a.state==='RESAMPLE_RUNTIME_R8A_ACTIVE_RUNTIME_TRUTH_CLOSURE_SEALED_AWAITING_R9A_PHYSICAL_GPU','E_R9A_PARENT_STATE','R8A parent state mismatch');
check(r8a.counts?.PASS===253&&r8a.counts?.DEFERRED===8&&r8a.counts?.FAIL===0,'E_R9A_PARENT_COUNTS','R8A parent counts mismatch');
const pointers=['artifacts/runtime/TDT_EXPORT_PROMOTION_POINTER.json','artifacts/promotion/TDT_EXPORT_PROMOTION_POINTER_V2.json'];
const pointerHashes=pointers.map(path=>({path,sha256:sha256File(path)}));
check(pointerHashes.every(row=>row.sha256==='1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8'),'E_R9A_POINTER_MUTATED','Production pointer changed');
const frozen=[
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r8.wgsl',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r8.wgsl',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r8.wgsl',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r8.wgsl',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_generated_manifest_r8.json',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner_v3.mjs',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params_v4.mjs',
];
const rows=frozen.map(path=>({path,sha256:sha256File(path)}));
const report=seal({schemaVersion:1,pass:true,parentZipSha256:PARENT_ZIP_SHA256,r8aReceiptSelfSha256:r8a.selfSha256,pointerHashes,productionPointerMutated:false,localActivationPointerMutated:false,r8MathAndGeneratedShadersFrozen:true,frozenFiles:rows,downstreamReplayRequired:['R10A','R11A','R12A','R13A']});
sourceArtifact('R9A_PARENT_AND_LINEAGE_REPORT.json',report);
console.log('R9A parent and lineage PASS');
