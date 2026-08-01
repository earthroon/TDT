// @generated=true
// generatorId=tdt.ewa.wgsl-generator.r6.v1
// kernelContractId=tdt.ewa.kernel-contract.r6.v1
// kernelId=tdt.ewa.ellipse.phase-correct-parametric-r6.v1
// parameterAbiId=tdt.delta-k-ewa.params.v4
// parameterBytes=96
// phaseConventionId=tdt.ewa.source-lattice.pixel-center-v2
// borderId=tdt.ewa.border.clamp-extension-logical-distance-v1
// role=PRODUCT
// profile=R4
// contractDigest=18d413d630172515d463e6598d9f9e90c6a221c1fca41824defeae3e19da8909
// templateDigest=e7f609cb0e193c81c65c1489cdd667b08ffc9cc5dae0fc54ecbed3eb92499a0d
const WG_W: u32 = 8u;
const WG_H: u32 = 8u;
const WORKGROUP_INVOCATIONS: u32 = 64u;
const HALO: i32 = 4;
const TILE_W: u32 = 24u;
const TILE_H: u32 = 24u;
const TILE_ELEMENTS: u32 = 576u;
const MAX_REACH: i32 = 4;
const EPS: f32 = 0.000001;
// <TDT:R6:ABI:BEGIN>
const R6_ABI_VERSION: u32 = 65550u;
const R6_PHASE_CONVENTION: u32 = 2u;
const R6_BORDER_MODE: u32 = 1u;
const R6_GENERATED_CONTRACT_SENTINEL: u32 = 416551894u;
const R6_GENERATED_CONTRACT_SENTINEL_EXPECTED: u32 = 416551894u;
struct Params {
  inSize: vec2<u32>,
  outSize: vec2<u32>,
  srcPerDst: vec2<f32>,
  dstPerSrc: vec2<f32>,
  sigmaMain: f32,
  sigmaCross: f32,
  maxAnisotropy: f32,
  maxSampleReach: f32,
  edgeLow: f32,
  edgeHigh: f32,
  minorCoverageFactor: f32,
  coherenceExponent: f32,
  kernelSharpness: f32,
  kernelTaperExponent: f32,
  phaseConvention: u32,
  borderMode: u32,
  stageIndex: u32,
  stageCount: u32,
  flags: u32,
  abiVersion: u32,
};
fn r6ContractValid() -> bool {
  return U.abiVersion == R6_ABI_VERSION && U.phaseConvention == R6_PHASE_CONVENTION && U.borderMode == R6_BORDER_MODE && R6_GENERATED_CONTRACT_SENTINEL == R6_GENERATED_CONTRACT_SENTINEL_EXPECTED;
}
// <TDT:R6:ABI:END>
@group(0) @binding(0) var srcTex: texture_2d<f32>;
@group(0) @binding(1) var axialTex: texture_2d<f32>;
@group(0) @binding(2) var dstTex: texture_storage_2d<rgba16float, write>;
@group(0) @binding(3) var<uniform> U: Params;
@group(0) @binding(4) var policyTex: texture_2d<f32>;
var<workgroup> tile: array<vec4<f32>, 576>;
// <TDT:R6:COORDINATE:BEGIN>
fn sourcePosition(dstCoord: vec2<u32>) -> vec2<f32> {
  return (vec2<f32>(dstCoord) + vec2<f32>(0.5)) * U.srcPerDst - vec2<f32>(0.5);
}
fn sourceBase(p: vec2<f32>) -> vec2<i32> { return vec2<i32>(floor(p)); }
// <TDT:R6:COORDINATE:END>
// <TDT:R6:BORDER:BEGIN>
fn clampSourceFetchCoord(logicalCoord: vec2<i32>) -> vec2<i32> {
  return clamp(logicalCoord, vec2<i32>(0), vec2<i32>(U.inSize) - vec2<i32>(1));
}
fn loadSourceClamped(logicalCoord: vec2<i32>) -> vec4<f32> {
  return textureLoad(srcTex, clampSourceFetchCoord(logicalCoord), 0);
}
fn loadAxialClamped(logicalCoord: vec2<i32>) -> vec4<f32> {
  return textureLoad(axialTex, clampSourceFetchCoord(logicalCoord), 0);
}
// <TDT:R6:BORDER:END>
fn sampleTileStrict(logicalCoord: vec2<i32>, tileOrigin: vec2<i32>) -> vec4<f32> {
  let localCoord = logicalCoord - tileOrigin;
  return tile[u32(localCoord.y) * TILE_W + u32(localCoord.x)];
}
// <TDT:R6:AXIAL:BEGIN>
fn sanitizeAxial(raw: vec4<f32>) -> vec4<f32> {
  let q2 = dot(raw.rg, raw.rg);
  if (!all(isFinite(raw)) || !isFinite(q2) || q2 <= EPS * EPS) { return vec4<f32>(1.0, 0.0, 0.0, 0.0); }
  let q = raw.rg * inverseSqrt(q2);
  return vec4<f32>(q, clamp(raw.b, 0.0, 1.0), clamp(raw.a, 0.0, 1.0));
}
fn sampleAxial(p: vec2<f32>) -> vec4<f32> {
  let base = sourceBase(p);
  let f = p - vec2<f32>(base);
  let w00 = (1.0 - f.x) * (1.0 - f.y);
  let w10 = f.x * (1.0 - f.y);
  let w01 = (1.0 - f.x) * f.y;
  let w11 = f.x * f.y;
  let s00 = sanitizeAxial(loadAxialClamped(base + vec2<i32>(0, 0)));
  let s10 = sanitizeAxial(loadAxialClamped(base + vec2<i32>(1, 0)));
  let s01 = sanitizeAxial(loadAxialClamped(base + vec2<i32>(0, 1)));
  let s11 = sanitizeAxial(loadAxialClamped(base + vec2<i32>(1, 1)));
  let accumulator = w00 * s00.b * s00.rg + w10 * s10.b * s10.rg + w01 * s01.b * s01.rg + w11 * s11.b * s11.rg;
  let coherenceMass = w00 * s00.b + w10 * s10.b + w01 * s01.b + w11 * s11.b;
  let edge = clamp(w00 * s00.a + w10 * s10.a + w01 * s01.a + w11 * s11.a, 0.0, 1.0);
  let magnitude = length(accumulator);
  if (!isFinite(magnitude) || magnitude <= EPS) { return vec4<f32>(1.0, 0.0, 0.0, edge); }
  return vec4<f32>(accumulator / magnitude, clamp(min(magnitude, coherenceMass), 0.0, 1.0), edge);
}
fn tangentFromAxial(qRaw: vec2<f32>) -> vec2<f32> {
  let q2 = dot(qRaw, qRaw);
  if (!all(isFinite(qRaw)) || !isFinite(q2) || q2 <= EPS * EPS) { return vec2<f32>(1.0, 0.0); }
  let q = qRaw * inverseSqrt(q2);
  let tx = sqrt(max(0.0, 0.5 * (1.0 + q.x)));
  if (tx <= EPS) { return vec2<f32>(0.0, 1.0); }
  var tangent = normalize(vec2<f32>(tx, q.y / (2.0 * tx)));
  if (tangent.x < 0.0 || (abs(tangent.x) <= EPS && tangent.y < 0.0)) { tangent = -tangent; }
  return tangent;
}
fn ellipseField(axial: vec4<f32>, policy: vec4<f32>) -> vec4<f32> {
  let tangent = tangentFromAxial(axial.rg);
  let normal = vec2<f32>(-tangent.y, tangent.x);
  let scaleT = max(1.0, length(tangent * U.srcPerDst));
  let scaleN = max(1.0, length(normal * U.srcPerDst));
  let edge = smoothstep(U.edgeLow, U.edgeHigh, clamp(axial.a, 0.0, 1.0));
  let gate = pow(clamp(axial.b, 0.0, 1.0), max(U.coherenceExponent, 0.0001)) * edge * clamp(policy.g, 0.0, 1.0) * clamp(policy.a, 0.0, 1.0);
  let anisotropy = exp2(gate * log2(max(U.maxAnisotropy, 1.0)));
  let root = sqrt(anisotropy);
  let footprint = max(policy.b, 0.75);
  let major = min(U.maxSampleReach, max(1.0, scaleT * max(U.sigmaMain, 0.0001) * root * footprint));
  let minor = max(U.minorCoverageFactor, scaleN * max(U.sigmaCross, 0.0001) / root * footprint);
  return vec4<f32>(tangent, major, minor);
}
// <TDT:R6:AXIAL:END>
// <TDT:R6:KERNEL:BEGIN>
fn ellipseDistance(delta: vec2<f32>, field: vec4<f32>) -> f32 {
  let tangent = field.rg;
  let normal = vec2<f32>(-tangent.y, tangent.x);
  let along = dot(delta, tangent) / field.b;
  let across = dot(delta, normal) / field.a;
  return along * along + across * across;
}
fn kernelWeight(q: f32) -> f32 {
  if (!isFinite(q) || q < 0.0 || q > 1.0) { return 0.0; }
  let radial = exp(-U.kernelSharpness * q);
  let taperBase = max(0.0, 1.0 - q);
  let taper = pow(taperBase, U.kernelTaperExponent);
  let weight = radial * taper;
  return select(0.0, weight, isFinite(weight) && weight > 0.0);
}
// <TDT:R6:KERNEL:END>
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(workgroup_id) workgroupId: vec3<u32>, @builtin(local_invocation_index) localIndex: u32, @builtin(global_invocation_id) gid: vec3<u32>) {
  if (!r6ContractValid()) { return; }
  let groupOrigin = workgroupId.xy * vec2<u32>(WG_W, WG_H);
  let lastActive = min(groupOrigin + vec2<u32>(WG_W - 1u, WG_H - 1u), U.outSize - vec2<u32>(1u));
  let firstP = sourcePosition(groupOrigin);
  let lastP = sourcePosition(lastActive);
  let baseMin = vec2<i32>(floor(min(firstP, lastP)));
  let tileOrigin = baseMin - vec2<i32>(HALO);
  var preloadIndex = localIndex;
  loop {
    if (preloadIndex >= TILE_ELEMENTS) { break; }
    let tileX = preloadIndex % TILE_W;
    let tileY = preloadIndex / TILE_W;
    tile[preloadIndex] = loadSourceClamped(tileOrigin + vec2<i32>(i32(tileX), i32(tileY)));
    preloadIndex += WORKGROUP_INVOCATIONS;
  }
  workgroupBarrier();
  if (gid.x >= U.outSize.x || gid.y >= U.outSize.y) { return; }
  let p = sourcePosition(gid.xy);
  let base = sourceBase(p);
  let policySize = textureDimensions(policyTex);
  let policyCoord = clamp(vec2<i32>(floor((p + vec2<f32>(0.5)) / vec2<f32>(U.inSize) * vec2<f32>(policySize))), vec2<i32>(0), vec2<i32>(policySize) - vec2<i32>(1));
  let policyRaw = textureLoad(policyTex, policyCoord, 0);
  let policy = select(vec4<f32>(1.0), policyRaw, (U.flags & 1u) != 0u);
  let field = ellipseField(sampleAxial(p), policy);
  var accumulated = vec4<f32>(0.0);
  var weightSum = 0.0;
  for (var offsetY: i32 = -MAX_REACH; offsetY <= MAX_REACH; offsetY++) {
    for (var offsetX: i32 = -MAX_REACH; offsetX <= MAX_REACH; offsetX++) {
      let logicalSampleCoord = base + vec2<i32>(offsetX, offsetY);
      let delta = vec2<f32>(logicalSampleCoord) - p;
      let weight = kernelWeight(ellipseDistance(delta, field));
      if (weight > 0.0) { accumulated += sampleTileStrict(logicalSampleCoord, tileOrigin) * weight; weightSum += weight; }
    }
  }
  let center = sampleTileStrict(base, tileOrigin);
  textureStore(dstTex, vec2<i32>(gid.xy), select(center, accumulated / weightSum, weightSum > EPS));
}
