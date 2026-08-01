import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ARTIFACT_DIR, PATCH_ID, PARENT_ZIP_SHA256, PARENT_SOURCE_SEAL, canonicalJson, sha256, sha256File, writeJson } from './lib.mjs';

const manifestRelative = 'patches/TDT_HANNAKAIRO_PHASE_01_CHANGED_FILE_MANIFEST.json';
const patchRelative = 'patches/TDT_HANNAKAIRO_PHASE_01_axial_double_angle_wrapped_circulation_winding_defect_gpu_truth.diff';
const regressionRelative = 'artifacts/hannakairo-phase-01/source-bake/TDT_HANNAKAIRO_PHASE_01_REGRESSION_SUMMARY.json';
const gateRelative = 'artifacts/hannakairo-phase-01/source-bake/TDT_HANNAKAIRO_PHASE_01_SOURCE_GATE.json';
for (const relative of [manifestRelative, patchRelative, regressionRelative, gateRelative]) {
  if (!fs.existsSync(path.join(ROOT, relative))) throw new Error(`missing ${relative}`);
}
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, manifestRelative), 'utf8'));
const gate = JSON.parse(fs.readFileSync(path.join(ROOT, gateRelative), 'utf8'));
if (manifest.patchId !== PATCH_ID || manifest.parentZipSha256 !== PARENT_ZIP_SHA256 || manifest.parentSourceSeal !== PARENT_SOURCE_SEAL) throw new Error('lineage mismatch');
if (gate.counts.PASS !== 184 || gate.counts.DEFERRED !== 12 || gate.failCount !== 0) throw new Error('gate mismatch');
const sealedFiles = manifest.files
  .filter((entry) => entry.status !== 'deleted' && entry.sealed !== false)
  .map((entry) => entry.relative);
const files = [...sealedFiles, manifestRelative, patchRelative]
  .filter((relative, index, all) => all.indexOf(relative) === index && fs.existsSync(path.join(ROOT, relative)))
  .sort();
const records = files.map((relative) => ({ relative, byteLength: fs.statSync(path.join(ROOT, relative)).size, sha256: sha256File(relative) }));
const sourceSealSha256 = sha256(canonicalJson({ patchId: PATCH_ID, parentZipSha256: PARENT_ZIP_SHA256, parentSourceSeal: PARENT_SOURCE_SEAL, records, gateCounts: gate.counts }));
writeJson(path.join(ARTIFACT_DIR, 'TDT_HANNAKAIRO_PHASE_01_SOURCE_RECEIPT.json'), {
  schemaVersion: 1,
  patchId: PATCH_ID,
  state: gate.state,
  parentPatchId: 'TDT-SPECTRAL-QMAP-03',
  parentZipSha256: PARENT_ZIP_SHA256,
  parentSourceSealSha256: PARENT_SOURCE_SEAL,
  sourceSealSha256,
  changedFileCount: manifest.changedFileCount,
  sealedFileCount: records.length,
  observationalFileCount: manifest.files.filter((entry) => entry.sealed === false).length,
  files: records,
  gateCounts: gate.counts,
  semanticRegistryVersion: 'tdt.analysis.semantic-registry.hannakairo-phase-01.v1',
  analysisFieldAuthorityId: 'dadum.analysis-field-authority.aft00',
  hannakairoPhaseAuthorityId: 'dadum.hannakairo-phase-authority.hp01',
  inputSemanticId: 'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1',
  outputSemanticIds: [
    'tdt.analysis.hannakairo.axial-order.v1',
    'tdt.analysis.hannakairo.phase-coherence.v1',
    'tdt.analysis.hannakairo.winding-defect.v1',
  ],
  r1cTensorRecomputed: false,
  intermediateReadbackCount: 0,
  cpuProductComputeClaim: false,
  physicalGpuClaims: false,
  productionPointerMutated: false,
});
console.log(`PASS HP01 source seal ${sourceSealSha256} changed=${manifest.changedFileCount} sealed=${records.length}`);
