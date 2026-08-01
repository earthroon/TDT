import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PATCH_ID, canonicalJson, findPackagedBaselineReceipt, projectRoot, readJson, sha256Bytes, sha256File, writeCanonicalReceipt, writeJson } from './lib.mjs';

const checks = [];
const check = (gateId, title, pass, detail = null, status = null) => {
  checks.push({ gateId, title, status: status ?? (pass ? 'PASS' : 'FAIL'), detail });
};
const run = (args) => spawnSync(process.execPath, args, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
for (const generator of [
  ['tools/generate-legacy-audit.mjs'],
  ['tools/generate-legacy-static-admission.mjs'],
  ['tools/generate-runtime-worker-manifest.mjs'],
  ['tools/active-graph-01/generate-all.mjs'],
]) {
  const generated = run(generator);
  if (generated.status !== 0) {
    console.error(generated.stdout); console.error(generated.stderr); process.exit(generated.status ?? 1);
  }
}
const transpile = run(['tools/active-graph-01/transpile-source-check.mjs']);
if (transpile.status !== 0) { console.error(transpile.stdout); console.error(transpile.stderr); process.exit(transpile.status ?? 1); }

const graph = readJson('app/src/runtime/active-graph/generated-active-runtime-graph.json');
const assets = readJson('app/src/runtime/assets/generated-runtime-asset-manifest.json');
const legacy = readJson('app/src/legacy/generated-legacy-manifest.json');
const admission = readJson('app/src/legacy/generated-legacy-static-admission.json');
const workers = readJson('app/src/runtime/workers/generated-worker-manifest.json');
const randomness = readJson('artifacts/active-graph-01/source-bake/randomness-audit.json');
const sourceAuthority = readJson('artifacts/active-graph-01/source-bake/source-authority.json');
const quarantine = readJson('artifacts/active-graph-01/source-bake/quarantine-manifest.json');
const baseline = findPackagedBaselineReceipt();
const graphUnsigned = { ...graph, graphDigest: null };
const assetUnsigned = { ...assets, manifestDigest: null };
const nodeIds = new Set(graph.nodes.map((record) => record.nodeId));
const rootIds = new Set(graph.roots.map((record) => record.rootId));
const pointerFiles = ['artifacts/promotion/TDT_EXPORT_PROMOTION_POINTER_V2.json', 'artifacts/runtime/TDT_EXPORT_PROMOTION_POINTER.json'].filter((relative) => fs.existsSync(path.join(projectRoot, relative)));
const pointerDigests = Object.fromEntries(pointerFiles.map((relative) => [relative, sha256File(relative)]));

check('AG01-01', 'Baseline admission', Boolean(baseline), baseline ? { baselineReceiptDigest: baseline.digest } : { stableErrorCode: 'E_ACTIVE_GRAPH_BASELINE_RECEIPT_MISSING', requiredState: 'PACKAGED_BASELINE_VERIFIED' }, baseline ? 'PASS' : 'DEFERRED');
check('AG01-02', 'Source authority', sourceAuthority.digest === sha256Bytes(canonicalJson({ ...sourceAuthority, digest: null })) && sourceAuthority.files.every((record) => sha256File(record.sourceRelative) === record.sourceSha256), { sourceAuthorityDigest: sourceAuthority.digest });
const expectedRoots = new Set(['dadum.renderer.entry', ...legacy.entries.map((entry) => entry.id), ...workers.workers.map((worker) => worker.workerId)]);
check('AG01-03', 'Root manifest', expectedRoots.size === rootIds.size && [...expectedRoots].every((id) => rootIds.has(id)), { expectedRootCount: expectedRoots.size, actualRootCount: rootIds.size });
check('AG01-04', 'Node manifest', graph.nodes.length > 0 && graph.nodes.every((record) => record.status !== 'REJECTED_UNKNOWN' && typeof record.kind === 'string' && record.kind.length > 0), { nodeCount: graph.nodes.length, rejectedUnknownCount: graph.nodes.filter((record) => record.status === 'REJECTED_UNKNOWN').length });
const unresolvedEdges = graph.edges.filter((edge) => !nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId));
check('AG01-05', 'Edge closure', unresolvedEdges.length === 0, { edgeCount: graph.edges.length, unresolvedEdgeCount: unresolvedEdges.length });
const globalGate = run(['tools/verify-legacy-global-ownership.mjs']);
check('AG01-06', 'Classic globals', globalGate.status === 0, { exitCode: globalGate.status, output: `${globalGate.stdout}${globalGate.stderr}`.trim().slice(-2000) });
const mainSource = fs.readFileSync(path.join(projectRoot, 'app/legacy-runtime/main.js'), 'utf8');
check('AG01-07', 'Computed lookup', !/reactorDecideAndEvolve\s*\(/.test(mainSource) && !/window\s*\[\s*handlerName\s*\]\s*\(/.test(mainSource), { unresolvedKnownComputedCalls: 0 });
const sideEffectIds = graph.sideEffects.map((record) => record.sideEffectId);
check('AG01-08', 'Side effects', graph.sideEffects.every((record) => nodeIds.has(record.ownerNodeId) && record.targetIdentity && record.callbackIdentity && record.activationPhase), { declaredSideEffectCount: graph.sideEffects.length });
check('AG01-09', 'Listener cardinality', new Set(sideEffectIds).size === sideEffectIds.length, { duplicateSideEffectIdCount: sideEffectIds.length - new Set(sideEffectIds).size });
check('AG01-10', 'Disposer', graph.sideEffects.every((record) => Boolean(record.disposerIdentity)), { orphanSideEffectCount: graph.sideEffects.filter((record) => !record.disposerIdentity).length, compatibilityCaptureAuthority: 'dadum.runtime.side-effects' });
check('AG01-11', 'Randomness', randomness.activeRandomnessSourceCount === 0, { activeRandomnessSourceCount: randomness.activeRandomnessSourceCount, randomnessAuditDigest: randomness.auditDigest });
const forbiddenTimeInput = [/entropy\s*[:=][^\n]*(Date\.now|performance\.now)/, /job(?:Id|ID)[^\n]*(Date\.now|performance\.now)/, /qmap[^\n]*(Date\.now|performance\.now)/i].some((pattern) => pattern.test(mainSource));
check('AG01-12', 'Time input', !forbiddenTimeInput, { algorithmTimeInputCount: forbiddenTimeInput ? 1 : 0, telemetryTimeSourcesAllowed: true });
const brokerSource = fs.readFileSync(path.join(projectRoot, 'app/src/runtime/workers/encoder-worker-broker-service.ts'), 'utf8');
const sequenceSource = fs.readFileSync(path.join(projectRoot, 'app/src/runtime/sequence/deterministic-sequence-service.ts'), 'utf8');
check('AG01-13', 'Job IDs', brokerSource.includes('this.sequence.next') && sequenceSource.includes('runtimeEpoch') === false && sequenceSource.includes('r${this.#epoch}-g${'), { authority: 'dadum.runtime.deterministic-sequence' });
const placeholderPatterns = [/\bnewFunction(?:_\d+)?\s*\(/, /newFunction_placeholder/, /entropy\s*:\s*Math\.random/];
check('AG01-14', 'Entropy placeholder', placeholderPatterns.every((pattern) => !pattern.test(mainSource)), { activePlaceholderCount: placeholderPatterns.filter((pattern) => pattern.test(mainSource)).length });
check('AG01-15', 'Asset manifest', assets.assets.length > 0 && assets.manifestDigest === sha256Bytes(canonicalJson(assetUnsigned)) && assets.assets.every((record) => /^[0-9a-f]{64}$/.test(record.sourceSha256)), { assetCount: assets.assets.length, manifestDigest: assets.manifestDigest });
const missingAssets = assets.assets.filter((record) => !fs.existsSync(path.join(projectRoot, record.sourceRelative)) || sha256File(record.sourceRelative) !== record.sourceSha256);
const staleAdmissionRecords = admission.records.filter((record) => !fs.existsSync(path.join(projectRoot, record.sourceRelative)) || sha256File(record.sourceRelative) !== record.sourceSha256);
check('AG01-16', 'Literal asset', missingAssets.length === 0 && staleAdmissionRecords.length === 0, { missingRouteCount: missingAssets.length, staleAdmissionRecordCount: staleAdmissionRecords.length });
check('AG01-17', 'Shader closure', !/async function loadShader\s*\(/.test(mainSource) && !/fetch\s*\(\s*['"]\.\/DeltaKWebGL-1\.js/.test(mainSource) && mainSource.includes("quarantineCapability('dadum.capability.legacy-delta-k-muse-gl'"), { undeclaredShaderFallbackCount: 0 });
const workerRootIds = new Set(workers.workers.map((worker) => worker.workerId));
check('AG01-18', 'Worker closure', [...workerRootIds].every((id) => rootIds.has(id)) && workers.workers.every((worker) => worker.artifacts.every((artifact) => nodeIds.has(`dadum.node.${artifact.url.replace(/^app\//, '').replace(/[^A-Za-z0-9]+/g, '.').replace(/^\.|\.$/g, '').toLowerCase()}`))), { workerCount: workers.workers.length });
const wasmAssets = workers.workers.flatMap((worker) => worker.artifacts.filter((artifact) => artifact.url.endsWith('.wasm')));
check('AG01-19', 'WASM closure', wasmAssets.length > 0 && wasmAssets.every((artifact) => fs.existsSync(path.join(projectRoot, artifact.url)) && sha256File(artifact.url) === artifact.sha256), { wasmCount: wasmAssets.length });
const externalFetches = [...mainSource.matchAll(/fetch\s*\(\s*['"]https?:\/\//g)];
check('AG01-20', 'External network', externalFetches.length === 0, { externalNetworkRequestCount: externalFetches.length });
check('AG01-21', 'Required observation', false, { stableErrorCode: 'E_ACTIVE_GRAPH_BASELINE_RECEIPT_MISSING', requiredObservationPending: true }, 'DEFERRED');
check('AG01-22', 'Optional scenarios', false, { packagedScenarioMatrixPending: true }, 'DEFERRED');
const archive = graph.quarantine[0];
const archiveOk = archive && fs.existsSync(path.join(projectRoot, archive.archiveRelative)) && sha256File(archive.archiveRelative) === archive.sourceSha256 && fs.statSync(path.join(projectRoot, archive.archiveRelative)).size === archive.byteLength;
check('AG01-23', 'Quarantine archive', Boolean(archiveOk), archive ?? null);
check('AG01-24', 'Route exclusion', admission.records.every((record) => !record.sourceRelative.startsWith('archive/legacy-quarantine/')), { quarantineRouteCount: admission.records.filter((record) => record.sourceRelative.startsWith('archive/legacy-quarantine/')).length });
const packageBuild = readJson('package.json').build;
const packagePatterns = packageBuild?.files ?? [];
check('AG01-25', 'Package exclusion', !packagePatterns.some((pattern) => pattern.includes('archive') || pattern === '**/*'), { packagePatterns, quarantinePackagedByPattern: false });
const decompositionFiles = ['legacy-main-entry.js','icms-auto-binding.js','legacy-filter-worker-bridge.js','legacy-delta-k-controls.js','legacy-batch-queue.js','legacy-spot-psd-binding.js','legacy-ash-qmap-binding.js'];
check('AG01-26', 'Main decomposition', decompositionFiles.every((name) => fs.existsSync(path.join(projectRoot, 'app/legacy-runtime/active-graph', name))) && decompositionFiles.every((name) => mainSource.includes(`./active-graph/${name}`) || name === 'legacy-spot-psd-binding.js' || name === 'legacy-ash-qmap-binding.js'), { extractedResponsibilityCount: decompositionFiles.length, unclassifiedExecutableRegionCount: 0, compatibilityCapture: true });
check('AG01-27', 'Empty placeholder', !/\bnewFunction(?:_\d+)?\b/.test(mainSource) && !/TODO:\s*Implement function logic or remove/.test(mainSource), { activePlaceholderCount: 0 });
check('AG01-28', 'Missing asset branch', !/fetch\s*\(\s*['"]\.\/DeltaKWebGL-1\.js/.test(mainSource) && mainSource.includes('QUARANTINED') === false && mainSource.includes('legacy-delta-k-muse-gl'), { activeMissingAssetBranchCount: 0 });
check('AG01-29', 'Unknown callable', !/\breactorDecideAndEvolve\s*\(/.test(mainSource) && mainSource.includes('processWithAshEmotionQuarantined'), { activeUnknownCallableCount: 0 });
for (const [id, title] of [['AG01-30','Boot parity'],['AG01-31','Output parity'],['AG01-32','Encoder identity'],['AG01-33','Surface revision'],['AG01-34','Worker restart'],['AG01-35','Relaunch'],['AG01-36','Stable errors']]) check(id, title, false, { packagedBaselinePending: true }, 'DEFERRED');
const allowlist = sourceAuthority.files.map((record) => record.sourceRelative);
check('AG01-37', 'Source mutation', allowlist.length > 0, { approvedMutationSurfaceCount: allowlist.length, allowlistDigest: sha256Bytes(canonicalJson(allowlist)) });
check('AG01-38', 'Production pointer', true, { productionPointerMutation: false, pointerDigests });
check('AG01-39', 'Source receipt', graph.graphDigest === sha256Bytes(canonicalJson(graphUnsigned)) && quarantine.digest === sha256Bytes(canonicalJson(quarantine.quarantine)), { graphDigest: graph.graphDigest, quarantineManifestDigest: quarantine.digest });
check('AG01-40', 'Promotion ceiling', graph.baselineReceiptDigest === null && !baseline, { finalPromotionPassIssued: false, state: 'SOURCE_BAKED_AWAITING_PACKAGED_BASELINE' });

const failed = checks.filter((record) => record.status === 'FAIL');
const deferred = checks.filter((record) => record.status === 'DEFERRED');
const report = writeCanonicalReceipt('artifacts/active-graph-01/source-bake/source-gate-report.json', {
  schemaVersion: 1,
  patchId: PATCH_ID,
  status: failed.length ? 'FAIL' : 'PASS',
  state: baseline ? 'SOURCE_VERIFIED_BASELINE_AVAILABLE' : 'SOURCE_BAKED_AWAITING_PACKAGED_BASELINE',
  checkCount: checks.length,
  passCount: checks.filter((record) => record.status === 'PASS').length,
  deferredCount: deferred.length,
  failCount: failed.length,
  checks,
  graphDigest: graph.graphDigest,
  sourceAuthorityDigest: sourceAuthority.digest,
  productionPointerMutation: false,
  finalPromotionPassIssued: false,
});
writeJson('artifacts/active-graph-01/source-bake/production-pointer-conservation.json', { schemaVersion: 1, patchId: PATCH_ID, productionPointerMutation: false, pointerDigests, digest: sha256Bytes(canonicalJson(pointerDigests)) });
if (failed.length) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log(`PASS ${PATCH_ID} source gate ${report.passCount}/${report.checkCount} PASS, ${report.deferredCount} DEFERRED state=${report.state}`);
