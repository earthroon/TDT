import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { ROOT, read, writeJson } from './lib.mjs';

const require = createRequire(import.meta.url);
const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const ts = require(path.join(globalRoot, 'typescript', 'lib', 'typescript.js'));
const source = read('app/src/runtime/gpu/gpu-device-authority-service.ts');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
    resolveJsonModule: true,
  },
  fileName: 'gpu-device-authority-service.ts',
  reportDiagnostics: true,
});
if ((transpiled.diagnostics ?? []).some((d) => d.category === ts.DiagnosticCategory.Error)) {
  console.error(transpiled.diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
  process.exit(1);
}

class StableRuntimeError extends Error {
  constructor(code, message, detail = {}) { super(message); this.code = code; this.detail = detail; }
}
class CustomEventPolyfill extends Event { constructor(type, init = {}) { super(type); this.detail = init.detail; } }
const windowTarget = new EventTarget();
windowTarget.CustomEvent = CustomEventPolyfill;
const events = [];
for (const name of ['dadum:runtime-device-lost', 'dadum:gpu-authority-active', 'dadum:gpu-authority-recovered', 'dadum:gpu-authority-recovery-failed']) {
  windowTarget.addEventListener(name, (event) => events.push({ name, detail: event.detail ?? null }));
}

let adapterRequests = 0;
let deviceRequests = 0;
let currentLostResolve = null;
const devices = [];
function makeDevice(index) {
  let resolveLost;
  const lost = new Promise((resolve) => { resolveLost = resolve; });
  currentLostResolve = resolveLost;
  const device = {
    index,
    lost,
    limits: { maxStorageBufferBindingSize: 268435456 },
    queue: { onSubmittedWorkDone: async () => {}, submit() {} },
    addEventListener() {},
    destroy() {},
    createShaderModule(descriptor) { return { kind: 'shader', device: index, descriptor }; },
    createComputePipeline(descriptor) { return { kind: 'compute', device: index, descriptor }; },
    createRenderPipeline(descriptor) { return { kind: 'render', device: index, descriptor }; },
    async createComputePipelineAsync(descriptor) { return { kind: 'compute-async', device: index, descriptor }; },
    async createRenderPipelineAsync(descriptor) { return { kind: 'render-async', device: index, descriptor }; },
    createBuffer(descriptor) { return { kind: 'buffer', device: index, descriptor }; },
  };
  devices.push(device);
  return device;
}
const adapter = {
  features: new Set(),
  limits: { maxStorageBufferBindingSize: 268435456 },
  info: { vendor: 'mock', architecture: 'mock', device: 'mock', description: 'mock adapter' },
  async requestDevice() { deviceRequests += 1; return makeDevice(deviceRequests); },
};
const navigatorMock = {
  gpu: {
    async requestAdapter() { adapterRequests += 1; return adapter; },
    getPreferredCanvasFormat() { return 'bgra8unorm'; },
  },
};

const sandbox = {
  module: { exports: {} },
  exports: {},
  require(specifier) {
    if (specifier === '../../boot/stable-error') return { StableRuntimeError };
    if (specifier === '../service-token') return { SERVICE_IDS: { gpu: 'dadum.service.gpu-device-authority' } };
    if (specifier === './gpu-authority-profile.json') return require(path.join(ROOT, 'app/src/runtime/gpu/gpu-authority-profile.json'));
    if (specifier === './gpu-consumer-manifest.json') return require(path.join(ROOT, 'app/src/runtime/gpu/gpu-consumer-manifest.json'));
    throw new Error(`unexpected require ${specifier}`);
  },
  console,
  window: windowTarget,
  navigator: navigatorMock,
  crypto: crypto.webcrypto,
  TextEncoder,
  Uint8Array,
  BigInt,
  Object,
  Array,
  Map,
  Set,
  WeakMap,
  Promise,
  Proxy,
  Reflect,
  JSON,
  Number,
  String,
  CustomEvent: CustomEventPolyfill,
  Event,
  setTimeout,
  clearTimeout,
};
sandbox.globalThis = sandbox;
sandbox.exports = sandbox.module.exports;
vm.createContext(sandbox);
new vm.Script(transpiled.outputText, { filename: 'gpu-device-authority-service.cjs' }).runInContext(sandbox);
const { GpuDeviceAuthorityService } = sandbox.module.exports;
if (typeof GpuDeviceAuthorityService !== 'function') throw new Error('authority export missing');

const service = new GpuDeviceAuthorityService();
await service.initialize({ epoch: 11 });
const bridge = windowTarget.__DADUM_GPU_AUTHORITY_BRIDGE__;
const initial = bridge.getCurrentIdentity();
const lease = await bridge.acquireLease('dadum.gpu.consumer.qmap-runtime', 'runtime-smoke');
lease.assertCurrent();
const shaderA = bridge.createShaderModule('dadum.gpu.consumer.qmap-runtime', 'smoke-shader', { code: '@compute @workgroup_size(1) fn main() {}' });
const shaderB = bridge.createShaderModule('dadum.gpu.consumer.qmap-runtime', 'smoke-shader', { code: '@compute @workgroup_size(1) fn main() {}' });
const pipelineA = bridge.createComputePipeline('dadum.gpu.consumer.qmap-runtime', 'smoke-pipeline', { layout: 'auto', compute: { module: shaderA, entryPoint: 'main' } });
const pipelineB = bridge.createComputePipeline('dadum.gpu.consumer.qmap-runtime', 'smoke-pipeline', { layout: 'auto', compute: { module: shaderA, entryPoint: 'main' } });
currentLostResolve({ reason: 'unknown', message: 'controlled mock loss' });
const deadline = Date.now() + 2500;
while (Date.now() < deadline) {
  const identity = bridge.getCurrentIdentity();
  if (identity.state === 'ACTIVE' && identity.deviceEpoch === 2) break;
  await new Promise((resolve) => setTimeout(resolve, 10));
}
const recovered = bridge.getCurrentIdentity();
let staleRejected = false;
try { lease.assertCurrent(); } catch (error) { staleRejected = error?.code === 'E_GPU_STALE_LEASE'; }
const lease2 = await bridge.acquireLease('dadum.gpu.consumer.qmap-runtime', 'runtime-smoke-recovered');
const shaderC = bridge.createShaderModule('dadum.gpu.consumer.qmap-runtime', 'smoke-shader', { code: '@compute @workgroup_size(1) fn main() {}' });
const pipelineC = bridge.createComputePipeline('dadum.gpu.consumer.qmap-runtime', 'smoke-pipeline', { layout: 'auto', compute: { module: shaderC, entryPoint: 'main' } });
lease2.assertCurrent();
lease2.release();
const evidence = service.receiptEvidence();
await service.dispose('reset');
const report = {
  schemaVersion: 1,
  actualAuthorityClassExecuted: true,
  runtimeEpoch: initial.runtimeEpoch,
  initialDeviceEpoch: initial.deviceEpoch,
  recoveredDeviceEpoch: recovered.deviceEpoch,
  adapterRequests,
  deviceRequests,
  bridgeFrozen: Object.isFrozen(bridge),
  sameEpochShaderDedup: shaderA === shaderB,
  sameEpochPipelineDedup: pipelineA === pipelineB,
  crossEpochShaderReuse: shaderA === shaderC,
  crossEpochPipelineReuse: pipelineA === pipelineC,
  staleRejected,
  recoveryEventObserved: events.some((event) => event.name === 'dadum:gpu-authority-recovered'),
  lossEventObserved: events.some((event) => event.name === 'dadum:runtime-device-lost'),
  bridgeRemovedOnDispose: !windowTarget.__DADUM_GPU_AUTHORITY_BRIDGE__,
  evidence,
};
report.pass = report.runtimeEpoch === 11
  && report.initialDeviceEpoch === 1
  && report.recoveredDeviceEpoch === 2
  && report.adapterRequests === 1
  && report.deviceRequests === 2
  && report.bridgeFrozen
  && report.sameEpochShaderDedup
  && report.sameEpochPipelineDedup
  && !report.crossEpochShaderReuse
  && !report.crossEpochPipelineReuse
  && report.staleRejected
  && report.recoveryEventObserved
  && report.lossEventObserved
  && report.bridgeRemovedOnDispose;
writeJson('gpu-authority-runtime-smoke.json', report);
if (!report.pass) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log('PASS actual GPU Authority class runtime smoke epoch=1->2 adapterRequests=1 deviceRequests=2');
