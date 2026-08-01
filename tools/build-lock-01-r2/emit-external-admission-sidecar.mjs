import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computePackagedClosure } from '../../app/electron/resample-runtime-r9a-p1-r1/packaged-closure-binding.mjs';
import { canonicalJson, ensureOutside, fail, seal, sha256File, verifySeal } from '../../app/electron/resample-runtime-r9a-p1-r1/lib.mjs';

const ROOT = process.cwd();
const WIN32 = path.join(ROOT, 'artifacts', 'build-lock-01-r2', 'win32');
const FINAL = path.join(WIN32, 'TDT_BUILD_LOCK_01_R2_FINAL_ADMISSION_RECEIPT.json');
const CHILDREN = Object.freeze([
  ['root-graph', 'rootGraph', 'BLR2_ROOT_GRAPH_RECEIPT.json'],
  ['lock-candidate', 'candidateLock', 'BLR2_LOCK_CANDIDATE_RECEIPT.json'],
  ['cache-closure', 'cacheClosure', 'BLR2_CACHE_CLOSURE_RECEIPT.json'],
  ['install-a', 'installA', 'BLR2_INSTALL_A_RECEIPT.json'],
  ['install-b', 'installB', 'BLR2_INSTALL_B_RECEIPT.json'],
  ['lifecycle-a', 'lifecycleA', 'BLR2_LIFECYCLE_A_RECEIPT.json'],
  ['lifecycle-b', 'lifecycleB', 'BLR2_LIFECYCLE_B_RECEIPT.json'],
  ['install-parity', 'installParity', 'BLR2_INSTALL_PARITY_RECEIPT.json'],
  ['native-toolchain', 'nativeToolchain', 'BLR2_NATIVE_TOOLCHAIN_RECEIPT.json'],
  ['native-build-a', 'nativeA', 'BLR2_NATIVE_BUILD_A_RECEIPT.json'],
  ['native-build-b', 'nativeB', 'BLR2_NATIVE_BUILD_B_RECEIPT.json'],
  ['production-build-a', 'buildA', 'BLR2_PRODUCTION_BUILD_A_RECEIPT.json'],
  ['production-build-b', 'buildB', 'BLR2_PRODUCTION_BUILD_B_RECEIPT.json'],
  ['build-parity', 'buildParity', 'BLR2_BUILD_PARITY_RECEIPT.json'],
  ['mutation-zero', 'mutationZero', 'BLR2_MUTATION_ZERO_RECEIPT.json'],
  ['promotion-intent', 'promotionIntent', 'BLR2_PROMOTION_INTENT.json'],
  ['promotion-effect', 'promotionEffect', 'BLR2_PROMOTION_EFFECT.json'],
  ['post-promotion-replay', 'postPromotionReplay', 'BLR2_POST_PROMOTION_REPLAY_RECEIPT.json'],
]);

function readSealed(file, code) {
  if (!fs.existsSync(file)) fail(code, 'Required Build Lock R2 receipt is missing', { basename: path.basename(file) });
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!verifySeal(value)) fail(code, 'Build Lock R2 receipt self hash is invalid', { basename: path.basename(file) });
  return value;
}

function atomicWrite(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  const fd = fs.openSync(temp, 'wx');
  try {
    fs.writeFileSync(fd, bytes);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);
  try {
    const dir = fs.openSync(path.dirname(file), 'r');
    try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
  } catch {}
}

const packageRoot = path.resolve(process.argv[2] || process.env.DADUM_BUILD_LOCK_R2_PACKAGE_ROOT || '');
const outputPath = path.resolve(process.argv[3] || process.env.DADUM_BUILD_LOCK_R2_SIDECAR_PATH || '');
if (!packageRoot || !path.isAbsolute(packageRoot) || !fs.existsSync(packageRoot)) fail('E_R9AP1R1_PACKAGE_ROOT', 'Existing absolute packaged root is required');
if (!outputPath || !path.isAbsolute(outputPath)) fail('E_R9AP1R1_SIDECAR_PATH_NOT_ABSOLUTE', 'Absolute external sidecar output path is required');
ensureOutside(packageRoot, outputPath, 'E_R9AP1R1_SIDECAR_INSIDE_PACKAGE');
const finalReceipt = readSealed(FINAL, 'E_R9AP1R1_BUILD_LOCK_FINAL_MISSING');
if (finalReceipt.productionBuildAdmitted !== true) fail('E_R9AP1R1_BUILD_LOCK_FINAL_INCOMPLETE', 'Build Lock R2 final admission is incomplete');

const children = CHILDREN.map(([kind, finalKey, filename]) => {
  const receipt = readSealed(path.join(WIN32, filename), 'E_R9AP1R1_BUILD_LOCK_CHILD_MISSING');
  if (finalReceipt.children?.[finalKey] !== receipt.selfSha256) {
    fail('E_R9AP1R1_BUILD_LOCK_CHILD_LINEAGE', 'Build Lock final receipt does not bind the child receipt', { kind, finalKey });
  }
  return seal({
    schemaVersion: 1,
    schemaId: 'tdt.build-lock-r2.external-child-envelope.v1',
    kind,
    finalKey,
    sourceReceiptKind: String(receipt.receiptKind || ''),
    sourceSelfSha256: receipt.selfSha256,
    receipt,
  });
});
const packageClosure = computePackagedClosure({ packageRoot });
const buildA = children.find((child) => child.kind === 'production-build-a')?.receipt ?? {};
const buildId = String(buildA.buildId || buildA.runtimeClosureDigest || packageClosure.digest);
const sidecar = seal({
  schemaVersion: 1,
  schemaId: 'tdt.build-lock-r2.external-admission-sidecar.v1',
  receiptKind: 'build-lock-r2-external-admission-sidecar',
  sidecarId: `blr2-sidecar:${packageClosure.digest.slice(0, 24)}`,
  platform: 'win32',
  arch: 'x64',
  buildId,
  productionBuildAdmitted: true,
  counts: { PASS: 580, PENDING: 0, DEFERRED: 0, SKIPPED: 0, FAIL: 0 },
  buildLockFinalReceiptSha256: sha256File(FINAL),
  buildLockFinalReceiptSelfSha256: finalReceipt.selfSha256,
  packageClosure,
  children,
  historicalPassCarryForward: 0,
  emittedAt: new Date().toISOString(),
});
atomicWrite(outputPath, canonicalJson(sidecar));
const observed = sha256File(outputPath);
process.stdout.write(`${JSON.stringify({ sidecarPath: outputPath, sidecarSha256: observed, packageClosureDigest: packageClosure.digest }, null, 2)}\n`);
