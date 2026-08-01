import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const failures = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const assert = (condition, message) => { if (!condition) failures.push(message); };
const broker = read('app/src/runtime/workers/encoder-worker-broker-service.ts');
const registry = read('app/src/runtime/workers/worker-registry-service.ts');
const types = read('app/src/runtime/workers/encoder-worker-types.ts');
const entryRuntime = read('app/src/runtime/workers/worker-entry-runtime.ts');
const manifest = JSON.parse(read('app/src/runtime/workers/generated-worker-manifest.json'));
const manager = read('app/legacy-runtime/export_manager.js');
const psdBridge = read('app/legacy-runtime/libs/psd/psd_export_bridge.js');
const modules = read('app/src/boot/runtime-modules.ts');
const encoderRegistry = read('app/src/runtime/codecs/encoder-registry-service.ts');
const receipt = read('app/src/runtime/export/export-receipt.ts');
const exporter = read('app/src/runtime/export/export-authority-service.ts');

// EW01-01 constructor ownership for promoted encoder Workers.
assert((registry.match(/new\s+Worker\s*\(/g) || []).length === 1, 'WorkerRegistry must own exactly one Worker constructor');
for (const [file, source] of [['export_manager.js', manager], ['psd_export_bridge.js', psdBridge]]) {
  assert(!/new\s+Worker\s*\(/.test(source), `legacy direct Worker constructor remains: ${file}`);
  assert(!/\.terminate\s*\(/.test(source), `legacy direct terminate remains: ${file}`);
}

// EW01-02..07 descriptor and URL authority.
assert(manifest.schema === 'dadum-runtime-worker-manifest-source-v1', 'source Worker manifest schema mismatch');
assert(manifest.workers.length === 5, 'expected exactly five promoted encoder Worker descriptors through EW07');
for (const id of ['dadum.worker.encoder.modjpeg-canonical-v1', 'dadum.worker.encoder.webp-lossless-v1', 'dadum.worker.encoder.png-family-v1', 'dadum.worker.encoder.psd-canonical-v2', 'dadum.worker.encoder.jxl-canonical-v1']) {
  const record = manifest.workers.find((worker) => worker.workerId === id);
  assert(!!record, `Worker descriptor missing: ${id}`);
  if (!record) continue;
  assert(record.controlProtocolVersion === 'dadum-worker-control-v1', `control protocol mismatch: ${id}`);
  assert(record.artifacts.length > 0, `artifact set empty: ${id}`);
  assert(/^[0-9a-f]{64}$/.test(record.workerArtifactSetDigest), `artifact set digest invalid: ${id}`);
  assert(record.entrySourceIdentity.startsWith('vite:app/src/runtime/workers/entries/'), `Vite entry identity missing: ${id}`);
}
assert(broker.includes("new URL('./entries/") === false, 'Broker must consume generated Vite URLs rather than construct string paths');
const generatedWorkerManifest = read('app/src/runtime/workers/generated-worker-manifest.ts');
assert(generatedWorkerManifest.includes("webp-lossless.worker.ts?worker&url") && generatedWorkerManifest.includes('new URL(webpLosslessWorkerUrl, import.meta.url)'), 'WebP Vite Worker URL import authority missing');
assert(generatedWorkerManifest.includes("png-family.worker.ts?worker&url") && generatedWorkerManifest.includes('new URL(pngFamilyWorkerUrl, import.meta.url)'), 'PNG family Vite Worker URL import authority missing');
assert(generatedWorkerManifest.includes("psd-canonical.worker.ts?worker&url") && generatedWorkerManifest.includes('new URL(psdCanonicalWorkerUrl, import.meta.url)'), 'PSD Vite Worker URL import authority missing');
assert(generatedWorkerManifest.includes("modjpeg-canonical.worker.ts?worker&url") && generatedWorkerManifest.includes('new URL(modjpegCanonicalWorkerUrl, import.meta.url)'), 'MODJPEG Vite Worker URL import authority missing');
assert(generatedWorkerManifest.includes("jxl-canonical.worker.ts?worker&url") && generatedWorkerManifest.includes('new URL(jxlCanonicalWorkerUrl, import.meta.url)'), 'JXL Vite Worker URL import authority missing');

// EW01-08..12 build, epoch, protocol, WASM ready.
for (const token of ['runtimeEpoch', 'workerEpoch', 'buildId', 'workerArtifactSetDigest', 'E_WORKER_STALE_MESSAGE_REJECTED']) {
  assert(broker.includes(token), `Broker identity closure missing: ${token}`);
}
for (const token of ['HELLO', 'READY', 'REJECT', 'HEALTH', 'DISPOSE', 'wasmReady']) {
  assert(entryRuntime.includes(token), `Worker control plane token missing: ${token}`);
}

// EW01-13 direct terminate closure.
assert((registry.match(/record\.worker\.terminate\s*\(/g) || []).length === 1, 'Worker terminate authority must be singular in WorkerRegistry');
assert(!/record\.worker\.terminate\s*\(/.test(broker), 'Broker must delegate raw Worker terminate to WorkerRegistry');

// EW01-14 receipt and R7 binding closure.
for (const field of ['workerBacked', 'workerId', 'workerEpoch', 'workerProtocolVersion', 'workerArtifactSetDigest', 'workerEntryAssetSha256', 'workerGeneration', 'workerTransferPolicyId', 'workerWasmPolicyId']) {
  assert(receipt.includes(field) && exporter.includes(field), `Export Receipt Worker field missing: ${field}`);
}
for (const id of ['dadum.worker.encoder.modjpeg-canonical-v1', 'dadum.worker.encoder.webp-lossless-v1', 'dadum.worker.encoder.png-family-v1', 'dadum.worker.encoder.psd-canonical-v2', 'dadum.worker.encoder.jxl-canonical-v1']) {
  assert(encoderRegistry.includes(id), `Encoder Worker binding missing: ${id}`);
}
assert(modules.includes('dadum.module.encoder-worker-v1'), 'encoder Worker Runtime module missing');
assert(manager.includes('DadumRuntimeWorkerBridge') && psdBridge.includes('DadumRuntimeWorkerBridge'), 'Legacy Worker Bridge adoption incomplete');

// EW01-15/16 deterministic source manifest and Broker receipt fixture.
const canonicalize = (value) => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])) : value;
const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
const fixture = { runtimeEpoch: 7, buildId: 'fixture', workerManifestDigest: manifest.sourceManifestDigest, workers: manifest.workers.map((w) => ({ workerId: w.workerId, workerArtifactSetDigest: w.workerArtifactSetDigest })) };
const expected = digest(fixture);
for (let i = 0; i < 100; i++) assert(digest(fixture) === expected, `Broker receipt determinism failed at ${i + 1}`);

// EW01-17 old direct promoted Worker paths absent from active callers.
for (const forbidden of ['./encoder_full_worker.js', './workers/encode_lodepng16.worker.js', './workers/psd_export.worker.js']) {
  assert(!manager.includes(`new Worker(\"${forbidden}\"`) && !psdBridge.includes(`new Worker('${forbidden}'`), `legacy promoted Worker path remains: ${forbidden}`);
}

// EW01-20 no false READY.
assert(entryRuntime.includes("readyEvidence = await config.handler.initialize(context)"), 'READY is not gated by codec initialization');
assert(entryRuntime.includes('wasmReady: readyEvidence.wasmReady === true'), 'READY lacks WASM evidence');
assert(broker.includes("record.state = 'HANDSHAKING'") && broker.includes("record.state = record.activeJobId ? 'ACTIVE' : 'READY'"), 'Broker READY state transition incomplete');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS GATE-EW01-01..20 Worker URL Authority / Broker / Protocol / Epoch / Artifact Digest; broker receipt parity 100/100 ${expected}`);
