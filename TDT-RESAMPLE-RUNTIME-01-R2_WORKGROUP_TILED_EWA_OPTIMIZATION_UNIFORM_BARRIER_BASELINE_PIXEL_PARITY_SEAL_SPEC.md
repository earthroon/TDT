# TDT-RESAMPLE-RUNTIME-01-R2

## Workgroup Tiled EWA Optimization / Uniform Barrier / Baseline Pixel Parity Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R2`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R1D`
- **Parent ZIP:** `53_TDT_RESAMPLE_RUNTIME_01_R1D_ADAPTIVE_ENGINEAUTO_WORKER_COMPATIBILITY_PREVIEW_EXPORT_SHARED_SURFACE_SOURCE_BAKED_AWAITING_PACKAGED_GPU.zip`
- **Parent ZIP SHA-256:** `e931447b7c3863afe60a15ec062d92ecd8bdc1b21d2f718883e329ccd1f0a1f8`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R1D_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target source state:** `RESAMPLE_RUNTIME_R2_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target verified state:** `RESAMPLE_RUNTIME_R2_VERIFIED_UNPROMOTED`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Primary runtime:** WebGPU
- **Primary kernel language:** WGSL
- **Product execution realm:** renderer-owned GPU Authority
- **Reference execution realm:** same renderer, same device, same device epoch
- **CPU image-processing fallback:** forbidden
- **WebGL resample fallback:** forbidden
- **Canvas resample fallback:** forbidden
- **Runtime auto-tuning:** forbidden
- **Image-content-dependent profile selection:** forbidden

---

# 0. Executive Contract

R2 shall optimize the existing R1C canonical anisotropic EWA kernel in place.

R2 shall not replace the R1C mathematics, public facade, stage planner, tensor field, Adaptive policy field, Worker broker, Final Surface publication, Preview consumption, or Export consumption.

The following chain remains authoritative:

```text
R1B deterministic stage plan
    ↓
R1C stage-local integrated structure tensor
    ↓
R1D stage-aligned Adaptive policy field when enabled
    ↓
R2 workgroup-tiled canonical EWA
    ↓
R1D shared Final Surface tuple
    ├─ Preview Presenter
    └─ Export Authority
```

R2 shall preserve the direct-load R1C reference kernel as the pixel truth baseline.

R2 shall permit a tiled product kernel to be selected only when all of the following are proven:

1. the selected tile profile covers every source sample that may receive non-zero weight,
2. no invocation can bypass the workgroup barrier,
3. no tile slot is read before all cooperative writes complete,
4. the tiled result matches the direct-load baseline under the sealed parity contract,
5. the tiled result is measurably faster under the sealed timestamp protocol,
6. the optimization does not alter Final Surface identity, dimensions, revisions, or resample receipt semantics.

Correctness precedes performance.

A performance improvement without baseline parity shall be classified as a failed optimization, not as an acceptable quality tradeoff.

---

# 1. Parent Truth and Current Implementation

## 1.1 Current canonical product shader

The R1D parent uses:

```text
Shader: ewa_aniso_tile_v3.wgsl
SHA-256: c1b8dab861942d59634c0482024ba6056d819027bc8efa293aa1ffbfe6d84641
Workgroup: 8 × 8
Invocations: 64
Maximum physical reach: 6 source texels
Shared tile: 28 × 28
Shared elements: 784 vec4<f32>
Shared bytes: 12,544
Candidate lattice: 13 × 13 = 169 candidates per output pixel
```

The current product shader already satisfies the predecessor barrier shape:

```text
cooperative tile load
→ workgroupBarrier()
→ bounds return
→ EWA evaluation
```

R2 shall preserve that ordering or prove an equivalent ordering with exactly the same safety properties.

## 1.2 Current direct-load reference shader

The parent reference is:

```text
Shader: ewa_aniso_reference_v2_r1c.wgsl
SHA-256: bfd0e2d94e15467379b92c9c2ed4a3555be1d1b0a9a67b4f0f167eb550dbc4eb
Workgroup: 8 × 8
Shared memory: none
Maximum physical reach: 6 source texels
Candidate lattice: 13 × 13
```

The parent reference digest is a baseline identity.

R2 shall not silently modify this file and then compare the product against the modified copy.

If a reference correction becomes necessary, it requires a separate truth patch and a new parent baseline. It is out of scope for R2.

## 1.3 Current tile fallback

The current product helper has the following semantic form:

```wgsl
if sample lies inside shared tile:
    return workgroup tile value
else:
    return direct textureLoad value
```

This fallback preserves pixels, but it prevents the current code from proving that the tile geometry actually covers the admitted EWA footprint.

R2 shall replace “fallback happens to preserve correctness” with “coverage proof guarantees fallback count is zero.”

## 1.4 Current candidate cost

Every output pixel executes the full `-6..6` lattice even when the admitted ellipse cannot extend beyond four source texels.

The current fixed candidate count is:

```text
13 × 13 = 169 candidate positions per output pixel
```

R2 introduces a smaller compile-time profile only when an exact upper bound proves that no non-zero sample can exist outside `-4..4`.

The compact candidate count is:

```text
9 × 9 = 81 candidate positions per output pixel
```

## 1.5 Current submission timing is not promotion evidence

`queue.onSubmittedWorkDone()` proves completion, but it does not isolate EWA GPU duration.

JavaScript wall-clock timing includes:

- command encoding,
- queue scheduling,
- unrelated renderer work,
- event-loop delay,
- browser throttling,
- and synchronization overhead.

R2 performance promotion therefore requires GPU timestamps when the adapter and admitted device expose `timestamp-query`.

Wall-clock results may be recorded as diagnostics but shall not satisfy the performance seal.

---

# 2. Scope

## 2.1 In scope

R2 shall implement and seal:

1. a deterministic tiled-kernel profile selector,
2. a compact reach-4 product shader,
3. a full reach-6 product shader,
4. exact tile geometry for each profile,
5. static workgroup-storage admission,
6. exact stage footprint upper-bound calculation,
7. profile selection from stage parameters only,
8. cooperative source-tile loading,
9. uniform barrier participation,
10. strict shared-tile sampling in the product shader,
11. a validation-only fallback counter shader,
12. a GPU-side product/reference parity comparator,
13. same-device same-epoch baseline parity,
14. deterministic correctness fixtures,
15. deterministic benchmark fixtures,
16. optional `timestamp-query` admission through GPU Authority,
17. paired product/reference GPU timing,
18. warmup and measurement ordering,
19. resource-budget receipts,
20. performance receipts,
21. device-loss invalidation,
22. pipeline-cache identity separation,
23. source, mock-runtime, physical-GPU, and packaged gates.

## 2.2 Out of scope

R2 shall not change:

- the R1C Tensor Field schema,
- Scharr gradient mathematics,
- Gaussian tensor integration,
- eigenvalue or coherence mathematics,
- R1C ellipse mathematics,
- R1D Adaptive policy semantics,
- R1B stage dimensions,
- source or destination color domain,
- alpha or hidden-RGB policy,
- encoder behavior,
- Preview presentation transform,
- Export codec selection,
- Worker protocol semantics,
- Final Surface tuple semantics,
- CPU readback policy,
- Production Pointer.

R2 shall not claim hardware occupancy because WebGPU does not expose vendor occupancy counters through the admitted runtime.

R2 may report static resource budgets and measured GPU duration. It shall not rename those values as occupancy.

---

# 3. Non-Breakage Contract

## 3.1 Public facades

The following public interfaces remain admitted:

```javascript
createDeltaKStack(device, existingPipes?)
runDeltaKStack(request)
runDeltaKStack(device, pipes, frameInputs)
downscaleRGBAWithWGSL(rgba, srcW, srcH, dstW, dstH, opts?)
createAdaptiveEwaDownscalePass(...)
downscaleAuto(...)
```

No caller shall be required to select a tile profile directly.

## 3.2 Pipeline bundle

`pipeEWA` remains the caller-visible bundle key.

R2 may extend the internal bundle:

```javascript
pipeEWA = {
  canonical,          // compatibility alias to the selected canonical product family
  tiledR4,
  tiledR6,
  validationR4,
  validationR6,
  reference,
  comparator,
  legacyV2,
  neutralPolicyTexture,
  ...existingIdentity
}
```

Existing code that reads `pipeEWA.canonical` shall continue to receive an admitted canonical product pipeline.

## 3.3 EWA parameter ABI

The canonical R1C EWA parameter ABI remains:

```text
ABI ID: tdt.delta-k-ewa.params.v3
Byte length: 80
ABI version: 0x0001000c
```

R2 shall not change any pixel-affecting field or its offset.

Optimization-profile identity shall not be smuggled into an unused parameter bit unless that bit is formally added to the ABI schema.

The selected profile shall be represented by pipeline identity and receipt metadata, not by changing EWA mathematics.

## 3.4 Final Surface contract

R2 shall not change:

```text
surfaceId
sourceRevision
finalRevision
pipelineReceiptId
resampleReceiptId
resampleReceiptDigest
sharedSurfaceTupleDigest
```

The optimized and baseline kernels are alternative implementations of the same admitted stage, not alternative Final Surface authorities.

---

# 4. Baseline Identity Seal

## 4.1 Parent baseline files

R2 shall pin at least the following parent identities in its source receipt:

```text
ewa_aniso_reference_v2_r1c.wgsl
  bfd0e2d94e15467379b92c9c2ed4a3555be1d1b0a9a67b4f0f167eb550dbc4eb

ewa_aniso_tile_v3.wgsl
  c1b8dab861942d59634c0482024ba6056d819027bc8efa293aa1ffbfe6d84641

ewa_aniso_tile.mjs
  cd51d4b9537ab3fde28f7b63da2553e84b6d55c6198392c7837234f132f54f8c

ewa_aniso_params_v3.mjs
  7a46125442b519bd7b65b98b319260b1b7fcce5b46e98a4632f73d795accdc62

ewa_aniso_contract.mjs
  7bcca59dada980af953bf8ac369bbf54f838c4e07eba8103158d4ffc2b489141
```

## 4.2 Reference immutability

The reference shader shall be copied into the R2 verification receipt by digest, not by path alone.

The following shall fail the parity gate:

- reference digest missing,
- reference digest changed without an explicit baseline revision,
- product and reference digest equal,
- product pipeline accidentally bound for both comparison outputs,
- one output compared against itself.

## 4.3 Same-device comparison

Pixel parity shall compare:

```text
same source texture bytes
same tensor field texture
same policy field texture
same 80-byte parameter buffer contents
same device identity
same device epoch
same output dimensions
same texture format
same stage index and count
```

Cross-device equality is not required by R2.

---

# 5. Optimization Architecture

## 5.1 Product profiles

R2 introduces two static product profiles.

### Compact profile

```text
Profile ID: tdt.ewa.tile.r2.r4-8x8-v1
Workgroup: 8 × 8
Maximum admitted reach: 4
Candidate lattice: 9 × 9
Tile extent: 24 × 24
Tile elements: 576
Workgroup storage: 9,216 bytes
```

### Full profile

```text
Profile ID: tdt.ewa.tile.r2.r6-8x8-v1
Workgroup: 8 × 8
Maximum admitted reach: 6
Candidate lattice: 13 × 13
Tile extent: 28 × 28
Tile elements: 784
Workgroup storage: 12,544 bytes
```

The full profile preserves the parent physical reach.

The compact profile may be used only when the sealed upper bound is at most four.

## 5.2 Reference profile

```text
Profile ID: tdt.ewa.reference.r1c.r6-8x8-v2
Workgroup: 8 × 8
Maximum reach: 6
Shared storage: 0
Candidate lattice: 13 × 13
```

The reference is never selected as a silent product fallback.

It is a validation baseline and diagnostic execution path.

## 5.3 Validation profiles

R2 may compile validation-only tiled shaders:

```text
tdt.ewa.tile.r2.r4-validation-v1
tdt.ewa.tile.r2.r6-validation-v1
```

Validation shaders may write atomic counters that would distort performance.

They shall never be used for performance measurement or production output.

## 5.4 Deterministic selection

Profile selection shall be a pure function of:

- stage source dimensions,
- stage destination dimensions,
- sealed EWA parameters,
- sealed Adaptive policy bounds,
- device static limits,
- and kernel profile constants.

It shall not depend on:

- image pixels,
- measured runtime speed,
- previous frame timing,
- GPU temperature,
- user-agent string,
- adapter vendor string,
- random values,
- or wall-clock time.

---

# 6. Exact Footprint Upper Bound

## 6.1 Scale bound

For the stage scale vector:

```text
srcPerDst = (sourceWidth / outputWidth, sourceHeight / outputHeight)
```

The maximum directional scale is:

```text
scaleBound = max(srcPerDst.x, srcPerDst.y)
```

This bound is valid for every unit tangent and normal direction.

## 6.2 Adaptive footprint bound

When no Adaptive policy field is consumed:

```text
policyFootprintBound = 1.0
policyInfluenceBound = 1.0
policyDeGateBound = 1.0
```

When the R1D policy is consumed:

```text
policyFootprintBound = max(
  level0FootprintScale,
  level1FootprintScale,
  level2FootprintScale
)
```

The admitted R1D bound is:

```text
0.75 <= policyFootprintBound <= 1.5
```

## 6.3 Anisotropy bound

The R1C maximum anisotropy is bounded by the normalized request:

```text
1.0 <= maxAnisotropy <= 4.0
```

The maximum root stretch is:

```text
rootAnisotropyBound = sqrt(maxAnisotropy)
```

## 6.4 Major-axis bound

The shader major radius is bounded by:

```text
majorUnclamped =
  scaleBound
  × sigmaMain
  × rootAnisotropyBound
  × policyFootprintBound

majorBound = min(maxSampleReach, max(1.0, majorUnclamped))
```

## 6.5 Minor-axis bound

The shader minor radius is bounded by:

```text
minorUnclamped =
  scaleBound
  × sigmaCross
  × policyFootprintBound

minorBound = max(minorCoverageFactor, minorUnclamped)
```

Because division by `rootAnisotropy` can only reduce the minor radius, omitting that division produces a conservative bound.

## 6.6 Required integer reach

```text
requiredReach = ceil(max(majorBound, minorBound) - epsilon)
```

The epsilon shall be a fixed schema constant and shall not depend on runtime floating noise.

Proposed constant:

```text
FOOTPRINT_BOUND_EPSILON = 1e-6
```

Selection:

```text
requiredReach <= 4 → compact R4
requiredReach <= 6 → full R6
requiredReach > 6  → fail stage support
```

R2 shall not clamp a profile-selection result from seven to six and then claim complete coverage.

If the mathematical upper bound exceeds the admitted lattice, R1B stage planning or parameters must be corrected.

---

# 7. Tile Geometry

## 7.1 Compile-time tile formula

For workgroup width `W`, maximum stage ratio `S`, and profile reach `R`:

```text
maximum center span = ceil((W - 1) × S)
safety margin       = 2
required tile width = maximum center span + 2R + safety margin
```

With:

```text
W = 8
S = 2
```

The profiles are:

```text
R4: 14 + 8  + 2 = 24
R6: 14 + 12 + 2 = 28
```

The same formula applies to height.

## 7.2 Workgroup-common origin

Tile origin shall depend only on:

- `workgroup_id`,
- uniform stage dimensions,
- uniform `srcPerDst`,
- profile reach,
- and fixed profile constants.

It shall not depend on `global_invocation_id` or `local_invocation_id` except for cooperative slot assignment.

## 7.3 Partial output groups

The exact last valid output coordinate is:

```text
lastOutput = min(groupOrigin + workgroupExtent - 1, outSize - 1)
```

R2 may use this value to calculate a smaller `usedTileWidth` and `usedTileHeight` for edge workgroups.

The workgroup array remains statically sized.

Only the number of source texture loads may shrink.

Unused slots shall not be read.

## 7.4 Fixed row stride

Shared array addressing shall use the compile-time profile tile width as row stride.

```text
tileIndex = localY × TILE_WIDTH + localX
```

Dynamic used width shall not become the row stride, because different invocations must agree on every index.

## 7.5 Border policy

Source coordinates outside the image shall be clamped exactly as in the direct reference.

Tiling shall not introduce a different border mode.

---

# 8. Uniform Barrier Contract

## 8.1 Barrier count

Each product EWA workgroup shall execute exactly one workgroup barrier between cooperative source writes and EWA source reads.

## 8.2 No early exit

No invocation may execute any of the following before the barrier:

```wgsl
return;
discard;
break from an outer control path that bypasses the barrier;
```

Bounds-invalid output lanes shall still participate in cooperative loading and the barrier.

They may return immediately after the barrier.

## 8.3 No conditional barrier

The barrier shall not be nested under a condition that can differ among invocations.

## 8.4 Read/write phases

The shader phases shall remain:

```text
Phase A: calculate common tile metadata
Phase B: cooperative writes to workgroup tile
Phase C: workgroupBarrier
Phase D: output bounds test
Phase E: read-only tile sampling and EWA accumulation
Phase F: output write
```

No workgroup tile write is admitted after Phase C.

## 8.5 Loop convergence

Cooperative load loops may execute different iteration counts per lane because they contain no barrier.

All lanes must eventually reach the single barrier.

The loop bound shall be finite and derived from a compile-time maximum tile element count.

---

# 9. Cooperative Load Contract

## 9.1 Slot ownership

Each shared slot is written by exactly one invocation according to:

```text
slot = localInvocationIndex + n × workgroupInvocationCount
```

No slot may have two writers.

Every slot that can be read shall have one writer.

## 9.2 Compact profile load count

For a full interior workgroup:

```text
576 shared elements / 64 lanes
= 9 writes per lane
```

The compact shader shall not load 784 values and merely ignore the extra region.

## 9.3 Full profile load count

For a full interior workgroup:

```text
784 shared elements / 64 lanes
= 12 or 13 writes per lane
```

The unequal lane counts are admitted because the barrier is after all loops and every slot has one owner.

## 9.4 Edge load reduction

If exact used-tile dimensions are implemented, validation shall prove:

- every read is inside the used region,
- no skipped slot is read,
- edge output matches the direct reference,
- and source load count is lower for partial groups.

Edge-load reduction is optional for R2 source completion.

Zero-fallback coverage and baseline parity are mandatory.

---

# 10. Strict Shared-Tile Sampling

## 10.1 Product behavior

The production R2 shaders shall not silently call `textureLoad(srcTex, ...)` from the EWA sample loop when a sample lies outside the shared tile.

The product sample path shall be semantically equivalent to:

```wgsl
fn sampleTileStrict(sourceCoord: vec2<i32>, tileOrigin: vec2<i32>) -> vec4<f32> {
  let local = sourceCoord - tileOrigin;
  return tile[u32(local.y) * TILE_WIDTH + u32(local.x)];
}
```

This function is admitted only after host-side footprint and tile-geometry validation proves the index range.

## 10.2 Validation behavior

The validation shader shall check tile bounds before the read and atomically increment:

```text
tileFallbackRequiredCount
```

It may use a direct source load to complete the validation output after counting.

The counter must be zero for every mandatory correctness and performance fixture before the strict product shader is admitted.

## 10.3 No undefined indexing

A strict product shader shall never rely on WebGPU validation to catch a negative coordinate converted to `u32`.

Host admission and validation-shader evidence must establish:

```text
0 <= local.x < TILE_WIDTH
0 <= local.y < TILE_HEIGHT
```

for every positive-weight candidate.

---

# 11. Candidate-Lattice Optimization

## 11.1 R4 compile-time lattice

The compact shader shall compile with:

```wgsl
const MAX_REACH: i32 = 4;
```

Its loops shall be exactly:

```text
x = -4..4
y = -4..4
```

## 11.2 R6 compile-time lattice

The full shader shall compile with:

```wgsl
const MAX_REACH: i32 = 6;
```

Its loops remain:

```text
x = -6..6
y = -6..6
```

## 11.3 Arithmetic preservation

Within the admitted lattice, R2 shall preserve:

- tangent canonicalization,
- scale projection,
- coherence gate,
- edge gate,
- Adaptive influence,
- ΔE gate,
- anisotropy expression,
- major and minor radius expressions,
- quadratic ellipse membership,
- radial weight expression,
- accumulation order,
- center fallback,
- and final division.

R2 shall not introduce fast-math approximations as part of the tiled optimization.

## 11.4 No subgroup dependency

R2 shall not require WebGPU subgroup features.

Subgroup optimization requires a separate patch because it changes feature admission and execution structure.

---

# 12. Pipeline and Cache Identity

## 12.1 Shader assets

Proposed shader assets:

```text
shaders/ewa_aniso_tile_r4_r2.wgsl
shaders/ewa_aniso_tile_r6_r2.wgsl
shaders/ewa_aniso_tile_r4_validation_r2.wgsl
shaders/ewa_aniso_tile_r6_validation_r2.wgsl
shaders/ewa_aniso_parity_compare_r2.wgsl
```

The parent reference remains:

```text
shaders/ewa_aniso_reference_v2_r1c.wgsl
```

## 12.2 Pipeline keys

Pipeline cache keys shall include:

```text
deviceEpoch
shaderDigest
entryPoint
EWA ABI ID
profile ID
bind-group-layout digest
validation instrumentation mode
```

R4 and R6 must never collide in the pipeline cache.

Validation and product pipelines must never collide.

## 12.3 Product alias

The bundle may expose `canonical` as a dynamic alias selected per request.

The actual dispatch receipt shall record the concrete profile pipeline identity.

A generic alias alone is insufficient evidence.

---

# 13. Runtime Profile Selection

## 13.1 Selector module

Proposed module:

```text
core/compute/qmap_webgpu/ewa_tiled_profile_r2.mjs
```

Exports:

```javascript
computeEwaFootprintUpperBound(request)
selectEwaTiledProfile(request, deviceLimits)
verifyEwaTileCoverage(request, profile)
```

## 13.2 Selection result

```javascript
{
  selectorId: 'tdt.ewa.tile-selector.r2.v1',
  profileId,
  requiredReach,
  majorBound,
  minorBound,
  scaleBound,
  policyFootprintBound,
  workgroup: { x: 8, y: 8 },
  tile: { width, height, bytes },
  candidateCount,
  proofDigest
}
```

## 13.3 Device limits

Selection shall verify at minimum:

```text
maxComputeInvocationsPerWorkgroup >= 64
maxComputeWorkgroupSizeX >= 8
maxComputeWorkgroupSizeY >= 8
maxComputeWorkgroupStorageSize >= selected tile bytes
```

Missing or non-finite limits shall fail closed in canonical product mode.

The selector shall not guess WebGPU minimum limits when the current device object reports an unusable value.

## 13.4 No direct reference fallback

If neither tiled profile is admitted, canonical product execution shall fail with a stable error.

The runtime shall not silently switch to the direct reference and then claim tiled optimization.

A caller may explicitly request diagnostic reference execution through a non-product verification API.

---

# 14. GPU-Side Pixel Parity Comparator

## 14.1 Comparator inputs

The comparator consumes:

```text
product rgba16float texture
reference rgba16float texture
output dimensions
comparison mode
```

## 14.2 Summary output

The comparator writes a small storage buffer containing at least:

```text
pixelCount
channelCount
exactMismatchCount
finiteMismatchCount
nanCount
infinityCount
maxAbsoluteErrorBits
firstMismatchX
firstMismatchY
firstMismatchChannel
```

The comparison buffer is the only mandatory readback for parity.

Full image readback is not required.

## 14.3 Exact same-device seal

For finite output channels, the canonical same-device gate requires:

```text
exactMismatchCount = 0
nanCount = 0
infinityCount = 0
```

Because both outputs are stored as `rgba16float`, exact decoded numerical equality is the primary same-device baseline contract.

## 14.4 Diagnostic tolerance

The comparator may additionally record:

```text
absolute error <= 1e-5
absolute error <= one local half-float ULP
```

These diagnostics do not convert an exact mismatch into a pass.

If exact parity cannot be maintained, the arithmetic change must be separated from R2 and reviewed as an algorithm patch.

## 14.5 Signed zero

`+0.0` and `-0.0` compare numerically equal through texture loads.

R2 seals pixel semantics, not hidden sign bits that cannot be observed through the admitted texture-load comparison path.

---

# 15. Shadow Parity Execution

## 15.1 Verification mode only

Shadow parity execution is admitted only under an explicit verification flag or test harness.

Production output shall not dispatch both kernels.

## 15.2 Execution sequence

```text
build one tensor field
build one Adaptive policy field when enabled
allocate product output
allocate reference output
dispatch selected tiled product
dispatch parent direct reference
dispatch GPU comparator
read comparator summary
fence
dispose verification outputs and summary buffers
```

The tensor and policy fields must be shared between the two dispatches.

## 15.3 Output authority

Shadow reference output shall never become the published Final Surface.

The reference output is test evidence only.

## 15.4 Failure handling

Any comparator mismatch shall:

- reject the verification run,
- retain a bounded receipt with fixture identity,
- dispose both verification outputs after evidence capture,
- and prevent performance promotion.

---

# 16. Correctness Fixture Matrix

## 16.1 Constant fixtures

- transparent black,
- opaque black,
- opaque white,
- constant mid-gray,
- constant saturated red,
- constant premultiplied-alpha color.

## 16.2 Impulse fixtures

- center impulse,
- corner impulse,
- edge impulse,
- one-pixel alpha impulse.

## 16.3 Direction fixtures

- horizontal edge,
- vertical edge,
- 45-degree edge,
- 135-degree edge,
- one-pixel horizontal line,
- one-pixel vertical line,
- diagonal line,
- curved arc.

## 16.4 Frequency fixtures

- one-pixel checkerboard,
- two-pixel checkerboard,
- alternating stripes,
- deterministic zone plate,
- deterministic chirp,
- text-like glyph grid.

## 16.5 Tensor fixtures

- flat field,
- high-coherence edge,
- isotropic crossing,
- corner,
- deterministic low-energy noise,
- high-energy directional texture.

## 16.6 Adaptive fixtures

- neutral policy,
- level-0-only policy,
- level-1-only policy,
- level-2-only policy,
- spatially alternating policy levels,
- maximum admitted footprint scale.

## 16.7 Dimension fixtures

Mandatory boundary dimensions include:

```text
1, 2, 3, 4, 7, 8, 9,
15, 16, 17,
23, 24, 25,
27, 28, 29,
63, 64, 65,
127, 128, 129
```

The matrix shall include square and non-square pairs.

## 16.8 Stage ratios

Mandatory ratios include:

```text
1.0
1.125
1.25
1.333333...
1.5
1.75
2.0
odd-grid terminal ratios admitted by R1B
```

---

# 17. Validation Instrumentation

## 17.1 Atomic counters

Validation tiled shaders shall record at least:

```text
workgroupCount
cooperativeSourceLoadCount
tileSampleReadCount
tileFallbackRequiredCount
positiveWeightCandidateCount
totalCandidateCount
centerFallbackCount
outOfBoundsOutputLaneCount
```

## 17.2 Mandatory invariants

```text
tileFallbackRequiredCount = 0
cooperativeSourceLoadCount <= profile maximum × workgroupCount
positiveWeightCandidateCount <= totalCandidateCount
centerFallbackCount is deterministic for the fixture
```

## 17.3 Instrumentation separation

Atomic counters alter memory traffic and scheduling.

Validation pipelines shall not be used for performance thresholds.

The receipt shall state whether instrumentation was enabled.

---

# 18. GPU Timestamp Admission

## 18.1 GPU Authority profile extension

The GPU Authority profile shall support an optional feature list:

```json
{
  "optionalFeatures": ["timestamp-query"]
}
```

The Authority shall request an optional feature only when the selected adapter exposes it.

The actual admitted feature set shall become part of device identity and the GPU Authority receipt.

## 18.2 Product independence

Product EWA execution shall not require `timestamp-query`.

Correctness verification can complete without it.

Performance promotion gates remain deferred when it is unavailable.

## 18.3 No device re-request outside Authority

The benchmark harness shall not call:

```javascript
navigator.gpu.requestAdapter()
adapter.requestDevice()
```

to obtain a timestamp-enabled side device.

All timing uses the canonical GPU Authority device.

## 18.4 Timestamp method

The preferred method is compute-pass `timestampWrites` with a GPUQuerySet.

The harness shall record raw timestamp deltas and ratio metrics.

It shall not assume a vendor-specific clock period unless the WebGPU implementation provides an admitted conversion contract.

---

# 19. Paired Performance Protocol

## 19.1 Warmup

Each pipeline and fixture combination requires at least:

```text
64 untimed warmup dispatches
```

Warmup shall include both product and reference.

## 19.2 Measurement

Each mandatory fixture requires at least:

```text
128 valid product samples
128 valid reference samples
```

Measurements shall be collected in bounded batches.

## 19.3 Alternating order

To reduce thermal and ordering bias, pair order alternates:

```text
pair 0: product → reference
pair 1: reference → product
pair 2: product → reference
...
```

The order sequence is deterministic and receipt-bound.

## 19.4 Same resources

Within a pair:

- source texture is identical,
- tensor texture is identical,
- policy texture is identical,
- parameter bytes are identical,
- destination dimensions are identical,
- output textures have identical format and usage,
- no image upload occurs between product and reference timing.

## 19.5 Synchronization

The harness shall not call `onSubmittedWorkDone()` between every product/reference dispatch when timestamps already establish GPU intervals.

It may fence after a bounded query batch before resolving results.

## 19.6 Outlier policy

The receipt shall retain:

- median,
- p25,
- p75,
- p95,
- minimum,
- maximum,
- median absolute deviation,
- valid sample count,
- rejected sample count,
- and rejection reasons.

Samples shall not be rejected merely because they are slow.

Only structurally invalid samples, such as missing timestamps or device loss, may be excluded.

---

# 20. Mandatory Performance Fixtures

## 20.1 Resolution set

At minimum:

```text
2048 × 2048 → 1024 × 1024
4096 × 4096 → 2048 × 2048
3840 × 2160 → 1920 × 1080
4096 × 3072 → 3072 × 2304
4096 × 3072 → 2048 × 1536
```

## 20.2 Profile coverage

The fixture set shall force:

- at least two R4 selections,
- at least two R6 selections,
- neutral policy,
- maximum Adaptive footprint policy,
- high coherence,
- low coherence,
- and partial edge workgroups.

## 20.3 No benchmark-only parameters

Benchmark parameters must be valid product parameters.

The harness shall not choose unrealistic radii solely to make the compact shader win.

---

# 21. Performance Thresholds

Performance thresholds apply only after exact pixel parity passes.

## 21.1 Compact profile threshold

For mandatory R4 fixtures with at least one megapixel of output:

```text
median tiled GPU delta / median reference GPU delta <= 0.80
```

## 21.2 Full profile threshold

For mandatory R6 fixtures with at least one megapixel of output:

```text
median tiled GPU delta / median reference GPU delta <= 0.90
```

## 21.3 Aggregate threshold

Across all mandatory large fixtures:

```text
geometric mean tiled/reference ratio <= 0.85
```

## 21.4 Regression ceiling

No mandatory fixture may exceed:

```text
tiled/reference median ratio > 1.03
```

A small image may be classified as dispatch-overhead dominated and excluded from the large-fixture speedup threshold, but it must still satisfy the regression ceiling if it is part of the mandatory matrix.

## 21.5 Honest failure

If the full profile fails the performance threshold while retaining exact parity, R2 may remain source-baked but cannot reach the verified state.

The product shall not silently select the reference kernel to hide a tiled regression.

---

# 22. Static Resource Budget

## 22.1 R4 budget

```text
Invocations: 64
Workgroup storage: 9,216 bytes
Source cooperative loads: <= 576 per interior workgroup
Candidate tests: 81 per valid output pixel
Tensor loads: 1 per valid output pixel
Policy loads: 1 per valid output pixel
Destination stores: 1 per valid output pixel
```

## 22.2 R6 budget

```text
Invocations: 64
Workgroup storage: 12,544 bytes
Source cooperative loads: <= 784 per interior workgroup
Candidate tests: 169 per valid output pixel
Tensor loads: 1 per valid output pixel
Policy loads: 1 per valid output pixel
Destination stores: 1 per valid output pixel
```

## 22.3 No occupancy claim

The static budget may be used to explain the optimization.

It shall not be converted into an occupancy percentage without vendor counters.

---

# 23. Receipt Model

## 23.1 Per-dispatch optimization receipt

Each canonical EWA dispatch receipt shall add:

```javascript
{
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R2',
  selectorId: 'tdt.ewa.tile-selector.r2.v1',
  selectedProfileId,
  profileShaderDigest,
  referenceShaderDigest,
  tileWidth,
  tileHeight,
  tileBytes,
  workgroupWidth,
  workgroupHeight,
  requiredReach,
  majorBound,
  minorBound,
  candidateCount,
  strictTileSampling: true,
  validationInstrumentation: false,
  parityStatus,
  performanceStatus
}
```

## 23.2 Parity receipt

```javascript
{
  fixtureId,
  deviceIdentity,
  deviceEpoch,
  sourceDigest,
  tensorReceiptDigest,
  policyReceiptDigest,
  paramsDigest,
  productPipelineIdentity,
  referencePipelineIdentity,
  exactMismatchCount,
  nanCount,
  infinityCount,
  maxAbsoluteError,
  comparatorShaderDigest,
  passed
}
```

## 23.3 Performance receipt

```javascript
{
  benchmarkProtocolId: 'tdt.ewa.r2.paired-gpu-timestamp.v1',
  fixtureId,
  selectedProfileId,
  timestampFeatureAdmitted,
  warmupCount,
  productSampleCount,
  referenceSampleCount,
  pairOrderingDigest,
  productMedianTicks,
  referenceMedianTicks,
  medianRatio,
  productP95Ticks,
  referenceP95Ticks,
  geometricMeanContribution,
  parityReceiptId,
  passed
}
```

## 23.4 Bounded ledger

Optimization, parity, and performance ledgers shall be bounded.

The default in-memory maximum is:

```text
256 dispatch receipts
128 parity receipts
128 performance receipts
```

Eviction is oldest-first and shall not affect persisted source-bake evidence.

---

# 24. Telemetry

R2 shall add explicit counters:

```text
profileR4SelectionCount
profileR6SelectionCount
profileSelectionFailureCount
strictTileDispatchCount
validationDispatchCount
referenceDispatchCount
parityPassCount
parityFailureCount
tileFallbackRequiredCount
performancePassCount
performanceFailureCount
timestampUnavailableCount
deviceLossAbortCount
```

Telemetry shall not be used as a substitute for receipts.

---

# 25. Resource Lifecycle

## 25.1 Pipeline resources

R4, R6, validation, reference, and comparator resources belong to the EWA bundle and device epoch.

They are disposed exactly once when:

- the bundle is disposed,
- the device is lost,
- or the runtime epoch ends.

## 25.2 Verification textures

Shadow product and reference output textures are verification-owned.

They shall be destroyed after comparator evidence is complete.

They shall never be inserted into the Final Surface registry as canonical outputs.

## 25.3 Query resources

GPUQuerySet, resolve buffers, and map-read buffers are benchmark-owned.

They shall be reused within a bounded benchmark session and disposed exactly once at session end or device loss.

## 25.4 Device loss

Device loss during parity or performance measurement shall:

- abort the current batch,
- reject all unresolved measurements,
- mark receipts `DEVICE_LOST`,
- dispose epoch-bound resources where possible,
- and require rebuilt pipelines before another run.

Partial timing data shall not be promoted.

---

# 26. R1D Compatibility Preservation

## 26.1 Adaptive

R2 profile selection consumes only the normalized upper bounds from R1D Adaptive policy.

It does not inspect Q-map pixels to select a profile.

## 26.2 EngineAuto

EngineAuto continues to record:

```text
requestedPolicy
executedKernelId
compatibilityMode
canonicalAnisotropicClaim
```

For canonical execution, `executedKernelId` shall identify the concrete R2 tile profile as well as the R1C ellipse kernel.

## 26.3 Worker

The renderer broker continues to own GPU execution.

The Worker does not create pipelines, query sets, or devices.

## 26.4 Preview and Export

Preview and Export continue to consume the R1D shared Final Surface tuple.

They do not observe or select R4/R6 profiles.

An optimization-profile change that preserves pixels shall not create a second Final Surface authority.

---

# 27. Stable Errors

R2 shall register stable errors including:

```text
E_R2_PROFILE_SELECTION_FAILED
E_R2_FOOTPRINT_BOUND_INVALID
E_R2_REQUIRED_REACH_EXCEEDED
E_R2_WORKGROUP_LIMIT_UNAVAILABLE
E_R2_WORKGROUP_INVOCATION_LIMIT
E_R2_WORKGROUP_SIZE_LIMIT
E_R2_WORKGROUP_STORAGE_LIMIT
E_R2_TILE_GEOMETRY_INVALID
E_R2_TILE_FALLBACK_REQUIRED
E_R2_REFERENCE_IDENTITY_MISMATCH
E_R2_REFERENCE_NOT_INDEPENDENT
E_R2_PARITY_COMPARATOR_FAILED
E_R2_PIXEL_PARITY_MISMATCH
E_R2_TIMESTAMP_QUERY_UNAVAILABLE
E_R2_TIMESTAMP_RESULT_INVALID
E_R2_PERFORMANCE_REGRESSION
E_R2_PERFORMANCE_THRESHOLD_UNMET
E_R2_BENCHMARK_DEVICE_LOST
E_R2_STALE_DEVICE_EPOCH
E_R2_VERIFICATION_RESOURCE_LEAK
```

A stable error shall carry bounded structured detail and shall not embed raw GPU objects.

---

# 28. Source Layout

Proposed additions:

```text
app/legacy-runtime/core/compute/qmap_webgpu/
  ewa_tiled_profile_r2.mjs
  ewa_parity_runtime_r2.mjs
  ewa_performance_runtime_r2.mjs
  ewa_optimization_receipt_r2.mjs
  shaders/
    ewa_aniso_tile_r4_r2.wgsl
    ewa_aniso_tile_r6_r2.wgsl
    ewa_aniso_tile_r4_validation_r2.wgsl
    ewa_aniso_tile_r6_validation_r2.wgsl
    ewa_aniso_parity_compare_r2.wgsl

tools/resample-runtime-01-r2/
  verify-source-contract.mjs
  verify-tile-geometry.mjs
  verify-profile-selection.mjs
  verify-barrier-structure.mjs
  runtime-smoke.mjs
  parity-fixture-plan.mjs
  physical-gpu-parity.mjs
  physical-gpu-performance.mjs
  gate.mjs
  finalize-source-bake.mjs
```

Proposed modifications:

```text
ewa_aniso_tile.mjs
ewa_aniso_runtime_receipt.mjs
ewa_aniso_contract.mjs
deltaK_stack_autoEWA.mjs
gpu-authority-profile.json
gpu-device-authority-service.ts
runtime-asset-manifest inputs
stable-error registry
package.json scripts
```

---

# 29. Implementation Sequence

## 29.1 R2-A baseline pin

- copy parent reference digest into the R2 contract,
- add reference-identity verification,
- add exact comparator schema,
- do not modify product execution yet.

## 29.2 R2-B profile selector

- implement footprint upper bound,
- implement R4/R6 selection,
- implement device-limit admission,
- create pure deterministic fixtures.

## 29.3 R2-C static shader variants

- derive R4 and R6 product shaders from the R1C product arithmetic,
- preserve operation order,
- use profile-specific tile constants and loop bounds,
- compile both through GPU Authority.

## 29.4 R2-D validation variants

- add atomic coverage counters,
- verify fallback-required count is zero,
- verify tile-load and candidate counts.

## 29.5 R2-E runtime dispatch

- choose a profile per stage,
- bind concrete pipeline,
- append profile receipt,
- preserve existing return and fence behavior.

## 29.6 R2-F GPU parity

- dispatch product and reference under a verification API,
- compare on GPU,
- read only the summary,
- block performance evidence on mismatch.

## 29.7 R2-G timestamp harness

- add optional timestamp feature admission,
- create paired benchmark protocol,
- generate physical evidence without production auto-tuning.

## 29.8 R2-H regression and source seal

- rerun R1A through R1D,
- rerun GPU, Surface, Preview, Export, Build, and codec gates,
- seal changed files and independent ZIP verification.

---

# 30. Source Verification Strategy

Source-only verification shall prove:

- profile constants,
- footprint-bound formulas,
- deterministic selector behavior,
- tile dimensions and storage bytes,
- no return before barrier,
- one admitted barrier,
- no product direct source fallback,
- independent reference digest,
- comparator wiring,
- receipt fields,
- GPU Authority ownership,
- optional timestamp feature semantics,
- bounded lifecycle code,
- and predecessor compatibility.

Source-only verification shall not claim actual GPU speed or pixel parity.

---

# 31. Mock Runtime Strategy

Mock runtime verification shall prove:

- R4 selection for a reach-4 request,
- R6 selection for a reach-6 request,
- rejection above reach 6,
- correct pipeline identity,
- correct bind-group layout,
- exact dispatch workgroup dimensions,
- receipt creation,
- validation mode separation,
- comparator summary handling,
- timestamp-unavailable deferral,
- stale epoch rejection,
- and exactly-once resource disposal.

Mock dispatch counts are structural evidence only.

They are not pixel or performance evidence.

---

# 32. Physical GPU Strategy

Physical GPU verification shall use the canonical Windows x64 Packaged Electron runtime and the canonical GPU Authority device.

Required evidence:

1. all R2 shaders compile,
2. bind groups validate,
3. R4/R6 product/reference parity passes,
4. fallback-required counters remain zero,
5. deterministic fixtures produce stable comparator summaries,
6. timestamp feature admission is recorded,
7. performance thresholds pass or remain honestly unverified,
8. device-loss abort behaves correctly,
9. repeated runs reach a memory plateau,
10. Preview and Export consume the unchanged shared Final Surface tuple.

---

# 33. Promotion State Rules

## 33.1 Source-baked state

`RESAMPLE_RUNTIME_R2_SOURCE_BAKED_AWAITING_PACKAGED_GPU` requires:

- all source gates pass,
- all mock gates pass,
- predecessor source gates pass,
- no Production Pointer mutation,
- and physical claims remain deferred.

## 33.2 Verified-unpromoted state

`RESAMPLE_RUNTIME_R2_VERIFIED_UNPROMOTED` additionally requires:

- physical shader compilation,
- exact product/reference pixel parity,
- zero tile fallback-required count,
- timestamp performance thresholds,
- device-loss closure,
- memory plateau,
- and packaged shared-surface continuity.

## 33.3 No automatic promotion

Neither state mutates the Production Pointer.

Promotion requires a separate explicit patch and user approval.

---

# 34. Non-Claims

R2 shall not claim:

- a new resampling algorithm,
- better visual quality than R1C,
- cross-adapter bit identity,
- vendor occupancy percentage,
- subgroup optimization,
- tensor-pass optimization,
- multi-stage submission fusion,
- zero-copy encoder integration,
- hidden-RGB redesign,
- ICC completion,
- or production promotion.

R2 claims only that the admitted tiled implementation preserves the R1C baseline pixels and satisfies the sealed resource and performance evidence.

---

# 35. Required Bake Artifacts

A completed R2 source bake shall contain:

```text
README_TDT_RESAMPLE_RUNTIME_01_R2_APPLIED.md
specs/TDT-RESAMPLE-RUNTIME-01-R2_..._SPEC.md
patches/TDT_RESAMPLE_RUNTIME_01_R2_...diff
patches/TDT_RESAMPLE_RUNTIME_01_R2_CHANGED_FILE_MANIFEST.json
artifacts/resample-runtime-01-r2/source-bake/TDT_RESAMPLE_RUNTIME_01_R2_SOURCE_RECEIPT.json
artifacts/resample-runtime-01-r2/source-bake/TDT_RESAMPLE_RUNTIME_01_R2_REGRESSION_SUMMARY.json
artifacts/resample-runtime-01-r2/source-bake/TDT_RESAMPLE_RUNTIME_01_R2_PROFILE_FIXTURES.json
artifacts/resample-runtime-01-r2/source-bake/TDT_RESAMPLE_RUNTIME_01_R2_TILE_GEOMETRY_RECEIPT.json
artifacts/resample-runtime-01-r2/source-bake/TDT_RESAMPLE_RUNTIME_01_R2_PARITY_PLAN.json
```

Physical verification shall later add:

```text
TDT_RESAMPLE_RUNTIME_01_R2_GPU_PARITY_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R2_GPU_PERFORMANCE_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R2_DEVICE_LOSS_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R2_MEMORY_PLATEAU_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R2_PACKAGED_SHARED_SURFACE_RECEIPT.json
```

---

# 36. Gate Matrix

## R2-01

**Requirement:** Parent R1D source state and ZIP SHA are recorded exactly.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-02

**Requirement:** Parent R1C reference shader digest is pinned.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-03

**Requirement:** Reference shader source is unchanged from the pinned parent baseline.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-04

**Requirement:** Product and reference shader digests differ.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-05

**Requirement:** R1C 80-byte ABI ID, version, offsets, and semantics are unchanged.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-06

**Requirement:** Public runDeltaKStack object ABI remains admitted.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-07

**Requirement:** Public runDeltaKStack positional ABI remains admitted.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-08

**Requirement:** downscaleRGBAWithWGSL return contract remains admitted.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-09

**Requirement:** R1D shared Final Surface tuple schema is unchanged.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-10

**Requirement:** Production Pointer mutation is absent.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-11

**Requirement:** R4 profile constants equal 8x8, reach 4, tile 24x24, 9216 bytes.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-12

**Requirement:** R6 profile constants equal 8x8, reach 6, tile 28x28, 12544 bytes.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-13

**Requirement:** R4 candidate lattice is exactly 9x9.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-14

**Requirement:** R6 candidate lattice is exactly 13x13.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-15

**Requirement:** Profile selector ID is stable and receipt-bound.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-16

**Requirement:** Profile selection is independent of image pixels.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-17

**Requirement:** Profile selection is independent of runtime timing.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-18

**Requirement:** Profile selection is independent of adapter vendor strings.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-19

**Requirement:** Profile selection is deterministic for identical request and limits.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-20

**Requirement:** Unknown profile IDs fail closed.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-21

**Requirement:** Scale upper bound uses max(srcPerDstX, srcPerDstY).

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-22

**Requirement:** Adaptive footprint bound uses the maximum admitted policy footprint scale.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-23

**Requirement:** Major radius upper bound conservatively includes maximum anisotropy.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-24

**Requirement:** Minor radius upper bound conservatively omits anisotropy reduction.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-25

**Requirement:** Required reach is derived from the maximum major/minor bound.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-26

**Requirement:** Required reach <=4 selects R4.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-27

**Requirement:** Required reach 5 or 6 selects R6.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-28

**Requirement:** Required reach >6 fails before dispatch.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-29

**Requirement:** Footprint bound contains no hidden hard-coded policy value outside SSOT.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-30

**Requirement:** Footprint proof digest is included in dispatch receipt.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-31

**Requirement:** Device maxComputeInvocationsPerWorkgroup admits 64.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-32

**Requirement:** Device maxComputeWorkgroupSizeX admits 8.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-33

**Requirement:** Device maxComputeWorkgroupSizeY admits 8.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-34

**Requirement:** Device workgroup storage admits selected profile bytes.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-35

**Requirement:** Missing or non-finite canonical device limits fail closed.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-36

**Requirement:** R4 and R6 pipeline cache keys cannot collide.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-37

**Requirement:** Validation and product pipeline cache keys cannot collide.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-38

**Requirement:** All new WGSL assets are digest-bound in Runtime Asset Manifest.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-39

**Requirement:** All pipelines are created through GPU Authority.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-40

**Requirement:** No adapter or device is requested outside GPU Authority.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-41

**Requirement:** R4 shader has exactly one workgroupBarrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-42

**Requirement:** R6 shader has exactly one workgroupBarrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-43

**Requirement:** No product shader return occurs before the barrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-44

**Requirement:** No conditional path can bypass the barrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-45

**Requirement:** All cooperative tile writes occur before the barrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-46

**Requirement:** All shared tile reads occur after the barrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-47

**Requirement:** No shared tile writes occur after the barrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-48

**Requirement:** Tile origin is workgroup-common.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-49

**Requirement:** Tile origin does not depend on local invocation index.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-50

**Requirement:** Each potentially read shared slot has exactly one cooperative writer.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-51

**Requirement:** R4 product source sampling has no direct texture fallback branch.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-52

**Requirement:** R6 product source sampling has no direct texture fallback branch.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-53

**Requirement:** Validation shader records fallback-required count.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-54

**Requirement:** Fallback-required count is zero for all mandatory fixtures.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-55

**Requirement:** Product local tile indexes are statically and dynamically proven in range.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-56

**Requirement:** Border clamp semantics match the direct reference.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-57

**Requirement:** Partial workgroups participate in cooperative loading and barrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-58

**Requirement:** Bounds-invalid lanes return only after the barrier.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-59

**Requirement:** R4 cooperative source load count is bounded by 576 per interior group.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-60

**Requirement:** R6 cooperative source load count is bounded by 784 per interior group.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-61

**Requirement:** R4 preserves the R1C ellipse arithmetic inside its admitted lattice.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-62

**Requirement:** R6 preserves the R1C ellipse arithmetic and accumulation order.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-63

**Requirement:** No fast-math approximation is introduced.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-64

**Requirement:** No subgroup feature is required.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-65

**Requirement:** Center fallback semantics match the direct reference.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-66

**Requirement:** Tensor and policy fields are shared between product and reference comparison.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-67

**Requirement:** Product and reference receive identical parameter bytes.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-68

**Requirement:** Product and reference execute on the same device identity and epoch.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-69

**Requirement:** Parity comparator is a GPU compute pass.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-70

**Requirement:** Parity comparator reads only product/reference outputs and dimensions.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-71

**Requirement:** Parity comparator summary buffer is bounded.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-72

**Requirement:** Parity comparator counts NaN and infinity.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-73

**Requirement:** Parity comparator records first mismatch location.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-74

**Requirement:** Exact same-device mismatch count is zero for constant fixtures.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-75

**Requirement:** Exact same-device mismatch count is zero for directional fixtures.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-76

**Requirement:** Exact same-device mismatch count is zero for frequency fixtures.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-77

**Requirement:** Exact same-device mismatch count is zero for alpha fixtures.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-78

**Requirement:** Exact same-device mismatch count is zero for Adaptive policy fixtures.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-79

**Requirement:** Exact same-device mismatch count is zero for boundary dimensions.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-80

**Requirement:** A parity failure blocks performance promotion.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-81

**Requirement:** Reference output never becomes the canonical Final Surface.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-82

**Requirement:** Verification output textures are disposed exactly once.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-83

**Requirement:** Optional timestamp-query admission is owned by GPU Authority.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-84

**Requirement:** Actual admitted optional features are part of device identity.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-85

**Requirement:** Product execution remains valid without timestamp-query.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-86

**Requirement:** Performance gates defer rather than fabricate timing when timestamps are unavailable.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-87

**Requirement:** Benchmark uses paired product/reference GPU timestamps.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-88

**Requirement:** Benchmark performs at least 64 warmup dispatches per pipeline/fixture.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-89

**Requirement:** Benchmark records at least 128 valid samples per implementation/fixture.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-90

**Requirement:** Pair order alternates deterministically.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-91

**Requirement:** No image upload occurs between paired product/reference measurements.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-92

**Requirement:** Benchmark records median, p95, MAD, and sample counts.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-93

**Requirement:** Slow samples are not discarded solely for being slow.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-94

**Requirement:** R4 mandatory large fixtures meet median ratio <=0.80.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-95

**Requirement:** R6 mandatory large fixtures meet median ratio <=0.90.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-96

**Requirement:** Aggregate geometric mean ratio is <=0.85.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-97

**Requirement:** No mandatory fixture exceeds median regression ratio 1.03.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-98

**Requirement:** Performance receipt references a passing parity receipt.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-99

**Requirement:** Timestamp query, resolve, and read buffers are disposed exactly once.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-100

**Requirement:** Device loss aborts unresolved parity and timing batches.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-101

**Requirement:** Stale device-epoch pipelines and query resources are rejected.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-102

**Requirement:** R1A source and mock gates remain passing.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-103

**Requirement:** R1B source and mock gates remain passing.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-104

**Requirement:** R1C source and mock gates remain passing.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-105

**Requirement:** R1D source and mock gates remain passing.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-106

**Requirement:** GPU, Surface, Preview, Export, Build, and codec regression gates remain passing.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-107

**Requirement:** Independent final ZIP extraction reproduces the R2 source seal.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.

## R2-108

**Requirement:** Physical GPU, packaged parity, performance, device-loss, and memory claims are deferred until evidence exists.

**Source evidence:** source scanner, generated manifest, or deterministic fixture receipt as applicable.

**Runtime evidence:** mock runtime for structural contracts; physical WebGPU for pixel, timing, device-loss, and packaged claims.

**Failure policy:** fail closed for source and correctness requirements; mark deferred only when the requirement explicitly needs unavailable physical or packaged evidence.


---

# 37. Gate Classification

## 37.1 Source-mandatory

`R2-01` through `R2-73`, except physical pixel assertions, are source or mock mandatory for the source-baked state.

The source gate shall classify the physical result portions of `R2-74` through `R2-80` as deferred while still verifying that the comparator and fixture plans exist.

## 37.2 Physical mandatory for verified state

The following require a real admitted WebGPU implementation:

```text
R2-54
R2-74 through R2-80
R2-83 through R2-100
R2-108 packaged/physical portions
```

## 37.3 Regression mandatory

`R2-102` through `R2-107` are mandatory before source-bake delivery.

A predecessor regression failure blocks R2 delivery even if the new R2 gate passes.

---

# 38. Acceptance Summary

R2 is accepted as source-baked only when:

```text
Source and mock failures: 0
Predecessor regression failures: 0
Production Pointer mutation: false
Reference baseline identity: preserved
Product profile selection: deterministic
Product direct-load fallback: absent
Barrier violations: 0
Final ZIP source-seal reproduction: exact
```

R2 is accepted as verified-unpromoted only when:

```text
Physical shader compile errors: 0
Tile fallback-required count: 0
Exact product/reference mismatches: 0
NaN/Inf output count: 0
R4 performance threshold: PASS
R6 performance threshold: PASS
Aggregate performance threshold: PASS
Device-loss closure: PASS
Memory plateau: PASS
Packaged Preview/Export shared-surface continuity: PASS
```

---

# 39. Follow-Up Boundary

After R2, the next optimization patch may address command-graph scheduling rather than kernel mathematics.

Suggested follow-up:

```text
TDT-RESAMPLE-RUNTIME-01-R3
Multi-Stage Command Graph Fusion /
Tensor·Policy·EWA Queue Submission Batching /
Intermediate Fence Elision /
Same-Queue Dependency and Cancellation Seal
```

R3 shall use the R2 product/reference pixel baseline and shall not reopen the R1C ellipse mathematics.

---

# 40. Final Seal Statement

`TDT-RESAMPLE-RUNTIME-01-R2` is complete only when the optimized workgroup-tiled EWA is demonstrably the same pixel algorithm as the pinned direct-load R1C baseline, with uniform barrier participation, complete shared-tile coverage, deterministic profile selection, honest GPU timing, and unchanged Preview·Export Final Surface identity.

Fast but different is not parity.

Correct but unmeasured is not a performance promotion.

The R2 seal requires both truths, recorded separately and joined by receipts.
