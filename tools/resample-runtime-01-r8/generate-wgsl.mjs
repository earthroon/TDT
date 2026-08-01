import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  EWA_R6_KERNEL_CONTRACT,
  EWA_R6_CONTRACT_CANONICAL_JSON,
  EWA_R6_CONTRACT_DIGEST,
  EWA_R6_GENERATOR_ID,
  EWA_R6_GENERATED_MANIFEST_ID,
  EWA_R6_KERNEL_CONTRACT_ID,
  EWA_R6_KERNEL_ID,
  EWA_R6_ABI_ID,
  EWA_R6_PARAM_BYTES,
  EWA_R6_PHASE_ID,
  EWA_R6_PHASE_ENUM,
  EWA_R6_BORDER_ID,
  EWA_R6_BORDER_ENUM,
  stableCanonicalJson,
} from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_kernel_contract_v4.mjs';
import { EWA_R8_GENERATOR_ID, EWA_R8_GENERATED_MANIFEST_ID, EWA_R8_ZERO_DEGRADATION_ID } from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_support_envelope_r8.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOL_REL = 'tools/resample-runtime-01-r8/generate-wgsl.mjs';
const OUT_DIR = 'app/legacy-runtime/core/compute/qmap_webgpu/shaders';
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const lf = (value) => String(value).split('\r\n').join('\n').split('\r').join('\n').replace(/\n*$/, '') + '\n';
const read = (relative) => lf(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const contractSentinel = parseInt(EWA_R6_CONTRACT_DIGEST.slice(0, 8), 16) >>> 0;
const ABI = "// <TDT:R8:ABI:BEGIN>\nconst R6_ABI_VERSION: u32 = 65550u;\nconst R6_PHASE_CONVENTION: u32 = 2u;\nconst R6_BORDER_MODE: u32 = 1u;\nconst R8_GENERATED_CONTRACT_SENTINEL: u32 = __CONTRACT_SENTINEL__u;\nconst R8_GENERATED_CONTRACT_SENTINEL_EXPECTED: u32 = __CONTRACT_SENTINEL__u;\nstruct Params {\n  inSize: vec2<u32>,\n  outSize: vec2<u32>,\n  srcPerDst: vec2<f32>,\n  dstPerSrc: vec2<f32>,\n  sigmaMain: f32,\n  sigmaCross: f32,\n  maxAnisotropy: f32,\n  maxSampleReach: f32,\n  edgeLow: f32,\n  edgeHigh: f32,\n  minorCoverageFactor: f32,\n  coherenceExponent: f32,\n  kernelSharpness: f32,\n  kernelTaperExponent: f32,\n  phaseConvention: u32,\n  borderMode: u32,\n  stageIndex: u32,\n  stageCount: u32,\n  flags: u32,\n  abiVersion: u32,\n};\nfn r8ContractValid() -> bool {\n  return U.abiVersion == R6_ABI_VERSION && U.phaseConvention == R6_PHASE_CONVENTION && U.borderMode == R6_BORDER_MODE && R8_GENERATED_CONTRACT_SENTINEL == R8_GENERATED_CONTRACT_SENTINEL_EXPECTED;\n}\n// <TDT:R8:ABI:END>".replaceAll('__CONTRACT_SENTINEL__', String(contractSentinel));
const COORDINATE = "// <TDT:R8:COORDINATE:BEGIN>\nfn sourcePosition(dstCoord: vec2<u32>) -> vec2<f32> {\n  return (vec2<f32>(dstCoord) + vec2<f32>(0.5)) * U.srcPerDst - vec2<f32>(0.5);\n}\nfn sourceBase(p: vec2<f32>) -> vec2<i32> { return vec2<i32>(floor(p)); }\n// <TDT:R8:COORDINATE:END>";
const BORDER = "// <TDT:R8:BORDER:BEGIN>\nfn clampSourceFetchCoord(logicalCoord: vec2<i32>) -> vec2<i32> {\n  return clamp(logicalCoord, vec2<i32>(0), vec2<i32>(U.inSize) - vec2<i32>(1));\n}\nfn loadSourceClamped(logicalCoord: vec2<i32>) -> vec4<f32> {\n  return textureLoad(srcTex, clampSourceFetchCoord(logicalCoord), 0);\n}\nfn loadAxialClamped(logicalCoord: vec2<i32>) -> vec4<f32> {\n  return textureLoad(axialTex, clampSourceFetchCoord(logicalCoord), 0);\n}\n// <TDT:R8:BORDER:END>";
const AXIAL = "// <TDT:R8:AXIAL:BEGIN>\nfn sanitizeAxial(raw: vec4<f32>) -> vec4<f32> {\n  let q2 = dot(raw.rg, raw.rg);\n  if (!all(isFinite(raw)) || !isFinite(q2) || q2 <= EPS * EPS) { return vec4<f32>(1.0, 0.0, 0.0, 0.0); }\n  let q = raw.rg * inverseSqrt(q2);\n  return vec4<f32>(q, clamp(raw.b, 0.0, 1.0), clamp(raw.a, 0.0, 1.0));\n}\nfn sampleAxial(p: vec2<f32>) -> vec4<f32> {\n  let base = sourceBase(p);\n  let f = p - vec2<f32>(base);\n  let w00 = (1.0 - f.x) * (1.0 - f.y);\n  let w10 = f.x * (1.0 - f.y);\n  let w01 = (1.0 - f.x) * f.y;\n  let w11 = f.x * f.y;\n  let s00 = sanitizeAxial(loadAxialClamped(base + vec2<i32>(0, 0)));\n  let s10 = sanitizeAxial(loadAxialClamped(base + vec2<i32>(1, 0)));\n  let s01 = sanitizeAxial(loadAxialClamped(base + vec2<i32>(0, 1)));\n  let s11 = sanitizeAxial(loadAxialClamped(base + vec2<i32>(1, 1)));\n  let accumulator = w00 * s00.b * s00.rg + w10 * s10.b * s10.rg + w01 * s01.b * s01.rg + w11 * s11.b * s11.rg;\n  let coherenceMass = w00 * s00.b + w10 * s10.b + w01 * s01.b + w11 * s11.b;\n  let edge = clamp(w00 * s00.a + w10 * s10.a + w01 * s01.a + w11 * s11.a, 0.0, 1.0);\n  let magnitude = length(accumulator);\n  if (!isFinite(magnitude) || magnitude <= EPS) { return vec4<f32>(1.0, 0.0, 0.0, edge); }\n  return vec4<f32>(accumulator / magnitude, clamp(min(magnitude, coherenceMass), 0.0, 1.0), edge);\n}\nfn tangentFromAxial(qRaw: vec2<f32>) -> vec2<f32> {\n  let q2 = dot(qRaw, qRaw);\n  if (!all(isFinite(qRaw)) || !isFinite(q2) || q2 <= EPS * EPS) { return vec2<f32>(1.0, 0.0); }\n  let q = qRaw * inverseSqrt(q2);\n  let tx = sqrt(max(0.0, 0.5 * (1.0 + q.x)));\n  if (tx <= EPS) { return vec2<f32>(0.0, 1.0); }\n  var tangent = normalize(vec2<f32>(tx, q.y / (2.0 * tx)));\n  if (tangent.x < 0.0 || (abs(tangent.x) <= EPS && tangent.y < 0.0)) { tangent = -tangent; }\n  return tangent;\n}\nfn ellipseField(axial: vec4<f32>, policy: vec4<f32>) -> vec4<f32> {\n  let tangent = tangentFromAxial(axial.rg);\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n  let scaleT = max(1.0, length(tangent * U.srcPerDst));\n  let scaleN = max(1.0, length(normal * U.srcPerDst));\n  let edge = smoothstep(U.edgeLow, U.edgeHigh, clamp(axial.a, 0.0, 1.0));\n  let gate = pow(clamp(axial.b, 0.0, 1.0), max(U.coherenceExponent, 0.0001)) * edge * clamp(policy.g, 0.0, 1.0) * clamp(policy.a, 0.0, 1.0);\n  let anisotropy = exp2(gate * log2(max(U.maxAnisotropy, 1.0)));\n  let root = sqrt(anisotropy);\n  let footprint = max(policy.b, 0.75);\n  let major = max(1.0, scaleT * max(U.sigmaMain, 0.0001) * root * footprint);\n  let minor = max(U.minorCoverageFactor, scaleN * max(U.sigmaCross, 0.0001) / root * footprint);\n  return vec4<f32>(tangent, major, minor);\n}\n// <TDT:R8:AXIAL:END>";
const KERNEL = "// <TDT:R8:KERNEL:BEGIN>\nfn ellipseDistance(delta: vec2<f32>, field: vec4<f32>) -> f32 {\n  let tangent = field.rg;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n  let along = dot(delta, tangent) / field.b;\n  let across = dot(delta, normal) / field.a;\n  return along * along + across * across;\n}\nfn kernelWeight(q: f32) -> f32 {\n  if (!isFinite(q) || q < 0.0 || q > 1.0) { return 0.0; }\n  let radial = exp(-U.kernelSharpness * q);\n  let taperBase = max(0.0, 1.0 - q);\n  let taper = pow(taperBase, U.kernelTaperExponent);\n  let weight = radial * taper;\n  return select(0.0, weight, isFinite(weight) && weight > 0.0);\n}\nfn r8FaultValue() -> vec4<f32> { let qnan = bitcast<f32>(0x7fc00008u); return vec4<f32>(qnan); }\nfn r8FieldSupported(field: vec4<f32>) -> bool { return all(isFinite(field)) && field.b > 0.0 && field.a > 0.0 && max(field.b, field.a) <= U.maxSampleReach + 0.000001; }\n// <TDT:R8:KERNEL:END>";
const fragments = { abi: ABI, coordinate: COORDINATE, axial: AXIAL, border: BORDER, kernel: KERNEL };

const specs = [
  {
    path: `${OUT_DIR}/ewa_aniso_tile_r4_r8.wgsl`, role: 'PRODUCT', profile: 'R4',
    template: 'tools/resample-runtime-01-r8/templates/product-tiled.wgsl.tmpl',
    constants: `const WG_W: u32 = 8u;
const WG_H: u32 = 8u;
const WORKGROUP_INVOCATIONS: u32 = 64u;
const HALO: i32 = 4;
const TILE_W: u32 = 24u;
const TILE_H: u32 = 24u;
const TILE_ELEMENTS: u32 = 576u;
const MAX_REACH: i32 = 4;`, tileElements: '576',
  },
  {
    path: `${OUT_DIR}/ewa_aniso_tile_r6_r8.wgsl`, role: 'PRODUCT', profile: 'R6',
    template: 'tools/resample-runtime-01-r8/templates/product-tiled.wgsl.tmpl',
    constants: `const WG_W: u32 = 8u;
const WG_H: u32 = 8u;
const WORKGROUP_INVOCATIONS: u32 = 64u;
const HALO: i32 = 6;
const TILE_W: u32 = 28u;
const TILE_H: u32 = 28u;
const TILE_ELEMENTS: u32 = 784u;
const MAX_REACH: i32 = 6;`, tileElements: '784',
  },
  {
    path: `${OUT_DIR}/ewa_aniso_tile_validation_r4_r8.wgsl`, role: 'VALIDATION', profile: 'R4',
    template: 'tools/resample-runtime-01-r8/templates/validation-tiled.wgsl.tmpl',
    constants: `const WG_W: u32 = 8u;
const WG_H: u32 = 8u;
const WORKGROUP_INVOCATIONS: u32 = 64u;
const HALO: i32 = 4;
const TILE_W: u32 = 24u;
const TILE_H: u32 = 24u;
const TILE_ELEMENTS: u32 = 576u;
const MAX_REACH: i32 = 4;`, tileElements: '576',
  },
  {
    path: `${OUT_DIR}/ewa_aniso_tile_validation_r6_r8.wgsl`, role: 'VALIDATION', profile: 'R6',
    template: 'tools/resample-runtime-01-r8/templates/validation-tiled.wgsl.tmpl',
    constants: `const WG_W: u32 = 8u;
const WG_H: u32 = 8u;
const WORKGROUP_INVOCATIONS: u32 = 64u;
const HALO: i32 = 6;
const TILE_W: u32 = 28u;
const TILE_H: u32 = 28u;
const TILE_ELEMENTS: u32 = 784u;
const MAX_REACH: i32 = 6;`, tileElements: '784',
  },
  {
    path: `${OUT_DIR}/ewa_aniso_reference_v6_r8.wgsl`, role: 'REFERENCE', profile: 'REFERENCE',
    template: 'tools/resample-runtime-01-r8/templates/reference-direct.wgsl.tmpl', constants: '', tileElements: '',
  },
];

function header(spec, templateDigest) {
  return `// @generated=true
// generatorId=${EWA_R8_GENERATOR_ID}
// zeroDegradationId=${EWA_R8_ZERO_DEGRADATION_ID}
// kernelContractId=${EWA_R6_KERNEL_CONTRACT_ID}
// kernelId=${EWA_R6_KERNEL_ID}
// parameterAbiId=${EWA_R6_ABI_ID}
// parameterBytes=${EWA_R6_PARAM_BYTES}
// phaseConventionId=${EWA_R6_PHASE_ID}
// borderId=${EWA_R6_BORDER_ID}
// role=${spec.role}
// profile=${spec.profile}
// contractDigest=${EWA_R6_CONTRACT_DIGEST}
// templateDigest=${templateDigest}`;
}

function render(spec, templateOverride = null) {
  const template = templateOverride ?? read(spec.template);
  const templateDigest = sha(template);
  let output = template
    .replace('{{HEADER}}', header(spec, templateDigest))
    .replace('{{PROFILE_CONSTANTS}}', spec.constants)
    .replace('{{TILE_ELEMENTS}}', spec.tileElements)
    .replace('{{ABI}}', ABI)
    .replace('{{COORDINATE}}', COORDINATE)
    .replace('{{BORDER}}', BORDER)
    .replace('{{AXIAL}}', AXIAL)
    .replace('{{KERNEL}}', KERNEL);
  if (/{{[A-Z_]+}}/.test(output)) throw new Error(`E_R6_GENERATED_OUTPUT_STALE:${spec.path}`);
  return { text: lf(output), templateDigest };
}

export function renderAll() {
  if (stableCanonicalJson(EWA_R6_KERNEL_CONTRACT) !== EWA_R6_CONTRACT_CANONICAL_JSON || sha(EWA_R6_CONTRACT_CANONICAL_JSON) !== EWA_R6_CONTRACT_DIGEST) {
    throw new Error('E_R6_KERNEL_CONTRACT_DIGEST_MISMATCH');
  }
  return specs.map((spec) => ({ ...spec, ...render(spec) }));
}

export function buildManifest(outputs) {
  const generatorDigest = sha(fs.readFileSync(path.join(ROOT, TOOL_REL)));
  const fragmentDigests = Object.fromEntries(Object.entries(fragments).map(([key, value]) => [key, sha(lf(value))]));
  return {
    schemaVersion: 1,
    manifestId: EWA_R8_GENERATED_MANIFEST_ID,
    generatorId: EWA_R8_GENERATOR_ID,
    generatorDigest,
    kernelContractId: EWA_R6_KERNEL_CONTRACT_ID,
    kernelContractDigest: EWA_R6_CONTRACT_DIGEST,
    parameterAbiId: EWA_R6_ABI_ID,
    parameterBytes: EWA_R6_PARAM_BYTES,
    phaseConventionId: EWA_R6_PHASE_ID,
    phaseConventionEnum: EWA_R6_PHASE_ENUM,
    borderId: EWA_R6_BORDER_ID,
    borderEnum: EWA_R6_BORDER_ENUM,
    outputs: outputs.map((output) => ({
      path: output.path,
      role: output.role,
      profile: output.profile,
      templatePath: output.template,
      templateDigest: output.templateDigest,
      outputDigest: sha(output.text),
      abiFragmentDigest: fragmentDigests.abi,
      kernelFragmentDigest: fragmentDigests.kernel,
      borderFragmentDigest: fragmentDigests.border,
      axialInterpolationFragmentDigest: fragmentDigests.axial,
      coordinateFragmentDigest: fragmentDigests.coordinate,
    })),
  };
}

export function generate({ write = true } = {}) {
  const outputs = renderAll();
  const manifest = buildManifest(outputs);
  if (write) {
    for (const output of outputs) {
      const target = path.join(ROOT, output.path);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, output.text);
    }
    fs.writeFileSync(path.join(ROOT, OUT_DIR, 'ewa_generated_manifest_r8.json'), JSON.stringify(manifest, null, 2) + '\n');
  }
  return { outputs, manifest };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { manifest } = generate();
  console.log(`generated R8 WGSL ${manifest.outputs.length} outputs`);
}
