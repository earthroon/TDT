import fs from 'node:fs';
import path from 'node:path';
import { ROOT, check, read, sha256File, writeJson } from './lib.mjs';

const stack = read('app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs');
const facade = read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs');
const contract = read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs');
const params = read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params.mjs');
const product = read('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v2.wgsl');
const reference = read('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v1.wgsl');
const runtime = read('app/legacy-runtime/core/compute/qmap_webgpu/runtime.js');
const gamma = read('app/legacy-runtime/core/compute/qmap_webgpu/deltaK_gammaProof_webgpu.mjs');
const spec = read('specs/TDT-RESAMPLE-RUNTIME-01-R1A_LEGACY_ABI_PRESERVATION_DELTAK_EWA_EXECUTION_REPAIR_UNIFORM_BARRIER_SHARED_TILE_CORRECTNESS_SPEC.md');
const combined = [stack, facade, contract, params, product, reference, runtime].join('\n');

const barrierIndex = product.indexOf('workgroupBarrier();');
const boundsIndex = product.indexOf('if (!inBounds)');
const tileOriginBlock = product.slice(product.indexOf('let outGroupOrigin'), product.indexOf('var index = localIndex'));
const checks = [
  check(spec.includes('TDT-RESAMPLE-RUNTIME-01-R1A'), 'RA1A-01', 'spec identity'),
  check(fs.existsSync(path.join(ROOT,'app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs')) && fs.existsSync(path.join(ROOT,'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs')), 'RA1A-02', 'facade paths preserved'),
  check(/export async function createDeltaKStack/.test(stack) && /export async function runDeltaKStack/.test(stack) && /export function dispatchEWAAniso/.test(facade), 'RA1A-03', 'exports preserved'),
  check(/return (?:outputTexture|currentTexture|request\.srcTex);/.test(stack), 'RA1A-04', 'GPUTexture return preserved'),
  check(/legacy-positional/.test(contract), 'RA1A-05', 'positional ABI present'),
  check(/canonical-object/.test(contract), 'RA1A-06', 'object ABI present'),
  check(/E_R1A_AMBIGUOUS_LEGACY_ALIAS/.test(contract), 'RA1A-07', 'ambiguous alias rejection'),
  check(/runDeltaKStack\(\{[\s\S]*pipes: deltaKPipes/.test(runtime), 'RA1A-08', 'active caller migrated'),
  check(/legacyPositionalCallCount/.test(read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_runtime_receipt.mjs')), 'RA1A-09', 'legacy telemetry'),
  check(!/export\s+\{[^}]*runDeltaKStackCanonical/.test(stack), 'RA1A-10', 'internal runner not exported'),
  check(/EWA_R1A_PARAM_BYTES = 64/.test(params), 'RA1A-11', '64-byte params'),
  check(/u32\[15\] = EWA_R1A_ABI_VERSION/.test(params) && /f32\[11\] = EWA_R1A_MAX_SAMPLE_REACH/.test(params), 'RA1A-12', 'field offsets'),
  check(/struct Params[\s\S]*inSize: vec2<u32>[\s\S]*abiVersion: u32/.test(product), 'RA1A-13', 'WGSL params layout'),
  check(/minBindingSize:(?: EWA_R1A_PARAM_BYTES|bytes)/.test(facade), 'RA1A-14', 'minBindingSize'),
  check(/658cc15c217f21200d2d6ffd651a0b1b0a58d2c6a76e43036552bc0bfde4c621/.test(params), 'RA1A-15', 'ABI digest'),
  check(!/enable\s+f16/.test(product) && !/enable\s+f16/.test(gamma), 'RA1A-16', 'unneeded f16 removed'),
  check(!/requestAdapter\s*\(|requestDevice\s*\(/.test(combined), 'RA1A-17', 'no direct adapter/device request'),
  check(/__DADUM_GPU_AUTHORITY_BRIDGE__\.createShaderModule\(EWA_R1A_CONSUMER_ID/.test(facade) && /__DADUM_GPU_AUTHORITY_BRIDGE__\.createComputePipeline\(EWA_R1A_CONSUMER_ID/.test(facade), 'RA1A-18', 'GPU Authority pipeline creation'),
  check(/@compute @workgroup_size\(8, 8, 1\)/.test(product), 'RA1A-19', 'workgroup 8x8'),
  check(/@builtin\(workgroup_id\)/.test(product) && /let tileOrigin =/.test(tileOriginBlock), 'RA1A-20', 'workgroup common origin'),
  check(!/gid[\s\S]{0,160}tileOrigin/.test(tileOriginBlock), 'RA1A-21', 'tile origin does not depend on gid'),
  check(barrierIndex >= 0 && boundsIndex > barrierIndex, 'RA1A-22', 'barrier before divergent bounds return'),
  check(/workgroupBarrier\(\);[\s\S]*if \(!inBounds\)[\s\S]*return;/.test(product), 'RA1A-23', 'post-barrier return'),
  check(/TILE_W: u32 = 28u/.test(product) && /TILE_H: u32 = 28u/.test(product), 'RA1A-24', 'tile extent'),
  check(/EWA_R1A_TILE = Object\.freeze\(\{ width: 28, height: 28, halo: 6, elements: 784, bytes: 12544 \}\)/.test(params), 'RA1A-25', 'storage budget'),
  check(/var index = localIndex;[\s\S]*index \+= WORKGROUP_INVOCATIONS/.test(product), 'RA1A-26', 'flattened cooperative load'),
  check(/sourceCoord = tileOrigin \+/.test(product) && /local = coord - tileOrigin/.test(product), 'RA1A-27', 'single coordinate mapping'),
  check(!/baseX|baseY|PAD/.test(product), 'RA1A-28', 'double PAD removed'),
  check(fs.existsSync(path.join(ROOT,'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v1_legacy.wgsl')) && (/reference=await compile/.test(facade) || (/compileEwa\(device,shaders\.reference,'reference-v2'/.test(facade) || (/compileEwa\(device,shaders\.reference,'reference-v3-r4'/.test(facade) || /compileEwa\(device,shaders\.reference,'reference-v4-r5'/.test(facade)))), 'RA1A-29', 'reference shader preserved under R1C/R2'),
  check(!/var<workgroup>|workgroupBarrier/.test(reference), 'RA1A-30', 'reference independent of shared memory'),
  check(product.includes('struct Params') && reference.includes(product.match(/struct Params \{[\s\S]*?\};/)[0]), 'RA1A-31', 'shared parameter schema'),
  check(/registerEwaTextureMetadata\((?:outputTexture|texture)/.test(stack), 'RA1A-32', 'output metadata registration adapter'),
  check(/(?:temporaryParamsBuffer|temporary)\?\.destroy/.test(facade), 'RA1A-33', 'temporary resource cleanup'),
  check(/onSubmittedWorkDone/.test(facade), 'RA1A-34', 'queue fence'),
  check(/appendEwaR1AReceipt/.test(facade), 'RA1A-35', 'dispatch receipt'),
  check(/E_R1A_STALE_PIPELINE_EPOCH/.test(stack) && (/E_R1A_STALE_PIPELINE_EPOCH/.test(facade) || (/E_R4_STALE_PIPELINE_EPOCH/.test(facade) || /E_R5_STALE_PIPELINE_EPOCH/.test(facade))), 'RA1A-36', 'device epoch validation'),
  check(/scale > 1\.0/.test(contract) && /buildEwaStagePlan/.test(stack), 'RA1A-37', 'R1A scale admission preserved through R1B planner'),
  check(/E_R1A_OUTPUT_DIMENSION_MISMATCH/.test(contract) && /E_R1A_SOURCE_DIMENSION_UNKNOWN/.test(contract), 'RA1A-38', 'dimension admission'),
  check(/E_R1A_PARAMETER_NONFINITE/.test(contract) && /E_R1A_PARAMETER_RANGE/.test(contract), 'RA1A-39', 'finite parameter validation'),
  check(!/catch[\s\S]{0,120}return\s+request\.srcTex/.test(combined) && !/fallback.*lanczos/i.test(combined), 'RA1A-40', 'no silent algorithm fallback'),
];
const failed = checks.filter((item)=>!item.pass);
const report = { schemaVersion:1, patchId:'TDT-RESAMPLE-RUNTIME-01-R1A', pass:failed.length===0, counts:{pass:checks.length-failed.length,fail:failed.length}, checks, shaderDigests:{product:sha256File('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v2.wgsl'),reference:sha256File('app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v1.wgsl')} };
writeJson('r1a-source-contract.json',report);
if(failed.length){console.error(failed);process.exit(1);} console.log(`PASS R1A source contract ${checks.length}/${checks.length}`);
