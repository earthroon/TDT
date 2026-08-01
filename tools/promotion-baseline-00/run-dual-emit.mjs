import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_ROOT, ROOT, SPEC_ID, assert, assertCanonicalHost, assertProductionPointersUnchanged, copyReceiptSet, productionPointerPreflight, readJson, run, seal, sha256File, writeJsonAtomic, writeFailure } from './lib.mjs';

try {
  assertCanonicalHost();
  const pointerBefore = productionPointerPreflight();
  const lockReceipt = readJson(path.join(ARTIFACT_ROOT, 'lock', 'dependency-lock-promotion-receipt.json'));
  assert(lockReceipt.state === 'DEPENDENCY_LOCK_PROMOTED' && lockReceipt.promoted === true, 'P0B_LOCK_NOT_PROMOTED');
  const frozenCache = String(process.env.DADUM_FROZEN_NPM_CACHE || lockReceipt.frozenCacheLocalPath || '');
  assert(frozenCache && fs.existsSync(frozenCache), 'P0B_FROZEN_CACHE_MISSING', { frozenCacheDeclared: Boolean(frozenCache) });

  const command = run(process.execPath, ['tools/run-build-emit-01.mjs', '--mode=production-ab'], {
    cwd: ROOT,
    env: { ...process.env, DADUM_FROZEN_NPM_CACHE: frozenCache, DADUM_PROMOTION_BASELINE_00: '1' },
    timeoutMs: 1_800_000,
  });
  assert(command.exitCode === 0, 'P0B_DUAL_EMIT_FAILED', command);
  const child = readJson(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_EMIT_01_EMITTED_ARTIFACT_IDENTITY_RECEIPT.json'));
  assert(child.status === 'EMITTED_ARTIFACT_IDENTITY_VERIFIED' && child.productionBytesObserved === true, 'P0B_CHILD_RECEIPT_REJECTED', { child });
  const repro = readJson(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_EMIT_01_BUILD_REPRODUCIBILITY_RECEIPT.json'));
  assert(repro.status === 'BUILD_REPRODUCIBILITY_VERIFIED' || repro.status === 'PASS', 'P0B_EMIT_NONDETERMINISTIC', { repro });
  assertProductionPointersUnchanged(pointerBefore);

  const copied = copyReceiptSet([
    'artifacts/runtime/TDT_BUILD_EMIT_01_BUILD_INPUT_MANIFEST.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_BUILD_A_REPORT.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_BUILD_B_REPORT.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_VITE_ENTRY_GRAPH.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_EMITTED_WORKER_MANIFEST.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_WORKER_CLOSURE_REPORT.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_ARTIFACT_OWNERSHIP_REPORT.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_STATIC_ROUTE_MANIFEST.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_ELECTRON_COI_ROUTE_REPORT.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_SERVER_PARITY_REPORT.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_BUILD_REPRODUCIBILITY_RECEIPT.json',
    'artifacts/runtime/TDT_BUILD_EMIT_01_EMITTED_ARTIFACT_IDENTITY_RECEIPT.json',
  ], path.join(ARTIFACT_ROOT, 'emit'));
  const receipt = seal({
    schemaVersion: 1,
    specId: SPEC_ID,
    state: 'EMITTED_ARTIFACT_IDENTITY_VERIFIED',
    status: 'PASS',
    productionBytesObserved: true,
    packageInputDigest: child.packageInputDigest ?? child.buildInputManifestDigest ?? null,
    emittedArtifactIdentityDigest: child.selfDigest ?? sha256File(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_EMIT_01_EMITTED_ARTIFACT_IDENTITY_RECEIPT.json')),
    buildReproducibilityReceiptDigest: repro.selfDigest ?? sha256File(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_EMIT_01_BUILD_REPRODUCIBILITY_RECEIPT.json')),
    copiedEvidenceDigest: copied.digest,
    productionPointerMutationPerformed: false,
    createdAt: new Date().toISOString(),
  });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'emit', 'emitted-artifact-identity-receipt.json'), receipt);
  console.log(`PASS ${SPEC_ID} state=EMITTED_ARTIFACT_IDENTITY_VERIFIED emit=${receipt.emittedArtifactIdentityDigest}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0B_DUAL_EMIT_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
