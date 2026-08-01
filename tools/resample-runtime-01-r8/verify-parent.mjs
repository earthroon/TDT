import fs from 'node:fs';import path from 'node:path';
import {ROOT,sha256File,report,capture,check,sha256Buffer} from './lib.mjs';
const frozen=[
'specs/TDT-RESAMPLE-RUNTIME-01-R7_PREVIEW_EXPORT_CANONICAL_EWA_LOWPASS_CONVERGENCE_SHARED_STAGE_PLANNER_KERNEL_IDENTITY_RESIDUAL_IDENTITY_SEPARATION_SEAL_SPEC.md',
'README_TDT_RESAMPLE_RUNTIME_01_R7_APPLIED.md',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params_v4.mjs',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_kernel_contract_v4.mjs',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_axial_contract_r5.mjs',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r6.mjs',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r6.wgsl',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r6.wgsl',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v5_r6.wgsl',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_generated_manifest_r6.json',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner_v2.mjs',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_contract_r7.mjs',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r7.mjs',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_convergence_receipt_r7.mjs'];
const parentRoot=path.join(ROOT,'tools/resample-runtime-01-r8/predecessor-parent-snapshot');const manifest=JSON.parse(fs.readFileSync(path.join(parentRoot,'snapshot-manifest.json'),'utf8'));
const byPath=new Map(manifest.files.map(x=>[x.relativePath,x.sha256]));
const checks=frozen.map(rel=>capture(rel,()=>{const expected=byPath.get(rel);check(expected,'E_R8_PARENT_SNAPSHOT_MISSING','Frozen parent file missing from snapshot',{rel});const actual=sha256File(rel);check(actual===expected,'E_R8_PARENT_ASSET_MUTATED','R7 frozen parent asset changed',{rel,expected,actual});return actual;}));
checks.push(capture('parent-zip-sha',()=>{const shaFile='/mnt/data/61_TDT_RESAMPLE_RUNTIME_01_R7_PREVIEW_EXPORT_CANONICAL_EWA_LOWPASS_CONVERGENCE_SHARED_STAGE_PLANNER_KERNEL_IDENTITY_RESIDUAL_IDENTITY_SEPARATION_BAKED_AWAITING_PHYSICAL_GPU.zip';if(!fs.existsSync(shaFile))return manifest.sourceParentZipSha256;const actual=sha256Buffer(fs.readFileSync(shaFile));check(actual===manifest.sourceParentZipSha256,'E_R8_PARENT_ZIP_MISMATCH','Parent ZIP digest mismatch',{actual,expected:manifest.sourceParentZipSha256});return actual;}));
report('TDT_RESAMPLE_RUNTIME_01_R8_PARENT_REPORT.json',checks,{parentBundle:manifest.sourceParentZip,parentBundleSha256:manifest.sourceParentZipSha256,frozenCount:frozen.length});if(checks.some(x=>!x.pass))process.exit(1);
