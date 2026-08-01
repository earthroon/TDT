import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ARTIFACT_DIR, PATCH_ID, sha256, sha256File, writeJson } from './lib.mjs';

const changedManifestRelative = 'patches/TDT_RESAMPLE_RUNTIME_01_R1D_CHANGED_FILE_MANIFEST.json';
const patchRelative = 'patches/TDT_RESAMPLE_RUNTIME_01_R1D_adaptive_engineauto_worker_compatibility_preview_export_shared_surface.diff';
const regressionRelative = 'artifacts/resample-runtime-01-r1d/source-bake/TDT_RESAMPLE_RUNTIME_01_R1D_REGRESSION_SUMMARY.json';
const changed = JSON.parse(fs.readFileSync(path.join(ROOT, changedManifestRelative), 'utf8'));
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
const gate = JSON.parse(fs.readFileSync(path.join(ARTIFACT_DIR, 'TDT_RESAMPLE_RUNTIME_01_R1D_SOURCE_GATE.json'), 'utf8'));
const sourceSeal = sha256(JSON.stringify({
  patchId: PATCH_ID,
  parentZipSha256: changed.parentZipSha256,
  records,
  counts: gate.counts,
}));
const receipt = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  state: gate.state,
  parentPatchId: 'TDT-RESAMPLE-RUNTIME-01-R1C',
  parentZipSha256: changed.parentZipSha256,
  sourceSealSha256: sourceSeal,
  changedFileCount: changed.changedFileCount,
  sealedFileCount: records.length,
  files: records,
  gateCounts: gate.counts,
  productionPointerMutated: false,
  physicalGpuClaims: false,
  windowsPackagedElectronClaims: false,
};
writeJson('TDT_RESAMPLE_RUNTIME_01_R1D_SOURCE_RECEIPT.json', receipt);
console.log(`PASS R1D source seal ${sourceSeal} changed=${changed.changedFileCount} sealed=${records.length}`);
