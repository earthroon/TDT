import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SERVICE_FILE, SPEC_FILE, TYPES_FILE, read, writeJson } from './lib.mjs';
const service = read(SERVICE_FILE);
const types = read(TYPES_FILE);
const boot = read('app/src/boot/runtime-modules.ts');
const pipeline = read('app/src/runtime/pipeline/pipeline-service.ts');
const bridge = read('app/src/runtime/pipeline/legacy-final-surface-bridge-service.ts');
const preview = read('app/src/runtime/preview/preview-presenter-service.ts');
const exportSource = read('app/src/runtime/export/export-authority-service.ts');
const decoder = read('app/src/runtime/decode/decoder-registry-service.ts');
const errors = read('app/src/boot/stable-error.ts');
const pkg = JSON.parse(read('package.json'));
const spec = read(SPEC_FILE);
const checks = {
  specIdentity: spec.includes('TDT-SURFACE-LIFECYCLE-01') && spec.includes('Compatibility Mirror Retirement Seal'),
  serviceRegistered: boot.includes('new SurfaceRegistryAuthorityService(gpu)') && boot.includes('SERVICE_IDS.surfaces'),
  bootOrder: boot.includes("id: 'dadum.module.surface-lifecycle-v1'") && boot.includes("dependsOn: ['dadum.module.resources-v1', 'dadum.module.gpu-authority-v1']"),
  capabilities: boot.includes('dadum.surface.registry') && boot.includes('dadum.surface.lifecycle') && boot.includes('dadum.surface.residency'),
  typedSchema: types.includes("'DISPOSE_PENDING'") && types.includes('SurfaceResidencySnapshot') && types.includes('SurfaceDeviceBinding'),
  deterministicId: service.includes('surf:${this.#runtimeEpoch}:${epochPart}:${String(sequence).padStart(8'),
  typedDisposers: service.includes("input.kind === 'gpu-texture'") && service.includes("input.kind === 'gpu-buffer'") && service.includes("input.kind === 'image-bitmap'"),
  cpuValidation: service.includes('E_SURFACE_CPU_LENGTH_MISMATCH'),
  gpuEpochValidation: service.includes('E_SURFACE_DEVICE_EPOCH_STALE') && service.includes('identitySnapshot()'),
  borrowLifecycle: service.includes('borrow<TPayload') && service.includes('record.borrowCount += 1'),
  pinLifecycle: service.includes('pin<TPayload') && service.includes('record.pinCount += 1'),
  deferredDisposal: service.includes('record.borrowCount > 0 || record.pinCount > 0') && service.includes('#disposeIfEligible'),
  deviceLossParticipant: service.includes('registerRecoveryParticipant') && service.includes('invalidateDeviceEpoch'),
  opaqueFinalZero: !pipeline.includes("resources.register('final-surface'") && pipeline.includes('surfaces.bindFinal'),
  opaqueDecodedZero: !decoder.includes("resources.register('decoded-surface'") && decoder.includes('surfaces.registerDecodedValue'),
  finalPreRegistration: bridge.includes('const surfaceId = this.surfaces.register') && bridge.includes('publishFinalCandidate(surfaceId'),
  noMandatoryCpuCopy: bridge.includes('zeroMandatoryCopy: true') && !bridge.includes('new Uint8Array(value.data)'),
  previousFinalInvalidation: pipeline.includes("surfaces.invalidate(previous.surfaceId, 'final-revision-superseded')"),
  exportPinFinally: exportSource.includes("pin<unknown>(binding.surfaceId, 'export-encode', exportJobId)") && /finally\s*\{\s*surfacePin\.release\(\)/s.test(exportSource),
  previewPinFinally: preview.includes("pin<unknown>(binding.surfaceId, 'preview-present', this.id)") && /finally\s*\{[\s\S]{0,240}(?:if\s*\(pin\)\s*pin\.release\(\)|pin\?\.release\(\)|pin\.release\(\))/s.test(preview),
  facadeFrozen: bridge.includes('const compatibilityFacade = Object.freeze') && bridge.includes('mutablePayloadExposed: false'),
  rgbaMirrorAssignmentZero: !/__DADUM_FILTERED_RGBA8__\s*=/.test(bridge),
  stableErrors: ['E_SURFACE_PIN_REJECTED','E_SURFACE_DISPOSER_MISSING','E_SURFACE_SHUTDOWN_LEAK','E_SURFACE_LEDGER_NEGATIVE'].every((code) => errors.includes(code)),
  packageScript: typeof pkg.scripts?.['verify:surface-lifecycle-01'] === 'string',
  productionPointerAbsent: !fs.existsSync(path.join(ROOT, 'artifacts/promotion/PRODUCTION_POINTER.json')),
};
const failed = Object.entries(checks).filter(([,value]) => !value).map(([name]) => name);
writeJson('surface-source-contract.json', { schemaVersion: 1, checks, failed, pass: failed.length === 0 });
if (failed.length) { console.error('surface source contract failed', failed); process.exit(1); }
console.log(`PASS surface source contract checks=${Object.keys(checks).length}`);
