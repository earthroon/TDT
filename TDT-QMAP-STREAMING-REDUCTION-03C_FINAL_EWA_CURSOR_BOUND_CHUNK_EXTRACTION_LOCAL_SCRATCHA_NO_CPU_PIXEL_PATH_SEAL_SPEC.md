# TDT-QMAP-STREAMING-REDUCTION-03C

## Final EWA Cursor-Bound Streaming Capability / Chunk-Local Periodic-Hann Window Extraction / Exact Global Window-to-Grid Mapping / Weighted DC and Premultiplied Luma Preservation / Local ScratchA Offset-Zero Write / Chunk-Control Record Binding / Monotonic Chunk Order / No Full Spatial-Complex Atlas / No Edge Padding / No CPU Pixel Path Seal

## 0. Document identity

```text
Patch ID
= TDT-QMAP-STREAMING-REDUCTION-03C

Short ID
= QSR03C

Parent patch
= TDT-QMAP-STREAMING-REDUCTION-03B

Umbrella patch
= TDT-QMAP-STREAMING-REDUCTION-03

Required parent state
= SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03B_SINGLE_FENCE_BOUND_TRANSIENT_SLOT_NO_LOOP_ALLOCATION_AWAITING_FINAL_EWA_CHUNK_EXTRACTION_03C

Specification state
= SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03C is the first QSR03 subpatch that records an actual GPU computation against the retained Final EWA texture. It binds one retained Final EWA source, one exact QSR03A chunk, one active QSR03B slot generation, and one authority-owned command encoder. It records one chunk-local extraction pass into `scratchA` and emits a one-shot same-encoder handoff for QSR03D Stockham execution.

QSR03C does not execute Stockham FFT, transpose, power normalization, partial reduction, global compact scatter, QMap projection, queue submission, completion-ticket issuance, Analysis Field publication, EFC convergence, or product-route promotion.

## 1. Authority decision

```text
sourceCapabilitySchemaId
= tdt.qmap.final-ewa-streaming-source.qsr03c.v1

sourceCapabilityAuthorityId
= dadum.qmap-final-ewa-streaming-authority.qsr03c

extractionRecorderId
= dadum.qmap-window-extraction-recorder.qsr03c

extractionImplementationId
= tdt-final-ewa-periodic-hann-window-chunk-webgpu-v1

extractionHandoffSchemaId
= tdt.qmap.window-extraction-handoff.qsr03c.v1

extractionRecordSchemaId
= tdt.qmap.window-extraction-record.qsr03c.v1

shaderId
= tdt.qmap.shader.final-ewa-periodic-hann-window-chunk.qsr03.v1

shaderAbiId
= tdt.qmap.shader-abi.final-ewa-window-chunk.qsr03.v1
```

QSR03C trusts only:

- the canonical retained Final EWA texture capability;
- the exact QSR03A plan and window layout digest;
- the exact QSR03B arena, active lease, slot ID, and generation;
- the canonical encoder capability;
- the QSR03B chunk-control writer and private bindings;
- canonical pipeline and shader authority;
- runtime epoch, device epoch, cancellation, and device-loss authority.

Caller-created textures, views, buffers, encoders, queues, ranges, geometry, Hann profiles, luma coefficients, receipts, and generation values are rejected.

QRC02 remains the product route. QSR03C is staged integration and qualification only.

## 2. Final EWA streaming source capability

Public metadata contains operation ID, source surface and revision, original source dimensions, analysis dimensions, runtime and device epoch, device identity, Final EWA descriptor and actual identity digests, lowpass receipt digest, plan and layout digests, arena and slot identity, expected chunk index and window base, and capability state.

Raw `GPUTexture`, `GPUTextureView`, `GPUDevice`, `GPUQueue`, `GPUBindGroup`, `GPUComputePipeline`, mutable cursor, and private binding keys remain in a closure-owned `WeakMap` or equivalent private table.

Capability creation requires exact equality between retained Final EWA lineage and the QSR03A plan:

```text
sourceSurfaceId
sourceRevision
analysisWidth
analysisHeight
runtimeEpoch
deviceEpoch
deviceIdentityDigest
finalEwaActualIdentityDigest
finalEwaDescriptorDigest
lowpassReceiptDigest
```

The admitted descriptor is:

```text
dimension          = 2d
depthOrArrayLayers = 1
mipLevelCount      = 1
sampleCount        = 1
format             = rgba16float
width              = plan.geometry.analysisWidth
height             = plan.geometry.analysisHeight
```

The capability binds one operation, one plan, one arena, and one device epoch. It cannot be cloned, structured-cloned, transferred through IPC, stored in project state, rebound to another arena, resumed across device loss, or reused for another source revision.

## 3. Monotonic cursor state

Initial state:

```text
expectedChunkIndex = 0
expectedWindowBase = 0
```

State sequence:

```text
AVAILABLE_FOR_STREAMING
→ CHUNK_BOUND
→ EXTRACTION_RECORDED
→ HANDOFF_OUTSTANDING
→ SUBMISSION_BOUND
→ FENCE_PENDING
→ AVAILABLE_FOR_STREAMING
```

Final chunk:

```text
FENCE_PENDING
→ STREAMING_COMPLETE
→ AVAILABLE_FOR_FINAL_GRAPH
```

A chunk is admitted only when the source capability, plan, arena, lease, encoder, exact QSR03A range, current slot generation, runtime epoch, and device epoch all match.

```text
lease.chunkIndex < expectedChunkIndex
→ E_QMAP03_CHUNK_REPLAY_FORBIDDEN

lease.chunkIndex > expectedChunkIndex
→ E_QMAP03_CHUNK_SKIP_FORBIDDEN

matching index with mismatched range, plan, generation, or epoch
→ E_QMAP03_CHUNK_ORDER_MISMATCH
```

Recording, handoff creation, and `queue.submit` return do not advance the cursor. Cursor advancement requires an authority-issued completion proof binding operation, plan, chunk, window range, slot ID, submitted generation, completed generation, encoder identity, submission sequence, and device epoch.

```text
completedSlotGeneration
= submittedSlotGeneration + 1
```

The QSR03B arena generation must already equal the completed generation. Device-loss recovery starts from chunk zero with a fresh plan and arena.

## 4. Exact window layout

QSR03C preserves the QSR03A profile without reinterpretation:

```text
window             = 64 × 64
stride             = 32 × 32
Hann profile       = periodic
Hann denominator   = 64
plane count        = 1
window order       = plane-major-row-major
edge policy        = reject-no-padding
```

For local workgroup `localWindow`:

```text
globalWindow = chunk.windowBase + localWindow
gridX        = globalWindow mod globalGridWidth
gridY        = floor(globalWindow / globalGridWidth)
windowOriginX = gridX × 32
windowOriginY = gridY × 32
```

For each lane and iteration:

```text
linearSample = lane + iteration × 256
localX       = linearSample mod 64
localY       = floor(linearSample / 64)
sourceX      = windowOriginX + localX
sourceY      = windowOriginY + localY
```

One workgroup owns one window. The workgroup has 256 invocations. Each invocation processes sixteen samples, covering exactly 4,096 samples with no duplication and no omission.

Host validation proves every admitted sample lies within the Final EWA descriptor. The shader contains a defensive bound failure path, but never clamps or pads coordinates.

## 5. Canonical extraction shader

```text
WGSL asset
= app/legacy-runtime/core/compute/qmap_webgpu/shaders/final_ewa_periodic_hann_window_chunk_qsr03.wgsl

workgroup size
= 256 × 1 × 1

workgroups per window
= 1

dispatch
= dispatchWorkgroups(localWindowCount, 1, 1)
```

Required physical device limits:

```text
maxComputeInvocationsPerWorkgroup ≥ 256
maxComputeWorkgroupSizeX ≥ 256
maxComputeWorkgroupStorageSize ≥ shader requirement
```

Failure does not replan chunk capacity or mutate the QSR03A profile.

The canonical bind group is created once for the exact Final EWA capability and QSR03B arena:

```text
binding 0 = retained Final EWA texture_2d<f32>
binding 1 = scratchA storage read_write
binding 2 = chunkControl storage read
binding 3 = failureLocal storage read_write
binding 4 = stageParameterTable storage read
```

No sampler is required. Sampling uses exact integer `textureLoad` coordinates.

No per-chunk pipeline, bind-group layout, bind group, GPUBuffer, or GPUTexture creation is permitted.

## 6. Periodic Hann and premultiplied luma

For `n` in `[0, 63]`:

```text
hann64(n)
= 0.5 - 0.5 × cos((2π × n) / 64)

weight(x, y)
= hann64(x) × hann64(y)
```

Symmetric Hann denominator 63, Hamming, Blackman, rectangular weighting, caller tables, CPU-generated weights, edge-dependent mutation, and alpha-dependent mutation are forbidden.

Final EWA `rgba16float` values are treated as premultiplied linear RGBA. Luma is computed directly from premultiplied RGB using the QRC02 canonical coefficients:

```text
premultipliedLuma
= dot(sample.rgb, vec3(0.2126, 0.7152, 0.0722))
```

QSR03C never divides RGB by alpha, applies an alpha epsilon, reconstructs straight RGB, or multiplies luma by alpha a second time.

## 7. Weighted DC removal

For one window:

```text
weightedLumaSum
= Σ weight(x, y) × premultipliedLuma(x, y)

weightSum
= Σ weight(x, y)

weightedMean
= weightedLumaSum / weightSum

real(x, y)
= weight(x, y) × (premultipliedLuma(x, y) - weightedMean)

imag(x, y)
= positive zero
```

Each lane accumulates its sixteen samples in ascending linear-sample order. Workgroup reduction order is fixed:

```text
128 → 64 → 32 → 16 → 8 → 4 → 2 → 1
```

Every stage is separated by `workgroupBarrier()`. Lane zero publishes the shared weighted mean, followed by another barrier before output writes.

Unweighted DC, global image mean, CPU DC, float atomics, dynamic reduction order, subgroup-specific reduction, and algebraic profile rewrites are forbidden.

## 8. Local scratchA offset-zero layout

`scratchA` stores only the current chunk:

```text
sampleIndex
= localY × 64 + localX

scratchElementIndex
= localWindow × 4,096 + sampleIndex
```

The first window of every chunk begins at element zero. Global-window and `windowBase` offsets are forbidden.

One window occupies:

```text
4,096 complex f32 elements
= 4,096 × 8 bytes
= 32,768 bytes
```

For a final short chunk, only the active range is written and consumable. The unused capacity tail is not cleared, read, hashed as content, copied, or published.

The active `scratchA` range is fully overwritten, so no full scratch clear is recorded.

## 9. Failure-local contract

Before extraction, QSR03C records:

```text
commandEncoder.clearBuffer(
  failureLocal,
  0,
  localWindowCount × 4
)
```

Only the active failure range is cleared. Failure bits:

```text
bit 0 = nonfinite Final EWA sample
bit 1 = nonfinite local accumulation
bit 2 = invalid weight sum
bit 3 = defensive source-coordinate bound failure
bit 4 = nonfinite weighted output
bit 5 = chunk-control or profile mismatch
bits 6..31 = reserved zero
```

Failures use GPU `atomicOr`. Invalid samples and invalid outputs write deterministic complex positive zero and set a failure bit. This does not create a neutral product fallback. Failure remains part of the later reduction and finalization lineage. QSR03C performs no product readback.

## 10. Chunk-control binding

QSR03C writes QSR03B chunk-control record zero through the lease-bound control-writer capability:

```text
schemaVersion
chunkIndex
windowBase
localWindowCount
globalGridWidth
globalGridHeight
analysisWidth
analysisHeight
slotGeneration
deviceEpoch
flags
```

The record must match the QSR03A plan, exact chunk range, active QSR03B lease, Final EWA source capability, and current device epoch. Exactly one control write is admitted for one extraction record. Control writes are forbidden while a prior completion ticket is pending.

## 11. Command recording

QSR03C receives a branded canonical command-encoder capability. It does not create or submit an encoder.

Recorded commands, in order:

```text
1. clear active failureLocal range
2. begin compute pass
3. bind extraction pipeline
4. bind exact source+arena bind group
5. dispatch localWindowCount workgroups
6. end compute pass
```

Per chunk:

```text
compute passes added = 1
dispatches added     = 1
queue submissions    = 0
copy commands        = 0
```

QSR03C records no `copyTextureToBuffer`, `copyBufferToBuffer`, `copyBufferToTexture`, `resolveQuerySet`, `mapAsync`, readback, full scratch clear, bridge encoder, or copy-only submission.

QSR03D must consume the extraction handoff in the same encoder.

## 12. One-shot Stockham handoff

The public handoff contains metadata only:

```text
operationId
planDigest
chunkIndex
windowBase
localWindowCount
slotId
slotGeneration
encoderIdentityDigest
Final EWA identity
shader digest
extraction record digest
scratch role = scratchA
scratch layout = local-window-major-complex-f32-interleaved
runtimeEpoch
deviceEpoch
```

Private payload contains the exact active lease, private QSR03B bindings, and same encoder capability. No GPUBuffer is exposed publicly.

Only QSR03D Stockham recorder may consume the handoff, and only once. Consumer admission requires the same operation, plan, chunk, lease, slot, generation, encoder, and device epoch. Replay, arbitrary consumers, direct reduction, QMap projection, Preview, Export, Analysis Field, and diagnostics consumption are forbidden.

## 13. Extraction record

The record binds source lineage, Final EWA descriptor and actual identity, lowpass receipt, QSR03A plan and layout, exact chunk range, QSR03B arena and generation, chunk-control content digest, shader and pipeline identity, bind-group identity, encoder identity, active failure clear bytes, dispatch dimensions, scratch layout, and forbidden-path counters.

Initial status:

```text
RECORDED_NOT_YET_PHYSICALLY_COMPLETED
```

After exact fence completion proof:

```text
COVERED_BY_COMPLETED_SUBMISSION
```

The record proves command recording and later submission coverage. It is not the final QSR03 execution receipt.

## 14. No full spatial-complex atlas

The only admitted spatial-complex storage is QSR03B `scratchA`:

```text
chunkCapacity × 64 × 64 × 8 bytes
```

At reference capacity 448:

```text
14,680,064 bytes
```

The following are forbidden regardless of naming:

```text
fullSpatial
windowAtlas
globalWindowBuffer
spatialComplexOutput
allWindowSamples
contiguousExtractionOutput
compatibilitySpatialMirror
debugSpatialAtlas
```

No active scratch content may be copied into a global spatial field. QSR03D must process the local chunk directly.

## 15. No edge padding and no CPU pixel path

QSR03C admits no zero, edge-replicate, mirror, wrap, transparent, clamp-to-edge, partial-window, or source-coordinate-clamp policy.

QSR03C forbids CPU Final EWA pixel loops, `ImageData`, Canvas 2D, OffscreenCanvas extraction, pixel-sized typed arrays, CPU Hann, CPU DC, CPU luma conversion, texture readback, WebGL fallback, WASM pixel fallback, and host spatial atlases.

Permitted host writes are bounded metadata only: one 256-byte control record and immutable stage-table initialization outside the chunk loop.

## 16. Cancellation and device loss

Before recording, cancellation records nothing and releases the unsubmitted lease. After control upload but before dispatch, handoff creation is aborted and the cursor remains unchanged. If the canonical command-graph owner discards the encoder before submission, the handoff is invalidated and the unsubmitted lease is released.

After submission, QSR03B owns retirement. Cancellation waits for completion or device loss, destroys the slot, retires the source capability, and never advances to another chunk.

Device loss invalidates the Final EWA capability, bind group, outstanding handoff, and provisional extraction record. Recovery requires a fresh device, plan, arena, source capability, and chunk-zero restart.

## 17. Stable errors

QSR03C adds or consumes:

```text
E_QMAP03_REQUEST_INVALID
E_QMAP03_GEOMETRY_IDENTITY_MISMATCH
E_QMAP03_FINAL_EWA_DESCRIPTOR_MISMATCH
E_QMAP03_WINDOW_PROFILE_MISMATCH
E_QMAP03_CHUNK_ORDER_MISMATCH
E_QMAP03_CHUNK_REPLAY_FORBIDDEN
E_QMAP03_CHUNK_SKIP_FORBIDDEN
E_QMAP03_WINDOW_EXTRACTION_FAILED
E_QMAP03_FULL_SPATIAL_ATLAS_FORBIDDEN
E_QMAP03_CPU_FALLBACK_FORBIDDEN
E_QMAP03_WEBGL_FALLBACK_FORBIDDEN
E_QMAP03_CANVAS_FALLBACK_FORBIDDEN
E_QMAP03_READBACK_FORBIDDEN
E_QMAP03_SLOT_REUSE_BEFORE_FENCE
E_QMAP03_CANCELLED
E_QMAP03_DEVICE_LOST
```

No error path pads an image, returns neutral windows, replays a prior chunk, skips a chunk, falls back to QRC02 contiguous extraction, exposes partial scratch content, or marks a provisional record physically complete.

## 18. Required implementation surfaces

New TypeScript:

```text
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-final-ewa-types.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-final-ewa-capability.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-window-extraction.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-window-extraction-validation.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-window-extraction-receipt.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-window-extraction-handoff.ts
```

New legacy runtime and WGSL:

```text
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_final_ewa_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_final_ewa_capability.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_window_extraction.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/final_ewa_periodic_hann_window_chunk_qsr03.wgsl
```

Modified canonical files:

```text
app/src/boot/stable-error.ts
app/src/runtime/service-token.ts
package.json
```

Validation tools:

```text
tools/qmap-streaming-reduction-03c/fixture.mjs
tools/qmap-streaming-reduction-03c/verify-hann-dc-reference.mjs
tools/qmap-streaming-reduction-03c/verify-source-gates-144.mjs
tools/qmap-streaming-reduction-03c/run-mutants.mjs
tools/qmap-streaming-reduction-03c/gate-source.mjs
```

No generated runtime manifest is modified by QSR03C.

## 19. Source Gates

QSR03C requires exactly 144 Source Gates:

```text
S001-S016   identity, exact parent admission, and no physical claim
S017-S036   private Final EWA capability and exact descriptor lineage
S037-S056   monotonic cursor, replay/skip denial, fence-only advancement
S057-S076   exact window/grid/sample mapping and no edge padding
S077-S100   premultiplied luma, periodic Hann, deterministic weighted DC,
            local scratchA offset-zero complex output
S101-S120   exact control write, one pass, one dispatch, zero submissions,
            same-encoder one-shot handoff, provisional record state
S121-S144   no full atlas, no allocation churn, no CPU/Canvas/WebGL/WASM/readback,
            failure handling, cancellation, device-loss restart, cleanup
```

Source completion requires 144 of 144 gates PASS.

## 20. Negative-control mutants

Exactly 48 mutants must be detected:

```text
M001 caller-created texture admitted
M002 original source geometry used
M003 descriptor check removed
M004 lowpass receipt check removed
M005 source capability rebound to another arena
M006 raw texture exposed
M007 capability structured-cloned
M008 cursor starts at chunk one
M009 completed chunk replayed
M010 expected chunk skipped
M011 mismatched window base admitted
M012 mismatched local count admitted
M013 slot generation ignored
M014 cursor advances after recording
M015 cursor advances after submit return
M016 arbitrary promise accepted as completion proof
M017 global-window scratch offset used
M018 full spatial atlas allocated
M019 scratch copied to global spatial field
M020 window width changed to 32
M021 stride changed to 64
M022 Hann denominator changed to 63
M023 rectangular window substituted
M024 coordinates clamped
M025 zero edge padding added
M026 premultiplied RGB unpremultiplied
M027 alpha multiplied twice
M028 weighted DC replaced by unweighted mean
M029 global image mean subtracted
M030 reduction order changed
M031 barrier removed
M032 atomic float DC introduced
M033 imaginary output made nonzero
M034 unused tail read
M035 active failure clear removed
M036 entire failure tail consumed
M037 two extraction dispatches recorded
M038 separate encoder created
M039 separate submission added
M040 bind group created per chunk
M041 parameter buffer allocated per chunk
M042 Final EWA pixels read on CPU
M043 Canvas fallback added
M044 WebGL fallback added
M045 texture readback added
M046 raw scratchA exposed
M047 handoff consumed twice
M048 device-loss recovery resumes mid-stream
```

Patch-ID string checks alone do not count as detection.

## 21. Physical Gates

Physical QSR03C qualification requires 48 gates on packaged Windows x64 Electron:

```text
P001-P010 packaged WGSL identity, physical descriptor, pipeline and bind-group
          admission, workgroup limits, no validation error
P011-P020 first/middle/final mapping, one pass and dispatch, offset-zero write,
          final-tail non-touch, no global spatial allocation
P021-P034 CPU-f64 qualification parity for constant, low-alpha, gradients,
          impulses, checkerboard, sinusoids, positive-zero imaginary output,
          ULP ceiling, DC residual, and failure mask
P035-P042 physical replay/skip denial, fence-only cursor advancement,
          same-encoder one-shot handoff, zero buffer and bind-group churn
P043-P048 cancellation, discarded encoder, submitted cancellation,
          device loss, chunk-zero recovery, sealed physical receipt
```

All physical gates remain pending at source bake.

## 22. Package scripts

```json
{
  "scripts": {
    "verify:qmap-streaming-03c:source": "node tools/qmap-streaming-reduction-03c/verify-source-gates-144.mjs",
    "verify:qmap-streaming-03c:mutants": "node tools/qmap-streaming-reduction-03c/run-mutants.mjs",
    "verify:qmap-streaming-03c:reference": "node tools/qmap-streaming-reduction-03c/verify-hann-dc-reference.mjs",
    "gate:qmap-streaming-03c": "node tools/qmap-streaming-reduction-03c/gate-source.mjs"
  }
}
```

## 23. Bake and repository policy

The GitHub commit contains this specification file only.

The separately delivered code ZIP contains application source, Final EWA capability, cursor, extraction recorder, WGSL, handoff, stable-error and service-token integration, validation tools, and package scripts.

The ZIP excludes this specification, generated reports, receipts, artifacts, generated manifests, patch files, logs, nested ZIPs, temporary typecheck configs, fixture output, and Git metadata.

## 24. Completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03C_FINAL_EWA_CURSOR_BOUND_CHUNK_EXTRACTION_LOCAL_SCRATCHA_OFFSET_ZERO_NO_FULL_SPATIAL_ATLAS_AWAITING_LOCAL_STOCKHAM_03D
```

Required facts:

- 144 of 144 Source Gates PASS;
- 48 of 48 mutants detected;
- Final EWA raw texture and view remain private;
- source capability binds one operation, plan, arena, and device epoch;
- descriptor and lowpass lineage exactly match QSR03A;
- chunk order is monotonic and fence-bound;
- replay and skip fail closed;
- one 256-thread workgroup owns one 64 × 64 window;
- each lane processes sixteen samples;
- periodic Hann denominator remains 64;
- premultiplied RGB is never unpremultiplied;
- weighted DC reduction order is deterministic;
- active windows write local scratchA from offset zero;
- final short tail is not consumed;
- active failure range is cleared and remains GPU-resident;
- extraction adds one pass, one dispatch, zero queue submissions, and zero copies;
- handoff is metadata-only, same-encoder, and one-shot;
- no full spatial-complex atlas exists;
- no edge padding or coordinate clamp exists;
- no CPU, Canvas, WebGL, WASM pixel, or readback path exists;
- QRC02 product routing remains unchanged;
- physical gates remain pending.

Prohibited claims:

```text
QMAP_STOCKHAM_PASS
QMAP_FREQUENCY_FIELD_PASS
QMAP_REDUCTION_PASS
QMAP_PUBLICATION_PASS
QMAP_STREAMING_RUNTIME_PASS
QMAP_4K_PRODUCT_PASS
QMAP_8K_PRODUCT_PASS
PHYSICAL_QMAP_STREAMING_REDUCTION_03_PASS
```

## 25. Next patch boundary

```text
TDT-QMAP-STREAMING-REDUCTION-03D

Chunk-Local Stockham Row Stages /
Forward Transpose /
Column Stockham Stages /
Transpose-Back /
Explicit Final Natural-Row-Major Frequency Slot /
Same-Encoder Extraction Handoff Consumption /
Local Window Offset-Zero Frequency Layout /
No Global Frequency Buffer /
No Frequency Copy /
No Additional Queue Submission Seal
```

QSR03D consumes the one-shot QSR03C handoff, same encoder identity, active QSR03B lease, `scratchA`, `scratchB`, `transposeA`, `transposeB`, local window count, generation, plan digest, and device epoch without reinterpretation.

## 26. Final seal

```text
A streaming extractor is not a loop that repeatedly fills a global atlas.
It is a cursor-bound claim over one retained texture, one exact chunk,
one leased slot generation, and one command encoder.

QSR03C maps each global window to exact Final EWA coordinates, preserves
premultiplied luma, removes weighted DC under the canonical periodic-Hann
profile, and writes only the current chunk into scratchA from local offset zero.

The cursor does not move because recording ended. It moves only after queue
authority proves that the submitted generation completed.

No edge is padded. No pixel crosses the host. No full spatial atlas survives
behind a friendlier name. No arbitrary consumer receives the scratch buffer.
Only the same-encoder Stockham stage may consume the one-shot handoff.
```
