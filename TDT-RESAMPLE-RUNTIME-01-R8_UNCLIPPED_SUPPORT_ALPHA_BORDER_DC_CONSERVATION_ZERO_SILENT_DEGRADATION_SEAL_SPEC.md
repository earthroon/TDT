# TDT-RESAMPLE-RUNTIME-01-R8

## Unclipped Support / Alpha·Border·DC Conservation / Zero Silent Degradation Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R8`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R7`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R7_PREVIEW_EXPORT_CANONICAL_EWA_LOWPASS_CONVERGENCE_SHARED_STAGE_PLANNER_KERNEL_IDENTITY_RESIDUAL_IDENTITY_SEPARATION_BAKED_AWAITING_PHYSICAL_GPU.zip`
- **Parent repository bundle SHA-256:** `61e277ee6328dbb62583cab54699d9344ff7a504a22ec6870530d99e2be58433`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R7_CANONICAL_LOWPASS_CONVERGENCE_SEALED_AWAITING_R8`
- **Target source state:** `RESAMPLE_RUNTIME_R8_UNCLIPPED_SUPPORT_ALPHA_BORDER_DC_SOURCE_BAKED_AWAITING_PHYSICAL_GPU`
- **Target source-verified state:** `RESAMPLE_RUNTIME_R8_CONSERVATION_AND_ZERO_DEGRADATION_SEALED_AWAITING_R9`
- **Physical GPU state:** `RESAMPLE_RUNTIME_R8_PHYSICAL_GPU_EVIDENCE_DEFERRED_TO_R9`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Canonical lowpass kernel mathematical identity:** `tdt.ewa.ellipse.phase-correct-parametric-r6.v1`
- **Canonical lowpass ABI:** `tdt.delta-k-ewa.params.v4`
- **Canonical lowpass ABI bytes:** `96`
- **R8 support-envelope identity:** `tdt.ewa.support-envelope.r8.v1`
- **R8 stage planner identity:** `tdt.ewa.multistage.planner.v3`
- **R8 tiled-profile identity:** `tdt.ewa.tiled-profile.r8.v1`
- **R8 generated-source identity:** `tdt.ewa.wgsl-generator.r8.v1`
- **R8 generated-manifest identity:** `tdt.ewa.generated-manifest.r8.v1`
- **R8 zero-degradation identity:** `tdt.ewa.zero-silent-degradation.r8.v1`
- **Canonical internal surface semantic:** `tdt.ewa.surface.linear-premultiplied.r8.v1`
- **Canonical alpha semantic:** `tdt.alpha.premultiplied`
- **Canonical transfer semantic:** `tdt.transfer.linear`
- **Source preparation identity:** `tdt.ewa.source-prepare.r8.v1`
- **Border conservation identity:** `tdt.ewa.border-conservation.r8.v1`
- **DC oracle identity:** `tdt.ewa.dc-conservation.oracle.r8.v1`
- **Residual alpha identity:** terminal lowpass alpha is immutable
- **Hidden RGB at alpha zero:** canonicalized to zero in the lowpass surface
- **Runtime CPU resampling fallback:** forbidden
- **Runtime CPU premultiply or transfer conversion:** forbidden
- **Center-sample zero-weight fallback:** forbidden
- **Silent footprint radius clamp:** forbidden
- **Unbounded policy texture:** forbidden
- **Uninitialized neutral policy texture:** forbidden
- **Source alpha-mode guessing:** forbidden
- **Intermediate unpremultiply:** forbidden
- **Physical GPU pass claim from source evidence:** forbidden
- **Packaged Electron pass claim from source evidence:** forbidden

---

# 0. Executive Contract

R8 shall make every admitted canonical EWA stage mathematically support-complete, alpha-semantic, border-conservative, DC-conservative, and incapable of hiding an invalid state behind a visually plausible fallback.

R7 converged Preview and Export onto one lowpass path. It did not prove that every admitted stage executes the entire requested ellipse, nor did it repair the source-alpha ambiguity inherited by the Export facade. The parent path still contains several silent-degradation mechanisms:

1. Product and reference WGSL compute `major` with `min(U.maxSampleReach, idealMajor)`. A request that exceeds the selected profile is silently changed into a smaller filter.
2. The parent host proof also clamps both radius bounds to `maxSampleReach` before calculating `requiredReach`. The proof can therefore declare a clipped request safe.
3. The parent minor-radius upper bound divides by `sqrt(maxAnisotropy)`. The actual minor radius is largest when anisotropy is neutral and the divisor is `1`, so the existing proof can underestimate the minor axis.
4. Planner v2 does not include the adaptive policy footprint-scale bound in its stage recurrence. A stage can be planned without the same support envelope later consumed by profile selection.
5. `shrinkClamp` participates in planner math but is absent from the 96-byte shader ABI. A planner-only cap and a shader-visible sigma can disagree.
6. A policy texture without a normalized policy object receives a guessed `1.5` footprint bound in historical profile code. Guessing is not authority.
7. The neutral policy texture is allocated but the parent bundle does not establish a required initialization write. Uninitialized policy values can silently alter anisotropy and footprint.
8. Product and reference select the center sample when `weightSum <= EPS`. This converts an impossible or corrupted kernel state into a plausible-looking pixel.
9. Byte Export uses one `alphaMode` value for source interpretation and terminal delivery. The parent upload branch can premultiply a source that was already declared premultiplied, while a default straight source can enter lowpass without canonical premultiplication.
10. The parent canonical path does not require explicit source transfer and alpha metadata before lowpass.
11. The Export residual currently accumulates RGBA residual, so the optional detail pass can change lowpass alpha.
12. Border semantics are named but not yet backed by dedicated constant-field, one-pixel-axis, corner, and duplicated-clamp-tap conservation evidence.

R8 shall replace these ambiguities with four authorities:

```text
support-envelope authority
    proves requested major and minor radii fit the selected lattice reach

source-surface authority
    converts or admits only explicit linear-premultiplied RGBA

conservation authority
    proves normalized weights preserve constant premultiplied fields at interior and borders

zero-degradation authority
    rejects or exposes every state previously hidden by clamp, guess, fallback, or alpha ambiguity
```

The R6 weight function, R5 axial field, R4 continuous source lattice, and R7 Preview/Export convergence remain the mathematical parents. R8 may produce new generated product, validation, and reference WGSL because it must remove the radius clamp and center fallback. The canonical ellipse weight identity remains `tdt.ewa.ellipse.phase-correct-parametric-r6.v1` because valid admitted pixels evaluate the same weight function. The new generated-source and execution-safety identities shall state that support is proven rather than clipped.

The intended canonical stage is:

```text
explicit source semantic
    ↓
GPU source preparation when required
    ↓
linear premultiplied rgba16float
    ↓
planner v3 support envelope
    ↓
R4 or R6 profile with positive support margin
    ↓
R8 unclipped generated EWA product
    ↓
finite positive normalized weight sum
    ↓
linear premultiplied rgba16float output
```

No branch may substitute a center texel, reduce the requested radius, invent a policy bound, assume an alpha mode, or perform CPU-side pixel conversion.

R8 shall prove all of the following:

1. The parent R7 convergence graph remains the sole Preview and Export lowpass authority.
2. The support envelope is computed from the same effective values consumed by WGSL.
3. The major-axis bound uses maximum anisotropy.
4. The minor-axis bound uses the neutral-anisotropy maximum rather than dividing by maximum anisotropy.
5. The policy footprint bound is explicit, normalized, digested, and included in the plan.
6. `sigmaMain` and `shrinkClamp` cannot diverge silently.
7. A selected profile has `maxReach >= requiredReach` before dispatch.
8. Generated product and reference shaders do not clamp major or minor to profile reach.
9. A per-pixel support-contract violation produces a deterministic fault surface rather than truncated sampling.
10. A nonfinite or nonpositive weight sum produces a deterministic fault surface rather than the center sample.
11. Validation shaders count every prohibited condition independently.
12. The neutral policy texture is initialized to the exact neutral tuple and carries an initialization receipt.
13. A policy texture cannot be consumed without a matching footprint-bound proof.
14. Canonical lowpass input is explicit linear premultiplied RGBA.
15. Byte Export source and output alpha semantics are separate fields.
16. Straight or sRGB input conversion executes on GPU.
17. Alpha-zero hidden RGB is removed from the canonical lowpass surface.
18. The optional Export residual preserves terminal lowpass alpha exactly.
19. Unpremultiplication occurs only at an explicit terminal output boundary.
20. Border clamp changes fetch coordinates only, never logical distance.
21. Repeated border fetches remain separate weighted logical taps.
22. Constant premultiplied fields are conserved across phases, orientations, profiles, borders, and tiny dimensions.
23. No Production Pointer is moved.
24. Physical GPU and packaged Electron evidence remain deferred to R9.

R8 is a conservation and fail-closed source patch. It is not a physical GPU promotion patch.

---

# 1. Parent Truth and Frozen Evidence

## 1.1 Parent bundle identity

The sole admitted parent bundle is:

```text
61_TDT_RESAMPLE_RUNTIME_01_R7_PREVIEW_EXPORT_CANONICAL_EWA_LOWPASS_CONVERGENCE_SHARED_STAGE_PLANNER_KERNEL_IDENTITY_RESIDUAL_IDENTITY_SEPARATION_BAKED_AWAITING_PHYSICAL_GPU.zip
```

with SHA-256:

```text
61e277ee6328dbb62583cab54699d9344ff7a504a22ec6870530d99e2be58433
```

Any other parent shall fail with `E_R8_PARENT_BUNDLE_IDENTITY_MISMATCH`.

## 1.2 Frozen parent assets

The following files are parent evidence. Their parent digests shall be verified before any R8 mutation. R8 shall add versioned replacements where behavior changes rather than rewriting historical R6 or R7 evidence in place.

| Asset | Parent SHA-256 |
|---|---|
| `specs/TDT-RESAMPLE-RUNTIME-01-R7_PREVIEW_EXPORT_CANONICAL_EWA_LOWPASS_CONVERGENCE_SHARED_STAGE_PLANNER_KERNEL_IDENTITY_RESIDUAL_IDENTITY_SEPARATION_SEAL_SPEC.md` | `7d100c5538717b2336eb4234ffbb3a98dc44257df45c5c83d1a4646b64f8dd55` |
| `README_TDT_RESAMPLE_RUNTIME_01_R7_APPLIED.md` | `0551165c756872c2984ec1736f1955485a964c97512c69aba4d965cbe0ec6370` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner_v2.mjs` | `30a404d447100d499b656bc68b6a14ed6093ff835333ebabcb79f6090a4b09ca` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_contract_r7.mjs` | `d0f7538f44209409d2bf06b652afe27afda96f6aaee5284fd1236fe0a2a96952` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r7.mjs` | `63eefdc4d1d737803950770e0020a0e23ace78ab66d27bdcdf7c4d0377e08ba9` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_convergence_receipt_r7.mjs` | `ca409f430dd8f4564490fbc0b44c2af52a3a24a6587fc3776ef7734114dc66fb` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs` | `58ba24e685caa4d40f2ed81b184963b175104f25166d53717bc9b3406ed741ed` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params_v4.mjs` | `e8880cc46d2eec796e360c44f326e87692db9b25c23d788c6dff30c0e357fcf6` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_kernel_contract_v4.mjs` | `ae644228f72503f8d751a24bcf97ed0eafd446361380fbe572cce5254bf8f56e` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r6.mjs` | `9cba998b53c84345a34d43f6451968b0d27989ea38998f5c693b7b01e9b67382` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r6.wgsl` | `c8f1a893b6ea0f3cf7c7b0fab4a4fcfbbf24a77627517f5fb30fd7b0446c65a8` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r6.wgsl` | `4c1229695396f4c11dc14502f99e2c25242924fd83a9fcb52f7169abb3912b71` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v5_r6.wgsl` | `70ae9edc4c5fd221a46ed546e8bbb3935b4176277aad62948078c2270892e81f` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r6.wgsl` | `5eb574cec5c5b1612a592ccee0011e3623051cfe645938062dab97f4b3df4696` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r6.wgsl` | `60320808e0f6749d7975ca86afa8b0085ca5c256f392b2fdd531e02a0c8ce71d` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_generated_manifest_r6.json` | `11f3bcca8ee3540a30f48433e1a9f2a5ea2f5bfa04dbf8ac9de14d3bc8669a47` |
| `app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js` | `da068d8715605d3ab06329c6208d61728032e88914cd09057e7e9eee37834c56` |
| `app/legacy-runtime/modules/dk_resample/export_residual_runtime_r7.mjs` | `96959de83b290042caeadfa4d4e4798cd232b06bcc6e180094de00cf80674b5a` |
| `app/legacy-runtime/modules/dk_resample/export_finalize_runtime_r7.mjs` | `60c9c02d31edc76b9793ecdf2286c45d3aca0b75aaaefaf96e5df80ff5106ef2` |
| `app/legacy-runtime/modules/dk_resample/shaders/export_detail_residual_r7.wgsl` | `d9a383d85e521b907e135c2de1cfcb9a158807ee9c44863541b49fe204df6ace` |
| `app/legacy-runtime/modules/dk_resample/shaders/export_finalize_rgba8_r7.wgsl` | `46a1e901d0a3d6cb7569c53d9ef4736a47cef7f65479eadf89ec099bad2bc477` |
| `app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_contract.mjs` | `ccbde7d53457e36b24f2db23e9202e362cdfbc94deb8cb0934e8dfbc6c921852` |
| `app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_runtime.mjs` | `42012bea8f920fbb2b528585132630438ef45f18fa77d77564816ccc041a1f3a` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/adaptive_policy_projection_r1d.wgsl` | `3602951807672a520bf045a164abc697e61a63b00fc54afa519384fc4affceec` |


## 1.3 Allowed R8 mutations

R8 may add or redirect only the surfaces required for support, alpha, border, and conservation truth:

- a versioned support-envelope module;
- planner v3 and a versioned tiled-profile selector;
- R8 generated product, validation, and direct-reference WGSL;
- a versioned generated manifest and source generator;
- source-surface semantic contracts and GPU source preparation;
- R8 lowpass runtime and receipts;
- R8 Export residual and finalization revisions;
- validation telemetry, binary64 oracles, fixtures, gates, manifests, README, and patch artifacts;
- runtime asset and Active Graph admission for R8 assets.

R8 shall not change the R6 ABI offsets or size, the R6 radial/taper weight formula, the R5 axial interpolation formula, the R4 source-lattice coordinate convention, or the R7 rule that Export residual runs only after the complete lowpass chain.

## 1.4 Forbidden rewrites

The following are forbidden:

- editing R6 generated files and continuing to call them R6 output;
- keeping `min(maxSampleReach, idealRadius)` in a canonical R8 shader;
- computing `requiredReach` after clipping the radius bound;
- treating the maximum-anisotropy minor radius as the maximum minor radius;
- defaulting an unknown policy texture to a guessed footprint bound;
- leaving a neutral policy allocation unwritten;
- retaining center-sample fallback for invalid weight mass;
- silently converting `sigmaMain` through `shrinkClamp` without receipt or rejection;
- interpreting one alpha option as both source and destination authority;
- CPU premultiplication, CPU transfer conversion, Canvas, or WebGL conversion;
- allowing residual to change alpha;
- deduplicating border taps that clamp to the same texel;
- moving the Production Pointer.

---

# 2. Parent Defects Requiring R8

## 2.1 Radius clipping disguised as support

The parent generated WGSL contains:

```wgsl
let major = min(U.maxSampleReach, idealMajor);
```

A clipped request still produces an image and therefore can pass a visual smoke test. This is silent semantic substitution. R8 shall compute the requested radius without a profile cap and reject any stage whose envelope cannot fit.

## 2.2 Host proof clips before it proves

The parent profile proof computes radius bounds with `min(maxSampleReach, ...)` and then derives `requiredReach`. This makes `requiredReach` incapable of exceeding the current profile ceiling. R8 shall derive the uncapped envelope first.

## 2.3 Minor-axis maximum is currently underestimated

For the canonical ellipse:

```text
minor = max(minorCoverageFactor, scaleN × sigmaCross × footprint / sqrt(anisotropy))
```

with `sqrt(anisotropy) ∈ [1, sqrt(maxAnisotropy)]`, the largest second term occurs at `sqrt(anisotropy)=1`. Therefore the conservative upper bound is:

```text
minorBound = max(minorCoverageFactor, scaleBound × sigmaCross × footprintBound)
```

It is not divided by `sqrt(maxAnisotropy)`.

## 2.4 Planner and dispatch use different support inputs

Planner v2 omits the explicit policy footprint bound from its stage recurrence. The later profile selector can see policy levels, but it historically clips before proving. R8 shall make one support-envelope object flow through planner, profile selection, parameter packing, dispatch, and receipt.

## 2.5 Planner-only `shrinkClamp`

The v4 ABI contains `sigmaMain` but not `shrinkClamp`. A planner that uses `min(shrinkClamp, sigmaMain)` can plan a smaller footprint than the shader requests. R8 shall not silently cap. Canonical admission requires:

```text
sigmaMain <= shrinkClamp
```

A violation fails with `E_R8_SHRINK_CLAMP_CONFLICT`.

## 2.6 Uninitialized neutral policy

A neutral policy is not merely a texture handle. Its exact value shall be:

```text
(level=0, tensorInfluence=1, footprintScale=1, deltaEGate=1)
```

or `vec4(0,1,1,1)`. Allocation without an initialization write is not neutral authority.

## 2.7 Center fallback hides kernel failure

The parent product and reference write the center sample when `weightSum <= EPS`. R8 shall prove positive mass for admitted finite inputs and shall make any violated invariant observable as a deterministic fault, never as a plausible center pixel.

## 2.8 Alpha-mode conflation

The parent Export facade uses `alphaMode` for both upload interpretation and terminal finalization. The upload branch can multiply an already-premultiplied source again. R8 shall split:

```text
sourceAlphaMode
outputAlphaMode
sourceTransferId
outputTransferId
```

and shall record every compatibility alias explicitly.

## 2.9 Residual alpha mutation

The parent residual accumulates and recomposes all four RGBA channels. R8 shall preserve lowpass alpha exactly and scope residual detail to RGB.

## 2.10 Conservation evidence gap

The border implementation uses logical-distance clamp extension, but R7 does not carry a dedicated DC and border oracle. R8 shall test constant fields through every fractional phase, profile, border, and tiny-image geometry.

---

# 3. Scope

## 3.1 In scope

- exact uncapped major and minor support bounds;
- policy footprint-bound authority;
- planner v3 support-aware stage recurrence;
- R4/R6 profile selection from uncapped support;
- R8 generated product, validation, and reference WGSL;
- deterministic fault values for impossible states;
- source transfer and alpha semantic normalization;
- GPU-only source preparation;
- premultiplied linear lowpass contract;
- residual alpha identity;
- terminal unpremultiply and transfer conversion;
- border mass and DC conservation oracles;
- source and mock telemetry;
- Active Graph and package-content source admission;
- R1A through R7 predecessor regression in isolated snapshots.

## 3.2 Out of scope

- a new EWA radial or taper function;
- a new anisotropy estimator;
- a new border mode;
- ICC profile conversion or gamut mapping;
- hidden-RGB sidecar preservation inside the canonical lowpass texture;
- physical GPU timestamp thresholds;
- final Production Pointer promotion;
- performance claims;
- packaged Electron execution claims;
- replacement of the Export residual visual style beyond alpha repair.

## 3.3 Deferred authority

R9 owns:

- physical WGSL compilation;
- physical product/reference parity;
- physical validation-counter readback;
- physical DC, alpha, and border tolerances;
- timestamp and residency plateau;
- device-loss recovery under the R8 graph;
- packaged Electron identity and execution proof.

---

# 4. R8 Identity Set

The following identities are normative:

| Purpose | Identity |
|---|---|
| Support envelope | `tdt.ewa.support-envelope.r8.v1` |
| Planner | `tdt.ewa.multistage.planner.v3` |
| Planner profile | `tdt.ewa.canonical-unclipped-r6-profile.r8.v1` |
| Tiled profile schema | `tdt.ewa.tiled-profile.r8.v1` |
| Generated source | `tdt.ewa.wgsl-generator.r8.v1` |
| Generated manifest | `tdt.ewa.generated-manifest.r8.v1` |
| Zero-degradation execution | `tdt.ewa.zero-silent-degradation.r8.v1` |
| Internal surface | `tdt.ewa.surface.linear-premultiplied.r8.v1` |
| Source preparation | `tdt.ewa.source-prepare.r8.v1` |
| Border conservation | `tdt.ewa.border-conservation.r8.v1` |
| DC oracle | `tdt.ewa.dc-conservation.oracle.r8.v1` |
| Alpha oracle | `tdt.ewa.alpha-conservation.oracle.r8.v1` |
| Conservation receipt | `tdt.ewa.conservation-receipt.r8.v1` |
| Degradation receipt | `tdt.ewa.degradation-receipt.r8.v1` |

The R6 lowpass kernel and ABI identities remain:

```text
tdt.ewa.ellipse.phase-correct-parametric-r6.v1
tdt.delta-k-ewa.params.v4
96 bytes
```

R8 changes admission and failure semantics, not the valid-path radial formula.

---

# 5. Canonical Support Envelope

## 5.1 Inputs

The support envelope shall consume only normalized, shader-visible, or explicitly bounded values:

```text
sourceWidth
sourceHeight
outputWidth
outputHeight
sigmaMain
sigmaCross
minorCoverageFactor
maxAnisotropy
policyFootprintBound
profileReach candidates
coordinate convention identity
```

`shrinkClamp` is an admission constraint, not a hidden effective sigma.

## 5.2 Axis scale bound

For unit tangent `t` and normal `n`:

```text
scaleT = max(1, length(t * srcPerDst))
scaleN = max(1, length(n * srcPerDst))
```

The conservative orientation-independent upper bound is:

```text
scaleBound = max(1, srcPerDstX, srcPerDstY)
```

The support proof shall include the inequality witness that both `scaleT` and `scaleN` are no greater than `scaleBound`.

## 5.3 Policy footprint bound

When adaptive policy is disabled:

```text
policyFootprintBound = 1
```

When enabled:

```text
policyFootprintBound = max(0.75,
  level0FootprintScale,
  level1FootprintScale,
  level2FootprintScale)
```

The bound shall come from the same normalized policy object used to generate the policy texture. A policy texture without its normalized policy identity, digest, and bound shall fail with `E_R8_POLICY_BOUND_MISSING`.

## 5.4 Major radius bound

```text
rootAnisotropyBound = sqrt(maxAnisotropy)
majorBound = max(
  1,
  scaleBound × sigmaMain × rootAnisotropyBound × policyFootprintBound
)
```

No profile reach may appear inside this expression.

## 5.5 Minor radius bound

```text
minorBound = max(
  minorCoverageFactor,
  scaleBound × sigmaCross × policyFootprintBound
)
```

The minor bound uses neutral anisotropy because `1/root` is largest at `root=1`.

## 5.6 Required reach

```text
requiredRadius = max(majorBound, minorBound)
requiredReach = max(1, ceil(requiredRadius - 1e-7))
```

The epsilon is a deterministic integer-boundary stabilizer only. It shall not reduce a radius that is materially above an integer.

## 5.7 Support margin

For a selected profile:

```text
supportMargin = profile.maxReach - requiredRadius
```

Admission requires:

```text
requiredReach <= profile.maxReach
supportMargin >= -1e-7
```

The exact bound and margin shall be in every stage receipt.

## 5.8 No clipping equivalence

For every admitted pixel, the shader-computed radii shall satisfy:

```text
major <= profile.maxReach
minor <= profile.maxReach
```

without calling `min(profile.maxReach, radius)`.

---

# 6. Planner v3

## 6.1 Identity

Planner v3 shall use:

```text
tdt.ewa.multistage.planner.v3
```

and one canonical profile:

```text
tdt.ewa.canonical-unclipped-r6-profile.r8.v1
```

## 6.2 Stage recurrence

The planner shall find the largest deterministic next dimensions whose complete support envelope fits reach 6. It may use monotonic integer search or an equivalent deterministic closed form, but it shall verify the resulting stage with the normative envelope before appending it.

The planner shall not derive a ratio from major radius alone. Both major and minor bounds and the policy footprint bound participate.

## 6.3 Planner digest

The plan digest shall include:

- support-envelope identity;
- normalized lowpass parameter digest;
- normalized adaptive-policy digest or neutral-policy identity;
- policy footprint bound;
- each stage’s major bound, minor bound, required reach, selected profile, and support margin;
- R6 kernel and ABI identity;
- R5 axial identity;
- R4 coordinate and border identity.

It shall exclude role, residual parameters, encoder, output format, readback intent, and volatile job fields as R7 required.

## 6.4 `shrinkClamp` rule

Canonical admission requires `sigmaMain <= shrinkClamp`. The planner shall reject a conflict rather than cap `sigmaMain`.

## 6.5 Stage limit

The existing limit of 32 stages remains. An unsatisfiable request fails rather than selecting a clipped stage.

---

# 7. R8 Profile Selector

The selector shall expose R4 and R6 candidates with unchanged physical dimensions:

| Profile | Reach | Candidate side | Candidate count | Tile |
|---|---:|---:|---:|---:|
| R4 | 4 | 9 | 81 | 24×24 |
| R6 | 6 | 13 | 169 | 28×28 |

Selection is based on the uncapped `requiredReach`:

```text
requiredReach <= 4 → R4
requiredReach <= 6 → R6
otherwise          → E_R8_SUPPORT_UNSUPPORTED
```

The phase-aware shared-tile proof remains required after profile selection. The selector shall not choose R6 merely because R4 proof failed for a non-support reason. Workgroup-storage and tile-coverage failures remain distinct errors.

---

# 8. Generated R8 WGSL

## 8.1 Required outputs

The R8 generator shall emit:

```text
ewa_aniso_tile_r4_r8.wgsl
ewa_aniso_tile_r6_r8.wgsl
ewa_aniso_tile_validation_r4_r8.wgsl
ewa_aniso_tile_validation_r6_r8.wgsl
ewa_aniso_reference_v6_r8.wgsl
ewa_generated_manifest_r8.json
```

## 8.2 Mathematical preservation

The following R6 fragments remain mathematically identical on valid inputs:

- v4 ABI layout;
- source-position and source-base formula;
- R5 axial sampling and half-angle reconstruction;
- ellipse distance;
- radial and taper weight;
- logical-distance border fetch;
- product tiled load versus direct reference load independence.

## 8.3 Required radius change

R8 shall compute:

```wgsl
let major = max(1.0, scaleT * U.sigmaMain * root * footprint);
let minor = max(U.minorCoverageFactor, scaleN * U.sigmaCross / root * footprint);
```

No `min(U.maxSampleReach, ...)` or equivalent saturation is admitted.

## 8.4 Per-pixel support assertion

Before the sample loop:

```text
if !finite(major/minor) or max(major,minor) > U.maxSampleReach + epsilon
    emit deterministic R8 fault value
```

Validation variants shall increment `supportExceededCount` before writing the fault.

## 8.5 Weight-mass assertion

After accumulation:

```text
weightSum must be finite and greater than EPS
accumulated must be finite
```

A violation writes the deterministic R8 fault value. It shall never select the center sample.

## 8.6 Deterministic fault value

The fault value shall be a documented nonfinite sentinel generated by one common fragment. It shall be distinguishable from any valid premultiplied image value. Product, validation, reference, and finalization diagnostics shall agree on its identity.

## 8.7 Validation buffer

R8 validation shaders shall use a versioned storage-buffer schema with independent counters for at least:

```text
supportExceededCount
weightSumZeroCount
weightSumNonFiniteCount
accumulatedNonFiniteCount
sourceSampleNonFiniteCount
outputNonFiniteCount
outOfTileAttemptCount
borderLogicalTapCount
borderPhysicalClampCount
centerFallbackCount
radiusClampCount
policyBoundMismatchCount
alphaInvariantCount
contractMismatchCount
```

`centerFallbackCount` and `radiusClampCount` must remain zero because those branches shall not exist in canonical R8 source.

---

# 9. Neutral and Adaptive Policy Authority

## 9.1 Neutral tuple

The canonical neutral policy tuple is:

```text
vec4(0, 1, 1, 1)
```

Its meanings are:

```text
level            = 0
tensor influence = 1
footprint scale  = 1
Delta-E gate     = 1
```

## 9.2 Initialization

The bundle shall initialize the 1×1 `rgba16float` neutral texture before it can be bound. Allocation alone is insufficient. An initialization receipt shall contain the exact tuple, format, dimensions, device epoch, and write count.

## 9.3 Policy proof coupling

An adaptive policy texture shall carry metadata containing:

- policy schema ID;
- policy digest;
- footprint bound;
- source dimensions;
- device epoch;
- producer identity.

The dispatch request shall carry the same policy digest and bound. Mismatch fails closed.

## 9.4 Flag coupling

The adaptive-policy flag, bound proof, and bound texture shall agree:

```text
disabled → neutral texture + bound 1 + flag 0
enabled  → policy texture + normalized bound + flag 1
```

No mixed state is admitted.

## 9.5 Anisotropy authority coupling

The shader-visible `maxAnisotropy` is the sole ellipse anisotropy authority. If the normalized adaptive-policy object carries a `maxAnisotropy` field, it shall equal the canonical lowpass value exactly after normalization. A mismatch shall fail with `E_R8_POLICY_ANISOTROPY_MISMATCH`; it shall not create a second hidden support authority.

---

# 10. Canonical Source-Surface Semantics

## 10.1 Internal semantic

Every nonidentity canonical lowpass stage consumes and produces:

```text
format: rgba16float
transfer: linear
alpha: premultiplied
semanticId: tdt.ewa.surface.linear-premultiplied.r8.v1
```

The only exception is a source that is already proven to carry this exact semantic and can enter through an identity prepare operation.

## 10.2 Explicit source fields

A source request shall declare:

```text
sourceTransferId = tdt.transfer.linear | tdt.transfer.srgb
sourceAlphaMode  = tdt.alpha.straight | tdt.alpha.premultiplied
sourceFormat
sourceSemanticId or explicit semantic tuple
```

Unknown or missing semantics fail unless a facade has a normative default for its public byte format.

## 10.3 Byte Export defaults

For the existing RGBA byte Export API:

```text
sourceTransferId = tdt.transfer.srgb
sourceAlphaMode  = tdt.alpha.straight
outputTransferId = tdt.transfer.srgb
outputAlphaMode  = tdt.alpha.straight
```

These defaults are API facts, not pixel inspection guesses.

## 10.4 Alpha option separation

R8 shall expose separate normalized options:

```text
sourceAlphaMode
outputAlphaMode
sourceTransferId
outputTransferId
```

The legacy `alphaMode` option may map to `outputAlphaMode` only. It shall not change source interpretation. Premultiplied byte input requires explicit `sourceAlphaMode='premultiplied'`.

---

# 11. GPU Source Preparation

## 11.1 Identity path

A source already carrying `linear + premultiplied + rgba16float` may pass through with zero preparation dispatches. Its semantic metadata and device epoch shall be validated.

## 11.2 Linear straight input

```text
out.rgb = in.rgb × alpha
out.a   = alpha
```

## 11.3 sRGB straight input

```text
linearRgb = srgbDecode(in.rgb)
out.rgb   = linearRgb × alpha
out.a     = alpha
```

## 11.4 sRGB premultiplied input

For alpha greater than epsilon:

```text
encodedStraight = encodedPremultiplied / alpha
linearStraight  = srgbDecode(encodedStraight)
out.rgb         = linearStraight × alpha
```

For alpha at or below epsilon:

```text
out = vec4(0,0,0,alpha)
```

This prevents nonlinear double premultiplication.

## 11.5 Hidden RGB policy

The canonical lowpass texture does not preserve hidden RGB at zero alpha. Hidden RGB belongs to an external sidecar or format-specific pipeline. Canonical preparation shall write zero RGB when alpha is zero or below the declared epsilon.

## 11.6 GPU-only rule

Source preparation shall be a WebGPU pass or an admitted zero-dispatch identity operation. CPU byte loops, Canvas, WebGL, and readback-transform-upload cycles are forbidden.

## 11.7 sRGB transfer equations

For normalized encoded channel `c` in the byte-source domain:

```text
srgbDecode(c) = c / 12.92                              when c <= 0.04045
                ((c + 0.055) / 1.055) ^ 2.4            otherwise
```

For nonnegative linear channel `l` at terminal encoding:

```text
srgbEncode(l) = 12.92 × l                              when l <= 0.0031308
                1.055 × l^(1/2.4) - 0.055              otherwise
```

The source-prepare and finalization shaders shall share generated transfer helpers or independently digest-matched canonical fragments. Approximate gamma `2.2`, texture-format implicit sRGB assumptions on `rgba8unorm`, and CPU conversion are not admitted.

---

# 12. Premultiplied Lowpass Conservation

The EWA accumulation shall operate directly on premultiplied RGBA:

```text
out = Σ(weight_i × premultipliedSample_i) / Σ(weight_i)
```

The same weights apply to RGB and alpha. There is no unpremultiply inside the lowpass chain.

For a constant premultiplied field `C`, exact arithmetic yields:

```text
Σ(w_i C) / Σ(w_i) = C
```

R8 shall provide a binary64 oracle and half-float-aware expected values. Source-only tests may use deterministic software emulation, but the oracle shall never enter runtime or serve as a fallback.

---

# 13. Border Conservation

## 13.1 Logical distance remains unclamped

For each candidate:

```text
logicalCoord = base + integerOffset
delta        = logicalCoord - continuousSourcePosition
fetchCoord   = clamp(logicalCoord, imageBounds)
```

The ellipse distance uses `delta`, not `fetchCoord - p`.

## 13.2 Repeated clamped taps remain distinct

At a border, multiple logical coordinates may fetch the same edge texel. Each logical tap keeps its own weight. R8 shall not deduplicate by physical fetch coordinate.

## 13.3 Border normalization

All admitted logical taps participate in `weightSum`, including taps whose fetch coordinates clamp. The output is normalized by the complete logical mass.

## 13.4 Tiny dimensions

The same contract applies to:

```text
1×1
1×N
N×1
2×2
odd dimensions
partial workgroups
```

A one-pixel axis is not a special bilinear or center-copy fallback.

---

# 14. DC Conservation Fixtures

The deterministic fixture matrix shall include at least:

- transparent black;
- opaque black and white;
- f16-representable gray constants;
- independent red, green, and blue constants;
- alpha values `0`, `0.25`, `0.5`, `0.75`, `1`;
- constant premultiplied colors with nontrivial alpha;
- R4 and R6 profile selection;
- policy footprint scales `0.75`, `1`, `1.5`;
- anisotropy limits `1`, `3`, `16` within admitted policy constraints;
- all R3 fractional phases;
- horizontal, vertical, and diagonal axial fields;
- interior, edge, and corner output positions;
- `1×1`, `1×17`, `17×1`, odd and partial-workgroup dimensions;
- single-stage and multistage plans;
- Preview and Export lowpass envelopes.

Binary64 expected DC error is zero. Source emulation shall define output-storage rounding explicitly. Physical tolerance is deferred to R9 and shall be expressed in half-float ULP, not an arbitrary decimal epsilon.

---

# 15. Alpha Conservation Fixtures

The fixture matrix shall include:

1. Opaque color beside fully transparent pixels containing hostile hidden RGB.
2. Constant straight color with varying alpha, prepared into premultiplied linear form.
3. Fully transparent input with arbitrary source RGB.
4. Premultiplied sRGB input to detect double multiplication.
5. Straight sRGB input to detect missing multiplication.
6. Lowpass-only and residual-enabled Export.
7. Straight and premultiplied terminal output modes.
8. Alpha values around the declared epsilon.
9. Border and corner alpha transitions.
10. Multistage downscale.

Required outcomes:

- no hidden-RGB fringe from zero-alpha pixels;
- lowpass alpha follows normalized weighted alpha;
- residual output alpha equals lowpass alpha;
- alpha-zero output RGB is zero at the canonical surface;
- unpremultiply occurs only at terminal output;
- source and output alpha modes remain separately receipted.

---

# 16. Export Residual R8 Contract

The residual remains outside canonical EWA lowpass and retains a distinct identity. R8 shall revise only its alpha semantics:

```text
output.a = lowpass.a
```

Residual detail is RGB-only. It may be calculated in straight linear RGB for edge measurement, but recomposition shall return to premultiplied linear RGB using the immutable lowpass alpha. At or below alpha epsilon, residual RGB is zero.

The residual shall not:

- change alpha;
- inject hidden RGB into zero-alpha pixels;
- unpremultiply the canonical lowpass texture in place;
- feed its output into another lowpass stage;
- claim DC conservation for nonzero detailMix on nonconstant fields.

For a constant field, residual RGB shall be zero and the complete Export pre-finalization surface shall remain constant.

---

# 17. Terminal Finalization R8

Finalization shall consume explicit:

```text
inputTransferId = tdt.transfer.linear
inputAlphaMode  = tdt.alpha.premultiplied
outputTransferId
outputAlphaMode
alphaEpsilon
```

For straight output:

```text
straightLinear = alpha > epsilon ? premultiplied.rgb / alpha : 0
encodedRgb     = transferEncode(straightLinear)
```

For premultiplied encoded output:

```text
encodedStraight = transferEncode(straightLinear)
encodedRgb      = encodedStraight × alpha
```

Alpha is never transfer-encoded. Finalization shall detect the R8 fault sentinel and emit an explicit diagnostic result in validation or package-test modes rather than silently clamp it into an ordinary color.

---

# 18. Zero Silent Degradation Rules

The following canonical behaviors are prohibited:

```text
radius clamp
center-sample fallback
policy-bound guess
neutral-texture without initialization
sigma cap without receipt
source alpha guess
source transfer guess outside normative byte API defaults
CPU premultiply
CPU transfer conversion
intermediate unpremultiply
residual alpha mutation
border-tap deduplication
nonfinite output clamped into ordinary output
reference shader used as product
legacy lowpass fallback
```

Every unsupported request shall have a stable error code. Every impossible shader state shall produce a deterministic fault value and a validation counter.

---

# 19. Stable Error Codes

At minimum R8 shall define:

```text
E_R8_PARENT_BUNDLE_IDENTITY_MISMATCH
E_R8_SUPPORT_INPUT_INVALID
E_R8_SHRINK_CLAMP_CONFLICT
E_R8_POLICY_BOUND_MISSING
E_R8_POLICY_BOUND_MISMATCH
E_R8_POLICY_ANISOTROPY_MISMATCH
E_R8_POLICY_TEXTURE_METADATA_MISSING
E_R8_NEUTRAL_POLICY_UNINITIALIZED
E_R8_SUPPORT_UNSUPPORTED
E_R8_SUPPORT_MARGIN_NEGATIVE
E_R8_TILE_COVERAGE_UNPROVEN
E_R8_SOURCE_SEMANTIC_MISSING
E_R8_SOURCE_TRANSFER_UNSUPPORTED
E_R8_SOURCE_ALPHA_MODE_UNSUPPORTED
E_R8_SOURCE_PREPARE_REQUIRED_BUT_UNAVAILABLE
E_R8_CANONICAL_SURFACE_SEMANTIC_MISMATCH
E_R8_RESIDUAL_ALPHA_MUTATION
E_R8_FINALIZATION_SEMANTIC_MISMATCH
E_R8_GENERATED_OUTPUT_STALE
E_R8_GENERATED_MANIFEST_STALE
E_R8_RUNTIME_CPU_FALLBACK_FORBIDDEN
```

Shader-observed faults shall have numeric codes mapped deterministically in validation receipts.

---

# 20. Support Receipt

Each stage support receipt shall contain:

```text
supportEnvelopeId
source and output dimensions
srcPerDstX / srcPerDstY
scaleBound
sigmaMain
sigmaCross
minorCoverageFactor
maxAnisotropy
rootAnisotropyBound
policy schema and digest
policyFootprintBound
majorBound
minorBound
requiredRadius
requiredReach
selectedProfileId
selectedProfileReach
supportMargin
shrinkClamp admission result
supportEnvelopeDigest
```

No field may report an already-clipped radius as the requested radius.

---

# 21. Source-Semantic Receipt

The source preparation receipt shall contain:

- source format;
- source transfer ID;
- source alpha mode;
- destination canonical semantic ID;
- operation identity: identity, premultiply, decode-and-premultiply, or decode-premultiplied;
- alpha epsilon;
- dispatch count;
- CPU conversion count, fixed at zero;
- hidden-RGB-zeroing policy;
- source and output texture ownership;
- device and runtime epoch;
- receipt digest.

---

# 22. Conservation Receipt

The conservation receipt shall separate:

```text
support proof
border proof
DC proof
alpha proof
residual alpha proof
finalization semantic proof
```

Source evidence shall never mark physical pixel results PASS. It may mark deterministic oracle and mock results PASS and physical rows DEFERRED.

---

# 23. Validation Telemetry

Source and mock telemetry shall expose at least:

```text
supportRejectCount
negativeSupportMarginRejectCount
shrinkClampConflictRejectCount
policyBoundMissingRejectCount
policyBoundMismatchRejectCount
neutralPolicyInitializationCount
neutralPolicyUninitializedRejectCount
sourcePrepareDispatchCount
sourcePrepareIdentityCount
cpuSourcePrepareCount
radiusClampCount
centerFallbackCount
supportFaultPixelCount
weightSumFaultPixelCount
nonFiniteFaultPixelCount
borderTapCollapseCount
intermediateUnpremultiplyCount
residualAlphaMutationCount
sourceAlphaGuessCount
sourceTransferGuessCount
runtimeCpuFallbackCount
```

All forbidden counters shall be zero in accepted source and mock receipts.

---

# 24. Independent Oracles

R8 shall provide tool-only independent implementations for:

1. support-envelope bounds;
2. border logical-tap enumeration;
3. binary64 EWA constant-field evaluation;
4. source alpha and transfer preparation;
5. residual alpha identity;
6. terminal unpremultiply and transfer conversion.

The oracles shall not import runtime modules that contain the product formulas under test. They shall not be emitted into renderer, worker, or packaged runtime assets.

---

# 25. Negative Controls

The gate shall prove its sensitivity with deliberately wrong variants:

- major-radius `min(maxReach, ideal)`;
- host proof clipping before `requiredReach`;
- minor bound divided by `sqrt(maxAnisotropy)`;
- planner omitting policy footprint bound;
- policy texture with no bound proof;
- uninitialized neutral policy texture;
- planner-only `shrinkClamp` cap;
- center-sample zero-weight fallback;
- distance computed from clamped fetch coordinate;
- border taps deduplicated by physical texel;
- straight source entering lowpass without premultiply;
- premultiplied source multiplied a second time;
- CPU premultiply;
- residual alpha mutation;
- terminal unpremultiply inside an intermediate stage;
- nonfinite fault clamped into an ordinary pixel.

Every negative control shall fail for the intended reason and stable error identity.

---

# 26. Active Graph and Runtime Assets

The Active Graph shall admit only R8 runtime assets required by the canonical path:

- support envelope and planner v3;
- R8 lowpass contract and runtime;
- R8 EWA bundle loader and generated manifest;
- R8 product shaders;
- R8 source preparation runtime and shader;
- R8 residual and finalization assets;
- R8 receipts and telemetry.

Tool-only oracles, fixtures, source generators, negative controls, and predecessor snapshots shall remain outside the runtime graph.

R6 and R7 runtime assets may remain as explicit historical or rollback evidence but shall not be selected by the R8 canonical path.

---

# 27. Resource and Lifecycle Rules

- Source preparation output is owned explicitly and destroyed once after the lowpass chain no longer needs it.
- Identity preparation shall not create a new texture.
- Neutral policy texture is initialized once per bundle and destroyed once.
- Stage textures remain GPU-resident.
- No new intermediate readback is introduced.
- Validation status readback belongs to explicit validation runs and is deferred physically to R9.
- Device epoch mismatch invalidates source-preparation, policy, and lowpass resources.
- Fault sentinels shall not be mistaken for valid cached surfaces.

---

# 28. Preview Contract

Preview shall:

- delegate to the R8 canonical runtime;
- supply or validate explicit source semantics;
- perform source preparation only on GPU when needed;
- consume planner v3 and R8 generated product shaders;
- remain readback-free;
- execute no residual or finalization;
- expose support and source-semantic receipts;
- fail closed on unknown semantics or unsupported reach.

---

# 29. Export Contract

Byte Export shall:

- default raw bytes to straight sRGB source semantics;
- upload exactly once;
- convert on GPU to linear premultiplied `rgba16float`;
- execute the shared R8 lowpass chain;
- optionally execute RGB-only residual with immutable alpha;
- finalize once to explicit output transfer and alpha mode;
- perform exactly one terminal byte readback;
- record source, lowpass, residual, and finalization receipts separately.

Identity resize may preserve a byte-copy fast path only if it preserves the requested source-to-output semantic conversion. It shall not bypass required alpha or transfer conversion merely because dimensions match.

---

# 30. Determinism

Deterministic evidence shall include:

- canonical JSON ordering;
- stable float serialization for support receipts;
- deterministic fixture generation;
- generated WGSL and manifest digests;
- repeatable plan and support-envelope digests;
- no timestamps, random IDs, device labels, or absolute paths in source receipts;
- repeatable negative-control failures.

---

# 31. Predecessor Regression

R1A through R7 gates shall run in isolated parent snapshots. R8 shall not rewrite historical applied READMEs, receipts, or generated manifests while running regression.

Required preserved truths include:

- R3 independent fractional-phase oracle;
- R4 continuous source lattice and tile coverage;
- R5 double-angle axial interpolation;
- R6 ABI v4 and kernel weight identity;
- R7 shared Preview/Export lowpass and final-stage-only residual separation.

---

# 32. Physical GPU Deferral

Source acceptance shall not claim:

- that R8 generated WGSL compiled on a physical adapter;
- that fault branches and validation counters executed correctly on hardware;
- that product and direct reference are pixel-identical;
- that DC and alpha tolerances were measured in half-float ULP;
- that timing and memory targets were met;
- that packaged Electron contains and executes the exact assets.

These remain R9 obligations.

---

# 33. Promotion and State Rules

The source-baked state is:

```text
RESAMPLE_RUNTIME_R8_UNCLIPPED_SUPPORT_ALPHA_BORDER_DC_SOURCE_BAKED_AWAITING_PHYSICAL_GPU
```

The source-verified state is:

```text
RESAMPLE_RUNTIME_R8_CONSERVATION_AND_ZERO_DEGRADATION_SEALED_AWAITING_R9
```

Neither state authorizes Production Pointer mutation.

---

# 34. Non-Claims

R8 does not claim:

- physical GPU parity;
- physical ULP measurements;
- performance improvement;
- complete ICC or HDR color management;
- hidden-RGB sidecar preservation in the lowpass surface;
- packaged Electron execution;
- Production Pointer movement.

R8 claims source-level and deterministic-oracle closure of support, alpha semantics, border mass, DC preservation, and silent-degradation removal.

---

# 35. Required Bake Artifacts

A complete R8 source bake shall provide:

- this specification and SHA-256 sidecar;
- parent identity report;
- support-envelope oracle report;
- planner v3 fixture report;
- generated-source identity report;
- policy initialization and bound-coupling report;
- source-surface semantic report;
- alpha preparation oracle report;
- border and DC conservation report;
- residual alpha identity report;
- negative-control report;
- Active Graph report;
- predecessor regression report;
- gate receipt;
- final receipt;
- changed-file manifest;
- unified diff;
- patched full repository ZIP and SHA-256 sidecar.

---

# 36. Gate Matrix
## R8-001 `PARENT_BUNDLE_IDENTITY`

- **Class:** `MANDATORY`
- **Requirement:** Parent ZIP name and SHA-256 match the sole admitted R7 bundle.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-001` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-002 `R7_SPEC_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R7 specification digest matches the frozen parent value.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-002` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-003 `R7_README_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R7 applied README digest matches the frozen parent value.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-003` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-004 `R7_PLANNER_V2_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The parent planner v2 is preserved as predecessor evidence.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-004` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-005 `R7_LOWPASS_CONTRACT_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The parent shared lowpass contract is preserved as predecessor evidence.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-005` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-006 `R7_LOWPASS_RUNTIME_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The parent shared lowpass runtime is preserved as predecessor evidence.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-006` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-007 `R7_CONVERGENCE_RECEIPT_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The parent convergence receipt implementation is preserved.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-007` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-008 `R6_ABI_PACKER_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 v4 ABI packer remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-008` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-009 `R6_KERNEL_CONTRACT_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 weight and ABI contract remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-009` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-010 `R6_PRODUCT_R4_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 R4 product shader remains frozen predecessor evidence.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-010` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-011 `R6_PRODUCT_R6_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 R6 product shader remains frozen predecessor evidence.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-011` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-012 `R6_REFERENCE_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 direct reference remains frozen predecessor evidence.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-012` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-013 `R6_GENERATED_MANIFEST_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 generated manifest remains frozen predecessor evidence.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-013` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-014 `R5_AXIAL_IDENTITY_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R5 axial field and interpolation identity remains unchanged.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-014` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-015 `R4_COORDINATE_IDENTITY_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R4 continuous source-lattice identity remains unchanged.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-015` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-016 `R6_ABI_IDENTITY_96`

- **Class:** `MANDATORY`
- **Requirement:** Canonical ABI remains tdt.delta-k-ewa.params.v4 and 96 bytes.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-016` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-017 `R6_KERNEL_MATH_IDENTITY`

- **Class:** `MANDATORY`
- **Requirement:** The valid-path radial/taper kernel identity remains R6.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-017` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-018 `R7_SHARED_PATH_AUTHORITY`

- **Class:** `MANDATORY`
- **Requirement:** Preview and Export remain converged through one canonical lowpass authority.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-018` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-019 `R7_RESIDUAL_FINAL_STAGE_ONLY`

- **Class:** `MANDATORY`
- **Requirement:** Residual remains final-lowpass-stage-only.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-019` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-020 `NO_PRODUCTION_POINTER_MUTATION`

- **Class:** `MANDATORY`
- **Requirement:** Production Pointer remains unchanged.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-020` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-021 `SUPPORT_ENVELOPE_ID`

- **Class:** `MANDATORY`
- **Requirement:** Support-envelope identity equals tdt.ewa.support-envelope.r8.v1.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-021` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-022 `PLANNER_V3_ID`

- **Class:** `MANDATORY`
- **Requirement:** Planner identity equals tdt.ewa.multistage.planner.v3.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-022` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-023 `PLANNER_V3_SINGLE_PROFILE`

- **Class:** `MANDATORY`
- **Requirement:** Planner v3 admits exactly one canonical support profile.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-023` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-024 `TILED_PROFILE_R8_ID`

- **Class:** `MANDATORY`
- **Requirement:** Tiled-profile schema equals tdt.ewa.tiled-profile.r8.v1.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-024` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-025 `ZERO_DEGRADATION_ID`

- **Class:** `MANDATORY`
- **Requirement:** Zero-degradation execution identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-025` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-026 `INTERNAL_SURFACE_ID`

- **Class:** `MANDATORY`
- **Requirement:** Canonical internal surface identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-026` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-027 `SOURCE_PREPARE_ID`

- **Class:** `MANDATORY`
- **Requirement:** Source preparation identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-027` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-028 `BORDER_CONSERVATION_ID`

- **Class:** `MANDATORY`
- **Requirement:** Border conservation identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-028` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-029 `DC_ORACLE_ID`

- **Class:** `MANDATORY`
- **Requirement:** DC oracle identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-029` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-030 `CONSERVATION_RECEIPT_ID`

- **Class:** `MANDATORY`
- **Requirement:** Conservation receipt identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-030` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-031 `SUPPORT_INPUT_DIMENSIONS`

- **Class:** `MANDATORY`
- **Requirement:** Support input dimensions are positive safe integers.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-031` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-032 `SUPPORT_INPUT_FINITE`

- **Class:** `MANDATORY`
- **Requirement:** All support scalar inputs are finite.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-032` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-033 `SUPPORT_INPUT_POSITIVE_SIGMAS`

- **Class:** `MANDATORY`
- **Requirement:** Sigma and coverage inputs satisfy positive admitted ranges.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-033` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-034 `SUPPORT_INPUT_ANISOTROPY`

- **Class:** `MANDATORY`
- **Requirement:** maxAnisotropy is finite and at least one.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-034` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-035 `SHRINK_CLAMP_NOT_SHADER_PARAM`

- **Class:** `MANDATORY`
- **Requirement:** shrinkClamp is not represented as an undeclared shader-effective parameter.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-035` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-036 `SHRINK_CLAMP_CONFLICT_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** sigmaMain greater than shrinkClamp is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-036` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-037 `SHRINK_CLAMP_NO_SILENT_CAP`

- **Class:** `MANDATORY`
- **Requirement:** No canonical path silently replaces sigmaMain with shrinkClamp.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-037` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-038 `SUPPORT_SRC_PER_DST_X`

- **Class:** `MANDATORY`
- **Requirement:** srcPerDstX equals sourceWidth/outputWidth.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-038` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-039 `SUPPORT_SRC_PER_DST_Y`

- **Class:** `MANDATORY`
- **Requirement:** srcPerDstY equals sourceHeight/outputHeight.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-039` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-040 `SUPPORT_SCALE_BOUND`

- **Class:** `MANDATORY`
- **Requirement:** scaleBound equals max(1, srcPerDstX, srcPerDstY).
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-040` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-041 `SUPPORT_SCALE_T_INEQUALITY`

- **Class:** `MANDATORY`
- **Requirement:** Oracle proves scaleT is no greater than scaleBound.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-041` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-042 `SUPPORT_SCALE_N_INEQUALITY`

- **Class:** `MANDATORY`
- **Requirement:** Oracle proves scaleN is no greater than scaleBound.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-042` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-043 `SUPPORT_POLICY_NEUTRAL_BOUND`

- **Class:** `MANDATORY`
- **Requirement:** Disabled policy uses footprint bound exactly one.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-043` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-044 `SUPPORT_POLICY_MINIMUM`

- **Class:** `MANDATORY`
- **Requirement:** Enabled policy footprint bound includes the shader minimum 0.75.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-044` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-045 `SUPPORT_POLICY_LEVEL0`

- **Class:** `MANDATORY`
- **Requirement:** Policy footprint bound includes level0FootprintScale.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-045` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-046 `SUPPORT_POLICY_LEVEL1`

- **Class:** `MANDATORY`
- **Requirement:** Policy footprint bound includes level1FootprintScale.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-046` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-047 `SUPPORT_POLICY_LEVEL2`

- **Class:** `MANDATORY`
- **Requirement:** Policy footprint bound includes level2FootprintScale.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-047` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-048 `SUPPORT_POLICY_MAXIMUM`

- **Class:** `MANDATORY`
- **Requirement:** Policy footprint bound equals the maximum normalized scale.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-048` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-049 `SUPPORT_ROOT_ANISOTROPY`

- **Class:** `MANDATORY`
- **Requirement:** rootAnisotropyBound equals sqrt(maxAnisotropy).
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-049` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-050 `SUPPORT_MAJOR_UNCAPPED`

- **Class:** `MANDATORY`
- **Requirement:** majorBound is computed without profile reach saturation.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-050` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-051 `SUPPORT_MAJOR_FORMULA`

- **Class:** `MANDATORY`
- **Requirement:** majorBound uses scaleBound*sigmaMain*sqrt(maxAnisotropy)*policyBound.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-051` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-052 `SUPPORT_MAJOR_MINIMUM_ONE`

- **Class:** `MANDATORY`
- **Requirement:** majorBound is at least one.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-052` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-053 `SUPPORT_MINOR_UNCAPPED`

- **Class:** `MANDATORY`
- **Requirement:** minorBound is computed without profile reach saturation.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-053` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-054 `SUPPORT_MINOR_NEUTRAL_ANISO`

- **Class:** `MANDATORY`
- **Requirement:** minorBound uses the root=1 maximum, not division by sqrt(maxAnisotropy).
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-054` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-055 `SUPPORT_MINOR_COVERAGE`

- **Class:** `MANDATORY`
- **Requirement:** minorBound includes minorCoverageFactor.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-055` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-056 `SUPPORT_MINOR_FORMULA`

- **Class:** `MANDATORY`
- **Requirement:** minorBound includes scaleBound*sigmaCross*policyBound.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-056` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-057 `SUPPORT_REQUIRED_RADIUS`

- **Class:** `MANDATORY`
- **Requirement:** requiredRadius equals max(majorBound, minorBound).
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-057` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-058 `SUPPORT_REQUIRED_REACH`

- **Class:** `MANDATORY`
- **Requirement:** requiredReach is the stabilized ceiling of requiredRadius.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-058` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-059 `SUPPORT_REQUIRED_REACH_CAN_EXCEED_6`

- **Class:** `MANDATORY`
- **Requirement:** The proof can represent unsupported reach greater than six.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-059` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-060 `SUPPORT_MARGIN`

- **Class:** `MANDATORY`
- **Requirement:** supportMargin equals selected reach minus requiredRadius.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-060` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-061 `SUPPORT_MARGIN_ADMISSION`

- **Class:** `MANDATORY`
- **Requirement:** Negative support margin is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-061` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-062 `SUPPORT_ENVELOPE_DIGEST`

- **Class:** `MANDATORY`
- **Requirement:** Support-envelope digest includes all normative inputs and identities.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-062` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-063 `SUPPORT_ENVELOPE_REPLAY`

- **Class:** `MANDATORY`
- **Requirement:** Repeated support-envelope construction is byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-063` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-064 `SUPPORT_ENVELOPE_GEOMETRY_SENSITIVE`

- **Class:** `MANDATORY`
- **Requirement:** Changing stage geometry changes the support digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-064` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-065 `SUPPORT_ENVELOPE_POLICY_SENSITIVE`

- **Class:** `MANDATORY`
- **Requirement:** Changing policy footprint scale changes the support digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-065` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-066 `SUPPORT_ENVELOPE_SIGMA_SENSITIVE`

- **Class:** `MANDATORY`
- **Requirement:** Changing sigma changes the support digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-066` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-067 `SUPPORT_ENVELOPE_ROLE_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Preview and Export roles do not affect the support envelope.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-067` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-068 `PLANNER_POLICY_BOUND_INCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** Planner v3 includes policy footprint bound in every stage decision.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-068` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-069 `PLANNER_MAJOR_MINOR_INCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** Planner v3 verifies both major and minor bounds.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-069` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-070 `PLANNER_STAGE_VERIFY_AFTER_CHOICE`

- **Class:** `MANDATORY`
- **Requirement:** Every selected next dimension is reverified by the normative envelope.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-070` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-071 `PLANNER_NO_MAJOR_ONLY_RATIO`

- **Class:** `MANDATORY`
- **Requirement:** Planner does not derive stage ratio from major radius alone.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-071` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-072 `PLANNER_NO_CLIPPED_STAGE`

- **Class:** `MANDATORY`
- **Requirement:** Planner never appends a stage that requires clipped support.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-072` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-073 `PLANNER_UNSATISFIED_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** Unsatisfiable support fails closed.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-073` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-074 `PLANNER_STAGE_LIMIT_32`

- **Class:** `MANDATORY`
- **Requirement:** Planner stage limit remains 32.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-074` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-075 `PLANNER_EXACT_TARGET`

- **Class:** `MANDATORY`
- **Requirement:** Final dimensions equal the requested target exactly.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-075` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-076 `PLANNER_NO_UPSCALE`

- **Class:** `MANDATORY`
- **Requirement:** Upscaling remains rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-076` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-077 `PLANNER_PLAN_DIGEST_SUPPORT`

- **Class:** `MANDATORY`
- **Requirement:** Plan digest includes every stage support-envelope digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-077` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-078 `PLANNER_PLAN_DIGEST_POLICY`

- **Class:** `MANDATORY`
- **Requirement:** Plan digest includes policy identity, digest, and footprint bound.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-078` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-079 `PLANNER_PLAN_DIGEST_ROLE_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Role is excluded from the plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-079` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-080 `PLANNER_PLAN_DIGEST_RESIDUAL_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Residual parameters are excluded from the plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-080` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-081 `PLANNER_PREVIEW_EXPORT_EQUAL`

- **Class:** `MANDATORY`
- **Requirement:** Equal lowpass inputs produce equal Preview and Export plans.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-081` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-082 `PROFILE_R4_REACH`

- **Class:** `MANDATORY`
- **Requirement:** R4 profile reach equals four.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-082` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-083 `PROFILE_R6_REACH`

- **Class:** `MANDATORY`
- **Requirement:** R6 profile reach equals six.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-083` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-084 `PROFILE_R4_GEOMETRY`

- **Class:** `MANDATORY`
- **Requirement:** R4 candidate and tile geometry remains 9x9 and 24x24.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-084` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-085 `PROFILE_R6_GEOMETRY`

- **Class:** `MANDATORY`
- **Requirement:** R6 candidate and tile geometry remains 13x13 and 28x28.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-085` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-086 `PROFILE_SELECT_R4`

- **Class:** `MANDATORY`
- **Requirement:** Required reach at most four selects R4.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-086` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-087 `PROFILE_SELECT_R6`

- **Class:** `MANDATORY`
- **Requirement:** Required reach five or six selects R6.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-087` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-088 `PROFILE_REJECT_GT6`

- **Class:** `MANDATORY`
- **Requirement:** Required reach greater than six is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-088` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-089 `PROFILE_NO_REASON_CONFLATION`

- **Class:** `MANDATORY`
- **Requirement:** Storage and tile-proof failures remain distinct from support failure.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-089` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-090 `PROFILE_TILE_PROOF`

- **Class:** `MANDATORY`
- **Requirement:** Selected profile passes exact phase-aware tile coverage.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-090` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-091 `PROFILE_SUPPORT_RECEIPT`

- **Class:** `MANDATORY`
- **Requirement:** Selected profile receipt contains uncapped radii and support margin.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-091` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-092 `POLICY_SCHEMA_PROPAGATED`

- **Class:** `MANDATORY`
- **Requirement:** Adaptive policy schema ID is propagated to support and dispatch.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-092` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-093 `POLICY_DIGEST_PROPAGATED`

- **Class:** `MANDATORY`
- **Requirement:** Adaptive policy digest is propagated to support and dispatch.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-093` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-094 `POLICY_BOUND_PROPAGATED`

- **Class:** `MANDATORY`
- **Requirement:** Adaptive footprint bound is propagated to support and dispatch.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-094` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-095 `POLICY_TEXTURE_METADATA`

- **Class:** `MANDATORY`
- **Requirement:** Adaptive policy texture carries schema, digest, bound, size, and epoch metadata.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-095` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-096 `POLICY_TEXTURE_METADATA_REQUIRED`

- **Class:** `MANDATORY`
- **Requirement:** A policy texture without metadata is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-096` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-097 `POLICY_BOUND_MISMATCH_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** Request and texture policy-bound mismatch is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-097` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-098 `POLICY_DIGEST_MISMATCH_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** Request and texture policy-digest mismatch is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-098` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-099 `POLICY_FLAG_DISABLED_COHERENCE`

- **Class:** `MANDATORY`
- **Requirement:** Disabled policy binds neutral texture, bound one, and flag zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-099` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-100 `POLICY_FLAG_ENABLED_COHERENCE`

- **Class:** `MANDATORY`
- **Requirement:** Enabled policy binds admitted texture, normalized bound, and flag one.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-100` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-101 `POLICY_ANISOTROPY_AUTHORITY`

- **Class:** `MANDATORY`
- **Requirement:** Policy maxAnisotropy, when present, equals the shader-visible canonical value.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-101` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-102 `POLICY_ANISOTROPY_MISMATCH_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** A policy and lowpass maxAnisotropy mismatch is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-102` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-103 `NEUTRAL_POLICY_VALUE`

- **Class:** `MANDATORY`
- **Requirement:** Neutral policy tuple equals vec4(0,1,1,1).
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-103` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-104 `NEUTRAL_POLICY_WRITE_EXACT_ONE`

- **Class:** `MANDATORY`
- **Requirement:** Neutral policy texture receives exactly one initialization write per bundle.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-104` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-105 `NEUTRAL_POLICY_RECEIPT`

- **Class:** `MANDATORY`
- **Requirement:** Neutral policy initialization has a deterministic receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-105` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-106 `NEUTRAL_POLICY_EPOCH`

- **Class:** `MANDATORY`
- **Requirement:** Neutral policy texture metadata matches current device epoch.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-106` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-107 `NEUTRAL_POLICY_UNINITIALIZED_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** An unwritten neutral policy texture cannot be bound.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-107` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-108 `R8_GENERATOR_ID`

- **Class:** `MANDATORY`
- **Requirement:** Generated-source identity equals tdt.ewa.wgsl-generator.r8.v1.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-108` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-109 `R8_MANIFEST_ID`

- **Class:** `MANDATORY`
- **Requirement:** Generated manifest identity equals tdt.ewa.generated-manifest.r8.v1.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-109` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-110 `R8_OUTPUT_PRODUCT_R4`

- **Class:** `MANDATORY`
- **Requirement:** R8 generator emits the versioned R4 product shader.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-110` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-111 `R8_OUTPUT_PRODUCT_R6`

- **Class:** `MANDATORY`
- **Requirement:** R8 generator emits the versioned R6 product shader.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-111` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-112 `R8_OUTPUT_VALIDATION_R4`

- **Class:** `MANDATORY`
- **Requirement:** R8 generator emits the versioned R4 validation shader.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-112` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-113 `R8_OUTPUT_VALIDATION_R6`

- **Class:** `MANDATORY`
- **Requirement:** R8 generator emits the versioned R6 validation shader.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-113` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-114 `R8_OUTPUT_REFERENCE`

- **Class:** `MANDATORY`
- **Requirement:** R8 generator emits the versioned direct reference shader.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-114` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-115 `R8_GENERATED_DIGESTS`

- **Class:** `MANDATORY`
- **Requirement:** Every generated output digest is recorded and verified.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-115` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-116 `R8_NO_MANUAL_GENERATED_EDIT`

- **Class:** `MANDATORY`
- **Requirement:** Manual mutation of any generated output is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-116` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-117 `SHADER_ABI_V4`

- **Class:** `MANDATORY`
- **Requirement:** R8 shaders retain the 96-byte v4 ABI.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-117` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-118 `SHADER_COORDINATE_R4`

- **Class:** `MANDATORY`
- **Requirement:** R8 shaders retain the R4 pixel-center coordinate convention.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-118` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-119 `SHADER_AXIAL_R5`

- **Class:** `MANDATORY`
- **Requirement:** R8 shaders retain R5 double-angle axial interpolation.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-119` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-120 `SHADER_WEIGHT_R6`

- **Class:** `MANDATORY`
- **Requirement:** R8 shaders retain the R6 radial and taper formula.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-120` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-121 `SHADER_BORDER_LOGICAL_DISTANCE`

- **Class:** `MANDATORY`
- **Requirement:** R8 shaders retain logical-distance clamp extension.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-121` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-122 `SHADER_MAJOR_NO_MIN_REACH`

- **Class:** `MANDATORY`
- **Requirement:** Canonical R8 source contains no major-radius reach clamp.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-122` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-123 `SHADER_MINOR_NO_MIN_REACH`

- **Class:** `MANDATORY`
- **Requirement:** Canonical R8 source contains no minor-radius reach clamp.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-123` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-124 `SHADER_SUPPORT_ASSERT`

- **Class:** `MANDATORY`
- **Requirement:** Product and reference assert per-pixel radii against profile reach.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-124` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-125 `SHADER_SUPPORT_FAULT`

- **Class:** `MANDATORY`
- **Requirement:** Support assertion failure writes the deterministic R8 fault value.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-125` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-126 `SHADER_WEIGHT_SUM_FINITE`

- **Class:** `MANDATORY`
- **Requirement:** Product and reference require finite weightSum.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-126` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-127 `SHADER_WEIGHT_SUM_POSITIVE`

- **Class:** `MANDATORY`
- **Requirement:** Product and reference require weightSum greater than EPS.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-127` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-128 `SHADER_ACCUMULATED_FINITE`

- **Class:** `MANDATORY`
- **Requirement:** Product and reference require finite accumulated RGBA.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-128` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-129 `SHADER_CENTER_FALLBACK_ABSENT`

- **Class:** `MANDATORY`
- **Requirement:** Canonical R8 shaders contain no center-sample weight fallback.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-129` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-130 `SHADER_FAULT_VALUE_COMMON`

- **Class:** `MANDATORY`
- **Requirement:** Product, validation, reference, and diagnostic finalization share one fault identity.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-130` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-131 `SHADER_PRODUCT_TILED`

- **Class:** `MANDATORY`
- **Requirement:** Product retains strict workgroup-tiled source access.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-131` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-132 `SHADER_REFERENCE_DIRECT`

- **Class:** `MANDATORY`
- **Requirement:** Reference retains independent direct textureLoad access.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-132` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-133 `SHADER_REFERENCE_NOT_PRODUCT`

- **Class:** `MANDATORY`
- **Requirement:** Reference shader cannot be selected as product.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-133` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-134 `VALIDATION_SCHEMA_VERSIONED`

- **Class:** `MANDATORY`
- **Requirement:** R8 validation-buffer schema is versioned.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-134` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-135 `VALIDATION_SUPPORT_COUNTER`

- **Class:** `MANDATORY`
- **Requirement:** Validation independently counts support exceedance.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-135` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-136 `VALIDATION_WEIGHT_ZERO_COUNTER`

- **Class:** `MANDATORY`
- **Requirement:** Validation independently counts zero weight mass.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-136` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-137 `VALIDATION_WEIGHT_NONFINITE_COUNTER`

- **Class:** `MANDATORY`
- **Requirement:** Validation independently counts nonfinite weight mass.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-137` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-138 `VALIDATION_ACCUM_NONFINITE_COUNTER`

- **Class:** `MANDATORY`
- **Requirement:** Validation independently counts nonfinite accumulation.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-138` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-139 `VALIDATION_SOURCE_NONFINITE_COUNTER`

- **Class:** `MANDATORY`
- **Requirement:** Validation independently counts nonfinite source samples.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-139` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-140 `VALIDATION_OUT_OF_TILE_COUNTER`

- **Class:** `MANDATORY`
- **Requirement:** Validation independently counts out-of-tile attempts.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-140` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-141 `VALIDATION_BORDER_COUNTERS`

- **Class:** `MANDATORY`
- **Requirement:** Validation distinguishes logical border taps and physical clamps.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-141` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-142 `VALIDATION_RADIUS_CLAMP_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Validation radiusClampCount is structurally zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-142` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-143 `VALIDATION_CENTER_FALLBACK_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Validation centerFallbackCount is structurally zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-143` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-144 `SOURCE_SEMANTIC_FIELDS`

- **Class:** `MANDATORY`
- **Requirement:** Canonical request has explicit source transfer and alpha fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-144` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-145 `SOURCE_SEMANTIC_UNKNOWN_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** Unknown source transfer or alpha mode is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-145` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-146 `SOURCE_INTERNAL_LINEAR`

- **Class:** `MANDATORY`
- **Requirement:** Canonical lowpass input transfer is linear.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-146` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-147 `SOURCE_INTERNAL_PREMULTIPLIED`

- **Class:** `MANDATORY`
- **Requirement:** Canonical lowpass input alpha mode is premultiplied.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-147` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-148 `SOURCE_INTERNAL_RGBA16`

- **Class:** `MANDATORY`
- **Requirement:** Prepared canonical source format is rgba16float.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-148` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-149 `SOURCE_PREPARE_IDENTITY`

- **Class:** `MANDATORY`
- **Requirement:** Already-linear-premultiplied rgba16float uses zero-dispatch identity preparation.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-149` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-150 `SOURCE_PREPARE_LINEAR_STRAIGHT`

- **Class:** `MANDATORY`
- **Requirement:** Linear straight input is premultiplied on GPU.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-150` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-151 `SOURCE_PREPARE_SRGB_STRAIGHT`

- **Class:** `MANDATORY`
- **Requirement:** sRGB straight input is decoded and premultiplied on GPU.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-151` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-152 `SOURCE_PREPARE_SRGB_PREMULT`

- **Class:** `MANDATORY`
- **Requirement:** sRGB premultiplied input is unpremultiplied in encoded domain, decoded, and re-premultiplied.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-152` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-153 `SOURCE_PREPARE_SRGB_DECODE_FORMULA`

- **Class:** `MANDATORY`
- **Requirement:** Source preparation uses the canonical piecewise sRGB decode equation.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-153` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-154 `SOURCE_PREPARE_ALPHA_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Source prepare zeros RGB when alpha is at or below epsilon.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-154` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-155 `SOURCE_PREPARE_NO_DOUBLE_PREMULT`

- **Class:** `MANDATORY`
- **Requirement:** Premultiplied input is not multiplied a second time.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-155` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-156 `SOURCE_PREPARE_NO_MISSING_PREMULT`

- **Class:** `MANDATORY`
- **Requirement:** Straight input cannot enter lowpass without premultiplication.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-156` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-157 `SOURCE_PREPARE_GPU_ONLY`

- **Class:** `MANDATORY`
- **Requirement:** All nonidentity source preparation executes on WebGPU.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-157` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-158 `SOURCE_PREPARE_CPU_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** CPU source-preparation count is zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-158` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-159 `SOURCE_PREPARE_READBACK_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Source preparation introduces no readback.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-159` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-160 `SOURCE_PREPARE_RECEIPT`

- **Class:** `MANDATORY`
- **Requirement:** Source preparation emits the normative semantic receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-160` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-161 `SOURCE_PREPARE_OWNERSHIP`

- **Class:** `MANDATORY`
- **Requirement:** Prepared texture ownership is explicit and single-disposal.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-161` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-162 `SOURCE_PREPARE_EPOCH`

- **Class:** `MANDATORY`
- **Requirement:** Prepared texture metadata is bound to current device epoch.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-162` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-163 `EXPORT_SOURCE_DEFAULT_SRGB`

- **Class:** `MANDATORY`
- **Requirement:** Raw Export bytes default to sRGB source transfer.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-163` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-164 `EXPORT_SOURCE_DEFAULT_STRAIGHT`

- **Class:** `MANDATORY`
- **Requirement:** Raw Export bytes default to straight source alpha.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-164` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-165 `EXPORT_OUTPUT_DEFAULT_SRGB`

- **Class:** `MANDATORY`
- **Requirement:** Export output defaults to sRGB transfer.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-165` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-166 `EXPORT_OUTPUT_DEFAULT_STRAIGHT`

- **Class:** `MANDATORY`
- **Requirement:** Export output defaults to straight alpha.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-166` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-167 `EXPORT_ALPHA_MODE_ALIAS_OUTPUT_ONLY`

- **Class:** `MANDATORY`
- **Requirement:** Legacy alphaMode maps only to outputAlphaMode.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-167` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-168 `EXPORT_SOURCE_PREMULT_EXPLICIT`

- **Class:** `MANDATORY`
- **Requirement:** Premultiplied byte input requires explicit sourceAlphaMode.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-168` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-169 `PREVIEW_SOURCE_SEMANTIC_REQUIRED`

- **Class:** `MANDATORY`
- **Requirement:** Preview source texture must supply explicit semantic metadata or facade authority.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-169` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-170 `LOWPASS_PREMULT_ACCUMULATION`

- **Class:** `MANDATORY`
- **Requirement:** Lowpass accumulates premultiplied RGB and alpha with identical weights.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-170` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-171 `LOWPASS_INTERMEDIATE_UNPREMULT_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** No lowpass stage unpremultiplies.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-171` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-172 `LOWPASS_OUTPUT_SEMANTIC`

- **Class:** `MANDATORY`
- **Requirement:** Every stage output carries the canonical internal surface semantic.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-172` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-173 `LOWPASS_ALPHA_FINITE`

- **Class:** `MANDATORY`
- **Requirement:** Admitted lowpass alpha remains finite.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-173` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-174 `LOWPASS_ALPHA_RANGE`

- **Class:** `MANDATORY`
- **Requirement:** SDR fixture alpha remains within the admitted zero-to-one range.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-174` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-175 `BORDER_DELTA_LOGICAL`

- **Class:** `MANDATORY`
- **Requirement:** Border ellipse distance uses logical sample coordinates.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-175` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-176 `BORDER_FETCH_CLAMP_ONLY`

- **Class:** `MANDATORY`
- **Requirement:** Only the physical fetch coordinate is clamped.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-176` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-177 `BORDER_NO_TAP_DEDUP`

- **Class:** `MANDATORY`
- **Requirement:** Logical taps are not deduplicated by clamped physical coordinate.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-177` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-178 `BORDER_COMPLETE_WEIGHT_MASS`

- **Class:** `MANDATORY`
- **Requirement:** All admitted border taps contribute to weightSum.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-178` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-179 `BORDER_ONE_BY_ONE`

- **Class:** `MANDATORY`
- **Requirement:** 1x1 fixture preserves the constant source.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-179` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-180 `BORDER_ONE_BY_N`

- **Class:** `MANDATORY`
- **Requirement:** 1xN fixtures preserve constant fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-180` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-181 `BORDER_N_BY_ONE`

- **Class:** `MANDATORY`
- **Requirement:** Nx1 fixtures preserve constant fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-181` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-182 `BORDER_CORNER_PHASES`

- **Class:** `MANDATORY`
- **Requirement:** Corner fixtures cover all canonical fractional phases.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-182` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-183 `BORDER_PARTIAL_WORKGROUP`

- **Class:** `MANDATORY`
- **Requirement:** Partial workgroups preserve border mass.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-183` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-184 `DC_ORACLE_INDEPENDENT`

- **Class:** `MANDATORY`
- **Requirement:** DC oracle is independent from runtime product implementation.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-184` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-185 `DC_ORACLE_BINARY64`

- **Class:** `MANDATORY`
- **Requirement:** DC oracle evaluates weights in binary64.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-185` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-186 `DC_CONSTANT_TRANSPARENT`

- **Class:** `MANDATORY`
- **Requirement:** Transparent constant fixture is conserved.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-186` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-187 `DC_CONSTANT_OPAQUE`

- **Class:** `MANDATORY`
- **Requirement:** Opaque constant fixtures are conserved.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-187` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-188 `DC_CONSTANT_PARTIAL_ALPHA`

- **Class:** `MANDATORY`
- **Requirement:** Partial-alpha premultiplied constants are conserved.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-188` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-189 `DC_R4_PROFILE`

- **Class:** `MANDATORY`
- **Requirement:** DC fixtures cover R4 profile.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-189` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-190 `DC_R6_PROFILE`

- **Class:** `MANDATORY`
- **Requirement:** DC fixtures cover R6 profile.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-190` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-191 `DC_POLICY_SCALES`

- **Class:** `MANDATORY`
- **Requirement:** DC fixtures cover policy scales 0.75, 1, and 1.5.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-191` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-192 `DC_ANISOTROPY_FIELDS`

- **Class:** `MANDATORY`
- **Requirement:** DC fixtures cover neutral and directional axial fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-192` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-193 `DC_FRACTIONAL_PHASES`

- **Class:** `MANDATORY`
- **Requirement:** DC fixtures cover the R3 fractional-phase set.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-193` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-194 `DC_MULTISTAGE`

- **Class:** `MANDATORY`
- **Requirement:** DC fixtures cover multistage plans.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-194` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-195 `DC_PREVIEW_EXPORT_EQUAL`

- **Class:** `MANDATORY`
- **Requirement:** Preview and Export lowpass DC receipts agree for equal fixtures.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-195` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-196 `ALPHA_HIDDEN_RGB_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Zero-alpha hostile hidden RGB does not enter the canonical lowpass surface.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-196` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-197 `ALPHA_STRAIGHT_COLOR_VARIANT`

- **Class:** `MANDATORY`
- **Requirement:** Constant straight color with varying alpha follows premultiplied preparation truth.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-197` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-198 `ALPHA_EPSILON_BOUNDARIES`

- **Class:** `MANDATORY`
- **Requirement:** Fixtures cover values below, at, and above alpha epsilon.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-198` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-199 `ALPHA_BORDER_TRANSITIONS`

- **Class:** `MANDATORY`
- **Requirement:** Alpha edge and corner transitions are covered.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-199` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-200 `RESIDUAL_ALPHA_IDENTITY`

- **Class:** `MANDATORY`
- **Requirement:** Residual output alpha equals lowpass alpha.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-200` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-201 `RESIDUAL_RGB_ONLY`

- **Class:** `MANDATORY`
- **Requirement:** Residual accumulation and recomposition are RGB-only.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-201` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-202 `RESIDUAL_ZERO_ALPHA_RGB_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Residual writes zero RGB at zero alpha.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-202` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-203 `RESIDUAL_CONSTANT_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Residual is zero for a constant field.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-203` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-204 `RESIDUAL_NO_FEEDBACK`

- **Class:** `MANDATORY`
- **Requirement:** Residual still cannot feed another lowpass stage.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-204` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-205 `FINALIZE_INPUT_LINEAR_PREMULT`

- **Class:** `MANDATORY`
- **Requirement:** Finalization requires linear premultiplied input semantics.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-205` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-206 `FINALIZE_OUTPUT_FIELDS_EXPLICIT`

- **Class:** `MANDATORY`
- **Requirement:** Finalization receives explicit output transfer and alpha mode.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-206` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-207 `FINALIZE_STRAIGHT_UNPREMULT`

- **Class:** `MANDATORY`
- **Requirement:** Straight output unpremultiplies only at the terminal boundary.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-207` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-208 `FINALIZE_PREMULT_ORDER`

- **Class:** `MANDATORY`
- **Requirement:** Premultiplied encoded output applies transfer to straight RGB before multiplying alpha.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-208` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-209 `FINALIZE_SRGB_ENCODE_FORMULA`

- **Class:** `MANDATORY`
- **Requirement:** Finalization uses the canonical piecewise sRGB encode equation.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-209` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-210 `FINALIZE_ALPHA_NOT_TRANSFERRED`

- **Class:** `MANDATORY`
- **Requirement:** Alpha is not transfer-encoded.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-210` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-211 `FINALIZE_ALPHA_ZERO_RGB_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Terminal straight output zeros RGB at zero alpha.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-211` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-212 `FINALIZE_FAULT_DIAGNOSTIC`

- **Class:** `MANDATORY`
- **Requirement:** R8 fault sentinel is detected rather than silently clamped into ordinary output.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-212` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-213 `SUPPORT_RECEIPT_COMPLETE`

- **Class:** `MANDATORY`
- **Requirement:** Every stage receipt contains all normative uncapped support fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-213` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-214 `SOURCE_RECEIPT_COMPLETE`

- **Class:** `MANDATORY`
- **Requirement:** Source semantic receipt contains all normative conversion fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-214` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-215 `CONSERVATION_RECEIPT_SEPARATE`

- **Class:** `MANDATORY`
- **Requirement:** Support, border, DC, alpha, residual, and finalization proofs are separate.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-215` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-216 `DEGRADATION_RECEIPT_COMPLETE`

- **Class:** `MANDATORY`
- **Requirement:** Zero-degradation receipt records every forbidden counter.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-216` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-217 `TELEMETRY_FORBIDDEN_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** All forbidden source and mock telemetry counters are zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-217` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-218 `ACTIVE_GRAPH_PLANNER_R8`

- **Class:** `MANDATORY`
- **Requirement:** Planner v3 is admitted by Active Graph.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-218` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-219 `ACTIVE_GRAPH_SUPPORT_R8`

- **Class:** `MANDATORY`
- **Requirement:** Support-envelope runtime is admitted by Active Graph.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-219` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-220 `ACTIVE_GRAPH_PRODUCT_R8`

- **Class:** `MANDATORY`
- **Requirement:** R8 generated product shaders and manifest are admitted.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-220` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-221 `ACTIVE_GRAPH_SOURCE_PREPARE_R8`

- **Class:** `MANDATORY`
- **Requirement:** R8 source-prepare runtime and shader are admitted.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-221` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-222 `ACTIVE_GRAPH_RESIDUAL_FINALIZE_R8`

- **Class:** `MANDATORY`
- **Requirement:** R8 residual and finalization assets are admitted.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-222` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-223 `ACTIVE_GRAPH_TOOLS_EXCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** R8 oracles, generators, fixtures, and negatives remain outside runtime graph.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-223` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-224 `NO_CPU_RESAMPLE_FALLBACK`

- **Class:** `MANDATORY`
- **Requirement:** No CPU resampling fallback is reachable.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-224` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-225 `NO_CPU_ALPHA_FALLBACK`

- **Class:** `MANDATORY`
- **Requirement:** No CPU premultiply or transfer conversion is reachable.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-225` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-226 `NO_CANVAS_WEBGL_FALLBACK`

- **Class:** `MANDATORY`
- **Requirement:** No Canvas or WebGL conversion or resampling fallback is reachable.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-226` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-227 `NO_LEGACY_PRODUCT_FALLBACK`

- **Class:** `MANDATORY`
- **Requirement:** Legacy product and legacy Export lowpass cannot be selected canonically.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-227` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-228 `NEGATIVE_RADIUS_CLAMP_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** A shader radius-clamp negative control is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-228` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-229 `NEGATIVE_HOST_CLIP_PROOF_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** A host proof that clips before ceiling is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-229` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-230 `NEGATIVE_MINOR_ROOT_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** The incorrect minor/sqrt(maxAnisotropy) bound is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-230` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-231 `NEGATIVE_POLICY_OMISSION_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Planner omission of policy footprint bound is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-231` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-232 `NEGATIVE_POLICY_GUESS_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** A guessed policy bound is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-232` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-233 `NEGATIVE_NEUTRAL_UNINIT_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** An uninitialized neutral policy is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-233` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-234 `NEGATIVE_SHRINK_CAP_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** A planner-only shrinkClamp cap is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-234` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-235 `NEGATIVE_CENTER_FALLBACK_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Center-sample fallback is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-235` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-236 `NEGATIVE_BORDER_DISTANCE_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Distance computed from clamped fetch coordinates is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-236` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-237 `NEGATIVE_BORDER_DEDUP_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Border-tap deduplication is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-237` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-238 `NEGATIVE_MISSING_PREMULT_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Straight input entering lowpass without premultiply is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-238` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-239 `NEGATIVE_DOUBLE_PREMULT_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Double premultiplication is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-239` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-240 `NEGATIVE_CPU_PREPARE_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** CPU source preparation is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-240` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-241 `NEGATIVE_RESIDUAL_ALPHA_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Residual alpha mutation is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-241` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-242 `NEGATIVE_INTERMEDIATE_UNPREMULT_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Intermediate unpremultiply is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-242` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-243 `NEGATIVE_FAULT_CLAMP_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Fault sentinel silently clamped into ordinary output is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-243` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-244 `DETERMINISTIC_FIXTURES`

- **Class:** `MANDATORY`
- **Requirement:** Fixture generation is byte-deterministic.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-244` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-245 `DETERMINISTIC_GENERATED_SOURCE`

- **Class:** `MANDATORY`
- **Requirement:** Generated R8 WGSL and manifest are byte-deterministic.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-245` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-246 `DETERMINISTIC_RECEIPTS`

- **Class:** `MANDATORY`
- **Requirement:** Source receipts contain no volatile fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-246` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-247 `RESOURCE_DESTROY_ONCE`

- **Class:** `MANDATORY`
- **Requirement:** Mock lifecycle records exact single disposal for R8-owned textures.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-247` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-248 `PREDECESSOR_R1A_R7_REGRESSION`

- **Class:** `MANDATORY`
- **Requirement:** R1A through R7 gates pass in isolated predecessor snapshots.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-248` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-249 `SOURCE_GATE_RECEIPT_COMPLETE`

- **Class:** `MANDATORY`
- **Requirement:** The source gate receipt contains every mandatory result.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-249` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-250 `FINAL_STATE_CORRECT`

- **Class:** `MANDATORY`
- **Requirement:** Final source state equals the specified R8 source-verified state.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-250` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-251 `PHYSICAL_WGSL_COMPILE`

- **Class:** `DEFERRED`
- **Requirement:** R8 generated, source-prepare, residual, and finalization WGSL compile on physical WebGPU.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-251` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-252 `PHYSICAL_PRODUCT_REFERENCE_PARITY`

- **Class:** `DEFERRED`
- **Requirement:** R8 tiled product and direct reference match on physical GPU.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-252` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-253 `PHYSICAL_SUPPORT_VALIDATION_COUNTERS`

- **Class:** `DEFERRED`
- **Requirement:** Physical validation readback reports zero support and weight faults for admitted fixtures.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-253` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-254 `PHYSICAL_DC_ALPHA_BORDER_ULP`

- **Class:** `DEFERRED`
- **Requirement:** Physical DC, alpha, and border fixtures satisfy the R9 half-float ULP thresholds.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-254` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-255 `PHYSICAL_TIMESTAMP_MEMORY_DEVICE_LOSS`

- **Class:** `DEFERRED`
- **Requirement:** Physical timing, memory plateau, and device-loss recovery satisfy R9.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-255` shall record status, evidence paths, observed values, and stable error code when applicable.

## R8-256 `PACKAGED_ELECTRON_IDENTITY`

- **Class:** `DEFERRED`
- **Requirement:** Packaged Electron contains and executes the admitted R8 assets.
- **PASS:** Deterministic evidence satisfies the requirement without fallback, clipping, guessing, or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R8-256` shall record status, evidence paths, observed values, and stable error code when applicable.

---

# 37. Final Acceptance Contract

R8 source acceptance requires:

```text
mandatory gate count = 250
mandatory PASS       = 250
mandatory FAIL       = 0
deferred gate count  = 6
Production Pointer   = unchanged
```

The final receipt shall state:

```text
RESAMPLE_RUNTIME_R8_CONSERVATION_AND_ZERO_DEGRADATION_SEALED_AWAITING_R9
```

It shall also state explicitly:

```text
physical WebGPU parity not yet promoted
physical DC and alpha ULP thresholds not yet promoted
validation counters not yet read from a physical adapter
packaged Electron identity not yet promoted
```

Acceptance means that the source graph no longer admits a clipped ellipse, guessed policy bound, uninitialized neutral policy, center fallback, ambiguous source alpha, CPU pixel conversion, residual alpha mutation, or border-mass collapse. It does not mean hardware execution has been promoted.

---

# 38. Compact Implementation Checklist

```text
[ ] Verify the R7 parent ZIP digest.
[ ] Freeze R7 convergence and R6/R5/R4 mathematical evidence.
[ ] Add support-envelope r8 with uncapped major and minor bounds.
[ ] Correct the minor bound to use neutral anisotropy.
[ ] Include adaptive policy footprint bound in planner v3.
[ ] Reject sigmaMain greater than shrinkClamp.
[ ] Add R8 profile selection from uncapped required reach.
[ ] Generate R8 product, validation, and direct-reference WGSL.
[ ] Remove radius clamps from canonical shaders.
[ ] Remove center-sample weight fallback.
[ ] Add deterministic shader fault identity and validation counters.
[ ] Initialize neutral policy to vec4(0,1,1,1).
[ ] Couple policy texture metadata to policy digest and bound.
[ ] Add explicit source transfer and alpha semantics.
[ ] Add GPU source preparation to linear premultiplied rgba16float.
[ ] Separate sourceAlphaMode and outputAlphaMode.
[ ] Make legacy alphaMode output-only.
[ ] Preserve lowpass premultiplied alpha through all stages.
[ ] Make residual RGB-only and alpha-identity.
[ ] Keep unpremultiply and transfer conversion terminal-only.
[ ] Add independent support, border, DC, and alpha oracles.
[ ] Add all negative controls.
[ ] Update Active Graph and runtime asset manifests.
[ ] Run R1A through R7 regression in isolated snapshots.
[ ] Issue 250 PASS / 6 DEFERRED / 0 FAIL source receipt.
[ ] Do not move Production Pointer.
```

---

# 39. Next Authority

The next patch authority is:

```text
TDT-RESAMPLE-RUNTIME-01-R9

Physical GPU Oracle·Parity /
Validation Counter Readback /
Timestamp·Residency Plateau /
Device-Loss Recovery /
Packaged Electron Execution Seal
```

R9 shall consume the R8 unclipped, premultiplied, border-conservative canonical graph. It shall not reintroduce radius clamps, center fallbacks, CPU pixel conversion, or split Preview/Export lowpass authority.
