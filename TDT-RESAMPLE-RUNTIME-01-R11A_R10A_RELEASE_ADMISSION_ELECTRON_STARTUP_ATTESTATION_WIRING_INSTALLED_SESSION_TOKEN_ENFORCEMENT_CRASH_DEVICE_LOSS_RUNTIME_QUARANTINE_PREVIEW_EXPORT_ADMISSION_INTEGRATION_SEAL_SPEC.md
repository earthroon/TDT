# TDT-RESAMPLE-RUNTIME-01-R11A

## R10A Release Admission / Electron Startup Attestation Wiring / Installed Session Token Enforcement / Crash·Device-Loss Runtime Quarantine / Preview·Export Admission Integration Seal

> Patch ID: `TDT-RESAMPLE-RUNTIME-01-R11A`  
> Status: specification  
> Parent source bundle: `61_TDT_RESAMPLE_RUNTIME_01_R10A_RELEASE_REQUALIFICATION_SOURCE_BAKED_AWAITING_R9A_PHYSICAL.zip`  
> Scope: Electron main process, preload bridge, renderer bootstrap, runtime service graph, Preview presenter, Export authority, host save IPC, installed evidence and quarantine  
> Non-goal: Production Pointer mutation, R10A release fabrication, R12 update activation, R13 fleet rollout

---

## 0. 판정 라벨

- `확정`: 부모 코드나 부모 receipt에서 직접 확인된 사실이다.
- `설계`: R11A가 새로 요구하는 구현 계약이다.
- `PENDING`: packaged Windows Electron과 current R10A final release가 필요하다.
- `금지`: 해당 동작이 관측되면 R11A acceptance를 즉시 거부한다.

---

## 1. 부모 상태와 실제 결선 공백

### 1.1 부모 상태

`artifacts/resample-runtime-01-r10a/source-bake/TDT_RESAMPLE_RUNTIME_01_R10A_SOURCE_FINAL_RECEIPT.json` 기준:

```text
state = RESAMPLE_RUNTIME_R10A_RELEASE_REQUALIFICATION_HARNESS_SOURCE_SEALED_AWAITING_R9A_PHYSICAL_AND_PRODUCTION_REBUILD
SOURCE PASS = 260
RELEASE PENDING = 300
FAIL = 0
r8aSourceCurrent = true
r9aSourceCurrent = true
r9aPhysicalCurrent = false
r10aReleaseCurrent = false
productionPointerMutated = false
localActivationPointerMutated = false
```

따라서 R11A source harness는 작성할 수 있으나 installed runtime admission을 PASS로 선언할 수 없다.

### 1.2 부모 코드에서 확인된 공백

`확정`:

1. `app/features/resample-runtime/r11/`에는 installed attestor, startup canary, token, quarantine, crash와 device-loss 모듈이 있다.
2. 해당 모듈은 제품 `electron.mjs`, `preload.cjs`, `app/src/boot/bootstrap-renderer.ts`에서 호출되지 않는다.
3. `electron.mjs`는 정상 BrowserWindow를 생성하고 renderer를 로드하지만 R10A release admission과 installed closure attestation을 먼저 수행하지 않는다.
4. `preload.cjs`에는 R11 installed admission capability가 없다.
5. `PreviewPresenterService`와 `ExportAuthorityService`는 installed session token이나 operation-scoped job grant를 요구하지 않는다.
6. `dadum:export-save-begin`은 installed Export grant 없이도 save session을 시작할 수 있다.
7. 기존 R11 session token은 self-hash 기반이며 main-process 비밀키와 `webContents.id` binding이 없다.
8. renderer bootstrap은 Preview와 Export 모듈을 installed attestation barrier 없이 활성화한다.

R11A는 위 공백만 교정하며 R8A 필터 수학, R9A single-submit command graph, R10A pointer writer를 변경하지 않는다.

---

## 2. 목표

R11A의 목표는 다음 문장을 물리적으로 증명하는 것이다.

> R10A가 현재 계보로 승인한 immutable package만 Electron main process에서 실행되고, 정상 workspace가 표시되기 전에 package closure와 startup GPU canary가 통과하며, main-owned installed session과 operation-scoped job grant 없이는 Preview, Export, Electron save가 실행되지 않고, crash 또는 device loss 시 token을 먼저 폐기한 뒤 recovery canary 또는 durable quarantine과 R10A rollback recommendation으로 전환된다.

---

## 3. 권위 구조

```text
R10A final release + lineage restoration
              |
              v
Electron main preflight authority
  - Production Pointer read-only verification
  - installed package closure verification
  - durable quarantine check
              |
              v
hidden BrowserWindow + preload capability
              |
              v
renderer startup GPU canary
              |
              v
main-owned installed session registry
              |
              v
operation-scoped Preview / Export job grants
              |
       +------+------+
       |             |
       v             v
Preview guard    Export guard
                       |
                       v
             Electron save IPC guard
```

### 3.1 SSOT

| 상태 | SSOT 위치 | 비고 |
|---|---|---|
| release authority | R10A final release receipt와 lineage receipt | R11A는 read-only |
| active package selection | `dadum.export.production-pointer` | R11A write 금지 |
| installed closure | Electron main preflight receipt | renderer 주장 불인정 |
| admitted session | Electron main in-memory session registry | renderer self-issue 금지 |
| job sequence | Electron main job grant registry | Preview와 Export 별도 scope |
| quarantine | Electron main durable state + append-only ledger | silent clear 금지 |
| rollback recommendation | R11A recommendation receipt | 실제 CAS는 R10A만 수행 |

---

## 4. Canonical states

```text
RESAMPLE_RUNTIME_R11A_STARTUP_ADMISSION_WIRING_SOURCE_SEALED_AWAITING_R10A_RELEASE_AND_INSTALLED_ELECTRON

RESAMPLE_RUNTIME_R11A_MAIN_PREFLIGHT_PASSED_AWAITING_RENDERER_CANARY

RESAMPLE_RUNTIME_R11A_RENDERER_CANARY_PASSED_AWAITING_SESSION_ISSUANCE

RESAMPLE_RUNTIME_R11A_INSTALLED_SESSION_ADMITTED

RESAMPLE_RUNTIME_R11A_DEVICE_LOSS_RECOVERY_PENDING

RESAMPLE_RUNTIME_R11A_RUNTIME_QUARANTINED_ROLLBACK_RECOMMENDED

RESAMPLE_RUNTIME_R11A_ELECTRON_STARTUP_ATTESTATION_AND_RUNTIME_ADMISSION_SEALED_AWAITING_R12A

RESAMPLE_RUNTIME_R11A_INSTALLED_RUNTIME_REJECTED
```

허용 전이:

```text
SOURCE_SEALED
  -> MAIN_PREFLIGHT_PASSED
  -> RENDERER_CANARY_PASSED
  -> INSTALLED_SESSION_ADMITTED
  -> FINAL_SEALED

INSTALLED_SESSION_ADMITTED
  -> DEVICE_LOSS_RECOVERY_PENDING
  -> INSTALLED_SESSION_ADMITTED     # 새 device epoch, 새 session generation

어느 단계든
  -> RUNTIME_QUARANTINED_ROLLBACK_RECOMMENDED
  -> INSTALLED_RUNTIME_REJECTED
```

상태 건너뛰기, 역행, 이전 session 재활성화는 금지한다.

---

## 5. R10A release admission

### 5.1 필수 입력

R11A는 다음 둘을 독립적으로 검증한다.

1. `TDT_RESAMPLE_RUNTIME_01_R10A_FINAL_RELEASE_RECEIPT.json`
2. `TDT_RESAMPLE_RUNTIME_01_R10A_LINEAGE_RESTORATION_RECEIPT.json`

Release receipt 요구:

```text
state = RESAMPLE_RUNTIME_R10A_RELEASE_REQUALIFIED_POINTER_CAS_AND_ROLLBACK_DRILL_SEALED
SOURCE PASS = 260
RELEASE PASS = 300
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0
promotionSmokePassed = true
rollbackDrillVerified = true
repromotionSmokePassed = true
wholeBuildIdentityPreserved = true
historicalPassCarryForward = 0
```

Lineage receipt 요구:

```text
state = RESAMPLE_RUNTIME_R10A_CURRENT_LINEAGE_RESTORED_AWAITING_R11A
lineageHead = TDT-RESAMPLE-RUNTIME-01-R10A
R8A source = CURRENT
R9A source = CURRENT
R9A physical = CURRENT
R10A release = CURRENT
R11A = REQUIRED_NOT_CURRENT
```

### 5.2 package identity binding

다음 값이 모두 같아야 한다.

```text
R10A final target buildId
R10A final target packageContentId
R10A runtimeClosureDigest
Production Pointer activeBuildId
Production Pointer activePackageContentId
현재 실행 package root에서 재계산한 packageContentId
installed expected manifest의 build/package/closure identity
renderer runtime manifest buildId
```

### 5.3 기존 R11 admission 교정

기존 `r10-release-admission.mjs`가 요구하는 old R10 state와 `129 + 202` count는 R11A에서 current authority가 아니다.

R11A는 새 adapter를 사용한다.

```text
app/electron/resample-runtime-r11a/r10a-release-admission.mjs
```

Old R10 receipt를 제출하면:

```text
E_R11A_R10A_FINAL_STATE_MISMATCH
```

으로 거부한다.

---

## 6. Electron main preflight

### 6.1 실행 순서

```text
app.whenReady
-> acquire R11A startup lock
-> read durable quarantine state
-> admit R10A final release and lineage
-> read and verify Production Pointer
-> resolve executing package root
-> verify expected installation manifest
-> rehash installed executable closure
-> write main preflight receipt
-> create BrowserWindow(show=false)
-> load renderer
```

Normal BrowserWindow를 먼저 표시한 뒤 attestation하는 순서는 금지한다.

### 6.2 설치 closure

필수 coverage:

- `app.asar`
- unpacked native addon
- emitted renderer runtime
- worker scripts
- WASM과 pthread helpers
- generated WGSL
- runtime asset manifest
- Active Graph
- JavaScript parse closure report
- R8A source receipt
- R9A source와 physical receipt
- R10A final release와 lineage receipts

검증 항목:

```text
file count
total bytes
normalized relative path set digest
per-file SHA-256
runtime closure digest
packageContentId
symlink and reparse count
extra executable count
```

### 6.3 main preflight receipt

Schema:

```text
tdt.resample-runtime.main-preflight.r11a.v1
```

필드:

```ts
interface R11AMainPreflightReceipt {
  schemaVersion: 1
  schemaId: 'tdt.resample-runtime.main-preflight.r11a.v1'
  state: 'RESAMPLE_RUNTIME_R11A_MAIN_PREFLIGHT_PASSED_AWAITING_RENDERER_CANARY'

  mainBootId: string
  packaged: true
  appVersion: string
  electronVersion: string
  platform: 'win32'
  arch: 'x64'

  buildId: string
  packageContentId: string
  runtimeClosureDigest: string

  productionPointerGeneration: number
  productionPointerRawSha256: string
  r10aFinalReleaseReceiptSha256: string
  r10aLineageReceiptSha256: string
  expectedInstallationManifestSha256: string
  installedClosureReceiptSha256: string

  browserWindowId: number | null
  webContentsId: number | null

  productionPointerMutated: false
  localActivationPointerMutated: false
  receiptSha256: string
}
```

---

## 7. Hidden renderer canary and boot barrier

### 7.1 runtime module graph

새 service:

```text
dadum.runtime.installed-admission
```

새 capability:

```text
dadum.runtime.installed-session
```

새 required module:

```text
dadum.module.installed-admission-r11a-v1
```

Dependency:

```text
host bridge
active graph
gpu authority
surface lifecycle
resample worker broker
```

Preview, Export, UI finalize는 installed admission module에 의존해야 한다.

### 7.2 BrowserWindow visibility

```text
create BrowserWindow({ show: false })
```

다음 이후에만 `show()`를 허용한다.

```text
renderer canary PASS
main session issued
renderer boot receipt sealed with admission digest
renderer ready signal accepted by main
```

Attestation 실패 시 normal workspace를 표시하지 않는다. Quarantine recovery surface는 별도 minimal route와 별도 capability로만 표시할 수 있다.

### 7.3 startup canary

Startup canary는 사용자 콘텐츠를 사용하지 않는다.

필수 fixture:

- R4 DC
- fractional impulse
- R6 diagonal edge
- border clamp
- alpha edge
- neutral identity
- residual disabled
- validation positive control

필수 결과:

```text
hardware D3D12 = true
software adapter = false
R8A kernel identity exact
R9A command graph identity exact
canonical encoder count = 1
canonical submit count = 1
Export pre-map fence count = 0
validation double dispatch count = 0
uniform overwrite count = 0
validation counters = 0
positive control counter > 0
product-reference raw16 exact
binary64 oracle max ULP <= 1
nonfinite count = 0
fault sentinel count = 0
Preview smoke = PASS
strict Export smoke = PASS
CPU fallback = 0
silent fallback = 0
```

---

## 8. Installed session authority

### 8.1 main-owned session registry

Schema:

```text
tdt.resample-runtime.installed-session.r11a.v1
```

Main process가 보관하는 private record:

```ts
interface R11AInstalledSessionRecord {
  sessionId: string              // 256-bit CSPRNG
  sessionGeneration: number
  mainBootId: string

  browserWindowId: number
  webContentsId: number
  rendererProcessId: number

  buildId: string
  packageContentId: string
  runtimeClosureDigest: string
  pointerGeneration: number
  pointerRawSha256: string

  activeGraphDigest: string
  deviceEpoch: number
  adapterIdentityDigest: string
  driverIdentityDigest: string
  startupCanaryDigest: string

  nextJobSequence: number
  status: 'ACTIVE' | 'RECOVERY_PENDING' | 'REVOKED' | 'QUARANTINED' | 'CLOSED'
  issuedAt: string
  revokedAt: string | null
  revokeReason: string | null

  sessionMac: string              // main-only HMAC-SHA256
}
```

`sessionMac` key는 process-local 256-bit CSPRNG secret이며 preload와 renderer에 노출하지 않는다.

### 8.2 renderer public envelope

Renderer가 받는 값은 public envelope와 opaque handle뿐이다.

```ts
interface R11APublicSessionEnvelope {
  sessionId: string
  sessionGeneration: number
  buildId: string
  packageContentId: string
  pointerGeneration: number
  activeGraphDigest: string
  deviceEpoch: number
  startupCanaryDigest: string
  publicEnvelopeSha256: string
}
```

Public envelope만으로 session을 발급하거나 복제할 수 없다.

### 8.3 revoke 조건

즉시 revoke:

- renderer reload 또는 navigation
- `render-process-gone`
- GPU device loss
- Production Pointer generation 변경
- package drift
- Active Graph drift
- canary counter nonzero
- quarantine activation
- window close
- main process shutdown

---

## 9. Operation-scoped job grants

Schema:

```text
tdt.resample-runtime.job-grant.r11a.v1
```

```ts
interface R11AJobGrant {
  grantId: string
  sessionId: string
  sessionGeneration: number
  jobSequence: number
  operation: 'PREVIEW' | 'EXPORT'

  finalRevision: number
  surfaceId: string | null
  encoderId: string | null
  optionsDigest: string | null
  deviceEpoch: number

  nonce: string
  issuedAt: string
  grantMac: string
}
```

규칙:

- job sequence는 main registry에서 단조 증가한다.
- grant는 single-use다.
- Preview grant를 Export에 사용할 수 없다.
- Export grant는 encoder와 canonical options digest에 귀속된다.
- save session은 Export grant와 동일 `sessionId/jobSequence/grantDigest`를 요구한다.
- 완료 또는 실패 후 grant를 재사용할 수 없다.

---

## 10. Preload IPC surface

허용 namespace:

```text
window.dadumHost.installedAdmission
```

허용 메서드:

```ts
status()
requestSession(canaryReceipt)
beginJob(request)
completeJob(request)
reportDeviceLoss(request)
submitRecoveryCanary(request)
closeSession(request)
```

금지:

- arbitrary channel invoke
- raw filesystem path 반환
- main signing key 반환
- raw quarantine file 반환
- pointer writer 노출
- session registry dump

IPC channel:

```text
dadum:r11a-status
dadum:r11a-request-session
dadum:r11a-begin-job
dadum:r11a-complete-job
dadum:r11a-report-device-loss
dadum:r11a-submit-recovery-canary
dadum:r11a-close-session
dadum:r11a-renderer-ready
```

모든 handler는 `event.sender.id`, `event.sender.getOSProcessId()`, BrowserWindow identity를 main preflight와 대조한다.

---

## 11. Preview admission integration

`PreviewPresenterService`는 `InstalledAdmissionService`를 constructor dependency로 받는다.

필수 검사 위치:

```text
initialize
present
scheduler enqueue
#presentFrame 직전
frame receipt seal 직전
```

Revoke 시:

```text
scheduler suspend
pending frame drop
canvas unconfigure
data-preview-state = admission-revoked 또는 quarantined
새 surface presentation 금지
```

금지:

- session 없이 current publication replay
- revoked session에서 마지막 frame 재사용
- Canvas2D fallback
- WebGL fallback
- CPU raster fallback

Preview receipt 추가 필드:

```text
installedSessionId
sessionGeneration
jobSequence
jobGrantDigest
deviceEpoch
admissionState
```

---

## 12. Export admission integration

`ExportAuthorityService.exportFinal()`은 다음 경계를 검증한다.

```text
1. begin Export job grant
2. final surface pin 직전
3. encoder 호출 직전
4. encoder 완료 직후
5. Electron save begin 직전
6. save commit 직후
7. job completion
```

Session revoke가 2에서 6 사이에 발생하면:

```text
encoded output discard
active host save session abort
temporary file delete
final receipt 미발급
E_R11A_EXPORT_SESSION_REVOKED
```

Export receipt 추가 필드:

```text
installedSessionId
sessionGeneration
jobSequence
jobGrantDigest
admissionBuildId
admissionPackageContentId
admissionPointerGeneration
admissionDeviceEpoch
```

### 12.1 Electron save hard boundary

`dadum:export-save-begin` request에 다음을 추가한다.

```text
sessionId
sessionGeneration
jobSequence
grantDigest
grantMac
```

Main은 active Export grant를 재검증한 뒤에만 temporary file을 생성한다.

Chunk와 commit은 save session에 고정된 grant identity를 다시 대조한다.

---

## 13. Device-loss recovery

### 13.1 순서

```text
GPU authority detects device loss
-> renderer reports loss with current session identity
-> main revokes session and all open grants
-> Preview suspend and Export save abort
-> main creates recovery challenge
-> GPU authority obtains new device epoch
-> renderer runs post-loss R8A/R9A canary
-> main verifies recovery receipt
-> main issues new session generation
-> Preview and Export resume
```

Old session은 recovery 성공 뒤에도 영구 revoked다.

### 13.2 threshold

기존 R11 threshold를 유지한다.

```text
device loss per session >= 2 -> quarantine
device loss rolling 24h >= 3 -> quarantine
```

첫 loss만 recovery를 시도할 수 있다.

### 13.3 recovery receipt

Schema:

```text
tdt.resample-runtime.device-loss-recovery.r11a.v1
```

필수 binding:

```text
old session ID
old device epoch
new device epoch
same build/package/closure
same pointer generation/hash
same Active Graph digest
recovery challenge nonce
post-loss canary digest
new session generation
```

---

## 14. Crash monitor and durable quarantine

### 14.1 Electron listeners

Main process에서 정확히 한 번 등록한다.

```text
webContents: render-process-gone
app: child-process-gone where type = GPU
```

Crash event는 당시 active session과 package identity에 귀속한다.

Threshold:

```text
renderer crash >= 3 / last 10 admitted sessions
GPU process crash >= 2 / last 10 admitted sessions
```

### 14.2 session termination ledger

각 admitted session은 다음 중 하나로 종료한다.

```text
CLEAN
RENDERER_CRASH
GPU_PROCESS_CRASH
DEVICE_LOSS_QUARANTINE
PACKAGE_DRIFT
MANUAL_APP_EXIT
```

Session marker가 다음 boot에도 남아 있으면 unclean termination으로 기록하고 임의로 clean 처리하지 않는다.

### 14.3 quarantine authority

기존 `QuarantineStore`의 단일 `wx` JSON만으로 final authority를 구성하지 않는다.

R11A는 다음 둘을 사용한다.

```text
state/R11A_QUARANTINE_STATE.json
state/r11a-quarantine-ledger/R11A_QUARANTINE_LEDGER.jsonl
```

요구:

- same-directory temp write
- fsync
- atomic replace
- readback
- self-hash
- append-only hash chain
- process lock
- active quarantine silent clear 금지

### 14.4 rollback recommendation

R11A는 Production Pointer를 변경하지 않는다.

Recommendation은 R10A의 qualified previous package만 사용한다.

```text
R11A quarantine
-> R10A rollback recommendation receipt
-> 별도 R10A CAS 실행
```

Rollback target을 임의로 발명하거나 current lineage가 아닌 old package를 추천하면 거부한다.

---

## 15. Privacy boundary

Installed evidence에 포함 금지:

- 사용자 이미지와 thumbnail
- 픽셀 hash
- 파일명과 사용자 경로
- EXIF와 문서 metadata
- 계정명과 이메일
- 정밀 위치
- hardware serial
- raw crash dump
- raw application log

허용:

- build/package/closure digest
- pointer generation/hash
- adapter와 driver의 privacy-minimized digest
- canary fixture ID
- counter와 fault count
- crash와 device-loss event type
- session과 job sequence

Network telemetry는 R11A 범위가 아니다. 모든 evidence는 local-only다.

---

## 16. Stable errors

```text
E_R11A_R10A_FINAL_RECEIPT_MISSING
E_R11A_R10A_FINAL_STATE_MISMATCH
E_R11A_R10A_LINEAGE_RECEIPT_MISSING
E_R11A_R10A_LINEAGE_MISMATCH
E_R11A_POINTER_SCHEMA_INVALID
E_R11A_POINTER_SELF_HASH_MISMATCH
E_R11A_POINTER_RELEASE_MISMATCH
E_R11A_EXECUTING_PACKAGE_MISMATCH
E_R11A_EXPECTED_MANIFEST_MISSING
E_R11A_INSTALLED_CLOSURE_MISMATCH
E_R11A_EXTRA_EXECUTABLE_FILE
E_R11A_SYMLINK_ESCAPE
E_R11A_ACTIVE_GRAPH_DRIFT
E_R11A_RUNTIME_QUARANTINED
E_R11A_MAIN_PREFLIGHT_REQUIRED
E_R11A_STARTUP_CANARY_FAILED
E_R11A_CANARY_REPLAY
E_R11A_HARDWARE_GPU_REQUIRED
E_R11A_SOFTWARE_ADAPTER_FORBIDDEN
E_R11A_VALIDATION_COUNTER_NONZERO
E_R11A_PRODUCT_REFERENCE_MISMATCH
E_R11A_ORACLE_ULP_EXCEEDED
E_R11A_SESSION_REQUIRED
E_R11A_SESSION_STALE
E_R11A_SESSION_REVOKED
E_R11A_SESSION_SENDER_MISMATCH
E_R11A_JOB_GRANT_REQUIRED
E_R11A_JOB_GRANT_REPLAY
E_R11A_JOB_SCOPE_MISMATCH
E_R11A_JOB_IDENTITY_MISMATCH
E_R11A_PREVIEW_SESSION_REVOKED
E_R11A_EXPORT_SESSION_REVOKED
E_R11A_EXPORT_SAVE_GRANT_INVALID
E_R11A_DEVICE_LOSS
E_R11A_POST_LOSS_CANARY_FAILED
E_R11A_DEVICE_LOSS_THRESHOLD
E_R11A_RENDERER_CRASH_THRESHOLD
E_R11A_GPU_PROCESS_CRASH_THRESHOLD
E_R11A_QUARANTINE_CLEAR_FORBIDDEN
E_R11A_ROLLBACK_TARGET_MISSING
E_R11A_POINTER_MUTATION_FORBIDDEN
E_R11A_USER_CONTENT_IN_EVIDENCE
E_R11A_NETWORK_TELEMETRY_FORBIDDEN
E_R11A_SOURCE_CANNOT_ADMIT_RUNTIME
E_R11A_FINAL_RECEIPT_INCOMPLETE
```

---

## 17. Required implementation surface

```text
app/electron/resample-runtime-r11a/
  r10a-release-admission.mjs
  installed-closure-attestor.mjs
  main-preflight-controller.mjs
  session-registry.mjs
  job-grant-registry.mjs
  crash-ledger.mjs
  quarantine-authority.mjs
  device-loss-recovery.mjs
  rollback-recommendation.mjs
  ipc-contract.mjs
  canonical-json.mjs

app/src/runtime/admission/
  installed-admission-types.ts
  installed-admission-service.ts
  installed-admission-guard.ts
  startup-canary-client.ts
  device-loss-recovery-client.ts

app/src/boot/runtime-modules.ts
app/src/boot/bootstrap-renderer.ts
app/src/runtime/service-token.ts
app/src/runtime/preview/preview-presenter-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/host-bridge-service.ts
app/src/env.d.ts

electron.mjs
preload.cjs

tools/resample-runtime-01-r11a/
  run.mjs
  gate-source.mjs
  finalize-source.mjs
  verify-parent-freeze.mjs
  verify-r10a-admission.mjs
  verify-main-wiring.mjs
  verify-preload-contract.mjs
  verify-renderer-barrier.mjs
  verify-session-registry.mjs
  verify-preview-export-integration.mjs
  verify-crash-device-loss.mjs
  verify-negative-controls.mjs
  verify-predecessor-regression.mjs
  run-installed.mjs
  verify-installed.mjs
  finalize-installed.mjs
  schemas/*.json
  fixtures/*.json
  windows/run-packaged-r11a.ps1
```

R8A/R9A product core, R10A pointer writer, R12/R13 historical receipt bytes는 수정하지 않는다.

---

## 18. Required source artifacts

```text
artifacts/resample-runtime-01-r11a/source-bake/
  R11A_PARENT_FREEZE_RECEIPT.json
  R11A_R10A_ADMISSION_SCHEMA_RECEIPT.json
  R11A_MAIN_WIRING_RECEIPT.json
  R11A_PRELOAD_IPC_CONTRACT_RECEIPT.json
  R11A_SESSION_AND_JOB_GRANT_SELF_TEST.json
  R11A_PREVIEW_EXPORT_INTEGRATION_RECEIPT.json
  R11A_CRASH_DEVICE_LOSS_SELF_TEST.json
  R11A_NEGATIVE_CONTROL_SOURCE_GATE.json
  R11A_PREDECESSOR_REGRESSION_REPORT.json
  TDT_RESAMPLE_RUNTIME_01_R11A_SOURCE_FINAL_RECEIPT.json
```

## 19. Required installed artifacts

```text
artifacts/resample-runtime-01-r11a/installed/
  R11A_R10A_RELEASE_ADMISSION_RECEIPT.json
  R11A_MAIN_PREFLIGHT_RECEIPT.json
  R11A_INSTALLED_CLOSURE_RECEIPT.json
  R11A_STARTUP_CANARY_RECEIPT.json
  R11A_SESSION_ISSUANCE_RECEIPT.json
  R11A_PREVIEW_ADMISSION_RECEIPT.json
  R11A_EXPORT_ADMISSION_RECEIPT.json
  R11A_DEVICE_LOSS_RECOVERY_RECEIPT.json
  R11A_CRASH_MONITOR_RECEIPT.json
  R11A_QUARANTINE_DRILL_RECEIPT.json
  R11A_ROLLBACK_RECOMMENDATION_RECEIPT.json
  R11A_SESSION_SOAK_RECEIPT.json
  TDT_RESAMPLE_RUNTIME_01_R11A_FINAL_INSTALLED_RECEIPT.json
```

---

## 20. Negative controls

최소 다음을 실제 실패시킨다.

1. old R10 receipt를 R10A final로 제출
2. R10A release와 lineage의 package identity 불일치
3. Production Pointer build 또는 package 변조
4. installed worker 한 바이트 변조
5. extra executable 추가
6. renderer가 self-hash session object를 위조
7. 다른 BrowserWindow에서 session 재사용
8. renderer reload 뒤 old session 재사용
9. Preview grant를 Export에 사용
10. Export grant를 Preview에 사용
11. 동일 grant replay
12. stale device epoch grant 사용
13. Export grant 없이 `dadum:export-save-begin`
14. Export encode 도중 session revoke 후 save 시도
15. startup canary nonce replay
16. validation counter nonzero를 무시하고 token 발급
17. second device loss를 recovery로 계속 통과
18. crash threshold를 무시
19. quarantine state silent delete
20. R10A previous가 아닌 rollback target 발명
21. R11A에서 Production Pointer write 시도
22. evidence에 사용자 경로 또는 픽셀 hash 삽입
23. network telemetry 호출
24. source mode에서 installed token 발급

---

## 21. Source acceptance

```text
state = RESAMPLE_RUNTIME_R11A_STARTUP_ADMISSION_WIRING_SOURCE_SEALED_AWAITING_R10A_RELEASE_AND_INSTALLED_ELECTRON

SOURCE PASS = 332
INSTALLED PENDING = 400
DEFERRED = 0
SKIPPED = 0
FAIL = 0

productionPointerMutated = false
localActivationPointerMutated = false
installedSessionIssued = false
historicalPassCarryForward = 0
```

## 22. Final installed acceptance

```text
state = RESAMPLE_RUNTIME_R11A_ELECTRON_STARTUP_ATTESTATION_AND_RUNTIME_ADMISSION_SEALED_AWAITING_R12A

SOURCE PASS = 332
INSTALLED PASS = 400
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0

r10aReleaseAdmitted = true
installedClosureVerified = true
startupCanaryPassed = true
installedSessionIssued = true
previewAdmissionEnforced = true
exportAdmissionEnforced = true
hostSaveAdmissionEnforced = true
deviceLossRecoveryDrillPassed = true
crashMonitorPassed = true
quarantined = false
productionPointerMutated = false
localActivationPointerMutated = false
```

Quarantine drill의 isolated fixture가 PASS하더라도 정상 final run의 `quarantined`는 false여야 한다.

---

## 23. Source gate catalog

### 23.1 PARENT_AND_LINEAGE

- `R11A-S001` `R10A_SOURCE_FINAL_RECEIPT_PRESENT`
- `R11A-S002` `R10A_SOURCE_FINAL_RECEIPT_SELF_HASH_VALID`
- `R11A-S003` `R10A_SOURCE_PASS_260`
- `R11A-S004` `R10A_RELEASE_PENDING_300`
- `R11A-S005` `R10A_SOURCE_FAIL_ZERO`
- `R11A-S006` `R10A_PRODUCTION_POINTER_UNMUTATED`
- `R11A-S007` `R10A_LOCAL_POINTER_UNMUTATED`
- `R11A-S008` `R8A_SOURCE_CURRENT_TRUE`
- `R11A-S009` `R9A_SOURCE_CURRENT_TRUE`
- `R11A-S010` `R9A_PHYSICAL_CURRENT_FALSE`
- `R11A-S011` `R10A_RELEASE_CURRENT_FALSE`
- `R11A-S012` `R11A_NEXT_AUTHORITY_EXACT`
- `R11A-S013` `R11_LEGACY_MODULE_INVENTORY_PRESENT`
- `R11A-S014` `R11_LEGACY_TOOL_IMPORT_ONLY_CONFIRMED`
- `R11A-S015` `ELECTRON_MAIN_ENTRY_PRESENT`
- `R11A-S016` `PRELOAD_ENTRY_PRESENT`
- `R11A-S017` `RENDERER_BOOTSTRAP_PRESENT`
- `R11A-S018` `PREVIEW_SERVICE_PRESENT`
- `R11A-S019` `EXPORT_SERVICE_PRESENT`
- `R11A-S020` `HOST_SAVE_BOUNDARY_PRESENT`
- `R11A-S021` `PRODUCTION_POINTER_MIRRORS_PRESENT`
- `R11A-S022` `PRODUCTION_POINTER_MIRRORS_EQUAL`
- `R11A-S023` `R9A_PRODUCT_CORE_FROZEN`
- `R11A-S024` `R10A_POINTER_WRITER_FROZEN`
- `R11A-S025` `R10A_RELEASE_FINAL_REQUIRED_NOT_SYNTHESIZED`
- `R11A-S026` `R10A_LINEAGE_RESTORATION_REQUIRED`
- `R11A-S027` `R11_OLD_FINAL_RECEIPT_NOT_CURRENT`
- `R11A-S028` `R12_R13_HISTORY_REMAINS_SUPERSEDED`
- `R11A-S029` `HISTORICAL_PASS_CARRY_FORWARD_ZERO`
- `R11A-S030` `PARENT_FREEZE_RECEIPT_SELF_HASH_VALID`

### 23.2 AUTHORITY_AND_STATE_MODEL

- `R11A-S031` `MAIN_PROCESS_INSTALLED_AUTHORITY_DEFINED`
- `R11A-S032` `RENDERER_NOT_INSTALLATION_AUTHORITY`
- `R11A-S033` `PRELOAD_NOT_INSTALLATION_AUTHORITY`
- `R11A-S034` `PRODUCTION_POINTER_READ_ONLY_TO_R11A`
- `R11A-S035` `LOCAL_ACTIVATION_POINTER_READ_ONLY_TO_R11A`
- `R11A-S036` `R10A_ONLY_POINTER_CAS_WRITER`
- `R11A-S037` `R11A_SESSION_REGISTRY_MAIN_OWNED`
- `R11A-S038` `R11A_JOB_GRANT_REGISTRY_MAIN_OWNED`
- `R11A-S039` `R11A_QUARANTINE_STORE_MAIN_OWNED`
- `R11A-S040` `R11A_CRASH_LEDGER_MAIN_OWNED`
- `R11A-S041` `R11A_ROLLBACK_RECOMMENDATION_NO_POINTER_WRITE`
- `R11A-S042` `MAIN_PREFLIGHT_STATE_DEFINED`
- `R11A-S043` `HIDDEN_RENDERER_CANARY_STATE_DEFINED`
- `R11A-S044` `SESSION_ADMITTED_STATE_DEFINED`
- `R11A-S045` `SESSION_REVOKED_STATE_DEFINED`
- `R11A-S046` `RECOVERY_PENDING_STATE_DEFINED`
- `R11A-S047` `QUARANTINE_STATE_DEFINED`
- `R11A-S048` `FINAL_INSTALLED_STATE_DEFINED`
- `R11A-S049` `REJECTED_STATE_DEFINED`
- `R11A-S050` `STATE_TRANSITIONS_MONOTONIC`
- `R11A-S051` `STATE_REGRESSION_FORBIDDEN`
- `R11A-S052` `STATE_SKIP_FORBIDDEN`
- `R11A-S053` `SOURCE_MODE_RUNTIME_ADMISSION_FORBIDDEN`
- `R11A-S054` `DEV_MODE_PRODUCTION_TOKEN_FORBIDDEN`
- `R11A-S055` `PACKAGED_MODE_REQUIRED_FOR_FINAL`
- `R11A-S056` `SINGLE_WORKSPACE_WINDOW_POLICY_DEFINED`
- `R11A-S057` `R9_PHYSICAL_WINDOW_EXCLUDED_FROM_R11A`
- `R11A-S058` `RECOVERY_WINDOW_POLICY_DEFINED`
- `R11A-S059` `RENDERER_RELOAD_REQUIRES_READMISSION`
- `R11A-S060` `MAIN_RESTART_REQUIRES_READMISSION`
- `R11A-S061` `WINDOW_CLOSE_REVOKES_SESSION`

### 23.3 R10A_RELEASE_ADMISSION

- `R11A-S062` `R10A_RELEASE_RECEIPT_SCHEMA_DEFINED`
- `R11A-S063` `R10A_RELEASE_RECEIPT_PATH_CANONICAL`
- `R11A-S064` `R10A_RELEASE_FINAL_STATE_EXACT`
- `R11A-S065` `R10A_RELEASE_SOURCE_PASS_260`
- `R11A-S066` `R10A_RELEASE_PASS_300`
- `R11A-S067` `R10A_RELEASE_PENDING_ZERO`
- `R11A-S068` `R10A_RELEASE_DEFERRED_ZERO`
- `R11A-S069` `R10A_RELEASE_SKIPPED_ZERO`
- `R11A-S070` `R10A_RELEASE_FAIL_ZERO`
- `R11A-S071` `R10A_RELEASE_SELF_HASH_VALID`
- `R11A-S072` `R10A_LINEAGE_RECEIPT_SCHEMA_DEFINED`
- `R11A-S073` `R10A_LINEAGE_FINAL_STATE_EXACT`
- `R11A-S074` `R10A_LINEAGE_SELF_HASH_VALID`
- `R11A-S075` `R10A_LINEAGE_HEAD_R10A`
- `R11A-S076` `R10A_R8A_CURRENT_TRUE`
- `R11A-S077` `R10A_R9A_SOURCE_CURRENT_TRUE`
- `R11A-S078` `R10A_R9A_PHYSICAL_CURRENT_TRUE`
- `R11A-S079` `R10A_RELEASE_CURRENT_TRUE`
- `R11A-S080` `R10A_R11A_REQUIRED_NOT_CURRENT`
- `R11A-S081` `R10A_TARGET_BUILD_ID_PRESENT`
- `R11A-S082` `R10A_TARGET_PACKAGE_ID_PRESENT`
- `R11A-S083` `R10A_RUNTIME_CLOSURE_DIGEST_PRESENT`
- `R11A-S084` `R10A_QUALIFICATION_SET_DIGEST_PRESENT`
- `R11A-S085` `R10A_PROMOTION_SMOKE_PASS`
- `R11A-S086` `R10A_ROLLBACK_DRILL_PASS`
- `R11A-S087` `R10A_REPROMOTION_SMOKE_PASS`
- `R11A-S088` `R10A_FINAL_POINTER_GENERATION_PRESENT`
- `R11A-S089` `R10A_FINAL_POINTER_RAW_HASH_PRESENT`
- `R11A-S090` `R10A_TARGET_MATCHES_REPROMOTED_POINTER`
- `R11A-S091` `SUPERSEDED_R10_RECEIPT_REJECTED`

### 23.4 MAIN_PREFLIGHT_AND_INSTALLATION

- `R11A-S092` `MAIN_PREFLIGHT_RUNS_BEFORE_NORMAL_WINDOW_SHOW`
- `R11A-S093` `MAIN_PREFLIGHT_RUNS_BEFORE_USER_CONTENT_ACCESS`
- `R11A-S094` `MAIN_PREFLIGHT_EXCLUSIVE_LOCK`
- `R11A-S095` `MAIN_PREFLIGHT_LOCK_STALE_RECOVERY_POLICY`
- `R11A-S096` `MAIN_PREFLIGHT_RELEASE_ADMISSION_FIRST`
- `R11A-S097` `MAIN_PREFLIGHT_POINTER_READBACK`
- `R11A-S098` `MAIN_PREFLIGHT_POINTER_SCHEMA_VALID`
- `R11A-S099` `MAIN_PREFLIGHT_POINTER_SELF_HASH_VALID`
- `R11A-S100` `MAIN_PREFLIGHT_POINTER_GENERATION_MATCH`
- `R11A-S101` `MAIN_PREFLIGHT_POINTER_RAW_HASH_MATCH`
- `R11A-S102` `MAIN_PREFLIGHT_BUILD_MATCH`
- `R11A-S103` `MAIN_PREFLIGHT_PACKAGE_MATCH`
- `R11A-S104` `MAIN_PREFLIGHT_RUNTIME_CLOSURE_MATCH`
- `R11A-S105` `MAIN_PREFLIGHT_EXECUTING_PACKAGE_ROOT_RESOLVED`
- `R11A-S106` `MAIN_PREFLIGHT_EXPECTED_MANIFEST_PRESENT`
- `R11A-S107` `MAIN_PREFLIGHT_EXPECTED_MANIFEST_SELF_HASH_VALID`
- `R11A-S108` `MAIN_PREFLIGHT_MANIFEST_PACKAGE_BINDING`
- `R11A-S109` `MAIN_PREFLIGHT_MANIFEST_BUILD_BINDING`
- `R11A-S110` `MAIN_PREFLIGHT_MANIFEST_CLOSURE_BINDING`
- `R11A-S111` `MAIN_PREFLIGHT_APP_ASAR_HASHED`
- `R11A-S112` `MAIN_PREFLIGHT_UNPACKED_NATIVE_HASHED`
- `R11A-S113` `MAIN_PREFLIGHT_WORKERS_HASHED`
- `R11A-S114` `MAIN_PREFLIGHT_WASM_HASHED`
- `R11A-S115` `MAIN_PREFLIGHT_WGSL_HASHED`
- `R11A-S116` `MAIN_PREFLIGHT_GENERATED_MANIFEST_HASHED`
- `R11A-S117` `MAIN_PREFLIGHT_ACTIVE_GRAPH_HASHED`
- `R11A-S118` `MAIN_PREFLIGHT_EXTRA_EXECUTABLE_ZERO`
- `R11A-S119` `MAIN_PREFLIGHT_SYMLINK_ESCAPE_ZERO`
- `R11A-S120` `MAIN_PREFLIGHT_MIXED_GENERATION_ZERO`
- `R11A-S121` `MAIN_PREFLIGHT_RECEIPT_SELF_HASH_VALID`

### 23.5 SESSION_AND_JOB_GRANT_CRYPTO

- `R11A-S122` `SESSION_SCHEMA_DEFINED`
- `R11A-S123` `SESSION_ID_256BIT_CSPRNG`
- `R11A-S124` `SESSION_GENERATION_MONOTONIC`
- `R11A-S125` `SESSION_BOUND_TO_WEB_CONTENTS_ID`
- `R11A-S126` `SESSION_BOUND_TO_RENDERER_PROCESS_ID`
- `R11A-S127` `SESSION_BOUND_TO_BROWSER_WINDOW_ID`
- `R11A-S128` `SESSION_BOUND_TO_BUILD_ID`
- `R11A-S129` `SESSION_BOUND_TO_PACKAGE_ID`
- `R11A-S130` `SESSION_BOUND_TO_RUNTIME_CLOSURE`
- `R11A-S131` `SESSION_BOUND_TO_POINTER_GENERATION`
- `R11A-S132` `SESSION_BOUND_TO_POINTER_RAW_HASH`
- `R11A-S133` `SESSION_BOUND_TO_ACTIVE_GRAPH_DIGEST`
- `R11A-S134` `SESSION_BOUND_TO_DEVICE_EPOCH`
- `R11A-S135` `SESSION_BOUND_TO_ADAPTER_DIGEST`
- `R11A-S136` `SESSION_BOUND_TO_DRIVER_DIGEST`
- `R11A-S137` `SESSION_BOUND_TO_STARTUP_CANARY_DIGEST`
- `R11A-S138` `SESSION_BOUND_TO_MAIN_BOOT_ID`
- `R11A-S139` `SESSION_HMAC_MAIN_ONLY_KEY`
- `R11A-S140` `SESSION_KEY_NOT_EXPOSED_TO_PRELOAD`
- `R11A-S141` `SESSION_KEY_NOT_EXPOSED_TO_RENDERER`
- `R11A-S142` `SESSION_PUBLIC_ENVELOPE_NO_SECRET`
- `R11A-S143` `SESSION_REGISTRY_SINGLE_WRITER`
- `R11A-S144` `SESSION_REVOCATION_IDEMPOTENT`
- `R11A-S145` `SESSION_STALE_FIELD_REJECTED`
- `R11A-S146` `SESSION_SENDER_MISMATCH_REJECTED`
- `R11A-S147` `JOB_GRANT_SCHEMA_DEFINED`
- `R11A-S148` `JOB_GRANT_OPERATION_SCOPE_ENUM`
- `R11A-S149` `JOB_GRANT_SEQUENCE_MONOTONIC`
- `R11A-S150` `JOB_GRANT_NONCE_128BIT_MINIMUM`
- `R11A-S151` `JOB_GRANT_HMAC_VALIDATED`

### 23.6 PRELOAD_AND_IPC_CONTRACT

- `R11A-S152` `PRELOAD_CONTEXT_ISOLATION_REQUIRED`
- `R11A-S153` `PRELOAD_NODE_INTEGRATION_FALSE`
- `R11A-S154` `PRELOAD_EXPOSES_R11A_NAMESPACE`
- `R11A-S155` `PRELOAD_EXPOSES_NO_FILESYSTEM_PATH`
- `R11A-S156` `PRELOAD_EXPOSES_NO_SIGNING_KEY`
- `R11A-S157` `PRELOAD_EXPOSES_NO_RAW_QUARANTINE_FILE`
- `R11A-S158` `PRELOAD_EXPOSES_PREFLIGHT_STATUS_READ`
- `R11A-S159` `PRELOAD_EXPOSES_SESSION_REQUEST`
- `R11A-S160` `PRELOAD_EXPOSES_JOB_BEGIN`
- `R11A-S161` `PRELOAD_EXPOSES_JOB_COMPLETE`
- `R11A-S162` `PRELOAD_EXPOSES_DEVICE_LOSS_REPORT`
- `R11A-S163` `PRELOAD_EXPOSES_RECOVERY_CANARY_SUBMIT`
- `R11A-S164` `PRELOAD_EXPOSES_RUNTIME_STATUS_READ`
- `R11A-S165` `IPC_CHANNEL_ALLOWLIST_EXACT`
- `R11A-S166` `IPC_REQUEST_SCHEMA_VALIDATED`
- `R11A-S167` `IPC_RESPONSE_SCHEMA_VALIDATED`
- `R11A-S168` `IPC_SENDER_WEB_CONTENTS_BOUND`
- `R11A-S169` `IPC_DESTROYED_SENDER_REJECTED`
- `R11A-S170` `IPC_UNADMITTED_WINDOW_REJECTED`
- `R11A-S171` `IPC_JOB_REPLAY_REJECTED`
- `R11A-S172` `IPC_JOB_SCOPE_MISMATCH_REJECTED`
- `R11A-S173` `IPC_JOB_FINAL_REVISION_BINDING`
- `R11A-S174` `IPC_JOB_ENCODER_BINDING`
- `R11A-S175` `IPC_JOB_OPTIONS_DIGEST_BINDING`
- `R11A-S176` `IPC_SAVE_SESSION_JOB_BINDING`
- `R11A-S177` `IPC_ERROR_CODES_STABLE`
- `R11A-S178` `IPC_NO_GENERIC_SEND_ESCAPE`
- `R11A-S179` `IPC_NO_ARBITRARY_CHANNEL_INVOKE`
- `R11A-S180` `IPC_NEGATIVE_CONTROL_COVERAGE`
- `R11A-S181` `PRELOAD_TYPE_DECLARATION_PRESENT`

### 23.7 RENDERER_BOOT_AND_RUNTIME_SERVICE

- `R11A-S182` `RENDERER_ADMISSION_SERVICE_ID_DEFINED`
- `R11A-S183` `RUNTIME_SERVICE_TOKEN_ADMISSION_ADDED`
- `R11A-S184` `RUNTIME_MODULE_ADMISSION_ADDED`
- `R11A-S185` `ADMISSION_MODULE_REQUIRED_TRUE`
- `R11A-S186` `ADMISSION_MODULE_DEPENDS_ON_HOST`
- `R11A-S187` `ADMISSION_MODULE_DEPENDS_ON_ACTIVE_GRAPH`
- `R11A-S188` `ADMISSION_MODULE_DEPENDS_ON_GPU_AUTHORITY`
- `R11A-S189` `ADMISSION_MODULE_DEPENDS_ON_RESAMPLE_BROKER`
- `R11A-S190` `PREVIEW_MODULE_DEPENDS_ON_ADMISSION`
- `R11A-S191` `EXPORT_MODULE_DEPENDS_ON_ADMISSION`
- `R11A-S192` `UI_FINALIZE_DEPENDS_ON_ADMISSION`
- `R11A-S193` `BOOT_WINDOW_HIDDEN_UNTIL_ADMITTED`
- `R11A-S194` `BOOT_PREFLIGHT_STATUS_REQUIRED`
- `R11A-S195` `BOOT_STARTUP_CANARY_REQUESTED`
- `R11A-S196` `BOOT_STARTUP_CANARY_EVIDENCE_SUBMITTED`
- `R11A-S197` `BOOT_SESSION_ENVELOPE_VERIFIED`
- `R11A-S198` `BOOT_RECEIPT_INCLUDES_ADMISSION_DIGEST`
- `R11A-S199` `BOOT_RECEIPT_PROMOTABLE_REQUIRES_ADMISSION`
- `R11A-S200` `BOOT_READY_EVENT_MAIN_ACKNOWLEDGED`
- `R11A-S201` `BOOT_FAILURE_NEVER_SHOWS_WORKSPACE`
- `R11A-S202` `BOOT_QUARANTINE_SHOWS_RECOVERY_SURFACE_ONLY`
- `R11A-S203` `ADMISSION_SERVICE_STATUS_SNAPSHOT`
- `R11A-S204` `ADMISSION_SERVICE_BEGIN_PREVIEW_JOB`
- `R11A-S205` `ADMISSION_SERVICE_BEGIN_EXPORT_JOB`
- `R11A-S206` `ADMISSION_SERVICE_COMPLETE_JOB`
- `R11A-S207` `ADMISSION_SERVICE_REVOKE_CALLBACK`
- `R11A-S208` `ADMISSION_SERVICE_DEVICE_LOSS_CALLBACK`
- `R11A-S209` `ADMISSION_SERVICE_DISPOSE_REVOKES`
- `R11A-S210` `ADMISSION_SERVICE_RELOAD_STALE_HANDLE_REJECTED`
- `R11A-S211` `ADMISSION_CAPABILITY_PUBLISHED`
- `R11A-S212` `ADMISSION_MODULE_ACTIVE_GRAPH_INCLUDED`

### 23.8 STARTUP_CANARY_AND_R9A_IDENTITY

- `R11A-S213` `STARTUP_CANARY_FIXTURE_SET_DEFINED`
- `R11A-S214` `STARTUP_CANARY_USER_CONTENT_ZERO`
- `R11A-S215` `STARTUP_CANARY_HARDWARE_D3D12_REQUIRED`
- `R11A-S216` `STARTUP_CANARY_SOFTWARE_ADAPTER_FALSE`
- `R11A-S217` `STARTUP_CANARY_DEVICE_EPOCH_CURRENT`
- `R11A-S218` `STARTUP_CANARY_R8A_KERNEL_ID_EXACT`
- `R11A-S219` `STARTUP_CANARY_R8A_KERNEL_CONTRACT_EXACT`
- `R11A-S220` `STARTUP_CANARY_R9A_COMMAND_GRAPH_EXACT`
- `R11A-S221` `STARTUP_CANARY_ENCODER_COUNT_ONE`
- `R11A-S222` `STARTUP_CANARY_SUBMIT_COUNT_ONE`
- `R11A-S223` `STARTUP_CANARY_EXPORT_PREMAP_FENCE_ZERO`
- `R11A-S224` `STARTUP_CANARY_VALIDATION_DOUBLE_DISPATCH_ZERO`
- `R11A-S225` `STARTUP_CANARY_UNIFORM_OVERWRITE_ZERO`
- `R11A-S226` `STARTUP_CANARY_VALIDATION_COUNTER_ZERO`
- `R11A-S227` `STARTUP_CANARY_POSITIVE_CONTROL_NONZERO`
- `R11A-S228` `STARTUP_CANARY_FAULT_SENTINEL_ZERO`
- `R11A-S229` `STARTUP_CANARY_NONFINITE_ZERO`
- `R11A-S230` `STARTUP_CANARY_PRODUCT_REFERENCE_EXACT`
- `R11A-S231` `STARTUP_CANARY_ORACLE_ULP_WITHIN_ONE`
- `R11A-S232` `STARTUP_CANARY_PREVIEW_SMOKE_PASS`
- `R11A-S233` `STARTUP_CANARY_STRICT_EXPORT_SMOKE_PASS`
- `R11A-S234` `STARTUP_CANARY_CPU_FALLBACK_ZERO`
- `R11A-S235` `STARTUP_CANARY_SILENT_FALLBACK_ZERO`
- `R11A-S236` `STARTUP_CANARY_RECEIPT_SELF_HASH_VALID`
- `R11A-S237` `STARTUP_CANARY_PACKAGE_BINDING`
- `R11A-S238` `STARTUP_CANARY_ACTIVE_GRAPH_BINDING`
- `R11A-S239` `STARTUP_CANARY_DEVICE_BINDING`
- `R11A-S240` `STARTUP_CANARY_NO_RUNTIME_TOKEN_SELF_ISSUE`
- `R11A-S241` `STARTUP_CANARY_MAIN_CHALLENGE_BINDING`
- `R11A-S242` `STARTUP_CANARY_REPLAY_REJECTED`

### 23.9 PREVIEW_EXPORT_INTEGRATION

- `R11A-S243` `PREVIEW_SERVICE_ACCEPTS_ADMISSION_GUARD`
- `R11A-S244` `PREVIEW_INITIALIZE_REQUIRES_ADMITTED_SESSION`
- `R11A-S245` `PREVIEW_PRESENT_REQUIRES_PREVIEW_GRANT`
- `R11A-S246` `PREVIEW_SCHEDULER_RECHECKS_GRANT`
- `R11A-S247` `PREVIEW_FRAME_RECEIPT_INCLUDES_SESSION_ID`
- `R11A-S248` `PREVIEW_FRAME_RECEIPT_INCLUDES_JOB_SEQUENCE`
- `R11A-S249` `PREVIEW_FRAME_RECEIPT_INCLUDES_GRANT_DIGEST`
- `R11A-S250` `PREVIEW_REVOKE_SUSPENDS_SCHEDULER`
- `R11A-S251` `PREVIEW_REVOKE_UNCONFIGURES_CANVAS`
- `R11A-S252` `PREVIEW_REVOKE_CLEARS_PENDING_FRAMES`
- `R11A-S253` `PREVIEW_QUARANTINE_STATE_VISIBLE`
- `R11A-S254` `PREVIEW_NO_CANVAS_FALLBACK`
- `R11A-S255` `PREVIEW_NO_WEBGL_FALLBACK`
- `R11A-S256` `PREVIEW_NO_CPU_FALLBACK`
- `R11A-S257` `PREVIEW_STALE_DEVICE_EPOCH_REJECTED`
- `R11A-S258` `EXPORT_SERVICE_ACCEPTS_ADMISSION_GUARD`
- `R11A-S259` `EXPORT_BEGIN_REQUIRES_EXPORT_GRANT`
- `R11A-S260` `EXPORT_GRANT_BINDS_FINAL_REVISION`
- `R11A-S261` `EXPORT_GRANT_BINDS_ENCODER_ID`
- `R11A-S262` `EXPORT_GRANT_BINDS_OPTIONS_DIGEST`
- `R11A-S263` `EXPORT_RECHECK_BEFORE_ENCODE`
- `R11A-S264` `EXPORT_RECHECK_AFTER_ENCODE`
- `R11A-S265` `EXPORT_RECHECK_BEFORE_SAVE`
- `R11A-S266` `EXPORT_RECHECK_AFTER_SAVE`
- `R11A-S267` `EXPORT_REVOKE_ABORTS_HOST_SAVE`
- `R11A-S268` `EXPORT_REVOKE_DISCARDS_ENCODED_BLOB`
- `R11A-S269` `EXPORT_RECEIPT_INCLUDES_SESSION_ID`
- `R11A-S270` `EXPORT_RECEIPT_INCLUDES_JOB_SEQUENCE`
- `R11A-S271` `EXPORT_RECEIPT_INCLUDES_GRANT_DIGEST`
- `R11A-S272` `EXPORT_HOST_SAVE_REQUIRES_VALID_GRANT`

### 23.10 CRASH_DEVICE_LOSS_QUARANTINE

- `R11A-S273` `CRASH_LISTENER_RENDER_PROCESS_GONE`
- `R11A-S274` `CRASH_LISTENER_GPU_PROCESS_GONE`
- `R11A-S275` `CRASH_LISTENER_REGISTERED_ONCE`
- `R11A-S276` `CRASH_EVENT_SESSION_BOUND`
- `R11A-S277` `CRASH_LEDGER_APPEND_ONLY`
- `R11A-S278` `CRASH_LEDGER_HASH_CHAINED`
- `R11A-S279` `CRASH_LEDGER_ATOMIC_WRITE`
- `R11A-S280` `CRASH_LEDGER_READBACK_VERIFIED`
- `R11A-S281` `CRASH_THRESHOLD_RENDERER_3_PER_10`
- `R11A-S282` `CRASH_THRESHOLD_GPU_2_PER_10`
- `R11A-S283` `DEVICE_LOSS_REPORT_FROM_GPU_AUTHORITY`
- `R11A-S284` `DEVICE_LOSS_REVOKES_SESSION_FIRST`
- `R11A-S285` `DEVICE_LOSS_BLOCKS_PREVIEW_EXPORT`
- `R11A-S286` `DEVICE_LOSS_RECOVERY_CHALLENGE_MAIN_OWNED`
- `R11A-S287` `DEVICE_LOSS_NEW_DEVICE_EPOCH_REQUIRED`
- `R11A-S288` `POST_LOSS_CANARY_REQUIRED`
- `R11A-S289` `POST_LOSS_CANARY_SAME_PACKAGE_REQUIRED`
- `R11A-S290` `POST_LOSS_CANARY_COUNTER_ZERO`
- `R11A-S291` `POST_LOSS_NEW_SESSION_GENERATION`
- `R11A-S292` `DEVICE_LOSS_SECOND_PER_SESSION_QUARANTINE`
- `R11A-S293` `DEVICE_LOSS_THIRD_PER_24H_QUARANTINE`
- `R11A-S294` `QUARANTINE_STATE_ATOMIC`
- `R11A-S295` `QUARANTINE_LEDGER_APPEND_ONLY`
- `R11A-S296` `QUARANTINE_CLEAR_NOT_SILENT`
- `R11A-S297` `QUARANTINE_BLOCKS_NEXT_BOOT`
- `R11A-S298` `QUARANTINE_RECOMMENDATION_R10A_BOUND`
- `R11A-S299` `ROLLBACK_TARGET_FROM_R10A_PREVIOUS_ONLY`
- `R11A-S300` `ROLLBACK_RECOMMENDATION_NO_POINTER_WRITE`
- `R11A-S301` `QUARANTINE_NO_NETWORK_TELEMETRY`
- `R11A-S302` `QUARANTINE_NO_USER_CONTENT`

### 23.11 SOURCE_NEGATIVE_AND_FINALIZATION

- `R11A-S303` `NEGATIVE_UNSIGNED_R10A_RECEIPT`
- `R11A-S304` `NEGATIVE_OLD_R10_RECEIPT`
- `R11A-S305` `NEGATIVE_POINTER_BUILD_MISMATCH`
- `R11A-S306` `NEGATIVE_POINTER_PACKAGE_MISMATCH`
- `R11A-S307` `NEGATIVE_INSTALLED_HASH_MISMATCH`
- `R11A-S308` `NEGATIVE_EXTRA_EXECUTABLE`
- `R11A-S309` `NEGATIVE_RENDERER_FORGED_SESSION`
- `R11A-S310` `NEGATIVE_STALE_SESSION_GENERATION`
- `R11A-S311` `NEGATIVE_WRONG_WEB_CONTENTS`
- `R11A-S312` `NEGATIVE_PREVIEW_WITHOUT_GRANT`
- `R11A-S313` `NEGATIVE_EXPORT_WITHOUT_GRANT`
- `R11A-S314` `NEGATIVE_SAVE_WITHOUT_GRANT`
- `R11A-S315` `NEGATIVE_GRANT_REPLAY`
- `R11A-S316` `NEGATIVE_WRONG_OPERATION_SCOPE`
- `R11A-S317` `NEGATIVE_DEVICE_EPOCH_STALE`
- `R11A-S318` `NEGATIVE_CANARY_REPLAY`
- `R11A-S319` `NEGATIVE_CRASH_THRESHOLD_IGNORED`
- `R11A-S320` `NEGATIVE_QUARANTINE_CLEAR`
- `R11A-S321` `NEGATIVE_ROLLBACK_TARGET_INVENTED`
- `R11A-S322` `NEGATIVE_POINTER_WRITE_ATTEMPT`
- `R11A-S323` `SOURCE_SCHEMA_ARTIFACTS_GENERATED`
- `R11A-S324` `SOURCE_RUNTIME_SELF_TESTS_PASS`
- `R11A-S325` `SOURCE_ACTIVE_GRAPH_UPDATED`
- `R11A-S326` `SOURCE_JAVASCRIPT_PARSE_CLOSURE`
- `R11A-S327` `SOURCE_PREDECESSOR_REGRESSION_PASS`
- `R11A-S328` `SOURCE_PARENT_POINTER_UNCHANGED`
- `R11A-S329` `SOURCE_GATE_COUNT_332`
- `R11A-S330` `SOURCE_FAIL_ZERO`
- `R11A-S331` `SOURCE_FINAL_RECEIPT_SELF_HASH_VALID`
- `R11A-S332` `SOURCE_STATE_EXACT`

---

## 24. Installed gate catalog

### 24.1 RELEASE_AND_PACKAGE_ADMISSION

- `R11A-P001` `R10A_FINAL_RELEASE_RECEIPT_PRESENT`
- `R11A-P002` `R10A_FINAL_RELEASE_STATE_EXACT`
- `R11A-P003` `R10A_FINAL_RELEASE_SELF_HASH_VALID`
- `R11A-P004` `R10A_SOURCE_PASS_260_INSTALLED`
- `R11A-P005` `R10A_RELEASE_PASS_300_INSTALLED`
- `R11A-P006` `R10A_UNRESOLVED_ZERO`
- `R11A-P007` `R10A_LINEAGE_RECEIPT_PRESENT`
- `R11A-P008` `R10A_LINEAGE_STATE_EXACT`
- `R11A-P009` `R10A_LINEAGE_SELF_HASH_VALID_INSTALLED`
- `R11A-P010` `R10A_LINEAGE_HEAD_EXACT`
- `R11A-P011` `R10A_R8A_CURRENT`
- `R11A-P012` `R10A_R9A_SOURCE_CURRENT`
- `R11A-P013` `R10A_R9A_PHYSICAL_CURRENT`
- `R11A-P014` `R10A_RELEASE_CURRENT`
- `R11A-P015` `R10A_R11A_REQUIRED_NOT_CURRENT_INSTALLED`
- `R11A-P016` `PRODUCTION_POINTER_SCHEMA_V3`
- `R11A-P017` `PRODUCTION_POINTER_SELF_HASH_VALID`
- `R11A-P018` `PRODUCTION_POINTER_RAW_HASH_MATCH_R10A`
- `R11A-P019` `PRODUCTION_POINTER_GENERATION_MATCH_R10A`
- `R11A-P020` `PRODUCTION_POINTER_BUILD_MATCH_R10A`
- `R11A-P021` `PRODUCTION_POINTER_PACKAGE_MATCH_R10A`
- `R11A-P022` `EXECUTING_PACKAGE_MATCH_POINTER`
- `R11A-P023` `EXECUTING_BUILD_MATCH_POINTER`
- `R11A-P024` `RUNTIME_CLOSURE_MATCH_R10A`
- `R11A-P025` `PACKAGE_CONTENT_ID_RECOMPUTED`
- `R11A-P026` `PACKAGE_CONTENT_ID_EXACT`
- `R11A-P027` `PACKAGE_READ_ONLY`
- `R11A-P028` `PACKAGE_PRE_POST_HASH_EQUAL`
- `R11A-P029` `R8A_SOURCE_RECEIPT_IN_PACKAGE`
- `R11A-P030` `R9A_SOURCE_RECEIPT_IN_PACKAGE`
- `R11A-P031` `R9A_PHYSICAL_RECEIPT_IN_PACKAGE`
- `R11A-P032` `ACTIVE_GRAPH_RECEIPT_IN_PACKAGE`
- `R11A-P033` `JAVASCRIPT_PARSE_RECEIPT_IN_PACKAGE`
- `R11A-P034` `EXPECTED_INSTALLATION_MANIFEST_PRESENT`
- `R11A-P035` `EXPECTED_INSTALLATION_MANIFEST_VALID`
- `R11A-P036` `INSTALLED_FILE_COUNT_EXACT`
- `R11A-P037` `INSTALLED_TOTAL_BYTES_EXACT`
- `R11A-P038` `INSTALLED_PATH_SET_DIGEST_EXACT`
- `R11A-P039` `INSTALLED_EXTRA_EXECUTABLE_ZERO`
- `R11A-P040` `INSTALLED_SYMLINK_ESCAPE_ZERO`

### 24.2 MAIN_PREFLIGHT_EXECUTION

- `R11A-P041` `PACKAGED_ELECTRON_TRUE`
- `R11A-P042` `MAIN_PROCESS_BOOT_ID_CREATED`
- `R11A-P043` `MAIN_PREFLIGHT_LOCK_ACQUIRED`
- `R11A-P044` `MAIN_PREFLIGHT_LOCK_SINGLE_OWNER`
- `R11A-P045` `QUARANTINE_STATE_READ_BEFORE_WINDOW`
- `R11A-P046` `ACTIVE_QUARANTINE_BLOCKS_NORMAL_WINDOW`
- `R11A-P047` `R10A_ADMISSION_BEFORE_WINDOW`
- `R11A-P048` `POINTER_READ_BEFORE_WINDOW`
- `R11A-P049` `INSTALLATION_ATTESTATION_BEFORE_WINDOW`
- `R11A-P050` `NO_USER_CONTENT_READ_BEFORE_ADMISSION`
- `R11A-P051` `BROWSER_WINDOW_CREATED_HIDDEN`
- `R11A-P052` `BROWSER_WINDOW_SHOW_FALSE`
- `R11A-P053` `PRELOAD_PATH_CANONICAL`
- `R11A-P054` `CONTEXT_ISOLATION_TRUE`
- `R11A-P055` `NODE_INTEGRATION_FALSE`
- `R11A-P056` `DEVTOOLS_FALSE`
- `R11A-P057` `ADMISSION_WINDOW_ID_RECORDED`
- `R11A-P058` `WEB_CONTENTS_ID_RECORDED`
- `R11A-P059` `RENDERER_PROCESS_ID_RECORDED`
- `R11A-P060` `MAIN_PREFLIGHT_RECEIPT_WRITTEN`
- `R11A-P061` `MAIN_PREFLIGHT_RECEIPT_FSYNC`
- `R11A-P062` `MAIN_PREFLIGHT_RECEIPT_READBACK`
- `R11A-P063` `MAIN_PREFLIGHT_RECEIPT_SELF_HASH_VALID_INSTALLED`
- `R11A-P064` `MAIN_PREFLIGHT_PACKAGE_BINDING`
- `R11A-P065` `MAIN_PREFLIGHT_POINTER_BINDING`
- `R11A-P066` `MAIN_PREFLIGHT_RELEASE_BINDING`
- `R11A-P067` `MAIN_PREFLIGHT_ACTIVE_GRAPH_BINDING`
- `R11A-P068` `MAIN_PREFLIGHT_ZERO_POINTER_MUTATION`
- `R11A-P069` `MAIN_PREFLIGHT_ZERO_LOCAL_POINTER_MUTATION`
- `R11A-P070` `MAIN_PREFLIGHT_PASS`

### 24.3 HIDDEN_RENDERER_STARTUP_CANARY

- `R11A-P071` `RENDERER_LOADED_WHILE_HIDDEN`
- `R11A-P072` `RENDERER_PREFLIGHT_STATUS_MATCH`
- `R11A-P073` `RENDERER_BUILD_ID_MATCH`
- `R11A-P074` `RENDERER_ACTIVE_GRAPH_DIGEST_MATCH`
- `R11A-P075` `GPU_HARDWARE_D3D12`
- `R11A-P076` `GPU_SOFTWARE_ADAPTER_FALSE`
- `R11A-P077` `GPU_DEVICE_EPOCH_POSITIVE`
- `R11A-P078` `ADAPTER_IDENTITY_DIGEST_PRESENT`
- `R11A-P079` `DRIVER_IDENTITY_DIGEST_PRESENT`
- `R11A-P080` `CANARY_CHALLENGE_ISSUED_BY_MAIN`
- `R11A-P081` `CANARY_CHALLENGE_NONCE_UNIQUE`
- `R11A-P082` `CANARY_FIXTURE_SET_EXACT`
- `R11A-P083` `CANARY_NO_USER_FILE_INPUT`
- `R11A-P084` `CANARY_R8A_KERNEL_ID_EXACT`
- `R11A-P085` `CANARY_R8A_CONTRACT_DIGEST_EXACT`
- `R11A-P086` `CANARY_R9A_COMMAND_GRAPH_DIGEST_EXACT`
- `R11A-P087` `CANARY_ENCODER_COUNT_ONE`
- `R11A-P088` `CANARY_SUBMIT_COUNT_ONE`
- `R11A-P089` `CANARY_PREMAP_FENCE_ZERO`
- `R11A-P090` `CANARY_DOUBLE_DISPATCH_ZERO`
- `R11A-P091` `CANARY_UNIFORM_OVERWRITE_ZERO`
- `R11A-P092` `CANARY_VALIDATION_COUNTER_ZERO`
- `R11A-P093` `CANARY_POSITIVE_CONTROL_OBSERVED`
- `R11A-P094` `CANARY_FAULT_SENTINEL_ZERO`
- `R11A-P095` `CANARY_NONFINITE_ZERO`
- `R11A-P096` `CANARY_PRODUCT_REFERENCE_EXACT`
- `R11A-P097` `CANARY_ORACLE_MAX_ULP_ONE`
- `R11A-P098` `CANARY_PREVIEW_SMOKE_PASS`
- `R11A-P099` `CANARY_EXPORT_SMOKE_PASS`
- `R11A-P100` `CANARY_CPU_FALLBACK_ZERO`
- `R11A-P101` `CANARY_SILENT_FALLBACK_ZERO`
- `R11A-P102` `CANARY_RECEIPT_PACKAGE_MATCH`
- `R11A-P103` `CANARY_RECEIPT_POINTER_MATCH`
- `R11A-P104` `CANARY_RECEIPT_DEVICE_EPOCH_MATCH`
- `R11A-P105` `CANARY_RECEIPT_ACTIVE_GRAPH_MATCH`
- `R11A-P106` `CANARY_RECEIPT_CHALLENGE_MATCH`
- `R11A-P107` `CANARY_RECEIPT_SELF_HASH_VALID`
- `R11A-P108` `CANARY_REPLAY_ZERO`
- `R11A-P109` `CANARY_PASS`
- `R11A-P110` `WORKSPACE_STILL_HIDDEN_BEFORE_TOKEN`

### 24.4 SESSION_ISSUANCE_AND_BOOT_CONTINUATION

- `R11A-P111` `MAIN_SESSION_RECORD_CREATED`
- `R11A-P112` `SESSION_ID_RANDOM_256BIT`
- `R11A-P113` `SESSION_GENERATION_ONE`
- `R11A-P114` `SESSION_WEB_CONTENTS_BOUND`
- `R11A-P115` `SESSION_RENDERER_PID_BOUND`
- `R11A-P116` `SESSION_WINDOW_BOUND`
- `R11A-P117` `SESSION_BUILD_BOUND`
- `R11A-P118` `SESSION_PACKAGE_BOUND`
- `R11A-P119` `SESSION_CLOSURE_BOUND`
- `R11A-P120` `SESSION_POINTER_GENERATION_BOUND`
- `R11A-P121` `SESSION_POINTER_HASH_BOUND`
- `R11A-P122` `SESSION_ACTIVE_GRAPH_BOUND`
- `R11A-P123` `SESSION_DEVICE_EPOCH_BOUND`
- `R11A-P124` `SESSION_ADAPTER_BOUND`
- `R11A-P125` `SESSION_DRIVER_BOUND`
- `R11A-P126` `SESSION_CANARY_BOUND`
- `R11A-P127` `SESSION_MAIN_BOOT_BOUND`
- `R11A-P128` `SESSION_HMAC_VALID`
- `R11A-P129` `SESSION_SIGNING_KEY_MAIN_ONLY`
- `R11A-P130` `SESSION_PUBLIC_ENVELOPE_FROZEN`
- `R11A-P131` `SESSION_REQUEST_SINGLE_USE`
- `R11A-P132` `DUPLICATE_SESSION_REQUEST_REJECTED`
- `R11A-P133` `SESSION_CAPABILITY_PUBLISHED`
- `R11A-P134` `BOOT_RECEIPT_ADMISSION_DIGEST_PRESENT`
- `R11A-P135` `BOOT_RECEIPT_PROMOTABLE_TRUE`
- `R11A-P136` `RENDERER_READY_SIGNAL_SESSION_BOUND`
- `R11A-P137` `MAIN_READY_ACK_SESSION_BOUND`
- `R11A-P138` `WINDOW_SHOWN_AFTER_ACK`
- `R11A-P139` `WINDOW_NOT_SHOWN_EARLY`
- `R11A-P140` `UI_WORKSPACE_CAPABILITY_ACTIVE`
- `R11A-P141` `SESSION_MARKER_WRITTEN`
- `R11A-P142` `SESSION_MARKER_FSYNC`
- `R11A-P143` `SESSION_MARKER_READBACK`
- `R11A-P144` `SESSION_MARKER_SELF_HASH_VALID`
- `R11A-P145` `SESSION_START_LEDGER_APPEND`
- `R11A-P146` `SESSION_START_LEDGER_HASH_CHAIN`
- `R11A-P147` `SESSION_START_LEDGER_READBACK`
- `R11A-P148` `SESSION_TOKEN_ISSUANCE_COUNT_ONE`
- `R11A-P149` `SESSION_ADMITTED_STATE_EXACT`
- `R11A-P150` `NORMAL_WORKSPACE_INTERACTIVE`

### 24.5 PREVIEW_JOB_ENFORCEMENT

- `R11A-P151` `PREVIEW_JOB_GRANT_ISSUED`
- `R11A-P152` `PREVIEW_JOB_GRANT_SCOPE_PREVIEW`
- `R11A-P153` `PREVIEW_JOB_GRANT_SESSION_MATCH`
- `R11A-P154` `PREVIEW_JOB_GRANT_SENDER_MATCH`
- `R11A-P155` `PREVIEW_JOB_GRANT_DEVICE_EPOCH_MATCH`
- `R11A-P156` `PREVIEW_JOB_GRANT_ACTIVE_GRAPH_MATCH`
- `R11A-P157` `PREVIEW_JOB_SEQUENCE_MONOTONIC`
- `R11A-P158` `PREVIEW_JOB_NONCE_UNIQUE`
- `R11A-P159` `PREVIEW_JOB_HMAC_VALID`
- `R11A-P160` `PREVIEW_JOB_REPLAY_ZERO`
- `R11A-P161` `PREVIEW_PRESENTER_REQUIRES_GRANT`
- `R11A-P162` `PREVIEW_SCHEDULER_REQUIRES_GRANT`
- `R11A-P163` `PREVIEW_FINAL_REVISION_BOUND`
- `R11A-P164` `PREVIEW_SURFACE_ID_BOUND`
- `R11A-P165` `PREVIEW_FRAME_RECEIPT_SESSION_MATCH`
- `R11A-P166` `PREVIEW_FRAME_RECEIPT_JOB_MATCH`
- `R11A-P167` `PREVIEW_FRAME_RECEIPT_GRANT_DIGEST_MATCH`
- `R11A-P168` `PREVIEW_FRAME_RECEIPT_DEVICE_EPOCH_MATCH`
- `R11A-P169` `PREVIEW_COMPLETION_RECORDED`
- `R11A-P170` `PREVIEW_COMPLETION_SINGLE_USE`
- `R11A-P171` `PREVIEW_WITHOUT_SESSION_REJECTED`
- `R11A-P172` `PREVIEW_WITHOUT_GRANT_REJECTED`
- `R11A-P173` `PREVIEW_WRONG_SCOPE_REJECTED`
- `R11A-P174` `PREVIEW_STALE_GRANT_REJECTED`
- `R11A-P175` `PREVIEW_STALE_EPOCH_REJECTED`
- `R11A-P176` `PREVIEW_REVOKED_SESSION_REJECTED`
- `R11A-P177` `PREVIEW_CANVAS_FALLBACK_ZERO`
- `R11A-P178` `PREVIEW_WEBGL_FALLBACK_ZERO`
- `R11A-P179` `PREVIEW_CPU_FALLBACK_ZERO`
- `R11A-P180` `PREVIEW_PASS`

### 24.6 EXPORT_JOB_AND_SAVE_ENFORCEMENT

- `R11A-P181` `EXPORT_JOB_GRANT_ISSUED`
- `R11A-P182` `EXPORT_JOB_GRANT_SCOPE_EXPORT`
- `R11A-P183` `EXPORT_JOB_GRANT_SESSION_MATCH`
- `R11A-P184` `EXPORT_JOB_GRANT_SENDER_MATCH`
- `R11A-P185` `EXPORT_JOB_GRANT_FINAL_REVISION_MATCH`
- `R11A-P186` `EXPORT_JOB_GRANT_ENCODER_MATCH`
- `R11A-P187` `EXPORT_JOB_GRANT_OPTIONS_DIGEST_MATCH`
- `R11A-P188` `EXPORT_JOB_SEQUENCE_MONOTONIC`
- `R11A-P189` `EXPORT_JOB_NONCE_UNIQUE`
- `R11A-P190` `EXPORT_JOB_HMAC_VALID`
- `R11A-P191` `EXPORT_JOB_REPLAY_ZERO`
- `R11A-P192` `EXPORT_AUTHORITY_PRECHECK_PASS`
- `R11A-P193` `EXPORT_AUTHORITY_POST_ENCODE_RECHECK_PASS`
- `R11A-P194` `EXPORT_AUTHORITY_PRE_SAVE_RECHECK_PASS`
- `R11A-P195` `EXPORT_AUTHORITY_POST_SAVE_RECHECK_PASS`
- `R11A-P196` `EXPORT_ENCODER_IDENTITY_EXACT`
- `R11A-P197` `EXPORT_R8A_KERNEL_IDENTITY_EXACT`
- `R11A-P198` `EXPORT_R9A_COMMAND_GRAPH_IDENTITY_EXACT`
- `R11A-P199` `EXPORT_VALIDATION_COUNTER_ZERO`
- `R11A-P200` `EXPORT_UNIFORM_OVERWRITE_ZERO`
- `R11A-P201` `EXPORT_CPU_FALLBACK_ZERO`
- `R11A-P202` `EXPORT_SILENT_FALLBACK_ZERO`
- `R11A-P203` `HOST_SAVE_BEGIN_REQUIRES_GRANT`
- `R11A-P204` `HOST_SAVE_CHUNK_SESSION_BOUND`
- `R11A-P205` `HOST_SAVE_COMMIT_REQUIRES_GRANT`
- `R11A-P206` `HOST_SAVE_ABORT_ON_REVOKE`
- `R11A-P207` `HOST_SAVE_ATOMIC_RENAME`
- `R11A-P208` `HOST_SAVE_FSYNC`
- `R11A-P209` `HOST_SAVE_READBACK_DIGEST`
- `R11A-P210` `EXPORT_RECEIPT_SESSION_ID`
- `R11A-P211` `EXPORT_RECEIPT_JOB_SEQUENCE`
- `R11A-P212` `EXPORT_RECEIPT_GRANT_DIGEST`
- `R11A-P213` `EXPORT_RECEIPT_SAVE_DIGEST`
- `R11A-P214` `EXPORT_COMPLETION_SINGLE_USE`
- `R11A-P215` `EXPORT_WITHOUT_SESSION_REJECTED`
- `R11A-P216` `EXPORT_WITHOUT_GRANT_REJECTED`
- `R11A-P217` `EXPORT_WRONG_SCOPE_REJECTED`
- `R11A-P218` `EXPORT_STALE_GRANT_REJECTED`
- `R11A-P219` `EXPORT_MID_JOB_REVOKE_DISCARDS_OUTPUT`
- `R11A-P220` `EXPORT_PASS`

### 24.7 DEVICE_LOSS_RECOVERY

- `R11A-P221` `DEVICE_LOSS_EVENT_GPU_AUTHORITY_ORIGIN`
- `R11A-P222` `DEVICE_LOSS_EVENT_SESSION_BOUND`
- `R11A-P223` `DEVICE_LOSS_EVENT_DEVICE_EPOCH_MATCH`
- `R11A-P224` `DEVICE_LOSS_REVOKES_SESSION`
- `R11A-P225` `DEVICE_LOSS_REVOKES_OPEN_GRANTS`
- `R11A-P226` `DEVICE_LOSS_ABORTS_EXPORT_SAVE`
- `R11A-P227` `DEVICE_LOSS_SUSPENDS_PREVIEW`
- `R11A-P228` `DEVICE_LOSS_CANVAS_UNCONFIGURED`
- `R11A-P229` `DEVICE_LOSS_RECOVERY_STATE_ENTERED`
- `R11A-P230` `DEVICE_LOSS_LEDGER_APPEND`
- `R11A-P231` `DEVICE_LOSS_LEDGER_HASH_CHAIN`
- `R11A-P232` `DEVICE_LOSS_COUNT_SESSION_INCREMENT`
- `R11A-P233` `DEVICE_LOSS_COUNT_24H_INCREMENT`
- `R11A-P234` `FIRST_LOSS_RECOVERY_ALLOWED`
- `R11A-P235` `RECOVERY_CHALLENGE_MAIN_OWNED`
- `R11A-P236` `RECOVERY_NEW_DEVICE_EPOCH_REQUIRED`
- `R11A-P237` `RECOVERY_NEW_ADAPTER_DIGEST_PRESENT`
- `R11A-P238` `RECOVERY_NEW_DRIVER_DIGEST_PRESENT`
- `R11A-P239` `RECOVERY_SAME_BUILD_REQUIRED`
- `R11A-P240` `RECOVERY_SAME_PACKAGE_REQUIRED`
- `R11A-P241` `RECOVERY_POINTER_UNCHANGED_REQUIRED`
- `R11A-P242` `RECOVERY_ACTIVE_GRAPH_UNCHANGED_REQUIRED`
- `R11A-P243` `RECOVERY_R8A_KERNEL_ID_EXACT`
- `R11A-P244` `RECOVERY_R9A_COMMAND_GRAPH_EXACT`
- `R11A-P245` `RECOVERY_VALIDATION_COUNTER_ZERO`
- `R11A-P246` `RECOVERY_PRODUCT_REFERENCE_EXACT`
- `R11A-P247` `RECOVERY_ORACLE_ULP_ONE`
- `R11A-P248` `RECOVERY_PREVIEW_SMOKE_PASS`
- `R11A-P249` `RECOVERY_EXPORT_SMOKE_PASS`
- `R11A-P250` `RECOVERY_CPU_FALLBACK_ZERO`
- `R11A-P251` `RECOVERY_SILENT_FALLBACK_ZERO`
- `R11A-P252` `RECOVERY_CANARY_SELF_HASH_VALID`
- `R11A-P253` `RECOVERY_CANARY_CHALLENGE_MATCH`
- `R11A-P254` `RECOVERY_OLD_SESSION_REMAINS_REVOKED`
- `R11A-P255` `RECOVERY_NEW_SESSION_GENERATION_TWO`
- `R11A-P256` `RECOVERY_NEW_SESSION_HMAC_VALID`
- `R11A-P257` `RECOVERY_WINDOW_REMAINS_SAME`
- `R11A-P258` `RECOVERY_PREVIEW_RESUMED_AFTER_TOKEN`
- `R11A-P259` `RECOVERY_EXPORT_RESUMED_AFTER_TOKEN`
- `R11A-P260` `FIRST_LOSS_RECOVERY_PASS`
- `R11A-P261` `SECOND_LOSS_SAME_SESSION_QUARANTINE`
- `R11A-P262` `THIRD_LOSS_24H_QUARANTINE`
- `R11A-P263` `POST_LOSS_CANARY_FAILURE_QUARANTINE`
- `R11A-P264` `STALE_RECOVERY_RECEIPT_REJECTED`
- `R11A-P265` `DEVICE_LOSS_RECOVERY_FINAL_RECEIPT`

### 24.8 CRASH_QUARANTINE_AND_ROLLBACK

- `R11A-P266` `RENDER_PROCESS_GONE_LISTENER_ACTIVE`
- `R11A-P267` `GPU_PROCESS_GONE_LISTENER_ACTIVE`
- `R11A-P268` `CRASH_LISTENER_DUPLICATE_ZERO`
- `R11A-P269` `CRASH_EVENT_SESSION_ID_PRESENT`
- `R11A-P270` `CRASH_EVENT_PACKAGE_ID_PRESENT`
- `R11A-P271` `CRASH_EVENT_POINTER_GENERATION_PRESENT`
- `R11A-P272` `CRASH_EVENT_NO_USER_CONTENT`
- `R11A-P273` `CRASH_LEDGER_APPEND_ONLY_INSTALLED`
- `R11A-P274` `CRASH_LEDGER_HASH_CHAIN_VALID`
- `R11A-P275` `CRASH_LEDGER_FSYNC`
- `R11A-P276` `CRASH_LEDGER_READBACK`
- `R11A-P277` `CLEAN_SESSION_TERMINATION_RECORDED`
- `R11A-P278` `UNCLEAN_SESSION_DETECTED_NEXT_BOOT`
- `R11A-P279` `LAST_10_SESSION_WINDOW_EXACT`
- `R11A-P280` `RENDERER_CRASH_COUNT_COMPUTED`
- `R11A-P281` `GPU_CRASH_COUNT_COMPUTED`
- `R11A-P282` `RENDERER_THRESHOLD_3_TRIGGER`
- `R11A-P283` `GPU_THRESHOLD_2_TRIGGER`
- `R11A-P284` `BELOW_THRESHOLD_NO_QUARANTINE`
- `R11A-P285` `THRESHOLD_TRIGGER_REVOKES_SESSION`
- `R11A-P286` `THRESHOLD_TRIGGER_BLOCKS_WINDOW`
- `R11A-P287` `QUARANTINE_RECORD_ATOMIC`
- `R11A-P288` `QUARANTINE_RECORD_SELF_HASH_VALID`
- `R11A-P289` `QUARANTINE_REASON_STABLE`
- `R11A-P290` `QUARANTINE_EVIDENCE_PACKAGE_BOUND`
- `R11A-P291` `QUARANTINE_EVIDENCE_POINTER_BOUND`
- `R11A-P292` `QUARANTINE_EVIDENCE_SESSION_BOUND`
- `R11A-P293` `QUARANTINE_ACTIVE_NEXT_BOOT`
- `R11A-P294` `QUARANTINE_CLEAR_FORBIDDEN`
- `R11A-P295` `ROLLBACK_RECOMMENDATION_CREATED`
- `R11A-P296` `ROLLBACK_TARGET_FROM_R10A_PREVIOUS`
- `R11A-P297` `ROLLBACK_TARGET_QUALIFIED_CURRENT_LINEAGE`
- `R11A-P298` `ROLLBACK_RECOMMENDATION_SELF_HASH_VALID`
- `R11A-P299` `ROLLBACK_RECOMMENDATION_R10A_INPUT_ONLY`
- `R11A-P300` `ROLLBACK_RECOMMENDATION_POINTER_MUTATION_FALSE`
- `R11A-P301` `ROLLBACK_RECOMMENDATION_LOCAL_POINTER_MUTATION_FALSE`
- `R11A-P302` `ROLLBACK_RECOMMENDATION_NO_INVENTED_TARGET`
- `R11A-P303` `ROLLBACK_RECOMMENDATION_NO_NETWORK_SEND`
- `R11A-P304` `QUARANTINE_STATE_EXACT`
- `R11A-P305` `QUARANTINE_DRILL_PASS`

### 24.9 PRIVACY_SOAK_AND_FINAL

- `R11A-P306` `EVIDENCE_USER_PATH_ZERO`
- `R11A-P307` `EVIDENCE_FILENAME_ZERO`
- `R11A-P308` `EVIDENCE_PIXEL_HASH_ZERO`
- `R11A-P309` `EVIDENCE_IMAGE_BYTES_ZERO`
- `R11A-P310` `EVIDENCE_THUMBNAIL_ZERO`
- `R11A-P311` `EVIDENCE_EXIF_ZERO`
- `R11A-P312` `EVIDENCE_ACCOUNT_ZERO`
- `R11A-P313` `EVIDENCE_EMAIL_ZERO`
- `R11A-P314` `EVIDENCE_PRECISE_LOCATION_ZERO`
- `R11A-P315` `EVIDENCE_HARDWARE_SERIAL_ZERO`
- `R11A-P316` `NETWORK_TELEMETRY_ZERO`
- `R11A-P317` `SESSION_SOAK_NORMAL_STARTS_10`
- `R11A-P318` `SESSION_SOAK_NORMAL_TERMINATIONS_10`
- `R11A-P319` `SESSION_SOAK_TOKEN_REPLAY_ZERO`
- `R11A-P320` `SESSION_SOAK_GRANT_REPLAY_ZERO`
- `R11A-P321` `SESSION_SOAK_PREVIEW_JOBS_POSITIVE`
- `R11A-P322` `SESSION_SOAK_EXPORT_JOBS_POSITIVE`
- `R11A-P323` `SESSION_SOAK_PENDING_JOBS_ZERO`
- `R11A-P324` `SESSION_SOAK_SAVE_SESSIONS_ZERO`
- `R11A-P325` `SESSION_SOAK_LISTENER_COUNT_STABLE`
- `R11A-P326` `SESSION_SOAK_REGISTRY_SIZE_ZERO_AFTER_CLOSE`
- `R11A-P327` `SESSION_SOAK_MEMORY_PLATEAU`
- `R11A-P328` `SESSION_SOAK_POINTER_UNCHANGED`
- `R11A-P329` `SESSION_SOAK_PACKAGE_BYTES_UNCHANGED`
- `R11A-P330` `INSTALLATION_FINAL_RECEIPT_PRESENT`
- `R11A-P331` `INSTALLATION_FINAL_RECEIPT_SELF_HASH_VALID`
- `R11A-P332` `INSTALLATION_FINAL_RECEIPT_CHILD_DIGESTS`
- `R11A-P333` `INSTALLATION_FINAL_RECEIPT_SOURCE_PASS_332`
- `R11A-P334` `INSTALLATION_FINAL_RECEIPT_INSTALLED_PASS_400`
- `R11A-P335` `INSTALLATION_FINAL_RECEIPT_UNRESOLVED_ZERO`
- `R11A-P336` `INSTALLATION_FINAL_RECEIPT_QUARANTINED_FALSE`
- `R11A-P337` `INSTALLATION_FINAL_RECEIPT_TOKEN_ISSUED_TRUE`
- `R11A-P338` `INSTALLATION_FINAL_RECEIPT_PREVIEW_ENFORCED_TRUE`
- `R11A-P339` `INSTALLATION_FINAL_RECEIPT_EXPORT_ENFORCED_TRUE`
- `R11A-P340` `INSTALLATION_FINAL_RECEIPT_CRASH_MONITOR_TRUE`
- `R11A-P341` `INSTALLATION_FINAL_RECEIPT_DEVICE_LOSS_DRILL_TRUE`
- `R11A-P342` `INSTALLATION_FINAL_RECEIPT_POINTER_MUTATION_FALSE`
- `R11A-P343` `INSTALLATION_FINAL_RECEIPT_LOCAL_POINTER_MUTATION_FALSE`
- `R11A-P344` `FINAL_STATE_EXACT`
- `R11A-P345` `NEXT_AUTHORITY_R12A`

### 24.10 MULTI_WINDOW_POINTER_DRIFT_LAZY_ASSET_AND_CLEANUP

- `R11A-P346` `MULTI_WINDOW_SECOND_NORMAL_WINDOW_REJECTED`
- `R11A-P347` `MULTI_WINDOW_RECOVERY_WINDOW_SEPARATE_CAPABILITY`
- `R11A-P348` `MULTI_WINDOW_R9_PHYSICAL_WINDOW_EXCLUDED`
- `R11A-P349` `MULTI_WINDOW_SESSION_NOT_SHARED`
- `R11A-P350` `MULTI_WINDOW_WEB_CONTENTS_BINDING_EXACT`
- `R11A-P351` `MULTI_WINDOW_WINDOW_CLOSE_REVOKES_ONLY_BOUND_SESSION`
- `R11A-P352` `MULTI_WINDOW_DESTROYED_SENDER_GRANT_REJECTED`
- `R11A-P353` `MULTI_WINDOW_NAVIGATION_REVOKES_SESSION`
- `R11A-P354` `MULTI_WINDOW_NEW_WINDOW_REQUIRES_PREFLIGHT`
- `R11A-P355` `MULTI_WINDOW_LISTENER_OWNERSHIP_STABLE`
- `R11A-P356` `POINTER_DRIFT_WATCH_ACTIVE`
- `R11A-P357` `POINTER_DRIFT_GENERATION_CHANGE_DETECTED`
- `R11A-P358` `POINTER_DRIFT_RAW_HASH_CHANGE_DETECTED`
- `R11A-P359` `POINTER_DRIFT_BUILD_CHANGE_DETECTED`
- `R11A-P360` `POINTER_DRIFT_PACKAGE_CHANGE_DETECTED`
- `R11A-P361` `POINTER_DRIFT_REVOKES_SESSION`
- `R11A-P362` `POINTER_DRIFT_REVOKES_OPEN_GRANTS`
- `R11A-P363` `POINTER_DRIFT_BLOCKS_SAVE_COMMIT`
- `R11A-P364` `POINTER_DRIFT_QUARANTINE_OR_RESTART_REQUIRED`
- `R11A-P365` `POINTER_DRIFT_R11A_POINTER_WRITE_ZERO`
- `R11A-P366` `LAZY_ASSET_ADMISSION_ACTIVE`
- `R11A-P367` `LAZY_WORKER_HASH_REVALIDATED`
- `R11A-P368` `LAZY_WASM_HASH_REVALIDATED`
- `R11A-P369` `LAZY_PTHREAD_HELPER_HASH_REVALIDATED`
- `R11A-P370` `LAZY_NATIVE_ADDON_HASH_REVALIDATED`
- `R11A-P371` `LAZY_WGSL_HASH_REVALIDATED`
- `R11A-P372` `LAZY_GENERATED_MANIFEST_HASH_REVALIDATED`
- `R11A-P373` `LAZY_ASSET_PACKAGE_GENERATION_MATCH`
- `R11A-P374` `LAZY_ASSET_DRIFT_REVOKES_SESSION`
- `R11A-P375` `LAZY_ASSET_DRIFT_QUARANTINES`
- `R11A-P376` `CONCURRENT_PREVIEW_GRANTS_SEQUENCED`
- `R11A-P377` `CONCURRENT_EXPORT_GRANTS_SEQUENCED`
- `R11A-P378` `CONCURRENT_PREVIEW_EXPORT_SCOPE_ISOLATED`
- `R11A-P379` `CONCURRENT_EXPORT_SAVE_SESSIONS_BOUND`
- `R11A-P380` `CONCURRENT_GRANT_COMPLETION_IDEMPOTENT`
- `R11A-P381` `CONCURRENT_ABORT_RECLAIMS_GRANT`
- `R11A-P382` `CONCURRENT_SESSION_REVOKE_DRAINS_GRANTS`
- `R11A-P383` `CONCURRENT_PENDING_JOB_COUNT_ZERO`
- `R11A-P384` `CONCURRENT_DUPLICATE_COMPLETION_REJECTED`
- `R11A-P385` `CONCURRENT_JOB_LEDGER_HASH_CHAIN_VALID`
- `R11A-P386` `SHUTDOWN_BEFORE_QUIT_REVOKES_SESSION`
- `R11A-P387` `SHUTDOWN_BEFORE_QUIT_ABORTS_SAVE`
- `R11A-P388` `SHUTDOWN_BEFORE_QUIT_DRAINS_JOBS`
- `R11A-P389` `SHUTDOWN_SESSION_MARKER_CLEAN`
- `R11A-P390` `SHUTDOWN_SESSION_LEDGER_CLEAN_ENTRY`
- `R11A-P391` `SHUTDOWN_WINDOW_UNLOAD_DOUBLE_REVOKE_SAFE`
- `R11A-P392` `SHUTDOWN_MAIN_EXIT_REGISTRY_EMPTY`
- `R11A-P393` `SHUTDOWN_TEMP_FILE_ZERO`
- `R11A-P394` `SHUTDOWN_LOCK_RELEASED`
- `R11A-P395` `SHUTDOWN_QUARANTINE_LEDGER_CLOSED`
- `R11A-P396` `FINAL_ACTIVE_SESSION_COUNT_ONE`
- `R11A-P397` `FINAL_OPEN_GRANT_COUNT_ZERO`
- `R11A-P398` `FINAL_OPEN_SAVE_SESSION_COUNT_ZERO`
- `R11A-P399` `FINAL_POINTER_MIRRORS_UNCHANGED`
- `R11A-P400` `FINAL_PACKAGE_BYTES_UNCHANGED`


---

## 25. Completion checklist

### Source

- [ ] R10A source parent freeze가 재현된다.
- [ ] old R11 admission state와 R10A current state가 혼용되지 않는다.
- [ ] Electron main preflight가 BrowserWindow normal show보다 앞선다.
- [ ] preload IPC surface가 allowlist로 제한된다.
- [ ] main-owned session registry와 job grant registry가 self-test를 통과한다.
- [ ] Preview, Export, host save가 grant 없이 실패한다.
- [ ] device-loss recovery가 old session을 재활성화하지 않는다.
- [ ] crash와 quarantine ledger가 hash-chain으로 닫힌다.
- [ ] Production Pointer 두 mirror가 바이트 불변이다.
- [ ] 332 source gate PASS, 0 FAIL이다.

### Installed

- [ ] current R9A physical과 R10A final release가 존재한다.
- [ ] packaged Windows Electron에서 main preflight를 실행한다.
- [ ] hidden renderer startup canary를 실행한다.
- [ ] main-owned session을 발급한 뒤에만 workspace가 표시된다.
- [ ] Preview와 Export가 operation-scoped grant를 요구한다.
- [ ] Electron save IPC가 Export grant를 재검증한다.
- [ ] first device loss recovery와 replacement session issuance를 검증한다.
- [ ] second loss와 crash threshold quarantine drill을 검증한다.
- [ ] rollback recommendation은 R10A 입력만 만들고 pointer를 변경하지 않는다.
- [ ] 400 installed gate PASS, 0 unresolved이다.

---

## 26. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R12A

R11A Installed Admission Replay /
Atomic Update Main-Process Integration /
Pre-Activation Session Drain /
Post-Activation R11A Re-Attestation /
Interrupted Update Runtime Recovery Seal
```

---

## 27. Final seal statement

> R11A는 R10A current release와 실제 설치 package closure를 Electron main process에서 검증하고, hidden renderer startup canary 뒤에 main-owned installed session을 발급하며, Preview, Export, host save를 operation-scoped job grant로 봉인한다. Device loss와 crash는 session revoke가 항상 먼저 발생하고, recovery canary 또는 durable quarantine과 R10A rollback recommendation으로만 수렴한다. R11A는 어떤 경우에도 Production Pointer나 local activation pointer를 직접 변경하지 않는다.
