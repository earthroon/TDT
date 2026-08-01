import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

export const ROOT = process.cwd();
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts', 'runtime');
export const PATCH_ID = 'TDT-BUILD-EMIT-01';
export const REQUIRED_WORKERS = Object.freeze([
  'dadum.worker.encoder.jxl-canonical-v1',
  'dadum.worker.encoder.modjpeg-canonical-v1',
  'dadum.worker.encoder.png-family-v1',
  'dadum.worker.encoder.psd-canonical-v2',
  'dadum.worker.encoder.webp-lossless-v1',
  'dadum.worker.decoder.jxl-independent-v1',
]);
export const EXECUTABLE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.wasm', '.icc']);
export const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.cjs', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.wasm', 'application/wasm'],
  ['.icc', 'application/vnd.iccprofile'],
  ['.wgsl', 'text/plain; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
]);

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}
export const canonicalJson = (value) => JSON.stringify(canonicalize(value));
export const sha256Bytes = (value) => crypto.createHash('sha256').update(value).digest('hex');
export const sha256File = (file) => sha256Bytes(fs.readFileSync(file));
export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}
export function seal(value, field = 'selfDigest') {
  const out = { ...value };
  delete out[field];
  out[field] = sha256Bytes(canonicalJson(out));
  return out;
}
export function verifySeal(value, field = 'selfDigest') {
  const expected = value?.[field];
  if (!/^[0-9a-f]{64}$/.test(String(expected || ''))) return false;
  const base = { ...value };
  delete base[field];
  return expected === sha256Bytes(canonicalJson(base));
}
export function walkFiles(rootDir) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw Object.assign(new Error(`symlink forbidden: ${absolute}`), { code: 'E_BUILD_EMIT_SYMLINK_FORBIDDEN' });
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) out.push(absolute);
    }
  };
  visit(rootDir);
  return out;
}
export function fileRecord(rootDir, file) {
  return {
    path: path.relative(rootDir, file).replaceAll(path.sep, '/'),
    byteLength: fs.statSync(file).size,
    sha256: sha256File(file),
  };
}
export function contentManifest(rootDir, { excludes = [] } = {}) {
  const prefixes = excludes.map((x) => x.replaceAll('\\', '/'));
  const records = walkFiles(rootDir).filter((file) => {
    const rel = path.relative(rootDir, file).replaceAll(path.sep, '/');
    return !prefixes.some((prefix) => rel === prefix || rel.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`));
  }).map((file) => fileRecord(rootDir, file));
  return { records, digest: sha256Bytes(canonicalJson(records)) };
}
export const routeForDistPath = (relative) => '/' + relative.replaceAll('\\', '/').replace(/^\/+/, '');
export const mimeForRoute = (route) => MIME.get(path.extname(route).toLowerCase()) ?? 'application/octet-stream';
export const coiPolicy = (contentType) => ({
  contentType,
  coop: 'same-origin',
  coep: 'require-corp',
  corp: 'same-origin',
  cacheControl: 'no-store',
});
export function redactPath(value) {
  if (!value) return null;
  return `<redacted:${sha256Bytes(String(value)).slice(0, 16)}>`;
}

function resolveLiteral(legacyRoot, ownerAbsolute, literal) {
  if (!literal || /^(?:https?:|data:|blob:|node:)/i.test(literal) || literal.startsWith('/')) return null;
  const clean = literal.split(/[?#]/, 1)[0];
  const base = path.resolve(path.dirname(ownerAbsolute), clean);
  const candidates = [base, `${base}.js`, `${base}.mjs`, `${base}.cjs`, path.join(base, 'index.js'), path.join(base, 'index.mjs')];
  for (const candidate of candidates) {
    if (!candidate.startsWith(path.resolve(legacyRoot) + path.sep)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export function discoverLegacyStaticAdmission({ root = ROOT } = {}) {
  const legacyRoot = path.join(root, 'app', 'legacy-runtime');
  const legacyManifest = readJson(path.join(root, 'app', 'src', 'legacy', 'generated-legacy-manifest.json'));
  const records = new Map();
  const queue = [];
  for (const entry of legacyManifest.entries ?? []) {
    if (entry.status !== 'active') continue;
    const absolute = path.resolve(legacyRoot, entry.path);
    if (!absolute.startsWith(path.resolve(legacyRoot) + path.sep) || !fs.existsSync(absolute)) continue;
    queue.push({ absolute, reason: 'legacy-bootstrap', owner: entry.id, parent: null, edgeKind: 'manifest-reference' });
  }
  const literalPatterns = [
    { kind: 'static-import', regex: /(?:import|export)\s+(?:[^'"`]*?\s+from\s+)?['"`]([^'"`]+)['"`]/g },
    { kind: 'dynamic-import', regex: /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g },
    { kind: 'new-url', regex: /new\s+URL\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*import\.meta\.url\s*\)/g },
    { kind: 'runtime-fetch', regex: /(?:fetch|importScripts)\s*\(\s*['"`]([^'"`]+)['"`]/g },
    { kind: 'runtime-asset', regex: /['"`]([^'"`]+\.(?:wasm|icc|mjs|js|cjs))['"`]/g },
  ];
  while (queue.length) {
    const current = queue.shift();
    const sourceRelative = path.relative(root, current.absolute).replaceAll(path.sep, '/');
    if (records.has(sourceRelative)) continue;
    records.set(sourceRelative, {
      sourceRelative,
      route: `/legacy/${path.relative(legacyRoot, current.absolute).replaceAll(path.sep, '/')}`,
      reason: current.reason,
      owner: current.owner,
      sourceSha256: sha256File(current.absolute),
      sourceByteLength: fs.statSync(current.absolute).size,
      parent: current.parent,
      edgeKind: current.edgeKind,
    });
    const ext = path.extname(current.absolute).toLowerCase();
    if (!['.js', '.mjs', '.cjs'].includes(ext)) continue;
    const text = fs.readFileSync(current.absolute, 'utf8');
    for (const pattern of literalPatterns) {
      pattern.regex.lastIndex = 0;
      for (const match of text.matchAll(pattern.regex)) {
        const resolved = resolveLiteral(legacyRoot, current.absolute, match[1]);
        if (resolved) queue.push({ absolute: resolved, reason: 'runtime-import', owner: current.owner, parent: sourceRelative, edgeKind: pattern.kind });
      }
    }
  }
  const workerManifestPath = path.join(root, 'app', 'src', 'runtime', 'workers', 'generated-worker-manifest.json');
  const bundleOwnedSources = new Set();
  if (fs.existsSync(workerManifestPath)) {
    const workerManifest = readJson(workerManifestPath);
    for (const worker of workerManifest.workers ?? []) {
      for (const artifact of worker.artifacts ?? []) {
        if (String(artifact.url || '').startsWith('app/legacy-runtime/')) bundleOwnedSources.add(String(artifact.url));
      }
    }
  }
  const sorted = [...records.values()]
    .filter((record) => record.reason === 'legacy-bootstrap' || !bundleOwnedSources.has(record.sourceRelative))
    .sort((a, b) => a.route.localeCompare(b.route));
  const payload = {
    schemaVersion: 1,
    patchId: PATCH_ID,
    policyId: 'dadum.legacy-static-admission-v1',
    sourceRoot: 'app/legacy-runtime',
    records: sorted,
    recordCount: sorted.length,
    fullLegacyFileCount: walkFiles(legacyRoot).length,
  };
  payload.digest = sha256Bytes(canonicalJson(payload));
  return payload;
}

export function loadLockPromotionState({ root = ROOT } = {}) {
  const file = path.join(root, 'artifacts', 'runtime', 'TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json');
  if (!fs.existsSync(file)) return { file: null, promoted: false, state: 'MISSING', blockers: ['E_BUILD_EMIT_LOCK_NOT_PROMOTED'] };
  const receipt = readJson(file);
  const promoted = receipt.promoted === true && receipt.state === 'DEPENDENCY_LOCK_PROMOTED';
  return { file, receipt, promoted, state: receipt.state ?? 'UNKNOWN', blockers: promoted ? [] : ['E_BUILD_EMIT_LOCK_NOT_PROMOTED'] };
}

export function buildInputManifest({ root = ROOT } = {}) {
  const lock = loadLockPromotionState({ root });
  const runtimeSource = path.join(root, 'artifacts', 'runtime', 'generated-runtime-manifest.source.json');
  const workerSource = path.join(root, 'app', 'src', 'runtime', 'workers', 'generated-worker-manifest.json');
  const legacySource = path.join(root, 'app', 'src', 'legacy', 'generated-legacy-manifest.json');
  const toolchain = path.join(root, 'tools', 'toolchain-profile.json');
  const authorityRoots = [
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'electron.mjs',
    'preload.cjs',
    'tsconfig.json',
    'coi_server.js',
    'app',
    'tools',
    'native',
  ];
  const authorityRecords = [];
  for (const relative of authorityRoots) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) continue;
    if (fs.statSync(absolute).isFile()) authorityRecords.push(fileRecord(root, absolute));
    else authorityRecords.push(...walkFiles(absolute).map((file) => fileRecord(root, file)));
  }
  authorityRecords.sort((a, b) => a.path.localeCompare(b.path));
  const authority = { records: authorityRecords, digest: sha256Bytes(canonicalJson(authorityRecords)) };
  const base = {
    schemaVersion: 1,
    patchId: PATCH_ID,
    target: 'win32-x64',
    packageJsonSha256: sha256File(path.join(root, 'package.json')),
    packageLockSha256: sha256File(path.join(root, 'package-lock.json')),
    lockPromotionReceiptSha256: lock.file ? sha256File(lock.file) : null,
    lockPromotionState: lock.state,
    lockPromoted: lock.promoted,
    frozenCacheDigest: lock.receipt?.frozenCacheDigest ?? null,
    toolchainProfileDigest: fs.existsSync(toolchain) ? sha256File(toolchain) : null,
    buildAuthorityDigest: authority.digest,
    sourceTreeDigest: authority.digest,
    sourceRuntimeManifestDigest: fs.existsSync(runtimeSource) ? sha256File(runtimeSource) : null,
    workerSourceManifestDigest: fs.existsSync(workerSource) ? sha256File(workerSource) : null,
    legacySourceManifestDigest: fs.existsSync(legacySource) ? sha256File(legacySource) : null,
    networkPolicy: 'offline-build-v1',
  };
  return seal(base);
}

export function normalizeModuleId(root, value) {
  if (!value) return null;
  const clean = String(value).replace(/^\0+/, '').split('?')[0];
  if (path.isAbsolute(clean)) return path.relative(root, clean).replaceAll(path.sep, '/');
  return clean.replaceAll('\\', '/');
}

export function mapWorkerEntries({ sourceManifest, rollupGraph, root = ROOT }) {
  const chunks = rollupGraph.chunks ?? [];
  const mapping = [];
  for (const worker of sourceManifest.workers ?? []) {
    const sourceEntry = normalizeModuleId(root, worker.entryRelative);
    const matches = chunks.filter((chunk) => {
      const facade = normalizeModuleId(root, chunk.facadeModuleId);
      const modules = (chunk.moduleIds ?? chunk.modules ?? []).map((id) => normalizeModuleId(root, id));
      return facade === sourceEntry || modules.includes(sourceEntry);
    });
    if (matches.length !== 1) {
      const code = matches.length ? 'E_WORKER_EMITTED_ENTRY_AMBIGUOUS' : 'E_WORKER_EMITTED_ENTRY_MISSING';
      throw Object.assign(new Error(`${code}:${worker.workerId}`), { code });
    }
    mapping.push({
      workerId: worker.workerId,
      codecProtocolVersion: worker.codecProtocolVersion,
      controlProtocolVersion: worker.controlProtocolVersion,
      ownerRuntimeEncoderIds: worker.ownerRuntimeEncoderIds,
      transferPolicyId: worker.transferPolicyId,
      wasmPolicyId: worker.wasmPolicyId,
      sourceEntryIdentity: worker.entrySourceIdentity,
      sourceEntryRelative: worker.entryRelative,
      emittedEntryFileName: matches[0].fileName,
      emittedEntryUrl: routeForDistPath(matches[0].fileName),
      facadeModuleId: matches[0].facadeModuleId,
    });
  }
  return mapping.sort((a, b) => a.workerId.localeCompare(b.workerId));
}

export function collectChunkClosure(entryFileName, graph) {
  const byName = new Map((graph.chunks ?? []).map((chunk) => [chunk.fileName, chunk]));
  const seen = new Map();
  const edges = [];
  const queue = [{ fileName: entryFileName, parent: null, kind: 'manifest-reference' }];
  while (queue.length) {
    const next = queue.shift();
    if (seen.has(next.fileName)) {
      if (next.parent) edges.push({ from: next.parent, to: next.fileName, kind: next.kind });
      continue;
    }
    const chunk = byName.get(next.fileName);
    if (!chunk) throw Object.assign(new Error(`unresolved chunk ${next.fileName}`), { code: 'E_WORKER_CLOSURE_UNRESOLVED_IMPORT' });
    seen.set(next.fileName, chunk);
    if (next.parent) edges.push({ from: next.parent, to: next.fileName, kind: next.kind });
    for (const child of chunk.imports ?? []) queue.push({ fileName: child, parent: next.fileName, kind: 'static-import' });
    for (const child of chunk.dynamicImports ?? []) queue.push({ fileName: child, parent: next.fileName, kind: 'dynamic-import' });
  }
  return { chunks: [...seen.values()].sort((a, b) => a.fileName.localeCompare(b.fileName)), edges: edges.sort((a, b) => canonicalJson(a).localeCompare(canonicalJson(b))) };
}

export function emittedFileIndex(dist) {
  return new Map(walkFiles(dist).map((absolute) => {
    const relative = path.relative(dist, absolute).replaceAll(path.sep, '/');
    return [relative, { absolute, relative, url: routeForDistPath(relative), byteLength: fs.statSync(absolute).size, sha256: sha256File(absolute), ext: path.extname(relative).toLowerCase() }];
  }));
}

export async function probeServer(server, routes) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const results = [];
  try {
    for (const route of routes) {
      const response = await fetch(base + route.route);
      const bytes = Buffer.from(await response.arrayBuffer());
      results.push({
        route: route.route,
        status: response.status,
        bodySha256: sha256Bytes(bytes),
        byteLength: bytes.length,
        contentType: response.headers.get('content-type'),
        coop: response.headers.get('cross-origin-opener-policy'),
        coep: response.headers.get('cross-origin-embedder-policy'),
        corp: response.headers.get('cross-origin-resource-policy'),
        cacheControl: response.headers.get('cache-control'),
      });
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  return results;
}

export function createSyntheticStaticServer(root) {
  const canonicalRoot = path.resolve(root);
  return http.createServer((req, res) => {
    const headers = (contentType) => ({
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cache-Control': 'no-store',
      'Content-Type': contentType,
    });
    try {
      const rawUrl = req.url || '/';
      let decodedRawUrl = rawUrl;
      for (let pass = 0; pass < 3; pass += 1) {
        const next = decodeURIComponent(decodedRawUrl);
        if (next === decodedRawUrl) break;
        decodedRawUrl = next;
      }
      if (decodedRawUrl.split(/[?#]/, 1)[0].split(/[\\/]+/).includes('..')) {
        res.writeHead(403, headers('text/plain; charset=utf-8')); res.end('[Dadum] forbidden path'); return;
      }
      const url = new URL(rawUrl, 'http://127.0.0.1/');
      const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
      const file = path.resolve(canonicalRoot, rel);
      if (!file.startsWith(canonicalRoot + path.sep) && file !== canonicalRoot) {
        res.writeHead(403, headers('text/plain; charset=utf-8')); res.end('forbidden'); return;
      }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404, headers('text/plain; charset=utf-8')); res.end('[Dadum] 404 Not Found'); return;
      }
      res.writeHead(200, headers(mimeForRoute(rel)));
      fs.createReadStream(file).pipe(res);
    } catch (error) {
      res.writeHead(500, headers('text/plain; charset=utf-8')); res.end('[Dadum] Internal server error: ' + String(error?.message || error));
    }
  });
}

export function compareContentManifests(a, b) {
  const aa = new Map((a.records ?? []).map((x) => [x.path, x]));
  const bb = new Map((b.records ?? []).map((x) => [x.path, x]));
  const paths = [...new Set([...aa.keys(), ...bb.keys()])].sort();
  const differences = [];
  for (const file of paths) {
    const left = aa.get(file); const right = bb.get(file);
    if (!left || !right || left.byteLength !== right.byteLength || left.sha256 !== right.sha256) differences.push({ path: file, a: left ?? null, b: right ?? null });
  }
  return { equal: differences.length === 0, differences };
}

export function makeBlockedArtifact(name, blockers, extra = {}) {
  return seal({ schemaVersion: 1, patchId: PATCH_ID, artifact: name, status: 'BLOCKED_LOCK_NOT_PROMOTED', blockers: [...new Set(blockers)].sort(), ...extra });
}
