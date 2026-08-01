import fs from 'node:fs';import path from 'node:path';
import {ROOT,ARTIFACT_DIR,PATCH_ID,PARENT_ZIP_SHA256,PARENT_SOURCE_SEAL,canonicalJson,sha256,sha256File,writeJson} from './lib.mjs';
const manifestRelative='patches/TDT_SPECTRAL_QMAP_02_CHANGED_FILE_MANIFEST.json';
const patchRelative='patches/TDT_SPECTRAL_QMAP_02_batched_stockham_2d_webgpu_fft_single_writer_butterfly_transpose_zero_intermediate_readback.diff';
const regressionRelative='artifacts/spectral-qmap-02/source-bake/TDT_SPECTRAL_QMAP_02_REGRESSION_SUMMARY.json';
const gateRelative='artifacts/spectral-qmap-02/source-bake/TDT_SPECTRAL_QMAP_02_SOURCE_GATE.json';
for(const r of [manifestRelative,patchRelative,regressionRelative,gateRelative])if(!fs.existsSync(path.join(ROOT,r)))throw new Error(`missing finalize input: ${r}`);
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,manifestRelative),'utf8'));
if(manifest.patchId!==PATCH_ID||manifest.parentZipSha256!==PARENT_ZIP_SHA256||manifest.parentSourceSeal!==PARENT_SOURCE_SEAL)throw new Error('SQ02 manifest lineage mismatch');
const gate=JSON.parse(fs.readFileSync(path.join(ROOT,gateRelative),'utf8'));
if((gate.counts?.PASS??0)!==168||(gate.counts?.DEFERRED??0)!==12||(gate.failCount??0)!==0)throw new Error('SQ02 gate count mismatch');
const files=[...manifest.files.filter(x=>x.status!=='deleted').map(x=>x.relative),manifestRelative,patchRelative].filter((x,i,a)=>a.indexOf(x)===i&&fs.existsSync(path.join(ROOT,x))).sort();
const records=files.map(relative=>({relative,byteLength:fs.statSync(path.join(ROOT,relative)).size,sha256:sha256File(relative)}));
const sourceSealSha256=sha256(canonicalJson({patchId:PATCH_ID,parentZipSha256:PARENT_ZIP_SHA256,parentSourceSeal:PARENT_SOURCE_SEAL,records,gateCounts:gate.counts}));
writeJson(path.join(ARTIFACT_DIR,'TDT_SPECTRAL_QMAP_02_SOURCE_RECEIPT.json'),{
 schemaVersion:1,patchId:PATCH_ID,state:gate.state,parentPatchId:'TDT-ANALYSIS-FIELD-TRUTH-00',parentZipSha256:PARENT_ZIP_SHA256,parentSourceSealSha256:PARENT_SOURCE_SEAL,sourceSealSha256,changedFileCount:manifest.changedFileCount,sealedFileCount:records.length,files:records,gateCounts:gate.counts,
 semanticRegistryVersion:'tdt.analysis.semantic-registry.sq02.v1',analysisFieldAuthorityId:'dadum.analysis-field-authority.aft00',spectralFftAuthorityId:'dadum.spectral-fft-authority.sq02',algorithmId:'tdt.spectral.stockham-2d-webgpu.v1',inputSemanticId:'tdt.analysis.spectral.window-spatial-complex.v1',outputSemanticId:'tdt.analysis.spectral.window-frequency-complex.v1',intermediateReadbackCount:0,cpuProductComputeClaim:false,physicalGpuClaims:false,windowsPackagedElectronClaims:false,productionPointerMutated:false
});
console.log(`PASS SQ02 source seal ${sourceSealSha256} changed=${manifest.changedFileCount} sealed=${records.length}`);
