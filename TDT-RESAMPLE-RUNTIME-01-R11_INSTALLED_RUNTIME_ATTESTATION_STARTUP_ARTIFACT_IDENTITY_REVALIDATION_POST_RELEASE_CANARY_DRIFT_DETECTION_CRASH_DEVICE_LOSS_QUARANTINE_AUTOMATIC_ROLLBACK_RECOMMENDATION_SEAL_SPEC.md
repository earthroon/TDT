# TDT-RESAMPLE-RUNTIME-01-R11

## Installed Runtime Attestation / Startup Artifact Identity Revalidation / Post-Release Canary and Drift Detection / Crash·Device-Loss Quarantine / Automatic Rollback Recommendation Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R11`
- **Source parent:** `TDT-RESAMPLE-RUNTIME-01-R10`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R10_PRODUCTION_CANDIDATE_PROMOTION_PRODUCTION_POINTER_CAS_ROLLBACK_DRILL_RELEASE_RECEIPT_HARNESS_SOURCE_BAKED_AWAITING_R9_PHYSICAL_RECEIPT.zip`
- **Parent repository bundle SHA-256:** `da3f7f742e16bc0272c3f0a5bef42ea995489f2fe8ef146ed3b07d68b930f8ee`
- **Parent R10 specification SHA-256:** `0c3bda432564827104e45f2e0e5cecf11dcce328115f7ab5fc4c90058d927d38`
- **Parent R10 source receipt SHA-256:** `76e47a1ea47f4ff662c50992dfd5fdcac262a38e73931da3c0bb3ede9cb52b77`
- **Current source predecessor state:** `RESAMPLE_RUNTIME_R10_PROMOTION_HARNESS_SOURCE_BAKED_AWAITING_R9_PHYSICAL_RECEIPT`
- **Required installed predecessor state:** `RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED`
- **R11 source-harness state:** `RESAMPLE_RUNTIME_R11_ATTESTATION_HARNESS_SOURCE_BAKED_AWAITING_R10_PRODUCTION_RELEASE`
- **R11 startup-admitted state:** `RESAMPLE_RUNTIME_R11_STARTUP_ATTESTED_CANARY_PASS_RUNTIME_ADMITTED`
- **R11 recovered state:** `RESAMPLE_RUNTIME_R11_POST_LOSS_CANARY_PASS_RUNTIME_READMITTED`
- **R11 quarantine state:** `RESAMPLE_RUNTIME_R11_RUNTIME_QUARANTINED_ROLLBACK_RECOMMENDED`
- **R11 final state:** `RESAMPLE_RUNTIME_R11_INSTALLED_RUNTIME_ATTESTATION_AND_QUARANTINE_SEALED`
- **Rejected state:** `RESAMPLE_RUNTIME_R11_INSTALLED_RUNTIME_ATTESTATION_REJECTED`
- **Production pointer authority:** `dadum.export.production-pointer`
- **Pointer mutation authority:** R10 only
- **R11 pointer mutation:** forbidden
- **Canonical policy profile:** `tdt.resample-runtime.post-release-guard.r11.v1`
- **Source mandatory gates:** `148`
- **Installed mandatory gates:** `228`
- **Total gates:** `376`

---

# 0. Executive Contract

R11은 R10이 승격한 packaged Electron whole build가 설치·업데이트·실행·device-loss 복구 이후에도 같은 정체성을 유지하는지 매 실행에서 재증명하는 post-release runtime authority다. R11은 EWA 수학, WGSL, planner, ABI, Production Pointer를 다시 설계하지 않는다. R11이 다루는 것은 **실행 중인 설치본의 byte identity**, **사용자 작업 이전의 물리 GPU canary**, **세션·device epoch 귀속**, **드리프트·크래시 증거**, **격리**, **R10 rollback에 전달할 권고 영수증**이다.

R11은 두 층으로 분리된다.

```text
source-harness acceptance
    설치본 manifest generator/verifier, startup state machine,
    GPU canary, session token, drift ledger, quarantine, rollback recommendation이
    구현 가능한 상태임을 증명한다.
    현재 R10 final release가 없으므로 installed gate는 모두 PENDING이다.

installed-runtime acceptance
    R10 final release receipt와 active pointer v3를 소비하고,
    실제 설치 package bytes와 packaged hardware GPU를 검증한다.
    모든 installed gate가 PASS한 뒤에만 runtime admission token을 발급한다.
```

R11의 핵심 순서는 바꿀 수 없다.

```text
R10 final release receipt admission
    ↓
active production pointer read and self-hash verification
    ↓
executing package identity and full runtime closure rehash
    ↓
hardware GPU startup canary
    ↓
session admission token issue
    ↓
Preview / Export jobs
    ↓
drift, crash, device-loss, resource ledger
    ↓
quarantine when correctness identity is no longer trusted
    ↓
evidence-bound R10 rollback recommendation
```

Artifact identity가 실패하면 canary를 실행하지 않는다. Canary가 성공해도 artifact mismatch를 덮을 수 없다. 반대로 artifact identity가 맞아도 canary가 실패하면 runtime을 admit하지 않는다. 두 증거는 AND 관계다.
# 1. Parent Truth and Current Repository Facts

현재 제공된 R10 bundle은 promotion harness source만 포함한다. R10 final production release receipt는 존재하지 않으며 current pointer는 schema v2, active build/package가 null인 상태다. 따라서 R11 source harness와 명세는 작성할 수 있지만 installed-runtime acceptance를 실행하거나 최종 상태를 선언할 수 없다.

현재 확인된 값:

```text
R10 source receipt state = RESAMPLE_RUNTIME_R10_PROMOTION_HARNESS_SOURCE_BAKED_AWAITING_R9_PHYSICAL_RECEIPT
R10 source PASS = 129
R10 release PENDING = 202
R10 FAIL = 0
productionPointerMutated = false
pointer schema = 2
pointer activeBuildId = null
pointer activePackageContentId = null
pointer raw SHA-256 = 1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8
```

R11은 이 공백을 추정으로 메우지 않는다. R10 final release receipt가 없으면 installed gate 228개는 전부 PENDING이며, runtime admission token은 발급할 수 없다.
# 2. Scope

- immutable R10 final release receipt와 pointer v3 admission;
- 실행 중인 packaged Electron 설치본의 runtime executable closure SHA-256 재검증;
- app.asar, unpacked JS, workers, WASM, native addon, WGSL, generated manifest, Active Graph closure 검증;
- 사용자 작업 이전의 deterministic hardware GPU startup canary;
- product↔direct reference raw binary16 exact comparison과 GPU↔binary64 oracle ULP comparison;
- validation counter zero control과 positive control;
- build·package·pointer generation·device epoch에 묶인 session admission token;
- lazy worker/WASM/native/WGSL first-use hash admission;
- append-only drift/crash/resource ledger;
- controlled device-loss recovery와 post-loss canary;
- quarantine persistence와 Preview·Export admission 차단;
- R10만 실행할 수 있는 rollback recommendation receipt;
- 사용자 콘텐츠가 없는 local diagnostic evidence.
# 3. Non-Goals

- Production Pointer 자동 변경;
- 패키지 자동 설치 또는 자동 다운로드;
- R10 CAS·rollback 권위 복제;
- CPU·Canvas·WebGL·legacy shader fallback;
- 사용자 이미지의 픽셀, 썸네일, 파일명, 경로, 픽셀 hash 수집;
- 원격 telemetry 전송;
- R9 또는 R10 실패 후보의 자동 수리;
- 성능 저하 하나만으로 correctness failure를 위조;
- active package와 다른 previous package를 임의 rollback target으로 발명;
- quarantine의 시간 기반 자동 해제;
- 실행 중 hot patch 또는 mixed-build asset 교체.
# 4. Authority Model

## 4.1 Release Selection Authority

Whole-build package 선택과 rollback 실행 권위는 R10의 `dadum.export.production-pointer` 하나다. R11은 pointer를 읽고 검증하지만 쓰지 않는다.

## 4.2 Installed Runtime Authority

R11은 현재 실행 process가 active pointer가 선택한 package bytes인지 증명한다. R11이 발급하는 session token은 package를 선택하지 않고, 선택된 package가 이 세션에서 실행 가능한지 여부만 결정한다.

## 4.3 Quarantine Authority

R11 quarantine은 local runtime admission을 차단한다. Global production pointer나 다른 설치의 상태를 바꾸지 않는다.

## 4.4 Rollback Recommendation Authority

Recommendation은 R10 rollback 입력을 위한 evidence artifact다. `executionAuthority`는 항상 `TDT-RESAMPLE-RUNTIME-01-R10`이며 `operatorApprovalRequired = true`다.
# 5. State Machine

```text
R10_FINAL_RELEASE_ACCEPTED
  → R11_EXPECTED_INSTALLATION_MANIFEST_ACCEPTED
  → R11_STARTUP_LOCKED
  → R11_POINTER_ATTESTED
  → R11_INSTALLED_BYTES_ATTESTED
  → R11_DEVICE_AUTHORITY_ACQUIRED
  → R11_STARTUP_CANARY_PASS
  → R11_SESSION_TOKEN_ISSUED
  → R11_RUNTIME_ADMITTED
```

Device loss recovery:

```text
R11_RUNTIME_ADMITTED
  → device lost
  → token revoked
  → pending jobs rejected
  → old epoch disposed
  → new device epoch
  → post-loss canary
  → PASS: new token and readmission
  → FAIL or threshold breach: quarantine
```

Quarantine:

```text
correctness drift / artifact drift / threshold breach
  → R11_RUNTIME_QUARANTINED
  → Preview and Export blocked
  → rollback recommendation generated when qualified target exists
  → pointer remains unchanged
```
# 6. Required R10 Final Release Admission

R11 installed acceptance는 다음 R10 receipt만 소비한다.

```text
TDT_RESAMPLE_RUNTIME_01_R10_FINAL_RELEASE_RECEIPT.json
state = RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED
SOURCE_PASS = 129
RELEASE_PASS = 202
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0
promotionSmokePassed = true
rollbackDrillVerified = true
repromotionSmokePassed = true
wholeBuildIdentityPreserved = true
legacyFallbackUsed = false
perEncoderRollbackUsed = false
perKernelRollbackUsed = false
```

R10 source receipt, admission receipt 일부, promotion intent, pointer 파일만으로는 R11 installed acceptance를 시작할 수 없다.
# 7. Expected Installation Manifest

Canonical schema ID:

```text
tdt.resample-runtime.expected-installation-manifest.r11.v1
```

Manifest는 immutable released package bytes와 R10 child artifact set에서 생성한다. Manifest 파일 자체는 closure root 계산에서 제외하며, manifest SHA-256는 R10 final release의 child artifact digest 또는 immutable release metadata에 의해 검증된다.

필수 필드:

```text
schemaVersion
schemaId
buildId
packageContentId
releaseProfileId
r10FinalReleaseReceiptSha256
r9FinalPhysicalReceiptSha256
fullProductReceiptSha256
activeGraphDigest
runtimeAssetManifestDigest
generatedWgslManifestDigest
plannerId
kernelId
parameterAbiId
coordinateConventionId
axialFieldId
surfaceContractId
files[] { relativePath, role, loadMode, sizeBytes, sha256 }
treeRootSha256
manifestSha256
```

`relativePath`는 UTF-8 NFC, `/` separator, no leading slash, no `..`, no duplicate로 canonicalize한다. Symlink 또는 junction이 package root 밖을 가리키면 실패다.
# 8. Installed Closure

최소 closure:

- Electron executable와 app.asar 또는 동등 package container;
- app.asar.unpacked의 executable JS/MJS/CJS;
- renderer entry와 chunk closure;
- all worker scripts and child-worker closure;
- all WASM and pthread support files;
- all native addons and dependent runtime DLL identity;
- R8 canonical product/reference/validation WGSL;
- R8 source-prep/residual/finalization WGSL;
- generated WGSL manifest;
- Runtime Asset Manifest;
- Active Graph receipt or embedded digest;
- package metadata that selects the runtime entrypoint;

아이콘·문서와 같은 비실행 리소스를 제외할 수 있으나, packageContentId가 whole-build tree digest라면 해당 tree의 정의와 정확히 일치해야 한다. 실행 가능한 extra file은 0이어야 한다.
# 9. Startup Attestation Order

```text
1. exclusive startup attestation lock
2. previous unclean-session marker inspect
3. R10 final receipt and active pointer v3 verify
4. executing build/package identity capture
5. expected installation manifest verify
6. installed runtime closure full SHA-256 rehash
7. no mixed build / no extra executable closure
8. hardware WebGPU device authority acquire
9. deterministic startup canary
10. session admission token issue
11. Preview and Export admission open
```

Step 3~7 중 하나라도 실패하면 GPU canary를 실행하지 않는다. Step 9가 실패하면 session token을 만들지 않는다.
# 10. Startup Canary Fixture Set

Canonical fixture set ID:

```text
tdt.resample-runtime.startup-canary-fixtures.r11.v1
```

- **R4 constant DC:** 13×11 linear premultiplied constant RGBA, output 9×7, policy neutral.
- **R4 fractional phase impulse:** 17×13 to 11×9, non-integer phase sweep.
- **R6 anisotropic diagonal:** 31×29 to 13×11, coherent axial field and R6 support.
- **Border corner:** 7×5 to 3×2, logical-distance clamp-extension.
- **Alpha edge:** 19×17 to 8×7, straight sRGB source with transparent hidden-RGB attack.
- **Neutral policy identity:** policy disabled and initialized vec4(0,1,1,1).
- **Residual disabled identity:** Preview and Export lowpass raw16 equality before finalization.
- **Counter positive control:** validation-only controlled fault increments exactly one named counter.

모든 fixture는 64×64 이하이며 사용자 파일을 읽지 않는다. 정상 fixture 뒤 counter 32 words는 전부 0이어야 하고, positive control 뒤 지정 counter만 예상값이어야 한다.
# 11. Comparison Semantics

Product↔Direct Reference:

```text
rgba16float texture copy
→ row padding removal
→ raw binary16 word exact comparison
→ mismatch count = 0
```

GPU↔Independent Oracle:

```text
binary64 oracle
→ independent IEEE-754 binary16 rounding
→ channel-wise ULP comparison
→ default maximum = 1 binary16 ULP
```

두 비교는 서로 대체할 수 없다. Product/reference exact가 PASS해도 oracle ULP가 실패하면 canary는 실패다.
# 12. Runtime Admission Token

Schema ID: `tdt.resample-runtime.session-attestation.r11.v1`.

필수 필드:

```text
sessionId
bootId
buildId
packageContentId
releaseProfileId
pointerGeneration
pointerRawSha256
r10FinalReceiptSha256
installedAttestationReceiptSha256
startupCanaryReceiptSha256
deviceEpoch
adapterIdentityDigest
driverIdentityDigest
kernelId
plannerId
parameterAbiId
activeGraphDigest
issuedAtMonotonicNs
revoked
tokenSha256
```

Preview·Export entrypoint는 valid token을 명시적으로 받아야 한다. 전역 변수나 implicit current session으로 우회하지 않는다.
# 13. Lazy Asset Admission

Startup full closure 검증 이후에도 worker, WASM, native addon, WGSL을 처음 로드하기 직전에 path·size·SHA-256를 expected manifest와 다시 비교한다. 이미 로드된 코드가 아니라 disk에서 늦게 읽는 executable asset만 해당한다. Mismatch는 현재 job을 시작하지 않고 즉시 quarantine한다.
# 14. Post-release Canary Schedule

필수 실행 시점:

- every cold application start;
- after every successful device recreation;
- after GPU process restart;
- after 32 completed canonical resample jobs;
- 24 hours after the last successful canary, whichever occurs first;
- before clearing a quarantine through explicit diagnostic recheck;

Periodic canary는 idle boundary에서만 시작하며 실행 중 사용자 job을 중단하지 않는다. 단, 이미 correctness fault가 관측되면 새 job admission을 즉시 닫는다.
# 15. Drift Event Ledger

Schema ID: `tdt.resample-runtime.drift-ledger.r11.v1`.

Ledger는 local append-only JSONL 또는 동등한 canonical record sequence이며 각 record는 `sequence`, `previousRecordSha256`, `recordSha256`를 가진다.

Admitted event types:

- `STARTUP_ATTESTATION`
- `STARTUP_CANARY`
- `SESSION_ADMITTED`
- `JOB_ADMITTED`
- `JOB_COMPLETED`
- `PERIODIC_CANARY`
- `ARTIFACT_DRIFT`
- `VALIDATION_COUNTER_NONZERO`
- `FAULT_SENTINEL`
- `NONFINITE_OUTPUT`
- `DEVICE_LOST`
- `DEVICE_RECOVERED`
- `RENDERER_GONE`
- `GPU_PROCESS_GONE`
- `RESOURCE_BASELINE_DRIFT`
- `PERFORMANCE_DRIFT`
- `QUARANTINE_ENTERED`
- `ROLLBACK_RECOMMENDATION_CREATED`
- `CLEAN_SHUTDOWN`
- `UNCLEAN_SHUTDOWN`
# 16. Threshold Policy

Canonical policy ID: `tdt.resample-runtime.post-release-guard.r11.v1`.

```text
artifact identity mismatch                = immediate quarantine
startup or periodic canary failure         = immediate quarantine
validation counter nonzero                 = result invalid + immediate quarantine
fault sentinel or nonfinite output         = result invalid + immediate quarantine
device loss count in one session >= 2      = quarantine
device loss count in rolling 24h >= 3      = quarantine
renderer crash in rolling 10 sessions >= 3 = quarantine
GPU process crash in rolling 10 sessions >= 2 = quarantine
resource baseline failure twice consecutively = quarantine
performance median > 2× R9 baseline for 3 consecutive canaries = DEGRADED + recommendation eligible
```

Performance drift 단독으로 결과를 invalid 처리하지 않는다. Correctness·resource conservation이 PASS인 경우 `DEGRADED`로만 기록하고 3회 연속 breach에서 rollback recommendation을 허용한다.
# 17. Device-loss Recovery

첫 device loss에서는 현재 token을 즉시 revoke하고 pending job을 stable error로 종료한다. Old epoch texture, buffer, pipeline, bind group, query set, staging buffer를 dispose한 뒤 device epoch를 증가시키고 새 device authority를 만든다. 새 epoch에서 post-loss canary가 PASS해야 새 token을 발급한다.

Post-loss canary가 실패하거나 threshold가 충족되면 readmission하지 않고 quarantine한다. CPU fallback, software adapter fallback, legacy shader fallback은 허용하지 않는다.
# 18. Quarantine

Schema ID: `tdt.resample-runtime.quarantine.r11.v1`.

Quarantine receipt 필수 필드:

```text
quarantineId
buildId
packageContentId
pointerGeneration
deviceEpoch
reasonCode
triggerEventSha256
driftLedgerHeadSha256
invalidatedJobIds
previewBlocked
exportBlocked
fallbackUsed
operatorActionRequired
enteredAtMonotonicNs
receiptSha256
```

Quarantine는 restart 후에도 유지한다. 시간 경과, 앱 재실행, cache clear로 자동 해제하지 않는다. PackageContentId가 바뀌거나 명시적 diagnostic recheck와 새 canary receipt가 있어야만 별도 해제 절차를 시작할 수 있다.
# 19. Automatic Rollback Recommendation

자동이라는 말은 **권고 artifact의 자동 생성**을 뜻하며 pointer 자동 변경을 뜻하지 않는다.

Schema ID: `tdt.resample-runtime.rollback-recommendation.r11.v1`.

```text
recommendationId
failedBuildId
failedPackageContentId
failureReasonCodes
failureEvidenceDigests
currentPointerRawSha256
currentPointerGeneration
targetBuildId
targetPackageContentId
targetQualificationReceipts
targetPackageRegistryEntrySha256
expectedCasBeforeSha256
expectedCasGeneration
executionAuthority = TDT-RESAMPLE-RUNTIME-01-R10
operatorApprovalRequired = true
pointerMutationPerformed = false
receiptSha256
```

R10 pointer의 previous whole-build target이 없거나 package registry에서 찾을 수 없으면 `targetStatus = NO_QUALIFIED_TARGET`으로 기록한다. 다른 package를 추정으로 선택하지 않는다.
# 20. Privacy and Evidence Boundary

허용:

- build/package/pointer/device/kernel identity;
- fixture ID와 canary result;
- validation counter values;
- duration and resource cardinality;
- dimension bucket, stage count, R4/R6 profile;
- stable error code and crash reason;

금지:

- 사용자 이미지 bytes 또는 thumbnail;
- 사용자 파일명과 absolute path;
- 사용자 이미지 pixel hash;
- EXIF 또는 사용자 콘텐츠 metadata;
- 원격 전송을 위한 device/user identifier;
- 원본의 정확한 dimensions가 식별자로 사용되는 기록;

R11 evidence는 local-only가 기본이며 network telemetry는 이 명세 범위에서 0이다.
# 21. Required Artifact Set

```text
artifacts/resample-runtime-01-r11/<runId>/
  R11_RUN_MANIFEST.json
  R11_R10_RELEASE_ADMISSION_RECEIPT.json
  R11_EXPECTED_INSTALLATION_MANIFEST.json
  R11_POINTER_ATTESTATION_RECEIPT.json
  R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json
  R11_DEVICE_AUTHORITY_RECEIPT.json
  R11_STARTUP_CANARY_RECEIPT.json
  R11_SESSION_ATTESTATION_RECEIPT.json
  R11_DRIFT_LEDGER.jsonl
  R11_DRIFT_LEDGER_HEAD.json
  R11_DEVICE_LOSS_RECOVERY_RECEIPT.json
  R11_QUARANTINE_RECEIPT.json
  R11_ROLLBACK_RECOMMENDATION_RECEIPT.json
  R11_INSTALLED_GATE_RECEIPT.json
  TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json
```
# 22. Final Installed Receipt

필수 필드:

```text
schemaVersion
schemaId
patchId
runId
state
buildId
packageContentId
releaseProfileId
pointerGeneration
pointerRawSha256
r10FinalReleaseReceiptSha256
expectedInstallationManifestSha256
installedAttestationReceiptSha256
startupCanaryReceiptSha256
sessionAttestationReceiptSha256
adapterIdentityDigest
driverIdentityDigest
deviceEpoch
kernelId
plannerId
parameterAbiId
activeGraphDigest
artifactDriftCount
canaryFailureCount
validationFaultCount
deviceLossCount
rendererCrashCount
gpuProcessCrashCount
quarantined
rollbackRecommendationSha256
sourcePass
installedPass
pending
deferred
skipped
fail
privacyViolations
networkTelemetryCount
childArtifacts
receiptSha256
```

정상 admission 최종값:

```text
state = RESAMPLE_RUNTIME_R11_INSTALLED_RUNTIME_ATTESTATION_AND_QUARANTINE_SEALED
quarantined = false
artifactDriftCount = 0
canaryFailureCount = 0
validationFaultCount = 0
sourcePass = 148
installedPass = 228
pending = 0
deferred = 0
skipped = 0
fail = 0
privacyViolations = 0
networkTelemetryCount = 0
```

Quarantine path에서는 정상 admission final receipt 대신 immutable quarantine receipt와 rollback recommendation receipt를 봉인한다. Quarantine을 PASS로 위장하지 않는다.
# 23. Stable Error Codes

```text
E_R11_R10_FINAL_RECEIPT_MISSING
E_R11_R10_FINAL_STATE_MISMATCH
E_R11_POINTER_SCHEMA_INVALID
E_R11_POINTER_SELF_HASH_MISMATCH
E_R11_POINTER_RELEASE_MISMATCH
E_R11_EXPECTED_MANIFEST_MISSING
E_R11_EXPECTED_MANIFEST_DIGEST_MISMATCH
E_R11_INSTALLED_FILE_MISSING
E_R11_INSTALLED_FILE_HASH_MISMATCH
E_R11_EXTRA_EXECUTABLE_FILE
E_R11_SYMLINK_ESCAPE
E_R11_MIXED_BUILD_ASSET
E_R11_INSTALLED_ARTIFACT_DRIFT
E_R11_HARDWARE_GPU_REQUIRED
E_R11_SOFTWARE_ADAPTER_FORBIDDEN
E_R11_STARTUP_CANARY_FAILED
E_R11_PRODUCT_REFERENCE_MISMATCH
E_R11_ORACLE_ULP_EXCEEDED
E_R11_VALIDATION_COUNTER_NONZERO
E_R11_COUNTER_POSITIVE_CONTROL_FAILED
E_R11_FAULT_SENTINEL_OBSERVED
E_R11_NONFINITE_OUTPUT
E_R11_SESSION_ATTESTATION_REQUIRED
E_R11_SESSION_TOKEN_STALE
E_R11_SESSION_TOKEN_REVOKED
E_R11_LAZY_ASSET_DRIFT
E_R11_DEVICE_LOST
E_R11_POST_LOSS_CANARY_FAILED
E_R11_DEVICE_LOSS_THRESHOLD
E_R11_RENDERER_CRASH_THRESHOLD
E_R11_GPU_PROCESS_CRASH_THRESHOLD
E_R11_RESOURCE_LEAK_THRESHOLD
E_R11_RUNTIME_QUARANTINED
E_R11_QUARANTINE_CLEAR_FORBIDDEN
E_R11_ROLLBACK_TARGET_MISSING
E_R11_ROLLBACK_RECOMMENDATION_INVALID
E_R11_POINTER_MUTATION_FORBIDDEN
E_R11_USER_CONTENT_IN_EVIDENCE
E_R11_NETWORK_TELEMETRY_FORBIDDEN
E_R11_FINAL_RECEIPT_INCOMPLETE
E_R11_SOURCE_CANNOT_ADMIT_RUNTIME
```
# 24. Required Implementation Layout

```text
app/features/resample-runtime/r11/
  r10-release-admission.mjs
  expected-installation-manifest.mjs
  installed-artifact-attestor.mjs
  startup-attestation-controller.mjs
  startup-canary-runtime.mjs
  session-attestation-token.mjs
  lazy-asset-admission.mjs
  drift-ledger.mjs
  crash-monitor.mjs
  device-loss-guard.mjs
  quarantine-store.mjs
  rollback-recommendation.mjs
  r11-contract.mjs

tools/resample-runtime-01-r11/
  generate-expected-installation-manifest.mjs
  verify-source-contract.mjs
  verify-parent-freeze.mjs
  verify-privacy-boundary.mjs
  verify-negative-controls.mjs
  verify-installed-attestation.mjs
  verify-startup-canary.mjs
  verify-session-token.mjs
  verify-drift-ledger.mjs
  verify-quarantine.mjs
  verify-rollback-recommendation.mjs
  finalize-source.mjs
  finalize-installed.mjs
  gate.mjs
```
# 25. Required Commands

Source-harness commands:

```bash
npm run generate:resample-runtime-01-r11:manifest
npm run verify:resample-runtime-01-r11:source
npm run verify:resample-runtime-01-r11:parent
npm run verify:resample-runtime-01-r11:privacy
npm run verify:resample-runtime-01-r11:negative
npm run finalize:resample-runtime-01-r11:source
npm run verify:resample-runtime-01-r11
```

Packaged Windows installed-runtime commands:

```powershell
$env:DADUM_R11_RUN_ID = "r11-installed-001"
npm run generate:resample-runtime-01-r11:expected-manifest
npm run run:resample-runtime-01-r11:installed
npm run verify:resample-runtime-01-r11:installed
npm run finalize:resample-runtime-01-r11:installed
```
# 26. Gate Semantics

- `PASS`: 해당 증거가 실제 artifact와 실행 결과로 존재하며 재검증됐다.
- `PENDING`: 필수 predecessor 또는 packaged physical execution이 아직 없다.
- `DEFERRED`: R11 final acceptance에서는 허용되지 않는다.
- `SKIPPED`: R11 final acceptance에서는 허용되지 않는다.
- `FAIL`: stable error code와 evidence digest를 가진 terminal failure다.

Source-harness state에서는 148 source gate만 PASS하고 228 installed gate는 PENDING이어야 한다. Installed gate를 mock, fixture metadata, source scan만으로 PASS 처리하면 source gate 자체가 FAIL한다.
# 27. SOURCE_MANDATORY Gates

## 27.1 Parent Freeze and Current State

### R11-S001 `PARENT_BUNDLE_PRESENT`

- **Requirement:** parent bundle present.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S002 `PARENT_BUNDLE_SHA256_EXACT`

- **Requirement:** parent bundle sha256 exact.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S003 `R10_SPEC_PRESENT`

- **Requirement:** r10 spec present.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S004 `R10_SPEC_SHA256_EXACT`

- **Requirement:** r10 spec sha256 exact.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S005 `R10_SOURCE_RECEIPT_PRESENT`

- **Requirement:** r10 source receipt present.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S006 `R10_SOURCE_RECEIPT_SHA256_EXACT`

- **Requirement:** r10 source receipt sha256 exact.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S007 `R10_SOURCE_STATE_EXACT`

- **Requirement:** r10 source state exact.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S008 `R10_SOURCE_PASS_129`

- **Requirement:** r10 source pass 129.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S009 `R10_RELEASE_PENDING_202`

- **Requirement:** r10 release pending 202.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S010 `R10_FAIL_ZERO`

- **Requirement:** r10 fail zero.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S011 `R10_POINTER_NOT_MUTATED`

- **Requirement:** r10 pointer not mutated.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S012 `POINTER_MIRRORS_PRESENT`

- **Requirement:** pointer mirrors present.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S013 `POINTER_MIRRORS_BYTE_EQUAL`

- **Requirement:** pointer mirrors byte equal.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S014 `POINTER_RAW_SHA256_EXACT`

- **Requirement:** pointer raw sha256 exact.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S015 `POINTER_SCHEMA_V2_READABLE`

- **Requirement:** pointer schema v2 readable.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S016 `POINTER_ACTIVE_NULL_RECORDED`

- **Requirement:** pointer active null recorded.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S017 `R10_FINAL_RELEASE_ABSENT_RECORDED`

- **Requirement:** r10 final release absent recorded.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S018 `R11_REQUIRED_PREDECESSOR_DECLARED`

- **Requirement:** r11 required predecessor declared.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S019 `R11_SCOPE_EXCLUDES_POINTER_WRITE`

- **Requirement:** r11 scope excludes pointer write.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S020 `R11_PARENT_FREEZE_MANIFEST_SEALED`

- **Requirement:** r11 parent freeze manifest sealed.
- **Assertion:** Parent facts and predecessor evidence are immutable and exactly reproduced.
- **Evidence:** `R11_PARENT_FREEZE_RECEIPT.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_PARENT_FREEZE_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

## 27.2 Schema Identities and Policy Constants

### R11-S021 `INSTALLED_ATTESTATION_SCHEMA_ID`

- **Requirement:** installed attestation schema id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S022 `EXPECTED_MANIFEST_SCHEMA_ID`

- **Requirement:** expected manifest schema id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S023 `STARTUP_CANARY_SCHEMA_ID`

- **Requirement:** startup canary schema id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S024 `SESSION_TOKEN_SCHEMA_ID`

- **Requirement:** session token schema id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S025 `DRIFT_LEDGER_SCHEMA_ID`

- **Requirement:** drift ledger schema id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S026 `QUARANTINE_SCHEMA_ID`

- **Requirement:** quarantine schema id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S027 `ROLLBACK_RECOMMENDATION_SCHEMA_ID`

- **Requirement:** rollback recommendation schema id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S028 `FINAL_RECEIPT_SCHEMA_ID`

- **Requirement:** final receipt schema id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S029 `RUNTIME_ADMISSION_TOKEN_VERSION`

- **Requirement:** runtime admission token version.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S030 `CANARY_FIXTURE_SET_ID`

- **Requirement:** canary fixture set id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S031 `POLICY_PROFILE_ID`

- **Requirement:** policy profile id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S032 `POINTER_AUTHORITY_ID`

- **Requirement:** pointer authority id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S033 `RELEASE_RECEIPT_AUTHORITY_ID`

- **Requirement:** release receipt authority id.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S034 `KERNEL_ID_PINNED`

- **Requirement:** kernel id pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S035 `PLANNER_ID_PINNED`

- **Requirement:** planner id pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S036 `ABI_ID_PINNED`

- **Requirement:** abi id pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S037 `COORDINATE_CONVENTION_PINNED`

- **Requirement:** coordinate convention pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S038 `AXIAL_FIELD_ID_PINNED`

- **Requirement:** axial field id pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S039 `BORDER_CONTRACT_PINNED`

- **Requirement:** border contract pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S040 `SURFACE_CONTRACT_PINNED`

- **Requirement:** surface contract pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S041 `QUARANTINE_THRESHOLDS_PINNED`

- **Requirement:** quarantine thresholds pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S042 `PERFORMANCE_DRIFT_POLICY_PINNED`

- **Requirement:** performance drift policy pinned.
- **Assertion:** All R11 identities, versions, thresholds, and inherited runtime contracts are declared in one source authority.
- **Evidence:** `R11_CONTRACT_MANIFEST.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CONTRACT_IDENTITY_MISMATCH`; this gate cannot be converted to DEFERRED or SKIPPED.

## 27.3 Expected Installation Manifest and Verifier Source

### R11-S043 `EXPECTED_MANIFEST_GENERATOR_PRESENT`

- **Requirement:** expected manifest generator present.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S044 `EXPECTED_MANIFEST_VERIFIER_PRESENT`

- **Requirement:** expected manifest verifier present.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S045 `MANIFEST_EXCLUDES_SELF_REFERENCE`

- **Requirement:** manifest excludes self reference.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S046 `MANIFEST_RELATIVE_PATHS_ONLY`

- **Requirement:** manifest relative paths only.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S047 `MANIFEST_PATH_NORMALIZATION`

- **Requirement:** manifest path normalization.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S048 `MANIFEST_DUPLICATE_PATH_REJECTED`

- **Requirement:** manifest duplicate path rejected.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S049 `MANIFEST_FILE_SIZE_RECORDED`

- **Requirement:** manifest file size recorded.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S050 `MANIFEST_FILE_SHA256_RECORDED`

- **Requirement:** manifest file sha256 recorded.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S051 `MANIFEST_ROLE_RECORDED`

- **Requirement:** manifest role recorded.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S052 `MANIFEST_LOAD_MODE_RECORDED`

- **Requirement:** manifest load mode recorded.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S053 `MANIFEST_TREE_ROOT_RECORDED`

- **Requirement:** manifest tree root recorded.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S054 `MANIFEST_SELF_SHA256_RECORDED`

- **Requirement:** manifest self sha256 recorded.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S055 `R10_CHILD_ARTIFACT_BINDING_SUPPORTED`

- **Requirement:** r10 child artifact binding supported.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S056 `PACKAGE_CONTENT_ID_BINDING_SUPPORTED`

- **Requirement:** package content id binding supported.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S057 `APP_ASAR_COVERAGE`

- **Requirement:** app asar coverage.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S058 `UNPACKED_RUNTIME_COVERAGE`

- **Requirement:** unpacked runtime coverage.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S059 `WORKER_CLOSURE_COVERAGE`

- **Requirement:** worker closure coverage.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S060 `WASM_CLOSURE_COVERAGE`

- **Requirement:** wasm closure coverage.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S061 `NATIVE_ADDON_CLOSURE_COVERAGE`

- **Requirement:** native addon closure coverage.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S062 `WGSL_CLOSURE_COVERAGE`

- **Requirement:** wgsl closure coverage.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S063 `GENERATED_MANIFEST_COVERAGE`

- **Requirement:** generated manifest coverage.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S064 `ACTIVE_GRAPH_COVERAGE`

- **Requirement:** active graph coverage.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S065 `MISSING_FILE_FAIL_CLOSED`

- **Requirement:** missing file fail closed.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S066 `EXTRA_EXECUTABLE_FILE_FAIL_CLOSED`

- **Requirement:** extra executable file fail closed.
- **Assertion:** The expected installed runtime closure can be generated from immutable released bytes and verified without trusting mutable metadata.
- **Evidence:** `R11_EXPECTED_INSTALLATION_MANIFEST_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_EXPECTED_MANIFEST_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

## 27.4 Startup Attestation State Machine

### R11-S067 `STARTUP_LOCK_IMPLEMENTED`

- **Requirement:** startup lock implemented.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S068 `STARTUP_LOCK_EXCLUSIVE`

- **Requirement:** startup lock exclusive.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S069 `STALE_LOCK_NOT_AUTO_DELETED`

- **Requirement:** stale lock not auto deleted.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S070 `BOOT_ID_GENERATED`

- **Requirement:** boot id generated.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S071 `UNCLEAN_SESSION_MARKER_READ`

- **Requirement:** unclean session marker read.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S072 `R10_FINAL_RECEIPT_ADMISSION_FIRST`

- **Requirement:** r10 final receipt admission first.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S073 `POINTER_READ_BEFORE_PACKAGE_HASH`

- **Requirement:** pointer read before package hash.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S074 `POINTER_SELF_HASH_VERIFICATION`

- **Requirement:** pointer self hash verification.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S075 `POINTER_GENERATION_CAPTURE`

- **Requirement:** pointer generation capture.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S076 `ACTIVE_BUILD_CAPTURE`

- **Requirement:** active build capture.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S077 `ACTIVE_PACKAGE_CAPTURE`

- **Requirement:** active package capture.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S078 `EXECUTING_PACKAGE_ID_CAPTURE`

- **Requirement:** executing package id capture.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S079 `PACKAGE_POINTER_EQUALITY_CHECK`

- **Requirement:** package pointer equality check.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S080 `FULL_CLOSURE_HASH_BEFORE_CANARY`

- **Requirement:** full closure hash before canary.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S081 `ARTIFACT_DRIFT_STOPS_CANARY`

- **Requirement:** artifact drift stops canary.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S082 `DEVICE_AUTHORITY_AFTER_ARTIFACT_PASS`

- **Requirement:** device authority after artifact pass.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S083 `CANARY_BEFORE_USER_JOB`

- **Requirement:** canary before user job.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S084 `SESSION_TOKEN_AFTER_CANARY_ONLY`

- **Requirement:** session token after canary only.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S085 `TOKEN_REQUIRED_BY_PREVIEW`

- **Requirement:** token required by preview.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S086 `TOKEN_REQUIRED_BY_EXPORT`

- **Requirement:** token required by export.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S087 `TOKEN_REVOCATION_IMPLEMENTED`

- **Requirement:** token revocation implemented.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S088 `CLEAN_SHUTDOWN_SEAL_IMPLEMENTED`

- **Requirement:** clean shutdown seal implemented.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S089 `STARTUP_FAILURE_STABLE_RECEIPT`

- **Requirement:** startup failure stable receipt.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S090 `STARTUP_REENTRY_FORBIDDEN`

- **Requirement:** startup reentry forbidden.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S091 `SOURCE_MODE_CANNOT_ADMIT_RUNTIME`

- **Requirement:** source mode cannot admit runtime.
- **Assertion:** The startup state machine admits no Preview or Export job before release identity, installed bytes, device authority, and canary success are all proven.
- **Evidence:** `R11_STARTUP_STATE_MACHINE_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_STARTUP_SEQUENCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

## 27.5 Post-release Canary Harness Source

### R11-S092 `CANARY_USES_PACKAGED_RUNTIME`

- **Requirement:** canary uses packaged runtime.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S093 `CANARY_NO_SOURCE_TREE_IMPORT`

- **Requirement:** canary no source tree import.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S094 `CANARY_NO_DEV_SERVER`

- **Requirement:** canary no dev server.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S095 `CANARY_NO_USER_IMAGE`

- **Requirement:** canary no user image.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S096 `CANARY_FIXTURES_DETERMINISTIC`

- **Requirement:** canary fixtures deterministic.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S097 `CANARY_R4_CONSTANT_FIXTURE`

- **Requirement:** canary r4 constant fixture.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S098 `CANARY_R4_FRACTIONAL_FIXTURE`

- **Requirement:** canary r4 fractional fixture.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S099 `CANARY_R6_ANISO_FIXTURE`

- **Requirement:** canary r6 aniso fixture.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S100 `CANARY_BORDER_CORNER_FIXTURE`

- **Requirement:** canary border corner fixture.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S101 `CANARY_ALPHA_EDGE_FIXTURE`

- **Requirement:** canary alpha edge fixture.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S102 `CANARY_NEUTRAL_POLICY_FIXTURE`

- **Requirement:** canary neutral policy fixture.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S103 `CANARY_RESIDUAL_DISABLED_FIXTURE`

- **Requirement:** canary residual disabled fixture.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S104 `CANARY_COUNTER_POSITIVE_CONTROL`

- **Requirement:** canary counter positive control.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S105 `CANARY_COUNTER_ZERO_CONTROL`

- **Requirement:** canary counter zero control.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S106 `CANARY_PRODUCT_REFERENCE_RAW16`

- **Requirement:** canary product reference raw16.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S107 `CANARY_ORACLE_BINARY16_ULP`

- **Requirement:** canary oracle binary16 ulp.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S108 `CANARY_VALIDATION_COUNTER_READBACK`

- **Requirement:** canary validation counter readback.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S109 `CANARY_NONFINITE_SCAN`

- **Requirement:** canary nonfinite scan.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S110 `CANARY_FAULT_SENTINEL_SCAN`

- **Requirement:** canary fault sentinel scan.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S111 `CANARY_NO_CPU_PRODUCT_FALLBACK`

- **Requirement:** canary no cpu product fallback.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S112 `CANARY_NO_CANVAS_FALLBACK`

- **Requirement:** canary no canvas fallback.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S113 `CANARY_NO_WEBGL_FALLBACK`

- **Requirement:** canary no webgl fallback.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S114 `CANARY_POST_LOSS_ENTRY`

- **Requirement:** canary post loss entry.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S115 `CANARY_PERIODIC_ENTRY`

- **Requirement:** canary periodic entry.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S116 `CANARY_RECEIPT_SCHEMA_VALID`

- **Requirement:** canary receipt schema valid.
- **Assertion:** The source harness contains deterministic packaged-runtime GPU canaries with independent comparison paths and no product fallback.
- **Evidence:** `R11_CANARY_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_CANARY_HARNESS_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

## 27.6 Session Drift Crash Quarantine and Recommendation Source

### R11-S117 `SESSION_IDENTITY_FIELDS_COMPLETE`

- **Requirement:** session identity fields complete.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S118 `SESSION_DEVICE_EPOCH_BOUND`

- **Requirement:** session device epoch bound.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S119 `SESSION_POINTER_GENERATION_BOUND`

- **Requirement:** session pointer generation bound.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S120 `SESSION_PACKAGE_ID_BOUND`

- **Requirement:** session package id bound.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S121 `SESSION_KERNEL_ID_BOUND`

- **Requirement:** session kernel id bound.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S122 `SESSION_PLANNER_ID_BOUND`

- **Requirement:** session planner id bound.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S123 `SESSION_ABI_ID_BOUND`

- **Requirement:** session abi id bound.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S124 `SESSION_GRAPH_DIGEST_BOUND`

- **Requirement:** session graph digest bound.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S125 `SESSION_CANARY_DIGEST_BOUND`

- **Requirement:** session canary digest bound.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S126 `LAZY_WORKER_HASH_CHECK`

- **Requirement:** lazy worker hash check.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S127 `LAZY_WASM_HASH_CHECK`

- **Requirement:** lazy wasm hash check.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S128 `LAZY_NATIVE_ADDON_HASH_CHECK`

- **Requirement:** lazy native addon hash check.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S129 `LAZY_WGSL_HASH_CHECK`

- **Requirement:** lazy wgsl hash check.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S130 `DRIFT_LEDGER_APPEND_ONLY`

- **Requirement:** drift ledger append only.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S131 `DRIFT_LEDGER_HASH_CHAIN`

- **Requirement:** drift ledger hash chain.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S132 `DRIFT_LEDGER_MONOTONIC_SEQUENCE`

- **Requirement:** drift ledger monotonic sequence.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S133 `DRIFT_EVENT_STABLE_TYPES`

- **Requirement:** drift event stable types.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S134 `CRASH_MARKER_SOURCE`

- **Requirement:** crash marker source.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S135 `RENDERER_GONE_LISTENER_SOURCE`

- **Requirement:** renderer gone listener source.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S136 `GPU_PROCESS_GONE_LISTENER_SOURCE`

- **Requirement:** gpu process gone listener source.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S137 `DEVICE_LOST_LISTENER_SOURCE`

- **Requirement:** device lost listener source.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S138 `RESOURCE_LEDGER_SOURCE`

- **Requirement:** resource ledger source.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S139 `PERIODIC_CANARY_SCHEDULER_SOURCE`

- **Requirement:** periodic canary scheduler source.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S140 `QUARANTINE_PERSISTENCE_SOURCE`

- **Requirement:** quarantine persistence source.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S141 `QUARANTINE_NO_SILENT_CLEAR`

- **Requirement:** quarantine no silent clear.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S142 `QUARANTINE_BLOCKS_PREVIEW`

- **Requirement:** quarantine blocks preview.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S143 `QUARANTINE_BLOCKS_EXPORT`

- **Requirement:** quarantine blocks export.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S144 `ROLLBACK_RECOMMENDATION_SOURCE`

- **Requirement:** rollback recommendation source.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S145 `RECOMMENDATION_R10_ONLY_EXECUTOR`

- **Requirement:** recommendation r10 only executor.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S146 `RECOMMENDATION_NO_TARGET_INVENTION`

- **Requirement:** recommendation no target invention.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S147 `PRIVACY_FIELD_ALLOWLIST`

- **Requirement:** privacy field allowlist.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

### R11-S148 `SOURCE_FINALIZER_PRESENT`

- **Requirement:** source finalizer present.
- **Assertion:** Session identity, lazy-asset checks, drift evidence, crash detection, quarantine persistence, rollback recommendation, and privacy boundaries are implemented as source contracts.
- **Evidence:** `R11_RUNTIME_GUARD_SOURCE_GATE.json` with the exact gate ID and recomputed child digests.
- **Failure:** `E_R11_RUNTIME_GUARD_SOURCE_INVALID`; this gate cannot be converted to DEFERRED or SKIPPED.

# 28. INSTALLED_MANDATORY Gates

## 28.1 R10 Final Release Admission

### R11-P001 `R10_FINAL_RECEIPT_PRESENT`

- **Requirement:** r10 final receipt present.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P002 `R10_FINAL_RECEIPT_SHA256_VALID`

- **Requirement:** r10 final receipt sha256 valid.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P003 `R10_FINAL_RECEIPT_SCHEMA_VALID`

- **Requirement:** r10 final receipt schema valid.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P004 `R10_FINAL_STATE_EXACT`

- **Requirement:** r10 final state exact.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P005 `R10_SOURCE_PASS_129`

- **Requirement:** r10 source pass 129.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P006 `R10_RELEASE_PASS_202`

- **Requirement:** r10 release pass 202.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P007 `R10_PENDING_ZERO`

- **Requirement:** r10 pending zero.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P008 `R10_DEFERRED_ZERO`

- **Requirement:** r10 deferred zero.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P009 `R10_SKIPPED_ZERO`

- **Requirement:** r10 skipped zero.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P010 `R10_FAIL_ZERO`

- **Requirement:** r10 fail zero.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P011 `R10_CANDIDATE_BUILD_ID_PRESENT`

- **Requirement:** r10 candidate build id present.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P012 `R10_CANDIDATE_PACKAGE_ID_PRESENT`

- **Requirement:** r10 candidate package id present.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P013 `R10_PREVIOUS_BUILD_ID_PRESENT`

- **Requirement:** r10 previous build id present.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P014 `R10_PREVIOUS_PACKAGE_ID_PRESENT`

- **Requirement:** r10 previous package id present.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P015 `R10_POINTER_GENERATION_PRESENT`

- **Requirement:** r10 pointer generation present.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P016 `R10_POINTER_AFTER_REPROMOTION_PRESENT`

- **Requirement:** r10 pointer after repromotion present.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P017 `R10_PROMOTION_SMOKE_TRUE`

- **Requirement:** r10 promotion smoke true.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P018 `R10_ROLLBACK_DRILL_TRUE`

- **Requirement:** r10 rollback drill true.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P019 `R10_REPROMOTION_SMOKE_TRUE`

- **Requirement:** r10 repromotion smoke true.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P020 `R10_WHOLE_BUILD_IDENTITY_TRUE`

- **Requirement:** r10 whole build identity true.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P021 `R10_LEGACY_FALLBACK_FALSE`

- **Requirement:** r10 legacy fallback false.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P022 `R10_PER_ENCODER_ROLLBACK_FALSE`

- **Requirement:** r10 per encoder rollback false.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P023 `R10_PER_KERNEL_ROLLBACK_FALSE`

- **Requirement:** r10 per kernel rollback false.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

### R11-P024 `R10_CHILD_ARTIFACTS_COMPLETE`

- **Requirement:** r10 child artifacts complete.
- **Assertion:** A completed R10 production release, not the R10 source receipt, is admitted as the sole installed-runtime predecessor.
- **Evidence:** `R11_R10_RELEASE_ADMISSION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_R10_RELEASE_NOT_QUALIFIED`; installed acceptance stops and no runtime token is admitted.

## 28.2 Installed Package and Pointer Attestation

### R11-P025 `POINTER_SCHEMA_V3`

- **Requirement:** pointer schema v3.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P026 `POINTER_ID_EXACT`

- **Requirement:** pointer id exact.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P027 `POINTER_RAW_SHA256_RECOMPUTED`

- **Requirement:** pointer raw sha256 recomputed.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P028 `POINTER_SELF_HASH_RECOMPUTED`

- **Requirement:** pointer self hash recomputed.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P029 `POINTER_GENERATION_MATCH_R10`

- **Requirement:** pointer generation match r10.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P030 `POINTER_ACTIVE_BUILD_MATCH_R10`

- **Requirement:** pointer active build match r10.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P031 `POINTER_ACTIVE_PACKAGE_MATCH_R10`

- **Requirement:** pointer active package match r10.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P032 `POINTER_RELEASE_PROFILE_MATCH_R10`

- **Requirement:** pointer release profile match r10.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P033 `POINTER_QUALIFICATION_SET_MATCH_R10`

- **Requirement:** pointer qualification set match r10.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P034 `EXECUTABLE_PATH_CANONICAL`

- **Requirement:** executable path canonical.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P035 `RESOURCES_PATH_CANONICAL`

- **Requirement:** resources path canonical.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P036 `EXPECTED_MANIFEST_PRESENT`

- **Requirement:** expected manifest present.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P037 `EXPECTED_MANIFEST_DIGEST_MATCH_R10_CHILD`

- **Requirement:** expected manifest digest match r10 child.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P038 `EXPECTED_MANIFEST_SCHEMA_VALID`

- **Requirement:** expected manifest schema valid.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P039 `EXPECTED_MANIFEST_BUILD_MATCH`

- **Requirement:** expected manifest build match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P040 `EXPECTED_MANIFEST_PACKAGE_MATCH`

- **Requirement:** expected manifest package match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P041 `EXPECTED_MANIFEST_PROFILE_MATCH`

- **Requirement:** expected manifest profile match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P042 `EXPECTED_MANIFEST_TREE_ROOT_VALID`

- **Requirement:** expected manifest tree root valid.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P043 `EXPECTED_MANIFEST_FILE_COUNT_NONZERO`

- **Requirement:** expected manifest file count nonzero.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P044 `INSTALLED_FILE_SET_COMPLETE`

- **Requirement:** installed file set complete.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P045 `INSTALLED_FILE_SET_NO_DUPLICATE`

- **Requirement:** installed file set no duplicate.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P046 `INSTALLED_FILE_SET_NO_TRAVERSAL`

- **Requirement:** installed file set no traversal.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P047 `INSTALLED_FILE_SET_NO_SYMLINK_ESCAPE`

- **Requirement:** installed file set no symlink escape.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P048 `APP_ASAR_SHA256_MATCH`

- **Requirement:** app asar sha256 match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P049 `UNPACKED_JS_SHA256_MATCH`

- **Requirement:** unpacked js sha256 match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P050 `WORKER_SHA256_MATCH`

- **Requirement:** worker sha256 match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P051 `WASM_SHA256_MATCH`

- **Requirement:** wasm sha256 match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P052 `NATIVE_ADDON_SHA256_MATCH`

- **Requirement:** native addon sha256 match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P053 `WGSL_SHA256_MATCH`

- **Requirement:** wgsl sha256 match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P054 `GENERATED_WGSL_MANIFEST_MATCH`

- **Requirement:** generated wgsl manifest match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P055 `RUNTIME_ASSET_MANIFEST_MATCH`

- **Requirement:** runtime asset manifest match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P056 `ACTIVE_GRAPH_DIGEST_MATCH`

- **Requirement:** active graph digest match.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P057 `PACKAGE_CONTENT_ID_RECOMPUTED`

- **Requirement:** package content id recomputed.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P058 `PACKAGE_CONTENT_ID_MATCH_POINTER`

- **Requirement:** package content id match pointer.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P059 `PACKAGE_CONTENT_ID_MATCH_R10`

- **Requirement:** package content id match r10.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P060 `EXTRA_EXECUTABLE_FILE_ZERO`

- **Requirement:** extra executable file zero.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P061 `MISSING_EXECUTABLE_FILE_ZERO`

- **Requirement:** missing executable file zero.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P062 `MIXED_BUILD_ASSET_ZERO`

- **Requirement:** mixed build asset zero.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P063 `ARTIFACT_DRIFT_ZERO`

- **Requirement:** artifact drift zero.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

### R11-P064 `ATTESTATION_BEFORE_CANARY`

- **Requirement:** attestation before canary.
- **Assertion:** The executing installation is byte-identical to the active whole-build package selected by the R10 pointer before any GPU canary is allowed to run.
- **Evidence:** `R11_INSTALLED_ARTIFACT_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_INSTALLED_ARTIFACT_DRIFT`; installed acceptance stops and no runtime token is admitted.

## 28.3 Startup Canary Physical Execution

### R11-P065 `HARDWARE_WEBGPU_ADAPTER_PRESENT`

- **Requirement:** hardware webgpu adapter present.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P066 `SOFTWARE_ADAPTER_FALSE`

- **Requirement:** software adapter false.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P067 `FALLBACK_ADAPTER_FALSE`

- **Requirement:** fallback adapter false.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P068 `D3D12_BACKEND_RECORDED`

- **Requirement:** d3d12 backend recorded.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P069 `ADAPTER_IDENTITY_RECORDED`

- **Requirement:** adapter identity recorded.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P070 `DRIVER_IDENTITY_RECORDED`

- **Requirement:** driver identity recorded.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P071 `DEVICE_FEATURES_RECORDED`

- **Requirement:** device features recorded.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P072 `TIMESTAMP_QUERY_EXPECTATION_RECORDED`

- **Requirement:** timestamp query expectation recorded.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P073 `DEVICE_EPOCH_INITIALIZED`

- **Requirement:** device epoch initialized.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P074 `R4_PRODUCT_COMPILES`

- **Requirement:** r4 product compiles.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P075 `R6_PRODUCT_COMPILES`

- **Requirement:** r6 product compiles.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P076 `DIRECT_REFERENCE_COMPILES`

- **Requirement:** direct reference compiles.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P077 `VALIDATION_R4_COMPILES`

- **Requirement:** validation r4 compiles.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P078 `VALIDATION_R6_COMPILES`

- **Requirement:** validation r6 compiles.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P079 `SOURCE_PREP_COMPILES`

- **Requirement:** source prep compiles.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P080 `RESIDUAL_COMPILES`

- **Requirement:** residual compiles.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P081 `FINALIZATION_COMPILES`

- **Requirement:** finalization compiles.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P082 `R4_CONSTANT_PRODUCT_REFERENCE_EXACT`

- **Requirement:** r4 constant product reference exact.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P083 `R4_CONSTANT_ORACLE_ULP`

- **Requirement:** r4 constant oracle ulp.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P084 `R4_CONSTANT_DC_PRESERVED`

- **Requirement:** r4 constant dc preserved.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P085 `R4_FRACTIONAL_PRODUCT_REFERENCE_EXACT`

- **Requirement:** r4 fractional product reference exact.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P086 `R4_FRACTIONAL_ORACLE_ULP`

- **Requirement:** r4 fractional oracle ulp.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P087 `R6_ANISO_PRODUCT_REFERENCE_EXACT`

- **Requirement:** r6 aniso product reference exact.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P088 `R6_ANISO_ORACLE_ULP`

- **Requirement:** r6 aniso oracle ulp.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P089 `R6_AXIAL_CONTINUITY_PASS`

- **Requirement:** r6 axial continuity pass.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P090 `BORDER_CORNER_PRODUCT_REFERENCE_EXACT`

- **Requirement:** border corner product reference exact.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P091 `BORDER_CORNER_ORACLE_ULP`

- **Requirement:** border corner oracle ulp.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P092 `BORDER_LOGICAL_DISTANCE_PASS`

- **Requirement:** border logical distance pass.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P093 `ALPHA_EDGE_PRODUCT_REFERENCE_EXACT`

- **Requirement:** alpha edge product reference exact.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P094 `ALPHA_EDGE_ORACLE_ULP`

- **Requirement:** alpha edge oracle ulp.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P095 `ALPHA_ZERO_RGB_ZERO`

- **Requirement:** alpha zero rgb zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P096 `ALPHA_PREMULTIPLIED_INVARIANT`

- **Requirement:** alpha premultiplied invariant.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P097 `NEUTRAL_POLICY_IDENTITY`

- **Requirement:** neutral policy identity.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P098 `RESIDUAL_DISABLED_IDENTITY`

- **Requirement:** residual disabled identity.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P099 `RESIDUAL_ALPHA_UNCHANGED`

- **Requirement:** residual alpha unchanged.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P100 `VALIDATION_ZERO_CONTROL_ALL_ZERO`

- **Requirement:** validation zero control all zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P101 `VALIDATION_POSITIVE_CONTROL_EXPECTED_COUNTER`

- **Requirement:** validation positive control expected counter.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P102 `VALIDATION_POSITIVE_CONTROL_OTHER_ZERO`

- **Requirement:** validation positive control other zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P103 `COUNTER_BUFFER_CLEAR_VERIFIED`

- **Requirement:** counter buffer clear verified.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P104 `NONFINITE_OUTPUT_ZERO`

- **Requirement:** nonfinite output zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P105 `FAULT_SENTINEL_ZERO`

- **Requirement:** fault sentinel zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P106 `INTERMEDIATE_READBACK_ZERO`

- **Requirement:** intermediate readback zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P107 `CPU_PRODUCT_FALLBACK_ZERO`

- **Requirement:** cpu product fallback zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P108 `CANVAS_FALLBACK_ZERO`

- **Requirement:** canvas fallback zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P109 `WEBGL_FALLBACK_ZERO`

- **Requirement:** webgl fallback zero.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

### R11-P110 `STARTUP_CANARY_RECEIPT_SEALED`

- **Requirement:** startup canary receipt sealed.
- **Assertion:** The packaged hardware GPU executes the deterministic canary corpus, exact product/reference checks, independent oracle checks, counter controls, and conservation assertions before runtime admission.
- **Evidence:** `R11_STARTUP_CANARY_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_STARTUP_CANARY_FAILED`; installed acceptance stops and no runtime token is admitted.

## 28.4 Session Token Epoch and Lazy Asset Admission

### R11-P111 `SESSION_TOKEN_ISSUED_AFTER_CANARY`

- **Requirement:** session token issued after canary.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P112 `SESSION_TOKEN_SCHEMA_VALID`

- **Requirement:** session token schema valid.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P113 `SESSION_TOKEN_SELF_HASH_VALID`

- **Requirement:** session token self hash valid.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P114 `SESSION_TOKEN_BUILD_MATCH`

- **Requirement:** session token build match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P115 `SESSION_TOKEN_PACKAGE_MATCH`

- **Requirement:** session token package match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P116 `SESSION_TOKEN_POINTER_GENERATION_MATCH`

- **Requirement:** session token pointer generation match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P117 `SESSION_TOKEN_DEVICE_EPOCH_MATCH`

- **Requirement:** session token device epoch match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P118 `SESSION_TOKEN_ADAPTER_MATCH`

- **Requirement:** session token adapter match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P119 `SESSION_TOKEN_DRIVER_RECORDED`

- **Requirement:** session token driver recorded.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P120 `SESSION_TOKEN_KERNEL_MATCH`

- **Requirement:** session token kernel match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P121 `SESSION_TOKEN_PLANNER_MATCH`

- **Requirement:** session token planner match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P122 `SESSION_TOKEN_ABI_MATCH`

- **Requirement:** session token abi match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P123 `SESSION_TOKEN_GRAPH_MATCH`

- **Requirement:** session token graph match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P124 `SESSION_TOKEN_CANARY_DIGEST_MATCH`

- **Requirement:** session token canary digest match.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P125 `PREVIEW_REQUIRES_VALID_TOKEN`

- **Requirement:** preview requires valid token.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P126 `EXPORT_REQUIRES_VALID_TOKEN`

- **Requirement:** export requires valid token.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P127 `STALE_TOKEN_REJECTED`

- **Requirement:** stale token rejected.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P128 `REVOKED_TOKEN_REJECTED`

- **Requirement:** revoked token rejected.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P129 `DEVICE_EPOCH_CHANGE_REVOKES_TOKEN`

- **Requirement:** device epoch change revokes token.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P130 `POINTER_GENERATION_CHANGE_REVOKES_TOKEN`

- **Requirement:** pointer generation change revokes token.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P131 `LAZY_WORKER_VERIFIED_BEFORE_SPAWN`

- **Requirement:** lazy worker verified before spawn.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P132 `LAZY_WASM_VERIFIED_BEFORE_INSTANTIATE`

- **Requirement:** lazy wasm verified before instantiate.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P133 `LAZY_NATIVE_VERIFIED_BEFORE_LOAD`

- **Requirement:** lazy native verified before load.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P134 `LAZY_WGSL_VERIFIED_BEFORE_MODULE`

- **Requirement:** lazy wgsl verified before module.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P135 `LAZY_ASSET_MISMATCH_QUARANTINES`

- **Requirement:** lazy asset mismatch quarantines.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P136 `SESSION_JOB_SEQUENCE_MONOTONIC`

- **Requirement:** session job sequence monotonic.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P137 `SESSION_CLEAN_SHUTDOWN_SEALED`

- **Requirement:** session clean shutdown sealed.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P138 `SESSION_RECEIPT_SEALED`

- **Requirement:** session receipt sealed.
- **Assertion:** Every canonical job is authorized by a build-, pointer-, device-, kernel-, and canary-bound token, and every lazy executable asset is hashed before first use.
- **Evidence:** `R11_SESSION_ATTESTATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_SESSION_ATTESTATION_INVALID`; installed acceptance stops and no runtime token is admitted.

## 28.5 Drift Crash Residency and Event Ledger

### R11-P139 `EVENT_LEDGER_PRESENT`

- **Requirement:** event ledger present.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P140 `EVENT_LEDGER_SCHEMA_VALID`

- **Requirement:** event ledger schema valid.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P141 `EVENT_LEDGER_SEQUENCE_MONOTONIC`

- **Requirement:** event ledger sequence monotonic.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P142 `EVENT_LEDGER_HASH_CHAIN_VALID`

- **Requirement:** event ledger hash chain valid.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P143 `EVENT_LEDGER_HEAD_SEALED`

- **Requirement:** event ledger head sealed.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P144 `STARTUP_EVENT_RECORDED`

- **Requirement:** startup event recorded.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P145 `CANARY_EVENT_RECORDED`

- **Requirement:** canary event recorded.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P146 `JOB_ADMISSION_EVENT_RECORDED`

- **Requirement:** job admission event recorded.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P147 `JOB_COMPLETION_EVENT_RECORDED`

- **Requirement:** job completion event recorded.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P148 `VALIDATION_FAULT_EVENT_SUPPORTED`

- **Requirement:** validation fault event supported.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P149 `FAULT_SENTINEL_EVENT_SUPPORTED`

- **Requirement:** fault sentinel event supported.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P150 `ARTIFACT_DRIFT_EVENT_SUPPORTED`

- **Requirement:** artifact drift event supported.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P151 `DEVICE_LOSS_EVENT_SUPPORTED`

- **Requirement:** device loss event supported.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P152 `RENDERER_CRASH_EVENT_SUPPORTED`

- **Requirement:** renderer crash event supported.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P153 `GPU_PROCESS_CRASH_EVENT_SUPPORTED`

- **Requirement:** gpu process crash event supported.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P154 `RESOURCE_LEAK_EVENT_SUPPORTED`

- **Requirement:** resource leak event supported.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P155 `PERFORMANCE_DRIFT_EVENT_SUPPORTED`

- **Requirement:** performance drift event supported.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P156 `UNCLEAN_SHUTDOWN_DETECTED`

- **Requirement:** unclean shutdown detected.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P157 `RENDERER_CRASH_ROLLING_WINDOW`

- **Requirement:** renderer crash rolling window.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P158 `GPU_CRASH_ROLLING_WINDOW`

- **Requirement:** gpu crash rolling window.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P159 `DEVICE_LOSS_ROLLING_WINDOW`

- **Requirement:** device loss rolling window.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P160 `LOGICAL_RESOURCE_BASELINE_CAPTURED`

- **Requirement:** logical resource baseline captured.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P161 `RESOURCE_COUNT_RETURNS_BASELINE`

- **Requirement:** resource count returns baseline.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P162 `RESOURCE_BYTES_RETURNS_BASELINE`

- **Requirement:** resource bytes returns baseline.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P163 `PIPELINE_CACHE_CARDINALITY_STABLE`

- **Requirement:** pipeline cache cardinality stable.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P164 `BIND_GROUP_CACHE_CARDINALITY_STABLE`

- **Requirement:** bind group cache cardinality stable.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P165 `PERIODIC_CANARY_AFTER_32_JOBS`

- **Requirement:** periodic canary after 32 jobs.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P166 `PERIODIC_CANARY_AFTER_24_HOURS`

- **Requirement:** periodic canary after 24 hours.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P167 `PERFORMANCE_DRIFT_THREE_STRIKES`

- **Requirement:** performance drift three strikes.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P168 `DRIFT_RECEIPT_SEALED`

- **Requirement:** drift receipt sealed.
- **Assertion:** Runtime correctness, crash, device, resource, and performance drift are recorded in a local append-only hash chain with deterministic rolling-window policy.
- **Evidence:** `R11_DRIFT_LEDGER_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_DRIFT_LEDGER_INVALID`; installed acceptance stops and no runtime token is admitted.

## 28.6 Device-loss Recovery and Quarantine

### R11-P169 `FIRST_DEVICE_LOSS_REVOKES_TOKEN`

- **Requirement:** first device loss revokes token.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P170 `FIRST_DEVICE_LOSS_STOPS_SUBMISSION`

- **Requirement:** first device loss stops submission.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P171 `FIRST_DEVICE_LOSS_REJECTS_PENDING_JOBS`

- **Requirement:** first device loss rejects pending jobs.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P172 `FIRST_DEVICE_LOSS_DISPOSES_OLD_EPOCH`

- **Requirement:** first device loss disposes old epoch.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P173 `FIRST_DEVICE_LOSS_RECREATES_DEVICE`

- **Requirement:** first device loss recreates device.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P174 `FIRST_DEVICE_LOSS_REBUILDS_PIPELINES`

- **Requirement:** first device loss rebuilds pipelines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P175 `FIRST_DEVICE_LOSS_RUNS_POST_LOSS_CANARY`

- **Requirement:** first device loss runs post loss canary.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P176 `POST_LOSS_CANARY_PASS_READMITS`

- **Requirement:** post loss canary pass readmits.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P177 `POST_LOSS_CANARY_FAIL_QUARANTINES`

- **Requirement:** post loss canary fail quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P178 `SECOND_DEVICE_LOSS_SESSION_QUARANTINES`

- **Requirement:** second device loss session quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P179 `THIRD_DEVICE_LOSS_24H_QUARANTINES`

- **Requirement:** third device loss 24h quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P180 `VALIDATION_NONZERO_QUARANTINES`

- **Requirement:** validation nonzero quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P181 `FAULT_SENTINEL_QUARANTINES`

- **Requirement:** fault sentinel quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P182 `ARTIFACT_DRIFT_QUARANTINES`

- **Requirement:** artifact drift quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P183 `STARTUP_CANARY_FAILURE_QUARANTINES`

- **Requirement:** startup canary failure quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P184 `RENDERER_CRASH_THRESHOLD_QUARANTINES`

- **Requirement:** renderer crash threshold quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P185 `GPU_CRASH_THRESHOLD_QUARANTINES`

- **Requirement:** gpu crash threshold quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P186 `RESOURCE_LEAK_THRESHOLD_QUARANTINES`

- **Requirement:** resource leak threshold quarantines.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P187 `QUARANTINE_RECEIPT_PERSISTED`

- **Requirement:** quarantine receipt persisted.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P188 `QUARANTINE_SURVIVES_RESTART`

- **Requirement:** quarantine survives restart.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P189 `QUARANTINE_BLOCKS_PREVIEW`

- **Requirement:** quarantine blocks preview.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P190 `QUARANTINE_BLOCKS_EXPORT`

- **Requirement:** quarantine blocks export.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P191 `QUARANTINE_NO_CPU_FALLBACK`

- **Requirement:** quarantine no cpu fallback.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

### R11-P192 `QUARANTINE_NO_SILENT_CLEAR`

- **Requirement:** quarantine no silent clear.
- **Assertion:** Correctness-critical drift and threshold breaches revoke admission, persist quarantine across restarts, and forbid all silent fallback or automatic clearance.
- **Evidence:** `R11_QUARANTINE_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_RUNTIME_QUARANTINED`; installed acceptance stops and no runtime token is admitted.

## 28.7 Rollback Recommendation

### R11-P193 `RECOMMENDATION_CREATED_ON_QUARANTINE`

- **Requirement:** recommendation created on quarantine.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P194 `RECOMMENDATION_SCHEMA_VALID`

- **Requirement:** recommendation schema valid.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P195 `RECOMMENDATION_SELF_HASH_VALID`

- **Requirement:** recommendation self hash valid.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P196 `FAILED_BUILD_ID_RECORDED`

- **Requirement:** failed build id recorded.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P197 `FAILED_PACKAGE_ID_RECORDED`

- **Requirement:** failed package id recorded.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P198 `FAILURE_EVIDENCE_DIGEST_RECORDED`

- **Requirement:** failure evidence digest recorded.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P199 `CURRENT_POINTER_HASH_RECORDED`

- **Requirement:** current pointer hash recorded.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P200 `CURRENT_POINTER_GENERATION_RECORDED`

- **Requirement:** current pointer generation recorded.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P201 `TARGET_PREVIOUS_BUILD_FROM_R10`

- **Requirement:** target previous build from r10.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P202 `TARGET_PREVIOUS_PACKAGE_FROM_R10`

- **Requirement:** target previous package from r10.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P203 `TARGET_QUALIFICATION_RECEIPTS_PRESENT`

- **Requirement:** target qualification receipts present.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P204 `TARGET_PACKAGE_REGISTRY_ENTRY_PRESENT`

- **Requirement:** target package registry entry present.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P205 `TARGET_NOT_EQUAL_FAILED_PACKAGE`

- **Requirement:** target not equal failed package.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P206 `EXPECTED_CAS_BEFORE_HASH_PRESENT`

- **Requirement:** expected cas before hash present.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P207 `EXPECTED_CAS_GENERATION_PRESENT`

- **Requirement:** expected cas generation present.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P208 `EXECUTION_AUTHORITY_R10_ONLY`

- **Requirement:** execution authority r10 only.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P209 `OPERATOR_APPROVAL_REQUIRED`

- **Requirement:** operator approval required.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P210 `NO_QUALIFIED_TARGET_NOT_INVENTED`

- **Requirement:** no qualified target not invented.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P211 `RECOMMENDATION_DOES_NOT_MUTATE_POINTER`

- **Requirement:** recommendation does not mutate pointer.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

### R11-P212 `RECOMMENDATION_RECEIPT_SEALED`

- **Requirement:** recommendation receipt sealed.
- **Assertion:** Quarantine produces an evidence-bound, R10-executed rollback recommendation without mutating the production pointer or inventing a rollback target.
- **Evidence:** `R11_ROLLBACK_RECOMMENDATION_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_ROLLBACK_RECOMMENDATION_INVALID`; installed acceptance stops and no runtime token is admitted.

## 28.8 Final Receipt Privacy and Negative Controls

### R11-P213 `FINAL_INSTALLED_RECEIPT_SCHEMA_VALID`

- **Requirement:** final installed receipt schema valid.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P214 `FINAL_INSTALLED_STATE_EXACT`

- **Requirement:** final installed state exact.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P215 `SOURCE_PASS_148`

- **Requirement:** source pass 148.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P216 `INSTALLED_PASS_228`

- **Requirement:** installed pass 228.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P217 `PENDING_ZERO`

- **Requirement:** pending zero.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P218 `DEFERRED_ZERO`

- **Requirement:** deferred zero.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P219 `SKIPPED_ZERO`

- **Requirement:** skipped zero.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P220 `FAIL_ZERO`

- **Requirement:** fail zero.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P221 `USER_PIXEL_DATA_ABSENT`

- **Requirement:** user pixel data absent.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P222 `USER_FILE_NAME_ABSENT`

- **Requirement:** user file name absent.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P223 `USER_PATH_ABSENT`

- **Requirement:** user path absent.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P224 `USER_PIXEL_HASH_ABSENT`

- **Requirement:** user pixel hash absent.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P225 `NETWORK_TELEMETRY_ZERO`

- **Requirement:** network telemetry zero.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P226 `NEGATIVE_MUTATED_WGSL_DETECTED`

- **Requirement:** negative mutated wgsl detected.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P227 `NEGATIVE_STALE_TOKEN_DETECTED`

- **Requirement:** negative stale token detected.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

### R11-P228 `NEGATIVE_POINTER_WRITE_ATTEMPT_REJECTED`

- **Requirement:** negative pointer write attempt rejected.
- **Assertion:** The final installed-runtime receipt proves all gates, excludes user content, and demonstrates the three critical negative controls.
- **Evidence:** `TDT_RESAMPLE_RUNTIME_01_R11_FINAL_INSTALLED_RECEIPT.json` produced by the installed packaged process or its immutable finalizer.
- **Failure:** `E_R11_FINAL_RECEIPT_INCOMPLETE`; installed acceptance stops and no runtime token is admitted.

# 29. Source-Harness Acceptance

현재 parent 상태에서 허용되는 source completion:

```text
state = RESAMPLE_RUNTIME_R11_ATTESTATION_HARNESS_SOURCE_BAKED_AWAITING_R10_PRODUCTION_RELEASE
SOURCE PASS = 148
INSTALLED PENDING = 228
DEFERRED = 0
SKIPPED = 0
FAIL = 0
productionPointerMutated = false
runtimeAdmissionTokenIssued = false
```
# 30. Final Installed Acceptance

```text
state = RESAMPLE_RUNTIME_R11_INSTALLED_RUNTIME_ATTESTATION_AND_QUARANTINE_SEALED
SOURCE PASS = 148
INSTALLED PASS = 228
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0
productionPointerMutated = false
runtimeAdmissionTokenIssued = true
quarantined = false
```

Quarantine가 발생한 run은 final installed acceptance가 아니다. 해당 run은 `RESAMPLE_RUNTIME_R11_RUNTIME_QUARANTINED_ROLLBACK_RECOMMENDED` 상태와 별도 quarantine/recommendation receipt로 종료한다.
# 31. Compact Implementation Checklist

- [ ] R10 final release receipt만 installed predecessor로 인정한다.
- [ ] Pointer v3와 executing package identity를 canary보다 먼저 검증한다.
- [ ] Runtime executable closure 전체를 SHA-256로 다시 계산한다.
- [ ] Artifact drift가 있으면 canary를 실행하지 않는다.
- [ ] 사용자 job보다 startup canary가 먼저다.
- [ ] Product/reference exact와 oracle ULP를 둘 다 통과한다.
- [ ] Validation counter positive control로 dead counter path를 검출한다.
- [ ] Session token을 build·package·pointer generation·device epoch에 묶는다.
- [ ] Lazy executable asset은 first use 전에 재해시한다.
- [ ] Device loss는 token revoke 후 post-loss canary를 요구한다.
- [ ] Correctness drift는 즉시 quarantine한다.
- [ ] Quarantine는 restart 후에도 유지한다.
- [ ] Rollback recommendation은 R10만 실행한다.
- [ ] R11은 pointer를 절대 쓰지 않는다.
- [ ] 사용자 콘텐츠와 network telemetry는 0이다.
# 32. Completion Definition

R11 완료는 앱이 한 번 실행됐다는 뜻이 아니다. 다음이 동시에 참이어야 한다.

- R10 final release와 active pointer v3가 immutable하게 검증됨;
- 실행 설치본의 executable closure가 active packageContentId와 일치함;
- packaged hardware GPU startup canary가 모든 fixture와 counter control을 통과함;
- session admission token이 정확한 build/package/device epoch에 귀속됨;
- Preview·Export가 token 없이 실행되지 않음;
- drift/crash/resource ledger가 hash-chain으로 보존됨;
- device-loss recovery가 stale epoch를 재사용하지 않음;
- quarantine가 silent fallback 없이 실행을 차단함;
- rollback recommendation이 R10 CAS 입력만 생성하고 pointer를 변경하지 않음;
- 376개 gate가 PASS이고 PENDING·DEFERRED·SKIPPED·FAIL이 0임.
# 33. Final Declaration

R11의 최종 선언은 다음 한 문장으로 제한한다.

> R10이 승인한 whole-build package와 현재 설치·실행 중인 runtime closure가 byte identity로 일치하고, packaged hardware GPU startup canary와 session epoch 검증이 통과했으며, drift·crash·device-loss 발생 시 silent fallback 없이 quarantine와 R10 rollback recommendation으로 전환됨을 증명한다.

현재 parent에는 R10 final production release receipt가 없으므로 이 명세 작성 시점의 installed status는 판단불가가 아니라 명시적 `PENDING`이다. Source harness는 베이크할 수 있으나 runtime admission이나 quarantine behavior가 실제 packaged process에서 실행됐다고 주장할 수 없다.
