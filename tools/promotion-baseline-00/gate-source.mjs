import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SPEC_ID, canonicalJson, dependencyRootParity, readJson, run, seal, sha256Bytes, writeJsonAtomic } from './lib.mjs';

const checks = [];
function check(id, condition, detail = null) { checks.push({ id, status: condition ? 'PASS' : 'FAIL', detail }); }
function has(file, token) { return fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(token); }
function exists(relative) { return fs.existsSync(path.join(ROOT, relative)); }

const required = [
  'specs/TDT-PROMOTION-BASELINE-00_CANONICAL_DEPENDENCY_LOCK_DUAL_CLEAN_EMIT_PACKAGED_ELECTRON_RUNTIME_ADMISSION_SPEC.md',
  'tools/promotion-baseline-00/lib.mjs','tools/promotion-baseline-00/run.mjs','tools/promotion-baseline-00/audit-input.mjs',
  'tools/promotion-baseline-00/run-lock-promotion.mjs','tools/promotion-baseline-00/run-dual-emit.mjs','tools/promotion-baseline-00/run-dual-package.mjs',
  'tools/promotion-baseline-00/launch-packaged-candidate.mjs','tools/promotion-baseline-00/probe-runtime-health.mjs',
  'tools/promotion-baseline-00/run-cross-format-save-smoke.mjs','tools/promotion-baseline-00/verify-worker-restart.mjs',
  'tools/promotion-baseline-00/verify-relaunch.mjs','tools/promotion-baseline-00/run-test-pointer-recovery.mjs',
  'tools/promotion-baseline-00/issue-baseline-receipt.mjs','app/src/runtime/promotion/promotion-baseline-00-harness.ts',
];
for (const relative of required) check(`file:${relative}`, exists(relative));

const packageJson = readJson(path.join(ROOT, 'package.json'));
for (const script of ['verify:promotion-baseline-00','verify:promotion-baseline-00-source','verify:p0:lock','verify:p0:emit','verify:p0:package','verify:p0:e2e']) check(`script:${script}`, typeof packageJson.scripts?.[script] === 'string');
check('electron:receipt-sink-packaged-guard', has(path.join(ROOT,'electron.mjs'), "!config || !app.isPackaged"));
check('electron:phase-identity', has(path.join(ROOT,'electron.mjs'), 'DADUM_P0_E2E_PHASE'));
check('preload:receipt-sink', has(path.join(ROOT,'preload.cjs'), 'promotionBaseline00'));
check('preload:token-not-returned', !has(path.join(ROOT,'preload.cjs'), 'runToken: process.env'));
check('worker:forced-crash-packaged-only', has(path.join(ROOT,'app/src/runtime/workers/encoder-worker-broker-service.ts'), 'Forced Worker crash is admitted only inside packaged E2E mode'));
check('worker:idle-precondition', has(path.join(ROOT,'app/src/runtime/workers/encoder-worker-broker-service.ts'), 'Forced Worker crash requires an idle Worker'));
check('worker:generation-advance', has(path.join(ROOT,'app/src/runtime/workers/encoder-worker-broker-service.ts'), 'after.generation <= before.generation'));
check('runtime:harness-called-after-terminal', has(path.join(ROOT,'app/src/boot/bootstrap-renderer.ts'), 'await maybeRunPromotionBaseline00Harness()'));
check('runtime:cross-format-list', has(path.join(ROOT,'app/src/runtime/promotion/promotion-baseline-00-harness.ts'), "['png', 'webp-lossless', 'jpg', 'jxl', 'psd']"));
check('runtime:rgba16-smoke', has(path.join(ROOT,'app/src/runtime/promotion/promotion-baseline-00-harness.ts'), 'flattened-rgb16'));
check('runtime:worker-restart-smoke', has(path.join(ROOT,'app/src/runtime/promotion/promotion-baseline-00-harness.ts'), 'forceCrashForTest'));
check('lock:candidate-persisted', has(path.join(ROOT,'tools/run-build-lock-01.mjs'), 'TDT_BUILD_LOCK_01_CANONICAL_PACKAGE_LOCK_CANDIDATE.json'));
check('lock:frozen-cache-evidence', has(path.join(ROOT,'tools/run-build-lock-01.mjs'), 'frozenCacheLocalPath'));
check('package:dual-clean', has(path.join(ROOT,'tools/promotion-baseline-00/run-dual-package.mjs'), "packageOne('A'") && has(path.join(ROOT,'tools/promotion-baseline-00/run-dual-package.mjs'), "packageOne('B'"));
check('package:win-x64-unpacked', has(path.join(ROOT,'tools/promotion-baseline-00/run-dual-package.mjs'), "'--win','--x64','--dir'"));
check('pointer:production-mutation-forbidden', has(path.join(ROOT,'tools/promotion-baseline-00/issue-baseline-receipt.mjs'), 'P0_PRODUCTION_POINTER_MUTATED'));
check('pointer:test-only-cas', has(path.join(ROOT,'tools/promotion-baseline-00/run-test-pointer-recovery.mjs'), 'isolated-test-only'));
check('final:ceiling', has(path.join(ROOT,'tools/promotion-baseline-00/issue-baseline-receipt.mjs'), "promotionCeiling: 'PACKAGED_BASELINE_VERIFIED'"));
check('final:no-product-promotion', has(path.join(ROOT,'tools/promotion-baseline-00/issue-baseline-receipt.mjs'), 'productPromotionPerformed: false'));
const finalReceiptNames = fs.readdirSync(path.join(ROOT, 'artifacts/promotion-baseline-00/receipts')).filter((name) => name.endsWith('-packaged-baseline-receipt.json'));
const finalReceiptsValid = finalReceiptNames.every((name) => {
  const receipt = readJson(path.join(ROOT, 'artifacts/promotion-baseline-00/receipts', name), {});
  return receipt.status === 'PASS' && receipt.state === 'PACKAGED_BASELINE_VERIFIED' && receipt.productionPointerMutationPerformed === false;
});
check('source:no-false-final-receipt', finalReceiptsValid, finalReceiptNames);

for (const file of fs.readdirSync(path.join(ROOT,'tools/promotion-baseline-00')).filter((name) => name.endsWith('.mjs'))) {
  const result = run(process.execPath, ['--check', path.join('tools','promotion-baseline-00',file)], { cwd: ROOT, timeoutMs: 30_000 });
  check(`syntax:${file}`, result.exitCode === 0, result.exitCode === 0 ? null : result.stderr);
}
const transpile = run(process.execPath, ['tools/promotion-baseline-00/transpile-source-check.mjs'], { cwd: ROOT, timeoutMs: 120_000 });
check('typescript:promotion-surface-transpile', transpile.exitCode === 0, transpile.exitCode === 0 ? null : transpile.stderr);

for (const [id, script] of [['child-gate:build-lock','tools/gate-build-lock-01.mjs'],['child-gate:build-emit','tools/gate-build-emit-01.mjs']]) {
  const result = run(process.execPath, [script], { cwd: ROOT, timeoutMs: 120_000 });
  check(id, result.exitCode === 0, result.exitCode === 0 ? null : result.stderr);
}
const parity = dependencyRootParity();
const childLockReceipt = readJson(path.join(ROOT, 'artifacts/runtime/TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json'), {});
const lockTruthConsistent = parity.exact
  ? childLockReceipt.promoted === true && childLockReceipt.state === 'DEPENDENCY_LOCK_PROMOTED'
  : childLockReceipt.promoted !== true;
check('current-source:lock-truth-consistent', lockTruthConsistent, { parity, childLockState: childLockReceipt.state ?? null, childLockPromoted: childLockReceipt.promoted ?? false });

const failed = checks.filter((item) => item.status === 'FAIL');
const passingState = finalReceiptNames.length
  ? 'PACKAGED_BASELINE_VERIFIED_SOURCE_GATE'
  : parity.exact ? 'SOURCE_LOCK_PROMOTED' : 'SOURCE_BAKED_UNPROMOTED';
const payload = seal({
  schemaVersion: 1,
  specId: SPEC_ID,
  status: failed.length ? 'FAIL' : 'PASS',
  state: failed.length ? 'SOURCE_GATE_FAILED' : passingState,
  passCount: checks.length - failed.length,
  failCount: failed.length,
  checks,
  checkSetDigest: sha256Bytes(canonicalJson(checks)),
  createdAt: new Date().toISOString(),
});
writeJsonAtomic(path.join(ROOT,'artifacts/promotion-baseline-00/receipts/source-gate-report.json'), payload);
console.log(`${payload.status} ${SPEC_ID} ${payload.passCount}/${checks.length} state=${payload.state}`);
if (failed.length) {
  for (const item of failed) console.error(`FAIL ${item.id}`, item.detail ?? '');
  process.exitCode = 1;
}
