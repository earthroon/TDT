import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, ROOT, canonicalJson, collectChunkClosure, emittedFileIndex, mapWorkerEntries, readJson, sha256Bytes, writeJson } from './build-emit-01-lib.mjs';
const dist = path.join(ROOT, 'dist', 'renderer');
const sourcePath = path.join(ROOT, 'app', 'src', 'runtime', 'workers', 'generated-worker-manifest.json');
const auxiliarySourcePaths = [
  path.join(ROOT, 'app', 'src', 'runtime', 'workers', 'generated-jxl-independent-decoder-manifest.json'),
  path.join(ROOT, 'app', 'src', 'runtime', 'workers', 'generated-psd-independent-decoder-manifest.json'),
];
const graphPath = path.join(dist, 'dadum-vite-entry-manifest.json');
if (!fs.existsSync(graphPath)) throw new Error('E_VITE_MANIFEST_MISSING');
const source = readJson(sourcePath);
const auxiliarySources = auxiliarySourcePaths.map(readJson);
const combinedSource = { workers: [...source.workers, ...auxiliarySources.flatMap((manifest) => manifest.workers)] };
const graph = readJson(graphPath);
const mapping = mapWorkerEntries({ sourceManifest: combinedSource, rollupGraph: graph, root: ROOT });
const allSourceWorkers = combinedSource.workers;
const index = emittedFileIndex(dist);
const assetSources = new Map();
for (const asset of graph.assets ?? []) for (const original of asset.originalFileNames ?? []) assetSources.set(original, asset.fileName);
const workers = [];
for (const record of mapping) {
  const sourceWorker = allSourceWorkers.find((item) => item.workerId === record.workerId);
  const chunkClosure = collectChunkClosure(record.emittedEntryFileName, graph);
  const closure = [];
  for (const chunk of chunkClosure.chunks) {
    const file = index.get(chunk.fileName);
    if (!file) throw new Error(`E_WORKER_CLOSURE_UNRESOLVED_IMPORT:${chunk.fileName}`);
    const sourceIds = [...new Set([chunk.facadeModuleId, ...(chunk.moduleIds ?? [])].filter(Boolean))].sort();
    closure.push({ url: file.url, role: chunk.fileName === record.emittedEntryFileName ? 'worker-entry' : 'shared-chunk', ownershipMode: 'vite-bundle', byteLength: file.byteLength, sha256: file.sha256, sourceIdentities: sourceIds, parents: chunkClosure.edges.filter((edge) => edge.to === chunk.fileName).map((edge) => edge.from), edgeKinds: [...new Set(chunkClosure.edges.filter((edge) => edge.to === chunk.fileName).map((edge) => edge.kind))].sort() });
  }
  for (const artifact of sourceWorker.artifacts ?? []) {
    const ext = path.extname(artifact.url).toLowerCase();
    const isPthreadBootstrap = artifact.role === 'pthread-child-bootstrap';
    if (!['.wasm', '.icc'].includes(ext) && !isPthreadBootstrap) continue;
    const emittedName = assetSources.get(artifact.url);
    if (!emittedName) {
      if (isPthreadBootstrap) throw new Error(`E_PTHREAD_CHILD_BOOTSTRAP_MISSING:${artifact.url}`);
      throw new Error(ext === '.wasm' ? `E_WORKER_WASM_MISSING:${artifact.url}` : `E_WORKER_ICC_MISSING:${artifact.url}`);
    }
    const file = index.get(emittedName);
    if (!file) throw new Error(`E_WORKER_ARTIFACT_HASH_MISMATCH:${emittedName}`);
    const role = isPthreadBootstrap ? 'pthread-child-bootstrap' : ext === '.wasm' ? 'wasm' : 'icc';
    const edgeKinds = isPthreadBootstrap ? ['pthread-child', 'new-url'] : ['new-url', 'locate-file'];
    closure.push({ url: file.url, role, ownershipMode: 'vite-emitted-asset', byteLength: file.byteLength, sha256: file.sha256, sourceIdentities: [artifact.url], sourceSha256: artifact.sha256, parents: [record.emittedEntryFileName], edgeKinds });
  }
  closure.sort((a, b) => a.url.localeCompare(b.url));
  const entry = closure.find((item) => item.role === 'worker-entry');
  const worker = { ...record, emittedEntrySha256: entry.sha256, emittedEntryByteLength: entry.byteLength, closure, emittedArtifactSetDigest: sha256Bytes(canonicalJson(closure)) };
  workers.push(worker);
}
const base = { schemaVersion: 2, patchId: 'TDT-BUILD-EMIT-01', profile: 'production', artifactVerificationMode: 'emitted-artifact-sha256', sourceManifestDigest: sha256Bytes(canonicalJson([source.sourceManifestDigest, ...auxiliarySources.map((manifest) => manifest.sourceManifestDigest)])),
  encoderSourceManifestDigest: source.sourceManifestDigest,
  auxiliarySourceManifestDigests: auxiliarySources.map((manifest) => manifest.sourceManifestDigest), viteManifestDigest: graph.digest, workers: workers.sort((a,b)=>a.workerId.localeCompare(b.workerId)) };
const manifest = { ...base, manifestDigest: sha256Bytes(canonicalJson(base)) };
writeJson(path.join(dist, 'dadum-runtime-worker-manifest.json'), manifest);
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_EMIT_01_EMITTED_WORKER_MANIFEST.json'), manifest);
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_EMIT_01_SOURCE_TO_EMITTED_MAPPING.json'), { schemaVersion: 1, patchId: 'TDT-BUILD-EMIT-01', mapping, digest: sha256Bytes(canonicalJson(mapping)) });
console.log(`PASS BUILD-EMIT-01 emitted worker manifest ${manifest.manifestDigest}`);
