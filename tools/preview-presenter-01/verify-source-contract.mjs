import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SPEC_FILE, SERVICE_FILE, PIPELINE_FILE, read, writeJson } from './lib.mjs';

const spec = read(SPEC_FILE);
const service = read(SERVICE_FILE);
const pipeline = read(PIPELINE_FILE);
const scheduler = read('app/src/runtime/preview/preview-frame-scheduler.ts');
const layout = read('app/src/runtime/preview/preview-layout-authority.ts');
const ledger = read('app/src/runtime/preview/preview-frame-receipt-ledger.ts');
const types = read('app/src/runtime/preview/preview-presenter-types.ts');
const shell = read('app/src/legacy/legacy-shell.html');
const style = read('app/legacy-runtime/style.css');
const boot = read('app/src/boot/runtime-modules.ts');
const tokens = read('app/src/runtime/service-token.ts');
const gpuManifest = JSON.parse(read('app/src/runtime/gpu/gpu-consumer-manifest.json'));
const gpu = read('app/src/runtime/gpu/gpu-device-authority-service.ts');
const store = read('app/src/stores/preview.store.ts');
const errors = read('app/src/boot/stable-error.ts');
const shims = [
  read('app/legacy-runtime/js/passes/present_webgpu.js'),
  read('app/legacy-runtime/input/webgpu_preview_presenter.js'),
  read('app/legacy-runtime/preview_fit_bind.js'),
  read('app/legacy-runtime/hooks/afterRenderHook.js'),
].join('\n');
const pkg = JSON.parse(read('package.json'));
const requiredErrors = [
  'E_PREVIEW_CANVAS_MISSING','E_PREVIEW_CANVAS_CONTEXT_FAILED','E_PREVIEW_PIPELINE_SUBSCRIPTION_FAILED',
  'E_PREVIEW_FINAL_BINDING_STALE','E_PREVIEW_SURFACE_PIN_FAILED','E_PREVIEW_SURFACE_KIND_UNSUPPORTED',
  'E_PREVIEW_STORAGE_UNSUPPORTED','E_PREVIEW_RGBA16_ENCODING_AMBIGUOUS','E_PREVIEW_DEVICE_BINDING_STALE',
  'E_PREVIEW_SUBMIT_FAILED','E_PREVIEW_FENCE_FAILED','E_PREVIEW_LEGACY_PRESENTER_RETIRED',
  'E_PREVIEW_DEVICE_LOST','E_PREVIEW_RECOVERY_FAILED','E_PREVIEW_SHUTDOWN_LEAK',
];
const checks = {
  specIdentity: spec.includes('TDT-PREVIEW-PRESENTER-01') && spec.includes('Legacy Canvas Presentation Retirement Seal'),
  newFilesPresent: [
    'app/src/runtime/preview/preview-presenter-types.ts',
    'app/src/runtime/preview/preview-frame-scheduler.ts',
    'app/src/runtime/preview/preview-layout-authority.ts',
    'app/src/runtime/preview/preview-frame-receipt-ledger.ts',
    'app/src/runtime/preview/preview-presentation-profile.json',
    'app/src/runtime/preview/shaders/preview-present.wgsl',
    'app/src/runtime/preview/preview-consumer-profile.json',
  ].every((relative) => fs.existsSync(path.join(ROOT, relative))),
  typedPublication: pipeline.includes('export interface FinalSurfacePublication') && pipeline.includes('publicationSequence'),
  subscriptionApi: pipeline.includes('subscribeFinal(listener: FinalSurfaceListener') && pipeline.includes('{ replayCurrent: true }') === false,
  subscriptionDisposer: pipeline.includes('this.#listeners.delete(listenerId)'),
  publicationAfterCommit: pipeline.indexOf('this.#binding = next') < pipeline.indexOf('this.#emitPublication(publication)'),
  listenerFailureIsolated: pipeline.includes('W_PREVIEW_PIPELINE_LISTENER_FAILED') && pipeline.includes('#invokeListener'),
  runtimeSubscription: service.includes('this.pipeline.subscribeFinal') && service.includes('{ replayCurrent: true }'),
  deterministicFrameId: scheduler.includes('preview-frame:${this.runtimeEpoch}:${this.#presenterGeneration}:${sequence}'),
  schedulerLatestWins: scheduler.includes('DROPPED_SUPERSEDED') && scheduler.includes('isSuperseded'),
  surfacePin: service.includes("pin<unknown>(binding.surfaceId, 'preview-present', this.id)") && /finally\s*\{[\s\S]{0,240}(?:if\s*\(pin\)\s*pin\.release\(\)|pin\?\.release\(\)|pin\.release\(\))/s.test(service),
  fenceBoundRelease: service.includes('onSubmittedWorkDone') && service.indexOf('onSubmittedWorkDone') < service.search(/finally\s*\{[\s\S]{0,240}(?:if\s*\(pin\)\s*pin\.release\(\)|pin\?\.release\(\)|pin\.release\(\))/s),
  gpuDirectPath: service.includes("record.kind === 'gpu-texture'") && service.includes('gpu-direct-rgba16float') && !service.includes('copyTextureToBuffer'),
  cpuUploadPath: service.includes('queue.writeTexture') && service.includes('rowPaddingBytes'),
  imageBitmapPath: service.includes('copyExternalImageToTexture'),
  ephemeralRegistry: service.includes("allocationClass: 'preview'") && service.includes('ephemeralSurfaceId'),
  pipelineCacheAuthority: service.includes('__DADUM_GPU_AUTHORITY_BRIDGE__') && service.includes('createShaderModule') && service.includes('createRenderPipeline'),
  gpuConsumerAdmitted: gpuManifest.consumers.some((item) => item.ownerId === 'dadum.gpu.consumer.preview-presenter'),
  canvasConfigureAuthority: gpu.includes('configureCanvasContext(ownerId: string') && service.includes('this.gpu.configureCanvasContext'),
  canonicalCanvas: shell.includes('id="dadumPreviewCanvas"') && shell.includes('data-preview-role="canonical-visible-canvas"'),
  legacyCanvasNotVisible: shell.includes('data-preview-role="legacy-processing-canvas"') && style.includes('opacity: 0'),
  noOverlayStateInShims: !shims.includes('canvasWGPUOverlay') && !shims.includes('__DK_WGPU_PRESENT_STATE__'),
  noLegacyCaptureInShims: !shims.includes('.toBlob(') && !shims.includes('.getImageData(') && !shims.includes('.toDataURL('),
  layoutSeparation: layout.includes('canvas.style.width') && layout.includes('canvas.width !== backingWidth') && !layout.includes('publishFinalCandidate'),
  receiptLedger: ledger.includes('digestSha256') && ledger.includes('retention'),
  serializableStore: store.includes('presentationPath') && !/GPUTexture|ImageBitmap|Uint8Array|Promise</.test(store),
  serviceIds: tokens.includes('previewLayout') && tokens.includes('previewReceiptLedger'),
  capabilities: boot.includes('dadum.preview.presenter') && boot.includes('dadum.preview.layout') && boot.includes('dadum.preview.receipt-ledger'),
  gpuDirectCapabilityNotClaimed: !boot.includes("capabilities.publish({ id: 'dadum.preview.gpu-direct'"),
  stableErrors: requiredErrors.every((code) => errors.includes(code)),
  packageScripts: ['verify:preview-presenter-01:source','verify:preview-presenter-01:runtime','gate:preview-presenter-01','finalize:preview-presenter-01:source-bake'].every((name) => typeof pkg.scripts?.[name] === 'string'),
  productionPointerAbsent: !fs.existsSync(path.join(ROOT, 'artifacts/promotion/PRODUCTION_POINTER.json')),
  typeContracts: types.includes('PreviewFrameReceipt') && types.includes('PreviewPresentationPath'),
};
const failed = Object.entries(checks).filter(([, value]) => !value).map(([name]) => name);
writeJson('preview-source-contract.json', { schemaVersion: 1, patchId: 'TDT-PREVIEW-PRESENTER-01', checks, failed, pass: failed.length === 0 });
if (failed.length) { console.error('preview source contract failed', failed); process.exit(1); }
console.log(`PASS preview source contract checks=${Object.keys(checks).length}`);
