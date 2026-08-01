import fs from 'node:fs';
import path from 'node:path';
import { PATCH_ID, canonicalJson, findPackagedBaselineReceipt, nodeIdFor, projectRoot, readJson, sha256Bytes, sha256File, sourceRecord, stableSortRecords, writeJson, writeCanonicalReceipt } from './lib.mjs';

const legacy = readJson('app/src/legacy/generated-legacy-manifest.json');
const admission = readJson('app/src/legacy/generated-legacy-static-admission.json');
const workers = readJson('app/src/runtime/workers/generated-worker-manifest.json');
const assets = readJson('app/src/runtime/assets/generated-runtime-asset-manifest.json');
const randomness = readJson('artifacts/active-graph-01/source-bake/randomness-audit.json');
const baseline = findPackagedBaselineReceipt();

const authorityFiles = [
  'package.json', 'package-lock.json', 'vite.config.ts', 'electron.mjs', 'preload.cjs',
  'app/src/boot/runtime-modules.ts', 'app/src/boot/stable-error.ts', 'app/src/runtime/service-token.ts', 'app/src/env.d.ts', 'app/src/legacy/legacy-runtime-adapter.ts',
  'app/src/runtime/active-graph/active-graph-service.ts', 'app/src/runtime/assets/runtime-asset-authority.ts',
  'app/src/runtime/side-effects/side-effect-registry.ts', 'app/src/runtime/sequence/deterministic-sequence-service.ts',
  'app/src/runtime/gpu/gpu-device-authority-service.ts', 'app/src/runtime/gpu/gpu-device-qualification-observer.ts',
  'app/src/runtime/workers/encoder-worker-broker-service.ts', 'app/src/runtime/resample/resample-worker-broker-service.ts', 'app/src/runtime/resample/canonical-resample-executor-r8a.ts', 'app/src/runtime/resample/resample-compatibility-types.ts', 'app/legacy-runtime/main.js',
  'app/src/runtime/surfaces/surface-types.ts', 'app/src/runtime/surfaces/surface-registry-authority-service.ts',
  'app/src/runtime/pipeline/pipeline-service.ts', 'app/src/runtime/pipeline/legacy-final-surface-bridge-service.ts',
  'app/src/runtime/admission/installed-admission-service.ts', 'app/src/runtime/preview/preview-presenter-service.ts', 'app/src/runtime/export/export-authority-service.ts', 'app/src/runtime/host-bridge-service.ts',
  'app/src/runtime/decode/decoder-registry-service.ts',
  'tools/runtime-manifest-lib.mjs',
  ...fs.readdirSync(path.join(projectRoot, 'tools/active-graph-01')).filter((name) => name.endsWith('.mjs')).sort().map((name) => `tools/active-graph-01/${name}`),
  ...fs.readdirSync(path.join(projectRoot, 'tools/surface-lifecycle-01')).filter((name) => name.endsWith('.mjs')).sort().map((name) => `tools/surface-lifecycle-01/${name}`),
  ...fs.readdirSync(path.join(projectRoot, 'app/legacy-runtime/active-graph')).sort().map((name) => `app/legacy-runtime/active-graph/${name}`),
].map(sourceRecord);
const sourceAuthority = { schemaVersion: 1, patchId: PATCH_ID, files: stableSortRecords(authorityFiles, ['sourceRelative']), digest: null };
sourceAuthority.digest = sha256Bytes(canonicalJson({ ...sourceAuthority, digest: null }));
writeJson('artifacts/active-graph-01/source-bake/source-authority.json', sourceAuthority);


function javascriptSemantic(sourceRelative, kind, loadingEdge = null) {
  const ext = path.extname(sourceRelative).toLowerCase();
  if (!['.js', '.mjs', '.cjs'].includes(ext)) return null;
  const absolute = path.join(projectRoot, sourceRelative);
  const source = fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '';
  const hasStaticModuleSyntax = /(^|[;\n])\s*(?:import\s+(?!\()|export\s+)/m.test(source);
  if (kind === 'module-worker') return 'module-worker';
  if (kind === 'classic-worker') return hasStaticModuleSyntax ? 'module-worker' : 'classic-worker';
  if (loadingEdge === 'new-url' || loadingEdge === 'worker-constructor' || loadingEdge === 'child-worker-spawn') {
    return hasStaticModuleSyntax || ext === '.mjs' ? 'module-worker' : 'classic-worker';
  }
  if (ext === '.mjs') return 'esm-module';
  if (ext === '.cjs') return 'classic-script';
  if (hasStaticModuleSyntax || kind === 'esm-module' || loadingEdge === 'static-import' || loadingEdge === 'dynamic-import' || loadingEdge === 'runtime-asset') return 'esm-module';
  if (kind === 'classic-script') return 'classic-script';
  return loadingEdge === 'manifest-script-load' || loadingEdge === 'manifest-reference' ? 'classic-script' : 'esm-module';
}

function graphNode(record) {
  const semantic = javascriptSemantic(record.sourceRelative, record.kind, record.loadingEdge ?? null);
  return semantic ? { ...record, javascriptSemantic: semantic } : record;
}

const rootPathToId = new Map(legacy.entries.map((entry) => [`app/legacy-runtime/${entry.path}`, entry.id]));
const roots = [
  { rootId: 'dadum.renderer.entry', rootKind: 'renderer-entry', nodeId: 'dadum.renderer.entry', required: true },
  ...legacy.entries.map((entry) => ({ rootId: entry.id, rootKind: 'legacy-root-script', nodeId: entry.id, required: Boolean(entry.required) })),
  ...workers.workers.map((worker) => ({ rootId: worker.workerId, rootKind: 'worker-entry', nodeId: worker.workerId, required: true })),
];
const nodes = new Map();
const addNode = (record) => { const normalized = graphNode(record); if (!nodes.has(normalized.nodeId)) nodes.set(normalized.nodeId, normalized); };
addNode({ nodeId: 'dadum.renderer.entry', kind: 'esm-module', loadingEdge: 'renderer-entry', status: 'ACTIVE_REQUIRED', sourceRelative: 'app/src/main.ts', sourceSha256: sha256File('app/src/main.ts'), ownerRootId: 'dadum.renderer.entry' });
for (const [nodeId, sourceRelative, ownerRootId] of [
  ['dadum.renderer.runtime-modules', 'app/src/boot/runtime-modules.ts', 'dadum.renderer.entry'],
  ['dadum.runtime.gpu-authority-r9a-p1', 'app/src/runtime/gpu/gpu-device-authority-service.ts', 'dadum.renderer.runtime-modules'],
  ['dadum.runtime.gpu-qualification-observer-r9a-p1', 'app/src/runtime/gpu/gpu-device-qualification-observer.ts', 'dadum.runtime.gpu-authority-r9a-p1'],
  ['dadum.runtime.resample-worker-broker-r8a', 'app/src/runtime/resample/resample-worker-broker-service.ts', 'dadum.renderer.runtime-modules'],
  ['dadum.runtime.canonical-resample-executor-r8a', 'app/src/runtime/resample/canonical-resample-executor-r8a.ts', 'dadum.runtime.resample-worker-broker-r8a'],
  ['dadum.runtime.resample-compatibility-types-r8a', 'app/src/runtime/resample/resample-compatibility-types.ts', 'dadum.runtime.canonical-resample-executor-r8a'],
  ['dadum.runtime.installed-admission-r11a', 'app/src/runtime/admission/installed-admission-service.ts', 'dadum.renderer.runtime-modules'],
  ['dadum.runtime.atomic-update-r12a', 'app/src/runtime/update/runtime-update-service.ts', 'dadum.renderer.runtime-modules'],
  ['dadum.runtime.fleet-rollout-r13a', 'app/src/runtime/fleet/fleet-rollout-service.ts', 'dadum.renderer.runtime-modules'],
  ['dadum.runtime.release-distribution-r14a', 'app/src/runtime/distribution/release-distribution-service.ts', 'dadum.renderer.runtime-modules'],
  ['dadum.runtime.preview-presenter-r11a', 'app/src/runtime/preview/preview-presenter-service.ts', 'dadum.renderer.runtime-modules'],
  ['dadum.runtime.export-authority-r11a', 'app/src/runtime/export/export-authority-service.ts', 'dadum.renderer.runtime-modules'],
  ['dadum.runtime.host-bridge-r11a', 'app/src/runtime/host-bridge-service.ts', 'dadum.runtime.export-authority-r11a'],
]) addNode({ nodeId, kind: 'typescript-module', loadingEdge: 'static-import', status: 'ACTIVE_REQUIRED', sourceRelative, sourceSha256: sha256File(sourceRelative), ownerRootId });
for (const entry of legacy.entries) {
  const sourceRelative = `app/legacy-runtime/${entry.path}`;
  addNode({ nodeId: entry.id, kind: entry.kind === 'module' ? 'esm-module' : 'classic-script', loadingEdge: 'manifest-script-load', status: entry.required ? 'ACTIVE_REQUIRED' : 'ACTIVE_OPTIONAL', sourceRelative, sourceSha256: sha256File(sourceRelative), ownerRootId: entry.id });
}
for (const record of admission.records) {
  const nodeId = rootPathToId.get(record.sourceRelative) ?? nodeIdFor(record.sourceRelative);
  addNode({ nodeId, kind: record.sourceRelative.match(/\.(vert|frag|glsl)$/) ? 'shader-glsl' : record.sourceRelative.endsWith('.wasm') ? 'wasm-module' : record.sourceRelative.endsWith('.mjs') ? 'esm-module' : record.sourceRelative.endsWith('.json') ? 'json-config' : record.sourceRelative.endsWith('.css') ? 'stylesheet' : (record.edgeKind === 'static-import' || record.edgeKind === 'dynamic-import' || record.edgeKind === 'runtime-asset') ? 'esm-module' : 'classic-script', loadingEdge: record.edgeKind, status: 'ACTIVE_REQUIRED', sourceRelative: record.sourceRelative, sourceSha256: record.sourceSha256, ownerRootId: record.owner ?? null });
}
for (const helper of [
  ['dadum.legacy.main.js#icms-auto-binding', 'app/legacy-runtime/active-graph/icms-auto-binding.js'],
  ['dadum.legacy.main.js#entry-authority', 'app/legacy-runtime/active-graph/legacy-main-entry.js'],
  ['dadum.legacy.main.js#filter-worker-bridge', 'app/legacy-runtime/active-graph/legacy-filter-worker-bridge.js'],
  ['dadum.legacy.main.js#delta-k-controls', 'app/legacy-runtime/active-graph/legacy-delta-k-controls.js'],
  ['dadum.legacy.main.js#batch-queue', 'app/legacy-runtime/active-graph/legacy-batch-queue.js'],
  ['dadum.legacy.main.js#ash-qmap-binding', 'app/legacy-runtime/active-graph/legacy-ash-qmap-binding.js'],
  ['dadum.legacy.main.js#spot-psd-binding', 'app/legacy-runtime/active-graph/legacy-spot-psd-binding.js'],
]) addNode({ nodeId: helper[0], kind: 'esm-module', loadingEdge: 'static-import', status: 'ACTIVE_REQUIRED', sourceRelative: helper[1], sourceSha256: sha256File(helper[1]), ownerRootId: 'dadum.legacy.main.js' });
for (const worker of workers.workers) {
  addNode({ nodeId: worker.workerId, kind: worker.workerType === 'module' ? 'module-worker' : 'classic-worker', loadingEdge: 'worker-constructor', status: 'ACTIVE_REQUIRED', sourceRelative: worker.entryRelative, sourceSha256: sha256File(worker.entryRelative), ownerRootId: worker.workerId });
  for (const artifact of worker.artifacts ?? []) {
    if (!fs.existsSync(path.join(projectRoot, artifact.url))) continue;
    const nodeId = nodeIdFor(artifact.url);
    const kind = artifact.role === 'pthread-child-bootstrap' ? 'module-worker' : artifact.url.endsWith('.wasm') ? 'wasm-module' : artifact.url.match(/\.(vert|frag|glsl)$/) ? 'shader-glsl' : 'esm-module';
    addNode({ nodeId, kind, loadingEdge: artifact.role === 'pthread-child-bootstrap' ? 'child-worker-spawn' : artifact.role === 'wasm' ? 'wasm-load' : 'static-import', status: 'ACTIVE_REQUIRED', sourceRelative: artifact.url, sourceSha256: artifact.sha256, ownerRootId: worker.workerId });
  }
}
for (const asset of assets.assets) addNode({ nodeId: nodeIdFor(asset.sourceRelative), kind: asset.assetKind, loadingEdge: 'runtime-asset-manifest', status: asset.requiredState === 'required' ? 'ACTIVE_REQUIRED' : 'ACTIVE_OPTIONAL', sourceRelative: asset.sourceRelative, sourceSha256: asset.sourceSha256, ownerRootId: asset.ownerNodeId });

const edges = [
  { fromNodeId: 'dadum.renderer.entry', edgeKind: 'static-import', toNodeId: 'dadum.renderer.runtime-modules' },
  { fromNodeId: 'dadum.renderer.runtime-modules', edgeKind: 'static-import', toNodeId: 'dadum.runtime.gpu-authority-r9a-p1' },
  { fromNodeId: 'dadum.runtime.gpu-authority-r9a-p1', edgeKind: 'static-import', toNodeId: 'dadum.runtime.gpu-qualification-observer-r9a-p1' },
  { fromNodeId: 'dadum.renderer.runtime-modules', edgeKind: 'static-import', toNodeId: 'dadum.runtime.resample-worker-broker-r8a' },
  { fromNodeId: 'dadum.runtime.resample-worker-broker-r8a', edgeKind: 'static-import', toNodeId: 'dadum.runtime.canonical-resample-executor-r8a' },
  { fromNodeId: 'dadum.runtime.canonical-resample-executor-r8a', edgeKind: 'static-import', toNodeId: 'dadum.runtime.resample-compatibility-types-r8a' },
  { fromNodeId: 'dadum.renderer.runtime-modules', edgeKind: 'static-import', toNodeId: 'dadum.runtime.installed-admission-r11a' },
  { fromNodeId: 'dadum.renderer.runtime-modules', edgeKind: 'static-import', toNodeId: 'dadum.runtime.atomic-update-r12a' },
  { fromNodeId: 'dadum.runtime.atomic-update-r12a', edgeKind: 'service-dependency', toNodeId: 'dadum.runtime.installed-admission-r11a' },
  { fromNodeId: 'dadum.renderer.runtime-modules', edgeKind: 'static-import', toNodeId: 'dadum.runtime.fleet-rollout-r13a' },
  { fromNodeId: 'dadum.runtime.fleet-rollout-r13a', edgeKind: 'service-dependency', toNodeId: 'dadum.runtime.atomic-update-r12a' },
  { fromNodeId: 'dadum.renderer.runtime-modules', edgeKind: 'static-import', toNodeId: 'dadum.runtime.release-distribution-r14a' },
  { fromNodeId: 'dadum.runtime.atomic-update-r12a', edgeKind: 'service-dependency', toNodeId: 'dadum.runtime.release-distribution-r14a' },
  { fromNodeId: 'dadum.runtime.fleet-rollout-r13a', edgeKind: 'service-dependency', toNodeId: 'dadum.runtime.release-distribution-r14a' },
  { fromNodeId: 'dadum.renderer.runtime-modules', edgeKind: 'static-import', toNodeId: 'dadum.runtime.preview-presenter-r11a' },
  { fromNodeId: 'dadum.renderer.runtime-modules', edgeKind: 'static-import', toNodeId: 'dadum.runtime.export-authority-r11a' },
  { fromNodeId: 'dadum.runtime.preview-presenter-r11a', edgeKind: 'service-dependency', toNodeId: 'dadum.runtime.installed-admission-r11a' },
  { fromNodeId: 'dadum.runtime.preview-presenter-r11a', edgeKind: 'service-dependency', toNodeId: 'dadum.runtime.atomic-update-r12a' },
  { fromNodeId: 'dadum.runtime.export-authority-r11a', edgeKind: 'service-dependency', toNodeId: 'dadum.runtime.installed-admission-r11a' },
  { fromNodeId: 'dadum.runtime.export-authority-r11a', edgeKind: 'service-dependency', toNodeId: 'dadum.runtime.atomic-update-r12a' },
  { fromNodeId: 'dadum.runtime.export-authority-r11a', edgeKind: 'static-import', toNodeId: 'dadum.runtime.host-bridge-r11a' },
];
for (const entry of legacy.entries) edges.push({ fromNodeId: 'dadum.renderer.entry', edgeKind: 'manifest-script-load', toNodeId: entry.id });
for (const record of admission.records) {
  if (!record.parent) continue;
  const fromNodeId = rootPathToId.get(record.parent) ?? nodeIdFor(record.parent);
  const toNodeId = rootPathToId.get(record.sourceRelative) ?? nodeIdFor(record.sourceRelative);
  if (nodes.has(fromNodeId) && nodes.has(toNodeId)) edges.push({ fromNodeId, edgeKind: record.edgeKind === 'static-import' ? 'static-import' : record.edgeKind === 'dynamic-import' ? 'dynamic-import' : record.edgeKind === 'runtime-fetch' ? 'fetch-asset' : record.edgeKind === 'runtime-asset' ? 'runtime-asset-reference' : 'manifest-script-load', toNodeId });
}
for (const helper of [...nodes.values()].filter((n) => n.ownerRootId === 'dadum.legacy.main.js' && n.sourceRelative.includes('/active-graph/'))) edges.push({ fromNodeId: 'dadum.legacy.main.js', edgeKind: 'static-import', toNodeId: helper.nodeId });
for (const worker of workers.workers) {
  for (const artifact of worker.artifacts ?? []) {
    const toNodeId = nodeIdFor(artifact.url);
    if (nodes.has(toNodeId)) edges.push({ fromNodeId: worker.workerId, edgeKind: artifact.role === 'pthread-child-bootstrap' ? 'child-worker-spawn' : artifact.role === 'wasm' ? 'wasm-load' : 'static-import', toNodeId });
  }
}
for (const asset of assets.assets) edges.push({ fromNodeId: asset.ownerNodeId, edgeKind: 'shader-load', toNodeId: nodeIdFor(asset.sourceRelative) });

const sideEffects = stableSortRecords([
  { sideEffectId: 'dadum.runtime.side-effects#EventTarget#addEventListener#legacy-compatibility-capture', ownerNodeId: 'dadum.renderer.entry', sideEffectKind: 'service-registration', targetIdentity: 'EventTarget.prototype', eventType: 'addEventListener', callbackIdentity: 'legacy-owner-propagating-interceptor', activationPhase: 'active-graph-module', cardinality: 'exactly-one', disposerIdentity: 'dadum.runtime.side-effects.dispose' },
  { sideEffectId: 'dadum.legacy.spot-psd-binding#document#DOMContentLoaded#bind-canonical', ownerNodeId: 'dadum.legacy.main.js#spot-psd-binding', sideEffectKind: 'dom-event-listener', targetIdentity: 'document', eventType: 'DOMContentLoaded', callbackIdentity: 'bindSpotPsdCanonical', activationPhase: 'legacy-script-evaluation', cardinality: 'exactly-one', disposerIdentity: 'dadum.runtime.side-effects.dispose' },
  { sideEffectId: 'dadum.legacy.spot-psd-binding#exportSpotPsdBtn#click#export-spot-psd', ownerNodeId: 'dadum.legacy.main.js#spot-psd-binding', sideEffectKind: 'dom-event-listener', targetIdentity: '#exportSpotPsdBtn', eventType: 'click', callbackIdentity: 'exportSpotPsdCanonical', activationPhase: 'dom-ready', cardinality: 'exactly-one', disposerIdentity: 'dadum.runtime.side-effects.dispose' },
  { sideEffectId: 'dadum.legacy.delta-k-controls#deltaKSlider#input#uniform', ownerNodeId: 'dadum.legacy.main.js#delta-k-controls', sideEffectKind: 'dom-event-listener', targetIdentity: '#deltaKSlider', eventType: 'input', callbackIdentity: 'update-delta-k-uniform', activationPhase: 'legacy-script-evaluation', cardinality: 'zero-or-one', disposerIdentity: 'dadum.runtime.side-effects.dispose' },
  { sideEffectId: 'dadum.legacy.delta-k-controls#falloffSlider#input#uniform', ownerNodeId: 'dadum.legacy.main.js#delta-k-controls', sideEffectKind: 'dom-event-listener', targetIdentity: '#falloffSlider', eventType: 'input', callbackIdentity: 'update-falloff-uniform', activationPhase: 'legacy-script-evaluation', cardinality: 'zero-or-one', disposerIdentity: 'dadum.runtime.side-effects.dispose' },
  { sideEffectId: 'dadum.legacy.delta-k-controls#deBoostSlider#input#uniform', ownerNodeId: 'dadum.legacy.main.js#delta-k-controls', sideEffectKind: 'dom-event-listener', targetIdentity: '#deBoostSlider', eventType: 'input', callbackIdentity: 'update-de-boost-uniform', activationPhase: 'legacy-script-evaluation', cardinality: 'zero-or-one', disposerIdentity: 'dadum.runtime.side-effects.dispose' },
  { sideEffectId: 'dadum.legacy.delta-k-controls#preblurSlider#input#uniform', ownerNodeId: 'dadum.legacy.main.js#delta-k-controls', sideEffectKind: 'dom-event-listener', targetIdentity: '#preblurSlider', eventType: 'input', callbackIdentity: 'update-preblur-uniform', activationPhase: 'legacy-script-evaluation', cardinality: 'zero-or-one', disposerIdentity: 'dadum.runtime.side-effects.dispose' },
], ['ownerNodeId', 'sideEffectKind', 'sideEffectId']);
const archiveDir = 'archive/legacy-quarantine/TDT-ACTIVE-GRAPH-01';
const archiveFiles = fs.readdirSync(path.join(projectRoot, archiveDir)).filter((name) => /^main\.[0-9a-f]{64}\.js$/.test(name));
if (archiveFiles.length !== 1) throw new Error(`E_ACTIVE_GRAPH_ARCHIVE_CARDINALITY:${archiveFiles.length}`);
const archiveRelative = `${archiveDir}/${archiveFiles[0]}`;
const archiveReceipt = readJson(archiveRelative.replace(/\.js$/, '.receipt.json'));
const quarantine = [{ sourceRelative: 'app/legacy-runtime/main.js', archiveRelative, sourceSha256: archiveReceipt.sourceSha256, byteLength: archiveReceipt.sourceByteLength }];
const unsigned = {
  schemaVersion: 1,
  patchId: PATCH_ID,
  baselineReceiptDigest: baseline?.digest ?? null,
  sourceAuthorityDigest: sourceAuthority.digest,
  roots: stableSortRecords(roots, ['rootId']),
  nodes: stableSortRecords([...nodes.values()], ['nodeId']),
  edges: stableSortRecords([...new Map(edges.map((edge) => [`${edge.fromNodeId}\0${edge.edgeKind}\0${edge.toNodeId}`, edge])).values()], ['fromNodeId', 'edgeKind', 'toNodeId']),
  sideEffects,
  quarantine,
  randomnessAuditDigest: randomness.auditDigest,
  dynamicAssetManifestDigest: assets.manifestDigest,
  graphDigest: null,
};
const manifest = { ...unsigned, graphDigest: sha256Bytes(canonicalJson(unsigned)) };
writeJson('app/src/runtime/active-graph/generated-active-runtime-graph.json', manifest);
fs.writeFileSync(path.join(projectRoot, 'app/src/runtime/active-graph/generated-active-runtime-graph.ts'), `// Generated by tools/active-graph-01/generate-active-graph.mjs. Do not edit.\nimport manifest from './generated-active-runtime-graph.json';\nexport default manifest;\n`);
writeJson('artifacts/active-graph-01/source-bake/root-manifest.json', { schemaVersion: 1, patchId: PATCH_ID, roots: manifest.roots, digest: sha256Bytes(canonicalJson(manifest.roots)) });
writeJson('artifacts/active-graph-01/source-bake/node-manifest.json', { schemaVersion: 1, patchId: PATCH_ID, nodes: manifest.nodes, digest: sha256Bytes(canonicalJson(manifest.nodes)) });
writeJson('artifacts/active-graph-01/source-bake/edge-manifest.json', { schemaVersion: 1, patchId: PATCH_ID, edges: manifest.edges, digest: sha256Bytes(canonicalJson(manifest.edges)) });
writeJson('artifacts/active-graph-01/source-bake/side-effect-manifest.json', { schemaVersion: 1, patchId: PATCH_ID, sideEffects: manifest.sideEffects, digest: sha256Bytes(canonicalJson(manifest.sideEffects)) });
writeJson('artifacts/active-graph-01/source-bake/quarantine-manifest.json', { schemaVersion: 1, patchId: PATCH_ID, quarantine: manifest.quarantine, packageAdmission: false, routeAdmission: false, digest: sha256Bytes(canonicalJson(manifest.quarantine)) });
writeCanonicalReceipt('artifacts/active-graph-01/source-bake/graph-generation-receipt.json', { schemaVersion: 1, patchId: PATCH_ID, graphRelative: 'app/src/runtime/active-graph/generated-active-runtime-graph.json', graphDigest: manifest.graphDigest, rootCount: manifest.roots.length, nodeCount: manifest.nodes.length, edgeCount: manifest.edges.length, sideEffectCount: manifest.sideEffects.length, quarantineCount: manifest.quarantine.length, baselineReceiptDigest: manifest.baselineReceiptDigest });
console.log(`ACTIVE_GRAPH graph roots=${manifest.roots.length} nodes=${manifest.nodes.length} edges=${manifest.edges.length} digest=${manifest.graphDigest}`);
