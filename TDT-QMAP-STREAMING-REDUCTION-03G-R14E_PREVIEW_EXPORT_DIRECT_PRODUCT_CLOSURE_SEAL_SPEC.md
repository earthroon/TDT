# TDT-QMAP-STREAMING-REDUCTION-03G-R14E

## Final-Surface Producer Grant / Preview Consumer Adoption / Export Consumer Adoption / Shared Same-Revision Final Surface / Read-Only Consumer Pins / No Duplicate QMap or EFC Execution / Warm Final-Surface Reuse / Preview·Export Direct Product Closure Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R14E
Short ID = QSR03G-R14E
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R14D
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

R14E binds Preview and Export to the single R14D final-surface producer without duplicating QMap, QWave, EFC, Surface Registry or Pipeline work.

R14E does not modify QMap/QWave/EFC formulas, add another product runtime, run 4K/8K/device-loss workloads, replace the startup canary, retire QRC02 rollback authority, mutate Package A retention, or claim R14 W001-W096 physical closure.

## 1. Confirmed parent state

R14D owns one physical producer chain:

```text
active QSR03G request
→ live Final EWA invocation
→ product-eligible AFT00 QMap field
→ QWave real/imaginary/analytic set
→ one R9A EFC graph
→ Phase Gamma + Terminal R1C + Bakemono WGSL-06
→ one Surface Registry final
→ one Pipeline final publication
```

Preview and Export already consume Pipeline final surfaces with separate read-only Surface Registry pins and shared tuple validation, but they have no authority to create a missing/stale R14D final surface or coalesce same-key production.

R14E closes that coordinator gap.

## 2. Required terminal state

```text
Preview product requests = 2
Export product requests = 2
cold producer leaders = 1
same-key in-flight joiners = 1
warm final-surface reuses = 2
producer grants issued / consumed = 1 / 1
R14D transactions = 1
QMap executions = 1
QWave real executions = 1
QWave analytic executions = 1
EFC graph executions = 1
producer submissions / fences = 8 / 8
Surface Registry final records = 1
Pipeline final publications = 1
Pipeline final revision delta = +1
Preview pins acquired / released = 2 / 2
Export pins acquired / released = 2 / 2
consumer history records = 4
shared tuple parity = MATCHED
duplicate QMap/EFC executions = 0
QRC02 product executions = 0
```

The canonical workload consists of cold Preview, same-key cold Export join, warm Preview and warm Export.

## 3. State ownership and SSOT

```text
current final publication SSOT = PipelineService.currentPublication()
final GPU resource and pins SSOT = SurfaceRegistryAuthorityService
same-key producer transaction SSOT = QMapFinalSurfaceCoordinatorService
producer grant SSOT = FinalSurfaceProducerGrantAuthority
QMap/QWave/EFC execution SSOT = QMapEfcFinalSurfaceProducerService
Preview pin owner = PreviewPresenterService
Export pin owner = ExportAuthorityService
consumer parity/history SSOT = FinalSurfaceConsumptionLedgerService
operation grants SSOT = InstalledAdmissionService
```

The coordinator may cache only producer-key and publication identities. It may not cache GPUTexture, SurfacePin, SurfaceBorrow, encoder state, Preview frames or Export results.

## 4. Coordinator service

```text
service = QMapFinalSurfaceCoordinatorService
service ID = dadum.runtime.qmap-final-surface-coordinator
module = dadum.module.qmap-final-surface-coordinator-r14e
capability = dadum.qmap.final-surface.product
```

Required public methods:

```text
initialize()
ensureFinalSurface()
currentWarmPublication()
status()
receiptEvidence()
dispose()
```

Forbidden direct authority:

```text
publish Pipeline final
register Surface Registry record
run QMap/QWave/EFC directly
acquire Preview/Export consumer pins
```

## 5. Product request and producer key

Request schema:

```text
tdt.qmap.final-surface-product-request.qsr03g-r14e.v1
```

Every request binds consumer kind, operation identity, installed session/generation, R14C activation binding, source identity/geometry, Final EWA identity, Delta-K/alpha/Terminal-R1C/lambda2 authorities, effect and shader digests, runtime/device identity and cancellation capability.

Allowed consumer kinds are exactly `PREVIEW` and `EXPORT`.

Producer-key schema:

```text
tdt.qmap.final-surface-producer-key.qsr03g-r14e.v1
```

Same revision alone is insufficient. Sharing requires exact equality of source identity and geometry, activation binding, Final EWA identities, Delta-K/alpha/tensor/lambda2 authorities, effect/shader digests and device identity.

## 6. Dispositions

```text
COLD_PRODUCER
JOINED_IN_FLIGHT
WARM_FINAL_SURFACE
```

`COLD_PRODUCER` creates one in-flight entry, one producer grant and one R14D transaction.

`JOINED_IN_FLIGHT` creates one waiter and zero additional grants or producer work.

`WARM_FINAL_SURFACE` validates the current Pipeline publication and creates zero producer work.

Every disposition returns the exact same final publication tuple for one producer key.

## 7. Producer grant

Grant schema:

```text
tdt.qmap.final-surface-producer-grant.qsr03g-r14e.v1
```

The one-shot grant binds producer key, leader request, session generation, activation binding, package/permit/bundle/route authority, runtime/device identity, nonce and expiry.

Preview and Export cannot issue producer grants directly. Joiners and warm requests issue no producer grants.

## 8. R14D producer reuse

R14E calls:

```text
QMapEfcFinalSurfaceProducerService.runProductTransaction()
```

R14D becomes reusable across distinct producer keys:

```text
READY → RUNNING → READY
```

It owns transaction counters and the last final receipt. R14E same-key coalescing occurs above R14D.

## 9. Same-key single-flight

For concurrent same-key Preview and Export requests:

```text
first request = COLD_PRODUCER
second request = JOINED_IN_FLIGHT
```

Required totals:

```text
in-flight map entries = 1
producer grants = 1
R14D calls = 1
activeBridge.ensureQMapForConvergence calls = 1
QMap executions = 1
QWave field-set builds = 1
EFC graph executions = 1
Surface registrations = 1
Pipeline publications = 1
```

Both waiters receive the same surface ID, source revision, final revision, Pipeline receipt, final role, convergence digest, descriptor digest and producer-key digest.

Preview-first and Export-first ordering are equivalent.

## 10. Pipeline and Surface Registry verification

After R14D completes, the coordinator re-reads Pipeline binding/publication and Surface Registry.

Required equality:

```text
R14D surface ID = Pipeline binding ID = Pipeline publication ID = Surface Registry ID
R14D source revision = Pipeline source revision = Surface Registry source revision
R14D final revision = Pipeline final revision = Surface Registry final revision
```

Required final evidence:

```text
finalRole = BAKEMONO_RINNE_PHASE_GAMMA_R1C_FINAL
valid convergence receipt digest
valid final texture descriptor digest
allocationClass = final
owner = PipelineService
state = ACTIVE or PINNED
producerKeyDigest = requested producer key
```

The shared promise resolves only after these checks.

## 11. Warm final-surface reuse

Warm authority is a validated reuse of `PipelineService.currentPublication()`.

Warm reuse requires current producer-key, source, activation, device and final evidence parity. Superseded, invalid, disposed, wrong-device, wrong-source, wrong-effect or wrong-shader publications are rejected.

Warm reuse creates:

```text
producer grants delta = 0
R14D transaction delta = 0
QMap/QWave/EFC submissions delta = 0
Surface registrations delta = 0
Pipeline publications delta = 0
```

A stale warm identity is removed and may be replaced by one new cold leader. It never silently returns an unrelated current publication.

## 12. Installed-session adoption binding

R14E performs one successor-session generation rebind after the coordinator and both consumers are wired.

Required session relationship:

```text
session ID = unchanged
generation = previous + 1
package/permit/bundle/route/device authority = unchanged
qmapProductRuntimeActivated = true
qmapPreviewExportBound = true
qmapProductWorkAllowed = true
```

Adoption-binding schema:

```text
tdt.qmap.preview-export-adoption-binding.qsr03g-r14e.v1
```

It binds R14C activation, R14D producer, R14E coordinator, Preview/Export implementations, Surface Registry, Pipeline, consumption ledger, device epoch and route generations.

All pre-R14E operation grants become stale.

## 13. Preview adoption

Required method:

```text
PreviewPresenterService.presentProduct(request)
```

Flow:

```text
validate adoption binding
→ coordinator.ensureFinalSurface()
→ require exact Pipeline final revision
→ read-only Surface Registry pin
→ shared tuple validation
→ Preview operation grant
→ present
→ ledger record
→ operation completion
→ pin release
```

Preview may not call QSR03G, R14D, QWave, R9A, Surface Registry registration or Pipeline publication directly.

Existing `present()` remains an existing-final consumer and cannot synthesize product inputs or trigger production.

## 14. Same-revision Preview scheduler coalescing

```text
incoming revision > pending revision → supersede
incoming revision = pending revision → join the existing presentation ticket
incoming revision < pending revision → reject stale
```

A detached Pipeline subscription and explicit product request for the same final revision produce one presentation execution and one Preview pin. Equal revision is not reported as `DROPPED_SUPERSEDED`.

## 15. Export adoption

Required method:

```text
ExportAuthorityService.exportProduct(encoder, request, options)
```

Flow:

```text
validate adoption binding
→ coordinator.ensureFinalSurface()
→ require exact Pipeline final revision
→ Export operation grant
→ read-only Surface Registry pin
→ shared tuple validation
→ exact-dimension encoder
→ host save
→ ledger record
→ operation completion
→ pin release
```

Existing `exportFinal()` remains an existing-final consumer and cannot trigger production.

## 16. Read-only consumer pins

Preview and Export receive different pin IDs for the same surface/final revision.

Pins are read-only, release exactly once, transfer no ownership and cannot mutate, invalidate, dispose or replace the final surface.

When a newer final revision supersedes an older pinned surface, the old record enters deferred disposal and remains physically alive until all pins release.

## 17. Shared tuple and history

Both consumers validate:

```text
surfaceId
sourceRevision
finalRevision
pipelineReceiptId
resampleReceiptId
resampleReceiptDigest
finalRole
convergenceReceiptDigest
finalTextureDescriptorDigest
```

`FinalSurfaceConsumptionLedgerService` remains the parity authority and adds append-only consumer history.

Canonical history:

```text
Preview records = 2
Export records = 2
total records = 4
mismatch records = 0
parity = MATCHED
```

## 18. Cancellation and failures

One waiter may cancel without cancelling a producer still needed by another waiter.

All waiters cancelled before producer start creates no grant or R14D transaction.

Producer failure fans the same failure identity to all waiters, creates no pins, adds no warm publication and removes the in-flight entry.

No cancelled/failed path may publish a partial final surface.

## 19. QRC02 and synthetic denial

Throughout R14E:

```text
QRC02 product calls/submissions/fields/finals/fallbacks = 0
QRC02 state = QUALIFICATION_ONLY
```

Forbidden product lineage includes the synthetic R14 EFC counter shell, R8 placeholder Bakemono helper, fabricated surface IDs and manually incremented producer counters.

Only an R14D final receipt linked to the exact Pipeline publication is accepted.

## 20. Runtime module integration

Coordinator module depends on R14D, R14C, Pipeline, Surface Registry and installed admission.

Preview and Export modules both depend on and consume:

```text
dadum.qmap.final-surface.product
```

Neither service receives QMapProductRuntimeService, QMapEfcFinalSurfaceProducerService, QWavePhaseService or AnalysisFieldAuthorityService directly.

## 21. Required implementation surfaces

Runtime JavaScript:

```text
qmap_streaming_reduction_03_r14e_contract.mjs
qmap_streaming_reduction_03_r14e_product_request.mjs
qmap_streaming_reduction_03_r14e_producer_key.mjs
qmap_streaming_reduction_03_r14e_producer_grant.mjs
qmap_streaming_reduction_03_r14e_single_flight.mjs
qmap_streaming_reduction_03_r14e_warm_final_surface.mjs
qmap_streaming_reduction_03_r14e_shared_tuple.mjs
qmap_streaming_reduction_03_r14e_adoption_binding.mjs
qmap_streaming_reduction_03_r14e_final_receipt.mjs
```

TypeScript:

```text
qmap-final-surface-types.ts
qmap-final-surface-coordinator-service.ts
qmap-final-surface-producer-key.ts
qmap-final-surface-producer-grant.ts
qmap-final-surface-warm-validation.ts
qmap-final-surface-adoption-binding.ts
qmap-final-surface-coordinator-receipt.ts
qmap-final-surface-consumer-request.ts
```

Required parent modifications include R14D reusable producer state, producer-key evidence, Preview/Export product methods, equal-revision scheduler join, consumption history, session adoption, service token and runtime modules.

## 22. Stable errors

```text
E_QMAP03G_R14E_COORDINATOR_REQUIRED
E_QMAP03G_R14E_COORDINATOR_NOT_READY
E_QMAP03G_R14E_ADOPTION_BINDING_REQUIRED
E_QMAP03G_R14E_SESSION_GENERATION_STALE
E_QMAP03G_R14E_PRODUCT_REQUEST_INVALID
E_QMAP03G_R14E_PRODUCER_KEY_INVALID
E_QMAP03G_R14E_PRODUCER_KEY_MISMATCH
E_QMAP03G_R14E_CONSUMER_KIND_INVALID
E_QMAP03G_R14E_PRODUCER_GRANT_REQUIRED
E_QMAP03G_R14E_PRODUCER_GRANT_REPLAY
E_QMAP03G_R14E_PRODUCER_GRANT_STALE
E_QMAP03G_R14E_R14D_PRODUCER_REQUIRED
E_QMAP03G_R14E_R14D_RECEIPT_INVALID
E_QMAP03G_R14E_R14D_DUPLICATE_EXECUTION
E_QMAP03G_R14E_PIPELINE_PUBLICATION_MISSING
E_QMAP03G_R14E_PIPELINE_PUBLICATION_MISMATCH
E_QMAP03G_R14E_FINAL_SURFACE_RECORD_MISSING
E_QMAP03G_R14E_FINAL_SURFACE_EVIDENCE_INVALID
E_QMAP03G_R14E_WARM_SURFACE_STALE
E_QMAP03G_R14E_WARM_DEVICE_MISMATCH
E_QMAP03G_R14E_WARM_SOURCE_MISMATCH
E_QMAP03G_R14E_PREVIEW_REQUEST_INVALID
E_QMAP03G_R14E_PREVIEW_REVISION_STALE
E_QMAP03G_R14E_PREVIEW_SAME_REVISION_DUPLICATE
E_QMAP03G_R14E_PREVIEW_PIN_FAILED
E_QMAP03G_R14E_EXPORT_REQUEST_INVALID
E_QMAP03G_R14E_EXPORT_REVISION_STALE
E_QMAP03G_R14E_EXPORT_PIN_FAILED
E_QMAP03G_R14E_EXPORT_DIMENSION_MISMATCH
E_QMAP03G_R14E_SHARED_TUPLE_MISMATCH
E_QMAP03G_R14E_CONSUMER_PIN_DUPLICATE
E_QMAP03G_R14E_CONSUMER_PIN_LEAK
E_QMAP03G_R14E_QMAP_DUPLICATE_EXECUTION
E_QMAP03G_R14E_QWAVE_DUPLICATE_EXECUTION
E_QMAP03G_R14E_EFC_DUPLICATE_EXECUTION
E_QMAP03G_R14E_PIPELINE_WRITER_DUPLICATE
E_QMAP03G_R14E_QRC02_ROUTE_FORBIDDEN
E_QMAP03G_R14E_SYNTHETIC_PRODUCER_FORBIDDEN
E_QMAP03G_R14E_SHARED_PRODUCER_FAILED
E_QMAP03G_R14E_IN_FLIGHT_LEAK
E_QMAP03G_R14E_PREVIEW_EXPORT_REBIND_FAILED
E_QMAP03G_R14E_OLD_GRANT_ACCEPTED
E_QMAP03G_R14E_PHYSICAL_CONSUMER_CLOSURE_REQUIRED
```

## 23. Gate contract

```text
Source Gates = 384
Negative Controls = 176
Physical E-gate definitions = 112
```

Source gates cover coordinator ownership, producer-key exactness, one-shot grants, same-key single-flight, R14D delegation, Pipeline/Surface verification, warm reuse, session adoption, Preview/Export paths, scheduler coalescing, tuple history, pin lifetime, cancellation/failure, QRC02/synthetic denial, parent regressions and completion state.

Physical families:

```text
E001-E008   packaged adoption authority
E009-E016   producer-key exactness
E017-E024   cold leader and grant
E025-E032   same-key join
E033-E040   one R14D producer execution
E041-E048   shared publication verification
E049-E056   cold Preview consumption
E057-E064   cold Export consumption
E065-E072   cold tuple parity
E073-E080   warm Preview reuse
E081-E088   warm Export reuse
E089-E096   no duplicate producer execution
E097-E104   pin/scheduler/history closure
E105-E112   aggregate seal
```

## 24. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R14E_FINAL_SURFACE_PRODUCT_COORDINATOR_ONE_PRODUCER_GRANT_PER_COLD_KEY_PREVIEW_EXPORT_SAME_KEY_SINGLE_FLIGHT_R14D_PRODUCER_DELEGATION_EXACT_PIPELINE_PUBLICATION_VERIFICATION_WARM_FINAL_SURFACE_REUSE_PREVIEW_PRODUCT_CONSUMER_ADOPTION_EXPORT_PRODUCT_CONSUMER_ADOPTION_READ_ONLY_DISTINCT_CONSUMER_PINS_SAME_REVISION_PREVIEW_SCHEDULER_JOIN_SHARED_FINAL_SURFACE_TUPLE_MATCH_ZERO_DUPLICATE_QMAP_QWAVE_EFC_EXECUTION_ZERO_QRC02_PRODUCT_EXECUTION_AWAITING_PACKAGED_PREVIEW_EXPORT_DIRECT_PRODUCT_CLOSURE
```

Required source facts:

```text
Source Gates = 384/384
Negative Controls = 176/176
Physical E gates = 112 definitions
expected leaders / joiners / warm = 1 / 1 / 2
expected producer grants = 1
expected R14D transactions = 1
expected producer submissions / fences = 8 / 8
expected final surfaces = 1
expected consumer requests = 4
expected Preview pins = 2/2
expected Export pins = 2/2
expected shared parity = MATCHED
physical E gates executed = 0/112
packaged Preview/Export closure = false
```

## 25. Physical completion state

```text
PACKAGED_PREVIEW_EXPORT_DIRECT_PRODUCT_CLOSURE_BAKED_QMAP_STREAMING_REDUCTION_03G_R14E_ONE_COLD_FINAL_SURFACE_PRODUCER_GRANT_ONE_R14D_PRODUCT_TRANSACTION_ONE_QMAP_QWAVE_EFC_EXECUTION_ONE_PIPELINE_FINAL_REVISION_PREVIEW_EXPORT_SAME_KEY_SINGLE_FLIGHT_DISTINCT_READ_ONLY_CONSUMER_PINS_SHARED_SAME_REVISION_FINAL_SURFACE_MATCHED_PREVIEW_EXPORT_TUPLE_TWO_WARM_FINAL_SURFACE_REUSES_ZERO_WARM_PRODUCER_SUBMISSIONS_ZERO_DUPLICATE_QMAP_OR_EFC_EXECUTION_ZERO_QRC02_PRODUCT_EXECUTION_ZERO_CONSUMER_PIN_LEAK_READY_FOR_MULTI_RESOLUTION_AND_DEVICE_LOSS_PRODUCT_SOAK
```

Physical PASS requires E001-E112 = 112/112. Source fixture execution cannot produce this state.

## 26. Package policy

The code ZIP includes coordinator, producer request/key/grant, single-flight, warm validation, Preview/Export product methods, equal-revision scheduler coalescing, ledger history, session adoption, E001-E112 definitions and source/physical tools.

It excludes this specification, private keys, real permits, generated E receipts, physical Merkle/receipt, real Preview images, exported files, 4K/8K/device-loss artifacts, logs, reports, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 27. Next boundary

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R14F

4K·8K Cold Product Execution /
Multi-Revision Final-Surface Supersession /
Concurrent Preview·Export Burst /
Warm QMap and Warm Final-Surface Soak /
Product Device-Loss Recovery /
Consumer Pin Recovery /
Installed Real Startup Canary /
R14 W001-W096 Physical Closure Seal
```

## 28. Final seal

R14E gives Preview and Export one producer doorway. The first exact producer key becomes a cold leader; the second joins the same promise. R14D runs once and produces one Pipeline final surface. Each consumer acquires its own read-only pin and records the same shared tuple.

Repeated same-key requests validate the current Pipeline publication and reuse it without another grant, QMap execution, QWave build, EFC graph, Surface registration or Pipeline publication.

Pipeline remains final-publication SSOT, Surface Registry remains GPU-resource/pin SSOT, the coordinator owns only producer single-flight, and the consumption ledger remains tuple-parity/history SSOT.
