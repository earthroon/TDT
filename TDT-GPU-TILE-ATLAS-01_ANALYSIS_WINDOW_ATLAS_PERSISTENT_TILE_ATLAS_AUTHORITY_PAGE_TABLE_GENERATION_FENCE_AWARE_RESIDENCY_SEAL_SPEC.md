# TDT-GPU-TILE-ATLAS-01

## Analysis Window Atlas / Persistent Tile Atlas Authority / Page Table·Generation·Fence-aware Residency Seal

**Patch state:** `SPEC_DEFINED_UNBAKED`  
**Parent baseline:** `TDT-QWAVE-PHASE-03_SOURCE_BAKED_AWAITING_PACKAGED_GPU`  
**Canonical resource class:** `tdt.gpu.tile-atlas.persistent.v1`  
**Canonical service:** `dadum.runtime.gpu-tile-atlas`  
**Implementation ID:** `tdt-gpu-tile-atlas-authority-v1`

---

# 1. 목적

이 패치는 분석 window를 여러 job 사이에서 GPU에 유지할 수 있는 persistent tile residency 계층을 정의한다.

현재 저장소에는 `atlas`라는 이름을 가진 고정 4×4 상수, 빈 builder, placeholder shader, WebGL texture cache, LUT bundle, codec metadata가 함께 존재한다. 이들은 page table, slot generation, pin, fence, eviction, device epoch 소유권을 갖지 않으므로 persistent residency로 간주할 수 없다.

본 패치는 다음을 하나의 권한 시스템으로 봉인한다.

1. analysis window tile identity,
2. device-epoch-scoped persistent GPU page allocation,
3. virtual tile → physical page/slot page table,
4. virtual generation·slot generation·page-table generation,
5. write reservation과 read pin,
6. queue submission과 completion fence에 결속된 residency,
7. deterministic budget admission과 eviction,
8. resident tile에서 bounded contiguous window batch를 GPU-only로 materialize하는 경로,
9. source·device·layout·semantic identity가 다른 tile의 조용한 재사용 금지,
10. device loss와 runtime shutdown에서 정확한 무효화·폐기.

이 패치는 Atlas를 이미지 품질 효과나 새로운 분석 알고리즘으로 취급하지 않는다. Atlas는 **동일한 canonical GPU 분석 입력을 재사용하기 위한 residency 계층**이다.

---

# 2. 확정·추정·판단불가

## 2.1 확정

- Truth-00 registry에는 `tdt.gpu.tile-atlas.persistent.v1` resource class가 이미 예약돼 있다.
- 현재 `app/legacy-runtime/atlas/`의 `buildQualityAtlas()`는 비어 있고 sampler 파일은 placeholder다.
- SQ02는 `tdt.analysis.spectral.window-spatial-complex.v1`의 contiguous `complex-f32-interleaved` GPUBuffer를 입력으로 요구한다.
- Analysis Field Authority는 semantic publication·generation·pin·device epoch를 소유한다.
- Surface Registry는 GPU resource의 물리 소유와 byte residency accounting을 수행한다.
- GPU Authority는 단일 device identity와 device epoch를 소유한다.

## 2.2 추정하지 않는 항목

- 브라우저가 제공하지 않는 실제 VRAM 여유량,
- vendor scheduler의 동시 실행 상태,
- GPU cache occupancy,
- queue 내부의 세부 timeline semaphore,
- Atlas hit가 항상 성능 향상으로 이어진다는 주장.

## 2.3 물리 검증 전 판단불가

- 실제 adapter에서의 장기 memory plateau,
- page-table update와 consumer dispatch의 물리적 parity,
- packaged Electron relaunch 후 leak-free 재생성,
- 실제 workload에서의 hit rate와 latency 이득.

---

# 3. 범위

## 3.1 포함

- `GpuTileAtlasAuthorityService` 신규 도입
- buffer-backed complex analysis-window pool v1
- CPU control-plane shadow page table
- GPU execution mirror page-table buffer
- page와 slot의 typed ownership
- tile write transaction
- read pin과 read-fence lifecycle
- deterministic eviction
- resident tiles → contiguous window batch materialization
- Atlas residency receipt와 execution ledger
- legacy Atlas 이름의 역할 재분류
- zero intermediate payload readback
- source/mock/physical gate

## 3.2 제외

- source image에서 Hann window를 추출하는 SQ01 알고리즘
- FFT, spectral reduction, Hannakairo, Q-wave 재계산
- texture-array 기반 다형식 Atlas
- mip generation
- compression
- vendor sparse texture 또는 tiled resource API
- disk persistence
- device loss 뒤 payload 자동 복구
- CPU pixel cache
- WebGL Atlas
- quality LUT 생성
- full-frame cache를 tile atlas라고 재명명하는 작업

SQ01이 아직 source-baked되지 않았으므로, 본 패치의 canonical ingest는 **이미 존재하는 `window-spatial-complex` GPU field를 persistent page로 복사하는 경로**부터 승인한다. 향후 SQ01 direct writer는 동일 Authority의 writer registration을 통해 추가한다.

---

# 4. SSOT와 상태 귀속 위치

| 상태 | 단일 소유자 | 금지되는 중복 소유 |
|---|---|---|
| semantic·source revision·Analysis Field generation | Analysis Field Authority | Atlas가 Analysis semantic handle을 자체 발급 |
| virtual tile mapping·slot state·eviction order | Tile Atlas Authority | producer별 Map 또는 legacy global cache |
| GPU page/page-table buffer 물리 소유·byte ledger | Surface Registry | Atlas와 caller의 이중 destroy |
| device·queue·device epoch | GPU Authority | raw `navigator.gpu` 재요청 |
| shader digest | Runtime Asset Authority | inline unsealed WGSL |
| deterministic sequence | Deterministic Sequence Service 또는 Authority monotonic sequence | `Date.now()`·`Math.random()` |

## 4.1 Control-plane SSOT

Tile Atlas Authority의 CPU shadow page table이 residency control-plane SSOT다. GPU page-table buffer는 execution mirror이며, GPU에서 다시 읽어 CPU 상태를 복원하지 않는다.

## 4.2 Semantic SSOT

Atlas tile은 Analysis Field가 아니다. tile handle은 residency handle이며 semantic truth를 새로 만들지 않는다. 기존 consumer에 전달하려면 materializer가 contiguous GPUBuffer를 만들고 Analysis Field Authority에 `tdt.analysis.spectral.window-spatial-complex.v1`으로 출판해야 한다.

## 4.3 Physical ownership

Atlas page와 page-table GPUBuffer는 Surface Registry에 `gpu-buffer`로 등록한다. `SurfaceAllocationClass`에는 다음 값을 추가한다.

```typescript
type SurfaceAllocationClass = Existing | 'analysis-atlas';
```

Surface Registry가 typed disposer와 physical byte ledger를 소유하고, Atlas Authority는 해당 surface ID를 보유한다. Atlas가 Surface Registry 밖에서 published page를 직접 destroy하는 것은 금지한다.

---

# 5. Resource taxonomy

## 5.1 Bounded Analysis Window Batch

```text
resource class: tdt.analysis.window-batch.v1
lifetime: one job or bounded batch
resource: contiguous GPUBuffer
eviction: not applicable
semantic publication: Analysis Field Authority
```

## 5.2 Persistent Tile Atlas

```text
resource class: tdt.gpu.tile-atlas.persistent.v1
lifetime: multiple jobs, one device epoch
resource: persistent page GPUBuffer set + page-table GPUBuffer
eviction: deterministic and fence-aware
semantic publication: forbidden directly
```

## 5.3 Initial admitted pool

V1에서 canonical admission을 허용하는 pool은 하나다.

```text
pool class: tdt.gpu.tile-atlas.pool.complex-f32-window.v1
payload semantic: tdt.analysis.spectral.window-spatial-complex.v1
payload format: complex-f32-interleaved
bytes per element: 8
coordinate space: atlas-local window
mip: none
interpolation: forbidden
```

다음 pool은 registry에 예약할 수 있지만 `future`다.

- `tdt.gpu.tile-atlas.pool.rgba16float-texture-array.future.v1`
- `tdt.gpu.tile-atlas.pool.scalar-f32-window.future.v1`
- `tdt.gpu.tile-atlas.pool.codec-metadata.future.v1`

future pool을 canonical product 경로가 요청하면 `E_TILE_ATLAS_POOL_NOT_PROMOTED`로 실패한다.

---

# 6. 서비스 구성

## 6.1 신규 파일

```text
app/src/runtime/analysis/atlas/
  gpu-tile-atlas-authority-service.ts
  gpu-tile-atlas-types.ts
  gpu-tile-atlas-profile.json
  gpu-tile-atlas-page-table.ts
  gpu-tile-atlas-key.ts
  gpu-tile-atlas-ledger.ts
  gpu-tile-atlas-receipt.ts
  gpu-tile-atlas-errors.ts
  gpu-tile-atlas-global.d.ts
  shaders/
    tile-atlas-materialize-window-batch.wgsl
    tile-atlas-page-table-validate.wgsl
    tile-atlas-fixture-generator.wgsl
    tile-atlas-reference-copy.wgsl
    tile-atlas-compare.wgsl
```

## 6.2 Service token

```typescript
SERVICE_IDS.gpuTileAtlas = 'dadum.runtime.gpu-tile-atlas';
```

## 6.3 Runtime module

```text
module id: dadum.module.gpu-tile-atlas-01-v1
depends on:
  dadum.module.gpu-authority-v1
  dadum.module.surface-lifecycle-v1
  dadum.module.analysis-field-truth-v1
  dadum.module.active-graph-v1
provides: dadum.analysis.tile-atlas.residency
owns: dadum.runtime.gpu-tile-atlas
```

Atlas는 Spectral/Hannakairo/Q-wave 알고리즘보다 먼저 boot할 수 있으나, product route는 명시적 caller가 요청할 때만 사용한다. Production Pointer는 변경하지 않는다.

---

# 7. Tile identity

## 7.1 Canonical key

```typescript
interface AtlasTileKey {
  resourceClassId: 'tdt.gpu.tile-atlas.persistent.v1';
  poolClassId: 'tdt.gpu.tile-atlas.pool.complex-f32-window.v1';
  payloadSemanticId: string;
  payloadSemanticDigest: string;
  sourceSurfaceId: string;
  sourceRevision: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceFormat: string;
  stageIndex: number | null;
  stageCount: number | null;
  windowLayoutDigest: string;
  windowIndex: number;
  planeIndex: number;
  gridX: number;
  gridY: number;
  tileWidth: number;
  tileHeight: number;
  payloadFormat: string;
  producerReceiptDigest: string;
  producerFieldSetDigest: string;
  derivationParameterDigest: string;
}
```

`tileKeyDigest = SHA-256(canonical-json(AtlasTileKey))`다.

`windowIndex`만으로 cache identity를 구성하지 않는다. source revision, layout, stage, semantic, producer receipt가 하나라도 다르면 다른 tile이다.

## 7.2 Payload digest의 의미

제품 실행 중 GPU payload byte hash를 얻기 위한 readback은 금지한다. 따라서 runtime tile identity는 producer receipt와 derivation tuple의 digest이며, 실제 byte-for-byte GPU payload hash라고 주장하지 않는다.

물리 validation fixture에서만 독립 readback comparator를 사용해 copy parity를 증명한다.

---

# 8. Generation model

다음 generation을 하나로 합치지 않는다.

| 이름 | 증가 시점 | 용도 |
|---|---|---|
| `deviceEpoch` | GPU device 재생성 | 모든 Atlas handle의 최상위 수명 |
| `atlasEpoch` | Atlas Authority initialize/rebuild | 동일 device epoch 내 Authority incarnation |
| `pageTableGeneration` | commit된 mapping transaction마다 | GPU mirror와 CPU shadow snapshot identity |
| `virtualGeneration` | virtual tile ID 재사용 또는 같은 key 재입주 | stale logical handle 차단 |
| `slotGeneration` | physical slot이 새 payload에 예약될 때 | stale physical binding 차단 |
| `pageGeneration` | page GPUBuffer 재할당 | stale page surface 차단 |

모든 generation은 unsigned 32-bit 범위에서 단조 증가한다. wrap 직전에는 재사용하지 않고 `E_TILE_ATLAS_GENERATION_EXHAUSTED`로 Atlas를 fail-closed한다.

## 8.1 Handle

```typescript
interface AtlasTileHandle {
  authorityId: 'dadum.gpu-tile-atlas-authority.gta01';
  atlasEpoch: number;
  deviceEpoch: number;
  poolId: string;
  virtualTileId: number;
  virtualGeneration: number;
  tileKeyDigest: string;
  payloadSemanticId: string;
  sourceSurfaceId: string;
  sourceRevision: number;
  windowLayoutDigest: string;
  committedPageTableGeneration: number;
  residencyReceiptDigest: string;
}
```

Handle은 physical page index와 byte offset을 공개하지 않는다. physical binding은 current read pin을 통해서만 얻는다.

---

# 9. Physical page layout

## 9.1 Page descriptor

```typescript
interface AtlasPageDescriptor {
  poolId: string;
  pageIndex: number;
  pageGeneration: number;
  tileWidth: number;
  tileHeight: number;
  bytesPerElement: 8;
  rawTileBytes: number;
  slotByteStride: number;
  slotsPerPage: number;
  pageByteLength: number;
  surfaceId: string;
  deviceEpoch: number;
}
```

```text
rawTileBytes = tileWidth × tileHeight × 8
slotByteStride = alignUp(rawTileBytes, max(256, minStorageBufferOffsetAlignment))
pageByteLength = slotByteStride × slotsPerPage
```

모든 곱셈은 checked integer arithmetic을 사용한다.

## 9.2 Lazy page allocation

Page는 profile budget 안에서 필요할 때만 생성한다. 한 geometry·format 조합은 하나의 pool이다. 서로 다른 window 크기를 같은 slot stride로 억지 혼합하지 않는다.

## 9.3 Usage

```text
GPUBufferUsage.STORAGE
| GPUBufferUsage.COPY_SRC
| GPUBufferUsage.COPY_DST
```

MAP_READ와 MAP_WRITE는 금지한다.

---

# 10. Page table

## 10.1 CPU shadow entry

```typescript
interface AtlasPageTableShadowEntry {
  virtualTileId: number;
  virtualGeneration: number;
  poolIndex: number;
  pageIndex: number;
  pageGeneration: number;
  slotIndex: number;
  slotGeneration: number;
  byteOffset: number;
  byteLength: number;
  flags: number;
  tileKeyDigest: string;
}
```

## 10.2 GPU entry ABI

GPU entry는 16-byte alignment를 유지하는 12×u32, 48-byte record다.

```wgsl
struct AtlasPageEntry {
  virtualGeneration: u32,
  slotGeneration: u32,
  pageIndex: u32,
  pageGeneration: u32,
  slotIndex: u32,
  byteOffsetLo: u32,
  byteLength: u32,
  flags: u32,
  tileWidth: u32,
  tileHeight: u32,
  poolIndex: u32,
  reserved: u32,
}
```

V1 page size는 `u32` byte offset 범위 안으로 제한한다. 4GiB 이상 단일 page는 지원하지 않는다.

## 10.3 Flags

```text
bit 0: VALID
bit 1: RESIDENT
bit 2: WRITE_FENCE_COMPLETE
bit 3: RETIRED
bit 4: INVALIDATED
```

## 10.4 Commit ordering

Payload copy가 먼저 encode되고, page-table entry copy가 같은 command buffer의 뒤쪽에 encode된다.

```text
tile payload copy
→ page-table staging copy
→ queue submit
→ onSubmittedWorkDone
→ CPU shadow commit
→ handle publication
```

CPU shadow는 fence 이전에 RESIDENT로 전환하지 않는다. Handle도 fence 이전에는 반환하지 않는다.

---

# 11. Atlas profile과 budget

`gpu-tile-atlas-profile.json`은 다음을 가진다.

```json
{
  "profileId": "tdt.gpu-tile-atlas.profile.v1",
  "resourceClassId": "tdt.gpu.tile-atlas.persistent.v1",
  "maxResidentBytes": 268435456,
  "maxPageCount": 64,
  "maxVirtualEntries": 65536,
  "defaultSlotsPerPage": 64,
  "maxSlotsPerPage": 256,
  "evictionPolicy": "deterministic-oldest-use-sequence-v1",
  "allowBackgroundEviction": false
}
```

위 숫자는 source default이며 실제 admission은 device limits와 profile 중 더 작은 값으로 계산한다. 실제 VRAM 여유량이라고 주장하지 않는다.

```text
admittedPageBytes ≤ maxBufferSize
admittedBindingBytes ≤ maxStorageBufferBindingSize
totalRegisteredGpuBytes ≤ profile.maxResidentBytes
```

Budget 계산이 0 slot을 만들면 Atlas boot는 가능하지만 해당 pool admission은 `E_TILE_ATLAS_POOL_UNAVAILABLE`로 차단한다.

---

# 12. Slot lifecycle

```text
FREE
→ RESERVED
→ WRITE_SUBMITTED
→ WRITE_FENCE_COMPLETED
→ RESIDENT
→ PINNED
→ RESIDENT
→ EVICT_RESERVED
→ EVICT_SUBMITTED
→ FREE
```

Device loss:

```text
any live state → INVALIDATED → DISPOSED
```

불법 전이는 Stable Error다. 상태를 조용히 건너뛰지 않는다.

---

# 13. Write transaction

## 13.1 Lease

```typescript
interface AtlasWriteLease {
  leaseId: string;
  writerId: string;
  deviceEpoch: number;
  poolId: string;
  requestedTileCount: number;
  reservedSlots: readonly AtlasReservedSlot[];
  targetPageTableGeneration: number;
  requestDigest: string;
}
```

## 13.2 Writer admission

Writer는 등록된 ID만 허용한다.

초기 writer:

```text
tdt.atlas.writer.window-batch-ingest.v1
```

향후 SQ01 direct writer는 별도 등록 없이는 page resource를 받을 수 없다.

## 13.3 Singleflight

같은 `tileKeyDigest`가 동시에 요청되면 하나의 write transaction만 소유한다.

- resident면 cache hit
- writing이면 동일 promise/lease completion을 기다림
- failed면 caller마다 동일 stable failure를 관찰
- key가 같은데 metadata tuple이 다르면 digest collision 오류

## 13.4 Rollback

submit 전 실패는 RESERVED slot을 FREE로 돌린다. submit 후 fence 실패 또는 device loss는 slot을 INVALIDATED로 만들고 page 전체를 device epoch와 함께 폐기한다.

부분 tile commit은 허용하지 않는다. 한 ingest transaction의 miss set은 전부 commit되거나 전부 미출판이다.

---

# 14. Existing window batch ingest

## 14.1 Input

```typescript
interface IngestWindowBatchRequest {
  inputHandle: AnalysisFieldHandle;
  windowLayoutReceipt: SpectralWindowLayoutReceipt;
  windowIndices?: readonly number[];
  jobId: string;
  cancellationEpoch: number;
  signal?: AbortSignal;
}
```

입력 descriptor는 반드시 다음을 만족한다.

- semantic `tdt.analysis.spectral.window-spatial-complex.v1`
- resource kind `storage-buffer`
- format `complex-f32-interleaved`
- coordinate space `atlas-local`
- layers = layout window count
- layout digest exact match
- same source surface/revision
- current device epoch

## 14.2 GPU copy

Input Analysis Field를 pin한 상태에서 cache miss window만 `copyBufferToBuffer()`로 page slot에 복사한다.

```text
sourceOffset = windowIndex × rawTileBytes
targetOffset = slotIndex × slotByteStride
copySize = rawTileBytes
```

padding 영역은 tile identity에 포함되지 않으며 consumer가 읽을 수 없다.

## 14.3 Cache hit

동일 tileKeyDigest의 resident entry는 payload copy 없이 handle을 재사용한다. cache hit도 virtual/slot generation currentness를 검사한다.

## 14.4 Input lifetime

Input field pin은 write fence가 완료된 뒤 해제한다. submit 직후 조기 해제 금지.

---

# 15. Read pin

```typescript
interface AtlasReadPin {
  pinId: string;
  handle: AtlasTileHandle;
  pageSurfaceId: string;
  pageResource: GPUBuffer;
  pageIndex: number;
  pageGeneration: number;
  slotIndex: number;
  slotGeneration: number;
  byteOffset: number;
  byteLength: number;
  pageTableGeneration: number;
  state: "PINNED" | "READ_SUBMITTED" | "READ_FENCE_COMPLETED" | "RELEASED";
  assertCurrent(): void;
  markSubmitted(submissionSequence: number): void;
  markFenceCompleted(): void;
  release(): void;
}
```

## 15.1 Release rule

- submit되지 않은 planning pin은 즉시 release 가능
- `READ_SUBMITTED` pin은 fence 전 release 금지
- fence 전 release 시 `E_TILE_ATLAS_PIN_RELEASE_BEFORE_FENCE`
- fence 완료 뒤 release하면 slot pin count 감소
- pin count가 0이어도 eviction은 Authority transaction을 거쳐야 함

## 15.2 Currentness

다음을 모두 검사한다.

- authority ID
- atlas epoch
- device epoch
- virtual tile ID/generation
- page generation
- slot generation
- tile key digest
- RESIDENT state
- not dispose requested

---

# 16. Fence model

V1은 WebGPU `queue.onSubmittedWorkDone()`을 completion evidence로 사용한다. 이는 coarse queue fence이며 vendor timeline semaphore라고 주장하지 않는다.

```typescript
interface AtlasFenceRecord {
  fenceId: string;
  kind: "WRITE" | "READ" | "EVICT" | "MATERIALIZE";
  submissionSequence: number;
  deviceEpoch: number;
  state: "SUBMITTED" | "COMPLETED" | "INVALIDATED";
  affectedVirtualTileIds: readonly number[];
}
```

Authority는 `completedSubmissionSequence` watermark를 유지한다. 단, 순서 숫자만 보고 완료를 추정하지 않고 각 fence completion callback을 기록한다.

---

# 17. Deterministic eviction

## 17.1 Candidate 조건

다음 조건을 모두 만족해야 한다.

```text
state == RESIDENT
pinCount == 0
inFlightReadFenceCount == 0
writeFenceComplete == true
evictionProtected == false
deviceEpoch == current
```

## 17.2 Ordering

```text
1. smallest lastUseSequence
2. smallest virtualTileId
3. smallest pageIndex
4. smallest slotIndex
```

wall-clock timestamp는 사용하지 않는다.

## 17.3 Admission

새 miss set을 수용하기 위해 필요한 slot 수를 먼저 계산한다. candidate가 부족하면 기존 resident mapping을 일부 제거한 뒤 실패하는 행동을 금지한다.

```text
plan all victims
→ reserve all victims and target slots
→ encode invalidation + new payload + new page entries
→ one submission
→ one fence
→ atomic CPU shadow commit
```

계획이 완성되지 않으면 아무 mapping도 바꾸지 않고 `E_TILE_ATLAS_BUDGET_EXHAUSTED`를 반환한다.

## 17.4 Page release

빈 page는 자동 즉시 destroy하지 않는다. `trim()` 또는 budget pressure에서만 deterministic하게 release한다. page release 전 모든 slot과 fence가 terminal이어야 한다.

---

# 18. Window batch materialization

SQ02 ABI를 바꾸지 않기 위해 resident tile set은 contiguous buffer로 materialize할 수 있다.

```typescript
interface MaterializeWindowBatchRequest {
  tileHandles: readonly AtlasTileHandle[];
  windowLayoutReceipt: SpectralWindowLayoutReceipt;
  sourceSurface: AnalysisSourceSurfaceRef;
  jobId: string;
  cancellationEpoch: number;
  signal?: AbortSignal;
}
```

## 18.1 Output

```text
semantic: tdt.analysis.spectral.window-spatial-complex.v1
resource: contiguous storage-buffer
format: complex-f32-interleaved
layers: windowCount
coordinate space: atlas-local
owner after publication: Analysis Field Authority
```

## 18.2 Dispatch

Tile pin을 physical page별로 그룹화한다. page 하나당 하나 이상의 dispatch를 사용하며, 각 output window는 정확히 한 invocation range가 기록한다.

```text
page 0 slots → output windows subset
page 1 slots → output windows subset
...
```

동일 output window에 두 page dispatch가 기록하는 것은 금지한다.

## 18.3 Shader currentness

Materializer는 tile reference buffer에 다음을 넣는다.

```text
virtualTileId
expectedVirtualGeneration
expectedSlotGeneration
expectedPageGeneration
outputWindowIndex
```

WGSL은 page-table entry와 예상 generation을 비교한다. mismatch이면 validation fault counter를 증가시키고 해당 output을 zero로 쓴다. 제품 publication은 CPU pin currentness와 fence currentness로 mismatch가 발생하지 않음을 보장해야 하며, zero write를 정상 fallback으로 인정하지 않는다.

## 18.4 Publication metadata

```text
atlasAuthorityId
atlasEpoch
pageTableGenerationAtSubmit
pageTableGenerationAtFence
residencySetDigest
tileKeyDigests[] digest
cacheHitCount
cacheMissCount
materializationPlanDigest
windowLayoutReceiptDigest
intermediateReadbackCount = 0
```

---

# 19. Analysis Field producer

Materializer는 Analysis producer로 등록한다.

```text
producer ID: tdt.analysis.producer.tile-atlas.window-batch-materializer
producer version: 1.0.0
implementation ID: tdt-gpu-tile-atlas-window-batch-materializer-v1
input semantic: residency handles, not Analysis semantic
output semantic: tdt.analysis.spectral.window-spatial-complex.v1
backend: webgpu
kernel: wgsl
admission: canonical source-admitted
```

Atlas ingest 자체는 semantic producer가 아니라 residency operation이다. 이를 `EFFECTIVE_EXECUTION` Analysis producer로 과장하지 않는다.

---

# 20. Residency receipt

```typescript
interface AtlasResidencyReceipt {
  schemaVersion: 1;
  receiptId: string;
  receiptDigest: string;
  operation: "INGEST" | "MATERIALIZE" | "EVICT" | "TRIM" | "INVALIDATE";
  authorityId: string;
  atlasEpoch: number;
  deviceEpoch: number;
  poolId: string;
  requestDigest: string;
  pageTableGenerationBefore: number;
  pageTableGenerationAfter: number;
  tileCount: number;
  cacheHitCount: number;
  cacheMissCount: number;
  allocatedPageCount: number;
  evictedTileCount: number;
  submittedFenceIds: readonly string[];
  queueSubmissionCount: number;
  cpuPixelComputeUsed: false;
  webglPixelComputeUsed: false;
  canvasPixelComputeUsed: false;
  intermediatePixelReadbackCount: 0;
  terminalState: "COMMITTED" | "FAILED" | "CANCELLED" | "INVALIDATED";
  failureCode: string | null;
}
```

Cache hit도 receipt에 기록한다. hit는 실행 없음이 아니라 residency reuse이며, producer execution receipt와 혼동하지 않는다.

---

# 21. Device loss

Recovery participant order는 Surface Registry(-1000), Analysis Field Authority(-900) 이후로 배치한다.

```text
Tile Atlas Authority order: -850
```

device loss 시:

1. 신규 pin과 write reservation 차단,
2. 모든 read/write/evict fence INVALIDATED,
3. 모든 handle stale 처리,
4. CPU shadow mapping clear,
5. Surface Registry에 page와 page-table surface invalidation 요청,
6. singleflight waiter를 동일 stable error로 reject,
7. 새 device epoch에서 빈 Atlas로 rebuild.

Payload를 자동 복원했다고 주장하지 않는다.

---

# 22. Cancellation

- submit 전 cancellation: reservation rollback
- submit 후 cancellation: fence까지 resource 유지, handle 미출판
- materialize submit 후 cancellation: output fence까지 유지 후 destroy
- cancellation 중 cache hit handles는 pin release
- victim eviction transaction은 부분 commit 금지

---

# 23. Zero intermediate readback

제품 경로에서 금지:

```text
GPUBufferUsage.MAP_READ
GPUBufferUsage.MAP_WRITE
mapAsync()
getMappedRange()
GPU payload readback
CPU tile packing
CPU complex window copy
Canvas pixel extraction
WebGL readPixels
readback 후 GPU 재업로드
```

CPU에서 허용되는 것은 key·page-table record·plan·receipt 같은 control metadata 계산뿐이다.

Page-table staging bytes는 pixel payload가 아니며 `queue.writeBuffer` 또는 staging buffer copy로 전송할 수 있다. 하지만 payload page는 GPU copy/compute로만 기록한다.

---

# 24. Optional identity와 bypass

Atlas는 cache/residency 최적화다. Atlas OFF 또는 miss는 분석 결과를 바꿀 수 없다.

- Atlas OFF: caller는 기존 canonical non-Atlas GPU producer를 사용
- Atlas miss: canonical producer 실행 후 선택적으로 ingest
- resident tile 부족: neutral tile 생성 금지
- missing tile materialize: `E_TILE_ATLAS_TILE_NOT_RESIDENT`
- CPU fallback: 금지
- legacy WebGL Atlas fallback: 금지

같은 input field를 Atlas ingest→materialize한 결과는 direct bounded batch와 byte-equivalent여야 한다.

---

# 25. Legacy migration

## 25.1 `app/legacy-runtime/atlas/`

| 파일 | 현재 분류 | Gate-01 처리 |
|---|---|---|
| `atlas_bridge.js` | console-only stub | canonical bridge adapter 또는 explicit unavailable error |
| `atlas_defs.js` | fixed 4×4 placeholder | compatibility constants only |
| `build_quality_atlas.js` | empty stub | 제품 성공 반환 금지 |
| `sample_quality_atlas.frag` | placeholder text | product import 금지 |
| `lut_atlas_sampler.frag` | placeholder text | product import 금지 |

## 25.2 Public compatibility facade

`buildQualityAtlas()` 이름을 삭제하지 않는다. 그러나 빈 success를 반환하지 않는다.

```text
canonical residency request를 받을 수 있는 경우 → Tile Atlas bridge
quality-LUT 의미를 요청하는 경우 → E_TILE_ATLAS_LEGACY_SEMANTIC_UNSUPPORTED
```

## 25.3 다른 Atlas-labelled 코드

다음은 Persistent Tile Atlas로 승격하지 않는다.

- WebGL textureAtlas
- `gl_atlas_cache.js` full-frame cache
- codec flatness metadata
- LUT strip/bundle
- worker CPU reduction
- WebP preprocessing atlas

---

# 26. Stable Error Registry

| 코드 | 의미 |
|---|---|
| `E_TILE_ATLAS_AUTHORITY_UNAVAILABLE` | Atlas Authority가 active가 아님 |
| `E_TILE_ATLAS_AUTHORITY_COLLISION` | 중복 global bridge |
| `E_TILE_ATLAS_POOL_NOT_PROMOTED` | future pool 요청 |
| `E_TILE_ATLAS_POOL_UNAVAILABLE` | device limit상 pool 생성 불가 |
| `E_TILE_ATLAS_PROFILE_INVALID` | profile schema 또는 digest 오류 |
| `E_TILE_ATLAS_BUDGET_EXHAUSTED` | evictable slot 부족 |
| `E_TILE_ATLAS_PAGE_LIMIT` | page count limit 초과 |
| `E_TILE_ATLAS_VIRTUAL_TABLE_FULL` | virtual entry 고갈 |
| `E_TILE_ATLAS_GENERATION_EXHAUSTED` | generation wrap 위험 |
| `E_TILE_ATLAS_TILE_KEY_INVALID` | tile key tuple 불완전 |
| `E_TILE_ATLAS_TILE_KEY_COLLISION` | 동일 digest에 다른 canonical tuple |
| `E_TILE_ATLAS_INPUT_SEMANTIC` | input semantic 불일치 |
| `E_TILE_ATLAS_INPUT_LAYOUT` | window layout 불일치 |
| `E_TILE_ATLAS_INPUT_RESOURCE` | GPUBuffer admission 실패 |
| `E_TILE_ATLAS_SOURCE_REVISION` | source revision 불일치 |
| `E_TILE_ATLAS_STAGE_MISMATCH` | stage identity 불일치 |
| `E_TILE_ATLAS_DEVICE_EPOCH` | stale device epoch |
| `E_TILE_ATLAS_HANDLE_STALE` | virtual generation stale |
| `E_TILE_ATLAS_SLOT_STALE` | slot/page generation stale |
| `E_TILE_ATLAS_TILE_NOT_RESIDENT` | resident mapping 없음 |
| `E_TILE_ATLAS_PIN_REQUIRED` | pin 없이 physical binding 요청 |
| `E_TILE_ATLAS_PIN_RELEASE_BEFORE_FENCE` | submitted read pin 조기 release |
| `E_TILE_ATLAS_PIN_LEAK` | shutdown 시 pin 잔존 |
| `E_TILE_ATLAS_WRITE_STATE` | 불법 write state transition |
| `E_TILE_ATLAS_READ_STATE` | 불법 read state transition |
| `E_TILE_ATLAS_PUBLICATION_BEFORE_FENCE` | fence 전 handle/publication |
| `E_TILE_ATLAS_PARTIAL_COMMIT` | tile set 부분 commit |
| `E_TILE_ATLAS_EVICTION_PINNED` | pinned tile eviction |
| `E_TILE_ATLAS_EVICTION_INFLIGHT` | in-flight fence tile eviction |
| `E_TILE_ATLAS_PAGE_TABLE_MISMATCH` | CPU shadow/GPU generation mismatch |
| `E_TILE_ATLAS_MATERIALIZE_DUPLICATE_WRITE` | output window 다중 writer |
| `E_TILE_ATLAS_MATERIALIZE_INCOMPLETE` | window set 누락 |
| `E_TILE_ATLAS_CPU_PIXEL_COMPUTE_FORBIDDEN` | CPU payload compute |
| `E_TILE_ATLAS_WEBGL_FORBIDDEN` | WebGL fallback |
| `E_TILE_ATLAS_CANVAS_FORBIDDEN` | Canvas fallback |
| `E_TILE_ATLAS_READBACK_FORBIDDEN` | payload readback |
| `E_TILE_ATLAS_DEVICE_LOST` | device loss |
| `E_TILE_ATLAS_CANCELLED` | cancellation |
| `E_TILE_ATLAS_LEGACY_SEMANTIC_UNSUPPORTED` | legacy quality Atlas 의미 미지원 |
| `E_TILE_ATLAS_EXECUTION_FAILED` | 분류되지 않은 실행 실패 |

---

# 27. WGSL contract

## 27.1 Materializer

`tile-atlas-materialize-window-batch.wgsl`은 다음을 보장한다.

- 한 output complex element당 정확히 한 writer
- page entry generation validation
- slot byte range validation
- output window index range validation
- page별 dispatch가 다른 output subset을 소유
- barrier 불필요 구조
- invalid reference에서 validation fault counter 증가
- no atomics on payload values

## 27.2 Page-table validator

Validation-only shader는 CPU shadow snapshot과 GPU entry mirror를 compact mismatch buffer로 비교한다.

## 27.3 Independent reference

Reference shader는 page table을 사용하지 않고 validation fixture의 direct source buffer에서 expected contiguous output을 작성한다. Product materializer와 주소 계산 경로를 공유하지 않는다.

## 27.4 Comparator

complex f32 bitwise comparator와 numeric comparator를 모두 제공한다.

- exact copy fixture: bitwise equality
- generated arithmetic fixture: finite + tolerance
- first mismatch index
- mismatch count
- max absolute error

---

# 28. Mock validation

다음 deterministic mock을 구현한다.

1. empty atlas boot
2. first ingest miss
3. second ingest all-hit
4. mixed hit/miss transaction
5. same-key singleflight
6. different source revision = different key
7. same virtual ID reuse increments generation
8. slot reuse increments generation
9. page-table generation increments once per commit
10. pin prevents eviction
11. read-submitted pin prevents release
12. fence completion permits release
13. deterministic victim order
14. insufficient victim set leaves mappings unchanged
15. cancellation before submit rollback
16. cancellation after submit no handle publication
17. device loss invalidates all handles
18. stale handle rejection
19. materialize preserves requested window order
20. duplicate output writer detection
21. missing resident tile fail-closed
22. page trim exact disposal
23. zero negative byte counters
24. no Date/random ordering
25. no CPU/WebGL/Canvas/readback ledger use

---

# 29. Physical GPU fixtures

Packaged GPU harness에서 다음을 검증한다.

- `8×8`, `16×16`, `16×32`, `64×64` complex window
- 1 page, multi-page, partial last page
- cache hit copy count 0
- cache miss copy count exact
- page-table mirror parity
- bit-exact ingest→materialize roundtrip
- pin 중 budget pressure
- eviction 후 stale generation shader guard
- write fence 전 non-publication
- read fence 전 slot non-reuse
- device loss during ingest/materialize
- repeated admission/eviction memory plateau

---

# 30. Metrics

```text
atlasEpoch
pageTableGeneration
residentTileCount
pinnedTileCount
inFlightReadCount
inFlightWriteCount
allocatedPageCount
currentResidentBytes
peakResidentBytes
cacheHitCount
cacheMissCount
evictionCount
pageAllocationCount
pageReleaseCount
staleHandleRejectCount
generationMismatchRejectCount
budgetRejectCount
readbackCount = 0
cpuPixelComputeCount = 0
webglFallbackCount = 0
canvasFallbackCount = 0
```

이 값들은 Authority accounting evidence이며 실제 vendor VRAM occupancy가 아니다.

---

# 31. Source file modifications

## 31.1 Runtime

- `app/src/runtime/service-token.ts`
- `app/src/boot/runtime-modules.ts`
- `app/src/runtime/surfaces/surface-types.ts`
- `app/src/runtime/gpu/gpu-consumer-manifest.json`
- `app/src/runtime/analysis/analysis-field-errors.ts`
- `app/src/runtime/analysis/analysis-field-semantic-registry.ts`
- generated analysis registry/inventory/classification/claim
- runtime asset manifest
- Active Graph

## 31.2 Atlas

- section 6 신규 파일 전체

## 31.3 Compatibility

- `app/legacy-runtime/atlas/atlas_bridge.js`
- `app/legacy-runtime/atlas/atlas_defs.js`
- `app/legacy-runtime/atlas/build_quality_atlas.js`
- `app/legacy-runtime/patches/atlas_loader.js`

placeholder shader는 보존할 수 있으나 canonical Runtime Asset Manifest의 product asset으로 등록하지 않는다.

---

# 32. Production admission

Source Bake에서는 Atlas module과 bridge를 등록하지만 Production Pointer를 Atlas path로 전환하지 않는다.

초기 product admission 조건:

```text
source gate PASS
mock lifecycle PASS
predecessor regression PASS
physical packaged GPU DEFERRED
Production Pointer unchanged
```

Packaged GPU 검증 후에도 Atlas는 optional cache다. canonical non-Atlas path를 제거하려면 별도 promotion patch가 필요하다.

---

# 33. Gate matrix

총 224개 Gate를 사용한다.

```text
GTA01-001~012   Parent·baseline truth
GTA01-013~032   Authority·SSOT·taxonomy
GTA01-033~056   Tile identity·generation
GTA01-057~080   Page allocation·page table
GTA01-081~108   Write reservation·ingest
GTA01-109~132   Read pin·fence
GTA01-133~152   Materialization·Analysis publication
GTA01-153~176   Budget·eviction·device loss
GTA01-177~192   Zero-readback·legacy·bypass identity
GTA01-193~208   Source·WGSL·mock validation
GTA01-209~220   Physical GPU·Packaged Electron
GTA01-221~224   Regression·artifact seal
```

예상 Source Bake:

```text
PASS:     212
DEFERRED:  12
FAIL:       0
TOTAL:    224
```

---

# 34. Detailed Gates

## GTA01-001

**Requirement:** Parent ZIP SHA와 QWave-03 Source Seal이 명시된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-002

**Requirement:** Parent 상태가 SOURCE_BAKED_AWAITING_PACKAGED_GPU다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-003

**Requirement:** Truth-00 Atlas taxonomy가 보존된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-004

**Requirement:** SQ02 contiguous complex-f32 ABI가 보존된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-005

**Requirement:** SQ03 spectral field semantics가 보존된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-006

**Requirement:** HP01 topology semantics가 보존된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-007

**Requirement:** HG02 directional gate semantics가 보존된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-008

**Requirement:** QP03 analytic/visual separation이 보존된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-009

**Requirement:** Production Pointer가 변경되지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-010

**Requirement:** Atlas가 SQ01 window extraction 구현을 주장하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-011

**Requirement:** Atlas가 성능 검증을 주장하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-012

**Requirement:** Atlas가 persistent residency 외 알고리즘 결과를 변경하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-013

**Requirement:** `tdt.gpu.tile-atlas.persistent.v1` resource class가 정확히 하나 존재한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-014

**Requirement:** `tdt.analysis.window-batch.v1`과 persistent Atlas가 분리된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-015

**Requirement:** Analysis Field Authority가 semantic SSOT로 유지된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-016

**Requirement:** Tile Atlas Authority가 residency SSOT로 단일화된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-017

**Requirement:** Surface Registry가 page GPUBuffer 물리 소유를 기록한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-018

**Requirement:** GPU Authority가 device·queue SSOT다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-019

**Requirement:** Runtime Asset Authority가 Atlas WGSL digest를 검증한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-020

**Requirement:** CPU shadow page table이 control-plane SSOT다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-021

**Requirement:** GPU page table이 execution mirror로만 분류된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-022

**Requirement:** Atlas tile handle은 AnalysisFieldHandle이 아니다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-023

**Requirement:** Atlas가 직접 Analysis semantic generation을 발급하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-024

**Requirement:** `analysis-atlas` Surface allocation class가 추가된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-025

**Requirement:** Atlas page의 typed disposer가 Surface Registry에 등록된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-026

**Requirement:** Atlas service token이 유일하다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-027

**Requirement:** Atlas global bridge가 frozen single instance다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-028

**Requirement:** Atlas module boot dependency가 GPU·Surface·Analysis 뒤다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-029

**Requirement:** Atlas recovery participant order가 명시된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-030

**Requirement:** complex-f32 window pool만 canonical이다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-031

**Requirement:** future texture/scalar pools는 product admission이 차단된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-032

**Requirement:** legacy quality/full-frame/codec Atlas가 persistent class로 승격되지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-033

**Requirement:** AtlasTileKey가 resource class를 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-034

**Requirement:** AtlasTileKey가 pool class를 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-035

**Requirement:** AtlasTileKey가 semantic ID와 semantic digest를 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-036

**Requirement:** AtlasTileKey가 source surface ID와 revision을 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-037

**Requirement:** AtlasTileKey가 source dimensions와 format을 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-038

**Requirement:** AtlasTileKey가 stage identity를 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-039

**Requirement:** AtlasTileKey가 window layout digest를 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-040

**Requirement:** AtlasTileKey가 window/plane/grid index를 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-041

**Requirement:** AtlasTileKey가 tile dimensions와 payload format을 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-042

**Requirement:** AtlasTileKey가 producer receipt와 field-set digest를 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-043

**Requirement:** AtlasTileKey가 derivation parameter digest를 포함한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-044

**Requirement:** Tile key canonical JSON과 SHA-256이 결정론적이다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-045

**Requirement:** 동일 digest·상이 tuple 충돌을 fail-closed한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-046

**Requirement:** GPU payload byte hash라고 과장하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-047

**Requirement:** deviceEpoch와 atlasEpoch가 분리된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-048

**Requirement:** pageTableGeneration과 virtualGeneration이 분리된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-049

**Requirement:** slotGeneration과 pageGeneration이 분리된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-050

**Requirement:** virtual tile ID 재사용 시 generation이 증가한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-051

**Requirement:** physical slot 재사용 시 slot generation이 증가한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-052

**Requirement:** page 재할당 시 page generation이 증가한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-053

**Requirement:** generation wrap 위험을 fail-closed한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-054

**Requirement:** Handle이 physical offset을 공개하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-055

**Requirement:** Handle currentness가 모든 generation을 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-056

**Requirement:** stale handle이 resident lookup에 성공하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-057

**Requirement:** raw tile byte 계산이 checked arithmetic다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-058

**Requirement:** slot stride가 storage alignment를 만족한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-059

**Requirement:** page byte 계산이 checked arithmetic다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-060

**Requirement:** page가 MAP_READ 없이 생성된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-061

**Requirement:** page가 MAP_WRITE 없이 생성된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-062

**Requirement:** page usage에 STORAGE가 포함된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-063

**Requirement:** page usage에 COPY_SRC가 포함된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-064

**Requirement:** page usage에 COPY_DST가 포함된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-065

**Requirement:** page가 Surface Registry에 등록된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-066

**Requirement:** page-table buffer가 Surface Registry에 등록된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-067

**Requirement:** page allocation이 profile budget을 넘지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-068

**Requirement:** page allocation이 maxBufferSize를 넘지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-069

**Requirement:** page binding이 maxStorageBufferBindingSize를 넘지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-070

**Requirement:** geometry·format이 다른 tile을 같은 pool에 혼합하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-071

**Requirement:** page allocation이 lazy다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-072

**Requirement:** GPU page entry ABI가 48 bytes다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-073

**Requirement:** GPU page entry가 virtual generation을 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-074

**Requirement:** GPU page entry가 slot/page generation을 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-075

**Requirement:** GPU page entry가 page·slot·offset을 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-076

**Requirement:** GPU page entry가 VALID/RESIDENT flags를 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-077

**Requirement:** payload copy가 page-table publish보다 먼저 encode된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-078

**Requirement:** CPU shadow가 fence 이전에 RESIDENT가 되지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-079

**Requirement:** Handle이 fence 이전에 반환되지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-080

**Requirement:** CPU shadow와 GPU mirror generation이 receipt로 결속된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-081

**Requirement:** 등록된 Atlas writer만 write lease를 획득한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-082

**Requirement:** window-batch ingest writer가 초기 canonical writer다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-083

**Requirement:** future SQ01 writer는 미등록 상태에서 차단된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-084

**Requirement:** write lease가 device epoch에 결속된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-085

**Requirement:** write lease가 target page-table generation을 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-086

**Requirement:** 동일 key resident 요청이 cache hit다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-087

**Requirement:** 동일 key in-flight 요청이 singleflight다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-088

**Requirement:** 동일 key 실패 waiter가 동일 stable error를 받는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-089

**Requirement:** 입력 semantic이 exact window-spatial-complex다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-090

**Requirement:** 입력 resource kind가 storage-buffer다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-091

**Requirement:** 입력 format이 complex-f32-interleaved다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-092

**Requirement:** 입력 coordinate space가 atlas-local이다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-093

**Requirement:** 입력 layer count가 layout window count와 일치한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-094

**Requirement:** 입력 layout digest가 exact match다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-095

**Requirement:** 입력 source surface/revision이 exact match다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-096

**Requirement:** 입력 device epoch가 current다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-097

**Requirement:** 입력 field가 write fence까지 pin된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-098

**Requirement:** cache miss만 GPU copy된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-099

**Requirement:** cache hit tile은 payload copy count를 증가시키지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-100

**Requirement:** source offset 계산이 checked다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-101

**Requirement:** target offset 계산이 checked다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-102

**Requirement:** copy size가 raw tile bytes와 정확히 같다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-103

**Requirement:** padding bytes를 tile payload로 노출하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-104

**Requirement:** 한 transaction의 miss set이 원자 commit된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-105

**Requirement:** submit 전 cancellation이 reservation을 rollback한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-106

**Requirement:** submit 후 cancellation이 handle을 출판하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-107

**Requirement:** write failure가 부분 resident mapping을 남기지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-108

**Requirement:** write receipt가 hit/miss/copy/fence를 기록한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-109

**Requirement:** physical binding은 AtlasReadPin을 통해서만 제공된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-110

**Requirement:** read pin이 page surface ID를 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-111

**Requirement:** read pin이 page/slot generation을 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-112

**Requirement:** read pin이 byte offset과 length를 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-113

**Requirement:** read pin이 page-table generation을 기록한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-114

**Requirement:** planning-only pin은 submit 전 release 가능하다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-115

**Requirement:** READ_SUBMITTED pin은 fence 전 release가 차단된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-116

**Requirement:** read submission sequence가 기록된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-117

**Requirement:** read fence ID가 기록된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-118

**Requirement:** fence 완료 뒤에만 release가 허용된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-119

**Requirement:** pin count가 eviction candidate 조건에 반영된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-120

**Requirement:** in-flight read count가 eviction candidate 조건에 반영된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-121

**Requirement:** pin currentness가 authority ID를 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-122

**Requirement:** pin currentness가 atlas/device epoch를 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-123

**Requirement:** pin currentness가 virtual generation을 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-124

**Requirement:** pin currentness가 slot/page generation을 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-125

**Requirement:** pin currentness가 tile key digest를 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-126

**Requirement:** pin currentness가 RESIDENT state를 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-127

**Requirement:** stale pin assert가 stable error다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-128

**Requirement:** double release가 count를 음수로 만들지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-129

**Requirement:** shutdown pin leak가 stable error다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-130

**Requirement:** device loss가 모든 pin을 aborted로 만든다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-131

**Requirement:** coarse queue fence를 vendor timeline으로 과장하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-132

**Requirement:** completed sequence를 fence callback 없이 추정하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-133

**Requirement:** materializer producer가 canonical registry에 등록된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-134

**Requirement:** materializer output semantic이 기존 window-spatial-complex다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-135

**Requirement:** materializer output이 contiguous storage buffer다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-136

**Requirement:** materializer가 layout window order를 보존한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-137

**Requirement:** materializer가 모든 tile handle을 pin한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-138

**Requirement:** materializer가 physical page별 dispatch로 그룹화한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-139

**Requirement:** 각 output window의 writer가 정확히 하나다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-140

**Requirement:** duplicate output writer plan을 차단한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-141

**Requirement:** missing output window plan을 차단한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-142

**Requirement:** WGSL이 virtual generation을 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-143

**Requirement:** WGSL이 slot generation을 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-144

**Requirement:** WGSL이 page generation을 검사한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-145

**Requirement:** WGSL mismatch가 validation fault를 기록한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-146

**Requirement:** zero output이 정상 fallback으로 승인되지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-147

**Requirement:** materialize queue submission이 기록된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-148

**Requirement:** materialize fence 전 Analysis publication이 금지된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-149

**Requirement:** output ownership이 publication 후 Analysis Authority로 이전된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-150

**Requirement:** materialization metadata가 residency set digest를 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-151

**Requirement:** materialization metadata가 page-table generations를 가진다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-152

**Requirement:** materialization receipt가 readback 0을 기록한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-153

**Requirement:** budget profile schema가 digest로 봉인된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-154

**Requirement:** maxResidentBytes가 Surface ledger와 대조된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-155

**Requirement:** maxPageCount가 강제된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-156

**Requirement:** maxVirtualEntries가 강제된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-157

**Requirement:** candidate는 RESIDENT·unpinned·fence complete여야 한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-158

**Requirement:** write in-flight slot은 eviction 대상이 아니다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-159

**Requirement:** read in-flight slot은 eviction 대상이 아니다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-160

**Requirement:** deterministic victim order가 lastUseSequence를 사용한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-161

**Requirement:** victim tie가 virtual/page/slot ID로 결정된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-162

**Requirement:** Date.now 기반 eviction이 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-163

**Requirement:** Math.random 기반 eviction이 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-164

**Requirement:** 필요 victim 전체를 계획하기 전 mapping을 바꾸지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-165

**Requirement:** victim 부족 시 기존 mapping이 유지된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-166

**Requirement:** eviction invalidation과 new write가 한 transaction이다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-167

**Requirement:** eviction fence 전 slot reuse가 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-168

**Requirement:** empty page 즉시 background destroy가 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-169

**Requirement:** trim이 terminal slot page만 release한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-170

**Requirement:** page release가 Surface Registry typed disposal을 사용한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-171

**Requirement:** device loss가 신규 reservation을 차단한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-172

**Requirement:** device loss가 모든 fence를 INVALIDATED로 만든다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-173

**Requirement:** device loss가 CPU shadow를 clear한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-174

**Requirement:** device loss가 pages/page-table surface를 invalidates한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-175

**Requirement:** rebuild가 빈 Atlas에서 시작한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-176

**Requirement:** device loss payload 자동 복구를 주장하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-177

**Requirement:** 제품 page resource에 MAP_READ가 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-178

**Requirement:** 제품 page resource에 MAP_WRITE가 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-179

**Requirement:** 제품 경로에 mapAsync가 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-180

**Requirement:** 제품 경로에 getMappedRange가 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-181

**Requirement:** 제품 경로에 payload readback이 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-182

**Requirement:** 제품 경로에 CPU tile packing이 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-183

**Requirement:** 제품 경로에 WebGL fallback이 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-184

**Requirement:** 제품 경로에 Canvas fallback이 없다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-185

**Requirement:** page-table CPU metadata write와 pixel compute가 구분된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-186

**Requirement:** Atlas OFF가 기존 canonical GPU path를 보존한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-187

**Requirement:** cache miss가 neutral tile을 생성하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-188

**Requirement:** missing tile materialize가 fail-closed한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-189

**Requirement:** legacy buildQualityAtlas 빈 success가 제거된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-190

**Requirement:** legacy quality semantic이 canonical residency로 오인되지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-191

**Requirement:** placeholder shaders가 product asset으로 등록되지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-192

**Requirement:** full-frame cache·LUT·codec metadata가 persistent Atlas로 승격되지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-193

**Requirement:** Source scanner가 신규 Authority와 service token을 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-194

**Requirement:** Source scanner가 Surface allocation class를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-195

**Requirement:** Source scanner가 Atlas profile digest를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-196

**Requirement:** Source scanner가 page entry ABI를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-197

**Requirement:** Source scanner가 prohibited readback API 0건을 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-198

**Requirement:** WGSL parser가 materializer를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-199

**Requirement:** WGSL parser가 generation checks를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-200

**Requirement:** WGSL parser가 single-writer mapping을 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-201

**Requirement:** Mock가 first miss와 second hit를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-202

**Requirement:** Mock가 mixed hit/miss atomicity를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-203

**Requirement:** Mock가 virtual/slot generation 증가를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-204

**Requirement:** Mock가 pin/fence/eviction 상호작용을 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-205

**Requirement:** Mock가 deterministic victim order를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-206

**Requirement:** Mock가 insufficient budget rollback을 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-207

**Requirement:** Mock가 device-loss invalidation을 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-208

**Requirement:** Mock가 zero fallback counters를 확인한다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-209

**Requirement:** 실제 WebGPU에서 Atlas WGSL compile·bind group validation이 통과한다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-210

**Requirement:** 실제 GPU에서 page-table mirror가 CPU shadow와 일치한다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-211

**Requirement:** 실제 GPU에서 ingest→materialize가 bit-exact다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-212

**Requirement:** 실제 GPU에서 cache hit payload copy count가 0이다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-213

**Requirement:** 실제 GPU에서 pinned tile이 budget pressure 중 유지된다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-214

**Requirement:** 실제 GPU에서 read fence 전 slot reuse가 없다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-215

**Requirement:** 실제 GPU에서 stale generation guard가 동작한다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-216

**Requirement:** 실제 GPU에서 intermediate payload readback이 0이다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-217

**Requirement:** 실제 GPU device loss 중 transaction이 invalidated된다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-218

**Requirement:** 반복 admission/eviction에서 GPU memory plateau가 확인된다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-219

**Requirement:** Packaged Electron renderer·worker 경계가 통과한다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-220

**Requirement:** Packaged Electron relaunch와 verified-unpromoted receipt가 통과한다.

**Source evidence:** source contract and packaged harness definition.

**Runtime evidence:** physical WebGPU / Windows x64 Packaged Electron.

**Source Bake disposition:** `DEFERRED`.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-221

**Requirement:** Predecessor Analysis·Spectral·Hannakairo·QWave gates가 회귀하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-222

**Requirement:** Active Graph·GPU SSOT·Surface Lifecycle·Runtime gates가 회귀하지 않는다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-223

**Requirement:** 변경 파일 manifest와 Source Receipt가 생성된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

## GTA01-224

**Requirement:** 독립 ZIP 해제 후 Source Seal이 정확히 재현된다.

**Source evidence:** source scanner, generated manifest, deterministic receipt, or sealed specification.

**Runtime evidence:** source gate, WGSL contract, mock lifecycle, or predecessor regression as applicable.

**Source Bake disposition:** `PASS` required.

**Failure policy:** fail closed; no silent fallback or state mutation.

---

# 35. Source Bake acceptance

```text
GTA01 Gate: 212 PASS / 12 DEFERRED / 0 FAIL
Stable Error Registry: PASS
TypeScript syntax: PASS
Active Graph: PASS
GPU Device SSOT: PASS
Surface Lifecycle: PASS
Analysis Field Truth-00: PASS
SQ02·SQ03·HP01·HG02·QP03: PASS
Production Pointer mutation: false
Independent ZIP source-seal reproduction: exact
```

Source-baked 상태명:

```text
GPU_TILE_ATLAS_01_SOURCE_BAKED_AWAITING_PACKAGED_GPU
```

---

# 36. Physical promotion acceptance

```text
GTA01-209~220 PASS
physical page-table parity PASS
bit-exact ingest/materialize PASS
pin/fence eviction PASS
device-loss lifecycle PASS
memory plateau PASS
Packaged Electron relaunch PASS
Production Pointer unchanged
```

Verified-unpromoted 상태명:

```text
GPU_TILE_ATLAS_01_VERIFIED_UNPROMOTED
```

---

# 37. Final seal statement

`TDT-GPU-TILE-ATLAS-01`은 Atlas라는 이름의 파일을 추가하는 패치가 아니다.

완료 조건은 다음과 같다.

- tile content identity가 source·semantic·layout·producer receipt에 결속되고,
- virtual mapping과 physical slot의 generation이 분리되며,
- payload write와 page-table visibility가 queue fence 뒤에만 commit되고,
- consumer가 read pin을 fence까지 유지하며,
- pinned 또는 in-flight tile이 eviction되지 않고,
- budget pressure가 deterministic transaction으로 처리되고,
- device loss가 모든 residency handle을 즉시 stale로 만들고,
- resident tile이 기존 SQ02 ABI의 contiguous Analysis Field로 GPU-only materialize되며,
- Atlas OFF가 기존 canonical 결과를 바꾸지 않고,
- legacy Atlas placeholder가 성공처럼 위장하지 않는 것이다.

**한 버퍼는 Atlas가 아니다.**

**한 좌표는 residency가 아니다.**

Page table, generation, pin, fence, eviction, ownership, receipt가 함께 닫힐 때만 persistent GPU Tile Atlas다.

