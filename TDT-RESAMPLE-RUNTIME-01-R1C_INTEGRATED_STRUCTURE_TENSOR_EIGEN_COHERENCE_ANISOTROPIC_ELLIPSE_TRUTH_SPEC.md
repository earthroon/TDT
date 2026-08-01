# TDT-RESAMPLE-RUNTIME-01-R1C

## Integrated Structure Tensor / Eigen·Coherence / Anisotropic Ellipse Truth Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R1C`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R1B`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R1B_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target source state:** `RESAMPLE_RUNTIME_R1C_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target verified state:** `RESAMPLE_RUNTIME_R1C_VERIFIED_UNPROMOTED`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Primary runtime:** WebGPU
- **Primary kernel language:** WGSL
- **CPU image-processing fallback:** forbidden
- **WebGL resample fallback:** forbidden
- **Canvas resample fallback:** forbidden

---

# 0. Executive Contract

R1C shall preserve the existing public resample pipeline while replacing the unsealed tensor-like inputs and local-gradient approximations with a real stage-local structure-tensor chain.

The existing caller-visible contracts remain admitted:

```text
runDeltaKStack(...)
createDeltaKStack(...)
pipeEWA
GPUTexture return
Gamma-proof downstream ordering
downscaleRGBAWithWGSL(...)
Uint8Array RGBA8 export return
Preview / Export final-surface contract
R1A 64-byte compatibility ABI
R1B deterministic stage plan
```

R1C inserts the following implementation inside those facades:

```text
current stage source texture
    ↓
alpha-safe luminance / declared working-domain decode
    ↓
Scharr gradient
    ↓
per-pixel tensor outer product
    ↓
separable Gaussian spatial integration
    ↓
2×2 symmetric eigen decomposition
    ↓
canonical tangent direction + coherence + edge strength
    ↓
scale-projected anisotropic ellipse
    ↓
existing R1B EWA stage dispatch
```

R1C does **not** freeze or bypass the existing pipeline.

R1C does **not** introduce a parallel product resampler.

R1C repairs the current product path in place, preserves legacy callers through an explicit compatibility mode, and moves the admitted object-ABI runtime to the canonical stage-local tensor mode.

---

# 1. Problem Statement

## 1.1 Current DeltaK tensor input is not truth-sealed

The admitted EWA shaders currently interpret the predecessor tensor texture as follows:

```text
tensor.rg → direction
tensor.b  → sigmaMain divisor
tensor.a  → sigmaCross divisor
```

No canonical schema proves that those channels contain:

- an integrated structure tensor,
- a principal eigenvector,
- ordered eigenvalues,
- coherence,
- normalized edge energy,
- stage-local measurements,
- or even finite values in a declared range.

The current shader therefore has a directional input, but not a sealed structure-tensor contract.

## 1.2 Current `deltaK_qmap_tensor.wgsl` is not a structure tensor

The current admitted source performs a 3×3 RGB average and mixes it with the source using Q-map weight.

It does not calculate:

```text
Ix
Iy
Jxx = Ix²
Jxy = IxIy
Jyy = Iy²
spatial integration
eigenvalues
eigenvectors
coherence
```

It shall not be cited as proof of tensor construction after R1C.

## 1.3 Current R1B field mapping is original-normalized, not stage-local

R1B deliberately preserved the predecessor tensor field by sampling it in normalized original-image coordinates for every stage.

That was a compatibility bridge, not the final mathematical contract.

For multi-stage resampling, the frequency content of each stage source changes. A tensor measured on the original source cannot prove the local directional structure of the next intermediate source.

R1C therefore recomputes the tensor field from each current stage source before that stage's EWA dispatch.

## 1.4 Current Export EWA is locally directional but not integrated

The current Export WGSL derives a basis from left/right/top/bottom luminance samples at the output sample center.

This is a local first derivative estimate.

It is not a spatially integrated structure tensor and cannot distinguish reliably among:

- a single edge,
- a crossing,
- a corner,
- isotropic texture,
- low-energy noise,
- or a stable elongated structure.

R1C shall make DeltaK and Export consume the same tensor-field schema and the same eigen/coherence semantics while preserving their existing external facades.

## 1.5 Current ellipse parameters are semantically unsealed

The current product shader transforms a small logical grid by `sigmaMain` and `sigmaCross`, rounds the transformed offsets, and applies Gaussian weights.

The result is directionally weighted sampling, but it does not prove:

- an ellipse matrix derived from stage scale,
- coherence-gated anisotropy,
- minor-axis anti-aliasing coverage,
- integer-lattice coverage up to the admitted physical reach,
- or sensitivity of each exposed parameter.

R1C seals those claims explicitly.

---

# 2. Scope

## 2.1 In scope

R1C shall implement and seal:

1. stage-local gradient generation,
2. per-pixel tensor outer product,
3. separable Gaussian tensor integration,
4. symmetric 2×2 eigen decomposition,
5. deterministic tangent orientation,
6. coherence calculation,
7. normalized edge-strength calculation,
8. canonical tensor-field texture schema,
9. DeltaK stage-local tensor generation,
10. Export stage-local tensor generation,
11. stage-scale projection onto tangent and normal axes,
12. coherence-gated anisotropy,
13. minor-axis coverage floor,
14. bounded physical ellipse reach,
15. integer-lattice ellipse membership testing,
16. R1A tiled/reference parity under the new tensor schema,
17. legacy external tensor compatibility mode,
18. active object-ABI migration to canonical tensor mode,
19. tensor resource lifecycle and receipts,
20. source, mock-runtime, physical-GPU, and packaged gates.

## 2.2 Out of scope

R1C shall not claim completion of:

- color-management unification,
- monitor display transform,
- ICC transform truth,
- hidden-RGB sidecar redesign,
- Q-map algorithm redesign,
- Blend-If redesign,
- encoder changes,
- R2 workgroup cache optimization,
- tiled large-image processing,
- PSB large-document streaming,
- production promotion.

R1C shall record the current source working domain explicitly and shall not silently claim linear-light resampling if the source contract does not prove it.

---

# 3. Compatibility and Non-Breakage Contract

## 3.1 Public facade preservation

The following functions and return shapes shall remain:

```javascript
createDeltaKStack(device, existingPipes?)
runDeltaKStack(request)
runDeltaKStack(device, pipes, frameInputs)
downscaleRGBAWithWGSL(rgba, srcW, srcH, dstW, dstH, opts?)
```

## 3.2 Pipeline bundle preservation

`createDeltaKStack()` shall continue to return an object containing `pipeEWA`.

R1C may attach a nested tensor bundle without changing existing access:

```javascript
{
  ...existingPipes,
  pipeEWA: {
    ...r1aAndR1bBundle,
    tensorR1C: {
      gradientPipeline,
      outerPipeline,
      blurHPipeline,
      blurVPipeline,
      eigenPipeline,
      tensorParamsBuffer,
      tensorPipelineIdentity,
      tensorShaderDigests,
      dispose,
    }
  }
}
```

Existing code that reads `pipes.pipeEWA.pipeline` shall remain valid.

## 3.3 Compatibility tensor modes

R1C defines two admitted tensor modes.

### Canonical mode

```text
canonical-stage-local-r1c
```

- used by the active object-ABI runtime,
- builds a tensor field from the current source of every stage,
- binds the canonical eigen/coherence texture to EWA,
- does not require an external `tensorTex`,
- may accept an external tensor only as recorded compatibility metadata,
- does not silently consume an unsealed external field.

### Legacy compatibility mode

```text
legacy-external-v1
```

- preserves positional callers,
- requires the caller's `tensorTex`,
- uses the R1B normalized-original mapping,
- emits a compatibility receipt,
- is not evidence of R1C tensor truth,
- remains admitted until active legacy call count reaches zero in a later revision.

## 3.4 Default mode rules

```text
canonical object ABI → canonical-stage-local-r1c
legacy positional ABI → legacy-external-v1
explicit tensorMode → validated exact value
```

The active `runtime.js` caller shall explicitly request `canonical-stage-local-r1c` after the R1C bake.

## 3.5 No silent fallback

If canonical tensor construction fails:

```text
canonical tensor failure
→ stage failure
→ owned-resource closure
→ no Final Surface publication
```

It shall not silently switch to:

- legacy external tensor,
- local four-neighbor gradient,
- isotropic bilinear,
- Lanczos,
- Canvas,
- WebGL,
- or the unmodified source.

An explicitly requested compatibility mode remains allowed and shall be visible in the receipt.

---

# 4. Canonical Tensor Field Schema

## 4.1 Schema identity

```text
Tensor Field ID: tdt.structure-tensor.eigen-field.v1
Texture format: rgba16float
Coordinate space: current stage source texel space
Resolution: current stage source width × current stage source height
Sampling: textureLoad nearest semantics for product EWA
```

## 4.2 Channel contract

```text
R = tangent.x
G = tangent.y
B = coherence
A = edgeStrength
```

### Tangent

- unit-length edge-tangent direction,
- perpendicular to the dominant gradient-normal eigenvector,
- deterministic sign canonicalization,
- finite,
- fallback `(1, 0)` only when coherence and edge strength are both zero.

### Coherence

```text
coherence = (lambda1 - lambda2) / (lambda1 + lambda2 + epsilon)
```

- `lambda1 >= lambda2 >= 0`,
- clamped to `[0, 1]`,
- zero in flat or isotropic regions,
- approaches one on a clean single edge or line.

### Edge strength

```text
edgeStrength = clamp(sqrt(max(lambda1, 0)), 0, 1)
```

- finite,
- normalized under the canonical Scharr scale,
- used only as an anisotropy gate,
- not used as an unconstrained blur multiplier.

## 4.3 Deterministic tangent sign

Eigenvectors are sign-ambiguous. Product receipts and fixtures require deterministic bytes.

After tangent calculation:

```text
if abs(tangent.x) > abs(tangent.y):
    require tangent.x >= 0
else:
    require tangent.y >= 0
```

If the selected component is negative, multiply the tangent by `-1`.

Ellipse geometry is sign-invariant, but field digests are not. This rule seals deterministic texture output.

## 4.4 Invalid field handling

Any non-finite tensor component shall produce:

```text
tangent = (1, 0)
coherence = 0
edgeStrength = 0
```

and increment an invalid-field telemetry counter.

A nonzero invalid-field count shall fail verification fixtures unless the fixture explicitly injects malformed values.

---

# 5. Tensor Build Chain

## 5.1 Pass sequence

Every canonical R1C EWA stage shall execute:

```text
Pass T0: gradient and alpha-safe luminance
Pass T1: tensor outer product
Pass T2: horizontal Gaussian integration
Pass T3: vertical Gaussian integration
Pass T4: eigen / coherence field
Pass E0: anisotropic EWA
```

The five tensor passes shall run on the current stage source before the EWA output stage.

## 5.2 Proposed files

```text
app/legacy-runtime/core/compute/qmap_webgpu/
├─ tensor_r1c_contract.mjs
├─ tensor_r1c_pipeline.mjs
├─ tensor_r1c_params.mjs
├─ tensor_r1c_runtime_receipt.mjs
└─ shaders/
   ├─ tensor_gradient_scharr_v1.wgsl
   ├─ tensor_outer_product_v1.wgsl
   ├─ tensor_integrate_h_v1.wgsl
   ├─ tensor_integrate_v_v1.wgsl
   └─ tensor_eigen_coherence_v1.wgsl
```

Export may reuse the same modules through the existing GPU Authority shader cache. It shall not maintain a mathematically different Export-only tensor implementation.

## 5.3 Pass T0: alpha-safe luminance and Scharr gradient

The source texture is treated according to a declared source-domain flag.

Admitted domain flags:

```text
WORKING_LINEAR_PREMULTIPLIED
WORKING_DECLARED_PREMULTIPLIED
```

R1C shall not infer a domain from texture format alone.

For premultiplied input:

```text
if alpha > alphaEpsilon:
    straightRgb = premultipliedRgb / alpha
else:
    straightRgb = 0
```

Luminance:

```text
L = dot(straightRgb, (0.2126, 0.7152, 0.0722))
```

Canonical Scharr operators:

```text
Gx = [ -3  0  3
      -10  0 10
       -3  0  3 ] / 32

Gy = [ -3 -10 -3
        0   0  0
        3  10  3 ] / 32
```

T0 output texture:

```text
format: rgba16float
R = Ix
G = Iy
B = L
A = alpha
```

Boundary policy: clamp-to-edge via integer `textureLoad` coordinates.

T0 shall use no filtering sampler.

## 5.4 Pass T1: tensor outer product

For every source texel:

```text
Jxx = Ix * Ix
Jxy = Ix * Iy
Jyy = Iy * Iy
energyRaw = Jxx + Jyy
```

T1 output:

```text
format: rgba16float
R = Jxx
G = Jxy
B = Jyy
A = energyRaw
```

No center-gradient replication is allowed.

No 3×3 color blur may be labelled a tensor pass.

## 5.5 Pass T2 and T3: spatial integration

The tensor outer-product field shall be integrated with a separable Gaussian.

Canonical initial limits:

```text
kernel radius: 4
maximum taps per direction: 9
tensorSigma range: 0.60 to 2.00
default tensorSigma: 1.20
```

For offset `k`:

```text
w(k) = exp(-(k*k) / (2*tensorSigma*tensorSigma))
```

Each pass shall normalize by the accumulated weight.

T2:

```text
raw tensor → horizontal integrated temporary
```

T3:

```text
horizontal temporary → fully integrated tensor
```

The Gaussian kernel may be calculated in WGSL from the sealed sigma or supplied through a sealed uniform/LUT. It shall not be approximated by repeated box blur without a separate revision and parity proof.

T2/T3 output format:

```text
rgba16float
```

A debug/reference pipeline may use `rgba32float`, but the product identity remains the sealed `rgba16float` chain until changed by a later specification.

## 5.6 Pass T4: eigen and coherence

For the integrated symmetric matrix:

```text
J = [ Jxx Jxy
      Jxy Jyy ]
```

Compute:

```text
trace = Jxx + Jyy
root = sqrt(max((Jxx - Jyy)^2 + 4*Jxy^2, 0))
lambda1 = max(0, 0.5 * (trace + root))
lambda2 = max(0, 0.5 * (trace - root))
```

Dominant gradient-normal angle:

```text
theta = 0.5 * atan2(2*Jxy, Jxx - Jyy)
normal = (cos(theta), sin(theta))
tangent = (-normal.y, normal.x)
```

Then apply deterministic tangent sign canonicalization.

Compute:

```text
coherence = clamp((lambda1 - lambda2) / (lambda1 + lambda2 + epsilon), 0, 1)
edgeStrength = clamp(sqrt(lambda1), 0, 1)
```

Flat-field guard:

```text
if lambda1 + lambda2 <= tensorEnergyEpsilon:
    tangent = (1, 0)
    coherence = 0
    edgeStrength = 0
```

T4 output shall obey the schema in Section 4.

---

# 6. Tensor Uniform ABI

## 6.1 ABI identity

```text
ABI ID: tdt.structure-tensor.params.v1
ABI version: 0x0001000c
Byte length: 64
```

## 6.2 Layout

```text
sourceSize             vec2<u32>   offset 0
stageIndex             u32         offset 8
stageCount             u32         offset 12
invSourceSize          vec2<f32>   offset 16
tensorSigma            f32         offset 24
alphaEpsilon           f32         offset 28
edgeLow                f32         offset 32
edgeHigh               f32         offset 36
maxAnisotropy          f32         offset 40
minorCoverageFactor    f32         offset 44
kernelRadius           u32         offset 48
sourceDomainFlags      u32         offset 52
reserved               vec2<u32>   offset 56
```

## 6.3 Validation ranges

```text
tensorSigma            0.60 .. 2.00
alphaEpsilon           1e-8 .. 1e-3
edgeLow                0.0 .. 1.0
edgeHigh               edgeLow .. 1.0
maxAnisotropy          1.0 .. 4.0
minorCoverageFactor    0.75 .. 1.0
kernelRadius           exactly 4 for v1
```

All padding bytes shall be zero.

WGSL `minBindingSize` and JavaScript allocation shall both equal 64.

---

# 7. Stage-Local Tensor Ownership

## 7.1 Stage resolution

For an R1B stage:

```text
source: Wsrc × Hsrc
output: Wdst × Hdst
```

The R1C tensor field shall be generated at:

```text
Wsrc × Hsrc
```

The EWA shader shall sample the tensor at the current source coordinate `pSrc`, not at normalized output position.

## 7.2 Per-stage lifecycle

For each stage:

```text
current source texture
→ gradient texture
→ raw tensor texture
→ blur temporary texture
→ integrated tensor texture
→ eigen field texture
→ EWA output texture
```

After the EWA submission fence completes:

- gradient texture is disposed exactly once,
- raw tensor texture is disposed exactly once,
- blur temporary texture is disposed exactly once,
- integrated tensor texture is disposed exactly once,
- eigen field texture is disposed exactly once,
- EWA output survives only according to R1B intermediate/final ownership.

## 7.3 Surface Authority registration

Every tensor texture shall be registered with:

```text
surface role
tensor schema ID
stage index
stage count
runtime epoch
device epoch
device identity
width
height
format
estimated GPU bytes
owner
disposer
parent source surface ID when available
```

Unregistered tensor textures are forbidden in packaged verification.

## 7.4 Device loss

On device loss:

- all old-epoch tensor pipeline bundles are invalid,
- all old-epoch tensor textures are invalidated,
- pending stage receipts close as `DEVICE_LOST`,
- no old-epoch eigen field may be bound to a recovered EWA pipeline,
- CPU source replay follows the existing GPU/Surface recovery contracts,
- GPU-only source replay requires a newly published source surface.

---

# 8. EWA Parameter ABI v3

## 8.1 Product ABI identity

R1C introduces a product ABI for ellipse truth while preserving R1A v2 compatibility for explicitly legacy raw-pipeline callers.

```text
ABI ID: tdt.delta-k-ewa.params.v3
ABI version: 0x0001000c
Byte length: 80
```

## 8.2 Layout

```text
inSize                 vec2<u32>   offset 0
outSize                vec2<u32>   offset 8
srcPerDst              vec2<f32>   offset 16
dstPerSrc              vec2<f32>   offset 24
sigmaMain              f32         offset 32
sigmaCross             f32         offset 36
maxAnisotropy          f32         offset 40
maxSampleReach         f32         offset 44
edgeLow                f32         offset 48
edgeHigh               f32         offset 52
minorCoverageFactor    f32         offset 56
coherenceExponent      f32         offset 60
stageIndex             u32         offset 64
stageCount             u32         offset 68
flags                   u32         offset 72
abiVersion              u32         offset 76
```

## 8.3 Compatibility handling

- canonical R1C product pipeline uses v3,
- R1A v2 packer remains available only for `legacy-external-v1`,
- v2 and v3 pipeline identities differ,
- bind-group layouts differ by `minBindingSize`,
- no v2 buffer may bind to a v3 pipeline,
- no v3 buffer may be hashed as v2.

---

# 9. Scale-Projected Anisotropic Ellipse

## 9.1 Tensor sampling

For an output pixel:

```text
pSrc = (dst + 0.5) * srcPerDst
```

Tensor coordinate:

```text
tensorCoord = clamp(floor(pSrc), 0, sourceSize - 1)
```

Load:

```text
tangent = normalize(field.rg)
coherence = clamp(field.b, 0, 1)
edgeStrength = clamp(field.a, 0, 1)
normal = (-tangent.y, tangent.x)
```

Invalid or zero-length tangent shall force isotropic behavior.

## 9.2 Projected stage scale

For nonuniform scale:

```text
scaleT = length((tangent.x * srcPerDst.x,
                 tangent.y * srcPerDst.y))

scaleN = length((normal.x * srcPerDst.x,
                 normal.y * srcPerDst.y))
```

This prevents the ellipse from assuming that X and Y shrink equally.

## 9.3 Coherence and edge gate

```text
edgeGate = smoothstep(edgeLow, edgeHigh, edgeStrength)
coherenceGate = pow(coherence, coherenceExponent) * edgeGate
```

```text
anisotropy = exp2(coherenceGate * log2(maxAnisotropy))
```

Therefore:

```text
coherenceGate = 0 → anisotropy = 1
coherenceGate = 1 → anisotropy = maxAnisotropy
```

## 9.4 Base coverage

```text
baseT = max(1.0, 0.5 * scaleT * sigmaMain)
baseN = max(1.0, 0.5 * scaleN * sigmaCross)
coverageFloorN = max(1.0, 0.5 * scaleN * minorCoverageFactor)
```

## 9.5 Ellipse radii

```text
sqrtA = sqrt(anisotropy)
majorRadius = clamp(baseT * sqrtA, 1.0, maxSampleReach)
minorRadius = clamp(max(baseN / sqrtA, coverageFloorN), 1.0, maxSampleReach)
```

This contract allows tangent-axis extension while forbidding the normal-axis radius from dropping below the anti-aliasing coverage floor.

## 9.6 Integer-lattice ellipse

R1C shall not generate a transformed 5×5 grid and then round duplicate coordinates.

The product shader shall iterate the bounded physical integer lattice:

```text
x = -6 .. 6
y = -6 .. 6
```

For source offset `d = (x, y)`:

```text
t = dot(d, tangent)
n = dot(d, normal)
q = (t/majorRadius)^2 + (n/minorRadius)^2
```

Only samples with:

```text
q <= 1
```

are accumulated.

The physical loop bound shall equal `maxSampleReach = 6` for R1C v1.

## 9.7 Radial weight

Canonical R1C v1 weight:

```text
w(q) = exp(-2.0 * q) * max(0, 1 - q)
```

The result is normalized by total weight.

A constant source shall remain constant within the declared floating-point tolerance.

## 9.8 Zero-weight guard

If accumulated weight is non-finite or below epsilon:

- sample the clamped center texel,
- increment `zeroWeightGuardCount`,
- keep the stage alive,
- fail the quality gate if the count is nonzero for ordinary valid fixtures.

## 9.9 Tiled and reference parity

Both:

```text
ewa_aniso_tile_v3.wgsl
ewa_aniso_reference_v2.wgsl
```

shall implement the same:

- tensor schema,
- projected scale,
- coherence gate,
- ellipse radii,
- physical lattice,
- radial weight,
- boundary policy.

Their source code and shader digests shall differ.

Maximum admitted per-channel absolute difference:

```text
1e-5 for rgba16float-readable fixture comparison before quantization
```

---

# 10. DeltaK Integration

## 10.1 `createDeltaKStack()`

The function shall create:

- R1C tensor pipeline bundle,
- R1C EWA tiled product pipeline,
- R1C independent reference pipeline identity,
- compatibility R1A v2 pipeline only if explicitly retained by the bake.

No caller-visible rename is allowed.

## 10.2 `runDeltaKStackCanonical()`

For `canonical-stage-local-r1c`, every R1B stage shall perform:

```text
validate request and device epoch
build stage-local tensor field from currentTexture
verify tensor receipt and dimensions
dispatch EWA with canonical eigen field
await submission fence
append stage receipt
dispose tensor temporaries
advance currentTexture
```

`runDeltaKCore` remains after the final EWA stage exactly once, preserving R1B.

## 10.3 Legacy mode

For `legacy-external-v1`:

- no tensor build chain runs,
- caller tensor texture remains required,
- R1B normalized-original sampling remains,
- v2 EWA pipeline is used,
- receipt contains `tensorTruthClaim: false`,
- active runtime shall not use this mode after bake.

## 10.4 No pipeline break

If the active object caller passes the old `tensorTex`, the request remains valid.

In canonical mode the field is recorded as:

```text
legacyTensorInputPresent: true
legacyTensorInputConsumed: false
```

This preserves call shape while making the source of product anisotropy explicit.

---

# 11. Export Integration

## 11.1 External function preservation

```javascript
downscaleRGBAWithWGSL(rgba, srcW, srcH, dstW, dstH, opts)
```

remains unchanged.

## 11.2 Per-stage tensor generation

Before each Export lowpass/recompose stage:

```text
currentTexture
→ shared R1C tensor pipeline bundle
→ stage-local eigen field
→ lowpass and residual EWA consume same field
```

The current four-neighbor `edgeBasis()` function shall no longer be the product anisotropy authority.

It may remain temporarily as a debug reference but shall have zero product call count.

## 11.3 Bind-group evolution

Export lowpass and recompose WGSL shall add a tensor field binding.

The external JS API remains unchanged because `ensureState()` owns pipeline and bind-group construction.

Example product layout:

```text
lowpass:
  0 srcTex
  1 srcSampler
  2 tensorField
  3 lowOut
  4 uniform

recompose:
  0 srcTex
  1 lowTex
  2 srcSampler
  3 tensorField
  4 dstTex
  5 uniform
```

Exact binding numbers may differ in the bake, but shall be sealed by layout digest and source gate.

## 11.4 Upload and readback conservation

R1B guarantees remain:

```text
source upload: 1
intermediate readback: 0
final readback: 1
```

Tensor construction is GPU-resident and adds no CPU image readback.

## 11.5 Export receipt

Every Export R1C stage receipt shall contain:

```text
tensorMode
tensorFieldSchemaId
tensorPipelineIdentity
tensorShaderDigests
tensorParameterDigest
tensorFieldWidth
tensorFieldHeight
tensorSigma
maxAnisotropy
coherenceExponent
minorCoverageFactor
ellipseKernelId
tensorTemporaryDestroyCount
```

---

# 12. Resource and Memory Contract

## 12.1 Product formats

```text
gradient texture           rgba16float
raw tensor texture         rgba16float
horizontal integration     rgba16float
integrated tensor          rgba16float
eigen/coherence field      rgba16float
EWA stage output           rgba16float except final Export output
```

## 12.2 Peak tensor residency estimate

For a source stage of `W × H`, product tensor bytes are estimated as:

```text
5 textures × W × H × 8 bytes
```

where `rgba16float` is 8 bytes per pixel.

The receipt shall report the exact admitted estimate.

R1C does not yet implement tiled tensor construction. Memory budget admission remains a later dedicated specification, but R1C shall expose the bytes needed for that gate.

## 12.3 Disposal

A successful stage shall report:

```text
tensor temporary allocations = 5
tensor temporary disposals = 5
```

unless implementation safely aliases one integration texture; any aliasing shall be explicit in the receipt and shall not permit double disposal.

A failed or cancelled stage shall leave:

```text
active tensor temporaries = 0
active tensor pins = 0
pending tensor disposals = 0
```

---

# 13. Receipts and Identities

## 13.1 Tensor pipeline identity

```text
deviceEpoch
+ gradient shader digest
+ outer shader digest
+ blur-H shader digest
+ blur-V shader digest
+ eigen shader digest
+ tensor ABI digest
+ texture format set
```

## 13.2 EWA R1C identity

```text
deviceEpoch
+ EWA tiled shader digest
+ EWA v3 ABI digest
+ tensor field schema ID
+ ellipse kernel ID
+ bind-layout digest
```

## 13.3 Stage receipt schema

```json
{
  "patchId": "TDT-RESAMPLE-RUNTIME-01-R1C",
  "jobId": "...",
  "stageIndex": 0,
  "stageCount": 3,
  "runtimeEpoch": 1,
  "deviceEpoch": 2,
  "tensorMode": "canonical-stage-local-r1c",
  "tensorFieldSchemaId": "tdt.structure-tensor.eigen-field.v1",
  "tensorPipelineIdentity": "...",
  "tensorParameterDigest": "...",
  "tensorFieldWidth": 4096,
  "tensorFieldHeight": 3072,
  "tensorSigma": 1.2,
  "ewaPipelineIdentity": "...",
  "ewaAbiId": "tdt.delta-k-ewa.params.v3",
  "ellipseKernelId": "tdt.ewa.ellipse.radial-v1",
  "maxAnisotropy": 3.0,
  "coherenceExponent": 1.0,
  "minorCoverageFactor": 1.0,
  "zeroWeightGuardCount": 0,
  "invalidTensorCount": 0,
  "tensorTemporaryDestroyCount": 5,
  "completed": true
}
```

## 13.4 Chain receipt

The R1B plan digest remains the stage-order authority.

R1C extends, but does not replace, the chain receipt with:

```text
ordered tensor stage receipts
tensor schema identity
aggregate invalid tensor count
aggregate zero-weight count
aggregate temporary allocation/disposal count
legacy tensor compatibility count
```

---

# 14. Failure Codes

The bake shall implement stable failures including at least:

```text
E_R1C_TENSOR_PIPELINE_NOT_READY
E_R1C_TENSOR_MODE_INVALID
E_R1C_TENSOR_SOURCE_DOMAIN_UNDECLARED
E_R1C_TENSOR_PARAMETER_NONFINITE
E_R1C_TENSOR_PARAMETER_RANGE
E_R1C_TENSOR_ABI_SIZE
E_R1C_TENSOR_ABI_VERSION
E_R1C_TENSOR_TEXTURE_DIMENSION
E_R1C_TENSOR_TEXTURE_FORMAT
E_R1C_TENSOR_SHADER_DIGEST
E_R1C_TENSOR_SHADER_COMPILE
E_R1C_TENSOR_PIPELINE_VALIDATION
E_R1C_TENSOR_DEVICE_EPOCH
E_R1C_TENSOR_CANCELLED
E_R1C_TENSOR_RESOURCE_LEAK
E_R1C_EWA_V3_ABI_SIZE
E_R1C_EWA_V3_ABI_VERSION
E_R1C_EWA_FIELD_SCHEMA
E_R1C_ELLIPSE_RADIUS_NONFINITE
E_R1C_ELLIPSE_REACH_EXCEEDED
E_R1C_LEGACY_TENSOR_REQUIRED
E_R1C_CANONICAL_TENSOR_FALLBACK_FORBIDDEN
E_R1C_EXPORT_TENSOR_BINDING
E_R1C_TILED_REFERENCE_MISMATCH
```

No R1C failure may be converted to a successful source-copy result.

---

# 15. Source Changes Required

At minimum, the bake shall modify or create:

```text
app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_multistage_runtime_receipt.mjs
app/legacy-runtime/core/compute/qmap_webgpu/runtime.js
app/legacy-runtime/core/compute/qmap_webgpu/tensor_r1c_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/tensor_r1c_pipeline.mjs
app/legacy-runtime/core/compute/qmap_webgpu/tensor_r1c_params.mjs
app/legacy-runtime/core/compute/qmap_webgpu/tensor_r1c_runtime_receipt.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/tensor_gradient_scharr_v1.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/tensor_outer_product_v1.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/tensor_integrate_h_v1.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/tensor_integrate_v_v1.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/tensor_eigen_coherence_v1.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v3.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v2.wgsl
app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js
app/legacy-runtime/modules/dk_resample/shaders/export_ewa_lowpass.wgsl
app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose.wgsl
app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose_linear.wgsl
app/src/runtime/active-graph/generated-active-runtime-graph.json
app/src/legacy/generated-legacy-static-admission.json
app/src/runtime/assets/runtime-asset-manifest.ts
```

The exact generated manifest paths shall follow the existing repository conventions.

---

# 16. Source Gates

R1C defines `RC01` through `RC96`.

## 16.1 Authority and compatibility gates

### RC01
`runDeltaKStack` public facade remains present.

### RC02
Object ABI remains admitted.

### RC03
Positional ABI remains admitted.

### RC04
Active object caller explicitly selects `canonical-stage-local-r1c`.

### RC05
Legacy positional caller normalizes to `legacy-external-v1`.

### RC06
Canonical mode does not require external `tensorTex`.

### RC07
Legacy mode requires external `tensorTex`.

### RC08
Canonical failure has no implicit legacy fallback.

### RC09
`pipeEWA` remains present in `createDeltaKStack()` output.

### RC10
`runDeltaKCore` remains final-stage-only and exactly once.

## 16.2 Tensor shader source gates

### RC11
Scharr gradient shader exists and is asset-sealed.

### RC12
Outer-product shader exists and is asset-sealed.

### RC13
Horizontal integration shader exists and is asset-sealed.

### RC14
Vertical integration shader exists and is asset-sealed.

### RC15
Eigen/coherence shader exists and is asset-sealed.

### RC16
No admitted tensor shader labels a color box blur as a structure tensor.

### RC17
Scharr coefficients and normalization match the specification.

### RC18
Outer product calculates `Jxx`, `Jxy`, and `Jyy` from the local gradient.

### RC19
Horizontal integration samples neighboring tensor texels.

### RC20
Vertical integration samples neighboring tensor texels.

### RC21
Both integration passes normalize accumulated weight.

### RC22
Eigen shader orders `lambda1 >= lambda2`.

### RC23
Coherence formula matches the specification.

### RC24
Tangent sign canonicalization is present.

### RC25
Flat-field guard is present.

## 16.3 ABI and layout gates

### RC26
Tensor ABI ID and version match the specification.

### RC27
Tensor uniform allocation is exactly 64 bytes.

### RC28
Tensor WGSL aligned size is exactly 64 bytes.

### RC29
Tensor bind layout declares `minBindingSize = 64`.

### RC30
All tensor padding is deterministically zero.

### RC31
EWA v3 ABI allocation is exactly 80 bytes.

### RC32
EWA v3 WGSL aligned size is exactly 80 bytes.

### RC33
EWA v3 bind layout declares `minBindingSize = 80`.

### RC34
V2 and V3 pipeline identities are distinct.

### RC35
V2 is not used by canonical R1C mode.

## 16.4 Tensor field schema gates

### RC36
Eigen field format is `rgba16float`.

### RC37
Eigen field resolution equals current stage source resolution.

### RC38
R/G channels contain tangent direction.

### RC39
B channel contains coherence.

### RC40
A channel contains edge strength.

### RC41
EWA samples the field using current source coordinate.

### RC42
Canonical mode contains no normalized-original tensor mapping.

### RC43
Legacy mode preserves normalized-original mapping.

### RC44
Non-finite tensor values are guarded.

### RC45
Tensor field schema ID is in every canonical stage receipt.

## 16.5 Ellipse truth gates

### RC46
Projected tangent scale uses both X and Y stage ratios.

### RC47
Projected normal scale uses both X and Y stage ratios.

### RC48
Coherence gate includes edge-strength gating.

### RC49
Anisotropy equals one when coherence gate is zero.

### RC50
Anisotropy is bounded by `maxAnisotropy`.

### RC51
Minor radius cannot fall below coverage floor.

### RC52
Major and minor radii are finite and positive.

### RC53
Physical loop bound is `-6..6` in both axes.

### RC54
Ellipse membership uses integer source offset and quadratic distance.

### RC55
No transformed 5×5 grid plus rounded duplicate sampling remains in product v3.

### RC56
Samples outside `q > 1` are excluded.

### RC57
Radial weight matches the sealed kernel ID.

### RC58
Weight sum normalization is present.

### RC59
Zero-weight guard is present and counted.

### RC60
Tiled and reference shaders use the same ellipse equations.

## 16.6 DeltaK integration gates

### RC61
Canonical tensor build executes before each DeltaK EWA stage.

### RC62
Stage source dimensions feed tensor construction exactly.

### RC63
Stage-local eigen field binds to EWA binding 1 or its sealed successor binding.

### RC64
Tensor temporaries are disposed after EWA completion fence.

### RC65
Intermediate EWA ownership remains R1B-compliant.

### RC66
Final EWA output ownership remains caller-transfer.

### RC67
Canonical stage receipt contains tensor pipeline identity.

### RC68
Legacy compatibility receipt states `tensorTruthClaim: false`.

### RC69
Active runtime canonical call count is nonzero in runtime smoke.

### RC70
Active runtime legacy call count is zero in runtime smoke.

## 16.7 Export integration gates

### RC71
Export lowpass consumes canonical tensor field.

### RC72
Export final recompose consumes the same stage tensor field.

### RC73
Export linear intermediate recompose consumes the same stage tensor field.

### RC74
Product Export no longer calls local `edgeBasis()` as anisotropy authority.

### RC75
Export upload count remains one.

### RC76
Export intermediate readback count remains zero.

### RC77
Export final readback count remains one.

### RC78
Export stage receipt contains tensor field dimensions and digest.

### RC79
Tensor construction performs no CPU pixel readback.

### RC80
Export external return shape remains `Uint8Array RGBA8`.

## 16.8 Lifecycle, recovery, and manifest gates

### RC81
Every canonical tensor texture is Surface Authority registered.

### RC82
Successful stage tensor allocation and disposal counts match.

### RC83
Cancelled stage leaves zero active tensor temporaries.

### RC84
Failed stage leaves zero active tensor temporaries.

### RC85
Old device-epoch tensor pipeline is rejected.

### RC86
Old device-epoch tensor field is rejected.

### RC87
All new WGSL files have runtime asset digests.

### RC88
All new JS/MJS modules are in the active graph.

### RC89
Quarantined or non-admitted tensor files have zero product call count.

### RC90
Production Pointer remains unchanged.

## 16.9 Physical and packaged gates

### RC91
All R1C WGSL modules compile without validation errors on the canonical Windows GPU.

### RC92
Tiled and reference EWA outputs satisfy the declared pixel tolerance.

### RC93
Tensor direction fixtures satisfy angular tolerance.

### RC94
Coherence and parameter-sensitivity fixtures pass.

### RC95
Packaged Electron Preview and Export consume the same R1C final surface chain.

### RC96
Electron relaunch and device-loss recovery leave zero old-epoch tensor resources.

---

# 17. Runtime Fixture Matrix

## 17.1 Tensor direction fixtures

Required fixtures:

```text
constant field
horizontal step edge
vertical step edge
+45-degree edge
-45-degree edge
single-pixel horizontal line
single-pixel vertical line
crossing lines
checkerboard corner
white noise
low-contrast edge
alpha-soft edge
```

Expected properties:

### Constant field

```text
edgeStrength ≈ 0
coherence ≈ 0
anisotropy = 1
```

### Vertical edge

```text
dominant normal ≈ X
tangent ≈ Y
```

### Horizontal edge

```text
dominant normal ≈ Y
tangent ≈ X
```

### 45-degree edge

Tangent angular error shall be within the sealed tolerance after sign equivalence.

### Crossing lines / checker corner

```text
lambda2 increases
coherence decreases relative to a single edge
```

### Noise

Increasing `tensorSigma` shall reduce unstable high-coherence islands.

## 17.2 Parameter sensitivity fixtures

Each exposed parameter shall affect an appropriate nontrivial fixture.

```text
tensorSigma
maxAnisotropy
coherenceExponent
edgeLow
edgeHigh
minorCoverageFactor
sigmaMain
sigmaCross
```

A parameter is dead if changing it within admitted range produces the same output digest across all sensitivity fixtures.

Dead exposed parameters fail RC94.

## 17.3 Ellipse fixtures

Required:

- isotropic field with nonuniform X/Y stage scale,
- tangent along X,
- tangent along Y,
- tangent at 45 degrees,
- coherence zero,
- coherence one,
- edge strength below gate,
- edge strength above gate,
- maximum anisotropy,
- minor coverage floor activation.

## 17.4 Conservation fixtures

- constant opaque RGB,
- constant premultiplied RGBA,
- all-zero alpha,
- odd dimensions,
- non-square shrink,
- R1B multi-stage 64→8,
- 17→8→4 chain,
- identity stage.

Required:

```text
NaN count = 0
Inf count = 0
zero-weight ordinary-fixture count = 0
constant drift within tolerance
```

---

# 18. Telemetry

R1C telemetry shall expose at least:

```text
canonicalTensorStageCount
legacyExternalTensorStageCount
tensorGradientDispatchCount
tensorOuterDispatchCount
tensorBlurHDispatchCount
tensorBlurVDispatchCount
tensorEigenDispatchCount
invalidTensorCount
zeroWeightGuardCount
tensorTemporaryAllocationCount
tensorTemporaryDestroyCount
tensorPipelineRebuildCount
tensorDeviceLossCount
tiledReferenceComparisonCount
tiledReferenceMismatchCount
exportTensorStageCount
deltaKTensorStageCount
```

Telemetry counters are evidence only when paired with stage receipts and device epoch.

---

# 19. Verification Artifacts

The bake shall generate:

```text
README_TDT_RESAMPLE_RUNTIME_01_R1C_APPLIED.md
specs/TDT-RESAMPLE-RUNTIME-01-R1C_..._SPEC.md
patches/TDT_RESAMPLE_RUNTIME_01_R1C_....diff
patches/TDT_RESAMPLE_RUNTIME_01_R1C_CHANGED_FILE_MANIFEST.json
artifacts/resample-runtime-01-r1c/source-bake/TDT_RESAMPLE_RUNTIME_01_R1C_SOURCE_RECEIPT.json
artifacts/resample-runtime-01-r1c/source-bake/TDT_RESAMPLE_RUNTIME_01_R1C_REGRESSION_SUMMARY.json
artifacts/resample-runtime-01-r1c/source-bake/TDT_RESAMPLE_RUNTIME_01_R1C_FIXTURE_MANIFEST.json
artifacts/resample-runtime-01-r1c/source-bake/TDT_RESAMPLE_RUNTIME_01_R1C_SHADER_MANIFEST.json
```

On the canonical Windows GPU, verification shall additionally generate:

```text
TDT_RESAMPLE_RUNTIME_01_R1C_GPU_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R1C_TENSOR_FIXTURE_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R1C_TILED_REFERENCE_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R1C_PACKAGED_RECEIPT.json
```

---

# 20. Regression Requirements

R1C shall re-run and preserve:

- R1A source and semantic gates,
- R1B planner and multistage gates,
- Active Graph gate,
- GPU Device SSOT gate,
- Surface Lifecycle gate,
- Preview Presenter gate,
- Runtime R7 gate,
- Export Worker 01 through 07,
- Export Promotion 01 through 03,
- Build Lock and Build Emit,
- MODJPEG,
- Native Decoder,
- JXL Codec,
- PSD Decoder,
- Promotion Baseline.

A changed predecessor gate may be updated only when the old gate asserted a syntax shape that R1C replaces with an equal or stronger semantic contract. Any such update shall be documented in the APPLIED README.

---

# 21. Success Criteria

R1C source bake succeeds only when:

```text
source gates RC01..RC90 PASS
mock/semantic tensor fixtures PASS
R1A and R1B predecessor gates PASS
all changed TS/JS/MJS syntax checks PASS
all new WGSL assets are manifested
no production pointer mutation occurs
```

R1C physical verification succeeds only when:

```text
RC91..RC96 PASS
canonical Windows x64 packaged Electron PASS
canonical physical WebGPU device PASS
tiled/reference parity PASS
direction/coherence fixtures PASS
Preview/Export final chain PASS
device-loss/relaunch cleanup PASS
```

Source-only success state:

```text
RESAMPLE_RUNTIME_R1C_SOURCE_BAKED_AWAITING_PACKAGED_GPU
```

Full verified, unpromoted state:

```text
RESAMPLE_RUNTIME_R1C_VERIFIED_UNPROMOTED
```

Production promotion remains forbidden under R1C.

---

# 22. Required Follow-Up

R1C establishes correct tensor and ellipse semantics. It does not complete all compatibility migration or performance optimization.

Required follow-up sequence:

```text
R1D
Adaptive / EngineAuto / Worker / Export Compatibility Migration
Preview·Export Shared Surface Closure

R2
Workgroup Tiled Tensor + EWA Optimization
Uniform Barrier
Baseline Pixel Parity
GPU Timestamp Performance Seal
```

R1D may retire `legacy-external-v1` only after caller count and packaged evidence prove that no admitted product caller depends on it.

R2 may optimize tensor integration and EWA shared-memory access only against the R1C product/reference fixture corpus.

---

# 23. Final Seal Statement

R1C is complete only when the word “anisotropic” corresponds to observable product behavior:

```text
real spatial gradient
→ real integrated tensor
→ real ordered eigenvalues
→ real coherence
→ real tangent direction
→ scale-aware ellipse radii
→ bounded integer-lattice EWA sampling
```

A direction vector without tensor provenance is not R1C.

A center gradient repeated over a neighborhood is not R1C.

A local four-neighbor basis is not R1C.

A parameter that does not change the footprint is not R1C.

A legacy external tensor may remain admitted for compatibility, but it shall not be presented as canonical tensor truth.

The existing pipeline remains alive throughout the migration. The mathematical engine inside it becomes explicit, stage-local, measurable, and receipt-sealed.
