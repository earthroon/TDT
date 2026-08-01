import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanonicalPipelineRegistryAuthorityR2R3 } from '../../app/legacy-runtime/modules/dk_resample/canonical_pipeline_registry_r2r3.mjs';
import { fakePipelineSet, identity, rebuildRequest, digest } from './test-fixture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r2-r3');
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
async function expectCode(id, fn, expected) {
  try { await fn(); rows.push({ id, status: 'FAIL', observedCode: null, expected }); }
  catch (error) { rows.push({ id, status: expected.includes(error?.code), observedCode: error?.code ?? null, expected }); }
}

let current = identity(31);
const oldDevice = Object.freeze({ id: 'old-device' });
const newDevice = Object.freeze({ id: 'new-device' });
const oldFixture = fakePipelineSet(current);
let factoryMode = 'old';
const authority = createCanonicalPipelineRegistryAuthorityR2R3({
  identityProvider: () => current,
  buildFactory: async () => factoryMode === 'old' ? oldFixture.pipes : fakePipelineSet(current).pipes,
  now: (() => { let tick = 3000; return () => ++tick; })(),
});
const oldResult = await authority.build({ identity: current, device: oldDevice, mode: 'LAZY_EXECUTION' });
await expectCode('VALIDATION_BEFORE_REBUILD', () => authority.requireReady({ deviceEpoch: current.deviceEpoch, deviceIdentity: current.deviceIdentity, pipelineRebuildReceiptDigest: '0'.repeat(64), pipelineSetIdentityDigest: '1'.repeat(64) }), ['E_R9AP1R2R3_REGISTRY_NOT_READY']);
const invalidation = await authority.invalidate({ schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r3.pipeline-invalidation-request.v1', runtimeEpoch: current.runtimeEpoch, deviceEpoch: current.deviceEpoch, deviceIdentity: current.deviceIdentity, reason: 'unit-old-reuse', cycleBindingDigest: null });
oldResult.pipes.pipeEWA.dispose();
const idempotentDisposePass = oldFixture.stats.rootDisposeCount === 1 && oldFixture.stats.tensorDisposeCount === 1 && oldFixture.stats.adaptiveDisposeCount === 1 && oldFixture.stats.effectDisposeCount === 1;
current = identity(32);
factoryMode = 'new';
const rebuilt = await authority.rebuild(rebuildRequest(current, 31), { device: newDevice, leaseAssertCurrent() {} });
await authority.requireReady({ deviceEpoch: current.deviceEpoch, deviceIdentity: current.deviceIdentity, pipelineRebuildReceiptDigest: rebuilt.rebuildReceipt.rebuildDigest, pipelineSetIdentityDigest: rebuilt.pipelineSetIdentity.pipelineSetIdentityDigest });
await expectCode('OLD_PIPELINE_EXECUTION', () => authority.getForExecution({ device: oldDevice, runtimeEpoch: 1, deviceEpoch: 31 }), ['E_R9AP1R2R3_STALE_PIPELINE_SET']);
await expectCode('EAGER_REBUILD_REUSE', () => authority.rebuild(rebuildRequest(current, 31, 2), { device: newDevice, leaseAssertCurrent() {} }), ['E_R9AP1R2R3_BUILD_ALREADY_TERMINAL']);
await expectCode('INVALIDATION_EXTRA_KEY', () => authority.invalidate({ schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r3.pipeline-invalidation-request.v1', runtimeEpoch: 1, deviceEpoch: 32, deviceIdentity: current.deviceIdentity, reason: 'bad', cycleBindingDigest: null, extra: true }), ['E_R9AP1R2R3_INVALIDATION_IDENTITY']);
const omissionAuthority = createCanonicalPipelineRegistryAuthorityR2R3({ identityProvider: () => current, buildFactory: async () => { const value = fakePipelineSet(current).pipes; delete value.pipeEWA.adaptivePolicyR1D; return value; } });
await expectCode('ADAPTIVE_OMISSION', () => omissionAuthority.build({ identity: current, device: Object.freeze({ id: 'omission' }), mode: 'LAZY_EXECUTION' }), ['E_R9AP1R2R3_PIPELINE_FAMILY_INCOMPLETE']);
const registrySnapshot = await authority.snapshot();
const report = {
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r3.source-negative-controls.v1',
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3',
  status: rows.every((row) => row.status === true) && oldResult.pipes.pipeEWA.disposed === true && idempotentDisposePass && invalidation.activeEntryCount === 1 && rebuilt.rebuildReceipt.physicalBuildCount === 1 ? 'PASS' : 'FAIL',
  oldPipelineDisposed: oldResult.pipes.pipeEWA.disposed === true,
  oldDisposeCounts: oldFixture.stats,
  idempotentDisposePass,
  invalidationReceipt: invalidation,
  rebuildReceipt: rebuilt.rebuildReceipt,
  pipelineSetIdentity: rebuilt.pipelineSetIdentity,
  registrySnapshot,
  rows,
};
const sealedReport = Object.freeze({ ...report, selfSha256: digest(report) });
fs.writeFileSync(path.join(OUT, 'R9AP1R2R3_SOURCE_NEGATIVE_CONTROL_REPORT.json'), JSON.stringify(sealedReport, null, 2) + '\n');
if (report.status !== 'PASS') throw new Error('R2-R3 negative controls failed');
console.log(`R2-R3 NEGATIVE CONTROLS PASS ${rows.length}/${rows.length}`);
