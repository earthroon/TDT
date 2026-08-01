# TDT-HANNAKAIRO-PHASE-01

## Axial Double-Angle Field / Wrapped Circulation / Winding·Defect GPU Truth Seal

- **Patch ID:** `TDT-HANNAKAIRO-PHASE-01`
- **Roadmap position:** `04`
- **Parent:** `TDT-SPECTRAL-QMAP-03`
- **Parent ZIP:** `57_TDT_SPECTRAL_QMAP_03_POWER_ENTROPY_PEAK_ORIENTATION_COMPLEX_PHASE_REDUCTION_SPECTRAL_FIELD_PUBLICATION_SOURCE_BAKED_AWAITING_PACKAGED_GPU.zip`
- **Parent ZIP SHA-256:** `bd25cd7093cbb38100b297d449b9db3bd51882126e23418199b1a6e7377b9c81`
- **Parent source seal:** `af0227a5858ba14f13e1a56d68909299cd029b8636970817f3d32627b2f268fd`
- **Predecessor source state:** `SPECTRAL_QMAP_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target source state:** `HANNAKAIRO_PHASE_01_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target verified state:** `HANNAKAIRO_PHASE_01_VERIFIED_UNPROMOTED`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Primary execution backend:** WebGPU
- **Kernel language:** WGSL
- **Canonical input:** exact-stage R1C tangent/coherence/edge Analysis Field
- **Canonical outputs:** axial double-angle field, local axial phase coherence field, signed winding/defect plaquette field
- **CPU phase computation:** forbidden
- **WebGL phase computation:** forbidden
- **Intermediate field readback:** forbidden
- **JavaScript/TypeScript role:** immutable parameter normalization, exact-stage input pinning, GPU command encoding, Authority publication, receipts, cancellation, error propagation
- **Status at specification issue:** `SPEC_DEFINED_UNBAKED`

---

# 0. Executive Contract

`TDT-HANNAKAIRO-PHASE-01` promotes Hannakairo topology from an unimplemented semantic reservation into a canonical GPU Analysis Field producer.

The product graph shall be:

```text
R1C stage-local tensor eigen field
        │
        ├─ same-device analysis-owned publication copy
        │      semantic: tangent / coherence / edge
        │
        ├─ axial conversion
        │      tangent t = (tx, ty)
        │      q = (tx² - ty², 2 tx ty)
        │
        ├─ local axial phase coherence
        │      weighted circular mean of q
        │
        ├─ wrapped plaquette circulation
        │      Σ atan2(cross(qi,qj), dot(qi,qj))
        │
        ├─ doubled-field winding snap
        │      n = nearest integer(Ω / 2π)
        │      defect charge s = n / 2
        │
        └─ atomic Analysis Field publication
               ├─ Hannakairo axial order
               ├─ Hannakairo phase coherence
               └─ Hannakairo winding / defect
```

The source-baked state shall prove that:

1. the existing R1C tensor result becomes an actual Authority-owned GPU Analysis Field without CPU copying or tensor recomputation,
2. tangent sign canonicalization does not affect the double-angle field,
3. axial orientation is represented with `cos(2θ), sin(2θ)`, not a signed arrow,
4. flat or incoherent pixels are explicitly invalid rather than assigned arbitrary topology,
5. local phase coherence is computed with a bounded GPU neighborhood and deterministic weights,
6. circulation uses a fixed image-coordinate loop orientation and explicit wrapped edge differences,
7. half-integer axial defects are derived from integer winding of the doubled field,
8. winding snap residual, corner validity, and coherence thresholds control defect validity,
9. all three output fields are published atomically under one execution receipt,
10. existing `phase_gate_hannakairo.frag` remains a separate directional compatibility gate and is not relabeled as topology,
11. `phase_field.js` remains non-product CPU compatibility code and cannot satisfy Hannakairo product requests,
12. no CPU, WebGL, Canvas, or intermediate host readback participates,
13. no Hannakairo field mutates R1D adaptation or R2 EWA output in this patch,
14. all predecessor Runtime, Surface, Preview, Export, Build, Codec, Spectral, and Analysis Authority gates remain intact.

This patch establishes topology truth and field publication. It does not yet fuse Hannakairo output into the resampler.

---

# 1. Parent Truth and Exact Baseline

## 1.1 Exact parent source identities

```text
app/legacy-runtime/core/compute/qmap_webgpu/structure_tensor_runtime.mjs
SHA-256: f4e291b3d9897979db6ab04e64a77146ee3e07b33d7bd84ab010f000b59599a1

app/legacy-runtime/core/compute/qmap_webgpu/shaders/structure_tensor_eigen_r1c.wgsl
SHA-256: c4560743a9d42718e261c2cd2f069289aed6efabd341dc11b89c7c765ff38728

app/legacy-runtime/shaders/phase_gate_hannakairo.frag
SHA-256: ada55441874355976e6d061264013e8dd948dee7615c5639288173dd39d7be9e

app/legacy-runtime/phase/phase_field.js
SHA-256: e6a38495d5084e94275c54ed2a8ea20b54df69e75b4487ed6ff39f6c0661af1d

app/src/runtime/analysis/analysis-field-authority-service.ts
SHA-256: bed1afe77abaac2cd7c9e135296af0d82e0d38bb4b7106dad3004cce31fee36a

app/src/runtime/analysis/generated/generated-analysis-semantic-registry.json
SHA-256: db7985f0eff5bf69272f03ed19e0c1b4094bd77de059a433e132e553b097bb17

app/src/runtime/analysis/generated/generated-analysis-producer-inventory.json
SHA-256: 969b5e58ac54f07ee56405ccd92e23263ab44f570d90fff39f67c605e5940f3f

app/src/runtime/assets/generated-runtime-asset-manifest.json
SHA-256: 7ff3723f3db4e0d8932ffb66c5b85118e5e5d0b285dd19671fd7c6ae7151f6be

app/src/runtime/active-graph/generated-active-runtime-graph.json
SHA-256: 9f0aa7d8fd5976ad3d2571febfd5522fb18d9dd635f454e863fd228d053d7f04
```

Generated parent identities:

```text
Analysis semantic registry version: tdt.analysis.semantic-registry.sq03.v1
Analysis semantic registry digest:  ef30532d1b82ee8833d6d0e3e7943791849275801afd96e4b4078cebd2ae1db8
Analysis producer inventory digest: 25730cbeb06ee66d3d79f0da046f8a1860d6aa84f8bab3c7b6f8a1cf75ee4d4e
Runtime asset manifest digest:      0b08a5b6ec9202e45dfcba57845d19cbceb7515d5592282c5575e9be7e401d1a
Active Graph digest:                dc7d7447dcc2e6474488180194d608dabb62a7ee1e0d3bedaa14cf0f61771c54
```

## 1.2 R1C tensor truth

The existing R1C eigen pass writes one `rgba16float` texel per stage pixel:

```text
R: tangent x
G: tangent y
B: tensor coherence [0,1]
A: normalized edge strength [0,1]
```

The eigen shader canonicalizes tangent sign, but the physical orientation remains axial:

```text
(tangent x, tangent y) ≡ (-tangent x, -tangent y)
θ ≡ θ + π
```

Hannakairo topology shall therefore consume an axial order representation. It shall not interpret the tangent as a directed vector.

## 1.3 Missing tensor Analysis Field publication

The parent producer inventory lists:

```text
producerId: tdt.analysis.producer.tensor.r1c
output:     tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
admission:  canonical
```

However the current tensor runtime returns a raw `GPUTexture` and a local receipt. It does not publish an `AnalysisFieldHandle` through Analysis Field Authority.

The current `release()` destroys the eigen texture together with its temporary textures. A future Hannakairo producer cannot safely retain or pin that raw texture.

Hannakairo Phase-01 shall therefore add an R1C tensor publication bridge that:

1. creates an analysis-owned `rgba16float` copy texture,
2. performs `copyTextureToTexture` after the eigen pass on the same device,
3. performs no CPU pixel copy,
4. attaches exact source revision and stage identity,
5. links the Analysis execution receipt to the R1C tensor receipt digest,
6. publishes the copy under `tdt.analysis.tensor.tangent-coherence-edge.r1c.v1`,
7. permits the original stage tensor texture to retain its existing EWA lifetime,
8. transfers ownership of only the copy to Analysis Field Authority.

The preferred implementation places the copy in the same command encoder as the tensor chain. A second GPU submission is permitted only if the first integration cannot preserve the existing R1C ABI, and the receipt must report the extra submission.

## 1.4 Existing Hannakairo shader truth

`phase_gate_hannakairo.frag` computes a bounded directional gate:

```text
phaseTerm = cos(dot(kvec, normalizedGradient))
gate      = bounded nonlinear mapping of phaseTerm
output    = Q × gate
```

It does not compute:

- spatial phase unwrapping,
- closed-loop circulation,
- integer winding,
- half-integer axial defect charge,
- singularity confidence,
- topological defect location.

It shall remain classified as:

```text
tdt.analysis.hannakairo.directional-gate.compat.v1
```

The file shall not be deleted, but it shall not satisfy any Phase-01 topology claim.

## 1.5 Existing CPU phase helper truth

`phase_field.js` contains CPU helpers for scalar phase unwrapping, representative band phase, scalar gamma, and tensor blending.

It is not an admissible product implementation because:

- it operates on CPU values,
- it has no source surface or device epoch identity,
- it has no GPU field lifecycle,
- it does not compute plaquette winding,
- it cannot publish Analysis Field receipts.

It remains compatibility/reference-only and shall not be called from the canonical Hannakairo producer.

## 1.6 Reserved Hannakairo semantics

The parent semantic registry already reserves:

```text
tdt.analysis.hannakairo.axial-order.v1
tdt.analysis.hannakairo.winding-defect.v1
tdt.analysis.hannakairo.phase-coherence.v1
```

The parent producer is still `future` and no effective publication receipt exists for these semantics.

Phase-01 may finalize their channel schemas and formats before first canonical publication. This is not semantic history rewriting because the reserved parent semantics have never reached `EFFECTIVE_EXECUTION`.

The generated registry version shall advance to:

```text
tdt.analysis.semantic-registry.hannakairo-phase-01.v1
```

---

# 2. Goals

1. Publish the R1C stage tensor as a real Analysis Field without CPU pixel movement.
2. Convert stage tangent vectors into sign-invariant axial double-angle order.
3. Preserve exact source surface, source revision, stage index, stage count, device identity, and device epoch.
4. Compute local axial phase coherence on the GPU.
5. Compute wrapped circulation around each valid stage plaquette.
6. Derive integer doubled-field winding and half-integer axial defect charge.
7. Make defect validity depend on finite input, corner validity, local coherence, and winding snap residual.
8. Publish axial, coherence, and winding fields atomically.
9. Provide deterministic synthetic GPU fixtures for zero, positive, and negative defect cases.
10. Provide an independent GPU reference path and comparator.
11. Preserve the existing Hannakairo directional compatibility facade without granting it topology claims.
12. Keep CPU and WebGL phase paths outside product execution.
13. Keep downstream resample pixels unchanged when Hannakairo fields are merely produced.
14. Preserve all parent gates and Production Pointer state.

---

# 3. Non-Goals

Phase-01 shall not implement:

- FFT or spectral reduction,
- Hilbert phase,
- Q-wave complex square root,
- Hannakairo directional policy fusion,
- R1D adaptation-field fusion,
- R2 EWA parameter mutation,
- defect-aware sharpening,
- texture synthesis,
- persistent GPU Tile Atlas residency,
- temporal tracking of moving defects,
- multi-scale topology fusion,
- CPU phase oracle in product runtime,
- absolute performance promotion,
- Production Pointer promotion.

The patch may include validation-only scalar readback from a compact comparator summary. It shall not read back image-sized fields.

---

# 4. Ownership and SSOT

## 4.1 Canonical producer identity

```text
producerId:       tdt.analysis.producer.hannakairo.topology
producerVersion:  1.0.0
implementationId: tdt-hannakairo-axial-winding-webgpu-v1
productAdmission: canonical
executionBackend: webgpu
kernelLanguage:   wgsl
```

Accepted input semantic:

```text
tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
```

Canonical output semantic set:

```text
tdt.analysis.hannakairo.axial-order.v1
tdt.analysis.hannakairo.phase-coherence.v1
tdt.analysis.hannakairo.winding-defect.v1
```

## 4.2 Tensor publication bridge ownership

The R1C tensor publication bridge belongs to the existing producer:

```text
producerId: tdt.analysis.producer.tensor.r1c
```

It shall not create a second tensor producer ID for the same R1C mathematical result.

The bridge may publish only an exact GPU copy of the existing eigen output. It shall not re-run gradients, tensor integration, eigen decomposition, or tangent canonicalization.

## 4.3 Device authority

All textures, shader modules, compute pipelines, bind groups, command encoders, and queue submissions shall use the current GPU Device Authority identity.

The producer shall not call:

```text
navigator.gpu.requestAdapter()
adapter.requestDevice()
```

A stale or lost device epoch shall invalidate the build and publish no output.

## 4.4 Analysis Field Authority

Analysis Field Authority owns:

- input field pinning,
- build lease state,
- output generation,
- atomic `publishFieldSet()`,
- output resource ownership,
- execution receipt,
- source revision binding,
- device-loss invalidation,
- consumer pinning and release.

The Hannakairo service shall not retain an output resource outside Authority after successful publication.

## 4.5 Stage identity

Hannakairo Phase-01 is stage-local.

Every request and output receipt shall include:

```text
sourceSurfaceId
sourceRevision
stageIndex
stageCount
stageWidth
stageHeight
```

A stage mismatch between the input tensor handle, request, and publication metadata shall fail before dispatch.

---

# 5. Coordinate and Sign Convention

## 5.1 Pixel coordinates

Storage coordinates use WebGPU image convention:

```text
x increases rightward
y increases downward
```

## 5.2 Mathematical positive loop

To preserve positive counterclockwise circulation in Cartesian coordinates with `y` upward, each image plaquette shall be traversed in this storage order:

```text
q00 = (x,   y)
q01 = (x,   y+1)
q11 = (x+1, y+1)
q10 = (x+1, y)

loop: q00 → q01 → q11 → q10 → q00
```

This explicit order defines the sign of winding and defect charge.

Implementations shall not silently use top-left → top-right → bottom-right → bottom-left unless they invert the resulting sign and record that convention in the shader identity.

## 5.3 Axial angle

The source tangent angle is:

```text
θ = atan2(ty, tx)
```

but `θ` and `θ + π` represent the same axis.

The canonical doubled phase is:

```text
φ = 2θ mod 2π
```

The order vector is:

```text
q = (cos φ, sin φ)
  = (tx² - ty², 2 tx ty)
```

The algebraic form is preferred because it is sign invariant and does not require `atan2()` in the product axial conversion pass.

---

# 6. Finalized Semantic Contracts

## 6.1 Tensor input

```text
semanticId:       tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
resourceKind:     texture-2d
format:           rgba16float
coordinateSpace:  stage-pixel
periodicity:      pi-axial
```

Channels:

```text
R tangent-x       [-1,1]
G tangent-y       [-1,1]
B coherence       [0,1]
A edge-strength   [0,1]
```

## 6.2 Hannakairo axial order

```text
semanticId:       tdt.analysis.hannakairo.axial-order.v1
resourceKind:     texture-2d
format:           rgba16float
coordinateSpace:  stage-pixel
periodicity:      pi-axial
```

Channels:

```text
R cos(2θ)            [-1,1]
G sin(2θ)            [-1,1]
B input-confidence   [0,1]
A validity           {0,1}
```

Neutral value:

```text
(1, 0, 0, 0)
```

Invalid pixels shall use the exact neutral value.

## 6.3 Hannakairo phase coherence

```text
semanticId:       tdt.analysis.hannakairo.phase-coherence.v1
resourceKind:     texture-2d
format:           rgba16float
coordinateSpace:  stage-pixel
periodicity:      none
```

Channels:

```text
R axial coherence          [0,1]
G valid-weight fraction    [0,1]
B valid-neighbor fraction  [0,1]
A validity                 {0,1}
```

Neutral value:

```text
(0, 0, 0, 0)
```

## 6.4 Hannakairo winding / defect

```text
semanticId:       tdt.analysis.hannakairo.winding-defect.v1
resourceKind:     texture-2d
format:           rgba16float
coordinateSpace:  stage-plaquette
periodicity:      signed-scalar
width:            stageWidth - 1
height:           stageHeight - 1
```

Channels:

```text
R signed axial charge   [-1,1]
G absolute charge       [0,1]
B defect confidence     [0,1]
A validity              {0,1}
```

Neutral value:

```text
(0, 0, 0, 0)
```

`stage-plaquette` shall be added to `AnalysisCoordinateSpace`.

Plaquette texel `(x,y)` represents the source-space center:

```text
(x + 0.5, y + 0.5)
```

## 6.5 Descriptor finalization rule

Because the parent Hannakairo descriptors are unpromoted future reservations with no effective field receipts, Phase-01 may finalize their formats and channel schemas.

The source gate shall prove:

1. no parent execution receipt exists for any of the three Hannakairo topology semantics,
2. the producer state was `future`,
3. the new registry digest differs intentionally,
4. all consumers use the new semantic digest,
5. no compatibility alias claims the new topology meaning.

---

# 7. Parameter Contract

## 7.1 Uniform ABI

```text
ABI ID:      tdt.hannakairo.phase.params.v1
ABI version: 1
byte size:   96
```

Canonical WGSL layout:

```wgsl
struct HannakairoPhaseParamsV1 {
  sourceSize: vec2<u32>,
  stageIndex: u32,
  stageCount: u32,

  invSourceSize: vec2<f32>,
  coherenceMin: f32,
  edgeMin: f32,

  tangentLengthEpsilon: f32,
  weightEpsilon: f32,
  windingSnapTolerance: f32,
  phaseCoherenceMin: f32,

  coherenceRadius: u32,
  minValidNeighbors: u32,
  maxDoubledWinding: u32,
  flags: u32,

  sourceRevisionLo: u32,
  sourceRevisionHi: u32,
  coordinateConvention: u32,
  reserved0: u32,

  reserved1: vec4<u32>,
};
```

## 7.2 Canonical v1 values

```text
coherenceMin:           0.08
edgeMin:                0.02
tangentLengthEpsilon:   1e-8
weightEpsilon:          1e-6
windingSnapTolerance:   π / 4
phaseCoherenceMin:      0.20
coherenceRadius:        1
minValidNeighbors:      4
maxDoubledWinding:      2
coordinateConvention:   image-y-down-math-positive-v1
```

These values are defaults, not hidden globals. Every normalized value shall participate in `parameterDigest`.

## 7.3 Validation

The normalizer shall reject:

- non-finite floats,
- negative thresholds,
- thresholds above 1 where bounded,
- even or zero neighborhood diameter,
- `coherenceRadius != 1` for v1 product mode,
- `minValidNeighbors > 9`,
- `maxDoubledWinding != 2` for v1 product mode,
- unknown flags,
- unknown coordinate convention.

There shall be no silent fallback to defaults after validation begins.

---

# 8. R1C Tensor Publication Bridge

## 8.1 Publication request

The existing `buildStageLocalTensorR1C()` request may gain an optional object:

```text
analysisPublication:
  enabled
  sourceSurfaceId
  sourceRevision
  stageIndex
  stageCount
  analysisJobId
```

Existing calls without this object shall preserve exact behavior and ABI.

## 8.2 Copy resource

When enabled, the runtime shall allocate:

```text
format: rgba16float
size:   stageWidth × stageHeight
usage:
  COPY_DST
  TEXTURE_BINDING
  STORAGE_BINDING
  COPY_SRC
```

The eigen source already has `COPY_SRC` usage.

## 8.3 Same-command copy

Preferred command order:

```text
gradient pass
outer-product pass
horizontal blur pass
vertical blur pass
eigen pass
copyTextureToTexture(eigen → analysisCopy)
submit
fence
```

No CPU-visible staging resource is permitted.

## 8.4 Tensor Analysis receipt

The publication metadata shall include:

```text
parentTensorReceiptDigest
tensorFieldSchemaId
tensorPipelineIdentity
tensorShaderDigests
tensorParameterDigest
stageIndex
stageCount
stageWidth
stageHeight
copySubmissionCount
copyMode: same-command | follow-up-command
```

The Analysis execution receipt shall state:

```text
cpuPixelComputeUsed: false
webglPixelComputeUsed: false
canvasPixelComputeUsed: false
intermediatePixelReadbackCount: 0
```

## 8.5 Ownership

- Original eigen texture remains owned by the R1C stage bundle.
- Analysis copy becomes owned by Analysis Field Authority.
- Destroying the R1C stage bundle shall not destroy the published copy.
- Disposing the Analysis field shall not destroy the original R1C stage texture.
- Device loss invalidates both through their respective authorities.

---

# 9. Axial Conversion Pass

## 9.1 Pipeline identity

```text
pipelineId: tdt.hannakairo.axial-convert.v1
entryPoint: main
workgroup:  8 × 8 × 1
```

## 9.2 Input validity

For each stage pixel:

```text
t = (tx, ty)
c = clamp(coherence, 0, 1)
e = clamp(edgeStrength, 0, 1)
```

The input is valid only if:

```text
all channels finite
length²(t) > tangentLengthEpsilon
c >= coherenceMin
e >= edgeMin
```

## 9.3 Confidence

The input confidence is:

```text
edgeGate = smoothstep(edgeMin, 1, e)
inputConfidence = clamp(c × edgeGate, 0, 1)
```

The exact smoothstep implementation shall be shared by product and GPU reference shaders.

## 9.4 Double-angle vector

For valid input:

```text
tn = normalize(t)
q  = (tn.x² - tn.y², 2 tn.x tn.y)
q  = normalize(q)
```

For invalid input:

```text
q = (1,0)
inputConfidence = 0
validity = 0
```

## 9.5 Sign-invariance gate

For every finite tangent fixture:

```text
axial(t) == axial(-t)
```

The GPU comparator shall require exact stored `rgba16float` identity for sign-flipped fixture pairs on the same device.

## 9.6 Output write

Each invocation writes exactly one axial output texel. No scatter or atomic write is permitted.

---

# 10. Local Axial Phase Coherence Pass

## 10.1 Pipeline identity

```text
pipelineId: tdt.hannakairo.phase-coherence.v1
entryPoint: main
workgroup:  8 × 8 × 1
radius:     1
window:     3 × 3
```

## 10.2 Weighted circular mean

For the valid neighborhood `N(p)`:

```text
wi = axialInputConfidence_i
S  = Σ wi qi
W  = Σ wi
C  = |S| / max(W, weightEpsilon)
```

`C` is the coherence of the doubled axial phase.

## 10.3 Neighbor accounting

```text
validWeightFraction   = W / max(Σ all clamped confidence, weightEpsilon)
validNeighborFraction = validNeighborCount / actualInBoundsNeighborCount
```

The output is valid only when:

```text
center axial validity = 1
validNeighborCount >= minValidNeighbors
W > weightEpsilon
all accumulators finite
```

## 10.4 Boundary policy

Only in-bounds neighbors participate.

The implementation shall not:

- clamp coordinates and count duplicated edge pixels,
- wrap around image borders,
- mirror the image,
- synthesize CPU padding.

Actual in-bounds neighbor count shall be used in the fraction denominator.

## 10.5 No hidden smoothing

This pass estimates coherence. It does not overwrite or smooth the axial order field.

Downstream topology reads both the original axial order and coherence result.

---

# 11. Wrapped Circulation Pass

## 11.1 Pipeline identity

```text
pipelineId: tdt.hannakairo.wrapped-circulation.v1
entryPoint: main
workgroup:  8 × 8 × 1
output:     (W - 1) × (H - 1)
```

## 11.2 Wrapped edge difference

For unit vectors `a` and `b` in doubled-angle space:

```text
cross2(a,b) = a.x b.y - a.y b.x
dot2(a,b)   = a.x b.x + a.y b.y
Δ(a,b)      = atan2(cross2(a,b), dot2(a,b))
```

`Δ` lies in `[-π, π]` under the WGSL `atan2(y,x)` convention.

The product shader shall clamp the dot input only to protect finite rounding. It shall not clamp the resulting angle or discard its sign.

## 11.3 Plaquette circulation

With the canonical loop:

```text
Ω = Δ(q00,q01)
  + Δ(q01,q11)
  + Δ(q11,q10)
  + Δ(q10,q00)
```

## 11.4 Deterministic integer snap

```text
r = Ω / 2π
```

The nearest integer uses an explicit half-away-from-zero function:

```text
snap(r) = floor(r + 0.5), r >= 0
          ceil(r - 0.5),  r < 0
```

WGSL implementation shall not rely on implementation-dependent host rounding.

```text
n = snap(r)
residual = |Ω - 2πn|
```

## 11.5 Axial defect charge

The physical axial charge is:

```text
s = n / 2
```

Canonical supported charges are:

```text
-1, -1/2, 0, +1/2, +1
```

A doubled winding with `|n| > 2` is treated as undersampled or invalid in v1.

## 11.6 Plaquette validity

A plaquette is valid only when:

```text
all four axial pixels valid
all four phase-coherence pixels valid
minimum corner input confidence > 0
minimum corner phase coherence >= phaseCoherenceMin
all wrapped edge differences finite
|n| <= maxDoubledWinding
residual <= windingSnapTolerance
```

## 11.7 Defect confidence

```text
cornerConfidence = min(inputConfidence at four corners)
cornerCoherence  = min(phaseCoherence at four corners)
snapConfidence   = clamp(1 - residual / windingSnapTolerance, 0, 1)

defectConfidence = min(cornerConfidence,
                       cornerCoherence,
                       snapConfidence)
```

A valid zero-charge plaquette may have positive confidence. Confidence means confidence in the circulation classification, not defect magnitude.

## 11.8 Invalid output

Invalid plaquettes write exact zero:

```text
(0,0,0,0)
```

They shall not write a guessed zero charge with validity one.

---

# 12. GPU Execution and Resource Plan

## 12.1 Product passes

```text
P0 axial conversion
P1 local phase coherence
P2 wrapped circulation / defect
```

The three passes shall be encoded into one command buffer and one queue submission per Hannakairo job.

## 12.2 Resource formats

```text
input tensor:       rgba16float texture-2d
axial order:        rgba16float storage / sampled texture
phase coherence:    rgba16float storage / sampled texture
winding defect:     rgba16float storage / sampled texture
uniform params:     96-byte uniform buffer
```

## 12.3 Bind groups

Product bind group layouts shall be explicit and digest-sealed.

Auto-layout pipelines are forbidden because source and validation shaders must share stable resource contracts.

## 12.4 Storage support

`rgba16float` storage write support shall be verified against the active device before pipeline creation.

Missing support shall fail with a stable error. It shall not silently switch to WebGL or CPU.

## 12.5 No intermediate readback

Product code shall not contain:

```text
MAP_READ
mapAsync
getMappedRange
copyTextureToBuffer for host inspection
WebGL readPixels
Canvas getImageData
```

The final fields remain GPU resident.

---

# 13. Atomic Field-Set Publication

## 13.1 Build lease

The Hannakairo service shall begin one Analysis build lease with the exact output semantic set.

## 13.2 Submission record

The submission record shall include:

```text
pipelineIds:
  tdt.hannakairo.axial-convert.v1
  tdt.hannakairo.phase-coherence.v1
  tdt.hannakairo.wrapped-circulation.v1

shaderAssetDigests: exact Runtime Asset Authority digests
submissionSequence: GPU Authority sequence
cpuPixelComputeUsed: false
webglPixelComputeUsed: false
canvasPixelComputeUsed: false
intermediatePixelReadbackCount: 0
```

## 13.3 Publication set

After fence completion, one `publishFieldSet()` call shall publish exactly three fields.

The common publication metadata shall include:

```text
hannakairoSchemaId
parameterDigest
inputTensorFieldId
inputTensorGeneration
inputTensorSemanticDigest
inputTensorExecutionReceiptDigest
parentTensorReceiptDigest
sourceSurfaceId
sourceRevision
stageIndex
stageCount
coordinateConvention
fieldSetSchemaVersion
```

## 13.4 Atomicity

If any publication fails validation:

- no field generation increments,
- no output handle remains visible,
- no partial execution receipt claims publication,
- all untransferred output textures are destroyed,
- the input tensor pin is released,
- the build lease transitions to `FAILED`.

## 13.5 Claim level

Source-baked runtime output may claim:

```text
EFFECTIVE_EXECUTION
```

only after a real GPU fence and successful atomic publication.

`PIXEL_VERIFIED` and higher claims require physical GPU validation gates.

---

# 14. Lifecycle, Cancellation, and Device Loss

## 14.1 Input pin lifetime

The exact tensor field pin shall remain active from request validation until:

- successful output publication, or
- terminal failure, cancellation, supersession, or invalidation.

## 14.2 Cancellation

Cancellation may be observed:

- before command encoding,
- before submission,
- after submission but before fence,
- after fence but before publication.

No cancelled job may publish fields.

GPU work already submitted may complete, but its resources shall be destroyed instead of published.

## 14.3 Supersession

A newer request for the same source revision and stage may supersede an older pending request.

Supersession identity shall include:

```text
producerId
sourceSurfaceId
sourceRevision
stageIndex
parameterDigest
```

## 14.4 Device loss

On device loss:

- pipeline bundle is invalidated,
- active output textures are not published,
- existing Hannakairo fields from the lost epoch become invalid,
- tensor input pins fail currentness checks,
- a new epoch requires new pipelines and fields,
- no old field handle may be rebound.

---

# 15. Legacy Compatibility and Naming

## 15.1 Existing directional shader

`phase_gate_hannakairo.frag` remains a compatibility directional gate.

It shall not be imported by the canonical Phase-01 service.

Its producer remains:

```text
tdt.analysis.producer.hannakairo.directional-compat
```

Its output semantic remains:

```text
tdt.analysis.hannakairo.directional-gate.compat.v1
```

## 15.2 Existing CPU helper

`phase_field.js` shall be classified as:

```text
CPU_SCALAR_COMPATIBILITY_HELPER
```

Product code shall not call it.

## 15.3 Public facade

A compatibility facade may expose:

```text
buildHannakairoPhaseFields(request)
```

The facade shall require an Analysis tensor field handle or a request that causes the canonical R1C publication bridge to produce one.

Raw CPU arrays, WebGL textures, Canvas elements, and image bitmaps shall be rejected.

## 15.4 No topology claim from compatibility output

The following shall never imply Hannakairo topology success:

- a scalar Q multiplier,
- the legacy GLSL gate output,
- a CPU phase number,
- a visual Q-wave phase,
- spectral complex phase alone,
- presence of a shader file.

Only a sealed Hannakairo execution receipt with all three field handles may claim effective topology execution.

---

# 16. WGSL Asset Set

The canonical asset set shall contain:

```text
dadum.asset.shader.hannakairo-axial-convert-v1
dadum.asset.shader.hannakairo-phase-coherence-v1
dadum.asset.shader.hannakairo-wrapped-circulation-v1
dadum.asset.shader.hannakairo-fixture-generator-v1
dadum.asset.shader.hannakairo-reference-v1
dadum.asset.shader.hannakairo-field-set-compare-v1
```

Suggested source paths:

```text
app/legacy-runtime/core/analysis/hannakairo/shaders/hannakairo-axial-convert.wgsl
app/legacy-runtime/core/analysis/hannakairo/shaders/hannakairo-phase-coherence.wgsl
app/legacy-runtime/core/analysis/hannakairo/shaders/hannakairo-wrapped-circulation.wgsl
app/legacy-runtime/core/analysis/hannakairo/shaders/hannakairo-fixture-generator.wgsl
app/legacy-runtime/core/analysis/hannakairo/shaders/hannakairo-reference.wgsl
app/legacy-runtime/core/analysis/hannakairo/shaders/hannakairo-field-set-compare.wgsl
```

Every asset shall be present in Runtime Asset Manifest and Active Graph with exact digest identity.

---

# 17. Planned Runtime Files

```text
app/src/runtime/analysis/hannakairo/hannakairo-phase-types.ts
app/src/runtime/analysis/hannakairo/hannakairo-phase-plan.ts
app/src/runtime/analysis/hannakairo/hannakairo-phase-receipt.ts
app/src/runtime/analysis/hannakairo/hannakairo-phase-job-arena.ts
app/src/runtime/analysis/hannakairo/hannakairo-phase-service.ts
app/src/runtime/analysis/hannakairo/hannakairo-phase-validation.ts
app/src/runtime/analysis/hannakairo/r1c-tensor-analysis-publication-adapter.ts

app/legacy-runtime/core/analysis/hannakairo/hannakairo_phase.mjs
app/legacy-runtime/core/analysis/hannakairo/shaders/*.wgsl
```

The Runtime Composition shall construct Hannakairo service only after:

```text
GPU Device Authority
Surface Authority
Analysis Field Authority
Runtime Asset Authority
```

The service shall not become a Final Surface or Export authority.

---

# 18. Error Contract

The patch shall register stable error codes including:

```text
E_HANNAKAIRO_ANALYSIS_AUTHORITY_UNAVAILABLE
E_HANNAKAIRO_GPU_AUTHORITY_UNAVAILABLE
E_HANNAKAIRO_ASSET_AUTHORITY_UNAVAILABLE
E_HANNAKAIRO_INPUT_FIELD_REQUIRED
E_HANNAKAIRO_INPUT_SEMANTIC_MISMATCH
E_HANNAKAIRO_INPUT_FORMAT_UNSUPPORTED
E_HANNAKAIRO_INPUT_STAGE_MISMATCH
E_HANNAKAIRO_INPUT_SOURCE_MISMATCH
E_HANNAKAIRO_INPUT_STALE
E_HANNAKAIRO_SOURCE_TOO_SMALL
E_HANNAKAIRO_PARAMETER_INVALID
E_HANNAKAIRO_UNIFORM_ABI_MISMATCH
E_HANNAKAIRO_SHADER_FETCH_FAILED
E_HANNAKAIRO_SHADER_DIGEST_MISMATCH
E_HANNAKAIRO_SHADER_COMPILE_FAILED
E_HANNAKAIRO_PIPELINE_NOT_READY
E_HANNAKAIRO_STORAGE_FORMAT_UNSUPPORTED
E_HANNAKAIRO_TENSOR_PUBLICATION_REQUIRED
E_HANNAKAIRO_TENSOR_PUBLICATION_COPY_FAILED
E_HANNAKAIRO_STALE_DEVICE_EPOCH
E_HANNAKAIRO_CANCELLED
E_HANNAKAIRO_SUPERSEDED
E_HANNAKAIRO_FIELD_SET_PUBLICATION_FAILED
E_HANNAKAIRO_CPU_COMPUTE_FORBIDDEN
E_HANNAKAIRO_WEBGL_FALLBACK_FORBIDDEN
E_HANNAKAIRO_CANVAS_FALLBACK_FORBIDDEN
E_HANNAKAIRO_INTERMEDIATE_READBACK_FORBIDDEN
E_HANNAKAIRO_VALIDATION_NOT_AVAILABLE
E_HANNAKAIRO_FIXTURE_INVALID
E_HANNAKAIRO_REFERENCE_MISMATCH
```

Errors shall preserve their stable code through facades and Worker RPC boundaries.

---

# 19. GPU Validation Fixtures

## 19.1 Constant field

```text
θ = constant
expected axial field: constant
expected phase coherence: 1 in valid interior
expected winding charge: 0
```

## 19.2 Tangent sign-flip field

Alternate pixels use `t` and `-t`.

```text
expected axial output: exact identity to constant t field
expected winding: 0
```

## 19.3 Positive half defect

```text
θ(x,y) = 0.5 × atan2(y-y0, x-x0)
φ = 2θ
expected doubled winding: +1
expected axial charge: +0.5
```

## 19.4 Negative half defect

```text
θ(x,y) = -0.5 × atan2(y-y0, x-x0)
expected doubled winding: -1
expected axial charge: -0.5
```

## 19.5 Positive unit defect component

A unit axial defect is undersampled by a single four-edge plaquette when every doubled-angle edge lands on the antipodal branch cut. The canonical fixture therefore places the singularity away from pixel centers and evaluates the connected set of valid plaquettes around the core.

```text
θ(x,y) = atan2(-(y-y0), x-x0)   // image-space y grows downward
expected component-integrated doubled winding: +2
expected component-integrated axial charge: +1
expected local representation: two +1/2 plaquettes for the canonical fixture
```

A product shader shall not manufacture a single +1 plaquette from an unresolved antipodal `atan2(±0,-1)` tie. Component integration is validation/accounting metadata in HP01; persistent defect clustering is reserved for a later consumer seal.

## 19.6 Low-confidence field

The orientation may rotate, but coherence or edge is below threshold.

```text
expected axial validity: 0 where below threshold
expected overlapping plaquette validity: 0
```

## 19.7 Noisy non-defect field

A smooth orientation with bounded noise shall not snap to a nonzero charge unless the circulation residual satisfies the exact tolerance.

## 19.8 Boundary fixtures

Fixtures shall include:

- minimum `2×2` stage,
- odd dimensions,
- even dimensions,
- defect center on a pixel,
- defect center on a plaquette center,
- defect near but not crossing the image boundary.

---

# 20. Independent GPU Reference

The product path uses algebraic double-angle conversion and cross/dot wrapped differences.

The reference shader shall use a structurally independent method:

1. compute `φ = atan2(q.y, q.x)` per corner,
2. compute explicit scalar wrapped differences with a `wrapToPi()` function,
3. sum the canonical loop,
4. apply the same explicit snap rule,
5. emit reference axial, coherence, and winding records.

Product and reference shall share only:

- normalized parameters,
- input tensor fixture,
- coordinate convention constants.

They shall not share product helper source text.

---

# 21. Comparator Contract

The GPU comparator shall report a compact summary:

```text
axialExactMismatchCount
coherenceMismatchCount
windingMismatchCount
validityMismatchCount
nanCount
infinityCount
maxAxialAbsError
maxCoherenceAbsError
maxChargeAbsError
firstMismatchX
firstMismatchY
firstMismatchField
```

Same-device source promotion targets:

```text
axial sign-flip exact mismatch: 0
validity mismatch:              0
charge mismatch:                0 for synthetic fixtures
NaN count:                      0
Infinity count:                 0
```

A small comparator summary may be read back only in validation mode. Product execution shall not create the comparator buffer.

---

# 22. Receipt Contract

The Hannakairo execution receipt shall include:

```text
schemaVersion
receiptId
receiptDigest
producerId
producerVersion
implementationId
terminalState
effectiveExecution
inputTensorFieldHandle
inputTensorExecutionReceiptDigest
parentTensorReceiptDigest
sourceSurfaceId
sourceRevision
stageIndex
stageCount
stageWidth
stageHeight
coordinateConvention
parameterDigest
shaderSetDigest
resourceDescriptorDigest
pipelineIds
shaderAssetDigests
dispatches
submissionSequence
cpuPixelComputeUsed
webglPixelComputeUsed
canvasPixelComputeUsed
intermediatePixelReadbackCount
outputFieldHandles
fieldSetDigest
```

The receipt shall not contain fabricated defect counts unless they were produced by a validation summary or GPU reduction explicitly covered by the receipt.

---

# 23. Active Graph and Product Admission

The canonical Hannakairo service, tensor publication adapter, WGSL assets, semantic descriptors, producer inventory, stable errors, and gate tools shall be admitted into Active Graph.

The following remain non-canonical:

```text
app/legacy-runtime/shaders/phase_gate_hannakairo.frag
app/legacy-runtime/phase/phase_field.js
```

They may remain present or compatibility-admitted, but shall not be dependencies of the canonical topology producer.

Active Graph shall prove:

- one canonical Hannakairo topology producer,
- one existing directional compatibility producer,
- no CPU topology consumer,
- no dynamic shader URL outside Runtime Asset Manifest,
- no random or wall-clock field identity,
- no direct adapter/device creation,
- no product WebGL phase path.

---

# 24. Source Bake Tooling

The patch shall add deterministic tools such as:

```text
tools/hannakairo-phase-01/run.mjs
tools/hannakairo-phase-01/lib.mjs
tools/hannakairo-phase-01/verify-source-contract.mjs
tools/hannakairo-phase-01/verify-wgsl-contract.mjs
tools/hannakairo-phase-01/runtime-smoke.mjs
tools/hannakairo-phase-01/gate.mjs
tools/hannakairo-phase-01/finalize.mjs
```

Source tooling shall verify:

- semantic registry finalization,
- producer inventory promotion,
- tensor publication bridge source contract,
- fixed coordinate convention,
- explicit snap function,
- no CPU/WebGL/Canvas fallback,
- no product readback,
- atomic three-field publication,
- fixture mathematics,
- WGSL structural balance,
- stable error registration,
- Active Graph asset closure,
- predecessor regression.

---

# 25. Source-Bake versus Physical-GPU Truth

## 25.1 Source-bake claims

Source bake may claim:

- complete TypeScript and WGSL source contract,
- deterministic parameter and semantic identities,
- mock mathematical fixture correctness,
- no source-level CPU or WebGL product fallback,
- Authority publication transaction contract,
- parent regression preservation.

## 25.2 Deferred claims

Source bake shall not claim:

- actual WGSL compilation on the target browser,
- physical `rgba16float` storage behavior,
- physical GPU fixture parity,
- actual zero readback observed by browser instrumentation,
- device-loss behavior on RTX 3080,
- packaged Electron relaunch cleanup,
- performance or memory plateau.

These remain deferred to physical gates.

---

# 26. Regression Contract

The following predecessors shall remain passing or honestly deferred with zero new failure:

```text
TDT-ANALYSIS-FIELD-TRUTH-00
TDT-SPECTRAL-QMAP-02
TDT-SPECTRAL-QMAP-03
TDT-RESAMPLE-RUNTIME-01-R1A
TDT-RESAMPLE-RUNTIME-01-R1B
TDT-RESAMPLE-RUNTIME-01-R1C
TDT-RESAMPLE-RUNTIME-01-R1D
TDT-RESAMPLE-RUNTIME-01-R2
TDT-GPU-DEVICE-SSOT-01
TDT-SURFACE-LIFECYCLE-01
TDT-PREVIEW-PRESENTER-01
TDT-RUNTIME-SSOT-01-R7
TDT-EXPORT-WORKER-01 through 07
TDT-EXPORT-PROMOTION-01 through 03
TDT-BUILD-LOCK-01
TDT-BUILD-EMIT-01
TDT-MODJPEG-01
TDT-NATIVE-DECODER-01
TDT-JXL-CODEC-01
TDT-PSD-DECODER-01
TDT-PROMOTION-BASELINE-00 source gate
```

Preview and Export Final Surface identity shall remain unchanged because Phase-01 only publishes optional analysis fields.

---

# 27. Artifact and Seal Contract

The source-baked package shall contain:

```text
README_TDT_HANNAKAIRO_PHASE_01_APPLIED.md
specs/TDT-HANNAKAIRO-PHASE-01_..._SPEC.md
patches/TDT_HANNAKAIRO_PHASE_01_...diff
patches/TDT_HANNAKAIRO_PHASE_01_CHANGED_FILE_MANIFEST.json
artifacts/hannakairo-phase-01/source-bake/TDT_HANNAKAIRO_PHASE_01_SOURCE_GATE.json
artifacts/hannakairo-phase-01/source-bake/TDT_HANNAKAIRO_PHASE_01_SOURCE_RECEIPT.json
artifacts/hannakairo-phase-01/source-bake/TDT_HANNAKAIRO_PHASE_01_REGRESSION_SUMMARY.json
```

The final ZIP shall be extracted into an independent directory and the source seal shall reproduce exactly.

Generated observation files that change only because a gate was rerun shall not be included in the source seal unless the finalizer regenerates them in a fixed canonical order.

---

# 28. Gate Matrix

The canonical gate set is `HP01-001` through `HP01-196`.

Source-bake expected result:

```text
PASS:     184
DEFERRED:  12
FAIL:       0
```

The 12 deferred gates are the physical GPU and Packaged Electron gates `HP01-177` through `HP01-188`.


- **HP01-001** `PARENT_ZIP_IDENTITY` - Parent ZIP SHA-256 and filename match the declared SQ03 parent.  
  Source expectation: **PASS required at source bake**.
- **HP01-002** `PARENT_SOURCE_SEAL` - Parent source seal equals the declared SQ03 source seal.  
  Source expectation: **PASS required at source bake**.
- **HP01-003** `PARENT_STATE` - Parent source state is SPECTRAL_QMAP_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU.  
  Source expectation: **PASS required at source bake**.
- **HP01-004** `PRODUCTION_POINTER_IMMUTABLE` - Production Pointer is unchanged.  
  Source expectation: **PASS required at source bake**.
- **HP01-005** `R1C_TENSOR_SOURCE_PRESENT` - R1C tensor runtime and eigen shader are present.  
  Source expectation: **PASS required at source bake**.
- **HP01-006** `R1C_TENSOR_SCHEMA_PRESENT` - R1C tensor schema is tangent/coherence/edge rgba16float.  
  Source expectation: **PASS required at source bake**.
- **HP01-007** `AFT00_AUTHORITY_PRESENT` - Analysis Field Authority with publishFieldSet is present.  
  Source expectation: **PASS required at source bake**.
- **HP01-008** `SQ03_REGISTRY_PRESENT` - SQ03 semantic registry and producer inventory are present.  
  Source expectation: **PASS required at source bake**.
- **HP01-009** `LEGACY_HANNAKAIRO_INVENTORIED` - Legacy Hannakairo directional shader is inventoried.  
  Source expectation: **PASS required at source bake**.
- **HP01-010** `CPU_PHASE_HELPER_INVENTORIED` - CPU phase helper is inventoried and classified.  
  Source expectation: **PASS required at source bake**.
- **HP01-011** `NO_PRIOR_TOPOLOGY_RECEIPT` - No effective Hannakairo topology receipt exists in the parent.  
  Source expectation: **PASS required at source bake**.
- **HP01-012** `SPEC_IDENTITY` - Patch ID, parent ID, target state, and gate range are internally consistent.  
  Source expectation: **PASS required at source bake**.
- **HP01-013** `TENSOR_BRIDGE_SINGLE_PRODUCER` - Tensor publication bridge uses the existing R1C producer ID.  
  Source expectation: **PASS required at source bake**.
- **HP01-014** `TENSOR_BRIDGE_OPTIONAL_ABI` - Existing buildStageLocalTensorR1C calls remain valid without analysis publication options.  
  Source expectation: **PASS required at source bake**.
- **HP01-015** `TENSOR_COPY_GPU_ONLY` - Tensor publication uses GPU texture copy only.  
  Source expectation: **PASS required at source bake**.
- **HP01-016** `TENSOR_COPY_NO_RECOMPUTE` - Tensor publication does not repeat gradient, blur, or eigen passes.  
  Source expectation: **PASS required at source bake**.
- **HP01-017** `TENSOR_COPY_FORMAT` - Analysis tensor copy is rgba16float.  
  Source expectation: **PASS required at source bake**.
- **HP01-018** `TENSOR_COPY_USAGE` - Analysis tensor copy has required COPY_DST, TEXTURE_BINDING, STORAGE_BINDING, and COPY_SRC usage.  
  Source expectation: **PASS required at source bake**.
- **HP01-019** `TENSOR_COPY_SAME_DEVICE` - Source and copy textures use the same active GPU device and epoch.  
  Source expectation: **PASS required at source bake**.
- **HP01-020** `TENSOR_COPY_SOURCE_REVISION` - Tensor Analysis publication carries exact source revision.  
  Source expectation: **PASS required at source bake**.
- **HP01-021** `TENSOR_COPY_STAGE_IDENTITY` - Tensor Analysis publication carries exact stage index and count.  
  Source expectation: **PASS required at source bake**.
- **HP01-022** `TENSOR_COPY_PARENT_RECEIPT` - Tensor Analysis metadata links the parent tensor receipt digest.  
  Source expectation: **PASS required at source bake**.
- **HP01-023** `TENSOR_COPY_OWNERSHIP_SPLIT` - Original stage texture and Analysis copy have independent owners.  
  Source expectation: **PASS required at source bake**.
- **HP01-024** `TENSOR_COPY_RELEASE_SAFETY` - R1C release does not destroy the Analysis-owned copy.  
  Source expectation: **PASS required at source bake**.
- **HP01-025** `TENSOR_COPY_DISPOSE_SAFETY` - Analysis disposal does not destroy the R1C stage texture.  
  Source expectation: **PASS required at source bake**.
- **HP01-026** `TENSOR_COPY_FAILURE_CLEANUP` - Failed copy destroys only resources not transferred to Authority.  
  Source expectation: **PASS required at source bake**.
- **HP01-027** `TENSOR_COPY_RECEIPT_TRUTH` - Copy mode and submission count are recorded truthfully.  
  Source expectation: **PASS required at source bake**.
- **HP01-028** `TENSOR_FIELD_EFFECTIVE_HANDLE` - Successful bridge returns an AnalysisFieldHandle rather than a raw texture claim.  
  Source expectation: **PASS required at source bake**.
- **HP01-029** `REGISTRY_VERSION_ADVANCED` - Semantic registry version advances to hannakairo-phase-01.  
  Source expectation: **PASS required at source bake**.
- **HP01-030** `AXIAL_SEMANTIC_UNIQUE` - Hannakairo axial-order semantic ID is unique.  
  Source expectation: **PASS required at source bake**.
- **HP01-031** `COHERENCE_SEMANTIC_UNIQUE` - Hannakairo phase-coherence semantic ID is unique.  
  Source expectation: **PASS required at source bake**.
- **HP01-032** `WINDING_SEMANTIC_UNIQUE` - Hannakairo winding-defect semantic ID is unique.  
  Source expectation: **PASS required at source bake**.
- **HP01-033** `AXIAL_FORMAT_FINAL` - Axial-order canonical format is rgba16float.  
  Source expectation: **PASS required at source bake**.
- **HP01-034** `COHERENCE_FORMAT_FINAL` - Phase-coherence canonical format is rgba16float.  
  Source expectation: **PASS required at source bake**.
- **HP01-035** `WINDING_FORMAT_FINAL` - Winding-defect canonical format is rgba16float.  
  Source expectation: **PASS required at source bake**.
- **HP01-036** `AXIAL_CHANNEL_SCHEMA` - Axial channel meanings and ranges match the specification.  
  Source expectation: **PASS required at source bake**.
- **HP01-037** `COHERENCE_CHANNEL_SCHEMA` - Coherence channel meanings and ranges match the specification.  
  Source expectation: **PASS required at source bake**.
- **HP01-038** `WINDING_CHANNEL_SCHEMA` - Winding channel meanings and ranges match the specification.  
  Source expectation: **PASS required at source bake**.
- **HP01-039** `AXIAL_NEUTRAL_VALUE` - Axial invalid neutral is exactly (1,0,0,0).  
  Source expectation: **PASS required at source bake**.
- **HP01-040** `COHERENCE_NEUTRAL_VALUE` - Coherence invalid neutral is exactly zero.  
  Source expectation: **PASS required at source bake**.
- **HP01-041** `WINDING_NEUTRAL_VALUE` - Winding invalid neutral is exactly zero.  
  Source expectation: **PASS required at source bake**.
- **HP01-042** `STAGE_PLAQUETTE_COORDINATE` - AnalysisCoordinateSpace includes stage-plaquette.  
  Source expectation: **PASS required at source bake**.
- **HP01-043** `PLAQUETTE_CENTER_MAPPING` - Plaquette coordinate maps to source center x+0.5,y+0.5.  
  Source expectation: **PASS required at source bake**.
- **HP01-044** `DESCRIPTOR_FINALIZATION_PROOF` - Source gate proves parent topology semantics had no effective publication.  
  Source expectation: **PASS required at source bake**.
- **HP01-045** `VISUAL_PHASE_SEPARATION` - Visual Q-wave semantic cannot satisfy Hannakairo inputs or outputs.  
  Source expectation: **PASS required at source bake**.
- **HP01-046** `SPECTRAL_PHASE_SEPARATION` - Spectral complex phase remains semantically distinct from axial topology.  
  Source expectation: **PASS required at source bake**.
- **HP01-047** `DIRECTIONAL_GATE_SEPARATION` - Directional compatibility gate remains a separate semantic.  
  Source expectation: **PASS required at source bake**.
- **HP01-048** `SEMANTIC_DIGEST_CLOSURE` - Generated semantic digests match canonical descriptor content.  
  Source expectation: **PASS required at source bake**.
- **HP01-049** `PARAM_ABI_ID` - Uniform ABI ID and version match the specification.  
  Source expectation: **PASS required at source bake**.
- **HP01-050** `PARAM_ABI_SIZE` - Uniform byte size is exactly 96.  
  Source expectation: **PASS required at source bake**.
- **HP01-051** `PARAM_LAYOUT_ALIGNMENT` - WGSL and host packing obey uniform alignment.  
  Source expectation: **PASS required at source bake**.
- **HP01-052** `PARAM_FINITE_VALIDATION` - All floating parameters require finite values.  
  Source expectation: **PASS required at source bake**.
- **HP01-053** `PARAM_BOUNDED_VALIDATION` - Bounded thresholds remain in allowed ranges.  
  Source expectation: **PASS required at source bake**.
- **HP01-054** `PARAM_RADIUS_FIXED` - Product coherence radius is exactly one.  
  Source expectation: **PASS required at source bake**.
- **HP01-055** `PARAM_NEIGHBOR_LIMIT` - Minimum valid neighbors is valid for a 3x3 neighborhood.  
  Source expectation: **PASS required at source bake**.
- **HP01-056** `PARAM_WINDING_LIMIT` - Maximum doubled winding is exactly two for v1.  
  Source expectation: **PASS required at source bake**.
- **HP01-057** `PARAM_COORDINATE_CONVENTION` - Coordinate convention is explicit and recognized.  
  Source expectation: **PASS required at source bake**.
- **HP01-058** `PARAM_DIGEST` - All normalized parameters participate in parameterDigest.  
  Source expectation: **PASS required at source bake**.
- **HP01-059** `AXIAL_PIPELINE_ID` - Axial conversion pipeline identity is stable.  
  Source expectation: **PASS required at source bake**.
- **HP01-060** `AXIAL_WORKGROUP` - Axial workgroup is 8x8x1.  
  Source expectation: **PASS required at source bake**.
- **HP01-061** `AXIAL_SINGLE_WRITER` - Each invocation writes exactly one output texel.  
  Source expectation: **PASS required at source bake**.
- **HP01-062** `AXIAL_FINITE_CHECK` - Non-finite input invalidates the pixel.  
  Source expectation: **PASS required at source bake**.
- **HP01-063** `AXIAL_LENGTH_CHECK` - Near-zero tangent invalidates the pixel.  
  Source expectation: **PASS required at source bake**.
- **HP01-064** `AXIAL_COHERENCE_THRESHOLD` - Coherence threshold controls validity.  
  Source expectation: **PASS required at source bake**.
- **HP01-065** `AXIAL_EDGE_THRESHOLD` - Edge threshold controls validity.  
  Source expectation: **PASS required at source bake**.
- **HP01-066** `AXIAL_NORMALIZATION` - Valid tangent is normalized before double-angle construction.  
  Source expectation: **PASS required at source bake**.
- **HP01-067** `AXIAL_ALGEBRA` - Double-angle uses tx²-ty² and 2tx ty.  
  Source expectation: **PASS required at source bake**.
- **HP01-068** `AXIAL_RENORMALIZATION` - Output axial vector is normalized before storage.  
  Source expectation: **PASS required at source bake**.
- **HP01-069** `AXIAL_SIGN_INVARIANCE` - Axial(t) equals Axial(-t).  
  Source expectation: **PASS required at source bake**.
- **HP01-070** `AXIAL_INVALID_NEUTRAL` - Invalid axial output is the exact neutral record.  
  Source expectation: **PASS required at source bake**.
- **HP01-071** `AXIAL_CONFIDENCE_FORMULA` - Input confidence uses coherence multiplied by explicit edge gate.  
  Source expectation: **PASS required at source bake**.
- **HP01-072** `AXIAL_NO_ATAN2_PRODUCT` - Product axial conversion does not require atan2.  
  Source expectation: **PASS required at source bake**.
- **HP01-073** `AXIAL_NO_CPU` - No CPU axial conversion exists in product path.  
  Source expectation: **PASS required at source bake**.
- **HP01-074** `COHERENCE_PIPELINE_ID` - Phase-coherence pipeline identity is stable.  
  Source expectation: **PASS required at source bake**.
- **HP01-075** `COHERENCE_WORKGROUP` - Coherence workgroup is 8x8x1.  
  Source expectation: **PASS required at source bake**.
- **HP01-076** `COHERENCE_RADIUS` - Coherence reads exactly a 3x3 in-bounds neighborhood.  
  Source expectation: **PASS required at source bake**.
- **HP01-077** `COHERENCE_NO_BORDER_DUPLICATION` - Boundary policy does not duplicate clamped pixels.  
  Source expectation: **PASS required at source bake**.
- **HP01-078** `COHERENCE_NO_WRAP` - Boundary policy does not wrap image edges.  
  Source expectation: **PASS required at source bake**.
- **HP01-079** `COHERENCE_WEIGHT_SOURCE` - Neighborhood weight comes from axial input confidence.  
  Source expectation: **PASS required at source bake**.
- **HP01-080** `COHERENCE_VECTOR_SUM` - Coherence uses weighted doubled-angle vector sum.  
  Source expectation: **PASS required at source bake**.
- **HP01-081** `COHERENCE_NORMALIZATION` - Coherence divides vector magnitude by valid weight.  
  Source expectation: **PASS required at source bake**.
- **HP01-082** `COHERENCE_WEIGHT_EPSILON` - Weight epsilon prevents undefined division.  
  Source expectation: **PASS required at source bake**.
- **HP01-083** `COHERENCE_CENTER_VALIDITY` - Invalid center produces invalid coherence.  
  Source expectation: **PASS required at source bake**.
- **HP01-084** `COHERENCE_MIN_NEIGHBORS` - Neighbor count threshold is enforced.  
  Source expectation: **PASS required at source bake**.
- **HP01-085** `COHERENCE_VALID_WEIGHT_FRACTION` - Valid weight fraction is published.  
  Source expectation: **PASS required at source bake**.
- **HP01-086** `COHERENCE_VALID_NEIGHBOR_FRACTION` - Valid neighbor fraction is published.  
  Source expectation: **PASS required at source bake**.
- **HP01-087** `COHERENCE_FINITE_CHECK` - Non-finite accumulators produce invalid output.  
  Source expectation: **PASS required at source bake**.
- **HP01-088** `COHERENCE_NO_AXIAL_MUTATION` - Coherence pass does not rewrite axial order.  
  Source expectation: **PASS required at source bake**.
- **HP01-089** `COHERENCE_SINGLE_WRITER` - Each invocation writes exactly one coherence texel.  
  Source expectation: **PASS required at source bake**.
- **HP01-090** `COHERENCE_INVALID_ZERO` - Invalid coherence output is exact zero.  
  Source expectation: **PASS required at source bake**.
- **HP01-091** `COHERENCE_DETERMINISTIC` - Same inputs and parameters produce same stored output on one device.  
  Source expectation: **PASS required at source bake**.
- **HP01-092** `COHERENCE_SOURCE_DIMENSIONS` - Output dimensions equal stage dimensions.  
  Source expectation: **PASS required at source bake**.
- **HP01-093** `WINDING_PIPELINE_ID` - Wrapped-circulation pipeline identity is stable.  
  Source expectation: **PASS required at source bake**.
- **HP01-094** `WINDING_WORKGROUP` - Winding workgroup is 8x8x1.  
  Source expectation: **PASS required at source bake**.
- **HP01-095** `WINDING_OUTPUT_DIMENSIONS` - Winding dimensions are W-1 by H-1.  
  Source expectation: **PASS required at source bake**.
- **HP01-096** `WINDING_MIN_SOURCE_SIZE` - Sources smaller than 2x2 fail before allocation.  
  Source expectation: **PASS required at source bake**.
- **HP01-097** `WINDING_LOOP_ORDER` - Plaquette loop order matches the explicit image-y-down convention.  
  Source expectation: **PASS required at source bake**.
- **HP01-098** `WINDING_CROSS_DOT` - Wrapped edge angle uses atan2(cross,dot).  
  Source expectation: **PASS required at source bake**.
- **HP01-099** `WINDING_EDGE_RANGE` - Wrapped edge difference remains within the canonical principal interval.  
  Source expectation: **PASS required at source bake**.
- **HP01-100** `WINDING_FOUR_EDGES` - Circulation sums exactly four directed edge differences.  
  Source expectation: **PASS required at source bake**.
- **HP01-101** `WINDING_NO_UNWRAPPED_ANGLE_FIELD` - Product does not build a global unwrapped CPU angle field.  
  Source expectation: **PASS required at source bake**.
- **HP01-102** `WINDING_EXPLICIT_TWO_PI` - Circulation normalization uses a sealed two-pi constant.  
  Source expectation: **PASS required at source bake**.
- **HP01-103** `WINDING_SNAP_RULE` - Nearest integer uses explicit half-away-from-zero logic.  
  Source expectation: **PASS required at source bake**.
- **HP01-104** `WINDING_RESIDUAL` - Snap residual is computed against 2π times snapped winding.  
  Source expectation: **PASS required at source bake**.
- **HP01-105** `WINDING_CHARGE_HALF` - Axial charge equals doubled winding divided by two.  
  Source expectation: **PASS required at source bake**.
- **HP01-106** `WINDING_CHARGE_RANGE` - Supported charge range is -1 through +1.  
  Source expectation: **PASS required at source bake**.
- **HP01-107** `WINDING_OUT_OF_RANGE_INVALID` - Doubled winding magnitude above two invalidates the plaquette.  
  Source expectation: **PASS required at source bake**.
- **HP01-108** `WINDING_CORNER_AXIAL_VALIDITY` - All four axial corners must be valid.  
  Source expectation: **PASS required at source bake**.
- **HP01-109** `WINDING_CORNER_COHERENCE_VALIDITY` - All four phase-coherence corners must be valid.  
  Source expectation: **PASS required at source bake**.
- **HP01-110** `WINDING_MIN_CORNER_CONFIDENCE` - Minimum corner input confidence participates in validity and confidence.  
  Source expectation: **PASS required at source bake**.
- **HP01-111** `WINDING_MIN_PHASE_COHERENCE` - Minimum corner phase coherence threshold is enforced.  
  Source expectation: **PASS required at source bake**.
- **HP01-112** `WINDING_FINITE_EDGES` - All wrapped edge differences must be finite.  
  Source expectation: **PASS required at source bake**.
- **HP01-113** `WINDING_SNAP_TOLERANCE` - Residual tolerance is enforced.  
  Source expectation: **PASS required at source bake**.
- **HP01-114** `WINDING_DEFECT_CONFIDENCE` - Defect confidence is conservative minimum of corner, coherence, and snap terms.  
  Source expectation: **PASS required at source bake**.
- **HP01-115** `WINDING_ZERO_CHARGE_VALID` - A valid zero-charge plaquette may retain positive confidence.  
  Source expectation: **PASS required at source bake**.
- **HP01-116** `WINDING_INVALID_ZERO` - Invalid plaquette writes exact zero.  
  Source expectation: **PASS required at source bake**.
- **HP01-117** `WINDING_NO_GUESSED_VALID_ZERO` - Invalid topology is not relabeled as valid zero charge.  
  Source expectation: **PASS required at source bake**.
- **HP01-118** `WINDING_SINGLE_WRITER` - Each invocation owns exactly one plaquette output.  
  Source expectation: **PASS required at source bake**.
- **HP01-119** `WINDING_SIGN_CONVENTION_FIXTURE` - Positive and negative fixtures prove the declared sign convention.  
  Source expectation: **PASS required at source bake**.
- **HP01-120** `WINDING_HALF_DEFECT_FIXTURE` - Positive and negative half defects map to plus/minus 0.5.  
  Source expectation: **PASS required at source bake**.
- **HP01-121** `WINDING_UNIT_DEFECT_FIXTURE` - A canonical off-grid unit defect has connected-component integrated doubled winding two and integrated charge one without manufacturing an antipodal branch-tie plaquette.  
  Source expectation: **PASS required at source bake**.
- **HP01-122** `WINDING_CONSTANT_FIXTURE` - Constant field produces zero winding.  
  Source expectation: **PASS required at source bake**.
- **HP01-123** `WINDING_SIGN_FLIP_FIXTURE` - Alternating tangent sign produces zero winding.  
  Source expectation: **PASS required at source bake**.
- **HP01-124** `WINDING_LOW_CONFIDENCE_FIXTURE` - Low-confidence corners invalidate overlapping plaquettes.  
  Source expectation: **PASS required at source bake**.
- **HP01-125** `SERVICE_CONSTRUCTION_ORDER` - Hannakairo service is constructed after GPU, Surface, Analysis, and Asset authorities.  
  Source expectation: **PASS required at source bake**.
- **HP01-126** `INPUT_HANDLE_REQUIRED` - Canonical request requires an Analysis tensor handle.  
  Source expectation: **PASS required at source bake**.
- **HP01-127** `INPUT_SEMANTIC_EXACT` - Input semantic must be exact R1C tangent/coherence/edge.  
  Source expectation: **PASS required at source bake**.
- **HP01-128** `INPUT_FORMAT_EXACT` - Input format must be rgba16float.  
  Source expectation: **PASS required at source bake**.
- **HP01-129** `INPUT_SOURCE_EXACT` - Input source surface and revision must match request.  
  Source expectation: **PASS required at source bake**.
- **HP01-130** `INPUT_STAGE_EXACT` - Input stage index and count must match request.  
  Source expectation: **PASS required at source bake**.
- **HP01-131** `INPUT_DEVICE_EPOCH_CURRENT` - Input field device epoch must be current.  
  Source expectation: **PASS required at source bake**.
- **HP01-132** `INPUT_PIN_LIFETIME` - Input pin spans validation through terminal publication or cleanup.  
  Source expectation: **PASS required at source bake**.
- **HP01-133** `ONE_COMMAND_BUFFER` - Three product passes use one command buffer per job.  
  Source expectation: **PASS required at source bake**.
- **HP01-134** `ONE_QUEUE_SUBMISSION` - Three product passes use one queue submission per job.  
  Source expectation: **PASS required at source bake**.
- **HP01-135** `PIPELINE_ASSET_DIGESTS` - Pipeline identities include exact shader asset digests.  
  Source expectation: **PASS required at source bake**.
- **HP01-136** `EXPLICIT_BIND_GROUP_LAYOUT` - Product pipelines use explicit layouts.  
  Source expectation: **PASS required at source bake**.
- **HP01-137** `RGBA16FLOAT_STORAGE_CHECK` - Device storage support is checked before dispatch.  
  Source expectation: **PASS required at source bake**.
- **HP01-138** `SUBMISSION_LEDGER_TRUTH` - Submission ledger reports pipelines, dispatches, and zero fallback truth.  
  Source expectation: **PASS required at source bake**.
- **HP01-139** `FENCE_BEFORE_PUBLICATION` - No output is published before GPU fence completion.  
  Source expectation: **PASS required at source bake**.
- **HP01-140** `ATOMIC_THREE_FIELD_SET` - Exactly three Hannakairo fields publish in one publishFieldSet transaction.  
  Source expectation: **PASS required at source bake**.
- **HP01-141** `FIELD_SET_COMMON_METADATA` - All outputs share source, stage, parameter, and input receipt identity.  
  Source expectation: **PASS required at source bake**.
- **HP01-142** `FIELD_SET_DIGEST` - All outputs share one field-set digest.  
  Source expectation: **PASS required at source bake**.
- **HP01-143** `NO_PARTIAL_PUBLICATION` - Failure cannot leave a subset of outputs visible.  
  Source expectation: **PASS required at source bake**.
- **HP01-144** `ROLLBACK_GENERATION` - Failed publication does not advance field generation.  
  Source expectation: **PASS required at source bake**.
- **HP01-145** `OUTPUT_OWNERSHIP_TRANSFER` - Successful publication transfers output ownership to Authority.  
  Source expectation: **PASS required at source bake**.
- **HP01-146** `UNTRANSFERRED_CLEANUP` - Failed publication destroys untransferred textures.  
  Source expectation: **PASS required at source bake**.
- **HP01-147** `INPUT_PIN_RELEASE_SUCCESS` - Input pin releases after successful atomic publication.  
  Source expectation: **PASS required at source bake**.
- **HP01-148** `INPUT_PIN_RELEASE_FAILURE` - Input pin releases after failure, cancellation, or invalidation.  
  Source expectation: **PASS required at source bake**.
- **HP01-149** `CANCELLATION_PRE_SUBMIT` - Pre-submit cancellation encodes no work and publishes nothing.  
  Source expectation: **PASS required at source bake**.
- **HP01-150** `CANCELLATION_POST_SUBMIT` - Post-submit cancellation may finish GPU work but publishes nothing.  
  Source expectation: **PASS required at source bake**.
- **HP01-151** `SUPERSESSION_IDENTITY` - Supersession key includes source revision, stage, and parameter digest.  
  Source expectation: **PASS required at source bake**.
- **HP01-152** `DEVICE_LOSS_INVALIDATION` - Device loss invalidates active jobs and published epoch fields.  
  Source expectation: **PASS required at source bake**.
- **HP01-153** `NO_OLD_EPOCH_REBIND` - Old epoch handles cannot be rebound after recovery.  
  Source expectation: **PASS required at source bake**.
- **HP01-154** `CPU_PHASE_FORBIDDEN` - Canonical source contains no CPU phase or winding execution.  
  Source expectation: **PASS required at source bake**.
- **HP01-155** `WEBGL_PHASE_FORBIDDEN` - Canonical source contains no WebGL phase fallback.  
  Source expectation: **PASS required at source bake**.
- **HP01-156** `CANVAS_PHASE_FORBIDDEN` - Canonical source contains no Canvas pixel fallback.  
  Source expectation: **PASS required at source bake**.
- **HP01-157** `INTERMEDIATE_READBACK_ZERO` - Product source contains no intermediate field readback.  
  Source expectation: **PASS required at source bake**.
- **HP01-158** `LEGACY_DIRECTIONAL_SEPARATE` - Legacy directional shader is not imported by topology service.  
  Source expectation: **PASS required at source bake**.
- **HP01-159** `CPU_HELPER_SEPARATE` - phase_field.js is not imported by topology service.  
  Source expectation: **PASS required at source bake**.
- **HP01-160** `FACADE_REJECTS_CPU_ARRAY` - Compatibility facade rejects raw CPU arrays.  
  Source expectation: **PASS required at source bake**.
- **HP01-161** `FACADE_REJECTS_WEBGL_TEXTURE` - Compatibility facade rejects WebGL texture input.  
  Source expectation: **PASS required at source bake**.
- **HP01-162** `FACADE_REJECTS_CANVAS` - Compatibility facade rejects Canvas input.  
  Source expectation: **PASS required at source bake**.
- **HP01-163** `TOPOLOGY_CLAIM_RECEIPT_ONLY` - Only a sealed three-field receipt can claim effective topology execution.  
  Source expectation: **PASS required at source bake**.
- **HP01-164** `NO_RESAMPLE_PIXEL_MUTATION` - Phase-01 alone does not modify R1D/R2 resample parameters or pixels.  
  Source expectation: **PASS required at source bake**.
- **HP01-165** `WGSL_ASSET_SET` - All six canonical WGSL assets exist.  
  Source expectation: **PASS required at source bake**.
- **HP01-166** `WGSL_MANIFEST_CLOSURE` - All six assets are in Runtime Asset Manifest.  
  Source expectation: **PASS required at source bake**.
- **HP01-167** `WGSL_ACTIVE_GRAPH_CLOSURE` - All six assets are reachable in Active Graph.  
  Source expectation: **PASS required at source bake**.
- **HP01-168** `WGSL_STRUCTURAL_BALANCE` - WGSL braces, entry points, bindings, and workgroup declarations are structurally valid.  
  Source expectation: **PASS required at source bake**.
- **HP01-169** `WGSL_NO_EARLY_BARRIER_RETURN` - No shader returns before a required workgroup barrier.  
  Source expectation: **PASS required at source bake**.
- **HP01-170** `WGSL_NO_MAP_READ` - No product resource usage contains MAP_READ.  
  Source expectation: **PASS required at source bake**.
- **HP01-171** `REFERENCE_SOURCE_INDEPENDENCE` - Reference shader does not include product helper source.  
  Source expectation: **PASS required at source bake**.
- **HP01-172** `COMPARATOR_SCHEMA` - Comparator summary contains all specified counters and maxima.  
  Source expectation: **PASS required at source bake**.
- **HP01-173** `MOCK_AXIAL_SIGN_PARITY` - Mock math proves tangent sign invariance.  
  Source expectation: **PASS required at source bake**.
- **HP01-174** `MOCK_COHERENCE_CONSTANT` - Mock math proves constant field coherence.  
  Source expectation: **PASS required at source bake**.
- **HP01-175** `MOCK_WINDING_POSITIVE_HALF` - Mock math proves positive half defect.  
  Source expectation: **PASS required at source bake**.
- **HP01-176** `MOCK_WINDING_NEGATIVE_HALF` - Mock math proves negative half defect.  
  Source expectation: **PASS required at source bake**.
- **HP01-177** `PHYSICAL_WGSL_COMPILE` - All Hannakairo WGSL modules compile on target WebGPU.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-178** `PHYSICAL_BIND_GROUP_VALIDATION` - All bind groups and storage formats validate on target device.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-179** `PHYSICAL_TENSOR_COPY_IDENTITY` - Analysis tensor copy is pixel-identical to R1C eigen output on GPU.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-180** `PHYSICAL_AXIAL_SIGN_EXACT` - Sign-flipped tangent fixtures produce exact identical axial textures.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-181** `PHYSICAL_REFERENCE_PARITY` - Product and independent GPU reference agree within specified tolerances.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-182** `PHYSICAL_DEFECT_FIXTURES` - Positive and negative half defects, component-integrated unit defects, zero fields, and invalid fixtures pass on GPU.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-183** `PHYSICAL_ZERO_READBACK` - Browser instrumentation observes zero intermediate readback in product execution.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-184** `PHYSICAL_DEVICE_LOSS` - Device loss prevents publication and invalidates stale handles.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-185** `PHYSICAL_CANCELLATION` - Cancellation after submission publishes no field set.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-186** `PHYSICAL_MEMORY_PLATEAU` - Repeated jobs reach a bounded GPU memory plateau.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-187** `PACKAGED_ELECTRON_RELAUNCH` - Packaged Electron relaunch cleans up Hannakairo resources.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-188** `PHYSICAL_VERIFIED_RECEIPT` - Verified-unpromoted receipt is emitted only after all physical gates pass.  
  Source expectation: **DEFERRED at source bake**.
- **HP01-189** `AFT00_REGRESSION` - Analysis Field Truth-00 gates retain zero new failure.  
  Source expectation: **PASS required at source bake**.
- **HP01-190** `SQ02_REGRESSION` - Spectral Q-map 02 gates retain zero new failure.  
  Source expectation: **PASS required at source bake**.
- **HP01-191** `SQ03_REGRESSION` - Spectral Q-map 03 gates retain zero new failure.  
  Source expectation: **PASS required at source bake**.
- **HP01-192** `RESAMPLE_REGRESSION` - R1A through R2 gates retain zero new failure.  
  Source expectation: **PASS required at source bake**.
- **HP01-193** `RUNTIME_SURFACE_PREVIEW_REGRESSION` - GPU, Surface, Preview, and Runtime gates retain zero new failure.  
  Source expectation: **PASS required at source bake**.
- **HP01-194** `EXPORT_BUILD_CODEC_REGRESSION` - Export, Build, and Codec source gates retain zero new failure.  
  Source expectation: **PASS required at source bake**.
- **HP01-195** `INDEPENDENT_ZIP_VERIFY` - Independent ZIP extraction reproduces core gates and source seal.  
  Source expectation: **PASS required at source bake**.
- **HP01-196** `PROMOTION_FORBIDDEN` - Production Pointer remains unchanged and final state is unpromoted.  
  Source expectation: **PASS required at source bake**.

---

# 29. State Transition

```text
SPECTRAL_QMAP_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU
    ↓
HANNAKAIRO_PHASE_01_SOURCE_BAKED_AWAITING_PACKAGED_GPU
    ↓ physical GPU and packaged validation
HANNAKAIRO_PHASE_01_VERIFIED_UNPROMOTED
```

No state in this patch authorizes Production Pointer mutation.

---

# 30. Acceptance Summary

A successful source bake shall demonstrate:

```text
Canonical tensor Analysis publication bridge: present
Axial double-angle conversion:               implemented
Local phase coherence:                       implemented
Wrapped circulation:                         implemented
Half-integer axial charge:                   implemented
Atomic three-field publication:              implemented
CPU phase compute:                           zero
WebGL phase fallback:                        zero
Intermediate field readback:                 zero
Legacy directional gate:                     preserved and semantically separated
R1D / R2 pixel output mutation:               zero
Source gates:                                184 PASS / 12 DEFERRED / 0 FAIL
Production Pointer mutation:                  false
```

Physical WebGPU execution, memory plateau, device-loss recovery, and Packaged Electron verification remain explicitly deferred until performed on the target environment.
