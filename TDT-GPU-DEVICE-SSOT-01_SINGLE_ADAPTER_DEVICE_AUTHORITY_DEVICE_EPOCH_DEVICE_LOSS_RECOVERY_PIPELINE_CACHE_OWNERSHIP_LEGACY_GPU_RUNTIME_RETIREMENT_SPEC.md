# TDT-GPU-DEVICE-SSOT-01

## Single Adapter·Device Authority / Device Epoch / Device Loss Recovery / Pipeline Cache Ownership / Legacy GPU Runtime Retirement Seal

- Spec ID: `TDT-GPU-DEVICE-SSOT-01`
- 상태: `SPEC_ONLY_UNBAKED`
- 목표 성공 상태: `GPU_DEVICE_SSOT_VERIFIED_UNPROMOTED`
- 선행 기준선:
  - `TDT-PROMOTION-BASELINE-00`
  - `TDT-ACTIVE-GRAPH-01`
  - `TDT-RUNTIME-SSOT-01-R1`
  - `TDT-RUNTIME-SSOT-01-R7`
- 후속 인계:
  - `TDT-SURFACE-LIFECYCLE-01`
  - `TDT-PREVIEW-PRESENTER-01`
  - `TDT-RESAMPLE-RUNTIME-01`

---

## 0. 목적

이 명세는 다듬다듬의 활성 renderer runtime에서 WebGPU adapter와 device를 생성하고 소유하는 권한을 하나의 Authority로 통합한다.

현재 새 Runtime Shell에는 `GpuService`가 존재하지만, 실제 활성 Legacy Runtime 여러 지점이 여전히 직접 다음 작업을 수행한다.

- `navigator.gpu.requestAdapter()`
- `adapter.requestDevice()`
- `device.lost.then(...)`
- 전역 `__DADUM_WEBGPU_DEVICE__` 및 `__DADUM_WEBGPU_ADAPTER__` 게시
- 파일별 shader module 생성
- 파일별 compute/render pipeline cache 생성
- 파일별 device epoch 증가
- 파일별 device-lost event 발행

따라서 현재 구조에서는 이름상 `GpuService`가 존재해도 다음 질문에 단일 답이 없다.

1. 어떤 adapter가 제품 adapter인가.
2. 어떤 device가 현재 유효한 device인가.
3. device가 유실됐을 때 어떤 resource와 pipeline이 폐기되는가.
4. old device에서 생성된 texture, buffer, bind group, pipeline이 새 device에서 재사용되지 않는가.
5. 동일 shader와 pipeline descriptor가 몇 번 컴파일되는가.
6. device-lost 진단과 recovery를 누가 한 번만 발행하는가.
7. Legacy Runtime이 다시 독립 device를 만드는 것을 무엇이 막는가.

본 명세의 목적은 위 질문의 SSOT를 다음 하나로 고정하는 것이다.

```text
GpuDeviceAuthority
├─ Adapter Selection Authority
├─ Device Creation Authority
├─ Runtime Epoch / Device Epoch Authority
├─ Device Lease Authority
├─ Device Loss State Machine
├─ Pipeline Cache Authority
├─ Shader Module Cache Authority
├─ GPU Error Scope Authority
├─ Recovery Participant Registry
└─ GPU Receipt Ledger
```

본 명세는 WebGPU 알고리즘을 변경하지 않는다.

본 명세는 EWA, ΔK, Q-map, Q-wave, Blend-If, depth bake의 계산식이나 파라미터를 수정하지 않는다.

본 명세는 그 알고리즘들이 사용하는 GPU 권한과 생명주기를 단일화한다.

---

## 1. 현재 확정 상태

### 1.1 Canonical Runtime의 명목상 소유자

현재 새 Runtime Shell에는 다음 서비스가 존재한다.

```text
app/src/runtime/gpu/gpu-service.ts
```

현재 `GpuService`는 다음 기능을 가진다.

- Runtime epoch 수신
- adapter 요청
- device 요청
- `device.lost` 관찰
- `dadum:runtime-device-lost` event 발행
- dispose 시 `device.destroy()` 호출
- lost device 접근 거부

그러나 이 서비스의 device가 Legacy WebGPU 계산 경로에 실제로 주입되지 않는다.

따라서 현재 `dadum.gpu.device` capability는 선언상 Authority이지만, 실제 계산 그래프 전체의 Authority는 아니다.

### 1.2 활성 그래프 기준 직접 GPU 권한 사용

`TDT-ACTIVE-GRAPH-01`의 `ACTIVE_REQUIRED` 및 `ACTIVE_OPTIONAL` node와 새 Runtime GPU service를 대상으로 한 정적 스캔에서 다음이 확인된다.

```text
Scanned active nodes:      272
GPU-related source files:   25
requestAdapter call sites:   8
requestDevice call sites:    9
pipeline creation sites:    49
shader module sites:        54
device-lost observers:       3
raw global device refs:     13
```

위 숫자는 archive, quarantine, patch 문서, spec 문서를 제외한 현재 활성 그래프 기준이다.

### 1.3 직접 device 생성이 확인된 주요 경로

다음 경로는 현재 활성 그래프에서 독립적으로 adapter 또는 device를 생성한다.

| 경로 | 현재 역할 | 현재 결함 |
|---|---|---|
| `app/src/runtime/gpu/gpu-service.ts` | 새 Runtime GPU service | Legacy 계산 경로에 device 미주입 |
| `app/legacy-runtime/core/compute/qmap_webgpu/runtime.js` | Q-map WebGPU runtime | 자체 adapter, device, epoch, lost handler 소유 |
| `app/legacy-runtime/webgpu_runtime.js` | 범용 Legacy WebGPU helper | 자체 device 요청, limits retry, lost event 소유 |
| `app/legacy-runtime/core/webgpu_depth_bake.js` | depth bake | 자체 adapter, device, pipeline map 소유 |
| `app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js` | FFT Q-map | 호출마다 독립 init 가능 |
| `app/legacy-runtime/core/compute/mask_webgpu/mask_localized_manager.js` | localized mask | 직접 device 생성과 raw global 참조 혼재 |
| `app/legacy-runtime/qwave/qwave_system.js` | Q-wave | 자체 device 생성 |
| `app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js` | export WGSL downscale | raw global device 우선, 없으면 자체 생성 |
| `app/legacy-runtime/core/worker_porttrace.js` | Worker trace GPU path | Worker realm 자체 device 생성 |
| `app/legacy-runtime/core/compute/qmap_webgpu/worker_porttrace.js` | Q-map Worker trace | Worker realm 자체 device 생성 |

### 1.4 현재 Device Epoch 분열

현재 최소 두 종류의 epoch가 존재한다.

1. 새 Runtime bootstrap의 runtime epoch
2. Q-map runtime 내부 `_deviceEpoch`

현재 Q-map runtime은 `device.lost` 시 자체 `_deviceEpoch`를 증가시킨다.

새 `GpuService`는 bootstrap에서 받은 runtime epoch를 유지하지만 device recreation epoch를 별도로 가지지 않는다.

이 구조에서는 다음 상황을 정확히 구분할 수 없다.

```text
같은 Runtime Epoch + 새 Device
새 Runtime Epoch + 새 Device
같은 Runtime Epoch + stale Q-map Texture
새 Runtime Epoch + Legacy Global Device 잔존
```

### 1.5 현재 Device Lost 이벤트 분열

현재 확인되는 event 또는 callback 계열은 다음과 같다.

- `dadum:runtime-device-lost`
- `dadum:webgpu-device-lost`
- Q-map `_deviceLostListeners`
- 각 Legacy helper의 `onDeviceLost`

같은 device loss가 여러 진단과 event로 중복 투사될 수 있다.

반대로 새 `GpuService`가 소유한 device와 Legacy Q-map device가 다르면, 한쪽 loss가 다른 쪽 resource를 무효화하지 못한다.

### 1.6 현재 Pipeline Cache 분열

Pipeline 및 shader module은 여러 파일에서 개별 생성된다.

대표적으로 다음이 존재한다.

- Q-map runtime의 여러 `pipelinePromise` slot
- depth bake의 `state.pipelines`
- FFT Q-map class 내부 pipeline fields
- mask manager의 local pipeline maps
- pass별 module-local `cache.pipeline`
- shader warmup 경로
- `webgpu_cache_shaders.js`

현재 cache key가 다음 요소를 모두 포함한다는 단일 증거가 없다.

- device epoch
- shader digest
- entry point
- pipeline kind
- layout identity
- override constants
- color target format
- sample count
- blend state
- depth state
- primitive state

따라서 같은 label을 가진 다른 pipeline의 충돌 또는 old device pipeline의 재사용을 구조적으로 막지 못한다.

### 1.7 현재 전역 Raw Device Alias

현재 Legacy Runtime은 다음 raw global을 참조하거나 게시한다.

```text
__DADUM_WEBGPU_DEVICE__
__DADUM_WEBGPU_ADAPTER__
```

Raw `GPUDevice`를 전역으로 게시하면 다음을 증명할 수 없다.

- 소비자 identity
- lease 생성 시점
- device epoch
- stale access
- disposal 책임
- pipeline 생성 책임
- loss 후 reference 제거 완료

본 명세에서는 이 raw alias를 제품 경로에서 퇴역시킨다.

---

## 2. 성공 상태와 상한

### 2.1 성공 상태

본 명세의 성공 상태는 다음이다.

```text
GPU_DEVICE_SSOT_VERIFIED_UNPROMOTED
```

이 상태는 다음을 의미한다.

1. renderer WebGPU realm에서 adapter 요청 권한은 하나의 Authority만 가진다.
2. renderer WebGPU realm에서 active device는 최대 1개다.
3. 모든 제품 WebGPU 소비자는 epoch-tagged lease를 통해 device에 접근한다.
4. 모든 device loss는 단일 state machine과 단일 receipt chain으로 처리된다.
5. old device epoch의 lease, pipeline, shader module, GPU resource wrapper는 재사용되지 않는다.
6. pipeline과 shader module cache는 단일 Authority가 소유한다.
7. Legacy Runtime의 직접 adapter/device 생성 경로는 제거, adapter화 또는 quarantine된다.
8. raw global device/adapter alias는 제품 경로에서 0개다.
9. 제품 runtime의 WebGPU Worker 자체 device 생성은 0개다.
10. device recovery 후 Q-map 및 최소 compute smoke가 새 epoch에서 재실행된다.

### 2.2 성공 상태가 의미하지 않는 것

본 명세의 PASS는 다음을 의미하지 않는다.

- 모든 GPUTexture와 GPUBuffer의 제품 전체 메모리 수명 봉인
- Preview와 Export의 final surface identity 완성
- 모든 WebGL 경로 제거
- EWA 및 ΔK 계산 품질 승격
- 대형 이미지 타일링
- VRAM peak budget 승격
- Native decoder 또는 codec promotion
- Production Pointer 변경

이 항목은 후속 명세의 책임이다.

### 2.3 승격 상한

본 명세는 Production Pointer를 변경하지 않는다.

최대 상태는 다음으로 제한한다.

```text
SOURCE_BAKED
+ PACKAGED GPU AUTHORITY OBSERVED
+ DEVICE LOSS RECOVERY OBSERVED
+ LEGACY DIRECT DEVICE CREATION ZERO
= GPU_DEVICE_SSOT_VERIFIED_UNPROMOTED
```

---

## 3. 비목표

다음은 본 명세의 비목표다.

1. WebGPU shader 알고리즘 변경
2. Q-map 정확도 조정
3. ΔK 또는 Q-wave 수식 변경
4. WebGL preview 완전 제거
5. CPU fallback 구현
6. WebGPU가 없는 환경 지원
7. GPU Worker 다중 device promotion
8. cross-window GPUDevice 공유
9. multi-GPU load balancing
10. adapter vendor 고정
11. 특정 RTX 모델 하드코딩
12. pipeline binary disk cache 구현
13. 브라우저 내부 shader cache를 제품 SSOT로 간주
14. Surface Lifecycle 전체 구현
15. GPU memory allocator 재설계

---

## 4. 규범 용어

본 명세에서 다음 용어를 사용한다.

- **MUST**: 반드시 충족해야 한다.
- **MUST NOT**: 반드시 금지한다.
- **SHOULD**: 정당한 예외가 없으면 충족한다.
- **MAY**: 선택적으로 허용한다.
- **Authority**: adapter/device 생성과 상태 전이를 결정하는 유일한 소유자다.
- **Runtime Epoch**: renderer bootstrap instance의 세대다.
- **Device Epoch**: 같은 Runtime Epoch 내부에서 active `GPUDevice`가 교체될 때 증가하는 세대다.
- **Lease**: 특정 owner가 특정 device epoch에 접근하도록 발행된 불변 capability다.
- **Stale**: lease 또는 resource의 device epoch가 현재 Authority epoch와 다르거나 Authority state가 ACTIVE가 아닌 상태다.
- **Recovery Participant**: device loss 시 정해진 순서로 invalidation 및 rebuild에 참여하는 등록된 소비자다.
- **Pipeline Descriptor Digest**: pipeline 생성 의미를 결정하는 모든 필드의 canonical digest다.
- **Renderer Realm**: 현재 Electron renderer의 JavaScript execution realm이다.
- **Child GPU Realm**: Worker 등 별도 JavaScript execution realm에서 WebGPU device를 소유하는 영역이다.

---

# PART A. Authority SSOT

## 5. 단일 Authority

### 5.1 Canonical Service

다음 서비스가 유일한 adapter/device Authority가 된다.

```text
app/src/runtime/gpu/gpu-device-authority-service.ts
```

기존 `gpu-service.ts`는 다음 중 하나로 처리한다.

- canonical service로 rename 및 확장
- 호환 re-export facade로 축소

두 독립 service가 동시에 존재해서는 안 된다.

### 5.2 Service ID

Canonical service ID는 다음으로 고정한다.

```text
dadum.service.gpu-device-authority
```

Capability ID는 다음으로 고정한다.

```text
dadum.gpu.authority
```

기존 `dadum.gpu.device` capability는 다음 중 하나로만 유지할 수 있다.

1. `dadum.gpu.authority`를 가리키는 deprecated alias
2. 동일 owner module이 게시하는 compatibility capability

Raw `GPUDevice` 자체를 capability registry에 게시해서는 안 된다.

### 5.3 단일 생성 권한

제품 source에서 다음 호출은 Authority 구현 파일 외부에서 금지한다.

```text
navigator.gpu.requestAdapter(...)
adapter.requestDevice(...)
```

AST Source Gate는 문자열 검색만이 아니라 다음 alias까지 추적해야 한다.

```js
const gpu = navigator.gpu;
const request = gpu.requestAdapter.bind(gpu);
await request();
```

다음 우회도 금지한다.

- computed property call
- destructured call
- eval-generated call
- Function constructor
- dynamic import로 숨긴 authority
- raw global adapter/device fallback

### 5.4 Realm 범위

본 명세의 Single Device 보장은 renderer realm에 적용한다.

```text
renderer realm active adapter count <= 1
renderer realm active device count  <= 1
```

Worker realm에서 자체 WebGPU device를 생성하는 제품 경로는 본 명세에서 금지한다.

Worker WebGPU가 필수라면 다음 후속 명세가 먼저 필요하다.

```text
TDT-GPU-WORKER-AUTHORITY-01
```

그 전까지 Worker의 직접 `requestAdapter` 및 `requestDevice`는 다음 중 하나여야 한다.

- quarantine
- test-only exclusion
- renderer Authority 경로로 기능 이전
- 비-GPU trace helper로 축소

### 5.5 Authority Instance Count

Runtime composition 하나에는 Authority instance가 정확히 하나 존재해야 한다.

다음은 실패다.

- module activation 중복
- hot reload 후 이전 Authority 잔존
- relaunch 후 전역 old Authority 잔존
- Legacy script가 자체 singleton 생성
- test hook가 별도 Authority 생성

---

## 6. Authority Manifest

### 6.1 파일

다음 manifest를 추가한다.

```text
app/src/runtime/gpu/gpu-authority-profile.json
```

### 6.2 Schema

```json
{
  "schemaVersion": 1,
  "authorityId": "dadum.gpu.authority.v1",
  "realmPolicy": "renderer-only",
  "adapterRequest": {
    "powerPreference": "high-performance",
    "forceFallbackAdapter": false
  },
  "deviceProfiles": [
    {
      "profileId": "dadum.device.core.v1",
      "requiredFeatures": [],
      "requiredLimits": {},
      "optionalLimits": {
        "maxStorageBufferBindingSize": 134217728
      }
    }
  ],
  "recovery": {
    "enabled": true,
    "maxAttemptsPerRuntimeEpoch": 1,
    "reuseSelectedAdapterFirst": true,
    "allowAdapterReselection": false
  },
  "pipelineCache": {
    "schemaVersion": 1,
    "failedEntryPolicy": "evict",
    "crossEpochReuse": false
  }
}
```

### 6.3 Manifest Digest

Authority initialization receipt는 manifest SHA-256을 포함해야 한다.

Runtime 중 manifest mutation은 금지한다.

### 6.4 암묵적 기본값 금지

Authority 구현은 manifest에 없는 다음 값을 코드 내부 임의 기본값으로 조용히 채워서는 안 된다.

- power preference
- fallback adapter 허용
- recovery 횟수
- required feature
- required limit
- optional limit
- pipeline cache cross-epoch 정책

Schema default가 필요하면 generator 단계에서 canonical JSON에 명시한다.

---

# PART B. Adapter Selection Authority

## 7. Adapter 요청

### 7.1 단일 요청 Transaction

초기 bootstrap에서 adapter selection은 하나의 promise transaction으로 수행한다.

동시 소비자가 Authority를 요청해도 실제 `requestAdapter()`는 한 번만 실행되어야 한다.

```text
UNINITIALIZED
→ ADAPTER_REQUESTING
→ ADAPTER_SELECTED
```

### 7.2 Adapter Request Options

Adapter request options는 Authority manifest에서만 온다.

Legacy module이 `high-performance`, `low-power`, `forceFallbackAdapter`를 개별 지정해서는 안 된다.

### 7.3 Adapter Identity

가능한 경우 adapter identity는 다음으로 구성한다.

- `GPUAdapterInfo` 제공 필드
- features sorted list digest
- limits canonical digest
- fallback adapter 여부
- request options digest

브라우저가 vendor/device 정보를 제공하지 않아도 PASS 가능하다.

그 경우 identity는 다음을 최소 포함한다.

```text
adapterInfoAvailable=false
featuresDigest
limitsDigest
requestOptionsDigest
```

제공되지 않은 vendor 정보를 추정해서는 안 된다.

### 7.4 Adapter 재선택

기본 정책은 다음이다.

```text
allowAdapterReselection=false
```

Device loss recovery에서는 선택된 adapter에 새 device를 먼저 요청한다.

Adapter 자체를 다시 선택하려면 manifest에서 명시적으로 허용해야 하며, 별도 adapter replacement receipt가 필요하다.

### 7.5 Adapter Failure

다음 상황은 fail-closed다.

- `navigator.gpu` 부재
- null adapter
- manifest parse 실패
- required feature 부재
- required limit 미충족
- adapter identity observation 실패로 인해 required proof를 만들 수 없음

---

## 8. Feature 및 Limit 협상

### 8.1 Required Feature

`requiredFeatures`는 adapter가 제공하지 않으면 즉시 실패한다.

Required feature를 제거하고 재시도하는 조용한 downgrade는 금지한다.

### 8.2 Required Limit

Required limit은 adapter limit보다 높으면 실패한다.

다음 기존 패턴은 제품 경로에서 금지한다.

```text
requestDevice(requiredLimits)
실패
requestDevice()로 재시도
```

재시도 가능한 profile은 manifest의 `deviceProfiles`에 별도 `profileId`로 선명하게 존재해야 한다.

### 8.3 Optional Limit

Optional limit은 다음 규칙으로 협상한다.

```text
negotiated = min(adapterLimit, requestedOptionalLimit)
```

그러나 negotiated value와 선택 이유를 receipt에 기록해야 한다.

### 8.4 Device Profile Identity

Device creation receipt는 선택된 `profileId`와 canonical descriptor digest를 포함한다.

---

# PART C. Device Epoch and Lease

## 9. Epoch 모델

### 9.1 Runtime Epoch

Runtime Epoch은 기존 bootstrap의 `nextRuntimeEpoch()`를 SSOT로 사용한다.

Runtime Epoch은 renderer boot instance를 식별한다.

### 9.2 Device Epoch

Device Epoch은 Authority가 소유하는 단조 증가 정수다.

초기값은 `0`이며 첫 ACTIVE device 생성 완료 시 `1`이 된다.

새 device가 성공적으로 ACTIVE가 될 때마다 1 증가한다.

```text
runtimeEpoch=42, deviceEpoch=1
runtimeEpoch=42, deviceEpoch=2  // loss recovery
runtimeEpoch=43, deviceEpoch=1  // renderer relaunch
```

Runtime Epoch이 바뀌면 Device Epoch은 새 Authority instance에서 0부터 시작할 수 있다.

모든 identity는 두 값을 함께 사용한다.

### 9.3 Device Identity

```text
deviceIdentity = SHA256(
  runtimeEpoch
  + deviceEpoch
  + adapterIdentityDigest
  + deviceProfileDigest
  + authorityManifestDigest
)
```

### 9.4 Epoch 증가 시점

Device Epoch은 `requestDevice()` 호출 전에 증가해서는 안 된다.

다음 순서로만 증가한다.

1. device request 성공
2. uncaptured error listener 설치
3. device lost observer 설치
4. queue observation 준비
5. Authority internal registry 준비
6. active device commit
7. Device Epoch 증가 및 identity 발행

중간 실패 시 기존 epoch 값은 유지하고 failed attempt receipt만 남긴다.

---

## 10. Device Lease

### 10.1 Lease Interface

모든 소비자는 raw global device 대신 lease를 받는다.

```ts
export interface GpuDeviceLease {
  readonly leaseId: string;
  readonly ownerId: string;
  readonly purpose: string;
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly device: GPUDevice;
  readonly queue: GPUQueue;
  assertCurrent(): void;
  release(): void;
}
```

### 10.2 Lease 발행

Lease 발행에는 다음이 필요하다.

- registered owner ID
- declared purpose
- current Authority state `ACTIVE`
- current runtime epoch
- current device epoch

### 10.3 Owner ID

Owner ID는 Active Graph node 또는 Runtime service identity와 연결되어야 한다.

예:

```text
dadum.gpu.consumer.qmap-runtime
dadum.gpu.consumer.depth-bake
dadum.gpu.consumer.fft-qmap
dadum.gpu.consumer.mask-manager
dadum.gpu.consumer.qwave
dadum.gpu.consumer.export-downscale
```

임의 문자열 owner는 허용하지 않는다.

### 10.4 Lease Current Check

`assertCurrent()`는 다음을 검증한다.

- lease가 release되지 않음
- Authority state가 ACTIVE
- runtime epoch 일치
- device epoch 일치
- device identity 일치
- owner가 여전히 admitted consumer임

### 10.5 Stale Lease

Device loss가 시작되면 old epoch lease는 즉시 stale이 된다.

Stale lease에서 다음 접근은 stable error로 실패해야 한다.

- device getter
- queue getter
- pipeline cache request
- resource registration
- canvas configure
- command submission helper

### 10.6 Lease 보존 금지

Lease를 다음 위치에 영구 전역 보존해서는 안 된다.

- `window`
- `globalThis`
- Pinia serializable state
- DOM dataset
- localStorage
- IndexedDB
- receipt JSON raw object

Legacy module-local state에 lease를 보존할 수 있으나 loss callback에서 반드시 해제하고 null 처리해야 한다.

---

## 11. Legacy Bridge

### 11.1 Raw Global Alias 퇴역

다음 raw global은 제품 경로에서 제거한다.

```text
__DADUM_WEBGPU_DEVICE__
__DADUM_WEBGPU_ADAPTER__
```

### 11.2 허용 Bridge

Classic Script 호환을 위해 다음 frozen bridge를 한시적으로 허용한다.

```text
__DADUM_GPU_AUTHORITY_BRIDGE__
```

Bridge는 raw device를 property로 노출해서는 안 된다.

허용 API 예시는 다음과 같다.

```ts
interface LegacyGpuAuthorityBridge {
  readonly schemaVersion: 1;
  acquireLease(ownerId: string, purpose: string): Promise<GpuDeviceLease>;
  getCurrentIdentity(): GpuAuthorityIdentitySnapshot;
  registerRecoveryParticipant(input: RecoveryParticipant): () => void;
  getPipeline(input: CanonicalPipelineRequest): Promise<GPUComputePipeline | GPURenderPipeline>;
  getShaderModule(input: CanonicalShaderModuleRequest): Promise<GPUShaderModule>;
}
```

### 11.3 Bridge 설치 시점

Bridge는 Legacy Runtime activation 전에 설치돼야 한다.

현재 boot ordering에서 `legacy-adapter-v1`이 `gpu-v1`보다 먼저 활성화되는 구조는 변경해야 한다.

권장 순서는 다음이다.

```text
foundation
→ host
→ active graph
→ resources
→ gpu authority
→ legacy adapter
→ pipeline
```

Legacy script가 GPU Authority보다 먼저 평가되어 직접 device를 만들 수 있는 틈을 허용해서는 안 된다.

### 11.4 Bridge 제거 계획

Bridge는 영구 public API가 아니다.

후속 Runtime migration에서 ESM dependency injection으로 전환할 때 제거한다.

Bridge 사용자는 manifest에 명시하고 사용량 receipt를 남겨야 한다.

---

# PART D. Device State Machine

## 12. 상태

Authority state는 다음으로 고정한다.

```text
UNINITIALIZED
ADAPTER_REQUESTING
ADAPTER_SELECTED
DEVICE_REQUESTING
ACTIVE
LOSS_DETECTED
INVALIDATING
RECOVERING
DISPOSING
DISPOSED
FATAL
```

### 12.1 허용 전이

```text
UNINITIALIZED     → ADAPTER_REQUESTING
ADAPTER_REQUESTING→ ADAPTER_SELECTED
ADAPTER_SELECTED  → DEVICE_REQUESTING
DEVICE_REQUESTING → ACTIVE
DEVICE_REQUESTING → FATAL
ACTIVE            → LOSS_DETECTED
ACTIVE            → DISPOSING
LOSS_DETECTED     → INVALIDATING
INVALIDATING      → RECOVERING
INVALIDATING      → FATAL
RECOVERING        → ACTIVE
RECOVERING        → FATAL
DISPOSING         → DISPOSED
```

### 12.2 금지 전이

다음은 금지한다.

- ACTIVE → DEVICE_REQUESTING 직접 전이
- LOSS_DETECTED → ACTIVE 직접 전이
- FATAL → ACTIVE
- DISPOSED → ACTIVE
- RECOVERING 중 old device lease 발행
- invalidation 완료 전 새 device commit

### 12.3 Atomic State Transition

동일 loss에 대한 state transition은 한 번만 성공해야 한다.

중복 `device.lost` observer 또는 repeated callback이 들어와도 다음 값은 증가하지 않아야 한다.

- loss receipt count
- recovery attempt count
- diagnostic count
- device epoch

---

## 13. Device Loss Detection

### 13.1 단일 Observer

`device.lost` observer는 Authority만 설치한다.

Legacy consumer는 `device.lost.then()`을 직접 등록해서는 안 된다.

### 13.2 Loss Record

Loss detection 즉시 다음 snapshot을 만든다.

```json
{
  "runtimeEpoch": 42,
  "lostDeviceEpoch": 1,
  "lostDeviceIdentity": "sha256:...",
  "reason": "unknown",
  "message": "...",
  "detectedAtMonotonicMs": 12345.67,
  "authorityStateBefore": "ACTIVE"
}
```

### 13.3 Controlled Destroy

Authority dispose 또는 test hook에 의한 `device.destroy()`는 `controlled=true`로 기록한다.

Controlled destroy는 자동 recovery를 시작하지 않는다.

### 13.4 Uncontrolled Loss

다음은 uncontrolled loss다.

- driver reset
- GPU process crash
- unknown browser loss
- out-of-memory로 인한 device loss
- adapter/device internal error

Uncontrolled loss는 manifest policy에 따라 recovery를 시도한다.

---

## 14. Invalidation 순서

Device loss 후 다음 순서를 강제한다.

```text
1. New lease issuance stop
2. Command submission stop
3. Current device identity freeze
4. Old lease mark stale
5. Pipeline cache invalidate
6. Shader module cache invalidate
7. GPU resource wrapper invalidate
8. Texture/Buffer pool drain
9. Canvas binding invalidate
10. Recovery participants prepare
11. Pending GPU jobs reject
12. Old raw references clear
13. Invalidation receipt commit
14. Recovery begin
```

### 14.1 Submission Stop

Authority state가 ACTIVE가 아니면 command submission helper는 실패해야 한다.

### 14.2 Pending Job

Pending GPU job은 다음 stable error로 종료한다.

```text
E_GPU_JOB_ABORTED_DEVICE_LOST
```

조용히 CPU fallback으로 전환해서는 안 된다.

### 14.3 Pool Drain

Q-map runtime의 `_poolByDevice`, local texture pool, staging buffer pool은 recovery participant로 등록해야 한다.

WeakMap에 들어 있다는 이유만으로 폐기 증명이 되지 않는다.

Pool은 count와 estimated bytes를 invalidation receipt에 기록해야 한다.

---

## 15. Recovery Participant Registry

### 15.1 Interface

```ts
export interface GpuRecoveryParticipant {
  readonly participantId: string;
  readonly order: number;
  prepareForDeviceLoss(ctx: GpuLossContext): Promise<GpuInvalidationResult> | GpuInvalidationResult;
  rebuildAfterDeviceRecovery(ctx: GpuRecoveryContext): Promise<GpuRebuildResult> | GpuRebuildResult;
}
```

### 15.2 등록 대상

최소 다음 소비자가 등록돼야 한다.

- Q-map runtime
- source texture bridge
- mask manager
- depth bake
- FFT Q-map
- Q-wave
- export WGSL downscale
- pipeline cache
- shader module cache
- canvas binding registry

### 15.3 Order

권장 invalidation order는 다음이다.

```text
10 pending job broker
20 canvas binding
30 source bridge
40 algorithm consumers
50 texture/buffer pools
60 shader module cache
70 pipeline cache
```

Rebuild는 역순이 아니라 명시된 rebuild order를 사용한다.

### 15.4 Timeout

각 participant에는 timeout을 둔다.

Timeout은 무시하지 않고 recovery failure로 기록한다.

### 15.5 Partial Success 금지

Required participant 하나라도 invalidation 또는 rebuild에 실패하면 Authority는 FATAL로 전이한다.

Optional participant는 기능 capability를 비활성화할 수 있으나, 그 사실을 runtime capability receipt에 기록해야 한다.

---

## 16. Recovery

### 16.1 Recovery Attempt Count

기본 허용 횟수는 Runtime Epoch당 1회다.

무한 recovery loop는 금지한다.

### 16.2 Recovery Device Request

기본 순서는 다음이다.

1. 기존 selected adapter에 새 device 요청
2. 같은 device profile 사용
3. 새 device setup 완료
4. 새 Device Epoch commit
5. participant rebuild
6. minimum compute smoke
7. ACTIVE 전이

### 16.3 Adapter Reselection

기본값은 금지다.

허용할 경우 adapter replacement receipt가 다음을 포함해야 한다.

- old adapter identity
- new adapter identity
- replacement reason
- policy ID
- output cache invalidation scope

### 16.4 Recovery Smoke

Recovery 완료 전 다음 최소 smoke를 수행한다.

1. 1x1 storage buffer 생성
2. canonical noop compute pipeline 획득
3. dispatch 1회
4. queue completion 대기
5. validation error scope clean
6. buffer 및 pipeline lease cleanup

Q-map required consumer가 승격 범위에 포함된 경우 추가로 최소 Q-map fixture를 실행한다.

### 16.5 Recovery 완료

Recovery PASS 후에만 새 lease 발행을 재개한다.

---

# PART E. Pipeline Cache Ownership

## 17. Canonical Pipeline Cache

### 17.1 소유자

Pipeline cache는 Authority 내부 또는 Authority가 소유하는 다음 service로 구현한다.

```text
GpuPipelineCacheService
```

독립 Runtime service로 분리할 경우 owner module은 `dadum.module.gpu-authority-v1`이어야 한다.

### 17.2 직접 Pipeline 생성 금지

승격 후 제품 consumer는 다음을 직접 호출해서는 안 된다.

```text
device.createComputePipeline(...)
device.createComputePipelineAsync(...)
device.createRenderPipeline(...)
device.createRenderPipelineAsync(...)
```

예외는 Authority-owned pipeline cache 구현 파일뿐이다.

### 17.3 Pipeline Request

```ts
interface CanonicalPipelineRequest {
  ownerId: string;
  pipelineId: string;
  kind: 'compute' | 'render';
  shaderModuleIds: string[];
  entryPoints: string[];
  descriptor: unknown;
  descriptorDigest: string;
  deviceEpoch: number;
}
```

### 17.4 Promise Deduplication

동일 key에 대한 동시 요청은 하나의 creation promise를 공유해야 한다.

다음 조건을 검증한다.

```text
100 concurrent requests
→ create call count 1
→ resolved object identity 1
```

### 17.5 Failed Entry

Pipeline creation 실패 promise는 cache에 영구 보존하지 않는다.

정책은 다음이다.

```text
failedEntryPolicy=evict
```

재시도는 caller가 동일 오류를 무한 반복하지 않도록 attempt receipt를 남긴다.

### 17.6 Cross-Epoch 재사용 금지

Cache key는 Device Epoch을 포함한다.

Old epoch pipeline object는 새 epoch cache에서 조회될 수 없다.

---

## 18. Pipeline Cache Key

### 18.1 Compute Pipeline Key

Compute pipeline key는 최소 다음을 포함한다.

```text
deviceIdentity
pipeline kind
shader digest
entry point
pipeline layout digest
override constants digest
compilation options digest
```

### 18.2 Render Pipeline Key

Render pipeline key는 최소 다음을 포함한다.

```text
deviceIdentity
vertex shader digest
vertex entry point
fragment shader digest
fragment entry point
vertex buffer layout digest
pipeline layout digest
primitive state digest
depth stencil state digest
multisample state digest
color target format list
blend state digest
write mask digest
override constants digest
```

### 18.3 Label 비권위

`label`은 진단용이며 cache identity가 아니다.

같은 label이 다른 descriptor에 사용돼도 충돌해서는 안 된다.

### 18.4 Canonical Serialization

Descriptor digest는 key order가 정규화된 canonical JSON 또는 명시적 binary encoding을 사용한다.

다음은 금지한다.

- `JSON.stringify()`의 우연한 insertion order 의존
- GPU object를 문자열로 변환
- function source digest
- object identity 기반 key

---

## 19. Shader Module Cache

### 19.1 소유자

Shader module 생성도 Authority가 소유한다.

제품 consumer의 직접 `device.createShaderModule()` 호출은 0이어야 한다.

### 19.2 Shader Identity

Shader module identity는 다음으로 구성한다.

```text
shaderId
normalized WGSL bytes digest
compilation hints digest
source asset digest
source asset authority ID
current device identity
```

### 19.3 WGSL Normalization

기존 `_sanitizeWGSL()`처럼 양끝 quote를 임의 제거하는 동작은 shader asset ingestion 단계에서 명시적으로 수행해야 한다.

Runtime cache key 생성 직전에 조용히 코드를 변형해서는 안 된다.

원본 digest와 normalized digest를 둘 다 기록한다.

### 19.4 Compilation Info

가능한 환경에서는 `getCompilationInfo()`를 수집한다.

다음 항목을 receipt에 포함한다.

- error count
- warning count
- info count
- source line/offset
- message digest

전체 compiler message 원문은 민감 경로를 포함할 수 있으므로 별도 diagnostic artifact에 저장할 수 있다.

### 19.5 Failed Shader Entry

Compile error shader module은 success cache에 들어가지 않는다.

---

## 20. Error Scope Authority

### 20.1 Pipeline 생성 Scope

Shader 및 pipeline 생성은 Authority의 error-scope helper를 통과한다.

권장 순서는 다음이다.

```text
push internal
push out-of-memory
push validation
execute
pop validation
pop out-of-memory
pop internal
```

### 20.2 Uncaptured Error

`uncapturederror` listener는 Authority만 설치한다.

동일 error는 진단 ledger에 한 번만 기록한다.

### 20.3 Error와 Device Loss 구분

Validation error가 발생했다고 자동으로 device loss로 간주해서는 안 된다.

Out-of-memory error가 발생하면 해당 작업은 실패하지만 device가 ACTIVE인지 별도로 확인한다.

### 20.4 Stable Errors

Pipeline 및 shader failure는 stable error code로 변환한다.

---

## 21. Cache Metrics

Authority receipt는 다음 metric을 포함한다.

```text
shaderRequestCount
shaderCreateCount
shaderHitCount
shaderFailureCount
pipelineRequestCount
pipelineCreateCount
pipelineHitCount
pipelineFailureCount
cacheEntryCount
cacheInvalidatedCount
cacheInvalidatedByDeviceLoss
```

Metric은 분석용이며 PASS를 꾸미기 위한 추정값을 허용하지 않는다.

---

# PART F. Resource and Canvas Integration

## 22. GPU Resource Wrapper

### 22.1 Epoch-tagged Wrapper

GPU object는 다음 wrapper를 통해 registry에 들어간다.

```ts
interface GpuResourceHandle<T> {
  readonly resourceId: string;
  readonly ownerId: string;
  readonly type: string;
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly value: T;
  assertCurrent(): void;
  dispose(reason: string): void;
}
```

### 22.2 본 명세 범위

본 명세에서는 최소 다음을 wrapper 대상으로 한다.

- pipeline cache entry
- shader module cache entry
- canvas context binding
- Legacy source texture bridge
- Q-map pooled texture/buffer root

모든 surface의 전체 생애는 `TDT-SURFACE-LIFECYCLE-01`로 인계한다.

### 22.3 Resource Registry 확장

기존 `ResourceRegistryService` record에는 GPU resource의 경우 다음 metadata를 추가해야 한다.

- device epoch
- device identity
- disposer identity
- invalidation reason

Old device epoch resource resolve는 `E_GPU_STALE_RESOURCE_EPOCH`로 실패한다.

---

## 23. Canvas Context Binding

### 23.1 configure 권한

`GPUCanvasContext.configure()`는 Authority-owned binding registry를 통과해야 한다.

### 23.2 Binding Identity

```text
canvas identity
context identity
runtime epoch
device epoch
device identity
preferred format
alpha mode
usage mask
configuration digest
```

### 23.3 Device Loss

Device loss 시 모든 canvas binding은 invalid 상태가 된다.

새 device로 recovery된 뒤 explicit reconfigure를 수행한다.

### 23.4 Preferred Canvas Format

`navigator.gpu.getPreferredCanvasFormat()`의 값은 Authority initialization에서 한 번 관찰하고 receipt에 기록한다.

Legacy consumer가 개별 관찰하지 않는다.

### 23.5 Preview 의미

본 명세는 canvas의 device binding만 소유한다.

어떤 final surface를 표시하는지는 `TDT-PREVIEW-PRESENTER-01`의 책임이다.

---

# PART G. Legacy Runtime Retirement

## 24. Migration 원칙

Legacy 알고리즘 본문은 가능한 한 유지한다.

변경 대상은 다음으로 제한한다.

- device 획득
- device epoch 확인
- pipeline 획득
- shader module 획득
- device loss callback
- resource invalidation
- raw global 제거

알고리즘 계산식과 dispatch dimension을 임의 수정하지 않는다.

---

## 25. Migration Matrix

### 25.1 Q-map Runtime

대상:

```text
app/legacy-runtime/core/compute/qmap_webgpu/runtime.js
```

변경:

- `_adapter`, `_device`, `_initPromise`, `_deviceEpoch` 자체 소유 제거
- `initQmapGPU()`를 Authority lease adapter로 변경
- `device.lost.then()` 제거
- `_deviceLostListeners`를 Recovery Participant로 전환
- `_poolByDevice` drain을 invalidation participant로 등록
- pipeline creation을 canonical cache로 이전
- raw global 게시 제거

호환 함수 이름을 유지할 수 있으나 구현은 Authority를 호출해야 한다.

### 25.2 Generic Legacy WebGPU Runtime

대상:

```text
app/legacy-runtime/webgpu_runtime.js
```

변경:

- adapter/device request 제거
- required limits fallback retry 제거
- `initWebGPU()`를 `bindWebGPUCanvas(lease, canvas, opts)` 성격으로 축소
- lost event 발행 제거
- validation scope helper를 Authority helper로 위임

### 25.3 Depth Bake

대상:

```text
app/legacy-runtime/core/webgpu_depth_bake.js
```

변경:

- `state.adapter` 제거
- `state.device` 대신 lease 보관
- `initGPU()`는 Authority lease 획득
- local `state.pipelines`를 canonical pipeline IDs로 교체
- textures와 pipeline refs를 participant invalidation에서 정리

### 25.4 FFT Q-map

대상:

```text
app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js
```

변경:

- `initWebGPU()` 독립 device 생성 제거
- constructor 또는 init에 lease 주입
- 6개 pipeline을 canonical cache로 이전
- buffer recreation 정책은 본 명세에서 유지하되 epoch wrapper 적용

### 25.5 Mask Manager

대상:

```text
app/legacy-runtime/core/compute/mask_webgpu/mask_localized_manager.js
```

변경:

- direct adapter/device call 제거
- raw global fallback 제거
- local pipeline cache를 canonical cache로 이전
- owner ID를 mask manager 하나로 고정

### 25.6 Q-wave

대상:

```text
app/legacy-runtime/qwave/qwave_system.js
```

변경:

- direct adapter/device call 제거
- Q-wave pipeline IDs 등록
- device loss 후 state rebuild participant 등록

### 25.7 Export WGSL Downscale

대상:

```text
app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js
```

변경:

- raw global device/adapter fallback 제거
- Export job이 시작될 때 current lease 획득
- job 종료 또는 cancel 시 lease release
- output receipt에 runtime/device epoch 추가

### 25.8 Worker Porttrace

대상:

```text
app/legacy-runtime/core/worker_porttrace.js
app/legacy-runtime/core/compute/qmap_webgpu/worker_porttrace.js
```

현재 승격 범위에서는 Worker WebGPU 자체 device 생성을 허용하지 않는다.

다음 중 하나를 선택해야 한다.

- active graph에서 quarantine
- CPU trace-only worker로 축소
- renderer에서 계산 후 trace 데이터만 worker에 전달

Worker realm device를 유지한 채 본 명세 PASS를 선언해서는 안 된다.

### 25.9 Adapter Compatibility Helper

대상:

```text
app/legacy-runtime/core/compute/qmap_webgpu/adapter_compat.js
```

이 파일이 active graph에 남는다면 direct device creation을 제거하고 bridge adapter로 축소한다.

사용되지 않는다면 quarantine한다.

---

## 26. Legacy Event Retirement

다음 event는 Authority event로 통합한다.

기존:

```text
dadum:runtime-device-lost
dadum:webgpu-device-lost
```

Canonical:

```text
dadum:gpu-authority-state
```

Event detail:

```json
{
  "schemaVersion": 1,
  "runtimeEpoch": 42,
  "deviceEpoch": 2,
  "state": "ACTIVE",
  "transition": "RECOVERING_TO_ACTIVE",
  "receiptId": "gpu-recovery:42:1",
  "deviceIdentity": "sha256:..."
}
```

Legacy event alias가 필요하면 SideEffect Registry가 한 번만 projection할 수 있다.

Alias event가 Authority state machine을 다시 구동해서는 안 된다.

---

## 27. WebGL 경계

본 명세는 WebGL 자체를 전부 제거하지 않는다.

다만 WebGPU device 실패 시 같은 기능이 조용히 WebGL 또는 Canvas로 전환되는 자동 fallback은 금지한다.

허용되는 WebGL은 다음과 같다.

- 명시적으로 별도 preview 기능으로 분류됨
- Active Graph에 backend identity가 선언됨
- WebGPU output을 대체하지 않음
- receipt에 backend가 기록됨

WebGL 제거는 별도 runtime path retirement 명세에서 수행한다.

---

# PART H. Source Gates

## 28. Direct Authority Call Gate

### GD01-01

Authority 구현 파일 외 `requestAdapter` call site가 0개여야 한다.

### GD01-02

Authority 구현 파일 외 `requestDevice` call site가 0개여야 한다.

### GD01-03

Worker product graph의 `requestAdapter` 및 `requestDevice`가 0개여야 한다.

### GD01-04

Raw global device/adapter alias read와 write가 0개여야 한다.

### GD01-05

Authority 외 `device.lost` observer가 0개여야 한다.

### GD01-06

Authority 외 uncaptured error listener가 0개여야 한다.

---

## 29. Pipeline Ownership Gate

### GD01-07

Authority cache 구현 외 pipeline creation call이 0개여야 한다.

### GD01-08

Authority shader cache 구현 외 shader module creation call이 0개여야 한다.

### GD01-09

Pipeline descriptor digest가 모든 required key field를 포함해야 한다.

### GD01-10

Pipeline key에 device identity가 포함돼야 한다.

### GD01-11

Shader key에 normalized WGSL digest와 device identity가 포함돼야 한다.

### GD01-12

Failed cache entry eviction policy가 source와 manifest에서 일치해야 한다.

---

## 30. Boot Ordering Gate

### GD01-13

GPU Authority가 GPU 사용 Legacy script보다 먼저 활성화돼야 한다.

### GD01-14

Legacy bridge 설치 전 Legacy GPU consumer 평가가 없어야 한다.

### GD01-15

Runtime composition당 Authority service instance가 정확히 1개여야 한다.

### GD01-16

Capability owner collision이 없어야 한다.

---

## 31. Epoch Source Gate

### GD01-17

Device Epoch 증가 코드는 Authority 한 곳에만 존재해야 한다.

### GD01-18

GPU lease와 GPU resource wrapper가 runtime epoch와 device epoch를 함께 가진다.

### GD01-19

Old Q-map `_deviceEpoch` SSOT가 제거 또는 Authority projection으로 전환돼야 한다.

### GD01-20

Device identity canonical formula test가 PASS해야 한다.

---

# PART I. Runtime Gates

## 32. Single Device Runtime Gate

### GD01-21

Cold boot에서 adapter request observation count는 1이어야 한다.

### GD01-22

Cold boot에서 successful device creation count는 1이어야 한다.

### GD01-23

동시 20개 consumer lease 요청 중 device creation count는 증가하지 않아야 한다.

### GD01-24

Authority snapshot의 active device count는 1이어야 한다.

---

## 33. Lease Runtime Gate

### GD01-25

모든 required consumer가 admitted owner ID로 lease를 획득해야 한다.

### GD01-26

unknown owner lease 요청은 실패해야 한다.

### GD01-27

released lease 접근은 실패해야 한다.

### GD01-28

old epoch lease 접근은 실패해야 한다.

### GD01-29

Pinia snapshot과 receipt JSON에 raw GPU object가 없어야 한다.

---

## 34. Pipeline Cache Runtime Gate

### GD01-30

동일 compute pipeline 동시 100회 요청에서 creation count는 1이어야 한다.

### GD01-31

동일 render pipeline 동시 100회 요청에서 creation count는 1이어야 한다.

### GD01-32

descriptor 한 필드 변경 시 cache miss가 발생해야 한다.

### GD01-33

label만 변경하고 의미 descriptor가 같을 때 정책에 따라 동일 identity를 유지해야 한다.

Label 정책은 manifest에 명시한다.

### GD01-34

compile failure entry는 cache에서 제거돼야 한다.

### GD01-35

device recovery 후 old pipeline cache hit count는 0이어야 한다.

---

## 35. Device Loss Runtime Gate

### GD01-36

Test-only controlled `device.destroy()` hook로 loss를 유발한다.

### GD01-37

Loss event receipt는 정확히 1개여야 한다.

### GD01-38

Authority state는 정해진 순서를 따라야 한다.

```text
ACTIVE
→ LOSS_DETECTED
→ INVALIDATING
→ RECOVERING
→ ACTIVE
```

### GD01-39

Old lease는 loss detection 직후 stale이어야 한다.

### GD01-40

Old pipeline 및 shader cache entry가 전부 invalidated돼야 한다.

### GD01-41

Required recovery participant가 모두 prepare와 rebuild receipt를 남겨야 한다.

### GD01-42

Recovery 성공 후 Device Epoch은 정확히 1 증가해야 한다.

### GD01-43

Runtime Epoch은 recovery 중 변하지 않아야 한다.

### GD01-44

새 device identity는 old identity와 달라야 한다.

### GD01-45

Minimum compute smoke가 새 epoch에서 PASS해야 한다.

### GD01-46

Recovery 뒤 Q-map 최소 fixture가 새 epoch에서 PASS해야 한다.

### GD01-47

Recovery 중 CPU, WebGL, Canvas fallback 실행 count는 0이어야 한다.

---

## 36. Relaunch Gate

### GD01-48

Electron relaunch 후 Runtime Epoch은 증가해야 한다.

### GD01-49

Relaunch 후 Device Epoch은 새 Authority 기준 1이어야 한다.

### GD01-50

이전 window의 raw global, listener, Authority instance가 남지 않아야 한다.

---

## 37. Repeated Stability Gate

### GD01-51

다음 시퀀스를 20회 반복한다.

```text
acquire lease
request canonical pipeline
run minimal dispatch
release lease
```

다음 값은 plateau를 보여야 한다.

- active lease count
- pipeline entry count
- shader entry count
- recovery participant count
- event listener count

### GD01-52

Controlled loss recovery를 지원 환경에서 최소 3회 별도 process run으로 검증한다.

Runtime Epoch당 recovery 횟수 제한을 우회해서 한 process에서 연속 destroy를 반복해서는 안 된다.

---

# PART J. Packaged Runtime Gates

## 38. Package Admission

### GD01-53

Packaged app에 Authority manifest와 implementation이 포함돼야 한다.

### GD01-54

Quarantined worker GPU path가 package에서 제외돼야 한다.

### GD01-55

Source digest와 packaged artifact digest의 관계가 emitted manifest로 증명돼야 한다.

### GD01-56

Dev server에서만 존재하는 test hook가 일반 production UI에 노출되지 않아야 한다.

### GD01-57

Packaged E2E test mode에서만 controlled loss hook를 활성화할 수 있어야 한다.

---

## 39. Output Conservation

본 명세는 알고리즘 변경 명세가 아니므로, 정리 전후 최소 fixture 출력은 보존돼야 한다.

### GD01-58

Device migration 전 baseline fixture와 migration 후 fixture의 final surface digest가 동일해야 한다.

Exact digest가 불가능한 GPU float 경로는 기존 승인된 tolerance contract를 사용하되 새 tolerance를 임의 도입해서는 안 된다.

### GD01-59

Export encoder identity는 변경되지 않아야 한다.

### GD01-60

Color profile, bit depth, alpha policy receipt가 변경되지 않아야 한다.

---

# PART K. Receipt and Artifact

## 40. Artifact Directory

권장 구조는 다음과 같다.

```text
artifacts/gpu-device-ssot-01/
├─ source/
│  ├─ direct-gpu-authority-audit.json
│  ├─ pipeline-creation-audit.json
│  ├─ shader-module-audit.json
│  ├─ legacy-migration-matrix.json
│  ├─ gpu-authority-profile.json
│  └─ source-gate-receipt.json
├─ runtime/
│  ├─ adapter-selection-receipt.json
│  ├─ device-creation-receipt.json
│  ├─ lease-audit-receipt.json
│  ├─ pipeline-cache-receipt.json
│  ├─ device-loss-receipt.json
│  ├─ device-recovery-receipt.json
│  ├─ recovery-participant-receipt.json
│  └─ runtime-gate-receipt.json
├─ packaged/
│  ├─ package-admission-receipt.json
│  ├─ packaged-loss-recovery-receipt.json
│  ├─ relaunch-receipt.json
│  └─ output-conservation-receipt.json
└─ final/
   └─ TDT_GPU_DEVICE_SSOT_01_FINAL_RECEIPT.json
```

### 40.1 Append-only

Run artifact는 append-only다.

기존 PASS receipt를 덮어써서는 안 된다.

### 40.2 Run ID

```text
gpu-device-ssot-01:<utc timestamp>:<source digest prefix>
```

---

## 41. Adapter Selection Receipt

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-GPU-DEVICE-SSOT-01",
  "runId": "gpu-device-ssot-01:...",
  "runtimeEpoch": 42,
  "authorityManifestDigest": "sha256:...",
  "adapterRequestOptionsDigest": "sha256:...",
  "adapterInfoAvailable": true,
  "adapterIdentityDigest": "sha256:...",
  "featuresDigest": "sha256:...",
  "limitsDigest": "sha256:...",
  "requestCount": 1,
  "status": "PASS"
}
```

---

## 42. Device Creation Receipt

```json
{
  "schemaVersion": 1,
  "runtimeEpoch": 42,
  "deviceEpoch": 1,
  "deviceIdentity": "sha256:...",
  "adapterIdentityDigest": "sha256:...",
  "deviceProfileId": "dadum.device.core.v1",
  "deviceDescriptorDigest": "sha256:...",
  "negotiatedLimitsDigest": "sha256:...",
  "creationAttemptCount": 1,
  "activeDeviceCount": 1,
  "status": "PASS"
}
```

---

## 43. Pipeline Cache Receipt

```json
{
  "schemaVersion": 1,
  "runtimeEpoch": 42,
  "deviceEpoch": 1,
  "deviceIdentity": "sha256:...",
  "shaderRequestCount": 120,
  "shaderCreateCount": 12,
  "shaderHitCount": 108,
  "pipelineRequestCount": 240,
  "pipelineCreateCount": 24,
  "pipelineHitCount": 216,
  "failedEntryCount": 0,
  "crossEpochHitCount": 0,
  "cacheDigest": "sha256:...",
  "status": "PASS"
}
```

숫자는 예시이며 실제 관측값을 사용한다.

---

## 44. Device Loss Receipt

```json
{
  "schemaVersion": 1,
  "runtimeEpoch": 42,
  "lostDeviceEpoch": 1,
  "lostDeviceIdentity": "sha256:...",
  "controlled": true,
  "reason": "destroyed",
  "lossObserverEmissionCount": 1,
  "staleLeaseCount": 7,
  "invalidatedShaderCount": 12,
  "invalidatedPipelineCount": 24,
  "invalidatedResourceCount": 18,
  "pendingJobRejectedCount": 0,
  "stateTrace": [
    "ACTIVE",
    "LOSS_DETECTED",
    "INVALIDATING"
  ],
  "status": "PASS"
}
```

---

## 45. Recovery Receipt

```json
{
  "schemaVersion": 1,
  "runtimeEpoch": 42,
  "oldDeviceEpoch": 1,
  "newDeviceEpoch": 2,
  "oldDeviceIdentity": "sha256:...",
  "newDeviceIdentity": "sha256:...",
  "adapterReselected": false,
  "recoveryAttempt": 1,
  "participantPreparePass": 10,
  "participantRebuildPass": 10,
  "minimumComputeSmoke": "PASS",
  "qmapSmoke": "PASS",
  "fallbackCount": 0,
  "stateTrace": [
    "INVALIDATING",
    "RECOVERING",
    "ACTIVE"
  ],
  "status": "PASS"
}
```

---

## 46. Final Receipt

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-GPU-DEVICE-SSOT-01",
  "state": "GPU_DEVICE_SSOT_VERIFIED_UNPROMOTED",
  "sourceAuthorityDigest": "sha256:...",
  "activeGraphDigest": "sha256:...",
  "authorityManifestDigest": "sha256:...",
  "adapterSelectionReceiptDigest": "sha256:...",
  "deviceCreationReceiptDigest": "sha256:...",
  "pipelineCacheReceiptDigest": "sha256:...",
  "deviceLossReceiptDigest": "sha256:...",
  "deviceRecoveryReceiptDigest": "sha256:...",
  "packagedAdmissionReceiptDigest": "sha256:...",
  "outputConservationReceiptDigest": "sha256:...",
  "directAdapterCallCountOutsideAuthority": 0,
  "directDeviceCallCountOutsideAuthority": 0,
  "rawGlobalDeviceReferenceCount": 0,
  "activeDeviceCount": 1,
  "crossEpochPipelineHitCount": 0,
  "productionPointerMutated": false,
  "status": "PASS"
}
```

---

# PART L. Stable Failure Codes

## 47. Authority Errors

```text
E_GPU_AUTHORITY_DUPLICATE
E_GPU_AUTHORITY_NOT_INITIALIZED
E_GPU_AUTHORITY_INVALID_STATE
E_GPU_AUTHORITY_MANIFEST_INVALID
E_GPU_AUTHORITY_OWNER_NOT_ADMITTED
```

## 48. Adapter Errors

```text
E_GPU_UNAVAILABLE
E_GPU_ADAPTER_NOT_FOUND
E_GPU_ADAPTER_FEATURE_MISSING
E_GPU_ADAPTER_LIMIT_INSUFFICIENT
E_GPU_ADAPTER_RESELECTION_FORBIDDEN
E_GPU_ADAPTER_IDENTITY_UNRESOLVED
```

## 49. Device Errors

```text
E_GPU_DEVICE_REQUEST_FAILED
E_GPU_DEVICE_PROFILE_DOWNGRADE_FORBIDDEN
E_GPU_DEVICE_LOST
E_GPU_DEVICE_RECOVERY_EXHAUSTED
E_GPU_DEVICE_IDENTITY_MISMATCH
E_GPU_DEVICE_COUNT_NOT_SINGLE
```

## 50. Epoch and Lease Errors

```text
E_GPU_STALE_LEASE
E_GPU_LEASE_RELEASED
E_GPU_LEASE_OWNER_UNKNOWN
E_GPU_RUNTIME_EPOCH_MISMATCH
E_GPU_DEVICE_EPOCH_MISMATCH
E_GPU_STALE_RESOURCE_EPOCH
```

## 51. Cache Errors

```text
E_GPU_SHADER_COMPILE_FAILED
E_GPU_SHADER_IDENTITY_COLLISION
E_GPU_PIPELINE_CREATE_FAILED
E_GPU_PIPELINE_KEY_INCOMPLETE
E_GPU_PIPELINE_IDENTITY_COLLISION
E_GPU_CROSS_EPOCH_CACHE_REUSE
```

## 52. Recovery Errors

```text
E_GPU_RECOVERY_PARTICIPANT_DUPLICATE
E_GPU_RECOVERY_PARTICIPANT_TIMEOUT
E_GPU_RECOVERY_INVALIDATION_FAILED
E_GPU_RECOVERY_REBUILD_FAILED
E_GPU_RECOVERY_SMOKE_FAILED
E_GPU_JOB_ABORTED_DEVICE_LOST
```

## 53. Legacy Retirement Errors

```text
E_GPU_LEGACY_DIRECT_ADAPTER_REQUEST
E_GPU_LEGACY_DIRECT_DEVICE_REQUEST
E_GPU_LEGACY_RAW_GLOBAL_DEVICE
E_GPU_LEGACY_DEVICE_LOST_OBSERVER
E_GPU_LEGACY_PIPELINE_CREATION
E_GPU_WORKER_REALM_DEVICE_FORBIDDEN
```

---

# PART M. Tooling

## 54. 권장 도구

```text
tools/gpu-device-ssot-01/
├─ scan-direct-gpu-authority.mjs
├─ scan-pipeline-ownership.mjs
├─ scan-shader-module-ownership.mjs
├─ generate-consumer-manifest.mjs
├─ verify-gpu-boot-order.mjs
├─ verify-gpu-authority-source.mjs
├─ run-gpu-authority-runtime-smoke.mjs
├─ run-gpu-pipeline-cache-smoke.mjs
├─ run-gpu-device-loss-smoke.mjs
├─ run-gpu-recovery-smoke.mjs
├─ run-gpu-relaunch-smoke.mjs
├─ verify-gpu-output-conservation.mjs
├─ gate-gpu-device-ssot-01.mjs
└─ finalize-gpu-device-ssot-01.mjs
```

### 54.1 AST 분석

Direct GPU authority scan은 AST 기반이어야 한다.

최소 다음 패턴을 식별한다.

- member call
- optional member call
- alias binding
- destructuring
- bound function
- global raw alias
- dynamic property access

분석 불가능한 computed call은 PASS가 아니라 `UNKNOWN_COMPUTED_GPU_ACCESS`로 실패한다.

### 54.2 Runtime Instrumentation

Test mode에서는 `navigator.gpu.requestAdapter`와 selected adapter의 `requestDevice`를 wrapper로 관측할 수 있다.

Instrumentation은 call count만 관측하고 반환 의미를 변경해서는 안 된다.

### 54.3 Test Hook

Controlled device loss hook는 다음 조건을 모두 만족해야 한다.

- packaged E2E test flag 필요
- production UI에서 접근 불가
- one-shot token 필요
- receipt에 caller와 timestamp 기록
- Production Pointer 상태에서는 기본 비활성

---

## 55. Package Scripts

권장 script는 다음과 같다.

```json
{
  "scripts": {
    "generate:gpu-device-ssot-01": "node tools/gpu-device-ssot-01/generate-consumer-manifest.mjs",
    "verify:gpu-device-ssot-01:source": "node tools/gpu-device-ssot-01/verify-gpu-authority-source.mjs",
    "verify:gpu-device-ssot-01:runtime": "node tools/gpu-device-ssot-01/run-gpu-authority-runtime-smoke.mjs",
    "verify:gpu-device-ssot-01:cache": "node tools/gpu-device-ssot-01/run-gpu-pipeline-cache-smoke.mjs",
    "verify:gpu-device-ssot-01:loss": "node tools/gpu-device-ssot-01/run-gpu-device-loss-smoke.mjs",
    "verify:gpu-device-ssot-01:recovery": "node tools/gpu-device-ssot-01/run-gpu-recovery-smoke.mjs",
    "verify:gpu-device-ssot-01:relaunch": "node tools/gpu-device-ssot-01/run-gpu-relaunch-smoke.mjs",
    "verify:gpu-device-ssot-01:output": "node tools/gpu-device-ssot-01/verify-gpu-output-conservation.mjs",
    "verify:gpu-device-ssot-01": "node tools/gpu-device-ssot-01/gate-gpu-device-ssot-01.mjs",
    "finalize:gpu-device-ssot-01": "node tools/gpu-device-ssot-01/finalize-gpu-device-ssot-01.mjs"
  }
}
```

---

# PART N. Gate Matrix

## 56. 필수 Gate 요약

| Gate | 내용 | Source | Runtime | Packaged |
|---|---|---:|---:|---:|
| GD01-01~06 | 단일 adapter/device/loss authority | PASS |  |  |
| GD01-07~12 | pipeline/shader cache ownership | PASS | PASS |  |
| GD01-13~16 | boot ordering 및 instance count | PASS | PASS | PASS |
| GD01-17~20 | epoch SSOT | PASS | PASS |  |
| GD01-21~24 | single active device |  | PASS | PASS |
| GD01-25~29 | lease identity 및 stale rejection | PASS | PASS | PASS |
| GD01-30~35 | cache dedup 및 cross-epoch zero |  | PASS | PASS |
| GD01-36~47 | device loss 및 recovery |  | PASS | PASS |
| GD01-48~50 | relaunch cleanup |  |  | PASS |
| GD01-51~52 | 반복 안정성 |  | PASS | PASS |
| GD01-53~57 | package admission | PASS |  | PASS |
| GD01-58~60 | output conservation |  | PASS | PASS |

### 56.1 PASS 규칙

모든 required gate가 PASS여야 한다.

`DEFERRED`는 source bake 상태에서만 허용한다.

최종 `GPU_DEVICE_SSOT_VERIFIED_UNPROMOTED` receipt에는 DEFERRED가 0이어야 한다.

### 56.2 Source Bake 상한

Windows packaged runtime을 실행하지 못하는 환경에서는 다음 상태까지만 발행할 수 있다.

```text
GPU_DEVICE_SSOT_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME
```

이 상태에서 device recovery 또는 relaunch를 PASS로 작성해서는 안 된다.

---

# PART O. Migration Transactions

## 57. Transaction 1: Authority 확장

1. Authority profile 추가
2. 기존 GpuService를 Authority service로 확장
3. state machine 구현
4. runtime/device epoch 구현
5. lease 구현
6. single lost observer 구현
7. receipt ledger 구현

이 단계에서 Legacy 경로는 아직 기존 동작을 유지할 수 있으나 새 Authority가 먼저 부팅돼야 한다.

## 58. Transaction 2: Pipeline Cache

1. shader cache 구현
2. pipeline cache 구현
3. canonical descriptor serializer 구현
4. error scope 구현
5. cache metric 구현
6. Q-map 대표 pipeline 1개 migration
7. cache concurrency smoke

대표 pipeline migration이 PASS하기 전 전체 파일을 한꺼번에 이동하지 않는다.

## 59. Transaction 3: Q-map Runtime Adoption

1. Q-map direct device creation 제거
2. Authority bridge lease 사용
3. Q-map local epoch 제거
4. pool invalidation participant 등록
5. Q-map pipeline 전부 cache migration
6. source texture bridge epoch 재결선
7. Q-map fixture parity

## 60. Transaction 4: 나머지 소비자 Adoption

순서는 다음을 권장한다.

```text
mask manager
→ export downscale
→ depth bake
→ FFT Q-map
→ Q-wave
→ generic webgpu runtime
```

각 consumer마다 다음을 개별 검증한다.

- direct device call zero
- pipeline creation zero
- output conservation
- loss invalidation
- recovery rebuild

## 61. Transaction 5: Worker GPU Retirement

1. Worker direct device call inventory
2. product-required 여부 판정
3. trace-only 전환 또는 quarantine
4. package exclusion 검증
5. Worker GPU call zero gate

## 62. Transaction 6: Global and Event Retirement

1. raw global write 제거
2. raw global read 제거
3. canonical bridge 설치
4. duplicate lost event 제거
5. canonical state event 연결
6. Active Graph regeneration

## 63. Transaction 7: Packaged Recovery

1. source gates
2. renderer runtime gates
3. controlled loss
4. recovery
5. output conservation
6. relaunch
7. final receipt

---

# PART P. Rollback

## 64. Rollback 원칙

본 명세는 Production Pointer를 변경하지 않는다.

Rollback 단위는 source candidate 및 packaged test candidate다.

### 64.1 Rollback 조건

다음 중 하나면 candidate를 폐기한다.

- output conservation 실패
- active device count 2 이상
- stale lease가 GPU call 성공
- cross-epoch pipeline hit 발생
- recovery participant 누락
- CPU/WebGL fallback 발생
- package에서 Worker device 생성 발견
- relaunch 후 old global 잔존

### 64.2 Rollback Artifact

Rollback은 실패 receipt와 candidate digest를 보존한다.

실패 파일을 삭제해 기록을 없애서는 안 된다.

### 64.3 Compatibility Facade

Rollback을 쉽게 하기 위해 기존 함수 이름을 facade로 유지할 수 있다.

그러나 facade 내부에서 direct device creation을 되살려서는 안 된다.

---

# PART Q. 완료 판정

## 65. 완료 조건

다음 조건을 모두 만족해야 한다.

1. Authority 외 direct adapter request 0
2. Authority 외 direct device request 0
3. Authority 외 device lost observer 0
4. raw global device/adapter reference 0
5. renderer active device count 1
6. Worker product graph device count 0
7. admitted consumer lease coverage 100%
8. pipeline creation Authority 외 0
9. shader module creation Authority 외 0
10. concurrent cache dedup PASS
11. old epoch lease rejection PASS
12. cross-epoch pipeline hit 0
13. controlled loss receipt 1개
14. recovery participant required PASS 100%
15. Device Epoch 정확히 증가
16. Runtime Epoch recovery 중 보존
17. recovery compute smoke PASS
18. recovery Q-map smoke PASS
19. fallback count 0
20. relaunch cleanup PASS
21. output conservation PASS
22. Production Pointer mutation false
23. final receipt digest valid
24. required gate DEFERRED 0

---

## 66. 최종 PASS 문구

다음 문구는 모든 완료 조건이 충족됐을 때만 사용할 수 있다.

```text
TDT-GPU-DEVICE-SSOT-01 PASS

The packaged renderer runtime admits exactly one WebGPU adapter/device authority.
All active GPU consumers use epoch-bound leases from that authority.
Direct legacy adapter/device creation, raw global device aliases, duplicate device-lost observers,
and worker-realm product devices are absent.
Shader modules and compute/render pipelines are owned by the canonical epoch-scoped cache.
A controlled device loss invalidates all old leases, resources, shader modules, and pipelines,
then recovers exactly once onto a new device epoch without CPU, WebGL, or Canvas fallback.
Output identity is conserved, relaunch cleanup passes, and no production pointer was mutated.
State: GPU_DEVICE_SSOT_VERIFIED_UNPROMOTED.
```

---

# PART R. 후속 인계

## 67. `TDT-SURFACE-LIFECYCLE-01` 인계

본 명세 완료 후 다음 정보가 Surface Lifecycle의 입력이 된다.

- runtime epoch
- device epoch
- device identity
- lease identity
- resource wrapper identity
- invalidation reason
- recovery receipt

Surface Lifecycle은 이 위에 texture, buffer, final surface의 생성부터 폐기까지의 소유권을 닫는다.

## 68. `TDT-PREVIEW-PRESENTER-01` 인계

Canvas binding은 본 명세에서 device epoch에 맞춰 재설정된다.

어떤 final surface가 preview에 표시되는지는 후속 Presenter 명세가 소유한다.

## 69. `TDT-RESAMPLE-RUNTIME-01` 인계

EWA, ΔK, Q-map, Q-wave pipeline은 canonical pipeline cache identity와 current device lease를 입력으로 받는다.

후속 Resample Runtime 명세는 알고리즘 경로 단일화와 Preview/Export shared kernel을 닫는다.

---

# PART S. 베이크 범위

## 70. 신규 파일

권장 신규 파일은 다음과 같다.

```text
app/src/runtime/gpu/gpu-device-authority-service.ts
app/src/runtime/gpu/gpu-authority-profile.json
app/src/runtime/gpu/gpu-device-lease.ts
app/src/runtime/gpu/gpu-pipeline-cache.ts
app/src/runtime/gpu/gpu-shader-module-cache.ts
app/src/runtime/gpu/gpu-recovery-registry.ts
app/src/runtime/gpu/gpu-canvas-binding-registry.ts
app/src/runtime/gpu/gpu-authority-bridge.ts
app/src/runtime/gpu/gpu-authority-receipt.ts
```

### 70.1 도구

```text
tools/gpu-device-ssot-01/**
```

### 70.2 Artifact

```text
artifacts/gpu-device-ssot-01/**
```

## 71. 주요 수정 파일

최소 다음 파일이 수정 대상이다.

```text
app/src/boot/runtime-modules.ts
app/src/runtime/service-token.ts
app/src/runtime/resource-registry.ts
app/src/runtime/gpu/gpu-service.ts
app/legacy-runtime/core/compute/qmap_webgpu/runtime.js
app/legacy-runtime/webgpu_runtime.js
app/legacy-runtime/core/webgpu_depth_bake.js
app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js
app/legacy-runtime/core/compute/mask_webgpu/mask_localized_manager.js
app/legacy-runtime/qwave/qwave_system.js
app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js
app/legacy-runtime/input/webgpu_source_bridge.js
app/legacy-runtime/core/worker_porttrace.js
app/legacy-runtime/core/compute/qmap_webgpu/worker_porttrace.js
package.json
```

## 72. 수정 금지

본 명세 베이크에서 다음을 임의 수정해서는 안 된다.

- EWA weight 계산
- ΔK tensor 계산
- Q-map threshold
- Q-wave 수식
- Blend-If mask 수식
- encoder ABI
- PSD/JXL/JPEG codec artifact
- ICC transform 정책
- output dimension policy
- Production Pointer

알고리즘 변경이 필요하면 별도 명세로 분리한다.

---

## 73. 최종 판단

### 확정

현재 활성 runtime에는 단일 `GpuService` 선언과 별개로 다수의 직접 adapter/device 생성 경로, 세 개의 device-lost observer 계열, 분산된 pipeline/shader cache, raw global device alias가 존재한다.

따라서 현재 GPU 권한은 실질적으로 단일 SSOT가 아니다.

### 추정

단일 Authority와 epoch-bound lease를 먼저 닫으면, 후속 Surface Lifecycle과 Preview/Export parity에서 stale GPU object, duplicate pipeline compilation, device loss 후 묵은 texture 재사용 문제를 훨씬 좁은 범위에서 다룰 수 있다.

이 추정은 본 명세의 runtime receipt와 loss recovery gate로 검증돼야 한다.

### 판단 불가

현재 source-only 환경만으로는 실제 Windows Electron packaged runtime에서 device loss 후 driver와 Chromium이 어떤 reason/message를 반환하는지 확정할 수 없다.

따라서 최종 PASS는 Windows packaged E2E receipt 없이는 발행할 수 없다.

---

**End of Specification**
