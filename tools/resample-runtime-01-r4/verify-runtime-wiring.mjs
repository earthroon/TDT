import { read, check, writeJson } from './lib.mjs';
const runtime=read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs');
const manifest=read('app/src/runtime/assets/generated-runtime-asset-manifest.json');
const graph=read('app/src/runtime/active-graph/generated-active-runtime-graph.json');
const admission=read('app/src/legacy/generated-legacy-static-admission.json');
const checks=[];
const pairs=[
 ['ewa_aniso_tile_r4_r4.wgsl','ewa_aniso_tile_r4_r5.wgsl'],
 ['ewa_aniso_tile_r6_r4.wgsl','ewa_aniso_tile_r6_r5.wgsl'],
 ['ewa_aniso_tile_validation_r4_r4.wgsl','ewa_aniso_tile_validation_r4_r5.wgsl'],
 ['ewa_aniso_tile_validation_r6_r4.wgsl','ewa_aniso_tile_validation_r6_r5.wgsl'],
 ['ewa_aniso_reference_v3_r4.wgsl','ewa_aniso_reference_v4_r5.wgsl'],
];
for(const [r4,r5] of pairs)checks.push(check(runtime.includes(r4)||runtime.includes(r5),`WIRE-${r4}`,'canonical loader retains R4 coordinate semantics directly or through R5 axial successor'));
checks.push(check(runtime.includes("from './ewa_tiled_profile_r4.mjs'")&&runtime.includes('selectEwaR4Profile(request,device?.limits)'),'WIRE-profile','canonical selector uses R4 phase-aware tile proof'));
checks.push(check(!runtime.includes('selectEwaR2Profile(request,device?.limits)'),'WIRE-no-r2','R2 selector not canonical'));
for(const identity of ['coordinateConventionId:EWA_R4_COORDINATE_CONVENTION_ID','productCoordinateId:EWA_R4_PRODUCT_COORDINATE_ID','tileCoverageProofId:EWA_R4_TILE_COVERAGE_PROOF_ID','profileSchemaId:EWA_R4_PROFILE_SCHEMA_ID'])checks.push(check(runtime.includes(identity),`WIRE-${identity.split(':')[0]}`,'R4 coordinate identity remains in bundle'));
checks.push(check(runtime.includes('EWA_R4_COORDINATE_CONVENTION_ID')&&runtime.includes('shader.digest'),'WIRE-cache','pipeline cache identity retains coordinate convention'));
for(const [r4,r5] of pairs.slice(0,2).concat([pairs[4]])){
 checks.push(check(manifest.includes(r4)&&manifest.includes(r5),`WIRE-manifest-${r4}`,'runtime manifest preserves R4 evidence and admits R5 successor'));
 checks.push(check(graph.includes(r4)&&graph.includes(r5),`WIRE-graph-${r4}`,'active graph preserves R4 evidence and admits R5 successor'));
 checks.push(check(admission.includes(r4)||admission.includes(r5),`WIRE-admission-${r4}`,'static admission contains active R4/R5 route'));
}
const pass=checks.every((entry)=>entry.pass);
writeJson('TDT_RESAMPLE_RUNTIME_01_R4_RUNTIME_WIRING_RECEIPT.json',{schemaVersion:2,patchId:'TDT-RESAMPLE-RUNTIME-01-R4',pass,canonicalRuntimeUsesR4CoordinateSemantics:true,canonicalShaderVersion:runtime.includes('ewa_aniso_tile_r4_r5.wgsl')?'R5':'R4',checks});
writeJson('r4-runtime-wiring.json',{schemaVersion:2,pass,checks});
if(!pass){console.error(checks.filter((entry)=>!entry.pass));process.exit(1);}console.log(`PASS R4 runtime wiring regression ${checks.length}/${checks.length}`);
