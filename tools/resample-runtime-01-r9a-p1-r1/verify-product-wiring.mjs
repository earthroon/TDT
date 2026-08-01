import { check, read, seal, sourceArtifact } from './lib.mjs';

const electron = read('electron.mjs');
const vite = read('vite.config.ts');
const main = read('app/src/main.ts');
const runner = read('app/src/runtime/qualification/r9a-p1-r1-qualification-runner.ts');
const service = read('app/src/runtime/qualification/r9a-p1-r1-qualification-service.ts');
const coordinator = read('app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs');
const preload = read('preload.cjs');
const checks = [
  ['new-coordinator-import', electron.includes('createQualificationRunCoordinatorR9AP1R1')],
  ['old-coordinator-import-retired', !electron.includes("createPhysicalRunCoordinatorR9AP1 from './app/electron/resample-runtime-r9a-p1/physical-run-coordinator.mjs'")],
  ['normal-renderer-entry', electron.includes("path.join(rendererRoot, 'index.html')") && electron.includes('http://127.0.0.1:${PORT}/index.html')],
  ['static-coi-server', electron.includes('server = serveStaticWithCOI(rendererRoot)')],
  ['external-sidecar-env', coordinator.includes('DADUM_BUILD_LOCK_R2_ADMISSION_PATH') && coordinator.includes('DADUM_BUILD_LOCK_R2_ADMISSION_SHA256')],
  ['package-root-exec-boundary', electron.includes('const packageRoot = path.dirname(process.execPath)')],
  ['qualification-controller-host-save', electron.includes('r11aController = r9aP1Coordinator')],
  ['qualification-save-target', electron.includes('resolveQualificationExportTarget') && electron.includes("qualification-evidence-root-v1")],
  ['parent-directory-fsync', electron.includes('parentDirectory.sync()') && electron.includes('parentDirectoryFsync: true')],
  ['normal-bootstrap-runner', main.includes('runPackagedQualificationR9AP1R1')],
  ['composition-outcome', runner.includes('outcome.composition') && service.includes('RuntimeComposition')],
  ['preview-public-entry', runner.includes('window.DadumPreviewPresenter') && runner.includes('requestPresent')],
  ['export-public-entry', runner.includes('window.DadumRuntimeExport') && runner.includes('exportFinal')],
  ['fixture-publication-service', service.includes('ResampleWorkerBrokerService') && service.includes('PipelineService') && service.includes('publishFinalCandidate')],
  ['operation-grant', service.includes("issueOperationGrant('fixture-publication'") && service.includes("completeOperation('fixture-publication'")],
  ['preload-bridge', preload.includes('r9aP1Physical') && preload.includes('dadum:r9a-p1-context')],
  ['old-vite-entry-retired', !vite.includes('r9aP1Physical') && !vite.includes('physical-r9a-p1/index.html')],
  ['old-file-entry-not-loaded', !electron.includes("loadFile(path.join(rendererRoot, 'renderer', 'physical-r9a-p1'")],
  ['direct-driver-import-zero', !runner.includes('runDeltaKStack') && !runner.includes('downscaleRGBAWithWGSL') && !runner.includes('createEwaCommandGraphR9A')],
  ['legacy-publication-zero', !runner.includes('publishLegacyFinalSurface') && !service.includes('publishLegacyFinalSurface')],
];
for (const [id, passed] of checks) check(passed, 'E_R9AP1R1_PRODUCT_WIRING', `product wiring check failed: ${id}`);
sourceArtifact('R9AP1R1_PRODUCT_WIRING_REPORT.json', seal({ schemaVersion: 1, receiptKind: 'r9a-p1-r1-product-wiring', counts: { PASS: checks.length, FAIL: 0 }, checks: checks.map(([id]) => ({ id, status: 'PASS' })) }));
console.log(`R9A-P1-R1 product wiring PASS ${checks.length}/${checks.length}`);
