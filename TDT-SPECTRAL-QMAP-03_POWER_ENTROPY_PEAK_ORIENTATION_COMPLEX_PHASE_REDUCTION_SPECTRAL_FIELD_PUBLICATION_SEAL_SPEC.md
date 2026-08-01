
# TDT-SPECTRAL-QMAP-03

## Power·Entropy·Peak Orientation·Complex Phase Reduction / Spectral Field Publication Seal

- **Patch ID:** `TDT-SPECTRAL-QMAP-03`
- **Roadmap position:** `03`
- **Parent:** `TDT-SPECTRAL-QMAP-02`
- **Parent ZIP:** `56_TDT_SPECTRAL_QMAP_02_BATCHED_STOCKHAM_2D_WEBGPU_FFT_SINGLE_WRITER_BUTTERFLY_TRANSPOSE_ZERO_INTERMEDIATE_READBACK_SOURCE_BAKED_AWAITING_PACKAGED_GPU.zip`
- **Parent ZIP SHA-256:** `ad2802ce38c6fc4c7b5b7797fbd5c7bd583d877209cc880b3a22c62f1e2c12f7`
- **Parent source seal:** `f53838c2f57f94d6e12437fa42809cfa151acab362f80fb5355b460cf124f633`
- **Predecessor source state:** `SPECTRAL_QMAP_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target source state:** `SPECTRAL_QMAP_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target verified state:** `SPECTRAL_QMAP_03_VERIFIED_UNPROMOTED`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Primary execution backend:** WebGPU
- **Kernel language:** WGSL
- **Canonical input:** natural-order batched frequency-complex Analysis Field from SQ02
- **Canonical outputs:** normalized power spectrum, normalized entropy, dominant axial feature orientation, center-anchored dominant complex phase, fused spectral summary
- **CPU spectral reduction:** forbidden
- **WebGL spectral reduction:** forbidden
- **Intermediate spectrum readback:** forbidden
- **JavaScript/TypeScript role:** request normalization, immutable policy construction, buffer planning, command encoding, Authority transaction, receipts, cancellation, error propagation
- **Status at specification issue:** `SPEC_DEFINED_UNBAKED`

---

# 0. Executive Contract

`TDT-SPECTRAL-QMAP-03` converts the GPU-resident frequency-complex window batch produced by SQ02 into canonical GPU-resident spectral Analysis Fields.

The product graph shall be:

```text
SQ02 frequency-complex window batch
        │
        ├─ normalized power pass
        │
        ├─ canonical Hermitian-pair candidate mapping
        │
        ├─ deterministic partial reduction
        │       ├─ band power
        │       ├─ P log P
        │       ├─ axial second moment
        │       └─ deterministic top-2 peak records
        │
        ├─ recursive partial merge
        │
        ├─ final window reduction
        │       ├─ normalized Shannon entropy
        │       ├─ dominant iso-phase feature orientation
        │       ├─ center-anchored dominant complex phase
        │       └─ conservative confidence
        │
        └─ atomic Analysis Field bundle publication
                ├─ power spectrum
                ├─ entropy
                ├─ peak orientation
                ├─ complex phase
                └─ fused summary
```

The source-baked state shall prove that:

1. SQ03 consumes only the canonical SQ02 frequency-complex GPU field,
2. the exact window layout and real-signal contract are attached by an immutable receipt,
3. DC, negative frequencies, Nyquist self-conjugate bins, and rectangular frequency coordinates have explicit ownership rules,
4. spectral power is normalized before reduction,
5. entropy is normalized to `[0,1]` over a deterministic candidate set,
6. peak selection has deterministic top-2 ordering and tie-breaking,
7. reported orientation is the iso-phase feature tangent, not the raw wave-vector direction,
8. complex phase is represented as a unit vector and anchored at the window center,
9. all five output fields are published atomically under one receipt digest,
10. no CPU, WebGL, Canvas, or intermediate host readback participates,
11. cancellation or device loss publishes no partial field bundle,
12. legacy facades cannot return fake CPU Q-map arrays,
13. all parent ABI, Surface, Preview, Export, Build, and Codec gates remain intact.

SQ03 shall not claim that source extraction, Hann windowing, overlap reconstruction, Hannakairo topology, analytic Q-wave fusion, R1D policy fusion, or persistent GPU Atlas residency are complete.

---

# 1. Parent Truth and Exact Baseline

## 1.1 Parent implementation identities

The exact parent files are:

```text
app/src/runtime/analysis/spectral/spectral-stockham-executor-service.ts
SHA-256: 36cda7394cc65b9933655bca2238da83a8becb03c22839d123d355c9735928fc

app/src/runtime/analysis/spectral/spectral-fft-types.ts
SHA-256: 61cceaee4d0ef660b68e4b82a8f96b428a5ca62a3b6de1c1fba55bfb412ba03f

app/src/runtime/analysis/analysis-field-authority-service.ts
SHA-256: 96d13051f3184e9c60fd6da99b498164479df33513c8ac94259962e12750b8b5

app/src/runtime/analysis/generated/generated-analysis-semantic-registry.json
SHA-256: 7dbeb7266459df768057ed87f8c319b41a9c823e346c8b80a2861b0dc303153f

app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js
SHA-256: a90a209d4581ce6b3e4c6941e22c8e2338654c7430860504d928eb190cac37d0

app/legacy-runtime/js/modules/qmapFFTBuilder.js
SHA-256: c470b4e5cbbcedfc31ece1cec71b0eb1bb8e37698e2b1f7a5a428509c417a82e
```

Generated parent identities:

```text
Analysis semantic registry version: tdt.analysis.semantic-registry.sq02.v1
Analysis semantic registry digest:  95c9b7f3679187c5105ccdfdc656b0523e8393a7dd6115a636e045fcd006943b
Analysis producer inventory digest: 774e2b21983d947c199bdd512ba533f40cafee3139b75dbb181843bd7a71eb94
Runtime asset manifest digest:      e0b64c47ae8775d323bc831fa8c401e22640d417982fd178d139360e7618debd
Active Graph digest:                ef309899a5f6d3fc177d9a8b3eee5dd9be6ecbc80a15dae88b43075e664e47b9
```

## 1.2 Parent FFT truth

SQ02 publishes:

```text
semanticId:     tdt.analysis.spectral.window-frequency-complex.v1
resourceKind:   storage-buffer
format:         complex-f32-interleaved
layout:         natural row-major frequency order
width:          FFT width W
height:         FFT height H
layers:         window count B
forward sign:   -1
normalization:  none
```

SQ03 shall preserve the parent frequency buffer byte identity. It may pin and read the buffer from WGSL. It shall not rewrite, normalize in place, transpose again, or transfer ownership away from the SQ02 field.

## 1.3 Parent semantic defects that SQ03 must not silently inherit

The SQ02 registry contains draft semantic IDs for power, summary, phase, and peak orientation. Their current descriptors are not sufficient as canonical SQ03 outputs because:

- `stage-pixel` is not the true coordinate space of one-record-per-window fields,
- several scalar ranges are declared as `[-1,1]` although entropy, magnitude, and confidence are non-negative,
- `complex-phase.v1` does not state which frequency bin owns the phase,
- `peak-orientation.v1` does not distinguish wave-vector direction from feature tangent direction,
- the draft IDs do not bind a window-layout receipt,
- the draft IDs do not define Hermitian pair ownership or Nyquist policy.

SQ03 shall not mutate the meaning of an already sealed semantic ID.

It shall add new unambiguous canonical semantic IDs and leave the old IDs as compatibility-only aliases.

## 1.4 Atomic publication defect in the parent Authority

The current `publishField()` method transitions a build lease from `FENCE_COMPLETED` to `PUBLISHED` on the first publication. A second publication under the same lease cannot satisfy the original `FENCE_COMPLETED` precondition.

SQ03 requires five outputs from one reduction execution. Therefore the Authority shall gain an atomic field-set publication API.

A sequential sequence of five independent receipts is forbidden because it permits half-published states such as:

```text
power published
entropy published
peak publication failed
phase absent
summary absent
```

SQ03 shall publish all outputs or none.

## 1.5 Missing SQ01 dependency

The roadmap item `TDT-SPECTRAL-QMAP-01` is expected to provide deterministic source-window extraction, Hann multiplication, boundary policy, and a window-layout receipt.

It is not assumed to be baked.

Therefore SQ03 shall support:

- product execution only when a canonical window-layout receipt is attached to the SQ02 output,
- fixture-only execution with a generated layout receipt,
- no CPU reconstruction of missing window positions,
- no guessing from `windowCount` alone.

Missing layout identity shall fail with `E_SPECTRAL_LAYOUT_RECEIPT_REQUIRED`.


# 2. Goals

1. Implement normalized spectral power generation on the GPU.
2. Define a deterministic independent-frequency candidate set for real-valued input windows.
3. Compute normalized Shannon entropy per window.
4. Compute a deterministic dominant spectral peak and runner-up.
5. Publish dominant iso-phase feature orientation as an axial double-angle vector.
6. Publish center-anchored dominant complex phase as a unit complex vector.
7. Produce a conservative confidence value from peak share, dominance, and angular coherence.
8. Publish a fused summary record for downstream policy fusion.
9. Extend the Analysis Field Authority with atomic multi-output publication.
10. Preserve the SQ02 input field and execution receipt chain.
11. Keep all spectral values GPU-resident.
12. Preserve legacy public names while removing false CPU-array success.
13. Provide independent GPU reference and fixture contracts.
14. Keep Production Pointer unchanged.


# 3. Non-Goals

SQ03 shall not implement:

- source-image window extraction,
- Hann, Blackman, Kaiser, or other window generation,
- FFT execution or inverse FFT replacement,
- non-power-of-two spectral transforms,
- overlap-add or overlap-average reconstruction,
- full-resolution source-space projection,
- spectral denoising,
- learned spectral classification,
- Hannakairo winding or defect topology,
- analytic Q-wave construction,
- R1D adaptation-policy fusion,
- R2 EWA parameter mutation,
- persistent GPU Tile Atlas allocation,
- CPU FFT or CPU spectral oracle in the product runtime,
- absolute performance promotion.

A later patch may materialize the window-grid records as sampled textures. SQ03 canonical truth remains the f32 storage-buffer field bundle.


# 4. Ownership and SSOT

## 4.1 Producer identity

SQ03 shall register exactly one producer:

```text
producerId:       tdt.analysis.producer.spectral.reduction
producerVersion:  1.0.0
implementationId: tdt-spectral-power-entropy-peak-phase-webgpu-v1
productAdmission: canonical
executionBackend: webgpu
kernelLanguage:   wgsl
```

Accepted input semantic:

```text
tdt.analysis.spectral.window-frequency-complex.v1
```

Output semantic set:

```text
tdt.analysis.spectral.window-power-spectrum.v1
tdt.analysis.spectral.window-entropy.v1
tdt.analysis.spectral.window-peak-orientation.v1
tdt.analysis.spectral.window-complex-phase.v1
tdt.analysis.spectral.window-summary.v1
```

## 4.2 Device ownership

The producer shall use the current GPU Device Authority device and queue.

It shall not request another adapter or device.

Recommended consumer ID:

```text
dadum.gpu.consumer.spectral-reduction
```

All pipeline caches, buffers, layouts, and job arenas shall be keyed by device epoch.

## 4.3 Input ownership

The SQ02 frequency field shall be pinned through the Analysis Field Authority for the complete encode, submit, fence, and publication transaction.

SQ03 shall never destroy or mutate the input field resource.

## 4.4 Output ownership

Final output buffers shall be transferred atomically to the Analysis Field Authority.

Scratch buffers shall remain owned by the SQ03 job arena and shall be destroyed after the completion fence or failure cleanup.

## 4.5 SSOT prohibition

SQ03 shall not create:

- another semantic registry,
- another field ledger,
- another GPU device owner,
- a global mutable spectral cache,
- a CPU mirror of output arrays,
- a second receipt identity.


# 5. Canonical Window Layout Receipt

## 5.1 Receipt purpose

A frequency batch with dimensions `W×H×B` does not determine where each window belongs in the source image.

SQ03 shall require an immutable layout receipt.

```ts
interface SpectralWindowLayoutReceiptV1 {
  readonly schemaVersion: 1;
  readonly layoutId: 'tdt.spectral.window-layout.v1';
  readonly layoutDigest: string;
  readonly sourceSurfaceId: string;
  readonly sourceRevision: number;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly windowWidth: number;
  readonly windowHeight: number;
  readonly strideX: number;
  readonly strideY: number;
  readonly gridWidth: number;
  readonly gridHeight: number;
  readonly planeCount: number;
  readonly windowCount: number;
  readonly windowOrder: 'plane-major-row-major';
  readonly originPolicy: 'integer-top-left-clamped-final';
  readonly centerConvention: 'half-sample-(size-minus-one)-over-two';
  readonly signalClass: 'real-valued-window-in-complex-container';
  readonly windowFunctionId: string;
  readonly windowFunctionDigest: string;
  readonly coherentGain: number;
  readonly powerGain: number;
}
```

## 5.2 Count identity

The following shall hold:

```text
windowCount = gridWidth × gridHeight × planeCount
windowWidth = SQ02 descriptor.width
windowHeight = SQ02 descriptor.height
windowCount = SQ02 descriptor.layers
```

Any mismatch shall fail before GPU dispatch.

## 5.3 Source identity

The layout receipt and frequency field shall have identical:

- sourceSurfaceId,
- sourceRevision,
- sourceWidth,
- sourceHeight.

## 5.4 Layout binding into SQ02

SQ02 shall accept an optional canonical layout receipt digest when executing.

The digest shall be included in:

- SQ02 request digest,
- SQ02 parameter digest,
- SQ02 output semantic metadata,
- SQ02 execution detail.

SQ03 product execution shall reject parent outputs produced without this binding.

## 5.5 Fixture allowance

Source and mock gates may use a fixture layout producer that emits a canonical receipt without reading source pixels on the CPU.

Fixture mode shall be explicit and shall never be admitted as a product source producer.


# 6. Analysis Field Authority Atomic Publication Extension

## 6.1 New API

The Authority bridge shall add:

```ts
publishFieldSet(
  leaseId: string,
  publications: readonly AnalysisFieldPublication[]
): readonly AnalysisFieldHandle[];
```

`publishField()` shall remain for ABI compatibility and shall delegate to `publishFieldSet(leaseId, [publication])`.

## 6.2 Preflight validation

Before mutating Authority state, `publishFieldSet()` shall validate every publication:

- semantic is included in the build request,
- no semantic is duplicated,
- the set exactly matches the requested output semantic set,
- resource kind and format match the semantic descriptor,
- dimensions and layers are positive and mutually consistent,
- coordinate-space identity is valid,
- semantic metadata is canonical JSON,
- every resource belongs to the current device epoch,
- the fence is complete,
- the lease is not superseded,
- every generation can be reserved.

## 6.3 One receipt

One execution receipt shall contain all output handles in canonical semantic-ID order.

Every handle and descriptor in the set shall carry the same:

- executionReceiptId,
- executionReceiptDigest,
- source revision,
- device epoch,
- request digest,
- parameter digest,
- shader-set digest,
- resource-descriptor digest,
- field-set digest.

## 6.4 All-or-none mutation

If any preflight check fails:

- no generation counter shall advance,
- no field shall enter the registry,
- no producer publication count shall increment,
- no success receipt shall be sealed.

If resource registration fails after preflight, the transaction shall roll back all provisional records and return `E_ANALYSIS_FIELD_SET_PUBLICATION_FAILED`.

## 6.5 Semantic metadata

`AnalysisFieldPublication` and `AnalysisFieldDescriptor` shall gain immutable semantic metadata and its digest:

```ts
readonly semanticMetadata?: Readonly<Record<string, unknown>>;
readonly semanticMetadataDigest: string;
```

The metadata shall be JSON-safe, canonically ordered, and included in the field-set receipt digest.


# 7. Canonical Semantic Definitions

The SQ02 draft spectral outputs remain compatibility aliases. SQ03 adds the following canonical semantics.

## 7.1 Window power spectrum

```text
semanticId:          tdt.analysis.spectral.window-power-spectrum.v1
domain:              spectral
periodicity:         none
coordinateSpace:     frequency-bin
resourceKind:        storage-buffer
format:              f32-scalar-buffer
shape:               W × H × B
interpolation:       forbidden
neutral:             0
range:               [0,+finite]
```

Each element contains normalized bin power.

## 7.2 Window entropy

```text
semanticId:          tdt.analysis.spectral.window-entropy.v1
domain:              spectral
periodicity:         none
coordinateSpace:     window-grid
resourceKind:        storage-buffer
format:              vec2-f32-record-buffer
record stride:       8 bytes
shape:               gridWidth × gridHeight × planeCount
```

Channels:

```text
R: normalized Shannon entropy [0,1]
G: validity [0,1], product values exactly 0 or 1
```

## 7.3 Window peak orientation

```text
semanticId:          tdt.analysis.spectral.window-peak-orientation.v1
domain:              spectral
periodicity:         pi-axial
coordinateSpace:     window-grid
resourceKind:        storage-buffer
format:              vec4-f32-record-buffer
record stride:       16 bytes
```

Channels:

```text
R: cos(2 θ_feature) [-1,1]
G: sin(2 θ_feature) [-1,1]
B: peak power share [0,1]
A: confidence [0,1]
```

## 7.4 Window complex phase

```text
semanticId:          tdt.analysis.spectral.window-complex-phase.v1
domain:              spectral
periodicity:         two-pi
coordinateSpace:     window-grid
resourceKind:        storage-buffer
format:              vec4-f32-record-buffer
record stride:       16 bytes
```

Channels:

```text
R: cos(φ_center) [-1,1]
G: sin(φ_center) [-1,1]
B: sqrt(peak pair power) [0,+finite]
A: phase validity, exactly 0 or 1
```

## 7.5 Window summary

```text
semanticId:          tdt.analysis.spectral.window-summary.v1
domain:              spectral
periodicity:         pi-axial
coordinateSpace:     window-grid
resourceKind:        storage-buffer
format:              vec4-f32-record-buffer
record stride:       16 bytes
```

Channels:

```text
R: normalized entropy [0,1]
G: cos(2 θ_feature) [-1,1]
B: sin(2 θ_feature) [-1,1]
A: confidence [0,1]
```

## 7.6 Metadata identity

Every reduced field shall include:

```text
layoutDigest
policyDigest
frequencyExecutionReceiptDigest
windowFunctionDigest
signalClass
windowOrder
gridWidth
gridHeight
planeCount
```

Power output additionally records `powerNormalizationId`.


# 8. Frequency Coordinates and Candidate Ownership

## 8.1 Natural-order signed bins

For natural-order index `(u,v)`:

```text
kx = u,                 when u <= floor(W/2)
kx = u - W,             otherwise
ky = v,                 when v <= floor(H/2)
ky = v - H,             otherwise
fx = kx / W
fy = ky / H
```

There is no implicit FFT shift.

## 8.2 DC

`(kx,ky)=(0,0)` is DC.

DC remains present in the power field but is excluded from entropy, peak, orientation, phase, and confidence candidate sets.

## 8.3 Hermitian pair ownership

SQ03 canonical product input requires a real-valued spatial signal stored in a complex container.

For non-self-conjugate bins, one canonical pair owner is selected:

```text
ky > 0
or
ky = 0 and kx > 0
```

The owner represents both `k` and `-k`.

Pair power is:

```text
P_pair(k) = P(k) + P(-k)
```

No negative-frequency duplicate shall enter entropy or top-2 selection.

## 8.4 Self-conjugate bins

A bin is self-conjugate when both coordinates are either zero or their even-size Nyquist value.

Self-conjugate bins:

- remain in the full power field,
- are excluded from canonical peak orientation,
- are excluded from canonical complex phase,
- are excluded from default entropy candidates,
- may be reported in validation diagnostics.

This avoids treating a purely real `0` or `π` coefficient as a general complex phase.

## 8.5 Real-signal contract

Product execution shall require:

```text
signalClass = real-valued-window-in-complex-container
```

Complex arbitrary input shall fail with `E_SPECTRAL_SIGNAL_CLASS_UNSUPPORTED`.

A physical validation profile shall measure Hermitian residuals. The source-baked state shall not claim physical Hermitian parity without that run.


# 9. Reduction Policy

The immutable policy shall be:

```ts
interface SpectralReductionPolicyV1 {
  readonly schemaVersion: 1;
  readonly policyId: 'tdt.spectral.reduction-policy.v1';
  readonly minRadialCyclesPerPixel: number;
  readonly maxRadialCyclesPerPixel: number;
  readonly excludeDc: true;
  readonly excludeSelfConjugate: true;
  readonly pairOwnership: 'canonical-positive-half-plane-v1';
  readonly peakTieBreak: 'lower-natural-linear-index';
  readonly orientationMeaning: 'iso-phase-feature-tangent';
  readonly phaseAnchor: 'window-center';
  readonly entropyLogBase: 'natural-normalized';
  readonly minimumBandPower: number;
  readonly finitePolicy: 'fail-window-and-report';
  readonly policyDigest: string;
}
```

Canonical defaults:

```text
minRadialCyclesPerPixel = 1 / max(W,H)
maxRadialCyclesPerPixel = 0.5, exclusive
minimumBandPower         = 2^-24
```

The policy may narrow the radial band, but it shall not include DC or self-conjugate bins in the phase/orientation candidate set.

Policy values shall be finite and deterministic. Invalid or empty bands shall fail before publication.


# 10. Normalized Power

Let:

```text
N = W × H
X(k) = re(k) + i im(k)
```

The canonical normalized power is:

```text
P(k) = [re(k)^2 + im(k)^2] / N^2
```

Properties:

- no square root in the power pass,
- no logarithm in the power pass,
- no input-buffer mutation,
- DC remains at natural index zero,
- all non-finite input coefficients set a per-window failure flag,
- negative finite roundoff is clamped to zero only after explicit finite validation.

The power kernel shall use one invocation owner per frequency bin.

The output buffer shall have exactly `W × H × B` f32 elements.

The power normalization ID shall be:

```text
tdt.spectral.power.norm-forward-unscaled-n2.v1
```

Window-function coherent gain is not folded into the power field. It remains metadata because entropy and relative peak metrics are invariant to uniform scale.


# 11. Entropy Mathematics

## 11.1 Candidate distribution

For the canonical independent candidate set `C`:

```text
S = Σ P_pair(k), k ∈ C
q_k = P_pair(k) / S
```

## 11.2 Normalized Shannon entropy

For `M = |C|` valid candidates:

```text
H = -Σ q_k ln(q_k) / ln(M)
```

The equivalent stable accumulator form may be used:

```text
T = Σ P_pair(k) ln(P_pair(k))
H = [ln(S) - T/S] / ln(M)
```

Terms with zero power contribute zero.

## 11.3 Validity

Entropy validity is `1` only when:

- all input coefficients participating in the window are finite,
- `M >= 2`,
- `S > minimumBandPower`,
- the final entropy is finite.

Otherwise:

```text
entropy = 0
validity = 0
```

A low-entropy single-tone window remains valid when `M>=2` and band power is present.

## 11.4 Clamp

After finite validation, normalized entropy shall be clamped to `[0,1]` only for bounded floating-point roundoff.

A gross out-of-range result shall set the window failure flag and fail physical validation.


# 12. Peak Selection and Deterministic Top-2

## 12.1 Candidate score

The peak score is canonical pair power.

No orientation weighting, radial preference, image-content heuristic, or wall-clock-dependent choice is allowed.

## 12.2 Top-2 record

Each reduction record shall retain:

```text
peakPower
peakNaturalIndex
secondPower
secondNaturalIndex
```

The two indices shall be distinct.

## 12.3 Total ordering

Candidate A precedes B when:

1. `A.power > B.power`, or
2. powers are bitwise equal and `A.naturalLinearIndex < B.naturalLinearIndex`.

The same ordering shall be used in:

- local lane insertion,
- workgroup reduction,
- recursive partial merge,
- direct reference validation.

## 12.4 Peak metrics

```text
peakShare = peakPower / bandPower
dominance = max(peakPower - secondPower, 0) / max(peakPower, ε)
```

Both values shall be clamped to `[0,1]` after finite validation.


# 13. Peak Orientation Meaning

The dominant spectral peak identifies a wave vector, not directly the visible line direction.

For the selected canonical peak:

```text
k = (fx, fy)
θ_wave = atan2(fy, fx)
θ_feature = θ_wave + π/2
```

SQ03 publishes the iso-phase feature tangent as an axial orientation:

```text
orientation = (cos 2θ_feature, sin 2θ_feature)
```

The implementation may avoid trigonometric functions by using:

```text
r2 = fx^2 + fy^2
cos 2θ_feature = (fy^2 - fx^2) / r2
sin 2θ_feature = (-2 fx fy) / r2
```

The vector shall be normalized within f32 tolerance.

Consequences:

- horizontal frequency variation produces a vertical feature orientation,
- `k` and `-k` produce the same axial orientation,
- eigenvector-style sign flips are irrelevant,
- orientation is invalid for zero or self-conjugate bins.


# 14. Angular Coherence and Confidence

For every candidate pair:

```text
C = Σ P_pair(k) cos 2θ_feature(k)
S2 = Σ P_pair(k) sin 2θ_feature(k)
angularCoherence = sqrt(C^2 + S2^2) / bandPower
```

After finite validation:

```text
confidence = min(peakShare, dominance, angularCoherence)
```

This conservative minimum is chosen instead of an arbitrary nonlinear blend.

Confidence validity requires:

- valid band power,
- valid top-2 record,
- valid peak orientation,
- finite moment sums.

Invalid windows publish the neutral orientation `(1,0)` and confidence `0`.


# 15. Complex Phase Reduction

## 15.1 Peak coefficient

The complex phase shall come from the selected canonical peak coefficient `X(k*)` in the SQ02 frequency buffer.

It shall not come from:

- the power buffer,
- an averaged angle of unrelated bins,
- CPU `atan2`,
- a visual Q-wave phase,
- Hannakairo topology.

## 15.2 Center anchor

The local DFT coefficient phase is converted to the phase at the geometric window center.

```text
cx = (W - 1) / 2
cy = (H - 1) / 2
φ_raw = atan2(im(k*), re(k*))
φ_center = wrapToPi[φ_raw + 2π(fx cx + fy cy)]
```

The published representation is:

```text
(cos φ_center, sin φ_center)
```

Consumers shall compare phase through the unit vector, not by subtracting wrapped scalar angles directly.

## 15.3 Magnitude

The phase record magnitude is:

```text
sqrt(peakPairPower)
```

It is a normalized spectral-energy magnitude. It shall not be labelled absolute source amplitude.

## 15.4 Validity

Phase validity is `1` only when:

- the real-signal contract is present,
- the peak is non-self-conjugate,
- peak power exceeds the minimum threshold,
- the coefficient and center correction are finite.

Otherwise the neutral record is:

```text
(1, 0, 0, 0)
```


# 16. GPU Pipeline

The canonical producer shall use the following passes.

## 16.1 Pass P0: power

```text
one invocation per frequency bin
input:  complex f32 frequency buffer
output: f32 normalized power buffer
```

## 16.2 Pass P1: partial reduction

Each workgroup processes a deterministic contiguous block of natural-order bins for one window.

Recommended workgroup size:

```text
256 invocations
```

Each lane emits a private candidate record. Shared-memory tree reduction produces one partial record.

## 16.3 Partial record

The record shall contain at least:

```text
bandPower
sumPLogP
momentCos2
momentSin2
peakPower
peakIndex
secondPower
secondIndex
candidateCount
finiteFailureMask
```

The binary record layout shall be explicit, aligned, and versioned.

## 16.4 Pass P2: recursive merge

Partial records shall be merged by deterministic tree passes until one aggregate remains per window.

The merge operator shall be associative under the defined f32 execution order and top-2 total ordering.

No atomic float accumulation is allowed in the product reduction.

## 16.5 Pass P3: finalize

One invocation per window shall:

- compute entropy,
- recover the selected complex coefficient,
- compute feature orientation,
- compute center-anchored phase,
- compute peak metrics and confidence,
- write entropy, peak, phase, and summary records.

## 16.6 Command submission

A reduction chunk shall encode all passes into one command encoder and one queue submission.

Window-by-window submission is forbidden.

## 16.7 Buffer chunking

The planner shall honor:

- `maxBufferSize`,
- `maxStorageBufferBindingSize`,
- `maxComputeWorkgroupsPerDimension`,
- uniform-buffer alignment,
- the parent frequency field byte length.

Chunk boundaries shall preserve window order and output offsets.


# 17. Resource Lifecycle

## 17.1 Final resources

Final Authority-owned resources:

```text
power buffer
entropy buffer
peak-orientation buffer
complex-phase buffer
summary buffer
```

## 17.2 Scratch resources

Job-arena resources:

```text
partial-A buffer
partial-B buffer
parameter buffer
optional validation summaries
```

## 17.3 Fence rule

No output field shall be published before `queue.onSubmittedWorkDone()` or the canonical GPU completion fence resolves.

## 17.4 Failure cleanup

On any error before atomic transfer:

- all final candidate buffers shall be destroyed by the job arena,
- all scratch buffers shall be destroyed,
- the input pin shall be released,
- the build lease shall record failure,
- no field generation shall advance.

## 17.5 Cancellation

Cancellation shall be checked:

- before input pin,
- before allocation,
- before every chunk encode,
- before submit,
- after the completion fence,
- before field-set publication.

A cancelled job shall never publish a partial or complete bundle.

## 17.6 Device loss

Device loss invalidates:

- pipeline bundles,
- bind-group layouts,
- active job arenas,
- provisional final buffers,
- unpublished receipts.

A stale-epoch result shall fail with `E_SPECTRAL_REDUCTION_STALE_DEVICE_EPOCH`.


# 18. Zero CPU Compute and Zero Readback

The product source shall contain no call path from SQ03 to:

```text
mapAsync()
getMappedRange()
GPUBufferUsage.MAP_READ
readPixels()
getImageData()
CPU FFT
CPU entropy loop
CPU peak scan
CPU atan2 over pixels or bins
CPU phase unwrap
CPU output-array reconstruction
GPU result re-upload
```

Allowed host-visible data is limited to:

- immutable request metadata,
- plan and policy descriptors,
- receipt JSON,
- small validation scalar summaries in explicit physical validation mode.

The product execution receipt shall state:

```text
cpuPixelComputeUsed: false
webglPixelComputeUsed: false
canvasPixelComputeUsed: false
intermediatePixelReadbackCount: 0
```


# 19. Execution Detail and Receipt

The SQ03 execution detail shall include:

```ts
interface SpectralReductionExecutionDetailV1 {
  readonly schemaVersion: 1;
  readonly algorithmId: 'tdt.spectral.reduction.webgpu.v1';
  readonly frequencyExecutionReceiptDigest: string;
  readonly layoutDigest: string;
  readonly policyDigest: string;
  readonly width: number;
  readonly height: number;
  readonly windowCount: number;
  readonly gridWidth: number;
  readonly gridHeight: number;
  readonly planeCount: number;
  readonly powerDispatchCount: number;
  readonly partialReductionDispatchCount: number;
  readonly recursiveMergeDispatchCount: number;
  readonly finalizeDispatchCount: number;
  readonly queueSubmissionCount: number;
  readonly outputSemanticIds: readonly string[];
  readonly outputByteLengths: readonly number[];
  readonly intermediateReadbackCount: 0;
  readonly detailDigest: string;
}
```

The resource descriptor digest shall bind:

- input field ID and generation,
- input execution receipt digest,
- input byte layout,
- layout digest,
- policy digest,
- output formats and byte lengths,
- pipeline IDs,
- shader asset digests,
- device epoch.

The atomic field-set receipt shall be the single execution truth for all outputs.


# 20. Legacy Facade Migration

## 20.1 Existing names

The following names shall remain importable:

```text
initWebGPU()
computeQMap_GPU_All()
executeBatchedStockham2D()
QmapFFTBuilder
heatmap01toRGBA()
```

## 20.2 New canonical facade

Add:

```text
reduceSpectralFields(frequencyHandle, layoutReceipt, options)
QmapFFTBuilder.buildSpectralFields(inputHandle, layoutReceipt, options)
```

`buildSpectralFields()` may chain SQ02 then SQ03 when given a spatial-complex input handle.

## 20.3 CPU array prohibition

No facade shall accept:

- grayscale CPU arrays,
- complex CPU arrays,
- CPU power arrays,
- CPU window-origin arrays.

Such inputs shall fail with `E_SPECTRAL_CPU_INPUT_FORBIDDEN`.

## 20.4 Heatmap facade

`heatmap01toRGBA()` shall not become a CPU conversion helper.

Until a GPU visualization producer exists, it shall remain fail-closed or return a GPU field handle only through a newly named asynchronous facade.

## 20.5 Peak worker

The legacy FFT peak worker shall not perform CPU reduction.

It may become a protocol broker to the renderer-owned SQ03 service. Unsupported byte-array messages shall fail explicitly.


# 21. Stable Errors

SQ03 shall register at least the following stable errors:

```text
E_SPECTRAL_REDUCTION_INPUT_REQUIRED
E_SPECTRAL_REDUCTION_SEMANTIC_MISMATCH
E_SPECTRAL_LAYOUT_RECEIPT_REQUIRED
E_SPECTRAL_LAYOUT_DIGEST_MISMATCH
E_SPECTRAL_LAYOUT_WINDOW_COUNT_MISMATCH
E_SPECTRAL_LAYOUT_SOURCE_MISMATCH
E_SPECTRAL_SIGNAL_CLASS_UNSUPPORTED
E_SPECTRAL_REDUCTION_POLICY_INVALID
E_SPECTRAL_REDUCTION_BAND_EMPTY
E_SPECTRAL_REDUCTION_BUFFER_LIMIT
E_SPECTRAL_REDUCTION_DISPATCH_LIMIT
E_SPECTRAL_REDUCTION_NONFINITE_INPUT
E_SPECTRAL_HERMITIAN_CONTRACT_FAILED
E_SPECTRAL_REDUCTION_CANCELLED
E_SPECTRAL_REDUCTION_STALE_DEVICE_EPOCH
E_SPECTRAL_REDUCTION_PUBLICATION_INCOMPLETE
E_ANALYSIS_FIELD_SET_PUBLICATION_FAILED
E_ANALYSIS_FIELD_SET_DUPLICATE_SEMANTIC
E_ANALYSIS_FIELD_SET_SEMANTIC_MISMATCH
E_ANALYSIS_FIELD_METADATA_INVALID
```

The error registry shall contain no duplicate code and no unstable string-only failure path.


# 22. Validation Architecture

## 22.1 Independent GPU reference

A direct reference reduction shader shall process one small window per workgroup without using production partial-record merge code.

It shall compute:

- normalized power,
- entropy,
- top-2 peaks,
- feature orientation,
- center-anchored phase,
- confidence.

## 22.2 GPU comparator

The comparator shall report:

```text
nonFiniteCount
powerMismatchCount
entropyMismatchCount
orientationMismatchCount
phaseMismatchCount
summaryMismatchCount
maxPowerAbsError
maxEntropyAbsError
minOrientationDot
maxPhaseAngularError
firstMismatchWindow
firstMismatchChannel
```

## 22.3 Fixture set

Mandatory physical fixtures:

1. all-zero window,
2. constant DC window,
3. horizontal-frequency single tone,
4. vertical-frequency single tone,
5. positive diagonal tone,
6. negative diagonal tone,
7. equal-power two-tone window,
8. dominant-plus-weak-runner-up window,
9. phase-shifted tone pair,
10. translated tone with center-anchor expectation,
11. deterministic broad-band multi-tone fixture,
12. Nyquist-only fixture,
13. rectangular `8×16` fixture,
14. multi-window batch with distinct frequencies,
15. non-finite injection fixture for validation-only failure.

## 22.4 Tolerances

Unless the physical adapter requires a stricter documented profile:

```text
power absolute error:       <= 2e-5
entropy absolute error:     <= 2e-5
orientation vector dot:     >= 1 - 2e-5
phase angular error:        <= 2e-4 radians
confidence absolute error:  <= 3e-5
nonFiniteCount:             0 for valid fixtures
```

## 22.5 Determinism

Repeated runs on the same device epoch shall produce:

- identical selected peak indices,
- identical validity flags,
- identical field-set semantic order,
- identical receipt input identities,
- f32 results within the same-device deterministic profile.


# 23. Source Gate Contract

The source gate shall verify without claiming physical GPU execution:

- all semantic IDs and channel ranges,
- immutable registry generation,
- window-layout receipt schema,
- SQ02 metadata propagation contract,
- power normalization formula,
- Hermitian pair-owner mapping,
- DC and Nyquist exclusion rules,
- deterministic top-2 comparator,
- entropy formula and validity,
- feature-tangent orientation math,
- center-phase correction math,
- conservative confidence formula,
- multi-pass shader asset presence,
- absence of product MAP_READ and CPU loops,
- atomic Authority field-set publication source structure,
- cancellation and cleanup branches,
- legacy facade fail-closed behavior,
- Active Graph and Runtime Asset closure,
- stable error registration,
- predecessor regression scripts.

Mock tests may execute scalar equivalents for integer planning and semantic fixtures. They shall not be represented as physical WebGPU evidence.


# 24. Physical GPU and Packaged Evidence

Physical verification shall prove:

1. every SQ03 WGSL module compiles on the admitted WebGPU implementation,
2. bind-group and buffer-size validation succeeds,
3. product and independent reference reductions match within tolerance,
4. the Hermitian residual profile passes for real-signal fixtures,
5. no intermediate buffer is mapped,
6. atomic publication emits all five outputs with one receipt digest,
7. cancellation before publication emits no field,
8. device loss emits no stale field,
9. repeated batch execution reaches a stable GPU-memory plateau,
10. Windows x64 Packaged Electron can execute and relaunch cleanly,
11. Preview and Export continue using the unchanged canonical Final Surface,
12. Production Pointer remains unchanged.

Physical verification may read back only the compact validation summary and selected tiny fixture records. It shall not read back production spectral fields.


# 25. Implementation File Plan

Recommended new files:

```text
app/src/runtime/analysis/spectral/spectral-reduction-types.ts
app/src/runtime/analysis/spectral/spectral-reduction-policy.ts
app/src/runtime/analysis/spectral/spectral-window-layout-receipt.ts
app/src/runtime/analysis/spectral/spectral-reduction-plan.ts
app/src/runtime/analysis/spectral/spectral-reduction-job-arena.ts
app/src/runtime/analysis/spectral/spectral-reduction-receipt.ts
app/src/runtime/analysis/spectral/spectral-reduction-executor-service.ts
app/src/runtime/analysis/spectral/spectral-reduction-validation.ts

app/legacy-runtime/core/analysis/spectral/shaders/spectral-power-normalize.wgsl
app/legacy-runtime/core/analysis/spectral/shaders/spectral-partial-reduce.wgsl
app/legacy-runtime/core/analysis/spectral/shaders/spectral-partial-merge.wgsl
app/legacy-runtime/core/analysis/spectral/shaders/spectral-finalize-fields.wgsl
app/legacy-runtime/core/analysis/spectral/shaders/spectral-reduction-reference.wgsl
app/legacy-runtime/core/analysis/spectral/shaders/spectral-reduction-compare.wgsl
```

Required modified files include:

```text
app/src/runtime/analysis/analysis-field-types.ts
app/src/runtime/analysis/analysis-field-authority-service.ts
app/src/runtime/analysis/analysis-field-semantic-registry.ts
app/src/runtime/analysis/spectral/spectral-fft-types.ts
app/src/runtime/analysis/spectral/spectral-stockham-executor-service.ts
app/src/runtime/service-token.ts
app/src/boot/runtime-modules.ts
app/src/boot/stable-error.ts
app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js
app/legacy-runtime/js/modules/qmapFFTBuilder.js
```

Generated manifests and receipts shall be regenerated from source. They shall not be manually patched.


# 26. State Transition and Promotion

Allowed transition:

```text
SPECTRAL_QMAP_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU
→ SPECTRAL_QMAP_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU
→ SPECTRAL_QMAP_03_VERIFIED_UNPROMOTED
```

Forbidden transition:

```text
SPECTRAL_QMAP_03_* → PRODUCTION_POINTER_MUTATED
```

SQ03 does not promote FFT, spectral reductions, Hannakairo, Q-wave, Atlas, Preview, Export, or codecs to a new Production Pointer.

The patch is additive and unpromoted until physical GPU and packaged evidence is complete.

# 27. Gate Matrix

The canonical gate set is `SQ03-001` through `SQ03-216`.

Expected source-bake result:

```text
PASS:     204
DEFERRED:  12
FAIL:       0
```

## Parent and dependency truth

- **SQ03-001** `SOURCE_REQUIRED` — Parent ZIP SHA and source seal match.
- **SQ03-002** `SOURCE_REQUIRED` — SQ02 source receipt is present.
- **SQ03-003** `SOURCE_REQUIRED` — SQ02 frequency semantic exists.
- **SQ03-004** `SOURCE_REQUIRED` — SQ02 producer is canonical.
- **SQ03-005** `SOURCE_REQUIRED` — Truth-00 Authority is the only field authority.
- **SQ03-006** `SOURCE_REQUIRED` — GPU Device Authority is the only device owner.
- **SQ03-007** `SOURCE_REQUIRED` — Production Pointer is unchanged.
- **SQ03-008** `SOURCE_REQUIRED` — Parent Active Graph digest is recorded.
- **SQ03-009** `SOURCE_REQUIRED` — Parent semantic registry digest is recorded.
- **SQ03-010** `SOURCE_REQUIRED` — Parent asset manifest digest is recorded.
- **SQ03-011** `SOURCE_REQUIRED` — No SQ01 completion is assumed.
- **SQ03-012** `SOURCE_REQUIRED` — Missing layout receipt fails closed.
## Window layout receipt

- **SQ03-013** `SOURCE_REQUIRED` — Layout receipt schema is versioned.
- **SQ03-014** `SOURCE_REQUIRED` — Layout digest uses canonical JSON.
- **SQ03-015** `SOURCE_REQUIRED` — Source surface ID is required.
- **SQ03-016** `SOURCE_REQUIRED` — Source revision is required.
- **SQ03-017** `SOURCE_REQUIRED` — Source dimensions are required.
- **SQ03-018** `SOURCE_REQUIRED` — Window dimensions are required.
- **SQ03-019** `SOURCE_REQUIRED` — Stride values are positive integers.
- **SQ03-020** `SOURCE_REQUIRED` — Grid dimensions are positive integers.
- **SQ03-021** `SOURCE_REQUIRED` — Plane count is positive.
- **SQ03-022** `SOURCE_REQUIRED` — Window count product is exact.
- **SQ03-023** `SOURCE_REQUIRED` — Window order is plane-major row-major.
- **SQ03-024** `SOURCE_REQUIRED` — Origin policy is explicit.
- **SQ03-025** `SOURCE_REQUIRED` — Center convention is explicit.
- **SQ03-026** `SOURCE_REQUIRED` — Signal class is explicit.
- **SQ03-027** `SOURCE_REQUIRED` — Window function identity is explicit.
- **SQ03-028** `SOURCE_REQUIRED` — Coherent gain is finite.
- **SQ03-029** `SOURCE_REQUIRED` — Power gain is finite.
- **SQ03-030** `SOURCE_REQUIRED` — SQ02 width and height match layout.
- **SQ03-031** `SOURCE_REQUIRED` — SQ02 layers match layout window count.
- **SQ03-032** `SOURCE_REQUIRED` — SQ02 output binds layout digest.
## Semantic truth

- **SQ03-033** `SOURCE_REQUIRED` — New power semantic is registered.
- **SQ03-034** `SOURCE_REQUIRED` — New entropy semantic is registered.
- **SQ03-035** `SOURCE_REQUIRED` — New peak-orientation semantic is registered.
- **SQ03-036** `SOURCE_REQUIRED` — New complex-phase semantic is registered.
- **SQ03-037** `SOURCE_REQUIRED` — New summary semantic is registered.
- **SQ03-038** `SOURCE_REQUIRED` — Old draft semantics remain compatibility-only.
- **SQ03-039** `SOURCE_REQUIRED` — Window-grid coordinate space is added.
- **SQ03-040** `SOURCE_REQUIRED` — Power format is f32 scalar buffer.
- **SQ03-041** `SOURCE_REQUIRED` — Entropy format is vec2 f32 record.
- **SQ03-042** `SOURCE_REQUIRED` — Peak format is vec4 f32 record.
- **SQ03-043** `SOURCE_REQUIRED` — Phase format is vec4 f32 record.
- **SQ03-044** `SOURCE_REQUIRED` — Summary format is vec4 f32 record.
- **SQ03-045** `SOURCE_REQUIRED` — Entropy range is zero to one.
- **SQ03-046** `SOURCE_REQUIRED` — Confidence range is zero to one.
- **SQ03-047** `SOURCE_REQUIRED` — Magnitude is non-negative.
- **SQ03-048** `SOURCE_REQUIRED` — Orientation periodicity is pi axial.
- **SQ03-049** `SOURCE_REQUIRED` — Phase periodicity is two pi.
- **SQ03-050** `SOURCE_REQUIRED` — Neutral values are explicit.
- **SQ03-051** `SOURCE_REQUIRED` — Semantic metadata digest is required.
- **SQ03-052** `SOURCE_REQUIRED` — Registry digest is regenerated.
## Policy and frequency ownership

- **SQ03-053** `SOURCE_REQUIRED` — Policy schema is versioned.
- **SQ03-054** `SOURCE_REQUIRED` — Policy digest is canonical.
- **SQ03-055** `SOURCE_REQUIRED` — Default minimum radius is exact.
- **SQ03-056** `SOURCE_REQUIRED` — Default maximum radius is exclusive 0.5.
- **SQ03-057** `SOURCE_REQUIRED` — DC exclusion is mandatory.
- **SQ03-058** `SOURCE_REQUIRED` — Self-conjugate exclusion is mandatory.
- **SQ03-059** `SOURCE_REQUIRED` — Natural-order signed kx mapping is exact.
- **SQ03-060** `SOURCE_REQUIRED` — Natural-order signed ky mapping is exact.
- **SQ03-061** `SOURCE_REQUIRED` — Rectangular frequency normalization uses W and H separately.
- **SQ03-062** `SOURCE_REQUIRED` — Canonical positive half-plane ownership is exact.
- **SQ03-063** `SOURCE_REQUIRED` — Negative-frequency duplicates are excluded.
- **SQ03-064** `SOURCE_REQUIRED` — Pair power includes both conjugates.
- **SQ03-065** `SOURCE_REQUIRED` — Arbitrary complex signal class is rejected.
- **SQ03-066** `SOURCE_REQUIRED` — Band values must be finite.
- **SQ03-067** `SOURCE_REQUIRED` — Minimum radius is non-negative.
- **SQ03-068** `SOURCE_REQUIRED` — Maximum radius exceeds minimum radius.
- **SQ03-069** `SOURCE_REQUIRED` — Empty candidate band fails closed.
- **SQ03-070** `SOURCE_REQUIRED` — Peak tie-break policy is fixed.
- **SQ03-071** `SOURCE_REQUIRED` — Orientation meaning is feature tangent.
- **SQ03-072** `SOURCE_REQUIRED` — Phase anchor is window center.
## Power pass

- **SQ03-073** `SOURCE_REQUIRED` — Power normalization uses N squared.
- **SQ03-074** `SOURCE_REQUIRED` — One invocation owns one bin.
- **SQ03-075** `SOURCE_REQUIRED` — Input buffer is read-only.
- **SQ03-076** `SOURCE_REQUIRED` — Power output length is exact.
- **SQ03-077** `SOURCE_REQUIRED` — Power output preserves natural order.
- **SQ03-078** `SOURCE_REQUIRED` — DC remains in power output.
- **SQ03-079** `SOURCE_REQUIRED` — No square root occurs in power pass.
- **SQ03-080** `SOURCE_REQUIRED` — No logarithm occurs in power pass.
- **SQ03-081** `SOURCE_REQUIRED` — Non-finite coefficient sets failure evidence.
- **SQ03-082** `SOURCE_REQUIRED` — Finite negative power is impossible before clamp.
- **SQ03-083** `SOURCE_REQUIRED` — Power normalization ID is recorded.
- **SQ03-084** `SOURCE_REQUIRED` — Window gain is metadata not hidden scaling.
- **SQ03-085** `SOURCE_REQUIRED` — Power buffer usage excludes MAP_READ.
- **SQ03-086** `SOURCE_REQUIRED` — Power pipeline is Authority-owned.
- **SQ03-087** `SOURCE_REQUIRED` — Power shader digest is admitted.
- **SQ03-088** `SOURCE_REQUIRED` — Power dispatch dimensions are bounded.
- **SQ03-089** `SOURCE_REQUIRED` — Power output chunk offsets are exact.
- **SQ03-090** `SOURCE_REQUIRED` — Power buffer is final Authority candidate.
- **SQ03-091** `SOURCE_REQUIRED` — Input frequency resource is not mutated.
- **SQ03-092** `SOURCE_REQUIRED` — Power source contract test passes.
## Partial and recursive reduction

- **SQ03-093** `SOURCE_REQUIRED` — Partial record ABI is versioned.
- **SQ03-094** `SOURCE_REQUIRED` — Partial record alignment is explicit.
- **SQ03-095** `SOURCE_REQUIRED` — Band power is accumulated.
- **SQ03-096** `SOURCE_REQUIRED` — P log P is accumulated.
- **SQ03-097** `SOURCE_REQUIRED` — Axial cosine moment is accumulated.
- **SQ03-098** `SOURCE_REQUIRED` — Axial sine moment is accumulated.
- **SQ03-099** `SOURCE_REQUIRED` — Peak power is retained.
- **SQ03-100** `SOURCE_REQUIRED` — Peak index is retained.
- **SQ03-101** `SOURCE_REQUIRED` — Second power is retained.
- **SQ03-102** `SOURCE_REQUIRED` — Second index is retained.
- **SQ03-103** `SOURCE_REQUIRED` — Candidate count is retained.
- **SQ03-104** `SOURCE_REQUIRED` — Failure mask is retained.
- **SQ03-105** `SOURCE_REQUIRED` — One workgroup owns one partial record.
- **SQ03-106** `SOURCE_REQUIRED` — Workgroup barrier is uniform.
- **SQ03-107** `SOURCE_REQUIRED` — No early return occurs before barrier.
- **SQ03-108** `SOURCE_REQUIRED` — Invalid lanes contribute neutral records.
- **SQ03-109** `SOURCE_REQUIRED` — Shared reduction order is deterministic.
- **SQ03-110** `SOURCE_REQUIRED` — Float atomics are absent.
- **SQ03-111** `SOURCE_REQUIRED` — Top-2 merge preserves distinct indices.
- **SQ03-112** `SOURCE_REQUIRED` — Top-2 tie-break uses lower natural index.
- **SQ03-113** `SOURCE_REQUIRED` — Recursive merge uses ping-pong buffers.
- **SQ03-114** `SOURCE_REQUIRED` — Recursive level count is deterministic.
- **SQ03-115** `SOURCE_REQUIRED` — Final partial count is one per window.
- **SQ03-116** `SOURCE_REQUIRED` — Chunk boundaries preserve window order.
- **SQ03-117** `SOURCE_REQUIRED` — Partial buffers are job-arena owned.
- **SQ03-118** `SOURCE_REQUIRED` — Merge shader digest is admitted.
- **SQ03-119** `SOURCE_REQUIRED` — Reduction dispatch limits are checked.
- **SQ03-120** `SOURCE_REQUIRED` — Partial reduction source contract passes.
## Entropy, peak, orientation, phase

- **SQ03-121** `SOURCE_REQUIRED` — Entropy uses independent pair distribution.
- **SQ03-122** `SOURCE_REQUIRED` — Entropy normalization uses log candidate count.
- **SQ03-123** `SOURCE_REQUIRED` — Zero-power terms contribute zero.
- **SQ03-124** `SOURCE_REQUIRED` — Entropy validity requires at least two candidates.
- **SQ03-125** `SOURCE_REQUIRED` — Entropy invalid neutral is exact.
- **SQ03-126** `SOURCE_REQUIRED` — Peak share formula is exact.
- **SQ03-127** `SOURCE_REQUIRED` — Dominance formula is exact.
- **SQ03-128** `SOURCE_REQUIRED` — Feature orientation is perpendicular to wave vector.
- **SQ03-129** `SOURCE_REQUIRED` — Double-angle orientation formula is exact.
- **SQ03-130** `SOURCE_REQUIRED` — Orientation neutral is one zero.
- **SQ03-131** `SOURCE_REQUIRED` — Angular coherence formula is exact.
- **SQ03-132** `SOURCE_REQUIRED` — Confidence is conservative minimum.
- **SQ03-133** `SOURCE_REQUIRED` — Peak coefficient comes from frequency buffer.
- **SQ03-134** `SOURCE_REQUIRED` — Center coordinate is size-minus-one over two.
- **SQ03-135** `SOURCE_REQUIRED` — Center phase correction sign is fixed.
- **SQ03-136** `SOURCE_REQUIRED` — Phase output uses cosine and sine.
- **SQ03-137** `SOURCE_REQUIRED` — Phase magnitude uses square root pair power.
- **SQ03-138** `SOURCE_REQUIRED` — Phase validity excludes self-conjugate bins.
- **SQ03-139** `SOURCE_REQUIRED` — Invalid phase neutral is one zero zero zero.
- **SQ03-140** `SOURCE_REQUIRED` — Finalize shader source contract passes.
## Atomic field-set publication

- **SQ03-141** `SOURCE_REQUIRED` — publishFieldSet exists.
- **SQ03-142** `SOURCE_REQUIRED` — publishField delegates to field-set API.
- **SQ03-143** `SOURCE_REQUIRED` — Field-set preflight validates exact semantic set.
- **SQ03-144** `SOURCE_REQUIRED` — Duplicate semantics are rejected.
- **SQ03-145** `SOURCE_REQUIRED` — Missing outputs are rejected.
- **SQ03-146** `SOURCE_REQUIRED` — Unexpected outputs are rejected.
- **SQ03-147** `SOURCE_REQUIRED` — All dimensions are validated before mutation.
- **SQ03-148** `SOURCE_REQUIRED` — All metadata is validated before mutation.
- **SQ03-149** `SOURCE_REQUIRED` — All resources use current device epoch.
- **SQ03-150** `SOURCE_REQUIRED` — Generation counters are reserved atomically.
- **SQ03-151** `SOURCE_REQUIRED` — One receipt contains all output handles.
- **SQ03-152** `SOURCE_REQUIRED` — Output handles are canonically sorted.
- **SQ03-153** `SOURCE_REQUIRED` — One receipt digest is shared by all outputs.
- **SQ03-154** `SOURCE_REQUIRED` — Field-set digest is included.
- **SQ03-155** `SOURCE_REQUIRED` — Semantic metadata digest is included.
- **SQ03-156** `SOURCE_REQUIRED` — No generation advances on preflight failure.
- **SQ03-157** `SOURCE_REQUIRED` — No field remains on transaction failure.
- **SQ03-158** `SOURCE_REQUIRED` — Producer publication count increments once.
- **SQ03-159** `SOURCE_REQUIRED` — Producer claim level changes once.
- **SQ03-160** `SOURCE_REQUIRED` — All resources transfer together.
- **SQ03-161** `SOURCE_REQUIRED` — Failure cleanup destroys candidate outputs.
- **SQ03-162** `SOURCE_REQUIRED` — Partial field bundle is impossible.
- **SQ03-163** `SOURCE_REQUIRED` — Authority source contract test passes.
- **SQ03-164** `SOURCE_REQUIRED` — Atomic publication mock test passes.
## Lifecycle and zero-readback

- **SQ03-165** `SOURCE_REQUIRED` — Input field is pinned through completion.
- **SQ03-166** `SOURCE_REQUIRED` — Input resource is never destroyed by SQ03.
- **SQ03-167** `SOURCE_REQUIRED` — Scratch resources use a job arena.
- **SQ03-168** `SOURCE_REQUIRED` — Final buffers remain provisional before fence.
- **SQ03-169** `SOURCE_REQUIRED` — Fence is required before publication.
- **SQ03-170** `SOURCE_REQUIRED` — Cancellation before allocation is handled.
- **SQ03-171** `SOURCE_REQUIRED` — Cancellation before submit is handled.
- **SQ03-172** `SOURCE_REQUIRED` — Cancellation after fence is handled.
- **SQ03-173** `SOURCE_REQUIRED` — Cancelled jobs publish no field.
- **SQ03-174** `SOURCE_REQUIRED` — Device-loss invalidates pipeline bundle.
- **SQ03-175** `SOURCE_REQUIRED` — Stale epoch publication is rejected.
- **SQ03-176** `SOURCE_REQUIRED` — MAP_READ is absent from product buffers.
- **SQ03-177** `SOURCE_REQUIRED` — mapAsync is absent from product path.
- **SQ03-178** `SOURCE_REQUIRED` — WebGL readPixels is absent.
- **SQ03-179** `SOURCE_REQUIRED` — Canvas getImageData is absent.
- **SQ03-180** `SOURCE_REQUIRED` — Intermediate readback receipt count is zero.
## Facade, graph, and source validation

- **SQ03-181** `SOURCE_REQUIRED` — reduceSpectralFields facade exists.
- **SQ03-182** `SOURCE_REQUIRED` — QmapFFTBuilder buildSpectralFields exists.
- **SQ03-183** `SOURCE_REQUIRED` — Legacy synchronous build remains fail-closed.
- **SQ03-184** `SOURCE_REQUIRED` — CPU grayscale arrays are rejected.
- **SQ03-185** `SOURCE_REQUIRED` — CPU complex arrays are rejected.
- **SQ03-186** `SOURCE_REQUIRED` — heatmap CPU conversion remains forbidden.
- **SQ03-187** `SOURCE_REQUIRED` — Peak worker cannot run CPU reduction.
- **SQ03-188** `SOURCE_REQUIRED` — Stable errors are registered.
- **SQ03-189** `SOURCE_REQUIRED` — Runtime service token is registered.
- **SQ03-190** `SOURCE_REQUIRED` — Runtime module order is deterministic.
- **SQ03-191** `SOURCE_REQUIRED` — Producer inventory is regenerated.
- **SQ03-192** `SOURCE_REQUIRED` — Semantic registry is regenerated.
- **SQ03-193** `SOURCE_REQUIRED` — Runtime asset manifest is regenerated.
- **SQ03-194** `SOURCE_REQUIRED` — Active Graph is regenerated.
- **SQ03-195** `SOURCE_REQUIRED` — TypeScript syntax gate passes.
- **SQ03-196** `SOURCE_REQUIRED` — Source and mock gate reports are sealed.
## Physical GPU and packaged evidence

- **SQ03-197** `DEFERRED_PHYSICAL` — All WGSL modules compile on physical WebGPU.
- **SQ03-198** `DEFERRED_PHYSICAL` — Bind groups validate on physical WebGPU.
- **SQ03-199** `DEFERRED_PHYSICAL` — Product power matches GPU reference.
- **SQ03-200** `DEFERRED_PHYSICAL` — Product entropy matches GPU reference.
- **SQ03-201** `DEFERRED_PHYSICAL` — Product orientation matches GPU reference.
- **SQ03-202** `DEFERRED_PHYSICAL` — Product phase matches GPU reference.
- **SQ03-203** `DEFERRED_PHYSICAL` — Hermitian residual validation passes.
- **SQ03-204** `DEFERRED_PHYSICAL` — Atomic five-field publication executes physically.
- **SQ03-205** `DEFERRED_PHYSICAL` — Physical zero intermediate readback is observed.
- **SQ03-206** `DEFERRED_PHYSICAL` — Device-loss cancellation is verified.
- **SQ03-207** `DEFERRED_PHYSICAL` — GPU memory plateau is verified.
- **SQ03-208** `DEFERRED_PHYSICAL` — Windows packaged Electron execution is verified.
## Regression and artifact seal

- **SQ03-209** `SOURCE_REQUIRED` — Truth-00 regression passes.
- **SQ03-210** `SOURCE_REQUIRED` — SQ02 regression passes.
- **SQ03-211** `SOURCE_REQUIRED` — R1A through R2 regressions pass.
- **SQ03-212** `SOURCE_REQUIRED` — Surface and Preview regressions pass.
- **SQ03-213** `SOURCE_REQUIRED` — Export and codec regressions pass.
- **SQ03-214** `SOURCE_REQUIRED` — Production Pointer mutation is zero.
- **SQ03-215** `SOURCE_REQUIRED` — Independent ZIP extraction reproduces source seal.
- **SQ03-216** `SOURCE_REQUIRED` — Final source receipt is sealed.

# 28. Gate Result Semantics

- `PASS` means the source, static contract, deterministic mock, or predecessor regression evidence exists and matches this specification.
- `DEFERRED` is permitted only for `SQ03-197` through `SQ03-208`, which require physical WebGPU or Windows Packaged Electron execution.
- `FAIL` in any gate blocks the source-baked state.
- A missing gate ID, duplicate gate ID, or reordered gate identity is a failure.
- A physical gate shall not be converted to PASS using CPU emulation, source inspection, or mock output.


# 29. Required Bake Artifacts

A source bake shall emit:

```text
README_TDT_SPECTRAL_QMAP_03_APPLIED.md
specs/TDT-SPECTRAL-QMAP-03_..._SPEC.md
patches/TDT_SPECTRAL_QMAP_03_...diff
patches/TDT_SPECTRAL_QMAP_03_CHANGED_FILE_MANIFEST.json
artifacts/spectral-qmap-03/source-bake/TDT_SPECTRAL_QMAP_03_SOURCE_GATE.json
artifacts/spectral-qmap-03/source-bake/TDT_SPECTRAL_QMAP_03_SOURCE_RECEIPT.json
artifacts/spectral-qmap-03/source-bake/TDT_SPECTRAL_QMAP_03_REGRESSION_SUMMARY.json
artifacts/spectral-qmap-03/source-bake/sq03-source-contract.json
artifacts/spectral-qmap-03/source-bake/sq03-runtime-smoke.json
artifacts/spectral-qmap-03/source-bake/sq03-wgsl-contract.json
```

The final ZIP shall be deterministic and independently extractable.

Its source seal shall reproduce after the independent verification gate suite.


# 30. Final Acceptance Contract

`TDT-SPECTRAL-QMAP-03` is source-baked only when:

- the SQ02 frequency field is consumed without host readback,
- the layout receipt is exact and immutable,
- normalized power is generated on the GPU,
- entropy and top-2 peak reduction are deterministic,
- feature orientation and complex phase have unambiguous semantics,
- all five output fields publish atomically under one receipt,
- cancellation and device loss cannot publish partial fields,
- CPU, WebGL, and Canvas reduction paths remain forbidden,
- legacy APIs fail closed rather than returning fake arrays,
- all mandatory source gates pass,
- all physical gates remain honestly deferred until executed,
- Production Pointer remains unchanged.

The completion of this patch authorizes the next spectral consumers to depend on canonical spectral fields. It does not itself authorize Hannakairo, Q-wave, Atlas, or R1D policy fusion promotion.
