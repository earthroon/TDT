# TDT-QMAP-STREAMING-REDUCTION-03G-R14D-R1

## Live Product Dependency Closure / Pre-Session Startup Canary Boundary / Real Final-EWA Product Authority / Current-Device Pipeline Bundle / Tracked Allocator·Encoder Factory / No Throw-Stub Product Invocation Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R14D-R1
Short ID = QSR03G-R14D-R1
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R14E
Repair target = R14B live product dependency composition
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

R14D-R1 is a corrective insertion below the R14D/R14E product graph. It replaces the physical dependency throw stubs that prevented the R14A product invocation from reaching command-recording authority, and it establishes a pre-installed-session startup-canary boundary.

R14D-R1 does not execute QMap chunks, publish AFT00 fields, record the R9A EFC graph, transfer a final surface to Pipeline, bind Preview or Export, or satisfy the installed 8-submission startup canary. Those remain later physical boundaries.

## 1. Confirmed parent defects

The inspected R14E parent contains the following hard stops:

```text
finalEwaProductAuthority.acquireForProductAttempt()
→ E_QMAP03G_R14B_PRODUCT_ACTIVATION_FORBIDDEN

pipelineAuthority.acquire()
→ E_QMAP03G_R14B_PRODUCT_ACTIVATION_FORBIDDEN

resourceAllocatorFactory()
→ E_QMAP03G_R14B_PRODUCT_ACTIVATION_FORBIDDEN

encoderFactory()
→ E_QMAP03G_R14B_PRODUCT_ACTIVATION_FORBIDDEN
```

The parent Analysis producer adapter returns a synthetic success rather than verifying the canonical registry. The raw GPU lease also lacks the normalized identity/limits/loss fields consumed by the QSR03G invocation core.

Installed strict boot reads `window.DadumQsr03gProductStartupCanary`, but the parent contains no runtime writer. This creates a cycle:

```text
InstalledAdmission requires startup canary
→ R14B runtime requires installed session
→ R14D producer requires R14B/R14C
→ startup canary cannot be created
```

Candidate physical pipeline, encoder and tracked-allocation implementations already exist, but their public R3 files and receipts are candidate-bound. R14D-R1 therefore extracts additional route-neutral cores and product adapters without replacing the existing R3 public surfaces.

## 2. Scope

R14D-R1 implements:

```text
normalized product GPU-device lease adapter
real Final EWA product capability registry and attempt pin
route-neutral live QMap pipeline core
current-device product pipeline adapter
route-neutral live command-encoder core
product command-encoder adapter
attempt-local tracked allocator
real Analysis producer registry verification
corrected R14B live dependency composition
1080p / 4K / 8K product invocation assembly preflight
failure-atomic reverse cleanup
pre-session startup-canary service and frozen facade
explicit fail-closed physical-canary executor port
```

R14D-R1 keeps the following at zero:

```text
queue submissions
fence waits
QMap publications
warm QMap entries
global bridge writes
Preview bindings
Export bindings
installed physical startup-canary passes
```

## 3. Required source terminal state

```text
throw-stub product dependencies = 0
live product dependency graphs = 1
real product invocation factories = 1
1080p assemblies = 1
4K assemblies = 1
8K assemblies = 1
Final EWA attempt pins acquired / released = 3 / 3
GPU leases acquired / released = 3 / 3
shader modules created = 12
compute pipelines created = 21
explicit bind-group layouts = 12
tracked allocator terminal balance = 0
queue submissions = 0
QMap publications = 0
global bridge writes = 0
pre-session canary facades = 1
physical startup-canary executor = pending
```

Required behavior:

```text
createQsr03gR14ProductInvocation()
→ returns immutable product invocation
→ contains live Final EWA binding, current-device pipeline bundle,
  tracked allocator and product encoder factory
→ does not throw E_QMAP03G_R14B_PRODUCT_ACTIVATION_FORBIDDEN
```

## 4. State ownership and SSOT

```text
GPUDevice / GPUQueue / device epoch
= GpuDeviceAuthorityService

normalized product lease
= QMapProductDeviceLeaseAuthority

upstream Final EWA texture
= upstream Final EWA surface authority

public Final EWA capability resolution
= FinalEwaProductCapabilityRegistry

attempt-local Final EWA pin
= FinalEwaProductAuthorityService

QMap pipeline bundles
= QMapProductPipelineAuthorityService

attempt allocations
= QMapProductTrackedAllocator

chunk command encoder
= product invocation attempt

Analysis producer registration
= AnalysisFieldAuthorityService producer registry

pre-session canary state
= PreSessionQmapStartupCanaryService
```

The window global is a frozen canary facade only. It does not own the service or any GPU resource.

## 5. Corrected dependency architecture

```text
GpuDeviceAuthorityService
→ QMapProductDeviceLeaseAuthority

FinalEwaProductCapabilityRegistry
+ SurfaceRegistryAuthorityService
→ FinalEwaProductAuthorityService

GpuDeviceAuthorityService
+ RuntimeAssetAuthority
→ QMapProductPipelineAuthorityService

GpuDeviceAuthorityService
→ QMapProductTrackedAllocatorFactory

QMapProductDeviceLease
→ QMapProductEncoderFactory

AnalysisFieldAuthorityService
→ QMapProductAnalysisProducerAuthority

all physical authorities
→ createRendererQsr03gR14BLiveDependencyInput()
→ createQsr03gR14ALiveProductDependencies()
→ R14 product root
```

Dependencies are physical from root construction onward. Route activation is not represented by replacing dependency objects.

## 6. Staged bridge admission

Execution denial belongs to the bridge lifecycle:

```text
STAGED → product request rejected
ACTIVATION_PREPARED → product request rejected
ACTIVE_PRODUCT → request may enter physical dependencies
```

The physical dependency services remain callable. No Final EWA, pipeline, allocator or encoder method may throw the old R14B activation-forbidden error solely because the bridge was staged.

QRC02 fallback remains false.

## 7. Product GPU lease authority

Required service:

```text
QMapProductDeviceLeaseAuthority
service ID = dadum.runtime.qmap-product-device-lease
GPU consumer ID = dadum.gpu.consumer.qmap-product-runtime-r14dr1
```

Required method:

```text
acquire(expectedDeviceEpoch, expectedDeviceIdentityDigest)
```

It wraps the canonical GPU authority lease and returns:

```text
leaseId
ownerId
purpose
runtimeEpoch
deviceEpoch
deviceIdentity
deviceIdentityDigest
device
queue
immutable limits snapshot
loss promise
assertCurrent()
release()
```

Before return, it verifies the active GPU state, admitted owner, runtime/device epoch, device identity and minimum QSR03G limits.

## 8. Final EWA capability and private registry

Public schema:

```text
tdt.final-ewa.product-capability.qsr03g-r14dr1.v1
```

Public fields bind source surface/revision, dimensions, `rgba16float`, Final EWA identity, descriptor digest, low-pass receipt, runtime/device identity, producer receipt and expiry.

Public capabilities contain no GPUTexture, GPUTextureView, SurfacePin, bind group or raw registry record.

Private registry state binds the public capability ID to the exact upstream surface, resource identity, descriptor, device binding, source lineage, low-pass receipt, active pins and retirement state.

## 9. Real Final EWA product authority

Required service:

```text
FinalEwaProductAuthorityService
authority ID = dadum.final-ewa-product-authority.qsr03g-r14dr1
```

`acquireForProductAttempt()` performs:

```text
validate capability digest and expiry
resolve private registry entry
validate source lineage
validate descriptor and format
validate runtime/device identity
acquire one read-only upstream surface pin
create one texture view
seal one attempt-pin receipt
return immutable attempt binding
```

The attempt binding contains the private texture/view, descriptor and lineage required by QSR03C. The upstream texture remains borrowed and may never be destroyed by the invocation.

All normal, failure, cancellation and device-loss paths release the attempt pin exactly once.

## 10. Route-neutral pipeline core

Required core:

```text
createQsr03gLivePipelineCore()
```

It owns physical creation for:

```text
Final EWA extraction pipeline
Stockham stage pipeline
transpose pipeline
power first-partial pipeline
partial merge pipeline
compact finalizer pipeline
QMap projection pipeline
```

Required source counts per device bundle:

```text
shader modules = 4
compute pipelines = 7
explicit bind-group layouts = 4
```

The core contains no candidate run ID, qualification fixture, product session or bridge lifecycle state.

The existing R3 public pipeline authority remains intact. Candidate and product adapters are separate consumers of physical cores and use distinct authority/receipt identities.

## 11. Current-device product pipeline authority

Required service:

```text
QMapProductPipelineAuthorityService
authority ID = dadum.qmap.product-pipeline-authority.qsr03g-r14dr1
```

Cache key:

```text
device epoch
device identity digest
shader-set digest
pipeline ABI digest
route adapter ID
```

Same current-device key reuses a bundle. Changed device epoch, identity or shader digest creates a new bundle. GPU recovery removes old-device cache entries. No pipeline object crosses device epochs.

## 12. Product tracked allocator

Required factory:

```text
createQsr03gR14DR1TrackedAllocatorFactory()
```

It wraps the existing tracked allocation core with product authority identity and rejects `ROOT` scope for operation scratch.

Tracked roles include:

```text
scratchA / scratchB
transposeA / transposeB
powerLocal
partialA / partialB
failureLocal
stageParameterTable
chunkControl
compactTarget
qmapTarget
```

All scratch uses `OPERATION_PRIVATE`. Published Analysis resources may transfer to `ANALYSIS_OWNED`, but R14D-R1 publishes nothing, so preflight terminal balance must be zero.

## 13. Route-neutral encoder core and product adapter

Required core:

```text
createQsr03gLiveEncoderFactoryCore()
```

Required product adapter:

```text
createQsr03gProductEncoderFactoryR14DR1()
authority ID = dadum.qmap.product-command-encoder-authority.qsr03g-r14dr1
```

The encoder tracks compute-pass state, pipeline/bind-group events, dispatches, chunk identity and one authority-owned finish. Native finish bypass, double finish, recording after finish and finish with an open pass fail closed.

Product command-graph receipt schema:

```text
tdt.qmap.product-command-graph.qsr03g-r14dr1.v1
```

Candidate encoder public behavior remains regression-preserved.

## 14. Real Analysis producer verification

Required authority:

```text
QMapProductAnalysisProducerAuthority
producer = tdt.analysis.producer.qmap.normalized-response
semantic = tdt.analysis.qmap.normalized-response.v1
route = PRODUCT
```

`assertProductQmapProducerRegistered()` queries the canonical producer registry and verifies product-route admission, semantic and registry version. Constant success and silent self-registration are forbidden.

## 15. Corrected R14B live dependency adapter

The adapter receives and forwards the actual services:

```text
deviceAuthority
finalEwaProductAuthority
pipelineAuthority
resourceAllocatorFactory
encoderFactory
analysisFieldAuthority
productAnalysisProducerAuthority
productRequestAuthority
productPublicationAuthority
describe / pin / retire published field
retire incoming Final EWA reservation
```

Dependency receipt schema:

```text
tdt.qmap.live-product-dependency-closure.qsr03g-r14dr1.v1
```

Required terminal values:

```text
duplicate authority count = 0
candidate authority count = 0
QRC02 dependency count = 0
throw-stub count = 0
mock authority count = 0
development adapter count = 0
```

## 16. Product invocation preflight

Required method:

```text
QMapProductRuntimeService.preflightProductInvocation()
```

Allowed modes:

```text
PRE_SESSION_CANARY
SOURCE_PHYSICAL_ASSEMBLY
```

Preflight sequence:

```text
obtain bootstrap challenge
obtain live Final EWA capability
normalize product request
assemble R14A product invocation
verify physical dependency fields
dispose without QMap execution
assert allocator/pin/lease closure
seal preflight receipt
```

Receipt schema:

```text
tdt.qmap.product-invocation-preflight.qsr03g-r14dr1.v1
```

Required terminal values:

```text
queue submissions = 0
QMap publications = 0
warm entries = 0
terminal private-resource balance = 0
```

The source matrix performs this assembly for 1920×1080, 3840×2160 and 7680×4320.

## 17. Pre-session startup canary service

Required service/module:

```text
PreSessionQmapStartupCanaryService
dadum.runtime.qmap-pre-session-startup-canary
dadum.module.qmap-pre-session-startup-canary-r14dr1
phase = pre-admission
```

It depends on GPU, Surface Registry, Analysis Field, Runtime Assets, Final EWA capability registry and the physical QMap dependency services. It initializes before installed admission.

It registers the exact frozen facade expected by installed strict boot:

```text
window.DadumQsr03gProductStartupCanary
```

Facade methods:

```text
run(request)
status()
```

The facade exposes no service object or GPU resource.

## 18. Startup canary boundary

R14D-R1 supplies dependency preflight:

```text
live GPU lease
live Final EWA pin
current-device pipelines
tracked allocator
product encoder
real Analysis lease
product invocation assembly
zero queue work
clean disposal
```

Physical execution is an explicit required port:

```text
Qsr03gPreSessionPhysicalCanaryExecutor
```

R14D-R1 does not fabricate its result. Installed strict mode fails with:

```text
E_QMAP03G_R14DR1_PHYSICAL_CANARY_EXECUTOR_REQUIRED
```

until R14D-R2 supplies the executor.

Existing strict checks remain unchanged:

```text
hardwareGpu = true
productReferenceExact = true
aggregateSubmissions = 8
aggregateFences = 8
pipelineFinalPublications = 1
qrc02ProductExecutions = 0
pass = true
```

## 19. Bootstrap challenge and isolation

The Main-issued challenge binds build/package identity, expected bridge/shader digests, runtime/device identity, nonce, expiry and single use.

The canary Final EWA capability uses a deterministic packaged 1920×1080 `rgba16float` source, current device binding and purpose `STARTUP_CANARY`. It is retired after the run and cannot enter the normal warm cache.

During pre-session canary:

```text
global bridge writes = 0
QRC02 drains = 0
QSR03G global activations = 0
normal product sessions = 0
Preview bindings = 0
Export bindings = 0
```

If an isolated QSR03G root is needed, it uses `PACKAGED_PRE_SESSION_CANARY`, cannot promote globally, cannot retain warm fields and is destroyed after the canary transaction.

## 20. Boot order

```text
foundation
→ resources
→ GPU Authority
→ Surface Registry
→ Analysis Field Authority
→ Runtime Assets
→ R14D-R1 physical dependency services
→ PreSessionQmapStartupCanaryService
→ InstalledAdmissionService
→ R14B product runtime
→ R14C promotion
→ R14D producer
→ R14E coordinator
→ Preview
→ Export
```

Installed admission must not initialize before the canary facade exists.

## 21. Device recovery and cleanup

On device loss:

```text
old Final EWA capabilities invalidated
old attempt pins aborted
old pipeline cache entries removed
old pre-session canary receipt made stale
new challenge required before installed-session recovery
```

Assembly cleanup order:

```text
Analysis lease abort
QMap target destroy
compact target destroy
Final EWA streaming source retire
arena dispose
Final EWA attempt pin release
pipeline reference release
GPU lease release
allocator terminal assertion
```

Cleanup runs once, preserves the original error, continues through cleanup subfailures, never destroys the borrowed Final EWA texture and leaves zero operation-private resources.

## 22. Required implementation surfaces

TypeScript:

```text
qmap-product-device-lease-authority.ts
final-ewa-product-capability-types.ts
final-ewa-product-capability-registry.ts
final-ewa-product-authority-service.ts
qmap-product-pipeline-types.ts
qmap-product-pipeline-authority-service.ts
qmap-product-tracked-allocator.ts
qmap-product-encoder-factory.ts
qmap-product-analysis-producer-authority.ts
qmap-pre-session-canary-types.ts
qmap-pre-session-canary-challenge.ts
qmap-product-invocation-preflight.ts
qmap-pre-session-canary-source-provider.ts
qmap-pre-session-canary-service.ts
```

Runtime JavaScript:

```text
qmap_streaming_reduction_03_r14dr1_contract.mjs
qmap_streaming_reduction_03_live_pipeline_core.mjs
qmap_streaming_reduction_03_r3_candidate_pipeline_adapter.mjs
qmap_streaming_reduction_03_r14dr1_product_pipeline_adapter.mjs
qmap_streaming_reduction_03_live_encoder_core.mjs
qmap_streaming_reduction_03_r3_candidate_encoder_adapter.mjs
qmap_streaming_reduction_03_r14dr1_product_encoder_adapter.mjs
qmap_streaming_reduction_03_r14dr1_device_lease.mjs
qmap_streaming_reduction_03_r14dr1_final_ewa_capability.mjs
qmap_streaming_reduction_03_r14dr1_tracked_allocator.mjs
qmap_streaming_reduction_03_r14dr1_dependency_receipt.mjs
qmap_streaming_reduction_03_r14dr1_invocation_preflight.mjs
qmap_streaming_reduction_03_r14dr1_canary_receipt.mjs
```

Parent modifications include runtime service tokens/modules, GPU consumer manifest, R14B dependency adapter/runtime service, Analysis producer registry adapter, installed admission and environment types.

## 23. Stable errors

```text
E_QMAP03G_R14DR1_GPU_AUTHORITY_REQUIRED
E_QMAP03G_R14DR1_GPU_OWNER_NOT_ADMITTED
E_QMAP03G_R14DR1_GPU_LEASE_INVALID
E_QMAP03G_R14DR1_GPU_LEASE_EPOCH_MISMATCH
E_QMAP03G_R14DR1_GPU_LEASE_IDENTITY_MISMATCH
E_QMAP03G_R14DR1_GPU_LIMITS_INSUFFICIENT
E_QMAP03G_R14DR1_FINAL_EWA_REGISTRY_REQUIRED
E_QMAP03G_R14DR1_FINAL_EWA_CAPABILITY_INVALID
E_QMAP03G_R14DR1_FINAL_EWA_CAPABILITY_EXPIRED
E_QMAP03G_R14DR1_FINAL_EWA_CAPABILITY_RETIRED
E_QMAP03G_R14DR1_FINAL_EWA_SOURCE_MISMATCH
E_QMAP03G_R14DR1_FINAL_EWA_DESCRIPTOR_MISMATCH
E_QMAP03G_R14DR1_FINAL_EWA_DEVICE_MISMATCH
E_QMAP03G_R14DR1_FINAL_EWA_PIN_FAILED
E_QMAP03G_R14DR1_FINAL_EWA_PIN_DUPLICATE
E_QMAP03G_R14DR1_FINAL_EWA_PIN_LEAK
E_QMAP03G_R14DR1_PIPELINE_AUTHORITY_REQUIRED
E_QMAP03G_R14DR1_SHADER_ASSET_MISSING
E_QMAP03G_R14DR1_SHADER_DIGEST_MISMATCH
E_QMAP03G_R14DR1_PIPELINE_CREATION_FAILED
E_QMAP03G_R14DR1_PIPELINE_EPOCH_MISMATCH
E_QMAP03G_R14DR1_PIPELINE_CACHE_STALE
E_QMAP03G_R14DR1_ALLOCATOR_REQUIRED
E_QMAP03G_R14DR1_UNTRACKED_ALLOCATION
E_QMAP03G_R14DR1_RESOURCE_ROLE_INVALID
E_QMAP03G_R14DR1_RESOURCE_SCOPE_INVALID
E_QMAP03G_R14DR1_RESOURCE_BALANCE_NONZERO
E_QMAP03G_R14DR1_ENCODER_FACTORY_REQUIRED
E_QMAP03G_R14DR1_ENCODER_DEVICE_MISMATCH
E_QMAP03G_R14DR1_ENCODER_ALREADY_FINISHED
E_QMAP03G_R14DR1_ENCODER_PASS_OPEN
E_QMAP03G_R14DR1_ENCODER_ROUTE_MISMATCH
E_QMAP03G_R14DR1_ANALYSIS_PRODUCER_NOT_REGISTERED
E_QMAP03G_R14DR1_ANALYSIS_PRODUCER_ROUTE_MISMATCH
E_QMAP03G_R14DR1_THROW_STUB_DETECTED
E_QMAP03G_R14DR1_PRODUCT_DEPENDENCY_INCOMPLETE
E_QMAP03G_R14DR1_CANDIDATE_AUTHORITY_LEAK
E_QMAP03G_R14DR1_QRC02_DEPENDENCY_FORBIDDEN
E_QMAP03G_R14DR1_PRE_SESSION_CANARY_REQUIRED
E_QMAP03G_R14DR1_CANARY_CHALLENGE_INVALID
E_QMAP03G_R14DR1_CANARY_CHALLENGE_REPLAY
E_QMAP03G_R14DR1_CANARY_DEVICE_MISMATCH
E_QMAP03G_R14DR1_CANARY_PRELIGHT_FAILED
E_QMAP03G_R14DR1_PHYSICAL_CANARY_EXECUTOR_REQUIRED
E_QMAP03G_R14DR1_PRE_SESSION_GLOBAL_WRITE_FORBIDDEN
E_QMAP03G_R14DR1_INVOCATION_PREFLIGHT_FAILED
E_QMAP03G_R14DR1_QUEUE_SUBMISSION_FORBIDDEN
E_QMAP03G_R14DR1_QMAP_PUBLICATION_FORBIDDEN
E_QMAP03G_R14DR1_CLEANUP_FAILED
E_QMAP03G_R14DR1_PHYSICAL_DEPENDENCY_CLOSURE_REQUIRED
```

## 24. Gate contract

```text
Source Gates = 304
Negative Controls = 136
Physical R1 gate definitions = 80
```

Source gate families cover identity/scope, throw-stub removal, normalized GPU lease, Final EWA capability/pin, route-neutral pipeline and encoder cores, current-device cache, tracked allocation, Analysis producer registry, corrected dependency graph, 1080p/4K/8K assembly, reverse cleanup, staged bridge admission, pre-session facade, fail-closed physical executor, parent regressions and completion state.

Physical families:

```text
R1-001 to R1-008   pre-session module order
R1-009 to R1-016   Main challenge authority
R1-017 to R1-024   normalized GPU lease
R1-025 to R1-032   live Final EWA capability and pin
R1-033 to R1-040   current-device pipeline bundle
R1-041 to R1-048   tracked allocator
R1-049 to R1-056   product encoder
R1-057 to R1-064   R14A product invocation
R1-065 to R1-072   cleanup and epoch invalidation
R1-073 to R1-080   zero-work boundary seal
```

## 25. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R14D_R1_
LIVE_PRODUCT_DEPENDENCY_CLOSURE_
NORMALIZED_GPU_DEVICE_LEASE_
REAL_FINAL_EWA_PRODUCT_CAPABILITY_REGISTRY_
ATTEMPT_LOCAL_FINAL_EWA_PIN_
ROUTE_NEUTRAL_PIPELINE_CORE_
CURRENT_DEVICE_PRODUCT_PIPELINE_BUNDLE_
TRACKED_PRODUCT_ALLOCATOR_
PRODUCT_COMMAND_ENCODER_FACTORY_
REAL_ANALYSIS_PRODUCER_REGISTRATION_
NO_THROW_STUB_PRODUCT_INVOCATION_
PRE_SESSION_STARTUP_CANARY_FACADE_
ZERO_QUEUE_SUBMISSION_PREFLIGHT_
AWAITING_PHYSICAL_STARTUP_CANARY_EXECUTOR
```

Required source facts:

```text
Source Gates = 304/304
Negative Controls = 136/136
Physical R1 gates = 80 definitions
throw-stub dependencies = 0
1080p / 4K / 8K assemblies = 1 / 1 / 1
Final EWA pins = 3 / 3
GPU leases = 3 / 3
shader modules / pipelines = 12 / 21
queue submissions = 0
QMap publications = 0
global bridge writes = 0
physical R1 gates executed = 0/80
installed physical startup canary = false
```

## 26. Physical completion state

```text
PACKAGED_LIVE_PRODUCT_DEPENDENCY_CLOSURE_BAKED_
QMAP_STREAMING_REDUCTION_03G_R14D_R1_
PRE_SESSION_CANARY_SERVICE_ACTIVE_
REAL_GPU_LEASE_NORMALIZED_
REAL_FINAL_EWA_PRODUCT_PIN_
CURRENT_DEVICE_QMAP_PIPELINES_
TRACKED_ATTEMPT_ALLOCATOR_
PRODUCT_COMMAND_ENCODER_
REAL_ANALYSIS_PRODUCER_VERIFIED_
PRODUCT_INVOCATION_ASSEMBLED_
ZERO_THROW_STUB_
ZERO_QUEUE_SUBMISSION_
ZERO_PRIVATE_RESOURCE_LEAK_
READY_FOR_PRE_SESSION_PHYSICAL_EFC_CANARY
```

This state requires R1-001 through R1-080 physical PASS. It does not mean installed startup admission has passed.

## 27. Package policy

The source ZIP includes the physical dependency services and adapters, corrected runtime-module wiring, pre-session canary facade, invocation-preflight tools, 304 source gates, 136 negative-control definitions and 80 physical-gate definitions.

The ZIP excludes this specification, private keys, real installed permits, generated physical receipts, 8/8 startup-canary evidence, real QMap publications, real EFC surfaces, Preview images, Export files, reports, logs, nested archives and Git metadata.

The GitHub commit contains this specification only.

## 28. Next boundary

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R14D-R2

Physical R9A EFC Command Graph Authority /
Pre-Session Eight-Submission Product Canary /
Real QWave Execution /
Phase-Gamma·Terminal-R1C·Bakemono Recording /
Converged Surface Ownership Adoption /
Pipeline Final Publication /
Installed Session Admission Seal
```

R14D-R2 must supply the physical canary executor and prove:

```text
QMap submissions = 5
QWave submissions = 2
EFC graph submissions = 1
aggregate fences = 8
Pipeline final publications = 1
QRC02 product executions = 0
```

## 29. Final seal

R14D-R1 removes the false safety wall formed by throw-only product dependencies. Staged execution is denied by bridge lifecycle authority, while the product root carries physical dependency facades from construction onward.

The R14A product invocation now reaches a normalized GPU lease, real Final EWA capability and attempt pin, current-device QMap pipeline bundle, tracked allocator, product command encoder and real Analysis producer registration. Candidate public contracts remain intact.

The 1080p, 4K and 8K source matrix assembles and disposes these invocations without candidate provenance, queue submission, QMap publication or resource leak.

A pre-session canary service registers the exact frozen facade required by installed strict boot. It runs physical dependency preflight but refuses to fabricate the required 8-submission product reference. Installed strict admission remains fail-closed until R14D-R2 supplies the physical executor.
