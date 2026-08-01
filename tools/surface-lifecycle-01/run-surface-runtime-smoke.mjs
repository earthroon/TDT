import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { ROOT, read, writeJson } from './lib.mjs';

const require = createRequire(import.meta.url);
const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const ts = require(path.join(globalRoot, 'typescript', 'lib', 'typescript.js'));
const source = read('app/src/runtime/surfaces/surface-registry-authority-service.ts');
const transpiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  fileName: 'surface-registry-authority-service.ts',
  reportDiagnostics: true,
});
if ((transpiled.diagnostics ?? []).some((d) => d.category === ts.DiagnosticCategory.Error)) {
  console.error(transpiled.diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
  process.exit(1);
}
class StableRuntimeError extends Error { constructor(code, message, detail = {}) { super(message); this.code = code; this.detail = detail; } }
class ImageBitmapMock { constructor(width, height) { this.width = width; this.height = height; this.closeCount = 0; } close() { this.closeCount += 1; } }
let participant = null;
const identity = { authorityId: 'mock', state: 'ACTIVE', runtimeEpoch: 7, deviceEpoch: 1, deviceIdentity: 'device-1' };
const gpu = {
  identitySnapshot() { return { ...identity }; },
  registerRecoveryParticipant(value) { participant = value; return () => { participant = null; }; },
};
const sandbox = {
  module: { exports: {} }, exports: {},
  require(specifier) {
    if (specifier === '../../boot/stable-error') return { StableRuntimeError };
    if (specifier === '../service-token') return { SERVICE_IDS: { surfaces: 'dadum.runtime.surface-registry', pipeline: 'dadum.runtime.pipeline' } };
    throw new Error(`unexpected require ${specifier}`);
  },
  console, Blob, ArrayBuffer, Uint8Array, Uint8ClampedArray, Uint16Array, DataView, ImageBitmap: ImageBitmapMock,
  Object, Array, Map, Set, WeakMap, Promise, Number, String, Boolean, Math, JSON,
};
sandbox.globalThis = sandbox; sandbox.exports = sandbox.module.exports;
vm.createContext(sandbox);
new vm.Script(transpiled.outputText, { filename: 'surface-registry-authority-service.cjs' }).runInContext(sandbox);
const { SurfaceRegistryAuthorityService } = sandbox.module.exports;
const service = new SurfaceRegistryAuthorityService(gpu);
await service.initialize({ epoch: 7 });

const cpuPayload = { width: 2, height: 2, storage: 'rgba8unorm', alphaMode: 'straight', data: new Uint8Array(16) };
const cpuId = service.register({ kind: 'cpu-bytes', ownerServiceId: 'owner.cpu', producerId: 'producer.cpu', allocationClass: 'final', payload: cpuPayload, storage: 'rgba8unorm', dimensions: { width: 2, height: 2 }, alphaMode: 'straight', owned: true });
const borrow = service.borrow(cpuId, 'smoke-borrow', 'consumer.borrow');
const pin = service.pin(cpuId, 'smoke-pin', 'consumer.pin');
service.invalidate(cpuId, 'superseded');
const pendingAfterInvalidate = service.snapshot(cpuId)[0];
borrow.release();
await new Promise((resolve) => setTimeout(resolve, 0));
const aliveWhilePinned = pin.value === cpuPayload && service.snapshot(cpuId)[0].physicalDisposeCount === 0;
pin.release();
await new Promise((resolve) => setTimeout(resolve, 0));
const disposedAfterLastPin = service.snapshot(cpuId)[0].physicalDisposeCount === 1 && service.snapshot(cpuId)[0].state === 'DISPOSED';
service.requestDispose(cpuId, 'duplicate');
await new Promise((resolve) => setTimeout(resolve, 0));
const stillSingleDispose = service.snapshot(cpuId)[0].physicalDisposeCount === 1;

const bitmap = new ImageBitmapMock(3, 4);
const bitmapId = service.register({ kind: 'image-bitmap', ownerServiceId: 'owner.bitmap', producerId: 'producer.bitmap', allocationClass: 'decoded', payload: bitmap, storage: 'image-bitmap', dimensions: { width: 3, height: 4 }, owned: true });
service.requestDispose(bitmapId, 'bitmap-done');
await new Promise((resolve) => setTimeout(resolve, 0));

const cpuSurvivor = { width: 1, height: 1, storage: 'rgba8unorm', alphaMode: 'opaque', data: new Uint8Array([0,0,0,255]) };
const survivorId = service.register({ kind: 'cpu-bytes', ownerServiceId: 'owner.cpu', producerId: 'producer.survivor', allocationClass: 'decoded', payload: cpuSurvivor, storage: 'rgba8unorm', dimensions: { width: 1, height: 1 }, alphaMode: 'opaque', owned: true });
let textureDestroyCount = 0;
const texture = { destroy() { textureDestroyCount += 1; } };
const gpuId = service.register({ kind: 'gpu-texture', ownerServiceId: 'owner.gpu', producerId: 'producer.gpu', allocationClass: 'intermediate', payload: texture, storage: 'gpu-texture', dimensions: { width: 4, height: 4 }, format: 'rgba8unorm', alphaMode: 'straight', deviceBinding: { runtimeEpoch: 7, deviceEpoch: 1, deviceIdentity: 'device-1' }, owned: true });
const gpuPin = service.pin(gpuId, 'gpu-smoke', 'consumer.gpu');
await participant.invalidate({ runtimeEpoch: 7, deviceEpoch: 1, deviceIdentity: 'device-1', info: { reason: 'mock' } });
let gpuPinRejected = false;
try { gpuPin.assertCurrent(); } catch (error) { gpuPinRejected = error?.code === 'E_SURFACE_PIN_REJECTED'; }
const survivorStillActive = service.snapshot(survivorId)[0].state === 'ACTIVE';
let staleBindingRejected = false;
try {
  service.register({ kind: 'gpu-texture', ownerServiceId: 'owner.gpu', producerId: 'producer.stale', allocationClass: 'intermediate', payload: { destroy() {} }, storage: 'gpu-texture', dimensions: { width: 1, height: 1 }, format: 'rgba8unorm', deviceBinding: { runtimeEpoch: 7, deviceEpoch: 0, deviceIdentity: 'old' }, owned: true });
} catch (error) { staleBindingRejected = error?.code === 'E_SURFACE_DEVICE_EPOCH_STALE'; }
let unknownFormatRejected = false;
try {
  service.register({ kind: 'gpu-texture', ownerServiceId: 'owner.gpu', producerId: 'producer.unknown', allocationClass: 'intermediate', payload: { destroy() {} }, storage: 'gpu-texture', dimensions: { width: 1, height: 1 }, format: 'mystery-format', deviceBinding: { runtimeEpoch: 7, deviceEpoch: 1, deviceIdentity: 'device-1' }, owned: true });
} catch (error) { unknownFormatRejected = error?.code === 'E_SURFACE_GPU_FORMAT_UNKNOWN'; }
const beforeShutdown = service.residencySnapshot();
await service.dispose('reset');
const afterShutdown = service.residencySnapshot();
const report = {
  schemaVersion: 1,
  actualSurfaceAuthorityClassExecuted: true,
  pendingAfterInvalidate: pendingAfterInvalidate.state,
  aliveWhilePinned,
  disposedAfterLastPin,
  stillSingleDispose,
  imageBitmapCloseCount: bitmap.closeCount,
  textureDestroyCount,
  gpuPinRejected,
  survivorStillActive,
  staleBindingRejected,
  unknownFormatRejected,
  beforeShutdown,
  afterShutdown,
};
report.pass = report.pendingAfterInvalidate === 'DISPOSE_PENDING'
  && aliveWhilePinned && disposedAfterLastPin && stillSingleDispose
  && bitmap.closeCount === 1 && textureDestroyCount === 1 && gpuPinRejected
  && survivorStillActive && staleBindingRejected && unknownFormatRejected
  && afterShutdown.currentHostBytes === 0 && afterShutdown.currentGpuBytes === 0
  && afterShutdown.activePinCount === 0 && afterShutdown.activeBorrowCount === 0;
writeJson('surface-runtime-smoke.json', report);
if (!report.pass) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log('PASS actual Surface Authority runtime smoke deferred-dispose device-loss ledger shutdown');
