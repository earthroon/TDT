import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_ROOT, ROOT, SPEC_ID, assert, assertCanonicalHost, assertProductionPointersUnchanged, copyReceiptSet, productionPointerPreflight, readJson, run, seal, sha256File, writeJsonAtomic, writeFailure } from './lib.mjs';

try {
  const toolchain = assertCanonicalHost();
  const pointerBefore = productionPointerPreflight();
  const packageBefore = sha256File(path.join(ROOT, 'package.json'));
  const lockBefore = sha256File(path.join(ROOT, 'package-lock.json'));
  const registry = String(process.env.TDT_BUILD_LOCK_REGISTRY ?? '').trim();
  assert(registry.length > 0, 'P0A_INPUT_AUTHORITY_MISMATCH', { missing: 'TDT_BUILD_LOCK_REGISTRY' });

  const recovery = run(process.execPath, ['tools/run-build-lock-01.mjs', '--mode=recover'], {
    cwd: ROOT,
    env: { ...process.env, TDT_BUILD_LOCK_REGISTRY: registry, DADUM_PROMOTION_BASELINE_00: '1' },
    timeoutMs: 900_000,
  });
  assert(recovery.exitCode === 0, 'P0A_LOCK_RECOVERY_FAILED', recovery);

  const candidatePath = path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_CANONICAL_PACKAGE_LOCK_CANDIDATE.json');
  assert(fs.existsSync(candidatePath), 'P0A_LOCK_CANDIDATE_MISSING', { candidatePath: 'artifacts/runtime/TDT_BUILD_LOCK_01_CANONICAL_PACKAGE_LOCK_CANDIDATE.json' });
  const childRepro = readJson(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_INSTALL_REPRODUCIBILITY_REPORT.json'));
  const childMutation = readJson(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_LOCK_MUTATION_ZERO_REPORT.json'));
  assert(childRepro.status === 'PASS' && childRepro.reproducible === true, 'P0A_OFFLINE_REPLAY_FAILED', { childRepro });
  assert(childMutation.status === 'PASS', 'P0A_LOCK_MUTATION_FAILED', { childMutation });

  const promotion = run(process.execPath, ['tools/promote-build-lock-01.mjs'], {
    cwd: ROOT,
    env: { ...process.env, TDT_BUILD_LOCK_CANDIDATE: candidatePath },
    timeoutMs: 120_000,
  });
  assert(promotion.exitCode === 0, 'P0A_LOCK_PROMOTION_FAILED', promotion);
  const childReceipt = readJson(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json'));
  assert(childReceipt.promoted === true && childReceipt.state === 'DEPENDENCY_LOCK_PROMOTED', 'P0A_CHILD_RECEIPT_REJECTED', { childReceipt });
  assert(packageBefore === sha256File(path.join(ROOT, 'package.json')), 'P0A_PACKAGE_JSON_MUTATED');
  assertProductionPointersUnchanged(pointerBefore);

  const copied = copyReceiptSet([
    'package.json',
    'package-lock.json',
    'tools/registry-input-profile.json',
    'artifacts/runtime/TDT_BUILD_LOCK_01_CACHE_CLOSURE_MANIFEST.json',
    'artifacts/runtime/TDT_BUILD_LOCK_01_OFFLINE_CI_A_RECEIPT.json',
    'artifacts/runtime/TDT_BUILD_LOCK_01_OFFLINE_CI_B_RECEIPT.json',
    'artifacts/runtime/TDT_BUILD_LOCK_01_INSTALL_GRAPH_A.json',
    'artifacts/runtime/TDT_BUILD_LOCK_01_INSTALL_GRAPH_B.json',
    'artifacts/runtime/TDT_BUILD_LOCK_01_LOCK_MUTATION_ZERO_REPORT.json',
    'artifacts/runtime/TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json',
  ], path.join(ARTIFACT_ROOT, 'lock'));

  const commandEvidence = readJson(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_COMMAND_EVIDENCE.json'), {});
  const receipt = seal({
    schemaVersion: 1,
    specId: SPEC_ID,
    state: 'DEPENDENCY_LOCK_PROMOTED',
    status: 'PASS',
    promoted: true,
    canonicalHost: true,
    toolchain,
    packageJsonSha256: sha256File(path.join(ROOT, 'package.json')),
    oldPackageLockSha256: lockBefore,
    promotedPackageLockSha256: sha256File(path.join(ROOT, 'package-lock.json')),
    frozenCacheLocalPath: commandEvidence.frozenCacheLocalPath ?? null,
    frozenCacheManifestDigest: readJson(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_CACHE_CLOSURE_MANIFEST.json')).digest,
    offlineReplayCount: 2,
    installGraphParity: true,
    lockMutationZero: true,
    productionPointerMutationPerformed: false,
    copiedEvidenceDigest: copied.digest,
    childPromotionReceiptDigest: sha256File(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json')),
    createdAt: new Date().toISOString(),
  });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'lock', 'dependency-lock-promotion-receipt.json'), receipt);
  console.log(`PASS ${SPEC_ID} state=DEPENDENCY_LOCK_PROMOTED lock=${receipt.promotedPackageLockSha256}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0A_LOCK_PROMOTION_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
