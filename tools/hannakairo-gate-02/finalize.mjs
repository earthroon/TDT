import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { root, outDir, canonical, sha256File } from './lib.mjs';

const PATCH_ID='TDT-HANNAKAIRO-GATE-02';
const PARENT_ZIP_SHA256='41f4cdc1feb6cace2e3390b8d5df1f8ebec8d3a30cfeaf6f4694a6dbb493bb91';
const PARENT_SOURCE_SEAL='d0538fcd7df0c25aad45bead9ff28df00793a690cda8801523939cb8c9a99b86';
const manifestRelative='patches/TDT_HANNAKAIRO_GATE_02_CHANGED_FILE_MANIFEST.json';
const patchRelative='patches/TDT_HANNAKAIRO_GATE_02_directional_gate_repair_tensor_spectral_alignment_neutral_identity.diff';
const regressionRelative='artifacts/hannakairo-gate-02/source-bake/TDT_HANNAKAIRO_GATE_02_REGRESSION_SUMMARY.json';
const gateRelative='artifacts/hannakairo-gate-02/source-bake/TDT_HANNAKAIRO_GATE_02_SOURCE_GATE.json';
for(const relative of [manifestRelative,patchRelative,regressionRelative,gateRelative]){
  if(!fs.existsSync(path.join(root,relative))) throw new Error(`E_HG02_FINALIZE_MISSING:${relative}`);
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,manifestRelative),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(root,gateRelative),'utf8'));
if(manifest.patchId!==PATCH_ID||manifest.parentZipSha256!==PARENT_ZIP_SHA256||manifest.parentSourceSeal!==PARENT_SOURCE_SEAL) throw new Error('E_HG02_FINALIZE_LINEAGE');
if(gate.counts?.PASS!==172||gate.counts?.DEFERRED!==12||gate.counts?.FAIL!==0) throw new Error('E_HG02_FINALIZE_GATE');
const files=[...manifest.files.filter((entry)=>entry.status!=='deleted'&&entry.sealed!==false).map((entry)=>entry.relative),manifestRelative,patchRelative]
  .filter((relative,index,all)=>all.indexOf(relative)===index&&fs.existsSync(path.join(root,relative))).sort();
const records=files.map((relative)=>({relative,byteLength:fs.statSync(path.join(root,relative)).size,sha256:sha256File(relative)}));
const payload={patchId:PATCH_ID,parentZipSha256:PARENT_ZIP_SHA256,parentSourceSeal:PARENT_SOURCE_SEAL,records,gateCounts:gate.counts};
const sourceSealSha256=crypto.createHash('sha256').update(canonical(payload)).digest('hex');
const receipt={schemaVersion:1,patchId:PATCH_ID,state:gate.state,parentPatchId:'TDT-HANNAKAIRO-PHASE-01',parentZipSha256:PARENT_ZIP_SHA256,parentSourceSealSha256:PARENT_SOURCE_SEAL,sourceSealSha256,changedFileCount:manifest.changedFileCount,sealedFileCount:records.length,observationalFileCount:manifest.files.filter((entry)=>entry.sealed===false).length,files:records,gateCounts:gate.counts,semanticRegistryVersion:'tdt.analysis.semantic-registry.qwave-phase-03.v1',analysisFieldAuthorityId:'dadum.analysis-field-authority.aft00',hannakairoGateAuthorityId:'dadum.hannakairo-gate-authority.hg02',producerId:'tdt.analysis.producer.hannakairo.directional-gate',inputSemanticIds:['tdt.analysis.tensor.tangent-coherence-edge.r1c.v1','tdt.analysis.spectral.window-peak-orientation.v1','tdt.analysis.hannakairo.phase-coherence.v1'],outputSemanticIds:['tdt.analysis.hannakairo.tensor-spectral-alignment.v1','tdt.analysis.hannakairo.directional-gate.v2'],queueSubmissionCount:1,intermediateReadbackCount:0,cpuProductComputeClaim:false,neutralIdentitySourceClaim:true,physicalGpuClaims:false,productionPointerMutated:false};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'TDT_HANNAKAIRO_GATE_02_SOURCE_RECEIPT.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(`PASS HG02 source seal ${sourceSealSha256} changed=${manifest.changedFileCount} sealed=${records.length}`);
