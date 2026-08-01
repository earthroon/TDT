// TDT-RESAMPLE-RUNTIME-01-R7
// Role-neutral deterministic stage planner for Preview and Export canonical EWA lowpass.

import {
  EWA_R6_KERNEL_CONTRACT_ID,
  EWA_R6_KERNEL_ID,
  EWA_R6_ABI_ID,
  EWA_R6_CONTRACT_DIGEST,
} from './ewa_aniso_params_v4.mjs';
import {
  EWA_R6_PHASE_ID,
  EWA_R6_BORDER_ID,
} from './ewa_kernel_contract_v4.mjs';
import {
  EWA_R5_AXIAL_FIELD_SCHEMA_ID,
  EWA_R5_AXIAL_INTERPOLATION_ID,
} from './ewa_axial_contract_r5.mjs';
import {
  EWA_R4_COORDINATE_CONVENTION_ID,
  EWA_R4_TILE_COVERAGE_PROOF_ID,
} from './ewa_tiled_profile_r6.mjs';

export const EWA_STAGE_PLANNER_R7_ID = 'tdt.ewa.multistage.planner.v2';
export const EWA_STAGE_PLANNER_R7_VERSION = 2;
export const EWA_STAGE_PLANNER_R7_PROFILE_ID = 'tdt.ewa.canonical-r6-support-profile.v1';
export const EWA_STAGE_PLANNER_R7_STAGE_LIMIT = 32;
export const EWA_STAGE_PLANNER_R7_MAX_RATIO_NUMERATOR = 2;
export const EWA_STAGE_PLANNER_R7_MAX_RATIO_DENOMINATOR = 1;
export const EWA_STAGE_PLANNER_R7_LATTICE_REACH = 6;

const LOWPASS_KEYS = Object.freeze([
  'sigmaMain', 'sigmaCross', 'shrinkClamp', 'maxAnisotropy', 'edgeLow', 'edgeHigh',
  'minorCoverageFactor', 'coherenceExponent', 'kernelSharpness', 'kernelTaperExponent',
  'tensorSigma', 'alphaEpsilon', 'adaptivePolicyDigest',
]);

function stableError(code, message, detail = null) {
  return Object.assign(new Error(message), { code, detail });
}
function positiveInt(value, name) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n <= 0) {
    throw stableError('E_R7_DIMENSION_INVALID', `${name} must be a positive safe integer`, { name, value });
  }
  return n;
}
function checkedMul(a, b) {
  const n = a * b;
  if (!Number.isSafeInteger(n)) throw stableError('E_R7_INTEGER_OVERFLOW', 'Planner integer overflow', { a, b });
  return n;
}
function ceilDiv(a, b) {
  return Math.floor((a + b - 1) / b);
}
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = canonicalize(value[key]);
    return out;
  }
  return value;
}
export function canonicalR7Json(value) { return JSON.stringify(canonicalize(value)); }
export async function sha256R7Text(text) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw stableError('E_R7_DIGEST_UNAVAILABLE', 'Web Crypto SHA-256 is required');
  const bytes = new TextEncoder().encode(String(text));
  const digest = await subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function normalizeR7LowpassParameters(parameters = {}) {
  const normalized = {};
  for (const key of LOWPASS_KEYS) {
    if (parameters[key] !== undefined) normalized[key] = parameters[key];
  }
  return Object.freeze(normalized);
}

function maximumAdmittedRatio(parameters) {
  const sigmaMain = Math.max(0.0001, Math.min(Number(parameters.shrinkClamp ?? 2.5), Number(parameters.sigmaMain ?? 1.25)));
  const sigmaCross = Math.max(0.0001, Number(parameters.sigmaCross ?? 0.65));
  const rootAnisotropy = Math.sqrt(Math.max(1, Number(parameters.maxAnisotropy ?? 3.0)));
  const byMajor = EWA_STAGE_PLANNER_R7_LATTICE_REACH / (sigmaMain * rootAnisotropy);
  const byMinor = EWA_STAGE_PLANNER_R7_LATTICE_REACH * rootAnisotropy / sigmaCross;
  return Math.min(EWA_STAGE_PLANNER_R7_MAX_RATIO_NUMERATOR / EWA_STAGE_PLANNER_R7_MAX_RATIO_DENOMINATOR, byMajor, byMinor);
}
function nextAxisDimension(current, target, parameters) {
  if (current === target) return target;
  const maxRatio = maximumAdmittedRatio(parameters);
  if (!Number.isFinite(maxRatio) || maxRatio <= 1.0) {
    throw stableError('E_R7_STAGE_SUPPORT_UNSATISFIED', 'Kernel parameters leave no downscale ratio within the R6 reach', { current, target, maxRatio });
  }
  let next = Math.max(target, Math.ceil(current / maxRatio));
  if (next >= current) next = current - 1;
  return Math.max(target, next);
}

function supportForStage(sourceWidth, sourceHeight, outputWidth, outputHeight, parameters) {
  const srcPerDstX = sourceWidth / outputWidth;
  const srcPerDstY = sourceHeight / outputHeight;
  const admitted = checkedMul(sourceWidth, EWA_STAGE_PLANNER_R7_MAX_RATIO_DENOMINATOR) <= checkedMul(outputWidth, EWA_STAGE_PLANNER_R7_MAX_RATIO_NUMERATOR)
    && checkedMul(sourceHeight, EWA_STAGE_PLANNER_R7_MAX_RATIO_DENOMINATOR) <= checkedMul(outputHeight, EWA_STAGE_PLANNER_R7_MAX_RATIO_NUMERATOR);
  const sigmaMain = Number(parameters.sigmaMain ?? 1.25);
  const sigmaCross = Number(parameters.sigmaCross ?? 0.65);
  const shrinkClamp = Number(parameters.shrinkClamp ?? 2.5);
  const maxAnisotropy = Number(parameters.maxAnisotropy ?? 3.0);
  const rootAnisotropy = Math.sqrt(Math.max(1, maxAnisotropy));
  const scale = Math.max(srcPerDstX, srcPerDstY, 1);
  const idealMajor = Math.min(shrinkClamp, Math.max(0.0001, sigmaMain)) * scale * rootAnisotropy;
  const idealMinor = Math.max(0.0001, sigmaCross) * scale / rootAnisotropy;
  const requiredReach = Math.ceil(Math.max(idealMajor, idealMinor));
  return Object.freeze({
    admitted: admitted && requiredReach <= EWA_STAGE_PLANNER_R7_LATTICE_REACH,
    srcPerDstX,
    srcPerDstY,
    idealMajor,
    idealMinor,
    requiredReach,
    latticeRadius: EWA_STAGE_PLANNER_R7_LATTICE_REACH,
  });
}

export function verifyR7StageAgainstPlan(stage, parameters = {}) {
  const support = supportForStage(stage.sourceWidth, stage.sourceHeight, stage.outputWidth, stage.outputHeight, normalizeR7LowpassParameters(parameters));
  if (!support.admitted) {
    throw stableError('E_R7_STAGE_SUPPORT_UNSATISFIED', 'Stage exceeds canonical R6 support profile', { stage, support });
  }
  return support;
}

export async function buildCanonicalEwaStagePlanR7(request) {
  if (!request || typeof request !== 'object') throw stableError('E_R7_REQUEST_INVALID', 'Planner request must be an object');
  if (request.profileId && request.profileId !== EWA_STAGE_PLANNER_R7_PROFILE_ID) {
    throw stableError('E_R7_LEGACY_PROFILE_REJECTED', 'Only the R7 canonical support profile is admitted', { profileId: request.profileId });
  }
  const sourceWidth = positiveInt(request.sourceWidth, 'sourceWidth');
  const sourceHeight = positiveInt(request.sourceHeight, 'sourceHeight');
  const targetWidth = positiveInt(request.targetWidth, 'targetWidth');
  const targetHeight = positiveInt(request.targetHeight, 'targetHeight');
  if (targetWidth > sourceWidth || targetHeight > sourceHeight) {
    throw stableError('E_R7_UPSCALE_NOT_ADMITTED', 'Canonical EWA planner does not admit upscaling', { sourceWidth, sourceHeight, targetWidth, targetHeight });
  }
  const parameters = normalizeR7LowpassParameters(request.parameters ?? {});
  const parameterDigest = await sha256R7Text(canonicalR7Json(parameters));
  const stages = [];
  let currentWidth = sourceWidth;
  let currentHeight = sourceHeight;
  while (currentWidth !== targetWidth || currentHeight !== targetHeight) {
    if (stages.length >= EWA_STAGE_PLANNER_R7_STAGE_LIMIT) {
      throw stableError('E_R7_STAGE_COUNT_LIMIT', 'Canonical stage count limit exceeded', { maximum: EWA_STAGE_PLANNER_R7_STAGE_LIMIT });
    }
    const outputWidth = nextAxisDimension(currentWidth, targetWidth, parameters);
    const outputHeight = nextAxisDimension(currentHeight, targetHeight, parameters);
    const support = supportForStage(currentWidth, currentHeight, outputWidth, outputHeight, parameters);
    if (!support.admitted) {
      throw stableError('E_R7_STAGE_SUPPORT_UNSATISFIED', 'No deterministic stage satisfies canonical R6 support', {
        currentWidth, currentHeight, outputWidth, outputHeight, support,
      });
    }
    stages.push(Object.freeze({
      stageIndex: stages.length,
      sourceWidth: currentWidth,
      sourceHeight: currentHeight,
      outputWidth,
      outputHeight,
      srcPerDstX: support.srcPerDstX,
      srcPerDstY: support.srcPerDstY,
      support,
    }));
    currentWidth = outputWidth;
    currentHeight = outputHeight;
  }
  const stageCount = stages.length;
  const finalizedStages = Object.freeze(stages.map((stage) => Object.freeze({ ...stage, stageCount })));
  const unsigned = Object.freeze({
    plannerId: EWA_STAGE_PLANNER_R7_ID,
    plannerVersion: EWA_STAGE_PLANNER_R7_VERSION,
    profileId: EWA_STAGE_PLANNER_R7_PROFILE_ID,
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
    parameterDigest,
    lowpassParameters: parameters,
    kernelContractId: EWA_R6_KERNEL_CONTRACT_ID,
    kernelContractDigest: EWA_R6_CONTRACT_DIGEST,
    kernelId: EWA_R6_KERNEL_ID,
    parameterAbiId: EWA_R6_ABI_ID,
    coordinateConventionId: EWA_R4_COORDINATE_CONVENTION_ID,
    tileCoverageProofId: EWA_R4_TILE_COVERAGE_PROOF_ID,
    axialFieldSchemaId: EWA_R5_AXIAL_FIELD_SCHEMA_ID,
    axialInterpolationId: EWA_R5_AXIAL_INTERPOLATION_ID,
    phaseConventionId: EWA_R6_PHASE_ID,
    borderId: EWA_R6_BORDER_ID,
    stageCount,
    stages: finalizedStages,
  });
  const planDigest = await sha256R7Text(canonicalR7Json(unsigned));
  return Object.freeze({ ...unsigned, planDigest });
}
