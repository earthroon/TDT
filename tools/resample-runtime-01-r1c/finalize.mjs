import fs from 'node:fs';import path from 'node:path';import {ROOT,ARTIFACT_DIR,PATCH_ID,sha256,sha256File,writeJson} from './lib.mjs';
const changedManifestRelative='patches/TDT_RESAMPLE_RUNTIME_01_R1C_CHANGED_FILE_MANIFEST.json';
const patchRelative='patches/TDT_RESAMPLE_RUNTIME_01_R1C_integrated_structure_tensor_eigen_coherence_anisotropic_ellipse_truth.diff';
const regressionRelative='artifacts/resample-runtime-01-r1c/source-bake/TDT_RESAMPLE_RUNTIME_01_R1C_REGRESSION_SUMMARY.json';
const changed=JSON.parse(fs.readFileSync(path.join(ROOT,changedManifestRelative),'utf8'));
const files=[...changed.files.filter(x=>x.status!=='deleted').map(x=>x.relative),changedManifestRelative,patchRelative,regressionRelative]
  .filter((r,i,a)=>a.indexOf(r)===i&&fs.existsSync(path.join(ROOT,r))).sort();
const records=files.map(relative=>({relative,byteLength:fs.statSync(path.join(ROOT,relative)).size,sha256:sha256File(relative)}));
const gate=JSON.parse(fs.readFileSync(path.join(ARTIFACT_DIR,'TDT_RESAMPLE_RUNTIME_01_R1C_SOURCE_GATE.json'),'utf8'));
const sourceSeal=sha256(JSON.stringify({patchId:PATCH_ID,parentZipSha256:changed.parentZipSha256,records,counts:gate.counts}));
const receipt={schemaVersion:1,patchId:PATCH_ID,state:gate.state,parentPatchId:'TDT-RESAMPLE-RUNTIME-01-R1B',parentZipSha256:changed.parentZipSha256,sourceSealSha256:sourceSeal,changedFileCount:changed.changedFileCount,sealedFileCount:records.length,files:records,gateCounts:gate.counts,productionPointerMutated:false,physicalGpuClaims:false};
writeJson('TDT_RESAMPLE_RUNTIME_01_R1C_SOURCE_RECEIPT.json',receipt);console.log(`PASS R1C source seal ${sourceSeal} changed=${changed.changedFileCount} sealed=${records.length}`);
