import fs from 'node:fs';
import path from 'node:path';
import { blockedReport, canonicalJson, sha256Bytes, sha256File, writeJson } from './ep03-promotion-lib.mjs';

const artifactDir = path.resolve('artifacts/promotion');
const runtimeDir = path.resolve('artifacts/runtime');
const packageReportPath = path.join(runtimeDir, 'TDT_EXPORT_PROMOTION_02_PACKAGE_CONTENT_REPORT.json');
const packageReport = fs.existsSync(packageReportPath) ? JSON.parse(fs.readFileSync(packageReportPath, 'utf8')) : null;
const runtimeManifestPath = path.join(runtimeDir, 'generated-runtime-manifest.source.json');
const runtimeManifest = fs.existsSync(runtimeManifestPath) ? JSON.parse(fs.readFileSync(runtimeManifestPath, 'utf8')) : null;
const workerManifestPath = path.resolve('app/src/runtime/workers/generated-worker-manifest.json');
const workerManifest = fs.existsSync(workerManifestPath) ? JSON.parse(fs.readFileSync(workerManifestPath, 'utf8')) : null;
const fixtureManifestPath = path.resolve('fixtures/promotion/ep03/fixture-manifest.json');
const fixtureManifest = JSON.parse(fs.readFileSync(fixtureManifestPath, 'utf8'));
const decoderMatrixPath = path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_DECODER_MATRIX_REPORT.json');
const decoderMatrix = JSON.parse(fs.readFileSync(decoderMatrixPath, 'utf8'));
const modjpegPath = path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_MODJPEG_ARTIFACT_REPORT.json');
const modjpeg = JSON.parse(fs.readFileSync(modjpegPath, 'utf8'));
const packageContentId = packageReport?.packageContentId || null;
const baseBlockers = [];
if (!packageReport || packageReport.status !== 'PASS' || !packageContentId) baseBlockers.push('packaged-electron-content-not-verified');
if (!runtimeManifest?.buildId) baseBlockers.push('runtime-build-id-missing');
if (!fixtureManifest?.corpusDigest) baseBlockers.push('fixture-corpus-missing');
if (fixtureManifest.requiredColorProfiles.some((entry) => !entry.present)) baseBlockers.push('production-icc-fixtures-missing');
if (!process.env.DADUM_EP03_PACKAGE_ROOT) baseBlockers.push('packaged-candidate-not-launched');

const launch = blockedReport('TDT_EXPORT_PROMOTION_03_CANDIDATE_LAUNCH_RECEIPT', baseBlockers, {
  packageContentId,
  rendererBuildId: runtimeManifest?.buildId || null,
  fixtureCorpusDigest: fixtureManifest.corpusDigest,
  packagedProcessObserved: false,
  sourceTreeBypassRejected: true,
  devServerRejected: true,
  launchIdentityProtocol: 'dadum-packaged-e2e-launch-v1',
});
writeJson(path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_CANDIDATE_LAUNCH_RECEIPT.json'), launch);

const save = blockedReport('TDT_EXPORT_PROMOTION_03_ELECTRON_SAVE_E2E_REPORT', [...baseBlockers, 'electron-save-e2e-not-run'], {
  saveProtocolVersion: 'dadum-electron-export-save-v1',
  savePathSelectionMode: 'e2e-preauthorized-root-v1',
  chunkBytes: 8 * 1024 * 1024,
  digestChainVerified: false,
  frameCaptureIpcUsed: false,
});
writeJson(path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_ELECTRON_SAVE_E2E_REPORT.json'), save);

const formatDefinitions = [
  ['PNG8_ROUNDTRIP', ['png8-exact-roundtrip-not-run'], 'dadum.decoder.native-raster-v1'],
  ['PNG16_ROUNDTRIP', ['png16-exact-roundtrip-not-run'], 'dadum.decoder.native-raster-v1'],
  ['WEBP_LOSSLESS_ROUNDTRIP', ['webp-vp8l-exact-roundtrip-not-run'], 'dadum.decoder.native-raster-v1'],
  ['JXL_ROUNDTRIP', ['jxl-exact-roundtrip-not-run', 'jxl-hidden-rgb-not-run'], 'dadum.decoder.jxl-independent-v1'],
  ['JPEG_VALIDATION', ['jpeg-quality-corpus-not-run', ...modjpeg.blockers], 'dadum.decoder.native-raster-v1'],
  ['PSD_RGB_ROUNDTRIP', ['psd-rgb-plane-roundtrip-not-run'], 'dadum.decoder.psd-independent-v1'],
  ['PSD_CMYK_COLOR', ['psd-cmyk-actual-lcms-not-run', 'psd-cmyk-independent-color-validation-not-run', 'production-icc-fixtures-missing'], 'dadum.decoder.psd-independent-v1'],
];
const formatReceipts = [];
for (const [name, blockers, decoderId] of formatDefinitions) {
  const reportId = `TDT_EXPORT_PROMOTION_03_${name}_REPORT`;
  const report = blockedReport(reportId, [...baseBlockers, ...decoderMatrix.blockers, ...blockers], {
    packageContentId,
    rendererBuildId: runtimeManifest?.buildId || null,
    sourceWorkerManifestDigest: workerManifest?.sourceManifestDigest || null,
    fixtureCorpusDigest: fixtureManifest.corpusDigest,
    decoderId,
    decoderIndependent: true,
    encodeReceiptDigests: [],
    saveReceiptDigests: [],
    decoderReceiptDigests: [],
  });
  const filename = `TDT_EXPORT_PROMOTION_03_${name}_REPORT.json`;
  writeJson(path.join(artifactDir, filename), report);
  formatReceipts.push({ reportId, filename, sha256: sha256File(path.join(artifactDir, filename)), status: report.status });
}

const profileResults = {
  'core-raster-v1': 'BLOCKED',
  'psd-rgb-v1': 'BLOCKED',
  'psd-cmyk-v1': 'BLOCKED',
  'full-product-v1': 'BLOCKED',
};
const crossBlockers = [...new Set([
  ...baseBlockers,
  ...decoderMatrix.blockers,
  ...modjpeg.blockers,
  'cross-format-e2e-not-run',
  'receipt-conservation-not-verified',
])];
const crossPayload = {
  schemaVersion: 1,
  patchId: 'TDT-EXPORT-PROMOTION-03',
  reportId: 'TDT_EXPORT_PROMOTION_03_CROSS_FORMAT_E2E_RECEIPT',
  status: 'BLOCKED',
  verified: false,
  packageContentId,
  rendererBuildId: runtimeManifest?.buildId || null,
  fixtureCorpusDigest: fixtureManifest.corpusDigest,
  formatReceipts,
  profileResults,
  receiptConservationVerified: false,
  blockers: crossBlockers.sort(),
};
crossPayload.receiptDigest = sha256Bytes(canonicalJson(crossPayload));
writeJson(path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_CROSS_FORMAT_E2E_RECEIPT.json'), crossPayload);

writeJson(path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_POINTER_PROMOTION_REPORT.json'), blockedReport('TDT_EXPORT_PROMOTION_03_POINTER_PROMOTION_REPORT', ['cross-format-receipt-not-pass', 'production-pointer-not-mutated'], {
  expectedPreviousPointerSha256: null,
  pointerMutationPerformed: false,
  compareAndSwapVerified: false,
}));
writeJson(path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_POST_PROMOTION_RELAUNCH_REPORT.json'), blockedReport('TDT_EXPORT_PROMOTION_03_POST_PROMOTION_RELAUNCH_REPORT', ['production-pointer-not-mutated', 'promoted-package-relaunch-not-run'], {
  promotedBuildRelaunched: false,
}));
writeJson(path.join(artifactDir, 'TDT_EXPORT_PROMOTION_03_ROLLBACK_DRILL_RECEIPT.json'), blockedReport('TDT_EXPORT_PROMOTION_03_ROLLBACK_DRILL_RECEIPT', ['no-previous-promoted-package', 'rollback-drill-not-run'], {
  rollbackUnit: 'whole-build-only',
  legacyFallbackUsed: false,
  perEncoderRollbackUsed: false,
}));
console.log(`BLOCKED EP03 runtime promotion; baseBlockers=${baseBlockers.length}; crossBlockers=${crossBlockers.length}`);
