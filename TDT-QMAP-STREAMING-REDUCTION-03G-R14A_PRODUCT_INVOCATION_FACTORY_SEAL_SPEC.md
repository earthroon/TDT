# TDT-QMAP-STREAMING-REDUCTION-03G-R14A

## Product Invocation Factory / Candidate Assembly Core Extraction / Live Final-EWA Product Capability Binding / Product Analysis Lease / Route-Separated Assembly Receipt / Attempt-Local GPU Ownership / Failure-Atomic Cleanup / Zero Qualification Provenance Leakage Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R14A
Short ID = QSR03G-R14A
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R14
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

R14A constructs the real product invocation consumed by `createQsr03gProductBridge()`.

R14A does not install the global product bridge, execute the complete streaming graph, publish a QMap field, run QWave/EFC, bind Preview/Export, issue an installed session, execute W001-W096, or mutate Package A retention.

## 1. Confirmed parent state

The existing candidate invocation factory already assembles the physical GPU resource graph:

```text
device lease
Final EWA source
QSR03A plan
QSR03B arena
pipeline bundle
QSR03C source
QSR03E compact target
QSR03F QMap target
Stockham/power/projection pipelines
Analysis build lease
assembly receipt
encoder factory
cleanup transaction
```

It is, however, structurally bound to candidate authority through `qualificationRunId`, `fixtureId`, replay authority, candidate Analysis metadata, candidate receipt and qualification readback.

The R14 product root previously failed without an externally injected `invocationFactory`. R14A closes that missing physical product factory.

## 2. Required terminal state

```text
route-neutral GPU assembly core = present
candidate adapter = regression-preserved
product adapter = present
product invocation factory = present
live Final EWA attempt pin = bound
product Analysis lease = bound
product publication authority = attached
candidate provenance in product invocation = 0
queue submissions during assembly = 0
QMap field publications during assembly = 0
global bridge writes = 0
failure-atomic cleanup = true
```

Required entries:

```text
assembleQsr03gInvocationCore()
createQsr03gR1CandidateInvocationAdapter()
createQsr03gR14ProductInvocation()
```

## 3. State ownership and SSOT

```text
assembly order SSOT
= assembleQsr03gInvocationCore()

candidate authority SSOT
= R1 candidate adapter

product authority SSOT
= R14A product adapter

device lease owner
= device authority, attempt-local borrower

Final EWA product texture owner
= upstream Final EWA authority

Final EWA attempt pin owner
= product invocation

arena, compact target, QMap target owner
= invocation attempt

Analysis build lease owner
= AnalysisFieldAuthority

product publication authority owner
= R14 product publication authority
```

The common core owns sequence and resource assembly only. It may not choose candidate or product authority implicitly.

## 4. Architecture

```text
R1 candidate adapter
  replay Final EWA
  candidate Analysis lease
  candidate assembly receipt
            |
            v
assembleQsr03gInvocationCore()
            ^
            |
R14A product adapter
  live Final EWA attempt pin
  product Analysis lease
  product assembly receipt
  R14 publication authority
```

Forbidden:

```text
createQsr03gR14ProductInvocation()
-> createQsr03gR1Invocation()
-> patch candidate fields afterward
```

Product authority must be present before GPU resource acquisition begins.

## 5. Route adapter contract

Every route adapter provides:

```text
routeKind
adapterId
compositionRootId
invocationFactoryId
acquireFinalEwaForAttempt()
bindAnalysisLease()
sealAssemblyReceipt()
releaseFinalEwaBinding()
invocationMetadata()
optional createDiagnostics()
```

Allowed route kinds are exactly `CANDIDATE` and `PRODUCT`. There is no default route and no fallback between adapters.

## 6. Canonical assembly order

```text
ACQ00 validate runtime and cancellation
ACQ01 acquire device lease
ACQ02 create attempt-local allocator
ACQ03 acquire route-owned Final EWA binding
ACQ04 construct QSR03A plan
ACQ05 create QSR03B arena
ACQ06 acquire pipeline bundle
ACQ07 create QSR03C Final EWA source
ACQ08 create QSR03E compact target
ACQ09 create QSR03F QMap target
ACQ10 resolve Stockham pipelines
ACQ11 resolve power pipelines
ACQ12 create projection pipeline set
ACQ13 bind route-owned Analysis lease
ACQ14 seal route-owned assembly receipt
ACQ15 freeze and return invocation
```

No adapter may reorder physical resource acquisition.

## 7. Product request authority

The product request binds operation/source identity, geometry, runtime/device authority, Final EWA lineage, package content ID, R10 permit, route pointer, bundle and product-route generations, session and operation grant digests, device profile, Final EWA capability, cancellation capability, logical key and device execution key.

Caller-owned GPU resources, qualification IDs, candidate permits and QRC02 fallback controls are forbidden.

## 8. Device lease

The device lease must match runtime epoch, device epoch and device identity exactly and expose a physical GPU device, queue, limits and release method in packaged mode.

A device lease is attempt-local. It cannot be reused after release or device loss.

## 9. Live Final EWA product binding

Required authority:

```text
FinalEwaProductAuthority.acquireForProductAttempt()
```

The resulting binding includes attempt pin and receipt identities, the private texture/view, descriptor, source lineage, device lineage, Final EWA identity digests and `release(reason)`.

The product invocation borrows the upstream texture and owns only the attempt pin. Disposal releases the pin exactly once and never destroys the upstream Final EWA texture.

## 10. Final EWA validation

The binding must equal the request for source identity, revision, runtime epoch, device epoch, device identity, Final EWA identity, descriptor digest and low-pass receipt digest.

Required descriptor:

```text
width = outputWidth
height = outputHeight
format = rgba16float
dimension = 2d
mipLevelCount = 1
sampleCount = 1
```

Fixture IDs, qualification run IDs, replay receipts, CPU payloads, readback buffers, cross-device textures and caller-owned textures are forbidden.

## 11. Streaming plan

The common core constructs QSR03A with the canonical periodic Hann 64x64, stride 32x32, 50 percent overlap, reject-no-padding, 64 MiB transient budget, 8192-byte fixed slots, 8-window alignment and one ring slot.

Candidate and product routes must derive identical geometry from identical physical inputs.

## 12. Attempt-local allocator and targets

The allocator is unique per invocation attempt and tracks all buffers, textures, bytes and destruction events.

One attempt creates exactly one QSR03B arena, one QSR03E compact target, one QSR03F QMap target and one current-device pipeline bundle.

No route adapter may allocate untracked GPU resources directly.

## 13. Product Analysis producer and lease

Product invocation requires explicit producer registration for the normalized-response semantic on the PRODUCT route.

The product lease binds source lineage, plan and target identities, package/permit/route/bundle authority, session/grant digests and device identity.

Assembly metadata is:

```text
candidateQualificationOnly = false
productRouteIntended = true
productPublicationPending = true
warmProductCacheIntended = true
normalProductBootAdmitted = true
```

`productRouteEligible=true` belongs only to successful R14 publication after streaming completion.

## 14. Product assembly receipt

Schema:

```text
tdt.qmap.product-invocation-assembly.qsr03g-r14a.v1
```

The receipt binds product authority, attempt identity, plan, arena, pipeline set, Final EWA capability and pin, source capability, compact/QMap targets, Analysis lease and product publication authority.

Required terminal fields:

```text
candidateRouteOnly = false
globalBridgePromotionAdmitted = true
qualificationProvenanceCount = 0
```

The receipt is self-hashed.

## 15. Qualification provenance denial

A product invocation and receipt contain no qualification run ID, fixture ID, candidate permit, replay receipt, qualification readback, candidate publication receipt or candidate dependency graph receipt.

Source fixtures may use an outer test envelope, but fixture identity may not enter the product invocation or receipt.

## 16. Product dependency graph

The product dependency graph contains unique authorities for device, Final EWA binding, pipelines, allocator, AnalysisFieldAuthority, product producer, encoder factory and publication.

Packaged product mode requires zero candidate, qualification, QRC02, mock, development and caller-owned GPU authorities.

## 17. Product invocation object

The immutable invocation contains the plan, arena, allocator, source, compact and QMap targets, queue, encoder factory, pipelines, Analysis lease, publication authority, product request/context, route IDs, attempt identity, assembly receipt, Final EWA attempt binding, device lease and pipeline bundle.

It is directly compatible with `runQsr03fStreamingOperation()` and carries `publicationAuthority`, `productRequest` and `productContext` for the R14 product publication path.

## 18. Candidate adapter preservation

The candidate factory remains a thin wrapper over the common core and retains replay authority, candidate Analysis metadata, candidate receipt, optional qualification readback and candidate-only terminal fields.

R1 source contracts, R5 cancellation/generation contracts and candidate physical planning remain regression-preserved.

## 19. Failure-atomic cleanup

Partial construction unwinds in reverse ownership order:

```text
Analysis build lease abort
QMap target destroy
compact target destroy
QSR03C source retirement
arena disposal
route-owned Final EWA binding release
pipeline bundle release
device lease release
allocator terminal verification
```

Cleanup runs once, continues after an individual cleanup failure, preserves the original error, does not destroy the borrowed Final EWA texture and leaves zero attempt-owned resources.

## 20. Cancellation and device loss

Cancellation checkpoints exist before device acquisition, after Final EWA binding, after arena creation, after target creation, before Analysis lease and before invocation return.

Cancellation returns no invocation and publishes no field.

A device lost during assembly returns no invocation and no warm entry. A replacement attempt must use a new epoch, identity, Final EWA capability, pin, arena, targets, pipelines and Analysis lease. Old-device resources never cross the epoch.

## 21. Required runtime files

```text
qmap_streaming_reduction_03_invocation_core.mjs
qmap_streaming_reduction_03_invocation_route_adapter.mjs
qmap_streaming_reduction_03_r1_candidate_invocation_adapter.mjs
qmap_streaming_reduction_03_r14a_contract.mjs
qmap_streaming_reduction_03_r14a_product_invocation_factory.mjs
qmap_streaming_reduction_03_r14a_final_ewa_product_binding.mjs
qmap_streaming_reduction_03_r14a_analysis_lease_binding.mjs
qmap_streaming_reduction_03_r14a_invocation_receipt.mjs
qmap_streaming_reduction_03_r14a_product_dependency_graph.mjs
qmap_streaming_reduction_03_r14a_live_product_dependencies.mjs
qmap_streaming_reduction_03_r14a_invocation_disposal.mjs
```

TypeScript mirrors and source/physical validation tools are required.

## 22. Parent modifications

The candidate invocation factory becomes the candidate adapter wrapper over the common core.

The R14 product root uses `createQsr03gR14ProductInvocation()` and the R14A product disposer by default when no explicit source fixture implementation is supplied.

FIFO, single-flight, warm, publication and recovery state remain in their existing owning authorities and are not duplicated by R14A.

## 23. Stable errors

```text
E_QMAP03G_R14A_PRODUCT_INVOCATION_FACTORY_REQUIRED
E_QMAP03G_R14A_ROUTE_ADAPTER_INVALID
E_QMAP03G_R14A_ROUTE_ADAPTER_MISMATCH
E_QMAP03G_R14A_DEVICE_LEASE_INVALID
E_QMAP03G_R14A_DEVICE_IDENTITY_MISMATCH
E_QMAP03G_R14A_DEVICE_LOST_DURING_ASSEMBLY
E_QMAP03G_R14A_FINAL_EWA_AUTHORITY_REQUIRED
E_QMAP03G_R14A_FINAL_EWA_CAPABILITY_INVALID
E_QMAP03G_R14A_FINAL_EWA_PIN_FAILED
E_QMAP03G_R14A_FINAL_EWA_LINEAGE_MISMATCH
E_QMAP03G_R14A_FINAL_EWA_DEVICE_MISMATCH
E_QMAP03G_R14A_FINAL_EWA_DESCRIPTOR_MISMATCH
E_QMAP03G_R14A_RESOURCE_ALLOCATOR_REQUIRED
E_QMAP03G_R14A_PIPELINE_BUNDLE_INVALID
E_QMAP03G_R14A_PRODUCT_PRODUCER_NOT_REGISTERED
E_QMAP03G_R14A_ANALYSIS_LEASE_FAILED
E_QMAP03G_R14A_ASSEMBLY_RECEIPT_INVALID
E_QMAP03G_R14A_QUALIFICATION_PROVENANCE_LEAK
E_QMAP03G_R14A_PUBLICATION_AUTHORITY_MISSING
E_QMAP03G_R14A_ASSEMBLY_CANCELLED
E_QMAP03G_R14A_PARTIAL_CLEANUP_FAILED
E_QMAP03G_R14A_RESOURCE_BALANCE_NONZERO
E_QMAP03G_R14A_DUPLICATE_DISPOSAL
E_QMAP03G_R14A_CANDIDATE_REGRESSION
E_QMAP03G_R14A_PHYSICAL_ASSEMBLY_REQUIRED
```

## 24. Source gate contract

```text
Source Gates = 256
Negative Controls = 112
Physical A-gate definitions = 64
```

Gate families cover identity, core sequencing, candidate preservation, product dependency graph, device/allocator ownership, Final EWA binding, plan/arena, targets/pipelines, product Analysis lease, receipt, runtime handoff, cleanup, cancellation/loss, route isolation, parent regressions and completion state.

## 25. Physical A001-A064 families

```text
A001-A008   packaged dependency authority
A009-A016   1080p invocation assembly
A017-A024   1080p disposal
A025-A032   4K assembly and disposal
A033-A040   8K assembly and disposal
A041-A048   failure-atomic cleanup
A049-A056   cancellation cleanup
A057-A064   device-epoch reassembly
```

Physical R14A validates GPU resource assembly and disposal only. It performs no queue submission and publishes no QMap field.

Expected physical accounting:

```text
successful assemblies = 4
injected failures = 2
device-epoch invalidations before Final EWA pin = 1
Final EWA attempt pins acquired/released = 6/6
queue submissions = 0
fence waits = 0
QMap publications = 0
warm entries = 0
terminal private-resource balance = 0
```

## 26. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R14A_ROUTE_NEUTRAL_INVOCATION_ASSEMBLY_CORE_CANDIDATE_ADAPTER_REGRESSION_PRESERVED_LIVE_FINAL_EWA_PRODUCT_CAPABILITY_BINDING_PRODUCT_ANALYSIS_LEASE_PRODUCT_ASSEMBLY_RECEIPT_ZERO_QUALIFICATION_PROVENANCE_LEAK_ATTEMPT_LOCAL_GPU_OWNERSHIP_FAILURE_ATOMIC_REVERSE_CLEANUP_DEVICE_EPOCH_REASSEMBLY_AWAITING_PACKAGED_PRODUCT_INVOCATION_ASSEMBLY
```

Required source facts:

```text
Source Gates = 256/256
Negative Controls = 112/112
Physical A gates = 64 definitions
product invocation factories = 1
candidate invocation adapters = 1
product queue submissions = 0
product QMap publications = 0
global bridge writes = 0
physical A gates executed = 0/64
real product QMap promotion = false
```

## 27. Physical completion state

```text
PACKAGED_PRODUCT_INVOCATION_FACTORY_BAKED_QMAP_STREAMING_REDUCTION_03G_R14A_REAL_GPU_DEVICE_LEASE_LIVE_FINAL_EWA_PRODUCT_ATTEMPT_PIN_CANONICAL_1080P_4K_8K_STREAMING_PLAN_TRACKED_ARENA_AND_TARGET_ASSEMBLY_PRODUCT_ANALYSIS_LEASE_PRODUCT_PUBLICATION_AUTHORITY_HANDOFF_ZERO_QUALIFICATION_PROVENANCE_FAILURE_ATOMIC_CLEANUP_DEVICE_EPOCH_REASSEMBLY_ZERO_QUEUE_SUBMISSION_CLAIM_ZERO_PRIVATE_RESOURCE_LEAK_READY_FOR_RENDERER_PRODUCT_RUNTIME_SERVICE
```

## 28. Package policy

The code ZIP contains the common core, candidate/product adapters, Final EWA binding, Analysis lease, receipt, dependency graph, product disposer, TypeScript mirrors, A001-A064 definitions and validation tooling.

It excludes this specification, private keys, real product permits, generated A receipts, physical Merkle/receipt, real QMap publications, reports, logs, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 29. Next boundary

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R14B

Renderer Product Runtime Service /
Live GPU Authority Composition /
Product Root Lifetime /
Real Bridge Ownership /
Runtime Module Registration /
Device Epoch Holder /
Global Bridge Promotion Preparation /
No Preview·Export Binding Yet Seal
```

R14B owns the long-lived Renderer product root and real QSR03G bridge. It consumes the R14A factory without copying assembly state.

## 30. Final seal

R14A does not promote a candidate invocation. It extracts one route-neutral GPU assembly core and preserves candidate semantics through an explicit adapter. The product adapter resolves a live Final EWA capability into an attempt-local pin, binds current product authority, opens a product Analysis build lease and seals a product assembly receipt with zero qualification provenance.

Assembly creates real GPU resources but submits no queue work and publishes no field. Failed, cancelled and old-device attempts unwind without leaking private resources or destroying the borrowed Final EWA texture.

R14A is complete when `createQsr03gR14ProductInvocation()` returns an immutable runtime-coordinator-compatible invocation backed by current-device resources and carrying the R14 product publication authority.
