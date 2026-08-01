# TDT-RESAMPLE-RUNTIME-01-R3

## Independent Fractional-Phase EWA Oracle / Continuous Source-Lattice Coordinate Truth / Shared Product-Reference Error Detection / Round-Centered Negative Control / Zero Runtime CPU Fallback Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R3`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R2`
- **Parent repository bundle:** `61_TDT_GPU_TILE_ATLAS_01_ANALYSIS_WINDOW_ATLAS_PERSISTENT_TILE_ATLAS_AUTHORITY_PAGE_TABLE_GENERATION_FENCE_AWARE_RESIDENCY_SOURCE_BAKED_AWAITING_PACKAGED_GPU(1).zip`
- **Parent repository bundle SHA-256:** `5f352059892cf3e061ebbcd1a4ee4b10634565351492d02d384a82f53c64199b`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R2_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target source state:** `RESAMPLE_RUNTIME_R3_ORACLE_BAKED_CURRENT_PRODUCT_REJECTED`
- **Target verified state:** `RESAMPLE_RUNTIME_R3_ORACLE_VERIFIED_R4_REQUIRED`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Canonical product shader mutation:** forbidden in R3
- **Canonical direct-reference shader mutation:** forbidden in R3
- **Primary product runtime:** WebGPU
- **R3 oracle runtime:** Node.js verification realm only
- **R3 oracle arithmetic:** deterministic IEEE-754 binary64 through JavaScript `Number`
- **R3 oracle role:** evidence generator only
- **R3 oracle product authority:** none
- **Runtime CPU resampling fallback:** forbidden
- **Runtime CPU user-image processing:** forbidden
- **WebGL resample fallback:** forbidden
- **Canvas resample fallback:** forbidden
- **Reference-as-product fallback:** forbidden
- **Automatic product repair:** forbidden
- **Physical GPU parity claim:** forbidden in source-bake state
- **Packaged Electron claim:** forbidden in source-bake state

---

# 0. Executive Contract

R3 shall establish an independent, deterministic, fractional-phase EWA oracle before the canonical WebGPU product kernel is repaired.

R3 shall not make the current R2 product pass by redefining the expected output around the current implementation. R3 shall instead freeze a continuous source-lattice coordinate contract and prove that the current R2 product shader and the current R1C direct-load reference shader share the same phase-erasing defect.

The authoritative coordinate rule introduced by R3 is:

```text
source pixel integer coordinate i denotes the center of source pixel i

destination pixel coordinate d denotes the center of destination pixel d

p = (d + 0.5) * srcPerDst - 0.5
base = floor(p)
sampleCoord = base + integerOffset
delta = sampleCoord - p
```

The EWA ellipse shall be evaluated from `delta`, not from the integer offset alone.

The source texel shall be selected from `sampleCoord`, not from `round(p) + integerOffset`.

R3 shall preserve the current product shaders byte-for-byte. It shall use their unchanged identity as evidence that the observed failure belongs to the predecessor implementation rather than to an R3 mutation.

R3 shall add a validation-only binary64 oracle and a validation-only round-centered negative control. The oracle and negative control shall execute only through explicit verification commands under `tools/resample-runtime-01-r3/`.

R3 shall prove all of the following:

1. the continuous source-lattice formula is explicit and single-valued,
2. the binary64 oracle obeys that formula,
3. the round-centered negative control mirrors the current R2 phase-erasing behavior,
4. fractional-phase fixtures distinguish the oracle from the negative control,
5. the unchanged product and direct-reference shaders both contain the same round-centered coordinate construction,
6. current product/reference equality is therefore insufficient evidence of mathematical correctness,
7. the oracle is not imported, bundled, called, or selectable by the renderer, worker, Preview, Export, or packaged application,
8. no runtime branch may process a user image on the CPU when WebGPU resampling fails,
9. R3 passes only when the current product is formally rejected for R4 repair,
10. R3 does not move the Production Pointer.

The intended state transition is:

```text
R2 product/reference parity infrastructure
    ↓
R3 independent coordinate oracle
    ↓
R3 proves shared product/reference phase defect
    ↓
current product formally rejected
    ↓
R4 continuous-lattice product and reference repair required
```

R3 is therefore a deliberate red-state truth patch. The patch succeeds by proving that the predecessor product is not yet admissible under the new coordinate truth.

---

# 1. Parent Truth and Current Defect

## 1.1 Current R2 product identity

R3 shall pin the following parent product assets as immutable evidence:

| Asset | Parent SHA-256 |
|---|---|
| `ewa_aniso_tile_r4_r2.wgsl` | `c2714270086eb1ad0a514e4850f01816b98890cfbd16755372001547b34aee24` |
| `ewa_aniso_tile_r6_r2.wgsl` | `0d7cb8a26cb063708bb4f04e665f0ef8e6d44cb4db58d802b341ad220bea58a7` |
| `ewa_aniso_tile_validation_r4_r2.wgsl` | `f9f7efedde8ca7c547359ac91b175aabb0868be2d87a50d2680d7373c6e210fd` |
| `ewa_aniso_tile_validation_r6_r2.wgsl` | `0c6bbbd8a3007f79bc7e1eb4dee0dec5ad2f4e7f20dfc1d095d7e16068eb7c8e` |
| `ewa_aniso_reference_v2_r1c.wgsl` | `bfd0e2d94e15467379b92c9c2ed4a3555be1d1b0a9a67b4f0f167eb550dbc4eb` |
| `ewa_tiled_profile_r2.mjs` | `07f1d65d5bc09b0f7231034ef85001ba4fdd6346cf93abe2cda441012ccd8b33` |
| `ewa_parity_runtime_r2.mjs` | `b787e6fffcf3c2c98d36cc6bb2fc34a2f67e460ae79b76bd3fa4144f4d768ba5` |

Any R3 source bake that changes one of these hashes shall fail with `E_R3_PARENT_SHADER_IDENTITY_MISMATCH`.

R3 shall not use a modified copy of the parent shader as evidence about the parent defect.

## 1.2 Current continuous source position

The current R2 shaders calculate the source-space center as:

```wgsl
let p =
    (vec2<f32>(gid.xy) + vec2<f32>(0.5)) * U.srcPerDst
    - vec2<f32>(0.5);
```

This expression is admitted by R3.

It maps destination pixel centers to the continuous source pixel-center lattice.

The defect occurs after `p` is calculated.

## 1.3 Current product candidate construction

The current R4 and R6 product shaders calculate the ellipse weight using:

```wgsl
let d = vec2<f32>(f32(x), f32(y));
```

and fetch the source texel using:

```wgsl
round(p) + vec2<i32>(x, y)
```

The current kernel is therefore centered on `round(p)` rather than on the continuous position `p`.

Within every interval where `round(p)` is unchanged, the source candidates and all ellipse weights are unchanged.

The fractional component of `p` has no effect on the EWA accumulation.

## 1.4 Current direct-reference candidate construction

The current direct-load reference shader uses the same pair:

```wgsl
let d = vec2<f32>(f32(x), f32(y));
load(vec2<i32>(round(p)) + vec2<i32>(x, y))
```

The reference avoids workgroup tiling, but it does not provide an independent coordinate model.

It is independent in memory access and pipeline implementation. It is not independent in source-lattice mathematics.

## 1.5 Shared-error parity

If product and reference both use the same round-centered candidate lattice, exact product/reference parity proves only that:

- the tiled product fetched the same values as the direct-load reference,
- the shared tile covered the requested integer coordinates,
- the product and reference produced the same stored half-float values.

It does not prove that either implementation evaluated the EWA ellipse at the correct continuous source position.

R3 shall formally distinguish:

```text
memory-access parity
```

from:

```text
mathematical coordinate correctness
```

R2 remains valuable evidence for the first claim. R3 adds independent evidence for the second claim.

## 1.6 Observable consequence

For two continuous positions such as:

```text
p0 = 12.0625
p1 = 12.4375
```

when both positions round to `12`, the current R2 kernel evaluates the same candidate locations and the same weights.

A phase-correct kernel evaluates:

```text
delta0 = sampleCoord - 12.0625
delta1 = sampleCoord - 12.4375
```

and therefore produces different weights on a non-constant source.

This difference is the primary R3 detection target.

---

# 2. Scope

## 2.1 In scope

R3 shall implement and seal:

1. an explicit continuous source-lattice coordinate convention,
2. a standalone binary64 EWA oracle,
3. deterministic source fixture generation,
4. deterministic direct-coordinate fixtures,
5. deterministic raster-mapped fixtures,
6. exact integer candidate enumeration,
7. phase-aware sample distance,
8. border fetch separation from weight distance,
9. stable binary64 accumulation,
10. finite-value checks,
11. oracle self-tests,
12. translation covariance checks,
13. axis-swap covariance checks,
14. tangent-sign invariance checks,
15. constant-field conservation checks,
16. phase-sensitive impulse checks,
17. phase-sensitive ramp checks,
18. phase-sensitive frequency checks,
19. phase-sensitive alpha checks,
20. a round-centered negative-control implementation,
21. source proof that product and reference share the negative-control construction,
22. deterministic expected-failure classification for the current product model,
23. a current-product rejection receipt,
24. strict separation of validation tools from runtime code,
25. zero renderer import of the oracle,
26. zero worker import of the oracle,
27. zero Preview import of the oracle,
28. zero Export import of the oracle,
29. zero Vite-emitted oracle asset,
30. zero packaged oracle asset,
31. zero CPU product fallback wiring,
32. stable R3 errors,
33. bounded R3 receipts,
34. predecessor regression gates,
35. source-baked and oracle-verified state rules.

## 2.2 Out of scope

R3 shall not:

- modify the R4 product shader,
- modify the R6 product shader,
- modify either validation shader,
- modify the direct-load reference shader,
- change the R2 tile geometry,
- change workgroup storage,
- change the R2 candidate reach,
- change the R1C tensor schema,
- change tensor sampling,
- introduce axial double-angle tensor interpolation,
- change kernel sharpness ABI,
- change the fixed `1.65` product literal,
- unify Preview and Export kernels,
- change stage planning,
- change Adaptive policy semantics,
- change color-domain semantics,
- change alpha-domain semantics,
- introduce Atlas-backed EWA sampling,
- claim physical GPU parity against the binary64 oracle,
- claim packaged Electron correctness,
- claim performance improvement,
- claim final EWA mathematical completion,
- move the Production Pointer.

Those repairs belong to R4 and later patches.

---

# 3. Non-Breakage Contract

## 3.1 Public product facades

The following product interfaces shall remain unchanged:

```javascript
createDeltaKStack(device, existingPipes?)
runDeltaKStack(request)
runDeltaKStack(device, pipes, frameInputs)
downscaleRGBAWithWGSL(rgba, srcW, srcH, dstW, dstH, opts?)
createAdaptiveEwaDownscalePass(...)
downscaleAuto(...)
```

R3 shall not add an `oracle`, `cpu`, `reference`, or `fallback` option to any public product request.

## 3.2 Pipeline bundle

`pipeEWA` shall remain byte-for-byte behaviorally equivalent to R2.

R3 shall not attach the binary64 oracle to `pipeEWA`.

R3 shall not attach a round-centered negative-control pipeline to `pipeEWA`.

## 3.3 Parameter ABI

The existing 80-byte R1C/R2 EWA parameter ABI shall remain unchanged in R3.

R3 shall not add `kernelSharpness`, `phaseConvention`, or any new coordinate field to the product ABI.

The oracle shall use its own validation-only input schema.

## 3.4 Final Surface

R3 shall not change:

```text
GPUTexture ownership
rgba16float intermediate surfaces
Preview Final Surface publication
Export Final Surface publication
readback boundaries
encoder inputs
```

## 3.5 Product behavior

The current R2 product remains available only as the unpromoted predecessor implementation.

R3 shall not silently disable it, replace it, or route users through a CPU implementation.

R3 shall mark it mathematically rejected for future promotion under the R3 coordinate contract.

---

# 4. Authority Hierarchy

R3 shall use the following authority order:

```text
1. R3 continuous source-lattice specification
2. R3 binary64 oracle implementation
3. R3 deterministic fixture manifest
4. future corrected GPU product
5. future corrected GPU direct-load reference
6. R2 tiled/direct parity evidence for memory-access correctness
7. current R2 product and reference behavior as rejected predecessor evidence
```

The current R2 product shall not define the expected output.

The current R2 direct-load reference shall not define the expected output.

The round-centered negative control shall not define the expected output.

No majority vote among product, reference, and negative control may override the R3 coordinate specification.

---

# 5. Identity Model

## 5.1 Coordinate convention identity

R3 shall define:

```text
coordinateConventionId = tdt.ewa.source-lattice.pixel-center-v2
```

The identity means:

- integer source coordinates are texel centers,
- integer destination coordinates are pixel centers,
- destination-to-source mapping includes `+0.5` and `-0.5`,
- candidate base is `floor(p)`,
- candidate distance is `sampleCoord - p`,
- border clamping affects the fetch coordinate only.

## 5.2 Oracle identity

R3 shall define:

```text
oracleId = tdt.ewa.oracle.f64.fractional-phase.v1
```

## 5.3 Negative-control identity

R3 shall define:

```text
negativeControlId = tdt.ewa.negative-control.round-centered-r2.v1
```

## 5.4 Fixture schema identity

R3 shall define:

```text
fixtureSchemaId = tdt.ewa.fractional-phase-fixtures.v1
```

## 5.5 Rejection receipt identity

R3 shall define:

```text
rejectionReceiptSchemaId = tdt.ewa.current-product-rejection.r3.v1
```

These identifiers shall appear in all corresponding receipts.

---

# 6. Continuous Source-Lattice Coordinate Contract

## 6.1 One-dimensional mapping

For destination coordinate `d`, source size `Nsrc`, and destination size `Ndst`:

```text
srcPerDst = Nsrc / Ndst
p = (d + 0.5) * srcPerDst - 0.5
```

`p` is a continuous coordinate in the source pixel-center lattice.

## 6.2 Two-dimensional mapping

For destination coordinate `(dx, dy)`:

```text
px = (dx + 0.5) * srcPerDstX - 0.5
py = (dy + 0.5) * srcPerDstY - 0.5
p = (px, py)
```

## 6.3 Candidate base

The candidate base shall be:

```text
base = floor(p)
```

applied component-wise.

`base` is not the EWA center. It is only the integer anchor for deterministic lattice enumeration.

## 6.4 Candidate coordinate

For integer candidate offset `o = (ox, oy)`:

```text
sampleCoord = base + o
```

## 6.5 EWA distance

The ellipse distance vector shall be:

```text
delta = sampleCoord - p
```

The following substitutions are forbidden in the oracle:

```text
delta = o
delta = sampleCoord - round(p)
delta = sampleCoord - floor(p)
delta = round(sampleCoord - p)
```

## 6.6 Fractional phase

The fractional phase shall be:

```text
phase = p - floor(p)
```

with each component in `[0, 1)`.

Phase shall affect ellipse weights whenever the source is non-constant and the candidate set contains more than one contributing sample.

## 6.7 Integer translation covariance

For integer translation `k`:

```text
oracle(source shifted by k, p + k) == oracle(source, p)
```

subject to equivalent border support.

This invariant shall be tested.

## 6.8 Axis covariance

Swapping source X/Y axes, ellipse tangent components, major/minor axes, and `p.x/p.y` shall swap the output geometry without changing channel values beyond the declared binary64 tolerance.

## 6.9 Tangent sign invariance

The ellipse shall be axial:

```text
EWA(tangent) == EWA(-tangent)
```

This invariant shall be exact within deterministic binary64 execution.

---

# 7. Ellipse and Weight Contract

## 7.1 Oracle input ellipse

R3 shall isolate source-lattice truth from the structure-tensor pipeline.

The oracle shall consume a validated ellipse input:

```javascript
{
  tangentX,
  tangentY,
  majorRadius,
  minorRadius,
  kernelSharpness,
  taperExponent,
  maxReach
}
```

R3 shall not import or execute the product tensor pipeline to derive these values.

## 7.2 Tangent normalization

The oracle shall normalize the tangent in binary64.

A zero-length or non-finite tangent shall fail with `E_R3_ORACLE_INPUT_INVALID`.

The normalized normal vector shall be:

```text
normal = (-tangentY, tangentX)
```

## 7.3 Ellipse equation

For `delta`:

```text
q = (dot(delta, tangent) / majorRadius)^2
  + (dot(delta, normal) / minorRadius)^2
```

A candidate contributes when:

```text
q <= 1
```

## 7.4 Weight equation

R3 shall mirror the current admitted radial shape while correcting only coordinate phase:

```text
radial = exp(-kernelSharpness * q)
taper = max(0, 1 - q)^taperExponent
weight = radial * taper
```

Mandatory R3 fixture defaults:

```text
kernelSharpness = 1.65
taperExponent = 1.0
```

These values are validation inputs, not product ABI claims.

## 7.5 Candidate reach

Candidates shall be enumerated over:

```text
ox ∈ [-maxReach, +maxReach]
oy ∈ [-maxReach, +maxReach]
```

in deterministic Y-major then X-major order.

## 7.6 Radius validity

The oracle shall require:

```text
majorRadius > 0
minorRadius > 0
maxReach >= ceil(max(majorRadius, minorRadius) - epsilonReach)
```

where:

```text
epsilonReach = 1e-12
```

An insufficient reach shall fail rather than clip silently.

## 7.7 Weight-sum contract

With the admitted fixture radii and reach, the weight sum shall be finite and greater than zero.

The oracle shall not silently return a center sample when the sum is zero.

A zero or non-finite sum shall fail with `E_R3_ORACLE_ZERO_WEIGHT_SUM`.

---

# 8. Border Contract

## 8.1 Logical coordinate versus fetch coordinate

R3 shall distinguish:

```text
logicalSampleCoord = base + offset
fetchCoord = clamp(logicalSampleCoord, 0, sourceSize - 1)
delta = logicalSampleCoord - p
```

The ellipse weight shall use `logicalSampleCoord`.

The source read shall use `fetchCoord`.

## 8.2 Forbidden border distortion

The oracle shall not calculate:

```text
delta = fetchCoord - p
```

because that collapses multiple logical samples onto the same distance at the border and changes clamp-extension semantics.

## 8.3 Border mode

R3 shall admit only:

```text
borderMode = clamp-extension
```

Other border modes are out of scope.

## 8.4 Border fixtures

Mandatory border fixtures shall include:

- top-left phase-sensitive impulse,
- top-right phase-sensitive impulse,
- bottom-left phase-sensitive impulse,
- bottom-right phase-sensitive impulse,
- one-pixel-wide source,
- one-pixel-high source,
- `2x2` source with anisotropic ellipse,
- alpha edge touching each border.

---

# 9. Binary64 Oracle Architecture

## 9.1 Isolation

The oracle shall live under:

```text
tools/resample-runtime-01-r3/
```

It shall not live under:

```text
app/
app/src/
app/legacy-runtime/
electron/
workers/
native/
```

## 9.2 Import restrictions

The oracle may import only:

- Node.js standard library modules,
- R3-local validation modules,
- R3 fixture JSON files.

The oracle shall not import any file from:

```text
app/**
app/src/**
app/legacy-runtime/**
tools/resample-runtime-01-r1*/**
tools/resample-runtime-01-r2/**
```

The source verifier shall enforce this rule.

## 9.3 No shared product helper

The oracle shall not import:

- `ewa_tiled_profile_r2.mjs`,
- `ewa_aniso_params.mjs`,
- `ewa_aniso_params_v3.mjs`,
- `ewa_stage_planner.mjs`,
- `structure_tensor_runtime.mjs`,
- any Preview or Export runtime helper.

Independent fixture values shall be declared in the R3 fixture manifest.

## 9.4 Arithmetic

The oracle shall use JavaScript `Number` without `Math.fround()`.

The oracle shall reject typed-array coercion to `Float32Array` during accumulation.

Source fixture values may be stored as JSON numbers or generated binary64 values.

## 9.5 Stable accumulation

R3 shall use compensated summation for:

- total weight,
- red weighted sum,
- green weighted sum,
- blue weighted sum,
- alpha weighted sum.

Neumaier or Kahan summation is admitted.

The selected algorithm and iteration order shall be fixed in the oracle identity receipt.

## 9.6 Finite checks

The oracle shall reject:

- non-finite source values,
- non-finite position values,
- non-finite ellipse values,
- non-finite `q`,
- non-finite weights,
- non-finite accumulated sums,
- non-finite output channels.

## 9.7 Output

The primary oracle output shall be binary64 RGBA:

```javascript
{
  rgba: [r, g, b, a],
  weightSum,
  candidateCount,
  contributingCount,
  phase: [phaseX, phaseY]
}
```

The oracle shall not quantize to half-float or RGBA8 in its primary path.

Optional quantization diagnostics may be generated separately and shall not replace the binary64 truth.

---

# 10. Independent Oracle Self-Tests

## 10.1 Constant conservation

For a constant RGBA source, every admitted position and ellipse shall return the exact constant within:

```text
absolute error <= 1e-14
```

## 10.2 Single-candidate sanity

For a support containing one contributing candidate, the result shall equal that source sample.

## 10.3 Translation covariance

Integer translation covariance shall pass for interior fixtures with:

```text
absolute error <= 1e-14
```

## 10.4 Axis-swap covariance

Axis-swapped fixtures shall pass with:

```text
absolute error <= 1e-13
```

## 10.5 Tangent-sign invariance

`tangent` and `-tangent` shall produce identical candidate membership and outputs within:

```text
absolute error <= 1e-14
```

## 10.6 Isotropic rotation invariance

When `majorRadius == minorRadius`, changing tangent orientation shall not change the output beyond:

```text
absolute error <= 1e-13
```

## 10.7 Weight positivity

Every contributing candidate shall have:

```text
weight >= 0
```

At least one candidate shall have:

```text
weight > 0
```

## 10.8 Weight monotonicity

For fixed ellipse direction and points on the same radial ray inside support, weight shall not increase as `q` increases.

## 10.9 Direct versus matrix formulation

R3 shall implement a second validation-only ellipse evaluation formulation:

```text
q = delta^T A delta
```

where `A` is constructed independently from tangent, normal, major radius, and minor radius.

The primary dot-product formulation and the matrix formulation shall agree within:

```text
absolute q error <= 1e-13
```

The second formulation shall be used only for oracle self-test. It shall not share the primary `q` helper.

---

# 11. Round-Centered Negative Control

## 11.1 Purpose

The negative control shall mirror the current R2 coordinate defect intentionally.

It exists to prove that the fixture matrix can detect phase erasure.

It shall never be used as a product fallback or expected-output authority.

## 11.2 Exact negative-control construction

The negative control shall calculate the same continuous `p` as the oracle, then replace the continuous center with:

```text
roundedCenter = wgslRound(p)
```

It shall enumerate:

```text
sampleCoord = roundedCenter + integerOffset
delta = integerOffset
```

This mirrors the current R2 product/reference pair.

## 11.3 WGSL round mirror

The validation helper shall define WGSL-compatible round behavior explicitly:

```javascript
function wgslRoundScalar(x) {
  return Math.sign(x) * Math.floor(Math.abs(x) + 0.5);
}
```

For `x == 0`, the helper shall return `0`.

The implementation shall not rely on JavaScript `Math.round()` for negative values.

## 11.4 No code sharing with oracle coordinates

The negative control may share fixture loading and compensated accumulation utilities.

It shall not share the candidate-coordinate function or distance function with the oracle.

The source gate shall confirm distinct implementations.

## 11.5 Required detection

The R3 gate shall fail if the negative control matches the oracle on every mandatory phase-sensitive fixture.

A valid R3 fixture set shall produce:

```text
negativeControlDetected = true
```

and at least the following:

- one X-phase mismatch,
- one Y-phase mismatch,
- one diagonal-phase mismatch,
- one anisotropic mismatch,
- one border mismatch,
- one alpha mismatch,
- one non-integer ratio mismatch,
- one exact 2:1 ratio mismatch.

## 11.6 Mutation sensitivity

R3 shall also test the following invalid coordinate mutations:

1. `sampleCoord = floor(p) + offset`, `delta = offset`,
2. `sampleCoord = round(p) + offset`, `delta = sampleCoord - p`,
3. `sampleCoord = floor(p) + offset`, `delta = offset - phase` implemented through a shared rounded anchor,
4. `sampleCoord = clamp(base + offset)`, `delta = clampedCoord - p`.

At least one mandatory fixture shall reject each mutation.

These mutation controls are validation-only and shall not become stable product identities.

---

# 12. Fixture Model

## 12.1 Fixture classes

R3 shall include two fixture classes:

```text
A. direct-coordinate fixtures
B. raster-mapped fixtures
```

Direct-coordinate fixtures call the oracle with explicit continuous `p` and isolate phase mathematics from dimension mapping.

Raster-mapped fixtures derive `p` from source/destination dimensions and destination indices and validate the public mapping formula.

## 12.2 Phase set

The mandatory one-dimensional phase set shall include:

```text
0
1/16
1/8
3/16
1/4
5/16
3/8
7/16
1/2
9/16
5/8
11/16
3/4
13/16
7/8
15/16
```

`phase == 0` is an invariant fixture, not a negative-control detection fixture.

## 12.3 Two-dimensional phase pairs

Mandatory phase pairs shall include:

```text
(1/16, 0)
(1/4, 0)
(7/16, 0)
(0, 1/16)
(0, 1/4)
(0, 7/16)
(1/16, 1/16)
(1/4, 1/4)
(7/16, 7/16)
(1/8, 3/8)
(3/8, 1/8)
(1/4, 3/4)
(3/4, 1/4)
```

## 12.4 Raster ratios

Mandatory raster-mapped ratios shall include:

| Source | Destination | Ratio |
|---:|---:|---:|
| 9 | 8 | 1.125 |
| 3 | 2 | 1.5 |
| 13 | 8 | 1.625 |
| 7 | 4 | 1.75 |
| 2 | 1 | 2.0 |
| 17 | 8 | 2.125 |
| 31 | 16 | 1.9375 |

Both X-only and Y-only ratio cases shall exist.

At least four two-dimensional cases shall use different X and Y ratios.

## 12.5 Source patterns

Mandatory source patterns shall include:

1. constant RGBA,
2. horizontal binary step,
3. vertical binary step,
4. diagonal binary step,
5. single impulse,
6. two adjacent unequal impulses,
7. linear X ramp,
8. linear Y ramp,
9. RGBA channel-separated ramp,
10. one-pixel checkerboard,
11. two-pixel checkerboard,
12. horizontal sinusoid,
13. vertical sinusoid,
14. diagonal stripe,
15. premultiplied alpha edge,
16. transparent RGB payload diagnostic,
17. border impulse,
18. asymmetric four-corner pattern.

## 12.6 Ellipse set

Mandatory ellipse cases shall include:

| Case | Tangent | Major | Minor | Reach |
|---|---|---:|---:|---:|
| isotropic-1 | `(1, 0)` | 1.0 | 1.0 | 2 |
| horizontal-3x1 | `(1, 0)` | 3.0 | 1.0 | 4 |
| vertical-3x1 | `(0, 1)` | 3.0 | 1.0 | 4 |
| diagonal-3x1 | normalized `(1, 1)` | 3.0 | 1.0 | 4 |
| oblique-4x1.25 | normalized `(2, 1)` | 4.0 | 1.25 | 5 |
| compact-r4-edge | normalized `(3, 2)` | 4.0 | 0.82 | 4 |
| full-r6-edge | normalized `(5, 2)` | 6.0 | 0.82 | 6 |

R3 fixture evaluation may use reach values up to 6.

## 12.7 Alpha fixtures

Premultiplied-alpha fixtures shall satisfy:

```text
0 <= RGB <= alpha <= 1
```

The oracle shall preserve that relation within:

```text
absolute tolerance <= 1e-12
```

for non-negative weights.

Transparent RGB payload diagnostics may violate premultiplication deliberately, but shall be marked:

```text
semanticClass = hidden-rgb-diagnostic-only
```

They shall not be cited as premultiplied color correctness evidence.

---

# 13. Fixture Generation and Immutability

## 13.1 Generator

R3 shall add:

```text
tools/resample-runtime-01-r3/generate-phase-fixtures.mjs
```

The generator shall be deterministic and shall not use random numbers.

## 13.2 No wall-clock identity

Fixture content and fixture IDs shall not depend on:

- current time,
- process ID,
- temporary path,
- machine hostname,
- adapter identity,
- locale,
- environment-specific path separators.

Timestamps may appear only as non-identity diagnostic metadata outside canonical digests.

## 13.3 Canonical JSON

The fixture manifest shall use stable key order and LF line endings.

The generator shall emit identical bytes on repeated runs from identical source.

## 13.4 Fixture digest

Each fixture shall include a SHA-256 digest over:

```text
fixture schema ID
source dimensions
source pixel values
position or raster mapping
ellipse parameters
border mode
expected semantic class
```

Expected output values shall not be included in the input digest.

## 13.5 Checked-in fixtures

The canonical fixture manifest shall be checked in.

The gate shall regenerate it in a temporary location and require byte identity.

---

# 14. Shared Product-Reference Error Detection

## 14.1 Static source proof

R3 shall scan the pinned parent product and reference shaders and require all of the following:

```text
continuous p calculation exists
candidate distance uses integer offset alone
sample coordinate uses round(p) plus integer offset
```

The scanner shall operate on normalized WGSL tokens or a robust whitespace-insensitive representation.

A fragile single-line literal match shall not be the sole proof.

## 14.2 Product/reference common-signature receipt

R3 shall generate a common-signature receipt containing:

```json
{
  "productR4UsesRoundCenteredCandidates": true,
  "productR6UsesRoundCenteredCandidates": true,
  "validationR4UsesRoundCenteredCandidates": true,
  "validationR6UsesRoundCenteredCandidates": true,
  "directReferenceUsesRoundCenteredCandidates": true,
  "sharedDistanceForm": "integer-offset-only",
  "sharedFetchAnchor": "round(p)",
  "independentCoordinateReferencePresent": false
}
```

## 14.3 Rejected predecessor model

R3 shall implement a validation-only R2 shared-error model whose coordinate construction matches the scanned source.

For every mandatory detection fixture:

```text
R2 shared-error model == round-centered negative control
```

within:

```text
absolute error <= 1e-14
```

This proves that the negative control models the shared coordinate behavior.

## 14.4 Current product rejection

R3 shall issue:

```text
currentProductMathematicalStatus = REJECTED_SHARED_FRACTIONAL_PHASE_ERROR
```

when:

1. parent shader identities match,
2. source scanning finds the shared round-centered signature,
3. the shared-error model matches the negative control,
4. the negative control differs from the independent oracle on mandatory phase-sensitive fixtures.

## 14.5 No fabricated GPU output

R3 shall not claim that a physical GPU executed the parent shader unless a physical WebGPU harness actually does so.

Source-bake rejection may be based on pinned source construction and deterministic model evidence.

Physical GPU confirmation shall remain `DEFERRED` unless executed.

---

# 15. Comparison Contract

## 15.1 Oracle self-comparison

Repeated oracle evaluation of the same fixture in the same process shall be bit-identical as binary64 outputs.

Repeated execution in separate Node processes shall produce identical canonical receipt bytes, excluding explicitly non-canonical diagnostics.

## 15.2 Negative-control mismatch threshold

A fixture shall count as a detected mismatch when any RGBA channel satisfies:

```text
absoluteError > max(1e-9, 1e-9 * abs(oracleValue))
```

Fixture-specific stronger minimum separations may be declared.

## 15.3 Mandatory mismatch coverage

The mandatory fixture matrix shall contain at least:

```text
16 phase-sensitive mismatches
```

and at least one mismatch from every required semantic class listed in Section 11.5.

## 15.4 Invariant fixtures

Constant-source and integer-phase fixtures may legitimately match the negative control.

They shall be classified as invariants and shall not be counted as detection failures.

## 15.5 First mismatch diagnostics

Receipts shall record:

- fixture ID,
- source pattern ID,
- phase,
- position,
- ellipse ID,
- oracle RGBA,
- negative-control RGBA,
- per-channel absolute error,
- maximum channel error,
- contributing candidate counts,
- weight sums.

Full user images shall never appear in R3 receipts.

---

# 16. Zero Runtime CPU Fallback Seal

## 16.1 Validation-only CPU computation

R3 permits CPU EWA computation only for deterministic, checked-in, bounded verification fixtures executed by explicit development commands.

R3 shall not process arbitrary user-selected images on the CPU.

## 16.2 Forbidden runtime imports

No file under the following roots may import an R3 oracle module:

```text
app/**
app/src/**
app/legacy-runtime/**
electron.mjs
preload.cjs
app/electron/**
workers/**
native/**
```

## 16.3 Forbidden runtime APIs

R3 shall not expose:

```text
runEwaOracleForProduct
cpuEwaFallback
fallbackToOracle
oracleResample
referenceResampleOnCpu
```

or semantically equivalent public runtime functions.

## 16.4 Failure policy

When WebGPU resampling is unavailable or fails, the product path shall continue to fail closed under existing stable errors.

It shall not call the R3 oracle.

It shall not call Canvas `drawImage()` for image resampling.

It shall not call WebGL for image resampling.

It shall not call the direct GPU reference as an automatic product fallback.

## 16.5 No user-image ingress

The oracle API shall accept only fixture objects carrying:

```text
fixtureSchemaId = tdt.ewa.fractional-phase-fixtures.v1
fixtureDigest
bounded dimensions
```

The canonical oracle runner shall reject dimensions above:

```text
64 x 64
```

This is a validation safety bound, not a product limit.

The oracle runner shall reject missing fixture digests.

## 16.6 No browser compatibility shim

The oracle shall use Node-only imports intentionally so an accidental browser import fails at build time.

R3 shall not add polyfills that make the oracle browser-compatible.

## 16.7 Vite and package exclusion

The Build Emit manifest and packaged content verifier shall confirm that no file matching:

```text
resample-runtime-01-r3
fractional-phase-oracle
ewa-f64-oracle
round-centered-negative-control
```

is emitted into the renderer bundle or packaged application.

## 16.8 Active Graph

R3 verification files are not Runtime Asset Authority assets.

They shall not receive runtime asset IDs.

They shall not appear as admitted production graph nodes.

---

# 17. Product and Reference Immutability

## 17.1 Product shader freeze

R3 shall fail if any pinned R2 product or validation shader digest changes.

## 17.2 Direct-reference freeze

R3 shall fail if the R1C direct-reference digest changes.

## 17.3 Runtime module freeze

R3 shall fail if `ewa_tiled_profile_r2.mjs` or `ewa_parity_runtime_r2.mjs` changes.

## 17.4 Allowed read-only inspection

R3 tools may read pinned source files to generate source-analysis receipts.

They shall not rewrite, normalize in place, or patch those files.

## 17.5 Future R4 handoff

The R3 rejection receipt shall identify the exact files R4 must replace or version:

```text
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r2.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r2.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r2.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r2.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v2_r1c.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r2.mjs
```

R3 shall not perform that replacement.

---

# 18. Stable Errors

R3 shall declare and reference at least the following stable errors:

| Code | Meaning |
|---|---|
| `E_R3_PARENT_SHADER_IDENTITY_MISMATCH` | A pinned R2/R1C parent source changed during R3 |
| `E_R3_COORDINATE_CONVENTION_MISMATCH` | An implementation or receipt uses a different source-lattice convention |
| `E_R3_ORACLE_INPUT_INVALID` | Oracle input is missing, out of range, or semantically invalid |
| `E_R3_ORACLE_NONFINITE` | Oracle encountered a non-finite value |
| `E_R3_ORACLE_ZERO_WEIGHT_SUM` | Oracle support produced no valid positive weight |
| `E_R3_ORACLE_SELF_TEST_FAILED` | An oracle invariant failed |
| `E_R3_ORACLE_MATRIX_CROSSCHECK_FAILED` | Dot-product and matrix ellipse formulations disagree |
| `E_R3_FIXTURE_SCHEMA_INVALID` | Fixture schema or digest is invalid |
| `E_R3_FIXTURE_COVERAGE_INCOMPLETE` | Required phase, source, ellipse, border, or alpha coverage is absent |
| `E_R3_FIXTURE_REGEN_MISMATCH` | Regenerated fixtures are not byte-identical |
| `E_R3_NEGATIVE_CONTROL_NOT_DETECTED` | Mandatory fixtures fail to distinguish round-centered behavior |
| `E_R3_NEGATIVE_CONTROL_IDENTITY_MISMATCH` | Negative-control implementation no longer mirrors the declared defect |
| `E_R3_SHARED_ERROR_SOURCE_NOT_FOUND` | Parent product/reference source no longer shows the expected shared signature |
| `E_R3_SHARED_ERROR_MODEL_MISMATCH` | Source-derived shared-error model does not match the negative control |
| `E_R3_CURRENT_PRODUCT_NOT_REJECTED` | R3 could not prove the predecessor product mathematically inadmissible |
| `E_R3_RUNTIME_IMPORT_FORBIDDEN` | Runtime code imports an R3 validation module |
| `E_R3_CPU_FALLBACK_WIRING_DETECTED` | A product path can invoke CPU EWA processing |
| `E_R3_ORACLE_EMITTED_IN_RENDERER` | Oracle code appears in renderer output |
| `E_R3_ORACLE_PACKAGED` | Oracle code appears in packaged application content |
| `E_R3_ORACLE_USER_IMAGE_INGRESS_FORBIDDEN` | Oracle runner accepts unbounded or unsealed user-image input |
| `E_R3_PRODUCTION_POINTER_MUTATION_FORBIDDEN` | R3 attempts to mutate the Production Pointer |
| `E_R3_PHYSICAL_GPU_CLAIM_UNSUPPORTED` | Physical GPU evidence is claimed without a physical run |
| `E_R3_PACKAGED_CLAIM_UNSUPPORTED` | Packaged behavior is claimed without packaged execution |
| `E_R3_SOURCE_BAKE_INCOMPLETE` | Required source-bake artifacts are absent or inconsistent |

All codes shall be present in the stable-error registry and referenced by source or specification evidence.

---

# 19. Receipt Model

## 19.1 Oracle identity receipt

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_IDENTITY.json
```

with at least:

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-RESAMPLE-RUNTIME-01-R3",
  "oracleId": "tdt.ewa.oracle.f64.fractional-phase.v1",
  "coordinateConventionId": "tdt.ewa.source-lattice.pixel-center-v2",
  "arithmetic": "ieee754-binary64-js-number",
  "accumulation": "neumaier-or-kahan-fixed-order",
  "candidateOrder": "y-major-x-minor",
  "borderMode": "clamp-extension-logical-distance",
  "productAuthority": false,
  "runtimeFallbackAuthority": false
}
```

## 19.2 Fixture manifest

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_FIXTURE_MANIFEST.json
```

with fixture IDs, input digests, semantic classes, and coverage indexes.

## 19.3 Oracle self-test receipt

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_SELF_TEST_RECEIPT.json
```

with per-invariant pass counts and maximum errors.

## 19.4 Negative-control receipt

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_NEGATIVE_CONTROL_RECEIPT.json
```

with mismatch coverage, first mismatches, and mutation-control results.

## 19.5 Shared-error source receipt

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_SHARED_ERROR_SOURCE_RECEIPT.json
```

with pinned digests and normalized source signatures.

## 19.6 Current-product rejection receipt

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_CURRENT_PRODUCT_REJECTION_RECEIPT.json
```

with at least:

```json
{
  "schemaVersion": 1,
  "schemaId": "tdt.ewa.current-product-rejection.r3.v1",
  "patchId": "TDT-RESAMPLE-RUNTIME-01-R3",
  "parentPatchId": "TDT-RESAMPLE-RUNTIME-01-R2",
  "coordinateConventionId": "tdt.ewa.source-lattice.pixel-center-v2",
  "productR4Status": "REJECTED_SHARED_FRACTIONAL_PHASE_ERROR",
  "productR6Status": "REJECTED_SHARED_FRACTIONAL_PHASE_ERROR",
  "directReferenceStatus": "REJECTED_SHARED_FRACTIONAL_PHASE_ERROR",
  "productReferenceParitySufficiency": false,
  "negativeControlDetected": true,
  "requiredRepairPatch": "TDT-RESAMPLE-RUNTIME-01-R4",
  "productionPointerMutated": false
}
```

## 19.7 Zero-runtime-CPU-fallback receipt

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_ZERO_RUNTIME_CPU_FALLBACK_RECEIPT.json
```

with:

- runtime import scan count,
- forbidden import count,
- renderer emit match count,
- packaged content match count when packaged input exists,
- CPU fallback wiring match count,
- user-image ingress status.

## 19.8 Source gate

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_SOURCE_GATE.json
```

## 19.9 Source receipt

R3 shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R3_SOURCE_RECEIPT.json
```

with all sealed source and generated artifact digests.

---

# 20. Telemetry

R3 telemetry is validation telemetry only.

It shall not enter product frame telemetry.

The bounded R3 summary shall include:

```text
oracleFixtureCount
oracleSelfTestPassCount
oracleSelfTestFailCount
negativeControlComparedCount
negativeControlMismatchCount
mutationControlDetectedCount
sharedErrorSourceAssetCount
runtimeForbiddenImportCount
rendererEmitOracleMatchCount
packagedOracleMatchCount
currentProductRejected
```

No telemetry field shall contain arbitrary source pixel arrays.

No ledger shall grow without a fixed cap.

---

# 21. Resource and Process Lifecycle

## 21.1 No GPU resources

R3 source-bake verification does not require a GPU device.

The oracle shall not request an adapter or device.

## 21.2 Process isolation

The deterministic run command shall execute the oracle and negative control in a fresh Node process.

A second fresh process shall regenerate receipts for determinism comparison.

## 21.3 Temporary files

Temporary files shall be created under a bounded temporary directory and deleted on success and failure.

## 21.4 No daemon

R3 shall not start a persistent worker, server, browser, or background process.

## 21.5 Memory bound

The oracle runner shall enforce the `64x64` fixture bound and a bounded fixture count.

Peak fixture memory shall be reported as a diagnostic but shall not be described as production memory evidence.

---

# 22. Source Layout

R3 shall add at least:

```text
tools/resample-runtime-01-r3/
├─ lib.mjs
├─ ewa-f64-oracle.mjs
├─ ewa-f64-oracle-matrix-check.mjs
├─ round-centered-negative-control.mjs
├─ r2-shared-error-model.mjs
├─ generate-phase-fixtures.mjs
├─ verify-oracle-self-tests.mjs
├─ verify-fractional-phase.mjs
├─ verify-shared-error-source.mjs
├─ verify-zero-runtime-cpu-fallback.mjs
├─ verify-source-contract.mjs
├─ runtime-smoke.mjs
├─ gate.mjs
├─ finalize.mjs
└─ run.mjs

fixtures/resample-runtime-01-r3/
├─ TDT_RESAMPLE_RUNTIME_01_R3_FIXTURE_MANIFEST.json
└─ sources/
   └─ deterministic source fixture payloads as needed

specs/
└─ TDT-RESAMPLE-RUNTIME-01-R3_INDEPENDENT_FRACTIONAL_PHASE_EWA_ORACLE_CONTINUOUS_SOURCE_LATTICE_COORDINATE_TRUTH_SHARED_PRODUCT_REFERENCE_ERROR_DETECTION_ROUND_CENTERED_NEGATIVE_CONTROL_ZERO_RUNTIME_CPU_FALLBACK_SEAL_SPEC.md

patches/
├─ TDT_RESAMPLE_RUNTIME_01_R3_CHANGED_FILE_MANIFEST.json
└─ TDT_RESAMPLE_RUNTIME_01_R3_independent_fractional_phase_ewa_oracle.diff

artifacts/resample-runtime-01-r3/source-bake/
├─ TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_IDENTITY.json
├─ TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_SELF_TEST_RECEIPT.json
├─ TDT_RESAMPLE_RUNTIME_01_R3_NEGATIVE_CONTROL_RECEIPT.json
├─ TDT_RESAMPLE_RUNTIME_01_R3_SHARED_ERROR_SOURCE_RECEIPT.json
├─ TDT_RESAMPLE_RUNTIME_01_R3_CURRENT_PRODUCT_REJECTION_RECEIPT.json
├─ TDT_RESAMPLE_RUNTIME_01_R3_ZERO_RUNTIME_CPU_FALLBACK_RECEIPT.json
├─ TDT_RESAMPLE_RUNTIME_01_R3_SOURCE_GATE.json
└─ TDT_RESAMPLE_RUNTIME_01_R3_SOURCE_RECEIPT.json
```

R3 shall not add a new product WGSL asset.

R3 shall not add a Runtime Asset Authority entry.

---

# 23. Package Scripts

R3 shall add:

```json
{
  "generate:resample-runtime-01-r3": "node tools/resample-runtime-01-r3/generate-phase-fixtures.mjs",
  "verify:resample-runtime-01-r3:oracle": "node tools/resample-runtime-01-r3/verify-oracle-self-tests.mjs && node tools/resample-runtime-01-r3/verify-fractional-phase.mjs",
  "verify:resample-runtime-01-r3:source": "node tools/resample-runtime-01-r3/verify-source-contract.mjs && node tools/resample-runtime-01-r3/verify-shared-error-source.mjs && node tools/resample-runtime-01-r3/verify-zero-runtime-cpu-fallback.mjs",
  "smoke:resample-runtime-01-r3": "node tools/resample-runtime-01-r3/runtime-smoke.mjs",
  "gate:resample-runtime-01-r3": "node tools/resample-runtime-01-r3/gate.mjs",
  "verify:resample-runtime-01-r3": "node tools/resample-runtime-01-r3/run.mjs",
  "finalize:resample-runtime-01-r3": "node tools/resample-runtime-01-r3/finalize.mjs"
}
```

The full verify command shall run predecessor R2, R1D, R1C, R1B, and R1A gates or consume their exact sealed receipts with identity validation.

---

# 24. Implementation Sequence

## 24.1 R3-A parent freeze

- record parent bundle SHA-256,
- record parent shader and runtime module digests,
- add immutable-parent verifier,
- fail on any predecessor mutation.

## 24.2 R3-B coordinate contract

- define coordinate convention ID,
- define mapping, base, sample coordinate, and distance functions,
- define logical border distance,
- add direct unit tests.

## 24.3 R3-C binary64 oracle

- implement validated input schema,
- implement independent candidate enumeration,
- implement compensated accumulation,
- implement finite checks,
- implement matrix-form crosscheck.

## 24.4 R3-D deterministic fixtures

- implement source pattern generators,
- implement direct-coordinate fixtures,
- implement raster-mapped fixtures,
- emit canonical fixture manifest,
- verify byte-stable regeneration.

## 24.5 R3-E negative control

- implement WGSL-compatible round mirror,
- implement round-centered candidate construction independently,
- add mutation controls,
- verify mandatory mismatch coverage.

## 24.6 R3-F shared-source proof

- scan pinned WGSL sources,
- classify distance and fetch-anchor forms,
- build current shared-error signature,
- verify shared-error model equals negative control.

## 24.7 R3-G runtime isolation

- scan runtime imports,
- scan public exports,
- scan Vite entry closure,
- scan emitted renderer content when available,
- scan package content when available,
- verify user-image ingress bound.

## 24.8 R3-H rejection and seal

- emit current-product rejection receipt,
- emit source gate,
- run predecessor regression gates,
- finalize source receipt,
- leave Production Pointer unchanged.

---

# 25. Source Verification Strategy

The source verifier shall prove:

1. parent identities are exact,
2. product shaders are unchanged,
3. reference shader is unchanged,
4. R3 modules are confined to validation roots,
5. oracle modules do not import product math,
6. negative control and oracle coordinate functions are distinct,
7. all required identities are declared,
8. fixture generation is deterministic,
9. stable errors are declared and referenced,
10. package scripts exist,
11. no new Runtime Asset Authority asset exists,
12. no Production Pointer mutation exists,
13. no CPU fallback symbol or branch is added,
14. no renderer import reaches R3 tools,
15. source and generated receipts agree.

Source verification shall fail closed.

---

# 26. Mock Runtime Strategy

R3 mock runtime shall execute only bounded fixture validation.

It shall verify:

- oracle deterministic repeatability,
- matrix-form crosscheck,
- negative-control detection,
- current shared-error model classification,
- receipt schema integrity,
- bounded memory and dimensions,
- stable error behavior on invalid inputs,
- no runtime import closure.

It shall not claim:

- physical WGSL compilation,
- GPU stored-half parity,
- GPU timestamp performance,
- packaged Electron behavior.

---

# 27. Optional Physical GPU Confirmation

R3 may define a deferred optional harness that later executes the unchanged R2 product and reference on a physical GPU and compares their output to quantized oracle expectations.

Such evidence shall be classified:

```text
DEFERRED in source bake
```

unless actually run.

The optional harness shall not be required to establish the source-level shared-error rejection because the source construction is pinned and explicitly modeled.

Any physical GPU receipt shall record:

- adapter identity,
- device epoch,
- browser or Electron version,
- shader digests,
- fixture manifest digest,
- product/reference exact parity,
- product/oracle mismatch,
- negative-control/oracle mismatch.

R3 source bake shall not fabricate these fields.

---

# 28. Promotion State Rules

## 28.1 Source-baked state

R3 may enter:

```text
RESAMPLE_RUNTIME_R3_ORACLE_BAKED_CURRENT_PRODUCT_REJECTED
```

only when:

- oracle self-tests pass,
- fixture regeneration is byte-identical,
- negative control is detected,
- shared product/reference source signature is proven,
- current product rejection receipt is issued,
- runtime CPU fallback scan is clean,
- parent identities are unchanged,
- predecessor source gates remain passing,
- Production Pointer is unchanged.

## 28.2 Oracle-verified state

R3 may enter:

```text
RESAMPLE_RUNTIME_R3_ORACLE_VERIFIED_R4_REQUIRED
```

when two fresh-process runs produce identical canonical receipts and all source-bake gates pass.

This state explicitly means the current product requires R4 repair.

## 28.3 Forbidden passing state

R3 shall not use a state name implying:

```text
R3_PRODUCT_VERIFIED
R3_EWA_CORRECT
R3_PRODUCTION_READY
R3_PACKAGED_VERIFIED
```

## 28.4 No automatic promotion

R3 shall not move the Production Pointer.

R3 shall not authorize R2 for promotion under the R3 coordinate contract.

R3 shall not authorize the oracle as a production replacement.

---

# 29. Non-Claims

R3 shall not claim:

- that the current R2 product is mathematically correct,
- that the current direct reference is mathematically independent,
- that R2 product/reference parity is useless,
- that R2 tile geometry is wrong in every case,
- that R3 repairs the product,
- that R3 changes visual output,
- that R3 improves performance,
- that R3 validates physical GPU execution,
- that R3 validates packaged Electron,
- that R3 completes tensor interpolation,
- that R3 unifies Preview and Export,
- that binary64 CPU output is a production rendering path,
- that JavaScript binary64 is arbitrary-precision mathematics,
- that the oracle replaces future same-device GPU parity,
- that Atlas residency is integrated with EWA.

R3 claims only an independent coordinate truth, deterministic detection sensitivity, shared-error proof, and runtime isolation.

---

# 30. Required Bake Artifacts

A complete R3 source bake shall include:

1. this specification,
2. R3 tool sources,
3. deterministic fixture manifest,
4. changed-file manifest,
5. patch diff,
6. oracle identity receipt,
7. oracle self-test receipt,
8. negative-control receipt,
9. shared-error source receipt,
10. current-product rejection receipt,
11. zero-runtime-CPU-fallback receipt,
12. source gate,
13. source receipt,
14. applied README,
15. stable-error registry update,
16. package-script update.

The applied README shall state clearly:

```text
R3 did not repair or promote the current product.
R3 established the independent oracle and rejected the current shared round-centered product/reference coordinate model.
R4 is required for product repair.
```

---

# 31. Gate Matrix

## R3-01

**Requirement:** Parent repository bundle SHA-256 equals `5f352059892cf3e061ebbcd1a4ee4b10634565351492d02d384a82f53c64199b`.

**Evidence:** source manifest and source receipt.

**Failure policy:** fail closed.

## R3-02

**Requirement:** R4 product shader digest remains `c2714270086eb1ad0a514e4850f01816b98890cfbd16755372001547b34aee24`.

**Evidence:** immutable-parent verifier.

**Failure policy:** fail closed.

## R3-03

**Requirement:** R6 product shader digest remains `0d7cb8a26cb063708bb4f04e665f0ef8e6d44cb4db58d802b341ad220bea58a7`.

**Evidence:** immutable-parent verifier.

**Failure policy:** fail closed.

## R3-04

**Requirement:** R4 validation shader digest remains `f9f7efedde8ca7c547359ac91b175aabb0868be2d87a50d2680d7373c6e210fd`.

**Evidence:** immutable-parent verifier.

**Failure policy:** fail closed.

## R3-05

**Requirement:** R6 validation shader digest remains `0c6bbbd8a3007f79bc7e1eb4dee0dec5ad2f4e7f20dfc1d095d7e16068eb7c8e`.

**Evidence:** immutable-parent verifier.

**Failure policy:** fail closed.

## R3-06

**Requirement:** Direct-reference shader digest remains `bfd0e2d94e15467379b92c9c2ed4a3555be1d1b0a9a67b4f0f167eb550dbc4eb`.

**Evidence:** immutable-parent verifier.

**Failure policy:** fail closed.

## R3-07

**Requirement:** R2 profile selector digest remains `07f1d65d5bc09b0f7231034ef85001ba4fdd6346cf93abe2cda441012ccd8b33`.

**Evidence:** immutable-parent verifier.

**Failure policy:** fail closed.

## R3-08

**Requirement:** R2 parity runtime digest remains `b787e6fffcf3c2c98d36cc6bb2fc34a2f67e460ae79b76bd3fa4144f4d768ba5`.

**Evidence:** immutable-parent verifier.

**Failure policy:** fail closed.

## R3-09

**Requirement:** Coordinate convention ID is exactly `tdt.ewa.source-lattice.pixel-center-v2`.

**Evidence:** oracle identity receipt and source scan.

**Failure policy:** fail closed.

## R3-10

**Requirement:** Oracle ID is exactly `tdt.ewa.oracle.f64.fractional-phase.v1`.

**Evidence:** oracle identity receipt.

**Failure policy:** fail closed.

## R3-11

**Requirement:** Oracle source position uses `(d + 0.5) * srcPerDst - 0.5`.

**Evidence:** source contract tests.

**Failure policy:** fail closed.

## R3-12

**Requirement:** Oracle candidate base uses `floor(p)`.

**Evidence:** direct-coordinate unit tests.

**Failure policy:** fail closed.

## R3-13

**Requirement:** Oracle candidate coordinate uses `base + integerOffset`.

**Evidence:** direct-coordinate unit tests.

**Failure policy:** fail closed.

## R3-14

**Requirement:** Oracle distance uses `sampleCoord - p`.

**Evidence:** source scan and unit tests.

**Failure policy:** fail closed.

## R3-15

**Requirement:** Oracle weight distance does not use a clamped fetch coordinate.

**Evidence:** border mutation tests.

**Failure policy:** fail closed.

## R3-16

**Requirement:** Oracle uses binary64 arithmetic without `Math.fround()` in the primary path.

**Evidence:** source scan.

**Failure policy:** fail closed.

## R3-17

**Requirement:** Oracle uses fixed candidate iteration order.

**Evidence:** oracle identity and deterministic repeat test.

**Failure policy:** fail closed.

## R3-18

**Requirement:** Oracle uses compensated summation for weights and all RGBA channels.

**Evidence:** source scan and numerical stress fixture.

**Failure policy:** fail closed.

## R3-19

**Requirement:** Oracle rejects non-finite inputs and intermediates.

**Evidence:** invalid-input smoke tests.

**Failure policy:** fail closed.

## R3-20

**Requirement:** Oracle fails on zero or non-finite weight sum and does not silently choose a center sample.

**Evidence:** invalid support fixture.

**Failure policy:** fail closed.

## R3-21

**Requirement:** Dot-product and independent matrix ellipse formulations agree within `1e-13`.

**Evidence:** matrix crosscheck receipt.

**Failure policy:** fail closed.

## R3-22

**Requirement:** Constant-field conservation passes within `1e-14`.

**Evidence:** oracle self-test receipt.

**Failure policy:** fail closed.

## R3-23

**Requirement:** Integer translation covariance passes within `1e-14`.

**Evidence:** oracle self-test receipt.

**Failure policy:** fail closed.

## R3-24

**Requirement:** Axis-swap covariance passes within `1e-13`.

**Evidence:** oracle self-test receipt.

**Failure policy:** fail closed.

## R3-25

**Requirement:** Tangent-sign invariance passes within `1e-14`.

**Evidence:** oracle self-test receipt.

**Failure policy:** fail closed.

## R3-26

**Requirement:** Isotropic rotation invariance passes within `1e-13`.

**Evidence:** oracle self-test receipt.

**Failure policy:** fail closed.

## R3-27

**Requirement:** Weight positivity and radial monotonicity tests pass.

**Evidence:** oracle self-test receipt.

**Failure policy:** fail closed.

## R3-28

**Requirement:** Fixture generator uses no randomness or wall-clock identity.

**Evidence:** source scan.

**Failure policy:** fail closed.

## R3-29

**Requirement:** Fixture regeneration is byte-identical.

**Evidence:** two-run regeneration comparison.

**Failure policy:** fail closed.

## R3-30

**Requirement:** Mandatory one-dimensional phase set is complete.

**Evidence:** fixture coverage index.

**Failure policy:** fail closed.

## R3-31

**Requirement:** Mandatory two-dimensional phase pairs are complete.

**Evidence:** fixture coverage index.

**Failure policy:** fail closed.

## R3-32

**Requirement:** Mandatory raster ratios are complete.

**Evidence:** fixture coverage index.

**Failure policy:** fail closed.

## R3-33

**Requirement:** Mandatory source pattern classes are complete.

**Evidence:** fixture coverage index.

**Failure policy:** fail closed.

## R3-34

**Requirement:** Mandatory ellipse classes are complete.

**Evidence:** fixture coverage index.

**Failure policy:** fail closed.

## R3-35

**Requirement:** Mandatory border fixtures are complete.

**Evidence:** fixture coverage index.

**Failure policy:** fail closed.

## R3-36

**Requirement:** Mandatory premultiplied-alpha fixtures are complete.

**Evidence:** fixture coverage index.

**Failure policy:** fail closed.

## R3-37

**Requirement:** Negative control ID is exactly `tdt.ewa.negative-control.round-centered-r2.v1`.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-38

**Requirement:** Negative control uses WGSL-compatible ties-away-from-zero rounding.

**Evidence:** signed scalar round tests.

**Failure policy:** fail closed.

## R3-39

**Requirement:** Negative control fetch anchor uses `wgslRound(p) + offset`.

**Evidence:** source scan and direct tests.

**Failure policy:** fail closed.

## R3-40

**Requirement:** Negative control distance uses integer offset alone.

**Evidence:** source scan and direct tests.

**Failure policy:** fail closed.

## R3-41

**Requirement:** Oracle and negative-control coordinate functions are separate implementations.

**Evidence:** import and source-structure verifier.

**Failure policy:** fail closed.

## R3-42

**Requirement:** At least 16 mandatory phase-sensitive fixtures distinguish negative control from oracle.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-43

**Requirement:** X-phase mismatch coverage exists.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-44

**Requirement:** Y-phase mismatch coverage exists.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-45

**Requirement:** Diagonal-phase mismatch coverage exists.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-46

**Requirement:** Anisotropic mismatch coverage exists.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-47

**Requirement:** Border mismatch coverage exists.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-48

**Requirement:** Alpha mismatch coverage exists.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-49

**Requirement:** Non-integer ratio mismatch coverage exists.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-50

**Requirement:** Exact `2:1` ratio mismatch coverage exists.

**Evidence:** negative-control receipt.

**Failure policy:** fail closed.

## R3-51

**Requirement:** Every declared invalid coordinate mutation is detected by at least one fixture.

**Evidence:** mutation-control section of negative-control receipt.

**Failure policy:** fail closed.

## R3-52

**Requirement:** Product R4 source contains the shared round-centered signature.

**Evidence:** shared-error source receipt.

**Failure policy:** fail closed because parent identity is pinned.

## R3-53

**Requirement:** Product R6 source contains the shared round-centered signature.

**Evidence:** shared-error source receipt.

**Failure policy:** fail closed because parent identity is pinned.

## R3-54

**Requirement:** Validation R4 source contains the shared round-centered signature.

**Evidence:** shared-error source receipt.

**Failure policy:** fail closed because parent identity is pinned.

## R3-55

**Requirement:** Validation R6 source contains the shared round-centered signature.

**Evidence:** shared-error source receipt.

**Failure policy:** fail closed because parent identity is pinned.

## R3-56

**Requirement:** Direct-reference source contains the shared round-centered signature.

**Evidence:** shared-error source receipt.

**Failure policy:** fail closed because parent identity is pinned.

## R3-57

**Requirement:** R2 shared-error model agrees with the negative control within `1e-14`.

**Evidence:** shared-error model receipt.

**Failure policy:** fail closed.

## R3-58

**Requirement:** Current product and direct reference are classified `REJECTED_SHARED_FRACTIONAL_PHASE_ERROR`.

**Evidence:** current-product rejection receipt.

**Failure policy:** fail closed.

## R3-59

**Requirement:** Product/reference exact parity is classified as insufficient for coordinate correctness.

**Evidence:** rejection receipt field `productReferenceParitySufficiency: false`.

**Failure policy:** fail closed.

## R3-60

**Requirement:** R4 is named as the required repair patch.

**Evidence:** current-product rejection receipt.

**Failure policy:** fail closed.

## R3-61

**Requirement:** Oracle modules exist only under validation roots.

**Evidence:** source layout scanner.

**Failure policy:** fail closed.

## R3-62

**Requirement:** Oracle imports no product runtime math.

**Evidence:** import graph scanner.

**Failure policy:** fail closed.

## R3-63

**Requirement:** Renderer and application sources import no R3 oracle module.

**Evidence:** runtime import scan.

**Failure policy:** fail closed.

## R3-64

**Requirement:** Worker sources import no R3 oracle module.

**Evidence:** runtime import scan.

**Failure policy:** fail closed.

## R3-65

**Requirement:** Preview and Export sources import no R3 oracle module.

**Evidence:** runtime import scan.

**Failure policy:** fail closed.

## R3-66

**Requirement:** No public runtime option selects CPU oracle or negative control.

**Evidence:** API and call-site audit.

**Failure policy:** fail closed.

## R3-67

**Requirement:** No WebGPU failure branch invokes CPU EWA processing.

**Evidence:** control-flow and call-site audit.

**Failure policy:** fail closed.

## R3-68

**Requirement:** No Canvas or WebGL resample fallback is introduced.

**Evidence:** active call-site audit.

**Failure policy:** fail closed.

## R3-69

**Requirement:** No direct GPU reference is selected automatically as product fallback.

**Evidence:** R2 and R3 call-site audit.

**Failure policy:** fail closed.

## R3-70

**Requirement:** Oracle rejects unsealed or oversized user-image ingress.

**Evidence:** invalid-input smoke tests.

**Failure policy:** fail closed.

## R3-71

**Requirement:** Oracle code is absent from renderer emitted assets.

**Evidence:** Build Emit content scan when emit exists.

**Failure policy:** fail closed when emit exists; otherwise `DEFERRED` with no claim.

## R3-72

**Requirement:** Oracle code is absent from packaged Electron content.

**Evidence:** packaged content scan when package exists.

**Failure policy:** fail closed when package exists; otherwise `DEFERRED` with no claim.

## R3-73

**Requirement:** No R3 oracle asset is added to Runtime Asset Authority.

**Evidence:** runtime asset manifest diff.

**Failure policy:** fail closed.

## R3-74

**Requirement:** No R3 validation module is admitted as an Active Graph production node.

**Evidence:** Active Graph manifest and reachability scan.

**Failure policy:** fail closed.

## R3-75

**Requirement:** Stable error registry contains every required R3 code.

**Evidence:** stable-error verifier.

**Failure policy:** fail closed.

## R3-76

**Requirement:** All canonical R3 receipts are bounded and schema-valid.

**Evidence:** receipt schema validator.

**Failure policy:** fail closed.

## R3-77

**Requirement:** Two fresh-process runs produce identical canonical receipt bytes.

**Evidence:** deterministic process comparison.

**Failure policy:** fail closed.

## R3-78

**Requirement:** R1A predecessor gate remains passing.

**Evidence:** exact predecessor gate receipt or rerun.

**Failure policy:** fail closed for source requirements; preserve predecessor physical deferrals.

## R3-79

**Requirement:** R1B predecessor gate remains passing.

**Evidence:** exact predecessor gate receipt or rerun.

**Failure policy:** fail closed for source requirements; preserve predecessor physical deferrals.

## R3-80

**Requirement:** R1C predecessor gate remains passing.

**Evidence:** exact predecessor gate receipt or rerun.

**Failure policy:** fail closed for source requirements; preserve predecessor physical deferrals.

## R3-81

**Requirement:** R1D predecessor gate remains passing.

**Evidence:** exact predecessor gate receipt or rerun.

**Failure policy:** fail closed for source requirements; preserve predecessor physical deferrals.

## R3-82

**Requirement:** R2 predecessor gate remains passing under its original claims.

**Evidence:** exact predecessor gate receipt or rerun.

**Failure policy:** fail closed for source requirements; R3 rejection does not rewrite R2 historical evidence.

## R3-83

**Requirement:** Production Pointer is not modified.

**Evidence:** pointer digest comparison and changed-file audit.

**Failure policy:** fail closed.

## R3-84

**Requirement:** Source receipt state is exactly `RESAMPLE_RUNTIME_R3_ORACLE_BAKED_CURRENT_PRODUCT_REJECTED`.

**Evidence:** source receipt.

**Failure policy:** fail closed.

## R3-85

**Requirement:** Verified state is exactly `RESAMPLE_RUNTIME_R3_ORACLE_VERIFIED_R4_REQUIRED` after deterministic two-process verification.

**Evidence:** gate and source receipt.

**Failure policy:** fail closed.

## R3-86

**Requirement:** R3 makes no physical GPU claim without physical evidence.

**Evidence:** receipt claim audit.

**Failure policy:** fail closed for false claim; physical evidence may remain deferred.

## R3-87

**Requirement:** R3 makes no packaged Electron claim without packaged evidence.

**Evidence:** receipt claim audit.

**Failure policy:** fail closed for false claim; package evidence may remain deferred.

## R3-88

**Requirement:** Applied README explicitly states that R3 rejects but does not repair the current product.

**Evidence:** README source scan.

**Failure policy:** fail closed.

---

# 32. Completion Definition

R3 is complete only when the repository can answer all of the following without ambiguity:

```text
What is the authoritative continuous source coordinate?
What integer lattice is enumerated?
What point is used for ellipse distance?
How is border clamping separated from logical distance?
Which implementation supplies independent expected values?
Why is the current direct reference not mathematically independent?
Which fixtures prove that round-centered phase erasure is observable?
Does the current product fail those fixtures?
Can the CPU oracle ever process a user image at runtime?
Was the Production Pointer moved?
Which next patch must repair the product?
```

The required answers are:

```text
p = (d + 0.5) * srcPerDst - 0.5
base = floor(p)
sampleCoord = base + offset
delta = sampleCoord - p
border clamp affects fetch only
binary64 R3 oracle supplies independent expected values
current product and direct reference share round(p) plus offset and offset-only distance
mandatory phase-sensitive fixtures detect the defect
current product is formally rejected
CPU oracle has zero runtime product authority
Production Pointer remains unchanged
TDT-RESAMPLE-RUNTIME-01-R4 must repair the GPU product and reference
```

When these statements are sealed by source, deterministic receipts, and clean runtime-isolation evidence, R3 may enter:

```text
RESAMPLE_RUNTIME_R3_ORACLE_VERIFIED_R4_REQUIRED
```

It may not enter a production-ready state.
