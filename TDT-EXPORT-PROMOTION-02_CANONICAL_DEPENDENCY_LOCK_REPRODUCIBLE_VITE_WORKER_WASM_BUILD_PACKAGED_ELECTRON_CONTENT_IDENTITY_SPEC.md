# TDT-EXPORT-PROMOTION-02

## Canonical Dependency Lock / Reproducible Vite Worker-WASM Build / Emitted Artifact Identity / Packaged Electron Content Seal

**문서 상태:** NORMATIVE SPECIFICATION

**부모 기준:** `TDT-EXPORT-PROMOTION-01` Source Bake

**대상 후보 Build ID:** `429c1a7b691c53cbf11234b6` 또는 동일 소스에서 재발급된 후속 Build ID

**승격 상한:** `PACKAGED_ARTIFACT_VERIFIED`

**본 명세에서 금지되는 최종 상태:** `PRODUCTION_PROMOTED`

---

## 0. 명세 요약

EP01은 Legacy Export Facade를 퇴역시키고 Stable Runtime Export API, Electron Save Session, Whole-build Rollback 경계를 소스 수준에서 닫았다.

그러나 현재 후보는 다음 이유로 제품 빌드가 아니다.

- 루트 `package-lock.json`의 직접 의존성 그래프가 `package.json`과 불일치한다.
- `pinia`, `vue`, `@napi-rs/cli`, `@vitejs/plugin-vue`, `typescript`, `vite`, `vue-tsc`가 Lock Root에 없다.
- `npm install --ignore-scripts`는 패키지 저장소 HTTP 503으로 실패했다.
- `vue-tsc`와 `vite`가 없어 Full Renderer Verify와 Production Build가 실행되지 않았다.
- Worker Manifest는 `source-graph-only` 상태이며 Vite가 실제 방출한 Worker JS, Chunk, WASM URL과 SHA-256을 증명하지 않는다.
- Production Runtime Manifest가 실제 Emitted Artifact Set보다 Source Manifest와 Lock Consistency만 본다.
- Electron Builder의 `files: native/**/*`와 광범위한 `asarUnpack`은 패키지 콘텐츠 최소성 및 정체성을 증명하지 않는다.
- Packaged App의 Static COOP/COEP Server가 `app.asar` 안의 Worker, WASM, ICC, Legacy Asset을 실제로 읽어 제공하는지 검증되지 않았다.

EP02는 위 문제를 다음 권위선으로 닫는다.

```text
Canonical Toolchain Profile
→ Exact Dependency Manifest
→ Immutable package-lock.json
→ Clean npm ci
→ TypeScript / Source Gates
→ Production Vite Build
→ Emitted Worker-WASM Artifact Manifest
→ Static Route Probe
→ Electron Unpacked Package
→ ASAR / Unpacked Content Manifest
→ Packaged Content Identity
→ Reproducible Build Receipt
→ PACKAGED_ARTIFACT_VERIFIED
```

EP02는 포맷별 실제 인코딩 성공, 독립 디코더 왕복, PSD CMYK 색 검증, JXL Pixel Exactness, MODJPEG Single-thread 재빌드, Promotion Pointer 변경을 수행하지 않는다. 해당 범위는 EP03에 귀속한다.

---

## 1. 목표

- 빌드 도구와 패키지 관리자의 정확한 버전을 단일 Toolchain Profile에 귀속한다.
- `package.json`과 `package-lock.json`의 Root Graph, Resolved Graph, Integrity Graph를 일치시킨다.
- `npm ci` 전후 Lock SHA-256이 변하지 않음을 증명한다.
- Production Vite Build를 깨끗한 작업 디렉터리에서 두 번 수행하고 Emitted Content의 결정성을 검증한다.
- 각 Canonical Worker의 Source Identity를 실제 Emitted Worker Entry, Shared Chunk, WASM, ICC, Binary Asset으로 추적한다.
- Production Worker Manifest를 `emitted-artifact-sha256` 모드로 발급한다.
- Production Runtime Manifest가 실제 Vite Entry Manifest와 Worker Artifact Manifest를 결속하도록 한다.
- Packaged Electron App의 ASAR, Unpacked Files, Native Addon, Renderer Assets를 하나의 Package Content Manifest로 봉인한다.
- 개발 소스, 임시 로그, 테스트 산출물, 불필요한 Rust Target Tree가 패키지에 들어가지 않도록 Fail-Closed한다.
- Packaged App이 COOP, COEP, CORP Header와 정확한 MIME으로 Worker, WASM, ICC를 제공하는지 검증한다.
- 성공한 경우에도 Production Pointer는 변경하지 않고 `PACKAGED_ARTIFACT_VERIFIED`에서 멈춘다.

## 2. 비목표

- PNG8, PNG16, WebP Lossless, JXL, JPEG, PSD의 실제 인코딩 Corpus 실행
- 독립 Decoder Pixel Round-trip
- PSD CMYK 실제 LCMS 색상 검증
- JXL 16-bit Capability 개방
- MODJPEG Single-thread Artifact 재빌드
- Code Signing, Notarization, Windows SmartScreen Reputation
- Production Promotion Pointer 변경
- 개별 Encoder 또는 Worker Rollback
- Legacy ExportManager 복귀

---

## 3. 현재 소스 기준 확정 사실

### 3.1 Package Manifest

루트 `package.json`은 다음 Production Graph를 선언한다.

```text
dependencies
  jszip
  pako
  sharp
  pinia
  vue

devDependencies
  @napi-rs/cli
  electron
  electron-builder
  @vitejs/plugin-vue
  typescript
  vite
  vue-tsc
```

현재 `package-lock.json` Root Graph에는 `pinia`, `vue`, `@napi-rs/cli`, `@vitejs/plugin-vue`, `typescript`, `vite`, `vue-tsc`가 없다.

### 3.2 Vite Build

현재 Production Renderer Build는 다음 순서다.

```text
generate-runtime-worker-manifest.mjs
→ generate-runtime-manifest.mjs
→ vite build --config vite.config.ts
```

현재 Source Worker Manifest는 `artifactVerificationMode: source-graph-only`다.

Vite Plugin은 `legacy-runtime` 전체를 `legacy/**`로 복사하면서 Worker Import Graph도 별도로 Bundle한다. 따라서 Raw Legacy Copy와 Bundled Chunk 간 중복, 활성 Reachability, Byte Identity를 Production Manifest가 증명해야 한다.

### 3.3 Electron Package

현재 Electron Builder 설정은 다음 범위를 패키지에 포함한다.

```text
dist/renderer/**/*
electron.mjs
preload.cjs
package.json
native/**/*
```

`native/**/*`는 Native Addon 실행 파일뿐 아니라 소스, Lock, Build Intermediate, Target Tree가 섞일 수 있는 광범위한 패턴이다.

현재 `asarUnpack`은 Renderer Legacy WASM, Vendor, Encoder, Worker 전체를 넓게 풀도록 선언한다. 실제 HTTP Static Server가 ASAR 내부 파일을 읽을 수 있다면 불필요한 Unpack일 수 있으며, 반대로 Emscripten Child Worker 또는 Native Addon에 실제 파일 경로가 필요하면 정확한 Allowlist가 필요하다.

### 3.4 Existing Promotion State

```text
SOURCE_BAKED_UNPROMOTED
dependencyInstallSucceeded = false
lockConsistent = false
productionRendererBuildExitCode = 127
packagedElectronBuildAttempted = false
electronE2eAttempted = false
```

---

## 4. 권위 용어

- **Toolchain Profile:** Node, npm, 운영체제, CPU Architecture, Electron Builder, Vite, TypeScript 등 빌드 도구의 정확한 버전과 실행 정책을 담는 권위 Artifact.
- **Dependency Manifest:** 직접 의존성 이름과 요청 버전을 담는 `package.json`의 정규화된 Projection.
- **Dependency Lock:** 전체 Transitive Dependency, Resolved URL, Integrity를 담는 `package-lock.json`.
- **Dependency Graph Digest:** Dependency Manifest와 Dependency Lock을 Canonical JSON으로 결합한 SHA-256.
- **Source Build ID:** 소스, Lock, Toolchain Profile로 결정되는 Build Identity.
- **Renderer Build ID:** Production Vite Output의 Canonical Emitted Manifest Digest.
- **Worker Emitted Artifact Set:** Worker Entry JS와 도달 가능한 Shared Chunk, WASM, ICC, Binary Asset의 폐쇄 집합.
- **Package Content ID:** Electron Unpacked App의 정규화된 파일 경로, 크기, SHA-256으로 결정되는 Content Identity.
- **Installer Envelope ID:** NSIS 또는 ZIP 파일 자체의 SHA-256. Package Content ID와 구분한다.
- **Packaged Artifact Verified:** Lock, Vite Output, Worker Asset, Electron Package Content가 검증됐으나 실제 포맷 E2E는 아직 수행하지 않은 상태.

---

## 5. 승격 상태 머신

```text
SOURCE_BAKED_UNPROMOTED
→ TOOLCHAIN_PROFILE_VERIFIED
→ DEPENDENCY_LOCK_VERIFIED
→ DEPENDENCY_INSTALL_VERIFIED
→ PRODUCTION_BUILD_VERIFIED
→ EMITTED_ARTIFACTS_VERIFIED
→ PACKAGED_ARTIFACT_VERIFIED
```

다음 전이는 EP02에서 금지한다.

```text
PACKAGED_ARTIFACT_VERIFIED
↛ ELECTRON_CROSS_FORMAT_E2E_VERIFIED
↛ PRODUCTION_PROMOTED
```

어느 단계에서든 실패하면 Candidate State는 마지막 성공 단계 또는 `SOURCE_BAKED_UNPROMOTED`로 남고 Production Pointer는 변경하지 않는다.

---

## 6. Toolchain Profile SSOT

새 파일을 추가한다.

```text
tools/toolchain-profile.json
```

필수 필드:

```json
{
  "schemaVersion": 1,
  "profileId": "dadum.production-toolchain-v1",
  "nodeVersion": "<exact>",
  "npmVersion": "<exact>",
  "platform": "win32",
  "arch": "x64",
  "electronVersion": "<exact-from-lock>",
  "electronBuilderVersion": "<exact-from-lock>",
  "viteVersion": "<exact-from-lock>",
  "typescriptVersion": "<exact-from-lock>",
  "vueTscVersion": "<exact-from-lock>",
  "timezone": "UTC",
  "locale": "C",
  "sourceDateEpoch": "<integer>",
  "networkPolicy": "install-only",
  "buildNetworkAllowed": false
}
```

규칙:

- `node --version`과 `npm --version`은 Toolchain Profile의 정확한 값과 일치해야 한다.
- `package.json.packageManager`는 `npm@<exact>` 형식으로 Toolchain Profile과 일치해야 한다.
- `package.json.engines.node`는 선택된 Node Version을 포함해야 한다.
- 빌드 단계에서는 네트워크 접근을 금지한다. 네트워크는 Dependency Acquisition 단계에서만 허용한다.
- Toolchain Profile은 Build ID 입력에 포함된다.
- Profile 변경은 동일 Build ID를 유지할 수 없다.

---

## 7. Dependency Manifest Policy

직접 의존성은 다음 중 하나의 정책을 선택해 전체에 동일 적용한다.

```text
exact-direct-version-v1
lock-authoritative-range-v1
```

EP02 기본 정책은 `exact-direct-version-v1`이다.

따라서 `package.json`의 모든 직접 Production 및 Development Dependency는 `^`, `~`, `*`, Tag, Git URL, Local File Path 없이 정확 버전으로 고정한다.

예외가 필요하면 `tools/dependency-policy-exceptions.json`에 패키지명, 사유, 만료일, 승인 Digest를 기록해야 한다.

---

## 8. Canonical package-lock Closure

### 8.1 Lock 생성

Lock은 승인된 Toolchain Profile에서 다음 방식으로만 생성한다.

```text
clean working tree
→ node_modules 삭제
→ package-lock.json 백업
→ npm install --package-lock-only --ignore-scripts --no-audit --no-fund
→ Root Graph 검증
→ Full Integrity 검증
→ Lock Canonical Digest 발급
```

### 8.2 Lock Root Exactness

`package-lock.json.packages[""]`의 `dependencies`와 `devDependencies`는 `package.json`과 Key 및 Version이 정확히 일치해야 한다.

누락, 초과, 버전 표현 차이는 모두 실패다.

### 8.3 Transitive Integrity

- 모든 Registry Package는 `resolved`와 `integrity`를 가져야 한다.
- Git Dependency, Mutable Branch, HTTP Tarball without Integrity를 금지한다.
- Local Path Dependency는 Production Graph에서 금지한다.
- 중복 Package Version은 허용할 수 있으나 Duplicate Graph Report에 기록한다.
- Optional Dependency의 Platform Exclusion은 실패가 아니라 명시된 Skip Receipt로 기록한다.

### 8.4 Lock Mutation Prohibition

다음 모든 명령 전후의 `package-lock.json` SHA-256은 동일해야 한다.

```text
npm ci
npm run typecheck:renderer
npm run verify:renderer
npm run build:renderer
npm run build:app
```

변경되면 `E_DEPENDENCY_LOCK_MUTATED`로 실패한다.

---

## 9. Clean Dependency Installation

### 9.1 설치 계약

```text
node_modules absent
npm cache verified
package-lock hash captured
npm ci --no-audit --no-fund
package-lock hash unchanged
installed graph digest emitted
```

### 9.2 Install Script Evidence

Electron, Sharp, Native Package 등 Install Script를 실행하는 Dependency는 다음 증거를 남긴다.

- 패키지명과 정확 버전
- 실행된 Lifecycle Hook
- Exit Code
- 생성 파일 목록과 SHA-256
- 다운로드 Host의 해시 처리된 식별자
- 설치 후 Native Binary Architecture

### 9.3 Registry Failure

HTTP 429, 500, 502, 503, 504는 Dependency Graph 실패가 아니라 Acquisition 실패로 분류한다.

Acquisition 실패 상태에서 Lock이나 Package Version을 임의 변경해 우회하는 것을 금지한다.

---

## 10. Production Build Environment

Production Build는 새 작업 디렉터리에서 수행한다.

필수 환경 규칙:

- `NODE_ENV=production`
- `TZ=UTC`
- 고정 Locale
- 고정 `SOURCE_DATE_EPOCH`
- Git Dirty Tree 금지 또는 Dirty Tree Digest 명시
- 빌드 중 네트워크 접근 금지
- 기존 `dist/renderer` 재사용 금지
- 기존 `release` 재사용 금지
- Production Sourcemap 금지
- 비허용 환경변수의 Build Input 유입 금지

허용 환경변수는 `tools/build-env-allowlist.json`에 고정한다.

---

## 11. Vite Production Build Authority

### 11.1 Build 순서

```text
verify toolchain
→ verify dependency lock
→ generate source worker manifest
→ generate source runtime manifest
→ vite build --mode production
→ parse .vite/manifest.json
→ resolve worker and asset closures
→ emit production worker manifest
→ emit production runtime manifest
→ verify static routes
```

### 11.2 Source Manifest와 Production Manifest 분리

다음 두 Artifact를 혼동하지 않는다.

```text
generated-worker-manifest.source.json
dadum-runtime-worker-manifest.production.json
```

Production Runtime은 `source-graph-only` Manifest를 사용해서는 안 된다.

### 11.3 Production Runtime Manifest

Production Manifest 필수 결속:

- Source Build ID
- Dependency Graph Digest
- Toolchain Profile Digest
- Vite Entry Manifest Digest
- Production Worker Manifest Digest
- Legacy Admission Manifest Digest
- Renderer Build ID
- Production Profile
- `artifactVerificationMode = emitted-artifact-sha256`

---

## 12. Emitted Worker-WASM Artifact Identity

### 12.1 대상 Worker

- `dadum.worker.encoder.webp-lossless-v1`
- `dadum.worker.encoder.png-family-v1`
- `dadum.worker.encoder.psd-canonical-v2`
- `dadum.worker.encoder.jxl-canonical-v1`
- `dadum.worker.encoder.modjpeg-canonical-v1`

### 12.2 Source-to-Emitted Mapping

각 Worker는 다음 Mapping을 가진다.

```json
{
  "workerId": "...",
  "sourceEntry": "app/src/runtime/workers/entries/...",
  "emittedEntryUrl": "/assets/...worker-<hash>.js",
  "emittedEntrySha256": "...",
  "closureChunks": [],
  "wasmAssets": [],
  "iccAssets": [],
  "binaryAssets": [],
  "emittedArtifactSetDigest": "..."
}
```

### 12.3 Closure 규칙

- Worker Entry의 Static Import와 Dynamic Import를 재귀 추적한다.
- JS Chunk가 `new URL()` 또는 Emscripten LocateFile로 참조하는 WASM, Worker Child, ICC를 포함한다.
- 동일 URL이 두 Worker Closure에 나타나는 Shared Chunk는 동일 SHA-256이어야 한다.
- Emitted URL이 Manifest에 없거나 파일이 없으면 실패한다.
- Source Artifact가 존재하지만 Emitted Closure에서 도달하지 않으면 Orphan Source로 기록한다.
- Emitted Artifact가 어떤 Worker 또는 Runtime Entry에도 귀속되지 않으면 Orphan Output으로 실패한다.

### 12.4 Artifact Mode 전환

Production Worker Descriptor는 반드시 다음 값을 가진다.

```text
artifactVerificationMode = emitted-artifact-sha256
artifactVerified = true
```

`source-graph-only` Descriptor가 Production Bundle에 포함되면 `E_WORKER_SOURCE_MANIFEST_IN_PRODUCTION`으로 실패한다.

---

## 13. Legacy Asset Admission and Duplication Truth

Vite Plugin은 현재 `legacy-runtime` 전체를 `legacy/**`로 복사한다.

EP02는 다음 분류를 요구한다.

```text
ACTIVE_RUNTIME_COPY
BUNDLED_EQUIVALENT
FIXTURE_ONLY
DEAD_LEGACY
FORBIDDEN_IN_PRODUCTION
```

각 Raw Legacy Asset은 하나의 Classification과 Owner를 가져야 한다.

같은 Source가 Bundled Chunk와 Raw Copy로 중복되는 경우 다음 중 하나를 만족해야 한다.

- Raw URL이 실제 Runtime에서 필요하며 Bundle과 역할이 다르다.
- Raw Copy는 Production Admission에서 제거된다.
- 두 Artifact가 동일 역할이면 단일 권위로 통합된다.

Production에 `DEAD_LEGACY` 또는 `FORBIDDEN_IN_PRODUCTION` 파일이 포함되면 실패한다.

---

## 14. Static COI Route Verification

Packaged App과 동일한 `electron.mjs` Static Server를 사용해 다음을 Probe한다.

필수 Header:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
Cache-Control: no-store
```

필수 MIME:

```text
.js/.mjs  application/javascript
.wasm     application/wasm
.icc      application/vnd.iccprofile
.json     application/json
.html     text/html
```

Probe 대상:

- `/index.html`
- Production Runtime Manifest
- Production Worker Manifest
- 모든 Worker Entry URL
- 모든 WASM URL
- 모든 ICC URL
- Emscripten Child Worker URL
- Legacy Admission Asset URL
- 존재하지 않는 URL의 404
- Path Traversal 요청의 403

---

## 15. Renderer Build Determinism

동일 소스, Lock, Toolchain Profile로 별도 디렉터리에서 Production Build를 두 번 수행한다.

비교 대상:

- 파일 경로 집합
- 파일 크기
- 파일 SHA-256
- Vite Manifest Canonical Digest
- Worker Emitted Artifact Set Digest
- Runtime Manifest Digest
- Legacy Admission Manifest Digest

다음은 결정성 비교에서 제외할 수 없다.

- Worker JS 파일명
- WASM 파일명과 Byte
- Runtime Manifest 내용
- Chunk Import Graph
- Index HTML Asset URL

Installer Timestamp와 Code Signing Envelope는 Renderer Content Determinism과 별도다.

---

## 16. Electron Package Content Authority

### 16.1 Canonical Package Target

EP02의 Package Content Identity는 Installer 파일보다 먼저 `win-unpacked` 또는 동등한 Unpacked App Directory를 기준으로 발급한다.

### 16.2 Package Allowlist

패키지에 허용되는 최상위 항목:

```text
app.asar
app.asar.unpacked/
DadumDadum.exe
Electron Runtime DLL / Locale / Resource
LICENSE / Version Metadata
```

App Content Allowlist:

```text
dist/renderer/**
electron.mjs
preload.cjs
package.json
native/decoder-rs/index.cjs
native/decoder-rs/package.json
native/decoder-rs/*.node
```

다음은 App Package에서 금지한다.

- `native/**/target/**`
- Rust Source and Cargo Build Cache
- `tools/**`
- `specs/**`
- `artifacts/**`
- `patches/**`
- Root Source Vue/TS Files
- `.git/**`
- 임시 로그와 테스트 Fixture

### 16.3 Native Addon Contract

Native Decoder Addon은 다음을 만족해야 한다.

- 정확히 하나의 Production `.node` Artifact가 선택된다.
- Artifact Architecture는 Package Architecture와 일치한다.
- `index.cjs`가 선택된 Addon을 실제로 Load한다.
- Debug Addon과 Release Addon이 동시에 포함되지 않는다.
- 필수 DLL이 있으면 정확한 Allowlist와 SHA-256을 가진다.
- Native Decoder unavailable 상태를 정상 Package로 승격하지 않는다.

### 16.4 ASAR / Unpacked Policy

각 파일은 다음 중 정확히 하나로 분류한다.

```text
ASAR_INTERNAL
ASAR_UNPACKED_REQUIRED
PACKAGE_EXTERNAL_RUNTIME
FORBIDDEN
```

Native `.node`는 `ASAR_UNPACKED_REQUIRED`다.

Renderer Worker, WASM, ICC는 Static HTTP Server가 ASAR 내부 Byte를 정상 제공하는 Probe를 통과하면 `ASAR_INTERNAL`로 유지할 수 있다.

광범위한 `dist/renderer/legacy/**` Unpack은 근거 없이 유지할 수 없다.

---

## 17. Package Content Manifest

새 Artifact:

```text
artifacts/runtime/TDT_EXPORT_PROMOTION_02_PACKAGE_CONTENT_MANIFEST.json
```

필수 필드:

- Package Content ID
- App ASAR SHA-256
- ASAR File Inventory Digest
- ASAR Unpacked Inventory Digest
- Native Addon SHA-256 and Architecture
- Renderer Build ID
- Production Runtime Manifest Digest
- Production Worker Manifest Digest
- Electron Version
- Platform and Architecture
- Forbidden File Count

Package Content ID는 경로, 크기, SHA-256을 Canonical Sorting한 Digest다.

Installer NSIS와 ZIP의 SHA-256은 Package Content ID에 포함하지 않고 별도 Envelope Receipt에 기록한다.

---

## 18. Build Provenance Receipt

새 Artifact:

```text
artifacts/runtime/TDT_EXPORT_PROMOTION_02_BUILD_PROVENANCE_RECEIPT.json
```

필수 결속:

- Source Build ID
- Source Tree Digest
- Toolchain Profile Digest
- Dependency Manifest Digest
- Dependency Lock Digest
- Installed Dependency Graph Digest
- Renderer Build ID
- Worker Emitted Manifest Digest
- Package Content ID
- Build Command Sequence Digest
- Environment Allowlist Digest
- Reproducible Build Result

---

## 19. Promotion Pointer 정책

EP02 성공 후 Pointer는 다음 상태만 기록한다.

```json
{
  "activeBuildId": null,
  "candidateBuildId": "<sourceBuildId>",
  "candidatePackageContentId": "<packageContentId>",
  "candidateState": "PACKAGED_ARTIFACT_VERIFIED",
  "pointerMutationPerformed": false
}
```

실제 Active Pointer 변경은 EP03의 Cross-format Electron E2E와 Rollback Drill 이후에만 허용한다.

---

## 20. Fail-Closed Error Registry

- `E_TOOLCHAIN_PROFILE_MISSING`: Toolchain Profile이 없다.
- `E_TOOLCHAIN_VERSION_MISMATCH`: Node 또는 npm 버전이 Profile과 다르다.
- `E_PACKAGE_MANAGER_IDENTITY_MISSING`: packageManager 필드가 없다.
- `E_DIRECT_DEPENDENCY_NOT_EXACT`: 직접 의존성이 정확 버전 정책을 위반한다.
- `E_DEPENDENCY_LOCK_ROOT_MISMATCH`: Lock Root Graph가 Package Manifest와 다르다.
- `E_DEPENDENCY_LOCK_INTEGRITY_MISSING`: Resolved Package Integrity가 없다.
- `E_DEPENDENCY_LOCK_MUTATED`: 검증 또는 빌드 중 Lock이 변경됐다.
- `E_DEPENDENCY_ACQUISITION_FAILED`: Registry 또는 Cache에서 Dependency를 확보하지 못했다.
- `E_INSTALLED_GRAPH_MISMATCH`: 설치된 Graph가 Lock과 다르다.
- `E_BUILD_NETWORK_ACCESS`: 빌드 단계에서 네트워크 접근이 감지됐다.
- `E_BUILD_ENV_UNDECLARED`: 허용되지 않은 환경변수가 Build Input에 들어갔다.
- `E_VITE_BUILD_FAILED`: Production Vite Build가 실패했다.
- `E_VITE_MANIFEST_MISSING`: Vite Manifest가 없다.
- `E_WORKER_SOURCE_MANIFEST_IN_PRODUCTION`: Production이 Source Worker Manifest를 사용한다.
- `E_WORKER_EMITTED_ENTRY_MISSING`: Worker Emitted Entry가 없다.
- `E_WORKER_ARTIFACT_CLOSURE_INCOMPLETE`: Worker Closure가 불완전하다.
- `E_WORKER_ARTIFACT_HASH_MISMATCH`: Emitted Artifact SHA가 다르다.
- `E_ORPHAN_OUTPUT_ARTIFACT`: Owner 없는 Output Artifact가 있다.
- `E_FORBIDDEN_LEGACY_ASSET_EMITTED`: 금지된 Legacy Asset이 Production에 포함됐다.
- `E_STATIC_ROUTE_HEADER_MISMATCH`: COI Header가 다르다.
- `E_STATIC_ROUTE_MIME_MISMATCH`: MIME이 다르다.
- `E_RENDERER_BUILD_NONDETERMINISTIC`: 두 Production Build의 Content가 다르다.
- `E_ELECTRON_PACKAGE_FAILED`: Electron Package Build가 실패했다.
- `E_PACKAGE_FORBIDDEN_FILE`: 금지 파일이 Package에 포함됐다.
- `E_ASAR_POLICY_VIOLATION`: ASAR 또는 Unpacked 분류가 계약과 다르다.
- `E_NATIVE_ADDON_MISSING`: Native Addon이 없다.
- `E_NATIVE_ADDON_ARCH_MISMATCH`: Native Addon Architecture가 다르다.
- `E_PACKAGE_CONTENT_HASH_MISMATCH`: Package Content Manifest와 실제 파일이 다르다.
- `E_PACKAGE_STATIC_SERVER_UNVERIFIED`: Packaged Static Server Probe가 없다.
- `E_PREMATURE_PRODUCTION_POINTER_MUTATION`: EP03 이전에 Active Pointer가 변경됐다.

---

## 21. Required Artifacts

- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_TOOLCHAIN_RECEIPT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_DEPENDENCY_LOCK_RECEIPT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_DEPENDENCY_INSTALL_RECEIPT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_VITE_BUILD_RECEIPT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_WORKER_SOURCE_TO_EMITTED_MAP.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_EMITTED_WORKER_MANIFEST.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_LEGACY_ADMISSION_REPORT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_STATIC_ROUTE_PROBE_REPORT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_RENDERER_DETERMINISM_REPORT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_ASAR_CONTENT_REPORT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_NATIVE_ADDON_PACKAGE_REPORT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_PACKAGE_CONTENT_MANIFEST.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_INSTALLER_ENVELOPE_REPORT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_BUILD_PROVENANCE_RECEIPT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_02_FIX_RECEIPT.json`
- `artifacts/runtime/TDT_EXPORT_PROMOTION_POINTER.json`

---

## 22. Static Gates

| Gate | 검증 | 실패 시 |
|---|---|---|
| `EP02-01` | Toolchain Profile 파일 존재와 Schema 검증 | Fail-Closed |
| `EP02-02` | Node Exact Version 일치 | Fail-Closed |
| `EP02-03` | npm Exact Version 일치 | Fail-Closed |
| `EP02-04` | packageManager Identity 일치 | Fail-Closed |
| `EP02-05` | engines.node 수용 범위 | Fail-Closed |
| `EP02-06` | 직접 Dependency 정확 버전 정책 | Fail-Closed |
| `EP02-07` | Package Manifest Canonical Digest | Fail-Closed |
| `EP02-08` | Lock Root Dependency Exact Match | Fail-Closed |
| `EP02-09` | Lock Root DevDependency Exact Match | Fail-Closed |
| `EP02-10` | Lock Transitive Resolved URL 존재 | Fail-Closed |
| `EP02-11` | Lock Transitive Integrity 존재 | Fail-Closed |
| `EP02-12` | Git/File/Mutable Dependency 0 | Fail-Closed |
| `EP02-13` | Lock Mutation 0 | Fail-Closed |
| `EP02-14` | Installed Graph Lock Parity | Fail-Closed |
| `EP02-15` | Build Environment Allowlist | Fail-Closed |
| `EP02-16` | Production Sourcemap Disabled | Fail-Closed |
| `EP02-17` | Clean dist Requirement | Fail-Closed |
| `EP02-18` | Vite Production Build Success | Fail-Closed |
| `EP02-19` | Vite Manifest 존재 | Fail-Closed |
| `EP02-20` | Vite Entry Chunk 단일성 | Fail-Closed |
| `EP02-21` | Production Runtime Manifest 존재 | Fail-Closed |
| `EP02-22` | Production Worker Manifest 존재 | Fail-Closed |
| `EP02-23` | Source Worker Manifest Production Reachability 0 | Fail-Closed |
| `EP02-24` | WebP Worker Emitted Entry Mapping | Fail-Closed |
| `EP02-25` | PNG Family Worker Emitted Entry Mapping | Fail-Closed |
| `EP02-26` | PSD Worker Emitted Entry Mapping | Fail-Closed |
| `EP02-27` | JXL Worker Emitted Entry Mapping | Fail-Closed |
| `EP02-28` | MODJPEG Worker Emitted Entry Mapping | Fail-Closed |
| `EP02-29` | Worker Shared Chunk Closure | Fail-Closed |
| `EP02-30` | WASM Asset Closure | Fail-Closed |
| `EP02-31` | ICC Asset Closure | Fail-Closed |
| `EP02-32` | Child Worker Closure | Fail-Closed |
| `EP02-33` | Emitted Artifact SHA-256 완전성 | Fail-Closed |
| `EP02-34` | Orphan Output 0 | Fail-Closed |
| `EP02-35` | Legacy Admission Classification 완전성 | Fail-Closed |
| `EP02-36` | Forbidden Legacy Production Asset 0 | Fail-Closed |
| `EP02-37` | Raw/Bundled Duplicate Truth | Fail-Closed |
| `EP02-38` | Runtime Manifest Emitted Digest 결속 | Fail-Closed |
| `EP02-39` | Static Route COOP | Fail-Closed |
| `EP02-40` | Static Route COEP | Fail-Closed |
| `EP02-41` | Static Route CORP | Fail-Closed |
| `EP02-42` | Static Route MIME Matrix | Fail-Closed |
| `EP02-43` | Path Traversal 403 | Fail-Closed |
| `EP02-44` | Missing Asset 404 | Fail-Closed |
| `EP02-45` | Renderer Double Build File Set Parity | Fail-Closed |
| `EP02-46` | Renderer Double Build SHA Parity | Fail-Closed |
| `EP02-47` | Electron Unpacked Build Success | Fail-Closed |
| `EP02-48` | App ASAR 존재 | Fail-Closed |
| `EP02-49` | Package Allowlist 준수 | Fail-Closed |
| `EP02-50` | Package Forbidden File 0 | Fail-Closed |
| `EP02-51` | Native Addon Release Artifact 단일성 | Fail-Closed |
| `EP02-52` | Native Addon Architecture Parity | Fail-Closed |
| `EP02-53` | ASAR/Unpacked Classification 완전성 | Fail-Closed |
| `EP02-54` | Packaged Static Server Asset Probe | Fail-Closed |
| `EP02-55` | Package Content Manifest Parity | Fail-Closed |
| `EP02-56` | Package Content ID 결정성 | Fail-Closed |
| `EP02-57` | Build Provenance Receipt 결속 | Fail-Closed |
| `EP02-58` | Production Pointer Mutation 0 | Fail-Closed |
| `EP02-59` | 부모 R7/EW01-EW07/EP01 Gate 회귀 | Fail-Closed |
| `EP02-60` | EP02 Candidate State 상한 준수 | Fail-Closed |

---

## 23. Runtime and Build Test Matrix

| Test | 시나리오 | 기대 결과 |
|---|---|---|
| `RT-EP02-001` | 정확한 Toolchain에서 Profile PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-002` | Node Patch Version 차이 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-003` | npm Version 차이 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-004` | packageManager 누락 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-005` | 직접 Dependency Caret 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-006` | Lock Root 누락 Dependency 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-007` | Lock Root 초과 Dependency 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-008` | Integrity 누락 Package 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-009` | Git Branch Dependency 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-010` | npm ci 후 Lock Mutation 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-011` | Install Graph Parity PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-012` | Registry 503를 Acquisition Failure로 분류 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-013` | Build 단계 Network 접근 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-014` | Clean dist Build PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-015` | 기존 dist 재사용 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-016` | Production Sourcemap 생성 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-017` | Vite Entry Manifest PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-018` | Worker Entry 5종 Mapping PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-019` | 누락 Worker Entry 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-020` | 누락 WASM 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-021` | WASM SHA 변조 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-022` | Shared Chunk SHA 불일치 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-023` | Child Worker 누락 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-024` | Source Manifest Production 사용 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-025` | Orphan JS Output 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-026` | Orphan WASM Output 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-027` | Legacy Active Copy PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-028` | Dead Legacy Copy 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-029` | Raw/Bundled Duplicate 역할 분리 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-030` | Runtime Manifest Worker Digest 결속 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-031` | Static index.html 200 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-032` | Worker JS MIME PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-033` | WASM MIME PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-034` | ICC MIME PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-035` | COOP/COEP/CORP PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-036` | Path Traversal 403 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-037` | Missing File 404 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-038` | Double Build File Set 동일 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-039` | Double Build Byte 동일 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-040` | 환경변수 변화 탐지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-041` | Source Date Epoch 변화 탐지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-042` | Electron win-unpacked 생성 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-043` | app.asar 존재 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-044` | preload.cjs 패키지 포함 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-045` | electron.mjs 패키지 포함 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-046` | dist/renderer 패키지 포함 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-047` | tools 디렉터리 패키지 제외 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-048` | specs 디렉터리 패키지 제외 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-049` | Rust target 디렉터리 패키지 제외 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-050` | Release Native Addon 단일 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-051` | Debug Native Addon 동시 포함 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-052` | Native Addon Architecture PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-053` | Native Addon Load Smoke PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-054` | Native Addon 누락 Package 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-055` | ASAR Internal Worker Route PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-056` | ASAR Internal WASM Route PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-057` | Unpacked Allowlist 외 파일 거부 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-058` | Package Content Manifest 재계산 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-059` | Package 파일 변조 탐지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-060` | Package Content ID 재현 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-061` | Installer Envelope SHA 기록 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-062` | Installer Envelope 차이와 Content ID 분리 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-063` | Build Provenance Receipt 재계산 PASS | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-064` | Dependency Digest 변조 탐지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-065` | Toolchain Digest 변조 탐지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-066` | Worker Manifest Digest 변조 탐지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-067` | Package Manifest Digest 변조 탐지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-068` | Candidate State PACKAGED_ARTIFACT_VERIFIED | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-069` | Active Pointer Null 유지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-070` | 개별 Encoder Rollback 0 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-071` | Legacy Fallback 0 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-072` | 부모 EP01 Facade Tombstone 유지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-073` | 부모 EW02 Pending 0 유지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-074` | 부모 EW03 PNG/WebP Identity 유지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-075` | 부모 EW05 JXL 8-bit만 광고 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-076` | 부모 EW06 JPEG pthread 미승격 유지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-077` | 부모 EW07 PSD CMYK Blocker 유지 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-078` | Full Product Promotion 미발급 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-079` | Production Promoted 문자열 0 | PASS 또는 명시적 Fail-Closed |
| `RT-EP02-080` | Receipt Set SHA Closure PASS | PASS 또는 명시적 Fail-Closed |

---

## 24. Implementation Work Packages

### EP02-A

Toolchain Profile 및 Dependency Policy 파일 추가.

### EP02-B

package.json 직접 버전 고정 및 packageManager/engines 추가.

### EP02-C

Canonical package-lock 재생성 및 Lock Gate 추가.

### EP02-D

Clean npm ci Receipt와 Installed Graph Verifier 추가.

### EP02-E

Vite Plugin을 Source Manifest와 Production Emitted Manifest 이원화.

### EP02-F

Worker Source-to-Emitted Resolver와 Closure Walker 구현.

### EP02-G

Legacy Admission Classification과 Orphan Output Gate 구현.

### EP02-H

Static COI Route Probe 구현.

### EP02-I

Renderer Double Build Determinism Runner 구현.

### EP02-J

Electron Builder Files/asarUnpack 최소화.

### EP02-K

Native Addon Package Allowlist와 Architecture Verifier 구현.

### EP02-L

Package Content Manifest 및 Provenance Receipt 구현.

### EP02-M

EP02 60 Gate와 80 Test Matrix 결선.

### EP02-N

Production Pointer Non-Mutation Seal.

---

## 25. Acceptance Criteria

EP02 PASS는 다음이 모두 참일 때만 발급한다.

- [ ] Toolchain Profile exact match
- [ ] Package Manifest와 Lock Root exact match
- [ ] Lock transitive integrity complete
- [ ] Clean `npm ci` success
- [ ] Install 전후 Lock SHA-256 동일
- [ ] Full TypeScript 및 Parent Gates PASS
- [ ] Production Vite Build PASS
- [ ] Production Worker Manifest가 emitted-artifact-sha256 모드
- [ ] Worker 5종 Entry/Chunk/WASM/ICC Closure 완전
- [ ] Production Static Route Probe PASS
- [ ] Renderer Double Build Determinism PASS
- [ ] Electron Unpacked Package Build PASS
- [ ] Native Addon Release Artifact와 Architecture PASS
- [ ] Package Forbidden File 0
- [ ] Package Content Manifest 재계산 PASS
- [ ] Package Content ID 재현 PASS
- [ ] Production Pointer 미변경
- [ ] Candidate State가 PACKAGED_ARTIFACT_VERIFIED

다음 중 하나라도 미충족이면 Status는 `SOURCE_BAKED_UNPROMOTED`, `DEPENDENCY_LOCK_VERIFIED`, `PRODUCTION_BUILD_VERIFIED` 중 마지막 실제 상태로 남는다.

---

## 26. Rollback and Failure Closure

- Lock 생성 실패 시 기존 Lock을 덮어쓰지 않는다.
- Production Build 실패 시 기존 `dist/renderer`를 Candidate로 채택하지 않는다.
- Package Build 실패 시 부분 생성 Installer를 Promotion Artifact로 등록하지 않는다.
- 두 번째 결정성 Build가 다르면 첫 번째 Build도 무효다.
- Package Content ID 검증 실패 시 Installer Envelope가 존재해도 무효다.
- EP02 실패는 Legacy Facade를 복구하지 않는다.
- EP02 실패는 개별 Worker를 이전 Artifact로 내려가지 않는다.
- Active Production Pointer는 절대 변경하지 않는다.

---

## 27. 후속 명세

EP02 다음은 다음 명세로 고정한다.

```text
TDT-EXPORT-PROMOTION-03

Packaged Electron Cross-format E2E /
Independent Decoder Matrix /
PSD CMYK Production Color Validation /
JXL Exact Round-trip /
MODJPEG Canonical Artifact Closure /
Production Pointer Promotion /
Rollback Drill Truth Seal
```

EP03만 `PRODUCTION_PROMOTED` 상태를 발급할 수 있다.

---

## 28. 최종 판정 문장

EP02의 성공은 "인코더가 실제로 모든 포맷을 올바르게 저장했다"는 뜻이 아니다.

EP02의 성공은 다음만을 뜻한다.

> 동일한 소스, 정확한 의존성 Lock, 정확한 Toolchain에서 동일한 Vite Worker-WASM 산출물과 동일한 Electron Package Content가 재현됐으며, 그 패키지가 다음 E2E 검증에 투입될 자격을 얻었다.

포맷 의미와 실제 파일 품질의 최종 제품 승격은 EP03에서 판정한다.

