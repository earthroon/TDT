# TDT-EXPORT-WORKER-03
## WebP Lossless / PNG8·PNG16 Canonical Worker Promotion Seal

> **상태:** IMPLEMENTATION SPECIFICATION  
> **부모 봉인:** `TDT-EXPORT-WORKER-02`  
> **상위 권위:** `TDT-RUNTIME-SSOT-01-R7`  
> **대상 저장소:** 다듬다듬 Vite·Vue3·Pinia Runtime + Legacy ExportManager  
> **승격 성격:** Worker Control Plane 이후의 첫 Codec Data Plane 승격  
> **직접 대상:** WebP Lossless, PNG8, PNG16  
> **후속 명세:** `TDT-EXPORT-WORKER-04 PSD Rust/WASM Canonical Serializer Promotion Seal`

---

# 0. 문서 목적

`TDT-EXPORT-WORKER-01`은 Worker 생성권·URL·Epoch·Artifact Identity를 Runtime 권위로 회수했다.

`TDT-EXPORT-WORKER-02`는 Worker Job의 ID·입력 스냅샷·FIFO·Timeout·Abort·Cancel·Crash Restart·Pending Closure를 `EncoderWorkerBrokerService`로 회수했다.

그러나 EW02 이후에도 Codec Data Plane은 아직 완전한 제품 권위를 갖지 못한다.

현재 코드 기준선은 다음과 같다.

```text
WebP Lossless
→ Worker-backed
→ Emscripten WebP WASM
→ allowCanvasFallback:false
→ nearLossless payload를 그대로 허용
→ RIFF/WEBP signature만 상위에서 검증
→ 실제 lossless·transparent RGB exactness 미증명
→ wasmArtifactSha256 = null

PNG8
→ ExportManager 내부 window.UPNG.encode()
→ Renderer Main Thread
→ Worker Broker 미사용
→ PNG16과 다른 구현·메타데이터 경로
→ UPNG 전역 가용성에 의존

PNG16
→ Worker-backed
→ LodePNG Emscripten WASM
→ _png_encode_rgba16 사용
→ RGBA8 입력은 16-bit로 257배 확장
→ PNG Signature와 IHDR bit depth 16 검증
→ PNG8과 별도 실행 모델
→ wasmArtifactSha256 = null
```

추가로 LodePNG WASM에는 이미 다음 두 Native Entry가 함께 존재한다.

```text
_png_encode_rgba8
_png_encode_rgba16
```

즉 PNG8용 별도 코덱을 새로 만들 이유가 없다.

현재 `dadum.worker.encoder.png16-v1`이라는 Worker ID는 실제 보유 Capability보다 좁으며, PNG8이 Main Thread에 남아 있는 원인이 된다.

본 명세는 다음을 수행한다.

```text
WebP Lossless
→ 이름과 실제 의미를 일치
→ VP8L + exact RGBA round-trip + transparent RGB 보존
→ Canvas / lossy / near-lossless semantic fallback 0

PNG8 + PNG16
→ 하나의 Canonical PNG Family Worker
→ 하나의 LodePNG WASM Instance
→ bit-depth 명시 Operation
→ 공통 Metadata Normalizer
→ 공통 Output Evidence
→ Renderer Main-thread PNG Encoder 0

모든 대상
→ Production WASM Artifact SHA-256
→ Main-thread Zero Receipt
→ Codec-specific Byte Truth
→ R7 Export Receipt 결속
```

---

# 1. 한 문장 목표

> **WebP Lossless의 이름을 실제 VP8L·정확한 RGBA 왕복 보존으로 봉인하고, PNG8과 PNG16을 하나의 Canonical PNG Family Worker 및 LodePNG WASM 권위에 통합하며, 세 포맷의 Main-thread Encode·Canvas Fallback·Silent Metadata Drop·False Lossless를 0으로 만든다.**

---

# 2. 핵심 권위선

## 2.1 WebP Lossless

```text
Runtime Export Authority
→ dadum.encoder.webp-lossless.v1
→ EncoderWorkerBrokerService.call()
→ dadum.worker.encoder.webp-lossless-v1
→ dadum-webp-lossless-worker-v2
→ WebP WASM exact-lossless encode
→ Resolution Metadata Normalizer
→ VP8L Structural Verifier
→ Independent RGBA Round-trip Verifier
→ Worker Codec Receipt
→ R7 Export Receipt
```

## 2.2 PNG Family

```text
Runtime Export Authority
→ dadum.encoder.png.v1 | dadum.encoder.png16.v1
→ EncoderWorkerBrokerService.call()
→ dadum.worker.encoder.png-family-v1
→ dadum-png-family-worker-v1
→ LodePNG WASM
   ├─ _png_encode_rgba8
   └─ _png_encode_rgba16
→ Canonical PNG Metadata Normalizer
→ IHDR / Chunk / Pixel Round-trip Verifier
→ Worker Codec Receipt
→ R7 Export Receipt
```

---

# 3. 비목표

본 명세는 다음을 수행하지 않는다.

- Lossy WebP의 Worker 승격
- WebP Near-Lossless를 별도 제품 Encoder로 승격
- JXL Worker 이전
- JPEG Worker 이전
- PSD Plane Split·LCMS·Serializer 승격
- GPU Readback 구조 변경
- Final Surface Storage Contract 변경
- Export UI 디자인 변경
- Worker Pool 다중 인스턴스화
- PNG Palette·Grayscale 자동 최적화
- PNG Color Type 자동 축소
- APNG 지원
- WebP Animation 지원
- Encoder 알고리즘 자체의 재작성
- LodePNG 또는 libwebp Native Source의 신규 구현
- Metadata 정책을 인코더 외부의 임의 Post-process Script에 분산
- Native Decoder 전체 승격
- dav1d 문제 해결
- Output 파일 크기 최적화 목표를 lossless truth보다 우선

본 명세의 초점은 **Codec 의미·실행 위치·바이트 진실성의 제품 승격**이다.

---

# 4. 현재 코드 기준선

## 4.1 활성 ExportManager

활성 Legacy Manifest에는 `export_manager.js`가 required active module로 등록돼 있다.

현재 PNG8은 다음 코드로 직접 인코딩된다.

```js
ExportManager.register(
  "png",
  async ({ rgba, width, height }) => {
    assertU8RGBA(rgba, width, height, "PNG");
    const png = window.UPNG.encode([rgba.buffer], width, height, 0);
    const withResolution = injectResolutionIntoPng(...);
    return { u8: withResolution, mime: "image/png", ext: "png" };
  },
  1
);
```

이 경로는 다음 특성을 갖는다.

```text
Execution Realm = renderer-main
Worker Broker = bypass
WASM Artifact Identity = 없음
Encoder Implementation Identity = UPNG global
Bit-depth Truth = 상위 Signature 검사에 의존
Pixel Round-trip Truth = 미증명
```

## 4.2 WebP Lossless

현재 `webp-lossless`는 EW02 Broker를 통해 Worker에서 실행된다.

```text
Worker ID
dadum.worker.encoder.webp-lossless-v1

Operation
encode.webp-lossless

Codec Protocol
dadum-webp-lossless-worker-v1

Input Ownership
broker-shared-copy-v1
```

Worker Handler는 다음 호출을 수행한다.

```js
encodeRGBAtoWebP(rgba, width, height, {
  near: nearLossless ?? 100,
  resolutionMeta,
  allowCanvasFallback: false,
});
```

현재 확인 가능한 진실:

- Canvas Fallback은 Worker 경로에서 비활성이다.
- WASM Core Symbol은 확인한다.
- 결과는 RIFF/WEBP Signature만 상위에서 확인한다.
- `nearLossless`가 100 미만이어도 Encoder Identity는 계속 `webp-lossless`다.
- VP8L Payload 여부는 확인하지 않는다.
- 출력 RGBA의 독립 Decode Round-trip은 확인하지 않는다.
- fully transparent pixel의 숨은 RGB 보존 여부를 확인하지 않는다.
- WASM Artifact SHA-256이 READY Evidence에서 `null`이다.

따라서 현재 이름은 구현 의도와는 맞지만 제품 승격 증거가 부족하다.

## 4.3 PNG16

현재 `png16`은 EW02 Broker를 통해 Worker에서 실행된다.

```text
Worker ID
dadum.worker.encoder.png16-v1

Operation
encode.png16

Codec Protocol
dadum-png16-worker-v1

Input Ownership
broker-transfer-snapshot-v1
```

LodePNG Bridge는 다음 Native Entry를 실제로 갖고 있다.

```text
_png_encode_rgba8
_png_encode_rgba16
_pngbuffer_ptr
_pngbuffer_len
_pngbuffer_free
_malloc
_free
```

하지만 Bridge는 `_png_encode_rgba16`만 제품 API로 노출한다.

현재 RGBA8 입력은 다음처럼 PNG16으로 확장된다.

```text
u16 = u8 * 257
```

이는 PNG16 Export의 호환 경로로는 유효하지만 PNG8을 Main Thread에 남겨야 할 이유는 아니다.

## 4.4 LodePNG Pthread

현재 LodePNG Emscripten Build는 다음 특성을 가진다.

```text
Shared WebAssembly.Memory
PThread pool
SharedArrayBuffer
Atomics
crossOriginIsolated 요구
Initial Memory 약 256 MiB
```

따라서 PNG Family Worker 승격은 단순한 Operation 추가가 아니다.

다음도 제품 권위에 들어와야 한다.

- COOP/COEP 또는 Electron Equivalent Isolation
- SharedArrayBuffer 가용성
- Pthread Child Worker 생성 증거
- Child Worker Artifact Identity
- Worker 종료 시 Pthread Pool 폐쇄
- Crash Restart 시 이전 Generation Child Worker 잔존 0
- Initial Memory와 Peak Memory Receipt

---

# 5. 설계 결정

## 5.1 PNG Worker Identity 교체

기존:

```text
dadum.worker.encoder.png16-v1
```

신규 Canonical Worker:

```text
dadum.worker.encoder.png-family-v1
```

신규 Codec Protocol:

```text
dadum-png-family-worker-v1
```

신규 Operations:

```text
encode.png8
encode.png16
```

Owner Runtime Encoders:

```text
dadum.encoder.png.v1
dadum.encoder.png16.v1
```

기존 `png16-v1` Worker ID는 Promotion 이후 제품 Manifest에서 제거한다.

Compatibility Alias로도 Worker를 이중 등록하지 않는다.

Worker ID Alias는 Job Routing을 모호하게 만들기 때문이다.

Migration은 Source-level Manifest 교체로 수행한다.

## 5.2 PNG8 구현

PNG8은 LodePNG WASM의 기존 `_png_encode_rgba8`을 사용한다.

다음은 금지한다.

- `window.UPNG.encode`
- `Canvas.toBlob("image/png")`
- `OffscreenCanvas.convertToBlob("image/png")`
- Renderer Realm의 JS Deflate Encoder
- `PNGExportBridge`로의 조용한 하강
- PNG16 Worker에 RGBA8을 넣어 16-bit PNG로 출력한 뒤 `png`라고 라벨링
- bit depth를 출력 이후 강제로 변경
- 색상 타입을 자동으로 Palette나 RGB로 축소

Canonical PNG8 출력은 다음을 만족한다.

```text
PNG Signature = PASS
IHDR Width = requested width
IHDR Height = requested height
IHDR Bit Depth = 8
IHDR Color Type = 6 (RGBA)
Interlace = 0
Decoded RGBA8 = Input RGBA8 exact
```

## 5.3 PNG16 구현

PNG16은 기존 `_png_encode_rgba16`을 유지한다.

Canonical PNG16 출력은 다음을 만족한다.

```text
PNG Signature = PASS
IHDR Width = requested width
IHDR Height = requested height
IHDR Bit Depth = 16
IHDR Color Type = 6 (RGBA)
Interlace = 0
Decoded RGBA16 = Input RGBA16 exact
```

RGBA8 입력을 PNG16으로 승격하는 호환 동작은 허용하되 다음 증거를 남긴다.

```text
inputSampleDepth = 8
outputSampleDepth = 16
expansionPolicyId = u8-times-257-v1
expandedByWorker = true
```

호출자가 `png16`을 요청했으나 Final Surface가 `rgba8`인 경우 자동 확장은 허용한다.

반대로 호출자가 `png`를 요청했는데 Final Surface가 `rgba16-direct`인 경우 조용한 down-convert는 금지한다.

이 경우 다음 중 하나여야 한다.

```text
A. Export Request가 명시적으로 quantizationPolicyId를 제공
B. E_CODEC_INPUT_PRECISION_MISMATCH로 실패
```

R7 `buildExactPayload()`가 현재 `rgba16-direct`에서 RGBA8 Proxy도 함께 생성하므로, EW03에서는 PNG8 선택 시 어떤 배열이 권위인지 명시해야 한다.

권위 규칙:

```text
png
→ authoritativeInput = explicit rgba8 produced by named quantization policy
→ source rgba16 digest와 quantized rgba8 digest를 Receipt에 함께 기록

png16
→ authoritativeInput = rgba16-direct
→ rgba8 proxy는 사용 금지
```

## 5.4 WebP Lossless 의미

`dadum.encoder.webp-lossless.v1`은 다음만 허용한다.

```text
lossless = true
nearLossless = 100
exactTransparentRgb = true
animated = false
```

다음 요청은 실패한다.

```text
nearLossless < 100
quality 기반 손실 설정
lossless = false
Canvas fallback 요청
animated = true
```

Stable Error:

```text
E_CODEC_OPTION_SEMANTIC_MISMATCH
```

Near-Lossless를 지원하려면 후속 별도 Encoder Identity가 필요하다.

예:

```text
dadum.encoder.webp-near-lossless.v1
```

EW03에서는 생성하지 않는다.

---

# 6. Runtime Encoder Identity

## 6.1 WebP Lossless

```ts
{
  id: 'dadum.encoder.webp-lossless.v1',
  canonicalFormat: 'webp-lossless',
  legacyEncoderKey: 'webp-lossless',
  mime: 'image/webp',
  extension: 'webp',
  executionRealm: 'dedicated-worker',
  semanticClass: 'lossless-rgba',
  workerBinding: {
    workerId: 'dadum.worker.encoder.webp-lossless-v1',
    operation: 'encode.webp-lossless',
    codecProtocolVersion: 'dadum-webp-lossless-worker-v2'
  }
}
```

Codec Protocol은 v2로 올린다.

이유:

- Option Contract가 강화된다.
- Result Evidence가 확장된다.
- VP8L Structural Evidence가 추가된다.
- Input Layout가 `sab` 고정에서 owned bytes contract로 바뀔 수 있다.
- exactTransparentRgb 계약이 추가된다.

## 6.2 PNG8

```ts
{
  id: 'dadum.encoder.png.v1',
  canonicalFormat: 'png',
  legacyEncoderKey: 'png',
  mime: 'image/png',
  extension: 'png',
  executionRealm: 'dedicated-worker',
  semanticClass: 'lossless-rgba8',
  workerBinding: {
    workerId: 'dadum.worker.encoder.png-family-v1',
    operation: 'encode.png8',
    codecProtocolVersion: 'dadum-png-family-worker-v1'
  }
}
```

## 6.3 PNG16

```ts
{
  id: 'dadum.encoder.png16.v1',
  canonicalFormat: 'png16',
  legacyEncoderKey: 'png16',
  mime: 'image/png',
  extension: 'png',
  executionRealm: 'dedicated-worker',
  semanticClass: 'lossless-rgba16',
  workerBinding: {
    workerId: 'dadum.worker.encoder.png-family-v1',
    operation: 'encode.png16',
    codecProtocolVersion: 'dadum-png-family-worker-v1'
  }
}
```

---

# 7. Worker Manifest 계약

## 7.1 WebP Worker Descriptor

```ts
{
  workerId: 'dadum.worker.encoder.webp-lossless-v1',
  ownerRuntimeEncoderIds: ['dadum.encoder.webp-lossless.v1'],
  controlProtocolVersion: 'dadum-worker-control-v1',
  codecProtocolVersion: 'dadum-webp-lossless-worker-v2',
  rpcProtocolVersion: 'dadum-worker-rpc-v1',
  operations: ['encode.webp-lossless'],
  transferPolicyId: 'broker-owned-bytes-v2',
  wasmPolicyId: 'required-exact-artifact-v1',
  artifactVerificationMode: 'emitted-asset-sha256',
  requiredWasmArtifacts: [
    'webp_bindings_qmap.wasm'
  ]
}
```

## 7.2 PNG Family Worker Descriptor

```ts
{
  workerId: 'dadum.worker.encoder.png-family-v1',
  ownerRuntimeEncoderIds: [
    'dadum.encoder.png.v1',
    'dadum.encoder.png16.v1'
  ],
  controlProtocolVersion: 'dadum-worker-control-v1',
  codecProtocolVersion: 'dadum-png-family-worker-v1',
  rpcProtocolVersion: 'dadum-worker-rpc-v1',
  operations: [
    'encode.png8',
    'encode.png16'
  ],
  transferPolicyId: 'broker-transfer-snapshot-v1',
  wasmPolicyId: 'required-pthread-artifact-set-v1',
  artifactVerificationMode: 'emitted-asset-sha256',
  requiredWasmArtifacts: [
    'lodepng_wasm.wasm'
  ],
  requiresCrossOriginIsolation: true,
  requiresSharedArrayBuffer: true,
  requiresAtomics: true
}
```

---

# 8. Input Contract

## 8.1 공통

```ts
interface CanonicalRasterInputBase {
  width: number;
  height: number;
  finalRevision: number;
  surfaceId: string;
  surfaceContractDigest: string;
  alphaMode: 'straight';
  rowOrder: 'top-to-bottom';
  channelOrder: 'rgba';
  colorEncoding: 'srgb-encoded' | 'linear-srgb';
  resolutionMeta: {
    xDpi: number | null;
    yDpi: number | null;
    source: string;
  };
  iccBytes?: Uint8Array | null;
}
```

다음은 금지한다.

- premultiplied alpha 입력
- BGRA
- bottom-up rows
- width·height와 길이 불일치
- mutable global canvas 참조
- ImageBitmap 직접 전달
- Final Surface Revision 없는 입력
- `window.currentDPI`를 Worker가 다시 조회
- Worker가 Runtime 전역 상태를 조회

## 8.2 WebP Lossless

```ts
interface WebpLosslessInput extends CanonicalRasterInputBase {
  rgba8: Uint8Array;
  lossless: true;
  nearLossless: 100;
  exactTransparentRgb: true;
  metadataPolicyId: 'webp-resolution-metadata-v1';
}
```

길이:

```text
rgba8.byteLength == width * height * 4
```

## 8.3 PNG8

```ts
interface Png8Input extends CanonicalRasterInputBase {
  rgba8: Uint8Array;
  sampleDepth: 8;
  metadataPolicyId: 'png-canonical-metadata-v1';
  quantizationPolicyId?: string;
  sourceRgba16Digest?: string;
}
```

길이:

```text
rgba8.byteLength == width * height * 4
```

## 8.4 PNG16

```ts
interface Png16Input extends CanonicalRasterInputBase {
  rgba16?: Uint16Array;
  rgba8?: Uint8Array;
  sampleDepth: 16;
  expansionPolicyId?: 'u8-times-257-v1';
  metadataPolicyId: 'png-canonical-metadata-v1';
}
```

정확히 하나만 허용한다.

```text
rgba16 XOR rgba8
```

`rgba16` 길이:

```text
rgba16.length == width * height * 4
```

`rgba8` 길이:

```text
rgba8.byteLength == width * height * 4
```

---

# 9. Input Ownership

## 9.1 WebP

EW02의 `broker-shared-copy-v1` 단독 강제는 해제한다.

신규 정책:

```text
broker-owned-bytes-v2
```

Admission 시 Broker가 다음 중 하나를 결정한다.

```text
A. broker-transfer-snapshot-v1
B. broker-shared-copy-v1
```

선택은 Runtime Capability Receipt에 의해 결정된다.

```text
SharedArrayBuffer + crossOriginIsolated
→ shared-copy 허용

그 외
→ transfer-snapshot
```

두 정책은 출력 의미가 완전히 같아야 한다.

Worker Handler는 `sab`라는 필드명에 종속되지 않는다.

Canonical Input Field:

```text
rgba8Buffer
```

Evidence:

```ts
{
  ownershipPolicyId: string;
  inputByteLength: number;
  callerBufferDetached: false;
  brokerOwnedSnapshot: true;
  sharedBufferUsed: boolean;
}
```

Caller가 제공한 원본 Buffer는 Detach하지 않는다.

## 9.2 PNG

PNG는 `broker-transfer-snapshot-v1`을 기본으로 한다.

Broker는 Admission 시 자체 Snapshot을 만들고 그 Snapshot만 Worker로 Transfer한다.

Caller 원본은 Detach하지 않는다.

Receipt:

```ts
{
  ownershipPolicyId: 'broker-transfer-snapshot-v1';
  callerBufferDetached: false;
  workerInputBufferDetachedAfterPost: true;
}
```

---

# 10. WebP Lossless Worker 계약

## 10.1 Initialization

READY는 다음이 모두 참일 때만 발급한다.

```text
WASM module instantiated
_malloc exists
_free exists
_encode_lossless_near_rgba exists
HEAPU8 exists
HEAP32 exists
Production WASM Artifact SHA-256 resolved
Encoder self-test PASS
```

Self-test는 최소 다음을 포함한다.

```text
2x2 RGBA fixture
alpha 0 hidden RGB fixture
non-opaque alpha fixture
nearLossless = 100
VP8L structural parse PASS
decoded RGBA exact PASS
```

Self-test 실패 시:

```text
E_WORKER_CODEC_SELF_TEST_FAILED
```

Worker는 READY를 발급하지 않는다.

## 10.2 Encode Options

Worker는 다음을 강제한다.

```text
lossless === true
nearLossless === 100
exactTransparentRgb === true
```

값이 없으면 Runtime Exact Encoder가 Canonical Default를 명시적으로 넣는다.

Worker가 임의 Default를 추론하지 않는다.

100 미만을 100으로 Clamp하지 않는다.

Stable Error:

```text
E_CODEC_OPTION_SEMANTIC_MISMATCH
```

## 10.3 VP8L Structural Truth

출력 RIFF를 파싱해 다음을 확인한다.

```text
Bytes 0..3 = RIFF
Bytes 8..11 = WEBP
VP8L chunk count = 1
VP8 lossy chunk count = 0
ANMF chunk count = 0
ANIM chunk count = 0
Canvas dimensions = requested dimensions
```

Metadata가 있으면 `VP8X`는 허용한다.

단 `VP8X`가 있어도 실제 Image Payload는 `VP8L`이어야 한다.

## 10.4 Transparent RGB Exactness

Lossless 의미에는 alpha가 0인 pixel의 숨은 RGB도 포함한다.

예:

```text
Input Pixel A = [255, 0, 0, 0]
Input Pixel B = [0, 255, 0, 0]
```

Decode 결과에서 A와 B의 RGB가 동일하게 뭉개지면 실패다.

이 Gate는 libwebp의 exact mode가 실제 활성인지 증명한다.

Stable Error:

```text
E_CODEC_TRANSPARENT_RGB_MISMATCH
```

## 10.5 Pixel Round-trip

Promotion Test에서는 독립 Decoder로 다음을 검증한다.

```text
decoded.width == input.width
decoded.height == input.height
decoded.rgba8.byteLength == input.rgba8.byteLength
decoded.rgba8 SHA-256 == input.rgba8 SHA-256
```

Renderer 자체 Encoder Module을 Decoder로 재사용하지 않는다.

Trusted Decoder 후보:

```text
A. Rust image/webp decoder
B. libwebp dwebp
C. Browser ImageDecoder where exact RGBA semantics are verified
```

Promotion Artifact에는 사용 Decoder Identity와 Version을 기록한다.

## 10.6 Metadata

현재 WebP 경로의 Resolution Metadata Injection은 유지하되 다음을 증명한다.

```text
metadata requested = metadata applied
metadata omitted = no synthetic metadata
metadata parse round-trip = PASS
VP8L image payload unchanged after metadata injection
```

Metadata Injection은 Worker 안에서 수행한다.

Renderer 후처리는 금지한다.

---

# 11. PNG Family Worker 계약

## 11.1 Bridge API

신규 모듈:

```text
app/legacy-runtime/encoders/png_lode_bridge.mjs
```

권장 Export:

```ts
ensurePngFamilyReady()
encodePNG8RGBA(input)
encodePNG16RGBA(input)
encodePNG16FromRGBA8(input)
disposePngFamily()
```

기존 `png16_lode_bridge.mjs`는 다음 중 하나로 처리한다.

```text
A. 신규 모듈을 Re-export하는 Compatibility Shim
B. Active Graph에서 제거하고 Quarantine
```

동시에 두 Module이 각자 WASM Instance를 만들면 안 된다.

## 11.2 Ready Symbol Set

```text
_malloc
_free
_png_encode_rgba8
_png_encode_rgba16
_pngbuffer_ptr
_pngbuffer_len
_pngbuffer_free
```

하나라도 없으면 READY 금지.

Stable Error:

```text
E_WORKER_WASM_SYMBOL_MISSING
```

## 11.3 PNG8 Encode

Pseudo Contract:

```ts
async function encodePNG8RGBA({
  rgba8,
  width,
  height,
  metadata
}): Promise<CanonicalPngResult>
```

Native Call:

```text
_png_encode_rgba8(inputPtr, width, height)
```

Result Copy가 끝난 뒤:

```text
_pngbuffer_free()
_free(inputPtr)
```

Cleanup은 예외 경로에서도 정확히 한 번 수행한다.

## 11.4 PNG16 Encode

Native Call:

```text
_png_encode_rgba16(inputPtr, width, height)
```

JS `Uint16Array`의 host endianness를 그대로 memcpy하는 현재 계약은 별도 검증이 필요하다.

PNG 16-bit Sample은 Network Byte Order다.

Native Wrapper가 Host-order 입력을 올바르게 처리하는지 fixture로 검증한다.

Promotion Fixture:

```text
R = 0x1234
G = 0xABCD
B = 0x00FF
A = 0xFF00
```

Decode 결과가 동일해야 한다.

Stable Error:

```text
E_CODEC_ENDIANNESS_MISMATCH
```

## 11.5 Single WASM Instance

PNG8과 PNG16은 동일 Worker Generation에서 동일 Module Promise를 공유한다.

```text
one Worker Generation
→ one LodePNG Module
→ one Shared Memory
→ one Pthread Pool
```

Operation마다 Module을 다시 만들지 않는다.

Receipt:

```ts
{
  wasmInstanceOrdinal: 1;
  moduleReuse: true;
  operationCountSinceReady: number;
}
```

---

# 12. PNG Metadata Contract

## 12.1 Canonical Policy

```text
png-canonical-metadata-v1
```

지원 Metadata:

```text
pHYs
sRGB
iCCP
```

선택 지원:

```text
gAMA
cHRM
```

단 sRGB·iCCP·gAMA·cHRM 조합은 상충하지 않아야 한다.

## 12.2 Resolution

`xDpi`, `yDpi`가 있으면 pHYs로 변환한다.

```text
pixelsPerMeter = round(dpi / 0.0254)
unitSpecifier = 1
```

x와 y는 별도로 보존한다.

현재 `window.currentDPI`를 Worker가 조회하는 것은 금지한다.

Final Payload의 `resolutionMeta`만 사용한다.

## 12.3 ICC

`iccBytes`가 요청됐는데 Injection이 실패하면 Output을 성공 처리하지 않는다.

Stable Error:

```text
E_CODEC_METADATA_INJECTION_FAILED
```

ICC를 조용히 버리고 sRGB Chunk만 넣는 것은 금지한다.

ICC 이름과 Compression Method를 결정론적으로 고정한다.

## 12.4 Chunk Order

Canonical Order:

```text
PNG Signature
IHDR
iCCP or sRGB/gAMA/cHRM
pHYs
IDAT...
IEND
```

금지:

- IHDR 중복
- IEND 중복
- pHYs 중복
- iCCP 중복
- sRGB와 상충하는 iCCP 병행
- IDAT 뒤 Critical Metadata 삽입
- CRC 불일치

## 12.5 Metadata Result Evidence

```ts
interface PngMetadataEvidence {
  policyId: 'png-canonical-metadata-v1';
  requested: {
    resolution: boolean;
    icc: boolean;
  };
  applied: {
    phys: boolean;
    srgb: boolean;
    iccp: boolean;
  };
  xPixelsPerMeter: number | null;
  yPixelsPerMeter: number | null;
  iccSha256: string | null;
  chunkOrderDigest: string;
}
```

---

# 13. PNG Structural Truth

상위 R7 Verifier를 확장한다.

## 13.1 공통

```text
PNG Signature PASS
IHDR first
IEND last
Chunk CRC PASS
Width PASS
Height PASS
Color Type = 6
Compression Method = 0
Filter Method = 0
Interlace Method = 0
```

## 13.2 PNG8

```text
IHDR Bit Depth = 8
Decoded pixel format = RGBA8
Decoded SHA-256 = Input RGBA8 SHA-256
```

## 13.3 PNG16

```text
IHDR Bit Depth = 16
Decoded pixel format = RGBA16
Decoded SHA-256 = Input RGBA16 canonical-byte SHA-256
```

Canonical RGBA16 Digest Byte Order:

```text
big-endian sample bytes
R_hi R_lo G_hi G_lo B_hi B_lo A_hi A_lo
```

JS Host-endian Buffer Digest를 그대로 사용하지 않는다.

---

# 14. Main-thread Zero Contract

Promotion 이후 활성 제품 경로에서 다음 호출은 0이어야 한다.

```text
window.UPNG.encode
UPNG.encode
Canvas.toBlob(... image/png ...)
OffscreenCanvas.convertToBlob(... image/png ...)
Canvas.toBlob(... image/webp ...)
OffscreenCanvas.convertToBlob(... image/webp ...)
encodeRGBAtoWebP executed in renderer-main
_png_encode_rgba8 executed in renderer-main
_png_encode_rgba16 executed in renderer-main
```

Legacy 소스 파일이 저장소에 남는 것은 허용한다.

단 Active Manifest·Static Module Graph·Runtime Stack에는 들어오면 안 된다.

Static Gate는 문자열 존재 자체가 아니라 Active Reachability를 검사한다.

Receipt:

```ts
{
  rendererMainEncodeCount: 0;
  rendererMainCanvasFallbackCount: 0;
  workerEncodeCount: number;
  activeEncoderRealm: 'dedicated-worker';
}
```

---

# 15. Fallback Policy

## 15.1 금지되는 Fallback

```text
WebP Lossless WASM 실패 → Canvas WebP
WebP Lossless 옵션 불일치 → nearLossless clamp
PNG8 Worker 실패 → UPNG Main Thread
PNG8 Worker 실패 → Canvas PNG
PNG16 Worker 실패 → PNG8
PNG16 Metadata 실패 → Metadata 없는 PNG16
PNG8 ICC 실패 → sRGB로 대체
PNG Family Pthread 실패 → Main Thread UPNG
```

모두 Fail-Closed다.

## 15.2 허용되는 선택

호출자는 명시적으로 다른 Encoder를 다시 요청할 수 있다.

예:

```text
webp-lossless 실패
→ UI가 실패를 표시
→ 사용자가 png를 새 요청
```

이는 Fallback이 아니라 새 Export Job이다.

새 `exportJobId`와 새 Receipt가 필요하다.

---

# 16. Pthread·Subworker Authority

## 16.1 문제

LodePNG Emscripten Module은 내부 Pthread Pool을 생성한다.

Top-level Encoder Worker만 Broker가 소유하고 Child Pthread Worker가 무명 상태면 Worker Authority가 완전하지 않다.

## 16.2 요구

Production Build에서 다음을 식별한다.

```text
Top-level PNG Family Worker Entry
LodePNG Emscripten JS
LodePNG WASM
Pthread Bootstrap Asset
```

Artifact Set Digest는 네 요소를 포함한다.

Child Worker는 다음 identity를 가진다.

```text
parentWorkerId
parentGeneration
pthreadOrdinal
buildId
artifactSha256
```

## 16.3 Dispose

PNG Family Worker Dispose 시 다음이 성립해야 한다.

```text
active RPC = 0 or cancelled
Pthread runningWorkers = 0
Pthread unusedWorkers = 0
Shared Memory reference released
Worker close
```

Emscripten Module이 공개 Dispose를 제공하지 않으면 Worker Generation 종료가 Pthread Pool 폐쇄의 권위가 된다.

이때 OS·Browser 수준 Worker Count가 baseline으로 복귀했음을 E2E에서 확인한다.

## 16.4 Restart

Crash Restart 후:

```text
old parent generation alive = false
old pthread count = 0
new parent generation = old + 1
new pthread pool count = declared size
```

Stale Child Worker가 이전 Shared Memory를 계속 잡는 상태를 금지한다.

---

# 17. Capability Gate

## 17.1 WebP

```ts
{
  worker: true,
  wasm: true,
  exactLosslessSelfTest: true,
  transparentRgbExact: true,
  vp8lStructuralVerifier: true,
  artifactVerified: true
}
```

하나라도 false면 `dadum.encoder.webp-lossless.v1`은 READY가 아니다.

## 17.2 PNG Family

```ts
{
  worker: true,
  wasm: true,
  rgba8Symbol: true,
  rgba16Symbol: true,
  crossOriginIsolated: true,
  sharedArrayBuffer: true,
  atomics: true,
  pthreadReady: true,
  png8SelfTest: true,
  png16SelfTest: true,
  artifactVerified: true
}
```

PNG8도 같은 Worker를 사용하므로 Pthread Capability가 없으면 PNG8과 PNG16 모두 UNAVAILABLE이다.

조용히 UPNG로 하강하지 않는다.

향후 Single-threaded LodePNG Build를 추가하면 별도 Implementation ID와 Capability Policy가 필요하다.

---

# 18. Worker READY Evidence

## 18.1 WebP

```ts
{
  wasmReady: true,
  wasmImplementationId: 'dadum.webp-emscripten-wasm-v1',
  wasmArtifactSha256: '<non-null>',
  codecSelfTestId: 'webp-lossless-exact-selftest-v1',
  codecSelfTestPassed: true,
  exactTransparentRgb: true,
  outputPayloadKind: 'VP8L',
  supportedOperations: ['encode.webp-lossless']
}
```

## 18.2 PNG Family

```ts
{
  wasmReady: true,
  wasmImplementationId: 'dadum.lodepng-png-family-emscripten-wasm-v1',
  wasmArtifactSha256: '<non-null>',
  pthreadArtifactSetDigest: '<non-null>',
  codecSelfTestId: 'png-family-selftest-v1',
  png8SelfTestPassed: true,
  png16SelfTestPassed: true,
  supportedOperations: [
    'encode.png8',
    'encode.png16'
  ]
}
```

`wasmArtifactSha256: null`이면 Production Promotion 금지다.

---

# 19. Worker Result Contract

## 19.1 공통

```ts
interface CanonicalCodecWorkerResult {
  bytes: Uint8Array;
  mime: string;
  extension: string;
  codecEvidence: Record<string, unknown>;
  metadataEvidence: Record<string, unknown>;
  memoryEvidence: Record<string, unknown>;
}
```

`ArrayBuffer`만 던지고 상위가 형식을 추론하는 방식은 금지한다.

## 19.2 WebP

```ts
{
  bytes,
  mime: 'image/webp',
  extension: 'webp',
  codecEvidence: {
    implementationId: 'dadum.webp-emscripten-wasm-v1',
    semanticClass: 'lossless-rgba',
    vp8lChunkPresent: true,
    vp8ChunkPresent: false,
    animated: false,
    nearLossless: 100,
    exactTransparentRgb: true,
    width,
    height
  }
}
```

## 19.3 PNG8

```ts
{
  bytes,
  mime: 'image/png',
  extension: 'png',
  codecEvidence: {
    implementationId: 'dadum.lodepng-png-family-emscripten-wasm-v1',
    operation: 'encode.png8',
    bitDepth: 8,
    colorType: 6,
    width,
    height
  }
}
```

## 19.4 PNG16

```ts
{
  bytes,
  mime: 'image/png',
  extension: 'png',
  codecEvidence: {
    implementationId: 'dadum.lodepng-png-family-emscripten-wasm-v1',
    operation: 'encode.png16',
    bitDepth: 16,
    colorType: 6,
    width,
    height,
    expansionPolicyId: string | null
  }
}
```

---

# 20. Export Receipt 확장

R7 Export Receipt에 다음을 추가한다.

```ts
interface CodecPromotionReceiptEvidence {
  executionRealm: 'dedicated-worker';
  codecImplementationId: string;
  codecProtocolVersion: string;
  wasmArtifactSha256: string;
  codecSelfTestId: string;
  codecSelfTestPassed: boolean;
  semanticClass: string;
  mainThreadEncodeObserved: false;
  mainThreadFallbackObserved: false;
  structuralVerifierId: string;
  structuralVerified: true;
  pixelRoundTripVerifierId: string;
  pixelRoundTripVerified: boolean;
  inputPixelDigest: string;
  decodedPixelDigest: string | null;
  metadataPolicyId: string;
  metadataAppliedDigest: string;
}
```

Promotion Runtime에서 Pixel Round-trip을 매 Export마다 수행할 필요는 없다.

정책:

```text
Every Export
→ Structural Verification
→ Output SHA-256
→ Codec Evidence

Promotion / Regression Corpus
→ Independent Decode Pixel Round-trip
```

단 Debug Strict Mode에서는 매 Export Round-trip을 선택할 수 있다.

---

# 21. Stable Error Registry

추가 Error Code:

```text
E_CODEC_OPTION_SEMANTIC_MISMATCH
E_CODEC_TRANSPARENT_RGB_MISMATCH
E_CODEC_PAYLOAD_KIND_MISMATCH
E_CODEC_PIXEL_ROUNDTRIP_MISMATCH
E_CODEC_INPUT_PRECISION_MISMATCH
E_CODEC_ENDIANNESS_MISMATCH
E_CODEC_METADATA_INJECTION_FAILED
E_CODEC_METADATA_VERIFICATION_FAILED
E_CODEC_PNG_CHUNK_INVALID
E_CODEC_PNG_COLOR_TYPE_MISMATCH
E_CODEC_DIMENSION_MISMATCH
E_WORKER_CODEC_SELF_TEST_FAILED
E_WORKER_PTHREAD_UNAVAILABLE
E_WORKER_PTHREAD_LEAK
E_WORKER_WASM_ARTIFACT_UNVERIFIED
E_RENDERER_MAIN_ENCODER_REACHABLE
E_CODEC_LEGACY_FALLBACK_REACHABLE
```

모든 Error는 다음을 포함한다.

```text
exportJobId
runtimeEncoderId
workerId
workerGeneration
operation
finalRevision
stableErrorCode
```

---

# 22. 상태 머신

## 22.1 Codec Promotion State

```text
DISCOVERED
→ ARTIFACT_VERIFIED
→ WASM_READY
→ SELF_TESTING
→ SELF_TEST_PASSED
→ ELIGIBLE
→ ACTIVE
```

실패:

```text
ARTIFACT_UNVERIFIED
WASM_FAILED
SELF_TEST_FAILED
CAPABILITY_UNAVAILABLE
CIRCUIT_OPEN
```

`ACTIVE`는 단순 Worker READY와 다르다.

```text
Worker READY
+ Artifact Verified
+ Codec Self-test PASS
+ Runtime Capability PASS
+ Encoder Registry Exact Binding PASS
= Codec ACTIVE
```

## 22.2 PNG Family Operation State

```text
IDLE
→ INPUT_VALIDATED
→ HEAP_ALLOCATED
→ INPUT_COPIED
→ NATIVE_ENCODING
→ OUTPUT_COPIED
→ NATIVE_OUTPUT_FREED
→ INPUT_FREED
→ METADATA_APPLIED
→ STRUCTURE_VERIFIED
→ RESULT
```

어느 단계에서 실패해도:

```text
inputPtr free exactly once
pngbuffer free at most once
Broker Job settle exactly once
```

---

# 23. 메모리 계약

## 23.1 WebP

기록 항목:

```text
inputByteLength
brokerSnapshotByteLength
wasmInputAllocationBytes
wasmOutputBytes
jsOutputCopyBytes
metadataRewriteBytes
peakWorkerHeapBytes
```

목표:

```text
Caller → Broker Snapshot: 1 copy max
Broker → Worker: transfer or shared
Worker → WASM Heap: 1 copy
WASM Output → JS: 1 copy
Worker → Renderer: transfer
```

## 23.2 PNG Family

기록 항목:

```text
inputByteLength
wasmInitialMemoryBytes
wasmPeakMemoryBytes
pthreadCount
nativeOutputBytes
jsOutputCopyBytes
metadataRewriteBytes
```

최소 Gate:

```text
WASM input malloc leak = 0
pngbuffer leak = 0
per-job retained bytes after settle = 0
post-restart old generation retained bytes = 0
```

---

# 24. 파일별 구현 계획

## 24.1 신규

```text
app/legacy-runtime/encoders/png_lode_bridge.mjs
app/legacy-runtime/worker-codecs/png-family-handler.js
app/src/runtime/workers/entries/png-family.worker.ts
app/src/runtime/codecs/codec-structural-verifier.ts
app/src/runtime/codecs/png-chunk-parser.ts
app/src/runtime/codecs/webp-riff-parser.ts
app/src/runtime/codecs/codec-promotion-types.ts
scripts/generate-codec-promotion-manifest.mjs
scripts/verify-export-worker-03.mjs
```

## 24.2 수정

```text
app/legacy-runtime/export_manager.js
app/legacy-runtime/worker-codecs/webp-lossless-handler.js
app/legacy-runtime/encoders/webp_api.js
app/legacy-runtime/encoders/png16_lode_bridge.mjs
app/src/runtime/workers/generated-worker-manifest.ts
app/src/runtime/workers/generated-worker-manifest.json
app/src/runtime/workers/encoder-worker-types.ts
app/src/runtime/workers/encoder-worker-broker-service.ts
app/src/runtime/codecs/encoder-registry-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/boot/stable-error.ts
vite.config.ts
package.json
```

## 24.3 Retire / Quarantine Candidate

```text
Active window.UPNG PNG registration
Active renderer-main PNG encode branch
Active Canvas PNG fallback branch
Active Canvas WebP fallback branch for webp-lossless
dadum.worker.encoder.png16-v1 manifest entry
dadum-png16-worker-v1 protocol entry
```

파일 삭제는 필수 아님.

Active Reachability 제거가 필수다.

---

# 25. ExportManager 변경

## 25.1 PNG8

기존 직접 UPNG Handler를 다음으로 교체한다.

```js
ExportManager.registerLazy(
  'png',
  async () => async (payload = {}) => {
    return await window.DadumRuntimeWorkerBridge.call({
      workerId: 'dadum.worker.encoder.png-family-v1',
      runtimeEncoderId: 'dadum.encoder.png.v1',
      codecProtocolVersion: 'dadum-png-family-worker-v1',
      operation: 'encode.png8',
      payload: buildCanonicalPng8Payload(payload),
      inputOwnershipPolicyId: 'broker-transfer-snapshot-v1',
      ...
    });
  },
  1
);
```

## 25.2 PNG16

Worker ID와 Protocol을 PNG Family로 교체한다.

```text
dadum.worker.encoder.png16-v1
→ dadum.worker.encoder.png-family-v1

dadum-png16-worker-v1
→ dadum-png-family-worker-v1
```

## 25.3 WebP Lossless

다음 Option을 Exact Payload에서 고정한다.

```text
lossless: true
nearLossless: 100
exactTransparentRgb: true
```

호출자가 다른 값을 전달하면 덮어쓰지 않고 실패한다.

---

# 26. Encoder Registry 변경

`EncoderRegistryService`는 Worker Binding을 다음처럼 확인한다.

```text
webp-lossless
→ webp-lossless worker v2
→ exact lossless capability required

png
→ png-family worker
→ encode.png8 capability required

png16
→ png-family worker
→ encode.png16 capability required
```

한 Worker가 두 Encoder를 소유해도 Runtime Encoder Identity는 합치지 않는다.

```text
Worker Identity != Encoder Identity
```

PNG8과 PNG16은 같은 Worker를 사용하지만 각각 별도의 제품 의미와 Receipt를 유지한다.

---

# 27. Artifact Digest

## 27.1 WebP Artifact Set

최소 포함:

```text
webp-lossless.worker emitted JS
webp-lossless-handler emitted chunk
webp_api emitted chunk
webp_bindings_qmap emitted JS
webp_bindings_qmap.wasm
metadata resolution module emitted chunk
```

## 27.2 PNG Artifact Set

최소 포함:

```text
png-family.worker emitted JS
png-family-handler emitted chunk
png_lode_bridge emitted chunk
lodepng_wasm emitted JS
lodepng_wasm.wasm
pthread bootstrap emitted asset
png metadata normalizer emitted chunk
```

Source Graph Digest와 Emitted Artifact Set Digest를 둘 다 기록한다.

Production Promotion은 `emitted-asset-sha256`만 인정한다.

`source-graph-only`는 SOURCE_BAKED_UNPROMOTED만 가능하다.

---

# 28. 정적 Gate

## GATE-EW03-01 Canonical Worker Identity

제품 Manifest에 다음이 정확히 존재해야 한다.

```text
dadum.worker.encoder.webp-lossless-v1
dadum.worker.encoder.png-family-v1
```

다음은 없어야 한다.

```text
dadum.worker.encoder.png16-v1
```

## GATE-EW03-02 PNG Family Ownership

PNG Family Worker의 Owner Encoder가 정확히 다음이어야 한다.

```text
dadum.encoder.png.v1
dadum.encoder.png16.v1
```

## GATE-EW03-03 Operation Set

```text
encode.png8
encode.png16
```

외 Operation은 금지한다.

## GATE-EW03-04 Main-thread PNG Encoder Reachability Zero

Active Graph에서 `UPNG.encode` 호출이 Export Path에 도달하지 않아야 한다.

## GATE-EW03-05 Main-thread WebP Lossless Reachability Zero

`webp-lossless` Exact Path가 Canvas 또는 Renderer WASM에 도달하지 않아야 한다.

## GATE-EW03-06 Canvas Fallback Zero

`webp-lossless`, `png`, `png16` Active Path에서 Canvas Encode Branch 0.

## GATE-EW03-07 WebP Option Exactness

`nearLossless !== 100`을 허용하는 제품 경로 0.

## GATE-EW03-08 WebP VP8L Verifier Presence

VP8L·VP8·ANIM·ANMF 구조 검사 코드가 Runtime Verifier에 존재해야 한다.

## GATE-EW03-09 Transparent RGB Fixture

Alpha 0 hidden RGB fixture가 Promotion Corpus에 존재해야 한다.

## GATE-EW03-10 PNG8 Native Symbol

`_png_encode_rgba8`이 Ready Symbol Set에 포함돼야 한다.

## GATE-EW03-11 PNG16 Native Symbol

`_png_encode_rgba16`이 Ready Symbol Set에 포함돼야 한다.

## GATE-EW03-12 One PNG WASM Instance

PNG8·PNG16이 같은 Module Promise를 사용해야 한다.

## GATE-EW03-13 Metadata SSOT

Worker가 `window.currentDPI`, `window.iccProfileBuffer`를 참조하지 않아야 한다.

## GATE-EW03-14 PNG Bit-depth Binding

```text
encode.png8 → bitDepth 8
encode.png16 → bitDepth 16
```

정적 매핑이 존재해야 한다.

## GATE-EW03-15 PNG Color Type

Canonical Output Color Type 정책이 RGBA 6으로 고정돼야 한다.

## GATE-EW03-16 No Silent Precision Conversion

PNG8 요청에서 RGBA16을 익명 down-convert하는 경로 0.

## GATE-EW03-17 Artifact SHA Non-null in Promotion

Production Receipt에서 WASM SHA null 금지.

## GATE-EW03-18 Pthread Capability Declaration

PNG Family Descriptor에 Isolation·SAB·Atomics 요구가 선언돼야 한다.

## GATE-EW03-19 Pthread Artifact Inclusion

PNG Artifact Set에 Pthread Bootstrap이 포함돼야 한다.

## GATE-EW03-20 Stable Errors Registered

EW03 Error Code 전부 Registry에 존재해야 한다.

## GATE-EW03-21 R7 Exact Binding

요청 Format과 Applied Format이 동일해야 한다.

## GATE-EW03-22 EW02 Broker-only Job Submission

Legacy Handler에 Raw Lease·Raw postMessage·Local Pending Map 0.

## GATE-EW03-23 Output Envelope Completeness

Result에 bytes·mime·extension·codecEvidence·metadataEvidence가 모두 있어야 한다.

## GATE-EW03-24 Main-thread Zero Receipt Schema

Receipt에 Main-thread Encode Count 필드가 있어야 한다.

## GATE-EW03-25 Pixel Digest Schema

Input·Decoded Pixel Digest 필드가 Promotion Artifact에 있어야 한다.

## GATE-EW03-26 PNG Chunk Parser

CRC·IHDR·IEND·pHYs·iCCP·sRGB를 파싱해야 한다.

## GATE-EW03-27 WebP RIFF Parser

RIFF Chunk Boundary와 Padding을 검증해야 한다.

## GATE-EW03-28 No Duplicate Encoder Registration

`png`, `png16`, `webp-lossless` 각각 Active Registry Entry 1개.

## GATE-EW03-29 Legacy Worker ID Zero

`png16-v1` Worker ID Active Reference 0.

## GATE-EW03-30 Source Graph Determinism

동일 Source에서 Worker Manifest Digest 100/100 동일.

---

# 29. Runtime Test Matrix

## RT-EW03-01 WebP Opaque Exact

Opaque RGBA fixture가 exact round-trip.

## RT-EW03-02 WebP Alpha Exact

0 < alpha < 255 fixture exact.

## RT-EW03-03 WebP Transparent RGB Exact

alpha 0 hidden RGB exact.

## RT-EW03-04 WebP VP8L

VP8L present, VP8 absent.

## RT-EW03-05 WebP Near 99 Rejection

`nearLossless=99`가 `E_CODEC_OPTION_SEMANTIC_MISMATCH`.

## RT-EW03-06 WebP Lossless False Rejection

`lossless=false` 거부.

## RT-EW03-07 WebP Canvas Fallback Injection

WASM symbol 제거 시 Canvas로 가지 않고 실패.

## RT-EW03-08 WebP Metadata

Resolution Metadata parse round-trip.

## RT-EW03-09 WebP Dimension Mismatch

출력 dimension mismatch 실패.

## RT-EW03-10 WebP Artifact SHA

READY의 WASM SHA가 emitted asset과 일치.

## RT-EW03-11 PNG8 Solid

RGBA8 solid fixture exact.

## RT-EW03-12 PNG8 Alpha

RGBA8 alpha fixture exact.

## RT-EW03-13 PNG8 Transparent RGB

alpha 0 hidden RGB exact.

## RT-EW03-14 PNG8 IHDR

bitDepth 8, colorType 6.

## RT-EW03-15 PNG8 Metadata Resolution

pHYs exact.

## RT-EW03-16 PNG8 ICC

iCCP decompress 후 ICC SHA exact.

## RT-EW03-17 PNG8 CRC

모든 Chunk CRC PASS.

## RT-EW03-18 PNG8 Main-thread Zero

Renderer Encode Instrumentation Count 0.

## RT-EW03-19 PNG16 Fixture

Known RGBA16 exact.

## RT-EW03-20 PNG16 Endianness

0x1234 fixture exact.

## RT-EW03-21 PNG16 Alpha

16-bit alpha exact.

## RT-EW03-22 PNG16 IHDR

bitDepth 16, colorType 6.

## RT-EW03-23 PNG16 from RGBA8

u8-times-257 exact.

## RT-EW03-24 PNG16 Metadata Resolution

pHYs exact.

## RT-EW03-25 PNG16 ICC

iCCP exact.

## RT-EW03-26 PNG16 Main-thread Zero

Renderer Encode Count 0.

## RT-EW03-27 Shared Module

PNG8 후 PNG16에서 wasmInstanceOrdinal 동일.

## RT-EW03-28 Reverse Shared Module

PNG16 후 PNG8에서도 동일.

## RT-EW03-29 Queue Mixed

png8 → png16 → png8 FIFO.

## RT-EW03-30 Cancel PNG8

Active Cancel 후 Pending 0.

## RT-EW03-31 Cancel PNG16

Active Cancel 후 Pthread Generation Restart.

## RT-EW03-32 Crash PNG Family

Crash 뒤 old pthread 0, new generation READY.

## RT-EW03-33 Circuit Open

Restart Budget 초과 시 두 Encoder 모두 UNAVAILABLE.

## RT-EW03-34 PNG Metadata Failure

Metadata Injection 실패 시 Output 성공 금지.

## RT-EW03-35 PNG Invalid ICC

잘못된 ICC 입력 Fail-Closed.

## RT-EW03-36 PNG16 Missing Isolation

crossOriginIsolated false면 READY 거부.

## RT-EW03-37 PNG Family WASM Symbol Missing

rgba8 또는 rgba16 symbol 누락 시 Worker 전체 READY 거부.

## RT-EW03-38 WebP WASM Self-test Failure

READY 거부.

## RT-EW03-39 Late Reply

Cancel 이후 late result 폐기.

## RT-EW03-40 Stale Generation

이전 PNG Worker Result 폐기.

## RT-EW03-41 R7 Receipt WebP

requested/applied `webp-lossless`, VP8L evidence.

## RT-EW03-42 R7 Receipt PNG8

requested/applied `png`, bitDepth 8.

## RT-EW03-43 R7 Receipt PNG16

requested/applied `png16`, bitDepth 16.

## RT-EW03-44 Output SHA Determinism

동일 입력·옵션에서 Output SHA 100/100.

## RT-EW03-45 Metadata Determinism

동일 Metadata에서 Chunk Order Digest 100/100.

## RT-EW03-46 No Metadata Determinism

Metadata 없는 출력도 100/100.

## RT-EW03-47 Large PNG8

대형 입력 Memory Budget PASS.

## RT-EW03-48 Large PNG16

대형 입력 Memory Budget PASS.

## RT-EW03-49 WebP Large

대형 입력 Timeout Budget PASS.

## RT-EW03-50 Runtime Dispose

세 Encoder Pending 0, Worker/Pthread 0.

---

# 30. Promotion Corpus

최소 Fixture:

```text
1x1 opaque
1x1 alpha 0 hidden RGB
2x2 mixed alpha
17x13 odd dimensions
257x259 prime-ish dimensions
gradient RGBA8
checker RGBA8
random deterministic RGBA8
RGBA16 low-byte variation
RGBA16 high-byte variation
RGBA16 endian sentinel
transparent RGB sentinel
ICC fixture
asymmetric DPI fixture
large memory fixture
```

각 Fixture는 다음을 가진다.

```text
fixtureId
width
height
sampleDepth
inputPixelSha256
metadataSha256
expectedSemanticClass
```

Random Fixture Seed는 고정한다.

---

# 31. Promotion Artifact

## 31.1 Codec Promotion Receipt

```json
{
  "schema": "dadum.export-worker-03.codec-promotion-receipt.v1",
  "buildId": "...",
  "sourceGraphDigest": "...",
  "workerArtifactSetDigests": {
    "webpLossless": "...",
    "pngFamily": "..."
  },
  "wasmArtifacts": {
    "webp": {
      "sha256": "...",
      "implementationId": "dadum.webp-emscripten-wasm-v1"
    },
    "png": {
      "sha256": "...",
      "implementationId": "dadum.lodepng-png-family-emscripten-wasm-v1"
    }
  },
  "capabilities": {
    "webpLossless": true,
    "png8": true,
    "png16": true
  },
  "mainThread": {
    "pngEncodeCount": 0,
    "webpLosslessEncodeCount": 0,
    "canvasFallbackCount": 0
  },
  "tests": {
    "staticGates": "30/30",
    "runtimeTests": "50/50",
    "roundTripCorpus": "PASS"
  },
  "promotionEligible": true
}
```

## 31.2 Main-thread Isolation Report

```text
Renderer Task Long Duration during encode
Main-thread Function Samples
Worker Function Samples
Canvas Encode API Calls
UPNG Calls
WASM Instantiation Realm
```

## 31.3 Pixel Round-trip Report

포맷별:

```text
fixtureId
inputPixelSha256
decodedPixelSha256
match
decoderIdentity
decoderVersion
```

---

# 32. 성능 Gate

성능은 진실성 이후 평가한다.

## 32.1 Main-thread

```text
Renderer Main-thread Encode CPU Time ≈ 0
Renderer Long Task > 50 ms caused by encode = 0
```

Final Surface Snapshot Copy는 별도 accounting한다.

## 32.2 Worker

Warm Encode 기준:

```text
PNG8 p95
PNG16 p95
WebP Lossless p95
```

정확한 절대 Threshold는 Promotion Hardware Receipt에 귀속한다.

기본 Hardware:

```text
Ryzen 5950X
RTX 3080
64 GB RAM
Windows
Electron Production Build
```

본 명세는 무근거 절대 수치를 박지 않는다.

대신 이전 Main-thread PNG8 대비 다음을 요구한다.

```text
Main-thread Block Time 감소
Worker Encode 성공률 100%
Pixel Truth 회귀 0
```

---

# 33. Rollback

Rollback은 다음 단위로 수행한다.

```text
EW03 Source Patch
Worker Manifest
Encoder Binding
Codec Promotion Receipt
```

Rollback 시 EW02 상태로 돌아간다.

단 Rollback이 Main-thread UPNG를 자동으로 제품 승격시키지는 않는다.

EW03 Rollback 결과는:

```text
webp-lossless = EW02 Worker Path
png16 = EW02 Worker Path
png = EW02 Main-thread Path
promotionEligible = false
```

Rollback Receipt에 Main-thread PNG 재노출을 명시한다.

---

# 34. 승격 조건

다음이 모두 PASS해야 `PROMOTED`다.

```text
GATE-EW03-01..30 PASS
RT-EW03-01..50 PASS
WebP VP8L PASS
WebP exact RGBA round-trip PASS
Transparent RGB exact PASS
PNG8 exact RGBA8 round-trip PASS
PNG16 exact RGBA16 round-trip PASS
PNG8 IHDR 8/6 PASS
PNG16 IHDR 16/6 PASS
Metadata round-trip PASS
Main-thread Encode Count 0
Canvas Fallback Count 0
UPNG Active Reachability 0
WASM Artifact SHA non-null
PNG Pthread Leak 0
EW02 Pending 0
R7 Export Receipt parity 100/100
Production Vite Build PASS
Electron Runtime E2E PASS
```

하나라도 미달이면:

```text
SOURCE_BAKED_UNPROMOTED
```

또는:

```text
RUNTIME_VALIDATED_UNPROMOTED
```

로 남긴다.

---

# 35. 완료 정의

EW03 완료 뒤 다음 문장이 사실이어야 한다.

> **다듬다듬의 WebP Lossless는 실제 VP8L·정확한 RGBA 보존으로 증명되며, PNG8과 PNG16은 동일한 LodePNG WASM을 소유한 Canonical PNG Family Worker에서만 생성된다. Renderer Main Thread에는 세 포맷의 Encoder·Canvas Fallback·UPNG 제품 경로가 남지 않고, 출력 바이트·비트 깊이·메타데이터·픽셀 왕복·WASM Artifact가 하나의 Export Receipt 체인으로 증명된다.**

---

# 36. 구현 순서

```text
EW03-A
PNG Family Worker Identity / Manifest Migration

EW03-B
LodePNG RGBA8 Native Bridge / Shared Module

EW03-C
PNG8 ExportManager Rebind / UPNG Active Retirement

EW03-D
WebP Lossless Option Truth / VP8L Structural Parser

EW03-E
PNG Chunk Parser / Metadata Normalizer

EW03-F
Codec Self-test / Artifact SHA / Capability Gate

EW03-G
Pixel Round-trip Corpus / Independent Decoder

EW03-H
Main-thread Zero Instrumentation / Electron E2E

EW03-I
Promotion Receipt / Rollback Receipt
```

---

# 37. 다음 명세

EW03 이후 다음은 PSD다.

```text
TDT-EXPORT-WORKER-04

PSD Rust/WASM Canonical Serializer /
PSD8·PSD16 Execution Truth /
Layered vs Flattened Identity /
Plane Ownership /
Serializer Round-trip Seal
```

JXL·JPEG Worker 이전은 PSD Serializer 권위 이후로 둔다.

---

# 38. 최종 판정표

| 항목 | EW02 상태 | EW03 목표 |
|---|---:|---:|
| WebP Lossless Worker | 있음 | 의미·VP8L·픽셀 Truth 승격 |
| WebP Canvas Fallback | Worker에서 비활성 | Active Reachability 0 봉인 |
| WebP nearLossless | 임의 값 가능 | 100 고정, 그 외 거부 |
| WebP WASM SHA | null | Production SHA 필수 |
| PNG8 Worker | 없음 | PNG Family Worker |
| PNG8 Main Thread | UPNG | 0 |
| PNG16 Worker | 전용 ID | PNG Family로 승격 |
| PNG8/16 WASM | 분리 의미 | 단일 Module·단일 Pthread Pool |
| PNG Metadata | 포맷별 상이 | 공통 Canonical Policy |
| Pixel Round-trip | 미증명 | 독립 Decoder PASS |
| Transparent RGB | 미증명 | exact PASS |
| Main-thread Receipt | 없음 | Encode Count 0 |
| Artifact Truth | source graph | emitted asset SHA |
| Product Status | SOURCE_BAKED_UNPROMOTED | E2E 통과 시 PROMOTED |

---

# 39. 봉인 문구

```text
No False Lossless.
No Main-thread PNG.
No Canvas Codec Fallback.
No Bit-depth Ambiguity.
No Silent Metadata Drop.
No Unverified WASM Artifact.
No Hidden Pthread Leak.
One PNG Worker.
One PNG WASM Authority.
One Receipt Chain.
```
