import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const PATCH_ID = 'TDT-ACTIVE-GRAPH-01';
export const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
export const outDir = path.join(projectRoot, 'artifacts/active-graph-01/source-bake');

export function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
export function readJson(relative) { return JSON.parse(fs.readFileSync(path.join(projectRoot, relative), 'utf8')); }
export function sha256Bytes(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
export function sha256File(relativeOrAbsolute) {
  const file = path.isAbsolute(relativeOrAbsolute) ? relativeOrAbsolute : path.join(projectRoot, relativeOrAbsolute);
  return sha256Bytes(fs.readFileSync(file));
}
export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
}
export function canonicalJson(value) { return JSON.stringify(canonicalize(value)); }
export function writeJson(relativeOrAbsolute, value) {
  const file = path.isAbsolute(relativeOrAbsolute) ? relativeOrAbsolute : path.join(projectRoot, relativeOrAbsolute);
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
export function writeCanonicalReceipt(relative, payload, digestField = 'receiptDigest') {
  const unsigned = { ...payload, [digestField]: null };
  const digest = sha256Bytes(canonicalJson(unsigned));
  const signed = { ...unsigned, [digestField]: digest };
  writeJson(relative, signed);
  return signed;
}
export function sourceRecord(sourceRelative) {
  const absolute = path.join(projectRoot, sourceRelative);
  const bytes = fs.readFileSync(absolute);
  return { sourceRelative, sourceSha256: sha256Bytes(bytes), sourceByteLength: bytes.byteLength };
}
export function nodeIdFor(sourceRelative) {
  return `dadum.node.${sourceRelative.replace(/^app\//, '').replace(/[^A-Za-z0-9]+/g, '.').replace(/^\.|\.$/g, '').toLowerCase()}`;
}
export function detectKind(sourceRelative, role = null) {
  if (role === 'worker-entry') return 'worker-entry';
  if (role === 'worker-child') return 'worker-child';
  const ext = path.extname(sourceRelative).toLowerCase();
  if (ext === '.wasm') return 'wasm-module';
  if (ext === '.node') return 'native-addon';
  if (ext === '.wgsl') return 'shader-wgsl';
  if (['.glsl', '.frag', '.vert'].includes(ext)) return 'shader-glsl';
  if (ext === '.json') return 'json-config';
  if (['.icc', '.icm'].includes(ext)) return 'icc-profile';
  if (ext === '.css') return 'stylesheet';
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) return 'image-asset';
  if (['.mjs', '.ts', '.tsx', '.vue'].includes(ext)) return 'esm-module';
  if (['.js', '.cjs'].includes(ext)) return 'classic-script';
  return 'binary-asset';
}
export function findPackagedBaselineReceipt() {
  const candidates = [
    'artifacts/promotion-baseline-00/receipts/packaged-baseline-receipt.json',
    'artifacts/promotion-baseline-00/receipts/final-baseline-receipt.json',
  ];
  for (const relative of candidates) {
    const absolute = path.join(projectRoot, relative);
    if (!fs.existsSync(absolute)) continue;
    const parsed = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (parsed.state === 'PACKAGED_BASELINE_VERIFIED' || parsed.status === 'PACKAGED_BASELINE_VERIFIED') return { relative, digest: sha256File(absolute), receipt: parsed };
  }
  return null;
}
export function listFiles(rootRelative) {
  const root = path.join(projectRoot, rootRelative);
  const out = [];
  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) out.push(path.relative(projectRoot, absolute).replaceAll('\\','/'));
    }
  };
  visit(root);
  return out;
}
export function stableSortRecords(records, keys) {
  return [...records].sort((a,b) => {
    for (const key of keys) {
      const av = String(a[key] ?? ''); const bv = String(b[key] ?? '');
      if (av < bv) return -1; if (av > bv) return 1;
    }
    return 0;
  });
}
