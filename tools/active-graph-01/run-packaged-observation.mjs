import { findPackagedBaselineReceipt, writeCanonicalReceipt, PATCH_ID } from './lib.mjs';
const baseline = findPackagedBaselineReceipt();
const receipt = writeCanonicalReceipt('artifacts/active-graph-01/source-bake/runtime-observation-status.json', {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: baseline ? 'READY_NOT_EXECUTED' : 'DEFERRED',
  state: baseline ? 'PACKAGED_OBSERVATION_REQUIRED' : 'SOURCE_BAKED_AWAITING_PACKAGED_BASELINE',
  baselineReceiptDigest: baseline?.digest ?? null,
  stableErrorCode: baseline ? 'E_ACTIVE_GRAPH_PACKAGED_OBSERVATION_NOT_EXECUTED' : 'E_ACTIVE_GRAPH_BASELINE_RECEIPT_MISSING',
  runtimePassIssued: false,
  productionPointerMutation: false,
});
console.log(`${receipt.status} ${PATCH_ID} runtime state=${receipt.state}`);
