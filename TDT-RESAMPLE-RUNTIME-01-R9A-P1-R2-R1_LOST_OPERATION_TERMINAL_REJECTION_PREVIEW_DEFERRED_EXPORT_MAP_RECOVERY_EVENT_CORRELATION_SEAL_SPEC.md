# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1

## Lost Operation Terminal Rejection /
## Preview Frame Deferred Failure Propagation /
## Export Terminal Map Hook Binding /
## Recovery Failure Event Before Fatal Throw /
## Exact Cycle Event Correlation Seal

> 상태: 명세 rev.1
>
> 부모 패치: `TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2`
>
> 부모 번들: `61_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_RECOVERY_HOLDER_SOURCE_BAKED_AWAITING_THREE_CYCLE_PHYSICAL_GPU(1).zip`
>
> 부모 번들 SHA-256: `a6c57a4b98573cf53b17dcd87f663cd5718478ef769e82e206542c77b7382be9`
>
> 부모 R2 명세 SHA-256: `558802cedbce5128263c3ca91f0d5749f75108a7a56d3529322c73403132fed9`
>
> 정적 리뷰 기준 SHA-256: `be69116848eb36b7a7b15f1ec782ce2b46dc2944d328a697784a3103a2219be3`
>
> 부모 현재 상태: `360 SOURCE PASS / 420 PACKAGED PENDING / physical recovery cycle 0`
>
> 패치 역할: R2의 계산·복구 골격을 교체하지 않고, lost operation 터미널과 cycle evidence의 의미론을 닫는 교정 패치
>
> 후속 분리 항목: permit 전체 필드·sender 봉인, explicit pipeline rebuild authority, R2 raw finalizer 전면 replay
>
> 원칙: `scheduler idle != operation success`, `encoder dispatched != terminal map pending`, `newer epoch != matching recovery cycle`

---

# 0. 목적

부모 R2는 normal Runtime Composition 안에 Recovery-Aware Runtime Holder를 설치하고, Preview·Export public entry에서 pending hook을 호출하며, GPU Authority가 controlled device loss를 소유하도록 배선했다.

그러나 현재 구현에는 다음 의미론 결손이 있다.

1. Preview frame 실행 예외가 `PreviewPresenterService.#presentFrame()` 내부에서 receipt로만 기록되고 다시 전파되지 않는다.
2. `requestPresent()`는 특정 frame의 terminal state가 아니라 scheduler의 `whenIdle()`만 기다리므로, device loss frame도 public promise가 resolve될 수 있다.
3. Export pending hook은 실제 terminal GPU readback `mapAsync()`가 아니라 `encoder.encode()` 호출 직후에 설치된다.
4. GPU recovery failure event는 `#fatal()` 호출 뒤에 배치되어 도달하지 못한다.
5. controlled-loss waiter는 `deviceEpoch > lostEpoch`만 확인하므로 다른 recovery event가 현재 cycle을 잘못 완료시킬 수 있다.
6. qualification runner는 lost operation이 resolve되어도 실패시키지 않는다.

P1-R2-R1은 다음 경로를 봉인한다.

```text
public Preview / Export operation
→ exact operation-scoped terminal ticket
→ exact pending hook evidence
→ main-canonical cycle binding receipt
→ GPU Authority controlled-loss transaction
→ exact lost / recovered / failed event correlation
→ lost operation stable rejection
→ no late success publication / no host save
→ raw terminal ledger replay
```

이 패치는 R2의 3-cycle 물리 실행 자체를 완료했다고 주장하지 않는다. Source bake 뒤에도 packaged physical gate는 실제 세 cycle을 실행하기 전까지 `PENDING`이다.

---

# 1. 현재 코드에서 직접 확인된 사실

## 1.1 Preview public promise는 frame terminal을 기다리지 않는다

현재 `PreviewPresenterService.present()`는 다음 순서다.

```text
pipeline.requireFinal()
→ scheduler.enqueue(publication)
→ scheduler.whenIdle()
→ resolve
```

`PreviewFrameScheduler.execute()`의 반환형은 `Promise<void>`이며, `#presentFrame()`의 catch는 `DEVICE_LOST` 또는 `FAILED` receipt를 기록한 뒤 예외를 삼킨다.

판정:

```text
frame DEVICE_LOST
≠ public request rejected
```

## 1.2 Preview scheduler에는 frame별 Deferred가 없다

현재 scheduler는 전역 idle waiter만 가진다.

- `#idleWaiters`
- `whenIdle()`
- `#resolveIdle()`

특정 `frameId`의 `PRESENTED`, `DEVICE_LOST`, `FAILED`, `DROPPED_SUPERSEDED` 상태를 public caller에 귀속하는 ticket authority가 없다.

## 1.3 Export pending hook은 terminal map hook이 아니다

현재 Export Authority는 다음 위치에서 holder에 pending을 통지한다.

```text
const encodePromise = encoder.encode(...)
→ notifyOperationPending(
    phase: 'encoder-dispatched-result-unresolved'
  )
→ await encodePromise
```

이 위치는 다음을 증명하지 못한다.

- GPU terminal readback buffer 생성
- queue submission 완료
- `mapAsync(GPUMapMode.READ)` 호출
- map promise 미해결
- host save 미시작

## 1.4 실제 terminal map 소유 지점은 별도 코드에 존재한다

현재 코드에는 실제 readback `mapAsync()` 실행 지점이 존재한다.

- `app/legacy-runtime/modules/dk_resample/export_finalize_runtime_r8.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs`
- 기타 GPU readback runtime

판정: Export pending loss hook은 Export Authority의 추정 위치가 아니라, 실제 terminal readback owner가 발행해야 한다.

## 1.5 Recovery failure event는 현재 도달 불가다

현재 GPU Authority catch 순서:

```ts
this.#fatal('E_GPU_RECOVERY_FAILED', ...)
window.dispatchEvent('dadum:gpu-authority-recovery-failed')
```

`#fatal()`이 throw하므로 failure event dispatch는 실행되지 않는다.

## 1.6 Recovery success 상관관계가 epoch 크기 비교에 머문다

현재 controlled-loss waiter의 성공 조건은 다음과 같다.

```text
recovered event.detail.deviceEpoch > lostEpoch
```

다음 값은 비교하지 않는다.

- runId
- cycleOrdinal
- operationId
- operationKind
- hookId
- cycle binding digest
- exact old device epoch
- exact expected new device epoch
- active controlled-loss transaction identity

## 1.7 Qualification runner는 resolved lost operation을 허용한다

현재 runner는 operation terminal을 기록하지만 다음 assertion이 없다.

```text
terminal must equal rejected
errorCode must belong to loss-terminal allowlist
```

판정: operation ledger가 `resolved`를 포함해도 다음 cycle로 진행할 수 있다.

---

# 2. 목표와 비목표

## 2.1 목표

- Preview public `requestPresent()`를 특정 frame terminal ticket에 귀속한다.
- lost Preview frame은 receipt 기록 뒤 반드시 stable rejection으로 public caller까지 전파한다.
- scheduler idle을 operation success 증거로 사용하지 않는다.
- auto subscription frame과 explicit public frame의 terminal ownership을 분리한다.
- Export controlled loss를 실제 terminal GPU `mapAsync()` unresolved window에만 허용한다.
- Export lost cycle에서 host save 시작, 파일 생성, success receipt를 모두 0으로 유지한다.
- recovery failure event를 fatal throw보다 먼저 동기 dispatch한다.
- controlled loss cycle마다 main-canonical cycle binding digest를 생성한다.
- lost, recovered, failed event를 exact cycle binding에 귀속한다.
- unrelated recovery event, stale event, prior cycle event를 현재 waiter가 수용하지 않는다.
- qualification runner가 lost operation의 rejection과 허용 error code를 강제한다.
- source gate가 문자열 존재가 아니라 최소 실행형 semantic negative control을 수행한다.
- packaged finalizer가 이 패치의 raw child evidence를 직접 replay한다.

## 2.2 비목표

- ControlledLossPermit 전체 필드 self-hash 재설계
- renderer PID·window ID를 permit body에 영구 봉인하는 후속 authority 교체
- Canonical Pipeline Registry explicit rebuild API 추가
- holder `REBUILDING` 단계의 실제 R4·R6·Tensor·Adaptive pipeline build 완료 봉인
- R2 전체 finalizer의 모든 child artifact 전면 replay
- Preview update drain의 실제 pin·ticket count 교정
- Export update drain의 worker RPC·pending job 실측 교정
- recovery budget consume rollback transaction 완성
- R9A-P1-R3 common raw evidence envelope
- 성능, residency plateau, adapter matrix 판정

---

# 3. 권위 모델

```text
Preview Frame Scheduler
= frame queue ordering·supersession authority

Preview Frame Terminal Registry
= explicit frame ticket settlement SSOT

Export Terminal Readback Owner
= terminal buffer·submission·mapAsync pending hook SSOT

Main Recovery Permit Authority
= canonical expected cycle tuple·sender context·cycle binding digest SSOT

GPU Device Authority
= active controlled-loss transaction·device destroy·lost/recovered/failed event SSOT

Recovery-Aware Runtime Holder
= active cycle phase·operation pending·cycle completion SSOT

Qualification Runner
= public entry invocation·terminal rejection assertion·post-recovery validation SSOT
```

## 3.1 비권위

- `PreviewFrameScheduler.whenIdle()`
- Preview receipt가 존재한다는 사실만으로 성공을 추정하는 코드
- `encoder.encode()`가 unresolved라는 사실
- 임의의 `phase` 문자열
- `deviceEpoch > lostEpoch`
- renderer가 재구성한 cycle tuple
- summary의 `terminal: 'rejected'` 문자열만 존재하는 경우
- parent R2 source PASS carry-forward

---

# 4. Canonical Cycle Binding

## 4.1 Main-canonical binding receipt

Main permit authority는 permit consume 시 renderer request를 그대로 신뢰하지 않는다. Main이 보유한 canonical expected cycle과 sender context를 기준으로 다음 receipt를 생성한다.

```ts
interface R9AP1R2R1CycleBindingReceiptV1 {
  schemaVersion: 1
  schemaId: 'tdt.r9a-p1-r2-r1.cycle-binding-receipt.v1'

  runId: string
  cycleOrdinal: 1 | 2 | 3
  operationKind: 'preview' | 'export'
  operationId: string
  hookId:
    | 'R9AP1R2R1_PREVIEW_SUBMISSION_PENDING'
    | 'R9AP1R2R1_EXPORT_TERMINAL_MAP_PENDING'

  senderWindowId: number
  senderRendererPid: number

  expectedRuntimeEpoch: number
  expectedOldDeviceEpoch: number
  expectedOldDeviceIdentity: string
  expectedNewDeviceEpoch: number

  packageClosureDigest: string
  r1BootPermitDigest: string
  parentPermitDigest: string

  operationDetailDigest: string
  issuedAtMs: number
  expiresAtMs: number

  cycleBindingDigest: string
  selfSha256: string
}
```

## 4.2 Canonicalization rule

`cycleBindingDigest`는 다음 canonical body의 SHA-256이다.

```text
schemaId
runId
cycleOrdinal
operationKind
operationId
hookId
senderWindowId
senderRendererPid
expectedRuntimeEpoch
expectedOldDeviceEpoch
expectedOldDeviceIdentity
expectedNewDeviceEpoch
packageClosureDigest
r1BootPermitDigest
parentPermitDigest
operationDetailDigest
issuedAtMs
expiresAtMs
```

`selfSha256`는 `cycleBindingDigest`를 포함한 receipt 전체 body의 SHA-256이다.

## 4.3 Consume response

```ts
interface R9AP1R2R1PermitConsumeResultV1 {
  consumed: true
  cycleOrdinal: 1 | 2 | 3
  remaining: 0 | 1 | 2
  binding: R9AP1R2R1CycleBindingReceiptV1
}
```

Renderer는 `binding`을 수정하거나 재생성하지 않는다. GPU Authority와 Holder에는 Main이 반환한 frozen binding 전체를 전달한다.

## 4.4 Hook allowlist

```text
preview → R9AP1R2R1_PREVIEW_SUBMISSION_PENDING
export  → R9AP1R2R1_EXPORT_TERMINAL_MAP_PENDING
```

operation kind와 hook ID가 일치하지 않으면 consume 단계에서 거부한다.

---

# 5. Lost Operation Terminal Contract

## 5.1 공통 terminal 상태

```ts
type R9AP1R2R1OperationTerminalState =
  | 'RESOLVED_SUCCESS'
  | 'REJECTED_DEVICE_LOSS'
  | 'REJECTED_RECOVERY_FAILURE'
  | 'REJECTED_SUPERSEDED'
  | 'REJECTED_OTHER'
```

controlled-loss cycle의 대상 operation은 다음 중 하나로만 끝나야 한다.

```text
REJECTED_DEVICE_LOSS
REJECTED_RECOVERY_FAILURE
```

`RESOLVED_SUCCESS`는 즉시 gate failure다.

## 5.2 Terminal error envelope

```ts
interface R9AP1R2R1OperationTerminalErrorDetailV1 {
  runId: string
  cycleOrdinal: 1 | 2 | 3
  operationKind: 'preview' | 'export'
  operationId: string
  hookId: string
  cycleBindingDigest: string
  runtimeEpoch: number
  lostDeviceEpoch: number
  lostDeviceIdentity: string
  recoveryState: 'RECOVERED' | 'FAILED' | 'TIMEOUT'
  causeCode: string
}
```

## 5.3 Stable public error codes

Preview lost operation:

```text
E_R9AP1R2R1_PREVIEW_FRAME_DEVICE_LOST
```

Export terminal map lost operation:

```text
E_R9AP1R2R1_EXPORT_TERMINAL_MAP_DEVICE_LOST
```

Recovery 자체가 실패한 경우:

```text
E_R9AP1R2R1_OPERATION_RECOVERY_FAILED
```

Correlation mismatch:

```text
E_R9AP1R2R1_CYCLE_EVENT_MISMATCH
```

## 5.4 성공 오염 금지

lost operation에서 다음은 0이어야 한다.

- Preview `PRESENTED` receipt
- Preview store present mutation
- Preview canvas `data-preview-state='presented'`
- Export host save begin
- Export host save receipt
- Export success receipt
- Export blob resource publication
- Export store complete mutation
- operation admission `completed` outcome

---

# 6. Preview Frame Deferred Failure Propagation

## 6.1 Frame ticket

```ts
interface PreviewFrameTerminalTicket {
  frameId: string
  terminal: Promise<PreviewFrameTerminalReceipt>
}

interface PreviewFrameTerminalReceipt {
  frameId: string
  state:
    | 'PRESENTED'
    | 'DEVICE_LOST'
    | 'FAILED'
    | 'DROPPED_SUPERSEDED'
    | 'SUSPENDED'
    | 'DISPOSED'
  errorCode: string | null
  receiptId: string | null
}
```

## 6.2 Scheduler API

기존 `enqueue(publication): string`을 다음 의미로 교체한다.

```ts
enqueue(
  publication: FinalSurfacePublication,
  options: {
    terminalMode: 'awaited-public' | 'detached-subscription'
  }
): PreviewFrameTerminalTicket
```

- `awaited-public`: public caller가 ticket terminal을 반드시 await한다.
- `detached-subscription`: subscription replay·layout invalidation용이다. 실패는 diagnostics와 ledger에 기록하되 unhandled rejection을 만들지 않는다.

## 6.3 Public request path

```text
DadumPreviewPresenter.requestPresent(revision)
→ exact publication resolve
→ enqueue(..., terminalMode='awaited-public')
→ await ticket.terminal
→ PRESENTED only: resolve
→ DEVICE_LOST / FAILED / DISPOSED: reject
→ DROPPED_SUPERSEDED: reject or explicit superseded terminal
```

`whenIdle()`는 drain·dispose용으로만 유지한다. Public request 성공 판정에 사용하지 않는다.

## 6.4 Execution error handling

`#presentFrame()`은 receipt를 먼저 기록한 뒤 stable error를 다시 throw한다.

```text
catch error
→ classify device loss
→ append DEVICE_LOST / FAILED receipt
→ abort admission grant
→ release pin·lease·ephemeral surface
→ throw StableRuntimeError
```

Scheduler `#drain()`은 per-frame error를 받아 해당 ticket을 reject하고, drain loop 자체의 unhandled rejection은 차단한다.

## 6.5 Device-loss classification

다음 코드는 device-loss terminal allowlist다.

```text
E_GPU_STALE_LEASE
E_SURFACE_PIN_REJECTED
E_GPU_DEVICE_LOST
E_GPU_RECOVERY_FAILED
E_R9AP1R2_RECOVERY_FAILED
E_R9AP1R2_RECOVERY_TIMEOUT
```

분류된 내부 error는 public error `E_R9AP1R2R1_PREVIEW_FRAME_DEVICE_LOST`의 `causeCode`에 보존한다.

## 6.6 Late callback suppression

각 frame ticket은 다음 tuple에 귀속한다.

```text
frameId
presenterGeneration
deviceEpoch
deviceIdentity
cycleBindingDigest or null
```

lost frame의 `onSubmittedWorkDone()` late resolve 또는 stale callback은 다음을 수행할 수 없다.

- Preview store present
- canvas presented attribute
- PRESENTED receipt
- admission completed
- terminal ticket resolve

---

# 7. Export Terminal Map Hook Binding

## 7.1 Hook 위치

부모의 다음 hook은 제거하거나 qualification loss authority에서 제외한다.

```text
encoder-dispatched-result-unresolved
```

P1-R2-R1 controlled loss는 오직 다음 실제 순서에서 허용한다.

```text
terminal GPU readback buffer created
→ command encoder copy-to-readback encoded
→ queue.submit completed
→ mapPromise = readback.mapAsync(READ)
→ mapPromise unresolved
→ R9AP1R2R1_EXPORT_TERMINAL_MAP_PENDING
→ controlled device loss
→ mapPromise rejects or stale lease assertion fails
→ Export public operation rejects
→ host save not started
```

## 7.2 Terminal map hook interface

```ts
interface R9AP1R2R1ExportTerminalMapHook {
  onTerminalMapPending(
    evidence: R9AP1R2R1ExportTerminalMapEvidenceV1
  ): Promise<R9AP1R2R1CycleBindingReceiptV1 | null>
}

interface R9AP1R2R1ExportTerminalMapEvidenceV1 {
  schemaVersion: 1
  schemaId: 'tdt.r9a-p1-r2-r1.export-terminal-map-evidence.v1'

  hookId: 'R9AP1R2R1_EXPORT_TERMINAL_MAP_PENDING'
  exportJobId: string
  surfaceId: string
  sourceRevision: number
  finalRevision: number
  runtimeEncoderId: string

  terminalReadbackId: string
  terminalReadbackByteLength: number
  terminalReadbackLabel: string
  submissionTicketId: string | null

  runtimeEpoch: number
  deviceEpoch: number
  deviceIdentity: string
  leaseId: string

  mapMode: number
  mapOffset: number
  mapSize: number
  mapPromiseState: 'UNRESOLVED'

  hostSaveStarted: false
}
```

## 7.3 Authority placement

Hook는 실제 `mapAsync()` caller가 발행한다.

적용 우선순위:

1. canonical R9A export terminal readback owner
2. `export_finalize_runtime_r8.mjs`가 실제 product export readback owner인 경우 해당 지점
3. encoder adapter 내부 GPU readback owner

Export Authority가 encode promise 바깥에서 임의로 hook을 합성하는 것은 금지한다.

## 7.4 Hook propagation

Export Authority는 qualification active cycle에서 operation-scoped hook을 `AuthoritativeExportInput` 또는 canonical finalizer context에 주입한다.

```ts
interface AuthoritativeExportInput {
  // existing fields
  recoveryTerminalMapHook?: R9AP1R2R1ExportTerminalMapHook
}
```

normal runtime 또는 cycle이 armed되지 않은 경우 hook는 `undefined`이며 실행 비용은 분기 1회 이하여야 한다.

## 7.5 Map promise ordering

금지:

```ts
await readback.mapAsync(...)
await hook.onTerminalMapPending(...)
```

필수:

```ts
const mapPromise = readback.mapAsync(...)
await hook.onTerminalMapPending(evidence)
await mapPromise
```

hook 호출 시점에 map promise가 이미 fulfilled 또는 rejected라면 `E_R9AP1R2R1_EXPORT_MAP_NOT_PENDING`으로 실패한다.

## 7.6 Save barrier

`host.saveExportBlob()` 직전 다음을 재검증한다.

```text
terminal map completed successfully
surface pin current
operation cycle not lost
operation grant active
cycle terminal not rejected
```

controlled loss가 발생한 operation은 `aborted-before-save-device-loss`로 admission을 닫는다.

---

# 8. Recovery Failure Event Before Fatal Throw

## 8.1 필수 순서

현재 순서를 다음으로 교체한다.

```text
catch recovery error
→ construct immutable failure detail
→ increment failure metric
→ dispatch dadum:gpu-authority-recovery-failed synchronously
→ settle active controlled-loss transaction as FAILED
→ transition authority to FATAL
→ throw StableRuntimeError(E_GPU_RECOVERY_FAILED)
```

## 8.2 Failure event detail

```ts
interface R9AP1R2R1RecoveryFailedEventDetailV1 {
  schemaVersion: 1
  schemaId: 'tdt.r9a-p1-r2-r1.recovery-failed-event.v1'

  runId: string | null
  cycleOrdinal: 1 | 2 | 3 | null
  operationKind: 'preview' | 'export' | null
  operationId: string | null
  hookId: string | null
  cycleBindingDigest: string | null

  runtimeEpoch: number
  lostDeviceEpoch: number
  lostDeviceIdentity: string
  adapterIdentity: string | null

  failureCode: 'E_GPU_RECOVERY_FAILED'
  cause: string
  dispatchedBeforeFatal: true
  selfSha256: string
}
```

## 8.3 Dispatch failure 처리

`window.dispatchEvent()` 자체가 throw하는 비표준 환경에서도 fatal 전이는 유지한다.

```ts
try {
  window.dispatchEvent(failureEvent)
} finally {
  this.#fatal(...)
}
```

다만 qualification runtime에서 dispatch listener가 존재하지 않으면 source gate가 실패해야 한다.

---

# 9. Exact Cycle Event Correlation

## 9.1 Controlled-loss transaction

GPU Authority는 한 번에 하나의 active transaction만 가진다.

```ts
type R9AP1R2R1ControlledLossTransactionState =
  | 'ARMED'
  | 'DESTROY_REQUESTED'
  | 'LOSS_OBSERVED'
  | 'RECOVERED'
  | 'FAILED'
  | 'TIMED_OUT'
  | 'SETTLED'

interface R9AP1R2R1ControlledLossTransaction {
  binding: R9AP1R2R1CycleBindingReceiptV1
  state: R9AP1R2R1ControlledLossTransactionState
  destroyCallCount: 0 | 1
  lostEventDigest: string | null
  recoveredEventDigest: string | null
  failedEventDigest: string | null
}
```

## 9.2 Device-lost event

`dadum:runtime-device-lost`는 active transaction이 있으면 다음 binding을 포함한다.

```text
runId
cycleOrdinal
operationKind
operationId
hookId
cycleBindingDigest
runtimeEpoch
lostDeviceEpoch
lostDeviceIdentity
```

active transaction이 없는 자연 device loss에서는 cycle fields가 `null`이어야 하며, qualification waiter가 이를 현재 cycle 완료로 수용하면 안 된다.

## 9.3 Recovered event

`dadum:gpu-authority-recovered`의 qualification 성공 조건은 전부 일치해야 한다.

```text
runId exact
cycleOrdinal exact
operationKind exact
operationId exact
hookId exact
cycleBindingDigest exact
runtimeEpoch exact
oldDeviceEpoch exact
oldDeviceIdentity exact
newDeviceEpoch == oldDeviceEpoch + 1
newDeviceIdentity != oldDeviceIdentity
adapterIdentity unchanged
transaction state == LOSS_OBSERVED
```

`deviceEpoch > lostEpoch` 단독 비교는 금지한다.

## 9.4 Failed event

failed event도 동일 binding을 가져야 한다. Binding이 없거나 다르면 waiter는 해당 event를 무시하지 않고 correlation fault로 실패한다.

## 9.5 Timeout

timeout receipt에는 active binding과 마지막 관측 event digest를 기록한다.

```text
E_R9AP1R2R1_RECOVERY_EVENT_TIMEOUT
```

Timeout 뒤 도착한 recovered event는 transaction을 성공으로 되살릴 수 없다.

## 9.6 Event listener 설치 순서

필수:

```text
create transaction
→ install lost/recovered/failed listeners
→ transaction ARMED
→ rawDevice.destroy exactly once
```

destroy 뒤 listener를 설치하는 순서는 금지한다.

---

# 10. Recovery Holder 보정

P1-R2-R1은 holder의 explicit pipeline rebuild를 닫지 않는다. 다만 operation terminal과 cycle correlation을 위해 다음 상태 보정을 수행한다.

## 10.1 Pending operation identity

Holder는 active cycle에 다음을 저장한다.

```ts
interface R9AP1R2R1ActiveOperation {
  binding: R9AP1R2R1CycleBindingReceiptV1
  operationDetailDigest: string
  pendingObserved: true
  publicTerminal: 'PENDING' | 'REJECTED' | 'RESOLVED'
}
```

## 10.2 Cycle completion 조건

Holder의 `#completed` 증가는 다음이 모두 참일 때만 허용한다.

- exact recovered event correlation PASS
- target public operation terminal이 `REJECTED_DEVICE_LOSS` 또는 `REJECTED_RECOVERY_FAILURE`
- Preview cycle이면 PRESENTED receipt count 0
- Export cycle이면 host save begin count 0
- active operation admission aborted

현재처럼 recovery return 직후 즉시 `#completed`를 증가시키는 것은 금지한다.

## 10.3 Failure transition

operation terminal 또는 event correlation이 실패하면 holder는 `FAILED`로 전이하고 phase failure receipt를 남긴다.

```text
FAILED → READY silent return 금지
```

---

# 11. Qualification Runner Enforcement

## 11.1 Operation terminal assertion

각 loss cycle public entry 호출 뒤 다음을 강제한다.

```ts
if (terminal !== 'rejected') {
  throw E_R9AP1R2_OPERATION_RESOLVED_AFTER_LOSS
}
```

허용 error code:

Preview cycle:

```text
E_R9AP1R2R1_PREVIEW_FRAME_DEVICE_LOST
E_R9AP1R2R1_OPERATION_RECOVERY_FAILED
```

Export cycle:

```text
E_R9AP1R2R1_EXPORT_TERMINAL_MAP_DEVICE_LOST
E_R9AP1R2R1_OPERATION_RECOVERY_FAILED
```

## 11.2 Exact cycle wait

`waitForCycle(cycleOrdinal)`은 숫자만 받지 않는다.

```ts
waitForCycle({
  cycleOrdinal,
  cycleBindingDigest,
  operationTerminalReceiptDigest
})
```

Holder가 다른 digest의 recovery를 반환하면 실패한다.

## 11.3 Operation row

```ts
interface R9AP1R2R1OperationTerminalRowV1 {
  cycleOrdinal: 1 | 2 | 3
  operationKind: 'preview' | 'export'
  operationId: string
  hookId: string
  cycleBindingDigest: string

  terminal: 'rejected'
  publicErrorCode: string
  internalCauseCode: string

  previewPresentedReceiptCount: number
  exportHostSaveBeginCount: number
  exportHostSaveReceiptCount: number
  successReceiptCount: number

  operationTerminalReceiptDigest: string
}
```

## 11.4 Post-recovery validation 분리

lost operation rejection이 확인된 뒤에만 새 fixture를 publish하고 normal Preview·Export validation을 실행한다.

```text
loss operation rejected
→ exact cycle recovered
→ holder terminal committed
→ validation fixture republish
→ Preview success
→ Export success
```

loss operation의 late callback과 validation operation의 success receipt가 같은 operation ID를 공유하면 실패한다.

---

# 12. Raw Evidence

P1-R2-R1 child artifact:

- `R9AP1R2R1_CYCLE_BINDING_LEDGER.json`
- `R9AP1R2R1_PREVIEW_FRAME_TERMINAL_LEDGER.json`
- `R9AP1R2R1_EXPORT_TERMINAL_MAP_LEDGER.json`
- `R9AP1R2R1_RECOVERY_EVENT_CORRELATION_LEDGER.json`
- `R9AP1R2R1_RECOVERY_FAILURE_ORDER_LEDGER.json`
- `R9AP1R2R1_OPERATION_TERMINAL_LEDGER.json`
- `R9AP1R2R1_NEGATIVE_CONTROL_RECEIPT.json`
- `R9AP1R2R1_SEMANTIC_MATRIX_RECEIPT.json`
- `R9AP1R2R1_ARTIFACT_MANIFEST.json`

## 12.1 공통 envelope

```ts
interface R9AP1R2R1EvidenceEnvelopeV1 {
  schemaVersion: 1
  schemaId: string
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1'
  runId: string
  packageClosureDigest: string
  r1BootPermitDigest: string
  parentR2SourceReceiptDigest: string
  rows: readonly unknown[]
  selfSha256: string
}
```

## 12.2 Preview ledger 필수 row

```text
frame ticket created
frame execution started
submission pending hook observed
cycle binding accepted
DEVICE_LOST receipt appended
admission aborted
pin released
lease released
terminal ticket rejected
late success mutation count 0
```

## 12.3 Export ledger 필수 row

```text
terminal readback created
queue submitted
mapAsync called
map unresolved hook observed
cycle binding accepted
map rejected or stale lease rejected
host save begin count 0
host save receipt count 0
success receipt count 0
public operation rejected
```

## 12.4 Correlation ledger 필수 row

```text
transaction armed
destroy requested once
lost event exact match
recovered or failed event exact match
transaction settled once
unrelated event accepted count 0
late event accepted count 0
```

---

# 13. Packaged Finalizer

P1-R2-R1 finalizer는 summary count만 검사하지 않는다. 다음 raw evidence를 직접 replay한다.

## 13.1 Preview cycle replay

각 Preview loss cycle에서:

- one awaited-public frame ticket 존재
- matching submission pending hook 존재
- exact cycle binding digest 일치
- DEVICE_LOST receipt 존재
- PRESENTED receipt 0
- public terminal rejected
- allowed error code
- late success mutation 0

## 13.2 Export cycle replay

Export loss cycle에서:

- one terminal readback ID 존재
- one queue submission evidence 존재
- one map begin evidence 존재
- map end success evidence 0
- matching terminal map hook 존재
- host save begin 0
- host save receipt 0
- output file 0
- public terminal rejected
- allowed error code

## 13.3 Recovery ordering replay

- failed event sequence < fatal transition sequence
- recovered event sequence는 matching lost event 뒤
- exact `newEpoch = oldEpoch + 1`
- exact cycle binding digest
- destroy call count 1
- transaction settlement count 1

## 13.4 금지된 summary-only 판정

다음만으로 PASS를 만들 수 없다.

```text
previewRejectedCount = 2
exportRejectedCount = 1
correlatedRecoveryCount = 3
```

각 count는 raw row에서 재계산한다.

## 13.5 Final state

Source bake 성공 상태:

```text
RESAMPLE_RUNTIME_R9A_P1_R2_R1_SOURCE_SEALED_AWAITING_THREE_CYCLE_PACKAGED_PHYSICAL_REPLAY
```

Packaged physical 성공 상태:

```text
RESAMPLE_RUNTIME_R9A_P1_R2_R1_LOST_OPERATION_TERMINAL_AND_EXACT_CYCLE_CORRELATION_VALIDATED
```

---

# 14. 오류 코드

| Code | Meaning |
|---|---|
| `E_R9AP1R2R1_PREVIEW_FRAME_TICKET_MISSING` | public Preview request has no terminal ticket |
| `E_R9AP1R2R1_PREVIEW_FRAME_DEVICE_LOST` | lost Preview frame rejected at public boundary |
| `E_R9AP1R2R1_PREVIEW_FALSE_RESOLVE` | lost Preview frame resolved |
| `E_R9AP1R2R1_PREVIEW_LATE_SUCCESS` | lost frame published a late success mutation |
| `E_R9AP1R2R1_EXPORT_MAP_HOOK_MISSING` | terminal map owner emitted no hook |
| `E_R9AP1R2R1_EXPORT_MAP_NOT_PENDING` | hook fired outside unresolved map window |
| `E_R9AP1R2R1_EXPORT_TERMINAL_MAP_DEVICE_LOST` | Export terminal map operation rejected by device loss |
| `E_R9AP1R2R1_EXPORT_SAVE_AFTER_LOSS` | host save began after controlled loss |
| `E_R9AP1R2R1_EXPORT_SUCCESS_AFTER_LOSS` | Export emitted success receipt after loss |
| `E_R9AP1R2R1_CYCLE_BINDING_MISSING` | Main returned no canonical cycle binding |
| `E_R9AP1R2R1_CYCLE_BINDING_INVALID` | cycle binding self-hash or canonical digest invalid |
| `E_R9AP1R2R1_CYCLE_EVENT_MISMATCH` | lost/recovered/failed event does not match active cycle |
| `E_R9AP1R2R1_RECOVERY_EVENT_TIMEOUT` | exact correlated event did not arrive |
| `E_R9AP1R2R1_RECOVERY_FAILED_EVENT_MISSING` | recovery failed without pre-fatal event |
| `E_R9AP1R2R1_RECOVERY_FAILED_EVENT_LATE` | failure event sequence is after fatal throw |
| `E_R9AP1R2R1_DESTROY_COUNT_INVALID` | controlled loss destroyed device zero or multiple times |
| `E_R9AP1R2R1_OPERATION_RECOVERY_FAILED` | public operation rejected because recovery failed |
| `E_R9AP1R2R1_OPERATION_TERMINAL_MISSING` | target operation produced no terminal evidence |
| `E_R9AP1R2R1_OPERATION_RESOLVED_AFTER_LOSS` | target lost operation resolved |
| `E_R9AP1R2R1_HOLDER_COMPLETED_BEFORE_TERMINAL` | holder completed cycle before operation rejection |
| `E_R9AP1R2R1_RAW_EVIDENCE_MISSING` | mandatory child evidence missing |
| `E_R9AP1R2R1_SUMMARY_ONLY_EVIDENCE` | finalizer used summary without raw replay |

---

# 15. Negative Controls

## 15.1 Preview

- `#presentFrame()` records DEVICE_LOST but does not throw
- scheduler resolves awaited-public ticket after execute rejection
- `requestPresent()` waits only for idle
- lost frame emits PRESENTED receipt
- lost frame mutates Preview store
- stale callback resolves ticket after validation frame succeeds
- superseded ticket is confused with device-loss ticket

## 15.2 Export

- hook remains at `encoder-dispatched-result-unresolved`
- hook fires before queue submit
- hook fires after map promise fulfillment
- hook fires after map promise rejection
- synthetic hook has no terminal readback ID
- map pending loss still calls host save
- lost export creates output file
- lost export emits receipt or blob resource

## 15.3 Recovery event ordering

- failure event remains after `#fatal()`
- failure event has no cycle binding
- recovered event from prior cycle completes current waiter
- natural device loss event completes qualification waiter
- recovered event has `newEpoch > oldEpoch + 1`
- recovered event changes runtime epoch
- recovered event changes adapter identity
- timeout transaction accepts late recovered event
- destroy called twice

## 15.4 Runner and finalizer

- Preview lost operation terminal is `resolved`
- Export lost operation terminal is `resolved`
- rejected operation has unapproved error code
- holder completion precedes operation terminal receipt
- raw terminal child removed
- summary count retained while raw row altered
- cycle binding digest altered in one child only
- failure-order sequence inverted

---

# 16. 구현 대상

## 16.1 필수 수정

```text
app/src/runtime/preview/preview-frame-scheduler.ts
app/src/runtime/preview/preview-presenter-service.ts
app/src/runtime/preview/preview-presenter-types.ts

app/src/runtime/export/export-authority-service.ts
app/src/runtime/codecs/encoder-registry-service.ts
canonical export terminal readback owner

app/src/runtime/gpu/gpu-device-authority-service.ts
app/src/runtime/gpu/gpu-service.ts

app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts
app/src/runtime/recovery/r9a-p1-r2-recovery-types.ts

app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts
app/src/env.d.ts

app/electron/resample-runtime-r9a-p1-r2/recovery-permit-authority.mjs
app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs
preload.cjs

tools/resample-runtime-01-r9a-p1-r2-r1/*
```

## 16.2 조건부 수정

실제 product export terminal `mapAsync()` owner를 정적·런타임 추적으로 확정한 뒤 다음 중 채택 경로만 수정한다.

```text
app/legacy-runtime/modules/dk_resample/export_finalize_runtime_r8.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs
encoder-specific GPU readback adapter
```

미채택 readback module에 hook 문자열만 추가해 gate를 통과시키는 것은 금지한다.

---

# 17. Source Gate Catalog

## 17.1 Parent and scope

| Gate | Requirement |
|---|---|
| `R9AP1R2R1-S001` | Parent bundle SHA-256 is exact |
| `R9AP1R2R1-S002` | Parent R2 specification SHA-256 is exact |
| `R9AP1R2R1-S003` | Parent source receipt remains immutable |
| `R9AP1R2R1-S004` | Parent production pointers remain unchanged |
| `R9AP1R2R1-S005` | Historical physical PASS carry-forward is zero |
| `R9AP1R2R1-S006` | Patch does not claim explicit pipeline rebuild closure |
| `R9AP1R2R1-S007` | Patch does not claim permit sender integrity closure |
| `R9AP1R2R1-S008` | Patch identity is installed exactly once |

## 17.2 Preview terminal

| Gate | Requirement |
|---|---|
| `R9AP1R2R1-S009` | Scheduler exposes frame terminal ticket |
| `R9AP1R2R1-S010` | Awaited public frame and detached subscription frame are distinct |
| `R9AP1R2R1-S011` | Public Preview awaits exact ticket terminal |
| `R9AP1R2R1-S012` | Public Preview does not infer success from whenIdle |
| `R9AP1R2R1-S013` | DEVICE_LOST execution rejects awaited ticket |
| `R9AP1R2R1-S014` | FAILED execution rejects awaited ticket |
| `R9AP1R2R1-S015` | PRESENTED alone resolves awaited ticket |
| `R9AP1R2R1-S016` | Frame terminal settlement is one-shot |
| `R9AP1R2R1-S017` | Preview error receipt is appended before rejection |
| `R9AP1R2R1-S018` | Admission grant is aborted on lost frame |
| `R9AP1R2R1-S019` | Surface pin is released on lost frame |
| `R9AP1R2R1-S020` | GPU lease is released on lost frame |
| `R9AP1R2R1-S021` | Ephemeral surface disposal remains fence-bound |
| `R9AP1R2R1-S022` | Late submitted-work callback cannot publish success |
| `R9AP1R2R1-S023` | Detached failure creates no unhandled rejection |
| `R9AP1R2R1-S024` | Preview terminal ledger is self-hashed |

## 17.3 Export terminal map

| Gate | Requirement |
|---|---|
| `R9AP1R2R1-S025` | Encoder-dispatched hook is not accepted as terminal map evidence |
| `R9AP1R2R1-S026` | Actual mapAsync caller emits pending hook |
| `R9AP1R2R1-S027` | Hook fires after queue submission |
| `R9AP1R2R1-S028` | Hook fires before awaiting map promise |
| `R9AP1R2R1-S029` | Hook evidence contains terminal readback ID |
| `R9AP1R2R1-S030` | Hook evidence contains readback byte length |
| `R9AP1R2R1-S031` | Hook evidence contains exact device identity |
| `R9AP1R2R1-S032` | Hook evidence contains exact lease ID |
| `R9AP1R2R1-S033` | Hook evidence asserts hostSaveStarted false |
| `R9AP1R2R1-S034` | Map promise state is unresolved at hook |
| `R9AP1R2R1-S035` | Lost map prevents host save begin |
| `R9AP1R2R1-S036` | Lost map prevents success receipt publication |
| `R9AP1R2R1-S037` | Lost map prevents blob resource registration |
| `R9AP1R2R1-S038` | Export terminal ledger is self-hashed |

## 17.4 Cycle binding

| Gate | Requirement |
|---|---|
| `R9AP1R2R1-S039` | Main creates canonical cycle binding |
| `R9AP1R2R1-S040` | Binding uses Main expected cycle, not renderer mutation |
| `R9AP1R2R1-S041` | Binding includes sender window ID |
| `R9AP1R2R1-S042` | Binding includes renderer PID |
| `R9AP1R2R1-S043` | Binding includes operation ID |
| `R9AP1R2R1-S044` | Binding includes stable hook ID |
| `R9AP1R2R1-S045` | Binding includes old device epoch |
| `R9AP1R2R1-S046` | Binding includes old device identity |
| `R9AP1R2R1-S047` | Binding expects exact new epoch old+1 |
| `R9AP1R2R1-S048` | Binding includes package closure digest |
| `R9AP1R2R1-S049` | Binding includes R1 boot permit digest |
| `R9AP1R2R1-S050` | Binding includes parent permit digest |
| `R9AP1R2R1-S051` | Binding includes operation detail digest |
| `R9AP1R2R1-S052` | cycleBindingDigest is canonical SHA-256 |
| `R9AP1R2R1-S053` | binding selfSha256 is verified |
| `R9AP1R2R1-S054` | Renderer cannot replace consume binding |

## 17.5 Recovery ordering and correlation

| Gate | Requirement |
|---|---|
| `R9AP1R2R1-S055` | One active controlled-loss transaction only |
| `R9AP1R2R1-S056` | Event listeners install before destroy |
| `R9AP1R2R1-S057` | Raw device destroy count is exactly one |
| `R9AP1R2R1-S058` | Lost event binds active cycle digest |
| `R9AP1R2R1-S059` | Recovered event binds active cycle digest |
| `R9AP1R2R1-S060` | Failed event binds active cycle digest |
| `R9AP1R2R1-S061` | Recovered event matches exact run ID |
| `R9AP1R2R1-S062` | Recovered event matches exact cycle ordinal |
| `R9AP1R2R1-S063` | Recovered event matches exact operation ID |
| `R9AP1R2R1-S064` | Recovered event matches exact hook ID |
| `R9AP1R2R1-S065` | Recovered event matches exact old epoch |
| `R9AP1R2R1-S066` | New epoch equals old epoch plus one |
| `R9AP1R2R1-S067` | Adapter identity remains unchanged |
| `R9AP1R2R1-S068` | Unrelated natural loss cannot settle qualification transaction |
| `R9AP1R2R1-S069` | Prior cycle recovered event cannot settle current transaction |
| `R9AP1R2R1-S070` | Timeout is terminal and rejects late recovery |
| `R9AP1R2R1-S071` | Recovery failed event dispatches before fatal throw |
| `R9AP1R2R1-S072` | Recovery failed event is synchronously observable |
| `R9AP1R2R1-S073` | Failure event listener rejects controlled-loss waiter |
| `R9AP1R2R1-S074` | Correlation ledger is self-hashed |

## 17.6 Runner and evidence

| Gate | Requirement |
|---|---|
| `R9AP1R2R1-S075` | Runner requires lost Preview rejection |
| `R9AP1R2R1-S076` | Runner requires lost Export rejection |
| `R9AP1R2R1-S077` | Runner verifies operation-specific error allowlist |
| `R9AP1R2R1-S078` | Runner records cycle binding digest in operation row |
| `R9AP1R2R1-S079` | Holder completion waits for operation terminal |
| `R9AP1R2R1-S080` | Validation fixture starts after loss terminal closure |
| `R9AP1R2R1-S081` | Lost and validation operation IDs differ |
| `R9AP1R2R1-S082` | Preview success count is recomputed from raw receipts |
| `R9AP1R2R1-S083` | Export save count is recomputed from raw receipts |
| `R9AP1R2R1-S084` | Child artifact manifest covers all R2-R1 evidence |
| `R9AP1R2R1-S085` | Source final receipt claims no packaged PASS |
| `R9AP1R2R1-S086` | Source gate receipt is self-hashed |

---

# 18. Packaged Physical Gate Catalog

| Gate | Requirement |
|---|---|
| `R9AP1R2R1-P001` | Packaged normal Runtime Composition booted |
| `R9AP1R2R1-P002` | Same runtime epoch persisted through all cycles |
| `R9AP1R2R1-P003` | Cycle 1 Preview frame ticket rejected |
| `R9AP1R2R1-P004` | Cycle 1 Preview PRESENTED count is zero |
| `R9AP1R2R1-P005` | Cycle 1 exact binding correlation passed |
| `R9AP1R2R1-P006` | Cycle 2 terminal map hook observed |
| `R9AP1R2R1-P007` | Cycle 2 map promise was unresolved at hook |
| `R9AP1R2R1-P008` | Cycle 2 Export public operation rejected |
| `R9AP1R2R1-P009` | Cycle 2 host save begin count is zero |
| `R9AP1R2R1-P010` | Cycle 2 output file count is zero |
| `R9AP1R2R1-P011` | Cycle 2 exact binding correlation passed |
| `R9AP1R2R1-P012` | Cycle 3 Preview frame ticket rejected |
| `R9AP1R2R1-P013` | Cycle 3 Preview PRESENTED count is zero |
| `R9AP1R2R1-P014` | Cycle 3 exact binding correlation passed |
| `R9AP1R2R1-P015` | Each controlled loss destroyed raw device exactly once |
| `R9AP1R2R1-P016` | Each replacement epoch equals old epoch plus one |
| `R9AP1R2R1-P017` | No unrelated event settled any cycle |
| `R9AP1R2R1-P018` | No late event settled a terminal transaction |
| `R9AP1R2R1-P019` | Failure-order negative injection observed event before fatal |
| `R9AP1R2R1-P020` | Post-cycle Preview validation succeeded three times |
| `R9AP1R2R1-P021` | Post-cycle Export validation succeeded three times |
| `R9AP1R2R1-P022` | Lost operation IDs never appeared in validation success rows |
| `R9AP1R2R1-P023` | Raw child self-hashes verified |
| `R9AP1R2R1-P024` | Cross-child cycle binding digests matched |
| `R9AP1R2R1-P025` | Finalizer replayed raw rows, not summary only |
| `R9AP1R2R1-P026` | Historical packaged PASS carry-forward is zero |

---

# 19. 완료 조건

## 19.1 Source bake 완료

- TypeScript typecheck PASS
- Vite production build PASS
- Electron main·preload syntax PASS
- Preview ticket unit tests PASS
- Export terminal map hook unit tests PASS
- recovery event ordering unit tests PASS
- exact cycle correlation unit tests PASS
- semantic negative controls PASS
- source final receipt 상태가 `AWAITING_THREE_CYCLE_PACKAGED_PHYSICAL_REPLAY`

## 19.2 Packaged physical 완료

- Preview / Export / Preview loss pattern 정확
- 세 lost public operation 모두 rejected
- 세 cycle exact event correlation PASS
- Export loss output file 0
- Preview lost PRESENTED receipt 0
- host save begin 0
- destroy count cycle당 1
- device epoch `E0 → E1 → E2 → E3`
- 후속 validation Preview·Export 세 cycle 모두 성공
- raw evidence finalizer PASS

## 19.3 실패 조건

다음 중 하나라도 존재하면 P1-R2-R1은 FAIL이다.

```text
lost operation resolved
terminal map hook synthetic
failure event after fatal
correlation by epoch inequality only
unrelated event accepted
host save after loss
summary-only finalization
```

---

# 20. 패치 적용 순서

```text
1. Preview frame terminal ticket 도입
2. Preview public request exact terminal await
3. GPU Authority active controlled-loss transaction 도입
4. Main cycle binding consume receipt 도입
5. lost/recovered/failed event exact binding 확장
6. recovery failed event dispatch 순서 교정
7. 실제 Export terminal map owner hook 도입
8. Export save barrier와 lost terminal rejection 연결
9. Holder completion을 operation terminal 뒤로 이동
10. Qualification runner rejection assertion 추가
11. Raw evidence writers 추가
12. Semantic negative controls 실행
13. Source finalizer
14. Packaged three-cycle physical replay
```

---

# 21. 후속 패치 경계

P1-R2-R1 완료 뒤에도 다음은 별도 HOLD다.

```text
P1-R2-R2
Controlled Loss Permit Full-Field Integrity /
Sender-Bound Issue·Consume Identity /
Immutable Device Identity Expectation /
One-Shot Budget Commit Transaction Seal

P1-R2-R3
Explicit Canonical Pipeline Rebuild /
Single-Flight Registry Adoption /
R4·R6·Tensor·Adaptive Bundle Digest /
Holder VALIDATING Admission Seal

P1-R2-R4
Raw Lifecycle Finalizer Replay /
Cross-Child Lineage /
Host Output Directory Zero-File Proof /
Summary Fabrication Rejection Seal
```

P1-R2-R1은 이 후속 항목을 완료했다고 주장하지 않는다.

---

# 22. 최종 판정 문구

Source bake 성공 시:

```text
TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1
SOURCE SEALED
LOST OPERATION TERMINAL REJECTION WIRED
PREVIEW DEFERRED FAILURE PROPAGATION WIRED
EXPORT TERMINAL MAP HOOK WIRED
RECOVERY FAILURE PRE-FATAL EVENT WIRED
EXACT CYCLE EVENT CORRELATION WIRED
PACKAGED THREE-CYCLE PHYSICAL REPLAY PENDING
```

Packaged physical 성공 시:

```text
TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1
LOST PREVIEW·EXPORT OPERATIONS REJECTED
NO FALSE SUCCESS
NO EXPORT SAVE AFTER LOSS
RECOVERY FAILURE EVENT ORDER VERIFIED
THREE EXACT CYCLE BINDINGS REPLAYED
PHYSICAL SEMANTIC SEAL PASS
```
