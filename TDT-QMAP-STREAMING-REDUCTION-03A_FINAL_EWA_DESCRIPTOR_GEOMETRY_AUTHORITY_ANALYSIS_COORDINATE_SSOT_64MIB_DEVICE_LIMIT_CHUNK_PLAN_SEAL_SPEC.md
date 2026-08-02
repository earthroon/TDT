# TDT-QMAP-STREAMING-REDUCTION-03A

## Final EWA Descriptor Geometry Authority / Analysis Width·Height Coordinate SSOT / Periodic Hann 64·Stride32 Layout / 64 MiB Authority-Owned Transient Budget / Device-Limit-Bounded Chunk Capacity / Deterministic Window Range Partition / 4K·8K Arithmetic Plan Admission / Stable Streaming Error Contract / No Caller Plan Override Seal

## 0. Document identity

```text
Patch ID
= TDT-QMAP-STREAMING-REDUCTION-03A

Short ID
= QSR03A

Parent patch
= TDT-QMAP-RUNTIME-CLOSURE-02

Umbrella patch
= TDT-QMAP-STREAMING-REDUCTION-03

Parent source state
= SOURCE_BAKED_QMAP_RUNTIME_CLOSED_CONTIGUOUS_PROFILE_AWAITING_STREAMING_03_AND_PHYSICAL_GPU

Specification state
= SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03A is the planning and authority floor of QSR03. It fixes the sampled geometry, immutable window layout, authority-owned transient budget, physical device-limit snapshot, deterministic chunk capacity, exact window partition, digest lineage, and stable errors before any streaming GPU resource is allocated.

QSR03A does not allocate GPU resources, encode commands, submit a queue, publish an Analysis field, install the QSR03 bridge, or change the active QRC02 product route.

## 1. Problem statement

QRC02 closes the invocation path from retained Final EWA to spectral reduction and QMap publication, but it still derives its window layout from caller-carried source geometry and admits only a contiguous spatial/frequency profile.

```text
Original source geometry
→ QRC02 window layout
→ full spatial-complex field
→ chunked dispatches
→ full frequency-complex field
→ full power field
```

A resample operation may produce a Final EWA texture whose actual width and height differ from the original input. In that case, original source dimensions are lineage evidence, not the coordinate authority for sampling the retained Final EWA texture.

Dispatch chunking also does not create bounded residency while full spatial, frequency, or power atlases remain mandatory. Before QSR03B can allocate one bounded slot, QSR03A must produce one deterministic plan describing exactly how many windows exist and how many windows the admitted device and budget permit per chunk.

## 2. Authority decision

```text
planningAuthorityId
= dadum.qmap-streaming-plan-authority.qsr03

planId
= tdt.qmap.streaming-plan.qsr03.v1

implementationId
= tdt-qmap-window-chunk-stockham-reduction-webgpu-v1

windowProfileId
= tdt.qmap.window.periodic-hann-64-stride32.v1

transientBudgetProfileId
= dadum.gpu.analysis-transient-budget.qmap-streaming-64mib.v1
```

The planning authority trusts only:

- the retained Final EWA descriptor and actual identity owned by Runtime Composition;
- the source surface and revision bound to that retained texture;
- the GPU Authority device identity, epoch, and immutable device-limit snapshot;
- the canonical window-profile registry;
- the canonical transient-budget profile registry.

Renderer requests, URL state, project files, user preferences, environment variables, diagnostic controls, legacy objects, and imported image metadata are not planning authorities.

QSR03A reserves the QSR03 runtime identities but does not install `window.__DADUM_QMAP_STREAMING_BRIDGE__`. Product routing remains on QRC02 until the streaming executor, arena, command graph, receipts, and publication path exist.

## 3. Trust boundary

The caller may provide only operation and original-source lineage:

```ts
interface QMapStreamingPlanRequestQsr03a {
  readonly operationId: string
  readonly sourceSurfaceId: string
  readonly sourceRevision: number
  readonly originalSourceWidth: number
  readonly originalSourceHeight: number
}
```

The authority context provides runtime and GPU state:

```ts
interface QMapStreamingPlanningAuthorityContextQsr03a {
  readonly runtimeEpoch: number
  readonly deviceEpoch: number
  readonly deviceIdentityDigest: string
  readonly sourceSurfaceId: string
  readonly sourceRevision: number
  readonly finalEwaDescriptor: FinalEwaTextureDescriptorQsr03a
  readonly finalEwaActualIdentityDigest: string
  readonly lowpassReceiptDigest: string
  readonly deviceLimits: QMapDeviceLimitSnapshotQsr03a
  readonly transientBudgetProfile: QMapTransientBudgetProfileQsr03a
  readonly windowProfile: QMapWindowProfileQsr03a
}
```

The following caller fields are forbidden even when their values equal canonical values:

```text
analysisWidth / analysisHeight
qmapOutputWidth / qmapOutputHeight
windowWidth / windowHeight
strideX / strideY
planeCount / windowOrder / windowProfileId
transientBudgetBytes / transientBudgetProfileId
chunkWindowAlignment / ringSlotCount
chunkCapacity / chunkCount / chunks
planId / planDigest
maxBufferSize / maxStorageBufferBindingSize
maxComputeWorkgroupsPerDimension
```

Authority is determined by ownership, not value equality. A caller cannot gain planning authority by guessing the correct value.

## 4. Final EWA descriptor geometry authority

The actual retained Final EWA descriptor is the sampling geometry SSOT.

```text
originalSourceWidth / originalSourceHeight
= lineage evidence only

analysisWidth
= retained Final EWA descriptor.width

analysisHeight
= retained Final EWA descriptor.height

qmapOutputWidth
= analysisWidth

qmapOutputHeight
= analysisHeight
```

Canonical descriptor:

```ts
interface FinalEwaTextureDescriptorQsr03a {
  readonly schemaId: "tdt.qmap.final-ewa-descriptor.qsr03a.v1"
  readonly width: number
  readonly height: number
  readonly depthOrArrayLayers: 1
  readonly dimension: "2d"
  readonly mipLevelCount: 1
  readonly sampleCount: 1
  readonly format: "rgba16float"
  readonly usage: number
  readonly descriptorDigest: string
}
```

The descriptor digest binds all descriptor fields. The plan additionally binds source surface, source revision, runtime epoch, device epoch, Final EWA actual identity, and lowpass receipt digest.

The following are forbidden:

- using original source dimensions as analysis dimensions;
- inferring a scale between source and Final EWA geometry;
- silently clamping geometry to a device limit;
- silently changing QMap output dimensions;
- substituting nominal output dimensions for a missing descriptor;
- edge padding an image smaller than the admitted window;
- reusing a stale descriptor from another revision or device epoch.

## 5. Canonical window layout

```text
profileId
= tdt.qmap.window.periodic-hann-64-stride32.v1

window
= 64 × 64

stride
= 32 × 32

overlap
= 50 percent

planeCount
= 1

windowOrder
= plane-major-row-major

edgePolicy
= reject-no-padding

hannProfile
= periodic
```

Images smaller than 64 in either dimension fail explicitly:

```text
analysisWidth < 64
or
analysisHeight < 64

→ E_QMAP03_IMAGE_TOO_SMALL
```

Grid formula:

```text
gridWidth
= floor((analysisWidth - 64) / 32) + 1

gridHeight
= floor((analysisHeight - 64) / 32) + 1

windowCount
= gridWidth × gridHeight
```

Global order:

```text
globalWindowIndex
= gridY × gridWidth + gridX

gridX
= globalWindowIndex mod gridWidth

gridY
= floor(globalWindowIndex / gridWidth)
```

The last admitted window must remain inside the Final EWA descriptor:

```text
(gridWidth - 1) × 32 + 64 ≤ analysisWidth
(gridHeight - 1) × 32 + 64 ≤ analysisHeight
```

Unused right and bottom texels are not converted into padded or partial windows.

## 6. Authority-owned transient budget

```text
transientBudgetProfileId
= dadum.gpu.analysis-transient-budget.qmap-streaming-64mib.v1

transientBudgetBytes
= 67,108,864

fixedSlotBytes
= 8,192

chunkWindowAlignment
= 8

ringSlotCount
= 1
```

The budget profile is immutable and retrieved from GPU Authority profile state. Missing or digest-invalid profiles fail closed. There is no default reconstruction and no caller override.

QSR03A plans one slot only. Multiple ring slots, overlapping cold jobs, and multiplied transient budgets are outside this patch.

## 7. Canonical byte model

For one 64 × 64 window:

```text
complexBytesPerWindow
= 64 × 64 × 8
= 32,768

powerBytesPerWindow
= 64 × 64 × 4
= 16,384

firstPartialCount
= ceil(4096 / 256)
= 16

partialRecordBytes
= 48

partialPingPongBytesPerWindow
= 16 × 48 × 2
= 1,536

failureBytesPerWindow
= 4

complexScratchCount
= 4
```

The four complex buffers reserved by the model are:

```text
scratchA
scratchB
transposeA
transposeB
```

Total:

```text
transientBytesPerWindow
= 4 × 32,768 + 16,384 + 1,536 + 4
= 148,996 bytes
```

Slot bytes:

```text
slotBytes(capacity)
= 8,192 + capacity × 148,996
```

The byte model is conservative and immutable in QSR03A. It may not silently remove power, a partial ping-pong buffer, or one complex scratch buffer to increase capacity.

## 8. Device-limit snapshot

Required immutable limits:

```ts
interface QMapDeviceLimitSnapshotQsr03a {
  readonly schemaId: "tdt.qmap.device-limits.qsr03a.v1"
  readonly maxBufferSize: number
  readonly maxStorageBufferBindingSize: number
  readonly maxComputeWorkgroupsPerDimension: number
  readonly adapterIdentityDigest: string
  readonly deviceIdentityDigest: string
  readonly deviceEpoch: number
  readonly limitsDigest: string
}
```

All numerical limits must be positive safe integers. The snapshot identity and epoch must match the authority context. One plan uses one immutable snapshot and cannot refresh limits midway through derivation.

## 9. Device-limit-bounded chunk capacity

```text
byBudget
= floor((transientBudgetBytes - fixedSlotBytes)
        / transientBytesPerWindow)

byRowDispatch
= floor(maxComputeWorkgroupsPerDimension / windowHeight)

byColumnDispatch
= floor(maxComputeWorkgroupsPerDimension / windowWidth)

bindingLimit
= min(maxBufferSize, maxStorageBufferBindingSize)

byComplexBinding
= floor(bindingLimit / complexBytesPerWindow)

byPowerBinding
= floor(bindingLimit / powerBytesPerWindow)

byPartialBinding
= floor(bindingLimit / partialPingPongBytesPerWindow)
```

Raw capacity:

```text
rawCapacity
= min(windowCount,
      byBudget,
      byRowDispatch,
      byColumnDispatch,
      byComplexBinding,
      byPowerBinding,
      byPartialBinding)
```

Alignment:

```text
alignedCapacity
= floor(rawCapacity / 8) × 8
```

Selection:

```text
if alignedCapacity > 0
  chunkCapacity = alignedCapacity
else if rawCapacity ≥ 1
  chunkCapacity = 1
else
  fail E_QMAP03_CHUNK_PLAN_INVALID
```

The one-window exception preserves the umbrella QSR03 contract. A raw capacity between one and seven does not relax the alignment profile; it selects capacity one.

No retry loop may mutate the budget, alignment, window profile, scratch count, or device limits to force admission.

## 10. Deterministic window range partition

```text
chunkCount
= ceil(windowCount / chunkCapacity)
```

For chunk index `i`:

```text
windowBase
= i × chunkCapacity

remaining
= windowCount - windowBase

localWindowCount
= min(chunkCapacity, remaining)

windowEndExclusive
= windowBase + localWindowCount
```

Invariants:

```text
chunks[0].windowBase = 0
chunks[i].windowEndExclusive = chunks[i + 1].windowBase
chunks[last].windowEndExclusive = windowCount
0 < localWindowCount ≤ chunkCapacity
non-final localWindowCount = chunkCapacity
```

One global window has exactly one chunk owner:

```text
ownerChunk(globalWindowIndex)
= floor(globalWindowIndex / chunkCapacity)
```

QSR03A partitions windows, never frequency bins. No window is split across chunks and no floating-point accumulation crosses a chunk boundary.

## 11. Plan ABI and digest lineage

The plan contains:

- patch, plan, implementation, and authority identities;
- operation, source surface, and source revision;
- runtime and device epoch;
- device identity;
- Final EWA descriptor and actual identity digests;
- lowpass receipt digest;
- original and analysis geometry;
- window layout and layout digest;
- canonical window and budget profiles;
- immutable device-limit snapshot;
- byte model;
- every capacity bound and limiting factor;
- selected capacity;
- exact chunk list and range digests;
- peak transient bytes;
- persistent result estimate;
- final plan digest.

The canonical digest profile uses repository SHA-256 and canonical key ordering. Digests exclude wall-clock time, process ID, random UUID, object address, insertion order, logs, stack traces, and absolute paths.

The persistent estimate records planning evidence only. It does not claim allocation:

```text
entropyBytes     = windowCount × 8
orientationBytes = windowCount × 16
phaseBytes       = windowCount × 16
summaryBytes     = windowCount × 16
QMap bytes       = analysisWidth × analysisHeight × 8
Final EWA bytes  = analysisWidth × analysisHeight × 8
```

## 12. Reference arithmetic admission

Reference fixture limits:

```text
maxBufferSize
= 268,435,456

maxStorageBufferBindingSize
= 134,217,728

maxComputeWorkgroupsPerDimension
= 65,535
```

Budget arithmetic:

```text
byBudget
= floor((67,108,864 - 8,192) / 148,996)
= 450

alignedCapacity
= floor(450 / 8) × 8
= 448

slotBytes(448)
= 8,192 + 448 × 148,996
= 66,758,400
```

### 1080p

```text
analysis geometry = 1920 × 1080
grid              = 59 × 32
windowCount       = 1,888
chunkCapacity     = 448
chunkCount        = 5
final chunk       = [1,792, 1,888)
final count       = 96
```

### 4K UHD

```text
analysis geometry = 3840 × 2160
grid              = 119 × 66
windowCount       = 7,854
chunkCapacity     = 448
chunkCount        = 18
final chunk       = [7,616, 7,854)
final count       = 238
```

### 8K UHD

```text
analysis geometry = 7680 × 4320
grid              = 239 × 134
windowCount       = 32,026
chunkCapacity     = 448
chunkCount        = 72
final chunk       = [31,808, 32,026)
final count       = 218
```

`4K_8K_PLAN_ADMITTED` means source arithmetic and deterministic resource planning are admitted when the device can admit the retained Final EWA and QMap textures. It does not claim physical execution, performance, residency plateau, or universal adapter compatibility.

## 13. Stable error contract

QSR03A owns these QSR03 errors:

```text
E_QMAP03_REQUEST_INVALID
E_QMAP03_GEOMETRY_IDENTITY_MISMATCH
E_QMAP03_FINAL_EWA_DESCRIPTOR_MISMATCH
E_QMAP03_WINDOW_PROFILE_MISMATCH
E_QMAP03_IMAGE_TOO_SMALL
E_QMAP03_BUDGET_PROFILE_MISSING
E_QMAP03_BUDGET_CALLER_OVERRIDE_FORBIDDEN
E_QMAP03_CHUNK_PLAN_INVALID
```

Errors are fail-closed and carry a stable code plus structured details. QSR03A does not fall back to:

- QRC02 contiguous execution;
- original-source geometry;
- a smaller window or larger stride;
- a larger transient budget;
- CPU, WebGL, Canvas, WASM, or host spill;
- a previous-revision plan;
- neutral QMap or effect disable.

## 14. Required implementation surfaces

New source files:

```text
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-types.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-plan.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-validation.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_contract.mjs
```

Modified source files:

```text
app/src/boot/stable-error.ts
app/src/runtime/analysis/spectral/qmap-runtime-closure-02-types.ts
app/src/runtime/service-token.ts
package.json
```

Validation tools may be included in the delivered code ZIP. QSR03A does not modify generated runtime manifests, producer inventories, semantic registries, active graph manifests, WGSL assets, runtime composition, or QRC02 coordinator routing.

## 15. Source Gates

QSR03A owns 64 mandatory Source Gates.

### Geometry authority: QSR03A-S001 through QSR03A-S032

- original source geometry is lineage-only;
- Final EWA descriptor is analysis geometry SSOT;
- analysis and QMap output dimensions are exact positive integers;
- identity and descriptor mismatches fail closed;
- 64 × 64 periodic-Hann and 32 × 32 stride remain immutable;
- plane count and window order remain canonical;
- grid formulas and checked window-count multiplication are exact;
- images smaller than the window fail explicitly;
- edge padding and implicit scale are absent;
- layout records bind analysis geometry, window profile, source revision, and device epoch;
- global index and inverse grid mapping are exact;
- last-window bounds and projection centers remain in the same layout;
- 1080p, 4K, and 8K geometry fixtures pass.

### Streaming plan: QSR03A-S033 through QSR03A-S064

- plan and budget profile identities are exact;
- caller override is denied;
- budget, fixed bytes, alignment, and ring-slot count are exact;
- all byte-model constants are exact;
- device limits are positive safe integers;
- all seven capacity bounds are computed and the minimum is selected;
- aligned capacity never exceeds raw capacity;
- the one-window exception is explicit and zero capacity fails;
- chunk count uses checked ceiling division;
- ranges cover every window with zero gap and zero overlap;
- final chunk arithmetic is exact;
- plan digest binds every device limit and range;
- identical trusted inputs produce identical plan digests;
- 1080p = 1,888 windows / 5 chunks;
- 4K = 7,854 windows / 18 chunks;
- 8K = 32,026 windows / 72 chunks.

## 16. Negative-control mutants

Exactly 22 negative controls must be detected:

```text
QSR03A-M001 original geometry promoted to analysis authority
QSR03A-M002 QMap output geometry allowed to diverge
QSR03A-M003 Final EWA descriptor verification removed
QSR03A-M004 window width changed to 32
QSR03A-M005 stride changed to 64
QSR03A-M006 image smaller than window admitted
QSR03A-M007 silent edge padding admitted
QSR03A-M008 source revision removed from layout identity
QSR03A-M009 periodic-Hann identity changed
QSR03A-M010 non-canonical plane count admitted
QSR03A-M011 caller transient budget accepted
QSR03A-M012 budget doubled without profile revision
QSR03A-M013 ring-slot count changed to two
QSR03A-M014 eight-window alignment removed
QSR03A-M015 power bytes omitted
QSR03A-M016 partial bytes omitted
QSR03A-M017 one complex scratch buffer omitted
QSR03A-M018 row-dispatch limit ignored
QSR03A-M019 column-dispatch limit ignored
QSR03A-M020 storage-binding limit ignored
QSR03A-M021 max-buffer-size limit ignored
QSR03A-M022 zero chunk capacity admitted
```

A negative control cannot be detected only by checking the patch ID string.

## 17. Explicit non-goals

QSR03A does not perform:

- GPUBuffer or GPUTexture allocation;
- one-slot arena construction;
- Final EWA streaming capability lifecycle;
- chunk-local WGSL extraction;
- Stockham FFT execution;
- power normalization or partial reduction;
- compact-field scatter;
- final-chunk QMap projection;
- command encoding, queue submission, or fence handling;
- multi-submission receipts;
- global cold FIFO or warm-promise sharing;
- producer promotion or contiguous producer demotion;
- Analysis Field publication or EFC lineage changes;
- cancellation execution or device-loss recovery;
- response semantic correction;
- cross-producer publication atomicity;
- physical WebGPU qualification.

## 18. Repository and package boundary

The GitHub commit for this patch contains this specification file only.

The implementation is delivered separately as a code ZIP. The GitHub specification commit excludes source code, generated artifacts, bake receipts, reports, patch files, logs, ZIPs, and manifests.

The code ZIP must not contain newly generated bake artifacts or publication manifests. Existing parent runtime files that are unchanged are not evidence of QSR03A publication or physical completion.

## 19. Completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03A_FINAL_EWA_GEOMETRY_AUTHORITY_DETERMINISTIC_4K_8K_PLAN_ADMITTED_AWAITING_SINGLE_SLOT_ARENA_03B
```

Required facts:

- 64 of 64 Source Gates PASS;
- 22 of 22 negative controls detected;
- Final EWA descriptor owns analysis coordinates;
- original source geometry is lineage-only;
- Periodic Hann 64 × 64 and stride 32 × 32 are immutable;
- 64 MiB budget is authority-owned and caller override is denied;
- transient bytes per window equal 148,996;
- raw budget capacity equals 450 and selected aligned capacity equals 448;
- 1080p, 4K, and 8K reference plans match exactly;
- chunk partitions contain no gaps or overlaps;
- identical trusted inputs produce identical plan digests;
- QRC02 product routing remains unchanged;
- no GPU execution or physical performance pass is claimed.

Prohibited completion claims:

```text
QMAP_STREAMING_RUNTIME_PASS
PHYSICAL_QMAP_STREAMING_PASS
QMAP_4K_PRODUCT_PASS
QMAP_8K_PRODUCT_PASS
QSR03_COMPLETE
```

## 20. Next patch boundary

```text
TDT-QMAP-STREAMING-REDUCTION-03B

Single Streaming Slot Arena /
Capacity-Sized Complex Scratch Quartet /
Chunk-Local Power and Partial Buffers /
Immutable Parameter Storage /
Fence-Bound Slot Generation /
No Allocation Inside Chunk Loop /
Cancellation-Safe Disposal /
Device-Epoch Arena Invalidation /
Transient Resource Non-Publication Seal
```

QSR03B consumes without reinterpretation:

```text
chunkCapacity
peakTransientBytes
byteModel
budgetProfile
deviceLimits
chunks
planDigest
runtimeEpoch
deviceEpoch
```

If the arena requires more bytes than QSR03A planned, it must fail and require a separately reviewed plan-profile revision. It may not mutate capacity or budget silently.

## 21. Final seal

```text
QMap streaming does not begin with a GPUBuffer allocation.
It begins by deciding, under one authority, which texture is sampled,
how many windows exist, how much memory one window costs,
and which exact physical limits bound one reusable slot.

QSR03A removes coordinate authority from original source geometry
and assigns it to the actual retained Final EWA descriptor.
It removes planning authority from callers and assigns it to the
intersection of an immutable 64 MiB profile and one device-limit snapshot.

Only after that plan is deterministic may QSR03B allocate the slot,
QSR03C extract a chunk, and later patches execute FFT, reduction,
publication, and physical qualification.
```
