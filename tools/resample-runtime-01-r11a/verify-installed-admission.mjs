import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { selfSeal as r11Seal, canonicalJson as r11CanonicalJson } from '../../app/features/resample-runtime/r11/crypto-utils.mjs';
import { buildExpectedManifest } from '../../app/features/resample-runtime/r11/expected-installation-manifest.mjs';
import { admitR10AFinalRelease, readAndVerifyProductionPointer, attestInstalledClosure, createInstalledAdmissionReceipt } from '../../app/features/resample-runtime/r11a/installed-release-admission.mjs';
import { canonicalJson, sha256, selfSeal } from '../../app/features/resample-runtime/r11a/crypto-utils.mjs';
import { sourceArtifact, seal, check } from './lib.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r11a-admission-'));
try {
  const treeRoot = path.join(root, 'package'); fs.mkdirSync(treeRoot); fs.writeFileSync(path.join(treeRoot, 'app.mjs'), 'export const admitted = true;\n');
  const buildId = 'r11a-fixture-build'; const packageContentId = 'e'.repeat(64);
  const manifestPath = path.join(root, 'EXPECTED_INSTALLATION_MANIFEST.json');
  const manifest = buildExpectedManifest({ treeRoot, buildId, packageContentId, excludePaths: [] }); fs.writeFileSync(manifestPath, r11CanonicalJson(manifest));
  const finalRelease = selfSeal({ schemaVersion: 1, state: 'RESAMPLE_RUNTIME_R10A_RELEASE_REQUALIFIED_POINTER_CAS_AND_ROLLBACK_DRILL_SEALED', sourcePass: 260, releasePass: 300, pending: 0, fail: 0, counts: { SOURCE_PASS: 260, RELEASE_PASS: 300, PENDING: 0, FAIL: 0 } });
  const finalPath = path.join(root, 'R10A_FINAL.json'); fs.writeFileSync(finalPath, canonicalJson(finalRelease));
  const lineage = selfSeal({ schemaVersion: 1, state: 'RESAMPLE_RUNTIME_R10A_CURRENT_LINEAGE_RESTORED_AWAITING_R11A', current: { r8aSource: 'CURRENT', r9aSource: 'CURRENT', r9aPhysical: 'CURRENT', r10aRelease: 'CURRENT' } });
  const lineagePath = path.join(root, 'R10A_LINEAGE.json'); fs.writeFileSync(lineagePath, canonicalJson(lineage));
  const pointerBody = { schemaVersion: 3, pointerId: 'dadum.export.production-pointer', generation: 7, activeBuildId: buildId, activePackageContentId: packageContentId, previousBuildId: 'previous', previousPackageContentId: 'f'.repeat(64) };
  const pointer = { ...pointerBody, pointerSha256: sha256(canonicalJson(pointerBody)) };
  const pointerPath = path.join(root, 'POINTER.json'); fs.writeFileSync(pointerPath, canonicalJson(pointer));
  const release = admitR10AFinalRelease({ finalReleasePath: finalPath, lineageRestorationPath: lineagePath });
  const verifiedPointer = readAndVerifyProductionPointer(pointerPath);
  const closure = attestInstalledClosure({ treeRoot, expectedManifestPath: manifestPath, executingPackageContentId: packageContentId });
  const receipt = createInstalledAdmissionReceipt({ release, pointer: verifiedPointer, closure });
  check(receipt.admitted === true && receipt.packageContentId === packageContentId, 'E_R11A_INSTALLED_CLOSURE_INVALID', 'installed admission receipt incomplete');
  sourceArtifact('R11A_INSTALLED_ADMISSION_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A', pass: true, r10aFinalStateVerified: true, lineageCurrentVerified: true, pointerV3Verified: true, installedClosureVerified: true, installedAdmissionReceiptSha256: receipt.receiptSha256 }));
  console.log('R11A installed admission authority PASS');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
