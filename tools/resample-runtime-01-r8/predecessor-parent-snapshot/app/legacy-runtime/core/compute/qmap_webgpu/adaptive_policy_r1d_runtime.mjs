import { ADAPTIVE_POLICY_R1D_ABI_ID, ADAPTIVE_POLICY_R1D_PARAM_BYTES, packAdaptivePolicyR1DParams } from './adaptive_policy_r1d_params.mjs';
import { ADAPTIVE_POLICY_R1D_FIELD_SCHEMA_ID } from './adaptive_policy_r1d_contract.mjs';
import { registerAdaptivePolicyFieldR1D, incrementAdaptivePolicyR1DTelemetry } from './adaptive_policy_r1d_receipt.mjs';

const CONSUMER = 'dadum.gpu.consumer.legacy-pipeline';
const shaderUrl = new URL('./shaders/adaptive_policy_projection_r1d.wgsl', import.meta.url);
function stableError(code, message, detail = null) { return Object.assign(new Error(message), { code, detail }); }
async function sha256(text) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(d)].map(v => v.toString(16).padStart(2, '0')).join(''); }

export async function createAdaptivePolicyR1DPipeline(device) {
  const response = await fetch(shaderUrl);
  if (!response.ok) throw stableError('E_R1D_ADAPTIVE_POLICY_SHADER_FETCH_FAILED', 'Adaptive policy WGSL fetch failed', { status: response.status });
  const code = String(await response.text()).replace(/\r\n/g, '\n').trimEnd();
  const shaderDigest = await sha256(code);
  const module = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createShaderModule(CONSUMER, `tdt.adaptive-policy.r1d:${shaderDigest}`, { code });
  const pipeline = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createComputePipeline(CONSUMER, `tdt.adaptive-policy.r1d:${ADAPTIVE_POLICY_R1D_ABI_ID}:${shaderDigest}`, { layout: 'auto', compute: { module, entryPoint: 'main' } });
  const usage = globalThis.GPUTextureUsage ?? { COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8 };
  const neutralQmap = device.createTexture({ label: 'tdt.adaptive-policy.neutral-qmap', size: { width: 1, height: 1, depthOrArrayLayers: 1 }, format: 'rgba16float', usage: usage.COPY_DST | usage.TEXTURE_BINDING });
  return Object.freeze({
    pipeline,
    shaderDigest,
    neutralQmap,
    dispose() { neutralQmap.destroy?.(); },
  });
}

export async function buildAdaptivePolicyFieldR1D(device, bundle, input) {
  const width = Number(input.width), height = Number(input.height);
  const usage = globalThis.GPUTextureUsage ?? { TEXTURE_BINDING: 4, STORAGE_BINDING: 8 };
  const bufferUsage = globalThis.GPUBufferUsage ?? { COPY_DST: 8, UNIFORM: 64 };
  const fieldTexture = device.createTexture({ label: `tdt.adaptive-policy.field:${input.jobId}`, size: { width, height, depthOrArrayLayers: 1 }, format: 'rgba16float', usage: usage.TEXTURE_BINDING | usage.STORAGE_BINDING });
  const params = device.createBuffer({ label: `tdt.adaptive-policy.params:${input.jobId}`, size: ADAPTIVE_POLICY_R1D_PARAM_BYTES, usage: bufferUsage.UNIFORM | bufferUsage.COPY_DST });
  const qmapTexture = input.qmapTexture ?? bundle.neutralQmap;
  const qmapWidth = Number(input.qmapWidth ?? qmapTexture.width ?? qmapTexture.size?.[0] ?? 1);
  const qmapHeight = Number(input.qmapHeight ?? qmapTexture.height ?? qmapTexture.size?.[1] ?? 1);
  const packed = packAdaptivePolicyR1DParams({ width, height, qmapWidth, qmapHeight, policy: input.policy, stageIndex: input.stageIndex });
  try {
    device.queue.writeBuffer(params, 0, packed);
    const group = device.createBindGroup({ layout: bundle.pipeline.getBindGroupLayout(0), entries: [
      { binding: 0, resource: qmapTexture.createView() },
      { binding: 1, resource: fieldTexture.createView() },
      { binding: 2, resource: { buffer: params, offset: 0, size: ADAPTIVE_POLICY_R1D_PARAM_BYTES } },
    ] });
    const encoder = device.createCommandEncoder({ label: `tdt.adaptive-policy.encoder:${input.jobId}` });
    const pass = encoder.beginComputePass({ label: `tdt.adaptive-policy.pass:${input.jobId}` });
    pass.setPipeline(bundle.pipeline); pass.setBindGroup(0, group); pass.dispatchWorkgroups(Math.ceil(width / 8), Math.ceil(height / 8), 1); pass.end();
    device.queue.submit([encoder.finish()]);
    await Promise.resolve(device.queue.onSubmittedWorkDone?.());
    const receipt = Object.freeze({
      schemaVersion: 1,
      patchId: 'TDT-RESAMPLE-RUNTIME-01-R1D',
      fieldSchemaId: ADAPTIVE_POLICY_R1D_FIELD_SCHEMA_ID,
      fieldKind: 'adaptation-policy-not-tensor',
      width,
      height,
      stageIndex: Number(input.stageIndex ?? 0),
      stageCount: Number(input.stageCount ?? 1),
      policyDigest: input.policy.policyDigest,
      shaderDigest: bundle.shaderDigest,
      qmapPresent: Boolean(input.qmapTexture),
      tensorOrientationAuthority: false,
    });
    registerAdaptivePolicyFieldR1D(fieldTexture, receipt);
    let released = false;
    return Object.freeze({ fieldTexture, receipt, release() { if (released) return; released = true; incrementAdaptivePolicyR1DTelemetry('releaseCount'); params.destroy?.(); fieldTexture.destroy?.(); } });
  } catch (error) {
    incrementAdaptivePolicyR1DTelemetry('failureCount'); params.destroy?.(); fieldTexture.destroy?.(); throw error;
  }
}
