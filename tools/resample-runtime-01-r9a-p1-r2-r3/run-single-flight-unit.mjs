import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanonicalPipelineRegistryAuthorityR2R3 } from '../../app/legacy-runtime/modules/dk_resample/canonical_pipeline_registry_r2r3.mjs';
import { fakePipelineSet, identity, digest } from './test-fixture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r2-r3');
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
for (const callerCount of [2, 4, 8]) {
  let current = identity(callerCount);
  const device = Object.freeze({ id: `device-object-${callerCount}` });
  let physicalFactoryCount = 0;
  const authority = createCanonicalPipelineRegistryAuthorityR2R3({
    identityProvider: () => current,
    buildFactory: async () => {
      physicalFactoryCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return fakePipelineSet(current).pipes;
    },
    now: (() => { let tick = 1000; return () => ++tick; })(),
  });
  const results = await Promise.all(Array.from({ length: callerCount }, () => authority.build({ identity: current, device, mode: 'LAZY_EXECUTION' })));
  const snapshot = await authority.snapshot();
  const active = snapshot.entries.filter((entry) => entry.state === 'ACTIVE');
  const row = {
    callerCount,
    physicalFactoryCount,
    physicalBuildCount: snapshot.physicalBuildCount,
    joinCount: snapshot.singleFlightJoinCount,
    activeEntryCount: active.length,
    samePipelineObjectCount: results.filter((result) => result.pipes === results[0].pipes).length,
    samePipelineSetDigestCount: results.filter((result) => result.pipelineSetIdentity.pipelineSetIdentityDigest === results[0].pipelineSetIdentity.pipelineSetIdentityDigest).length,
    pass: physicalFactoryCount === 1 && snapshot.physicalBuildCount === 1 && snapshot.singleFlightJoinCount === callerCount - 1 && active.length === 1 && results.every((result) => result.pipes === results[0].pipes),
  };
  rows.push(row);
}

let differentIdentity = identity(90);
let differentBuildCount = 0;
const differentAuthority = createCanonicalPipelineRegistryAuthorityR2R3({
  identityProvider: () => differentIdentity,
  buildFactory: async () => { differentBuildCount += 1; return fakePipelineSet(differentIdentity).pipes; },
});
await differentAuthority.build({ identity: differentIdentity, device: Object.freeze({ id: 'different-a' }), mode: 'LAZY_EXECUTION' });
differentIdentity = identity(91);
await differentAuthority.build({ identity: differentIdentity, device: Object.freeze({ id: 'different-b' }), mode: 'LAZY_EXECUTION' });
const differentSnapshot = await differentAuthority.snapshot();
const differentKeyPass = differentBuildCount === 2 && differentSnapshot.physicalBuildCount === 2 && differentSnapshot.singleFlightJoinCount === 0;

let retryIdentity = identity(92);
let retryFactoryCount = 0;
const retryAuthority = createCanonicalPipelineRegistryAuthorityR2R3({
  identityProvider: () => retryIdentity,
  buildFactory: async () => { retryFactoryCount += 1; if (retryFactoryCount === 1) throw Object.assign(new Error('intentional'), { code: 'E_R9AP1R2R3_BUILD_FAILED' }); return fakePipelineSet(retryIdentity).pipes; },
});
let firstFailureCode = null;
try { await retryAuthority.build({ identity: retryIdentity, device: Object.freeze({ id: 'retry-device' }), mode: 'LAZY_EXECUTION' }); } catch (error) { firstFailureCode = error?.code ?? null; }
const retryDevice = Object.freeze({ id: 'retry-device' });
// The object identity guard is exact, so use one shared device for both retry attempts.
let sharedRetryCount = 0;
const sharedRetryAuthority = createCanonicalPipelineRegistryAuthorityR2R3({
  identityProvider: () => retryIdentity,
  buildFactory: async () => { sharedRetryCount += 1; if (sharedRetryCount === 1) throw Object.assign(new Error('intentional'), { code: 'E_R9AP1R2R3_BUILD_FAILED' }); return fakePipelineSet(retryIdentity).pipes; },
});
let sharedFailureCode = null;
try { await sharedRetryAuthority.build({ identity: retryIdentity, device: retryDevice, mode: 'LAZY_EXECUTION' }); } catch (error) { sharedFailureCode = error?.code ?? null; }
const retryResult = await sharedRetryAuthority.build({ identity: retryIdentity, device: retryDevice, mode: 'LAZY_EXECUTION' });
const retrySnapshot = await sharedRetryAuthority.snapshot();
const failedRetryPass = sharedFailureCode === 'E_R9AP1R2R3_BUILD_FAILED' && sharedRetryCount === 2 && retrySnapshot.entries.some((entry) => entry.state === 'ACTIVE') && Boolean(retryResult.pipelineSetIdentity?.pipelineSetIdentityDigest);

const report = {
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r3.single-flight-unit-report.v1',
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3',
  status: rows.every((row) => row.pass) && differentKeyPass && failedRetryPass ? 'PASS' : 'FAIL',
  matrix: rows,
  differentKey: { pass: differentKeyPass, physicalBuildCount: differentSnapshot.physicalBuildCount, joinCount: differentSnapshot.singleFlightJoinCount },
  failedRetry: { pass: failedRetryPass, firstFailureCode: sharedFailureCode, physicalBuildCount: retrySnapshot.physicalBuildCount, entryStates: retrySnapshot.entries.map((entry) => entry.state) },
};
const sealedReport = Object.freeze({ ...report, selfSha256: digest(report) });
fs.writeFileSync(path.join(OUT, 'R9AP1R2R3_SINGLE_FLIGHT_UNIT_REPORT.json'), JSON.stringify(sealedReport, null, 2) + '\n');
if (report.status !== 'PASS') throw new Error('Single-flight unit matrix failed');
console.log(`R2-R3 SINGLE-FLIGHT PASS ${rows.length}/${rows.length}`);
