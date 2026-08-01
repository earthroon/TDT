# TDT-EXPORT-WORKER-06
## MODJPEG Dedicated Worker Promotion / RGBA→RGB·Alpha Policy / Quality·4:4:4·Marker / Pthread Retirement Truth Seal

> **상태:** IMPLEMENTATION SPECIFICATION  
> **부모 봉인:** `TDT-EXPORT-WORKER-05`  
> **상위 권위:** `TDT-EXPORT-WORKER-02`, `TDT-RUNTIME-SSOT-01-R7`  
> **대상 저장소:** 다듬다듬 Vite·Vue3·Pinia Runtime + Legacy ExportManager  
> **직접 대상:** JPEG Export, MODJPEG Emscripten WASM, RGB8 4:4:4 Encode, Explicit Alpha Disposition, JPEG Marker Finalization  
> **승격 성격:** Renderer Main-thread JPEG Encode 권위 제거 및 Canonical MODJPEG Worker 단일화  
> **후속 명세:** `TDT-EXPORT-WORKER-07 PSD Plane Split / LCMS / Worker Closure Seal`

---

# 0. 문서 목적

EW01은 Worker 생성권·URL·Runtime Epoch·Artifact Identity를 Runtime으로 회수했다.

EW02는 Worker Job ID·입력 Snapshot·FIFO·Timeout·Abort·Cancel·Crash Restart·Pending Closure를 `EncoderWorkerBrokerService`로 회수했다.

EW03은 WebP Lossless와 PNG8·PNG16을 Canonical Worker Codec으로 승격했다.

EW04는 PSD Binary Serialization 권위를 Canonical Worker 경로로 회수했다.

EW05는 JXL Lossless의 ABI·Bit-depth·Pthread·Container 권위를 Dedicated Worker로 회수했다.

그러나 JPEG는 여전히 Renderer Main Thread에서 다음 작업을 수행한다.

```text
Runtime ExportAuthorityService
→ dadum.encoder.jpg.v1
→ Legacy ExportManager exact handler
→ import('./encoders/modjpeg_bind_bootstrap.mjs')
→ Renderer Main Thread에서 Shared WebAssembly.Memory 256 MiB 생성
→ Renderer Main Thread에서 Emscripten Module import
→ Renderer Main Thread에서 RGBA8 → RGB8 변환
→ Renderer Main Thread에서 _malloc / HEAPU8.set
→ encode_mozjpeg_RGB()
→ Renderer Main Thread에서 Output Copy
→ JPEG Blob
```

현재 `modjpeg_bind_bootstrap.mjs`는 다음 전역도 설치한다.

```text
window.MODJPEG.ready()
window.MODJPEG.encodeRGBA()
window.MODJPEG._unsafeModule()
```

즉 JPEG Encoder Module과 Heap이 Renderer Realm에 직접 노출된다.

현재 C Source의 `encode_mozjpeg_RGB()`는 실제로 4:4:4 Sampling Factor를 강제한다.

```text
Y  h=1 v=1
Cb h=1 v=1
Cr h=1 v=1
```

그러나 다음 의미 불일치가 남아 있다.

- UI·Registry는 JPEG가 Alpha를 지원하지 않는다고 말하지만, 실제 Encode 경로는 Non-opaque Alpha를 검사하지 않고 RGB만 추출한다.
- 투명 픽셀의 RGB가 어떤 Matte 위에 보일지 정하지 않은 채 Alpha만 버린다.
- Quality는 `0..1 ratio`와 `1..100 percent`를 동시에 받아 동일 필드의 단위가 모호하다.
- `quality=0.95`는 95로 바뀌지만 `quality=1`은 ratio 100으로 해석되어 percent 1과 충돌한다.
- JPEG Runtime Verifier는 `FF D8 FF`만 확인한다.
- 실제 4:4:4 여부, 8-bit Precision, Width·Height, Component Count, Baseline·Progressive Mode, Marker Boundary, EOI, ICC, DPI를 검증하지 않는다.
- Resolution SSOT는 JPEG JFIF·Exif를 읽을 수 있지만 활성 JPEG Export는 DPI Marker를 Canonical하게 쓰지 않는다.
- Custom ICC를 Worker Output에 봉인하는 권위가 없다.
- Emscripten Glue는 `PTHREAD_POOL_SIZE=8`을 생성한다.
- 현재 C Encoder Source에는 `pthread_create`, OpenMP, Worker Dispatch 등 JPEG Stage의 병렬 실행 증거가 없다.
- 따라서 8개의 Child Worker는 실제 Encode 병렬성 증거 없이 생성 비용과 수명 위험만 만든다.
- Shared Memory 256 MiB가 Renderer에서 생성되며, JPEG가 실제로 Shared Memory를 필요로 하는지 증명되지 않았다.
- 현재 `encode_mozjpeg_RGB()`는 Output Buffer Ownership을 `jpgbuffer_ptr/len/free`로 관리하지만, Cleanup Receipt가 없다.
- Worker Output 뒤 Byte Mutation 여부를 검증하지 않는다.
- Main-thread Encode와 Dedicated Worker Encode의 Byte Parity가 없다.

본 명세는 다음 권위선을 만든다.

```text
Final Surface RGBA8
→ JPEG Encode Plan v1
→ EW02 EncoderWorkerBrokerService.call()
→ dadum.worker.encoder.modjpeg-canonical-v1
→ dadum-modjpeg-canonical-worker-v1
→ Worker-local RGBA Alpha Resolution
→ Worker-local RGBA8 → RGB8 Conversion
→ Single-thread Canonical MODJPEG WASM
→ preserved encode_mozjpeg_RGB() ABI
→ Worker-local JFIF / ICC Marker Finalizer
→ JPEG Structure Verifier v2
→ Independent JPEG Decoder Round-trip + Metric Evidence
→ Worker Job Receipt
→ JPEG Codec Promotion Receipt
→ R7 Export Receipt
```

# 1. 한 문장 목표

> **`encode_mozjpeg_RGB()` 안정 ABI를 Dedicated Canonical Worker 안에서만 호출하고, Alpha 처리 정책·Quality 단위·8-bit RGB·4:4:4 Sampling·Baseline Mode·DPI·ICC Marker·Output SHA·독립 Decoder 결과가 모두 일치하며 Renderer Main-thread JPEG Encode와 정당화되지 않은 Pthread Child Pool이 0일 때만 `dadum.encoder.jpg.v1` Export Receipt를 발급한다.**

# 2. 소스 기준 사실과 명세 판단 분리

## 2.1 소스에서 확정되는 사실

- 활성 `ExportManager`의 `jpg`와 `jpeg` Lazy Loader는 모두 `./encoders/modjpeg_bind_bootstrap.mjs`를 import한다.
- `jpeg`는 별도 Encoder Identity가 아니라 `jpg`의 입력 Alias다.
- `modjpeg_bind_bootstrap.mjs`는 Renderer Realm에서 실행된다.
- Bootstrap은 `window`, `location`, `window.__APP_BASE__`를 직접 참조한다.
- Bootstrap은 256 MiB Shared `WebAssembly.Memory`를 Renderer에서 생성한다.
- Bootstrap은 Emscripten Module에 `wasmMemory`를 주입한다.
- Bootstrap은 RGBA8를 RGB8로 변환한 뒤 WASM Heap에 복사한다.
- RGBA→RGB 변환은 Alpha 값을 읽지 않는다.
- `normalizeJpegQuality()`는 `(0,1]`을 Ratio로, `[1,100]`을 Percent로 동시에 해석한다.
- `quality=1`은 Ratio 100으로 해석된다.
- `encode_mozjpeg_RGB()` ABI는 RGB Pointer, Width, Height, Quality, Output Struct Pointer를 받는다.
- Output Struct는 wasm32 기준 `{u8* buf; size_t len}` 8 Byte로 처리된다.
- `jpgbuffer_ptr`, `jpgbuffer_len`, `jpgbuffer_free` Symbol이 존재한다.
- C Source는 `jpeg_set_defaults()` 뒤 Y·Cb·Cr Sampling Factor를 모두 `1x1`로 설정한다.
- C Source는 `cinfo.optimize_coding = TRUE`를 설정한다.
- C Source는 `jpeg_simple_progression()`을 호출하지 않는다.
- 현재 제품 ABI는 Interleaved RGB8 경로 `encode_mozjpeg_RGB()`를 사용한다.
- 동일 WASM에는 YCbCr Raw·Guide 기반 Symbol도 존재하지만 현재 제품 ExportManager는 사용하지 않는다.
- Emscripten Glue는 Pthread Pool 8개를 미리 할당한다.
- 확인된 C Encoder Source에는 JPEG Encode Stage가 Pthread Pool을 실제 사용하는 명시 호출이 없다.
- Runtime Encoder Registry는 JPEG `supportsAlpha:false`, `supportsBitDepths:[8]`을 광고한다.
- Runtime JPEG Verifier는 SOI Prefix만 검사한다.
- Resolution SSOT는 JPEG JFIF APP0와 Exif APP1의 DPI를 읽을 수 있다.
- 활성 JPEG Export 경로에는 Canonical DPI·ICC Marker Writer가 없다.
- `libmodjpeg_wasm.wasm` Artifact가 저장소에 존재한다.
- `mozjpeg.min.js`는 Dummy Placeholder이며 Canonical 제품 경로로 사용하면 안 된다.

## 2.2 본 명세의 설계 판단

- JPEG Encode는 Dedicated Canonical Worker에서만 실행해야 한다.
- Renderer Main Thread는 MODJPEG Module·Memory·Heap·RGBA→RGB 변환을 소유하지 않아야 한다.
- `window.MODJPEG` 전역은 제품 경로에서 제거해야 한다.
- Canonical JPEG Operation은 RGB8 4:4:4 Baseline Sequential로 제한한다.
- Progressive JPEG, 4:2:0, 4:2:2, CMYK JPEG는 별도 Capability 없이는 허용하지 않는다.
- Quality 단위는 정수 Percent `1..100` 하나로 고정한다.
- Legacy Ratio Quality는 Compatibility Adapter에서만 명시적으로 변환하고 Receipt에 원 단위와 변환을 기록한다.
- Alpha는 조용히 폐기하지 않는다.
- 기본 Alpha Policy는 `reject-nonopaque-v1`이다.
- 투명 입력을 JPEG로 내보내려면 명시적 `composite-over-matte-srgb8-v1`과 Matte Color가 필요하다.
- Matte Composite는 Worker에서 수행해야 한다.
- Hidden RGB는 Alpha Composite 식에 따라 처리되며 조용한 RGB 추출을 금지한다.
- Canonical MODJPEG Artifact는 Single-thread Build여야 한다.
- 현재 Pthread Pool 8 Artifact는 Source Compatibility에는 사용할 수 있어도 Final Promotion Artifact가 될 수 없다.
- Pthread를 유지하려면 JPEG Stage의 실제 Executed-thread Telemetry가 별도 명세로 증명되어야 한다.
- JPEG DPI와 ICC Marker Finalization은 Worker 내부에서 끝내야 한다.
- Worker 반환 뒤 Renderer가 JPEG Byte를 수정할 수 없다.
- JPEG 구조 검증은 SOI Prefix가 아니라 Marker Graph 전체를 파싱해야 한다.
- 독립 Decoder 검증은 Lossless Equality가 아니라 Dimension·Color·Metric·Alpha Disposition Evidence를 요구한다.

# 3. 핵심 권위선

```text
Runtime Export Authority
→ dadum.encoder.jpg.v1
→ Final Surface Binding
→ JPEG Capability Resolver
→ JPEG Encode Plan v1
→ EncoderWorkerBrokerService.call()
→ dadum.worker.encoder.modjpeg-canonical-v1
→ dadum-modjpeg-canonical-worker-v1
→ Worker-local Input Admission
→ Worker-local Alpha Policy
→ Worker-local RGBA8 → RGB8
→ Single-thread MODJPEG Module Singleton per Generation
→ encode_mozjpeg_RGB()
→ Worker-local Marker Finalizer
→ Immutable Final JPEG Bytes
→ JPEG Structure Verifier v2
→ Independent JPEG Decoder + Metric Evaluator
→ Worker Job Receipt
→ JPEG Promotion Receipt
→ R7 Export Receipt
```

권위 경계는 다음과 같다.

```text
Final Pixel Authority
= PipelineService Final Surface

JPEG Parameter Authority
= JPEG Encode Plan v1

Alpha Disposition Authority
= JPEG Encode Plan + Canonical Worker

RGB Conversion Authority
= Canonical Worker

JPEG ABI Authority
= preserved encode_mozjpeg_RGB()

WASM Instance Authority
= Canonical MODJPEG Worker Generation

Job Lifetime Authority
= EW02 EncoderWorkerBrokerService

Marker Byte Authority
= Worker-local JPEG Marker Finalizer

Output Admission Authority
= JPEG Structure Verifier v2 + Independent Decoder

Receipt Authority
= ExportAuthorityService
```

# 4. 범위

## 4.1 포함

- JPEG Dedicated Worker Identity
- Canonical Worker Protocol
- EW02 Broker Operation 등록
- Main-thread MODJPEG Module 제거
- Main-thread Shared Memory 제거
- Main-thread RGBA→RGB 제거
- `window.MODJPEG` 제품 전역 제거
- `encode_mozjpeg_RGB()` ABI 보존
- `jpgbuffer_ptr/len/free` Lifecycle 봉인
- JPEG Encode Plan v1
- Integer Quality Percent Contract
- Explicit Alpha Policy
- Worker-local Matte Composite
- 8-bit RGB Input Contract
- 4:4:4 Sampling Truth
- Baseline Sequential Truth
- Single-thread Canonical WASM Artifact
- Pthread Pool 8 Artifact 비승격
- JFIF DPI Marker Finalization
- ICC APP2 Chunk Finalization
- JPEG Structure Verifier v2
- Independent Decoder Metric Evidence
- Worker Output Immutability
- Encoder Registry Worker Binding
- Export Receipt 확장
- Promotion·Rollback Receipt

## 4.2 조건부 포함

다음은 Artifact·Fixture가 존재할 때만 제품 Capability를 열 수 있다.

- Custom ICC Embed
- Non-opaque Alpha Matte Composite
- Quality 1..99 Profiles
- Byte Determinism Class
- Large Image Memory Budget
- Exact Legacy Main-thread Byte Parity

조건부 기능은 증거가 없을 때 숨김 없이 비활성화한다.

## 4.3 제외

- Progressive JPEG
- 4:2:0 JPEG 제품 승격
- 4:2:2 JPEG 제품 승격
- CMYK JPEG
- 12-bit JPEG
- JPEG XL
- Arithmetic Coding
- Guide-based JPEG ABI
- YCbCr Raw ABI 제품 승격
- JPEG Decode Registry 변경
- PSD Plane Split·LCMS Worker 이전
- Browser Canvas `toBlob('image/jpeg')` Fallback
- Dummy `mozjpeg.min.js` 채택

# 5. Worker Identity 승격

Canonical Worker Identity는 다음으로 고정한다.

```text
workerId:
dadum.worker.encoder.modjpeg-canonical-v1

workerEntryId:
dadum.worker.entry.modjpeg-canonical-v1

controlProtocolVersion:
dadum-worker-control-v1

rpcProtocolVersion:
dadum-worker-rpc-v1

codecProtocolVersion:
dadum-modjpeg-canonical-worker-v1

operation:
encode.jpeg-rgb8-444
```

Worker Manifest Descriptor는 최소 다음을 포함한다.

```ts
interface ModJpegWorkerDescriptor {
  workerId: 'dadum.worker.encoder.modjpeg-canonical-v1';
  entryId: 'dadum.worker.entry.modjpeg-canonical-v1';
  codecProtocolVersion: 'dadum-modjpeg-canonical-worker-v1';
  operations: readonly ['encode.jpeg-rgb8-444'];
  moduleKind: 'emscripten-wasm';
  canonicalThreadMode: 'single-thread';
  sharedMemoryRequired: false;
  maxActiveJobs: 1;
  artifactVerification: 'emitted-set-sha256';
}
```

# 6. 제품 경로에서 폐기되는 Main-thread JPEG 권위

다음 활성 경로를 제거한다.

```text
Legacy ExportManager
→ import('./encoders/modjpeg_bind_bootstrap.mjs')
→ ready()
→ encodeRGBA()
```

다음 전역은 제품 Runtime에서 존재하면 안 된다.

```text
window.MODJPEG
window.MODJPEG._unsafeModule
```

다음 동작은 Renderer Main Thread에서 금지한다.

- `new WebAssembly.Memory()` for MODJPEG
- `libmodjpeg_wasm.mjs` import
- `_malloc`·`_free`
- `HEAPU8.set`
- RGBA→RGB Loop
- Matte Composite
- JPEG Marker Rewrite
- `jpgbuffer_*` 호출

Legacy Compatibility File은 Quarantine에 남길 수 있으나 제품 Reachability는 0이어야 한다.

# 7. ABI 보존

Canonical Worker는 다음 ABI를 삭제·개명·대체하지 않는다.

```c
int encode_mozjpeg_RGB(
  const uint8_t* RGB,
  int w,
  int h,
  int quality,
  JpgBuffer* out
);

unsigned char* jpgbuffer_ptr(JpgBuffer* out);
size_t jpgbuffer_len(JpgBuffer* out);
void jpgbuffer_free(JpgBuffer* out);
```

ABI Adapter는 다음 순서를 지킨다.

```text
1. Validate Encode Plan
2. Resolve Alpha Policy
3. Produce owned RGB8 Snapshot
4. Checked Byte Length = width × height × 3
5. Allocate pRGB
6. Copy RGB8 to WASM Heap
7. Allocate zeroed JpgBuffer struct
8. Call encode_mozjpeg_RGB()
9. Read output ptr and len
10. Copy output to Worker-owned Uint8Array
11. jpgbuffer_free(out)
12. free pRGB
13. free pOut
14. Marker Finalization
15. Structure Verification
16. Return immutable bytes + evidence
```

Cleanup은 단일 `finally` 권위에서 수행한다.

# 8. JPEG Encode Plan v1

```ts
interface JpegEncodePlanV1 {
  planId: 'dadum.jpeg-encode-plan-v1';
  width: number;
  height: number;
  inputStorage: 'rgba8';
  inputColorEncodingId: string;
  qualityPercent: number;
  qualitySourceUnit: 'percent-integer' | 'legacy-ratio-adapted';
  chromaSubsampling: '4:4:4';
  scanMode: 'baseline-sequential';
  optimizeCoding: true;
  alphaPolicy: 'reject-nonopaque-v1' | 'composite-over-matte-srgb8-v1';
  matteRgb?: readonly [number, number, number];
  resolution: {
    dpiX: number;
    dpiY: number;
    unit: 'inch';
  };
  iccPolicy: 'canonical-srgb-marker-v1' | 'embed-explicit-icc-v1' | 'none-explicit-v1';
  iccProfile?: Uint8Array;
  outputMarkerPolicyId: 'dadum.jpeg-marker-policy-v1';
  finalRevision: number;
  exportJobId: string;
}
```

Plan은 Worker Call 전에 Freeze하고 Digest를 계산한다.

```text
jpegEncodePlanDigest = SHA-256(canonical JSON without raw pixel bytes)
```

# 9. Input Precision Contract

제품 입력은 RGBA8만 허용한다.

```text
storage = rgba8
channels = 4
componentBits = 8
byteLength = width × height × 4
```

다음 입력은 Fail-Closed한다.

- RGBA16
- Float Surface
- RGB8 without explicit adapter
- Canvas Object
- ImageBitmap Object
- Detached ArrayBuffer
- SharedArrayBuffer supplied by Caller
- Short or Long Byte Length

Width·Height·Byte Length 계산은 Checked Integer로 수행한다.

# 10. Alpha Disposition Contract

JPEG는 Alpha Channel을 저장하지 못한다.

따라서 Alpha를 조용히 버리는 동작을 금지한다.

## 10.1 `reject-nonopaque-v1`

모든 Alpha가 255인지 Worker에서 검사한다.

하나라도 255가 아니면 다음 오류로 실패한다.

```text
E_JPEG_NONOPAQUE_INPUT_REJECTED
```

## 10.2 `composite-over-matte-srgb8-v1`

Caller는 Matte RGB를 명시해야 한다.

```text
matteRgb = [0..255, 0..255, 0..255]
```

Composite 식은 정수 결정론으로 고정한다.

```text
out = round((src × alpha + matte × (255 - alpha)) / 255)
```

각 Channel은 동일 식을 사용한다.

Alpha 0 Pixel은 Matte Color가 된다.

Alpha 255 Pixel은 Source RGB가 된다.

Hidden RGB는 Composite 식 안에서만 사용되며 그대로 JPEG에 누출되지 않는다.

## 10.3 금지

- Alpha Byte 무시
- Canvas 기본 흰 배경 의존
- Matte 미지정 시 흰색 자동 선택
- Premultiplied·Straight 구분 없는 Composite
- Renderer Main-thread Composite

# 11. RGBA8 → RGB8 변환 권위

RGBA→RGB 변환은 Canonical Worker가 단독 소유한다.

Opaque Input은 다음 Mapping을 사용한다.

```text
RGB[3i+0] = RGBA[4i+0]
RGB[3i+1] = RGBA[4i+1]
RGB[3i+2] = RGBA[4i+2]
```

Non-opaque Input은 Alpha Policy가 먼저 적용된 뒤 RGB8 Snapshot을 생성한다.

RGB Snapshot Digest를 Receipt에 기록한다.

```text
workerRgbInputSha256
```

# 12. Quality Semantic Contract

Canonical Unit은 하나다.

```text
qualityPercent = integer 1..100
```

다음은 제품 Exact API에서 거부한다.

- Float Quality
- Ratio Quality
- NaN
- Infinity
- 0
- 101 이상
- String Quality
- Silent Clamp
- Silent Round

Legacy Compatibility Adapter만 다음 변환을 허용한다.

```text
legacy ratio 0 < q <= 1
→ percent = round(q × 100)
```

단, `q=1`의 단위 충돌을 피하기 위해 Legacy Adapter는 입력 필드에 `qualityUnit:'ratio'`가 명시된 경우에만 Ratio로 해석한다.

```text
quality=1, qualityUnit omitted
→ percent 1

quality=1, qualityUnit='ratio'
→ percent 100
```

Receipt에는 다음을 기록한다.

```text
qualityRequested
qualityRequestedUnit
qualityAppliedPercent
qualityAdapted
```

# 13. 4:4:4 Subsampling Truth

제품 Operation은 `4:4:4`만 허용한다.

C Source의 Sampling Factor 설정을 Static Evidence로 사용하되, 최종 제품 승격은 Output SOF Marker에서 독립 확인한다.

```text
Y  sampling = 0x11
Cb sampling = 0x11
Cr sampling = 0x11
```

다음은 실패한다.

- Y 0x22
- Cb·Cr 0x11인 4:2:0
- 4:2:2
- Grayscale 1 Component
- CMYK 4 Component
- Unknown Component IDs

`subsamplingRequested`와 `subsamplingObserved`가 다르면 Receipt를 발급하지 않는다.

# 14. Baseline·Progressive Mode Truth

현재 제품 C Path는 `jpeg_simple_progression()`을 호출하지 않는다.

EW06 제품 Mode는 다음으로 고정한다.

```text
scanMode = baseline-sequential
SOF marker = SOF0 (0xFFC0)
precision = 8
components = 3
```

SOF2 Progressive Output은 실패한다.

Progressive JPEG는 별도 명세와 Fixture 없이 Capability를 열지 않는다.

# 15. Pthread Retirement Truth

현재 Emscripten Glue는 Pthread Pool 8개를 생성한다.

그러나 확인된 `encode_mozjpeg_RGB()` C Path에는 해당 Pool을 사용하는 명시적 병렬 Dispatch가 없다.

따라서 EW06 Canonical Artifact는 다음으로 고정한다.

```text
threadMode = single-thread
pthreadPoolSize = 0
sharedMemoryRequired = false
crossOriginIsolationRequiredForJpeg = false
```

현재 Pthread Artifact는 다음 상태로만 허용한다.

```text
artifactRole = compatibility-reference-only
promotionEligible = false
reason = unproven-child-worker-execution
```

다음 증거 없이 `threadsExecuted > 1`을 기록하면 안 된다.

- JPEG Stage Thread Start Counter
- Thread Work Unit Counter
- Thread Join Counter
- Output Determinism Across Schedules
- Generation Termination Child Count 0

이번 명세는 Pthread를 유지하는 대신 **불필요한 Child Pool을 제거하는 Rebuild**을 요구한다.

# 16. Memory Authority

Canonical Worker는 Renderer가 주입한 256 MiB Shared Memory를 사용하지 않는다.

Memory 정책은 다음과 같다.

```text
memoryKind = non-shared WebAssembly.Memory
initialMemory = artifact-defined and reported
maximumMemory = artifact-defined and reported
maxInputBytes = checked runtime budget
maxOutputBytes = checked runtime budget
```

Memory Budget Receipt:

```ts
interface JpegMemoryEvidence {
  inputRgbaBytes: number;
  workerRgbBytes: number;
  wasmInputBytes: number;
  wasmOutputBytes: number;
  peakObservedBytes?: number;
  memoryShared: false;
  initialMemoryBytes: number;
  maximumMemoryBytes: number;
}
```

2 GiB Maximum을 조용히 허용하지 않는다.

제품 Runtime Budget을 초과하면 Job Admission 단계에서 실패한다.

# 17. Canonical Worker Initialization

Worker Generation당 MODJPEG Module은 정확히 1개다.

상태 머신:

```text
UNINITIALIZED
→ MODULE_LOADING
→ ABI_BINDING
→ SELF_TESTING
→ READY
→ ENCODING
→ READY
→ DISPOSING
→ DISPOSED

오류:
MODULE_LOADING | ABI_BINDING | SELF_TESTING | ENCODING
→ FAILED
```

READY 조건:

- WASM Artifact Fetch 성공
- Single-thread Artifact Identity 일치
- Shared Memory False
- ABI Symbol 4종 존재
- Self-test JPEG 생성 성공
- Structure Verifier가 Self-test Output을 채택
- Pthread Child Count 0

# 18. Worker Data Protocol

```ts
interface ModJpegEncodePayloadV1 {
  plan: JpegEncodePlanV1;
  rgba: Uint8Array;
}

interface ModJpegEncodeResultV1 {
  u8: Uint8Array;
  mime: 'image/jpeg';
  ext: 'jpg';
  codecEvidence: ModJpegCodecEvidenceV1;
}
```

Broker Operation:

```text
encode.jpeg-rgb8-444
```

Worker는 다음 RPC를 직접 소유하지 않는다.

- Job ID 발급
- Queue
- Timeout
- Abort Listener
- Crash Restart
- Pending Map

이 권위는 EW02 Broker에 남는다.

# 19. Marker Finalization Authority

Worker가 ABI Output을 복사한 뒤 같은 Worker 안에서 Marker Finalization을 수행한다.

Finalizer는 Entropy Scan Data를 재인코딩하지 않는다.

## 19.1 JFIF DPI

Canonical 정책은 APP0 JFIF 1개다.

```text
identifier = 'JFIF\0'
units = 1 (dots per inch)
Xdensity = round(dpiX)
Ydensity = round(dpiY)
thumbnail = none
```

기존 APP0 JFIF가 있으면 교체 또는 정확 패치한다.

중복 APP0 JFIF는 금지한다.

## 19.2 ICC APP2

ICC를 Embed할 때 APP2 Segment를 사용한다.

```text
identifier = 'ICC_PROFILE\0'
sequenceNumber = 1..N
segmentCount = N
```

각 Segment Length는 JPEG 16-bit Segment Limit을 지킨다.

Segment Sequence는 연속이어야 한다.

중복 Sequence·누락 Sequence·서로 다른 Segment Count는 실패한다.

## 19.3 Exif

EW06 기본 DPI Authority는 JFIF다.

Exif APP1을 DPI 목적으로 추가하지 않는다.

Source Exif 전체 보존은 이번 범위가 아니다.

## 19.4 Post-worker Mutation Zero

Marker Finalization이 끝난 Byte가 Worker Final Output이다.

Renderer가 Worker 반환 뒤 Marker를 추가·삭제·패치하면 실패한다.

# 20. Color Encoding·ICC Boundary

Final Surface Color Encoding ID를 Encode Plan에 기록한다.

허용 정책:

```text
canonical-srgb-marker-v1
embed-explicit-icc-v1
none-explicit-v1
```

## 20.1 Canonical sRGB

Final Surface가 Canonical sRGB이면 Runtime이 승인한 Canonical sRGB ICC를 Embed할 수 있다.

ICC Artifact SHA-256을 Receipt에 기록한다.

## 20.2 Explicit ICC

Explicit ICC Byte가 제공되면 다음을 검증한다.

- Byte Length > 0
- ICC Header Length 일치
- Declared Profile Size 일치
- Profile Class 허용
- Color Space = RGB
- PCS 허용
- SHA-256 계산

## 20.3 금지

- CMYK ICC를 RGB JPEG에 Embed
- ICC 요청 후 Silent Drop
- Worker 밖에서 ICC Chunk Injection
- ICC Marker는 있는데 Receipt Digest 없음

# 21. JPEG Structure Verifier v2

Verifier는 Marker Graph 전체를 파싱한다.

필수 검증:

- SOI 정확히 1개
- SOI가 Offset 0
- EOI 정확히 1개
- EOI 이후 Byte 0
- Marker Segment Length 경계
- APP0 JFIF Cardinality
- APP2 ICC Sequence Cardinality
- DQT 존재
- SOF0 정확히 1개
- SOF2 없음
- Precision 8
- Width·Height 일치
- Component Count 3
- Sampling Factor 1x1 / 1x1 / 1x1
- DHT 존재
- SOS 존재
- Entropy Scan Boundary
- Restart Marker 문법
- Unsupported Arithmetic Marker 없음
- Adobe APP14 CMYK Transform 없음

Verifier Evidence:

```ts
interface JpegStructureEvidenceV2 {
  verifierId: 'dadum.jpeg-structure-v2';
  width: number;
  height: number;
  precision: 8;
  componentCount: 3;
  sampling: readonly ['1x1', '1x1', '1x1'];
  subsampling: '4:4:4';
  scanMode: 'baseline-sequential';
  jfifCount: number;
  iccSegmentCount: number;
  iccDigest?: string;
  dqtDigest: string;
  dhtDigest: string;
  sosCount: number;
  eoiExact: true;
}
```

# 22. Independent Decoder와 Lossy Metric Evidence

JPEG는 Lossy이므로 Source Pixel과 Exact Equality를 요구하지 않는다.

독립 Decoder는 다음을 검증한다.

- Decode 성공
- Width·Height 일치
- RGB8 Output
- Orientation Mutation 없음
- Marker ICC 적용 정책 기록
- Matte Composite 정책과 Decode Background 의미 일치

Metric은 최소 다음을 계산한다.

```text
RGB MAE
RGB Max Error
Linear-light MSE
PSNR
OKLab Mean ΔE
OKLab P95 ΔE
OKLab Max ΔE
```

고정 Threshold는 Quality Profile별 Promotion Corpus에서 정의한다.

Source Bake에서 임의 Threshold를 발명하지 않는다.

Promotion Receipt는 Threshold ID와 Baseline Artifact Digest를 요구한다.

```text
metricPolicyId
goldenCorpusDigest
qualityCalibrationDigest
```

# 23. Legacy Main-thread Byte Parity

Migration 단계에서는 Opaque RGBA8 Fixture에 대해 기존 Main-thread Path와 새 Worker Path를 비교한다.

같은 Artifact·같은 Quality·같은 RGB Input이면 ABI Raw Output은 Byte-for-byte 동일해야 한다.

Marker Finalization 전 비교:

```text
legacyRawJpegSha256 == workerRawJpegSha256
```

Marker Finalization 후에는 새 Canonical Marker 정책 때문에 Byte가 달라질 수 있다.

이 경우 Structure·Decoded Pixel Parity로 분리 검증한다.

# 24. Output Immutability

Worker Result에는 두 Digest를 기록한다.

```text
rawAbiOutputSha256
workerFinalOutputSha256
```

Runtime Export Authority는 최종 Blob SHA-256을 다시 계산한다.

```text
workerFinalOutputSha256 == exportOutputSha256
```

불일치 시:

```text
E_JPEG_OUTPUT_MUTATED_AFTER_WORKER
```

# 25. Encoder Registry 변경

`dadum.encoder.jpg.v1` Template을 다음처럼 승격한다.

```ts
{
  id: 'dadum.encoder.jpg.v1',
  canonicalFormat: 'jpg',
  legacyKey: 'jpg',
  mime: 'image/jpeg',
  extension: 'jpg',
  supportsAlpha: false,
  supportsBitDepths: [8],
  verifierId: 'dadum.jpeg-structure-v2',
  workerBinding: {
    workerId: 'dadum.worker.encoder.modjpeg-canonical-v1',
    required: true,
    codecProtocolVersion: 'dadum-modjpeg-canonical-worker-v1'
  }
}
```

`jpeg`는 입력 Alias일 뿐 별도 Encoder Record를 생성하지 않는다.

# 26. Export Receipt 확장

```ts
interface JpegExportReceiptEvidenceV1 {
  jpegPromotionId: 'tdt-export-worker-06-modjpeg-v1';
  jpegWorkerId: 'dadum.worker.encoder.modjpeg-canonical-v1';
  jpegCodecProtocolVersion: 'dadum-modjpeg-canonical-worker-v1';
  jpegEncodePlanDigest: string;
  jpegAbiSymbol: 'encode_mozjpeg_RGB';
  jpegAbiOutputSha256: string;
  jpegWorkerFinalOutputSha256: string;
  jpegQualityRequested: number;
  jpegQualityRequestedUnit: string;
  jpegQualityAppliedPercent: number;
  jpegQualityAdapted: boolean;
  jpegAlphaPolicy: string;
  jpegAlphaNonOpaquePixelCount: number;
  jpegMatteRgb?: readonly [number, number, number];
  jpegRgbInputSha256: string;
  jpegPrecision: 8;
  jpegComponentCount: 3;
  jpegSubsampling: '4:4:4';
  jpegScanMode: 'baseline-sequential';
  jpegJfifCount: 1;
  jpegDpiX: number;
  jpegDpiY: number;
  jpegIccSegmentCount: number;
  jpegIccDigest?: string;
  jpegStructureVerifierId: 'dadum.jpeg-structure-v2';
  jpegIndependentDecodeVerified: boolean;
  jpegMetricPolicyId?: string;
  jpegMetricReportDigest?: string;
  jpegThreadMode: 'single-thread';
  jpegPthreadPoolSize: 0;
  jpegSharedMemory: false;
  jpegMainThreadEncoderUsed: false;
  jpegPostWorkerMutation: false;
}
```

# 27. Capability Gate

JPEG Capability는 다음 조건이 모두 참일 때만 발급한다.

```text
canonicalWorkerRegistered
brokerOperationRegistered
singleThreadArtifactVerified
sharedMemoryFalse
abiSymbolsVerified
selfTestPass
structureVerifierPass
mainThreadReachabilityZero
windowGlobalZero
alphaPolicyEnforced
qualityContractEnforced
444Observed
baselineObserved
markerFinalizerWorkerOwned
outputMutationZero
```

하나라도 거짓이면 `dadum.encoder.jpg.v1`은 `UNAVAILABLE`이다.

# 28. 상태 머신

```text
UNREGISTERED
→ REGISTERED
→ ARTIFACT_VERIFYING
→ WORKER_REALIZING
→ ABI_BINDING
→ SELF_TESTING
→ AVAILABLE

AVAILABLE
→ JOB_ADMITTED
→ ALPHA_RESOLVING
→ RGB_SNAPSHOT_READY
→ WASM_ENCODING
→ MARKER_FINALIZING
→ STRUCTURE_VERIFYING
→ RESULT_READY
→ RECEIPT_SEALED
→ AVAILABLE

오류:
ARTIFACT_VERIFYING | WORKER_REALIZING | ABI_BINDING | SELF_TESTING
→ UNAVAILABLE

JOB 단계 오류:
ALPHA_RESOLVING | WASM_ENCODING | MARKER_FINALIZING | STRUCTURE_VERIFYING
→ JOB_FAILED
→ EW02 Settlement
→ AVAILABLE 또는 CIRCUIT_OPEN
```

# 29. Stable Error Registry

## `E_JPEG_WORKER_UNAVAILABLE`

Canonical MODJPEG Worker가 준비되지 않음.

## `E_JPEG_PROTOCOL_MISMATCH`

Worker Codec Protocol 불일치.

## `E_JPEG_OPERATION_UNSUPPORTED`

허용되지 않은 JPEG Operation.

## `E_JPEG_INPUT_NOT_RGBA8`

입력이 RGBA8이 아님.

## `E_JPEG_DIMENSION_INVALID`

Width·Height가 유효하지 않음.

## `E_JPEG_INPUT_LENGTH_MISMATCH`

RGBA Byte Length 불일치.

## `E_JPEG_ALPHA_POLICY_REQUIRED`

Alpha 처리 정책 누락.

## `E_JPEG_NONOPAQUE_INPUT_REJECTED`

Opaque-only 정책에서 Non-opaque 입력 발견.

## `E_JPEG_MATTE_INVALID`

Matte RGB가 유효하지 않음.

## `E_JPEG_ALPHA_MODE_UNSUPPORTED`

지원하지 않는 Alpha Mode.

## `E_JPEG_QUALITY_INVALID`

Quality Percent가 정수 1..100이 아님.

## `E_JPEG_QUALITY_UNIT_AMBIGUOUS`

Quality Unit이 모호함.

## `E_JPEG_SUBSAMPLING_UNSUPPORTED`

4:4:4 이외 Subsampling 요청.

## `E_JPEG_PROGRESSIVE_UNSUPPORTED`

Progressive JPEG 요청.

## `E_JPEG_ABI_UNAVAILABLE`

encode_mozjpeg_RGB ABI Symbol 없음.

## `E_JPEG_WASM_NOT_READY`

MODJPEG WASM Runtime 미준비.

## `E_JPEG_WASM_SHARED_MEMORY_FORBIDDEN`

Canonical Artifact가 Shared Memory를 사용함.

## `E_JPEG_PTHREAD_ARTIFACT_NOT_PROMOTED`

Pthread Pool Artifact는 Final Promotion 불가.

## `E_JPEG_THREAD_POLICY_MISMATCH`

실행 Thread 정책과 Receipt 불일치.

## `E_JPEG_MEMORY_BUDGET_EXCEEDED`

JPEG Memory Budget 초과.

## `E_JPEG_ALLOCATION_FAILED`

WASM Allocation 실패.

## `E_JPEG_ENCODE_FAILED`

MODJPEG ABI가 실패 반환.

## `E_JPEG_OUTPUT_EMPTY`

JPEG Output Pointer 또는 Length가 비어 있음.

## `E_JPEG_BUFFER_LIFECYCLE_VIOLATION`

JpgBuffer Cleanup 계약 위반.

## `E_JPEG_MARKER_FINALIZATION_FAILED`

JPEG Marker Finalization 실패.

## `E_JPEG_STRUCTURE_INVALID`

JPEG Marker Graph가 유효하지 않음.

## `E_JPEG_DIMENSION_MISMATCH`

SOF Dimension 불일치.

## `E_JPEG_PRECISION_MISMATCH`

JPEG Precision이 8-bit가 아님.

## `E_JPEG_COMPONENT_MISMATCH`

JPEG Component Count가 3이 아님.

## `E_JPEG_SAMPLING_MISMATCH`

Observed Sampling이 4:4:4가 아님.

## `E_JPEG_SCAN_MODE_MISMATCH`

Baseline Sequential이 아님.

## `E_JPEG_MARKER_DUPLICATE`

Canonical Marker Cardinality 위반.

## `E_JPEG_DPI_MISMATCH`

JFIF DPI가 Encode Plan과 불일치.

## `E_JPEG_ICC_INVALID`

ICC Profile 또는 APP2 Sequence가 유효하지 않음.

## `E_JPEG_OUTPUT_MUTATED_AFTER_WORKER`

Worker Final Output과 Export Output SHA 불일치.

## `E_JPEG_MAIN_THREAD_ENCODER_FORBIDDEN`

Renderer Main-thread JPEG Encode Reachability 발견.

## `E_JPEG_INDEPENDENT_DECODE_FAILED`

독립 JPEG Decoder 검증 실패.

## `E_JPEG_METRIC_GATE_FAILED`

승격 Metric Policy 미달.

# 30. 파일별 구현 계획

## 30.1 신규

```text
app/src/runtime/workers/entries/modjpeg-canonical.worker.ts
app/src/runtime/codecs/jpeg-encode-plan.ts
app/src/runtime/codecs/jpeg-structure-verifier.ts
app/src/runtime/codecs/jpeg-marker-finalizer.ts
app/src/runtime/codecs/jpeg-alpha-policy.ts
app/src/runtime/codecs/jpeg-metric-evaluator.ts
app/src/runtime/codecs/jpeg-promotion-types.ts
app/legacy-runtime/encoders/modjpeg_worker_adapter.mjs
app/legacy-runtime/wasm/libmodjpeg_wasm_singlethread.wasm
app/legacy-runtime/encoders/libmodjpeg_wasm_singlethread.mjs
scripts/verify_tdt_export_worker_06.mjs
scripts/smoke_tdt_export_worker_06.mjs
```

## 30.2 수정

```text
app/legacy-runtime/export_manager.js
app/src/runtime/workers/encoder-worker-types.ts
app/src/runtime/workers/encoder-worker-broker-service.ts
app/src/runtime/workers/worker-registry-service.ts
app/src/runtime/workers/generated-worker-manifest.ts
app/src/runtime/workers/generated-worker-manifest.json
app/src/runtime/codecs/encoder-registry-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/errors/stable-errors.ts
app/src/runtime/manifests/runtime-manifest.ts
package.json
```

## 30.3 Retire·Quarantine

```text
app/legacy-runtime/encoders/modjpeg_bind_bootstrap.mjs
app/legacy-runtime/mozjpeg-export.js
app/legacy-runtime/mozjpeg-export_CLEANED.js
app/legacy-runtime/libs/mozjpeg.min.js
```

파일을 삭제하지 않아도 되지만 제품 Import Graph Reachability는 0이어야 한다.

# 31. Migration Strategy

## 31.1 단계 1

Canonical Worker Entry·Manifest·Broker Operation을 추가한다.

## 31.2 단계 2

Single-thread MODJPEG Artifact를 빌드하고 Artifact Set SHA를 봉인한다.

## 31.3 단계 3

Worker Adapter에서 ABI·Alpha·RGB Conversion·Marker Finalizer를 결선한다.

## 31.4 단계 4

Legacy ExportManager의 `jpg` Handler를 `DadumRuntimeWorkerBridge.call()`로 전환한다.

## 31.5 단계 5

Runtime Encoder Registry에 Worker Binding과 Structure Verifier v2를 적용한다.

## 31.6 단계 6

Opaque Fixture에서 Legacy Main-thread Raw ABI Output과 Worker Raw ABI Output Byte Parity를 확인한다.

## 31.7 단계 7

Independent Decode·Metric·ICC·DPI·Alpha Policy Fixture를 실행한다.

## 31.8 단계 8

Main-thread Import와 `window.MODJPEG`를 제품 Graph에서 제거한다.

## 31.9 단계 9

Pthread Artifact를 Compatibility Quarantine으로 강등한다.

## 31.10 단계 10

Vite Production Build·Electron E2E·Emitted Artifact SHA가 모두 통과하면 Promotion Receipt를 발급한다.

# 32. Worker Artifact Set

Canonical Artifact Set은 최소 다음을 포함한다.

```text
modjpeg-canonical.worker.[hash].js
libmodjpeg_wasm_singlethread.[hash].mjs
libmodjpeg_wasm_singlethread.[hash].wasm
```

Artifact Set Digest:

```text
SHA-256(
  canonical list of
  relative path + byte length + file sha256
)
```

Manifest는 다음을 증명한다.

```text
threadMode = single-thread
sharedMemory = false
pthreadPoolSize = 0
abiSymbols = encode_mozjpeg_RGB,jpgbuffer_ptr,jpgbuffer_len,jpgbuffer_free
```

# 33. 정적 Gate

## GATE-EW06-01 Canonical Worker Identity

**PASS 조건:** Worker ID가 `dadum.worker.encoder.modjpeg-canonical-v1`이다.

## GATE-EW06-02 Canonical Protocol

**PASS 조건:** Codec Protocol이 `dadum-modjpeg-canonical-worker-v1`이다.

## GATE-EW06-03 Canonical Operation

**PASS 조건:** 허용 Operation이 `encode.jpeg-rgb8-444` 하나다.

## GATE-EW06-04 Runtime Worker Binding

**PASS 조건:** `dadum.encoder.jpg.v1`에 Required Worker Binding이 있다.

## GATE-EW06-05 JPEG Alias Ownership

**PASS 조건:** `jpeg`는 Alias이며 별도 Encoder Identity가 없다.

## GATE-EW06-06 Main-thread Bootstrap Reachability Zero

**PASS 조건:** 제품 Graph에서 `modjpeg_bind_bootstrap.mjs` Import가 0이다.

## GATE-EW06-07 Global MODJPEG Zero

**PASS 조건:** 제품 Runtime에 `window.MODJPEG` 설치가 없다.

## GATE-EW06-08 Main-thread WASM Import Zero

**PASS 조건:** Renderer에서 MODJPEG Emscripten Module Import가 없다.

## GATE-EW06-09 Main-thread Memory Zero

**PASS 조건:** Renderer에서 MODJPEG용 `WebAssembly.Memory` 생성이 없다.

## GATE-EW06-10 Main-thread RGBA→RGB Zero

**PASS 조건:** Renderer에서 JPEG RGB Conversion Loop가 없다.

## GATE-EW06-11 Broker Job Ownership

**PASS 조건:** JPEG Job은 EW02 Broker Call만 사용한다.

## GATE-EW06-12 Local Pending Zero

**PASS 조건:** JPEG 전용 Local Pending Map이 없다.

## GATE-EW06-13 ABI Symbol Preservation

**PASS 조건:** `encode_mozjpeg_RGB`와 `jpgbuffer_*` Symbol이 유지된다.

## GATE-EW06-14 ABI Replacement Zero

**PASS 조건:** 대체 ABI로 조용히 이관하지 않는다.

## GATE-EW06-15 RGBA8 Only

**PASS 조건:** 제품 Input Storage가 RGBA8 하나다.

## GATE-EW06-16 Checked Length

**PASS 조건:** Width×Height×4와 ×3 계산이 Checked다.

## GATE-EW06-17 Explicit Alpha Policy

**PASS 조건:** Alpha Policy가 Plan에 필수다.

## GATE-EW06-18 Silent Alpha Drop Zero

**PASS 조건:** RGBA에서 Alpha를 무시하는 제품 코드가 없다.

## GATE-EW06-19 Matte Explicit

**PASS 조건:** Composite Policy는 Matte RGB를 요구한다.

## GATE-EW06-20 Quality Integer Contract

**PASS 조건:** Quality는 정수 Percent 1..100이다.

## GATE-EW06-21 Quality Silent Clamp Zero

**PASS 조건:** 제품 Exact Path에 Clamp·Round가 없다.

## GATE-EW06-22 444 Requested

**PASS 조건:** Encode Plan Subsampling은 4:4:4다.

## GATE-EW06-23 444 Observed

**PASS 조건:** Structure Verifier가 3개 Component의 1x1 Sampling을 확인한다.

## GATE-EW06-24 Baseline Only

**PASS 조건:** SOF0만 허용하고 SOF2를 거부한다.

## GATE-EW06-25 Single-thread Artifact

**PASS 조건:** Canonical Artifact가 Pthread를 포함하지 않는다.

## GATE-EW06-26 Shared Memory Zero

**PASS 조건:** Canonical JPEG WASM은 Shared Memory를 요구하지 않는다.

## GATE-EW06-27 Pthread Compatibility Quarantine

**PASS 조건:** Pool 8 Artifact는 Promotion Candidate가 아니다.

## GATE-EW06-28 Module Singleton

**PASS 조건:** Worker Generation당 Module 1개다.

## GATE-EW06-29 Input Snapshot Ownership

**PASS 조건:** EW02 Broker Snapshot이 입력을 소유한다.

## GATE-EW06-30 Allocation Cleanup

**PASS 조건:** pRGB·pOut·JpgBuffer가 정확히 정리된다.

## GATE-EW06-31 Marker Worker Authority

**PASS 조건:** JFIF·ICC Marker는 Worker에서만 작성된다.

## GATE-EW06-32 JFIF Cardinality

**PASS 조건:** APP0 JFIF가 정확히 1개다.

## GATE-EW06-33 ICC Sequence Truth

**PASS 조건:** APP2 ICC Sequence가 완전하고 순차적이다.

## GATE-EW06-34 Post-worker Mutation Zero

**PASS 조건:** Worker 반환 뒤 JPEG Byte 수정이 없다.

## GATE-EW06-35 Structure Verifier v2

**PASS 조건:** SOI Prefix 검증이 아닌 Marker Graph Verifier를 사용한다.

## GATE-EW06-36 EOI Exact

**PASS 조건:** EOI 뒤 잔여 Byte가 없다.

## GATE-EW06-37 Independent Decoder

**PASS 조건:** Promotion에 독립 JPEG Decoder Evidence가 있다.

## GATE-EW06-38 Metric Policy

**PASS 조건:** Lossy Metric Threshold는 Corpus·Policy Digest에 결속된다.

## GATE-EW06-39 Output Immutability

**PASS 조건:** Worker SHA와 Export SHA가 일치한다.

## GATE-EW06-40 Receipt Completeness

**PASS 조건:** EW06 Receipt 필수 필드가 모두 있다.

## GATE-EW06-41 Stable Errors

**PASS 조건:** EW06 Stable Error Code가 Registry에 등록된다.

## GATE-EW06-42 Source Graph Determinism

**PASS 조건:** Manifest·Build ID 재생성이 결정론적이다.

## GATE-EW06-43 Parent Seal Regression

**PASS 조건:** R7·EW01~EW05 Gate가 유지된다.

## GATE-EW06-44 Production Artifact Verification

**PASS 조건:** Vite Emitted Worker·WASM Artifact SHA가 검증된다.

# 34. Runtime Test Matrix

## RT-EW06-01 Opaque 1x1 Black

**입력:** RGBA=[0,0,0,255], quality 100, reject policy.

**기대:** SOF 1x1, 444, baseline, decode black.

## RT-EW06-02 Opaque 1x1 White

**입력:** RGBA=[255,255,255,255].

**기대:** Decode white within quality metric.

## RT-EW06-03 Opaque Primary Red

**입력:** Red fixture.

**기대:** RGB channel order correct.

## RT-EW06-04 Opaque Primary Green

**입력:** Green fixture.

**기대:** RGB channel order correct.

## RT-EW06-05 Opaque Primary Blue

**입력:** Blue fixture.

**기대:** RGB channel order correct.

## RT-EW06-06 Color Ramp

**입력:** Horizontal RGB ramp.

**기대:** Dimension and metric policy pass.

## RT-EW06-07 Checkerboard

**입력:** High-frequency checkerboard.

**기대:** 444 observed and metric recorded.

## RT-EW06-08 Odd Dimensions

**입력:** 17x19 image.

**기대:** Encode and SOF dimensions exact.

## RT-EW06-09 Large Dimensions

**입력:** Promotion budget near limit.

**기대:** No overflow, budget evidence present.

## RT-EW06-10 Zero Width

**입력:** width=0.

**기대:** E_JPEG_DIMENSION_INVALID.

## RT-EW06-11 Zero Height

**입력:** height=0.

**기대:** E_JPEG_DIMENSION_INVALID.

## RT-EW06-12 Short RGBA

**입력:** byteLength expected-1.

**기대:** E_JPEG_INPUT_LENGTH_MISMATCH.

## RT-EW06-13 Long RGBA

**입력:** byteLength expected+1.

**기대:** E_JPEG_INPUT_LENGTH_MISMATCH.

## RT-EW06-14 Detached Buffer

**입력:** Detached ArrayBuffer.

**기대:** Admission reject.

## RT-EW06-15 Non-opaque Reject

**입력:** alpha 254 under reject policy.

**기대:** E_JPEG_NONOPAQUE_INPUT_REJECTED.

## RT-EW06-16 Alpha Zero Reject

**입력:** alpha 0 under reject policy.

**기대:** E_JPEG_NONOPAQUE_INPUT_REJECTED.

## RT-EW06-17 Matte White

**입력:** alpha gradient + white matte.

**기대:** Worker composite digest and decode pass.

## RT-EW06-18 Matte Black

**입력:** alpha gradient + black matte.

**기대:** Worker composite digest and decode pass.

## RT-EW06-19 Matte Color

**입력:** alpha gradient + [12,34,56].

**기대:** Exact RGB snapshot fixture.

## RT-EW06-20 Missing Matte

**입력:** composite policy without matte.

**기대:** E_JPEG_MATTE_INVALID.

## RT-EW06-21 Invalid Matte Negative

**입력:** matte channel -1.

**기대:** E_JPEG_MATTE_INVALID.

## RT-EW06-22 Invalid Matte Overflow

**입력:** matte channel 256.

**기대:** E_JPEG_MATTE_INVALID.

## RT-EW06-23 Quality 1

**입력:** integer percent 1.

**기대:** ABI receives 1.

## RT-EW06-24 Quality 50

**입력:** integer percent 50.

**기대:** ABI receives 50.

## RT-EW06-25 Quality 92

**입력:** integer percent 92.

**기대:** ABI receives 92.

## RT-EW06-26 Quality 100

**입력:** integer percent 100.

**기대:** ABI receives 100.

## RT-EW06-27 Quality 0

**입력:** invalid.

**기대:** E_JPEG_QUALITY_INVALID.

## RT-EW06-28 Quality 101

**입력:** invalid.

**기대:** E_JPEG_QUALITY_INVALID.

## RT-EW06-29 Quality Float

**입력:** 92.5.

**기대:** E_JPEG_QUALITY_INVALID.

## RT-EW06-30 Legacy Ratio Explicit

**입력:** 0.95 + unit ratio.

**기대:** Adapter applies 95 and records adaptation.

## RT-EW06-31 Legacy Ratio Ambiguous

**입력:** 0.95 without unit.

**기대:** E_JPEG_QUALITY_UNIT_AMBIGUOUS.

## RT-EW06-32 Quality One Percent

**입력:** 1 without unit.

**기대:** Applied percent 1.

## RT-EW06-33 Quality One Ratio

**입력:** 1 with ratio unit.

**기대:** Applied percent 100.

## RT-EW06-34 Requested 420

**입력:** subsampling 4:2:0.

**기대:** E_JPEG_SUBSAMPLING_UNSUPPORTED.

## RT-EW06-35 Requested Progressive

**입력:** progressive true.

**기대:** E_JPEG_PROGRESSIVE_UNSUPPORTED.

## RT-EW06-36 SOF0 Baseline

**입력:** normal output.

**기대:** SOF0 exactly one.

## RT-EW06-37 SOF2 Injection

**입력:** mutated output SOF2.

**기대:** E_JPEG_SCAN_MODE_MISMATCH.

## RT-EW06-38 Sampling Y22

**입력:** mutated Y sampling 2x2.

**기대:** E_JPEG_SAMPLING_MISMATCH.

## RT-EW06-39 Component Count 1

**입력:** grayscale mutation.

**기대:** E_JPEG_COMPONENT_MISMATCH.

## RT-EW06-40 Precision 12

**입력:** SOF precision mutation.

**기대:** E_JPEG_PRECISION_MISMATCH.

## RT-EW06-41 Truncated APP0

**입력:** broken segment length.

**기대:** E_JPEG_STRUCTURE_INVALID.

## RT-EW06-42 Truncated DQT

**입력:** broken segment.

**기대:** E_JPEG_STRUCTURE_INVALID.

## RT-EW06-43 Missing DQT

**입력:** remove DQT.

**기대:** E_JPEG_STRUCTURE_INVALID.

## RT-EW06-44 Missing DHT

**입력:** remove DHT.

**기대:** E_JPEG_STRUCTURE_INVALID.

## RT-EW06-45 Missing SOS

**입력:** remove SOS.

**기대:** E_JPEG_STRUCTURE_INVALID.

## RT-EW06-46 Missing EOI

**입력:** truncate EOI.

**기대:** E_JPEG_STRUCTURE_INVALID.

## RT-EW06-47 Trailing Bytes

**입력:** append byte after EOI.

**기대:** E_JPEG_STRUCTURE_INVALID.

## RT-EW06-48 Duplicate JFIF

**입력:** two APP0 JFIF.

**기대:** E_JPEG_MARKER_DUPLICATE.

## RT-EW06-49 DPI 72

**입력:** dpi 72x72.

**기대:** JFIF unit/density exact.

## RT-EW06-50 DPI 300

**입력:** dpi 300x300.

**기대:** JFIF unit/density exact.

## RT-EW06-51 Asymmetric DPI

**입력:** dpi 300x150.

**기대:** JFIF X/Y exact.

## RT-EW06-52 DPI Overflow

**입력:** density > 65535.

**기대:** Plan reject or explicit bounded error.

## RT-EW06-53 Canonical sRGB ICC

**입력:** approved profile.

**기대:** APP2 sequence complete and digest match.

## RT-EW06-54 Large ICC Multi-segment

**입력:** profile requires N>1.

**기대:** Sequence 1..N complete.

## RT-EW06-55 ICC Missing Segment

**입력:** drop middle segment.

**기대:** E_JPEG_ICC_INVALID.

## RT-EW06-56 ICC Duplicate Segment

**입력:** duplicate sequence.

**기대:** E_JPEG_ICC_INVALID.

## RT-EW06-57 CMYK ICC

**입력:** RGB JPEG + CMYK profile.

**기대:** E_JPEG_ICC_INVALID.

## RT-EW06-58 No ICC Explicit

**입력:** none-explicit policy.

**기대:** APP2 ICC count 0 and receipt explicit.

## RT-EW06-59 ABI Missing

**입력:** remove symbol.

**기대:** E_JPEG_ABI_UNAVAILABLE.

## RT-EW06-60 Encode Return Zero

**입력:** mock ABI returns 0.

**기대:** E_JPEG_ENCODE_FAILED.

## RT-EW06-61 Output Pointer Zero

**입력:** mock ptr=0.

**기대:** E_JPEG_OUTPUT_EMPTY.

## RT-EW06-62 Output Length Zero

**입력:** mock len=0.

**기대:** E_JPEG_OUTPUT_EMPTY.

## RT-EW06-63 Allocation Failure

**입력:** mock malloc failure.

**기대:** E_JPEG_ALLOCATION_FAILED.

## RT-EW06-64 Cleanup Success

**입력:** normal job.

**기대:** all allocations and JpgBuffer freed once.

## RT-EW06-65 Cleanup Encode Failure

**입력:** ABI failure.

**기대:** all owned memory freed.

## RT-EW06-66 Worker Timeout

**입력:** hang ABI.

**기대:** EW02 execution timeout and pending 0.

## RT-EW06-67 Queued Abort

**입력:** abort queued JPEG.

**기대:** settled once and worker unaffected.

## RT-EW06-68 Active Abort

**입력:** abort active JPEG.

**기대:** cancel then hard terminate if needed.

## RT-EW06-69 Worker Crash

**입력:** crash during encode.

**기대:** active fails, generation restarts, queue resumes.

## RT-EW06-70 Circuit Open

**입력:** restart budget exceeded.

**기대:** new job rejected.

## RT-EW06-71 Late Result

**입력:** result after timeout.

**기대:** discarded, no receipt.

## RT-EW06-72 Output Mutation

**입력:** modify byte after worker.

**기대:** E_JPEG_OUTPUT_MUTATED_AFTER_WORKER.

## RT-EW06-73 Main-thread Reachability

**입력:** reintroduce bootstrap import.

**기대:** static gate fails.

## RT-EW06-74 Pthread Artifact

**입력:** manifest says pool 8.

**기대:** Promotion capability denied.

## RT-EW06-75 Shared Memory Artifact

**입력:** shared memory true.

**기대:** E_JPEG_WASM_SHARED_MEMORY_FORBIDDEN.

## RT-EW06-76 Single-thread Self-test

**입력:** canonical artifact.

**기대:** child worker count 0.

## RT-EW06-77 Legacy Raw Byte Parity Q100

**입력:** opaque corpus quality100.

**기대:** legacy raw SHA == worker raw SHA.

## RT-EW06-78 Legacy Raw Byte Parity Q92

**입력:** opaque corpus quality92.

**기대:** legacy raw SHA == worker raw SHA.

## RT-EW06-79 Independent Decode

**입력:** canonical output.

**기대:** decode dimensions and metric evidence pass.

## RT-EW06-80 Metric Gate Failure

**입력:** mutated low-quality output.

**기대:** E_JPEG_METRIC_GATE_FAILED.

## RT-EW06-81 Receipt Determinism

**입력:** same input and plan.

**기대:** receipt digest deterministic.

## RT-EW06-82 Parent Regression

**입력:** run R7/EW01-EW05.

**기대:** all parent gates pass.

# 35. Promotion Corpus

최소 Corpus는 다음을 포함한다.

```text
1x1 opaque colors
alpha edge matrix
hidden RGB matrix
RGB gradients
high-frequency checkerboards
photographic skin tone
saturated synthetic colors
neutral grayscale ramps
odd dimensions
large dimensions
quality 1, 25, 50, 75, 92, 100
DPI 72, 96, 150, 300, asymmetric
ICC none, canonical sRGB, multi-segment RGB profile
```

Corpus 파일과 기대값 목록은 SHA-256 Manifest로 봉인한다.

# 36. Promotion Receipt

```ts
interface TdtExportWorker06PromotionReceipt {
  specId: 'TDT-EXPORT-WORKER-06';
  status: 'PROMOTED' | 'SOURCE_BAKED_UNPROMOTED' | 'ROLLED_BACK';
  buildId: string;
  parentBuildId: string;
  workerId: 'dadum.worker.encoder.modjpeg-canonical-v1';
  workerArtifactSetDigest: string;
  wasmArtifactSha256: string;
  wasmThreadMode: 'single-thread';
  wasmSharedMemory: false;
  wasmPthreadPoolSize: 0;
  abiSymbolsVerified: boolean;
  mainThreadReachabilityZero: boolean;
  globalModJpegZero: boolean;
  alphaPolicyFixturesPass: boolean;
  qualityFixturesPass: boolean;
  sampling444FixturesPass: boolean;
  baselineFixturesPass: boolean;
  markerFixturesPass: boolean;
  iccFixturesPass: boolean;
  independentDecodePass: boolean;
  metricPolicyId: string | null;
  metricReportDigest: string | null;
  legacyRawParityPass: boolean;
  workerE2ePass: boolean;
  electronE2ePass: boolean;
  emittedArtifactVerification: boolean;
  parentSealRegressionPass: boolean;
  promotionEligible: boolean;
  blockers: readonly string[];
}
```

# 37. Source Bake와 Final Promotion 분리

Source Bake는 다음을 증명할 수 있다.

- Worker Entry·Manifest·Broker 결선
- Main-thread 제품 Import 제거
- Alpha·Quality·Structure Verifier Source Contract
- Static Gate
- Mock Worker Runtime Smoke
- Marker Parser Fixture
- Receipt Schema

Source Bake만으로 다음을 주장하면 안 된다.

- 새 Single-thread MODJPEG WASM 실제 빌드
- 실제 WASM Encode 성공
- Legacy Raw Byte Parity
- Independent Decoder Metric Pass
- ICC Multi-segment 실제 Embed
- Vite Emitted Artifact SHA
- Electron E2E

따라서 위 증거가 없으면 상태는 다음이다.

```text
SOURCE_BAKED_UNPROMOTED
```

# 38. Rollback

Rollback Trigger:

- Main-thread JPEG Encode Reachability 재발견
- Alpha Silent Drop
- Quality Unit Ambiguity
- 4:4:4 불일치
- Progressive Output
- JFIF·ICC Marker 파손
- Pthread Pool Artifact의 잘못된 Promotion
- Worker Output Mutation
- Independent Decode 실패
- Metric Regression
- Parent Seal Regression

Rollback은 다음을 수행한다.

```text
1. dadum.encoder.jpg.v1 Capability 비활성화
2. EW06 Promotion Receipt를 ROLLED_BACK으로 전환
3. 실패 Artifact Digest 봉인
4. Legacy Main-thread Path를 자동 재활성화하지 않음
5. 사용자는 PNG/JXL/WebP 등 증명된 포맷만 선택 가능
```

JPEG Failure 시 Canvas JPEG Fallback은 허용하지 않는다.

# 39. 완료 조건

EW06 Final Promotion은 다음이 모두 참일 때만 가능하다.

```text
Worker 404 = 0
Main-thread MODJPEG Import = 0
window.MODJPEG = absent
Main-thread RGBA→RGB = 0
Canonical WASM Pthread Pool = 0
Canonical WASM Shared Memory = false
ABI Symbols = verified
Alpha Silent Drop = 0
Quality Ambiguity = 0
Observed Subsampling = 4:4:4
Observed Scan Mode = baseline sequential
JFIF Cardinality = 1
ICC Sequence Errors = 0
Output Mutation = 0
Independent Decode = PASS
Metric Policy = PASS
Legacy Raw Byte Parity = PASS
EW02 Pending Jobs after tests = 0
R7 Receipt Parity = 100%
Parent Gates = PASS
Vite Production Build = PASS
Electron E2E = PASS
Emitted Artifact SHA = non-null
```

# 40. 최종 판정 문장

> **EW06은 JPEG를 “Worker에서 돌아간다”는 수준으로 승격하지 않는다. Alpha를 어떻게 처리했는지, Quality 숫자가 어떤 단위인지, 실제 SOF가 8-bit 4:4:4 Baseline인지, DPI·ICC Marker가 어떤 Byte로 봉인됐는지, 불필요한 Pthread Child Pool이 제거됐는지, Worker가 만든 Byte가 다운로드까지 변하지 않았는지를 모두 증명할 때만 MODJPEG를 제품 권위로 인정한다.**

# 41. 후속 명세

다음 단계는 다음으로 고정한다.

```text
TDT-EXPORT-WORKER-07
PSD Plane Split / LCMS / Worker Closure /
Peak Memory / Color Transform / Final Main-thread Isolation Seal
```
