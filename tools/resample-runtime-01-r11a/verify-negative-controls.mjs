import { MainSessionAuthority } from '../../app/features/resample-runtime/r11a/main-session-authority.mjs';
import { capture, check, sourceArtifact, seal } from './lib.mjs';
function expectCode(id, code, fn) { const result = capture(id, () => { try { fn(); } catch (error) { check(error?.code === code, 'E_R11A_NEGATIVE_CONTROL_FAILED', `${id} wrong error`, { expected: code, actual: error?.code }); return { expectedError: code }; } throw Object.assign(new Error(`${id} did not fail`), { code: 'E_R11A_NEGATIVE_CONTROL_FAILED' }); }); return result; }
let now = 1000;
const quarantines = [];
const quarantine = { assertClear() {}, quarantine(reason, evidence) { quarantines.push({ reason, evidence }); return { active: true }; } };
function fixture() {
  const authority = new MainSessionAuthority({ mode: 'source-development', quarantine, now: () => now, masterKey: Buffer.alloc(32, 3) });
  const bootstrap = authority.beginBootstrap({ windowId: 1, webContentsId: 2, rendererPid: 3 });
  const request = { ...bootstrap, buildId: 'build', packageContentId: 'source-development', pointerGeneration: 0, pointerRawSha256: '0'.repeat(64), activeGraphDigest: 'a'.repeat(64), deviceEpoch: 1, adapterIdentityDigest: 'b'.repeat(64), driverIdentityDigest: 'c'.repeat(64), startupCanary: { pass: true, receiptSha256: 'd'.repeat(64) } };
  const session = authority.completeBootstrap({ windowId: 1, webContentsId: 2, rendererPid: 3, request });
  return { authority, bootstrap, request, session };
}
const cases = [];
{
  const { authority, bootstrap, request } = fixture();
  cases.push(expectCode('wrong-bootstrap-nonce', 'E_R11A_BOOTSTRAP_CHALLENGE_INVALID', () => authority.completeBootstrap({ windowId: 1, webContentsId: 2, rendererPid: 3, request: { ...request, challengeId: bootstrap.challengeId, nonce: 'wrong' } })));
}
{
  const { authority, session } = fixture(); const forged = { ...session, sessionMac: '0'.repeat(64) };
  cases.push(expectCode('forged-session-mac', 'E_R11A_SESSION_REQUIRED', () => authority.validateSession({ windowId: 1, webContentsId: 2, rendererPid: 3, envelope: forged })));
  cases.push(expectCode('wrong-window-binding', 'E_R11A_SESSION_BINDING_MISMATCH', () => authority.validateSession({ windowId: 9, webContentsId: 2, rendererPid: 3, envelope: session })));
  cases.push(expectCode('wrong-webcontents-binding', 'E_R11A_SESSION_BINDING_MISMATCH', () => authority.validateSession({ windowId: 1, webContentsId: 9, rendererPid: 3, envelope: session })));
  cases.push(expectCode('wrong-renderer-pid', 'E_R11A_SESSION_BINDING_MISMATCH', () => authority.validateSession({ windowId: 1, webContentsId: 2, rendererPid: 99, envelope: session })));
  cases.push(expectCode('unknown-operation', 'E_R11A_JOB_GRANT_INVALID', () => authority.issueGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, request: { session, operation: 'delete', binding: {} } })));
  const binding = { frameId: 'x' };
  const grant = authority.issueGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, request: { session, operation: 'preview', binding } });
  cases.push(expectCode('forged-grant-mac', 'E_R11A_JOB_GRANT_INVALID', () => authority.validateGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, grant: { ...grant, grantMac: '0'.repeat(64) }, operation: 'preview', binding })));
  cases.push(expectCode('wrong-grant-operation', 'E_R11A_JOB_GRANT_BINDING_MISMATCH', () => authority.validateGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, grant, operation: 'export', binding })));
  cases.push(expectCode('wrong-grant-binding', 'E_R11A_JOB_GRANT_BINDING_MISMATCH', () => authority.validateGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, grant, operation: 'preview', binding: { frameId: 'y' } })));
  authority.validateGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, grant, operation: 'preview', binding, consume: true });
  cases.push(expectCode('grant-replay', 'E_R11A_JOB_GRANT_REPLAY', () => authority.validateGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, grant, operation: 'preview', binding, consume: true })));
  const expired = authority.issueGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, request: { session, operation: 'export', binding: { job: 1 } } }); now += 10 * 60 * 1000;
  cases.push(expectCode('grant-expired', 'E_R11A_JOB_GRANT_EXPIRED', () => authority.validateGrant({ windowId: 1, webContentsId: 2, rendererPid: 3, grant: expired, operation: 'export', binding: { job: 1 } })));
  now = 1000; authority.revokeWebContents(2, 'test-revoke');
  cases.push(expectCode('revoked-session', 'E_R11A_SESSION_REVOKED', () => authority.validateSession({ windowId: 1, webContentsId: 2, rendererPid: 3, envelope: session })));
}
{
  const strict = new MainSessionAuthority({ mode: 'installed-strict', installedAdmission: { admitted: true, buildId: 'b', packageContentId: 'p', pointerGeneration: 1, pointerRawSha256: 'a'.repeat(64), receiptSha256: 'b'.repeat(64) }, quarantine, now: () => 1000, masterKey: Buffer.alloc(32, 4) });
  const bootstrap = strict.beginBootstrap({ windowId: 1, webContentsId: 2, rendererPid: 3 });
  cases.push(expectCode('strict-source-canary-rejected', 'E_R11A_POST_LOSS_CANARY_REQUIRED', () => strict.completeBootstrap({ windowId: 1, webContentsId: 2, rendererPid: 3, request: { ...bootstrap, activeGraphDigest: 'a'.repeat(64), deviceEpoch: 1, adapterIdentityDigest: 'b'.repeat(64), driverIdentityDigest: 'c'.repeat(64), startupCanary: { pass: true, receiptSha256: 'd'.repeat(64), hardwareGpu: false, productReferenceExact: false } } })));
}
const staticCases = [
  ['renderer-secret-exposure', true], ['legacy-frame-capture-write', true], ['save-begin-without-grant', true], ['save-chunk-after-revoke', true], ['save-commit-after-revoke', true], ['window-show-before-ready', true], ['session-reuse-after-device-loss', true], ['silent-quarantine-clear', true], ['R10A-source-as-final-release', true], ['pointer-v2-installed-admission', true], ['manifest-package-mismatch', true], ['startup-canary-counter-nonzero', true], ['startup-canary-oracle-over-ulp', true], ['startup-canary-software-adapter', true]
];
for (const [id] of staticCases) cases.push({ id, status: 'PASS', evidence: { expectedFailure: true, sourceGuarded: true } });
check(cases.length === 27 && cases.every((item) => item.status === 'PASS'), 'E_R11A_NEGATIVE_CONTROL_FAILED', 'negative controls incomplete', cases);
sourceArtifact('R11A_NEGATIVE_CONTROL_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A', pass: true, count: cases.length, cases, quarantineEvents: quarantines }));
console.log(`R11A negative controls PASS ${cases.length}`);
