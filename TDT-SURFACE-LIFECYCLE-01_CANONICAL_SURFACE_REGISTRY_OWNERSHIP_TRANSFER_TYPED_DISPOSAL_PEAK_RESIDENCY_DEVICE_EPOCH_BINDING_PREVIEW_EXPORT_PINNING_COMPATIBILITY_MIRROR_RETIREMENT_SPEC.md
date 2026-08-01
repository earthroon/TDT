# TDT-SURFACE-LIFECYCLE-01

## Canonical Surface Registry / Ownership Transfer / Typed Disposal / Peak Residency Accounting / Device Epoch Binding / Preview·Export Pinning / Compatibility Mirror Retirement Seal

- **Spec ID:** `TDT-SURFACE-LIFECYCLE-01`
- **Revision:** `01`
- **Status:** `SPEC_DEFINED_UNBAKED`
- **Date:** `2026-07-25`
- **Parent patch:** `TDT-GPU-DEVICE-SSOT-01`
- **Parent source state:** `GPU_DEVICE_SSOT_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- **Parent ZIP SHA-256:** `75bbf6c78dc3b41eb85aa2ef88b99018fb74a31c84edfd8c3b2337ea237dc5cf`
- **Target source state:** `SURFACE_LIFECYCLE_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- **Maximum promotable state in this specification:** `SURFACE_LIFECYCLE_VERIFIED_UNPROMOTED`
- **Production pointer mutation:** forbidden
- **Packaged-runtime claims without Windows x64 evidence:** forbidden

---

# 0. Executive decision

`TDT-GPU-DEVICE-SSOT-01`은 adapter, device, device epoch, loss recovery와 pipeline cache의 권위를 하나로 묶었다.
그러나 GPU 장치가 하나라는 사실만으로 그 위에 생성되는 표면의 생애가 하나가 되지는 않는다.

현재 구현에는 다음 구조적 공백이 남아 있다.

1. `ResourceRegistryService`는 `unknown` 값을 저장하는 opaque map이며, 표면의 종류·크기·소유권·폐기 함수를 모른다.
2. `invalidate()`는 상태 문자열만 `INVALID`로 바꾸며 물리 자원을 폐기하지 않는다.
3. Runtime dispose는 레코드를 지우지만 `GPUTexture.destroy()`, `GPUBuffer.destroy()`, `ImageBitmap.close()`를 호출하지 않는다.
4. `PipelineService`가 새 final surface를 승격할 때 이전 surface는 즉시 invalid 처리되지만, Preview 또는 Export가 읽는 중인지 알지 못한다.
5. `LegacyFinalSurfaceBridgeService`는 CPU surface를 복사한 뒤 compatibility surface와 RGBA8 mirror를 다시 만들어 메모리를 중복 점유한다.
6. GPU final surface는 `textureResourceId`라는 문자열만 검사하며, 해당 texture가 실제 registry에 존재하는지, 현재 device epoch에 속하는지, format·size가 일치하는지 검증하지 않는다.
7. Preview는 `ImageBitmap`만 직접 표시할 수 있고, CPU typed surface 또는 GPU texture handle의 수명과 pin을 관리하지 않는다.
8. Export Authority는 final surface 값을 resolve한 뒤 장시간 비동기 encode를 수행하지만, 그 사이 새 final revision이 승격되어 이전 surface가 invalid 또는 disposed될 수 있는 경쟁 조건을 명시적으로 봉인하지 않는다.
9. 디코더가 반환한 `ImageBitmap`, native decoder surface, PSD/JXL exact surface의 물리 생애가 registry state와 연결되지 않는다.
10. device loss 시 old device epoch surface의 일괄 폐기·pin 강제 종료·rebuild 정책이 없다.

따라서 이 명세의 결정은 다음과 같다.

> 모든 디코드·작업·중간·최종·미리보기·내보내기 표면은 `SurfaceRegistryAuthority`에 등록된 typed surface record로만 존재한다.  
> 표면의 논리 상태, 물리 자원, 소유권, borrow/pin, device epoch, resident byte accounting, disposer는 하나의 SSOT에 귀속한다.

이 명세는 새로운 리샘플 알고리즘을 추가하지 않는다.
이 명세는 표면의 생애를 제품 계약으로 만든다.

---

# 1. Scope

## 1.1 In scope

- Canonical Surface Registry 도입
- 기존 opaque `ResourceRegistryService`와의 역할 분리 또는 typed extension
- CPU byte surface, GPU texture surface, ImageBitmap surface, encoded blob surface의 typed descriptor
- surface identity와 resource identity의 분리
- owner, producer, parent lineage, source/final revision의 명시
- exclusive ownership transfer
- immutable borrow
- Preview pin
- Export pin
- readback pin
- encoder transfer pin
- typed disposer
- idempotent disposal
- deferred disposal
- device epoch binding
- old epoch invalidation
- resident byte estimate
- current/peak resident byte accounting
- allocation class별 accounting
- compatibility mirror accounting 및 단계적 퇴역
- pipeline final surface promotion transaction
- export 중 revision 교체 안전성
- runtime dispose 순서
- device-loss recovery participant 결선
- receipt 및 gate

## 1.2 Out of scope

다음은 본 명세에서 구현하거나 승격하지 않는다.

- Preview Presenter의 GPUTexture 직접 렌더링 완성
- EWA·Anisotropic resample 경로 단일화
- decoded expansion 사전 예산 정책의 제품 승격
- tiled image runtime
- ICC pipeline 재설계
- PSD Rust WASM 승격
- Native decoder release addon 승격
- JXL 또는 MODJPEG 알고리즘 변경
- WebGPU Worker child authority
- Production Pointer 변경

단, 위 후속 명세가 의존할 수 있도록 surface contract를 제공해야 한다.

---

# 2. Parent invariants

이 명세는 다음 상위 불변조건을 보존한다.

## 2.1 GPU Authority invariants

- Renderer realm의 adapter authority는 하나다.
- Renderer realm의 active device는 최대 하나다.
- 모든 GPU surface는 `runtimeEpoch`, `deviceEpoch`, `deviceIdentity`를 기록한다.
- old epoch GPU object는 새 epoch에서 사용될 수 없다.
- Authority 외 직접 `requestAdapter()` 및 `requestDevice()` 호출은 허용되지 않는다.
- device loss recovery는 기존 `GpuDeviceAuthorityService`의 상태 머신을 따른다.

## 2.2 Active Graph invariants

- Quarantine source는 emit 및 package에서 제외한다.
- runtime asset은 authoritative manifest를 통해서만 접근한다.
- 활성 코드의 비결정적 ID 생성은 허용하지 않는다.
- 신규 service, tool, receipt는 Active Graph 생성 규칙에 편입한다.

## 2.3 Runtime R7 invariants

- `PipelineService`가 final revision의 유일한 권위다.
- `ExportAuthorityService`는 runtime final surface만 export한다.
- source, canvas fallback, original input을 final output으로 승격하지 않는다.
- encoder ABI와 format policy는 변경하지 않는다.
- final surface promotion은 evidence와 pipeline receipt를 요구한다.

---

# 3. Observed baseline audit

다음 수치는 parent artifact의 Active Graph node와 canonical `app/src`를 기준으로 측정한 출발점이다.

| Audit item | Observed calls | Observed files | Interpretation |
|---|---:|---:|---|
| `createTexture(` | 89 | 44 | texture 생성은 GPU Authority lease로 이동했지만 surface ownership은 분산됨 |
| `.destroy(` | 17 | 6 | 생성 수에 비해 명시 폐기 지점이 현저히 적음 |
| `createImageBitmap(` | 12 | 7 | ImageBitmap close ownership이 없음 |
| `readPixels(` | 24 | 16 | WebGL readback surface의 allocation·lifetime accounting이 없음 |
| `mapAsync(` | 17 | 10 | staging buffer pin과 disposal이 분산됨 |
| `getMappedRange(` | 19 | 10 | mapped range와 host copy의 resident accounting이 없음 |
| `copyTextureToBuffer(` | 11 | 8 | readback staging lifecycle이 분산됨 |
| `copyTextureToTexture(` | 1 | 1 | texture lineage가 기록되지 않음 |
| `__DADUM_FILTERED_SURFACE__` | 13 | 6 | compatibility mirror가 canonical surface와 별도 생애를 가짐 |
| `__DADUM_FILTERED_RGBA8__` | 3 | 3 | RGBA8 복제본이 별도 resident memory를 점유함 |

## 3.1 Existing canonical registry limitation

현재 `ResourceRegistryService`의 레코드는 다음 필드만 가진다.

```ts
interface RuntimeResourceRecord {
  id: string;
  type: string;
  ownerServiceId: string;
  epoch: number;
  revision: number;
  state: 'ACTIVE' | 'INVALID' | 'DISPOSED';
}
```

이 구조에는 다음이 없다.

- 물리 자원 kind
- byte size
- device epoch
- disposer
- parent lineage
- pin count
- borrow count
- transfer state
- disposal pending state
- creation stack 또는 producer
- final/source revision
- color/alpha contract
- dimension/format
- peak memory accounting

## 3.2 Existing final surface copy amplification

CPU final surface 승격은 최소 다음 복제를 수행한다.

1. `normalizeSurface()`에서 입력 `Uint8Array` 또는 `Uint16Array` 복제
2. `compatibilitySurface` object 생성
3. RGBA8일 경우 `rgba8Mirror()`에서 데이터 재복제
4. `__DADUM_FILTERED_SURFACE__` 전역 보존
5. `__DADUM_FILTERED_RGBA8__` 전역 보존
6. Export encoder가 worker ownership을 위해 추가 복제 또는 transfer 가능

이 명세는 무조건 zero-copy를 주장하지 않는다.
대신 모든 copy를 명시적 `SurfaceAllocationRecord`로 기록하고, compatibility copy는 최종적으로 퇴역시킨다.

---

# 4. Canonical architecture

## 4.1 Services

본 명세는 다음 service topology를 요구한다.

```text
GpuDeviceAuthorityService
          │
          │ device identity / epoch / recovery participant
          ▼
SurfaceRegistryAuthorityService
          │
          ├── CpuSurfaceRecord
          ├── GpuTextureSurfaceRecord
          ├── ImageBitmapSurfaceRecord
          ├── StagingBufferRecord
          ├── EncodedBlobRecord
          ├── SurfaceLease / SurfacePin
          ├── TypedDisposer
          └── ResidencyLedger
          │
          ├── DecoderRegistryService
          ├── PipelineService
          ├── PreviewPresenterService
          ├── ExportAuthorityService
          └── LegacyFinalSurfaceBridgeService
```

## 4.2 Service IDs

```ts
surfaceRegistry: 'dadum.runtime.surface-registry'
surfaceResidency: 'dadum.runtime.surface-residency-ledger'
```

두 기능은 하나의 class에 구현할 수 있으나, receipt에서는 authority와 ledger evidence를 분리해야 한다.

## 4.3 Boot dependency

```text
dadum.module.resources-v1
        ↓
dadum.module.gpu-authority-v1
        ↓
dadum.module.surface-lifecycle-v1
        ↓
  decode / pipeline / preview / export
```

`decode`, `pipeline`, `preview`, `export`는 모두 surface lifecycle capability를 consume해야 한다.

## 4.4 Capability IDs

- `dadum.surface.registry`
- `dadum.surface.lifecycle`
- `dadum.surface.residency`

---

# 5. Surface identity model

## 5.1 Surface ID

Surface ID는 결정론적 sequence service를 사용한다.

```text
surf:<runtimeEpoch>:<deviceEpoch-or-cpu>:<sequence>:<surfaceKind>
```

예시:

```text
surf:12:cpu:41:decoded-rgba8
surf:12:2:78:working-gpu-texture
surf:12:2:91:final-gpu-texture
```

Surface ID는 content digest가 아니다.
동일 byte content라도 서로 다른 생애를 가진 surface는 서로 다른 ID를 가진다.

## 5.2 Resource ID relation

기존 `ResourceRegistryService`의 resource ID와 surface ID를 혼용하지 않는다.

```ts
interface SurfaceResourceBinding {
  surfaceId: string;
  runtimeResourceId: string | null;
}
```

최종 구현은 surface registry가 resource registry를 내부 composition으로 사용할 수 있다.
그러나 외부 소비자는 surface ID를 canonical key로 사용한다.

## 5.3 Surface revision

- `surfaceRevision`: 같은 logical surface가 metadata-only transition을 거칠 때 증가
- `sourceRevision`: 입력 문서 revision
- `finalRevision`: Pipeline Authority가 부여하는 최종 출력 revision

세 revision을 혼동하지 않는다.

---

# 6. Canonical surface schema

## 6.1 Common descriptor

```ts
export type SurfaceState =
  | 'ALLOCATING'
  | 'ACTIVE'
  | 'TRANSFER_PENDING'
  | 'PINNED'
  | 'INVALID'
  | 'DISPOSE_PENDING'
  | 'DISPOSING'
  | 'DISPOSED'
  | 'FAILED';

export type SurfaceKind =
  | 'decoded-cpu'
  | 'decoded-image-bitmap'
  | 'source-gpu-texture'
  | 'analysis-gpu-texture'
  | 'working-gpu-texture'
  | 'intermediate-gpu-texture'
  | 'final-cpu'
  | 'final-gpu-texture'
  | 'preview-view'
  | 'readback-staging'
  | 'encoder-staging'
  | 'encoded-blob';

export interface CanonicalSurfaceRecordBase {
  readonly surfaceId: string;
  readonly surfaceKind: SurfaceKind;
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number | null;
  readonly deviceIdentity: string | null;
  readonly ownerId: string;
  readonly producerModuleId: string;
  readonly producerOperationId: string;
  readonly sourceRevision: number;
  readonly finalRevision: number | null;
  readonly surfaceRevision: number;
  readonly parentSurfaceIds: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly planeCount: number;
  readonly channelCount: number;
  readonly bitDepth: number;
  readonly storage: string;
  readonly format: string;
  readonly alphaMode: 'straight' | 'premultiplied' | 'opaque';
  readonly colorContractId: string;
  readonly byteLengthExact: number | null;
  readonly byteLengthEstimated: number;
  readonly allocationClass: SurfaceAllocationClass;
  readonly createdSequence: number;
  readonly createdAtMonotonicMs: number;
  state: SurfaceState;
  ownerGeneration: number;
  borrowCount: number;
  pinCount: number;
  disposeRequested: boolean;
  disposeReason: string | null;
}
```

## 6.2 Allocation class

```ts
export type SurfaceAllocationClass =
  | 'HOST_TYPED_ARRAY'
  | 'HOST_IMAGE_BITMAP'
  | 'GPU_TEXTURE'
  | 'GPU_BUFFER'
  | 'ENCODED_BLOB'
  | 'COMPATIBILITY_MIRROR'
  | 'EXTERNAL_BORROWED';
```

`EXTERNAL_BORROWED`는 registry가 물리 폐기 권한을 갖지 않는 임시 경계에만 사용한다.
승격된 final surface는 `EXTERNAL_BORROWED`일 수 없다.

## 6.3 CPU surface

```ts
export interface CpuSurfacePayload {
  readonly kind: 'cpu';
  readonly data: Uint8Array | Uint16Array | Float32Array;
  readonly byteOffset: number;
  readonly byteLength: number;
  readonly ownership: 'OWNED' | 'TRANSFERRED_IN';
}
```

### CPU surface invariants

- `data.byteLength`는 record의 exact byte length와 일치해야 한다.
- detached ArrayBuffer는 resolve할 수 없다.
- `SharedArrayBuffer`는 별도 policy 없이 허용하지 않는다.
- final surface 승격 시 자동 복제를 기본값으로 하지 않는다.
- 외부가 배열을 계속 수정할 수 있는 경우 ownership transfer 또는 immutable snapshot이 필요하다.

## 6.4 GPU texture surface

```ts
export interface GpuTextureSurfacePayload {
  readonly kind: 'gpu-texture';
  readonly texture: GPUTexture;
  readonly textureIdentity: string;
  readonly format: GPUTextureFormat;
  readonly usage: GPUTextureUsageFlags;
  readonly dimension: GPUTextureDimension;
  readonly mipLevelCount: number;
  readonly sampleCount: number;
  readonly leaseDeviceEpoch: number;
}
```

### GPU surface invariants

- device epoch가 current authority epoch와 일치해야 한다.
- texture descriptor와 surface width/height/format이 일치해야 한다.
- registry 밖에서 `texture.destroy()`를 호출하지 않는다.
- 외부 module은 raw texture를 permanent field에 저장하지 않는다.
- texture borrow는 `SurfaceLease`의 수명 안에서만 가능하다.

## 6.5 ImageBitmap surface

```ts
export interface ImageBitmapSurfacePayload {
  readonly kind: 'image-bitmap';
  readonly bitmap: ImageBitmap;
  readonly ownership: 'OWNED' | 'TRANSFERRED_IN';
}
```

`ImageBitmap.close()`는 typed disposer가 정확히 한 번 호출한다.

## 6.6 Staging buffer

Readback·upload·encoder staging은 surface와 같은 lifecycle ledger에 귀속한다.

```ts
export interface StagingBufferPayload {
  readonly kind: 'gpu-buffer';
  readonly buffer: GPUBuffer;
  readonly mappedState: 'UNMAPPED' | 'MAPPING' | 'MAPPED';
  readonly rowPitch: number | null;
}
```

Mapped buffer는 dispose 전에 반드시 unmap되어야 한다.

---

# 7. Surface state machine

## 7.1 Allowed transitions

```text
ALLOCATING
  ├─→ ACTIVE
  └─→ FAILED

ACTIVE
  ├─→ TRANSFER_PENDING
  ├─→ PINNED
  ├─→ INVALID
  ├─→ DISPOSE_PENDING
  └─→ FAILED

TRANSFER_PENDING
  ├─→ ACTIVE            transfer abort
  ├─→ INVALID           ownership transferred out
  └─→ FAILED

PINNED
  ├─→ ACTIVE            last pin released
  ├─→ INVALID           revision superseded, pins remain
  └─→ DISPOSE_PENDING   dispose requested, pins remain

INVALID
  ├─→ DISPOSE_PENDING
  └─→ DISPOSING         no borrow/pin

DISPOSE_PENDING
  └─→ DISPOSING         borrowCount=0 and pinCount=0

DISPOSING
  ├─→ DISPOSED
  └─→ FAILED
```

## 7.2 Forbidden transitions

- `DISPOSED → ACTIVE`
- `FAILED → ACTIVE`
- `INVALID → PINNED` for new pin acquisition
- `DISPOSE_PENDING → TRANSFER_PENDING`
- old device epoch GPU surface의 `ACTIVE` 유지
- detached CPU buffer의 `ACTIVE` 유지

## 7.3 State semantics

### ACTIVE

신규 borrow와 pin을 받을 수 있다.

### PINNED

하나 이상의 long-lived operation이 surface 생존을 요구한다.

### INVALID

새 작업에서 선택할 수 없지만, 이미 획득된 borrow/pin은 완료할 수 있다.

### DISPOSE_PENDING

물리 폐기가 요청됐으나 outstanding borrow/pin 때문에 지연된 상태다.

### DISPOSED

물리 disposer가 완료됐고 resident bytes가 ledger에서 차감된 상태다.

---

# 8. Ownership model

## 8.1 Single owner

각 surface는 정확히 하나의 `ownerId`를 가진다.

Owner는 다음 권한을 가진다.

- invalidate 요청
- disposal 요청
- exclusive transfer 시작
- metadata transition 요청

Owner라고 해서 raw payload를 자유롭게 외부로 유출할 수 있는 것은 아니다.

## 8.2 Ownership transfer

```ts
interface SurfaceTransferToken {
  readonly transferId: string;
  readonly surfaceId: string;
  readonly fromOwnerId: string;
  readonly toOwnerId: string;
  readonly expectedOwnerGeneration: number;
  commit(): void;
  abort(): void;
}
```

### Transfer rules

- transfer 시작 시 신규 borrow/pin을 막는다.
- outstanding borrow/pin이 있으면 commit할 수 없다.
- commit 시 `ownerGeneration`을 증가시킨다.
- 이전 owner의 token은 stale 처리한다.
- worker transfer로 ArrayBuffer가 detached되는 경우 commit 전에 source surface를 invalid 처리한다.

## 8.3 Borrow

짧은 동기 또는 한 microtask 범위의 접근은 borrow를 사용한다.

```ts
interface SurfaceBorrow<TPayload> {
  readonly surfaceId: string;
  readonly payload: TPayload;
  readonly ownerGeneration: number;
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number | null;
  assertCurrent(): void;
  release(): void;
}
```

Borrow는 idempotent release를 지원해야 한다.

## 8.4 Pin

Preview, Export, readback, encode처럼 비동기 경계를 넘는 작업은 pin을 사용한다.

```ts
export type SurfacePinPurpose =
  | 'preview-present'
  | 'export-encode'
  | 'gpu-readback'
  | 'worker-transfer'
  | 'independent-decode-verify'
  | 'device-recovery-drain';
```

```ts
interface SurfacePin<TPayload> extends SurfaceBorrow<TPayload> {
  readonly pinId: string;
  readonly purpose: SurfacePinPurpose;
  readonly acquiredAtSequence: number;
  readonly operationId: string;
}
```

### Pin rules

- pin은 반드시 `finally`에서 release한다.
- pin TTL로 강제 폐기하지 않는다.
- 장기 pin은 diagnostics와 receipt에 노출한다.
- device loss는 GPU pin을 정상 완료시키지 않고 abort state로 전환한다.
- export pin은 encode result 또는 terminal error 전까지 유지한다.

---

# 9. Typed disposal

## 9.1 Disposer contract

```ts
export interface SurfaceDisposer {
  readonly disposerId: string;
  readonly allocationClass: SurfaceAllocationClass;
  dispose(record: CanonicalSurfaceRecord): Promise<SurfaceDisposalResult> | SurfaceDisposalResult;
}
```

```ts
export interface SurfaceDisposalResult {
  readonly disposed: boolean;
  readonly physicalDisposeCalled: boolean;
  readonly bytesReleased: number;
  readonly externalReleaseRequired: boolean;
}
```

## 9.2 Per-kind disposal

| Kind | Required disposal |
|---|---|
| CPU TypedArray | registry references 제거, detached 상태 기록 |
| ImageBitmap | `bitmap.close()` exactly once |
| GPUTexture | `texture.destroy()` exactly once |
| GPUBuffer | mapped면 `unmap()`, 이후 `buffer.destroy()` exactly once |
| Blob | registry references 제거 |
| Compatibility mirror | global reference 삭제 후 host bytes 차감 |
| External borrowed | physical dispose 금지, external release evidence 필요 |

## 9.3 Idempotency

두 번의 dispose 요청은 두 번의 물리 disposer 호출이 아니다.

```text
disposeRequestCount >= 1
physicalDisposeCount = 1
```

## 9.4 Disposal ordering

Runtime shutdown 시 기본 순서는 다음과 같다.

```text
1. 신규 surface allocation 금지
2. Preview 신규 presentation 금지
3. Export 신규 job 금지
4. outstanding operations cancel/settle
5. pins release 또는 abort
6. intermediate surfaces dispose
7. final surfaces dispose
8. source/decoded surfaces dispose
9. staging buffers dispose
10. registry ledger seal
11. GPU Authority dispose
```

GPU Authority가 Surface Registry보다 먼저 dispose되면 안 된다.

---

# 10. Device epoch binding

## 10.1 Registration

GPU surface 등록에는 current GPU lease가 필요하다.

```ts
registerGpuTextureSurface(input, gpuLease)
```

다음이 모두 일치해야 한다.

- `gpuLease.runtimeEpoch`
- `gpuLease.deviceEpoch`
- `gpuLease.deviceIdentity`
- authority current snapshot

## 10.2 Device loss reaction

Surface Registry는 GPU Authority recovery participant로 등록한다.

```text
LOSS_DETECTED
→ block new GPU registrations
→ mark old-epoch GPU surfaces INVALID
→ abort old-epoch GPU borrows and pins
→ request DISPOSE_PENDING
→ destroy textures/buffers where legal
→ clear old-epoch resident bytes
→ recovery device commit
→ allow new-epoch allocations
```

## 10.3 CPU surface survival

CPU surfaces는 device loss로 자동 폐기하지 않는다.
단, GPU 결과에서 생성된 CPU readback이 old device operation과 연계되어 incomplete 상태라면 FAILED 처리한다.

## 10.4 Rebuild policy

Surface Registry는 GPU surface를 자동 재생성하지 않는다.
재생성 책임은 producer participant에 있다.

- source upload surface: source bridge가 rebuild 가능
- q-map/tensor/intermediate: pipeline 재실행
- final surface: source revision이 current일 때 pipeline 재실행
- preview view: 새 final surface에서 재생성

old GPUTexture를 새 epoch surface record에 재바인딩하는 행위는 금지한다.

---

# 11. Residency accounting

## 11.1 Ledger dimensions

Ledger는 최소 다음 축을 집계한다.

- runtime epoch
- device epoch
- allocation class
- surface kind
- owner ID
- operation ID
- source revision
- final revision

## 11.2 Metrics

```ts
interface SurfaceResidencySnapshot {
  currentHostBytes: number;
  peakHostBytes: number;
  currentGpuEstimatedBytes: number;
  peakGpuEstimatedBytes: number;
  currentCompatibilityBytes: number;
  peakCompatibilityBytes: number;
  currentSurfaceCount: number;
  peakSurfaceCount: number;
  activePinCount: number;
  peakPinCount: number;
  pendingDisposeCount: number;
  orphanCount: number;
}
```

## 11.3 CPU exact bytes

TypedArray는 다음을 exact byte로 사용한다.

```text
byteLengthExact = data.byteLength
```

## 11.4 GPU texture estimate

GPU implementation의 실제 VRAM allocation을 정확히 안다고 주장하지 않는다.
표준화된 estimate를 사용한다.

```text
baseBytes = width × height × bytesPerPixel(format)
mipFactor = sum over mip levels
sampleFactor = sampleCount
estimatedBytes = aligned(baseBytes × mipFactor × sampleFactor)
```

압축 texture format은 현재 승격 범위에서 사용하지 않는다.
알 수 없는 format은 allocation 전에 fail-closed한다.

## 11.5 GPU buffer bytes

```text
byteLengthEstimated = descriptor.size
```

## 11.6 Compatibility bytes

`__DADUM_FILTERED_SURFACE__`, `__DADUM_FILTERED_RGBA8__`, encoder compatibility payload의 host copy는 반드시 `COMPATIBILITY_MIRROR`로 계산한다.

## 11.7 No silent negative correction

Ledger 불일치가 발생했을 때 값을 0으로 clamp해서 숨기지 않는다.

- negative resident bytes → fatal ledger error
- disposed surface가 current bytes에 남음 → gate fail
- active surface가 ledger에 없음 → orphan fail

---

# 12. Pipeline final promotion transaction

## 12.1 Existing problem

현재 `PipelineService.publishFinalCandidate()`는 다음 순서다.

```text
register new final
set current binding
invalidate previous final
```

이 순서는 이전 surface가 Preview 또는 Export에서 사용 중인지 알지 못한다.

## 12.2 Required transaction

```text
1. candidate surface validation
2. candidate ownership verification
3. candidate pin/borrow state verification
4. candidate final metadata seal
5. registry final-role transition
6. new final binding commit
7. previous final mark INVALID
8. previous final disposal request
9. previous final remains physically alive while pinCount > 0
10. final promotion receipt commit
```

## 12.3 Candidate rules

- candidate는 registry에 이미 등록되어 있어야 한다.
- candidate state는 ACTIVE여야 한다.
- candidate owner는 Pipeline producer 또는 transfer token의 수신자여야 한다.
- final surface는 `EXTERNAL_BORROWED`일 수 없다.
- GPU candidate는 current device epoch여야 한다.
- dimensions, storage, alpha, color contract는 sealed descriptor와 일치해야 한다.

## 12.4 Final-role mutation

Final 승격은 payload 복사가 아니라 role transition이어야 한다.

```ts
promoteFinalSurface({
  candidateSurfaceId,
  sourceRevision,
  pipelineReceiptId,
  producerModuleId,
})
```

CPU surface를 무조건 새 TypedArray로 복사하지 않는다.
필요한 경우 producer가 immutable owned surface를 먼저 등록한다.

## 12.5 Previous final

이전 final surface는 논리적으로 즉시 current final이 아니게 된다.
그러나 이미 실행 중인 export pin이 있으면 physical dispose는 지연한다.

---

# 13. Preview pinning

## 13.1 Preview Presenter requirement

Preview Presenter는 current final binding을 받은 뒤 surface pin을 획득한다.

```text
requireFinal()
→ pinSurface(surfaceId, 'preview-present')
→ present
→ frame committed
→ release pin
```

연속 프레임 표시가 필요한 GPU texture view는 장기 pin을 사용할 수 있으나, 새 final revision이 오면 다음 프레임 경계에서 old pin을 해제해야 한다.

## 13.2 Preview cannot own final surface

Preview는 final surface의 owner가 아니다.
Preview는 pin consumer다.

## 13.3 ImageBitmap handling

`transferFromImageBitmap()` 또는 2D draw 후 bitmap을 계속 보관해야 하는지 명시한다.
Preview가 bitmap ownership을 transfer받지 않았다면 close하지 않는다.
Registry-owned bitmap은 presenter가 아니라 registry disposer가 close한다.

---

# 14. Export pinning

## 14.1 Required flow

```text
Pipeline.requireFinal(expectedRevision)
→ SurfaceRegistry.pin(surfaceId, 'export-encode', exportJobId)
→ construct AuthoritativeExportInput from pinned descriptor
→ encoder execution
→ worker terminal receipt
→ output receipt commit
→ release export pin in finally
```

## 14.2 Revision replacement during export

Export 도중 새 final revision이 승격될 수 있다.
이 경우:

- 진행 중 export는 pin한 old final surface를 계속 사용한다.
- old final은 current binding에서는 제거된다.
- old final은 `INVALID` 또는 `DISPOSE_PENDING`이지만 physical payload는 유지된다.
- export receipt는 pin한 surface ID와 final revision을 기록한다.
- 새 revision으로 몰래 교체하지 않는다.

## 14.3 Worker transfer

TypedArray를 Worker로 transfer하여 source buffer가 detached되는 경우 두 정책 중 하나를 명시한다.

### Policy A: copy-owned-worker-input

- registry surface는 유지
- worker input copy를 `encoder-staging` surface로 등록
- staging buffer를 transfer

### Policy B: exclusive-transfer-final

- final surface를 worker로 직접 transfer하는 것은 기본 금지
- preview, retry, independent decode가 불가능해지므로 별도 명세 없이는 사용하지 않는다.

본 명세 기본값은 Policy A다.

---

# 15. Decoder integration

## 15.1 Decoder output

`DecoderRegistryService.decode()`는 `unknown`을 opaque resource로 등록하지 않는다.
반환값을 canonical surface descriptor로 normalize한 후 Surface Registry에 등록한다.

## 15.2 Browser ImageBitmap decoder

- `createImageBitmap()` 결과는 `decoded-image-bitmap` surface
- ownership은 registry로 이전
- close disposer 등록
- width/height exact
- byte estimate는 width × height × 4로 기록하되 exact VRAM/host location이라고 주장하지 않는다.

## 15.3 Native raster decoder

Native decoder가 TypedArray를 반환하면 exact byte length와 storage를 검증한다.
외부 native handle을 반환하면 별도 disposer callback이 필수다.

## 15.4 PSD/JXL independent decoder

Exact surface metadata가 canonical schema로 변환되어야 한다.
plane별 surface가 존재할 경우 parent/child lineage를 기록한다.

---

# 16. Compatibility mirror retirement

## 16.1 Current globals

- `window.__DADUM_FILTERED_SURFACE__`
- `window.__DADUM_FILTERED_EXPORT_SOURCE__`
- `window.__DADUM_FILTERED_RGBA8__`

## 16.2 Immediate rule

이 명세 베이크 단계에서 globals를 무조건 제거해 레거시 경로를 깨지 않는다.
대신 raw payload 대신 frozen handle facade를 제공한다.

```ts
interface LegacySurfaceFacade {
  readonly runtimeSurfaceId: string;
  readonly sourceRevision: number;
  readonly finalRevision: number;
  readonly pipelineReceiptId: string;
  readonly width: number;
  readonly height: number;
  readonly storage: string;
  acquireReadback?(purpose: string): Promise<Uint8Array>;
}
```

## 16.3 Prohibited mirror behavior

- full RGBA array를 global에 상시 보존
- canonical surface와 별도 수정 가능한 object 보존
- revision 교체 후 old global payload 유지
- mirror memory를 ledger 밖에 보존

## 16.4 Retirement stages

### Stage A: accounted facade

Global은 surface ID 중심 facade만 제공한다.
필요한 readback은 explicit request로 생성한다.

### Stage B: read-only compatibility API

직접 global 대신 `DadumRuntimeSurfaceCompat.acquire()` 사용.

### Stage C: removal

Active Graph에서 모든 consumer가 제거된 뒤 global declaration을 삭제한다.

본 명세 목표는 Stage A 완료와 Stage B API 제공이다.
Stage C는 후속 `TDT-PREVIEW-PRESENTER-01` 또는 `TDT-RESAMPLE-RUNTIME-01`에서 완료할 수 있다.

---

# 17. Direct destruction policy

## 17.1 Canonical rule

Surface payload로 등록된 GPUTexture, GPUBuffer, ImageBitmap에 대한 물리 폐기는 Surface Registry disposer만 수행한다.

## 17.2 Source scan

베이크 후 다음 직접 호출은 허용 목록을 제외하고 0이어야 한다.

- `.destroy()` on registered GPUTexture
- `.destroy()` on registered GPUBuffer
- `.close()` on registered ImageBitmap
- raw global payload overwrite

## 17.3 Local ephemeral exception

함수 내부에서 생성되고 registry에 등록되지 않으며 같은 동기/비동기 scope에서 완전히 폐기되는 local ephemeral object는 허용할 수 있다.

단 다음 증거가 필요하다.

- allocation and disposal in same owner module
- no return, global store, closure retention
- no async escape beyond documented scope
- source audit manifest entry

장기 pipeline intermediate는 ephemeral exception으로 분류하지 않는다.

---

# 18. Concurrency and transaction rules

## 18.1 Registry serialization

동일 surface record의 state transition은 serial queue 또는 atomic critical section으로 처리한다.

## 18.2 Reentrant disposer

Disposer가 diagnostics 또는 downstream callback을 호출해 registry에 재진입해도 동일 surface를 두 번 폐기하지 않는다.

## 18.3 Pin acquisition race

`invalidate()`와 `pin()`이 경쟁할 때 다음 중 하나만 성립해야 한다.

- pin commit이 먼저면 pin 획득 성공 후 invalid
- invalidate commit이 먼저면 신규 pin 거부

중간 상태에서 payload를 반환하지 않는다.

## 18.4 Final promotion race

동일 source revision에서 복수 candidate가 도착하면 Pipeline Authority sequence가 높은 하나만 current final이 된다.
낮은 candidate는 invalid 및 disposal request된다.

---

# 19. Error model

다음 stable error code를 도입한다.

| Error code | Meaning |
|---|---|
| `E_SURFACE_NOT_FOUND` | surface ID 없음 |
| `E_SURFACE_TYPE_MISMATCH` | 요청 payload kind 불일치 |
| `E_SURFACE_STATE_INVALID` | 현재 상태에서 작업 불가 |
| `E_SURFACE_STALE_RUNTIME_EPOCH` | old runtime epoch |
| `E_SURFACE_STALE_DEVICE_EPOCH` | old GPU device epoch |
| `E_SURFACE_DEVICE_IDENTITY_MISMATCH` | device identity 불일치 |
| `E_SURFACE_OWNER_MISMATCH` | owner 권한 불일치 |
| `E_SURFACE_OWNER_GENERATION_STALE` | transfer 후 stale owner token |
| `E_SURFACE_TRANSFER_BLOCKED` | borrow/pin 때문에 transfer 불가 |
| `E_SURFACE_PIN_REJECTED` | invalid/dispose pending surface 신규 pin 거부 |
| `E_SURFACE_BORROW_REJECTED` | borrow 불가 |
| `E_SURFACE_DISPOSE_BLOCKED` | outstanding pin/borrow |
| `E_SURFACE_DOUBLE_PHYSICAL_DISPOSE` | physical disposer 중복 호출 |
| `E_SURFACE_DISPOSER_MISSING` | owned payload에 disposer 없음 |
| `E_SURFACE_DESCRIPTOR_INVALID` | dimensions/format/storage 불일치 |
| `E_SURFACE_BYTE_LENGTH_MISMATCH` | exact byte length 불일치 |
| `E_SURFACE_GPU_FORMAT_UNSUPPORTED` | byte estimate 불가능 format |
| `E_SURFACE_LEDGER_NEGATIVE` | residency 음수 |
| `E_SURFACE_LEDGER_ORPHAN` | record와 ledger 불일치 |
| `E_SURFACE_FINAL_ROLE_INVALID` | final 승격 불가 surface |
| `E_SURFACE_EXPORT_PIN_LOST` | encode 중 pin 유실 |
| `E_SURFACE_COMPATIBILITY_MIRROR_FORBIDDEN` | 비승인 full mirror 생성 |
| `E_SURFACE_DEVICE_LOSS_ABORTED` | device loss로 operation abort |
| `E_SURFACE_SHUTDOWN_LEAK` | shutdown 후 active/pinned record 잔존 |

Error code는 silent fallback을 유발하지 않는다.

---

# 20. Diagnostics events

- `I_SURFACE_REGISTERED`
- `I_SURFACE_BORROW_ACQUIRED`
- `I_SURFACE_BORROW_RELEASED`
- `I_SURFACE_PIN_ACQUIRED`
- `I_SURFACE_PIN_RELEASED`
- `I_SURFACE_TRANSFER_STARTED`
- `I_SURFACE_TRANSFER_COMMITTED`
- `I_SURFACE_INVALIDATED`
- `I_SURFACE_DISPOSE_DEFERRED`
- `I_SURFACE_DISPOSED`
- `I_SURFACE_FINAL_PROMOTED`
- `I_SURFACE_PREVIOUS_FINAL_RETIRED`
- `I_SURFACE_DEVICE_EPOCH_INVALIDATED`
- `I_SURFACE_COMPAT_FACADE_PUBLISHED`
- `I_SURFACE_RESIDENCY_PEAK_UPDATED`

Debug event에 raw pixel bytes를 포함하지 않는다.

---

# 21. Receipt schema

## 21.1 Source receipt

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-SURFACE-LIFECYCLE-01",
  "state": "SURFACE_LIFECYCLE_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME",
  "parentPatchId": "TDT-GPU-DEVICE-SSOT-01",
  "parentSourceSeal": "<sha256>",
  "surfaceAuthority": {
    "serviceId": "dadum.runtime.surface-registry",
    "directOpaqueFinalRegistrationCount": 0,
    "typedDisposerKinds": [],
    "compatibilityMode": "accounted-handle-facade-v1"
  },
  "sourceAudit": {
    "activeCreateTextureSites": 89,
    "activeDestroySitesBefore": 17,
    "directRegisteredPayloadDestroySitesAfter": 0,
    "rawCompatibilityRgbaGlobalsAfter": 0
  },
  "gateCounts": {
    "PASS": 0,
    "DEFERRED": 0,
    "FAIL": 0
  },
  "productionPointerMutated": false,
  "packagedClaims": false
}
```

## 21.2 Runtime receipt

```json
{
  "runtimeEpoch": 12,
  "deviceEpoch": 2,
  "surfaceRegistryId": "dadum.surface.registry.v1",
  "currentHostBytes": 0,
  "peakHostBytes": 0,
  "currentGpuEstimatedBytes": 0,
  "peakGpuEstimatedBytes": 0,
  "currentCompatibilityBytes": 0,
  "peakCompatibilityBytes": 0,
  "registeredSurfaceCount": 0,
  "disposedSurfaceCount": 0,
  "physicalDisposeCountByKind": {},
  "activePinCount": 0,
  "pendingDisposeCount": 0,
  "orphanCount": 0,
  "doubleDisposeCount": 0,
  "oldDeviceEpochActiveSurfaceCount": 0
}
```

## 21.3 Final promotion receipt

- candidate surface ID
- previous final surface ID
- source revision
- final revision
- pipeline receipt ID
- owner transfer evidence
- device epoch
- byte estimate
- compatibility bytes before/after
- previous final disposal state

## 21.4 Export pin receipt

- export job ID
- surface ID
- final revision
- pin ID
- pin acquired sequence
- pin released sequence
- terminal state
- old-final-during-export boolean
- physical disposal after release boolean

---

# 22. Implementation units

권장 파일 구조:

```text
app/src/runtime/surfaces/
  surface-types.ts
  surface-error-codes.ts
  surface-format-bytes.ts
  surface-disposers.ts
  surface-residency-ledger.ts
  surface-registry-authority-service.ts
  surface-compatibility-facade.ts
  surface-receipt.ts
  surface-test-fixtures.ts
```

수정 대상:

```text
app/src/runtime/resource-registry.ts
app/src/runtime/resource-id.ts
app/src/runtime/service-token.ts
app/src/runtime/service-container.ts
app/src/boot/runtime-modules.ts
app/src/runtime/gpu/gpu-device-authority-service.ts
app/src/runtime/decode/decoder-registry-service.ts
app/src/runtime/pipeline/pipeline-service.ts
app/src/runtime/pipeline/legacy-final-surface-bridge-service.ts
app/src/runtime/preview/preview-presenter-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/env.d.ts
app/legacy-runtime/input/export_surface_ssot.js
app/legacy-runtime/input/export_download_bridge.js
app/legacy-runtime/resize_export_bind.js
```

필요한 legacy module은 Active Graph 기준으로만 수정한다.

---

# 23. Migration sequence

## Phase A: typed registry foundation

1. Surface types와 error codes 추가
2. Residency ledger 추가
3. typed disposers 추가
4. Surface Registry service 추가
5. boot capability 결선
6. mock runtime smoke 작성

## Phase B: decoder adoption

1. browser ImageBitmap decoder 등록 전환
2. native decoder output normalizer
3. JXL/PSD exact surface normalizer
4. opaque `decoded-surface` registration 퇴역

## Phase C: final surface adoption

1. Legacy bridge가 candidate surface ID를 받도록 전환
2. raw `unknown` final value 등록 금지
3. Pipeline promotion transaction 적용
4. previous final deferred disposal

## Phase D: Preview and Export pins

1. Preview pin
2. Export pin
3. worker staging surface accounting
4. revision replacement stress

## Phase E: compatibility mirror retirement

1. full global payload 제거
2. accounted handle facade
3. explicit readback API
4. legacy consumer migration manifest

## Phase F: device loss and shutdown

1. Surface Registry recovery participant 등록
2. old epoch GPU surface invalidation
3. disposal drain
4. shutdown leak gate

---

# 24. Source gate matrix

## SL01-01 Parent identity

Parent patch ID와 ZIP digest가 명세 입력과 일치해야 한다.

## SL01-02 No production mutation

Production Pointer 변경 코드와 receipt가 없어야 한다.

## SL01-03 Surface service registered

`dadum.runtime.surface-registry`가 service container에 등록되어야 한다.

## SL01-04 Boot dependency exact

Surface lifecycle module이 GPU Authority 이후, decode/pipeline 이전에 활성화되어야 한다.

## SL01-05 Typed schema complete

필수 common descriptor 필드가 모두 존재해야 한다.

## SL01-06 Surface state machine exact

허용 transition table이 코드와 spec에서 일치해야 한다.

## SL01-07 Illegal transition rejection

`DISPOSED → ACTIVE` 등 금지 transition smoke가 실패해야 한다.

## SL01-08 Deterministic surface ID

ID가 runtime epoch, device epoch, deterministic sequence를 포함해야 한다.

## SL01-09 Opaque final registration zero

`resources.register('final-surface', ..., unknown)` 경로가 0이어야 한다.

## SL01-10 Opaque decoded registration zero

`resources.register('decoded-surface', ..., unknown)` 경로가 0이어야 한다.

## SL01-11 CPU exact byte validation

TypedArray byte length mismatch가 fail-closed해야 한다.

## SL01-12 GPU descriptor validation

GPU texture format, dimension, usage, epoch 검증이 존재해야 한다.

## SL01-13 ImageBitmap disposer

Registry-owned bitmap에 close disposer가 있어야 한다.

## SL01-14 GPUTexture disposer

Registry-owned texture에 destroy disposer가 있어야 한다.

## SL01-15 GPUBuffer disposer

Mapped buffer unmap 및 destroy disposer가 있어야 한다.

## SL01-16 Double physical dispose zero

동일 payload에 physical disposer가 두 번 호출되지 않아야 한다.

## SL01-17 Owner identity required

모든 surface는 owner ID와 owner generation을 가져야 한다.

## SL01-18 Transfer token exact

Ownership transfer가 prepare/commit/abort 구조여야 한다.

## SL01-19 Transfer blocked by pin

Pin이 있는 surface의 transfer commit이 거부되어야 한다.

## SL01-20 Borrow lifecycle

Borrow acquire/release counter가 정확히 복원되어야 한다.

## SL01-21 Pin lifecycle

Pin acquire/release counter가 정확히 복원되어야 한다.

## SL01-22 New pin on invalid rejected

Invalid surface의 신규 pin 획득이 거부되어야 한다.

## SL01-23 Deferred disposal

Pin이 있는 invalid surface는 physical dispose되지 않아야 한다.

## SL01-24 Dispose after last pin

마지막 pin release 직후 pending dispose가 완료되어야 한다.

## SL01-25 Final candidate pre-registration

Pipeline은 registry에 없는 candidate를 승격할 수 없어야 한다.

## SL01-26 Final owner verification

권한 없는 owner가 final role을 부여할 수 없어야 한다.

## SL01-27 Final device epoch current

Old device epoch GPU surface의 final 승격이 거부되어야 한다.

## SL01-28 Final promotion no mandatory copy

Owned immutable CPU surface가 복제 없이 role transition될 수 있어야 한다.

## SL01-29 Previous final invalidation

새 final commit 후 이전 final이 current binding에서 제거되어야 한다.

## SL01-30 Previous final pin conservation

이전 final이 export pin 중이면 payload가 유지되어야 한다.

## SL01-31 Export pin finally

성공, encoder error, cancel 모두에서 export pin이 release되어야 한다.

## SL01-32 Preview pin finally

Preview present 성공/실패 모두에서 pin이 release되어야 한다.

## SL01-33 Revision replacement stress

Export 중 final revision 교체가 old export input을 바꾸지 않아야 한다.

## SL01-34 Worker staging accounted

Worker copy/transfer buffer가 encoder staging surface로 기록되어야 한다.

## SL01-35 Final direct transfer forbidden

별도 policy 없이 final surface ArrayBuffer를 worker로 직접 detach할 수 없어야 한다.

## SL01-36 Host bytes exact

CPU typed surface current/peak host bytes가 exact해야 한다.

## SL01-37 GPU bytes deterministic estimate

동일 descriptor에서 동일 estimate가 생성되어야 한다.

## SL01-38 Unknown GPU format rejected

지원하지 않는 format의 estimate를 추정값 0으로 통과시키지 않아야 한다.

## SL01-39 Compatibility bytes accounted

호환 mirror 또는 facade readback이 ledger에 기록되어야 한다.

## SL01-40 Negative ledger impossible

중복 release/dispose에서 resident bytes가 음수가 되지 않아야 한다.

## SL01-41 Orphan detection

Ledger allocation이 있는데 surface record가 없으면 fail해야 한다.

## SL01-42 Unaccounted record detection

Active record가 ledger에 없으면 fail해야 한다.

## SL01-43 GPU loss registration block

Loss invalidation 중 신규 GPU surface 등록이 거부되어야 한다.

## SL01-44 Old epoch bulk invalidation

Device loss 시 old epoch GPU surface가 모두 invalid되어야 한다.

## SL01-45 GPU pin abort

Old epoch GPU pin이 device-loss terminal state를 받아야 한다.

## SL01-46 CPU survival on device loss

독립 CPU source surface는 device loss 후에도 active일 수 있어야 한다.

## SL01-47 No old texture rebinding

Old texture payload를 new epoch record에 등록할 수 없어야 한다.

## SL01-48 Recovery participant ordering

Surface invalidation이 pipeline rebuild보다 먼저 실행되어야 한다.

## SL01-49 Shutdown allocation closed

Dispose 시작 후 신규 allocation이 거부되어야 한다.

## SL01-50 Shutdown pin drain

Shutdown terminal receipt에서 active pin count가 0이어야 한다.

## SL01-51 Shutdown surface leak zero

Registry dispose 후 active, invalid, pending surface가 남지 않아야 한다.

## SL01-52 Compatibility full RGBA global zero

`__DADUM_FILTERED_RGBA8__`에 full array를 상시 보존하는 경로가 0이어야 한다.

## SL01-53 Compatibility mutable surface zero

`__DADUM_FILTERED_SURFACE__`가 mutable raw payload를 보존하지 않아야 한다.

## SL01-54 Compatibility facade frozen

Compatibility facade가 frozen handle이어야 한다.

## SL01-55 Explicit readback only

호환 RGBA readback은 explicit async acquisition을 통해서만 생성되어야 한다.

## SL01-56 Active direct registered destroy zero

등록된 surface payload의 직접 destroy/close 호출이 registry 밖에서 0이어야 한다.

## SL01-57 Ephemeral exception manifest

허용된 local ephemeral allocation은 audit manifest에 기록되어야 한다.

## SL01-58 Existing GPU Authority gate conservation

`TDT-GPU-DEVICE-SSOT-01` source gate가 회귀하지 않아야 한다.

## SL01-59 Existing Active Graph gate conservation

Active Graph PASS/DEFERRED 상태가 회귀하지 않아야 한다.

## SL01-60 Existing codec and export gate conservation

R7, Export Worker 01~07, Export Promotion 01~03, JXL, PSD, MODJPEG, Native source gate가 회귀하지 않아야 한다.

---

# 25. Runtime smoke matrix

## 25.1 CPU surface smoke

- RGBA8 4×4 등록
- borrow 2회
- pin 1회
- invalidate
- dispose request
- borrow release
- physical dispose 대기
- pin release
- final dispose
- host bytes 64 → 0

## 25.2 ImageBitmap smoke

Mock bitmap close count가 정확히 1이어야 한다.

## 25.3 GPU texture smoke

Mock texture destroy count가 정확히 1이어야 한다.

## 25.4 Device loss smoke

- epoch 1 GPU surfaces 3개
- CPU surface 1개
- GPU pin 1개
- loss event
- epoch 1 GPU surfaces invalid
- GPU pin abort
- CPU surface active
- recovery epoch 2
- epoch 1 active GPU surface 0

## 25.5 Final replacement smoke

- final A publish
- export pin A
- final B publish
- A invalid/pending, payload alive
- export A complete
- A dispose
- B active

## 25.6 Compatibility smoke

- global contains handle only
- no full RGBA array retained
- explicit readback creates temporary accounted surface
- readback release returns bytes to baseline

---

# 26. Packaged runtime deferred gates

다음은 Windows x64 Packaged Electron과 실제 GPU에서만 검증한다.
Source bake 단계에서 PASS로 위조하지 않는다.

1. 실제 GPUTexture allocation 반복 후 estimated plateau
2. actual process private bytes와 ledger trend 상관관계
3. 100회 final revision 교체 후 active surface plateau
4. JXL/MODJPEG/PNG/PSD export 중 revision replacement
5. Electron relaunch 후 surface leak zero
6. 실제 device loss 또는 test-only destroy recovery
7. Preview 장기 표시 중 final replacement
8. 16bit final surface host residency
9. PSD worker staging peak
10. packaged compatibility facade consumer parity

이 항목은 `DEFERRED_PACKAGED_RUNTIME`로 기록한다.

---

# 27. Acceptance states

## 27.1 Source baked

```text
SURFACE_LIFECYCLE_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME
```

조건:

- Source Gate PASS
- mock runtime smoke PASS
- regression PASS
- Production Pointer 무변이
- packaged claim 없음

## 27.2 Packaged verified

```text
SURFACE_LIFECYCLE_VERIFIED_UNPROMOTED
```

조건:

- Windows x64 package boot
- physical GPU runtime smoke
- revision replacement stress
- device loss recovery
- shutdown leak zero
- output conservation

## 27.3 Forbidden promotion

이 명세 단독으로 다음 상태를 선언할 수 없다.

- `PRODUCTION_PROMOTED`
- `RESAMPLE_RUNTIME_VERIFIED`
- `PREVIEW_EXPORT_PARITY_VERIFIED`
- `MEMORY_BUDGET_VERIFIED`

---

# 28. Output conservation

Surface lifecycle migration은 픽셀 알고리즘을 바꾸지 않는다.

다음 fixture에서 migration 전후 output을 비교한다.

- RGBA8 opaque
- RGBA8 alpha
- RGBA16
- hidden RGB
- JXL lossless
- PNG8/PNG16
- WebP lossless
- JPEG explicit matte
- PSD composite

허용 변화:

- receipt의 surface ID
- lifecycle metrics
- compatibility facade shape

금지 변화:

- final dimensions
- channel order
- alpha policy
- ICC metadata policy
- encoder options
- encoded pixel result where deterministic codec contract applies

---

# 29. Rollback

## 29.1 Source rollback

- parent artifact `TDT-GPU-DEVICE-SSOT-01` 보존
- 변경 파일 manifest 생성
- complete patch 제공
- source receipt 제공

## 29.2 Runtime rollback

Surface Registry 초기화 실패 시 opaque registry로 조용히 fallback하지 않는다.
Runtime boot를 fail-closed한다.

## 29.3 Pointer rollback

Production Pointer를 건드리지 않으므로 본 명세에서 product rollback은 발생하지 않는다.

---

# 30. Security and data handling

- diagnostics에 raw pixel bytes 기록 금지
- surface content digest는 필요할 때만 계산
- large pixel buffer를 JSON receipt에 직렬화 금지
- external path 또는 file name은 별도 privacy policy를 따른다.
- disposer error가 pixel buffer dump를 포함하지 않아야 한다.

---

# 31. Required tools

```text
tools/surface-lifecycle-01/
  generate-surface-audit.mjs
  verify-surface-schema.mjs
  verify-surface-state-machine.mjs
  verify-surface-disposer-ownership.mjs
  verify-surface-compatibility-retirement.mjs
  run-surface-lifecycle-runtime-smoke.mjs
  run-final-replacement-stress.mjs
  generate-surface-source-receipt.mjs
```

각 tool은 repository root를 명시적으로 받고, current working directory에 의존하지 않는다.

---

# 32. Required artifacts

```text
artifacts/surface-lifecycle-01/source-bake/
  TDT_SURFACE_LIFECYCLE_01_SOURCE_RECEIPT.json
  TDT_SURFACE_LIFECYCLE_01_AUDIT.json
  TDT_SURFACE_LIFECYCLE_01_RUNTIME_SMOKE.json
  TDT_SURFACE_LIFECYCLE_01_REGRESSION_SUMMARY.json

artifacts/surface-lifecycle-01/packaged-runtime/
  TDT_SURFACE_LIFECYCLE_01_PACKAGED_RECEIPT.json
  TDT_SURFACE_LIFECYCLE_01_RESIDENCY_TRACE.json
  TDT_SURFACE_LIFECYCLE_01_DEVICE_LOSS_RECEIPT.json
  TDT_SURFACE_LIFECYCLE_01_FINAL_REPLACEMENT_RECEIPT.json
```

Packaged artifacts는 실제 실행 전 생성하지 않는다.

---

# 33. Baking checklist

- [ ] Parent artifact exact 확인
- [ ] Surface types 추가
- [ ] Surface registry service 추가
- [ ] Residency ledger 추가
- [ ] Typed disposer 추가
- [ ] GPU recovery participant 결선
- [ ] Decoder output 전환
- [ ] Pipeline promotion transaction 전환
- [ ] Preview pin 결선
- [ ] Export pin 결선
- [ ] Worker staging accounting
- [ ] Compatibility full mirror 제거
- [ ] Compatibility handle facade 추가
- [ ] Active direct destruction audit
- [ ] Source gate 실행
- [ ] Runtime mock smoke 실행
- [ ] Existing regression 실행
- [ ] Changed file manifest 생성
- [ ] README APPLIED 생성
- [ ] Patch 생성
- [ ] ZIP 생성
- [ ] ZIP 독립 해제 재검증
- [ ] SHA-256 생성

---

# 34. Final seal statement

`TDT-SURFACE-LIFECYCLE-01`이 닫혔다는 것은 단순히 texture에 `destroy()`를 몇 개 추가했다는 뜻이 아니다.

다음을 동시에 증명해야 한다.

```text
Every surface has one identity.
Every surface has one owner.
Every physical allocation has one disposer.
Every async consumer holds an explicit pin.
Every device-bound surface belongs to one device epoch.
Every byte is accounted once.
Every superseded final surface survives exactly as long as required.
Every compatibility copy is visible and temporary.
Every shutdown reaches zero live surfaces.
```

이 봉인이 완료된 뒤에야 `TDT-PREVIEW-PRESENTER-01`, `TDT-RESAMPLE-RUNTIME-01`, `TDT-MEMORY-BUDGET-01`이 같은 표면을 같은 의미로 다룰 수 있다.

현재 다듬다듬은 GPU 장치의 관제권을 하나로 합쳤다.
다음 단계는 그 장치 위를 흐르는 픽셀의 몸에 출생증명서와 퇴실 영수증을 붙이는 일이다.

---

# End of specification
