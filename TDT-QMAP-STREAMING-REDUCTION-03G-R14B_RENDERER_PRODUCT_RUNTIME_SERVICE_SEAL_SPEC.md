# TDT-QMAP-STREAMING-REDUCTION-03G-R14B

## Renderer Product Runtime Service / Live GPU Authority Composition / Product Root Lifetime / Real Bridge Ownership / Runtime Module Registration / Device Epoch Holder / Global Bridge Promotion Preparation / No Preview·Export Binding Yet Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R14B
Short ID = QSR03G-R14B
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R14A
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

R14B gives the real R14 product root and real QSR03G bridge one canonical Renderer owner.

R14B consumes the R14A product invocation factory and R14 product root/bridge factories. It does not activate QSR03G, write the global bridge slot, bind Preview or Export, run QMap, publish AFT00 fields, replace the startup canary, issue a new installed session, or mutate Package A retention.

## 1. Confirmed gap

The parent contains real product invocation, root and bridge factories, but no Renderer service owns their lifetime. Existing bootstrap code only asserts an already installed global bridge and cannot compose live dependencies, register GPU recovery, or prepare an atomic QRC02 to QSR03G transition.

R14B adds:

```text
SERVICE_IDS.qmapProductRuntime
dadum.runtime.qmap-product-runtime
QMapProductRuntimeService
dadum.module.qmap-product-runtime-r14b
dadum.qmap.product-runtime.staged
```

## 2. Required terminal state

```text
runtime service instances = 1
real product roots = 1
real staged bridges = 1
bridge state = STAGED
GPU recovery participants = 1
promotion candidates = 1
long-lived GPU leases = 0
global bridge writes = 0
QSR03G activation calls = 0
QMap operations = 0
queue submissions = 0
AFT00 publications = 0
Preview bindings = 0
Export bindings = 0
```

## 3. SSOT and ownership

```text
RuntimeServiceContainer
= service-instance SSOT

QMapProductRuntimeService
= product root, staged bridge, authority tuple and promotion-candidate owner

GpuDeviceAuthorityService
= raw GPUDevice, GPUQueue and device-epoch SSOT

InstalledAdmissionService
= installed product authority source

R10 atomic bridge writer
= global bridge slot SSOT
```

The service holds no raw GPUDevice or GPUQueue. R14A product invocations later acquire attempt-local GPU leases.

The root and staged bridge are not stored in Pinia, Vue state, Electron Main, Preview, Export or unrestricted window globals.

## 4. State machine

```text
NEW
→ INITIALIZING
→ SESSION_BOUND
→ DEPENDENCIES_BOUND
→ ROOT_READY
→ BRIDGE_STAGED
→ RECOVERY_REGISTERED
→ PROMOTION_PREPARED
```

Recovery:

```text
RECOVERY_REGISTERED or PROMOTION_PREPARED
→ DEVICE_INVALIDATING
→ DEVICE_EPOCH_PENDING
→ DEVICE_REBUILT
→ prior prepared state
```

Disposal:

```text
BRIDGE_STAGED or prepared state
→ DRAINING
→ QUIESCENT
→ DISPOSING
→ DISPOSED
```

`ACTIVE_PRODUCT` remains R14C authority.

## 5. Installed authority tuple

R14B requires an installed-strict, normal-user-work session with qualification disabled.

Required session fields:

```text
packageContentId
qmapProductPromotionPermitDigest
qmapActiveProductPointerDigest
qmapPhysicalMerkleRoot
qmapPromotionGeneration
qmapBridgeImplementationDigest
qrc02RollbackImplementationDigest
qmapInstalledProductBundleDigest
qmapInstalledProductBundleGeneration
qmapProductRouteGeneration
deviceEpoch
```

The session device epoch must equal the active GPU authority epoch.

Schema:

```text
tdt.qmap.renderer-product-authority.qsr03g-r14b.v1
```

The immutable tuple binds package, permit, pointer, R9 root, bundle, route generation, installed session, runtime epoch, device profile and GPU identity. Its digest binds root and bridge construction.

A package, bundle, route or installed-session generation change requires a new service lifetime.

## 6. Live dependency composition

Required adapters:

```text
createRendererQsr03gR14BLiveDependencyInput()
createQsr03gR14BRendererDependencies()
```

The dependency graph reuses canonical GPU, surface, Analysis Field, runtime-asset, spectral and Pipeline services.

Required product authorities:

```text
product request authority
product publication authority
GPU lease facade
Final EWA product authority facade
pipeline authority facade
attempt-local allocator factory
encoder factory
AnalysisFieldAuthority
product Analysis producer authority
published-field describe, pin and retire adapters
```

Forbidden packaged dependencies:

```text
candidate authorities
qualification authorities
QRC02 dependencies
mock authorities
development adapters
duplicate authority IDs
caller-owned GPU authorities
```

Pre-R14C execution facades fail closed if called.

## 7. GPU consumer admission

The canonical GPU consumer manifest adds:

```text
dadum.gpu.consumer.qmap-product-runtime-r14b
```

Permitted future purposes are product invocation, product pipeline and product recovery. R14B initialization acquires no long-lived lease.

## 8. Product root lifetime

The service constructs exactly one:

```text
createQsr03gR14ProductRoot(liveDependencies)
```

Required root facts:

```text
realProductRuntime = true
candidateOnly = false
globalBridgePromotionAdmitted = true
appMode = PACKAGED_PRODUCT
```

The root binds the installed authority tuple and remains one object for the Renderer runtime epoch.

Across GPU device recovery:

```text
root count before = 1
root count after = 1
root identity unchanged = true
raw old-device resources reused = 0
```

## 9. Real staged bridge

The service constructs exactly one:

```text
createQsr03gR14LiveProductBridge(root)
```

Required bridge facts:

```text
realRuntimeBridge = true
route = QSR03G
qrc02Fallback = false
state = STAGED
permit digest = installed permit digest
bundle generation = installed bundle generation
promotion generation = installed product-route generation
```

R14B may call only lifecycle inspection, epoch invalidation, drain, quiescence, warm clearing and shutdown methods.

Calls to `activateProduct()` and `ensureQMapForConvergence()` are forbidden. A normal request against the staged bridge must fail with route-not-promoted.

## 10. Runtime module registration

Required module:

```text
id = dadum.module.qmap-product-runtime-r14b
phase = pipeline
required = true
ownsServices = SERVICE_IDS.qmapProductRuntime
provides = dadum.qmap.product-runtime.staged
```

Required dependencies:

```text
dadum.module.gpu-authority-v1
dadum.module.surface-lifecycle-v1
dadum.module.analysis-field-truth-v1
dadum.module.spectral-qmap-02-v1
dadum.module.spectral-qmap-03-v1
dadum.module.pipeline-v1
dadum.module.resample-compatibility-v1
dadum.module.installed-admission-r11a
```

Transitional order remains:

```text
installed admission
→ R14B staged product runtime
→ Preview
→ Export
```

Preview and Export do not yet consume the staged capability.

## 11. Device epoch holder and recovery

The local holder mirrors GPU authority identity and cannot increment epochs independently.

Recovery participant:

```text
participantId = dadum.qmap.product-runtime.qsr03g-r14b
registration count = 1
```

Invalidate phase verifies the old identity and invalidates old-epoch warm fields through the staged bridge.

Rebuild requires:

```text
new runtime epoch = old runtime epoch
new device epoch = old + 1
new device identity != old identity
adapter identity remains admitted
```

Root and bridge identities remain unchanged.

Recovery receipt schema:

```text
tdt.qmap.renderer-product-runtime-rebuild.qsr03g-r14b.v1
```

It binds old/new GPU identities, root digest, bridge implementation, authority tuple, warm invalidation count and `oldResourceReuseCount=0`.

## 12. Promotion preparation

R14B reads:

```text
globalThis.__DADUM_QMAP_RUNTIME_BRIDGE__
```

The current object must be QRC02. R14B captures its exact object identity and exact property descriptor.

`prepareGlobalPromotion()` verifies the staged QSR03G bridge and seals:

```text
tdt.qmap.global-promotion-candidate.qsr03g-r14b.v1
```

The candidate binds:

```text
current QRC02 identity and descriptor digest
QRC02 rollback implementation digest
staged root digest
staged bridge implementation digest
product authority tuple digest
expected bundle generation
expected product-route generation
```

Required counters:

```text
globalWrites = 0
qrc02DrainCount = 0
qsr03gActivationCount = 0
```

R14B does not drain or demote QRC02, activate QSR03G, write/delete/redefine the global property, or create a missing-bridge interval.

## 13. No consumer or startup-canary binding

```text
Preview calls into R14B service = 0
Export calls into R14B service = 0
producer grants = 0
final-surface transactions = 0
window.DadumQsr03gProductStartupCanary writes = 0
InstalledAdmissionService modifications = 0
real startup canary bound = false
```

## 14. Initialization and disposal

Concurrent initialization shares one promise.

```text
dependency compositions = 1
root constructions = 1
bridge constructions = 1
recovery registrations = 1
promotion candidates <= 1
```

Disposal unregisters recovery, drains the staged bridge, waits for quiescence, clears warm entries, shuts down and clears private references. It never writes the global bridge.

## 15. Receipt evidence

Serializable evidence contains service state, authority tuple digest, package/permit/bundle/route identities, root and bridge digests/counts, current device identity, recovery count, promotion-candidate digest and all zero-activity counters.

Forbidden serialization:

```text
GPUDevice
GPUQueue
GPUTexture
GPUBuffer
root object
bridge object
session MAC
operation-grant MAC
private capability tokens
```

## 16. Required files

```text
app/src/runtime/qmap/qmap-product-runtime-service.ts
app/src/runtime/qmap/qmap-product-runtime-types.ts
app/src/runtime/qmap/qmap-product-authority-binding.ts
app/src/runtime/qmap/qmap-product-live-dependency-adapter.ts
app/src/runtime/qmap/qmap-product-device-epoch-holder.ts
app/src/runtime/qmap/qmap-product-recovery-participant.ts
app/src/runtime/qmap/qmap-product-promotion-candidate.ts
app/src/runtime/qmap/qmap-product-runtime-receipt.ts

qmap_streaming_reduction_03_r14b_contract.mjs
qmap_streaming_reduction_03_r14b_product_authority_tuple.mjs
qmap_streaming_reduction_03_r14b_renderer_dependency_adapter.mjs
qmap_streaming_reduction_03_r14b_device_epoch_holder.mjs
qmap_streaming_reduction_03_r14b_recovery_receipt.mjs
qmap_streaming_reduction_03_r14b_promotion_candidate.mjs
qmap_streaming_reduction_03_r14b_renderer_product_runtime_service.mjs

app/src/runtime/service-token.ts
app/src/boot/runtime-modules.ts
app/src/runtime/gpu/gpu-consumer-manifest.json
```

## 17. Source and physical gates

```text
Source Gates = 288
Negative Controls = 128
Physical B-gate definitions = 72
```

Source gates cover scope, service/module registration, installed authority, dependency composition, one-root and one-bridge ownership, epoch mirroring, GPU recovery, promotion preparation, QRC02 preservation, zero consumer/canary binding, initialization/disposal, serialization and A-R14A regressions.

Negative controls cover missing/duplicate services, incomplete sessions, duplicate authorities, candidate/QRC02 leakage, long-lived GPU leases, duplicate roots/bridges, premature activation/execution, manual epoch changes, old-resource reuse, global bridge mutation, consumer/canary binding, serialization leaks and false promotion claims.

Physical gates:

```text
B001-B008   packaged runtime composition
B009-B016   installed authority tuple
B017-B024   live dependency composition
B025-B032   product root lifetime
B033-B040   staged bridge
B041-B048   GPU recovery participant
B049-B056   recovery receipt
B057-B064   promotion preparation and QRC02 preservation
B065-B072   disposal and final seal
```

## 18. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R14B_
RENDERER_PRODUCT_RUNTIME_SERVICE_
CANONICAL_SERVICE_TOKEN_AND_MODULE_
INSTALLED_PRODUCT_AUTHORITY_TUPLE_
LIVE_GPU_AUTHORITY_COMPOSITION_
ONE_PRODUCT_ROOT_PER_RUNTIME_EPOCH_
ONE_REAL_STAGED_BRIDGE_
GPU_RECOVERY_PARTICIPANT_
DEVICE_EPOCH_HOLDER_
GLOBAL_QRC02_DESCRIPTOR_CAPTURE_
PROMOTION_CANDIDATE_PREPARED_
ZERO_GLOBAL_BRIDGE_WRITE_
ZERO_PREVIEW_EXPORT_BINDING_
AWAITING_ATOMIC_GLOBAL_BRIDGE_PROMOTION
```

Required source facts:

```text
Source Gates = 288/288
Negative Controls = 128/128
Physical B gates = 72 definitions
service instances = 1
root instances = 1
bridge instances = 1
bridge state = STAGED
recovery participant definitions = 1
global bridge writes = 0
QMap operations = 0
queue submissions = 0
Preview bindings = 0
Export bindings = 0
physical B gates executed = 0/72
real product promotion = false
```

## 19. Physical completion state

```text
PACKAGED_RENDERER_PRODUCT_RUNTIME_BAKED_
QMAP_STREAMING_REDUCTION_03G_R14B_
INSTALLED_PRODUCT_AUTHORITY_BOUND_
LIVE_GPU_DEPENDENCIES_COMPOSED_
ONE_PRODUCT_ROOT_
ONE_REAL_STAGED_QSR03G_BRIDGE_
GPU_RECOVERY_PARTICIPANT_ACTIVE_
DEVICE_EPOCH_ADVANCE_VERIFIED_
ROOT_AND_BRIDGE_IDENTITY_PRESERVED_
GLOBAL_QRC02_DESCRIPTOR_CAPTURED_
PROMOTION_CANDIDATE_VERIFIED_
ZERO_GLOBAL_BRIDGE_WRITE_
ZERO_QMAP_EXECUTION_
ZERO_PRIVATE_RESOURCE_LEAK_
READY_FOR_ATOMIC_GLOBAL_BRIDGE_PROMOTION
```

## 20. Package policy

The code ZIP includes the service, module/token integration, GPU consumer admission, authority tuple, live dependency composition, staged root/bridge ownership, recovery participant, promotion candidate, B001-B072 definitions and source/physical tools.

It excludes this specification, private keys, real product permits, generated B receipts, physical Merkle/receipt, real global bridge writes, real QMap publications, logs, reports, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 21. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R14C

Main-to-Renderer Product Bootstrap Authority /
Exact QRC02 Descriptor Capture /
QRC02 Drain and Quiescence /
Atomic Global Bridge Compare-and-Swap /
Real QSR03G Bridge Activation /
Installed Session Generation Rebind /
Rollback Descriptor Preservation /
No Preview·Export Binding Yet Seal
```

R14C alone may drain QRC02, perform the global compare-and-swap, activate QSR03G and seal the promotion receipt.

## 22. Final seal

R14B gives the real product runtime a canonical Renderer home. One runtime service owns one real product root and one real staged QSR03G bridge. It consumes installed authority, composes canonical services and registers one GPU recovery participant without holding raw GPU objects.

Device recovery advances the verified epoch mirror while preserving root and bridge identities. The existing QRC02 global object and descriptor are captured exactly. One promotion candidate is sealed, but no global write, QRC02 drain, QSR03G activation, QMap execution, Preview/Export binding or startup-canary replacement occurs.

R14B closes ownership, lifetime and promotion preparation. R14C performs the atomic authority switch.
