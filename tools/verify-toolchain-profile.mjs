import fs from 'node:fs';
import childProcess from 'node:child_process';
import path from 'node:path';
import { ARTIFACT_DIR, ROOT, readJson, sha256Bytes, canonicalJson, writeJson } from './ep02-build-lib.mjs';
export const BUILD_LOCK_R2_NATIVE_TOOLCHAIN_RECEIPT = path.join(ROOT, 'artifacts', 'build-lock-01-r2', 'win32', 'BLR2_NATIVE_TOOLCHAIN_RECEIPT.json');
const profile = readJson(path.join(ROOT, 'tools', 'toolchain-profile.json'));
const pkg = readJson(path.join(ROOT, 'package.json'));
const nodeVersion = process.version.replace(/^v/, '');
let npmVersion = null;
try { npmVersion = childProcess.execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--version'], { encoding: 'utf8' }).trim(); } catch {}
const checks = {
  profileId: profile.profileId === 'dadum.production-toolchain-v1',
  nodeVersion: nodeVersion === profile.nodeVersion,
  npmVersion: npmVersion === profile.npmVersion,
  packageManager: pkg.packageManager === `npm@${profile.npmVersion}`,
  engineNode: pkg.engines?.node === profile.nodeVersion,
  engineNpm: pkg.engines?.npm === profile.npmVersion,
  targetPlatform: profile.targetPlatform === 'win32',
  targetArch: profile.targetArch === 'x64',
  buildNetworkDisabled: profile.buildNetworkAllowed === false,
};
const nativeToolchainReceiptPresent = fs.existsSync(BUILD_LOCK_R2_NATIVE_TOOLCHAIN_RECEIPT);
const report = {
  schemaVersion: 1,
  patchId: 'TDT-EXPORT-PROMOTION-02',
  status: Object.values(checks).every(Boolean) ? 'TOOLCHAIN_PROFILE_VERIFIED' : 'BLOCKED',
  profile,
  observed: { nodeVersion, npmVersion, hostPlatform: process.platform, hostArch: process.arch },
  checks,
  nativeToolchainReceiptPresent,
};
report.toolchainProfileDigest = sha256Bytes(canonicalJson(profile));
writeJson(path.join(ARTIFACT_DIR, 'TDT_EXPORT_PROMOTION_02_TOOLCHAIN_REPORT.json'), report);
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? 'PASS' : 'FAIL'} EP02-TOOLCHAIN ${name}`);
if (report.status === 'BLOCKED') process.exit(1);
console.log(`PASS TDT-EXPORT-PROMOTION-02 toolchain ${report.toolchainProfileDigest}`);
