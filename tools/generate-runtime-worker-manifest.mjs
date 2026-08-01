import fs from 'node:fs';
import path from 'node:path';
import { canonicalJson, sha256Bytes, sha256File } from './runtime-manifest-lib.mjs';

const root = process.cwd();
const definitions = [
  {
    workerId: 'dadum.worker.encoder.modjpeg-canonical-v1',
    ownerRuntimeEncoderIds: ['dadum.encoder.jpg.v1'],
    codecProtocolVersion: 'dadum-modjpeg-canonical-worker-v1',
    entrySourceIdentity: 'vite:app/src/runtime/workers/entries/modjpeg-canonical.worker.ts',
    entryRelative: 'app/src/runtime/workers/entries/modjpeg-canonical.worker.ts',
    transferPolicyId: 'transfer-rgba8-transfer-output-v1',
    wasmPolicyId: 'modjpeg-pthread-pool-8-canonical-coi-v1',
    legacyCodecHandlerId: 'dadum.legacy.worker-codec.modjpeg-canonical-v1',
    artifacts: [
      ['app/src/runtime/workers/entries/modjpeg-canonical.worker.ts', 'entry'],
      ['app/src/runtime/workers/worker-entry-runtime.ts', 'chunk'],
      ['app/legacy-runtime/worker-codecs/modjpeg-canonical-handler.mjs', 'chunk'],
      ['app/legacy-runtime/encoders/modjpeg-canonical-adapter.mjs', 'chunk'],
      ['app/legacy-runtime/encoders/modjpeg-child-worker-tracker.mjs', 'chunk'],
      ['app/legacy-runtime/encoders/libmodjpeg_wasm.mjs', 'pthread-child-bootstrap'],
      ['app/legacy-runtime/wasm/libmodjpeg_wasm.wasm', 'wasm'],
      ['app/src/runtime/codecs/jpeg/jpeg-structure-verifier-v2.ts', 'asset'],
      ['app/src/runtime/codecs/jpeg/jpeg-encode-plan-v1.ts', 'asset'],
    ],
  },
  {
    workerId: 'dadum.worker.encoder.jxl-canonical-v1',
    ownerRuntimeEncoderIds: ['dadum.encoder.jxl.v1'],
    codecProtocolVersion: 'dadum-jxl-canonical-worker-v1',
    entrySourceIdentity: 'vite:app/src/runtime/workers/entries/jxl-canonical.worker.ts',
    entryRelative: 'app/src/runtime/workers/entries/jxl-canonical.worker.ts',
    transferPolicyId: 'transfer-rgba8-transfer-output-v1',
    wasmPolicyId: 'jxl-qmap-emscripten-pthread-worker-only-v1',
    legacyCodecHandlerId: 'dadum.legacy.worker-codec.jxl-canonical-v1',
    artifacts: [
      ['app/src/runtime/workers/entries/jxl-canonical.worker.ts', 'entry'],
      ['app/src/runtime/workers/worker-entry-runtime.ts', 'chunk'],
      ['app/legacy-runtime/worker-codecs/jxl-canonical-handler.mjs', 'chunk'],
      ['app/legacy-runtime/encoders/jxl-canonical-adapter.mjs', 'chunk'],
      ['app/legacy-runtime/encoders/jxl-child-worker-tracker.mjs', 'chunk'],
      ['app/legacy-runtime/encoders/jxl_bindings.mjs', 'pthread-child-bootstrap'],
      ['app/legacy-runtime/encoders/jxl_bindings.wasm', 'wasm'],
      ['app/legacy-runtime/metadata/resolution_ssot.js', 'chunk'],
      ['app/src/runtime/codecs/jxl/jxl-structure-verifier-v2.ts', 'asset'],
    ],
  },
  {
    workerId: 'dadum.worker.encoder.webp-lossless-v1',
    ownerRuntimeEncoderIds: ['dadum.encoder.webp-lossless.v1'],
    codecProtocolVersion: 'dadum-webp-lossless-worker-v1',
    entrySourceIdentity: 'vite:app/src/runtime/workers/entries/webp-lossless.worker.ts',
    entryRelative: 'app/src/runtime/workers/entries/webp-lossless.worker.ts',
    transferPolicyId: 'sab-copy-input-transfer-output-v1',
    wasmPolicyId: 'webp-wasm-worker-only-v1',
    legacyCodecHandlerId: 'dadum.legacy.worker-codec.webp-lossless-v1',
    artifacts: [
      ['app/src/runtime/workers/entries/webp-lossless.worker.ts', 'entry'],
      ['app/src/runtime/workers/worker-entry-runtime.ts', 'chunk'],
      ['app/legacy-runtime/worker-codecs/webp-lossless-handler.js', 'chunk'],
      ['app/legacy-runtime/encoders/webp_api.js', 'chunk'],
      ['app/legacy-runtime/encoders/webp_bindings_qmap.mjs', 'chunk'],
      ['app/legacy-runtime/metadata/resolution_ssot.js', 'chunk'],
    ],
  },
  {
    workerId: 'dadum.worker.encoder.png-family-v1',
    ownerRuntimeEncoderIds: ['dadum.encoder.png.v1', 'dadum.encoder.png16.v1'],
    codecProtocolVersion: 'dadum-png-family-worker-v1',
    entrySourceIdentity: 'vite:app/src/runtime/workers/entries/png-family.worker.ts',
    entryRelative: 'app/src/runtime/workers/entries/png-family.worker.ts',
    transferPolicyId: 'transfer-input-transfer-output-v1',
    wasmPolicyId: 'lodepng-family-wasm-worker-only-v1',
    legacyCodecHandlerId: 'dadum.legacy.worker-codec.png-family-v1',
    artifacts: [
      ['app/src/runtime/workers/entries/png-family.worker.ts', 'entry'],
      ['app/src/runtime/workers/worker-entry-runtime.ts', 'chunk'],
      ['app/legacy-runtime/worker-codecs/png-family-handler.js', 'chunk'],
      ['app/legacy-runtime/encoders/png_family_lode_bridge.mjs', 'chunk'],
      ['app/legacy-runtime/encoders/lodepng_wasm.mjs', 'chunk'],
      ['app/legacy-runtime/encoders/lodepng_wasm.wasm', 'wasm'],
    ],
  },
  {
    workerId: 'dadum.worker.encoder.psd-canonical-v2',
    ownerRuntimeEncoderIds: ['dadum.encoder.psd.v1'],
    codecProtocolVersion: 'dadum-psd-canonical-worker-v2',
    entrySourceIdentity: 'vite:app/src/runtime/workers/entries/psd-canonical.worker.ts',
    entryRelative: 'app/src/runtime/workers/entries/psd-canonical.worker.ts',
    transferPolicyId: 'transfer-source-and-profiles-transfer-output-v2',
    wasmPolicyId: 'psd-canonical-worker-closure-ew07-source-bake',
    legacyCodecHandlerId: 'dadum.legacy.worker-codec.psd-canonical-v2',
    artifacts: [
      ['app/src/runtime/workers/entries/psd-canonical.worker.ts', 'entry'],
      ['app/src/runtime/workers/worker-entry-runtime.ts', 'chunk'],
      ['app/legacy-runtime/worker-codecs/psd-canonical-handler.js', 'chunk'],
      ['app/legacy-runtime/worker-codecs/psd-structure-verifier-v2.js', 'chunk'],
      ['app/legacy-runtime/libs/psd/request-codec-v2.js', 'chunk'],
      ['app/legacy-runtime/libs/psd/pkg-v2/psd_exporter_wasm.js', 'chunk'],
      ['app/legacy-runtime/libs/lcms/lcmsLoader.js', 'chunk'],
      ['app/legacy-runtime/libs/lcms/lcms_icmsA.mjs', 'chunk'],
      ['app/legacy-runtime/libs/lcms/lcms_icmsA.wasm', 'wasm'],
      ['native/psd-exporter-wasm-v2/src/lib.rs', 'asset'],
      ['native/psd-exporter-wasm-v2/Cargo.toml', 'asset'],
    ],
  },
];

const stable = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const workers = definitions.map((definition) => {
  const artifacts = definition.artifacts.map(([relative, role]) => {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) throw new Error(`worker artifact missing: ${relative}`);
    return {
      url: relative.replaceAll(path.sep, '/'),
      byteLength: fs.statSync(absolute).size,
      sha256: sha256File(absolute),
      role,
    };
  }).sort((a, b) => stable(a.url, b.url));
  const workerArtifactSetDigest = sha256Bytes(canonicalJson(artifacts));
  const entry = artifacts.find((artifact) => artifact.role === 'entry');
  return {
    ...definition,
    controlProtocolVersion: 'dadum-worker-control-v1',
    sourceGraphDigest: workerArtifactSetDigest,
    entryAssetSha256: entry.sha256,
    workerArtifactSetDigest,
    artifacts,
    workerType: 'module',
    required: true,
    realization: 'lazy',
    maxInstances: 1,
    artifactVerificationMode: 'source-graph-only',
  };
}).sort((a, b) => stable(a.workerId, b.workerId));

const jsonPayload = {
  schema: 'dadum-runtime-worker-manifest-source-v1',
  generatedBy: 'tools/generate-runtime-worker-manifest.mjs',
  artifactVerificationMode: 'source-graph-only',
  workers,
};
const sourceManifestDigest = sha256Bytes(canonicalJson(jsonPayload));
const jsonOutput = { ...jsonPayload, sourceManifestDigest };

const jsonPath = path.join(root, 'app/src/runtime/workers/generated-worker-manifest.json');
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2) + '\n');

const cleanWorkers = workers.map(({ entryRelative, ...worker }) => worker);
const ts = `// Generated by tools/generate-runtime-worker-manifest.mjs. Do not edit.\n` +
`import { canonicalJson, sha256Hex } from '../../boot/canonical-json';\n` +
`import type { RuntimeWorkerManifest } from './encoder-worker-types';\n` +
`import modjpegCanonicalWorkerUrl from './entries/modjpeg-canonical.worker.ts?worker&url';\n` +
`import jxlCanonicalWorkerUrl from './entries/jxl-canonical.worker.ts?worker&url';\n` +
`import webpLosslessWorkerUrl from './entries/webp-lossless.worker.ts?worker&url';\n` +
`import pngFamilyWorkerUrl from './entries/png-family.worker.ts?worker&url';\n` +
`import psdCanonicalWorkerUrl from './entries/psd-canonical.worker.ts?worker&url';\n\n` +
`const SOURCE_WORKERS = ${JSON.stringify(cleanWorkers, null, 2)} as const;\n` +
`const ENTRY_URLS = {\n` +
`  'dadum.worker.encoder.modjpeg-canonical-v1': new URL(modjpegCanonicalWorkerUrl, import.meta.url),\n` +
`  'dadum.worker.encoder.jxl-canonical-v1': new URL(jxlCanonicalWorkerUrl, import.meta.url),\n` +
`  'dadum.worker.encoder.webp-lossless-v1': new URL(webpLosslessWorkerUrl, import.meta.url),\n` +
`  'dadum.worker.encoder.png-family-v1': new URL(pngFamilyWorkerUrl, import.meta.url),\n` +
`  'dadum.worker.encoder.psd-canonical-v2': new URL(psdCanonicalWorkerUrl, import.meta.url),\n` +
`} as const;\n\n` +
`export const WORKER_SOURCE_MANIFEST_DIGEST = '${sourceManifestDigest}';\n\n` +
`export async function createGeneratedWorkerManifest(buildId: string): Promise<RuntimeWorkerManifest> {\n` +
`  const workers = SOURCE_WORKERS.map((source) => Object.freeze({ ...source, buildId, entryUrl: ENTRY_URLS[source.workerId] }));\n` +
`  const digestPayload = { schema: 'dadum-runtime-worker-manifest-v1', buildId, generatedBy: 'tools/generate-runtime-worker-manifest.mjs', workers: workers.map((worker) => ({ ...worker, entryUrl: worker.entryUrl.href })) };\n` +
`  const manifestDigest = await sha256Hex(canonicalJson(digestPayload));\n` +
`  return Object.freeze({ ...digestPayload, workers, manifestDigest }) as RuntimeWorkerManifest;\n` +
`}\n`;
fs.writeFileSync(path.join(root, 'app/src/runtime/workers/generated-worker-manifest.ts'), ts);
console.log(`[TDT-MODJPEG-01] generated ${workers.length} worker descriptors ${sourceManifestDigest}`);
