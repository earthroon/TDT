import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PARENT = path.resolve(process.env.TDT_JXL_CODEC_PARENT_ROOT || '/mnt/data/tdt_native_decoder_01_bake');
const ART = path.join(ROOT, 'artifacts', 'runtime');
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const fileSha = (file) => sha(fs.readFileSync(file));
const canonicalize = (value) => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
    : value;
const canonical = (value) => JSON.stringify(canonicalize(value));
const write = (name, value) => {
  fs.mkdirSync(ART, { recursive: true });
  fs.writeFileSync(path.join(ART, name), `${JSON.stringify(value, null, 2)}\n`);
};
const seal = (value) => ({ ...value, selfDigest: sha(canonical(value)) });
const excluded = (rel) => rel === 'artifacts'
  || rel.startsWith('artifacts/')
  || rel === 'patches'
  || rel.startsWith('patches/')
  || rel.startsWith('README_TDT_JXL_CODEC_01_');
function walk(root, dir = root, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(dir, entry.name);
    const rel = path.relative(root, file).replaceAll(path.sep, '/');
    if (excluded(rel)) continue;
    if (entry.isDirectory()) walk(root, file, out);
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

const currentFiles = walk(ROOT);
const parentFiles = walk(PARENT);
const changedSourceRecords = [];
for (const rel of [...new Set([...currentFiles, ...parentFiles])].sort()) {
  const before = path.join(PARENT, rel);
  const after = path.join(ROOT, rel);
  const beforePresent = fs.existsSync(before);
  const afterPresent = fs.existsSync(after);
  const beforeSha256 = beforePresent ? fileSha(before) : null;
  const afterSha256 = afterPresent ? fileSha(after) : null;
  if (beforeSha256 !== afterSha256) {
    changedSourceRecords.push({
      path: rel,
      parentSha256: beforeSha256,
      currentSha256: afterSha256,
      change: !beforePresent ? 'added' : !afterPresent ? 'removed' : 'modified',
    });
  }
}

const runtimePath = path.join(ART, 'generated-runtime-manifest.source.json');
const encoderManifestPath = path.join(ROOT, 'app/src/runtime/workers/generated-worker-manifest.json');
const decoderManifestPath = path.join(ROOT, 'app/src/runtime/workers/generated-jxl-independent-decoder-manifest.json');
const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
const encoderManifest = JSON.parse(fs.readFileSync(encoderManifestPath, 'utf8'));
const decoderManifest = JSON.parse(fs.readFileSync(decoderManifestPath, 'utf8'));
const gate = JSON.parse(fs.readFileSync(path.join(ART, 'TDT_JXL_CODEC_01_GATE_REPORT.json'), 'utf8'));
const tests = JSON.parse(fs.readFileSync(path.join(ART, 'TDT_JXL_CODEC_01_RUNTIME_TEST_REPORT.json'), 'utf8'));
const stableReport = fs.readFileSync(path.join(ART, 'TDT_JXL_CODEC_01_PARENT_REGRESSION_VERIFY.txt'), 'utf8');
const productionAttempt = fs.readFileSync(path.join(ART, 'TDT_JXL_CODEC_01_PRODUCTION_BUILD_ATTEMPT.txt'), 'utf8');
const strictLogPath = path.join(ART, 'TDT_JXL_CODEC_01_STRICT_TYPESCRIPT_VERIFY.txt');
const encoderWasm = path.join(ROOT, 'app/legacy-runtime/encoders/jxl_bindings.wasm');
const encoderGlue = path.join(ROOT, 'app/legacy-runtime/encoders/jxl_bindings.mjs');
const decoderWasm = path.join(ROOT, 'app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_wgpu_bridge_bg.wasm');
const decoderGlue = path.join(ROOT, 'app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_wgpu_bridge.js');
const spec = path.join(ROOT, 'specs/TDT-JXL-CODEC-01_JXL_ENCODE_DECODE_RUNTIME_CLOSURE_ABI_INDEPENDENT_RGBA8_HIDDEN_RGB_CONTAINER_METADATA_PTHREAD_GENERATION_TRUTH_SPEC.md');
const blockers = [
  'dependency-lock-not-promoted',
  'production-vite-emit-not-run',
  'packaged-electron-jxl-e2e-not-run',
  'independent-jxl-roundtrip-corpus-not-run',
  'pthread-generation-closure-not-measured-in-production',
];
const payload = {
  schemaVersion: 1,
  patchId: 'TDT-JXL-CODEC-01',
  status: 'SOURCE_BAKED_UNPROMOTED',
  evidenceState: 'JXL_CODEC_SOURCE_ADOPTED',
  buildId: runtime.buildId,
  buildAuthorityDigest: runtime.buildAuthorityDigest,
  sourceRuntimeManifestDigest: fileSha(runtimePath),
  encoderWorkerManifestDigest: encoderManifest.sourceManifestDigest,
  independentDecoderManifestDigest: decoderManifest.sourceManifestDigest,
  specSha256: fileSha(spec),
  encoderWasmSha256: fileSha(encoderWasm),
  encoderGlueSha256: fileSha(encoderGlue),
  decoderWasmSha256: fileSha(decoderWasm),
  decoderGlueSha256: fileSha(decoderGlue),
  abiSymbol: 'jxl_encode_qmap_ex',
  canonicalPthreadPoolSize: 4,
  exactDecodedSurfaceId: 'dadum.jxl-decoded-rgba8-exact-v1',
  sourceGatePassed: gate.passed === gate.total && gate.total === 108,
  sourceGateCount: gate.total,
  runtimePolicyPassed: tests.passed === tests.total && tests.total === 168,
  runtimePolicyCount: tests.total,
  strictTypeScriptVerified: fs.existsSync(strictLogPath) && fs.readFileSync(strictLogPath, 'utf8').includes('PASS'),
  parentRegressionVerified: stableReport.includes('PASS parent regression closure'),
  stableErrorRegistryVerified: stableReport.includes('466/466'),
  productionBuildFailClosed: productionAttempt.includes('rootExact=false') && productionAttempt.includes('EXIT_CODE=1'),
  productionViteExecuted: false,
  independentRoundtripExecuted: false,
  hiddenRgbCorpusExecuted: false,
  pthreadGenerationClosureMeasuredInProduction: false,
  productionPromoted: false,
  blockers,
  changedSourceRecords,
};
const sourceBakeSeal = sha(canonical(payload));
write('TDT_JXL_CODEC_01_SOURCE_BAKE_SEAL_PAYLOAD.json', { ...payload, sourceBakeSeal });

const fixBase = {
  schemaVersion: 1,
  patchId: 'TDT-JXL-CODEC-01',
  status: payload.status,
  evidenceState: payload.evidenceState,
  buildId: payload.buildId,
  buildAuthorityDigest: payload.buildAuthorityDigest,
  sourceBakeSeal,
  encoderWorkerManifestDigest: payload.encoderWorkerManifestDigest,
  independentDecoderManifestDigest: payload.independentDecoderManifestDigest,
  encoderWasmSha256: payload.encoderWasmSha256,
  decoderWasmSha256: payload.decoderWasmSha256,
  sourceAdopted: true,
  abiPreserved: true,
  canonicalPthreadPoolSize: 4,
  independentDecoderSourceImplemented: true,
  exactRgba8SourceContract: true,
  hiddenRgbComparisonSourceContract: true,
  containerMetadataVerifierSourceContract: true,
  sourceGatePassed: payload.sourceGatePassed,
  sourceGateCount: payload.sourceGateCount,
  runtimePolicyPassed: payload.runtimePolicyPassed,
  runtimePolicyCount: payload.runtimePolicyCount,
  strictTypeScriptVerified: payload.strictTypeScriptVerified,
  parentRegressionVerified: payload.parentRegressionVerified,
  productionBuildFailClosed: payload.productionBuildFailClosed,
  productionEligible: false,
  productionPromoted: false,
  blockers,
};
write('TDT_JXL_CODEC_01_FIX_RECEIPT.json', seal(fixBase));

const promotionBase = {
  schemaVersion: 1,
  patchId: 'TDT-JXL-CODEC-01',
  status: payload.status,
  evidenceState: payload.evidenceState,
  buildId: payload.buildId,
  buildAuthorityDigest: payload.buildAuthorityDigest,
  sourceBakeSeal,
  promoted: false,
  jxlCodecPromoted: false,
  independentDecodeVerified: false,
  hiddenRgbVerified: false,
  pthreadClosureVerified: false,
  metadataVerified: false,
  encodedOutputIdentityVerified: false,
  decodedPixelIdentityVerified: false,
  productionEligible: false,
  blockers,
};
write('TDT_JXL_CODEC_01_PROMOTION_RECEIPT.json', seal(promotionBase));

console.log(JSON.stringify({
  buildId: payload.buildId,
  buildAuthorityDigest: payload.buildAuthorityDigest,
  encoderWorkerManifestDigest: payload.encoderWorkerManifestDigest,
  independentDecoderManifestDigest: payload.independentDecoderManifestDigest,
  sourceBakeSeal,
  changedSourceCount: changedSourceRecords.length,
}, null, 2));
