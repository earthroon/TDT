# TDT-MODJPEG-01

## Existing Pthread Artifact Canonical Adoption / Shared Memory·COI Runtime Contract / Child Worker Closure / `encode_mozjpeg_RGB()` ABI Preservation / Baseline 4:4:4 Output Identity Seal

**상태:** Specification Ready / Bake Not Applied

**부모 권위:** `TDT-EXPORT-WORKER-06`, `TDT-EXPORT-PROMOTION-03`, `TDT-BUILD-EMIT-01`

**수정 대상 정책:** `MODJPEG single-thread rebuild required`, `Pthread Retirement required`, `pthreadPoolSize=0 required`

**새 Canonical 정책:** 기존 MODJPEG pthread Artifact를 SHA-256 고정된 제품 Artifact로 채택하고, Cross-Origin Isolation·Shared Memory·Child Worker Closure·Worker Generation Cleanup을 실제 Emitted Route와 Electron Runtime에서 검증한다.

**후속 명세:** `TDT-NATIVE-DECODER-01 Native Raster Decoder Release Addon / Independent JPEG Decode / Quality Corpus Seal`

---

# 0. 문서 목적

EW06은 JPEG Encode를 Renderer Main Thread에서 Dedicated Canonical Worker로 회수하고 다음 계약을 세웠다.

- 명시적 Alpha 처리
- 정수 Quality Percent
- RGB8 입력
- Baseline Sequential JPEG
- 4:4:4 Sampling
- Worker-local JFIF·ICC Marker Finalization
- JPEG Structure Verifier v2
- Worker Output SHA-256

그러나 EW06과 EP03은 현재 MODJPEG Artifact에 포함된 Pthread Runtime을 미승격 사유로 분류하고, 최종 제품 승격 조건으로 Single-thread 재빌드를 요구했다.

최신 소스 감사 결과, 현재 제품 구조는 이미 다음과 같다.

```text
Renderer Runtime
→ EW02 EncoderWorkerBrokerService
→ dadum.worker.encoder.modjpeg-canonical-v1
→ Dedicated MODJPEG Worker
→ Emscripten Pthread Runtime
→ Shared WebAssembly.Memory
→ Pthread Child Worker Pool 8
→ encode_mozjpeg_RGB()
→ Worker-local JPEG Marker Finalizer
→ JPEG Structure Verifier v2
```

사용자는 기존 MODJPEG Artifact를 그대로 유지하기로 결정했다.

따라서 본 명세는 Pthread Runtime을 제거하거나 MODJPEG를 재빌드하지 않는다.

대신 다음을 제품 계약으로 승격한다.

```text
Existing MODJPEG Artifact SHA-256
+ Pthread Pool Size 8
+ Shared Memory Contract
+ Vite/Electron Cross-Origin Isolation
+ Child Worker Emitted Closure
+ Worker Generation Cleanup
+ Stable JPEG ABI
+ Baseline 4:4:4 Output Identity
= Canonical MODJPEG Product Artifact
```

본 명세에서 말하는 “Vite의 Cross-Origin 설정”은 일반적인 CORS 허용이 아니다.

정확한 요구는 다음 두 헤더로 `globalThis.crossOriginIsolated === true`를 만드는 것이다.

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

`Access-Control-Allow-Origin: *`만 추가하는 방식은 SharedArrayBuffer와 Pthread Runtime을 열지 못하므로 본 명세의 COI 증거로 인정하지 않는다.

---

# 1. 한 문장 목표

> **현재 저장소의 `libmodjpeg_wasm.mjs`와 `libmodjpeg_wasm.wasm`을 Byte 변경 없이 Canonical Product Artifact로 채택하고, Vite Dev·Preview와 Electron Production Route가 모두 Cross-Origin Isolated 상태를 제공하며, Pthread Pool 8·Shared Memory·Child Worker URL·`encode_mozjpeg_RGB()` ABI·Baseline 4:4:4 Output·Cancel/Crash/Dispose Closure가 동일 Build와 Worker Generation Receipt로 증명될 때만 JPEG Capability를 승격한다.**

---

# 2. 이전 정책 교정

## 2.1 폐기되는 판단

다음 판단은 본 명세에 의해 폐기된다.

```text
PTHREAD_POOL_SIZE=8
→ 정당화되지 않은 비용
→ 미승격 Blocker
→ Single-thread 재빌드 필수
```

다음 EP03 검증 조건도 폐기된다.

```text
pthreadPoolSize === 0
pthreadSymbolCount === 0
childWorkerReferenceCount === 0
sharedMemory === false
canonicalSingleThread === true
```

## 2.2 새 판단

```text
PTHREAD_POOL_SIZE=8
→ Existing Canonical Artifact의 고정 실행 계약
→ 변경 금지
→ COI·Shared Memory·Child Closure·Cleanup 검증 필수
```

새 승격 조건은 다음이다.

```text
pthreadPoolSize === 8
sharedMemory === true
crossOriginIsolated === true
childWorkerClosureVerified === true
pthreadGenerationClosureVerified === true
abiPreserved === true
baseline444OutputVerified === true
artifactShaPinned === true
```

## 2.3 비호환 정책 금지

동일 Build에서 다음 정책을 동시에 주장해서는 안 된다.

```text
canonicalSingleThread = true
pthreadPoolSize = 8
```

본 명세 적용 후 JPEG Receipt의 정규값은 다음이다.

```text
canonicalSingleThread = false
canonicalPthreadArtifact = true
threadMode = emscripten-pthread-pool-8-canonical-v1
pthreadPoolSize = 8
sharedMemory = true
```

---

# 3. 소스 감사 결과

## 3.1 Artifact Identity

현재 저장소의 Canonical Candidate는 다음 두 파일이다.

```text
app/legacy-runtime/encoders/libmodjpeg_wasm.mjs
SHA-256
6c951106e5cc2b68b06b8f6290e448a892c2a31da017f3c5946f5fb7903b6166
Byte Length
71,676

app/legacy-runtime/wasm/libmodjpeg_wasm.wasm
SHA-256
6f669d33e1d7f47f95ca14c4562bbb55985942f5c43a01521aeb6f01dd2e0a14
Byte Length
262,195
```

이 두 SHA는 본 명세의 Candidate Artifact Identity다.

해시가 하나라도 달라지면 같은 MODJPEG Artifact로 간주하지 않는다.

## 3.2 Pthread Pool

Emscripten Glue에는 다음 실행 계약이 포함돼 있다.

```text
var pthreadPoolSize = 8
while (pthreadPoolSize--) {
  PThread.allocateUnusedWorker()
}
```

Pool은 Runtime 초기화 시 사전 할당된다.

## 3.3 Child Worker 생성

Glue는 다음 두 경로 중 하나로 Child Worker를 생성한다.

```text
Module.mainScriptUrlOrBlob가 존재
→ new Worker(mainScriptUrlOrBlob, {
     type: "module",
     name: "em-pthread"
   })

Module.mainScriptUrlOrBlob가 없음
→ new Worker(new URL("libmodjpeg_wasm.mjs", import.meta.url), {
     type: "module",
     name: "em-pthread"
   })
```

현재 Adapter는 `mainScriptUrlOrBlob`에 문자열 URL을 전달한다.

```text
new URL('./libmodjpeg_wasm.mjs', import.meta.url).href
```

따라서 Blob URL이 아니라 Emitted Static Route가 Child Worker Bootstrap Authority가 된다.

## 3.4 Shared Memory

Adapter는 다음 Shared Memory를 생성한다.

```text
initial = 4,096 pages
initialBytes = 268,435,456
maximum = 32,768 pages
maximumBytes = 2,147,483,648
shared = true
```

Memory 생성 전에 다음을 검사한다.

```text
typeof SharedArrayBuffer === 'function'
crossOriginIsolated === true
```

## 3.5 ABI

현재 Adapter가 요구하는 Stable ABI는 다음이다.

```text
_encode_mozjpeg_RGB
_jpgbuffer_ptr
_jpgbuffer_len
_jpgbuffer_free
_malloc
_free
```

제품 Encoder Entry는 다음 ABI를 호출한다.

```text
encode_mozjpeg_RGB(
  rgbPointer,
  width,
  height,
  qualityPercent,
  outputStructPointer
)
```

## 3.6 Worker Lifecycle

Worker Handler의 Dispose는 다음 Adapter 함수를 호출한다.

```text
disposeCanonicalModjpegAdapter()
→ module.PThread?.terminateAllThreads?.()
→ modulePromise = null
```

Common Worker Runtime은 Runtime Dispose Control을 받으면 Active Job을 Abort한 후 Handler Dispose를 호출한다.

EW02 Broker는 Cancel Grace 초과, Execution Timeout, Worker Crash에서 해당 Worker Generation을 종료하고 새 Generation을 만든다.

## 3.7 현재 COI 구현

Electron Static Server는 이미 다음 헤더를 모든 정상·오류 응답에 적용한다.

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
Cache-Control: no-store
```

현재 `vite.config.ts`에는 `server.headers`와 `preview.headers`가 없다.

따라서 Electron Production Route는 COI 계약이 있으나 Vite Dev·Preview Route는 별도 설정이 필요하다.

---

# 4. 범위

## 4.1 포함

- 기존 MODJPEG Glue·WASM Artifact의 Canonical Adoption
- Artifact SHA Pinning
- Vite Dev COI Header
- Vite Preview COI Header
- Electron Static COI Route Parity
- SharedArrayBuffer Admission
- Shared WebAssembly.Memory Admission
- Pthread Pool Size 8 Truth
- Pthread Child Worker Emitted Route Closure
- Child Worker MIME·COI Header·Body SHA 검증
- `encode_mozjpeg_RGB()` ABI 보존
- Output Struct ABI 보존
- Dedicated Worker 내부 Module Singleton
- Worker Generation별 Pthread Pool 수명
- Cancel·Timeout·Crash·Dispose Closure
- Baseline Sequential 4:4:4 Output 검증
- Worker Output SHA-256
- Repeated Encode Byte Identity
- JPEG Receipt 정책 교정
- EP03 MODJPEG Gate 교정
- BUILD-EMIT Worker Closure v2 확장
- Production Capability·Rollback 계약

## 4.2 제외

- MODJPEG Source 재구성
- mozjpeg Revision 추론
- Emscripten 재빌드
- Single-thread 변환
- Pthread Pool 크기 튜닝
- 4:2:0·4:2:2 Capability
- Progressive JPEG
- CMYK JPEG
- 새로운 JPEG ABI 추가
- Native Independent Decoder 구현
- JPEG Quality Corpus 자체 제작

## 4.3 조건부 포함

다음은 실제 Package 실행 환경에서만 PASS할 수 있다.

- Electron `crossOriginIsolated` Runtime Probe
- Child Worker Pool Ready Count 8
- Child Worker Termination Count 8
- Crash 뒤 이전 Generation Child Worker 잔존 0
- Repeated Encode Byte Identity
- Independent JPEG Decode·Quality Metric

---

# 5. SSOT 소유권

| 영역 | SSOT | 비권위 자료 |
|---|---|---|
| MODJPEG Artifact | Artifact Adoption Manifest | 파일명만 같은 임의 WASM |
| Glue SHA | SHA-256 `6c9511...b6166` | 수정 시각·파일 크기 단독 |
| WASM SHA | SHA-256 `6f669d...e0a14` | Source Revision 추정 |
| Thread Mode | MODJPEG Runtime Contract | `canonicalSingleThread` Legacy Flag |
| Pthread Pool | Glue Inspection + Runtime Ready Evidence | 상수 문자열만 존재하는 Source 보고서 |
| Shared Memory | Adapter + Runtime Probe | COI Header 설정 파일만 존재 |
| COI | 실제 Route Header + `crossOriginIsolated` | CORS Header |
| Child Worker URL | Emitted Worker Closure Manifest | Source 상대 경로 |
| Child Worker Body | Route SHA-256 | URL이 200이라는 사실만 |
| ABI | ABI Contract + Runtime Symbol Probe | Glue Export 이름 목록만 |
| Output Structure | JPEG Structure Verifier v2 | SOI Magic Prefix |
| Generation Closure | Broker·Handler Dispose Receipt | `terminateAllThreads` 함수 존재만 |
| Promotion | MODJPEG Adoption Receipt | EW06 Single-thread Report |

---

# 6. 상태 머신

```text
UNASSESSED
→ SOURCE_ARTIFACT_IDENTITY_VERIFIED
→ COI_CONFIG_VERIFIED
→ EMITTED_CHILD_CLOSURE_VERIFIED
→ SHARED_MEMORY_RUNTIME_VERIFIED
→ PTHREAD_POOL_RUNTIME_VERIFIED
→ ABI_RUNTIME_VERIFIED
→ BASELINE_444_OUTPUT_VERIFIED
→ GENERATION_CLOSURE_VERIFIED
→ EXISTING_PTHREAD_ARTIFACT_CANONICALLY_ADOPTED
```

## 6.1 상태 상한

BUILD-LOCK-01과 BUILD-EMIT-01이 승격되지 않았으면 상태 상한은 다음이다.

```text
SOURCE_ARTIFACT_IDENTITY_VERIFIED
```

Source Gate는 PASS할 수 있지만 Emitted Closure·Electron Runtime·Generation Closure PASS를 발급할 수 없다.

## 6.2 승격 완료 상태

최종 승격 상태는 다음 필드를 요구한다.

```json
{
  "state": "EXISTING_PTHREAD_ARTIFACT_CANONICALLY_ADOPTED",
  "promotionEligible": true,
  "canonicalPthreadArtifact": true,
  "canonicalSingleThread": false,
  "pthreadPoolSize": 8,
  "sharedMemory": true,
  "crossOriginIsolationVerified": true,
  "childWorkerClosureVerified": true,
  "generationClosureVerified": true,
  "abiPreserved": true,
  "baseline444OutputVerified": true
}
```

---

# 7. Canonical Artifact Adoption Manifest v1

파일:

```text
artifacts/modjpeg/TDT_MODJPEG_01_ARTIFACT_ADOPTION_MANIFEST.json
```

필수 필드:

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-MODJPEG-01",
  "artifactPolicyId": "dadum.modjpeg.existing-pthread-canonical-v1",
  "glue": {
    "sourcePath": "app/legacy-runtime/encoders/libmodjpeg_wasm.mjs",
    "sha256": "6c951106e5cc2b68b06b8f6290e448a892c2a31da017f3c5946f5fb7903b6166",
    "byteLength": 71676
  },
  "wasm": {
    "sourcePath": "app/legacy-runtime/wasm/libmodjpeg_wasm.wasm",
    "sha256": "6f669d33e1d7f47f95ca14c4562bbb55985942f5c43a01521aeb6f01dd2e0a14",
    "byteLength": 262195
  },
  "threadMode": "emscripten-pthread-pool-8-canonical-v1",
  "pthreadPoolSize": 8,
  "sharedMemory": true,
  "sharedMemoryInitialBytes": 268435456,
  "sharedMemoryMaximumBytes": 2147483648,
  "abiContractId": "dadum.modjpeg.rgb8-output-struct-abi-v1",
  "outputProfileId": "jpeg-baseline-rgb8-444-v1",
  "selfDigest": "..."
}
```

## 7.1 Artifact 변경 정책

Manifest의 Glue·WASM SHA가 달라지면 다음을 요구한다.

- 새 Artifact Policy ID
- 새 ABI Probe
- 새 Pthread Pool Probe
- 새 Child Worker Closure
- 새 Output Identity Corpus
- 새 Promotion Receipt

기존 Manifest의 SHA를 조용히 덮어쓰지 않는다.

---

# 8. Vite Cross-Origin Isolation 계약

## 8.1 용어 정정

본 명세에서 “Cross-Origin을 푼다”는 표현은 다음을 의미한다.

```text
CORS Relaxation이 아니라
Cross-Origin Isolation 활성화
```

다음 Header는 목적이 다르다.

```text
Access-Control-Allow-Origin
→ CORS 요청 허용

Cross-Origin-Opener-Policy
Cross-Origin-Embedder-Policy
→ SharedArrayBuffer 사용 가능한 격리 Browsing Context 생성
```

CORS만 허용하고 COOP·COEP를 누락하면 실패한다.

## 8.2 Vite Dev Server

`vite.config.ts`는 다음 Header를 `server.headers`에 설정해야 한다.

```ts
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',
  },
}
```

## 8.3 Vite Preview Server

`preview.headers`에도 동일한 Header를 설정해야 한다.

```ts
preview: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',
  },
}
```

Dev와 Preview가 서로 다른 정책을 사용하면 실패한다.

## 8.4 Electron Production Server

Electron `createStaticCoiServer()`는 다음을 유지해야 한다.

```text
COOP = same-origin
COEP = require-corp
CORP = same-origin
```

다음 Route에 모두 적용해야 한다.

- index.html
- Main Worker JS
- MODJPEG Worker Entry JS
- MODJPEG Shared Chunk
- MODJPEG Pthread Child Bootstrap JS
- MODJPEG WASM
- Dynamic Chunk
- 403·404·500 응답

## 8.5 Runtime Probe

Renderer와 MODJPEG Parent Worker에서 각각 다음을 측정한다.

```text
globalThis.crossOriginIsolated === true
typeof SharedArrayBuffer === 'function'
WebAssembly.Memory({ shared:true }) 생성 성공
```

Child Pthread Worker에서도 Shared Memory Admission이 성공해야 한다.

## 8.6 헤더 Receipt

```json
{
  "route": "/assets/modjpeg-child.<hash>.js",
  "status": 200,
  "bodySha256": "...",
  "contentType": "application/javascript; charset=utf-8",
  "coop": "same-origin",
  "coep": "require-corp",
  "corp": "same-origin",
  "crossOriginIsolationRole": "pthread-child-bootstrap"
}
```

---

# 9. Worker-WASM-Pthread Closure v1

## 9.1 Closure Root

```text
dadum.worker.encoder.modjpeg-canonical-v1
```

## 9.2 필수 Closure Node

```text
MODJPEG Worker Entry
MODJPEG Handler
MODJPEG Adapter
MODJPEG Parent Module Projection
MODJPEG Pthread Child Bootstrap Projection
MODJPEG WASM
공유 Vite Chunk
Runtime Worker Manifest Entry
Static Route Manifest Entry
```

## 9.3 필수 Edge

```text
Worker Entry
→ static-import → Handler

Handler
→ dynamic-import → Adapter

Adapter
→ static-import → MODJPEG Module

Adapter
→ new-url/mainScriptUrlOrBlob → Pthread Child Bootstrap

Adapter
→ locate-file/new-url → MODJPEG WASM

Pthread Child Bootstrap
→ shared-wasm-module → MODJPEG WASM
```

## 9.4 동일 Source의 이중 Projection

`libmodjpeg_wasm.mjs`는 다음 두 역할을 가질 수 있다.

```text
A. Parent Worker에서 Import되는 Emscripten Module
B. Child Worker가 직접 실행하는 Pthread Bootstrap URL
```

이는 같은 Emitted Artifact를 두 Owner가 공유한다는 뜻이 아니다.

Manifest는 다음처럼 역할을 구분해야 한다.

```json
{
  "sourceIdentity": "app/legacy-runtime/encoders/libmodjpeg_wasm.mjs",
  "emittedArtifacts": [
    {
      "role": "parent-module-projection",
      "route": "/assets/modjpeg-runtime.<hash>.js",
      "sha256": "..."
    },
    {
      "role": "pthread-child-bootstrap",
      "route": "/assets/libmodjpeg_wasm.<hash>.mjs",
      "sha256": "..."
    }
  ]
}
```

두 역할이 동일 Route를 합법적으로 공유하는 경우에도 Role Cardinality와 Route SHA를 명시한다.

## 9.5 Raw Legacy Route 금지

Pthread Child Bootstrap이 다음 Source 경로를 직접 참조해서는 안 된다.

```text
/legacy/encoders/libmodjpeg_wasm.mjs
```

Production에서는 Vite Emitted Route가 권위다.

Raw Legacy Route를 Bootstrap으로 사용할 경우 BUILD-EMIT Ownership Gate가 실패해야 한다.

## 9.6 Blob URL 정책

현재 Artifact Adoption Profile은 문자열 `mainScriptUrlOrBlob`을 사용한다.

따라서 Runtime Child Worker URL은 Static Route여야 한다.

```text
blob: Child Bootstrap
→ 허용하지 않음
```

Blob URL은 Body SHA와 Route Header를 독립 검증하기 어렵기 때문이다.

---

# 10. Shared Memory Contract v1

## 10.1 Memory Identity

```text
memoryType = WebAssembly.Memory
shared = true
initialPages = 4096
maximumPages = 32768
initialBytes = 268435456
maximumBytes = 2147483648
```

## 10.2 Memory Ownership

Shared Memory는 다음 Generation에 귀속된다.

```text
Worker ID
+ Runtime Epoch
+ Worker Epoch
+ Worker Generation
```

전역 Renderer나 다른 Encoder Worker와 공유하지 않는다.

## 10.3 생성 횟수

정상 Worker Generation당 Shared Memory 생성은 정확히 1회여야 한다.

동일 Generation 내 Encode Job마다 새 Shared Memory를 만들면 실패한다.

## 10.4 Module Singleton

정상 Worker Generation당 Emscripten Module Instance는 정확히 1개다.

```text
moduleInstanceCount = 1
```

Generation 재생성 후 Count는 새 Generation 기준으로 다시 1이어야 한다.

## 10.5 Memory Growth

Memory가 Initial보다 증가하면 다음을 Receipt에 기록한다.

```text
memoryBytesBefore
memoryBytesPeak
memoryBytesAfter
memoryGrowthCount
```

Maximum을 넘어서는 Allocation은 명시 오류로 실패한다.

## 10.6 비-COI 실패

COI가 없으면 Adapter는 Encode를 시작하기 전에 다음 오류로 실패해야 한다.

```text
E_MODJPEG_COI_REQUIRED
```

기존 `E_JPEG_SHARED_MEMORY_UNAVAILABLE`은 Compatibility Alias로 유지할 수 있으나 Receipt의 Stable Error ID는 새 오류로 정규화한다.

---

# 11. Pthread Runtime Contract v1

## 11.1 Canonical Pool

```text
pthreadPoolSize = 8
poolAllocationMode = eager-preload
childWorkerType = module
childWorkerName = em-pthread
```

## 11.2 Ready Barrier

Parent Worker는 Pool 8개가 모두 WASM Module Load를 완료하기 전 `READY`를 반환하면 안 된다.

Ready Evidence:

```json
{
  "pthreadPoolRequested": 8,
  "pthreadWorkersAllocated": 8,
  "pthreadWorkersModuleLoaded": 8,
  "pthreadPoolReady": true
}
```

Source 상수만 읽어서 `pthreadWorkersModuleLoaded=8`로 기록해서는 안 된다.

## 11.3 Encode Job Thread Truth

본 명세는 JPEG Encode가 실제로 8 Thread에서 병렬 계산된다고 주장하지 않는다.

따라서 Receipt는 다음을 구분한다.

```text
pthreadPoolProvisioned = 8
encodeStageExecutedThreadCount = measured value or null
```

Pool 존재와 Encode 병렬 실행을 같은 사실로 취급하지 않는다.

## 11.4 Generation Dispose

정상 Dispose 시 다음 순서를 따른다.

```text
Active Job Abort
→ Adapter Dispose
→ PThread.terminateAllThreads()
→ Child Worker Count 0
→ Module Promise Clear
→ Worker Control DISPOSED
→ Parent Dedicated Worker Termination
```

## 11.5 Cancel

Cooperative Cancel이 JPEG ABI 호출 중 즉시 중단되지 못할 수 있다.

Cancel Grace 안에 Job이 종료되지 않으면 EW02 Broker가 Parent Worker Generation을 강제 종료한다.

강제 종료는 해당 Generation의 Child Worker도 모두 제거해야 한다.

## 11.6 Crash

Parent Worker Crash 후 다음을 요구한다.

```text
oldGenerationParentAlive = false
oldGenerationChildWorkersAlive = 0
oldSharedMemoryReachable = false
newGeneration = oldGeneration + 1
newPthreadWorkersAllocated = 8
```

## 11.7 Timeout

Execution Timeout은 기존 Generation의 재사용을 허용하지 않는다.

```text
executionTimeout
→ cancel request
→ cancel grace
→ hard generation terminate
→ queued jobs restart on new generation
```

Active Job은 자동 재실행하지 않는다.

## 11.8 Child Leak Gate

100회 Worker Generation 생성·종료 후 다음을 만족해야 한다.

```text
liveParentWorkers = 0
liveChildPthreadWorkers = 0
liveSharedMemoryInstances = 0
```

---

# 12. ABI Preservation Contract

## 12.1 ABI Contract ID

```text
dadum.modjpeg.rgb8-output-struct-abi-v1
```

## 12.2 필수 Symbol

```text
_encode_mozjpeg_RGB
_jpgbuffer_ptr
_jpgbuffer_len
_jpgbuffer_free
_malloc
_free
```

## 12.3 호출 Contract

```c
int encode_mozjpeg_RGB(
  const uint8_t* rgb,
  int width,
  int height,
  int quality,
  void* output_struct
);
```

현재 JS Contract는 wasm32 Output Struct를 다음으로 해석한다.

```text
u32 bufferPointer
u32 byteLength
```

## 12.4 입력

```text
storage = interleaved-rgb8
channels = 3
rowStride = width * 3
byteLength = width * height * 3
quality = integer 1..100
```

## 12.5 출력 Ownership

```text
_encode_mozjpeg_RGB
→ jpgbuffer_ptr
→ jpgbuffer_len
→ JS Copy
→ jpgbuffer_free
→ free(rgb)
→ free(outputStruct)
```

어느 실패 경로에서도 `jpgbuffer_free`, `_free`가 중복 호출되거나 누락돼서는 안 된다.

## 12.6 ABI Probe

Runtime Probe는 다음을 확인한다.

- 모든 필수 Symbol이 함수다.
- `_malloc`이 반환한 포인터가 Heap Boundary 안이다.
- Output Pointer·Length가 Shared Heap Boundary 안이다.
- Encode 성공 뒤 JPEG Byte Copy가 Output Free 이후에도 동일하다.
- Job 100회 뒤 Outstanding ABI Allocation이 0이다.

## 12.7 비제품 ABI

동일 WASM에 다른 JPEG ABI가 있어도 다음 제품 Operation에서 도달할 수 없어야 한다.

```text
encode.jpeg-baseline-444
```

제품 Capability는 `encode_mozjpeg_RGB()` 하나만 광고한다.

---

# 13. JPEG Encode Plan

기존 `dadum-jpeg-encode-plan-v1`을 유지한다.

필수 필드:

```json
{
  "width": 0,
  "height": 0,
  "qualityRequested": 0,
  "qualityRequestedUnit": "percent",
  "qualityAppliedPercent": 0,
  "alphaPolicyId": "reject-nonopaque-v1",
  "matteRgb": null,
  "subsampling": "4:4:4",
  "frameMode": "baseline-sequential",
  "dpiX": 300,
  "dpiY": 300,
  "iccByteLength": 0,
  "modjpegArtifactPolicyId": "dadum.modjpeg.existing-pthread-canonical-v1",
  "threadMode": "emscripten-pthread-pool-8-canonical-v1"
}
```

Encode Plan Digest는 Thread Mode와 Artifact Policy를 포함해야 한다.

---

# 14. Baseline 4:4:4 Output Identity

## 14.1 구조 조건

최종 JPEG는 다음을 만족해야 한다.

```text
SOI 정확히 1
SOF0 정확히 1
SOF2 0
Precision 8
Component Count 3
Y Sampling 1x1
Cb Sampling 1x1
Cr Sampling 1x1
SOS 정확히 1
EOI 정확히 1
EOI 뒤 Byte 0
```

## 14.2 Marker 조건

```text
JFIF APP0 정확히 1
ICC 요청 시 APP2 Sequence 완전
ICC 미요청 시 ICC APP2 0
DPI X·Y Encode Plan과 동일
```

## 14.3 Byte Identity

동일 조건에서 반복 Encode한 최종 Byte SHA는 동일해야 한다.

Identity Key:

```text
Artifact SHA
+ Worker Build ID
+ Encode Plan Digest
+ RGB Input SHA
+ ICC SHA
```

최소 반복:

```text
동일 Generation 100회
서로 다른 Generation 20회
Clean App Relaunch 5회
```

모든 Output SHA가 같아야 `byteDeterminismVerified=true`를 발급한다.

## 14.4 ABI Raw Output과 Final Output

Marker Finalizer 전·후 SHA를 분리한다.

```text
abiOutputSha256
workerFinalOutputSha256
finalDiskSha256
```

다음 보존식을 요구한다.

```text
workerFinalOutputSha256
= Runtime Received SHA
= Electron Host Stream SHA
= Final Disk SHA
```

ABI Raw Output SHA는 Final Marker Injection 때문에 Final SHA와 다를 수 있다.

## 14.5 독립 Decode

Native Raster Decoder가 준비되면 다음을 검증한다.

- Width·Height
- RGB Channel Count
- Alpha 없음
- Quality별 Metric Envelope
- Matte Composite 결과
- ICC 적용 결과

독립 Decoder 부재는 Artifact Adoption Source Gate를 막지 않지만 Product Profile Promotion을 막는다.

---

# 15. Runtime Receipt v2

JPEG Codec Evidence는 다음 필드를 추가하거나 교정한다.

```json
{
  "artifactPolicyId": "dadum.modjpeg.existing-pthread-canonical-v1",
  "glueArtifactSha256": "6c951106e5cc2b68b06b8f6290e448a892c2a31da017f3c5946f5fb7903b6166",
  "wasmArtifactSha256": "6f669d33e1d7f47f95ca14c4562bbb55985942f5c43a01521aeb6f01dd2e0a14",
  "canonicalPthreadArtifact": true,
  "canonicalSingleThread": false,
  "threadMode": "emscripten-pthread-pool-8-canonical-v1",
  "pthreadPoolSize": 8,
  "pthreadPoolReady": true,
  "pthreadWorkersAllocated": 8,
  "pthreadWorkersModuleLoaded": 8,
  "sharedMemory": true,
  "sharedMemoryInitialBytes": 268435456,
  "sharedMemoryMaximumBytes": 2147483648,
  "crossOriginIsolated": true,
  "childWorkerClosureDigest": "...",
  "childWorkerRouteSha256": "...",
  "childWorkerClosureVerified": true,
  "abiContractId": "dadum.modjpeg.rgb8-output-struct-abi-v1",
  "abiPreserved": true,
  "baseline444OutputVerified": true,
  "generationClosureVerified": true,
  "promotionState": "EXISTING_PTHREAD_ARTIFACT_CANONICALLY_ADOPTED"
}
```

## 15.1 제거·교정 필드

다음 값은 더 이상 Blocker 의미가 아니다.

```text
sharedMemory = true
pthreadPoolSize = 8
canonicalSingleThread = false
```

다음 Legacy 필드는 제거하거나 Compatibility Alias로만 남긴다.

```text
pthreadRetirementVerified
modjpegSingleThreadRebuildVerified
```

정규 필드:

```text
canonicalPthreadArtifact
pthreadContractVerified
childWorkerClosureVerified
generationClosureVerified
```

---

# 16. Runtime Worker Manifest 수정

MODJPEG Worker 항목은 다음 정책을 광고해야 한다.

```json
{
  "workerId": "dadum.worker.encoder.modjpeg-canonical-v1",
  "codecProtocolVersion": "dadum-modjpeg-canonical-worker-v1",
  "wasmPolicyId": "modjpeg-existing-pthread-artifact-canonical-v1",
  "threadMode": "emscripten-pthread-pool-8-canonical-v1",
  "pthreadPoolSize": 8,
  "sharedMemoryRequired": true,
  "crossOriginIsolationRequired": true,
  "childWorkerClosureRequired": true
}
```

기존 값:

```text
modjpeg-legacy-pthread-artifact-worker-isolated-unpromoted-v1
```

은 폐기한다.

---

# 17. Encoder Registry Capability

`dadum.encoder.jpg.v1`은 다음을 광고한다.

```text
bitDepths = [8]
alpha = explicit-policy-only
subsampling = [4:4:4]
frameMode = [baseline-sequential]
threadMode = emscripten-pthread-pool-8-canonical-v1
requiresCrossOriginIsolation = true
requiresSharedArrayBuffer = true
```

COI가 없는 Runtime에서는 JPEG Capability를 숨기거나 Fail-Closed 상태로 표시한다.

다른 Encoder로 조용히 Fallback하지 않는다.

---

# 18. Vite 설정 계약

## 18.1 단일 Header 함수

Vite Dev·Preview와 Electron Static Server가 동일한 Header 상수를 공유하는 것이 권장된다.

예시:

```text
app/runtime/coi-policy.mjs
```

```js
export const CANONICAL_COI_HEADERS = Object.freeze({
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
});
```

Vite 설정과 Electron Server가 서로 복사한 상수를 따로 유지하면 Drift Gate를 추가해야 한다.

## 18.2 Dev Boot Probe

`npm run dev:renderer`가 Ready된 뒤 Headless Browser에서 다음을 검사한다.

```text
window.crossOriginIsolated === true
typeof SharedArrayBuffer === 'function'
```

## 18.3 Preview Boot Probe

`vite preview`에서도 동일하게 검사한다.

## 18.4 Electron Probe

Electron `BrowserWindow` 내부에서도 동일하게 검사한다.

```text
window.crossOriginIsolated === true
```

## 18.5 외부 배포

Cloudflare Pages·Workers 등 외부 Web 배포가 있다면 동일 Header가 필요하다.

본 명세의 Electron 승격은 외부 Web 배포 승격을 자동으로 의미하지 않는다.

---

# 19. Child Worker Lifecycle Telemetry

## 19.1 Telemetry SSOT

Pthread Glue 내부에 직접 패치를 넣지 않더라도 Parent Worker Runtime은 다음을 측정해야 한다.

```text
poolRequested
poolReadyAt
parentWorkerGeneration
childBootstrapRoute
childBootstrapSha256
moduleReadyAt
moduleDisposedAt
terminateAllThreadsCalled
parentWorkerTerminatedAt
```

## 19.2 Runtime Measurement

가능하면 Worker 생성 API를 Generation Scope에서 Instrument해 다음을 측정한다.

```text
childWorkerCreatedCount
childWorkerTerminatedCount
childWorkerErrorCount
childWorkerMessageErrorCount
```

Measurement가 불가능하면 `measured=false`를 기록하고 Generation 종료 후 Process-level Worker Handle Snapshot으로 독립 검증한다.

## 19.3 Ready Timing

다음 구간을 분리한다.

```text
Parent Worker Spawn
→ Control HELLO
→ MODJPEG Module Import
→ Shared Memory Create
→ Child Pool Allocate
→ Child Pool WASM Ready
→ Worker READY
```

## 19.4 Cleanup Timing

```text
Dispose Requested
→ Active Job Abort
→ terminateAllThreads
→ Child Count 0
→ Parent Worker Terminate
```

Cleanup Deadline은 EW02 Cancel Grace와 별도 Receipt로 기록한다.

---

# 20. Error Registry

본 명세는 최소 다음 Stable Error를 추가한다.

```text
E_MODJPEG_ARTIFACT_GLUE_HASH_MISMATCH
E_MODJPEG_ARTIFACT_WASM_HASH_MISMATCH
E_MODJPEG_ARTIFACT_LENGTH_MISMATCH
E_MODJPEG_ARTIFACT_POLICY_MISMATCH
E_MODJPEG_COI_REQUIRED
E_MODJPEG_SHARED_ARRAY_BUFFER_UNAVAILABLE
E_MODJPEG_SHARED_MEMORY_CREATE_FAILED
E_MODJPEG_SHARED_MEMORY_CONTRACT_MISMATCH
E_MODJPEG_PTHREAD_POOL_SIZE_MISMATCH
E_MODJPEG_PTHREAD_POOL_NOT_READY
E_MODJPEG_PTHREAD_CHILD_BOOTSTRAP_MISSING
E_MODJPEG_PTHREAD_CHILD_ROUTE_MISSING
E_MODJPEG_PTHREAD_CHILD_ROUTE_HASH_MISMATCH
E_MODJPEG_PTHREAD_CHILD_ROUTE_COI_MISMATCH
E_MODJPEG_PTHREAD_CHILD_ROUTE_MIME_MISMATCH
E_MODJPEG_PTHREAD_CHILD_BOOT_FAILED
E_MODJPEG_PTHREAD_CHILD_COUNT_MISMATCH
E_MODJPEG_PTHREAD_CHILD_LEAK
E_MODJPEG_PTHREAD_TERMINATION_UNVERIFIED
E_MODJPEG_GENERATION_CLOSURE_FAILED
E_MODJPEG_OLD_GENERATION_CHILD_ALIVE
E_MODJPEG_ABI_SYMBOL_MISSING
E_MODJPEG_ABI_OUTPUT_STRUCT_INVALID
E_MODJPEG_ABI_POINTER_OUT_OF_RANGE
E_MODJPEG_ABI_ALLOCATION_LEAK
E_MODJPEG_ABI_FREE_MISMATCH
E_MODJPEG_OUTPUT_NONDETERMINISTIC
E_MODJPEG_OUTPUT_SHA_CONSERVATION_FAILED
E_MODJPEG_BASELINE_MODE_MISMATCH
E_MODJPEG_SAMPLING_444_MISMATCH
E_MODJPEG_COMPONENT_COUNT_MISMATCH
E_MODJPEG_PRECISION_MISMATCH
E_MODJPEG_JFIF_CARDINALITY_MISMATCH
E_MODJPEG_ICC_SEQUENCE_MISMATCH
E_MODJPEG_EOI_TRAILING_BYTES
E_MODJPEG_DEV_COI_HEADER_MISSING
E_MODJPEG_PREVIEW_COI_HEADER_MISSING
E_MODJPEG_ELECTRON_COI_HEADER_MISSING
E_MODJPEG_CORS_CONFUSED_WITH_COI
E_MODJPEG_RAW_LEGACY_BOOTSTRAP_FORBIDDEN
E_MODJPEG_BLOB_CHILD_BOOTSTRAP_FORBIDDEN
E_MODJPEG_RUNTIME_CAPABILITY_UNAVAILABLE
E_MODJPEG_CANONICAL_ADOPTION_RECEIPT_MISSING
E_MODJPEG_CANONICAL_ADOPTION_NOT_VERIFIED
```

---

# 21. 정적 Gate

최소 78개 Gate를 구현한다.

## Artifact Gate

1. Glue 파일 존재
2. WASM 파일 존재
3. Glue SHA 정확
4. WASM SHA 정확
5. Glue Byte Length 정확
6. WASM Byte Length 정확
7. Artifact Policy ID 정확
8. Source Artifact 변경 0

## Vite COI Gate

9. `server.headers` 존재
10. Dev COOP 정확
11. Dev COEP 정확
12. Dev CORP 정확
13. `preview.headers` 존재
14. Preview COOP 정확
15. Preview COEP 정확
16. Preview CORP 정확
17. CORS Header를 COI 대체로 사용하지 않음
18. Electron Header 정책과 정적 동일성 또는 Digest Parity

## Shared Memory Gate

19. `SharedArrayBuffer` Admission 존재
20. `crossOriginIsolated` Admission 존재
21. Shared Memory `shared:true`
22. Initial Page 4096
23. Maximum Page 32768
24. Generation Singleton 존재
25. Renderer Main Thread Shared Memory 생성 0
26. 다른 Encoder와 Memory 공유 0

## Pthread Gate

27. `pthreadPoolSize=8` 확인
28. Child Worker Type module
29. Child Worker Name em-pthread
30. `mainScriptUrlOrBlob` 문자열 URL 사용
31. Blob Bootstrap 금지
32. `terminateAllThreads` Dispose 호출
33. Worker Runtime Dispose 연결
34. Broker Hard Restart 연결
35. Old Generation 재사용 금지
36. Pool 존재와 실제 Encode Thread Count 분리

## Closure Gate

37. Parent Worker Entry Mapping
38. Handler Mapping
39. Adapter Mapping
40. Parent Module Projection Mapping
41. Child Bootstrap Projection Mapping
42. WASM Mapping
43. Child Bootstrap Route 존재
44. Child Bootstrap Route Source Identity 존재
45. Child Bootstrap Route SHA 존재
46. WASM Route SHA 존재
47. Raw Legacy Bootstrap 0
48. Ownership Conflict 0
49. Orphan Executable 0
50. Pthread Closure Digest 존재

## ABI Gate

51. `_encode_mozjpeg_RGB` 요구
52. `_jpgbuffer_ptr` 요구
53. `_jpgbuffer_len` 요구
54. `_jpgbuffer_free` 요구
55. `_malloc` 요구
56. `_free` 요구
57. Output Struct 8 Byte 계약
58. RGB8 Input 계약
59. Product Operation이 다른 ABI에 도달하지 않음
60. Cleanup `finally` 존재

## Output Gate

61. Baseline Sequential 요청
62. 4:4:4 요청
63. Precision 8 검증
64. Component 3 검증
65. SOF0 검증
66. SOF2 거부
67. Y 1x1 검증
68. Cb 1x1 검증
69. Cr 1x1 검증
70. JFIF 정확히 1
71. ICC Sequence 검증
72. EOI Exact EOF
73. Worker Output SHA
74. Post-worker Mutation 0

## Receipt·Policy Gate

75. `canonicalPthreadArtifact=true`
76. `canonicalSingleThread=false`
77. `pthreadPoolSize=8`
78. `sharedMemory=true`
79. `threadMode` 정규값
80. EP03 Single-thread Blocker 제거
81. BUILD-EMIT Closure에 Child Role 포함
82. Promotion Profile이 Pthread Artifact를 허용
83. Independent Decoder 미완료 상태 분리
84. Rollback Artifact SHA 고정

---

# 22. Runtime Test Matrix

최소 124개 Runtime Test를 구현한다.

## COI 18개

- Dev index COI
- Dev Worker COI
- Dev Child Bootstrap COI
- Dev WASM COI
- Preview index COI
- Preview Worker COI
- Preview Child Bootstrap COI
- Preview WASM COI
- Electron index COI
- Electron Worker COI
- Electron Child Bootstrap COI
- Electron WASM COI
- COOP 누락 실패
- COEP 누락 실패
- CORP 정책 Drift 탐지
- CORS-only 실패
- 404 COI Header
- Encoded Traversal 403 COI Header

## Artifact 12개

- Glue Hash PASS
- WASM Hash PASS
- Glue Hash Tamper
- WASM Hash Tamper
- Glue Length Tamper
- WASM Length Tamper
- Artifact Missing
- Manifest Self Digest
- Source Route·Emitted Route 관계
- Clean Build A Artifact Identity
- Clean Build B Artifact Identity
- A/B Artifact Byte Parity

## Child Closure 20개

- Pool 8 Allocation
- Pool 8 Module Ready
- Pool 7 실패
- Pool 9 실패
- Child Bootstrap 404
- Child Bootstrap Wrong MIME
- Child Bootstrap Wrong SHA
- Child Bootstrap COI 누락
- WASM 404
- WASM Wrong MIME
- WASM Wrong SHA
- Raw Legacy Bootstrap 거부
- Blob Bootstrap 거부
- Parent Projection 존재
- Child Projection 존재
- Ownership Conflict 거부
- Orphan Child Artifact 거부
- Dynamic Chunk Missing
- Closure Digest Determinism
- Build A/B Closure Parity

## Shared Memory 14개

- SharedArrayBuffer 존재
- SharedArrayBuffer 부재
- crossOriginIsolated true
- crossOriginIsolated false
- Initial Bytes 정확
- Maximum Bytes 정확
- shared true
- Generation당 Memory 1개
- Job 100회 Memory 재사용
- Generation 교체 후 새 Memory
- Old Memory 비도달
- Growth Receipt
- Maximum 초과 실패
- Worker 간 Memory 비공유

## ABI 18개

- 모든 Symbol 존재
- Symbol 하나씩 누락 6개
- RGB Pointer Valid
- RGB Pointer Invalid
- Output Struct Valid
- Output Pointer Zero
- Output Length Zero
- Output Range Overflow
- Encode Return False
- `jpgbuffer_free` 정확히 1회
- RGB `_free` 정확히 1회
- Output Struct `_free` 정확히 1회
- Encode 100회 Allocation 0
- Output Copy Free 이후 보존
- Quality 1
- Quality 100

## Output 24개

- SOI
- SOF0
- SOF2 거부
- Precision 8
- Component 3
- Y 1x1
- Cb 1x1
- Cr 1x1
- 4:2:0 변조 거부
- 4:2:2 변조 거부
- JFIF 1
- JFIF 0 거부
- JFIF 2 거부
- DPI X
- DPI Y
- ICC 없음
- ICC 단일 Segment
- ICC 다중 Segment
- ICC 순서 변조
- SOS 1
- EOI 1
- EOI 뒤 Byte 거부
- Same Generation 100회 SHA 동일
- Cross Generation 20회 SHA 동일

## Lifecycle 18개

- Normal Dispose
- Dispose 중 Idle
- Dispose 중 Active Job
- Cooperative Cancel
- Hard Cancel
- Execution Timeout
- Parent Crash
- Child Crash
- Module Init 실패
- Child Module Load 실패
- Old Parent 0
- Old Child 0
- New Generation Pool 8
- Queued Job 재개
- Active Job 재실행 금지
- Generation 100회 Leak 0
- App Relaunch 5회 Leak 0
- Runtime Shutdown Closure

---

# 23. Promotion Receipt

파일:

```text
artifacts/modjpeg/TDT_MODJPEG_01_CANONICAL_ADOPTION_RECEIPT.json
```

필수 구조:

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-MODJPEG-01",
  "state": "EXISTING_PTHREAD_ARTIFACT_CANONICALLY_ADOPTED",
  "promotionEligible": true,
  "buildId": "...",
  "packageContentId": "...",
  "artifactPolicyId": "dadum.modjpeg.existing-pthread-canonical-v1",
  "glueArtifactSha256": "6c951106e5cc2b68b06b8f6290e448a892c2a31da017f3c5946f5fb7903b6166",
  "wasmArtifactSha256": "6f669d33e1d7f47f95ca14c4562bbb55985942f5c43a01521aeb6f01dd2e0a14",
  "canonicalPthreadArtifact": true,
  "canonicalSingleThread": false,
  "pthreadPoolSize": 8,
  "sharedMemory": true,
  "crossOriginIsolationVerified": true,
  "devCoiVerified": true,
  "previewCoiVerified": true,
  "electronCoiVerified": true,
  "childWorkerClosureVerified": true,
  "childWorkerClosureDigest": "...",
  "abiPreserved": true,
  "baseline444OutputVerified": true,
  "byteDeterminismVerified": true,
  "generationClosureVerified": true,
  "blockers": [],
  "selfDigest": "..."
}
```

---

# 24. 기존 보고서 교정

다음 보고서는 새 정책으로 다시 발급해야 한다.

```text
TDT_EXPORT_WORKER_06_PTHREAD_RETIREMENT_REPORT.json
TDT_EXPORT_WORKER_06_MODJPEG_ARTIFACT_REPORT.json
TDT_EXPORT_PROMOTION_03_MODJPEG_ARTIFACT_REPORT.json
TDT_EXPORT_PROMOTION_03_CROSS_FORMAT_E2E_RECEIPT.json
```

## 24.1 새 보고서 의미

기존 `PTHREAD_RETIREMENT_REPORT`는 다음 이름으로 교체한다.

```text
TDT_MODJPEG_01_PTHREAD_RUNTIME_CONTRACT_REPORT.json
```

기존 Blocker:

```text
modjpeg-pthread-pool-not-zero
modjpeg-pthread-symbols-present
modjpeg-child-worker-reference-present
modjpeg-shared-memory-present
modjpeg-single-thread-rebuild-not-run
```

는 제거한다.

새 Blocker:

```text
modjpeg-coi-not-verified
modjpeg-child-worker-closure-not-verified
modjpeg-pthread-pool-runtime-not-verified
modjpeg-generation-closure-not-verified
modjpeg-output-identity-not-verified
```

---

# 25. Rollback 계약

Rollback은 Artifact Pair 단위다.

```text
Glue SHA
+ WASM SHA
+ Runtime Worker Manifest
+ Emitted Child Closure
+ Package Content ID
```

Glue만 이전 버전으로 내리거나 WASM만 바꾸는 Rollback은 금지한다.

Rollback 후에도 다음이 다시 검증돼야 한다.

- COI
- Pool 8
- Child Closure
- ABI
- Baseline 4:4:4
- Output SHA Conservation
- Generation Cleanup

---

# 26. 적용 순서

```text
01 Existing Artifact Adoption Manifest 추가
02 Vite Dev·Preview COI Header 추가
03 Electron COI Policy와 Header SSOT 통합
04 MODJPEG Adapter Promotion State 교정
05 Runtime Worker Manifest Policy 교정
06 BUILD-EMIT Child Bootstrap Projection 추가
07 Pthread Runtime Telemetry 추가
08 Dispose·Crash Child Closure Receipt 추가
09 EP03 Single-thread Gate 제거
10 MODJPEG Existing Artifact Gate 추가
11 Baseline 4:4:4 Byte Identity Corpus 실행
12 Electron Packaged Route Probe 실행
13 Canonical Adoption Receipt 발급
```

---

# 27. 완료 조건

다음이 모두 참일 때만 완료다.

```text
Artifact SHA Pinned
Vite Dev COI PASS
Vite Preview COI PASS
Electron COI PASS
crossOriginIsolated true
SharedArrayBuffer available
Shared Memory Contract PASS
Pthread Pool 8 Ready
Child Bootstrap Route Closure PASS
Child Bootstrap Body SHA PASS
WASM Route SHA PASS
ABI Symbol PASS
Baseline 4:4:4 PASS
Repeated Output SHA PASS
Cancel Closure PASS
Crash Closure PASS
Dispose Closure PASS
Old Generation Child Count 0
Promotion Receipt PASS
```

---

# 28. 최종 판정

본 명세의 핵심 판정은 다음이다.

```text
현재 MODJPEG pthread Artifact는
재빌드해야 하는 임시 물건이 아니다.

고정 SHA를 가진 기존 제품 Candidate이며,
Vite·Electron COI와 Child Worker Closure를
실제로 증명하면 Canonical Artifact로 승격할 수 있다.
```

즉 다음 식이 성립해야 한다.

```text
Existing Artifact Identity
+ Cross-Origin Isolation
+ Shared Memory Contract
+ Pthread Child Closure
+ Stable ABI
+ Baseline 4:4:4 Output Identity
+ Generation Cleanup
= Canonical MODJPEG Adoption
```

---

# 29. 필수 산출물

1. `TDT_MODJPEG_01_ARTIFACT_ADOPTION_MANIFEST.json`
2. `TDT_MODJPEG_01_COI_CONFIG_REPORT.json`
3. `TDT_MODJPEG_01_DEV_COI_ROUTE_REPORT.json`
4. `TDT_MODJPEG_01_PREVIEW_COI_ROUTE_REPORT.json`
5. `TDT_MODJPEG_01_ELECTRON_COI_ROUTE_REPORT.json`
6. `TDT_MODJPEG_01_CHILD_WORKER_CLOSURE_REPORT.json`
7. `TDT_MODJPEG_01_SHARED_MEMORY_REPORT.json`
8. `TDT_MODJPEG_01_PTHREAD_RUNTIME_CONTRACT_REPORT.json`
9. `TDT_MODJPEG_01_ABI_PRESERVATION_REPORT.json`
10. `TDT_MODJPEG_01_BASELINE_444_OUTPUT_REPORT.json`
11. `TDT_MODJPEG_01_OUTPUT_IDENTITY_REPORT.json`
12. `TDT_MODJPEG_01_GENERATION_CLOSURE_REPORT.json`
13. `TDT_MODJPEG_01_CANONICAL_ADOPTION_RECEIPT.json`
14. `TDT_MODJPEG_01_FIX_RECEIPT.json`
15. `TDT_MODJPEG_01_SOURCE_BAKE_SEAL_PAYLOAD.json`
16. `TDT_MODJPEG_01_FILE_INVENTORY.sha256`

---

# 30. 다음 단계

```text
TDT-NATIVE-DECODER-01

Native Raster Decoder Release Addon /
PNG·WebP·JPEG Independent Decode /
JPEG Quality Corpus /
Package ABI·Architecture /
Decode Receipt Seal
```

MODJPEG Existing Artifact가 Canonical Adoption을 통과하면 JPEG 쪽 남은 제품 승격 Blocker는 Single-thread 재빌드가 아니라 **독립 Native Decoder와 실제 Quality Corpus**다.
