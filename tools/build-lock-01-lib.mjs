import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const ROOT = process.cwd();
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts', 'runtime');
export const PATCH_ID = 'TDT-BUILD-LOCK-01';
export const INPUT_PROFILE_PATH = path.join(ROOT, 'tools', 'dependency-input-profile.json');
export const REGISTRY_PROFILE_PATH = path.join(ROOT, 'tools', 'registry-input-profile.json');
export const NPMRC_PATH = path.join(ROOT, 'tools', 'npmrc.lock-recovery');
export const TOOLCHAIN_PATH = path.join(ROOT, 'tools', 'toolchain-profile.json');

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
export const atomicWriteJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}-${crypto.randomBytes(8).toString('hex')}`;
  const fd = fs.openSync(temp, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify(value, null, 2) + '\n');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);
  const dirFd = fs.openSync(path.dirname(file), 'r');
  try { fs.fsyncSync(dirFd); } finally { fs.closeSync(dirFd); }
};
export const nowIso = () => new Date().toISOString();
export const rel = (file, root = ROOT) => path.relative(root, file).replaceAll(path.sep, '/');
export const exactVersion = (value) => typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
export const publicOriginDigest = (raw) => {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return sha256Bytes(`${url.protocol}//${url.host}`);
  } catch {
    return sha256Bytes(String(raw));
  }
};
export const redactText = (text) => String(text ?? '')
  .replace(/(npm_[A-Za-z0-9]{20,}|_authToken\s*=\s*)[^\s]+/gi, '$1<redacted>')
  .replace(/(password|_password|username)\s*=\s*[^\s]+/gi, '$1=<redacted>')
  .replace(/https?:\/\/[^\s"')]+/g, '<registry-origin-redacted>')
  .replace(new RegExp(os.homedir().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '<home>')
  .replace(/\/tmp\/dadum-build-lock-01\/[^\s\"']+/g, '<build-lock-workspace>')
  .replace(/[A-Za-z]:\\[^\s\"']*dadum-build-lock-01[^\s\"']*/g, '<build-lock-workspace>');

export function walkFiles(rootDir, { excludeNames = new Set(), followSymlinks = false } = {}) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (excludeNames.has(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) out.push(absolute);
      else if (entry.isSymbolicLink() && followSymlinks) {
        const stat = fs.statSync(absolute);
        if (stat.isDirectory()) visit(absolute); else if (stat.isFile()) out.push(absolute);
      }
    }
  };
  visit(rootDir);
  return out;
}

export function dependencyRootReport(root = ROOT, lockFile = path.join(root, 'package-lock.json')) {
  const pkg = readJson(path.join(root, 'package.json'));
  const lock = readJson(lockFile);
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
  const unsupportedSources = [];
  const insecureTarballs = [];
  for (const [name, record] of packageEntries) {
    if (record.link) continue;
    if (!record.resolved) resolvedMissing.push(name);
    if (!record.integrity && !record.inBundle) integrityMissing.push(name);
    const resolved = String(record.resolved ?? '');
    if (resolved.startsWith('http://')) insecureTarballs.push(name);
    if (/^(?:git\+ssh|git\+file|file:|link:)/i.test(resolved)) unsupportedSources.push({ name, resolvedScheme: resolved.split(':')[0] });
  }
  const consistent = lock.lockfileVersion === 3 && mismatches.length === 0 && directVersionsExact && integrityMissing.length === 0 && resolvedMissing.length === 0 && unsupportedSources.length === 0 && insecureTarballs.length === 0;
  return {
    schemaVersion: 2,
    policyId: 'dadum.build-lock-01-lock-graph-v2',
    consistent,
    lockfileVersion: lock.lockfileVersion,
    directVersionsExact,
    rootGraphExact: mismatches.length === 0,
    mismatches,
    packageEntryCount: packageEntries.length,
    integrityMissing,
    resolvedMissing,
    unsupportedSources,
    insecureTarballs,
    packageJsonSha256: sha256File(path.join(root, 'package.json')),
    packageLockSha256: sha256File(lockFile),
    dependencyGraphDigest: sha256Bytes(canonicalJson({ dependencies: pkg.dependencies ?? {}, devDependencies: pkg.devDependencies ?? {}, lockPackages: lock.packages ?? {} })),
  };
}

export function sanitizedEnvironment(env = process.env) {
  const allowedNpm = new Set([
    'NPM_CONFIG_USERCONFIG','NPM_CONFIG_GLOBALCONFIG','NPM_CONFIG_CACHE','NPM_CONFIG_REGISTRY',
    'NPM_CONFIG_STRICT_SSL','NPM_CONFIG_IGNORE_SCRIPTS','NPM_CONFIG_AUDIT','NPM_CONFIG_FUND',
    'NPM_CONFIG_UPDATE_NOTIFIER','NPM_CONFIG_INSTALL_STRATEGY','NPM_CONFIG_LEGACY_PEER_DEPS',
    'NPM_CONFIG_STRICT_PEER_DEPS','NPM_CONFIG_OFFLINE','NPM_CONFIG_PREFER_OFFLINE','NPM_CONFIG_PREFER_ONLINE'
  ]);
  const unknownNpmConfig = Object.keys(env).filter((key) => key.startsWith('NPM_CONFIG_') && !allowedNpm.has(key)).sort();
  return {
    nodeOptionsEmpty: !env.NODE_OPTIONS,
    unknownNpmConfig,
    ci: env.CI === 'true' || env.CI === '1',
    pathDigest: env.PATH ? sha256Bytes(env.PATH) : null,
    homePolicy: 'isolated-run-home-v1',
    tempPolicy: 'isolated-run-temp-v1',
  };
}

export function isolatedNpmEnvironment({ workspace, cacheDir, registry, offline = false }) {
  const home = path.join(workspace, 'home');
  const temp = path.join(workspace, 'tmp');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(temp, { recursive: true });
  fs.mkdirSync(cacheDir, { recursive: true });
  const env = {
    PATH: process.env.PATH ?? '',
    SystemRoot: process.env.SystemRoot ?? '',
    ComSpec: process.env.ComSpec ?? '',
    HOME: home,
    USERPROFILE: home,
    TMPDIR: temp,
    TEMP: temp,
    TMP: temp,
    CI: '1',
    NODE_OPTIONS: '',
    NPM_CONFIG_USERCONFIG: NPMRC_PATH,
    NPM_CONFIG_GLOBALCONFIG: process.platform === 'win32' ? 'NUL' : '/dev/null',
    NPM_CONFIG_CACHE: cacheDir,
    NPM_CONFIG_REGISTRY: registry,
    NPM_CONFIG_STRICT_SSL: 'true',
    NPM_CONFIG_IGNORE_SCRIPTS: 'true',
    NPM_CONFIG_AUDIT: 'false',
    NPM_CONFIG_FUND: 'false',
    NPM_CONFIG_UPDATE_NOTIFIER: 'false',
    NPM_CONFIG_INSTALL_STRATEGY: 'hoisted',
    NPM_CONFIG_LEGACY_PEER_DEPS: 'false',
    NPM_CONFIG_STRICT_PEER_DEPS: 'true',
    NPM_CONFIG_OFFLINE: offline ? 'true' : 'false',
    NPM_CONFIG_PREFER_OFFLINE: 'false',
    NPM_CONFIG_PREFER_ONLINE: 'false',
  };
  for (const key of ['HTTPS_PROXY','HTTP_PROXY','NO_PROXY','https_proxy','http_proxy','no_proxy']) {
    if (process.env[key]) env[key] = process.env[key];
  }
  for (const key of Object.keys(process.env)) {
    if (/^NPM_TOKEN$|^NODE_AUTH_TOKEN$|^NPM_CONFIG__AUTHTOKEN$/i.test(key)) env[key] = process.env[key];
  }
  return env;
}

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? ROOT,
    env: options.env ?? process.env,
    encoding: 'utf8',
    timeout: options.timeoutMs ?? 120000,
    maxBuffer: 16 * 1024 * 1024,
  });
  return {
    commandId: options.commandId ?? `${path.basename(command)}:${args[0] ?? ''}`,
    exitCode: result.status,
    signal: result.signal,
    timedOut: Boolean(result.error?.code === 'ETIMEDOUT'),
    stdout: redactText(result.stdout),
    stderr: redactText(result.stderr),
    errorCode: result.error?.code ?? null,
  };
}

export function classifyRegistryFailure(result) {
  const text = `${result.stdout}\n${result.stderr}`;
  if (/\b401\b/.test(text)) return 'REGISTRY_AUTH_401';
  if (/\b403\b/.test(text)) return 'REGISTRY_AUTH_403';
  if (/\b404\b/.test(text)) return 'REGISTRY_VERSION_404';
  if (/\b429\b/.test(text)) return 'REGISTRY_RATE_LIMIT_429';
  if (/\b5\d\d\b|E503|Service Temporarily Unavailable/i.test(text)) return 'REGISTRY_AVAILABILITY_5XX';
  if (/CERT|TLS|SELF_SIGNED|UNABLE_TO_VERIFY/i.test(text)) return 'REGISTRY_TLS_FAILURE';
  if (/ENOTFOUND|EAI_AGAIN|DNS/i.test(text)) return 'REGISTRY_DNS_FAILURE';
  if (result.timedOut) return 'REGISTRY_TIMEOUT';
  return result.exitCode === 0 ? null : 'REGISTRY_UNKNOWN_FAILURE';
}

export function cachePathForIntegrity(cacheDir, integrity) {
  const match = /^sha512-([A-Za-z0-9+/=]+)$/.exec(String(integrity ?? ''));
  if (!match) return null;
  const hex = Buffer.from(match[1], 'base64').toString('hex');
  return path.join(cacheDir, '_cacache', 'content-v2', 'sha512', hex.slice(0,2), hex.slice(2,4), hex.slice(4));
}

export function buildCacheClosure(lockFile, cacheDir) {
  const lock = readJson(lockFile);
  const records = [];
  const missing = [];
  const mismatched = [];
  for (const [packagePath, record] of Object.entries(lock.packages ?? {}).sort(([a],[b])=>a.localeCompare(b))) {
    if (!packagePath || record.link || !record.integrity) continue;
    const cachePath = cachePathForIntegrity(cacheDir, record.integrity);
    if (!cachePath || !fs.existsSync(cachePath)) {
      missing.push(packagePath);
      continue;
    }
    const bytes = fs.readFileSync(cachePath);
    const sha512 = crypto.createHash('sha512').update(bytes).digest('base64');
    const actualSri = `sha512-${sha512}`;
    if (actualSri !== record.integrity) mismatched.push(packagePath);
    records.push({
      packagePath,
      version: record.version ?? null,
      integrity: record.integrity,
      byteLength: bytes.length,
      sha256: sha256Bytes(bytes),
      logicalResolvedHost: (() => { try { return new URL(record.resolved).host; } catch { return null; } })(),
    });
  }
  const digest = sha256Bytes(canonicalJson(records));
  return { schemaVersion: 1, cachePolicyId: 'project-closure-frozen-cache-v1', records, missing, mismatched, complete: missing.length === 0 && mismatched.length === 0, digest };
}

function packageFileManifest(instanceRoot) {
  const records = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === '.cache') continue;
      const absolute = path.join(dir, entry.name);
      const relative = path.relative(instanceRoot, absolute).replaceAll(path.sep, '/');
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isSymbolicLink()) records.push({ path: relative, type: 'symlink', target: fs.readlinkSync(absolute) });
      else if (entry.isFile()) records.push({ path: relative, type: 'file', byteLength: fs.statSync(absolute).size, sha256: sha256File(absolute) });
    }
  };
  visit(instanceRoot);
  return { records, digest: sha256Bytes(canonicalJson(records)) };
}

export function buildInstallGraph(projectRoot) {
  const nodeModules = path.join(projectRoot, 'node_modules');
  const instances = [];
  if (!fs.existsSync(nodeModules)) return { schemaVersion: 1, instances, instanceCount: 0, graphDigest: sha256Bytes('[]'), contentDigest: sha256Bytes('[]'), binCommands: [], cacheDirectoryPresent: false };
  const visitNodeModules = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (entry.name === '.bin' || entry.name === '.cache') continue;
      const absolute = path.join(dir, entry.name);
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      if (entry.name.startsWith('@')) {
        for (const scoped of fs.readdirSync(absolute, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
          if (scoped.isDirectory() || scoped.isSymbolicLink()) inspectInstance(path.join(absolute, scoped.name));
        }
      } else inspectInstance(absolute);
    }
  };
  const inspectInstance = (instanceRoot) => {
    const packageJson = path.join(instanceRoot, 'package.json');
    if (!fs.existsSync(packageJson)) return;
    const pkg = readJson(packageJson);
    const files = packageFileManifest(instanceRoot);
    instances.push({
      path: path.relative(projectRoot, instanceRoot).replaceAll(path.sep, '/'),
      name: pkg.name ?? null,
      version: pkg.version ?? null,
      packageJsonSha256: sha256File(packageJson),
      contentDigest: files.digest,
      fileCount: files.records.length,
      optional: Boolean(pkg.optional),
    });
    const nested = path.join(instanceRoot, 'node_modules');
    if (fs.existsSync(nested)) visitNodeModules(nested);
  };
  visitNodeModules(nodeModules);
  instances.sort((a,b)=>a.path.localeCompare(b.path));
  const binDir = path.join(nodeModules, '.bin');
  const binCommands = fs.existsSync(binDir) ? fs.readdirSync(binDir).sort() : [];
  return {
    schemaVersion: 1,
    instances,
    instanceCount: instances.length,
    graphDigest: sha256Bytes(canonicalJson(instances.map(({ contentDigest, fileCount, ...rest }) => rest))),
    contentDigest: sha256Bytes(canonicalJson(instances)),
    binCommands,
    binDigest: sha256Bytes(canonicalJson(binCommands)),
    cacheDirectoryPresent: fs.existsSync(path.join(nodeModules, '.cache')),
  };
}

export function compareInstallGraphs(a, b) {
  const sameInstances = a.graphDigest === b.graphDigest;
  const sameContent = a.contentDigest === b.contentDigest;
  const sameBins = a.binDigest === b.binDigest;
  return {
    schemaVersion: 1,
    sameInstances,
    sameContent,
    sameBins,
    sameCount: a.instanceCount === b.instanceCount,
    cacheDirectoryAbsent: !a.cacheDirectoryPresent && !b.cacheDirectoryPresent,
    reproducible: sameInstances && sameContent && sameBins && a.instanceCount === b.instanceCount && !a.cacheDirectoryPresent && !b.cacheDirectoryPresent,
  };
}

export function stateRank(state) {
  return [
    'UNASSESSED','INPUT_PROFILE_SEALED','REGISTRY_IDENTITY_VERIFIED','LOCK_CANDIDATE_GENERATED',
    'LOCK_GRAPH_VERIFIED','CACHE_CLOSURE_VERIFIED','OFFLINE_CI_A_VERIFIED','OFFLINE_CI_B_VERIFIED',
    'INSTALL_REPRODUCIBILITY_VERIFIED','LOCK_MUTATION_ZERO_VERIFIED','DEPENDENCY_LOCK_PROMOTED'
  ].indexOf(state);
}

export function lockMutationTimeline({ packageJsonBefore, packageLockBefore, packageJsonAfter, packageLockAfter, stages = [] }) {
  return {
    schemaVersion: 1,
    policyId: 'raw-byte-zero-v1',
    packageJsonBefore,
    packageLockBefore,
    packageJsonAfter,
    packageLockAfter,
    packageJsonMutationZero: packageJsonBefore === packageJsonAfter,
    packageLockMutationZero: packageLockBefore === packageLockAfter,
    stages,
  };
}

export function promoteLockAtomic({ candidateLock, destinationLock, expectedOldSha256 }) {
  if (sha256File(destinationLock) !== expectedOldSha256) throw Object.assign(new Error('stale old lock sha'), { code: 'E_BUILD_LOCK_PROMOTION_CAS_MISMATCH' });
  const candidate = readJson(candidateLock);
  if (candidate.lockfileVersion !== 3) throw Object.assign(new Error('candidate lockfile version mismatch'), { code: 'E_BUILD_LOCK_CANDIDATE_VERSION' });
  const temp = `${destinationLock}.bl01-${process.pid}-${crypto.randomBytes(8).toString('hex')}`;
  fs.copyFileSync(candidateLock, temp);
  const fd = fs.openSync(temp, 'r');
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(temp, destinationLock);
  const readback = sha256File(destinationLock);
  const expected = sha256File(candidateLock);
  if (readback !== expected) throw Object.assign(new Error('lock readback mismatch'), { code: 'E_BUILD_LOCK_PROMOTION_READBACK_MISMATCH' });
  return { promotedLockSha256: readback, expectedOldSha256 };
}
