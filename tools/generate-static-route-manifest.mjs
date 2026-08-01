import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, ROOT, canonicalJson, coiPolicy, emittedFileIndex, mimeForRoute, readJson, sha256Bytes, writeJson } from './build-emit-01-lib.mjs';
const dist = path.join(ROOT, 'dist', 'renderer');
if (!fs.existsSync(dist)) throw new Error('E_ROUTE_MANIFEST_MISSING');
const index = emittedFileIndex(dist);
const requiredBy = new Map();
const add = (relative, owner) => { const set = requiredBy.get(relative) ?? new Set(); set.add(owner); requiredBy.set(relative, set); };
for (const core of ['index.html','dadum-runtime-manifest.json','dadum-runtime-worker-manifest.json','dadum-vite-entry-manifest.json']) add(core, 'runtime-core');
const graph = readJson(path.join(dist, 'dadum-vite-entry-manifest.json'));
for (const chunk of graph.chunks ?? []) add(chunk.fileName, chunk.isEntry ? 'renderer-entry' : 'vite-chunk');
for (const asset of graph.assets ?? []) add(asset.fileName, 'vite-asset');
const workers = readJson(path.join(dist, 'dadum-runtime-worker-manifest.json'));
for (const worker of workers.workers ?? []) for (const artifact of worker.closure ?? []) add(artifact.url.replace(/^\//,''), worker.workerId);
const admission = readJson(path.join(ROOT, 'app', 'src', 'legacy', 'generated-legacy-static-admission.json'));
for (const record of admission.records ?? []) add(record.route.replace(/^\//,''), record.owner);
const routes = [];
for (const [relative, owners] of [...requiredBy.entries()].sort((a,b)=>a[0].localeCompare(b[0]))) {
  const file = index.get(relative);
  if (!file) throw new Error(`E_COI_ROUTE_MISSING:${relative}`);
  routes.push({ route: file.url, sha256: file.sha256, byteLength: file.byteLength, ...coiPolicy(mimeForRoute(file.url)), requiredBy: [...owners].sort() });
}
const base = { schemaVersion:1, patchId:'TDT-BUILD-EMIT-01', routes };
const manifest = { ...base, digest: sha256Bytes(canonicalJson(base)) };
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_EMIT_01_STATIC_ROUTE_MANIFEST.json'), manifest);
writeJson(path.join(dist, 'dadum-static-route-manifest.json'), manifest);
console.log(`PASS BUILD-EMIT-01 static routes ${routes.length} ${manifest.digest}`);
