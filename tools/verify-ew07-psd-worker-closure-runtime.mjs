import fs from 'node:fs';
import path from 'node:path';
import { handlePsdCanonicalMessage, disposePsdCanonicalWorker } from '../app/legacy-runtime/worker-codecs/psd-canonical-handler.js';

const te = new TextEncoder();
const MEMORY_POLICY_ID = 'psd-owned-allocation-budget-v1';
function asU8(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof Uint16Array) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
}
async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', asU8(value));
  return Buffer.from(digest).toString('hex');
}
function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
}
async function commandDigest(command) {
  const metadata = {
    commandVersion: command.commandVersion,
    sourceRevision: command.sourceRevision,
    finalRevision: command.finalRevision,
    finalSurfaceId: command.finalSurfaceId,
    width: command.width,
    height: command.height,
    sourcePixelFormat: command.sourcePixelFormat,
    sourceByteLength: command.sourceByteLength,
    sourceSha256: command.sourceSha256,
    documentMode: command.documentMode,
    compression: command.compression,
    layerName: command.layerName,
    dpiX: command.dpiX,
    dpiY: command.dpiY,
    colorTransform: {
      ...command.colorTransform,
      sourceProfile: command.colorTransform?.sourceProfile ? {
        source: command.colorTransform.sourceProfile.source,
        profileId: command.colorTransform.sourceProfile.profileId,
        expectedSha256: command.colorTransform.sourceProfile.expectedSha256,
      } : null,
      destinationProfile: command.colorTransform?.destinationProfile ? {
        source: command.colorTransform.destinationProfile.source,
        profileId: command.colorTransform.destinationProfile.profileId,
        expectedSha256: command.colorTransform.destinationProfile.expectedSha256,
      } : null,
    },
    alphaPolicy: command.alphaPolicy,
    memoryBudgetBytes: command.memoryBudgetBytes,
    memoryBudgetPolicyId: command.memoryBudgetPolicyId,
  };
  return sha256Hex(te.encode(canonicalize(metadata)));
}
async function makeCommand({ id, width, height, source, sourcePixelFormat, documentMode, compression = 'raw', memoryBudgetBytes = 768 * 1024 * 1024, colorTransform = null }) {
  const sourceBytes = asU8(source);
  const command = {
    type: 'encode', id,
    commandVersion: 2,
    sourceRevision: 7,
    finalRevision: 7,
    finalSurfaceId: `surface-${id}`,
    width, height,
    sourcePixelFormat,
    sourceBytes,
    sourceByteLength: sourceBytes.byteLength,
    sourceSha256: await sha256Hex(sourceBytes),
    documentMode,
    compression,
    layerName: documentMode === 'layered-rgb8-single-layer' ? 'EW07 Layer' : null,
    dpiX: 300,
    dpiY: 300,
    colorTransform: colorTransform || {
      mode: 'none', sourceProfile: null, destinationProfile: null,
      intent: 'relative-colorimetric', blackPointCompensation: true,
      outputSamplePolicy: 'lcms-native-cmyk8', psdStoragePolicy: 'invert-cmyk8-for-psd-v1',
    },
    alphaPolicy: 'preserve-straight-alpha-v1',
    memoryBudgetBytes,
    memoryBudgetPolicyId: MEMORY_POLICY_ID,
  };
  command.psdEncodeCommandDigest = await commandDigest(command);
  return command;
}
async function runCase(input) {
  const command = await makeCommand(input);
  const result = await handlePsdCanonicalMessage(command, new AbortController().signal);
  const evidence = result.message.psdEvidence;
  if (!evidence?.structureEvidence?.structureVerifiedInWorker) throw new Error(`${input.id}: worker structure verification missing`);
  if (evidence.memoryEvidence.liveOwnedBytesAtSettlement !== 0) throw new Error(`${input.id}: terminal live bytes not zero`);
  if (evidence.mainThreadPixelPreparationUsed || evidence.mainThreadColorTransformUsed || evidence.mainThreadByteWriterUsed) throw new Error(`${input.id}: main-thread isolation false`);
  return {
    id: input.id,
    byteLength: result.message.u8.byteLength,
    outputSha256: evidence.outputSha256,
    depth: evidence.depth,
    documentMode: evidence.documentMode,
    compression: evidence.compression,
    planeCount: evidence.planeCount,
    planePreparationRealm: evidence.planePreparationRealm,
    structureVerifierId: evidence.structureEvidence.verifierId,
    structureVerifiedInWorker: evidence.structureEvidence.structureVerifiedInWorker,
    peakOwnedBytes: evidence.memoryEvidence.peakOwnedBytes,
    generationResidentBytes: evidence.memoryEvidence.generationResidentBytes,
    liveOwnedBytesAtSettlement: evidence.memoryEvidence.liveOwnedBytesAtSettlement,
    canonicalRustWasm: evidence.serializerEvidence.canonicalRustWasm,
  };
}

const rgb8A = new Uint8Array([
  255,0,0,255, 0,255,0,128,
  0,0,255,255, 40,50,60,0,
]);
const rgb8B = new Uint8Array([
  1,2,3,255, 4,5,6,255, 7,8,9,255,
  10,11,12,255, 13,14,15,255, 16,17,18,255,
]);
const rgba16 = new Uint16Array([
  0,65535,32768,65535, 65535,0,12345,0,
  1000,2000,3000,65535, 65535,65535,65535,32768,
]);
const cases = [];
cases.push(await runCase({ id:'layered-rgb8-raw', width:2, height:2, source:rgb8A, sourcePixelFormat:'rgba8', documentMode:'layered-rgb8-single-layer', compression:'raw' }));
cases.push(await runCase({ id:'flattened-rgb8-rle', width:3, height:2, source:rgb8B, sourcePixelFormat:'rgba8', documentMode:'flattened-rgb8', compression:'rle' }));
cases.push(await runCase({ id:'flattened-rgb16-raw', width:2, height:2, source:rgba16, sourcePixelFormat:'rgba16-u16le', documentMode:'flattened-rgb16', compression:'raw' }));

const dummySrc = new Uint8Array([1,2,3,4]);
const dummyDst = new Uint8Array([5,6,7,8]);
const cmykTransform = {
  mode:'rgba8-to-cmyk8',
  sourceProfile:{ source:'inline-bytes', profileId:'fixture-src', expectedSha256:await sha256Hex(dummySrc), bytes:dummySrc },
  destinationProfile:{ source:'inline-bytes', profileId:'fixture-dst', expectedSha256:await sha256Hex(dummyDst), bytes:dummyDst },
  intent:'relative-colorimetric', blackPointCompensation:true,
  outputSamplePolicy:'lcms-native-cmyk8', psdStoragePolicy:'invert-cmyk8-for-psd-v1',
};
let memoryBudgetRejected = false;
try {
  const command = await makeCommand({ id:'cmyk-low-budget', width:2, height:2, source:rgb8A, sourcePixelFormat:'rgba8', documentMode:'flattened-cmyk8', compression:'rle', memoryBudgetBytes:64*1024*1024, colorTransform:cmykTransform });
  await handlePsdCanonicalMessage(command, new AbortController().signal);
} catch (error) {
  memoryBudgetRejected = String(error?.code || error?.message).includes('E_PSD_MEMORY_BUDGET_EXCEEDED');
}
if (!memoryBudgetRejected) throw new Error('CMYK low-budget admission was not rejected before LCMS');

let digestTamperRejected = false;
try {
  const command = await makeCommand({ id:'digest-tamper', width:2, height:2, source:rgb8A, sourcePixelFormat:'rgba8', documentMode:'flattened-rgb8' });
  command.sourceSha256 = '0'.repeat(64);
  command.psdEncodeCommandDigest = await commandDigest(command);
  await handlePsdCanonicalMessage(command, new AbortController().signal);
} catch (error) {
  digestTamperRejected = String(error?.code || error?.message).includes('E_PSD_SOURCE_DIGEST_MISMATCH');
}
if (!digestTamperRejected) throw new Error('PSD source digest tamper was not rejected');

let lengthRejected = false;
try {
  const command = await makeCommand({ id:'length-tamper', width:2, height:2, source:rgb8A, sourcePixelFormat:'rgba8', documentMode:'flattened-rgb8' });
  command.sourceByteLength -= 1;
  await handlePsdCanonicalMessage(command, new AbortController().signal);
} catch (error) {
  lengthRejected = String(error?.code || error?.message).includes('E_PSD_SOURCE_LENGTH_MISMATCH');
}
if (!lengthRejected) throw new Error('PSD source length tamper was not rejected');

await disposePsdCanonicalWorker('EW07 smoke complete');
const report = {
  schema:'tdt-export-worker-07-psd-worker-closure-smoke-v1',
  status:'PASS',
  generatedAt:new Date().toISOString(),
  caseCount:cases.length,
  cases,
  workerStructureVerifierExecuted:true,
  memoryBudgetRejectedBeforeLcms:true,
  sourceDigestTamperRejected:true,
  sourceLengthTamperRejected:true,
  actualCmykTransformExecuted:false,
  independentColorValidationExecuted:false,
  canonicalRustWasm:false,
  promotionEligible:false,
};
const output = path.resolve('artifacts/runtime/EW07_PSD_WORKER_CLOSURE_SMOKE.json');
fs.mkdirSync(path.dirname(output), { recursive:true });
fs.writeFileSync(output, JSON.stringify(report,null,2)+'\n');
console.log(`PASS RT-EW07-PSD-CLOSURE cases=${cases.length} budget-reject=1 digest-reject=1 length-reject=1`);
