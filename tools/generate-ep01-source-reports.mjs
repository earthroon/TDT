import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('.');
const outDir = path.join(root, 'artifacts', 'runtime');
fs.mkdirSync(outDir, { recursive: true });
const runtimeManifestPath = path.join(outDir, 'generated-runtime-manifest.source.json');
const runtimeManifest = fs.existsSync(runtimeManifestPath) ? JSON.parse(fs.readFileSync(runtimeManifestPath, 'utf8')) : {};
const buildId = String(runtimeManifest.buildId || 'unresolved-build');
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(outDir, name), JSON.stringify(value, null, 2) + '\n');
const formats = ['png', 'png16', 'webp-lossless', 'jxl', 'jpg', 'psd-rgb', 'psd-cmyk'];
const blockers = [
  'dependency-lock-not-verified-in-this-environment',
  'production-vite-build-not-verified',
  'packaged-electron-artifact-not-verified',
  'electron-cross-format-e2e-not-run',
  'independent-decoder-matrix-incomplete',
  'psd-cmyk-production-lcms-validation-incomplete',
  'jxl-independent-roundtrip-incomplete',
  'modjpeg-single-thread-rebuild-incomplete',
];
const crossFormat = {
  schemaVersion: 1,
  patchId: 'TDT-EXPORT-PROMOTION-01',
  buildId,
  stableApiId: 'dadum.runtime.export',
  stableApiVersion: 1,
  legacyFacadeState: 'RETIRED_AT_RUNTIME_ADOPTION',
  formats: formats.map((format) => ({ format, sourceAuthorityWired: true, productionVerified: false, promotionState: 'SOURCE_BAKED_UNPROMOTED' })),
  productProfiles: {
    'core-raster-v1': 'SOURCE_BAKED_UNPROMOTED',
    'psd-rgb-v1': 'SOURCE_BAKED_UNPROMOTED',
    'psd-cmyk-v1': 'BLOCKED',
    'full-product-v1': 'BLOCKED',
  },
  blockers,
  promotionEligible: false,
};
crossFormat.receiptSha256 = sha(JSON.stringify(crossFormat));
write('TDT_EXPORT_PROMOTION_01_CROSS_FORMAT_RECEIPT.json', crossFormat);
const pointer = {
  schemaVersion: 1,
  pointerId: 'dadum.export.production-pointer',
  activeBuildId: null,
  candidateBuildId: buildId,
  candidateState: 'SOURCE_BAKED_UNPROMOTED',
  rollbackUnit: 'whole-build-only',
  legacyFallbackAllowed: false,
  perEncoderRollbackAllowed: false,
  pointerMutationPerformed: false,
  promotionEligible: false,
  blockers,
};
pointer.pointerSha256 = sha(JSON.stringify(pointer));
write('TDT_EXPORT_PROMOTION_POINTER.json', pointer);
write('TDT_EXPORT_PROMOTION_01_PRODUCTION_BUILD_REPORT.json', {
  schemaVersion: 1, patchId: 'TDT-EXPORT-PROMOTION-01', buildId,
  dependencyLockVerified: false, productionBuildVerified: false,
  packagedArtifactVerified: false, electronE2eVerified: false,
  status: 'NOT_RUN_IN_SOURCE_BAKE_ENVIRONMENT', blockers,
});
write('TDT_EXPORT_PROMOTION_01_LEGACY_FACADE_REPORT.json', {
  schemaVersion: 1, patchId: 'TDT-EXPORT-PROMOTION-01',
  bootstrapState: 'REGISTERING', adoptionState: 'ADOPTED', publicTerminalState: 'RETIRED',
  runtimeCodecHostIdentity: 'export-manager-codec-host-ep01',
  publicExportCallableAfterAdoption: false,
});
write('TDT_EXPORT_PROMOTION_01_ROLLBACK_REPORT.json', {
  schemaVersion: 1, patchId: 'TDT-EXPORT-PROMOTION-01', buildId,
  rollbackUnit: 'whole-build-only', previousPromotedBuildId: null,
  rollbackExecuted: false, legacyFallbackAllowed: false,
  status: 'SOURCE_CONTRACT_WIRED_UNTESTED_IN_PACKAGED_APP',
});
console.log(`PASS EP01 source reports build=${buildId}`);
