import fs from 'node:fs';
import { read, check, sourceArtifact, seal } from './lib.mjs';
const modules = read('app/src/boot/runtime-modules.ts');
const bootstrap = read('app/src/boot/bootstrap-renderer.ts');
const admission = read('app/src/runtime/admission/installed-admission-service.ts');
const preview = read('app/src/runtime/preview/preview-presenter-service.ts');
const exportAuthority = read('app/src/runtime/export/export-authority-service.ts');
const host = read('app/src/runtime/host-bridge-service.ts');

const activeGraph = JSON.parse(fs.readFileSync('app/src/runtime/active-graph/generated-active-runtime-graph.json', 'utf8'));

const runtimeManifest = JSON.parse(fs.readFileSync('artifacts/runtime/generated-runtime-manifest.source.json', 'utf8'));
const runtimeAdmissionModule = runtimeManifest.modules.find((module) => module.id === 'dadum.module.installed-admission-r11a');
check(Boolean(runtimeAdmissionModule), 'E_R11A_RUNTIME_MANIFEST_MODULE_MISSING', 'runtime manifest does not include installed admission module');
check(runtimeAdmissionModule.required === true && runtimeAdmissionModule.provides?.includes('dadum.installed-admission.r11a'), 'E_R11A_RUNTIME_MANIFEST_MODULE_MISSING', 'runtime manifest installed admission descriptor mismatch');
for (const moduleId of ['dadum.module.preview-v1', 'dadum.module.export-v1']) {
  const descriptor = runtimeManifest.modules.find((module) => module.id === moduleId);
  check(descriptor?.dependsOn?.includes('dadum.module.installed-admission-r11a'), 'E_R11A_RUNTIME_MANIFEST_DEPENDENCY_MISSING', `${moduleId} does not depend on installed admission in runtime manifest`);
}
check(runtimeManifest.services.includes('dadum.runtime.installed-admission-r11a'), 'E_R11A_RUNTIME_MANIFEST_SERVICE_MISSING', 'installed admission service missing from runtime manifest');
const nodeIds = new Set(activeGraph.nodes.map((node) => node.nodeId));
const edgeKeys = new Set(activeGraph.edges.map((edge) => `${edge.fromNodeId}|${edge.edgeKind}|${edge.toNodeId}`));
for (const nodeId of [
  'dadum.runtime.installed-admission-r11a',
  'dadum.runtime.preview-presenter-r11a',
  'dadum.runtime.export-authority-r11a',
  'dadum.runtime.host-bridge-r11a',
]) check(nodeIds.has(nodeId), 'E_R11A_ACTIVE_GRAPH_NODE_MISSING', `Active Graph node missing: ${nodeId}`);
for (const edgeKey of [
  'dadum.renderer.runtime-modules|static-import|dadum.runtime.installed-admission-r11a',
  'dadum.runtime.preview-presenter-r11a|service-dependency|dadum.runtime.installed-admission-r11a',
  'dadum.runtime.export-authority-r11a|service-dependency|dadum.runtime.installed-admission-r11a',
  'dadum.runtime.export-authority-r11a|static-import|dadum.runtime.host-bridge-r11a',
]) check(edgeKeys.has(edgeKey), 'E_R11A_ACTIVE_GRAPH_EDGE_MISSING', `Active Graph edge missing: ${edgeKey}`);
for (const token of ['dadum.module.installed-admission-r11a', 'SERVICE_IDS.installedAdmission', 'new InstalledAdmissionService', "'dadum.module.installed-admission-r11a'"]) check(modules.includes(token), 'E_R11A_RENDERER_WIRING_MISSING', `runtime module wiring missing: ${token}`);
check(bootstrap.includes('await installedAdmission.rendererReady()'), 'E_R11A_BOOTSTRAP_NOT_COMPLETE', 'renderer-ready acknowledgement missing after boot receipt');
for (const token of ['bootstrapContext()', 'completeStartup(', "issueOperationGrant(operation", 'completeOperation(', 'reportDeviceLoss(', 'installedStrict === true']) check(admission.includes(token), 'E_R11A_RENDERER_WIRING_MISSING', `installed admission service missing: ${token}`);
for (const token of ["issueOperationGrant('preview'", "completeOperation('preview'", 'this.admission.assertActive()']) check(preview.includes(token), 'E_R11A_PREVIEW_ADMISSION_REQUIRED', `Preview admission wiring missing: ${token}`);
for (const token of ["issueOperationGrant('export'", 'admissionGrant,', 'admissionBinding,', "completeOperation('export'"]) check(exportAuthority.includes(token), 'E_R11A_EXPORT_ADMISSION_REQUIRED', `Export admission wiring missing: ${token}`);
check(host.includes('admissionGrant: OperationGrant') && host.includes('admissionBinding: Record<string, unknown>'), 'E_R11A_HOST_SAVE_ADMISSION_REQUIRED', 'Host bridge does not carry Export admission evidence');
sourceArtifact('R11A_RENDERER_WIRING_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A', pass: true, installedAdmissionModuleRequired: true, rendererReadyAfterBootReceipt: true, previewOperationGrantEnforced: true, exportOperationGrantEnforced: true, hostSaveGrantPropagated: true, deviceLossSessionRevocationWired: true, installedStrictPhysicalCanaryRemainsFailClosed: true, activeGraphDigest: activeGraph.graphDigest, activeGraphAdmissionNodeCount: 4, activeGraphAdmissionEdgeCount: 4, runtimeManifestBuildId: runtimeManifest.buildId, runtimeManifestAdmissionModulePresent: true, runtimeManifestLockConsistent: runtimeManifest.lockConsistency?.consistent === true }));
console.log('R11A renderer wiring PASS');
