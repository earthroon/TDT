import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,outDir,canonical,sha256File} from './lib.mjs';

const PATCH_ID='TDT-GPU-TILE-ATLAS-01';
const PARENT_ZIP_SHA256='9b3800e6103fd783584bad673f50145f626544c5ff535178972468fa0b3efa83';
const PARENT_SOURCE_SEAL='005206125334e903ff3ab9dff5d8bc76010fda6a7e8177ff21515298331e1f58';
const manifestRelative='patches/TDT_GPU_TILE_ATLAS_01_CHANGED_FILE_MANIFEST.json';
const patchRelative='patches/TDT_GPU_TILE_ATLAS_01_analysis_window_persistent_tile_atlas_page_table_generation_fence_aware_residency.diff';
const regressionRelative='artifacts/gpu-tile-atlas-01/source-bake/TDT_GPU_TILE_ATLAS_01_REGRESSION_SUMMARY.json';
const gateRelative='artifacts/gpu-tile-atlas-01/source-bake/TDT_GPU_TILE_ATLAS_01_SOURCE_GATE.json';
for(const relative of [manifestRelative,patchRelative,regressionRelative,gateRelative]){
  if(!fs.existsSync(path.join(root,relative))) throw new Error(`E_GTA01_FINALIZE_MISSING:${relative}`);
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,manifestRelative),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(root,gateRelative),'utf8'));
if(manifest.patchId!==PATCH_ID||manifest.parentZipSha256!==PARENT_ZIP_SHA256||manifest.parentSourceSeal!==PARENT_SOURCE_SEAL) throw new Error('E_GTA01_FINALIZE_LINEAGE');
if(gate.counts?.PASS!==212||gate.counts?.DEFERRED!==12||gate.counts?.FAIL!==0) throw new Error('E_GTA01_FINALIZE_GATE');
const files=[
  ...manifest.files.filter((entry)=>entry.status!=='deleted'&&entry.sealed!==false).map((entry)=>entry.relative),
  manifestRelative,
  patchRelative,
].filter((relative,index,all)=>all.indexOf(relative)===index&&fs.existsSync(path.join(root,relative))).sort();
const records=files.map((relative)=>({relative,byteLength:fs.statSync(path.join(root,relative)).size,sha256:sha256File(relative)}));
const payload={patchId:PATCH_ID,parentZipSha256:PARENT_ZIP_SHA256,parentSourceSeal:PARENT_SOURCE_SEAL,records,gateCounts:gate.counts};
const sourceSealSha256=crypto.createHash('sha256').update(canonical(payload)).digest('hex');
const receipt={
  schemaVersion:1,
  patchId:PATCH_ID,
  state:'GPU_TILE_ATLAS_01_SOURCE_BAKED_AWAITING_PACKAGED_GPU',
  parentPatchId:'TDT-QWAVE-PHASE-03',
  parentZipSha256:PARENT_ZIP_SHA256,
  parentSourceSealSha256:PARENT_SOURCE_SEAL,
  sourceSealSha256,
  changedFileCount:manifest.changedFileCount,
  sealedFileCount:records.length,
  observationalFileCount:manifest.files.filter((entry)=>entry.sealed===false).length,
  files:records,
  gateCounts:gate.counts,
  semanticRegistryVersion:'tdt.analysis.semantic-registry.gpu-tile-atlas-01.v1',
  semanticRegistryDigest:'65a3b14f73c1d4912f3f04cf67a9be7bce9fcc953e36c206abcfec458a6bf96d',
  producerInventoryDigest:'98686a73d7309ef3a610af493da2e833b4c506eae47a7f4bf8a1b23c871a6619',
  analysisFieldAuthorityId:'dadum.analysis-field-authority.aft00',
  tileAtlasAuthorityId:'dadum.gpu-tile-atlas-authority.gta01',
  surfaceRegistryAuthorityModel:'canonical-surface-registry-sl01',
  gpuAuthorityId:'dadum.gpu.authority.v1',
  producerId:'tdt.analysis.producer.tile-atlas.materializer',
  poolId:'tdt.gpu.tile-atlas.pool.complex-f32-window.v1',
  payloadSemanticId:'tdt.analysis.spectral.window-spatial-complex.v1',
  pageEntryBytes:48,
  generationAxes:['deviceEpoch','atlasEpoch','pageTableGeneration','virtualGeneration','slotGeneration','pageGeneration'],
  cpuShadowPageTableSsot:true,
  gpuPageTableExecutionMirror:true,
  atomicWriteFenceCommit:true,
  fenceAwareReadPins:true,
  deterministicEviction:true,
  deviceLossEmptyRebuild:true,
  intermediateReadbackCount:0,
  cpuProductComputeClaim:false,
  webglProductComputeClaim:false,
  canvasProductComputeClaim:false,
  physicalGpuClaims:false,
  productionPointerMutated:false,
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'TDT_GPU_TILE_ATLAS_01_SOURCE_RECEIPT.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(`PASS GTA01 source seal ${sourceSealSha256} changed=${manifest.changedFileCount} sealed=${records.length}`);
