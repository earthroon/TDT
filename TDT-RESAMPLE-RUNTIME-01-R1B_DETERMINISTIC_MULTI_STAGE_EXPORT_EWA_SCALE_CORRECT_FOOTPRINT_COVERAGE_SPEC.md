# TDT-RESAMPLE-RUNTIME-01-R1B

## Deterministic Multi-Stage Export EWA / Scale-Correct Footprint Coverage Seal

---

## 0. Document Control

| Field | Value |
|---|---|
| Specification ID | `TDT-RESAMPLE-RUNTIME-01-R1B` |
| Title | `Deterministic Multi-Stage Export EWA / Scale-Correct Footprint Coverage Seal` |
| Status | `CANONICAL_IMPLEMENTATION_SPEC` |
| Predecessor | `TDT-RESAMPLE-RUNTIME-01-R1A` |
| Required predecessor state | `RESAMPLE_RUNTIME_R1A_SOURCE_BAKED_AWAITING_PACKAGED_GPU` |
| Predecessor source seal | `3d5690f6e28032d2406861cf98a55968e710cf537c11fc731cf735cb46852a2a` |
| Runtime | WebGPU + WGSL |
| Host orchestration | JavaScript / TypeScript only |
| Production pointer mutation | Forbidden |
| Default promotion ceiling | `RESAMPLE_RUNTIME_R1B_SOURCE_BAKED_AWAITING_PACKAGED_GPU` |
| Final verified ceiling | `RESAMPLE_RUNTIME_R1B_VERIFIED_UNPROMOTED` |

---

## 1. Purpose

R1A restored the existing DeltaK EWA execution contract without replacing the pipeline:

- `runDeltaKStack()` remained the public facade;
- object and positional ABI remained accepted;
- `pipeEWA` remained the pipeline slot;
- `main` remained the WGSL entry point;
- the returned value remained a `GPUTexture`;
- the 64-byte parameter ABI became exact;
- the workgroup barrier and shared-tile origin became valid;
- the active path remained WebGPU + WGSL.

R1A intentionally rejected a logical scale below `0.5` because one pass could not prove adequate source coverage.

R1B shall remove that one-pass limitation without removing or bypassing the existing facade.

R1B shall introduce one deterministic integer stage planner and use it inside the existing runtime paths:

```text
existing caller
    ↓
existing facade
    ↓
R1B stage planner
    ↓
existing R1A EWA dispatch repeated N times
    ↓
existing downstream contract
```

R1B shall also repair the active export WGSL path so that a large reduction is not executed as one nominally large ellipse over a fixed `7 × 7` lattice.

The central claim of this specification is:

> Every admitted output dimension shall be reached by a deterministic sequence of exact integer dimensions, and every stage shall remain inside the proven source-footprint support of the WGSL kernel that executes that stage.

---

## 2. Non-Destructive Migration Rule

R1B shall not freeze, delete, or disconnect the current production pipeline.

The following public surfaces shall remain available:

```text
runDeltaKStack(...)
createDeltaKStack(...)
downscaleRGBAWithWGSL(...)
resize_export_bind.js caller contract
pipeEWA slot
GPUTexture return contract
Uint8Array export return contract
Gamma-proof downstream order
Preview Presenter publication order
Export Worker request shape
```

R1B shall modify their internal execution from one pass to a deterministic sequence of passes.

Deletion or quarantine of a compatibility branch is out of scope unless runtime telemetry proves its call count is zero.

---

## 3. Current Baseline Audit

The predecessor source contains the following established facts.

### 3.1 R1A DeltaK EWA baseline

Current active files:

```text
app/legacy-runtime/core/compute/qmap_webgpu/
├─ deltaK_stack_autoEWA.mjs
├─ ewa_aniso_contract.mjs
├─ ewa_aniso_params.mjs
├─ ewa_aniso_runtime_receipt.mjs
├─ ewa_aniso_tile.mjs
└─ shaders/
   ├─ ewa_aniso_tile_v2.wgsl
   └─ ewa_aniso_reference_v1.wgsl
```

R1A currently exposes stage fields in the 64-byte ABI:

```text
stageIndex @ byte 48
stageCount @ byte 52
```

However, no deterministic multi-stage plan exists yet.

Current `runDeltaKStackCanonical()`:

1. creates one output texture;
2. dispatches EWA once;
3. optionally runs DeltaK core once;
4. returns that one output texture.

Current request normalization rejects:

```text
scale < 0.5
```

with:

```text
E_R1A_SCALE_REQUIRES_MULTISTAGE
```

That rejection is a truthful predecessor boundary, not a defect to remove by weakening validation.

### 3.2 Current R1A tiled support

The active product shader uses:

```text
workgroup        8 × 8
logical loop R   2
sample grid      5 × 5
shared tile      28 × 28
halo             6 source texels
max sample reach 6 source texels
```

The current shader maps one output center by:

```text
pSrc = (gid + 0.5) × srcPerDst
```

R1B shall preserve that coordinate convention.

### 3.3 Active export WGSL baseline

Current export facade:

```text
downscaleRGBAWithWGSL(rgba, srcW, srcH, dstW, dstH, opts)
```

Current behavior:

1. upload one RGBA8 source texture;
2. execute one `export_ewa_lowpass.wgsl` pass;
3. execute one `export_ewa_recompose.wgsl` pass;
4. read back one RGBA8 texture;
5. destroy source, low-pass, output, and readback resources.

Current export low-pass and residual loops use:

```text
-3 ... +3
```

which is a fixed `7 × 7` source lattice.

Current low-pass computes a nominal major radius approximately as:

```text
major = scale × radiusMul
```

but the actual source coordinates remain restricted to `±3` integer texels.

Therefore a single very large reduction can declare a larger nominal ellipse without physically sampling its full bounding support.

### 3.4 Current export readback boundary

The active export facade accepts CPU RGBA8 and returns CPU RGBA8.

R1B shall preserve that external contract, but intermediate stages shall remain on GPU.

R1B shall perform:

```text
one upload
N GPU stages
one final readback
```

It shall not perform:

```text
upload
stage
readback
upload
stage
readback
...
```

---

## 4. Scope

R1B owns the following implementation work.

### 4.1 In scope

- deterministic integer stage count;
- deterministic integer stage dimensions;
- exact final dimensions;
- per-axis non-uniform downscale support;
- one common planner schema;
- planner use by `runDeltaKStack()`;
- planner use by `downscaleRGBAWithWGSL()`;
- repeated R1A tiled EWA dispatch;
- repeated export low-pass/recompose dispatch;
- scale-correct per-stage footprint parameters;
- fixed-support admission before dispatch;
- normalized-coordinate reuse of the existing legacy tensor texture;
- GPU-only intermediate surfaces;
- intermediate surface ownership and disposal;
- one final DeltaK core execution;
- one final export readback;
- cancellation between stages;
- device-epoch validation between stages;
- stage-plan digest;
- stage receipt chain;
- final output receipt correlation;
- source and packaged gates.

### 4.2 Out of scope

R1B shall not claim completion of:

- integrated structure tensor truth;
- eigenvalue or coherence truth;
- a new anisotropy model;
- linear-light color-pipeline completion;
- hidden-RGB sidecar completion;
- Preview and Export kernel unification;
- tiled workgroup performance optimization beyond R1A;
- upscaling;
- arbitrary affine transform;
- rotation;
- perspective transform;
- CPU reference promotion;
- Production pointer promotion.

Those remain owned by R1C, R1D, and R2.

---

## 5. Required Invariants

R1B shall satisfy all of the following.

### 5.1 Facade preservation

```text
public facade count remains unchanged
caller migration is not required
return types remain unchanged
```

### 5.2 Exact final size

The last stage shall have exactly:

```text
width  = requested target width
height = requested target height
```

No post-stage Canvas, WebGL, bilinear, or encoder resize is admitted.

### 5.3 Monotonic dimensions

For every stage:

```text
nextWidth  <= currentWidth
nextHeight <= currentHeight
```

At least one axis shall strictly decrease unless the whole operation is identity.

### 5.4 No upscaling

For the full plan and each stage:

```text
nextWidth  <= currentWidth
nextHeight <= currentHeight
```

Any target larger than the source on either axis shall fail before allocating an intermediate texture.

### 5.5 Determinism

The same:

- source dimensions;
- target dimensions;
- planner profile;
- kernel parameters;
- planner version;

shall produce the same:

- stage count;
- stage dimensions;
- stage order;
- stage flags;
- plan digest.

### 5.6 Integer-only planning

Stage dimensions and stage count shall be derived with checked integer arithmetic.

Floating `Math.log2()` shall not be authoritative for stage count.

### 5.7 Support admission

No stage shall dispatch unless its effective footprint is inside the sealed support profile of its kernel.

### 5.8 GPU-resident intermediates

Intermediate color surfaces shall remain `GPUTexture` objects.

### 5.9 Final-only readback

The export path shall create and map a readback buffer only for the final stage.

### 5.10 Single DeltaK core execution

`runDeltaKCore`, when supplied, shall execute once after the final EWA stage.

It shall not execute after every intermediate stage.

### 5.11 Device epoch continuity

Every stage shall execute under the same admitted device epoch.

A device-epoch change between stages shall invalidate the unfinished chain.

### 5.12 Failure closure

On failure:

- all intermediate textures owned by the chain shall be disposed exactly once;
- the caller-owned source shall remain untouched;
- no incomplete final surface shall be published;
- no encoder shall receive a partial result.

---

## 6. Canonical Module Additions

R1B shall add or extend the following responsibilities.

```text
app/legacy-runtime/core/compute/qmap_webgpu/
├─ ewa_multistage_plan.mjs
├─ ewa_multistage_contract.mjs
├─ ewa_multistage_runtime_receipt.mjs
├─ deltaK_stack_autoEWA.mjs                  # extend in place
├─ ewa_aniso_contract.mjs                    # extend in place
├─ ewa_aniso_params.mjs                      # preserve ABI v2
├─ ewa_aniso_tile.mjs                        # repeated dispatch support
└─ shaders/
   ├─ ewa_aniso_tile_v2.wgsl                 # scale-correct footprint update
   └─ ewa_aniso_reference_v1.wgsl            # matching reference semantics

app/legacy-runtime/modules/dk_resample/
├─ export_wgsl_downscale.js                  # extend in place
├─ export_multistage_adapter.mjs
└─ shaders/
   ├─ export_ewa_lowpass.wgsl                # scale-support exactness
   ├─ export_ewa_recompose.wgsl              # final RGBA8
   └─ export_ewa_recompose_f16.wgsl          # intermediate RGBA16F
```

The existing public files shall remain at their current paths.

---

## 7. Planner Identity

The canonical planner identity shall be:

```text
tdt.ewa.multistage.planner.v1
```

The planner schema version shall be:

```text
1
```

The planner shall accept a named kernel profile.

Initial admitted profiles:

```text
delta-k-tiled-v2
export-ewa-7x7-v1
```

The profile is part of the plan digest.

---

## 8. Canonical Planner Request

```ts
interface EwaStagePlanRequestV1 {
  schemaVersion: 1;
  plannerId: "tdt.ewa.multistage.planner.v1";

  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;

  kernelProfile:
    | "delta-k-tiled-v2"
    | "export-ewa-7x7-v1";

  parameterDigest: string;
  runtimeEpoch: number;
  deviceEpoch: number;
  jobId: string;
}
```

### 8.1 Required validation

The planner shall reject:

- non-integer dimensions;
- zero dimensions;
- negative dimensions;
- dimensions larger than safe integer range;
- target width greater than source width;
- target height greater than source height;
- missing profile;
- unknown profile;
- missing parameter digest;
- non-canonical job ID.

---

## 9. Canonical Stage Record

```ts
interface EwaStageV1 {
  stageIndex: number;
  stageCount: number;

  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;

  srcPerDstX: number;
  srcPerDstY: number;
  dstPerSrcX: number;
  dstPerSrcY: number;

  sourceRole: "caller-source" | "intermediate";
  outputRole: "intermediate" | "final";

  kernelProfile: string;
  supportRadiusX: number;
  supportRadiusY: number;
  requiredReach: number;
  admittedReach: number;

  tensorCoordinateMode: "normalized-original-field-v1";
  isFinal: boolean;
}
```

All dimensions and indexes shall be integers.

All ratio fields shall be derived values and shall not be authoritative inputs.

---

## 10. Canonical Plan Record

```ts
interface EwaStagePlanV1 {
  schemaVersion: 1;
  plannerId: "tdt.ewa.multistage.planner.v1";
  plannerVersion: 1;

  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;

  kernelProfile: string;
  parameterDigest: string;

  stageCount: number;
  stages: readonly EwaStageV1[];

  planDigest: string;
}
```

The returned plan and every stage record shall be frozen.

---

## 11. Integer Stage Count Algorithm

The stage count shall be the smallest non-negative integer `N` such that both target axes can cover the source axes under the profile stage ratio.

For the initial exact-halving planner base, the authoritative helper shall use checked integer doubling.

```ts
function requiredBinaryStages(source: number, target: number): number {
  let covered = target;
  let count = 0;

  while (covered < source) {
    if (covered > Number.MAX_SAFE_INTEGER / 2) {
      throw stableError("E_R1B_STAGE_COUNT_OVERFLOW");
    }
    covered *= 2;
    count += 1;
  }

  return count;
}
```

The base stage count shall be:

```text
max(
  requiredBinaryStages(sourceWidth, targetWidth),
  requiredBinaryStages(sourceHeight, targetHeight)
)
```

A profile may request additional stages to satisfy a stricter footprint-support ratio.

It may not request fewer stages than the exact-halving base permits.

---

## 12. Exact Dimension Algorithm

For a base count `N`, candidate stage `i`, where `i` is one-based:

```text
candidateWidth(i)  = max(targetWidth,  ceilDiv(sourceWidth,  2^i))
candidateHeight(i) = max(targetHeight, ceilDiv(sourceHeight, 2^i))
```

The last stage shall be overwritten to exact target dimensions.

Canonical integer helper:

```ts
function ceilDiv(value: number, divisor: number): number {
  return Math.floor((value + divisor - 1) / divisor);
}
```

All additions shall be checked for safe-integer overflow.

### 12.1 Examples

```text
8000 × 6000 → 1000 × 750

4000 × 3000
2000 × 1500
1000 × 750
```

```text
17 × 17 → 8 × 8

9 × 9
8 × 8
```

```text
8192 × 4096 → 640 × 640

4096 × 2048
2048 × 1024
1024 × 640
640 × 640
```

The non-uniform final stage is admitted because both axes remain downscale or identity.

---

## 13. Profile-Specific Ratio Refinement

The base binary plan shall be refined until every stage passes the selected profile support predicate.

### 13.1 DeltaK tiled profile

Profile ID:

```text
delta-k-tiled-v2
```

The profile shall use the existing R1A tile-safety predicate and the updated scale-correct sample reach.

A stage is admitted only if:

- the R1A 64-byte parameter packer accepts its dimensions;
- the workgroup source-center span fits the sealed tile;
- the maximum generated offset does not exceed `maxSampleReach`;
- `stageIndex < stageCount`;
- source and output dimensions match the stage record.

### 13.2 Export 7×7 profile

Profile ID:

```text
export-ewa-7x7-v1
```

The export kernel has an integer lattice radius of:

```text
3 source texels
```

For the low-pass kernel, the profile shall require:

```text
requiredMajorRadius <= 3.0
requiredMinorRadius <= 3.0
```

The initial admitted parameter range shall include:

```text
1.0 <= radiusMul <= 2.0
0.55 <= sigma <= 2.4
```

The conservative stage ratio ceiling shall be:

```text
max(srcPerDstX, srcPerDstY) <= 1.5
```

This ceiling guarantees that the default maximum admitted `radiusMul` does not declare a low-pass major radius beyond the physical `±3` lattice.

### 13.3 Refinement rule

If a candidate stage fails the profile support predicate, the planner shall insert one deterministic intermediate dimension between the failing source and output dimensions.

The insertion shall be computed by integer interpolation, not by trial randomness.

```ts
insertWidth = max(
  outputWidth,
  Math.ceil(sourceWidth / profile.maxSrcPerDst)
);

insertHeight = max(
  outputHeight,
  Math.ceil(sourceHeight / profile.maxSrcPerDst)
);
```

The inserted dimensions shall be clamped to:

```text
output <= inserted < source
```

The planner shall repeat refinement until all stages pass or the maximum stage count is exceeded.

---

## 14. Maximum Stage Count

The canonical maximum stage count shall be:

```text
32
```

A request requiring more than 32 stages shall fail with:

```text
E_R1B_STAGE_COUNT_LIMIT
```

No partial chain shall begin.

This is an abuse and overflow guard, not an expected image limit.

---

## 15. Plan Canonicalization and Digest

The plan digest shall use a canonical JSON projection.

The projection shall contain only:

- planner ID;
- planner version;
- source dimensions;
- target dimensions;
- profile ID;
- parameter digest;
- stage count;
- ordered stage integer dimensions;
- ordered stage support limits;
- tensor coordinate mode.

It shall not contain:

- timestamps;
- random IDs;
- object addresses;
- GPU labels;
- process IDs;
- host paths.

Digest:

```text
SHA-256(canonical UTF-8 JSON)
```

---

## 16. External Request Compatibility

### 16.1 Existing scalar scale callers

Existing callers may continue to provide:

```text
scale
```

R1B shall derive:

```text
targetWidth  = max(1, floor(sourceWidth  × scale))
targetHeight = max(1, floor(sourceHeight × scale))
```

R1B shall admit:

```text
0 < scale <= 1
```

The predecessor error `E_R1A_SCALE_REQUIRES_MULTISTAGE` shall no longer be returned merely because scale is below `0.5` when the R1B planner is installed.

### 16.2 Explicit target callers

R1B may accept both:

```text
outputWidth
outputHeight
```

Both must be present together.

One-axis explicit target requests are forbidden.

### 16.3 Scale and explicit target together

If both are provided, the explicit target shall equal the target derived by the scalar scale rule.

A disagreement shall fail with:

```text
E_R1B_TARGET_SCALE_CONFLICT
```

### 16.4 Identity request

If source and target dimensions are identical, the planner returns zero stages.

The facade shall preserve the established identity-copy policy of its caller:

- DeltaK GPU facade may return the source texture only when ownership semantics permit;
- CPU export facade shall return a new `Uint8Array` copy, matching current behavior.

Identity shall not allocate EWA intermediate textures.

---

## 17. DeltaK Facade Integration

`runDeltaKStack()` shall remain the public entrypoint.

`runDeltaKStackCanonical()` shall change internally from one dispatch to a stage loop.

Canonical shape:

```ts
async function runDeltaKStackCanonical(request) {
  const binding = await validateEwaDeviceOwnership(request);
  const plan = await buildEwaStagePlan(...);

  if (plan.stageCount === 0) {
    return executeIdentityPolicy(request);
  }

  let currentTexture = request.srcTex;
  let currentOwned = false;
  let finalTexture = null;

  try {
    for (const stage of plan.stages) {
      assertNotCancelled(request);
      assertCurrentDeviceEpoch(binding);

      const output = createStageOutputTexture(stage);

      await dispatchEWAAniso(request.device, request.pipes.pipeEWA, {
        srcTex: currentTexture,
        tensorTex: request.tensorTex,
        dstTex: output,
        inW: stage.sourceWidth,
        inH: stage.sourceHeight,
        outW: stage.outputWidth,
        outH: stage.outputHeight,
        stageIndex: stage.stageIndex,
        stageCount: stage.stageCount,
        ...request.parameters,
      });

      if (currentOwned) {
        disposeIntermediate(currentTexture);
      }

      currentTexture = output;
      currentOwned = true;
      finalTexture = output;
    }

    if (typeof request.runDeltaKCore === "function") {
      await request.runDeltaKCore({
        inputTex: finalTexture,
        width: plan.targetWidth,
        height: plan.targetHeight,
        ...epochIdentity,
      });
    }

    transferFinalOwnershipToCaller(finalTexture);
    currentOwned = false;
    return finalTexture;
  } finally {
    if (currentOwned) disposeIntermediate(currentTexture);
  }
}
```

The final implementation may use a registry handle rather than raw booleans, but the ownership behavior shall be equivalent.

---

## 18. DeltaK Core Ordering

The existing DeltaK core callback shall execute:

```text
exactly once
```

and only after:

```text
all EWA stages completed successfully
```

It shall receive:

- the exact final texture;
- exact final width and height;
- plan digest;
- stage count;
- runtime epoch;
- device epoch;
- job ID.

A core failure shall dispose the untransferred final texture and shall not publish it.

---

## 19. Existing Tensor Field Compatibility

R1B shall not claim a true per-stage integrated tensor.

The existing tensor texture shall remain a compatibility input until R1C.

### 19.1 Required correction

The product and reference WGSL shall not sample the legacy tensor by raw current-stage source coordinates.

Instead, they shall map the current-stage source position into normalized image coordinates and then into the actual tensor texture dimensions.

Canonical WGSL semantics:

```wgsl
let sourceUv = clamp(
  pSrc / vec2<f32>(U.inSize),
  vec2<f32>(0.0),
  vec2<f32>(1.0)
);

let tensorSize = textureDimensions(tensorTex);
let tensorCoord = clamp(
  vec2<i32>(floor(sourceUv * vec2<f32>(tensorSize))),
  vec2<i32>(0),
  vec2<i32>(tensorSize) - vec2<i32>(1)
);
```

This is named:

```text
normalized-original-field-v1
```

### 19.2 R1B limitation

The original tensor field may not represent detail removed by an intermediate stage.

R1B shall record that limitation in the receipt.

R1C shall replace this compatibility mode with a true stage-aligned tensor field.

---

## 20. Scale-Correct DeltaK Footprint

R1A uses `srcPerDst` to locate source centers but its sigma is not yet explicitly projected through the stage scale.

R1B shall make the footprint depend on the actual per-axis stage scale.

Given normalized tangent `t` and normal `n`:

```text
t = (tx, ty)
n = (-ty, tx)
s = (srcPerDstX, srcPerDstY)
```

Projected source scale:

```text
scaleAlongTangent = length(t × s)
scaleAlongNormal  = length(n × s)
```

where `×` is component-wise multiplication.

Effective transitional sigma:

```text
effectiveSigmaMain  = baseSigmaMain  × max(1, scaleAlongTangent)
effectiveSigmaCross = baseSigmaCross × max(1, scaleAlongNormal)
```

The existing legacy tensor modulation may be applied afterward, but the final sigma shall be clamped by:

```text
shrinkClamp
maxSampleReach / logicalRadius
```

The product and direct-load reference shaders shall implement identical footprint semantics.

---

## 21. DeltaK Footprint Reach Validation

For logical radius `R = 2`:

```text
requiredReach = R × max(effectiveSigmaMain, effectiveSigmaCross)
```

The stage shall be rejected before dispatch when:

```text
requiredReach > maxSampleReach
```

Error:

```text
E_R1B_FOOTPRINT_SUPPORT_EXCEEDED
```

No hidden clamp that changes the requested kernel without a receipt is permitted.

If a clamp is part of the declared parameter policy, the unclamped and clamped values shall both be present in the stage receipt.

---

## 22. Export Facade Integration

The public function shall remain:

```text
downscaleRGBAWithWGSL(rgba, srcW, srcH, dstW, dstH, opts)
```

The external input and return types shall remain:

```text
Uint8Array RGBA8 → Uint8Array RGBA8
```

Internally the function shall:

1. validate input and target;
2. build the deterministic export profile plan;
3. upload source RGBA8 once;
4. execute all stages on GPU;
5. use `rgba16float` intermediate surfaces;
6. execute final recompose into RGBA8 once;
7. read back the final RGBA8 once;
8. dispose all GPU resources exactly once.

---

## 23. Export Intermediate Format

Intermediate export stages shall use:

```text
rgba16float
```

They shall not round-trip through RGBA8 between stages.

The existing final `export_ewa_recompose.wgsl` may continue to write `rgba8unorm` for the final external contract.

A new intermediate recompose shader shall write:

```text
rgba16float
```

The intermediate shader shall preserve the same premultiplied-alpha convention as the existing export path.

---

## 24. Export Stage Execution

For each non-final stage:

```text
current source texture
→ low-pass rgba16float texture
→ intermediate recompose rgba16float texture
→ next stage source
```

For the final stage:

```text
current source texture
→ low-pass rgba16float texture
→ final recompose rgba8unorm texture
→ readback
```

After a stage fence completes:

- the prior owned source may be disposed;
- the stage low-pass temporary shall be disposed;
- the stage recompose output becomes the next source or final result.

The original upload texture remains owned by the export chain and shall be disposed after the first succeeding stage fence or on failure.

---

## 25. Export Low-Pass Footprint

The export low-pass shader shall continue to use a fixed `7 × 7` lattice in R1B.

R1B shall not pretend that the lattice expands.

The stage planner shall instead keep each stage inside the lattice support.

For each stage:

```text
scaleX = sourceWidth  / outputWidth
scaleY = sourceHeight / outputHeight
```

The effective low-pass axes shall be calculated from the actual stage scales.

The stage shall be rejected if the declared ellipse extends outside the `±3` support.

---

## 26. Export Residual Footprint

The residual/detail pass shall not use an unbounded scale-multiplied major axis.

In R1B, residual detail is a bounded local reconstruction pass, not the authoritative anti-alias footprint.

Its admitted radius shall be:

```text
<= 3 source texels
```

`majorBoost` shall modulate detail gain or bounded residual orientation, but shall not silently declare a radius larger than the physical loop.

If the implementation keeps radius modulation, the radius shall be explicitly clamped and the clamp shall be in the receipt.

---

## 27. Export Parameter Contract

R1B shall validate all export parameters before GPU allocation.

Initial admitted ranges:

```text
1.0  <= radiusMul <= 2.0
0.55 <= sigma <= 2.4
0.0  <= detailMix <= 0.75
0.0  <= edgeBoost <= 8.0
1.0  <= majorBoost <= 2.0
0.45 <= minorClamp <= 1.0
```

All values shall be finite.

Every exposed parameter shall either:

- affect the output; or
- be rejected as unsupported.

A dead parameter is a gate failure.

---

## 28. Export Uniform ABI

The existing 64-byte export uniform may remain, but R1B shall seal its layout and version.

Required additional stage identity may be encoded in currently padded slots only if the ABI digest changes.

Preferred layout:

```text
srcW          0
srcH          4
dstW          8
dstH         12
scaleX       16
scaleY       20
radiusMul    24
sigma        28
detailMix    32
edgeBoost    36
majorBoost   40
minorClamp   44
stageIndex   48
stageCount   52
flags        56
abiVersion   60
```

The existing four padding floats shall be replaced by explicit stage fields.

The byte length remains:

```text
64
```

---

## 29. Export Pipeline and Buffer Ownership

The current export state uses one reusable 64-byte uniform buffer.

R1B may preserve one reusable buffer only if stage dispatches are serialized through one queue completion chain.

Concurrent export jobs shall not write the same uniform buffer without:

- a ring slot; or
- explicit serialization.

The selected strategy shall be recorded in the source receipt.

Initial implementation may serialize export jobs.

---

## 30. Queue Submission Policy

A chain may use either:

### 30.1 One submission per stage

Advantages:

- simple resource-lifetime proof;
- stage-level cancellation point;
- stage-level receipt;
- easy device-loss attribution.

### 30.2 One command encoder for all stages

This is not admitted in R1B unless all intermediate resource lifetimes and cancellation semantics are independently proven.

The default R1B implementation shall therefore use:

```text
one submission per stage
```

with:

```text
await queue.onSubmittedWorkDone()
```

before disposing a source needed by that stage.

---

## 31. Cancellation Contract

The request may carry an abort signal or canonical cancellation token.

Cancellation shall be checked:

- before plan construction;
- before each stage allocation;
- before each stage submission;
- after each stage fence;
- before final publication or readback return.

A stage already submitted may complete, but its result shall not be published after cancellation.

Error:

```text
E_R1B_CANCELLED
```

Cancellation is not a fallback request.

---

## 32. Device Loss Contract

At the start of each stage, the runtime shall verify:

- runtime epoch;
- device epoch;
- device identity;
- pipeline bundle epoch.

If the epoch changes during the chain:

```text
unfinished plan → invalid
intermediate textures → dispose or device-lost invalidation
final publication → forbidden
```

Error:

```text
E_R1B_DEVICE_EPOCH_CHANGED
```

Automatic replay is not required in R1B.

A higher-level caller may retry from the original source after recovery.

---

## 33. Surface Authority Integration

Every intermediate texture shall be represented in the Surface Authority or its admitted transitional registration facade.

Required metadata:

```text
surface role
plan digest
stage index
stage count
source dimensions
output dimensions
runtime epoch
device epoch
owner
byte estimate
parent surface ID, when available
```

Roles:

```text
resample-intermediate
resample-final
export-lowpass-temporary
export-intermediate
export-final-readback-source
```

No intermediate surface may be published as the canonical final surface.

---

## 34. Intermediate Disposal

The chain owns every texture it creates until ownership is explicitly transferred.

Exactly-once rules:

- caller source: never destroyed by the chain;
- upload source: destroyed by export chain;
- intermediate source: destroyed after successor fence;
- low-pass temporary: destroyed after same-stage recompose fence;
- final DeltaK texture: transferred to caller;
- final export texture: destroyed after readback copy and queue completion;
- readback buffer: unmap and destroy exactly once.

A disposer shall tolerate repeated cleanup attempts without invoking the physical disposer twice.

---

## 35. Readback Closure

The export path shall create exactly one readback buffer per non-identity request.

The readback buffer shall correspond to exact target dimensions.

The byte-row alignment rule remains:

```text
alignedBytesPerRow = align(targetWidth × 4, 256)
```

The returned array shall have exact length:

```text
targetWidth × targetHeight × 4
```

No padding bytes shall be exposed.

---

## 36. Stage Receipt

Each completed stage shall append an immutable receipt.

```ts
interface EwaStageReceiptV1 {
  schemaVersion: 1;
  patchId: "TDT-RESAMPLE-RUNTIME-01-R1B";

  jobId: string;
  planDigest: string;
  stageIndex: number;
  stageCount: number;

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;

  kernelProfile: string;
  pipelineIdentity: string;
  shaderDigest: string;
  parameterDigest: string;

  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;

  srcPerDstX: number;
  srcPerDstY: number;
  requiredReach: number;
  admittedReach: number;

  submitted: true;
  completed: true;
  outputRole: "intermediate" | "final";
}
```

---

## 37. Chain Receipt

The chain receipt shall contain:

```ts
interface EwaChainReceiptV1 {
  schemaVersion: 1;
  patchId: "TDT-RESAMPLE-RUNTIME-01-R1B";

  jobId: string;
  planDigest: string;
  parameterDigest: string;

  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;

  kernelProfile: string;
  stageCount: number;
  stageReceiptDigests: readonly string[];

  uploadCount: number;
  readbackCount: number;
  intermediateTextureCount: number;
  finalSurfaceId: string | null;

  completed: boolean;
  cancelled: boolean;
  failureCode: string | null;
}
```

For a successful CPU export request:

```text
uploadCount   = 1
readbackCount = 1
```

For a successful GPU DeltaK request:

```text
uploadCount   = 0
readbackCount = 0
```

---

## 38. Telemetry

R1B shall add counters for:

```text
planBuildCount
identityPlanCount
singleStagePlanCount
multiStagePlanCount
stageDispatchCount
stageCompletedCount
stageFailedCount
stageCancelledCount
supportRefinementCount
supportRejectCount
intermediateCreatedCount
intermediateDisposedCount
finalTransferCount
exportUploadCount
exportReadbackCount
deviceEpochAbortCount
```

The counters are diagnostic and shall not affect output.

---

## 39. Stable Error Codes

R1B shall define at least:

```text
E_R1B_SOURCE_DIMENSION_INVALID
E_R1B_TARGET_DIMENSION_INVALID
E_R1B_UPSCALE_NOT_ADMITTED
E_R1B_TARGET_SCALE_CONFLICT
E_R1B_STAGE_COUNT_OVERFLOW
E_R1B_STAGE_COUNT_LIMIT
E_R1B_STAGE_NON_MONOTONIC
E_R1B_STAGE_DIMENSION_INVALID
E_R1B_STAGE_SUPPORT_REJECTED
E_R1B_FOOTPRINT_SUPPORT_EXCEEDED
E_R1B_PROFILE_UNKNOWN
E_R1B_PARAMETER_NONFINITE
E_R1B_PARAMETER_RANGE
E_R1B_PLAN_DIGEST_MISMATCH
E_R1B_STAGE_RECEIPT_MISMATCH
E_R1B_CANCELLED
E_R1B_DEVICE_EPOCH_CHANGED
E_R1B_PIPELINE_STALE
E_R1B_INTERMEDIATE_REGISTRATION_FAILED
E_R1B_FINAL_DIMENSION_MISMATCH
E_R1B_READBACK_LENGTH_MISMATCH
```

Errors shall not trigger Canvas, WebGL, CPU bilinear, Lanczos, or original-image fallback.

---

## 40. Forbidden Fallbacks

The following are forbidden inside R1B:

```text
CanvasRenderingContext2D.drawImage resize
createImageBitmap resize options
WebGL squeeze fallback
CPU nearest/bilinear fallback
Lanczos masquerading as Aniso
return original source on EWA failure
return zero-filled array
silent target dimension adjustment
silent stage-count reduction
silent kernel-parameter clamp without receipt
```

---

## 41. Planner Fixture Matrix

The source gate shall include exact expected plans.

### 41.1 Identity

```text
100 × 100 → 100 × 100
stage count 0
```

### 41.2 One stage

```text
100 × 100 → 75 × 75
```

### 41.3 Exact half

```text
100 × 100 → 50 × 50
```

### 41.4 Odd half boundary

```text
17 × 17 → 8 × 8
```

The plan shall remain monotonic and exact.

### 41.5 Deep reduction

```text
8192 × 8192 → 512 × 512
```

### 41.6 Non-square proportional

```text
8000 × 6000 → 1000 × 750
```

### 41.7 Non-uniform reduction

```text
8192 × 4096 → 640 × 640
```

### 41.8 One axis identity

```text
4096 × 2048 → 4096 × 512
```

### 41.9 One-pixel target

```text
3 × 3 → 1 × 1
```

### 41.10 Invalid upscale

```text
100 × 100 → 101 × 100
```

shall fail before allocation.

---

## 42. Footprint Fixture Matrix

For each admitted profile, the gate shall test:

- exact stage ratio 1.0;
- ratio near profile ceiling;
- odd-dimension rounding;
- anisotropic X-only reduction;
- anisotropic Y-only reduction;
- maximum admitted radius parameter;
- parameter just outside admitted range;
- required reach equal to admitted reach;
- required reach greater than admitted reach.

The source gate shall independently recompute the expected reach.

It shall not trust the runtime's own receipt without recomputation.

---

## 43. Pixel Conservation Fixtures

Physical GPU validation shall include:

### 43.1 Constant color

Every stage and final result shall preserve a constant premultiplied color within format tolerance.

### 43.2 Constant alpha

Alpha shall remain constant.

### 43.3 Transparent color

The existing export premultiplied convention shall remain stable.

R1B does not claim hidden-RGB truth, but it shall not introduce a new stage-wise RGBA8 quantization loss.

### 43.4 Horizontal and vertical stripes

Deep reductions shall not show a result equivalent to sampling only the central `±3` texels of the original full-resolution image.

### 43.5 Checkerboard

A deep reduction shall show increased low-pass integration through multiple stages.

### 43.6 Odd dimensions

No one-pixel border shall be omitted.

### 43.7 Non-uniform dimensions

The final dimensions and row order shall be exact.

---

## 44. Product vs Reference Validation

The existing direct-load reference shader shall be extended to use:

- the same scale-correct footprint formula;
- the same tensor normalized-coordinate mapping;
- the same stage dimensions;
- the same parameter ABI.

For each R1B DeltaK stage, product tiled output shall be compared against direct-load reference output.

Initial tolerance:

```text
absolute RGBA error <= 1e-5
```

A multi-stage chain shall compare at every stage, not only final output, in the validation build.

---

## 45. Export Reference Validation

The export kernel shall have an independent validation route.

At minimum, the validation harness shall compare:

- one-stage current path;
- R1B one-stage path;
- R1B multi-stage path;
- exact final dimensions;
- constant conservation;
- parameter sensitivity.

The same WGSL source copied into a second file is not an independent reference.

A simple direct texture-load implementation or a small high-precision GPU reference is preferred.

---

## 46. Parameter Sensitivity Gate

For a non-constant fixture, changing each admitted parameter independently shall affect either:

- plan identity; or
- stage parameter digest; or
- pixel output.

Required parameters:

```text
radiusMul
sigma
detailMix
edgeBoost
majorBoost
minorClamp
sigmaMain
sigmaCross
shrinkClamp
```

A parameter that changes none of these is a dead parameter and fails promotion.

---

## 47. Output Identity and Publication

For the DeltaK path, the final returned texture metadata shall include:

```text
planDigest
stageCount
final stage receipt digest
source dimensions
target dimensions
runtime epoch
device epoch
```

The final texture shall be the only stage texture eligible for final-surface publication.

For the CPU export path, the returned `Uint8Array` shall correlate to the chain receipt by:

- job ID;
- plan digest;
- final dimensions;
- final readback digest in validation builds.

---

## 48. Preview and Export Boundary

R1B shall not make the Preview canvas an export source.

The Preview Presenter shall continue to consume a final surface.

The Export path shall consume:

- the canonical final surface when available; or
- the existing admitted CPU RGBA facade during transition.

R1B shall not add a Preview resize pass.

---

## 49. Build and Asset Closure

The following shall be included in the active graph and runtime asset manifest when added:

```text
ewa_multistage_plan.mjs
ewa_multistage_contract.mjs
ewa_multistage_runtime_receipt.mjs
export_multistage_adapter.mjs
export_ewa_recompose_f16.wgsl
```

Every WGSL asset shall have:

- canonical source path;
- emitted route;
- SHA-256 digest;
- MIME type;
- expected entry point;
- expected ABI version.

Dynamic shader fetch outside the manifest is forbidden.

---

## 50. Source-Gate Architecture

Canonical source gate tool:

```text
tools/verify_resample_runtime_01_r1b_source.mjs
```

The tool shall:

1. parse planner source;
2. run deterministic plan fixtures;
3. recompute plan digests independently;
4. scan forbidden fallback sites;
5. verify public facade preservation;
6. verify stage fields in both uniform ABIs;
7. verify WGSL loop support constants;
8. verify tensor normalized-coordinate mapping;
9. verify final-only readback structure;
10. verify cleanup paths;
11. verify asset manifest closure;
12. emit JSON source receipt.

---

## 51. Runtime-Gate Architecture

Canonical runtime gate:

```text
tools/verify_resample_runtime_01_r1b_runtime.mjs
```

It shall run the actual JavaScript modules with a mock WebGPU implementation and verify:

- deterministic planner;
- stage count;
- exact dimensions;
- one output allocation per stage;
- stage submission order;
- one core callback after final stage;
- intermediate disposal;
- cancellation cleanup;
- epoch-change abort;
- export upload count one;
- export readback count one;
- no intermediate readback;
- identity behavior;
- receipt chain.

---

## 52. Physical GPU Gate

The physical WebGPU gate shall run on the canonical Windows x64 environment.

It shall verify:

- WGSL compilation;
- bind-group validation;
- stage-by-stage product/reference parity;
- constant-color conservation;
- deep-reduction fixture behavior;
- odd dimensions;
- non-uniform dimensions;
- actual queue fence completion;
- actual texture disposal plateau;
- device loss during a multi-stage chain;
- relaunch reproducibility.

---

## 53. Gate List

### R1B Source and Planner Gates

| Gate | Requirement |
|---|---|
| `RB01` | Predecessor R1A source seal matches |
| `RB02` | Existing `runDeltaKStack` export remains |
| `RB03` | Existing `downscaleRGBAWithWGSL` export remains |
| `RB04` | Planner ID and version are exact |
| `RB05` | Planner uses checked integer arithmetic |
| `RB06` | Floating log is not authoritative |
| `RB07` | Identity plan has zero stages |
| `RB08` | Final dimensions are exact |
| `RB09` | Every stage is monotonic |
| `RB10` | Upscale rejected before allocation |
| `RB11` | Same input produces same plan digest |
| `RB12` | Profile ID is included in digest |
| `RB13` | Parameter digest is included in digest |
| `RB14` | Stage count limit is enforced |
| `RB15` | Odd-dimension fixture exact |
| `RB16` | Deep-reduction fixture exact |
| `RB17` | Non-uniform fixture exact |
| `RB18` | One-axis identity fixture exact |
| `RB19` | Export profile stage support predicate exists |
| `RB20` | DeltaK profile stage support predicate exists |
| `RB21` | Unsupported stage is refined or rejected before dispatch |
| `RB22` | Planner result and stages are frozen |
| `RB23` | Stable error codes exist |
| `RB24` | No random planner input exists |

### R1B DeltaK Integration Gates

| Gate | Requirement |
|---|---|
| `RB25` | `runDeltaKStackCanonical` executes a stage loop |
| `RB26` | R1A pipeline bundle is reused |
| `RB27` | Stage index and count reach the 64-byte uniform |
| `RB28` | Scale below 0.5 is planned, not silently rejected |
| `RB29` | Legacy positional ABI remains accepted |
| `RB30` | Object ABI remains accepted |
| `RB31` | Final GPUTexture return contract remains |
| `RB32` | DeltaK core runs exactly once after final stage |
| `RB33` | Caller source is never destroyed |
| `RB34` | Every intermediate is disposed exactly once |
| `RB35` | No incomplete intermediate is published |
| `RB36` | Device epoch checked before every stage |
| `RB37` | Cancellation checked between stages |
| `RB38` | Tensor sampling uses normalized original-field mapping |
| `RB39` | Scale-correct sigma projection exists |
| `RB40` | Product and reference footprint formulas match |

### R1B Export Integration Gates

| Gate | Requirement |
|---|---|
| `RB41` | CPU export input remains Uint8Array RGBA8 |
| `RB42` | CPU export output remains Uint8Array RGBA8 |
| `RB43` | Source upload count is exactly one |
| `RB44` | Final readback count is exactly one |
| `RB45` | Intermediate readback count is zero |
| `RB46` | Intermediate export format is rgba16float |
| `RB47` | Final export format is rgba8unorm |
| `RB48` | Non-final recompose writes rgba16float |
| `RB49` | Export stage ratio stays inside 7×7 support profile |
| `RB50` | Low-pass declared ellipse fits physical lattice |
| `RB51` | Residual radius is bounded by physical lattice |
| `RB52` | Export uniform ABI remains 64 bytes |
| `RB53` | Stage index and count occupy sealed offsets |
| `RB54` | Concurrent uniform writes are serialized or ring-buffered |
| `RB55` | Final output byte length is exact |
| `RB56` | Row padding is not exposed |
| `RB57` | All export temporaries are disposed |
| `RB58` | Identity export returns a copy |

### R1B Receipt and Closure Gates

| Gate | Requirement |
|---|---|
| `RB59` | Every completed stage has a receipt |
| `RB60` | Stage receipts form one ordered chain |
| `RB61` | Chain receipt contains plan digest |
| `RB62` | Chain receipt contains upload and readback counts |
| `RB63` | Failure receipt contains stable failure code |
| `RB64` | Cancellation cannot publish final output |
| `RB65` | WGSL assets are digest-sealed |
| `RB66` | Active graph contains new admitted modules |
| `RB67` | Canvas resize fallback count is zero |
| `RB68` | WebGL resize fallback count is zero |
| `RB69` | CPU bilinear fallback count is zero |
| `RB70` | Original-source-on-failure fallback count is zero |
| `RB71` | Production pointer mutation count is zero |
| `RB72` | Source receipt is emitted |

### R1B Physical and Packaged Gates

| Gate | Requirement |
|---|---|
| `RB73` | Product WGSL compiles on canonical GPU |
| `RB74` | Export WGSL modules compile on canonical GPU |
| `RB75` | Product/reference per-stage error is within tolerance |
| `RB76` | Constant color is conserved across deep reduction |
| `RB77` | Odd dimensions preserve all borders |
| `RB78` | Non-uniform dimensions are exact |
| `RB79` | Device loss aborts unfinished chain |
| `RB80` | Relaunch repeats the same plan digest |
| `RB81` | Repeated export resource count reaches plateau |
| `RB82` | Packaged shader digests match source receipt |
| `RB83` | Packaged final dimensions match request |
| `RB84` | Packaged export performs one upload and one readback |

Total gates:

```text
84
```

---

## 54. Source Promotion Criteria

R1B may enter:

```text
RESAMPLE_RUNTIME_R1B_SOURCE_BAKED_AWAITING_PACKAGED_GPU
```

only when:

- `RB01` through `RB72` pass or are explicitly marked physical-runtime deferred where appropriate;
- fail count is zero;
- predecessor regression suite remains passing;
- source receipt and changed-file manifest exist;
- final ZIP independently reproduces the source gate.

---

## 55. Physical Promotion Criteria

R1B may enter:

```text
RESAMPLE_RUNTIME_R1B_VERIFIED_UNPROMOTED
```

only when:

- `RB73` through `RB84` pass on the canonical packaged runtime;
- all source gates remain passing;
- final output fixtures are independently decoded where applicable;
- no Production pointer is changed.

---

## 56. Required Artifacts

A bake shall emit:

```text
README_TDT_RESAMPLE_RUNTIME_01_R1B_APPLIED.md
specs/TDT-RESAMPLE-RUNTIME-01-R1B_..._SPEC.md
patches/TDT_RESAMPLE_RUNTIME_01_R1B_...diff
patches/TDT_RESAMPLE_RUNTIME_01_R1B_CHANGED_FILE_MANIFEST.json
artifacts/resample-runtime-01-r1b/source-bake/
├─ TDT_RESAMPLE_RUNTIME_01_R1B_SOURCE_GATE.json
├─ TDT_RESAMPLE_RUNTIME_01_R1B_SOURCE_RECEIPT.json
├─ TDT_RESAMPLE_RUNTIME_01_R1B_REGRESSION_SUMMARY.json
├─ TDT_RESAMPLE_RUNTIME_01_R1B_PLANNER_FIXTURES.json
└─ TDT_RESAMPLE_RUNTIME_01_R1B_STAGE_SUPPORT_FIXTURES.json
```

A physical promotion run shall additionally emit:

```text
artifacts/resample-runtime-01-r1b/packaged-runtime/
├─ TDT_RESAMPLE_RUNTIME_01_R1B_GPU_RECEIPT.json
├─ TDT_RESAMPLE_RUNTIME_01_R1B_PIXEL_FIXTURES.json
├─ TDT_RESAMPLE_RUNTIME_01_R1B_DEVICE_LOSS_RECEIPT.json
├─ TDT_RESAMPLE_RUNTIME_01_R1B_RESOURCE_PLATEAU.json
└─ TDT_RESAMPLE_RUNTIME_01_R1B_PACKAGED_RECEIPT.json
```

---

## 57. Required Regression Suite

R1B bake shall rerun at least:

```text
TDT-PROMOTION-BASELINE-00
TDT-ACTIVE-GRAPH-01
TDT-GPU-DEVICE-SSOT-01
TDT-SURFACE-LIFECYCLE-01
TDT-PREVIEW-PRESENTER-01
TDT-RESAMPLE-RUNTIME-01-R1A
TDT-RUNTIME-SSOT-01-R7
TDT-EXPORT-WORKER-01 through 07
TDT-EXPORT-PROMOTION-01 through 03
TDT-BUILD-LOCK-01
TDT-BUILD-EMIT-01
TDT-MODJPEG-01
TDT-JXL-CODEC-01
TDT-NATIVE-DECODER-01
TDT-PSD-DECODER-01
```

No prior pass may be rewritten to accommodate a new failure unless the prior gate was syntactic and the new implementation satisfies the same semantic invariant.

Any such gate change shall be documented.

---

## 58. Implementation Order

R1B shall be implemented in the following order.

### Step 1

Add planner module and deterministic fixtures without changing runtime execution.

### Step 2

Add planner and stage receipt schemas.

### Step 3

Extend DeltaK request normalization to accept deep reduction and exact targets.

### Step 4

Convert `runDeltaKStackCanonical()` to a stage loop while preserving one-stage behavior.

### Step 5

Add intermediate Surface Authority registration and disposal.

### Step 6

Correct tensor normalized-coordinate sampling in product and reference WGSL.

### Step 7

Add scale-correct projected footprint to product and reference WGSL.

### Step 8

Add export profile planning.

### Step 9

Add `rgba16float` intermediate recompose shader.

### Step 10

Convert export facade to one upload, N stages, one readback.

### Step 11

Add cancellation and device-epoch interruption tests.

### Step 12

Seal WGSL assets, active graph, receipts, and regressions.

This order keeps the existing pipeline executable after every commit.

---

## 59. Rollback Contract

R1B rollback shall restore the R1A source tree and R1A source seal.

Rollback shall not require caller migration because public facades remain unchanged.

No R1B bake shall modify the Production pointer.

A failed R1B runtime request shall not mutate a release pointer, preset, or user project.

---

## 60. Security and Resource Limits

Before allocating the plan's first intermediate texture, the runtime shall estimate:

```text
peak stage color textures
low-pass temporary
recompose output
readback buffer, export only
```

R1B does not replace the future full memory-budget specification, but it shall reject arithmetic overflow and obviously impossible dimensions.

Required checks:

- width × height safe integer;
- width × height × bytes-per-pixel safe integer;
- bytes-per-row alignment safe integer;
- stage count bounded;
- texture dimensions within device limits;
- dispatch workgroups within device limits.

---

## 61. Explicit Truth Boundary

R1B proves:

- deterministic multi-stage dimensions;
- exact final dimensions;
- fixed-support footprint admission;
- GPU-resident intermediate execution;
- one final readback for CPU export;
- existing facade preservation;
- stage-level ownership and receipts.

R1B does not prove:

- the current legacy tensor field is mathematically correct;
- the current EWA kernel is the final perceptual kernel;
- the current color domain is the final color-management truth;
- hidden RGB is fully preserved;
- the tiled kernel is performance-optimal.

Those claims remain forbidden until their own revisions pass.

---

## 62. Final State Machine

```text
R1A_READY
    ↓
PLAN_VALIDATING
    ↓
PLAN_READY
    ↓
STAGE_ALLOCATING
    ↓
STAGE_SUBMITTING
    ↓
STAGE_FENCED
    ├─ next stage → STAGE_ALLOCATING
    └─ final stage → FINALIZING
                         ↓
                  FINAL_OWNERSHIP_TRANSFER
                         ↓
                       COMPLETE
```

Failure paths:

```text
ANY ACTIVE STATE
    ├─ cancellation → CANCELLING → CLEANED
    ├─ device loss  → DEVICE_LOST → CLEANED
    ├─ validation   → FAILED       → CLEANED
    └─ core failure → FAILED       → CLEANED
```

No failure state may transition to `COMPLETE`.

---

## 63. Final Acceptance Statement

R1B is accepted only when a deep reduction no longer means:

```text
one fixed-support WGSL pass pretending to cover an arbitrarily large source footprint
```

and instead means:

```text
one deterministic integer plan
+ several support-admitted WebGPU stages
+ exact GPU intermediate ownership
+ one exact final surface
+ one final readback only when the external CPU export ABI requires it
```

The pipeline remains alive throughout the migration.

The existing entrypoints remain callable.

The implementation advances by repairing their internals rather than removing their callers.

---

# End of Specification

---

## Implementation Amendment A — Discrete Terminal Axis Closure

The source implementation discovered one integer-grid contradiction in the original conservative export profile:

```text
max stage ratio <= 1.5
3 -> 1 fixture must complete exactly
```

A deterministic integer chain can refine `3 -> 1` to `3 -> 2 -> 1`, but the terminal `2 -> 1` ratio is `2.0`. There is no positive integer dimension strictly between `2` and `1`.

R1B therefore admits a narrowly scoped terminal-axis rule for `export-ewa-7x7-v1`:

```text
target axis == 1
source axis <= 3
physical lattice radius == 3
```

The exception is valid only because the complete discrete source axis fits inside the physical `±3` sample lattice. It shall be recorded per stage as:

```text
terminalDiscreteAxisX
terminalDiscreteAxisY
```

This rule does not raise the general profile ceiling and shall not be used for source axes greater than `3`, non-terminal outputs, DeltaK tiled stages, or hidden fallback admission.
