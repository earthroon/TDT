# TDT-RESAMPLE-RUNTIME-01-R10A

## R8A·R9A Release Requalification /
## Production Candidate Rebuild /
## Production Pointer CAS Replay /
## Rollback Drill Replay /
## Downstream Receipt Lineage Restoration Seal

> 상태: 명세 rev.1
>
> 직접 근거 부모: `61_TDT_RESAMPLE_RUNTIME_01_R9A_SINGLE_SUBMIT_VALIDATION_PERFORMANCE_SOURCE_BAKED_AWAITING_PHYSICAL_GPU.zip`
>
> 부모 ZIP SHA-256: `d209eb1060f4cd8428a7b48abb4e8a2dfd7f7b46ab243ad6356b1c3a4a564ac0`
>
> R9A 명세 SHA-256: `a6bcd275e8d5df1f1a813c7b7f2ed96c851378fc1971eee430c96a5eb7a06b2d`
>
> R9A source receipt SHA-256: `a70e3b088b3fc09f3f8e039fc7965c65f1d241c9a3300a35cc11389bbbeb0ab8`
>
> 현재 Production Pointer mirror raw SHA-256: `1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8`

라벨 규약:

- `확정` — 부모 ZIP의 코드·명세·receipt에서 직접 확인됨
- `명세` — R10A가 새로 강제할 계약
- `판단불가` — packaged Windows D3D12 실행 또는 실제 release 입력 없이는 판정 불가
- `금지` — 충족 여부와 무관하게 허용하지 않는 경로

---

# 0. Executive Contract

R10A는 기존 R10 release harness를 단순 재실행하는 패치가 아니다.

R8A와 R9A가 active runtime code, command submission, validation sampling, uniform allocation과 performance identity를 변경했으므로 기존 R9·R10·R11·R12·R13 receipt는 현재 승격 근거가 아니다.

R10A의 유일한 목적은 다음 chain을 새 package identity 위에서 다시 닫는 것이다.

```text
R8A source truth
→ R9A physical final receipt
→ dual clean production rebuild
→ full-product qualification
→ qualified target and rollback package
→ Production Pointer CAS promotion
→ promoted smoke
→ whole-build rollback CAS and smoke
→ target repromotion and final smoke
→ R10A final release receipt
→ current lineage restoration receipt
```

R10A는 algorithm authority를 소유하지 않는다. R8A·R9A의 바이트와 physical evidence를 release authority에 재결합한다.

---

# 1. Parent Truth

## 1.1 R8A source truth

확정된 R8A 상태:

```text
RESAMPLE_RUNTIME_R8A_ACTIVE_RUNTIME_TRUTH_CLOSURE_SEALED_AWAITING_R9A_PHYSICAL_GPU
253 SOURCE PASS
8 PHYSICAL DEFERRED
0 FAIL
```

R8A가 보장한 source truth:

- Active Required JavaScript parse failure 0
- canonical resample executor 등록
- 실제 kernel identity 전파
- 반복 device-loss source cycle 3회
- silent fallback 0

## 1.2 R9A source truth

현재 부모 상태:

```text
RESAMPLE_RUNTIME_R9A_SINGLE_SUBMIT_VALIDATION_AND_PERFORMANCE_HARNESS_SOURCE_SEALED_AWAITING_PHYSICAL_GPU
286 SOURCE PASS
214 PHYSICAL PENDING
0 FAIL
```

확정된 source identity:

```text
canonicalJobEncoderCount = 1
canonicalJobSubmitCount = 1
exportPreMapFenceAwaitCount = 0
productionPointerMutated = false
localActivationPointerMutated = false
```

R10A release replay는 R9A source receipt만으로 시작할 수 없다. 214개 physical gate가 모두 PASS인 최종 receipt가 먼저 필요하다.

## 1.3 Current pointer

현재 두 pointer mirror는 byte-identical v2 document이며 active package는 null이다.

```text
pointerId = dadum.export.production-pointer
activeBuildId = null
activePackageContentId = null
candidateState = SOURCE_BAKED_UNPROMOTED
promotionEligible = false
raw SHA-256 = 1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8
```

따라서 현재 source bake는 pointer를 변경할 수 없다. 실제 release replay는 dual-package bootstrap 조건을 만족해야 한다.

---

# 2. Scope

R10A가 소유하는 범위:

- R8A·R9A current evidence admission
- clean production candidate rebuild
- reproducible runtime closure 확인
- target package와 rollback package의 독립 qualification
- R10 Production Pointer v3 CAS replay
- promoted·rollback·repromoted package smoke
- R10A release ledger와 final receipt
- current lineage head를 R10A까지 복원

# 3. Non-Goals

R10A는 다음을 수행하지 않는다.

- EWA 수학이나 WGSL kernel 변경
- R9A physical 결과 생성 또는 대체
- R11A installed attestation
- R12A atomic update
- R13A fleet rollout
- component·encoder·kernel 단위 rollout
- source mode pointer mutation
- operator approval 자동 생성

---

# 4. Authority Model

## 4.1 Runtime authority

```text
R8A = active runtime truth and export failure semantics
R9A = command graph, validation sampling, uniform ring, physical performance
R10A = whole-build release selection and rollback drill replay
```

## 4.2 Sole pointer authority

R10A만 release mode에서 `dadum.export.production-pointer`를 쓸 수 있다.

R10A는 v2 pointer를 읽을 수 있지만 write authority는 v3 canonical pointer뿐이다.

## 4.3 Qualification authority

Candidate는 다음 canonical qualification map을 가져야 한다.

```json
{
  "tdt.resample-runtime.r8a.source": "<sha256>",
  "tdt.resample-runtime.r9a.physical": "<sha256>",
  "tdt.export.full-product": "<sha256>",
  "tdt.build.rebuild": "<sha256>",
  "tdt.active-graph": "<sha256>",
  "tdt.javascript-parse": "<sha256>"
}
```

Historical R9·R10 receipt는 이 map에 들어갈 수 없다.

---

# 5. State Machine

```text
SOURCE_SEALED
→ AWAITING_R9A_PHYSICAL
→ R9A_PHYSICAL_ADMITTED
→ TARGET_REBUILT
→ TARGET_QUALIFIED
→ PREVIOUS_QUALIFIED
→ RELEASE_PREPARED
→ PROMOTED
→ PROMOTED_SMOKE_PASS
→ ROLLED_BACK
→ ROLLBACK_SMOKE_PASS
→ REPROMOTED
→ FINAL_SMOKE_PASS
→ RELEASE_SEALED
→ LINEAGE_RESTORED
```

실패는 단계별 rejection receipt를 만들고 pointer의 실제 상태를 기록한다. 다음 단계로 조용히 진행하지 않는다.

---

# 6. Production Candidate Rebuild

## 6.1 Build input SSOT

```ts
interface R10ARebuildInputSet {
  schemaId: "tdt.resample-runtime.rebuild-input-set.r10a.v1"
  sourceCommit: string
  sourceTreeDigest: string
  dependencyLockDigest: string
  registryInputDigest: string
  nodeVersion: string
  electronVersion: string
  chromiumVersion: string
  buildToolchainDigest: string
  target: "windows-x64"
  releaseProfileId: "full-product-v1"
  r8aSourceReceiptSha256: string
  r9aSourceReceiptSha256: string
  selfSha256: string
}
```

시간, 임시 경로, 사용자 이름, 머신 이름은 build ID 입력이 아니다.

## 6.2 Dual clean emit

동일 input set으로 완전히 분리된 두 clean emit을 만든다.

```text
emit-A/
emit-B/
```

두 emit은 최소 다음이 같아야 한다.

- executable runtime closure digest
- Active Graph digest
- Active Required JavaScript parse report
- generated WGSL manifest digest
- R8A actual kernel identity
- R9A command graph identity
- validation sampling policy identity
- uniform ring contract identity

## 6.3 Runtime closure와 signed package 분리

Code signing이나 packaging envelope가 재현 가능한 runtime closure를 흐리지 않도록 두 identity를 분리한다.

```text
runtimeClosureDigest
= normalized executable runtime file set digest

packageContentId
= final immutable package bytes SHA-256
```

R9A physical receipt는 최종 `packageContentId`와 `runtimeClosureDigest` 둘 다에 결합돼야 한다.

---

# 7. R8A Admission

R8A source receipt는 현재 source tree와 다시 대조한다.

필수 조건:

- source state exact
- 253 source PASS
- activeRequiredUnparsedCount 0
- canonicalExecutorRegistered true
- actualKernelIdentityPropagated true
- repeatedDeviceLossCyclesPassed 3
- silentFallbackCount 0
- pointer mutation false

R8A의 8개 physical deferred는 R9A final physical receipt가 package-level로 흡수해 닫아야 한다.

---

# 8. R9A Physical Final Admission

필수 최종 상태:

```text
RESAMPLE_RUNTIME_R9A_SINGLE_SUBMIT_VALIDATED_PHYSICAL_GPU_PERFORMANCE_SEALED_AWAITING_R10A
286 SOURCE PASS
214 PHYSICAL PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL
```

R10A는 다음 physical facts를 별도로 재검증한다.

- hardware D3D12
- software adapter 0
- timestamp-query
- product/reference/oracle parity
- canonical encoder 1
- canonical submit 1
- Export pre-map fence 0
- validation double dispatch 0
- uniform in-flight overwrite 0
- performance thresholds PASS
- package bytes pre/post equal

Source receipt를 physical receipt 자리에 넣으면 `E_R10A_R9A_PHYSICAL_REQUIRED`로 거부한다.

---

# 9. Qualified Package

```ts
interface R10AQualifiedPackageReceipt {
  schemaId: "tdt.resample-runtime.qualified-package.r10a.v1"
  buildId: string
  packageContentId: string
  packagePath: string
  runtimeClosureDigest: string
  releaseProfileId: "full-product-v1"
  r8aSourceReceiptSha256: string
  r9aPhysicalReceiptSha256: string
  fullProductReceiptSha256: string
  rebuildReceiptSha256: string
  activeGraphReceiptSha256: string
  parseClosureReceiptSha256: string
  qualificationSetDigest: string
  blockers: []
  selfSha256: string
}
```

Target과 rollback package는 각각 독립 qualified package receipt를 가져야 한다.

---

# 10. Bootstrap and Previous Package

## 10.1 Active pointer null

현재처럼 active package가 null이면 `BOOTSTRAP_DUAL_PACKAGE` mode를 사용한다.

```text
target package B
+ independently qualified rollback package A
```

A와 B는 packageContentId가 달라야 한다. 단순히 buildId 문자열만 바꾼 가짜 package는 허용하지 않는다.

두 package는 모두 R8A·R9A current lineage를 가져야 한다. superseded runtime으로 rollback하는 drill은 lineage restoration이 아니다.

## 10.2 Existing active pointer

active package가 이미 존재한다면 기존 active package가 current R10A qualification map을 가진 경우에만 rollback target으로 사용할 수 있다.

그렇지 않으면 별도 previous package qualification이 필요하다.

---

# 11. Operator Approval

Approval은 다음에 결합된다.

- runId
- target buildId/packageContentId
- previous buildId/packageContentId
- qualificationSetDigest
- expected pointer raw SHA-256
- expected pointer generation
- release profile

Approval을 source file이나 environment default에 내장하지 않는다.

---

# 12. Production Pointer CAS Replay

Pointer ID는 계속 다음이다.

```text
dadum.export.production-pointer
```

CAS 조건:

```text
expected raw file SHA-256 exact
+ expected generation exact
+ exclusive global release lock
+ maintenance barrier
+ process quiescence
```

Promotion, rollback, repromotion은 각각 generation을 정확히 1 증가시킨다.

```text
g → g+1 promotion
g+1 → g+2 rollback
g+2 → g+3 repromotion
```

CAS mismatch는 자동 재시도하지 않는다.

---

# 13. Relaunch and Smoke Matrix

각 CAS 이후 stable launcher는 pointer가 선택한 exact package만 실행한다.

모든 smoke에 필요한 공통 항목:

- packageContentId exact
- runtimeClosureDigest exact
- R8A actual kernel identity exact
- R9A command graph identity exact
- encoder count 1
- submit count 1
- Export pre-map fence 0
- validation counters 0
- uniform overwrite 0
- Preview smoke
- strict Export smoke
- Preview/Export identity
- alpha·border·DC
- CPU fallback false
- silent fallback 0
- pending jobs 0
- package bytes unchanged

---

# 14. Rollback Drill Replay

Rollback은 failure simulation 또는 explicit drill trigger로 시작할 수 있다. 실제 target failure를 만들 필요는 없지만 trigger receipt는 반드시 존재한다.

부분 rollback은 금지한다.

```text
renderer만 A
worker는 B
WGSL은 A
native addon은 B
```

위 조합은 전부 실패다. rollback unit은 immutable whole package 하나다.

---

# 15. Final Repromotion

Rollback smoke가 PASS한 후 target B를 새 generation으로 다시 승격한다.

최종 pointer:

```text
active = target B
previous = rollback package A
candidate = null
lastTransitionKind = REPROMOTE
```

Final smoke 전에는 release를 sealed로 선언할 수 없다.

---

# 16. Release Ledger

Ledger는 다음 transition을 append-only hash chain으로 보존한다.

```text
PROMOTE
→ ROLLBACK
→ REPROMOTE
```

각 entry는 before/after raw pointer hash, generation, intent digest, target identity, qualification digest를 포함한다.

---

# 17. Final Release Receipt

```ts
interface R10AFinalReleaseReceipt {
  schemaId: "tdt.resample-runtime.r10a.final-release.v1"
  patchId: "TDT-RESAMPLE-RUNTIME-01-R10A"
  state: "RESAMPLE_RUNTIME_R10A_RELEASE_REQUALIFIED_POINTER_CAS_AND_ROLLBACK_DRILL_SEALED"
  targetBuildId: string
  targetPackageContentId: string
  previousBuildId: string
  previousPackageContentId: string
  runtimeClosureDigest: string
  r8aSourceReceiptSha256: string
  r9aPhysicalReceiptSha256: string
  qualificationSetDigest: string
  pointerBeforeSha256: string
  pointerAfterPromotionSha256: string
  pointerAfterRollbackSha256: string
  pointerAfterRepromotionSha256: string
  rollbackDrillVerified: true
  wholeBuildIdentityPreserved: true
  legacyFallbackUsed: false
  blockers: []
  selfSha256: string
}
```

---

# 18. Downstream Receipt Lineage Restoration

R10A final release receipt가 생성된 뒤 별도의 lineage restoration receipt를 만든다.

```ts
interface R10ALineageRestorationReceipt {
  schemaId: "tdt.resample-runtime.lineage-restoration.r10a.v1"
  state: "RESAMPLE_RUNTIME_R10A_CURRENT_LINEAGE_RESTORED_AWAITING_R11A"
  lineageHead: "TDT-RESAMPLE-RUNTIME-01-R10A"
  currentReceipts: {
    r8aSource: string
    r9aSource: string
    r9aPhysical: string
    r10aRelease: string
  }
  supersededReceipts: string[]
  requiredReplay: ["TDT-RESAMPLE-RUNTIME-01-R11A", "TDT-RESAMPLE-RUNTIME-01-R12A", "TDT-RESAMPLE-RUNTIME-01-R13A"]
  productionPointerMutatedByRestoration: false
  selfSha256: string
}
```

Historical receipt는 삭제하거나 고치지 않는다. 현재 promotion evidence에서만 제외한다.

Lineage root digest의 canonical 순서:

```text
R8A source receipt SHA-256
→ R9A source receipt SHA-256
→ R9A physical final receipt SHA-256
→ R10A final release receipt SHA-256
→ target runtimeClosureDigest
→ target packageContentId
```

---

# 19. Failure Semantics

필수 stable error codes:

- `E_R10A_R9A_PHYSICAL_REQUIRED`
- `E_R10A_R9A_FINAL_STATE_MISMATCH`
- `E_R10A_R9A_PACKAGE_IDENTITY_MISMATCH`
- `E_R10A_REBUILD_INPUT_MISMATCH`
- `E_R10A_REPRODUCIBLE_CLOSURE_MISMATCH`
- `E_R10A_PACKAGE_MUTATED`
- `E_R10A_MIXED_LINEAGE_ARTIFACT`
- `E_R10A_SUPERSEDED_RECEIPT_REJECTED`
- `E_R10A_PREVIOUS_PACKAGE_REQUIRED`
- `E_R10A_PREVIOUS_PACKAGE_UNQUALIFIED`
- `E_R10A_BOOTSTRAP_PACKAGE_NOT_DISTINCT`
- `E_R10A_QUALIFICATION_SET_MISMATCH`
- `E_R10A_OPERATOR_APPROVAL_MISMATCH`
- `E_R10A_POINTER_CAS_MISMATCH`
- `E_R10A_POINTER_GENERATION_MISMATCH`
- `E_R10A_POINTER_MIRROR_MISMATCH`
- `E_R10A_PARTIAL_ROLLBACK_FORBIDDEN`
- `E_R10A_PROMOTED_SMOKE_FAILED`
- `E_R10A_ROLLBACK_SMOKE_FAILED`
- `E_R10A_FINAL_SMOKE_FAILED`
- `E_R10A_RELEASE_RECEIPT_INCOMPLETE`
- `E_R10A_LINEAGE_RESTORATION_INCOMPLETE`
- `E_R10A_SOURCE_CANNOT_PROMOTE`

---

# 20. Required Implementation Layout

```text
tools/resample-runtime-01-r10a/
  identity.mjs
  canonical-json.mjs
  verify-parent-lineage.mjs
  rebuild-input-set.mjs
  run-clean-rebuild.mjs
  verify-reproducible-closure.mjs
  admit-r8a.mjs
  admit-r9a-physical.mjs
  admit-full-product.mjs
  qualify-package.mjs
  qualify-previous-package.mjs
  create-qualification-set.mjs
  admit-operator-approval.mjs
  pointer-reader.mjs
  pointer-writer.mjs
  create-promotion-intent.mjs
  promote-cas.mjs
  run-promoted-smoke.mjs
  create-rollback-trigger.mjs
  create-rollback-intent.mjs
  rollback-cas.mjs
  run-rollback-smoke.mjs
  create-repromotion-intent.mjs
  repromote-cas.mjs
  run-final-smoke.mjs
  finalize-release.mjs
  restore-lineage.mjs
  reject-release.mjs
  gate-source.mjs
  gate-release.mjs
  verify-source.mjs
  verify-release.mjs
  schemas/
  windows/run-release.ps1
```

---

# 21. Required Commands

```bash
npm run verify:resample-runtime-01-r10a
npm run rebuild:resample-runtime-01-r10a
npm run admit:resample-runtime-01-r10a
npm run promote:resample-runtime-01-r10a
npm run drill:resample-runtime-01-r10a
npm run finalize:resample-runtime-01-r10a
npm run restore-lineage:resample-runtime-01-r10a
npm run verify:resample-runtime-01-r10a:release
npm run reject:resample-runtime-01-r10a
```

Source command는 release input이 없어도 260 source gate를 검증하지만 pointer를 쓰지 않는다.

---

# 22. Gate Semantics

- `SOURCE_MANDATORY`: 코드·스키마·상태기계·negative control·parent freeze를 검증한다.
- `RELEASE_MANDATORY`: 실제 packaged R9A physical receipt, rebuild, pointer CAS와 drill evidence를 검증한다.
- Source bake에서 release gate를 PASS로 만들 수 없다.
- Final release는 모든 560 gate가 PASS이고 PENDING·DEFERRED·SKIPPED·FAIL이 0일 때만 허용한다.

---

# 23. SOURCE_MANDATORY Gate Catalog

## 23.1 PARENT_AND_LINEAGE

| Gate | Requirement |
|---|---|
| `R10A-S001` | `PARENT_ZIP_SHA256_FROZEN` — Parent zip SHA-256 frozen |
| `R10A-S002` | `PARENT_SPEC_SHA256_FROZEN` — Parent spec SHA-256 frozen |
| `R10A-S003` | `PARENT_SOURCE_RECEIPT_SHA256_FROZEN` — Parent source receipt SHA-256 frozen |
| `R10A-S004` | `PARENT_SOURCE_STATE_EXACT` — Parent source state exact |
| `R10A-S005` | `PARENT_SOURCE_COUNTS_EXACT` — Parent source counts exact |
| `R10A-S006` | `PARENT_NEXT_AUTHORITY_R10A` — Parent next authority R10A |
| `R10A-S007` | `R8A_SPEC_SHA256_FROZEN` — R8A spec SHA-256 frozen |
| `R10A-S008` | `R8A_SOURCE_RECEIPT_SHA256_FROZEN` — R8A source receipt SHA-256 frozen |
| `R10A-S009` | `R8A_SOURCE_STATE_EXACT` — R8A source state exact |
| `R10A-S010` | `R8A_ACTIVE_REQUIRED_PARSE_ZERO` — R8A active required parse zero |
| `R10A-S011` | `R8A_EXECUTOR_REGISTERED` — R8A executor registered |
| `R10A-S012` | `R8A_KERNEL_IDENTITY_PROPAGATED` — R8A kernel identity propagated |
| `R10A-S013` | `R8A_REPEATED_DEVICE_LOSS_THREE` — R8A repeated device loss three |
| `R10A-S014` | `R8A_SILENT_FALLBACK_ZERO` — R8A silent fallback zero |
| `R10A-S015` | `R8A_POINTER_MUTATION_FALSE` — R8A pointer mutation false |
| `R10A-S016` | `R9A_DOWNSTREAM_INVALIDATION_PRESENT` — R9A downstream invalidation present |
| `R10A-S017` | `R8A_DOWNSTREAM_INVALIDATION_PRESENT` — R8A downstream invalidation present |
| `R10A-S018` | `HISTORICAL_R9_RECEIPT_READ_ONLY` — Historical r9 receipt read only |
| `R10A-S019` | `HISTORICAL_R10_RECEIPT_READ_ONLY` — Historical r10 receipt read only |
| `R10A-S020` | `HISTORICAL_R11_RECEIPT_READ_ONLY` — Historical r11 receipt read only |
| `R10A-S021` | `HISTORICAL_R12_RECEIPT_READ_ONLY` — Historical r12 receipt read only |
| `R10A-S022` | `HISTORICAL_R13_RECEIPT_READ_ONLY` — Historical r13 receipt read only |
| `R10A-S023` | `SUPERSEDED_RECEIPT_CARRY_FORWARD_ZERO` — Superseded receipt carry forward zero |
| `R10A-S024` | `REPLAY_ORDER_R10A_R11A_R12A_R13A` — Replay order R10A R11A R12A R13A |
| `R10A-S025` | `CURRENT_POINTER_RAW_SHA_FROZEN` — Current pointer raw sha frozen |
| `R10A-S026` | `POINTER_MIRRORS_EQUAL_SOURCE` — Pointer mirrors equal source |
| `R10A-S027` | `CURRENT_POINTER_SOURCE_UNCHANGED` — Current pointer source unchanged |
| `R10A-S028` | `LINEAGE_ROOT_INPUT_ORDER_DECLARED` — Lineage root input order declared |

## 23.2 AUTHORITY_AND_STATE

| Gate | Requirement |
|---|---|
| `R10A-S029` | `PATCH_ID_EXACT` — Patch ID exact |
| `R10A-S030` | `R10A_SOLE_RELEASE_REPLAY_AUTHORITY` — R10A sole release replay authority |
| `R10A-S031` | `R10_HISTORICAL_AUTHORITY_RETIRED` — R10 historical authority retired |
| `R10A-S032` | `R8A_RUNTIME_AUTHORITY_PRESERVED` — R8A runtime authority preserved |
| `R10A-S033` | `R9A_PHYSICAL_AUTHORITY_PRESERVED` — R9A physical authority preserved |
| `R10A-S034` | `FULL_PRODUCT_AUTHORITY_PRESERVED` — Full product authority preserved |
| `R10A-S035` | `PRODUCTION_POINTER_IDENTITY_PRESERVED` — Production pointer identity preserved |
| `R10A-S036` | `WHOLE_BUILD_POINTER_ONLY` — Whole build pointer only |
| `R10A-S037` | `NO_COMPONENT_POINTER` — No component pointer |
| `R10A-S038` | `NO_KERNEL_POINTER` — No kernel pointer |
| `R10A-S039` | `NO_ENCODER_POINTER` — No encoder pointer |
| `R10A-S040` | `NO_REMOTE_POINTER_MUTATION` — No remote pointer mutation |
| `R10A-S041` | `NO_SOURCE_MODE_POINTER_MUTATION` — No source mode pointer mutation |
| `R10A-S042` | `NO_LOCAL_ACTIVATION_POINTER_MUTATION` — No local activation pointer mutation |
| `R10A-S043` | `SOURCE_STATE_DECLARED` — Source state declared |
| `R10A-S044` | `FINAL_RELEASE_STATE_DECLARED` — Final release state declared |
| `R10A-S045` | `FINAL_LINEAGE_STATE_DECLARED` — Final lineage state declared |
| `R10A-S046` | `REJECTED_STATE_DECLARED` — Rejected state declared |
| `R10A-S047` | `STATE_TRANSITIONS_MONOTONIC` — State transitions monotonic |
| `R10A-S048` | `STATE_SKIP_FORBIDDEN` — State skip forbidden |
| `R10A-S049` | `STATE_REGRESSION_FORBIDDEN` — State regression forbidden |
| `R10A-S050` | `NEXT_AUTHORITY_R11A_DECLARED` — Next authority R11A declared |

## 23.3 SCHEMAS_AND_RECEIPTS

| Gate | Requirement |
|---|---|
| `R10A-S051` | `REBUILD_INPUT_SET_SCHEMA` — Rebuild input set schema |
| `R10A-S052` | `CLEAN_EMIT_RECEIPT_SCHEMA` — Clean emit receipt schema |
| `R10A-S053` | `RUNTIME_CLOSURE_MANIFEST_SCHEMA` — Runtime closure manifest schema |
| `R10A-S054` | `SIGNED_PACKAGE_MANIFEST_SCHEMA` — Signed package manifest schema |
| `R10A-S055` | `PACKAGE_REBUILD_RECEIPT_SCHEMA` — Package rebuild receipt schema |
| `R10A-S056` | `R8A_ADMISSION_RECEIPT_SCHEMA` — R8A admission receipt schema |
| `R10A-S057` | `R9A_PHYSICAL_ADMISSION_RECEIPT_SCHEMA` — R9A physical admission receipt schema |
| `R10A-S058` | `FULL_PRODUCT_ADMISSION_RECEIPT_SCHEMA` — Full product admission receipt schema |
| `R10A-S059` | `QUALIFIED_PACKAGE_RECEIPT_SCHEMA` — Qualified package receipt schema |
| `R10A-S060` | `QUALIFICATION_SET_SCHEMA` — Qualification set schema |
| `R10A-S061` | `OPERATOR_APPROVAL_SCHEMA` — Operator approval schema |
| `R10A-S062` | `TRANSITION_INTENT_SCHEMA` — Transition intent schema |
| `R10A-S063` | `PROMOTION_CAS_RECEIPT_SCHEMA` — Promotion CAS receipt schema |
| `R10A-S064` | `ROLLBACK_CAS_RECEIPT_SCHEMA` — Rollback CAS receipt schema |
| `R10A-S065` | `REPROMOTION_CAS_RECEIPT_SCHEMA` — Repromotion CAS receipt schema |
| `R10A-S066` | `RELAUNCH_RECEIPT_SCHEMA` — Relaunch receipt schema |
| `R10A-S067` | `PROMOTED_SMOKE_RECEIPT_SCHEMA` — Promoted smoke receipt schema |
| `R10A-S068` | `ROLLBACK_SMOKE_RECEIPT_SCHEMA` — Rollback smoke receipt schema |
| `R10A-S069` | `FINAL_SMOKE_RECEIPT_SCHEMA` — Final smoke receipt schema |
| `R10A-S070` | `RELEASE_LEDGER_SCHEMA` — Release ledger schema |
| `R10A-S071` | `FINAL_RELEASE_RECEIPT_SCHEMA` — Final release receipt schema |
| `R10A-S072` | `LINEAGE_RESTORATION_RECEIPT_SCHEMA` — Lineage restoration receipt schema |
| `R10A-S073` | `REJECTION_RECEIPT_SCHEMA` — Rejection receipt schema |
| `R10A-S074` | `RUN_LOCK_SCHEMA` — Run lock schema |
| `R10A-S075` | `MAINTENANCE_BARRIER_SCHEMA` — Maintenance barrier schema |
| `R10A-S076` | `CHILD_DIGEST_MANIFEST_SCHEMA` — Child digest manifest schema |
| `R10A-S077` | `CANONICAL_JSON_REQUIRED` — Canonical JSON required |
| `R10A-S078` | `SELF_HASH_EXCLUSION_RULE` — Self hash exclusion rule |
| `R10A-S079` | `RECEIPT_NO_CIRCULAR_HASH` — Receipt no circular hash |
| `R10A-S080` | `RECEIPT_IMMUTABLE_AFTER_SEAL` — Receipt immutable after seal |
| `R10A-S081` | `VOLATILE_FIELD_EXCLUSION_POLICY` — Volatile field exclusion policy |
| `R10A-S082` | `ATOMIC_RECEIPT_WRITE` — Atomic receipt write |

## 23.4 CANDIDATE_REBUILD_CONTRACT

| Gate | Requirement |
|---|---|
| `R10A-S083` | `CLEAN_WORKTREE_REQUIRED` — Clean worktree required |
| `R10A-S084` | `DEPENDENCY_LOCK_FROZEN` — Dependency lock frozen |
| `R10A-S085` | `REGISTRY_INPUT_IDENTITY_FROZEN` — Registry input identity frozen |
| `R10A-S086` | `BUILD_TOOLCHAIN_IDENTITY_FROZEN` — Build toolchain identity frozen |
| `R10A-S087` | `NODE_ELECTRON_CHROMIUM_VERSIONS_BOUND` — Node electron chromium versions bound |
| `R10A-S088` | `WINDOWS_X64_TARGET_BOUND` — Windows x64 target bound |
| `R10A-S089` | `RELEASE_PROFILE_FULL_PRODUCT` — Release profile full product |
| `R10A-S090` | `NETWORK_DISABLED_DURING_BUILD` — Network disabled during build |
| `R10A-S091` | `SOURCE_DATE_EPOCH_POLICY_DECLARED` — Source date epoch policy declared |
| `R10A-S092` | `NONDETERMINISTIC_BUILD_INPUT_FORBIDDEN` — Nondeterministic build input forbidden |
| `R10A-S093` | `DUAL_CLEAN_EMIT_REQUIRED` — Dual clean emit required |
| `R10A-S094` | `EMIT_A_ISOLATED_DIRECTORY` — Emit a isolated directory |
| `R10A-S095` | `EMIT_B_ISOLATED_DIRECTORY` — Emit b isolated directory |
| `R10A-S096` | `EMIT_INPUT_DIGEST_EQUAL` — Emit input digest equal |
| `R10A-S097` | `UNSIGNED_RUNTIME_CLOSURE_DIGEST_EQUAL` — Unsigned runtime closure digest equal |
| `R10A-S098` | `ACTIVE_GRAPH_DIGEST_EQUAL` — Active graph digest equal |
| `R10A-S099` | `ACTIVE_REQUIRED_PARSE_REPORT_EQUAL` — Active required parse report equal |
| `R10A-S100` | `GENERATED_WGSL_MANIFEST_EQUAL` — Generated WGSL manifest equal |
| `R10A-S101` | `R8A_KERNEL_IDENTITY_EQUAL` — R8A kernel identity equal |
| `R10A-S102` | `R9A_COMMAND_GRAPH_IDENTITY_EQUAL` — R9A command graph identity equal |
| `R10A-S103` | `R9A_SAMPLING_POLICY_EQUAL` — R9A sampling policy equal |
| `R10A-S104` | `R9A_UNIFORM_RING_CONTRACT_EQUAL` — R9A uniform ring contract equal |
| `R10A-S105` | `PACKAGE_ASSEMBLY_FROM_VERIFIED_EMIT_ONLY` — Package assembly from verified emit only |
| `R10A-S106` | `PACKAGE_SOURCE_TREE_EXCLUDED` — Package source tree excluded |
| `R10A-S107` | `PACKAGE_DEV_SERVER_EXCLUDED` — Package dev server excluded |
| `R10A-S108` | `PACKAGE_DEBUG_OVERRIDE_EXCLUDED` — Package debug override excluded |
| `R10A-S109` | `PACKAGE_EXECUTABLE_CLOSURE_COMPLETE` — Package executable closure complete |
| `R10A-S110` | `PACKAGE_EXTRA_EXECUTABLE_ZERO` — Package extra executable zero |
| `R10A-S111` | `PACKAGE_PATH_COLLISION_ZERO` — Package path collision zero |
| `R10A-S112` | `PACKAGE_SYMLINK_REPARSE_ZERO` — Package symlink reparse zero |
| `R10A-S113` | `PACKAGE_CONTENT_ID_SHA256` — Package content ID SHA-256 |
| `R10A-S114` | `PACKAGE_POST_BUILD_REHASH_REQUIRED` — Package post build rehash required |
| `R10A-S115` | `PACKAGE_READ_ONLY_AFTER_QUALIFICATION` — Package read only after qualification |
| `R10A-S116` | `BUILD_ID_CANONICAL_INPUT_DERIVED` — Build ID canonical input derived |
| `R10A-S117` | `BUILD_ID_WALL_CLOCK_INDEPENDENT` — Build ID wall clock independent |
| `R10A-S118` | `RUNTIME_CLOSURE_DIGEST_BOUND_TO_PACKAGE` — Runtime closure digest bound to package |

## 23.5 QUALIFICATION_AND_IDENTITY

| Gate | Requirement |
|---|---|
| `R10A-S119` | `R8A_SOURCE_RECEIPT_CURRENT` — R8A source receipt current |
| `R10A-S120` | `R8A_SOURCE_RECEIPT_REHASHED` — R8A source receipt rehashed |
| `R10A-S121` | `R8A_RECEIPT_PACKAGE_EXPECTATION_BOUND` — R8A receipt package expectation bound |
| `R10A-S122` | `R9A_PHYSICAL_FINAL_REQUIRED` — R9A physical final required |
| `R10A-S123` | `R9A_FINAL_STATE_EXACT_RULE` — R9A final state exact rule |
| `R10A-S124` | `R9A_FINAL_COUNTS_500_PASS_RULE` — R9A final counts 500 pass rule |
| `R10A-S125` | `R9A_SOURCE_PASS_286_RULE` — R9A source pass 286 rule |
| `R10A-S126` | `R9A_PHYSICAL_PASS_214_RULE` — R9A physical pass 214 rule |
| `R10A-S127` | `R9A_PENDING_ZERO_RULE` — R9A pending zero rule |
| `R10A-S128` | `R9A_DEFERRED_ZERO_RULE` — R9A deferred zero rule |
| `R10A-S129` | `R9A_SKIPPED_ZERO_RULE` — R9A skipped zero rule |
| `R10A-S130` | `R9A_FAIL_ZERO_RULE` — R9A fail zero rule |
| `R10A-S131` | `R9A_PACKAGE_IDENTITY_REQUIRED` — R9A package identity required |
| `R10A-S132` | `R9A_PACKAGE_PRE_POST_HASH_EQUAL` — R9A package pre post hash equal |
| `R10A-S133` | `R9A_RUNTIME_CLOSURE_DIGEST_REQUIRED` — R9A runtime closure digest required |
| `R10A-S134` | `R9A_SINGLE_ENCODER_ONE_RULE` — R9A single encoder one rule |
| `R10A-S135` | `R9A_SINGLE_SUBMIT_ONE_RULE` — R9A single submit one rule |
| `R10A-S136` | `R9A_EXPORT_PREMAP_FENCE_ZERO_RULE` — R9A export premap fence zero rule |
| `R10A-S137` | `R9A_VALIDATION_DOUBLE_DISPATCH_ZERO_RULE` — R9A validation double dispatch zero rule |
| `R10A-S138` | `R9A_UNIFORM_OVERWRITE_ZERO_RULE` — R9A uniform overwrite zero rule |
| `R10A-S139` | `R9A_PERFORMANCE_THRESHOLDS_PASS_RULE` — R9A performance thresholds pass rule |
| `R10A-S140` | `FULL_PRODUCT_RECEIPT_REQUIRED` — Full product receipt required |
| `R10A-S141` | `FULL_PRODUCT_BLOCKERS_EMPTY_RULE` — Full product blockers empty rule |
| `R10A-S142` | `FULL_PRODUCT_PACKAGE_ID_EQUAL_RULE` — Full product package ID equal rule |
| `R10A-S143` | `FULL_PRODUCT_BUILD_ID_EQUAL_RULE` — Full product build ID equal rule |
| `R10A-S144` | `FULL_PRODUCT_RUNTIME_CLOSURE_EQUAL_RULE` — Full product runtime closure equal rule |
| `R10A-S145` | `ACTIVE_GRAPH_RECEIPT_CURRENT` — Active graph receipt current |
| `R10A-S146` | `JAVASCRIPT_PARSE_RECEIPT_CURRENT` — Javascript parse receipt current |
| `R10A-S147` | `QUALIFICATION_MAP_CANONICAL_KEYS` — Qualification map canonical keys |
| `R10A-S148` | `QUALIFICATION_SET_DIGEST_CANONICAL` — Qualification set digest canonical |
| `R10A-S149` | `QUALIFICATION_INPUTS_SAME_PACKAGE` — Qualification inputs same package |
| `R10A-S150` | `MIXED_LINEAGE_ARTIFACT_ZERO` — Mixed lineage artifact zero |
| `R10A-S151` | `SUPERSEDED_R9_RECEIPT_REJECTED` — Superseded r9 receipt rejected |
| `R10A-S152` | `SUPERSEDED_R10_RECEIPT_REJECTED` — Superseded r10 receipt rejected |

## 23.6 POINTER_CAS_REPLAY

| Gate | Requirement |
|---|---|
| `R10A-S153` | `POINTER_V2_READ_COMPATIBILITY` — Pointer v2 read compatibility |
| `R10A-S154` | `POINTER_V3_WRITE_AUTHORITY` — Pointer v3 write authority |
| `R10A-S155` | `POINTER_SCHEMA_DOWNGRADE_FORBIDDEN` — Pointer schema downgrade forbidden |
| `R10A-S156` | `POINTER_UNKNOWN_FIELD_FAIL_CLOSED` — Pointer unknown field fail closed |
| `R10A-S157` | `POINTER_CANONICAL_JSON` — Pointer canonical JSON |
| `R10A-S158` | `POINTER_SELF_HASH_VALID` — Pointer self hash valid |
| `R10A-S159` | `POINTER_RAW_HASH_RECORDED` — Pointer raw hash recorded |
| `R10A-S160` | `POINTER_GENERATION_U64` — Pointer generation u64 |
| `R10A-S161` | `POINTER_MIRRORS_EQUAL` — Pointer mirrors equal |
| `R10A-S162` | `POINTER_MIRROR_ATOMICITY` — Pointer mirror atomicity |
| `R10A-S163` | `POINTER_SAME_VOLUME_TEMP` — Pointer same volume temp |
| `R10A-S164` | `POINTER_FILE_FLUSH` — Pointer file flush |
| `R10A-S165` | `POINTER_READBACK_VERIFY` — Pointer readback verify |
| `R10A-S166` | `POINTER_EXPECTED_HASH_REQUIRED` — Pointer expected hash required |
| `R10A-S167` | `POINTER_EXPECTED_GENERATION_REQUIRED` — Pointer expected generation required |
| `R10A-S168` | `CAS_HASH_AND_GENERATION_MATCH` — CAS hash and generation match |
| `R10A-S169` | `CAS_MISMATCH_NO_RETRY` — CAS mismatch no retry |
| `R10A-S170` | `CAS_ABA_PREVENTION` — CAS aba prevention |
| `R10A-S171` | `CAS_SINGLE_WRITER_LOCK` — CAS single writer lock |
| `R10A-S172` | `CAS_PARTIAL_WRITE_NEGATIVE_CONTROL` — CAS partial write negative control |
| `R10A-S173` | `PROMOTION_INTENT_TARGET_BOUND` — Promotion intent target bound |
| `R10A-S174` | `PROMOTION_INTENT_PREVIOUS_BOUND` — Promotion intent previous bound |
| `R10A-S175` | `PROMOTION_INTENT_QUALIFICATION_SET_BOUND` — Promotion intent qualification set bound |
| `R10A-S176` | `PROMOTION_INTENT_APPROVAL_BOUND` — Promotion intent approval bound |
| `R10A-S177` | `ROLLBACK_INTENT_PREVIOUS_EXACT_RULE` — Rollback intent previous exact rule |
| `R10A-S178` | `REPROMOTION_INTENT_TARGET_EXACT_RULE` — Repromotion intent target exact rule |
| `R10A-S179` | `TRANSITION_ID_192_BIT` — Transition ID 192 bit |
| `R10A-S180` | `TRANSITION_KIND_ENUM` — Transition kind enum |
| `R10A-S181` | `GENERATION_INCREMENT_EXACT_ONE` — Generation increment exact one |
| `R10A-S182` | `ACTIVE_QUALIFICATION_MAP_WRITTEN` — Active qualification map written |
| `R10A-S183` | `PREVIOUS_QUALIFICATION_MAP_WRITTEN` — Previous qualification map written |
| `R10A-S184` | `CANDIDATE_FIELDS_CLEARED` — Candidate fields cleared |
| `R10A-S185` | `ROLLBACK_UNIT_WHOLE_BUILD_ONLY` — Rollback unit whole build only |
| `R10A-S186` | `LEGACY_FALLBACK_FALSE` — Legacy fallback false |
| `R10A-S187` | `PER_ENCODER_ROLLBACK_FALSE` — Per encoder rollback false |
| `R10A-S188` | `PER_KERNEL_ROLLBACK_FALSE` — Per kernel rollback false |
| `R10A-S189` | `SOURCE_POINTER_RAW_BYTES_UNCHANGED` — Source pointer raw bytes unchanged |
| `R10A-S190` | `SOURCE_POINTER_GENERATION_UNCHANGED` — Source pointer generation unchanged |

## 23.7 SMOKE_AND_ROLLBACK_REPLAY

| Gate | Requirement |
|---|---|
| `R10A-S191` | `STABLE_LAUNCHER_REQUIRED` — Stable launcher required |
| `R10A-S192` | `LAUNCHED_PACKAGE_IDENTITY_EXACT` — Launched package identity exact |
| `R10A-S193` | `LAUNCHED_RUNTIME_CLOSURE_EXACT` — Launched runtime closure exact |
| `R10A-S194` | `SOURCE_TREE_INACCESSIBLE_AT_RUNTIME` — Source tree inaccessible at runtime |
| `R10A-S195` | `NETWORK_DISABLED_DURING_SMOKE` — Network disabled during smoke |
| `R10A-S196` | `PROMOTED_PREVIEW_SMOKE_REQUIRED` — Promoted preview smoke required |
| `R10A-S197` | `PROMOTED_STRICT_EXPORT_SMOKE_REQUIRED` — Promoted strict export smoke required |
| `R10A-S198` | `PROMOTED_R8A_KERNEL_IDENTITY_EXACT_RULE` — Promoted R8A kernel identity exact rule |
| `R10A-S199` | `PROMOTED_R9A_SINGLE_SUBMIT_EXACT` — Promoted R9A single submit exact |
| `R10A-S200` | `PROMOTED_VALIDATION_COUNTER_ZERO_RULE` — Promoted validation counter zero rule |
| `R10A-S201` | `PROMOTED_SILENT_FALLBACK_ZERO_RULE` — Promoted silent fallback zero rule |
| `R10A-S202` | `PROMOTED_PENDING_JOB_ZERO_RULE` — Promoted pending job zero rule |
| `R10A-S203` | `ROLLBACK_TRIGGER_EVIDENCE_BOUND_RULE` — Rollback trigger evidence bound rule |
| `R10A-S204` | `ROLLBACK_TARGET_QUALIFIED` — Rollback target qualified |
| `R10A-S205` | `ROLLBACK_PACKAGE_DISTINCT` — Rollback package distinct |
| `R10A-S206` | `ROLLBACK_PREVIEW_SMOKE_REQUIRED` — Rollback preview smoke required |
| `R10A-S207` | `ROLLBACK_STRICT_EXPORT_SMOKE_REQUIRED` — Rollback strict export smoke required |
| `R10A-S208` | `ROLLBACK_RUNTIME_IDENTITY_EXACT` — Rollback runtime identity exact |
| `R10A-S209` | `ROLLBACK_PENDING_JOB_ZERO_RULE` — Rollback pending job zero rule |
| `R10A-S210` | `REPROMOTION_REQUIRED` — Repromotion required |
| `R10A-S211` | `REPROMOTION_TARGET_EXACT` — Repromotion target exact |
| `R10A-S212` | `FINAL_PREVIEW_SMOKE_REQUIRED` — Final preview smoke required |
| `R10A-S213` | `FINAL_STRICT_EXPORT_SMOKE_REQUIRED` — Final strict export smoke required |
| `R10A-S214` | `FINAL_R8A_R9A_IDENTITY_EXACT` — Final R8A R9A identity exact |
| `R10A-S215` | `FINAL_POINTER_TARGET_ACTIVE_RULE` — Final pointer target active rule |
| `R10A-S216` | `FINAL_POINTER_PREVIOUS_RECORDED_RULE` — Final pointer previous recorded rule |
| `R10A-S217` | `FINAL_PENDING_JOB_ZERO_RULE` — Final pending job zero rule |
| `R10A-S218` | `FINAL_PACKAGE_POST_HASH_EQUAL` — Final package post hash equal |

## 23.8 LINEAGE_RESTORATION

| Gate | Requirement |
|---|---|
| `R10A-S219` | `LINEAGE_SCHEMA_ID_EXACT` — Lineage schema ID exact |
| `R10A-S220` | `LINEAGE_HEAD_R10A` — Lineage head R10A |
| `R10A-S221` | `LINEAGE_ROOT_DIGEST_CANONICAL` — Lineage root digest canonical |
| `R10A-S222` | `LINEAGE_ORDER_R8A_R9A_R10A` — Lineage order R8A R9A R10A |
| `R10A-S223` | `R8A_SOURCE_RECEIPT_CURRENT_MARKER` — R8A source receipt current marker |
| `R10A-S224` | `R9A_SOURCE_RECEIPT_CURRENT_MARKER` — R9A source receipt current marker |
| `R10A-S225` | `R9A_PHYSICAL_RECEIPT_CURRENT_MARKER` — R9A physical receipt current marker |
| `R10A-S226` | `R10A_RELEASE_RECEIPT_CURRENT_MARKER` — R10A release receipt current marker |
| `R10A-S227` | `R9_HISTORICAL_MARKER_SUPERSEDED` — R9 historical marker superseded |
| `R10A-S228` | `R10_HISTORICAL_MARKER_SUPERSEDED` — R10 historical marker superseded |
| `R10A-S229` | `R11_HISTORICAL_MARKER_SUPERSEDED` — R11 historical marker superseded |
| `R10A-S230` | `R12_HISTORICAL_MARKER_SUPERSEDED` — R12 historical marker superseded |
| `R10A-S231` | `R13_HISTORICAL_MARKER_SUPERSEDED` — R13 historical marker superseded |
| `R10A-S232` | `R11A_STATUS_REQUIRED_NOT_CURRENT` — R11A status required not current |
| `R10A-S233` | `R12A_STATUS_REQUIRED_NOT_CURRENT` — R12A status required not current |
| `R10A-S234` | `R13A_STATUS_REQUIRED_NOT_CURRENT` — R13A status required not current |
| `R10A-S235` | `CURRENT_PROMOTION_EVIDENCE_NO_OLD_RECEIPT` — Current promotion evidence no old receipt |
| `R10A-S236` | `HISTORICAL_RECEIPTS_NOT_DELETED` — Historical receipts not deleted |
| `R10A-S237` | `HISTORICAL_RECEIPTS_BYTE_IMMUTABLE` — Historical receipts byte immutable |
| `R10A-S238` | `LINEAGE_CHILD_DIGESTS_RECOMPUTED` — Lineage child digests recomputed |
| `R10A-S239` | `LINEAGE_RECEIPT_FINAL_WRITER_SINGLE` — Lineage receipt final writer single |
| `R10A-S240` | `LINEAGE_RESTORATION_AFTER_RELEASE_SEAL` — Lineage restoration after release seal |
| `R10A-S241` | `LINEAGE_NO_POINTER_MUTATION` — Lineage no pointer mutation |
| `R10A-S242` | `NEXT_REPLAY_ORDER_R11A_R12A_R13A` — Next replay order R11A R12A R13A |

## 23.9 COMMANDS_ERRORS_NEGATIVE_AND_FINAL

| Gate | Requirement |
|---|---|
| `R10A-S243` | `SOURCE_VERIFY_COMMAND_DECLARED` — Source verify command declared |
| `R10A-S244` | `REBUILD_COMMAND_DECLARED` — Rebuild command declared |
| `R10A-S245` | `ADMIT_COMMAND_DECLARED` — Admit command declared |
| `R10A-S246` | `PROMOTE_COMMAND_DECLARED` — Promote command declared |
| `R10A-S247` | `ROLLBACK_DRILL_COMMAND_DECLARED` — Rollback drill command declared |
| `R10A-S248` | `FINALIZE_COMMAND_DECLARED` — Finalize command declared |
| `R10A-S249` | `REJECT_COMMAND_DECLARED` — Reject command declared |
| `R10A-S250` | `PREDECESSOR_REGRESSION_COMMAND_DECLARED` — Predecessor regression command declared |
| `R10A-S251` | `WINDOWS_RELEASE_ENTRYPOINT_DECLARED` — Windows release entrypoint declared |
| `R10A-S252` | `STABLE_ERROR_CODE_REGISTRY` — Stable error code registry |
| `R10A-S253` | `NEGATIVE_CONTROL_MANIFEST_DECLARED` — Negative control manifest declared |
| `R10A-S254` | `ACTIVE_GRAPH_ADMISSION_REQUIRED` — Active graph admission required |
| `R10A-S255` | `ACTIVE_REQUIRED_PARSE_CLOSURE_REQUIRED` — Active required parse closure required |
| `R10A-S256` | `R8_R9A_BEHAVIORAL_REGRESSION_REQUIRED` — R8 R9A behavioral regression required |
| `R10A-S257` | `OUTPUT_DIRECTORY_EMPTY_GUARD` — Output directory empty guard |
| `R10A-S258` | `RUN_ID_UNIQUE_REQUIRED` — Run ID unique required |
| `R10A-S259` | `SOURCE_GATE_COUNT_260_EXACT` — Source gate count 260 exact |
| `R10A-S260` | `RELEASE_GATE_COUNT_300_DECLARED` — Release gate count 300 declared |

---

# 24. RELEASE_MANDATORY Gate Catalog

## 24.1 R9A_PHYSICAL_ADMISSION

| Gate | Requirement |
|---|---|
| `R10A-P001` | `R9A_PHYSICAL_RECEIPT_PRESENT` — R9A physical receipt present |
| `R10A-P002` | `R9A_PHYSICAL_RECEIPT_SCHEMA_VALID` — R9A physical receipt schema valid |
| `R10A-P003` | `R9A_PHYSICAL_RECEIPT_SELF_HASH_VALID` — R9A physical receipt self hash valid |
| `R10A-P004` | `R9A_FINAL_STATE_EXACT` — R9A final state exact |
| `R10A-P005` | `R9A_TOTAL_PASS_500` — R9A total pass 500 |
| `R10A-P006` | `R9A_SOURCE_PASS_286` — R9A source pass 286 |
| `R10A-P007` | `R9A_PHYSICAL_PASS_214` — R9A physical pass 214 |
| `R10A-P008` | `R9A_PENDING_ZERO` — R9A pending zero |
| `R10A-P009` | `R9A_DEFERRED_ZERO` — R9A deferred zero |
| `R10A-P010` | `R9A_SKIPPED_ZERO` — R9A skipped zero |
| `R10A-P011` | `R9A_FAIL_ZERO` — R9A fail zero |
| `R10A-P012` | `R9A_PRODUCTION_POINTER_MUTATION_FALSE` — R9A production pointer mutation false |
| `R10A-P013` | `R9A_LOCAL_POINTER_MUTATION_FALSE` — R9A local pointer mutation false |
| `R10A-P014` | `R9A_BUILD_ID_PRESENT` — R9A build ID present |
| `R10A-P015` | `R9A_PACKAGE_CONTENT_ID_PRESENT` — R9A package content ID present |
| `R10A-P016` | `R9A_PACKAGE_PATH_PRESENT` — R9A package path present |
| `R10A-P017` | `R9A_PACKAGE_EXISTS` — R9A package exists |
| `R10A-P018` | `R9A_PACKAGE_READ_ONLY` — R9A package read only |
| `R10A-P019` | `R9A_PACKAGE_PRE_HASH_PRESENT` — R9A package pre hash present |
| `R10A-P020` | `R9A_PACKAGE_POST_HASH_PRESENT` — R9A package post hash present |
| `R10A-P021` | `R9A_PACKAGE_PRE_POST_EQUAL` — R9A package pre post equal |
| `R10A-P022` | `R9A_RUNTIME_CLOSURE_DIGEST_PRESENT` — R9A runtime closure digest present |
| `R10A-P023` | `R9A_CHILD_MANIFEST_COMPLETE` — R9A child manifest complete |
| `R10A-P024` | `R9A_ADAPTER_PROFILE_PRESENT` — R9A adapter profile present |
| `R10A-P025` | `R9A_D3D12_HARDWARE_TRUE` — R9A D3D12 hardware true |
| `R10A-P026` | `R9A_SOFTWARE_ADAPTER_FALSE` — R9A software adapter false |
| `R10A-P027` | `R9A_TIMESTAMP_QUERY_TRUE` — R9A timestamp query true |
| `R10A-P028` | `R9A_CANONICAL_ENCODER_COUNT_ONE` — R9A canonical encoder count one |
| `R10A-P029` | `R9A_CANONICAL_SUBMIT_COUNT_ONE` — R9A canonical submit count one |
| `R10A-P030` | `R9A_EXPORT_PREMAP_FENCE_ZERO` — R9A export premap fence zero |
| `R10A-P031` | `R9A_VALIDATION_DOUBLE_DISPATCH_ZERO` — R9A validation double dispatch zero |
| `R10A-P032` | `R9A_UNIFORM_OVERWRITE_ZERO` — R9A uniform overwrite zero |
| `R10A-P033` | `R9A_PERFORMANCE_CLOSURE_PASS` — R9A performance closure pass |
| `R10A-P034` | `R9A_RECEIPT_READ_ONLY` — R9A receipt read only |

## 24.2 TARGET_REBUILD_AND_PACKAGE

| Gate | Requirement |
|---|---|
| `R10A-P035` | `TARGET_REBUILD_INPUT_SET_PRESENT` — Target rebuild input set present |
| `R10A-P036` | `TARGET_REBUILD_INPUT_SET_SELF_HASH` — Target rebuild input set self hash |
| `R10A-P037` | `TARGET_SOURCE_COMMIT_FROZEN` — Target source commit frozen |
| `R10A-P038` | `TARGET_DEPENDENCY_LOCK_FROZEN` — Target dependency lock frozen |
| `R10A-P039` | `TARGET_TOOLCHAIN_IDENTITY_FROZEN` — Target toolchain identity frozen |
| `R10A-P040` | `TARGET_BUILD_ENVIRONMENT_FROZEN` — Target build environment frozen |
| `R10A-P041` | `TARGET_CLEAN_WORKTREE` — Target clean worktree |
| `R10A-P042` | `TARGET_NETWORK_DISABLED` — Target network disabled |
| `R10A-P043` | `TARGET_EMIT_A_COMPLETE` — Target emit a complete |
| `R10A-P044` | `TARGET_EMIT_B_COMPLETE` — Target emit b complete |
| `R10A-P045` | `TARGET_EMIT_A_INPUT_DIGEST` — Target emit a input digest |
| `R10A-P046` | `TARGET_EMIT_B_INPUT_DIGEST` — Target emit b input digest |
| `R10A-P047` | `TARGET_EMIT_INPUT_DIGEST_EQUAL` — Target emit input digest equal |
| `R10A-P048` | `TARGET_RUNTIME_CLOSURE_A_PRESENT` — Target runtime closure a present |
| `R10A-P049` | `TARGET_RUNTIME_CLOSURE_B_PRESENT` — Target runtime closure b present |
| `R10A-P050` | `TARGET_RUNTIME_CLOSURE_DIGEST_EQUAL` — Target runtime closure digest equal |
| `R10A-P051` | `TARGET_ACTIVE_GRAPH_A_PRESENT` — Target active graph a present |
| `R10A-P052` | `TARGET_ACTIVE_GRAPH_B_PRESENT` — Target active graph b present |
| `R10A-P053` | `TARGET_ACTIVE_GRAPH_DIGEST_EQUAL` — Target active graph digest equal |
| `R10A-P054` | `TARGET_PARSE_REPORT_A_PASS` — Target parse report a pass |
| `R10A-P055` | `TARGET_PARSE_REPORT_B_PASS` — Target parse report b pass |
| `R10A-P056` | `TARGET_PARSE_COUNT_EQUAL` — Target parse count equal |
| `R10A-P057` | `TARGET_GENERATED_WGSL_DIGEST_EQUAL` — Target generated WGSL digest equal |
| `R10A-P058` | `TARGET_R8A_KERNEL_IDENTITY_EQUAL` — Target R8A kernel identity equal |
| `R10A-P059` | `TARGET_R9A_GRAPH_IDENTITY_EQUAL` — Target R9A graph identity equal |
| `R10A-P060` | `TARGET_R9A_SAMPLING_POLICY_EQUAL` — Target R9A sampling policy equal |
| `R10A-P061` | `TARGET_R9A_UNIFORM_RING_IDENTITY_EQUAL` — Target R9A uniform ring identity equal |
| `R10A-P062` | `TARGET_PACKAGE_ASSEMBLED_FROM_EMIT_A` — Target package assembled from emit a |
| `R10A-P063` | `TARGET_PACKAGE_MANIFEST_COMPLETE` — Target package manifest complete |
| `R10A-P064` | `TARGET_PACKAGE_PATH_NORMALIZED` — Target package path normalized |
| `R10A-P065` | `TARGET_PACKAGE_EXTRA_EXECUTABLE_ZERO` — Target package extra executable zero |
| `R10A-P066` | `TARGET_PACKAGE_SYMLINK_ZERO` — Target package symlink zero |
| `R10A-P067` | `TARGET_PACKAGE_CONTENT_ID_RECOMPUTED` — Target package content ID recomputed |
| `R10A-P068` | `TARGET_PACKAGE_CONTENT_ID_MATCH` — Target package content ID match |
| `R10A-P069` | `TARGET_PACKAGE_POST_HASH_EQUAL` — Target package post hash equal |
| `R10A-P070` | `TARGET_RUNTIME_CLOSURE_MATCH_R9A` — Target runtime closure match R9A |
| `R10A-P071` | `TARGET_BUILD_ID_MATCH_R9A` — Target build ID match R9A |
| `R10A-P072` | `TARGET_PACKAGE_ID_MATCH_R9A` — Target package ID match R9A |
| `R10A-P073` | `TARGET_FULL_PRODUCT_RECEIPT_PRESENT` — Target full product receipt present |
| `R10A-P074` | `TARGET_FULL_PRODUCT_PASS` — Target full product pass |
| `R10A-P075` | `TARGET_FULL_PRODUCT_BLOCKERS_ZERO` — Target full product blockers zero |
| `R10A-P076` | `TARGET_FULL_PRODUCT_IDENTITY_EQUAL` — Target full product identity equal |
| `R10A-P077` | `TARGET_QUALIFIED_PACKAGE_RECEIPT_SEALED` — Target qualified package receipt sealed |
| `R10A-P078` | `TARGET_PACKAGE_MUTATION_ZERO` — Target package mutation zero |

## 24.3 PREVIOUS_ROLLBACK_PACKAGE

| Gate | Requirement |
|---|---|
| `R10A-P079` | `PREVIOUS_MODE_DECLARED` — Previous mode declared |
| `R10A-P080` | `BOOTSTRAP_OR_EXISTING_MODE_VALID` — Bootstrap or existing mode valid |
| `R10A-P081` | `BOOTSTRAP_PREVIOUS_REQUIRED_WHEN_ACTIVE_NULL` — Bootstrap previous required when active null |
| `R10A-P082` | `EXISTING_ACTIVE_REQUIRED_WHEN_NON_NULL` — Existing active required when non null |
| `R10A-P083` | `PREVIOUS_BUILD_ID_PRESENT` — Previous build ID present |
| `R10A-P084` | `PREVIOUS_PACKAGE_ID_PRESENT` — Previous package ID present |
| `R10A-P085` | `PREVIOUS_PACKAGE_PATH_PRESENT` — Previous package path present |
| `R10A-P086` | `PREVIOUS_PACKAGE_EXISTS` — Previous package exists |
| `R10A-P087` | `PREVIOUS_PACKAGE_READ_ONLY` — Previous package read only |
| `R10A-P088` | `PREVIOUS_PACKAGE_DISTINCT_FROM_TARGET` — Previous package distinct from target |
| `R10A-P089` | `PREVIOUS_RUNTIME_CLOSURE_PRESENT` — Previous runtime closure present |
| `R10A-P090` | `PREVIOUS_R8A_CURRENT_LINEAGE` — Previous R8A current lineage |
| `R10A-P091` | `PREVIOUS_R9A_PHYSICAL_RECEIPT_PRESENT` — Previous R9A physical receipt present |
| `R10A-P092` | `PREVIOUS_R9A_PHYSICAL_PASS` — Previous R9A physical pass |
| `R10A-P093` | `PREVIOUS_FULL_PRODUCT_RECEIPT_PRESENT` — Previous full product receipt present |
| `R10A-P094` | `PREVIOUS_FULL_PRODUCT_PASS` — Previous full product pass |
| `R10A-P095` | `PREVIOUS_BUILD_IDENTITY_EQUAL` — Previous build identity equal |
| `R10A-P096` | `PREVIOUS_PACKAGE_IDENTITY_EQUAL` — Previous package identity equal |
| `R10A-P097` | `PREVIOUS_RUNTIME_CLOSURE_MATCH_OWN_R9A` — Previous runtime closure match own R9A |
| `R10A-P098` | `PREVIOUS_QUALIFIED_PACKAGE_RECEIPT_SEALED` — Previous qualified package receipt sealed |
| `R10A-P099` | `PREVIOUS_QUALIFICATION_SET_DIGEST_PRESENT` — Previous qualification set digest present |
| `R10A-P100` | `PREVIOUS_POINTER_MAP_CANONICAL` — Previous pointer map canonical |
| `R10A-P101` | `PREVIOUS_NO_SUPERSEDED_RECEIPT` — Previous no superseded receipt |
| `R10A-P102` | `PREVIOUS_PACKAGE_POST_HASH_EQUAL` — Previous package post hash equal |
| `R10A-P103` | `PREVIOUS_SOURCE_TREE_INACCESSIBLE` — Previous source tree inaccessible |
| `R10A-P104` | `PREVIOUS_DEV_SERVER_DISABLED` — Previous dev server disabled |
| `R10A-P105` | `PREVIOUS_NETWORK_DISABLED_SMOKE` — Previous network disabled smoke |
| `R10A-P106` | `PREVIOUS_PREVIEW_SMOKE_CAPABLE` — Previous preview smoke capable |
| `R10A-P107` | `PREVIOUS_STRICT_EXPORT_SMOKE_CAPABLE` — Previous strict export smoke capable |
| `R10A-P108` | `PREVIOUS_VALIDATION_COUNTER_ZERO` — Previous validation counter zero |
| `R10A-P109` | `PREVIOUS_SILENT_FALLBACK_ZERO` — Previous silent fallback zero |
| `R10A-P110` | `PREVIOUS_PENDING_JOB_ZERO` — Previous pending job zero |
| `R10A-P111` | `PREVIOUS_ROLLBACK_ELIGIBLE` — Previous rollback eligible |
| `R10A-P112` | `PREVIOUS_FAKE_BUILD_ID_FORBIDDEN` — Previous fake build ID forbidden |

## 24.4 QUALIFICATION_SET_AND_APPROVAL

| Gate | Requirement |
|---|---|
| `R10A-P113` | `QUALIFICATION_SET_PRESENT` — Qualification set present |
| `R10A-P114` | `QUALIFICATION_SET_SCHEMA_VALID` — Qualification set schema valid |
| `R10A-P115` | `QUALIFICATION_SET_SELF_HASH_VALID` — Qualification set self hash valid |
| `R10A-P116` | `QUALIFICATION_SET_TARGET_BOUND` — Qualification set target bound |
| `R10A-P117` | `QUALIFICATION_SET_PREVIOUS_BOUND` — Qualification set previous bound |
| `R10A-P118` | `QUALIFICATION_SET_R8A_RECEIPT_BOUND` — Qualification set R8A receipt bound |
| `R10A-P119` | `QUALIFICATION_SET_R9A_PHYSICAL_BOUND` — Qualification set R9A physical bound |
| `R10A-P120` | `QUALIFICATION_SET_FULL_PRODUCT_BOUND` — Qualification set full product bound |
| `R10A-P121` | `QUALIFICATION_SET_REBUILD_BOUND` — Qualification set rebuild bound |
| `R10A-P122` | `QUALIFICATION_SET_ACTIVE_GRAPH_BOUND` — Qualification set active graph bound |
| `R10A-P123` | `QUALIFICATION_SET_PARSE_REPORT_BOUND` — Qualification set parse report bound |
| `R10A-P124` | `QUALIFICATION_SET_RUNTIME_CLOSURE_BOUND` — Qualification set runtime closure bound |
| `R10A-P125` | `QUALIFICATION_SET_KERNEL_IDENTITY_BOUND` — Qualification set kernel identity bound |
| `R10A-P126` | `QUALIFICATION_SET_COMMAND_GRAPH_BOUND` — Qualification set command graph bound |
| `R10A-P127` | `QUALIFICATION_SET_UNIFORM_RING_BOUND` — Qualification set uniform ring bound |
| `R10A-P128` | `QUALIFICATION_SET_SAMPLING_POLICY_BOUND` — Qualification set sampling policy bound |
| `R10A-P129` | `QUALIFICATION_SET_DIGEST_RECOMPUTED` — Qualification set digest recomputed |
| `R10A-P130` | `QUALIFICATION_SET_MIXED_BUILD_ZERO` — Qualification set mixed build zero |
| `R10A-P131` | `QUALIFICATION_SET_MIXED_PACKAGE_ZERO` — Qualification set mixed package zero |
| `R10A-P132` | `QUALIFICATION_SET_SUPERSEDED_INPUT_ZERO` — Qualification set superseded input zero |
| `R10A-P133` | `OPERATOR_APPROVAL_PRESENT` — Operator approval present |
| `R10A-P134` | `OPERATOR_APPROVAL_SCHEMA_VALID` — Operator approval schema valid |
| `R10A-P135` | `OPERATOR_APPROVAL_TARGET_BOUND` — Operator approval target bound |
| `R10A-P136` | `OPERATOR_APPROVAL_PREVIOUS_BOUND` — Operator approval previous bound |
| `R10A-P137` | `OPERATOR_APPROVAL_POINTER_HASH_BOUND` — Operator approval pointer hash bound |
| `R10A-P138` | `OPERATOR_APPROVAL_POINTER_GENERATION_BOUND` — Operator approval pointer generation bound |
| `R10A-P139` | `OPERATOR_APPROVAL_QUALIFICATION_DIGEST_BOUND` — Operator approval qualification digest bound |
| `R10A-P140` | `OPERATOR_APPROVAL_RUN_ID_BOUND` — Operator approval run ID bound |
| `R10A-P141` | `OPERATOR_APPROVAL_EXPLICIT_TRUE` — Operator approval explicit true |
| `R10A-P142` | `OPERATOR_APPROVAL_NOT_EMBEDDED` — Operator approval not embedded |
| `R10A-P143` | `RUN_ID_UNIQUE` — Run ID unique |
| `R10A-P144` | `EVIDENCE_DIRECTORY_EMPTY_AT_START` — Evidence directory empty at start |

## 24.5 LOCK_BARRIER_AND_PROMOTION_CAS

| Gate | Requirement |
|---|---|
| `R10A-P145` | `GLOBAL_RELEASE_LOCK_ACQUIRED` — Global release lock acquired |
| `R10A-P146` | `LOCK_OWNER_RUN_ID_MATCH` — Lock owner run ID match |
| `R10A-P147` | `LOCK_EXPECTED_POINTER_HASH_BOUND` — Lock expected pointer hash bound |
| `R10A-P148` | `LOCK_EXPECTED_POINTER_GENERATION_BOUND` — Lock expected pointer generation bound |
| `R10A-P149` | `LOCK_STALE_AUTO_DELETE_FORBIDDEN` — Lock stale auto delete forbidden |
| `R10A-P150` | `MAINTENANCE_BARRIER_ENTERED` — Maintenance barrier entered |
| `R10A-P151` | `NEW_JOB_ADMISSION_BLOCKED` — New job admission blocked |
| `R10A-P152` | `PENDING_GPU_JOB_ZERO` — Pending GPU job zero |
| `R10A-P153` | `PENDING_READBACK_ZERO` — Pending readback zero |
| `R10A-P154` | `PENDING_SAVE_ZERO` — Pending save zero |
| `R10A-P155` | `ACTIVE_WORKER_JOB_ZERO` — Active worker job zero |
| `R10A-P156` | `ACTIVE_RENDERER_JOB_ZERO` — Active renderer job zero |
| `R10A-P157` | `PROCESS_QUIESCENCE_RECEIPT` — Process quiescence receipt |
| `R10A-P158` | `ACTIVE_PROCESS_EXITED` — Active process exited |
| `R10A-P159` | `FORCED_KILL_UNUSED_OR_RECEIPTED` — Forced kill unused or receipted |
| `R10A-P160` | `POINTER_BEFORE_READ` — Pointer before read |
| `R10A-P161` | `POINTER_BEFORE_SCHEMA_VALID` — Pointer before schema valid |
| `R10A-P162` | `POINTER_BEFORE_RAW_HASH_VALID` — Pointer before raw hash valid |
| `R10A-P163` | `POINTER_BEFORE_SELF_HASH_VALID` — Pointer before self hash valid |
| `R10A-P164` | `POINTER_BEFORE_MIRRORS_EQUAL` — Pointer before mirrors equal |
| `R10A-P165` | `POINTER_EXPECTED_HASH_MATCH` — Pointer expected hash match |
| `R10A-P166` | `POINTER_EXPECTED_GENERATION_MATCH` — Pointer expected generation match |
| `R10A-P167` | `PROMOTION_INTENT_PRESENT` — Promotion intent present |
| `R10A-P168` | `PROMOTION_INTENT_SELF_HASH_VALID` — Promotion intent self hash valid |
| `R10A-P169` | `PROMOTION_INTENT_TARGET_EXACT` — Promotion intent target exact |
| `R10A-P170` | `PROMOTION_INTENT_PREVIOUS_EXACT` — Promotion intent previous exact |
| `R10A-P171` | `PROMOTION_INTENT_QUALIFICATION_EXACT` — Promotion intent qualification exact |
| `R10A-P172` | `PROMOTION_INTENT_APPROVAL_EXACT` — Promotion intent approval exact |
| `R10A-P173` | `PROMOTION_CAS_ATOMIC` — Promotion CAS atomic |
| `R10A-P174` | `PROMOTION_GENERATION_PLUS_ONE` — Promotion generation plus one |
| `R10A-P175` | `PROMOTION_ACTIVE_TARGET_EXACT` — Promotion active target exact |
| `R10A-P176` | `PROMOTION_PREVIOUS_EXACT` — Promotion previous exact |
| `R10A-P177` | `PROMOTION_QUALIFICATION_MAP_EXACT` — Promotion qualification map exact |
| `R10A-P178` | `PROMOTION_POINTER_MIRRORS_EQUAL` — Promotion pointer mirrors equal |
| `R10A-P179` | `PROMOTION_POINTER_READBACK_VALID` — Promotion pointer readback valid |
| `R10A-P180` | `PROMOTION_CAS_RECEIPT_SEALED` — Promotion CAS receipt sealed |
| `R10A-P181` | `PROMOTION_PACKAGE_UNCHANGED` — Promotion package unchanged |
| `R10A-P182` | `PROMOTION_NO_PARTIAL_SELECTION` — Promotion no partial selection |

## 24.6 PROMOTED_SMOKE

| Gate | Requirement |
|---|---|
| `R10A-P183` | `PROMOTED_RELAUNCH_RECEIPT_PRESENT` — Promoted relaunch receipt present |
| `R10A-P184` | `PROMOTED_LAUNCH_PATH_FROM_POINTER` — Promoted launch path from pointer |
| `R10A-P185` | `PROMOTED_BUILD_ID_EXACT` — Promoted build ID exact |
| `R10A-P186` | `PROMOTED_PACKAGE_ID_EXACT` — Promoted package ID exact |
| `R10A-P187` | `PROMOTED_RUNTIME_CLOSURE_EXACT` — Promoted runtime closure exact |
| `R10A-P188` | `PROMOTED_PACKAGE_PRE_POST_HASH_EQUAL` — Promoted package pre post hash equal |
| `R10A-P189` | `PROMOTED_R8A_KERNEL_IDENTITY_EXACT` — Promoted R8A kernel identity exact |
| `R10A-P190` | `PROMOTED_R9A_COMMAND_GRAPH_EXACT` — Promoted R9A command graph exact |
| `R10A-P191` | `PROMOTED_ENCODER_COUNT_ONE` — Promoted encoder count one |
| `R10A-P192` | `PROMOTED_SUBMIT_COUNT_ONE` — Promoted submit count one |
| `R10A-P193` | `PROMOTED_EXPORT_PREMAP_FENCE_ZERO` — Promoted export premap fence zero |
| `R10A-P194` | `PROMOTED_VALIDATION_COUNTER_ZERO` — Promoted validation counter zero |
| `R10A-P195` | `PROMOTED_UNIFORM_OVERWRITE_ZERO` — Promoted uniform overwrite zero |
| `R10A-P196` | `PROMOTED_PREVIEW_SMOKE_PASS` — Promoted preview smoke pass |
| `R10A-P197` | `PROMOTED_STRICT_EXPORT_SMOKE_PASS` — Promoted strict export smoke pass |
| `R10A-P198` | `PROMOTED_PREVIEW_EXPORT_IDENTITY_PASS` — Promoted preview export identity pass |
| `R10A-P199` | `PROMOTED_ALPHA_BORDER_DC_PASS` — Promoted alpha border dc pass |
| `R10A-P200` | `PROMOTED_CPU_FALLBACK_FALSE` — Promoted CPU fallback false |
| `R10A-P201` | `PROMOTED_SILENT_FALLBACK_ZERO` — Promoted silent fallback zero |
| `R10A-P202` | `PROMOTED_SOURCE_TREE_INACCESSIBLE` — Promoted source tree inaccessible |
| `R10A-P203` | `PROMOTED_DEV_SERVER_DISABLED` — Promoted dev server disabled |
| `R10A-P204` | `PROMOTED_NETWORK_DISABLED` — Promoted network disabled |
| `R10A-P205` | `PROMOTED_PENDING_JOB_ZERO` — Promoted pending job zero |
| `R10A-P206` | `PROMOTED_RECEIPT_SELF_HASH_VALID` — Promoted receipt self hash valid |
| `R10A-P207` | `PROMOTED_RECEIPT_PACKAGE_BOUND` — Promoted receipt package bound |
| `R10A-P208` | `PROMOTED_SMOKE_GATE_PASS` — Promoted smoke gate pass |

## 24.7 ROLLBACK_DRILL

| Gate | Requirement |
|---|---|
| `R10A-P209` | `ROLLBACK_TRIGGER_PRESENT` — Rollback trigger present |
| `R10A-P210` | `ROLLBACK_TRIGGER_EVIDENCE_BOUND` — Rollback trigger evidence bound |
| `R10A-P211` | `ROLLBACK_TRIGGER_TARGET_FAILURE_NOT_REQUIRED` — Rollback trigger target failure not required |
| `R10A-P212` | `ROLLBACK_INTENT_PRESENT` — Rollback intent present |
| `R10A-P213` | `ROLLBACK_INTENT_SELF_HASH_VALID` — Rollback intent self hash valid |
| `R10A-P214` | `ROLLBACK_INTENT_POINTER_HASH_BOUND` — Rollback intent pointer hash bound |
| `R10A-P215` | `ROLLBACK_INTENT_POINTER_GENERATION_BOUND` — Rollback intent pointer generation bound |
| `R10A-P216` | `ROLLBACK_INTENT_PREVIOUS_EXACT` — Rollback intent previous exact |
| `R10A-P217` | `ROLLBACK_CAS_ATOMIC` — Rollback CAS atomic |
| `R10A-P218` | `ROLLBACK_GENERATION_PLUS_ONE` — Rollback generation plus one |
| `R10A-P219` | `ROLLBACK_ACTIVE_PREVIOUS_EXACT` — Rollback active previous exact |
| `R10A-P220` | `ROLLBACK_PREVIOUS_TARGET_SNAPSHOT_EXACT` — Rollback previous target snapshot exact |
| `R10A-P221` | `ROLLBACK_QUALIFICATION_MAP_EXACT` — Rollback qualification map exact |
| `R10A-P222` | `ROLLBACK_POINTER_MIRRORS_EQUAL` — Rollback pointer mirrors equal |
| `R10A-P223` | `ROLLBACK_POINTER_READBACK_VALID` — Rollback pointer readback valid |
| `R10A-P224` | `ROLLBACK_RELAUNCH_RECEIPT_PRESENT` — Rollback relaunch receipt present |
| `R10A-P225` | `ROLLBACK_LAUNCHED_PACKAGE_EXACT` — Rollback launched package exact |
| `R10A-P226` | `ROLLBACK_RUNTIME_CLOSURE_EXACT` — Rollback runtime closure exact |
| `R10A-P227` | `ROLLBACK_PACKAGE_PRE_POST_HASH_EQUAL` — Rollback package pre post hash equal |
| `R10A-P228` | `ROLLBACK_PREVIEW_SMOKE_PASS` — Rollback preview smoke pass |
| `R10A-P229` | `ROLLBACK_STRICT_EXPORT_SMOKE_PASS` — Rollback strict export smoke pass |
| `R10A-P230` | `ROLLBACK_R8A_KERNEL_IDENTITY_EXACT` — Rollback R8A kernel identity exact |
| `R10A-P231` | `ROLLBACK_R9A_COMMAND_GRAPH_EXACT` — Rollback R9A command graph exact |
| `R10A-P232` | `ROLLBACK_VALIDATION_COUNTER_ZERO` — Rollback validation counter zero |
| `R10A-P233` | `ROLLBACK_CPU_FALLBACK_FALSE` — Rollback CPU fallback false |
| `R10A-P234` | `ROLLBACK_SILENT_FALLBACK_ZERO` — Rollback silent fallback zero |
| `R10A-P235` | `ROLLBACK_PENDING_JOB_ZERO` — Rollback pending job zero |
| `R10A-P236` | `ROLLBACK_NO_PARTIAL_COMPONENT` — Rollback no partial component |
| `R10A-P237` | `ROLLBACK_CAS_RECEIPT_SEALED` — Rollback CAS receipt sealed |
| `R10A-P238` | `ROLLBACK_SMOKE_RECEIPT_SEALED` — Rollback smoke receipt sealed |

## 24.8 REPROMOTION_AND_FINAL_SMOKE

| Gate | Requirement |
|---|---|
| `R10A-P239` | `REPROMOTION_INTENT_PRESENT` — Repromotion intent present |
| `R10A-P240` | `REPROMOTION_INTENT_SELF_HASH_VALID` — Repromotion intent self hash valid |
| `R10A-P241` | `REPROMOTION_INTENT_POINTER_HASH_BOUND` — Repromotion intent pointer hash bound |
| `R10A-P242` | `REPROMOTION_INTENT_POINTER_GENERATION_BOUND` — Repromotion intent pointer generation bound |
| `R10A-P243` | `REPROMOTION_INTENT_TARGET_EXACT` — Repromotion intent target exact |
| `R10A-P244` | `REPROMOTION_CAS_ATOMIC` — Repromotion CAS atomic |
| `R10A-P245` | `REPROMOTION_GENERATION_PLUS_ONE` — Repromotion generation plus one |
| `R10A-P246` | `REPROMOTION_ACTIVE_TARGET_EXACT` — Repromotion active target exact |
| `R10A-P247` | `REPROMOTION_PREVIOUS_EXACT` — Repromotion previous exact |
| `R10A-P248` | `REPROMOTION_QUALIFICATION_MAP_EXACT` — Repromotion qualification map exact |
| `R10A-P249` | `REPROMOTION_POINTER_MIRRORS_EQUAL` — Repromotion pointer mirrors equal |
| `R10A-P250` | `REPROMOTION_POINTER_READBACK_VALID` — Repromotion pointer readback valid |
| `R10A-P251` | `FINAL_RELAUNCH_RECEIPT_PRESENT` — Final relaunch receipt present |
| `R10A-P252` | `FINAL_LAUNCHED_PACKAGE_EXACT` — Final launched package exact |
| `R10A-P253` | `FINAL_RUNTIME_CLOSURE_EXACT` — Final runtime closure exact |
| `R10A-P254` | `FINAL_PACKAGE_PRE_POST_HASH_EQUAL` — Final package pre post hash equal |
| `R10A-P255` | `FINAL_PREVIEW_SMOKE_PASS` — Final preview smoke pass |
| `R10A-P256` | `FINAL_STRICT_EXPORT_SMOKE_PASS` — Final strict export smoke pass |
| `R10A-P257` | `FINAL_R8A_KERNEL_IDENTITY_EXACT` — Final R8A kernel identity exact |
| `R10A-P258` | `FINAL_R9A_COMMAND_GRAPH_EXACT` — Final R9A command graph exact |
| `R10A-P259` | `FINAL_ENCODER_COUNT_ONE` — Final encoder count one |
| `R10A-P260` | `FINAL_SUBMIT_COUNT_ONE` — Final submit count one |
| `R10A-P261` | `FINAL_VALIDATION_COUNTER_ZERO` — Final validation counter zero |
| `R10A-P262` | `FINAL_CPU_FALLBACK_FALSE` — Final CPU fallback false |
| `R10A-P263` | `FINAL_SILENT_FALLBACK_ZERO` — Final silent fallback zero |
| `R10A-P264` | `FINAL_PENDING_JOB_ZERO` — Final pending job zero |
| `R10A-P265` | `FINAL_POINTER_TARGET_ACTIVE` — Final pointer target active |
| `R10A-P266` | `FINAL_POINTER_PREVIOUS_RECORDED` — Final pointer previous recorded |
| `R10A-P267` | `REPROMOTION_CAS_RECEIPT_SEALED` — Repromotion CAS receipt sealed |
| `R10A-P268` | `FINAL_SMOKE_RECEIPT_SEALED` — Final smoke receipt sealed |

## 24.9 FINAL_RELEASE_AND_LINEAGE

| Gate | Requirement |
|---|---|
| `R10A-P269` | `RELEASE_LEDGER_PRESENT` — Release ledger present |
| `R10A-P270` | `RELEASE_LEDGER_HASH_CHAIN_VALID` — Release ledger hash chain valid |
| `R10A-P271` | `RELEASE_LEDGER_PROMOTION_INCLUDED` — Release ledger promotion included |
| `R10A-P272` | `RELEASE_LEDGER_ROLLBACK_INCLUDED` — Release ledger rollback included |
| `R10A-P273` | `RELEASE_LEDGER_REPROMOTION_INCLUDED` — Release ledger repromotion included |
| `R10A-P274` | `RELEASE_LEDGER_GENERATIONS_CONSECUTIVE` — Release ledger generations consecutive |
| `R10A-P275` | `RELEASE_GATE_RECEIPT_PRESENT` — Release gate receipt present |
| `R10A-P276` | `RELEASE_GATE_COUNT_300_PASS` — Release gate count 300 pass |
| `R10A-P277` | `RELEASE_GATE_PENDING_ZERO` — Release gate pending zero |
| `R10A-P278` | `RELEASE_GATE_DEFERRED_ZERO` — Release gate deferred zero |
| `R10A-P279` | `RELEASE_GATE_SKIPPED_ZERO` — Release gate skipped zero |
| `R10A-P280` | `RELEASE_GATE_FAIL_ZERO` — Release gate fail zero |
| `R10A-P281` | `FINAL_RELEASE_RECEIPT_PRESENT` — Final release receipt present |
| `R10A-P282` | `FINAL_RELEASE_RECEIPT_SCHEMA_VALID` — Final release receipt schema valid |
| `R10A-P283` | `FINAL_RELEASE_RECEIPT_SELF_HASH_VALID` — Final release receipt self hash valid |
| `R10A-P284` | `FINAL_RELEASE_STATE_EXACT` — Final release state exact |
| `R10A-P285` | `FINAL_RELEASE_TARGET_IDENTITY_EXACT` — Final release target identity exact |
| `R10A-P286` | `FINAL_RELEASE_PREVIOUS_IDENTITY_EXACT` — Final release previous identity exact |
| `R10A-P287` | `FINAL_RELEASE_QUALIFICATION_DIGEST_EXACT` — Final release qualification digest exact |
| `R10A-P288` | `FINAL_RELEASE_POINTER_HASH_CHAIN_EXACT` — Final release pointer hash chain exact |
| `R10A-P289` | `FINAL_RELEASE_WHOLE_BUILD_TRUE` — Final release whole build true |
| `R10A-P290` | `FINAL_RELEASE_LEGACY_FALLBACK_FALSE` — Final release legacy fallback false |
| `R10A-P291` | `FINAL_RELEASE_BLOCKERS_EMPTY` — Final release blockers empty |
| `R10A-P292` | `LINEAGE_RESTORATION_RECEIPT_PRESENT` — Lineage restoration receipt present |
| `R10A-P293` | `LINEAGE_RESTORATION_SCHEMA_VALID` — Lineage restoration schema valid |
| `R10A-P294` | `LINEAGE_RESTORATION_SELF_HASH_VALID` — Lineage restoration self hash valid |
| `R10A-P295` | `LINEAGE_HEAD_R10A_EXACT` — Lineage head R10A exact |
| `R10A-P296` | `LINEAGE_ROOT_DIGEST_RECOMPUTED` — Lineage root digest recomputed |
| `R10A-P297` | `LINEAGE_CURRENT_RECEIPTS_EXACT` — Lineage current receipts exact |
| `R10A-P298` | `LINEAGE_SUPERSEDED_RECEIPTS_EXACT` — Lineage superseded receipts exact |
| `R10A-P299` | `LINEAGE_R11A_R12A_R13A_PENDING` — Lineage R11A R12A R13A pending |
| `R10A-P300` | `GLOBAL_LOCK_RELEASED_AFTER_FINALIZE` — Global lock released after finalize |

---

# 25. Required Negative Controls

1. R9A source receipt를 physical final receipt로 제출
2. R9 historical receipt를 current qualification으로 제출
3. R10 historical final receipt를 R10A parent로 제출
4. R9A receipt와 packageContentId가 다른 package 제출
5. dual clean emit의 runtime closure 한 파일 변조
6. generated WGSL manifest만 이전 세대로 교체
7. Active Graph receipt와 package closure 불일치
8. full-product receipt의 buildId만 target으로 위조
9. active null 상태에서 previous package 생략
10. target과 previous에 같은 packageContentId 사용
11. previous package에 superseded R9 runtime 사용
12. operator approval의 pointer generation 변조
13. qualificationSetDigest 계산 후 child receipt 교체
14. promotion intent 생성 후 pointer mirror 한쪽 변경
15. stale raw hash로 CAS 자동 재시도
16. promotion 후 다른 package로 smoke 실행
17. rollback에서 worker 하나만 previous로 교체
18. rollback smoke receipt 없이 repromotion
19. repromotion generation을 1보다 크게 증가
20. final smoke 전에 final release 생성
21. final receipt child artifact 누락
22. lineage restoration receipt에 R11A PASS를 허위 기록
23. lineage receipt가 자기 SHA를 lineage root 입력으로 사용
24. source mode에서 pointer writer 호출

모든 negative control은 stable error code와 immutable rejection evidence를 남겨야 한다.

---

# 26. Source Bake State

```text
RESAMPLE_RUNTIME_R10A_RELEASE_REQUALIFICATION_HARNESS_SOURCE_SEALED_AWAITING_R9A_PHYSICAL_AND_PRODUCTION_REBUILD

260 SOURCE PASS
300 RELEASE PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

productionPointerMutated = false
localActivationPointerMutated = false
historicalPassCarryForward = 0
```

---

# 27. Final Release and Lineage State

Final release receipt state:

```text
RESAMPLE_RUNTIME_R10A_RELEASE_REQUALIFIED_POINTER_CAS_AND_ROLLBACK_DRILL_SEALED
```

Lineage restoration final state:

```text
RESAMPLE_RUNTIME_R10A_CURRENT_LINEAGE_RESTORED_AWAITING_R11A

260 SOURCE PASS
300 RELEASE PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

promotionSmokePassed = true
rollbackDrillVerified = true
repromotionSmokePassed = true
wholeBuildIdentityPreserved = true
historicalPassCarryForward = 0
productionPointerMutatedByLineageRestoration = false
```

---

# 28. Final Deliverables

```text
R10A_REBUILD_INPUT_SET.json
R10A_CLEAN_EMIT_A_RECEIPT.json
R10A_CLEAN_EMIT_B_RECEIPT.json
R10A_REPRODUCIBLE_CLOSURE_RECEIPT.json
R10A_TARGET_QUALIFIED_PACKAGE_RECEIPT.json
R10A_PREVIOUS_QUALIFIED_PACKAGE_RECEIPT.json
R10A_QUALIFICATION_SET.json
R10A_OPERATOR_APPROVAL_ADMISSION_RECEIPT.json
R10A_PROMOTION_INTENT.json
R10A_PROMOTION_CAS_RECEIPT.json
R10A_PROMOTED_SMOKE_RECEIPT.json
R10A_ROLLBACK_TRIGGER_RECEIPT.json
R10A_ROLLBACK_INTENT.json
R10A_ROLLBACK_CAS_RECEIPT.json
R10A_ROLLBACK_SMOKE_RECEIPT.json
R10A_REPROMOTION_INTENT.json
R10A_REPROMOTION_CAS_RECEIPT.json
R10A_FINAL_SMOKE_RECEIPT.json
R10A_RELEASE_LEDGER.json
TDT_RESAMPLE_RUNTIME_01_R10A_FINAL_RELEASE_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R10A_LINEAGE_RESTORATION_RECEIPT.json
```

---

# 29. Next Authority

```text
TDT-RESAMPLE-RUNTIME-01-R11A

R10A Release Admission /
Electron Startup Attestation Wiring /
Installed Session Token Enforcement /
Crash·Device-Loss Runtime Quarantine /
Preview·Export Admission Integration Seal
```

R11A는 R10A final release receipt와 lineage restoration receipt를 둘 다 admission input으로 사용해야 한다.
