// TDT-RESAMPLE-RUNTIME-01-R7 convergence receipt and telemetry.
import { canonicalR7Json, sha256R7Text } from './ewa_stage_planner_v2.mjs';
import { EWA_R7_CONVERGENCE_SCHEMA_ID, EWA_R7_SHARED_RUNTIME_ID, EWA_R7_LOW_PASS_SEMANTIC_ID } from './ewa_canonical_lowpass_contract_r7.mjs';

const textureReceipts = new WeakMap();
const arrayReceipts = new WeakMap();
const telemetry = {
  lowpassPlanCount: 0, lowpassStageCount: 0, previewDelegationCount: 0, exportDelegationCount: 0,
  intermediateReadbackCount: 0, previewReadbackAttemptCount: 0, residualExecutionCount: 0,
  residualDisabledCount: 0, residualIntermediateAttemptCount: 0, residualFeedbackAttemptCount: 0,
  finalizationCount: 0, terminalReadbackCount: 0, failureCount: 0, cancellationCount: 0,
};

function freezeStages(stages) { return Object.freeze(stages.map((stage) => Object.freeze({ ...stage }))); }
export function beginR7Convergence(plan, consumerEnvelope) {
  telemetry.lowpassPlanCount += 1;
  if (consumerEnvelope === 'preview') telemetry.previewDelegationCount += 1;
  if (consumerEnvelope === 'export') telemetry.exportDelegationCount += 1;
  return { plan, consumerEnvelope, stages: [], startedAt: Date.now() };
}
export function appendR7LowpassStage(chain, stageReceipt) {
  const receipt = Object.freeze({ ...stageReceipt, lowpassSemanticId: EWA_R7_LOW_PASS_SEMANTIC_ID, ordinal: chain.stages.length });
  chain.stages.push(receipt);
  telemetry.lowpassStageCount += 1;
  return receipt;
}
export async function finalizeR7LowpassReceipt(chain, extra = {}) {
  const canonical = {
    schemaId: EWA_R7_CONVERGENCE_SCHEMA_ID,
    plannerId: chain.plan.plannerId,
    plannerVersion: chain.plan.plannerVersion,
    plannerProfileId: chain.plan.profileId,
    planDigest: chain.plan.planDigest,
    parameterDigest: chain.plan.parameterDigest,
    sharedRuntimeId: EWA_R7_SHARED_RUNTIME_ID,
    lowpassSemanticId: EWA_R7_LOW_PASS_SEMANTIC_ID,
    kernelId: chain.plan.kernelId,
    kernelContractId: chain.plan.kernelContractId,
    kernelContractDigest: chain.plan.kernelContractDigest,
    parameterAbiId: chain.plan.parameterAbiId,
    coordinateConventionId: chain.plan.coordinateConventionId,
    axialFieldSchemaId: chain.plan.axialFieldSchemaId,
    phaseConventionId: chain.plan.phaseConventionId,
    borderId: chain.plan.borderId,
    sourceWidth: chain.plan.sourceWidth,
    sourceHeight: chain.plan.sourceHeight,
    targetWidth: chain.plan.targetWidth,
    targetHeight: chain.plan.targetHeight,
    stageCount: chain.plan.stageCount,
    stages: freezeStages(chain.stages),
  };
  const receiptDigest = await sha256R7Text(canonicalR7Json(canonical));
  const receipt = Object.freeze({ ...canonical, receiptDigest, startedAt: chain.startedAt, completedAt: Date.now(), ...extra });
  if (extra.outputTexture) textureReceipts.set(extra.outputTexture, receipt);
  return receipt;
}
export function failR7Convergence(error, cancelled = false) {
  if (cancelled) telemetry.cancellationCount += 1; else telemetry.failureCount += 1;
  return Object.freeze({ failureCode: String(error?.code ?? 'E_R7_UNKNOWN_FAILURE'), cancelled });
}
export function bindR7ArrayReceipt(array, receipt) { if (array) arrayReceipts.set(array, receipt); }
export function getR7TextureReceipt(texture) { return textureReceipts.get(texture) ?? null; }
export function getR7ArrayReceipt(array) { return arrayReceipts.get(array) ?? null; }
export function incrementR7Telemetry(name, amount = 1) {
  if (!(name in telemetry)) throw Object.assign(new Error(`Unknown R7 telemetry field: ${name}`), { code: 'E_R7_TELEMETRY_FIELD_UNKNOWN' });
  telemetry[name] += amount;
}
export function getR7Telemetry() { return Object.freeze({ ...telemetry }); }
