import crypto from 'node:crypto';
import fs from 'node:fs';

const failures = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const assert = (condition, message) => { if (!condition) failures.push(message); };

const manifest = json('app/src/runtime/workers/generated-worker-manifest.json');
const generated = read('app/src/runtime/workers/generated-worker-manifest.ts');
const types = read('app/src/runtime/workers/encoder-worker-types.ts');
const broker = read('app/src/runtime/workers/encoder-worker-broker-service.ts');
const manager = read('app/legacy-runtime/export_manager.js');
const webpHandler = read('app/legacy-runtime/worker-codecs/webp-lossless-handler.js');
const webpApi = read('app/legacy-runtime/encoders/webp_api.js');
const pngEntry = read('app/src/runtime/workers/entries/png-family.worker.ts');
const pngHandler = read('app/legacy-runtime/worker-codecs/png-family-handler.js');
const pngBridge = read('app/legacy-runtime/encoders/png_family_lode_bridge.mjs');
const registry = read('app/src/runtime/codecs/encoder-registry-service.ts');
const verifier = read('app/src/runtime/codecs/codec-promotion-verifiers.ts');
const exporter = read('app/src/runtime/export/export-authority-service.ts');
const receipt = read('app/src/runtime/export/export-receipt.ts');
const stable = read('app/src/boot/stable-error.ts');
const isolation = json('artifacts/runtime/TDT_EXPORT_WORKER_03_MAIN_THREAD_ISOLATION_REPORT.json');
const roundtrip = json('artifacts/runtime/TDT_EXPORT_WORKER_03_PIXEL_ROUNDTRIP_REPORT.json');
const promotion = json('artifacts/runtime/TDT_EXPORT_WORKER_03_CODEC_PROMOTION_RECEIPT.json');
const corpus = json('artifacts/runtime/ew03-corpus/manifest.json');

// 01 Canonical Worker identity.
const pngWorker = manifest.workers.find((worker) => worker.workerId === 'dadum.worker.encoder.png-family-v1');
assert(!!pngWorker, 'canonical PNG family Worker descriptor missing');
assert(!manifest.workers.some((worker) => worker.workerId === 'dadum.worker.encoder.png16-v1'), 'legacy PNG16 Worker descriptor remains');

// 02 PNG family ownership.
assert(pngWorker?.ownerRuntimeEncoderIds?.includes('dadum.encoder.png.v1'), 'PNG8 ownership missing');
assert(pngWorker?.ownerRuntimeEncoderIds?.includes('dadum.encoder.png16.v1'), 'PNG16 ownership missing');

// 03 Operation set.
for (const operation of ['encode.png8', 'encode.png16']) {
  assert(pngEntry.includes(`'${operation}'`) && broker.includes(`'${operation}'`), `PNG family operation missing: ${operation}`);
}

// 04 Main-thread PNG encoder reachability zero in active ExportManager.
assert(!manager.includes('UPNG.encode'), 'active ExportManager still calls UPNG.encode');
assert(manager.includes("workerId: 'dadum.worker.encoder.png-family-v1'"), 'PNG family Broker binding missing');

// 05 Main-thread WebP lossless zero.
assert(manager.includes("operation: 'encode.webp-lossless'") && !manager.includes('encodeRGBAtoWebP('), 'WebP lossless bypasses Broker');

// 06 Canvas fallback zero for canonical lossless path.
assert(webpHandler.includes('allowCanvasFallback: false'), 'canonical WebP Worker does not forbid Canvas fallback');
assert(webpApi.includes('const allowFallback = opts.allowCanvasFallback === true'), 'WebP API fallback is not opt-in only');

// 07 WebP option exactness.
for (const token of ['lossless: true', 'nearLossless: 100', 'exactTransparentRgb: true']) {
  assert(manager.includes(token) && webpHandler.includes(token), `WebP exact option missing: ${token}`);
}

// 08 WebP VP8L verifier presence.
assert(webpHandler.includes("chunks.includes('VP8L')") && verifier.includes("chunkTypes.includes('VP8L')"), 'VP8L structural verifier missing');

// 09 Transparent RGB fixture.
assert(corpus.requiredCases.includes('webp-transparent-rgb-exact'), 'transparent RGB corpus case missing');
assert(fs.existsSync('artifacts/runtime/ew03-corpus/webp-transparent-rgb-rgba8.bin'), 'transparent RGB fixture file missing');

// 10/11 PNG native symbols.
assert(pngBridge.includes('_png_encode_rgba8'), 'PNG8 native symbol missing');
assert(pngBridge.includes('_png_encode_rgba16'), 'PNG16 native symbol missing');

// 12 One PNG module instance.
assert((pngBridge.match(/ModuleFactory\s*\(/g) || []).length === 1, 'PNG bridge must instantiate one ModuleFactory');
assert(pngBridge.includes('modulePromise') && pngBridge.includes('moduleInstanceCount'), 'PNG singleton evidence missing');

// 13 Metadata SSOT.
assert((manager.match(/injectResolutionIntoPng\(/g) || []).length >= 2, 'PNG8/PNG16 metadata SSOT injection missing');

// 14 Bit-depth binding.
assert(registry.includes('evidence.bitDepth !== 8') && registry.includes('evidence.bitDepth !== 16'), 'PNG bit-depth binding missing');

// 15 Color type.
assert(registry.includes('evidence.colorType !== 6'), 'PNG RGBA color type gate missing');

// 16 No silent precision conversion.
assert(pngBridge.includes('rgba8-to-rgba16-x257-explicit-v1') && manager.includes('precisionPolicyId'), 'explicit PNG16 precision policy missing');

// 17 Promotion artifact SHA rule.
assert(promotion.emittedArtifactSha256Verified === false && promotion.promotionEligible === false, 'source bake must not claim emitted artifact SHA promotion');

// 18 Pthread capability declaration.
assert(pngBridge.includes('pthreadEnabled: true') && pngBridge.includes('sharedMemoryRequired: true'), 'PNG pthread/shared-memory capability evidence missing');

// 19 Pthread/WASM artifact inclusion.
assert(pngWorker?.artifacts?.some((artifact) => artifact.url.endsWith('lodepng_wasm.mjs')), 'LodePNG JS artifact missing');
assert(pngWorker?.artifacts?.some((artifact) => artifact.url.endsWith('lodepng_wasm.wasm')), 'LodePNG WASM artifact missing');

// 20 Stable errors.
for (const code of ['E_CODEC_LOSSLESS_OPTIONS_INVALID', 'E_CODEC_MAIN_THREAD_FORBIDDEN', 'E_CODEC_FALLBACK_FORBIDDEN', 'E_CODEC_PIXEL_ROUNDTRIP_UNVERIFIED']) {
  assert(stable.includes(`'${code}'`), `stable error missing: ${code}`);
}

// 21 R7 exact binding.
assert(manager.includes('exportByFormatExact') && registry.includes("png: Object.freeze({ workerId: 'dadum.worker.encoder.png-family-v1'"), 'R7 exact PNG binding missing');
assert(registry.includes("png16: Object.freeze({ workerId: 'dadum.worker.encoder.png-family-v1'"), 'R7 exact PNG16 binding missing');

// 22 EW02 Broker-only submission.
assert(manager.includes('bridge.call({') && !manager.includes('.postMessage('), 'legacy ExportManager owns Worker messaging');

// 23 Output envelope completeness.
for (const token of ['codecPromotionId', 'mainThreadEncoderUsed', 'fallbackUsed', 'codecEvidence']) {
  assert(manager.includes(token) || exporter.includes(token), `codec output evidence missing: ${token}`);
}

// 24 Main-thread zero receipt schema.
assert(isolation.schema === 'dadum-ew03-main-thread-isolation-report-v1', 'main-thread isolation schema mismatch');
assert(isolation.activeExportManagerUPNGEncodeReferences === 0, 'main-thread PNG reference count is nonzero');

// 25 Pixel digest schema.
assert(roundtrip.cases.every((item) => 'inputPixelSha256' in item && 'decodedPixelSha256' in item), 'pixel digest schema incomplete');

// 26 PNG parser.
for (const token of ['inspectPngStructure', 'PNG CRC mismatch', 'PNG trailing bytes after IEND']) {
  assert(verifier.includes(token), `PNG parser closure missing: ${token}`);
}

// 27 WebP RIFF parser.
for (const token of ['inspectWebpLosslessStructure', 'WebP RIFF length mismatch', "chunkTypes.includes('ANIM')"]) {
  assert(verifier.includes(token), `WebP parser closure missing: ${token}`);
}

// 28 No duplicate encoder registration.
assert((manager.match(/registerLazy\(\s*"png"/g) || []).length === 1, 'PNG8 registered more than once');
assert((manager.match(/registerLazy\(\s*"png16"/g) || []).length === 1, 'PNG16 registered more than once');

// 29 Legacy Worker ID zero in active product graph.
for (const source of [types, broker, generated, manager, registry]) {
  assert(!source.includes('dadum.worker.encoder.png16-v1'), 'legacy PNG16 Worker ID remains in active product graph');
}

// 30 Source graph determinism.
const canonicalize = (value) => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])) : value;
const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
const fixture = {
  workerId: pngWorker?.workerId,
  owners: pngWorker?.ownerRuntimeEncoderIds,
  artifactSet: pngWorker?.workerArtifactSetDigest,
  webpContract: promotion.webpSemanticContract,
  pngContract: promotion.pngFamilyContract,
};
const expected = digest(fixture);
for (let index = 0; index < 100; index += 1) assert(digest(fixture) === expected, `EW03 source graph determinism failed at ${index + 1}`);

assert(receipt.includes("patchId: 'TDT-EXPORT-PROMOTION-01'"), 'EW03 receipt lineage not carried into EP01');
assert(exporter.includes("codecPromotionState: 'SOURCE_BAKED_UNPROMOTED'"), 'EW03 promotion state truth missing');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS GATE-EW03-01..30 WebP Lossless / PNG8+PNG16 Canonical Worker Promotion source seal; determinism 100/100 ${expected}`);
