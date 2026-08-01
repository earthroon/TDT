import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const SPEC_ID = 'TDT-PROMOTION-BASELINE-00';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ARTIFACT_ROOT = path.join(ROOT, 'artifacts', 'promotion-baseline-00');
export const CANONICAL_TARGET = Object.freeze({ platform: 'win32', arch: 'x64', target: 'win32-x64' });
export const CANONICAL_TOOLCHAIN = Object.freeze({ nodeVersion: '22.16.0', npmVersion: '10.9.2', packageManager: 'npm' });
export const PRODUCTION_POINTER_PATHS = Object.freeze([
  'artifacts/promotion/TDT_EXPORT_PROMOTION_POINTER_V2.json',
  'artifacts/promotion/active-build.json',
  'artifacts/promotion/production-build.json',
]);

const EXCLUDED_ROOT_DIRS = new Set(['.git', 'node_modules', 'dist', 'release']);
const EXCLUDED_SOURCE_PREFIXES = [
  'artifacts/promotion-baseline-00/',
  'artifacts/runtime/TDT_PROMOTION_BASELINE_00_',
];

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (value[key] !== undefined) out[key] = canonicalize(value[key]);
    }
    return out;
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function prettyJson(value) {
  return JSON.stringify(canonicalize(value), null, 2) + '\n';
}

export function sha256Bytes(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function sha256File(file) {
  return sha256Bytes(fs.readFileSync(file));
}

export function hashIfFile(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile() ? sha256File(file) : null;
}

export function readJson(file, fallback = undefined) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) {
    if (fallback !== undefined) return fallback;
    throw new Error(`P0_JSON_READ_FAILED:${path.relative(ROOT, file)}:${error instanceof Error ? error.message : String(error)}`);
  }
}

export function ensureDirs() {
  for (const dir of ['input','lock','emit','package','runtime','save-smoke','worker-restart','test-pointer','failures','receipts']) {
    fs.mkdirSync(path.join(ARTIFACT_ROOT, dir), { recursive: true });
  }
}

export function seal(payload, excludedKeys = ['createdAt', 'completedAt']) {
  const digestInput = { ...payload };
  delete digestInput.selfDigest;
  for (const key of excludedKeys) delete digestInput[key];
  return { ...payload, selfDigest: sha256Bytes(canonicalJson(digestInput)) };
}

export function writeJsonAtomic(file, value, { appendOnly = false, allowByteIdentical = true } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const bytes = Buffer.from(prettyJson(value));
  if (fs.existsSync(file)) {
    const existing = fs.readFileSync(file);
    if (allowByteIdentical && existing.equals(bytes)) return { file, unchanged: true, sha256: sha256Bytes(existing) };
    if (appendOnly) throw new Error(`P0_APPEND_ONLY_COLLISION:${path.relative(ROOT, file)}`);
  }
  const temp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  const fd = fs.openSync(temp, 'wx');
  try {
    fs.writeFileSync(fd, bytes);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);
  try {
    const dirFd = fs.openSync(path.dirname(file), 'r');
    try { fs.fsyncSync(dirFd); } finally { fs.closeSync(dirFd); }
  } catch (_) {}
  return { file, unchanged: false, sha256: sha256Bytes(bytes) };
}

export function writeFailure(code, detail = {}, cause = null) {
  ensureDirs();
  const payload = seal({
    schemaVersion: 1,
    specId: SPEC_ID,
    status: 'FAIL',
    code,
    detail,
    cause: cause instanceof Error ? { name: cause.name, message: cause.message, stack: cause.stack ?? null } : cause,
    createdAt: new Date().toISOString(),
  });
  const name = `${nextSequence('failures')}-${sanitizeFilePart(code)}.json`;
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'failures', name), payload, { appendOnly: true });
  return payload;
}

export function sanitizeFilePart(value) {
  return String(value).replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 120) || 'unnamed';
}

export function nextSequence(category) {
  ensureDirs();
  const dir = path.join(ARTIFACT_ROOT, category);
  const values = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => /^([0-9]{4,})-/.exec(entry.name)?.[1])
    .filter(Boolean)
    .map(Number);
  return String((values.length ? Math.max(...values) : 0) + 1).padStart(4, '0');
}

export function appendReceipt(category, basename, payload) {
  const sealed = payload.selfDigest ? payload : seal(payload);
  const filename = `${nextSequence(category)}-${sanitizeFilePart(basename)}.json`;
  const target = path.join(ARTIFACT_ROOT, category, filename);
  writeJsonAtomic(target, sealed, { appendOnly: true });
  return { target, receipt: sealed, digest: sha256File(target) };
}

export function normalizedRelative(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

export function walkFiles(root, { include = null, exclude = null } = {}) {
  if (!fs.existsSync(root)) return [];
  const output = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      const rel = normalizedRelative(root, full);
      if (exclude?.(rel, entry)) continue;
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && (!include || include(rel, entry))) output.push(full);
    }
  };
  visit(root);
  return output;
}

export function contentManifest(root, { sourceTree = false, extraExcludes = [] } = {}) {
  const records = [];
  const files = walkFiles(root, {
    exclude: (rel, entry) => {
      const first = rel.split('/')[0];
      if (EXCLUDED_ROOT_DIRS.has(first)) return true;
      if (sourceTree && EXCLUDED_SOURCE_PREFIXES.some((prefix) => rel.startsWith(prefix))) return true;
      if (extraExcludes.some((prefix) => rel === prefix || rel.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`))) return true;
      return entry.isSymbolicLink?.() === true;
    },
  });
  for (const file of files) {
    const stat = fs.statSync(file);
    records.push({
      path: normalizedRelative(root, file),
      byteLength: stat.size,
      sha256: sha256File(file),
      role: process.platform === 'win32' ? windowsFileRole(file) : ((stat.mode & 0o111) ? 'executable' : 'data'),
    });
  }
  const digest = sha256Bytes(canonicalJson(records));
  return { schemaVersion: 1, rootRole: sourceTree ? 'canonical-source-tree' : 'content-tree', recordCount: records.length, records, digest };
}

function windowsFileRole(file) {
  const ext = path.extname(file).toLowerCase();
  if (['.exe','.dll','.node','.cmd','.bat','.ps1'].includes(ext)) return 'windows-executable';
  return 'data';
}

export function digestFileSet(relativePaths) {
  const records = relativePaths.map((relativePath) => {
    const file = path.join(ROOT, relativePath);
    return { path: relativePath, sha256: hashIfFile(file), byteLength: fs.existsSync(file) ? fs.statSync(file).size : null };
  });
  return { records, digest: sha256Bytes(canonicalJson(records)) };
}

export function promotionAuthorityDigest() {
  const toolRoot = path.join(ROOT, 'tools', 'promotion-baseline-00');
  const toolFiles = walkFiles(toolRoot).map((file) => normalizedRelative(ROOT, file));
  return digestFileSet([
    ...toolFiles,
    'specs/TDT-PROMOTION-BASELINE-00_CANONICAL_DEPENDENCY_LOCK_DUAL_CLEAN_EMIT_PACKAGED_ELECTRON_RUNTIME_ADMISSION_SPEC.md',
    'README_TDT_PROMOTION_BASELINE_00_APPLIED.md',
  ].sort());
}

export function exactSemver(value) {
  return typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
}

export function dependencyRootParity() {
  const pkg = readJson(path.join(ROOT, 'package.json'));
  const lock = readJson(path.join(ROOT, 'package-lock.json'));
  const root = lock.packages?.[''] ?? {};
  const groups = ['dependencies','devDependencies'];
  const mismatches = [];
  for (const group of groups) {
    const expected = pkg[group] ?? {};
    const actual = root[group] ?? {};
    for (const name of [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort()) {
      if (expected[name] !== actual[name]) mismatches.push({ group, name, expected: expected[name] ?? null, actual: actual[name] ?? null });
    }
  }
  const nonExact = groups.flatMap((group) => Object.entries(pkg[group] ?? {}).filter(([, version]) => !exactSemver(version)).map(([name, version]) => ({ group, name, version })));
  return { exact: mismatches.length === 0 && nonExact.length === 0, mismatches, nonExact };
}

export function currentToolchain() {
  const nodeVersion = process.versions.node;
  const npm = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--version'], { encoding: 'utf8', windowsHide: true });
  return { nodeVersion, npmVersion: String(npm.stdout || '').trim(), npmExitCode: npm.status, platform: process.platform, arch: process.arch };
}

export function run(command, args, { cwd = ROOT, env = process.env, timeoutMs = 600_000, stdio = 'pipe' } = {}) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', windowsHide: true, timeout: timeoutMs, stdio });
  return {
    command: path.basename(command),
    args,
    cwdRole: cwd === ROOT ? 'repo-root' : 'isolated-workspace',
    exitCode: result.status,
    signal: result.signal ?? null,
    timedOut: result.error?.code === 'ETIMEDOUT',
    durationMs: Date.now() - startedAt,
    stdout: stdio === 'pipe' ? redact(String(result.stdout ?? '')) : null,
    stderr: stdio === 'pipe' ? redact(String(result.stderr ?? '')) : null,
    error: result.error ? { code: result.error.code ?? null, message: result.error.message } : null,
  };
}

export function redact(value) {
  return String(value)
    .replace(/(?:_authToken|npm_token|node_auth_token)\s*[=:]\s*[^\s]+/gi, '$1=<redacted>')
    .replace(/https?:\/\/[^\s/@]+:[^\s/@]+@/g, 'https://<redacted>@')
    .replaceAll(os.homedir(), '<user-home>');
}

export function assert(condition, code, detail = {}) {
  if (!condition) {
    const error = new Error(code);
    error.code = code;
    error.detail = detail;
    throw error;
  }
}

export function assertCanonicalHost() {
  const toolchain = currentToolchain();
  assert(toolchain.platform === CANONICAL_TARGET.platform && toolchain.arch === CANONICAL_TARGET.arch, 'P0A_INPUT_AUTHORITY_MISMATCH', { expected: CANONICAL_TARGET, actual: toolchain });
  assert(toolchain.nodeVersion === CANONICAL_TOOLCHAIN.nodeVersion && toolchain.npmVersion === CANONICAL_TOOLCHAIN.npmVersion, 'P0A_INPUT_AUTHORITY_MISMATCH', { expected: CANONICAL_TOOLCHAIN, actual: toolchain });
  return toolchain;
}

export function productionPointerPreflight() {
  const records = PRODUCTION_POINTER_PATHS.map((relativePath) => {
    const file = path.join(ROOT, relativePath);
    return { path: relativePath, exists: fs.existsSync(file), sha256: hashIfFile(file), byteLength: fs.existsSync(file) ? fs.statSync(file).size : null };
  });
  return { records, digest: sha256Bytes(canonicalJson(records)) };
}

export function assertProductionPointersUnchanged(before) {
  const after = productionPointerPreflight();
  assert(before.digest === after.digest, 'P0_PRODUCTION_POINTER_MUTATED', { before, after });
  return after;
}

export function childReceipt(pathname, validator, code) {
  const file = path.join(ROOT, pathname);
  assert(fs.existsSync(file), code, { missing: pathname });
  const value = readJson(file);
  assert(validator(value), code, { pathname, value });
  return { pathname, value, sha256: sha256File(file) };
}

export function admittedChildReceipts({ requirePromoted = true } = {}) {
  const lock = childReceipt('artifacts/runtime/TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json', (value) => !requirePromoted || (value.promoted === true && value.state === 'DEPENDENCY_LOCK_PROMOTED'), 'P0A_CHILD_RECEIPT_REJECTED');
  const emit = childReceipt('artifacts/runtime/TDT_BUILD_EMIT_01_EMITTED_ARTIFACT_IDENTITY_RECEIPT.json', (value) => !requirePromoted || (value.status === 'EMITTED_ARTIFACT_IDENTITY_VERIFIED' && value.productionBytesObserved === true), 'P0B_CHILD_RECEIPT_REJECTED');
  return { lock, emit };
}

export function baselineInputManifest({ requirePromotedChildren = false } = {}) {
  ensureDirs();
  const source = contentManifest(ROOT, { sourceTree: true });
  const lockReceiptFile = path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json');
  const cacheManifestFile = path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_CACHE_CLOSURE_MANIFEST.json');
  const registryFile = path.join(ROOT, 'tools/registry-input-profile.json');
  const toolchainFile = path.join(ROOT, 'tools/toolchain-profile.json');
  const pointer = productionPointerPreflight();
  const buildAuthority = digestFileSet(['vite.config.ts','tools/build-emit-01-lib.mjs','tools/run-build-emit-01.mjs','package.json']);
  const electronAuthority = digestFileSet(['electron.mjs','preload.cjs','app/electron/static-coi-server.mjs','app/electron/ep03-e2e-guard.mjs']);
  const runtimeApi = digestFileSet(['app/src/env.d.ts','app/src/boot/bootstrap-renderer.ts','app/src/runtime/export/export-authority-service.ts','app/src/runtime/workers/encoder-worker-broker-service.ts','app/src/runtime/workers/encoder-worker-types.ts','app/src/runtime/promotion/promotion-baseline-00-harness.ts']);
  const promotionAuthority = promotionAuthorityDigest();
  const lockReceipt = readJson(lockReceiptFile, {});
  if (requirePromotedChildren) assert(lockReceipt.promoted === true, 'P0A_CHILD_RECEIPT_REJECTED', { state: lockReceipt.state ?? null });
  const cacheManifest = readJson(cacheManifestFile, {});
  const payload = {
    schemaVersion: 1,
    specId: SPEC_ID,
    target: CANONICAL_TARGET.target,
    nodeVersion: CANONICAL_TOOLCHAIN.nodeVersion,
    npmVersion: CANONICAL_TOOLCHAIN.npmVersion,
    packageJsonSha256: sha256File(path.join(ROOT, 'package.json')),
    packageLockSha256: sha256File(path.join(ROOT, 'package-lock.json')),
    lockPromotionReceiptSha256: hashIfFile(lockReceiptFile),
    registryProfileSha256: hashIfFile(registryFile),
    frozenCacheManifestSha256: hashIfFile(cacheManifestFile),
    frozenCacheClosureDigest: cacheManifest.digest ?? cacheManifest.cacheClosureDigest ?? null,
    sourceTreeDigest: source.digest,
    toolchainProfileSha256: hashIfFile(toolchainFile),
    buildAuthoritySha256: buildAuthority.digest,
    electronAuthoritySha256: electronAuthority.digest,
    runtimeApiSchemaSha256: runtimeApi.digest,
    promotionAuthoritySha256: promotionAuthority.digest,
    productionPointerPreflightSha256: pointer.digest,
    createdAt: new Date().toISOString(),
  };
  return { manifest: seal(payload), source, pointer, buildAuthority, electronAuthority, runtimeApi, promotionAuthority };
}

export function writeCanonicalBaselineInput(options = {}) {
  const generated = baselineInputManifest(options);
  const target = path.join(ARTIFACT_ROOT, 'input', 'canonical-baseline-input.json');
  writeJsonAtomic(target, generated.manifest, { appendOnly: false, allowByteIdentical: true });
  return { ...generated, target, digest: generated.manifest.selfDigest };
}

export function cleanCopy(source, destination, { excludeArtifacts = true } = {}) {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(source, destination, {
    recursive: true,
    dereference: false,
    filter: (entry) => {
      const rel = normalizedRelative(source, entry);
      if (!rel) return true;
      const first = rel.split('/')[0];
      if (EXCLUDED_ROOT_DIRS.has(first)) return false;
      if (excludeArtifacts && rel.startsWith('artifacts/promotion-baseline-00/')) return false;
      return true;
    },
  });
}

export function isolatedNpmEnv(cacheDir) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'dadum-p0-home-'));
  return {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    npm_config_cache: cacheDir,
    npm_config_offline: 'true',
    npm_config_ignore_scripts: 'true',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_update_notifier: 'false',
    npm_config_install_strategy: 'hoisted',
    npm_config_strict_peer_deps: 'true',
    DADUM_PROMOTION_BASELINE_00: '1',
  };
}

export function normalizedPackageManifest(appDir) {
  const manifest = contentManifest(appDir, { extraExcludes: [] });
  return seal({ schemaVersion: 1, specId: SPEC_ID, appDirectoryRole: 'electron-unpacked-app', records: manifest.records, packageContentId: manifest.digest });
}

export function findLatestReceipt(category, suffix) {
  const dir = path.join(ARTIFACT_ROOT, category);
  if (!fs.existsSync(dir)) return null;
  const matches = fs.readdirSync(dir).filter((name) => name.endsWith(suffix)).sort();
  return matches.length ? path.join(dir, matches.at(-1)) : null;
}

export function parseArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

export function boolArg(name, fallback = false) {
  const value = parseArg(name, null);
  if (value == null) return fallback;
  return value === '1' || value === 'true';
}

export function copyReceiptSet(relativeFiles, destinationDir) {
  fs.mkdirSync(destinationDir, { recursive: true });
  const records = [];
  for (const relativeFile of relativeFiles) {
    const source = path.join(ROOT, relativeFile);
    assert(fs.existsSync(source), 'P0_CHILD_RECEIPT_MISSING', { relativeFile });
    const destination = path.join(destinationDir, path.basename(relativeFile));
    fs.copyFileSync(source, destination);
    records.push({ path: relativeFile, copiedAs: normalizedRelative(ROOT, destination), sha256: sha256File(destination) });
  }
  return { records, digest: sha256Bytes(canonicalJson(records)) };
}

export function structuralProbe(file) {
  const bytes = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') {
    assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'P0C_SAVE_SMOKE_STRUCTURE_FAILED', { file, ext });
    return { format: 'png', signature: true, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), bitDepth: bytes[24], colorType: bytes[25] };
  }
  if (ext === '.webp') {
    assert(bytes.subarray(0,4).toString('ascii') === 'RIFF' && bytes.subarray(8,12).toString('ascii') === 'WEBP', 'P0C_SAVE_SMOKE_STRUCTURE_FAILED', { file, ext });
    const chunk = bytes.subarray(12,16).toString('ascii');
    return { format: 'webp', signature: true, primaryChunk: chunk, lossless: chunk === 'VP8L' };
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    assert(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9, 'P0C_SAVE_SMOKE_STRUCTURE_FAILED', { file, ext });
    return parseJpeg(bytes);
  }
  if (ext === '.jxl') {
    const container = bytes.length >= 12 && bytes.subarray(4,12).equals(Buffer.from([0x4a,0x58,0x4c,0x20,0x0d,0x0a,0x87,0x0a]));
    const codestream = bytes[0] === 0xff && bytes[1] === 0x0a;
    assert(container || codestream, 'P0C_SAVE_SMOKE_STRUCTURE_FAILED', { file, ext });
    return { format: 'jxl', signature: true, container, codestream };
  }
  if (ext === '.psd') {
    assert(bytes.subarray(0,4).toString('ascii') === '8BPS', 'P0C_SAVE_SMOKE_STRUCTURE_FAILED', { file, ext });
    return { format: 'psd', signature: true, version: bytes.readUInt16BE(4), channels: bytes.readUInt16BE(12), height: bytes.readUInt32BE(14), width: bytes.readUInt32BE(18), depth: bytes.readUInt16BE(22), colorMode: bytes.readUInt16BE(24) };
  }
  throw new Error(`P0C_SAVE_SMOKE_STRUCTURE_UNSUPPORTED:${ext}`);
}

function parseJpeg(bytes) {
  let offset = 2;
  let frame = null;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    const length = bytes.readUInt16BE(offset); offset += 2;
    if (marker === 0xc0 || marker === 0xc2) {
      const precision = bytes[offset];
      const height = bytes.readUInt16BE(offset + 1);
      const width = bytes.readUInt16BE(offset + 3);
      const components = bytes[offset + 5];
      const sampling = [];
      for (let index = 0; index < components; index += 1) sampling.push(bytes[offset + 7 + index * 3]);
      frame = { marker: marker === 0xc0 ? 'SOF0' : 'SOF2', precision, width, height, components, sampling, subsampling444: sampling.every((value) => value === 0x11) };
      break;
    }
    offset += length - 2;
  }
  assert(frame, 'P0C_SAVE_SMOKE_STRUCTURE_FAILED', { format: 'jpg', reason: 'frame-missing' });
  return { format: 'jpg', signature: true, ...frame };
}

export function sourceMutationSnapshot() {
  const source = contentManifest(ROOT, { sourceTree: true });
  return { digest: source.digest, recordCount: source.recordCount };
}

export function runId(canonicalInputDigest, packageContentId = 'pending') {
  const sequence = nextSequence('receipts');
  return `${canonicalInputDigest.slice(0,12)}-${String(packageContentId).slice(0,12)}-${sequence}`;
}
