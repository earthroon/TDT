import fs from 'node:fs';
import path from 'node:path';
import { canonicalJson, createSourceCandidatePointer, sha256Bytes, sha256File, writeJson } from './ep03-promotion-lib.mjs';
import { walkFiles } from './runtime-manifest-lib.mjs';

const runtimeDir = path.resolve('artifacts/runtime');
const promotionDir = path.resolve('artifacts/promotion');
const manifestPath = path.join(runtimeDir, 'generated-runtime-manifest.source.json');
if (!fs.existsSync(manifestPath)) throw new Error('source runtime manifest missing');
const runtime = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const previousPointerPath = path.join(runtimeDir, 'TDT_EXPORT_PROMOTION_POINTER.json');
const previousPointer = fs.existsSync(previousPointerPath) ? JSON.parse(fs.readFileSync(previousPointerPath, 'utf8')) : null;
const lockReportPath = path.join(runtimeDir, 'TDT_EXPORT_PROMOTION_02_DEPENDENCY_LOCK_REPORT.json');
const packageReportPath = path.join(runtimeDir, 'TDT_EXPORT_PROMOTION_02_PACKAGE_CONTENT_REPORT.json');
const lockReport = fs.existsSync(lockReportPath) ? JSON.parse(fs.readFileSync(lockReportPath, 'utf8')) : null;
const packageReport = fs.existsSync(packageReportPath) ? JSON.parse(fs.readFileSync(packageReportPath, 'utf8')) : null;
const decoderReport = JSON.parse(fs.readFileSync(path.join(promotionDir, 'TDT_EXPORT_PROMOTION_03_DECODER_MATRIX_REPORT.json'), 'utf8'));
const modjpegReport = JSON.parse(fs.readFileSync(path.join(promotionDir, 'TDT_EXPORT_PROMOTION_03_MODJPEG_ARTIFACT_REPORT.json'), 'utf8'));
const crossReceipt = JSON.parse(fs.readFileSync(path.join(promotionDir, 'TDT_EXPORT_PROMOTION_03_CROSS_FORMAT_E2E_RECEIPT.json'), 'utf8'));

const blockers = [...new Set([
  ...(lockReport?.dependencyLockVerified ? [] : ['dependency-lock-not-verified']),
  ...(packageReport?.status === 'PASS' ? [] : ['packaged-electron-content-not-verified']),
  ...decoderReport.blockers,
  ...modjpegReport.blockers,
  ...crossReceipt.blockers,
  'production-pointer-not-mutated',
  'rollback-drill-not-run',
])].sort();

const pointer = createSourceCandidatePointer({
  previousPointer,
  candidateBuildId: runtime.buildId,
  candidateProfileId: 'full-product-v1',
  blockers,
});
writeJson(previousPointerPath, pointer);
writeJson(path.join(promotionDir, 'TDT_EXPORT_PROMOTION_POINTER_V2.json'), pointer);

const sourceFiles = [
  ...walkFiles(path.resolve('app/src')),
  ...walkFiles(path.resolve('app/legacy-runtime')),
  ...walkFiles(path.resolve('tools')).filter((file) => /(?:\.mjs|\.json)$/.test(file)),
  ...walkFiles(path.resolve('fixtures/promotion/ep03')),
  path.resolve('electron.mjs'), path.resolve('preload.cjs'), path.resolve('package.json'), path.resolve('package-lock.json'), path.resolve('vite.config.ts'),
].filter((file, index, all) => fs.existsSync(file) && all.indexOf(file) === index);
const records = sourceFiles.map((file) => ({ path: path.relative(process.cwd(), file).replaceAll(path.sep, '/'), sha256: sha256File(file) })).sort((a, b) => a.path.localeCompare(b.path));
const reportFiles = fs.readdirSync(promotionDir)
  .filter((name) => name.endsWith('.json') && name !== 'TDT_EXPORT_PROMOTION_03_FIX_RECEIPT.json')
  .sort()
  .map((name) => ({ name, sha256: sha256File(path.join(promotionDir, name)) }));
const sealPayload = {
  schemaVersion: 1,
  patchId: 'TDT-EXPORT-PROMOTION-03',
  status: 'SOURCE_BAKED_UNPROMOTED',
  buildId: runtime.buildId,
  sourceRuntimeManifestDigest: runtime.selfDigest,
  sourceWorkerManifestDigest: JSON.parse(fs.readFileSync(path.resolve('app/src/runtime/workers/generated-worker-manifest.json'), 'utf8')).sourceManifestDigest,
  fixtureCorpusDigest: JSON.parse(fs.readFileSync('fixtures/promotion/ep03/fixture-manifest.json', 'utf8')).corpusDigest,
  pointerSha256: pointer.pointerSha256,
  records,
  reports: reportFiles,
};
sealPayload.sourceBakeSeal = sha256Bytes(canonicalJson(sealPayload));
writeJson(path.join(runtimeDir, 'TDT_EXPORT_PROMOTION_03_SOURCE_BAKE_SEAL_PAYLOAD.json'), sealPayload);
const fix = {
  schemaVersion: 1,
  patchId: 'TDT-EXPORT-PROMOTION-03',
  status: 'SOURCE_BAKED_UNPROMOTED',
  buildId: runtime.buildId,
  sourceBakeSeal: sealPayload.sourceBakeSeal,
  candidateReleaseProfileId: 'full-product-v1',
  packagedCandidateLaunchVerified: false,
  electronSaveE2EVerified: false,
  independentDecoderMatrixVerified: false,
  jxlExactRoundtripVerified: false,
  modjpegCanonicalArtifactVerified: modjpegReport.verified === true,
  psdCmykColorValidationVerified: false,
  crossFormatReceiptVerified: false,
  productionPointerMutationPerformed: false,
  promotedBuildRelaunchVerified: false,
  rollbackDrillVerified: false,
  productionPromoted: false,
  blockers,
};
writeJson(path.join(runtimeDir, 'TDT_EXPORT_PROMOTION_03_FIX_RECEIPT.json'), fix);
writeJson(path.join(promotionDir, 'TDT_EXPORT_PROMOTION_03_FIX_RECEIPT.json'), fix);
writeJson(path.join(runtimeDir, 'TDT_EXPORT_PROMOTION_03_SOURCE_STATUS_REPORT.json'), {
  schemaVersion: 1,
  patchId: 'TDT-EXPORT-PROMOTION-03',
  status: 'SOURCE_BAKED_UNPROMOTED',
  buildId: runtime.buildId,
  pointerSha256: pointer.pointerSha256,
  profileResults: crossReceipt.profileResults,
  blockerCount: blockers.length,
  blockers,
});
console.log(`EP03_BUILD_ID=${runtime.buildId}`);
console.log(`EP03_SOURCE_BAKE_SEAL=${sealPayload.sourceBakeSeal}`);
console.log(`EP03_POINTER_SHA256=${pointer.pointerSha256}`);
