// ============================================================
// deltaK_stack_autoEWA.mjs
// TDT-RESAMPLE-RUNTIME-01-R1A + R1B
// Existing facade and return contract preserved.
// R1B inserts deterministic GPU-resident stages inside the facade.
// ============================================================

import { createEWAAnisoPipeline, dispatchEWAAniso } from './ewa_aniso_tile.mjs';
import { createStructureTensorR1CPipeline, buildStageLocalTensorR1C } from './structure_tensor_runtime.mjs';
import { tensorR1CTelemetrySnapshot, incrementTensorR1CTelemetry } from './structure_tensor_runtime_receipt.mjs';
import { createAdaptivePolicyR1DPipeline, buildAdaptivePolicyFieldR1D } from './adaptive_policy_r1d_runtime.mjs';
import { adaptivePolicyR1DTelemetrySnapshot } from './adaptive_policy_r1d_receipt.mjs';
import {
  assertEwaRequestNotCancelled,
  getEwaTextureMetadata,
  normalizeDeltaKStackRequest,
  registerEwaTextureMetadata,
  validateEwaDeviceOwnership,
} from './ewa_aniso_contract.mjs';
import { ewaR1ATelemetrySnapshot } from './ewa_aniso_runtime_receipt.mjs';
import { EWA_R5_TENSOR_FIELD_MODE } from './ewa_axial_contract_r5.mjs';
import { buildEwaStagePlan, verifyStageAgainstPlan } from './ewa_stage_planner.mjs';
import {
  appendEwaR1BStageReceipt,
  beginEwaR1BPlan,
  failEwaR1BPlan,
  finalizeEwaR1BChain,
  getEwaR1BTelemetry,
  getEwaR1BTextureReceipt,
} from './ewa_multistage_runtime_receipt.mjs';

const outputReceipts = new WeakMap();

function stableError(code, message, detail = null) {
  return Object.assign(new Error(message), { code, detail });
}

export async function createDeltaKStack(device, existingPipes = {}) {
  const [pipeEWA, tensorR1C, adaptivePolicyR1D] = await Promise.all([
    createEWAAnisoPipeline(device),
    createStructureTensorR1CPipeline(device),
    createAdaptivePolicyR1DPipeline(device),
  ]);
  pipeEWA.tensorR1C = tensorR1C;
  pipeEWA.adaptivePolicyR1D = adaptivePolicyR1D;
  const disposeEwa = pipeEWA.dispose.bind(pipeEWA);
  pipeEWA.dispose = () => { adaptivePolicyR1D.dispose(); tensorR1C.dispose(); disposeEwa(); };
  return { ...existingPipes, pipeEWA };
}

export function getDeltaKEwaOutputMetadata(texture) {
  return outputReceipts.get(texture) ?? getEwaR1BTextureReceipt(texture) ?? getEwaTextureMetadata(texture) ?? null;
}

export function getDeltaKEwaR1ATelemetry() { return ewaR1ATelemetrySnapshot(); }
export function getDeltaKEwaR1BTelemetry() { return getEwaR1BTelemetry(); }
export function getDeltaKEwaR1CTelemetry() { return Object.freeze({ ...tensorR1CTelemetrySnapshot(), adaptivePolicy: adaptivePolicyR1DTelemetrySnapshot() }); }

function assertPipelineEpoch(pipeBundle, deviceBinding) {
  if (pipeBundle?.deviceEpoch != null && pipeBundle.deviceEpoch !== deviceBinding.deviceEpoch) {
    throw stableError('E_R1A_STALE_PIPELINE_EPOCH', 'DeltaK EWA pipeline belongs to a stale device epoch', {
      pipelineDeviceEpoch: pipeBundle.deviceEpoch,
      currentDeviceEpoch: deviceBinding.deviceEpoch,
    });
  }
}

function createStageTexture(request, stage, deviceBinding) {
  const textureUsage = globalThis.GPUTextureUsage ?? { COPY_SRC: 0x01, TEXTURE_BINDING: 0x04, STORAGE_BINDING: 0x08 };
  const texture = request.device.createTexture({
    label: `tdt.delta-k-ewa.r1b:${request.jobId}:stage-${stage.stageIndex + 1}-of-${stage.stageCount}`,
    size: { width: stage.outputWidth, height: stage.outputHeight, depthOrArrayLayers: 1 },
    dimension: '2d',
    format: 'rgba16float',
    mipLevelCount: 1,
    sampleCount: 1,
    usage: textureUsage.STORAGE_BINDING | textureUsage.TEXTURE_BINDING | textureUsage.COPY_SRC,
  });
  registerEwaTextureMetadata(texture, {
    width: stage.outputWidth,
    height: stage.outputHeight,
    format: 'rgba16float',
    runtimeEpoch: deviceBinding.runtimeEpoch,
    deviceEpoch: deviceBinding.deviceEpoch,
    deviceIdentity: deviceBinding.deviceIdentity,
    owner: 'delta-k-ewa-r1b',
    jobId: request.jobId,
    stageIndex: stage.stageIndex,
    stageCount: stage.stageCount,
  });
  return texture;
}

async function runDeltaKStackCanonical(request) {
  const pipeBundle = request.pipes.pipeEWA;
  const plan = await buildEwaStagePlan({
    sourceWidth: request.sourceWidth,
    sourceHeight: request.sourceHeight,
    targetWidth: request.outputWidth,
    targetHeight: request.outputHeight,
    profileId: 'delta-k-tiled-v2',
    parameters: {
      sigmaMain: request.sigmaMain,
      sigmaCross: request.sigmaCross,
      shrinkClamp: request.shrinkClamp,
      tensorMode: request.tensorMode,
    },
  });
  const chain = beginEwaR1BPlan(plan);
  const ownedTextures = new Set();
  const destroyedTextures = new Set();
  let currentTexture = request.srcTex;
  let currentOwned = false;

  const destroyOwned = (texture) => {
    if (!texture || !ownedTextures.has(texture) || destroyedTextures.has(texture)) return;
    destroyedTextures.add(texture);
    try { texture.destroy?.(); } catch { /* disposal attempt remains exactly once */ }
  };

  try {
    if (plan.stageCount === 0) {
      assertEwaRequestNotCancelled(request, 0);
      const deviceBinding = await validateEwaDeviceOwnership(request);
      assertPipelineEpoch(pipeBundle, deviceBinding);
      if (typeof request.runDeltaKCore === 'function') {
        await request.runDeltaKCore({
          device: request.device,
          inputTex: request.srcTex,
          tensorTex: request.tensorTex,
          width: request.sourceWidth,
          height: request.sourceHeight,
          runtimeEpoch: deviceBinding.runtimeEpoch,
          deviceEpoch: deviceBinding.deviceEpoch,
          jobId: request.jobId,
        });
      }
      const receipt = finalizeEwaR1BChain(chain, {
        outputTexture: request.srcTex,
        outputSurfaceOwnership: 'caller-source-retained',
        abi: request.abi,
        executionMode: request.executionMode,
        tensorMode: request.tensorMode,
        uploadCount: 0,
        readbackCount: 0,
        intermediateReadbackCount: 0,
        deltaKCoreExecutionCount: typeof request.runDeltaKCore === 'function' ? 1 : 0,
      });
      outputReceipts.set(request.srcTex, receipt);
      return request.srcTex;
    }

    for (const stage of plan.stages) {
      assertEwaRequestNotCancelled(request, stage.stageIndex);
      const deviceBinding = await validateEwaDeviceOwnership(request);
      assertPipelineEpoch(pipeBundle, deviceBinding);
      const support = verifyStageAgainstPlan(stage, plan.profileId, {
        sigmaMain: request.sigmaMain,
        sigmaCross: request.sigmaCross,
        shrinkClamp: request.shrinkClamp,
      });
      const outputTexture = createStageTexture(request, stage, deviceBinding);
      ownedTextures.add(outputTexture);

      let dispatchReceipt;
      let tensorHandle = null;
      let adaptivePolicyHandle = null;
      const canonicalTensor = request.tensorMode === 'canonical-stage-local-r1c';
      const adaptivePolicyEnabled = canonicalTensor && Boolean(request.adaptivePolicy);
      try {
        if (canonicalTensor) {
          if (!pipeBundle.tensorR1C) throw stableError('E_R1C_TENSOR_PIPELINE_NOT_READY', 'R1C tensor pipeline bundle is missing');
          tensorHandle = await buildStageLocalTensorR1C(request.device, pipeBundle.tensorR1C, {
            sourceTexture: currentTexture,
            sourceSurfaceId: String(request.sourceSurfaceId ?? `tdt.resample:${request.jobId}`),
            sourceRevision: Number(request.sourceRevision ?? 1),
            sourceFormat: stage.stageIndex === 0 ? 'rgba8unorm' : 'rgba16float',
            cancellationEpoch: Number(request.cancellationEpoch ?? 0),
            producerRequestSequence: stage.stageIndex + 1,
            width: stage.sourceWidth,
            height: stage.sourceHeight,
            stageIndex: stage.stageIndex,
            stageCount: stage.stageCount,
            jobId: `${request.jobId}:tensor-${stage.stageIndex}`,
            tensorSigma: request.tensorSigma,
            alphaEpsilon: request.alphaEpsilon,
            edgeLow: request.edgeLow,
            edgeHigh: request.edgeHigh,
            maxAnisotropy: request.maxAnisotropy,
            minorCoverageFactor: request.minorCoverageFactor,
            coherenceExponent: request.coherenceExponent,
            kernelSharpness: request.kernelSharpness,
            sourceDomain: request.sourceDomain,
          });
          if (adaptivePolicyEnabled) {
            if (!pipeBundle.adaptivePolicyR1D) throw stableError('E_R1D_ADAPTIVE_POLICY_PIPELINE_NOT_READY', 'R1D adaptive policy pipeline bundle is missing');
            adaptivePolicyHandle = await buildAdaptivePolicyFieldR1D(request.device, pipeBundle.adaptivePolicyR1D, {
              qmapTexture: request.qmapTex,
              width: stage.sourceWidth,
              height: stage.sourceHeight,
              stageIndex: stage.stageIndex,
              stageCount: stage.stageCount,
              jobId: `${request.jobId}:adaptive-policy-${stage.stageIndex}`,
              policy: request.adaptivePolicy,
            });
          }
        } else {
          incrementTensorR1CTelemetry('legacyStageCount');
        }
        if (canonicalTensor && !tensorHandle?.axialFieldTexture) throw stableError('E_R5_AXIAL_FIELD_MISSING', 'R5 canonical tensor handle has no axial field texture');
        dispatchReceipt = await dispatchEWAAniso(request.device, pipeBundle, {
          srcTex: currentTexture,
          tensorTex: canonicalTensor ? tensorHandle.axialFieldTexture : request.tensorTex,
          tensorFieldMode: canonicalTensor ? EWA_R5_TENSOR_FIELD_MODE : 'legacy-external-v1',
          policyTex: adaptivePolicyHandle?.fieldTexture ?? null,
          dstTex: outputTexture,
          inW: stage.sourceWidth,
          inH: stage.sourceHeight,
          outW: stage.outputWidth,
          outH: stage.outputHeight,
          sigmaMain: request.sigmaMain,
          sigmaCross: request.sigmaCross,
          shrinkClamp: request.shrinkClamp,
          maxAnisotropy: request.maxAnisotropy,
          edgeLow: request.edgeLow,
          edgeHigh: request.edgeHigh,
          minorCoverageFactor: request.minorCoverageFactor,
          coherenceExponent: request.coherenceExponent,
          kernelSharpness: request.kernelSharpness,
          kernelTaperExponent: request.kernelTaperExponent,
          phaseConvention: request.phaseConvention,
          phaseConventionId: request.phaseConventionId,
          borderMode: request.borderMode,
          tensorMode: request.tensorMode,
          runtimeEpoch: deviceBinding.runtimeEpoch,
          deviceEpoch: deviceBinding.deviceEpoch,
          jobId: `${request.jobId}:stage-${stage.stageIndex}`,
          stageIndex: stage.stageIndex,
          stageCount: stage.stageCount,
          flags: request.flags,
          adaptivePolicy: request.adaptivePolicy,
        });
      } catch (error) {
        destroyOwned(outputTexture);
        throw error;
      } finally {
        adaptivePolicyHandle?.release();
        tensorHandle?.release();
      }

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
        runtimeEpoch: deviceBinding.runtimeEpoch,
        deviceEpoch: deviceBinding.deviceEpoch,
        dispatchReceipt,
        tensorMode: request.tensorMode,
        tensorTruthClaim: canonicalTensor,
        legacyTensorInputPresent: request.legacyTensorInputPresent,
        legacyTensorInputConsumed: !canonicalTensor,
        tensorReceipt: tensorHandle?.receipt ?? null,
        adaptivePolicyEnabled,
        adaptivePolicyDigest: request.adaptivePolicy?.policyDigest ?? null,
        adaptivePolicyReceipt: adaptivePolicyHandle?.receipt ?? null,
        policyFieldConsumed: Boolean(adaptivePolicyHandle),
        tensorTemporaryDestroyCount: canonicalTensor ? 5 : 0,
        sourceOwnership: currentOwned ? 'r1b-intermediate' : 'caller-source',
        outputOwnership: stage.stageIndex === stage.stageCount - 1 ? 'caller-transfer' : 'r1b-intermediate',
      });

      if (currentOwned) destroyOwned(currentTexture);
      currentTexture = outputTexture;
      currentOwned = true;
    }

    assertEwaRequestNotCancelled(request, plan.stageCount);
    const finalBinding = await validateEwaDeviceOwnership(request);
    assertPipelineEpoch(pipeBundle, finalBinding);
    if (typeof request.runDeltaKCore === 'function') {
      await request.runDeltaKCore({
        device: request.device,
        inputTex: currentTexture,
        tensorTex: request.tensorTex,
        width: request.outputWidth,
        height: request.outputHeight,
        runtimeEpoch: finalBinding.runtimeEpoch,
        deviceEpoch: finalBinding.deviceEpoch,
        jobId: request.jobId,
      });
    }

    const receipt = finalizeEwaR1BChain(chain, {
      outputTexture: currentTexture,
      outputSurfaceOwnership: 'caller-transfer',
      abi: request.abi,
      executionMode: request.executionMode,
      tensorMode: request.tensorMode,
      tensorTruthClaim: request.tensorMode === 'canonical-stage-local-r1c',
      adaptivePolicyEnabled: Boolean(request.adaptivePolicy),
      adaptivePolicyDigest: request.adaptivePolicy?.policyDigest ?? null,
      legacyTensorInputPresent: request.legacyTensorInputPresent,
      legacyTensorInputConsumed: request.tensorMode === 'legacy-external-v1',
      uploadCount: 0,
      readbackCount: 0,
      intermediateReadbackCount: 0,
      intermediateDestroyCount: Math.max(0, plan.stageCount - 1),
      deltaKCoreExecutionCount: typeof request.runDeltaKCore === 'function' ? 1 : 0,
    });
    outputReceipts.set(currentTexture, Object.freeze({ ...getEwaTextureMetadata(currentTexture), ...receipt }));
    return currentTexture;
  } catch (error) {
    failEwaR1BPlan(chain, error, error?.code === 'E_R1B_CANCELLED');
    for (const texture of ownedTextures) destroyOwned(texture);
    throw error;
  }
}

/**
 * Existing public facade. Both forms remain admitted:
 *   runDeltaKStack({ device, pipes, srcTex, tensorTex, ... })
 *   runDeltaKStack(device, pipes, frameInputs)
 */
export async function runDeltaKStack(...args) {
  const request = normalizeDeltaKStackRequest(...args);
  return runDeltaKStackCanonical(request);
}
