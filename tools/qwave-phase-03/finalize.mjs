import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,outDir,canonical,sha256File} from './lib.mjs';

const PATCH_ID='TDT-QWAVE-PHASE-03';
const PARENT_ZIP_SHA256='4f2591268e27525fa6ad7c21397e1ebab2b2d4574588c8659bd83c1156f8f514';
const PARENT_SOURCE_SEAL='a9bb251d9b6c47794538aaf524211ab27ab6de1c5face366c01b4291426a544a';
const manifestRelative='patches/TDT_QWAVE_PHASE_03_CHANGED_FILE_MANIFEST.json';
const patchRelative='patches/TDT_QWAVE_PHASE_03_analytic_complex_source_selectable_imaginary_visual_wave_separation.diff';
const regressionRelative='artifacts/qwave-phase-03/source-bake/TDT_QWAVE_PHASE_03_REGRESSION_SUMMARY.json';
const gateRelative='artifacts/qwave-phase-03/source-bake/TDT_QWAVE_PHASE_03_SOURCE_GATE.json';
for(const relative of [manifestRelative,patchRelative,regressionRelative,gateRelative]){
  if(!fs.existsSync(path.join(root,relative))) throw new Error(`E_QP03_FINALIZE_MISSING:${relative}`);
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,manifestRelative),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(root,gateRelative),'utf8'));
if(manifest.patchId!==PATCH_ID||manifest.parentZipSha256!==PARENT_ZIP_SHA256||manifest.parentSourceSeal!==PARENT_SOURCE_SEAL) throw new Error('E_QP03_FINALIZE_LINEAGE');
if(gate.counts?.PASS!==192||gate.counts?.DEFERRED!==12||gate.counts?.FAIL!==0) throw new Error('E_QP03_FINALIZE_GATE');
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
  state:gate.state,
  parentPatchId:'TDT-HANNAKAIRO-GATE-02',
  parentZipSha256:PARENT_ZIP_SHA256,
  parentSourceSealSha256:PARENT_SOURCE_SEAL,
  sourceSealSha256,
  changedFileCount:manifest.changedFileCount,
  sealedFileCount:records.length,
  observationalFileCount:manifest.files.filter((entry)=>entry.sealed===false).length,
  files:records,
  gateCounts:gate.counts,
  semanticRegistryVersion:'tdt.analysis.semantic-registry.qwave-phase-03.v1',
  semanticRegistryDigest:'3f26cfc7fca1559f072b421ba5d54cf01171c30878fc73ced15a581f3aaa41e1',
  analysisFieldAuthorityId:'dadum.analysis-field-authority.aft00',
  qwaveAuthorityId:'dadum.qwave-phase-authority.qp03',
  producerId:'tdt.analysis.producer.qwave.analytic',
  realSemanticId:'tdt.analysis.qwave.real-delta-k-compat.v1',
  outputSemanticIds:['tdt.analysis.qwave.imaginary-component.v1','tdt.analysis.qwave.analytic-complex.v2'],
  immediatelyExecutableSourceModes:['local-anisotropy-compat','spectral-quadrature','hannakairo-defect'],
  reservedFailClosedSourceModes:['tensor-curvature','hilbert-quadrature'],
  analyticDispatchCount:2,
  queueSubmissionCount:1,
  intermediateReadbackCount:0,
  cpuProductComputeClaim:false,
  webglProductComputeClaim:false,
  canvasProductComputeClaim:false,
  visualWaveSeparated:true,
  principalRootSourceClaim:true,
  physicalGpuClaims:false,
  productionPointerMutated:false,
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'TDT_QWAVE_PHASE_03_SOURCE_RECEIPT.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(`PASS QP03 source seal ${sourceSealSha256} changed=${manifest.changedFileCount} sealed=${records.length}`);
