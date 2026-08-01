# TDT-RESAMPLE-RUNTIME-01-R5

## Axial Tensor Interpolation / Subpixel Direction Continuity / Double-Angle Field Sampling / Coherence·Edge Phase Continuity Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R5`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R4`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R4_CONTINUOUS_SOURCE_LATTICE_EXACT_SAMPLE_DISTANCE_FRACTIONAL_PHASE_PRODUCT_REFERENCE_REPAIR_PHASE_AWARE_SHARED_TILE_COVERAGE_BAKED_AWAITING_PHYSICAL_GPU.zip`
- **Parent repository bundle SHA-256:** `5df4a248dd14947eca9ab275f824a8e670c423e0ab7dd8f1fe74c7086a5c6d9c`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R4_PHASE_CORRECT_PRODUCT_REFERENCE_REPAIRED_AWAITING_R5`
- **Target source state:** `RESAMPLE_RUNTIME_R5_AXIAL_FIELD_INTERPOLATION_SOURCE_BAKED_AWAITING_PHYSICAL_GPU`
- **Target source-verified state:** `RESAMPLE_RUNTIME_R5_AXIAL_SUBPIXEL_CONTINUITY_SEALED_AWAITING_R6`
- **Physical GPU state:** `RESAMPLE_RUNTIME_R5_PHYSICAL_GPU_EVIDENCE_DEFERRED_TO_R9`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Canonical source runtime mutation:** required and versioned
- **Parent R4 shader mutation:** forbidden
- **Parent R3 oracle mutation:** forbidden
- **Public EWA facade mutation:** forbidden
- **Parameter ABI mutation:** forbidden
- **Canonical EWA parameter ABI:** `tdt.delta-k-ewa.params.v3`
- **Canonical EWA parameter byte size:** `80`
- **Canonical tensor producer ABI:** `tdt.structure-tensor.params.v1`
- **Canonical tensor producer parameter byte size:** `64`
- **Canonical source coordinate convention:** `tdt.ewa.source-lattice.pixel-center-v2`
- **Canonical R4 product coordinate identity:** `tdt.ewa.product-coordinate.phase-correct-r4.v1`
- **Canonical R4 tile proof identity:** `tdt.ewa.tile-coverage.phase-aware-r4.v1`
- **Canonical tangent field semantic:** `tdt.analysis.tensor.tangent-coherence-edge.r1c.v1`
- **R5 internal axial field semantic:** `tdt.structure-tensor.axial-coherence-edge.r5.v1`
- **R5 axial representation identity:** `tdt.axial.double-angle.algebraic-v1`
- **R5 interpolation identity:** `tdt.ewa.axial-bilinear.coherence-weighted-r5.v1`
- **R5 reconstruction identity:** `tdt.ewa.axial-half-angle.canonical-r5.v1`
- **R5 effective coherence identity:** `tdt.ewa.axial-agreement-magnitude-r5.v1`
- **Canonical ellipse weight identity:** `tdt.ewa.ellipse.radial-v1`
- **Primary runtime:** WebGPU/WGSL
- **Independent R5 oracle runtime:** Node.js validation realm only
- **Runtime CPU tensor interpolation fallback:** forbidden
- **Runtime tangent-vector bilinear interpolation:** forbidden
- **Runtime direct-load reference fallback:** forbidden
- **WebGL resample fallback:** forbidden
- **Canvas resample fallback:** forbidden
- **Physical GPU parity claim in source-only bake:** forbidden
- **Packaged Electron claim in source-only bake:** forbidden

---

# 0. Executive Contract

R5 shall repair the remaining stage-local orientation discontinuity left intentionally outside R4.

R4 repaired the EWA source sample lattice. The EWA center `p`, candidate base, candidate coordinate, sample distance, border fetch coordinate, and shared-tile coverage now belong to one continuous source-pixel convention. R4 did not repair how the structure tensor is sampled. The canonical R4 product and reference still select one tensor texel with:

```text
base = floor(p)
tensor = textureLoad(tensorTex, clamp(base))
```

That nearest-texel choice makes ellipse direction, coherence, and edge strength piecewise constant inside every source texel. The EWA sample lattice moves continuously while the ellipse field jumps at source-texel boundaries.

A direct bilinear interpolation of the stored tangent vector is not admissible. Structure-tensor orientation is axial, not directed. Tangent `t` and tangent `-t` describe the same ellipse axis. Signed-vector interpolation can therefore cancel equivalent axes or rotate across the wrong branch.

R5 shall introduce an internal stage-local axial tensor field and consume it at the exact continuous source position `p`.

The authoritative conversion from a normalized tangent `t = (tx, ty)` is:

```text
q = (tx² - ty², 2 tx ty)
```

For `t = (cos θ, sin θ)`, this is:

```text
q = (cos 2θ, sin 2θ)
```

The representation is sign invariant:

```text
axial(t) = axial(-t)
```

The R5 axial field channel contract is:

```text
R = cos(2θ)
G = sin(2θ)
B = source coherence
A = source edge strength
format = rgba16float
coordinate space = stage source pixel
```

R5 shall manually sample the four neighboring axial texels around `p` using `textureLoad`. It shall not depend on filterable-float support or a linear sampler.

For the four neighbors `i ∈ {00, 10, 01, 11}` with bilinear spatial weights `βᵢ`, normalized axial vectors `qᵢ`, coherence values `cᵢ`, and edge values `eᵢ`, the authoritative interpolation is:

```text
axialAccumulator = Σ βᵢ cᵢ qᵢ
coherenceMass    = Σ βᵢ cᵢ
edgeInterpolated = Σ βᵢ eᵢ
axialMagnitude   = length(axialAccumulator)
```

If `axialMagnitude` is greater than the R5 normalization epsilon:

```text
qInterpolated       = axialAccumulator / axialMagnitude
coherenceEffective  = clamp(axialMagnitude, 0, 1)
```

Otherwise:

```text
qInterpolated       = (1, 0)
coherenceEffective  = 0
```

The magnitude is the effective coherence because it contains both source coherence mass and doubled-angle phase agreement. Equivalent axes reinforce. Conflicting axes cancel. A cancellation shall reduce anisotropy to identity instead of inventing an intermediate directed vector.

The edge field shall be spatially bilinear and independent of tangent sign. Edge strength alone shall not create anisotropy because the ellipse gate continues to multiply effective coherence.

The canonical tangent reconstructed from a normalized doubled-angle vector `q = (qx, qy)` is:

```text
tx = sqrt(max(0, (1 + qx) / 2))

if tx > epsilon:
    ty = qy / (2 tx)
    t  = normalize(tx, ty)
else:
    t  = (0, 1)
```

The reconstruction shall choose the canonical half-plane `tx >= 0`, with the exact vertical fallback `(0, 1)`. Product WGSL shall not use `atan2`, `acos`, `asin`, `sin`, or `cos` for axial reconstruction.

R5 shall preserve all R4 source-lattice and tile-coverage behavior. R5 shall not change the EWA parameter ABI, kernel sharpness literal, support planner, source candidate lattice, source tile dimensions, or public facade. R6 remains responsible for kernel parameter ABI unification.

R5 shall prove all of the following:

1. R4 coordinate and tile identities remain unchanged.
2. The R4 product, validation, and reference shaders remain byte-identical predecessor evidence.
3. The existing tangent-coherence-edge field remains available with its existing semantic and channel contract.
4. A separate versioned axial-coherence-edge field is produced on the GPU.
5. The axial conversion is algebraic and sign invariant.
6. The R5 EWA product consumes the axial field rather than the tangent field.
7. The exact EWA source position `p` is also the tensor interpolation position.
8. Four explicit texture loads implement the tensor interpolation.
9. Border clamping affects only neighbor fetch coordinates, not the fractional interpolation weights.
10. Spatial bilinear weights sum to one under finite input.
11. Axial vectors are normalized before accumulation.
12. Coherence weights the doubled-angle accumulator.
13. Effective coherence includes angular agreement through accumulator magnitude.
14. Edge strength is spatially bilinear.
15. Equivalent `t` and `-t` neighborhoods produce the same result.
16. The `+89°/-89°` seam stays near the vertical axis instead of flipping through horizontal.
17. Orthogonal axial cancellation produces exact isotropic identity.
18. Constant axial fields are reproduced at every fractional phase.
19. The ellipse is continuous across source-texel boundaries except at a zero-coherence degeneracy where orientation is physically irrelevant.
20. Product and direct-load reference use the same mathematical contract but remain separate shader assets and separate memory-access implementations.
21. Validation shaders expose invalid axial records, normalization fallback, cancellation, and nonfinite counters.
22. An independent binary64 oracle validates conversion, interpolation, reconstruction, and invariants.
23. The oracle remains outside renderer, worker, Preview, Export, and packaged graphs.
24. No CPU, Canvas, WebGL, tangent-vector bilinear, or reference-as-product fallback is introduced.
25. No Production Pointer is moved.
26. Source-only receipts do not claim physical GPU execution.
27. R6 remains responsible for `kernelSharpness`, taper, border ABI, and generated kernel-source identity.

The intended transition is:

```text
R4 continuous source lattice repaired
    ↓
R5 stage-local tangent field preserved
    ↓
R5 GPU axial field derived
    ↓
R5 four-tap coherence-weighted doubled-angle interpolation at p
    ↓
R5 canonical half-angle reconstruction
    ↓
R5 product/reference source and mock verification
    ↓
physical GPU proof remains deferred to R9
```

R5 is a field-semantics repair patch. It is not a production promotion patch.

---

# 1. Parent Truth and Frozen Evidence

## 1.1 Parent bundle identity

The only admitted R5 parent is:

```text
61_TDT_RESAMPLE_RUNTIME_01_R4_CONTINUOUS_SOURCE_LATTICE_EXACT_SAMPLE_DISTANCE_FRACTIONAL_PHASE_PRODUCT_REFERENCE_REPAIR_PHASE_AWARE_SHARED_TILE_COVERAGE_BAKED_AWAITING_PHYSICAL_GPU.zip
```

with SHA-256:

```text
5df4a248dd14947eca9ab275f824a8e670c423e0ab7dd8f1fe74c7086a5c6d9c
```

A different parent shall fail with `E_R5_PARENT_BUNDLE_IDENTITY_MISMATCH`.

## 1.2 Frozen R4 EWA assets

R5 shall preserve the following assets byte-for-byte:

| Asset | Parent SHA-256 |
|---|---|
| `shaders/ewa_aniso_tile_r4_r4.wgsl` | `d743126cf2413b7591363db2ee52ad430fa14fcd3c4a0f07907a9392482046ca` |
| `shaders/ewa_aniso_tile_r6_r4.wgsl` | `1299c11260a188b0a5bfed7eabdc46c6c0c268db25bc372827cb6f839dd12948` |
| `shaders/ewa_aniso_tile_validation_r4_r4.wgsl` | `2c573a4839ab6f30bfeee7da2a5336becfabd48230ea2acd5f2a06f835663ba1` |
| `shaders/ewa_aniso_tile_validation_r6_r4.wgsl` | `6a8107db3922eec9598c924806d2c90ceccef0c6a7d47cc75cf2412092dc477b` |
| `shaders/ewa_aniso_reference_v3_r4.wgsl` | `4c0f978f48845f7af8c6c84b1b795f9a26bfc3ed8c043e66e034d206964da447` |
| `ewa_tiled_profile_r4.mjs` | `008c48ed1e326952ec42b0e7f101957759f17942a364b2a6241fa1156aa3536a` |
| `ewa_parity_runtime_r4.mjs` | `bbc73dd789353eb2fda95b4c24ec33f7711f81c2e8315027c0dab3f39db2c288` |

These remain predecessor evidence and regression inputs. R5 shall add versioned assets rather than editing them in place.

## 1.3 Frozen R4 coordinate identities

R5 shall retain:

```text
coordinateConventionId = tdt.ewa.source-lattice.pixel-center-v2
productCoordinateId    = tdt.ewa.product-coordinate.phase-correct-r4.v1
tileCoverageProofId    = tdt.ewa.tile-coverage.phase-aware-r4.v1
profileSchemaId        = tdt.ewa.profile.phase-aware-r4.v1
```

The following equations remain authoritative and unchanged:

```text
p = (destinationCoord + 0.5) * srcPerDst - 0.5
base = floor(p)
sampleCoord = base + integerOffset
delta = sampleCoord - p
```

R5 shall not move tensor interpolation to destination coordinates, normalized UV coordinates, `round(p)`, or `base` alone.

## 1.4 Parent tensor assets

The parent tensor producer assets have these identities:

| Asset | Parent SHA-256 |
|---|---|
| `shaders/structure_tensor_eigen_r1c.wgsl` | `c4560743a9d42718e261c2cd2f069289aed6efabd341dc11b89c7c765ff38728` |
| `structure_tensor_runtime.mjs` | `d0d5a67cd9f26dacd23848d952f8de8d6f4de6357455c0ca3823d2f9c2d3d29a` |
| `structure_tensor_params.mjs` | `3340bd9853573ef4c43a3321cc94a7130af0f7056657159281273403bbf486dd` |
| `deltaK_stack_autoEWA.mjs` | `b3b3b4c58f535a09ee7898a7f452c1134344555b2d18255f4e7e5bffb8a236f7` |
| `ewa_aniso_tile.mjs` | `cbc5f5ae0c6bb4be529364b41ca90c516b52c48478a585601db2b57d7ae28277` |

R5 may version and modify the runtime modules required to add an axial output and bind it to R5 shaders. It shall not edit `structure_tensor_eigen_r1c.wgsl` or change its existing tangent field semantic.

## 1.5 Existing Hannakairo axial conversion

The repository already contains:

```text
app/legacy-runtime/core/analysis/hannakairo/shaders/hannakairo-axial-convert.wgsl
```

with parent SHA-256:

```text
0199bdb2013e1bcfa5ecf257d7cc748c88eebf45a5892ead31a453b9e77ed082
```

R5 may reuse the algebraic convention:

```text
q = (tx² - ty², 2 tx ty)
```

R5 shall not claim that the EWA stage-local axial field is the Hannakairo topology field. The semantic identities, validity rules, lifecycle, and consumer scopes remain distinct.

The relationship is:

```text
shared mathematical convention
≠ shared field semantic
≠ shared resource ownership
≠ shared publication receipt
```

## 1.6 R3 and R4 evidence remains historical truth

R3 shall continue to prove the round-centered phase defect in the R2 assets.

R4 shall continue to prove continuous source-lattice repair in the R4 assets.

R5 shall not regenerate either predecessor receipt under altered formulas.

---

# 2. Problem Statement

## 2.1 Current nearest-tensor defect

The R4 product computes a continuous EWA center but selects tensor data from one integer texel:

```text
p = continuous source position
base = floor(p)
tensor = tensorTex[base]
```

For `p.x` moving from `k + 0.9999` to `k + 1.0001`, the source sample lattice changes smoothly but the tensor selection jumps from column `k` to column `k + 1`.

Possible visible consequences include:

- ellipse axis snapping,
- anisotropy strength stepping,
- edge-gate stepping,
- shimmer during continuous viewport movement,
- directional instability near a tangent sign seam,
- Preview and Export disagreement if one path later adopts filtered tensor sampling independently.

## 2.2 Direct tangent bilinear is invalid

The stored tangent is canonicalized to one sign, but axial physics does not acquire direction merely because storage selected a canonical representative.

Consider equivalent orientations near the vertical axis:

```text
θ₀ = +89°
θ₁ = -89°
```

A signed-vector interpolation sees opposite Y components and can travel toward horizontal. The axial doubled-angle representation maps both to nearby doubled phases around 178° and -178°, which correctly interpolate through the vertical axis.

R5 shall therefore prohibit:

```text
normalize(Σ βᵢ tangentᵢ)
```

as the canonical tensor interpolation.

## 2.3 Coherence cannot be detached from phase agreement

Plain bilinear coherence can remain high even when neighboring axes disagree by 90°. Applying that high coherence to an arbitrary reconstructed tangent would create a strongly anisotropic ellipse from contradictory evidence.

R5 shall use the magnitude of the coherence-weighted doubled-angle sum as effective coherence. This makes disagreement reduce anisotropy automatically.

## 2.4 Orientation continuity at zero coherence

No orientation representation can remain meaningful where all directional evidence cancels exactly. R5 shall define continuity in terms of the physical ellipse:

```text
coherenceEffective → 0
anisotropy → 1
ellipse orientation becomes irrelevant
```

A canonical neutral tangent may jump at exact zero magnitude without creating a visible directional discontinuity because the gate is exactly isotropic.

---

# 3. Scope

## 3.1 In scope

R5 shall implement and seal:

1. a versioned GPU axial-conversion pass,
2. a stage-local `rgba16float` axial-coherence-edge texture,
3. sign-invariant algebraic doubled-angle conversion,
4. finite and zero-length input handling,
5. four-tap manual bilinear axial sampling,
6. coherence-weighted axial accumulation,
7. angular-agreement effective coherence,
8. bilinear edge interpolation,
9. canonical algebraic half-angle reconstruction,
10. exact vertical-axis fallback,
11. phase-continuous product R4 and R6 shaders,
12. matching validation shaders,
13. a separate direct-load reference shader,
14. R5 runtime bundle identities,
15. R5 stack wiring from tensor producer to EWA consumer,
16. axial field receipts and telemetry,
17. independent binary64 conversion and interpolation oracle,
18. deterministic seam and cancellation fixtures,
19. static source verification,
20. mock runtime verification,
21. active graph and emitted asset admission,
22. zero runtime fallback proof,
23. predecessor regression execution,
24. explicit physical GPU and package deferral.

## 3.2 Out of scope

R5 shall not implement:

- `kernelSharpness` ABI wiring,
- kernel taper parameterization,
- generated shared WGSL kernel fragments,
- policy texture interpolation,
- Export lowpass convergence,
- residual reconstruction changes,
- support-radius planner changes,
- source shared-tile dimension changes,
- tensor-scale-space redesign,
- eigen decomposition redesign,
- structure tensor Gaussian radius changes,
- Hannakairo topology publication changes,
- persistent tensor Tile Atlas residency,
- CPU resampling,
- CPU tensor production,
- absolute performance promotion,
- Production Pointer promotion.

These remain later authorities.

---

# 4. Non-Breakage Contract

R5 shall preserve:

- the public `runDeltaKStack()` facade,
- the public `createDeltaKStack()` facade,
- existing caller request normalization,
- the `80`-byte EWA parameter ABI,
- the `64`-byte tensor parameter ABI,
- R4 source-lattice equations,
- R4 tile profile selection,
- R4 source tile dimensions,
- R4 source candidate count,
- R4 source border semantics,
- R4 source fallback prohibition,
- R1C tangent field semantic and Analysis Field publication,
- R1D adaptive policy semantics,
- `rgba16float` EWA outputs,
- GPU Device Authority ownership,
- device epoch rejection,
- stage-local tensor rebuilding,
- zero intermediate pixel readback,
- explicit temporary resource release,
- Production Pointer content and digest.

R5 may extend the internal tensor handle with:

```text
axialFieldTexture
axialFieldSchemaId
axialFieldReceipt
```

The existing `fieldTexture` property shall continue to refer to the tangent-coherence-edge field for compatibility. Canonical R5 EWA wiring shall explicitly consume `axialFieldTexture`.

---

# 5. Authority and Identity Model

## 5.1 Source position authority

The sole tensor interpolation position is the R4 source position:

```text
p = (gid + 0.5) * srcPerDst - 0.5
```

The EWA source kernel and axial field shall not derive separate source positions.

## 5.2 Tangent producer authority

The existing eigen pass remains authoritative for:

```text
normalized canonical tangent
coherence
edge strength
```

R5 does not recompute tensor eigenvalues or eigenvectors.

## 5.3 Axial conversion authority

The new GPU conversion pass is the sole product authority for transforming the tangent field into the R5 axial field.

```text
implementationId: tdt-structure-tensor-axial-r5-webgpu-v1
representationId: tdt.axial.double-angle.algebraic-v1
```

## 5.4 Interpolation authority

The R5 EWA product shaders are authoritative for sampling the axial field at `p`.

```text
interpolationId: tdt.ewa.axial-bilinear.coherence-weighted-r5.v1
```

A browser sampler, CPU helper, WebGL shader, legacy tangent mixer, or Hannakairo topology field shall not replace this authority.

## 5.5 Effective coherence authority

```text
coherenceIdentity: tdt.ewa.axial-agreement-magnitude-r5.v1
```

Effective coherence is the norm of the coherence-weighted doubled-angle accumulator after finite input sanitization.

## 5.6 Reconstruction authority

```text
reconstructionIdentity: tdt.ewa.axial-half-angle.canonical-r5.v1
```

Only the algebraic half-angle reconstruction defined by this specification is canonical.

---

# 6. GPU Axial Field Producer Contract

## 6.1 Versioned shader

R5 shall add:

```text
app/legacy-runtime/core/compute/qmap_webgpu/shaders/structure_tensor_axial_r5.wgsl
```

The shader shall read the existing tangent-coherence-edge texture and write a new `rgba16float` axial-coherence-edge texture.

## 6.2 Bindings

```wgsl
@group(0) @binding(0) var tangentTex: texture_2d<f32>;
@group(0) @binding(1) var axialTex: texture_storage_2d<rgba16float, write>;
@group(0) @binding(2) var<uniform> P: Params;
```

The pass may reuse the existing `64`-byte tensor uniform layout. It shall not create a new caller-visible ABI.

## 6.3 Conversion algorithm

For each valid pixel:

```text
raw = textureLoad(tangentTex, coord, 0)
t = raw.rg
c = clamp(raw.b, 0, 1)
e = clamp(raw.a, 0, 1)
```

Validity requires:

```text
all channels finite
length²(t) > AXIAL_INPUT_EPSILON²
```

For valid input:

```text
t = normalize(t)
q = (t.x² - t.y², 2 t.x t.y)
q = normalize(q)
output = (q.x, q.y, c, e)
```

For invalid input:

```text
output = (1, 0, 0, 0)
```

## 6.4 No sign canonicalization dependency

The conversion shall work for both `t` and `-t`. It shall not depend on the parent eigen pass having already canonicalized tangent sign.

## 6.5 No trigonometric conversion

The product conversion pass shall not use:

```text
atan2
acos
asin
sin
cos
```

The algebraic representation is exact up to floating-point arithmetic and avoids branch-cut creation in the conversion pass.

## 6.6 Dispatch order

The axial conversion shall execute after the eigen pass and before EWA consumption.

Preferred chain:

```text
gradient
→ outer
→ blur H
→ blur V
→ eigen tangent field
→ axial conversion
```

The conversion should be encoded in the same command encoder and queue submission as the tensor chain where practical.

## 6.7 Resource ownership

The tensor handle shall own:

```text
gradient
raw tensor
blur H
integrated tensor
eigen tangent field
R5 axial field
```

All stage-local textures shall be destroyed exactly once by `release()` or the failure path.

The existing Analysis Field copy of the tangent field shall remain unchanged. R5 does not require publishing the internal EWA axial field through Analysis Field Authority.

## 6.8 Handle extension

The returned handle shall contain:

```js
{
  fieldTexture,          // existing tangent field
  axialFieldTexture,     // new R5 EWA field
  analysisFieldHandle,   // existing tangent publication
  receipt,
  axialReceipt,
  release,
}
```

Canonical R5 EWA wiring shall fail closed if `axialFieldTexture` is absent.

---

# 7. Axial Field Schema

## 7.1 Schema identity

```text
schemaId:       tdt.structure-tensor.axial-coherence-edge.r5.v1
format:         rgba16float
resourceKind:   texture-2d
coordinateSpace: stage-source-pixel
periodicity:    pi-axial
```

## 7.2 Channel contract

| Channel | Meaning | Range |
|---|---|---|
| R | normalized `cos(2θ)` | `[-1, 1]` |
| G | normalized `sin(2θ)` | `[-1, 1]` |
| B | source coherence | `[0, 1]` |
| A | source edge strength | `[0, 1]` |

## 7.3 Neutral record

The exact neutral record is:

```text
(1, 0, 0, 0)
```

This corresponds to an arbitrary horizontal representative with zero directional confidence and zero edge gate. Its ellipse effect is isotropic identity.

## 7.4 Distinction from Hannakairo field

The R5 internal field is not:

```text
tdt.analysis.hannakairo.axial-order.v1
```

Hannakairo includes topology-specific validity and publication semantics. R5 includes EWA-specific coherence and edge channels. Reusing the same mathematical encoding does not merge the semantic IDs.

---

# 8. Continuous Axial Sampling Coordinates

## 8.1 Base and fraction

For the R4 source position `p`:

```text
b = floor(p)
f = p - floor(p)
```

The four logical neighbor coordinates are:

```text
c00 = b + (0, 0)
c10 = b + (1, 0)
c01 = b + (0, 1)
c11 = b + (1, 1)
```

## 8.2 Spatial weights

```text
w00 = (1 - fx)(1 - fy)
w10 = fx(1 - fy)
w01 = (1 - fx)fy
w11 = fx fy
```

Required invariants:

```text
wᵢ >= 0
Σwᵢ = 1
```

within floating-point tolerance.

## 8.3 Logical and physical coordinates

The interpolation weights are derived from the unclamped `p` and `b`.

Each neighbor is fetched using:

```text
fetchCoordᵢ = clamp(cᵢ, 0, inSize - 1)
```

The clamped coordinate shall not replace `cᵢ` or alter `f`.

This is clamp-extension sampling on the continuous source lattice.

## 8.4 No hardware filtering dependency

The R5 product shall use four `textureLoad` operations. It shall not use:

```text
textureSample
textureSampleLevel
sampler(filtering)
```

for the axial field.

This keeps behavior independent of `rgba16float` filterability and sampler implementation.

---

# 9. Coherence-Weighted Double-Angle Interpolation

## 9.1 Sample sanitization

For each fetched axial record:

1. verify all channels are finite,
2. clamp coherence and edge to `[0, 1]`,
3. compute `qNorm² = dot(q, q)`,
4. if finite and above epsilon, normalize `q`,
5. otherwise replace the record with neutral `(1, 0, 0, 0)`.

A nonfinite record shall never propagate into ellipse dimensions or output pixels.

## 9.2 Axial accumulator

```text
A = Σ wᵢ cᵢ qᵢ
C = Σ wᵢ cᵢ
E = Σ wᵢ eᵢ
M = length(A)
```

`C` is retained for telemetry and oracle checks. The product effective coherence is `M`, not plain `C`.

## 9.3 Effective coherence

For unit axial samples and normalized bilinear weights:

```text
0 <= M <= C <= 1
```

The effective coherence is:

```text
cEffective = clamp(M, 0, 1)
```

The optional phase agreement diagnostic is:

```text
phaseAgreement = 0                    when C <= epsilon
phaseAgreement = clamp(M / C, 0, 1)  otherwise
```

The product need not store `phaseAgreement`, but validation and receipts shall be able to count cancellation cases.

## 9.4 Interpolated axial direction

```text
qInterpolated = A / M
```

when `M > AXIAL_NORMALIZATION_EPSILON`.

Otherwise:

```text
qInterpolated = (1, 0)
cEffective = 0
```

## 9.5 Why coherence weights direction

A low-coherence neighbor shall not rotate a high-coherence neighbor with equal authority. Weighting the axial vectors by coherence keeps orientation ownership aligned with the tensor producer confidence.

## 9.6 Why edge does not weight direction

Edge strength participates in the anisotropy gate after interpolation. It shall not additionally bias the direction accumulator in R5. Doing so would couple direction estimation to a second confidence measure and change the tensor policy beyond this patch's scope.

---

# 10. Edge Phase Continuity

## 10.1 Bilinear edge

```text
edgeEffective = clamp(Σ wᵢ eᵢ, 0, 1)
```

The edge value shall vary continuously with `p` under finite neighboring values.

## 10.2 Gate interaction

The existing ellipse gate remains structurally:

```text
gate = pow(coherenceEffective, coherenceExponent)
     * smoothstep(edgeLow, edgeHigh, edgeEffective)
     * policyInfluence
     * deltaEGate
```

R5 shall not change the remaining gate factors.

## 10.3 Neutral identity

When `coherenceEffective == 0`, the gate shall be exactly zero regardless of edge strength. The resulting anisotropy shall be exactly one under the existing formula.

---

# 11. Canonical Half-Angle Reconstruction

## 11.1 Input

Input `q` shall be finite and normalized before reconstruction.

## 11.2 Algebraic reconstruction

```text
tx = sqrt(max(0, 0.5 * (1 + qx)))
```

When `tx > HALF_ANGLE_EPSILON`:

```text
ty = qy / (2 tx)
t = normalize(tx, ty)
```

When `tx <= HALF_ANGLE_EPSILON`:

```text
t = (0, 1)
```

## 11.3 Canonical sign

The output shall satisfy:

```text
t.x > 0
or
t.x == 0 and t.y >= 0
```

within the chosen epsilon.

## 11.4 Reconstruction invariant

Converting the reconstructed tangent back to doubled-angle form shall reproduce the normalized input `q` within the defined float tolerance.

## 11.5 Forbidden reconstruction

Product WGSL shall not reconstruct with:

```text
0.5 * atan2(qy, qx)
```

or any trigonometric equivalent.

---

# 12. Versioned R5 Product Shaders

R5 shall add:

```text
shaders/ewa_aniso_tile_r4_r5.wgsl
shaders/ewa_aniso_tile_r6_r5.wgsl
shaders/ewa_aniso_tile_validation_r4_r5.wgsl
shaders/ewa_aniso_tile_validation_r6_r5.wgsl
shaders/ewa_aniso_reference_v4_r5.wgsl
```

The source image tile geometry remains:

| Profile | Reach | Candidate grid | Source tile |
|---|---:|---:|---:|
| R4 | 4 | 9×9 | 24×24 |
| R6 | 6 | 13×13 | 28×28 |

The R5 product shall replace only the tensor field sampling and tangent reconstruction portions of the R4 shader logic.

The source pixel accumulation shall retain:

```text
base = floor(p)
sampleCoord = base + offset
delta = sampleCoord - p
strict shared source tile load
```

The product shall not direct-load source image pixels outside the shared tile.

The axial field itself may be direct-loaded at four neighboring coordinates because it is a separate small field access contract and not part of the source image tile proof.

---

# 13. Product and Reference Independence

## 13.1 Shared mathematical contract

Product and reference shall agree on:

- source position `p`,
- axial field schema,
- four logical neighbors,
- bilinear weights,
- coherence-weighted doubled-angle accumulation,
- effective coherence,
- edge interpolation,
- half-angle reconstruction,
- ellipse equation,
- source candidate lattice,
- border semantics.

## 13.2 Separate memory implementations

The product shall read source image samples from the strict workgroup tile.

The reference shall direct-load every source image candidate independently.

The reference shall never become the product target or an automatic fallback.

## 13.3 Shared-error detection

R5 tooling shall include an independent binary64 oracle. Product/reference parity alone shall not satisfy the axial correctness claim because both WGSL files could share the same branch or weighting error.

## 13.4 Source separation

R5 may generate common identity constants in JavaScript, but shall not generate one identical WGSL body and label it both product and reference. The source files must remain independently inspectable.

---

# 14. Structure Tensor Runtime Wiring

## 14.1 Pipeline bundle

`createStructureTensorR1CPipeline()` shall add a versioned axial pipeline and shader digest while preserving all existing pipelines.

The bundle shall expose:

```text
axialFieldSchemaId
axialRepresentationId
axialPipelineIdentity
```

The spelling in source shall be stable and internally consistent; receipts shall use `axial...` lower camel case.

## 14.2 Tensor build

`buildStageLocalTensorR1C()` shall:

1. allocate the axial texture,
2. encode the axial pass after eigen,
3. keep the tangent Analysis Field copy behavior,
4. submit with no CPU pixel readback,
5. wait on the same queue fence,
6. return both tangent and axial textures,
7. include axial identities and shader digest in receipts,
8. destroy the axial texture exactly once on release or failure.

## 14.3 Temporary texture count

The canonical stage temporary texture count increases from five to six.

Every downstream receipt that records the tensor temporary count shall be updated accordingly. A stale hard-coded count of five shall fail source verification.

## 14.4 No tangent publication semantic mutation

The existing published Analysis Field remains:

```text
tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
```

Its resource content shall remain the eigen tangent field, not the new axial field.

---

# 15. DeltaK Stack Wiring

For canonical stage-local tensor mode, the stack shall dispatch EWA with:

```text
tensorTex = tensorHandle.axialFieldTexture
tensorFieldMode = axial-double-angle-r5
```

The old compatibility property remains:

```text
tensorHandle.fieldTexture = tangent field
```

Binding the old tangent field to an R5 product shader shall fail with:

```text
E_R5_TANGENT_FIELD_BOUND_TO_R5_PRODUCT
```

The R5 stack receipt shall include:

```text
axialFieldConsumed: true
axialFieldSchemaId
axialRepresentationId
axialInterpolationId
axialReconstructionId
```

Legacy external tensor mode remains legacy and does not acquire an R5 axial correctness claim.

---

# 16. Runtime Bundle and Cache Identity

The R5 EWA bundle shall expose:

```text
schemaVersion: 6
coordinateConventionId: tdt.ewa.source-lattice.pixel-center-v2
productCoordinateId: tdt.ewa.product-coordinate.phase-correct-r4.v1
tileCoverageProofId: tdt.ewa.tile-coverage.phase-aware-r4.v1
axialFieldSchemaId: tdt.structure-tensor.axial-coherence-edge.r5.v1
axialRepresentationId: tdt.axial.double-angle.algebraic-v1
axialInterpolationId: tdt.ewa.axial-bilinear.coherence-weighted-r5.v1
axialReconstructionId: tdt.ewa.axial-half-angle.canonical-r5.v1
effectiveCoherenceId: tdt.ewa.axial-agreement-magnitude-r5.v1
```

Pipeline cache keys and layout digests shall include all R5 axial identities. A cached R4 product pipeline shall not satisfy an R5 request.

The bundle shall remain bound to:

```text
runtimeEpoch
deviceEpoch
deviceIdentity
```

Device loss shall invalidate and dispose it.

---

# 17. Validation Shader Contract

R5 validation shaders shall retain all R4 counters and add bounded counters for:

```text
invalidAxialInputCount
axialRenormalizationCount
axialCancellationCount
halfAngleVerticalFallbackCount
nonFiniteInterpolatedFieldCount
coherenceBoundViolationCount
bilinearWeightSumViolationCount
tangentReconstructionMismatchCount
```

Validation counters shall not change product pixels.

A cancellation is counted when:

```text
coherenceMass > epsilon
and
axialMagnitude <= normalizationEpsilon
```

The vertical fallback is not itself an error. It is diagnostic and expected for exact vertical axes.

Source-only bake may verify counter declarations and mock behavior. Physical counter readback remains deferred.

---

# 18. Independent Binary64 Oracle

## 18.1 Location

```text
tools/resample-runtime-01-r5/axial-oracle-f64.mjs
```

## 18.2 Runtime isolation

The oracle shall be importable only from R5 tooling. It shall not be imported by:

- `app/src`,
- `app/legacy-runtime` product modules,
- renderer entrypoints,
- workers,
- Preview services,
- Export services,
- Electron package entrypoints.

## 18.3 Oracle operations

The oracle shall independently implement:

1. tangent normalization,
2. algebraic doubled-angle conversion,
3. sign-invariance check,
4. four-neighbor clamp-extension lookup,
5. bilinear weights,
6. coherence-weighted axial sum,
7. effective coherence,
8. bilinear edge,
9. half-angle reconstruction,
10. ellipse-axis equivalence metrics.

## 18.4 No product fallback

The oracle shall never process user images as a runtime substitute. Fixture dimensions shall remain bounded. Recommended maximum fixture field dimension is `64×64`.

---

# 19. Deterministic Fixture Matrix

R5 fixtures shall include at least:

## 19.1 Constant fields

- horizontal axis,
- vertical axis,
- 22.5° axis,
- 45° axis,
- 67.5° axis,
- coherence `0`, `0.25`, `0.5`, `1`,
- edge `0`, `0.25`, `0.5`, `1`.

Expected: exact phase independence except for representational rounding.

## 19.2 Sign-flip fields

Each fixture shall have a paired field with every tangent sign reversed.

Expected: axial textures and interpolated ellipse axes are identical.

## 19.3 Branch-seam fields

- `+89°` beside `-89°`,
- `+89.9°` beside `-89.9°`,
- `+1°` beside `179°`,
- sign-canonical representation changes around the vertical axis.

Expected: interpolation follows the short axial path.

## 19.4 Cancellation fields

- horizontal beside vertical with equal coherence,
- 45° beside 135° with equal coherence,
- four-way orthogonal checker.

Expected: effective coherence approaches or reaches zero; anisotropy becomes identity.

## 19.5 Unequal-confidence fields

- high-coherence horizontal beside low-coherence vertical,
- low-coherence seam noise around a high-coherence axis,
- zero-coherence arbitrary tangent neighbors.

Expected: low-confidence samples do not rotate the dominant axis materially.

## 19.6 Edge ramps

- horizontal edge ramp,
- vertical edge ramp,
- 2D saddle edge field.

Expected: bilinear edge values match the oracle.

## 19.7 Border fields

- 1×1,
- 1×N,
- N×1,
- corners,
- fractional positions outside the first and last pixel centers under clamp extension.

Expected: repeated border samples and unchanged interpolation weights.

## 19.8 Nonfinite and degenerate fields

Validation-only fixtures shall include:

- zero tangent,
- NaN tangent,
- infinity tangent,
- NaN coherence,
- out-of-range coherence,
- out-of-range edge,
- denormal-scale axial norm.

Expected: neutralization, clamping, and bounded counters.

## 19.9 Phase sweep

For representative 2×2 neighborhoods, sample a deterministic grid over:

```text
fx, fy ∈ {0, 1/64, 2/64, ..., 1}
```

Expected: no discontinuity at internal cell boundaries beyond the specified numerical tolerance.

---

# 20. Continuity Metrics

## 20.1 Axial distance

For normalized doubled-angle vectors `q0` and `q1`, use:

```text
axialVectorDistance = length(q0 - q1)
```

## 20.2 Physical axis distance

For reconstructed tangents `t0` and `t1`, use sign-invariant angular agreement:

```text
axisAgreement = abs(dot(t0, t1))
```

No directed angle metric shall classify `t` and `-t` as different axes.

## 20.3 Ellipse continuity

The physically relevant comparison includes:

- major radius,
- minor radius,
- effective coherence,
- edge gate,
- sign-invariant axis agreement.

At effective coherence near zero, axis disagreement alone shall not fail continuity if major and minor converge to isotropic identity.

## 20.4 Source-only tolerance

Binary64 oracle self-tests shall use strict deterministic tolerances. WGSL physical GPU tolerance is not claimed by source-only bake and is deferred to R9.

---

# 21. ABI, Kernel, and Profile Preservation

R5 shall preserve:

```text
EWA ABI ID: tdt.delta-k-ewa.params.v3
EWA ABI bytes: 80
Tensor ABI ID: tdt.structure-tensor.params.v1
Tensor ABI bytes: 64
Kernel ID: tdt.ewa.ellipse.radial-v1
Workgroup: 8×8×1
Reach profiles: 4 and 6
R4 source tiles: 24×24 and 28×28
```

The literal radial sharpness remains unchanged in R5.

R5 shall not claim that `kernelSharpness` is wired. That defect remains explicitly assigned to R6.

---

# 22. Border and Degenerate Semantics

## 22.1 Clamp extension

Axial neighbor fetches use clamp extension.

## 22.2 One-pixel fields

A `1×1` axial field shall reproduce its single record for every `p` after sanitization.

## 22.3 Zero coherence

Any field with all sampled coherence equal to zero shall produce:

```text
q = (1, 0)
coherenceEffective = 0
```

and exact isotropic anisotropy.

## 22.4 Exact orthogonal cancellation

Equal-confidence doubled-angle antipodes shall produce zero effective coherence and neutral direction.

## 22.5 Invalid inputs

Invalid samples contribute zero coherence and zero edge. They shall not poison valid neighbors.

---

# 23. Receipts

## 23.1 Axial producer receipt

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-RESAMPLE-RUNTIME-01-R5",
  "receiptType": "structure-tensor-axial-r5",
  "axialFieldSchemaId": "tdt.structure-tensor.axial-coherence-edge.r5.v1",
  "axialRepresentationId": "tdt.axial.double-angle.algebraic-v1",
  "sourceTangentSchemaId": "tdt.structure-tensor.field.v1",
  "format": "rgba16float",
  "width": 0,
  "height": 0,
  "stageIndex": 0,
  "stageCount": 0,
  "shaderDigest": "",
  "runtimeEpoch": 0,
  "deviceEpoch": 0,
  "cpuPixelComputeUsed": false,
  "intermediatePixelReadbackCount": 0
}
```

## 23.2 EWA R5 receipt extension

```json
{
  "axialFieldConsumed": true,
  "axialFieldSchemaId": "tdt.structure-tensor.axial-coherence-edge.r5.v1",
  "axialRepresentationId": "tdt.axial.double-angle.algebraic-v1",
  "axialInterpolationId": "tdt.ewa.axial-bilinear.coherence-weighted-r5.v1",
  "axialReconstructionId": "tdt.ewa.axial-half-angle.canonical-r5.v1",
  "effectiveCoherenceId": "tdt.ewa.axial-agreement-magnitude-r5.v1",
  "tensorSampleMode": "manual-four-load-clamp-extension",
  "tangentVectorBilinearUsed": false,
  "hardwareFilteringUsed": false,
  "runtimeCpuFallbackUsed": false
}
```

## 23.3 Source gate receipt

The source gate receipt shall include:

- parent bundle digest,
- frozen predecessor asset digests,
- new shader asset digests,
- oracle fixture manifest digest,
- invariant counts,
- active graph admission counts,
- runtime import scan counts,
- predecessor regression statuses,
- PASS/DEFERRED/FAIL gate totals,
- explicit physical GPU deferral.

---

# 24. Telemetry

R5 telemetry shall include at least:

```text
axialFieldBuildCount
axialFieldReleaseCount
axialFieldFailureCount
r5DispatchCount
r5Reach4SelectionCount
r5Reach6SelectionCount
r5AxialFieldConsumedCount
r5TangentFieldRejectedCount
r5LegacyTensorStageCount
r5DeviceLossAbortCount
r5ReferenceDispatchCount
r5ValidationDispatchCount
```

Product telemetry shall not infer pixel correctness without physical comparator evidence.

---

# 25. Resource and Lifecycle Contract

1. All R5 pipelines use the current GPU Device Authority device.
2. No adapter or device is requested locally.
3. Axial textures belong to the stage tensor handle.
4. EWA dispatch completes before the handle releases its axial texture.
5. Failure paths destroy all allocated stage textures exactly once.
6. Device loss invalidates both tensor and EWA R5 bundles.
7. Stale epoch bundles fail before queue submission.
8. No full-size tensor or pixel texture is read back in product runtime.
9. Validation may read back compact counter summaries only under explicit validation execution.
10. The independent oracle never receives product GPU texture ownership.

---

# 26. Active Graph and Asset Admission

The generated runtime asset manifest and static admission graph shall admit the new R5 WGSL assets.

Exactly one canonical EWA product family shall be active for canonical R5 mode.

The R4 assets remain present as predecessor evidence but shall not be selected by the R5 canonical branch.

The R5 oracle and fixture files shall not be admitted to renderer, worker, Preview, Export, or package runtime assets.

Generated manifest replay shall be byte-identical.

---

# 27. Zero Fallback Contract

The following are forbidden:

```text
CPU axial conversion in product runtime
CPU tensor interpolation in product runtime
Canvas tensor sampling
WebGL tensor sampling
hardware-filtered tangent-vector interpolation
R4 tangent texture silently bound to R5 product
R5 reference shader selected as product fallback
R3/R5 oracle selected as runtime fallback
out-of-tile source direct-load fallback
```

A missing axial field shall fail closed. It shall not fall back to nearest tangent sampling.

---

# 28. Stable Errors

R5 shall use stable error codes including:

| Code | Meaning |
|---|---|
| `E_R5_PARENT_BUNDLE_IDENTITY_MISMATCH` | wrong parent bundle |
| `E_R5_PARENT_ASSET_MUTATION` | frozen R4 or predecessor asset changed |
| `E_R5_AXIAL_FIELD_SCHEMA_MISMATCH` | axial texture schema or format invalid |
| `E_R5_AXIAL_FIELD_MISSING` | canonical stage has no axial texture |
| `E_R5_AXIAL_CONVERSION_MISMATCH` | conversion differs from oracle contract |
| `E_R5_AXIAL_SIGN_INVARIANCE_FAILED` | `t` and `-t` differ |
| `E_R5_AXIAL_NORMALIZATION_FAILED` | stored or sampled axial vector invalid |
| `E_R5_AXIAL_INTERPOLATION_MISMATCH` | four-tap result differs from oracle |
| `E_R5_BRANCH_CUT_INTERPOLATION_FAILURE` | seam follows wrong directed branch |
| `E_R5_SUBPIXEL_DIRECTION_DISCONTINUITY` | phase sweep discontinuity |
| `E_R5_COHERENCE_AGREEMENT_MISMATCH` | effective coherence formula wrong |
| `E_R5_EDGE_INTERPOLATION_MISMATCH` | edge bilinear result wrong |
| `E_R5_HALF_ANGLE_RECONSTRUCTION_FAILED` | reconstructed tangent invalid |
| `E_R5_NEUTRAL_IDENTITY_MISMATCH` | cancellation does not become isotropic |
| `E_R5_NONFINITE_FIELD` | nonfinite field reached ellipse math |
| `E_R5_TANGENT_FIELD_BOUND_TO_R5_PRODUCT` | wrong field semantic bound |
| `E_R5_CANONICAL_RUNTIME_STILL_R4` | canonical loader still selects R4 assets |
| `E_R5_REFERENCE_AS_PRODUCT_WIRED` | reference is reachable as product fallback |
| `E_R5_CPU_FALLBACK_WIRED` | CPU, Canvas, WebGL, or oracle fallback detected |
| `E_R5_STALE_PIPELINE_EPOCH` | runtime/device identity mismatch |
| `E_R5_RUNTIME_ASSET_MISSING` | R5 asset not admitted |
| `E_R5_ACTIVE_GRAPH_MISSING` | canonical graph identity absent or duplicated |
| `E_R5_GENERATED_MANIFEST_STALE` | generated outputs do not replay identically |
| `E_R5_RECEIPT_INCOMPLETE` | mandatory receipt field absent |
| `E_R5_PREDECESSOR_REGRESSION_FAILED` | earlier gate regressed |
| `E_R5_PRODUCTION_POINTER_MUTATION` | pointer changed without authority |
| `E_R5_PHYSICAL_GPU_CLAIM_UNSUPPORTED` | source bake claimed unavailable execution |

---

# 29. Required Source Layout

```text
app/legacy-runtime/core/compute/qmap_webgpu/
├─ structure_tensor_runtime.mjs
├─ structure_tensor_runtime_receipt.mjs
├─ structure_tensor_axial_r5_receipt.mjs
├─ deltaK_stack_autoEWA.mjs
├─ ewa_aniso_tile.mjs
├─ ewa_axial_interpolation_receipt_r5.mjs
├─ ewa_parity_runtime_r5.mjs
└─ shaders/
   ├─ structure_tensor_eigen_r1c.wgsl                 # frozen
   ├─ structure_tensor_axial_r5.wgsl                  # new
   ├─ ewa_aniso_tile_r4_r4.wgsl                       # frozen
   ├─ ewa_aniso_tile_r6_r4.wgsl                       # frozen
   ├─ ewa_aniso_tile_r4_r5.wgsl                       # new
   ├─ ewa_aniso_tile_r6_r5.wgsl                       # new
   ├─ ewa_aniso_tile_validation_r4_r5.wgsl            # new
   ├─ ewa_aniso_tile_validation_r6_r5.wgsl            # new
   └─ ewa_aniso_reference_v4_r5.wgsl                  # new

tools/resample-runtime-01-r5/
├─ axial-oracle-f64.mjs
├─ generate-fixtures.mjs
├─ verify-axial-conversion.mjs
├─ verify-subpixel-interpolation.mjs
├─ verify-product-reference-source.mjs
├─ verify-runtime-wiring.mjs
├─ verify-parent-freeze.mjs
├─ verify-zero-fallback.mjs
├─ verify-predecessor-regression.mjs
├─ runtime-smoke.mjs
├─ gate.mjs
├─ run.mjs
├─ finalize.mjs
├─ fixtures/
└─ receipts/
```

Exact filenames may be extended only when the semantic ownership remains unambiguous and all additional files are listed in the changed-file manifest.

---

# 30. Package Scripts

R5 shall add:

```json
{
  "generate:resample-runtime-01-r5": "node tools/resample-runtime-01-r5/generate-fixtures.mjs",
  "verify:resample-runtime-01-r5:oracle": "node tools/resample-runtime-01-r5/verify-axial-conversion.mjs && node tools/resample-runtime-01-r5/verify-subpixel-interpolation.mjs",
  "verify:resample-runtime-01-r5:source": "node tools/resample-runtime-01-r5/verify-parent-freeze.mjs && node tools/resample-runtime-01-r5/verify-product-reference-source.mjs && node tools/resample-runtime-01-r5/verify-runtime-wiring.mjs && node tools/resample-runtime-01-r5/verify-zero-fallback.mjs && node tools/resample-runtime-01-r5/verify-predecessor-regression.mjs",
  "smoke:resample-runtime-01-r5": "node tools/resample-runtime-01-r5/runtime-smoke.mjs",
  "gate:resample-runtime-01-r5": "node tools/resample-runtime-01-r5/gate.mjs",
  "verify:resample-runtime-01-r5": "node tools/resample-runtime-01-r5/run.mjs",
  "finalize:resample-runtime-01-r5": "node tools/resample-runtime-01-r5/finalize.mjs"
}
```

`verify:resample-runtime-01-r5` shall run the entire source-available sequence and emit one final gate summary.

---

# 31. Implementation Sequence

## Phase A: parent freeze

1. verify parent ZIP digest,
2. verify frozen R4 EWA assets,
3. verify R3 and R4 predecessor receipts,
4. record current Production Pointer digest.

## Phase B: independent oracle

1. implement binary64 tangent-to-axial conversion,
2. implement clamp-extension four-tap interpolation,
3. implement effective coherence,
4. implement half-angle reconstruction,
5. generate deterministic fixtures,
6. verify sign, seam, cancellation, and continuity invariants.

## Phase C: GPU axial producer

1. add versioned axial conversion WGSL,
2. extend tensor pipeline bundle,
3. allocate and dispatch axial texture,
4. extend handle and receipts,
5. update exact resource counts.

## Phase D: R5 product family

1. clone R4 product assets into versioned R5 files,
2. replace nearest tangent lookup with four-tap axial sampling,
3. reconstruct canonical tangent,
4. preserve R4 source lattice and source tile logic,
5. add validation counters,
6. add independent direct-load reference.

## Phase E: runtime wiring

1. load R5 assets,
2. include R5 identities in cache keys,
3. bind the axial texture,
4. reject tangent-field binding,
5. extend receipts and telemetry,
6. retain device-loss behavior.

## Phase F: graph and gates

1. update generated runtime asset manifests,
2. update Active Graph identity,
3. run source scanners,
4. run mock runtime,
5. run predecessor gates,
6. finalize source receipts,
7. leave physical and package gates deferred.

---

# 32. Source Verification Strategy

Static verification shall confirm:

- exact parent hashes,
- new versioned assets exist,
- R4 predecessor assets are unchanged,
- R5 products do not contain nearest tensor load at `base`,
- R5 products perform four axial loads,
- R5 products do not use hardware texture filtering for tensor data,
- R5 products do not bilinear-interpolate tangent vectors,
- R5 products contain coherence-weighted doubled-angle accumulation,
- R5 products compute effective coherence from accumulator magnitude,
- R5 products reconstruct with algebraic half-angle math,
- R5 products do not use trigonometric reconstruction,
- R5 products preserve R4 source candidate math,
- R5 validation shaders expose all required counters,
- the direct reference remains distinct,
- canonical runtime binds the axial field,
- legacy mode remains explicitly legacy,
- all runtime imports remain GPU-only,
- oracle imports remain tooling-only.

---

# 33. Mock Runtime Strategy

The mock runtime shall verify control flow and lifecycle, not physical pixels.

It shall prove:

- tensor axial pipeline creation,
- axial texture allocation,
- axial dispatch order after eigen,
- EWA dispatch receives the axial texture,
- missing axial texture fails closed,
- tangent texture misuse rejects,
- temporary resources destroy exactly once,
- stale device epoch rejects,
- R4 profile selection remains in use,
- receipts contain R5 identities,
- no physical parity claim is emitted.

Mock runtime evidence shall be labeled `SOURCE_OR_MOCK_ONLY`.

---

# 34. Physical GPU Deferral

The following remain deferred when no physical WebGPU environment is available:

1. actual WGSL compilation and validation,
2. physical axial conversion texture comparison,
3. physical product/reference pixel parity,
4. validation counter readback,
5. half-float storage tolerance measurement,
6. timestamp performance comparison,
7. repeated-run GPU memory plateau,
8. packaged Electron asset and execution identity.

These shall not be silently counted as PASS.

R9 remains the physical GPU promotion authority.

---

# 35. Promotion and State Rules

## 35.1 Source-verified state

R5 may enter:

```text
RESAMPLE_RUNTIME_R5_AXIAL_SUBPIXEL_CONTINUITY_SEALED_AWAITING_R6
```

only when all mandatory source and mock gates pass and all unavailable physical/package gates are explicitly deferred.

## 35.2 Production Pointer

R5 shall not move the Production Pointer.

## 35.3 Rollback

Because R5 is not promoted, rollback consists of restoring the parent R4 source bundle. No runtime preference shall silently select R4 when R5 canonical execution fails.

## 35.4 Next authority

```text
TDT-RESAMPLE-RUNTIME-01-R6

Kernel ABI v4 /
Sharpness·Taper·Border SSOT /
Generated WGSL Kernel Identity Seal
```

---

# 36. Non-Claims

A source-only R5 bake shall not claim:

- physical GPU pixel parity,
- exact half-float behavior across adapters,
- absolute performance improvement,
- Preview/Export lowpass identity,
- kernel sharpness configurability,
- policy-field subpixel continuity,
- packaged Electron success,
- production promotion,
- Hannakairo topology reuse,
- tensor Tile Atlas residency.

---

# 37. Required Bake Artifacts

The R5 bake shall emit:

```text
TDT_RESAMPLE_RUNTIME_01_R5_FIXTURE_MANIFEST.json
TDT_RESAMPLE_RUNTIME_01_R5_ORACLE_IDENTITY.json
TDT_RESAMPLE_RUNTIME_01_R5_AXIAL_CONVERSION_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_SIGN_INVARIANCE_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_BRANCH_SEAM_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_CANCELLATION_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_SUBPIXEL_CONTINUITY_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_SOURCE_CONTRACT_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_RUNTIME_WIRING_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_ZERO_FALLBACK_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_PREDECESSOR_REGRESSION_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_GATE_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_FINAL_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R5_CHANGED_FILE_MANIFEST.json
TDT_RESAMPLE_RUNTIME_01_R5.diff
README_TDT_RESAMPLE_RUNTIME_01_R5_APPLIED.md
```

All JSON shall use stable key ordering or an equivalent deterministic serializer.

---

# 38. Gate Matrix

## R5-001 `PARENT_BUNDLE_IDENTITY`

- **Requirement:** parent ZIP SHA-256 equals the admitted R4 digest
- **Evidence:** parent identity receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_BUNDLE_IDENTITY_MISMATCH`

## R5-002 `R4_PRODUCT_R4_FROZEN`

- **Requirement:** R4 reach-4 product shader remains byte-identical
- **Evidence:** SHA-256 comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-003 `R4_PRODUCT_R6_FROZEN`

- **Requirement:** R4 reach-6 product shader remains byte-identical
- **Evidence:** SHA-256 comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-004 `R4_VALIDATION_R4_FROZEN`

- **Requirement:** R4 reach-4 validation shader remains byte-identical
- **Evidence:** SHA-256 comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-005 `R4_VALIDATION_R6_FROZEN`

- **Requirement:** R4 reach-6 validation shader remains byte-identical
- **Evidence:** SHA-256 comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-006 `R4_REFERENCE_FROZEN`

- **Requirement:** R4 direct reference remains byte-identical
- **Evidence:** SHA-256 comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-007 `R4_PROFILE_FROZEN`

- **Requirement:** R4 phase-aware profile selector remains byte-identical
- **Evidence:** SHA-256 comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-008 `R4_PARITY_FROZEN`

- **Requirement:** R4 parity runtime remains byte-identical
- **Evidence:** SHA-256 comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-009 `R3_ORACLE_REGRESSION`

- **Requirement:** R3 fractional-phase oracle and negative control remain valid
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-010 `R4_COORDINATE_REGRESSION`

- **Requirement:** R4 continuous source-lattice gates remain valid
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-011 `TANGENT_EIGEN_FROZEN`

- **Requirement:** existing eigen tangent WGSL remains byte-identical
- **Evidence:** SHA-256 comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-012 `TANGENT_SEMANTIC_PRESERVED`

- **Requirement:** existing tangent Analysis Field semantic remains unchanged
- **Evidence:** source and receipt scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_SCHEMA_MISMATCH`

## R5-013 `AXIAL_SHADER_PRESENT`

- **Requirement:** versioned GPU axial conversion shader exists
- **Evidence:** asset manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RUNTIME_ASSET_MISSING`

## R5-014 `AXIAL_SCHEMA_UNIQUE`

- **Requirement:** R5 axial field semantic is unique and distinct from tangent and Hannakairo
- **Evidence:** semantic scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_SCHEMA_MISMATCH`

## R5-015 `AXIAL_FORMAT_RGBA16F`

- **Requirement:** axial field format is rgba16float
- **Evidence:** source contract
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_SCHEMA_MISMATCH`

## R5-016 `AXIAL_CHANNEL_CONTRACT`

- **Requirement:** RG double angle, B coherence, A edge contract is explicit
- **Evidence:** source and receipt scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_SCHEMA_MISMATCH`

## R5-017 `AXIAL_NEUTRAL_RECORD`

- **Requirement:** invalid conversion writes exact (1,0,0,0)
- **Evidence:** oracle and source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_NEUTRAL_IDENTITY_MISMATCH`

## R5-018 `AXIAL_INPUT_FINITE`

- **Requirement:** conversion validates finite input
- **Evidence:** source scan and fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_NONFINITE_FIELD`

## R5-019 `AXIAL_INPUT_NORM`

- **Requirement:** conversion rejects zero-length tangent
- **Evidence:** fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_NORMALIZATION_FAILED`

## R5-020 `AXIAL_TANGENT_NORMALIZE`

- **Requirement:** valid tangent is normalized before conversion
- **Evidence:** source scan and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_NORMALIZATION_FAILED`

## R5-021 `AXIAL_ALGEBRAIC_FORM`

- **Requirement:** conversion uses tx²-ty² and 2tx ty
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_CONVERSION_MISMATCH`

## R5-022 `AXIAL_OUTPUT_RENORMALIZE`

- **Requirement:** doubled-angle output is normalized
- **Evidence:** source scan and fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_NORMALIZATION_FAILED`

## R5-023 `AXIAL_NO_ATAN2`

- **Requirement:** product axial conversion uses no atan2
- **Evidence:** forbidden-token scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_CONVERSION_MISMATCH`

## R5-024 `AXIAL_NO_TRIG`

- **Requirement:** product axial conversion uses no sin/cos inverse trig
- **Evidence:** forbidden-token scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_CONVERSION_MISMATCH`

## R5-025 `AXIAL_SIGN_INVARIANCE`

- **Requirement:** axial(t) equals axial(-t)
- **Evidence:** binary64 fixture receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_SIGN_INVARIANCE_FAILED`

## R5-026 `AXIAL_CARDINAL_FIXTURES`

- **Requirement:** horizontal and vertical conversion fixtures pass
- **Evidence:** oracle receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_CONVERSION_MISMATCH`

## R5-027 `AXIAL_DIAGONAL_FIXTURES`

- **Requirement:** 45-degree and oblique conversion fixtures pass
- **Evidence:** oracle receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_CONVERSION_MISMATCH`

## R5-028 `AXIAL_PASS_AFTER_EIGEN`

- **Requirement:** GPU axial pass is encoded after eigen
- **Evidence:** runtime source scan and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_MISSING`

## R5-029 `AXIAL_SAME_SUBMISSION`

- **Requirement:** axial pass remains GPU-resident in tensor submission
- **Evidence:** mock receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_MISSING`

## R5-030 `AXIAL_TEXTURE_OWNERSHIP`

- **Requirement:** stage handle owns axial texture
- **Evidence:** mock lifecycle receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-031 `AXIAL_RELEASE_EXACTLY_ONCE`

- **Requirement:** axial texture destroys exactly once
- **Evidence:** mock lifecycle receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-032 `AXIAL_FAILURE_CLOSURE`

- **Requirement:** failure path destroys axial texture exactly once
- **Evidence:** mock failure receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-033 `HANDLE_TANGENT_COMPAT`

- **Requirement:** fieldTexture remains tangent field
- **Evidence:** runtime source contract
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_SCHEMA_MISMATCH`

## R5-034 `HANDLE_AXIAL_EXPLICIT`

- **Requirement:** axialFieldTexture is explicit
- **Evidence:** runtime source contract
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_MISSING`

## R5-035 `TEMP_COUNT_SIX`

- **Requirement:** canonical tensor temporary count updates to six
- **Evidence:** receipt scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-036 `R5_PRODUCT_R4_PRESENT`

- **Requirement:** versioned R5 reach-4 product shader exists
- **Evidence:** asset manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RUNTIME_ASSET_MISSING`

## R5-037 `R5_PRODUCT_R6_PRESENT`

- **Requirement:** versioned R5 reach-6 product shader exists
- **Evidence:** asset manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RUNTIME_ASSET_MISSING`

## R5-038 `R5_VALIDATION_R4_PRESENT`

- **Requirement:** versioned R5 reach-4 validation shader exists
- **Evidence:** asset manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RUNTIME_ASSET_MISSING`

## R5-039 `R5_VALIDATION_R6_PRESENT`

- **Requirement:** versioned R5 reach-6 validation shader exists
- **Evidence:** asset manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RUNTIME_ASSET_MISSING`

## R5-040 `R5_REFERENCE_PRESENT`

- **Requirement:** versioned R5 direct reference exists
- **Evidence:** asset manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RUNTIME_ASSET_MISSING`

## R5-041 `SOURCE_P_UNCHANGED`

- **Requirement:** R5 uses the exact R4 continuous source position
- **Evidence:** source formula scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-042 `TENSOR_BASE_FLOOR`

- **Requirement:** axial neighborhood base is floor(p)
- **Evidence:** source formula scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-043 `TENSOR_FRACT_FROM_P`

- **Requirement:** fractional weights derive from p-floor(p)
- **Evidence:** source formula scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-044 `FOUR_LOGICAL_NEIGHBORS`

- **Requirement:** 00,10,01,11 logical neighbors are used
- **Evidence:** source and oracle scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-045 `FOUR_TEXTURE_LOADS`

- **Requirement:** manual four-load tensor sampling is used
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-046 `NO_TENSOR_TEXTURE_SAMPLE`

- **Requirement:** no textureSample path samples the axial field
- **Evidence:** forbidden-token scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-047 `NO_TANGENT_BILINEAR`

- **Requirement:** signed tangent vectors are not bilinear interpolated
- **Evidence:** source semantic scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_BRANCH_CUT_INTERPOLATION_FAILURE`

## R5-048 `BILINEAR_WEIGHT_NONNEGATIVE`

- **Requirement:** spatial weights are nonnegative
- **Evidence:** oracle invariant
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-049 `BILINEAR_WEIGHT_SUM`

- **Requirement:** spatial weights sum to one
- **Evidence:** oracle invariant
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-050 `BORDER_WEIGHT_UNCLAMPED`

- **Requirement:** border clamp does not alter fractional weights
- **Evidence:** border fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_EDGE_INTERPOLATION_MISMATCH`

## R5-051 `BORDER_FETCH_CLAMPED`

- **Requirement:** all axial fetch coordinates clamp safely
- **Evidence:** source and fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-052 `SAMPLE_AXIAL_RENORMALIZE`

- **Requirement:** each valid sampled axial vector is normalized
- **Evidence:** source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_NORMALIZATION_FAILED`

## R5-053 `SAMPLE_INVALID_NEUTRALIZE`

- **Requirement:** invalid sampled records contribute zero confidence
- **Evidence:** fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_NONFINITE_FIELD`

## R5-054 `COHERENCE_WEIGHTED_SUM`

- **Requirement:** axial accumulator uses spatial weight times coherence
- **Evidence:** source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R5_COHERENCE_AGREEMENT_MISMATCH`

## R5-055 `COHERENCE_MASS_RETAINED`

- **Requirement:** plain confidence mass is available for validation
- **Evidence:** validation source
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-056 `EFFECTIVE_COHERENCE_MAGNITUDE`

- **Requirement:** effective coherence equals accumulator magnitude
- **Evidence:** source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R5_COHERENCE_AGREEMENT_MISMATCH`

## R5-057 `EFFECTIVE_COHERENCE_BOUNDED`

- **Requirement:** effective coherence remains in [0,1]
- **Evidence:** oracle invariant
- **Source-state rule:** PASS
- **Failure code:** `E_R5_COHERENCE_AGREEMENT_MISMATCH`

## R5-058 `PHASE_AGREEMENT_BOUNDED`

- **Requirement:** diagnostic phase agreement remains in [0,1]
- **Evidence:** oracle invariant
- **Source-state rule:** PASS
- **Failure code:** `E_R5_COHERENCE_AGREEMENT_MISMATCH`

## R5-059 `EDGE_BILINEAR`

- **Requirement:** edge uses spatial bilinear interpolation
- **Evidence:** source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R5_EDGE_INTERPOLATION_MISMATCH`

## R5-060 `EDGE_NOT_DIRECTION_WEIGHT`

- **Requirement:** edge does not weight axial direction in R5
- **Evidence:** source semantic scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-061 `ZERO_COHERENCE_NEUTRAL`

- **Requirement:** zero confidence produces neutral axial identity
- **Evidence:** fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_NEUTRAL_IDENTITY_MISMATCH`

## R5-062 `ORTHOGONAL_CANCELLATION`

- **Requirement:** equal orthogonal axes produce zero effective coherence
- **Evidence:** fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_NEUTRAL_IDENTITY_MISMATCH`

## R5-063 `UNEQUAL_CONFIDENCE_DOMINANCE`

- **Requirement:** high-confidence axis dominates low-confidence conflict
- **Evidence:** fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_COHERENCE_AGREEMENT_MISMATCH`

## R5-064 `CONSTANT_FIELD_PHASE_INVARIANCE`

- **Requirement:** constant axial field is phase invariant
- **Evidence:** phase sweep receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_SUBPIXEL_DIRECTION_DISCONTINUITY`

## R5-065 `VERTICAL_SEAM_SHORT_PATH`

- **Requirement:** +89/-89 seam stays vertical
- **Evidence:** branch seam receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_BRANCH_CUT_INTERPOLATION_FAILURE`

## R5-066 `ONE_179_SEAM_SHORT_PATH`

- **Requirement:** +1/179 seam follows axial short path
- **Evidence:** branch seam receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_BRANCH_CUT_INTERPOLATION_FAILURE`

## R5-067 `SIGN_FLIP_FIELD_IDENTITY`

- **Requirement:** whole-field sign flip produces identical interpolation
- **Evidence:** sign fixture receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_SIGN_INVARIANCE_FAILED`

## R5-068 `HALF_ANGLE_ALGEBRAIC`

- **Requirement:** reconstruction uses algebraic square-root form
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_HALF_ANGLE_RECONSTRUCTION_FAILED`

## R5-069 `HALF_ANGLE_NO_ATAN2`

- **Requirement:** reconstruction uses no atan2
- **Evidence:** forbidden-token scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_HALF_ANGLE_RECONSTRUCTION_FAILED`

## R5-070 `HALF_ANGLE_VERTICAL_FALLBACK`

- **Requirement:** exact vertical axis maps to (0,1)
- **Evidence:** oracle fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_HALF_ANGLE_RECONSTRUCTION_FAILED`

## R5-071 `HALF_ANGLE_CANONICAL_SIGN`

- **Requirement:** reconstructed tangent lies in canonical half-plane
- **Evidence:** oracle invariant
- **Source-state rule:** PASS
- **Failure code:** `E_R5_HALF_ANGLE_RECONSTRUCTION_FAILED`

## R5-072 `HALF_ANGLE_ROUNDTRIP`

- **Requirement:** reconstructed tangent returns original doubled angle
- **Evidence:** oracle invariant
- **Source-state rule:** PASS
- **Failure code:** `E_R5_HALF_ANGLE_RECONSTRUCTION_FAILED`

## R5-073 `ELLIPSE_USES_EFFECTIVE_FIELD`

- **Requirement:** ellipse consumes reconstructed tangent, effective coherence, and bilinear edge
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-074 `ISOTROPIC_AT_ZERO_COHERENCE`

- **Requirement:** zero effective coherence yields anisotropy one
- **Evidence:** oracle fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_NEUTRAL_IDENTITY_MISMATCH`

## R5-075 `R4_SAMPLE_LATTICE_PRESERVED`

- **Requirement:** source base/sampleCoord/delta formulas remain R4
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-076 `R4_TILE_ORIGIN_PRESERVED`

- **Requirement:** phase-aware source tile origin remains unchanged
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PARENT_ASSET_MUTATION`

## R5-077 `R4_STRICT_SOURCE_TILE`

- **Requirement:** product source pixels remain strict shared-tile reads
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_REFERENCE_AS_PRODUCT_WIRED`

## R5-078 `R4_PROFILE_SELECTION_PRESERVED`

- **Requirement:** R4 reach and storage proof still select profiles
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CANONICAL_RUNTIME_STILL_R4`

## R5-079 `R5_REFERENCE_DIRECT_SOURCE`

- **Requirement:** R5 reference direct-loads source candidates
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-080 `R5_PRODUCT_REFERENCE_DISTINCT`

- **Requirement:** product and reference shader digests differ
- **Evidence:** runtime creation check
- **Source-state rule:** PASS
- **Failure code:** `E_R5_REFERENCE_AS_PRODUCT_WIRED`

## R5-081 `R5_REFERENCE_NOT_FALLBACK`

- **Requirement:** reference cannot be selected automatically
- **Evidence:** branch scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_REFERENCE_AS_PRODUCT_WIRED`

## R5-082 `ORACLE_PRESENT`

- **Requirement:** binary64 axial oracle exists
- **Evidence:** tool manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-083 `ORACLE_CONVERSION_SELF_TEST`

- **Requirement:** oracle conversion self-tests pass
- **Evidence:** oracle receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_CONVERSION_MISMATCH`

## R5-084 `ORACLE_INTERPOLATION_SELF_TEST`

- **Requirement:** oracle interpolation self-tests pass
- **Evidence:** oracle receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-085 `ORACLE_RECONSTRUCTION_SELF_TEST`

- **Requirement:** oracle half-angle self-tests pass
- **Evidence:** oracle receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_HALF_ANGLE_RECONSTRUCTION_FAILED`

## R5-086 `ORACLE_FIXTURE_BOUND`

- **Requirement:** oracle fixtures remain bounded to validation dimensions
- **Evidence:** tool source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CPU_FALLBACK_WIRED`

## R5-087 `ORACLE_RUNTIME_EXCLUSION`

- **Requirement:** oracle has zero runtime imports
- **Evidence:** graph and import scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CPU_FALLBACK_WIRED`

## R5-088 `PHASE_SWEEP_X_CONTINUITY`

- **Requirement:** subpixel X sweep remains continuous
- **Evidence:** continuity receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_SUBPIXEL_DIRECTION_DISCONTINUITY`

## R5-089 `PHASE_SWEEP_Y_CONTINUITY`

- **Requirement:** subpixel Y sweep remains continuous
- **Evidence:** continuity receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_SUBPIXEL_DIRECTION_DISCONTINUITY`

## R5-090 `PHASE_SWEEP_DIAGONAL_CONTINUITY`

- **Requirement:** diagonal phase sweep remains continuous
- **Evidence:** continuity receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_SUBPIXEL_DIRECTION_DISCONTINUITY`

## R5-091 `ONE_BY_ONE_BORDER`

- **Requirement:** 1x1 axial field behaves as clamp-constant
- **Evidence:** border fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-092 `ONE_BY_N_BORDER`

- **Requirement:** 1xN axial field passes
- **Evidence:** border fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-093 `N_BY_ONE_BORDER`

- **Requirement:** Nx1 axial field passes
- **Evidence:** border fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_INTERPOLATION_MISMATCH`

## R5-094 `NONFINITE_NEUTRALIZATION`

- **Requirement:** NaN and infinity records cannot reach ellipse math
- **Evidence:** validation fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_NONFINITE_FIELD`

## R5-095 `COHERENCE_CLAMP`

- **Requirement:** out-of-range coherence is clamped
- **Evidence:** validation fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_COHERENCE_AGREEMENT_MISMATCH`

## R5-096 `EDGE_CLAMP`

- **Requirement:** out-of-range edge is clamped
- **Evidence:** validation fixture
- **Source-state rule:** PASS
- **Failure code:** `E_R5_EDGE_INTERPOLATION_MISMATCH`

## R5-097 `VALIDATION_INVALID_COUNTER`

- **Requirement:** validation exposes invalid axial count
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-098 `VALIDATION_CANCELLATION_COUNTER`

- **Requirement:** validation exposes cancellation count
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-099 `VALIDATION_VERTICAL_COUNTER`

- **Requirement:** validation exposes vertical fallback count
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-100 `VALIDATION_NONFINITE_COUNTER`

- **Requirement:** validation exposes nonfinite field count
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-101 `VALIDATION_WEIGHT_COUNTER`

- **Requirement:** validation exposes bilinear weight violations
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-102 `VALIDATION_RECONSTRUCTION_COUNTER`

- **Requirement:** validation exposes reconstruction mismatch count
- **Evidence:** source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-103 `CANONICAL_LOADER_R5`

- **Requirement:** canonical EWA loader selects R5 product family
- **Evidence:** runtime source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CANONICAL_RUNTIME_STILL_R4`

## R5-104 `CANONICAL_STACK_AXIAL_BIND`

- **Requirement:** canonical stack binds axialFieldTexture
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_MISSING`

## R5-105 `MISSING_AXIAL_FAIL_CLOSED`

- **Requirement:** missing axial texture rejects without nearest fallback
- **Evidence:** mock runtime
- **Source-state rule:** PASS
- **Failure code:** `E_R5_AXIAL_FIELD_MISSING`

## R5-106 `TANGENT_BIND_REJECT`

- **Requirement:** tangent texture cannot masquerade as R5 axial field
- **Evidence:** mock runtime
- **Source-state rule:** PASS
- **Failure code:** `E_R5_TANGENT_FIELD_BOUND_TO_R5_PRODUCT`

## R5-107 `BUNDLE_AXIAL_IDENTITIES`

- **Requirement:** bundle exposes all R5 axial IDs
- **Evidence:** runtime source and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-108 `CACHE_AXIAL_IDENTITIES`

- **Requirement:** pipeline cache key includes R5 axial IDs
- **Evidence:** runtime source scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-109 `RUNTIME_EPOCH_REJECT`

- **Requirement:** stale runtime epoch rejects
- **Evidence:** mock runtime
- **Source-state rule:** PASS
- **Failure code:** `E_R5_STALE_PIPELINE_EPOCH`

## R5-110 `DEVICE_EPOCH_REJECT`

- **Requirement:** stale device epoch rejects
- **Evidence:** mock runtime
- **Source-state rule:** PASS
- **Failure code:** `E_R5_STALE_PIPELINE_EPOCH`

## R5-111 `DEVICE_IDENTITY_REJECT`

- **Requirement:** foreign device identity rejects
- **Evidence:** mock runtime
- **Source-state rule:** PASS
- **Failure code:** `E_R5_STALE_PIPELINE_EPOCH`

## R5-112 `DEVICE_LOSS_DISPOSE`

- **Requirement:** device loss disposes R5 bundles
- **Evidence:** mock runtime
- **Source-state rule:** PASS
- **Failure code:** `E_R5_STALE_PIPELINE_EPOCH`

## R5-113 `NO_CPU_CONVERSION`

- **Requirement:** no CPU axial conversion is wired into product
- **Evidence:** runtime scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CPU_FALLBACK_WIRED`

## R5-114 `NO_CPU_INTERPOLATION`

- **Requirement:** no CPU tensor interpolation is wired into product
- **Evidence:** runtime scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CPU_FALLBACK_WIRED`

## R5-115 `NO_CANVAS_FALLBACK`

- **Requirement:** no Canvas field path is wired
- **Evidence:** runtime scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CPU_FALLBACK_WIRED`

## R5-116 `NO_WEBGL_FALLBACK`

- **Requirement:** no WebGL field path is wired
- **Evidence:** runtime scan
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CPU_FALLBACK_WIRED`

## R5-117 `NO_IMAGE_READBACK`

- **Requirement:** no full-size tensor or pixel readback is introduced
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R5_CPU_FALLBACK_WIRED`

## R5-118 `ACTIVE_ASSET_MANIFEST`

- **Requirement:** all R5 WGSL assets are admitted
- **Evidence:** generated manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RUNTIME_ASSET_MISSING`

## R5-119 `STATIC_ADMISSION`

- **Requirement:** static asset admission contains all R5 assets
- **Evidence:** generated manifest
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RUNTIME_ASSET_MISSING`

## R5-120 `ACTIVE_GRAPH_SINGLE_CANONICAL`

- **Requirement:** exactly one R5 canonical product family exists
- **Evidence:** active graph receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_ACTIVE_GRAPH_MISSING`

## R5-121 `GENERATED_REPLAY`

- **Requirement:** manifest regeneration is byte-identical
- **Evidence:** dual clean generation
- **Source-state rule:** PASS
- **Failure code:** `E_R5_GENERATED_MANIFEST_STALE`

## R5-122 `DETERMINISTIC_FIXTURES`

- **Requirement:** two clean fixture generations are byte-identical
- **Evidence:** digest comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-123 `DETERMINISTIC_RECEIPTS`

- **Requirement:** two clean source gate runs emit identical receipts
- **Evidence:** digest comparison
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-124 `R1A_REGRESSION`

- **Requirement:** R1A predecessor gate remains accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-125 `R1B_REGRESSION`

- **Requirement:** R1B predecessor gate remains accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-126 `R1C_REGRESSION`

- **Requirement:** R1C predecessor gate remains accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-127 `R1D_REGRESSION`

- **Requirement:** R1D predecessor gate remains accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-128 `R2_REGRESSION`

- **Requirement:** R2 predecessor source evidence remains accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-129 `R3_REGRESSION`

- **Requirement:** R3 oracle evidence remains accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-130 `R4_REGRESSION`

- **Requirement:** R4 coordinate and tile evidence remains accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PREDECESSOR_REGRESSION_FAILED`

## R5-131 `PRODUCTION_POINTER_UNCHANGED`

- **Requirement:** Production Pointer content and digest are unchanged
- **Evidence:** pointer receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_PRODUCTION_POINTER_MUTATION`

## R5-132 `SOURCE_RECEIPT_COMPLETE`

- **Requirement:** all required identities and counts are present
- **Evidence:** final source receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R5_RECEIPT_INCOMPLETE`

## R5-133 `PHYSICAL_WGSL_COMPILE`

- **Requirement:** physical WebGPU compilation evidence
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R5_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R5-134 `PHYSICAL_AXIAL_TEXTURE_PARITY`

- **Requirement:** physical axial conversion texture matches expected tolerance
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R5_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R5-135 `PHYSICAL_PRODUCT_REFERENCE_PARITY`

- **Requirement:** physical product/reference pixels match
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R5_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R5-136 `PHYSICAL_COUNTER_READBACK`

- **Requirement:** physical validation counters are read back
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R5_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R5-137 `PACKAGED_ELECTRON_IDENTITY`

- **Requirement:** packaged Electron contains and executes R5 assets
- **Evidence:** DEFERRED_TO_LATER_PROMOTION
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R5_PHYSICAL_GPU_CLAIM_UNSUPPORTED`


---

# 39. Final Acceptance Contract

R5 is accepted in the source-verified state only when every mandatory gate is `PASS`, every unavailable physical or packaged gate is explicitly `DEFERRED`, and no gate is `FAIL`.

The final summary shall preserve three distinct states:

```text
PASS
DEFERRED
FAIL
```

`DEFERRED` shall never be counted as `PASS`.

The accepted source statement is:

> The canonical stage-local EWA path preserves the R4 continuous source lattice while replacing nearest tangent-field selection with GPU-produced, sign-invariant doubled-angle tensor sampling at the exact fractional source position. Four explicit axial texture loads, coherence-weighted phase accumulation, agreement-derived effective coherence, bilinear edge interpolation, and algebraic half-angle reconstruction eliminate directed-vector branch seams and make contradictory orientation evidence collapse to isotropic identity. The tangent Analysis Field remains semantically unchanged, no runtime fallback or Production Pointer mutation is introduced, and physical GPU and packaged execution claims remain deferred.

The next authority is:

```text
TDT-RESAMPLE-RUNTIME-01-R6

Kernel ABI v4 /
Sharpness·Taper·Border SSOT /
Generated WGSL Kernel Identity Seal
```

---

# 40. Compact Implementation Checklist

```text
[ ] Verify R4 parent ZIP SHA-256.
[ ] Freeze all R4 product, validation, reference, profile, and parity assets.
[ ] Freeze the existing eigen tangent shader and semantic.
[ ] Add versioned GPU axial-conversion WGSL.
[ ] Define the R5 axial field schema and neutral record.
[ ] Preserve fieldTexture as tangent compatibility output.
[ ] Add axialFieldTexture as an explicit handle property.
[ ] Encode axial conversion after eigen on the GPU.
[ ] Update tensor temporary texture count from five to six.
[ ] Add R5 reach-4 and reach-6 product WGSL.
[ ] Add R5 validation WGSL.
[ ] Add R5 direct-load reference WGSL.
[ ] Sample four axial neighbors at floor(p) and fract(p).
[ ] Use unclamped p for bilinear weights.
[ ] Clamp only texture fetch coordinates.
[ ] Normalize each valid doubled-angle sample.
[ ] Weight axial direction by bilinear weight and coherence.
[ ] Set effective coherence to accumulator magnitude.
[ ] Bilinear-interpolate edge strength independently.
[ ] Neutralize exact phase cancellation.
[ ] Reconstruct canonical tangent algebraically.
[ ] Avoid atan2 and all trigonometric reconstruction.
[ ] Preserve R4 source lattice and shared-tile proof.
[ ] Bind axialFieldTexture in canonical DeltaK stack.
[ ] Reject missing or tangent-field R5 bindings.
[ ] Include axial identities in cache keys and receipts.
[ ] Add independent binary64 oracle and deterministic fixtures.
[ ] Verify +89/-89 and +1/179 branch seams.
[ ] Verify orthogonal cancellation and confidence dominance.
[ ] Verify X, Y, and diagonal subpixel continuity sweeps.
[ ] Add bounded validation counters.
[ ] Admit R5 assets to Active Graph and static manifests.
[ ] Keep oracle and fixtures outside runtime graphs.
[ ] Verify zero CPU, Canvas, WebGL, filtered-tangent, and reference fallback.
[ ] Run R1A through R4 predecessor regressions.
[ ] Emit deterministic receipts and changed-file manifest.
[ ] Leave physical GPU and packaged Electron gates deferred.
[ ] Do not move the Production Pointer.
```
