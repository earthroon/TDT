# QMAP-LIVE-WIRING-03-R1

## Export Requested-Size Adaptive Resample / Frozen Source·Guide·Policy·Effect Snapshot / Canonical Broker Reuse / Private QMap·QWave·EFC Composition / Export-Only Surface Ownership / Preview·Export Policy ABI Parity / Encoder Option Partition / No Pipeline Mutation / No Product-Guide Eviction / No Encoder-Local Downscale Seal

## 0. Identity

```text
Patch ID = QMAP-LIVE-WIRING-03-R1
Parent = QMAP-LIVE-WIRING-03
Repair target = requested-size Export is rejected instead of using the live QMap-guided resample path
Code delivery = cumulative baked ZIP only
Repository delivery = this specification Markdown only
Terminal state = QMAP_EXPORT_REQUESTED_SIZE_PATH_ACTIVE
```

WIRING-03 already connects the canonical replay source, retained QMap guide, Adaptive Policy R1D, Resample Worker Broker and EWA R9A stage-local policy path for ordinary processing commands.

R1 reuses that physical path for Export requests whose dimensions differ from the current authoritative final. It does not add an encoder resize implementation and does not publish export-private surfaces to Pipeline.

## 1. Confirmed parent break

Parent Export behavior rejects a target-size mismatch after freezing the current Pipeline final.

```text
ordinary Export
→ ensure current QMap final
→ freeze Pipeline publication
→ compare requested dimensions with current final
→ mismatch rejected
```

Simply removing the rejection would create either:

```text
encoder-local resize
or
an Export resize that replaces Preview's current final
```

Both are forbidden.

Required private path:

```text
requested dimensions
→ frozen canonical replay source
→ frozen QMap guide and Adaptive Policy
→ private canonical EWA
→ private QMap 5-submit
→ private QWave 2-submit
→ private R9A EFC 1-submit
→ already-sized private final
→ encoder
→ host save
→ private resource retirement
```

## 2. Route split

Export chooses exactly one route after canonical dimension normalization.

### SHARED_CURRENT_FINAL

Selected when dimensions are absent or equal the current authoritative final.

```text
WIRING-02 ensureFinalSurface(EXPORT)
→ freeze current Pipeline final pin
→ encode exact surface
→ additional EWA/QMap/QWave/EFC = 0
```

### PRIVATE_REQUESTED_SIZE

Selected when requested dimensions differ from the current final and do not exceed the canonical replay source.

```text
freeze Export snapshot
→ private EWA
→ private QMap/QWave/EFC
→ private final pin
→ encode exact private surface
→ release private branch
```

### Upscale rejection

Dimensions greater than the canonical replay source fail before GPU submission.

A requested size may be larger than Preview while still legal when it is no larger than the canonical source. That is a fresh render, not an upscale from Preview.

## 3. State ownership

```text
requested dimension intent
= ExportAuthorityService + export-dimension-intent.ts

canonical replay source and durable source pin
= QMapAdaptiveResampleSourceAuthorityService

frozen QMap guide
= QMapAdaptivePolicyGuideAuthorityService

frozen Adaptive Policy R1D
= QMapAdaptivePolicyBindingService

frozen effect parameters
= QMapLiveEffectParameterAuthorityService snapshot

private key, same-key join and private final lifetime
= QMapExportRequestedSizeCoordinatorService

private EWA
= ResampleWorkerBrokerService + CanonicalResampleExecutorR8A

private QMap/QWave/EFC request construction
= QMapExportPrivateFinalRequestFactoryService

physical QMap/QWave/EFC FIFO
= QMapEfcFinalSurfaceProducerService

private Analysis generation
= R14D EXPORT_PRIVATE Analysis cache scope

physical surfaces and fields
= SurfaceRegistryAuthorityService + AnalysisFieldAuthorityService

encoding and save
= ExportAuthorityService + EncoderRegistry + HostBridge

Preview current final
= PipelineService, unchanged by R1
```

Forbidden state owners:

```text
encoder resize options
Preview store
DOM dimension fields
Pipeline current as private resample source
PRODUCT_CURRENT guide slot for export-private analysis
```

## 4. Dimension intent and option partition

Accepted dimension aliases:

```text
targetWidth / targetHeight
outputWidth / outputHeight
width / height
```

Rules:

```text
aliases for one axis must agree
both axes are required for PRIVATE_REQUESTED_SIZE
values must be positive safe integers
fractions, NaN, infinity and zero fail
one-axis implicit aspect derivation is not admitted
```

`export-dimension-intent.ts` partitions options before GPU or encoder work.

Resample-only options:

```text
targetWidth / targetHeight
outputWidth / outputHeight
width / height
lockAspect
selectiveAA
qThreshold
deltaEThreshold
```

These options never reach the encoder.

Encoder-only options remain codec, quality, compression, metadata, profile, DPI, filename and alpha-policy inputs.

The encoder must receive an already-sized authoritative surface.

## 5. Frozen Export snapshot

Before private GPU work, the requested-size coordinator freezes:

```text
provenance Pipeline publication
canonical replay-source snapshot and physical pin
QMap guide field ID, generation and physical pin
analysisGenerationDigest
qmapExecutionReceiptDigest
Adaptive Policy value and policyDigest
adaptive input revision and digest
effect parameter revision and digest
installed session and QMap activation binding
runtime/device epoch and identity
target dimensions
exportResizeOperationId
exportResizeKeyDigest
```

Later ordinary edits may advance Preview, policy or effect state. They do not mutate the already-started Export snapshot.

The private Export has its own AbortController. Ordinary Preview supersession does not cancel it. Device loss, runtime disposal, explicit cancellation and installed-session invalidation do.

## 6. Durable source and guide leases

The live Preview lease rejects pointer replacement. Export needs a durable physical lease.

Required source API:

```text
acquireFrozenForExport()
→ snapshot
→ texture
→ assertPhysicallyCurrent(stage)
→ release()
```

Pointer replacement alone does not invalidate the frozen lease. Device loss, disposal or lost Surface Registry pin does.

The guide API similarly freezes one exact Analysis field generation. It verifies the physical field and device identity without requiring the global current-guide pointer to remain unchanged.

The Export path never uses the prior Preview output as the resize source.

## 7. Export route modes

The private broker route uses one of:

```text
EXPORT_BOOTSTRAP_BASELINE
EXPORT_PRODUCT_BASELINE
EXPORT_PRODUCT_ADAPTIVE
```

Selection:

```text
guide missing
→ EXPORT_BOOTSTRAP_BASELINE

guide present + selectiveAA=false
→ EXPORT_PRODUCT_BASELINE

guide present + selectiveAA=true
→ EXPORT_PRODUCT_ADAPTIVE
```

For `EXPORT_PRODUCT_ADAPTIVE`:

```text
exact QMap texture required
canonical Adaptive Policy R1D required
neutral QMap fallback forbidden
policy projection passes = EWA stageCount
```

R1 does not treat QMap response as Delta-E. `deltaEThreshold` remains non-physical until WIRING-04.

## 8. Private EWA contract

The coordinator calls the existing renderer-owned Resample Worker Broker with:

```text
mode = canonical-webgpu
outputMode = surface
publicationIntent = EXPORT_PRIVATE
consumerIntent = EXPORT_PRIVATE
source = frozen canonical replay source
target = requested dimensions
route = one EXPORT_* mode
policy + qmapTexture only for adaptive mode
```

The canonical executor maps EXPORT route names to the existing physical baseline/adaptive EWA route while preserving `publicationIntent=EXPORT_PRIVATE`.

Required result:

```text
canonical surface
exact target dimensions
pipelinePublished = false
exportPrivateSurface = true
```

The coordinator does not call `PipelineService.publishFinalCandidate()`.

## 9. Private QMap·QWave·EFC composition

Encoding the private EWA directly is forbidden because it would omit the QMap/QWave/EFC effect visible in Preview.

`QMapExportPrivateFinalRequestFactoryService` builds an internal R14D request with:

```text
publicationMode = EXPORT_PRIVATE
analysisCacheScope = EXPORT_PRIVATE
exportResizeOperationId
exportResizeKeyDigest
privateSurfaceOwnerServiceId
private source and target dimensions
frozen effect parameters
private analysisKeyDigest
private finalKeyDigest
```

Cold private execution:

```text
QMap = 5 submissions
QWave = 2 submissions
EFC = 1 submission
Pipeline writers = 0
```

The EFC graph reuses the same canonical Alpha, Phase-Gamma, terminal R1C, Bakemono WGSL-06 and final-selector path as WIRING-01/02.

## 10. Publication mode and Pipeline non-mutation

R14D supports:

```text
PIPELINE_CURRENT
EXPORT_PRIVATE
```

`PIPELINE_CURRENT` preserves existing behavior.

`EXPORT_PRIVATE`:

```text
registers allocationClass = working-export-final
sets pipelinePublished = false
sets owner to requested-size coordinator
returns private surface evidence
creates no fake pipelineReceiptId
creates no fake global finalRevision
increments Pipeline revision by 0
requests Preview presentation 0 times
```

The Export records the provenance Pipeline tuple. An unrelated edit may advance Pipeline concurrently. That is reported as:

```text
concurrentPipelineAdvanceObserved = true
pipelineMutationCount = 0
```

The private Export neither rolls Pipeline back nor adopts the newer Preview state.

## 11. Analysis cache isolation

WIRING-02 product Analysis uses:

```text
scope = PRODUCT_CURRENT
publishGuide = true
```

Export private Analysis uses:

```text
scope = EXPORT_PRIVATE
publishGuide = false
consumerId = tdt.analysis.consumer.qmap-export-private-r03-r1
```

The private generation never replaces `currentQMapLiveWiring02GuideSnapshot()`.

Private Analysis fields remain through private QMap/QWave/EFC production. Once the completed private final is registered and owner-pinned, they are retired before encoder and host-save work. The encoder depends only on the private final surface.

## 12. Physical scheduler and same-key join

`QMapEfcFinalSurfaceProducerService` is the shared physical FIFO for Preview-current and Export-private R14D operations.

```text
one R14D GPU transaction active at a time
different keys serialize through FIFO
same exportResizeKey joins at the requested-size coordinator
```

Each joined Export consumer receives its own private final surface pin. Releasing one consumer does not release another.

The private final entry retires after the last consumer releases.

## 13. Private resource lifecycle

Success path:

```text
freeze source and optional guide pins
→ produce private EWA
→ build private QMap/QWave/EFC
→ register private final
→ acquire coordinator owner pin
→ retire private Analysis fields
→ requestDispose(private EWA)
→ release source and guide leases
→ acquire per-consumer final pin
→ encoder consumes exact final
→ host save completes or fails
→ release consumer pin
→ after last consumer, requestDispose(private final)
→ release owner pin
```

Failure path:

```text
release all acquired leases
retire private Analysis generation
invalidate any registered but unadopted surface
requestDispose private EWA/final where present
host save does not begin before encoder success
```

No export-private resource remains reachable through Pipeline or the product guide.

## 14. Export Authority integration

`exportFinalByFormat()` performs:

```text
normalize and partition options
→ ensure/freeze provenance final
→ SHARED_CURRENT_FINAL or PRIVATE_REQUESTED_SIZE
→ encode from exact frozen pin
```

For the private route, `exportFinal()` binds:

```text
exportSource = qmap-export-private-final
surfaceId = privateFinalSurfaceId
width/height = requested dimensions
resampleReceiptDigest = private QMap receipt digest
```

Before and after encoding it checks the private pin. Applied encoder options are inspected and any dimension mutation or resize option leaks fail closed.

The shared Final Surface Consumption Ledger remains for the shared route only. A private export does not forge a shared Preview/Export finalRevision tuple.

## 15. Receipt evidence

Requested-size Export receipts include:

```text
exportSurfaceRoute = PRIVATE_REQUESTED_SIZE
exportResizeOperationId
exportResizeKeyDigest
requestedOutputWidth / requestedOutputHeight
privateEwaSurfaceId / privateEwaReceiptDigest
privateQMapReceiptDigest
privateAnalysisKeyDigest / privateAnalysisGenerationDigest
privateFinalKeyDigest
effectParameterDigest
adaptivePolicyDigest / adaptiveInputDigest
guideFieldId / guideGeneration
contentLineageDigest
pipelineMutationCount = 0
concurrentPipelineAdvanceObserved
encoderResizeUsed = false
postSurfaceScaleUsed = false
canvasResizeUsed = false
workerResizeUsed = false
```

The encoded output dimensions must equal the requested dimensions.

## 16. Primary implementation files

New:

```text
app/src/runtime/export/export-dimension-intent.ts
app/src/runtime/qmap/qmap-export-private-final-request-factory-service.ts
app/src/runtime/qmap/qmap-export-requested-size-coordinator-service.ts
tools/qmap-live-wiring-03-r1/verify-export-private-wiring.mjs
tools/qmap-live-wiring-03-r1/verify-private-publication-seal.mjs
tools/qmap-live-wiring-03-r1/verify-private-transaction-fixture.mjs
```

Modified:

```text
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_02_analysis_generation_cache.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_final_receipt.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_product_transaction.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_surface_registration.mjs
app/src/boot/runtime-modules.ts
app/src/boot/stable-error.ts
app/src/runtime/codecs/encoder-registry-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
app/src/runtime/qmap/qmap-adaptive-policy-binding-service.ts
app/src/runtime/qmap/qmap-adaptive-policy-guide-authority-service.ts
app/src/runtime/qmap/qmap-adaptive-resample-source-authority-service.ts
app/src/runtime/qmap/qmap-efc-final-surface-producer-service.ts
app/src/runtime/qmap/qmap-efc-final-surface-types.ts
app/src/runtime/resample/canonical-resample-executor-r8a.ts
app/src/runtime/resample/resample-compatibility-types.ts
app/src/runtime/service-token.ts
package.json
tools/qmap-live-wiring-03/verify-guided-resample-wiring.mjs
tools/qmap-streaming-reduction-03g-r14d/fixture.mjs
```

## 17. Stable failures

```text
E_QMAP_EXPORT_RESIZE_COORDINATOR_NOT_READY
E_QMAP_EXPORT_RESIZE_DIMENSION_INVALID
E_QMAP_EXPORT_RESIZE_DIMENSION_CONFLICT
E_QMAP_EXPORT_RESIZE_BOTH_AXES_REQUIRED
E_QMAP_EXPORT_RESIZE_UPSCALE_FORBIDDEN
E_QMAP_EXPORT_RESIZE_EXPECTED_REVISION_NOT_CURRENT
E_QMAP_EXPORT_RESIZE_SOURCE_MISSING
E_QMAP_EXPORT_RESIZE_SOURCE_DEVICE_LOST
E_QMAP_EXPORT_RESIZE_GUIDE_INVALID
E_QMAP_EXPORT_RESIZE_POLICY_INVALID
E_QMAP_EXPORT_RESIZE_SNAPSHOT_INVALID
E_QMAP_EXPORT_RESIZE_KEY_INVALID
E_QMAP_EXPORT_RESIZE_BROKER_RESULT_INVALID
E_QMAP_EXPORT_PRIVATE_REQUEST_INVALID
E_QMAP_EXPORT_PRIVATE_ANALYSIS_SCOPE_VIOLATION
E_QMAP_EXPORT_PRIVATE_PIPELINE_PUBLICATION_FORBIDDEN
E_QMAP_EXPORT_PRIVATE_SURFACE_OWNER_MISMATCH
E_QMAP_EXPORT_PRIVATE_SURFACE_DIMENSION_MISMATCH
E_QMAP_EXPORT_PRIVATE_FINAL_MISSING
E_QMAP_EXPORT_PRIVATE_FINAL_STALE
E_QMAP_EXPORT_ENCODER_RESIZE_OPTION_LEAK
E_QMAP_EXPORT_ENCODER_DIMENSION_MUTATION
E_QMAP_EXPORT_PIPELINE_MUTATION
E_QMAP_EXPORT_PRIVATE_RESOURCE_LEAK
E_QMAP_EXPORT_RESIZE_CANCELLED
E_QMAP_EXPORT_RESIZE_DEVICE_LOST
```

## 18. Completion scenarios

Same-size Export:

```text
additional GPU submissions = 0
Pipeline mutation = 0
encoder input = current final dimensions
```

Cold adaptive requested-size Export:

```text
private EWA = 1 command graph
policy passes = EWA stageCount
private QMap = 5
private QWave = 2
private EFC = 1
Pipeline publications = 0
encoder input = requested dimensions
```

Cold baseline requested-size Export:

```text
private EWA = 1 command graph
policy passes = 0
private QMap = 5
private QWave = 2
private EFC = 1
Pipeline publications = 0
```

Concurrent identical requested-size Exports:

```text
private GPU producer = 1
consumer pins = N
encoders = N
host saves = N
```

User edit during Export:

```text
Export output = frozen source/guide/policy/effect snapshot
Preview output = newer state
Pipeline rollback = 0
cross-cancellation = 0
```

## 19. Completion criteria

```text
admitted requested-size mismatch rejections = 0
encoder-local resize paths = 0
private Pipeline publish calls = 0
private Pipeline revision increments = 0
private Preview presentation requests = 0
PRODUCT_CURRENT guide replacements by Export = 0
PRODUCT_CURRENT cache evictions by Export = 0
encoder input dimension mismatches = 0
adaptive neutral-QMap fallbacks = 0
private QMap/QWave/EFC omissions = 0
unreleased private source pins = 0
unreleased private guide pins = 0
unreleased private Analysis fields = 0
unreleased private surfaces = 0
same-key duplicate private GPU producers = 0
same-size shared-final regressions = 0
Pipeline rollback attempts = 0

terminal state
= QMAP_EXPORT_REQUESTED_SIZE_PATH_ACTIVE
```

## 20. Verification boundary

```text
source wiring and executable fixtures = VERIFIED by bake
freshly extracted ZIP R1 fixture = VERIFIED
packaged physical WebGPU requested-size Export = NOT EXECUTED
multi-format physical output verification = NOT EXECUTED
```

The old R14D-R1 pre-session-canary source gates are intentionally obsolete after WIRING-01 removed the boot-time QMap dependency cycle. They must not be restored or silently passed by weakening the live wiring.

## 21. Non-goals

```text
upscaling beyond canonical source
one-axis aspect derivation
historical source-revision replay
true Delta-E Analysis field
QMap-as-Delta-E substitution
encoder-local resize fallback
CPU/WebGL/QRC02 requested-size fallback
persistent private-final disk cache
Preview mutation to Export dimensions
```

## 22. Next boundary

```text
QMAP-LIVE-WIRING-04

True Lab/OKLab Delta-E Analysis Field /
Source-vs-Lowpass Color Difference Authority /
Adaptive Policy Second-Field Binding /
Delta-E Soft Gate /
QMap·Delta-E Joint Policy /
Preview·Export Shared Color-Difference ABI /
No QMap-as-Delta-E Semantic Substitution Seal
```

## 23. Final seal

```text
A requested-size Export is rendered from the canonical replay source.
It freezes one source, guide, policy, effect and device snapshot.
It reuses the canonical broker, R9A EWA and Adaptive Policy ABI.
It executes private QMap, QWave and EFC composition at the requested dimensions.
The encoder receives an already-sized authoritative private final surface.
No dimension option reaches the encoder as resize authority.
The private branch never publishes to Pipeline and never changes Preview.
The private Analysis generation never replaces the current product guide.
Private Analysis fields retire after the pinned private final exists.
The private final retires after the final Export consumer releases.
```

Anything weaker remains:

```text
EXPORT_SIZE_OVERRIDE_REJECTED_OR_ENCODER_LOCAL_RESIZE_UNSEALED
```
