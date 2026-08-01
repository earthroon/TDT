import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalJson, sha256Bytes } from './runtime-manifest-lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const appRoot = path.join(root, 'app');
const legacyRoot = path.join(appRoot, 'legacy-runtime');
const sourceManifestPath = path.join(root, 'artifacts', 'runtime', 'generated-runtime-manifest.source.json');
const sourceWorkerManifestPath = path.join(appRoot, 'src', 'runtime', 'workers', 'generated-worker-manifest.json');
const legacyAdmissionPath = path.join(appRoot, 'src', 'legacy', 'generated-legacy-static-admission.json');

const MIME = new Map([
  ['.js', 'application/javascript; charset=utf-8'], ['.mjs', 'application/javascript; charset=utf-8'],
  ['.cjs', 'application/javascript; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.html', 'text/html; charset=utf-8'],
  ['.wasm', 'application/wasm'], ['.wgsl', 'text/plain; charset=utf-8'], ['.glsl', 'text/plain; charset=utf-8'],
  ['.frag', 'text/plain; charset=utf-8'], ['.vert', 'text/plain; charset=utf-8'], ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.webp', 'image/webp'], ['.svg', 'image/svg+xml'],
  ['.icc', 'application/vnd.iccprofile'], ['.cube', 'text/plain; charset=utf-8']
]);

function normalizeModuleId(value) {
  if (!value) return null;
  const clean = String(value).replace(/^\0+/, '').split('?')[0];
  return path.isAbsolute(clean) ? path.relative(root, clean).replaceAll(path.sep, '/') : clean.replaceAll('\\', '/');
}

function sourceManifest(profile) {
  const base = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
  const payload = {
    ...base,
    profile,
    promotable: false,
    candidateState: base.lockConsistency?.consistent === true ? 'DEPENDENCY_LOCK_VERIFIED' : 'SOURCE_BAKED_UNPROMOTED',
    artifactVerificationMode: 'source-graph-only',
  };
  delete payload.selfDigest;
  return { ...payload, selfDigest: sha256Bytes(canonicalJson(payload)) };
}

function legacyAdmission() {
  if (!fs.existsSync(legacyAdmissionPath)) throw new Error('E_LEGACY_RAW_ADMISSION_UNDECLARED');
  return JSON.parse(fs.readFileSync(legacyAdmissionPath, 'utf8'));
}

export function dadumRuntimeManifestPlugin({ profile = 'development' } = {}) {
  return {
    name: 'dadum-runtime-manifest',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (url.pathname === '/dadum-runtime-manifest.json') {
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(sourceManifest('development')));
          return;
        }
        if (url.pathname === '/dadum-runtime-worker-manifest.json') {
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end(fs.readFileSync(sourceWorkerManifestPath, 'utf8'));
          return;
        }
        if (url.pathname === '/dadum-vite-entry-manifest.json') {
          const dev = { schemaVersion: 2, patchId: 'TDT-BUILD-EMIT-01', profile: 'development', rendererEntry: '/src/main.ts', chunks: [], assets: [] };
          const digest = sha256Bytes(canonicalJson(dev));
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ...dev, digest }));
          return;
        }
        if (url.pathname.startsWith('/legacy/')) {
          const admission = legacyAdmission();
          const record = admission.records.find((item) => item.route === url.pathname);
          if (!record) {
            res.statusCode = 404;
            res.end('legacy asset not admitted');
            return;
          }
          const filePath = path.resolve(root, record.sourceRelative);
          if (!filePath.startsWith(path.resolve(legacyRoot) + path.sep) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            res.statusCode = 404;
            res.end('legacy asset missing');
            return;
          }
          res.setHeader('content-type', MIME.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        next();
      });
    },
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle)
        .filter((item) => item.type === 'chunk')
        .map((item) => ({
          fileName: item.fileName,
          name: item.name,
          facadeModuleId: normalizeModuleId(item.facadeModuleId),
          moduleIds: Object.keys(item.modules ?? {}).map(normalizeModuleId).sort(),
          isEntry: item.isEntry,
          isDynamicEntry: item.isDynamicEntry,
          imports: [...item.imports].sort(),
          dynamicImports: [...item.dynamicImports].sort(),
          referencedFiles: [...item.referencedFiles].sort(),
        }))
        .sort((a, b) => a.fileName.localeCompare(b.fileName));
      const assets = Object.values(bundle)
        .filter((item) => item.type === 'asset')
        .map((item) => ({
          fileName: item.fileName,
          name: item.name ?? null,
          originalFileNames: [...(item.originalFileNames ?? [])].map(normalizeModuleId).sort(),
          names: [...(item.names ?? [])].sort(),
          byteLength: typeof item.source === 'string' ? Buffer.byteLength(item.source) : item.source.byteLength,
        }))
        .sort((a, b) => a.fileName.localeCompare(b.fileName));
      const rendererEntries = chunks.filter((chunk) => chunk.isEntry && chunk.facadeModuleId === 'app/src/main.ts');
      const payload = {
        schemaVersion: 2,
        patchId: 'TDT-BUILD-EMIT-01',
        profile: 'production',
        rendererEntry: rendererEntries.length === 1 ? rendererEntries[0].fileName : null,
        chunks,
        assets,
      };
      const entryManifest = { ...payload, digest: sha256Bytes(canonicalJson(payload)) };
      this.emitFile({ type: 'asset', fileName: 'dadum-vite-entry-manifest.json', source: JSON.stringify(entryManifest, null, 2) + '\n' });
      const runtime = sourceManifest(profile === 'production' ? 'production' : profile);
      this.emitFile({ type: 'asset', fileName: 'dadum-runtime-manifest.json', source: JSON.stringify(runtime, null, 2) + '\n' });

      const admission = legacyAdmission();
      for (const record of admission.records) {
        const filePath = path.resolve(root, record.sourceRelative);
        if (!filePath.startsWith(path.resolve(legacyRoot) + path.sep)) throw new Error('E_EMITTED_PATH_ESCAPE');
        this.emitFile({ type: 'asset', fileName: record.route.replace(/^\//, ''), source: fs.readFileSync(filePath) });
      }
    },
  };
}
