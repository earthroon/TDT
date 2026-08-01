# TDT-SPECTRAL-QMAP-02

## Batched Stockham 2D WebGPU FFT / Single-Writer Butterfly / Transpose / Zero Intermediate Readback Seal

- **Patch ID:** `TDT-SPECTRAL-QMAP-02`
- **Roadmap position:** `02`
- **Parent:** `TDT-ANALYSIS-FIELD-TRUTH-00`
- **Parent ZIP:** `55_TDT_ANALYSIS_FIELD_TRUTH_00_CANONICAL_GPU_ANALYSIS_FIELD_AUTHORITY_SEMANTIC_IDENTITY_EFFECTIVE_EXECUTION_ZERO_CPU_COMPUTE_LEGACY_MIGRATION_SOURCE_BAKED_AWAITING_PACKAGED_GPU.zip`
- **Parent ZIP SHA-256:** `48e544322f0d7a4aed7290deedca75bbada9780dea23e656b4e3f809511a17d2`
- **Parent source seal:** `465f4ab940f426a581983e4f3ea53d230ead99d5cf907bc3b4e5c4cc548f9128`
- **Predecessor source state:** `ANALYSIS_FIELD_TRUTH_00_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target source state:** `SPECTRAL_QMAP_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target verified state:** `SPECTRAL_QMAP_02_VERIFIED_UNPROMOTED`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Primary execution backend:** WebGPU
- **Kernel language:** WGSL
- **Canonical algorithm:** radix-2 out-of-place Stockham autosort FFT
- **Canonical dimensionality:** batched 2D complex forward FFT
- **Product input:** GPU-resident spatial-complex window batch
- **Product output:** GPU-resident frequency-complex window batch
- **CPU pixel or spectral compute:** forbidden
- **WebGL spectral compute:** forbidden
- **Intermediate pixel or spectrum readback:** forbidden
- **JavaScript/TypeScript role:** deterministic planning, ABI packing, resource ownership, command encoding, receipts, cancellation, error propagation
- **Status at specification issue:** `SPEC_DEFINED_UNBAKED`

---

# 0. Executive Contract

`TDT-SPECTRAL-QMAP-02` replaces the unverified FFT execution core behind the existing spectral compatibility surfaces with a canonical, batched, same-device WebGPU implementation.

The target execution graph is:

```text
GPU-resident spatial-complex window batch
        │
        ▼
row Stockham FFT, W-point, B×H transforms
        │
        ▼
complex tiled transpose, W×H → H×W
        │
        ▼
column Stockham FFT, H-point, B×W transforms
        │
        ▼
complex tiled transpose, H×W → W×H
        │
        ▼
GPU-resident natural-order frequency-complex batch
        │
        ▼
Analysis Field Authority publication
```

The source-baked state shall prove that:

1. every radix-2 butterfly has one and only one invocation owner,
2. every output complex element has one writer per stage,
3. row and column transforms are executed as batches rather than one window at a time,
4. the transpose is out-of-place, uniformly synchronized, and boundary-safe,
5. no FFT stage maps or reads intermediate spectrum data to the host,
6. no CPU array is accepted as a product FFT input,
7. the final frequency batch remains GPU-resident and is published through the Analysis Field Authority,
8. all scratch resources are tied to one device epoch and disposed exactly,
9. the existing public facade names remain callable without silently returning a fake Q-map,
10. downstream spectral reductions remain explicitly outside this patch.

This patch shall not claim that spectral entropy, peak orientation, power reduction, overlap reconstruction, Hannakairo, Q-wave fusion, or persistent tile residency are complete.

Those remain follow-up producers or consumers.
---

# 1. Parent Truth and Exact Source Baseline

## 1.1 Parent Authority

The parent provides a canonical Analysis Field Authority with:

- semantic registration,
- producer and consumer registration,
- build leases,
- submission records,
- completion-fence state,
- same-source and same-device publication,
- field pinning and disposal,
- device-loss invalidation,
- effective-execution receipts,
- zero-CPU and zero-intermediate-readback claims.

The parent Authority source digest is:

```text
2d5d88e70781035efd4486893dedc5f5de7fe0002d5ec7d053895edeb84dbc82
```

`TDT-SPECTRAL-QMAP-02` shall extend this Authority. It shall not create another analysis registry, another device owner, or another receipt ledger.

## 1.2 Current FFT prototype

The migration source is:

```text
app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js
SHA-256: 58f169a81b4f80aa9efcfdee483bc5b862956aa4d27c4e3c55fd3bc760545f8b
```

The source contains substantial FFT-related code, but its present execution cannot receive a canonical claim because it includes:

- `N` invocations for `N/2` butterflies,
- overlapping output writers,
- CPU window extraction,
- host uploads for each window,
- intermediate `mapAsync()` calls,
- host readback of FFT output,
- host re-upload before power computation,
- CPU tensor normalization,
- CPU final `K = I × M²` fusion,
- storage buffers carrying `MAP_READ`,
- per-window command submission,
- per-window resource creation without a closed job arena,
- invalid WGSL helper placement in the tensor prototype,
- no Analysis Field publication.

This file shall become a compatibility adapter and migration facade.

Its current internal kernels shall not remain product authority.

## 1.3 Parent generated truth

```text
Producer inventory SHA-256: 170d0ca22f786291f31c9b890a27a2d623d620ff7cc39105593f1fe2fcbd37b8
Semantic registry SHA-256:  5d9b9a4775a51cdbbac48ab3254f6494595105cbb70853a7e5a14a158b049922
GPU Authority SHA-256:      bb12af97e2fb8390ff847396e09edde60570c3e224f3430010244a75b3dbeb4e
Active Graph SHA-256:        7831a5eb61ba4e82c75e1551bf240feb9ca2644963f8ebf2fb62750c24b3c85a
```

The parent producer identity is presently:

```text
producerId:       tdt.analysis.producer.spectral.fft
producerVersion:  0.0.0
implementationId: tdt-spectral-fft-unpromoted
productAdmission: future
```

This patch shall migrate it to a source-admitted canonical producer only after all mandatory source gates pass.

## 1.4 Roadmap dependency closure

The roadmap item commonly labelled `TDT-SPECTRAL-QMAP-01` would normally provide source-surface extraction, deterministic window planning, Hann multiplication, boundary policy, and spatial-complex batch publication.

That patch is not assumed to be baked.

Therefore this specification defines a strict dependency boundary:

- `02` accepts only a GPU-resident spatial-complex batch field,
- `02` does not extract pixels from the source surface,
- `02` does not apply a Hann window,
- `02` does not zero-pad source pixels,
- `02` does not plan overlap positions,
- fixture-only GPU generators may create test input fields,
- product execution remains unavailable until an admitted upstream producer publishes the required input semantic.

Missing upstream input shall fail with `E_SPECTRAL_INPUT_FIELD_REQUIRED`.

It shall never trigger CPU extraction or legacy CPU FFT.
---

# 2. Goals

1. Implement a valid radix-2 Stockham autosort stage in WGSL.
2. Guarantee single-owner butterflies.
3. Batch all transforms in a window batch.
4. Implement a complex-valued tiled transpose.
5. Execute row FFT, transpose, column FFT, and transpose-back without host intervention.
6. Publish a natural-order frequency-domain complex batch.
7. Integrate the producer with Truth-00 Authority receipts.
8. Preserve legacy facade names while removing false-success behavior.
9. Support deterministic resource-limit chunking.
10. Provide independent GPU validation kernels.
11. Keep all product pixel and spectral values on the GPU.
12. Preserve all R1A through R2 and Truth-00 regressions.

# 3. Non-Goals

This patch shall not implement:

- source image window extraction,
- Hann, Blackman, Kaiser, or other window functions,
- non-power-of-two FFT,
- mixed radix,
- Bluestein or Rader transforms,
- real-to-complex packing optimization,
- spectral power or entropy publication,
- dominant-frequency or peak-orientation reduction,
- overlap-add reconstruction,
- Q-map normalization,
- R1D policy fusion,
- Hannakairo phase or topology,
- analytic Q-wave,
- persistent GPU tile Atlas,
- CPU reference execution in the product runtime,
- absolute performance promotion.

The executor may include an inverse transform and direct-DFT validation profile solely for physical correctness evidence. Those profiles shall not become product consumers or outputs.
---

# 4. Ownership and SSOT

## 4.1 Device ownership

All resources shall use the current GPU Device Authority device and queue.

The spectral executor shall acquire only the admitted consumer lease:

```text
dadum.gpu.consumer.fft-qmap
```

Direct calls to `navigator.gpu.requestAdapter()` or `adapter.requestDevice()` are forbidden.

## 4.2 Field ownership

The Analysis Field Authority owns:

- producer admission,
- source identity,
- device epoch identity,
- output field generation,
- publication claim level,
- consumer acquisition,
- pinning,
- disposal,
- invalidation,
- receipt identity.

The spectral executor owns only its active job arena until publication.

After publication, the final frequency buffer is transferred to the Analysis Field Authority.

## 4.3 Scratch ownership

Each active FFT chunk owns:

```text
complexPing
complexPong
transposePing
transposePong
fftStageUniform
transposeUniform
optionalValidationCounters
```

No scratch buffer is global mutable state.

Pipeline objects may be cached per device epoch. Buffers may not survive a device epoch unless the GPU Authority explicitly recreates them.
---

# 5. Semantic Registry Amendment

The parent descriptor `tdt.analysis.spectral.window-complex.v1` is ambiguous because it does not distinguish a spatial window batch from a transformed frequency batch.

This patch shall add two canonical descriptors.

## 5.1 Spatial-complex input

```text
semanticId:      tdt.analysis.spectral.window-spatial-complex.v1
domain:          spatial
periodicity:     two-pi
coordinateSpace: atlas-local
resourceKind:    storage-buffer
format:          complex-f32-interleaved
channels:        real, imaginary
interpolation:   forbidden
mipPolicy:       none
```

## 5.2 Frequency-complex output

```text
semanticId:      tdt.analysis.spectral.window-frequency-complex.v1
domain:          spectral
periodicity:     two-pi
coordinateSpace: frequency-bin
resourceKind:    storage-buffer
format:          complex-f32-interleaved
channels:        real, imaginary
interpolation:   forbidden
mipPolicy:       none
```

## 5.3 Compatibility alias

The existing semantic:

```text
tdt.analysis.spectral.window-complex.v1
```

shall remain registered only as a compatibility alias.

It shall not be accepted for canonical publication because its coordinate interpretation is ambiguous.

A compatibility adapter may map it only when explicit metadata proves whether the payload is spatial or frequency-domain.

No inference from producer name, file name, or buffer contents is permitted.

## 5.4 Registry version

The registry version shall advance deterministically to:

```text
tdt.analysis.semantic-registry.spectral02.v2
```

All descriptor digests and the registry digest shall be regenerated.
---

# 6. Producer Identity

The canonical producer descriptor shall become:

```text
producerId:       tdt.analysis.producer.spectral.fft
producerVersion:  2.0.0
implementationId: tdt-spectral-stockham-2d-webgpu-v1
executionBackend: webgpu
kernelLanguage:   wgsl
productAdmission: canonical
```

Accepted input semantic:

```text
tdt.analysis.spectral.window-spatial-complex.v1
```

Canonical output semantic:

```text
tdt.analysis.spectral.window-frequency-complex.v1
```

The producer shall not publish power, entropy, summary, phase-summary, or peak-orientation fields in this patch.

Attempting to request those outputs shall fail with:

```text
E_SPECTRAL_REDUCTION_NOT_AVAILABLE
```
---

# 7. Canonical Public API

## 7.1 New executor API

```ts
interface ExecuteSpectralFft2DRequest {
  inputField: AnalysisFieldHandle;
  width: number;
  height: number;
  windowCount: number;
  direction: 'forward';
  normalization: 'none';
  jobId: string;
  cancellationEpoch: number;
  producerRequestSequence: number;
  signal?: AbortSignal;
}

interface ExecuteSpectralFft2DResult {
  outputField: AnalysisFieldHandle;
  planDigest: string;
  executionReceiptId: string;
  executionReceiptDigest: string;
}

executeBatchedStockham2D(
  request: ExecuteSpectralFft2DRequest
): Promise<ExecuteSpectralFft2DResult>
```

## 7.2 Internal validation API

```ts
executeBatchedStockham2DValidation(...)
executeDirectDftGpuReference(...)
compareComplexGpuFields(...)
```

These APIs shall be unavailable to normal product call sites.

## 7.3 Existing facade preservation

The following names shall remain exported where they currently exist:

```text
initWebGPU
computeQMap_GPU_All
buildFFTMagnitudeTexture
QmapFFTBuilder
```

Their behavior shall be corrected as follows:

- `initWebGPU()` continues to acquire the GPU Authority lease.
- `computeQMap_GPU_All()` shall not accept a CPU grayscale array in product mode.
- `computeQMap_GPU_All()` shall not claim to return `K`, `I`, and `M` until the reduction and fusion patches exist.
- product calls requesting a complete Q-map shall fail with `E_SPECTRAL_REDUCTION_NOT_AVAILABLE`.
- diagnostic CPU behavior remains explicitly labelled and outside product admission.
- no facade may return `null` texture plus plausible statistics as success.
---

# 8. Canonical Batch Resource Layout

## 8.1 Complex element

One complex value occupies exactly eight bytes:

```wgsl
struct Complex32 {
  re: f32,
  im: f32,
}
```

The canonical storage representation is equivalent to:

```wgsl
array<vec2<f32>>
```

Separate real and imaginary buffers are not the canonical product layout.

## 8.2 Linear indexing

For a batch with `B` windows of dimensions `W × H`:

```text
index(batch, y, x) = ((batch × H + y) × W + x)
byteOffset = index × 8
```

The input and final output use the same natural row-major layout.

## 8.3 Publication dimensions

The Analysis Field publication shall record:

```text
resourceKind: storage-buffer
width:        W
height:       H
layers:       B
format:       complex-f32-interleaved
```

`layers` represents the window count. It shall not be used as a texture-array claim.

## 8.4 Size arithmetic

All element and byte counts shall use checked integer arithmetic.

The planner shall reject:

- zero dimensions,
- zero window count,
- multiplication overflow,
- a resource larger than `maxBufferSize`,
- a binding larger than `maxStorageBufferBindingSize`,
- a dispatch larger than `maxComputeWorkgroupsPerDimension`.
---

# 9. Supported Transform Domain

Canonical transforms shall satisfy:

```text
W and H are powers of two
8 ≤ W ≤ 256
8 ≤ H ≤ 256
B ≥ 1
```

`W` and `H` may differ.

The current default Q-map window `64 × 64` is therefore supported.

Non-power-of-two transforms shall fail with:

```text
E_SPECTRAL_NON_POWER_OF_TWO
```

Sizes outside the admitted range shall fail with:

```text
E_SPECTRAL_SIZE_UNSUPPORTED
```

No hidden zero padding is allowed in this patch.

If an upstream producer requires padding, the padded dimensions and padding policy must already be part of the input field receipt.
---

# 10. Deterministic Stockham Plan

The plan identity shall be:

```text
tdt.spectral.stockham-plan.v1
```

A plan contains:

```ts
interface Stockham2DPlan {
  planId: 'tdt.spectral.stockham-plan.v1';
  width: number;
  height: number;
  windowCount: number;
  rowStageCount: number;
  columnStageCount: number;
  rowTransformCount: number;
  columnTransformCount: number;
  batchChunks: readonly StockhamBatchChunk[];
  forwardSign: -1;
  normalizationScale: 1;
  finalLayout: 'natural-row-major-frequency';
  planDigest: string;
}
```

The planner shall use integer bit operations and checked arithmetic.

It shall not use:

- random values,
- wall-clock timing,
- previous-frame performance,
- adapter vendor names,
- user-agent strings,
- image content,
- dynamic autotuning.

The same dimensions and device limits shall produce the same plan digest.
---

# 11. Radix-2 Stockham Single-Writer Butterfly

## 11.1 Stage indexing

For one transform of length `N`, stage numbers are zero-based:

```text
stage = 0 .. log2(N)-1
```

For the DIT Stockham mapping, define:

```text
stageFromEnd = log2(N) - stage
Nhalf        = N / 2^stageFromEnd
stride       = 2^(stageFromEnd - 1)
```

Each butterfly invocation owns one `(p, q)` pair where:

```text
p = butterfly / stride
q = butterfly % stride

idx0Input  = q + stride × (2p)
idx1Input  = q + stride × (2p + 1)
idx0Output = q + stride × p
idx1Output = q + stride × (p + Nhalf)
```

The twiddle index is `p` and the denominator is `2 × Nhalf`:

```text
angle = -2π × p / (2 × Nhalf)
```

The invocation writes:

```text
out[idx0Output] = a + twiddle × b
out[idx1Output] = a - twiddle × b
```

This addressing contract shall be frozen in source tests.

## 11.2 Invocation ownership

Exactly `N/2` butterfly invocations are dispatched for each transform.

One invocation owns both output elements of its butterfly.

No other invocation may write those output indices during that stage.

The current prototype pattern that dispatches `N` invocations shall be rejected by source and validation gates.

## 11.3 Batch indexing

The transform index is derived from `global_invocation_id.y` and the deterministic chunk offset.

```text
baseElement = (chunkTransformBase + transformIndex) × N
```

Each transform is independent.

No workgroup barrier is required between different transforms or between Stockham stages because every stage is a separate compute dispatch and ping-pong buffer binding.

## 11.4 Natural ordering

After the final stage, output bins shall be in natural order:

```text
0, 1, 2, ..., N-1
```

No CPU bit reversal and no additional GPU bit-reversal pass are permitted.
---

# 12. FFT Stage Uniform ABI

The FFT stage uniform shall occupy exactly 64 bytes.

```wgsl
struct FftStageParams {
  transformLength:     u32,  //  0
  log2Length:          u32,  //  4
  stageIndex:          u32,  //  8
  transformCount:      u32,  // 12
  transformBase:       u32,  // 16
  sourceBaseElement:   u32,  // 20
  destinationBaseElement:u32,// 24
  elementsPerTransform:u32,  // 28
  directionSign:       f32,  // 32
  normalizationScale:  f32,  // 36
  flags:               u32,  // 40
  abiVersion:          u32,  // 44
  reserved0:           u32,  // 48
  reserved1:           u32,  // 52
  reserved2:           u32,  // 56
  reserved3:           u32,  // 60
}
```

ABI version:

```text
tdt.spectral.fft-stage-params.v1
```

Product forward transforms use:

```text
directionSign      = -1.0
normalizationScale = 1.0
```

Uniform writes are orchestration metadata and do not count as pixel uploads.
---

# 13. Ping-Pong Stage Execution

Each axis uses two buffers.

```text
stage 0: A → B
stage 1: B → A
stage 2: A → B
...
```

The planner records the final slot from the parity of the stage count.

The executor shall not copy the result merely to force a preferred slot.

The next pass binds whichever slot the plan identifies as final.

A stage may not bind the same buffer range as both source and destination.

Overlapping read and write aliases shall fail source validation.
---

# 14. Two-Dimensional Execution

For each batch chunk:

## 14.1 Row transform

```text
transform length: W
transform count:  chunkWindowCount × H
```

Rows from every window are transformed in one dispatch per Stockham stage.

## 14.2 First transpose

Each window layer is transposed independently:

```text
W × H → H × W
```

## 14.3 Column transform

After transpose, original columns are contiguous rows:

```text
transform length: H
transform count:  chunkWindowCount × W
```

## 14.4 Transpose back

The final complex batch is returned to:

```text
W × H natural row-major frequency layout
```

The final output has one layer per original window.

## 14.5 Submission policy

All row stages, first transpose, column stages, and transpose-back for one chunk shall be encoded before submission.

The default policy is one queue submission per batch chunk.

Per-window submission is forbidden.
---

# 15. Tiled Complex Transpose

## 15.1 Product kernel

The product transpose uses:

```text
workgroup size: 16 × 16 × 1
shared tile:    16 × 17 complex values
```

The padded shared stride prevents a square shared-memory access pattern from using identical row and column strides.

This is a static layout, not an adapter-vendor autotune.

## 15.2 Uniform barrier

Every invocation shall:

1. compute source coordinates,
2. write either the valid complex value or neutral zero into shared storage,
3. execute one unconditional `workgroupBarrier()`,
4. compute transposed destination coordinates,
5. write only when the destination coordinate is valid.

No invocation may return before the barrier.

The barrier may not be placed inside a divergent condition.

## 15.3 Out-of-place requirement

Source and destination transpose buffers shall be different resources.

In-place tiled transpose is outside scope.

## 15.4 Exactness

Transpose performs no arithmetic on the complex value.

A transpose followed by transpose-back shall reproduce every `f32` bit exactly.
---

# 16. Transpose Uniform ABI

The transpose uniform shall occupy exactly 64 bytes.

```wgsl
struct ComplexTransposeParams {
  sourceWidth:        u32, //  0
  sourceHeight:       u32, //  4
  layerCount:         u32, //  8
  layerBase:          u32, // 12
  sourceRowStride:    u32, // 16
  destinationRowStride:u32,// 20
  sourceLayerStride:  u32, // 24
  destinationLayerStride:u32,//28
  flags:              u32, // 32
  abiVersion:         u32, // 36
  reserved0:          u32, // 40
  reserved1:          u32, // 44
  reserved2:          u32, // 48
  reserved3:          u32, // 52
  reserved4:          u32, // 56
  reserved5:          u32, // 60
}
```

ABI version:

```text
tdt.spectral.complex-transpose-params.v1
```
---

# 17. Deterministic Batch Chunking

The planner shall compute the maximum admitted windows per chunk from:

```text
maxBufferSize
maxStorageBufferBindingSize
maxComputeWorkgroupsPerDimension
W
H
bytesPerComplex = 8
scratchBufferCount
```

The chunk count shall be the minimum integer count that satisfies all limits.

Chunks shall preserve source layer order.

```text
chunk 0 contains layers 0 .. k-1
chunk 1 contains layers k .. 2k-1
...
```

No chunk is selected from timing measurements.

If one window cannot fit, execution fails with `E_SPECTRAL_BUFFER_LIMIT`.

The final published field may be:

- one contiguous output buffer when the full output fits one binding, or
- a canonical segmented-buffer resource descriptor when the Authority type is extended explicitly.

The first source bake should prefer one contiguous final buffer and chunk only scratch dispatch ranges.
---

# 18. Pipeline and Shader Identities

Required product shader assets:

```text
dadum.asset.shader.spectral-stockham-radix2-stage-v1
dadum.asset.shader.spectral-complex-transpose-16x16-v1
```

Required validation assets:

```text
dadum.asset.shader.spectral-direct-dft-reference-v1
dadum.asset.shader.spectral-complex-compare-v1
dadum.asset.shader.spectral-writer-ownership-validation-v1
dadum.asset.shader.spectral-fixture-generator-v1
```

Required pipeline identities:

```text
tdt.spectral.pipeline.stockham-radix2-stage.v1
tdt.spectral.pipeline.complex-transpose-16x16.v1
tdt.spectral.pipeline.direct-dft-reference.v1
tdt.spectral.pipeline.complex-compare.v1
tdt.spectral.pipeline.writer-ownership-validation.v1
tdt.spectral.pipeline.fixture-generator.v1
```

Every product pipeline and shader module shall be created through the GPU Authority bridge.

The shader-set digest shall include exact asset digests in sorted identity order.
---

# 19. Job Arena and Resource Lifecycle

## 19.1 Job arena

A `SpectralFftJobArena` owns every scratch resource for one Analysis build lease.

The arena state is:

```text
CREATED
→ ENCODING
→ SUBMITTED
→ FENCE_COMPLETED
→ OUTPUT_TRANSFERRED
→ DISPOSED
```

Failure states are:

```text
CANCELLED
FAILED
INVALIDATED
```

## 19.2 Disposal order

Scratch resources may be destroyed only after:

- the corresponding queue work completes, or
- the device epoch is invalidated.

The final output buffer shall not be destroyed after publication. Ownership transfers to the Analysis Field Authority.

## 19.3 Uniform reuse

One FFT-stage uniform buffer and one transpose uniform buffer may be reused within a serially encoded job.

If queue writes could race with submitted work, the implementation shall use dynamic offsets or a packed immutable parameter buffer rather than overwrite an in-flight uniform range.

The canonical source-bake design is a packed immutable parameter buffer containing one 64-byte record per dispatch.

## 19.4 No per-window recreation

Pipelines, shader modules, and bind-group layouts are cached per device epoch.

Scratch buffers are allocated per chunk, not per window.
---

# 20. Cancellation and Device Loss

Cancellation is checked:

- before plan creation,
- before resource allocation,
- before each chunk is encoded,
- before each chunk is submitted,
- after each chunk fence,
- before publication.

A submitted GPU command buffer is not pretended to be cancelled in the middle of execution.

If cancellation occurs after submission, the job waits only for the resource-safety fence, suppresses publication, disposes scratch, and records a failed or superseded receipt.

Device loss shall:

- invalidate the Analysis build lease,
- invalidate the job arena,
- prevent publication,
- dispose or abandon old-epoch resources safely,
- clear spectral pipeline caches for that epoch,
- require a new request on the new epoch.

Old-epoch frequency fields shall never be acquired by consumers.
---

# 21. Zero Intermediate Readback

Product source shall contain no FFT-path use of:

```text
GPUBufferUsage.MAP_READ
buffer.mapAsync
getMappedRange
copyBufferToBuffer into a readback buffer
copyTextureToBuffer for spectral inspection
```

The product submission record shall declare:

```text
cpuPixelComputeUsed:             false
webglPixelComputeUsed:           false
canvasPixelComputeUsed:          false
intermediatePixelReadbackCount:  0
```

A validation run may read one bounded scalar comparator summary after all product and reference outputs remain on the GPU.

Validation summary readback shall be:

- explicitly diagnostic,
- excluded from product field publication,
- recorded separately,
- bounded to a fixed small structure,
- never used to reconstruct spectrum values on the CPU.
---

# 22. Analysis Authority Request and Publication

## 22.1 Build request

The producer begins one Authority lease with:

```text
producerId:       tdt.analysis.producer.spectral.fft
outputSemanticId: tdt.analysis.spectral.window-frequency-complex.v1
sourceSurface:    inherited from the upstream spatial-window field
requestDigest:    canonical request JSON digest
parameterDigest:  Stockham plan digest
shaderSetDigest:  exact spectral shader set digest
resourceDescriptorDigest: exact buffer layout digest
```

## 22.2 Input acquisition

The executor acquires and pins the upstream spatial-complex field for the entire GPU job.

The following identities must match:

```text
sourceSurfaceId
sourceRevision
deviceEpoch
window dimensions
window count
layout digest
```

## 22.3 Submission record

The submission record shall include every dispatch in execution order:

```text
row stage 0 .. row stage n-1
transpose forward
column stage 0 .. column stage m-1
transpose back
```

for every chunk.

## 22.4 Publication

Publication is legal only after the queue completion fence.

The output claim level in the source-baked state is:

```text
EFFECTIVE_EXECUTION
```

`PIXEL_VERIFIED` requires physical GPU validation gates.

`PERFORMANCE_VERIFIED` is outside this patch.
---

# 23. Execution Receipt Extension

The standard Truth-00 receipt remains authoritative.

The spectral producer shall additionally attach or expose a spectral detail record:

```ts
interface SpectralFftExecutionDetail {
  schemaVersion: 1;
  algorithmId: 'tdt.spectral.stockham-2d-webgpu.v1';
  planDigest: string;
  width: number;
  height: number;
  windowCount: number;
  chunkCount: number;
  rowStageCount: number;
  columnStageCount: number;
  butterflyDispatchCount: number;
  transposeDispatchCount: number;
  expectedComplexWrites: number;
  validationMode: 'none' | 'writer-ownership' | 'direct-dft' | 'roundtrip';
  intermediateReadbackCount: 0;
  finalBufferSlotByAxis: readonly string[];
}
```

The detail digest shall be included in the producer request or resource descriptor digest.

No mutable timestamps shall participate in the deterministic receipt digest.
---

# 24. Numerical Convention

## 24.1 Forward transform

The canonical forward transform is unnormalized:

```text
X[k] = Σ x[n] × exp(-i 2πkn/N)
```

For 2D:

```text
X[u,v] = Σy Σx x[x,y] × exp(-i2π(ux/W + vy/H))
```

## 24.2 Frequency layout

The output is natural unshifted DFT order:

```text
DC at (0,0)
positive frequencies followed by wrapped negative frequencies
Nyquist at W/2 or H/2 for even dimensions
```

This patch shall not apply `fftshift`.

Consumers requiring centered spectra must request an explicit future layout transform.

## 24.3 Inverse validation

The diagnostic inverse uses positive phase and normalization `1/(W×H)`.

Inverse support may be folded into the last transpose-back validation pass.

It shall not change the forward product ABI.
---

# 25. Independent GPU Validation

CPU FFT output is not the canonical product oracle.

## 25.1 Writer ownership validation

A validation variant increments one atomic counter per output element.

After one stage:

```text
minimum writer count = 1
maximum writer count = 1
missing writer count = 0
duplicate writer count = 0
```

## 25.2 Direct DFT reference

For small transforms `8×8` and `16×16`, an independent WGSL direct-DFT kernel computes the reference spectrum.

The direct kernel shall not reuse Stockham index functions or stage code.

## 25.3 Complex comparator

A GPU comparator reports only:

```text
nanCount
infinityCount
maxAbsoluteError
maxRelativeError
rootMeanSquareError
firstFailingElement
```

## 25.4 Transpose comparator

Transpose and transpose-back must be bit-exact:

```text
exactMismatchCount = 0
```

## 25.5 Roundtrip

Forward plus diagnostic inverse shall reproduce fixture input within the physical tolerance profile.
---

# 26. Fixture Matrix

GPU fixture generation shall include:

1. all-zero complex field,
2. unit impulse at origin,
3. unit impulse away from origin,
4. constant real field,
5. constant imaginary field,
6. alternating checkerboard,
7. horizontal complex sinusoid on an exact bin,
8. vertical complex sinusoid on an exact bin,
9. diagonal complex sinusoid on exact bins,
10. conjugate frequency pair,
11. rectangular `16×32` transform,
12. multi-window batch with distinct fixtures per layer,
13. partial final batch chunk,
14. maximum source-admitted `256×256` transform,
15. cancellation before submission,
16. device-loss invalidation after submission.

Fixture generation shall occur in WGSL or use immutable GPU fixture assets.

Product code shall not generate fixture pixels on the CPU.
---

# 27. Physical Numerical Tolerances

For direct DFT comparison on normalized fixture inputs:

```text
NaN count:      0
Infinity count: 0
max relative error: ≤ 1.0e-4
normalized RMSE:    ≤ 2.0e-5
```

For forward-plus-inverse roundtrip:

```text
max absolute error: ≤ 2.0e-4
normalized RMSE:    ≤ 5.0e-5
```

Transpose-only exact mismatch count shall be zero.

These tolerances are physical same-device gates.

They remain `DEFERRED` in source-only environments.

A tolerance failure shall not be converted into a compatibility pass.
---

# 28. Stable Error Taxonomy

The Stable Error Registry shall include:

```text
E_SPECTRAL_INPUT_FIELD_REQUIRED
E_SPECTRAL_INPUT_SEMANTIC_MISMATCH
E_SPECTRAL_INPUT_LAYOUT_MISMATCH
E_SPECTRAL_CPU_INPUT_FORBIDDEN
E_SPECTRAL_NON_POWER_OF_TWO
E_SPECTRAL_SIZE_UNSUPPORTED
E_SPECTRAL_BATCH_EMPTY
E_SPECTRAL_ARITHMETIC_OVERFLOW
E_SPECTRAL_BUFFER_LIMIT
E_SPECTRAL_BINDING_LIMIT
E_SPECTRAL_DISPATCH_LIMIT
E_SPECTRAL_SINGLE_WRITER_PROOF_FAILED
E_SPECTRAL_TRANSPOSE_PROOF_FAILED
E_SPECTRAL_ALIASING_FORBIDDEN
E_SPECTRAL_INTERMEDIATE_READBACK_FORBIDDEN
E_SPECTRAL_PIPELINE_UNAVAILABLE
E_SPECTRAL_SHADER_DIGEST_MISMATCH
E_SPECTRAL_STALE_DEVICE_EPOCH
E_SPECTRAL_CANCELLED
E_SPECTRAL_DEVICE_LOST
E_SPECTRAL_FIELD_PUBLICATION_FAILED
E_SPECTRAL_VALIDATION_FAILED
E_SPECTRAL_REDUCTION_NOT_AVAILABLE
E_SPECTRAL_RESOURCE_LIFETIME_MISMATCH
```

Errors shall be deterministic and fail closed.
---

# 29. Active Graph and Asset Closure

The canonical executor files shall become Active Graph product nodes.

The legacy FFT prototype remains admitted only as a compatibility facade.

Runtime Asset Authority shall include all product and validation WGSL assets with exact digests.

The Active Graph shall prove:

- the executor service is reachable from Runtime Composition,
- the Analysis Field Authority dependency is explicit,
- the GPU Authority dependency is explicit,
- no product path reaches CPU FFT through the compatibility facade,
- no dynamic shader URL is unsealed,
- no unknown FFT worker script is spawned,
- no WebGL FFT node is admitted as a fallback.
---

# 30. Planned Source Layout

Recommended canonical files:

```text
app/src/runtime/analysis/spectral/
├─ spectral-fft-types.ts
├─ spectral-stockham-plan.ts
├─ spectral-stockham-executor-service.ts
├─ spectral-fft-job-arena.ts
├─ spectral-fft-receipt.ts
├─ spectral-fft-validation.ts
└─ shaders/
   ├─ stockham-radix2-stage.wgsl
   ├─ complex-transpose-16x16.wgsl
   ├─ direct-dft-reference.wgsl
   ├─ complex-compare.wgsl
   ├─ writer-ownership-validation.wgsl
   └─ spectral-fixture-generator.wgsl
```

Expected modified integration files:

```text
app/src/runtime/analysis/analysis-field-semantic-registry.ts
app/src/runtime/analysis/generated/generated-analysis-semantic-registry.json
app/src/runtime/analysis/generated/generated-analysis-producer-inventory.json
app/src/runtime/service-container.ts
app/src/boot/runtime-modules.ts
app/src/runtime/assets/generated-runtime-asset-manifest.*
app/src/runtime/active-graph/generated-active-runtime-graph.*
app/src/boot/stable-error.ts
app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js
app/legacy-runtime/js/modules/qmapFFTBuilder.js
package.json
```
---

# 31. Legacy Migration Rules

## 31.1 `dk_fft_qmap_webgpu_v2.js`

The file shall:

- preserve exports,
- delegate GPU FFT execution to the canonical service,
- reject CPU `Float32Array` product input,
- stop embedding product WGSL strings,
- stop allocating MAP_READ storage buffers,
- stop performing per-window readback,
- stop recomputing R1C tensor logic,
- stop returning CPU `K`, `I`, and `M` as canonical product output.

## 31.2 `QmapFFTBuilder`

The facade shall no longer return a successful-looking null texture.

Before `TDT-SPECTRAL-QMAP-03`, a request for magnitude or Q-map output shall fail explicitly with `E_SPECTRAL_REDUCTION_NOT_AVAILABLE`.

## 31.3 CPU FFT

The CPU FFT reference remains diagnostic-only under Truth-00 policy.

It shall not be imported into the canonical executor module.

## 31.4 Existing callers

Existing callers may continue to import the same facade names.

They must migrate request payloads from CPU pixels to Analysis Field handles.

A missing handle shall fail rather than trigger implicit upload.
---

# 32. Source and Mock Verification Programs

Required source tools:

```text
tools/spectral-qmap-02-source-gate.mjs
tools/spectral-qmap-02-wgsl-contract-gate.mjs
tools/spectral-qmap-02-mock-runtime.mjs
tools/spectral-qmap-02-active-graph-gate.mjs
tools/spectral-qmap-02-finalize-source-bake.mjs
```

Required source checks include:

- exact gate continuity,
- semantic registry digest,
- producer inventory identity,
- Stockham formula tokens,
- `N/2` invocation ownership,
- no MAP_READ in product executor,
- no `mapAsync` in product executor,
- no per-window loop around queue submission,
- uniform ABI offsets,
- transpose barrier dominance,
- no return before transpose barrier,
- no direct GPU adapter request,
- no CPU pixel upload path,
- stable error coverage,
- asset manifest closure,
- Active Graph closure.

The mock runtime shall prove plan, chunk, resource, submission, publication, cancellation, and device-loss behavior without claiming physical numerical parity.
---

# 33. Source-Bake Artifacts

The bake shall emit:

```text
README_TDT_SPECTRAL_QMAP_02_APPLIED.md
specs/TDT-SPECTRAL-QMAP-02_..._SPEC.md
patches/TDT_SPECTRAL_QMAP_02_...diff
patches/TDT_SPECTRAL_QMAP_02_CHANGED_FILE_MANIFEST.json
artifacts/spectral-qmap-02/source-bake/TDT_SPECTRAL_QMAP_02_SOURCE_RECEIPT.json
artifacts/spectral-qmap-02/source-bake/TDT_SPECTRAL_QMAP_02_REGRESSION_SUMMARY.json
artifacts/spectral-qmap-02/source-bake/TDT_SPECTRAL_QMAP_02_GATE_REPORT.json
```

The receipt shall record:

- parent ZIP and source seal,
- semantic registry digest,
- producer inventory digest,
- shader asset digests,
- changed-file digests,
- gate counts,
- deferred physical gates,
- Production Pointer mutation status,
- final Source Seal.
---

# 34. Gate Matrix

The canonical Gate namespace is:

```text
SQ02-001 through SQ02-180
```

Every Gate identifier shall appear exactly once in the specification and exactly once in the generated Gate manifest.

## SQ02-001

**Category:** Parent, ABI, and dependency truth

**Requirement:** Parent ZIP SHA and source seal match the Truth-00 baseline.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-002

**Category:** Parent, ABI, and dependency truth

**Requirement:** Production Pointer is unchanged.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-003

**Category:** Parent, ABI, and dependency truth

**Requirement:** GPU Device Authority remains the only adapter and device owner.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-004

**Category:** Parent, ABI, and dependency truth

**Requirement:** Analysis Field Authority remains the only field publication owner.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-005

**Category:** Parent, ABI, and dependency truth

**Requirement:** Existing fft-qmap GPU consumer lease identity is preserved.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-006

**Category:** Parent, ABI, and dependency truth

**Requirement:** Existing legacy facade export names remain present.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-007

**Category:** Parent, ABI, and dependency truth

**Requirement:** Product CPU grayscale-array FFT input is rejected.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-008

**Category:** Parent, ABI, and dependency truth

**Requirement:** Complete Q-map output remains unavailable until the reduction patch.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-009

**Category:** Parent, ABI, and dependency truth

**Requirement:** Missing roadmap item 01 does not trigger an implicit CPU extractor.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-010

**Category:** Parent, ABI, and dependency truth

**Requirement:** Fixture-only GPU input is clearly separated from product execution.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-011

**Category:** Parent, ABI, and dependency truth

**Requirement:** R1C Tensor producer remains independent from the spectral FFT producer.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-012

**Category:** Parent, ABI, and dependency truth

**Requirement:** R2 EWA output identity is unchanged when spectral fields are unused.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-013

**Category:** Semantic and input field contract

**Requirement:** Spatial-complex input semantic is registered.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-014

**Category:** Semantic and input field contract

**Requirement:** Frequency-complex output semantic is registered.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-015

**Category:** Semantic and input field contract

**Requirement:** Ambiguous window-complex semantic is compatibility-only.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-016

**Category:** Semantic and input field contract

**Requirement:** Semantic registry version advances deterministically.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-017

**Category:** Semantic and input field contract

**Requirement:** Semantic descriptor digests are regenerated.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-018

**Category:** Semantic and input field contract

**Requirement:** Producer inventory declares the spatial-complex input semantic.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-019

**Category:** Semantic and input field contract

**Requirement:** Producer inventory declares only frequency-complex output for patch 02.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-020

**Category:** Semantic and input field contract

**Requirement:** Input resource kind is storage-buffer.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-021

**Category:** Semantic and input field contract

**Requirement:** Input format is complex-f32-interleaved.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-022

**Category:** Semantic and input field contract

**Requirement:** Output resource kind is storage-buffer.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-023

**Category:** Semantic and input field contract

**Requirement:** Output format is complex-f32-interleaved.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-024

**Category:** Semantic and input field contract

**Requirement:** Input source surface ID is preserved.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-025

**Category:** Semantic and input field contract

**Requirement:** Input source revision is preserved.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-026

**Category:** Semantic and input field contract

**Requirement:** Input device epoch is exact.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-027

**Category:** Semantic and input field contract

**Requirement:** Input dimensions and layer count match the request.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-028

**Category:** Semantic and input field contract

**Requirement:** Input field remains pinned until the GPU job is safe.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-029

**Category:** Plan and arithmetic truth

**Requirement:** Plan identity is tdt.spectral.stockham-plan.v1.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-030

**Category:** Plan and arithmetic truth

**Requirement:** Width is a checked power of two.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-031

**Category:** Plan and arithmetic truth

**Requirement:** Height is a checked power of two.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-032

**Category:** Plan and arithmetic truth

**Requirement:** Width is within the admitted range.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-033

**Category:** Plan and arithmetic truth

**Requirement:** Height is within the admitted range.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-034

**Category:** Plan and arithmetic truth

**Requirement:** Window count is nonzero.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-035

**Category:** Plan and arithmetic truth

**Requirement:** Element count arithmetic is overflow-checked.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-036

**Category:** Plan and arithmetic truth

**Requirement:** Byte count arithmetic is overflow-checked.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-037

**Category:** Plan and arithmetic truth

**Requirement:** Row stage count equals integer log2(width).

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-038

**Category:** Plan and arithmetic truth

**Requirement:** Column stage count equals integer log2(height).

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-039

**Category:** Plan and arithmetic truth

**Requirement:** Row transform count equals windows times height.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-040

**Category:** Plan and arithmetic truth

**Requirement:** Column transform count equals windows times width.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-041

**Category:** Plan and arithmetic truth

**Requirement:** Natural unshifted frequency layout is declared.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-042

**Category:** Plan and arithmetic truth

**Requirement:** Forward direction sign is fixed to negative one.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-043

**Category:** Plan and arithmetic truth

**Requirement:** Forward normalization scale is fixed to one.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-044

**Category:** Plan and arithmetic truth

**Requirement:** Plan digest is deterministic.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-045

**Category:** Plan and arithmetic truth

**Requirement:** Planner uses no wall clock, randomness, vendor, or image content.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-046

**Category:** Plan and arithmetic truth

**Requirement:** One-window fit failure is fail-closed.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-047

**Category:** Plan and arithmetic truth

**Requirement:** Batch chunks preserve layer order.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-048

**Category:** Plan and arithmetic truth

**Requirement:** Dispatch dimensions remain within device limits.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-049

**Category:** Single-writer Stockham butterfly

**Requirement:** Stockham stage index is zero-based and bounded.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-050

**Category:** Single-writer Stockham butterfly

**Requirement:** Each transform dispatches exactly N/2 butterfly owners.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-051

**Category:** Single-writer Stockham butterfly

**Requirement:** Each owner computes one input pair.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-052

**Category:** Single-writer Stockham butterfly

**Requirement:** Each owner writes exactly two output elements.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-053

**Category:** Single-writer Stockham butterfly

**Requirement:** No two owners write the same first output index.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-054

**Category:** Single-writer Stockham butterfly

**Requirement:** No two owners write the same second output index.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-055

**Category:** Single-writer Stockham butterfly

**Requirement:** Every output element is written once per stage.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-056

**Category:** Single-writer Stockham butterfly

**Requirement:** Input and output buffer ranges do not alias.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-057

**Category:** Single-writer Stockham butterfly

**Requirement:** Stage twiddle denominator is two times Nhalf.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-058

**Category:** Single-writer Stockham butterfly

**Requirement:** Forward twiddle sign matches the declared DFT convention.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-059

**Category:** Single-writer Stockham butterfly

**Requirement:** Stage output addressing produces Stockham autosort order.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-060

**Category:** Single-writer Stockham butterfly

**Requirement:** Final output is natural order without bit reversal.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-061

**Category:** Single-writer Stockham butterfly

**Requirement:** Ping-pong parity selects the true final slot.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-062

**Category:** Single-writer Stockham butterfly

**Requirement:** No corrective CPU permutation is present.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-063

**Category:** Single-writer Stockham butterfly

**Requirement:** No corrective GPU bit-reversal pass is present.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-064

**Category:** Single-writer Stockham butterfly

**Requirement:** Validation writer counters detect missing writers.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-065

**Category:** Single-writer Stockham butterfly

**Requirement:** Validation writer counters detect duplicate writers.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-066

**Category:** Single-writer Stockham butterfly

**Requirement:** Current prototype N-invocation duplicate-writer mapping is absent.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-067

**Category:** Single-writer Stockham butterfly

**Requirement:** FFT stage uniform is exactly 64 bytes.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-068

**Category:** Single-writer Stockham butterfly

**Requirement:** FFT stage ABI version is stable and checked.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-069

**Category:** Single-writer Stockham butterfly

**Requirement:** FFT product shader is an external sealed WGSL asset.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-070

**Category:** Single-writer Stockham butterfly

**Requirement:** FFT pipeline is created through the GPU Authority bridge.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-071

**Category:** Single-writer Stockham butterfly

**Requirement:** One dispatch covers all transforms in the current chunk.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-072

**Category:** Single-writer Stockham butterfly

**Requirement:** No per-window compute pass loop exists.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-073

**Category:** 2D transform and transpose

**Requirement:** Row transforms use width as transform length.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-074

**Category:** 2D transform and transpose

**Requirement:** Row transform count covers every row of every window.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-075

**Category:** 2D transform and transpose

**Requirement:** First transpose maps W by H to H by W per layer.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-076

**Category:** 2D transform and transpose

**Requirement:** Column transforms use height as transform length.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-077

**Category:** 2D transform and transpose

**Requirement:** Column transform count covers every column of every window.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-078

**Category:** 2D transform and transpose

**Requirement:** Transpose-back restores W by H natural row-major layout.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-079

**Category:** 2D transform and transpose

**Requirement:** Transpose uses a 16 by 16 workgroup.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-080

**Category:** 2D transform and transpose

**Requirement:** Transpose shared tile has padded stride 17.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-081

**Category:** 2D transform and transpose

**Requirement:** Every transpose lane writes shared storage before the barrier.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-082

**Category:** 2D transform and transpose

**Requirement:** Invalid source lanes write neutral zero before the barrier.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-083

**Category:** 2D transform and transpose

**Requirement:** Transpose barrier is unconditional.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-084

**Category:** 2D transform and transpose

**Requirement:** No return occurs before the transpose barrier.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-085

**Category:** 2D transform and transpose

**Requirement:** Only valid destination lanes write after the barrier.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-086

**Category:** 2D transform and transpose

**Requirement:** Transpose source and destination resources differ.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-087

**Category:** 2D transform and transpose

**Requirement:** Transpose uniform is exactly 64 bytes.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-088

**Category:** 2D transform and transpose

**Requirement:** Transpose ABI version is stable and checked.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-089

**Category:** 2D transform and transpose

**Requirement:** Transpose and transpose-back are bit-exact in validation.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-090

**Category:** 2D transform and transpose

**Requirement:** One chunk is submitted as one ordered command sequence.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-091

**Category:** 2D transform and transpose

**Requirement:** Per-window queue submission is forbidden.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-092

**Category:** 2D transform and transpose

**Requirement:** Dispatch order in the receipt matches encoded order.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-093

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Each build lease creates one job arena.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-094

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Job arena state transitions are deterministic.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-095

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Scratch buffers are allocated per chunk rather than per window.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-096

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Product pipelines are cached only within the current device epoch.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-097

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Packed immutable dispatch parameters avoid in-flight uniform overwrite.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-098

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Scratch disposal waits for the resource-safety fence.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-099

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Final output ownership transfers to the Analysis Field Authority.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-100

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Published output is not destroyed by the job arena.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-101

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Input field pin is released exactly once.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-102

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Cancellation before submission allocates no unsafe work.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-103

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Cancellation after submission suppresses publication.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-104

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Cancellation after submission still waits for resource safety.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-105

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Device loss invalidates the active build lease.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-106

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Device loss clears old-epoch spectral pipelines.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-107

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Old-epoch output cannot be published.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-108

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Old-epoch fields cannot be acquired.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-109

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Product source contains no GPUBufferUsage.MAP_READ.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-110

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Product source contains no mapAsync call.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-111

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Product source contains no getMappedRange call.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-112

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Product intermediate readback count is zero.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-113

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Product CPU pixel compute flag is false.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-114

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Product WebGL pixel compute flag is false.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-115

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Product Canvas pixel compute flag is false.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-116

**Category:** Lifecycle, cancellation, and zero readback

**Requirement:** Validation summary readback is bounded and diagnostic-only.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-117

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Producer version becomes 2.0.0.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-118

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Implementation identity becomes tdt-spectral-stockham-2d-webgpu-v1.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-119

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Producer product admission becomes canonical only after mandatory source gates.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-120

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Build request includes deterministic request digest.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-121

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Build request includes the Stockham plan digest.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-122

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Build request includes exact shader-set digest.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-123

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Build request includes exact resource-descriptor digest.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-124

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Submission record lists every FFT and transpose dispatch.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-125

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Submission record reports zero prohibited fallback.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-126

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Publication occurs only after fence completion.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-127

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Source-baked publication claim is EFFECTIVE_EXECUTION.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-128

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** PIXEL_VERIFIED remains unavailable without physical evidence.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-129

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Spectral execution detail is digest-bound to the receipt.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-130

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Legacy initWebGPU uses the existing GPU Authority lease.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-131

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Legacy computeQMap_GPU_All rejects product CPU input.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-132

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Legacy complete-Q-map calls fail explicitly before patch 03.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-133

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** QmapFFTBuilder cannot return null texture as success.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-134

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Product WGSL strings are removed from the legacy facade.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-135

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Runtime Asset Manifest seals every spectral WGSL asset.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-136

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Active Graph reaches the canonical executor service.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-137

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Active Graph does not admit a CPU FFT product fallback.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-138

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Active Graph does not admit a WebGL FFT product fallback.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-139

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Unknown dynamic shader fetches are absent.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-140

**Category:** Authority, receipt, facade, and graph closure

**Requirement:** Stable Error Registry includes every spectral error code.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-141

**Category:** Source and mock validation

**Requirement:** Source gate finds all 180 gate identifiers exactly once.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-142

**Category:** Source and mock validation

**Requirement:** WGSL parser or structural scanner accepts every spectral shader.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-143

**Category:** Source and mock validation

**Requirement:** Source scanner verifies N/2 butterfly dispatch logic.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-144

**Category:** Source and mock validation

**Requirement:** Source scanner verifies no pre-barrier transpose return.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-145

**Category:** Source and mock validation

**Requirement:** Source scanner verifies no product MAP_READ usage.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-146

**Category:** Source and mock validation

**Requirement:** Source scanner verifies no product mapAsync usage.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-147

**Category:** Source and mock validation

**Requirement:** Mock planner covers square and rectangular transforms.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-148

**Category:** Source and mock validation

**Requirement:** Mock planner covers a partial final batch chunk.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-149

**Category:** Source and mock validation

**Requirement:** Mock planner rejects non-power-of-two dimensions.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-150

**Category:** Source and mock validation

**Requirement:** Mock planner rejects arithmetic overflow.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-151

**Category:** Source and mock validation

**Requirement:** Mock runtime proves one submission per chunk.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-152

**Category:** Source and mock validation

**Requirement:** Mock runtime proves publication-after-fence ordering.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-153

**Category:** Source and mock validation

**Requirement:** Mock runtime proves cancellation suppresses publication.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-154

**Category:** Source and mock validation

**Requirement:** Mock runtime proves device-loss invalidation.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-155

**Category:** Source and mock validation

**Requirement:** Mock runtime proves exact ownership transfer and disposal.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-156

**Category:** Source and mock validation

**Requirement:** Mock runtime reproduces deterministic receipt digest.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-157

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Physical WebGPU compiles every product and validation shader.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-158

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Physical bind-group validation reports zero errors.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-159

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Writer-ownership validation reports one writer per output.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-160

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Direct DFT fixtures satisfy the numerical tolerance profile.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-161

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Forward-plus-inverse fixtures satisfy the roundtrip tolerance profile.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-162

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Transpose roundtrip exact mismatch count is zero.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-163

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Physical execution reports zero NaN and Infinity values.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-164

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Physical execution observes zero product intermediate readbacks.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-165

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Physical multi-window execution uses batched dispatches.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-166

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Physical device loss prevents stale publication.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-167

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Repeated physical execution reaches a bounded memory plateau.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-168

**Category:** Physical WebGPU and packaged evidence

**Requirement:** Windows x64 Packaged Electron reproduces the same producer receipt identities.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** physical WebGPU or Windows x64 Packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## SQ02-169

**Category:** Regression, packaging, and promotion

**Requirement:** Truth-00 source and mock gates remain passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-170

**Category:** Regression, packaging, and promotion

**Requirement:** R1A through R2 resample gates remain passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-171

**Category:** Regression, packaging, and promotion

**Requirement:** GPU Device SSOT gate remains passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-172

**Category:** Regression, packaging, and promotion

**Requirement:** Surface Lifecycle gate remains passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-173

**Category:** Regression, packaging, and promotion

**Requirement:** Preview Presenter gate remains passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-174

**Category:** Regression, packaging, and promotion

**Requirement:** Runtime R7 remains passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-175

**Category:** Regression, packaging, and promotion

**Requirement:** Export Worker 01 through 07 remain passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-176

**Category:** Regression, packaging, and promotion

**Requirement:** Export Promotion 01 through 03 remain passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-177

**Category:** Regression, packaging, and promotion

**Requirement:** Build Lock and Build Emit remain passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-178

**Category:** Regression, packaging, and promotion

**Requirement:** MODJPEG, Native Decoder, JXL, and PSD gates remain passing.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-179

**Category:** Regression, packaging, and promotion

**Requirement:** Optional spectral producer disabled preserves R2 pixel identity and shared Final Surface tuple.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## SQ02-180

**Category:** Regression, packaging, and promotion

**Requirement:** Independent final ZIP extraction reproduces the Spectral-02 Source Seal.

**Source evidence:** exact source scanner, generated manifest, ABI assertion, mock runtime, or deterministic receipt evidence.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

---

# 35. Gate Classification

## 35.1 Source mandatory

`SQ02-001` through `SQ02-156` and `SQ02-169` through `SQ02-180` are mandatory for the source-baked state.

## 35.2 Physical mandatory

`SQ02-157` through `SQ02-168` require physical WebGPU or Windows x64 Packaged Electron evidence.

They remain `DEFERRED`, not `PASS`, in a source-only environment.

## 35.3 No blanket defer

Semantic identity, Stockham addressing, single-writer ownership, transpose barrier structure, resource ownership, zero-readback source proof, facade behavior, and Authority receipts may not be deferred merely because a physical GPU is unavailable.

---

# 36. Source-Bake Acceptance Summary

The source bake is acceptable only when:

```text
Mandatory source Gate FAIL:             0
Mock runtime FAIL:                       0
Unknown spectral semantic publications: 0
Duplicate butterfly writers by contract:0
Missing butterfly writers by contract:  0
Product CPU spectral compute paths:      0
Product WebGL spectral compute paths:    0
Product Canvas spectral compute paths:   0
Product intermediate readback paths:     0
Per-window queue submission paths:       0
Stale device-epoch publication:          0
Resource lifetime mismatches:            0
Legacy null-success returns:              0
Predecessor regression failures:         0
Production Pointer mutation:             false
Independent ZIP source-seal reproduction:exact
```

Expected source-only Gate state:

```text
PASS:     168
DEFERRED: 12
FAIL:     0
```

The exact PASS count may increase only when valid physical evidence is added. A physical requirement may not be silently reclassified as source evidence.

---

# 37. Status Transition

```text
ANALYSIS_FIELD_TRUTH_00_SOURCE_BAKED_AWAITING_PACKAGED_GPU
→ SPECTRAL_QMAP_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU
→ SPECTRAL_QMAP_02_VERIFIED_UNPROMOTED
```

The Production Pointer remains unchanged.

A verified-unpromoted state requires all physical gates and independent packaged evidence.

---

# 38. Final Seal Statement

`TDT-SPECTRAL-QMAP-02` is complete only when the repository contains one canonical batched 2D complex FFT executor whose butterflies have singular writer ownership, whose row and column transforms are connected by a uniformly synchronized tiled transpose, whose intermediate values never leave GPU memory, and whose final frequency batch is published through the Analysis Field Authority with exact source, device, semantic, plan, shader, resource, and receipt identities.

A file containing FFT code is not an executed FFT.

A batch loop that submits one window at a time is not a batched FFT.

A buffer that is mapped between stages is not a zero-readback GPU pipeline.

A butterfly with overlapping writers is not deterministic evidence.

A returned CPU array is not an Analysis Field.

The repaired executor shall preserve the existing ideas and public entry points, but it shall replace their internal authority with a verifiable same-device WebGPU execution chain.

---

## Implementation Amendment A — Static WGSL Asset Route and Validation Admission

The source bake stores canonical SQ02 WGSL assets under
`app/legacy-runtime/core/analysis/spectral/shaders/` because this repository's
Runtime Asset Authority emits `/legacy/**` static routes. This is a static asset
routing decision only. The executor, planner, receipt, lifecycle, and ownership
SSOT remain under `app/src/runtime/analysis/spectral/`.

Product execution accepts `validationMode: "none"` in the source-baked state.
`writer-ownership`, `direct-dft`, and `roundtrip` shaders are sealed test assets,
but their physical WebGPU execution remains SQ02-157 through SQ02-168 DEFERRED.
A request must not claim one of those validation modes until the packaged test
harness actually executes the corresponding GPU passes and seals its summary.
