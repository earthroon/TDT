import fs from 'node:fs';
import path from 'node:path';
import { ROOT, AUTHORITY_FILE, read, writeJson } from './lib.mjs';
const profile = JSON.parse(read('app/src/runtime/gpu/gpu-authority-profile.json'));
const consumers = JSON.parse(read('app/src/runtime/gpu/gpu-consumer-manifest.json'));
const authority = read(AUTHORITY_FILE);
const facade = read('app/src/runtime/gpu/gpu-service.ts');
const tokens = read('app/src/runtime/service-token.ts');
const env = read('app/src/env.d.ts');
const stableErrors = read('app/src/boot/stable-error.ts');
const workerA = read('app/legacy-runtime/core/worker_porttrace.js');
const workerB = read('app/legacy-runtime/core/compute/qmap_webgpu/worker_porttrace.js');
const checks = {
  profileSchema: profile.schemaVersion === 1 && profile.authorityId === 'dadum.gpu.authority.v1' && profile.realmPolicy === 'renderer-only',
  recoveryBounded: profile.recovery?.enabled === true && profile.recovery.maxAttemptsPerRuntimeEpoch === 1 && profile.recovery.allowAdapterReselection === false,
  crossEpochReuseFalse: profile.pipelineCache?.crossEpochReuse === false && profile.pipelineCache.failedEntryPolicy === 'evict',
  consumerManifest: consumers.schemaVersion === 1 && consumers.consumers.length >= 8 && new Set(consumers.consumers.map((x)=>x.ownerId)).size === consumers.consumers.length,
  canonicalServiceId: tokens.includes("gpu: 'dadum.service.gpu-device-authority'"),
  facadeOnly: facade.includes('GpuDeviceAuthorityService as GpuService') && !facade.includes('requestAdapter('),
  bridgeTyped: env.includes('__DADUM_GPU_AUTHORITY_BRIDGE__') && env.includes("authority: 'dadum.gpu.authority.v1'"),
  stateMachine: ['UNINITIALIZED','ADAPTER_REQUESTING','DEVICE_REQUESTING','ACTIVE','LOSS_DETECTED','INVALIDATING','RECOVERING','FATAL'].every((token)=>authority.includes(`'${token}'`)),
  epochIdentity: authority.includes('runtimeEpoch') && authority.includes('deviceEpoch') && authority.includes('deviceIdentity'),
  staleLease: authority.includes('E_GPU_STALE_LEASE') && authority.includes('assertCurrent'),
  singleLostObserver: (authority.match(/\.lost\.then/g) ?? []).length === 1,
  bridgeNoRawDeviceProperty: !/window\.__DADUM_GPU_AUTHORITY_BRIDGE__\s*=\s*Object\.freeze\([\s\S]*?\bdevice\s*:/.test(authority),
  serviceNoRawDeviceGetter: !/\n\s*get device\(\)\s*:/.test(authority),
  stableErrorSurface: ['E_GPU_ADAPTER_UNAVAILABLE','E_GPU_DEVICE_REQUEST_FAILED','E_GPU_RECOVERY_EXHAUSTED','E_GPU_STALE_LEASE','E_GPU_AUTHORITY_COLLISION'].every((code)=>stableErrors.includes(code)),
  workerRetired: workerA.includes('E_GPU_WORKER_REALM_NOT_ADMITTED') && workerB.includes('E_GPU_WORKER_REALM_NOT_ADMITTED'),
  specPresent: fs.existsSync(path.join(ROOT, 'specs/TDT-GPU-DEVICE-SSOT-01_SINGLE_ADAPTER_DEVICE_AUTHORITY_DEVICE_EPOCH_DEVICE_LOSS_RECOVERY_PIPELINE_CACHE_OWNERSHIP_LEGACY_GPU_RUNTIME_RETIREMENT_SPEC.md')),
};
const failed = Object.entries(checks).filter(([,value])=>!value).map(([key])=>key);
const report = { schemaVersion: 1, checks, failed, pass: failed.length === 0 };
writeJson('gpu-authority-source.json', report);
if (!report.pass) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log(`PASS GPU Authority source checks=${Object.keys(checks).length}`);
