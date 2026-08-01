import crypto from 'node:crypto';

export const hex = (seed) => crypto.createHash('sha256').update(String(seed)).digest('hex');
export const identity = (deviceEpoch, deviceIdentity = `device-${deviceEpoch}`, runtimeEpoch = 1) => Object.freeze({
  authorityId: 'dadum.gpu.authority.v1',
  state: 'ACTIVE',
  runtimeEpoch,
  deviceEpoch,
  deviceIdentity,
  adapterIdentity: 'adapter-canonical',
  profileId: 'test-profile',
  manifestDigest: hex('manifest'),
  activeLeaseCount: 0,
  recoveryAttempts: 0,
  admittedFeatures: Object.freeze([]),
});

export function fakePipelineSet(current, stats = { rootDisposeCount: 0, tensorDisposeCount: 0, adaptiveDisposeCount: 0, effectDisposeCount: 0 }) {
  const tensor = {
    runtimeEpoch: current.runtimeEpoch,
    deviceEpoch: current.deviceEpoch,
    deviceIdentity: current.deviceIdentity,
    abiId: 'tdt.structure-tensor.r1c.abi.v1',
    fieldSchemaId: 'tdt.structure-tensor.r1c.field.v1',
    axialFieldSchemaId: 'tdt.structure-tensor.r1c.axial-field.v1',
    pipelineIdentity: `tensor:${current.deviceIdentity}`,
    axialPipelineIdentity: `tensor-axial:${current.deviceIdentity}`,
    shaderDigests: { axial: hex(`tensor-axial:${current.deviceIdentity}`), structure: hex(`tensor:${current.deviceIdentity}`) },
    disposed: false,
    dispose() { if (this.disposed) return; this.disposed = true; stats.tensorDisposeCount += 1; },
  };
  const adaptive = {
    schemaVersion: 2,
    runtimeEpoch: current.runtimeEpoch,
    deviceEpoch: current.deviceEpoch,
    deviceIdentity: current.deviceIdentity,
    abiId: 'tdt.adaptive-policy.r1d.abi.v1',
    fieldSchemaId: 'tdt.adaptive-policy.r1d.field.v1',
    pipelineIdentity: `adaptive:${current.deviceIdentity}`,
    shaderDigest: hex(`adaptive:${current.deviceIdentity}`),
    neutralQmapIdentity: `neutral-qmap:${current.deviceIdentity}`,
    disposed: false,
    dispose() { if (this.disposed) return; this.disposed = true; stats.adaptiveDisposeCount += 1; },
  };
  const effect = {
    schemaId: 'tdt.pipeline.bakemono-rinne.command-graph-family.wgsl04.v1',
    ownerId: 'dadum.gpu.consumer.bakemono-rinne-wgsl-04',
    pipelineFamilyId: 'tdt.pipeline.bakemono-rinne.command-graph-family.wgsl04.v1',
    runtimeEpoch: current.runtimeEpoch,
    deviceEpoch: current.deviceEpoch,
    deviceIdentity: current.deviceIdentity,
    kernelId: 'tdt.effect.bakemono-rinne.kernel.wgsl.r1c-gated-shadow.v1',
    kernelAbiId: 'tdt.effect.bakemono-rinne.abi.r1c-gated-shadow.v1',
    generatedWgslDigest: hex(`bkr04-wgsl:${current.deviceIdentity}`),
    generatorManifestDigest: hex(`bkr04-manifest:${current.deviceIdentity}`),
    bindGroupLayoutDigest: hex(`bkr04-bgl:${current.deviceIdentity}`),
    uniformAbiDigest: hex(`bkr04-uniform:${current.deviceIdentity}`),
    canonicalDeltaDigest: hex(`bkr04-delta:${current.deviceIdentity}`),
    structureGateSourceDigest: hex(`bkr04-gate:${current.deviceIdentity}`),
    pipelineIdentity: `bkr04:${current.deviceIdentity}`,
    pipelineIdentityDigest: hex(`bkr04-identity:${current.deviceIdentity}`),
    pipeline: {}, bindGroupLayout: {}, disposed: false,
    dispose() { if (this.disposed) return; this.disposed = true; stats.effectDisposeCount += 1; },
  };
  const ewa = {
    schemaVersion: 8,
    runtimeEpoch: current.runtimeEpoch,
    deviceEpoch: current.deviceEpoch,
    deviceIdentity: current.deviceIdentity,
    layoutDigest: hex('layout'),
    parameterAbiId: 'tdt.ewa.params.v4',
    kernelContractId: 'tdt.ewa.kernel-contract.v4',
    kernelContractDigest: hex('kernel-contract'),
    kernelId: 'tdt.ewa.kernel.v4',
    generatorId: 'tdt.ewa.generator.v4',
    generatedManifestId: 'tdt.ewa.generated-manifest.v4',
    generatedManifestDigest: hex('generated-manifest'),
    phaseConventionId: 'tdt.ewa.phase.continuous-source-lattice.v1',
    borderId: 'tdt.ewa.border.unclipped-support.v1',
    axialFieldSchemaId: 'tdt.structure-tensor.r1c.axial-field.v1',
    axialInterpolationId: 'tdt.axial.double-angle.bilinear.v1',
    canonical: { pipelineIdentity: `ewa-canonical:${current.deviceIdentity}` },
    tiledR4: { pipelineIdentity: `ewa-tiled-r4:${current.deviceIdentity}` },
    tiledR6: { pipelineIdentity: `ewa-tiled-r6:${current.deviceIdentity}` },
    validationR4: { pipelineIdentity: `ewa-validation-r4:${current.deviceIdentity}` },
    validationR6: { pipelineIdentity: `ewa-validation-r6:${current.deviceIdentity}` },
    reference: { pipelineIdentity: `ewa-reference:${current.deviceIdentity}` },
    comparator: { pipelineIdentity: `ewa-comparator:${current.deviceIdentity}` },
    tensorR1C: tensor,
    adaptivePolicyR1D: adaptive,
    bakemonoRinneWgsl04: effect,
    disposed: false,
    dispose() {
      if (this.disposed) return;
      effect.dispose();
      adaptive.dispose();
      tensor.dispose();
      this.disposed = true;
      stats.rootDisposeCount += 1;
    },
  };
  return { pipes: { pipeEWA: ewa }, stats };
}

function canonicalize(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Object.is(value, -0) ? 0 : value;
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => [key, canonicalize(value[key])]));
  throw new TypeError(`Unsupported canonical value: ${typeof value}`);
}
export const canonicalJson = (value) => JSON.stringify(canonicalize(value));
export const digest = (value) => crypto.createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex');
export function seal(body, digestField) {
  const withDigest = { ...body, [digestField]: digest(body) };
  return Object.freeze({ ...withDigest, selfSha256: digest(withDigest) });
}

export function rebuildRequest(current, oldEpoch, cycleOrdinal = 1) {
  return seal({
    schemaVersion: 1,
    schemaId: 'tdt.r9a-p1-r2-r3.pipeline-rebuild-request.v1',
    mode: 'RECOVERY_EAGER',
    runId: hex('run'),
    cycleOrdinal,
    cycleBindingDigest: hex(`binding-${cycleOrdinal}`),
    permitTombstoneDigest: hex(`tombstone-${cycleOrdinal}`),
    ownerBindingDigest: hex('owner'),
    packageClosureDigest: hex('closure'),
    expectedRuntimeEpoch: current.runtimeEpoch,
    expectedOldDeviceEpoch: oldEpoch,
    expectedNewDeviceEpoch: current.deviceEpoch,
    expectedDeviceIdentity: current.deviceIdentity,
    expectedAdapterIdentity: current.adapterIdentity,
    leaseIdDigest: hex(`lease-${cycleOrdinal}`),
    invalidationReceiptDigest: hex(`invalidation-${cycleOrdinal}`),
    requestedAtMs: 1_800_000_000_000 + cycleOrdinal,
  }, 'requestDigest');
}

export async function waitForBuilding(authority) {
  for (let index = 0; index < 100; index += 1) {
    const snapshot = await authority.snapshot();
    if (snapshot.entries.some((entry) => entry.state === 'BUILDING')) return snapshot;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('BUILDING entry did not appear');
}
