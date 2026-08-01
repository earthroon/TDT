# TDT-RESAMPLE-RUNTIME-01-R12

## Atomic Update Installation / Staged Package Activation / Cross-Generation Asset Exclusion / Interrupted-Update Recovery / Installed Attestation Handoff Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R12`
- **Source parent:** `TDT-RESAMPLE-RUNTIME-01-R11`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R11_INSTALLED_ATTESTATION_QUARANTINE_SOURCE_BAKED_AWAITING_R10.zip`
- **Parent repository bundle SHA-256:** `8c87d8fd14fced8a3064bef24eb038c44aea3cab42e36b92ac0e09d945ee037f`
- **Parent R11 specification SHA-256:** `b76dbb1c914758825c7e0ce37e4ed53e46eb85309f13aa67f4a721e2ab13ba19`
- **Parent R11 source final receipt SHA-256:** `755281a73d3ec201dfdf94e6f94c52f4a6a0f6a599f5f21dab296972b92e273e`
- **Current source predecessor state:** `RESAMPLE_RUNTIME_R11_ATTESTATION_HARNESS_SOURCE_BAKED_AWAITING_R10_PRODUCTION_RELEASE`
- **Required active-install predecessor state:** `RESAMPLE_RUNTIME_R11_INSTALLED_RUNTIME_ATTESTATION_AND_QUARANTINE_SEALED`
- **Required target-release predecessor state:** `RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED`
- **R12 source-harness state:** `RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_HARNESS_SOURCE_BAKED_AWAITING_QUALIFIED_RELEASE_AND_R11_ACTIVE_INSTALLATION`
- **R12 staged state:** `RESAMPLE_RUNTIME_R12_TARGET_PACKAGE_STAGED_AND_CLOSURE_VERIFIED`
- **R12 staged-canary state:** `RESAMPLE_RUNTIME_R12_STAGED_PACKAGE_CANARY_PASS_ACTIVATION_READY`
- **R12 handoff state:** `RESAMPLE_RUNTIME_R12_ACTIVATION_COMMITTED_AWAITING_R11_HANDOFF`
- **R12 local-recovery state:** `RESAMPLE_RUNTIME_R12_LOCAL_RECOVERY_ONLY_PREVIOUS_PACKAGE_RESTORED`
- **R12 quarantine state:** `RESAMPLE_RUNTIME_R12_TARGET_INSTALLATION_QUARANTINED_ROLLBACK_RECOMMENDED`
- **R12 final state:** `RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_INSTALLATION_AND_ATTESTATION_HANDOFF_SEALED`
- **Rejected state:** `RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_REJECTED`
- **Production release selection authority:** `dadum.export.production-pointer`, R10 only
- **Local installation selection authority:** `dadum.install.activation-pointer`, R12 only
- **Runtime admission authority:** R11 only
- **R12 Production Pointer mutation:** forbidden
- **Canonical update profile:** `tdt.resample-runtime.atomic-update.r12.v1`
- **Source mandatory gates:** `168`
- **Installed mandatory gates:** `358`
- **Total gates:** `526`

---

# 0. Executive Contract

R12는 R10이 승인한 whole-build package를 Windows 설치 루트에 안전하게 배치하고, 설치 세대가 섞이지 않은 단일 package generation으로만 실행되도록 보장하는 local update authority다. R12는 release를 선택하지 않고, R10 Production Pointer가 이미 선택한 target package를 로컬 설치에 반영한다. R12는 runtime correctness를 승인하지 않고, 활성화된 package를 R11 installed attestation과 startup canary에 넘긴다.

R12의 핵심 문제는 단순한 파일 복사가 아니다. 업데이트 도중 다음 혼종이 생기면 EWA 수학과 R9 물리 증거가 모두 무효가 된다.

```text
new app.asar
+ old renderer chunk
+ old worker
+ new WGSL manifest
+ old WGSL file
+ new WASM
+ old pthread helper
+ old native addon
```

R12는 package 파일을 현재 실행 디렉터리에 덮어쓰지 않는다. 각 whole-build package는 `packageContentId`로 식별되는 불변 디렉터리에 설치하며, 실제 activation commit point는 작은 local activation pointer의 compare-and-swap이다.

```text
immutable target package staged and verified
    ↓
staged package executes only its own assets
    ↓
staged R11 canary passes
    ↓
all application processes and file handles quiesce
    ↓
local activation pointer CAS
    ↓
new package relaunch
    ↓
R11 installed attestation and startup canary
    ↓
R11 session admission token
    ↓
R12 transaction COMMITTED
```

R12는 local activation pointer만 쓸 수 있다. R10 Production Pointer는 읽고 검증하지만 절대 쓰지 않는다. R11이 target package를 quarantine하면 R12는 이전 package를 로컬 recovery target으로 복원할 수 있으나, R10 pointer가 여전히 target package를 선택하는 동안 이전 package에 정상 Preview·Export admission을 발급할 수 없다. 이 상태는 updater와 recovery UI만 사용할 수 있는 `LOCAL_RECOVERY_ONLY`다. 정상 runtime rollback은 R11 recommendation과 operator approval을 거쳐 R10 CAS가 수행해야 한다.

# 1. Parent Truth and Current Repository Facts

현재 제공된 R11 bundle은 source harness 상태다. R10 final production release와 R11 installed final receipt는 아직 존재하지 않는다. 현재 확인된 사실은 다음과 같다.

```text
R11 state = RESAMPLE_RUNTIME_R11_ATTESTATION_HARNESS_SOURCE_BAKED_AWAITING_R10_PRODUCTION_RELEASE
R11 SOURCE PASS = 148
R11 INSTALLED PENDING = 228
R11 FAIL = 0
R11 productionPointerMutated = false

R10 source state = RESAMPLE_RUNTIME_R10_PROMOTION_HARNESS_SOURCE_BAKED_AWAITING_R9_PHYSICAL_RECEIPT
R10 SOURCE PASS = 129
R10 RELEASE PENDING = 202

Production Pointer schema = 2
Production Pointer activeBuildId = null
Production Pointer activePackageContentId = null
Production Pointer raw SHA-256 = 1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8
```

따라서 R12 source harness와 계약은 작성할 수 있지만 실제 target package staging, local activation, R11 handoff를 실행할 수 없다. Installed gate 358개는 R10 final release와 R11 admitted active installation이 제공되기 전까지 전부 `PENDING`이다.

# 2. Scope

- R10 active target package와 immutable release receipt admission;
- R11이 admit한 현재 active installation과 local activation pointer admission;
- 동일 volume의 content-addressed package store와 isolated staging area;
- update transaction identity, append-only journal, hash chain, monotonic state machine;
- package archive 또는 directory의 path canonicalization과 full closure SHA-256 검증;
- staged package가 active package의 worker, WASM, native addon, WGSL, cache를 빌리지 않는 격리 실행;
- staged hardware GPU startup canary와 Preview·Export smoke;
- process drain, worker termination, native handle release, file-lock zero;
- local activation pointer raw-hash·generation CAS;
- activation 이후 R11 installed attestation handoff와 session token 수신;
- process kill, crash, power-loss equivalent boundary에 대한 deterministic recovery;
- renderer·worker·WASM·WGSL·native addon·pipeline cache의 cross-generation exclusion;
- previous package retention, recovery-only restore, garbage-collection receipt;
- R10 pointer mutation zero와 local privacy boundary.

# 3. Non-Goals

- package 다운로드 프로토콜 또는 CDN 설계;
- Production Pointer 자동 변경;
- R10 promotion·rollback CAS 복제;
- R11 correctness gate 우회;
- active package 파일의 in-place overwrite;
- hot patch, delta patch, binary diff patch;
- 실행 중인 native addon 또는 DLL 교체;
- source tree, Vite dev server, unpacked development asset 사용;
- CPU·Canvas·WebGL·legacy shader fallback;
- semantic version만으로 release qualification 판단;
- R10 pointer와 불일치하는 previous package의 정상 runtime admission;
- 사용자 이미지, 파일명, 경로, 픽셀 hash 수집;
- 네트워크 telemetry;
- 코드 서명 체계의 신규 발명. 서명이 존재하면 증거로 기록할 수 있으나 R12의 digest authority를 대체하지 않는다.

# 4. Authority Separation

## 4.1 R10 Production Release Authority

`dadum.export.production-pointer`는 어떤 whole-build package가 production target인지 결정한다. R12는 activation 직전과 직후 이 pointer의 raw SHA-256, self-hash, generation, active build/package를 재검증한다. R12는 이 파일을 쓰지 않는다.

## 4.2 R12 Local Installation Authority

`dadum.install.activation-pointer`는 이 컴퓨터의 stable launcher가 어떤 immutable package directory를 실행할지 결정한다. Local pointer는 immutable package root를 선택할 뿐 runtime eligibility를 선언하지 않는다. R10 active package와 일치하는 `NORMAL` selection만 R11 admission을 시도할 수 있고, `RECOVERY_ONLY` selection은 updater·diagnostic에만 사용한다.

## 4.3 R11 Runtime Admission Authority

Local activation pointer가 target package를 선택했다는 사실만으로 Preview·Export를 허용하지 않는다. R11 installed artifact attestation과 startup canary가 PASS하고 session admission token을 발급해야 한다.

## 4.4 Recovery-Only Authority

R12는 activation 실패 후 previous package를 local pointer에 복원할 수 있다. 다만 R10 Production Pointer가 previous package로 돌아오지 않았다면 launcher는 updater·diagnostic·rollback recommendation UI만 실행한다. EWA Preview·Export는 계속 차단된다.

# 5. Canonical Installation Layout

```text
<installRoot>/
  launcher/
    DadumLauncher.exe
    launcher-manifest.json
  packages/
    <packageContentId>/
      app.asar
      resources/
      ... immutable package closure ...
  staging/
    <updateTransactionId>/
      payload.partial/
      payload.verified/
      staging-manifest.json
  state/
    INSTALL_ACTIVATION_POINTER.json
    update-journal/
      <updateTransactionId>.jsonl
    transactions/
      <updateTransactionId>.json
    locks/
      update.lock
    quarantine/
    retention/
  logs/
    local-update/
```

`active/`라는 mutable package directory를 SSOT로 사용하지 않는다. Logical active package는 local activation pointer가 가리키는 `packages/<packageContentId>/`다. Package directory는 activation 이후 read-only immutable closure로 취급한다.

Launcher와 state directory는 package generation 밖에 존재한다. Launcher는 local pointer를 한 번 읽고 self-hash와 raw hash를 검증한 뒤, 절대 경로 package root와 launch envelope를 child process에 전달한다.

# 6. Local Activation Pointer v1

Canonical schema ID:

```text
tdt.install.activation-pointer.r12.v1
```

Canonical pointer ID:

```text
dadum.install.activation-pointer
```

필수 필드:

```text
schemaVersion = 1
pointerId
installGeneration
activeBuildId
activePackageContentId
activePackageRootRelative
activeTransactionId
selectionMode = NORMAL | RECOVERY_ONLY
previousBuildId
previousPackageContentId
previousPackageRootRelative
productionPointerGeneration
productionPointerRawSha256
r10FinalReleaseReceiptSha256
r11InstalledReceiptSha256 | null
activationReceiptSha256
updatedAt
pointerSha256
```

`pointerSha256`는 자기 필드를 제외한 canonical JSON의 SHA-256이다. 파일 자체 raw SHA-256도 CAS input으로 별도 기록한다.

Local pointer CAS 조건:

```text
expected raw file SHA-256 matches
AND expected installGeneration matches
AND global update lock held
AND R10 pointer generation matches activation intent
AND target packageContentId matches R10 active packageContentId
AND target immutable package closure verified
AND staged canary passed
AND process quiescence receipt passed
```

CAS mismatch는 자동 재시도하지 않는다. Pointer, R10 generation, transaction intent를 다시 읽고 새 intent를 생성해야 한다.

# 7. Stable Launcher Contract

Stable launcher는 package bytes를 직접 포함하거나 package generation별 모듈을 import하지 않는다. Launcher 책임은 다음으로 제한한다.

- local activation pointer read, schema, self-hash, raw-hash 검증;
- package root path canonicalization;
- package directory closure root의 빠른 admission;
- launch envelope 생성;
- exact package executable 실행;
- child process exit와 R11 handoff result 수집;
- quarantine 또는 recovery-only UI 진입;
- update agent 실행.

Launcher가 active package와 previous package의 JS, worker, native addon을 동시에 load하면 FAIL이다.

# 8. Update Transaction Identity

Canonical schema ID:

```text
tdt.resample-runtime.update-transaction.r12.v1
```

필수 identity:

```text
updateTransactionId
sourceInstallGeneration
sourceBuildId
sourcePackageContentId
sourceR11InstalledReceiptSha256
targetBuildId
targetPackageContentId
targetR10FinalReleaseReceiptSha256
targetExpectedInstallationManifestSha256
expectedProductionPointerGeneration
expectedProductionPointerRawSha256
expectedLocalPointerGeneration
expectedLocalPointerRawSha256
stagingRootRelative
packageStoreTargetRelative
createdAt
state
journalHeadSha256
transactionSha256
```

Transaction ID는 cryptographically random 128-bit 이상이어야 하며 경로에 안전한 lowercase hex 또는 base32로 직렬화한다. Timestamp나 PID만으로 생성하지 않는다.

# 9. Transaction State Machine

```text
CREATED
→ SOURCE_ACTIVE_ATTESTED
→ TARGET_RELEASE_ADMITTED
→ STAGING_ALLOCATED
→ PAYLOAD_MATERIALIZED
→ CLOSURE_VERIFIED
→ STAGED_CANARY_PASSED
→ ACTIVATION_PREPARED
→ QUIESCENCE_PASSED
→ PACKAGE_STORE_COMMITTED
→ LOCAL_POINTER_COMMITTED
→ R11_HANDOFF_STARTED
→ R11_HANDOFF_PASSED
→ COMMITTED
```

허용된 실패·복구 상태:

```text
ANY_PRECOMMIT_STATE → ABORTED_ACTIVE_UNCHANGED
LOCAL_POINTER_COMMITTED → HANDOFF_PENDING
HANDOFF_PENDING + R11_FAIL → TARGET_QUARANTINED
TARGET_QUARANTINED → PREVIOUS_LOCAL_RECOVERY_COMMITTED
PREVIOUS_LOCAL_RECOVERY_COMMITTED → RECOVERY_ONLY
COMMITTED → RETENTION_MONITORING
RETENTION_MONITORING → PREVIOUS_RETIRED
```

상태 역행, 단계 건너뛰기, 동일 sequence의 다른 state, journal 없이 state file만 바꾸는 행위를 금지한다.

# 10. Append-Only Update Journal

Journal schema ID:

```text
tdt.resample-runtime.update-journal-entry.r12.v1
```

각 line은 canonical JSON이며 다음을 포함한다.

```text
sequence
transactionId
previousEntrySha256
eventType
stateBefore
stateAfter
intentDigest
evidenceDigests
localPointerBeforeRawSha256
localPointerAfterRawSha256 | null
productionPointerRawSha256
processIdentity
timestamp
entrySha256
```

Journal write 순서:

```text
prepare entry bytes
→ append
→ FlushFileBuffers
→ verify appended bytes
→ update transaction state temp file
→ FlushFileBuffers
→ atomic replace transaction state
→ verify readback
```

Journal tail이 손상되면 마지막 완전한 hash-chain entry까지만 인정하며, 손상 tail을 조용히 삭제하지 않는다. Recovery receipt에 tail corruption을 기록한다.

# 11. Package Input Admission

R12 transport는 local package archive 또는 immutable package directory를 입력으로 받을 수 있다. Network download 자체는 범위 밖이다. 어떤 transport를 사용하든 다음 release evidence가 필요하다.

```text
R10 final release receipt
R9 final physical receipt digest
full-product receipt digest
package content manifest
R11 expected installation manifest
Production Pointer v3 snapshot
```

Target package는 activation 시점의 R10 active build/package와 일치해야 한다. Semantic version이 더 높다는 이유로 pointer와 다른 package를 활성화하지 않는다.

## 11.1 Update Transition Lease

R10 Production Pointer가 target B로 전환되면 local source A의 기존 R11 session token은 pointer generation mismatch로 폐기된다. R12는 A가 계속 정상 runtime-admitted라고 가정하지 않는다. Stable launcher는 다음 조건으로 updater-only transition lease를 발급한다.

```text
schemaId = tdt.resample-runtime.update-transition-lease.r12.v1
sourceBuildId/sourcePackageContentId = local pointer active source A
targetBuildId/targetPackageContentId = R10 pointer active target B
source identity = R10 pointer previous package 또는 current active와 byte-identical source
source historical R11 installed receipt valid
productionPointerGeneration bound
productionPointerRawSha256 bound
localPointerGeneration bound
localPointerRawSha256 bound
runtimeAdmissionAllowed = false
previewAllowed = false
exportAllowed = false
updaterOnly = true
leaseSha256
```

Source A가 R10 previous package와 일치하지 않고 target B와도 일치하지 않으면 transition lease를 발급하지 않는다. Lease는 staging과 recovery orchestration만 허용하며 active package의 application modules를 새 작업에 사용하지 않는다. R10 pointer가 다시 바뀌면 lease는 즉시 stale이다.

# 12. Path and Filesystem Admission

모든 package path는 Windows case-insensitive canonical path set으로 검증한다.

금지 항목:

- absolute path;
- `..` traversal;
- drive-relative path;
- UNC path;
- reserved device name;
- trailing dot 또는 trailing space collision;
- case-fold collision;
- NTFS alternate data stream;
- symbolic link, junction, mount point, unsupported reparse point;
- hardlink를 통한 package root 외부 inode 공유;
- package root 외부로 해석되는 canonical path;
- manifest에 없는 executable 또는 script;
- duplicate normalized path.

Staging, package store, local pointer, journal은 같은 NTFS volume에 있어야 한다. Atomic rename과 pointer replacement가 보장되지 않는 volume이면 activation을 시작하지 않는다.

# 13. Staging Materialization

Target bytes는 `payload.partial`에만 쓴다. 파일은 temporary name으로 완성한 뒤 same-directory rename으로 최종 relative path를 얻는다. Manifest entry 검증 전에는 `payload.verified`로 이동하지 않는다.

Materialization receipt는 다음을 기록한다.

```text
file count
total bytes
relative path set digest
per-file SHA-256
permission/attribute snapshot
reparse point count = 0
alternate data stream count = 0
case collision count = 0
unexpected executable count = 0
```

압축 해제 폭탄 방지를 위해 manifest의 file count와 total bytes 상한을 사전에 확인한다. Manifest에 없는 bytes를 추출한 뒤 삭제하는 방식은 허용하지 않는다.

# 14. Full Closure Verification

Staged closure는 R11 expected installation manifest와 package content manifest를 모두 만족해야 한다.

필수 분류:

- `app.asar`;
- unpacked renderer and Electron main assets;
- workers and child workers;
- WASM modules and pthread helpers;
- native addons and codec binaries;
- generated WGSL and canonical WGSL;
- generated WGSL manifest;
- Runtime Asset Manifest;
- Active Graph artifacts;
- package metadata;
- immutable release receipts embedded or externally bound by digest.

Manifest root 계산에서 manifest 자기 파일을 제외하는 규칙은 명시적으로 고정한다. Exclusion set이 서로 다르면 closure digest를 비교하지 않는다.

# 15. Immutable Package Store Commit

Closure PASS 후 `payload.verified`를 content-addressed package store로 이동한다.

```text
staging/<tx>/payload.verified
→ packages/<packageContentId>.incoming.<tx>
→ verify closure again
→ packages/<packageContentId>
```

이미 같은 `packageContentId` 디렉터리가 존재하면 byte-identical closure일 때만 재사용한다. 하나라도 다르면 content identity collision으로 fail-closed한다. Existing directory를 덮어쓰거나 merge하지 않는다.

Package store commit은 local activation이 아니다. Pointer CAS 전까지 기존 active package가 계속 선택된다.

# 16. Staged Package Execution Isolation

Staged canary process는 target package root를 명시적으로 전달받아 실행한다.

```text
DADUM_PACKAGE_ROOT = exact verified target root
DADUM_PACKAGE_CONTENT_ID = target packageContentId
DADUM_INSTALL_GENERATION = proposed next generation
DADUM_UPDATE_TRANSACTION_ID = transactionId
DADUM_STAGED_EXECUTION = 1
```

다음 경로는 접근을 금지한다.

- current active package root;
- previous package root;
- source repository;
- Vite dev server;
- global mutable worker cache;
- generation-neutral WASM cache;
- generation-neutral shader cache;
- PATH 또는 cwd를 통한 old native addon discovery.

Child process마다 launch envelope를 전달하며 startup handshake에서 같은 generation identity를 echo해야 한다.

# 17. Staged R11 Canary

Staged execution은 R11 startup canary와 동일한 fixture authority를 사용하되, 아직 installed active가 아니므로 결과는 `STAGED_CANARY` role로 기록한다.

필수 검증:

- hardware D3D12 adapter;
- target package main·renderer·worker identity;
- R4 constant-field DC;
- R4 fractional-phase impulse;
- R6 anisotropic diagonal;
- border corner;
- premultiplied alpha edge;
- neutral policy identity;
- residual-disabled identity;
- validation counter zero control;
- validation counter positive control;
- product↔direct-reference raw binary16 exact;
- GPU↔binary64 oracle 1 ULP;
- nonfinite zero;
- fault sentinel zero;
- CPU fallback zero;
- terminal readback contract;
- Preview smoke;
- Export smoke.

Staged canary가 PASS해도 runtime token은 발급하지 않는다. R11 token은 local activation 이후 installed path를 다시 attestation한 뒤에만 발급된다.

# 18. Process Quiescence

Activation pointer CAS 전에 다음을 증명한다.

```text
new Preview jobs blocked
new Export jobs blocked
pending jobs drained or deterministically rejected
renderer processes exited
worker processes exited
GPU child process exited when required by package switch
native addon handles released
WASM pthread workers terminated
package-root open file handles = 0
local update lock held
launcher remains the only coordinating process
```

Timeout 후 강제 종료를 사용할 수 있으나, 어떤 process가 강제 종료되었는지 receipt에 기록하고 handle zero를 다시 검증해야 한다.

# 19. Activation Intent

Activation intent schema ID:

```text
tdt.resample-runtime.activation-intent.r12.v1
```

Intent는 다음 값을 동결한다.

```text
transactionId
target build/package
package store closure digest
staged canary receipt digest
R10 pointer raw hash/generation
local pointer raw hash/generation
proposed installGeneration
quiescence receipt digest
expected activation pointer after-state
operator policy identity
intentSha256
```

Intent 이후 R10 pointer 또는 local pointer가 바뀌면 intent는 stale이며 새로 생성해야 한다.

# 20. Atomic Local Activation

Activation commit point는 local activation pointer의 atomic CAS다. Package directory rename 두 번을 commit point로 사용하지 않는다.

```text
read and verify local pointer
→ compare expected raw SHA-256 and generation
→ write new pointer to same-directory temp file
→ FlushFileBuffers(temp)
→ Windows atomic replace
→ FlushFileBuffers(parent handle or supported equivalent)
→ read back raw bytes
→ recompute self-hash and raw SHA-256
→ verify installGeneration +1
→ verify active target identity
```

Old package directory는 삭제하거나 이동하지 않는다. 따라서 pointer CAS 전에는 old active만 보이고, CAS 후에는 new active만 보인다. Stable launcher는 한 process launch에서 pointer를 두 번 해석하지 않는다.

# 21. Launch Envelope and Generation Binding

Canonical schema ID:

```text
tdt.resample-runtime.launch-envelope.r12.v1
```

필수 필드:

```text
launchId
buildId
packageContentId
packageRootCanonical
installGeneration
updateTransactionId
localPointerRawSha256
productionPointerGeneration
productionPointerRawSha256
launcherDigest
processRole
parentLaunchId
issuedAt
envelopeSha256
```

Main, renderer, worker, child worker, WASM pthread helper, native addon loader는 동일 identity를 확인한다. RPC message와 worker handshake는 generation identity를 포함해야 한다.

# 22. Cross-Generation Asset Exclusion

다음 조합은 즉시 실패한다.

```text
main generation N + renderer generation N-1
renderer generation N + worker generation N-1
worker generation N + WASM generation N-1
WASM generation N + pthread helper generation N-1
app.asar generation N + native addon generation N-1
WGSL manifest generation N + WGSL bytes generation N-1
planner generation N + pipeline cache generation N-1
R11 token generation N + job generation N-1
```

Dynamic import base, worker URL base, WASM URL base, native addon resolution root는 package root에서 파생한다. Process cwd, PATH, global cache, previous package 경로를 fallback으로 사용하지 않는다.

# 23. Cache Partitioning

다음 cache key에는 최소한 `packageContentId`와 `installGeneration`이 포함되어야 한다.

- Electron HTTP cache partition;
- renderer code cache;
- worker script cache;
- WASM compiled module cache;
- native addon admission cache;
- WGSL module cache;
- pipeline cache;
- bind-group layout cache;
- R11 canary cache.

Service Worker가 존재하지 않는 것이 기본이다. 존재한다면 package generation별 scope와 cache namespace를 사용하고 activation 전에 old service worker가 target process를 제어하지 못함을 증명해야 한다.

# 24. R11 Installed Attestation Handoff

Local pointer CAS 후 launcher는 target package를 새 process로 실행하고 R11에 다음 handoff receipt를 전달한다.

```text
schemaId = tdt.resample-runtime.r11-handoff.r12.v1
transactionId
installGeneration
localPointerRawSha256
localPointerSelfHash
productionPointerGeneration
productionPointerRawSha256
buildId
packageContentId
packageRootCanonicalDigest
packageClosureDigest
activationReceiptSha256
stagedCanaryReceiptSha256
handoffSha256
```

R11은 installed path를 다시 해시하고 startup canary를 다시 실행한다. Staged canary 결과를 그대로 token으로 승격하지 않는다.

R12 transaction은 다음을 모두 받은 뒤에만 `COMMITTED`다.

```text
R11 installed artifact attestation PASS
R11 startup canary PASS
R11 session admission token issued
R11 quarantined = false
R11 productionPointerMutated = false
R11 receipt package/install generation matches R12
```

# 25. Pointer Change During Update

R10 Production Pointer는 staging 동안 바뀔 수 있다. R12는 다음 세 시점에서 재검증한다.

- transaction creation;
- activation intent creation;
- local pointer CAS 직전.

Target package나 generation이 달라지면 current transaction은 `STALE_TARGET_ABORTED`로 종료한다. 이미 검증된 package bytes는 content-addressed store에 보관할 수 있지만 자동 활성화하지 않는다.

# 26. Interrupted-Update Recovery Matrix

## 26.1 CREATED to PAYLOAD_MATERIALIZED

Local pointer는 불변이다. Partial staging은 manifest와 journal을 기준으로 resume하거나 discard한다. Partial bytes를 verified package로 승격하지 않는다.

## 26.2 CLOSURE_VERIFIED to STAGED_CANARY_PASSED

Target closure를 다시 검증한 뒤 canary를 재실행할 수 있다. 이전 canary process가 비정상 종료되었으면 PASS cache를 재사용하지 않는다.

## 26.3 ACTIVATION_PREPARED to QUIESCENCE_PASSED

R10 pointer와 local pointer expected hashes를 다시 확인한다. Process drain receipt가 불완전하면 activation을 시작하지 않는다.

## 26.4 PACKAGE_STORE_COMMITTED Before Local Pointer CAS

Old local pointer가 여전히 active다. Target package store는 orphan candidate로 남을 수 있으며 transaction resume 또는 retention policy에 따른 GC 대상이다.

## 26.5 Local Pointer CAS Committed Before Journal Acknowledgement

Recovery는 local pointer raw bytes와 generation을 읽어 CAS가 실제 성공했는지 판정한다. Journal state만 보고 되돌리지 않는다. Pointer가 target을 가리키면 `HANDOFF_PENDING`으로 재구성한다.

## 26.6 Local Pointer CAS After R11 Handoff Started

R11 installed receipt 또는 quarantine receipt를 찾는다. 둘 다 없으면 target R11 handoff를 idempotently 재실행한다.

## 26.7 R11 PASS Before Transaction COMMITTED Marker

R11 token과 receipt가 transaction identity와 일치하면 `COMMITTED`를 재구성한다. R11 canary를 생략하지 않으며, token이 stale이면 다시 실행한다.

## 26.8 R11 Failure After Activation

Target을 quarantine하고 local activation pointer를 previous package로 CAS한다. Previous package는 `RECOVERY_ONLY`로 시작한다. R10 pointer가 previous package로 rollback되기 전에는 정상 runtime token을 요구하지 않는다.

## 26.9 Journal Tail Corruption

마지막 valid hash-chain entry와 actual pointer states를 함께 사용한다. Corrupt tail은 보존하고 recovery receipt에 기록한다.

# 27. Local Previous-Package Recovery

Previous package restore는 다음을 요구한다.

```text
previous package closure still byte-identical
previous package R11 historical installed receipt present
local pointer expected target generation/hash matches
recovery intent sealed
all target processes stopped
recovery-only mode explicit
R10 pointer not mutated
```

Local restore 뒤 두 경우를 구분한다.

```text
R10 active package == previous package
→ R11 full attestation 가능
→ runtime admission 가능

R10 active package != previous package
→ updater/recovery UI only
→ Preview·Export blocked
→ R11 rollback recommendation forwarded to R10
```

# 28. Previous Package Retention

Target transaction commit 직후 previous package를 삭제하지 않는다. 최소 retention 조건:

```text
R11 admitted target session normal termination count >= 3
startup quarantine count = 0
device-loss quarantine count = 0
crash threshold not reached
no pending R11 rollback recommendation
no active R12 recovery transaction
operator retention policy minimum elapsed
```

마지막 known-good package와 현재 active package는 같은 GC operation에서 삭제할 수 없다.

# 29. Package Garbage Collection

GC는 local pointer, all active transactions, R10 previous target, R11 rollback recommendation, retention ledger를 읽는다. 삭제 전 package closure digest를 기록하고 삭제 후 path absence를 검증한다.

GC가 삭제할 수 없는 항목:

- local active package;
- local previous package during retention;
- R10 active package;
- R10 previous package when rollback eligible;
- quarantined target under investigation;
- package referenced by incomplete transaction;
- package with open process or file handle.

# 30. Concurrency and Locking

한 install root에는 active update transaction이 하나만 존재한다. Lock schema는 다음을 포함한다.

```text
transactionId
ownerPid
ownerProcessStartTime
ownerExecutableDigest
installRootDigest
acquiredAt
heartbeatSequence
lockSha256
```

PID 재사용만으로 stale lock을 삭제하지 않는다. Process start time과 executable digest를 함께 확인한다. Lock takeover는 recovery receipt를 남긴다.

다중 app instance가 실행 중이면 maintenance barrier로 신규 작업을 막고 모든 instance를 drain한다.

# 31. Failure Taxonomy

```text
E_R12_R10_RELEASE_MISSING
E_R12_R11_ACTIVE_INSTALL_NOT_ADMITTED
E_R12_PRODUCTION_POINTER_STALE
E_R12_LOCAL_POINTER_INVALID
E_R12_LOCAL_POINTER_CAS_MISMATCH
E_R12_TARGET_NOT_PRODUCTION_ACTIVE
E_R12_PACKAGE_DIGEST_MISMATCH
E_R12_PACKAGE_CLOSURE_INCOMPLETE
E_R12_PATH_TRAVERSAL
E_R12_CASE_COLLISION
E_R12_REPARSE_POINT_FORBIDDEN
E_R12_ADS_FORBIDDEN
E_R12_CONTENT_ID_COLLISION
E_R12_STAGED_ASSET_GENERATION_MIX
E_R12_STAGED_CANARY_FAILED
E_R12_PROCESS_QUIESCENCE_FAILED
E_R12_OPEN_PACKAGE_HANDLE
E_R12_ACTIVATION_INTENT_STALE
E_R12_ATOMIC_REPLACE_FAILED
E_R12_POINTER_READBACK_MISMATCH
E_R12_R11_HANDOFF_FAILED
E_R12_CROSS_GENERATION_HANDSHAKE
E_R12_JOURNAL_CHAIN_BROKEN
E_R12_RECOVERY_AMBIGUOUS
E_R12_PREVIOUS_PACKAGE_NOT_RECOVERABLE
E_R12_PRODUCTION_POINTER_WRITE_ATTEMPT
E_R12_FINAL_RECEIPT_INCOMPLETE
```

# 32. Required Source Implementation Surface

R12 bake는 최소 다음 파일을 추가해야 한다.

```text
tools/resample-runtime-01-r12/
  run.mjs
  gate-source.mjs
  finalize-source.mjs
  verify-parent-freeze.mjs
  verify-source-contract.mjs
  verify-negative-controls.mjs
  verify-predecessor-regression.mjs
  transaction.mjs
  journal.mjs
  package-closure.mjs
  path-policy.mjs
  local-pointer.mjs
  activation-intent.mjs
  recovery.mjs
  retention.mjs
  run-installed-update.mjs
  verify-installed-update.mjs
  finalize-installed-update.mjs
  windows/atomic-replace-local-pointer.ps1
  windows/list-package-handles.ps1
  schemas/*.json

app/features/resample-runtime/r12/
  update-agent.mjs
  launch-envelope.mjs
  generation-handshake.mjs
  staged-canary-controller.mjs
  r11-handoff.mjs
  recovery-mode.mjs
```

기존 R10 pointer writer와 R11 runtime admission code를 복제하지 않는다. 필요한 경우 read-only adapter로 호출한다.

# 33. Required Artifacts

Source bake:

```text
R12_PARENT_FREEZE_RECEIPT.json
R12_SOURCE_GATE_REPORT.json
R12_LOCAL_POINTER_SCHEMA_RECEIPT.json
R12_TRANSACTION_STATE_MACHINE_RECEIPT.json
R12_RECOVERY_MATRIX_SELF_TEST.json
R12_NEGATIVE_CONTROL_SOURCE_GATE.json
R12_PREDECESSOR_REGRESSION_REPORT.json
TDT_RESAMPLE_RUNTIME_01_R12_SOURCE_FINAL_RECEIPT.json
```

Installed update:

```text
R12_R10_TARGET_ADMISSION_RECEIPT.json
R12_R11_SOURCE_INSTALL_ADMISSION_RECEIPT.json
R12_STAGING_MATERIALIZATION_RECEIPT.json
R12_PACKAGE_CLOSURE_RECEIPT.json
R12_STAGED_CANARY_RECEIPT.json
R12_QUIESCENCE_RECEIPT.json
R12_ACTIVATION_INTENT.json
R12_LOCAL_POINTER_CAS_RECEIPT.json
R12_R11_HANDOFF_RECEIPT.json
R12_INTERRUPTION_RECOVERY_RECEIPT.json
R12_RETENTION_RECEIPT.json
R12_FINAL_INSTALLED_UPDATE_RECEIPT.json
```

# 34. Receipt Conservation

Final receipt는 모든 child artifact의 name, relative path, SHA-256를 포함한다. Child artifact를 수정한 뒤 final receipt만 다시 쓰는 행위를 금지한다.

Installed final receipt 필수 필드:

```text
schemaId = tdt.resample-runtime.r12-final-installed-update-receipt.v1
state = RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_INSTALLATION_AND_ATTESTATION_HANDOFF_SEALED
sourcePass = 168
installedPass = 358
pending = 0
deferred = 0
skipped = 0
fail = 0
sourceBuildId
sourcePackageContentId
targetBuildId
targetPackageContentId
productionPointerGeneration
localInstallGeneration
updateTransactionId
crossGenerationAssetCount = 0
interruptedUpdateRecoveryPassed = true
r11AdmissionTokenIssued = true
r11Quarantined = false
previousPackageRecoverable = true
productionPointerMutated = false
receiptSha256
```

# 35. Privacy Boundary

R12 evidence에 허용되는 값:

```text
build/package identity
relative package path
file size and SHA-256
transaction and generation identity
process role and executable digest
adapter and driver identity from R11 canary
counter and duration values
error code
```

금지되는 값:

```text
user image bytes
thumbnail
user file name
user absolute content path
pixel hash
EXIF
user project metadata
network telemetry payload
```

Install root absolute path는 local diagnostic에서 필요할 수 있으나 exported release receipt에는 salted root digest 또는 normalized role path로 대체한다.

# 36. Negative-Control Matrix

Source 및 installed harness는 최소 다음 결함을 검출해야 한다.

- target package 한 파일 변조;
- case-only duplicate path;
- `..` traversal archive entry;
- NTFS alternate data stream;
- junction을 통한 package root 탈출;
- existing content-addressed package directory의 byte mismatch;
- old worker를 반환하는 cache;
- old WASM pthread helper;
- old native addon discovery via PATH;
- stale R10 pointer generation;
- stale local pointer generation;
- local pointer raw hash mismatch;
- pointer CAS 후 journal acknowledgement 전 process kill;
- R11 handoff 중 process kill;
- broken journal tail;
- R11 quarantine after activation;
- previous package closure drift;
- Production Pointer write attempt;
- runtime admission before R11 token;
- previous package normal runtime admission while R10 points target.

# 37. Source Acceptance State

현재 repository에서 허용되는 결과:

```text
RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_HARNESS_SOURCE_BAKED_AWAITING_QUALIFIED_RELEASE_AND_R11_ACTIVE_INSTALLATION

SOURCE PASS = 168
INSTALLED PENDING = 358
DEFERRED = 0
SKIPPED = 0
FAIL = 0
productionPointerMutated = false
localActivationPointerMutated = false
```

# 38. Final Acceptance State

실제 Windows installed update와 interruption recovery가 모두 끝난 뒤에만 허용된다.

```text
RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_INSTALLATION_AND_ATTESTATION_HANDOFF_SEALED

SOURCE PASS = 168
INSTALLED PASS = 358
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0
activePackageGenerationConsistent = true
crossGenerationAssetCount = 0
interruptedUpdateRecoveryPassed = true
r11AdmissionTokenIssued = true
r11Quarantined = false
previousPackageRecoverable = true
productionPointerMutated = false
```

# 39. Promotion Boundary

R12 final receipt는 local update mechanism의 설치·복구 correctness를 증명한다. R10 Production Pointer의 release selection이나 rollback 권위를 승계하지 않는다. R12가 recovery-only previous package를 복원한 경우, 정상 runtime admission을 위해서는 R10 rollback과 R11 재-attestation이 별도로 필요하다.

# 40. Recommended Next Authority

```text
TDT-RESAMPLE-RUNTIME-01-R13

Multi-Installation Cohort Rollout /
Canary Ring Admission /
Fleet Evidence Aggregation /
Bad-Release Containment /
Privacy-Preserving Rollout Receipt Seal
```

R13은 단일 설치의 atomic update를 넘어 여러 설치에 같은 package를 단계적으로 배포할 때 cohort별 증거와 bad-release containment를 다룬다. R12 final receipt가 없는 설치는 R13 rollout cohort에 입장할 수 없다.

# 41. Source Mandatory Gates

## 41.1 Parent and Metadata Truth
### R12-S001 `PARENT_BUNDLE_SHA256_EXACT`
- **Requirement:** parent bundle sha256 exact.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S002 `PARENT_R11_SPEC_SHA256_EXACT`
- **Requirement:** parent r11 spec sha256 exact.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S003 `PARENT_R11_SOURCE_RECEIPT_SHA256_EXACT`
- **Requirement:** parent r11 source receipt sha256 exact.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S004 `PARENT_R11_STATE_EXACT`
- **Requirement:** parent r11 state exact.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S005 `PARENT_R11_SOURCE_PASS_148`
- **Requirement:** parent r11 source pass 148.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S006 `PARENT_R11_INSTALLED_PENDING_228`
- **Requirement:** parent r11 installed pending 228.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S007 `PARENT_R11_FAIL_ZERO`
- **Requirement:** parent r11 fail zero.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S008 `CURRENT_R10_SOURCE_STATE_RECORDED`
- **Requirement:** current r10 source state recorded.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S009 `CURRENT_R10_RELEASE_PENDING_RECORDED`
- **Requirement:** current r10 release pending recorded.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S010 `CURRENT_PRODUCTION_POINTER_SCHEMA_V2_RECORDED`
- **Requirement:** current production pointer schema v2 recorded.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S011 `CURRENT_PRODUCTION_POINTER_ACTIVE_NULL_RECORDED`
- **Requirement:** current production pointer active null recorded.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S012 `CURRENT_PRODUCTION_POINTER_RAW_HASH_RECORDED`
- **Requirement:** current production pointer raw hash recorded.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S013 `SOURCE_STATE_EXACT`
- **Requirement:** source state exact.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S014 `SOURCE_GATE_COUNT_168`
- **Requirement:** source gate count 168.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S015 `INSTALLED_GATE_COUNT_358`
- **Requirement:** installed gate count 358.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.
### R12-S016 `TOTAL_GATE_COUNT_526`
- **Requirement:** total gate count 526.
- **Assertion:** R12 parent identity and current predecessor state are recorded exactly without inventing missing installed evidence.
- **Evidence:** `R12_PARENT_FREEZE_RECEIPT.json and R12_SOURCE_GATE_REPORT.json`.
- **Failure:** `E_R12_PARENT_TRUTH_MISMATCH`; the R12 transaction does not advance to a later authority state.

## 41.2 Authority Separation
### R12-S017 `R10_PRODUCTION_AUTHORITY_READ_ONLY`
- **Requirement:** r10 production authority read only.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S018 `R12_LOCAL_POINTER_AUTHORITY_ONLY`
- **Requirement:** r12 local pointer authority only.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S019 `R11_RUNTIME_ADMISSION_AUTHORITY_ONLY`
- **Requirement:** r11 runtime admission authority only.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S020 `PRODUCTION_POINTER_WRITER_NOT_IMPORTED`
- **Requirement:** production pointer writer not imported.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S021 `LOCAL_POINTER_ID_EXACT`
- **Requirement:** local pointer id exact.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S022 `LOCAL_POINTER_SCHEMA_V1`
- **Requirement:** local pointer schema v1.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S023 `RECOVERY_ONLY_MODE_EXPLICIT`
- **Requirement:** recovery only mode explicit.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S024 `NO_NORMAL_RUNTIME_ON_POINTER_MISMATCH`
- **Requirement:** no normal runtime on pointer mismatch.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S025 `NO_ACTIVE_DIRECTORY_SSOT`
- **Requirement:** no active directory ssot.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S026 `IMMUTABLE_PACKAGE_STORE_AUTHORITY`
- **Requirement:** immutable package store authority.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S027 `STABLE_LAUNCHER_OUTSIDE_PACKAGE_GENERATION`
- **Requirement:** stable launcher outside package generation.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S028 `NO_HOT_PATCH_AUTHORITY`
- **Requirement:** no hot patch authority.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S029 `NO_DELTA_PATCH_AUTHORITY`
- **Requirement:** no delta patch authority.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S030 `NO_CPU_FALLBACK_AUTHORITY`
- **Requirement:** no cpu fallback authority.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S031 `NO_LEGACY_SHADER_FALLBACK_AUTHORITY`
- **Requirement:** no legacy shader fallback authority.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.
### R12-S032 `NO_AUTOMATIC_R10_ROLLBACK`
- **Requirement:** no automatic r10 rollback.
- **Assertion:** R10 release selection, R12 local activation, and R11 runtime admission remain separate authorities.
- **Evidence:** `R12_AUTHORITY_MODEL_RECEIPT.json`.
- **Failure:** `E_R12_AUTHORITY_COLLISION`; the R12 transaction does not advance to a later authority state.

## 41.3 Installation Layout and Path Policy
### R12-S033 `INSTALL_ROOT_LAYOUT_DECLARED`
- **Requirement:** install root layout declared.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S034 `LAUNCHER_ROOT_DECLARED`
- **Requirement:** launcher root declared.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S035 `PACKAGES_ROOT_DECLARED`
- **Requirement:** packages root declared.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S036 `STAGING_ROOT_DECLARED`
- **Requirement:** staging root declared.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S037 `STATE_ROOT_DECLARED`
- **Requirement:** state root declared.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S038 `JOURNAL_ROOT_DECLARED`
- **Requirement:** journal root declared.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S039 `LOCK_ROOT_DECLARED`
- **Requirement:** lock root declared.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S040 `QUARANTINE_ROOT_DECLARED`
- **Requirement:** quarantine root declared.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S041 `SAME_VOLUME_REQUIREMENT`
- **Requirement:** same volume requirement.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S042 `CASE_INSENSITIVE_CANONICAL_SET`
- **Requirement:** case insensitive canonical set.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S043 `ABSOLUTE_PATH_REJECTED`
- **Requirement:** absolute path rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S044 `TRAVERSAL_PATH_REJECTED`
- **Requirement:** traversal path rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S045 `UNC_PATH_REJECTED`
- **Requirement:** unc path rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S046 `RESERVED_DEVICE_NAME_REJECTED`
- **Requirement:** reserved device name rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S047 `TRAILING_DOT_SPACE_REJECTED`
- **Requirement:** trailing dot space rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S048 `CASE_COLLISION_REJECTED`
- **Requirement:** case collision rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S049 `ADS_REJECTED`
- **Requirement:** ads rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S050 `SYMLINK_REJECTED`
- **Requirement:** symlink rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S051 `JUNCTION_REJECTED`
- **Requirement:** junction rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S052 `REPARSE_POINT_REJECTED`
- **Requirement:** reparse point rejected.
- **Assertion:** The installation layout and Windows path policy exclude ambiguous, escaping, or generation-mixing filesystem objects.
- **Evidence:** `R12_PATH_POLICY_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PATH_POLICY_INVALID`; the R12 transaction does not advance to a later authority state.

## 41.4 Transaction and Journal Contract
### R12-S053 `TRANSACTION_SCHEMA_ID_EXACT`
- **Requirement:** transaction schema id exact.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S054 `TRANSACTION_ID_ENTROPY_BOUND`
- **Requirement:** transaction id entropy bound.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S055 `TRANSACTION_SOURCE_IDENTITY_BOUND`
- **Requirement:** transaction source identity bound.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S056 `TRANSACTION_TARGET_IDENTITY_BOUND`
- **Requirement:** transaction target identity bound.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S057 `TRANSACTION_PRODUCTION_POINTER_BOUND`
- **Requirement:** transaction production pointer bound.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S058 `TRANSACTION_LOCAL_POINTER_BOUND`
- **Requirement:** transaction local pointer bound.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S059 `TRANSACTION_STAGING_ROOT_BOUND`
- **Requirement:** transaction staging root bound.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S060 `TRANSACTION_STATE_MONOTONIC`
- **Requirement:** transaction state monotonic.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S061 `TRANSACTION_SKIP_REJECTED`
- **Requirement:** transaction skip rejected.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S062 `TRANSACTION_REWIND_REJECTED`
- **Requirement:** transaction rewind rejected.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S063 `JOURNAL_SCHEMA_ID_EXACT`
- **Requirement:** journal schema id exact.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S064 `JOURNAL_SEQUENCE_MONOTONIC`
- **Requirement:** journal sequence monotonic.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S065 `JOURNAL_HASH_CHAIN_REQUIRED`
- **Requirement:** journal hash chain required.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S066 `JOURNAL_INTENT_BEFORE_EFFECT`
- **Requirement:** journal intent before effect.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S067 `JOURNAL_FLUSH_REQUIRED`
- **Requirement:** journal flush required.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S068 `JOURNAL_READBACK_REQUIRED`
- **Requirement:** journal readback required.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S069 `JOURNAL_CORRUPT_TAIL_PRESERVED`
- **Requirement:** journal corrupt tail preserved.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S070 `TRANSACTION_STATE_ATOMIC_REPLACE`
- **Requirement:** transaction state atomic replace.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S071 `TRANSACTION_SELF_HASH_REQUIRED`
- **Requirement:** transaction self hash required.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S072 `SINGLE_ACTIVE_TRANSACTION`
- **Requirement:** single active transaction.
- **Assertion:** Update transaction and journal state are monotonic, hash-chained, flushed, and recoverable.
- **Evidence:** `R12_TRANSACTION_STATE_MACHINE_RECEIPT.json`.
- **Failure:** `E_R12_JOURNAL_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.

## 41.5 Package Closure Source Contract
### R12-S073 `R10_FINAL_RELEASE_INPUT_REQUIRED`
- **Requirement:** r10 final release input required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S074 `R11_EXPECTED_MANIFEST_INPUT_REQUIRED`
- **Requirement:** r11 expected manifest input required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S075 `PACKAGE_CONTENT_MANIFEST_INPUT_REQUIRED`
- **Requirement:** package content manifest input required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S076 `R9_PHYSICAL_DIGEST_INPUT_REQUIRED`
- **Requirement:** r9 physical digest input required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S077 `FULL_PRODUCT_DIGEST_INPUT_REQUIRED`
- **Requirement:** full product digest input required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S078 `TARGET_MUST_MATCH_R10_ACTIVE`
- **Requirement:** target must match r10 active.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S079 `SEMVER_NOT_AUTHORITY`
- **Requirement:** semver not authority.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S080 `PAYLOAD_PARTIAL_DIRECTORY_REQUIRED`
- **Requirement:** payload partial directory required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S081 `PAYLOAD_VERIFIED_DIRECTORY_REQUIRED`
- **Requirement:** payload verified directory required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S082 `MANIFEST_FILE_COUNT_BOUND`
- **Requirement:** manifest file count bound.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S083 `MANIFEST_TOTAL_BYTES_BOUND`
- **Requirement:** manifest total bytes bound.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S084 `PER_FILE_SHA256_REQUIRED`
- **Requirement:** per file sha256 required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S085 `PATH_SET_DIGEST_REQUIRED`
- **Requirement:** path set digest required.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S086 `UNEXPECTED_FILE_REJECTED`
- **Requirement:** unexpected file rejected.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S087 `UNEXPECTED_EXECUTABLE_REJECTED`
- **Requirement:** unexpected executable rejected.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S088 `HARDLINK_EXTERNALIZATION_REJECTED`
- **Requirement:** hardlink externalization rejected.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S089 `MANIFEST_SELF_EXCLUSION_FIXED`
- **Requirement:** manifest self exclusion fixed.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S090 `CONTENT_ID_STORE_PATH_FIXED`
- **Requirement:** content id store path fixed.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S091 `CONTENT_ID_COLLISION_FAIL_CLOSED`
- **Requirement:** content id collision fail closed.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S092 `PACKAGE_STORE_MERGE_FORBIDDEN`
- **Requirement:** package store merge forbidden.
- **Assertion:** Target package closure is content-addressed and cannot be merged, partially admitted, or chosen outside R10 authority.
- **Evidence:** `R12_PACKAGE_CLOSURE_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.

## 41.6 Staged Execution and Canary Source Contract
### R12-S093 `STAGED_EXECUTION_ROLE_EXPLICIT`
- **Requirement:** staged execution role explicit.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S094 `STAGED_PACKAGE_ROOT_EXPLICIT`
- **Requirement:** staged package root explicit.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S095 `STAGED_GENERATION_EXPLICIT`
- **Requirement:** staged generation explicit.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S096 `STAGED_TRANSACTION_ID_EXPLICIT`
- **Requirement:** staged transaction id explicit.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S097 `ACTIVE_ROOT_ACCESS_FORBIDDEN`
- **Requirement:** active root access forbidden.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S098 `PREVIOUS_ROOT_ACCESS_FORBIDDEN`
- **Requirement:** previous root access forbidden.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S099 `SOURCE_TREE_ACCESS_FORBIDDEN`
- **Requirement:** source tree access forbidden.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S100 `DEV_SERVER_ACCESS_FORBIDDEN`
- **Requirement:** dev server access forbidden.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S101 `GENERATION_NEUTRAL_CACHE_FORBIDDEN`
- **Requirement:** generation neutral cache forbidden.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S102 `OLD_NATIVE_PATH_FALLBACK_FORBIDDEN`
- **Requirement:** old native path fallback forbidden.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S103 `LAUNCH_ENVELOPE_SCHEMA_EXACT`
- **Requirement:** launch envelope schema exact.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S104 `CHILD_HANDSHAKE_REQUIRED`
- **Requirement:** child handshake required.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S105 `STAGED_R11_FIXTURE_AUTHORITY_REUSED`
- **Requirement:** staged r11 fixture authority reused.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S106 `STAGED_CANARY_NO_TOKEN_ISSUE`
- **Requirement:** staged canary no token issue.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S107 `HARDWARE_GPU_REQUIRED`
- **Requirement:** hardware gpu required.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S108 `PRODUCT_REFERENCE_RAW16_EXACT_REQUIRED`
- **Requirement:** product reference raw16 exact required.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S109 `GPU_ORACLE_ULP_BOUND_REQUIRED`
- **Requirement:** gpu oracle ulp bound required.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S110 `VALIDATION_POSITIVE_CONTROL_REQUIRED`
- **Requirement:** validation positive control required.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S111 `PREVIEW_EXPORT_SMOKE_REQUIRED`
- **Requirement:** preview export smoke required.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S112 `CPU_FALLBACK_ZERO_REQUIRED`
- **Requirement:** cpu fallback zero required.
- **Assertion:** The staged package can execute only its own generation and must run the real R11 canary contract without issuing an installed token.
- **Evidence:** `R12_STAGED_EXECUTION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_EXECUTION_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.

## 41.7 Local Pointer and Activation Source Contract
### R12-S113 `LOCAL_POINTER_REQUIRED_FIELDS_DECLARED`
- **Requirement:** local pointer required fields declared.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S114 `LOCAL_POINTER_SELF_HASH_REQUIRED`
- **Requirement:** local pointer self hash required.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S115 `LOCAL_POINTER_RAW_HASH_CAS_REQUIRED`
- **Requirement:** local pointer raw hash cas required.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S116 `LOCAL_POINTER_GENERATION_CAS_REQUIRED`
- **Requirement:** local pointer generation cas required.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S117 `INSTALL_GENERATION_MONOTONIC`
- **Requirement:** install generation monotonic.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S118 `ACTIVATION_INTENT_SCHEMA_EXACT`
- **Requirement:** activation intent schema exact.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S119 `ACTIVATION_INTENT_POINTERS_FROZEN`
- **Requirement:** activation intent pointers frozen.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S120 `ACTIVATION_INTENT_CANARY_BOUND`
- **Requirement:** activation intent canary bound.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S121 `ACTIVATION_INTENT_QUIESCENCE_BOUND`
- **Requirement:** activation intent quiescence bound.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S122 `ACTIVATION_INTENT_STALE_REJECTED`
- **Requirement:** activation intent stale rejected.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S123 `PACKAGE_STORE_COMMIT_PRECEDES_POINTER_CAS`
- **Requirement:** package store commit precedes pointer cas.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S124 `POINTER_CAS_IS_COMMIT_POINT`
- **Requirement:** pointer cas is commit point.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S125 `SAME_DIRECTORY_TEMP_REQUIRED`
- **Requirement:** same directory temp required.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S126 `FLUSH_BEFORE_REPLACE_REQUIRED`
- **Requirement:** flush before replace required.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S127 `ATOMIC_REPLACE_REQUIRED`
- **Requirement:** atomic replace required.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S128 `POINTER_READBACK_REQUIRED`
- **Requirement:** pointer readback required.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S129 `OLD_PACKAGE_NOT_MOVED_ON_ACTIVATION`
- **Requirement:** old package not moved on activation.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S130 `LAUNCHER_POINTER_SINGLE_READ`
- **Requirement:** launcher pointer single read.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S131 `NO_PRODUCTION_POINTER_WRITE_PATH`
- **Requirement:** no production pointer write path.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S132 `CAS_AUTO_RETRY_FORBIDDEN`
- **Requirement:** cas auto retry forbidden.
- **Assertion:** Local activation uses a raw-hash and generation CAS on a small pointer after package-store and quiescence evidence are complete.
- **Evidence:** `R12_LOCAL_POINTER_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.

## 41.8 Recovery and Generation Exclusion Source Contract
### R12-S133 `RECOVERY_MATRIX_ALL_BOUNDARIES_DECLARED`
- **Requirement:** recovery matrix all boundaries declared.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S134 `PRECOMMIT_ACTIVE_UNCHANGED`
- **Requirement:** precommit active unchanged.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S135 `POST_CAS_HANDOFF_PENDING_RECONSTRUCTED`
- **Requirement:** post cas handoff pending reconstructed.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S136 `R11_PASS_COMMIT_RECONSTRUCTED`
- **Requirement:** r11 pass commit reconstructed.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S137 `R11_FAIL_TARGET_QUARANTINED`
- **Requirement:** r11 fail target quarantined.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S138 `PREVIOUS_RESTORE_RECOVERY_ONLY`
- **Requirement:** previous restore recovery only.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S139 `PREVIOUS_NORMAL_RUNTIME_REQUIRES_R10_MATCH`
- **Requirement:** previous normal runtime requires r10 match.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S140 `JOURNAL_AND_POINTER_JOINT_AUTHORITY`
- **Requirement:** journal and pointer joint authority.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S141 `AMBIGUOUS_RECOVERY_FAIL_CLOSED`
- **Requirement:** ambiguous recovery fail closed.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S142 `LAUNCH_ENVELOPE_GENERATION_BOUND`
- **Requirement:** launch envelope generation bound.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S143 `MAIN_RENDERER_GENERATION_MATCH`
- **Requirement:** main renderer generation match.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S144 `RENDERER_WORKER_GENERATION_MATCH`
- **Requirement:** renderer worker generation match.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S145 `WORKER_WASM_GENERATION_MATCH`
- **Requirement:** worker wasm generation match.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S146 `WASM_PTHREAD_GENERATION_MATCH`
- **Requirement:** wasm pthread generation match.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S147 `APP_NATIVE_GENERATION_MATCH`
- **Requirement:** app native generation match.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S148 `WGSL_MANIFEST_BYTES_GENERATION_MATCH`
- **Requirement:** wgsl manifest bytes generation match.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S149 `PIPELINE_CACHE_GENERATION_KEYED`
- **Requirement:** pipeline cache generation keyed.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S150 `R11_TOKEN_INSTALL_GENERATION_BOUND`
- **Requirement:** r11 token install generation bound.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S151 `CACHE_PARTITION_PACKAGE_BOUND`
- **Requirement:** cache partition package bound.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.
### R12-S152 `SERVICE_WORKER_GENERATION_POLICY`
- **Requirement:** service worker generation policy.
- **Assertion:** Every interruption boundary and runtime asset generation boundary has a deterministic fail-closed rule.
- **Evidence:** `R12_RECOVERY_GENERATION_SOURCE_RECEIPT.json`.
- **Failure:** `E_R12_RECOVERY_CONTRACT_INVALID`; the R12 transaction does not advance to a later authority state.

## 41.9 Source Negative Controls and Finalization
### R12-S153 `NEGATIVE_MUTATED_PACKAGE_DETECTED`
- **Requirement:** negative mutated package detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S154 `NEGATIVE_CASE_COLLISION_DETECTED`
- **Requirement:** negative case collision detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S155 `NEGATIVE_TRAVERSAL_DETECTED`
- **Requirement:** negative traversal detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S156 `NEGATIVE_ADS_DETECTED`
- **Requirement:** negative ads detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S157 `NEGATIVE_JUNCTION_DETECTED`
- **Requirement:** negative junction detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S158 `NEGATIVE_CONTENT_ID_COLLISION_DETECTED`
- **Requirement:** negative content id collision detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S159 `NEGATIVE_OLD_WORKER_DETECTED`
- **Requirement:** negative old worker detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S160 `NEGATIVE_OLD_WASM_HELPER_DETECTED`
- **Requirement:** negative old wasm helper detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S161 `NEGATIVE_OLD_NATIVE_ADDON_DETECTED`
- **Requirement:** negative old native addon detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S162 `NEGATIVE_STALE_R10_POINTER_DETECTED`
- **Requirement:** negative stale r10 pointer detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S163 `NEGATIVE_STALE_LOCAL_POINTER_DETECTED`
- **Requirement:** negative stale local pointer detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S164 `NEGATIVE_POINTER_HASH_MISMATCH_DETECTED`
- **Requirement:** negative pointer hash mismatch detected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S165 `NEGATIVE_POST_CAS_KILL_RECOVERED`
- **Requirement:** negative post cas kill recovered.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S166 `NEGATIVE_R11_HANDOFF_KILL_RECOVERED`
- **Requirement:** negative r11 handoff kill recovered.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S167 `NEGATIVE_PRODUCTION_POINTER_WRITE_REJECTED`
- **Requirement:** negative production pointer write rejected.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.
### R12-S168 `SOURCE_FINAL_RECEIPT_SEALED`
- **Requirement:** source final receipt sealed.
- **Assertion:** Negative controls prove that package drift, stale pointers, mixed generations, and Production Pointer writes are rejected.
- **Evidence:** `R12_NEGATIVE_CONTROL_SOURCE_GATE.json`.
- **Failure:** `E_R12_NEGATIVE_CONTROL_NOT_DETECTED`; the R12 transaction does not advance to a later authority state.

# 42. Installed Mandatory Gates

## 42.1 Installed Predecessor Admission
### R12-P001 `R10_FINAL_RECEIPT_PRESENT`
- **Requirement:** r10 final receipt present.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P002 `R10_FINAL_RECEIPT_SHA256_VALID`
- **Requirement:** r10 final receipt sha256 valid.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P003 `R10_FINAL_RECEIPT_SCHEMA_VALID`
- **Requirement:** r10 final receipt schema valid.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P004 `R10_FINAL_STATE_EXACT`
- **Requirement:** r10 final state exact.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P005 `R10_SOURCE_PASS_129`
- **Requirement:** r10 source pass 129.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P006 `R10_RELEASE_PASS_202`
- **Requirement:** r10 release pass 202.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P007 `R10_PENDING_ZERO`
- **Requirement:** r10 pending zero.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P008 `R10_FAIL_ZERO`
- **Requirement:** r10 fail zero.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P009 `R11_ACTIVE_FINAL_RECEIPT_PRESENT`
- **Requirement:** r11 active final receipt present.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P010 `R11_ACTIVE_FINAL_RECEIPT_SHA256_VALID`
- **Requirement:** r11 active final receipt sha256 valid.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P011 `R11_ACTIVE_FINAL_RECEIPT_SCHEMA_VALID`
- **Requirement:** r11 active final receipt schema valid.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P012 `R11_ACTIVE_FINAL_STATE_EXACT`
- **Requirement:** r11 active final state exact.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P013 `R11_ACTIVE_SOURCE_PASS_148`
- **Requirement:** r11 active source pass 148.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P014 `R11_ACTIVE_INSTALLED_PASS_228`
- **Requirement:** r11 active installed pass 228.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P015 `R11_ACTIVE_PENDING_ZERO`
- **Requirement:** r11 active pending zero.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P016 `R11_ACTIVE_FAIL_ZERO`
- **Requirement:** r11 active fail zero.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P017 `R11_SOURCE_HISTORICAL_ATTESTATION_VALID`
- **Requirement:** r11 source historical attestation valid.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P018 `R11_ACTIVE_NOT_QUARANTINED`
- **Requirement:** r11 active not quarantined.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P019 `SOURCE_PACKAGE_ID_PRESENT`
- **Requirement:** source package id present.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.
### R12-P020 `SOURCE_INSTALL_GENERATION_PRESENT`
- **Requirement:** source install generation present.
- **Assertion:** A completed R10 release and a historically R11-attested source installation are admitted; after the R10 pointer changes, the source runs updater-only under a transition lease and has no Preview·Export admission.
- **Evidence:** `R12_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_PREDECESSOR_NOT_QUALIFIED`; the R12 transaction does not advance to a later authority state.

## 42.2 Production and Local Pointer Admission
### R12-P021 `PRODUCTION_POINTER_SCHEMA_V3`
- **Requirement:** production pointer schema v3.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P022 `PRODUCTION_POINTER_ID_EXACT`
- **Requirement:** production pointer id exact.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P023 `PRODUCTION_POINTER_RAW_HASH_VALID`
- **Requirement:** production pointer raw hash valid.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P024 `PRODUCTION_POINTER_SELF_HASH_VALID`
- **Requirement:** production pointer self hash valid.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P025 `PRODUCTION_POINTER_GENERATION_PRESENT`
- **Requirement:** production pointer generation present.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P026 `PRODUCTION_ACTIVE_BUILD_PRESENT`
- **Requirement:** production active build present.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P027 `PRODUCTION_ACTIVE_PACKAGE_PRESENT`
- **Requirement:** production active package present.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P028 `PRODUCTION_RELEASE_PROFILE_PRESENT`
- **Requirement:** production release profile present.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P029 `TARGET_BUILD_MATCH_PRODUCTION`
- **Requirement:** target build match production.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P030 `TARGET_PACKAGE_MATCH_PRODUCTION`
- **Requirement:** target package match production.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P031 `LOCAL_POINTER_PRESENT`
- **Requirement:** local pointer present.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P032 `LOCAL_POINTER_SCHEMA_V1_EXACT`
- **Requirement:** local pointer schema v1 exact.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P033 `LOCAL_POINTER_ID_EXACT_INSTALLED`
- **Requirement:** local pointer id exact installed.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P034 `LOCAL_POINTER_RAW_HASH_VALID`
- **Requirement:** local pointer raw hash valid.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P035 `LOCAL_POINTER_SELF_HASH_VALID`
- **Requirement:** local pointer self hash valid.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P036 `LOCAL_POINTER_SOURCE_MATCHES_R10_PREVIOUS_OR_ACTIVE`
- **Requirement:** local pointer source matches r10 previous or active.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P037 `LOCAL_POINTER_INSTALL_GENERATION_PRESENT`
- **Requirement:** local pointer install generation present.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P038 `LOCAL_POINTER_SELECTION_MODE_VALID`
- **Requirement:** local pointer selection mode valid.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P039 `POINTER_MIRROR_IDENTITY_WHEN_APPLICABLE`
- **Requirement:** pointer mirror identity when applicable.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P040 `PRODUCTION_POINTER_MUTATION_ZERO_BEFORE_UPDATE`
- **Requirement:** production pointer mutation zero before update.
- **Assertion:** Production and local activation pointers are independently verified and bind the target and source installation identities.
- **Evidence:** `R12_POINTER_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R12_POINTER_ADMISSION_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.3 Update Input and Transaction Creation
### R12-P041 `TARGET_R10_RELEASE_RECEIPT_BOUND`
- **Requirement:** target r10 release receipt bound.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P042 `TARGET_R9_PHYSICAL_DIGEST_BOUND`
- **Requirement:** target r9 physical digest bound.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P043 `TARGET_FULL_PRODUCT_DIGEST_BOUND`
- **Requirement:** target full product digest bound.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P044 `TARGET_EXPECTED_MANIFEST_BOUND`
- **Requirement:** target expected manifest bound.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P045 `TARGET_PACKAGE_MANIFEST_BOUND`
- **Requirement:** target package manifest bound.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P046 `UPDATE_TRANSACTION_ID_UNIQUE`
- **Requirement:** update transaction id unique.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P047 `UPDATE_TRANSACTION_ID_ENTROPY_VALID`
- **Requirement:** update transaction id entropy valid.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P048 `SOURCE_MATCHES_PRODUCTION_PREVIOUS_OR_ACTIVE`
- **Requirement:** source matches production previous or active.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P049 `UPDATE_TRANSITION_LEASE_CREATED`
- **Requirement:** update transition lease created.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P050 `EXPECTED_PRODUCTION_GENERATION_VALID`
- **Requirement:** expected production generation valid.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P051 `EXPECTED_PRODUCTION_RAW_HASH_VALID`
- **Requirement:** expected production raw hash valid.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P052 `EXPECTED_LOCAL_GENERATION_VALID`
- **Requirement:** expected local generation valid.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P053 `EXPECTED_LOCAL_RAW_HASH_VALID`
- **Requirement:** expected local raw hash valid.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P054 `TRANSITION_LEASE_UPDATER_ONLY`
- **Requirement:** transition lease updater only.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P055 `UPDATE_LOCK_ACQUIRED`
- **Requirement:** update lock acquired.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P056 `LOCK_OWNER_IDENTITY_VALID`
- **Requirement:** lock owner identity valid.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P057 `CONCURRENT_TRANSACTION_REJECTED`
- **Requirement:** concurrent transaction rejected.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P058 `TRANSACTION_CREATED_JOURNALED`
- **Requirement:** transaction created journaled.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P059 `TRANSACTION_SELF_HASH_VALID`
- **Requirement:** transaction self hash valid.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P060 `TRANSITION_PREVIEW_EXPORT_BLOCKED`
- **Requirement:** transition preview export blocked.
- **Assertion:** The update transaction snapshots all release, package, pointer, lock, and staging identities before materialization.
- **Evidence:** `R12_TRANSACTION_CREATION_RECEIPT.json`.
- **Failure:** `E_R12_TRANSACTION_CREATION_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.4 Staging Filesystem and Materialization
### R12-P061 `STAGING_ON_SAME_VOLUME`
- **Requirement:** staging on same volume.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P062 `STAGING_ROOT_CANONICAL`
- **Requirement:** staging root canonical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P063 `STAGING_ROOT_NOT_ACTIVE_ROOT`
- **Requirement:** staging root not active root.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P064 `STAGING_ROOT_NOT_PREVIOUS_ROOT`
- **Requirement:** staging root not previous root.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P065 `PAYLOAD_PARTIAL_CREATED_EMPTY`
- **Requirement:** payload partial created empty.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P066 `ARCHIVE_ENTRY_COUNT_PRECHECKED`
- **Requirement:** archive entry count prechecked.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P067 `ARCHIVE_TOTAL_BYTES_PRECHECKED`
- **Requirement:** archive total bytes prechecked.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P068 `ABSOLUTE_ENTRY_REJECTED_PHYSICAL`
- **Requirement:** absolute entry rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P069 `TRAVERSAL_ENTRY_REJECTED_PHYSICAL`
- **Requirement:** traversal entry rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P070 `UNC_ENTRY_REJECTED_PHYSICAL`
- **Requirement:** unc entry rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P071 `RESERVED_NAME_REJECTED_PHYSICAL`
- **Requirement:** reserved name rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P072 `TRAILING_DOT_SPACE_REJECTED_PHYSICAL`
- **Requirement:** trailing dot space rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P073 `CASE_COLLISION_REJECTED_PHYSICAL`
- **Requirement:** case collision rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P074 `ADS_REJECTED_PHYSICAL`
- **Requirement:** ads rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P075 `SYMLINK_REJECTED_PHYSICAL`
- **Requirement:** symlink rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P076 `JUNCTION_REJECTED_PHYSICAL`
- **Requirement:** junction rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P077 `REPARSE_POINT_REJECTED_PHYSICAL`
- **Requirement:** reparse point rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P078 `HARDLINK_EXTERNALIZATION_REJECTED_PHYSICAL`
- **Requirement:** hardlink externalization rejected physical.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P079 `FILE_TEMP_WRITE_THEN_RENAME`
- **Requirement:** file temp write then rename.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P080 `FILE_BYTES_FLUSHED`
- **Requirement:** file bytes flushed.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P081 `MATERIALIZED_FILE_COUNT_MATCH`
- **Requirement:** materialized file count match.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P082 `MATERIALIZED_TOTAL_BYTES_MATCH`
- **Requirement:** materialized total bytes match.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P083 `PATH_SET_DIGEST_MATCH`
- **Requirement:** path set digest match.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P084 `PER_FILE_SIZE_MATCH`
- **Requirement:** per file size match.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P085 `PER_FILE_SHA256_MATCH`
- **Requirement:** per file sha256 match.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P086 `UNEXPECTED_FILE_COUNT_ZERO`
- **Requirement:** unexpected file count zero.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P087 `UNEXPECTED_EXECUTABLE_COUNT_ZERO`
- **Requirement:** unexpected executable count zero.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P088 `PAYLOAD_PARTIAL_NOT_EXECUTABLE`
- **Requirement:** payload partial not executable.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P089 `MATERIALIZATION_RECEIPT_SEALED`
- **Requirement:** materialization receipt sealed.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P090 `PAYLOAD_MATERIALIZED_STATE_JOURNALED`
- **Requirement:** payload materialized state journaled.
- **Assertion:** Physical staging materialization rejects unsafe filesystem entries and matches manifest paths, bytes, and counts exactly.
- **Evidence:** `R12_STAGING_MATERIALIZATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGING_MATERIALIZATION_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.5 Full Package Closure and Store Commit
### R12-P091 `APP_ASAR_PRESENT_AND_HASHED`
- **Requirement:** app asar present and hashed.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P092 `RENDERER_CLOSURE_COMPLETE`
- **Requirement:** renderer closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P093 `WORKER_CLOSURE_COMPLETE`
- **Requirement:** worker closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P094 `CHILD_WORKER_CLOSURE_COMPLETE`
- **Requirement:** child worker closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P095 `WASM_CLOSURE_COMPLETE`
- **Requirement:** wasm closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P096 `PTHREAD_HELPER_CLOSURE_COMPLETE`
- **Requirement:** pthread helper closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P097 `NATIVE_ADDON_CLOSURE_COMPLETE`
- **Requirement:** native addon closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P098 `CODEC_BINARY_CLOSURE_COMPLETE`
- **Requirement:** codec binary closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P099 `CANONICAL_WGSL_CLOSURE_COMPLETE`
- **Requirement:** canonical wgsl closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P100 `GENERATED_WGSL_CLOSURE_COMPLETE`
- **Requirement:** generated wgsl closure complete.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P101 `GENERATED_WGSL_MANIFEST_MATCH`
- **Requirement:** generated wgsl manifest match.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P102 `RUNTIME_ASSET_MANIFEST_MATCH`
- **Requirement:** runtime asset manifest match.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P103 `ACTIVE_GRAPH_DIGEST_MATCH`
- **Requirement:** active graph digest match.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P104 `PACKAGE_METADATA_MATCH`
- **Requirement:** package metadata match.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P105 `RELEASE_RECEIPT_DIGESTS_MATCH`
- **Requirement:** release receipt digests match.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P106 `MANIFEST_SELF_EXCLUSION_MATCH`
- **Requirement:** manifest self exclusion match.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P107 `CLOSURE_ROOT_DIGEST_MATCH`
- **Requirement:** closure root digest match.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P108 `PAYLOAD_VERIFIED_RENAME_ATOMIC`
- **Requirement:** payload verified rename atomic.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P109 `PACKAGE_INCOMING_RENAME_ATOMIC`
- **Requirement:** package incoming rename atomic.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P110 `PACKAGE_INCOMING_REVERIFIED`
- **Requirement:** package incoming reverified.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P111 `EXISTING_PACKAGE_REUSE_BYTE_EXACT`
- **Requirement:** existing package reuse byte exact.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P112 `CONTENT_ID_COLLISION_ZERO`
- **Requirement:** content id collision zero.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P113 `PACKAGE_FINAL_RENAME_ATOMIC`
- **Requirement:** package final rename atomic.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P114 `PACKAGE_ROOT_READ_ONLY_POLICY_APPLIED`
- **Requirement:** package root read only policy applied.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P115 `PACKAGE_STORE_COMMIT_RECEIPT_SEALED`
- **Requirement:** package store commit receipt sealed.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P116 `PACKAGE_STORE_COMMITTED_STATE_JOURNALED`
- **Requirement:** package store committed state journaled.
- **Assertion:** The whole target closure is verified and committed to an immutable content-addressed package directory without merge.
- **Evidence:** `R12_PACKAGE_CLOSURE_RECEIPT.json`.
- **Failure:** `E_R12_PACKAGE_CLOSURE_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.6 Staged Execution Isolation
### R12-P117 `STAGED_PROCESS_LAUNCHED_FROM_TARGET_ROOT`
- **Requirement:** staged process launched from target root.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P118 `STAGED_ENV_PACKAGE_ROOT_EXACT`
- **Requirement:** staged env package root exact.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P119 `STAGED_ENV_PACKAGE_ID_EXACT`
- **Requirement:** staged env package id exact.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P120 `STAGED_ENV_INSTALL_GENERATION_EXACT`
- **Requirement:** staged env install generation exact.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P121 `STAGED_ENV_TRANSACTION_ID_EXACT`
- **Requirement:** staged env transaction id exact.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P122 `STAGED_PROCESS_CWD_TARGET_SCOPED`
- **Requirement:** staged process cwd target scoped.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P123 `ACTIVE_PACKAGE_FILE_OPEN_COUNT_ZERO`
- **Requirement:** active package file open count zero.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P124 `PREVIOUS_PACKAGE_FILE_OPEN_COUNT_ZERO`
- **Requirement:** previous package file open count zero.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P125 `SOURCE_REPOSITORY_ACCESS_ZERO`
- **Requirement:** source repository access zero.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P126 `DEV_SERVER_CONNECTION_ZERO`
- **Requirement:** dev server connection zero.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P127 `MAIN_PROCESS_GENERATION_HANDSHAKE_PASS`
- **Requirement:** main process generation handshake pass.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P128 `RENDERER_GENERATION_HANDSHAKE_PASS`
- **Requirement:** renderer generation handshake pass.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P129 `WORKER_GENERATION_HANDSHAKE_PASS`
- **Requirement:** worker generation handshake pass.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P130 `CHILD_WORKER_GENERATION_HANDSHAKE_PASS`
- **Requirement:** child worker generation handshake pass.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P131 `WASM_GENERATION_HANDSHAKE_PASS`
- **Requirement:** wasm generation handshake pass.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P132 `PTHREAD_GENERATION_HANDSHAKE_PASS`
- **Requirement:** pthread generation handshake pass.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P133 `NATIVE_ADDON_GENERATION_HANDSHAKE_PASS`
- **Requirement:** native addon generation handshake pass.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P134 `WGSL_GENERATION_HANDSHAKE_PASS`
- **Requirement:** wgsl generation handshake pass.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P135 `CACHE_NAMESPACE_TARGET_SCOPED`
- **Requirement:** cache namespace target scoped.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.
### R12-P136 `OLD_GENERATION_ASSET_LOAD_COUNT_ZERO`
- **Requirement:** old generation asset load count zero.
- **Assertion:** The staged process and every child load only target-generation assets from the verified target root.
- **Evidence:** `R12_STAGED_ISOLATION_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_ASSET_GENERATION_MIX`; the R12 transaction does not advance to a later authority state.

## 42.7 Staged GPU Canary and Smoke
### R12-P137 `STAGED_HARDWARE_ADAPTER_ACQUIRED`
- **Requirement:** staged hardware adapter acquired.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P138 `STAGED_SOFTWARE_ADAPTER_FALSE`
- **Requirement:** staged software adapter false.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P139 `STAGED_R4_DC_PASS`
- **Requirement:** staged r4 dc pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P140 `STAGED_R4_FRACTIONAL_IMPULSE_PASS`
- **Requirement:** staged r4 fractional impulse pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P141 `STAGED_R6_ANISOTROPIC_PASS`
- **Requirement:** staged r6 anisotropic pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P142 `STAGED_BORDER_CORNER_PASS`
- **Requirement:** staged border corner pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P143 `STAGED_ALPHA_EDGE_PASS`
- **Requirement:** staged alpha edge pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P144 `STAGED_NEUTRAL_POLICY_PASS`
- **Requirement:** staged neutral policy pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P145 `STAGED_RESIDUAL_DISABLED_PASS`
- **Requirement:** staged residual disabled pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P146 `STAGED_COUNTER_ZERO_CONTROL_PASS`
- **Requirement:** staged counter zero control pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P147 `STAGED_COUNTER_POSITIVE_CONTROL_PASS`
- **Requirement:** staged counter positive control pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P148 `STAGED_PRODUCT_REFERENCE_RAW16_EXACT`
- **Requirement:** staged product reference raw16 exact.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P149 `STAGED_GPU_ORACLE_ULP_WITHIN_ONE`
- **Requirement:** staged gpu oracle ulp within one.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P150 `STAGED_NONFINITE_COUNT_ZERO`
- **Requirement:** staged nonfinite count zero.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P151 `STAGED_FAULT_SENTINEL_COUNT_ZERO`
- **Requirement:** staged fault sentinel count zero.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P152 `STAGED_CPU_FALLBACK_COUNT_ZERO`
- **Requirement:** staged cpu fallback count zero.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P153 `STAGED_UNEXPECTED_READBACK_COUNT_ZERO`
- **Requirement:** staged unexpected readback count zero.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P154 `STAGED_PREVIEW_SMOKE_PASS`
- **Requirement:** staged preview smoke pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P155 `STAGED_EXPORT_SMOKE_PASS`
- **Requirement:** staged export smoke pass.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P156 `STAGED_CANARY_RECEIPT_SEALED`
- **Requirement:** staged canary receipt sealed.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P157 `STAGED_CANARY_TOKEN_NOT_ISSUED`
- **Requirement:** staged canary token not issued.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P158 `STAGED_CANARY_STATE_JOURNALED`
- **Requirement:** staged canary state journaled.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P159 `STAGED_CANARY_PACKAGE_ID_MATCH`
- **Requirement:** staged canary package id match.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P160 `STAGED_CANARY_GENERATION_MATCH`
- **Requirement:** staged canary generation match.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P161 `STAGED_CANARY_TRANSACTION_MATCH`
- **Requirement:** staged canary transaction match.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P162 `STAGED_CANARY_ACTIVE_ASSET_USE_ZERO`
- **Requirement:** staged canary active asset use zero.
- **Assertion:** The staged target passes hardware GPU R11 canary and Preview·Export smoke without installed token issuance or fallback.
- **Evidence:** `R12_STAGED_CANARY_RECEIPT.json`.
- **Failure:** `E_R12_STAGED_CANARY_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.8 Quiescence and Activation Intent
### R12-P163 `MAINTENANCE_BARRIER_ENTERED`
- **Requirement:** maintenance barrier entered.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P164 `NEW_PREVIEW_ADMISSION_BLOCKED`
- **Requirement:** new preview admission blocked.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P165 `NEW_EXPORT_ADMISSION_BLOCKED`
- **Requirement:** new export admission blocked.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P166 `PENDING_JOBS_DRAINED_OR_REJECTED`
- **Requirement:** pending jobs drained or rejected.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P167 `RENDERER_PROCESS_COUNT_ZERO`
- **Requirement:** renderer process count zero.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P168 `WORKER_PROCESS_COUNT_ZERO`
- **Requirement:** worker process count zero.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P169 `PTHREAD_WORKER_COUNT_ZERO`
- **Requirement:** pthread worker count zero.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P170 `NATIVE_ADDON_HANDLE_COUNT_ZERO`
- **Requirement:** native addon handle count zero.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P171 `PACKAGE_ROOT_OPEN_HANDLE_COUNT_ZERO`
- **Requirement:** package root open handle count zero.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P172 `GPU_SUBMISSION_QUIESCENT`
- **Requirement:** gpu submission quiescent.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P173 `LAUNCHER_ONLY_COORDINATOR`
- **Requirement:** launcher only coordinator.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P174 `FORCED_TERMINATIONS_RECORDED`
- **Requirement:** forced terminations recorded.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P175 `QUIESCENCE_RECEIPT_SEALED`
- **Requirement:** quiescence receipt sealed.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P176 `PRODUCTION_POINTER_REVALIDATED_PRE_INTENT`
- **Requirement:** production pointer revalidated pre intent.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P177 `LOCAL_POINTER_REVALIDATED_PRE_INTENT`
- **Requirement:** local pointer revalidated pre intent.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P178 `ACTIVATION_INTENT_CREATED`
- **Requirement:** activation intent created.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P179 `ACTIVATION_INTENT_SELF_HASH_VALID`
- **Requirement:** activation intent self hash valid.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P180 `ACTIVATION_INTENT_TARGET_MATCH`
- **Requirement:** activation intent target match.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P181 `ACTIVATION_INTENT_CANARY_MATCH`
- **Requirement:** activation intent canary match.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P182 `ACTIVATION_INTENT_QUIESCENCE_MATCH`
- **Requirement:** activation intent quiescence match.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P183 `ACTIVATION_INTENT_PRODUCTION_HASH_MATCH`
- **Requirement:** activation intent production hash match.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P184 `ACTIVATION_INTENT_LOCAL_HASH_MATCH`
- **Requirement:** activation intent local hash match.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P185 `PROPOSED_INSTALL_GENERATION_PLUS_ONE`
- **Requirement:** proposed install generation plus one.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P186 `ACTIVATION_PREPARED_STATE_JOURNALED`
- **Requirement:** activation prepared state journaled.
- **Assertion:** All running package processes and handles are quiescent and the activation intent freezes current pointer and evidence identities.
- **Evidence:** `R12_QUIESCENCE_RECEIPT.json and R12_ACTIVATION_INTENT.json`.
- **Failure:** `E_R12_PROCESS_QUIESCENCE_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.9 Atomic Local Pointer Activation
### R12-P187 `PRODUCTION_POINTER_REVALIDATED_PRE_CAS`
- **Requirement:** production pointer revalidated pre cas.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P188 `PRODUCTION_POINTER_TARGET_UNCHANGED`
- **Requirement:** production pointer target unchanged.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P189 `PRODUCTION_POINTER_GENERATION_UNCHANGED`
- **Requirement:** production pointer generation unchanged.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P190 `LOCAL_POINTER_REVALIDATED_PRE_CAS`
- **Requirement:** local pointer revalidated pre cas.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P191 `LOCAL_POINTER_RAW_HASH_CAS_MATCH`
- **Requirement:** local pointer raw hash cas match.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P192 `LOCAL_POINTER_GENERATION_CAS_MATCH`
- **Requirement:** local pointer generation cas match.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P193 `UPDATE_LOCK_STILL_HELD`
- **Requirement:** update lock still held.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P194 `TARGET_PACKAGE_STORE_CLOSURE_REVALIDATED`
- **Requirement:** target package store closure revalidated.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P195 `LOCAL_POINTER_TEMP_SAME_DIRECTORY`
- **Requirement:** local pointer temp same directory.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P196 `LOCAL_POINTER_TEMP_BYTES_FLUSHED`
- **Requirement:** local pointer temp bytes flushed.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P197 `LOCAL_POINTER_ATOMIC_REPLACE_SUCCESS`
- **Requirement:** local pointer atomic replace success.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P198 `LOCAL_POINTER_PARENT_FLUSH_ATTEMPTED`
- **Requirement:** local pointer parent flush attempted.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P199 `LOCAL_POINTER_READBACK_BYTES_MATCH`
- **Requirement:** local pointer readback bytes match.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P200 `LOCAL_POINTER_SELF_HASH_AFTER_VALID`
- **Requirement:** local pointer self hash after valid.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P201 `LOCAL_POINTER_RAW_HASH_AFTER_RECORDED`
- **Requirement:** local pointer raw hash after recorded.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P202 `LOCAL_POINTER_GENERATION_INCREMENTED_ONE`
- **Requirement:** local pointer generation incremented one.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P203 `LOCAL_POINTER_ACTIVE_BUILD_TARGET`
- **Requirement:** local pointer active build target.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P204 `LOCAL_POINTER_ACTIVE_PACKAGE_TARGET`
- **Requirement:** local pointer active package target.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P205 `LOCAL_POINTER_ACTIVE_ROOT_TARGET`
- **Requirement:** local pointer active root target.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P206 `LOCAL_POINTER_PREVIOUS_SOURCE_RECORDED`
- **Requirement:** local pointer previous source recorded.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P207 `LOCAL_POINTER_SELECTION_MODE_NORMAL_AFTER_ACTIVATION`
- **Requirement:** local pointer selection mode normal after activation.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P208 `OLD_PACKAGE_DIRECTORY_UNCHANGED`
- **Requirement:** old package directory unchanged.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P209 `PRODUCTION_POINTER_BYTES_UNCHANGED`
- **Requirement:** production pointer bytes unchanged.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P210 `POINTER_CAS_RECEIPT_SEALED`
- **Requirement:** pointer cas receipt sealed.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P211 `LOCAL_POINTER_COMMITTED_STATE_JOURNALED`
- **Requirement:** local pointer committed state journaled.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P212 `STABLE_LAUNCHER_RESOLVES_TARGET_ONLY`
- **Requirement:** stable launcher resolves target only.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P213 `LAUNCH_ENVELOPE_CREATED`
- **Requirement:** launch envelope created.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P214 `LAUNCH_ENVELOPE_SELF_HASH_VALID`
- **Requirement:** launch envelope self hash valid.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P215 `LAUNCH_ENVELOPE_TARGET_IDENTITY_MATCH`
- **Requirement:** launch envelope target identity match.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P216 `LAUNCH_ENVELOPE_INSTALL_GENERATION_MATCH`
- **Requirement:** launch envelope install generation match.
- **Assertion:** The local activation pointer CAS atomically selects the target generation while preserving old package bytes and leaving R10 unchanged.
- **Evidence:** `R12_LOCAL_POINTER_CAS_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_POINTER_CAS_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.10 R11 Handoff and Runtime Admission
### R12-P217 `TARGET_PACKAGE_RELAUNCHED`
- **Requirement:** target package relaunched.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P218 `R11_HANDOFF_SCHEMA_VALID`
- **Requirement:** r11 handoff schema valid.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P219 `R11_HANDOFF_SELF_HASH_VALID`
- **Requirement:** r11 handoff self hash valid.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P220 `R11_HANDOFF_TRANSACTION_MATCH`
- **Requirement:** r11 handoff transaction match.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P221 `R11_HANDOFF_LOCAL_POINTER_HASH_MATCH`
- **Requirement:** r11 handoff local pointer hash match.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P222 `R11_HANDOFF_PRODUCTION_POINTER_MATCH`
- **Requirement:** r11 handoff production pointer match.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P223 `R11_HANDOFF_PACKAGE_ROOT_MATCH`
- **Requirement:** r11 handoff package root match.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P224 `R11_INSTALLED_BYTES_REHASH_PASS`
- **Requirement:** r11 installed bytes rehash pass.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P225 `R11_STARTUP_CANARY_RERUN_PASS`
- **Requirement:** r11 startup canary rerun pass.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P226 `R11_STAGED_CANARY_NOT_REUSED_AS_TOKEN`
- **Requirement:** r11 staged canary not reused as token.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P227 `R11_SESSION_TOKEN_ISSUED`
- **Requirement:** r11 session token issued.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P228 `R11_TOKEN_PACKAGE_MATCH_TARGET`
- **Requirement:** r11 token package match target.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P229 `R11_TOKEN_INSTALL_GENERATION_MATCH`
- **Requirement:** r11 token install generation match.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P230 `R11_TOKEN_POINTER_GENERATION_MATCH`
- **Requirement:** r11 token pointer generation match.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P231 `R11_TOKEN_DEVICE_EPOCH_PRESENT`
- **Requirement:** r11 token device epoch present.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P232 `R11_QUARANTINED_FALSE`
- **Requirement:** r11 quarantined false.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P233 `R11_PRODUCTION_POINTER_MUTATED_FALSE`
- **Requirement:** r11 production pointer mutated false.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P234 `PREVIEW_WITH_NEW_TOKEN_PASS`
- **Requirement:** preview with new token pass.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P235 `EXPORT_WITH_NEW_TOKEN_PASS`
- **Requirement:** export with new token pass.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P236 `R11_HANDOFF_RECEIPT_SEALED`
- **Requirement:** r11 handoff receipt sealed.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P237 `R11_HANDOFF_PASSED_STATE_JOURNALED`
- **Requirement:** r11 handoff passed state journaled.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P238 `TRANSACTION_COMMITTED_MARKER_WRITTEN`
- **Requirement:** transaction committed marker written.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P239 `TRANSACTION_COMMITTED_MARKER_FLUSHED`
- **Requirement:** transaction committed marker flushed.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P240 `TRANSACTION_FINAL_STATE_COMMITTED`
- **Requirement:** transaction final state committed.
- **Assertion:** The activated package is independently re-attested by R11 and receives a generation-bound session token before commit.
- **Evidence:** `R12_R11_HANDOFF_RECEIPT.json`.
- **Failure:** `E_R12_R11_HANDOFF_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.11 Interrupted Update Recovery
### R12-P241 `KILL_AFTER_CREATED_ACTIVE_UNCHANGED`
- **Requirement:** kill after created active unchanged.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P242 `KILL_DURING_MATERIALIZATION_RESUMABLE`
- **Requirement:** kill during materialization resumable.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P243 `KILL_AFTER_MATERIALIZATION_REVERIFY`
- **Requirement:** kill after materialization reverify.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P244 `KILL_AFTER_CLOSURE_VERIFIED_RECANARY`
- **Requirement:** kill after closure verified recanary.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P245 `KILL_DURING_STAGED_CANARY_NO_PASS_REUSE`
- **Requirement:** kill during staged canary no pass reuse.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P246 `KILL_AFTER_CANARY_BEFORE_INTENT_RESUMABLE`
- **Requirement:** kill after canary before intent resumable.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P247 `KILL_AFTER_INTENT_REVALIDATES_POINTERS`
- **Requirement:** kill after intent revalidates pointers.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P248 `KILL_DURING_QUIESCENCE_NO_CAS`
- **Requirement:** kill during quiescence no cas.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P249 `KILL_AFTER_PACKAGE_STORE_COMMIT_ACTIVE_UNCHANGED`
- **Requirement:** kill after package store commit active unchanged.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P250 `KILL_BEFORE_POINTER_TEMP_REPLACE_ACTIVE_UNCHANGED`
- **Requirement:** kill before pointer temp replace active unchanged.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P251 `KILL_AFTER_POINTER_REPLACE_DETECTED_FROM_BYTES`
- **Requirement:** kill after pointer replace detected from bytes.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P252 `KILL_AFTER_POINTER_REPLACE_HANDOFF_PENDING`
- **Requirement:** kill after pointer replace handoff pending.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P253 `KILL_AFTER_JOURNAL_ACK_HANDOFF_PENDING`
- **Requirement:** kill after journal ack handoff pending.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P254 `KILL_DURING_TARGET_RELAUNCH_RECOVERED`
- **Requirement:** kill during target relaunch recovered.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P255 `KILL_DURING_R11_ATTESTATION_RERUN`
- **Requirement:** kill during r11 attestation rerun.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P256 `KILL_AFTER_R11_PASS_BEFORE_COMMIT_RECONSTRUCTED`
- **Requirement:** kill after r11 pass before commit reconstructed.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P257 `KILL_AFTER_COMMIT_BEFORE_LOCK_RELEASE_RECONSTRUCTED`
- **Requirement:** kill after commit before lock release reconstructed.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P258 `CORRUPT_JOURNAL_TAIL_DETECTED`
- **Requirement:** corrupt journal tail detected.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P259 `CORRUPT_JOURNAL_TAIL_PRESERVED`
- **Requirement:** corrupt journal tail preserved.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P260 `LAST_VALID_JOURNAL_HEAD_RECOVERED`
- **Requirement:** last valid journal head recovered.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P261 `ACTUAL_LOCAL_POINTER_WINS_OVER_STALE_STATE_FILE`
- **Requirement:** actual local pointer wins over stale state file.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P262 `ACTUAL_PRODUCTION_POINTER_RECHECKED_ON_RECOVERY`
- **Requirement:** actual production pointer rechecked on recovery.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P263 `AMBIGUOUS_POINTER_STATE_FAIL_CLOSED`
- **Requirement:** ambiguous pointer state fail closed.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P264 `ORPHAN_PARTIAL_STAGING_NOT_ACTIVATED`
- **Requirement:** orphan partial staging not activated.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P265 `ORPHAN_VERIFIED_PACKAGE_NOT_AUTO_ACTIVATED`
- **Requirement:** orphan verified package not auto activated.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P266 `STALE_TARGET_TRANSACTION_ABORTED`
- **Requirement:** stale target transaction aborted.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P267 `RECOVERY_IDEMPOTENT_SECOND_RUN`
- **Requirement:** recovery idempotent second run.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P268 `RECOVERY_RECEIPT_SEALED`
- **Requirement:** recovery receipt sealed.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P269 `INTERRUPTION_MATRIX_ALL_CASES_PASS`
- **Requirement:** interruption matrix all cases pass.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P270 `INTERRUPTION_RECOVERY_PASSED_TRUE`
- **Requirement:** interruption recovery passed true.
- **Assertion:** Every injected interruption is recovered by journal, actual pointer bytes, and immutable package evidence without guessing.
- **Evidence:** `R12_INTERRUPTION_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_INTERRUPTED_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.12 Cross-Generation Runtime Exclusion
### R12-P271 `MAIN_RENDERER_GENERATION_EXACT_PHYSICAL`
- **Requirement:** main renderer generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P272 `RENDERER_WORKER_GENERATION_EXACT_PHYSICAL`
- **Requirement:** renderer worker generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P273 `WORKER_CHILD_GENERATION_EXACT_PHYSICAL`
- **Requirement:** worker child generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P274 `WORKER_WASM_GENERATION_EXACT_PHYSICAL`
- **Requirement:** worker wasm generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P275 `WASM_PTHREAD_GENERATION_EXACT_PHYSICAL`
- **Requirement:** wasm pthread generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P276 `APP_NATIVE_GENERATION_EXACT_PHYSICAL`
- **Requirement:** app native generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P277 `WGSL_MANIFEST_BYTES_GENERATION_EXACT_PHYSICAL`
- **Requirement:** wgsl manifest bytes generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P278 `PLANNER_PIPELINE_GENERATION_EXACT_PHYSICAL`
- **Requirement:** planner pipeline generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P279 `R11_TOKEN_JOB_GENERATION_EXACT_PHYSICAL`
- **Requirement:** r11 token job generation exact physical.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P280 `DYNAMIC_IMPORT_BASE_TARGET_ROOT`
- **Requirement:** dynamic import base target root.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P281 `WORKER_URL_BASE_TARGET_ROOT`
- **Requirement:** worker url base target root.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P282 `WASM_URL_BASE_TARGET_ROOT`
- **Requirement:** wasm url base target root.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P283 `NATIVE_RESOLUTION_BASE_TARGET_ROOT`
- **Requirement:** native resolution base target root.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P284 `OLD_PACKAGE_PATH_FALLBACK_ZERO`
- **Requirement:** old package path fallback zero.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P285 `GLOBAL_MODULE_CACHE_FALLBACK_ZERO`
- **Requirement:** global module cache fallback zero.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P286 `HTTP_CACHE_PARTITION_TARGET`
- **Requirement:** http cache partition target.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P287 `CODE_CACHE_PARTITION_TARGET`
- **Requirement:** code cache partition target.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P288 `WASM_CACHE_PARTITION_TARGET`
- **Requirement:** wasm cache partition target.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P289 `WGSL_CACHE_PARTITION_TARGET`
- **Requirement:** wgsl cache partition target.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P290 `PIPELINE_CACHE_PARTITION_TARGET`
- **Requirement:** pipeline cache partition target.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P291 `SERVICE_WORKER_OLD_CONTROL_ZERO`
- **Requirement:** service worker old control zero.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P292 `CROSS_GENERATION_RPC_REJECTS_STALE`
- **Requirement:** cross generation rpc rejects stale.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P293 `CROSS_GENERATION_ASSET_COUNT_ZERO`
- **Requirement:** cross generation asset count zero.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.
### R12-P294 `GENERATION_MISMATCH_NEGATIVE_CONTROL_PASS`
- **Requirement:** generation mismatch negative control pass.
- **Assertion:** Main, renderer, workers, WASM, native addons, WGSL, caches, pipelines, and jobs all share one install generation.
- **Evidence:** `R12_CROSS_GENERATION_EXCLUSION_RECEIPT.json`.
- **Failure:** `E_R12_CROSS_GENERATION_HANDSHAKE`; the R12 transaction does not advance to a later authority state.

## 42.13 Quarantine, Local Recovery, and R10 Handoff
### R12-P295 `TARGET_R11_FAILURE_TRIGGERS_QUARANTINE`
- **Requirement:** target r11 failure triggers quarantine.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P296 `TARGET_QUARANTINE_RECEIPT_SEALED`
- **Requirement:** target quarantine receipt sealed.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P297 `TARGET_PREVIEW_BLOCKED_AFTER_QUARANTINE`
- **Requirement:** target preview blocked after quarantine.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P298 `TARGET_EXPORT_BLOCKED_AFTER_QUARANTINE`
- **Requirement:** target export blocked after quarantine.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P299 `TARGET_PROCESSES_STOPPED_BEFORE_RECOVERY`
- **Requirement:** target processes stopped before recovery.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P300 `PREVIOUS_PACKAGE_CLOSURE_REVERIFIED`
- **Requirement:** previous package closure reverified.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P301 `PREVIOUS_HISTORICAL_R11_RECEIPT_PRESENT`
- **Requirement:** previous historical r11 receipt present.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P302 `RECOVERY_INTENT_SEALED`
- **Requirement:** recovery intent sealed.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P303 `RECOVERY_LOCAL_POINTER_CAS_SUCCESS`
- **Requirement:** recovery local pointer cas success.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P304 `RECOVERY_INSTALL_GENERATION_INCREMENTED`
- **Requirement:** recovery install generation incremented.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P305 `RECOVERY_MODE_EXPLICIT_RECOVERY_ONLY`
- **Requirement:** recovery mode explicit recovery only.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P306 `RECOVERY_PRODUCTION_POINTER_UNCHANGED`
- **Requirement:** recovery production pointer unchanged.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P307 `PREVIOUS_NORMAL_RUNTIME_BLOCKED_WHEN_R10_MISMATCH`
- **Requirement:** previous normal runtime blocked when r10 mismatch.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P308 `UPDATER_RECOVERY_UI_ALLOWED`
- **Requirement:** updater recovery ui allowed.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P309 `R11_ROLLBACK_RECOMMENDATION_PRESENT`
- **Requirement:** r11 rollback recommendation present.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P310 `ROLLBACK_RECOMMENDATION_EXECUTION_AUTHORITY_R10`
- **Requirement:** rollback recommendation execution authority r10.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P311 `ROLLBACK_RECOMMENDATION_OPERATOR_APPROVAL_REQUIRED`
- **Requirement:** rollback recommendation operator approval required.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P312 `NO_QUALIFIED_PREVIOUS_NOT_INVENTED`
- **Requirement:** no qualified previous not invented.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P313 `R10_ROLLBACK_AFTERWARD_HANDOFF_SUPPORTED`
- **Requirement:** r10 rollback afterward handoff supported.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P314 `R10_MATCHED_PREVIOUS_R11_READMISSION_SUPPORTED`
- **Requirement:** r10 matched previous r11 readmission supported.
- **Assertion:** A failed target is quarantined, previous bytes may be restored locally in recovery-only mode, and global rollback remains R10 authority.
- **Evidence:** `R12_LOCAL_RECOVERY_RECEIPT.json`.
- **Failure:** `E_R12_LOCAL_RECOVERY_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.14 Retention and Garbage Collection
### R12-P315 `PREVIOUS_PACKAGE_RETAINED_AFTER_COMMIT`
- **Requirement:** previous package retained after commit.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P316 `RETENTION_NORMAL_SESSIONS_AT_LEAST_THREE`
- **Requirement:** retention normal sessions at least three.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P317 `RETENTION_QUARANTINE_COUNT_ZERO`
- **Requirement:** retention quarantine count zero.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P318 `RETENTION_DEVICE_LOSS_THRESHOLD_CLEAR`
- **Requirement:** retention device loss threshold clear.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P319 `RETENTION_CRASH_THRESHOLD_CLEAR`
- **Requirement:** retention crash threshold clear.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P320 `RETENTION_NO_PENDING_RECOMMENDATION`
- **Requirement:** retention no pending recommendation.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P321 `RETENTION_NO_ACTIVE_RECOVERY`
- **Requirement:** retention no active recovery.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P322 `RETENTION_MINIMUM_ELAPSED_POLICY_MET`
- **Requirement:** retention minimum elapsed policy met.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P323 `GC_ACTIVE_PACKAGE_FORBIDDEN`
- **Requirement:** gc active package forbidden.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P324 `GC_PREVIOUS_DURING_RETENTION_FORBIDDEN`
- **Requirement:** gc previous during retention forbidden.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P325 `GC_R10_ACTIVE_FORBIDDEN`
- **Requirement:** gc r10 active forbidden.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P326 `GC_R10_PREVIOUS_ELIGIBLE_FORBIDDEN`
- **Requirement:** gc r10 previous eligible forbidden.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P327 `GC_INCOMPLETE_TRANSACTION_PACKAGE_FORBIDDEN`
- **Requirement:** gc incomplete transaction package forbidden.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P328 `GC_OPEN_HANDLE_PACKAGE_FORBIDDEN`
- **Requirement:** gc open handle package forbidden.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P329 `GC_DELETION_LIST_DIGEST_RECORDED`
- **Requirement:** gc deletion list digest recorded.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P330 `GC_POST_DELETE_PATH_ABSENCE_VERIFIED`
- **Requirement:** gc post delete path absence verified.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P331 `RETENTION_RECEIPT_SEALED`
- **Requirement:** retention receipt sealed.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.
### R12-P332 `LAST_KNOWN_GOOD_PRESERVED`
- **Requirement:** last known good preserved.
- **Assertion:** The previous known-good package remains recoverable until retention criteria pass, and garbage collection cannot remove referenced packages.
- **Evidence:** `R12_RETENTION_RECEIPT.json`.
- **Failure:** `E_R12_RETENTION_POLICY_FAILED`; the R12 transaction does not advance to a later authority state.

## 42.15 Final Receipt, Privacy, and Negative Controls
### R12-P333 `FINAL_RECEIPT_SCHEMA_VALID`
- **Requirement:** final receipt schema valid.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P334 `FINAL_RECEIPT_SELF_HASH_VALID`
- **Requirement:** final receipt self hash valid.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P335 `FINAL_STATE_EXACT`
- **Requirement:** final state exact.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P336 `SOURCE_PASS_168`
- **Requirement:** source pass 168.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P337 `INSTALLED_PASS_358`
- **Requirement:** installed pass 358.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P338 `PENDING_ZERO`
- **Requirement:** pending zero.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P339 `DEFERRED_ZERO`
- **Requirement:** deferred zero.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P340 `SKIPPED_ZERO`
- **Requirement:** skipped zero.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P341 `FAIL_ZERO`
- **Requirement:** fail zero.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P342 `ACTIVE_GENERATION_CONSISTENT_TRUE`
- **Requirement:** active generation consistent true.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P343 `CROSS_GENERATION_COUNT_ZERO_FINAL`
- **Requirement:** cross generation count zero final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P344 `INTERRUPTED_RECOVERY_TRUE_FINAL`
- **Requirement:** interrupted recovery true final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P345 `R11_TOKEN_ISSUED_TRUE_FINAL`
- **Requirement:** r11 token issued true final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P346 `R11_QUARANTINED_FALSE_FINAL`
- **Requirement:** r11 quarantined false final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P347 `PREVIOUS_RECOVERABLE_TRUE_FINAL`
- **Requirement:** previous recoverable true final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P348 `PRODUCTION_POINTER_MUTATED_FALSE_FINAL`
- **Requirement:** production pointer mutated false final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P349 `USER_IMAGE_BYTES_ABSENT`
- **Requirement:** user image bytes absent.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P350 `USER_FILE_NAME_ABSENT`
- **Requirement:** user file name absent.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P351 `USER_CONTENT_PATH_ABSENT`
- **Requirement:** user content path absent.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P352 `USER_PIXEL_HASH_ABSENT`
- **Requirement:** user pixel hash absent.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P353 `NETWORK_TELEMETRY_ZERO`
- **Requirement:** network telemetry zero.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P354 `NEGATIVE_MUTATED_PACKAGE_DETECTED_FINAL`
- **Requirement:** negative mutated package detected final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P355 `NEGATIVE_STALE_POINTER_DETECTED_FINAL`
- **Requirement:** negative stale pointer detected final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P356 `NEGATIVE_MIXED_WORKER_DETECTED_FINAL`
- **Requirement:** negative mixed worker detected final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P357 `NEGATIVE_R11_EARLY_ADMISSION_REJECTED`
- **Requirement:** negative r11 early admission rejected.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.
### R12-P358 `NEGATIVE_PRODUCTION_POINTER_WRITE_REJECTED_FINAL`
- **Requirement:** negative production pointer write rejected final.
- **Assertion:** The final receipt conserves all evidence, has no pending or failed gates, protects user content, and proves negative controls.
- **Evidence:** `R12_FINAL_INSTALLED_UPDATE_RECEIPT.json`.
- **Failure:** `E_R12_FINAL_RECEIPT_INCOMPLETE`; the R12 transaction does not advance to a later authority state.


# 43. Gate Accounting

```text
R12-S001 .. R12-S168 = 168 SOURCE_MANDATORY
R12-P001 .. R12-P358 = 358 INSTALLED_MANDATORY
TOTAL = 526
```

Source bake에서 installed gate는 `PASS`로 위조하지 않는다.

```text
SOURCE PASS = 168
INSTALLED PENDING = 358
FAIL = 0
```

Installed final acceptance에서는 다음만 허용된다.

```text
SOURCE PASS = 168
INSTALLED PASS = 358
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0
```

# 44. Implementation Order

1. Parent freeze와 R10/R11 read-only admission adapter를 만든다.
2. Local activation pointer schema, canonical JSON, self-hash, CAS helper를 만든다.
3. Transaction state machine과 append-only journal을 만든다.
4. Windows path policy와 package closure verifier를 만든다.
5. Staging materializer와 immutable package-store commit을 만든다.
6. Launch envelope와 generation handshake를 main·renderer·worker·WASM·native loader에 연결한다.
7. Staged R11 canary controller를 만든다.
8. Process quiescence와 activation intent를 연결한다.
9. Local pointer atomic CAS와 readback verifier를 연결한다.
10. R11 installed handoff와 token admission을 연결한다.
11. 각 interruption boundary에 kill injection을 넣고 recovery matrix를 실행한다.
12. Local recovery-only restore, retention, GC를 연결한다.
13. Source 168 gate와 installed 358 gate를 별도 finalizer로 봉인한다.

# 45. Final Seal Rule

R12는 다음 문장을 만족할 때만 완료다.

> 실행 중인 모든 프로세스와 자산은 하나의 immutable packageContentId와 installGeneration에 귀속되고, activation은 local pointer CAS 한 점에서만 일어나며, 어떤 중단 지점에서도 old 또는 new package 중 하나의 완전한 closure로 복구되고, R11이 새 설치본을 다시 승인하기 전에는 사용자 Preview·Export가 시작되지 않는다.
