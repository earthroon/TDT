# TDT-EXPORT-WORKER-05
## JXL Dedicated Worker Promotion / `jxl_encode_qmap_ex()` ABI Preservation / Bit-depth·Lossless·Pthread·Container Truth Seal

> **상태:** IMPLEMENTATION SPECIFICATION  
> **부모 봉인:** `TDT-EXPORT-WORKER-04`  
> **상위 권위:** `TDT-EXPORT-WORKER-02`, `TDT-RUNTIME-SSOT-01-R7`  
> **대상 저장소:** 다듬다듬 Vite·Vue3·Pinia Runtime + Legacy ExportManager  
> **직접 대상:** JPEG XL Lossless Export, Emscripten JXL WASM, Dedicated Worker, Pthread Child Pool, Resolution Container Finalization  
> **승격 성격:** Renderer Main-thread JXL WASM 권위 제거 및 Canonical JXL Worker 단일화  
> **후속 명세:** `TDT-EXPORT-WORKER-06 MODJPEG Dedicated Worker Promotion Seal`

---

# 0. 문서 목적

EW01은 Worker 생성권·URL·Runtime Epoch·Artifact Identity를 Runtime으로 회수했다.

EW02는 Worker Job ID·입력 Snapshot·FIFO·Timeout·Abort·Cancel·Crash Restart·Pending Closure를 `EncoderWorkerBrokerService`로 회수했다.

EW03은 WebP Lossless와 PNG8·PNG16을 Canonical Worker Codec으로 승격했다.

EW04는 PSD Binary Serialization 권위를 Canonical Worker 경로로 회수했다.

그러나 JXL은 Runtime Encoder Identity는 존재하지만 Worker Binding이 없다.

현재 활성 제품 경로는 다음과 같다.

```text
Runtime ExportAuthorityService
→ dadum.encoder.jxl.v1
→ Legacy ExportManager exact handler
→ import('./export_autotune_jxl.mjs')
→ Renderer Main Thread에서 jxl_bindings.mjs import
→ Renderer Main Thread에서 Shared WebAssembly.Memory 생성
→ Renderer Main Thread에서 _malloc / HEAPU8.set
→ _jxl_encode_qmap_ex()
→ Renderer Main Thread에서 injectResolutionIntoJxl()
→ Blob(image/jxl)
```

저장소에는 JXL Worker 구현이 여러 개 존재한다.

```text
app/legacy-runtime/encoders/export_autotune_jxl.mjs
app/legacy-runtime/encoders/jxl_worker.js
app/legacy-runtime/encoders/jxl_worker_client.js
app/legacy-runtime/workers/jxl_ex_worker.mjs
```

그러나 이 구현들은 다음 이유로 EW01·EW02 제품 권위에 속하지 않는다.

- `new Worker()`를 직접 호출한다.
- 자체 `requestId`와 `pending Map`을 소유한다.
- Runtime Worker Manifest에 등록되지 않았다.
- Broker Job Receipt가 없다.
- Crash Restart·Cancel·Pending Closure가 EW02 SSOT와 분리되어 있다.
- 일부 Worker는 다시 Main-thread용 `export_autotune_jxl.mjs`를 동적 import한다.
- 동일 기능의 Worker Client가 중복 존재한다.

현재 JXL 입력 정밀도 계약에도 불일치가 있다.

```text
Runtime Encoder Registry
→ supportsBitDepths: [8, 16]

Legacy exact payload
→ rgba16-direct면 rgba16을 보존하면서 rgba8 down-convert mirror도 생성

Legacy JXL handler
→ rgba만 assertU8RGBA()
→ bitDepth는 payload에서 전달 가능

Root export_autotune_jxl.mjs
→ normalizeRGBA()는 Uint8Array만 Canonical Input으로 채택
→ _malloc(rgba.length)
→ HEAPU8.set(rgba)
→ bitDepth 값은 1..16 허용
```

즉 `bitDepth=16`이 전달돼도 실제 입력이 8-bit RGBA일 수 있다.

현재 Lossless 계약도 기본값과 명시적 의미가 섞여 있다.

```text
lossless 기본값 = true
lossless=true이면 distance=0, quality=100으로 재작성
lossless=false이면 distance·quality 기반 손실 모드 허용
```

EW05는 이 중 **Lossless JXL만 제품 승격**한다.

Lossy JXL은 이번 명세에서 제품 Capability를 발급하지 않는다.

또한 현재 Emscripten 바인딩은 Shared Memory와 Pthread Pool을 사용하며, 생성 코드에는 Pool Size 4가 고정돼 있다.

반면 Wrapper는 `threads`를 1..64로 허용한다.

따라서 다음 거짓 성공이 가능하다.

- Renderer Main Thread에서 JXL WASM이 실행됐지만 Worker-backed로 오인
- `bitDepth=16` Receipt인데 실제 입력은 RGBA8
- Lossless 요청인데 `distance>0` 또는 손실 Codestream 생성
- 요청 Thread 16인데 실제 Child Pool은 4
- JXL Worker가 Crash했지만 로컬 Pending Promise가 남음
- Worker Output 뒤 Main Thread에서 Exif·XMP Container를 재작성
- Codestream Signature만 맞고 Container Box Boundary가 파손
- Resolution Exif·XMP가 중복 삽입
- Worker WASM Output SHA와 최종 Blob SHA가 다름
- Pthread Child Worker가 Generation 종료 뒤 생존
- SharedArrayBuffer 환경이 없는데 READY로 오인
- Custom ICC 요청을 받았지만 Encoder ABI가 이를 받지 못해 조용히 누락

본 명세는 다음 권위선을 만든다.

```text
Final Surface
→ JXL Encode Plan v1
→ EW02 EncoderWorkerBrokerService.call()
→ dadum.worker.encoder.jxl-canonical-v1
→ dadum-jxl-canonical-worker-v1
→ JXL Emscripten WASM
→ preserved jxl_encode_qmap_ex() ABI
→ Worker-local Container Finalizer
→ JXL Structure Verifier v2
→ Independent JXL Decoder Lossless Round-trip
→ Worker Job Receipt
→ JXL Codec Promotion Receipt
→ R7 Export Receipt
```

# 1. 한 문장 목표

> **`jxl_encode_qmap_ex()` 안정 ABI를 삭제·대체하지 않고 Dedicated Canonical Worker 안에서만 호출하며, JXL Lossless RGBA8 입력·distance 0·quality 100·실행 Thread 수·Pthread Child Pool·Container Box·Resolution Metadata·Output SHA·독립 Decoder Pixel Round-trip이 모두 일치할 때만 `dadum.encoder.jxl.v1` Export Receipt를 발급한다.**

# 2. 소스 기준 사실과 명세 판단 분리

## 2.1 소스에서 확정되는 사실

- 활성 `ExportManager`의 JXL Loader는 `./export_autotune_jxl.mjs`를 import한다.
- 이 Root Wrapper는 `jxl_bindings.mjs`를 직접 import하고 Module Singleton을 Renderer Realm에 만든다.
- Root Wrapper는 `_jxl_encode_qmap_ex`를 직접 호출한다.
- Root Wrapper는 `_malloc`, `HEAPU8.set`, `_jxl_free`, `_free`를 직접 관리한다.
- Root Wrapper의 `normalizeRGBA()`는 Uint8Array·ArrayBuffer·Canvas 기반 RGBA8만 정상화한다.
- Root Wrapper는 `bitDepth`를 1..16으로 허용하지만 입력 Byte Width를 bitDepth에 따라 바꾸지 않는다.
- Legacy JXL Handler는 `assertU8RGBA()`만 호출한다.
- Runtime Encoder Registry는 JXL `supportsBitDepths: [8, 16]`을 광고한다.
- R7 Exact Payload는 `rgba16-direct` Surface를 보존하면서 RGBA8 Down-convert Mirror도 만든다.
- `jxl_bindings.mjs`는 Shared WebAssembly Memory를 생성한다.
- 생성된 Emscripten Glue에는 Pthread Pool Size 4가 고정되어 있다.
- Root Wrapper는 `threads`를 1..64로 허용한다.
- Root Wrapper는 Encoder Output 뒤 `injectResolutionIntoJxl()`을 호출한다.
- `injectResolutionIntoJxl()`은 Raw Codestream을 JXL Container로 감싸거나 기존 Container의 Exif·xml Box를 교체한다.
- Runtime JXL Verifier는 현재 Codestream Magic `FF 0A` 또는 Container Signature만 확인한다.
- JXL은 현재 Runtime Worker Binding이 없다.
- 저장소의 JXL Worker Client들은 EW02 Broker를 사용하지 않는다.
- `jxl_encode_qmap_ex()`와 `jxl_encode_qmap_layers_ex()` Symbol이 현재 WASM Export에 존재한다.
- `jxl_encode_qmap_ex()`는 다듬다듬·DJXL 계열에서 유지해야 하는 안정 ABI다.
- 현재 JXL Encode ABI에는 ICC Byte Pointer·Length Parameter가 없다.

## 2.2 본 명세의 설계 판단

- JXL 제품 Encode는 Dedicated Worker에서만 실행해야 한다.
- Legacy Worker 구현 여러 개를 제품 경로에서 동시에 살리지 않는다.
- EW02 Broker가 Job ID·Queue·Timeout·Cancel·Crash Restart를 단독 소유해야 한다.
- `jxl_encode_qmap_ex()`는 유지하며 Worker Adapter 내부에서 그대로 호출해야 한다.
- EW05 제품 승격 범위는 Lossless JXL로 제한한다.
- 16-bit Capability는 ABI Input Fixture가 통과할 때까지 광고하지 않는다.
- `rgba16float`를 RGBA8로 조용히 축소해 JXL16으로 표시하는 경로를 금지한다.
- Thread 요청은 실제 Emscripten Pool Capacity와 일치해야 한다.
- Resolution Container Finalization은 Worker 안에서 완료해야 한다.
- Worker 출력 뒤 Renderer Main Thread가 JXL Byte를 수정할 수 없다.
- Custom ICC Embed는 현재 ABI가 지원하지 않으므로 조용히 누락하지 않고 Fail-Closed해야 한다.
- Final Surface가 Canonical sRGB Contract이면 ICC 없이도 해당 Color Encoding ID를 Receipt에 기록할 수 있다.
- JXL Lossless 승격은 독립 Decoder의 Exact RGBA Round-trip을 요구한다.

# 3. 핵심 권위선

```text
Runtime Export Authority
→ dadum.encoder.jxl.v1
→ Final Surface Binding
→ JXL Capability Resolver
→ JXL Encode Plan v1
→ EncoderWorkerBrokerService.call()
→ dadum.worker.encoder.jxl-canonical-v1
→ dadum-jxl-canonical-worker-v1
→ JXL Emscripten Module Singleton per Worker Generation
→ jxl_encode_qmap_ex()
→ Worker-local JXL Container Finalizer
→ Immutable Final JXL Bytes
→ JXL Structure Verifier v2
→ Independent JXL Decoder Exact Round-trip
→ Worker Job Receipt
→ JXL Promotion Receipt
→ R7 Export Receipt
```

권위 경계는 다음과 같다.

```text
Final Pixel Authority
= PipelineService Final Surface

JXL Parameter Authority
= JXL Encode Plan v1

JXL ABI Authority
= preserved jxl_encode_qmap_ex()

WASM Instance·Pthread Authority
= Canonical JXL Worker Generation

Job Lifetime Authority
= EW02 EncoderWorkerBrokerService

Container·Metadata Byte Authority
= Worker-local Container Finalizer

Output Admission Authority
= JXL Structure Verifier v2 + Independent Decoder

Final Export Truth Authority
= R7 ExportAuthorityService Receipt
```

# 4. 범위

## 4.1 포함

- JXL Lossless RGBA8
- Dedicated Canonical Worker
- EW02 Unified RPC
- Emscripten JXL WASM Module Singleton
- `jxl_encode_qmap_ex()` ABI Preservation
- Shared Memory·Pthread Ready Evidence
- Thread Count Truth
- Worker-local Resolution Exif·XMP Finalization
- JXL Container Structure Verification
- Exact RGBA8 Lossless Round-trip
- Alpha·Hidden RGB Round-trip
- Output Immutability
- Main-thread JXL WASM Reachability Zero
- Legacy JXL Worker 중복 경로 Quarantine
- Worker Artifact Set Digest
- JXL Promotion Receipt
- R7 Export Receipt 확장

## 4.2 조건부 포함

- RGBA16 Direct Lossless

RGBA16은 다음이 모두 증명될 때만 Capability를 연다.

```text
jxl_encode_qmap_ex input-byte contract fixture PASS
input storage = rgba16le-interleaved-u16-v1
expected byteLength = width * height * 4 * 2
independent decoder output precision >= 16
exact U16 RGBA round-trip PASS
endianness fixture PASS
```

조건이 충족되지 않으면 Runtime Encoder Registry는 JXL의 `supportsBitDepths`를 `[8]`로 제한한다.

## 4.3 제외

- Lossy VarDCT JXL 제품 승격
- Progressive Decode Optimization
- Animation JXL
- Multi-frame JXL
- HDR Float JXL
- `rgba16float` 직접 입력
- Half-float→Integer의 조용한 변환
- Custom ICC Embed ABI 확장
- `jxl_encode_qmap_ex()` 삭제·이름 변경·Stub화
- `jxl_encode_qmap_layers_ex()` 퇴역
- JXL Decoder 자체의 제품 승격
- WebGPU Texture 직접 JXL Encode
- GPU→WASM Zero-copy
- Pthread Pool Size 자동 확대
- JXL Auto Quality UI 재설계
- `jxl-auto`를 Exact Format ID로 승격
- Main Thread 전체 Export Pipeline Zero

# 5. Worker Identity 승격

기존 제품 경로에는 JXL Worker Binding이 없다.

EW05에서 다음 Identity를 추가한다.

```text
workerId:
dadum.worker.encoder.jxl-canonical-v1

runtimeEncoderId:
dadum.encoder.jxl.v1

controlProtocolVersion:
dadum-worker-control-v1

codecProtocolVersion:
dadum-jxl-canonical-worker-v1

operation:
encode.jxl-lossless

entrySourceIdentity:
vite:app/src/runtime/workers/entries/jxl-canonical.worker.ts

legacyCodecHandlerId:
dadum.legacy.worker-codec.jxl-canonical-v1

transferPolicyId:
broker-transfer-snapshot-v1

wasmPolicyId:
single-jxl-module-per-worker-generation-v1
```

`dadum.encoder.jxl.v1`은 유지한다.

Encoder Identity를 새로 만들지 않고 실행 Backend와 Receipt를 승격한다.

# 6. 제품 경로에서 폐기되는 JXL Worker 중복

다음 구현은 Active Export Graph에서 호출될 수 없다.

```text
app/legacy-runtime/encoders/export_autotune_jxl.mjs의 직접 Worker 생성
app/legacy-runtime/encoders/jxl_worker_client.js
app/legacy-runtime/encoders/jxl_worker.js의 Legacy Data Protocol
app/legacy-runtime/workers/jxl_ex_worker.mjs
window.__JXL_USE_WORKER__ 기반 재귀 분기
로컬 nextId / reqId / pending Map
Raw worker.onmessage / worker.onerror
```

파일을 즉시 삭제할 필요는 없다.

그러나 다음 중 하나여야 한다.

```text
legacy_quarantine/
또는
명시적 inactive compatibility module
```

제품 정적 그래프와 Runtime Manifest에서는 Reachability가 0이어야 한다.

# 7. Main-thread JXL WASM Zero

다음은 Renderer Main Thread Active Graph에서 금지된다.

```text
import './encoders/jxl_bindings.mjs'
JxlModule(...)
_jxl_encode_qmap_ex(...)
_malloc(...)
HEAPU8.set(...)
_jxl_free(...)
injectResolutionIntoJxl(encodedBytes, ...)
new Worker(...jxl...)
```

허용되는 Renderer 책임은 다음뿐이다.

```text
Final Surface 선택
JXL Encode Plan 작성
EW02 Broker call
최종 Byte 검증 요청
다운로드 또는 Host Bridge 전달
```

# 8. `jxl_encode_qmap_ex()` ABI 보존

EW05는 다음 ABI를 삭제·대체하지 않는다.

```c
uint8_t* jxl_encode_qmap_ex(
    const uint8_t* src,
    int width,
    int height,
    int bit_depth,
    int is_linear,
    int effort,
    int lossless,
    int threads,
    float distance,
    int quality,
    int epf,
    int tile,
    uint32_t* out_size
);
```

실제 Exported Symbol Binding은 다음을 유지한다.

```text
_jxl_encode_qmap_ex
_jxl_free
_malloc
_free
```

Worker Adapter는 ABI 앞뒤에 검증을 추가할 수 있지만 Symbol을 다른 API로 대체할 수 없다.

다음 변경은 금지된다.

- `jxl_encode_qmap_ex()`를 Stub으로 바꾸기
- 호출을 `jxl_encode_qmap_layers_ex()`로 조용히 교체
- Parameter 순서를 바꾸기
- `lossless`, `threads`, `distance`, `quality` 의미를 Adapter에서 재정의하고 Receipt에 숨기기
- Output Pointer를 `_free()`와 `_jxl_free()` 중 임의로 해제하기

Worker READY 전에 ABI Self-test를 수행한다.

```text
symbolPresent = true
freeSymbolPresent = true
versionSymbolPresent = true 또는 versionUnavailable 명시
abiArgumentCount = 13
outSizePointerWritable = true
zero-size negative fixture rejected = true
```

# 9. JXL Encode Plan v1

JXL 요청은 구조화된 Plan으로 정규화한다.

```ts
interface JxlEncodePlanV1 {
  planVersion: 1;
  modeId: 'jxl-lossless-v1';
  width: number;
  height: number;
  inputStorageId:
    | 'rgba8-interleaved-u8-v1'
    | 'rgba16le-interleaved-u16-v1';
  inputBitDepth: 8 | 16;
  inputByteLength: number;
  inputSha256: string;
  colorEncodingId: 'srgb-nonlinear-v1' | 'srgb-linear-v1';
  isLinear: boolean;
  effort: number;
  threadsRequested: number;
  threadsExecuted: number;
  lossless: true;
  distance: 0;
  quality: 100;
  epf: number;
  tile: number;
  resolution: null | {
    dpiX: number;
    dpiY: number;
    unit: 'inch';
  };
  containerPolicyId: 'jxl-container-always-v1';
  iccPolicyId: 'canonical-srgb-no-custom-icc-v1';
}
```

Plan Digest는 Stable JSON Canonicalization 뒤 SHA-256으로 계산한다.

```text
jxlEncodePlanDigest
```

# 10. Input Precision Contract

## 10.1 RGBA8

```text
inputStorageId = rgba8-interleaved-u8-v1
inputBitDepth = 8
byteLength = width * height * 4
channel order = R,G,B,A
range = 0..255
```

RGBA8은 EW05 필수 승격 범위다.

## 10.2 RGBA16 Direct

```text
inputStorageId = rgba16le-interleaved-u16-v1
inputBitDepth = 16
byteLength = width * height * 4 * 2
channel order = R,G,B,A
range = 0..65535
byte order = little-endian
```

그러나 현재 Source Wrapper는 RGBA16 Byte Width를 구현하지 않는다.

따라서 EW05 Source Bake 시 기본 Capability는 다음이다.

```text
rgba8Lossless = true
rgba16DirectLossless = false
```

RGBA16 Capability는 ABI Fixture가 통과한 Promotion Build에서만 `true`가 된다.

## 10.3 RGBA16 Float

```text
rgba16float → JXL RGBA8 implicit down-convert
```

는 금지한다.

지원하지 않는 Surface는 다음 오류로 실패한다.

```text
E_JXL_FLOAT_INPUT_UNSUPPORTED
```

## 10.4 16-bit False Advertising 금지

`supportsBitDepths: [8,16]`은 16-bit Fixture가 없으면 금지된다.

```text
Source Bake / Unverified Build
→ supportsBitDepths: [8]

Promoted ABI Fixture Build
→ supportsBitDepths: [8,16]
```

# 11. Lossless Semantic Contract

EW05 제품 Operation은 하나뿐이다.

```text
encode.jxl-lossless
```

Parameter는 다음으로 고정한다.

```text
lossless = true
distance = 0
quality = 100
```

Caller가 충돌하는 값을 전달하면 정규화하지 않고 실패한다.

```text
lossless=false
→ E_JXL_LOSSY_MODE_NOT_PROMOTED

distance != 0
→ E_JXL_LOSSLESS_PARAMETER_CONFLICT

quality != 100
→ E_JXL_LOSSLESS_PARAMETER_CONFLICT
```

`jxl-auto`는 Legacy UI Label로 남을 수 있지만 Exact Runtime Format ID는 `jxl` 하나다.

# 12. Effort·EPF·Tile Contract

다음 Parameter는 Lossless 의미를 깨지 않는 범위에서 허용한다.

```text
effort: 1..9
epf: 0..3
tile: 0 또는 명시된 허용 Tile Size
```

허용 범위 밖 값은 조용히 Clamp하지 않는다.

```text
E_JXL_PARAMETER_OUT_OF_RANGE
```

실제 적용값은 Receipt에 기록한다.

```text
effortRequested
effortApplied
epfRequested
epfApplied
tileRequested
tileApplied
```

# 13. Thread·Pthread Truth

현재 Emscripten Glue는 Pthread Pool Size 4를 생성한다.

EW05 승격 Build의 Thread Contract는 다음이다.

```text
pthreadPoolSize = 4
threadsRequested = 1..4
threadsExecuted = 실제 Encoder 호출값
```

`threadsRequested > pthreadPoolSize`는 실패한다.

```text
E_JXL_THREAD_REQUEST_EXCEEDS_POOL
```

조용한 64→4 Clamp는 금지한다.

Worker READY Evidence는 다음을 포함한다.

```text
crossOriginIsolated
sharedArrayBufferAvailable
wasmMemoryShared
pthreadPoolSize
pthreadWorkersLoaded
pthreadWorkersReady
pthreadWorkerScriptIdentity
```

Shared Memory Build를 로드할 수 없는 환경에서는 READY를 발급하지 않는다.

```text
E_JXL_SHARED_MEMORY_UNAVAILABLE
E_JXL_PTHREAD_POOL_INIT_FAILED
```

# 14. Worker Generation과 Pthread Child Ownership

JXL Emscripten Module과 Child Pthread Pool은 Canonical Worker Generation에 귀속한다.

```text
Outer Worker Generation N
├─ JXL WASM Module N
├─ Shared Memory N
└─ Pthread Child Pool N
```

다음 사건에서 Generation 전체를 종료한다.

- Hard Cancel
- Worker Crash
- `messageerror`
- WASM Abort
- Pthread Crash
- Runtime Dispose
- Artifact Mismatch

종료 Receipt는 다음을 요구한다.

```text
outerWorkerTerminated = true
pthreadRunningBeforeDispose
pthreadUnusedBeforeDispose
pthreadRunningAfterDispose = 0
pthreadUnusedAfterDispose = 0
sharedMemoryDetachedOrUnreachable = true
```

브라우저가 Child Worker Count를 직접 노출하지 않는 경우 Emscripten `PThread.runningWorkers`와 `PThread.unusedWorkers` 계측 Adapter를 추가한다.

# 15. Canonical Worker Initialization

Worker Entry는 먼저 Control Handler를 설치한 뒤 무거운 JXL Module을 동적 import한다.

```text
Worker Script loaded
→ EW01 Control Handler installed
→ HELLO accepted
→ JXL Handler dynamic import
→ jxl_bindings.mjs import
→ jxl_bindings.wasm instantiate
→ Pthread Pool load
→ ABI Self-test
→ READY
```

Top-level Static Import가 WASM 초기화에 막혀 Control Handler조차 설치되지 않는 구조를 금지한다.

READY는 다음 Evidence가 완성될 때만 발급한다.

```text
wasmReady = true
abiReady = true
pthreadReady = true
codecReady = true
handlerIdentity = dadum.legacy.worker-codec.jxl-canonical-v1
```

# 16. Worker Data Protocol

EW02 Envelope 안의 Codec Payload는 다음을 사용한다.

```ts
interface JxlWorkerPayloadV1 {
  plan: JxlEncodePlanV1;
  pixels: ArrayBuffer;
}
```

성공 Result는 다음을 반환한다.

```ts
interface JxlWorkerResultV1 {
  bytes: ArrayBuffer;
  encoderEvidence: {
    workerBacked: true;
    mainThreadEncoderUsed: false;
    implementationId: 'dadum.jxl-emscripten-qmap-worker-v1';
    abiSymbol: 'jxl_encode_qmap_ex';
    lossless: true;
    distanceApplied: 0;
    qualityApplied: 100;
    bitDepthApplied: 8 | 16;
    inputStorageId: string;
    threadsRequested: number;
    threadsExecuted: number;
    pthreadPoolSize: number;
    outputContainerKind: 'container';
    outputSha256: string;
    postSerializeMutationCount: 0;
  };
}
```

# 17. Memory Ownership Contract

입력은 EW02 Broker Admission 시 Snapshot된다.

```text
Caller Buffer
→ Broker Snapshot
→ Transfer to JXL Worker
→ Caller 이후 Mutation 영향 없음
```

Worker 내부 Allocation은 다음 순서를 지킨다.

```text
malloc input
malloc outSize
copy input to WASM Heap
call jxl_encode_qmap_ex
copy output from Shared Heap to non-shared Uint8Array
jxl_free output
free input
free outSize
container finalization
transfer final ArrayBuffer
```

다음은 금지한다.

- SharedArrayBuffer View를 Blob Part로 직접 사용
- Output Pointer 해제 전 최종 Copy 생략
- Error Path에서 `outPtr`·`srcPtr`·`outSizePtr` 누수
- `_jxl_free()`와 `_free()` 이중 호출
- Worker Result 후 Main Thread Blob Post-process

# 18. Container Finalization Authority

Canonical Policy는 다음으로 고정한다.

```text
containerPolicyId = jxl-container-always-v1
finalContainerKind = container
```

Encoder가 Raw Codestream을 반환하면 Worker가 다음 Container를 만든다.

```text
JXL Signature Box
ftyp(jxl )
Exif Resolution Box, 요청 시 정확히 1개
xml XMP Resolution Box, 요청 시 정확히 1개
jxlc Codestream Box, 정확히 1개
```

Encoder가 Container를 반환하면 Worker는 다음을 수행한다.

- 기존 Box Boundary 검증
- 기존 Exif·xml Resolution Box 제거
- Resolution Box 정확히 한 쌍 삽입
- Codestream Carrier 보존
- 알 수 없는 Box는 순서와 바이트를 보존하거나 정책상 거부

Finalization 뒤 Renderer Main Thread Byte Mutation은 0이어야 한다.

# 19. Resolution Metadata Truth

Resolution Input은 `resolution_ssot`를 사용한다.

```text
dpiX
dpiY
unit = inch
```

Worker Final Output에는 요청 시 다음이 있어야 한다.

```text
Exif Box Count = 1
xml Box Count = 1
Exif Resolution == requested
XMP Resolution == requested
```

Resolution 요청이 없으면 정책에 따라 0개를 허용한다.

중복 Box는 실패한다.

```text
E_JXL_METADATA_DUPLICATE
```

# 20. Color Encoding·ICC Boundary

현재 `jxl_encode_qmap_ex()` ABI에는 ICC Byte Parameter가 없다.

따라서 Custom ICC 요청을 조용히 버릴 수 없다.

```text
iccBytes present
→ E_JXL_CUSTOM_ICC_UNSUPPORTED
```

EW05 제품 승격은 다음 Final Surface Color Contract만 허용한다.

```text
srgb-nonlinear-v1
srgb-linear-v1
```

Receipt에는 다음을 기록한다.

```text
colorEncodingId
customIccRequested
customIccEmbedded
iccPolicyId
```

`customIccRequested=true`인데 `customIccEmbedded=false`인 성공 Receipt는 금지한다.

# 21. JXL Structure Verifier v2

Verifier는 Magic Byte만 보지 않는다.

다음을 확인한다.

- 12-byte JXL Signature Box
- `ftyp` Box 존재와 Boundary
- Box Size 32·64-bit 처리
- Box Size 0의 EOF 의미
- 정확한 EOF
- `jxlc` 정확히 1개 또는 유효한 `jxlp` Sequence
- `jxlc`와 `jxlp` 동시 존재 금지
- Exif Box Count
- xml Box Count
- Duplicate Resolution Metadata 금지
- Truncated Box 금지
- Overlapping Box 금지
- Trailing Garbage 금지
- Final Container SHA-256

Raw Codestream은 Worker 내부 Encoder Output 단계에서만 허용한다.

Runtime Final Output은 Container여야 한다.

# 22. Independent Decoder Lossless Round-trip

JXL Lossless Promotion은 독립 Decoder를 요구한다.

Decoder는 Encoder WASM과 다른 구현 또는 별도 Decoder Surface여야 한다.

검증 항목:

```text
width exact
height exact
channel count exact
bit depth exact
RGBA pixel exact
alpha exact
alpha=0 hidden RGB exact
edge pixel exact
all-zero image exact
all-65535 image exact, 16-bit 조건부
```

RGBA8은 Byte-for-byte 일치해야 한다.

RGBA16은 U16 Sample-for-sample 일치해야 한다.

독립 Decode가 실행되지 않은 Source Bake는 `SOURCE_BAKED_UNPROMOTED`다.

# 23. Output Immutability

Worker는 Container Finalization 뒤 다음을 계산한다.

```text
workerFinalOutputSha256
```

Runtime이 수신한 Final Bytes와 Blob 생성 직전 Bytes에서 다시 SHA-256을 계산한다.

```text
workerFinalOutputSha256
== runtimeReceivedSha256
== exportOutputSha256
```

불일치 시:

```text
E_JXL_OUTPUT_MUTATED_AFTER_WORKER
```

# 24. Encoder Registry 변경

JXL Worker Binding을 추가한다.

```ts
jxl: {
  workerId: 'dadum.worker.encoder.jxl-canonical-v1',
  required: true,
  codecProtocolVersion: 'dadum-jxl-canonical-worker-v1'
}
```

Source Bake 기본 Bit-depth Capability:

```text
supportsBitDepths: [8]
```

Promotion Fixture가 16-bit ABI를 증명한 Build에서만:

```text
supportsBitDepths: [8,16]
```

JXL Worker READY가 아니면 `dadum.encoder.jxl.v1`은 Eligible Encoder가 아니다.

# 25. Export Receipt 확장

R7 Receipt에 다음을 추가한다.

```text
jxlPromotionState
jxlPromotionId
jxlModeId
jxlAbiSymbol
jxlAbiVersion
jxlInputStorageId
jxlInputBitDepth
jxlInputByteLength
jxlInputSha256
jxlLossless
jxlDistanceApplied
jxlQualityApplied
jxlEffortApplied
jxlEpfApplied
jxlTileApplied
jxlThreadsRequested
jxlThreadsExecuted
jxlPthreadPoolSize
jxlPthreadReady
jxlContainerPolicyId
jxlContainerKind
jxlCodestreamCarrierKind
jxlExifBoxCount
jxlXmlBoxCount
jxlResolutionVerified
jxlColorEncodingId
jxlCustomIccRequested
jxlCustomIccEmbedded
jxlStructureVerifierId
jxlIndependentRoundTripVerified
jxlHiddenRgbVerified
jxlWorkerFinalOutputSha256
jxlPostWorkerMutationCount
```

# 26. Capability Gate

JXL Capability는 다음 조건을 모두 만족할 때만 발급한다.

```text
Worker READY
WASM READY
ABI Self-test PASS
Shared Memory READY
Pthread Pool READY
Encoder Binding exact
Lossless Operation only
RGBA8 Capability PASS
Container Finalizer PASS
Structure Verifier PASS
Independent Decoder Round-trip PASS
Post-worker Mutation 0
```

RGBA16 Capability는 별도다.

```text
RGBA16 ABI Fixture PASS
U16 Endianness PASS
Independent Decoder U16 Exact PASS
```

# 27. 상태 머신

```text
UNREGISTERED
→ REGISTERED
→ WORKER_LOADING
→ WASM_LOADING
→ PTHREAD_LOADING
→ ABI_SELF_TEST
→ READY_RGBA8
→ ENCODING
→ CONTAINER_FINALIZING
→ VERIFYING
→ READY_RGBA8
```

조건부 16-bit 승격:

```text
READY_RGBA8
→ ABI16_FIXTURE
→ READY_RGBA8_RGBA16
```

실패 상태:

```text
FAILED_WASM
FAILED_PTHREAD
FAILED_ABI
FAILED_BITDEPTH
FAILED_ENCODE
FAILED_CONTAINER
FAILED_ROUNDTRIP
CIRCUIT_OPEN
DISPOSED
```

# 28. Stable Error Registry

다음 Stable Error를 추가한다.

```text
E_JXL_WORKER_UNAVAILABLE
E_JXL_WASM_INIT_FAILED
E_JXL_ABI_SYMBOL_MISSING
E_JXL_ABI_SELF_TEST_FAILED
E_JXL_SHARED_MEMORY_UNAVAILABLE
E_JXL_PTHREAD_POOL_INIT_FAILED
E_JXL_THREAD_REQUEST_EXCEEDS_POOL
E_JXL_LOSSY_MODE_NOT_PROMOTED
E_JXL_LOSSLESS_PARAMETER_CONFLICT
E_JXL_PARAMETER_OUT_OF_RANGE
E_JXL_INPUT_STORAGE_UNSUPPORTED
E_JXL_INPUT_LENGTH_MISMATCH
E_JXL_FLOAT_INPUT_UNSUPPORTED
E_JXL_16BIT_ABI_UNVERIFIED
E_JXL_CUSTOM_ICC_UNSUPPORTED
E_JXL_ENCODE_EMPTY
E_JXL_ENCODE_FAILED
E_JXL_OUTPUT_POINTER_INVALID
E_JXL_CONTAINER_INVALID
E_JXL_CONTAINER_BOX_TRUNCATED
E_JXL_CONTAINER_CARRIER_CONFLICT
E_JXL_METADATA_DUPLICATE
E_JXL_RESOLUTION_MISMATCH
E_JXL_ROUNDTRIP_MISMATCH
E_JXL_HIDDEN_RGB_MISMATCH
E_JXL_OUTPUT_MUTATED_AFTER_WORKER
E_JXL_PTHREAD_LEAK
```

# 29. 파일별 구현 계획

## 29.1 신규

```text
app/src/runtime/workers/entries/jxl-canonical.worker.ts
app/legacy-runtime/worker-codecs/jxl-canonical-handler.mjs
app/legacy-runtime/encoders/jxl-canonical-adapter.mjs
app/src/runtime/codecs/jxl/jxl-structure-verifier-v2.ts
app/src/runtime/codecs/jxl/jxl-encode-plan-v1.ts
app/src/runtime/codecs/jxl/jxl-promotion-types.ts
scripts/verify-jxl-main-thread-isolation.mjs
scripts/verify-jxl-container-structure.mjs
scripts/verify-jxl-abi-fixture.mjs
scripts/verify-jxl-pthread-closure.mjs
scripts/verify-jxl-roundtrip.mjs
```

## 29.2 수정

```text
app/legacy-runtime/export_manager.js
app/legacy-runtime/export_autotune_jxl.mjs
app/legacy-runtime/metadata/resolution_ssot.js
app/src/runtime/workers/encoder-worker-types.ts
app/src/runtime/workers/encoder-worker-broker-service.ts
app/src/runtime/workers/generated-worker-manifest.ts
app/src/runtime/workers/generated-worker-manifest.json
app/src/runtime/codecs/encoder-registry-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
app/src/runtime/runtime-error.ts
app/src/env.d.ts
package.json
```

## 29.3 Retire·Quarantine

```text
app/legacy-runtime/encoders/jxl_worker_client.js
app/legacy-runtime/encoders/jxl_worker.js
app/legacy-runtime/encoders/export_autotune_jxl.mjs
app/legacy-runtime/workers/jxl_ex_worker.mjs
```

Retire 대상은 Active Graph에서 제거하되 감사 목적의 Source는 보존할 수 있다.

# 30. Migration Strategy

## 30.1 단계 1

Canonical JXL Worker Entry와 Manifest를 추가한다.

## 30.2 단계 2

Root JXL Wrapper의 ABI Call을 Worker Adapter로 이동한다.

## 30.3 단계 3

Legacy ExportManager JXL Handler를 `DadumRuntimeWorkerBridge.call()`로 교체한다.

## 30.4 단계 4

Main-thread JXL Binding Import와 Legacy Worker Clients를 Active Graph에서 제거한다.

## 30.5 단계 5

Container Finalization과 Structure Verifier를 Worker·Runtime에 추가한다.

## 30.6 단계 6

Independent Decoder RGBA8 Round-trip과 Pthread Closure를 검증한다.

## 30.7 단계 7

16-bit ABI Fixture를 실행하고 통과할 때만 Capability를 연다.

# 31. Worker Artifact Set

JXL Worker Artifact Set은 최소 다음을 포함한다.

```text
app/src/runtime/workers/entries/jxl-canonical.worker.ts
app/legacy-runtime/worker-codecs/jxl-canonical-handler.mjs
app/legacy-runtime/encoders/jxl-canonical-adapter.mjs
app/legacy-runtime/encoders/jxl_bindings.mjs
app/legacy-runtime/encoders/jxl_bindings.wasm
app/legacy-runtime/metadata/resolution_ssot.js
```

Source Graph Bake는 각 Source SHA-256을 기록한다.

Production Promotion은 Vite Emitted Entry·Chunk·WASM SHA-256을 기록한다.

```text
artifactVerificationMode = emitted-artifact-sha256
artifactVerified = true
```

이 없으면 Promotion PASS를 발급하지 않는다.

# 32. 정적 Gate
## GATE-EW05-01 Canonical Worker Identity

JXL Worker ID가 `dadum.worker.encoder.jxl-canonical-v1` 하나인지 확인한다.
## GATE-EW05-02 Canonical Protocol

Codec Protocol이 `dadum-jxl-canonical-worker-v1`인지 확인한다.
## GATE-EW05-03 Canonical Operation

EW02 Allowlist에 `encode.jxl-lossless`만 존재하는지 확인한다.
## GATE-EW05-04 Runtime Worker Binding

`dadum.encoder.jxl.v1`이 Canonical Worker에 Required Binding되는지 확인한다.
## GATE-EW05-05 Main-thread Binding Import Zero

Renderer Active Graph에서 `jxl_bindings.mjs` 직접 Import가 0인지 확인한다.
## GATE-EW05-06 Raw JXL Worker Creation Zero

Legacy JXL 모듈의 `new Worker()`가 Active Graph에 0인지 확인한다.
## GATE-EW05-07 Local Pending Map Zero

JXL Legacy Client의 로컬 Pending Map Reachability가 0인지 확인한다.
## GATE-EW05-08 ABI Symbol Preservation

`_jxl_encode_qmap_ex`와 `_jxl_free`가 Worker Adapter에서 사용되는지 확인한다.
## GATE-EW05-09 ABI Replacement Zero

제품 경로가 `jxl_encode_qmap_ex`를 다른 Symbol로 조용히 교체하지 않는지 확인한다.
## GATE-EW05-10 Lossless Only

제품 Operation에서 `lossless=true`, `distance=0`, `quality=100`이 강제되는지 확인한다.
## GATE-EW05-11 Lossy Reachability Zero

Exact Runtime JXL에서 Lossy Branch Reachability가 0인지 확인한다.
## GATE-EW05-12 RGBA8 Length

RGBA8 Byte Length가 `W*H*4`인지 확인한다.
## GATE-EW05-13 RGBA16 False Advertising Zero

ABI16 Fixture 없이 Registry가 16-bit를 광고하지 않는지 확인한다.
## GATE-EW05-14 Float Down-convert Zero

RGBA16Float를 RGBA8로 축소해 JXL16으로 표시하는 경로가 0인지 확인한다.
## GATE-EW05-15 Thread Pool Truth

요청 Thread 상한이 실제 Pthread Pool Size와 일치하는지 확인한다.
## GATE-EW05-16 Silent Thread Clamp Zero

Thread 요청을 조용히 Clamp하는 경로가 0인지 확인한다.
## GATE-EW05-17 Shared Memory Gate

Shared Memory·crossOriginIsolated Evidence 없이는 READY가 불가능한지 확인한다.
## GATE-EW05-18 Control Handler First

무거운 JXL Import 전에 Control Handler가 설치되는지 확인한다.
## GATE-EW05-19 WASM Artifact Set

JXL MJS·WASM이 Worker Artifact Set에 포함되는지 확인한다.
## GATE-EW05-20 Single Module per Generation

Worker Generation당 JXL Module Singleton이 하나인지 확인한다.
## GATE-EW05-21 Input Snapshot Ownership

입력 Buffer가 EW02 Broker Snapshot을 통해 전달되는지 확인한다.
## GATE-EW05-22 Allocation Cleanup

모든 Success·Error Path에서 Input·OutSize·Output Pointer가 정확히 해제되는지 확인한다.
## GATE-EW05-23 Shared Output Copy

Shared Heap View를 Final Blob·Transfer에 직접 사용하지 않는지 확인한다.
## GATE-EW05-24 Container Always

Runtime Final JXL이 항상 Container인지 확인한다.
## GATE-EW05-25 Metadata Worker Authority

Resolution Exif·XMP Finalization이 Worker 안에서만 수행되는지 확인한다.
## GATE-EW05-26 Post-worker Mutation Zero

Worker 반환 뒤 Renderer JXL Byte Mutation이 0인지 확인한다.
## GATE-EW05-27 Custom ICC Fail-Closed

Custom ICC 요청이 조용히 누락되지 않는지 확인한다.
## GATE-EW05-28 Structure Verifier v2

Magic-only 검증이 폐기되고 Container Boundary 검증이 사용되는지 확인한다.
## GATE-EW05-29 Carrier Exclusivity

`jxlc`와 `jxlp`가 동시에 존재할 수 없는지 확인한다.
## GATE-EW05-30 Metadata Cardinality

Resolution 요청 시 Exif·xml Box가 각각 정확히 1개인지 확인한다.
## GATE-EW05-31 Independent Decoder

Promotion Gate가 독립 Decoder Exact Round-trip을 요구하는지 확인한다.
## GATE-EW05-32 Hidden RGB

Alpha 0 Hidden RGB Fixture가 Promotion Corpus에 포함되는지 확인한다.
## GATE-EW05-33 Pthread Closure

Generation Dispose 뒤 Child Pthread Count가 0인지 확인한다.
## GATE-EW05-34 Output Immutability

Worker·Runtime·Export Output SHA가 일치하는지 확인한다.
## GATE-EW05-35 Receipt Completeness

EW05 Receipt 필수 필드가 모두 존재하는지 확인한다.
## GATE-EW05-36 Stable Errors

EW05 Stable Error가 Registry에 모두 등록되는지 확인한다.
## GATE-EW05-37 Source Graph Determinism

동일 Source에서 Worker Manifest와 Build ID가 재현되는지 확인한다.
## GATE-EW05-38 Parent Seal Regression

R7·EW01·EW02·EW03·EW04 Gate가 모두 유지되는지 확인한다.
# 33. Runtime Test Matrix
## RT-EW05-01 RGBA8 1x1 Opaque

1x1 RGBA8 불투명 입력을 Lossless JXL로 인코딩하고 Exact Round-trip을 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-02 RGBA8 1x1 Transparent

1x1 완전 투명 입력의 Alpha와 Hidden RGB를 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-03 RGBA8 Color Ramp

전 채널 Gradient의 Byte Exact Round-trip을 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-04 RGBA8 Checkerboard

고주파 Checkerboard의 Exact Round-trip을 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-05 RGBA8 Random Seed A

고정 Seed Random Image를 Exact 비교한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-06 RGBA8 Random Seed B

다른 고정 Seed Random Image를 Exact 비교한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-07 Alpha Gradient

Alpha 0..255 Gradient를 Exact 비교한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-08 Hidden RGB Matrix

Alpha 0에서 서로 다른 RGB 조합을 Exact 비교한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-09 Odd Dimensions

17x19 홀수 크기 입력을 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-10 Large Dimensions

대형 RGBA8 입력의 메모리·출력 정합성을 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-11 Empty Input

빈 입력을 `E_JXL_INPUT_LENGTH_MISMATCH`로 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-12 Short Input

예상보다 짧은 입력을 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-13 Long Input

예상보다 긴 입력을 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-14 Zero Width

Width 0을 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-15 Zero Height

Height 0을 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-16 Lossy Flag

`lossless=false`를 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-17 Distance Conflict

`distance>0`을 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-18 Quality Conflict

`quality!=100`을 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-19 Effort Min

Effort 최소값을 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-20 Effort Max

Effort 최대값을 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-21 Effort Overflow

허용 범위 초과 Effort를 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-22 EPF Range

EPF 허용 범위를 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-23 Tile Range

Tile 허용 정책을 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-24 Threads 1

Single-thread 요청과 실행값을 비교한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-25 Threads 4

Pool 최대 Thread 요청과 실행값을 비교한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-26 Threads 5

Pool 초과 요청을 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-27 Shared Memory Missing

SharedArrayBuffer가 없을 때 READY를 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-28 Cross Origin Isolation Missing

crossOriginIsolated가 false일 때 Promotion READY를 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-29 ABI Symbol Missing

`_jxl_encode_qmap_ex` 누락을 Fail-Closed한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-30 Free Symbol Missing

`_jxl_free` 누락을 Fail-Closed한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-31 WASM Fetch Failure

WASM Fetch 실패가 Pending 0으로 폐쇄되는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-32 Pthread Load Failure

Child Pthread 초기화 실패가 READY를 막는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-33 Worker Crash During Encode

Active Job Crash 뒤 Generation Restart를 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-34 Queued Cancel

대기 Job Cancel이 Worker를 죽이지 않는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-35 Active Cancel

활성 Job Hard Cancel 뒤 Child Pool Closure를 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-36 Execution Timeout

Execution Timeout 뒤 Pending 0과 Restart를 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-37 Circuit Open

Restart Budget 초과 시 Circuit Open을 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-38 Runtime Dispose

Runtime Dispose 뒤 Outer·Child Worker 0을 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-39 Raw Codestream Input

Encoder Raw Codestream을 Canonical Container로 Finalize한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-40 Existing Container Input

기존 Container의 Box를 검증하고 Metadata를 Canonicalize한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-41 Duplicate Exif

중복 Exif를 제거해 정확히 1개로 만들거나 파손 시 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-42 Duplicate XML

중복 xml Resolution Box를 처리한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-43 Truncated Box

잘린 Box를 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-44 Overlapping Box

겹치는 Box를 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-45 JXLC JXLP Conflict

`jxlc`와 `jxlp` 동시 존재를 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-46 Trailing Garbage

정확한 EOF 뒤 쓰레기 Byte를 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-47 DPI 72

72 DPI Exif·XMP를 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-48 DPI 300

300 DPI Exif·XMP를 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-49 Non-square DPI

비대칭 X/Y DPI를 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-50 No Resolution

Resolution 미지정 정책을 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-51 Custom ICC Requested

Custom ICC 요청을 Fail-Closed한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-52 sRGB Nonlinear

sRGB Nonlinear Color Encoding Receipt를 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-53 sRGB Linear

Linear sRGB Contract와 `isLinear=true`를 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-54 Output Mutation

Worker 반환 뒤 1 Byte Mutation을 탐지한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-55 Main-thread Import Injection

Renderer JXL Binding Import가 Gate에서 탐지되는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-56 Legacy Worker Injection

Legacy Raw Worker Reachability가 Gate에서 탐지되는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-57 RGBA16 Request Unverified

ABI Fixture 전 16-bit 요청을 거부한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-58 RGBA16 LE Fixture

조건부 Build에서 U16LE Fixture를 검증한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-59 RGBA16 Endianness Swap

Byte Swap Fixture가 실패하는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-60 RGBA16 Exact Round-trip

조건부 16-bit Promotion에서 U16 Exact 비교한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-61 R7 Receipt

JXL Worker·ABI·Container Evidence가 R7 Receipt에 결속되는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-62 EW02 Job Receipt

Job Receipt와 Export Receipt의 Job ID가 일치하는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-63 Artifact Digest Mismatch

JXL WASM SHA 불일치가 READY를 막는지 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
## RT-EW05-64 Deterministic Encode

동일 입력·동일 Plan의 Output Digest 재현성을 확인한다.

**통과 조건**

- 예상 Terminal State가 정확하다.
- EW02 Pending Job Count가 종료 후 0이다.
- 성공 케이스는 필요한 JXL Receipt Evidence를 가진다.
- 실패 케이스는 성공 Export Receipt를 생성하지 않는다.
# 34. Promotion Corpus

최소 Corpus는 다음을 포함한다.

```text
RGBA8 opaque solid
RGBA8 transparent solid
RGBA8 alpha gradient
RGBA8 hidden RGB matrix
RGBA8 chroma ramp
RGBA8 luma ramp
RGBA8 checkerboard
RGBA8 random seed A
RGBA8 random seed B
odd dimensions
large image
DPI 72
DPI 300
non-square DPI
linear sRGB
nonlinear sRGB
thread 1
thread 4
cancel fixture
crash fixture
container corruption fixtures
```

조건부 RGBA16 Corpus:

```text
U16 zero
U16 max
U16 gradient
U16 hidden RGB
U16 alpha gradient
endianness sentinel
```

# 35. Promotion Artifact

## 35.1 JXL Canonical Worker Promotion Receipt

```text
TDT_EXPORT_WORKER_05_JXL_PROMOTION_RECEIPT.json
```

필수 필드:

```text
status
buildId
runtimeManifestDigest
workerManifestDigest
workerArtifactSetDigest
jxlBindingsMjsSha256
jxlBindingsWasmSha256
abiSymbol
abiSelfTestPassed
rgba8Promoted
rgba16Promoted
losslessOnly
pthreadPoolSize
pthreadClosurePassed
containerVerifierPassed
independentRoundTripPassed
hiddenRgbPassed
mainThreadIsolationPassed
postWorkerMutationCount
```

## 35.2 Main-thread JXL Isolation Report

```text
TDT_EXPORT_WORKER_05_MAIN_THREAD_ISOLATION_REPORT.json
```

## 35.3 JXL ABI Fixture Report

```text
TDT_EXPORT_WORKER_05_ABI_FIXTURE_REPORT.json
```

## 35.4 JXL Pthread Closure Report

```text
TDT_EXPORT_WORKER_05_PTHREAD_CLOSURE_REPORT.json
```

## 35.5 JXL Independent Round-trip Report

```text
TDT_EXPORT_WORKER_05_INDEPENDENT_ROUNDTRIP_REPORT.json
```

## 35.6 JXL Container Structure Report

```text
TDT_EXPORT_WORKER_05_CONTAINER_STRUCTURE_REPORT.json
```

# 36. 성능·메모리 Gate

EW05는 품질 진실성을 성능과 바꾸지 않는다.

필수 측정:

```text
worker init time
wasm instantiate time
pthread pool ready time
encode wall time
threads requested/executed
input byteLength
peak WASM memory
output byteLength
container finalization time
independent decode time
```

메모리 보존식:

```text
Terminal Active Jobs = 0
Terminal Queued Jobs = 0
WASM Outstanding Input Allocations = 0
WASM Outstanding Output Allocations = 0
Broker Pending Jobs = 0
Disposed Pthread Workers = 0 live
```

Large Image에서 OOM이 발생하면 성공으로 강등하지 않는다.

```text
E_JXL_ENCODE_FAILED
```

또는 명시적 메모리 오류로 실패한다.

# 37. Rollback

Rollback 단위는 JXL Encoder Binding이다.

```text
dadum.encoder.jxl.v1
```

Rollback 시 다음을 허용하지 않는다.

- Main-thread JXL WASM으로 조용히 복귀
- Legacy Raw Worker Client로 복귀
- PNG·WebP로 포맷 강등
- Lossy JXL로 강등

Rollback 결과는 JXL Encoder를 Ineligible로 만들고 다른 Encoder Capability는 유지한다.

```text
JXL unavailable
PNG/WebP/PSD remain available
```

Rollback Receipt는 이유와 마지막 Worker Generation을 기록한다.

# 38. 승격 조건

다음이 모두 PASS해야 `PROMOTED`다.

```text
Vite Production Build PASS
Electron JXL Worker E2E PASS
JXL Worker Entry emitted SHA PASS
JXL Bindings MJS emitted SHA PASS
JXL WASM emitted SHA PASS
Worker READY PASS
Shared Memory PASS
Pthread Pool 4 READY PASS
ABI Self-test PASS
Main-thread JXL WASM Reachability 0
Raw Legacy JXL Worker Reachability 0
RGBA8 Lossless Corpus Exact PASS
Hidden RGB Exact PASS
Container Structure PASS
Resolution Metadata PASS
Output Mutation Count 0
Pthread Closure PASS
EW02 Pending Job 0
R7 Receipt parity 100%
```

RGBA16은 위 조건과 별도로 다음을 요구한다.

```text
ABI16 Input Fixture PASS
U16LE Endianness PASS
Independent Decoder 16-bit Exact PASS
Registry supportsBitDepths includes 16
```

하나라도 없으면:

```text
SOURCE_BAKED_UNPROMOTED
```

# 39. 완료 정의

EW05 완료는 다음을 의미한다.

- JXL Encode WASM이 Renderer Main Thread에서 실행되지 않는다.
- JXL Job은 EW02 Broker 하나가 소유한다.
- `jxl_encode_qmap_ex()` 안정 ABI가 유지된다.
- 제품 JXL은 Lossless 의미가 고정된다.
- RGBA8 입력과 Bit-depth Receipt가 일치한다.
- 16-bit는 증명 전 광고되지 않는다.
- 요청 Thread와 실제 Pthread Pool이 일치한다.
- Container·Resolution Metadata가 Worker에서 최종화된다.
- Worker Output 뒤 Byte Mutation이 없다.
- 독립 Decoder가 Pixel Exact를 증명한다.
- Outer Worker 종료 뒤 Pthread Child가 남지 않는다.

# 40. 구현 순서

```text
1. JXL Canonical Worker descriptor 추가
2. EW02 operation allowlist와 timeout 추가
3. Control-first Worker Entry 추가
4. JXL Emscripten Adapter 이동
5. jxl_encode_qmap_ex ABI Self-test 추가
6. Legacy ExportManager JXL을 bridge.call()로 교체
7. Main-thread Root Wrapper 호출 제거
8. Legacy Raw Worker Clients quarantine
9. JXL Encode Plan v1 추가
10. Lossless Parameter Gate 추가
11. Thread Pool Truth Gate 추가
12. Worker-local Container Finalizer 추가
13. JXL Structure Verifier v2 추가
14. Export Receipt 확장
15. Main-thread Isolation Gate 실행
16. Independent Decoder RGBA8 Corpus 실행
17. Pthread Closure Gate 실행
18. Vite·Electron Promotion Build 실행
19. 조건부 RGBA16 ABI Fixture 실행
20. Promotion Receipt 발급
```

# 41. 다음 명세

EW05 다음은 다음으로 고정한다.

```text
TDT-EXPORT-WORKER-06
MODJPEG Dedicated Worker Promotion /
RGBA→RGB Preparation Ownership /
Pthread Execution Truth /
JPEG Structure·Color Metadata Seal
```

그 다음은:

```text
TDT-EXPORT-WORKER-07
PSD Plane Split·LCMS Worker Closure /
Renderer Main-thread Preparation Zero /
Peak Memory Budget Seal
```

# 42. 최종 판정표

| 항목 | 현재 EW04 기준 | EW05 목표 |
|---|---|---|
| JXL Encoder Identity | 존재 | 유지 |
| Runtime Worker Binding | 없음 | Canonical JXL Worker Required |
| JXL WASM Realm | Renderer Main | Dedicated Worker |
| Job SSOT | Main Wrapper 또는 Legacy Worker Local | EW02 Broker |
| ABI | `jxl_encode_qmap_ex` | 그대로 보존 |
| Lossless 의미 | 기본값 중심, Lossy 허용 | Lossless 제품 Operation 고정 |
| 8-bit 입력 | 실제 사용 | Exact Contract |
| 16-bit 광고 | `[8,16]` | Fixture 전 `[8]` |
| Thread 요청 | 1..64 | 실제 Pool 1..4 |
| Pthread Closure | 미증명 | Generation Closure 증명 |
| Metadata Finalization | Main Thread | Worker |
| Output Container | Codestream 또는 Container | Canonical Container |
| JXL 검증 | Magic-only | Box·Metadata·Decode Exact |
| Hidden RGB | 미증명 | Exact Fixture |
| Worker Output Mutation | 가능 | 0 |
| Promotion 상태 | Unpromoted | E2E 증거 후 Promoted |

# 43. 봉인 문구

> **EW05는 JXL 코덱을 새로 발명하는 단계가 아니다. 이미 존재하는 `jxl_encode_qmap_ex()` ABI와 Emscripten WASM을 Dedicated Worker 권위선으로 옮기고, 입력 Bit-depth·Lossless Parameter·Thread 실행값·Container Metadata·Pixel Round-trip이 Receipt와 일치하도록 만드는 단계다. 16-bit와 Custom ICC는 증거 없이 열지 않으며, Main-thread JXL WASM·Legacy Raw Worker·조용한 Down-convert·조용한 Lossy Fallback은 제품 권위에서 제거한다.**
