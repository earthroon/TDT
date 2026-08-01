import crypto from 'node:crypto';
import fs from 'node:fs';

const failures = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const assert = (condition, message) => { if (!condition) failures.push(message); };

const manifest = json('app/src/runtime/workers/generated-worker-manifest.json');
const generated = read('app/src/runtime/workers/generated-worker-manifest.ts');
const exportManager = read('app/legacy-runtime/export_manager.js');
const adapter = read('app/legacy-runtime/encoders/jxl-canonical-adapter.mjs');
const handler = read('app/legacy-runtime/worker-codecs/jxl-canonical-handler.mjs');
const entry = read('app/src/runtime/workers/entries/jxl-canonical.worker.ts');
const broker = read('app/src/runtime/workers/encoder-worker-broker-service.ts');
const registry = read('app/src/runtime/codecs/encoder-registry-service.ts');
const verifier = read('app/src/runtime/codecs/jxl/jxl-structure-verifier-v2.ts');
const receipt = read('app/src/runtime/export/export-receipt.ts');
const authority = read('app/src/runtime/export/export-authority-service.ts');
const stable = read('app/src/boot/stable-error.ts');
const smoke = json('artifacts/runtime/EW05_JXL_CONTAINER_STRUCTURE_SMOKE.json');
const promotion = json('artifacts/runtime/TDT_EXPORT_WORKER_05_JXL_PROMOTION_RECEIPT.json');
const isolation = json('artifacts/runtime/TDT_EXPORT_WORKER_05_MAIN_THREAD_JXL_ISOLATION_REPORT.json');
const abi = json('artifacts/runtime/TDT_EXPORT_WORKER_05_JXL_ABI_FIXTURE_REPORT.json');
const pthread = json('artifacts/runtime/TDT_EXPORT_WORKER_05_JXL_PTHREAD_CLOSURE_REPORT.json');
const roundtrip = json('artifacts/runtime/TDT_EXPORT_WORKER_05_JXL_INDEPENDENT_ROUNDTRIP_REPORT.json');
const jxl = manifest.workers.filter((worker) => worker.workerId === 'dadum.worker.encoder.jxl-canonical-v1');

assert(jxl.length === 1, 'GATE-EW05-01 canonical JXL Worker identity must exist exactly once');
assert(jxl[0]?.codecProtocolVersion === 'dadum-jxl-canonical-worker-v1', 'GATE-EW05-02 canonical protocol mismatch');
assert(entry.includes("'encode.jxl-lossless': 'encode-jxl-lossless'") && broker.includes("'encode.jxl-lossless'"), 'GATE-EW05-03 canonical operation missing');
assert(registry.includes("workerId: 'dadum.worker.encoder.jxl-canonical-v1'") && registry.includes("codecProtocolVersion: 'dadum-jxl-canonical-worker-v1'"), 'GATE-EW05-04 Runtime Worker binding missing');
assert(!exportManager.includes('import("./export_autotune_jxl.mjs")') && !exportManager.includes("import('./export_autotune_jxl.mjs')"), 'GATE-EW05-05 Main-thread JXL binding import remains');
for (const active of [exportManager, adapter, handler, entry]) assert(!active.includes('new Worker('), 'GATE-EW05-06 raw JXL Worker creation remains in active graph');
for (const active of [exportManager, adapter, handler, entry]) assert(!active.includes('new Map()') || active === exportManager, 'GATE-EW05-07 local JXL pending Map remains');
assert(adapter.includes("const ABI_SYMBOL = '_jxl_encode_qmap_ex'") && adapter.includes("const FREE_SYMBOL = '_jxl_free'"), 'GATE-EW05-08 stable ABI symbols not preserved');
assert(!adapter.includes('encodeJXL') && !adapter.includes('._encode('), 'GATE-EW05-09 alternate ABI replacement reachable');
assert(adapter.includes('input.lossless !== true') && adapter.includes('Number(input.distance) !== 0') && adapter.includes('Number(input.quality) !== 100'), 'GATE-EW05-10 lossless-only semantic gate missing');
assert(!adapter.includes('if (lossless)') && !adapter.includes('lossless ?'), 'GATE-EW05-11 lossy branch remains reachable');
assert(adapter.includes('width * height * 4') && adapter.includes('E_JXL_INPUT_LENGTH_MISMATCH'), 'GATE-EW05-12 RGBA8 length contract missing');
assert(registry.includes("supportsBitDepths: [8], verifierId: 'dadum.jxl-container-structure-v2'") && !registry.includes("canonicalFormat: 'jxl', legacyKey: 'jxl', mime: 'image/jxl', extension: 'jxl', supportsAlpha: true, supportsBitDepths: [8, 16]"), 'GATE-EW05-13 JXL 16-bit false advertising remains');
assert(exportManager.includes('E_JXL_INPUT_STORAGE_UNSUPPORTED') && exportManager.includes('E_JXL_16BIT_ABI_UNVERIFIED'), 'GATE-EW05-14 float/direct16 down-convert not fail-closed');
assert(adapter.includes('const PTHREAD_POOL_SIZE = 4') && adapter.includes("requireRange('threads'"), 'GATE-EW05-15 pthread pool truth missing');
assert(!adapter.includes('Math.min(4') && !exportManager.includes('threads = Math.min'), 'GATE-EW05-16 silent thread clamp remains');
assert(adapter.includes("typeof SharedArrayBuffer !== 'function'") && adapter.includes('crossOriginIsolated !== true'), 'GATE-EW05-17 shared memory gate missing');
assert(handler.includes("import('../encoders/jxl-canonical-adapter.mjs')") && !handler.startsWith('import JxlModule'), 'GATE-EW05-18 heavy JXL import occurs before control handler');
for (const artifact of ['app/legacy-runtime/encoders/jxl_bindings.mjs','app/legacy-runtime/encoders/jxl_bindings.wasm','app/legacy-runtime/metadata/resolution_ssot.js']) assert(jxl[0]?.artifacts?.some((item) => item.url === artifact), `GATE-EW05-19 Worker artifact missing: ${artifact}`);
assert(adapter.includes('let modulePromise = null') && adapter.includes('moduleInstanceCount += 1'), 'GATE-EW05-20 module singleton evidence missing');
assert(exportManager.includes("inputOwnershipPolicyId: 'broker-transfer-snapshot-v1'"), 'GATE-EW05-21 EW02 input snapshot ownership missing');
assert(adapter.includes('finally {') && adapter.includes('freeOutput(outPtr)') && adapter.includes('module._free(srcPtr)') && adapter.includes('module._free(outSizePtr)'), 'GATE-EW05-22 allocation cleanup incomplete');
assert(adapter.includes('const codestreamOrContainer = new Uint8Array(outSize)') && adapter.includes('codestreamOrContainer.set(heapView)'), 'GATE-EW05-23 shared heap output copy missing');
assert(adapter.includes('injectResolutionIntoJxl') && adapter.includes("containerKind: 'container'"), 'GATE-EW05-24 canonical container finalization missing');
assert(adapter.includes('resolveExportResolutionMeta') && !exportManager.includes('injectResolutionIntoJxl'), 'GATE-EW05-25 metadata authority not Worker-local');
assert(authority.includes('E_JXL_OUTPUT_MUTATED_AFTER_WORKER') && adapter.includes('postWorkerMutationCount: 0'), 'GATE-EW05-26 post-worker mutation seal missing');
assert(exportManager.includes('E_JXL_CUSTOM_ICC_UNSUPPORTED') && adapter.includes('E_JXL_CUSTOM_ICC_UNSUPPORTED'), 'GATE-EW05-27 custom ICC is not fail-closed');
assert(registry.includes('inspectJxlContainerStructureV2') && verifier.includes("verifierId: 'dadum.jxl-container-structure-v2'"), 'GATE-EW05-28 structure verifier v2 missing');
assert(verifier.includes('E_JXL_CONTAINER_CARRIER_CONFLICT') && verifier.includes('jxlcCount > 0 && jxlpCount > 0'), 'GATE-EW05-29 carrier exclusivity missing');
assert(verifier.includes("count('Exif') > 1") && verifier.includes("count('xml ') > 1"), 'GATE-EW05-30 metadata cardinality missing');
assert(roundtrip.promotionEligible === false && roundtrip.independentDecoderExecuted === false, 'GATE-EW05-31 independent decoder truth mismatch');
assert(roundtrip.hiddenRgbFixtureRequired === true && roundtrip.hiddenRgbVerified === false, 'GATE-EW05-32 hidden RGB promotion corpus truth mismatch');
assert(pthread.promotionEligible === false && pthread.childClosureVerified === false, 'GATE-EW05-33 pthread closure truth mismatch');
assert(authority.includes('workerOutputSha256 !== outputSha256') && receipt.includes('jxlWorkerFinalOutputSha256'), 'GATE-EW05-34 output immutability evidence missing');
for (const field of ['jxlPromotionState','jxlPromotionId','jxlModeId','jxlAbiSymbol','jxlInputSha256','jxlThreadsRequested','jxlThreadsExecuted','jxlPthreadPoolSize','jxlContainerKind','jxlStructureVerifierId','jxlWorkerFinalOutputSha256','jxlPostWorkerMutationCount']) assert(receipt.includes(field) && authority.includes(field), `GATE-EW05-35 receipt field missing: ${field}`);
for (const code of ['E_JXL_WORKER_UNAVAILABLE','E_JXL_ABI_SYMBOL_MISSING','E_JXL_16BIT_ABI_UNVERIFIED','E_JXL_CONTAINER_INVALID','E_JXL_OUTPUT_MUTATED_AFTER_WORKER','E_JXL_PTHREAD_LEAK']) assert(stable.includes(`'${code}'`), `GATE-EW05-36 stable error missing: ${code}`);
assert(generated.includes('jxl-canonical.worker.ts?worker&url') && manifest.sourceManifestDigest, 'GATE-EW05-37 source graph determinism inputs missing');
assert(promotion.status === 'SOURCE_BAKED_UNPROMOTED' && promotion.parentSealsPreserved === true && isolation.activeMainThreadJxlBindingImports === 0 && abi.rgba16AbiVerified === false, 'GATE-EW05-38 parent/promotion truth mismatch');
assert(smoke.status === 'PASS' && smoke.jxlcCount === 1 && smoke.jxlpCount === 0 && smoke.exifCount === 1 && smoke.xmlCount === 1 && smoke.truncatedRejected && smoke.carrierConflictRejected, 'EW05 container runtime smoke mismatch');

const canonicalize = (value) => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])) : value;
const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
const fixture = { worker: jxl[0]?.workerArtifactSetDigest, smoke, capability: promotion.capability };
const expected = digest(fixture);
for (let index = 0; index < 100; index += 1) assert(digest(fixture) === expected, `EW05 determinism failed ${index + 1}`);

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS GATE-EW05-01..38 JXL canonical worker source seal; determinism 100/100 ${expected}`);
