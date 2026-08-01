// TDT-RESAMPLE-RUNTIME-01-R7 canonical lowpass contract.
import { normalizeEwaR6KernelParameters, EWA_R6_ABI_ID, EWA_R6_PARAM_BYTES, EWA_R6_KERNEL_ID, EWA_R6_KERNEL_CONTRACT_ID } from './ewa_aniso_params_v4.mjs';
import { EWA_R6_PHASE_ID, EWA_R6_BORDER_ID } from './ewa_kernel_contract_v4.mjs';
import { EWA_R5_TENSOR_FIELD_MODE, EWA_R5_AXIAL_FIELD_SCHEMA_ID } from './ewa_axial_contract_r5.mjs';
import { EWA_R4_COORDINATE_CONVENTION_ID } from './ewa_tiled_profile_r6.mjs';

export const EWA_R7_SHARED_RUNTIME_ID = 'tdt.ewa.canonical-lowpass-runtime.r7.v1';
export const EWA_R7_SHARED_STAGE_ID = 'tdt.ewa.canonical-lowpass-stage.r7.v1';
export const EWA_R7_CONVERGENCE_SCHEMA_ID = 'tdt.ewa.preview-export-convergence-receipt.r7.v1';
export const EWA_R7_LOW_PASS_SEMANTIC_ID = 'tdt.ewa.canonical-lowpass.r7.v1';

function stableError(code, message, detail = null) { return Object.assign(new Error(message), { code, detail }); }
function positiveInt(value, name) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n <= 0) throw stableError('E_R7_DIMENSION_INVALID', `${name} must be a positive safe integer`, { name, value });
  return n;
}
function finite(value, fallback, name, min = -Infinity, max = Infinity) {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n) || n < min || n > max) throw stableError('E_R7_LOW_PASS_PARAMETER_INVALID', `${name} is outside the admitted range`, { name, value, min, max });
  return n;
}

export function normalizeCanonicalLowpassRequestR7(input) {
  if (!input?.device || !input?.pipeBundle || !input?.sourceTexture) throw stableError('E_R7_LOW_PASS_REQUEST_INVALID', 'device, pipeBundle, and sourceTexture are required');
  if (!input.pipeBundle.tensorR1C) throw stableError('E_R7_TENSOR_PIPELINE_MISSING', 'Shared runtime requires the R5 tensor pipeline');
  const sourceWidth = positiveInt(input.sourceWidth, 'sourceWidth');
  const sourceHeight = positiveInt(input.sourceHeight, 'sourceHeight');
  const targetWidth = positiveInt(input.targetWidth, 'targetWidth');
  const targetHeight = positiveInt(input.targetHeight, 'targetHeight');
  if (targetWidth > sourceWidth || targetHeight > sourceHeight) throw stableError('E_R7_UPSCALE_NOT_ADMITTED', 'Canonical lowpass does not admit upscaling');
  const kernel = normalizeEwaR6KernelParameters(input);
  const normalized = {
    device: input.device,
    pipeBundle: input.pipeBundle,
    sourceTexture: input.sourceTexture,
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
    sourceFormat: String(input.sourceFormat ?? 'rgba16float'),
    sourceSurfaceId: String(input.sourceSurfaceId ?? 'tdt.r7.source'),
    sourceRevision: Number(input.sourceRevision ?? 1),
    sourceDomain: String(input.sourceDomain ?? 'declared-linear'),
    jobId: String(input.jobId ?? 'tdt-r7-lowpass'),
    consumerEnvelope: String(input.consumerEnvelope ?? 'unspecified'),
    cancellationEpoch: Number(input.cancellationEpoch ?? 0),
    abortSignal: input.abortSignal ?? input.signal ?? null,
    isCancelled: typeof input.isCancelled === 'function' ? input.isCancelled : null,
    runtimeEpoch: Number(input.runtimeEpoch ?? input.pipeBundle.runtimeEpoch ?? 0),
    deviceEpoch: Number(input.deviceEpoch ?? input.pipeBundle.deviceEpoch ?? 0),
    sigmaMain: finite(input.sigmaMain, 1.25, 'sigmaMain', 0.0001, 6),
    sigmaCross: finite(input.sigmaCross, 0.65, 'sigmaCross', 0.0001, 6),
    shrinkClamp: finite(input.shrinkClamp, 2.5, 'shrinkClamp', 1, 6),
    maxAnisotropy: finite(input.maxAnisotropy, 3, 'maxAnisotropy', 1, 16),
    edgeLow: finite(input.edgeLow, 0.025, 'edgeLow', 0, 1),
    edgeHigh: finite(input.edgeHigh, 0.22, 'edgeHigh', 0, 1),
    minorCoverageFactor: finite(input.minorCoverageFactor, 0.82, 'minorCoverageFactor', 0.1, 2),
    coherenceExponent: finite(input.coherenceExponent, 1.25, 'coherenceExponent', 0.0001, 8),
    tensorSigma: finite(input.tensorSigma, 1.15, 'tensorSigma', 0.1, 8),
    alphaEpsilon: finite(input.alphaEpsilon, 1e-6, 'alphaEpsilon', 1e-9, 0.1),
    kernelSharpness: kernel.kernelSharpness,
    kernelTaperExponent: kernel.kernelTaperExponent,
    phaseConvention: kernel.phaseConvention,
    phaseConventionId: kernel.phaseConventionId,
    borderMode: kernel.borderMode,
    borderId: kernel.borderId,
    flags: Number(input.flags ?? 0) >>> 0,
    adaptivePolicy: input.adaptivePolicy && typeof input.adaptivePolicy === 'object' ? Object.freeze({ ...input.adaptivePolicy }) : null,
    qmapTexture: input.qmapTexture ?? input.qmapTex ?? null,
    retainTerminalInputs: Boolean(input.retainTerminalInputs),
  };
  return Object.freeze(normalized);
}

export function assertCanonicalLowpassBundleR7(bundle) {
  if (bundle?.parameterAbiId !== EWA_R6_ABI_ID || bundle?.parameterBytes !== EWA_R6_PARAM_BYTES) {
    throw stableError('E_R7_CANONICAL_ABI_MISMATCH', 'Shared lowpass bundle must use the 96-byte R6 ABI', { parameterAbiId: bundle?.parameterAbiId, parameterBytes: bundle?.parameterBytes });
  }
  if (bundle?.kernelId !== EWA_R6_KERNEL_ID || bundle?.kernelContractId !== EWA_R6_KERNEL_CONTRACT_ID) {
    throw stableError('E_R7_KERNEL_IDENTITY_MISMATCH', 'Shared lowpass bundle kernel identity mismatch');
  }
  if (bundle?.phaseConventionId !== EWA_R6_PHASE_ID || bundle?.borderId !== EWA_R6_BORDER_ID) {
    throw stableError('E_R7_KERNEL_IDENTITY_MISMATCH', 'Shared lowpass phase or border identity mismatch');
  }
  if (bundle?.axialFieldSchemaId !== EWA_R5_AXIAL_FIELD_SCHEMA_ID) {
    throw stableError('E_R7_AXIAL_FIELD_IDENTITY_MISMATCH', 'Shared lowpass bundle axial field identity mismatch');
  }
  if (bundle?.coordinateConventionId !== EWA_R4_COORDINATE_CONVENTION_ID) {
    throw stableError('E_R7_COORDINATE_IDENTITY_MISMATCH', 'Shared lowpass coordinate identity mismatch');
  }
  return Object.freeze({
    parameterAbiId: EWA_R6_ABI_ID,
    parameterBytes: EWA_R6_PARAM_BYTES,
    kernelId: EWA_R6_KERNEL_ID,
    kernelContractId: EWA_R6_KERNEL_CONTRACT_ID,
    phaseConventionId: EWA_R6_PHASE_ID,
    borderId: EWA_R6_BORDER_ID,
    tensorFieldMode: EWA_R5_TENSOR_FIELD_MODE,
  });
}

export function assertCanonicalLowpassNotCancelledR7(request, stageIndex) {
  if (request.abortSignal?.aborted || request.isCancelled?.()) {
    throw stableError('E_R7_CANCELLED', 'Canonical lowpass was cancelled', { stageIndex });
  }
}
