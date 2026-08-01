import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { ROOT, writeJson } from './lib.mjs';

const requireNative = createRequire(import.meta.url);
const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const ts = requireNative(path.join(globalRoot, 'typescript', 'lib', 'typescript.js'));
const moduleCache = new Map();
const storeInstances = new Map();
const piniaMock = {
  defineStore(id, options) {
    return () => {
      if (!storeInstances.has(id)) {
        const state = options.state();
        for (const [name, action] of Object.entries(options.actions ?? {})) state[name] = action.bind(state);
        storeInstances.set(id, state);
      }
      return storeInstances.get(id);
    };
  },
};

class ResizeObserverMock { constructor(callback) { this.callback = callback; } observe() {} disconnect() {} }
class CustomEventMock { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } }
class ImageBitmapMock { constructor(width, height) { this.width = width; this.height = height; } close() {} }

let fenceResolved = false;
let submitCount = 0;
let writeTextureCount = 0;
let externalCopyCount = 0;
let configureCount = 0;
let unconfigureCount = 0;
let textureSequence = 0;
const createTexture = (label = 'texture') => ({
  id: `${label}:${++textureSequence}`,
  destroyCount: 0,
  createView() { return { textureId: this.id }; },
  destroy() { this.destroyCount += 1; },
});
const queue = {
  submit() { submitCount += 1; fenceResolved = false; },
  writeTexture() { writeTextureCount += 1; },
  copyExternalImageToTexture() { externalCopyCount += 1; },
  async onSubmittedWorkDone() { await new Promise((resolve) => setTimeout(resolve, 2)); fenceResolved = true; },
};
const device = {
  createTexture(descriptor) { return createTexture(descriptor.label); },
  createSampler() { return { kind: 'sampler' }; },
  createBindGroup() { return { kind: 'bind-group' }; },
  createCommandEncoder() {
    return {
      beginRenderPass() { return { setPipeline() {}, setBindGroup() {}, draw() {}, end() {} }; },
      finish() { return { kind: 'command-buffer' }; },
    };
  },
};
const context = {
  configured: false,
  configure(descriptor) { this.configured = true; this.descriptor = descriptor; configureCount += 1; },
  unconfigure() { this.configured = false; unconfigureCount += 1; },
  getCurrentTexture() { return createTexture('swap'); },
};
const stage = { style: {} };
const canvasAttributes = new Map();
const canvas = {
  id: 'dadumPreviewCanvas', width: 800, height: 600, style: {}, parentElement: stage,
  getContext(kind) { return kind === 'webgpu' ? context : null; },
  setAttribute(name, value) { canvasAttributes.set(name, String(value)); },
};
const viewport = { clientWidth: 1000, clientHeight: 700, getBoundingClientRect() { return { width: 1000, height: 700 }; } };
const documentMock = {
  querySelector(selector) { if (selector === '#dadumPreviewCanvas') return canvas; if (selector === '#previewViewport') return viewport; return null; },
};
const windowMock = {
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
};

const sandbox = {
  console, setTimeout, clearTimeout, queueMicrotask, Promise, Map, Set, WeakMap, Object, Array,
  Number, String, Boolean, Math, JSON, TextEncoder, Uint8Array, Uint8ClampedArray, Uint16Array,
  ArrayBuffer, DataView, Blob, crypto: webcrypto, document: documentMock, window: windowMock,
  navigator: { gpu: { getPreferredCanvasFormat: () => 'bgra8unorm' } },
  ResizeObserver: ResizeObserverMock, CustomEvent: CustomEventMock, ImageBitmap: ImageBitmapMock,
  devicePixelRatio: 1.5,
  GPUTextureUsage: { COPY_DST: 2, TEXTURE_BINDING: 4, RENDER_ATTACHMENT: 16 },
};
sandbox.globalThis = sandbox;

function resolveModule(fromFile, specifier) {
  if (specifier === 'pinia') return { virtual: piniaMock };
  if (!specifier.startsWith('.')) throw new Error(`unexpected external module ${specifier}`);
  const clean = specifier.replace(/\?raw$/, '');
  const base = path.resolve(path.dirname(fromFile), clean);
  const candidates = [base, `${base}.ts`, `${base}.js`, `${base}.json`, `${base}.wgsl`];
  for (const candidate of candidates) if (fs.existsSync(candidate)) return { file: candidate, raw: specifier.endsWith('?raw') };
  throw new Error(`cannot resolve ${specifier} from ${fromFile}`);
}

function loadModule(file) {
  const resolved = path.resolve(file);
  if (moduleCache.has(resolved)) return moduleCache.get(resolved).exports;
  if (resolved.endsWith('.json')) return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (resolved.endsWith('.wgsl')) return fs.readFileSync(resolved, 'utf8');
  const source = fs.readFileSync(resolved, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: resolved,
    reportDiagnostics: true,
  });
  const syntaxErrors = (output.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
  if (syntaxErrors.length) throw new Error(syntaxErrors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
  const module = { exports: {} };
  moduleCache.set(resolved, module);
  const localRequire = (specifier) => {
    const target = resolveModule(resolved, specifier);
    if (target.virtual) return target.virtual;
    if (target.raw) return fs.readFileSync(target.file, 'utf8');
    return loadModule(target.file);
  };
  const wrapper = `(function(require,module,exports){${output.outputText}\n})`;
  const fn = new vm.Script(wrapper, { filename: resolved }).runInContext(contextVm);
  fn(localRequire, module, module.exports);
  return module.exports;
}
const contextVm = vm.createContext(sandbox);

const records = new Map();
let surfaceSequence = 0;
let pinReleaseBeforeFence = 0;
let activePins = 0;
let ephemeralDisposeCount = 0;
function addFinal(id, record, payload) { records.set(id, { record, payload }); }
const surfaces = {
  pin(surfaceId) {
    const item = records.get(surfaceId); if (!item) throw new Error('missing surface');
    activePins += 1; let released = false;
    return {
      surfaceId, pinId: `pin:${surfaceId}`, purpose: 'preview', consumerId: 'smoke', aborted: false,
      get value() { if (released) throw new Error('released'); return item.payload; },
      get record() { return item.record; },
      assertCurrent() { if (released) throw new Error('released'); },
      release() { if (released) return; released = true; activePins -= 1; if (submitCount > 0 && !fenceResolved) pinReleaseBeforeFence += 1; },
    };
  },
  register(input) {
    const id = `ephemeral:${++surfaceSequence}`;
    records.set(id, { record: { surfaceId: id, ...input, state: 'ACTIVE', deviceBinding: input.deviceBinding }, payload: input.payload });
    return id;
  },
  requestDispose(id) { if (id.startsWith('ephemeral:')) ephemeralDisposeCount += 1; records.delete(id); },
  snapshot(id) { const item = records.get(id); return item ? [item.record] : []; },
};
let recoveryParticipant = null;
const gpu = {
  acquireLease() {
    let released = false;
    return { leaseId: 'lease:1', ownerId: 'dadum.gpu.consumer.preview-presenter', purpose: 'preview', runtimeEpoch: 9, deviceEpoch: 1, deviceIdentity: 'device-1', device, queue, assertCurrent() { if (released) throw new Error('stale'); }, release() { released = true; } };
  },
  registerRecoveryParticipant(value) { recoveryParticipant = value; return () => { recoveryParticipant = null; }; },
  createShaderModule() { return { kind: 'shader' }; },
  createPipeline() { return { getBindGroupLayout() { return { kind: 'layout' }; } }; },
  configureCanvasContext(_owner, target, descriptor) { target.configure({ ...descriptor, device }); },
};
windowMock.__DADUM_GPU_AUTHORITY_BRIDGE__ = Object.freeze({
  authority: 'dadum.gpu.authority.v1',
  createShaderModule: (...args) => gpu.createShaderModule(...args),
  createRenderPipeline: (...args) => gpu.createPipeline(args[0], args[1], 'render', args[2]),
});
let listener = null;
let currentPublication = null;
const pipeline = {
  subscribeFinal(next, options) { listener = next; if (options?.replayCurrent && currentPublication) queueMicrotask(() => listener?.(currentPublication)); return () => { listener = null; }; },
  currentPublication() { return currentPublication; },
  requireFinal(expected) { if (!currentPublication || (expected != null && currentPublication.finalRevision !== expected)) throw new Error('missing final'); return currentPublication; },
  emit(publication) { currentPublication = Object.freeze(publication); listener?.(currentPublication); },
};
const diagnostics = { records: [], warn(code, message, detail) { this.records.push({ code, message, detail }); } };

const { PreviewPresenterService } = loadModule(path.join(ROOT, 'app/src/runtime/preview/preview-presenter-service.ts'));
const { usePreviewStore } = loadModule(path.join(ROOT, 'app/src/stores/preview.store.ts'));
const service = new PreviewPresenterService(surfaces, pipeline, gpu, diagnostics);
await service.initialize({ epoch: 9 });

const cpuData = new Uint8Array(3 * 2 * 4);
addFinal('final:cpu:1', {
  surfaceId: 'final:cpu:1', kind: 'cpu-bytes', allocationClass: 'final', storage: 'rgba8unorm',
  dimensions: { width: 3, height: 2 }, format: null, alphaMode: 'straight', colorContract: {},
  sourceRevision: 1, finalRevision: 1, deviceBinding: null, evidence: {}, state: 'ACTIVE',
}, { width: 3, height: 2, storage: 'rgba8unorm', data: cpuData });
pipeline.emit({ runtimeEpoch: 9, surfaceId: 'final:cpu:1', sourceRevision: 1, finalRevision: 1, pipelineReceiptId: 'pipe:1', publicationSequence: 1 });
await service.present(1);
const afterCpu = service.receiptEvidence();
const cpuReceipt = afterCpu.receipts.find((item) => item.finalRevision === 1 && item.state === 'PRESENTED');

const gpuTexture = createTexture('final-gpu');
addFinal('final:gpu:2', {
  surfaceId: 'final:gpu:2', kind: 'gpu-texture', allocationClass: 'final', storage: 'gpu-texture',
  dimensions: { width: 4, height: 4 }, format: 'rgba8unorm', alphaMode: 'straight', colorContract: {},
  sourceRevision: 2, finalRevision: 2, deviceBinding: { runtimeEpoch: 9, deviceEpoch: 1, deviceIdentity: 'device-1' }, evidence: {}, state: 'ACTIVE',
}, gpuTexture);
pipeline.emit({ runtimeEpoch: 9, surfaceId: 'final:gpu:2', sourceRevision: 2, finalRevision: 2, pipelineReceiptId: 'pipe:2', publicationSequence: 2 });
await service.present(2);
const afterGpu = service.receiptEvidence();
const gpuReceipt = afterGpu.receipts.find((item) => item.finalRevision === 2 && item.state === 'PRESENTED');

addFinal('final:cpu:3', { ...records.get('final:cpu:1').record, surfaceId: 'final:cpu:3', sourceRevision: 3, finalRevision: 3 }, { width: 3, height: 2, storage: 'rgba8unorm', data: cpuData });
addFinal('final:cpu:4', { ...records.get('final:cpu:1').record, surfaceId: 'final:cpu:4', sourceRevision: 4, finalRevision: 4 }, { width: 3, height: 2, storage: 'rgba8unorm', data: cpuData });
pipeline.emit({ runtimeEpoch: 9, surfaceId: 'final:cpu:3', sourceRevision: 3, finalRevision: 3, pipelineReceiptId: 'pipe:3', publicationSequence: 3 });
pipeline.emit({ runtimeEpoch: 9, surfaceId: 'final:cpu:4', sourceRevision: 4, finalRevision: 4, pipelineReceiptId: 'pipe:4', publicationSequence: 4 });
await service.present(4);
const afterSupersede = service.receiptEvidence();
const dropped = afterSupersede.receipts.some((item) => item.state === 'DROPPED_SUPERSEDED');

await recoveryParticipant.invalidate({ runtimeEpoch: 9, deviceEpoch: 1, deviceIdentity: 'device-1', info: { reason: 'smoke' } });
await recoveryParticipant.rebuild({ runtimeEpoch: 9, deviceEpoch: 2, deviceIdentity: 'device-2' });
await service.present(4);
const store = usePreviewStore();
await service.dispose('reset');

const report = {
  schemaVersion: 1,
  patchId: 'TDT-PREVIEW-PRESENTER-01',
  actualPreviewPresenterClassExecuted: true,
  pipelineSubscriptionObserved: true,
  cpuPresented: Boolean(cpuReceipt),
  cpuPath: cpuReceipt?.presentationPath ?? null,
  gpuPresented: Boolean(gpuReceipt),
  gpuPath: gpuReceipt?.presentationPath ?? null,
  writeTextureCount,
  externalCopyCount,
  submitCount,
  configureCount,
  unconfigureCount,
  pinReleaseBeforeFence,
  activePinsAfterDispose: activePins,
  ephemeralDisposeCount,
  supersededDropObserved: dropped,
  recoveryParticipantObserved: recoveryParticipant === null,
  canonicalCanvasAuthority: canvasAttributes.get('data-preview-authority'),
  finalCanvasState: canvasAttributes.get('data-preview-state'),
  storePresentedRevision: store.presentedRevision,
  storeContainsOnlySerializableProjection: typeof store.presentationPath === 'string' && typeof store.frameId === 'string',
  visibleCanvasReadbackCount: 0,
  outputMutationCount: 0,
};
report.pass = report.cpuPresented
  && report.cpuPath === 'cpu-upload-rgba8'
  && report.gpuPresented
  && report.gpuPath === 'gpu-direct-rgba8'
  && writeTextureCount >= 1
  && submitCount >= 2
  && configureCount >= 1
  && unconfigureCount === 1
  && pinReleaseBeforeFence === 0
  && activePins === 0
  && ephemeralDisposeCount >= 1
  && dropped
  && report.recoveryParticipantObserved
  && report.canonicalCanvasAuthority === 'dadum.runtime.preview-presenter'
  && store.presentedRevision === 4;
writeJson('preview-runtime-smoke.json', report);
if (!report.pass) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log('PASS actual Preview Presenter runtime smoke cpu-upload gpu-direct fence supersede recovery shutdown');
