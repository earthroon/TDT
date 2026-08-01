import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts', 'runtime');
export const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
};
export const canonicalJson = (value) => JSON.stringify(canonicalize(value));
export const sha256Bytes = (value) => crypto.createHash('sha256').update(value).digest('hex');
export const sha256File = (file) => sha256Bytes(fs.readFileSync(file));
export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
export function walkFiles(rootDir) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) out.push(absolute);
    }
  };
  visit(rootDir);
  return out;
}
export function exactVersion(value) {
  return typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
}
export function dependencyRootReport(root = ROOT) {
  const pkg = readJson(path.join(root, 'package.json'));
  const lock = readJson(path.join(root, 'package-lock.json'));
  const lockRoot = lock.packages?.[''] ?? {};
  const groups = ['dependencies', 'devDependencies'];
  const mismatches = [];
  for (const group of groups) {
    const expected = pkg[group] ?? {};
    const actual = lockRoot[group] ?? {};
    const names = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
    for (const name of names) {
      if (expected[name] !== actual[name]) mismatches.push({ group, name, expected: expected[name] ?? null, actual: actual[name] ?? null });
    }
  }
  const directVersionsExact = groups.every((group) => Object.values(pkg[group] ?? {}).every(exactVersion));
  const packageEntries = Object.entries(lock.packages ?? {}).filter(([name]) => name !== '');
  const integrityMissing = [];
  const resolvedMissing = [];
  for (const [name, record] of packageEntries) {
    if (record.link) continue;
    if (!record.resolved) resolvedMissing.push(name);
    if (!record.integrity && !record.inBundle) integrityMissing.push(name);
  }
  const consistent = mismatches.length === 0 && directVersionsExact && integrityMissing.length === 0 && resolvedMissing.length === 0;
  return {
    schemaVersion: 1,
    policyId: 'exact-direct-version-v1',
    consistent,
    directVersionsExact,
    rootGraphExact: mismatches.length === 0,
    mismatches,
    packageEntryCount: packageEntries.length,
    integrityMissing,
    resolvedMissing,
    packageJsonSha256: sha256File(path.join(root, 'package.json')),
    packageLockSha256: sha256File(path.join(root, 'package-lock.json')),
    dependencyGraphDigest: sha256Bytes(canonicalJson({
      dependencies: pkg.dependencies ?? {},
      devDependencies: pkg.devDependencies ?? {},
      lockPackages: lock.packages ?? {},
    })),
  };
}
export function fileRecord(root, file) {
  return {
    path: path.relative(root, file).replaceAll(path.sep, '/'),
    byteLength: fs.statSync(file).size,
    sha256: sha256File(file),
  };
}
export function contentManifest(rootDir, { excludes = [] } = {}) {
  const excluded = excludes.map((item) => item.replaceAll('\\','/'));
  const records = walkFiles(rootDir).filter((file) => {
    const relative = path.relative(rootDir, file).replaceAll(path.sep, '/');
    return !excluded.some((prefix) => relative === prefix || relative.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`));
  }).map((file) => fileRecord(rootDir, file));
  return { records, digest: sha256Bytes(canonicalJson(records)) };
}
