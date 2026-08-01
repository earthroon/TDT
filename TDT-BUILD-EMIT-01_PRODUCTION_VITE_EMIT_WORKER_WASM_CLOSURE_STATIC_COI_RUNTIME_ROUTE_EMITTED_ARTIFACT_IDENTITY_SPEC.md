# TDT-BUILD-EMIT-01

## Production Vite Emit / Worker-WASM Closure / Static COI Runtime Route / Emitted Artifact Identity Seal

**상태:** Specification Ready / Bake Not Applied

**부모 권위:** `TDT-BUILD-LOCK-01`, `TDT-EXPORT-PROMOTION-02`, `TDT-EXPORT-PROMOTION-03`

**진입 조건:** `TDT-BUILD-LOCK-01`의 `DEPENDENCY_LOCK_PROMOTED`

**핵심 판정:** Source Graph가 아니라 실제 `dist/renderer` Byte와 실제 Electron Static Route가 재현·검증돼야 한다.

---

## 0. 목적

본 명세는 Canonical Dependency Lock으로 복원된 동일 입력에서 Vite Production Build를 두 번 수행하고, 그 결과로 방출된 Renderer Entry, Worker Entry, Shared Chunk, WASM, ICC, Pthread Child Worker, Runtime Manifest 및 Legacy Static Asset의 실제 Byte 정체성을 봉인한다.

본 명세은 다음 네 가지를 서로 다른 증거 계층으로 분리한다.

1. Source Artifact Identity
2. Vite/Rollup Emitted Artifact Identity
3. Static Route Identity
4. Electron Runtime Route Identity

Source 파일이 존재하거나 Source SHA가 일치한다는 사실만으로 Production Worker가 올바르게 방출됐다고 판정하지 않는다.

합성 Node HTTP Server에서 COI Header가 보인다는 사실만으로 Electron 제품 Route가 올바르다고 판정하지 않는다.

---

## 1. 현재 소스 감사 결과

### 1.1 확정된 현 상태

- `dist/renderer`는 현재 존재하지 않는다.
- `package.json`의 `build:renderer`는 `verify:toolchain → verify:dependency-lock → Source Manifest 생성 → Vite Build → Emitted Manifest 생성 → Production Runtime Manifest 생성 → Emitted 검증 → Static COI 검증` 순서다.
- 현재 BUILD-LOCK-01 Promotion Receipt는 `INPUT_PROFILE_SEALED / promoted=false`다.
- 따라서 현재 환경에서는 Production Vite Emit에 진입할 수 없다.
- Vite 설정은 `root: app`, `base: /`, `publicDir: false`, `target: es2022`, Production Sourcemap 비활성이다.
- 필수 Encoder Worker는 JXL, MODJPEG, PNG Family, PSD Canonical, WebP Lossless의 5개다.
- 각 Worker URL은 `?worker&url` Import를 통해 생성된다.
- `app/legacy-runtime`에는 현재 1,170개 파일이 있다.
- Vite Runtime Manifest Plugin은 현재 `legacy-runtime` 전체 파일을 `/legacy/**`로 Raw Copy한다.
- 현재 Emitted Worker Generator는 Worker ID와 Protocol 문자열을 포함하는 JS 파일을 검색해 Entry를 추정한다.
- 현재 Closure 수집기는 정규식 Import와 Asset Basename 검색에 의존한다.
- 현재 Closure 수집기는 `new URL(..., import.meta.url)`, Emscripten `locateFile`, Pthread Child Worker를 권위 있는 Rollup Graph로 직접 증명하지 않는다.
- 현재 COI 검증기는 별도 합성 HTTP Server를 생성하며 Electron Main의 `serveStaticWithCOI()`를 직접 검증하지 않는다.
- Electron Static Server는 COOP `same-origin`, COEP `require-corp`, CORP `same-origin`과 WASM·ICC MIME을 구현하고 있다.
- 현재 Production Runtime Manifest는 Emitted Worker Manifest와 Vite Entry Manifest Digest를 결속하도록 설계돼 있으나 실제 Build Output은 아직 없다.

### 1.2 현재 Source Worker의 URL 해석 방식

다음 URL 해석은 Production Closure에 반드시 포함돼야 한다.

| Worker | URL 해석 계약 | 필수 Closure |
|---|---|---|
| JXL | `new URL(./jxl_bindings.wasm, import.meta.url)` 및 `locateFile` | Entry JS, Shared Chunk, JXL WASM, Emscripten Child Worker |
| MODJPEG | `new URL(../wasm/libmodjpeg_wasm.wasm, import.meta.url)` 및 `locateFile` | Entry JS, MODJPEG JS, WASM, Pthread Child Worker |
| PNG Family | `locateFile(path) = new URL(path, import.meta.url)` | Entry JS, LodePNG JS, WASM, Child Worker |
| PSD Canonical | Dynamic LCMS·PSD Serializer Import | Entry JS, Handler, LCMS WASM, PSD WASM, ICC Inputs |
| WebP Lossless | Dynamic Import of `webp_api.js` | Entry JS, Handler, WebP API, WebP WASM |

### 1.3 현재 Emitted Generator의 한계

- Worker Entry를 Rollup Chunk Metadata가 아니라 문자열 포함 여부로 식별한다.
- 동일 Worker ID·Protocol이 Shared Chunk에도 남으면 Entry가 Ambiguous해질 수 있다.
- Minifier가 문자열을 제거하거나 분리하면 Entry를 찾지 못할 수 있다.
- Import 정규식은 모든 `new URL`, `locateFile`, 생성된 Child Worker URL을 설명하지 못한다.
- WASM·ICC Basename 검색은 같은 Basename의 복수 Asset을 잘못 연결할 수 있다.
- Raw Static Copy와 Bundle Copy가 같은 Source를 중복 소유해도 현재 Manifest는 단일 Owner를 강제하지 않는다.
- Build A/B Byte Reproducibility를 아직 검증하지 않는다.
- 실제 Electron Static Route와 합성 Route의 Header·Body SHA Parity를 검증하지 않는다.

---

## 2. 범위

### 2.1 포함 범위

- Canonical Production Vite Build Admission
- Clean Build A/B Transaction
- Vite/Rollup Metadata 기반 Source-to-Emitted Mapping
- Worker Entry와 Shared Chunk Closure
- WASM·ICC·Pthread Child Worker Closure
- Legacy Raw Static Admission Allowlist
- Artifact Ownership 단일성
- Production Worker Manifest
- Production Runtime Manifest
- Route Manifest
- Synthetic Static Server Probe
- Electron Static Server Probe
- Build A/B Byte Reproducibility
- Emitted Artifact Identity Receipt
- Source·Lock Mutation Zero

### 2.2 제외 범위

- Native Decoder `.node` 빌드
- Electron ASAR·Installer 생성
- Packaged Electron Cross-format Export E2E
- JXL 독립 Pixel Round-trip
- MODJPEG Single-thread 재빌드
- PSD CMYK Production Color Validation
- Production Pointer Mutation
- Rollback Drill

위 항목은 BUILD-EMIT-01 이후 단계에서 수행한다.

---

## 3. 규범 용어

- **MUST / SHALL:** 반드시 충족해야 한다.
- **MUST NOT / SHALL NOT:** 절대 허용하지 않는다.
- **SOURCE ARTIFACT:** Build 전 Source Tree에 존재하는 파일.
- **EMITTED ARTIFACT:** Vite/Rollup Build가 `dist/renderer`에 실제 생성한 파일.
- **WORKER ENTRY:** `?worker&url` Import가 가리키는 Worker 실행 진입 JS.
- **WORKER CLOSURE:** Worker 실행에 필요한 Entry, Chunk, WASM, ICC, Child Worker의 전이 폐쇄 집합.
- **RAW STATIC:** Bundle Transformation 없이 Source Byte가 Static URL로 복사된 파일.
- **OWNERSHIP MODE:** `vite-bundle`, `vite-emitted-asset`, `legacy-raw-admitted` 중 하나.
- **ROUTE IDENTITY:** URL, Body SHA-256, Byte Length, MIME, COI Header의 결합.
- **BUILD A/B:** 같은 Lock·Cache·Toolchain·Source에서 서로 다른 Clean Workspace로 수행한 두 Build.

---

## 4. SSOT 소유권

| 영역 | SSOT | 비권위 자료 |
|---|---|---|
| Dependency Input | BUILD-LOCK-01 Promotion Receipt | 현재 package.json만 단독으로 읽은 값 |
| Toolchain | Canonical Toolchain Profile | Ambient PATH의 임의 Binary |
| Source Worker | generated-worker-manifest.json | 수동 파일 목록 |
| Emitted Worker | Production Emitted Worker Manifest | Source Graph Digest |
| Build Entry | Vite/Rollup Metadata | JS 문자열 검색 결과 |
| Worker Closure | Rollup Chunk Graph + Explicit Runtime Asset Projection | Basename 추정 |
| Raw Static | Legacy Static Admission Manifest | legacy-runtime 전체 디렉터리 |
| Route | Static Route Manifest | 파일 존재 여부만 확인 |
| Runtime Route | Electron Server Probe Receipt | 합성 Server Receipt |
| Final Build Identity | Emitted Artifact Identity Receipt | Build Exit Code |

---

## 5. 상태 머신

```text
BLOCKED_LOCK_NOT_PROMOTED
→ BUILD_INPUT_SEALED
→ CLEAN_BUILD_A_COMPLETED
→ CLEAN_BUILD_B_COMPLETED
→ VITE_ENTRY_GRAPH_VERIFIED
→ WORKER_CLOSURE_VERIFIED
→ LEGACY_STATIC_ADMISSION_VERIFIED
→ EMITTED_ARTIFACTS_VERIFIED
→ STATIC_COI_ROUTES_VERIFIED
→ ELECTRON_COI_ROUTES_VERIFIED
→ BUILD_REPRODUCIBILITY_VERIFIED
→ EMITTED_ARTIFACT_IDENTITY_VERIFIED
```

### 5.1 상태 상한

BUILD-LOCK-01이 `DEPENDENCY_LOCK_PROMOTED`가 아니면 본 명세의 상태 상한은 `BLOCKED_LOCK_NOT_PROMOTED`다.

Source Gate와 도구 베이크는 가능하지만, 실제 Production Emit PASS를 발급할 수 없다.

---

## 6. 진입 조건

다음 조건이 모두 참이어야 Build A에 진입한다.

- BUILD-LOCK-01 Promotion Receipt `promoted=true`
- Promotion Receipt State `DEPENDENCY_LOCK_PROMOTED`
- 현재 `package-lock.json` SHA가 Promoted Lock SHA와 일치
- 현재 `package.json` SHA가 Promoted Package SHA와 일치
- Canonical Host `win32-x64`
- Node·npm·Vite·TypeScript·vue-tsc가 Toolchain Profile과 일치
- Frozen npm Cache Digest가 Lock Promotion Receipt와 일치
- Production Build Network Access 0

진입 조건이 하나라도 거짓이면 Vite를 실행하지 않는다.

---

## 7. Canonical Build Input Manifest v1

Build Input Manifest는 다음 필드를 포함한다.

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-BUILD-EMIT-01",
  "target": "win32-x64",
  "packageJsonSha256": "...",
  "packageLockSha256": "...",
  "lockPromotionReceiptSha256": "...",
  "frozenCacheDigest": "...",
  "toolchainProfileDigest": "...",
  "buildAuthorityDigest": "...",
  "sourceTreeDigest": "...",
  "workerSourceManifestDigest": "...",
  "legacySourceManifestDigest": "...",
  "networkPolicy": "offline-build-v1",
  "selfDigest": "..."
}
```

Build A와 B는 동일한 Build Input Manifest를 사용해야 한다.

---

## 8. Clean Build Transaction

### 8.1 Workspace

Build A와 B는 서로 다른 절대 경로의 Clean Workspace에서 실행한다.

원본 프로젝트 Workspace에서 직접 Build하지 않는다.

Workspace는 Symlink·Junction 없이 실제 파일 복사로 구성한다.

### 8.2 Dist 정책

Build 직전 `dist/renderer`는 존재하지 않거나 빈 디렉터리여야 한다.

Vite의 `emptyOutDir`만 믿지 않고 사전 상태를 별도 검사한다.

### 8.3 Mutation Zero

다음 파일·그래프는 Build 전후 SHA가 동일해야 한다.

- `package.json`
- `package-lock.json`
- `app/**`
- `tools/**`
- `vite.config.ts`
- `tsconfig.json`
- `electron.mjs`
- `preload.cjs`
- `native/**`
- `specs/**`

Build가 Source 파일을 생성·수정해야 한다면 그 파일은 Build Workspace의 Generated 영역에만 생성하며 원본 Source Tree에 역기록하지 않는다.

---

## 9. Vite Production Build Authority

Canonical 명령은 다음 순서를 따른다.

```text
verify:toolchain
→ verify:dependency-lock
→ verify:build-lock-promotion
→ generate:runtime-worker-source-manifest
→ generate:runtime-source-manifest
→ vite build --mode production
→ generate:emitted-artifact-manifest
→ generate:production-runtime-manifest
→ generate:static-route-manifest
→ verify:emitted-artifacts
→ verify:static-coi-routes
→ verify:electron-coi-routes
```

Production Build는 Network Access를 사용하지 않는다.

Production Sourcemap은 방출하지 않는다.

---

## 10. Vite/Rollup Entry Mapping

Worker Entry는 emitted JS 텍스트에 Worker ID가 포함됐는지 검색해 찾지 않는다.

Mapping은 다음 권위 입력을 사용한다.

- Vite Manifest
- Rollup Bundle Chunk Metadata
- `facadeModuleId`
- `moduleIds`
- `imports`
- `dynamicImports`
- Worker URL Import Module ID

각 Source Worker Entry는 정확히 하나의 Emitted Worker Entry로 매핑돼야 한다.

0개 또는 2개 이상이면 실패한다.

---

## 11. Worker Closure Graph v2

### 11.1 Closure Node

```json
{
  "url": "/assets/...",
  "role": "worker-entry|shared-chunk|wasm|icc|child-worker|runtime-asset",
  "ownershipMode": "vite-bundle|vite-emitted-asset|legacy-raw-admitted",
  "byteLength": 0,
  "sha256": "...",
  "sourceIdentity": "...",
  "sourceSha256": "...",
  "parents": ["..."],
  "edgeKinds": ["static-import|dynamic-import|new-url|locate-file|pthread-child"]
}
```

### 11.2 Closure Edge

다음 Edge Kind를 모두 지원한다.

- `static-import`
- `dynamic-import`
- `new-url`
- `locate-file`
- `pthread-child`
- `runtime-fetch`
- `manifest-reference`

### 11.3 동적 경로

동적 문자열 조합으로 URL이 생성되는 경우 명시적 Projection Table을 요구한다.

Projection Table 없이 런타임에서만 알 수 있는 Asset Path는 Production Worker Closure로 승격하지 않는다.

### 11.4 Pthread Child Worker

Emscripten Pthread 사용 Worker는 다음을 기록한다.

- `childWorkerUrl`
- `childWorkerSha256`
- `childWorkerByteLength`
- `parentWorkerId`
- `pthreadPoolSize`
- `sharedMemoryRequired`
- `coiRequired`

Child Worker가 Bundle Inline Blob으로 생성되는 경우 Blob 생성 Source Chunk와 Runtime 정책을 명시한다.

---

## 12. Artifact Ownership

모든 실행 Artifact는 정확히 하나의 Ownership Mode를 가져야 한다.

| Mode | 의미 |
|---|---|
| `vite-bundle` | Rollup Chunk Graph가 소유 |
| `vite-emitted-asset` | Vite Asset Pipeline이 소유 |
| `legacy-raw-admitted` | 명시적 Legacy Static Admission이 Source Byte 그대로 소유 |

같은 Source Artifact를 Bundle과 Raw Static이 동시에 소유하는 것은 금지한다.

호환 Alias가 필요한 경우 Alias URL과 Canonical URL을 Manifest에 명시하고, 둘의 Body SHA가 동일함을 증명해야 한다.

---

## 13. Legacy Static Admission Manifest v1

현재 `legacy-runtime` 전체 1,170개 파일을 Raw Copy하는 정책은 Production 승격 대상이 아니다.

BUILD-EMIT-01은 명시적 Admission Manifest를 생성한다.

```json
{
  "schemaVersion": 1,
  "policyId": "dadum.legacy-static-admission-v1",
  "records": [
    {
      "sourceRelative": "app/legacy-runtime/...",
      "route": "/legacy/...",
      "reason": "legacy-bootstrap|runtime-import|compatibility-alias",
      "owner": "...",
      "sourceSha256": "...",
      "emittedSha256": "..."
    }
  ],
  "digest": "..."
}
```

Admission되지 않은 Legacy 파일은 `dist/renderer/legacy`에 존재해서는 안 된다.

---

## 14. Orphan 및 Duplicate 검사

다음 확장자는 실행 가능 Artifact로 간주한다.

```text
.js .mjs .cjs .wasm .icc
```

각 실행 Artifact는 다음 중 하나에 도달 가능해야 한다.

- Renderer Entry Closure
- Worker Closure
- Explicit Legacy Bootstrap Closure
- Runtime Manifest
- Static Route Manifest

도달 불가능한 실행 Artifact는 Orphan으로 실패한다.

---

## 15. Production Emitted Worker Manifest v2

```json
{
  "schemaVersion": 2,
  "patchId": "TDT-BUILD-EMIT-01",
  "profile": "production",
  "artifactVerificationMode": "emitted-artifact-sha256",
  "sourceManifestDigest": "...",
  "viteManifestDigest": "...",
  "workers": [
    {
      "workerId": "...",
      "codecProtocolVersion": "...",
      "sourceEntryIdentity": "...",
      "emittedEntryUrl": "/assets/...",
      "emittedEntrySha256": "...",
      "closure": [],
      "emittedArtifactSetDigest": "..."
    }
  ],
  "manifestDigest": "..."
}
```

---

## 16. Production Runtime Manifest v2

Production Runtime Manifest는 다음 Digest를 결속한다.

- Build Input Manifest Digest
- Source Runtime Manifest Digest
- Source Worker Manifest Digest
- Vite Entry Manifest Digest
- Production Emitted Worker Manifest Digest
- Legacy Static Admission Manifest Digest
- Static Route Manifest Digest
- Build A/B Reproducibility Receipt Digest

`artifactVerificationMode=source-graph-only`가 남아 있으면 실패한다.

---

## 17. Static Route Manifest v1

Route Manifest는 실제 제품 서버가 제공해야 하는 모든 URL을 기록한다.

```json
{
  "route": "/assets/worker.js",
  "sha256": "...",
  "byteLength": 0,
  "contentType": "application/javascript; charset=utf-8",
  "coop": "same-origin",
  "coep": "require-corp",
  "corp": "same-origin",
  "cacheControl": "no-store",
  "requiredBy": ["worker-id"]
}
```

필수 Route에는 다음이 포함된다.

- index.html
- dadum-runtime-manifest.json
- dadum-runtime-worker-manifest.json
- dadum-vite-entry-manifest.json
- Renderer Entry·Chunk
- 모든 Worker Closure Artifact
- 승인된 Legacy Raw Static Asset

---

## 18. Static COI Runtime Route

### 18.1 Synthetic Probe

Node Synthetic Server는 Manifest와 파일 내용의 기본 검증 도구다.

### 18.2 Electron Probe

최종 권위는 실제 `electron.mjs`의 `serveStaticWithCOI()`를 사용하는 Probe다.

Electron Probe는 Packaged App까지 요구하지 않지만 Production `dist/renderer`를 실제 Electron Main Static Server로 제공해야 한다.

### 18.3 Server Parity

Synthetic와 Electron Probe의 다음 값이 동일해야 한다.

- HTTP Status
- Body SHA-256
- Byte Length
- Content-Type
- COOP
- COEP
- CORP
- Cache-Control

404·403 응답도 COI Header를 유지해야 한다.

---

## 19. WASM Streaming 및 Pthread Route

WASM Route는 `application/wasm`이어야 하며 `WebAssembly.instantiateStreaming()`이 성공해야 한다.

Pthread Child Worker Route는 JS MIME과 COI Header를 가져야 한다.

SharedArrayBuffer를 요구하는 Worker는 Electron Renderer에서 `crossOriginIsolated === true`를 확인해야 한다.

---

## 20. Build A/B Reproducibility

Build A와 B는 다음이 바이트 단위로 같아야 한다.

- 파일 경로 Set
- 파일 Byte Length
- 파일 SHA-256
- Vite Manifest
- Vite Entry Manifest
- Emitted Worker Manifest
- Production Runtime Manifest
- Legacy Static Admission Manifest
- Static Route Manifest
- Renderer Build ID

Build Timestamp, Absolute Workspace Path, Random Nonce, Host-specific Temp Path가 방출 Byte에 들어가면 실패한다.

---

## 21. Renderer Build ID

Renderer Build ID는 다음 입력의 Canonical JSON SHA-256 앞 24 Hex로 계산한다.

```text
Source Build ID
+ Build Input Manifest Digest
+ Vite Entry Manifest Digest
+ Emitted Worker Manifest Digest
+ Legacy Static Admission Manifest Digest
+ Static Route Manifest Digest
+ Build Reproducibility Receipt Digest
```

---

## 22. Required Runtime Tools

- `tools/run-build-emit-01.mjs`
- `tools/generate-vite-entry-graph.mjs`
- `tools/generate-emitted-worker-manifest-v2.mjs`
- `tools/generate-legacy-static-admission.mjs`
- `tools/generate-static-route-manifest.mjs`
- `tools/verify-worker-closure-v2.mjs`
- `tools/verify-artifact-ownership.mjs`
- `tools/verify-build-emit-reproducibility.mjs`
- `tools/verify-electron-static-routes.mjs`
- `tools/gate-build-emit-01.mjs`

### 22.1 package.json Scripts

```json
{
  "build-emit:source": "node tools/run-build-emit-01.mjs --mode=source",
  "build-emit:run": "node tools/run-build-emit-01.mjs --mode=production-ab",
  "verify:build-emit-01": "node tools/gate-build-emit-01.mjs",
  "verify:worker-closure-v2": "node tools/verify-worker-closure-v2.mjs",
  "verify:electron-static-routes": "node tools/verify-electron-static-routes.mjs"
}
```

---

## 23. Required Artifacts

1. `TDT_BUILD_EMIT_01_BUILD_INPUT_MANIFEST.json`
2. `TDT_BUILD_EMIT_01_BUILD_A_REPORT.json`
3. `TDT_BUILD_EMIT_01_BUILD_B_REPORT.json`
4. `TDT_BUILD_EMIT_01_VITE_ENTRY_GRAPH.json`
5. `TDT_BUILD_EMIT_01_SOURCE_TO_EMITTED_MAPPING.json`
6. `TDT_BUILD_EMIT_01_EMITTED_WORKER_MANIFEST.json`
7. `TDT_BUILD_EMIT_01_WORKER_CLOSURE_REPORT.json`
8. `TDT_BUILD_EMIT_01_LEGACY_STATIC_ADMISSION_MANIFEST.json`
9. `TDT_BUILD_EMIT_01_ARTIFACT_OWNERSHIP_REPORT.json`
10. `TDT_BUILD_EMIT_01_ORPHAN_ARTIFACT_REPORT.json`
11. `TDT_BUILD_EMIT_01_STATIC_ROUTE_MANIFEST.json`
12. `TDT_BUILD_EMIT_01_SYNTHETIC_COI_ROUTE_REPORT.json`
13. `TDT_BUILD_EMIT_01_ELECTRON_COI_ROUTE_REPORT.json`
14. `TDT_BUILD_EMIT_01_SERVER_PARITY_REPORT.json`
15. `TDT_BUILD_EMIT_01_WASM_STREAMING_REPORT.json`
16. `TDT_BUILD_EMIT_01_BUILD_REPRODUCIBILITY_RECEIPT.json`
17. `TDT_BUILD_EMIT_01_PRODUCTION_RUNTIME_MANIFEST.json`
18. `TDT_BUILD_EMIT_01_BUILD_PROVENANCE_RECEIPT.json`
19. `TDT_BUILD_EMIT_01_EMITTED_ARTIFACT_IDENTITY_RECEIPT.json`
20. `TDT_BUILD_EMIT_01_SOURCE_MUTATION_ZERO_REPORT.json`
21. `TDT_BUILD_EMIT_01_FIX_RECEIPT.json`
22. `TDT_BUILD_EMIT_01_FINAL_VERIFY.txt`

---

## 24. Stable Error Registry

1. `E_BUILD_EMIT_LOCK_NOT_PROMOTED`
2. `E_BUILD_EMIT_LOCK_SHA_MISMATCH`
3. `E_BUILD_EMIT_PACKAGE_SHA_MISMATCH`
4. `E_BUILD_EMIT_NONCANONICAL_HOST`
5. `E_BUILD_EMIT_TOOLCHAIN_MISMATCH`
6. `E_BUILD_EMIT_NETWORK_FORBIDDEN`
7. `E_BUILD_EMIT_WORKSPACE_NOT_ISOLATED`
8. `E_BUILD_EMIT_DIST_NOT_CLEAN`
9. `E_BUILD_EMIT_SYMLINK_FORBIDDEN`
10. `E_BUILD_EMIT_INPUT_MANIFEST_INVALID`
11. `E_BUILD_EMIT_SOURCE_MUTATED`
12. `E_VITE_PRODUCTION_BUILD_FAILED`
13. `E_VITE_MANIFEST_MISSING`
14. `E_VITE_ENTRY_MISSING`
15. `E_VITE_ENTRY_AMBIGUOUS`
16. `E_WORKER_EMITTED_ENTRY_MISSING`
17. `E_WORKER_EMITTED_ENTRY_AMBIGUOUS`
18. `E_WORKER_SOURCE_MAPPING_MISSING`
19. `E_WORKER_PROTOCOL_EVIDENCE_MISSING`
20. `E_WORKER_CLOSURE_UNRESOLVED_IMPORT`
21. `E_WORKER_CLOSURE_UNRESOLVED_DYNAMIC_IMPORT`
22. `E_WORKER_CLOSURE_UNRESOLVED_NEW_URL`
23. `E_WORKER_CLOSURE_UNRESOLVED_LOCATE_FILE`
24. `E_WORKER_CLOSURE_DYNAMIC_PATH_UNVERIFIED`
25. `E_WORKER_WASM_MISSING`
26. `E_WORKER_ICC_MISSING`
27. `E_WORKER_CHILD_WORKER_MISSING`
28. `E_WORKER_ARTIFACT_HASH_MISMATCH`
29. `E_WORKER_ARTIFACT_SET_DIGEST_MISMATCH`
30. `E_ARTIFACT_OWNERSHIP_MISSING`
31. `E_ARTIFACT_OWNERSHIP_MULTIPLE`
32. `E_LEGACY_RAW_ADMISSION_UNDECLARED`
33. `E_LEGACY_RAW_FILE_UNADMITTED`
34. `E_LEGACY_RAW_BUNDLE_DUPLICATE`
35. `E_EMITTED_ORPHAN_EXECUTABLE`
36. `E_EMITTED_URL_COLLISION`
37. `E_EMITTED_PATH_ESCAPE`
38. `E_PRODUCTION_WORKER_MANIFEST_INVALID`
39. `E_PRODUCTION_RUNTIME_MANIFEST_SOURCE_ONLY`
40. `E_PRODUCTION_RUNTIME_MANIFEST_INVALID`
41. `E_RENDERER_BUILD_ID_MISMATCH`
42. `E_BUILD_A_B_FILESET_MISMATCH`
43. `E_BUILD_A_B_BYTE_MISMATCH`
44. `E_BUILD_A_B_MANIFEST_MISMATCH`
45. `E_BUILD_NONDETERMINISTIC`
46. `E_EMITTED_ABSOLUTE_PATH_LEAK`
47. `E_EMITTED_CREDENTIAL_LEAK`
48. `E_EMITTED_TIMESTAMP_LEAK`
49. `E_PRODUCTION_SOURCEMAP_FORBIDDEN`
50. `E_ROUTE_MANIFEST_MISSING`
51. `E_COI_ROUTE_MISSING`
52. `E_COI_HEADER_MISMATCH`
53. `E_COI_MIME_MISMATCH`
54. `E_COI_BODY_HASH_MISMATCH`
55. `E_COI_SERVER_PARITY_MISMATCH`
56. `E_WASM_STREAMING_MIME_UNVERIFIED`
57. `E_EMITTED_DIST_MUTATED_AFTER_SEAL`
58. `E_BUILD_PROVENANCE_INCOMPLETE`
59. `E_EMITTED_IDENTITY_RECEIPT_INVALID`

---

## 25. Static Gate Matrix (84개)

| Gate | 조건 |
|---|---|
| `BE01-G001` | BUILD-LOCK-01 Promotion Receipt가 존재한다. |
| `BE01-G002` | BUILD-LOCK-01 상태가 DEPENDENCY_LOCK_PROMOTED이다. |
| `BE01-G003` | Promoted Lock SHA가 현재 package-lock.json Raw SHA와 일치한다. |
| `BE01-G004` | Promoted package.json SHA가 현재 package.json Raw SHA와 일치한다. |
| `BE01-G005` | Canonical host가 win32-x64이다. |
| `BE01-G006` | Node·npm·Vite·TypeScript·vue-tsc 버전이 Toolchain Profile과 일치한다. |
| `BE01-G007` | Production Build에서 네트워크 사용이 금지돼 있다. |
| `BE01-G008` | Clean Build Workspace가 원본 소스와 분리돼 있다. |
| `BE01-G009` | Build 전 dist/renderer가 존재하지 않거나 완전히 비어 있다. |
| `BE01-G010` | Build Workspace 내부 Symlink·Junction이 금지돼 있다. |
| `BE01-G011` | Build Input Manifest가 생성돼 있다. |
| `BE01-G012` | Build Input Manifest Self Digest가 일치한다. |
| `BE01-G013` | Build Input Manifest가 Build Authority Digest를 포함한다. |
| `BE01-G014` | Build Input Manifest가 Lock Promotion Receipt Digest를 포함한다. |
| `BE01-G015` | Vite 설정 root가 app으로 고정돼 있다. |
| `BE01-G016` | Vite base가 Package Static Server 계약과 일치한다. |
| `BE01-G017` | Production sourcemap이 false다. |
| `BE01-G018` | Production target이 es2022로 고정돼 있다. |
| `BE01-G019` | publicDir 자동 복사가 비활성화돼 있다. |
| `BE01-G020` | Runtime Manifest Plugin이 Production Build에 등록돼 있다. |
| `BE01-G021` | Worker Source Manifest에 필수 Worker 5개가 존재한다. |
| `BE01-G022` | 각 Worker Entry가 ?worker&url 단일 권위로 등록돼 있다. |
| `BE01-G023` | Raw Worker constructor가 활성 Export Graph에 없다. |
| `BE01-G024` | Vite Manifest가 방출돼 있다. |
| `BE01-G025` | Dadum Vite Entry Manifest가 방출돼 있다. |
| `BE01-G026` | Dadum Vite Entry Manifest Digest가 유효하다. |
| `BE01-G027` | Renderer Entry Chunk가 정확히 1개다. |
| `BE01-G028` | Worker별 Emitted Entry가 정확히 1개다. |
| `BE01-G029` | Worker Entry 식별이 문자열 검색이 아닌 Rollup/Vite Metadata 기반이다. |
| `BE01-G030` | Worker Source Identity와 Emitted Entry 사이 Mapping Receipt가 존재한다. |
| `BE01-G031` | Worker Owner Runtime Encoder ID가 Emitted Manifest에 보존된다. |
| `BE01-G032` | Worker Codec Protocol Version이 Emitted Manifest에 보존된다. |
| `BE01-G033` | Worker Control Protocol Version이 Emitted Manifest에 보존된다. |
| `BE01-G034` | Worker Entry SHA-256과 Byte Length가 기록된다. |
| `BE01-G035` | Static Import Closure가 완전하다. |
| `BE01-G036` | Dynamic Import Closure가 완전하다. |
| `BE01-G037` | import.meta.url 기반 new URL Closure가 완전하다. |
| `BE01-G038` | Emscripten locateFile Closure가 완전하다. |
| `BE01-G039` | WASM Artifact가 Closure에 포함된다. |
| `BE01-G040` | ICC Artifact가 Closure에 포함된다. |
| `BE01-G041` | Pthread Child Worker Artifact가 Closure에 포함된다. |
| `BE01-G042` | Worker Shared Chunk가 Closure에 포함된다. |
| `BE01-G043` | 동적 경로가 정적 Projection으로 해소되지 않으면 Fail-Closed다. |
| `BE01-G044` | 각 Closure Record가 Artifact Role을 가진다. |
| `BE01-G045` | 각 Closure Record가 Ownership Mode를 가진다. |
| `BE01-G046` | 각 실행 Artifact의 Owner가 정확히 1개다. |
| `BE01-G047` | Bundle과 Raw Static의 중복 소유가 0개다. |
| `BE01-G048` | Legacy Raw Static Admission Manifest가 존재한다. |
| `BE01-G049` | Legacy Raw Static Admission이 1,170개 전체 복사 정책을 사용하지 않는다. |
| `BE01-G050` | 비승인 Legacy 파일이 dist/renderer/legacy에 방출되지 않는다. |
| `BE01-G051` | 승인된 Legacy 파일의 Source SHA와 Emitted SHA가 연결된다. |
| `BE01-G052` | 실행 가능한 Orphan JS·MJS·WASM·Worker가 0개다. |
| `BE01-G053` | 같은 Source SHA가 서로 다른 URL로 중복 방출되면 명시적 Alias 정책이 있다. |
| `BE01-G054` | 동일 URL Collision이 0개다. |
| `BE01-G055` | Output Path Escape가 0개다. |
| `BE01-G056` | Production Worker Manifest artifactVerificationMode가 emitted-artifact-sha256이다. |
| `BE01-G057` | Production Worker Manifest Self Digest가 유효하다. |
| `BE01-G058` | Worker별 Emitted Artifact Set Digest가 유효하다. |
| `BE01-G059` | Production Runtime Manifest가 Source-only Mode를 광고하지 않는다. |
| `BE01-G060` | Production Runtime Manifest가 Emitted Worker Manifest Digest를 포함한다. |
| `BE01-G061` | Production Runtime Manifest가 Vite Entry Manifest Digest를 포함한다. |
| `BE01-G062` | Renderer Build ID가 Emitted Digest를 입력으로 사용한다. |
| `BE01-G063` | Build A/B의 파일 경로 Set이 동일하다. |
| `BE01-G064` | Build A/B의 모든 파일 Byte Length가 동일하다. |
| `BE01-G065` | Build A/B의 모든 파일 SHA-256이 동일하다. |
| `BE01-G066` | Build A/B의 Worker Closure Digest가 동일하다. |
| `BE01-G067` | Build A/B의 Production Runtime Manifest가 동일하다. |
| `BE01-G068` | Build A/B의 Renderer Build ID가 동일하다. |
| `BE01-G069` | 방출 파일에 Absolute Build Path가 없다. |
| `BE01-G070` | 방출 파일에 Credential·Registry Token이 없다. |
| `BE01-G071` | 방출 파일에 비결정적 Timestamp·Nonce가 없다. |
| `BE01-G072` | 필수 Route Manifest가 존재한다. |
| `BE01-G073` | 각 필수 Route의 Expected SHA·MIME·COI Policy가 기록된다. |
| `BE01-G074` | Synthetic Static Server Route Probe가 통과한다. |
| `BE01-G075` | Electron Static Server Route Probe가 통과한다. |
| `BE01-G076` | Synthetic Server와 Electron Server의 Route Body SHA가 동일하다. |
| `BE01-G077` | 모든 필수 Route에 COOP same-origin이 있다. |
| `BE01-G078` | 모든 필수 Route에 COEP require-corp가 있다. |
| `BE01-G079` | 모든 필수 Route에 CORP same-origin이 있다. |
| `BE01-G080` | WASM Route Content-Type이 application/wasm이다. |
| `BE01-G081` | JS·MJS Route Content-Type이 JavaScript MIME이다. |
| `BE01-G082` | ICC Route Content-Type이 application/vnd.iccprofile이다. |
| `BE01-G083` | 404·403·Path Traversal Route도 COI Header를 보존한다. |
| `BE01-G084` | Final Emitted Artifact Identity Receipt가 모든 선행 Digest를 결속한다. |

---

## 26. Runtime Test Matrix (120개)

| Test | 시나리오 |
|---|---|
| `BE01-T001` | Lock Promotion Receipt 누락 시 Build Admission 거부 |
| `BE01-T002` | Lock 상태가 INPUT_PROFILE_SEALED면 Build Admission 거부 |
| `BE01-T003` | 현재 Lock SHA가 Promoted SHA와 다르면 거부 |
| `BE01-T004` | 현재 package.json SHA가 Promoted SHA와 다르면 거부 |
| `BE01-T005` | Linux Host에서 Canonical Production Emit 거부 |
| `BE01-T006` | Node Version 불일치 거부 |
| `BE01-T007` | npm Version 불일치 거부 |
| `BE01-T008` | Vite Version 불일치 거부 |
| `BE01-T009` | 네트워크 사용 감지 시 거부 |
| `BE01-T010` | 원본 Workspace 직접 Build 거부 |
| `BE01-T011` | Build Workspace Symlink 감지 거부 |
| `BE01-T012` | 오염된 dist 사전 존재 시 거부 |
| `BE01-T013` | Build Input Digest 불일치 거부 |
| `BE01-T014` | Build 중 package.json Mutation 탐지 |
| `BE01-T015` | Build 중 package-lock Mutation 탐지 |
| `BE01-T016` | Build 중 Source Tree Mutation 탐지 |
| `BE01-T017` | Vite Exit 0 정상 수집 |
| `BE01-T018` | Vite Exit Non-zero Blocked Receipt |
| `BE01-T019` | Vite Manifest 누락 탐지 |
| `BE01-T020` | Renderer Entry 0개 탐지 |
| `BE01-T021` | Renderer Entry 2개 이상 탐지 |
| `BE01-T022` | Worker Entry 0개 탐지 |
| `BE01-T023` | Worker Entry 2개 이상 탐지 |
| `BE01-T024` | Worker ID 문자열 우연 포함 Chunk 오탐 방지 |
| `BE01-T025` | Worker Protocol 문자열 우연 포함 Chunk 오탐 방지 |
| `BE01-T026` | Rollup Facade Module Mapping |
| `BE01-T027` | Worker Entry Chunk SHA 계산 |
| `BE01-T028` | Shared Chunk Closure 수집 |
| `BE01-T029` | Static Import Closure 수집 |
| `BE01-T030` | Dynamic Import Closure 수집 |
| `BE01-T031` | new URL 상대 WASM Closure 수집 |
| `BE01-T032` | new URL 상위 디렉터리 WASM Closure 수집 |
| `BE01-T033` | locateFile WASM Closure 수집 |
| `BE01-T034` | locateFile Child Worker Closure 수집 |
| `BE01-T035` | Emscripten pthread helper Closure 수집 |
| `BE01-T036` | ICC Asset Closure 수집 |
| `BE01-T037` | 동일 Basename WASM 2개 오탐 방지 |
| `BE01-T038` | Data URL 외부 Closure 제외 |
| `BE01-T039` | Blob URL 런타임 생성 정책 기록 |
| `BE01-T040` | HTTP External URL 금지 |
| `BE01-T041` | 동적 문자열 Asset Path 거부 |
| `BE01-T042` | Closure Cycle 허용 및 중복 제거 |
| `BE01-T043` | Closure Artifact 정렬 결정성 |
| `BE01-T044` | Worker Artifact Set Digest 결정성 |
| `BE01-T045` | Worker Owner Encoder 보존 |
| `BE01-T046` | Worker Protocol 보존 |
| `BE01-T047` | Worker Transfer Policy 보존 |
| `BE01-T048` | Worker WASM Policy 보존 |
| `BE01-T049` | Raw Legacy Admission Allowlist 정상 방출 |
| `BE01-T050` | 비승인 Legacy 파일 방출 차단 |
| `BE01-T051` | Legacy Source SHA와 Raw Emitted SHA 일치 |
| `BE01-T052` | Raw Static와 Bundle 중복 Ownership 탐지 |
| `BE01-T053` | Alias 허용 정책이 없는 중복 URL 탐지 |
| `BE01-T054` | 대소문자 충돌 URL 탐지 |
| `BE01-T055` | Percent-decoded 경로 충돌 탐지 |
| `BE01-T056` | Path Traversal 방출 경로 탐지 |
| `BE01-T057` | Symlink Output 탐지 |
| `BE01-T058` | 실행 가능한 Orphan JS 탐지 |
| `BE01-T059` | 실행 가능한 Orphan WASM 탐지 |
| `BE01-T060` | 실행 가능한 Orphan Worker 탐지 |
| `BE01-T061` | 사용되지 않는 ICC 탐지 |
| `BE01-T062` | Production Worker Manifest Self Digest 검증 |
| `BE01-T063` | Worker Artifact Record Byte Length 검증 |
| `BE01-T064` | Worker Artifact Record SHA 검증 |
| `BE01-T065` | Worker Artifact Set Digest 검증 |
| `BE01-T066` | Production Runtime Manifest Self Digest 검증 |
| `BE01-T067` | Runtime Manifest Source Digest 결속 |
| `BE01-T068` | Runtime Manifest Emitted Worker Digest 결속 |
| `BE01-T069` | Runtime Manifest Vite Entry Digest 결속 |
| `BE01-T070` | Renderer Build ID 재계산 |
| `BE01-T071` | Build A/B File Set 동일 |
| `BE01-T072` | Build A/B Byte Length 동일 |
| `BE01-T073` | Build A/B SHA 동일 |
| `BE01-T074` | Build A/B Worker Manifest 동일 |
| `BE01-T075` | Build A/B Runtime Manifest 동일 |
| `BE01-T076` | Build A/B Entry Manifest 동일 |
| `BE01-T077` | Build A/B Route Manifest 동일 |
| `BE01-T078` | Build A/B Artifact Ownership Manifest 동일 |
| `BE01-T079` | Timestamp 주입 Fixture 탐지 |
| `BE01-T080` | Absolute Workspace Path 주입 Fixture 탐지 |
| `BE01-T081` | Registry Token 주입 Fixture 탐지 |
| `BE01-T082` | Source Map 방출 Fixture 탐지 |
| `BE01-T083` | Synthetic Server index.html COI 검증 |
| `BE01-T084` | Synthetic Server Runtime Manifest COI 검증 |
| `BE01-T085` | Synthetic Server Worker Entry COI 검증 |
| `BE01-T086` | Synthetic Server WASM MIME 검증 |
| `BE01-T087` | Synthetic Server ICC MIME 검증 |
| `BE01-T088` | Synthetic Server 404 COI 검증 |
| `BE01-T089` | Synthetic Server 403 COI 검증 |
| `BE01-T090` | Synthetic Server Path Traversal 거부 |
| `BE01-T091` | Electron Server index.html COI 검증 |
| `BE01-T092` | Electron Server Runtime Manifest COI 검증 |
| `BE01-T093` | Electron Server Worker Entry COI 검증 |
| `BE01-T094` | Electron Server WASM MIME 검증 |
| `BE01-T095` | Electron Server ICC MIME 검증 |
| `BE01-T096` | Electron Server 404 COI 검증 |
| `BE01-T097` | Electron Server 403 COI 검증 |
| `BE01-T098` | Electron Server Path Traversal 거부 |
| `BE01-T099` | Synthetic·Electron Body SHA 동일 |
| `BE01-T100` | Synthetic·Electron Header Policy 동일 |
| `BE01-T101` | Query String 포함 Route SHA 동일 |
| `BE01-T102` | Percent Encoding Route 처리 동일 |
| `BE01-T103` | Worker fetch() WASM 200 |
| `BE01-T104` | WebAssembly.instantiateStreaming MIME 성공 |
| `BE01-T105` | Pthread Child Worker 200 |
| `BE01-T106` | Pthread Child Worker COI Header 검증 |
| `BE01-T107` | Worker Runtime Manifest Fetch 200 |
| `BE01-T108` | Production Runtime Manifest source-only 오염 탐지 |
| `BE01-T109` | Build 후 dist Mutation 탐지 |
| `BE01-T110` | Sealed Manifest 후 파일 추가 탐지 |
| `BE01-T111` | Sealed Manifest 후 파일 삭제 탐지 |
| `BE01-T112` | Sealed Manifest 후 파일 Byte Mutation 탐지 |
| `BE01-T113` | Build Provenance Receipt Self Digest 검증 |
| `BE01-T114` | Emitted Artifact Identity Receipt Self Digest 검증 |
| `BE01-T115` | 현재 BUILD-LOCK-01 Blocked 상태에서 BE01 상태 상한 확인 |
| `BE01-T116` | DEPENDENCY_LOCK_PROMOTED Fixture에서 Build A/B 진입 |
| `BE01-T117` | 한 Worker Closure 실패 시 전체 Build Promotion 거부 |
| `BE01-T118` | 한 COI Route 실패 시 전체 Build Promotion 거부 |
| `BE01-T119` | Build A/B 1바이트 차이 시 전체 Promotion 거부 |
| `BE01-T120` | 모든 검증 통과 시 EMITTED_ARTIFACT_IDENTITY_VERIFIED |

---

## 27. Receipt Schemas

### 27.1 Build Reproducibility Receipt

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-BUILD-EMIT-01",
  "status": "BUILD_REPRODUCIBILITY_VERIFIED",
  "buildInputDigest": "...",
  "buildAOutputDigest": "...",
  "buildBOutputDigest": "...",
  "fileSetEqual": true,
  "allBytesEqual": true,
  "manifestEqual": true,
  "sourceMutationZero": true,
  "selfDigest": "..."
}
```

### 27.2 Emitted Artifact Identity Receipt

```json
{
  "schemaVersion": 1,
  "patchId": "TDT-BUILD-EMIT-01",
  "status": "EMITTED_ARTIFACT_IDENTITY_VERIFIED",
  "rendererBuildId": "...",
  "buildInputManifestDigest": "...",
  "viteEntryManifestDigest": "...",
  "emittedWorkerManifestDigest": "...",
  "legacyStaticAdmissionDigest": "...",
  "staticRouteManifestDigest": "...",
  "electronRouteReportDigest": "...",
  "reproducibilityReceiptDigest": "...",
  "artifactVerificationMode": "emitted-artifact-sha256",
  "promotable": false,
  "selfDigest": "..."
}
```

BUILD-EMIT-01은 Electron Package가 아니므로 `promotable`을 true로 설정하지 않는다.

---

## 28. Implementation Work Packages

### BE01-A

Build Admission과 BUILD-LOCK-01 Receipt 결선

### BE01-B

Clean Build A/B Workspace Runner

### BE01-C

Vite/Rollup Entry Graph Exporter

### BE01-D

Worker Source-to-Emitted Mapping v2

### BE01-E

Worker Closure Graph v2

### BE01-F

new URL·locateFile·Pthread Asset Projection

### BE01-G

Legacy Static Admission Manifest

### BE01-H

Artifact Ownership·Duplicate·Orphan Gate

### BE01-I

Production Worker Manifest v2

### BE01-J

Production Runtime Manifest v2

### BE01-K

Static Route Manifest

### BE01-L

Synthetic COI Route Probe

### BE01-M

Electron Static Server Probe

### BE01-N

Server Parity Gate

### BE01-O

WASM Streaming·Pthread Route Gate

### BE01-P

Build A/B Reproducibility Gate

### BE01-Q

Build Provenance와 Emitted Identity Receipt

### BE01-R

부모 R7·EW01~07·EP01~03·BL01 회귀

---

## 29. 베이크 적용 순서

1. 최신 BUILD-LOCK-01 본체를 새 작업 트리로 복제한다.
2. 본 명세를 `specs/`에 배치한다.
3. BUILD-LOCK-01 Promotion Receipt Admission Gate를 추가한다.
4. Build Input Manifest 생성기를 추가한다.
5. Clean Build A/B Runner를 추가한다.
6. Vite/Rollup Metadata Export Plugin을 추가한다.
7. 기존 문자열 검색 기반 Emitted Worker Generator를 v2로 교체한다.
8. Worker Closure Graph v2를 추가한다.
9. new URL·locateFile·Pthread Projection Table을 추가한다.
10. Legacy 전체 Raw Copy를 Admission Manifest 기반 Copy로 교체한다.
11. Artifact Ownership·Duplicate·Orphan Gate를 추가한다.
12. Production Worker Manifest v2를 생성한다.
13. Production Runtime Manifest v2를 생성한다.
14. Static Route Manifest와 Synthetic Probe를 추가한다.
15. Electron Static Server Probe와 Server Parity Gate를 추가한다.
16. Build A/B Reproducibility Gate를 추가한다.
17. 84개 Static Gate와 120개 Runtime Test를 실행한다.
18. 부모 회귀를 실행한다.
19. Build Input 조건이 충족되지 않으면 BLOCKED Receipt를 발급한다.
20. 모든 조건이 충족되면 Emitted Artifact Identity Receipt를 발급한다.

---

## 30. 부모 회귀 요구

다음 부모 Gate가 모두 PASS해야 한다.

- `R7`
- `EW01`
- `EW02`
- `EW03`
- `EW04`
- `EW05`
- `EW06`
- `EW07`
- `EP01`
- `EP02`
- `EP03`
- `BUILD-LOCK-01`
- `Stable Error Registry`
- `Strict TypeScript`

BUILD-EMIT-01은 Worker·Encoder 의미를 바꾸지 않으며 방출·Route·Identity 권위만 승격한다.

---

## 31. 완료 정의

다음이 모두 참일 때만 BUILD-EMIT-01 완료로 판정한다.

- BUILD-LOCK-01이 DEPENDENCY_LOCK_PROMOTED다.
- Build A와 B가 모두 성공한다.
- Build A/B 전체 방출 Byte가 동일하다.
- 필수 Worker 5개의 Emitted Entry가 정확히 1개씩 존재한다.
- 모든 Worker Closure가 JS·WASM·ICC·Child Worker까지 완전하다.
- 실행 Artifact Ownership이 단일하다.
- Legacy Raw Static 전체 복사가 제거되고 Admission Manifest가 적용된다.
- Orphan Executable Artifact가 0개다.
- Production Runtime Manifest가 emitted-artifact-sha256 Mode다.
- Synthetic와 Electron Static Route가 Body SHA·MIME·COI Header까지 일치한다.
- WASM Streaming과 Pthread Child Worker Route가 검증된다.
- Source·Lock Mutation이 0이다.
- Emitted Artifact Identity Receipt Self Digest가 유효하다.

---

## 32. 금지된 PASS 문구

- “Vite Build가 Exit 0이므로 방출물 검증 완료”
- “Source Worker Manifest가 있으므로 Worker Closure 완료”
- “WASM 파일이 Source에 있으므로 Production WASM 완료”
- “합성 HTTP Server가 통과했으므로 Electron Route 완료”
- “두 Build의 파일 수가 같으므로 재현 가능”
- “Worker ID 문자열이 들어 있는 Chunk를 Entry로 간주”
- “legacy-runtime 전체를 복사했으므로 누락 없음”

---

## 33. 후속 단계

BUILD-EMIT-01 완료 후 다음 단계로 진행한다.

```text
TDT-MODJPEG-01
Canonical Single-thread Rebuild / Pthread Retirement / ABI Output Parity Seal

TDT-NATIVE-DECODER-01
Native Raster Decoder Release Addon / ABI / Packaging Identity Seal
```

그 뒤 `TDT-ELECTRON-PACKAGE-01`에서 ASAR·Native Addon·Package Content ID를 봉인한다.

---

## 34. 최종 판정 문장

BUILD-EMIT-01은 Source 파일이 아니라 실제 Production `dist/renderer` Byte를 권위로 삼는다.

Worker Entry와 WASM이 존재한다는 주장 대신, Vite/Rollup Graph에서 Source Entry가 단일 Emitted Entry와 완전한 Closure로 연결됐음을 증명한다.

Legacy Static Asset은 전체 복사가 아니라 명시적 Admission으로만 제품 Route에 들어간다.

Static COI는 합성 서버와 실제 Electron Static Server가 동일 Body SHA·MIME·Header를 제공할 때만 PASS다.

동일 입력의 Clean Build A/B가 모든 방출 Byte에서 일치하지 않으면 Emitted Artifact Identity를 발급하지 않는다.

