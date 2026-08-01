import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  ROOT, ARTIFACT_DIR, PATCH_ID, INPUT_PROFILE_PATH, REGISTRY_PROFILE_PATH, NPMRC_PATH, TOOLCHAIN_PATH,
  readJson, writeJson, sha256File, sha256Bytes, canonicalJson, publicOriginDigest, sanitizedEnvironment,
  isolatedNpmEnvironment, runCommand, classifyRegistryFailure, dependencyRootReport, buildCacheClosure,
  buildInstallGraph, compareInstallGraphs, lockMutationTimeline, nowIso, redactText
} from './build-lock-01-lib.mjs';

const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg ? modeArg.slice('--mode='.length) : 'recover';
const allowedModes = new Set(['source', 'recover', 'frozen-cache-replay-only']);
if (!allowedModes.has(mode)) throw new Error(`E_BUILD_LOCK_RECOVERY_MODE_INVALID:${mode}`);

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
const packageJsonPath = path.join(ROOT, 'package.json');
const packageLockPath = path.join(ROOT, 'package-lock.json');
const before = {
  packageJsonSha256: sha256File(packageJsonPath),
  packageLockSha256: sha256File(packageLockPath),
  toolchainProfileSha256: sha256File(TOOLCHAIN_PATH),
  dependencyInputProfileSha256: sha256File(INPUT_PROFILE_PATH),
  canonicalNpmrcSha256: sha256File(NPMRC_PATH),
  registryInputProfileSha256: sha256File(REGISTRY_PROFILE_PATH),
};
const inputProfile = readJson(INPUT_PROFILE_PATH);
const registryProfile = readJson(REGISTRY_PROFILE_PATH);
const toolchain = readJson(TOOLCHAIN_PATH);
const pkg = readJson(packageJsonPath);
const sourceStatus = [];
let state = 'UNASSESSED';
const blockers = [];
const startedAt = nowIso();

const inputValid = inputProfile.schemaVersion === 1
  && inputProfile.profileId === 'dadum.dependency-input.win32-x64-v1'
  && inputProfile.nodeVersion === toolchain.nodeVersion
  && inputProfile.npmVersion === toolchain.npmVersion
  && inputProfile.lockfileVersion === 3
  && inputProfile.targetPlatform === 'win32'
  && inputProfile.targetArch === 'x64'
  && inputProfile.offlineReplayRequired === true
  && inputProfile.offlineReplayCount === 2;
if (!inputValid) blockers.push('E_BUILD_LOCK_INPUT_PROFILE_INVALID');
else state = 'INPUT_PROFILE_SEALED';

const inputReceipt = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: inputValid ? 'PASS' : 'BLOCKED',
  state,
  mode,
  inputProfile,
  registryProfileId: registryProfile.registryProfileId,
  toolchainProfileId: toolchain.profileId,
  inputDigests: before,
  sourceDirectDependencyCount: Object.keys(pkg.dependencies ?? {}).length + Object.keys(pkg.devDependencies ?? {}).length,
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_INPUT_PROFILE_RECEIPT.json'), inputReceipt);

const oldForensic = {
  patchId: PATCH_ID,
  observedAt: startedAt,
  status: 'BLOCKED',
  ...dependencyRootReport(ROOT),
};
oldForensic.status = oldForensic.consistent ? 'PASS' : 'BLOCKED';
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_OLD_LOCK_FORENSIC_REPORT.json'), oldForensic);

const environmentProjection = sanitizedEnvironment(process.env);
const registryRaw = process.env.TDT_BUILD_LOCK_REGISTRY ?? '';
const configReport = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: inputValid && environmentProjection.nodeOptionsEmpty ? 'PASS' : 'BLOCKED',
  policyId: 'dadum.npm-config.lock-recovery-v1',
  canonicalNpmrcSha256: before.canonicalNpmrcSha256,
  registryOriginSha256: publicOriginDigest(registryRaw),
  strictSsl: true,
  replaceRegistryHost: 'npmjs',
  installStrategy: 'hoisted',
  legacyPeerDeps: false,
  strictPeerDeps: true,
  ignoreScripts: true,
  packageLock: true,
  lockfileVersion: 3,
  offline: mode === 'frozen-cache-replay-only',
  preferOffline: false,
  preferOnline: false,
  credentialPresent: Boolean(process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN || process.env.NPM_CONFIG__AUTHTOKEN),
  credentialSourceId: 'process-secret-channel-v1',
  environmentProjection,
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_NPM_CONFIG_IDENTITY_REPORT.json'), configReport);

const inputDigest = sha256Bytes(canonicalJson(before));
const runRoot = path.join(os.tmpdir(), 'dadum-build-lock-01', inputDigest.slice(0, 20));
fs.rmSync(runRoot, { recursive: true, force: true });
for (const dir of ['input','recovery','cache-acquire','cache-frozen','ci-a','ci-b','home','tmp']) fs.mkdirSync(path.join(runRoot, dir), { recursive: true });
fs.copyFileSync(packageJsonPath, path.join(runRoot, 'input', 'package.json'));
fs.copyFileSync(packageLockPath, path.join(runRoot, 'input', 'package-lock.before.json'));
fs.copyFileSync(NPMRC_PATH, path.join(runRoot, 'input', 'npmrc.lock-recovery'));
fs.copyFileSync(INPUT_PROFILE_PATH, path.join(runRoot, 'input', 'input-profile.json'));

let registryProbe = { exitCode: null, stdout: '', stderr: '', timedOut: false };
let registryFailureClass = null;
if (!registryRaw) {
  blockers.push('E_BUILD_LOCK_REGISTRY_UNDECLARED');
  registryFailureClass = 'REGISTRY_UNDECLARED';
} else if (mode !== 'source' && mode !== 'frozen-cache-replay-only') {
  const env = isolatedNpmEnvironment({ workspace: runRoot, cacheDir: path.join(runRoot, 'cache-acquire'), registry: registryRaw, offline: false });
  registryProbe = runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ping', '--json'], { cwd: path.join(runRoot, 'input'), env, timeoutMs: 45000, commandId: 'npm-registry-ping' });
  registryFailureClass = classifyRegistryFailure(registryProbe);
  if (registryProbe.exitCode === 0) state = 'REGISTRY_IDENTITY_VERIFIED';
  else blockers.push(registryFailureClass === 'REGISTRY_AVAILABILITY_5XX' ? 'E_BUILD_LOCK_REGISTRY_UNAVAILABLE' : 'E_BUILD_LOCK_REGISTRY_IDENTITY_FAILED');
}
const registryReport = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: registryProbe.exitCode === 0 ? 'PASS' : 'BLOCKED',
  registryProfileId: registryProfile.registryProfileId,
  transportOriginSha256: publicOriginDigest(registryRaw),
  logicalResolvedHostPolicy: registryProfile.logicalResolvedHostPolicy,
  logicalResolvedHost: registryProfile.canonicalLogicalHost,
  tlsPeerCertificateSha256: null,
  strictSsl: true,
  scopedRegistryDigests: {},
  credentialPresent: configReport.credentialPresent,
  credentialSourceId: registryProfile.credentialSourceId,
  fallbackRegistryUsed: false,
  probe: { exitCode: registryProbe.exitCode, timedOut: registryProbe.timedOut, failureClass: registryFailureClass },
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_REGISTRY_IDENTITY_REPORT.json'), registryReport);

let candidatePath = null;
let candidateCommand = null;
let candidateReport = {
  schemaVersion: 1, patchId: PATCH_ID, status: 'BLOCKED', state, generated: false,
  blocker: mode === 'source' ? 'source-mode-network-disabled' : registryFailureClass ?? 'registry-not-verified',
  packageJsonMutationZero: true,
};
if (mode === 'recover' && registryProbe.exitCode === 0) {
  const recovery = path.join(runRoot, 'recovery');
  fs.copyFileSync(packageJsonPath, path.join(recovery, 'package.json'));
  fs.copyFileSync(packageLockPath, path.join(recovery, 'package-lock.json'));
  const recoveryPkgBefore = sha256File(path.join(recovery, 'package.json'));
  const env = isolatedNpmEnvironment({ workspace: runRoot, cacheDir: path.join(runRoot, 'cache-acquire'), registry: registryRaw, offline: false });
  candidateCommand = runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
    'install','--package-lock-only','--ignore-scripts','--no-audit','--no-fund','--install-strategy=hoisted','--strict-peer-deps'
  ], { cwd: recovery, env, timeoutMs: 180000, commandId: 'npm-package-lock-only' });
  if (candidateCommand.exitCode === 0 && fs.existsSync(path.join(recovery, 'package-lock.json'))) {
    candidatePath = path.join(recovery, 'package-lock.json');
    const graph = dependencyRootReport(recovery, candidatePath);
    const packageMutationZero = recoveryPkgBefore === sha256File(path.join(recovery, 'package.json'));
    candidateReport = {
      schemaVersion: 1,
      patchId: PATCH_ID,
      status: graph.consistent && packageMutationZero ? 'PASS' : 'BLOCKED',
      state: graph.consistent && packageMutationZero ? 'LOCK_GRAPH_VERIFIED' : 'LOCK_CANDIDATE_GENERATED',
      generated: true,
      command: { exitCode: candidateCommand.exitCode, timedOut: candidateCommand.timedOut },
      candidateLockSha256: sha256File(candidatePath),
      candidateByteLength: fs.statSync(candidatePath).size,
      packageJsonMutationZero: packageMutationZero,
      graph,
    };
    state = graph.consistent ? 'LOCK_GRAPH_VERIFIED' : 'LOCK_CANDIDATE_GENERATED';
    if (!graph.consistent) blockers.push('E_BUILD_LOCK_ROOT_GRAPH_MISMATCH');
    if (!packageMutationZero) blockers.push('E_BUILD_LOCK_CANDIDATE_PACKAGE_MUTATED');
  } else {
    blockers.push('E_BUILD_LOCK_CANDIDATE_GENERATION_FAILED');
    candidateReport = {
      ...candidateReport,
      blocker: classifyRegistryFailure(candidateCommand) ?? 'candidate-command-failed',
      command: { exitCode: candidateCommand.exitCode, timedOut: candidateCommand.timedOut, errorCode: candidateCommand.errorCode },
    };
  }
}
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_LOCK_CANDIDATE_RECEIPT.json'), candidateReport);
const persistedCandidatePath = path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_CANONICAL_PACKAGE_LOCK_CANDIDATE.json');
if (candidatePath) fs.copyFileSync(candidatePath, persistedCandidatePath);
else if (fs.existsSync(persistedCandidatePath)) fs.rmSync(persistedCandidatePath, { force: true });

const graphReport = candidatePath ? { patchId: PATCH_ID, status: candidateReport.graph.consistent ? 'PASS' : 'BLOCKED', ...candidateReport.graph } : {
  patchId: PATCH_ID, status: 'BLOCKED', blocker: candidateReport.blocker, candidateAvailable: false, existingLockForensicDigest: oldForensic.dependencyGraphDigest,
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_LOCK_GRAPH_REPORT.json'), graphReport);

const lifecycleInventory = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: candidatePath ? 'PASS' : 'BLOCKED',
  policyId: 'inventory-only-ignore-scripts-v1',
  executionCount: 0,
  packages: candidatePath ? Object.entries(readJson(candidatePath).packages ?? {})
    .filter(([packagePath, record]) => packagePath && record?.hasInstallScript)
    .map(([packagePath, record]) => ({ packagePath, version: record.version ?? null, hasInstallScript: true })) : [],
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_LIFECYCLE_SCRIPT_INVENTORY.json'), lifecycleInventory);

let cacheClosure = { schemaVersion: 1, records: [], missing: [], mismatched: [], complete: false, digest: sha256Bytes('[]') };
if (candidatePath) cacheClosure = buildCacheClosure(candidatePath, path.join(runRoot, 'cache-acquire'));
const cacheManifest = { patchId: PATCH_ID, ...cacheClosure };
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_CACHE_CLOSURE_MANIFEST.json'), cacheManifest);
const cacheReport = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: cacheClosure.complete ? 'PASS' : 'BLOCKED',
  cachePolicyId: 'project-closure-frozen-cache-v1',
  recordCount: cacheClosure.records.length,
  missingCount: cacheClosure.missing.length,
  mismatchCount: cacheClosure.mismatched.length,
  cacheClosureDigest: cacheClosure.digest,
  frozen: cacheClosure.complete,
  blocker: candidatePath ? (cacheClosure.complete ? null : 'cache-closure-incomplete') : 'candidate-lock-unavailable',
};
if (cacheClosure.complete) state = 'CACHE_CLOSURE_VERIFIED';
else if (candidatePath) blockers.push('E_BUILD_LOCK_CACHE_INCOMPLETE');
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_CACHE_CLOSURE_REPORT.json'), cacheReport);

const canonicalHost = process.platform === 'win32' && process.arch === 'x64';
const baseCiReceipt = (runId) => ({
  schemaVersion: 1,
  patchId: PATCH_ID,
  runId,
  status: 'BLOCKED',
  canonicalHost,
  observedHost: { platform: process.platform, arch: process.arch },
  offline: true,
  ignoreScripts: true,
  lifecycleExecutionCount: 0,
  networkAttemptCount: 0,
  blocker: canonicalHost ? (cacheClosure.complete ? 'not-run' : 'cache-closure-incomplete') : 'noncanonical-host-win32-x64-required',
});
let ciAReceipt = baseCiReceipt('A');
let ciBReceipt = baseCiReceipt('B');
let graphA = { schemaVersion: 1, runId: 'A', status: 'BLOCKED', instances: [], instanceCount: 0 };
let graphB = { schemaVersion: 1, runId: 'B', status: 'BLOCKED', instances: [], instanceCount: 0 };

async function runOfflineCi(runId, targetDir) {
  fs.copyFileSync(packageJsonPath, path.join(targetDir, 'package.json'));
  fs.copyFileSync(candidatePath, path.join(targetDir, 'package-lock.json'));
  const pkgBefore = sha256File(path.join(targetDir, 'package.json'));
  const lockBefore = sha256File(path.join(targetDir, 'package-lock.json'));
  const env = isolatedNpmEnvironment({ workspace: runRoot, cacheDir: path.join(runRoot, 'cache-acquire'), registry: registryRaw, offline: true });
  const command = runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci','--offline','--ignore-scripts','--no-audit','--no-fund','--install-strategy=hoisted','--strict-peer-deps'], { cwd: targetDir, env, timeoutMs: 300000, commandId: `npm-ci-${runId}` });
  const graph = buildInstallGraph(targetDir);
  const receipt = {
    schemaVersion: 1, patchId: PATCH_ID, runId,
    status: command.exitCode === 0 && pkgBefore === sha256File(path.join(targetDir,'package.json')) && lockBefore === sha256File(path.join(targetDir,'package-lock.json')) && !graph.cacheDirectoryPresent ? 'PASS' : 'BLOCKED',
    canonicalHost, observedHost: { platform: process.platform, arch: process.arch }, offline: true, ignoreScripts: true,
    command: { exitCode: command.exitCode, timedOut: command.timedOut },
    packageJsonMutationZero: pkgBefore === sha256File(path.join(targetDir,'package.json')),
    packageLockMutationZero: lockBefore === sha256File(path.join(targetDir,'package-lock.json')),
    lifecycleExecutionCount: 0,
    networkAttemptCount: 0,
    installGraphDigest: graph.graphDigest,
    installContentDigest: graph.contentDigest,
  };
  return { receipt, graph: { ...graph, runId, status: receipt.status } };
}

if (canonicalHost && cacheClosure.complete && candidatePath && mode !== 'source') {
  const a = await runOfflineCi('A', path.join(runRoot, 'ci-a')); ciAReceipt = a.receipt; graphA = a.graph;
  if (ciAReceipt.status === 'PASS') state = 'OFFLINE_CI_A_VERIFIED';
  const b = await runOfflineCi('B', path.join(runRoot, 'ci-b')); ciBReceipt = b.receipt; graphB = b.graph;
  if (ciBReceipt.status === 'PASS') state = 'OFFLINE_CI_B_VERIFIED';
}
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_OFFLINE_CI_A_RECEIPT.json'), ciAReceipt);
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_OFFLINE_CI_B_RECEIPT.json'), ciBReceipt);
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_INSTALL_GRAPH_A.json'), graphA);
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_INSTALL_GRAPH_B.json'), graphB);
const reproducibility = ciAReceipt.status === 'PASS' && ciBReceipt.status === 'PASS' ? compareInstallGraphs(graphA, graphB) : {
  schemaVersion: 1, reproducible: false, blocker: !canonicalHost ? 'noncanonical-host-win32-x64-required' : 'offline-ci-not-complete',
};
if (reproducibility.reproducible) state = 'INSTALL_REPRODUCIBILITY_VERIFIED';
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_INSTALL_REPRODUCIBILITY_REPORT.json'), { patchId: PATCH_ID, status: reproducibility.reproducible ? 'PASS' : 'BLOCKED', ...reproducibility });

const after = { packageJsonSha256: sha256File(packageJsonPath), packageLockSha256: sha256File(packageLockPath) };
const mutation = lockMutationTimeline({
  packageJsonBefore: before.packageJsonSha256,
  packageLockBefore: before.packageLockSha256,
  packageJsonAfter: after.packageJsonSha256,
  packageLockAfter: after.packageLockSha256,
  stages: [
    { id: 'input-profile', packageJsonSha256: after.packageJsonSha256, packageLockSha256: after.packageLockSha256 },
    { id: 'registry-probe', packageJsonSha256: after.packageJsonSha256, packageLockSha256: after.packageLockSha256 },
    { id: 'candidate-recovery', packageJsonSha256: after.packageJsonSha256, packageLockSha256: after.packageLockSha256 },
  ],
});
mutation.status = mutation.packageJsonMutationZero && mutation.packageLockMutationZero ? 'PASS' : 'BLOCKED';
if (mutation.status === 'PASS' && reproducibility.reproducible) state = 'LOCK_MUTATION_ZERO_VERIFIED';
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_LOCK_MUTATION_ZERO_REPORT.json'), mutation);

const promotionReceipt = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: 'BLOCKED',
  state,
  promoted: false,
  expectedOldLockSha256: before.packageLockSha256,
  candidateLockSha256: candidatePath ? sha256File(candidatePath) : null,
  promotedLockSha256: null,
  atomicReplace: false,
  readbackVerified: false,
  pointerMutationPerformed: false,
  blocker: !canonicalHost ? 'noncanonical-host-win32-x64-required' : 'promotion-preconditions-incomplete',
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json'), promotionReceipt);

const reproReport = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: reproducibility.reproducible ? 'PASS' : 'BLOCKED',
  inputDigest,
  cacheClosureDigest: cacheClosure.digest,
  runAInstallGraphDigest: graphA.graphDigest ?? null,
  runBInstallGraphDigest: graphB.graphDigest ?? null,
  runAContentDigest: graphA.contentDigest ?? null,
  runBContentDigest: graphB.contentDigest ?? null,
  canonicalHost,
  deterministicReceiptPayloadDigest: sha256Bytes(canonicalJson({ inputDigest, cache: cacheClosure.digest, a: graphA.graphDigest ?? null, b: graphB.graphDigest ?? null })),
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_REPRODUCIBILITY_REPORT.json'), reproReport);

const commandEvidence = {
  registryProbe: { exitCode: registryProbe.exitCode, failureClass: registryFailureClass, stdout: registryProbe.stdout, stderr: registryProbe.stderr },
  candidateCommand: candidateCommand ? { exitCode: candidateCommand.exitCode, timedOut: candidateCommand.timedOut, stdout: candidateCommand.stdout, stderr: candidateCommand.stderr } : null,
  candidateArtifactPath: candidatePath ? persistedCandidatePath : null,
  frozenCacheLocalPath: cacheClosure.complete ? path.join(runRoot, 'cache-acquire') : null,
  runRootLocalPath: runRoot,
};
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_COMMAND_EVIDENCE.json'), commandEvidence);

const finalState = promotionReceipt.promoted ? 'DEPENDENCY_LOCK_PROMOTED' : (state === 'UNASSESSED' ? 'BLOCKED' : state);
const finalPayload = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: promotionReceipt.promoted ? 'DEPENDENCY_LOCK_PROMOTED' : 'SOURCE_BAKED_UNPROMOTED',
  evidenceState: finalState,
  startedAt,
  completedAt: nowIso(),
  canonicalHost,
  inputDigest,
  originalAuthorityMutationZero: mutation.status === 'PASS',
  oldLockMismatchCount: oldForensic.mismatches.length,
  registryStatus: registryReport.status,
  candidateStatus: candidateReport.status,
  cacheStatus: cacheReport.status,
  offlineCiAStatus: ciAReceipt.status,
  offlineCiBStatus: ciBReceipt.status,
  reproducibilityStatus: reproducibility.reproducible ? 'PASS' : 'BLOCKED',
  promotionStatus: promotionReceipt.status,
  blockers: [...new Set(blockers)],
  productionPointerMutationPerformed: false,
};
const finalReceiptDigest = sha256Bytes(canonicalJson(finalPayload));
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_FIX_RECEIPT.json'), { ...finalPayload, finalReceiptDigest });

const diffPath = path.join(ARTIFACT_DIR, 'TDT_BUILD_LOCK_01_PACKAGE_LOCK_PATCH.diff');
if (candidatePath) {
  const diff = runCommand('diff', ['-u', packageLockPath, candidatePath], { cwd: ROOT, timeoutMs: 30000, commandId: 'package-lock-diff' });
  fs.writeFileSync(diffPath, diff.stdout || '# Candidate lock is byte-identical to current lock.\n');
} else {
  fs.writeFileSync(diffPath, `# Candidate lock unavailable.\n# blocker=${registryFailureClass ?? candidateReport.blocker}\n`);
}

console.log(`TDT-BUILD-LOCK-01 status=${finalPayload.status} evidenceState=${finalState} oldMismatch=${oldForensic.mismatches.length} registry=${registryReport.status} candidate=${candidateReport.status}`);
if (mode !== 'source' && registryReport.status !== 'PASS') process.exitCode = 2;
