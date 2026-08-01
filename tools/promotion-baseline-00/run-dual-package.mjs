import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ARTIFACT_ROOT, ROOT, SPEC_ID, assert, assertCanonicalHost, assertProductionPointersUnchanged, cleanCopy, isolatedNpmEnv, normalizedPackageManifest, productionPointerPreflight, readJson, run, seal, sha256Bytes, canonicalJson, writeJsonAtomic, writeFailure } from './lib.mjs';

function packageOne(label, workRoot, frozenCache) {
  const workspace = path.join(workRoot, `package-${label.toLowerCase()}`);
  cleanCopy(ROOT, workspace);
  const env = isolatedNpmEnv(frozenCache);
  if (process.env.DADUM_ELECTRON_CACHE) env.ELECTRON_CACHE = process.env.DADUM_ELECTRON_CACHE;
  if (process.env.DADUM_ELECTRON_BUILDER_CACHE) env.ELECTRON_BUILDER_CACHE = process.env.DADUM_ELECTRON_BUILDER_CACHE;
  env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
  env.DADUM_BUILD_EMIT_TRANSACTION = '1';

  const install = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci','--offline','--ignore-scripts','--no-audit','--fund=false','--install-strategy=hoisted','--strict-peer-deps'], { cwd: workspace, env, timeoutMs: 900_000 });
  assert(install.exitCode === 0, 'P0C_PACKAGE_INSTALL_FAILED', { label, install });
  const lifecycle = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['rebuild','electron','sharp','--foreground-scripts','--no-audit','--fund=false'], { cwd: workspace, env, timeoutMs: 900_000 });
  assert(lifecycle.exitCode === 0, 'P0C_ADMITTED_LIFECYCLE_FAILED', { label, lifecycle });
  const build = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run','build:renderer:emit'], { cwd: workspace, env, timeoutMs: 1_800_000 });
  assert(build.exitCode === 0, 'P0C_PACKAGE_RENDERER_BUILD_FAILED', { label, build });
  const builderCli = path.join(workspace, 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js');
  assert(fs.existsSync(builderCli), 'P0C_ELECTRON_BUILDER_MISSING', { label });
  const packageCommand = run(process.execPath, [builderCli,'--win','--x64','--dir','--config.directories.output=release-p0'], { cwd: workspace, env, timeoutMs: 1_800_000 });
  assert(packageCommand.exitCode === 0, 'P0C_ELECTRON_PACKAGE_FAILED', { label, packageCommand });
  const appDir = path.join(workspace, 'release-p0', 'win-unpacked');
  assert(fs.existsSync(path.join(appDir, 'DadumDadum.exe')), 'P0C_PACKAGED_EXECUTABLE_MISSING', { label, appDir });
  const manifest = normalizedPackageManifest(appDir);
  return { label, workspace, appDir, manifest, commands: { install, lifecycle, build, packageCommand } };
}

try {
  assertCanonicalHost();
  const pointerBefore = productionPointerPreflight();
  const lockReceipt = readJson(path.join(ARTIFACT_ROOT, 'lock', 'dependency-lock-promotion-receipt.json'));
  const emitReceipt = readJson(path.join(ARTIFACT_ROOT, 'emit', 'emitted-artifact-identity-receipt.json'));
  assert(lockReceipt.promoted === true, 'P0C_LOCK_NOT_PROMOTED');
  assert(emitReceipt.state === 'EMITTED_ARTIFACT_IDENTITY_VERIFIED', 'P0C_EMIT_NOT_VERIFIED');
  const frozenCache = String(process.env.DADUM_FROZEN_NPM_CACHE || lockReceipt.frozenCacheLocalPath || '');
  assert(frozenCache && fs.existsSync(frozenCache), 'P0C_FROZEN_CACHE_MISSING');
  const workRoot = path.resolve(process.env.DADUM_P0_WORK_ROOT || path.join(os.tmpdir(), 'dadum-promotion-baseline-00', emitReceipt.emittedArtifactIdentityDigest.slice(0, 16)));
  fs.rmSync(workRoot, { recursive: true, force: true });
  fs.mkdirSync(workRoot, { recursive: true });

  const packageA = packageOne('A', workRoot, frozenCache);
  const packageB = packageOne('B', workRoot, frozenCache);
  assert(packageA.manifest.packageContentId === packageB.manifest.packageContentId, 'P0C_PACKAGE_IDENTITY_MISMATCH', {
    packageA: packageA.manifest.packageContentId,
    packageB: packageB.manifest.packageContentId,
  });
  assertProductionPointersUnchanged(pointerBefore);

  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'package', 'package-a-content-manifest.json'), packageA.manifest);
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'package', 'package-b-content-manifest.json'), packageB.manifest);
  const receipt = seal({
    schemaVersion: 1,
    specId: SPEC_ID,
    state: 'PACKAGE_CONTENT_IDENTITY_VERIFIED',
    status: 'PASS',
    packageContentId: packageA.manifest.packageContentId,
    packageAContentDigest: packageA.manifest.selfDigest,
    packageBContentDigest: packageB.manifest.selfDigest,
    packageABIdentity: true,
    packageAPathLocal: packageA.appDir,
    packageBPathLocal: packageB.appDir,
    workRootLocal: workRoot,
    normalizationRules: ['relative-path','byte-length','sha256','windows-file-role','container-timestamp-excluded-by-unpacked-authority'],
    commandEvidenceDigest: sha256Bytes(canonicalJson({ A: packageA.commands, B: packageB.commands })),
    productionPointerMutationPerformed: false,
    createdAt: new Date().toISOString(),
  });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'package', 'package-identity-receipt.json'), receipt);
  console.log(`PASS ${SPEC_ID} state=PACKAGE_CONTENT_IDENTITY_VERIFIED package=${receipt.packageContentId}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0C_DUAL_PACKAGE_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
