# TDT-JXL-CODEC-01

## JXL Encode-Decode Runtime Closure / `jxl_encode_qmap_ex()` ABI Preservation / Independent RGBA8·Hidden RGB Round-trip / Container Metadata / Pthread Generation Closure Seal

---

## 0. 문서 제어

| 항목 | 값 |
|---|---|
| Spec ID | `TDT-JXL-CODEC-01` |
| Spec Version | `1.0.0` |
| Target Product Profile | `dadum.jxl-lossless-rgba8-production-v1` |
| Parent Lineage | `R7 → EW01~EW07 → EP01~EP03 → BUILD-LOCK-01 → BUILD-EMIT-01 → MODJPEG-01 → NATIVE-DECODER-01` |
| Stable Encoder ABI | `jxl_encode_qmap_ex()` |
| Encoder Worker | `dadum.worker.encoder.jxl-canonical-v1` |
| Decoder Worker | `dadum.worker.decoder.jxl-independent-v1` |
| Encoder Operation | `encode.jxl-lossless` |
| Decoder Operation | `decode.jxl-rgba8-exact` |
| Promoted Sample Surface | `rgba8unorm-u8-v1` |
| Promotion Unit | Whole build |
| Default Failure Policy | Fail closed |

### 0.1 이 명세의 목적

EW05는 JXL 인코딩을 Dedicated Worker로 옮기고 `jxl_encode_qmap_ex()` ABI, 8-bit Lossless, Container 구조, Resolution Metadata, Output SHA를 소스 권위로 봉인했다.

그러나 현재 소스는 다음 세 증거를 여전히 `false`로 기록한다.

```text
independentDecodeVerified = false
hiddenRgbVerified        = false
pthreadClosureVerified   = false
```

이 명세의 목적은 JXL Encoder를 다시 설계하는 것이 아니다. 이미 존재하는 Encoder ABI와 Artifact를 그대로 유지하면서, 독립 Decoder와 실제 Exact Round-trip, Hidden RGB, Container Metadata, pthread Generation Closure를 제품 승격 사슬에 결속하는 것이다.

### 0.2 최종 권위선

```text
Authoritative RGBA8 Final Surface
→ JXL Encode Plan v1
→ dadum.worker.encoder.jxl-canonical-v1
→ jxl_encode_qmap_ex()
→ Worker-local JXL Container Finalizer
→ Encoder Output SHA-256
→ Electron Atomic Save
→ Disk SHA-256
→ dadum.worker.decoder.jxl-independent-v1
→ separate jxl_wgpu_bridge WASM
→ Exact RGBA8 Decode
→ Full RGBA Byte Comparison
→ Hidden RGB Comparison
→ Container Metadata Comparison
→ Pthread Generation Closure
→ JXL Codec Promotion Receipt
```

---

## 1. 현재 소스 감사 결과

### 1.1 Encoder 권위는 이미 Dedicated Worker에 있다

현재 Encoder 권위는 다음과 같다.

```text
workerId               dadum.worker.encoder.jxl-canonical-v1
codecProtocolVersion   dadum-jxl-canonical-worker-v1
operation              encode.jxl-lossless
ABI                    jxl_encode_qmap_ex
output free ABI        jxl_free
pthread pool           4
promoted bit depth     8
lossless only          true
```

현재 Encoder Adapter는 `_jxl_encode_qmap_ex`, `_jxl_free`, `_malloc`, `_free`를 사용하고, 모든 포인터 정리를 `finally`에서 수행한다.

### 1.2 현재 Encoder Artifact

```text
jxl_bindings.mjs
SHA-256 ed383c356823f11ec272c996b77cde7a5ddaae598cbd3bf8544854fdda91e

jxl_bindings.wasm
SHA-256 2536b058983c2fbc14d37f438a742fa01ed24c2b06951b8552d7f7830c560f31
```

Generated Glue는 `pthreadPoolSize=4`, `shared:true` WebAssembly Memory, 최대 32768 pages를 포함한다.

### 1.3 현재 Independent Decoder Artifact

```text
jxl_wgpu_bridge.js
SHA-256 28e848c7503e29286db47827819402363990f82d3574ba7451b3a62c8b8ca8b2

jxl_wgpu_bridge_bg.wasm
SHA-256 0f2524ed35343520f3492dea6a12cf50ea3d1d25023b0617ded65beff8bab7b3
```

Decoder WASM SHA는 Encoder WASM SHA와 다르다. 따라서 Artifact 수준의 독립성 후보는 존재한다.

### 1.4 현재 Independent Decoder 경로는 Exact RGBA8 검증 경로가 아니다

현재 `decodeJxlSurface()`는 동시에 다음을 수행한다.

```text
decodeJxlToImageBitmap()
decodeJxlToRgba16fBytes()
readSourceResolutionFromFile()
```

문제점:

1. Preview 경로가 `document.createElement("canvas")`와 `createImageBitmap()`에 의존한다.
2. Exact 검증 결과가 RGBA8이 아니라 RGBA16F Half-float Surface로 귀속된다.
3. Alpha 0 영역의 Hidden RGB가 Canvas 또는 변환 단계에서 유지됐는지 증명할 수 없다.
4. `DecodedImage.free()`가 제공되지만 현재 Wrapper는 명시적으로 호출하지 않는다.
5. Decoder가 Dedicated Worker가 아니라 Renderer Realm에서 호출될 수 있다.
6. Registry는 JXL Decoder Source가 존재한다는 이유만으로 무조건 등록한다.

따라서 이 경로는 Preview·Import 경로로는 유지할 수 있지만, 독립 Exact Validation SSOT로 사용할 수 없다.

### 1.5 현재 pthread Dispose 증거가 불완전하다

현재 Encoder Dispose는 다음만 수행한다.

```text
_clear_export_cache()
modulePromise = null
wasmArtifactSha256Promise = null
```

그러나 다음은 증명되지 않는다.

- Emscripten Child Worker 4개 종료
- `PThread.terminateAllThreads()` 또는 동등한 강제 종료
- Old Shared Memory 참조 해제
- Old Worker Generation Message 차단
- Native call 중 Cancel·Timeout·Crash 종료

### 1.6 현재 Export Receipt는 Round-trip PASS를 요구하지 않는다

현재 Runtime Export Authority는 JXL ABI, Lossless 파라미터, pthread pool 4, Container, Mutation 0을 검사하지만 다음을 `true`로 강제하지 않는다.

```text
independentDecodeVerified
hiddenRgbVerified
pthreadClosureVerified
```

이 명세에서는 세 필드를 제품 승격 필수 조건으로 변경한다.

---

## 2. 범위

### 2.1 포함 범위

- 기존 `jxl_encode_qmap_ex()` ABI 보존
- 8-bit RGBA Lossless 제품 프로필
- Existing pthread pool 4 Encoder Artifact 채택
- Dedicated Independent Decoder Worker
- Separate Decoder WASM Attestation
- Exact RGBA8 Round-trip
- Alpha 0 Hidden RGB Exactness
- Container 구조 및 Resolution Metadata 검증
- Same-generation·Cross-generation·Relaunch Output Identity
- Encoder pthread Child Worker Generation Closure
- Export·Save·Decode SHA Conservation
- Promotion Receipt와 Capability Admission

### 2.2 제외 범위

- `jxl_encode_qmap_ex()` 삭제 또는 ABI 변경
- `jxl_encode_qmap_layers_ex()` 퇴역
- JXL Encoder 재작성
- Encoder Artifact 재빌드
- RGBA16 제품 승격
- HDR RGBA16F Exact Round-trip 승격
- Lossy JXL
- Custom ICC Embedding
- Browser Canvas 기반 Independent Validation
- Encoder Library를 Decoder로 재사용

### 2.3 후속 분리

RGBA16은 다음 별도 명세로 분리한다.

```text
TDT-JXL-CODEC-02
RGBA16LE ABI Fixture /
Endian /
Exact U16 Round-trip /
16-bit Container Color Encoding Seal
```

---

## 3. SSOT 귀속

| 권위 | SSOT |
|---|---|
| Encoder ABI | `app/legacy-runtime/encoders/jxl-canonical-adapter.mjs` |
| Encode Plan | `app/src/runtime/codecs/jxl/jxl-encode-plan-v1.ts` |
| Encoder Worker Identity | Runtime Worker Manifest |
| Decoder Artifact Identity | JXL Decoder Attestation Receipt |
| Decoder Worker Identity | Runtime Worker Manifest |
| Exact Decoded Surface | JXL Independent Decoder Adapter |
| Container Structure | `dadum.jxl-container-structure-v2` |
| Resolution Metadata | Independent JXL Metadata Verifier |
| Round-trip Comparison | JXL Round-trip Validation Service |
| pthread Generation | Worker Broker Generation Ledger |
| Product Admission | JXL Codec Promotion Receipt |
| Production Activation | Whole-build Promotion Pointer |

### 3.1 금지되는 다중 권위

- Renderer Canvas 결과를 Exact Decode Surface로 사용 금지
- Preview ImageBitmap을 Independent Validation 결과로 사용 금지
- Encoder Evidence의 자기 선언만으로 Round-trip PASS 금지
- Source File 존재만으로 Decoder Registry 등록 금지
- Structure Verifier 하나만으로 Pixel Round-trip PASS 금지
- Browser Decoder Fallback으로 Independent Decoder PASS 금지

---

## 4. Runtime Architecture

### 4.1 Encoder Worker

```text
workerId               dadum.worker.encoder.jxl-canonical-v1
controlProtocol        dadum-worker-control-v1
codecProtocol          dadum-jxl-canonical-worker-v1
rpcProtocol            dadum-worker-rpc-v1
operation              encode.jxl-lossless
pthreadPoolSize        4
```

### 4.2 Independent Decoder Worker

새 Worker를 추가한다.

```text
workerId               dadum.worker.decoder.jxl-independent-v1
controlProtocol        dadum-worker-control-v1
codecProtocol          dadum-jxl-independent-decoder-worker-v1
rpcProtocol            dadum-worker-rpc-v1
operation              decode.jxl-rgba8-exact
```

권장 파일:

```text
app/src/runtime/workers/entries/jxl-independent-decoder.worker.ts
app/legacy-runtime/worker-codecs/jxl-independent-decoder-handler.mjs
app/legacy-runtime/decoders/jxl-independent-decoder-adapter.mjs
app/src/runtime/codecs/jxl/jxl-roundtrip-validation-service.ts
app/src/runtime/codecs/jxl/jxl-metadata-verifier-v1.ts
```

### 4.3 Broker 구조

Encoder와 Decoder는 동일 RPC Envelope 규칙을 사용하되, Facade를 분리한다.

```text
WorkerRpcBrokerCore
├─ EncoderWorkerBrokerService
└─ DecoderWorkerBrokerService
```

Decoder Operation은 Encoder Allowlist에 섞지 않는다.

### 4.4 Decoder Worker Artifact Set

최소 Artifact:

```text
jxl-independent-decoder.worker.js
jxl-independent-decoder-handler chunk
jxl-independent-decoder-adapter chunk
jxl_wgpu_bridge.js
jxl_wgpu_bridge_bg.wasm
```

Encoder Artifact Set과 Decoder Artifact Set은 Path·SHA·Closure Digest가 모두 달라야 한다.

---

## 5. Encoder ABI Preservation

### 5.1 Stable ABI

다음 ABI는 삭제·Stub·대체하지 않는다.

```c
jxl_encode_qmap_ex(...)
jxl_encode_qmap_layers_ex(...)
jxl_free(void*)
```

제품 경로는 `jxl_encode_qmap_ex()`만 호출한다.

### 5.2 Canonical Argument Contract

```text
srcPtr
width
height
bitDepth = 8
isLinear = 0 | 1
effort = 1..9
lossless = 1
threads = 1..4
distance = 0
quality = 100
epf = 0..3
tile = 8..1024
outSizePtr
```

Argument 순서는 `JxlEncodeAbiCallV1` typed tuple 또는 frozen object 하나로만 생성한다.

### 5.3 Memory Ownership

```text
RGBA source      _malloc / _free
output size      _malloc / _free
encoded output   jxl_encode_qmap_ex / jxl_free
JS result        independent Uint8Array copy
```

어떤 오류 경로에서도 위 세 Native Allocation이 남아서는 안 된다.

### 5.4 Product Capability

```text
inputStorage     rgba8unorm | rgba8unorm-srgb
inputBitDepth    8
lossless         true
distance         0
quality          100
customICC        unsupported
```

---

## 6. Independent Exact Decoder Surface

### 6.1 Preview 경로와 검증 경로 분리

Preview Import Path는 기존 `decodeJxlSurface()`를 유지할 수 있다.

Independent Validation Path는 다음을 금지한다.

- `document.createElement()`
- Canvas 2D
- `createImageBitmap()`
- Browser color management
- Premultiply·Unpremultiply
- RGBA16F 중간 변환

### 6.2 Decoder 호출

```text
decode_jxl_ex(input, OutputKind.Rgba8, false)
```

Decoder는 결과를 즉시 JS-owned `Uint8Array`로 복사한 뒤 `DecodedImage.free()`를 `finally`에서 호출한다.

### 6.3 Exact Surface Schema

```ts
interface JxlExactDecodedSurfaceV1 {
  surfaceId: 'dadum.jxl-decoded-rgba8-exact-v1';
  decoderId: 'dadum.decoder.jxl-independent-v1';
  width: number;
  height: number;
  storage: 'rgba8unorm';
  sampleEncoding: 'rgba8unorm-u8-v1';
  channelOrder: 'rgba';
  alphaMode: 'straight';
  rowStrideBytes: number;
  pixelBytes: Uint8Array;
  sourceByteLength: number;
  sourceSha256: string;
  pixelSha256: string;
  decoderArtifactSha256: string;
  decoderArtifactSetDigest: string;
}
```

### 6.4 Validation

```text
rowStrideBytes = width * 4
pixelBytes.length = width * height * 4
alphaMode = straight
```

어느 하나라도 다르면 Decoder 결과를 등록하지 않는다.

---

## 7. Independent Decoder Attestation

### 7.1 Attestation 입력

- Decoder JS SHA-256
- Decoder WASM SHA-256
- Decoder Worker Entry SHA-256
- Emitted Artifact Set Digest
- WASM Export Set Digest
- WASM Import Set Digest
- Encoder WASM SHA-256

### 7.2 독립성 판정

다음을 모두 만족해야 한다.

```text
decoderWasmSha256 != encoderWasmSha256
decoderWorkerId   != encoderWorkerId
decoderHeap       != encoderHeap
decoderModule     != encoderModule
decoderOutput     does not alias encoder output
```

### 7.3 Registry Admission

현재처럼 Source가 존재한다는 이유만으로 JXL Decoder를 무조건 등록하지 않는다.

```text
Decoder Artifact Attestation PASS
→ Decoder Worker READY PASS
→ Exact Surface Self-test PASS
→ Registry Admission
```

---

## 8. Exact Round-trip Corpus

### 8.1 Opaque Fixture

- RGB Gradient
- High-frequency checker
- Flat field
- Near-black values
- Near-white values

### 8.2 Alpha Fixture

Alpha 값:

```text
0, 1, 127, 128, 254, 255
```

### 8.3 Hidden RGB Fixture

Alpha 0인 픽셀에 서로 다른 RGB 값을 넣는다.

예:

```text
(255, 0, 0, 0)
(0, 255, 0, 0)
(0, 0, 255, 0)
(17, 33, 65, 0)
```

Decoder가 Alpha 0 영역의 RGB를 0으로 지우거나 Premultiply하면 즉시 실패한다.

### 8.4 Dimension Fixture

```text
1x1
1x17
19x1
3x5
17x19
255x257
```

### 8.5 비교 규칙

비교는 모든 RGBA Byte에 대해 수행한다.

```text
expected[i] === decoded[i]
```

Mismatch Receipt:

- First mismatch byte index
- Pixel X·Y
- Channel R·G·B·A
- Expected byte
- Actual byte
- Expected pixel digest
- Actual pixel digest

---

## 9. Container Metadata Truth

### 9.1 Canonical Container

모든 제품 출력은 JXL Container다.

필수:

- Signature Box
- `ftyp` exactly one
- `jxlc` exactly one 또는 ordered `jxlp`
- `Exif` exactly one
- `xml ` exactly one
- Exact EOF

### 9.2 Independent Metadata Verification

Encoder Finalizer가 작성한 Metadata를 Encoder Evidence만으로 승인하지 않는다.

별도 `JxlMetadataVerifierV1`이 Disk Byte를 다시 파싱한다.

검증:

- Exif XResolution
- Exif YResolution
- Exif ResolutionUnit
- XMP resolution fields
- Runtime requested DPI
- Container box cardinality
- Carrier ordering

### 9.3 Color Encoding

```text
isLinear = false → srgb
isLinear = true  → linear-srgb
```

Custom ICC는 계속 `E_JXL_CUSTOM_ICC_UNSUPPORTED`로 닫는다.

---

## 10. Output Identity

### 10.1 반복 횟수

```text
Same Encoder Worker Generation   100회
New Encoder Worker Generation     20회
Application Relaunch               5회
```

### 10.2 동일성 대상

- Encoder output byte length
- Encoder output SHA-256
- Container structure digest
- Metadata digest
- Decoder pixel byte length
- Decoder pixel SHA-256

### 10.3 Determinism 조건

다음이 모두 같을 때만 Byte Identity를 요구한다.

- Encoder Artifact
- Input RGBA
- Width·Height
- isLinear
- Effort
- EPF
- Tile
- Thread count
- Resolution Metadata
- Build ID

---

## 11. pthread Generation Closure

### 11.1 Canonical pthread 계약

```text
pthreadPoolSize      4
sharedMemory         true
crossOriginIsolated  true
```

pthread는 제거 대상이 아니다. 기존 Encoder Artifact의 제품 계약이다.

### 11.2 Child Worker Tracking

Encoder Module 초기화 동안 생성된 모든 `em-pthread` Worker를 해당 Encoder Worker Generation Ledger에 등록한다.

Ledger 필드:

- Runtime Epoch
- Worker Epoch
- Generation ID
- Child Worker Count
- Child Worker URLs
- Shared Memory Byte Length
- Created At
- Terminated At
- Termination Reason

### 11.3 Dispose 순서

```text
Reject new jobs
→ Abort active boundary signal
→ If native call active: terminate parent Worker
→ terminate tracked child Workers
→ clear export cache
→ clear module references
→ clear Shared Memory references
→ emit DISPOSED evidence
```

### 11.4 Native call 중 Cancel

`jxl_encode_qmap_ex()` 호출은 동기 Native call이므로 중간 Cooperative Cancel을 주장하지 않는다.

```text
cancelabilityClass = worker-termination-required-during-native-call
```

Native call 중 Cancel·Timeout·Crash는 Parent Worker Generation 전체를 종료한다.

### 11.5 Closure PASS

```text
oldGenerationChildWorkersAlive = 0
oldSharedMemoryReachable        = false
staleResultAccepted             = false
newGenerationPthreadPoolSize    = 4
```

---

## 12. COI Runtime Contract

다음 환경이 동일 COI 정책을 가져야 한다.

- Vite Dev
- Vite Preview
- Electron Production Static Server

필수 헤더:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

실제 Runtime 조건:

```text
crossOriginIsolated === true
typeof SharedArrayBuffer === function
shared WebAssembly.Memory creation succeeds
```

CORS `*`만으로는 PASS하지 않는다.

---

## 13. Receipt Conservation

### 13.1 SHA Conservation

```text
Encoder Input RGBA SHA
= Round-trip Expected Pixel SHA

Encoder Worker Output SHA
= Runtime Received SHA
= Electron Host Stream SHA
= Temporary File SHA
= Final Disk SHA
= Independent Decoder Input SHA
```

### 13.2 필수 Promotion Evidence

```text
jxlEncoderAbiVerified          true
jxlEncoderArtifactVerified     true
jxlDecoderArtifactVerified     true
jxlDecoderIndependenceVerified true
jxlExactRgba8Verified          true
jxlHiddenRgbVerified           true
jxlAlphaVerified               true
jxlContainerMetadataVerified   true
jxlOutputIdentityVerified      true
jxlPthreadClosureVerified      true
jxlReceiptConservationVerified true
```

### 13.3 Export Receipt 필드

- JXL Encoder Worker ID
- JXL Decoder Worker ID
- Encoder Protocol
- Decoder Protocol
- Encoder Artifact SHA
- Decoder Artifact SHA
- Encoder Artifact Set Digest
- Decoder Artifact Set Digest
- ABI Symbol·Version
- Input Pixel SHA
- Output File SHA
- Decoded Pixel SHA
- Hidden RGB PASS
- Alpha PASS
- Resolution PASS
- Container Structure PASS
- pthread Closure PASS
- Worker Epochs
- Validation Corpus Digest

---

## 14. Capability Admission

### 14.1 Registry 공개 조건

다음 Receipt가 모두 PASS일 때만 `dadum.encoder.jxl.v1`을 Production Capability로 공개한다.

1. Encoder ABI Report
2. Encoder Artifact Report
3. Decoder Artifact Attestation
4. Independent Decoder Worker Report
5. Exact Round-trip Report
6. Hidden RGB Report
7. Container Metadata Report
8. pthread Closure Report
9. Receipt Conservation Report
10. Packaged Electron E2E Receipt

### 14.2 Source Bake 상한

소스 코드와 Fixture만 존재하고 Packaged Execution이 없으면 상태는 다음을 넘을 수 없다.

```text
SOURCE_AUTHORITY_SEALED
```

---

## 15. 상태 머신

```text
UNASSESSED
→ SOURCE_AUTHORITY_SEALED
→ ENCODER_ABI_VERIFIED
→ ENCODER_ARTIFACT_VERIFIED
→ DECODER_ARTIFACT_VERIFIED
→ DECODER_WORKER_VERIFIED
→ EXACT_RGBA8_ROUNDTRIP_VERIFIED
→ HIDDEN_RGB_VERIFIED
→ CONTAINER_METADATA_VERIFIED
→ OUTPUT_IDENTITY_VERIFIED
→ PTHREAD_GENERATION_CLOSURE_VERIFIED
→ PACKAGED_JXL_E2E_VERIFIED
→ JXL_CODEC_PROMOTED
```

어느 단계가 실패해도 이후 상태로 건너뛰지 않는다.

---

## 16. Stable Error Registry

최소 52개 Stable Error를 등록한다.

1. `E_JXL_CODEC_NOT_PROMOTED`
2. `E_JXL_ENCODER_ARTIFACT_MISMATCH`
3. `E_JXL_DECODER_ARTIFACT_MISMATCH`
4. `E_JXL_DECODER_ARTIFACT_SHARED_WITH_ENCODER`
5. `E_JXL_DECODER_ATTESTATION_MISSING`
6. `E_JXL_DECODER_ATTESTATION_INVALID`
7. `E_JXL_DECODER_WORKER_UNAVAILABLE`
8. `E_JXL_DECODER_WORKER_IDENTITY_MISMATCH`
9. `E_JXL_DECODER_PROTOCOL_MISMATCH`
10. `E_JXL_DECODER_OPERATION_FORBIDDEN`
11. `E_JXL_DECODER_INIT_FAILED`
12. `E_JXL_DECODER_OUTPUT_EMPTY`
13. `E_JXL_DECODER_OUTPUT_LENGTH_MISMATCH`
14. `E_JXL_DECODER_SURFACE_UNSUPPORTED`
15. `E_JXL_DECODER_ALPHA_MODE_INVALID`
16. `E_JXL_DECODER_ROW_STRIDE_INVALID`
17. `E_JXL_DECODER_FREE_FAILED`
18. `E_JXL_DECODER_FALLBACK_FORBIDDEN`
19. `E_JXL_DECODER_HEAP_SHARING_FORBIDDEN`
20. `E_JXL_ROUNDTRIP_MISMATCH`
21. `E_JXL_HIDDEN_RGB_MISMATCH`
22. `E_JXL_ALPHA_MISMATCH`
23. `E_JXL_DIMENSION_MISMATCH`
24. `E_JXL_FIXTURE_DIGEST_MISMATCH`
25. `E_JXL_CONTAINER_METADATA_MISMATCH`
26. `E_JXL_RESOLUTION_MISMATCH`
27. `E_JXL_COLOR_ENCODING_MISMATCH`
28. `E_JXL_SOURCE_SHA_MISMATCH`
29. `E_JXL_PIXEL_SHA_MISMATCH`
30. `E_JXL_OUTPUT_IDENTITY_MISMATCH`
31. `E_JXL_PTHREAD_POOL_MISMATCH`
32. `E_JXL_PTHREAD_CHILD_LEAK`
33. `E_JXL_PTHREAD_DISPOSE_INCOMPLETE`
34. `E_JXL_SHARED_MEMORY_RETAINED`
35. `E_JXL_CROSS_ORIGIN_ISOLATION_REQUIRED`
36. `E_JXL_CHILD_WORKER_ROUTE_UNVERIFIED`
37. `E_JXL_NATIVE_CANCEL_REQUIRES_TERMINATION`
38. `E_JXL_STALE_GENERATION_RESULT`
39. `E_JXL_REPLAY_FORBIDDEN`
40. `E_JXL_RECEIPT_INCOMPLETE`
41. `E_JXL_RECEIPT_DIGEST_MISMATCH`
42. `E_JXL_POST_WORKER_MUTATION`
43. `E_JXL_DISK_SHA_MISMATCH`
44. `E_JXL_DECODER_INPUT_SHA_MISMATCH`
45. `E_JXL_PRODUCTION_POINTER_MUTATION_FORBIDDEN`
46. `E_JXL_PIXEL_BUDGET_EXCEEDED`
47. `E_JXL_INPUT_BYTE_LIMIT_EXCEEDED`
48. `E_JXL_VALIDATION_TIMEOUT`
49. `E_JXL_VALIDATION_CRASHED`
50. `E_JXL_INDEPENDENCE_VIOLATION`
51. `E_JXL_CONTAINER_VERIFIER_DISAGREEMENT`
52. `E_JXL_PROMOTION_PROFILE_INCOMPLETE`

---

## 17. Static Gate Matrix

총 108개 Gate를 정의한다.

| ID | Gate |
|---|---|
| `JXL-01` | Encoder Worker identity is exactly dadum.worker.encoder.jxl-canonical-v1. |
| `JXL-02` | Encoder codec protocol is exactly dadum-jxl-canonical-worker-v1. |
| `JXL-03` | Encoder product operation is exactly encode.jxl-lossless. |
| `JXL-04` | Independent decoder Worker identity is exactly dadum.worker.decoder.jxl-independent-v1. |
| `JXL-05` | Independent decoder protocol is exactly dadum-jxl-independent-decoder-worker-v1. |
| `JXL-06` | Independent decoder operation is exactly decode.jxl-rgba8-exact. |
| `JXL-07` | Encoder and decoder Worker IDs are different. |
| `JXL-08` | Encoder and decoder Worker artifact-set digests are different. |
| `JXL-09` | Encoder and decoder WASM artifact SHA-256 values are different. |
| `JXL-10` | Encoder stable ABI symbol jxl_encode_qmap_ex is preserved. |
| `JXL-11` | Encoder output free ABI symbol jxl_free is preserved. |
| `JXL-12` | Allocator symbols malloc/free remain available to the adapter. |
| `JXL-13` | jxl_encode_qmap_layers_ex remains exported for compatibility. |
| `JXL-14` | Product operation cannot invoke jxl_encode_qmap_layers_ex. |
| `JXL-15` | Encoder accepts only RGBA8 interleaved input for this promotion. |
| `JXL-16` | Encoder bit depth is fixed to 8 for the promoted profile. |
| `JXL-17` | RGBA16 requests remain fail-closed with E_JXL_16BIT_ABI_UNVERIFIED. |
| `JXL-18` | Lossy mode remains fail-closed. |
| `JXL-19` | Distance must equal zero. |
| `JXL-20` | Quality must equal 100. |
| `JXL-21` | Custom ICC requests remain fail-closed until a separate ABI exists. |
| `JXL-22` | Encoder input byte length equals width times height times four. |
| `JXL-23` | Encoder input SHA-256 is calculated before heap upload. |
| `JXL-24` | Encoder ABI argument order is represented by one typed plan. |
| `JXL-25` | Encoder source allocation is released in finally. |
| `JXL-26` | Encoder output-size allocation is released in finally. |
| `JXL-27` | Encoder output pointer is released with jxl_free in finally. |
| `JXL-28` | ABI output is copied before output-pointer release. |
| `JXL-29` | Worker-local container finalization remains authoritative. |
| `JXL-30` | Renderer-side JXL byte mutation is forbidden. |
| `JXL-31` | Canonical output is always a JXL container, not a bare codestream. |
| `JXL-32` | Container signature box is mandatory. |
| `JXL-33` | ftyp cardinality is exactly one. |
| `JXL-34` | jxlc and jxlp carriers are mutually exclusive. |
| `JXL-35` | jxlc cardinality is at most one. |
| `JXL-36` | jxlp sequence order is verified when jxlp is used. |
| `JXL-37` | Exif cardinality is exactly one for the canonical resolution policy. |
| `JXL-38` | XMP xml box cardinality is exactly one for the canonical resolution policy. |
| `JXL-39` | Container parser requires exact EOF. |
| `JXL-40` | All box sizes and xlbox bounds are checked. |
| `JXL-41` | Resolution metadata is verified independently from the encoder finalizer. |
| `JXL-42` | Encoder color encoding evidence is explicit sRGB or linear-sRGB. |
| `JXL-43` | Independent decoder does not call Canvas APIs. |
| `JXL-44` | Independent decoder does not create ImageBitmap. |
| `JXL-45` | Independent decoder does not use the preview decode path. |
| `JXL-46` | Independent decoder calls decode_jxl_ex with OutputKind.Rgba8. |
| `JXL-47` | Independent decoder output surface ID is dadum.jxl-decoded-rgba8-exact-v1. |
| `JXL-48` | Independent decoder output storage is rgba8unorm. |
| `JXL-49` | Independent decoder sample encoding is rgba8unorm-u8-v1. |
| `JXL-50` | Independent decoder alpha mode is straight. |
| `JXL-51` | Independent decoder row stride equals width times four. |
| `JXL-52` | Independent decoder output length equals width times height times four. |
| `JXL-53` | Independent decoder computes source JXL SHA-256. |
| `JXL-54` | Independent decoder computes decoded pixel SHA-256. |
| `JXL-55` | DecodedImage.free is called in finally. |
| `JXL-56` | WASM-owned decoded memory is not retained after result copy. |
| `JXL-57` | Decoder module initialization is singleton per decoder Worker generation. |
| `JXL-58` | Decoder module initialization failure clears the singleton promise. |
| `JXL-59` | Decoder Worker disposal clears module and artifact references. |
| `JXL-60` | Decoder artifact attestation includes JS and WASM SHA-256. |
| `JXL-61` | Decoder artifact attestation proves non-sharing with encoder WASM. |
| `JXL-62` | Decoder registry admission requires a PASS decoder attestation. |
| `JXL-63` | Decoder registry cannot register JXL solely because source files exist. |
| `JXL-64` | Independent validation cannot fall back to browser-image-v1. |
| `JXL-65` | Independent validation cannot fall back to the encoder library. |
| `JXL-66` | Independent validation cannot share encoder heap or output buffer. |
| `JXL-67` | Round-trip validator compares all RGBA bytes. |
| `JXL-68` | Round-trip validator compares RGB bytes even where alpha equals zero. |
| `JXL-69` | Round-trip validator compares alpha bytes exactly. |
| `JXL-70` | Round-trip mismatch evidence includes first mismatch index. |
| `JXL-71` | Round-trip mismatch evidence includes expected and actual byte values. |
| `JXL-72` | Round-trip mismatch evidence includes pixel coordinate and channel. |
| `JXL-73` | Hidden RGB fixture contains at least two distinct RGB triplets under alpha zero. |
| `JXL-74` | Transparent fixture includes alpha values 0, 1, 127, 128, 254, and 255. |
| `JXL-75` | Opaque fixture contains nontrivial RGB gradients. |
| `JXL-76` | Tiny dimension fixtures include 1x1, 1xN, Nx1, and odd dimensions. |
| `JXL-77` | Fixture corpus digest is stable and recorded. |
| `JXL-78` | Same-generation repetition count is at least 100. |
| `JXL-79` | Cross-generation repetition count is at least 20. |
| `JXL-80` | Application relaunch repetition count is at least five. |
| `JXL-81` | Encoder output SHA identity is checked for repeated identical plans. |
| `JXL-82` | Decoded pixel SHA identity is checked for repeated identical files. |
| `JXL-83` | Encoder pthread pool size is exactly four. |
| `JXL-84` | Encoder SharedArrayBuffer requirement is explicit. |
| `JXL-85` | Encoder crossOriginIsolated requirement is explicit. |
| `JXL-86` | Vite dev, preview, and Electron routes carry matching COI policy. |
| `JXL-87` | Encoder child Worker bootstrap is part of the emitted closure. |
| `JXL-88` | Encoder child Worker creation is attributed to one Worker generation. |
| `JXL-89` | Encoder generation disposal terminates all tracked child Workers. |
| `JXL-90` | Encoder generation disposal reports child Worker count zero. |
| `JXL-91` | Encoder generation disposal clears the module promise. |
| `JXL-92` | Encoder generation disposal clears the shared-memory reference. |
| `JXL-93` | Old-generation result messages are rejected after restart. |
| `JXL-94` | Synchronous native encode cancellation uses hard parent-Worker termination. |
| `JXL-95` | A cancelled native encode is not replayed automatically. |
| `JXL-96` | A crash increments Worker epoch before retry admission. |
| `JXL-97` | A new generation starts with a fresh pthread pool of four. |
| `JXL-98` | Dispose evidence is bound to runtime epoch and Worker epoch. |
| `JXL-99` | Promotion receipt includes encoder artifact SHA-256. |
| `JXL-100` | Promotion receipt includes decoder artifact SHA-256. |
| `JXL-101` | Promotion receipt includes ABI, container, decoder, round-trip, and pthread evidence. |
| `JXL-102` | Promotion receipt requires independentDecodeVerified true. |
| `JXL-103` | Promotion receipt requires hiddenRgbVerified true. |
| `JXL-104` | Promotion receipt requires pthreadClosureVerified true. |
| `JXL-105` | Export receipt conserves input SHA, Worker output SHA, disk SHA, and decoder input SHA. |
| `JXL-106` | Production capability remains hidden while any mandatory JXL receipt is blocked. |
| `JXL-107` | Source-baked status cannot mutate the production promotion pointer. |
| `JXL-108` | JXL codec promotion is whole-build scoped and rollback-safe. |

---

## 18. Runtime Test Matrix

총 최소 168개 Runtime Test를 수행한다.

| Group | Count | Scope |
|---|---:|---|
| `ENC-ABI` | 18 | ABI symbol, argument order, allocation, free, empty-output and error propagation fixtures. |
| `ENC-PARAM` | 18 | RGBA8 input, bit depth, lossless, effort, EPF, tile, thread and linear-transfer parameter fixtures. |
| `CONTAINER` | 24 | Signature, ftyp, jxlc, jxlp, Exif, XMP, xlbox, truncation, duplicate and exact-EOF fixtures. |
| `DECODER` | 22 | Independent decoder initialization, Rgba8 output, exact length, row stride, artifact attestation and disposal fixtures. |
| `ROUNDTRIP` | 30 | Opaque, alpha-gradient, hidden-RGB, tiny-dimension, odd-dimension and randomized exact-byte fixtures. |
| `PTHREAD` | 20 | Pool creation, COI admission, child tracking, cancellation, timeout, crash and generation-disposal fixtures. |
| `REPETITION` | 12 | Same-generation, cross-generation and relaunch output-identity fixtures. |
| `RECEIPT` | 14 | Digest conservation, epoch binding, mutation rejection and pointer non-mutation fixtures. |
| `SECURITY` | 10 | Input size, pixel budget, malformed container, stale result, route and artifact-substitution fixtures. |

### 18.1 필수 Runtime Fixture

1. RGBA8 opaque gradient exact round-trip
2. RGBA8 alpha gradient exact round-trip
3. RGBA8 hidden RGB under alpha zero
4. 1x1 image
5. 1x17 image
6. 19x1 image
7. odd dimension image
8. large-but-budgeted image
9. lossy request rejection
10. 16-bit request rejection
11. custom ICC request rejection
12. container signature corruption
13. ftyp duplicate
14. jxlc and jxlp conflict
15. jxlp sequence gap
16. Exif duplicate
17. XMP duplicate
18. box truncation
19. xlbox overflow
20. trailing-byte rejection
21. resolution mismatch
22. color encoding mismatch
23. decoder artifact substitution
24. encoder artifact substitution
25. decoder output length mismatch
26. decoder alpha mode mismatch
27. decoder free path
28. decoder initialization failure retry
29. encoder pool creation four
30. encoder dispose child count zero
31. cancel before native call
32. cancel during native call by parent termination
33. timeout during native call
34. crash and epoch restart
35. stale result rejection
36. same-generation output identity
37. cross-generation output identity
38. app relaunch output identity
39. disk SHA mismatch rejection
40. decoder input SHA mismatch rejection

---

## 19. Required Artifacts

필수 증거 산출물은 22개다.

1. `TDT_JXL_CODEC_01_FIX_RECEIPT.json`
2. `TDT_JXL_CODEC_01_SOURCE_BAKE_SEAL_PAYLOAD.json`
3. `TDT_JXL_CODEC_01_ENCODER_ABI_REPORT.json`
4. `TDT_JXL_CODEC_01_ENCODER_ARTIFACT_REPORT.json`
5. `TDT_JXL_CODEC_01_DECODER_ARTIFACT_REPORT.json`
6. `TDT_JXL_CODEC_01_DECODER_ATTESTATION_REPORT.json`
7. `TDT_JXL_CODEC_01_DECODER_WORKER_REPORT.json`
8. `TDT_JXL_CODEC_01_CONTAINER_METADATA_REPORT.json`
9. `TDT_JXL_CODEC_01_ROUNDTRIP_REPORT.json`
10. `TDT_JXL_CODEC_01_HIDDEN_RGB_REPORT.json`
11. `TDT_JXL_CODEC_01_OUTPUT_IDENTITY_REPORT.json`
12. `TDT_JXL_CODEC_01_PTHREAD_CLOSURE_REPORT.json`
13. `TDT_JXL_CODEC_01_GENERATION_RESTART_REPORT.json`
14. `TDT_JXL_CODEC_01_COI_ROUTE_REPORT.json`
15. `TDT_JXL_CODEC_01_RECEIPT_CONSERVATION_REPORT.json`
16. `TDT_JXL_CODEC_01_PROMOTION_RECEIPT.json`
17. `TDT_JXL_CODEC_01_GATE_REPORT.json`
18. `TDT_JXL_CODEC_01_RUNTIME_TEST_REPORT.json`
19. `TDT_JXL_CODEC_01_STRICT_TYPESCRIPT_VERIFY.txt`
20. `TDT_JXL_CODEC_01_PRODUCTION_EXECUTION_ATTEMPT.txt`
21. `TDT_JXL_CODEC_01_FILE_INVENTORY.sha256`
22. `TDT_JXL_CODEC_01_ZIP_VERIFY.txt`

---

## 20. Promotion Receipt Schema

```json
{
  "schema": "tdt-jxl-codec-01-promotion-receipt-v1",
  "patchId": "TDT-JXL-CODEC-01",
  "state": "JXL_CODEC_PROMOTED",
  "promotionEligible": true,
  "encoder": {
    "workerId": "dadum.worker.encoder.jxl-canonical-v1",
    "operation": "encode.jxl-lossless",
    "abiSymbol": "jxl_encode_qmap_ex",
    "pthreadPoolSize": 4,
    "artifactSha256": "<64-hex>"
  },
  "decoder": {
    "workerId": "dadum.worker.decoder.jxl-independent-v1",
    "operation": "decode.jxl-rgba8-exact",
    "decoderId": "dadum.decoder.jxl-independent-v1",
    "artifactSha256": "<64-hex>",
    "artifactDistinctFromEncoder": true
  },
  "roundTrip": {
    "rgba8Exact": true,
    "hiddenRgbExact": true,
    "alphaExact": true,
    "fixtureCorpusDigest": "<64-hex>"
  },
  "container": {
    "structureVerified": true,
    "metadataVerified": true,
    "resolutionVerified": true
  },
  "pthread": {
    "generationClosureVerified": true,
    "oldGenerationChildWorkersAlive": 0,
    "oldSharedMemoryReachable": false
  },
  "receiptConservationVerified": true,
  "packagedExecutionVerified": true
}
```

---

## 21. Source Bake 판정 규칙

현재와 같은 소스 베이크 환경에서는 다음을 수행할 수 있다.

- Decoder Worker 소스 결선
- Decoder Exact Surface Adapter 결선
- Artifact SHA Attestation
- Canvas·ImageBitmap 의존 제거
- `DecodedImage.free()` Closure
- Round-trip Fixture·Comparator 구현
- pthread Child Worker Tracker 구현
- Gate·Runtime Policy Fixture
- Receipt·Manifest·Build ID 결선

그러나 다음이 실행되지 않았다면 `JXL_CODEC_PROMOTED`를 발급할 수 없다.

- Production Vite Emit
- Actual Encoder pthread Pool 4
- Actual Independent Decoder WASM execution
- Packaged Electron Exact Round-trip
- Hidden RGB Packaged validation
- Native-call Cancel·Crash hard termination
- Same-generation 100회
- Cross-generation 20회
- Relaunch 5회
- Electron Disk SHA Conservation

Source-only 최대 상태:

```text
SOURCE_BAKED_UNPROMOTED
SOURCE_AUTHORITY_SEALED
```

---

## 22. Rollback

JXL Codec만 개별 롤백하지 않는다.

```text
rollbackUnit = whole-build-only
encoderArtifactRollback = forbidden
decoderArtifactRollback = forbidden
legacyJxlFallback = forbidden
```

JXL 검증 실패 시 JXL Capability를 숨기고 전체 Promotion Pointer는 변경하지 않는다.

---

## 23. Acceptance Checklist

- [ ] `jxl_encode_qmap_ex()` ABI가 유지된다.
- [ ] Encoder Artifact Byte가 변하지 않는다.
- [ ] Independent Decoder Worker가 추가된다.
- [ ] Decoder WASM이 Encoder WASM과 다르다.
- [ ] Independent Decoder가 Canvas를 사용하지 않는다.
- [ ] Independent Decoder가 RGBA8 Straight Alpha를 반환한다.
- [ ] `DecodedImage.free()`가 모든 경로에서 호출된다.
- [ ] RGBA8 Exact Round-trip이 PASS한다.
- [ ] Alpha 0 Hidden RGB가 PASS한다.
- [ ] Container Metadata가 독립 검증된다.
- [ ] Encoder Output SHA와 Disk SHA가 일치한다.
- [ ] Decoder Input SHA가 Disk SHA와 일치한다.
- [ ] pthread Child Worker 4개가 Generation에 귀속된다.
- [ ] Dispose 후 Child Worker가 0개다.
- [ ] Old Shared Memory가 도달 불가능하다.
- [ ] Stale Result가 거부된다.
- [ ] Output Identity Corpus가 PASS한다.
- [ ] Packaged Electron E2E가 PASS한다.
- [ ] Promotion Receipt가 모든 증거를 결속한다.
- [ ] Production Pointer는 전체 빌드 단위로만 갱신된다.

---

## 24. 다음 단계

이 명세 다음은 JXL 8-bit 승격 결과에 따라 둘 중 하나다.

```text
A. TDT-JXL-CODEC-01 베이크

B. 8-bit Packaged Validation 완료 후
   TDT-JXL-CODEC-02
   RGBA16LE ABI Fixture / Endian / Exact U16 Round-trip Seal
```

---

## 25. 최종 판단

JXL Encoder는 이미 제품형 구조를 갖추고 있다. 부족한 것은 Encoder 기능이 아니라, 별도 Decoder Artifact를 실제 검증 권위로 승격하고 Pixel·Hidden RGB·Metadata·pthread 수명을 하나의 Receipt로 묶는 일이다.

따라서 이 명세의 본질은 다음과 같다.

> `jxl_encode_qmap_ex()`는 그대로 둔다. Encoder를 다시 만들지 않는다. 별도 JXL Decoder Worker가 같은 파일을 독립적으로 풀어 모든 RGBA Byte를 확인하고, Encoder pthread Generation이 완전히 닫혔다는 증거까지 확보한 뒤에만 JXL Capability를 제품 승격한다.

