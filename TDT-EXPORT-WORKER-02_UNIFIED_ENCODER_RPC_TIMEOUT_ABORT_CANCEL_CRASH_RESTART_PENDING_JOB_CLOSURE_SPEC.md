# TDT-EXPORT-WORKER-02
## Unified Encoder RPC / Timeout·Abort·Cancel / Crash Restart / Pending Job Closure Seal

> **상태:** IMPLEMENTATION SPECIFICATION  
> **부모 봉인:** `TDT-EXPORT-WORKER-01`  
> **상위 권위:** `TDT-RUNTIME-SSOT-01-R7`  
> **대상 저장소:** 다듬다듬 Vite·Vue3·Pinia Runtime + Legacy ExportManager  
> **승격 성격:** Worker 생성 권위 이후의 Job 실행 권위 회수  
> **후속 명세:** `TDT-EXPORT-WORKER-03 WebP Lossless / PNG8·PNG16 Canonical Worker Promotion Seal`

---

# 0. 문서 목적

`TDT-EXPORT-WORKER-01`은 다음을 Runtime 권위로 회수했다.

```text
Vite Worker URL
Worker Descriptor Manifest
Worker 생성권
HELLO / READY Handshake
Runtime Epoch
Worker Epoch
Generation
Worker Artifact Identity
Legacy Worker Bridge
```

그러나 실제 인코딩 Job의 소유권은 아직 레거시 호출자에 남아 있다.

현재 활성 경로는 다음과 같다.

```text
EncoderWorkerBrokerService
→ Worker 인스턴스와 수명 소유
→ Raw Lease 발급

Legacy WebP Loader
→ local jobId
→ local pending Map
→ lease.postMessage()
→ lease.addEventListener()

Legacy PNG16 Loader
→ local jobId
→ local pending Map
→ lease.postMessage()
→ lease.addEventListener()

Legacy PSD Bridge
→ module-global jobId
→ module-global pending Map
→ lease.postMessage()
→ lease.addEventListener()
```

따라서 EW01 이후에도 다음 문제가 남는다.

- Job ID의 SSOT가 Broker가 아니다.
- 동일 Worker에 여러 Lease가 생기면 로컬 Job ID가 충돌할 수 있다.
- 모든 Lease Listener가 동일 Worker Message를 수신한다.
- Job Timeout이 없다.
- AbortSignal 계약이 없다.
- Cancel 명령이 없다.
- Worker Crash 뒤 Pending Promise가 닫히지 않는다.
- `messageerror`가 처리되지 않는다.
- Worker가 READY 이후 실패해도 자동 재시작되지 않는다.
- Active Job과 Queued Job의 재시작 정책이 없다.
- Transfer된 입력 Buffer의 소유권 Receipt가 없다.
- Legacy Loader가 Lease를 반환하지 않는다.
- Runtime Dispose 시 Pending Job이 정확히 한 번 종료된다는 증거가 없다.
- Late Reply가 삭제된 Pending Slot을 다시 오염시키지 않는다는 증거가 없다.
- Job 종료 원인과 Export Receipt 사이의 결속이 없다.

본 명세는 이 공백을 닫는다.

---

# 1. 한 문장 목표

> **모든 Worker-backed Encoder Job의 ID 발급·입력 소유권·대기열·실행·Timeout·Abort·Cancel·Crash 처리·Restart·정확히 한 번 Settlement·Pending Map 폐쇄를 `EncoderWorkerBrokerService` 하나에 귀속시키고, 레거시 ExportManager는 `call()`만 사용하는 무상태 호환 클라이언트로 강등한다.**

---

# 2. 핵심 권위선

```text
Runtime Export Authority
→ Exact Runtime Encoder
→ Encoder Worker Broker.call()
→ Broker Job Admission
→ Broker-owned Input Snapshot
→ Per-Worker FIFO Queue
→ One Active Job
→ RPC CALL Envelope
→ Worker Codec Handler
→ RPC RESULT | RPC ERROR | RPC CANCELLED
→ Exactly-once Settlement
→ Worker Job Receipt
→ Export Receipt
```

Crash 경로는 다음과 같다.

```text
Worker error | messageerror | liveness timeout
→ Worker generation FAILED
→ Active Job terminal failure
→ In-flight generation Pending closure
→ Worker terminate
→ Generation increment
→ Controlled restart
→ Queued Job resume or deterministic rejection
→ Restart Receipt
```

Cancel 경로는 다음과 같다.

```text
Caller AbortSignal
→ Broker cancel request
→ Queued Job이면 즉시 CANCELLED
→ Active Job이면 cooperative CANCEL
→ grace timeout
→ cooperative 종료 실패 시 hard restart
→ sibling impact accounting
→ Exactly-once Settlement
```

---

# 3. 비목표

본 명세는 다음을 수행하지 않는다.

- WebP·PNG16·PSD Codec 알고리즘 변경
- JXL·JPEG·PNG8의 Worker 이전
- WebP Lossless의 Canvas Fallback 최종 제거
- PNG8과 PNG16 Codec 통합
- PSD Plane Split·LCMS의 Worker 이전
- Worker Pool 확장
- Worker 2개 이상의 병렬 인스턴스 허용
- Encoder 품질 옵션 재설계
- Output Signature 검증 규칙 변경
- Export 다운로드 UX 변경
- GPU Readback 구조 변경
- WASM 내부 루프에 강제 중단점을 자동 삽입

본 명세의 초점은 Codec이 아니라 **Job Control Plane**이다.

---

# 4. 현재 코드 기준선

## 4.1 Broker의 현재 Lease 계약

현재 `EncoderWorkerLease`는 다음 기능을 노출한다.

```ts
postMessage(message, transfer?)
addEventListener('message', listener)
removeEventListener('message', listener)
identity()
release()
```

이 계약은 Worker 인스턴스를 직접 노출하지는 않지만, 다음 권한을 호출자에게 넘긴다.

- Job ID 생성
- Message Shape 생성
- Transfer List 생성
- Pending Map 생성
- Reply Routing
- Error Mapping
- Listener 수명
- Promise Settlement

즉 Worker 인스턴스 SSOT는 Broker로 이동했지만 Job SSOT는 이동하지 않았다.

## 4.2 WebP Lossless

현재 `export_manager.js`는 Lazy Loader 내부에서 다음을 소유한다.

```text
jobId counter
pending Map
message listener
SharedArrayBuffer copy
resolve / reject
```

Data command:

```text
encode_full
```

Terminal message:

```text
done
error
```

현재 결손:

- Timeout 없음
- Abort 없음
- Cancel 없음
- Crash Pending closure 없음
- Listener 제거 없음
- Lease 반환 없음
- Job Receipt 없음

## 4.3 PNG16

현재 `export_manager.js`는 다음을 소유한다.

```text
jobId counter
pending Map
message listener
rgba16 또는 rgba Buffer transfer
resolve / reject
```

Data command:

```text
encode
```

Terminal message:

```text
done
error
```

현재 결손:

- Transfer 시 Caller Buffer가 즉시 Detach될 수 있음
- Queue 대기 중 입력 소유권 기록 없음
- Timeout 없음
- Abort 없음
- Cancel 없음
- Crash Pending closure 없음
- Lease 반환 없음

## 4.4 PSD

현재 `psd_export_bridge.js`는 module-global 상태를 소유한다.

```text
_workerLeasePromise
_jobId
_pending Map
```

현재 결손:

- Worker generation이 바뀌어도 `_workerLeasePromise`가 낡은 Lease를 유지할 수 있음
- Crash 뒤 `_pending`이 닫히지 않음
- Restart 뒤 새 Lease 재취득 규칙 없음
- Timeout·Abort·Cancel 없음
- Layered JS 경로와 Worker 경로의 Job Receipt 형식이 다름

## 4.5 Broker의 현재 실패 처리

EW01 Broker는 Handshake에 대해서만 15초 Timeout을 둔다.

READY 이후 Worker `error` 이벤트가 발생하면:

```text
record.state = FAILED
record.stableErrorCode = E_WORKER_SPAWN_FAILED
```

그러나 다음은 수행하지 않는다.

- Active Job Reject
- Queued Job 처리
- Listener 제거
- Pending Map Drain
- Worker terminate
- Generation restart
- Restart budget accounting
- Export Receipt 실패 증거

## 4.6 다중 Lease 충돌 위험

현재 Broker는 한 Worker에 여러 Lease를 허용한다.

각 호출자는 다음처럼 로컬 ID를 발급할 수 있다.

```text
Lease A → id 1
Lease B → id 1
```

Broker는 동일 Worker Message를 모든 Listener에 Fan-out한다.

따라서 Reply `id:1`이 두 Listener에서 동시에 채택될 수 있다.

이 위험은 Codec 구현 문제가 아니라 **Job ID SSOT 부재**다.

---

# 5. 권위 결정

## 5.1 Job SSOT

모든 Worker Job ID는 Broker만 발급한다.

금지:

```text
Legacy local jobId
Codec별 module-global jobId
Date.now 기반 ID
Math.random 기반 ID
Worker 자체 임의 Job ID
Export Job ID 재사용
```

권위 Job ID 형식:

```text
wj:<runtimeEpoch>:<workerId>:<generation>:<sequence>
```

예:

```text
wj:4:dadum.worker.encoder.png16-v1:2:17
```

Job ID는 Runtime Epoch 안에서 단조 증가해야 한다.

## 5.2 Pending Job Map SSOT

Pending Job Map은 Worker별 Broker Record가 단독 소유한다.

```ts
Map<WorkerJobId, EncoderWorkerJobRecord>
```

Legacy ExportManager와 Legacy PSD Bridge의 `pending Map`은 제거한다.

## 5.3 Reply Routing SSOT

Worker Message는 Broker가 한 번만 해석한다.

금지:

```text
Lease Listener Fan-out
Codec별 onMessage Router
여러 Pending Map의 동일 Reply 관찰
```

Broker는 `jobId`를 기준으로 정확히 한 Job Record에만 Reply를 전달한다.

## 5.4 Worker 동시성

EW02의 각 Worker Descriptor는 다음을 유지한다.

```text
maxInstances = 1
maxActiveJobs = 1
queueDiscipline = FIFO
```

한 Worker에서 Codec Job을 동시에 실행하지 않는다.

이 결정은 다음을 방지한다.

- WASM Heap 공유 충돌
- Codec 내부 전역 상태 충돌
- 취소 대상 불명확
- Peak Memory 예측 불가
- Reply 순서 비결정성

## 5.5 Legacy Client 권한

Legacy Client는 다음만 수행할 수 있다.

```ts
bridge.call(request)
```

Legacy Client는 다음을 수행할 수 없다.

```text
Worker Lease 취득
Raw postMessage
Listener 등록
Job ID 생성
Pending Map 생성
Worker terminate
Worker restart
```

---

# 6. 공통 RPC 계약

## 6.1 Protocol Identity

Data Plane Protocol:

```text
dadum-worker-rpc-v1
```

Control Plane은 EW01을 유지한다.

```text
dadum-worker-control-v1
```

## 6.2 Broker → Worker Message

### CALL

```ts
interface WorkerRpcCallEnvelope {
  channel: 'dadum.worker.rpc';
  rpcProtocolVersion: 'dadum-worker-rpc-v1';
  type: 'CALL';
  jobId: string;
  operation: string;
  payload: Record<string, unknown>;
  metadata: WorkerRpcMetadata;
  deadlineMonotonicMs: number;
  inputOwnership: WorkerInputOwnershipEvidence;
}
```

### CANCEL

```ts
interface WorkerRpcCancelEnvelope {
  channel: 'dadum.worker.rpc';
  rpcProtocolVersion: 'dadum-worker-rpc-v1';
  type: 'CANCEL';
  jobId: string;
  reason: 'caller-abort' | 'deadline' | 'runtime-dispose' | 'superseded';
  metadata: WorkerRpcMetadata;
}
```

## 6.3 Worker → Broker Message

### ACCEPTED

```ts
interface WorkerRpcAcceptedEnvelope {
  channel: 'dadum.worker.rpc';
  rpcProtocolVersion: 'dadum-worker-rpc-v1';
  type: 'ACCEPTED';
  jobId: string;
  metadata: WorkerRpcMetadata;
  acceptedAtMonotonicMs: number;
}
```

### PROGRESS

```ts
interface WorkerRpcProgressEnvelope {
  channel: 'dadum.worker.rpc';
  rpcProtocolVersion: 'dadum-worker-rpc-v1';
  type: 'PROGRESS';
  jobId: string;
  metadata: WorkerRpcMetadata;
  progressSequence: number;
  stage: string;
  completedUnits?: number;
  totalUnits?: number;
}
```

### RESULT

```ts
interface WorkerRpcResultEnvelope {
  channel: 'dadum.worker.rpc';
  rpcProtocolVersion: 'dadum-worker-rpc-v1';
  type: 'RESULT';
  jobId: string;
  metadata: WorkerRpcMetadata;
  result: Record<string, unknown>;
  executionEvidence: WorkerExecutionEvidence;
}
```

### ERROR

```ts
interface WorkerRpcErrorEnvelope {
  channel: 'dadum.worker.rpc';
  rpcProtocolVersion: 'dadum-worker-rpc-v1';
  type: 'ERROR';
  jobId: string;
  metadata: WorkerRpcMetadata;
  stableErrorCode: string;
  message: string;
  retryable: boolean;
}
```

### CANCELLED

```ts
interface WorkerRpcCancelledEnvelope {
  channel: 'dadum.worker.rpc';
  rpcProtocolVersion: 'dadum-worker-rpc-v1';
  type: 'CANCELLED';
  jobId: string;
  metadata: WorkerRpcMetadata;
  acknowledgedReason: string;
}
```

## 6.4 Metadata

```ts
interface WorkerRpcMetadata {
  workerId: EncoderWorkerId;
  runtimeEpoch: number;
  workerEpoch: string;
  generation: number;
  controlProtocolVersion: 'dadum-worker-control-v1';
  rpcProtocolVersion: 'dadum-worker-rpc-v1';
  codecProtocolVersion: string;
  buildId: string;
  workerArtifactSetDigest: string;
}
```

모든 RPC Message는 Metadata 전체가 현재 Broker Record와 일치해야 한다.

일부 필드 일치만으로 채택하지 않는다.

---

# 7. Codec Adapter 계약

기존 Codec Handler의 Data Command는 내부 Adapter가 흡수한다.

```ts
interface EncoderWorkerCodecAdapter {
  readonly adapterId: string;
  readonly operation: string;
  readonly cooperativeCancel: boolean;

  preparePayload(
    request: EncoderWorkerCallRequest,
  ): PreparedWorkerPayload;

  invoke(
    payload: Record<string, unknown>,
    context: WorkerJobExecutionContext,
  ): Promise<WorkerCodecResult>;

  cancel?(
    context: WorkerJobExecutionContext,
  ): Promise<void> | void;
}
```

Codec별 Adapter:

```text
WebP Lossless
operation = encode.webp-lossless
legacy command = encode_full

PNG16
operation = encode.png16
legacy command = encode

PSD Flattened
operation = encode.psd-flattened
legacy command = export
```

Legacy command 문자열은 Worker Entry 내부 Adapter에만 존재할 수 있다.

Renderer Legacy Client가 해당 문자열을 조립해서는 안 된다.

---

# 8. Public Bridge 계약

## 8.1 신규 Facade

```ts
interface DadumRuntimeWorkerBridgeFacadeV2 {
  readonly authority: 'dadum.runtime.encoder-worker-broker-ew02';

  call<T = Record<string, unknown>>(
    request: EncoderWorkerCallRequest,
  ): Promise<EncoderWorkerCallResult<T>>;

  cancel(jobId: string, reason?: string): Promise<EncoderWorkerCancelResult>;

  identity(workerId: EncoderWorkerId): EncoderWorkerRuntimeIdentity;

  jobReceipt(jobId: string): EncoderWorkerJobReceipt | null;

  listJobReceipts(filter?: EncoderWorkerJobReceiptFilter): readonly EncoderWorkerJobReceipt[];

  receiptSnapshot(): Promise<EncoderWorkerBrokerReceiptV2>;
}
```

## 8.2 Call Request

```ts
interface EncoderWorkerCallRequest {
  workerId: EncoderWorkerId;
  runtimeEncoderId: string;
  codecProtocolVersion: string;
  operation: string;
  payload: Record<string, unknown>;
  transfer?: readonly Transferable[];
  timeoutMs?: number;
  queueTimeoutMs?: number;
  cancelGraceMs?: number;
  signal?: AbortSignal;
  exportJobId?: string;
  finalRevision?: number;
  inputOwnershipPolicyId: string;
}
```

## 8.3 Call Result

```ts
interface EncoderWorkerCallResult<T> {
  jobId: string;
  result: T;
  workerEvidence: EncoderWorkerJobWorkerEvidence;
  jobReceiptId: string;
}
```

## 8.4 Raw Lease 폐기

EW02 승격 후 다음 API는 제품 코드에서 제거한다.

```text
bridge.acquire()
lease.postMessage()
lease.addEventListener()
lease.removeEventListener()
lease.release()
```

호환 기간에 타입만 남겨야 한다면 `@deprecated`로 표기하고 Runtime에서 호출 시 Fail-Closed한다.

```text
E_WORKER_RAW_LEASE_FORBIDDEN
```

---

# 9. Job 상태 머신

## 9.1 상태

```ts
type EncoderWorkerJobState =
  | 'ADMITTING'
  | 'QUEUED'
  | 'DISPATCHING'
  | 'ACCEPTED'
  | 'RUNNING'
  | 'CANCEL_REQUESTED'
  | 'SETTLED_RESULT'
  | 'SETTLED_ERROR'
  | 'SETTLED_CANCELLED'
  | 'SETTLED_TIMEOUT'
  | 'SETTLED_CRASHED'
  | 'SETTLED_RESTARTED'
  | 'RETIRED';
```

## 9.2 정상 전이

```text
ADMITTING
→ QUEUED
→ DISPATCHING
→ ACCEPTED
→ RUNNING
→ SETTLED_RESULT
→ RETIRED
```

Worker가 ACCEPTED를 생략하고 즉시 RESULT를 보내는 구현은 허용하지 않는다.

## 9.3 Error 전이

```text
ADMITTING → SETTLED_ERROR
QUEUED → SETTLED_ERROR
DISPATCHING → SETTLED_ERROR
ACCEPTED → SETTLED_ERROR
RUNNING → SETTLED_ERROR
```

## 9.4 Cancel 전이

```text
QUEUED
→ CANCEL_REQUESTED
→ SETTLED_CANCELLED

RUNNING
→ CANCEL_REQUESTED
→ Worker CANCELLED
→ SETTLED_CANCELLED
```

## 9.5 Timeout 전이

```text
QUEUED
→ queue deadline exceeded
→ SETTLED_TIMEOUT

RUNNING
→ execution deadline exceeded
→ CANCEL_REQUESTED
→ grace expiry
→ hard restart
→ SETTLED_TIMEOUT
```

## 9.6 Crash 전이

```text
DISPATCHING | ACCEPTED | RUNNING
→ Worker crash
→ SETTLED_CRASHED
→ RETIRED
```

## 9.7 금지 전이

다음은 Runtime Error다.

```text
SETTLED_* → RUNNING
SETTLED_* → 다른 SETTLED_*
RETIRED → RESULT 채택
QUEUED → RESULT
RUNNING → ACCEPTED 재수신
CANCELLED → RESULT 채택
```

Stable Error:

```text
E_WORKER_JOB_STATE_VIOLATION
```

---

# 10. Exactly-once Settlement

## 10.1 단일 Settlement 함수

모든 종료는 다음 내부 함수만 통한다.

```ts
settleJob(
  record: EncoderWorkerJobRecord,
  terminal: EncoderWorkerJobTerminal,
): void
```

이 함수만 다음을 수행할 수 있다.

- Promise resolve
- Promise reject
- Timer clear
- Abort Listener 제거
- Active Slot 해제
- Pending Map 삭제
- Job Receipt 생성
- Queue Pump 호출

## 10.2 두 번째 Settlement

이미 terminal 상태인 Job에 두 번째 종료가 도착하면:

```text
Reply 채택 금지
Promise 재처리 금지
Receipt 변경 금지
Diagnostic 기록
```

Diagnostic:

```text
E_WORKER_DUPLICATE_TERMINAL_MESSAGE
```

## 10.3 Late Reply

Timeout·Cancel·Crash 뒤 도착한 Reply는:

```text
Pending Map lookup 실패
→ retired Job Ledger lookup
→ stale terminal로 기록
→ 결과 바이트 폐기
```

Late Reply가 Export Receipt를 만들 수 없다.

---

# 11. Queue 계약

## 11.1 Worker별 FIFO

각 Broker Record는 다음을 소유한다.

```ts
queue: EncoderWorkerJobRecord[]
activeJobId: string | null
pendingJobs: Map<string, EncoderWorkerJobRecord>
retiredJobs: RingBuffer<EncoderWorkerJobReceipt>
```

## 11.2 동시 실행

```text
maxActiveJobs = 1
```

Queue에서 다음 Job을 Dispatch하는 조건:

```text
Worker state READY | ACTIVE
activeJobId == null
queue.length > 0
restart state가 아님
```

## 11.3 Queue Limit

Descriptor 기본값:

```text
maxQueuedJobs = 8
```

초과 시:

```text
E_WORKER_QUEUE_FULL
```

무제한 Queue를 허용하지 않는다.

## 11.4 Queue Timeout

기본값:

```text
queueTimeoutMs = 30_000
```

Queue에서 대기하는 시간과 Worker 실행 시간은 별도 측정한다.

## 11.5 Fairness

EW02는 Worker별 FIFO만 보장한다.

Encoder 간 전역 Fair Scheduler는 도입하지 않는다.

---

# 12. Timeout 계약

## 12.1 시간원

모든 Timeout은 단조 시간원을 사용한다.

```ts
performance.now()
```

금지:

```text
Date.now만 사용한 Duration 계산
System Clock 변경에 영향받는 Deadline
```

Receipt의 사람이 읽는 시각은 wall clock을 추가할 수 있으나 판단 기준은 monotonic clock이다.

## 12.2 Timeout 종류

```text
handshakeTimeoutMs
queueTimeoutMs
executionTimeoutMs
cancelGraceMs
restartReadyTimeoutMs
```

## 12.3 기본값

```text
handshakeTimeoutMs = 15_000
queueTimeoutMs = 30_000
executionTimeoutMs:
  webp-lossless = 120_000
  png16 = 120_000
  psd-flattened = 180_000
cancelGraceMs = 1_500
restartReadyTimeoutMs = 15_000
```

이 값은 Descriptor Policy로 귀속한다.

Legacy Caller가 무제한 Timeout을 요청할 수 없다.

## 12.4 Clamp

```text
minimum execution timeout = 1_000ms
maximum execution timeout = 600_000ms
```

0 또는 Infinity는 허용하지 않는다.

## 12.5 Timeout Error

```text
E_WORKER_JOB_QUEUE_TIMEOUT
E_WORKER_JOB_EXECUTION_TIMEOUT
E_WORKER_CANCEL_GRACE_TIMEOUT
```

---

# 13. Abort와 Cancel 계약

## 13.1 AbortSignal

`bridge.call()`은 `AbortSignal`을 받을 수 있다.

Admission 전에 이미 aborted면 Worker Job을 만들지 않는다.

```text
E_WORKER_JOB_ABORTED_BEFORE_ADMISSION
```

Admission 이후 Abort되면 Broker가 Job 상태에 따라 처리한다.

## 13.2 Queued Job Cancel

Queued Job은 Worker에 전달되지 않았으므로 즉시 취소한다.

```text
Queue 제거
Input Ownership 정리
SETTLED_CANCELLED
```

Worker Restart는 발생하지 않는다.

## 13.3 Active Job Cooperative Cancel

Worker Entry는 active Job별 `AbortController`를 소유한다.

CANCEL 수신 시:

```text
AbortController.abort(reason)
Adapter.cancel() 호출 가능
Codec Handler가 cooperative 종료
CANCELLED 반환
```

## 13.4 Non-cooperative WASM

현재 일부 WASM Encoder는 계산 중 JS Event Loop로 제어를 반환하지 않을 수 있다.

따라서 Cancel은 다음 2단계다.

```text
1. cooperative CANCEL 전송
2. cancelGraceMs 대기
3. 응답 없으면 Worker hard terminate
4. generation restart
```

Hard Cancel은 Worker 단위 효과를 가진다.

## 13.5 Sibling Impact

EW02는 Worker당 active Job 1개만 허용한다.

따라서 hard terminate 시 Active Sibling은 없다.

Queued Job은 Worker에 들어가지 않았으므로 Broker 소유 Payload를 유지한 채 Restart 뒤 재개할 수 있다.

## 13.6 Cancel Result

Caller 취소는 다음 Error로 표면화한다.

```text
E_WORKER_JOB_CANCELLED
```

Timeout에 의해 Cancel된 경우 Caller에는 Timeout Error를 유지한다.

```text
E_WORKER_JOB_EXECUTION_TIMEOUT
```

원인과 종료 메커니즘을 혼동하지 않는다.

---

# 14. Input Ownership 계약

## 14.1 목적

Job이 Queue에 들어간 순간부터 입력 바이트의 소유자가 명확해야 한다.

Caller가 Queue 대기 중 Buffer를 수정하거나 재사용해서 결과가 달라지는 것을 금지한다.

## 14.2 정책 종류

```ts
type WorkerInputOwnershipPolicyId =
  | 'broker-transfer-snapshot-v1'
  | 'broker-copy-snapshot-v1'
  | 'broker-shared-copy-v1';
```

## 14.3 Transfer Snapshot

`broker-transfer-snapshot-v1`:

```text
Admission 시 structuredClone(payload, { transfer })
→ Caller Buffer detach
→ Broker-owned clone 생성
→ Queue 보관
→ Dispatch 시 Worker로 transfer
```

Receipt:

```text
callerDetachedAtAdmission = true
brokerOwnedBeforeDispatch = true
```

## 14.4 Copy Snapshot

`broker-copy-snapshot-v1`:

```text
Admission 시 TypedArray deep copy
→ Caller Buffer 유지
→ Broker-owned copy 생성
```

작은 Metadata 또는 Caller 생존이 필요한 경로에 사용한다.

## 14.5 Shared Copy

`broker-shared-copy-v1`:

```text
Broker가 새 SharedArrayBuffer 생성
→ Caller bytes copy
→ Caller에게 SAB 노출하지 않음
→ Worker에 read-only convention으로 전달
```

WebP Lossless의 현재 Caller-side SAB 생성은 Broker-side로 이동한다.

## 14.6 금지

```text
Caller가 만든 Mutable SAB를 그대로 채택
Queue에 Caller-owned TypedArray reference 보관
Dispatch 직전까지 입력 Snapshot 지연
Transfer Receipt 없는 Buffer detach
```

## 14.7 Input Evidence

```ts
interface WorkerInputOwnershipEvidence {
  policyId: WorkerInputOwnershipPolicyId;
  inputByteLength: number;
  transferredObjectCount: number;
  copiedObjectCount: number;
  sharedObjectCount: number;
  callerDetachedAtAdmission: boolean;
  brokerOwnedBeforeDispatch: boolean;
  inputDigestMode: 'none' | 'sha256';
  inputSha256?: string;
}
```

EW02 기본은 대형 Pixel Buffer의 SHA-256을 강제하지 않는다.

그러나 테스트 Fixture와 Promotion Smoke에서는 `sha256` 모드를 사용한다.

---

# 15. Worker Entry 실행 계약

## 15.1 Active Job Slot

Worker Entry는 다음을 소유한다.

```ts
let activeJob: WorkerEntryJob | null
```

CALL 수신 시 Active Job이 있으면:

```text
E_WORKER_ENTRY_BUSY
```

Broker가 직렬화를 보장하더라도 Worker Entry도 방어한다.

## 15.2 ACCEPTED

Worker가 Job Payload 검증과 Active Slot 확보를 완료하면 ACCEPTED를 반환한다.

ACCEPTED 전에는 Codec 실행을 시작하지 않는다.

## 15.3 AbortSignal 전달

```ts
interface WorkerJobExecutionContext {
  jobId: string;
  signal: AbortSignal;
  emitProgress(stage: string, evidence?: Record<string, unknown>): void;
  workerContext: WorkerCodecContext;
}
```

## 15.4 Terminal 반환

Worker Entry는 Codec Handler 반환을 다음 중 하나로 변환한다.

```text
RESULT
ERROR
CANCELLED
```

Raw `done`, `error`는 Worker Entry 밖으로 나가지 않는다.

## 15.5 Finally Closure

모든 Job은 Worker Entry `finally`에서:

```text
activeJob = null
AbortController reference 해제
임시 Buffer reference 해제
```

를 수행해야 한다.

---

# 16. Crash 감지 계약

## 16.1 Crash Source

다음은 모두 Worker Generation Failure다.

```text
Worker error event
Worker messageerror event
Unexpected close evidence
Handshake timeout
READY 뒤 control identity mismatch
Active Job execution liveness timeout
Invalid RPC Envelope 반복
```

## 16.2 `messageerror`

Broker는 반드시 다음 Listener를 등록한다.

```ts
worker.addEventListener('messageerror', ...)
```

Structured Clone 실패를 단순 Codec Error로 취급하지 않는다.

Stable Error:

```text
E_WORKER_MESSAGE_DESERIALIZATION_FAILED
```

## 16.3 Crash Closure 순서

```text
1. Generation을 FAILED로 원자적 전환
2. 추가 Message 채택 중지
3. Active Job terminal settlement
4. Worker Event Listener 제거
5. Worker terminate
6. Registry handle 제거
7. Generation Receipt 생성
8. Restart Policy 평가
9. Restart 또는 Circuit Open
10. Queue 처리
```

순서를 뒤집지 않는다.

---

# 17. Restart 계약

## 17.1 Generation

Restart마다:

```text
generation += 1
workerEpoch 재발급
```

이전 Generation Message는 현재 Pending Job과 Job ID가 같더라도 채택하지 않는다.

## 17.2 Restart 대상

다음은 자동 Restart 가능하다.

```text
Worker crash
messageerror
hard cancel
execution timeout hard stop
recoverable WASM runtime abort
```

다음은 자동 Restart하지 않는다.

```text
Artifact identity mismatch
Control protocol mismatch
Codec protocol mismatch
Build ID mismatch
Descriptor corruption
Repeated handshake rejection
```

## 17.3 Restart Budget

Worker별 기본 정책:

```text
maxRestartsPerWindow = 3
restartWindowMs = 60_000
backoff = [0, 250, 1_000] ms
```

Budget 초과 시:

```text
state = CIRCUIT_OPEN
E_WORKER_RESTART_BUDGET_EXHAUSTED
```

`CIRCUIT_OPEN` 상태를 새 State로 추가한다.

## 17.4 Active Job Replay

Active Job은 자동 Replay하지 않는다.

이유:

- Worker가 결과를 만들었지만 Reply 직전에 Crash했을 수 있음
- Replay하면 이중 실행 여부가 불명확함
- Codec 내부 Side Effect를 일반화할 수 없음

Active Job 종료:

```text
E_WORKER_JOB_CRASHED
```

## 17.5 Queued Job Resume

아직 Worker에 Dispatch되지 않은 Queued Job은 Broker-owned Snapshot이 존재한다.

따라서 Restart 성공 뒤 FIFO 순서대로 재개한다.

단, Queue Deadline이 지나면 Timeout으로 종료한다.

## 17.6 Restart Ready Gate

Restart 성공은 다음이 모두 만족돼야 한다.

```text
새 generation
새 workerEpoch
HELLO / READY PASS
WASM ready evidence PASS
Artifact identity 일치
```

단순 Worker 생성 성공은 Restart 성공이 아니다.

---

# 18. Liveness와 Heartbeat

## 18.1 진행 신호

장시간 Encoder는 PROGRESS를 선택적으로 보낼 수 있다.

```text
stage
progressSequence
completedUnits
totalUnits
```

## 18.2 Heartbeat와 Execution Deadline

PROGRESS가 와도 절대 Execution Deadline은 연장하지 않는다.

Progress는 다음만 증명한다.

```text
Worker Event Loop가 응답 가능함
해당 Job이 현재 Generation에서 살아 있음
```

## 18.3 Silence Threshold

Descriptor는 별도 `livenessSilenceMs`를 가질 수 있다.

기본:

```text
30_000ms
```

Worker가 계산 중 Event Loop를 반환하지 않는 Codec에는 Silence Timeout을 강제하지 않고 Execution Timeout만 적용한다.

잘못된 Heartbeat 기대 때문에 정상 WASM을 Crash로 오판하지 않는다.

---

# 19. Error Registry

EW02는 다음 Stable Error Code를 추가한다.

```text
E_WORKER_RAW_LEASE_FORBIDDEN
E_WORKER_RPC_PROTOCOL_MISMATCH
E_WORKER_RPC_ENVELOPE_INVALID
E_WORKER_JOB_ID_COLLISION
E_WORKER_JOB_STATE_VIOLATION
E_WORKER_DUPLICATE_TERMINAL_MESSAGE
E_WORKER_QUEUE_FULL
E_WORKER_JOB_QUEUE_TIMEOUT
E_WORKER_JOB_EXECUTION_TIMEOUT
E_WORKER_JOB_ABORTED_BEFORE_ADMISSION
E_WORKER_JOB_CANCELLED
E_WORKER_CANCEL_GRACE_TIMEOUT
E_WORKER_ENTRY_BUSY
E_WORKER_JOB_CRASHED
E_WORKER_MESSAGE_DESERIALIZATION_FAILED
E_WORKER_RESTART_FAILED
E_WORKER_RESTART_BUDGET_EXHAUSTED
E_WORKER_PENDING_JOB_LEAK
E_WORKER_INPUT_OWNERSHIP_INVALID
E_WORKER_STALE_JOB_MESSAGE_REJECTED
```

각 Error는 다음 필드를 포함한다.

```text
workerId
jobId 또는 null
runtimeEpoch
generation
workerEpoch
state
operation
exportJobId 또는 null
```

---

# 20. Receipt 계약

## 20.1 Job Receipt

```ts
interface EncoderWorkerJobReceipt {
  schema: 'dadum-encoder-worker-job-receipt-v1';
  receiptId: string;
  jobId: string;
  exportJobId: string | null;
  runtimeEncoderId: string;
  workerId: EncoderWorkerId;
  operation: string;

  runtimeEpoch: number;
  generation: number;
  workerEpoch: string;
  buildId: string;
  workerArtifactSetDigest: string;

  admittedSequence: number;
  queuePositionAtAdmission: number;
  admittedAtMonotonicMs: number;
  dispatchedAtMonotonicMs: number | null;
  acceptedAtMonotonicMs: number | null;
  terminalAtMonotonicMs: number;

  queueDurationMs: number;
  executionDurationMs: number | null;
  totalDurationMs: number;

  inputOwnership: WorkerInputOwnershipEvidence;
  timeoutPolicy: WorkerJobTimeoutPolicy;
  cancelEvidence: WorkerJobCancelEvidence | null;
  crashEvidence: WorkerJobCrashEvidence | null;
  restartEvidence: WorkerRestartEvidence | null;

  terminalState:
    | 'result'
    | 'error'
    | 'cancelled'
    | 'timeout'
    | 'crashed'
    | 'restarted';

  stableErrorCode: string | null;
  outputByteLength: number | null;
  outputSha256: string | null;
  resultAdopted: boolean;
  receiptDigest: string;
}
```

## 20.2 Generation Receipt

```ts
interface EncoderWorkerGenerationReceipt {
  schema: 'dadum-worker-generation-receipt-v1';
  workerId: EncoderWorkerId;
  runtimeEpoch: number;
  generation: number;
  workerEpoch: string;
  openedAtMonotonicMs: number;
  closedAtMonotonicMs: number | null;
  closeReason: string | null;
  jobsAdmitted: number;
  jobsCompleted: number;
  jobsCancelled: number;
  jobsTimedOut: number;
  jobsCrashed: number;
  staleMessagesRejected: number;
  duplicateTerminalsRejected: number;
  pendingAtClose: number;
  generationDigest: string;
}
```

## 20.3 Broker Receipt V2

```text
schema = dadum-encoder-worker-broker-receipt-v2
```

추가 필드:

```text
rpcProtocolVersion
pendingJobCount
queuedJobCount
activeJobCount
retiredJobCount
restartCount
circuitOpenWorkerCount
pendingLeakCount
rawLeaseAllowed = false
```

## 20.4 Export Receipt 결속

Worker-backed Export Receipt는 다음을 포함해야 한다.

```text
workerJobId
workerJobReceiptId
workerJobReceiptDigest
workerGeneration
workerEpoch
rpcProtocolVersion
jobTerminalState = result
```

`jobTerminalState != result`이면 Export Success Receipt를 만들 수 없다.

---

# 21. Pending Job Closure

## 21.1 정상 종료

Job Promise Settlement 직후:

```text
pendingJobs.has(jobId) == false
queue에 jobId 없음
activeJobId != jobId
Abort listener 없음
Timer 없음
```

## 21.2 Runtime Dispose

Dispose 시작 시 새 Admission을 거부한다.

```text
E_RUNTIME_DISPOSING
```

그 뒤:

```text
Queued Job 전부 CANCELLED(runtime-dispose)
Active Job CANCEL 전송
cancelGraceMs 대기
필요 시 hard terminate
모든 Promise terminal settlement
pendingJobs.size == 0
queue.length == 0
activeJobId == null
Worker terminate
```

## 21.3 Dispose Gate

Runtime Dispose 완료 조건:

```text
총 admitted jobs
=
result + error + cancelled + timeout + crashed + restarted
```

그리고:

```text
pendingJobCount = 0
```

불일치 시:

```text
E_WORKER_PENDING_JOB_LEAK
```

## 21.4 Receipt Retention

Pending Map에서는 제거하지만 Job Receipt는 bounded Ring Buffer에 보존한다.

기본:

```text
maxRetiredJobReceiptsPerWorker = 256
```

무제한 Receipt 보존은 금지한다.

---

# 22. Legacy WebP Migration

## 22.1 제거 대상

`export_manager.js`에서 제거한다.

```text
jobId counter
pending Map
onMessage listener
lease acquisition
SharedArrayBuffer 직접 생성
```

## 22.2 신규 호출

```js
const result = await window.DadumRuntimeWorkerBridge.call({
  workerId: 'dadum.worker.encoder.webp-lossless-v1',
  runtimeEncoderId: 'dadum.encoder.webp-lossless.v1',
  codecProtocolVersion: 'dadum-webp-lossless-worker-v1',
  operation: 'encode.webp-lossless',
  payload: {
    rgba,
    width,
    height,
    nearLossless,
    resolutionMeta,
  },
  timeoutMs,
  signal,
  inputOwnershipPolicyId: 'broker-shared-copy-v1',
});
```

## 22.3 반환

Legacy Handler는 결과를 기존 Export Result Envelope로 변환한다.

```text
u8
mime = image/webp
ext = webp
encoderEvidence.workerJobReceiptId
```

---

# 23. Legacy PNG16 Migration

## 23.1 제거 대상

```text
jobId counter
pending Map
onMessage listener
lease acquisition
Caller-side transfer postMessage
```

## 23.2 입력 정책

RGBA16:

```text
broker-transfer-snapshot-v1
```

RGBA8 확장 경로:

```text
broker-transfer-snapshot-v1
```

Caller가 원본 Buffer 생존을 요구하면 명시적으로 Copy Policy를 요청해야 한다.

조용한 Copy 또는 조용한 Detach를 금지한다.

## 23.3 반환

```text
u8
mime = image/png
ext = png
encoderEvidence.workerJobReceiptId
```

PNG16 Signature/IHDR 검증은 R7 Export Authority가 계속 담당한다.

---

# 24. Legacy PSD Migration

## 24.1 제거 대상

`psd_export_bridge.js`에서 제거한다.

```text
_workerLeasePromise
_jobId
_pending Map
Worker message listener
```

## 24.2 Worker-backed 범위

EW02에서 Broker RPC로 이전하는 것은 다음 경로다.

```text
PSD Flattened Rust/WASM
```

Main-thread PSD8 Layered JS는 Worker Job으로 위장하지 않는다.

## 24.3 반환 증거

```text
workerBacked = true
workerJobReceiptId
workerJobReceiptDigest
```

Main-thread 경로:

```text
workerBacked = false
workerJobReceiptId = null
```

---

# 25. Service 구조 변경

## 25.1 EncoderWorkerBrokerService

추가 책임:

```text
Job ID 발급
Job Admission
Input Snapshot
Queue
Dispatch
RPC Routing
Timeout
Abort
Cancel
Crash Closure
Restart
Receipt Ledger
Pending Leak Gate
```

## 25.2 WorkerRegistryService

기존 책임 유지:

```text
유일한 Worker 생성
유일한 Worker terminate
Worker handle registry
```

Job Pending을 소유하지 않는다.

## 25.3 Worker Entry Runtime

다음으로 확장한다.

```text
Control Plane v1
+ RPC Data Plane v1
+ Active Job Slot
+ AbortController
+ CANCEL
+ Exactly-once terminal envelope
```

## 25.4 ExportAuthorityService

추가 검증:

```text
worker-backed encoder라면 workerJobReceipt 필수
workerJob terminal result 필수
worker generation identity 일치
```

---

# 26. 데이터 구조

## 26.1 Broker Record

```ts
interface BrokerRecordV2 {
  descriptor: EncoderWorkerDescriptorV2;
  generation: number;
  state: EncoderWorkerStateV2;
  workerEpoch: string;
  worker: Worker | null;

  realizePromise: Promise<void> | null;
  restartPromise: Promise<void> | null;

  queue: EncoderWorkerJobRecord[];
  activeJobId: string | null;
  pendingJobs: Map<string, EncoderWorkerJobRecord>;
  retiredReceipts: RingBuffer<EncoderWorkerJobReceipt>;

  nextJobSequence: number;
  restartHistory: number[];
  currentGenerationReceipt: EncoderWorkerGenerationReceiptBuilder;

  artifactVerified: boolean;
  wasmReady: boolean;
  stableErrorCode: string | null;
}
```

## 26.2 Job Record

```ts
interface EncoderWorkerJobRecord {
  jobId: string;
  state: EncoderWorkerJobState;
  request: NormalizedEncoderWorkerCallRequest;
  ownedPayload: Record<string, unknown>;
  transfer: Transferable[];
  inputOwnership: WorkerInputOwnershipEvidence;

  admittedAt: number;
  dispatchedAt: number | null;
  acceptedAt: number | null;
  terminalAt: number | null;

  queueTimer: ReturnType<typeof setTimeout> | null;
  executionTimer: ReturnType<typeof setTimeout> | null;
  cancelGraceTimer: ReturnType<typeof setTimeout> | null;
  abortCleanup: (() => void) | null;

  resolve: (value: EncoderWorkerCallResult) => void;
  reject: (reason: unknown) => void;
  settled: boolean;
}
```

---

# 27. Worker State 확장

EW01 State:

```text
DECLARED
SPAWNING
HANDSHAKING
READY
ACTIVE
FAILED
DISPOSED
```

EW02 State:

```text
DECLARED
SPAWNING
HANDSHAKING
READY
ACTIVE
RESTARTING
CIRCUIT_OPEN
FAILED
DISPOSING
DISPOSED
```

상태 정의:

```text
READY
Worker 준비, active job 없음

ACTIVE
active job 1개 실행 중

RESTARTING
이전 generation 폐쇄 후 새 generation 준비 중

CIRCUIT_OPEN
Restart budget 소진, 새 Job Admission 금지

DISPOSING
새 Admission 금지, Pending Drain 중
```

---

# 28. Determinism

다음은 동일 입력과 동일 정책에서 결정적이어야 한다.

```text
Job ID sequence
Queue order
Timeout policy normalization
Error code mapping
Terminal state
Receipt canonical JSON
Receipt digest
Restart budget 판단
```

다음은 Receipt Digest에서 제외하거나 정규화한다.

```text
절대 wall-clock timestamp
Error stack
Browser-specific Worker error text
Object identity
Promise identity
```

Monotonic Duration은 측정값으로 보존할 수 있으나 정책 Digest와 분리한다.

---

# 29. 보안 및 경계

## 29.1 Operation Allowlist

Worker Descriptor는 허용 Operation을 명시한다.

```text
WebP: encode.webp-lossless
PNG16: encode.png16
PSD: encode.psd-flattened
```

임의 Operation 전달 금지.

```text
E_WORKER_RPC_OPERATION_FORBIDDEN
```

## 29.2 Payload Prototype

RPC Payload는 Plain Data만 허용한다.

금지:

```text
Function
DOM Node
Window
Worker
MessagePort, 별도 승인 없는 경우
Prototype pollution key
```

## 29.3 Transfer Allowlist

Descriptor의 `transferPolicyId`와 일치하는 Transferable만 허용한다.

임의 MessagePort 전송을 금지한다.

---

# 30. Diagnostics

필수 Diagnostic Event:

```text
I_WORKER_JOB_ADMITTED
I_WORKER_JOB_QUEUED
I_WORKER_JOB_DISPATCHED
I_WORKER_JOB_ACCEPTED
I_WORKER_JOB_PROGRESS
I_WORKER_JOB_SETTLED
I_WORKER_JOB_CANCEL_REQUESTED
I_WORKER_JOB_CANCELLED
I_WORKER_RESTART_STARTED
I_WORKER_RESTART_READY
I_WORKER_QUEUE_RESUMED

E_WORKER_JOB_QUEUE_TIMEOUT
E_WORKER_JOB_EXECUTION_TIMEOUT
E_WORKER_JOB_CRASHED
E_WORKER_DUPLICATE_TERMINAL_MESSAGE
E_WORKER_STALE_JOB_MESSAGE_REJECTED
E_WORKER_RESTART_FAILED
E_WORKER_RESTART_BUDGET_EXHAUSTED
E_WORKER_PENDING_JOB_LEAK
```

Pixel Payload와 출력 바이트는 Diagnostic에 기록하지 않는다.

---

# 31. 정적 Gate

## GATE-EW02-01 Raw Lease Removal

활성 제품 코드에서 다음 문자열 0건:

```text
DadumRuntimeWorkerBridge.acquire
lease.postMessage
lease.addEventListener
new Map() // Worker Job Pending 용도
```

허용 위치:

```text
테스트 Fixture
Migration 설명 문서
```

## GATE-EW02-02 Broker-owned Job ID

WebP·PNG16·PSD Worker-backed 경로에서 로컬 `jobId++` 0건.

## GATE-EW02-03 Unified RPC Protocol

세 Worker Entry 모두:

```text
dadum-worker-rpc-v1
CALL
ACCEPTED
RESULT
ERROR
CANCELLED
```

계약 채택.

## GATE-EW02-04 One Active Job

Descriptor와 Worker Entry 모두 `maxActiveJobs = 1` 증거.

## GATE-EW02-05 Timeout Policy

세 Worker Descriptor에 Queue·Execution·Cancel Grace Timeout 존재.

## GATE-EW02-06 Abort Wiring

`AbortSignal` admission-before와 admission-after 분기 존재.

## GATE-EW02-07 Messageerror

Broker에 `messageerror` Listener 존재.

## GATE-EW02-08 Exactly-once Settlement

Promise resolve/reject 호출이 중앙 `settleJob()` 밖에 존재하지 않음.

## GATE-EW02-09 Pending Closure

Dispose 종료 시 `pendingJobs.size === 0` Assert 존재.

## GATE-EW02-10 Restart Generation

Restart마다 generation 증가와 workerEpoch 재발급.

## GATE-EW02-11 Restart Budget

무제한 Restart 경로 0건.

## GATE-EW02-12 Active Replay Forbidden

Crash Active Job 자동 재전송 0건.

## GATE-EW02-13 Queued Resume Contract

Restart 뒤 Queue FIFO 유지 증거.

## GATE-EW02-14 Input Ownership

세 Codec이 명시적 Ownership Policy 사용.

## GATE-EW02-15 Stale Generation Rejection

RPC Metadata 전체 identity 비교.

## GATE-EW02-16 Receipt Binding

Worker-backed Export Receipt에 Job Receipt 결속.

## GATE-EW02-17 Bounded Ledger

Retired Receipt 저장소가 bounded.

## GATE-EW02-18 Operation Allowlist

Worker별 Operation allowlist 존재.

## GATE-EW02-19 Legacy Pending Removal

다음 파일의 Worker Job Pending Map 0건.

```text
app/legacy-runtime/export_manager.js
app/legacy-runtime/libs/psd/psd_export_bridge.js
```

## GATE-EW02-20 Parent Seal Preservation

EW01 Worker URL·Epoch·Artifact Digest Gate 전부 PASS.

## GATE-EW02-21 R7 Export Truth Preservation

Exact Format·Final Surface·Signature·Output SHA Gate 전부 PASS.

## GATE-EW02-22 Type Closure

Strict TypeScript에서 암묵적 `any` 0건.

## GATE-EW02-23 No Silent Fallback

RPC 실패 뒤 Main-thread Encoder로 자동 하강 0건.

## GATE-EW02-24 Authority String

제품 Bridge Authority:

```text
dadum.runtime.encoder-worker-broker-ew02
```

EW01 Authority를 제품 호출자가 요구하는 코드 0건.

---

# 32. Runtime Test Matrix

## RT-EW02-01 Normal WebP

```text
1 Job admission
1 Queue entry
1 Dispatch
1 ACCEPTED
1 RESULT
1 Settlement
Pending 0
```

## RT-EW02-02 Normal PNG16 Transfer

검증:

```text
Caller Buffer admission 시 detach
Broker-owned snapshot 존재
결과 PNG16
Pending 0
```

## RT-EW02-03 Normal PSD Worker

검증:

```text
Worker-backed true
Job Receipt 존재
Pending 0
```

## RT-EW02-04 Two Jobs FIFO

동일 Worker에 2개 Job 제출.

```text
Job 1 RUNNING
Job 2 QUEUED
Job 1 terminal 뒤 Job 2 dispatch
```

## RT-EW02-05 Local ID Collision Elimination

서로 다른 Legacy Caller가 동시에 호출해도 Broker Job ID가 유일함.

## RT-EW02-06 Queue Full

9번째 Job이 `E_WORKER_QUEUE_FULL`.

## RT-EW02-07 Queue Timeout

Active Job이 오래 실행될 때 Queued Job이 Queue Timeout.

Worker는 Restart하지 않음.

## RT-EW02-08 Execution Timeout

Active Job Deadline 초과.

```text
CANCEL
Grace
Hard terminate
Restart
Job timeout settlement
```

## RT-EW02-09 Abort Before Admission

Worker 생성·Queue 진입 0건.

## RT-EW02-10 Abort Queued

Queue에서 즉시 제거, Worker Message 0건.

## RT-EW02-11 Abort Active Cooperative

Worker `CANCELLED`, Restart 0건.

## RT-EW02-12 Abort Active Non-cooperative

Grace 초과 후 hard restart.

## RT-EW02-13 Crash Active

Active Job `E_WORKER_JOB_CRASHED`, 자동 Replay 0건.

## RT-EW02-14 Crash with Queued Jobs

Active Job 실패, Queued Job은 Restart 뒤 FIFO 재개.

## RT-EW02-15 Messageerror

Pending closure와 Restart 확인.

## RT-EW02-16 Duplicate RESULT

첫 RESULT만 채택, 두 번째는 Diagnostic.

## RT-EW02-17 RESULT after Timeout

Late Reply 폐기, Export Receipt 없음.

## RT-EW02-18 Stale Generation RESULT

이전 generation Reply 폐기.

## RT-EW02-19 Wrong Worker ID

RPC Reply 폐기, Job은 identity failure 처리.

## RT-EW02-20 Wrong RPC Version

Fail-Closed.

## RT-EW02-21 Wrong Operation

Admission 거부.

## RT-EW02-22 Restart Budget Exhaustion

4번째 Restart 요구에서 Circuit Open.

## RT-EW02-23 Circuit Open Admission

새 Job 즉시 거부.

## RT-EW02-24 Runtime Dispose Empty

Job이 없을 때 Dispose clean.

## RT-EW02-25 Runtime Dispose Queued

Queued Job 전부 cancelled.

## RT-EW02-26 Runtime Dispose Active

Active Job cancel/hard stop 후 Pending 0.

## RT-EW02-27 Receipt Conservation

```text
admitted
=
result + error + cancelled + timeout + crashed + restarted
```

## RT-EW02-28 Bounded Receipt Ledger

257번째 Receipt에서 oldest 1개 retire.

## RT-EW02-29 Transfer Policy Violation

허용되지 않은 Transferable 거부.

## RT-EW02-30 Mutable Caller Buffer

Copy Snapshot 이후 Caller 수정이 Worker Input에 영향 없음.

## RT-EW02-31 WebP Shared Copy

Caller가 SAB reference를 받지 않음.

## RT-EW02-32 Worker Entry Busy

Broker를 우회한 두 번째 CALL이 Entry에서 거부됨.

## RT-EW02-33 Parent EW01 Regression

Worker URL·Artifact Identity·Epoch PASS.

## RT-EW02-34 Parent R7 Regression

Final Surface·Exact Encoder·Output SHA PASS.

## RT-EW02-35 Export Receipt on Worker Error

Success Receipt 0건, Failure Diagnostic과 Job Receipt 존재.

## RT-EW02-36 No Main-thread Fallback

Worker 실패 후 동일 포맷 Main-thread encode 호출 0건.

## RT-EW02-37 Restart Identity

Restart 전후 workerEpoch와 generation이 다름.

## RT-EW02-38 Queue Deadline During Restart

Restart 대기 중 Deadline이 지난 Job은 Timeout, 재개하지 않음.

## RT-EW02-39 Cancel Race with RESULT

RESULT와 Abort가 같은 tick에 들어와도 terminal exactly once.

판정 규칙:

```text
Broker event loop가 먼저 채택한 terminal이 권위
두 번째 terminal은 Diagnostic만 기록
```

## RT-EW02-40 Crash Race with RESULT

Crash Closure 시작 이후 RESULT 채택 금지.

---

# 33. 성능 Gate

EW02는 제어 계층을 추가하지만 불필요한 Pixel Copy를 늘려서는 안 된다.

## PERF-EW02-01 WebP

```text
Pixel full copy count <= 1
```

현재 Caller-side SAB copy를 Broker-side SAB copy로 이동할 뿐 총 복사 수를 늘리지 않는다.

## PERF-EW02-02 PNG16

Transfer Policy 사용 시:

```text
Pixel full copy count = 0
```

## PERF-EW02-03 Queue Metadata

Job당 Control Metadata 목표:

```text
< 8 KiB
```

Pixel Payload 제외.

## PERF-EW02-04 Settlement

Terminal Reply 수신 뒤 Pending Map 제거가 동일 task 안에서 수행돼야 한다.

## PERF-EW02-05 Restart

Queued Payload를 재복사하지 않는다.

Broker-owned Snapshot을 유지한다.

---

# 34. 메모리 Gate

## MEM-EW02-01 Queue Byte Budget

Job 개수뿐 아니라 Worker별 Queue Byte Budget을 둔다.

기본:

```text
maxQueuedInputBytes = 512 MiB
```

RTX GPU 메모리와 무관한 Renderer RAM 예산이다.

초과 시:

```text
E_WORKER_QUEUE_BYTE_BUDGET_EXCEEDED
```

## MEM-EW02-02 Terminal Release

Terminal Settlement 뒤 다음 참조를 제거한다.

```text
ownedPayload
transfer list
raw result bytes, Export Authority로 인계 후
AbortSignal listener
Timer closures
```

## MEM-EW02-03 Crash Release

Active Job Payload는 Crash Receipt 생성 뒤 해제한다.

Active Job 자동 Replay가 없으므로 보관하지 않는다.

---

# 35. Promotion Artifacts

필수 산출물:

```text
artifacts/runtime/TDT_EXPORT_WORKER_02_FIX_RECEIPT.json
artifacts/runtime/TDT_EXPORT_WORKER_02_JOB_RECEIPT_FIXTURES.json
artifacts/runtime/TDT_EXPORT_WORKER_02_RESTART_RECEIPT_FIXTURES.json
artifacts/runtime/TDT_EXPORT_WORKER_02_PENDING_CLOSURE_REPORT.json
artifacts/runtime/TDT_EXPORT_WORKER_02_RUNTIME_SMOKE.json
artifacts/runtime/TDT_EXPORT_WORKER_02_PROMOTION_RECEIPT.json
artifacts/runtime/TDT_EXPORT_WORKER_02_FILE_INVENTORY.sha256
```

## 35.1 Fix Receipt

포함:

```text
parentBuildId
parentSourceBakeSeal
specDigest
changedFiles
rawLeaseCallCountBefore
rawLeaseCallCountAfter
legacyPendingMapCountBefore
legacyPendingMapCountAfter
staticGateResults
```

## 35.2 Pending Closure Report

Worker별:

```text
jobsAdmitted
jobsSettled
jobsResult
jobsError
jobsCancelled
jobsTimeout
jobsCrashed
pendingAfterSmoke
queuedAfterSmoke
activeAfterSmoke
```

## 35.3 Promotion Receipt

Promotion PASS 조건:

```text
Vite production build PASS
Electron runtime smoke PASS
세 Worker real WASM encode PASS
Timeout smoke PASS
Abort smoke PASS
Crash restart smoke PASS
Pending closure PASS
R7 regression PASS
EW01 regression PASS
```

---

# 36. 승격 판정

## 36.1 SOURCE_BAKED_UNPROMOTED

다음만 수행됐을 때:

```text
코드 적용
정적 Gate
TypeScript Closure
Unit-level Broker Fixture
Receipt 생성
```

실제 Worker/WASM Runtime Smoke가 없으면 Promotion PASS를 발급하지 않는다.

## 36.2 PROMOTION_PASS

다음이 모두 필요하다.

```text
Worker real bundle emitted
Worker artifact SHA verified
WebP real encode
PNG16 real encode
PSD real worker export
Abort active job
Execution timeout hard restart
Crash active job
Queued resume
Runtime dispose pending 0
```

---

# 37. Rollback

Rollback 단위:

```text
EW02 전체
```

부분 Rollback 금지:

```text
Broker는 RPC v1
Legacy WebP는 Raw Lease
Legacy PNG16은 RPC v1
PSD는 old pending Map
```

이 혼합 상태는 Job ID·Pending SSOT를 다시 분열시킨다.

Rollback 시 복원 대상:

```text
EW01 Broker API
EW01 Legacy Lease calls
EW01 Worker Entry Data Plane
EW01 Receipt schema
```

단, R7과 EW01 봉인은 유지한다.

---

# 38. 구현 순서

## Phase A. Type and Error Contract

```text
RPC Envelope Types
Job State Types
Timeout Policy
Input Ownership Policy
Stable Error Registry
Receipt Types
```

## Phase B. Broker Job Core

```text
Job ID SSOT
Admission
Queue
Pending Map
settleJob()
Queue Pump
```

## Phase C. RPC Worker Entry

```text
CALL
ACCEPTED
RESULT
ERROR
CANCEL
CANCELLED
Active Job Slot
AbortController
```

## Phase D. Failure Control

```text
Timeout
Abort
messageerror
Crash Closure
Restart
Budget
Circuit Open
```

## Phase E. Legacy Migration

```text
WebP call()
PNG16 call()
PSD call()
Raw Lease removal
Pending Map removal
```

## Phase F. Receipt Binding

```text
Job Receipt
Generation Receipt
Broker Receipt v2
Export Receipt binding
```

## Phase G. Gates

```text
Static Gates
Unit Fixtures
Runtime Worker Smoke
Electron Smoke
Promotion Receipt
```

---

# 39. 파일 계획

신규 또는 주요 수정 대상:

```text
app/src/runtime/workers/encoder-worker-types.ts
app/src/runtime/workers/encoder-worker-broker-service.ts
app/src/runtime/workers/worker-entry-runtime.ts
app/src/runtime/workers/worker-job-ledger.ts
app/src/runtime/workers/worker-input-ownership.ts
app/src/runtime/workers/worker-restart-policy.ts
app/src/runtime/workers/worker-rpc-envelope.ts
app/src/runtime/workers/generated-worker-manifest.ts
app/src/runtime/export/export-authority-service.ts
app/src/env.d.ts

app/src/runtime/workers/entries/webp-lossless.worker.ts
app/src/runtime/workers/entries/png16.worker.ts
app/src/runtime/workers/entries/psd-export.worker.ts

app/legacy-runtime/export_manager.js
app/legacy-runtime/libs/psd/psd_export_bridge.js

app/src/boot/stable-error.ts
app/src/boot/stable-error-registry.ts
```

테스트:

```text
tools/verify_export_worker_02_static.mjs
tools/verify_export_worker_02_rpc_fixture.mjs
tools/verify_export_worker_02_timeout_cancel_fixture.mjs
tools/verify_export_worker_02_restart_fixture.mjs
tools/verify_export_worker_02_pending_closure.mjs
```

---

# 40. 완료 정의

EW02는 다음 문장이 모두 참일 때 완료다.

```text
Worker Job ID를 Legacy가 만들지 않는다.
Pending Map을 Legacy가 소유하지 않는다.
Raw Worker Lease가 제품 API에 없다.
모든 Job은 Broker Queue를 통한다.
Worker당 Active Job은 최대 1개다.
모든 Job은 Timeout을 가진다.
모든 Job은 AbortSignal을 받을 수 있다.
Queued Cancel은 Worker를 건드리지 않는다.
Active Cancel은 cooperative 후 hard restart로 폐쇄된다.
Worker Crash는 Active Job을 자동 Replay하지 않는다.
Queued Job은 Restart 뒤 FIFO를 유지한다.
모든 Job은 정확히 한 번 종료된다.
Late Reply는 Export Result가 될 수 없다.
Runtime Dispose 뒤 Pending Job은 0개다.
Worker-backed Export Receipt는 Job Receipt를 가진다.
R7 Exact Format과 Final Surface Truth가 유지된다.
EW01 URL·Epoch·Artifact Identity가 유지된다.
```

---

# 41. 최종 봉인 문장

> **`TDT-EXPORT-WORKER-02` 이후 Worker는 단순히 Runtime이 생성한 실행 객체가 아니라, Runtime이 Job의 탄생부터 종료까지 전 과정을 소유하는 권위 실행 단위가 된다. Legacy ExportManager는 더 이상 Worker Message·Job ID·Pending Promise를 관리하지 않으며, 모든 Worker-backed Export는 Broker Job Receipt 없이는 성공으로 인정되지 않는다.**

---

# Appendix A. Canonical Call 예시

```ts
const controller = new AbortController();

const response = await window.DadumRuntimeWorkerBridge.call({
  workerId: 'dadum.worker.encoder.png16-v1',
  runtimeEncoderId: 'dadum.encoder.png16.v1',
  codecProtocolVersion: 'dadum-png16-worker-v1',
  operation: 'encode.png16',
  payload: {
    rgba16,
    width,
    height,
  },
  transfer: [rgba16.buffer],
  timeoutMs: 120_000,
  queueTimeoutMs: 30_000,
  cancelGraceMs: 1_500,
  signal: controller.signal,
  exportJobId,
  finalRevision,
  inputOwnershipPolicyId: 'broker-transfer-snapshot-v1',
});
```

---

# Appendix B. Canonical Receipt Conservation

```text
jobsAdmitted
=
jobsResult
+ jobsError
+ jobsCancelled
+ jobsTimeout
+ jobsCrashed
+ jobsRestarted
```

`jobsRestarted`는 Queued Job이 아니라 Restart 자체로 종료된 Job에만 사용한다.

EW02 기본 정책에서는 Active Job 자동 Replay가 없으므로 일반적으로:

```text
jobsRestarted = 0
```

이다.

---

# Appendix C. SSOT 표

| 대상 | SSOT |
|---|---|
| Worker URL | Generated Worker Manifest |
| Worker Instance | WorkerRegistryService |
| Worker Generation | EncoderWorkerBrokerService |
| Job ID | EncoderWorkerBrokerService |
| Pending Map | EncoderWorkerBrokerService |
| Queue | EncoderWorkerBrokerService |
| Timeout | Descriptor Policy + Broker |
| Abort/Cancel | Broker + Worker Entry AbortController |
| Crash Restart | EncoderWorkerBrokerService |
| Input Ownership | Broker Admission Layer |
| Job Receipt | Worker Job Ledger |
| Export Success | ExportAuthorityService |

---

# Appendix D. 금지 패턴

```js
let jobId = 0;
const pending = new Map();
worker.onmessage = ...;
lease.addEventListener('message', ...);
lease.postMessage(...);
new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
```

EW02 승격 뒤 활성 Export 경로에서 위 패턴은 0건이어야 한다.
