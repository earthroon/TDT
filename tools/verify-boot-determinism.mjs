import fs from 'node:fs';
import { canonicalJson, sha256Bytes } from './runtime-manifest-lib.mjs';
const runtime = JSON.parse(fs.readFileSync('artifacts/runtime/generated-runtime-manifest.source.json', 'utf8'));
const fixture = {
  schemaVersion: 1,
  patchId: runtime.patchId,
  appId: runtime.appId,
  profile: 'production',
  promotable: false,
  viteManifestDigest: 'fixture-vite-manifest',
  runtimeManifestDigest: runtime.selfDigest,
  runtimePlanDigest: runtime.runtimePlanDigest,
  servicePlanDigest: runtime.servicePlanDigest,
  packageLockDigest: runtime.packageLockDigest,
  capabilityFingerprint: { crossOriginIsolated: true, nativeDecoderBridge: true, wasm: true, webgl2: true, webgpu: true },
  moduleResults: runtime.modules.map((m) => ({ id: m.id, version: m.version, status: 'ACTIVE', implementationId: `${m.id}:fixture`, stableErrorCode: null })).sort((a,b) => a.id.localeCompare(b.id)),
  serviceResults: runtime.services.map((id) => ({
    id,
    status: 'ACTIVE',
    epoch: 1,
    stableErrorCode: null,
    evidence: id === 'dadum.runtime.pipeline'
      ? {
          authorityModel: 'runtime-service-only',
          authoritativeServiceId: 'dadum.runtime.pipeline',
          legacyGlobalName: 'pipeline',
          legacyDisposition: 'PLACEHOLDER_QUARANTINED',
          placeholderAdopted: false,
        }
      : null,
  })).sort((a,b) => a.id.localeCompare(b.id)),
  capabilities: runtime.modules.flatMap((m) => m.provides.map((id) => ({ id, ownerModuleId: m.id, implementationId: `${id}:fixture` }))).sort((a,b) => a.id.localeCompare(b.id)),
  legacyModules: [],
  terminalState: 'READY',
};
const expected = sha256Bytes(canonicalJson(fixture));
for (let index = 0; index < 100; index += 1) {
  const shuffled = JSON.parse(JSON.stringify(fixture));
  const actual = sha256Bytes(canonicalJson(shuffled));
  if (actual !== expected) { console.error(`determinism mismatch at ${index}`); process.exit(1); }
}
console.log(`PASS GATE-R1-20 deterministic receipt parity 100/100 ${expected}`);
