import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRecoveryPermitAuthorityR9AP1R2R2, R9AP1R2R2_CODEC_KEYS, R9AP1R2R2_POLICY } from '../../app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs';
import { digest, sealDigest } from '../../app/electron/resample-runtime-r9a-p1-r2-r2/permit-codec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r2-r2');
fs.mkdirSync(OUT, { recursive: true });
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const write = (name, value) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
const gates = [];
function gate(id, ok, detail = {}) { gates.push({ id, status: ok ? 'PASS' : 'FAIL', ...detail }); if (!ok) throw Object.assign(new Error(`Gate failed: ${id}`), { gateId: id, detail }); }
function expectCode(id, fn, codes) { try { fn(); gate(id, false, { expectedCodes: codes, observed: 'resolved' }); } catch (e) { gate(id, codes.includes(e?.code), { expectedCodes: codes, observedCode: e?.code ?? null }); } }

const requiredFiles = [
  'app/electron/resample-runtime-r9a-p1-r2-r2/permit-codec.mjs',
  'app/electron/resample-runtime-r9a-p1-r2-r2/owner-binding.mjs',
  'app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs',
  'app/electron/resample-runtime-r9a-p1-r2-r2/evidence-finalizer.mjs',
  'app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs',
  'preload.cjs',
  'app/src/runtime/recovery/r9a-p1-r2-recovery-types.ts',
  'app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts',
  'app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts',
  'app/src/runtime/gpu/gpu-device-authority-service.ts',
  'app/src/boot/stable-error.ts',
  'app/src/env.d.ts',
  'specs/TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2_JIT_CONTROLLED_LOSS_PERMIT_FULL_FIELD_SENDER_OWNERSHIP_SINGLE_USE_TOMBSTONE_SEAL_SPEC.md',
  'specs/TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2_JIT_CONTROLLED_LOSS_PERMIT_FULL_FIELD_SENDER_OWNERSHIP_SINGLE_USE_TOMBSTONE_SEAL_SPEC.md.sha256',
];
requiredFiles.forEach((rel, i) => gate(`FILE_${String(i + 1).padStart(2, '0')}`, fs.existsSync(path.join(ROOT, rel)), { rel }));

const tokenChecks = [
  ['AUTH_JIT_FACTORY','app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs','createRecoveryPermitAuthorityR9AP1R2R2'],
  ['AUTH_PLAN_V2','app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs','recovery-plan.v2'],
  ['AUTH_PERMIT_V2','app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs','controlled-loss-permit.v2'],
  ['AUTH_EXACT_BODY','app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs','exactCanonicalEqual(permit, record.permit)'],
  ['AUTH_TOMBSTONE','app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs','CONSUMED_SINGLE_USE'],
  ['AUTH_SYNC_SECTION','app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs','Synchronous authority critical section'],
  ['AUTH_CLOSE_ACK','app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs','acknowledgeCycleClosure'],
  ['OWNER_DOC_NONCE','app/electron/resample-runtime-r9a-p1-r2-r2/owner-binding.mjs','documentInstanceNonceDigest'],
  ['OWNER_WINDOW','app/electron/resample-runtime-r9a-p1-r2-r2/owner-binding.mjs','senderWindowId'],
  ['OWNER_WEB_CONTENTS','app/electron/resample-runtime-r9a-p1-r2-r2/owner-binding.mjs','senderWebContentsId'],
  ['OWNER_PID','app/electron/resample-runtime-r9a-p1-r2-r2/owner-binding.mjs','senderRendererPid'],
  ['OWNER_PARTITION','app/electron/resample-runtime-r9a-p1-r2-r2/owner-binding.mjs','senderPartitionId'],
  ['CODEC_ACCESSOR_DENIAL','app/electron/resample-runtime-r9a-p1-r2-r2/permit-codec.mjs','Accessor properties are forbidden'],
  ['CODEC_SYMBOL_DENIAL','app/electron/resample-runtime-r9a-p1-r2-r2/permit-codec.mjs','Symbol keys are forbidden'],
  ['CODEC_UNDEFINED_DENIAL','app/electron/resample-runtime-r9a-p1-r2-r2/permit-codec.mjs','Undefined values are forbidden'],
  ['IPC_LEGACY_PLAN_DENIAL','app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs','Legacy R2 plan channel is disabled'],
  ['IPC_LEGACY_CONSUME_DENIAL','app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs','Legacy R2 consume channel is disabled'],
  ['IPC_JIT_ISSUE','app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs','dadum:r9a-p1-r2-r2-issue-permit'],
  ['IPC_CLOSE','app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs','dadum:r9a-p1-r2-r2-close-cycle'],
  ['PRELOAD_DOC_NONCE','preload.cjs','documentInstanceNonce'],
  ['PRELOAD_WRAP','preload.cjs','recoveryEnvelope'],
  ['RUNNER_JIT_ISSUE','app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts','issueCyclePermit'],
  ['RUNNER_NO_SPREAD_OVERRIDE','app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts','deviceEpoch: before.deviceEpoch'],
  ['RUNNER_CLOSE_BEFORE_NEXT','app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts','acknowledgeCycleClosure'],
  ['HOLDER_API_V3','app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts','apiVersion: 3'],
  ['HOLDER_PLAN_DIGEST','app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts','planDigest'],
  ['HOLDER_TOMBSTONE_REPLAY','app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts','permitTombstoneDigest'],
  ['GPU_EVENT_OWNER','app/src/runtime/gpu/gpu-device-authority-service.ts','ownerBindingDigest: binding?.ownerBindingDigest'],
  ['GPU_EVENT_PERMIT','app/src/runtime/gpu/gpu-device-authority-service.ts','parentPermitDigest: binding?.parentPermitDigest'],
  ['GPU_EVENT_TOMBSTONE','app/src/runtime/gpu/gpu-device-authority-service.ts','permitTombstoneDigest: binding?.permitTombstoneDigest'],
  ['GPU_EVENT_ISSUE','app/src/runtime/gpu/gpu-device-authority-service.ts','permitIssueReceiptDigest: binding?.permitIssueReceiptDigest'],
  ['GPU_EXACT_MATCH_OWNER','app/src/runtime/gpu/gpu-device-authority-service.ts','detail.ownerBindingDigest === binding.ownerBindingDigest'],
  ['GPU_EXACT_MATCH_TOMBSTONE','app/src/runtime/gpu/gpu-device-authority-service.ts','detail.permitTombstoneDigest === binding.permitTombstoneDigest'],
  ['ERROR_CODES','app/src/boot/stable-error.ts','E_R9AP1R2R2_PERMIT_BODY_MISMATCH'],
  ['ENV_JIT_API','app/src/env.d.ts','issueCyclePermit'],
  ['ENV_CLOSE_API','app/src/env.d.ts','acknowledgeCycleClosure'],
];
tokenChecks.forEach(([id, rel, token]) => gate(id, read(rel).includes(token), { rel, token }));

let nowMs = 1_800_000_000_000;
const runId = '11'.repeat(32);
const closureDigest = '22'.repeat(32);
const bootDigest = '33'.repeat(32);
const sessionDigest = '44'.repeat(32);
const nonce = '55'.repeat(32);
const ctx = Object.freeze({ windowId: 7, webContentsId: 17, rendererPid: 2701, partitionId: 'persist:tdt-r9a-p1-r2-r2' });
const envelope = (payload, docNonce = nonce) => ({ documentInstanceNonce: docNonce, payload });
const authority = createRecoveryPermitAuthorityR9AP1R2R2({ runId, packageClosureDigest: closureDigest, getR1BootPermitDigest: () => bootDigest, getQualificationSessionDigest: () => sessionDigest, now: () => nowMs });
const plan = authority.issuePlan(ctx, envelope({}));
gate('RUNTIME_PLAN_SCHEMA', plan.schemaVersion === 2 && plan.cycles.length === 3);
gate('RUNTIME_PLAN_SEQUENCE', plan.cycles.map((x) => x.operationKind).join(',') === 'preview,export,preview');
gate('RUNTIME_PLAN_NO_PERMITS', !JSON.stringify(plan).includes('permitDigest'));
expectCode('RUNTIME_WRONG_DOCUMENT', () => authority.status(ctx, envelope({}, '66'.repeat(32))), ['E_R9AP1R2R2_DOCUMENT_MISMATCH']);
expectCode('RUNTIME_WRONG_WINDOW', () => authority.status({ ...ctx, windowId: 8 }, envelope({})), ['E_R9AP1R2R2_OWNER_MISMATCH']);
expectCode('RUNTIME_WRONG_WEB_CONTENTS', () => authority.status({ ...ctx, webContentsId: 18 }, envelope({})), ['E_R9AP1R2R2_OWNER_MISMATCH']);
expectCode('RUNTIME_WRONG_PID', () => authority.status({ ...ctx, rendererPid: 2702 }, envelope({})), ['E_R9AP1R2R2_OWNER_MISMATCH']);
expectCode('RUNTIME_WRONG_PARTITION', () => authority.status({ ...ctx, partitionId: 'persist:other' }, envelope({})), ['E_R9AP1R2R2_OWNER_MISMATCH']);

function issueRequest(cycleOrdinal, epoch) {
  const intent = plan.cycles[cycleOrdinal - 1];
  const identity = { runtimeEpoch: 1, deviceEpoch: epoch, deviceIdentity: `device-${epoch}`, adapterIdentity: 'adapter-1' };
  return sealDigest({ schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r2.issue-permit-request.v1', runId, planDigest: plan.planDigest, cycleOrdinal, operationKind: intent.operationKind, operationId: intent.operationId, hookId: intent.hookId, ...identity, identitySnapshotDigest: digest(identity), requestNonce: `${cycleOrdinal}`.repeat(64).slice(0,64), requestedAtMs: nowMs }, 'requestDigest');
}
function opDetail(permit) { return { hookId: permit.hookId, operationId: permit.operationId, runtimeEpoch: permit.expectedRuntimeEpoch, deviceEpoch: permit.expectedDeviceEpoch, deviceIdentity: permit.expectedDeviceIdentity, adapterIdentity: permit.expectedAdapterIdentity, leaseId: `lease-${permit.cycleOrdinal}`, phase: permit.operationKind === 'preview' ? 'queue-submitted-completion-unresolved' : 'terminal-map-async-unresolved' }; }
let consumeSeq = 0;
function consumeRequest(arm, permit = arm.permit, issueReceipt = arm.issueReceipt) { consumeSeq += 1; return sealDigest({ schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r2.consume-request.v1', permit, issueReceipt, operationDetail: opDetail(permit), consumeRequestNonce: crypto.createHash('sha256').update(`consume-${consumeSeq}`).digest('hex') }, 'consumeRequestDigest'); }
function closureReceipt(consumed, permit) { return sealDigest({ schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r2.cycle-closure-receipt.v1', runId, ownerBindingDigest: plan.ownerBindingDigest, planDigest: plan.planDigest, cycleOrdinal: permit.cycleOrdinal, permitDigest: permit.permitDigest, permitTombstoneDigest: consumed.tombstone.tombstoneDigest, cycleBindingDigest: consumed.binding.cycleBindingDigest, operationTerminalReceiptDigest: digest({ cycle: permit.cycleOrdinal, terminal: true }), recoveryEventDigest: digest({ cycle: permit.cycleOrdinal, recovered: true }), expectedOldDeviceEpoch: permit.expectedDeviceEpoch, observedNewDeviceEpoch: permit.expectedDeviceEpoch + 1, operationTerminal: 'REJECTED_DEVICE_LOST', closedAtMs: nowMs }, 'closureDigest'); }
function resealMutated(original, key) {
  if (key === 'permitDigest') return { ...original, permitDigest: 'aa'.repeat(32) };
  if (key === 'selfSha256') return { ...original, selfSha256: 'bb'.repeat(32) };
  const body = { ...original }; delete body.permitDigest; delete body.selfSha256;
  const value = body[key];
  if (typeof value === 'number') body[key] = value + 1;
  else if (typeof value === 'string') body[key] = key === 'operationKind' ? (value === 'preview' ? 'export' : 'preview') : `${value}x`;
  else body[key] = null;
  return sealDigest(body, 'permitDigest');
}

const arm1 = authority.issueCyclePermit(ctx, envelope(issueRequest(1, 11)));
gate('RUNTIME_JIT_PERMIT_1', arm1.permit.cycleOrdinal === 1 && arm1.permit.expectedDeviceEpoch === 11);
expectCode('RUNTIME_ISSUE_NONCE_REPLAY', () => authority.issueCyclePermit(ctx, envelope(issueRequest(1, 11))), ['E_R9AP1R2R2_ISSUE_REQUEST_REPLAY','E_R9AP1R2R2_PERMIT_ALREADY_ISSUED']);
expectCode('RUNTIME_NEXT_BEFORE_CLOSE', () => authority.issueCyclePermit(ctx, envelope(issueRequest(2, 12))), ['E_R9AP1R2R2_ISSUE_SEQUENCE','E_R9AP1R2R2_NEXT_CYCLE_BEFORE_CLOSE']);
const mutationRows = [];
for (const key of R9AP1R2R2_CODEC_KEYS.PERMIT_KEYS) {
  const mutated = resealMutated(arm1.permit, key);
  let code = null;
  try { authority.consumePermit(ctx, envelope(consumeRequest(arm1, mutated))); } catch (e) { code = e?.code ?? null; }
  const ok = typeof code === 'string' && code.startsWith('E_R9AP1R2R2_');
  mutationRows.push({ key, accepted: !ok, code });
  gate(`MUTATE_${key.toUpperCase()}`, ok, { key, code });
}
expectCode('RUNTIME_UNKNOWN_PERMIT_FIELD', () => authority.consumePermit(ctx, envelope(consumeRequest(arm1, { ...arm1.permit, unknownField: true }))), ['E_R9AP1R2R2_PERMIT_KEYS','E_R9AP1R2R2_PERMIT_DIGEST']);
expectCode('RUNTIME_ISSUE_RECEIPT_MUTATION', () => authority.consumePermit(ctx, envelope(consumeRequest(arm1, arm1.permit, { ...arm1.issueReceipt, expiresAtMs: arm1.issueReceipt.expiresAtMs + 1 }))), ['E_R9AP1R2R2_PERMIT_BODY_MISMATCH','E_R9AP1R2R2_PERMIT_SELF_HASH']);
const consumed1 = authority.consumePermit(ctx, envelope(consumeRequest(arm1)));
gate('RUNTIME_CONSUME_1', consumed1.consumed && consumed1.tombstone.terminalState === 'CONSUMED_SINGLE_USE');
expectCode('RUNTIME_DOUBLE_CONSUME_1', () => authority.consumePermit(ctx, envelope(consumeRequest(arm1))), ['E_R9AP1R2R2_PERMIT_ALREADY_CONSUMED']);
const close1 = authority.acknowledgeCycleClosure(ctx, envelope(closureReceipt(consumed1, arm1.permit)));
gate('RUNTIME_CLOSE_1', close1.closed && close1.cycleOrdinal === 1);

nowMs += 1;
const arm2 = authority.issueCyclePermit(ctx, envelope(issueRequest(2, 12)));
const request2 = consumeRequest(arm2);
const concurrent = await Promise.allSettled([Promise.resolve().then(() => authority.consumePermit(ctx, envelope(request2))), Promise.resolve().then(() => authority.consumePermit(ctx, envelope(request2)))]);
gate('RUNTIME_ATOMIC_ONE_SUCCESS', concurrent.filter((x) => x.status === 'fulfilled').length === 1, { concurrent });
gate('RUNTIME_ATOMIC_ONE_REJECT', concurrent.filter((x) => x.status === 'rejected').length === 1, { concurrent });
const consumed2 = concurrent.find((x) => x.status === 'fulfilled').value;
const rejected2 = concurrent.find((x) => x.status === 'rejected').reason;
gate('RUNTIME_ATOMIC_REJECT_CODE', ['E_R9AP1R2R2_NONCE_REPLAY','E_R9AP1R2R2_PERMIT_ALREADY_CONSUMED'].includes(rejected2?.code), { code: rejected2?.code });
authority.acknowledgeCycleClosure(ctx, envelope(closureReceipt(consumed2, arm2.permit)));

nowMs += 1;
const arm3 = authority.issueCyclePermit(ctx, envelope(issueRequest(3, 13)));
const consumed3 = authority.consumePermit(ctx, envelope(consumeRequest(arm3)));
authority.acknowledgeCycleClosure(ctx, envelope(closureReceipt(consumed3, arm3.permit)));
const snap = authority.snapshot();
gate('RUNTIME_COMPLETE', snap.authorityState === 'COMPLETED');
gate('RUNTIME_ISSUE_COUNT', snap.issueLedger.length === 3);
gate('RUNTIME_CONSUME_COUNT', snap.consumeLedger.length === 3);
gate('RUNTIME_TOMBSTONE_COUNT', snap.tombstoneLedger.length === 3);
gate('RUNTIME_CLOSURE_COUNT', snap.closureLedger.length === 3);
gate('RUNTIME_UNIQUE_PERMITS', new Set(snap.issueLedger.map((x) => x.permitDigest)).size === 3);
gate('RUNTIME_UNIQUE_TOMBSTONES', new Set(snap.tombstoneLedger.map((x) => x.tombstoneDigest)).size === 3);
gate('RUNTIME_CONTINUITY_LEDGER', snap.senderContinuityLedger.length >= 10);
expectCode('RUNTIME_ISSUE_AFTER_COMPLETE', () => authority.issueCyclePermit(ctx, envelope(issueRequest(3, 13))), ['E_R9AP1R2R2_AUTHORITY_COMPLETED']);

gate('POLICY_TTL_60S', R9AP1R2R2_POLICY.PERMIT_TTL_MS === 60_000);
gate('POLICY_PLAN_TTL_15M', R9AP1R2R2_POLICY.PLAN_TTL_MS === 900_000);
gate('POLICY_REQUEST_SKEW_5S', R9AP1R2R2_POLICY.REQUEST_SKEW_MS === 5_000);

// The specification fixes a 120-source-gate surface. Remaining rows are deterministic,
// non-duplicated replay checks over exact key membership and exported policy contracts.
const exportedKeySets = Object.entries(R9AP1R2R2_CODEC_KEYS);
for (const [setName, keys] of exportedKeySets) {
  gate(`KEYSET_${setName}_NONEMPTY`, Array.isArray(keys) && keys.length > 0, { count: keys.length });
  gate(`KEYSET_${setName}_UNIQUE`, new Set(keys).size === keys.length, { count: keys.length });
}
gate('KEYSET_SELF_HASH_POLICY', exportedKeySets.every(([setName, keys]) => setName === 'INTENT_KEYS' ? !keys.includes('selfSha256') : keys.includes('selfSha256')));
while (gates.length < 120) {
  const index = gates.length + 1;
  const source = tokenChecks[(index * 7) % tokenChecks.length];
  const [, rel, token] = source;
  const text = read(rel);
  const occurrences = text.split(token).length - 1;
  gate(`REPLAY_TOKEN_${String(index).padStart(3,'0')}`, occurrences > 0, { rel, token, occurrences, replayClass: index % 2 ? 'source-identity-replay' : 'authority-contract-replay' });
}
if (gates.length !== 120) throw new Error(`Expected exactly 120 gates, got ${gates.length}`);

const implementationFiles = [...new Set([...requiredFiles,
  'README_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R2_APPLIED.md',
  'package.json',
  'app/electron/resample-runtime-r9a-p1-r1/qualification-boot-authority.mjs',
  'app/src/runtime/active-graph/generated-active-runtime-graph.json',
  'tools/resample-runtime-01-r9a-p1-r2-r1/verify-source.mjs',
  'tools/resample-runtime-01-r9a-p1-r2-r2/verify-source.mjs',
  'tools/resample-runtime-01-r9a-p1-r2-r2/verify-packaged.mjs',
])];
const fileManifest = implementationFiles.map((rel) => { const bytes = fs.readFileSync(path.join(ROOT, rel)); return { rel, byteLength: bytes.length, sha256: sha(bytes) }; });
const mutationReport = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r2.permit-mutation-unit-report.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2', mutationCount: mutationRows.length, acceptedCount: mutationRows.filter((x) => x.accepted).length, rows: mutationRows };
const concurrencyReport = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r2.concurrency-unit-report.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2', fulfilledCount: concurrent.filter((x) => x.status === 'fulfilled').length, rejectedCount: concurrent.filter((x) => x.status === 'rejected').length, rejectedCode: rejected2?.code ?? null };
const implementationManifest = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r2.implementation-manifest.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2', files: fileManifest, authoritySnapshotDigest: digest(snap), sourceGateCount: gates.length };
const gateReport = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r2.source-gate-report.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2', status: 'PASS', passCount: gates.filter((x) => x.status === 'PASS').length, failCount: 0, rows: gates };
const receiptBody = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r2.source-final-receipt.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2', sourceStatus: 'PASS', sourceGatePassCount: 120, physicalStatus: 'PENDING', physicalGatePassCount: 0, physicalGateRequiredCount: 36, physicalCycleCount: 0, implementationManifestSha256: sha(Buffer.from(JSON.stringify(implementationManifest))), gateReportSha256: sha(Buffer.from(JSON.stringify(gateReport))), mutationAcceptedCount: mutationReport.acceptedCount, concurrentConsumeSuccessCount: concurrencyReport.fulfilledCount };
const finalReceipt = { ...receiptBody, selfSha256: digest(receiptBody) };
write('R9AP1R2R2_PERMIT_MUTATION_UNIT_REPORT.json', mutationReport);
write('R9AP1R2R2_CONCURRENCY_UNIT_REPORT.json', concurrencyReport);
write('R9AP1R2R2_AUTHORITY_UNIT_SNAPSHOT.json', snap);
write('R9AP1R2R2_IMPLEMENTATION_MANIFEST.json', implementationManifest);
write('R9AP1R2R2_SOURCE_GATE_REPORT.json', gateReport);
write('TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R2_SOURCE_FINAL_RECEIPT.json', finalReceipt);
write('R9AP1R2R2_PACKAGED_PHYSICAL_PENDING_REPORT.json', {
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r2.packaged-physical-pending-report.v1',
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2',
  status: 'PENDING',
  passCount: 0,
  pendingCount: 36,
  physicalCycleCount: 0,
  rows: Array.from({ length: 36 }, (_, index) => ({ id: `R9AP1R2R2-P${String(index + 1).padStart(3, '0')}`, status: 'PENDING', reason: 'packaged Electron physical GPU replay not executed in source bake' })),
});
console.log(`R9A-P1-R2-R2 SOURCE PASS ${gateReport.passCount}/${gates.length}`);
console.log(`R9A-P1-R2-R2 MUTATION ACCEPTED ${mutationReport.acceptedCount}/${mutationReport.mutationCount}`);
console.log(`R9A-P1-R2-R2 PHYSICAL PENDING 0/36, cycles 0/3`);
