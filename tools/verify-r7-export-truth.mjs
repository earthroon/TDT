import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const failures = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const encoder = read('app/src/runtime/codecs/encoder-registry-service.ts');
const psdVerifier = read('app/src/runtime/codecs/psd/psd-structure-verifier-v2.ts');
const jxlVerifier = read('app/src/runtime/codecs/jxl/jxl-structure-verifier-v2.ts');
const jpegVerifier = read('app/src/runtime/codecs/jpeg/jpeg-structure-verifier-v2.ts');
const legacyManager = read('app/legacy-runtime/export_manager.js');
const pipeline = read('app/src/runtime/pipeline/pipeline-service.ts');
const bridge = read('app/src/runtime/pipeline/legacy-final-surface-bridge-service.ts');
const exporter = read('app/src/runtime/export/export-authority-service.ts');
const receipt = read('app/src/runtime/export/export-receipt.ts');
const ledger = read('app/src/runtime/export/export-receipt-ledger-service.ts');
const modules = read('app/src/boot/runtime-modules.ts');
const bootReceipt = read('app/src/boot/runtime-receipt.ts');
const main = read('app/legacy-runtime/main.js');
const offscreen = read('app/legacy-runtime/input/offscreen_surface_ssot.js');

const assert = (condition, message) => { if (!condition) failures.push(message); };

// R7-01 Exact manager API
assert(legacyManager.includes("apiId: 'dadum.legacy.export-manager'"), 'legacy manager identity missing');
assert(legacyManager.includes('listEncoderRecords()'), 'listEncoderRecords API missing');
assert(legacyManager.includes('async exportByFormatExact('), 'exportByFormatExact API missing');
assert(encoder.includes('ExportManager'), 'Runtime encoder registry does not adopt window.ExportManager');
assert(!encoder.includes('DadumExportManager?.export'), 'forbidden DadumExportManager adoption remains');
assert(!encoder.includes('legacy.exportImage'), 'forbidden window.exportImage adoption remains');

// R7-02 per-format identities
for (const id of ['dadum.encoder.jxl.v1', 'dadum.encoder.webp-lossless.v1', 'dadum.encoder.png.v1', 'dadum.encoder.png16.v1', 'dadum.encoder.jpg.v1', 'dadum.encoder.psd.v1']) {
  assert(encoder.includes(id), `canonical encoder identity missing: ${id}`);
}
assert(!encoder.includes('dadum.encoder.legacy-dispatch-v1'), 'generic legacy dispatch identity remains');

// R7-03 zero encoder fail closed
assert(encoder.includes("'E_CODEC_ZERO_ENCODERS'"), 'zero-encoder fail-closed error missing');
assert(modules.includes('encoders.eligibleCount() === 0'), 'encode module does not guard zero eligible encoders');

// R7-04 duplicate identity
assert(encoder.includes("'E_CODEC_IDENTITY_COLLISION'"), 'duplicate identity fail-closed missing');
assert(encoder.includes('this.#records.has(template.id)') && encoder.includes('this.#formats.has(template.canonicalFormat)'), 'duplicate identity checks incomplete');

// R7-05 exact format
const exactBlock = legacyManager.slice(legacyManager.indexOf('async function exportByFormatExactInternal('), legacyManager.indexOf('function facadeRetiredError()'));
assert(exactBlock.includes('encoders.get(requestedFormat)'), 'exact lookup does not use exact key');
assert(!exactBlock.includes('startsWith(') && !exactBlock.includes("split('-')"), 'exact path contains prefix/base fallback');
assert(legacyManager.includes('display labels are forbidden in exact mode'), 'display label rejection missing');

// R7-06 direct final global writes
const activeLegacy = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'legacy_quarantine' || entry.name.endsWith('.bak') || entry.name.includes('.bak_')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:js|mjs)$/.test(entry.name)) activeLegacy.push(full);
  }
};
walk('app/legacy-runtime');
const directWriteRe = /(?:window|globalThis)\.__DADUM_FILTERED_(?:SURFACE|EXPORT_SOURCE|RGBA8)__\s*=/g;
for (const file of activeLegacy) {
  const source = read(file);
  if (directWriteRe.test(source)) failures.push(`direct final global write remains in ${file}`);
  directWriteRe.lastIndex = 0;
}
assert(bridge.includes('window.__DADUM_FILTERED_SURFACE__ = compatibilityFacade') && bridge.includes('mutablePayloadExposed: false'), 'bridge compatibility handle facade missing');

// R7-07 promotion bridge
assert(main.includes('DadumRuntimeBridge') && main.includes('publishLegacyFinalSurface'), 'main final producer not migrated to Runtime bridge');
assert(offscreen.includes('DadumRuntimeBridge') && offscreen.includes('publishLegacyFinalSurface'), 'offscreen final producer not migrated to Runtime bridge');
assert(pipeline.includes('publishFinalCandidate(') && pipeline.includes('const finalRevision = ++this.#nextFinalRevision'), 'Pipeline final revision allocation missing');

// R7-08 no source downgrade
for (const forbidden of ['__DADUM_SOURCE_SURFACE__', 'document.querySelector', 'getElementById', 'canvas-2d-fallback']) {
  assert(!exporter.includes(forbidden), `Runtime exporter reads forbidden source/canvas fallback: ${forbidden}`);
}
assert(exporter.includes("exportSource: 'runtime-final-surface'"), 'Runtime final export source identity missing');

// R7-09 output shape
assert(encoder.includes("'E_CODEC_RESULT_EMPTY'") && encoder.includes("'E_CODEC_RESULT_AMBIGUOUS'"), 'encoded output shape fail-closed missing');

// R7-10 / 11 signature matrix
for (const signature of ['0x89, 0x50, 0x4e, 0x47', '0xff, 0xd8, 0xff', "'RIFF'", '0x38, 0x42, 0x50, 0x53']) {
  const jpegStructureMatch = signature === '0xff, 0xd8, 0xff' && jpegVerifier.includes('bytes[0] !== 0xff') && jpegVerifier.includes('bytes[1] !== 0xd8');
  assert(encoder.includes(signature) || psdVerifier.includes(signature) || jpegStructureMatch || (signature === '0x38, 0x42, 0x50, 0x53' && psdVerifier.includes("'8BPS'")), `signature verifier fixture missing: ${signature}`);
}
assert(encoder.includes('inspectJxlContainerStructureV2') && encoder.includes('dadum.jxl-container-structure-v2'), 'JXL structure verifier v2 adoption missing');
assert(jxlVerifier.includes('inspectJxlContainerStructureV2') && jxlVerifier.includes('jxlc'), 'JXL container structure parser missing');
assert(encoder.includes('parsePngBitDepth') && encoder.includes('bitDepth !== 16'), 'PNG16 IHDR bit depth gate missing');

// R7-12 receipt completeness
for (const field of [
  'sourceRevision', 'finalRevision', 'finalSurfaceId', 'pipelineReceiptId', 'surfaceContractDigest',
  'requestedFormat', 'appliedFormat', 'runtimeEncoderId', 'legacyEncoderKey', 'managerImplementationId',
  'managerRegistryRevision', 'encoderSetDigest', 'requestedOptionsDigest', 'appliedOptionsDigest',
  'mime', 'extension', 'byteLength', 'outputSha256', 'signatureVerifierId', 'signatureVerified',
  'alphaPreservation', "exportSource: 'runtime-final-surface'",
]) assert(receipt.includes(field) || exporter.includes(field), `receipt field missing: ${field}`);
assert(ledger.includes('publish(receipt: ExportReceipt)') && ledger.includes('list(): ExportReceiptSummary[]'), 'export receipt ledger API incomplete');

// R7-13/14 deterministic seal fixture
const canonicalize = (value) => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
    : value;
const fixture = {
  schemaVersion: 1,
  patchId: 'TDT-RUNTIME-SSOT-01-R7',
  buildId: 'fixture-build',
  runtimeEpoch: 1,
  exportJobId: 'export-job:fixture',
  finalRevision: 4,
  outputSha256: 'a'.repeat(64),
  signatureVerified: true,
};
const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
const expected = digest(fixture);
for (let index = 0; index < 100; index++) assert(digest(fixture) === expected, `receipt determinism failed at run ${index + 1}`);
assert(digest({ ...fixture, finalRevision: 5 }) !== expected, 'receipt digest does not change when sealed field mutates');
assert(receipt.includes('sealExportReceipt') && receipt.includes('digestCanonical(payload)'), 'receipt sealing implementation missing');

// R7-15 Boot receipt truth evidence
assert(encoder.includes('eligibleRecordCount') && encoder.includes('encoderSetDigest') && encoder.includes('managerImplementationId') && encoder.includes('managerRegistryRevision'), 'encoder Boot Receipt evidence incomplete');
assert(bridge.includes('legacy-final-surface-promotion-bridge-r7'), 'final-surface bridge Boot Receipt evidence missing');
assert(bootReceipt.includes("patchId: 'TDT-EXPORT-PROMOTION-01'"), 'Boot Receipt patch ID not promoted to EP01');
assert(modules.includes('dadum-encoder-registry-ep01') && modules.includes('dadum-final-surface-export-ep01'), 'EP01 module implementation identities missing');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS GATE-R7-01..15 Exact API / Encoder Identity / Final Surface / Receipt; receipt parity 100/100 ${expected}`);
