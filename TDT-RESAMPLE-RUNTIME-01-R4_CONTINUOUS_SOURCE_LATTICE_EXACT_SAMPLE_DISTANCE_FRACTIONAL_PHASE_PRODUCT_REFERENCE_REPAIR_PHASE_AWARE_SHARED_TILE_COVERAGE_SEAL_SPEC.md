# TDT-RESAMPLE-RUNTIME-01-R4

## Continuous Source Lattice / Exact Sample Distance / Fractional-Phase Product·Reference Repair / Phase-Aware Shared-Tile Coverage Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R4`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R3`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R3_INDEPENDENT_FRACTIONAL_PHASE_EWA_ORACLE_CURRENT_PRODUCT_REJECTED_BAKED.zip`
- **Parent repository bundle SHA-256:** `706033b69dd076eecb76de2c46ce9eeb543db40b969f338d285ad927c7266e7d`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R3_ORACLE_VERIFIED_R4_REQUIRED`
- **Target source state:** `RESAMPLE_RUNTIME_R4_CONTINUOUS_LATTICE_REPAIR_SOURCE_BAKED_AWAITING_PHYSICAL_GPU`
- **Target source-verified state:** `RESAMPLE_RUNTIME_R4_PHASE_CORRECT_PRODUCT_REFERENCE_REPAIRED_AWAITING_R5`
- **Physical GPU state:** `RESAMPLE_RUNTIME_R4_PHYSICAL_GPU_EVIDENCE_DEFERRED_TO_R9`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Canonical source runtime mutation:** required and versioned
- **Parent R2 shader mutation:** forbidden
- **Parent R3 oracle mutation:** forbidden
- **Public EWA facade mutation:** forbidden
- **Parameter ABI mutation:** forbidden
- **Canonical parameter ABI:** `tdt.delta-k-ewa.params.v3`
- **Canonical parameter byte size:** `80`
- **Canonical ellipse weight identity:** `tdt.ewa.ellipse.radial-v1`
- **Canonical coordinate convention:** `tdt.ewa.source-lattice.pixel-center-v2`
- **R4 product coordinate identity:** `tdt.ewa.product-coordinate.phase-correct-r4.v1`
- **R4 shared-tile proof identity:** `tdt.ewa.tile-coverage.phase-aware-r4.v1`
- **Primary runtime:** WebGPU/WGSL
- **R3 oracle runtime:** Node.js validation realm only
- **Runtime CPU resampling fallback:** forbidden
- **Runtime direct-load reference fallback:** forbidden
- **Out-of-tile product fallback:** forbidden
- **WebGL resample fallback:** forbidden
- **Canvas resample fallback:** forbidden
- **Physical GPU parity claim in source-only bake:** forbidden
- **Packaged Electron claim in source-only bake:** forbidden

---

# 0. Executive Contract

R4 shall repair the exact source-lattice defect proven by R3 without changing the EWA parameter ABI, ellipse shape policy, tensor producer, adaptive policy semantics, output surface format, or public facade.

R4 shall replace the round-centered candidate lattice with a continuous source-lattice candidate model in the canonical R4 and R6 tiled product shaders, their validation variants, and the direct-load reference shader.

The authoritative coordinate construction is:

```text
p = (destinationCoord + 0.5) * srcPerDst - 0.5
base = floor(p)
sampleCoord = base + integerOffset
delta = sampleCoord - p
fetchCoord = clamp(sampleCoord, 0, inputSize - 1)
```

The EWA ellipse shall be evaluated from `delta`.

The source texel shall be selected from `fetchCoord` derived from the same logical `sampleCoord`.

Border clamping shall affect only the physical texture fetch coordinate. It shall not replace `sampleCoord` in the ellipse distance.

R4 shall version the repaired assets. It shall not overwrite or reinterpret the R2 assets frozen by R3. The predecessor assets remain immutable evidence of the rejected round-centered construction.

R4 shall also repair shared-tile origin and coverage proof. A product shader is not phase-correct merely because its per-pixel candidate coordinates are phase-correct. The workgroup tile must be anchored to the minimum `floor(p)` of the active destination lanes and must cover every logical candidate coordinate from that minimum base through the maximum base plus the selected reach.

The canonical per-axis workgroup coverage rule is:

```text
firstDst = workgroupOrigin
lastDst = min(workgroupOrigin + workgroupExtent - 1, outputSize - 1)
firstP = (firstDst + 0.5) * srcPerDst - 0.5
lastP = (lastDst + 0.5) * srcPerDst - 0.5
baseMin = floor(min(firstP, lastP))
baseMax = floor(max(firstP, lastP))
span = baseMax - baseMin + 1
origin = baseMin - reach
requiredTileExtent = span + 2 * reach
```

The product shall dispatch only when the selected profile tile extent is greater than or equal to the exact phase-aware required extent on both axes.

R4 shall prove all of the following:

1. the R3 coordinate truth and fixture identities are consumed without mutation,
2. every new canonical product and reference shader computes `base = floor(p)`,
3. every candidate is `sampleCoord = base + integerOffset`,
4. every weight distance is `delta = vec2(sampleCoord) - p`,
5. no new canonical shader uses `round(p)` or offset-only distance,
6. border clamping does not alter logical distance,
7. the tiled product and direct reference use the same coordinate convention but remain independent in memory-access implementation,
8. the tile origin includes the `-0.5` source-lattice convention through `p`,
9. partial workgroups use the last active destination coordinate rather than an inactive synthetic lane,
10. host profile selection computes an exact phase-aware per-axis span proof,
11. product dispatch fails closed when coverage is unproven,
12. validation shaders count and expose out-of-tile attempts rather than hiding them,
13. R3 fractional-phase fixtures classify the repaired coordinate model as phase-correct,
14. the R3 round-centered negative control remains distinguishable,
15. the canonical runtime loads and dispatches the versioned R4 assets,
16. R2 assets remain byte-identical and are not canonical runtime targets,
17. no CPU, Canvas, WebGL, or reference-as-product fallback is introduced,
18. no Production Pointer is moved,
19. source-only bake receipts do not claim physical GPU execution,
20. R5 remains responsible for axial tensor interpolation and R6 remains responsible for kernel ABI unification.

The intended transition is:

```text
R3 oracle verified and current product rejected
    ↓
R4 versioned product/reference coordinate repair
    ↓
R4 phase-aware tile origin and host coverage proof
    ↓
R4 source and mock verification
    ↓
canonical source graph points to R4 assets
    ↓
physical GPU proof remains deferred to R9
```

R4 is a repair patch, not a promotion patch.

---

# 1. Parent Truth and Frozen Evidence

## 1.1 Parent bundle identity

The only admitted R4 parent bundle is:

```text
61_TDT_RESAMPLE_RUNTIME_01_R3_INDEPENDENT_FRACTIONAL_PHASE_EWA_ORACLE_CURRENT_PRODUCT_REJECTED_BAKED.zip
```

with SHA-256:

```text
706033b69dd076eecb76de2c46ce9eeb543db40b969f338d285ad927c7266e7d
```

A different parent bundle shall fail with `E_R4_PARENT_BUNDLE_IDENTITY_MISMATCH`.

## 1.2 Frozen predecessor assets

R4 shall preserve the following R2 assets byte-for-byte:

| Asset | Parent SHA-256 |
|---|---|
| `ewa_aniso_tile_r4_r2.wgsl` | `c2714270086eb1ad0a514e4850f01816b98890cfbd16755372001547b34aee24` |
| `ewa_aniso_tile_r6_r2.wgsl` | `0d7cb8a26cb063708bb4f04e665f0ef8e6d44cb4db58d802b341ad220bea58a7` |
| `ewa_aniso_tile_validation_r4_r2.wgsl` | `f9f7efedde8ca7c547359ac91b175aabb0868be2d87a50d2680d7373c6e210fd` |
| `ewa_aniso_tile_validation_r6_r2.wgsl` | `0c6bbbd8a3007f79bc7e1eb4dee0dec5ad2f4e7f20dfc1d095d7e16068eb7c8e` |
| `ewa_aniso_reference_v2_r1c.wgsl` | `bfd0e2d94e15467379b92c9c2ed4a3555be1d1b0a9a67b4f0f167eb550dbc4eb` |
| `ewa_tiled_profile_r2.mjs` | `07f1d65d5bc09b0f7231034ef85001ba4fdd6346cf93abe2cda441012ccd8b33` |
| `ewa_parity_runtime_r2.mjs` | `b787e6fffcf3c2c98d36cc6bb2fc34a2f67e460ae79b76bd3fa4144f4d768ba5` |

These files are predecessor evidence and regression inputs. They shall not be edited in place.

## 1.3 Frozen R3 evidence

R4 shall consume the checked-in R3 fixture manifest and receipts as read-only evidence.

At minimum, R4 shall verify the identity of:

- `TDT_RESAMPLE_RUNTIME_01_R3_FIXTURE_MANIFEST.json`,
- `TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_IDENTITY.json`,
- `TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_SELF_TEST_RECEIPT.json`,
- `TDT_RESAMPLE_RUNTIME_01_R3_NEGATIVE_CONTROL_RECEIPT.json`,
- `TDT_RESAMPLE_RUNTIME_01_R3_CURRENT_PRODUCT_REJECTION_RECEIPT.json`,
- `TDT_RESAMPLE_RUNTIME_01_R3_ZERO_RUNTIME_CPU_FALLBACK_RECEIPT.json`.

R4 shall not regenerate R3 expected values under a changed formula.

R4 may execute the existing R3 oracle verification command as a predecessor regression. It shall not import the oracle into runtime code.

## 1.4 R3 rejection remains historical truth

R4 shall not rewrite the R3 rejection receipt to say that the R2 product was correct.

The correct relationship is:

```text
R2 assets remain rejected under R3 coordinate truth.
R4 assets are new repaired assets evaluated under the same truth.
```

## 1.5 Current runtime module identity

The parent `ewa_aniso_tile.mjs` SHA-256 is:

```text
43f2d3b2b08006ef581ac16992a6ca7cd2c358d37180d0bb58fa6ccd2220592c
```

R4 is authorized to modify this runtime module only to:

- load versioned R4 product, validation, and reference assets,
- compile R4 identities,
- select the R4 profile proof,
- emit R4 receipts and telemetry,
- preserve all public facade signatures and device-epoch checks.

Unrelated runtime behavior shall not be changed.

---

# 2. Scope

## 2.1 In scope

R4 shall implement and seal:

1. versioned R4 and R6 tiled product shaders,
2. versioned R4 and R6 validation shaders,
3. a versioned direct-load reference shader,
4. continuous source-center mapping,
5. floor-anchored candidate enumeration,
6. exact sample-coordinate distance,
7. clamp-extension fetch semantics,
8. phase-correct center fallback semantics,
9. phase-aware workgroup tile origin,
10. partial-workgroup active-range handling,
11. exact per-axis group span enumeration,
12. required tile extent calculation,
13. fail-closed profile selection,
14. device workgroup-storage validation,
15. product and validation profile identity,
16. R4 shadow parity runtime wiring,
17. R3 oracle fixture consumption,
18. R3 negative-control rejection preservation,
19. source-level shared-error removal proof,
20. mock runtime dispatch proof,
21. active runtime asset manifest update,
22. active graph update,
23. static route admission update,
24. source receipt generation,
25. zero runtime CPU fallback audit,
26. predecessor R1A through R3 regression execution,
27. deterministic source bake,
28. explicit physical GPU deferral.

## 2.2 Out of scope

R4 shall not implement:

- subpixel interpolation of tensor orientation,
- axial double-angle tensor-field migration,
- subpixel interpolation of coherence or edge magnitude,
- `kernelSharpness` uniform wiring,
- taper exponent ABI,
- parameter ABI v4,
- Export lowpass convergence,
- Export residual redesign,
- adaptive support unclipping redesign,
- R8 alpha and DC conservation expansion,
- physical GPU oracle comparison,
- timestamp performance promotion,
- packaged Electron promotion,
- GPU Tile Atlas source-window translation,
- Production Pointer movement.

Those concerns remain assigned to R5 and later patches.

## 2.3 No opportunistic algorithm changes

R4 shall preserve:

- the existing structure tensor sample location,
- the existing adaptive policy sample location,
- `sigmaMain`,
- `sigmaCross`,
- `maxAnisotropy`,
- `minorCoverageFactor`,
- `coherenceExponent`,
- the radial weight equation,
- the R4 and R6 maximum reach,
- `rgba16float` output,
- premultiplied surface semantics inherited from the parent runtime.

Any output change beyond the coordinate repair shall be treated as an unscoped mutation.

---

# 3. Non-Breakage Contract

## 3.1 Public facade

The following exports shall retain their public signatures:

```js
createEWAAnisoPipeline(device)
dispatchEWAAniso(device, pipelineOrBundle, request)
loadEwaProductShader()
loadEwaReferenceShader()
```

## 3.2 Request shape

Existing canonical requests shall remain valid without caller changes.

R4 shall continue to accept the existing R1C parameter fields and `tensorMode === 'canonical-stage-local-r1c'`.

## 3.3 Parameter ABI

R4 shall preserve:

```text
EWA_R1C_ABI_ID = tdt.delta-k-ewa.params.v3
EWA_R1C_PARAM_BYTES = 80
EWA_R1C_ABI_VERSION = 0x0001000c
```

No field may be added, removed, reordered, or reinterpreted.

## 3.4 Pipeline bindings

Product and reference bind groups remain:

| Binding | Resource |
|---:|---|
| 0 | source texture |
| 1 | tensor texture |
| 2 | `rgba16float` destination storage texture |
| 3 | 80-byte uniform buffer |
| 4 | adaptive policy texture |

Validation shaders may extend the existing validation storage buffer contract as a validation-only identity.

## 3.5 Workgroup and profile geometry

R4 shall preserve:

```text
workgroup = 8 × 8 × 1
reach-4 candidate side = 9
reach-6 candidate side = 13
reach-4 tile = 24 × 24
reach-6 tile = 28 × 28
```

A future patch may resize profiles. R4 shall first prove that the current profile extents remain sufficient under the repaired phase convention for the admitted stage ratios.

## 3.6 Final Surface

R4 shall not alter Final Surface ownership, format, lifecycle, presentation, or export transfer contracts.

## 3.7 Device authority

R4 shall continue to use the single GPU Authority bridge and shall preserve runtime epoch, device epoch, device identity, recovery registration, and stale-bundle rejection.

## 3.8 Cancellation and stage sequencing

R4 shall not alter cancellation checks, stage order, stage-local tensor construction, adaptive policy construction, or GPU-resident intermediate handling in `deltaK_stack_autoEWA.mjs`.

---

# 4. Authority Hierarchy

R4 shall use the following authority order:

1. this R4 specification,
2. the R3 coordinate convention identity,
3. the R3 binary64 oracle and immutable fixture evidence,
4. the R4 product and direct-reference versioned sources,
5. the R4 phase-aware tile proof,
6. source and mock receipts,
7. optional later physical GPU receipts.

The following shall not define expected mathematical output:

- the rejected R2 product,
- the rejected R2 reference,
- the round-centered negative control,
- an image judged visually plausible,
- product/reference equality without oracle agreement,
- a tile validation run that used direct-load fallback,
- a CPU runtime fallback result.

---

# 5. Identity Model

R4 shall define the following stable identities:

```text
coordinateConventionId = tdt.ewa.source-lattice.pixel-center-v2
productCoordinateId = tdt.ewa.product-coordinate.phase-correct-r4.v1
tileCoverageProofId = tdt.ewa.tile-coverage.phase-aware-r4.v1
profileSchemaId = tdt.ewa.tiled-profile.r4.v1
productR4ProfileId = tdt.ewa.tile.r4.reach4-8x8-v1
productR6ProfileId = tdt.ewa.tile.r4.reach6-8x8-v1
referenceShaderId = tdt.ewa.reference.phase-correct-r4.v1
validationSchemaId = tdt.ewa.tile-validation.r4.v1
sourceReceiptSchemaId = tdt.ewa.resample-runtime-r4.source-receipt.v1
```

The existing ellipse identity remains:

```text
ellipseKernelId = tdt.ewa.ellipse.radial-v1
```

R4 shall not claim that the radial weight equation changed. Only its distance argument and logical sample anchor are repaired.

---

# 6. Continuous Source-Lattice Contract

## 6.1 Pixel-center convention

An integer source coordinate denotes the center of that source texel.

An integer destination coordinate denotes the center of that destination pixel.

For one axis:

```text
scale = sourceSize / destinationSize
p = (destinationIndex + 0.5) * scale - 0.5
```

For two axes:

```text
p = (vec2(destinationCoord) + vec2(0.5)) * srcPerDst - vec2(0.5)
```

## 6.2 Base coordinate

The candidate base shall be:

```text
base = floor(p)
```

`round(p)`, `ceil(p)`, truncation toward zero, and integer conversion before `floor` are forbidden.

## 6.3 Candidate coordinate

For integer loop offset `offset`:

```text
sampleCoord = base + offset
```

The same `sampleCoord` shall feed both logical distance and physical fetch derivation.

## 6.4 Exact distance

The distance passed to the EWA ellipse is:

```text
delta = vec2<f32>(sampleCoord) - p
```

The following are forbidden:

```text
delta = vec2(offset)
delta = vec2(round(p) + offset) - p
delta = vec2(fetchCoord) - p
```

The first erases phase. The second reintroduces round anchoring. The third lets border clamping deform the ellipse.

## 6.5 Fractional phase

For:

```text
p = base + phase
0 <= phase < 1
```

R4 shall preserve `phase` in `delta`.

Two destination pixels that map to different phases but share the same `floor(p)` shall generally produce different weights on a non-constant source.

## 6.6 Integer translation covariance

For integer translation `k`:

```text
p' = p + k
base' = base + k
sampleCoord' = sampleCoord + k
delta' = delta
```

R4 shall preserve this covariance away from border effects.

## 6.7 Candidate completeness

Let selected integer reach be `R`, and let both ellipse radii be less than or equal to `R`.

For every integer sample coordinate that can satisfy the ellipse support condition, the offset from `floor(p)` lies within:

```text
[-R, R]
```

Therefore the existing square loop bounds remain complete after the phase repair.

R4 shall include a proof and exhaustive bounded check for all sealed phase values and both profile reaches.

## 6.8 Center fallback

The defensive `sum <= EPS` fallback shall use:

```text
load(base)
```

not `load(round(p))`.

The validation variant shall increment `zeroWeightFallbackCount` whenever this path is taken.

R4 source verification may admit the defensive branch. Passing fixture and mock evidence shall require the count to remain zero.

---

# 7. Ellipse and Weight Contract

R4 shall preserve the current tangent canonicalization, anisotropy gate, radii, and radial weight equation.

The ellipse equation remains:

```text
normal = (-tangent.y, tangent.x)
q = (dot(delta, tangent) / major)^2
  + (dot(delta, normal) / minor)^2
```

A candidate contributes only when:

```text
q <= 1
```

The weight remains:

```text
weight = exp(-1.65 * q) * max(0, 1 - q)
```

R4 shall not move `1.65` into the ABI. That is assigned to R6.

The output remains:

```text
accumulatedColor / accumulatedWeight
```

for positive finite weight sum.

R4 shall preserve fixed loop order:

```text
y-major, x-minor
```

so product/reference differences are attributable to memory access or floating-point execution rather than candidate reordering.

---

# 8. Border Contract

## 8.1 Logical versus physical coordinate

R4 shall distinguish:

```text
logicalSampleCoord = base + offset
fetchCoord = clamp(logicalSampleCoord, 0, inputSize - 1)
delta = logicalSampleCoord - p
```

## 8.2 Clamp extension

The border mode remains clamp extension.

Coordinates outside the image logically sample repeated edge texels, but each repeated texel retains the distance of its logical lattice coordinate.

## 8.3 Forbidden border collapse

The following is forbidden:

```text
delta = clamp(sampleCoord) - p
```

It would stack multiple logical candidates at one distance and change normalization near borders.

## 8.4 Tiled preload semantics

The shared tile may contain repeated edge values because `loadSrc` clamps the physical fetch.

The tile index shall still represent the unclamped logical coordinate:

```text
tileIndex ↔ origin + localCoord
```

This preserves parity with direct-load clamp extension.

---

# 9. Versioned Shader Assets

R4 shall add, at minimum:

```text
app/legacy-runtime/core/compute/qmap_webgpu/shaders/
  ewa_aniso_tile_r4_r4.wgsl
  ewa_aniso_tile_r6_r4.wgsl
  ewa_aniso_tile_validation_r4_r4.wgsl
  ewa_aniso_tile_validation_r6_r4.wgsl
  ewa_aniso_reference_v3_r4.wgsl
```

These filenames are authoritative for R4. In-place edits to the R2 files are forbidden.

## 9.1 Product shader required construction

Each new tiled product shader shall contain semantically equivalent operations to:

```wgsl
let p =
    (vec2<f32>(gid.xy) + vec2<f32>(0.5)) * U.srcPerDst
    - vec2<f32>(0.5);
let base = vec2<i32>(floor(p));

for (...) {
    let sampleCoord = base + vec2<i32>(x, y);
    let delta = vec2<f32>(sampleCoord) - p;
    let weight = weightFor(delta, ellipseField);
    if (weight > 0.0) {
        acc += sampleTileStrict(sampleCoord, tileOrigin) * weight;
        sum += weight;
    }
}
```

## 9.2 Reference shader required construction

The direct-load reference shall use the same mathematical coordinates but shall fetch through its independent direct load function:

```wgsl
acc += load(sampleCoord) * weight;
```

It shall not use the shared tile, tile origin, or tile-local index.

## 9.3 Source-level forbidden signatures

The new canonical files shall contain zero occurrences of constructions semantically equivalent to:

```text
round(p)
round(p) + offset
d = vec2<f32>(f32(x), f32(y))
load(round(p))
```

A comment containing a forbidden predecessor expression shall also be rejected from canonical shaders. Historical discussion belongs in the specification and tools, not in product WGSL.

## 9.4 Product/reference independence

Product and reference shader digests shall differ.

The reference shall not import or include product source text.

The product shall not call a direct-load helper when tile coverage fails.

---

# 10. Phase-Aware Shared-Tile Origin

## 10.1 Active destination interval

For each axis:

```text
firstDst = groupIndex * workgroupExtent
lastDst = min(firstDst + workgroupExtent - 1, outputSize - 1)
```

The last coordinate shall be the last active output coordinate.

Using the nominal inactive lane at `firstDst + workgroupExtent - 1` for a partial group is forbidden when it exceeds `outputSize - 1`.

## 10.2 Source interval

The shader shall calculate:

```text
firstP = (firstDst + 0.5) * srcPerDst - 0.5
lastP = (lastDst + 0.5) * srcPerDst - 0.5
```

The `-0.5` term is mandatory.

## 10.3 Base interval

The logical base interval is:

```text
baseMin = floor(min(firstP, lastP))
baseMax = floor(max(firstP, lastP))
```

For positive scale the mapping is monotone, but the explicit minimum and maximum keep the proof structurally symmetric.

## 10.4 Tile origin

For profile reach `R`:

```text
tileOrigin = baseMin - R
```

The product shader constant `HALO` shall equal the profile reach.

## 10.5 Tile maximum logical coordinate

The highest required logical coordinate is:

```text
baseMax + R
```

## 10.6 Required extent

The exact required tile extent is:

```text
(baseMax + R) - (baseMin - R) + 1
= baseMax - baseMin + 1 + 2R
= span + 2R
```

## 10.7 Two-dimensional origin

The shader shall calculate each axis independently and combine them into `vec2<i32>`.

It shall not derive both axes from one scalar scale bound.

## 10.8 Barrier uniformity

All workgroup invocations shall cooperatively preload the tile and execute the same `workgroupBarrier()` before any invocation returns for output bounds.

The coordinate repair shall not reintroduce a non-uniform barrier.

---

# 11. Host Phase-Aware Coverage Proof

R4 shall add:

```text
app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r4.mjs
```

with exported identities and functions equivalent to:

```js
computeEwaR4FootprintProof(request)
computeEwaR4AxisTileProof({ sourceSize, outputSize, workgroupExtent, reach })
computeEwaR4TileProof(request, profile)
selectEwaR4Profile(request, deviceLimits)
```

## 11.1 Exact per-axis enumeration

For each axis, the proof shall enumerate every dispatched workgroup index:

```text
groupCount = ceil(outputSize / workgroupExtent)
```

For each group it shall compute first and last active destination coordinates, continuous source positions, floor bases, span, and required extent.

The receipt shall retain:

- maximum span,
- maximum required extent,
- witness group index,
- witness first and last destination coordinates,
- witness first and last source positions,
- witness base minimum and maximum.

The proof may also compute an analytic upper bound. The exact enumerated maximum remains authoritative for the admitted dimensions.

## 11.2 Profile selection

R4 retains reach profiles 4 and 6.

The footprint proof selects the smallest profile whose reach covers the bounded ellipse radii.

The tile proof then verifies that the selected profile tile dimensions cover the exact phase-aware group spans.

The selection order is:

```text
parameter validation
→ footprint bound
→ reach profile selection
→ device storage limit validation
→ exact phase-aware tile proof
→ dispatch admission
```

## 11.3 Fail closed

If either axis requires a larger tile than the profile provides, selection shall throw:

```text
E_R4_TILE_COVERAGE_UNPROVEN
```

It shall not:

- clamp the group span,
- reduce the reach,
- switch to direct loads,
- switch to R2,
- switch to CPU,
- continue with a warning.

## 11.4 Deterministic proof identity

The profile selection object shall be canonical-JSON serializable and shall include:

```text
coordinateConventionId
profileSchemaId
profileId
footprint proof
tile proof
```

Its digest shall be recorded in each canonical dispatch receipt.

---

# 12. Validation Shader Contract

R4 validation shaders shall retain the same product math and shared-tile preload logic.

They may add diagnostics only.

The validation storage schema shall contain at least eight atomic `u32` words:

| Index | Meaning |
|---:|---|
| 0 | out-of-tile attempt count |
| 1 | in-tile sample count |
| 2 | zero-weight fallback count |
| 3 | non-finite coordinate or weight count |
| 4 | minimum observed local X |
| 5 | minimum observed local Y |
| 6 | maximum observed local X |
| 7 | maximum observed local Y |

Minimum counters shall be initialized to `0xffffffff`.

Validation may direct-load a value after an out-of-tile attempt solely to complete diagnostics. Any nonzero out-of-tile count shall make the run FAIL. Such a validation output shall never be compared as passing product output.

Product shaders shall not contain this fallback.

Passing validation evidence requires:

```text
outOfTileAttemptCount = 0
zeroWeightFallbackCount = 0
nonFiniteCoordinateOrWeightCount = 0
minimum local coordinate >= 0
maximum local coordinate < tile extent
```

---

# 13. Product and Reference Runtime Wiring

## 13.1 Canonical loader

`ewa_aniso_tile.mjs` shall load the versioned R4 assets.

`loadEwaProductShader()` shall return the canonical repaired reach-6 product shader.

`loadEwaReferenceShader()` shall return the repaired direct-load reference shader.

## 13.2 Bundle schema

The EWA bundle shall advance its schema version and shall expose at least:

```text
canonical
tiledR4
tiledR6
validationR4
validationR6
reference
legacyV2
comparator
coordinateConventionId
productCoordinateId
tileCoverageProofId
profileSchemaId
ellipseKernelId
runtimeEpoch
deviceEpoch
deviceIdentity
```

The field names `tiledR4` and `tiledR6` may remain for facade compatibility. Their identities shall refer to repaired R4 patch assets.

## 13.3 Pipeline identity

Pipeline cache identity shall include:

```text
patch identity
profile identity
coordinate convention identity
ABI identity
shader digest
```

A cache key that differs only by shader digest but omits coordinate identity shall fail source verification.

## 13.4 Canonical selection

For `tensorMode === 'canonical-stage-local-r1c'`, runtime dispatch shall call `selectEwaR4Profile`.

Calling `selectEwaR2Profile` in the canonical branch is forbidden.

The rejected R2 assets may remain reachable only through explicit predecessor verification tools. They shall not be user-selectable runtime modes.

## 13.5 Direct reference role

The repaired reference exists for shadow parity and validation.

It shall never become the normal product target, automatic fallback, or compatibility substitute.

---

# 14. Fractional-Phase Repair Verification

## 14.1 R3 fixture reuse

R4 shall use the immutable R3 fixture manifest and source payload digests.

It shall not silently narrow fixture coverage.

## 14.2 Coordinate-model evaluator

R4 may add a validation-only source-coordinate evaluator under:

```text
tools/resample-runtime-01-r4/
```

The evaluator shall implement only the R4 coordinate and tile proof model. It shall not process user images and shall not enter runtime bundles.

## 14.3 Required classification

For all applicable R3 fixtures:

```text
R4 coordinate model ↔ R3 oracle coordinate truth: PASS
R4 coordinate model ↔ round-centered negative control on phase-sensitive fixtures: DIFFERENT
```

## 14.4 Shared-error removal source proof

Static source verification shall prove that every new canonical product, validation, and reference shader:

- computes `base` from `floor(p)`,
- computes candidate coordinate from base plus offset,
- computes distance from candidate coordinate minus `p`,
- avoids `round(p)`,
- avoids offset-only distance.

## 14.5 Product/reference parity is necessary but insufficient

A later physical GPU product/reference exact parity result remains necessary for tiled memory correctness.

It is not sufficient without the R3 oracle relationship.

R4 source receipts shall preserve this distinction.

---

# 15. R4 Shadow Parity Runtime

R4 shall add or version the parity runtime as:

```text
ewa_parity_runtime_r4.mjs
```

The runtime shall:

- use `selectEwaR4Profile`,
- dispatch the repaired product and repaired reference,
- use the existing exact `rgba16float` comparator semantics,
- record product and reference shader digests,
- record coordinate convention and tile proof identities,
- preserve NaN and Infinity counts,
- destroy temporary textures and buffers exactly once,
- abort on device loss or stale epoch.

In source-only environments without physical WebGPU, the parity status shall be `DEFERRED`, not fabricated `PASS`.

A mock runtime may verify resource wiring, command order, profile selection, and cleanup. It shall not emit pixel parity claims.

---

# 16. Runtime CPU Fallback Prohibition

The R3 zero-runtime-CPU-fallback seal remains binding.

R4 shall not import any R3 oracle module from:

- renderer source,
- runtime worker source,
- Preview path,
- Export path,
- Vite entry graph,
- active production graph,
- Electron package content.

R4 shall not add a branch equivalent to:

```text
if WebGPU fails, run the binary64 oracle or JS EWA over the user image
```

WebGPU or tile-proof failure shall reject the operation with a stable error.

Reference-as-product fallback is also forbidden.

---

# 17. Active Graph and Asset Admission

R4 shall update the authoritative asset generator inputs so the versioned R4 WGSL files are admitted to:

- runtime asset manifest,
- legacy static admission,
- active runtime graph,
- emitted static route manifest.

The rejected R2 assets may remain statically packaged only where predecessor verification or explicit rollback evidence requires them. They shall not be marked canonical runtime product assets.

Generated files shall be regenerated through their authoritative generators. Hand-editing generated manifests is forbidden.

The active graph shall identify exactly one canonical EWA product coordinate model:

```text
tdt.ewa.product-coordinate.phase-correct-r4.v1
```

---

# 18. Determinism and Reproducibility

R4 tools and receipts shall not use wall-clock time, random values, machine-specific temporary paths, or unordered object traversal as identity inputs.

Running the R4 source verification twice in clean processes against the same tree shall produce byte-identical deterministic receipts, except explicitly external physical GPU evidence which is not part of the source-only identity.

Canonical JSON shall use stable key ordering and UTF-8 with LF line endings.

---

# 19. Stable Errors

R4 shall define and use stable error codes including:

```text
E_R4_PARENT_BUNDLE_IDENTITY_MISMATCH
E_R4_R3_EVIDENCE_MISSING
E_R4_R3_EVIDENCE_MUTATED
E_R4_R2_ASSET_MUTATED
E_R4_COORDINATE_CONVENTION_MISMATCH
E_R4_ROUND_CENTERED_CONSTRUCTION_PRESENT
E_R4_PHASE_DISTANCE_CONSTRUCTION_MISSING
E_R4_CANDIDATE_BASE_CONSTRUCTION_MISSING
E_R4_LOGICAL_FETCH_COORDINATE_MISMATCH
E_R4_BORDER_DISTANCE_COLLAPSED
E_R4_CANDIDATE_COMPLETENESS_FAILED
E_R4_PROFILE_INPUT_INVALID
E_R4_FOOTPRINT_UNSUPPORTED
E_R4_WORKGROUP_STORAGE_LIMIT
E_R4_PARTIAL_GROUP_PROOF_FAILED
E_R4_TILE_PHASE_PROOF_FAILED
E_R4_TILE_COVERAGE_UNPROVEN
E_R4_TILE_ORIGIN_CONTRACT_MISMATCH
E_R4_HALO_REACH_MISMATCH
E_R4_OUT_OF_TILE_ATTEMPT
E_R4_ZERO_WEIGHT_FALLBACK
E_R4_NONFINITE_COORDINATE
E_R4_PRODUCT_REFERENCE_IDENTITY_COLLISION
E_R4_SHADER_FETCH_FAILED
E_R4_SHADER_COMPILE_FAILED
E_R4_PIPELINE_BUNDLE_INCOMPLETE
E_R4_STALE_PIPELINE_EPOCH
E_R4_ORACLE_COORDINATE_MISMATCH
E_R4_NEGATIVE_CONTROL_NOT_REJECTED
E_R4_CANONICAL_RUNTIME_STILL_R2
E_R4_RUNTIME_ASSET_MISSING
E_R4_ACTIVE_GRAPH_MISSING
E_R4_GENERATED_MANIFEST_STALE
E_R4_CPU_FALLBACK_WIRED
E_R4_REFERENCE_AS_PRODUCT_WIRED
E_R4_PRODUCTION_POINTER_MUTATION
E_R4_PHYSICAL_GPU_CLAIM_UNSUPPORTED
E_R4_RECEIPT_INCOMPLETE
E_R4_PREDECESSOR_REGRESSION_FAILED
```

Errors shall include structured detail sufficient to identify profile, dimensions, axis, workgroup witness, shader digest, and coordinate identity where applicable.

---

# 20. Receipt Model

R4 shall emit deterministic receipts under:

```text
artifacts/resample-runtime-01-r4/source-bake/
```

## 20.1 Parent freeze receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_PARENT_FREEZE.sha256
```

shall contain parent bundle identity and frozen R2 asset identities.

## 20.2 Coordinate repair receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_COORDINATE_REPAIR_RECEIPT.json
```

shall include:

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-RESAMPLE-RUNTIME-01-R4",
  "coordinateConventionId": "tdt.ewa.source-lattice.pixel-center-v2",
  "productCoordinateId": "tdt.ewa.product-coordinate.phase-correct-r4.v1",
  "candidateBase": "floor(p)",
  "candidateCoordinate": "base+integerOffset",
  "distance": "sampleCoord-p",
  "borderDistance": "logical-coordinate",
  "roundCenteredSignatureCount": 0,
  "offsetOnlyDistanceSignatureCount": 0
}
```

## 20.3 Shader identity receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_SHADER_IDENTITY_RECEIPT.json
```

shall record all new product, validation, reference, comparator, and runtime-module digests.

## 20.4 Tile proof receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_PHASE_AWARE_TILE_PROOF_RECEIPT.json
```

shall record per-fixture profile selection and axis witnesses.

## 20.5 R3 oracle relationship receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_R3_ORACLE_RELATIONSHIP_RECEIPT.json
```

shall record fixture counts, coordinate mismatches, and negative-control separation.

## 20.6 Runtime wiring receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_RUNTIME_WIRING_RECEIPT.json
```

shall prove canonical R4 asset and profile selection.

## 20.7 Zero fallback receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_ZERO_FALLBACK_RECEIPT.json
```

shall include CPU, Canvas, WebGL, reference-as-product, and direct-load product fallback scans.

## 20.8 Mock runtime receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_MOCK_RUNTIME_RECEIPT.json
```

shall state explicitly that pixel parity and physical GPU execution were not claimed.

## 20.9 Source gate

```text
TDT_RESAMPLE_RUNTIME_01_R4_SOURCE_GATE.json
```

shall contain all gate statuses.

## 20.10 Source receipt

```text
TDT_RESAMPLE_RUNTIME_01_R4_SOURCE_RECEIPT.json
```

shall contain the final deterministic source-bake identity.

A minimal source receipt shape is:

```json
{
  "schemaVersion": 1,
  "schemaId": "tdt.ewa.resample-runtime-r4.source-receipt.v1",
  "patchId": "TDT-RESAMPLE-RUNTIME-01-R4",
  "parentPatchId": "TDT-RESAMPLE-RUNTIME-01-R3",
  "parentBundleSha256": "706033b69dd076eecb76de2c46ce9eeb543db40b969f338d285ad927c7266e7d",
  "coordinateConventionId": "tdt.ewa.source-lattice.pixel-center-v2",
  "productCoordinateId": "tdt.ewa.product-coordinate.phase-correct-r4.v1",
  "tileCoverageProofId": "tdt.ewa.tile-coverage.phase-aware-r4.v1",
  "parameterAbiId": "tdt.delta-k-ewa.params.v3",
  "parameterBytes": 80,
  "r2AssetsPreserved": true,
  "r3EvidencePreserved": true,
  "canonicalRuntimeUsesR4": true,
  "runtimeCpuFallbackCount": 0,
  "referenceAsProductFallbackCount": 0,
  "productionPointerMutated": false,
  "physicalGpuExecuted": false,
  "physicalGpuStatus": "DEFERRED_TO_R9",
  "status": "RESAMPLE_RUNTIME_R4_PHASE_CORRECT_PRODUCT_REFERENCE_REPAIRED_AWAITING_R5"
}
```

---

# 21. Telemetry

R4 product telemetry shall extend the bounded EWA telemetry with:

```text
r4DispatchCount
r4Reach4SelectionCount
r4Reach6SelectionCount
r4TileProofFailureCount
r4PartialGroupDispatchCount
r4StaleEpochRejectCount
r4DeviceLossAbortCount
```

Validation-only telemetry shall include:

```text
outOfTileAttemptCount
inTileSampleCount
zeroWeightFallbackCount
nonFiniteCoordinateCount
minimumLocalX
minimumLocalY
maximumLocalX
maximumLocalY
```

No per-pixel unbounded telemetry array shall enter production runtime.

---

# 22. Resource and Lifecycle Contract

R4 shall preserve one-time disposal of:

- product parameter buffers,
- validation parameter buffers,
- reference parameter buffer,
- neutral policy texture,
- parity textures,
- parity summary and readback buffers,
- validation buffers.

A device-loss callback shall invalidate the R4 bundle and increment the R4 device-loss counter.

A stale R2 or R4 bundle from a previous device epoch shall not be reused.

Mock resources shall expose destruction counts and shall fail on double destruction or leaked temporary resources.

---

# 23. Source Layout

R4 shall add or update at least:

```text
app/legacy-runtime/core/compute/qmap_webgpu/
  ewa_aniso_tile.mjs
  ewa_tiled_profile_r4.mjs
  ewa_parity_runtime_r4.mjs
  ewa_optimization_receipt_r4.mjs
  shaders/
    ewa_aniso_tile_r4_r4.wgsl
    ewa_aniso_tile_r6_r4.wgsl
    ewa_aniso_tile_validation_r4_r4.wgsl
    ewa_aniso_tile_validation_r6_r4.wgsl
    ewa_aniso_reference_v3_r4.wgsl

tools/resample-runtime-01-r4/
  lib.mjs
  generate-fixtures.mjs
  r4-coordinate-model.mjs
  phase-aware-tile-proof.mjs
  verify-parent-freeze.mjs
  verify-coordinate-contract.mjs
  verify-product-reference-source.mjs
  verify-tile-proof.mjs
  verify-r3-oracle-relationship.mjs
  verify-runtime-wiring.mjs
  verify-zero-fallback.mjs
  runtime-smoke.mjs
  gate.mjs
  finalize.mjs
  run.mjs

fixtures/resample-runtime-01-r4/
  TDT_RESAMPLE_RUNTIME_01_R4_TILE_PROOF_FIXTURES.json

artifacts/resample-runtime-01-r4/source-bake/
  ...receipts...

specs/
  TDT-RESAMPLE-RUNTIME-01-R4_..._SPEC.md

README_TDT_RESAMPLE_RUNTIME_01_R4_APPLIED.md
```

R4 may use a generated WGSL template only if generated output is checked in, deterministic, independently hashed, and source verification proves the generated files are not stale.

---

# 24. Package Scripts

R4 shall add scripts equivalent to:

```json
{
  "generate:resample-runtime-01-r4": "node tools/resample-runtime-01-r4/generate-fixtures.mjs",
  "verify:resample-runtime-01-r4:coordinate": "node tools/resample-runtime-01-r4/verify-coordinate-contract.mjs && node tools/resample-runtime-01-r4/verify-r3-oracle-relationship.mjs",
  "verify:resample-runtime-01-r4:tile": "node tools/resample-runtime-01-r4/verify-tile-proof.mjs",
  "verify:resample-runtime-01-r4:source": "node tools/resample-runtime-01-r4/verify-parent-freeze.mjs && node tools/resample-runtime-01-r4/verify-product-reference-source.mjs && node tools/resample-runtime-01-r4/verify-runtime-wiring.mjs && node tools/resample-runtime-01-r4/verify-zero-fallback.mjs",
  "smoke:resample-runtime-01-r4": "node tools/resample-runtime-01-r4/runtime-smoke.mjs",
  "gate:resample-runtime-01-r4": "node tools/resample-runtime-01-r4/gate.mjs",
  "verify:resample-runtime-01-r4": "node tools/resample-runtime-01-r4/run.mjs",
  "finalize:resample-runtime-01-r4": "node tools/resample-runtime-01-r4/finalize.mjs"
}
```

The root `verify:renderer` chain shall include R4 after R3.

---

# 25. Implementation Sequence

## 25.1 R4-A parent and evidence freeze

- verify parent ZIP digest,
- verify frozen R2 asset digests,
- verify R3 receipt and fixture identities,
- copy the R4 specification into `specs/`.

## 25.2 R4-B coordinate model

- implement validation-only R4 coordinate model,
- consume R3 fixtures,
- prove oracle agreement,
- preserve negative-control separation.

## 25.3 R4-C versioned reference repair

- create direct-load reference v3 R4,
- replace round anchor with floor base,
- replace offset-only distance with sample-minus-p,
- preserve clamp-extension logical distance.

## 25.4 R4-D tiled product repair

- create reach-4 and reach-6 product shaders,
- implement phase-aware tile origin,
- preserve uniform barrier,
- prohibit direct-load fallback.

## 25.5 R4-E validation repair

- create matching validation shaders,
- add bounded diagnostics,
- require zero out-of-tile attempts.

## 25.6 R4-F host proof and profile selection

- implement exact per-axis group span proof,
- fail closed on tile insufficiency,
- bind proof digest to dispatch receipt.

## 25.7 R4-G runtime canonical wiring

- point the canonical source runtime to R4 assets,
- preserve public facade and ABI,
- add R4 parity and receipt identities,
- update active asset generators.

## 25.8 R4-H regression and seal

- run R1A, R1B, R1C, R1D, R2, and R3 regression suites,
- run R4 source, coordinate, tile, mock, and fallback gates,
- emit deterministic receipts,
- leave physical GPU and package states deferred.

---

# 26. Coordinate Verification Strategy

The coordinate verifier shall cover at least:

- phase `0`,
- phase `1/16`,
- phase `1/8`,
- phase `1/4`,
- phase `1/2`,
- phase `3/4`,
- phase `15/16`,
- negative source positions produced near the first destination pixel,
- exact integer source positions,
- positions immediately below and above half-integers,
- X-only, Y-only, and paired XY phases,
- isotropic and anisotropic ellipses,
- tangent sign reversal,
- border and interior candidates,
- reach 4 and reach 6.

The verifier shall assert exact candidate integer coordinates and bounded numerical agreement of binary64 weight calculations with the R3 oracle.

The negative control must still differ on the phase-sensitive subset. If it does not, R4 shall fail with `E_R4_NEGATIVE_CONTROL_NOT_REJECTED`.

---

# 27. Tile-Proof Fixture Strategy

R4 tile fixtures shall cover:

- output widths and heights from 1 through 17,
- exact multiples of 8,
- one less and one more than multiples of 8,
- odd input and output dimensions,
- scale 1.0,
- scale 1.125,
- scale 1.25,
- scale 1.5,
- scale 1.75,
- scale 2.0,
- independent X and Y scales,
- reach 4,
- reach 6,
- first, middle, and last workgroups,
- negative first source position,
- base transition inside a workgroup,
- phase transition at a workgroup boundary.

For every group, the verifier shall enumerate every active destination lane and every integer offset in the selected reach. It shall prove:

```text
0 <= sampleCoord - tileOrigin < tileExtent
```

on each axis.

The host proof witness and exhaustive lane enumeration shall agree.

---

# 28. Mock Runtime Strategy

The mock runtime shall verify:

- versioned shader URLs are fetched,
- product/reference shader identities differ,
- R4 profile selection is called,
- correct reach profile is selected,
- phase-aware proof is attached,
- parameter ABI remains 80 bytes,
- bind group resources retain expected bindings,
- command order is product then optional validation/reference as requested,
- dispatch dimensions use ceiling division by 8,
- inactive lanes return only after the shared barrier in source structure,
- temporary resources are destroyed once,
- stale device epoch rejects dispatch,
- device-loss invalidates the bundle,
- no CPU result is returned.

The mock runtime shall not synthesize pixel values and shall not claim physical GPU parity.

---

# 29. Physical GPU Deferral

R4 source bake may compile and execute on a physical GPU when an eligible environment is available, but this is not required for the R4 source-verified state.

Without physical evidence, the following remain `DEFERRED`:

- WGSL compiler acceptance on target Chrome/Electron,
- exact tiled product versus direct reference pixel parity,
- GPU versus R3 oracle stored-half-float comparison,
- validation counter readback,
- device-loss execution during parity,
- timestamp performance.

These are promoted under the later physical GPU seal, planned as R9.

R4 shall never convert missing physical evidence into `PASS` through mock data.

---

# 30. Promotion and State Rules

## 30.1 Source-baked state

The state:

```text
RESAMPLE_RUNTIME_R4_CONTINUOUS_LATTICE_REPAIR_SOURCE_BAKED_AWAITING_PHYSICAL_GPU
```

may be issued when source, coordinate, tile, fallback, active-graph, and deterministic receipt gates pass, while physical GPU gates are explicitly deferred.

## 30.2 Source-verified state

The state:

```text
RESAMPLE_RUNTIME_R4_PHASE_CORRECT_PRODUCT_REFERENCE_REPAIRED_AWAITING_R5
```

may be issued when:

- all mandatory source gates pass,
- R3 oracle relationship passes,
- the canonical runtime graph points to R4 assets,
- predecessor assets remain immutable,
- no runtime fallback is wired,
- all physical claims remain explicitly deferred.

## 30.3 Forbidden states

R4 shall not issue:

```text
PRODUCTION_PROMOTED
PACKAGED_ELECTRON_VERIFIED
PHYSICAL_GPU_PARITY_PASS
PERFORMANCE_PROMOTED
```

without later evidence authorities.

## 30.4 Production Pointer

Any Production Pointer mutation during R4 shall fail the patch.

---

# 31. Non-Claims

R4 does not claim:

- tensor-field interpolation is phase-continuous,
- Preview and Export use one canonical lowpass,
- kernel sharpness is parameterized,
- support clipping is impossible for all future policies,
- physical GPU output has been observed,
- target GPU performance meets promotion thresholds,
- packaged Electron contains and executes the repaired assets,
- GPU Tile Atlas windows preserve global sample coordinates,
- the overall application is production-promoted.

R4 claims only the versioned source repair, host tile proof, canonical source wiring, and their deterministic evidence.

---

# 32. Required Bake Artifacts

A complete R4 source bake shall contain:

1. this specification,
2. `README_TDT_RESAMPLE_RUNTIME_01_R4_APPLIED.md`,
3. all versioned R4 WGSL assets,
4. R4 profile and parity runtime modules,
5. R4 receipt/telemetry module,
6. R4 validation tools,
7. tile-proof fixtures,
8. coordinate repair receipt,
9. shader identity receipt,
10. phase-aware tile proof receipt,
11. R3 oracle relationship receipt,
12. runtime wiring receipt,
13. zero fallback receipt,
14. mock runtime receipt,
15. source gate,
16. source receipt,
17. parent freeze file,
18. predecessor regression log,
19. updated generated runtime asset manifest,
20. updated active graph and static admission outputs,
21. package script registration.

---

# 33. Gate Matrix

The following gates are mandatory unless explicitly marked `DEFERRED_WHEN_NO_PHYSICAL_GPU`.

## R4-01

- **Requirement:** parent bundle identity
- **Evidence:** SHA-256 equals the admitted R3 bundle digest
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PARENT_BUNDLE_IDENTITY_MISMATCH`

## R4-02

- **Requirement:** R2 reach-4 product immutable
- **Evidence:** frozen predecessor digest matches
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R2_ASSET_MUTATED`

## R4-03

- **Requirement:** R2 reach-6 product immutable
- **Evidence:** frozen predecessor digest matches
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R2_ASSET_MUTATED`

## R4-04

- **Requirement:** R2 reach-4 validation immutable
- **Evidence:** frozen predecessor digest matches
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R2_ASSET_MUTATED`

## R4-05

- **Requirement:** R2 reach-6 validation immutable
- **Evidence:** frozen predecessor digest matches
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R2_ASSET_MUTATED`

## R4-06

- **Requirement:** R2 direct reference immutable
- **Evidence:** frozen predecessor digest matches
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R2_ASSET_MUTATED`

## R4-07

- **Requirement:** R2 profile selector immutable
- **Evidence:** frozen predecessor digest matches
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R2_ASSET_MUTATED`

## R4-08

- **Requirement:** R2 parity runtime immutable
- **Evidence:** frozen predecessor digest matches
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R2_ASSET_MUTATED`

## R4-09

- **Requirement:** R3 fixture manifest present
- **Evidence:** read-only evidence exists and parses
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R3_EVIDENCE_MISSING`

## R4-10

- **Requirement:** R3 oracle identity preserved
- **Evidence:** oracle and coordinate IDs match R3 receipt
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R3_EVIDENCE_MUTATED`

## R4-11

- **Requirement:** R3 rejection receipt preserved
- **Evidence:** R2 rejection remains unchanged
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_R3_EVIDENCE_MUTATED`

## R4-12

- **Requirement:** coordinate convention identity
- **Evidence:** pixel-center-v2 is the sole canonical coordinate ID
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_COORDINATE_CONVENTION_MISMATCH`

## R4-13

- **Requirement:** versioned reach-4 product exists
- **Evidence:** new canonical WGSL asset is present
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RUNTIME_ASSET_MISSING`

## R4-14

- **Requirement:** versioned reach-6 product exists
- **Evidence:** new canonical WGSL asset is present
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RUNTIME_ASSET_MISSING`

## R4-15

- **Requirement:** versioned reach-4 validation exists
- **Evidence:** new validation WGSL asset is present
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RUNTIME_ASSET_MISSING`

## R4-16

- **Requirement:** versioned reach-6 validation exists
- **Evidence:** new validation WGSL asset is present
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RUNTIME_ASSET_MISSING`

## R4-17

- **Requirement:** versioned direct reference exists
- **Evidence:** new reference WGSL asset is present
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RUNTIME_ASSET_MISSING`

## R4-18

- **Requirement:** product/reference digest independence
- **Evidence:** all canonical shader digests are non-colliding
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PRODUCT_REFERENCE_IDENTITY_COLLISION`

## R4-19

- **Requirement:** destination-center mapping
- **Evidence:** all canonical shaders preserve +0.5 and -0.5 mapping
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_COORDINATE_CONVENTION_MISMATCH`

## R4-20

- **Requirement:** floor candidate base
- **Evidence:** all canonical shaders derive base from floor(p)
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CANDIDATE_BASE_CONSTRUCTION_MISSING`

## R4-21

- **Requirement:** base plus integer offset
- **Evidence:** all canonical shaders derive sampleCoord from base and loop offset
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PHASE_DISTANCE_CONSTRUCTION_MISSING`

## R4-22

- **Requirement:** sample minus p distance
- **Evidence:** all canonical shaders derive delta from sampleCoord minus p
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PHASE_DISTANCE_CONSTRUCTION_MISSING`

## R4-23

- **Requirement:** round-centered signature absent
- **Evidence:** canonical WGSL has zero round(p) constructions
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ROUND_CENTERED_CONSTRUCTION_PRESENT`

## R4-24

- **Requirement:** offset-only distance absent
- **Evidence:** canonical WGSL has zero offset-only ellipse distances
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PHASE_DISTANCE_CONSTRUCTION_MISSING`

## R4-25

- **Requirement:** logical border distance
- **Evidence:** delta uses unclamped logical coordinate
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_BORDER_DISTANCE_COLLAPSED`

## R4-26

- **Requirement:** clamped physical fetch
- **Evidence:** texture access clamps sampleCoord only at fetch
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_LOGICAL_FETCH_COORDINATE_MISMATCH`

## R4-27

- **Requirement:** phase-correct center fallback
- **Evidence:** defensive center load uses floor base, not round
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ROUND_CENTERED_CONSTRUCTION_PRESENT`

## R4-28

- **Requirement:** candidate completeness reach 4
- **Evidence:** bounded exhaustive proof passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CANDIDATE_COMPLETENESS_FAILED`

## R4-29

- **Requirement:** candidate completeness reach 6
- **Evidence:** bounded exhaustive proof passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CANDIDATE_COMPLETENESS_FAILED`

## R4-30

- **Requirement:** R3 phase set coverage
- **Evidence:** all inherited phase classes are consumed
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ORACLE_COORDINATE_MISMATCH`

## R4-31

- **Requirement:** R3 XY phase coverage
- **Evidence:** paired phase classes are consumed
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ORACLE_COORDINATE_MISMATCH`

## R4-32

- **Requirement:** R3 border coverage
- **Evidence:** border fixture classes are consumed
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ORACLE_COORDINATE_MISMATCH`

## R4-33

- **Requirement:** R3 alpha coverage
- **Evidence:** alpha fixture classes are consumed without runtime CPU ingress
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ORACLE_COORDINATE_MISMATCH`

## R4-34

- **Requirement:** R4 coordinate model oracle agreement
- **Evidence:** all applicable coordinate fixtures match R3 truth
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ORACLE_COORDINATE_MISMATCH`

## R4-35

- **Requirement:** negative control remains rejected
- **Evidence:** phase-sensitive mismatch coverage remains nonzero
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_NEGATIVE_CONTROL_NOT_REJECTED`

## R4-36

- **Requirement:** integer translation covariance
- **Evidence:** coordinate model invariant passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ORACLE_COORDINATE_MISMATCH`

## R4-37

- **Requirement:** axis swap covariance
- **Evidence:** coordinate model invariant passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ORACLE_COORDINATE_MISMATCH`

## R4-38

- **Requirement:** tangent sign invariance preserved
- **Evidence:** weight model invariant passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ORACLE_COORDINATE_MISMATCH`

## R4-39

- **Requirement:** radial weight identity preserved
- **Evidence:** weight equation and ellipse ID remain unchanged
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_COORDINATE_CONVENTION_MISMATCH`

## R4-40

- **Requirement:** parameter ABI identity preserved
- **Evidence:** ABI ID and byte size remain v3 and 80
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PIPELINE_BUNDLE_INCOMPLETE`

## R4-41

- **Requirement:** workgroup size preserved
- **Evidence:** 8x8x1 source and profile identity match
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-42

- **Requirement:** reach-4 halo equals reach
- **Evidence:** HALO and MAX_REACH both equal 4
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_HALO_REACH_MISMATCH`

## R4-43

- **Requirement:** reach-6 halo equals reach
- **Evidence:** HALO and MAX_REACH both equal 6
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_HALO_REACH_MISMATCH`

## R4-44

- **Requirement:** phase-aware first source position
- **Evidence:** tile origin source mapping includes -0.5
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_ORIGIN_CONTRACT_MISMATCH`

## R4-45

- **Requirement:** phase-aware last source position
- **Evidence:** last active lane mapping includes -0.5
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_ORIGIN_CONTRACT_MISMATCH`

## R4-46

- **Requirement:** partial group active-last clamp
- **Evidence:** lastDst is clamped to outputSize-1
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PARTIAL_GROUP_PROOF_FAILED`

## R4-47

- **Requirement:** base minimum floor
- **Evidence:** tile origin derives from floor of active p minimum
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_ORIGIN_CONTRACT_MISMATCH`

## R4-48

- **Requirement:** base maximum floor
- **Evidence:** host proof derives maximum active base
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-49

- **Requirement:** tile origin baseMin minus reach
- **Evidence:** shader and host formulas agree
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_ORIGIN_CONTRACT_MISMATCH`

## R4-50

- **Requirement:** required extent span plus two reach
- **Evidence:** host proof uses exact formula
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-51

- **Requirement:** axis-independent proof
- **Evidence:** X and Y are proven independently
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-52

- **Requirement:** all workgroups enumerated
- **Evidence:** host proof scans every dispatched group per axis
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-53

- **Requirement:** witness retained
- **Evidence:** max-span witness is present in receipt
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RECEIPT_INCOMPLETE`

## R4-54

- **Requirement:** reach-4 tile width proven
- **Evidence:** maximum required width <= 24
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_COVERAGE_UNPROVEN`

## R4-55

- **Requirement:** reach-4 tile height proven
- **Evidence:** maximum required height <= 24
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_COVERAGE_UNPROVEN`

## R4-56

- **Requirement:** reach-6 tile width proven
- **Evidence:** maximum required width <= 28
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_COVERAGE_UNPROVEN`

## R4-57

- **Requirement:** reach-6 tile height proven
- **Evidence:** maximum required height <= 28
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_COVERAGE_UNPROVEN`

## R4-58

- **Requirement:** odd dimension tile fixtures
- **Evidence:** odd and partial dimensions pass
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PARTIAL_GROUP_PROOF_FAILED`

## R4-59

- **Requirement:** one-pixel axis fixtures
- **Evidence:** output axis size one passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PARTIAL_GROUP_PROOF_FAILED`

## R4-60

- **Requirement:** noninteger scale tile fixtures
- **Evidence:** 1.125 through 1.75 classes pass
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-61

- **Requirement:** exact 2:1 tile fixture
- **Evidence:** scale 2.0 class passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-62

- **Requirement:** anisotropic XY scale fixtures
- **Evidence:** independent axis ratios pass
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-63

- **Requirement:** profile input validation
- **Evidence:** nonfinite and nonpositive inputs fail closed
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PROFILE_INPUT_INVALID`

## R4-64

- **Requirement:** footprint unsupported failure
- **Evidence:** reach above six rejects without fallback
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_FOOTPRINT_UNSUPPORTED`

## R4-65

- **Requirement:** workgroup storage limit failure
- **Evidence:** insufficient device limit rejects
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_WORKGROUP_STORAGE_LIMIT`

## R4-66

- **Requirement:** tile insufficiency failure
- **Evidence:** unproven tile rejects before dispatch
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_COVERAGE_UNPROVEN`

## R4-67

- **Requirement:** product direct-load fallback absent
- **Evidence:** product WGSL has no out-of-tile direct load
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_REFERENCE_AS_PRODUCT_WIRED`

## R4-68

- **Requirement:** validation out-of-tile counter
- **Evidence:** validation schema counts every miss
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_OUT_OF_TILE_ATTEMPT`

## R4-69

- **Requirement:** validation zero-weight counter
- **Evidence:** validation schema exposes fallback count
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ZERO_WEIGHT_FALLBACK`

## R4-70

- **Requirement:** validation nonfinite counter
- **Evidence:** validation schema exposes invalid math
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_NONFINITE_COORDINATE`

## R4-71

- **Requirement:** validation local range counters
- **Evidence:** minimum and maximum local indices are emitted
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RECEIPT_INCOMPLETE`

## R4-72

- **Requirement:** uniform barrier source proof
- **Evidence:** no bounds return precedes workgroupBarrier
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_TILE_PHASE_PROOF_FAILED`

## R4-73

- **Requirement:** canonical loader uses R4 shaders
- **Evidence:** public loader returns repaired assets
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CANONICAL_RUNTIME_STILL_R2`

## R4-74

- **Requirement:** canonical profile selection uses R4
- **Evidence:** dispatch path calls selectEwaR4Profile
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CANONICAL_RUNTIME_STILL_R2`

## R4-75

- **Requirement:** R2 profile not canonical
- **Evidence:** selectEwaR2Profile is absent from canonical branch
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CANONICAL_RUNTIME_STILL_R2`

## R4-76

- **Requirement:** bundle coordinate identity
- **Evidence:** bundle exposes coordinate and tile proof IDs
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PIPELINE_BUNDLE_INCOMPLETE`

## R4-77

- **Requirement:** pipeline cache coordinate identity
- **Evidence:** cache keys include coordinate convention
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PIPELINE_BUNDLE_INCOMPLETE`

## R4-78

- **Requirement:** runtime epoch preserved
- **Evidence:** stale runtime epoch rejects
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_STALE_PIPELINE_EPOCH`

## R4-79

- **Requirement:** device epoch preserved
- **Evidence:** stale device epoch rejects
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_STALE_PIPELINE_EPOCH`

## R4-80

- **Requirement:** device identity preserved
- **Evidence:** foreign device bundle rejects
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_STALE_PIPELINE_EPOCH`

## R4-81

- **Requirement:** device-loss invalidation
- **Evidence:** recovery participant disposes R4 bundle
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_STALE_PIPELINE_EPOCH`

## R4-82

- **Requirement:** active asset manifest admits R4
- **Evidence:** generated runtime asset manifest contains all new assets
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RUNTIME_ASSET_MISSING`

## R4-83

- **Requirement:** static admission admits R4
- **Evidence:** generated static admission contains all new assets
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RUNTIME_ASSET_MISSING`

## R4-84

- **Requirement:** active graph canonical identity
- **Evidence:** exactly one R4 coordinate model is canonical
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_ACTIVE_GRAPH_MISSING`

## R4-85

- **Requirement:** generated manifests current
- **Evidence:** generator replay is byte-identical
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_GENERATED_MANIFEST_STALE`

## R4-86

- **Requirement:** runtime CPU fallback absent
- **Evidence:** runtime import and branch scans return zero
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CPU_FALLBACK_WIRED`

## R4-87

- **Requirement:** Canvas fallback absent
- **Evidence:** no new Canvas resample branch is wired
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CPU_FALLBACK_WIRED`

## R4-88

- **Requirement:** WebGL fallback absent
- **Evidence:** no new WebGL resample branch is wired
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CPU_FALLBACK_WIRED`

## R4-89

- **Requirement:** reference-as-product absent
- **Evidence:** reference cannot become automatic product target
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_REFERENCE_AS_PRODUCT_WIRED`

## R4-90

- **Requirement:** R3 oracle bundle exclusion
- **Evidence:** oracle is absent from renderer and worker graphs
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_CPU_FALLBACK_WIRED`

## R4-91

- **Requirement:** mock runtime resource closure
- **Evidence:** all temporary resources destroy exactly once
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RECEIPT_INCOMPLETE`

## R4-92

- **Requirement:** mock runtime no pixel claim
- **Evidence:** mock receipt explicitly defers pixel parity
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R4-93

- **Requirement:** deterministic fixture generation
- **Evidence:** two clean runs produce identical fixtures
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RECEIPT_INCOMPLETE`

## R4-94

- **Requirement:** deterministic receipts
- **Evidence:** two clean runs produce identical source receipts
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RECEIPT_INCOMPLETE`

## R4-95

- **Requirement:** predecessor R1A regression
- **Evidence:** parent gate passes or approved archival mode passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PREDECESSOR_REGRESSION_FAILED`

## R4-96

- **Requirement:** predecessor R1B regression
- **Evidence:** parent gate passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PREDECESSOR_REGRESSION_FAILED`

## R4-97

- **Requirement:** predecessor R1C regression
- **Evidence:** parent gate passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PREDECESSOR_REGRESSION_FAILED`

## R4-98

- **Requirement:** predecessor R1D regression
- **Evidence:** parent gate passes
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PREDECESSOR_REGRESSION_FAILED`

## R4-99

- **Requirement:** predecessor R2 regression
- **Evidence:** frozen R2 source and proof gates pass
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PREDECESSOR_REGRESSION_FAILED`

## R4-100

- **Requirement:** predecessor R3 regression
- **Evidence:** oracle, rejection, and isolation gates pass
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PREDECESSOR_REGRESSION_FAILED`

## R4-101

- **Requirement:** Production Pointer unchanged
- **Evidence:** pointer digest and content are unchanged
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_PRODUCTION_POINTER_MUTATION`

## R4-102

- **Requirement:** source receipt complete
- **Evidence:** all mandatory identities and counts are present
- **Source-state rule:** PASS required
- **Failure code:** `E_R4_RECEIPT_INCOMPLETE`

## R4-103

- **Requirement:** physical GPU compile evidence
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R4_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R4-104

- **Requirement:** physical product/reference parity
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R4_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R4-105

- **Requirement:** physical validation counter readback
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R4_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R4-106

- **Requirement:** packaged Electron content identity
- **Evidence:** DEFERRED_TO_LATER_PROMOTION
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R4_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

---

# 34. Final Acceptance Contract

R4 is accepted in the source-verified state only when every mandatory gate is `PASS`, every unavailable physical or packaged gate is explicitly `DEFERRED` under its named later authority, and no gate is `FAIL`.

The final source gate summary shall distinguish:

```text
PASS
DEFERRED
FAIL
```

It shall never merge `DEFERRED` into `PASS`.

The final accepted source statement is:

> The canonical tiled EWA product and its independent direct-load reference now evaluate the ellipse on the continuous source pixel-center lattice using floor-anchored integer candidates and exact sample-coordinate distance. Shared-tile origin and host coverage proof use the same phase-aware base interval, all rejected R2 assets and R3 oracle evidence remain immutable, no runtime fallback was introduced, and physical GPU and packaged promotion claims remain deferred.

The next authority is:

```text
TDT-RESAMPLE-RUNTIME-01-R5

Axial Tensor Interpolation /
Subpixel Direction Continuity /
Double-Angle Field Sampling /
Coherence·Edge Phase Continuity Seal
```

---

# 35. Compact Implementation Checklist

```text
[ ] Verify R3 parent ZIP SHA-256.
[ ] Freeze all seven R2 predecessor files.
[ ] Freeze R3 oracle fixtures and receipts.
[ ] Add versioned reach-4 product WGSL.
[ ] Add versioned reach-6 product WGSL.
[ ] Add versioned validation WGSL files.
[ ] Add versioned direct-load reference WGSL.
[ ] Replace round anchor with floor base.
[ ] Compute sampleCoord from base plus offset.
[ ] Compute delta from sampleCoord minus p.
[ ] Preserve logical distance across border clamp.
[ ] Use floor base for defensive center fallback.
[ ] Repair tile first and last source positions with -0.5.
[ ] Clamp last destination lane for partial groups.
[ ] Add exact phase-aware per-axis tile proof.
[ ] Fail closed when tile coverage is unproven.
[ ] Add bounded validation counters.
[ ] Point canonical runtime to R4 assets and profile selector.
[ ] Preserve 80-byte parameter ABI and public facade.
[ ] Update generated runtime asset and active graph outputs.
[ ] Verify zero CPU, Canvas, WebGL, and reference fallback.
[ ] Run predecessor regressions.
[ ] Emit deterministic R4 receipts.
[ ] Leave GPU and packaged claims deferred.
[ ] Do not move the Production Pointer.
```
