# TDT-PREVIEW-PRESENTER-01

## Canonical Final Surface Presenter / GPUTexture Direct Presentation / Pipeline Subscription / Frame Fence / Display Transform Separation / Legacy Canvas Presentation Retirement Seal

- **Spec ID:** `TDT-PREVIEW-PRESENTER-01`
- **Revision:** `01`
- **Status:** `SPEC_DEFINED_UNBAKED`
- **Date:** `2026-07-25`
- **Parent patch:** `TDT-SURFACE-LIFECYCLE-01`
- **Parent source state:** `SURFACE_LIFECYCLE_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- **Parent ZIP SHA-256:** `ebd30158f98dcaf2862bec6e1f9e5b108c76ac80ceb0fd4ce0317398156f796c`
- **Target source state:** `PREVIEW_PRESENTER_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- **Maximum promotable state in this specification:** `PREVIEW_PRESENTER_VERIFIED_UNPROMOTED`
- **Production pointer mutation:** forbidden
- **Packaged-runtime claims without Windows x64 evidence:** forbidden
- **Image-processing algorithm mutation:** forbidden
- **Encoder ABI mutation:** forbidden
- **Output color-policy mutation:** forbidden

---

# 0. Executive decision

`TDT-GPU-DEVICE-SSOT-01`은 renderer realm의 adapter, device, device epoch와 pipeline cache 권한을 하나로 묶었다.
`TDT-SURFACE-LIFECYCLE-01`은 final surface를 포함한 표면의 소유권, pin, typed disposal, device epoch와 residency accounting을 하나로 묶었다.

그러나 화면에 보이는 픽셀의 권한은 아직 하나가 아니다.

현재 canonical `PreviewPresenterService`는 존재하지만 다음 문제가 남아 있다.

1. `PreviewPresenterService.present()`의 runtime 호출 지점이 없다.
2. `PipelineService.publishFinalCandidate()`는 final binding을 갱신하지만 Preview에 발행하지 않는다.
3. canonical Preview는 `ImageBitmap`과 RGBA8 CPU record만 표시할 수 있다.
4. GPU final surface의 직접 표시가 `gpuTextureDirectPresentationPromoted: false`로 남아 있다.
5. RGBA16 CPU surface와 `rgba16float` GPU surface의 표시 계약이 없다.
6. 지원하지 않는 surface가 들어오면 오류 영수증 없이 조용히 반환한다.
7. pin은 `drawImage()` 또는 `putImageData()` 호출 직후 풀리며 GPU 제출 완료 fence 개념이 없다.
8. Preview Store는 존재하지만 canonical presenter가 갱신하지 않는다.
9. 레거시 활성 그래프에는 독립 WebGPU preview renderer, overlay canvas presenter, 2D canvas writer, WebGL canvas owner가 동시에 존재한다.
10. 레거시 Preview Fit은 source metadata와 `#canvas.width/height`를 혼합해 표시 크기와 처리 크기를 같은 축에서 다룬다.
11. 일부 활성 코드가 `#canvas`를 export source 또는 pixel truth처럼 다시 읽는다.
12. device loss 뒤 화면에 남은 old-epoch frame을 제거하고 현재 final을 재표시하는 canonical recovery 절차가 없다.

따라서 본 명세의 결정은 다음과 같다.

> 사용자에게 보이는 Preview는 `PipelineService`가 발행한 canonical final binding을 `SurfaceRegistryAuthorityService`에서 pin하여 소비하는 단일 `PreviewPresenterAuthority`만 갱신한다.  
> GPU final surface는 readback 또는 CPU mirror 없이 같은 device epoch에서 직접 표시한다.  
> CPU·ImageBitmap surface는 canonical Preview Upload 경로를 통해 표시 전용 ephemeral GPU texture로 변환하되, final surface 자체는 수정하지 않는다.  
> 표시 크기, DPR, checkerboard, zoom과 display transform은 processing surface의 pixel identity와 분리한다.

이 명세는 다듬다듬의 리샘플 결과를 바꾸지 않는다.
이 명세는 그 결과를 누가, 언제, 어떤 표면 ID로 화면에 보여 주었는지를 제품 계약으로 만든다.

---

# 1. Scope

## 1.1 In scope

- `PreviewPresenterService`의 authority 승격
- `PipelineService` final binding typed subscription
- final revision publication과 Preview scheduling 결선
- latest-wins frame coalescing
- stale revision drop
- Preview surface pin과 submitted-work fence
- GPUTexture direct presentation
- CPU RGBA8 upload presentation
- CPU RGBA16/half-float upload presentation
- ImageBitmap external-image upload presentation
- canonical WebGPU canvas context ownership
- canonical overlay 또는 dedicated presentation canvas ownership
- display backing size와 source pixel size 분리
- viewport fit, zoom, pan, DPR의 display-only contract
- alpha checkerboard와 opaque backdrop의 display-only contract
- Preview Store projection
- Preview frame receipt ledger
- device loss suspend·clear·rebind·republish 절차
- legacy canvas presentation writer retirement
- legacy WebGPU overlay presenter retirement
- legacy canvas export-capture truth retirement
- side-effect registry ownership
- Active Graph·asset manifest·consumer manifest 갱신
- Source Gate, runtime mock smoke, packaged runtime gate 정의

## 1.2 Out of scope

다음은 본 명세에서 구현하거나 승격하지 않는다.

- EWA·Anisotropic resample runtime 단일화
- Preview와 Export의 pixel-by-pixel parity 최종 승격
- ICC monitor profile 또는 OS color-management integration
- HDR monitor output 승격
- tiled large-image runtime
- decoded expansion budget 승격
- encoder 또는 decoder 알고리즘 변경
- PSD Rust WASM 승격
- Native decoder release addon 승격
- JXL·MODJPEG artifact 변경
- WebGPU child worker device authority
- Production Pointer 변경

단, 위 후속 명세가 의존할 수 있도록 preview frame identity와 display transform evidence를 제공해야 한다.

---

# 2. Parent invariants

## 2.1 GPU authority invariants

- Renderer realm의 active adapter와 device는 각각 최대 하나다.
- Preview는 `GpuDeviceAuthorityService` lease만 사용한다.
- Preview 모듈 내부의 직접 `requestAdapter()` 및 `requestDevice()` 호출은 허용하지 않는다.
- Preview shader와 pipeline은 canonical GPU cache를 통해 생성한다.
- device epoch가 다른 GPU final surface는 표시하지 않는다.
- old epoch shader, pipeline, sampler, bind group cache를 재사용하지 않는다.

## 2.2 Surface lifecycle invariants

- Preview는 canonical surface ID만 소비한다.
- 비동기 frame은 surface pin을 사용한다.
- final surface payload를 전역으로 노출하지 않는다.
- Preview가 가진 pin이 있는 동안 해당 surface는 물리 폐기되지 않는다.
- Preview ephemeral upload texture도 Surface Authority에 등록한다.
- typed disposer는 exactly once다.
- shutdown 후 Preview pin과 ephemeral surface는 0이어야 한다.

## 2.3 Pipeline invariants

- `PipelineService`가 final revision의 유일한 권위다.
- source surface, original input, canvas fallback은 Preview final로 표시하지 않는다.
- Preview는 final binding을 새로 계산하거나 추론하지 않는다.
- Preview는 `surfaceId`, `sourceRevision`, `finalRevision`, `pipelineReceiptId`를 그대로 보존한다.

## 2.4 Export invariants

- Preview canvas는 Export source가 아니다.
- Preview display transform은 Export surface를 변경하지 않는다.
- Preview backing resolution은 output resolution SSOT가 아니다.
- Preview frame 성공 여부가 Encoder input identity를 변경하지 않는다.

## 2.5 Active Graph invariants

- Presenter retirement 대상은 quarantine 또는 compatibility shim으로만 남긴다.
- 동적 shader asset은 Runtime Asset Authority에 등록한다.
- listener, ResizeObserver, animation frame은 SideEffect Registry가 소유한다.
- random frame ID 또는 wall-clock 기반 identity를 만들지 않는다.

---

# 3. Observed baseline audit

본 수치는 parent artifact의 `generated-legacy-static-admission.json` 213개 admitted record와 canonical `app/src`를 기준으로 측정한 출발점이다.

## 3.1 Canonical preview audit

| Audit item | Observed | Interpretation |
|---|---:|---|
| `PreviewPresenterService` class | 1 | canonical service shell은 존재함 |
| `PreviewPresenterService.present()` runtime call sites | 0 | final publish와 화면 표시가 결선되지 않음 |
| `usePreviewStore()` consumer | 0 | preview state projection이 동작하지 않음 |
| GPUTexture direct presentation | false | receipt에 명시적으로 미승격 |
| CPU RGBA8 presentation | partial | `putImageData()` 기반 |
| CPU RGBA16 presentation | absent | 조용히 미표시 |
| GPU RGBA8/16 presentation | absent | record를 인식하지 못함 |
| ImageBitmap presentation | partial | 2D canvas `drawImage()` 기반 |
| Unsupported surface error receipt | absent | silent return |
| Device-loss preview recovery | absent | canonical state machine 없음 |
| Present-completion fence | absent | pin release가 제출 완료와 결선되지 않음 |

## 3.2 Active legacy canvas audit

| Pattern | Calls | Files |
|---|---:|---:|
| `#canvas` 또는 `#mainCanvas` 직접 조회 | 33 | active set 내부 분산 |
| `getContext('2d')` | 46 | active set 내부 분산 |
| WebGL context acquisition | 37 | active set 내부 분산 |
| WebGPU context acquisition | 6 | active set 내부 분산 |
| `.drawImage(` | 19 | 2D presentation 및 capture 혼재 |
| `.putImageData(` | 14 | decode, preview, capture 혼재 |
| `.getImageData(` | 24 | analysis, export, debug 혼재 |
| canvas pixel width assignment | 58 | processing/display dimension 혼재 |
| canvas pixel height assignment | 61 | processing/display dimension 혼재 |
| `requestAnimationFrame(` | 11 | 소유권 분산 |
| `createImageBitmap(` | 11 | close ownership 분산 |
| Preview 관련 canvas primitive를 가진 active files | 44 | 표시 권한이 단일하지 않음 |

이 수치는 모든 호출이 잘못됐다는 뜻이 아니다.
Decode용 staging canvas, 분석용 readback canvas와 사용자-visible Preview canvas를 구분해야 한다.
본 명세는 **사용자-visible presentation 권한**만 단일화하고, 비표시 compute staging은 명시적 예외 매니페스트에 귀속한다.

## 3.3 Existing legacy WebGPU preview path

`app/legacy-runtime/input/webgpu_preview_presenter.js`는 다음 상태를 자체 소유한다.

- `_gpuInit`
- `state.current`
- `state.currentView`
- `state.lastWidth`
- `state.lastHeight`
- private Promise queue
- canvas pixel size
- CPU surface upload
- direct texture draw

이 경로는 Surface Authority의 surface ID, pin, final revision, pipeline receipt를 모른다.
따라서 표시 성공을 canonical final evidence와 상관시킬 수 없다.

## 3.4 Existing overlay presenter

`app/legacy-runtime/js/passes/present_webgpu.js`는 다음을 자체 생성한다.

- `#canvasWGPUOverlay`
- `window.__DK_WGPU_PRESENT_STATE__`
- canvas context
- render pipeline
- sampler
- view bind-group WeakMap

GPU Authority bridge로 shader와 pipeline을 만들도록 일부 이관됐지만, DOM canvas와 presentation state는 여전히 레거시 전역 소유다.

## 3.5 Existing preview-fit ambiguity

`preview_fit_bind.js`는 다음 값을 혼합한다.

```text
window.__DADUM_IMAGE_META__.srcWidth/srcHeight
canvas.width/canvas.height
viewport client rect
canvas CSS width/height
```

따라서 다음 두 의미가 구분되지 않는다.

1. 처리 결과의 원본 pixel dimensions
2. 화면에 배치되는 CSS display dimensions

본 명세는 둘을 다른 SSOT로 분리한다.

## 3.6 Canvas capture risk

활성 코드 일부는 `#canvas`를 읽어 Blob, ImageData 또는 Encoder 입력으로 다시 사용한다.
Canonical Preview가 display transform과 scaling을 적용한 뒤에도 이 경로가 남으면 Preview가 Export truth로 역류할 수 있다.

따라서 본 명세 이후 다음 계약을 적용한다.

> 사용자-visible Preview canvas의 pixel content는 어떠한 Export Authority, independent decoder, quality receipt의 입력도 될 수 없다.

---

# 4. Canonical architecture

## 4.1 Service topology

```text
PipelineService
  └── FinalSurfacePublication
          │
          ▼
PreviewPresenterAuthorityService
  ├── PreviewFrameScheduler
  ├── PreviewLayoutAuthority
  ├── PreviewGpuPresenter
  ├── PreviewUploadAdapter
  ├── PreviewFrameReceiptLedger
  └── PreviewRecoveryParticipant
          │
          ├── GpuDeviceAuthorityService lease
          ├── SurfaceRegistryAuthorityService pin
          ├── SideEffectRegistry
          ├── Preview Store projector
          └── Canonical Presentation Canvas
```

## 4.2 Required service IDs

```ts
previewPresenter: 'dadum.runtime.preview-presenter'
previewLayout: 'dadum.runtime.preview-layout'
previewReceiptLedger: 'dadum.runtime.preview-receipt-ledger'
```

한 class 안에 구현할 수 있으나 receipt evidence는 다음 세 축으로 분리해야 한다.

- presentation authority
- layout authority
- receipt ledger

## 4.3 Capability IDs

- `dadum.preview.presenter`
- `dadum.preview.layout`
- `dadum.preview.receipt-ledger`
- `dadum.preview.gpu-direct`

`dadum.preview.gpu-direct`는 실제 GPUTexture direct smoke가 통과하기 전까지 capability로 publish하지 않는다.

## 4.4 Boot dependency

```text
gpu-authority
      ↓
surface-lifecycle
      ↓
pipeline
      ↓
preview-presenter
      ↓
legacy-adapter visual compatibility shim
```

Legacy Runtime이 presentation canvas를 먼저 생성하거나 context를 선점하면 안 된다.
Presentation canvas는 Preview module activation 시점에 authority가 생성하거나 기존 authoritative node를 검증해 adopt한다.

## 4.5 Canonical presentation surface

Canonical DOM identity는 다음 중 하나로 고정한다.

```text
canvas#dadumPreviewCanvas
```

다음 identity는 canonical presentation target이 아니다.

- `canvas#canvas`
- `canvas#mainCanvas`
- `canvas#canvasWGPUOverlay`
- 임의로 생성된 unnamed canvas
- OffscreenCanvas staging target

`#canvas`는 transition 기간 동안 processing/input compatibility anchor로 남을 수 있다.
그러나 사용자-visible pixel layer의 최상단은 `#dadumPreviewCanvas`여야 한다.

---

# 5. Final surface publication contract

## 5.1 Typed publication

`PipelineService`는 다음 immutable publication을 발행한다.

```ts
export interface FinalSurfacePublication {
  readonly runtimeEpoch: number;
  readonly surfaceId: string;
  readonly sourceRevision: number;
  readonly finalRevision: number;
  readonly pipelineReceiptId: string;
  readonly publicationSequence: number;
}
```

## 5.2 Subscription API

```ts
export type FinalSurfaceListener = (
  publication: FinalSurfacePublication,
) => void;

subscribeFinal(listener: FinalSurfaceListener): () => void;
```

규칙:

1. listener 등록 순서는 deterministic하다.
2. subscription disposer는 exactly once 의미를 가진다.
3. publication listener 오류는 final publication transaction을 rollback하지 않는다.
4. listener 오류는 Diagnostics와 Preview receipt에 기록한다.
5. Preview는 publication callback 안에서 GPU work를 직접 시작하지 않는다.
6. Preview는 callback에서 latest publication을 scheduler에 enqueue한다.
7. Pipeline은 Preview 성공을 기다리지 않는다.
8. Pipeline final SSOT는 Preview의 성공 또는 실패와 독립이다.

## 5.3 Publication order

```text
SurfaceRegistry.bindFinal()
→ Pipeline binding commit
→ previous final invalidation request
→ FinalSurfacePublication emit
→ Preview schedule
```

Preview가 pin을 얻지 못하면 final binding 자체는 유지된다.
단, Preview는 실패 receipt를 남기고 이전 frame을 그대로 진실처럼 유지하지 않는다.

## 5.4 Initial subscription replay

Preview module이 Pipeline보다 늦게 활성화되는 경우를 위해 `subscribeFinal()`은 옵션으로 current binding replay를 지원한다.

```ts
subscribeFinal(listener, { replayCurrent: true })
```

Replay publication은 새 final revision을 만들지 않는다.

---

# 6. Preview frame scheduler

## 6.1 State machine

```text
UNBOUND
  ↓ publication
QUEUED
  ↓ pin acquired
PREPARING
  ↓ GPU resources ready
SUBMITTED
  ↓ queue fence resolved
PRESENTED
```

보조 상태:

```text
QUEUED      → DROPPED_SUPERSEDED
PREPARING   → DROPPED_SUPERSEDED
PREPARING   → FAILED
SUBMITTED   → DEVICE_LOST
ANY         → SUSPENDED
SUSPENDED   → QUEUED after recovery/publication
ANY         → DISPOSED
```

## 6.2 Latest-wins policy

- final revision `N+1`이 `N` 제출 전에 도착하면 `N`은 drop한다.
- `N`이 이미 GPU queue에 제출됐다면 fence까지 pin을 유지한다.
- `N+1`은 `N` fence를 기다리지 않고 준비할 수 있으나, presentation queue 제출 순서는 revision order를 보존한다.
- `N+2`가 도착하면 아직 제출되지 않은 `N+1`은 drop할 수 있다.
- drop은 failure가 아니라 명시적 disposition이다.

## 6.3 Deterministic identifiers

```text
preview-frame:<runtimeEpoch>:<presenterGeneration>:<presentSequence>
```

금지:

- `Date.now()`를 frame identity로 사용
- `Math.random()` frame ID
- surface payload pointer를 identity로 사용
- canvas size를 frame identity로 사용

## 6.4 Reentrancy

- `present()`가 실행 중일 때 새 `present()`가 직접 재진입하지 않는다.
- single scheduler queue가 frame state를 직렬화한다.
- DOM resize callback은 final republish가 아니라 layout invalidation만 enqueue한다.
- device loss callback은 presentation queue를 suspend한다.

---

# 7. Surface pin and frame fence

## 7.1 Pin acquisition

Preview는 다음 purpose로 pin을 획득한다.

```text
preview-frame:<frameId>
```

consumer ID는 canonical Preview service ID다.

## 7.2 Pin lifetime

GPU direct path의 pin lifetime:

```text
pin acquire
→ texture view acquisition
→ bind group acquisition
→ command encoding
→ queue.submit()
→ queue.onSubmittedWorkDone()
→ pin release
```

CPU upload path의 final surface pin lifetime:

```text
final CPU surface pin acquire
→ ephemeral upload surface allocation
→ queue.writeTexture/copyExternalImageToTexture
→ upload completion ordering established
→ render submit
→ queue.onSubmittedWorkDone()
→ final surface pin release
```

Ephemeral upload texture는 다음 frame으로 재사용할 수 있으나 다음 조건을 만족해야 한다.

- 같은 runtime epoch
- 같은 device epoch
- 같은 texture format
- dimensions가 allocation보다 작거나 같음
- 이전 submit fence 완료
- residency ledger에 active record 존재

## 7.3 Fence failure

`queue.onSubmittedWorkDone()` reject 또는 device loss가 발생하면:

- frame state는 `DEVICE_LOST` 또는 `FAILED`
- pin은 finally에서 해제
- old-epoch ephemeral resources는 dispose 요청
- Preview Store는 `PRESENTED`로 갱신하지 않음
- frame receipt는 failure disposition 기록

## 7.4 No early release

다음은 금지한다.

- `queue.submit()` 직후 즉시 pin release
- render pass encode 직후 pin release
- texture view 생성 직후 pin release
- `requestAnimationFrame()` callback 등록만 하고 pin release

---

# 8. Presentation path matrix

## 8.1 GPU texture direct path

지원 surface:

- `gpu-texture / rgba8unorm`
- `gpu-texture / rgba8unorm-srgb`
- `gpu-texture / rgba16float`

조건:

- surface device binding = current GPU lease identity
- texture usage에 `TEXTURE_BINDING` 포함
- dimensions와 surface record 일치
- texture가 physically disposed되지 않음
- current device epoch

동작:

```text
Canonical final GPUTexture
→ createView()
→ canonical present bind group
→ presentation render pass
→ swap-chain texture
```

금지:

- `copyTextureToBuffer()` readback
- CPU RGBA mirror 생성
- `ImageData` 변환
- hidden canvas copy
- WebGL texture bridge

## 8.2 CPU RGBA8 upload path

지원 storage:

- `rgba8unorm`
- `rgba8unorm-srgb`

동작:

```text
Canonical CPU surface pin
→ row alignment plan
→ queue.writeTexture or staging copy
→ preview ephemeral GPU texture
→ canonical present shader
```

복사가 발생하므로 receipt에 다음을 기록한다.

- `presentationPath: cpu-upload-rgba8`
- uploaded bytes
- row-padding bytes
- ephemeral surface ID
- upload texture reuse 여부

## 8.3 CPU RGBA16 path

지원 storage:

- `rgba16float`
- `rgba16-direct` only when encoding contract is explicit half-float bit pattern

`rgba16-direct`가 정수 normalized channel인지 half-float bit pattern인지 불명확하면 fail-closed한다.
암묵적 reinterpretation은 금지한다.

필수 evidence:

- `channelEncoding`
- `componentType`
- `endianness`
- `alphaMode`
- `colorContract`

## 8.4 ImageBitmap path

```text
ImageBitmap final surface pin
→ copyExternalImageToTexture()
→ preview ephemeral texture
→ canonical present shader
```

금지:

- canonical visible canvas에 직접 `drawImage()`
- ImageBitmap ownership을 Preview가 임의로 close
- source surface disposer와 Preview disposer 중복

## 8.5 Unsupported path

지원하지 않는 surface는 silent return하지 않는다.

오류:

```text
E_PREVIEW_SURFACE_KIND_UNSUPPORTED
E_PREVIEW_STORAGE_UNSUPPORTED
E_PREVIEW_COLOR_CONTRACT_REQUIRED
E_PREVIEW_RGBA16_ENCODING_AMBIGUOUS
```

---

# 9. Canonical WebGPU presentation pipeline

## 9.1 GPU consumer identity

```text
dadum.gpu.consumer.preview-presenter
```

이 consumer는 `gpu-consumer-manifest.json`에 등록한다.

허용 권한:

- device lease acquire
- shader module cache request
- render pipeline cache request
- sampler creation through authority-owned resource factory
- bind group creation
- command encoder creation
- queue submit
- canvas context configure
- ephemeral preview texture allocation

금지 권한:

- adapter request
- device request
- processing pipeline texture mutation
- final surface destroy
- encoder invocation

## 9.2 Pipeline cache key

```text
preview-present-v1
+ deviceEpoch
+ canvasFormat
+ sourceSampleType
+ sourceColorInterpretation
+ alphaDisplayMode
+ displayTransformId
```

Canvas CSS size, zoom, pan과 final revision은 pipeline cache key가 아니다.

## 9.3 Shader behavior

Presenter shader는 다음만 수행한다.

- source texture sampling
- UV transform
- display-only scale/fit
- alpha checkerboard 또는 opaque backdrop composition
- declared display transfer function
- optional nearest/linear display sampling policy

Presenter shader는 다음을 수행하지 않는다.

- resample output 생성
- ringing suppression
- sharpen
- Q-map 적용
- ΔK 변형
- ICC output conversion
- export gamma 변경
- hidden RGB 수정

## 9.4 Sampling policy

Display sampling은 processing resampling과 분리한다.

- 기본 preview display sampling policy는 profile로 선언한다.
- zoom >= exact-pixel threshold에서는 nearest policy를 선택할 수 있다.
- 일반 fit에서는 linear display sampling을 사용할 수 있다.
- 이 선택은 final surface identity를 변경하지 않는다.

정책 ID 예:

```text
dadum.preview.display-sampling.fit-linear-v1
dadum.preview.display-sampling.pixel-nearest-v1
```

## 9.5 Canvas context configuration

Canvas context는 device epoch마다 최대 한 번 configure한다.

필수 evidence:

- device epoch
- canvas format
- alpha mode
- color space option when supported
- usage
- presenter generation

Device recovery 뒤 old context state를 그대로 current로 간주하지 않는다.

---

# 10. Display layout authority

## 10.1 Separation of dimensions

다음 세 dimension을 분리한다.

```text
sourcePixelSize
presentationBackingSize
presentationCssSize
```

- `sourcePixelSize`: final surface record의 width/height
- `presentationBackingSize`: canvas backing buffer pixel size
- `presentationCssSize`: viewport 안에서 보이는 CSS size

어느 하나도 다른 하나의 SSOT가 아니다.

## 10.2 Layout input

Layout Authority는 다음만 입력으로 사용한다.

- final surface aspect ratio
- viewport content rect
- user zoom
- user pan
- device pixel ratio
- authoritative preview profile

금지 입력:

- encoder output dimensions
- source metadata global fallback
- `window.__DADUM_IMAGE_META__` 추정값
- processing canvas backing size
- hidden canvas dimensions

## 10.3 Preview profile

신규 profile 파일:

```text
app/src/runtime/preview/preview-presentation-profile.json
```

필드:

```json
{
  "schemaVersion": 1,
  "fitMode": "contain",
  "allowUpscale": false,
  "maxDevicePixelRatio": "explicit-number-required-at-bake",
  "maxBackingPixels": "explicit-integer-required-at-bake",
  "displaySamplingFit": "linear",
  "displaySamplingPixel": "nearest",
  "transparentBackdrop": "checkerboard",
  "opaqueBackdrop": "neutral-dark"
}
```

문자 placeholder는 최종 bake에서 허용되지 않는다.
값은 코드 상수가 아니라 profile digest에 귀속한다.

## 10.4 Resize policy

- `ResizeObserver`는 Preview Layout Authority 하나만 소유한다.
- window resize listener도 SideEffect Registry를 통해 등록한다.
- resize storm은 animation frame 단위로 coalesce한다.
- resize는 final surface republish를 유발하지 않는다.
- resize는 CPU readback 또는 upload를 반복하지 않는다.
- GPU direct path에서는 bind source texture를 유지하고 swap-chain target만 갱신한다.

## 10.5 Accessibility

Canonical preview container는 다음을 제공한다.

- accessible name
- 현재 source dimensions
- 현재 zoom percentage
- transparency backdrop 상태
- presentation failure 상태

Canvas pixel content 자체를 screen reader가 읽는다고 주장하지 않는다.
필요한 상태만 DOM text 또는 aria description으로 제공한다.

---

# 11. Preview Store projection

Preview Store는 authority가 아니라 serializable projection이다.

## 11.1 State

```ts
interface PreviewProjectionState {
  status: 'EMPTY' | 'QUEUED' | 'PRESENTING' | 'PRESENTED' | 'SUSPENDED' | 'FAILED';
  presentedSurfaceId: string | null;
  presentedRevision: number;
  sourceRevision: number;
  frameSequence: number;
  presenterGeneration: number;
  sourceWidth: number;
  sourceHeight: number;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  zoom: number;
  presentationPath: string | null;
  displayTransformId: string | null;
  errorCode: string | null;
}
```

## 11.2 Projection rules

- raw GPUTexture 저장 금지
- ImageBitmap 저장 금지
- TypedArray 저장 금지
- surface pin 저장 금지
- DOM node 저장 금지
- Promise 저장 금지
- Store action이 presentation을 직접 수행하지 않음
- `PRESENTED`는 fence 완료 뒤에만 기록
- stale dropped frame은 presented revision을 덮어쓰지 않음

---

# 12. Preview frame receipt

## 12.1 Receipt schema

```ts
interface PreviewFrameReceiptV1 {
  schemaVersion: 1;
  patchId: 'TDT-PREVIEW-PRESENTER-01';
  frameId: string;
  runtimeEpoch: number;
  presenterGeneration: number;
  presentSequence: number;
  sourceRevision: number;
  finalRevision: number;
  surfaceId: string;
  pipelineReceiptId: string;
  surfaceKind: string;
  storage: string;
  sourceWidth: number;
  sourceHeight: number;
  presentationPath: 'gpu-direct' | 'cpu-upload-rgba8' | 'cpu-upload-rgba16' | 'image-bitmap-upload';
  deviceEpoch: number;
  deviceIdentity: string;
  canvasFormat: string;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  devicePixelRatio: number;
  zoom: number;
  displaySamplingPolicyId: string;
  displayTransformId: string;
  alphaDisplayMode: string;
  uploadBytes: number;
  rowPaddingBytes: number;
  ephemeralSurfaceId: string | null;
  disposition: 'PRESENTED' | 'DROPPED_SUPERSEDED' | 'FAILED' | 'DEVICE_LOST';
  stableErrorCode: string | null;
  receiptDigest: string;
}
```

## 12.2 Digest inputs

Digest에는 다음을 포함한다.

- frame identity
- final binding identity
- surface descriptor identity
- device epoch
- presentation path
- layout values
- display policy IDs
- disposition

Digest에는 다음을 포함하지 않는다.

- wall-clock timestamp
- GPU timing result
- DOM object identity
- native pointer
- randomized ID

## 12.3 Ledger retention

- current frame receipt
- previous successful frame receipt
- last failure receipt
- bounded recent history

Bound는 profile 또는 constant manifest에 명시한다.
무제한 배열은 금지한다.

---

# 13. Device loss and recovery

## 13.1 Recovery participant

Preview Presenter는 GPU Authority recovery participant로 등록한다.

```text
participantId: dadum.gpu.recovery.preview-presenter
```

## 13.2 Loss sequence

```text
device loss detected
→ scheduler suspend
→ queued not-submitted frames drop
→ submitted frame receipt = DEVICE_LOST
→ active frame pin abort/release through Surface Authority
→ old-epoch ephemeral preview surfaces dispose
→ canonical canvas visually clear
→ presenter generation increment
→ old shader/pipeline/bind caches discard
```

## 13.3 Recovery sequence

```text
new device epoch active
→ new device lease acquire
→ canvas context reconfigure
→ presentation shader/pipeline resolve from new epoch cache
→ current final binding inspect
```

Current final이 CPU 또는 ImageBitmap surface이면 repin 후 재표시할 수 있다.
Current final이 old-epoch GPU surface이면 재표시하지 않는다.
Pipeline이 새 device epoch에서 final을 republish할 때까지 `SUSPENDED` 또는 `EMPTY`로 유지한다.

## 13.4 Stale-frame prohibition

Device loss 이후 이전 swap-chain content가 화면에 남아 사용자에게 current result로 보이면 안 된다.
Loss callback은 canonical canvas를 neutral clear 상태로 전환한다.

## 13.5 Recovery retry

Recovery retry 횟수와 authority policy는 GPU SSOT를 따른다.
Preview Presenter가 독립 reload loop를 만들지 않는다.

---

# 14. Legacy presentation retirement

## 14.1 Retirement targets

다음 active presentation ownership은 퇴역 또는 compatibility delegation 대상으로 분류한다.

- `app/legacy-runtime/input/webgpu_preview_presenter.js`
- `app/legacy-runtime/js/passes/present_webgpu.js`
- `app/legacy-runtime/preview_fit_bind.js`
- `window.__DK_WGPU_PRESENT_STATE__`
- `#canvasWGPUOverlay`
- direct visible `#canvas` 2D presentation writes
- visible canvas export capture

## 14.2 Compatibility bridge

필요한 기존 API는 다음 frozen bridge로 축소할 수 있다.

```ts
window.DadumPreviewBridge = Object.freeze({
  requestPresent(finalRevision?: number): Promise<void>;
  requestLayout(reason: string): void;
  getProjection(): Readonly<PreviewProjectionState>;
  authority: 'dadum.preview.presenter.pp01';
});
```

금지:

- raw canvas context 반환
- raw device 반환
- raw texture 반환
- raw surface payload 반환
- arbitrary surface를 final로 표시
- source canvas capture

## 14.3 Legacy WebGPU renderer shim

`createWebGPUPreviewRenderer(canvas)`가 완전히 제거되기 어렵다면 transition shim은 다음만 허용한다.

- arbitrary canvas 인자 거부 또는 canonical canvas identity 검증
- `uploadSurface()` 직접 upload 금지
- `drawTex()` raw texture 인자 금지
- canonical final revision을 request하는 bridge 호출만 허용

Shim receipt에는 `legacyDelegation: true`를 기록한다.

## 14.4 Preview-fit shim

기존 `fitPreview(reason)`은 DOM style을 직접 쓰지 않고 다음으로 위임한다.

```text
DadumPreviewBridge.requestLayout(reason)
```

## 14.5 Canvas capture retirement

다음 행위는 active presentation path에서 금지한다.

- visible Preview canvas `getImageData()`
- visible Preview canvas `toBlob()`
- visible Preview canvas를 Encoder source로 전달
- visible Preview canvas를 independent decoder reference로 사용
- Preview canvas pixel sum을 품질 receipt로 사용

Compute staging canvas는 별도 exception manifest에 명시해야 한다.

---

# 15. Side-effect ownership

## 15.1 Canonical side effects

다음은 Preview Presenter service owner로 등록한다.

- ResizeObserver
- window resize listener
- devicePixelRatio change listener when used
- requestAnimationFrame layout coalescer
- Pipeline final subscription
- GPU recovery participant registration
- optional visibilitychange listener

## 15.2 Disposer order

```text
stop accepting publications
→ unsubscribe pipeline
→ cancel layout animation frame
→ disconnect ResizeObserver
→ release queued/preparing pins
→ wait or abort submitted fence according to loss/dispose reason
→ dispose ephemeral preview surfaces
→ unconfigure or detach canvas context where supported
→ remove compatibility bridge
→ remove canonical canvas when service created it
```

## 15.3 Duplicate binding gate

Runtime epoch당 각 side effect의 active owner count는 정확히 1이다.

---

# 16. Display transform separation

## 16.1 Identity

초기 canonical display transform은 다음 ID로 고정한다.

```text
dadum.preview.display-transform.identity-v1
```

이 ID는 monitor ICC transform 완료를 뜻하지 않는다.
Final surface의 declared transfer function을 canvas presentation에 맞게 표시하는 최소 계약이다.

## 16.2 Separation rule

```text
Final Surface Pixel Contract
        ≠
Preview Display Transform
```

Preview display transform 변경은 다음을 바꾸지 않는다.

- final surface ID
- final revision
- pipeline receipt ID
- Export input digest
- Encoder parameters
- output ICC metadata

## 16.3 Alpha display

- transparent surface는 checkerboard 또는 profile-defined backdrop 위에 합성해 표시
- opaque surface는 neutral backdrop
- Preview composite 결과를 final surface로 다시 등록하지 않음
- hidden RGB를 수정하지 않음

---

# 17. Error model

신규 stable error code:

```text
E_PREVIEW_CANVAS_MISSING
E_PREVIEW_CANVAS_CONTEXT_FAILED
E_PREVIEW_PIPELINE_SUBSCRIPTION_FAILED
E_PREVIEW_FINAL_BINDING_STALE
E_PREVIEW_SURFACE_PIN_FAILED
E_PREVIEW_SURFACE_KIND_UNSUPPORTED
E_PREVIEW_STORAGE_UNSUPPORTED
E_PREVIEW_COLOR_CONTRACT_REQUIRED
E_PREVIEW_RGBA16_ENCODING_AMBIGUOUS
E_PREVIEW_DEVICE_BINDING_STALE
E_PREVIEW_PIPELINE_CREATE_FAILED
E_PREVIEW_UPLOAD_FAILED
E_PREVIEW_SUBMIT_FAILED
E_PREVIEW_FENCE_FAILED
E_PREVIEW_LAYOUT_PROFILE_INVALID
E_PREVIEW_BACKING_SIZE_INVALID
E_PREVIEW_LEGACY_CANVAS_CAPTURE_REJECTED
E_PREVIEW_LEGACY_PRESENTER_RETIRED
E_PREVIEW_DEVICE_LOST
E_PREVIEW_RECOVERY_FAILED
E_PREVIEW_SHUTDOWN_LEAK
```

정보 및 경고 code:

```text
I_PREVIEW_FRAME_QUEUED
I_PREVIEW_FRAME_PRESENTED
I_PREVIEW_FRAME_DROPPED_SUPERSEDED
I_PREVIEW_LAYOUT_UPDATED
I_PREVIEW_DEVICE_RECOVERED
W_PREVIEW_GPU_FINAL_WAITING_REPUBLISH
W_PREVIEW_FRAME_FAILED_KEEPING_NEUTRAL
```

오류는 임의 문자열로 분기하지 않는다.

---

# 18. Implementation plan

## 18.1 New files

```text
app/src/runtime/preview/preview-presenter-types.ts
app/src/runtime/preview/preview-frame-scheduler.ts
app/src/runtime/preview/preview-layout-authority.ts
app/src/runtime/preview/preview-frame-receipt-ledger.ts
app/src/runtime/preview/preview-presentation-profile.json
app/src/runtime/preview/shaders/preview-present.wgsl
app/src/runtime/preview/preview-consumer-profile.json
```

필요에 따라 class를 합칠 수 있으나 계약과 receipt는 분리한다.

## 18.2 Modified files

```text
app/src/runtime/preview/preview-presenter-service.ts
app/src/runtime/pipeline/pipeline-service.ts
app/src/runtime/surfaces/surface-registry-authority-service.ts
app/src/runtime/surfaces/surface-types.ts
app/src/runtime/gpu/gpu-consumer-manifest.json
app/src/boot/runtime-modules.ts
app/src/runtime/service-token.ts
app/src/stores/preview.store.ts
app/src/components/LegacyDomIsland.vue
app/src/legacy/legacy-shell.html
app/src/styles/shell.css
app/src/legacy/generated-legacy-manifest.*
app/src/legacy/generated-legacy-static-admission.json
app/src/runtime/active-graph/generated-active-runtime-graph.*
app/src/runtime/assets/generated-runtime-asset-manifest.*
package.json
```

## 18.3 Legacy files to retire or delegate

```text
app/legacy-runtime/input/webgpu_preview_presenter.js
app/legacy-runtime/js/passes/present_webgpu.js
app/legacy-runtime/preview_fit_bind.js
app/legacy-runtime/hooks/afterRenderHook.js
```

`afterRenderHook.js`가 다른 비표시 책임을 갖고 있다면 presentation capture 부분만 quarantine하고 별도 파일로 분리한다.

## 18.4 Tooling

```text
tools/generate-preview-presenter-01-source-reports.mjs
tools/verify-preview-presenter-01-source.mjs
tools/verify-preview-presenter-01-runtime.mjs
tools/gate-preview-presenter-01.mjs
tools/finalize-preview-presenter-01-source-bake.mjs
```

---

# 19. Source audit policy

## 19.1 Visible canvas writer manifest

신규 manifest:

```text
tools/preview-visible-canvas-owner-manifest.json
```

필드:

```json
{
  "schemaVersion": 1,
  "canonicalCanvasId": "dadumPreviewCanvas",
  "canonicalOwnerServiceId": "dadum.runtime.preview-presenter",
  "allowedWriters": [],
  "stagingCanvasExceptions": []
}
```

Bake 완료 시 `allowedWriters`에는 canonical presenter implementation만 있어야 한다.

## 19.2 Scan patterns

Source Gate는 active graph에서 다음을 검사한다.

- canonical canvas 직접 query
- `getContext('2d')`
- `getContext('webgpu')`
- `drawImage`
- `putImageData`
- `getImageData`
- `toBlob`
- `toDataURL`
- canvas width/height mutation
- overlay canvas creation
- `__DK_WGPU_PRESENT_STATE__`
- `canvasWGPUOverlay`

모든 hit는 다음 중 하나여야 한다.

1. canonical presenter owner
2. declared staging exception
3. quarantine source

## 19.3 Export capture scan

Export Authority와 encoder path가 다음을 참조하면 FAIL한다.

- `dadumPreviewCanvas`
- `canvasWGPUOverlay`
- `DadumPreviewBridge` raw pixel API
- Preview Store dimensions as output dimensions

---

# 20. Runtime smoke matrix

## 20.1 CPU RGBA8

- final A publish
- Preview publication receive
- surface pin acquire
- upload texture allocate
- render submit
- fence resolve
- pin release
- Store `PRESENTED`
- receipt identity exact

## 20.2 GPU RGBA8 direct

- current device epoch texture final publish
- no readback
- no host upload bytes
- direct path receipt
- pin release after fence

## 20.3 GPU RGBA16float direct

- float sample pipeline
- canvas output finite
- no CPU conversion
- direct path receipt

## 20.4 CPU RGBA16

- explicit half-float encoding accepted
- ambiguous encoding rejected
- uploaded bytes exact
- row alignment accounting exact

## 20.5 ImageBitmap

- external upload
- final ImageBitmap not closed by Preview
- Surface Authority disposer remains sole closer

## 20.6 Revision supersede

```text
publish N
publish N+1 before N submit
```

Expected:

- N = `DROPPED_SUPERSEDED`
- N+1 = `PRESENTED`
- no leaked pins
- Store revision = N+1

## 20.7 Replacement during submitted frame

```text
N submitted
N+1 published
```

Expected:

- N pin retained until fence
- N+1 may queue
- N surface disposed only after N fence and pin release

## 20.8 Resize storm

- 100 resize notifications
- at most coalesced layout frames according to scheduler policy
- no final republish
- no CPU reupload for GPU-direct source
- no surface ID change

## 20.9 Device loss

- submitted frame
- device loss
- neutral clear
- old frame not marked PRESENTED
- old-epoch ephemeral resources disposed
- CPU final re-present after recovery
- old-epoch GPU final waits for republish

## 20.10 Shutdown

- publication queued
- resize scheduled
- frame submitted
- runtime dispose

Expected:

- subscriptions 0
- ResizeObserver 0
- animation frames 0
- Preview pins 0
- Preview ephemeral surfaces 0
- compatibility bridge absent

---

# 21. Output conservation

본 명세는 표시 권한만 변경한다.
따라서 다음을 보존해야 한다.

- final surface ID sequence semantics
- final surface pixel payload
- source revision
- final revision
- pipeline receipt ID
- Export input surface ID
- encoder selection
- output dimensions
- output bit depth
- output alpha policy
- output ICC metadata policy

Preview migration 전후의 output artifact digest가 deterministic format에서 바뀌면 FAIL한다.
Lossy encoder는 exact byte digest 대신 기존 구조·pixel validation receipt를 따른다.

---

# 22. Gate definitions

## 22.1 Source and composition gates

### `PP01-01` Parent identity

- Parent ZIP SHA-256 exact
- Parent Surface Lifecycle receipt exact

### `PP01-02` Canonical service

- Preview Presenter authority class 존재
- service ID exact

### `PP01-03` Boot order

- GPU Authority → Surface Lifecycle → Pipeline → Preview

### `PP01-04` Capability ownership

- `dadum.preview.presenter` owner exact

### `PP01-05` Pipeline subscription API

- typed subscribe/unsubscribe 존재

### `PP01-06` Runtime present call closure

- final publication이 Preview scheduler에 결선
- canonical `present()` dead API 금지

### `PP01-07` Store projection

- Preview Store가 canonical presenter에서만 갱신

### `PP01-08` Deterministic frame identity

- random/time identity 0

### `PP01-09` Stable errors

- 신규 error code registry exact

### `PP01-10` Profile closure

- presentation profile placeholder 0
- profile digest 생성

## 22.2 Canvas authority gates

### `PP01-11` Canonical canvas identity

- `#dadumPreviewCanvas` exactly one

### `PP01-12` Canonical canvas owner

- writer owner exactly one

### `PP01-13` Legacy overlay retirement

- `#canvasWGPUOverlay` active creation 0

### `PP01-14` Legacy global state retirement

- `__DK_WGPU_PRESENT_STATE__` active write 0

### `PP01-15` Direct 2D visible writes

- canonical visible canvas `drawImage/putImageData` 0

### `PP01-16` Preview canvas readback

- canonical visible canvas `getImageData/readPixels/toBlob` 0

### `PP01-17` Export capture independence

- Export path preview canvas refs 0

### `PP01-18` Resize ownership

- ResizeObserver owner exactly one

### `PP01-19` Animation-frame ownership

- layout RAF owner exactly one

### `PP01-20` Side-effect disposal

- dispose 후 active side effects 0

## 22.3 Surface and frame gates

### `PP01-21` Final-only input

- Preview source is Pipeline final binding only

### `PP01-22` Surface pin

- every async frame has canonical pin

### `PP01-23` Fence-bound release

- GPU pin release after submitted-work fence

### `PP01-24` Latest-wins

- pre-submit stale frame drop exact

### `PP01-25` Submitted-frame retention

- final replacement 중 submitted surface alive

### `PP01-26` Pin leak

- smoke 종료 후 Preview pins 0

### `PP01-27` Ephemeral registry

- upload textures registered in Surface Authority

### `PP01-28` Ephemeral disposal

- replacement/shutdown 후 old ephemeral surfaces 0

### `PP01-29` No final mutation

- Preview never writes final surface

### `PP01-30` Receipt correlation

- frame receipt final binding fields exact

## 22.4 Presentation path gates

### `PP01-31` GPU RGBA8 direct

- no readback
- no host upload

### `PP01-32` GPU RGBA8 sRGB direct

- declared sample interpretation exact

### `PP01-33` GPU RGBA16float direct

- no CPU conversion

### `PP01-34` CPU RGBA8 upload

- uploaded bytes and padding exact

### `PP01-35` CPU RGBA16 explicit encoding

- explicit channel encoding required

### `PP01-36` CPU RGBA16 ambiguity rejection

- ambiguous input fail-closed

### `PP01-37` ImageBitmap upload

- Preview does not close final bitmap

### `PP01-38` Unsupported kind rejection

- no silent return

### `PP01-39` Pipeline cache ownership

- Preview shader/pipeline outside GPU Authority 0

### `PP01-40` Direct device requests

- Preview path requestAdapter/requestDevice 0

## 22.5 Layout and display gates

### `PP01-41` Dimension separation

- source/backing/CSS dimensions distinct fields

### `PP01-42` Fit determinism

- same viewport/profile gives same layout

### `PP01-43` Resize non-processing

- resize does not republish final

### `PP01-44` GPU-direct resize reuse

- resize does not reupload source

### `PP01-45` DPR profile

- DPR clamp from authoritative profile

### `PP01-46` Backing pixel budget

- profile bound enforced

### `PP01-47` Display sampling identity

- policy ID in receipt

### `PP01-48` Display transform identity

- transform ID in receipt

### `PP01-49` Alpha display separation

- checkerboard does not mutate final

### `PP01-50` Serializable projection

- Pinia nonserializable values 0

## 22.6 Recovery, package and conservation gates

### `PP01-51` Device loss suspend

- scheduler stops submissions

### `PP01-52` Neutral clear

- stale frame not shown after loss

### `PP01-53` Old epoch disposal

- Preview old-epoch resources 0

### `PP01-54` CPU final recovery

- current CPU final re-presented after recovery

### `PP01-55` GPU final republish requirement

- old-epoch GPU final not reused

### `PP01-56` Packaged canvas identity

- asar/runtime DOM has exactly one canonical canvas

### `PP01-57` Packaged GPU direct smoke

- physical GPU direct path observed

### `PP01-58` Relaunch cleanup

- prior process Preview side effects and resources absent

### `PP01-59` Output conservation

- export identity preserved

### `PP01-60` Promotion receipt

- all mandatory evidence sealed
- Production Pointer unchanged

---

# 23. Gate classification

## 23.1 Source-bake mandatory PASS

다음은 Source Bake에서 반드시 PASS해야 한다.

```text
PP01-01 through PP01-50
PP01-59 source-contract portion
```

단, physical browser GPU가 필요한 세부 항목은 source contract와 mock smoke로 분리한다.

## 23.2 Packaged-runtime deferred allowed

Source Bake에서 다음은 `DEFERRED_PACKAGED_RUNTIME`을 허용한다.

```text
PP01-51 physical loss path
PP01-52 physical swap-chain clear
PP01-53 driver-backed old epoch disposal
PP01-54 physical recovery presentation
PP01-55 physical GPU final republish
PP01-56 packaged DOM identity
PP01-57 physical GPU direct smoke
PP01-58 Electron relaunch cleanup
PP01-59 packaged output conservation
PP01-60 final promotion receipt
```

Mock 결과를 physical PASS로 승격하면 안 된다.

---

# 24. Required artifacts

```text
artifacts/preview-presenter-01/source-bake/
  TDT_PREVIEW_PRESENTER_01_SOURCE_RECEIPT.json
  TDT_PREVIEW_PRESENTER_01_BASELINE_AUDIT.json
  TDT_PREVIEW_PRESENTER_01_CANVAS_OWNER_REPORT.json
  TDT_PREVIEW_PRESENTER_01_PIPELINE_SUBSCRIPTION_REPORT.json
  TDT_PREVIEW_PRESENTER_01_PRESENTATION_PATH_REPORT.json
  TDT_PREVIEW_PRESENTER_01_SURFACE_PIN_REPORT.json
  TDT_PREVIEW_PRESENTER_01_LAYOUT_PROFILE_REPORT.json
  TDT_PREVIEW_PRESENTER_01_LEGACY_RETIREMENT_REPORT.json
  TDT_PREVIEW_PRESENTER_01_RUNTIME_SMOKE.json
  TDT_PREVIEW_PRESENTER_01_REGRESSION_SUMMARY.json
```

Packaged runtime:

```text
artifacts/preview-presenter-01/packaged-runtime/
  TDT_PREVIEW_PRESENTER_01_PACKAGED_RECEIPT.json
  TDT_PREVIEW_PRESENTER_01_GPU_DIRECT_RECEIPT.json
  TDT_PREVIEW_PRESENTER_01_DEVICE_LOSS_RECEIPT.json
  TDT_PREVIEW_PRESENTER_01_RELAUNCH_RECEIPT.json
  TDT_PREVIEW_PRESENTER_01_OUTPUT_CONSERVATION_RECEIPT.json
```

---

# 25. Required package scripts

```json
{
  "scripts": {
    "verify:preview-presenter-01:source": "node tools/verify-preview-presenter-01-source.mjs",
    "verify:preview-presenter-01:runtime": "node tools/verify-preview-presenter-01-runtime.mjs",
    "gate:preview-presenter-01": "node tools/gate-preview-presenter-01.mjs",
    "finalize:preview-presenter-01:source-bake": "node tools/finalize-preview-presenter-01-source-bake.mjs"
  }
}
```

Packaged 실행 명령은 `PROMOTION-BASELINE-00` runner와 결합한다.

---

# 26. Acceptance matrix

| Area | Source Bake | Mock Runtime | Windows Packaged | Physical GPU |
|---|---:|---:|---:|---:|
| Pipeline subscription | required | required | required | not separately required |
| Canonical canvas ownership | required | required | required | required |
| GPU direct source code | required | mock | required | required |
| CPU upload | required | required | required | required |
| RGBA16 contract | required | required | required | required |
| Surface pin/fence | required | required | required | required |
| Resize coalescing | required | required | required | required |
| Device loss | source contract | mock | required | required |
| Legacy presenter retirement | required | required | required | required |
| Output conservation | source contract | mock | required | required |
| Relaunch cleanup | not claimable | not claimable | required | required |

---

# 27. Failure policy

다음 중 하나라도 발생하면 Source Bake를 생성하지 않는다.

- canonical `present()` 호출 지점 0
- Pipeline final publication 미결선
- visible canvas owner 2개 이상
- GPU direct path가 readback 수행
- Preview pin이 fence 전에 해제됨
- unsupported surface silent return
- Preview Store에 nonserializable payload 저장
- device epoch 검증 누락
- Preview canvas가 Export source로 사용됨
- legacy overlay canvas active creation 잔존
- profile placeholder 잔존
- changed TypeScript syntax failure
- parent Gate regression

다음은 Source Bake를 허용하되 packaged promotion을 막는다.

- physical device-loss smoke 미실행
- Windows packaged canvas identity 미검증
- Electron relaunch cleanup 미검증
- physical GPU RGBA16 direct 미검증
- packaged output conservation 미검증

---

# 28. Rollback contract

본 패치의 rollback은 Production Pointer가 아니라 source patch rollback이다.

Rollback 시:

- parent Surface Lifecycle source state로 복귀
- Preview Presenter 신규 files 제거
- Pipeline subscription extension 제거
- legacy presenter retirement shim 복원
- Active Graph와 asset manifest parent digest 복원
- Source receipt와 patch manifest 보존

Rollback이 legacy Preview를 production truth로 승격한다는 뜻은 아니다.
Parent state의 미승격 상태로 돌아갈 뿐이다.

---

# 29. Security and trust boundary

- Preview bridge는 raw device, texture, buffer, surface payload를 노출하지 않는다.
- DOM에서 임의 canvas ID를 받아 adopt하지 않는다.
- shader source는 runtime asset digest로 검증한다.
- final surface ID는 Pipeline publication에서만 받는다.
- external message 또는 custom event가 arbitrary surface ID를 주입할 수 없다.
- Preview receipt는 UI text 또는 filename을 trust source로 사용하지 않는다.
- canvas readback을 export truth로 사용하지 않는다.

---

# 30. Performance non-regression boundary

본 명세는 최종 성능 승격 명세가 아니지만 다음 구조적 회귀를 금지한다.

- GPU final display를 위한 full-frame CPU readback
- GPU direct frame마다 새 pipeline compile
- resize마다 source reupload
- frame마다 sampler 재생성
- unbounded bind-group cache
- unbounded receipt history
- frame마다 new visible canvas 생성
- final publish마다 ResizeObserver 재등록

구체적인 시간 예산은 후속 `TDT-PERF-STABILITY-01`에서 승격한다.

---

# 31. Promotion state machine

```text
SURFACE_LIFECYCLE_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME
        ↓ source patch + source gates
PREVIEW_PRESENTER_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME
        ↓ Windows packaged + physical GPU gates
PREVIEW_PRESENTER_VERIFIED_UNPROMOTED
```

본 명세는 다음 상태를 만들 수 없다.

- `PRODUCTION_PROMOTED`
- `PREVIEW_EXPORT_PARITY_VERIFIED`
- `COLOR_PIPELINE_VERIFIED`
- `RESAMPLE_RUNTIME_VERIFIED`

---

# 32. Follow-up dependency

본 명세 완료 뒤 다음 명세는 다음 중 하나다.

1. `TDT-RESAMPLE-RUNTIME-01`
   - Preview와 Export가 같은 processing final을 생산하도록 리샘플 경로 단일화

2. `TDT-PREVIEW-EXPORT-PARITY-01`
   - final surface pixel identity와 display transform 분리의 packaged 증명

로드맵 순서상 다음은 `TDT-RESAMPLE-RUNTIME-01`이 우선이다.
Presenter가 같은 final surface를 표시할 수 있게 된 뒤에야, 그 final을 만드는 리샘플 경로가 정말 하나인지 봉인할 수 있다.

---

# 33. Definition of done

Source Bake 완료 조건:

- canonical final publication이 Preview scheduler에 연결됨
- canonical visible canvas owner가 정확히 하나
- GPU RGBA8/16 direct path 구현
- CPU RGBA8/16 및 ImageBitmap upload path 구현
- pin과 GPU fence 결선
- latest-wins revision scheduling
- device loss source contract 구현
- display layout과 processing dimensions 분리
- legacy overlay·presenter·capture path active ownership 퇴역
- Preview Store projection serializable
- frame receipt 생성
- Source Gate mandatory 항목 PASS
- 기존 R7·Worker·Codec·GPU SSOT·Surface Lifecycle 회귀 PASS
- Production Pointer 무변이

Packaged verification 완료 조건:

- Windows x64 Electron에서 canonical canvas exactly one
- RTX 3080에서 GPU direct path 확인
- device loss/recovery 후 stale frame 0
- relaunch 후 Preview resource leak 0
- Preview migration 전후 Export conservation PASS
- 최종 receipt chain seal

---

# 34. Final normative statement

`TDT-PREVIEW-PRESENTER-01` 완료 뒤 사용자에게 보이는 이미지는 더 이상 우연히 마지막으로 `#canvas`에 그린 픽셀이 아니다.

그 이미지는 다음 질문에 모두 답할 수 있어야 한다.

- 어떤 final surface ID인가
- 어떤 final revision인가
- 어떤 source revision에서 왔는가
- 어떤 pipeline receipt와 연결되는가
- CPU upload인가 GPU direct인가
- 어떤 device epoch에서 제출됐는가
- 어떤 display sampling과 transform을 사용했는가
- frame이 실제 제출 완료됐는가
- replacement와 device loss 동안 pin이 안전했는가
- Export truth와 분리돼 있는가

이 질문에 receipt로 답할 수 없는 frame은 canonical Preview가 아니다.
