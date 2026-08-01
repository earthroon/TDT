import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, EXECUTABLE_EXTENSIONS, ROOT, emittedFileIndex, readJson, writeJson } from './build-emit-01-lib.mjs';
const dist = path.join(ROOT, 'dist', 'renderer');
const graph = readJson(path.join(dist, 'dadum-vite-entry-manifest.json'));
const workerManifest = readJson(path.join(dist, 'dadum-runtime-worker-manifest.json'));
const admission = readJson(path.join(ROOT, 'app', 'src', 'legacy', 'generated-legacy-static-admission.json'));
const index = emittedFileIndex(dist);
const owners = new Map();
const addOwner = (url, owner, ownershipMode, sourceIdentities = []) => {
  const key = url.replace(/^\//, '');
  const list = owners.get(key) ?? [];
  list.push({ owner, ownershipMode, sourceIdentities });
  owners.set(key, list);
};
for (const chunk of graph.chunks ?? []) addOwner(chunk.fileName, chunk.isEntry ? 'renderer-entry' : 'vite-chunk', 'vite-bundle', [chunk.facadeModuleId, ...(chunk.moduleIds ?? [])].filter(Boolean));
for (const asset of graph.assets ?? []) addOwner(asset.fileName, 'vite-asset', 'vite-emitted-asset', asset.originalFileNames ?? []);
for (const worker of workerManifest.workers ?? []) for (const artifact of worker.closure ?? []) addOwner(artifact.url, worker.workerId, artifact.ownershipMode, artifact.sourceIdentities ?? []);
for (const record of admission.records ?? []) addOwner(record.route, record.owner, 'legacy-raw-admitted', [record.sourceRelative]);
for (const core of ['index.html','dadum-runtime-manifest.json','dadum-runtime-worker-manifest.json','dadum-vite-entry-manifest.json','dadum-static-route-manifest.json']) addOwner(core, 'runtime-core', 'vite-emitted-asset', []);
const duplicates = [];
const missing = [];
const collisions = [];
for (const [relative, list] of owners) {
  const modes = [...new Set(list.map((x)=>x.ownershipMode))];
  const sourceModes = new Map();
  for (const owner of list) for (const source of owner.sourceIdentities) {
    if (!source) continue;
    const set = sourceModes.get(source) ?? new Set(); set.add(owner.ownershipMode); sourceModes.set(source,set);
  }
  for (const [source,set] of sourceModes) if (set.has('legacy-raw-admitted') && (set.has('vite-bundle') || set.has('vite-emitted-asset'))) duplicates.push({ relative, source, modes:[...set].sort() });
  if (!index.has(relative)) missing.push({ relative, owners:list });
  if (modes.length > 2 && relative.startsWith('legacy/')) collisions.push({ relative, modes });
}
const orphan = [];
for (const [relative, file] of index) {
  if (!EXECUTABLE_EXTENSIONS.has(file.ext)) continue;
  if (!owners.has(relative)) orphan.push({ relative, sha256:file.sha256, byteLength:file.byteLength });
}
const report = { schemaVersion:1,patchId:'TDT-BUILD-EMIT-01',status:duplicates.length||missing.length||collisions.length?'BLOCKED':'ARTIFACT_OWNERSHIP_VERIFIED',duplicates,missing,collisions,ownerRecordCount:owners.size };
const orphanReport = { schemaVersion:1,patchId:'TDT-BUILD-EMIT-01',status:orphan.length?'BLOCKED':'ORPHAN_ARTIFACTS_VERIFIED',orphans:orphan,orphanCount:orphan.length };
writeJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_ARTIFACT_OWNERSHIP_REPORT.json'),report);
writeJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_ORPHAN_ARTIFACT_REPORT.json'),orphanReport);
if (duplicates.length) throw new Error('E_LEGACY_RAW_BUNDLE_DUPLICATE');
if (missing.length) throw new Error('E_ARTIFACT_OWNERSHIP_MISSING');
if (collisions.length) throw new Error('E_EMITTED_URL_COLLISION');
if (orphan.length) throw new Error('E_EMITTED_ORPHAN_EXECUTABLE');
console.log(`PASS BUILD-EMIT-01 ownership ${owners.size} orphan=0`);
