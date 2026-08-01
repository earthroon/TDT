# TDT-EXPORT-PROMOTION-03

## Packaged Electron Cross-format E2E / Independent Decoder Matrix / PSD CMYK Production Color Validation / JXL Exact Round-trip / MODJPEG Canonical Artifact Closure / Production Pointer Promotion / Rollback Drill Truth Seal

**문서 상태:** NORMATIVE SPECIFICATION

**부모 기준:** `TDT-EXPORT-PROMOTION-02` Source Bake

**부모 후보 Build ID:** `9589f94c2952ceaf55425a60` 또는 EP02 Dependency Lock·Production Build 재발급 후 생성된 후속 Build ID

**진입 최소 상태:** `PACKAGED_ARTIFACT_VERIFIED`

**본 명세의 성공 상한:** `PRODUCTION_PROMOTED`

**기본 Release Profile:** `full-product-v1`

**Rollback 단위:** `whole-build-only`

---

## 0. 명세 요약

EP01은 Export 권위, Legacy Facade 퇴역, Stable Runtime API, Electron Atomic Save Session, Whole-build Rollback 경계를 소스 수준에서 닫았다.

EP02는 Dependency Lock, Vite Worker/WASM 방출물, Electron Package Content Identity, Native Addon 단일성의 생산 빌드 계약을 정의했다.

그러나 EP02 Source Bake 시점의 후보는 다음 이유로 제품 승격 상태가 아니다.

- `package-lock.json` Root Graph가 `package.json`과 불일치한다.
- Dependency Install이 패키지 저장소 HTTP 503으로 실패했다.
- Production Vite Build가 실행되지 않았다.
- Emitted Worker/WASM Artifact가 검증되지 않았다.
- Release Native Decoder `.node`가 없다.
- Packaged Electron Content ID가 없다.
- Electron Cross-format E2E가 실행되지 않았다.
- JXL 독립 Decoder Exact Round-trip이 실행되지 않았다.
- PSD CMYK 실제 LCMS Transform과 독립 색상 검증이 실행되지 않았다.
- MODJPEG Artifact는 여전히 `pthread-pool-8`이며 Canonical Single-thread 재빌드가 완료되지 않았다.
- Production Pointer는 `activeBuildId = null` 상태다.

EP03은 위 후보를 다음 최종 권위선으로 승격한다.

```text
PACKAGED_ARTIFACT_VERIFIED
→ Packaged Candidate Launch
→ Stable Runtime API Health
→ Cross-format Encode Corpus
→ Electron Atomic Save
→ Host / Disk SHA-256 Parity
→ Independent Decoder Matrix
→ Pixel / Plane / Metadata / Color Validation
→ Cross-format Promotion Receipt
→ Whole-build Production Pointer CAS
→ Promoted Build Relaunch
→ Rollback Drill
→ PRODUCTION_PROMOTED
```

소스 Gate, 구조 Parser, Mock Worker Smoke, Reference Serializer 결과만으로 EP03을 통과할 수 없다.

실제 Packaged Electron Candidate의 실제 Worker·WASM·Native Addon·Static Server·IPC·파일 시스템 경로를 사용해야 한다.

---

## 1. 목표

- EP02에서 검증된 Packaged Electron Candidate를 실제 설치 또는 Unpacked Package 경로에서 실행한다.
- Development Server, Source Tree Import, Unpacked Legacy Raw Path 우회 없이 Production Renderer를 사용한다.
- Stable Runtime Export API `dadum.runtime.export` v1이 Packaged 환경에서 Boot됨을 증명한다.
- 공개 `window.ExportManager`가 `RETIRED` Tombstone 상태임을 증명한다.
- PNG8, PNG16, WebP Lossless, JXL Lossless RGBA8, JPEG Baseline 4:4:4, PSD RGB, PSD CMYK의 실제 Export를 수행한다.
- Electron Atomic Save Session의 Begin, Chunk, Commit, Disk Verify를 실제 파일 시스템에서 수행한다.
- Renderer Output SHA, Host Stream SHA, Temporary File SHA, Final Disk SHA가 동일함을 증명한다.
- 각 출력 포맷을 Encoder와 분리된 Independent Decoder로 다시 읽는다.
- Lossless 포맷은 픽셀 또는 Plane Exactness를 증명한다.
- JPEG는 구조, Alpha Policy, Quality 적용, 4:4:4, Lossy Metric Envelope를 증명한다.
- PSD CMYK는 실제 Source ICC, Destination ICC, LCMS Transform, Native CMYK Plane, PSD Stored Inversion Plane, Independent Color Validation을 증명한다.
- JXL은 RGBA8 Exact Round-trip, Alpha, Hidden RGB, Container Metadata를 증명한다.
- MODJPEG는 Canonical Single-thread Artifact와 Pthread Retirement를 증명한다.
- 성공한 Build와 Release Profile만 Production Pointer로 원자 승격한다.
- 이전 Promoted Build로의 Whole-build Rollback을 실제로 수행하고 재실행한다.
- Promotion과 Rollback 과정에서 Legacy Export Fallback, Per-encoder Mixing, Source Build Mixing이 없음을 증명한다.

---

## 2. 비목표

- JXL 16-bit Capability 개방
- JXL Lossy Mode 승격
- Progressive JPEG 승격
- JPEG 4:2:0 또는 4:2:2 승격
- PSD Multi-layer General Authoring Model 확장
- PSD Smart Object, Adjustment Layer, Vector Mask 지원
- macOS Notarization
- Windows SmartScreen Reputation
- 자동 업데이트 서버 설계
- Cloud Release Channel 설계
- 개별 Encoder Hot Rollback
- Legacy ExportManager 복귀
- 동일 Runtime Epoch 안에서 Codec Fallback

---

## 3. 현재 소스 기준 확정 사실

### 3.1 Production Pointer

현재 Pointer는 다음 상태다.

```text
pointerId = dadum.export.production-pointer
activeBuildId = null
candidateBuildId = 9589f94c2952ceaf55425a60
candidateState = SOURCE_BAKED_UNPROMOTED
rollbackUnit = whole-build-only
legacyFallbackAllowed = false
perEncoderRollbackAllowed = false
pointerMutationPerformed = false
```

EP03은 `activeBuildId`를 처음으로 변경할 수 있는 명세다.

### 3.2 Electron Save Session

현재 Main Process는 다음 IPC를 제공한다.

```text
dadum:export-save-begin
dadum:export-save-chunk
dadum:export-save-commit
dadum:export-save-abort
```

현재 저장 계약은 다음을 이미 수행한다.

- Expected Byte Length 검증
- Expected SHA-256 검증
- 8 MiB 이하 Chunk 검증
- Sequence·Offset 검증
- Chunk SHA-256 검증
- Temporary File 쓰기
- Stream SHA-256 계산
- `fsync`
- Temporary File 전체 재읽기
- On-disk SHA-256 검증
- Atomic Rename

EP03은 이 계약을 실제 Packaged Electron Export에 사용하고, 저장 후 Independent Decoder까지 이어 붙인다.

### 3.3 Native Decoder 범위

현재 Native Decoder Registry는 다음 포맷을 광고한다.

```text
png
jpeg
webp
avif
gif
bmp
tiff
```

현재 Native Decoder는 JXL과 PSD를 광고하지 않는다.

따라서 EP03은 다음 Independent Decoder Identity를 별도로 요구한다.

```text
dadum.decoder.native-raster-v1
dadum.decoder.jxl-independent-v1
dadum.decoder.psd-independent-v1
```

JXL·PSD 검증을 Encoder Worker 내부의 자체 결과 또는 Structure Parser만으로 대체할 수 없다.

### 3.4 Existing JXL Decoder Asset

Legacy Runtime에는 JXL Decode 경로가 존재한다.

```text
app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_decode.js
app/legacy-runtime/decoders/decode_jxl_surface.js
```

이 Decoder가 EP03 Independent Decoder로 승격되려면 다음을 증명해야 한다.

- JXL Encoder Emscripten Module과 다른 JS/WASM Artifact Set이다.
- `jxl_encode_qmap_ex()`를 Import하지 않는다.
- Encoder Memory, Worker, Heap, Output Buffer를 공유하지 않는다.
- Decoder Artifact SHA-256이 별도로 봉인된다.
- Packaged Renderer 또는 Main Process에서 Production Asset으로 실제 로드된다.

### 3.5 Existing PSD Decoder Asset

Legacy Runtime에는 별도 PSD Parser/Decoder가 존재한다.

```text
app/legacy-runtime/vendor/psd/psd_core.mjs
app/legacy-runtime/vendor/psd/psd_core.wasm
app/legacy-runtime/decoders/psd_decode_worker.js
```

이 Decoder는 Canonical PSD Serializer와 별도 Artifact여야 한다.

독립성은 이름이 다르다는 이유만으로 인정하지 않는다.

- Serializer Source Import 금지
- Serializer WASM Import 금지
- Shared Output Buffer 금지
- Encoder Worker Message 재사용 금지
- Decoder Worker Artifact Set Digest 별도 발급

### 3.6 PSD CMYK 상태

현재 EW07 Report는 다음 상태다.

```text
actualCmykTransformExecuted = false
bundledIccFiles = []
bundledSrgbProfilePresent = false
explicitProfileBytesRequired = true
lcmsFixedHeapBytes = 536870912
```

EP03 PSD CMYK 승격은 실제 ICC Fixture와 실제 LCMS Transform 없이 통과할 수 없다.

### 3.7 MODJPEG 상태

현재 MODJPEG Artifact는 다음 상태다.

```text
requestedCanonicalMode = single-thread
observedSourceArtifactMode = pthread-pool-8
pthreadPoolSize = 8
pthreadRetirementVerified = false
sharedMemoryRequiredByCurrentArtifact = true
```

EP03 Full Product 승격은 해당 Artifact를 Canonical Single-thread Build로 교체하고 Child Worker 0을 증명해야 한다.

---

## 4. 권위 용어

- **Packaged Candidate:** EP02에서 Package Content ID를 발급받은 Electron App Directory 또는 Installer 설치 결과.
- **Candidate Launch Receipt:** Package Content ID, Electron Runtime, Renderer Build ID, Native Addon, Runtime API Health를 Packaged Process에서 관측한 Receipt.
- **E2E Fixture:** 입력 Surface, Metadata, Export Options, 기대 결과를 Digest와 함께 고정한 테스트 자료.
- **Independent Decoder:** 대상 Encoder와 Module, Worker, Heap, Source Graph, Output Buffer를 공유하지 않는 Decoder.
- **Exact Round-trip:** Source Pixel 또는 Plane의 정규화된 Canonical Byte가 Decode 결과와 바이트 단위로 일치하는 상태.
- **Hidden RGB:** Alpha가 0인 Pixel의 RGB 값. Lossless 포맷에서는 별도 정책이 명시되지 않는 한 보존 대상이다.
- **Lossy Metric Envelope:** JPEG Fixture별로 사전 봉인한 구조 및 지각 Metric 허용 범위.
- **Color Reference Corpus:** ICC Profile, 입력 RGB/CMYK Sample, Rendering Intent, BPC, 기대 Lab/XYZ 또는 Quantized Output Digest를 담는 검증 Corpus.
- **Cross-format Promotion Receipt:** 모든 Format Receipt, Save Receipt, Decoder Receipt, Package Identity를 결속한 최종 Receipt.
- **Release Profile:** 하나의 Whole-build가 제품에서 광고할 수 있는 Format Capability 집합.
- **Promotion Pointer CAS:** 기존 Pointer Digest를 Expected Value로 요구하는 Compare-and-Swap 갱신.
- **Rollback Drill:** Promoted Candidate에서 Previous Promoted Build로 Pointer를 되돌리고 실제 재실행·Health·Export Smoke를 수행하는 검증.

---

## 5. 승격 상태 머신

```text
PACKAGED_ARTIFACT_VERIFIED
→ PACKAGED_CANDIDATE_LAUNCHED
→ ELECTRON_SAVE_E2E_VERIFIED
→ INDEPENDENT_DECODER_MATRIX_VERIFIED
→ CORE_RASTER_PROFILE_VERIFIED
→ PSD_RGB_PROFILE_VERIFIED
→ PSD_CMYK_PROFILE_VERIFIED
→ FULL_PRODUCT_PROFILE_VERIFIED
→ POINTER_PREPARED
→ PRODUCTION_PROMOTED
→ ROLLBACK_DRILL_VERIFIED
```

`full-product-v1`의 정상 성공 상태는 다음 두 조건을 모두 요구한다.

```text
PRODUCTION_PROMOTED
AND
ROLLBACK_DRILL_VERIFIED
```

Pointer를 갱신했지만 Rollback Drill을 통과하지 못한 상태는 최종 승격이 아니다.

```text
POINTER_MUTATED_UNVERIFIED
```

상태로 격리하고 자동 복구 절차를 수행해야 한다.

---

## 6. Release Profile 계약

### 6.1 core-raster-v1

```text
PNG8
PNG16
WebP Lossless
JXL Lossless RGBA8
JPEG Baseline 4:4:4
```

### 6.2 psd-rgb-v1

```text
PSD Layered RGB8 Single-layer
PSD Flattened RGB8
PSD Flattened RGB16
```

### 6.3 psd-cmyk-v1

```text
PSD Flattened CMYK8
Explicit Source ICC
Explicit Destination CMYK ICC
LCMS Relative Colorimetric or Perceptual Intent
Explicit BPC
Native CMYK / PSD Stored CMYK Evidence
```

### 6.4 full-product-v1

```text
core-raster-v1
+ psd-rgb-v1
+ psd-cmyk-v1
```

### 6.5 Profile와 Whole-build 관계

Rollback Unit은 Whole-build다.

그러나 한 Build가 광고하는 Release Profile은 Receipt로 고정할 수 있다.

규칙:

- Pointer는 Build ID와 Release Profile ID를 함께 가리킨다.
- UI는 Pointer에 봉인되지 않은 Format을 광고할 수 없다.
- 부분 Profile 승격 시 동일 Build 안의 미검증 Format은 Runtime Capability에서 숨긴다.
- `full-product-v1`을 요청한 승격에서 일부 Format 실패를 부분 Profile로 조용히 낮출 수 없다.
- Profile 변경은 명시적 새 Promotion Action과 새 Pointer Receipt를 요구한다.

---

## 7. Packaged Candidate Launch Gate

### 7.1 Source Tree 우회 금지

Packaged E2E는 다음을 금지한다.

```text
DADUM_VITE_DEV_SERVER_URL
vite dev server
source app/src import
source app/legacy-runtime direct path
unpackaged electron .
```

허용 실행 대상:

```text
release/win-unpacked/DadumDadum.exe
또는
설치된 NSIS Candidate
```

### 7.2 Launch Identity

Packaged Candidate는 Main Process에서 다음을 보고해야 한다.

```text
packageContentId
installerEnvelopeId 또는 unpackedPackageId
sourceBuildId
rendererBuildId
productionRuntimeManifestDigest
emittedWorkerManifestDigest
nativeAddonSha256
nativeAddonArchitecture
stableApiId
stableApiVersion
implementationId
releaseProfileCandidate
```

### 7.3 Runtime Health

다음이 모두 PASS여야 한다.

```text
stableApiId = dadum.runtime.export
stableApiVersion = 1
legacyFacadeState = RETIRED
workerBrokerHealth = READY
pendingJobs = 0
staleWorkerReplies = 0
nativeDecoderStatus = available
saveProtocolVersion = dadum-electron-export-save-v1
```

### 7.4 Mixed Build 차단

다음 Digest가 하나라도 Package Content Manifest와 다르면 Candidate를 종료한다.

- Renderer Build ID
- Worker Manifest Digest
- Runtime Manifest Digest
- Native Addon SHA
- Electron Main SHA
- Preload SHA

오류:

```text
E_PRODUCTION_PACKAGE_IDENTITY_MISMATCH
```

---

## 8. E2E Harness 계약

### 8.1 동일 Package Byte 원칙

E2E Candidate와 Production Candidate는 동일 Package Content ID를 사용해야 한다.

별도 테스트용 Renderer Bundle을 만들 수 없다.

### 8.2 Save Dialog 자동화

자동 E2E는 실제 Save Session을 우회하지 않는다.

다만 Native Dialog의 사용자 선택을 결정론적으로 만들기 위해 다음 One-shot Harness Input을 허용한다.

```text
DADUM_E2E_MODE=1
DADUM_E2E_EXPORT_ROOT=<absolute temp directory>
DADUM_E2E_RUN_TOKEN=<256-bit random token>
```

규칙:

- Main Process만 Environment를 읽는다.
- Renderer에 Export Root 전체 경로를 노출하지 않는다.
- Harness Mode에서도 Begin, Chunk, Commit, fsync, Disk Readback, Atomic Rename을 그대로 수행한다.
- Harness Mode는 Dialog 선택만 결정론적 경로로 치환한다.
- Receipt에 `savePathSelectionMode = e2e-preauthorized-root-v1`을 기록한다.
- `DADUM_E2E_MODE != 1`이면 Environment Path를 무시한다.
- Run Token은 Process 시작 시 한 번만 소비하고 재사용을 금지한다.
- Export Root 밖으로 탈출하는 Filename은 거부한다.

### 8.3 Fixture Injection

Fixture는 Renderer UI 조작과 동일 Runtime API를 사용한다.

테스트 전용 Codec API, Worker 직접 호출, ExportManager Private Host 직접 호출을 금지한다.

허용 진입점:

```text
DadumRuntimeExport.publishFixtureSurface()
DadumRuntimeExport.exportFinal()
```

`publishFixtureSurface()`는 E2E Mode에서만 노출되며 다음을 요구한다.

- Fixture Manifest Digest
- Surface Contract Digest
- Width·Height·Storage
- Exact Source Byte SHA
- Metadata Digest
- Runtime Epoch

---

## 9. Fixture Manifest SSOT

새 Artifact:

```text
tests/export-e2e/fixtures/fixture-manifest.json
```

필수 필드:

```json
{
  "schemaVersion": 1,
  "corpusId": "dadum-export-e2e-corpus-v1",
  "fixtures": []
}
```

각 Fixture는 다음을 포함한다.

```text
fixtureId
format
profileId
sourceStorage
width
height
sourceBytesSha256
surfaceContractDigest
alphaPolicy
hiddenRgbPolicy
metadataPolicy
exportOptions
expectedStructure
expectedExactness
independentDecoderId
metricEnvelopeId
sourceIccSha256
destinationIccSha256
```

Fixture Byte와 ICC Byte는 Manifest Digest에 포함한다.

Fixture 수정은 동일 Corpus ID를 유지할 수 없다.

---

## 10. 최소 Cross-format Corpus

### 10.1 PNG8

최소 Fixture:

- Opaque Color Grid
- Partial Alpha Edge
- Alpha 0 Hidden RGB Pattern
- Non-square DPI
- ICC 또는 sRGB Metadata Policy

검증:

```text
IHDR bitDepth = 8
colorType = 6
CRC PASS
RGBA8 Exact Round-trip
Alpha Exact
Hidden RGB Exact
DPI Policy Exact
ICC Cardinality Exact
```

### 10.2 PNG16

최소 Fixture:

- 16-bit Ramp
- 16-bit Checker
- Partial Alpha 16-bit
- Endianness Sentinel
- Non-square DPI

검증:

```text
IHDR bitDepth = 16
colorType = 6
CRC PASS
RGBA16 Exact Round-trip
Big-endian PNG Sample Interpretation Exact
Alpha16 Exact
DPI Policy Exact
```

### 10.3 WebP Lossless

최소 Fixture:

- Opaque Color Grid
- Partial Alpha
- Alpha 0 Hidden RGB Pattern
- Edge Texture

검증:

```text
VP8L Present
VP8 Lossy Chunk Absent
Animation Absent
RGBA8 Exact Round-trip
Alpha Exact
Hidden RGB Exact
Canvas Fallback = false
nearLossless = 100
```

### 10.4 JXL Lossless RGBA8

최소 Fixture:

- Opaque Color Grid
- Partial Alpha
- Alpha 0 Hidden RGB Pattern
- 1x1, Odd Width, Large Row Fixture
- DPI Metadata Fixture

검증:

```text
JXL Container PASS
jxlc xor jxlp Carrier
RGBA8 Exact Round-trip
Alpha Exact
Hidden RGB Exact
Width·Height Exact
Exif / XMP Cardinality Exact
Worker Output SHA = Disk SHA
```

### 10.5 JPEG Baseline 4:4:4

최소 Fixture:

- Opaque Natural Texture
- Synthetic Sharp Chroma Edge
- Quality 1
- Quality 50
- Quality 92
- Quality 100
- Partial Alpha + Explicit Matte
- Reject Nonopaque Policy

검증:

```text
SOF0
8-bit
3 Components
4:4:4
JFIF DPI
ICC APP2 Sequence
EOI Exact
Explicit Alpha Policy
Applied Quality Percent Exact
```

JPEG는 Lossy이므로 Pixel Exactness를 요구하지 않는다.

대신 Fixture별 Metric Envelope를 요구한다.

```text
OKLab ΔE00 or project-approved ΔE metric distribution
maximum channel overshoot
alpha matte edge contamination
file size range
structure identity
```

Metric Threshold는 코드에 임의 상수로 흩어놓지 않고 Fixture Manifest의 `metricEnvelopeId`가 가리키는 별도 Policy Artifact에 둔다.

### 10.6 PSD RGB

최소 Fixture:

- Layered RGB8 Single Layer, Opaque
- Layered RGB8 Single Layer, Alpha
- Flattened RGB8 RAW
- Flattened RGB8 RLE
- Flattened RGB16 RAW
- Flattened RGB16 RLE
- Unicode Layer Name
- DPI 72·300·Non-square
- ICC Present·Absent Policy

검증:

```text
PSD Header Exact
Depth / Color Mode Exact
Layer Count Exact
Layer Name Exact
Channel ID Set Exact
RAW / RLE Exact
RGBA8 or RGBA16 Plane Exact Round-trip
Alpha Exact
Hidden RGB Policy Exact
DPI Resource Exact
ICC Resource Exact
EOF Exact
```

### 10.7 PSD CMYK

최소 Fixture:

- RGB Source + Explicit sRGB-class Source ICC
- CMYK Destination Profile A
- CMYK Destination Profile B
- Relative Colorimetric, BPC off
- Relative Colorimetric, BPC on
- Perceptual, BPC policy
- Neutral Ramp
- Saturated RGB Primaries
- Rich Black / Neutral Gray Sample
- Partial Alpha

검증은 세 층으로 분리한다.

#### Layer A: Native LCMS Output

```text
sourceIccSha256
destinationIccSha256
intent
bpc
nativeCmykDigest
transformCacheKey
lcmsVersion
```

#### Layer B: PSD Stored Plane

```text
storedC = 255 - nativeC
storedM = 255 - nativeM
storedY = 255 - nativeY
storedK = 255 - nativeK
```

정확한 Plane Digest를 요구한다.

#### Layer C: Independent Color Validation

Independent PSD Decoder가 Raw CMYK Plane과 Embedded ICC를 추출한다.

그 결과를 Encoder Worker와 다른 검증 경로에서 PCS 또는 sRGB Reference로 변환한다.

검증 방식:

- Reference Vector의 Quantized Output SHA 일치
- Sample Point Lab 또는 XYZ 비교
- Fixture별 ΔE Envelope 충족
- Neutral Axis Drift Envelope 충족
- Rendering Intent·BPC 분기 구분

동일 LCMS Transform Object, 동일 Heap Output, 동일 Worker Result를 재사용하면 독립 검증으로 인정하지 않는다.

---

## 11. Independent Decoder Matrix

### 11.1 Decoder Identity

| Format | Required Decoder ID | Encoder와 독립성 |
|---|---|---|
| PNG8/16 | `dadum.decoder.native-raster-v1` | LodePNG Encoder Worker와 별도 Rust Image Decoder |
| WebP Lossless | `dadum.decoder.native-raster-v1` | libwebp Encoder Worker와 별도 Decoder |
| JPEG | `dadum.decoder.native-raster-v1` | MODJPEG Encoder와 별도 Decoder |
| JXL | `dadum.decoder.jxl-independent-v1` | JXL Encoder Emscripten Artifact와 별도 Decoder Artifact |
| PSD | `dadum.decoder.psd-independent-v1` | PSD Serializer와 별도 PSDCore Decoder Artifact |

### 11.2 독립성 Receipt

각 Decoder는 다음을 발급한다.

```text
decoderId
decoderImplementationId
decoderArtifactSetDigest
decoderWorkerId
decoderProtocolVersion
encoderArtifactSetDigest
sharedArtifactCount
sharedHeap = false
sharedWorker = false
sharedOutputBuffer = false
independenceVerified = true
```

허용 Shared Artifact는 포맷에 무관한 Utility만 가능하다.

예:

```text
SHA-256 helper
Canonical JSON helper
Fixture Manifest parser
```

Codec Core, WASM, ICC Transform Output Buffer 공유는 금지한다.

### 11.3 Decoder Failure 정책

독립 Decoder가 없는 Format은 다음 상태다.

```text
ENCODE_VERIFIED_ONLY
```

이 상태는 Profile Promotion에 사용할 수 없다.

오류:

```text
E_PROMOTION_INDEPENDENT_DECODER_UNAVAILABLE
```

---

## 12. JXL Exact Round-trip Closure

### 12.1 Decoder Artifact

JXL Decoder는 다음을 만족해야 한다.

- Encoder JS/WASM과 다른 Artifact Digest
- Encoder ABI Symbol Import 0
- 별도 Worker 또는 Native Process
- RGBA8 Straight Alpha Output
- Hidden RGB를 보존하는 Decode Mode
- Color Conversion Off 또는 Canonical sRGB Output Policy 명시

### 12.2 Exactness

비교 대상은 UI Preview가 아니라 Canonical Source Surface다.

```text
source RGBA8 bytes
vs
independent decoded RGBA8 bytes
```

다음이 Exact해야 한다.

- Width
- Height
- R
- G
- B
- A
- Alpha 0 Hidden RGB

### 12.3 Metadata

- DPI는 Exif 또는 XMP 중 Canonical Policy에 따른다.
- 중복 Exif·XMP는 금지한다.
- Decoder가 Metadata를 해석하지 못하더라도 Structure Parser와 Metadata Parser가 독립적으로 검증해야 한다.

### 12.4 16-bit

JXL 16-bit는 EP03 범위가 아니다.

`full-product-v1`에서도 JXL Capability는 RGBA8 Lossless로 고정한다.

---

## 13. MODJPEG Canonical Artifact Closure

### 13.1 재빌드 요구

현재 Pthread Artifact를 다음 설정으로 재빌드한다.

```text
PTHREADS = off
SHARED_MEMORY = off
PTHREAD_POOL_SIZE = 0
single-thread = true
```

### 13.2 Artifact Truth

다음 증거가 모두 필요하다.

```text
modjpegSourceRevision
buildCommandDigest
toolchainDigest
wasmSha256
jsGlueSha256
pthreadSymbolCount = 0
workerChildReferenceCount = 0
sharedMemoryRequired = false
```

### 13.3 Runtime Closure

- JPEG Outer Dedicated Worker는 유지한다.
- Child Worker 생성 0
- SharedArrayBuffer 생성 0
- Worker Generation 종료 후 Child Worker 0
- Cancel·Crash 후 Pending 0
- Existing JPEG Structure Gate 유지

### 13.4 Quality Corpus

Quality 1·50·92·100은 Fixture별 Metric Envelope를 통과해야 한다.

Quality 100이라고 Lossless를 주장할 수 없다.

---

## 14. PSD CMYK Production Color Validation

### 14.1 ICC Fixture Policy

EP03는 승인된 ICC Fixture를 명시적으로 포함한다.

각 Profile은 다음을 기록한다.

```text
profileId
filename
byteLength
sha256
profileClass
colorSpace
pcs
copyrightOrLicenseRecord
fixtureUseOnly 또는 productBundled
```

License 또는 Redistribution 근거가 없는 Profile은 Product Bundle에 포함할 수 없다.

Fixture-only Profile은 E2E Package에 별도 Test Asset으로 포함하고 Production Runtime 일반 UI에서 노출하지 않는다.

### 14.2 실제 LCMS 실행

다음이 관측되어야 한다.

```text
actualCmykTransformExecuted = true
lcmsWasmSha256 != null
transformCreated = true
transformApplied = true
transformDeleted = true
liveOwnedBytesAtSettlement = 0
```

### 14.3 Color Reference

Reference Corpus는 다음 중 하나 이상으로 생성한다.

- 승인된 Offline LCMS Reference Runner
- 별도 Native LCMS CLI Runner
- 검증된 Color Management Reference Tool

Runtime Worker의 같은 출력 Buffer를 Reference로 재사용할 수 없다.

### 14.4 ΔE 정책

모든 Sample에 단일 임의 Threshold를 적용하지 않는다.

Fixture Class별 Envelope를 정의한다.

```text
neutral-axis
skin-like midtone
saturated-primary
rich-black
near-gamut-boundary
```

Receipt에는 다음을 기록한다.

```text
sampleCount
meanDeltaE
p95DeltaE
maxDeltaE
neutralAxisMaxDeltaE
outOfEnvelopeCount
metricImplementationId
metricArtifactDigest
```

Metric은 프로젝트가 선택한 Canonical ΔE 구현을 사용하며, Reference와 Runtime 모두 동일 Color Space 해석을 사용하되 Transform Output은 독립적으로 생성해야 한다.

---

## 15. Electron Atomic Save E2E

각 Export Job은 다음 Digest 연쇄를 만들어야 한다.

```text
encoderOutputSha256
= rendererBlobSha256
= expectedSaveSha256
= hostStreamSha256
= temporaryFileSha256
= onDiskSha256
= independentDecoderInputSha256
```

다음 항목도 검증한다.

- Chunk Count
- Sequence Monotonicity
- Offset Monotonicity
- Final Byte Length
- `fsync = true`
- `atomicRename = true`
- Temporary File 잔존 0
- Abort Session 잔존 0
- Save Session Map Size 0
- Export Root 밖 파일 생성 0

기존 `frame-capture` IPC는 EP03 제품 Export E2E에 사용할 수 없다.

잔존 `frame-capture`는 비권위 Legacy IPC로 분류하거나 별도 명세에서 제거한다.

---

## 16. Cross-format Receipt

새 Artifact:

```text
artifacts/promotion/TDT_EXPORT_PROMOTION_03_CROSS_FORMAT_E2E_RECEIPT.json
```

필수 Top-level 필드:

```text
schemaVersion
patchId
runId
releaseProfileId
packageContentId
installerEnvelopeId
sourceBuildId
rendererBuildId
runtimeManifestDigest
workerManifestDigest
nativeAddonSha256
toolchainProfileDigest
dependencyGraphDigest
fixtureCorpusDigest
formatReceipts
profileResults
allRequiredFormatsPassed
promotionEligible
receiptSha256
```

각 Format Receipt:

```text
format
fixtureCount
fixturePassCount
encodeReceiptDigests
saveReceiptDigests
decoderReceiptDigests
structureVerified
exactRoundTripVerified
metadataVerified
colorValidationVerified
lossyMetricVerified
workerPendingAtEnd
hostSaveSessionsAtEnd
formatPromotionState
```

### 16.1 Receipt Conservation

```text
admittedFixtureCount
= terminalPassCount
+ terminalFailCount
```

어떤 Fixture도 `RUNNING`, `UNKNOWN`, `MISSING_RECEIPT` 상태로 남을 수 없다.

---

## 17. Production Pointer CAS

### 17.1 Pointer v2

Pointer Schema를 다음으로 확장한다.

```json
{
  "schemaVersion": 2,
  "pointerId": "dadum.export.production-pointer",
  "activeBuildId": "<buildId>",
  "activePackageContentId": "<packageContentId>",
  "activeReleaseProfileId": "full-product-v1",
  "previousBuildId": "<nullable>",
  "previousPackageContentId": "<nullable>",
  "expectedPreviousPointerSha256": "<sha256>",
  "promotionReceiptSha256": "<sha256>",
  "rollbackUnit": "whole-build-only",
  "legacyFallbackAllowed": false,
  "perEncoderRollbackAllowed": false,
  "pointerMutationPerformed": true,
  "pointerSha256": "<sha256>"
}
```

### 17.2 Compare-and-Swap

Pointer 갱신은 다음 조건을 요구한다.

```text
currentPointerSha256
= expectedPreviousPointerSha256
```

불일치 시:

```text
E_PROMOTION_POINTER_CAS_MISMATCH
```

### 17.3 Pointer 갱신 순서

```text
Cross-format Receipt PASS
→ Candidate Package Read-only Seal
→ Pointer Temp Write
→ Pointer fsync
→ Atomic Rename
→ Pointer Readback SHA
→ Promoted Build Relaunch
```

Pointer가 먼저 바뀌고 Receipt가 나중에 생성되는 순서를 금지한다.

---

## 18. Promoted Build Relaunch Gate

Pointer 갱신 후 Candidate Process를 종료하고 새 Process를 실행한다.

새 Process는 Pointer에서 자신을 읽고 다음을 증명한다.

```text
launchedBuildId = activeBuildId
launchedPackageContentId = activePackageContentId
launchedReleaseProfileId = activeReleaseProfileId
legacyFacadeState = RETIRED
stableRuntimeApiReady = true
workerBrokerReady = true
pendingJobs = 0
```

최소 Post-promotion Smoke:

- PNG8 1개 Export·Save·Decode
- JXL 1개 Export·Save·Decode
- JPEG 1개 Export·Save·Decode
- PSD RGB8 1개 Export·Save·Decode
- PSD CMYK 1개 Export·Save·Color Validate, `full-product-v1`인 경우

---

## 19. Rollback Drill

### 19.1 First Promotion

이전 Promoted Build가 없는 최초 승격은 다음 Fixture Package를 Previous Build 역할로 사용할 수 없다.

실제 이전 Promoted Package가 없으면 Rollback Drill은 두 단계로 수행한다.

```text
Candidate A를 먼저 검증·승격
→ Candidate B 또는 동일 코드의 별도 Build ID를 검증·승격
→ Candidate A로 Rollback
```

동일 Package Content ID에 Build ID만 바꾼 가짜 Candidate는 금지한다.

### 19.2 Rollback Trigger

Drill은 다음 중 하나를 명시적으로 주입한다.

- Post-promotion Health Failure
- Renderer Entry Digest Mismatch
- Worker Artifact Digest Mismatch
- Native Addon Load Failure
- Required Profile Smoke Failure

### 19.3 Rollback 실행

```text
Rollback Trigger Receipt
→ Current Process 종료
→ Pointer CAS to previous whole build
→ Previous Package Launch
→ Health Gate
→ Minimum Export Smoke
→ Rollback Receipt
```

### 19.4 금지

- Current Build의 PNG만 Previous Worker로 교체
- JXL만 Legacy Encoder로 복귀
- Native Addon만 다른 Package에서 로드
- Source Tree 파일을 Previous Package에 주입
- Pointer 변경 없이 환경변수로 Build 선택

---

## 20. Rollback Receipt

새 Artifact:

```text
artifacts/promotion/TDT_EXPORT_PROMOTION_03_ROLLBACK_DRILL_RECEIPT.json
```

필수 필드:

```text
fromBuildId
fromPackageContentId
toBuildId
toPackageContentId
triggerId
triggerReceiptDigest
pointerBeforeSha256
pointerAfterSha256
wholeBuildRollback = true
perEncoderRollback = false
legacyFallbackUsed = false
relaunchVerified
minimumSmokePassed
rollbackDurationMs
terminalState
receiptSha256
```

---

## 21. Failure·Cleanup 계약

어떤 Fixture가 실패해도 다음이 0이어야 한다.

```text
Broker Pending Jobs
Active Worker Jobs
Electron Save Sessions
Temporary Export Files
Decoder Pending Jobs
Open File Handles
LCMS Live Allocations
PSD Worker Live Owned Bytes
JXL Child Workers
MODJPEG Child Workers
```

실패 출력은 Promotion Corpus 결과 디렉터리에 보관할 수 있지만, 사용자 Pictures Directory에는 남기지 않는다.

민감한 Full Path는 Receipt에 기록하지 않는다.

---

## 22. Stable Error 추가

최소 다음 Error Code를 Stable Registry에 추가한다.

```text
E_PRODUCTION_PACKAGE_IDENTITY_MISMATCH
E_E2E_FIXTURE_CORPUS_MISMATCH
E_E2E_HARNESS_TOKEN_INVALID
E_E2E_EXPORT_ROOT_ESCAPE
E_PROMOTION_INDEPENDENT_DECODER_UNAVAILABLE
E_PROMOTION_DECODER_NOT_INDEPENDENT
E_PROMOTION_EXACT_ROUNDTRIP_MISMATCH
E_PROMOTION_HIDDEN_RGB_MISMATCH
E_PROMOTION_METADATA_MISMATCH
E_PROMOTION_LOSSY_METRIC_OUT_OF_RANGE
E_PROMOTION_CMYK_REFERENCE_MISMATCH
E_PROMOTION_CMYK_DELTAE_OUT_OF_RANGE
E_PROMOTION_MODJPEG_PTHREAD_NOT_RETIRED
E_PROMOTION_SAVE_DIGEST_CHAIN_MISMATCH
E_PROMOTION_RECEIPT_CONSERVATION_FAILED
E_PROMOTION_POINTER_CAS_MISMATCH
E_PROMOTION_POINTER_READBACK_MISMATCH
E_PROMOTED_BUILD_RELAUNCH_MISMATCH
E_ROLLBACK_PREVIOUS_PACKAGE_MISSING
E_ROLLBACK_WHOLE_BUILD_IDENTITY_MISMATCH
E_ROLLBACK_SMOKE_FAILED
```

---

## 23. Required Tooling

새 도구:

```text
tools/export-e2e/run-packaged-electron-e2e.mjs
tools/export-e2e/fixture-manifest-lib.mjs
tools/export-e2e/verify-decoder-independence.mjs
tools/export-e2e/verify-lossless-roundtrip.mjs
tools/export-e2e/verify-jpeg-metric-envelope.mjs
tools/export-e2e/verify-psd-cmyk-color.mjs
tools/export-e2e/verify-save-digest-chain.mjs
tools/export-e2e/generate-cross-format-receipt.mjs
tools/promotion/promote-build-pointer.mjs
tools/promotion/run-rollback-drill.mjs
tools/promotion/verify-promotion-03.mjs
```

Production Package 안에 Test Runner 전체를 포함할 필요는 없다.

그러나 Package가 제공하는 E2E Entry Point와 Receipt Endpoint는 동일 Product Byte에서 실행돼야 한다.

---

## 24. Required Artifact Set

```text
TDT_EXPORT_PROMOTION_03_CANDIDATE_LAUNCH_RECEIPT.json
TDT_EXPORT_PROMOTION_03_ELECTRON_SAVE_E2E_REPORT.json
TDT_EXPORT_PROMOTION_03_DECODER_INDEPENDENCE_REPORT.json
TDT_EXPORT_PROMOTION_03_PNG8_ROUNDTRIP_REPORT.json
TDT_EXPORT_PROMOTION_03_PNG16_ROUNDTRIP_REPORT.json
TDT_EXPORT_PROMOTION_03_WEBP_LOSSLESS_ROUNDTRIP_REPORT.json
TDT_EXPORT_PROMOTION_03_JXL_ROUNDTRIP_REPORT.json
TDT_EXPORT_PROMOTION_03_JPEG_VALIDATION_REPORT.json
TDT_EXPORT_PROMOTION_03_PSD_RGB_ROUNDTRIP_REPORT.json
TDT_EXPORT_PROMOTION_03_PSD_CMYK_COLOR_REPORT.json
TDT_EXPORT_PROMOTION_03_MODJPEG_ARTIFACT_REPORT.json
TDT_EXPORT_PROMOTION_03_CROSS_FORMAT_E2E_RECEIPT.json
TDT_EXPORT_PROMOTION_POINTER_V2.json
TDT_EXPORT_PROMOTION_03_POST_PROMOTION_RELAUNCH_REPORT.json
TDT_EXPORT_PROMOTION_03_ROLLBACK_DRILL_RECEIPT.json
TDT_EXPORT_PROMOTION_03_FIX_RECEIPT.json
```

---

## 25. Static Gates

최소 68개 Static Gate를 둔다.

### Package·Harness

1. EP03 Spec가 저장소에 존재한다.
2. E2E Runner가 Package Content ID를 요구한다.
3. E2E Runner가 Dev Server를 거부한다.
4. Harness Root는 Main Process에서만 해석한다.
5. Harness Token이 One-shot이다.
6. Export Root Escape 방지가 있다.
7. Fixture Manifest Digest 검증이 있다.
8. Runtime Stable API만 호출한다.
9. Legacy ExportManager 직접 호출이 없다.
10. Worker 직접 호출이 없다.

### Save

11. Begin·Chunk·Commit을 모두 사용한다.
12. Chunk SHA 검증을 우회하지 않는다.
13. Host Stream SHA를 기록한다.
14. Disk SHA를 기록한다.
15. Temp File Cleanup를 검증한다.
16. Save Session Terminal 0을 검증한다.

### Decoder

17. Native Raster Decoder Identity가 있다.
18. JXL Independent Decoder Identity가 있다.
19. PSD Independent Decoder Identity가 있다.
20. Decoder Artifact Digest가 있다.
21. Shared Heap 금지 검증이 있다.
22. Shared Worker 금지 검증이 있다.
23. Shared Codec Artifact Count 검증이 있다.

### Format

24. PNG8 Exact Round-trip Gate가 있다.
25. PNG16 Exact Round-trip Gate가 있다.
26. WebP VP8L Exact Gate가 있다.
27. JXL Exact Gate가 있다.
28. JXL Hidden RGB Gate가 있다.
29. JPEG SOF0 Gate가 있다.
30. JPEG 4:4:4 Gate가 있다.
31. JPEG Quality Envelope Gate가 있다.
32. PSD RGB Layer/Plane Gate가 있다.
33. PSD RGB16 Gate가 있다.
34. PSD CMYK Native Digest Gate가 있다.
35. PSD Stored CMYK Inversion Gate가 있다.
36. PSD CMYK ICC Digest Gate가 있다.
37. PSD CMYK ΔE Envelope Gate가 있다.

### MODJPEG

38. Single-thread Artifact Gate가 있다.
39. Pthread Symbol Count 0 Gate가 있다.
40. Child Worker Reference 0 Gate가 있다.
41. Shared Memory false Gate가 있다.

### Receipt

42. Candidate Launch Receipt가 있다.
43. Cross-format Receipt가 있다.
44. Receipt Conservation Gate가 있다.
45. Package Content ID가 모든 Format Receipt에 있다.
46. Renderer Build ID가 모든 Format Receipt에 있다.
47. Worker Manifest Digest가 모든 Format Receipt에 있다.
48. Save Digest Chain이 있다.
49. Independent Decoder Digest가 있다.

### Pointer·Rollback

50. Pointer Schema v2가 있다.
51. Pointer CAS가 있다.
52. Pointer Temp Write가 있다.
53. Pointer fsync가 있다.
54. Pointer Atomic Rename이 있다.
55. Post-promotion Relaunch가 있다.
56. Relaunch Package ID 검증이 있다.
57. Rollback Trigger가 있다.
58. Previous Package 존재 검증이 있다.
59. Whole-build Rollback만 허용한다.
60. Per-encoder Rollback이 false다.
61. Legacy Fallback이 false다.
62. Rollback Relaunch가 있다.
63. Rollback Export Smoke가 있다.
64. Rollback Receipt가 있다.

### Final

65. `PRODUCTION_PROMOTED`는 모든 Required Receipt PASS를 요구한다.
66. `full-product-v1`은 PSD CMYK PASS를 요구한다.
67. Pointer Mutation 전 Cross-format Receipt PASS를 요구한다.
68. Rollback Drill PASS 전 Final Seal 발급을 금지한다.

---

## 26. Runtime Test Matrix

최소 126개 Runtime Test를 요구한다.

분류:

```text
Candidate Launch                    10
Save Session                        12
PNG8                                10
PNG16                               10
WebP Lossless                       10
JXL                                 16
JPEG                                18
PSD RGB                             16
PSD CMYK                            18
Pointer Promotion                    3
Rollback Drill                       3
TOTAL                              126
```

각 Test는 PASS, FAIL, SKIP 중 하나를 가질 수 있다.

Required Test의 SKIP는 PASS가 아니다.

---

## 27. Promotion Decision

### 27.1 core-raster-v1

다음이 모두 PASS면 승격 가능하다.

```text
Packaged Candidate Launch
Electron Save E2E
PNG8
PNG16
WebP Lossless
JXL RGBA8
JPEG Baseline 4:4:4
Independent Decoder Matrix for Core Raster
MODJPEG Canonical Artifact Closure
```

### 27.2 psd-rgb-v1

다음이 모두 PASS면 승격 가능하다.

```text
Packaged Candidate Launch
Electron Save E2E
PSD RGB8 Layered
PSD RGB8 Flattened
PSD RGB16 Flattened
Independent PSD Decoder
```

### 27.3 psd-cmyk-v1

다음이 모두 PASS면 승격 가능하다.

```text
Actual LCMS Transform
Explicit ICC Fixture
Native CMYK Digest
Stored CMYK Plane Digest
Independent PSD Decode
Independent Color Validation
ΔE Envelope
Memory Closure
```

### 27.4 full-product-v1

위 세 Profile이 모두 PASS여야 한다.

---

## 28. Fail-Closed 규칙

다음 상태에서 Pointer를 변경할 수 없다.

- Dependency Lock 미검증
- Package Content ID 없음
- Native Addon 없음
- Renderer Build ID 없음
- Emitted Worker Manifest 없음
- Required Format 하나라도 Independent Decoder 없음
- Lossless Exact Round-trip 실패
- JXL Hidden RGB 실패
- MODJPEG Pthread Retirement 실패
- PSD CMYK actual transform 미실행
- PSD CMYK Color Reference 실패
- Save Digest Chain 불일치
- Pending Job 또는 Save Session 잔존
- Cross-format Receipt Conservation 실패
- Previous Pointer SHA 불일치

---

## 29. 최종 Promotion Receipt

새 Artifact:

```text
artifacts/promotion/TDT_EXPORT_PROMOTION_03_FIX_RECEIPT.json
```

필수 필드:

```text
schemaVersion
patchId
status
releaseProfileId
sourceBuildId
rendererBuildId
packageContentId
installerEnvelopeId
crossFormatReceiptSha256
pointerBeforeSha256
pointerAfterSha256
postPromotionRelaunchReceiptSha256
rollbackDrillReceiptSha256
productionPromoted
rollbackDrillVerified
legacyFallbackUsed
perEncoderRollbackUsed
wholeBuildIdentityPreserved
blockers
receiptSha256
```

최종 성공:

```text
status = PRODUCTION_PROMOTED
productionPromoted = true
rollbackDrillVerified = true
legacyFallbackUsed = false
perEncoderRollbackUsed = false
wholeBuildIdentityPreserved = true
blockers = []
```

---

## 30. 권장 구현 순서

```text
EP03-A
Packaged E2E Harness / Candidate Launch Receipt

EP03-B
Independent Decoder Registry / JXL·PSD Decoder Identity

EP03-C
PNG·WebP·JXL Exact Round-trip Corpus

EP03-D
MODJPEG Single-thread Rebuild / JPEG Metric Corpus

EP03-E
PSD RGB Independent Plane Round-trip

EP03-F
PSD CMYK ICC Corpus / Actual LCMS / Independent Color Validation

EP03-G
Cross-format Receipt / Profile Decision

EP03-H
Pointer CAS / Promoted Relaunch / Rollback Drill
```

한 단계의 실패를 다음 단계가 숨길 수 없다.

---

## 31. 완료 정의

EP03은 다음 문장을 모두 사실로 만들 때 완료된다.

1. 동일 Package Content ID의 Packaged Electron Candidate가 실제 실행됐다.
2. Stable Runtime Export API만 사용해 모든 Required Format을 인코딩했다.
3. 모든 출력이 Electron Atomic Save Session을 거쳐 디스크에 기록됐다.
4. Renderer, Host, Disk SHA-256이 일치했다.
5. 각 포맷이 Encoder와 독립된 Decoder로 검증됐다.
6. Lossless 포맷은 Exact Round-trip을 통과했다.
7. JXL은 Hidden RGB와 Alpha Exactness를 통과했다.
8. JPEG는 Canonical Single-thread MODJPEG Artifact, 4:4:4, Metric Envelope를 통과했다.
9. PSD RGB는 Layer·Plane·Depth Round-trip을 통과했다.
10. PSD CMYK는 실제 LCMS와 Independent Color Validation을 통과했다.
11. Cross-format Promotion Receipt의 Conservation이 맞았다.
12. Production Pointer가 CAS로 원자 갱신됐다.
13. Promoted Package가 재실행되어 최소 Export Smoke를 통과했다.
14. Previous Whole Build로 Rollback Drill이 성공했다.
15. Legacy Export Fallback과 Per-encoder Rollback은 한 번도 사용되지 않았다.

위 조건 중 하나라도 성립하지 않으면 상태는 `PRODUCTION_PROMOTED`가 아니다.

---

## 32. 최종 선언

EP03은 Source Bake를 더 화려하게 만드는 명세가 아니다.

이 명세의 목적은 다음 단절을 실제 제품 실행에서 닫는 것이다.

```text
Source Authority
↛ Production Package
↛ Real Export File
↛ Independent Decode
↛ Color Truth
↛ Production Pointer
↛ Recoverable Rollback
```

최종 권위선은 다음 하나다.

```text
Verified Package
→ Verified Export
→ Verified Disk File
→ Verified Independent Decode
→ Verified Release Profile
→ Atomic Production Pointer
→ Verified Whole-build Rollback
```

이 권위선이 완성된 Build만 `PRODUCTION_PROMOTED`를 주장할 수 있다.
