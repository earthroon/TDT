import { json, win32Artifact, check, sha256File } from './lib.mjs';
import { finalizeProductionAdmission } from './finalizer.mjs';
const base = 'artifacts/build-lock-01-r2/win32/';
const files = {
  rootGraph: 'BLR2_ROOT_GRAPH_RECEIPT.json',
  candidateLock: 'BLR2_LOCK_CANDIDATE_RECEIPT.json',
  cacheClosure: 'BLR2_CACHE_CLOSURE_RECEIPT.json',
  installA: 'BLR2_INSTALL_A_RECEIPT.json',
  installB: 'BLR2_INSTALL_B_RECEIPT.json',
  lifecycleA: 'BLR2_LIFECYCLE_A_RECEIPT.json',
  lifecycleB: 'BLR2_LIFECYCLE_B_RECEIPT.json',
  installParity: 'BLR2_INSTALL_PARITY_RECEIPT.json',
  nativeToolchain: 'BLR2_NATIVE_TOOLCHAIN_RECEIPT.json',
  nativeA: 'BLR2_NATIVE_BUILD_A_RECEIPT.json',
  nativeB: 'BLR2_NATIVE_BUILD_B_RECEIPT.json',
  buildA: 'BLR2_PRODUCTION_BUILD_A_RECEIPT.json',
  buildB: 'BLR2_PRODUCTION_BUILD_B_RECEIPT.json',
  buildParity: 'BLR2_BUILD_PARITY_RECEIPT.json',
  mutationZero: 'BLR2_MUTATION_ZERO_RECEIPT.json',
  promotionIntent: 'BLR2_PROMOTION_INTENT.json',
  promotionEffect: 'BLR2_PROMOTION_EFFECT.json',
  postPromotionReplay: 'BLR2_POST_PROMOTION_REPLAY_RECEIPT.json'
};
const input = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, json(base + file)]));
const admission = finalizeProductionAdmission(input);
check(admission.productionBuildAdmitted === true, 'E_BUILD_LOCK_R2_FINAL_CHILD_MISSING', 'final admission did not close');
const finalReceipt = { ...admission, promotedPackageLockSha256: sha256File('package-lock.json') };
win32Artifact('TDT_BUILD_LOCK_01_R2_FINAL_ADMISSION_RECEIPT.json', finalReceipt);
console.log('TDT-BUILD-LOCK-01-R2 final Win32 admission emitted.');
