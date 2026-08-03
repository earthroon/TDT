# TDT-QMAP-STREAMING-REDUCTION-03G

## Cold-Operation FIFO / Duplicate Request Single-Flight / Warm Promise Sharing / QRC02-to-QSR03 Product Route Promotion / Streaming Receipt Publication Parity / EFC End-to-End Convergence / Cancellation Replay / Device-Loss Recovery / Packaged 4K-8K Physical Seal

## 0. Document identity

```text
Patch ID
= TDT-QMAP-STREAMING-REDUCTION-03G

Short ID
= QSR03G

Parent patch
= TDT-QMAP-STREAMING-REDUCTION-03F

Umbrella patch
= TDT-QMAP-STREAMING-REDUCTION-03

Required parent state
= SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03F_CANONICAL_COMPACT_V2_ONE_SUBMISSION_PER_CHUNK_ALL_FENCES_COMPLETED_FINAL_CHUNK_QMAP_PROJECTED_MULTI_SUBMISSION_RECEIPT_SEALED_ATOMIC_ANALYSIS_PUBLICATION_BOUND_AWAITING_PRODUCT_PROMOTION_AND_PHYSICAL_03G

Specification state
= SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03G is the terminal product-promotion patch for QSR03. It turns the source-baked QSR03A through QSR03F execution path into a product-route candidate, adds the single product runtime authority, and supplies the packaged physical qualification harness required before promotion.

QSR03G may promote QSR03 only after packaged physical parity proves:

```text
QMAP01 output parity
submission-count parity
publication receipt authenticity
resource plateau
cancellation safety
device-loss recovery
4K completion
8K completion
EFC consumer convergence
```

QSR03G source bake does not claim physical completion and does not generate a product promotion permit.

---

# 1. Existing runtime authority and replacement boundary

The existing product entrypoint is:

```text
serviceId
= dadum.runtime.qmap-runtime-coordinator

bridgeKey
= __DADUM_QMAP_RUNTIME_BRIDGE__

publicMethod
= ensureQMapForConvergence
```

The service ID, global bridge key, public method, QMap semantic ID, producer ID, format, and coordinate space remain stable.

QSR03G replaces the implementation behind that authority only after a valid physical promotion permit is admitted. It does not install a second bridge beside QRC02.

```text
before physical promotion
= QRC02 product route active
= QSR03G candidate route qualification-only

after physical promotion
= QSR03G canonical product route
= QRC02 qualification oracle only
```

The following are forbidden:

```text
QRC02 and QSR03G active under the same bridge key
silent QRC02 fallback after QSR03 failure
caller-selected QMap implementation
runtime-selected fallback from validation or device-loss failure
```

---

# 2. Dual completion and promotion states

## 2.1 Source-baked candidate

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_COLD_FIFO_DUPLICATE_SINGLE_FLIGHT_BOUNDED_WARM_PROMISE_CANCELLATION_REPLAY_ONE_RESTART_DEVICE_RECOVERY_ROUTE_RECEIPT_PARITY_EFC_CONVERGENCE_BOUND_PACKAGED_PHYSICAL_READY_AWAITING_PHYSICAL_ADMISSION
```

This state proves source closure only.

## 2.2 Physical admission

```text
PHYSICAL_BAKED_QMAP_STREAMING_REDUCTION_03G_QMAP01_PARITY_SUBMISSION_PARITY_RECEIPT_AUTHENTICITY_RESOURCE_PLATEAU_CANCELLATION_SAFE_DEVICE_LOSS_RECOVERED_4K_8K_COMPLETED_EFC_CONVERGED_PRODUCT_PROMOTION_PERMIT_SEALED
```

## 2.3 Product promotion

```text
PRODUCT_PROMOTED_QMAP_STREAMING_REDUCTION_03G_QSR03_CANONICAL_RUNTIME_ROUTE_QRC02_QUALIFICATION_ONLY_NO_SILENT_FALLBACK_FINAL_SEAL
```

Source gates cannot mint physical admission or product promotion claims.

---

# 3. Runtime identities

```text
serviceId
= dadum.runtime.qmap-runtime-coordinator

bridgeKey
= __DADUM_QMAP_RUNTIME_BRIDGE__

bridgeSchemaId
= tdt.qmap.runtime-bridge.qsr03g.v1

runtimeAuthorityId
= dadum.qmap-runtime-authority.qsr03g

fifoAuthorityId
= dadum.qmap-cold-operation-fifo.qsr03g

singleFlightAuthorityId
= dadum.qmap-single-flight-authority.qsr03g

warmPromiseAuthorityId
= dadum.qmap-warm-promise-authority.qsr03g

recoveryAuthorityId
= dadum.qmap-device-loss-recovery-authority.qsr03g

routeReceiptAuthorityId
= dadum.qmap-route-receipt-authority.qsr03g

promotionAuthorityId
= dadum.qmap-product-promotion-authority.qsr03g

physicalAuthorityId
= dadum.qmap-packaged-physical-authority.qsr03g

runtimeClosureReceiptSchemaId
= tdt.qmap.runtime-closure-receipt.qsr03g.v1

deliveryReceiptSchemaId
= tdt.qmap.runtime-delivery-receipt.qsr03g.v1

recoveryReceiptSchemaId
= tdt.qmap.device-loss-recovery-receipt.qsr03g.v1

promotionPermitSchemaId
= tdt.qmap.product-promotion-permit.qsr03g.v1

physicalAdmissionSchemaId
= tdt.qmap.physical-admission-receipt.qsr03g.v1
```

---

# 4. Product request contract

```ts
ensureQMapForConvergence(
  request: QMapRuntimeRequestQsr03g
): Promise<QMapRuntimeDeliveryQsr03g>
```

Required request identity:

```text
operationId
sourceSurfaceId
sourceRevision
sourceWidth
sourceHeight
outputWidth
outputHeight
runtimeEpoch
deviceEpoch
deviceIdentityDigest
finalEwaActualIdentityDigest
finalEwaDescriptorDigest
lowpassReceiptDigest
maxBufferSize
maxStorageBufferBindingSize
Final EWA capability
cancellation capability
```

Caller-provided QMap textures, spatial/frequency/power buffers, compact targets, arenas, queues, command encoders, pipelines, bind groups, receipts, or promotion permits are rejected.

Delivery dispositions:

```text
COLD_LEADER
JOINED_COLD
WARM_SHARED
RECOVERED_COLD_LEADER
JOINED_RECOVERY
```

A joined or warm caller reports zero caller-owned submissions. The cold leader reports the actual QSR03 chunk submission count.

---

# 5. Request identity keys

## 5.1 Logical single-flight key

```text
logicalKey
= digest(
    sourceSurfaceId,
    sourceRevision,
    sourceWidth,
    sourceHeight,
    outputWidth,
    outputHeight,
    runtimeEpoch,
    Final EWA actual identity,
    Final EWA descriptor,
    lowpass receipt,
    periodic-Hann profile,
    QSR03 plan ABI,
    compact-v2 ABI,
    QMap projection ABI
  )
```

The logical key excludes operation ID, waiter ID, cancellation identity, device epoch, and device identity. This permits duplicate joining and one controlled device-loss restart.

## 5.2 Device execution key

```text
deviceExecutionKey
= digest(
    logicalKey,
    deviceEpoch,
    deviceIdentityDigest,
    physical device-profile digest,
    promotion permit digest
  )
```

Warm entries use the device execution key. Active cold single-flight jobs use the logical key.

A duplicate or warm request with an unused incoming Final EWA capability must retire that capability through the Final EWA authority.

---

# 6. Cold-operation FIFO

The FIFO is the SSOT for:

```text
next enqueue ordinal
active cold job ID
queued job order
cold start order
cold terminal order
```

States:

```text
ENQUEUED
-> HEAD_READY
-> STARTING
-> RUNNING
-> FENCE_DRAINING
-> PUBLISHED
-> COMPLETED
```

Failure states:

```text
CANCELLED_BEFORE_START
CANCELLED_DURING_RUN
DEVICE_LOST_RETRY_PENDING
FAILED
```

Invariants:

```text
maximum active distinct cold operations = 1
maximum active QSR03B arenas = 1
maximum active QSR03 chunk submissions = 1
```

Distinct cold jobs start strictly by enqueue ordinal. Warm hits and duplicate joins create no FIFO entry. A recovering job retains its original FIFO head position.

When all waiters cancel while queued, the entry is removed before plan, arena, Analysis lease, target, or submission-sequence allocation.

---

# 7. Duplicate-request single-flight

```text
activeJobs
= Map<logicalKey, QMapColdJobQsr03g>
```

One logical key owns one shared execution promise. Every caller owns a separate waiter record and delivery promise.

A duplicate joiner:

```text
creates no FIFO entry
creates no plan or arena
creates no compact or QMap target
opens no Analysis build lease
submits no GPU work
cannot mutate another waiter's cancellation state
```

One waiter cancellation does not cancel the shared operation while another live waiter remains.

Terminal rejected or cancelled promises are removed and never reused. A later request may start a fresh job. A caller may rejoin an existing still-live operation after its previous waiter was cancelled.

---

# 8. Warm promise sharing

```text
warmIndex
= Map<deviceExecutionKey, QMapWarmEntryQsr03g>

maximum entries
= 64
```

Warm entries contain metadata only:

```text
logical key
device key
Analysis field handle
QSR03 runtime closure receipt
streaming receipt digest
field descriptor digest
field execution receipt digest
promotion permit digest
last-access ordinal
resolved published promise
```

Warm entries do not own or pin private GPU resources. Analysis Field Authority remains the resource owner.

Before warm delivery, the bridge verifies handle currency, source/revision, device epoch/identity, semantic/producer, claim level, execution receipt, streaming receipt, and promotion permit digest.

A warm delivery performs:

```text
GPU submissions = 0
GPU allocations = 0
Analysis publications = 0
Final EWA consumption = 0
```

Stale entries are evicted first, then least-recently-used metadata entries.

---

# 9. Cold invocation construction

The canonical product bridge owns:

```text
QSR03A plan
QSR03B arena
QSR03C Final EWA source capability
QSR03E compact target
QSR03F QMap target
encoder factory
Stockham pipelines
power pipelines
projection pipeline
Analysis build lease
cancellation bridge
device-loss bridge
```

The product call path invokes QSR03F once for each cold execution attempt.

Attempt identity binds:

```text
jobId
attemptOrdinal
logicalKey
deviceExecutionKey
leaderOperationId
deviceEpoch
deviceIdentityDigest
enqueueOrdinal
```

Attempt zero may consume the request Final EWA capability. Recovery attempts require a fresh Final EWA capability from the replay authority.

---

# 10. QSR03F receipt v2 closure

QSR03G promotes the source receipt lineage to product-route lineage.

```text
chunk submission record
= tdt.qmap.chunk-submission-record.qsr03f.v2

streaming receipt
= tdt.qmap.streaming-runtime-receipt.qsr03f.v2
```

Chunk records additionally bind extraction, Stockham, power-reduction, compact-handoff, and final-projection digests.

The streaming receipt additionally binds aggregate digests for:

```text
window extraction
Stockham execution
power reduction
compact scatter
final projection
Analysis execution
```

The QSR03G runtime closure receipt binds source/Final EWA lineage, plan/window profile, all stage receipt digests, QSR03F streaming receipt, Analysis execution receipt, field descriptor, chunk and submit counts, recovery lineage, zero fallback/readback counters, and promotion permit digest.

Each caller receives a separate delivery receipt. Joined and warm deliveries bind the existing cold closure receipt and do not fabricate another GPU execution or publication.

---

# 11. Publication receipt authenticity

Required digest chain:

```text
QSR03F streaming receipt
-> Analysis streaming execution admission
-> Analysis field execution receipt
-> Analysis field descriptor
-> QSR03G runtime closure receipt
-> caller delivery receipt
```

No caller-provided hash may enter this chain as authority evidence.

Multiple physical chunk submissions remain represented as ordered multi-submission evidence. They may not be collapsed into one synthetic submission.

---

# 12. Cancellation and replay

Cancellation authority is waiter-scoped.

When one waiter cancels:

```text
other waiters remain attached
shared execution continues when still demanded
shared resources remain owned by the job
```

When all waiters cancel before start:

```text
queue entry removed
GPU work = 0
plan/arena/targets/Analysis lease = not allocated
```

When all waiters cancel during execution:

```text
no next chunk admitted
unsubmitted encoder discarded
submitted chunk fence-drained
no QMap publication
no warm entry
private resources destroyed after safe retirement
```

Cancellation after successful publication does not invalidate the published Analysis field, but the cancelled waiter receives no delivery.

A replay after terminal cancellation uses a new waiter, job generation, attempt lineage, and fresh private targets. Partial targets or terminal promises are never reused.

---

# 13. Device-loss recovery

```text
maximum automatic restart count per cold job
= 1
```

Only an authority-classified device-loss failure is retryable. Validation, ABI, arithmetic, receipt, publication, or semantic failures are not reclassified as device loss.

Recovery sequence:

```text
1 invalidate old attempt
2 stop chunk admission
3 drain or invalidate pending ticket
4 abort old Analysis lease
5 destroy old arena
6 destroy old compact target
7 destroy old private QMap target
8 retire old Final EWA capability
9 invalidate old-epoch warm entries
10 reacquire device and epoch
11 rebuild Final EWA
12 create fresh QSR03A plan
13 create fresh QSR03B arena
14 create fresh compact and QMap targets
15 open fresh Analysis build lease
16 restart at chunk zero
17 begin a new receipt chain
```

The recovering job remains FIFO head. Existing live waiters remain attached. Duplicates arriving during recovery join the same logical job.

A second device loss exhausts the recovery budget and terminates the operation.

---

# 14. Product route promotion

Product boot uses one route selector:

```text
valid physical promotion permit
-> install QSR03G under __DADUM_QMAP_RUNTIME_BRIDGE__

missing or invalid permit after promotion-required build
-> fail QMap route admission
```

After promotion, QRC02 is retained only as a qualification oracle or explicit developer diagnostic. Runtime validation failure, device limits, cancellation, device loss, or publication failure do not switch to QRC02.

Device admission requires WebGPU, rgba16float storage texture support, required 2D dimensions and compute limits, QSR03A 64 MiB planning admission, packaged QSR03 shaders/ABIs, and a matching promotion permit device profile.

---

# 15. EFC end-to-end convergence

The required consumer chain is:

```text
Final EWA
-> QSR03 product bridge
-> QSR03F Analysis Field publication
-> Bakemono Rinne canonical field-set acquisition
-> QMap field pin
-> QWave field pin
-> EFC graph binding
-> converged final surface
-> Surface Registry publication
```

Required QMap field:

```text
semanticId = tdt.analysis.qmap.normalized-response.v1
producerId = tdt.analysis.producer.qmap.normalized-response
format = rgba16float
coordinateSpace = output-pixel
claimLevel = EFFECTIVE_EXECUTION
deviceEpoch = current EFC device epoch
```

The field-set and final-surface receipts bind QSR03 streaming, route, Analysis execution, field descriptor, device identity, QMap field ID/generation, and EFC consumer evidence.

QMap and QWave resources must be distinct and on the same device identity. Caller texture injection, compatibility copies, CPU/WebGL conversion, semantic aliasing, and QRC02 re-entry are forbidden.

---

# 16. Physical QMAP01 parity

The qualification-only oracle consumes the QSR03 compact-v2 field through the existing canonical QMAP01 projection path. It produces a private reference rgba16float texture that is never published.

Compared channels:

```text
R = normalized response
G = orientation confidence
B = zero
A = interpolated validity support
```

Parity profile:

```text
profileId = tdt.qmap.qmap01-output-parity.qsr03g.v1
nonfinite texel count = 0
B channel = bit-exact zero
zero-support classification = exact
R/G/A max absolute error <= 2^-9
R/G/A max finite f16 ULP distance <= 2
R/G/A p99 finite f16 ULP distance <= 1
R/G/A mean absolute error <= 2^-13
```

Any threshold failure blocks product promotion.

---

# 17. Submission-count parity

The following must agree:

```text
QSR03A planned chunk count
QSR03F streaming receipt submission count
instrumented GPUQueue.submit count
```

Reference counts:

```text
1080p windows 1,888, chunks/submissions 5
4K windows 7,854, chunks/submissions 18, final chunk 238
8K windows 32,026, chunks/submissions 72, final chunk 218
```

Each chunk submits exactly one command buffer in one queue submission. Final projection adds no separate submit.

---

# 18. Resource plateau

At any moment:

```text
active cold jobs <= 1
active QSR03B arenas <= 1
live QSR03B transient buffers <= 10
live chunk submissions <= 1
live private compact targets <= 1
live unpublished QMap targets <= 1
```

Reference resource sizes:

```text
QSR03B arena = 66,758,400 bytes
4K compact target = 439,824 bytes
4K private QMap = 66,355,200 bytes
8K compact target = 1,793,456 bytes
8K private QMap = 265,420,800 bytes
```

After successful publication, the arena and compact target are gone and QMap ownership belongs to Analysis Field Authority. After failure or cancellation, all QSR03 private resources are gone.

Physical plateau repetitions:

```text
4K cold cycles = 5
4K concurrent warm requests after publication = 32
8K cold cycles = 3
8K concurrent warm requests after publication = 16
```

Required result: no monotonic live-resource growth, no second arena, no second cold operation, zero warm allocations/submissions, and balanced allocation/destruction ledgers.

---

# 19. Packaged physical harness

Requirements:

```text
Electron app.isPackaged = true
development server = forbidden
network access = disabled
physical run lock = exclusive
run ID = 64 lowercase hexadecimal characters
evidence root = absolute path
package closure captured before and after run
```

Environment:

```text
DADUM_QSR03G_PHYSICAL_MODE=1
DADUM_QSR03G_RUN_ID=<64 hex>
DADUM_QSR03G_EVIDENCE_ROOT=<absolute path>
DADUM_QSR03G_ADAPTER_ROLE=<role>
```

Cancellation and device-loss injection require one-shot Main-process permits bound to run, fixture, operation, expected hook, runtime/device epochs, renderer process, expiry, and nonce.

Required physical artifacts:

```text
QSR03G_PACKAGE_CLOSURE.json
QSR03G_ADAPTER_IDENTITY.json
QSR03G_FIFO_SINGLE_FLIGHT_WARM.json
QSR03G_QMAP01_PARITY_4K.json
QSR03G_QMAP01_PARITY_8K.json
QSR03G_SUBMISSION_PARITY.json
QSR03G_RECEIPT_AUTHENTICITY.json
QSR03G_RESOURCE_PLATEAU.json
QSR03G_CANCELLATION_REPLAY.json
QSR03G_DEVICE_LOSS_RECOVERY.json
QSR03G_EFC_CONVERGENCE.json
QSR03G_PHYSICAL_ADMISSION_RECEIPT.json
QSR03G_PRODUCT_PROMOTION_PERMIT.json
QSR03G_ARTIFACT_MANIFEST.json
```

These artifacts are not emitted during source bake.

---

# 20. Product promotion permit

```text
schemaId
= tdt.qmap.product-promotion-permit.qsr03g.v1
```

The permit binds patch/package identity, source and mutation receipts, physical admission, QMAP01 parity, submission parity, receipt authenticity, plateau, cancellation, recovery, 4K/8K completion, EFC convergence, runtime bridge, shader/ABI set, device profile, service ID, bridge key, promoted implementation, qualification-only implementation, and self digest.

The permit is generated only after all 96 Physical Gates pass. Source tests and developer environment variables cannot mint it.

Product boot validates the permit self digest, package content, runtime bridge, shader set, ABI set, device profile, service ID, bridge key, and promotion state.

---

# 21. Stable errors

```text
E_QMAP03G_REQUEST_INVALID
E_QMAP03G_ROUTE_NOT_PROMOTED
E_QMAP03G_PROMOTION_PERMIT_INVALID
E_QMAP03G_DUAL_RUNTIME_BRIDGE
E_QMAP03G_QRC02_PRODUCT_FALLBACK_FORBIDDEN
E_QMAP03G_FIFO_STATE_INVALID
E_QMAP03G_FIFO_ORDER_MISMATCH
E_QMAP03G_COLD_CONCURRENCY_VIOLATION
E_QMAP03G_SINGLE_FLIGHT_KEY_MISMATCH
E_QMAP03G_SINGLE_FLIGHT_TERMINAL_REUSE
E_QMAP03G_JOIN_CAPABILITY_RELEASE_FAILED
E_QMAP03G_WARM_ENTRY_STALE
E_QMAP03G_WARM_RECEIPT_INVALID
E_QMAP03G_WARM_RESOURCE_OWNERSHIP_FORBIDDEN
E_QMAP03G_CANCELLATION_CAPABILITY_REQUIRED
E_QMAP03G_WAITER_CANCELLED
E_QMAP03G_JOB_CANCELLED
E_QMAP03G_CANCELLATION_REPLAY_INVALID
E_QMAP03G_DEVICE_LOST
E_QMAP03G_DEVICE_RECOVERY_FAILED
E_QMAP03G_DEVICE_RECOVERY_BUDGET_EXHAUSTED
E_QMAP03G_DEVICE_EPOCH_REUSE_FORBIDDEN
E_QMAP03G_NONZERO_CHUNK_RECOVERY_FORBIDDEN
E_QMAP03G_RUNTIME_RECEIPT_INVALID
E_QMAP03G_DELIVERY_RECEIPT_INVALID
E_QMAP03G_PUBLICATION_RECEIPT_MISMATCH
E_QMAP03G_EFC_QMAP_CONSUMER_MISMATCH
E_QMAP03G_EFC_CONVERGENCE_FAILED
E_QMAP03G_QMAP01_PARITY_FAILED
E_QMAP03G_SUBMISSION_PARITY_FAILED
E_QMAP03G_RESOURCE_PLATEAU_FAILED
E_QMAP03G_4K_COMPLETION_FAILED
E_QMAP03G_8K_COMPLETION_FAILED
E_QMAP03G_PACKAGED_REQUIRED
E_QMAP03G_DEV_SERVER_FORBIDDEN
E_QMAP03G_PHYSICAL_PERMIT_MISMATCH
E_QMAP03G_PHYSICAL_EVIDENCE_INCOMPLETE
E_QMAP03G_PACKAGE_MUTATED
```

No stable error triggers a silent QRC02 product fallback.

---

# 22. Required implementation surfaces

New TypeScript surfaces:

```text
qmap-streaming-reduction-03-product-types.ts
qmap-streaming-reduction-03-product-request.ts
qmap-streaming-reduction-03-product-bridge.ts
qmap-streaming-reduction-03-cold-fifo.ts
qmap-streaming-reduction-03-single-flight.ts
qmap-streaming-reduction-03-warm-promise.ts
qmap-streaming-reduction-03-cancellation.ts
qmap-streaming-reduction-03-device-recovery.ts
qmap-streaming-reduction-03-route-receipt.ts
qmap-streaming-reduction-03-promotion-permit.ts
qmap-streaming-reduction-03-route-selector.ts
qmap-streaming-reduction-03-efc-convergence.ts
```

New legacy runtime surfaces mirror product contract, bridge, FIFO, single-flight, warm promise, recovery, route receipt, receipt v2, route selector, and EFC convergence.

Physical harness surfaces include package closure, run coordinator, IPC contract, challenge authority, one-shot fault permit authority, artifact publisher, resource ledger sampler, and promotion permit finalizer.

Required parent integration includes QSR03F receipt v2, QSR03F cancellation bridge, QSR03F publication metadata, the invocation factory, QRC02 route installer, runtime boot selector, Analysis execution evidence, Bakemono Rinne field-set evidence, EFC qualification integration, Electron packaged boot, stable errors, service tokens, and package scripts.

Generated inventories and active-graph files are updated only through canonical generators.

---

# 23. Source Gates

QSR03G requires exactly 208 Source Gates:

```text
S001-S016   identity, dual completion, bridge and promotion boundary
S017-S032   product request and logical/device identity keys
S033-S048   strict FIFO ownership and one-active-cold invariant
S049-S064   duplicate single-flight and waiter isolation
S065-S080   bounded metadata-only warm promise sharing
S081-S096   canonical cold invocation construction
S097-S112   QSR03F receipt v2 and publication authenticity
S113-S128   waiter cancellation and replay
S129-S144   one-restart device-loss recovery
S145-S160   Analysis, Bakemono Rinne, and EFC convergence
S161-S176   packaged harness and QMAP01 parity closure
S177-S192   4K/8K counts, submission parity, and resource plateau
S193-S208   physical permit, route promotion, and terminal lifecycle
```

Source completion requires 208 of 208 PASS.

---

# 24. Negative-control mutants

Exactly 80 mutants must be detected. They cover:

```text
M001-M008   bridge/service mutation, dual route, fake permit, silent QRC02 fallback
M009-M016   identity-key faults, duplicate queue entries, FIFO overtaking
M017-M024   joiner allocations/submissions, shared cancellation, terminal reuse
M025-M032   warm ownership/pinning/staleness/unbounded metadata/warm submissions
M033-M040   queued/active cancellation cleanup and replay faults
M041-M048   invalid retry, multiple restart, nonzero resume, old-resource reuse
M049-M056   missing stage/receipt/descriptor/permit lineage and fake caller claims
M057-M064   semantic/producer mutation, EFC bypass/alias/device mismatch/QRC02 reentry
M065-M072   unpackaged/network/fault-injection/oracle-publication/parity relaxation
M073-M080   wrong 4K/8K submits, extra projection submit, second arena, leaks, failed-gate promotion
```

Patch-ID string checks alone do not count as detection.

---

# 25. Physical Gates

QSR03G requires exactly 96 Physical Gates:

```text
P001-P008   packaged boot, closure, run lock, adapter, candidate permit
P009-P016   canonical bridge, FIFO order, one cold operation, recovery position
P017-P024   duplicate single-flight and warm sharing with zero warm GPU work
P025-P032   4K geometry, chunks, submissions, allocation, publication, validation
P033-P040   8K geometry, chunks, submissions, allocation, publication, validation
P041-P048   QMAP01 RGBA parity and nonfinite rejection
P049-P056   submission count and receipt authenticity
P057-P064   resource plateau and balanced lifecycle
P065-P072   cancellation safety and successful replay
P073-P080   controlled device loss, chunk-zero restart, budget exhaustion
P081-P088   canonical Analysis/Bakemono Rinne/EFC convergence
P089-P096   physical admission, promotion permit, promoted boot, EFC smoke
```

All 96 gates must pass before permit generation.

---

# 26. Package scripts

```json
{
  "scripts": {
    "verify:qmap-streaming-03g:fifo": "node tools/qmap-streaming-reduction-03g/verify-cold-fifo.mjs",
    "verify:qmap-streaming-03g:single-flight": "node tools/qmap-streaming-reduction-03g/verify-single-flight.mjs",
    "verify:qmap-streaming-03g:warm": "node tools/qmap-streaming-reduction-03g/verify-warm-promise.mjs",
    "verify:qmap-streaming-03g:cancellation": "node tools/qmap-streaming-reduction-03g/verify-cancellation-replay.mjs",
    "verify:qmap-streaming-03g:recovery": "node tools/qmap-streaming-reduction-03g/verify-device-recovery.mjs",
    "verify:qmap-streaming-03g:receipt": "node tools/qmap-streaming-reduction-03g/verify-receipt-parity.mjs",
    "verify:qmap-streaming-03g:efc": "node tools/qmap-streaming-reduction-03g/verify-efc-convergence.mjs",
    "verify:qmap-streaming-03g:source": "node tools/qmap-streaming-reduction-03g/verify-source-gates-208.mjs",
    "verify:qmap-streaming-03g:mutants": "node tools/qmap-streaming-reduction-03g/run-mutants.mjs",
    "gate:qmap-streaming-03g": "node tools/qmap-streaming-reduction-03g/gate-source.mjs",
    "gate:qmap-streaming-03g:physical": "node tools/qmap-streaming-reduction-03g/physical/gate-packaged.mjs",
    "finalize:qmap-streaming-03g:promotion": "node tools/qmap-streaming-reduction-03g/physical/finalize-promotion-permit.mjs"
  }
}
```

---

# 27. Bake and repository policy

The source code ZIP contains the product-route candidate implementation, FIFO, single-flight, warm sharing, cancellation/recovery, QSR03F receipt v2, EFC integration, packaged physical harness, validators, and package scripts.

The code ZIP excludes:

```text
this specification
source/physical reports
physical admission receipt
product promotion permit
bake receipts
artifacts and manifests
patch files
logs
temporary fixtures and typecheck configs
nested ZIPs
Git metadata
```

The GitHub commit contains this specification file only.

Source bake must emit no physical admission receipt, product promotion permit, physical artifact manifest, or product-route promotion claim.

---

# 28. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_COLD_FIFO_DUPLICATE_SINGLE_FLIGHT_BOUNDED_WARM_PROMISE_CANCELLATION_REPLAY_ONE_RESTART_DEVICE_RECOVERY_ROUTE_RECEIPT_PARITY_EFC_CONVERGENCE_BOUND_PACKAGED_PHYSICAL_READY_AWAITING_PHYSICAL_ADMISSION
```

Required source facts:

```text
Source Gates = 208/208
Negative controls = 80/80
maximum active cold jobs = 1
maximum active arenas = 1
warm metadata bound = 64
device-loss restart budget = 1
QSR03F chunk record = v2
QSR03F streaming receipt = v2
4K windows/chunks/final = 7,854 / 18 / 238
8K windows/chunks/final = 32,026 / 72 / 218
QMap semantic and producer = unchanged
QRC02 product route = still active
Physical Gates = 0/96 pending
product route promoted = false
promotion permit artifact count = 0
```

---

# 29. Physical completion and product promotion state

```text
PHYSICAL_BAKED_AND_PRODUCT_PROMOTED_QMAP_STREAMING_REDUCTION_03G_QMAP01_OUTPUT_PARITY_EXACT_SUBMISSION_COUNTS_AUTHENTIC_PUBLICATION_RECEIPTS_RESOURCE_PLATEAU_CANCELLATION_SAFE_DEVICE_LOSS_RECOVERED_4K_8K_COMPLETED_EFC_END_TO_END_CONVERGED_QSR03_CANONICAL_PRODUCT_ROUTE_QRC02_QUALIFICATION_ONLY_FINAL_SEAL
```

Required physical facts:

```text
Physical Gates = 96/96
QMAP01 parity = PASS
submission parity = PASS
receipt authenticity = PASS
resource plateau = PASS
cancellation replay = PASS
device-loss restart = PASS
4K completion = PASS
8K completion = PASS
EFC convergence = PASS
promotion permit = authentic
product bridge = QSR03G
QRC02 product fallback = absent
```

---

# 30. Prohibited claims before physical promotion

```text
QSR03_PRODUCT_ROUTE_PROMOTED
QSR03_4K_PRODUCT_PASS
QSR03_8K_PRODUCT_PASS
QSR03_RESOURCE_PLATEAU_PASS
QSR03_DEVICE_LOSS_RECOVERY_PASS
QSR03_EFC_END_TO_END_PASS
PHYSICAL_QMAP_STREAMING_REDUCTION_03_PASS
```

---

# 31. Terminal boundary

QSR03G is the terminal implementation and product-promotion patch for QSR03.

Later patches may extend device matrices, fleet rollout, installed-package attestation, transparency, remote attestation, or performance profiles. They may not silently redefine QSR03 spectral arithmetic, compact ABI, QMap semantics, product bridge authority, or receipt lineage.

---

# 32. Final seal

```text
A streaming QMap runtime is not promoted because one large fixture completed.

Distinct cold work must be FIFO-serialized.
Duplicates must share one execution.
Warm callers must share one published promise without retaining private GPU resources.
Cancellation belongs to waiters and must remain replayable.
Device loss must destroy the old epoch and restart at chunk zero.

Every physical submission must agree with the plan and receipt.
Every published field must agree with the streaming receipt, Analysis execution receipt, and field descriptor.
The real EFC consumer chain must converge with the QSR03-produced QMap.

Only packaged 4K and 8K proof may mint the promotion permit.
After promotion there is one product route:
__DADUM_QMAP_RUNTIME_BRIDGE__ resolves to QSR03G.

QRC02 remains a qualification oracle.
It is not a silent fallback.
```
