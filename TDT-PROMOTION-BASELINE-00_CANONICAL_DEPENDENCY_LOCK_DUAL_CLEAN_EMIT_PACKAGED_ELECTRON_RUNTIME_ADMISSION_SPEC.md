# TDT-PROMOTION-BASELINE-00

## Canonical Dependency Lock Promotion / Dual Clean Production Emit / Packaged Electron Runtime Admission / Cross-Format Save Smoke / Relaunch·Worker Restart·Rollback Readiness Seal

```text
SPEC STATUS: READY FOR BAKE
SPEC ID: TDT-PROMOTION-BASELINE-00
TARGET PROJECT: DadumDadum Full Runtime
PARENT SOURCE STATE: SOURCE_BAKED_UNPROMOTED
CHILD AUTHORITIES:
  - TDT-BUILD-LOCK-01
  - TDT-BUILD-EMIT-01
  - TDT-MODJPEG-01
  - TDT-JXL-CODEC-01
  - TDT-PSD-DECODER-01
  - TDT-EXPORT-WORKER-01..07
  - TDT-RUNTIME-SSOT-01-R1..R7
SUCCESS CEILING: PACKAGED_BASELINE_VERIFIED
PRODUCTION POINTER MUTATION: FORBIDDEN
ROLLBACK MODE: ISOLATED_TEST_POINTER_ONLY
CANONICAL HOST: win32-x64
CANONICAL NODE: 22.16.0
CANONICAL NPM: 10.9.2
CANONICAL PACKAGE MANAGER: npm
```

---

## 0. 목적

본 명세는 다듬다듬 풀버전의 소스 계약을 제품 승격으로 오인하지 않도록, 다음 세 권위를 하나의 상위 상태 머신으로 결속한다.

1. 동일한 Package·Registry·Cache 입력으로 의존성 그래프가 반복 설치되는가.
2. 동일한 Source·Lock·Toolchain에서 Vite Production Artifact가 반복 방출되는가.
3. 방출된 Renderer·Worker·WASM·ICC·Pthread Child Worker가 Electron Package 안에서 실제 정적 경로로 로드되고, Stable Runtime API를 통해 최소 포맷 Export·Save·Relaunch·Worker Restart를 수행하는가.

본 명세는 새로운 Codec 기능을 추가하지 않는다.

본 명세는 현재 존재하는 Source PASS를 다시 세는 명세도 아니다.

본 명세의 핵심 질문은 단 하나다.

```text
지금 이 저장소의 정확한 Source와 Lock을
다른 Clean Workspace에서 다시 설치하고,
다시 빌드하고,
다시 패키징하고,
실제 Packaged Electron에서 같은 Runtime Identity로 실행할 수 있는가.
```

이 질문에 대한 증거가 모두 닫힐 때만 `PACKAGED_BASELINE_VERIFIED`를 발급한다.

---

## 1. 성공 상태의 의미와 상한

### 1.1 성공 상태

```text
PACKAGED_BASELINE_VERIFIED
```

이 상태는 다음을 의미한다.

- Canonical Dependency Lock이 승격됐다.
- 오프라인 `npm ci` A/B가 동일 설치 그래프를 만들었다.
- Vite Production Build A/B가 동일 Artifact Graph를 만들었다.
- Worker·WASM·ICC·Child Worker Closure가 실제 emitted byte로 봉인됐다.
- Electron Package Content가 봉인됐다.
- Packaged App이 Source Tree나 Dev Server 없이 부팅됐다.
- Stable Runtime API가 건강 상태를 반환했다.
- 현재 광고 가능한 Codec의 최소 Export·Atomic Save Smoke가 실행됐다.
- 앱 재실행 후 Runtime·Artifact Identity가 유지됐다.
- 강제 Worker Crash 후 Generation Restart가 닫혔다.
- Test-only Pointer에서 CAS·복구 순서가 검증됐다.

### 1.2 성공 상태가 의미하지 않는 것

`PACKAGED_BASELINE_VERIFIED`는 다음을 의미하지 않는다.

- 모든 포맷의 독립 Decoder Exact Round-trip 완료
- PSD Rust WASM Serializer 실제 채택 완료
- Native raster release `.node` 채택 완료
- PSD Multi-layer·ZIP·ZIP Prediction·PSB 지원
- Preview와 Export의 Pixel Digest Parity 완료
- GPU Device SSOT 단일화 완료
- CPU Readback 제거 완료
- Peak Memory Budget 완료
- Production Pointer 승격 완료
- 실제 Production Rollback 완료
- Full Product Release 완료

위 항목은 후속 명세의 권위다.

### 1.3 Production Pointer 금지

본 명세는 다음 Pointer를 변경해서는 안 된다.

```text
activeBuildId
productionBuildId
releaseChannel.active
```

허용되는 Pointer Mutation은 Test Root 아래 격리된 다음 파일뿐이다.

```text
artifacts/promotion-baseline-00/test-pointer.json
```

본 명세가 Production Pointer를 변경하면 결과와 무관하게 `FAIL P0_PRODUCTION_POINTER_MUTATED`다.

---

## 2. 현재 상태

### 2.1 확정 상태

현재 저장소는 다음 상태다.

```text
sourceContracts = extensive
sourceGates = mostly pass
packageLockRootParity = fail
immutableNpmCiReplay = not proven
productionViteEmit = not proven
emittedWorkerClosure = not proven
packagedElectronContentIdentity = not proven
packagedRuntimeE2E = not proven
productionPointer = unpromoted
```

### 2.2 0번에서 해결할 결함

| 결함 | 현재 판정 | 본 명세 목표 |
|---|---|---|
| `package.json` / Lock Root Graph 불일치 | BLOCKED | exact parity |
| Frozen Cache Closure 부재 | BLOCKED | sealed cache digest |
| Offline `npm ci` 반복성 부재 | BLOCKED | install A/B parity |
| `dist/renderer` 실물 부재 | BLOCKED | clean emit A/B |
| Worker/WASM 경로 추정 의존 | BLOCKED | emitted graph authority |
| Electron Static Route 실증 부재 | BLOCKED | packaged route probe |
| Package Content ID 부재 | BLOCKED | package content receipt |
| Packaged Stable Runtime API 미실행 | BLOCKED | packaged boot health |
| 실제 Atomic Save Smoke 미실행 | BLOCKED | disk byte parity |
| Worker Crash/Restart 미실행 | BLOCKED | generation closure |
| Production Pointer 변경 가능성 | 위험 | hard forbidden |

---

## 3. 명세 계층과 중복 금지

본 명세는 하위 명세를 복제하지 않는다.

### 3.1 하위 권위

| 단계 | 하위 권위 | 상위 명세가 추가로 결속하는 것 |
|---|---|---|
| 0A | `TDT-BUILD-LOCK-01` | 실제 Promotion Receipt와 다음 단계 Admission |
| 0B | `TDT-BUILD-EMIT-01` | 실제 emitted identity와 Package Input 결속 |
| 0C | 본 명세의 Packaged Baseline 장 | Package Launch·Save·Restart·Test Pointer |

### 3.2 충돌 규칙

- Dependency Lock의 세부 규칙은 `TDT-BUILD-LOCK-01`이 우선한다.
- Emitted Artifact의 세부 규칙은 `TDT-BUILD-EMIT-01`이 우선한다.
- MODJPEG의 현재 Canonical Artifact는 `TDT-MODJPEG-01`이 우선한다.
- JXL Runtime Closure는 `TDT-JXL-CODEC-01`이 우선한다.
- PSD Independent Decode 지원 행렬은 `TDT-PSD-DECODER-01`이 우선한다.
- 본 명세는 하위 Receipt의 Digest를 소비하며, 하위 PASS를 임의 재해석하지 않는다.

### 3.3 MODJPEG 재빌드 비요구

본 명세는 MODJPEG를 Single-thread로 재빌드하라고 요구하지 않는다.

현재 Canonical Artifact가 Pthread 기반이라면 다음을 충족해야 한다.

- SharedArrayBuffer 활성
- COOP `same-origin`
- COEP `require-corp`
- Child Worker Route Closure
- Parent·Child·WASM Artifact Digest
- `encode_mozjpeg_RGB()` ABI 유지
- Baseline 4:4:4 Marker 검증

이를 충족하면 본 명세의 Packaged Baseline에서 사용할 수 있다.

---

## 4. 규범 용어

- **MUST / SHALL:** 반드시 충족한다.
- **MUST NOT / SHALL NOT:** 절대 허용하지 않는다.
- **Clean Workspace:** 원본과 다른 절대 경로에 실제 파일 복사로 구성한 작업 공간.
- **Canonical Input:** Package, Lock, Toolchain, Registry Profile, Frozen Cache, Source Tree Digest의 결합.
- **Install Graph Digest:** `node_modules`의 Package Name·Version·Integrity·Relative Path·Link Type을 정규화한 Digest.
- **Emitted Artifact Graph:** Vite/Rollup이 방출한 Entry·Chunk·Worker·WASM·ICC·Child Worker의 실제 byte graph.
- **Package Content ID:** Packaged App의 정규화된 파일 목록과 SHA-256으로 계산한 Build Identity.
- **Packaged Runtime:** Source Tree Import와 Dev Server 없이 Packaged Renderer와 Electron Static Route로 부팅한 Runtime.
- **Save Smoke:** 실제 Export Result를 Electron Atomic Save IPC로 디스크에 기록하고 Byte Length·SHA를 검증하는 최소 E2E.
- **Independent Structural Probe:** Encoder와 다른 Parser 또는 Platform Decoder가 Container·Header·Marker·기초 메타데이터를 검사하는 절차.
- **Test Pointer:** Production과 완전히 분리된 임시 Pointer.
- **Generation Restart:** Worker Crash 후 기존 Pending Job이 닫히고 새 Worker Generation이 생성되는 상태.

---

## 5. SSOT 소유권

| 영역 | SSOT | 금지되는 대체 증거 |
|---|---|---|
| Direct Dependency | `package.json` exact version | README 목록 |
| Full Dependency Graph | promoted `package-lock.json` | 기존 `node_modules` |
| Registry Input | sealed registry profile | Ambient user npmrc |
| Cache | frozen project cache manifest | 전역 npm cache |
| Install Result | install graph receipt | `npm ci` exit 0만 |
| Build Input | canonical build input manifest | 현재 Workspace 추정 |
| Emitted Entry | Rollup/Vite metadata | 문자열 검색 |
| Worker Closure | emitted graph + runtime URL projection | basename 검색 |
| Static Route | packaged Electron route receipt | 파일 존재 여부 |
| Package Identity | package content manifest | 폴더명·timestamp |
| Runtime API | packaged window surface | source type declaration |
| Save Result | disk byte receipt | Blob 생성 성공 |
| Worker Restart | broker generation receipt | console log |
| Pointer | isolated test pointer file | production pointer |

---

## 6. 전체 상태 머신

```text
SOURCE_BAKED_UNPROMOTED
→ BASELINE_INPUT_AUDITED
→ LOCK_CANDIDATE_RECOVERED
→ LOCK_OFFLINE_REPLAY_A_VERIFIED
→ LOCK_OFFLINE_REPLAY_B_VERIFIED
→ DEPENDENCY_LOCK_PROMOTED
→ BUILD_INPUT_SEALED
→ CLEAN_EMIT_A_VERIFIED
→ CLEAN_EMIT_B_VERIFIED
→ EMITTED_ARTIFACT_IDENTITY_VERIFIED
→ PACKAGE_INPUT_SEALED
→ PACKAGE_A_VERIFIED
→ PACKAGE_B_VERIFIED
→ PACKAGE_CONTENT_IDENTITY_VERIFIED
→ PACKAGED_CANDIDATE_LAUNCHED
→ PACKAGED_RUNTIME_HEALTH_VERIFIED
→ CROSS_FORMAT_SAVE_SMOKE_VERIFIED
→ PACKAGED_RELAUNCH_VERIFIED
→ WORKER_RESTART_VERIFIED
→ TEST_POINTER_RECOVERY_VERIFIED
→ PACKAGED_BASELINE_VERIFIED
```

### 6.1 Fail-Closed

어느 상태에서든 실패하면 다음 단계로 진행하지 않는다.

예:

```text
DEPENDENCY_LOCK_PROMOTED != true
→ Vite Build 실행 금지

EMITTED_ARTIFACT_IDENTITY_VERIFIED != true
→ Electron Package 생성 금지

PACKAGE_CONTENT_IDENTITY_VERIFIED != true
→ Packaged Runtime E2E 실행 금지
```

### 6.2 상태 건너뛰기 금지

기존 Source Report가 PASS여도 상태를 건너뛸 수 없다.

특히 다음은 금지한다.

```text
SOURCE_GATE_PASS → PACKAGED_BASELINE_VERIFIED
SOURCE_MANIFEST_PASS → EMITTED_ARTIFACT_IDENTITY_VERIFIED
UNPACKED_SOURCE_LAUNCH → PACKAGED_CANDIDATE_LAUNCHED
```

---

## 7. Canonical Baseline Input Manifest

경로:

```text
artifacts/promotion-baseline-00/input/canonical-baseline-input.json
```

필수 구조:

```json
{
  "schemaVersion": 1,
  "specId": "TDT-PROMOTION-BASELINE-00",
  "target": "win32-x64",
  "nodeVersion": "22.16.0",
  "npmVersion": "10.9.2",
  "packageJsonSha256": "...",
  "packageLockSha256": "...",
  "lockPromotionReceiptSha256": "...",
  "registryProfileSha256": "...",
  "frozenCacheManifestSha256": "...",
  "frozenCacheClosureDigest": "...",
  "sourceTreeDigest": "...",
  "toolchainProfileSha256": "...",
  "buildAuthoritySha256": "...",
  "electronAuthoritySha256": "...",
  "runtimeApiSchemaSha256": "...",
  "productionPointerPreflightSha256": "...",
  "createdAt": "...",
  "selfDigest": "..."
}
```

`createdAt`은 Identity 계산에서 제외한다.

Canonical Identity는 timestamp 없이 계산한다.

---

# PART A. Dependency Lock Promotion

## 8. 0A 진입 조건

- `package.json`의 직접 의존성은 exact semver다.
- Node는 `22.16.0`이다.
- npm은 `10.9.2`다.
- Target은 `win32-x64`다.
- User-level `.npmrc`는 권위 입력에서 제외된다.
- Registry Acquisition은 승인된 Canonical npmrc만 사용한다.
- Lock Recovery 전 Package·Lock Raw Byte SHA를 기록한다.

조건이 다르면 `FAIL P0A_INPUT_AUTHORITY_MISMATCH`다.

---

## 9. 0A 실행 계약

세부 규칙은 `TDT-BUILD-LOCK-01`을 따른다.

상위 명세는 다음 결과를 반드시 요구한다.

### 9.1 Root Graph Exactness

```text
package.json dependencies
= package-lock.json packages[""].dependencies

package.json devDependencies
= package-lock.json packages[""].devDependencies
```

Version String까지 정확히 같아야 한다.

`^`, `~`, tag, workspace ambiguity는 허용하지 않는다.

### 9.2 Frozen Cache Closure

모든 Lock Package Entry는 Frozen Cache 안의 Tarball 또는 검증 가능한 Package Content로 닫혀야 한다.

각 Cache Entry는 다음을 가진다.

- logical registry URL
- resolved package identity
- integrity
- byte length
- sha256
- cache relative path

### 9.3 Offline Replay A/B

서로 다른 Clean Workspace에서 다음을 실행한다.

```text
npm ci --offline --ignore-scripts
```

필요한 Native Postinstall은 Lock Proof 이후 별도 admitted lifecycle 단계에서 수행한다.

A/B는 다음이 같아야 한다.

- install graph digest
- package count
- package name/version multiset
- integrity multiset
- peer resolution graph
- optional dependency admission result
- omitted package set

### 9.4 Mutation Zero

Lock Promotion 전후 다음 Byte가 동일해야 한다.

- promoted candidate `package.json`
- promoted candidate `package-lock.json`
- frozen cache manifest
- canonical npmrc
- toolchain profile

Recovery 과정에서 Lock을 생성하는 1회 변경은 Candidate Transaction 안에서만 허용한다.

Promotion 이후 재실행에서 Mutation은 0이어야 한다.

---

## 10. 0A 산출물

```text
artifacts/promotion-baseline-00/lock/
  canonical-package.json
  canonical-package-lock.json
  registry-input-profile.json
  frozen-cache-manifest.json
  offline-install-a.json
  offline-install-b.json
  install-graph-a.json
  install-graph-b.json
  lock-mutation-zero.json
  dependency-lock-promotion-receipt.json
```

### 10.1 0A 완료 조건

```text
receipt.state = DEPENDENCY_LOCK_PROMOTED
receipt.promoted = true
rootGraphExact = true
offlineReplayCount = 2
installGraphParity = true
lockMutationZero = true
```

하나라도 거짓이면 0B에 진입하지 않는다.

---

# PART B. Dual Clean Production Emit

## 11. 0B 진입 조건

- 0A Receipt가 `DEPENDENCY_LOCK_PROMOTED`다.
- 현재 Package·Lock SHA가 0A Receipt와 같다.
- Frozen Cache Closure Digest가 같다.
- Build Network Policy는 `offline-build-v1`이다.
- Build A/B는 서로 다른 절대 경로의 Clean Workspace다.
- 원본 Workspace의 `dist`를 재사용하지 않는다.

---

## 12. Build A/B Transaction

각 Build는 다음 순서를 따른다.

```text
verify toolchain
→ verify promoted lock
→ offline npm ci
→ admitted lifecycle scripts
→ source manifest generation
→ vite production build
→ emitted manifest generation
→ runtime manifest generation
→ route manifest generation
→ emitted closure verification
→ source mutation verification
```

### 12.1 Build Environment Normalization

다음 환경 입력은 명시한다.

- `NODE_ENV=production`
- `TZ=UTC`
- locale 고정
- source date epoch 또는 timestamp stripping policy
- random seed 사용 금지
- network disabled
- sourcemap disabled
- absolute path emission 금지

### 12.2 Source Mutation Zero

Build A/B 전후 다음이 동일해야 한다.

- `app/**`
- `native/**`
- `tools/**`
- `specs/**`
- `package.json`
- `package-lock.json`
- `vite.config.*`
- `electron.*`
- `preload.*`
- `tsconfig*.json`

Generated File은 Workspace 내부의 admitted generated root에만 쓴다.

---

## 13. Emitted Artifact Authority

### 13.1 Worker Entry

Worker Entry는 문자열 검색으로 결정하지 않는다.

다음 자료를 결합한다.

- Vite manifest
- Rollup chunk metadata
- `?worker&url` import projection
- runtime worker source manifest
- emitted URL mapping

### 13.2 Closure 대상

최소 다음 Worker Closure를 검증한다.

- JXL Encoder Worker
- MODJPEG Encoder Worker
- PNG Family Worker
- PSD Canonical Worker
- WebP Lossless Worker
- JXL Decoder Worker, 존재 시
- PSD Independent Decoder Worker

각 Closure는 다음을 포함한다.

- entry JS
- transitive shared chunks
- WASM
- ICC input
- Emscripten child worker
- pthread bootstrap
- dynamic import target
- runtime `new URL()` target

### 13.3 Artifact Ownership

모든 emitted file은 정확히 하나의 Owner Mode를 가진다.

```text
vite-bundle
vite-emitted-asset
legacy-raw-admitted
package-native-addon
```

동일 byte가 Raw Static과 Bundle에 중복 소유되면 FAIL이다.

### 13.4 Build A/B Identity

정규화된 파일 집합에 대해 다음이 같아야 한다.

- relative path
- byte length
- sha256
- MIME
- owner mode
- route URL
- worker closure membership

Timestamp, directory mtime, 비결정적 package metadata는 Identity에서 제거하거나 고정한다.

---

## 14. Static COI Route Gate

각 Shared Memory 또는 Pthread 관련 Route는 다음 Header를 가져야 한다.

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

### 14.1 MIME

최소 MIME은 다음과 같다.

| 확장자 | MIME |
|---|---|
| `.js`, `.mjs` | `text/javascript` |
| `.wasm` | `application/wasm` |
| `.icc`, `.icm` | `application/vnd.iccprofile` 또는 명세에서 봉인한 canonical MIME |
| `.json` | `application/json` |
| `.node` | Browser route 노출 금지 |

### 14.2 Synthetic와 Electron Route Parity

합성 Static Server PASS만으로 통과하지 않는다.

Electron Main의 실제 Static Server에 대해 다음을 직접 probe한다.

- status
- body sha256
- content-length
- MIME
- COOP
- COEP
- CORP
- cache policy

Synthetic Probe와 Electron Probe의 Body SHA가 같아야 한다.

---

## 15. 0B 산출물

```text
artifacts/promotion-baseline-00/emit/
  build-input-manifest.json
  build-a/
    emitted-artifact-manifest.json
    worker-closure-manifest.json
    route-manifest.json
    source-mutation-zero.json
  build-b/
    emitted-artifact-manifest.json
    worker-closure-manifest.json
    route-manifest.json
    source-mutation-zero.json
  build-ab-parity.json
  emitted-artifact-identity-receipt.json
```

### 15.1 0B 완료 조건

```text
buildA.success = true
buildB.success = true
buildAB.byteIdentity = true
workerClosure.complete = true
staticRoutes.complete = true
electronRoutes.complete = true
sourceMutationZero = true
receipt.state = EMITTED_ARTIFACT_IDENTITY_VERIFIED
```

---

# PART C. Packaged Electron Baseline

## 16. Package Admission

### 16.1 Package A/B

Build A와 Build B에서 각각 Electron Package를 생성한다.

Package 단계는 Network를 사용하지 않는다.

Installer Signing이나 SmartScreen 평판은 본 명세 범위가 아니다.

### 16.2 Package Content Manifest

각 Package는 다음을 정규화해 기록한다.

- relative path
- unpacked/asar ownership
- byte length
- sha256
- executable bit 또는 Windows file role
- renderer build ID
- runtime manifest digest
- worker manifest digest
- native addon digest
- Electron version

### 16.3 Package A/B Identity

동일 Canonical Input에서 생성된 Package A/B는 정규화된 Content Identity가 같아야 한다.

패키저가 timestamp를 삽입하는 Container가 있다면 다음 중 하나를 택한다.

1. timestamp를 canonical value로 고정한다.
2. Container 외부의 canonical unpacked app directory를 Package Identity 권위로 삼는다.
3. non-semantic field를 명시적 normalization rule로 제거한다.

무엇을 제거했는지 Receipt에 기록하지 않으면 FAIL이다.

---

## 17. Packaged Launch Gate

Packaged Candidate는 다음을 사용해서는 안 된다.

- Vite dev server
- Source Workspace의 `app/**`
- Source Workspace의 `node_modules`
- localhost 외부 개발 서버
- 개발자 전용 absolute path
- unpacked legacy file fallback

### 17.1 Launch Receipt

Packaged Process 내부에서 다음을 관측한다.

```json
{
  "packageContentId": "...",
  "rendererBuildId": "...",
  "runtimeManifestDigest": "...",
  "workerManifestDigest": "...",
  "stableRuntimeApi": "dadum.runtime.v1",
  "exportApi": "dadum.runtime.export.v1",
  "legacyExportFacadeState": "RETIRED",
  "crossOriginIsolated": true,
  "sharedArrayBufferAvailable": true,
  "gpuAdapterObserved": true,
  "runtimeBootState": "READY"
}
```

### 17.2 Legacy Facade

`window.ExportManager` 또는 이에 준하는 구형 Facade가 Canonical Export 권위를 다시 소유하면 FAIL이다.

허용 상태는 다음 중 하나다.

```text
undefined
RETIRED tombstone
read-only compatibility proxy without execution authority
```

---

## 18. Cross-Format Save Smoke Matrix

본 단계는 Codec 전체 품질 승격이 아니라 Packaged Runtime의 실행·저장 경로를 검증한다.

### 18.1 공통 Fixture

최소 Fixture는 다음 특성을 가진다.

- 17×13 비정렬 크기
- RGBA8
- 완전 불투명 픽셀
- 부분 투명 픽셀
- alpha 0 hidden RGB
- 고채도 원색
- 중성 회색
- 1px edge
- ICC identity 또는 명시적 sRGB policy
- deterministic pixel digest

PNG16·PSD RGB16에는 별도 RGBA16 Fixture를 사용한다.

### 18.2 최소 포맷

| Format | Encode | Atomic Save | 최소 독립 검증 | 본 단계 판정 |
|---|---:|---:|---|---|
| PNG8 | 필수 | 필수 | signature, IHDR, dimensions, color type, platform decode | Baseline |
| PNG16 | 필수 | 필수 | signature, IHDR bit depth 16, dimensions | Structural Baseline |
| WebP Lossless | 필수 | 필수 | RIFF/WEBP, VP8L, dimensions, platform decode | Baseline |
| JPEG | 필수 | 필수 | SOI/EOI, SOF, dimensions, component sampling 4:4:4, alpha matte receipt | Baseline |
| JXL RGBA8 | 필수 | 필수 | container/codestream structure, decoder health if admitted | Baseline |
| PSD RGB8 | 필수 | 필수 | independent PSD parser, plane/dimension/resource check | Strong Baseline |
| PSD RGB16 | capability가 광고되면 필수 | 필수 | independent parser bit depth/plane check | Strong Baseline |
| PSD CMYK8 | capability가 광고되면 필수 | 필수 | independent parser mode/plane/resource check | Structural Baseline |

### 18.3 지원 광고와 실행 일치

Runtime Capability Manifest가 포맷을 광고하면 해당 Smoke는 필수다.

광고하지 않는 포맷을 몰래 실행해 PASS 수를 늘리지 않는다.

광고했는데 Artifact가 없으면 FAIL이다.

### 18.4 PSD 미지원 범위

본 단계에서 다음은 지원 광고 금지다.

- PSB
- ZIP
- ZIP Prediction
- 임의 다중 레이어

명시적 capability false 또는 fail-closed code가 있어야 한다.

---

## 19. Atomic Save Gate

모든 Format Result는 Renderer Blob 생성 성공만으로 통과하지 않는다.

Electron Main의 Atomic Save Session을 사용한다.

필수 순서:

```text
save-begin
→ save-chunk[0..N]
→ save-commit
→ fsync
→ temporary full reread
→ disk sha verification
→ atomic rename
→ final disk reread
```

### 19.1 SHA Parity

다음 SHA가 같아야 한다.

```text
rendererOutputSha256
= hostStreamSha256
= temporaryFileSha256
= finalDiskSha256
```

### 19.2 실패 정리

중간 실패 시 다음이 없어야 한다.

- orphan temp file
- partial final file
- open file handle
- unresolved save session
- pending export job

---

## 20. Relaunch Gate

모든 Save Smoke 완료 후 App을 완전히 종료한다.

종료는 Renderer reload가 아니라 Electron Process 종료여야 한다.

재실행 후 다음을 검증한다.

- Package Content ID 동일
- Renderer Build ID 동일
- Runtime Manifest Digest 동일
- Worker Manifest Digest 동일
- Stable Runtime API 동일
- Production Pointer 미변경
- Test output directory 외 Source mutation 0
- 최소 PNG8 또는 WebP Save Smoke 1회 재실행 성공

Relaunch에서 Source Workspace를 참조하면 FAIL이다.

---

## 21. Worker Crash·Restart Gate

### 21.1 대상

최소 다음 Worker 중 하나의 Crash를 강제한다.

- JXL Worker
- MODJPEG Worker
- PNG Family Worker
- PSD Worker
- WebP Worker

가능하면 Pthread Parent Worker와 일반 Dedicated Worker를 각각 1개 검증한다.

### 21.2 강제 Crash

Crash는 테스트 Hook으로 명시적으로 발생시킨다.

임의 timeout이나 Process Kill을 Crash 증거로 대체하지 않는다.

### 21.3 필수 결과

- crashed generation이 `FAILED` 또는 `TERMINATED`로 닫힘
- 해당 generation의 Pending Job 0
- transferred buffer leak 0
- timeout handle 0
- 새로운 generation ID 발급
- 새 Worker Artifact Digest가 Manifest와 일치
- 재시도 Job은 새 Job ID 사용
- Save 결과 SHA가 정상 경로와 일치하거나 포맷의 deterministic policy를 만족

### 21.4 자동 폴백 금지

Crash 후 다음으로 폴백하면 FAIL이다.

- main-thread encoder
- Canvas encoder
- 다른 포맷 encoder
- legacy export facade
- source-tree worker

---

## 22. Test Pointer Recovery Gate

### 22.1 목적

Production Pointer를 건드리지 않고 CAS·복구 순서를 검증한다.

### 22.2 Pointer 구조

```json
{
  "schemaVersion": 1,
  "pointerId": "tdt.promotion-baseline-00.test-pointer",
  "activePackageContentId": null,
  "candidatePackageContentId": "...",
  "previousPackageContentId": null,
  "state": "CANDIDATE_READY",
  "revision": 0,
  "selfDigest": "..."
}
```

### 22.3 Drill

```text
CANDIDATE_READY
→ CAS candidate to active
→ verify active digest
→ restore original test pointer snapshot
→ verify byte identity with preflight
```

### 22.4 금지

- Production Pointer path 접근
- Production Pointer lock 획득
- Production activeBuildId 변경
- rollback 성공을 제품 rollback 성공으로 표현

본 단계 결과 명칭은 `TEST_POINTER_RECOVERY_VERIFIED`다.

`PRODUCTION_ROLLBACK_VERIFIED`라고 부르면 안 된다.

---

## 23. Packaged Baseline Receipt

경로:

```text
artifacts/promotion-baseline-00/receipts/packaged-baseline-receipt.json
```

필수 구조:

```json
{
  "schemaVersion": 1,
  "specId": "TDT-PROMOTION-BASELINE-00",
  "state": "PACKAGED_BASELINE_VERIFIED",
  "promotedToProduction": false,
  "productionPointerMutationPerformed": false,
  "canonicalInputDigest": "...",
  "dependencyLockPromotionReceiptDigest": "...",
  "emittedArtifactIdentityReceiptDigest": "...",
  "packageContentId": "...",
  "packageAContentDigest": "...",
  "packageBContentDigest": "...",
  "packageABIdentity": true,
  "packagedLaunchReceiptDigest": "...",
  "runtimeHealthReceiptDigest": "...",
  "crossFormatSaveSmokeReceiptDigest": "...",
  "relaunchReceiptDigest": "...",
  "workerRestartReceiptDigest": "...",
  "testPointerRecoveryReceiptDigest": "...",
  "unsupportedCapabilitySetDigest": "...",
  "sourceMutationZero": true,
  "selfDigest": "..."
}
```

---

## 24. 실패 코드

### 24.1 Lock

```text
P0A_INPUT_AUTHORITY_MISMATCH
P0A_ROOT_GRAPH_NOT_EXACT
P0A_CACHE_CLOSURE_INCOMPLETE
P0A_OFFLINE_INSTALL_NETWORK_ATTEMPT
P0A_INSTALL_GRAPH_MISMATCH
P0A_LOCK_MUTATED_AFTER_PROMOTION
```

### 24.2 Emit

```text
P0B_BUILD_WITH_UNPROMOTED_LOCK
P0B_BUILD_NETWORK_ACCESS
P0B_SOURCE_MUTATION
P0B_WORKER_ENTRY_AMBIGUOUS
P0B_WORKER_CLOSURE_INCOMPLETE
P0B_DYNAMIC_ASSET_UNDECLARED
P0B_ROUTE_BODY_SHA_MISMATCH
P0B_COI_HEADER_MISSING
P0B_EMIT_AB_IDENTITY_MISMATCH
```

### 24.3 Package

```text
P0C_PACKAGE_CONTENT_MISMATCH
P0C_DEV_SERVER_USED
P0C_SOURCE_TREE_FALLBACK
P0C_RUNTIME_API_UNHEALTHY
P0C_LEGACY_EXPORT_AUTHORITY_REACTIVATED
P0C_CAPABILITY_ADVERTISED_ARTIFACT_MISSING
P0C_ATOMIC_SAVE_SHA_MISMATCH
P0C_TEMP_FILE_LEAK
P0C_RELAUNCH_IDENTITY_MISMATCH
P0C_WORKER_GENERATION_NOT_CLOSED
P0C_MAIN_THREAD_ENCODER_FALLBACK
P0C_TEST_POINTER_RECOVERY_FAILED
P0_PRODUCTION_POINTER_MUTATED
```

### 24.4 실패 영수증

실패도 Receipt를 발급한다.

필수 필드:

- failed state
- failure code
- observed value
- expected value
- evidence path
- source/build/package identity
- production pointer preflight/postflight digest

실패 시 PASS Receipt를 덮어쓰지 않는다.

---

## 25. 실행 도구 구조

권장 도구:

```text
tools/promotion-baseline-00/
  audit-input.mjs
  run-lock-promotion.mjs
  verify-lock-receipt.mjs
  create-clean-workspace.mjs
  run-dual-emit.mjs
  verify-emitted-identity.mjs
  run-dual-package.mjs
  verify-package-identity.mjs
  launch-packaged-candidate.mjs
  probe-runtime-health.mjs
  run-cross-format-save-smoke.mjs
  force-worker-restart.mjs
  verify-relaunch.mjs
  run-test-pointer-recovery.mjs
  issue-baseline-receipt.mjs
```

### 25.1 단일 진입점

```text
npm run verify:promotion-baseline-00
```

단일 진입점은 상태 머신 순서를 강제한다.

개별 도구를 수동 실행해도 최종 Receipt는 상태 선행 조건을 다시 검증해야 한다.

### 25.2 권장 Package Scripts

```json
{
  "scripts": {
    "verify:promotion-baseline-00": "node tools/promotion-baseline-00/run.mjs",
    "verify:p0:lock": "node tools/promotion-baseline-00/run-lock-promotion.mjs",
    "verify:p0:emit": "node tools/promotion-baseline-00/run-dual-emit.mjs",
    "verify:p0:package": "node tools/promotion-baseline-00/run-dual-package.mjs",
    "verify:p0:e2e": "node tools/promotion-baseline-00/run-cross-format-save-smoke.mjs"
  }
}
```

이 스크립트 이름은 제안값이다. 실제 Package Script SSOT와 충돌하면 기존 naming convention을 따른다.

---

## 26. Artifact Directory

```text
artifacts/promotion-baseline-00/
  input/
  lock/
  emit/
  package/
  runtime/
  save-smoke/
  worker-restart/
  test-pointer/
  failures/
  receipts/
```

### 26.1 Append-only

Receipt Directory는 append-only다.

동일 Run ID의 기존 파일을 덮어쓰지 않는다.

### 26.2 Run ID

Run ID는 다음을 포함한다.

```text
canonicalInputDigest[0:12]
packageContentId[0:12] 또는 pending
monotonic local run sequence
```

Timestamp만으로 Run Identity를 만들지 않는다.

---

## 27. 보안·격리 규칙

- Test Output은 전용 임시 디렉터리에만 저장한다.
- 사용자 파일 경로를 사용하지 않는다.
- Production Pointer 경로는 read-only preflight만 허용한다.
- Registry Token, signing secret, user home path를 Receipt에 기록하지 않는다.
- Absolute Path는 evidence local field에만 두고 canonical digest 입력에서는 상대 경로로 정규화한다.
- Packaged E2E에서 외부 네트워크 요청은 0이어야 한다.
- Crash Hook은 Test Build 또는 명시적 test flag에서만 노출한다.
- Release Runtime에서 Crash Hook이 노출되면 FAIL이다.

---

## 28. 성능 관측

본 명세는 성능 승격 명세가 아니지만, 회귀 탐지를 위해 다음을 기록한다.

- offline npm ci duration
- Vite build duration
- package duration
- packaged boot to runtime ready
- Worker first spawn latency
- 각 포맷 encode duration
- save duration
- relaunch duration
- crash to new generation ready
- process peak RSS
- renderer peak JS heap, 가능 시

성능값은 PASS/FAIL의 주권자가 아니다.

단 OOM, watchdog kill, 무한 pending은 기능 실패다.

---

## 29. 완료 판정표

| Gate | 필수 | 성공 조건 |
|---|---:|---|
| Package Root Exact | 예 | mismatch 0 |
| Frozen Cache Closure | 예 | missing 0 |
| Offline npm ci A/B | 예 | graph digest 동일 |
| Lock Mutation Zero | 예 | true |
| Clean Emit A/B | 예 | byte graph 동일 |
| Worker Closure | 예 | unresolved 0 |
| Electron Static Route | 예 | body/MIME/COI 일치 |
| Package A/B Identity | 예 | canonical content 동일 |
| Packaged Launch | 예 | dev/source fallback 0 |
| Runtime API Health | 예 | READY |
| Cross-format Save Smoke | 예 | advertised format 전부 성공 |
| Disk SHA Parity | 예 | mismatch 0 |
| Relaunch | 예 | identity 동일 |
| Worker Restart | 예 | pending leak 0, new generation |
| Test Pointer Recovery | 예 | preflight byte 복구 |
| Production Pointer Mutation | 금지 | false |
| Source Mutation | 금지 | 0 |

---

## 30. 최종 PASS 문구

다음 문구는 모든 Gate가 닫힌 경우에만 출력한다.

```text
PASS TDT-PROMOTION-BASELINE-00
state=PACKAGED_BASELINE_VERIFIED
canonicalInput=<digest>
lock=<digest>
emittedArtifactIdentity=<digest>
packageContentId=<id>
packageABIdentity=true
packagedRuntime=true
crossFormatSaveSmoke=true
relaunch=true
workerRestart=true
testPointerRecovery=true
productionPointerMutation=false
sourceMutationZero=true
```

다음 문구는 금지한다.

```text
PRODUCTION_PROMOTED
FULL_PRODUCT_RELEASED
ALL_CODECS_EXACT_VERIFIED
PRODUCTION_ROLLBACK_VERIFIED
```

---

## 31. 후속 명세 인계

본 명세가 PASS한 뒤 다음으로 인계한다.

```text
TDT-ACTIVE-GRAPH-01
Admitted Runtime Code Graph /
Dead Branch Quarantine /
Randomness Zero /
Dynamic Asset Closure Seal
```

인계 Manifest에는 다음을 포함한다.

- canonical input digest
- promoted lock digest
- emitted artifact identity digest
- package content ID
- packaged runtime API digest
- admitted source graph digest
- observed dynamic asset set
- Worker generation receipt digest
- unsupported capability set

`TDT-ACTIVE-GRAPH-01`은 이 Package Baseline을 깨뜨리지 않는 조건에서 활성 코드 그래프를 축소해야 한다.

---

## 32. 베이크 범위

본 명세를 코드로 베이크할 때 최소 산출물은 다음이다.

### 32.1 신규

- 상위 상태 머신 Runner
- Canonical Baseline Input Manifest Generator
- Child Receipt Admission Verifier
- Dual Package Content Identity Verifier
- Packaged Runtime Health Probe
- Cross-format Atomic Save Smoke Runner
- Worker Crash·Restart Test Hook과 Verifier
- Isolated Test Pointer CAS·Recovery Runner
- Final Baseline Receipt Issuer

### 32.2 기존 도구 보강

- BUILD-LOCK Receipt가 상위 Runner에서 소비 가능하도록 schema 고정
- BUILD-EMIT Receipt가 Package Input Digest를 제공하도록 보강
- Electron Static Server Probe를 독립 실행 가능하게 분리
- Runtime Health를 preload IPC를 통해 구조화된 JSON으로 반환
- Export Result에 encoder ID·worker generation·artifact digest·surface revision 포함

### 32.3 수정 금지

- `jxl_encode_qmap_ex()` ABI
- `encode_mozjpeg_RGB()` ABI
- 현재 Canonical PSD Independent Parser의 fail-closed 범위
- Production Pointer
- 사용자 실제 Export Directory

---

## 33. 최종 판단

0번은 다듬다듬의 기능을 늘리는 단계가 아니다.

소스 안에서 서로를 증명하던 수백 개 계약을, 실제 설치 그래프·실제 emitted byte·실제 Electron Package·실제 디스크 출력으로 끌어내리는 단계다.

이 단계가 닫히기 전에는 후속 리팩터링이 좋아 보여도 기준점이 없다.

이 단계가 닫히면 이후 `ACTIVE-GRAPH`, `GPU-DEVICE-SSOT`, `SURFACE-LIFECYCLE`, `RESAMPLE-RUNTIME` 수정은 모두 동일 Package Baseline을 기준으로 회귀를 판정할 수 있다.

따라서 본 명세의 핵심 봉인은 다음 등식이다.

```text
Canonical Source
+ Promoted Dependency Lock
+ Frozen Cache
+ Canonical Toolchain
= Reproducible Install
= Reproducible Emit
= Reproducible Package
= Relaunchable Packaged Runtime
```

그리고 그 등식이 닫혀도 Production 승격은 아직 하지 않는다.

그 절제까지 포함해야 0번이 진짜 기반선이다.
