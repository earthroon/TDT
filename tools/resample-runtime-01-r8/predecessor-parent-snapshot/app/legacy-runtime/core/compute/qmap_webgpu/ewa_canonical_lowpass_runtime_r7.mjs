// TDT-RESAMPLE-RUNTIME-01-R7 shared canonical EWA lowpass executor.
// No Preview/Export role branch is permitted in pixel math.

import { dispatchEWAAniso } from './ewa_aniso_tile.mjs';
import { buildStageLocalTensorR1C } from './structure_tensor_runtime.mjs';
import { buildAdaptivePolicyFieldR1D } from './adaptive_policy_r1d_runtime.mjs';
import { registerEwaTextureMetadata } from './ewa_aniso_contract.mjs';
import { EWA_R5_TENSOR_FIELD_MODE } from './ewa_axial_contract_r5.mjs';
import { buildCanonicalEwaStagePlanR7, verifyR7StageAgainstPlan } from './ewa_stage_planner_v2.mjs';
import {
  normalizeCanonicalLowpassRequestR7,
  assertCanonicalLowpassBundleR7,
  assertCanonicalLowpassNotCancelledR7,
  EWA_R7_SHARED_RUNTIME_ID,
  EWA_R7_SHARED_STAGE_ID,
} from './ewa_canonical_lowpass_contract_r7.mjs';
import {
  beginR7Convergence,
  appendR7LowpassStage,
  finalizeR7LowpassReceipt,
  failR7Convergence,
} from './ewa_convergence_receipt_r7.mjs';

function stableError(code, message, detail = null) { return Object.assign(new Error(message), { code, detail }); }
function currentIdentity() {
  const bridge = globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__;
  if (!bridge?.getCurrentIdentity) throw stableError('E_R7_GPU_AUTHORITY_UNAVAILABLE', 'GPU Authority identity is unavailable');
  const identity = bridge.getCurrentIdentity();
  if (identity.state !== 'ACTIVE') throw stableError('E_R7_GPU_AUTHORITY_NOT_ACTIVE', 'GPU Authority is not active', identity);
  return identity;
}
function assertEpoch(request) {
  const identity = currentIdentity();
  if (request.pipeBundle.runtimeEpoch !== identity.runtimeEpoch || request.pipeBundle.deviceEpoch !== identity.deviceEpoch || request.pipeBundle.deviceIdentity !== identity.deviceIdentity) {
    throw stableError('E_R7_STALE_RESOURCE_EPOCH', 'Canonical lowpass bundle belongs to a stale GPU epoch', {
      bundleRuntimeEpoch: request.pipeBundle.runtimeEpoch,
      bundleDeviceEpoch: request.pipeBundle.deviceEpoch,
      currentRuntimeEpoch: identity.runtimeEpoch,
      currentDeviceEpoch: identity.deviceEpoch,
    });
  }
  return identity;
}
function createStageTexture(request, stage, identity) {
  const usage = globalThis.GPUTextureUsage ?? { COPY_SRC: 0x01, TEXTURE_BINDING: 0x04, STORAGE_BINDING: 0x08 };
  const texture = request.device.createTexture({
    label: `tdt.r7.lowpass:${request.jobId}:stage-${stage.stageIndex + 1}-of-${stage.stageCount}`,
    size: { width: stage.outputWidth, height: stage.outputHeight, depthOrArrayLayers: 1 },
    dimension: '2d', format: 'rgba16float', mipLevelCount: 1, sampleCount: 1,
    usage: usage.STORAGE_BINDING | usage.TEXTURE_BINDING | usage.COPY_SRC,
  });
  registerEwaTextureMetadata(texture, {
    width: stage.outputWidth, height: stage.outputHeight, format: 'rgba16float',
    runtimeEpoch: identity.runtimeEpoch, deviceEpoch: identity.deviceEpoch, deviceIdentity: identity.deviceIdentity,
    owner: EWA_R7_SHARED_RUNTIME_ID, jobId: request.jobId, stageIndex: stage.stageIndex, stageCount: stage.stageCount,
    semanticId: 'tdt.ewa.canonical-lowpass.r7.v1', residualOutput: false,
  });
  return texture;
}

export async function executeCanonicalEwaLowpassR7(rawRequest) {
  const request = normalizeCanonicalLowpassRequestR7(rawRequest);
  const bundleIdentity = assertCanonicalLowpassBundleR7(request.pipeBundle);
  const identity = assertEpoch(request);
  const lowpassParameters = {
    sigmaMain: request.sigmaMain, sigmaCross: request.sigmaCross, shrinkClamp: request.shrinkClamp,
    maxAnisotropy: request.maxAnisotropy, edgeLow: request.edgeLow, edgeHigh: request.edgeHigh,
    minorCoverageFactor: request.minorCoverageFactor, coherenceExponent: request.coherenceExponent,
    kernelSharpness: request.kernelSharpness, kernelTaperExponent: request.kernelTaperExponent,
    tensorSigma: request.tensorSigma, alphaEpsilon: request.alphaEpsilon,
    adaptivePolicyDigest: request.adaptivePolicy?.policyDigest ?? null,
  };
  const plan = await buildCanonicalEwaStagePlanR7({
    sourceWidth: request.sourceWidth, sourceHeight: request.sourceHeight,
    targetWidth: request.targetWidth, targetHeight: request.targetHeight,
    parameters: lowpassParameters,
  });
  const chain = beginR7Convergence(plan, request.consumerEnvelope);
  const ownedTextures = new Set();
  const destroyedTextures = new Set();
  const destroyOwned = (texture) => {
    if (!texture || !ownedTextures.has(texture) || destroyedTextures.has(texture)) return;
    destroyedTextures.add(texture);
    try { texture.destroy?.(); } catch { /* one disposal attempt */ }
  };
  let currentTexture = request.sourceTexture;
  let currentOwned = false;
  let retainedSourceTexture = null;
  let retainedSourceOwned = false;
  let retainedTensorHandle = null;
  let retainedReleased = false;
  const releaseRetained = () => {
    if (retainedReleased) return;
    retainedReleased = true;
    retainedTensorHandle?.release?.();
    retainedTensorHandle = null;
    if (retainedSourceOwned) destroyOwned(retainedSourceTexture);
    retainedSourceTexture = null;
  };

  try {
    if (plan.stageCount === 0) {
      assertCanonicalLowpassNotCancelledR7(request, 0);
      const receipt = await finalizeR7LowpassReceipt(chain, {
        outputTexture: request.sourceTexture,
        outputFormat: request.sourceFormat,
        identityCopy: true,
        consumerEnvelope: request.consumerEnvelope,
        intermediateReadbackCount: 0,
        sharedStageId: EWA_R7_SHARED_STAGE_ID,
      });
      return Object.freeze({
        terminalTexture: request.sourceTexture,
        terminalWidth: request.sourceWidth,
        terminalHeight: request.sourceHeight,
        terminalFormat: request.sourceFormat,
        plan,
        lowpassReceipt: receipt,
        retainedSourceTexture: null,
        retainedAxialTexture: null,
        releaseRetained,
        destroyTerminal: () => {},
      });
    }

    for (const stage of plan.stages) {
      assertCanonicalLowpassNotCancelledR7(request, stage.stageIndex);
      const stageIdentity = assertEpoch(request);
      const support = verifyR7StageAgainstPlan(stage, lowpassParameters);
      const outputTexture = createStageTexture(request, stage, stageIdentity);
      ownedTextures.add(outputTexture);
      let tensorHandle = null;
      let adaptiveHandle = null;
      try {
        tensorHandle = await buildStageLocalTensorR1C(request.device, request.pipeBundle.tensorR1C, {
          sourceTexture: currentTexture,
          sourceSurfaceId: request.sourceSurfaceId,
          sourceRevision: request.sourceRevision,
          sourceFormat: stage.stageIndex === 0 ? request.sourceFormat : 'rgba16float',
          cancellationEpoch: request.cancellationEpoch,
          producerRequestSequence: stage.stageIndex + 1,
          width: stage.sourceWidth, height: stage.sourceHeight,
          stageIndex: stage.stageIndex, stageCount: stage.stageCount,
          jobId: `${request.jobId}:tensor-${stage.stageIndex}`,
          tensorSigma: request.tensorSigma, alphaEpsilon: request.alphaEpsilon,
          edgeLow: request.edgeLow, edgeHigh: request.edgeHigh,
          maxAnisotropy: request.maxAnisotropy,
          minorCoverageFactor: request.minorCoverageFactor,
          coherenceExponent: request.coherenceExponent,
          kernelSharpness: request.kernelSharpness,
          sourceDomain: stage.stageIndex === 0 ? request.sourceDomain : 'declared-linear',
        });
        if (!tensorHandle?.axialFieldTexture) throw stableError('E_R7_AXIAL_FIELD_MISSING', 'Canonical stage tensor has no axial field texture');
        if (request.adaptivePolicy) {
          if (!request.pipeBundle.adaptivePolicyR1D) throw stableError('E_R7_ADAPTIVE_POLICY_PIPELINE_MISSING', 'Adaptive policy requested without an admitted pipeline');
          adaptiveHandle = await buildAdaptivePolicyFieldR1D(request.device, request.pipeBundle.adaptivePolicyR1D, {
            qmapTexture: request.qmapTexture,
            width: stage.sourceWidth, height: stage.sourceHeight,
            stageIndex: stage.stageIndex, stageCount: stage.stageCount,
            jobId: `${request.jobId}:adaptive-${stage.stageIndex}`,
            policy: request.adaptivePolicy,
          });
        }
        const dispatchReceipt = await dispatchEWAAniso(request.device, request.pipeBundle, {
          srcTex: currentTexture,
          tensorTex: tensorHandle.axialFieldTexture,
          tensorFieldMode: EWA_R5_TENSOR_FIELD_MODE,
          policyTex: adaptiveHandle?.fieldTexture ?? null,
          dstTex: outputTexture,
          inW: stage.sourceWidth, inH: stage.sourceHeight,
          outW: stage.outputWidth, outH: stage.outputHeight,
          sigmaMain: request.sigmaMain, sigmaCross: request.sigmaCross, shrinkClamp: request.shrinkClamp,
          maxAnisotropy: request.maxAnisotropy, edgeLow: request.edgeLow, edgeHigh: request.edgeHigh,
          minorCoverageFactor: request.minorCoverageFactor, coherenceExponent: request.coherenceExponent,
          kernelSharpness: request.kernelSharpness, kernelTaperExponent: request.kernelTaperExponent,
          phaseConvention: request.phaseConvention, phaseConventionId: request.phaseConventionId,
          borderMode: request.borderMode,
          tensorMode: 'canonical-stage-local-r1c',
          runtimeEpoch: stageIdentity.runtimeEpoch, deviceEpoch: stageIdentity.deviceEpoch,
          jobId: `${request.jobId}:lowpass-${stage.stageIndex}`,
          stageIndex: stage.stageIndex, stageCount: stage.stageCount,
          flags: request.flags, adaptivePolicy: request.adaptivePolicy,
        });
        appendR7LowpassStage(chain, {
          sharedStageId: EWA_R7_SHARED_STAGE_ID,
          stageIndex: stage.stageIndex, stageCount: stage.stageCount,
          sourceWidth: stage.sourceWidth, sourceHeight: stage.sourceHeight,
          outputWidth: stage.outputWidth, outputHeight: stage.outputHeight,
          inputFormat: stage.stageIndex === 0 ? request.sourceFormat : 'rgba16float',
          outputFormat: 'rgba16float',
          srcPerDstX: stage.srcPerDstX, srcPerDstY: stage.srcPerDstY,
          support,
          deviceEpoch: stageIdentity.deviceEpoch,
          runtimeEpoch: stageIdentity.runtimeEpoch,
          dispatchReceipt,
          tensorReceipt: tensorHandle.receipt,
          axialFieldConsumed: true,
          intermediateReadback: false,
          residualApplied: false,
          finalizationApplied: false,
        });

        const finalStage = stage.stageIndex === stage.stageCount - 1;
        adaptiveHandle?.release?.();
        adaptiveHandle = null;
        if (finalStage && request.retainTerminalInputs) {
          retainedSourceTexture = currentTexture;
          retainedSourceOwned = currentOwned;
          retainedTensorHandle = tensorHandle;
          tensorHandle = null;
        } else {
          tensorHandle.release();
          tensorHandle = null;
          if (currentOwned) destroyOwned(currentTexture);
        }
        currentTexture = outputTexture;
        currentOwned = true;
      } catch (error) {
        adaptiveHandle?.release?.();
        tensorHandle?.release?.();
        destroyOwned(outputTexture);
        throw error;
      }
    }

    const receipt = await finalizeR7LowpassReceipt(chain, {
      outputTexture: currentTexture,
      outputFormat: 'rgba16float',
      consumerEnvelope: request.consumerEnvelope,
      intermediateReadbackCount: 0,
      sharedStageId: EWA_R7_SHARED_STAGE_ID,
      bundleIdentity,
      retainedTerminalInputs: request.retainTerminalInputs,
    });
    const terminalTexture = currentTexture;
    return Object.freeze({
      terminalTexture,
      terminalWidth: request.targetWidth,
      terminalHeight: request.targetHeight,
      terminalFormat: 'rgba16float',
      plan,
      lowpassReceipt: receipt,
      retainedSourceTexture,
      retainedAxialTexture: retainedTensorHandle?.axialFieldTexture ?? null,
      releaseRetained,
      destroyTerminal: () => destroyOwned(terminalTexture),
    });
  } catch (error) {
    releaseRetained();
    for (const texture of ownedTextures) destroyOwned(texture);
    failR7Convergence(error, error?.code === 'E_R7_CANCELLED');
    throw error;
  }
}
