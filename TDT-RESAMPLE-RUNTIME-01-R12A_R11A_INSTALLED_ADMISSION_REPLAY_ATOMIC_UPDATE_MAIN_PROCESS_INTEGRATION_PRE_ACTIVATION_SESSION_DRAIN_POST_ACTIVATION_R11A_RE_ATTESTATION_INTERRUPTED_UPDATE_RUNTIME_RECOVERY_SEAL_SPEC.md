# TDT-RESAMPLE-RUNTIME-01-R12A

## R11A Installed Admission Replay / Atomic Update Main-Process Integration / Pre-Activation Session Drain / Post-Activation R11A Re-Attestation / Interrupted Update Runtime Recovery Seal

> 상태: 명세 확정안
> 적용 부모: `61_TDT_RESAMPLE_RUNTIME_01_R11A_ELECTRON_STARTUP_ADMISSION_SOURCE_BAKED_AWAITING_R10A_RELEASE.zip`
> 부모 ZIP SHA-256: `a86c797cef357b32407ac18d87a518ebb1be7762da3775196bb1f40469f48b8b`
> 부모 R11A 명세 SHA-256: `a2a2d68ab276b5c1733dfd91bf478d237ca11d6c6498a345b0f318f679aaaff5`
> 부모 R11A Source Final Receipt 파일 SHA-256: `2c6a2aaf222e302fde862dda07c4d35e59d2df3d2e6d277b350657c27c63f934`
> 현재 R10A Source Final Receipt 파일 SHA-256: `2fa87a9f3a2c1a36798265d84512cf89932c6aeb2316052a6a049a0793a76d0b`
> 현재 Production Pointer mirror raw SHA-256: `1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8`
> 원칙: **R12A는 Production Pointer를 쓰지 않는다. Local Activation Pointer와 update transaction만 쓴다.**

## 0. 판정 라벨

- **확정**: 부모 ZIP의 코드·receipt·manifest에서 직접 확인됨
- **추정**: 구현 의도는 보이지만 packaged Windows 실행 증거가 없음
- **판단불가**: R9A physical, R10A release, R11A installed receipt가 없어 현재 결정할 수 없음
- **결정 필요**: 구현 전에 제품 정책을 고정해야 하는 항목

이 문서는 source harness 통과와 installed execution 통과를 분리한다. Source 베이크는 Electron main wiring, 상태기계, negative control, parser·Active Graph 폐쇄를 증명한다. Installed seal은 packaged Windows, 실제 pointer CAS, 실제 process relaunch, 실제 R11A re-attestation을 증명한다.

## 1. 부모 상태와 실제 결선 공백

### 1.1 부모 상태

`확정` R11A 부모 상태:

```text
RESAMPLE_RUNTIME_R11A_STARTUP_ADMISSION_WIRING_SOURCE_SEALED_AWAITING_R10A_RELEASE_AND_INSTALLED_ELECTRON

332 SOURCE PASS
400 INSTALLED PENDING
0 FAIL
```

`확정` R10A 상태:

```text
260 SOURCE PASS
300 RELEASE PENDING
0 FAIL
```

`확정` 현재 Production Pointer는 schema v2, active null, `pointerMutationPerformed=false`다. 따라서 R12A source 단계에서 실제 target·previous package가 있다고 가정하면 안 된다.

### 1.2 코드에서 확인된 공백

`확정` 기존 R12 모듈은 다음 위치에 존재한다.

```text
app/features/resample-runtime/r12/
```

그러나 importer는 거의 전부 다음 source harness에 한정된다.

```text
tools/resample-runtime-01-r12/
```

`확정` 현재 제품 `electron.mjs`, `preload.cjs`, renderer runtime module에는 R12 update coordinator가 없다.

`확정` 현재 `prepareAtomicUpdate()`는 transition lease, package closure, target identity, staged canary까지만 확인한다. Transaction 생성, journal flush, R11A session drain, local pointer CAS, launcher handoff, target process re-attestation을 하나의 authority로 실행하지 않는다.

`확정` 현재 `handoffToR11()`은 옛 R11 final state와 self-hash runtime token을 요구한다. R11A main-secret HMAC session·operation grant 권위와 호환되지 않는다.

`확정` 현재 R11A controller는 session revoke와 save-session registry를 갖지만 다음 update drain API가 없다.

- 신규 bootstrap 차단
- 신규 Preview·Export grant 차단
- 전체 active session drain
- pending grant·save session count receipt
- update commit 전 window show barrier

`확정` 현재 R12 installed runner는 외부 launcher가 evidence를 만들라고 출력할 뿐 실제 update orchestration을 수행하지 않는다.

## 2. 목표

R12A의 목표는 다음 단일 installed update chain을 제품 본선에 구현하는 것이다.

```text
R10A controlled release transition
→ existing R11A source session admission replay
→ package staging and staged canary
→ main-process session drain
→ local activation pointer CAS
→ stable launcher target relaunch
→ target R11A hidden startup re-attestation
→ transaction commit
→ normal Preview·Export resume
```

Interrupted update는 부트 시작 시 transaction, journal, local pointer, executing package, Production Pointer, package closure, R11A re-attestation receipt를 함께 읽어 복구한다.

## 3. 비목표

R12A는 다음을 하지 않는다.

- Production Pointer CAS
- R10A release qualification 대체
- R9A physical GPU 검증 대체
- package 파일의 in-place patch
- delta patch·hot patch
- 사용자 작업 파일 이동·변환
- remote silent rollback
- previous package에 normal runtime 권한 자동 부여
- R13 fleet rollout 결정

## 4. 권위와 SSOT

### 4.1 Persistent SSOT

```text
update transaction v2
+ append-only update journal v2
+ Local Activation Pointer
```

세 파일의 결론이 다르면 mtime이나 newest-file heuristic으로 고르지 않는다. Joint recovery matrix가 유일한 판정 권위다.

### 4.2 Live SSOT

Electron main의 `R12AMainUpdateCoordinator`만 다음을 소유한다.

- active update lock
- current update transaction
- R11A drain lifecycle
- package staging orchestration
- local pointer CAS invocation
- launcher handoff
- update IPC
- recovery preflight
- window-show barrier

### 4.3 Session SSOT

R11A `MainSessionAuthority`가 session과 operation grant의 유일한 권위다. R12A는 R11A에 drain을 요청하고 receipt를 소비한다. R12A가 session MAC을 만들거나 검증키를 renderer에 내리지 않는다.

### 4.4 Release SSOT

R10A Production Pointer와 final release receipt가 target·previous release identity의 유일한 권위다. R12A는 read-only다.

### 4.5 Launch SSOT

Stable launcher는 Local Activation Pointer를 읽어 package를 선택하는 유일한 process launch 권위다. Electron package 내부 코드가 임의 package 경로를 spawn하지 않는다.

## 5. Canonical states

### 5.1 Main coordinator state

```ts
type R12ACoordinatorState =
  | 'BOOT_RECOVERY_PREFLIGHT'
  | 'IDLE'
  | 'TRANSITION_DETECTED'
  | 'STAGING'
  | 'STAGED_VALIDATED'
  | 'DRAIN_REQUESTED'
  | 'DRAINING'
  | 'DRAINED'
  | 'ACTIVATING'
  | 'RELAUNCH_PENDING'
  | 'TARGET_REATTESTING'
  | 'COMMITTING'
  | 'COMMITTED'
  | 'RECOVERY_REQUIRED'
  | 'QUARANTINED'
```

### 5.2 Persistent transaction v2

```ts
type R12ATransactionState =
  | 'CREATED'
  | 'R10A_TARGET_ADMITTED'
  | 'R11A_SOURCE_SESSION_ADMITTED'
  | 'PAYLOAD_MATERIALIZED'
  | 'CLOSURE_VERIFIED'
  | 'STAGED_CANARY_PASSED'
  | 'DRAIN_INTENT_WRITTEN'
  | 'SESSION_DRAINING'
  | 'SESSION_DRAINED'
  | 'ACTIVATION_INTENT_WRITTEN'
  | 'PACKAGE_COMMITTED'
  | 'POINTER_CAS_COMMITTED'
  | 'RELAUNCH_REQUESTED'
  | 'TARGET_PROCESS_STARTED'
  | 'R11A_REATTESTED'
  | 'COMMITTED'
```

상태 skip, rewind, duplicate effect는 모두 거부한다.

## 6. Controlled R10A transition admission

R12A는 generic pointer drift를 update로 해석하지 않는다. 다음 모두가 맞을 때만 controlled transition으로 인정한다.

```text
existing R11A session.packageContentId
= R10A release previousPackageContentId

current Production Pointer.activePackageContentId
= R10A release targetPackageContentId

existing R11A session.pointerGeneration/rawSha256
= R10A promotion before-image

current Production Pointer generation/rawSha256
= R10A promotion after-image
```

이 transition이 확인되면 normal work를 계속 허용하지 않고 즉시 update drain admission으로 이동한다. unrelated drift는 quarantine 또는 hard stop이다.

## 7. R11A installed admission replay

Source session은 R11A main authority에서 다시 검증한다.

검증 대상:

- HMAC session envelope
- BrowserWindow ID
- webContents ID
- renderer PID
- source build/package
- source pointer generation/hash
- device epoch
- quarantine clear
- session active

R12A는 renderer가 전달한 session field를 신뢰하지 않는다. Main registry lookup 결과가 source truth다.

## 8. Main-process update coordinator

### 8.1 생성 순서

```text
app.whenReady
→ R12A boot recovery preflight
→ R11A controller creation
→ R12A coordinator creation and R11A binding
→ IPC registration
→ BrowserWindow creation
```

Recovery-required 상태에서는 normal BrowserWindow를 만들지 않는다.

### 8.2 Narrow IPC

Renderer에 허용되는 surface:

```ts
interface R12AUpdateApi {
  status(): Promise<PublicUpdateStatus>
  requestUpdate(input: UpdateRequest): Promise<UpdateRequestReceipt>
  acknowledgeDrain(input: DrainAck): Promise<DrainAckReceipt>
  cancelBeforeActivation(input: CancelRequest): Promise<CancelReceipt>
}
```

Renderer에는 다음을 노출하지 않는다.

- install root raw path
- pointer file path
- transaction file path
- journal path
- package store write API
- CAS function
- launcher nonce writer
- R11A master key

## 9. Update lock

Update lock은 exclusive create로 획득한다. Lock에는 transaction ID, owner PID, owner process start identity, source package, target package가 포함된다.

Age만 보고 stale lock을 삭제하면 안 된다. 다음을 함께 확인한다.

- owner PID 생존 여부
- owner process start identity
- transaction state
- journal head
- local pointer transaction ID

결론이 모호하면 `E_R12A_UPDATE_LOCK_AMBIGUOUS`다.

## 10. Package staging and staged canary

기존 R12 path policy와 immutable package store를 재사용한다. R12A는 R8A·R9A·R10A·R11A current lineage를 추가로 요구한다.

Staged process는 다음 권한을 갖지 않는다.

```text
normal R11A session issuance = false
Preview user job             = false
Export user job              = false
host save                     = false
Production Pointer write      = false
Local Pointer write           = false
```

Staged canary는 R9A physical identity, single-submit count, validation counter zero, Preview·strict Export smoke를 확인한다.

## 11. Pre-activation session drain

### 11.1 Drain 순서

```text
persist DRAIN_INTENT
→ block new R11A bootstrap
→ block new Preview·Export grant
→ notify all admitted renderers
→ suspend Preview scheduler
→ suspend Export queue
→ revoke open operation grants
→ abort open Electron save sessions
→ wait bounded GPU/worker completion
→ close or hide normal windows
→ seal drain receipt
```

### 11.2 Bounded deadline

Installed default drain deadline는 30,000ms다. Deadline 도달 시 남은 Preview frame, Export job, save temp를 명시적으로 abort한다. 조용히 success로 계산하지 않는다.

### 11.3 Drain completion invariant

Pointer CAS 전에 다음이 모두 0이어야 한다.

```text
active normal sessions
open Preview grants
open Export grants
open Electron save sessions
pending encoder jobs
pending worker RPC
pinned final surfaces
unsettled submission tickets
visible normal windows
```

## 12. Activation intent and local pointer CAS

Activation intent v2는 다음 digest를 포함한다.

```ts
interface R12AActivationIntent {
  updateTransactionId: string
  r10aFinalReleaseDigest: string
  r11aSourceSessionDigest: string
  packageClosureDigest: string
  stagedCanaryDigest: string
  drainReceiptDigest: string
  expectedProductionPointerGeneration: number
  expectedProductionPointerRawSha256: string
  expectedLocalPointerGeneration: number
  expectedLocalPointerRawSha256: string | null
  targetBuildId: string
  targetPackageContentId: string
}
```

R12A가 변경하는 pointer는 `dadum.install.activation-pointer` 하나다. Production Pointer writer import는 금지한다.

Local pointer CAS는 activation selection commit point다. 전체 update transaction은 target R11A re-attestation 이후에만 COMMITTED다.

## 13. Stable launcher handoff

Pointer CAS 이후 main process는 fsync된 relaunch request를 작성한다.

```ts
interface R12ARelaunchRequest {
  schemaId: 'tdt.resample-runtime.relaunch-request.r12a.v1'
  updateTransactionId: string
  sourcePid: number
  sourceProcessStartIdentity: string
  expectedLocalPointerGeneration: number
  expectedLocalPointerRawSha256: string
  targetBuildId: string
  targetPackageContentId: string
  installGeneration: number
  launchNonce: string
}
```

Stable launcher는 Local Pointer와 request를 함께 검증한 뒤 target package를 실행한다. Source package나 dev server로 fallback하지 않는다.

## 14. Target boot and R11A re-attestation

Target process는 BrowserWindow 생성 전에 R12A recovery preflight를 실행한다.

필수 일치:

```text
executing package
= Local Activation Pointer package
= Production Pointer active package
= transaction target package
= relaunch request target package
```

그 다음 기존 R11A hidden startup flow를 실행한다.

```text
installed closure
→ Active Graph
→ R9A identity
→ hidden GPU canary
→ fresh HMAC session generation
→ R12A re-attestation receipt
→ transaction COMMITTED
→ rendererReady show barrier release
```

Old session과 old operation grant는 target process에서 재사용할 수 없다.

## 15. Window show barrier

R11A `rendererReady`는 R12A에게 normal-window show authorization을 질의해야 한다.

허용 상태:

- no active update and no recovery
- transaction COMMITTED

금지 상태:

- drain requested or draining
- pointer activated but target not re-attested
- recovery required
- quarantine

## 16. Interrupted-update recovery matrix

Recovery는 normal runtime boot보다 먼저 실행한다.

| 경계 | 판정 |
|---|---|
| CREATED~CLOSURE_VERIFIED | staging resume 또는 discard, active unchanged |
| STAGED_CANARY_PASSED | drain 전이면 resume 가능 |
| DRAIN_INTENT_WRITTEN | 신규 admission block을 재구성하고 drain 재개 |
| SESSION_DRAINED, CAS 전 | source pointer 유지, activation 재개 또는 명시적 abort |
| PACKAGE_COMMITTED, CAS 전 | package store 유지, pointer unchanged |
| CAS intent 후 effect 전 | pointer readback으로 effect 여부 판정 |
| CAS effect 후 journal ack 전 | pointer target이면 effect receipt 재구성 |
| RELAUNCH_REQUESTED | old process normal runtime 금지, launcher handoff 재개 |
| TARGET_PROCESS_STARTED, R11A 전 | hidden recovery boot, re-attestation 재시도 |
| R11A_REATTESTED, COMMITTED 전 | receipt 검증 후 commit marker 재구성 |
| target re-attestation FAIL | target quarantine, previous recovery-only 고려 |
| journal/pointer/transaction 불일치 | ambiguous quarantine |

Recovery action은 반복 실행해도 같은 결론을 내야 한다.

## 17. Previous package and rollback coordination

Target 실패 시 R12A가 할 수 있는 일:

- previous package closure 확인
- Local Pointer를 previous로 recovery-only CAS
- recovery UI·diagnostic·updater 실행
- R10A rollback recommendation 생성

R12A가 할 수 없는 일:

- Production Pointer rollback
- previous package normal R11A session 발급
- remote silent rollback

Production Pointer가 target을 가리키는 동안 previous package는 normal Preview·Export를 실행할 수 없다.

## 18. Cross-generation exclusion

Generation identity는 다음 전체에 귀속된다.

- Electron main
- renderer
- worker
- WASM helper·pthread child
- native addon
- WGSL manifest
- pipeline cache
- Surface Registry
- encoder worker
- static server root
- lazy asset fetch

Old generation asset가 하나라도 로드되면 target re-attestation을 실패시킨다.

## 19. Privacy boundary

Update evidence에 허용되는 정보:

- build/package IDs
- internal install-relative canonical paths
- digest·count·state
- process role와 generation
- stable error code

금지되는 정보:

- 사용자 문서 경로·파일명
- 이미지·썸네일·픽셀 hash
- EXIF·문서 metadata
- account·email
- raw crash dump
- raw application log
- hardware serial

## 20. Stable errors

```text
E_R12A_PARENT_OR_LINEAGE_INVALID
E_R12A_R10A_RELEASE_MISSING
E_R12A_R11A_INSTALLED_ADMISSION_MISSING
E_R12A_CONTROLLED_TRANSITION_MISMATCH
E_R12A_UNRELATED_POINTER_DRIFT
E_R12A_SOURCE_SESSION_INVALID
E_R12A_UPDATE_ALREADY_ACTIVE
E_R12A_UPDATE_LOCK_HELD
E_R12A_UPDATE_LOCK_AMBIGUOUS
E_R12A_TRANSACTION_INVALID
E_R12A_TRANSACTION_STATE_SKIP
E_R12A_TRANSACTION_STATE_REWIND
E_R12A_JOURNAL_CHAIN_BROKEN
E_R12A_JOURNAL_INTENT_MISSING
E_R12A_PACKAGE_STAGING_FAILED
E_R12A_PACKAGE_CLOSURE_FAILED
E_R12A_STAGED_CANARY_FAILED
E_R12A_DRAIN_ADMISSION_NOT_BLOCKED
E_R12A_DRAIN_TIMEOUT
E_R12A_OPEN_SESSION_REMAINS
E_R12A_OPEN_GRANT_REMAINS
E_R12A_OPEN_SAVE_SESSION_REMAINS
E_R12A_RENDERER_DRAIN_ACK_MISSING
E_R12A_ACTIVATION_INTENT_STALE
E_R12A_LOCAL_POINTER_CAS_MISMATCH
E_R12A_PRODUCTION_POINTER_WRITE_ATTEMPT
E_R12A_RELAUNCH_REQUEST_INVALID
E_R12A_LAUNCHER_HANDOFF_FAILED
E_R12A_TARGET_PROCESS_IDENTITY_MISMATCH
E_R12A_R11A_REATTESTATION_FAILED
E_R12A_OLD_SESSION_REUSE
E_R12A_WINDOW_SHOW_BEFORE_COMMIT
E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS
E_R12A_PREVIOUS_PACKAGE_NOT_RECOVERABLE
E_R12A_RECOVERY_ONLY_REQUIRED
E_R12A_CROSS_GENERATION_ASSET
E_R12A_SILENT_RESTART_FORBIDDEN
E_R12A_FINAL_RECEIPT_INCOMPLETE
```

## 21. Required implementation surface

### 21.1 New main authority

```text
app/features/resample-runtime/r12a/
  r12a-contract.mjs
  main-update-coordinator.mjs
  r10a-transition-admission.mjs
  r11a-drain-adapter.mjs
  update-lock.mjs
  update-transaction-v2.mjs
  update-journal-v2.mjs
  staged-package-orchestrator.mjs
  activation-controller.mjs
  launcher-handoff.mjs
  boot-recovery-controller.mjs
  post-activation-reattestation.mjs
  finalizer.mjs
  privacy-policy.mjs
```

### 21.2 Required modifications

```text
electron.mjs
preload.cjs
app/src/env.d.ts
app/src/boot/runtime-modules.ts
app/src/boot/bootstrap-renderer.ts
app/src/runtime/service-token.ts
app/src/runtime/admission/installed-admission-service.ts
app/features/resample-runtime/r11a/main-session-authority.mjs
app/features/resample-runtime/r11a/electron-admission-controller.mjs
app/src/runtime/preview/preview-presenter-service.ts
app/src/runtime/export/export-authority-service.ts
Active Graph generator and generated graph
runtime manifest generator and generated manifest
```

### 21.3 Stable launcher surface

```text
launcher/resample-runtime-r12a/
  read-local-pointer
  verify-relaunch-request
  verify-package-closure
  launch-target
  write-launch-ack
```

## 22. Required source artifacts

- R12A parent freeze receipt
- R12A authority and state model receipt
- R12A transition admission self-test
- R12A transaction/journal/lock self-test
- R12A session drain self-test
- R12A activation/relaunch self-test
- R12A recovery matrix self-test
- R12A negative-control report
- Active Graph receipt
- JavaScript parse closure receipt
- TypeScript syntax receipt
- isolated R11A/R10A predecessor regression
- source gate report
- source final receipt

## 23. Required installed artifacts

- R9A physical final receipt
- R10A final release receipt
- R10A lineage restoration receipt
- R11A installed final receipt
- controlled transition admission receipt
- package staging and closure receipt
- staged canary receipt
- session drain receipt
- activation intent
- Local Pointer CAS receipt
- relaunch request and launcher ack
- target process boot receipt
- R11A re-attestation receipt
- transaction commit receipt
- interruption recovery matrix receipt
- quarantine·rollback coordination receipt
- installed gate report
- final installed update receipt

## 24. Negative controls

Source와 installed 양쪽에서 최소 다음을 깨뜨려야 한다.

1. unrelated Production Pointer drift
2. renderer가 만든 가짜 source session
3. stale session generation
4. second update lock acquisition
5. transaction state skip·rewind
6. journal effect without intent
7. staged process normal session 발급
8. drain 중 신규 Preview grant
9. drain 중 신규 Export grant
10. open save session을 남긴 pointer CAS
11. drain ack 없이 pointer CAS
12. stale local pointer raw hash
13. Production Pointer writer import
14. relaunch request nonce 변조
15. old process normal window 재표시
16. target process package mismatch
17. old session 재사용
18. old operation grant 재사용
19. R11A pass 없이 COMMITTED marker
20. COMMITTED 전 BrowserWindow.show
21. CAS effect 후 journal ack 전 kill
22. target boot 후 R11A 전 kill
23. R11A pass 후 commit 전 kill
24. previous package normal session 발급
25. old worker·WASM·native·WGSL asset
26. source/dev-server fallback
27. user document path evidence 유입
28. historical receipt mutation
29. installed receipt 없는 finalization
30. silent restart or silent rollback

## 25. Source acceptance

```text
RESAMPLE_RUNTIME_R12A_ATOMIC_UPDATE_MAIN_INTEGRATION_SOURCE_SEALED_AWAITING_R11A_INSTALLED_AND_R10A_RELEASE

360 SOURCE PASS
480 INSTALLED PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

productionPointerMutated = false
localActivationPointerMutated = false
installedUpdateExecuted = false
historicalPassCarryForward = 0
```

## 26. Final installed acceptance

```text
RESAMPLE_RUNTIME_R12A_ATOMIC_UPDATE_MAIN_INTEGRATION_AND_INTERRUPTED_RECOVERY_SEALED_AWAITING_R13A

360 SOURCE PASS
480 INSTALLED PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

r10aReleaseAdmitted = true
r11aSourceSessionReplayed = true
preActivationDrainPassed = true
localActivationPointerCasCount = 1
targetR11AReattested = true
interruptedRecoveryMatrixPassed = true
crossGenerationAssetCount = 0
productionPointerMutated = false
quarantined = false
```

## 27. Source gate catalog

### 27.1 PARENT_AND_LINEAGE

#### R12A-S001 `PARENT_BUNDLE_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: parent bundle present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S001 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S002 `PARENT_BUNDLE_SHA256_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: parent bundle sha256 exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S002 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S003 `PARENT_R11A_SPEC_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: parent r11a spec present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S003 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S004 `PARENT_R11A_SPEC_SHA256_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: parent r11a spec sha256 exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S004 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S005 `PARENT_R11A_SOURCE_RECEIPT_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: parent r11a source receipt present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S005 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S006 `PARENT_R11A_SOURCE_RECEIPT_SHA256_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: parent r11a source receipt sha256 exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S006 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S007 `PARENT_R11A_STATE_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: parent r11a state exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S007 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S008 `PARENT_R11A_SOURCE_PASS_332`

- 등급: `SOURCE_MANDATORY`
- 요구: parent r11a source pass 332가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S008 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S009 `PARENT_R11A_INSTALLED_PENDING_400`

- 등급: `SOURCE_MANDATORY`
- 요구: parent r11a installed pending 400가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S009 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S010 `PARENT_R11A_FAIL_ZERO`

- 등급: `SOURCE_MANDATORY`
- 요구: parent r11a fail zero가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S010 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S011 `CURRENT_R10A_SOURCE_RECEIPT_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: current r10a source receipt present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S011 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S012 `CURRENT_R10A_SOURCE_RECEIPT_SHA256_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: current r10a source receipt sha256 exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S012 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S013 `CURRENT_R10A_SOURCE_PASS_260`

- 등급: `SOURCE_MANDATORY`
- 요구: current r10a source pass 260가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S013 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S014 `CURRENT_R10A_RELEASE_PENDING_300`

- 등급: `SOURCE_MANDATORY`
- 요구: current r10a release pending 300가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S014 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S015 `CURRENT_R10A_FAIL_ZERO`

- 등급: `SOURCE_MANDATORY`
- 요구: current r10a fail zero가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S015 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S016 `PRODUCTION_POINTER_MIRRORS_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: production pointer mirrors present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S016 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S017 `PRODUCTION_POINTER_MIRROR_SHA256_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: production pointer mirror sha256 exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S017 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S018 `PRODUCTION_POINTER_SCHEMA_V2_RECORDED`

- 등급: `SOURCE_MANDATORY`
- 요구: production pointer schema v2 recorded가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S018 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S019 `PRODUCTION_POINTER_ACTIVE_NULL_RECORDED`

- 등급: `SOURCE_MANDATORY`
- 요구: production pointer active null recorded가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S019 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S020 `PRODUCTION_POINTER_MUTATION_FALSE_RECORDED`

- 등급: `SOURCE_MANDATORY`
- 요구: production pointer mutation false recorded가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S020 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S021 `R12_HISTORICAL_RECEIPT_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: r12 historical receipt present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S021 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S022 `R12_HISTORICAL_RECEIPT_MARKED_SUPERSEDED`

- 등급: `SOURCE_MANDATORY`
- 요구: r12 historical receipt marked superseded가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S022 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S023 `R12A_SPEC_ID_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: r12a spec id exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S023 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S024 `R12A_SOURCE_STATE_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: r12a source state exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S024 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S025 `R12A_SOURCE_GATE_COUNT_360`

- 등급: `SOURCE_MANDATORY`
- 요구: r12a source gate count 360가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S025 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S026 `R12A_INSTALLED_GATE_COUNT_480`

- 등급: `SOURCE_MANDATORY`
- 요구: r12a installed gate count 480가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S026 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S027 `R12A_TOTAL_GATE_COUNT_840`

- 등급: `SOURCE_MANDATORY`
- 요구: r12a total gate count 840가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S027 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S028 `HISTORICAL_PASS_CARRY_FORWARD_ZERO`

- 등급: `SOURCE_MANDATORY`
- 요구: historical pass carry forward zero가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S028 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S029 `R11A_R10A_LINEAGE_ORDER_EXACT`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a r10a lineage order exact가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S029 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

#### R12A-S030 `PARENT_BYTES_IMMUTABLE`

- 등급: `SOURCE_MANDATORY`
- 요구: parent bytes immutable가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_PARENT_AND_LINEAGE_RECEIPT.json` 및 source gate report의 R12A-S030 항목
- 실패: `E_R12A_PARENT_OR_LINEAGE_INVALID`

### 27.2 AUTHORITY_AND_STATE_MODEL

#### R12A-S031 `MAIN_UPDATE_COORDINATOR_SINGLETON_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: main update coordinator singleton declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S031 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S032 `MAIN_UPDATE_COORDINATOR_SINGLETON_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: main update coordinator singleton verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S032 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S033 `PERSISTENT_TRANSACTION_V2_SSOT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: persistent transaction v2 ssot declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S033 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S034 `PERSISTENT_TRANSACTION_V2_SSOT_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: persistent transaction v2 ssot verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S034 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S035 `APPEND_ONLY_JOURNAL_V2_SSOT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: append only journal v2 ssot declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S035 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S036 `APPEND_ONLY_JOURNAL_V2_SSOT_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: append only journal v2 ssot verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S036 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S037 `LOCAL_ACTIVATION_POINTER_SSOT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: local activation pointer ssot declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S037 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S038 `LOCAL_ACTIVATION_POINTER_SSOT_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: local activation pointer ssot verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S038 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S039 `R11A_SESSION_AUTHORITY_SEPARATION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a session authority separation declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S039 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S040 `R11A_SESSION_AUTHORITY_SEPARATION_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a session authority separation verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S040 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S041 `R10A_PRODUCTION_POINTER_READ_ONLY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a production pointer read only declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S041 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S042 `R10A_PRODUCTION_POINTER_READ_ONLY_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a production pointer read only verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S042 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S043 `STABLE_LAUNCHER_AUTHORITY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: stable launcher authority declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S043 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S044 `STABLE_LAUNCHER_AUTHORITY_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: stable launcher authority verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S044 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S045 `NORMAL_RUNTIME_BOOT_BARRIER_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: normal runtime boot barrier declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S045 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S046 `NORMAL_RUNTIME_BOOT_BARRIER_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: normal runtime boot barrier verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S046 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S047 `RECOVERY_ONLY_CAPABILITY_SET_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery only capability set declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S047 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S048 `RECOVERY_ONLY_CAPABILITY_SET_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery only capability set verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S048 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S049 `UPDATE_TRANSITION_STATE_MACHINE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: update transition state machine declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S049 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S050 `UPDATE_TRANSITION_STATE_MACHINE_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: update transition state machine verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S050 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S051 `PROCESS_GENERATION_BINDING_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: process generation binding declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S051 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S052 `PROCESS_GENERATION_BINDING_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: process generation binding verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S052 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S053 `NO_RENDERER_POINTER_WRITE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: no renderer pointer write declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S053 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S054 `NO_RENDERER_POINTER_WRITE_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: no renderer pointer write verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S054 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S055 `NO_RENDERER_JOURNAL_WRITE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: no renderer journal write declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S055 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S056 `NO_RENDERER_JOURNAL_WRITE_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: no renderer journal write verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S056 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S057 `NO_HOT_PATCH_AUTHORITY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: no hot patch authority declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S057 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S058 `NO_HOT_PATCH_AUTHORITY_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: no hot patch authority verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S058 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S059 `NO_DELTA_PATCH_AUTHORITY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: no delta patch authority declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S059 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

#### R12A-S060 `NO_DELTA_PATCH_AUTHORITY_VERIFIER_BOUND`

- 등급: `SOURCE_MANDATORY`
- 요구: no delta patch authority verifier bound가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_AUTHORITY_STATE_MODEL_RECEIPT.json` 및 source gate report의 R12A-S060 항목
- 실패: `E_R12A_AUTHORITY_INVALID`

### 27.3 R10A_R11A_TRANSITION_ADMISSION

#### R12A-S061 `R10A_FINAL_RELEASE_INPUT_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a final release input required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S061 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S062 `R10A_FINAL_RELEASE_INPUT_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a final release input negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S062 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S063 `R10A_LINEAGE_RESTORATION_INPUT_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a lineage restoration input required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S063 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S064 `R10A_LINEAGE_RESTORATION_INPUT_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a lineage restoration input negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S064 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S065 `R10A_PROMOTION_BEFORE_IDENTITY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a promotion before identity required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S065 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S066 `R10A_PROMOTION_BEFORE_IDENTITY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a promotion before identity negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S066 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S067 `R10A_PROMOTION_AFTER_IDENTITY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a promotion after identity required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S067 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S068 `R10A_PROMOTION_AFTER_IDENTITY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: r10a promotion after identity negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S068 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S069 `SOURCE_SESSION_ENVELOPE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source session envelope required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S069 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S070 `SOURCE_SESSION_ENVELOPE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: source session envelope negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S070 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S071 `SOURCE_SESSION_POINTER_GENERATION_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source session pointer generation required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S071 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S072 `SOURCE_SESSION_POINTER_GENERATION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: source session pointer generation negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S072 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S073 `SOURCE_SESSION_POINTER_RAW_HASH_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source session pointer raw hash required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S073 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S074 `SOURCE_SESSION_POINTER_RAW_HASH_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: source session pointer raw hash negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S074 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S075 `SOURCE_PACKAGE_EQUALS_R10A_PREVIOUS_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source package equals r10a previous required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S075 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S076 `SOURCE_PACKAGE_EQUALS_R10A_PREVIOUS_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: source package equals r10a previous negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S076 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S077 `TARGET_PACKAGE_EQUALS_R10A_ACTIVE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target package equals r10a active required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S077 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S078 `TARGET_PACKAGE_EQUALS_R10A_ACTIVE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target package equals r10a active negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S078 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S079 `CONTROLLED_POINTER_DRIFT_ONLY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: controlled pointer drift only required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S079 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S080 `CONTROLLED_POINTER_DRIFT_ONLY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: controlled pointer drift only negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S080 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S081 `UNRELATED_POINTER_DRIFT_REJECTED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: unrelated pointer drift rejected required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S081 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S082 `UNRELATED_POINTER_DRIFT_REJECTED_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: unrelated pointer drift rejected negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S082 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S083 `SOURCE_SESSION_HMAC_VALIDATED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source session hmac validated required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S083 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S084 `SOURCE_SESSION_HMAC_VALIDATED_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: source session hmac validated negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S084 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S085 `SOURCE_SESSION_SENDER_BINDING_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source session sender binding required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S085 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S086 `SOURCE_SESSION_SENDER_BINDING_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: source session sender binding negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S086 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S087 `SOURCE_SESSION_NOT_QUARANTINED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source session not quarantined required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S087 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S088 `SOURCE_SESSION_NOT_QUARANTINED_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: source session not quarantined negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S088 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S089 `UPDATE_TRANSITION_LEASE_SINGLE_USE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: update transition lease single use required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S089 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

#### R12A-S090 `UPDATE_TRANSITION_LEASE_SINGLE_USE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: update transition lease single use negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSITION_ADMISSION_RECEIPT.json` 및 source gate report의 R12A-S090 항목
- 실패: `E_R12A_TRANSITION_ADMISSION_FAILED`

### 27.4 MAIN_PROCESS_COORDINATOR_AND_IPC

#### R12A-S091 `ELECTRON_MAIN_IMPORT_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: electron main import present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S091 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S092 `ELECTRON_MAIN_IMPORT_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: electron main import fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S092 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S093 `COORDINATOR_CREATED_BEFORE_WINDOW_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: coordinator created before window present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S093 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S094 `COORDINATOR_CREATED_BEFORE_WINDOW_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: coordinator created before window fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S094 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S095 `RECOVERY_PREFLIGHT_BEFORE_R11A_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery preflight before r11a present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S095 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S096 `RECOVERY_PREFLIGHT_BEFORE_R11A_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery preflight before r11a fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S096 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S097 `UPDATE_IPC_NARROW_SURFACE_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: update ipc narrow surface present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S097 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S098 `UPDATE_IPC_NARROW_SURFACE_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: update ipc narrow surface fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S098 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S099 `UPDATE_STATUS_READ_ONLY_IPC_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: update status read only ipc present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S099 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S100 `UPDATE_STATUS_READ_ONLY_IPC_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: update status read only ipc fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S100 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S101 `UPDATE_REQUEST_SESSION_BOUND_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: update request session bound present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S101 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S102 `UPDATE_REQUEST_SESSION_BOUND_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: update request session bound fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S102 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S103 `UPDATE_REQUEST_OPERATOR_INTENT_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: update request operator intent present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S103 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S104 `UPDATE_REQUEST_OPERATOR_INTENT_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: update request operator intent fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S104 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S105 `PRELOAD_NO_POINTER_PATH_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: preload no pointer path present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S105 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S106 `PRELOAD_NO_POINTER_PATH_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: preload no pointer path fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S106 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S107 `PRELOAD_NO_JOURNAL_PATH_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: preload no journal path present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S107 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S108 `PRELOAD_NO_JOURNAL_PATH_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: preload no journal path fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S108 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S109 `PRELOAD_NO_SIGNING_KEY_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: preload no signing key present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S109 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S110 `PRELOAD_NO_SIGNING_KEY_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: preload no signing key fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S110 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S111 `RENDERER_UPDATE_SERVICE_CONSUMER_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: renderer update service consumer present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S111 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S112 `RENDERER_UPDATE_SERVICE_CONSUMER_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: renderer update service consumer fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S112 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S113 `ACTIVE_GRAPH_UPDATE_NODE_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: active graph update node present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S113 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S114 `ACTIVE_GRAPH_UPDATE_NODE_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: active graph update node fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S114 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S115 `RUNTIME_MANIFEST_UPDATE_MODULE_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: runtime manifest update module present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S115 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S116 `RUNTIME_MANIFEST_UPDATE_MODULE_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: runtime manifest update module fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S116 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S117 `WINDOW_SHOW_R12A_BARRIER_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: window show r12a barrier present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S117 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S118 `WINDOW_SHOW_R12A_BARRIER_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: window show r12a barrier fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S118 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S119 `APP_QUIT_COORDINATOR_HOOK_PRESENT`

- 등급: `SOURCE_MANDATORY`
- 요구: app quit coordinator hook present가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S119 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

#### R12A-S120 `APP_QUIT_COORDINATOR_HOOK_FAIL_CLOSED`

- 등급: `SOURCE_MANDATORY`
- 요구: app quit coordinator hook fail closed가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_MAIN_COORDINATOR_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S120 항목
- 실패: `E_R12A_MAIN_COORDINATOR_FAILED`

### 27.5 TRANSACTION_JOURNAL_LOCK_V2

#### R12A-S121 `TRANSACTION_V2_SCHEMA_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction v2 schema declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S121 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S122 `TRANSACTION_V2_SCHEMA_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction v2 schema self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S122 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S123 `TRANSACTION_ID_192_BIT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction id 192 bit declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S123 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S124 `TRANSACTION_ID_192_BIT_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction id 192 bit self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S124 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S125 `TRANSACTION_SOURCE_IDENTITY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction source identity declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S125 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S126 `TRANSACTION_SOURCE_IDENTITY_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction source identity self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S126 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S127 `TRANSACTION_TARGET_IDENTITY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction target identity declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S127 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S128 `TRANSACTION_TARGET_IDENTITY_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction target identity self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S128 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S129 `TRANSACTION_R10A_RELEASE_BINDING_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction r10a release binding declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S129 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S130 `TRANSACTION_R10A_RELEASE_BINDING_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction r10a release binding self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S130 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S131 `TRANSACTION_R11A_SOURCE_SESSION_BINDING_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction r11a source session binding declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S131 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S132 `TRANSACTION_R11A_SOURCE_SESSION_BINDING_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction r11a source session binding self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S132 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S133 `TRANSACTION_PRODUCTION_POINTER_BINDING_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction production pointer binding declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S133 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S134 `TRANSACTION_PRODUCTION_POINTER_BINDING_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction production pointer binding self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S134 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S135 `TRANSACTION_LOCAL_POINTER_BINDING_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction local pointer binding declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S135 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S136 `TRANSACTION_LOCAL_POINTER_BINDING_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction local pointer binding self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S136 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S137 `TRANSACTION_MONOTONIC_SEQUENCE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction monotonic sequence declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S137 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S138 `TRANSACTION_MONOTONIC_SEQUENCE_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction monotonic sequence self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S138 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S139 `TRANSACTION_STATE_SKIP_REJECTED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction state skip rejected declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S139 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S140 `TRANSACTION_STATE_SKIP_REJECTED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction state skip rejected self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S140 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S141 `JOURNAL_V2_HASH_CHAIN_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: journal v2 hash chain declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S141 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S142 `JOURNAL_V2_HASH_CHAIN_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: journal v2 hash chain self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S142 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S143 `JOURNAL_INTENT_BEFORE_EFFECT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: journal intent before effect declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S143 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S144 `JOURNAL_INTENT_BEFORE_EFFECT_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: journal intent before effect self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S144 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S145 `JOURNAL_FSYNC_BEFORE_EFFECT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: journal fsync before effect declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S145 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S146 `JOURNAL_FSYNC_BEFORE_EFFECT_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: journal fsync before effect self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S146 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S147 `SINGLE_ACTIVE_UPDATE_LOCK_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: single active update lock declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S147 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S148 `SINGLE_ACTIVE_UPDATE_LOCK_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: single active update lock self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S148 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S149 `STALE_LOCK_PID_VERIFICATION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: stale lock pid verification declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S149 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

#### R12A-S150 `STALE_LOCK_PID_VERIFICATION_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: stale lock pid verification self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_TRANSACTION_JOURNAL_LOCK_RECEIPT.json` 및 source gate report의 R12A-S150 항목
- 실패: `E_R12A_TRANSACTION_OR_LOCK_INVALID`

### 27.6 STAGING_CLOSURE_AND_CANARY

#### R12A-S151 `R12_PACKAGE_PATH_POLICY_REUSED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: r12 package path policy reused required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S151 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S152 `R12_PACKAGE_PATH_POLICY_REUSED_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: r12 package path policy reused negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S152 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S153 `SAME_VOLUME_LAYOUT_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: same volume layout required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S153 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S154 `SAME_VOLUME_LAYOUT_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: same volume layout negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S154 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S155 `TARGET_IMMUTABLE_PACKAGE_STORE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target immutable package store required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S155 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S156 `TARGET_IMMUTABLE_PACKAGE_STORE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target immutable package store negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S156 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S157 `TARGET_PACKAGE_CONTENT_ID_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target package content id required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S157 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S158 `TARGET_PACKAGE_CONTENT_ID_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target package content id negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S158 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S159 `TARGET_BUILD_ID_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target build id required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S159 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S160 `TARGET_BUILD_ID_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target build id negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S160 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S161 `TARGET_RUNTIME_CLOSURE_DIGEST_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target runtime closure digest required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S161 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S162 `TARGET_RUNTIME_CLOSURE_DIGEST_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target runtime closure digest negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S162 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S163 `TARGET_ACTIVE_GRAPH_DIGEST_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target active graph digest required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S163 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S164 `TARGET_ACTIVE_GRAPH_DIGEST_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target active graph digest negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S164 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S165 `TARGET_JAVASCRIPT_PARSE_DIGEST_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target javascript parse digest required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S165 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S166 `TARGET_JAVASCRIPT_PARSE_DIGEST_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target javascript parse digest negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S166 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S167 `TARGET_R9A_PHYSICAL_DIGEST_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target r9a physical digest required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S167 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S168 `TARGET_R9A_PHYSICAL_DIGEST_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target r9a physical digest negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S168 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S169 `STAGED_EXECUTION_ROLE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: staged execution role required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S169 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S170 `STAGED_EXECUTION_ROLE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: staged execution role negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S170 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S171 `STAGED_LAUNCH_ENVELOPE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: staged launch envelope required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S171 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S172 `STAGED_LAUNCH_ENVELOPE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: staged launch envelope negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S172 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S173 `STAGED_NO_NORMAL_SESSION_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: staged no normal session required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S173 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S174 `STAGED_NO_NORMAL_SESSION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: staged no normal session negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S174 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S175 `STAGED_R11A_CANARY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: staged r11a canary required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S175 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S176 `STAGED_R11A_CANARY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: staged r11a canary negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S176 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S177 `STAGED_PREVIEW_EXPORT_SMOKE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: staged preview export smoke required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S177 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S178 `STAGED_PREVIEW_EXPORT_SMOKE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: staged preview export smoke negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S178 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S179 `STAGED_CPU_FALLBACK_ZERO_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: staged cpu fallback zero required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S179 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

#### R12A-S180 `STAGED_CPU_FALLBACK_ZERO_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: staged cpu fallback zero negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_STAGING_CANARY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S180 항목
- 실패: `E_R12A_STAGING_OR_CANARY_FAILED`

### 27.7 PRE_ACTIVATION_SESSION_DRAIN

#### R12A-S181 `DRAIN_INTENT_PERSISTED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: drain intent persisted declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S181 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S182 `DRAIN_INTENT_PERSISTED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: drain intent persisted self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S182 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S183 `NEW_BOOTSTRAP_BLOCKED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: new bootstrap blocked declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S183 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S184 `NEW_BOOTSTRAP_BLOCKED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: new bootstrap blocked self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S184 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S185 `NEW_JOB_GRANT_BLOCKED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: new job grant blocked declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S185 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S186 `NEW_JOB_GRANT_BLOCKED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: new job grant blocked self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S186 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S187 `ACTIVE_SESSIONS_ENUMERATED_MAIN_ONLY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: active sessions enumerated main only declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S187 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S188 `ACTIVE_SESSIONS_ENUMERATED_MAIN_ONLY_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: active sessions enumerated main only self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S188 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S189 `ACTIVE_PREVIEW_GRANTS_REVOKED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: active preview grants revoked declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S189 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S190 `ACTIVE_PREVIEW_GRANTS_REVOKED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: active preview grants revoked self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S190 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S191 `ACTIVE_EXPORT_GRANTS_REVOKED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: active export grants revoked declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S191 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S192 `ACTIVE_EXPORT_GRANTS_REVOKED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: active export grants revoked self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S192 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S193 `OPEN_SAVE_SESSIONS_ABORTED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: open save sessions aborted declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S193 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S194 `OPEN_SAVE_SESSIONS_ABORTED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: open save sessions aborted self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S194 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S195 `RENDERER_DRAIN_NOTIFICATION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: renderer drain notification declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S195 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S196 `RENDERER_DRAIN_NOTIFICATION_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: renderer drain notification self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S196 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S197 `RENDERER_DRAIN_ACK_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: renderer drain ack declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S197 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S198 `RENDERER_DRAIN_ACK_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: renderer drain ack self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S198 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S199 `PREVIEW_SCHEDULER_SUSPENDED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: preview scheduler suspended declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S199 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S200 `PREVIEW_SCHEDULER_SUSPENDED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: preview scheduler suspended self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S200 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S201 `EXPORT_QUEUE_SUSPENDED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: export queue suspended declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S201 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S202 `EXPORT_QUEUE_SUSPENDED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: export queue suspended self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S202 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S203 `GPU_COMPLETION_TICKETS_SETTLED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: gpu completion tickets settled declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S203 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S204 `GPU_COMPLETION_TICKETS_SETTLED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: gpu completion tickets settled self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S204 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S205 `DRAIN_DEADLINE_BOUNDED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: drain deadline bounded declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S205 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S206 `DRAIN_DEADLINE_BOUNDED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: drain deadline bounded self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S206 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S207 `FORCED_ABORT_RECEIPT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: forced abort receipt declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S207 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S208 `FORCED_ABORT_RECEIPT_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: forced abort receipt self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S208 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S209 `DRAIN_ZERO_COUNTS_REQUIRED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: drain zero counts required declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S209 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

#### R12A-S210 `DRAIN_ZERO_COUNTS_REQUIRED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: drain zero counts required self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_SESSION_DRAIN_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S210 항목
- 실패: `E_R12A_SESSION_DRAIN_FAILED`

### 27.8 LOCAL_ACTIVATION_AND_RELAUNCH

#### R12A-S211 `ACTIVATION_INTENT_V2_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: activation intent v2 required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S211 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S212 `ACTIVATION_INTENT_V2_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: activation intent v2 negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S212 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S213 `ACTIVATION_INTENT_DRAIN_BOUND_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: activation intent drain bound required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S213 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S214 `ACTIVATION_INTENT_DRAIN_BOUND_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: activation intent drain bound negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S214 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S215 `ACTIVATION_INTENT_STAGED_CANARY_BOUND_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: activation intent staged canary bound required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S215 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S216 `ACTIVATION_INTENT_STAGED_CANARY_BOUND_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: activation intent staged canary bound negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S216 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S217 `ACTIVATION_INTENT_POINTERS_FROZEN_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: activation intent pointers frozen required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S217 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S218 `ACTIVATION_INTENT_POINTERS_FROZEN_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: activation intent pointers frozen negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S218 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S219 `PACKAGE_STORE_COMMIT_BEFORE_CAS_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: package store commit before cas required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S219 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S220 `PACKAGE_STORE_COMMIT_BEFORE_CAS_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: package store commit before cas negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S220 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S221 `LOCAL_POINTER_RAW_HASH_CAS_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: local pointer raw hash cas required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S221 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S222 `LOCAL_POINTER_RAW_HASH_CAS_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: local pointer raw hash cas negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S222 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S223 `LOCAL_POINTER_GENERATION_CAS_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: local pointer generation cas required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S223 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S224 `LOCAL_POINTER_GENERATION_CAS_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: local pointer generation cas negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S224 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S225 `LOCAL_INSTALL_GENERATION_INCREMENT_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: local install generation increment required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S225 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S226 `LOCAL_INSTALL_GENERATION_INCREMENT_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: local install generation increment negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S226 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S227 `LOCAL_POINTER_READBACK_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: local pointer readback required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S227 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S228 `LOCAL_POINTER_READBACK_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: local pointer readback negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S228 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S229 `PRODUCTION_POINTER_WRITE_FORBIDDEN_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: production pointer write forbidden required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S229 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S230 `PRODUCTION_POINTER_WRITE_FORBIDDEN_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: production pointer write forbidden negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S230 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S231 `RELAUNCH_REQUEST_FSYNC_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: relaunch request fsync required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S231 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S232 `RELAUNCH_REQUEST_FSYNC_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: relaunch request fsync negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S232 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S233 `RELAUNCH_REQUEST_NONCE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: relaunch request nonce required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S233 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S234 `RELAUNCH_REQUEST_NONCE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: relaunch request nonce negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S234 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S235 `STABLE_LAUNCHER_HANDOFF_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: stable launcher handoff required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S235 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S236 `STABLE_LAUNCHER_HANDOFF_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: stable launcher handoff negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S236 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S237 `OLD_PROCESS_NO_NORMAL_REENTRY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: old process no normal reentry required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S237 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S238 `OLD_PROCESS_NO_NORMAL_REENTRY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: old process no normal reentry negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S238 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S239 `TARGET_PROCESS_LAUNCH_ENVELOPE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: target process launch envelope required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S239 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

#### R12A-S240 `TARGET_PROCESS_LAUNCH_ENVELOPE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target process launch envelope negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_ACTIVATION_RELAUNCH_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S240 항목
- 실패: `E_R12A_ACTIVATION_OR_RELAUNCH_FAILED`

### 27.9 POST_ACTIVATION_R11A_REATTESTATION

#### R12A-S241 `TARGET_BOOT_RECOVERY_PREFLIGHT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: target boot recovery preflight declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S241 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S242 `TARGET_BOOT_RECOVERY_PREFLIGHT_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: target boot recovery preflight self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S242 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S243 `EXECUTING_PACKAGE_EQUALS_LOCAL_POINTER_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: executing package equals local pointer declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S243 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S244 `EXECUTING_PACKAGE_EQUALS_LOCAL_POINTER_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: executing package equals local pointer self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S244 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S245 `EXECUTING_PACKAGE_EQUALS_PRODUCTION_ACTIVE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: executing package equals production active declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S245 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S246 `EXECUTING_PACKAGE_EQUALS_PRODUCTION_ACTIVE_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: executing package equals production active self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S246 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S247 `TARGET_CLOSURE_REVALIDATED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: target closure revalidated declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S247 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S248 `TARGET_CLOSURE_REVALIDATED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: target closure revalidated self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S248 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S249 `TARGET_ACTIVE_GRAPH_REVALIDATED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: target active graph revalidated declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S249 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S250 `TARGET_ACTIVE_GRAPH_REVALIDATED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: target active graph revalidated self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S250 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S251 `TARGET_R9A_IDENTITY_REVALIDATED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: target r9a identity revalidated declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S251 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S252 `TARGET_R9A_IDENTITY_REVALIDATED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: target r9a identity revalidated self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S252 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S253 `R11A_HIDDEN_WINDOW_CANARY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a hidden window canary declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S253 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S254 `R11A_HIDDEN_WINDOW_CANARY_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a hidden window canary self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S254 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S255 `R11A_FRESH_SESSION_GENERATION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a fresh session generation declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S255 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S256 `R11A_FRESH_SESSION_GENERATION_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a fresh session generation self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S256 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S257 `OLD_SESSION_REUSE_REJECTED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: old session reuse rejected declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S257 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S258 `OLD_SESSION_REUSE_REJECTED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: old session reuse rejected self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S258 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S259 `OLD_GRANT_REUSE_REJECTED_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: old grant reuse rejected declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S259 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S260 `OLD_GRANT_REUSE_REJECTED_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: old grant reuse rejected self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S260 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S261 `REATTESTATION_RECEIPT_SCHEMA_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: reattestation receipt schema declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S261 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S262 `REATTESTATION_RECEIPT_SCHEMA_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: reattestation receipt schema self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S262 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S263 `REATTESTATION_SESSION_DIGEST_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: reattestation session digest declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S263 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S264 `REATTESTATION_SESSION_DIGEST_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: reattestation session digest self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S264 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S265 `TRANSACTION_R11A_REATTESTED_STATE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction r11a reattested state declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S265 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S266 `TRANSACTION_R11A_REATTESTED_STATE_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: transaction r11a reattested state self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S266 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S267 `COMMIT_MARKER_AFTER_REATTESTATION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: commit marker after reattestation declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S267 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S268 `COMMIT_MARKER_AFTER_REATTESTATION_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: commit marker after reattestation self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S268 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S269 `WINDOW_SHOW_AFTER_COMMIT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: window show after commit declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S269 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

#### R12A-S270 `WINDOW_SHOW_AFTER_COMMIT_SELF_TESTED`

- 등급: `SOURCE_MANDATORY`
- 요구: window show after commit self tested가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_R11A_REATTESTATION_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S270 항목
- 실패: `E_R12A_R11A_REATTESTATION_FAILED`

### 27.10 INTERRUPTED_UPDATE_RECOVERY

#### R12A-S271 `RECOVERY_BEFORE_NORMAL_BOOT_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery before normal boot declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S271 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S272 `RECOVERY_BEFORE_NORMAL_BOOT_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery before normal boot negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S272 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S273 `RECOVERY_JOINT_AUTHORITY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery joint authority declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S273 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S274 `RECOVERY_JOINT_AUTHORITY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery joint authority negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S274 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S275 `PRE_DRAIN_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: pre drain interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S275 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S276 `PRE_DRAIN_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: pre drain interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S276 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S277 `MID_DRAIN_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: mid drain interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S277 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S278 `MID_DRAIN_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: mid drain interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S278 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S279 `POST_DRAIN_PRE_CAS_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: post drain pre cas interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S279 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S280 `POST_DRAIN_PRE_CAS_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: post drain pre cas interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S280 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S281 `PACKAGE_COMMIT_PRE_CAS_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: package commit pre cas interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S281 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S282 `PACKAGE_COMMIT_PRE_CAS_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: package commit pre cas interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S282 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S283 `CAS_INTENT_PRE_EFFECT_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: cas intent pre effect interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S283 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S284 `CAS_INTENT_PRE_EFFECT_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: cas intent pre effect interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S284 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S285 `CAS_EFFECT_PRE_ACK_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: cas effect pre ack interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S285 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S286 `CAS_EFFECT_PRE_ACK_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: cas effect pre ack interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S286 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S287 `RELAUNCH_REQUEST_PRE_EXIT_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: relaunch request pre exit interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S287 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S288 `RELAUNCH_REQUEST_PRE_EXIT_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: relaunch request pre exit interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S288 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S289 `TARGET_BOOT_PRE_R11A_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: target boot pre r11a interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S289 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S290 `TARGET_BOOT_PRE_R11A_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target boot pre r11a interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S290 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S291 `R11A_PASS_PRE_COMMIT_INTERRUPTION_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a pass pre commit interruption declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S291 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S292 `R11A_PASS_PRE_COMMIT_INTERRUPTION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: r11a pass pre commit interruption negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S292 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S293 `TARGET_ATTESTATION_FAILURE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: target attestation failure declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S293 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S294 `TARGET_ATTESTATION_FAILURE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: target attestation failure negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S294 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S295 `PREVIOUS_RECOVERY_ONLY_RESTORE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: previous recovery only restore declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S295 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S296 `PREVIOUS_RECOVERY_ONLY_RESTORE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: previous recovery only restore negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S296 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S297 `AMBIGUOUS_STATE_QUARANTINE_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: ambiguous state quarantine declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S297 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S298 `AMBIGUOUS_STATE_QUARANTINE_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: ambiguous state quarantine negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S298 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S299 `RECOVERY_IDEMPOTENT_REPLAY_DECLARED`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery idempotent replay declared가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S299 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

#### R12A-S300 `RECOVERY_IDEMPOTENT_REPLAY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: recovery idempotent replay negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_INTERRUPTED_RECOVERY_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S300 항목
- 실패: `E_R12A_INTERRUPTED_RECOVERY_AMBIGUOUS`

### 27.11 GENERATION_EXCLUSION_AND_RUNTIME_INTEGRATION

#### R12A-S301 `MAIN_RENDERER_GENERATION_MATCH_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: main renderer generation match required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S301 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S302 `MAIN_RENDERER_GENERATION_MATCH_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: main renderer generation match negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S302 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S303 `RENDERER_WORKER_GENERATION_MATCH_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: renderer worker generation match required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S303 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S304 `RENDERER_WORKER_GENERATION_MATCH_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: renderer worker generation match negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S304 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S305 `WORKER_WASM_GENERATION_MATCH_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: worker wasm generation match required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S305 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S306 `WORKER_WASM_GENERATION_MATCH_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: worker wasm generation match negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S306 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S307 `WASM_PTHREAD_GENERATION_MATCH_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: wasm pthread generation match required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S307 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S308 `WASM_PTHREAD_GENERATION_MATCH_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: wasm pthread generation match negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S308 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S309 `NATIVE_ADDON_GENERATION_MATCH_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: native addon generation match required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S309 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S310 `NATIVE_ADDON_GENERATION_MATCH_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: native addon generation match negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S310 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S311 `WGSL_MANIFEST_GENERATION_MATCH_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: wgsl manifest generation match required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S311 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S312 `WGSL_MANIFEST_GENERATION_MATCH_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: wgsl manifest generation match negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S312 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S313 `PIPELINE_CACHE_GENERATION_KEY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: pipeline cache generation key required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S313 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S314 `PIPELINE_CACHE_GENERATION_KEY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: pipeline cache generation key negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S314 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S315 `SURFACE_REGISTRY_GENERATION_KEY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: surface registry generation key required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S315 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S316 `SURFACE_REGISTRY_GENERATION_KEY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: surface registry generation key negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S316 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S317 `ENCODER_WORKER_GENERATION_KEY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: encoder worker generation key required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S317 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S318 `ENCODER_WORKER_GENERATION_KEY_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: encoder worker generation key negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S318 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S319 `STATIC_SERVER_ROOT_GENERATION_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: static server root generation required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S319 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S320 `STATIC_SERVER_ROOT_GENERATION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: static server root generation negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S320 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S321 `DEV_SERVER_FORBIDDEN_INSTALLED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: dev server forbidden installed required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S321 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S322 `DEV_SERVER_FORBIDDEN_INSTALLED_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: dev server forbidden installed negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S322 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S323 `SOURCE_TREE_FALLBACK_FORBIDDEN_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source tree fallback forbidden required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S323 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S324 `SOURCE_TREE_FALLBACK_FORBIDDEN_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: source tree fallback forbidden negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S324 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S325 `LAZY_ASSET_OLD_GENERATION_REJECTED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: lazy asset old generation rejected required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S325 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S326 `LAZY_ASSET_OLD_GENERATION_REJECTED_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: lazy asset old generation rejected negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S326 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S327 `CROSS_GENERATION_ASSET_COUNT_ZERO_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: cross generation asset count zero required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S327 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S328 `CROSS_GENERATION_ASSET_COUNT_ZERO_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: cross generation asset count zero negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S328 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S329 `NORMAL_RUNTIME_ONLY_CURRENT_GENERATION_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: normal runtime only current generation required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S329 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

#### R12A-S330 `NORMAL_RUNTIME_ONLY_CURRENT_GENERATION_NEGATIVE_CONTROL`

- 등급: `SOURCE_MANDATORY`
- 요구: normal runtime only current generation negative control가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `R12A_GENERATION_RUNTIME_SOURCE_RECEIPT.json` 및 source gate report의 R12A-S330 항목
- 실패: `E_R12A_GENERATION_OR_RUNTIME_INTEGRATION_FAILED`

### 27.12 SOURCE_NEGATIVE_PRIVACY_AND_FINALIZATION

#### R12A-S331 `USER_DOCUMENT_PATH_EXCLUDED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: user document path excluded required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S331 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S332 `USER_DOCUMENT_PATH_EXCLUDED_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: user document path excluded pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S332 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S333 `USER_CONTENT_BYTES_EXCLUDED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: user content bytes excluded required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S333 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S334 `USER_CONTENT_BYTES_EXCLUDED_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: user content bytes excluded pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S334 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S335 `RAW_CRASH_DUMP_EXCLUDED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: raw crash dump excluded required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S335 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S336 `RAW_CRASH_DUMP_EXCLUDED_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: raw crash dump excluded pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S336 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S337 `INSTALL_INTERNAL_PATH_POLICY_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: install internal path policy required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S337 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S338 `INSTALL_INTERNAL_PATH_POLICY_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: install internal path policy pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S338 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S339 `SOURCE_NEGATIVE_CONTROLS_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source negative controls required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S339 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S340 `SOURCE_NEGATIVE_CONTROLS_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: source negative controls pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S340 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S341 `POINTER_MUTATION_NEGATIVE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: pointer mutation negative required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S341 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S342 `POINTER_MUTATION_NEGATIVE_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: pointer mutation negative pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S342 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S343 `SILENT_RESTART_NEGATIVE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: silent restart negative required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S343 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S344 `SILENT_RESTART_NEGATIVE_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: silent restart negative pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S344 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S345 `WINDOW_SHOW_EARLY_NEGATIVE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: window show early negative required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S345 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S346 `WINDOW_SHOW_EARLY_NEGATIVE_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: window show early negative pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S346 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S347 `SESSION_DRAIN_BYPASS_NEGATIVE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: session drain bypass negative required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S347 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S348 `SESSION_DRAIN_BYPASS_NEGATIVE_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: session drain bypass negative pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S348 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S349 `R11_HANDOFF_LEGACY_TOKEN_NEGATIVE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: r11 handoff legacy token negative required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S349 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S350 `R11_HANDOFF_LEGACY_TOKEN_NEGATIVE_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: r11 handoff legacy token negative pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S350 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S351 `PREDECESSOR_REGRESSION_ISOLATED_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: predecessor regression isolated required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S351 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S352 `PREDECESSOR_REGRESSION_ISOLATED_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: predecessor regression isolated pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S352 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S353 `HISTORICAL_RECEIPTS_IMMUTABLE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: historical receipts immutable required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S353 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S354 `HISTORICAL_RECEIPTS_IMMUTABLE_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: historical receipts immutable pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S354 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S355 `SOURCE_ARTIFACT_SET_COMPLETE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source artifact set complete required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S355 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S356 `SOURCE_ARTIFACT_SET_COMPLETE_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: source artifact set complete pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S356 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S357 `SOURCE_GATE_REPORT_COMPLETE_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source gate report complete required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S357 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S358 `SOURCE_GATE_REPORT_COMPLETE_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: source gate report complete pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S358 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S359 `SOURCE_FINAL_RECEIPT_SELF_HASH_REQUIRED`

- 등급: `SOURCE_MANDATORY`
- 요구: source final receipt self hash required가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S359 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

#### R12A-S360 `SOURCE_FINAL_RECEIPT_SELF_HASH_PASS`

- 등급: `SOURCE_MANDATORY`
- 요구: source final receipt self hash pass가 source tree, contract, self-test 또는 generated authority에서 직접 확인되어야 한다.
- 증거: `TDT_RESAMPLE_RUNTIME_01_R12A_SOURCE_FINAL_RECEIPT.json` 및 source gate report의 R12A-S360 항목
- 실패: `E_R12A_SOURCE_FINALIZATION_FAILED`

## 28. Installed gate catalog

### 28.1 PREDECESSOR_RELEASE_AND_INSTALLED_ADMISSION

#### R12A-P001 `R9A_PHYSICAL_FINAL_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r9a physical final pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P001 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P002 `R9A_PHYSICAL_FINAL_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r9a physical final receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P002 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P003 `R10A_FINAL_RELEASE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a final release pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P003 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P004 `R10A_FINAL_RELEASE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a final release receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P004 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P005 `R10A_LINEAGE_RESTORATION_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a lineage restoration pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P005 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P006 `R10A_LINEAGE_RESTORATION_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a lineage restoration receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P006 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P007 `R11A_INSTALLED_FINAL_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a installed final pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P007 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P008 `R11A_INSTALLED_FINAL_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a installed final receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P008 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P009 `R11A_NOT_QUARANTINED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a not quarantined pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P009 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P010 `R11A_NOT_QUARANTINED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a not quarantined receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P010 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P011 `PRODUCTION_POINTER_V3_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production pointer v3 pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P011 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P012 `PRODUCTION_POINTER_V3_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production pointer v3 receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P012 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P013 `PRODUCTION_ACTIVE_TARGET_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production active target pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P013 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P014 `PRODUCTION_ACTIVE_TARGET_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production active target receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P014 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P015 `PRODUCTION_PREVIOUS_SOURCE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production previous source pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P015 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P016 `PRODUCTION_PREVIOUS_SOURCE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production previous source receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P016 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P017 `SOURCE_INSTALLED_PACKAGE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source installed package pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P017 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P018 `SOURCE_INSTALLED_PACKAGE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source installed package receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P018 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P019 `TARGET_IMMUTABLE_PACKAGE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target immutable package pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P019 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P020 `TARGET_IMMUTABLE_PACKAGE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target immutable package receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P020 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P021 `SOURCE_R11A_SESSION_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source r11a session pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P021 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P022 `SOURCE_R11A_SESSION_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source r11a session receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P022 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P023 `SOURCE_SESSION_POINTER_BINDING_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source session pointer binding pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P023 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P024 `SOURCE_SESSION_POINTER_BINDING_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source session pointer binding receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P024 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P025 `RELEASE_TRANSITION_BEFORE_AFTER_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 release transition before after pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P025 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P026 `RELEASE_TRANSITION_BEFORE_AFTER_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 release transition before after receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P026 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P027 `OPERATOR_UPDATE_INTENT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 operator update intent pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P027 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P028 `OPERATOR_UPDATE_INTENT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 operator update intent receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P028 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P029 `INSTALL_ROOT_LAYOUT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 install root layout pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P029 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P030 `INSTALL_ROOT_LAYOUT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 install root layout receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P030 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P031 `STABLE_LAUNCHER_PRESENT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 stable launcher present pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P031 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P032 `STABLE_LAUNCHER_PRESENT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 stable launcher present receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P032 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P033 `LOCAL_POINTER_PRESENT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer present pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P033 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P034 `LOCAL_POINTER_PRESENT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer present receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P034 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P035 `UPDATE_STATE_ROOT_WRITABLE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update state root writable pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P035 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P036 `UPDATE_STATE_ROOT_WRITABLE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update state root writable receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P036 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P037 `PACKAGED_WINDOWS_EXECUTION_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 packaged windows execution pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P037 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P038 `PACKAGED_WINDOWS_EXECUTION_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 packaged windows execution receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P038 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P039 `DEPENDENCY_LOCK_CURRENT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 dependency lock current pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P039 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

#### R12A-P040 `DEPENDENCY_LOCK_CURRENT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 dependency lock current receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_PREDECESSOR_ADMISSION_RECEIPT.json` 및 installed gate report의 R12A-P040 항목
- 실패: `E_R12A_INSTALLED_PREDECESSOR_MISSING`

### 28.2 CONTROLLED_TRANSITION_AND_UPDATE_START

#### R12A-P041 `R10A_TRANSITION_RECOGNIZED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a transition recognized pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P041 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P042 `R10A_TRANSITION_RECOGNIZED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a transition recognized receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P042 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P043 `SOURCE_EQUALS_RELEASE_PREVIOUS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source equals release previous pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P043 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P044 `SOURCE_EQUALS_RELEASE_PREVIOUS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source equals release previous receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P044 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P045 `TARGET_EQUALS_RELEASE_ACTIVE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target equals release active pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P045 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P046 `TARGET_EQUALS_RELEASE_ACTIVE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target equals release active receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P046 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P047 `SOURCE_SESSION_HMAC_VALID_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source session hmac valid pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P047 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P048 `SOURCE_SESSION_HMAC_VALID_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source session hmac valid receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P048 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P049 `SOURCE_SESSION_SENDER_VALID_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source session sender valid pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P049 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P050 `SOURCE_SESSION_SENDER_VALID_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source session sender valid receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P050 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P051 `SOURCE_SESSION_ACTIVE_AT_DETECTION_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source session active at detection pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P051 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P052 `SOURCE_SESSION_ACTIVE_AT_DETECTION_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source session active at detection receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P052 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P053 `UNRELATED_POINTER_DRIFT_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 unrelated pointer drift zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P053 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P054 `UNRELATED_POINTER_DRIFT_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 unrelated pointer drift zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P054 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P055 `UPDATE_LEASE_ISSUED_ONCE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lease issued once pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P055 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P056 `UPDATE_LEASE_ISSUED_ONCE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lease issued once receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P056 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P057 `UPDATE_LEASE_CONSUMED_ONCE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lease consumed once pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P057 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P058 `UPDATE_LEASE_CONSUMED_ONCE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lease consumed once receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P058 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P059 `UPDATE_LOCK_ACQUIRED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lock acquired pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P059 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P060 `UPDATE_LOCK_ACQUIRED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lock acquired receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P060 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P061 `SECOND_UPDATE_REJECTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 second update rejected pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P061 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P062 `SECOND_UPDATE_REJECTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 second update rejected receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P062 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P063 `TRANSACTION_CREATED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 transaction created pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P063 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P064 `TRANSACTION_CREATED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 transaction created receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P064 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P065 `JOURNAL_GENESIS_FLUSHED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 journal genesis flushed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P065 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P066 `JOURNAL_GENESIS_FLUSHED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 journal genesis flushed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P066 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P067 `SOURCE_PACKAGE_PRESERVED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source package preserved pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P067 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P068 `SOURCE_PACKAGE_PRESERVED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source package preserved receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P068 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P069 `TARGET_PACKAGE_NOT_EXECUTED_NORMAL_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target package not executed normal pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P069 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P070 `TARGET_PACKAGE_NOT_EXECUTED_NORMAL_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target package not executed normal receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P070 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P071 `UPDATE_UI_CAPABILITY_ONLY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update ui capability only pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P071 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P072 `UPDATE_UI_CAPABILITY_ONLY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update ui capability only receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P072 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P073 `NO_RENDERER_FS_ACCESS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no renderer fs access pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P073 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P074 `NO_RENDERER_FS_ACCESS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no renderer fs access receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P074 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P075 `NO_RENDERER_POINTER_ACCESS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no renderer pointer access pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P075 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P076 `NO_RENDERER_POINTER_ACCESS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no renderer pointer access receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P076 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P077 `NO_PRODUCTION_POINTER_WRITE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no production pointer write pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P077 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P078 `NO_PRODUCTION_POINTER_WRITE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no production pointer write receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P078 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P079 `START_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 start receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P079 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

#### R12A-P080 `START_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 start receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_TRANSITION_START_RECEIPT.json` 및 installed gate report의 R12A-P080 항목
- 실패: `E_R12A_INSTALLED_TRANSITION_REJECTED`

### 28.3 PACKAGE_STAGING_AND_CLOSURE

#### R12A-P081 `PAYLOAD_MATERIALIZED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 payload materialized pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P081 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P082 `PAYLOAD_MATERIALIZED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 payload materialized receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P082 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P083 `PATH_POLICY_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 path policy pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P083 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P084 `PATH_POLICY_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 path policy pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P084 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P085 `CASE_COLLISION_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 case collision zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P085 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P086 `CASE_COLLISION_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 case collision zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P086 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P087 `ADS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 ads zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P087 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P088 `ADS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 ads zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P088 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P089 `REPARSE_POINT_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 reparse point zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P089 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P090 `REPARSE_POINT_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 reparse point zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P090 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P091 `SYMLINK_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 symlink zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P091 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P092 `SYMLINK_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 symlink zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P092 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P093 `UNEXPECTED_EXECUTABLE_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 unexpected executable zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P093 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P094 `UNEXPECTED_EXECUTABLE_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 unexpected executable zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P094 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P095 `FILE_COUNT_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 file count exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P095 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P096 `FILE_COUNT_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 file count exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P096 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P097 `TOTAL_BYTES_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 total bytes exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P097 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P098 `TOTAL_BYTES_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 total bytes exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P098 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P099 `PER_FILE_SHA256_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 per file sha256 exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P099 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P100 `PER_FILE_SHA256_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 per file sha256 exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P100 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P101 `PATH_SET_DIGEST_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 path set digest exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P101 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P102 `PATH_SET_DIGEST_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 path set digest exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P102 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P103 `PACKAGE_CONTENT_ID_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 package content id exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P103 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P104 `PACKAGE_CONTENT_ID_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 package content id exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P104 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P105 `RUNTIME_CLOSURE_DIGEST_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 runtime closure digest exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P105 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P106 `RUNTIME_CLOSURE_DIGEST_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 runtime closure digest exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P106 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P107 `ACTIVE_GRAPH_DIGEST_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 active graph digest exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P107 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P108 `ACTIVE_GRAPH_DIGEST_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 active graph digest exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P108 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P109 `JAVASCRIPT_PARSE_DIGEST_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 javascript parse digest exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P109 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P110 `JAVASCRIPT_PARSE_DIGEST_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 javascript parse digest exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P110 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P111 `WGSL_MANIFEST_DIGEST_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 wgsl manifest digest exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P111 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P112 `WGSL_MANIFEST_DIGEST_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 wgsl manifest digest exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P112 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P113 `NATIVE_ADDON_DIGEST_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 native addon digest exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P113 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P114 `NATIVE_ADDON_DIGEST_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 native addon digest exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P114 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P115 `PACKAGE_STORE_ATOMIC_COMMIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 package store atomic commit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P115 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P116 `PACKAGE_STORE_ATOMIC_COMMIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 package store atomic commit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P116 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P117 `PACKAGE_POST_COMMIT_IMMUTABLE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 package post commit immutable pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P117 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P118 `PACKAGE_POST_COMMIT_IMMUTABLE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 package post commit immutable receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P118 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P119 `STAGING_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staging receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P119 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

#### R12A-P120 `STAGING_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staging receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGING_CLOSURE_RECEIPT.json` 및 installed gate report의 R12A-P120 항목
- 실패: `E_R12A_INSTALLED_STAGING_FAILED`

### 28.4 STAGED_EXECUTION_AND_CANARY

#### R12A-P121 `STAGED_PROCESS_ROLE_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged process role exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P121 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P122 `STAGED_PROCESS_ROLE_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged process role exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P122 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P123 `STAGED_PACKAGE_ROOT_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged package root exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P123 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P124 `STAGED_PACKAGE_ROOT_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged package root exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P124 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P125 `STAGED_INSTALL_GENERATION_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged install generation exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P125 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P126 `STAGED_INSTALL_GENERATION_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged install generation exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P126 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P127 `STAGED_TRANSACTION_ID_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged transaction id exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P127 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P128 `STAGED_TRANSACTION_ID_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged transaction id exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P128 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P129 `STAGED_CACHE_NAMESPACE_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged cache namespace exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P129 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P130 `STAGED_CACHE_NAMESPACE_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged cache namespace exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P130 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P131 `ACTIVE_ROOT_ACCESS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 active root access zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P131 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P132 `ACTIVE_ROOT_ACCESS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 active root access zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P132 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P133 `PREVIOUS_ROOT_ACCESS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 previous root access zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P133 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P134 `PREVIOUS_ROOT_ACCESS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 previous root access zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P134 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P135 `SOURCE_TREE_ACCESS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source tree access zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P135 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P136 `SOURCE_TREE_ACCESS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source tree access zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P136 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P137 `DEV_SERVER_ACCESS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 dev server access zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P137 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P138 `DEV_SERVER_ACCESS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 dev server access zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P138 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P139 `NORMAL_R11A_SESSION_NOT_ISSUED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 normal r11a session not issued pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P139 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P140 `NORMAL_R11A_SESSION_NOT_ISSUED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 normal r11a session not issued receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P140 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P141 `HARDWARE_D3D12_USED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 hardware d3d12 used pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P141 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P142 `HARDWARE_D3D12_USED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 hardware d3d12 used receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P142 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P143 `R9A_KERNEL_IDENTITY_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r9a kernel identity exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P143 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P144 `R9A_KERNEL_IDENTITY_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r9a kernel identity exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P144 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P145 `R9A_SINGLE_SUBMIT_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r9a single submit exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P145 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P146 `R9A_SINGLE_SUBMIT_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r9a single submit exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P146 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P147 `VALIDATION_COUNTER_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 validation counter zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P147 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P148 `VALIDATION_COUNTER_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 validation counter zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P148 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P149 `PRODUCT_REFERENCE_PARITY_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 product reference parity pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P149 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P150 `PRODUCT_REFERENCE_PARITY_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 product reference parity pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P150 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P151 `ORACLE_ULP_BOUND_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 oracle ulp bound pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P151 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P152 `ORACLE_ULP_BOUND_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 oracle ulp bound pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P152 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P153 `PREVIEW_SMOKE_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 preview smoke pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P153 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P154 `PREVIEW_SMOKE_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 preview smoke pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P154 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P155 `EXPORT_SMOKE_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 export smoke pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P155 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P156 `EXPORT_SMOKE_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 export smoke pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P156 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P157 `CPU_FALLBACK_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 cpu fallback zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P157 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P158 `CPU_FALLBACK_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 cpu fallback zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P158 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P159 `STAGED_CANARY_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged canary receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P159 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

#### R12A-P160 `STAGED_CANARY_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 staged canary receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_STAGED_CANARY_RECEIPT.json` 및 installed gate report의 R12A-P160 항목
- 실패: `E_R12A_INSTALLED_STAGED_CANARY_FAILED`

### 28.5 PRE_ACTIVATION_SESSION_DRAIN

#### R12A-P161 `DRAIN_INTENT_FLUSHED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 drain intent flushed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P161 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P162 `DRAIN_INTENT_FLUSHED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 drain intent flushed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P162 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P163 `NEW_BOOTSTRAP_REJECTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 new bootstrap rejected pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P163 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P164 `NEW_BOOTSTRAP_REJECTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 new bootstrap rejected receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P164 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P165 `NEW_PREVIEW_GRANT_REJECTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 new preview grant rejected pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P165 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P166 `NEW_PREVIEW_GRANT_REJECTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 new preview grant rejected receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P166 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P167 `NEW_EXPORT_GRANT_REJECTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 new export grant rejected pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P167 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P168 `NEW_EXPORT_GRANT_REJECTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 new export grant rejected receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P168 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P169 `EXISTING_PREVIEW_GRANTS_REVOKED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 existing preview grants revoked pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P169 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P170 `EXISTING_PREVIEW_GRANTS_REVOKED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 existing preview grants revoked receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P170 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P171 `EXISTING_EXPORT_GRANTS_REVOKED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 existing export grants revoked pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P171 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P172 `EXISTING_EXPORT_GRANTS_REVOKED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 existing export grants revoked receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P172 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P173 `SAVE_SESSION_ABORT_REQUESTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 save session abort requested pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P173 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P174 `SAVE_SESSION_ABORT_REQUESTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 save session abort requested receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P174 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P175 `SAVE_TEMP_FILES_REMOVED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 save temp files removed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P175 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P176 `SAVE_TEMP_FILES_REMOVED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 save temp files removed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P176 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P177 `RENDERER_DRAIN_EVENT_DELIVERED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 renderer drain event delivered pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P177 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P178 `RENDERER_DRAIN_EVENT_DELIVERED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 renderer drain event delivered receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P178 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P179 `RENDERER_DRAIN_ACK_RECEIVED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 renderer drain ack received pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P179 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P180 `RENDERER_DRAIN_ACK_RECEIVED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 renderer drain ack received receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P180 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P181 `PREVIEW_SCHEDULER_IDLE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 preview scheduler idle pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P181 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P182 `PREVIEW_SCHEDULER_IDLE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 preview scheduler idle receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P182 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P183 `EXPORT_QUEUE_IDLE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 export queue idle pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P183 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P184 `EXPORT_QUEUE_IDLE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 export queue idle receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P184 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P185 `WORKER_PENDING_JOBS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 worker pending jobs zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P185 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P186 `WORKER_PENDING_JOBS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 worker pending jobs zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P186 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P187 `GPU_COMPLETION_TICKETS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 gpu completion tickets zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P187 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P188 `GPU_COMPLETION_TICKETS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 gpu completion tickets zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P188 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P189 `SURFACE_PINS_RELEASED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 surface pins released pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P189 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P190 `SURFACE_PINS_RELEASED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 surface pins released receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P190 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P191 `OPEN_PACKAGE_HANDLES_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 open package handles zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P191 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P192 `OPEN_PACKAGE_HANDLES_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 open package handles zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P192 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P193 `ACTIVE_BROWSERWINDOWS_HIDDEN_OR_CLOSED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 active browserwindows hidden or closed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P193 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P194 `ACTIVE_BROWSERWINDOWS_HIDDEN_OR_CLOSED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 active browserwindows hidden or closed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P194 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P195 `DRAIN_DEADLINE_RESPECTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 drain deadline respected pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P195 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P196 `DRAIN_DEADLINE_RESPECTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 drain deadline respected receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P196 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P197 `FORCED_ABORT_COUNT_RECORDED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 forced abort count recorded pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P197 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P198 `FORCED_ABORT_COUNT_RECORDED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 forced abort count recorded receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P198 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P199 `DRAIN_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 drain receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P199 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

#### R12A-P200 `DRAIN_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 drain receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_SESSION_DRAIN_RECEIPT.json` 및 installed gate report의 R12A-P200 항목
- 실패: `E_R12A_INSTALLED_DRAIN_FAILED`

### 28.6 ACTIVATION_POINTER_AND_PROCESS_HANDOFF

#### R12A-P201 `ACTIVATION_INTENT_FLUSHED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 activation intent flushed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P201 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P202 `ACTIVATION_INTENT_FLUSHED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 activation intent flushed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P202 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P203 `PRODUCTION_POINTER_EXPECTATION_CURRENT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production pointer expectation current pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P203 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P204 `PRODUCTION_POINTER_EXPECTATION_CURRENT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production pointer expectation current receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P204 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P205 `LOCAL_POINTER_EXPECTATION_CURRENT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer expectation current pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P205 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P206 `LOCAL_POINTER_EXPECTATION_CURRENT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer expectation current receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P206 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P207 `LOCAL_POINTER_CAS_ONCE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer cas once pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P207 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P208 `LOCAL_POINTER_CAS_ONCE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer cas once receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P208 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P209 `LOCAL_POINTER_GENERATION_PLUS_ONE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer generation plus one pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P209 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P210 `LOCAL_POINTER_GENERATION_PLUS_ONE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer generation plus one receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P210 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P211 `INSTALL_GENERATION_PLUS_ONE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 install generation plus one pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P211 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P212 `INSTALL_GENERATION_PLUS_ONE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 install generation plus one receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P212 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P213 `LOCAL_POINTER_TARGET_IDENTITY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer target identity pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P213 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P214 `LOCAL_POINTER_TARGET_IDENTITY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer target identity receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P214 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P215 `LOCAL_POINTER_PREVIOUS_IDENTITY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer previous identity pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P215 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P216 `LOCAL_POINTER_PREVIOUS_IDENTITY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer previous identity receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P216 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P217 `LOCAL_POINTER_READBACK_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer readback exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P217 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P218 `LOCAL_POINTER_READBACK_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer readback exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P218 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P219 `PRODUCTION_POINTER_BYTES_UNCHANGED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production pointer bytes unchanged pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P219 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P220 `PRODUCTION_POINTER_BYTES_UNCHANGED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production pointer bytes unchanged receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P220 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P221 `PACKAGE_BYTES_UNCHANGED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 package bytes unchanged pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P221 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P222 `PACKAGE_BYTES_UNCHANGED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 package bytes unchanged receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P222 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P223 `RELAUNCH_REQUEST_FLUSHED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 relaunch request flushed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P223 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P224 `RELAUNCH_REQUEST_FLUSHED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 relaunch request flushed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P224 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P225 `RELAUNCH_NONCE_192_BIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 relaunch nonce 192 bit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P225 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P226 `RELAUNCH_NONCE_192_BIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 relaunch nonce 192 bit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P226 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P227 `PARENT_PID_BOUND_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 parent pid bound pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P227 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P228 `PARENT_PID_BOUND_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 parent pid bound receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P228 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P229 `LAUNCHER_ACK_RECEIVED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 launcher ack received pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P229 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P230 `LAUNCHER_ACK_RECEIVED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 launcher ack received receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P230 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P231 `OLD_PROCESS_EXITED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old process exited pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P231 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P232 `OLD_PROCESS_EXITED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old process exited receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P232 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P233 `OLD_PROCESS_NORMAL_WINDOW_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old process normal window zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P233 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P234 `OLD_PROCESS_NORMAL_WINDOW_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old process normal window zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P234 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P235 `STATIC_SERVER_OLD_ROOT_CLOSED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 static server old root closed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P235 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P236 `STATIC_SERVER_OLD_ROOT_CLOSED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 static server old root closed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P236 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P237 `TARGET_PROCESS_STARTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target process started pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P237 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P238 `TARGET_PROCESS_STARTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target process started receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P238 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P239 `ACTIVATION_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 activation receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P239 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

#### R12A-P240 `ACTIVATION_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 activation receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_ACTIVATION_HANDOFF_RECEIPT.json` 및 installed gate report의 R12A-P240 항목
- 실패: `E_R12A_INSTALLED_ACTIVATION_FAILED`

### 28.7 TARGET_BOOT_AND_R11A_REATTESTATION

#### R12A-P241 `TARGET_LAUNCH_ENVELOPE_VALID_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target launch envelope valid pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P241 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P242 `TARGET_LAUNCH_ENVELOPE_VALID_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target launch envelope valid receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P242 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P243 `TARGET_EXECUTING_PACKAGE_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target executing package exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P243 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P244 `TARGET_EXECUTING_PACKAGE_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target executing package exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P244 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P245 `TARGET_LOCAL_POINTER_MATCH_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target local pointer match pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P245 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P246 `TARGET_LOCAL_POINTER_MATCH_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target local pointer match receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P246 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P247 `TARGET_PRODUCTION_POINTER_MATCH_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target production pointer match pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P247 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P248 `TARGET_PRODUCTION_POINTER_MATCH_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target production pointer match receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P248 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P249 `TARGET_TRANSACTION_MATCH_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target transaction match pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P249 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P250 `TARGET_TRANSACTION_MATCH_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target transaction match receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P250 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P251 `TARGET_PACKAGE_CLOSURE_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target package closure pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P251 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P252 `TARGET_PACKAGE_CLOSURE_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target package closure pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P252 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P253 `TARGET_ACTIVE_GRAPH_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target active graph pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P253 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P254 `TARGET_ACTIVE_GRAPH_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target active graph pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P254 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P255 `TARGET_JAVASCRIPT_PARSE_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target javascript parse pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P255 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P256 `TARGET_JAVASCRIPT_PARSE_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target javascript parse pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P256 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P257 `TARGET_R9A_IDENTITY_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target r9a identity pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P257 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P258 `TARGET_R9A_IDENTITY_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target r9a identity pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P258 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P259 `TARGET_HIDDEN_WINDOW_USED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target hidden window used pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P259 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P260 `TARGET_HIDDEN_WINDOW_USED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target hidden window used receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P260 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P261 `TARGET_STARTUP_CANARY_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target startup canary pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P261 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P262 `TARGET_STARTUP_CANARY_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target startup canary pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P262 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P263 `R11A_MAIN_SESSION_ISSUED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a main session issued pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P263 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P264 `R11A_MAIN_SESSION_ISSUED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a main session issued receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P264 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P265 `R11A_SESSION_GENERATION_NEW_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a session generation new pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P265 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P266 `R11A_SESSION_GENERATION_NEW_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a session generation new receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P266 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P267 `R11A_SESSION_TARGET_PACKAGE_BOUND_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a session target package bound pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P267 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P268 `R11A_SESSION_TARGET_PACKAGE_BOUND_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a session target package bound receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P268 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P269 `R11A_SESSION_TARGET_POINTER_BOUND_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a session target pointer bound pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P269 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P270 `R11A_SESSION_TARGET_POINTER_BOUND_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a session target pointer bound receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P270 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P271 `OLD_SESSION_REJECTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old session rejected pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P271 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P272 `OLD_SESSION_REJECTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old session rejected receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P272 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P273 `OLD_GRANT_REJECTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old grant rejected pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P273 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P274 `OLD_GRANT_REJECTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old grant rejected receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P274 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P275 `REATTESTATION_RECEIPT_FLUSHED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 reattestation receipt flushed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P275 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P276 `REATTESTATION_RECEIPT_FLUSHED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 reattestation receipt flushed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P276 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P277 `TRANSACTION_REATTESTED_STATE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 transaction reattested state pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P277 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P278 `TRANSACTION_REATTESTED_STATE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 transaction reattested state receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P278 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P279 `TARGET_BOOT_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target boot receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P279 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

#### R12A-P280 `TARGET_BOOT_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target boot receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_R11A_REATTESTATION_RECEIPT.json` 및 installed gate report의 R12A-P280 항목
- 실패: `E_R12A_INSTALLED_REATTESTATION_FAILED`

### 28.8 COMMIT_AND_NORMAL_RUNTIME_RESUME

#### R12A-P281 `COMMIT_INTENT_FLUSHED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 commit intent flushed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P281 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P282 `COMMIT_INTENT_FLUSHED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 commit intent flushed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P282 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P283 `TRANSACTION_COMMITTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 transaction committed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P283 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P284 `TRANSACTION_COMMITTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 transaction committed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P284 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P285 `JOURNAL_COMMIT_ACK_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 journal commit ack pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P285 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P286 `JOURNAL_COMMIT_ACK_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 journal commit ack receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P286 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P287 `UPDATE_LOCK_RELEASED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lock released pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P287 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P288 `UPDATE_LOCK_RELEASED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lock released receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P288 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P289 `WINDOW_SHOW_AFTER_COMMIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 window show after commit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P289 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P290 `WINDOW_SHOW_AFTER_COMMIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 window show after commit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P290 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P291 `PREVIEW_GRANT_AFTER_COMMIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 preview grant after commit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P291 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P292 `PREVIEW_GRANT_AFTER_COMMIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 preview grant after commit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P292 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P293 `EXPORT_GRANT_AFTER_COMMIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 export grant after commit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P293 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P294 `EXPORT_GRANT_AFTER_COMMIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 export grant after commit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P294 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P295 `HOST_SAVE_AFTER_COMMIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 host save after commit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P295 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P296 `HOST_SAVE_AFTER_COMMIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 host save after commit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P296 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P297 `PRE_COMMIT_PREVIEW_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pre commit preview zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P297 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P298 `PRE_COMMIT_PREVIEW_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pre commit preview zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P298 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P299 `PRE_COMMIT_EXPORT_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pre commit export zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P299 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P300 `PRE_COMMIT_EXPORT_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pre commit export zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P300 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P301 `PRE_COMMIT_SAVE_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pre commit save zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P301 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P302 `PRE_COMMIT_SAVE_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pre commit save zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P302 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P303 `TARGET_SESSION_STATUS_ACTIVE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target session status active pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P303 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P304 `TARGET_SESSION_STATUS_ACTIVE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target session status active receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P304 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P305 `QUARANTINE_FALSE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 quarantine false pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P305 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P306 `QUARANTINE_FALSE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 quarantine false receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P306 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P307 `CROSS_GENERATION_ASSET_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 cross generation asset zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P307 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P308 `CROSS_GENERATION_ASSET_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 cross generation asset zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P308 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P309 `SILENT_FALLBACK_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 silent fallback zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P309 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P310 `SILENT_FALLBACK_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 silent fallback zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P310 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P311 `NORMAL_RUNTIME_CPU_FALLBACK_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 normal runtime cpu fallback zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P311 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P312 `NORMAL_RUNTIME_CPU_FALLBACK_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 normal runtime cpu fallback zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P312 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P313 `PENDING_UPDATE_JOBS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pending update jobs zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P313 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P314 `PENDING_UPDATE_JOBS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pending update jobs zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P314 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P315 `OLD_PACKAGE_RETENTION_STARTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old package retention started pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P315 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P316 `OLD_PACKAGE_RETENTION_STARTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old package retention started receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P316 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P317 `FINAL_RUNTIME_SMOKE_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 final runtime smoke pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P317 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P318 `FINAL_RUNTIME_SMOKE_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 final runtime smoke pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P318 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P319 `COMMIT_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 commit receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P319 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

#### R12A-P320 `COMMIT_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 commit receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_COMMIT_RECEIPT.json` 및 installed gate report의 R12A-P320 항목
- 실패: `E_R12A_INSTALLED_COMMIT_FAILED`

### 28.9 INTERRUPTION_RECOVERY_MATRIX

#### R12A-P321 `KILL_AFTER_TRANSACTION_CREATE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after transaction create pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P321 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P322 `KILL_AFTER_TRANSACTION_CREATE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after transaction create receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P322 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P323 `KILL_AFTER_PAYLOAD_MATERIALIZE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after payload materialize pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P323 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P324 `KILL_AFTER_PAYLOAD_MATERIALIZE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after payload materialize receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P324 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P325 `KILL_AFTER_CLOSURE_VERIFY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after closure verify pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P325 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P326 `KILL_AFTER_CLOSURE_VERIFY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after closure verify receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P326 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P327 `KILL_AFTER_STAGED_CANARY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after staged canary pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P327 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P328 `KILL_AFTER_STAGED_CANARY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after staged canary receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P328 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P329 `KILL_AFTER_DRAIN_INTENT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after drain intent pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P329 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P330 `KILL_AFTER_DRAIN_INTENT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after drain intent receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P330 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P331 `KILL_MID_DRAIN_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill mid drain pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P331 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P332 `KILL_MID_DRAIN_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill mid drain receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P332 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P333 `KILL_AFTER_DRAIN_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after drain pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P333 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P334 `KILL_AFTER_DRAIN_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after drain receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P334 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P335 `KILL_AFTER_ACTIVATION_INTENT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after activation intent pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P335 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P336 `KILL_AFTER_ACTIVATION_INTENT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after activation intent receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P336 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P337 `KILL_AFTER_PACKAGE_COMMIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after package commit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P337 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P338 `KILL_AFTER_PACKAGE_COMMIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after package commit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P338 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P339 `KILL_BEFORE_POINTER_CAS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before pointer cas pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P339 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P340 `KILL_BEFORE_POINTER_CAS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before pointer cas receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P340 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P341 `KILL_AFTER_POINTER_CAS_EFFECT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after pointer cas effect pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P341 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P342 `KILL_AFTER_POINTER_CAS_EFFECT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after pointer cas effect receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P342 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P343 `KILL_BEFORE_POINTER_CAS_ACK_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before pointer cas ack pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P343 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P344 `KILL_BEFORE_POINTER_CAS_ACK_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before pointer cas ack receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P344 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P345 `KILL_AFTER_RELAUNCH_REQUEST_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after relaunch request pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P345 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P346 `KILL_AFTER_RELAUNCH_REQUEST_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after relaunch request receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P346 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P347 `KILL_BEFORE_OLD_PROCESS_EXIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before old process exit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P347 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P348 `KILL_BEFORE_OLD_PROCESS_EXIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before old process exit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P348 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P349 `KILL_AFTER_TARGET_PROCESS_START_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after target process start pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P349 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P350 `KILL_AFTER_TARGET_PROCESS_START_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after target process start receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P350 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P351 `KILL_BEFORE_R11A_REATTESTATION_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before r11a reattestation pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P351 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P352 `KILL_BEFORE_R11A_REATTESTATION_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before r11a reattestation receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P352 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P353 `KILL_AFTER_R11A_REATTESTATION_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after r11a reattestation pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P353 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P354 `KILL_AFTER_R11A_REATTESTATION_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill after r11a reattestation receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P354 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P355 `KILL_BEFORE_COMMIT_ACK_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before commit ack pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P355 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P356 `KILL_BEFORE_COMMIT_ACK_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 kill before commit ack receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P356 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P357 `JOURNAL_CORRUPT_TAIL_RECOVERY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 journal corrupt tail recovery pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P357 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P358 `JOURNAL_CORRUPT_TAIL_RECOVERY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 journal corrupt tail recovery receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P358 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P359 `RECOVERY_MATRIX_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 recovery matrix receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P359 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

#### R12A-P360 `RECOVERY_MATRIX_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 recovery matrix receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_INTERRUPTION_RECOVERY_RECEIPT.json` 및 installed gate report의 R12A-P360 항목
- 실패: `E_R12A_INSTALLED_RECOVERY_FAILED`

### 28.10 FAILURE_QUARANTINE_AND_ROLLBACK_COORDINATION

#### R12A-P361 `TARGET_CLOSURE_FAILURE_QUARANTINED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target closure failure quarantined pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P361 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P362 `TARGET_CLOSURE_FAILURE_QUARANTINED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target closure failure quarantined receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P362 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P363 `TARGET_CANARY_FAILURE_QUARANTINED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target canary failure quarantined pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P363 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P364 `TARGET_CANARY_FAILURE_QUARANTINED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target canary failure quarantined receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P364 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P365 `TARGET_R11A_FAILURE_QUARANTINED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target r11a failure quarantined pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P365 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P366 `TARGET_R11A_FAILURE_QUARANTINED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target r11a failure quarantined receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P366 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P367 `TARGET_CRASH_DURING_BOOT_QUARANTINED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target crash during boot quarantined pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P367 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P368 `TARGET_CRASH_DURING_BOOT_QUARANTINED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target crash during boot quarantined receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P368 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P369 `TARGET_DEVICE_LOSS_DURING_BOOT_QUARANTINED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target device loss during boot quarantined pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P369 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P370 `TARGET_DEVICE_LOSS_DURING_BOOT_QUARANTINED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 target device loss during boot quarantined receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P370 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P371 `PREVIOUS_PACKAGE_EXISTENCE_VERIFIED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 previous package existence verified pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P371 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P372 `PREVIOUS_PACKAGE_EXISTENCE_VERIFIED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 previous package existence verified receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P372 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P373 `PREVIOUS_PACKAGE_CLOSURE_VERIFIED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 previous package closure verified pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P373 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P374 `PREVIOUS_PACKAGE_CLOSURE_VERIFIED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 previous package closure verified receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P374 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P375 `LOCAL_POINTER_PREVIOUS_RECOVERY_ONLY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer previous recovery only pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P375 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P376 `LOCAL_POINTER_PREVIOUS_RECOVERY_ONLY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer previous recovery only receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P376 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P377 `PREVIOUS_NORMAL_SESSION_NOT_ISSUED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 previous normal session not issued pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P377 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P378 `PREVIOUS_NORMAL_SESSION_NOT_ISSUED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 previous normal session not issued receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P378 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P379 `R10A_ROLLBACK_RECOMMENDATION_CREATED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a rollback recommendation created pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P379 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P380 `R10A_ROLLBACK_RECOMMENDATION_CREATED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a rollback recommendation created receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P380 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P381 `R10A_ROLLBACK_NOT_PERFORMED_BY_R12A_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a rollback not performed by r12a pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P381 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P382 `R10A_ROLLBACK_NOT_PERFORMED_BY_R12A_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r10a rollback not performed by r12a receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P382 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P383 `NO_QUALIFIED_PREVIOUS_FAIL_CLOSED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no qualified previous fail closed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P383 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P384 `NO_QUALIFIED_PREVIOUS_FAIL_CLOSED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no qualified previous fail closed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P384 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P385 `AMBIGUOUS_POINTER_FAIL_CLOSED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 ambiguous pointer fail closed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P385 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P386 `AMBIGUOUS_POINTER_FAIL_CLOSED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 ambiguous pointer fail closed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P386 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P387 `AMBIGUOUS_JOURNAL_FAIL_CLOSED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 ambiguous journal fail closed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P387 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P388 `AMBIGUOUS_JOURNAL_FAIL_CLOSED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 ambiguous journal fail closed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P388 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P389 `QUARANTINE_LEDGER_APPEND_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 quarantine ledger append pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P389 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P390 `QUARANTINE_LEDGER_APPEND_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 quarantine ledger append receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P390 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P391 `QUARANTINE_STATE_ATOMIC_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 quarantine state atomic pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P391 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P392 `QUARANTINE_STATE_ATOMIC_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 quarantine state atomic receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P392 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P393 `RECOVERY_UI_CAPABILITY_ONLY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 recovery ui capability only pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P393 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P394 `RECOVERY_UI_CAPABILITY_ONLY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 recovery ui capability only receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P394 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P395 `USER_DATA_UNTOUCHED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 user data untouched pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P395 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P396 `USER_DATA_UNTOUCHED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 user data untouched receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P396 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P397 `NO_SILENT_REMOTE_ROLLBACK_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no silent remote rollback pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P397 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P398 `NO_SILENT_REMOTE_ROLLBACK_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 no silent remote rollback receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P398 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P399 `FAILURE_COORDINATION_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 failure coordination receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P399 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

#### R12A-P400 `FAILURE_COORDINATION_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 failure coordination receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_FAILURE_COORDINATION_RECEIPT.json` 및 installed gate report의 R12A-P400 항목
- 실패: `E_R12A_INSTALLED_FAILURE_COORDINATION_FAILED`

### 28.11 GENERATION_ASSET_CACHE_AND_MULTI_WINDOW_SOAK

#### R12A-P401 `MAIN_RENDERER_GENERATION_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 main renderer generation exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P401 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P402 `MAIN_RENDERER_GENERATION_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 main renderer generation exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P402 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P403 `RENDERER_WORKER_GENERATION_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 renderer worker generation exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P403 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P404 `RENDERER_WORKER_GENERATION_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 renderer worker generation exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P404 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P405 `WORKER_WASM_GENERATION_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 worker wasm generation exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P405 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P406 `WORKER_WASM_GENERATION_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 worker wasm generation exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P406 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P407 `WASM_PTHREAD_GENERATION_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 wasm pthread generation exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P407 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P408 `WASM_PTHREAD_GENERATION_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 wasm pthread generation exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P408 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P409 `NATIVE_ADDON_GENERATION_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 native addon generation exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P409 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P410 `NATIVE_ADDON_GENERATION_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 native addon generation exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P410 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P411 `WGSL_MANIFEST_GENERATION_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 wgsl manifest generation exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P411 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P412 `WGSL_MANIFEST_GENERATION_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 wgsl manifest generation exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P412 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P413 `PIPELINE_CACHE_NAMESPACE_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pipeline cache namespace exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P413 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P414 `PIPELINE_CACHE_NAMESPACE_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pipeline cache namespace exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P414 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P415 `SURFACE_REGISTRY_NAMESPACE_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 surface registry namespace exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P415 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P416 `SURFACE_REGISTRY_NAMESPACE_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 surface registry namespace exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P416 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P417 `ENCODER_WORKER_NAMESPACE_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 encoder worker namespace exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P417 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P418 `ENCODER_WORKER_NAMESPACE_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 encoder worker namespace exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P418 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P419 `STATIC_SERVER_ROOT_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 static server root exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P419 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P420 `STATIC_SERVER_ROOT_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 static server root exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P420 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P421 `LAZY_ASSET_TARGET_ONLY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 lazy asset target only pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P421 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P422 `LAZY_ASSET_TARGET_ONLY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 lazy asset target only receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P422 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P423 `OLD_ASSET_FETCH_REJECTED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old asset fetch rejected pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P423 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P424 `OLD_ASSET_FETCH_REJECTED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 old asset fetch rejected receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P424 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P425 `MULTI_WINDOW_SESSION_DRAIN_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 multi window session drain pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P425 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P426 `MULTI_WINDOW_SESSION_DRAIN_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 multi window session drain receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P426 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P427 `MULTI_WINDOW_SHOW_BARRIER_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 multi window show barrier pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P427 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P428 `MULTI_WINDOW_SHOW_BARRIER_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 multi window show barrier receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P428 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P429 `WINDOW_REOPEN_AFTER_COMMIT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 window reopen after commit pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P429 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P430 `WINDOW_REOPEN_AFTER_COMMIT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 window reopen after commit receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P430 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P431 `DEVICE_LOSS_AFTER_UPDATE_RECOVERY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 device loss after update recovery pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P431 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P432 `DEVICE_LOSS_AFTER_UPDATE_RECOVERY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 device loss after update recovery receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P432 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P433 `RENDERER_CRASH_AFTER_UPDATE_RECOVERY_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 renderer crash after update recovery pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P433 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P434 `RENDERER_CRASH_AFTER_UPDATE_RECOVERY_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 renderer crash after update recovery receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P434 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P435 `UPDATE_REPEAT_SECOND_GENERATION_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update repeat second generation pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P435 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P436 `UPDATE_REPEAT_SECOND_GENERATION_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update repeat second generation receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P436 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P437 `RESIDENCY_PLATEAU_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 residency plateau pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P437 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P438 `RESIDENCY_PLATEAU_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 residency plateau pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P438 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P439 `GENERATION_SOAK_RECEIPT_SEALED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 generation soak receipt sealed pass가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P439 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

#### R12A-P440 `GENERATION_SOAK_RECEIPT_SEALED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 generation soak receipt sealed receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_INSTALLED_GENERATION_SOAK_RECEIPT.json` 및 installed gate report의 R12A-P440 항목
- 실패: `E_R12A_INSTALLED_GENERATION_SOAK_FAILED`

### 28.12 FINAL_RECEIPT_NEGATIVE_CONTROLS_AND_CLEANUP

#### R12A-P441 `INSTALLED_GATE_REPORT_480_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 installed gate report 480 pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P441 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P442 `INSTALLED_GATE_REPORT_480_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 installed gate report 480 pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P442 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P443 `PENDING_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pending zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P443 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P444 `PENDING_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 pending zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P444 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P445 `DEFERRED_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 deferred zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P445 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P446 `DEFERRED_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 deferred zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P446 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P447 `SKIPPED_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 skipped zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P447 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P448 `SKIPPED_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 skipped zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P448 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P449 `FAIL_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 fail zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P449 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P450 `FAIL_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 fail zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P450 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P451 `SOURCE_PASS_360_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source pass 360 pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P451 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P452 `SOURCE_PASS_360_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 source pass 360 receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P452 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P453 `FINAL_STATE_EXACT_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 final state exact pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P453 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P454 `FINAL_STATE_EXACT_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 final state exact receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P454 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P455 `CHILD_ARTIFACT_SET_COMPLETE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 child artifact set complete pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P455 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P456 `CHILD_ARTIFACT_SET_COMPLETE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 child artifact set complete receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P456 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P457 `CHILD_ARTIFACT_DIGESTS_VALID_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 child artifact digests valid pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P457 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P458 `CHILD_ARTIFACT_DIGESTS_VALID_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 child artifact digests valid receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P458 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P459 `FINAL_RECEIPT_SELF_HASH_VALID_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 final receipt self hash valid pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P459 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P460 `FINAL_RECEIPT_SELF_HASH_VALID_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 final receipt self hash valid receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P460 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P461 `PRODUCTION_POINTER_MUTATED_FALSE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production pointer mutated false pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P461 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P462 `PRODUCTION_POINTER_MUTATED_FALSE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 production pointer mutated false receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P462 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P463 `LOCAL_POINTER_MUTATED_TRUE_ONCE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer mutated true once pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P463 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P464 `LOCAL_POINTER_MUTATED_TRUE_ONCE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 local pointer mutated true once receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P464 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P465 `R11A_SESSION_ISSUED_TRUE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a session issued true pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P465 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P466 `R11A_SESSION_ISSUED_TRUE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 r11a session issued true receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P466 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P467 `UPDATE_LOCK_HELD_FALSE_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lock held false pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P467 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P468 `UPDATE_LOCK_HELD_FALSE_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 update lock held false receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P468 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P469 `TEMP_FILES_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 temp files zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P469 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P470 `TEMP_FILES_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 temp files zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P470 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P471 `OPEN_SAVE_SESSIONS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 open save sessions zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P471 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P472 `OPEN_SAVE_SESSIONS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 open save sessions zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P472 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P473 `OPEN_GRANTS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 open grants zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P473 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P474 `OPEN_GRANTS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 open grants zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P474 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P475 `OPEN_WORKERS_ZERO_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 open workers zero pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P475 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P476 `OPEN_WORKERS_ZERO_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 open workers zero receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P476 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P477 `HISTORICAL_RECEIPTS_UNCHANGED_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 historical receipts unchanged pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P477 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P478 `HISTORICAL_RECEIPTS_UNCHANGED_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 historical receipts unchanged receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P478 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P479 `FINAL_NEGATIVE_CONTROLS_PASS_PASS`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 final negative controls pass pass가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P479 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

#### R12A-P480 `FINAL_NEGATIVE_CONTROLS_PASS_RECEIPT_BOUND`

- 등급: `INSTALLED_MANDATORY`
- 요구: packaged Windows installed update에서 final negative controls pass receipt bound가 실제 관찰되어야 한다.
- 증거: `R12A_FINAL_INSTALLED_UPDATE_RECEIPT.json` 및 installed gate report의 R12A-P480 항목
- 실패: `E_R12A_INSTALLED_FINALIZATION_FAILED`

## 29. Completion checklist

### Source

- [ ] R12 historical modules are marked superseded, not silently current
- [ ] Electron main update coordinator is active-required
- [ ] R11A drain adapter blocks bootstrap and grants
- [ ] transaction v2, journal v2, lock and recovery are deterministic
- [ ] Production Pointer writer is absent
- [ ] source gates are 360 PASS / 0 FAIL

### Installed

- [ ] R9A physical, R10A release and R11A installed receipts are current
- [ ] actual packaged update runs on Windows
- [ ] source session drains to zero
- [ ] Local Pointer CAS occurs exactly once
- [ ] stable launcher starts exact target package
- [ ] target receives a fresh R11A session
- [ ] all interruption boundaries recover deterministically
- [ ] installed gates are 480 PASS / 0 FAIL

## 30. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R13A

R12A Installed Update Evidence Replay /
Fleet Lease to Local Transition Binding /
Ring-Aware Update Drain /
Post-Update Fleet Evidence Publication /
Bad-Release Containment and Recovery Replay Seal
```

## 31. Final seal statement

R12A 완료는 package를 복사하고 pointer를 바꿨다는 뜻이 아니다. **R10A가 승인한 transition을 R11A source session에서 안전하게 drain하고, Local Activation Pointer를 한 번만 CAS하고, stable launcher가 target을 재기동하고, target이 fresh R11A admission을 받은 뒤, 모든 중단 경계가 같은 결론으로 복구됨을 증명하는 것**이다.
