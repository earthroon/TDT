import { loadLockPromotionState } from './build-emit-01-lib.mjs';
const state = loadLockPromotionState();
if (!state.promoted) {
  console.error(`BLOCKED BUILD-EMIT-01 ${state.state} E_BUILD_EMIT_LOCK_NOT_PROMOTED`);
  process.exit(1);
}
console.log(`PASS BUILD-EMIT-01 lock promotion ${state.state}`);
