# TDT-RESAMPLE-RUNTIME-01-R9A-P1

## Packaged Product Graph Instrumentation /
## Single Encoder·Single Submit Observation /
## Validation Counter Fault Injection /
## Uniform Ring Lifetime /
## Timestamp Performance /
## Residency Plateau /
## Device-Loss Recovery Physical Seal

> 상태: 명세 rev.1
> 기준 부모: `61_TDT_BUILD_LOCK_01_R2_EXACT_ROOT_GRAPH_SOURCE_BAKED_AWAITING_CANONICAL_WIN32_X64.zip`
> 부모 번들 SHA-256: `4b9414a4edc5aed983879eec21cd003833e917ece83b452d658a5727ef677eb7`
> 선행 필수: `TDT-BUILD-LOCK-01-R2` Win32 final admission
> 원칙: 제품 본선 직접 관측, standalone benchmark 비권위, raw evidence 재계산, historical pass carry-forward 0

---

# 0. 목표

R9A 수학·shader·single-submit 제품 경로는 이미 Preview와 Export에 결선되어 있다. 그러나 현재 packaged physical runner는 hardware D3D12 확인 뒤 `E_R9A_PACKAGED_HARNESS_REQUIRED`로 종료하며, physical verifier는 final receipt 파일 존재만 확인한다. P1은 이 공백을 닫는다.

```text
Build Lock R2 admitted win-unpacked package
→ hidden Electron qualification window
→ product Preview / Export entry surface
→ GPU Authority low-level observer
→ R9A semantic command graph observer
→ raw counter / timestamp / lifetime / epoch evidence
→ main-process raw-evidence finalizer
→ R9A-P1 physical final receipt
```

P1은 새 리샘플 알고리즘을 소유하지 않는다. R4·R5·R6·R8A의 수학 권위와 R9A product command graph는 보존하며, 그 실제 packaged execution을 관측·검증·봉인한다.

# 1. 부모와 현재 상태

## 1.1 Build Lock R2

현재 부모는 `420 SOURCE PASS / 580 WIN32 PENDING`이다. P1 source bake는 가능하지만 physical execution은 다음 final receipt 없이는 시작할 수 없다.

```text
artifacts/build-lock-01-r2/win32/TDT_BUILD_LOCK_01_R2_FINAL_ADMISSION_RECEIPT.json
productionBuildAdmitted = true
```

## 1.2 제품 코드에서 확인된 구현

- `createEwaCommandGraphR9A()`는 한 encoder와 한 submit을 구성한다.
- validation buffer는 32 u32, 128 bytes이다.
- Preview와 Export는 `executeCanonicalEwaLowpassR9A()`를 소비한다.
- Export는 finalization과 terminal readback copy를 같은 graph에 기록한다.
- uniform ring과 submission fence registry가 device 단위 authority로 존재한다.

## 1.3 직접 확인된 물리 공백

```text
physical-runner.mjs          → packaged harness placeholder
command-graph-observer.mjs   → 제품 경로 미결선
performance-suite.mjs        → 외부 입력 배열 평가
residency-loss-suite.mjs     → 외부 입력 count 평가
validation-sampling-suite    → 외부 receipt 평가
verify-physical.mjs          → final receipt 파일 존재만 확인
```

또한 현재 fence registry의 `rejectEpoch()`는 ticket state만 바꾸고 pending promise를 reject하지 않으며, 나중 completion callback이 `COMPLETE`로 덮을 수 있다. P1은 이 경로를 실제 device-loss test로 닫는다.

# 2. 권위와 비권위

## 2.1 P1 권위

- packaged qualification orchestration
- qualification-only dual-layer instrumentation
- raw event ledger
- controlled validation fault injection
- timestamp performance measurement
- resource lifetime and residency observation
- controlled device-loss recovery evidence
- physical finalizer and final receipt

## 2.2 보존 권위

- R4/R6 kernel math and generated WGSL
- R8A product/reference parity authority
- R9A command graph semantic identity
- GPU Device Authority device ownership
- Surface Registry publication ownership
- Export Authority save ownership
- Build Lock R2 package identity

## 2.3 비권위

- standalone shader benchmark
- mock WebGPU device
- dev-server run
- renderer supplied pass boolean
- input-only performance summary
- inferred zero validation counters
- OS task manager screenshot
- filename or timestamp freshness

# 3. Packaged Qualification Architecture

## 3.1 Main process coordinator

새 main-process coordinator가 run lock, challenge, window identity, interruption journal, artifact publication을 소유한다.

```ts
type PhysicalRunState = 'CREATED' | 'PRECHECK' | 'RUNNING' | 'DRAINING' | 'FINALIZING' | 'COMMITTED' | 'FAILED' | 'INTERRUPTED'

interface R9AP1RunChallenge {
  schemaVersion: 1
  receiptKind: 'r9a-p1-run-challenge'
  runId: string
  nonceHex: string
  packageContentId: string
  buildLockR2ReceiptSha256: string
  browserWindowId: number
  webContentsId: number
  rendererProcessId: number
  fixtureScheduleDigest: string
  adapterRole: 'PERFORMANCE_CANONICAL' | 'COMPATIBILITY_MINIMUM'
  expiresAt: string
}
```

## 3.2 Qualification window

- `show:false`
- packaged file URL only
- isolated partition
- arbitrary navigation denied
- user document access denied
- network denied
- normal R11A session issuance denied

## 3.3 Narrow preload capability

```ts
window.dadumPhysicalR9AP1 = {
  getChallenge(),
  beginRun(),
  publishPhaseArtifact(),
  reportProgress(),
  completeRun(),
  failRun(),
}
```

Renderer는 final receipt를 직접 쓸 수 없다.

# 4. Dual-Layer Product Graph Instrumentation

## 4.1 Low-level GPU Authority observer

GPU Device Authority 내부에 qualification-only observer를 둔다. observer는 raw device/queue 호출을 관찰하지만 인자를 바꾸거나 submit을 추가하지 않는다.

필수 event kind:

```text
device-create-command-encoder
encoder-begin-compute-pass
encoder-finish
queue-submit
queue-on-submitted-work-done
buffer-create / buffer-map / buffer-unmap / buffer-destroy
texture-create / texture-destroy
query-set-create / query-resolve / query-set-destroy
device-lost
```

## 4.2 R9A semantic observer

Command graph가 다음 semantic event를 같은 run/job ledger에 기록한다.

```text
source-prepare
tensor-gradient / outer / blur-h / blur-v / eigen / axial
adaptive-policy
ewa-stage[i]
residual
finalization
validation-clear / validation-copy
timestamp-resolve
terminal-readback-copy
```

Low-level count와 semantic plan이 서로 맞지 않으면 physical FAIL이다.

# 5. Actual Product Entry

Preview는 active product caller를 통해 `runDeltaKStack()`에 진입한다. Export는 `DadumRuntimeExport.exportFinal()` 또는 `ExportAuthorityService`를 통해 진입한다. Harness가 `createEwaCommandGraphR9A()`나 private downscale function을 직접 import하면 E2E 증거가 아니다.

Fixture injection은 qualification-only service가 수행하며 user content를 사용하지 않는다.

# 6. Single Encoder·Single Submit Observation

각 semantic job에 대해 다음이 raw ledger에서 재계산되어야 한다.

```text
commandEncoderCount = 1
commandBufferCount  = 1
queueSubmitCount    = 1
stageQueueFenceCount = 0
previewMapCount = 0
exportTerminalMapCount = 1
exportPreMapFenceCount = 0
```

Graph receipt의 count 필드를 그대로 믿지 않는다.

# 7. Validation Counter Fault Injection

정상 sampled job은 모든 counter가 0이어야 한다. Controlled fault suite는 main challenge에만 존재하는 qualification mode를 사용한다.

필수 fault:

```text
radius-undercoverage
zero-total-weight
nonfinite-weight
nonfinite-accumulation
```

각 fault는 R4와 R6에서 예상 counter 하나만 증가해야 하며 결과 texture와 bytes는 publish/save 금지다.

# 8. Uniform Ring and Submission Lifetime

Uniform slot state는 `FREE → RECORDED → IN_FLIGHT → FREE`만 허용한다. 각 slot은 deviceEpoch, submissionSerial, jobId, passId에 귀속된다.

Device loss 시 old epoch slot과 ticket은 모두 LOST/invalid가 되며, stale completion이 새 arena를 reclaim할 수 없다. `rejectEpoch()`는 실제 promise rejection을 수행해야 한다.

# 9. Timestamp Performance

Primary adapter에서는 `timestamp-query`가 mandatory다. 각 compute pass descriptor의 beginning/end timestamp와 graph total을 기록하며 resolve·copy는 동일 command encoder에 들어간다.

성능 문턱은 기존 R9A를 유지한다.

```text
one-stage R4/R6 median candidate <= 1.05 × baseline
2-stage median                    <= 0.90 × baseline
3+ stage R4 median                <= 0.80 × baseline
3+ stage R6 median                <= 0.85 × baseline
multi-stage p95                   <= 0.95 × baseline
CPU encode+submit median          <= 0.60 × baseline
unsampled validation overhead     <= 3%
sampled validation overhead       <= 15%
```

Warmup 128, paired samples 256, ABBA order를 요구한다. baseline은 qualification partition 전용이며 Active Graph product로 선택될 수 없다.

# 10. Residency Plateau

Resource ledger와 main-process memory samples를 함께 사용한다.

```text
uniform / counter / timestamp arena bytes
transient texture bytes
readback bytes
bind group / pipeline cache cardinality
mapped buffer count
submission ticket / callback count
Surface Registry pin count
renderer private memory
GPU process memory
```

최소 1024 measured jobs 후 마지막 64 sample slope와 exact open-resource count를 계산한다. GC는 GPU resource release 증거가 아니다.

# 11. Device-Loss Recovery

Primary adapter에서 controlled loss 3회를 순차 실행한다.

```text
pending product graph
→ controlled device loss
→ pending ticket reject
→ old uniform/counter/timestamp arena invalidate
→ old pipeline cache dispose
→ GPU Authority reacquire
→ new device epoch
→ first job mandatory validation
→ parity / counter / residency revalidation
```

Preview pending graph와 Export pending graph를 각각 포함한다.

# 12. Adapter Matrix

## 12.1 Performance Canonical

- RTX 3080 10GB class 또는 선배가 명시 승인한 동급 replacement
- D3D12 hardware adapter
- timestamp-query mandatory
- 모든 correctness, performance, residency, 3-loss gate mandatory

## 12.2 Minimum Compatibility

- GTX 950M class 또는 명시 승인 equivalent
- D3D12 hardware adapter
- correctness, single-submit, validation, bounded residency, loss recovery mandatory
- timestamp-query 미지원 시 `UNSUPPORTED`로 기록하며 CPU 시간으로 대체하지 않음
- compatibility 실패 시 “950M minimum support” claim을 철회해야 함

# 13. Fixture Matrix

```text
consumer    Preview / Export
profile     R4 / R6
stageCount  1 / 2 / 3+
sampling    unsampled / first / periodic / strict / post-loss
policy      neutral / adaptive
border      interior / edge / corner / 1x1 / 1xN / Nx1
alpha       opaque / straight edge / premultiplied / hidden RGB
format      Preview surface / PNG / WebP / JXL / PNG16 / PSD
loss        baseline / post-loss-1 / post-loss-2 / post-loss-3
```

# 14. Evidence and Finalizer

필수 child artifacts:

```text
PACKAGED_ENVIRONMENT_RECEIPT
PRIMARY_ADAPTER_RECEIPT
PRODUCT_GRAPH_EVENT_LEDGER
PREVIEW_E2E_RECEIPT
EXPORT_E2E_RECEIPT
VALIDATION_COUNTER_RAW_MANIFEST
VALIDATION_FAULT_RECEIPT
UNIFORM_RING_LIFETIME_RECEIPT
SUBMISSION_TICKET_LIFETIME_RECEIPT
TIMESTAMP_RAW_SAMPLE_MANIFEST
PERFORMANCE_RECEIPT
RESIDENCY_RAW_SAMPLE_MANIFEST
RESIDENCY_RECEIPT
DEVICE_LOSS_EPOCH_LEDGER
DEVICE_LOSS_RECEIPT
MINIMUM_ADAPTER_RECEIPT
```

Finalizer는 raw artifacts에서 count, counter, median, p95, slope, epoch chain을 재계산한다. `pass:true`, `leakCount:0`, `encoderCount:1` 같은 외부 요약 필드만으로 final receipt를 만들 수 없다.

# 15. Stable Error Codes

```text
E_R9AP1_BUILD_LOCK_R2_FINAL_MISSING
E_R9AP1_BUILD_IDENTITY_MISMATCH
E_R9AP1_PACKAGED_HARNESS_REQUIRED
E_R9AP1_RUN_LOCKED
E_R9AP1_CHALLENGE_INVALID
E_R9AP1_SENDER_MISMATCH
E_R9AP1_DEV_SERVER_FORBIDDEN
E_R9AP1_SOFTWARE_ADAPTER
E_R9AP1_TIMESTAMP_QUERY_REQUIRED
E_R9AP1_PRODUCT_ENTRY_BYPASS
E_R9AP1_EVENT_LEDGER_GAP
E_R9AP1_HIDDEN_SUBMIT
E_R9AP1_ENCODER_COUNT
E_R9AP1_SUBMIT_COUNT
E_R9AP1_STAGE_FENCE
E_R9AP1_PREMAP_FENCE
E_R9AP1_VALIDATION_COUNTER_NONZERO
E_R9AP1_CONTROLLED_FAULT_MISSING
E_R9AP1_CONTROLLED_FAULT_CROSSTALK
E_R9AP1_UNIFORM_OVERWRITE
E_R9AP1_TICKET_NOT_SETTLED
E_R9AP1_STALE_COMPLETION
E_R9AP1_PERFORMANCE_REGRESSION
E_R9AP1_RESIDENCY_PLATEAU
E_R9AP1_DEVICE_LOSS_RECOVERY
E_R9AP1_SUMMARY_ONLY_EVIDENCE
E_R9AP1_CHILD_RECEIPT_MISSING
E_R9AP1_FINAL_RECEIPT_INVALID
```

# 16. Required Implementation Surface

```text
app/electron/resample-runtime-r9a-p1/
  physical-run-coordinator.mjs
  run-lock.mjs
  challenge-authority.mjs
  artifact-publisher.mjs
  process-memory-sampler.mjs
  ipc-contract.mjs

app/renderer/physical-r9a-p1/
  packaged-product-runner.mjs
  fixture-scheduler.mjs
  preview-product-driver.mjs
  export-product-driver.mjs
  validation-fault-driver.mjs
  timestamp-performance-driver.mjs
  residency-driver.mjs
  device-loss-driver.mjs

app/src/runtime/gpu/
  gpu-device-qualification-observer.ts

app/legacy-runtime/core/compute/qmap_webgpu/
  ewa_command_graph_r9a.mjs
  ewa_uniform_ring_r9a.mjs
  ewa_submission_fence_registry_r9a.mjs
  ewa_validation_sampling_r9a.mjs
  ewa_physical_observation_r9a_p1.mjs

tools/resample-runtime-01-r9a-p1/
  run-source.mjs
  run-physical.mjs
  verify-source.mjs
  verify-physical.mjs
  finalize-source.mjs
  finalize-physical.mjs
  verify-negative-controls.mjs
  schemas/*
  fixtures/*
```

필수 수정: `electron.mjs`, `preload.cjs`, `package.json`, Active Graph generator, runtime asset manifest, Build Lock R2 downstream admission wiring.

# 17. Source Bake State

```text
RESAMPLE_RUNTIME_R9A_P1_PACKAGED_PRODUCT_GRAPH_INSTRUMENTATION_SOURCE_SEALED_AWAITING_BUILD_LOCK_R2_WIN32_AND_PHYSICAL_GPU

360 SOURCE PASS
480 PHYSICAL PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

buildLockR2SourceCurrent      = true
buildLockR2FinalAdmitted      = false
packagedPhysicalExecuted      = false
historicalPassCarryForward    = 0
productionPointerMutated      = false
localActivationPointerMutated = false
```

# 18. Final Physical State

```text
RESAMPLE_RUNTIME_R9A_P1_PACKAGED_PRODUCT_GRAPH_PHYSICAL_VALIDATED_AWAITING_R10A_REPLAY

360 SOURCE PASS
480 PHYSICAL PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

buildLockR2FinalAdmitted          = true
packagedProductGraphObserved      = true
canonicalJobEncoderCount          = 1
canonicalJobSubmitCount           = 1
validationDoubleDispatchCount     = 0
uniformInFlightOverwriteCount     = 0
mappedBufferLeakCount             = 0
submissionTicketLeakCount         = 0
deviceLossRecoveryCycleCount      = 3
minimumAdapterCompatibilityPassed = true
historicalPassCarryForward        = 0
```

# 19. Gate Catalog

## 19.1 Source Mandatory Gates

### PARENT_AND_LINEAGE

| Gate | Requirement |
|---|---|
| `R9AP1-S001` | Parent bundle SHA-256 equals 4b9414a4edc5aed983879eec21cd003833e917ece83b452d658a5727ef677eb7 |
| `R9AP1-S002` | Build Lock R2 specification SHA-256 equals c7fcc062defe7b03ddef4d00bf8c21a29d3e482e8651324067071c5e458c63c8 |
| `R9AP1-S003` | Build Lock R2 source receipt SHA-256 equals cdc6476a0ae6fda4b8dd1f4744d7d9122442a1125038f8014dc72323089c99ed |
| `R9AP1-S004` | Build Lock R2 source state is exact and not promoted |
| `R9AP1-S005` | Build Lock R2 Win32 final receipt is required only by physical execution |
| `R9AP1-S006` | Current package-lock remains unpromoted during P1 source bake |
| `R9AP1-S007` | Original R9A specification SHA-256 equals a6bcd275e8d5df1f1a813c7b7f2ed96c851378fc1971eee430c96a5eb7a06b2d |
| `R9AP1-S008` | Original R9A source receipt SHA-256 equals a70e3b088b3fc09f3f8e039fc7965c65f1d241c9a3300a35cc11389bbbeb0ab8 |
| `R9AP1-S009` | Original R9A 286 source gates are replay inputs and not pass carry-forward |
| `R9AP1-S010` | Original R9A 214 physical gates are superseded by P1 physical gates |
| `R9AP1-S011` | R8A mathematical and shader authority remains frozen |
| `R9AP1-S012` | R9A product command graph identity remains tdt.ewa.command-graph.r9a.v1 |
| `R9AP1-S013` | R9A runtime identity remains tdt.ewa.single-submit-runtime.r9a.v1 |
| `R9AP1-S014` | R9A validation sampling identity remains tdt.ewa.validation-sampling.r9a.v1 |
| `R9AP1-S015` | R9A uniform ring identity remains tdt.ewa.uniform-ring.r9a.v1 |
| `R9AP1-S016` | R9A submission fence identity remains tdt.ewa.submission-fence-registry.r9a.v1 |
| `R9AP1-S017` | R10A through R14A receipts are marked replay-required |
| `R9AP1-S018` | Production Pointer is read-only to P1 |
| `R9AP1-S019` | Local Activation Pointer is read-only to P1 |
| `R9AP1-S020` | Historical pass carry-forward equals zero |
| `R9AP1-S021` | Parent source receipt bytes remain immutable |
| `R9AP1-S022` | Parent package-lock bytes remain immutable during source verification |
| `R9AP1-S023` | Parent pointer mirror bytes remain immutable |
| `R9AP1-S024` | P1 source verifier runs predecessor checks in isolated tree |
| `R9AP1-S025` | P1 source finalizer binds parent hashes by raw bytes |
| `R9AP1-S026` | P1 cannot consume a future Build Lock R2 receipt by filename only |
| `R9AP1-S027` | Build Lock R2 final receipt schema and child digests are mandatory in physical mode |
| `R9AP1-S028` | Build Lock R2 packageContentId must equal executing packaged bytes |
| `R9AP1-S029` | R9A P1 lineage head is explicit |
| `R9AP1-S030` | No downstream receipt is silently rewritten by source verification |
### CURRENT_GAP_CLOSURE

| Gate | Requirement |
|---|---|
| `R9AP1-S031` | physical-runner placeholder is detected and must be replaced |
| `R9AP1-S032` | command-graph-observer is detected as unwired in parent |
| `R9AP1-S033` | performance suite summary-only admission is rejected |
| `R9AP1-S034` | residency suite summary-only admission is rejected |
| `R9AP1-S035` | validation suite summary-only admission is rejected |
| `R9AP1-S036` | physical verifier file-existence-only behavior is rejected |
| `R9AP1-S037` | absence of timestamp query recording is detected |
| `R9AP1-S038` | absence of packaged qualification orchestrator is detected |
| `R9AP1-S039` | absence of raw event ledger is detected |
| `R9AP1-S040` | absence of fixture schedule binding is detected |
| `R9AP1-S041` | absence of main-process run lock is detected |
| `R9AP1-S042` | absence of renderer qualification capability is detected |
| `R9AP1-S043` | absence of package identity binding in observations is detected |
| `R9AP1-S044` | absence of window and renderer process binding is detected |
| `R9AP1-S045` | absence of device epoch chain in observations is detected |
| `R9AP1-S046` | absence of resource create-destroy ledger is detected |
| `R9AP1-S047` | absence of query-set resolve ledger is detected |
| `R9AP1-S048` | absence of controlled fault authority is detected |
| `R9AP1-S049` | absence of old-session rejection after device loss is detected |
| `R9AP1-S050` | current rejectEpoch promise-settlement defect is covered |
| `R9AP1-S051` | stale completion transition from REJECTED to COMPLETE is covered |
| `R9AP1-S052` | uniform ring has explicit epoch invalidation requirement |
| `R9AP1-S053` | uniform ring authority disposal is externally reachable through device authority |
| `R9AP1-S054` | validation counter buffer lifetime is measurable |
| `R9AP1-S055` | baseline path cannot be selected as product path |
| `R9AP1-S056` | direct low-level harness imports cannot claim Preview E2E |
| `R9AP1-S057` | direct low-level harness imports cannot claim Export E2E |
| `R9AP1-S058` | dev server execution cannot claim physical pass |
| `R9AP1-S059` | source fixture mocks cannot claim physical pass |
| `R9AP1-S060` | software adapter cannot claim hardware pass |
### PACKAGED_HARNESS_ARCHITECTURE

| Gate | Requirement |
|---|---|
| `R9AP1-S061` | Main process owns qualification run lock |
| `R9AP1-S062` | Main process issues 192-bit run challenge |
| `R9AP1-S063` | Main process binds challenge to packageContentId |
| `R9AP1-S064` | Main process binds challenge to Build Lock R2 receipt |
| `R9AP1-S065` | Main process binds challenge to BrowserWindow id |
| `R9AP1-S066` | Main process binds challenge to webContents id |
| `R9AP1-S067` | Main process binds challenge to renderer OS process id |
| `R9AP1-S068` | Main process binds challenge to fixture schedule digest |
| `R9AP1-S069` | Main process binds challenge to requested adapter role |
| `R9AP1-S070` | Main process binds challenge to expiration |
| `R9AP1-S071` | Qualification BrowserWindow is hidden |
| `R9AP1-S072` | Qualification BrowserWindow has isolated session partition |
| `R9AP1-S073` | Qualification BrowserWindow has no user document access |
| `R9AP1-S074` | Qualification BrowserWindow has no arbitrary navigation |
| `R9AP1-S075` | Qualification BrowserWindow has no devtools in canonical run |
| `R9AP1-S076` | Qualification BrowserWindow has network disabled |
| `R9AP1-S077` | Qualification BrowserWindow loads packaged file URL only |
| `R9AP1-S078` | Preload exposes narrow qualification capability |
| `R9AP1-S079` | Preload does not expose filesystem paths |
| `R9AP1-S080` | Preload does not expose pointer writers |
| `R9AP1-S081` | Preload validates sender identity |
| `R9AP1-S082` | Preload validates challenge nonce |
| `R9AP1-S083` | Renderer cannot choose fixture order |
| `R9AP1-S084` | Renderer cannot choose expected thresholds |
| `R9AP1-S085` | Renderer cannot choose package identity |
| `R9AP1-S086` | Renderer cannot choose adapter role |
| `R9AP1-S087` | Renderer cannot finalize physical receipt |
| `R9AP1-S088` | Main process owns interruption marker |
| `R9AP1-S089` | Main process owns run state transitions |
| `R9AP1-S090` | Main process owns final artifact publication |
| `R9AP1-S091` | Run states are CREATED PRECHECK RUNNING DRAINING FINALIZING COMMITTED FAILED INTERRUPTED |
| `R9AP1-S092` | State transitions are monotonic |
| `R9AP1-S093` | Run state journal is append-only |
| `R9AP1-S094` | Run artifact writes are atomic |
| `R9AP1-S095` | Run directory is unique per challenge |
| `R9AP1-S096` | Concurrent qualification runs are rejected |
| `R9AP1-S097` | Abandoned run is recoverable as INTERRUPTED |
| `R9AP1-S098` | Normal application workspace is not shown during qualification |
| `R9AP1-S099` | Qualification mode cannot issue R11A normal installed session |
| `R9AP1-S100` | Qualification evidence contains no user content |
### DUAL_LAYER_INSTRUMENTATION

| Gate | Requirement |
|---|---|
| `R9AP1-S101` | GPU Device Authority owns low-level observation hooks |
| `R9AP1-S102` | R9A command graph owns semantic observation hooks |
| `R9AP1-S103` | Low-level and semantic ledgers share run id |
| `R9AP1-S104` | Low-level and semantic ledgers share job id |
| `R9AP1-S105` | Low-level and semantic ledgers share device epoch |
| `R9AP1-S106` | Low-level observer records createCommandEncoder |
| `R9AP1-S107` | Low-level observer records encoder finish |
| `R9AP1-S108` | Low-level observer records queue submit |
| `R9AP1-S109` | Low-level observer records onSubmittedWorkDone |
| `R9AP1-S110` | Low-level observer records buffer mapAsync |
| `R9AP1-S111` | Low-level observer records buffer unmap |
| `R9AP1-S112` | Low-level observer records buffer create and destroy |
| `R9AP1-S113` | Low-level observer records texture create and destroy |
| `R9AP1-S114` | Low-level observer records query set create and destroy |
| `R9AP1-S115` | Low-level observer records query resolve copy |
| `R9AP1-S116` | Low-level observer records device lost |
| `R9AP1-S117` | Semantic observer records source prepare pass |
| `R9AP1-S118` | Semantic observer records tensor passes |
| `R9AP1-S119` | Semantic observer records adaptive policy pass |
| `R9AP1-S120` | Semantic observer records every EWA stage pass |
| `R9AP1-S121` | Semantic observer records residual pass |
| `R9AP1-S122` | Semantic observer records finalization pass |
| `R9AP1-S123` | Semantic observer records validation counter clear |
| `R9AP1-S124` | Semantic observer records validation counter copy |
| `R9AP1-S125` | Semantic observer records terminal readback copy |
| `R9AP1-S126` | Each event has monotonic sequence |
| `R9AP1-S127` | Each event has monotonic timestamp |
| `R9AP1-S128` | Each event binds encoder identity |
| `R9AP1-S129` | Each event binds submission serial when applicable |
| `R9AP1-S130` | Each event binds resource identity when applicable |
| `R9AP1-S131` | Each event binds stage index and stage count when applicable |
| `R9AP1-S132` | Event ledger uses canonical JSON |
| `R9AP1-S133` | Event ledger forms a hash chain |
| `R9AP1-S134` | Event ledger rejects duplicate sequence |
| `R9AP1-S135` | Event ledger rejects sequence gap |
| `R9AP1-S136` | Event ledger rejects unknown event kind |
| `R9AP1-S137` | Observer cannot mutate WebGPU arguments |
| `R9AP1-S138` | Observer cannot add queue submissions |
| `R9AP1-S139` | Observer cannot add CPU fences |
| `R9AP1-S140` | Observer is disabled outside qualification mode |
| `R9AP1-S141` | Observer overhead is measured separately |
| `R9AP1-S142` | Observer raw ledger is retained for finalizer replay |
| `R9AP1-S143` | Command graph receipt is derived from events |
| `R9AP1-S144` | No summary-only command graph receipt is accepted |
| `R9AP1-S145` | Hidden submits outside R9A graph are attributed to caller and fail the job |
### PRODUCT_GRAPH_INVOCATION

| Gate | Requirement |
|---|---|
| `R9AP1-S146` | Preview qualification enters through product runtime surface |
| `R9AP1-S147` | Preview qualification reaches runDeltaKStack active caller |
| `R9AP1-S148` | Preview qualification reaches executeCanonicalEwaLowpassR9A |
| `R9AP1-S149` | Preview qualification uses GPU Device Authority lease |
| `R9AP1-S150` | Preview qualification publishes through Surface Registry |
| `R9AP1-S151` | Preview harness cannot import createEwaCommandGraphR9A directly |
| `R9AP1-S152` | Preview harness cannot import shader modules directly |
| `R9AP1-S153` | Preview fixture injection is qualification-only |
| `R9AP1-S154` | Preview fixture bytes are canonical generated fixtures |
| `R9AP1-S155` | Preview output receipt binds final surface identity |
| `R9AP1-S156` | Export qualification enters through DadumRuntimeExport or ExportAuthorityService |
| `R9AP1-S157` | Export qualification reaches downscaleRGBAWithWGSL through product binding |
| `R9AP1-S158` | Export qualification reaches executeCanonicalEwaLowpassR9A |
| `R9AP1-S159` | Export qualification uses normal encoder selection |
| `R9AP1-S160` | Export qualification uses normal save admission in discard-only test target |
| `R9AP1-S161` | Export harness cannot call executeDownscale private function |
| `R9AP1-S162` | Export harness cannot import createEwaCommandGraphR9A directly |
| `R9AP1-S163` | Export output receipt binds format encoder identity |
| `R9AP1-S164` | Preview and Export use same lowpass identity |
| `R9AP1-S165` | Preview and Export use same kernel digest |
| `R9AP1-S166` | Preview and Export use same planner digest |
| `R9AP1-S167` | Preview and Export use same package bytes |
| `R9AP1-S168` | Preview and Export fixture request digests are recorded |
| `R9AP1-S169` | Preview and Export completion semantics remain product semantics |
| `R9AP1-S170` | Qualification cannot enable CPU fallback |
| `R9AP1-S171` | Qualification cannot enable WebGL fallback |
| `R9AP1-S172` | Qualification cannot skip admission guards |
| `R9AP1-S173` | Qualification cannot bypass Surface Registry |
| `R9AP1-S174` | Qualification cannot bypass Export Authority |
| `R9AP1-S175` | Qualification cannot write final user files |
### COMMAND_GRAPH_OBSERVATION

| Gate | Requirement |
|---|---|
| `R9AP1-S176` | One canonical job creates exactly one command encoder |
| `R9AP1-S177` | One canonical job finishes exactly one command buffer |
| `R9AP1-S178` | One canonical job calls queue.submit exactly once |
| `R9AP1-S179` | Source prepare emits no independent submit |
| `R9AP1-S180` | Tensor emits no independent submit |
| `R9AP1-S181` | Adaptive policy emits no independent submit |
| `R9AP1-S182` | EWA stage loop emits no independent submit |
| `R9AP1-S183` | Residual emits no independent submit |
| `R9AP1-S184` | Finalization emits no independent submit |
| `R9AP1-S185` | Validation counter copy is in the same encoder |
| `R9AP1-S186` | Timestamp resolve is in the same encoder |
| `R9AP1-S187` | Export terminal copy is in the same encoder |
| `R9AP1-S188` | Preview uses zero map operations |
| `R9AP1-S189` | Export uses exactly one terminal map operation |
| `R9AP1-S190` | Preview uses zero onSubmittedWorkDone calls |
| `R9AP1-S191` | Export uses zero pre-map onSubmittedWorkDone calls |
| `R9AP1-S192` | Queue observer completion is counted separately from product CPU fence |
| `R9AP1-S193` | Command pass order is deterministic |
| `R9AP1-S194` | Pass count equals semantic plan |
| `R9AP1-S195` | Stage count equals planner receipt |
| `R9AP1-S196` | Command buffer labels bind job id |
| `R9AP1-S197` | Encoder labels bind run id |
| `R9AP1-S198` | Submission serial is monotonic |
| `R9AP1-S199` | Completion ticket is one per submit |
| `R9AP1-S200` | Completion ticket settles exactly once |
| `R9AP1-S201` | Recording failure before submit produces zero submits |
| `R9AP1-S202` | Double submit is rejected |
| `R9AP1-S203` | Record after submit is rejected |
| `R9AP1-S204` | Foreign encoder context is rejected |
| `R9AP1-S205` | Compatibility wrapper hidden submit is rejected |
| `R9AP1-S206` | Unknown queue submit during job is rejected |
| `R9AP1-S207` | Graph event digest is included in product receipt |
| `R9AP1-S208` | Graph event digest is included in physical child receipt |
| `R9AP1-S209` | Graph observation is bound to device epoch |
| `R9AP1-S210` | Graph observation is bound to packageContentId |
### VALIDATION_FAULT_AUTHORITY

| Gate | Requirement |
|---|---|
| `R9AP1-S211` | Validation sampling first job rule remains deterministic |
| `R9AP1-S212` | Validation periodic interval remains deterministic |
| `R9AP1-S213` | Post-loss first job is mandatory sample |
| `R9AP1-S214` | Post-pipeline-rebuild first job is mandatory sample |
| `R9AP1-S215` | Explicit strict Export is mandatory sample |
| `R9AP1-S216` | Validation decision is independent of user pixels |
| `R9AP1-S217` | Validation decision is independent of randomness |
| `R9AP1-S218` | Validation decision is independent of wall clock |
| `R9AP1-S219` | Validation variant dispatch replaces product variant and does not duplicate it |
| `R9AP1-S220` | Validation output path equals product output path |
| `R9AP1-S221` | Counter buffer contains exactly 32 u32 words |
| `R9AP1-S222` | Counter buffer clear precedes sampled dispatch |
| `R9AP1-S223` | Counter copy follows all sampled dispatches |
| `R9AP1-S224` | Counter readback happens after submit |
| `R9AP1-S225` | Counter readback cannot infer zero from missing buffer |
| `R9AP1-S226` | Controlled fault mode is main-challenge gated |
| `R9AP1-S227` | Controlled fault mode is unavailable in normal runtime |
| `R9AP1-S228` | Controlled radius fault has dedicated counter |
| `R9AP1-S229` | Controlled zero-weight fault has dedicated counter |
| `R9AP1-S230` | Controlled nonfinite-weight fault has dedicated counter |
| `R9AP1-S231` | Controlled nonfinite-accumulation fault has dedicated counter |
| `R9AP1-S232` | Only expected counter increments for each controlled fault |
| `R9AP1-S233` | Reserved counters remain zero |
| `R9AP1-S234` | Fault fixture output cannot be published |
| `R9AP1-S235` | Fault fixture output cannot be saved |
| `R9AP1-S236` | Fault injection parameters are not user options |
| `R9AP1-S237` | Fault shader digest is recorded |
| `R9AP1-S238` | Normal validation shader digest is recorded |
| `R9AP1-S239` | Product shader digest is recorded |
| `R9AP1-S240` | Fault run is isolated from performance run |
| `R9AP1-S241` | Fault run is isolated from residency run |
| `R9AP1-S242` | Fault counter evidence uses raw readback bytes |
| `R9AP1-S243` | Finalizer recomputes counters from raw bytes |
| `R9AP1-S244` | Nonzero normal counter fails immediately |
| `R9AP1-S245` | Missing controlled fault increment fails immediately |
### UNIFORM_FENCE_EPOCH

| Gate | Requirement |
|---|---|
| `R9AP1-S246` | Uniform ring slot has explicit device epoch |
| `R9AP1-S247` | Uniform ring slot has explicit runtime epoch |
| `R9AP1-S248` | Uniform ring slot has job id and pass id |
| `R9AP1-S249` | Uniform ring slot transitions FREE to RECORDED to IN_FLIGHT to FREE |
| `R9AP1-S250` | Uniform ring cannot overwrite IN_FLIGHT slot |
| `R9AP1-S251` | Uniform ring exhaustion is stable error |
| `R9AP1-S252` | Uniform payload alignment is checked |
| `R9AP1-S253` | Uniform payload bounds are checked |
| `R9AP1-S254` | Uniform buffer creation count is bounded per device epoch |
| `R9AP1-S255` | Uniform slots reclaim only after ticket completion |
| `R9AP1-S256` | Device loss invalidates all old-epoch slots |
| `R9AP1-S257` | Device loss destroys old ring buffer |
| `R9AP1-S258` | New device epoch creates new ring authority |
| `R9AP1-S259` | Old allocation cannot bind to new device |
| `R9AP1-S260` | Fence registry owns explicit deferred completion |
| `R9AP1-S261` | rejectEpoch rejects pending completion promise |
| `R9AP1-S262` | rejectEpoch prevents later COMPLETE transition |
| `R9AP1-S263` | Completion callback checks epoch and ticket state |
| `R9AP1-S264` | Ticket retirement is idempotent |
| `R9AP1-S265` | Ticket ledger records LOST distinctly from FAILED |
| `R9AP1-S266` | External terminal map completion must be bound exactly once |
| `R9AP1-S267` | Unbound external completion is finalization failure |
| `R9AP1-S268` | Stale completion cannot reclaim new epoch slot |
| `R9AP1-S269` | Fence registry dispose rejects pending tickets |
| `R9AP1-S270` | Physical runner can snapshot exact live ticket count |
| `R9AP1-S271` | Physical runner can snapshot exact slot state counts |
| `R9AP1-S272` | Uniform and ticket ledgers are included in raw evidence |
| `R9AP1-S273` | No synthetic zero leak counts are accepted |
| `R9AP1-S274` | No finalizer summary trust is allowed |
| `R9AP1-S275` | Cleanup after interrupted run is explicit |
### TIMESTAMP_PERFORMANCE_POLICY

| Gate | Requirement |
|---|---|
| `R9AP1-S276` | Primary adapter requires timestamp-query feature |
| `R9AP1-S277` | Query set is created once per bounded batch |
| `R9AP1-S278` | Each logical phase has beginning and end query indices |
| `R9AP1-S279` | Graph total has beginning and end query indices |
| `R9AP1-S280` | Query resolve is recorded in canonical encoder |
| `R9AP1-S281` | Query copy is recorded in canonical encoder |
| `R9AP1-S282` | Raw timestamp ticks are preserved |
| `R9AP1-S283` | Timestamp period identity is recorded when available |
| `R9AP1-S284` | CPU wall clock cannot replace GPU timestamp |
| `R9AP1-S285` | CPU encode-submit uses monotonic high-resolution clock |
| `R9AP1-S286` | Warmup count minimum is 128 |
| `R9AP1-S287` | Paired sample count minimum is 256 |
| `R9AP1-S288` | ABBA order is deterministic and balanced |
| `R9AP1-S289` | Baseline is packaged test-only partition |
| `R9AP1-S290` | Baseline cannot become Active Graph product node |
| `R9AP1-S291` | Baseline and candidate use identical fixture and parameters |
| `R9AP1-S292` | Baseline and candidate use identical package bytes |
| `R9AP1-S293` | One-stage and multi-stage are measured separately |
| `R9AP1-S294` | R4 and R6 are measured separately |
| `R9AP1-S295` | Preview and Export are measured separately |
| `R9AP1-S296` | Sampled and unsampled runs are measured separately |
| `R9AP1-S297` | Median and p95 algorithms are fixed |
| `R9AP1-S298` | Outlier policy is fixed before run |
| `R9AP1-S299` | Thermal and power invalidation policy is explicit |
| `R9AP1-S300` | Correctness failure invalidates performance result |
### RESIDENCY_DEVICE_LOSS_POLICY

| Gate | Requirement |
|---|---|
| `R9AP1-S301` | Resource ledger tracks buffer live bytes |
| `R9AP1-S302` | Resource ledger tracks texture live bytes |
| `R9AP1-S303` | Resource ledger tracks query set count |
| `R9AP1-S304` | Resource ledger tracks bind group count |
| `R9AP1-S305` | Resource ledger tracks pipeline cache count |
| `R9AP1-S306` | Resource ledger tracks mapped buffer count |
| `R9AP1-S307` | Resource ledger tracks submission ticket count |
| `R9AP1-S308` | Resource ledger tracks completion callback count |
| `R9AP1-S309` | Resource ledger tracks Surface Registry pins |
| `R9AP1-S310` | Residency plateau uses raw samples |
| `R9AP1-S311` | Last-64 slope policy is fixed |
| `R9AP1-S312` | Renderer private memory is sampled by main process |
| `R9AP1-S313` | GPU process memory is sampled by main process |
| `R9AP1-S314` | Controlled device loss uses GPU Authority recovery path |
| `R9AP1-S315` | Three sequential controlled losses are required |
| `R9AP1-S316` | Loss during pending Preview job is covered |
| `R9AP1-S317` | Loss during pending Export job is covered |
| `R9AP1-S318` | Each loss increments device epoch |
| `R9AP1-S319` | Old graph authority is disposed after loss |
| `R9AP1-S320` | Old pipeline cache is disposed after loss |
| `R9AP1-S321` | Post-loss first job is sampled |
| `R9AP1-S322` | Post-loss parity is mandatory |
| `R9AP1-S323` | Post-loss residency returns to plateau |
| `R9AP1-S324` | No stale completion crosses epoch |
| `R9AP1-S325` | Cleanup ledger closes after loss suite |
### RECEIPTS_FINALIZER_AND_GATES

| Gate | Requirement |
|---|---|
| `R9AP1-S326` | Packaged environment child receipt schema exists |
| `R9AP1-S327` | Product graph observation child receipt schema exists |
| `R9AP1-S328` | Validation fault child receipt schema exists |
| `R9AP1-S329` | Uniform lifetime child receipt schema exists |
| `R9AP1-S330` | Performance child receipt schema exists |
| `R9AP1-S331` | Residency child receipt schema exists |
| `R9AP1-S332` | Device loss child receipt schema exists |
| `R9AP1-S333` | Preview E2E child receipt schema exists |
| `R9AP1-S334` | Export E2E child receipt schema exists |
| `R9AP1-S335` | Adapter matrix child receipt schema exists |
| `R9AP1-S336` | Raw event ledger schema exists |
| `R9AP1-S337` | Raw counter bytes manifest schema exists |
| `R9AP1-S338` | Raw timestamp sample manifest schema exists |
| `R9AP1-S339` | Finalizer reads raw child artifacts from disk |
| `R9AP1-S340` | Finalizer recomputes graph counts |
| `R9AP1-S341` | Finalizer recomputes counter values |
| `R9AP1-S342` | Finalizer recomputes performance statistics |
| `R9AP1-S343` | Finalizer recomputes residency slopes |
| `R9AP1-S344` | Finalizer recomputes device epoch chain |
| `R9AP1-S345` | Finalizer rejects externally supplied pass booleans |
| `R9AP1-S346` | Finalizer rejects missing child artifact |
| `R9AP1-S347` | Finalizer rejects child digest mismatch |
| `R9AP1-S348` | Finalizer rejects package identity mismatch |
| `R9AP1-S349` | Finalizer rejects run challenge mismatch |
| `R9AP1-S350` | Finalizer rejects mixed adapter run |
| `R9AP1-S351` | Finalizer rejects mixed package bytes |
| `R9AP1-S352` | Finalizer rejects incomplete fixture matrix |
| `R9AP1-S353` | Final receipt is written atomically |
| `R9AP1-S354` | Final receipt has self SHA-256 |
| `R9AP1-S355` | Physical verifier replays final receipt and all children |
| `R9AP1-S356` | Physical verifier rejects source-mode final receipt |
| `R9AP1-S357` | Physical verifier rejects missing raw ledger roots |
| `R9AP1-S358` | Physical verifier rejects future-schema child receipt |
| `R9AP1-S359` | Physical verifier rejects duplicate child receipt kind |
| `R9AP1-S360` | Physical verifier records zero summary trust count |

## 19.2 Physical Mandatory Gates

### PACKAGED_ENVIRONMENT

| Gate | Requirement |
|---|---|
| `R9AP1-P001` | Canonical run executes on Windows x64 |
| `R9AP1-P002` | Canonical run executes from electron-builder win-unpacked package |
| `R9AP1-P003` | Build Lock R2 final admission receipt exists |
| `R9AP1-P004` | Build Lock R2 final admission receipt self-hash is valid |
| `R9AP1-P005` | Build Lock R2 productionBuildAdmitted is true |
| `R9AP1-P006` | Executing packageContentId equals Build Lock R2 packageContentId |
| `R9AP1-P007` | Executing ASAR digest equals Build Lock R2 ASAR digest |
| `R9AP1-P008` | Executing native addon digest equals Build Lock R2 digest |
| `R9AP1-P009` | Executing WASM closure digest equals Build Lock R2 digest |
| `R9AP1-P010` | Executing runtime manifest digest equals Build Lock R2 digest |
| `R9AP1-P011` | No dev server is reachable |
| `R9AP1-P012` | No source tree module is imported |
| `R9AP1-P013` | Network is disabled during canonical run |
| `R9AP1-P014` | Qualification window remains hidden |
| `R9AP1-P015` | Qualification session partition is isolated |
| `R9AP1-P016` | Hardware D3D12 backend is active |
| `R9AP1-P017` | Software adapter is rejected |
| `R9AP1-P018` | Primary adapter identity is recorded |
| `R9AP1-P019` | Driver identity is recorded |
| `R9AP1-P020` | OS build identity is recorded |
| `R9AP1-P021` | Electron and Chromium versions are recorded |
| `R9AP1-P022` | Power plan is recorded |
| `R9AP1-P023` | Display state is recorded |
| `R9AP1-P024` | GPU preference is high-performance |
| `R9AP1-P025` | Exclusive run lock is held |
| `R9AP1-P026` | Interruption marker exists |
| `R9AP1-P027` | Fixture schedule digest matches challenge |
| `R9AP1-P028` | Run challenge has not expired |
| `R9AP1-P029` | BrowserWindow and webContents identity match challenge |
| `R9AP1-P030` | Renderer OS process identity matches challenge |
| `R9AP1-P031` | Package bytes are unchanged after run |
| `R9AP1-P032` | Production Pointer is unchanged |
| `R9AP1-P033` | Local Activation Pointer is unchanged |
| `R9AP1-P034` | No user document is opened |
| `R9AP1-P035` | Packaged environment child receipt is valid |
### PRIMARY_ADAPTER_ADMISSION

| Gate | Requirement |
|---|---|
| `R9AP1-P036` | Primary adapter role is PERFORMANCE_CANONICAL |
| `R9AP1-P037` | Primary adapter is RTX 3080 class or explicitly approved replacement |
| `R9AP1-P038` | Primary adapter backend is D3D12 |
| `R9AP1-P039` | Primary adapter is not fallback |
| `R9AP1-P040` | Primary adapter exposes timestamp-query |
| `R9AP1-P041` | Primary adapter limits satisfy R9A shader requirements |
| `R9AP1-P042` | minUniformBufferOffsetAlignment is recorded |
| `R9AP1-P043` | maxBufferSize is recorded |
| `R9AP1-P044` | maxStorageBufferBindingSize is recorded |
| `R9AP1-P045` | maxComputeWorkgroupsPerDimension is recorded |
| `R9AP1-P046` | maxComputeInvocationsPerWorkgroup is recorded |
| `R9AP1-P047` | Adapter vendor and architecture family are recorded without serial number |
| `R9AP1-P048` | Device identity is stable for baseline and candidate |
| `R9AP1-P049` | Device epoch starts from admitted value |
| `R9AP1-P050` | Pipeline compilation completes without validation error |
| `R9AP1-P051` | Generated WGSL manifest digest matches package |
| `R9AP1-P052` | R4 product shader digest matches package |
| `R9AP1-P053` | R6 product shader digest matches package |
| `R9AP1-P054` | Validation shader digest matches package |
| `R9AP1-P055` | Kernel ABI identity matches package |
| `R9AP1-P056` | Planner identity matches package |
| `R9AP1-P057` | Command graph identity matches package |
| `R9AP1-P058` | GPU Authority lease is current |
| `R9AP1-P059` | Adapter admission has no silent fallback |
| `R9AP1-P060` | Primary adapter child receipt is valid |
| `R9AP1-P061` | Primary device uncaptured error count is zero before fixtures |
| `R9AP1-P062` | Primary device uncaptured error listener is active |
| `R9AP1-P063` | Primary adapter does not change during run |
| `R9AP1-P064` | Driver reset outside controlled loss invalidates run |
| `R9AP1-P065` | Power state change invalidates performance run |
### PREVIEW_PRODUCT_GRAPH

| Gate | Requirement |
|---|---|
| `R9AP1-P066` | Preview R4 1-stage dc executes through product graph with one encoder and one submit |
| `R9AP1-P067` | Preview R4 1-stage fractional-impulse executes through product graph with one encoder and one submit |
| `R9AP1-P068` | Preview R4 1-stage diagonal-edge executes through product graph with one encoder and one submit |
| `R9AP1-P069` | Preview R4 1-stage border-corner executes through product graph with one encoder and one submit |
| `R9AP1-P070` | Preview R4 1-stage alpha-edge executes through product graph with one encoder and one submit |
| `R9AP1-P071` | Preview R4 1-stage transparent-hidden-rgb executes through product graph with one encoder and one submit |
| `R9AP1-P072` | Preview R4 1-stage one-by-one executes through product graph with one encoder and one submit |
| `R9AP1-P073` | Preview R4 1-stage one-by-n executes through product graph with one encoder and one submit |
| `R9AP1-P074` | Preview R4 2-stage dc executes through product graph with one encoder and one submit |
| `R9AP1-P075` | Preview R4 2-stage fractional-impulse executes through product graph with one encoder and one submit |
| `R9AP1-P076` | Preview R4 2-stage diagonal-edge executes through product graph with one encoder and one submit |
| `R9AP1-P077` | Preview R4 2-stage border-corner executes through product graph with one encoder and one submit |
| `R9AP1-P078` | Preview R4 2-stage alpha-edge executes through product graph with one encoder and one submit |
| `R9AP1-P079` | Preview R4 2-stage transparent-hidden-rgb executes through product graph with one encoder and one submit |
| `R9AP1-P080` | Preview R4 2-stage one-by-one executes through product graph with one encoder and one submit |
| `R9AP1-P081` | Preview R4 2-stage one-by-n executes through product graph with one encoder and one submit |
| `R9AP1-P082` | Preview R4 3-plus-stage dc executes through product graph with one encoder and one submit |
| `R9AP1-P083` | Preview R4 3-plus-stage fractional-impulse executes through product graph with one encoder and one submit |
| `R9AP1-P084` | Preview R4 3-plus-stage diagonal-edge executes through product graph with one encoder and one submit |
| `R9AP1-P085` | Preview R4 3-plus-stage border-corner executes through product graph with one encoder and one submit |
| `R9AP1-P086` | Preview R4 3-plus-stage alpha-edge executes through product graph with one encoder and one submit |
| `R9AP1-P087` | Preview R4 3-plus-stage transparent-hidden-rgb executes through product graph with one encoder and one submit |
| `R9AP1-P088` | Preview R4 3-plus-stage one-by-one executes through product graph with one encoder and one submit |
| `R9AP1-P089` | Preview R4 3-plus-stage one-by-n executes through product graph with one encoder and one submit |
| `R9AP1-P090` | Preview R6 1-stage dc executes through product graph with one encoder and one submit |
| `R9AP1-P091` | Preview R6 1-stage fractional-impulse executes through product graph with one encoder and one submit |
| `R9AP1-P092` | Preview R6 1-stage diagonal-edge executes through product graph with one encoder and one submit |
| `R9AP1-P093` | Preview R6 1-stage border-corner executes through product graph with one encoder and one submit |
| `R9AP1-P094` | Preview R6 1-stage alpha-edge executes through product graph with one encoder and one submit |
| `R9AP1-P095` | Preview R6 1-stage transparent-hidden-rgb executes through product graph with one encoder and one submit |
| `R9AP1-P096` | Preview R6 1-stage one-by-one executes through product graph with one encoder and one submit |
| `R9AP1-P097` | Preview R6 1-stage one-by-n executes through product graph with one encoder and one submit |
| `R9AP1-P098` | Preview R6 2-stage dc executes through product graph with one encoder and one submit |
| `R9AP1-P099` | Preview R6 2-stage fractional-impulse executes through product graph with one encoder and one submit |
| `R9AP1-P100` | Preview R6 2-stage diagonal-edge executes through product graph with one encoder and one submit |
| `R9AP1-P101` | Preview R6 2-stage border-corner executes through product graph with one encoder and one submit |
| `R9AP1-P102` | Preview R6 2-stage alpha-edge executes through product graph with one encoder and one submit |
| `R9AP1-P103` | Preview R6 2-stage transparent-hidden-rgb executes through product graph with one encoder and one submit |
| `R9AP1-P104` | Preview R6 2-stage one-by-one executes through product graph with one encoder and one submit |
| `R9AP1-P105` | Preview R6 2-stage one-by-n executes through product graph with one encoder and one submit |
| `R9AP1-P106` | Preview R6 3-plus-stage dc executes through product graph with one encoder and one submit |
| `R9AP1-P107` | Preview R6 3-plus-stage fractional-impulse executes through product graph with one encoder and one submit |
| `R9AP1-P108` | Preview R6 3-plus-stage diagonal-edge executes through product graph with one encoder and one submit |
| `R9AP1-P109` | Preview R6 3-plus-stage border-corner executes through product graph with one encoder and one submit |
| `R9AP1-P110` | Preview R6 3-plus-stage alpha-edge executes through product graph with one encoder and one submit |
| `R9AP1-P111` | Preview R6 3-plus-stage transparent-hidden-rgb executes through product graph with one encoder and one submit |
| `R9AP1-P112` | Preview R6 3-plus-stage one-by-one executes through product graph with one encoder and one submit |
| `R9AP1-P113` | Preview R6 3-plus-stage one-by-n executes through product graph with one encoder and one submit |
| `R9AP1-P114` | Preview product graph observation child receipt is valid |
| `R9AP1-P115` | Preview final surface identity matches product receipt |
### EXPORT_PRODUCT_GRAPH

| Gate | Requirement |
|---|---|
| `R9AP1-P116` | Export png R4 1-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P117` | Export png R4 1-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P118` | Export png R4 1-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P119` | Export png R4 1-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P120` | Export png R4 1-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P121` | Export png R4 2-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P122` | Export png R4 2-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P123` | Export png R4 2-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P124` | Export png R4 2-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P125` | Export png R4 2-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P126` | Export png R4 3-plus-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P127` | Export png R4 3-plus-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P128` | Export png R4 3-plus-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P129` | Export png R4 3-plus-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P130` | Export png R4 3-plus-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P131` | Export png R6 1-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P132` | Export png R6 1-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P133` | Export png R6 1-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P134` | Export png R6 1-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P135` | Export png R6 1-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P136` | Export png R6 2-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P137` | Export png R6 2-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P138` | Export png R6 2-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P139` | Export png R6 2-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P140` | Export png R6 2-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P141` | Export png R6 3-plus-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P142` | Export png R6 3-plus-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P143` | Export png R6 3-plus-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P144` | Export png R6 3-plus-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P145` | Export png R6 3-plus-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P146` | Export webp R4 1-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P147` | Export webp R4 1-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P148` | Export webp R4 1-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P149` | Export webp R4 1-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P150` | Export webp R4 1-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P151` | Export webp R4 2-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P152` | Export webp R4 2-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P153` | Export webp R4 2-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P154` | Export webp R4 2-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P155` | Export webp R4 2-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P156` | Export webp R4 3-plus-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P157` | Export webp R4 3-plus-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P158` | Export webp R4 3-plus-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P159` | Export webp R4 3-plus-stage alpha-edge executes through product authority with one encoder and one submit |
| `R9AP1-P160` | Export webp R4 3-plus-stage border-corner executes through product authority with one encoder and one submit |
| `R9AP1-P161` | Export webp R6 1-stage dc executes through product authority with one encoder and one submit |
| `R9AP1-P162` | Export webp R6 1-stage fractional-impulse executes through product authority with one encoder and one submit |
| `R9AP1-P163` | Export webp R6 1-stage diagonal-edge executes through product authority with one encoder and one submit |
| `R9AP1-P164` | Export product graph observation child receipt is valid |
| `R9AP1-P165` | Export encoder and save-discard receipt bind the same R9A submission |
### VALIDATION_FAULT_INJECTION

| Gate | Requirement |
|---|---|
| `R9AP1-P166` | First job of initial device epoch is sampled |
| `R9AP1-P167` | First job of each kernel digest is sampled |
| `R9AP1-P168` | First job of each planner digest is sampled |
| `R9AP1-P169` | Periodic sample ordinal is exact |
| `R9AP1-P170` | Explicit strict Export is sampled |
| `R9AP1-P171` | Unsampled job dispatches product variant once |
| `R9AP1-P172` | Sampled job dispatches validation variant once |
| `R9AP1-P173` | Sampled job does not dispatch product variant |
| `R9AP1-P174` | Sampled output matches unsampled output |
| `R9AP1-P175` | Normal R4 counters are all zero |
| `R9AP1-P176` | Normal R6 counters are all zero |
| `R9AP1-P177` | Reserved counters are all zero |
| `R9AP1-P178` | Counter readback contains exactly 32 words |
| `R9AP1-P179` | Counter clear event precedes dispatch |
| `R9AP1-P180` | Counter copy event follows dispatch |
| `R9AP1-P181` | Counter readback is not inferred |
| `R9AP1-P182` | Preview sampled observer does not block frame publication path |
| `R9AP1-P183` | Export strict observer blocks save until counters verified |
| `R9AP1-P184` | Counter buffer is reclaimed after completion |
| `R9AP1-P185` | Counter readback buffer is unmapped and destroyed |
| `R9AP1-P186` | Controlled radius-undercoverage R4 increments expected counter |
| `R9AP1-P187` | Controlled radius-undercoverage R6 increments expected counter |
| `R9AP1-P188` | Controlled radius-undercoverage increments no unrelated counter |
| `R9AP1-P189` | Controlled radius-undercoverage fault output is not published |
| `R9AP1-P190` | Controlled radius-undercoverage fault output is not saved |
| `R9AP1-P191` | Controlled radius-undercoverage raw counter bytes are retained |
| `R9AP1-P192` | Controlled radius-undercoverage event ledger binds fault challenge |
| `R9AP1-P193` | Controlled zero-total-weight R4 increments expected counter |
| `R9AP1-P194` | Controlled zero-total-weight R6 increments expected counter |
| `R9AP1-P195` | Controlled zero-total-weight increments no unrelated counter |
| `R9AP1-P196` | Controlled zero-total-weight fault output is not published |
| `R9AP1-P197` | Controlled zero-total-weight fault output is not saved |
| `R9AP1-P198` | Controlled zero-total-weight raw counter bytes are retained |
| `R9AP1-P199` | Controlled zero-total-weight event ledger binds fault challenge |
| `R9AP1-P200` | Controlled nonfinite-weight R4 increments expected counter |
| `R9AP1-P201` | Controlled nonfinite-weight R6 increments expected counter |
| `R9AP1-P202` | Controlled nonfinite-weight increments no unrelated counter |
| `R9AP1-P203` | Controlled nonfinite-weight fault output is not published |
| `R9AP1-P204` | Controlled nonfinite-weight fault output is not saved |
| `R9AP1-P205` | Controlled nonfinite-weight raw counter bytes are retained |
| `R9AP1-P206` | Controlled nonfinite-weight event ledger binds fault challenge |
| `R9AP1-P207` | Controlled nonfinite-accumulation R4 increments expected counter |
| `R9AP1-P208` | Controlled nonfinite-accumulation R6 increments expected counter |
| `R9AP1-P209` | Controlled nonfinite-accumulation increments no unrelated counter |
| `R9AP1-P210` | Controlled nonfinite-accumulation fault output is not published |
| `R9AP1-P211` | Controlled nonfinite-accumulation fault output is not saved |
| `R9AP1-P212` | Controlled nonfinite-accumulation raw counter bytes are retained |
| `R9AP1-P213` | Controlled nonfinite-accumulation event ledger binds fault challenge |
| `R9AP1-P214` | Normal counter nonzero fails qualification |
| `R9AP1-P215` | Missing fault increment fails qualification |
| `R9AP1-P216` | Duplicate validation dispatch fails qualification |
| `R9AP1-P217` | Validation shader digest mismatch fails qualification |
| `R9AP1-P218` | Fault challenge replay fails qualification |
| `R9AP1-P219` | Fault mode outside qualification is rejected |
| `R9AP1-P220` | Counter buffer reuse is fence safe |
### UNIFORM_RING_AND_FENCE_LIFETIME

| Gate | Requirement |
|---|---|
| `R9AP1-P221` | Uniform ring buffer is created once per device epoch |
| `R9AP1-P222` | Uniform slot stride respects device alignment |
| `R9AP1-P223` | All uniform writes stay within slot bounds |
| `R9AP1-P224` | Each recorded pass has one uniform allocation or explicit zero-allocation reason |
| `R9AP1-P225` | Slot transition FREE to RECORDED is observed |
| `R9AP1-P226` | Slot transition RECORDED to IN_FLIGHT is observed |
| `R9AP1-P227` | Slot transition IN_FLIGHT to FREE is observed |
| `R9AP1-P228` | No slot returns FREE before completion |
| `R9AP1-P229` | No IN_FLIGHT slot overwrite occurs |
| `R9AP1-P230` | Forced ring exhaustion yields E_R9A_UNIFORM_RING_EXHAUSTED |
| `R9AP1-P231` | Ring exhaustion produces no queue submit |
| `R9AP1-P232` | Physical submission serial sequence is strictly monotonic within device epoch |
| `R9AP1-P233` | One completion ticket exists per submit |
| `R9AP1-P234` | Queue-observer ticket settles exactly once |
| `R9AP1-P235` | External-terminal-map ticket binds exactly once |
| `R9AP1-P236` | Unbound external completion fails run |
| `R9AP1-P237` | Ticket retire removes exact ticket |
| `R9AP1-P238` | Tracked ticket count returns to zero |
| `R9AP1-P239` | Uniform RECORDED count returns to zero |
| `R9AP1-P240` | Uniform IN_FLIGHT count returns to zero |
| `R9AP1-P241` | Transient texture live count returns to zero |
| `R9AP1-P242` | Validation buffer live count returns to zero |
| `R9AP1-P243` | Readback buffer live count returns to zero |
| `R9AP1-P244` | Timestamp query set live count returns to zero |
| `R9AP1-P245` | Unknown queue submit count is zero |
| `R9AP1-P246` | Stage-level queue fence count is zero |
| `R9AP1-P247` | Preview onSubmittedWorkDone count is zero |
| `R9AP1-P248` | Export pre-map onSubmittedWorkDone count is zero |
| `R9AP1-P249` | Command buffer count equals job count |
| `R9AP1-P250` | Command encoder count equals job count |
| `R9AP1-P251` | Submission ticket completion matches terminal map completion |
| `R9AP1-P252` | Recording failure emits zero submit |
| `R9AP1-P253` | Double submit negative control is rejected |
| `R9AP1-P254` | Record-after-submit negative control is rejected |
| `R9AP1-P255` | Foreign encoder negative control is rejected |
| `R9AP1-P256` | Hidden compatibility submit negative control is rejected |
| `R9AP1-P257` | Hidden compatibility fence negative control is rejected |
| `R9AP1-P258` | Stale ticket cannot reclaim current ring |
| `R9AP1-P259` | Uniform lifetime raw ledger digest is valid |
| `R9AP1-P260` | Fence lifetime raw ledger digest is valid |
| `R9AP1-P261` | Uniform lifetime child receipt is valid |
| `R9AP1-P262` | Fence registry child receipt is valid |
| `R9AP1-P263` | Cleanup after interrupted graph closes |
| `R9AP1-P264` | Final live uniform slot count is zero |
| `R9AP1-P265` | Final live submission ticket count is zero |
### TIMESTAMP_PERFORMANCE

| Gate | Requirement |
|---|---|
| `R9AP1-P266` | GPU query set is created on primary adapter |
| `R9AP1-P267` | Graph begin timestamp is written |
| `R9AP1-P268` | Graph end timestamp is written |
| `R9AP1-P269` | Source prepare begin and end timestamps are written |
| `R9AP1-P270` | Tensor total begin and end timestamps are written |
| `R9AP1-P271` | Adaptive policy begin and end timestamps are written |
| `R9AP1-P272` | EWA total begin and end timestamps are written |
| `R9AP1-P273` | Residual begin and end timestamps are written when executed |
| `R9AP1-P274` | Finalization begin and end timestamps are written when executed |
| `R9AP1-P275` | Timestamp resolve occurs in canonical encoder |
| `R9AP1-P276` | Timestamp copy occurs in canonical encoder |
| `R9AP1-P277` | Raw timestamp ticks are retained |
| `R9AP1-P278` | Timestamp query count matches phase plan |
| `R9AP1-P279` | CPU wall clock is not used as GPU substitute |
| `R9AP1-P280` | CPU encode-submit time uses monotonic clock |
| `R9AP1-P281` | Warmup count is at least 128 |
| `R9AP1-P282` | Paired sample count is at least 256 |
| `R9AP1-P283` | ABBA ordering is balanced |
| `R9AP1-P284` | Baseline partition is test-only |
| `R9AP1-P285` | Baseline partition is absent from Active Graph product selection |
| `R9AP1-P286` | Baseline and candidate use identical packageContentId |
| `R9AP1-P287` | Baseline and candidate use identical fixture digest |
| `R9AP1-P288` | Baseline and candidate use identical parameter digest |
| `R9AP1-P289` | R4 one-stage median ratio is at most 1.05 |
| `R9AP1-P290` | R6 one-stage median ratio is at most 1.05 |
| `R9AP1-P291` | R4 two-stage median ratio is at most 0.90 |
| `R9AP1-P292` | R6 two-stage median ratio is at most 0.90 |
| `R9AP1-P293` | R4 three-plus-stage median ratio is at most 0.80 |
| `R9AP1-P294` | R6 three-plus-stage median ratio is at most 0.85 |
| `R9AP1-P295` | R4 multi-stage p95 ratio is at most 0.95 |
| `R9AP1-P296` | R6 multi-stage p95 ratio is at most 0.95 |
| `R9AP1-P297` | Preview CPU encode-submit ratio is at most 0.60 |
| `R9AP1-P298` | Export CPU encode-submit ratio is at most 0.60 |
| `R9AP1-P299` | Unsampled validation overhead is at most 3 percent |
| `R9AP1-P300` | Sampled validation overhead is at most 15 percent |
| `R9AP1-P301` | One-stage and multi-stage samples are separate |
| `R9AP1-P302` | R4 and R6 samples are separate |
| `R9AP1-P303` | Preview and Export samples are separate |
| `R9AP1-P304` | Sampled and unsampled samples are separate |
| `R9AP1-P305` | Median recomputation from raw samples matches receipt |
| `R9AP1-P306` | p95 recomputation from raw samples matches receipt |
| `R9AP1-P307` | Raw sample digest matches files |
| `R9AP1-P308` | Outlier policy is applied exactly |
| `R9AP1-P309` | Thermal state remains within declared range |
| `R9AP1-P310` | Power state remains constant |
| `R9AP1-P311` | Background load anomaly count is zero |
| `R9AP1-P312` | Driver reset count outside controlled suite is zero |
| `R9AP1-P313` | Correctness passes before performance is evaluated |
| `R9AP1-P314` | Performance child receipt is valid |
| `R9AP1-P315` | All declared performance thresholds pass |
| `R9AP1-P316` | No threshold is supplied by renderer |
| `R9AP1-P317` | No pass boolean is supplied by renderer |
| `R9AP1-P318` | Timestamp period metadata is recorded |
| `R9AP1-P319` | Performance raw samples have no nonfinite values |
| `R9AP1-P320` | Performance run cleanup ledger closes |
### RESIDENCY_PLATEAU

| Gate | Requirement |
|---|---|
| `R9AP1-P321` | Primary residency warmup completes |
| `R9AP1-P322` | Primary residency measured iterations are at least 1024 |
| `R9AP1-P323` | Uniform arena live bytes plateau |
| `R9AP1-P324` | Validation counter arena live bytes plateau |
| `R9AP1-P325` | Timestamp arena live bytes plateau |
| `R9AP1-P326` | Transient texture live bytes plateau |
| `R9AP1-P327` | Readback buffer live bytes plateau |
| `R9AP1-P328` | Bind group cardinality plateaus |
| `R9AP1-P329` | Pipeline cache cardinality plateaus |
| `R9AP1-P330` | Surface Registry pin count plateaus |
| `R9AP1-P331` | Mapped buffer count plateaus at zero |
| `R9AP1-P332` | Submission ticket count plateaus at zero |
| `R9AP1-P333` | Completion callback count plateaus at zero |
| `R9AP1-P334` | Last 64 uniform-byte slope is nonpositive |
| `R9AP1-P335` | Last 64 texture-byte slope is nonpositive |
| `R9AP1-P336` | Last 64 renderer-private-memory slope is within threshold |
| `R9AP1-P337` | Last 64 GPU-process-memory slope is within threshold |
| `R9AP1-P338` | Renderer private memory samples come from main process |
| `R9AP1-P339` | GPU process memory samples come from main process |
| `R9AP1-P340` | No per-stage uniform buffer allocation occurs |
| `R9AP1-P341` | No per-stage readback buffer allocation occurs |
| `R9AP1-P342` | No resource identity is reused before destruction |
| `R9AP1-P343` | No destroyed resource receives later event |
| `R9AP1-P344` | Garbage collection is not used as proof of GPU resource release |
| `R9AP1-P345` | Residency raw samples are retained |
| `R9AP1-P346` | Residency slope recomputation matches receipt |
| `R9AP1-P347` | Plateau threshold is fixed before run |
| `R9AP1-P348` | Residency run uses normal validation mode mix |
| `R9AP1-P349` | Residency run uses Preview and Export batches |
| `R9AP1-P350` | Residency run includes R4 and R6 |
| `R9AP1-P351` | Residency run includes one-stage and multi-stage |
| `R9AP1-P352` | Residency run package bytes remain stable |
| `R9AP1-P353` | Residency run adapter remains stable |
| `R9AP1-P354` | Residency child receipt is valid |
| `R9AP1-P355` | Final mapped buffer count is zero |
| `R9AP1-P356` | Final Surface Registry extra pin count is zero |
| `R9AP1-P357` | Final resource ledger open count is zero |
| `R9AP1-P358` | Renderer memory anomaly invalidates run |
| `R9AP1-P359` | GPU process memory anomaly invalidates run |
| `R9AP1-P360` | All residency thresholds pass |
### DEVICE_LOSS_RECOVERY

| Gate | Requirement |
|---|---|
| `R9AP1-P361` | Controlled device loss cycle one is initiated through GPU Authority |
| `R9AP1-P362` | Controlled device loss cycle one increments device epoch |
| `R9AP1-P363` | Controlled device loss cycle one rejects pending ticket |
| `R9AP1-P364` | Controlled device loss cycle one invalidates uniform ring |
| `R9AP1-P365` | Controlled device loss cycle one disposes pipeline cache |
| `R9AP1-P366` | Controlled device loss cycle one reacquires hardware D3D12 device |
| `R9AP1-P367` | Controlled device loss cycle one first job is sampled |
| `R9AP1-P368` | Controlled device loss cycle one parity passes |
| `R9AP1-P369` | Controlled device loss cycle one counters are zero |
| `R9AP1-P370` | Controlled device loss cycle one residency returns to plateau |
| `R9AP1-P371` | Controlled device loss cycle two is initiated through GPU Authority |
| `R9AP1-P372` | Controlled device loss cycle two increments device epoch |
| `R9AP1-P373` | Controlled device loss cycle two rejects pending ticket |
| `R9AP1-P374` | Controlled device loss cycle two invalidates uniform ring |
| `R9AP1-P375` | Controlled device loss cycle two disposes pipeline cache |
| `R9AP1-P376` | Controlled device loss cycle two reacquires hardware D3D12 device |
| `R9AP1-P377` | Controlled device loss cycle two first job is sampled |
| `R9AP1-P378` | Controlled device loss cycle two parity passes |
| `R9AP1-P379` | Controlled device loss cycle two counters are zero |
| `R9AP1-P380` | Controlled device loss cycle two residency returns to plateau |
| `R9AP1-P381` | Controlled device loss cycle three is initiated through GPU Authority |
| `R9AP1-P382` | Controlled device loss cycle three increments device epoch |
| `R9AP1-P383` | Controlled device loss cycle three rejects pending ticket |
| `R9AP1-P384` | Controlled device loss cycle three invalidates uniform ring |
| `R9AP1-P385` | Controlled device loss cycle three disposes pipeline cache |
| `R9AP1-P386` | Controlled device loss cycle three reacquires hardware D3D12 device |
| `R9AP1-P387` | Controlled device loss cycle three first job is sampled |
| `R9AP1-P388` | Controlled device loss cycle three parity passes |
| `R9AP1-P389` | Controlled device loss cycle three counters are zero |
| `R9AP1-P390` | Controlled device loss cycle three residency returns to plateau |
| `R9AP1-P391` | Loss during pending Preview graph is covered |
| `R9AP1-P392` | Loss during pending Export graph is covered |
| `R9AP1-P393` | Old ticket promise rejects with device-loss code |
| `R9AP1-P394` | Old ticket cannot later transition COMPLETE |
| `R9AP1-P395` | Old completion callback cannot reclaim new epoch slot |
| `R9AP1-P396` | Old texture cannot enter new Surface Registry publication |
| `R9AP1-P397` | Old pipeline cannot dispatch on new device |
| `R9AP1-P398` | New submission serial binds new device epoch |
| `R9AP1-P399` | Post-loss Preview product E2E passes |
| `R9AP1-P400` | Post-loss Export product E2E passes |
| `R9AP1-P401` | Device-loss raw epoch ledger is valid |
| `R9AP1-P402` | Device-loss child receipt is valid |
| `R9AP1-P403` | Final stale completion count is zero |
| `R9AP1-P404` | Final old-epoch live resource count is zero |
| `R9AP1-P405` | Device-loss suite cleanup ledger closes |
### MINIMUM_ADAPTER_COMPATIBILITY

| Gate | Requirement |
|---|---|
| `R9AP1-P406` | Minimum compatibility adapter role is COMPATIBILITY_MINIMUM |
| `R9AP1-P407` | Minimum adapter is GTX 950M class or explicit approved equivalent |
| `R9AP1-P408` | Minimum adapter backend is D3D12 |
| `R9AP1-P409` | Minimum adapter is not software fallback |
| `R9AP1-P410` | Minimum adapter packageContentId equals primary package |
| `R9AP1-P411` | Minimum adapter correctness fixture set passes |
| `R9AP1-P412` | Minimum adapter Preview one encoder one submit passes |
| `R9AP1-P413` | Minimum adapter Export one encoder one submit passes |
| `R9AP1-P414` | Minimum adapter validation normal counters are zero |
| `R9AP1-P415` | Minimum adapter controlled fault detection passes |
| `R9AP1-P416` | Minimum adapter uniform overwrite count is zero |
| `R9AP1-P417` | Minimum adapter submission ticket leak count is zero |
| `R9AP1-P418` | Minimum adapter mapped buffer leak count is zero |
| `R9AP1-P419` | Minimum adapter device loss recovery passes at least once |
| `R9AP1-P420` | Minimum adapter post-loss first job is sampled |
| `R9AP1-P421` | Minimum adapter post-loss parity passes |
| `R9AP1-P422` | Minimum adapter residency bounded run closes |
| `R9AP1-P423` | Minimum adapter unsupported timestamp-query is reported as UNSUPPORTED not inferred |
| `R9AP1-P424` | Minimum adapter does not contribute canonical performance thresholds when timestamp-query unsupported |
| `R9AP1-P425` | Minimum adapter feature set is recorded |
| `R9AP1-P426` | Minimum adapter limits are recorded |
| `R9AP1-P427` | Minimum adapter driver identity is recorded |
| `R9AP1-P428` | Minimum adapter no-silent-fallback is observed |
| `R9AP1-P429` | Minimum adapter child receipt is valid |
| `R9AP1-P430` | Declared minimum support is withdrawn if compatibility run fails |
### FINAL_PHYSICAL_SEAL

| Gate | Requirement |
|---|---|
| `R9AP1-P431` | All packaged environment gates pass |
| `R9AP1-P432` | All primary adapter gates pass |
| `R9AP1-P433` | All Preview product graph gates pass |
| `R9AP1-P434` | All Export product graph gates pass |
| `R9AP1-P435` | All validation fault gates pass |
| `R9AP1-P436` | All uniform ring and fence gates pass |
| `R9AP1-P437` | All timestamp performance gates pass |
| `R9AP1-P438` | All residency gates pass |
| `R9AP1-P439` | All device loss gates pass |
| `R9AP1-P440` | All minimum adapter gates pass |
| `R9AP1-P441` | All child receipts are present |
| `R9AP1-P442` | All child receipt self-hashes are valid |
| `R9AP1-P443` | All child receipts bind one run challenge |
| `R9AP1-P444` | All child receipts bind one packageContentId |
| `R9AP1-P445` | All primary child receipts bind one adapter identity |
| `R9AP1-P446` | No source mock receipt is admitted |
| `R9AP1-P447` | No summary-only child receipt is admitted |
| `R9AP1-P448` | Finalizer recomputes encoder count |
| `R9AP1-P449` | Finalizer recomputes submit count |
| `R9AP1-P450` | Finalizer recomputes fence count |
| `R9AP1-P451` | Finalizer recomputes map count |
| `R9AP1-P452` | Finalizer recomputes validation counters |
| `R9AP1-P453` | Finalizer recomputes controlled fault outcomes |
| `R9AP1-P454` | Finalizer recomputes uniform state transitions |
| `R9AP1-P455` | Finalizer recomputes ticket settlements |
| `R9AP1-P456` | Finalizer recomputes performance medians |
| `R9AP1-P457` | Finalizer recomputes performance p95 |
| `R9AP1-P458` | Physical finalizer recomputes every residency slope from raw samples |
| `R9AP1-P459` | Finalizer recomputes device epoch sequence |
| `R9AP1-P460` | Finalizer verifies Preview product entry path |
| `R9AP1-P461` | Finalizer verifies Export product entry path |
| `R9AP1-P462` | Finalizer verifies Build Lock R2 lineage |
| `R9AP1-P463` | Finalizer verifies package byte immutability |
| `R9AP1-P464` | Finalizer verifies pointer immutability |
| `R9AP1-P465` | Finalizer verifies zero historical pass carry-forward |
| `R9AP1-P466` | Physical final receipt state is exact |
| `R9AP1-P467` | Physical final receipt counts are 360 source and 480 physical |
| `R9AP1-P468` | Physical final receipt pending count is zero |
| `R9AP1-P469` | Physical final receipt deferred count is zero |
| `R9AP1-P470` | Physical final receipt skipped count is zero |
| `R9AP1-P471` | Physical final receipt fail count is zero |
| `R9AP1-P472` | Physical final receipt self-hash is valid |
| `R9AP1-P473` | Physical verifier replays all raw evidence |
| `R9AP1-P474` | R10A replay-required receipt is emitted |
| `R9AP1-P475` | R11A through R14A remain replay-required |
| `R9AP1-P476` | No Production Pointer mutation occurs |
| `R9AP1-P477` | No Local Activation Pointer mutation occurs |
| `R9AP1-P478` | Final open resource count is zero |
| `R9AP1-P479` | Final open ticket count is zero |
| `R9AP1-P480` | R9A P1 final state awaits R10A replay |

# 20. Negative-Control Minimum Set

- Build Lock R2 source receipt를 final로 위장
- dev server를 packaged execution으로 위장
- software adapter를 D3D12 hardware로 위장
- harness가 low-level function을 직접 import
- graph receipt encoderCount를 1로 조작
- queue submit event 하나 삭제
- hidden compatibility submit 추가
- Preview에서 onSubmittedWorkDone 호출
- Export terminal map 전 queue fence 호출
- validation readback 누락을 zero로 처리
- controlled fault counter를 임의 JSON으로 작성
- fault output을 Preview에 publish
- fault output을 Export save로 전달
- uniform IN_FLIGHT slot overwrite
- rejectEpoch 후 completion을 COMPLETE로 전환
- old completion이 new epoch slot reclaim
- timestamp raw ticks 없이 wall clock 사용
- baseline과 candidate package bytes 다름
- performance sample 배열 요약값만 제출
- residency leak count 0 요약값만 제출
- memory anomaly sample 제거
- device loss cycle 건너뛰기
- old device pipeline 재사용
- GTX 950M 실패를 silent support로 유지
- child receipt 하나를 다른 run에서 혼합
- Production Pointer mutation
- Local Activation Pointer mutation
- R10A current receipt carry-forward

# 21. Deliverables

```text
TDT_RESAMPLE_RUNTIME_01_R9A_P1_SOURCE_FINAL_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R9A_P1_PHYSICAL_FINAL_RECEIPT.json
R9AP1_PRODUCT_GRAPH_EVENT_LEDGER.jsonl
R9AP1_VALIDATION_COUNTER_RAW_MANIFEST.json
R9AP1_TIMESTAMP_RAW_SAMPLE_MANIFEST.json
R9AP1_RESIDENCY_RAW_SAMPLE_MANIFEST.json
R9AP1_DEVICE_LOSS_EPOCH_LEDGER.jsonl
R9AP1_PREVIEW_E2E_RECEIPT.json
R9AP1_EXPORT_E2E_RECEIPT.json
R9AP1_MINIMUM_ADAPTER_RECEIPT.json
R9AP1_DOWNSTREAM_INVALIDATION_RECEIPT.json
```

# 22. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R10A-R1

Build Lock R2 + R9A-P1 Evidence Replay /
Dual Clean Production Candidate Rebuild /
Production Pointer CAS /
Rollback·Repromotion Drill /
R11A·R12A·R13A·R14A Lineage Restoration Seal
```
