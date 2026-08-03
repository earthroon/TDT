# TDT-QMAP-STREAMING-REDUCTION-03G-R5

## Packaged Cancellation and Single-Flight Physical Closure / Queued Cancellation / Joined-Waiter Isolation / All-Waiter Pre-Submit Abort / Middle-Chunk Fence Drain / Final-Fence Cancellation / Fresh Replay Generation / No Partial Publication / Zero Private Resource Leak Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R5
Short ID = QSR03G-R5
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R4
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

Required parent source state:

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R4_PACKAGED_4K_CORE_AUTHORITY_7854_WINDOW_PLAN_EIGHTEEN_CHUNK_SUBMISSION_GRAPH_QUALIFICATION_READBACK_CPU_F64_QMAP01_ORACLE_FENCE_COVERED_COMPACT_COMPLETION_AUTHENTIC_ANALYSIS_PUBLICATION_REFERENCE_COUNTED_FIELD_PINS_FIVE_CYCLE_RESOURCE_LEDGER_THIRTY_TWO_WAY_WARM_SHARING_NO_PRODUCT_PROMOTION_AWAITING_PACKAGED_4K_PHYSICAL_EXECUTION
```

R5 physically validates cancellation and fresh replay against the live packaged 4K QSR03 composition. It may consume R2 named evidence and R4 live execution authority. It may not issue a promotion trial permit, final physical admission, product promotion permit, or global QSR03 product route.

## 1. Authority correction

A single `abortRequested` boolean is not sufficient cancellation authority. R5 introduces a monotonic cancellation epoch bound to the first accepted cancellation reason, causal waiter transition, job state, chunk, submission, hook and receipt lineage.

Waiter cancellation and shared-job cancellation are separate:

```text
waiter authority = caller-local state only
shared job authority = waiter set, live count, execution promise and cancellation epoch
shared cancellation = atomic live waiter transition 1 → 0
```

Cancellation is rechecked after invocation assembly and before chunk-zero work. The live QSR03F loop observes cancellation at every new-work, post-submit, post-fence, readback and publication boundary.

`cancelInvocation()` requests cancellation only. One terminalizer owns fence drain, Analysis abort, unpublished target destruction, Final EWA retirement, arena disposal, device-lease release, receipt sealing and final single-flight removal.

Candidate Analysis execution and field publication commit atomically. Cancellation before commit lock creates neither execution admission nor field. Cancellation after commit lock cannot roll back a committed publication.

Queued cancellation rejects with a stable cancellation result. It never resolves a successful promise with `undefined` and never creates an invocation.

## 2. State ownership and SSOT

### Waiter

```text
ATTACHED → CANCEL_REQUESTED → CANCELLED
ATTACHED → DELIVERY_PENDING → RESOLVED
ATTACHED → REJECTED
```

A waiter does not own GPU disposal, shared cancellation, publication rollback or single-flight removal.

### Shared cold job

The shared-job authority owns logical key, job ID and generation, leader operation, FIFO entry, waiter set/live count, current attempt, shared promise, cancellation epoch and terminal state.

### Invocation

Each invocation attempt owns one cancellation authority. The runtime receives a read-only capability and cannot clear or decrement the epoch.

### Fence

Submitted work belongs to the submission authority and completion ticket. Cancellation cannot revoke submitted work. It must drain the current real fence, suppress new work and semantic commitment, then terminalize.

### Publication

Before Analysis commit lock, cancellation may veto publication. After commit, publication remains stable and caller cancellation only releases caller pins.

## 3. Authorities and schemas

```text
cancellationEpochAuthorityId = dadum.qmap.cancellation-epoch-authority.qsr03g-r5
waiterCancellationAuthorityId = dadum.qmap.waiter-cancellation-authority.qsr03g-r5
jobCancellationAuthorityId = dadum.qmap.shared-job-cancellation-authority.qsr03g-r5
runtimeCancellationCheckpointAuthorityId = dadum.qmap.runtime-cancellation-checkpoint-authority.qsr03g-r5
fenceDrainAuthorityId = dadum.qmap.cancellation-fence-drain-authority.qsr03g-r5
terminalizerAuthorityId = dadum.qmap.invocation-terminalizer-authority.qsr03g-r5
atomicPublicationAuthorityId = dadum.qmap.atomic-candidate-publication-authority.qsr03g-r5
cancellationReplayAuthorityId = dadum.qmap.cancellation-replay-authority.qsr03g-r5
cancellationEvidenceAuthorityId = dadum.qmap.packaged-cancellation-evidence-authority.qsr03g-r5
faultPermitAuthorityId = dadum.qmap.cancellation-fault-permit-authority.qsr03g-r5
```

```text
tdt.qmap.waiter-cancellation-receipt.qsr03g-r5.v1
tdt.qmap.job-cancellation-intent.qsr03g-r5.v1
tdt.qmap.runtime-cancellation-observation.qsr03g-r5.v1
tdt.qmap.cancellation-fence-drain.qsr03g-r5.v1
tdt.qmap.cancellation-terminal-receipt.qsr03g-r5.v1
tdt.qmap.cancellation-replay-receipt.qsr03g-r5.v1
tdt.qmap.atomic-publication-transaction.qsr03g-r5.v1
tdt.qmap.cancellation-resource-balance.qsr03g-r5.v1
tdt.qmap.packaged-cancellation-physical-receipt.qsr03g-r5.v1
tdt.qmap.packaged-cancellation-merkle.qsr03g-r5.v1
```

## 4. Shared-job state machine

```text
QUEUED
→ PREPARING
→ READY_BEFORE_FIRST_SUBMIT
→ RECORDING_CHUNK
→ SUBMISSION_PENDING
→ FENCE_PENDING
→ BETWEEN_CHUNKS
→ FINAL_FENCE_COMPLETED
→ PUBLICATION_PENDING
→ PUBLICATION_COMMITTED
→ COMPLETED
```

Cancellation branches:

```text
QUEUED → QUEUED_CANCELLED
PREPARING/READY → PRE_SUBMIT_CANCEL_REQUESTED → CANCELLED_TERMINAL
RECORDING_CHUNK → UNSUBMITTED_CANCEL_REQUESTED → CANCELLED_TERMINAL
SUBMISSION_PENDING/FENCE_PENDING → FENCE_DRAIN_CANCEL_REQUESTED → CANCELLED_TERMINAL
BETWEEN_CHUNKS → BETWEEN_CHUNKS_CANCEL_REQUESTED → CANCELLED_TERMINAL
FINAL_FENCE_COMPLETED → PRE_PUBLICATION_CANCEL_REQUESTED → CANCELLED_TERMINAL
```

A canceled invocation never resumes. A later request creates a fresh generation.

## 5. Cancellation epoch and checkpoints

Per attempt:

```text
initial epoch = 0
first accepted shared cancellation = 1
later requests = recorded but non-authoritative
```

Exactly 16 runtime checkpoints are authoritative:

```text
CP00 before invocation resource allocation
CP01 after invocation assembly, before chunk zero
CP02 before chunk lease acquisition
CP03 after chunk lease acquisition
CP04 after command recording
CP05 after encoder finish
CP06 immediately before queue.submit
CP07 immediately after queue.submit
CP08 after completion ticket creation
CP09 after authoritative fence completion
CP10 after canceled-fence terminalization
CP11 before next chunk
CP12 after final fence
CP13 before qualification readback mapping
CP14 before atomic Analysis publication
CP15 after publication transaction
```

At CP00-CP06, cancellation prohibits a submit. At CP07-CP08, it requires fence drain. At CP09, the submitted range becomes `CANCELLED_AFTER_FENCE` and does not become reusable compact/source progress. Cancellation before CP14 creates no Analysis or warm state.

## 6. Fence-drain and terminalization

Unsubmitted cancellation creates no submit, fence or normal chunk receipt. An unsubmitted encoder and lease are discarded/retired without entering submitted state.

Submitted cancellation follows:

```text
queue.submit
→ completion ticket
→ cancellation observation
→ RETIRING_AFTER_FENCE
→ real fence completion
→ drain receipt
→ compact range CANCELLED_AFTER_FENCE
→ no source-cursor advancement
→ terminalizer
```

The submitted range is physical work but semantically abandoned. Arena generation is not reused as progress.

Every invocation owns one terminalization promise. Duplicate internal terminal requests join it. The R1 compatibility API continues to reject a second explicit disposal call.

Unpublished cleanup order:

```text
prevent new submits
discard encoder or drain current fence
seal drain receipt
abort Analysis transaction and build lease
destroy unpublished QMap and compact targets
retire Final EWA source and replay delivery
dispose arena
release device lease and observers
seal terminal resource receipt
remove single-flight entry
```

## 7. Atomic candidate publication

```text
PREPARED
→ CANCELLATION_CHECKED
→ COMMIT_LOCKED
→ EXECUTION_AND_FIELD_COMMITTED
```

Execution receipt, field reference, publication receipt, field generation and resource binding commit together. There is no externally visible execution-only state.

A precommit cancellation leaves execution admissions and publications at zero. A postcommit zero-waiter condition inserts no warm entry or caller pin and requests immediate field retirement.

## 8. Physical fixture matrix

### QJ: queued cancellation and joined-waiter isolation

Job A has one leader and three joiners. One joiner cancels. Job B is canceled while queued. Sentinel C follows B.

```text
A submissions/fences = 18/18
B submissions/fences = 0/0
C submissions/fences = 18/18
successful publications = 2
A cold executions = 1
A canceled joiner deliveries/pins = 0/0
FIFO execution order = A, C
```

All unused joiner capabilities and B's queued capability retire once.

### AP: all-waiter pre-submit abort

One leader and two joiners pause after invocation assembly. All cancel before chunk zero.

```text
submissions/fences = 0/0
Analysis admissions/publications = 0/0
warm entries/pins = 0/0
terminal private resource balance = 0
```

### MD: middle-fence cancellation and replay

Cancellation targets chunk 8, submission 9, after real submit and before fence consumption.

```text
canceled phase submissions/fences = 9/9
normally committed chunks = 8
fence-drained canceled submissions = 1
chunk 9/projection/readback/publication = absent
```

Fresh generation 2 replay begins at chunk 0 and completes 18 submissions/fences and one publication. Fixture total is 27/27.

### FF: final-fence cancellation and replay

Cancellation targets chunk 17, submission 18, after real submit and before fence consumption.

```text
canceled phase submissions/fences = 18/18
normally committed chunks = 17
fence-drained canceled submissions = 1
final projection physically submitted = true
QMap publication eligible = false
readback maps = 0
Analysis admissions/publications = 0/0
```

Fresh replay starts at chunk 0 and completes 18 submissions/fences and one publication. Fixture total is 36/36.

Aggregate expected physical workload:

```text
real queue submissions = 99
real completion fences = 99
successful Analysis publications = 4
canceled-operation Analysis publications = 0
```

## 9. Fresh replay generation

Replay preserves semantic request identity while replacing request operation, job ID/generation, attempt ID, physical Final EWA resource/receipt, arena, compact target, QMap target, Analysis lease and receipt-chain seed.

Replay attempt ordinal is 0 because it is a new cold job, not device-loss attempt 1. It starts at chunk 0, window base 0 and arena generation 0. No old compact progress, source cursor, chunk receipt or execution promise is reused.

## 10. No partial publication and leak closure

Every canceled job before publication commit has:

```text
Analysis admissions/publications = 0/0
field references/pins = 0/0
warm entries/delivery receipts = 0/0
qmapHandle exposure = 0
```

After terminalization:

```text
operation-private GPUBuffer count = 0
operation-private GPUTexture count = 0
active arena/compact/unpublished-QMap count = 0
active Final EWA capability count = 0
active completion ticket count = 0
active encoder/command-buffer reference count = 0
active Analysis lease and field-pin count = 0
```

Root shader, pipeline, readback and bridge resources remain stable until root shutdown.

## 11. Fault permits

Physical injection uses a Main-issued, one-shot permit bound to run, fixture, job/generation, hook, expected chunk/submission/waiters/job state, device epoch, package content, process, nonce and expiry.

Admitted hooks:

```text
R5_QUEUED_ENTRY_ATTACHED
R5_AFTER_INVOCATION_BEFORE_FIRST_SUBMIT
R5_AFTER_SUBMIT_BEFORE_FENCE_WAIT
R5_AFTER_FINAL_SUBMIT_BEFORE_FENCE_WAIT
```

Middle/final injection is consumed synchronously in the renderer immediately after real submit and before fence await.

## 12. L001-L056 evidence boundary

R5 uses a separate 56-gate qualification namespace:

```text
L001-L008 authority, isolation and fault permits
L009-L016 queued cancellation and FIFO continuity
L017-L024 single-flight and joined-waiter isolation
L025-L032 all-waiter pre-submit abort
L033-L040 middle-fence cancellation
L041-L048 final-fence cancellation
L049-L056 fresh replay, aggregate counts, zero leaks and no promotion
```

Exact key facts include queued submit 0, joined shared execution 18 submits, pre-submit abort 0 submits/fences, middle cancellation 9/9, final cancellation 18/18, replay from chunk zero, aggregate 99/99, and no P receipt/admission/promotion permit.

Later R2 P017-P020 and P065-P072 executors may independently consume R5 evidence. R5 itself cannot create P receipts or promotion authority.

## 13. Source gate and mutant matrices

```text
Source Gates = 288
Negative controls = 120
Physical L gate definitions = 56
Runtime checkpoints = 16
Fixture groups = 4
```

Source gates are partitioned into 18 groups of 16:

```text
identity and boundaries
waiter ownership
shared job authority
runtime checkpoints
queued cancellation
joined-waiter isolation
all-waiter pre-submit abort
unsubmitted cancellation
middle fence drain
final fence cancellation
atomic publication
terminalizer
replay generation
no partial publication
fault permits and orchestration
resource ledger
R2 evidence integration
completion and parent regressions
```

Negative controls cover epoch corruption, missing checkpoints, queued work, cross-waiter cancellation, pre-submit work after zero waiters, pre-fence destruction, wrong hook/counts, partial Analysis state, duplicate terminalizers, old-resource/progress replay, forged permits, leaks, L/P tree mixing and false promotion claims.

## 14. Required implementation surfaces

R5 adds legacy runtime modules for contract, cancellation epoch, waiter/job authorities, checkpoints, fence drain, terminalizer, atomic publication, replay generation and fixture coordination.

Parent runtime modifications bind R5 into product bridge, FIFO/single-flight, runtime coordinator, arena/compact/Final EWA state, candidate Analysis/publication, invocation disposal and warm path.

Electron/renderer tooling provides packaged cancellation Main service, isolated BrowserWindow, typed IPC, one-shot permits, exact allowlist, L registry/evidence/finalizer and QJ/AP/MD/FF runners.

## 15. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R5_WAITER_AND_SHARED_JOB_CANCELLATION_SEPARATED_MONOTONIC_CANCELLATION_EPOCH_PRE_SUBMIT_ABORT_FENCE_DRAIN_TERMINALIZATION_ATOMIC_ANALYSIS_PUBLICATION_SINGLE_INVOCATION_TERMINALIZER_FRESH_CHUNK_ZERO_REPLAY_NO_PARTIAL_PUBLICATION_ZERO_PRIVATE_RESOURCE_LEAK_AUTHORITY_NO_PRODUCT_PROMOTION_AWAITING_PACKAGED_CANCELLATION_PHYSICAL_EXECUTION
```

Required source facts:

```text
Source Gates = 288/288
Negative controls = 120/120
Physical cancellation gates = 56 definitions
Runtime checkpoints = 16
Fixture groups = 4
Source-simulation submissions/fences = 99/99
Successful publications = 4
Canceled-operation publications = 0
Physical L gates executed = 0/56
R2 P gates executed = 0/96
Trial permit artifacts = 0
Physical admission artifacts = 0
Product permit artifacts = 0
Product promotion = false
QRC02 product route = unchanged
```

## 16. Physical completion state

```text
PACKAGED_CANCELLATION_PHYSICAL_BAKED_QMAP_STREAMING_REDUCTION_03G_R5_QUEUED_CANCEL_ZERO_WORK_JOINED_WAITER_ISOLATED_ALL_WAITER_PRE_SUBMIT_ABORT_MIDDLE_CHUNK_FENCE_DRAIN_FINAL_FENCE_CANCEL_NO_PUBLICATION_FRESH_CHUNK_ZERO_REPLAY_ATOMIC_PUBLICATION_BOUNDARY_ZERO_PRIVATE_RESOURCE_LEAK_GLOBAL_QRC02_BRIDGE_UNCHANGED_NO_PRODUCT_PROMOTION
```

Required physical facts later:

```text
L gates = 56/56
real submissions/fences = 99/99
queued canceled submissions = 0
all-waiter pre-submit submissions = 0
middle-canceled submissions = 9
final-canceled submissions = 18
successful replay submissions = 36
canceled-operation publications = 0
successful publications = 4
terminal private resource balance = 0
WebGPU validation errors = 0
product promotion = false
```

## 17. Package policy

The code ZIP contains R5 authorities, parent bindings, four fixture runners, L001-L056 evidence, source validators and physical launcher/verifier. It excludes this specification, L/P receipts, Merkle artifacts, trial permit, physical admission, product permit, reports, logs, temporary evidence, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 18. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R6

Packaged One-Restart Device-Loss Physical Closure /
Main One-Shot Loss Permit /
Middle-Chunk Device Loss /
Old-Epoch Resource Invalidation /
Replacement Adapter and Device Acquisition /
Final EWA Rebuild /
Chunk-Zero Restart /
Live Waiter Preservation /
Second-Loss Terminal Failure /
No Product Promotion Yet Seal
```

## 19. Final seal

```text
Cancellation belongs first to a waiter.
A shared job is canceled only when live waiter count reaches zero.
That transition creates one monotonic cancellation epoch.

Before submission, cancellation prevents new GPU work.
After submission, the exact real fence drains before resources retire.
A drained chunk is physical work but not reusable semantic progress.

Cancellation before Analysis commit creates no execution, field, pin or warm entry.
Execution and publication commit atomically.
One terminalizer owns all unsuccessful cleanup.

Queued cancellation creates no invocation.
Joined-waiter cancellation affects one caller.
All-waiter pre-submit cancellation submits nothing.
Middle and final cancellation drain the in-flight fence.
Fresh replay creates a new generation and starts from chunk zero.

R5 emits qualification evidence only.
It creates no admission or product promotion authority.
The global QRC02 bridge remains unchanged.
```
