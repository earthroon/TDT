# TDT-BUILD-LOCK-01-R2

## Exact Root Dependency Graph / Canonical npm ci Win32-x64 / Dual Install Content Digest / Native Toolchain Closure / Zero Lock Mutation / Production Build Admission Seal

> 상태: 명세
> 부모: `TDT-BUILD-LOCK-01`, 최신 통합 기준 `TDT-RESAMPLE-RUNTIME-01-R14A` source bundle
> 판단 기준: package.json, package-lock.json, Build Lock 01 artifacts, native toolchain manifests, production scripts의 실제 정적 감사
> 원칙: exact root graph → immutable install → explicit lifecycle → native closure → dual production emit → lock CAS → replay

---

## 0. 목표

R2의 목적은 `package-lock.json`을 단순 갱신하는 것이 아니다. 현재 깨진 root dependency graph를 exact version policy로 복구하고, 동일한 candidate lock과 frozen cache를 사용한 **Win32-x64 dual install A/B**, **explicit lifecycle replay A/B**, **native addon·WASM dual build A/B**, **production renderer·Electron unpacked dual emit A/B**가 동일한 content identity를 산출함을 증명한 뒤에만 원본 lock을 atomic CAS로 승격한다.

R2는 다음을 분리한다.

- `package.json`: direct dependency request SSOT
- `package-lock.json`: complete npm graph SSOT
- `toolchain-profile.json`: canonical JS build toolchain SSOT
- `native-toolchain-manifest`: MSVC·Windows SDK·Rust·WASM toolchain SSOT
- `lifecycle-replay-plan`: install script 실행 권위
- `install-content-manifest`: node_modules content SSOT
- `production-build-admission-receipt`: 실제 production build admission SSOT

R2 final receipt가 없으면 R9A physical runner, R10A release rebuild, R14A signed package manifest는 production identity를 주장할 수 없다.

## 1. 현재 소스 감사 결과

### 1.1 확정된 현 상태

```text
verify:dependency-lock
→ FAIL dependency lock rootExact=false exactDirect=true promotionReceipt=false

Build Lock 01 promotion receipt
→ state = INPUT_PROFILE_SEALED
→ promoted = false
→ blocker = noncanonical-host-win32-x64-required

Install reproducibility
→ reproducible = false
→ blocker = noncanonical-host-win32-x64-required

Native decoder
→ win32-x64 release addon missing
→ packaged Electron execution not run
```

### 1.2 Root graph 불일치 12건

| Scope | Package | package.json | package-lock root |
|---|---|---:|---:|
| `dependencies` | `jszip` | `3.10.1` | `^3.10.1` |
| `dependencies` | `pako` | `2.1.0` | `^2.1.0` |
| `dependencies` | `sharp` | `0.33.2` | `^0.33.2` |
| `dependencies` | `pinia` | `3.0.1` | `<missing>` |
| `dependencies` | `vue` | `3.5.40` | `<missing>` |
| `devDependencies` | `@napi-rs/cli` | `2.18.4` | `<missing>` |
| `devDependencies` | `@vitejs/plugin-vue` | `6.0.7` | `<missing>` |
| `devDependencies` | `electron` | `29.0.0` | `^29.0.0` |
| `devDependencies` | `electron-builder` | `24.13.3` | `^24.13.3` |
| `devDependencies` | `typescript` | `5.9.3` | `<missing>` |
| `devDependencies` | `vite` | `8.1.5` | `<missing>` |
| `devDependencies` | `vue-tsc` | `3.2.2` | `<missing>` |

`exactDirect=true`는 package.json의 직접 버전이 range가 아니라는 뜻일 뿐이다. `rootExact=false`이므로 현재 lock root는 package.json의 SSOT를 반영하지 않는다.

### 1.3 기존 Build Lock 01 증거의 지위

기존 artifacts는 forensic history로 보존한다. 그러나 candidate lock이 없고 Win32-x64 A/B install이 실행되지 않았으므로 R2 current evidence로 carry-forward할 수 없다.

```text
historicalPassCarryForward = 0
existingBuildLockPromotionCurrent = false
```

### 1.4 부모와 입력 바이트 identity

```text
R14A parent bundle SHA-256
b456e3d165b98c5ccbcf0e9608e7d26a645bcf96fa2c12a11d74049b29da780e

Build Lock 01 spec SHA-256
7e577a45534a571ae726fe70fcfb72421d3236dd67975ef1a7a63009cb6f258c

package.json SHA-256
d3d4987000aab75178c032cbddb0784195b04bb0776ce4a01d6178d39b632850

package-lock.json SHA-256
b0cfe25ad61ee5a6c95d637c347ff592e38c633a706a8e940351e3790932e847

toolchain-profile.json SHA-256
cfe36b2ec5c025773dcaac5a563425908fd6c802bb9952d2b051434673e36dc2
```

R2 candidate와 모든 child receipt는 위 입력 identity 또는 명시적으로 승격된 후속 identity를 부모로 가져야 한다.

## 2. 범위

### 2.1 포함

- exact direct dependency root graph 복구
- lockfileVersion 3 candidate generation
- npm config·registry·cache identity
- canonical Win32-x64 npm ci A/B
- lifecycle script explicit replay
- install graph와 file content dual digest
- MSVC·Windows SDK·Rust·Cargo·wasm-pack·N-API closure
- native decoder `.node`와 PSD WASM dual build
- vue-tsc, Vite, worker/WASM emit, Electron win-unpacked dual build
- zero lock mutation과 source mutation zero
- candidate lock atomic CAS promotion과 post-promotion replay
- production build admission receipt

### 2.2 제외

- R9A GPU physical performance qualification
- R10A Production Pointer CAS
- code signing certificate·Authenticode·notarization
- R14A offline root ceremony와 transparency publication
- NSIS 서명 후 installer byte identity
- macOS·arm64 build admission

R2의 최종 build artifact는 **unsigned canonical win-unpacked closure와 canonical unsigned archive**이다. 외부 release signing과 distribution identity는 R14A가 소유한다.

## 3. 규범 용어

- **MUST**: 불충족 시 gate FAIL
- **MUST NOT**: 관측 시 즉시 FAIL
- **SOURCE PASS**: schema·wiring·negative control·finalizer source가 닫힌 상태
- **WIN32 PASS**: canonical Windows x64에서 install·native·production build가 실행된 상태
- **exact**: 문자열·버전·digest·count가 완전 동일
- **semantic graph**: package instance, version, integrity, peer context, optional/dev flags의 정규화 graph
- **content digest**: path·type·size·SHA-256을 정규화한 file closure digest

## 4. SSOT와 writer 권위

| Authority | SSOT | Writer |
|---|---|---|
| Direct dependency request | `package.json` | 승인된 source change만 |
| Complete npm dependency graph | promoted `package-lock.json` | R2 lock CAS writer만 |
| JS toolchain | `tools/toolchain-profile.json` | 별도 toolchain patch만 |
| npm effective config | R2 canonical npmrc + projection receipt | R2 runner |
| Cache closure | immutable cache manifest | R2 cache acquisition writer |
| Lifecycle execution | signed/hashed lifecycle replay plan | R2 lifecycle runner |
| Native toolchain | native toolchain manifest | R2 Win32 runner |
| Install graph | A/B install manifests | R2 install scanner |
| Production build identity | A/B build manifests | R2 build scanner |
| Final admission | R2 finalizer | finalizer only |

## 5. 상태 머신

```text
UNSEALED
→ SOURCE_CONTRACT_SEALED
→ ROOT_GRAPH_CANDIDATE_GENERATED
→ ROOT_GRAPH_EXACT
→ CACHE_CLOSURE_FROZEN
→ INSTALL_A_COMPLETE
→ INSTALL_B_COMPLETE
→ INSTALL_CONTENT_PARITY
→ LIFECYCLE_A_COMPLETE
→ LIFECYCLE_B_COMPLETE
→ LIFECYCLE_CONTENT_PARITY
→ NATIVE_TOOLCHAIN_CLOSED
→ NATIVE_ARTIFACT_PARITY
→ PRODUCTION_BUILD_A_COMPLETE
→ PRODUCTION_BUILD_B_COMPLETE
→ PRODUCTION_BUILD_PARITY
→ LOCK_PROMOTION_READY
→ DEPENDENCY_LOCK_R2_PROMOTED
→ POST_PROMOTION_REPLAY_COMPLETE
→ PRODUCTION_BUILD_ADMITTED
```

비정규 전이, state rewind, effect-before-intent, summary-only promotion은 금지한다.

## 6. Exact Root Dependency Graph v2

### 6.1 Direct graph

`package.json`의 `dependencies`, `devDependencies`, `optionalDependencies`, `peerDependencies`를 scope별로 정렬한다. 모든 direct version은 exact semver 또는 exact source identity여야 하며 `^`, `~`, `*`, tag, unpinned git ref를 금지한다.

### 6.2 Lock root exactness

`package-lock.json.packages[""]`의 각 dependency scope는 package.json과 key set·value가 완전히 같아야 한다. missing, extra, range drift는 모두 FAIL이다.

### 6.3 Direct package record

각 direct package는 lock의 `node_modules/<name>` record에서 exact version, resolved, integrity를 가져야 한다. workspace/local package는 normalized relative path와 source digest를 요구한다.

### 6.4 Root graph digest

```text
RootDependencyGraphDigest = SHA-256(canonical JSON {
  packageManager, engines,
  dependencies, devDependencies, optionalDependencies, peerDependencies
})
```

## 7. Candidate Lock Recovery

원본 tree가 아닌 isolated workspace에서 다음 command class를 실행한다.

```text
npm install --package-lock-only
  --ignore-scripts
  --strict-peer-deps
  --install-strategy=hoisted
  --no-audit --no-fund
```

candidate generation 전후 package.json raw bytes는 같아야 한다. candidate lock은 lockfileVersion 3이며 root exactness, direct record completeness, integrity completeness를 통과해야 한다.

## 8. npm Configuration과 Environment Authority

필수 canonical 값:

```text
targetPlatform = win32
targetArch = x64
nodeVersion = 22.16.0
npmVersion = 10.9.2
installStrategy = hoisted
strictPeerDeps = true
audit = false
fund = false
timezone = UTC
locale = C
SOURCE_DATE_EPOCH = 1784937600
buildNetworkAllowed = false
```

사용자 `.npmrc`, global npmrc, proxy, custom CA, shell profile, global prefix, ambient cache는 effective config에 섞일 수 없다.

## 9. Registry와 Frozen Cache Closure

네트워크는 candidate generation과 cache acquisition phase에서만 허용한다. cache manifest는 package key, resolved URL, integrity, tarball size, cache object SHA-256을 기록한다. freeze 이후 cache mutation은 금지한다.

```text
FrozenCacheDigest = SHA-256(sorted cache records)
```

## 10. Canonical npm ci A/B

A와 B는 서로 다른 절대경로의 clean workspace다. source input digest, candidate lock, canonical npmrc, frozen cache는 동일하다.

```text
npm ci --offline --ignore-scripts
  --strict-peer-deps
  --install-strategy=hoisted
  --no-audit --no-fund
```

`npm install`, lock rewrite, online fallback, missing optional dependency의 silent success는 금지한다.

## 11. Lifecycle Replay Plan v2

`npm ci --ignore-scripts` 이후 필요한 binary materialization은 explicit replay plan이 소유한다. plan은 package name, exact version, script name, script digest, working directory, environment allowlist, expected outputs, network policy를 포함한다.

현재 예상 lifecycle 대상에는 Electron binary materialization, sharp platform binary 확인, electron-builder 관련 package materialization이 포함될 수 있다. 실제 대상은 candidate install graph에서 재계산하며 hard-coded count를 신뢰하지 않는다.

임의 package의 preinstall/install/postinstall 실행, PowerShell profile 로딩, PATH 기반 다른 binary 선택을 금지한다.

## 12. Install Content Digest

각 file record:

```ts
interface InstallFileRecord {
  relativePath: string
  fileType: 'file' | 'directory' | 'symlink'
  byteLength: number
  sha256?: string
  symlinkTarget?: string
  executableBit: boolean
}
```

mtime, ctime, absolute workspace path는 identity에서 제외한다. A/B의 semantic graph digest와 content digest가 모두 같아야 한다.

## 13. Native Toolchain Closure

### 13.1 JavaScript toolchain

- Node `22.16.0`
- npm `10.9.2`
- Electron `29.0.0`
- electron-builder `24.13.3`
- Vite `8.1.5`
- TypeScript `5.9.3`
- vue-tsc `3.2.2`
- `@napi-rs/cli` `2.18.4`

### 13.2 Windows native toolchain

관측해야 할 항목:

- `cl.exe`, `link.exe`, `rc.exe` version·file SHA-256
- Visual Studio Build Tools instance identity
- Windows SDK version과 include/lib root digest
- target triple `x86_64-pc-windows-msvc`
- VC runtime policy
- architecture와 host architecture

### 13.3 Rust·WASM

- `rustc -Vv`, `cargo -V`
- installed target list
- `native/decoder-rs/Cargo.lock` raw SHA-256
- PSD WASM용 rust toolchain과 `wasm-pack` version
- `wasm-bindgen` CLI/library compatibility
- release profile flags, LTO, codegen-units, panic, strip

PSD WASM crate에 Cargo.lock이 없다면 R2는 생성 위치와 promotion policy를 명시해야 하며 build 중 조용한 dependency re-resolution을 허용하지 않는다.

## 14. Native Artifact Dual Build

A/B에서 동일 toolchain manifest로 다음을 빌드한다.

```text
native/decoder-rs/decoder_rs.win32-x64-msvc.node
app/legacy-runtime/libs/psd/pkg-v2/psd_exporter_wasm_bg.wasm
app/legacy-runtime/libs/psd/pkg-v2/psd_exporter_wasm.js
```

A/B bytes가 다른 경우 source, toolchain, absolute path leakage, compiler nondeterminism을 분리 보고한다. 다른 bytes를 semantic equivalence로 조용히 승인하지 않는다.

## 15. Zero Lock Mutation

다음 authority file은 candidate promotion 순간을 제외하고 raw bytes가 변하면 안 된다.

- `package.json`
- `package-lock.json`
- `native/decoder-rs/Cargo.toml`
- `native/decoder-rs/Cargo.lock`
- `native/psd-exporter-wasm-v2/Cargo.toml`
- R2 toolchain profile와 input profile

candidate lock CAS 직후에는 package-lock만 expected candidate bytes로 바뀌며, readback digest가 candidate digest와 같아야 한다.

## 16. Production Build A/B

각 workspace에서 동일 순서로 실행한다.

```text
vue-tsc --noEmit
explicit PSD WASM release build
explicit N-API release build
runtime manifest·Active Graph generation
Vite production emit
worker/WASM/static route verification
electron-builder --win --x64 --dir
package content manifest generation
```

build phase network access는 0이어야 한다. current time, username, workspace path, random nonce가 runtime bytes에 들어가면 FAIL이다.

## 17. Production Build Identity

비교 digest:

```text
rendererEmitDigest
workerClosureDigest
wasmClosureDigest
nativeAddonDigest
asarDigest
winUnpackedClosureDigest
runtimeClosureDigest
packageContentManifestDigest
```

PDB, log, cache, updater temp 같은 비배포 파일은 package closure에서 제외하되 exclusion list는 schema에 고정한다.

## 18. Lock Atomic CAS Promotion

```text
expectedOldPackageLockSha256
+ candidatePackageLockSha256
+ promotionIntent receipt fsync
→ atomic replace
→ directory fsync
→ readback SHA-256
→ promotionEffect receipt fsync
```

CAS mismatch 자동 재시도, current lock overwrite, partially written lock은 금지한다.

## 19. Post-Promotion Replay

승격된 원본 tree를 다시 clean clone하여 npm ci, lifecycle replay, native build, production build를 한 번 더 실행한다. candidate workspace 결과와 promoted replay 결과가 같아야 한다.

## 20. Production Build Admission

Final admission은 다음 raw child receipts를 직접 읽고 재계산한다.

- root graph exactness
- candidate lock
- frozen cache
- install A/B
- lifecycle A/B
- native toolchain
- native artifact A/B
- typecheck A/B
- renderer emit A/B
- Electron unpacked A/B
- mutation zero
- lock CAS
- post-promotion replay

외부에서 제공된 `reproducible=true`, `buildPassed=true` 같은 summary field는 권위가 아니다.

## 21. Receipt Schemas

필수 receipt kind:

```text
build-lock-r2-input-profile
build-lock-r2-root-graph
build-lock-r2-lock-candidate
build-lock-r2-cache-closure
build-lock-r2-install-run
build-lock-r2-lifecycle-run
build-lock-r2-install-parity
build-lock-r2-native-toolchain
build-lock-r2-native-build
build-lock-r2-production-build
build-lock-r2-build-parity
build-lock-r2-mutation-zero
build-lock-r2-promotion-intent
build-lock-r2-promotion-effect
build-lock-r2-post-promotion-replay
build-lock-r2-final-admission
```

모든 receipt는 schemaVersion, receiptKind, buildLockRunId, input digest set, child receipt digest set, selfSha256를 가진다.

## 22. Stable Error Registry

- `E_BUILD_LOCK_R2_PARENT_MISMATCH`
- `E_BUILD_LOCK_R2_ROOT_GRAPH_MISMATCH`
- `E_BUILD_LOCK_R2_DIRECT_RANGE_FORBIDDEN`
- `E_BUILD_LOCK_R2_LOCKFILE_VERSION`
- `E_BUILD_LOCK_R2_DIRECT_RECORD_MISSING`
- `E_BUILD_LOCK_R2_INTEGRITY_MISSING`
- `E_BUILD_LOCK_R2_CANDIDATE_PACKAGE_MUTATED`
- `E_BUILD_LOCK_R2_REGISTRY_IDENTITY`
- `E_BUILD_LOCK_R2_CACHE_INCOMPLETE`
- `E_BUILD_LOCK_R2_CACHE_MUTATED`
- `E_BUILD_LOCK_R2_NONCANONICAL_HOST`
- `E_BUILD_LOCK_R2_NPM_CONFIG_DRIFT`
- `E_BUILD_LOCK_R2_OFFLINE_CI_FAILED`
- `E_BUILD_LOCK_R2_INSTALL_GRAPH_DIVERGENCE`
- `E_BUILD_LOCK_R2_INSTALL_CONTENT_DIVERGENCE`
- `E_BUILD_LOCK_R2_LIFECYCLE_UNDECLARED`
- `E_BUILD_LOCK_R2_LIFECYCLE_NETWORK`
- `E_BUILD_LOCK_R2_LIFECYCLE_OUTPUT_DIVERGENCE`
- `E_BUILD_LOCK_R2_TOOLCHAIN_DRIFT`
- `E_BUILD_LOCK_R2_MSVC_DRIFT`
- `E_BUILD_LOCK_R2_RUST_DRIFT`
- `E_BUILD_LOCK_R2_WASM_TOOLCHAIN_DRIFT`
- `E_BUILD_LOCK_R2_NATIVE_BUILD_FAILED`
- `E_BUILD_LOCK_R2_NATIVE_BYTES_DIVERGENCE`
- `E_BUILD_LOCK_R2_TYPECHECK_FAILED`
- `E_BUILD_LOCK_R2_RENDERER_EMIT_FAILED`
- `E_BUILD_LOCK_R2_ELECTRON_UNPACKED_FAILED`
- `E_BUILD_LOCK_R2_BUILD_BYTES_DIVERGENCE`
- `E_BUILD_LOCK_R2_SOURCE_MUTATION`
- `E_BUILD_LOCK_R2_LOCK_MUTATION`
- `E_BUILD_LOCK_R2_PROMOTION_CAS_MISMATCH`
- `E_BUILD_LOCK_R2_PROMOTION_READBACK`
- `E_BUILD_LOCK_R2_POST_PROMOTION_REPLAY`
- `E_BUILD_LOCK_R2_FINAL_CHILD_MISSING`
- `E_BUILD_LOCK_R2_FINAL_SUMMARY_TRUST`
- `E_BUILD_LOCK_R2_WIN32_RECEIPT_MISSING`

## 23. Negative Control Matrix

1. package.json direct version에 caret 삽입
2. lock root에서 Vue 제거
3. lock root에 extra dependency 삽입
4. direct package integrity 제거
5. lockfileVersion 2로 downgrade
6. user npmrc registry 주입
7. offline phase에서 network 성공 허용
8. frozen cache tarball 1 byte 변조
9. A/B 중 한쪽 npm version 변경
10. A/B workspace에 global package 주입
11. undeclared postinstall 실행
12. lifecycle output 파일 사후 교체
13. MSVC compiler path 교체
14. Windows SDK version 교체
15. Cargo.lock 사후 변경
16. rustc version 교체
17. wasm-pack version 교체
18. native addon 한쪽에 path 문자열 주입
19. WASM glue 한쪽만 수정
20. typecheck 한쪽 skip
21. Vite build 한쪽만 development mode
22. Electron unpacked 한쪽에 extra executable 삽입
23. ASAR 한쪽 file 제거
24. package-lock build 중 mutation
25. package.json build 중 mutation
26. candidate lock stale-old CAS
27. promotion effect receipt 누락
28. post-promotion npm ci skip
29. summary boolean만 true로 위조
30. final child receipt 사후 교체
31. Linux cross-build를 Win32 canonical로 위장
32. signed installer bytes를 R2 build parity로 오인
33. R14A signing receipt 없이 distribution PASS 주장
34. old Build Lock 01 PASS carry-forward
35. source tree absolute path embedded
36. current timestamp embedded
37. random chunk order
38. partial output를 success로 승격
39. failed run의 temp lock 재사용
40. finalizer raw artifact 미재계산

## 24. Required Implementation Surface

```text
tools/build-lock-01-r2/
  contract.mjs
  exact-root-graph.mjs
  candidate-lock.mjs
  npm-config-authority.mjs
  registry-cache-closure.mjs
  install-runner.mjs
  lifecycle-plan.mjs
  lifecycle-runner.mjs
  install-content-manifest.mjs
  native-toolchain-manifest.mjs
  native-build-runner.mjs
  production-build-runner.mjs
  package-closure-manifest.mjs
  mutation-monitor.mjs
  promote-lock-cas.mjs
  post-promotion-replay.mjs
  finalizer.mjs
  verify-source.mjs
  verify-win32.mjs
  verify-negative-controls.mjs
  schemas/*.schema.json
```

필수 수정 표면:

- `package-lock.json`은 R2 promotion effect에서만 변경
- `package.json` R2 scripts 등록
- `tools/verify-dependency-lock.mjs` R2 receipt 소비
- `tools/verify-toolchain-profile.mjs` native toolchain child receipt 연결
- `build:renderer`, `build:app:unpacked`, `verify:renderer` admission wiring
- R9A physical runner preflight에서 R2 final admission 요구
- R10A rebuild input qualification에 R2 final receipt 추가
- R14A package manifest lineage에 R2 build admission digest 추가

## 25. Gate Catalog

### 25.1 SOURCE_MANDATORY 420

| Gate ID | Requirement name | Requirement |
|---|---|---|
| `BLR2-S001` | `parent-lineage-authority-owner` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S002` | `parent-lineage-schema-identity` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S003` | `parent-lineage-input-completeness` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S004` | `parent-lineage-exact-identity` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S005` | `parent-lineage-canonical-digest` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S006` | `parent-lineage-path-normalization` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S007` | `parent-lineage-environment-isolation` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S008` | `parent-lineage-network-boundary` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S009` | `parent-lineage-silent-fallback-zero` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S010` | `parent-lineage-stable-error` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S011` | `parent-lineage-negative-control` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S012` | `parent-lineage-receipt-emission` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S013` | `parent-lineage-receipt-self-hash` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S014` | `parent-lineage-parent-lineage` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S015` | `parent-lineage-mutation-zero` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S016` | `parent-lineage-deterministic-replay` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S017` | `parent-lineage-count-invariant` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S018` | `parent-lineage-failure-cleanup` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S019` | `parent-lineage-readback-verification` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S020` | `parent-lineage-finalizer-recomputation` | Build Lock 01과 R14A 부모 바이트·영수증 계보를 historical-only와 current로 분리한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S021` | `package-metadata-authority-owner` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S022` | `package-metadata-schema-identity` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S023` | `package-metadata-input-completeness` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S024` | `package-metadata-exact-identity` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S025` | `package-metadata-canonical-digest` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S026` | `package-metadata-path-normalization` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S027` | `package-metadata-environment-isolation` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S028` | `package-metadata-network-boundary` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S029` | `package-metadata-silent-fallback-zero` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S030` | `package-metadata-stable-error` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S031` | `package-metadata-negative-control` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S032` | `package-metadata-receipt-emission` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S033` | `package-metadata-receipt-self-hash` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S034` | `package-metadata-parent-lineage` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S035` | `package-metadata-mutation-zero` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S036` | `package-metadata-deterministic-replay` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S037` | `package-metadata-count-invariant` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S038` | `package-metadata-failure-cleanup` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S039` | `package-metadata-readback-verification` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S040` | `package-metadata-finalizer-recomputation` | packageManager, engines, direct dependency 선언을 exact version policy로 고정한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S041` | `exact-root-graph-authority-owner` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S042` | `exact-root-graph-schema-identity` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S043` | `exact-root-graph-input-completeness` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S044` | `exact-root-graph-exact-identity` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S045` | `exact-root-graph-canonical-digest` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S046` | `exact-root-graph-path-normalization` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S047` | `exact-root-graph-environment-isolation` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S048` | `exact-root-graph-network-boundary` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S049` | `exact-root-graph-silent-fallback-zero` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S050` | `exact-root-graph-stable-error` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S051` | `exact-root-graph-negative-control` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S052` | `exact-root-graph-receipt-emission` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S053` | `exact-root-graph-receipt-self-hash` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S054` | `exact-root-graph-parent-lineage` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S055` | `exact-root-graph-mutation-zero` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S056` | `exact-root-graph-deterministic-replay` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S057` | `exact-root-graph-count-invariant` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S058` | `exact-root-graph-failure-cleanup` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S059` | `exact-root-graph-readback-verification` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S060` | `exact-root-graph-finalizer-recomputation` | package.json direct graph와 package-lock packages[""] root graph를 완전 동일하게 만든다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S061` | `lock-candidate-authority-owner` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S062` | `lock-candidate-schema-identity` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S063` | `lock-candidate-input-completeness` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S064` | `lock-candidate-exact-identity` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S065` | `lock-candidate-canonical-digest` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S066` | `lock-candidate-path-normalization` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S067` | `lock-candidate-environment-isolation` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S068` | `lock-candidate-network-boundary` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S069` | `lock-candidate-silent-fallback-zero` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S070` | `lock-candidate-stable-error` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S071` | `lock-candidate-negative-control` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S072` | `lock-candidate-receipt-emission` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S073` | `lock-candidate-receipt-self-hash` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S074` | `lock-candidate-parent-lineage` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S075` | `lock-candidate-mutation-zero` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S076` | `lock-candidate-deterministic-replay` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S077` | `lock-candidate-count-invariant` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S078` | `lock-candidate-failure-cleanup` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S079` | `lock-candidate-readback-verification` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S080` | `lock-candidate-finalizer-recomputation` | 격리 workspace에서 candidate package-lock을 생성하고 원본을 수정하지 않는다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S081` | `lock-semantic-graph-authority-owner` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S082` | `lock-semantic-graph-schema-identity` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S083` | `lock-semantic-graph-input-completeness` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S084` | `lock-semantic-graph-exact-identity` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S085` | `lock-semantic-graph-canonical-digest` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S086` | `lock-semantic-graph-path-normalization` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S087` | `lock-semantic-graph-environment-isolation` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S088` | `lock-semantic-graph-network-boundary` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S089` | `lock-semantic-graph-silent-fallback-zero` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S090` | `lock-semantic-graph-stable-error` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S091` | `lock-semantic-graph-negative-control` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S092` | `lock-semantic-graph-receipt-emission` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S093` | `lock-semantic-graph-receipt-self-hash` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S094` | `lock-semantic-graph-parent-lineage` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S095` | `lock-semantic-graph-mutation-zero` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S096` | `lock-semantic-graph-deterministic-replay` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S097` | `lock-semantic-graph-count-invariant` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S098` | `lock-semantic-graph-failure-cleanup` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S099` | `lock-semantic-graph-readback-verification` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S100` | `lock-semantic-graph-finalizer-recomputation` | lockfileVersion 3 전체 semantic graph와 resolved·integrity·peer 관계를 정규화한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S101` | `npm-config-authority-authority-owner` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S102` | `npm-config-authority-schema-identity` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S103` | `npm-config-authority-input-completeness` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S104` | `npm-config-authority-exact-identity` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S105` | `npm-config-authority-canonical-digest` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S106` | `npm-config-authority-path-normalization` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S107` | `npm-config-authority-environment-isolation` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S108` | `npm-config-authority-network-boundary` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S109` | `npm-config-authority-silent-fallback-zero` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S110` | `npm-config-authority-stable-error` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S111` | `npm-config-authority-negative-control` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S112` | `npm-config-authority-receipt-emission` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S113` | `npm-config-authority-receipt-self-hash` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S114` | `npm-config-authority-parent-lineage` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S115` | `npm-config-authority-mutation-zero` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S116` | `npm-config-authority-deterministic-replay` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S117` | `npm-config-authority-count-invariant` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S118` | `npm-config-authority-failure-cleanup` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S119` | `npm-config-authority-readback-verification` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S120` | `npm-config-authority-finalizer-recomputation` | canonical npmrc와 effective npm config projection을 SSOT로 고정한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S121` | `environment-projection-authority-owner` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S122` | `environment-projection-schema-identity` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S123` | `environment-projection-input-completeness` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S124` | `environment-projection-exact-identity` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S125` | `environment-projection-canonical-digest` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S126` | `environment-projection-path-normalization` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S127` | `environment-projection-environment-isolation` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S128` | `environment-projection-network-boundary` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S129` | `environment-projection-silent-fallback-zero` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S130` | `environment-projection-stable-error` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S131` | `environment-projection-negative-control` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S132` | `environment-projection-receipt-emission` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S133` | `environment-projection-receipt-self-hash` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S134` | `environment-projection-parent-lineage` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S135` | `environment-projection-mutation-zero` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S136` | `environment-projection-deterministic-replay` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S137` | `environment-projection-count-invariant` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S138` | `environment-projection-failure-cleanup` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S139` | `environment-projection-readback-verification` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S140` | `environment-projection-finalizer-recomputation` | Win32-x64 install/build 환경변수와 ambient input 차단 규칙을 고정한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S141` | `registry-identity-authority-owner` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S142` | `registry-identity-schema-identity` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S143` | `registry-identity-input-completeness` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S144` | `registry-identity-exact-identity` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S145` | `registry-identity-canonical-digest` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S146` | `registry-identity-path-normalization` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S147` | `registry-identity-environment-isolation` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S148` | `registry-identity-network-boundary` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S149` | `registry-identity-silent-fallback-zero` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S150` | `registry-identity-stable-error` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S151` | `registry-identity-negative-control` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S152` | `registry-identity-receipt-emission` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S153` | `registry-identity-receipt-self-hash` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S154` | `registry-identity-parent-lineage` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S155` | `registry-identity-mutation-zero` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S156` | `registry-identity-deterministic-replay` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S157` | `registry-identity-count-invariant` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S158` | `registry-identity-failure-cleanup` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S159` | `registry-identity-readback-verification` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S160` | `registry-identity-finalizer-recomputation` | logical registry와 transport endpoint, redirect, TLS identity를 receipt에 결속한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S161` | `frozen-cache-closure-authority-owner` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S162` | `frozen-cache-closure-schema-identity` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S163` | `frozen-cache-closure-input-completeness` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S164` | `frozen-cache-closure-exact-identity` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S165` | `frozen-cache-closure-canonical-digest` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S166` | `frozen-cache-closure-path-normalization` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S167` | `frozen-cache-closure-environment-isolation` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S168` | `frozen-cache-closure-network-boundary` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S169` | `frozen-cache-closure-silent-fallback-zero` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S170` | `frozen-cache-closure-stable-error` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S171` | `frozen-cache-closure-negative-control` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S172` | `frozen-cache-closure-receipt-emission` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S173` | `frozen-cache-closure-receipt-self-hash` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S174` | `frozen-cache-closure-parent-lineage` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S175` | `frozen-cache-closure-mutation-zero` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S176` | `frozen-cache-closure-deterministic-replay` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S177` | `frozen-cache-closure-count-invariant` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S178` | `frozen-cache-closure-failure-cleanup` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S179` | `frozen-cache-closure-readback-verification` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S180` | `frozen-cache-closure-finalizer-recomputation` | candidate lock이 요구하는 모든 tarball·metadata의 frozen cache closure를 정의한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S181` | `lifecycle-replay-plan-authority-owner` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S182` | `lifecycle-replay-plan-schema-identity` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S183` | `lifecycle-replay-plan-input-completeness` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S184` | `lifecycle-replay-plan-exact-identity` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S185` | `lifecycle-replay-plan-canonical-digest` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S186` | `lifecycle-replay-plan-path-normalization` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S187` | `lifecycle-replay-plan-environment-isolation` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S188` | `lifecycle-replay-plan-network-boundary` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S189` | `lifecycle-replay-plan-silent-fallback-zero` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S190` | `lifecycle-replay-plan-stable-error` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S191` | `lifecycle-replay-plan-negative-control` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S192` | `lifecycle-replay-plan-receipt-emission` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S193` | `lifecycle-replay-plan-receipt-self-hash` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S194` | `lifecycle-replay-plan-parent-lineage` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S195` | `lifecycle-replay-plan-mutation-zero` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S196` | `lifecycle-replay-plan-deterministic-replay` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S197` | `lifecycle-replay-plan-count-invariant` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S198` | `lifecycle-replay-plan-failure-cleanup` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S199` | `lifecycle-replay-plan-readback-verification` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S200` | `lifecycle-replay-plan-finalizer-recomputation` | ignore-scripts install 뒤 실행할 lifecycle·binary materialization을 명시 allowlist로 정의한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S201` | `install-content-schema-authority-owner` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S202` | `install-content-schema-schema-identity` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S203` | `install-content-schema-input-completeness` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S204` | `install-content-schema-exact-identity` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S205` | `install-content-schema-canonical-digest` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S206` | `install-content-schema-path-normalization` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S207` | `install-content-schema-environment-isolation` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S208` | `install-content-schema-network-boundary` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S209` | `install-content-schema-silent-fallback-zero` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S210` | `install-content-schema-stable-error` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S211` | `install-content-schema-negative-control` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S212` | `install-content-schema-receipt-emission` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S213` | `install-content-schema-receipt-self-hash` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S214` | `install-content-schema-parent-lineage` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S215` | `install-content-schema-mutation-zero` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S216` | `install-content-schema-deterministic-replay` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S217` | `install-content-schema-count-invariant` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S218` | `install-content-schema-failure-cleanup` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S219` | `install-content-schema-readback-verification` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S220` | `install-content-schema-finalizer-recomputation` | node_modules 설치 내용과 package instance graph의 canonical digest schema를 정의한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S221` | `zero-lock-mutation-authority-owner` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S222` | `zero-lock-mutation-schema-identity` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S223` | `zero-lock-mutation-input-completeness` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S224` | `zero-lock-mutation-exact-identity` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S225` | `zero-lock-mutation-canonical-digest` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S226` | `zero-lock-mutation-path-normalization` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S227` | `zero-lock-mutation-environment-isolation` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S228` | `zero-lock-mutation-network-boundary` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S229` | `zero-lock-mutation-silent-fallback-zero` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S230` | `zero-lock-mutation-stable-error` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S231` | `zero-lock-mutation-negative-control` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S232` | `zero-lock-mutation-receipt-emission` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S233` | `zero-lock-mutation-receipt-self-hash` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S234` | `zero-lock-mutation-parent-lineage` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S235` | `zero-lock-mutation-mutation-zero` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S236` | `zero-lock-mutation-deterministic-replay` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S237` | `zero-lock-mutation-count-invariant` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S238` | `zero-lock-mutation-failure-cleanup` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S239` | `zero-lock-mutation-readback-verification` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S240` | `zero-lock-mutation-finalizer-recomputation` | package.json·package-lock·Cargo manifest·Cargo lock의 raw-byte mutation zero를 강제한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S241` | `toolchain-profile-authority-owner` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S242` | `toolchain-profile-schema-identity` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S243` | `toolchain-profile-input-completeness` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S244` | `toolchain-profile-exact-identity` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S245` | `toolchain-profile-canonical-digest` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S246` | `toolchain-profile-path-normalization` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S247` | `toolchain-profile-environment-isolation` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S248` | `toolchain-profile-network-boundary` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S249` | `toolchain-profile-silent-fallback-zero` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S250` | `toolchain-profile-stable-error` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S251` | `toolchain-profile-negative-control` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S252` | `toolchain-profile-receipt-emission` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S253` | `toolchain-profile-receipt-self-hash` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S254` | `toolchain-profile-parent-lineage` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S255` | `toolchain-profile-mutation-zero` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S256` | `toolchain-profile-deterministic-replay` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S257` | `toolchain-profile-count-invariant` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S258` | `toolchain-profile-failure-cleanup` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S259` | `toolchain-profile-readback-verification` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S260` | `toolchain-profile-finalizer-recomputation` | Node 22.16.0, npm 10.9.2, Electron 29.0.0 등 JS toolchain identity를 고정한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S261` | `native-toolchain-manifest-authority-owner` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S262` | `native-toolchain-manifest-schema-identity` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S263` | `native-toolchain-manifest-input-completeness` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S264` | `native-toolchain-manifest-exact-identity` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S265` | `native-toolchain-manifest-canonical-digest` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S266` | `native-toolchain-manifest-path-normalization` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S267` | `native-toolchain-manifest-environment-isolation` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S268` | `native-toolchain-manifest-network-boundary` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S269` | `native-toolchain-manifest-silent-fallback-zero` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S270` | `native-toolchain-manifest-stable-error` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S271` | `native-toolchain-manifest-negative-control` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S272` | `native-toolchain-manifest-receipt-emission` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S273` | `native-toolchain-manifest-receipt-self-hash` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S274` | `native-toolchain-manifest-parent-lineage` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S275` | `native-toolchain-manifest-mutation-zero` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S276` | `native-toolchain-manifest-deterministic-replay` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S277` | `native-toolchain-manifest-count-invariant` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S278` | `native-toolchain-manifest-failure-cleanup` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S279` | `native-toolchain-manifest-readback-verification` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S280` | `native-toolchain-manifest-finalizer-recomputation` | MSVC·Windows SDK·Rust·Cargo·wasm-pack·wasm-bindgen·N-API toolchain closure를 정의한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S281` | `production-build-driver-authority-owner` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S282` | `production-build-driver-schema-identity` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S283` | `production-build-driver-input-completeness` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S284` | `production-build-driver-exact-identity` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S285` | `production-build-driver-canonical-digest` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S286` | `production-build-driver-path-normalization` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S287` | `production-build-driver-environment-isolation` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S288` | `production-build-driver-network-boundary` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S289` | `production-build-driver-silent-fallback-zero` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S290` | `production-build-driver-stable-error` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S291` | `production-build-driver-negative-control` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S292` | `production-build-driver-receipt-emission` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S293` | `production-build-driver-receipt-self-hash` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S294` | `production-build-driver-parent-lineage` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S295` | `production-build-driver-mutation-zero` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S296` | `production-build-driver-deterministic-replay` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S297` | `production-build-driver-count-invariant` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S298` | `production-build-driver-failure-cleanup` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S299` | `production-build-driver-readback-verification` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S300` | `production-build-driver-finalizer-recomputation` | dual install A/B에서 동일한 typecheck·native·WASM·renderer·Electron build 순서를 강제한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S301` | `electron-package-closure-authority-owner` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S302` | `electron-package-closure-schema-identity` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S303` | `electron-package-closure-input-completeness` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S304` | `electron-package-closure-exact-identity` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S305` | `electron-package-closure-canonical-digest` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S306` | `electron-package-closure-path-normalization` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S307` | `electron-package-closure-environment-isolation` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S308` | `electron-package-closure-network-boundary` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S309` | `electron-package-closure-silent-fallback-zero` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S310` | `electron-package-closure-stable-error` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S311` | `electron-package-closure-negative-control` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S312` | `electron-package-closure-receipt-emission` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S313` | `electron-package-closure-receipt-self-hash` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S314` | `electron-package-closure-parent-lineage` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S315` | `electron-package-closure-mutation-zero` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S316` | `electron-package-closure-deterministic-replay` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S317` | `electron-package-closure-count-invariant` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S318` | `electron-package-closure-failure-cleanup` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S319` | `electron-package-closure-readback-verification` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S320` | `electron-package-closure-finalizer-recomputation` | win-unpacked와 ASAR·native addon·worker·WASM content closure schema를 정의한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S321` | `receipt-schemas-authority-owner` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S322` | `receipt-schemas-schema-identity` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S323` | `receipt-schemas-input-completeness` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S324` | `receipt-schemas-exact-identity` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S325` | `receipt-schemas-canonical-digest` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S326` | `receipt-schemas-path-normalization` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S327` | `receipt-schemas-environment-isolation` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S328` | `receipt-schemas-network-boundary` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S329` | `receipt-schemas-silent-fallback-zero` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S330` | `receipt-schemas-stable-error` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S331` | `receipt-schemas-negative-control` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S332` | `receipt-schemas-receipt-emission` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S333` | `receipt-schemas-receipt-self-hash` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S334` | `receipt-schemas-parent-lineage` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S335` | `receipt-schemas-mutation-zero` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S336` | `receipt-schemas-deterministic-replay` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S337` | `receipt-schemas-count-invariant` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S338` | `receipt-schemas-failure-cleanup` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S339` | `receipt-schemas-readback-verification` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S340` | `receipt-schemas-finalizer-recomputation` | input, install, lifecycle, native, build, promotion, final receipt schema와 self-hash를 정의한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S341` | `stable-error-registry-authority-owner` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S342` | `stable-error-registry-schema-identity` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S343` | `stable-error-registry-input-completeness` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S344` | `stable-error-registry-exact-identity` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S345` | `stable-error-registry-canonical-digest` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S346` | `stable-error-registry-path-normalization` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S347` | `stable-error-registry-environment-isolation` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S348` | `stable-error-registry-network-boundary` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S349` | `stable-error-registry-silent-fallback-zero` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S350` | `stable-error-registry-stable-error` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S351` | `stable-error-registry-negative-control` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S352` | `stable-error-registry-receipt-emission` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S353` | `stable-error-registry-receipt-self-hash` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S354` | `stable-error-registry-parent-lineage` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S355` | `stable-error-registry-mutation-zero` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S356` | `stable-error-registry-deterministic-replay` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S357` | `stable-error-registry-count-invariant` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S358` | `stable-error-registry-failure-cleanup` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S359` | `stable-error-registry-readback-verification` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S360` | `stable-error-registry-finalizer-recomputation` | 모든 실패를 stable error code로 분류하고 generic success fallback을 금지한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S361` | `negative-control-source-authority-owner` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S362` | `negative-control-source-schema-identity` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S363` | `negative-control-source-input-completeness` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S364` | `negative-control-source-exact-identity` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S365` | `negative-control-source-canonical-digest` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S366` | `negative-control-source-path-normalization` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S367` | `negative-control-source-environment-isolation` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S368` | `negative-control-source-network-boundary` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S369` | `negative-control-source-silent-fallback-zero` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S370` | `negative-control-source-stable-error` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S371` | `negative-control-source-negative-control` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S372` | `negative-control-source-receipt-emission` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S373` | `negative-control-source-receipt-self-hash` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S374` | `negative-control-source-parent-lineage` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S375` | `negative-control-source-mutation-zero` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S376` | `negative-control-source-deterministic-replay` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S377` | `negative-control-source-count-invariant` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S378` | `negative-control-source-failure-cleanup` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S379` | `negative-control-source-readback-verification` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S380` | `negative-control-source-finalizer-recomputation` | root drift, cache drift, toolchain drift, hidden script, lock mutation을 source negative control로 고정한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S381` | `product-wiring-authority-owner` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S382` | `product-wiring-schema-identity` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S383` | `product-wiring-input-completeness` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S384` | `product-wiring-exact-identity` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S385` | `product-wiring-canonical-digest` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S386` | `product-wiring-path-normalization` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S387` | `product-wiring-environment-isolation` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S388` | `product-wiring-network-boundary` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S389` | `product-wiring-silent-fallback-zero` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S390` | `product-wiring-stable-error` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S391` | `product-wiring-negative-control` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S392` | `product-wiring-receipt-emission` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S393` | `product-wiring-receipt-self-hash` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S394` | `product-wiring-parent-lineage` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S395` | `product-wiring-mutation-zero` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S396` | `product-wiring-deterministic-replay` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S397` | `product-wiring-count-invariant` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S398` | `product-wiring-failure-cleanup` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S399` | `product-wiring-readback-verification` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S400` | `product-wiring-finalizer-recomputation` | package scripts와 build admission entrypoint가 R2 authority를 우회하지 못하게 결선한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-S401` | `source-finalizer-authority-owner` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-S402` | `source-finalizer-schema-identity` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-S403` | `source-finalizer-input-completeness` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-S404` | `source-finalizer-exact-identity` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-S405` | `source-finalizer-canonical-digest` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-S406` | `source-finalizer-path-normalization` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-S407` | `source-finalizer-environment-isolation` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-S408` | `source-finalizer-network-boundary` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-S409` | `source-finalizer-silent-fallback-zero` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-S410` | `source-finalizer-stable-error` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-S411` | `source-finalizer-negative-control` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-S412` | `source-finalizer-receipt-emission` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-S413` | `source-finalizer-receipt-self-hash` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-S414` | `source-finalizer-parent-lineage` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-S415` | `source-finalizer-mutation-zero` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-S416` | `source-finalizer-deterministic-replay` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-S417` | `source-finalizer-count-invariant` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-S418` | `source-finalizer-failure-cleanup` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-S419` | `source-finalizer-readback-verification` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-S420` | `source-finalizer-finalizer-recomputation` | source finalizer가 요약 boolean을 믿지 않고 raw artifact를 재검증하게 한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |

### 25.2 WIN32_MANDATORY 580

| Gate ID | Requirement name | Requirement |
|---|---|---|
| `BLR2-P001` | `canonical-win32-host-authority-owner` | Windows x64 canonical host와 process identity를 검증한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P002` | `canonical-win32-host-schema-identity` | Windows x64 canonical host와 process identity를 검증한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P003` | `canonical-win32-host-input-completeness` | Windows x64 canonical host와 process identity를 검증한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P004` | `canonical-win32-host-exact-identity` | Windows x64 canonical host와 process identity를 검증한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P005` | `canonical-win32-host-canonical-digest` | Windows x64 canonical host와 process identity를 검증한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P006` | `canonical-win32-host-path-normalization` | Windows x64 canonical host와 process identity를 검증한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P007` | `canonical-win32-host-environment-isolation` | Windows x64 canonical host와 process identity를 검증한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P008` | `canonical-win32-host-network-boundary` | Windows x64 canonical host와 process identity를 검증한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P009` | `canonical-win32-host-silent-fallback-zero` | Windows x64 canonical host와 process identity를 검증한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P010` | `canonical-win32-host-stable-error` | Windows x64 canonical host와 process identity를 검증한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P011` | `canonical-win32-host-negative-control` | Windows x64 canonical host와 process identity를 검증한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P012` | `canonical-win32-host-receipt-emission` | Windows x64 canonical host와 process identity를 검증한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P013` | `canonical-win32-host-receipt-self-hash` | Windows x64 canonical host와 process identity를 검증한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P014` | `canonical-win32-host-parent-lineage` | Windows x64 canonical host와 process identity를 검증한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P015` | `canonical-win32-host-mutation-zero` | Windows x64 canonical host와 process identity를 검증한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P016` | `canonical-win32-host-deterministic-replay` | Windows x64 canonical host와 process identity를 검증한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P017` | `canonical-win32-host-count-invariant` | Windows x64 canonical host와 process identity를 검증한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P018` | `canonical-win32-host-failure-cleanup` | Windows x64 canonical host와 process identity를 검증한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P019` | `canonical-win32-host-readback-verification` | Windows x64 canonical host와 process identity를 검증한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P020` | `canonical-win32-host-finalizer-recomputation` | Windows x64 canonical host와 process identity를 검증한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P021` | `clean-workspace-ab-authority-owner` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P022` | `clean-workspace-ab-schema-identity` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P023` | `clean-workspace-ab-input-completeness` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P024` | `clean-workspace-ab-exact-identity` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P025` | `clean-workspace-ab-canonical-digest` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P026` | `clean-workspace-ab-path-normalization` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P027` | `clean-workspace-ab-environment-isolation` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P028` | `clean-workspace-ab-network-boundary` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P029` | `clean-workspace-ab-silent-fallback-zero` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P030` | `clean-workspace-ab-stable-error` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P031` | `clean-workspace-ab-negative-control` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P032` | `clean-workspace-ab-receipt-emission` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P033` | `clean-workspace-ab-receipt-self-hash` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P034` | `clean-workspace-ab-parent-lineage` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P035` | `clean-workspace-ab-mutation-zero` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P036` | `clean-workspace-ab-deterministic-replay` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P037` | `clean-workspace-ab-count-invariant` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P038` | `clean-workspace-ab-failure-cleanup` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P039` | `clean-workspace-ab-readback-verification` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P040` | `clean-workspace-ab-finalizer-recomputation` | A/B install·build workspace를 독립 생성하고 source bytes를 동일하게 주입한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P041` | `candidate-lock-generation-authority-owner` | candidate package-lock을 canonical npm command로 생성한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P042` | `candidate-lock-generation-schema-identity` | candidate package-lock을 canonical npm command로 생성한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P043` | `candidate-lock-generation-input-completeness` | candidate package-lock을 canonical npm command로 생성한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P044` | `candidate-lock-generation-exact-identity` | candidate package-lock을 canonical npm command로 생성한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P045` | `candidate-lock-generation-canonical-digest` | candidate package-lock을 canonical npm command로 생성한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P046` | `candidate-lock-generation-path-normalization` | candidate package-lock을 canonical npm command로 생성한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P047` | `candidate-lock-generation-environment-isolation` | candidate package-lock을 canonical npm command로 생성한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P048` | `candidate-lock-generation-network-boundary` | candidate package-lock을 canonical npm command로 생성한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P049` | `candidate-lock-generation-silent-fallback-zero` | candidate package-lock을 canonical npm command로 생성한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P050` | `candidate-lock-generation-stable-error` | candidate package-lock을 canonical npm command로 생성한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P051` | `candidate-lock-generation-negative-control` | candidate package-lock을 canonical npm command로 생성한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P052` | `candidate-lock-generation-receipt-emission` | candidate package-lock을 canonical npm command로 생성한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P053` | `candidate-lock-generation-receipt-self-hash` | candidate package-lock을 canonical npm command로 생성한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P054` | `candidate-lock-generation-parent-lineage` | candidate package-lock을 canonical npm command로 생성한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P055` | `candidate-lock-generation-mutation-zero` | candidate package-lock을 canonical npm command로 생성한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P056` | `candidate-lock-generation-deterministic-replay` | candidate package-lock을 canonical npm command로 생성한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P057` | `candidate-lock-generation-count-invariant` | candidate package-lock을 canonical npm command로 생성한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P058` | `candidate-lock-generation-failure-cleanup` | candidate package-lock을 canonical npm command로 생성한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P059` | `candidate-lock-generation-readback-verification` | candidate package-lock을 canonical npm command로 생성한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P060` | `candidate-lock-generation-finalizer-recomputation` | candidate package-lock을 canonical npm command로 생성한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P061` | `exact-root-graph-runtime-authority-owner` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P062` | `exact-root-graph-runtime-schema-identity` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P063` | `exact-root-graph-runtime-input-completeness` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P064` | `exact-root-graph-runtime-exact-identity` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P065` | `exact-root-graph-runtime-canonical-digest` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P066` | `exact-root-graph-runtime-path-normalization` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P067` | `exact-root-graph-runtime-environment-isolation` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P068` | `exact-root-graph-runtime-network-boundary` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P069` | `exact-root-graph-runtime-silent-fallback-zero` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P070` | `exact-root-graph-runtime-stable-error` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P071` | `exact-root-graph-runtime-negative-control` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P072` | `exact-root-graph-runtime-receipt-emission` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P073` | `exact-root-graph-runtime-receipt-self-hash` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P074` | `exact-root-graph-runtime-parent-lineage` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P075` | `exact-root-graph-runtime-mutation-zero` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P076` | `exact-root-graph-runtime-deterministic-replay` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P077` | `exact-root-graph-runtime-count-invariant` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P078` | `exact-root-graph-runtime-failure-cleanup` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P079` | `exact-root-graph-runtime-readback-verification` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P080` | `exact-root-graph-runtime-finalizer-recomputation` | 생성된 candidate lock root graph를 package.json과 exact 비교한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P081` | `cache-acquisition-authority-owner` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P082` | `cache-acquisition-schema-identity` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P083` | `cache-acquisition-input-completeness` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P084` | `cache-acquisition-exact-identity` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P085` | `cache-acquisition-canonical-digest` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P086` | `cache-acquisition-path-normalization` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P087` | `cache-acquisition-environment-isolation` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P088` | `cache-acquisition-network-boundary` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P089` | `cache-acquisition-silent-fallback-zero` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P090` | `cache-acquisition-stable-error` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P091` | `cache-acquisition-negative-control` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P092` | `cache-acquisition-receipt-emission` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P093` | `cache-acquisition-receipt-self-hash` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P094` | `cache-acquisition-parent-lineage` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P095` | `cache-acquisition-mutation-zero` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P096` | `cache-acquisition-deterministic-replay` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P097` | `cache-acquisition-count-invariant` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P098` | `cache-acquisition-failure-cleanup` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P099` | `cache-acquisition-readback-verification` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P100` | `cache-acquisition-finalizer-recomputation` | 온라인 허용 구간에서만 cache closure를 획득하고 이후 freeze한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P101` | `offline-npm-ci-a-authority-owner` | workspace A에서 offline immutable npm ci를 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P102` | `offline-npm-ci-a-schema-identity` | workspace A에서 offline immutable npm ci를 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P103` | `offline-npm-ci-a-input-completeness` | workspace A에서 offline immutable npm ci를 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P104` | `offline-npm-ci-a-exact-identity` | workspace A에서 offline immutable npm ci를 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P105` | `offline-npm-ci-a-canonical-digest` | workspace A에서 offline immutable npm ci를 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P106` | `offline-npm-ci-a-path-normalization` | workspace A에서 offline immutable npm ci를 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P107` | `offline-npm-ci-a-environment-isolation` | workspace A에서 offline immutable npm ci를 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P108` | `offline-npm-ci-a-network-boundary` | workspace A에서 offline immutable npm ci를 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P109` | `offline-npm-ci-a-silent-fallback-zero` | workspace A에서 offline immutable npm ci를 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P110` | `offline-npm-ci-a-stable-error` | workspace A에서 offline immutable npm ci를 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P111` | `offline-npm-ci-a-negative-control` | workspace A에서 offline immutable npm ci를 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P112` | `offline-npm-ci-a-receipt-emission` | workspace A에서 offline immutable npm ci를 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P113` | `offline-npm-ci-a-receipt-self-hash` | workspace A에서 offline immutable npm ci를 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P114` | `offline-npm-ci-a-parent-lineage` | workspace A에서 offline immutable npm ci를 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P115` | `offline-npm-ci-a-mutation-zero` | workspace A에서 offline immutable npm ci를 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P116` | `offline-npm-ci-a-deterministic-replay` | workspace A에서 offline immutable npm ci를 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P117` | `offline-npm-ci-a-count-invariant` | workspace A에서 offline immutable npm ci를 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P118` | `offline-npm-ci-a-failure-cleanup` | workspace A에서 offline immutable npm ci를 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P119` | `offline-npm-ci-a-readback-verification` | workspace A에서 offline immutable npm ci를 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P120` | `offline-npm-ci-a-finalizer-recomputation` | workspace A에서 offline immutable npm ci를 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P121` | `offline-npm-ci-b-authority-owner` | workspace B에서 offline immutable npm ci를 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P122` | `offline-npm-ci-b-schema-identity` | workspace B에서 offline immutable npm ci를 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P123` | `offline-npm-ci-b-input-completeness` | workspace B에서 offline immutable npm ci를 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P124` | `offline-npm-ci-b-exact-identity` | workspace B에서 offline immutable npm ci를 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P125` | `offline-npm-ci-b-canonical-digest` | workspace B에서 offline immutable npm ci를 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P126` | `offline-npm-ci-b-path-normalization` | workspace B에서 offline immutable npm ci를 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P127` | `offline-npm-ci-b-environment-isolation` | workspace B에서 offline immutable npm ci를 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P128` | `offline-npm-ci-b-network-boundary` | workspace B에서 offline immutable npm ci를 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P129` | `offline-npm-ci-b-silent-fallback-zero` | workspace B에서 offline immutable npm ci를 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P130` | `offline-npm-ci-b-stable-error` | workspace B에서 offline immutable npm ci를 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P131` | `offline-npm-ci-b-negative-control` | workspace B에서 offline immutable npm ci를 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P132` | `offline-npm-ci-b-receipt-emission` | workspace B에서 offline immutable npm ci를 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P133` | `offline-npm-ci-b-receipt-self-hash` | workspace B에서 offline immutable npm ci를 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P134` | `offline-npm-ci-b-parent-lineage` | workspace B에서 offline immutable npm ci를 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P135` | `offline-npm-ci-b-mutation-zero` | workspace B에서 offline immutable npm ci를 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P136` | `offline-npm-ci-b-deterministic-replay` | workspace B에서 offline immutable npm ci를 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P137` | `offline-npm-ci-b-count-invariant` | workspace B에서 offline immutable npm ci를 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P138` | `offline-npm-ci-b-failure-cleanup` | workspace B에서 offline immutable npm ci를 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P139` | `offline-npm-ci-b-readback-verification` | workspace B에서 offline immutable npm ci를 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P140` | `offline-npm-ci-b-finalizer-recomputation` | workspace B에서 offline immutable npm ci를 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P141` | `install-graph-parity-authority-owner` | A/B package instance graph와 file content digest를 비교한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P142` | `install-graph-parity-schema-identity` | A/B package instance graph와 file content digest를 비교한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P143` | `install-graph-parity-input-completeness` | A/B package instance graph와 file content digest를 비교한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P144` | `install-graph-parity-exact-identity` | A/B package instance graph와 file content digest를 비교한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P145` | `install-graph-parity-canonical-digest` | A/B package instance graph와 file content digest를 비교한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P146` | `install-graph-parity-path-normalization` | A/B package instance graph와 file content digest를 비교한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P147` | `install-graph-parity-environment-isolation` | A/B package instance graph와 file content digest를 비교한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P148` | `install-graph-parity-network-boundary` | A/B package instance graph와 file content digest를 비교한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P149` | `install-graph-parity-silent-fallback-zero` | A/B package instance graph와 file content digest를 비교한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P150` | `install-graph-parity-stable-error` | A/B package instance graph와 file content digest를 비교한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P151` | `install-graph-parity-negative-control` | A/B package instance graph와 file content digest를 비교한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P152` | `install-graph-parity-receipt-emission` | A/B package instance graph와 file content digest를 비교한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P153` | `install-graph-parity-receipt-self-hash` | A/B package instance graph와 file content digest를 비교한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P154` | `install-graph-parity-parent-lineage` | A/B package instance graph와 file content digest를 비교한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P155` | `install-graph-parity-mutation-zero` | A/B package instance graph와 file content digest를 비교한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P156` | `install-graph-parity-deterministic-replay` | A/B package instance graph와 file content digest를 비교한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P157` | `install-graph-parity-count-invariant` | A/B package instance graph와 file content digest를 비교한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P158` | `install-graph-parity-failure-cleanup` | A/B package instance graph와 file content digest를 비교한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P159` | `install-graph-parity-readback-verification` | A/B package instance graph와 file content digest를 비교한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P160` | `install-graph-parity-finalizer-recomputation` | A/B package instance graph와 file content digest를 비교한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P161` | `lifecycle-replay-a-authority-owner` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P162` | `lifecycle-replay-a-schema-identity` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P163` | `lifecycle-replay-a-input-completeness` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P164` | `lifecycle-replay-a-exact-identity` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P165` | `lifecycle-replay-a-canonical-digest` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P166` | `lifecycle-replay-a-path-normalization` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P167` | `lifecycle-replay-a-environment-isolation` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P168` | `lifecycle-replay-a-network-boundary` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P169` | `lifecycle-replay-a-silent-fallback-zero` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P170` | `lifecycle-replay-a-stable-error` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P171` | `lifecycle-replay-a-negative-control` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P172` | `lifecycle-replay-a-receipt-emission` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P173` | `lifecycle-replay-a-receipt-self-hash` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P174` | `lifecycle-replay-a-parent-lineage` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P175` | `lifecycle-replay-a-mutation-zero` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P176` | `lifecycle-replay-a-deterministic-replay` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P177` | `lifecycle-replay-a-count-invariant` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P178` | `lifecycle-replay-a-failure-cleanup` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P179` | `lifecycle-replay-a-readback-verification` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P180` | `lifecycle-replay-a-finalizer-recomputation` | A에서 explicit lifecycle replay plan을 network-off로 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P181` | `lifecycle-replay-b-authority-owner` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P182` | `lifecycle-replay-b-schema-identity` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P183` | `lifecycle-replay-b-input-completeness` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P184` | `lifecycle-replay-b-exact-identity` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P185` | `lifecycle-replay-b-canonical-digest` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P186` | `lifecycle-replay-b-path-normalization` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P187` | `lifecycle-replay-b-environment-isolation` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P188` | `lifecycle-replay-b-network-boundary` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P189` | `lifecycle-replay-b-silent-fallback-zero` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P190` | `lifecycle-replay-b-stable-error` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P191` | `lifecycle-replay-b-negative-control` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P192` | `lifecycle-replay-b-receipt-emission` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P193` | `lifecycle-replay-b-receipt-self-hash` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P194` | `lifecycle-replay-b-parent-lineage` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P195` | `lifecycle-replay-b-mutation-zero` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P196` | `lifecycle-replay-b-deterministic-replay` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P197` | `lifecycle-replay-b-count-invariant` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P198` | `lifecycle-replay-b-failure-cleanup` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P199` | `lifecycle-replay-b-readback-verification` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P200` | `lifecycle-replay-b-finalizer-recomputation` | B에서 explicit lifecycle replay plan을 network-off로 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P201` | `lifecycle-parity-authority-owner` | A/B lifecycle output과 native prebuild materialization을 비교한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P202` | `lifecycle-parity-schema-identity` | A/B lifecycle output과 native prebuild materialization을 비교한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P203` | `lifecycle-parity-input-completeness` | A/B lifecycle output과 native prebuild materialization을 비교한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P204` | `lifecycle-parity-exact-identity` | A/B lifecycle output과 native prebuild materialization을 비교한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P205` | `lifecycle-parity-canonical-digest` | A/B lifecycle output과 native prebuild materialization을 비교한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P206` | `lifecycle-parity-path-normalization` | A/B lifecycle output과 native prebuild materialization을 비교한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P207` | `lifecycle-parity-environment-isolation` | A/B lifecycle output과 native prebuild materialization을 비교한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P208` | `lifecycle-parity-network-boundary` | A/B lifecycle output과 native prebuild materialization을 비교한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P209` | `lifecycle-parity-silent-fallback-zero` | A/B lifecycle output과 native prebuild materialization을 비교한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P210` | `lifecycle-parity-stable-error` | A/B lifecycle output과 native prebuild materialization을 비교한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P211` | `lifecycle-parity-negative-control` | A/B lifecycle output과 native prebuild materialization을 비교한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P212` | `lifecycle-parity-receipt-emission` | A/B lifecycle output과 native prebuild materialization을 비교한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P213` | `lifecycle-parity-receipt-self-hash` | A/B lifecycle output과 native prebuild materialization을 비교한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P214` | `lifecycle-parity-parent-lineage` | A/B lifecycle output과 native prebuild materialization을 비교한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P215` | `lifecycle-parity-mutation-zero` | A/B lifecycle output과 native prebuild materialization을 비교한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P216` | `lifecycle-parity-deterministic-replay` | A/B lifecycle output과 native prebuild materialization을 비교한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P217` | `lifecycle-parity-count-invariant` | A/B lifecycle output과 native prebuild materialization을 비교한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P218` | `lifecycle-parity-failure-cleanup` | A/B lifecycle output과 native prebuild materialization을 비교한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P219` | `lifecycle-parity-readback-verification` | A/B lifecycle output과 native prebuild materialization을 비교한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P220` | `lifecycle-parity-finalizer-recomputation` | A/B lifecycle output과 native prebuild materialization을 비교한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P221` | `node-toolchain-runtime-authority-owner` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P222` | `node-toolchain-runtime-schema-identity` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P223` | `node-toolchain-runtime-input-completeness` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P224` | `node-toolchain-runtime-exact-identity` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P225` | `node-toolchain-runtime-canonical-digest` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P226` | `node-toolchain-runtime-path-normalization` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P227` | `node-toolchain-runtime-environment-isolation` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P228` | `node-toolchain-runtime-network-boundary` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P229` | `node-toolchain-runtime-silent-fallback-zero` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P230` | `node-toolchain-runtime-stable-error` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P231` | `node-toolchain-runtime-negative-control` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P232` | `node-toolchain-runtime-receipt-emission` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P233` | `node-toolchain-runtime-receipt-self-hash` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P234` | `node-toolchain-runtime-parent-lineage` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P235` | `node-toolchain-runtime-mutation-zero` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P236` | `node-toolchain-runtime-deterministic-replay` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P237` | `node-toolchain-runtime-count-invariant` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P238` | `node-toolchain-runtime-failure-cleanup` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P239` | `node-toolchain-runtime-readback-verification` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P240` | `node-toolchain-runtime-finalizer-recomputation` | Node·npm·Vite·TypeScript·vue-tsc·Electron tool versions를 관측한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P241` | `msvc-toolchain-runtime-authority-owner` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P242` | `msvc-toolchain-runtime-schema-identity` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P243` | `msvc-toolchain-runtime-input-completeness` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P244` | `msvc-toolchain-runtime-exact-identity` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P245` | `msvc-toolchain-runtime-canonical-digest` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P246` | `msvc-toolchain-runtime-path-normalization` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P247` | `msvc-toolchain-runtime-environment-isolation` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P248` | `msvc-toolchain-runtime-network-boundary` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P249` | `msvc-toolchain-runtime-silent-fallback-zero` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P250` | `msvc-toolchain-runtime-stable-error` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P251` | `msvc-toolchain-runtime-negative-control` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P252` | `msvc-toolchain-runtime-receipt-emission` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P253` | `msvc-toolchain-runtime-receipt-self-hash` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P254` | `msvc-toolchain-runtime-parent-lineage` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P255` | `msvc-toolchain-runtime-mutation-zero` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P256` | `msvc-toolchain-runtime-deterministic-replay` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P257` | `msvc-toolchain-runtime-count-invariant` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P258` | `msvc-toolchain-runtime-failure-cleanup` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P259` | `msvc-toolchain-runtime-readback-verification` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P260` | `msvc-toolchain-runtime-finalizer-recomputation` | cl.exe·link.exe·rc.exe·Windows SDK·VC runtime identity를 관측한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P261` | `rust-toolchain-runtime-authority-owner` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P262` | `rust-toolchain-runtime-schema-identity` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P263` | `rust-toolchain-runtime-input-completeness` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P264` | `rust-toolchain-runtime-exact-identity` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P265` | `rust-toolchain-runtime-canonical-digest` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P266` | `rust-toolchain-runtime-path-normalization` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P267` | `rust-toolchain-runtime-environment-isolation` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P268` | `rust-toolchain-runtime-network-boundary` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P269` | `rust-toolchain-runtime-silent-fallback-zero` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P270` | `rust-toolchain-runtime-stable-error` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P271` | `rust-toolchain-runtime-negative-control` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P272` | `rust-toolchain-runtime-receipt-emission` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P273` | `rust-toolchain-runtime-receipt-self-hash` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P274` | `rust-toolchain-runtime-parent-lineage` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P275` | `rust-toolchain-runtime-mutation-zero` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P276` | `rust-toolchain-runtime-deterministic-replay` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P277` | `rust-toolchain-runtime-count-invariant` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P278` | `rust-toolchain-runtime-failure-cleanup` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P279` | `rust-toolchain-runtime-readback-verification` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P280` | `rust-toolchain-runtime-finalizer-recomputation` | rustc·cargo·target·Cargo.lock·compile flags를 관측한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P281` | `wasm-toolchain-runtime-authority-owner` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P282` | `wasm-toolchain-runtime-schema-identity` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P283` | `wasm-toolchain-runtime-input-completeness` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P284` | `wasm-toolchain-runtime-exact-identity` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P285` | `wasm-toolchain-runtime-canonical-digest` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P286` | `wasm-toolchain-runtime-path-normalization` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P287` | `wasm-toolchain-runtime-environment-isolation` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P288` | `wasm-toolchain-runtime-network-boundary` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P289` | `wasm-toolchain-runtime-silent-fallback-zero` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P290` | `wasm-toolchain-runtime-stable-error` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P291` | `wasm-toolchain-runtime-negative-control` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P292` | `wasm-toolchain-runtime-receipt-emission` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P293` | `wasm-toolchain-runtime-receipt-self-hash` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P294` | `wasm-toolchain-runtime-parent-lineage` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P295` | `wasm-toolchain-runtime-mutation-zero` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P296` | `wasm-toolchain-runtime-deterministic-replay` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P297` | `wasm-toolchain-runtime-count-invariant` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P298` | `wasm-toolchain-runtime-failure-cleanup` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P299` | `wasm-toolchain-runtime-readback-verification` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P300` | `wasm-toolchain-runtime-finalizer-recomputation` | wasm-pack·wasm-bindgen·wasm-opt 사용 여부와 output identity를 관측한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P301` | `native-addon-build-a-authority-owner` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P302` | `native-addon-build-a-schema-identity` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P303` | `native-addon-build-a-input-completeness` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P304` | `native-addon-build-a-exact-identity` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P305` | `native-addon-build-a-canonical-digest` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P306` | `native-addon-build-a-path-normalization` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P307` | `native-addon-build-a-environment-isolation` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P308` | `native-addon-build-a-network-boundary` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P309` | `native-addon-build-a-silent-fallback-zero` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P310` | `native-addon-build-a-stable-error` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P311` | `native-addon-build-a-negative-control` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P312` | `native-addon-build-a-receipt-emission` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P313` | `native-addon-build-a-receipt-self-hash` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P314` | `native-addon-build-a-parent-lineage` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P315` | `native-addon-build-a-mutation-zero` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P316` | `native-addon-build-a-deterministic-replay` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P317` | `native-addon-build-a-count-invariant` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P318` | `native-addon-build-a-failure-cleanup` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P319` | `native-addon-build-a-readback-verification` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P320` | `native-addon-build-a-finalizer-recomputation` | A에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P321` | `native-addon-build-b-authority-owner` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P322` | `native-addon-build-b-schema-identity` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P323` | `native-addon-build-b-input-completeness` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P324` | `native-addon-build-b-exact-identity` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P325` | `native-addon-build-b-canonical-digest` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P326` | `native-addon-build-b-path-normalization` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P327` | `native-addon-build-b-environment-isolation` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P328` | `native-addon-build-b-network-boundary` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P329` | `native-addon-build-b-silent-fallback-zero` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P330` | `native-addon-build-b-stable-error` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P331` | `native-addon-build-b-negative-control` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P332` | `native-addon-build-b-receipt-emission` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P333` | `native-addon-build-b-receipt-self-hash` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P334` | `native-addon-build-b-parent-lineage` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P335` | `native-addon-build-b-mutation-zero` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P336` | `native-addon-build-b-deterministic-replay` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P337` | `native-addon-build-b-count-invariant` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P338` | `native-addon-build-b-failure-cleanup` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P339` | `native-addon-build-b-readback-verification` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P340` | `native-addon-build-b-finalizer-recomputation` | B에서 x86_64-pc-windows-msvc N-API release addon을 빌드한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P341` | `native-artifact-parity-authority-owner` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P342` | `native-artifact-parity-schema-identity` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P343` | `native-artifact-parity-input-completeness` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P344` | `native-artifact-parity-exact-identity` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P345` | `native-artifact-parity-canonical-digest` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P346` | `native-artifact-parity-path-normalization` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P347` | `native-artifact-parity-environment-isolation` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P348` | `native-artifact-parity-network-boundary` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P349` | `native-artifact-parity-silent-fallback-zero` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P350` | `native-artifact-parity-stable-error` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P351` | `native-artifact-parity-negative-control` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P352` | `native-artifact-parity-receipt-emission` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P353` | `native-artifact-parity-receipt-self-hash` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P354` | `native-artifact-parity-parent-lineage` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P355` | `native-artifact-parity-mutation-zero` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P356` | `native-artifact-parity-deterministic-replay` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P357` | `native-artifact-parity-count-invariant` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P358` | `native-artifact-parity-failure-cleanup` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P359` | `native-artifact-parity-readback-verification` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P360` | `native-artifact-parity-finalizer-recomputation` | A/B .node·WASM·JS glue·native metadata bytes를 비교한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P361` | `typecheck-a-authority-owner` | A에서 vue-tsc strict typecheck를 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P362` | `typecheck-a-schema-identity` | A에서 vue-tsc strict typecheck를 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P363` | `typecheck-a-input-completeness` | A에서 vue-tsc strict typecheck를 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P364` | `typecheck-a-exact-identity` | A에서 vue-tsc strict typecheck를 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P365` | `typecheck-a-canonical-digest` | A에서 vue-tsc strict typecheck를 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P366` | `typecheck-a-path-normalization` | A에서 vue-tsc strict typecheck를 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P367` | `typecheck-a-environment-isolation` | A에서 vue-tsc strict typecheck를 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P368` | `typecheck-a-network-boundary` | A에서 vue-tsc strict typecheck를 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P369` | `typecheck-a-silent-fallback-zero` | A에서 vue-tsc strict typecheck를 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P370` | `typecheck-a-stable-error` | A에서 vue-tsc strict typecheck를 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P371` | `typecheck-a-negative-control` | A에서 vue-tsc strict typecheck를 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P372` | `typecheck-a-receipt-emission` | A에서 vue-tsc strict typecheck를 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P373` | `typecheck-a-receipt-self-hash` | A에서 vue-tsc strict typecheck를 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P374` | `typecheck-a-parent-lineage` | A에서 vue-tsc strict typecheck를 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P375` | `typecheck-a-mutation-zero` | A에서 vue-tsc strict typecheck를 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P376` | `typecheck-a-deterministic-replay` | A에서 vue-tsc strict typecheck를 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P377` | `typecheck-a-count-invariant` | A에서 vue-tsc strict typecheck를 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P378` | `typecheck-a-failure-cleanup` | A에서 vue-tsc strict typecheck를 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P379` | `typecheck-a-readback-verification` | A에서 vue-tsc strict typecheck를 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P380` | `typecheck-a-finalizer-recomputation` | A에서 vue-tsc strict typecheck를 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P381` | `typecheck-b-authority-owner` | B에서 vue-tsc strict typecheck를 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P382` | `typecheck-b-schema-identity` | B에서 vue-tsc strict typecheck를 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P383` | `typecheck-b-input-completeness` | B에서 vue-tsc strict typecheck를 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P384` | `typecheck-b-exact-identity` | B에서 vue-tsc strict typecheck를 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P385` | `typecheck-b-canonical-digest` | B에서 vue-tsc strict typecheck를 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P386` | `typecheck-b-path-normalization` | B에서 vue-tsc strict typecheck를 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P387` | `typecheck-b-environment-isolation` | B에서 vue-tsc strict typecheck를 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P388` | `typecheck-b-network-boundary` | B에서 vue-tsc strict typecheck를 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P389` | `typecheck-b-silent-fallback-zero` | B에서 vue-tsc strict typecheck를 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P390` | `typecheck-b-stable-error` | B에서 vue-tsc strict typecheck를 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P391` | `typecheck-b-negative-control` | B에서 vue-tsc strict typecheck를 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P392` | `typecheck-b-receipt-emission` | B에서 vue-tsc strict typecheck를 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P393` | `typecheck-b-receipt-self-hash` | B에서 vue-tsc strict typecheck를 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P394` | `typecheck-b-parent-lineage` | B에서 vue-tsc strict typecheck를 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P395` | `typecheck-b-mutation-zero` | B에서 vue-tsc strict typecheck를 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P396` | `typecheck-b-deterministic-replay` | B에서 vue-tsc strict typecheck를 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P397` | `typecheck-b-count-invariant` | B에서 vue-tsc strict typecheck를 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P398` | `typecheck-b-failure-cleanup` | B에서 vue-tsc strict typecheck를 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P399` | `typecheck-b-readback-verification` | B에서 vue-tsc strict typecheck를 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P400` | `typecheck-b-finalizer-recomputation` | B에서 vue-tsc strict typecheck를 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P401` | `renderer-emit-a-authority-owner` | A에서 production Vite·worker·WASM emit을 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P402` | `renderer-emit-a-schema-identity` | A에서 production Vite·worker·WASM emit을 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P403` | `renderer-emit-a-input-completeness` | A에서 production Vite·worker·WASM emit을 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P404` | `renderer-emit-a-exact-identity` | A에서 production Vite·worker·WASM emit을 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P405` | `renderer-emit-a-canonical-digest` | A에서 production Vite·worker·WASM emit을 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P406` | `renderer-emit-a-path-normalization` | A에서 production Vite·worker·WASM emit을 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P407` | `renderer-emit-a-environment-isolation` | A에서 production Vite·worker·WASM emit을 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P408` | `renderer-emit-a-network-boundary` | A에서 production Vite·worker·WASM emit을 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P409` | `renderer-emit-a-silent-fallback-zero` | A에서 production Vite·worker·WASM emit을 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P410` | `renderer-emit-a-stable-error` | A에서 production Vite·worker·WASM emit을 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P411` | `renderer-emit-a-negative-control` | A에서 production Vite·worker·WASM emit을 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P412` | `renderer-emit-a-receipt-emission` | A에서 production Vite·worker·WASM emit을 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P413` | `renderer-emit-a-receipt-self-hash` | A에서 production Vite·worker·WASM emit을 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P414` | `renderer-emit-a-parent-lineage` | A에서 production Vite·worker·WASM emit을 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P415` | `renderer-emit-a-mutation-zero` | A에서 production Vite·worker·WASM emit을 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P416` | `renderer-emit-a-deterministic-replay` | A에서 production Vite·worker·WASM emit을 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P417` | `renderer-emit-a-count-invariant` | A에서 production Vite·worker·WASM emit을 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P418` | `renderer-emit-a-failure-cleanup` | A에서 production Vite·worker·WASM emit을 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P419` | `renderer-emit-a-readback-verification` | A에서 production Vite·worker·WASM emit을 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P420` | `renderer-emit-a-finalizer-recomputation` | A에서 production Vite·worker·WASM emit을 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P421` | `renderer-emit-b-authority-owner` | B에서 production Vite·worker·WASM emit을 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P422` | `renderer-emit-b-schema-identity` | B에서 production Vite·worker·WASM emit을 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P423` | `renderer-emit-b-input-completeness` | B에서 production Vite·worker·WASM emit을 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P424` | `renderer-emit-b-exact-identity` | B에서 production Vite·worker·WASM emit을 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P425` | `renderer-emit-b-canonical-digest` | B에서 production Vite·worker·WASM emit을 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P426` | `renderer-emit-b-path-normalization` | B에서 production Vite·worker·WASM emit을 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P427` | `renderer-emit-b-environment-isolation` | B에서 production Vite·worker·WASM emit을 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P428` | `renderer-emit-b-network-boundary` | B에서 production Vite·worker·WASM emit을 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P429` | `renderer-emit-b-silent-fallback-zero` | B에서 production Vite·worker·WASM emit을 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P430` | `renderer-emit-b-stable-error` | B에서 production Vite·worker·WASM emit을 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P431` | `renderer-emit-b-negative-control` | B에서 production Vite·worker·WASM emit을 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P432` | `renderer-emit-b-receipt-emission` | B에서 production Vite·worker·WASM emit을 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P433` | `renderer-emit-b-receipt-self-hash` | B에서 production Vite·worker·WASM emit을 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P434` | `renderer-emit-b-parent-lineage` | B에서 production Vite·worker·WASM emit을 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P435` | `renderer-emit-b-mutation-zero` | B에서 production Vite·worker·WASM emit을 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P436` | `renderer-emit-b-deterministic-replay` | B에서 production Vite·worker·WASM emit을 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P437` | `renderer-emit-b-count-invariant` | B에서 production Vite·worker·WASM emit을 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P438` | `renderer-emit-b-failure-cleanup` | B에서 production Vite·worker·WASM emit을 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P439` | `renderer-emit-b-readback-verification` | B에서 production Vite·worker·WASM emit을 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P440` | `renderer-emit-b-finalizer-recomputation` | B에서 production Vite·worker·WASM emit을 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P441` | `electron-unpacked-a-authority-owner` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P442` | `electron-unpacked-a-schema-identity` | A에서 electron-builder win32-x64 unpacked package를 생성한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P443` | `electron-unpacked-a-input-completeness` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P444` | `electron-unpacked-a-exact-identity` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P445` | `electron-unpacked-a-canonical-digest` | A에서 electron-builder win32-x64 unpacked package를 생성한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P446` | `electron-unpacked-a-path-normalization` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P447` | `electron-unpacked-a-environment-isolation` | A에서 electron-builder win32-x64 unpacked package를 생성한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P448` | `electron-unpacked-a-network-boundary` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P449` | `electron-unpacked-a-silent-fallback-zero` | A에서 electron-builder win32-x64 unpacked package를 생성한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P450` | `electron-unpacked-a-stable-error` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P451` | `electron-unpacked-a-negative-control` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P452` | `electron-unpacked-a-receipt-emission` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P453` | `electron-unpacked-a-receipt-self-hash` | A에서 electron-builder win32-x64 unpacked package를 생성한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P454` | `electron-unpacked-a-parent-lineage` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P455` | `electron-unpacked-a-mutation-zero` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P456` | `electron-unpacked-a-deterministic-replay` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P457` | `electron-unpacked-a-count-invariant` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P458` | `electron-unpacked-a-failure-cleanup` | A에서 electron-builder win32-x64 unpacked package를 생성한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P459` | `electron-unpacked-a-readback-verification` | A에서 electron-builder win32-x64 unpacked package를 생성한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P460` | `electron-unpacked-a-finalizer-recomputation` | A에서 electron-builder win32-x64 unpacked package를 생성한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P461` | `electron-unpacked-b-authority-owner` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P462` | `electron-unpacked-b-schema-identity` | B에서 electron-builder win32-x64 unpacked package를 생성한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P463` | `electron-unpacked-b-input-completeness` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P464` | `electron-unpacked-b-exact-identity` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P465` | `electron-unpacked-b-canonical-digest` | B에서 electron-builder win32-x64 unpacked package를 생성한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P466` | `electron-unpacked-b-path-normalization` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P467` | `electron-unpacked-b-environment-isolation` | B에서 electron-builder win32-x64 unpacked package를 생성한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P468` | `electron-unpacked-b-network-boundary` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P469` | `electron-unpacked-b-silent-fallback-zero` | B에서 electron-builder win32-x64 unpacked package를 생성한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P470` | `electron-unpacked-b-stable-error` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P471` | `electron-unpacked-b-negative-control` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P472` | `electron-unpacked-b-receipt-emission` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P473` | `electron-unpacked-b-receipt-self-hash` | B에서 electron-builder win32-x64 unpacked package를 생성한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P474` | `electron-unpacked-b-parent-lineage` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P475` | `electron-unpacked-b-mutation-zero` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P476` | `electron-unpacked-b-deterministic-replay` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P477` | `electron-unpacked-b-count-invariant` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P478` | `electron-unpacked-b-failure-cleanup` | B에서 electron-builder win32-x64 unpacked package를 생성한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P479` | `electron-unpacked-b-readback-verification` | B에서 electron-builder win32-x64 unpacked package를 생성한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P480` | `electron-unpacked-b-finalizer-recomputation` | B에서 electron-builder win32-x64 unpacked package를 생성한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P481` | `production-build-parity-authority-owner` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P482` | `production-build-parity-schema-identity` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P483` | `production-build-parity-input-completeness` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P484` | `production-build-parity-exact-identity` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P485` | `production-build-parity-canonical-digest` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P486` | `production-build-parity-path-normalization` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P487` | `production-build-parity-environment-isolation` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P488` | `production-build-parity-network-boundary` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P489` | `production-build-parity-silent-fallback-zero` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P490` | `production-build-parity-stable-error` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P491` | `production-build-parity-negative-control` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P492` | `production-build-parity-receipt-emission` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P493` | `production-build-parity-receipt-self-hash` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P494` | `production-build-parity-parent-lineage` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P495` | `production-build-parity-mutation-zero` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P496` | `production-build-parity-deterministic-replay` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P497` | `production-build-parity-count-invariant` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P498` | `production-build-parity-failure-cleanup` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P499` | `production-build-parity-readback-verification` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P500` | `production-build-parity-finalizer-recomputation` | A/B runtime closure·ASAR·native addon·worker·WASM digests를 비교한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P501` | `zero-mutation-runtime-authority-owner` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P502` | `zero-mutation-runtime-schema-identity` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P503` | `zero-mutation-runtime-input-completeness` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P504` | `zero-mutation-runtime-exact-identity` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P505` | `zero-mutation-runtime-canonical-digest` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P506` | `zero-mutation-runtime-path-normalization` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P507` | `zero-mutation-runtime-environment-isolation` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P508` | `zero-mutation-runtime-network-boundary` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P509` | `zero-mutation-runtime-silent-fallback-zero` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P510` | `zero-mutation-runtime-stable-error` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P511` | `zero-mutation-runtime-negative-control` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P512` | `zero-mutation-runtime-receipt-emission` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P513` | `zero-mutation-runtime-receipt-self-hash` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P514` | `zero-mutation-runtime-parent-lineage` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P515` | `zero-mutation-runtime-mutation-zero` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P516` | `zero-mutation-runtime-deterministic-replay` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P517` | `zero-mutation-runtime-count-invariant` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P518` | `zero-mutation-runtime-failure-cleanup` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P519` | `zero-mutation-runtime-readback-verification` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P520` | `zero-mutation-runtime-finalizer-recomputation` | 모든 실행 단계 전후 authority 파일과 source tree mutation zero를 확인한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P521` | `lock-cas-promotion-authority-owner` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P522` | `lock-cas-promotion-schema-identity` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P523` | `lock-cas-promotion-input-completeness` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P524` | `lock-cas-promotion-exact-identity` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P525` | `lock-cas-promotion-canonical-digest` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P526` | `lock-cas-promotion-path-normalization` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P527` | `lock-cas-promotion-environment-isolation` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P528` | `lock-cas-promotion-network-boundary` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P529` | `lock-cas-promotion-silent-fallback-zero` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P530` | `lock-cas-promotion-stable-error` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P531` | `lock-cas-promotion-negative-control` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P532` | `lock-cas-promotion-receipt-emission` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P533` | `lock-cas-promotion-receipt-self-hash` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P534` | `lock-cas-promotion-parent-lineage` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P535` | `lock-cas-promotion-mutation-zero` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P536` | `lock-cas-promotion-deterministic-replay` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P537` | `lock-cas-promotion-count-invariant` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P538` | `lock-cas-promotion-failure-cleanup` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P539` | `lock-cas-promotion-readback-verification` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P540` | `lock-cas-promotion-finalizer-recomputation` | candidate lock을 expected-old SHA CAS로 원본 package-lock에 atomic promotion한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P541` | `post-promotion-replay-authority-owner` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P542` | `post-promotion-replay-schema-identity` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P543` | `post-promotion-replay-input-completeness` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P544` | `post-promotion-replay-exact-identity` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P545` | `post-promotion-replay-canonical-digest` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P546` | `post-promotion-replay-path-normalization` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P547` | `post-promotion-replay-environment-isolation` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P548` | `post-promotion-replay-network-boundary` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P549` | `post-promotion-replay-silent-fallback-zero` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P550` | `post-promotion-replay-stable-error` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P551` | `post-promotion-replay-negative-control` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P552` | `post-promotion-replay-receipt-emission` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P553` | `post-promotion-replay-receipt-self-hash` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P554` | `post-promotion-replay-parent-lineage` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P555` | `post-promotion-replay-mutation-zero` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P556` | `post-promotion-replay-deterministic-replay` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P557` | `post-promotion-replay-count-invariant` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P558` | `post-promotion-replay-failure-cleanup` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P559` | `post-promotion-replay-readback-verification` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P560` | `post-promotion-replay-finalizer-recomputation` | 승격된 lock으로 fresh npm ci와 build를 다시 실행한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |
| `BLR2-P561` | `production-admission-finalizer-authority-owner` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 권위 소유자와 유일 writer가 명시되어야 한다. |
| `BLR2-P562` | `production-admission-finalizer-schema-identity` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. schemaVersion과 schemaId가 exact match여야 한다. |
| `BLR2-P563` | `production-admission-finalizer-input-completeness` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 필수 입력이 누락 없이 열거되고 unknown은 fail-closed여야 한다. |
| `BLR2-P564` | `production-admission-finalizer-exact-identity` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 관측 identity가 expected identity와 exact match여야 한다. |
| `BLR2-P565` | `production-admission-finalizer-canonical-digest` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. canonical serialization과 SHA-256 digest가 재현되어야 한다. |
| `BLR2-P566` | `production-admission-finalizer-path-normalization` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 절대경로·임시경로가 canonical identity에 섞이지 않아야 한다. |
| `BLR2-P567` | `production-admission-finalizer-environment-isolation` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. ambient 환경과 사용자 설정이 권위 입력에서 제거되어야 한다. |
| `BLR2-P568` | `production-admission-finalizer-network-boundary` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 허용된 network phase 외 네트워크 접근은 0이어야 한다. |
| `BLR2-P569` | `production-admission-finalizer-silent-fallback-zero` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. silent fallback, best-effort success, 자동 범위 완화가 0이어야 한다. |
| `BLR2-P570` | `production-admission-finalizer-stable-error` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 실패는 지정된 stable error code로 종료되어야 한다. |
| `BLR2-P571` | `production-admission-finalizer-negative-control` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 의도적 변조 fixture가 반드시 거부되어야 한다. |
| `BLR2-P572` | `production-admission-finalizer-receipt-emission` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 성공·실패 모두 구조화된 receipt를 발행해야 한다. |
| `BLR2-P573` | `production-admission-finalizer-receipt-self-hash` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. receipt self-hash와 child digest가 readback에서 검증되어야 한다. |
| `BLR2-P574` | `production-admission-finalizer-parent-lineage` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 부모·선행 artifact digest와 current lineage가 exact해야 한다. |
| `BLR2-P575` | `production-admission-finalizer-mutation-zero` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 권위 파일과 source bytes의 비인가 mutation count가 0이어야 한다. |
| `BLR2-P576` | `production-admission-finalizer-deterministic-replay` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 독립 실행 A/B가 동일한 semantic 결과를 재현해야 한다. |
| `BLR2-P577` | `production-admission-finalizer-count-invariant` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 예상 file·package·script·artifact count가 정확히 일치해야 한다. |
| `BLR2-P578` | `production-admission-finalizer-failure-cleanup` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. 실패 후 temp·lock·partial output이 정상 승격 경로에 남지 않아야 한다. |
| `BLR2-P579` | `production-admission-finalizer-readback-verification` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. write 이후 disk readback과 digest 재계산이 통과해야 한다. |
| `BLR2-P580` | `production-admission-finalizer-finalizer-recomputation` | finalizer가 전체 raw receipt chain을 재검증해 production admission을 발급한다. finalizer는 외부 summary boolean을 믿지 않고 원본을 재계산해야 한다. |

## 26. Source Acceptance

```text
BUILD_LOCK_R2_EXACT_ROOT_GRAPH_AND_PRODUCTION_ADMISSION_HARNESS_SOURCE_SEALED_AWAITING_CANONICAL_WIN32_X64

420 SOURCE PASS
580 WIN32 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

packageLockPromoted = false
productionBuildAdmitted = false
historicalPassCarryForward = 0
productionPointerMutated = false
localActivationPointerMutated = false
```

Source bake는 candidate lock 또는 실제 Win32 install 결과를 만들어낸 척해서는 안 된다. 현재 package-lock은 source acceptance 시점에 그대로 보존한다.

## 27. Final Win32-x64 Acceptance

```text
BUILD_LOCK_R2_EXACT_ROOT_GRAPH_DUAL_INSTALL_NATIVE_TOOLCHAIN_AND_PRODUCTION_BUILD_ADMITTED_AWAITING_R9A_PHYSICAL

420 SOURCE PASS
580 WIN32 PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

rootDependencyGraphExact = true
offlineInstallAComplete = true
offlineInstallBComplete = true
installContentParity = true
lifecycleReplayParity = true
nativeToolchainClosed = true
nativeArtifactParity = true
productionBuildParity = true
lockMutationZeroBeforePromotion = true
packageLockPromoted = true
postPromotionReplayPassed = true
productionBuildAdmitted = true
historicalPassCarryForward = 0
```

## 28. 완료 게이트

R2 완료는 다음을 동시에 의미한다.

1. 12건의 root graph mismatch가 0이 된다.
2. canonical npm ci A/B가 Win32-x64에서 동일 install graph와 content digest를 만든다.
3. lifecycle replay A/B가 동일한 binary materialization을 만든다.
4. MSVC·Rust·WASM toolchain이 receipt로 닫힌다.
5. native addon·WASM·renderer·Electron unpacked bytes가 A/B에서 재현된다.
6. package.json과 Cargo authority는 mutation zero다.
7. package-lock은 expected-old SHA CAS 한 번으로만 승격된다.
8. 승격된 lock으로 post-promotion replay가 통과한다.
9. production build admission receipt가 raw child chain을 재계산한다.
10. R9A physical runner가 이 receipt 없이는 시작하지 않는다.

## 29. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R9A-P1

Packaged Product Graph Instrumentation /
Single Encoder·Single Submit Observation /
Validation Counter Fault Injection /
Uniform Ring Lifetime /
Timestamp Performance /
Residency Plateau /
Device-Loss Recovery Physical Seal
```

R2가 닫히기 전에는 R9A physical, R10A release rebuild, R14A package signing을 실행하지 않는다.
