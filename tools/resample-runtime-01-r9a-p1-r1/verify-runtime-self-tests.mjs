import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createArtifactPublisherR9AP1 } from '../../app/electron/resample-runtime-r9a-p1/artifact-publisher.mjs';
import { readExternalBuildAdmissionSidecar, REQUIRED_BUILD_LOCK_CHILDREN } from '../../app/electron/resample-runtime-r9a-p1-r1/external-build-admission-sidecar.mjs';
import { bindPackagedClosure, computePackagedClosure } from '../../app/electron/resample-runtime-r9a-p1-r1/packaged-closure-binding.mjs';
import { createQualificationBootAuthority } from '../../app/electron/resample-runtime-r9a-p1-r1/qualification-boot-authority.mjs';
import { canonicalJson, seal as appSeal, sha256Bytes } from '../../app/electron/resample-runtime-r9a-p1-r1/lib.mjs';
import { capture, check, seal, sourceArtifact } from './lib.mjs';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'r9ap1r1-self-'));
const packageRoot = path.join(temp, 'package');
const evidenceRoot = path.join(temp, 'evidence');
const sidecarRoot = path.join(temp, 'sidecar');
fs.mkdirSync(path.join(packageRoot, 'resources'), { recursive: true });
fs.mkdirSync(evidenceRoot, { recursive: true });
fs.mkdirSync(sidecarRoot, { recursive: true });
fs.writeFileSync(path.join(packageRoot, 'DadumDadum.exe'), 'exe');
fs.writeFileSync(path.join(packageRoot, 'resources', 'app.asar'), 'asar');

function syntheticSidecar() {
  const packageClosure = computePackagedClosure({ packageRoot });
  const children = REQUIRED_BUILD_LOCK_CHILDREN.map((kind) => appSeal({ schemaVersion: 1, schemaId: 'tdt.build-lock-r2.external-child-envelope.v1', kind, sourceReceiptKind: `synthetic-${kind}`, sourceSelfSha256: 'a'.repeat(64) }));
  return appSeal({ schemaVersion: 1, schemaId: 'tdt.build-lock-r2.external-admission-sidecar.v1', receiptKind: 'build-lock-r2-external-admission-sidecar', sidecarId: 'synthetic', platform: 'win32', arch: 'x64', buildId: 'synthetic-build', productionBuildAdmitted: true, counts: { PASS: 580, FAIL: 0 }, buildLockFinalReceiptSha256: 'b'.repeat(64), packageClosure, children, historicalPassCarryForward: 0 });
}

const tests = [];
tests.push(capture('closure-compute', () => { const closure = computePackagedClosure({ packageRoot }); check(closure.rowCount === 2, 'E_R9AP1R1_SELF', 'closure row count'); return closure.digest; }));
const sidecar = syntheticSidecar();
const sidecarPath = path.join(sidecarRoot, 'BLR2_EXTERNAL_ADMISSION_SIDECAR.json');
fs.writeFileSync(sidecarPath, canonicalJson(sidecar));
const sidecarSha = sha256Bytes(fs.readFileSync(sidecarPath));
tests.push(capture('sidecar-read', () => readExternalBuildAdmissionSidecar({ sidecarPath, expectedSha256: sidecarSha, packageRoot, evidenceRoot, requireWin32: false }).observedSha256));
tests.push(capture('closure-bind', () => bindPackagedClosure({ expected: sidecar.packageClosure, observed: computePackagedClosure({ packageRoot }), sidecarSha256: sidecarSha, buildLockFinalReceiptSha256: sidecar.buildLockFinalReceiptSha256 }).selfSha256));
tests.push(capture('qualification-authority', () => {
  const authority = createQualificationBootAuthority({ runId: '1'.repeat(64), packageContentId: sidecar.packageClosure.digest, packageClosureDigest: sidecar.packageClosure.digest, sidecarSha256: sidecarSha, buildLockFinalReceiptSha256: sidecar.buildLockFinalReceiptSha256, fixtureScheduleDigest: '2'.repeat(64), evidenceRootDigest: '3'.repeat(64) });
  const context = { windowId: 1, webContentsId: 2, rendererPid: 3, partitionId: 'test' };
  authority.bindWindow(context);
  const challenge = authority.beginBootstrap(context);
  const session = authority.completeBootstrap(context, { ...challenge, buildId: 'build', activeGraphDigest: '4'.repeat(64), deviceEpoch: 1, adapterIdentityDigest: '5'.repeat(64), driverIdentityDigest: '6'.repeat(64), startupCanary: { receiptSha256: '7'.repeat(64) } });
  const binding = { fixtureId: 'fixture' };
  const grant = authority.issueGrant(context, { session, operation: 'fixture-publication', binding });
  authority.validateGrant(context, grant, 'fixture-publication', binding, true);
  const snapshot = authority.snapshot();
  return { runId: snapshot.runId, generation: snapshot.generation, bound: snapshot.bound, mode: snapshot.session?.mode, qualificationOnly: snapshot.session?.qualificationOnly, openGrantCount: snapshot.openGrantCount, openSaveSessions: snapshot.openSaveSessions };
}));
tests.push(capture('artifact-publisher-r1-manifest', () => {
  const runRoot = path.join(temp, 'publisher');
  const publisher = createArtifactPublisherR9AP1({ runRoot, runId: '8'.repeat(64), manifestName: 'R9AP1R1_ARTIFACT_MANIFEST.json', manifestSchemaId: 'tdt.r9a-p1-r1.artifact-manifest.v1' });
  publisher.publish('A.json', appSeal({ schemaVersion: 1, value: true }), { requireSelf: true });
  const manifest = publisher.finalize('COMMITTED');
  check(manifest.schemaId === 'tdt.r9a-p1-r1.artifact-manifest.v1', 'E_R9AP1R1_SELF', 'publisher schema mismatch');
  return manifest.selfSha256;
}));
check(tests.every((test) => test.status === 'PASS'), 'E_R9AP1R1_SELF_TEST', 'R1 runtime self-test failed', tests);
sourceArtifact('R9AP1R1_RUNTIME_SELF_TEST_REPORT.json', seal({ schemaVersion: 1, receiptKind: 'r9a-p1-r1-runtime-self-test', counts: { PASS: tests.length, FAIL: 0 }, tests }));
fs.rmSync(temp, { recursive: true, force: true });
console.log(`R9A-P1-R1 runtime self-tests PASS ${tests.length}/${tests.length}`);
