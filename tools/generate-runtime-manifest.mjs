import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ID, PATCH_ID, canonicalJson, lockConsistency, runtimeModulePlan, servicePlan, sha256Bytes, sha256File, walkFiles } from './runtime-manifest-lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourceRoot = path.join(root, 'app', 'src');
const legacyRoot = path.join(root, 'app', 'legacy-runtime');
const legacyManifestPath = path.join(sourceRoot, 'legacy', 'generated-legacy-manifest.json');
const files = [
  ...walkFiles(sourceRoot),
  ...walkFiles(legacyRoot),
].filter((file) => !file.endsWith('.map'));
const sourceRecords = files.map((file) => ({
  path: path.relative(root, file).replaceAll(path.sep, '/'),
  sha256: sha256File(file),
}));
const buildAuthorityFiles = [
  path.join(root, 'package.json'),
  path.join(root, 'package-lock.json'),
  path.join(root, 'vite.config.ts'),
  path.join(root, 'electron.mjs'),
  path.join(root, 'preload.cjs'),
  ...walkFiles(path.join(root, 'tools')).filter((file) => /\.(?:mjs|json)$/.test(file)),
].filter((file) => fs.existsSync(file));
const buildAuthorityRecords = buildAuthorityFiles
  .map((file) => ({
    path: path.relative(root, file).replaceAll(path.sep, '/'),
    sha256: sha256File(file),
  }))
  .sort((a, b) => a.path.localeCompare(b.path));
const lock = lockConsistency(root);
const modules = runtimeModulePlan();
const services = servicePlan();
const legacyManifestDigest = sha256File(legacyManifestPath);
const packageJsonDigest = sha256File(path.join(root, 'package.json'));
const packageLockDigest = sha256File(path.join(root, 'package-lock.json'));
const toolchainProfilePath = path.join(root, 'tools', 'toolchain-profile.json');
const toolchainProfileDigest = sha256File(toolchainProfilePath);
const toolchainProfile = JSON.parse(fs.readFileSync(toolchainProfilePath, 'utf8'));
const runtimePlanDigest = sha256Bytes(canonicalJson(modules));
const servicePlanDigest = sha256Bytes(canonicalJson(services));
const sourceGraphDigest = sha256Bytes(canonicalJson(sourceRecords));
const buildAuthorityDigest = sha256Bytes(canonicalJson(buildAuthorityRecords));
const dependencyGraphDigest = sha256Bytes(canonicalJson({ packageJsonDigest, packageLockDigest, lock }));
const buildId = sha256Bytes(canonicalJson({ patchId: PATCH_ID, packageJsonDigest, packageLockDigest, toolchainProfileDigest, sourceGraphDigest, buildAuthorityDigest, legacyManifestDigest })).slice(0, 24);
const payload = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  appId: APP_ID,
  buildId,
  profile: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  promotable: false,
  candidateState: lock.consistent ? 'DEPENDENCY_LOCK_VERIFIED' : 'SOURCE_BAKED_UNPROMOTED',
  artifactVerificationMode: 'source-graph-only',
  packageJsonDigest,
  packageLockDigest,
  dependencyGraphDigest,
  toolchainProfile,
  toolchainProfileDigest,
  sourceGraphDigest,
  buildAuthorityDigest,
  legacyManifestDigest,
  runtimePlanDigest,
  servicePlanDigest,
  lockConsistency: lock,
  modules,
  services,
  sourceRecords,
  buildAuthorityRecords,
};
const selfDigest = sha256Bytes(canonicalJson(payload));
const output = { ...payload, selfDigest };
const outDir = path.join(root, 'artifacts', 'runtime');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'generated-runtime-manifest.source.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`[TDT-EXPORT-PROMOTION-03] generated build ${buildId}; lockConsistent=${lock.consistent}`);
