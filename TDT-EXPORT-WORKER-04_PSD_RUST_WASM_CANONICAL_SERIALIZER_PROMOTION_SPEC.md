# TDT-EXPORT-WORKER-04
## PSD Rust/WASM Canonical Serializer / Layered·Flattened Document Unification / Main-thread Byte Writer Zero / Resource·Structure Truth Seal

> **상태:** IMPLEMENTATION SPECIFICATION  
> **부모 봉인:** `TDT-EXPORT-WORKER-03`  
> **상위 권위:** `TDT-EXPORT-WORKER-02`, `TDT-RUNTIME-SSOT-01-R7`  
> **대상 저장소:** 다듬다듬 Vite·Vue3·Pinia Runtime + Legacy ExportManager  
> **직접 대상:** PSD 8-bit RGB Layered, PSD 8/16-bit RGB Flattened, PSD 8-bit CMYK Flattened  
> **승격 성격:** PSD 파일 구조 직렬화 권위의 Rust/WASM Worker 단일화  
> **후속 명세:** `TDT-EXPORT-WORKER-05 JXL Dedicated Worker Promotion Seal`

---

# 0. 문서 목적

EW01은 Worker 생성권·URL·Epoch·Artifact Identity를 Runtime으로 회수했다.

EW02는 Worker Job ID·입력 스냅샷·FIFO·Timeout·Abort·Cancel·Crash Restart·Pending Closure를 `EncoderWorkerBrokerService`로 회수했다.

EW03은 WebP Lossless와 PNG8·PNG16을 Canonical Worker Codec으로 승격하고 Main-thread PNG Byte Writer를 제거했다.

그러나 PSD는 여전히 하나의 Encoder Identity 아래에서 서로 다른 직렬화 권위를 사용한다.

현재 코드 기준선은 다음과 같다.

```text
PSD 8-bit RGB + proofApplied != true
→ app/legacy-runtime/libs/psd/psd_export_bridge.js
→ buildLayeredPSD8()
→ Renderer Main Thread JavaScript가 직접 8BPS Header·Image Resource·Layer Record·Channel Data 작성
→ workerBacked:false
→ implementationId: dadum.psd-layered-js-v1

PSD RGB16 또는 proofApplied == true
→ Renderer Main Thread에서 Plane Split 또는 LCMS RGBA8→CMYK8 수행
→ PSDW request-codec v1 작성
→ EW02 Broker
→ dadum.worker.encoder.psd-export-v1
→ Rust/WASM export_flattened_psd()
→ Renderer Main Thread에서 injectResolutionResourceIntoPSD()로 결과 바이트 재작성
→ workerBacked:true
```

현재 `psd_exporter_wasm` 패키지는 다음 API만 제공한다.

```text
export_flattened_psd(request_bytes: Uint8Array): Uint8Array
request_codec_version(): number  // 현재 1
```

현재 `PSDW v1`은 Flattened Plane Request만 표현하며 Layer Record·Merged Composite·Resource Policy를 하나의 Document Model로 표현하지 못한다.

또한 Runtime의 PSD 출력 검증은 현재 `8BPS` Magic Byte만 확인한다.

```text
case 'psd':
  if (startsWith(bytes, [0x38, 0x42, 0x50, 0x53])) PASS
```

따라서 다음 거짓 성공이 가능하다.

- Header만 `8BPS`이고 뒤 Section Length가 파손된 파일
- 요청한 Width·Height·Depth·Color Mode와 다른 PSD
- Layered 요청인데 Layer/Mask Section이 비어 있는 파일
- Flattened 요청인데 임의 Layer Record가 섞인 파일
- DPI Resource가 없거나 두 개 이상인 파일
- ICC Resource가 조용히 누락된 파일
- Main-thread JS Layered Serializer가 성공했지만 Worker-backed Encoder로 오인되는 파일
- Worker 출력 뒤 Main-thread Post-process가 바이트를 바꿨지만 Worker Output SHA로 기록되는 파일
- CMYK Plane Inversion·Alpha Channel Ordering이 요청과 다른 파일

본 명세는 PSD의 Plane 준비 위치를 당장 전부 Worker로 옮기지 않는다.

대신 PSD 파일 바이트를 쓰는 권위를 Rust/WASM Worker 하나로 회수한다.

```text
Final Surface
→ Plane Preparation Contract
→ PSD Document Plan v2
→ EW02 Broker
→ Canonical PSD Worker
→ Rust/WASM Canonical Serializer
→ PSD Structural Verifier
→ Independent PSD Decoder Round-trip
→ R7 Export Receipt
```

Renderer Main Thread는 Pixel Plane과 Metadata Input을 준비할 수 있지만, `8BPS` Header·Section Length·Image Resource·Layer Record·Channel Data Compression·Merged Image Data를 직접 쓸 수 없다.

# 1. 한 문장 목표

> **PSD 8-bit RGB Layered와 RGB8·RGB16·CMYK8 Flattened 출력을 하나의 Rust/WASM Canonical Serializer Worker에 통합하고, Main-thread PSD Byte Writer·출력 후 Resource Patch·Magic-only 검증을 0으로 만들며, Document Mode·Layer Count·Color Mode·Depth·Alpha·DPI·ICC·Compression·Plane Digest가 독립 Decoder와 일치할 때만 PSD Export Receipt를 발급한다.**

# 2. 소스 기준 사실과 명세 판단 분리

## 2.1 소스에서 확정되는 사실

- `buildLayeredPSD8()`는 Renderer Main Thread JavaScript에서 PSD 전체 바이트를 작성한다.
- `exportPSD()`는 RGBA8이고 `proofApplied !== true`이면 무조건 `buildLayeredPSD8()` 경로를 선택한다.
- 이 경로의 Evidence는 `workerBacked:false`, `executionRealm:'renderer-main'`, `implementationId:'dadum.psd-layered-js-v1'`이다.
- RGB16과 CMYK Proof 경로는 `encodeFlattenedPSDRequest()`로 `PSDW v1` Request를 작성한다.
- `PSDW v1`은 Color Mode·Depth·Compression·Plane Headers·ICC Bytes를 담지만 Layer Model은 담지 않는다.
- Worker는 `export_flattened_psd()` 한 함수만 호출한다.
- Worker 초기화는 `request_codec_version() === 1`만 허용한다.
- Worker 출력 후 `injectResolutionResourceIntoPSD()`가 Renderer Main Thread에서 PSD Image Resource Block을 다시 작성한다.
- CMYK 변환과 CMYK Plane Inversion은 Renderer Main Thread에서 수행된다.
- RGB8·RGB16 Plane Split도 Renderer Main Thread에서 수행된다.
- Runtime Encoder Registry의 PSD Verifier는 현재 `8BPS` Signature만 확인한다.
- Export Authority는 PSD에 한해 Worker Binding이 있어도 `workerBacked:false`를 허용하는 예외를 둔다.

## 2.2 본 명세의 설계 판단

- PSD Binary Serialization SSOT는 Rust/WASM Worker여야 한다.
- Layered와 Flattened는 Encoder Identity를 나누지 않고 하나의 Document Plan Mode로 표현해야 한다.
- Plane Split과 LCMS는 EW04에서 이동하지 않아도 된다.
- Plane Preparation Realm은 Receipt에 명시되어야 한다.
- Worker 출력 뒤 PSD Byte Post-process는 금지해야 한다.
- DPI와 ICC는 Serializer Request에 포함되어 Rust/WASM이 한 번에 기록해야 한다.
- PSD Worker Identity와 Protocol은 ABI가 바뀌므로 새 Identity로 승격해야 한다.
- `8BPS` Magic-only 검증은 폐기하고 Section Boundary·Document Contract·Independent Decode 검증으로 교체해야 한다.

# 3. 핵심 권위선

```text
Runtime Export Authority
→ dadum.encoder.psd.v1
→ Final Surface Binding
→ PSD Export Mode Resolver
→ Plane Preparation Adapter
   ├─ RGB8 split, renderer-main 허용
   ├─ RGB16 split, renderer-main 허용
   └─ RGBA8→CMYK8 LCMS, renderer-main 허용
→ PSD Document Plan v2
→ EncoderWorkerBrokerService.call()
→ dadum.worker.encoder.psd-canonical-v1
→ dadum-psd-canonical-worker-v1
→ Rust/WASM dadum.psd-rust-wasm-serializer-v2
→ serialize_psd_document_v2()
→ Immutable PSD Bytes
→ PSD Structure Verifier v2
→ Independent PSD Decoder Round-trip
→ Worker Job Receipt
→ PSD Codec Promotion Receipt
→ R7 Export Receipt
```

권위 경계는 다음과 같다.

```text
Plane Content Authority
= Plane Preparation Adapter

PSD Binary Structure Authority
= Rust/WASM Canonical Serializer

Worker Lifetime and Job Authority
= EW02 EncoderWorkerBrokerService

Output Admission Authority
= Runtime Encoder Registry Verifier

Final Export Truth Authority
= R7 ExportAuthorityService Receipt
```

# 4. 범위

## 4.1 포함

- 8-bit RGB Single-layer PSD
- 8-bit RGB Flattened PSD
- 16-bit RGB Flattened PSD
- 8-bit CMYK Flattened PSD
- 선택적 Transparency Channel
- ResolutionInfo Image Resource `1005`
- ICC Profile Image Resource `1039`
- RAW Compression
- RLE Compression
- Rust/WASM Request Codec v2
- Canonical PSD Worker Identity 교체
- Main-thread PSD Byte Writer 제거
- PSD Structure Verifier v2
- 독립 PSD Decoder Round-trip
- Worker·Serializer·Metadata·Plane Evidence의 Export Receipt 결속

## 4.2 제외

- Multi-layer Arbitrary Document Editor Export
- Adjustment Layer
- Layer Mask
- Vector Mask
- Smart Object
- Text Layer
- Blend Mode 확장
- Group·Folder Layer
- Spot Channel
- Duotone
- Lab PSD 제품 승격
- 32-bit Float PSD
- PSB Large Document Format
- ZIP·ZIP Prediction의 무조건 승격
- LCMS Transform의 Worker 이전
- RGB/CMYK Plane Split의 Worker 이전
- GPU Readback 변경
- PSD Decoder 자체의 제품 승격
- PSD Preview Thumbnail 생성
- EXIF·XMP Resource 확장
- Main Thread 전체 Image Processing Zero

Plane Split·LCMS Worker 폐쇄는 후속 PSD 단계의 범위다.

# 5. 현재 이중 권위 제거 결정

## 5.1 폐기되는 활성 함수

다음 함수는 Active Export Graph에서 호출될 수 없다.

```text
buildLayeredPSD8
injectResolutionResourceIntoPSD
replaceImageResourceBlock
buildImageResource
buildResolutionInfoResource
buildIccProfileResource
```

이 함수들은 Migration 기간 동안 Quarantine Reference로 보존할 수 있지만, Active Manifest와 ExportManager Reachability는 0이어야 한다.

## 5.2 유지되는 준비 함수

EW04에서는 다음 준비 로직을 유지할 수 있다.

```text
splitRGBA8ToPlanes
splitRGBA16ToPlanes
convertRgba8ToCmykPlanes
splitCmykInterleavedToPlanes
normalizeICC
normalizeSourceICC
loadBundledSrgbICCBytes
```

단, 결과는 직접 PSD 바이트로 쓰지 않고 `PSDDocumentPlanV2`에만 들어간다.

## 5.3 Post-process 금지

Rust/WASM이 반환한 `Uint8Array`는 Immutable Final Encoder Output이다.

다음은 금지된다.

```text
Worker Result
→ DPI Injection
→ ICC Injection
→ Layer Block Patch
→ Header Patch
→ Channel Count Patch
→ Compression Patch
```

허용되는 상위 작업은 Blob wrapping·SHA-256·Read-only Verification뿐이다.

# 6. Worker Identity 승격

기존 Identity:

```text
workerId: dadum.worker.encoder.psd-export-v1
codecProtocolVersion: dadum-psd-export-worker-v1
operation: encode.psd-flattened
wasmImplementationId: dadum.psd-rust-wasm-exporter-v1
requestCodecVersion: 1
```

신규 Canonical Identity:

```text
workerId: dadum.worker.encoder.psd-canonical-v1
codecProtocolVersion: dadum-psd-canonical-worker-v1
operation: serialize.psd-document
wasmPolicyId: psd-rust-wasm-canonical-serializer-v2
wasmImplementationId: dadum.psd-rust-wasm-serializer-v2
requestCodecId: dadum-psd-document-plan-v2
requestCodecVersion: 2
```

기존 Worker ID는 Active Manifest에서 0건이어야 한다.

호환 Alias를 둘 수 있지만 Alias는 Worker를 생성하거나 Job을 제출할 수 없다.

# 7. PSD Document Plan v2

## 7.1 목적

`PSDW v1`은 Flattened Plane Bundle이다.

`PSD Document Plan v2`는 Layered와 Flattened를 모두 표현하는 Canonical Binary Request다.

이 Plan은 PSD 파일 자체가 아니다.

```text
PSD Document Plan v2
= 검증 가능한 Serializer Input
≠ PSD Output Bytes
```

## 7.2 Header

```ts
interface PSDDocumentPlanV2Header {
  magic: 'PSDP';
  version: 2;
  documentMode:
    | 'layered-rgb8-single-layer'
    | 'flattened-rgb8'
    | 'flattened-rgb16'
    | 'flattened-cmyk8';
  width: number;
  height: number;
  colorMode: 'rgb' | 'cmyk';
  depth: 8 | 16;
  compression: 'raw' | 'rle';
  hasTransparency: boolean;
  layerCount: 0 | 1;
  mergedCompositeIncluded: true;
}
```

## 7.3 Resource Descriptor

```ts
interface PSDResourcePlanV2 {
  resolution: {
    dpiX: number;
    dpiY: number;
    unit: 'inch';
    policyId: 'dadum.psd-resolution-info-1005-v1';
  };
  icc: null | {
    bytes: Uint8Array;
    sha256: string;
    policyId: 'dadum.psd-icc-resource-1039-v1';
    colorSpace: 'rgb' | 'cmyk';
  };
}
```

## 7.4 Plane Descriptor

```ts
interface PSDPlaneV2 {
  channelId: -1 | 0 | 1 | 2 | 3;
  sampleType: 'u8' | 'u16be';
  byteLength: number;
  sha256: string;
  bytes: Uint8Array;
}
```

## 7.5 Layer Descriptor

```ts
interface PSDLayerPlanV2 {
  layerId: 'layer:0';
  nameUtf8: string;
  top: 0;
  left: 0;
  bottom: number;
  right: number;
  opacity: 255;
  visible: true;
  blendMode: 'norm';
  planes: readonly PSDPlaneV2[];
}
```

## 7.6 Composite Descriptor

```ts
interface PSDCompositePlanV2 {
  planes: readonly PSDPlaneV2[];
}
```

## 7.7 Canonical JSON Evidence

Binary Request와 별도로 Plan Evidence는 Canonical JSON Digest를 가진다.

```text
psdDocumentPlanDigest
= sha256(canonical-json(plan-without-raw-plane-bytes))
```

Raw Plane Bytes는 각 Plane SHA-256으로 결속한다.

# 8. Mode Contract

## 8.1 Layered RGB8 Single Layer

```text
documentMode = layered-rgb8-single-layer
colorMode = rgb
depth = 8
layerCount = 1
mergedCompositeIncluded = true
```

필수 Plane:

```text
Opaque:       0, 1, 2
Transparent: -1, 0, 1, 2
```

Layer Plane과 Composite Plane은 Pixel Content가 같아야 한다.

Layer Name은 UTF-8 Input이지만 Serializer는 PSD Pascal String Encoding 정책에 따라 명시적으로 변환한다.

길이 초과는 조용히 자르지 않는다.

```text
maxEncodedLayerNameBytes = 255
초과 → E_PSD_LAYER_NAME_TOO_LONG
```

## 8.2 Flattened RGB8

```text
documentMode = flattened-rgb8
colorMode = rgb
depth = 8
layerCount = 0
mergedCompositeIncluded = true
```

Layer/Mask Section은 Canonical Empty Form이어야 한다.

## 8.3 Flattened RGB16

```text
documentMode = flattened-rgb16
colorMode = rgb
depth = 16
sampleType = u16be
layerCount = 0
```

Host-endian `Uint16Array`를 Serializer에 직접 넘기지 않는다.

Plane Adapter는 반드시 Big-endian Sample Bytes를 만든다.

## 8.4 Flattened CMYK8

```text
documentMode = flattened-cmyk8
colorMode = cmyk
depth = 8
layerCount = 0
```

필수 Plane:

```text
0 = C
1 = M
2 = Y
3 = K
-1 = optional transparency
```

LCMS의 ink-up bytes와 PSD stored density inversion을 혼동하지 않는다.

Plan Evidence에 다음을 기록한다.

```text
cmykInputConvention = lcms-ink-up-v1
psdStorageConvention = inverted-density-v1
cmykInversionApplied = true
```

# 9. Channel·Alpha Truth

## 9.1 Channel Ordering

Serializer는 `channelId` 의미로 정렬하며 Caller Array Order를 신뢰하지 않는다.

Canonical Order:

```text
RGB  = [0, 1, 2, -1?]
CMYK = [0, 1, 2, 3, -1?]
```

Duplicate Channel ID는 거부한다.

Missing Base Channel은 거부한다.

## 9.2 Transparency Detection

Caller의 `hasTransparency` Boolean만 신뢰하지 않는다.

Plane Preparation Adapter는 Alpha Plane Digest와 `allOpaque` Scan Result를 제공한다.

```text
hasTransparency == false
→ Alpha Plane 금지

hasTransparency == true
→ channelId -1 필수
→ alphaAllOpaque == false 필수
```

불일치 시 `E_PSD_ALPHA_CONTRACT_MISMATCH`.

## 9.3 Hidden RGB

PSD는 Alpha 0 Pixel의 RGB 값을 보존해야 한다.

Promotion Corpus는 Hidden RGB Fixture를 포함한다.

Independent Decoder Round-trip에서 Alpha와 RGB Plane Digest를 각각 비교한다.

# 10. Compression Contract

## 10.1 Mandatory

EW04 Promotion 필수:

```text
raw
rle
```

## 10.2 Deferred

다음은 Rust/WASM이 Capability를 광고하고 별도 Fixture를 통과하기 전까지 거부한다.

```text
zip
zipPrediction
```

Silent Compression Fallback은 금지한다.

```text
requestedCompression = rle
appliedCompression = raw
→ FAIL
```

## 10.3 RLE Truth

RLE은 Row별 Byte Count Table과 Encoded Row Payload의 경계를 검증해야 한다.

검증 항목:

- Row Count = Height × Channel Count
- 각 Row Count가 Section Boundary 안에 존재
- Sum(Row Counts) = RLE Payload Length
- Independent Decoder가 모든 Plane을 복원
- Malformed PackBits Run 거부

# 11. Image Resource Authority

## 11.1 ResolutionInfo 1005

Rust/WASM Serializer가 직접 작성한다.

```text
resourceSignature = 8BIM
resourceId = 1005
xResolution = 16.16 fixed
xResolutionUnit = pixels/inch
yResolution = 16.16 fixed
yResolutionUnit = pixels/inch
```

정확히 하나만 존재해야 한다.

DPI가 0·NaN·Infinity이면 Plan Admission에서 거부한다.

## 11.2 ICC Profile 1039

ICC가 제공된 경우 Rust/WASM이 정확히 하나의 Resource `1039`를 기록한다.

ICC가 제공되지 않은 경우 정책에 따라 0개여야 한다.

```text
iccPolicy = required | optional | forbidden
```

CMYK Flattened는 Destination CMYK ICC가 필수다.

RGB는 Source/Output Policy에 따라 Required 여부를 정한다.

## 11.3 Resource Ordering

Canonical Order:

```text
1005 ResolutionInfo
1039 ICC Profile, 존재 시
기타 향후 Resource는 Numeric ID Ascending
```

## 11.4 Post-output Injection Zero

`injectResolutionResourceIntoPSD()`와 유사한 출력 후 Resource 삽입은 Active Graph에서 0이어야 한다.

# 12. Rust/WASM ABI v2

신규 패키지 API:

```ts
export function serialize_psd_document_v2(requestBytes: Uint8Array): Uint8Array;
export function request_codec_version(): number;       // 2
export function serializer_abi_version(): number;      // 2
export function serializer_capabilities(): Uint8Array; // canonical JSON bytes
export function serializer_self_test_v2(): Uint8Array; // self-test receipt bytes
```

Capability 예시:

```json
{
  "implementationId": "dadum.psd-rust-wasm-serializer-v2",
  "requestCodecVersion": 2,
  "documentModes": [
    "layered-rgb8-single-layer",
    "flattened-rgb8",
    "flattened-rgb16",
    "flattened-cmyk8"
  ],
  "compressions": ["raw", "rle"],
  "imageResources": [1005, 1039],
  "psdVersion": 1,
  "psb": false
}
```

기존 `export_flattened_psd()`는 Compatibility Symbol로 남길 수 있지만 Product Worker가 호출하면 안 된다.

# 13. Worker Initialization Contract

READY 이전 필수 검증:

1. WASM Module Instantiate 성공
2. `request_codec_version() === 2`
3. `serializer_abi_version() === 2`
4. Capability JSON Parse 성공
5. 필수 Document Mode 4종 존재
6. RAW·RLE Capability 존재
7. Resource 1005·1039 Capability 존재
8. Serializer Self-test PASS
9. WASM Artifact SHA-256 Non-null
10. JS Glue SHA-256 Non-null

READY Evidence:

```ts
interface PSDCanonicalReadyEvidence {
  workerBacked: true;
  workerId: 'dadum.worker.encoder.psd-canonical-v1';
  codecProtocolVersion: 'dadum-psd-canonical-worker-v1';
  wasmImplementationId: 'dadum.psd-rust-wasm-serializer-v2';
  requestCodecVersion: 2;
  serializerAbiVersion: 2;
  capabilityDigest: string;
  wasmArtifactSha256: string;
  glueArtifactSha256: string;
  selfTestReceiptDigest: string;
}
```

# 14. Worker Data Protocol

EW02 RPC Envelope는 유지한다.

```text
operation = serialize.psd-document
```

Codec Payload:

```ts
interface PSDCanonicalCallPayload {
  requestBytes: Uint8Array;
  planDigest: string;
  planeDigests: readonly string[];
  requestedMode: PSDDocumentMode;
  requestedCompression: 'raw' | 'rle';
}
```

Worker Result:

```ts
interface PSDCanonicalWorkerResult {
  u8: Uint8Array;
  serializerEvidence: {
    implementationId: 'dadum.psd-rust-wasm-serializer-v2';
    requestCodecVersion: 2;
    serializerAbiVersion: 2;
    documentMode: PSDDocumentMode;
    width: number;
    height: number;
    colorMode: 'rgb' | 'cmyk';
    depth: 8 | 16;
    layerCount: 0 | 1;
    channelCount: number;
    compression: 'raw' | 'rle';
    resolutionResourceWritten: boolean;
    iccResourceWritten: boolean;
    outputByteLength: number;
  };
}
```

Worker Result Buffer는 Transfer된다.

# 15. Main-thread PSD Byte Writer Zero

## 15.1 금지 패턴

Active Runtime Graph에서 다음 패턴이 PSD Export에 사용되면 실패다.

```text
asciiBytes('8BPS')
pushU16(header, 1)
pushU32(layer section length)
manual 8BIM resource construction
manual layer record construction
manual merged image data construction
output byte resource injection
```

## 15.2 허용 패턴

Renderer Main Thread는 다음만 수행할 수 있다.

- Final Surface에서 Plane 데이터 준비
- ICC Bytes 준비
- DPI 값 정규화
- Document Plan v2 Encoding
- Broker Call
- Read-only Result Verification
- Blob wrapping

## 15.3 Export Authority 예외 제거

현재 PSD는 Worker Binding이 있어도 `workerBacked:false`를 허용한다.

EW04 이후 이 예외를 제거한다.

```text
encoder.canonicalFormat === 'psd'
AND workerBacked !== true
→ E_CODEC_MAIN_THREAD_FORBIDDEN
```

# 16. Plane Preparation Boundary

EW04는 Serializer Promotion이다.

Plane Preparation을 숨기지 않는다.

```ts
interface PSDPlanePreparationEvidence {
  planePreparationRealm: 'renderer-main';
  planePreparationImplementationId:
    | 'dadum.psd-plane-split-rgba8-js-v1'
    | 'dadum.psd-plane-split-rgba16-js-v1'
    | 'dadum.psd-cmyk-plane-adapter-js-v1';
  sourcePixelFormat: 'rgba8' | 'rgba16';
  outputPlaneSampleType: 'u8' | 'u16be';
  planeCount: number;
  planeDigests: readonly string[];
  temporaryBytePeak: number;
}
```

EW04 Promotion은 `planePreparationRealm = renderer-main`을 허용한다.

단, `psdByteWriterRealm = renderer-main`은 금지한다.

이 구분이 핵심이다.

# 17. LCMS Boundary

CMYK 경로의 LCMS는 EW04에서 Renderer Main Thread에 남을 수 있다.

Receipt에 다음을 기록한다.

```ts
interface PSDColorTransformEvidence {
  colorTransformApplied: boolean;
  colorTransformRealm: 'renderer-main' | 'none';
  colorTransformImplementationId: 'dadum.lcms-rgba8-to-cmyk8-direct-v1' | null;
  sourceIccSha256: string | null;
  destinationIccSha256: string | null;
  renderingIntent: 'relative-colorimetric';
  blackPointCompensation: true;
  cmykInversionApplied: boolean;
}
```

CMYK 요청에서 LCMS Evidence가 없으면 실패한다.

RGB 요청에서 CMYK Transform Evidence가 있으면 실패한다.

LCMS Worker 이전은 EW04의 완료 조건이 아니다.

# 18. PSD Structure Verifier v2

Magic Byte만 확인하지 않는다.

Verifier ID:

```text
dadum.psd-structure-v2
```

검증 순서:

1. Signature `8BPS`
2. Version `1`
3. Reserved 6 bytes all zero
4. Channel Count 범위
5. Width·Height 일치
6. Depth 8 또는 16 일치
7. Color Mode RGB=3 또는 CMYK=4 일치
8. Color Mode Data Section Boundary
9. Image Resources Section Boundary
10. ResolutionInfo `1005` 정확히 1개
11. ICC `1039` Count가 Policy와 일치
12. Layer and Mask Section Boundary
13. Layered Mode Layer Count = 1
14. Flattened Mode Layer Count = 0
15. Layer Rectangle = Document Bounds
16. Layer Channel ID Set 일치
17. Layer Blend Mode `norm`
18. Layer Opacity 255
19. Merged Image Compression 일치
20. RLE Row Count Table Boundary
21. Entire File EOF Exact

검증 결과:

```ts
interface PSDStructureEvidenceV2 {
  verifierId: 'dadum.psd-structure-v2';
  signatureVerified: true;
  version: 1;
  width: number;
  height: number;
  channels: number;
  depth: 8 | 16;
  colorMode: 3 | 4;
  layerCount: 0 | 1;
  compression: 0 | 1;
  resolutionResourceCount: 1;
  iccResourceCount: 0 | 1;
  allSectionBoundsVerified: true;
  eofExact: true;
}
```

# 19. Independent Decoder Round-trip

Serializer와 같은 Rust Code Path로 검증하면 안 된다.

프로젝트에 이미 존재하는 독립 PSD Decoder Surface를 사용한다.

```text
app/legacy-runtime/vendor/psd/psd_core.mjs
app/legacy-runtime/vendor/psd/psd_core.wasm
app/legacy-runtime/decoders/psd_decode_worker.js
```

Promotion 검증은 별도 Decoder Worker에서 수행한다.

비교 항목:

- Width
- Height
- Channel Count
- Depth
- Color Mode
- ICC Bytes SHA-256
- RGB 또는 CMYK Plane SHA-256
- Alpha Plane SHA-256
- Layer Count
- Layer Name
- Composite Plane SHA-256
- DPI X/Y

Serializer Worker의 내부 Parser는 독립 검증으로 인정하지 않는다.

# 20. Output Immutability

Worker Result SHA-256을 계산한 뒤 바이트가 바뀌면 안 된다.

```text
workerOutputSha256
== verifierInputSha256
== blobInputSha256
== exportReceipt.outputSha256
```

하나라도 다르면 `E_PSD_OUTPUT_MUTATED_AFTER_SERIALIZE`.

Blob 생성 전후 Byte Length도 일치해야 한다.

# 21. Encoder Registry 변경

PSD Template:

```ts
psd: {
  id: 'dadum.encoder.psd.v1',
  canonicalFormat: 'psd',
  workerBinding: {
    workerId: 'dadum.worker.encoder.psd-canonical-v1',
    required: true,
    codecProtocolVersion: 'dadum-psd-canonical-worker-v1',
  },
  verifierId: 'dadum.psd-structure-v2',
}
```

PSD는 이제 모든 지원 Mode에서 Worker-backed가 필수다.

`workerBacked:false` 결과는 Encoder Registry 단계 또는 Export Authority 단계에서 거부한다.

# 22. Export Receipt 확장

R7 Receipt에 다음을 추가한다.

```ts
interface PSDExportReceiptExtension {
  psdPromotionId: 'TDT-EXPORT-WORKER-04';
  psdPromotionState: 'SOURCE_BAKED_UNPROMOTED' | 'PROMOTED';
  psdDocumentMode: PSDDocumentMode;
  psdDocumentPlanDigest: string;
  psdRequestCodecVersion: 2;
  psdSerializerAbiVersion: 2;
  psdSerializerImplementationId: 'dadum.psd-rust-wasm-serializer-v2';
  psdWorkerId: 'dadum.worker.encoder.psd-canonical-v1';
  psdStructureVerifierId: 'dadum.psd-structure-v2';
  psdIndependentDecoderId: string;
  psdIndependentDecodeVerified: boolean;
  psdWidth: number;
  psdHeight: number;
  psdDepth: 8 | 16;
  psdColorMode: 'rgb' | 'cmyk';
  psdLayerCount: 0 | 1;
  psdCompression: 'raw' | 'rle';
  psdHasTransparency: boolean;
  psdPlaneDigests: readonly string[];
  psdCompositeDigest: string;
  psdResolutionDpiX: number;
  psdResolutionDpiY: number;
  psdResolutionResourceCount: 1;
  psdIccSha256: string | null;
  psdIccResourceCount: 0 | 1;
  psdByteWriterRealm: 'worker';
  psdPlanePreparationRealm: 'renderer-main';
  psdColorTransformRealm: 'renderer-main' | 'none';
  psdPostSerializeMutationCount: 0;
}
```

# 23. Capability Gate

PSD Encoder Capability는 다음이 모두 참일 때만 발급한다.

```text
Worker Manifest Entry 존재
Worker Entry URL Resolve 성공
Control Handshake PASS
requestCodecVersion == 2
serializerAbiVersion == 2
WASM Artifact SHA Non-null
Glue Artifact SHA Non-null
Self-test PASS
4개 Document Mode Capability 존재
RAW·RLE Capability 존재
Structure Verifier v2 존재
Independent Decoder Promotion Harness 존재
Main-thread Byte Writer Reachability 0
```

하나라도 실패하면 `dadum.encoder.psd.v1`은 `UNAVAILABLE`이다.

# 24. 상태 머신

```text
UNREGISTERED
→ MANIFEST_BOUND
→ WORKER_LOADING
→ ABI_VERIFYING
→ SELF_TESTING
→ READY_SOURCE_ONLY
→ PROMOTION_VERIFYING
→ PROMOTED
```

실패 상태:

```text
ABI_REJECTED
CAPABILITY_REJECTED
SELF_TEST_FAILED
STRUCTURE_VERIFY_FAILED
ROUNDTRIP_FAILED
MAIN_THREAD_WRITER_DETECTED
ARTIFACT_UNVERIFIED
CIRCUIT_OPEN
```

`READY_SOURCE_ONLY`는 Source Bake에서 허용되지만 제품 Promotion Capability를 발급하지 않는다.

# 25. Stable Error Registry

```text
E_PSD_REQUEST_CODEC_VERSION_MISMATCH
E_PSD_SERIALIZER_ABI_MISMATCH
E_PSD_SERIALIZER_CAPABILITY_MISSING
E_PSD_SERIALIZER_SELF_TEST_FAILED
E_PSD_DOCUMENT_MODE_UNSUPPORTED
E_PSD_DOCUMENT_PLAN_INVALID
E_PSD_DOCUMENT_PLAN_DIGEST_MISMATCH
E_PSD_LAYER_NAME_TOO_LONG
E_PSD_LAYER_COUNT_MISMATCH
E_PSD_CHANNEL_SET_INVALID
E_PSD_DUPLICATE_CHANNEL
E_PSD_ALPHA_CONTRACT_MISMATCH
E_PSD_PLANE_LENGTH_MISMATCH
E_PSD_PLANE_DIGEST_MISMATCH
E_PSD_COMPRESSION_UNSUPPORTED
E_PSD_COMPRESSION_MISMATCH
E_PSD_RESOURCE_POLICY_MISMATCH
E_PSD_RESOLUTION_RESOURCE_MISSING
E_PSD_RESOLUTION_RESOURCE_DUPLICATE
E_PSD_ICC_RESOURCE_MISSING
E_PSD_ICC_RESOURCE_DUPLICATE
E_PSD_STRUCTURE_INVALID
E_PSD_SECTION_BOUNDARY_INVALID
E_PSD_RLE_ROW_TABLE_INVALID
E_PSD_INDEPENDENT_DECODE_FAILED
E_PSD_ROUNDTRIP_MISMATCH
E_PSD_MAIN_THREAD_WRITER_FORBIDDEN
E_PSD_POST_SERIALIZE_MUTATION_FORBIDDEN
E_PSD_OUTPUT_MUTATED_AFTER_SERIALIZE
E_PSD_WORKER_EVIDENCE_INCOMPLETE
E_PSD_PROMOTION_EVIDENCE_INCOMPLETE
```

# 26. 파일별 구현 계획

## 26.1 신규

```text
app/src/runtime/codecs/psd/psd-document-plan-v2.ts
app/src/runtime/codecs/psd/psd-structure-verifier-v2.ts
app/src/runtime/codecs/psd/psd-roundtrip-verifier.ts
app/src/runtime/codecs/psd/psd-receipt-types.ts
app/src/runtime/workers/entries/psd-canonical.worker.ts
app/legacy-runtime/worker-codecs/psd-canonical-handler.js
app/legacy-runtime/libs/psd/request-codec-v2.js
app/legacy-runtime/libs/psd/pkg-v2/psd_exporter_wasm.js
app/legacy-runtime/libs/psd/pkg-v2/psd_exporter_wasm_bg.wasm
app/legacy-runtime/libs/psd/pkg-v2/psd_exporter_wasm.d.ts
scripts/verify-ew04-psd-static.mjs
scripts/verify-ew04-psd-runtime.mjs
```

## 26.2 수정

```text
app/legacy-runtime/libs/psd/psd_export_bridge.js
app/src/runtime/workers/generated-worker-manifest.ts
app/src/runtime/workers/generated-worker-manifest.json
app/src/runtime/workers/encoder-worker-types.ts
app/src/runtime/workers/encoder-worker-broker-service.ts
app/src/runtime/codecs/encoder-registry-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/boot/stable-error.ts
app/src/env.d.ts
package.json
```

## 26.3 Retire·Quarantine

```text
buildLayeredPSD8 active path
injectResolutionResourceIntoPSD active path
psd-export.worker.ts active path
psd-export-handler.js active path
PSDW v1 product call path
dadum.worker.encoder.psd-export-v1 active manifest entry
```

# 27. Migration Strategy

## 27.1 단계 1

v2 Worker를 추가하되 Legacy UI는 기존 `PSDExportBridge.exportPSD()`를 호출한다.

Bridge 내부만 v2 Plan과 Broker Call로 교체한다.

## 27.2 단계 2

Layered RGB8도 v2 Worker 결과를 사용한다.

Main-thread JS Builder는 Shadow Compare에만 사용한다.

Shadow Compare는 제품 바이트로 채택하지 않는다.

## 27.3 단계 3

Structure·Round-trip·Metadata Fixture가 통과하면 JS Builder를 Active Graph에서 제거한다.

## 27.4 단계 4

PSD Worker Binding을 Required로 바꾸고 Export Authority의 PSD 예외를 제거한다.

## 27.5 단계 5

Promotion Receipt 발급 후 v1 Worker를 Quarantine한다.

# 28. Artifact Digest

Canonical PSD Artifact Set:

```text
psd-canonical.worker emitted JS
psd-canonical-handler emitted JS
request-codec-v2 emitted JS
psd_exporter_wasm v2 glue JS
psd_exporter_wasm v2 WASM
serializer capability manifest
serializer self-test fixture corpus
PSD structure verifier source
independent decoder worker JS
independent decoder WASM
```

Promotion Receipt에는 각 SHA-256과 Artifact Set Digest를 기록한다.

Source Bake에서는 Source Graph Digest만 발급할 수 있다.

Emitted Artifact SHA가 없으면 `SOURCE_BAKED_UNPROMOTED`다.

# 29. 정적 Gate

## GATE-EW04-01 Canonical Worker Identity

Active manifest에 `dadum.worker.encoder.psd-canonical-v1`이 정확히 1건 존재하고 기존 `psd-export-v1`은 0건이어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-02 Canonical Operation

PSD Worker operation은 `serialize.psd-document` 하나만 제품 권위로 노출해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-03 Request Codec v2

Product Worker가 `requestCodecVersion=2`를 강제하고 v1을 거부해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-04 Serializer ABI v2

`serializerAbiVersion=2` 검증이 READY 이전에 존재해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-05 Layered JS Writer Reachability Zero

`buildLayeredPSD8()`의 Active Export Reachability가 0이어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-06 Post Serialize Patch Zero

`injectResolutionResourceIntoPSD()`의 Active Reachability가 0이어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-07 All PSD Worker-backed

PSD 모든 Mode가 `workerBacked:true`를 요구해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-08 PSD Export Authority Exception Zero

`canonicalFormat !== psd` 형태의 Worker Evidence 예외가 제거돼야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-09 Document Modes

4개 필수 Document Mode가 Capability에 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-10 Layered Mode Contract

Layered RGB8은 layerCount=1, mergedCompositeIncluded=true를 강제해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-11 Flattened Mode Contract

Flattened Mode는 layerCount=0을 강제해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-12 Channel Canonicalization

RGB·CMYK Channel ID Set 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-13 Duplicate Channel Rejection

Duplicate channelId 거부 코드와 Error Registry가 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-14 Alpha Contract

hasTransparency와 -1 Plane의 일치 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-15 Plane Length

width×height×bytesPerSample 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-16 Plane Digest

각 Plane SHA-256 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-17 U16 Big Endian

RGB16 Plane은 u16be Sample Type만 허용해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-18 CMYK Inversion Evidence

CMYK inversion 정책과 Evidence 필드가 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-19 Compression Exactness

requestedCompression과 appliedCompression 일치 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-20 No Silent ZIP

ZIP·ZIP Prediction은 Capability 없으면 거부해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-21 Resolution Resource Authority

Resource 1005를 Serializer가 직접 쓰고 Exactly One을 검증해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-22 ICC Resource Authority

Resource 1039 Policy와 Count 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-23 Resource Ordering

Canonical Resource Ordering이 Serializer Contract에 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-24 Structure Verifier v2

Magic-only PSD Verifier가 폐기되고 `dadum.psd-structure-v2`가 등록돼야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-25 Section Boundary

Color·Resource·LayerMask·ImageData Section Boundary 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-26 Layer Record Truth

Layer Count·Bounds·Channel Set·Blend Mode·Opacity 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-27 RLE Truth

RLE Row Table Boundary 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-28 Independent Decoder

Serializer와 다른 Decoder Artifact를 사용하는 Round-trip Harness가 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-29 Output Immutability

Worker Output SHA와 Receipt Output SHA 일치 검증이 있어야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-30 Receipt Completeness

EW04 PSD Receipt Extension 필드가 모두 존재해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-31 Stable Errors

EW04 Stable Error가 Registry와 사용처에서 1:1로 일치해야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

## GATE-EW04-32 Source Graph Determinism

동일 소스에서 Worker Manifest·Capability Digest·Build ID가 재현돼야 한다.

실패 시 EW04 Promotion Capability를 발급하지 않는다.

# 30. Runtime Test Matrix

## RT-EW04-01 Layered RGB8 Opaque RAW

단일 Layer, Alpha 없음, RAW, RGB Plane Digest와 Composite Digest 일치.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-02 Layered RGB8 Alpha RAW

Transparency Plane 포함, Hidden RGB Fixture 보존.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-03 Layered RGB8 Opaque RLE

RLE Row Table과 Independent Decode 일치.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-04 Layered RGB8 Alpha RLE

Alpha Plane 포함 RLE Round-trip.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-05 Layer Name UTF-8

한글 Layer Name이 정책에 따라 Encode·Decode 일치.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-06 Layer Name 255 Boundary

최대 길이 성공.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-07 Layer Name Overflow

255 bytes 초과 Fail-Closed.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-08 Flattened RGB8 RAW

Layer Count 0, RGB Composite 일치.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-09 Flattened RGB8 RLE

RLE Composite 일치.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-10 Flattened RGB8 Alpha

Optional Alpha Round-trip.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-11 Flattened RGB16 RAW

u16be Plane Exact Round-trip.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-12 Flattened RGB16 RLE

16-bit RLE Plane Exact Round-trip.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-13 RGB16 Endianness

0x0001,0x0100,0xFFFF Fixture가 뒤집히지 않음.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-14 Flattened CMYK8 RAW

CMYK Plane과 ICC Resource 일치.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-15 Flattened CMYK8 RLE

CMYK RLE Round-trip.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-16 CMYK Alpha

CMYK + Transparency Plane Round-trip.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-17 CMYK Inversion

LCMS ink-up Fixture가 PSD stored density로 정확히 반전.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-18 DPI 72

ResolutionInfo 1005가 72×72.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-19 DPI 300

ResolutionInfo 1005가 300×300.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-20 Non-square DPI

dpiX·dpiY 별도 값 보존.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-21 ICC RGB

RGB ICC Bytes SHA 일치.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-22 ICC CMYK

CMYK Destination ICC Bytes SHA 일치.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-23 ICC Missing Required

CMYK ICC 누락 Fail-Closed.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-24 ICC Duplicate Injection

Duplicate 1039 검출.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-25 Resolution Duplicate

Duplicate 1005 검출.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-26 Bad Signature

8BPS 파손 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-27 Bad Version

PSD Version 2 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-28 Bad Reserved

Reserved bytes non-zero 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-29 Width Mismatch

Plan Width와 Output Header Width 불일치 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-30 Height Mismatch

Plan Height와 Output Header Height 불일치 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-31 Depth Mismatch

요청 16, 출력 8 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-32 Color Mode Mismatch

요청 CMYK, 출력 RGB 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-33 Layer Count Mismatch

Layered 요청, output layerCount 0 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-34 Channel Set Missing

RGB G Plane 누락 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-35 Duplicate Channel

channelId 0 중복 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-36 Alpha Flag Mismatch

hasTransparency와 Alpha Plane 불일치 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-37 Plane Length Short

1 byte 부족 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-38 Plane Digest Mismatch

Admission 이후 Plane Mutation 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-39 Unsupported ZIP

Capability 없는 ZIP 요청 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-40 Compression Mismatch

요청 RLE, Output RAW 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-41 RLE Row Count Overflow

Section 밖 Row Count 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-42 RLE Malformed Run

Invalid PackBits 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-43 Section Length Overflow

Image Resource 길이 Overflow 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-44 Layer Section Truncation

Layer Record truncation 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-45 EOF Trailing Bytes

허용되지 않은 trailing bytes 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-46 Main-thread Writer Injection

JS Builder 반환을 PSD 결과로 주입하면 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-47 Post Serialize Mutation

Worker Result 뒤 DPI Patch 시 SHA mismatch 거부.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-48 Worker Crash

Active Job 실패, Generation Restart, Queue 재개.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-49 Queued Cancel

PSD Job이 Queue에서 취소되고 Pending 0.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-50 Active Cancel

Hard Cancel 뒤 Stale Result 폐기.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-51 Circuit Open

Restart Budget 초과 시 PSD Capability unavailable.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-52 Large RGB8

메모리 Budget 내 대형 RGB8 Layered.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-53 Large RGB16

메모리 Budget 내 대형 RGB16 Flattened.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-54 Large CMYK8

메모리 Budget 내 대형 CMYK8 Flattened.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-55 R7 Receipt

Worker Job Receipt·Structure Evidence·Output SHA 완전 결속.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

## RT-EW04-56 Runtime Dispose

Dispose 뒤 Worker·Pending·Temporary Buffer 0.

기대 결과는 Exactly-once Settlement와 Terminal Pending 0이다.

# 31. Promotion Corpus

필수 Corpus:

```text
01_rgb8_layered_opaque_1x1
02_rgb8_layered_alpha_hidden_rgb_2x2
03_rgb8_layered_rle_gradient_17x13
04_rgb8_flattened_raw_checker
05_rgb8_flattened_rle_alpha
06_rgb16_flattened_endian_fixture
07_rgb16_flattened_gradient
08_cmyk8_flattened_primary_inks
09_cmyk8_flattened_alpha
10_rgb_icc_srgb
11_cmyk_icc_destination
12_dpi_72
13_dpi_300
14_dpi_asymmetric
15_layer_name_korean
16_layer_name_255_bytes
17_rle_pathological_runs
18_large_rgb8
19_large_rgb16
20_large_cmyk8
```

각 Corpus는 다음을 가진다.

```text
input fixture SHA-256
plane digest set
plan digest
expected document mode
expected header fields
expected resource digests
expected decoder plane digests
expected output structural digest
```

# 32. Promotion Artifact

## 32.1 PSD Canonical Serializer Promotion Receipt

```json
{
  "promotionId": "TDT-EXPORT-WORKER-04",
  "status": "PROMOTED",
  "workerId": "dadum.worker.encoder.psd-canonical-v1",
  "serializerImplementationId": "dadum.psd-rust-wasm-serializer-v2",
  "requestCodecVersion": 2,
  "serializerAbiVersion": 2,
  "documentModes": 4,
  "mainThreadPsdByteWriterCount": 0,
  "postSerializeMutationCount": 0,
  "structureVerifierPassRate": 1.0,
  "independentDecoderPassRate": 1.0,
  "receiptParity": 1.0
}
```

## 32.2 Main-thread PSD Byte Writer Isolation Report

```text
active writer sites = 0
active 8BPS assembly sites = 0
active image-resource patch sites = 0
worker-backed PSD exports = 100%
```

## 32.3 PSD Structure Verification Report

모든 Corpus의 Header·Section·Resource·Layer·Compression 결과를 기록한다.

## 32.4 PSD Plane Round-trip Report

Independent Decoder가 복원한 Plane Digest를 Input Plane Digest와 비교한다.

## 32.5 PSD Metadata Resource Report

DPI·ICC Resource Count·Payload Digest·Ordering을 기록한다.

# 33. 성능·메모리 Gate

EW04는 구조 진실성이 우선이다.

그래도 다음 Budget을 기록한다.

```text
Main-thread PSD Byte Assembly Time = 0ms
Main-thread Output Post-process Time = 0ms
Worker Serialize Time p50/p95
Plan Encode Time p50/p95
Plane Preparation Time p50/p95
Independent Verify Time p50/p95
Peak Renderer Temporary Bytes
Peak Worker WASM Bytes
Output Bytes
Transfer Copy Count
```

필수 메모리 조건:

- Output Buffer는 Worker에서 Renderer로 1회 Transfer
- Worker Output의 추가 Full Copy는 Blob wrapping 외 0
- Plane Input Snapshot Policy가 Receipt에 기록
- Job 종료 뒤 Worker Temporary Allocation이 Self-test Baseline으로 복귀
- 연속 20회 Export 뒤 Memory Growth가 허용 오차 내 안정

# 34. Rollback

Rollback은 다음 단위로 수행한다.

```text
EW04 Canonical PSD Worker
→ EW03 Source Tree
```

단, 제품 승격 후 Main-thread JS Writer로 조용히 Fallback하면 안 된다.

Rollback 시 PSD Capability 자체를 비활성화하거나 명시적인 이전 버전 앱으로 돌아가야 한다.

금지:

```text
Canonical Worker 실패
→ buildLayeredPSD8 자동 호출
```

허용:

```text
Canonical Worker 실패
→ PSD Export Unavailable
→ Stable Error + Diagnostic Receipt
```

# 35. 승격 조건

다음이 모두 PASS여야 한다.

```text
GATE-EW04-01..32 PASS
RT-EW04-01..56 PASS
Vite Production Build PASS
Electron Runtime PASS
Canonical PSD Worker emitted artifact SHA non-null
Rust/WASM serializer v2 self-test PASS
Layered RGB8 Independent Round-trip PASS
Flattened RGB8 Independent Round-trip PASS
Flattened RGB16 Independent Round-trip PASS
Flattened CMYK8 Independent Round-trip PASS
DPI Resource parity 100%
ICC Resource parity 100%
Main-thread PSD Byte Writer Count = 0
Post-serialize Mutation Count = 0
Worker-backed PSD Export = 100%
EW02 Pending Closure PASS
R7 Export Receipt parity = 100%
```

하나라도 없으면 상태는 다음이다.

```text
SOURCE_BAKED_UNPROMOTED
```

# 36. 완료 정의

EW04 완료는 “PSD가 저장된다”가 아니다.

다음 문장이 참이어야 한다.

> **모든 지원 PSD Mode의 파일 구조는 동일한 Rust/WASM Worker Serializer가 작성하고, Renderer Main Thread는 PSD 바이트를 직접 쓰거나 수정하지 않으며, 요청 Document Plan과 출력 Header·Resource·Layer·Compression·Plane이 독립 Decoder에서 일치할 때만 Export Receipt가 발급된다.**

# 37. 구현 순서

```text
1. PSD Document Plan v2 Schema·Encoder 작성
2. Rust Serializer Request Codec v2 구현
3. Rust/WASM ABI v2 Export 추가
4. Layered RGB8 Serializer 구현
5. Flattened RGB8/RGB16/CMYK8 v2 이관
6. Resource 1005·1039 Serializer 내부화
7. Canonical PSD Worker Entry 추가
8. Worker Manifest Identity 교체
9. Legacy PSD Bridge를 Plan Builder + Broker Call로 축소
10. Main-thread JS Builder와 Output Patch Reachability 제거
11. PSD Structure Verifier v2 추가
12. Independent Decoder Round-trip Harness 추가
13. Export Authority PSD Worker 예외 제거
14. Receipt Extension 추가
15. Static Gate 32개
16. Runtime Matrix 56개
17. Vite·Electron·WASM E2E
18. Promotion Receipt 발급
```

# 38. 다음 명세

EW04가 닫히면 다음은 PSD Plane Split·LCMS 이전이 아니다.

전체 Export 승격 로드맵의 순서를 유지한다.

```text
TDT-EXPORT-WORKER-05
JXL Dedicated Worker Promotion /
Main-thread JXL WASM Retirement /
Container·Codestream Identity /
Lossless·Bit-depth·ICC Truth Seal
```

PSD Plane Split·LCMS Worker Closure는 JXL·JPEG Dedicated Worker Promotion 이후 별도 단계에서 수행한다.

# 39. 최종 판정표

| 항목 | EW03 상태 | EW04 목표 |
|---|---|---|
| PSD Worker 생성권 | Runtime Broker | 유지 |
| PSD Job 권위 | EW02 Broker | 유지 |
| Layered RGB8 Serializer | Main-thread JS | Rust/WASM Worker |
| Flattened Serializer | Rust/WASM Worker | Canonical v2로 통합 |
| DPI Resource | Worker 출력 뒤 JS Patch | Rust/WASM 내부 작성 |
| ICC Resource | Request 기반 일부 작성 | Canonical Resource Policy |
| PSD Verifier | 8BPS Magic | Structure v2 + Decoder Round-trip |
| Worker Evidence | Mode별 상이 | 모든 Mode 필수 |
| Main-thread PSD Byte Writer | 존재 | 0 |
| Plane Split | Main Thread | EW04에서 유지 |
| LCMS Transform | Main Thread | EW04에서 유지 |
| Post-output Mutation | 존재 | 0 |
| Promotion Receipt | 없음 | 필수 |

# 40. 봉인 문구

```text
TDT-EXPORT-WORKER-04
PSD Rust/WASM Canonical Serializer
Layered and Flattened Document Unification
Main-thread PSD Byte Writer Zero
Resolution and ICC Resource Authority
Independent Structure and Plane Round-trip Truth
```

본 명세는 PSD Encoder의 알고리즘을 새로 발명하는 문서가 아니다.

이미 존재하는 Rust/WASM Exporter와 Legacy Layered Builder를 하나의 검증 가능한 Document Serializer 권위로 통합하는 문서다.
