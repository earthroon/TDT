import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  ARTIFACT_DIR,
  PATCH_ID,
  PARENT_ZIP_SHA256,
  PARENT_SOURCE_SEAL,
  canonicalJson,
  sha256,
  sha256File,
  writeJson,
} from './lib.mjs';

const changedManifestRelative = 'patches/TDT_ANALYSIS_FIELD_TRUTH_00_CHANGED_FILE_MANIFEST.json';
const patchRelative = 'patches/TDT_ANALYSIS_FIELD_TRUTH_00_canonical_gpu_analysis_field_authority_semantic_identity_effective_execution_zero_cpu_compute_legacy_migration.diff';
const regressionRelative = 'artifacts/analysis-field-truth-00/source-bake/TDT_ANALYSIS_FIELD_TRUTH_00_REGRESSION_SUMMARY.json';
const gateRelative = 'artifacts/analysis-field-truth-00/source-bake/TDT_ANALYSIS_FIELD_TRUTH_00_SOURCE_GATE.json';

for (const relative of [changedManifestRelative, patchRelative, regressionRelative, gateRelative]) {
  if (!fs.existsSync(path.join(ROOT, relative))) {
    throw new Error(`missing finalize input: ${relative}`);
  }
}

const changed = JSON.parse(fs.readFileSync(path.join(ROOT, changedManifestRelative), 'utf8'));
if (changed.patchId !== PATCH_ID) throw new Error(`manifest patch mismatch: ${changed.patchId}`);
if (changed.parentZipSha256 !== PARENT_ZIP_SHA256) throw new Error('parent ZIP SHA mismatch');
if (changed.parentSourceSeal !== PARENT_SOURCE_SEAL) throw new Error('parent source seal mismatch');

const files = [
  ...changed.files.filter((entry) => entry.status !== 'deleted').map((entry) => entry.relative),
  changedManifestRelative,
  patchRelative,
  regressionRelative,
].filter((relative, index, all) => all.indexOf(relative) === index && fs.existsSync(path.join(ROOT, relative))).sort();

const records = files.map((relative) => ({
  relative,
  byteLength: fs.statSync(path.join(ROOT, relative)).size,
  sha256: sha256File(relative),
}));

const gate = JSON.parse(fs.readFileSync(path.join(ROOT, gateRelative), 'utf8'));
if ((gate.counts?.PASS ?? 0) !== 120 || (gate.counts?.DEFERRED ?? 0) !== 8 || (gate.failCount ?? 0) !== 0) {
  throw new Error('AFT00 gate count mismatch');
}

const sourceSealSha256 = sha256(canonicalJson({
  patchId: PATCH_ID,
  parentZipSha256: PARENT_ZIP_SHA256,
  parentSourceSeal: PARENT_SOURCE_SEAL,
  records,
  gateCounts: gate.counts,
}));

writeJson(path.join(ARTIFACT_DIR, 'TDT_ANALYSIS_FIELD_TRUTH_00_SOURCE_RECEIPT.json'), {
  schemaVersion: 1,
  patchId: PATCH_ID,
  state: gate.state,
  parentPatchId: 'TDT-RESAMPLE-RUNTIME-01-R2',
  parentZipSha256: PARENT_ZIP_SHA256,
  parentSourceSealSha256: PARENT_SOURCE_SEAL,
  sourceSealSha256,
  changedFileCount: changed.changedFileCount,
  sealedFileCount: records.length,
  files: records,
  gateCounts: gate.counts,
  semanticRegistryVersion: 'tdt.analysis.semantic-registry.aft00.v1',
  analysisFieldAuthorityId: 'dadum.analysis-field-authority.aft00',
  productionPointerMutated: false,
  cpuProductComputeClaim: false,
  physicalGpuClaims: false,
  fftEffectiveExecutionClaim: false,
  hannakairoTopologyEffectiveExecutionClaim: false,
  analyticQwaveEffectiveExecutionClaim: false,
  persistentAtlasEffectiveExecutionClaim: false,
  zeroIntermediateReadbackPhysicalClaim: false,
  windowsPackagedElectronClaims: false,
});

console.log(`PASS AFT00 source seal ${sourceSealSha256} changed=${changed.changedFileCount} sealed=${records.length}`);
