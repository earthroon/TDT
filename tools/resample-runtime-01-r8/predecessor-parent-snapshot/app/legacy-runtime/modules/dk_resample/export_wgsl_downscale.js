// TDT-RESAMPLE-RUNTIME-01-R7
// Byte Export facade delegates all lowpass stages to the shared R7 runtime.

import { createEWAAnisoPipeline } from '../../core/compute/qmap_webgpu/ewa_aniso_tile.mjs';
import { createStructureTensorR1CPipeline } from '../../core/compute/qmap_webgpu/structure_tensor_runtime.mjs';
import { executeCanonicalEwaLowpassR7 } from '../../core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r7.mjs';
import { bindR7ArrayReceipt, getR7ArrayReceipt } from '../../core/compute/qmap_webgpu/ewa_convergence_receipt_r7.mjs';
import { registerEwaTextureMetadata } from '../../core/compute/qmap_webgpu/ewa_aniso_contract.mjs';
import { executeExportResidualR7, normalizeExportResidualR7, EXPORT_R7_RESIDUAL_ID } from './export_residual_runtime_r7.mjs';
import { finalizeExportR7, EXPORT_R7_FINALIZE_ID } from './export_finalize_runtime_r7.mjs';

let statePromise = null;
let serial = Promise.resolve();
let recoveryUnregister = null;
function stableError(code, message, detail = null) { return Object.assign(new Error(message), { code, detail }); }
function assertWebGPU() { if (!globalThis.navigator?.gpu) throw stableError('E_R7_WEBGPU_UNAVAILABLE', 'WebGPU unavailable for canonical Export downscale'); }
function sameNumber(a, b) { return Number(a) === Number(b); }
function aliasValue(opts, canonical, alias, fallback) {
  const hasCanonical = opts[canonical] !== undefined;
  const hasAlias = opts[alias] !== undefined;
  if (hasCanonical && hasAlias && !sameNumber(opts[canonical], opts[alias])) {
    throw stableError('E_R7_LEGACY_EXPORT_OPTION_AMBIGUOUS', `${canonical} conflicts with legacy alias ${alias}`, { canonical: opts[canonical], alias: opts[alias] });
  }
  return Number(hasCanonical ? opts[canonical] : hasAlias ? opts[alias] : fallback);
}
function normalizeExportOptionsR7(opts = {}) {
  const lowpass = Object.freeze({
    sigmaMain: aliasValue(opts, 'sigmaMain', 'radiusMul', 1.25),
    sigmaCross: aliasValue(opts, 'sigmaCross', 'sigma', 0.65),
    shrinkClamp: Number(opts.shrinkClamp ?? 2.5),
    maxAnisotropy: Number(opts.maxAnisotropy ?? 3),
    edgeLow: Number(opts.edgeLow ?? opts.tensorEdgeLow ?? 0.025),
    edgeHigh: Number(opts.edgeHigh ?? opts.tensorEdgeHigh ?? 0.22),
    minorCoverageFactor: Number(opts.minorCoverageFactor ?? 0.82),
    coherenceExponent: Number(opts.coherenceExponent ?? 1.25),
    kernelSharpness: Number(opts.kernelSharpness ?? 1.65),
    kernelTaperExponent: Number(opts.kernelTaperExponent ?? opts.taperExponent ?? 1),
    phaseConvention: opts.phaseConvention,
    phaseConventionId: opts.phaseConventionId,
    borderMode: opts.borderMode,
    tensorSigma: Number(opts.tensorSigma ?? 1.15),
    alphaEpsilon: Number(opts.alphaEpsilon ?? 1e-6),
  });
  const residual = normalizeExportResidualR7(opts);
  return Object.freeze({
    lowpass,
    residual,
    aliasReceipt: Object.freeze({
      radiusMulMappedToSigmaMain: opts.radiusMul !== undefined,
      sigmaMappedToSigmaCross: opts.sigma !== undefined,
    }),
    alphaMode: String(opts.alphaMode ?? 'straight'),
    flags: Number(opts.flags ?? 0) >>> 0,
  });
}
function assertNotCancelled(opts, stageIndex) {
  if (opts.abortSignal?.aborted || opts.signal?.aborted || opts.isCancelled?.()) throw stableError('E_R7_CANCELLED', 'Export EWA chain cancelled', { stageIndex });
}
async function ensureState() {
  assertWebGPU();
  if (statePromise) return statePromise;
  statePromise = (async () => {
    const bridge = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__;
    if (!bridge) throw stableError('E_GPU_AUTHORITY_BRIDGE_UNAVAILABLE', 'GPU Authority bridge unavailable for Export');
    const lease = await bridge.acquireLease('dadum.gpu.consumer.export-downscale', 'export-downscale-r7');
    const device = lease.device;
    const [pipeEWA, tensorR1C] = await Promise.all([createEWAAnisoPipeline(device), createStructureTensorR1CPipeline(device)]);
    pipeEWA.tensorR1C = tensorR1C;
    pipeEWA.adaptivePolicyR1D = null;
    const state = { device, lease, pipeEWA, tensorR1C, deviceEpoch: lease.deviceEpoch, runtimeEpoch: lease.runtimeEpoch, deviceIdentity: lease.deviceIdentity, disposed: false };
    state.dispose = () => {
      if (state.disposed) return;
      state.disposed = true;
      try { tensorR1C.dispose(); } catch (_) {}
      try { pipeEWA.dispose(); } catch (_) {}
      try { lease.release(); } catch (_) {}
    };
    if (!recoveryUnregister) {
      recoveryUnregister = bridge.registerRecoveryParticipant?.({ participantId: 'dadum.gpu.participant.export-downscale-r7', order: 40, invalidate() { state.dispose(); statePromise = null; } }) ?? null;
    }
    return state;
  })();
  try { return await statePromise; } catch (error) { statePromise = null; throw error; }
}
function createSourceTexture(state, width, height, jobId) {
  const usage = globalThis.GPUTextureUsage ?? { TEXTURE_BINDING: 0x04, COPY_DST: 0x02, COPY_SRC: 0x01 };
  const texture = state.device.createTexture({ label: `tdt.r7.export-source:${jobId}`, size: { width, height, depthOrArrayLayers: 1 }, format: 'rgba8unorm', usage: usage.TEXTURE_BINDING | usage.COPY_DST | usage.COPY_SRC });
  registerEwaTextureMetadata(texture, { width, height, format: 'rgba8unorm', owner: 'tdt.r7.export-source-upload', semanticId: 'tdt.r7.export-source-upload', runtimeEpoch: state.runtimeEpoch, deviceEpoch: state.deviceEpoch, deviceIdentity: state.deviceIdentity, jobId });
  return texture;
}
function premultiplyRgba8(src) {
  const out = new Uint8Array(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const a = src[i + 3] / 255;
    out[i] = Math.round(src[i] * a); out[i + 1] = Math.round(src[i + 1] * a); out[i + 2] = Math.round(src[i + 2] * a); out[i + 3] = src[i + 3];
  }
  return out;
}

export function getExportEwaR1BReceipt(outputArray) { return getR7ArrayReceipt(outputArray); }
export function getExportEwaR7Receipt(outputArray) { return getR7ArrayReceipt(outputArray); }

async function executeDownscale(rgba, srcW, srcH, dstW, dstH, opts) {
  if (!(rgba instanceof Uint8Array)) throw stableError('E_R7_EXPORT_SOURCE_TYPE', 'Canonical Export expects Uint8Array RGBA source');
  srcW >>>= 0; srcH >>>= 0; dstW >>>= 0; dstH >>>= 0;
  if (!srcW || !srcH || !dstW || !dstH) throw stableError('E_R7_DIMENSION_INVALID', 'Invalid Export dimensions');
  if (rgba.length !== srcW * srcH * 4) throw stableError('E_R7_EXPORT_SOURCE_LENGTH', 'Export source byte length mismatch');
  if (dstW > srcW || dstH > srcH) throw stableError('E_R7_UPSCALE_NOT_ADMITTED', 'Canonical Export does not admit upscaling');
  const normalized = normalizeExportOptionsR7(opts);
  const state = await ensureState();
  state.lease.assertCurrent();
  const jobId = String(opts.jobId ?? 'export-r7');
  const sourceTexture = createSourceTexture(state, srcW, srcH, jobId);
  let lowpass = null;
  let residual = null;
  try {
    assertNotCancelled(opts, 0);
    // Preserve the parent byte-upload interpretation. R8 owns alpha semantic repair.
    const upload = normalized.alphaMode === 'premultiplied' ? premultiplyRgba8(rgba) : new Uint8Array(rgba);
    state.device.queue.writeTexture({ texture: sourceTexture }, upload, { bytesPerRow: srcW * 4, rowsPerImage: srcH }, { width: srcW, height: srcH, depthOrArrayLayers: 1 });
    lowpass = await executeCanonicalEwaLowpassR7({
      device: state.device, pipeBundle: state.pipeEWA, sourceTexture,
      sourceWidth: srcW, sourceHeight: srcH, targetWidth: dstW, targetHeight: dstH,
      sourceFormat: 'rgba8unorm', sourceSurfaceId: String(opts.sourceSurfaceId ?? `tdt.export:${jobId}`),
      sourceRevision: Number(opts.sourceRevision ?? 1), sourceDomain: 'encoded-srgb', jobId,
      consumerEnvelope: 'export', cancellationEpoch: Number(opts.cancellationEpoch ?? 0),
      abortSignal: opts.abortSignal ?? opts.signal, isCancelled: opts.isCancelled,
      runtimeEpoch: state.runtimeEpoch, deviceEpoch: state.deviceEpoch,
      ...normalized.lowpass, flags: normalized.flags, retainTerminalInputs: true,
    });
    assertNotCancelled(opts, lowpass.plan.stageCount);
    if (lowpass.plan.stageCount === 0) {
      residual = Object.freeze({
        outputTexture: lowpass.terminalTexture, outputOwned: false, destroy: () => {},
        receipt: Object.freeze({ residualId: EXPORT_R7_RESIDUAL_ID, status: 'SKIPPED_IDENTITY', executionCount: 0, lowpassReceiptDigest: lowpass.lowpassReceipt.receiptDigest, parameters: normalized.residual }),
      });
    } else {
      residual = await executeExportResidualR7({
        device: state.device,
        stageSourceTexture: lowpass.retainedSourceTexture,
        lowpassTexture: lowpass.terminalTexture,
        axialTexture: lowpass.retainedAxialTexture,
        sourceWidth: lowpass.plan.stages.at(-1).sourceWidth,
        sourceHeight: lowpass.plan.stages.at(-1).sourceHeight,
        outputWidth: dstW, outputHeight: dstH,
        stageIndex: lowpass.plan.stageCount - 1, stageCount: lowpass.plan.stageCount,
        lowpassReceipt: lowpass.lowpassReceipt, jobId,
        runtimeEpoch: state.runtimeEpoch, deviceEpoch: state.deviceEpoch, deviceIdentity: state.deviceIdentity,
        flags: normalized.flags, ...normalized.residual,
      });
    }
    lowpass.releaseRetained();
    const selectedTexture = residual.outputTexture;
    const selectedSemanticId = residual.receipt.status === 'EXECUTED' ? EXPORT_R7_RESIDUAL_ID : lowpass.lowpassReceipt.lowpassSemanticId;
    const selectedReceiptDigest = residual.receipt.status === 'EXECUTED' ? residual.receipt.parameterDigest : lowpass.lowpassReceipt.receiptDigest;
    const finalized = await finalizeExportR7({
      device: state.device, inputTexture: selectedTexture, width: dstW, height: dstH,
      inputSemanticId: selectedSemanticId, inputReceiptDigest: selectedReceiptDigest,
      alphaMode: normalized.alphaMode, flags: normalized.flags,
    });
    const envelope = Object.freeze({
      schemaId: 'tdt.ewa.export-envelope.r7.v1',
      consumerEnvelope: 'export',
      aliasReceipt: normalized.aliasReceipt,
      lowpass: lowpass.lowpassReceipt,
      residual: residual.receipt,
      finalization: finalized.receipt,
      uploadCount: 1,
      intermediateReadbackCount: 0,
      readbackCount: 1,
      canonicalParitySurface: 'lowpass.rgba16float.before-residual',
      finalBytesAreCanonicalLowpass: false,
    });
    bindR7ArrayReceipt(finalized.array, envelope);
    return finalized.array;
  } finally {
    try { lowpass?.releaseRetained?.(); } catch (_) {}
    try { residual?.destroy?.(); } catch (_) {}
    try { lowpass?.destroyTerminal?.(); } catch (_) {}
    try { sourceTexture.destroy?.(); } catch (_) {}
  }
}

export async function downscaleRGBAWithWGSL(rgba, srcW, srcH, dstW, dstH, opts = {}) {
  const run = () => executeDownscale(rgba, srcW, srcH, dstW, dstH, opts);
  const result = serial.then(run, run);
  serial = result.then(() => undefined, () => undefined);
  return result;
}
