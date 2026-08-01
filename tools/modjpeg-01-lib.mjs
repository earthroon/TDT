import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts', 'runtime');
export const PATCH_ID = 'TDT-MODJPEG-01';
export const CANONICAL_MODULE_SHA256 = '6c951106e5cc2b68b06b8f6290e448a892c2a31da017f3c5946f5fb7903b6166';
export const CANONICAL_WASM_SHA256 = '6f669d33e1d7f47f95ca14c4562bbb55985942f5c43a01521aeb6f01dd2e0a14';
export const CANONICAL_ABI = Object.freeze(['_encode_mozjpeg_RGB','_jpgbuffer_ptr','_jpgbuffer_len','_jpgbuffer_free','_malloc','_free']);
export const COI_HEADERS = Object.freeze({
  coop: 'same-origin',
  coep: 'require-corp',
  corp: 'same-origin',
  cacheControl: 'no-store',
});

export const canonicalize = (value) => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])) : value;
export const canonicalJson = (value) => JSON.stringify(canonicalize(value));
export const sha256Bytes = (value) => crypto.createHash('sha256').update(value).digest('hex');
export const sha256File = (file) => sha256Bytes(fs.readFileSync(file));
export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
export function seal(value, field = 'selfDigest') { const out = { ...value }; delete out[field]; out[field] = sha256Bytes(canonicalJson(out)); return out; }
export function verifySeal(value, field = 'selfDigest') { const expected = value?.[field]; if (!/^[0-9a-f]{64}$/.test(String(expected || ''))) return false; const base = { ...value }; delete base[field]; return expected === sha256Bytes(canonicalJson(base)); }

export function inspectCanonicalArtifact() {
  const modulePath = path.join(ROOT, 'app/legacy-runtime/encoders/libmodjpeg_wasm.mjs');
  const wasmPath = path.join(ROOT, 'app/legacy-runtime/wasm/libmodjpeg_wasm.wasm');
  const glue = fs.readFileSync(modulePath, 'utf8');
  const pool = Number(glue.match(/var pthreadPoolSize=(\d+)/)?.[1] ?? NaN);
  const missingAbi = CANONICAL_ABI.filter((symbol) => !glue.includes(symbol));
  return Object.freeze({
    modulePath: path.relative(ROOT, modulePath).replaceAll(path.sep, '/'),
    wasmPath: path.relative(ROOT, wasmPath).replaceAll(path.sep, '/'),
    moduleSha256: sha256File(modulePath),
    wasmSha256: sha256File(wasmPath),
    artifactBytesPreserved: sha256File(modulePath) === CANONICAL_MODULE_SHA256 && sha256File(wasmPath) === CANONICAL_WASM_SHA256,
    pthreadPoolSize: pool,
    sharedMemory: glue.includes('shared:true'),
    sharedMemoryInitialBytes: 268435456,
    sharedMemoryMaximumBytes: 2147483648,
    pthreadSymbolCount: (glue.match(/pthread/gi) || []).length,
    childWorkerReferenceCount: (glue.match(/new Worker\(/g) || []).length,
    terminateAllThreadsPresent: glue.includes('terminateAllThreads'),
    mainScriptUrlOrBlobPresent: glue.includes('mainScriptUrlOrBlob'),
    missingAbi,
    abiPreserved: missingAbi.length === 0,
  });
}

export function coiSourceContract() {
  const vite = fs.readFileSync(path.join(ROOT, 'vite.config.ts'), 'utf8');
  const electron = fs.readFileSync(path.join(ROOT, 'app/electron/static-coi-server.mjs'), 'utf8');
  const has = (text, name, value) => text.includes(`'${name}': '${value}'`);
  return Object.freeze({
    viteDev: has(vite, 'Cross-Origin-Opener-Policy', 'same-origin') && has(vite, 'Cross-Origin-Embedder-Policy', 'require-corp') && has(vite, 'Cross-Origin-Resource-Policy', 'same-origin') && vite.includes('server: { headers: COI_HEADERS }'),
    vitePreview: has(vite, 'Cross-Origin-Opener-Policy', 'same-origin') && has(vite, 'Cross-Origin-Embedder-Policy', 'require-corp') && has(vite, 'Cross-Origin-Resource-Policy', 'same-origin') && vite.includes('preview: { headers: COI_HEADERS }'),
    electron: electron.includes("'Cross-Origin-Opener-Policy': 'same-origin'") && electron.includes("'Cross-Origin-Embedder-Policy': 'require-corp'") && electron.includes("'Cross-Origin-Resource-Policy': 'same-origin'"),
    wasmMime: electron.includes("['.wasm', 'application/wasm']"),
    noStore: vite.includes("'Cache-Control': 'no-store'") && electron.includes("'Cache-Control': 'no-store'"),
  });
}
