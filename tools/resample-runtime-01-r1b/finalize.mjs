import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ARTIFACT_DIR, PATCH_ID, sha256, sha256File, walk, writeJson } from './lib.mjs';
const files = [
  'app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner.mjs',
  'app/legacy-runtime/core/compute/qmap_webgpu/ewa_multistage_runtime_receipt.mjs',
  'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs',
  'app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs',
  'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs',
  'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v2.wgsl',
  'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v1.wgsl',
  'app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js',
  'app/legacy-runtime/modules/dk_resample/shaders/export_ewa_lowpass.wgsl',
  'app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose.wgsl',
  'app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose_linear.wgsl',
  'tools/active-graph-01/generate-runtime-asset-manifest.mjs',
  'app/src/legacy/generated-legacy-manifest.json',
  'app/src/legacy/generated-legacy-static-admission.json',
  'app/src/runtime/active-graph/generated-active-runtime-graph.json',
  'app/src/runtime/assets/generated-runtime-asset-manifest.json',
  'README_TDT_RESAMPLE_RUNTIME_01_R1B_APPLIED.md',
  'package.json',
  ...walk('tools/resample-runtime-01-r1b'),
  'tools/resample-runtime-01-r1a/verify-source-contract.mjs',
  'tools/resample-runtime-01-r1a/runtime-smoke.mjs',
  'specs/TDT-RESAMPLE-RUNTIME-01-R1B_DETERMINISTIC_MULTI_STAGE_EXPORT_EWA_SCALE_CORRECT_FOOTPRINT_COVERAGE_SPEC.md',
].filter((relative, index, all) => all.indexOf(relative) === index && fs.existsSync(path.join(ROOT, relative))).sort();
const records = files.map((relative) => ({
  relative,
  byteLength: fs.statSync(path.join(ROOT, relative)).size,
  sha256: sha256File(relative),
}));
const gate = JSON.parse(fs.readFileSync(path.join(ARTIFACT_DIR, 'TDT_RESAMPLE_RUNTIME_01_R1B_SOURCE_GATE.json'), 'utf8'));
const sourceSeal = sha256(JSON.stringify({ patchId: PATCH_ID, records, counts: gate.counts }));
const receipt = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  state: gate.state,
  sourceSealSha256: sourceSeal,
  changedFileCount: records.length,
  files: records,
  gateCounts: gate.counts,
  productionPointerMutated: false,
  physicalGpuClaims: false,
};
writeJson('TDT_RESAMPLE_RUNTIME_01_R1B_SOURCE_RECEIPT.json', receipt);
console.log(`PASS R1B source seal ${sourceSeal} files=${records.length}`);
