// TDT-RESAMPLE-RUNTIME-01-R1B
// Deterministic integer-only EWA stage planner shared by DeltaK and Export.

export const EWA_STAGE_PLANNER_ID = 'tdt.ewa.multistage.planner.v1';
export const EWA_STAGE_PLANNER_VERSION = 1;
export const EWA_STAGE_COUNT_LIMIT = 32;

export const EWA_STAGE_PROFILES = Object.freeze({
  'delta-k-tiled-v2': Object.freeze({
    profileId: 'delta-k-tiled-v2',
    maxRatioNumerator: 2,
    maxRatioDenominator: 1,
    latticeRadius: 6,
  }),
  'export-ewa-7x7-v1': Object.freeze({
    profileId: 'export-ewa-7x7-v1',
    maxRatioNumerator: 3,
    maxRatioDenominator: 2,
    latticeRadius: 3,
  }),
});

function stableError(code, message, detail = null) {
  return Object.assign(new Error(message), { code, detail });
}

function positiveInt(value, name) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n <= 0) {
    throw stableError('E_R1B_DIMENSION_INVALID', `${name} must be a positive safe integer`, { name, value });
  }
  return n;
}

function checkedMul(a, b, code = 'E_R1B_INTEGER_OVERFLOW') {
  const result = a * b;
  if (!Number.isSafeInteger(result)) throw stableError(code, 'Integer multiplication overflow', { a, b });
  return result;
}

function ceilDiv(a, b) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a < 0 || b <= 0) {
    throw stableError('E_R1B_INTEGER_INVALID', 'ceilDiv inputs are invalid', { a, b });
  }
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

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

async function sha256Text(text) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw stableError('E_R1B_DIGEST_UNAVAILABLE', 'Web Crypto SHA-256 is required for stage-plan identity');
  const bytes = new TextEncoder().encode(text);
  const digest = await subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function terminalDiscreteAxis(source, target, profile) {
  return profile.profileId === 'export-ewa-7x7-v1' && target === 1 && source <= 3;
}

function axisAdmitted(source, target, profile) {
  if (source === target) return Object.freeze({ admitted: true, ratio: 1, terminalDiscreteAxis: false });
  const ratioNumerator = source;
  const ratioDenominator = target;
  const withinRatio = checkedMul(source, profile.maxRatioDenominator) <= checkedMul(target, profile.maxRatioNumerator);
  const terminal = terminalDiscreteAxis(source, target, profile);
  return Object.freeze({ admitted: withinRatio || terminal, ratio: source / target, terminalDiscreteAxis: terminal && !withinRatio });
}

function stageSupport(sourceWidth, sourceHeight, targetWidth, targetHeight, profile, parameters) {
  const x = axisAdmitted(sourceWidth, targetWidth, profile);
  const y = axisAdmitted(sourceHeight, targetHeight, profile);
  let requiredMajorRadius = 0;
  let requiredMinorRadius = 0;
  if (profile.profileId === 'export-ewa-7x7-v1') {
    const ratio = Math.max(x.ratio, y.ratio);
    const radiusMul = Number(parameters.radiusMul ?? 1.9);
    const sigma = Number(parameters.sigma ?? 1.05);
    const unclampedMajor = Math.max(1, ratio * Math.max(1, radiusMul));
    const unclampedMinor = Math.max(0.75, ratio * Math.min(2.4, Math.max(0.55, sigma)));
    requiredMajorRadius = Math.min(profile.latticeRadius, unclampedMajor);
    requiredMinorRadius = Math.min(profile.latticeRadius, unclampedMinor);
  } else {
    const sigmaMain = Number(parameters.sigmaMain ?? 1.25);
    const sigmaCross = Number(parameters.sigmaCross ?? 0.65);
    const shrinkClamp = Number(parameters.shrinkClamp ?? 2.5);
    requiredMajorRadius = Math.min(profile.latticeRadius, Math.max(0.0001, Math.min(shrinkClamp, sigmaMain)) * 2);
    requiredMinorRadius = Math.min(profile.latticeRadius, Math.max(0.0001, Math.min(shrinkClamp, sigmaCross)) * 2);
  }
  return Object.freeze({
    admitted: x.admitted && y.admitted && requiredMajorRadius <= profile.latticeRadius && requiredMinorRadius <= profile.latticeRadius,
    srcPerDstX: x.ratio,
    srcPerDstY: y.ratio,
    requiredMajorRadius,
    requiredMinorRadius,
    latticeRadius: profile.latticeRadius,
    terminalDiscreteAxisX: x.terminalDiscreteAxis,
    terminalDiscreteAxisY: y.terminalDiscreteAxis,
  });
}

function nextAxisDimension(current, target, profile) {
  if (current === target) return target;
  const scaled = checkedMul(current, profile.maxRatioDenominator);
  let next = Math.max(target, ceilDiv(scaled, profile.maxRatioNumerator));
  if (next >= current) next = current - 1;
  if (next < target) next = target;
  return next;
}

export function getEwaStageProfile(profileId) {
  const profile = EWA_STAGE_PROFILES[profileId];
  if (!profile) throw stableError('E_R1B_PROFILE_UNKNOWN', 'Unknown EWA stage profile', { profileId });
  return profile;
}

export async function buildEwaStagePlan(request) {
  if (!request || typeof request !== 'object') throw stableError('E_R1B_REQUEST_INVALID', 'Stage-plan request must be an object');
  const sourceWidth = positiveInt(request.sourceWidth, 'sourceWidth');
  const sourceHeight = positiveInt(request.sourceHeight, 'sourceHeight');
  const targetWidth = positiveInt(request.targetWidth, 'targetWidth');
  const targetHeight = positiveInt(request.targetHeight, 'targetHeight');
  if (targetWidth > sourceWidth || targetHeight > sourceHeight) {
    throw stableError('E_R1B_UPSCALE_NOT_ADMITTED', 'EWA stage planner does not admit upscaling', { sourceWidth, sourceHeight, targetWidth, targetHeight });
  }
  const profile = getEwaStageProfile(request.profileId);
  const parameters = Object.freeze({ ...(request.parameters ?? {}) });
  const parameterDigest = await sha256Text(canonicalJson(parameters));

  const stages = [];
  let currentWidth = sourceWidth;
  let currentHeight = sourceHeight;
  while (currentWidth !== targetWidth || currentHeight !== targetHeight) {
    if (stages.length >= EWA_STAGE_COUNT_LIMIT) {
      throw stableError('E_R1B_STAGE_COUNT_LIMIT', 'EWA stage count exceeds the canonical maximum', { maximum: EWA_STAGE_COUNT_LIMIT });
    }
    let outputWidth = nextAxisDimension(currentWidth, targetWidth, profile);
    let outputHeight = nextAxisDimension(currentHeight, targetHeight, profile);
    let support = stageSupport(currentWidth, currentHeight, outputWidth, outputHeight, profile, parameters);

    // Integer grids cannot refine 2 -> 1 below a 1.5 ratio. The export 7x7
    // profile admits this terminal step only when the entire tiny source axis
    // fits in the physical lattice, and records that exception explicitly.
    if (!support.admitted) {
      throw stableError('E_R1B_STAGE_SUPPORT_UNSATISFIED', 'No deterministic integer stage satisfies the kernel support profile', {
        profileId: profile.profileId,
        currentWidth,
        currentHeight,
        outputWidth,
        outputHeight,
        support,
      });
    }

    stages.push({
      stageIndex: stages.length,
      sourceWidth: currentWidth,
      sourceHeight: currentHeight,
      outputWidth,
      outputHeight,
      srcPerDstX: support.srcPerDstX,
      srcPerDstY: support.srcPerDstY,
      support,
    });
    currentWidth = outputWidth;
    currentHeight = outputHeight;
  }

  const stageCount = stages.length;
  const finalizedStages = stages.map((stage) => Object.freeze({ ...stage, stageCount }));
  const unsigned = {
    plannerId: EWA_STAGE_PLANNER_ID,
    plannerVersion: EWA_STAGE_PLANNER_VERSION,
    profileId: profile.profileId,
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
    parameterDigest,
    stageCount,
    stages: finalizedStages,
  };
  const planDigest = await sha256Text(canonicalJson(unsigned));
  return Object.freeze({ ...unsigned, stages: Object.freeze(finalizedStages), planDigest });
}

export function verifyStageAgainstPlan(stage, profileId, parameters = {}) {
  const profile = getEwaStageProfile(profileId);
  const support = stageSupport(stage.sourceWidth, stage.sourceHeight, stage.outputWidth, stage.outputHeight, profile, parameters);
  if (!support.admitted) throw stableError('E_R1B_STAGE_SUPPORT_UNSATISFIED', 'Stage no longer satisfies its sealed support profile', { stage, profileId, support });
  return support;
}
