import { PATCH_ID, readJson, writeCanonicalReceipt } from './lib.mjs';
const gate = readJson('artifacts/active-graph-01/source-bake/source-gate-report.json');
const graph = readJson('app/src/runtime/active-graph/generated-active-runtime-graph.json');
const assets = readJson('app/src/runtime/assets/generated-runtime-asset-manifest.json');
const randomness = readJson('artifacts/active-graph-01/source-bake/randomness-audit.json');
const sideEffects = readJson('artifacts/active-graph-01/source-bake/side-effect-manifest.json');
const quarantine = readJson('artifacts/active-graph-01/source-bake/quarantine-manifest.json');
const regression = readJson('artifacts/active-graph-01/source-bake/regression-suite-receipt.json');
if (gate.status !== 'PASS' || gate.failCount !== 0) throw new Error('E_ACTIVE_GRAPH_SOURCE_GATE_FAILED');
if (regression.status !== 'PASS') throw new Error('E_ACTIVE_GRAPH_REGRESSION_FAILED');
const deferredGateIds = gate.checks.filter((record) => record.status === 'DEFERRED').map((record) => record.gateId);
const receipt = writeCanonicalReceipt('artifacts/active-graph-01/source-bake/TDT_ACTIVE_GRAPH_01_SOURCE_RECEIPT.json', {
  schemaVersion: 1,
  patchId: PATCH_ID,
  state: 'SOURCE_BAKED_AWAITING_PACKAGED_BASELINE',
  baselineReceiptDigest: null,
  sourceAuthorityDigest: graph.sourceAuthorityDigest,
  activeGraphDigest: graph.graphDigest,
  dynamicAssetManifestDigest: assets.manifestDigest,
  sideEffectManifestDigest: sideEffects.digest,
  quarantineManifestDigest: quarantine.digest,
  randomnessAuditDigest: randomness.auditDigest,
  sourceGateReceiptDigest: gate.receiptDigest,
  regressionSuiteReceiptDigest: regression.receiptDigest,
  sourceGatePassCount: gate.passCount,
  sourceGateDeferredCount: gate.deferredCount,
  deferredGateIds,
  activeRootCount: graph.roots.length,
  activeNodeCount: graph.nodes.length,
  activeEdgeCount: graph.edges.length,
  declaredSideEffectCount: graph.sideEffects.length,
  activeRandomnessSourceCount: 0,
  unresolvedDynamicAssetCount: 0,
  duplicateSideEffectCount: 0,
  unclassifiedExecutableRegionCount: 0,
  quarantinedExecutableByteCount: graph.quarantine.reduce((sum, record) => sum + record.byteLength, 0),
  externalNetworkRequestCount: 0,
  productionPointerMutation: false,
  packagedRuntimePassIssued: false,
  behavioralParityPassIssued: false,
  finalPromotionPassIssued: false,
});
console.log(`PASS ${PATCH_ID} source bake receipt ${receipt.receiptDigest} state=${receipt.state}`);
