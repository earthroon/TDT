import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanonicalPipelineRegistryAuthorityR2R3 } from '../../app/legacy-runtime/modules/dk_resample/canonical_pipeline_registry_r2r3.mjs';
import { fakePipelineSet, identity, waitForBuilding, digest } from './test-fixture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r2-r3');
fs.mkdirSync(OUT, { recursive: true });
let current = identity(21);
const device = Object.freeze({ id: 'late-completion-device' });
let releaseBuild;
const deferred = new Promise((resolve) => { releaseBuild = resolve; });
const fixture = fakePipelineSet(current);
const authority = createCanonicalPipelineRegistryAuthorityR2R3({
  identityProvider: () => current,
  buildFactory: async () => { await deferred; return fixture.pipes; },
  now: (() => { let tick = 2000; return () => ++tick; })(),
});
const buildOutcome = authority.build({ identity: current, device, mode: 'LAZY_EXECUTION' }).then(() => ({ resolved: true, code: null })).catch((error) => ({ resolved: false, code: error?.code ?? null }));
await waitForBuilding(authority);
const invalidationPromise = authority.invalidate({ schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r3.pipeline-invalidation-request.v1', runtimeEpoch: current.runtimeEpoch, deviceEpoch: current.deviceEpoch, deviceIdentity: current.deviceIdentity, reason: 'unit-late-completion', cycleBindingDigest: null });
releaseBuild();
const [build, invalidation] = await Promise.all([buildOutcome, invalidationPromise]);
const snapshot = await authority.snapshot();
const report = {
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r3.late-completion-unit-report.v1',
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3',
  status: !build.resolved && build.code === 'E_R9AP1R2R3_BUILD_INVALIDATED' && fixture.stats.rootDisposeCount === 1 && fixture.stats.tensorDisposeCount === 1 && fixture.stats.adaptiveDisposeCount === 1 && fixture.stats.effectDisposeCount === 1 && snapshot.lateCompletionDisposeCount === 1 && snapshot.entries.every((entry) => entry.state !== 'ACTIVE') ? 'PASS' : 'FAIL',
  buildOutcome: build,
  invalidationReceipt: invalidation,
  disposeCounts: fixture.stats,
  snapshot,
};
const sealedReport = Object.freeze({ ...report, selfSha256: digest(report) });
fs.writeFileSync(path.join(OUT, 'R9AP1R2R3_LATE_COMPLETION_UNIT_REPORT.json'), JSON.stringify(sealedReport, null, 2) + '\n');
if (report.status !== 'PASS') throw new Error('Late completion unit failed');
console.log('R2-R3 LATE-COMPLETION PASS');
