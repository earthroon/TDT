# TDT-RESAMPLE-RUNTIME-01-R9A

## Production Validation Counter Sampling /
## Single-Submit Multi-Stage Command Graph /
## Uniform Ring Allocation /
## Queue Fence Retirement /
## Physical GPU Performance Closure Seal

> 상태: 명세 rev.1
>
> 직접 부모: `TDT-RESAMPLE-RUNTIME-01-R8A`
>
> 적용 기준 트리: `61_TDT_RESAMPLE_RUNTIME_01_R8A_ACTIVE_RUNTIME_TRUTH_CLOSURE_BAKED_AWAITING_R9A.zip`
>
> 부모 상태:
>
> ```text
> RESAMPLE_RUNTIME_R8A_ACTIVE_RUNTIME_TRUTH_CLOSURE_SEALED_AWAITING_R9A_PHYSICAL_GPU
> 253 SOURCE PASS
> 8 PHYSICAL DEFERRED
> 0 FAIL
> ```
>
> 이 문서의 라벨:
>
> - `확정` — 부모 코드에서 직접 확인된 현재 구조
> - `요구` — R9A에서 새로 구현해야 하는 계약
> - `금지` — 발견 시 즉시 실패하는 경로
> - `물리` — Windows x64 packaged Electron과 hardware D3D12 WebGPU에서만 확정 가능

---

# 0. 목표

R9A는 R8A에서 진실화된 canonical EWA 실행을 **한 개의 GPU command graph와 한 번의 queue submit**으로 묶고, 제품 경로에서 validation counter를 결정론적으로 샘플링하며, stage마다 발생하던 CPU queue fence와 단일 mutable uniform buffer 직렬화를 제거한다.

R9A는 다음 다섯 문제를 동시에 닫는다.

1. 정상 product dispatch가 validation counter를 읽지 않아 GPU fault가 사용자 작업 중 침묵할 수 있는 문제
2. source preparation, tensor, adaptive policy, EWA stage, residual, finalization이 각각 encoder와 submit을 생성하는 문제
3. 각 stage가 `queue.onSubmittedWorkDone()`을 기다려 CPU가 GPU command dependency를 대신 직렬화하는 문제
4. pipeline bundle마다 하나의 mutable uniform buffer를 공유해 in-flight 작업을 허용하지 못하는 문제
5. R9 물리 하네스가 baseline parity는 갖췄지만 실제 product graph의 submit·fence·counter sampling·성능 폐쇄를 증명하지 못한 문제

최종 원칙:

```text
GPU command ordering
≠ CPU stage fence

validation observation
≠ duplicate product dispatch

uniform reuse
≠ completion 이전 overwrite

source PASS
≠ physical performance PASS
```

---

# 1. 부모 트리에서 직접 확인된 현재 상태

## 1.1 stage별 제출과 fence

`확정` 부모 트리에는 다음 경계가 각각 독립 encoder·submit·completion wait를 가진다.

```text
ewa_source_prepare_runtime_r8.mjs
→ createCommandEncoder
→ queue.submit
→ onSubmittedWorkDone

structure_tensor_runtime.mjs
→ createCommandEncoder
→ queue.submit
→ onSubmittedWorkDone

ewa_aniso_tile.mjs
→ createCommandEncoder
→ queue.submit
→ onSubmittedWorkDone

adaptive_policy_r1d_runtime.mjs
→ createCommandEncoder
→ queue.submit
→ onSubmittedWorkDone

export_residual_runtime_r8.mjs
→ createCommandEncoder
→ queue.submit
→ onSubmittedWorkDone

export_finalize_runtime_r8.mjs
→ createCommandEncoder
→ copyTextureToBuffer
→ queue.submit
→ onSubmittedWorkDone
→ mapAsync
```

다단계 downscale가 `N`개 stage를 가질 때 실제 제출 수는 대략 다음과 같이 증가한다.

```text
source prepare                  1
각 stage tensor               N
각 stage adaptive policy      0 또는 N
각 stage EWA                  N
terminal residual             0 또는 1
finalization + readback       1
```

R9A는 이를 canonical job당 한 encoder와 한 submit으로 수렴시킨다.

## 1.2 현재 validation shader의 위치

`확정` R8 product bundle에는 다음 shader가 함께 존재한다.

```text
ewa_aniso_tile_r4_r8.wgsl
ewa_aniso_tile_r6_r8.wgsl
ewa_aniso_tile_validation_r4_r8.wgsl
ewa_aniso_tile_validation_r6_r8.wgsl
```

하지만 정상 `dispatchEWAAniso()`는 product R4/R6 pipeline을 선택하며 validation buffer를 바인딩하지 않는다. 기존 R9 packaged physical harness는 validation pipeline을 별도 fixture dispatch로 실행한다.

R9A는 validation shader를 test-only 복제 경로로만 남기지 않는다. 결정론적으로 선택된 product job에서 validation variant가 해당 stage의 product pipeline 자리를 대체한다.

```text
unsampled stage
→ product pipeline 1회

sampled stage
→ validation pipeline 1회
→ output texture는 그대로 canonical product output
→ counter side channel만 추가
```

중복 product+validation dispatch는 금지한다.

## 1.3 현재 uniform ownership

`확정` EWA bundle과 여러 stage runtime은 pipeline state에 단일 uniform buffer를 보유하고 `queue.writeBuffer()`로 매 작업 덮어쓴다. 이를 보호하기 위해 promise serial과 stage fence가 사용된다.

R9A는 단일 mutable uniform을 제거하고 device-epoch scoped uniform ring을 도입한다.

## 1.4 R8A 계보

`확정` R8A는 R9~R13의 기존 receipt를 `SUPERSEDED_BY_R8A`로 분리했다. R9A는 예전 R9 physical receipt를 재사용할 수 없다.

```text
R8A source seal
→ R9A source seal
→ R9A physical GPU seal
→ R10A release replay
→ R11 installed replay
→ R12 update replay
→ R13 fleet replay
```

---

# 2. 권위와 비권위

## 2.1 R9A가 소유하는 권위

```text
tdt.ewa.command-graph.r9a.v1
tdt.ewa.uniform-ring.r9a.v1
tdt.ewa.validation-sampling-policy.r9a.v1
tdt.ewa.submission-fence-registry.r9a.v1
tdt.ewa.performance-qualification.r9a.v1
```

## 2.2 계속 부모가 소유하는 권위

- EWA kernel math: R6/R8 generated WGSL
- source lattice와 border: R4/R8
- axial tensor semantics: R5
- parameter ABI: R6 96-byte ABI v4
- stage geometry와 support: R8 planner v3
- actual kernel identity propagation: R8A
- GPUDevice와 device epoch: GPU Device SSOT
- texture ownership: Surface Registry
- Export fallback policy: R8A

## 2.3 R9A 비권위

R9A는 다음을 수행하지 않는다.

- 필터 수식 변경
- stage plan 변경
- Production Pointer 변경
- local activation pointer 변경
- R11 token 발급
- R12 package activation
- R13 fleet lease 발급

---

# 3. Canonical Single-Submit Command Graph

## 3.1 graph interface

```ts
interface CanonicalEwaCommandGraphR9A {
  readonly schemaId: 'tdt.ewa.command-graph.r9a.v1'
  readonly graphId: string
  readonly jobId: string
  readonly runtimeEpoch: number
  readonly deviceEpoch: number
  readonly deviceIdentity: string
  readonly encoder: GPUCommandEncoder
  readonly uniformArenaLease: UniformArenaLeaseR9A
  readonly validationLease: ValidationCounterLeaseR9A | null
  readonly timestampLease: TimestampQueryLeaseR9A | null
  readonly passes: readonly CommandGraphPassR9A[]
  readonly state: 'RECORDING' | 'SEALED' | 'SUBMITTED' | 'COMPLETED' | 'FAILED' | 'LOST'
}
```

```ts
interface CommandGraphPassR9A {
  passIndex: number
  passKind:
    | 'source-prepare'
    | 'tensor-gradient'
    | 'tensor-blur-h'
    | 'tensor-blur-v'
    | 'tensor-eigen-axial'
    | 'adaptive-policy'
    | 'ewa-product'
    | 'ewa-validation'
    | 'residual'
    | 'finalization'
    | 'validation-copy'
    | 'timestamp-resolve'
    | 'terminal-readback-copy'
  stageIndex: number | null
  pipelineIdentity: string
  inputResourceIds: readonly string[]
  outputResourceIds: readonly string[]
  uniformSlotId: string | null
  validationSampled: boolean
}
```

## 3.2 recording order

```text
source upload queue write
→ command encoder 생성
→ source preparation
→ stage 0 tensor
→ stage 0 adaptive policy optional
→ stage 0 EWA product 또는 validation
→ stage 1 tensor
→ ...
→ terminal residual optional
→ finalization optional
→ validation counter copy optional
→ timestamp resolve optional
→ Export terminal readback copy optional
→ encoder.finish
→ queue.submit exactly once
```

같은 queue와 같은 command buffer의 pass order가 texture dependency를 보장한다. CPU는 stage 사이에서 기다리지 않는다.

## 3.3 Preview completion semantics

Preview는 terminal GPUTexture를 Surface Registry로 넘기고 기본적으로 queue completion을 기다리지 않는다.

```ts
interface PreviewGraphResultR9A {
  surfaceId: string
  terminalTexture: GPUTexture
  completionTicket: SubmissionTicketR9A
  graphReceipt: CommandGraphReceiptR9A
  validationObservation: Promise<ValidationObservationR9A> | null
}
```

같은 device queue의 downstream presenter는 submission order로 texture를 소비한다.

## 3.4 Export completion semantics

Export는 finalization과 `copyTextureToBuffer`를 동일 command buffer에 기록한다. submit 뒤 `GPUBuffer.mapAsync()`가 terminal synchronization이다.

`금지`:

```text
queue.submit
→ onSubmittedWorkDone
→ mapAsync
```

`요구`:

```text
queue.submit
→ mapAsync
```

---

# 4. Encoder-aware Stage API

각 stage runtime은 record 함수와 standalone compatibility wrapper를 분리한다.

```ts
recordCanonicalSourcePrepareR9A(context, request): RecordedStageR9A
recordStageLocalTensorR9A(context, request): RecordedTensorStageR9A
recordAdaptivePolicyR9A(context, request): RecordedStageR9A
recordEwaProductR9A(context, request): RecordedEwaStageR9A
recordExportResidualR9A(context, request): RecordedStageR9A
recordExportFinalizationR9A(context, request): RecordedFinalizationR9A
```

record 함수는 다음을 해서는 안 된다.

- encoder 생성
- `queue.submit()`
- `queue.onSubmittedWorkDone()`
- `mapAsync()`
- in-flight resource 파괴
- completed=true receipt 생성

Standalone wrapper는 record 함수로 graph 하나를 만든 뒤 submit 1회만 수행한다.

---

# 5. Uniform Ring Allocation

## 5.1 arena

```ts
interface UniformArenaR9A {
  schemaId: 'tdt.ewa.uniform-ring.r9a.v1'
  arenaId: string
  runtimeEpoch: number
  deviceEpoch: number
  deviceIdentity: string
  buffer: GPUBuffer
  byteCapacity: number
  slotStride: number
  slotCount: number
  generation: number
}
```

`slotStride`:

```text
alignUp(
  max(96, tensorParamBytes, residualParamBytes, finalizationParamBytes),
  device.limits.minUniformBufferOffsetAlignment
)
```

작은 ABI를 동일 slot에 무조건 덮어쓰지 않는다. pass별 payload length와 digest를 receipt에 남긴다.

## 5.2 reclamation

```text
slot acquire
→ queue.writeBuffer(slot offset)
→ graph record
→ submit serial 귀속
→ submission completion
→ slot reclaim
```

stage 완료 추정이나 CPU loop 진행만으로 reclaim하면 실패한다.

## 5.3 bounded overflow

Ring이 가득 찬 경우:

- Preview는 명시적 backpressure 또는 프레임 폐기 정책
- Export는 bounded wait 또는 `E_R9A_UNIFORM_RING_EXHAUSTED`
- 무제한 임시 buffer 생성 금지

---

# 6. Production Validation Counter Sampling

## 6.1 policy

```ts
interface ValidationSamplingPolicyR9A {
  schemaId: 'tdt.ewa.validation-sampling-policy.r9a.v1'
  policyId: string
  policyDigest: string
  periodicDenominator: number
  mandatoryTriggers: readonly (
    | 'FIRST_DEVICE_EPOCH_JOB'
    | 'FIRST_KERNEL_DIGEST_JOB'
    | 'FIRST_PLAN_DIGEST_JOB'
    | 'POST_DEVICE_LOSS'
    | 'POST_PIPELINE_REBUILD'
    | 'EXPLICIT_STRICT_EXPORT'
  )[]
}
```

## 6.2 deterministic decision

```text
sample = mandatoryTrigger
  OR H(buildId || deviceIdentity || kernelDigest || planDigest || jobSequence)
     mod periodicDenominator == 0
```

사용자 파일명, 경로, 픽셀 hash, 현재 시각, 난수는 입력에 넣지 않는다.

## 6.3 Preview observation

Preview sampled job은 counter copy를 같은 graph에 기록하되 UI frame을 기다리지 않는다.

```text
frame surface publication
→ asynchronous counter map
→ zero면 receipt close
→ nonzero면 admission revoke + fault receipt + 다음 작업 차단
```

이미 표시된 sampled Preview frame의 사후 fault는 telemetry로 숨기지 않는다. Surface Registry에 invalidation reason을 기록한다.

## 6.4 Export strict observation

다음 경우 Export는 counter 결과 확인 전 저장하지 않는다.

- explicit strict Export
- device-loss 직후 첫 Export
- 새 kernel·plan digest 첫 Export
- release qualification run

Counter가 하나라도 nonzero면 output bytes를 폐기하고 저장을 금지한다.

---

# 7. Submission Fence Registry

```ts
interface SubmissionTicketR9A {
  schemaId: 'tdt.ewa.submission-ticket.r9a.v1'
  submissionSerial: number
  runtimeEpoch: number
  deviceEpoch: number
  graphId: string
  state: 'SUBMITTED' | 'COMPLETED' | 'FAILED' | 'LOST'
  completion: Promise<SubmissionCompletionR9A>
}
```

한 submit에 completion promise 하나만 만든다. 모든 transient resource와 uniform slot이 이 ticket을 공유한다.

Preview 호출자는 기본적으로 completion을 await하지 않는다. CPU 결과가 필요한 caller만 명시적으로 await한다.

Device loss 시 현재 epoch의 모든 pending ticket은 `LOST`로 끝난다. 이전 epoch completion callback이 새 epoch arena를 reclaim하면 실패한다.

---

# 8. Timestamp와 Performance Measurement

## 8.1 GPU timestamp

- `timestamp-query` 필수
- 각 논리 구간 begin/end timestamp
- 전체 graph begin/end timestamp
- resolve와 copy는 같은 submit
- raw tick 보존
- CPU wall clock으로 GPU 시간을 대체하지 않음

논리 구간:

```text
source prepare
tensor total
adaptive policy total
EWA stage total
residual
finalization
graph total
```

## 8.2 비교 baseline

R8A stage-submit baseline은 packaged test partition에만 보존한다. Active product graph로 선택할 수 없다.

같은 package bytes, 같은 device, 같은 fixture, 같은 parameter identity에서 AB/BA 순서로 비교한다.

## 8.3 성능 문턱

```text
one-stage R4/R6 median candidate <= 1.05 × baseline
2-stage median               <= 0.90 × baseline
3+ stage R4 median           <= 0.80 × baseline
3+ stage R6 median           <= 0.85 × baseline
multi-stage p95              <= 0.95 × baseline
CPU encode+submit median     <= 0.60 × baseline
unsampled validation overhead <= 3%
sampled validation overhead   <= 15%
```

정확성 PASS 이전 성능 결과는 무효다.

---

# 9. Physical Fixture Matrix

필수 축:

```text
profile       R4 / R6
stageCount    1 / 2 / 3+
consumer      Preview / Export
sampling      unsampled / periodic / mandatory / strict
policy        neutral / adaptive
border        interior / edge / corner / 1x1 / 1xN / Nx1
alpha         opaque / straight edge / premultiplied / transparent hidden RGB
loss state    baseline / post-loss-1 / post-loss-2 / post-loss-3
```

모든 matrix cell을 무작정 Cartesian product로 실행할 필요는 없지만, pairwise coverage와 zero-tolerance correctness fixture는 전부 포함해야 한다.

---

# 10. Device-Loss Recovery

```text
pending graph submit
→ device loss
→ submission ticket LOST
→ uniform/counter/timestamp arena invalidate
→ graph cache dispose
→ stale completion 차단
→ 새 device epoch
→ 새 arena·pipeline·graph authority
→ 첫 job mandatory validation sample
→ parity + counter + residency 재검증
```

3회 연속 loss를 요구한다.

---

# 11. 오류 코드

```text
E_R9A_COMMAND_GRAPH_STATE
E_R9A_COMMAND_GRAPH_DOUBLE_SUBMIT
E_R9A_PARTIAL_SUBMIT_FORBIDDEN
E_R9A_FOREIGN_ENCODER_CONTEXT
E_R9A_STAGE_LEVEL_SUBMIT_FORBIDDEN
E_R9A_STAGE_LEVEL_FENCE_FORBIDDEN
E_R9A_UNIFORM_RING_EXHAUSTED
E_R9A_UNIFORM_SLOT_MISALIGNED
E_R9A_UNIFORM_SLOT_IN_FLIGHT
E_R9A_UNIFORM_SLOT_STALE_EPOCH
E_R9A_VALIDATION_POLICY_INVALID
E_R9A_VALIDATION_DOUBLE_DISPATCH
E_R9A_VALIDATION_COUNTER_NONZERO
E_R9A_VALIDATION_COUNTER_MISSING
E_R9A_VALIDATION_INFERRED_ZERO
E_R9A_SUBMISSION_TICKET_STALE
E_R9A_SUBMISSION_LOST
E_R9A_TIMESTAMP_QUERY_REQUIRED
E_R9A_PERFORMANCE_REGRESSION
E_R9A_RESIDENCY_PLATEAU_FAILED
E_R9A_R8A_PARENT_MISMATCH
E_R9A_SUPERSEDED_RECEIPT_REUSE
E_R9A_PENDING_PHYSICAL_GATE
```

---

# 12. Source Bake 상태

```text
RESAMPLE_RUNTIME_R9A_SINGLE_SUBMIT_VALIDATION_AND_PERFORMANCE_HARNESS_SOURCE_SEALED_AWAITING_PHYSICAL_GPU

286 SOURCE PASS
214 PHYSICAL PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

productionPointerMutated      = false
localActivationPointerMutated = false
R10ThroughR13ReceiptsCurrent  = false
```

# 13. Final Physical 상태

```text
RESAMPLE_RUNTIME_R9A_SINGLE_SUBMIT_VALIDATED_PHYSICAL_GPU_PERFORMANCE_SEALED_AWAITING_R10A

286 SOURCE PASS
214 PHYSICAL PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

canonicalJobEncoderCount = 1
canonicalJobSubmitCount  = 1
previewQueueFenceCount   = 0
exportPreMapFenceCount   = 0
validationDoubleDispatchCount = 0
uniformInFlightOverwriteCount = 0
```

---

# 14. Gate Catalog

## 14.1 Source Mandatory Gates

### PARENT_AND_LINEAGE

| Gate | Requirement |
|---|---|
| `R9A-S001` | R8A final source receipt is present and digest-verified |
| `R9A-S002` | R8A final state is exact |
| `R9A-S003` | R8A 253 source gates remain PASS |
| `R9A-S004` | R8A physical gates remain DEFERRED until R9A execution |
| `R9A-S005` | R8A Active Graph parse closure remains exact |
| `R9A-S006` | R8A canonical executor registration remains present |
| `R9A-S007` | R8A actual kernel identity bundle remains source of truth |
| `R9A-S008` | R8A repeated device-loss authority remains admitted |
| `R9A-S009` | R8A zero-silent-fallback contract remains admitted |
| `R9A-S010` | R8 mathematical kernel files remain hash-frozen |
| `R9A-S011` | R8 support planner v3 remains hash-frozen |
| `R9A-S012` | R8 generated WGSL manifest remains hash-frozen |
| `R9A-S013` | R8A downstream invalidation receipt remains byte-identical |
| `R9A-S014` | R9 through R13 historical receipts remain historical only |
| `R9A-S015` | No superseded downstream receipt is accepted as current |
| `R9A-S016` | Production Pointer mirrors remain byte-identical |
| `R9A-S017` | Local activation pointer is not created by source bake |
| `R9A-S018` | Parent package.json expansion is isolated from frozen runtime files |
| `R9A-S019` | Lineage manifest names R8A as immediate parent |
| `R9A-S020` | Next current authority is R9A only |
### AUTHORITY_AND_NON_GOALS

| Gate | Requirement |
|---|---|
| `R9A-S021` | R9A owns command recording and submission policy only |
| `R9A-S022` | R9A does not change EWA kernel math |
| `R9A-S023` | R9A does not change planner stage geometry |
| `R9A-S024` | R9A does not change alpha or transfer semantics |
| `R9A-S025` | R9A does not mutate Production Pointer |
| `R9A-S026` | R9A does not mutate local activation pointer |
| `R9A-S027` | R9A does not issue R11 runtime admission tokens |
| `R9A-S028` | R9A does not perform fleet rollout |
| `R9A-S029` | GPUDevice Authority remains single device owner |
| `R9A-S030` | Surface Registry remains texture ownership authority |
| `R9A-S031` | Validation sampling policy has one SSOT |
| `R9A-S032` | Submission fence registry has one SSOT |
| `R9A-S033` | Uniform arena has one owner per device epoch |
| `R9A-S034` | Physical promotion cannot be inferred from source PASS |
### COMMAND_GRAPH_CORE

| Gate | Requirement |
|---|---|
| `R9A-S035` | Canonical command graph schema exists |
| `R9A-S036` | Graph identity includes job and device epoch |
| `R9A-S037` | Exactly one encoder is created per canonical job |
| `R9A-S038` | Source preparation records into supplied encoder |
| `R9A-S039` | Stage tensor records into supplied encoder |
| `R9A-S040` | Adaptive policy records into supplied encoder |
| `R9A-S041` | EWA product records into supplied encoder |
| `R9A-S042` | Validation variant records into supplied encoder |
| `R9A-S043` | Residual records into supplied encoder |
| `R9A-S044` | Finalization records into supplied encoder |
| `R9A-S045` | Terminal texture copy records into supplied encoder |
| `R9A-S046` | Timestamp resolves record into supplied encoder |
| `R9A-S047` | Validation counter copy records into supplied encoder |
| `R9A-S048` | No stage helper submits when encoder is supplied |
| `R9A-S049` | No stage helper awaits queue completion when encoder is supplied |
| `R9A-S050` | Graph pass order is deterministic |
| `R9A-S051` | Graph resource dependency edges are explicit |
| `R9A-S052` | Each stage consumes previous stage texture in-order |
| `R9A-S053` | Tensor pass precedes its EWA pass |
| `R9A-S054` | Adaptive policy pass precedes its EWA pass |
| `R9A-S055` | Residual is terminal-stage-only |
| `R9A-S056` | Finalization follows selected lowpass or residual texture |
| `R9A-S057` | Export readback copy is last GPU operation |
| `R9A-S058` | Preview graph contains no readback copy |
| `R9A-S059` | Graph abort before submit destroys all unsubmitted resources |
| `R9A-S060` | Graph recording error cannot submit partial work |
| `R9A-S061` | Graph cannot be submitted twice |
| `R9A-S062` | Graph completion ticket is immutable |
| `R9A-S063` | Graph receipt contains exact pass sequence |
| `R9A-S064` | Graph receipt contains exact stage count |
| `R9A-S065` | Graph receipt contains encoder count |
| `R9A-S066` | Graph receipt contains submit count |
| `R9A-S067` | Graph receipt contains validation sample decision |
| `R9A-S068` | Graph receipt contains uniform slot identities |
| `R9A-S069` | Graph receipt contains timestamp query range |
| `R9A-S070` | Graph receipt digest is canonical |
### ENCODER_AWARE_STAGE_API

| Gate | Requirement |
|---|---|
| `R9A-S071` | prepareCanonicalSourceR9A accepts encoder context |
| `R9A-S072` | buildStageLocalTensorR9A accepts encoder context |
| `R9A-S073` | buildAdaptivePolicyFieldR9A accepts encoder context |
| `R9A-S074` | recordEwaDispatchR9A accepts encoder context |
| `R9A-S075` | recordExportResidualR9A accepts encoder context |
| `R9A-S076` | recordExportFinalizationR9A accepts encoder context |
| `R9A-S077` | Standalone compatibility wrappers remain available |
| `R9A-S078` | Standalone wrappers submit exactly once |
| `R9A-S079` | Encoder-aware helpers submit zero times |
| `R9A-S080` | Encoder-aware helpers fence zero times |
| `R9A-S081` | Recorded pass receipt is returned without claiming completion |
| `R9A-S082` | Completion fields are set only by graph finalizer |
| `R9A-S083` | Stage helper cannot destroy resources before submission completion |
| `R9A-S084` | Stage helper cannot reuse stale encoder context |
| `R9A-S085` | Stage helper verifies device identity |
| `R9A-S086` | Stage helper verifies device epoch |
| `R9A-S087` | Stage helper verifies command graph identity |
| `R9A-S088` | Stage helper rejects foreign uniform arena |
| `R9A-S089` | Stage helper rejects foreign counter arena |
| `R9A-S090` | Stage helper rejects unsupported texture semantics |
| `R9A-S091` | Legacy raw pipeline path remains outside canonical graph |
| `R9A-S092` | Canonical path cannot fall back to standalone helper |
| `R9A-S093` | API migration manifest lists every replaced call site |
| `R9A-S094` | Old stage-level submit calls are absent from active canonical path |
### UNIFORM_RING_ALLOCATION

| Gate | Requirement |
|---|---|
| `R9A-S095` | Uniform ring schema exists |
| `R9A-S096` | Uniform ring is device-epoch scoped |
| `R9A-S097` | Uniform ring stride uses minUniformBufferOffsetAlignment |
| `R9A-S098` | EWA 96-byte payload fits one aligned slot |
| `R9A-S099` | Tensor payload fits aligned typed slot |
| `R9A-S100` | Source preparation payload fits aligned typed slot |
| `R9A-S101` | Adaptive policy payload fits aligned typed slot |
| `R9A-S102` | Residual payload fits aligned typed slot |
| `R9A-S103` | Finalization payload fits aligned typed slot |
| `R9A-S104` | Slot identity includes arena generation |
| `R9A-S105` | Slot identity includes submission serial |
| `R9A-S106` | Slot identity includes job identity |
| `R9A-S107` | Slot identity includes pass identity |
| `R9A-S108` | Dynamic offsets are alignment-valid |
| `R9A-S109` | Bind group layouts admit dynamic offsets where required |
| `R9A-S110` | No shared mutable single uniform buffer remains in canonical path |
| `R9A-S111` | CPU writes never overwrite in-flight slot |
| `R9A-S112` | Ring exhaustion is fail-closed |
| `R9A-S113` | Ring exhaustion does not allocate silent unbounded buffers |
| `R9A-S114` | Overflow pool has explicit bounded policy |
| `R9A-S115` | Overflow pool use is receipted |
| `R9A-S116` | Slot reclamation occurs only after submission completion |
| `R9A-S117` | Slot reclamation is idempotent |
| `R9A-S118` | Slot release before submit aborts cleanly |
| `R9A-S119` | Device loss invalidates all slots |
| `R9A-S120` | Old epoch slot cannot bind to new device |
| `R9A-S121` | Arena disposal destroys backing buffers once |
| `R9A-S122` | Arena live-byte accounting is exact |
| `R9A-S123` | Arena high-water mark is receipted |
| `R9A-S124` | Arena capacity is configurable but bounded |
| `R9A-S125` | Preview and Export may share arena under same device authority |
| `R9A-S126` | Preview and Export cannot share a slot concurrently |
| `R9A-S127` | Per-job slot count is derivable from stage plan |
| `R9A-S128` | Ring wraparound negative control exists |
| `R9A-S129` | Misaligned dynamic offset negative control exists |
| `R9A-S130` | Premature slot reuse negative control exists |
| `R9A-S131` | Stale epoch slot negative control exists |
| `R9A-S132` | Uniform byte digest is recorded per pass |
### VALIDATION_COUNTER_SAMPLING

| Gate | Requirement |
|---|---|
| `R9A-S133` | Validation sampling policy schema exists |
| `R9A-S134` | Policy identity is canonical and digest-bound |
| `R9A-S135` | Policy includes build identity |
| `R9A-S136` | Policy includes device identity class |
| `R9A-S137` | Policy includes kernel contract digest |
| `R9A-S138` | Policy includes planner identity |
| `R9A-S139` | Policy includes sampling denominator |
| `R9A-S140` | Policy includes mandatory trigger set |
| `R9A-S141` | First canonical job per device epoch is sampled |
| `R9A-S142` | First job per kernel digest is sampled |
| `R9A-S143` | First job per plan digest is sampled |
| `R9A-S144` | First job after device loss is sampled |
| `R9A-S145` | First job after pipeline rebuild is sampled |
| `R9A-S146` | Periodic deterministic sample is supported |
| `R9A-S147` | Sampling decision is deterministic for same inputs |
| `R9A-S148` | Sampling decision uses monotonic canonical job sequence |
| `R9A-S149` | Sampling decision does not use user file name |
| `R9A-S150` | Sampling decision does not use image pixel hash |
| `R9A-S151` | Sampling decision does not use wall-clock randomness |
| `R9A-S152` | Unsampled stage uses product pipeline |
| `R9A-S153` | Sampled stage uses validation pipeline in product position |
| `R9A-S154` | Sampled stage is not dispatched twice |
| `R9A-S155` | Validation output texture is canonical product output |
| `R9A-S156` | Validation counter buffer has 32 u32 words |
| `R9A-S157` | Counter buffer is cleared before sampled graph |
| `R9A-S158` | Reserved counters must remain zero |
| `R9A-S159` | Counter copy occurs in same command graph |
| `R9A-S160` | Counter readback buffer is ring-managed |
| `R9A-S161` | Preview counter readback is asynchronous |
| `R9A-S162` | Preview counter failure revokes subsequent admission |
| `R9A-S163` | Export strict sample waits before save |
| `R9A-S164` | Export non-sampled job does not add readback |
| `R9A-S165` | Counter nonzero discards sampled Export output |
| `R9A-S166` | Counter nonzero emits structured fault receipt |
| `R9A-S167` | Counter observer is device-epoch scoped |
| `R9A-S168` | Counter observer survives multiple jobs |
| `R9A-S169` | Counter observer is re-created after device loss |
| `R9A-S170` | Counter sample rate is receipted |
| `R9A-S171` | Counter trigger reason is receipted |
| `R9A-S172` | Counter values are preserved exactly |
| `R9A-S173` | No counter value is replaced by inferred zero |
| `R9A-S174` | Validation shader identity equals generated manifest record |
### QUEUE_FENCE_RETIREMENT

| Gate | Requirement |
|---|---|
| `R9A-S175` | Canonical source preparation has no onSubmittedWorkDone |
| `R9A-S176` | Canonical tensor stage has no onSubmittedWorkDone |
| `R9A-S177` | Canonical adaptive policy stage has no onSubmittedWorkDone |
| `R9A-S178` | Canonical EWA stage has no onSubmittedWorkDone |
| `R9A-S179` | Canonical residual stage has no onSubmittedWorkDone |
| `R9A-S180` | Canonical finalization stage has no onSubmittedWorkDone |
| `R9A-S181` | Canonical multi-stage loop has no stage fence |
| `R9A-S182` | One queue submit occurs per canonical job |
| `R9A-S183` | Preview returns without CPU queue fence by default |
| `R9A-S184` | Export uses mapAsync as terminal synchronization |
| `R9A-S185` | Explicit strict validation may await counter map only |
| `R9A-S186` | No redundant onSubmittedWorkDone precedes mapAsync |
| `R9A-S187` | Submission fence registry schema exists |
| `R9A-S188` | Submission serial is monotonic per device epoch |
| `R9A-S189` | Completion promise is created once per submission |
| `R9A-S190` | Completion promise is shared by all resource owners |
| `R9A-S191` | Completion observer does not resubmit commands |
| `R9A-S192` | Completion observer releases uniform slots |
| `R9A-S193` | Completion observer releases transient resources |
| `R9A-S194` | Completion observer records GPU completion status |
| `R9A-S195` | Device loss rejects all pending completion tickets |
| `R9A-S196` | Stale completion cannot release new epoch resources |
| `R9A-S197` | Downstream same-queue consumers use texture dependency not CPU wait |
| `R9A-S198` | External CPU consumer must request explicit completion |
| `R9A-S199` | Compatibility wrapper fence use is receipted |
| `R9A-S200` | Queue fence count is measured physically |
| `R9A-S201` | Submit count is measured physically |
| `R9A-S202` | Silent fallback to stage-level fencing is forbidden |
### RESOURCE_LIFECYCLE_AND_DEVICE_LOSS

| Gate | Requirement |
|---|---|
| `R9A-S203` | Graph resource ledger schema exists |
| `R9A-S204` | Every transient texture has one owner |
| `R9A-S205` | Every transient buffer has one owner |
| `R9A-S206` | Retained terminal inputs have explicit lease |
| `R9A-S207` | Intermediate textures release after submission completion |
| `R9A-S208` | Terminal texture lifetime is caller-owned |
| `R9A-S209` | Preview surface registry transfer is explicit |
| `R9A-S210` | Export terminal readback buffer is destroyed after unmap |
| `R9A-S211` | Validation counter readback buffer is destroyed after observation |
| `R9A-S212` | Timestamp buffers are pooled or bounded |
| `R9A-S213` | No mapped buffer remains after job completion |
| `R9A-S214` | Graph abort destroys unsubmitted resources |
| `R9A-S215` | Graph submit transfers cleanup to completion registry |
| `R9A-S216` | Completion cleanup is exactly-once |
| `R9A-S217` | Device loss aborts recording graph |
| `R9A-S218` | Device loss rejects submitted graph ticket |
| `R9A-S219` | Device loss clears uniform arena |
| `R9A-S220` | Device loss clears counter arena |
| `R9A-S221` | Device loss clears timestamp arena |
| `R9A-S222` | Device loss clears pipeline graph cache |
| `R9A-S223` | Device loss preserves historical receipt only |
| `R9A-S224` | New epoch builds new arenas |
| `R9A-S225` | New epoch builds new command graph authority |
| `R9A-S226` | Three consecutive device-loss cycles remain supported |
| `R9A-S227` | Post-loss first job is mandatorily sampled |
| `R9A-S228` | Post-loss output parity is revalidated |
| `R9A-S229` | Resource live bytes return to baseline |
| `R9A-S230` | Resource cardinality returns to baseline |
| `R9A-S231` | No old epoch bind group is reused |
| `R9A-S232` | No stale graph can submit after recovery |
### RECEIPT_AND_IDENTITY

| Gate | Requirement |
|---|---|
| `R9A-S233` | R9A command graph receipt schema exists |
| `R9A-S234` | R9A submission receipt schema exists |
| `R9A-S235` | R9A uniform arena receipt schema exists |
| `R9A-S236` | R9A validation sample receipt schema exists |
| `R9A-S237` | R9A performance receipt schema exists |
| `R9A-S238` | Actual R8A kernel identity is embedded |
| `R9A-S239` | Actual generated shader digest set is embedded |
| `R9A-S240` | Actual ABI identity is embedded |
| `R9A-S241` | Actual planner identity is embedded |
| `R9A-S242` | R8A lowpass receipt digest is embedded |
| `R9A-S243` | Pass sequence digest is embedded |
| `R9A-S244` | Uniform payload digest set is embedded |
| `R9A-S245` | Validation counter digest is embedded when sampled |
| `R9A-S246` | Timestamp raw digest is embedded when measured |
| `R9A-S247` | Submission serial is embedded |
| `R9A-S248` | Device epoch is embedded |
| `R9A-S249` | Package content identity is reserved for physical receipt |
| `R9A-S250` | No source receipt claims hardware timing |
| `R9A-S251` | No source receipt claims physical counter values |
| `R9A-S252` | Source and physical states are distinct |
| `R9A-S253` | Receipt child artifact digests are canonical |
| `R9A-S254` | Receipt self-hash is verified |
### NEGATIVE_CONTROLS

| Gate | Requirement |
|---|---|
| `R9A-S255` | Stage helper standalone submit inside graph is detected |
| `R9A-S256` | Stage helper queue fence inside graph is detected |
| `R9A-S257` | Second encoder creation is detected |
| `R9A-S258` | Second queue submit is detected |
| `R9A-S259` | Uniform slot misalignment is detected |
| `R9A-S260` | Uniform slot premature reuse is detected |
| `R9A-S261` | Uniform arena unbounded growth is detected |
| `R9A-S262` | Validation job double dispatch is detected |
| `R9A-S263` | Validation counter inferred-zero substitution is detected |
| `R9A-S264` | Sample schedule randomness is detected |
| `R9A-S265` | Counter readback omission is detected |
| `R9A-S266` | Preview synchronous fence regression is detected |
| `R9A-S267` | Export pre-map queue fence regression is detected |
| `R9A-S268` | Partial graph submit after recording error is detected |
| `R9A-S269` | Stale device epoch graph submit is detected |
| `R9A-S270` | Stale completion cleanup is detected |
| `R9A-S271` | Old kernel identity propagation is detected |
| `R9A-S272` | Historical R9 receipt reuse is detected |
| `R9A-S273` | Production pointer mutation is detected |
| `R9A-S274` | CPU resample fallback is detected |
### BUILD_ACTIVE_GRAPH_AND_FINAL_STATE

| Gate | Requirement |
|---|---|
| `R9A-S275` | R9A source tools are parser-valid |
| `R9A-S276` | R9A runtime modules are parser-valid |
| `R9A-S277` | R9A TypeScript modules transpile |
| `R9A-S278` | R9A active runtime nodes are admitted |
| `R9A-S279` | R9A command graph edges are admitted |
| `R9A-S280` | R9A validation shaders remain active assets |
| `R9A-S281` | R9A test-only baseline remains quarantined |
| `R9A-S282` | Source gate catalog has 286 unique IDs |
| `R9A-S283` | Physical gate catalog has 214 unique IDs |
| `R9A-S284` | Source final state is exact |
| `R9A-S285` | Physical final state is unreachable with pending gates |
| `R9A-S286` | Next authority is R10A replay |

## 14.2 Physical Mandatory Gates

### PACKAGED_ENVIRONMENT

| Gate | Requirement |
|---|---|
| `R9A-P001` | Windows x64 packaged Electron execution |
| `R9A-P002` | Hardware D3D12 adapter admitted |
| `R9A-P003` | Software adapter rejected |
| `R9A-P004` | timestamp-query feature admitted |
| `R9A-P005` | R8A packaged module parse and import |
| `R9A-P006` | R8A canonical executor physical dispatch |
| `R9A-P007` | Same package bytes before and after run |
| `R9A-P008` | Source tree inaccessible from package |
| `R9A-P009` | Vite dev server disabled |
| `R9A-P010` | Network disabled during qualification |
| `R9A-P011` | Package content ID frozen |
| `R9A-P012` | GPU device identity frozen for run |
| `R9A-P013` | Power state recorded |
| `R9A-P014` | Display state recorded |
| `R9A-P015` | Driver identity recorded |
| `R9A-P016` | Electron version recorded |
| `R9A-P017` | Chromium version recorded |
| `R9A-P018` | Run lock is exclusive |
| `R9A-P019` | Interruption marker is present |
| `R9A-P020` | Cleanup ledger closes |
### GRAPH_CORRECTNESS_PARITY

| Gate | Requirement |
|---|---|
| `R9A-P021` | R4 one-stage product/reference raw16 exact |
| `R9A-P022` | R6 one-stage product/reference raw16 exact |
| `R9A-P023` | R4 multi-stage product/reference raw16 exact |
| `R9A-P024` | R6 multi-stage product/reference raw16 exact |
| `R9A-P025` | R4 oracle max ULP within 1 |
| `R9A-P026` | R6 oracle max ULP within 1 |
| `R9A-P027` | Fractional phase matrix exact |
| `R9A-P028` | Negative coordinate matrix exact |
| `R9A-P029` | Border corner matrix exact |
| `R9A-P030` | One-by-one fixture exact |
| `R9A-P031` | One-by-N fixture exact |
| `R9A-P032` | N-by-one fixture exact |
| `R9A-P033` | Premultiplied alpha fixture exact |
| `R9A-P034` | Transparent hidden RGB fixture exact |
| `R9A-P035` | Constant DC fixture exact |
| `R9A-P036` | Neutral policy fixture exact |
| `R9A-P037` | Adaptive policy fixture exact |
| `R9A-P038` | Residual disabled identity exact |
| `R9A-P039` | Residual alpha invariant exact |
| `R9A-P040` | Source preparation exact |
| `R9A-P041` | Single-submit output equals R8A baseline output |
| `R9A-P042` | Pass order physical observation matches receipt |
| `R9A-P043` | Stage count physical observation matches planner |
| `R9A-P044` | No intermediate CPU readback |
| `R9A-P045` | No intermediate texture-to-buffer copy |
| `R9A-P046` | Preview terminal texture semantic exact |
| `R9A-P047` | Export final byte semantic exact |
| `R9A-P048` | R4 validation variant output equals product output |
| `R9A-P049` | R6 validation variant output equals product output |
| `R9A-P050` | Validation pipeline shader digest exact |
| `R9A-P051` | Product pipeline shader digest exact |
| `R9A-P052` | Generated manifest digest exact |
| `R9A-P053` | Kernel contract identity exact |
| `R9A-P054` | Parameter ABI identity exact |
| `R9A-P055` | Planner identity exact |
| `R9A-P056` | Command graph digest exact |
| `R9A-P057` | No nonfinite output |
| `R9A-P058` | No fault sentinel output |
| `R9A-P059` | No support clipping |
| `R9A-P060` | No center fallback |
### VALIDATION_SAMPLING_PHYSICAL

| Gate | Requirement |
|---|---|
| `R9A-P061` | First job per device epoch sampled |
| `R9A-P062` | First job per kernel digest sampled |
| `R9A-P063` | First job per plan digest sampled |
| `R9A-P064` | Periodic sample schedule exact |
| `R9A-P065` | Post-device-loss first job sampled |
| `R9A-P066` | Post-pipeline-rebuild first job sampled |
| `R9A-P067` | Unsampled job uses product pipeline |
| `R9A-P068` | Sampled job uses validation pipeline |
| `R9A-P069` | Sampled job dispatch count remains one |
| `R9A-P070` | Sampled output equals unsampled output |
| `R9A-P071` | All admitted counters zero |
| `R9A-P072` | All reserved counters zero |
| `R9A-P073` | Controlled radius fault counter increments |
| `R9A-P074` | Controlled zero-weight fault counter increments |
| `R9A-P075` | Controlled nonfinite weight counter increments |
| `R9A-P076` | Controlled nonfinite accumulation counter increments |
| `R9A-P077` | Only expected counter increments per fault |
| `R9A-P078` | Counter clear precedes dispatch |
| `R9A-P079` | Counter copy follows dispatch |
| `R9A-P080` | Counter readback exact 32 words |
| `R9A-P081` | Counter observer asynchronous in Preview |
| `R9A-P082` | Preview sampled frame does not CPU-stall |
| `R9A-P083` | Export strict sample rejects nonzero counter |
| `R9A-P084` | Export strict sample saves only after zero counter |
| `R9A-P085` | Validation sample receipt exact |
| `R9A-P086` | Validation trigger reason exact |
| `R9A-P087` | Validation shader digest exact |
| `R9A-P088` | Counter buffer reuse is fence-safe |
| `R9A-P089` | Counter buffer live bytes plateau |
| `R9A-P090` | Counter readback buffer is unmapped |
| `R9A-P091` | Counter observer survives 256 jobs |
| `R9A-P092` | Counter observer recovers after loss |
| `R9A-P093` | No inferred zero counters |
| `R9A-P094` | No duplicate validation dispatch |
| `R9A-P095` | Validation overhead receipt complete |
### SUBMIT_AND_FENCE_OBSERVATION

| Gate | Requirement |
|---|---|
| `R9A-P096` | Preview one-stage encoder count equals one |
| `R9A-P097` | Preview one-stage submit count equals one |
| `R9A-P098` | Preview multi-stage encoder count equals one |
| `R9A-P099` | Preview multi-stage submit count equals one |
| `R9A-P100` | Export one-stage encoder count equals one |
| `R9A-P101` | Export one-stage submit count equals one |
| `R9A-P102` | Export multi-stage encoder count equals one |
| `R9A-P103` | Export multi-stage submit count equals one |
| `R9A-P104` | Source preparation stage submit count equals zero |
| `R9A-P105` | Tensor stage submit count equals zero |
| `R9A-P106` | Adaptive stage submit count equals zero |
| `R9A-P107` | EWA stage submit count equals zero |
| `R9A-P108` | Residual stage submit count equals zero |
| `R9A-P109` | Finalization stage submit count equals zero |
| `R9A-P110` | Preview onSubmittedWorkDone count equals zero |
| `R9A-P111` | Export pre-map onSubmittedWorkDone count equals zero |
| `R9A-P112` | Stage loop fence count equals zero |
| `R9A-P113` | Terminal Export map count equals one |
| `R9A-P114` | Preview map count equals zero |
| `R9A-P115` | Validation Preview asynchronous map count bounded |
| `R9A-P116` | Submission serial monotonic |
| `R9A-P117` | Completion ticket count equals submit count |
| `R9A-P118` | Completion ticket settles exactly once |
| `R9A-P119` | Uniform slots reclaim after completion |
| `R9A-P120` | Transient textures reclaim after completion |
| `R9A-P121` | Same-queue downstream consumer starts without CPU fence |
| `R9A-P122` | No hidden compatibility wrapper submit |
| `R9A-P123` | No hidden compatibility wrapper fence |
| `R9A-P124` | Command buffer count equals one |
| `R9A-P125` | Timestamp query resolve in same submit |
| `R9A-P126` | Validation counter copy in same submit |
| `R9A-P127` | Export terminal copy in same submit |
| `R9A-P128` | No partial submit on injected recording failure |
| `R9A-P129` | Device loss rejects pending ticket |
| `R9A-P130` | Post-loss new job uses new submission epoch |
### GPU_AND_CPU_PERFORMANCE

| Gate | Requirement |
|---|---|
| `R9A-P131` | R4 one-stage median GPU time no worse than 1.05 baseline |
| `R9A-P132` | R6 one-stage median GPU time no worse than 1.05 baseline |
| `R9A-P133` | R4 two-stage median GPU time at most 0.90 baseline |
| `R9A-P134` | R6 two-stage median GPU time at most 0.90 baseline |
| `R9A-P135` | R4 three-plus-stage median GPU time at most 0.80 baseline |
| `R9A-P136` | R6 three-plus-stage median GPU time at most 0.85 baseline |
| `R9A-P137` | R4 multi-stage p95 at most 0.95 baseline |
| `R9A-P138` | R6 multi-stage p95 at most 0.95 baseline |
| `R9A-P139` | Preview CPU encode-submit time at most 0.60 baseline |
| `R9A-P140` | Export CPU encode-submit time at most 0.60 baseline |
| `R9A-P141` | Submit count reduction matches stage count collapse |
| `R9A-P142` | Fence wait CPU time is zero for Preview |
| `R9A-P143` | Unsampled validation overhead at most 3 percent |
| `R9A-P144` | Sampled validation overhead at most 15 percent |
| `R9A-P145` | Uniform ring allocation count plateaus |
| `R9A-P146` | Bind group allocation count is bounded |
| `R9A-P147` | Command encoder allocation count equals job count |
| `R9A-P148` | No per-stage uniform buffer creation |
| `R9A-P149` | No per-stage readback buffer creation |
| `R9A-P150` | Timestamp raw ticks preserved |
| `R9A-P151` | AB/BA benchmark order balanced |
| `R9A-P152` | Warmup at least 128 iterations |
| `R9A-P153` | Measured paired samples at least 256 |
| `R9A-P154` | R4 and R6 measured separately |
| `R9A-P155` | One-stage and multi-stage measured separately |
| `R9A-P156` | Preview and Export measured separately |
| `R9A-P157` | Sampled and unsampled measured separately |
| `R9A-P158` | Median calculation is deterministic |
| `R9A-P159` | p95 calculation is deterministic |
| `R9A-P160` | Outlier rejection policy is explicit |
| `R9A-P161` | No wall-clock substitution for GPU timestamps |
| `R9A-P162` | CPU timings use monotonic high-resolution clock |
| `R9A-P163` | Thermal state is recorded |
| `R9A-P164` | Power state changes invalidate run |
| `R9A-P165` | Driver reset invalidates run |
| `R9A-P166` | Background load anomaly invalidates run |
| `R9A-P167` | Baseline and candidate use same package bytes |
| `R9A-P168` | Baseline is test-only and cannot become product |
| `R9A-P169` | Performance receipt contains raw sample digest |
| `R9A-P170` | All performance thresholds pass |
### RESIDENCY_AND_DEVICE_LOSS

| Gate | Requirement |
|---|---|
| `R9A-P171` | Uniform arena live bytes plateau |
| `R9A-P172` | Counter arena live bytes plateau |
| `R9A-P173` | Timestamp arena live bytes plateau |
| `R9A-P174` | Transient texture live bytes plateau |
| `R9A-P175` | Bind group cache cardinality plateaus |
| `R9A-P176` | Pipeline cache cardinality plateaus |
| `R9A-P177` | Last 64 iteration slope is nonpositive |
| `R9A-P178` | Renderer private memory slope acceptable |
| `R9A-P179` | GPU process memory slope acceptable |
| `R9A-P180` | No mapped buffer leak |
| `R9A-P181` | No submission ticket leak |
| `R9A-P182` | No completion callback leak |
| `R9A-P183` | No Surface Registry leak |
| `R9A-P184` | Device loss cycle one recovers |
| `R9A-P185` | Device loss cycle two recovers |
| `R9A-P186` | Device loss cycle three recovers |
| `R9A-P187` | Each loss revokes old graph tickets |
| `R9A-P188` | Each loss invalidates old uniform slots |
| `R9A-P189` | Each loss rebuilds arenas |
| `R9A-P190` | Each loss rebuilds pipelines |
| `R9A-P191` | Post-loss sampled validation passes |
| `R9A-P192` | Post-loss parity passes |
| `R9A-P193` | Post-loss residency returns to baseline |
| `R9A-P194` | Stale completion cannot corrupt new epoch |
| `R9A-P195` | Cleanup ledger closes after loss suite |
### PREVIEW_EXPORT_INTEGRATION

| Gate | Requirement |
|---|---|
| `R9A-P196` | Preview canonical broker uses R9A graph |
| `R9A-P197` | Preview Surface Registry handoff succeeds |
| `R9A-P198` | Preview returns without queue fence |
| `R9A-P199` | Preview sampled validation alert path works |
| `R9A-P200` | Export canonical path uses R9A graph |
| `R9A-P201` | Export terminal readback count equals one |
| `R9A-P202` | Export strict validation prevents bad save |
| `R9A-P203` | PNG success receipt contains R9A submission identity |
| `R9A-P204` | WebP success receipt contains R9A submission identity |
| `R9A-P205` | JXL success receipt contains R9A submission identity |
| `R9A-P206` | Zero silent fallback remains observed |
| `R9A-P207` | Actual kernel identity propagates to all export receipts |
| `R9A-P208` | Packaged Preview and Export outputs share lowpass identity |
### FINAL_PHYSICAL_SEAL

| Gate | Requirement |
|---|---|
| `R9A-P209` | All 214 physical gates PASS |
| `R9A-P210` | No physical gate PENDING |
| `R9A-P211` | No physical gate DEFERRED |
| `R9A-P212` | No physical gate SKIPPED |
| `R9A-P213` | No physical gate FAIL |
| `R9A-P214` | R9A final physical receipt self-hash valid |


---

# 15. Negative-Control Required Outcomes

| Injection | Required result |
|---|---|
| record helper가 자체 encoder 생성 | `E_R9A_FOREIGN_ENCODER_CONTEXT` 또는 source gate FAIL |
| graph 내부 stage가 `queue.submit()` 호출 | `E_R9A_STAGE_LEVEL_SUBMIT_FORBIDDEN` |
| graph 내부 stage가 `onSubmittedWorkDone()` 호출 | `E_R9A_STAGE_LEVEL_FENCE_FORBIDDEN` |
| 같은 graph 두 번 submit | `E_R9A_COMMAND_GRAPH_DOUBLE_SUBMIT` |
| in-flight uniform slot overwrite | `E_R9A_UNIFORM_SLOT_IN_FLIGHT` |
| misaligned dynamic offset | `E_R9A_UNIFORM_SLOT_MISALIGNED` |
| sampled stage product+validation 이중 실행 | `E_R9A_VALIDATION_DOUBLE_DISPATCH` |
| counter readback 누락 후 0으로 대체 | `E_R9A_VALIDATION_INFERRED_ZERO` |
| Preview sampled path에서 synchronous queue fence | source 또는 physical gate FAIL |
| Export map 전에 queue completion wait | physical gate FAIL |
| stale epoch completion이 새 arena slot reclaim | `E_R9A_SUBMISSION_TICKET_STALE` |
| R8A 이전 R9 physical receipt 재사용 | `E_R9A_SUPERSEDED_RECEIPT_REUSE` |
| 성능 threshold 미달인데 correctness만 PASS | `E_R9A_PERFORMANCE_REGRESSION` |

---

# 16. Deliverables

```text
app/legacy-runtime/core/compute/qmap_webgpu/
  ewa_command_graph_r9a.mjs
  ewa_uniform_ring_r9a.mjs
  ewa_validation_sampling_r9a.mjs
  ewa_submission_fence_registry_r9a.mjs
  ewa_performance_receipt_r9a.mjs

app/renderer/physical-r9a/
  physical-runner.mjs
  command-graph-observer.mjs
  validation-sampling-suite.mjs
  performance-suite.mjs
  residency-loss-suite.mjs

tools/resample-runtime-01-r9a/
  generate-source-artifacts.mjs
  verify-parent-lineage.mjs
  verify-command-graph.mjs
  verify-uniform-ring.mjs
  verify-validation-sampling.mjs
  verify-fence-retirement.mjs
  verify-negative-controls.mjs
  verify-physical.mjs
  finalize-source.mjs
  finalize-physical.mjs
  gate-requirements.json
```

---

# 17. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R10A

R8A·R9A Release Requalification /
Production Candidate Rebuild /
Production Pointer CAS Replay /
Rollback Drill Replay /
Downstream Receipt Lineage Restoration Seal
```
