import {
  EWA_R1A_MAX_SHRINK_CLAMP,
  EWA_R1A_MAX_SIGMA,
  EWA_R1A_TILE,
} from './ewa_aniso_params.mjs';
import { incrementEwaR1ATelemetry } from './ewa_aniso_runtime_receipt.mjs';

export const EWA_R1A_CONSUMER_ID = 'dadum.gpu.consumer.qmap-runtime';
const textureMetadata = new WeakMap();
let generatedJobSequence = 0;

const ALIASES = Object.freeze({
  srcTex: ['srcTex', 'qmapTex', 'inputTex', 'sourceTex', 'texQmap'],
  tensorTex: ['tensorTex', 'texTensor', 'structureTensorTex'],
  runDeltaKCore: ['runDeltaKCore', 'deltaKCore', 'runCore'],
  scale: ['scale', 'downscale', 'downscaleScale'],
  sigmaMain: ['sigmaMain', 'sigmaPara', 'majorSigma'],
  sigmaCross: ['sigmaCross', 'sigmaPerp', 'minorSigma'],
  shrinkClamp: ['shrinkClamp', 'sigmaClamp', 'maxSigma'],
  runtimeEpoch: ['runtimeEpoch'],
  deviceEpoch: ['deviceEpoch'],
  jobId: ['jobId', 'requestId'],
  sourceWidth: ['sourceWidth', 'inW', 'width'],
  sourceHeight: ['sourceHeight', 'inH', 'height'],
  outputWidth: ['outputWidth', 'outW', 'targetWidth'],
  outputHeight: ['outputHeight', 'outH', 'targetHeight'],
  abortSignal: ['abortSignal', 'signal'],
  isCancelled: ['isCancelled', 'cancelled'],
  tensorMode: ['tensorMode'],
  tensorSigma: ['tensorSigma'],
  alphaEpsilon: ['alphaEpsilon'],
  edgeLow: ['edgeLow'],
  edgeHigh: ['edgeHigh'],
  maxAnisotropy: ['maxAnisotropy'],
  minorCoverageFactor: ['minorCoverageFactor'],
  coherenceExponent: ['coherenceExponent'],
  kernelSharpness: ['kernelSharpness'],
  sourceDomain: ['sourceDomain'],
});

function stableError(code, message, detail = null) {
  return Object.assign(new Error(message), { code, detail });
}

function valuesEqual(a, b) { return Object.is(a, b); }

function resolveAlias(input, canonicalName) {
  const present = ALIASES[canonicalName].filter((name) => Object.prototype.hasOwnProperty.call(input, name) && input[name] !== undefined);
  if (!present.length) return undefined;
  const value = input[present[0]];
  for (const name of present.slice(1)) {
    if (!valuesEqual(value, input[name])) {
      incrementEwaR1ATelemetry('legacyAmbiguityRejectCount');
      throw stableError('E_R1A_AMBIGUOUS_LEGACY_ALIAS', `Conflicting aliases for ${canonicalName}`, { canonicalName, aliases: present });
    }
  }
  if (present[0] !== canonicalName || present.length > 1) incrementEwaR1ATelemetry('legacyAliasNormalizationCount');
  return value;
}

function normalizeInputObject(input) {
  const out = {};
  for (const key of Object.keys(ALIASES)) out[key] = resolveAlias(input, key);
  for (const key of ['device', 'pipes', 'flags', 'stageIndex', 'stageCount']) {
    if (input[key] !== undefined) out[key] = input[key];
  }
  return out;
}

export function registerEwaTextureMetadata(texture, metadata) {
  if (!texture || (typeof texture !== 'object' && typeof texture !== 'function')) throw stableError('E_R1A_TEXTURE_METADATA_INVALID', 'Texture metadata target is invalid');
  const width = Number(metadata.width);
  const height = Number(metadata.height);
  if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) throw stableError('E_R1A_TEXTURE_METADATA_INVALID', 'Texture dimensions are invalid', { width, height });
  textureMetadata.set(texture, Object.freeze({ ...metadata, width, height }));
  return texture;
}

export function getEwaTextureMetadata(texture) { return textureMetadata.get(texture) ?? null; }

function legacyDimension(texture, axis) {
  if (!texture) return null;
  const direct = Number(texture[axis]);
  if (Number.isSafeInteger(direct) && direct > 0) return direct;
  const index = axis === 'width' ? 0 : 1;
  const sizeValue = Array.isArray(texture.size) || ArrayBuffer.isView(texture.size) ? Number(texture.size[index]) : Number(texture.size?.[index]);
  return Number.isSafeInteger(sizeValue) && sizeValue > 0 ? sizeValue : null;
}

function exactPositiveInt(value, code, name) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n <= 0) throw stableError(code, `${name} must be a positive safe integer`, { name, value });
  return n;
}

function resolveDimensions(request) {
  const metadata = getEwaTextureMetadata(request.srcTex);
  const sourceWidth = Number(metadata?.width ?? request.sourceWidth ?? legacyDimension(request.srcTex, 'width'));
  const sourceHeight = Number(metadata?.height ?? request.sourceHeight ?? legacyDimension(request.srcTex, 'height'));
  if (!Number.isSafeInteger(sourceWidth) || sourceWidth <= 0 || !Number.isSafeInteger(sourceHeight) || sourceHeight <= 0) {
    throw stableError('E_R1A_SOURCE_DIMENSION_UNKNOWN', 'Source texture dimensions are unavailable');
  }

  const hasScale = request.scale !== undefined && request.scale !== null;
  const hasExplicitWidth = request.outputWidth !== undefined && request.outputWidth !== null;
  const hasExplicitHeight = request.outputHeight !== undefined && request.outputHeight !== null;
  if (hasExplicitWidth !== hasExplicitHeight) throw stableError('E_R1B_TARGET_DIMENSION_INCOMPLETE', 'Both output dimensions are required together');

  let scale = null;
  let expectedWidth = null;
  let expectedHeight = null;
  if (hasScale) {
    scale = Number(request.scale);
    if (!Number.isFinite(scale) || scale <= 0) throw stableError('E_R1A_PARAMETER_NONFINITE', 'Scale must be finite and positive', { scale });
    if (scale > 1.0) throw stableError('E_R1B_UPSCALE_NOT_ADMITTED', 'R1B downscale path does not admit upscaling', { scale });
    expectedWidth = Math.max(1, Math.floor(sourceWidth * scale));
    expectedHeight = Math.max(1, Math.floor(sourceHeight * scale));
  }

  let outputWidth;
  let outputHeight;
  if (hasExplicitWidth) {
    outputWidth = exactPositiveInt(request.outputWidth, 'E_R1B_TARGET_DIMENSION_INVALID', 'outputWidth');
    outputHeight = exactPositiveInt(request.outputHeight, 'E_R1B_TARGET_DIMENSION_INVALID', 'outputHeight');
    if (outputWidth > sourceWidth || outputHeight > sourceHeight) throw stableError('E_R1B_UPSCALE_NOT_ADMITTED', 'Explicit output dimensions upscale the source', { sourceWidth, sourceHeight, outputWidth, outputHeight });
    if (hasScale && (outputWidth !== expectedWidth || outputHeight !== expectedHeight)) {
      throw stableError('E_R1A_OUTPUT_DIMENSION_MISMATCH', 'Explicit output dimensions disagree with scale', { expectedWidth, expectedHeight, outputWidth, outputHeight });
    }
  } else {
    if (!hasScale) scale = 0.5;
    if (expectedWidth == null) {
      expectedWidth = Math.max(1, Math.floor(sourceWidth * scale));
      expectedHeight = Math.max(1, Math.floor(sourceHeight * scale));
    }
    outputWidth = expectedWidth;
    outputHeight = expectedHeight;
  }

  return {
    sourceWidth,
    sourceHeight,
    outputWidth,
    outputHeight,
    scale: scale ?? (outputWidth / sourceWidth),
    scaleX: outputWidth / sourceWidth,
    scaleY: outputHeight / sourceHeight,
  };
}

function finiteRange(value, fallback, min, max, name) {
  const number = Number(value ?? fallback);
  if (!Number.isFinite(number)) throw stableError('E_R1A_PARAMETER_NONFINITE', `${name} is non-finite`, { name, value });
  if (number < min || number > max) throw stableError('E_R1A_PARAMETER_RANGE', `${name} is outside the admitted range`, { name, number, min, max });
  return number;
}

export function normalizeDeltaKStackRequest(arg0, arg1, arg2) {
  let input;
  let abi;
  if (arguments.length === 1 && arg0 && typeof arg0 === 'object' && ('device' in arg0 || 'pipes' in arg0 || 'srcTex' in arg0)) {
    input = normalizeInputObject(arg0);
    input.device = arg0.device;
    input.pipes = arg0.pipes;
    abi = 'canonical-object';
    incrementEwaR1ATelemetry('canonicalObjectCallCount');
  } else {
    if (!arg2 || typeof arg2 !== 'object') throw stableError('E_R1A_LEGACY_FRAME_INPUTS_INVALID', 'Legacy frameInputs must be an object');
    input = normalizeInputObject(arg2);
    input.device = arg0;
    input.pipes = arg1;
    abi = 'legacy-positional';
    incrementEwaR1ATelemetry('legacyPositionalCallCount');
  }

  if (!input.device) throw stableError('E_R1A_DEVICE_MISSING', 'GPU device is required');
  if (!input.pipes?.pipeEWA) throw stableError('E_R1A_PIPELINE_NOT_READY', 'DeltaK EWA pipeline is not initialized');
  if (!input.srcTex) throw stableError('E_R1A_SOURCE_TEXTURE_MISSING', 'Source texture is required');
  const requestedTensorMode = input.tensorMode === 'legacy-external-v1' || abi === 'legacy-positional'
    ? 'legacy-external-v1'
    : 'canonical-stage-local-r1c';
  if (requestedTensorMode === 'legacy-external-v1' && !input.tensorTex) {
    throw stableError('E_R1A_TENSOR_TEXTURE_MISSING', 'Legacy external tensor texture is required');
  }

  const dimensions = resolveDimensions(input);
  const sigmaMain = finiteRange(input.sigmaMain, 1.25, 0.0001, EWA_R1A_MAX_SIGMA, 'sigmaMain');
  const sigmaCross = finiteRange(input.sigmaCross, 0.65, 0.0001, EWA_R1A_MAX_SIGMA, 'sigmaCross');
  const shrinkClamp = finiteRange(input.shrinkClamp, 2.5, 1.0, EWA_R1A_MAX_SHRINK_CLAMP, 'shrinkClamp');
  const runtimeEpoch = Number(input.runtimeEpoch ?? 0);
  const deviceEpoch = Number(input.deviceEpoch ?? 0);
  const jobId = String(input.jobId ?? `r1b-job-${String(++generatedJobSequence).padStart(8, '0')}`);

  return Object.freeze({
    abi,
    device: input.device,
    pipes: input.pipes,
    srcTex: input.srcTex,
    tensorTex: input.tensorTex,
    runDeltaKCore: typeof input.runDeltaKCore === 'function' ? input.runDeltaKCore : null,
    scale: dimensions.scale,
    scaleX: dimensions.scaleX,
    scaleY: dimensions.scaleY,
    sigmaMain,
    sigmaCross,
    shrinkClamp,
    runtimeEpoch: Number.isSafeInteger(runtimeEpoch) && runtimeEpoch >= 0 ? runtimeEpoch : 0,
    deviceEpoch: Number.isSafeInteger(deviceEpoch) && deviceEpoch >= 0 ? deviceEpoch : 0,
    jobId,
    sourceWidth: dimensions.sourceWidth,
    sourceHeight: dimensions.sourceHeight,
    outputWidth: dimensions.outputWidth,
    outputHeight: dimensions.outputHeight,
    stageIndex: Number(input.stageIndex ?? 0) >>> 0,
    stageCount: Number(input.stageCount ?? 1) >>> 0,
    flags: Number(input.flags ?? 0) >>> 0,
    abortSignal: input.abortSignal ?? null,
    isCancelled: typeof input.isCancelled === 'function' ? input.isCancelled : null,
    executionMode: 'tiled-v2-multistage',
    tensorMode: requestedTensorMode,
    tensorSigma: finiteRange(input.tensorSigma, 1.15, 0.60, 2.00, 'tensorSigma'),
    alphaEpsilon: finiteRange(input.alphaEpsilon, 1e-6, 1e-8, 1e-3, 'alphaEpsilon'),
    edgeLow: finiteRange(input.edgeLow, 0.025, 0.0, 1.0, 'edgeLow'),
    edgeHigh: finiteRange(input.edgeHigh, 0.22, 0.0, 1.0, 'edgeHigh'),
    maxAnisotropy: finiteRange(input.maxAnisotropy, 3.0, 1.0, 4.0, 'maxAnisotropy'),
    minorCoverageFactor: finiteRange(input.minorCoverageFactor, 0.82, 0.75, 1.0, 'minorCoverageFactor'),
    coherenceExponent: finiteRange(input.coherenceExponent, 1.25, 0.25, 4.0, 'coherenceExponent'),
    kernelSharpness: finiteRange(input.kernelSharpness, 1.65, 0.25, 4.0, 'kernelSharpness'),
    sourceDomain: input.sourceDomain === 'encoded-srgb' ? 'encoded-srgb' : 'declared-linear',
    legacyTensorInputPresent: Boolean(input.tensorTex),
    qmapTex: input.qmapTex ?? input.qmap ?? null,
    adaptivePolicy: input.adaptivePolicy && typeof input.adaptivePolicy === 'object' ? Object.freeze({ ...input.adaptivePolicy }) : null,
  });
}

export function assertEwaRequestNotCancelled(request, stageIndex = null) {
  const cancelled = Boolean(request.abortSignal?.aborted || request.isCancelled?.());
  if (cancelled) throw stableError('E_R1B_CANCELLED', 'EWA multistage request was cancelled', { jobId: request.jobId, stageIndex });
}

export async function validateEwaDeviceOwnership(request) {
  const bridge = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__;
  if (!bridge || typeof bridge.getCurrentIdentity !== 'function' || typeof bridge.acquireLease !== 'function') {
    throw stableError('E_R1A_GPU_AUTHORITY_UNAVAILABLE', 'GPU Authority bridge is required');
  }
  const identity = bridge.getCurrentIdentity();
  if (identity.state !== 'ACTIVE') throw stableError('E_R1A_GPU_AUTHORITY_NOT_ACTIVE', 'GPU Authority is not active', { state: identity.state });
  if (request.runtimeEpoch && request.runtimeEpoch !== identity.runtimeEpoch) throw stableError('E_R1A_STALE_RUNTIME_EPOCH', 'Runtime epoch mismatch', { request: request.runtimeEpoch, current: identity.runtimeEpoch });
  if (request.deviceEpoch && request.deviceEpoch !== identity.deviceEpoch) throw stableError('E_R1A_STALE_PIPELINE_EPOCH', 'Device epoch mismatch', { request: request.deviceEpoch, current: identity.deviceEpoch });
  const lease = await bridge.acquireLease(EWA_R1A_CONSUMER_ID, `delta-k-ewa-r1b:${request.jobId}`);
  try {
    lease.assertCurrent();
    if (lease.device !== request.device) throw stableError('E_R1A_DEVICE_IDENTITY_MISMATCH', 'Caller device is not the current GPU Authority device');
    return Object.freeze({ runtimeEpoch: lease.runtimeEpoch, deviceEpoch: lease.deviceEpoch, deviceIdentity: lease.deviceIdentity });
  } finally {
    lease.release();
  }
}

export function assertEwaWorkgroupStorage(device) {
  const available = Number(device?.limits?.maxComputeWorkgroupStorageSize ?? 0);
  if (!Number.isFinite(available) || available < EWA_R1A_TILE.bytes) throw stableError('E_R1A_WORKGROUP_STORAGE_LIMIT', 'Insufficient workgroup storage', { required: EWA_R1A_TILE.bytes, available });
}
