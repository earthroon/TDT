import { buildEwaStagePlan, verifyStageAgainstPlan } from '../../core/compute/qmap_webgpu/ewa_stage_planner.mjs';
import {
  appendEwaR1BStageReceipt,
  beginEwaR1BPlan,
  failEwaR1BPlan,
  finalizeEwaR1BChain,
  getEwaR1BArrayReceipt,
  incrementEwaR1BTelemetry,
} from '../../core/compute/qmap_webgpu/ewa_multistage_runtime_receipt.mjs';
import { createStructureTensorR1CPipeline, buildStageLocalTensorR1C } from '../../core/compute/qmap_webgpu/structure_tensor_runtime.mjs';
import { TENSOR_R1C_ABI_VERSION } from '../../core/compute/qmap_webgpu/structure_tensor_params.mjs';

const WG_SIZE = 8;
const EXPORT_ABI_VERSION = 0x0001000c;
const EXPORT_PARAM_BYTES = 80;
let __dadumWGSLState = null;
let __dadumWGSLLease = null;
let __dadumWGSLRecoveryUnregister = null;
let __dadumWGSLSerial = Promise.resolve();

function stableError(code, message, detail = null) {
  return Object.assign(new Error(message), { code, detail });
}

function assertWebGPU() {
  if (!globalThis.navigator || !navigator.gpu) throw stableError('E_R1B_WEBGPU_UNAVAILABLE', 'WebGPU unavailable for WGSL export downscale');
}

async function fetchWGSL(name) {
  const url = new URL('./shaders/' + name, import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw stableError('E_R1B_WGSL_FETCH_FAILED', 'WGSL fetch failed', { url: url.href, status: res.status });
  return await res.text();
}

async function ensureState() {
  assertWebGPU();
  if (__dadumWGSLState?.device && __dadumWGSLLease) {
    try { __dadumWGSLLease.assertCurrent(); return __dadumWGSLState; } catch (_) { __dadumWGSLState = null; __dadumWGSLLease = null; }
  }
  const bridge = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__;
  if (!bridge) throw stableError('E_GPU_AUTHORITY_BRIDGE_UNAVAILABLE', 'GPU Authority bridge unavailable for export downscale');
  __dadumWGSLLease = await bridge.acquireLease('dadum.gpu.consumer.export-downscale', 'export-downscale-r1b');
  const device = __dadumWGSLLease.device;
  if (!__dadumWGSLRecoveryUnregister) {
    __dadumWGSLRecoveryUnregister = bridge.registerRecoveryParticipant({
      participantId: 'dadum.gpu.participant.export-downscale',
      order: 40,
      invalidate() { try { __dadumWGSLLease?.release(); } catch (_) {} try { __dadumWGSLState?.tensorR1C?.dispose?.(); } catch (_) {} try { __dadumWGSLState?.uniform?.destroy?.(); } catch (_) {} __dadumWGSLLease = null; __dadumWGSLState = null; },
    });
  }
  const [lowCode, finalCode, linearCode] = await Promise.all([
    fetchWGSL('export_ewa_lowpass.wgsl'),
    fetchWGSL('export_ewa_recompose.wgsl'),
    fetchWGSL('export_ewa_recompose_linear.wgsl'),
  ]);
  const lowModule = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createShaderModule('dadum.gpu.consumer.export-downscale', 'modules/dk_resample/export_wgsl_downscale.js:shader:lowpass-r1b', { code: lowCode });
  const finalModule = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createShaderModule('dadum.gpu.consumer.export-downscale', 'modules/dk_resample/export_wgsl_downscale.js:shader:final-r1b', { code: finalCode });
  const linearModule = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createShaderModule('dadum.gpu.consumer.export-downscale', 'modules/dk_resample/export_wgsl_downscale.js:shader:linear-r1b', { code: linearCode });
  const lowPipeline = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createComputePipeline('dadum.gpu.consumer.export-downscale', 'modules/dk_resample/export_wgsl_downscale.js:compute-pipeline:lowpass-r1b', { layout: 'auto', compute: { module: lowModule, entryPoint: 'main' } });
  const finalPipeline = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createComputePipeline('dadum.gpu.consumer.export-downscale', 'modules/dk_resample/export_wgsl_downscale.js:compute-pipeline:final-r1b', { layout: 'auto', compute: { module: finalModule, entryPoint: 'main' } });
  const linearPipeline = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createComputePipeline('dadum.gpu.consumer.export-downscale', 'modules/dk_resample/export_wgsl_downscale.js:compute-pipeline:linear-r1b', { layout: 'auto', compute: { module: linearModule, entryPoint: 'main' } });
  const sampler = device.createSampler({ minFilter: 'linear', magFilter: 'linear', mipmapFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' });
  const tensorR1C = await createStructureTensorR1CPipeline(device);
  const uniform = device.createBuffer({ size: EXPORT_PARAM_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  __dadumWGSLState = {
    device,
    deviceEpoch: __dadumWGSLLease.deviceEpoch,
    lowPipeline,
    finalPipeline,
    linearPipeline,
    sampler,
    uniform,
    tensorR1C,
  };
  return __dadumWGSLState;
}

function createTexture(device, width, height, format) {
  return device.createTexture({
    size: { width, height, depthOrArrayLayers: 1 },
    format,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC | GPUTextureUsage.STORAGE_BINDING,
  });
}

function makeUniform(stage, opts = {}) {
  const buf = new ArrayBuffer(EXPORT_PARAM_BYTES);
  const u32 = new Uint32Array(buf);
  const f32 = new Float32Array(buf);
  u32[0] = stage.sourceWidth >>> 0;
  u32[1] = stage.sourceHeight >>> 0;
  u32[2] = stage.outputWidth >>> 0;
  u32[3] = stage.outputHeight >>> 0;
  f32[4] = stage.srcPerDstX;
  f32[5] = stage.srcPerDstY;
  f32[6] = Number.isFinite(opts.radiusMul) ? opts.radiusMul : 1.9;
  f32[7] = Number.isFinite(opts.sigma) ? opts.sigma : 1.05;
  f32[8] = Number.isFinite(opts.detailMix) ? opts.detailMix : 0.32;
  f32[9] = Number.isFinite(opts.edgeBoost) ? opts.edgeBoost : 3.2;
  f32[10] = Number.isFinite(opts.majorBoost) ? opts.majorBoost : 1.65;
  f32[11] = Number.isFinite(opts.minorClamp) ? opts.minorClamp : 0.72;
  u32[12] = stage.stageIndex >>> 0;
  u32[13] = stage.stageCount >>> 0;
  u32[14] = Number(opts.flags ?? 0) >>> 0;
  u32[15] = EXPORT_ABI_VERSION;
  f32[16] = Number.isFinite(opts.maxAnisotropy) ? opts.maxAnisotropy : 3.0;
  f32[17] = Number.isFinite(opts.coherenceExponent) ? opts.coherenceExponent : 1.25;
  f32[18] = Number.isFinite(opts.tensorSigma) ? opts.tensorSigma : 1.15;
  u32[19] = TENSOR_R1C_ABI_VERSION;
  return buf;
}

function bytesPerRowAligned(width) { const raw = width * 4; return (raw + 255) & ~255; }

function premultiplyRgba8(src) {
  const out = new Uint8Array(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const a = src[i + 3] / 255;
    out[i] = Math.round(src[i] * a);
    out[i + 1] = Math.round(src[i + 1] * a);
    out[i + 2] = Math.round(src[i + 2] * a);
    out[i + 3] = src[i + 3];
  }
  return out;
}

function assertNotCancelled(opts, stageIndex) {
  if (opts?.abortSignal?.aborted || opts?.signal?.aborted || opts?.isCancelled?.()) {
    throw stableError('E_R1B_CANCELLED', 'Export EWA chain was cancelled', { stageIndex });
  }
}

export function getExportEwaR1BReceipt(outputArray) { return getEwaR1BArrayReceipt(outputArray); }

async function executeDownscale(rgba, srcW, srcH, dstW, dstH, opts) {
  if (!(rgba instanceof Uint8Array)) throw stableError('E_R1B_EXPORT_SOURCE_TYPE', 'WGSL downscale expects Uint8Array RGBA source');
  srcW >>>= 0; srcH >>>= 0; dstW >>>= 0; dstH >>>= 0;
  if (!srcW || !srcH || !dstW || !dstH) throw stableError('E_R1B_DIMENSION_INVALID', 'Invalid WGSL downscale dimensions');
  if (rgba.length !== srcW * srcH * 4) throw stableError('E_R1B_EXPORT_SOURCE_LENGTH', 'WGSL downscale source byte-length mismatch');
  if (dstW > srcW || dstH > srcH) throw stableError('E_R1B_UPSCALE_NOT_ADMITTED', 'WGSL export EWA does not admit upscaling');

  const parameters = {
    radiusMul: Number.isFinite(opts.radiusMul) ? opts.radiusMul : 1.9,
    sigma: Number.isFinite(opts.sigma) ? opts.sigma : 1.05,
    detailMix: Number.isFinite(opts.detailMix) ? opts.detailMix : 0.32,
    edgeBoost: Number.isFinite(opts.edgeBoost) ? opts.edgeBoost : 3.2,
    majorBoost: Number.isFinite(opts.majorBoost) ? opts.majorBoost : 1.65,
    minorClamp: Number.isFinite(opts.minorClamp) ? opts.minorClamp : 0.72,
    alphaMode: String(opts.alphaMode ?? 'straight'),
    tensorSigma: Number.isFinite(opts.tensorSigma) ? opts.tensorSigma : 1.15,
    alphaEpsilon: Number.isFinite(opts.alphaEpsilon) ? opts.alphaEpsilon : 1e-6,
    maxAnisotropy: Number.isFinite(opts.maxAnisotropy) ? opts.maxAnisotropy : 3.0,
    coherenceExponent: Number.isFinite(opts.coherenceExponent) ? opts.coherenceExponent : 1.25,
    minorCoverageFactor: Number.isFinite(opts.minorCoverageFactor) ? opts.minorCoverageFactor : (Number.isFinite(opts.minorClamp) ? opts.minorClamp : 0.82),
    edgeLow: Number.isFinite(opts.tensorEdgeLow) ? opts.tensorEdgeLow : 0.025,
    edgeHigh: Number.isFinite(opts.tensorEdgeHigh) ? opts.tensorEdgeHigh : 0.22,
  };
  const plan = await buildEwaStagePlan({
    sourceWidth: srcW,
    sourceHeight: srcH,
    targetWidth: dstW,
    targetHeight: dstH,
    profileId: 'export-ewa-7x7-v1',
    parameters,
  });
  const chain = beginEwaR1BPlan(plan);
  if (plan.stageCount === 0) {
    const out = new Uint8Array(rgba);
    finalizeEwaR1BChain(chain, { outputArray: out, uploadCount: 0, readbackCount: 0, intermediateReadbackCount: 0, identityCopy: true });
    return out;
  }

  const st = await ensureState();
  const { device, lowPipeline, finalPipeline, linearPipeline, sampler, uniform, tensorR1C } = st;
  const owned = new Set();
  const destroyed = new Set();
  const destroyOnce = (resource) => {
    if (!resource || !owned.has(resource) || destroyed.has(resource)) return;
    destroyed.add(resource);
    try { resource.destroy?.(); } catch (_) {}
  };

  let sourceTexture = null;
  let currentTexture = null;
  let currentOwned = false;
  let readback = null;
  try {
    assertNotCancelled(opts, 0);
    sourceTexture = createTexture(device, srcW, srcH, 'rgba8unorm');
    owned.add(sourceTexture);
    currentTexture = sourceTexture;
    const upload = opts.alphaMode === 'premultiplied' ? premultiplyRgba8(rgba) : new Uint8Array(rgba);
    device.queue.writeTexture({ texture: sourceTexture }, upload, { bytesPerRow: srcW * 4, rowsPerImage: srcH }, { width: srcW, height: srcH, depthOrArrayLayers: 1 });
    incrementEwaR1BTelemetry('uploadCount');

    let finalArray = null;
    for (const stage of plan.stages) {
      assertNotCancelled(opts, stage.stageIndex);
      __dadumWGSLLease.assertCurrent();
      const support = verifyStageAgainstPlan(stage, plan.profileId, parameters);
      const finalStage = stage.stageIndex === stage.stageCount - 1;
      const tensorHandle = await buildStageLocalTensorR1C(device, tensorR1C, {
        sourceTexture: currentTexture,
        sourceSurfaceId: String(opts.sourceSurfaceId ?? `tdt.export:${opts.jobId ?? 'export'}`),
        sourceRevision: Number(opts.sourceRevision ?? 1),
        sourceFormat: stage.stageIndex === 0 ? 'rgba8unorm' : 'rgba16float',
        cancellationEpoch: Number(opts.cancellationEpoch ?? 0),
        producerRequestSequence: stage.stageIndex + 1,
        width: stage.sourceWidth,
        height: stage.sourceHeight,
        stageIndex: stage.stageIndex,
        stageCount: stage.stageCount,
        jobId: `export-r1c:${stage.stageIndex}`,
        tensorSigma: parameters.tensorSigma,
        alphaEpsilon: parameters.alphaEpsilon,
        edgeLow: parameters.edgeLow,
        edgeHigh: parameters.edgeHigh,
        maxAnisotropy: parameters.maxAnisotropy,
        minorCoverageFactor: parameters.minorCoverageFactor,
        coherenceExponent: parameters.coherenceExponent,
        sourceDomain: stage.stageIndex === 0 ? 'encoded-srgb' : 'declared-linear',
      });
      const lowTex = createTexture(device, stage.outputWidth, stage.outputHeight, 'rgba16float');
      const stageOut = createTexture(device, stage.outputWidth, stage.outputHeight, finalStage ? 'rgba8unorm' : 'rgba16float');
      owned.add(lowTex); owned.add(stageOut);
      device.queue.writeBuffer(uniform, 0, makeUniform(stage, parameters));

      const lowBindGroup = device.createBindGroup({
        layout: lowPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: currentTexture.createView() },
          { binding: 1, resource: sampler },
          { binding: 2, resource: tensorHandle.fieldTexture.createView() },
          { binding: 3, resource: lowTex.createView() },
          { binding: 4, resource: { buffer: uniform } },
        ],
      });
      const recomposePipeline = finalStage ? finalPipeline : linearPipeline;
      const recomposeBindGroup = device.createBindGroup({
        layout: recomposePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: currentTexture.createView() },
          { binding: 1, resource: lowTex.createView() },
          { binding: 2, resource: sampler },
          { binding: 3, resource: tensorHandle.fieldTexture.createView() },
          { binding: 4, resource: stageOut.createView() },
          { binding: 5, resource: { buffer: uniform } },
        ],
      });

      const encoder = device.createCommandEncoder({ label: `dadum_export_ewa_r1b_stage_${stage.stageIndex}` });
      const lowPass = encoder.beginComputePass({ label: `dadum_export_ewa_lowpass_${stage.stageIndex}` });
      lowPass.setPipeline(lowPipeline); lowPass.setBindGroup(0, lowBindGroup);
      lowPass.dispatchWorkgroups(Math.ceil(stage.outputWidth / WG_SIZE), Math.ceil(stage.outputHeight / WG_SIZE), 1); lowPass.end();
      const pass = encoder.beginComputePass({ label: `dadum_export_ewa_recompose_${stage.stageIndex}` });
      pass.setPipeline(recomposePipeline); pass.setBindGroup(0, recomposeBindGroup);
      pass.dispatchWorkgroups(Math.ceil(stage.outputWidth / WG_SIZE), Math.ceil(stage.outputHeight / WG_SIZE), 1); pass.end();

      let bpr = 0;
      if (finalStage) {
        bpr = bytesPerRowAligned(stage.outputWidth);
        readback = device.createBuffer({ size: bpr * stage.outputHeight, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        owned.add(readback);
        encoder.copyTextureToBuffer({ texture: stageOut }, { buffer: readback, bytesPerRow: bpr, rowsPerImage: stage.outputHeight }, { width: stage.outputWidth, height: stage.outputHeight, depthOrArrayLayers: 1 });
      }

      device.queue.submit([encoder.finish()]);
      await device.queue.onSubmittedWorkDone();
      tensorHandle.release();
      destroyOnce(lowTex);
      if (currentOwned) destroyOnce(currentTexture);
      currentTexture = stageOut;
      currentOwned = true;

      appendEwaR1BStageReceipt(chain, {
        stageIndex: stage.stageIndex,
        stageCount: stage.stageCount,
        sourceWidth: stage.sourceWidth,
        sourceHeight: stage.sourceHeight,
        outputWidth: stage.outputWidth,
        outputHeight: stage.outputHeight,
        srcPerDstX: stage.srcPerDstX,
        srcPerDstY: stage.srcPerDstY,
        support,
        inputFormat: stage.stageIndex === 0 ? 'rgba8unorm' : 'rgba16float',
        outputFormat: finalStage ? 'rgba8unorm' : 'rgba16float',
        readback: finalStage,
        deviceEpoch: st.deviceEpoch,
        tensorMode: 'canonical-stage-local-r1c',
        tensorTruthClaim: true,
        tensorFieldSchemaId: tensorHandle.receipt.tensorFieldSchemaId,
        tensorPipelineIdentity: tensorHandle.receipt.tensorPipelineIdentity,
        tensorShaderDigests: tensorHandle.receipt.tensorShaderDigests,
        tensorParameterDigest: tensorHandle.receipt.tensorParameterDigest,
        tensorFieldWidth: tensorHandle.receipt.tensorFieldWidth,
        tensorFieldHeight: tensorHandle.receipt.tensorFieldHeight,
        tensorSigma: tensorHandle.receipt.tensorSigma,
        maxAnisotropy: tensorHandle.receipt.maxAnisotropy,
        coherenceExponent: tensorHandle.receipt.coherenceExponent,
        minorCoverageFactor: tensorHandle.receipt.minorCoverageFactor,
        ellipseKernelId: 'tdt.ewa.ellipse.radial-v1',
        tensorTemporaryDestroyCount: 5,
      });

      if (finalStage) {
        await readback.mapAsync(GPUMapMode.READ);
        const mapped = new Uint8Array(readback.getMappedRange());
        finalArray = new Uint8Array(dstW * dstH * 4);
        for (let y = 0; y < dstH; y++) finalArray.set(mapped.subarray(y * bpr, y * bpr + dstW * 4), y * dstW * 4);
        readback.unmap();
        destroyOnce(readback);
        incrementEwaR1BTelemetry('readbackCount');
      }
    }

    if (!finalArray || finalArray.length !== dstW * dstH * 4) throw stableError('E_R1B_FINAL_OUTPUT_LENGTH', 'Final export output length is not exact');
    destroyOnce(currentTexture);
    if (sourceTexture && sourceTexture !== currentTexture) destroyOnce(sourceTexture);
    finalizeEwaR1BChain(chain, {
      outputArray: finalArray,
      uploadCount: 1,
      readbackCount: 1,
      intermediateReadbackCount: 0,
      finalFormat: 'rgba8unorm',
      intermediateFormat: 'rgba16float',
      deviceEpoch: st.deviceEpoch,
    });
    return finalArray;
  } catch (error) {
    failEwaR1BPlan(chain, error, error?.code === 'E_R1B_CANCELLED');
    for (const resource of owned) destroyOnce(resource);
    throw error;
  }
}

export async function downscaleRGBAWithWGSL(rgba, srcW, srcH, dstW, dstH, opts = {}) {
  const run = () => executeDownscale(rgba, srcW, srcH, dstW, dstH, opts);
  const result = __dadumWGSLSerial.then(run, run);
  __dadumWGSLSerial = result.then(() => undefined, () => undefined);
  return result;
}
