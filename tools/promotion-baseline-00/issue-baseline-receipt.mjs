import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, appendReceipt, assert, digestFileSet, productionPointerPreflight, promotionAuthorityDigest, readJson, seal, writeFailure } from './lib.mjs';

try {
  const canonicalInput = readJson(path.join(ARTIFACT_ROOT, 'input', 'canonical-baseline-input.json'));
  const lock = readJson(path.join(ARTIFACT_ROOT, 'lock', 'dependency-lock-promotion-receipt.json'));
  const emit = readJson(path.join(ARTIFACT_ROOT, 'emit', 'emitted-artifact-identity-receipt.json'));
  const pkg = readJson(path.join(ARTIFACT_ROOT, 'package', 'package-identity-receipt.json'));
  const runtime = readJson(path.join(ARTIFACT_ROOT, 'runtime', 'runtime-health-verification-receipt.json'));
  const save = readJson(path.join(ARTIFACT_ROOT, 'save-smoke', 'cross-format-save-smoke-verification-receipt.json'));
  const restart = readJson(path.join(ARTIFACT_ROOT, 'worker-restart', 'worker-restart-verification-receipt.json'));
  const relaunch = readJson(path.join(ARTIFACT_ROOT, 'runtime', 'relaunch-verification-receipt.json'));
  const pointer = readJson(path.join(ARTIFACT_ROOT, 'test-pointer', 'test-pointer-recovery-receipt.json'));
  assert(lock.state === 'DEPENDENCY_LOCK_PROMOTED' && lock.promoted === true, 'P0_FINAL_LOCK_REJECTED');
  assert(emit.state === 'EMITTED_ARTIFACT_IDENTITY_VERIFIED', 'P0_FINAL_EMIT_REJECTED');
  assert(pkg.state === 'PACKAGE_CONTENT_IDENTITY_VERIFIED', 'P0_FINAL_PACKAGE_REJECTED');
  assert(runtime.state === 'PACKAGED_RUNTIME_HEALTH_VERIFIED', 'P0_FINAL_RUNTIME_REJECTED');
  assert(save.state === 'CROSS_FORMAT_SAVE_SMOKE_VERIFIED', 'P0_FINAL_SAVE_REJECTED');
  assert(restart.state === 'WORKER_RESTART_AND_PENDING_CLOSURE_VERIFIED', 'P0_FINAL_RESTART_REJECTED');
  assert(relaunch.state === 'PACKAGED_RELAUNCH_VERIFIED', 'P0_FINAL_RELAUNCH_REJECTED');
  assert(pointer.state === 'ISOLATED_TEST_POINTER_CAS_ROLLBACK_VERIFIED' && pointer.productionPointerMutationPerformed === false, 'P0_FINAL_POINTER_REJECTED');
  const pointerNow = productionPointerPreflight();
  assert(pointerNow.digest === canonicalInput.productionPointerPreflightSha256, 'P0_PRODUCTION_POINTER_MUTATED', { expected: canonicalInput.productionPointerPreflightSha256, actual: pointerNow.digest });
  const buildAuthorityNow = digestFileSet(['vite.config.ts','tools/build-emit-01-lib.mjs','tools/run-build-emit-01.mjs','package.json']);
  const electronAuthorityNow = digestFileSet(['electron.mjs','preload.cjs','app/electron/static-coi-server.mjs','app/electron/ep03-e2e-guard.mjs']);
  const runtimeApiNow = digestFileSet(['app/src/env.d.ts','app/src/boot/bootstrap-renderer.ts','app/src/runtime/export/export-authority-service.ts','app/src/runtime/workers/encoder-worker-broker-service.ts','app/src/runtime/workers/encoder-worker-types.ts','app/src/runtime/promotion/promotion-baseline-00-harness.ts']);
  const promotionAuthorityNow = promotionAuthorityDigest();
  assert(buildAuthorityNow.digest === canonicalInput.buildAuthoritySha256, 'P0_SOURCE_AUTHORITY_MUTATED', { authority: 'build', expected: canonicalInput.buildAuthoritySha256, actual: buildAuthorityNow.digest });
  assert(electronAuthorityNow.digest === canonicalInput.electronAuthoritySha256, 'P0_SOURCE_AUTHORITY_MUTATED', { authority: 'electron', expected: canonicalInput.electronAuthoritySha256, actual: electronAuthorityNow.digest });
  assert(runtimeApiNow.digest === canonicalInput.runtimeApiSchemaSha256, 'P0_SOURCE_AUTHORITY_MUTATED', { authority: 'runtime-api', expected: canonicalInput.runtimeApiSchemaSha256, actual: runtimeApiNow.digest });
  assert(promotionAuthorityNow.digest === canonicalInput.promotionAuthoritySha256, 'P0_SOURCE_AUTHORITY_MUTATED', { authority: 'promotion-baseline-00', expected: canonicalInput.promotionAuthoritySha256, actual: promotionAuthorityNow.digest });
  const receipt = seal({
    schemaVersion: 1,
    specId: SPEC_ID,
    status: 'PASS',
    state: 'PACKAGED_BASELINE_VERIFIED',
    promotionCeiling: 'PACKAGED_BASELINE_VERIFIED',
    productionPointerMutationPerformed: false,
    productPromotionPerformed: false,
    packageContentId: pkg.packageContentId,
    canonicalInputDigest: canonicalInput.selfDigest,
    evidence: {
      lock: lock.selfDigest,
      emit: emit.selfDigest,
      package: pkg.selfDigest,
      runtime: runtime.selfDigest,
      save: save.selfDigest,
      workerRestart: restart.selfDigest,
      relaunch: relaunch.selfDigest,
      testPointer: pointer.selfDigest,
    },
    residualBlockers: [
      'native-decoder-production-promotion-out-of-scope',
      'psd-rust-wasm-production-promotion-out-of-scope',
      'independent-pixel-roundtrip-matrix-out-of-scope',
    ],
    createdAt: new Date().toISOString(),
  });
  appendReceipt('receipts', 'packaged-baseline-receipt', receipt);
  console.log(`PASS ${SPEC_ID} state=${receipt.state} package=${receipt.packageContentId}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0_FINAL_RECEIPT_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
