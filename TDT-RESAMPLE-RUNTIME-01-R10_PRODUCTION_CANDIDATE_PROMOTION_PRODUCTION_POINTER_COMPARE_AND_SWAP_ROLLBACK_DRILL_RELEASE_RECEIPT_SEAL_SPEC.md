# TDT-RESAMPLE-RUNTIME-01-R10

## Production Candidate Promotion / Production Pointer Compare-and-Swap / Rollback Drill / Release Receipt Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R10`
- **Source parent:** `TDT-RESAMPLE-RUNTIME-01-R9`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R9_PHYSICAL_GPU_ORACLE_PARITY_VALIDATION_COUNTER_READBACK_TIMESTAMP_RESIDENCY_PLATEAU_DEVICE_LOSS_RECOVERY_PACKAGED_ELECTRON_EXECUTION_HARNESS_SOURCE_BAKED_AWAITING_WINDOWS_EXECUTION.zip`
- **Parent repository bundle SHA-256:** `cb0c62b6ef2f880bdc3eaa183e412dd91f30588d10617bd54b2858dab0aa23bf`
- **Parent R9 specification SHA-256:** `570c580fe89d31e88bbf05d8f6f46e937611c4bb485f4b2a399b3019b3a8c608`
- **Parent R9 source receipt SHA-256:** `2cde15d4fb06deedf83800ba4f9ece2147dfb3fe509e2f804a9b94886daf669d`
- **Current source predecessor state:** `RESAMPLE_RUNTIME_R9_PHYSICAL_HARNESS_SOURCE_BAKED_AWAITING_WINDOWS_EXECUTION`
- **Required release predecessor state:** `RESAMPLE_RUNTIME_R9_PHYSICAL_GPU_AND_PACKAGED_EXECUTION_SEALED_AWAITING_R10`
- **R10 source-harness state:** `RESAMPLE_RUNTIME_R10_PROMOTION_HARNESS_SOURCE_BAKED_AWAITING_R9_PHYSICAL_RECEIPT`
- **R10 candidate-admitted state:** `RESAMPLE_RUNTIME_R10_CANDIDATE_ADMITTED_AWAITING_POINTER_CAS`
- **R10 promoted-smoke state:** `RESAMPLE_RUNTIME_R10_PROMOTED_SMOKE_PASS_AWAITING_ROLLBACK_DRILL`
- **R10 rollback state:** `RESAMPLE_RUNTIME_R10_ROLLBACK_DRILL_PASS_AWAITING_FINAL_REPROMOTION`
- **R10 final state:** `RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED`
- **Rejected state:** `RESAMPLE_RUNTIME_R10_PRODUCTION_CANDIDATE_REJECTED`
- **Global pointer identity:** `dadum.export.production-pointer`
- **Current pointer schema:** `2`
- **R10 write schema:** `3`
- **Current pointer raw SHA-256:** `1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8`
- **Current active build/package:** `null / null`
- **Current pointer candidate state:** `SOURCE_BAKED_UNPROMOTED`
- **Pointer selection unit:** whole packaged build only
- **Per-encoder rollback:** forbidden
- **Per-kernel rollback:** forbidden
- **Legacy fallback:** forbidden
- **Percentage rollout:** out of scope and forbidden
- **Canonical release profile:** `full-product-v1`
- **Source mandatory gates:** `129`
- **Release mandatory gates:** `202`
- **Total gates:** `331`

---

# 0. Executive Contract

R10은 R9가 물리적으로 검증한 packaged Electron 후보를 실제 Production Pointer의 선택 대상으로 승격하고, 같은 운영 경로에서 whole-build rollback과 최종 재승격까지 증명하는 마지막 release authority다. R10은 EWA 수학, WGSL, planner, ABI, alpha·border 의미를 다시 고치지 않는다. R10이 다루는 것은 오직 **후보의 자격**, **전역 선택 권위**, **원자적 상태 전이**, **실패 시 복귀 가능성**, **최종 release 영수증**이다.

R10은 두 층으로 나뉜다.

```text
source-harness acceptance
    pointer v3 schema, CAS writer, lock, maintenance barrier,
    relaunch, smoke, rollback drill, release ledger와 negative control이
    구현 가능한 상태임을 증명한다.
    production pointer는 변경하지 않으며 release gate는 모두 PENDING이다.

release acceptance
    immutable R9 final physical receipt와 full-product admission을 소비하고,
    실제 production pointer에 대해 promote → rollback → repromote를 실행한다.
    모든 release gate가 PASS한 뒤에만 최종 release receipt를 봉인한다.
```

R9 source receipt는 R10 실행 자격이 아니다. 다음 입력만 release admission으로 인정한다.

```text
TDT_RESAMPLE_RUNTIME_01_R9_FINAL_RECEIPT.json
state = RESAMPLE_RUNTIME_R9_PHYSICAL_GPU_AND_PACKAGED_EXECUTION_SEALED_AWAITING_R10
SOURCE_PASS = 110
PHYSICAL_PASS = 187
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0
productionPointerMutated = false
```

R10의 최종 증명 사슬은 다음과 같다.

```text
R9 physical receipt + whole-build admission
    ↓
candidate package bytes 재검증
    ↓
global lock + maintenance barrier + pending job drain
    ↓
PROMOTE intent seal
    ↓
pointer hash+generation CAS
    ↓
B package relaunch + post-promotion smoke
    ↓
controlled external failure trigger
    ↓
whole-build rollback CAS to A
    ↓
A package relaunch + rollback smoke
    ↓
REPROMOTE CAS to B
    ↓
B final relaunch + final smoke
    ↓
release ledger conservation
    ↓
immutable R10 final release receipt
```

R10은 한 번의 pointer 변경만 보고 성공으로 선언하지 않는다. rollback drill 후 최종 후보 B가 다시 active가 되어야 한다.

# 1. Parent Truth and Current Repository Facts

현재 제공된 R9 bundle에는 source-harness만 존재하며 물리 최종 receipt는 없다. 따라서 이 명세를 작성하거나 R10 source harness를 베이크할 수는 있지만 production promotion을 실행할 수는 없다. 이 조건은 추정으로 채우지 않는다.

현재 global pointer 두 mirror는 byte-identical하며 raw SHA-256는 다음과 같다.

```text
artifacts/runtime/TDT_EXPORT_PROMOTION_POINTER.json
artifacts/promotion/TDT_EXPORT_PROMOTION_POINTER_V2.json
SHA-256 = 1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8
```

현재 pointer의 중요한 값은 다음과 같다.

```text
schemaVersion = 2
pointerId = dadum.export.production-pointer
activeBuildId = null
activePackageContentId = null
candidateState = SOURCE_BAKED_UNPROMOTED
pointerMutationPerformed = false
promotionEligible = false
```

따라서 R10은 최초 승격 bootstrap 문제를 명시적으로 해결해야 한다. active previous build가 없는 상태에서는 후보 B 하나만으로 rollback drill을 통과할 수 없다.

# 2. Scope

R10의 범위:

- immutable R9 final physical receipt admission;
- 동일 package의 full-product whole-build admission;
- pointer v2 predecessor read와 v3 writer migration;
- raw file hash + generation compare-and-swap;
- global release lock과 maintenance barrier;
- production process quiescence와 fresh relaunch;
- candidate B post-promotion smoke;
- previous A whole-build rollback drill;
- candidate B final repromotion;
- release ledger와 immutable final receipt;
- failure cleanup과 stable rejection receipt.

# 3. Non-Goals

R10은 다음을 수행하지 않는다.

- EWA kernel, WGSL, planner, ABI 또는 fixture 수정;
- R9에서 실패한 후보의 자동 패치;
- CPU·WebGL·Canvas fallback 도입;
- 사용자별 percentage rollout 또는 canary split;
- 같은 package 안에서 worker, encoder, native addon, shader만 따로 교체;
- 실행 중 process의 hot swap;
- source tree 또는 dev server를 production package 대신 실행;
- R9 source receipt를 physical receipt로 승격;
- active package가 없는 상태에서 rollback target을 가상으로 발명.

# 4. Authority Model

## 4.1 Sole Selection Authority

실제 package 선택 권위는 `dadum.export.production-pointer` 하나다. R10은 별도의 resample component pointer로 다른 package를 선택하지 않는다.

Resample qualification은 pointer의 `activeQualificationReceipts` map에 attestation으로 결합된다.

```json
{
  "tdt.export.full-product": "<full-product receipt sha256>",
  "tdt.resample-runtime": "<R9 final physical receipt sha256>"
}
```

## 4.2 Whole-build Admission

R9는 resample runtime의 물리 증거다. 그러나 global pointer는 전체 packaged build를 선택하므로, 동일 packageContentId에 대한 full-product admission도 필요하다. 둘 중 하나만 PASS하면 promotionEligible은 false다.

## 4.3 No Mixed Build

다음은 전부 같은 build/package identity에 귀속되어야 한다.

- renderer;
- workers;
- wasm;
- native addons;
- R8/R9 resample runtime;
- release profile;
- full-product receipt;
- R9 final physical receipt.

# 5. State Machine

```text
R9_FINAL_PHYSICAL_ACCEPTED
  → R10_CANDIDATE_ADMITTED
  → R10_RELEASE_LOCKED_AND_DRAINED
  → R10_PROMOTE_INTENT_SEALED
  → R10_POINTER_PROMOTED
  → R10_PROMOTED_SMOKE_PASS
  → R10_ROLLBACK_TRIGGERED
  → R10_POINTER_ROLLED_BACK
  → R10_PREVIOUS_SMOKE_PASS
  → R10_REPROMOTE_INTENT_SEALED
  → R10_POINTER_REPROMOTED
  → R10_FINAL_SMOKE_PASS
  → R10_RELEASE_RECEIPT_SEALED
```

어느 단계에서든 schema mismatch, package mutation, CAS mismatch, pending job, relaunch identity mismatch, smoke failure, partial rollback, ledger break가 발생하면 상태는 `RESAMPLE_RUNTIME_R10_PRODUCTION_CANDIDATE_REJECTED`로 이동한다. 실패한 runId는 재개할 수 없다.

# 6. Production Pointer v3

R10 canonical pointer는 v2의 whole-build 필드를 보존하면서 generation과 qualification을 추가한다.

```json
{
  "schemaVersion": 3,
  "pointerId": "dadum.export.production-pointer",
  "generation": 12,
  "activeBuildId": "<build-id>",
  "activePackageContentId": "<package-content-id>",
  "activeReleaseProfileId": "full-product-v1",
  "activeQualificationReceipts": {
    "tdt.export.full-product": "<sha256>",
    "tdt.resample-runtime": "<sha256>"
  },
  "previousBuildId": "<build-id-or-null>",
  "previousPackageContentId": "<package-content-id-or-null>",
  "previousReleaseProfileId": "<profile-or-null>",
  "previousQualificationReceipts": {},
  "candidateBuildId": null,
  "candidatePackageContentId": null,
  "candidateReleaseProfileId": null,
  "candidateQualificationReceipts": null,
  "lastTransitionId": "<sha256>",
  "lastTransitionKind": "REPROMOTE",
  "lastTransitionIntentSha256": "<sha256>",
  "rollbackUnit": "whole-build-only",
  "legacyFallbackAllowed": false,
  "perEncoderRollbackAllowed": false,
  "perKernelRollbackAllowed": false,
  "pointerMutationPerformed": true,
  "pointerSha256": "<canonical-self-hash>"
}
```

## 6.1 Canonical Self-hash

`pointerSha256`를 제외한 문서를 canonical JSON으로 직렬화하고 SHA-256를 계산한다. CAS는 이 self-hash가 아니라 **raw pointer file SHA-256와 generation**을 동시에 비교한다.

## 6.2 Generation

모든 성공 transition은 generation을 정확히 1 증가시킨다.

```text
PROMOTE    g → g+1
ROLLBACK   g+1 → g+2
REPROMOTE  g+2 → g+3
```

generation은 ABA 문제를 차단한다. A→B→A로 내용이 비슷해져도 stale intent는 generation이 달라 실패한다.

# 7. Transition Intent

Pointer가 final release receipt를 직접 참조하면 pointer hash와 receipt hash가 순환할 수 있다. 따라서 pointer에는 mutation 전에 봉인된 transition intent digest만 기록한다.

필수 intent fields:

```text
schemaVersion
runId
transitionKind
transitionId
expectedPointerFileSha256
expectedGeneration
sourceBuildId
sourcePackageContentId
targetBuildId
targetPackageContentId
targetReleaseProfileId
targetQualificationSetDigest
r9FinalReceiptSha256
fullProductReceiptSha256
operatorApprovalDigest
createdAt
intentSha256
```

# 8. CAS Transaction

```text
Acquire Global Lock
→ Enter Maintenance Barrier
→ Drain Pending Jobs
→ Stop Active Process
→ Read Pointer Bytes
→ Verify Raw Hash + Self-hash + Generation
→ Verify Intent Expected Values
→ Construct v3 Pointer
→ Write Same-volume Temp File
→ Flush Temp File
→ Atomic Replace
→ Read Back Pointer
→ Verify Raw Hash + Self-hash + Generation + Active Identity
→ Write CAS Receipt
```

CAS mismatch는 자동 retry하지 않는다. 새로운 current pointer를 바탕으로 새로운 intent와 operator approval이 필요하다.

# 9. Global Lock and Maintenance Barrier

Lock은 전역 pointer 전체를 보호한다. promotion, rollback, repromotion drill 동안 해제하지 않는다.

Lock file은 원자적 exclusive create로 생성한다. 기존 lock을 자동 stale 판단으로 삭제하지 않는다. 비정상 종료 뒤 lock을 해제하려면 별도 recovery command와 receipt가 필요하다.

Maintenance barrier는:

- 신규 Preview job 거부;
- 신규 Export job 거부;
- 신규 save session 거부;
- 기존 pending job drain;
- pending readback 0;
- worker broker active job 0;
- process quiescence;

를 증명해야 한다.

# 10. Candidate Admission

후보는 다음이 모두 일치해야 한다.

```text
R9 final receipt buildId
= full-product receipt buildId
= package manifest buildId
= pointer candidateBuildId

R9 final receipt packageContentId
= full-product receipt packageContentId
= recomputed packageContentId
= pointer candidatePackageContentId
```

Package는 R9 실행 이후 byte mutation이 없어야 한다. R10은 후보 bytes를 수정해 smoke를 통과시키지 않는다.

# 11. Bootstrap When Active Pointer Is Null

현재 active build가 null이므로 최초 R10 완료에는 두 개의 독립 package가 필요하다.

```text
Qualified Package A
  → production promote and smoke
Qualified Package B
  → promote and smoke
  → controlled failure
  → rollback to A and smoke
  → repromote B and final smoke
```

A와 B는 서로 다른 `packageContentId`여야 하며, 둘 다 R9 physical receipt와 full-product admission을 가져야 한다. 동일 bytes에 buildId만 바꾼 후보는 금지한다.

R10 source harness는 이 정책을 구현할 수 있지만, A/B 입력이 없으면 release gate는 PENDING 또는 FAIL이며 최종 release를 만들 수 없다.

# 12. Promoted Relaunch

Pointer commit 뒤 기존 process를 재사용하지 않는다. Launcher가 pointer를 다시 읽고 active package를 fresh process로 시작한다.

Relaunch는 다음을 확인한다.

```text
launchedBuildId = pointer.activeBuildId
launchedPackageContentId = pointer.activePackageContentId
launchedReleaseProfileId = pointer.activeReleaseProfileId
qualificationSetDigest = pointer.activeQualificationReceipts digest
sourceTreeAccess = 0
devServerAccess = 0
pendingJobs = 0
```

# 13. Post-promotion Smoke

최소 resample smoke:

- Preview canonical lowpass;
- Export canonical lowpass;
- residual off Preview·Export lowpass identity;
- residual on alpha preservation;
- constant DC interior·edge·corner;
- transparent hidden RGB;
- validation counters all zero;
- CPU/legacy fallback zero.

Whole-build pointer이므로 full-product profile이 요구하는 최소 format smoke도 같이 수행한다.

# 14. Rollback Drill

## 14.1 Trigger

Drill trigger는 package 외부 test evidence로 주입한다. package bytes를 훼손하지 않는다. Trigger는 post-promotion health gate의 특정 stable error 하나를 발생시켜야 하며 다른 health 항목은 정상이어야 한다.

## 14.2 Rollback CAS

```text
B active pointer
→ ROLLBACK intent seal
→ CAS expected B hash/generation
→ active A / previous B
→ atomic replace and readback
→ A relaunch
→ A smoke
```

## 14.3 Forbidden Partial Rollback

- R8 shader만 A로 교체;
- worker만 A로 교체;
- encoder만 A로 교체;
- native addon만 A로 교체;
- 환경변수로 A를 선택하고 pointer는 B로 유지;
- source tree를 A package에 주입;

은 모두 금지한다.

# 15. Final Repromotion

Rollback 성공은 recovery proof이지 candidate release 완료가 아니다. Trigger를 제거한 뒤 새 intent와 새 generation으로 B를 다시 승격한다.

```text
A active after rollback
→ REPROMOTE intent
→ CAS A→B
→ B fresh relaunch
→ final smoke
→ final release receipt
```

최종 pointer는 B active, A previous여야 한다.

# 16. Release Artifact Set

```text
artifacts/resample-runtime-01-r10/<runId>/
  R10_RUN_MANIFEST.json
  R10_OPERATOR_APPROVAL_RECEIPT.json
  R10_R9_ADMISSION_RECEIPT.json
  R10_FULL_PRODUCT_ADMISSION_RECEIPT.json
  R10_CANDIDATE_IDENTITY.json
  R10_GLOBAL_LOCK_RECEIPT.json
  R10_MAINTENANCE_DRAIN_RECEIPT.json
  R10_PROMOTION_INTENT.json
  R10_PROMOTION_CAS_RECEIPT.json
  R10_PROMOTED_RELAUNCH_RECEIPT.json
  R10_PROMOTED_SMOKE_RECEIPT.json
  R10_ROLLBACK_TRIGGER_RECEIPT.json
  R10_ROLLBACK_INTENT.json
  R10_ROLLBACK_CAS_RECEIPT.json
  R10_ROLLBACK_RELAUNCH_RECEIPT.json
  R10_ROLLBACK_SMOKE_RECEIPT.json
  R10_REPROMOTION_INTENT.json
  R10_REPROMOTION_CAS_RECEIPT.json
  R10_FINAL_RELAUNCH_RECEIPT.json
  R10_FINAL_SMOKE_RECEIPT.json
  R10_RELEASE_LEDGER.json
  R10_RELEASE_GATE_RECEIPT.json
  TDT_RESAMPLE_RUNTIME_01_R10_FINAL_RELEASE_RECEIPT.json
```

# 17. Final Release Receipt

필수 필드:

```text
schemaVersion
schemaId
patchId
runId
state
candidateBuildId
candidatePackageContentId
previousBuildId
previousPackageContentId
releaseProfileId
r9FinalReceiptSha256
fullProductReceiptSha256
qualificationSetDigest
pointerBeforeSha256
pointerAfterPromotionSha256
pointerAfterRollbackSha256
pointerAfterRepromotionSha256
generationBefore
generationAfterPromotion
generationAfterRollback
generationAfterRepromotion
promotionTransitionId
rollbackTransitionId
repromotionTransitionId
promotionSmokePassed
rollbackDrillVerified
repromotionSmokePassed
wholeBuildIdentityPreserved
legacyFallbackUsed
perEncoderRollbackUsed
perKernelRollbackUsed
pendingJobs
blockers
childArtifacts
receiptSha256
```

최종 성공 값:

```text
state = RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED
promotionSmokePassed = true
rollbackDrillVerified = true
repromotionSmokePassed = true
wholeBuildIdentityPreserved = true
legacyFallbackUsed = false
perEncoderRollbackUsed = false
perKernelRollbackUsed = false
pendingJobs = 0
blockers = []
```

# 18. Failure and Cleanup

실패 시 pointer mutation 전이면 pointer를 그대로 보존한다. Pointer mutation 후 실패면 동일 lock 안에서 previous whole build로 rollback을 시도한다. Rollback도 실패하면 release는 terminal incident 상태로 남고 자동 fallback을 수행하지 않는다.

모든 종료 경로는 다음을 기록한다.

- current pointer raw/self hash;
- current generation;
- active build/package;
- lock cleanup 여부;
- barrier 상태;
- process 상태;
- pending jobs;
- temp pointer 잔존;
- package digest;
- stable error code;
- operator action required 여부.

# 19. Stable Error Codes

```text
E_R10_R9_FINAL_RECEIPT_MISSING
E_R10_R9_FINAL_STATE_MISMATCH
E_R10_R9_PENDING_GATE
E_R10_FULL_PRODUCT_RECEIPT_MISSING
E_R10_QUALIFICATION_IDENTITY_MISMATCH
E_R10_PACKAGE_MUTATED
E_R10_POINTER_SCHEMA_INVALID
E_R10_POINTER_SELF_HASH_MISMATCH
E_R10_POINTER_CAS_MISMATCH
E_R10_POINTER_GENERATION_MISMATCH
E_R10_PROMOTION_LOCK_HELD
E_R10_PROMOTION_LOCK_RECOVERY_REQUIRED
E_R10_MAINTENANCE_DRAIN_TIMEOUT
E_R10_PENDING_JOB_NONZERO
E_R10_OPERATOR_APPROVAL_MISSING
E_R10_ATOMIC_REPLACE_FAILED
E_R10_POINTER_READBACK_MISMATCH
E_R10_PROMOTED_IDENTITY_MISMATCH
E_R10_PROMOTED_SMOKE_FAILED
E_R10_ROLLBACK_TARGET_MISSING
E_R10_ROLLBACK_TARGET_UNQUALIFIED
E_R10_PARTIAL_ROLLBACK_FORBIDDEN
E_R10_ROLLBACK_CAS_FAILED
E_R10_ROLLBACK_SMOKE_FAILED
E_R10_REPROMOTION_CAS_FAILED
E_R10_FINAL_SMOKE_FAILED
E_R10_BOOTSTRAP_SECOND_PACKAGE_REQUIRED
E_R10_RELEASE_LEDGER_BROKEN
E_R10_RELEASE_RECEIPT_INCOMPLETE
E_R10_SOURCE_CANNOT_PROMOTE
```

# 20. Required Implementation Layout

```text
tools/resample-runtime-01-r10/
  identity.mjs
  canonical-json.mjs
  pointer-v3.mjs
  pointer-reader.mjs
  pointer-writer.mjs
  lock.mjs
  maintenance-barrier.mjs
  admit-r9.mjs
  admit-full-product.mjs
  admit-candidate.mjs
  create-promotion-intent.mjs
  promote-cas.mjs
  launch-active-package.mjs
  run-promoted-smoke.mjs
  create-rollback-trigger.mjs
  create-rollback-intent.mjs
  rollback-cas.mjs
  run-rollback-smoke.mjs
  create-repromotion-intent.mjs
  repromote-cas.mjs
  run-final-smoke.mjs
  finalize-release.mjs
  reject-release.mjs
  verify-source.mjs
  verify-release.mjs
  gate-source.mjs
  gate-release.mjs
  windows/
    atomic-replace.exe-or-native-helper
    run-release.ps1
  schemas/
    pointer-v3.schema.json
    transition-intent.schema.json
    cas-receipt.schema.json
    release-ledger.schema.json
    final-release-receipt.schema.json
```

# 21. Required Commands

```bash
npm run verify:resample-runtime-01-r10
npm run gate:resample-runtime-01-r10:source
npm run finalize:resample-runtime-01-r10:source
```

Windows release:

```powershell
$env:DADUM_R10_RUN_ID = "r10-release-001"
$env:DADUM_R10_APPROVAL_FILE = "D:\release\r10-approval.json"
$env:DADUM_R9_FINAL_RECEIPT = "D:\release\r9\TDT_RESAMPLE_RUNTIME_01_R9_FINAL_RECEIPT.json"

npm run admit:resample-runtime-01-r10
npm run promote:resample-runtime-01-r10
npm run drill:resample-runtime-01-r10
npm run finalize:resample-runtime-01-r10
```

# 22. Gate Semantics

- `SOURCE_MANDATORY`: source-harness bake에서 반드시 PASS한다.
- `RELEASE_MANDATORY`: source-harness receipt에서는 PENDING만 허용되며 실제 release에서 반드시 PASS한다.
- `FAIL`: 해당 run은 terminal rejected다.
- `PENDING`: source-harness 단계에서만 허용된다.
- `DEFERRED`, `SKIPPED`, `ASSUMED`, `NOT_APPLICABLE`: 최종 release에서 금지한다.
- bootstrap 조건이 충족되지 않으면 관련 release gate는 PASS가 아니라 FAIL 또는 PENDING이다.

# 23. SOURCE_MANDATORY Gates

## R10-S001 `PARENT_BUNDLE_DIGEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 source-harness parent bundle SHA-256가 메타데이터의 cb0c62b6... 값과 일치한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S001`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S002 `PARENT_SPEC_DIGEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 명세 SHA-256가 570c580f... 값과 일치한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S002`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S003 `PARENT_SOURCE_RECEIPT_DIGEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 source final receipt SHA-256가 2cde15d4... 값과 일치한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S003`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S004 `PARENT_FINALIZER_DIGEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 physical finalizer SHA-256가 5c088762... 값과 일치한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S004`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S005 `PARENT_SOURCE_STATE_EXACT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 부모 저장소의 현재 상태가 R9 source-harness 상태이며 물리 PASS로 오인되지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S005`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S006 `REQUIRED_R9_FINAL_STATE_DECLARED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 실행 선행 상태가 RESAMPLE_RUNTIME_R9_PHYSICAL_GPU_AND_PACKAGED_EXECUTION_SEALED_AWAITING_R10으로 정확히 선언된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S006`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S007 `R9_FINAL_RECEIPT_PATH_DECLARED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** TDT_RESAMPLE_RUNTIME_01_R9_FINAL_RECEIPT.json의 외부 입력 경로와 스키마가 선언된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S007`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S008 `R9_COUNTS_EXACT_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 최종 영수증은 SOURCE_PASS 110, PHYSICAL_PASS 187, PENDING/DEFERRED/SKIPPED/FAIL 0을 요구한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S008`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S009 `R9_POINTER_UNCHANGED_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 최종 영수증의 productionPointerMutated가 false여야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S009`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S010 `R9_PACKAGE_IDENTITY_REQUIRED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 package digest, buildId, packageContentId가 R10 후보 권위 입력으로 요구된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S010`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S011 `R9_ADAPTER_PROFILE_BOUND`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 primary adapter profile digest가 후보 승인 기록에 보존된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S011`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S012 `R9_CHILD_DIGEST_MANIFEST_REQUIRED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 child artifact digest manifest가 누락 없이 요구된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S012`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S013 `R9_RECEIPT_IMMUTABLE_INPUT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 최종 영수증은 read-only 외부 입력이며 R10이 재작성하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S013`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S014 `R9_SOURCE_ONLY_REJECTION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 source receipt만으로 후보 승격이 불가능하다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S014`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S015 `R9_PENDING_REJECTION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 물리 게이트에 PENDING이 하나라도 있으면 R10 release 실행을 거부한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S015`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S016 `GLOBAL_POINTER_IDENTITY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 유일한 선택 권위가 dadum.export.production-pointer임을 선언한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S016`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S017 `GLOBAL_POINTER_V2_INPUT_SUPPORT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 기존 schemaVersion 2 pointer를 읽기 전용 predecessor로 파싱할 수 있다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S017`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S018 `GLOBAL_POINTER_V3_OUTPUT_AUTHORITY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R10이 쓰는 canonical pointer schemaVersion은 3이다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S018`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S019 `NO_COMPONENT_SELECTION_POINTER`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 별도 resample 선택 포인터로 다른 packageContentId를 활성화하는 구조를 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S019`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S020 `WHOLE_BUILD_POINTER_ONLY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 승격과 롤백 단위가 whole-build-only로 고정된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S020`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S021 `CURRENT_POINTER_DIGEST_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 현재 두 pointer mirror의 raw file SHA-256 1462587f...를 source truth로 동결한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S021`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S022 `CURRENT_POINTER_MIRRORS_EQUAL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** artifacts/runtime와 artifacts/promotion의 기존 pointer 문서가 byte-identical임을 확인한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S022`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S023 `CURRENT_ACTIVE_NULL_RECORDED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 현재 activeBuildId와 activePackageContentId가 null인 bootstrap 상태임을 기록한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S023`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S024 `CURRENT_CANDIDATE_UNPROMOTED_RECORDED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 현재 candidateState SOURCE_BAKED_UNPROMOTED와 promotionEligible false를 기록한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S024`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S025 `CURRENT_POINTER_NOT_ELIGIBLE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 현재 v2 pointer를 R10 후보 승인으로 재사용하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S025`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S026 `FULL_PRODUCT_ADMISSION_REQUIRED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 전역 pointer 변경 전 동일 packageContentId의 full-product whole-build admission receipt를 요구한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S026`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S027 `EP03_OR_EQUIVALENT_RECEIPT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** TDT-EXPORT-PROMOTION-03 또는 동등한 full-product receipt의 허용 스키마를 명시한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S027`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S028 `QUALIFICATION_SET_IDENTITY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9 physical receipt와 full-product receipt를 정렬한 qualification set digest를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S028`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S029 `BUILD_ID_EQUALITY_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9, full-product receipt, candidate pointer의 buildId가 같아야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S029`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S030 `PACKAGE_ID_EQUALITY_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R9, full-product receipt, candidate pointer의 packageContentId가 같아야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S030`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S031 `POINTER_V3_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointer v3 JSON schema가 필수 필드, enum, nullability를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S031`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S032 `POINTER_CANONICAL_JSON`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointer self-hash용 canonical JSON 규칙을 UTF-8, key sort, array order 보존으로 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S032`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S033 `POINTER_SELF_HASH_EXCLUSION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointerSha256 필드 자체를 제외하고 self-hash를 계산한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S033`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S034 `POINTER_RAW_FILE_HASH`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** CAS 비교는 canonical self-hash와 별도로 raw pointer file SHA-256를 사용한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S034`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S035 `POINTER_GENERATION_U64`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointer generation은 0 이상의 단조 증가 정수로 정의된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S035`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S036 `POINTER_EXPECTED_GENERATION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 모든 transition intent가 expectedGeneration을 포함한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S036`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S037 `POINTER_EXPECTED_FILE_HASH`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 모든 transition intent가 expectedPointerFileSha256를 포함한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S037`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S038 `POINTER_TRANSITION_ID`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** transitionId는 runId, generation, target package, intent digest로 결정론적으로 계산된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S038`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S039 `POINTER_TRANSITION_KIND_ENUM`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** PROMOTE, ROLLBACK, REPROMOTE 외 transitionKind를 거부한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S039`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S040 `POINTER_QUALIFICATION_MAP`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** activeQualificationReceipts map에 full-product와 resample receipt digest를 보존한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S040`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S041 `POINTER_ACTIVE_RELEASE_PROFILE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** activeReleaseProfileId가 full-product-v1 또는 승인된 동등 profile로 제한된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S041`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S042 `POINTER_PREVIOUS_SNAPSHOT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** previous build/package/profile/qualification snapshot을 동일 문서에 보존한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S042`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S043 `POINTER_CANDIDATE_CLEARED_FINAL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 최종 활성 상태에서 candidate 필드는 null 또는 명시적 NONE 상태로 정리된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S043`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S044 `POINTER_NO_CIRCULAR_RECEIPT_HASH`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointer는 사후 release receipt가 아니라 사전 transition intent digest를 참조해 해시 순환을 피한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S044`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S045 `POINTER_COMPAT_READER`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** launcher가 v2 read-only와 v3 active 문서를 명시적으로 구분한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S045`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S046 `POINTER_V2_WRITE_FORBIDDEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R10 이후 v2 writer가 production pointer를 갱신하지 못한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S046`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S047 `POINTER_MIRROR_POLICY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** canonical pointer 한 개만 쓰고 mirror는 read-only 복제 또는 제거로 정책을 고정한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S047`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S048 `POINTER_MIRROR_ATOMICITY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** mirror를 유지할 경우 canonical commit 이후 digest-verified copy만 허용한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S048`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S049 `POINTER_SCHEMA_DOWNGRADE_FORBIDDEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** v3 active pointer를 v2로 다운그레이드하는 쓰기를 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S049`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S050 `POINTER_UNKNOWN_FIELD_POLICY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** v3 reader의 unknown field 처리와 required field 누락 거부 정책을 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S050`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S051 `PROMOTION_INTENT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 승격 전 immutable promotion intent receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S051`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S052 `ROLLBACK_INTENT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** rollback 전 immutable rollback intent receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S052`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S053 `REPROMOTION_INTENT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 재승격 전 immutable repromotion intent receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S053`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S054 `CAS_RECEIPT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 각 CAS 결과의 before/after hash, generation, transitionId 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S054`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S055 `RELAUNCH_RECEIPT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointer 기반 새 프로세스 relaunch receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S055`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S056 `SMOKE_RECEIPT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Preview·Export 최소 smoke receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S056`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S057 `ROLLBACK_RECEIPT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** whole-build rollback drill receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S057`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S058 `FINAL_RELEASE_RECEIPT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 최종 R10 release receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S058`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S059 `RELEASE_LEDGER_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 모든 transition artifact의 순서와 digest를 연결하는 release ledger 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S059`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S060 `REJECTION_RECEIPT_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 승격 거부와 cleanup 결과를 보존하는 rejection receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S060`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S061 `ATOMIC_JSON_WRITE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 모든 receipt는 temp write, file flush, atomic replace, readback hash 순서로 기록한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S061`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S062 `RECEIPT_CHILD_DIGESTS`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 최종 receipt는 모든 child artifact의 SHA-256와 byte count를 포함한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S062`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S063 `RECEIPT_NO_SELF_CYCLE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** receipt self-hash는 자기 digest 필드를 제외한 canonical payload로 계산한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S063`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S064 `RECEIPT_IMMUTABLE_AFTER_SEAL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** SEALED receipt의 in-place 수정과 덮어쓰기를 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S064`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S065 `RECEIPT_VOLATILE_FIELD_POLICY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** timestamp, pid, duration 등 volatile field의 포함과 비교 정책을 명시한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S065`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S066 `STABLE_ERROR_CODE_REGISTRY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R10 전용 stable error code registry를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S066`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S067 `SOURCE_AND_RELEASE_GATE_SPLIT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** SOURCE_MANDATORY와 RELEASE_MANDATORY 게이트를 분리한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S067`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S068 `NO_RELEASE_PASS_FROM_SOURCE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** source-harness bake가 RELEASE PASS를 생성하지 못한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S068`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S069 `NO_POINTER_MUTATION_FROM_SOURCE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** source 검증과 fixture 생성은 production pointer를 바꾸지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S069`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S070 `NO_PACKAGE_MUTATION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R10은 후보와 이전 package bytes를 수정하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S070`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S071 `PROMOTION_LOCK_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** exclusive promotion lock document 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S071`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S072 `LOCK_EXCLUSIVE_CREATE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** lock 획득은 O_CREAT|O_EXCL 또는 동등 원자 연산으로 제한한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S072`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S073 `LOCK_AUTO_STALE_DELETE_FORBIDDEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 기존 lock의 자동 삭제를 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S073`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S074 `LOCK_RECOVERY_RECEIPT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** stale lock 해제는 별도 operator recovery receipt를 요구한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S074`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S075 `LOCK_SCOPE_GLOBAL_POINTER`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** lock 범위가 global production pointer 전체임을 고정한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S075`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S076 `LOCK_HELD_THROUGH_DRILL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 승격, rollback, 재승격 drill 전체 동안 동일 release lock을 유지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S076`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S077 `LOCK_RELEASE_AFTER_FINAL_SMOKE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 최종 후보 smoke와 receipt seal 후에만 lock을 해제한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S077`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S078 `MAINTENANCE_BARRIER_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 새 Preview·Export job을 막는 maintenance barrier 계약을 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S078`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S079 `NEW_JOB_ADMISSION_BLOCK`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointer transition 전에 신규 작업 입장을 차단한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S079`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S080 `PENDING_JOB_DRAIN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 기존 pending Preview·Export job을 0까지 drain하는 절차를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S080`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S081 `DRAIN_TIMEOUT_FAIL_CLOSED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** drain timeout 시 강제 승격 대신 실패한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S081`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S082 `NO_HOT_SWAP_RUNNING_PROCESS`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 실행 중 프로세스의 shader나 package를 hot swap하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S082`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S083 `PROCESS_TERMINATION_BEFORE_SWITCH`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointer commit 전에 선택 권위에 종속된 production process를 정상 종료한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S083`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S084 `PROCESS_KILL_FALLBACK_RECEIPT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 강제 종료가 필요하면 별도 receipt와 nonzero incident flag를 남긴다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S084`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S085 `SOURCE_TREE_ISOLATION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** promotion launcher가 source tree나 dev server를 선택 경로로 사용하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S085`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S086 `PACKAGE_READ_ONLY_GUARD`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 후보와 previous package 디렉터리에 read-only guard와 pre/post digest를 적용한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S086`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S087 `SAME_VOLUME_TEMP_POINTER`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** pointer temp file은 canonical pointer와 같은 volume에 생성한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S087`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S088 `WINDOWS_ATOMIC_REPLACE_AUTHORITY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Windows에서는 ReplaceFileW 또는 MoveFileExW REPLACE_EXISTING|WRITE_THROUGH 동등 권위를 사용한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S088`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S089 `POINTER_FILE_FLUSH`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** rename 전 temp pointer file flush를 요구한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S089`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S090 `POINTER_DIRECTORY_DURABILITY_POLICY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** parent directory durability의 지원 여부와 fallback evidence 정책을 명시한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S090`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S091 `POINTER_READBACK_VERIFY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** commit 후 raw file hash, self-hash, generation, active identity를 재검증한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S091`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S092 `CAS_MISMATCH_NO_RETRY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** CAS mismatch를 자동 재읽기 후 재시도하지 않고 새 intent를 요구한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S092`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S093 `CAS_SINGLE_WRITER_TEST`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 동시 writer negative control이 정확히 하나만 성공하도록 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S093`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S094 `CAS_ABA_PREVENTION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** generation 증가로 A→B→A 후 stale intent의 성공을 막는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S094`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S095 `CAS_PARTIAL_WRITE_NEGATIVE_CONTROL`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 절단 pointer, invalid JSON, self-hash mismatch를 launcher가 거부한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S095`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S096 `BOOTSTRAP_POLICY_DECLARED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** active pointer가 null인 현재 상태의 bootstrap A/B 규칙을 명시한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S096`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S097 `BOOTSTRAP_DISTINCT_CONTENT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** bootstrap A와 B는 서로 다른 packageContentId를 가져야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S097`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S098 `BOOTSTRAP_BOTH_QUALIFIED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** bootstrap A와 B 모두 R9 physical 및 whole-build admission을 통과해야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S098`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S099 `BOOTSTRAP_FAKE_BUILD_ID_FORBIDDEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 동일 package bytes에 buildId만 바꾼 가짜 A/B를 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S099`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S100 `ROLLBACK_TRIGGER_SCHEMA`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** package 외부의 drill trigger receipt 스키마를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S100`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S101 `ROLLBACK_TRIGGER_NO_PACKAGE_MUTATION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** drill trigger가 package bytes를 수정하지 못한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S101`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S102 `ROLLBACK_WHOLE_BUILD_ONLY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** kernel, worker, encoder, addon 단위 rollback을 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S102`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S103 `ROLLBACK_POINTER_CAS`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** rollback도 동일한 hash+generation CAS를 사용한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S103`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S104 `ROLLBACK_PREVIOUS_IDENTITY_EXACT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** rollback target은 pointer previous snapshot과 exact match해야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S104`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S105 `ROLLBACK_RELAUNCH_REQUIRED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** rollback 후 previous package를 새 프로세스로 실행해야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S105`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S106 `ROLLBACK_MINIMUM_SMOKE_DEFINED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** rollback 후 Preview·Export 최소 smoke matrix를 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S106`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S107 `REPROMOTION_REQUIRED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** drill 성공 후 최종 후보 B를 다시 CAS 승격해야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S107`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S108 `REPROMOTION_NEW_GENERATION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 재승격은 새 generation과 새 transitionId를 사용한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S108`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S109 `FINAL_CANDIDATE_ACTIVE_RULE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 최종 release에서 후보 B가 active이고 A가 previous여야 한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S109`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S110 `FINAL_LOCK_CLEANUP`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 최종 성공과 실패 모두 lock·barrier cleanup을 검증한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S110`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S111 `NO_LEGACY_FALLBACK`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** legacy runtime fallback을 promotion/rollback 동안 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S111`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S112 `NO_ENV_BUILD_OVERRIDE`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 환경변수로 pointer를 우회해 build를 선택하지 못한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S112`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S113 `NO_PERCENT_ROLLOUT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R10에서는 percentage rollout 또는 사용자별 split을 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S113`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S114 `NO_BACKGROUND_MUTATION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 승격 도구 종료 후 background writer가 pointer를 변경하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S114`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S115 `ACTIVE_GRAPH_ADMISSION`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R10 tooling만 source graph에 입장하고 production runtime 수학은 변경하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S115`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S116 `R8_R9_RUNTIME_HASH_FROZEN`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R8 product WGSL, planner, ABI와 R9 physical harness 핵심 해시를 동결한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S116`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S117 `PREDECESSOR_REGRESSION_COMMAND`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R1A부터 R9 source gate까지 독립 predecessor regression 명령을 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S117`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S118 `SCRIPT_ENTRYPOINTS`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** verify, admit, promote, drill, finalize, reject 명령을 package.json에 명시한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S118`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S119 `POWERSHELL_ENTRYPOINTS`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** Windows release 실행용 PowerShell entrypoint와 인자 규약을 정의한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S119`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S120 `RUN_ID_REQUIRED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 모든 release 실행에 고유 R10 runId를 요구한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S120`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S121 `OUTPUT_OVERWRITE_GUARD`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 기존 runId evidence directory 덮어쓰기를 금지한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S121`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S122 `NETWORK_DISABLED_BY_DEFAULT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 승격 실행은 외부 네트워크 의존 없이 수행한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S122`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S123 `OPERATOR_APPROVAL_INPUT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 실제 pointer mutation에는 명시적 승인 토큰 또는 signed approval file을 요구한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S123`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S124 `APPROVAL_NOT_EMBEDDED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 승인 값은 소스·package·fixture에 하드코딩하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S124`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S125 `SOURCE_STATE_EXACT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** source bake 최종 상태를 RESAMPLE_RUNTIME_R10_PROMOTION_HARNESS_SOURCE_BAKED_AWAITING_R9_PHYSICAL_RECEIPT로 고정한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S125`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S126 `RELEASE_STATE_DECLARED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 최종 release 상태를 RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED로 선언한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S126`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S127 `REJECTED_STATE_DECLARED`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** 거부 상태를 RESAMPLE_RUNTIME_R10_PRODUCTION_CANDIDATE_REJECTED로 선언한다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S127`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S128 `NO_IMPLICIT_NEXT_AUTHORITY`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** R10 이후 자동 후속 승격 권위를 선언하지 않는다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S128`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-S129 `SOURCE_GATE_COUNT_EXACT`

- **Class:** `SOURCE_MANDATORY`
- **Requirement:** SOURCE_MANDATORY gate count가 129로 고정된다.
- **PASS:** 정적 검사, 스키마 검증, deterministic fixture 또는 source-level negative control이 요구사항을 직접 증명한다.
- **FAIL:** 필수 source authority, schema, guard, command, digest, negative control 또는 predecessor 보존이 누락되거나 모순된다.
- **PENDING:** 허용되지 않는다.
- **Receipt:** `R10-S129`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

# 24. RELEASE_MANDATORY Gates

## R10-P001 `R9_FINAL_RECEIPT_PRESENT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 외부 evidence root에 R9 final physical receipt가 존재한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P001`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P002 `R9_FINAL_RECEIPT_SCHEMA_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 final physical receipt가 선언된 schema를 통과한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P002`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P003 `R9_FINAL_STATE_EXACT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 state가 RESAMPLE_RUNTIME_R9_PHYSICAL_GPU_AND_PACKAGED_EXECUTION_SEALED_AWAITING_R10이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P003`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P004 `R9_SOURCE_PASS_110`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 SOURCE_PASS가 정확히 110이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P004`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P005 `R9_PHYSICAL_PASS_187`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 PHYSICAL_PASS가 정확히 187이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P005`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P006 `R9_PENDING_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 PENDING이 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P006`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P007 `R9_DEFERRED_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 DEFERRED가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P007`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P008 `R9_SKIPPED_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 SKIPPED가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P008`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P009 `R9_FAIL_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 FAIL이 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P009`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P010 `R9_POINTER_MUTATION_FALSE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 productionPointerMutated가 false이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P010`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P011 `R9_PACKAGE_DIGEST_PRESENT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 package digest가 비어 있지 않다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P011`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P012 `R9_PACKAGE_POST_HASH_EQUAL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 실행 전후 package digest가 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P012`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P013 `R9_BUILD_ID_PRESENT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 buildId가 비어 있지 않다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P013`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P014 `R9_PACKAGE_CONTENT_ID_PRESENT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 packageContentId가 비어 있지 않다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P014`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P015 `R9_ADAPTER_PROFILE_PRESENT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 primary adapter profile digest가 존재한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P015`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P016 `R9_CHILD_MANIFEST_COMPLETE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 child digest manifest의 모든 필수 artifact가 존재한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P016`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P017 `R9_RECEIPT_DIGEST_RECOMPUTED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 final receipt digest를 독립 재계산해 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P017`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P018 `R9_RECEIPT_READ_ONLY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R10 실행 전후 R9 receipt bytes가 동일하다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P018`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P019 `R9_CANDIDATE_PACKAGE_EXISTS`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9가 검증한 candidate package 경로가 존재한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P019`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P020 `R9_CANDIDATE_PACKAGE_READ_ONLY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** candidate package가 read-only guard를 통과한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P020`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P021 `FULL_PRODUCT_RECEIPT_PRESENT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 동일 candidate의 full-product admission receipt가 존재한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P021`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P022 `FULL_PRODUCT_RECEIPT_PASS`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** full-product receipt status가 승인 상태이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P022`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P023 `FULL_PRODUCT_BUILD_ID_EQUAL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** full-product buildId가 R9 buildId와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P023`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P024 `FULL_PRODUCT_PACKAGE_ID_EQUAL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** full-product packageContentId가 R9 packageContentId와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P024`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P025 `FULL_PRODUCT_BLOCKERS_EMPTY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** full-product receipt blockers가 빈 배열이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P025`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P026 `QUALIFICATION_SET_DIGEST`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9와 full-product receipt의 qualification set digest가 계산된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P026`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P027 `CANDIDATE_RELEASE_PROFILE_FULL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** candidate release profile이 full-product-v1 또는 승인된 동등 profile이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P027`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P028 `CANDIDATE_NO_MIXED_ARTIFACT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** renderer, worker, wasm, native addon이 모두 같은 packageContentId에 귀속된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P028`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P029 `CANDIDATE_BUILD_MANIFEST_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** package 내부 build manifest가 candidate buildId와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P029`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P030 `CANDIDATE_RUNTIME_KERNEL_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** package 내부 resample kernel ID가 R9 receipt와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P030`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P031 `CANDIDATE_ABI_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** package 내부 parameter ABI가 R9 receipt와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P031`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P032 `CANDIDATE_PLANNER_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** package 내부 planner ID가 R9 receipt와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P032`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P033 `CANDIDATE_ACTIVE_GRAPH_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** package 내부 active graph digest가 admission receipt와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P033`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P034 `CANDIDATE_PACKAGE_HASH_RECHECK`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 승격 직전 package tree digest를 다시 계산해 R9와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P034`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P035 `CANDIDATE_ELIGIBLE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 모든 admission 조건 통과 후 candidateEligible가 true이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P035`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P036 `OPERATOR_APPROVAL_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 명시적 release approval input이 runId와 candidate package에 결합된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P036`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P037 `RUN_ID_UNIQUE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R10 runId가 기존 release ledger에 존재하지 않는다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P037`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P038 `EVIDENCE_DIRECTORY_EMPTY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 새 run evidence directory가 비어 있다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P038`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P039 `GLOBAL_LOCK_ACQUIRED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** global promotion lock을 원자적으로 획득한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P039`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P040 `LOCK_OWNER_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** lock owner runId, pid, host가 현재 실행과 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P040`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P041 `LOCK_EXPECTED_POINTER_BOUND`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** lock document가 expected pointer hash와 generation에 결합된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P041`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P042 `MAINTENANCE_BARRIER_ENTERED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 새 Preview·Export job admission이 차단된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P042`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P043 `NEW_JOB_REJECTION_OBSERVED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** barrier 후 신규 job이 stable maintenance error로 거부된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P043`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P044 `PENDING_JOB_COUNT_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 기존 pending Preview·Export job count가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P044`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P045 `PENDING_READBACK_COUNT_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pending GPU readback count가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P045`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P046 `PENDING_SAVE_SESSION_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pending atomic save session count가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P046`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P047 `ACTIVE_WORKER_JOB_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** worker broker active job count가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P047`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P048 `PROCESS_QUIESCENCE_RECEIPT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** production process quiescence receipt가 완성된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P048`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P049 `ACTIVE_PROCESS_EXITED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pointer 선택에 종속된 active process가 정상 종료된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P049`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P050 `FORCED_KILL_NOT_USED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 정상 release 경로에서는 forced kill이 사용되지 않는다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P050`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P051 `POINTER_CANONICAL_FILE_SELECTED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 유일한 canonical pointer file 경로가 선택된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P051`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P052 `POINTER_BEFORE_READ`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pointer before bytes를 읽고 보존한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P052`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P053 `POINTER_BEFORE_JSON_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pointer before JSON이 v2 또는 v3 schema를 통과한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P053`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P054 `POINTER_BEFORE_RAW_HASH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pointer before raw file SHA-256를 계산한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P054`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P055 `POINTER_BEFORE_SELF_HASH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** v3인 경우 self-hash를 검증하고 v2는 migration receipt를 요구한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P055`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P056 `POINTER_BEFORE_GENERATION`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** v2 bootstrap generation 0 또는 v3 generation을 확정한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P056`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P057 `POINTER_MIRROR_BEFORE_EQUAL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 모든 pointer mirror가 canonical before identity와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P057`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P058 `EXPECTED_HASH_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promotion intent expectedPointerFileSha256가 actual before hash와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P058`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P059 `EXPECTED_GENERATION_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promotion intent expectedGeneration이 actual generation과 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P059`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P060 `PROMOTION_INTENT_SEALED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promotion intent receipt가 pointer mutation 전에 seal된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P060`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P061 `PROMOTION_INTENT_CANDIDATE_BOUND`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** intent가 candidate build/package/qualification digest에 결합된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P061`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P062 `PROMOTION_INTENT_PREVIOUS_BOUND`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** intent가 current active/previous snapshot에 결합된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P062`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P063 `PROMOTION_TRANSITION_ID_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** PROMOTE transitionId가 결정론적 재계산과 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P063`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P064 `POINTER_V3_PROMOTE_DOCUMENT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 새 v3 pointer 문서가 schema와 invariant를 통과한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P064`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P065 `POINTER_PROMOTE_GENERATION_PLUS_ONE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** PROMOTE generation이 before + 1이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P065`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P066 `POINTER_PROMOTE_ACTIVE_CANDIDATE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** active build/package가 candidate와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P066`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P067 `POINTER_PROMOTE_PREVIOUS_SNAPSHOT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** previous snapshot이 before active identity와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P067`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P068 `POINTER_PROMOTE_QUALIFICATION_MAP`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** active qualification map이 R9/full-product digest를 포함한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P068`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P069 `POINTER_PROMOTE_ROLLBACK_UNIT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollbackUnit이 whole-build-only이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P069`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P070 `POINTER_PROMOTE_FALLBACK_FALSE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** legacy, per-encoder, per-kernel fallback flags가 false이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P070`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P071 `POINTER_PROMOTE_SELF_HASH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 새 pointer self-hash가 독립 재계산과 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P071`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P072 `POINTER_TEMP_SAME_VOLUME`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** temp pointer가 canonical file과 같은 volume에 있다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P072`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P073 `POINTER_TEMP_FLUSHED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** temp pointer file이 atomic replace 전에 flush된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P073`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P074 `POINTER_ATOMIC_REPLACE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** Windows atomic replace authority로 pointer가 교체된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P074`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P075 `POINTER_PROMOTE_READBACK`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 교체 직후 pointer를 다시 읽는다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P075`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P076 `POINTER_PROMOTE_RAW_HASH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pointer after raw file hash가 CAS receipt에 기록된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P076`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P077 `POINTER_PROMOTE_SCHEMA_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pointer after가 v3 schema를 통과한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P077`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P078 `POINTER_PROMOTE_GENERATION_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pointer after generation이 의도한 값과 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P078`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P079 `POINTER_PROMOTE_IDENTITY_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pointer after active identity가 candidate와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P079`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P080 `POINTER_PROMOTE_MIRROR_SYNC`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** mirror 정책에 따라 동일 digest 복제가 완료된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P080`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P081 `POINTER_PROMOTE_CAS_RECEIPT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** PROMOTE CAS receipt가 before/after identity를 완전하게 기록한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P081`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P082 `PROMOTED_LAUNCH_FROM_POINTER`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 새 프로세스가 pointer만 읽어 candidate package를 실행한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P082`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P083 `PROMOTED_NO_SOURCE_TREE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promoted process가 source tree나 dev server를 읽지 않는다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P083`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P084 `PROMOTED_BUILD_ID_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** launched buildId가 pointer activeBuildId와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P084`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P085 `PROMOTED_PACKAGE_ID_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** launched packageContentId가 pointer activePackageContentId와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P085`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P086 `PROMOTED_PROFILE_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** launched release profile이 pointer activeReleaseProfileId와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P086`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P087 `PROMOTED_QUALIFICATION_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** launched qualification set가 pointer map과 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P087`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P088 `PROMOTED_RUNTIME_READY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** stable runtime API, GPU authority, worker broker가 ready이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P088`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P089 `PROMOTED_DEVICE_HARDWARE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promoted launch가 hardware adapter를 사용한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P089`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P090 `PROMOTED_PENDING_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promoted launch 직후 pending jobs가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P090`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P091 `PROMOTED_PREVIEW_SMOKE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** canonical Preview lowpass smoke가 PASS한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P091`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P092 `PROMOTED_EXPORT_SMOKE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** canonical Export lowpass/residual/finalization smoke가 PASS한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P092`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P093 `PROMOTED_PREVIEW_EXPORT_IDENTITY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** residual off lowpass identity가 R9 기준과 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P093`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P094 `PROMOTED_ALPHA_BORDER_DC_SMOKE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** alpha, border, DC 최소 smoke가 PASS한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P094`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P095 `PROMOTED_VALIDATION_COUNTER_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** admitted validation counters가 모두 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P095`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P096 `PROMOTED_NO_CPU_FALLBACK`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promoted smoke에서 CPU resample fallback이 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P096`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P097 `PROMOTED_NO_LEGACY_FALLBACK`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promoted smoke에서 legacy EWA fallback이 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P097`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P098 `PROMOTED_PACKAGE_HASH_STABLE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promoted smoke 후 candidate package digest가 변하지 않는다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P098`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P099 `PROMOTED_SMOKE_RECEIPT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promotion smoke receipt가 seal된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P099`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P100 `ROLLBACK_PREVIOUS_EXISTS`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback target previous build/package가 존재한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P100`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P101 `ROLLBACK_PREVIOUS_DISTINCT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** previous packageContentId가 candidate와 다르다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P101`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P102 `ROLLBACK_PREVIOUS_QUALIFIED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** previous build가 R9 physical 및 whole-build qualification을 가진다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P102`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P103 `ROLLBACK_BOOTSTRAP_RULE_SATISFIED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** active null bootstrap이면 A/B 두 qualified package 시퀀스가 충족된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P103`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P104 `ROLLBACK_TRIGGER_ARMED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 허용된 test-only rollback trigger가 package 외부에서 arm된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P104`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P105 `ROLLBACK_TRIGGER_RECEIPT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** trigger identity와 digest가 receipt로 기록된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P105`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P106 `ROLLBACK_TRIGGER_OBSERVED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promoted health gate가 의도된 stable error로 실패한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P106`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P107 `ROLLBACK_TRIGGER_SCOPE_EXACT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 주입된 실패 외 다른 health 항목은 정상이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P107`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P108 `ROLLBACK_NO_PACKAGE_MUTATION`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** trigger 전후 candidate package digest가 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P108`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P109 `ROLLBACK_NEW_JOB_BLOCKED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback 중 maintenance barrier가 유지된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P109`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P110 `ROLLBACK_ACTIVE_PROCESS_EXITED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** candidate process가 종료된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P110`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P111 `ROLLBACK_POINTER_BEFORE_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback CAS의 before hash/generation이 promoted pointer와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P111`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P112 `ROLLBACK_INTENT_SEALED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback intent가 pointer mutation 전에 seal된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P112`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P113 `ROLLBACK_TRANSITION_ID_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** ROLLBACK transitionId가 결정론적 재계산과 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P113`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P114 `ROLLBACK_POINTER_DOCUMENT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback v3 pointer 문서가 schema와 invariant를 통과한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P114`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P115 `ROLLBACK_GENERATION_PLUS_ONE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback generation이 promoted generation + 1이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P115`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P116 `ROLLBACK_ACTIVE_PREVIOUS`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback after active identity가 previous A와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P116`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P117 `ROLLBACK_PREVIOUS_CANDIDATE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback after previous snapshot이 candidate B와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P117`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P118 `ROLLBACK_WHOLE_BUILD_FLAG`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** wholeBuildRollback가 true이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P118`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P119 `ROLLBACK_NO_PARTIAL_SWAP`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** worker, wasm, addon, shader의 package 혼합이 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P119`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P120 `ROLLBACK_ATOMIC_REPLACE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback pointer가 atomic replace로 commit된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P120`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P121 `ROLLBACK_READBACK_HASH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback pointer readback raw/self hash가 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P121`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P122 `ROLLBACK_CAS_RECEIPT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback CAS receipt가 seal된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P122`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P123 `ROLLBACK_LAUNCH_FROM_POINTER`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** previous package A가 rollback pointer를 통해 새로 실행된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P123`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P124 `ROLLBACK_BUILD_ID_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback launch buildId가 pointer activeBuildId와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P124`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P125 `ROLLBACK_PACKAGE_ID_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback launch packageContentId가 pointer activePackageContentId와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P125`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P126 `ROLLBACK_RUNTIME_READY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback launch runtime health가 ready이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P126`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P127 `ROLLBACK_PREVIEW_SMOKE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** previous package Preview smoke가 PASS한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P127`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P128 `ROLLBACK_EXPORT_SMOKE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** previous package Export smoke가 PASS한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P128`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P129 `ROLLBACK_MINIMUM_FORMAT_SMOKE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** whole-build profile에 필요한 최소 포맷 smoke가 PASS한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P129`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P130 `ROLLBACK_PENDING_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback launch 후 pending job이 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P130`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P131 `ROLLBACK_NO_FALLBACK`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback에서 legacy/per-component fallback이 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P131`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P132 `ROLLBACK_PACKAGE_HASH_STABLE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** previous package digest가 rollback 실행 전후 동일하다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P132`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P133 `ROLLBACK_RECEIPT_SEALED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** whole-build rollback drill receipt가 seal된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P133`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P134 `ROLLBACK_DURATION_RECORDED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback duration과 단계별 timing이 기록된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P134`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P135 `ROLLBACK_TRIGGER_DISARMED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 재승격 전에 test-only trigger가 제거된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P135`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P136 `REPROMOTION_APPROVAL_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 재승격 의도가 동일 release approval 범위에 포함된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P136`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P137 `REPROMOTION_POINTER_BEFORE_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** repromotion before hash/generation이 rollback pointer와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P137`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P138 `REPROMOTION_INTENT_SEALED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** repromotion intent가 mutation 전에 seal된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P138`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P139 `REPROMOTION_TRANSITION_ID_VALID`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** REPROMOTE transitionId가 결정론적 재계산과 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P139`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P140 `REPROMOTION_GENERATION_PLUS_ONE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** repromotion generation이 rollback generation + 1이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P140`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P141 `REPROMOTION_ACTIVE_CANDIDATE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** repromotion after active identity가 candidate B와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P141`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P142 `REPROMOTION_PREVIOUS_A`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** repromotion after previous snapshot이 A와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P142`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P143 `REPROMOTION_QUALIFICATION_MAP`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** candidate qualification map이 최초 promotion과 동일하다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P143`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P144 `REPROMOTION_ATOMIC_REPLACE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** repromotion pointer가 atomic replace로 commit된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P144`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P145 `REPROMOTION_READBACK_HASH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** repromotion pointer readback hash가 intent와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P145`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P146 `REPROMOTION_CAS_RECEIPT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** repromotion CAS receipt가 seal된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P146`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P147 `FINAL_LAUNCH_FROM_POINTER`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 B 프로세스가 repromoted pointer에서 실행된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P147`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P148 `FINAL_BUILD_ID_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 launched buildId가 B와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P148`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P149 `FINAL_PACKAGE_ID_MATCH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 launched packageContentId가 B와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P149`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P150 `FINAL_RUNTIME_READY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 runtime health가 ready이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P150`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P151 `FINAL_PREVIEW_SMOKE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 Preview smoke가 PASS한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P151`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P152 `FINAL_EXPORT_SMOKE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 Export smoke가 PASS한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P152`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P153 `FINAL_RESAMPLE_IDENTITY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 resample kernel, ABI, planner, qualification digest가 R9와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P153`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P154 `FINAL_VALIDATION_COUNTER_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 validation counters가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P154`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P155 `FINAL_PENDING_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 pending Preview/Export/save/readback job이 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P155`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P156 `FINAL_PACKAGE_HASH_STABLE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 B package bytes가 R9 digest와 동일하다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P156`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P157 `FINAL_POINTER_ACTIVE_B`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 pointer active가 B이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P157`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P158 `FINAL_POINTER_PREVIOUS_A`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 pointer previous가 A이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P158`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P159 `FINAL_POINTER_CANDIDATE_CLEARED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 pointer candidate fields가 정리된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P159`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P160 `FINAL_POINTER_GENERATION_CHAIN`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promote→rollback→repromote generation chain이 연속이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P160`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P161 `FINAL_POINTER_HASH_CHAIN`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 세 CAS receipt의 before/after raw hash가 끊김 없이 연결된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P161`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P162 `FINAL_TRANSITION_ID_UNIQUE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 세 transitionId가 서로 다르고 ledger에 한 번씩만 나타난다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P162`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P163 `FINAL_RECEIPT_CHILDREN_COMPLETE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 release receipt의 child artifact set이 완전하다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P163`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P164 `FINAL_RECEIPT_R9_BOUND`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 receipt가 R9 final physical receipt digest를 포함한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P164`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P165 `FINAL_RECEIPT_FULL_PRODUCT_BOUND`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 receipt가 full-product admission digest를 포함한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P165`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P166 `FINAL_RECEIPT_PROMOTION_BOUND`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 receipt가 PROMOTE CAS 및 smoke receipt를 포함한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P166`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P167 `FINAL_RECEIPT_ROLLBACK_BOUND`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 receipt가 rollback trigger, CAS, launch, smoke receipt를 포함한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P167`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P168 `FINAL_RECEIPT_REPROMOTION_BOUND`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 receipt가 REPROMOTE CAS 및 final smoke receipt를 포함한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P168`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P169 `FINAL_RECEIPT_POINTER_HASH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 receipt의 pointerAfterSha256가 실제 raw pointer file hash와 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P169`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P170 `FINAL_RECEIPT_QUALIFICATION_SET`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 qualification set digest가 pointer map과 같다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P170`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P171 `FINAL_RECEIPT_WHOLE_BUILD_TRUE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** wholeBuildIdentityPreserved와 rollbackDrillVerified가 true이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P171`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P172 `FINAL_RECEIPT_FALLBACK_FALSE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** legacyFallbackUsed, perEncoderRollbackUsed, perKernelRollbackUsed가 false이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P172`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P173 `FINAL_RECEIPT_BLOCKERS_EMPTY`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 blockers 배열이 비어 있다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P173`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P174 `FINAL_RECEIPT_SELF_HASH`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 release receipt self-hash가 재계산과 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P174`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P175 `RELEASE_LEDGER_ORDER`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** release ledger 순서가 admit→promote→smoke→trigger→rollback→smoke→repromote→smoke→seal이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P175`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P176 `RELEASE_LEDGER_DIGEST_CHAIN`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** release ledger child digest chain이 완전하다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P176`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P177 `RELEASE_LEDGER_NO_DUPLICATE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 동일 child artifact와 transitionId의 중복이 없다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P177`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P178 `RELEASE_LEDGER_IMMUTABLE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** seal된 release ledger가 재작성되지 않는다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P178`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P179 `LOCK_RELEASED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 receipt seal 후 global lock이 제거된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P179`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P180 `MAINTENANCE_BARRIER_EXITED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 성공 후 maintenance barrier가 해제된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P180`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P181 `NEW_JOB_ADMISSION_RESTORED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 B runtime에서 신규 job admission이 정상 복구된다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P181`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P182 `CLEANUP_PENDING_ZERO`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** lock, temp pointer, trigger, pending temp receipt가 0이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P182`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P183 `POINTER_MIRRORS_FINAL_EQUAL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 pointer mirror가 canonical raw/self hash와 일치한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P183`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P184 `NO_BACKGROUND_POINTER_WRITER`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** release 종료 후 관찰 구간에 pointer generation 변화가 없다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P184`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P185 `STALE_PROMOTION_INTENT_REJECTED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** promote 이전 stale intent가 최종 pointer에 대해 CAS 실패한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P185`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P186 `STALE_ROLLBACK_INTENT_REJECTED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** rollback 이전 stale intent가 최종 pointer에 대해 CAS 실패한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P186`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P187 `CONCURRENT_WRITER_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 동시 writer 둘 중 정확히 하나만 CAS 성공한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P187`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P188 `TRUNCATED_POINTER_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 절단 pointer를 launcher가 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P188`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P189 `SELF_HASH_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 잘못된 pointer self-hash를 launcher가 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P189`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P190 `GENERATION_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** generation 감소나 동일 generation update를 writer가 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P190`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P191 `PACKAGE_MISMATCH_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 receipt와 다른 packageContentId를 admission이 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P191`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P192 `QUALIFICATION_MISMATCH_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** full-product와 R9 build/package 불일치를 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P192`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P193 `PARTIAL_ROLLBACK_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** per-worker 또는 per-kernel rollback 요청을 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P193`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P194 `SOURCE_OVERRIDE_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** source tree/env override로 package 선택을 우회하지 못한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P194`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P195 `UNAPPROVED_MUTATION_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** approval input 없이 pointer mutation을 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P195`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P196 `PENDING_JOB_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** pending job이 있는 상태의 promotion을 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P196`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P197 `LOCK_CONTENTION_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 기존 lock이 있을 때 두 번째 run을 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P197`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P198 `R9_SOURCE_ONLY_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 source receipt로 release finalizer가 실패한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P198`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P199 `R9_PENDING_NEGATIVE_CONTROL`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** R9 physical PENDING이 있는 receipt를 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P199`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P200 `BOOTSTRAP_SINGLE_CANDIDATE_REJECTED`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** active null에서 qualified candidate 하나만으로 rollback drill 완료를 거부한다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P200`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P201 `FINAL_RELEASE_STATE`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** 최종 state가 RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P201`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

## R10-P202 `RELEASE_GATE_COUNT_EXACT`

- **Class:** `RELEASE_MANDATORY`
- **Requirement:** RELEASE_MANDATORY gate count가 정확히 202이다.
- **PASS:** 동일 runId, 동일 candidate package, 동일 global pointer authority에서 생성된 실제 release evidence가 요구사항을 직접 증명한다.
- **FAIL:** admission, lock, drain, CAS, relaunch, smoke, rollback, repromotion, cleanup 또는 receipt evidence가 요구사항을 위반하거나 독립 재검증되지 않는다.
- **PENDING:** source-harness receipt에서만 허용되며 최종 release에서는 금지된다.
- **Receipt:** `R10-P202`는 observed value, relevant child artifact digest, pointer hash/generation, candidate identity와 stable error code를 기록한다.

# 25. Source-Harness Acceptance

Source-harness receipt는 다음일 때만 허용된다.

```text
SOURCE_MANDATORY count = 129
SOURCE PASS            = 129
SOURCE FAIL            = 0
RELEASE_MANDATORY      = 202
RELEASE PENDING        = 202
RELEASE PASS           = 0
Production Pointer     = unchanged
```

상태:

```text
RESAMPLE_RUNTIME_R10_PROMOTION_HARNESS_SOURCE_BAKED_AWAITING_R9_PHYSICAL_RECEIPT
```

이 상태는 pointer가 승격됐다는 뜻이 아니다. 현재 저장소처럼 R9 physical final receipt가 없고 active pointer가 null인 경우, source-harness 완료만 가능하다.

# 26. Final Release Acceptance

최종 release receipt는 다음일 때만 허용된다.

```text
SOURCE_MANDATORY count  = 129
SOURCE PASS             = 129
RELEASE_MANDATORY count = 202
RELEASE PASS            = 202
PENDING                 = 0
DEFERRED                = 0
SKIPPED                 = 0
FAIL                    = 0
blockers                = []
final active package    = candidate B
final previous package  = qualified A
rollback drill          = verified
repromotion             = verified
```

상태:

```text
RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED
```

# 27. Compact Implementation Checklist

- [ ] R9 parent bundle, spec, source receipt digest를 동결한다.
- [ ] R9 final physical receipt admission을 구현한다.
- [ ] 동일 package의 full-product admission을 구현한다.
- [ ] pointer v3 schema와 canonical self-hash를 구현한다.
- [ ] raw file hash + generation CAS를 구현한다.
- [ ] Windows atomic replace helper를 구현한다.
- [ ] global lock과 stale-lock recovery receipt를 구현한다.
- [ ] maintenance barrier와 pending job drain을 구현한다.
- [ ] promotion intent와 CAS receipt를 구현한다.
- [ ] pointer 기반 fresh relaunch를 구현한다.
- [ ] post-promotion smoke를 구현한다.
- [ ] active-null bootstrap A/B 정책을 구현한다.
- [ ] external controlled rollback trigger를 구현한다.
- [ ] whole-build rollback CAS와 previous smoke를 구현한다.
- [ ] final repromotion CAS와 final smoke를 구현한다.
- [ ] release ledger conservation을 구현한다.
- [ ] final release receipt를 봉인한다.
- [ ] legacy/per-component fallback을 사용하지 않는다.
- [ ] source-harness에서 pointer를 변경하지 않는다.

# 28. Completion Definition

R10은 다음 문장이 모두 사실일 때만 완료된다.

1. R9의 110 source gate와 187 physical gate가 모두 실제 PASS다.
2. 동일 package가 full-product whole-build admission을 통과했다.
3. Candidate package bytes는 R9 검증 이후 변하지 않았다.
4. Global pointer lock과 maintenance drain이 성공했다.
5. Promotion pointer가 raw hash와 generation CAS로 B를 활성화했다.
6. B가 pointer를 통해 fresh relaunch되어 Preview·Export smoke를 통과했다.
7. 외부 controlled failure가 rollback을 촉발했다.
8. Pointer가 whole-build A로 rollback됐다.
9. A가 fresh relaunch되어 rollback smoke를 통과했다.
10. B가 새 generation으로 다시 승격됐다.
11. B가 최종 smoke를 통과했다.
12. 최종 pointer는 B active, A previous다.
13. Partial rollback과 legacy fallback은 한 번도 사용되지 않았다.
14. Release ledger와 child digest chain이 보존됐다.
15. Lock, barrier, pending jobs, temp files가 모두 정리됐다.
16. Final release receipt가 immutable하게 봉인됐다.

하나라도 거짓이면 상태는 `RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED`가 아니다.

# 29. Final Declaration

R10은 “테스트를 통과한 코드”를 “출시된 코드”라고 부르는 마지막 경계다.

```text
R9 physical truth
    ≠ production selection

R10 production selection
    = qualified package
    + whole-build admission
    + hash/generation CAS
    + pointer-bound relaunch
    + rollback drill
    + final repromotion
    + immutable release receipt
```

현재 입력 상태에서는 R9 physical final receipt와 qualified bootstrap A/B package가 없으므로 **R10 명세와 source harness만 준비할 수 있고 실제 Production Pointer 승격은 수행할 수 없다.** 이 부족분은 추정이나 source PASS로 대체하지 않는다.

R10 이후 자동 후속 권위는 없다. 새 runtime 변경은 새로운 patch ID와 qualification chain을 시작해야 한다.
