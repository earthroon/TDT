// TDT-RESAMPLE-RUNTIME-01-R7
// Preview/Delta-K facade delegates canonical lowpass to one shared runtime.

import { createEWAAnisoPipeline } from './ewa_aniso_tile.mjs';
import { createStructureTensorR1CPipeline } from './structure_tensor_runtime.mjs';
import { tensorR1CTelemetrySnapshot } from './structure_tensor_runtime_receipt.mjs';
import { createAdaptivePolicyR1DPipeline } from './adaptive_policy_r1d_runtime.mjs';
import { adaptivePolicyR1DTelemetrySnapshot } from './adaptive_policy_r1d_receipt.mjs';
import {
  getEwaTextureMetadata,
  normalizeDeltaKStackRequest,
  validateEwaDeviceOwnership,
} from './ewa_aniso_contract.mjs';
import { ewaR1ATelemetrySnapshot } from './ewa_aniso_runtime_receipt.mjs';
import { getEwaR1BTelemetry } from './ewa_multistage_runtime_receipt.mjs';
import { executeCanonicalEwaLowpassR7 } from './ewa_canonical_lowpass_runtime_r7.mjs';
import { getR7TextureReceipt, getR7Telemetry } from './ewa_convergence_receipt_r7.mjs';

const outputReceipts = new WeakMap();
function stableError(code, message, detail = null) { return Object.assign(new Error(message), { code, detail }); }

export async function createDeltaKStack(device, existingPipes = {}) {
  const [pipeEWA, tensorR1C, adaptivePolicyR1D] = await Promise.all([
    createEWAAnisoPipeline(device),
    createStructureTensorR1CPipeline(device),
    createAdaptivePolicyR1DPipeline(device),
  ]);
  pipeEWA.tensorR1C = tensorR1C;
  pipeEWA.adaptivePolicyR1D = adaptivePolicyR1D;
  const disposeEwa = pipeEWA.dispose.bind(pipeEWA);
  pipeEWA.dispose = () => {
    if (pipeEWA.disposed) return;
    adaptivePolicyR1D.dispose();
    tensorR1C.dispose();
    disposeEwa();
  };
  return { ...existingPipes, pipeEWA };
}

export function getDeltaKEwaOutputMetadata(texture) {
  return outputReceipts.get(texture) ?? getR7TextureReceipt(texture) ?? getEwaTextureMetadata(texture) ?? null;
}
export function getDeltaKEwaR1ATelemetry() { return ewaR1ATelemetrySnapshot(); }
export function getDeltaKEwaR1BTelemetry() { return getEwaR1BTelemetry(); }
export function getDeltaKEwaR1CTelemetry() { return Object.freeze({ ...tensorR1CTelemetrySnapshot(), adaptivePolicy: adaptivePolicyR1DTelemetrySnapshot(), convergence: getR7Telemetry() }); }

async function runDeltaKStackCanonical(request) {
  const pipeBundle = request.pipes.pipeEWA;
  const binding = await validateEwaDeviceOwnership(request);
  if (pipeBundle?.deviceEpoch != null && pipeBundle.deviceEpoch !== binding.deviceEpoch) {
    throw stableError('E_R7_STALE_RESOURCE_EPOCH', 'Preview EWA bundle belongs to a stale device epoch', { pipelineDeviceEpoch: pipeBundle.deviceEpoch, currentDeviceEpoch: binding.deviceEpoch });
  }
  if (request.tensorMode !== 'canonical-stage-local-r1c') {
    throw stableError('E_R7_LEGACY_TENSOR_CANONICAL_FORBIDDEN', 'R7 Preview canonical lowpass requires the stage-local R5 axial field');
  }
  const sourceMetadata = getEwaTextureMetadata(request.srcTex);
  const result = await executeCanonicalEwaLowpassR7({
    device: request.device,
    pipeBundle,
    sourceTexture: request.srcTex,
    sourceWidth: request.sourceWidth,
    sourceHeight: request.sourceHeight,
    targetWidth: request.outputWidth,
    targetHeight: request.outputHeight,
    sourceFormat: sourceMetadata?.format ?? 'rgba8unorm',
    sourceSurfaceId: request.sourceSurfaceId ?? `tdt.preview:${request.jobId}`,
    sourceRevision: request.sourceRevision ?? 1,
    sourceDomain: request.sourceDomain,
    jobId: request.jobId,
    consumerEnvelope: 'preview',
    cancellationEpoch: request.cancellationEpoch,
    abortSignal: request.abortSignal,
    isCancelled: request.isCancelled,
    runtimeEpoch: binding.runtimeEpoch,
    deviceEpoch: binding.deviceEpoch,
    sigmaMain: request.sigmaMain,
    sigmaCross: request.sigmaCross,
    shrinkClamp: request.shrinkClamp,
    maxAnisotropy: request.maxAnisotropy,
    edgeLow: request.edgeLow,
    edgeHigh: request.edgeHigh,
    minorCoverageFactor: request.minorCoverageFactor,
    coherenceExponent: request.coherenceExponent,
    tensorSigma: request.tensorSigma,
    alphaEpsilon: request.alphaEpsilon,
    kernelSharpness: request.kernelSharpness,
    kernelTaperExponent: request.kernelTaperExponent,
    phaseConvention: request.phaseConvention,
    phaseConventionId: request.phaseConventionId,
    borderMode: request.borderMode,
    flags: request.flags,
    adaptivePolicy: request.adaptivePolicy,
    qmapTexture: request.qmapTex,
    retainTerminalInputs: false,
  });

  if (typeof request.runDeltaKCore === 'function') {
    const finalBinding = await validateEwaDeviceOwnership(request);
    await request.runDeltaKCore({
      device: request.device,
      inputTex: result.terminalTexture,
      tensorTex: request.tensorTex,
      width: request.outputWidth,
      height: request.outputHeight,
      runtimeEpoch: finalBinding.runtimeEpoch,
      deviceEpoch: finalBinding.deviceEpoch,
      jobId: request.jobId,
    });
  }
  const envelope = Object.freeze({
    ...result.lowpassReceipt,
    consumerEnvelope: 'preview',
    outputSurfaceOwnership: result.terminalTexture === request.srcTex ? 'caller-source-retained' : 'caller-transfer',
    readbackCount: 0,
    intermediateReadbackCount: 0,
    residual: Object.freeze({ status: 'NOT_APPLICABLE', executionCount: 0 }),
    finalization: Object.freeze({ status: 'NOT_APPLICABLE' }),
    deltaKCoreExecutionCount: typeof request.runDeltaKCore === 'function' ? 1 : 0,
  });
  outputReceipts.set(result.terminalTexture, envelope);
  return result.terminalTexture;
}

export async function runDeltaKStack(...args) {
  const request = normalizeDeltaKStackRequest(...args);
  return runDeltaKStackCanonical(request);
}
