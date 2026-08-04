# QMAP-LIVE-WIRING-02

## Canonical Base Final-EWA Lineage / Live Effect Parameter Authority / QMap·QWave Analysis Generation Cache / Effect-Only EFC Recompose / Processing Command Classification / Monotonic Parameter Revision / Abortable Supersession / Desired-Key Warm Revalidation / Export Snapshot Freeze / No Surface-Evidence Parameter SSOT / No Recursive QMap Source Seal

## 0. Identity

```text
Patch ID = QMAP-LIVE-WIRING-02
Parent = QMAP-LIVE-WIRING-01
Repair target = repeated-edit product loop after the first QMap final publication
Code delivery = baked ZIP only
Repository delivery = this specification only
Terminal state = QMAP_LIVE_EDIT_LOOP_ACTIVE
```

WIRING-01 makes ordinary Preview and Export enter the QMap product path. WIRING-02 makes that path survive parameter changes, sequential edits, source replacement, supersession and Preview-to-Export reuse.

This is a runtime wiring patch. It does not add new QMap, QWave, Phase-Gamma, R1C or Bakemono mathematics.

## 1. Parent breaks

```text
QMap effect values were read from surface evidence with no canonical writer.
Pipeline current became the QMap final, so the original Final-EWA source was lost.
Warm reuse occurred before computing the newly desired producer key.
Cancellation was an always-false object rather than a physical AbortController generation.
dadum:command-processing-options had no runtime consumer.
Effect-only changes recomputed QMap 5 + QWave 2 before EFC.
Export looked up Pipeline current again after coordinator completion.
```

Required correction:

```text
base source truth != Pipeline current final truth
parameter truth != surface evidence
analysis key != final composition key
superseded work != failed GPU work
Preview warm surface == Export frozen surface
```

## 2. Required live loop

```text
new non-QMap Final-EWA
→ base source authority adopts and pins source
→ QMap 5-submit
→ QWave 2-submit
→ retain QMap/QWave Analysis fields
→ EFC 1-submit
→ Pipeline publishes QMap final
→ Preview presents final

same source + effect-only change
→ parameter revision increments
→ final cancellation generation rotates
→ retained QMap/QWave generation reused
→ EFC 1-submit only
→ Pipeline publishes new QMap final

unchanged state + Preview or Export
→ desired final key matches Pipeline current
→ QMap 0 / QWave 0 / EFC 0
→ same final tuple consumed
```

## 3. State ownership

```text
base non-QMap Final-EWA source
= QMapBaseSourceLineageService

live normalized effect parameters
= QMapLiveEffectParameterAuthorityService

processing command classification and adaptive-policy input snapshot
= QMapProcessingCommandBridgeService

analysis and final cancellation generations
= QMapOperationCancellationAuthorityService

QMap/QWave cold analysis build
= R14D product transaction analysis closure

retained QMap/QWave pins and generation reuse
= createQMapLiveWiring02AnalysisGenerationCache()

desired-key single-flight and warm decision
= QMapFinalSurfaceCoordinatorService

EFC composition and final surface production
= QMapEfcFinalSurfaceProducerService + R9A graph authority

physical surface and field lifetime
= SurfaceRegistryAuthorityService + AnalysisFieldAuthorityService

single current final writer
= PipelineService
```

Forbidden parameter SSOTs:

```text
SurfaceRecord.evidence
Preview store
Export store
DOM controls
window globals
consumer request objects
shader uniform side effects
```

Window and DOM surfaces are input facades only.

## 4. Canonical base Final-EWA lineage

Required service:

```text
QMapBaseSourceLineageService
service ID = dadum.runtime.qmap-base-source-lineage
```

Admit only:

```text
kind = gpu-texture
storage = gpu-texture
format = rgba16float
allocationClass = final
positive dimensions
current GPU device binding
qmapLiveProductFinal != true
effectFieldConverged != true
```

The authority pins the latest admitted non-QMap Final-EWA. Later QMap final publications do not replace this base source.

Atomic replacement:

```text
pin and validate new source
→ publish new lineage snapshot
→ rotate analysis and final cancellation generations
→ mark old source retired
→ release old source pin after active operation leases drain
```

Operation lease:

```text
snapshot
texture
assertCurrent(stage)
release()
```

A QMap final may never recursively become a QMap source.

## 5. Live effect parameter authority

Required service:

```text
QMapLiveEffectParameterAuthorityService
service ID = dadum.runtime.qmap-live-effect-parameters
```

Snapshot:

```text
schemaId
parameterRevision
alpha parameters
phaseGamma parameters
tensor/R1C parameters
bakemono parameters
parameterDigest
```

Rules:

```text
one serialized writer
immutable snapshots
same normalized digest = no revision increment
invalid range = reject entire patch
edgeHigh < edgeLow = reject entire patch
no silent clamp
```

The canonical request factory reads only this snapshot for effect parameters.

## 6. Processing command bridge

Required service:

```text
QMapProcessingCommandBridgeService
service ID = dadum.runtime.qmap-processing-command-bridge
input event = dadum:command-processing-options
```

Classification:

```text
width / height / lockAspect
→ UPSTREAM_GEOMETRY_CHANGE
→ dispatch canonical resample request

selectiveAA
→ UPSTREAM_RESAMPLE_POLICY_CHANGE
→ dispatch canonical resample-policy request

qThreshold / deltaEThreshold
→ ADAPTIVE_POLICY_CHANGE
→ store immutable revision + digest snapshot
→ reserve physical EWA consumption for WIRING-03

a qmapEffect object or flat effect fields
→ batch within the same JavaScript turn
→ apply one parameter patch
→ rotate final cancellation only
→ invalidate desired final
→ request one Preview recomposition
```

Facade:

```ts
window.DadumRuntimeQMapParameters = Object.freeze({
  snapshot(),
  patchEffect(patch),
});
```

The facade does not own state. `patchEffect()` resolves after the batched patch and recomposition path completes or rejects.

## 7. Physical cancellation

Required service:

```text
QMapOperationCancellationAuthorityService
service ID = dadum.runtime.qmap-operation-cancellation
```

Scopes:

```text
ANALYSIS_GENERATION
FINAL_COMPOSITION
```

Each lease exposes:

```text
AbortSignal
generation
aborted
onAbort(callback)
assertCurrent(stage)
release()
```

Triggers:

```text
effect parameter revision → abort FINAL_COMPOSITION
new base source → abort ANALYSIS_GENERATION + FINAL_COMPOSITION
device epoch invalidation → abort both
runtime disposal → abort both
```

Cancellation checks occur before and after QMap, between QMap and QWave, before EFC record, before EFC submit, after fence, before surface registration and before Pipeline publication.

Already-submitted GPU work may finish, but stale work cannot register or publish a final surface.

## 8. Analysis generation cache

Internal module:

```text
createQMapLiveWiring02AnalysisGenerationCache()
file = app/legacy-runtime/core/compute/qmap_webgpu/
       qmap_live_wiring_02_analysis_generation_cache.mjs
consumer ID = tdt.analysis.consumer.qmap-live-wiring-02-retained-generation
```

Retained fields:

```text
QMap normalized response
QWave real delta-K compatibility
QWave imaginary component
QWave analytic complex
```

Analysis key binds:

```text
base source lineage digest
QMap/QWave algorithm and ABI identities
activation and product-route generation
analysis shader-set digest
runtime/device epoch and identity
```

Effect parameters are excluded.

Dispositions:

```text
ANALYSIS_COLD_PRODUCER
ANALYSIS_WARM_GENERATION
```

Same-key concurrent Preview and Export already join at the final coordinator, so the internal cache does not add a second in-flight arbitration layer.

Retirement:

```text
new analysis key
→ pin new generation
→ atomically replace current generation
→ release old cache pins
→ request old field disposal

analysis cancellation
→ clear current generation immediately
→ release all retained pins
→ request field disposal
```

Analysis Field Authority remains the physical owner. Fields still pinned by an active EFC graph become dispose-pending rather than being destroyed under GPU work.

## 9. Analysis key and final key

```text
analysisKeyDigest = digest(
  base source lineage
  + analysis algorithm/ABI identities
  + route generation
  + runtime/device identity
)

finalKeyDigest = digest(
  analysisKeyDigest
  + live effect parameterDigest
  + EFC shader-set digest
  + runtime/device identity
)
```

Consumer kind, Preview layout, export format, filename, quality and DPI are excluded.

The final surface record carries:

```text
producerKeyDigest
analysisKeyDigest
analysisGenerationDigest
finalKeyDigest
parameterRevision
parameterDigest
baseSourceLineageDigest
qmapLiveProductFinal = true
effectFieldConverged = true
```

## 10. Desired-key warm validation

Required coordinator order:

```text
build canonical desired request
→ acquire base source and current parameter snapshots
→ compute analysisKeyDigest and finalKeyDigest
→ inspect Pipeline current
→ validate current surface against desired key
→ warm return, in-flight join or cold producer
```

Warm reuse requires equality of:

```text
Pipeline publication tuple
producerKeyDigest
analysisKeyDigest
finalKeyDigest
parameterDigest
baseSourceLineageDigest
device epoch and identity
qmapLiveProductFinal flag
```

The existence of `qmapLiveProductFinal=true` alone is never warm authority.

## 11. R14D transaction split

Cold new-source path:

```text
analysis cache miss
→ QMap 5 submissions / 5 fences
→ QWave 2 submissions / 2 fences
→ EFC 1 submission / 1 fence
→ total 8 / 8
```

Effect-only path:

```text
analysis cache hit
→ QMap 0
→ QWave 0
→ EFC 1
→ total 1 / 1
```

The R14D authority returns to `READY` after every success or failure. Grants use unique nonces per operation. Global cold serialization remains owned by the coordinator.

## 12. Source CAS and supersession

The canonical request contains:

```text
baseSourceLineageDigest
source surface/revision/dimensions
analysis and final cancellation leases
assertSourceCurrent(stage)
```

Source and cancellation are checked:

```text
when building key
before cold producer
before/after QMap and QWave
before/after EFC
before surface registration
before Pipeline publication
after producer return
```

A newer source or parameter generation cannot be overwritten by an older producer.

## 13. Preview behavior

```text
non-QMap Final-EWA publication
→ base source adoption queued first
→ normal Preview calls coordinator
→ request factory waits for base adoption tail
→ desired final is produced or reused
→ Preview presents returned finalRevision
```

Multiple effect patches in one JavaScript turn commit one normalized parameter revision and request one Preview recomposition.

Superseded composition is dropped as an edit-loop outcome, not rewritten as a Preview GPU failure.

## 14. Export snapshot freeze

Ordinary Export:

```text
coordinator.ensureFinalSurface(EXPORT)
→ immediately pin returned surface
→ freeze publication + pin tuple
→ encode from frozen pin
→ release pin after terminal result
```

Export does not look up Pipeline current again to choose its input.

A later parameter change may produce a newer Preview, but it cannot mutate an Export already holding a frozen surface pin.

Format, quality, filename, metadata and DPI remain encoder options and do not invalidate QMap, QWave or EFC state.

## 15. Boot composition

```text
Pipeline + Surface Registry
→ QMap Product Runtime and Promotion
→ QMap Operation Cancellation Authority
→ QMap Live Effect Parameter Authority
→ QMap Base Source Lineage
→ QMap R9A EFC Graph Authority
→ QMap EFC Final Surface Producer
→ QMap Final Surface Request Factory
→ QMap Final Surface Coordinator
→ QMap Processing Command Bridge
→ Preview
→ Export
```

Base Source Lineage subscribes with current-publication replay, so an existing canonical non-QMap Final-EWA is adopted before the first QMap request proceeds.

## 16. Implementation files

New:

```text
app/src/runtime/qmap/qmap-base-source-lineage-service.ts
app/src/runtime/qmap/qmap-live-effect-parameter-authority-service.ts
app/src/runtime/qmap/qmap-processing-command-bridge-service.ts
app/src/runtime/qmap/qmap-operation-cancellation-authority-service.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_02_analysis_generation_cache.mjs
tools/qmap-live-wiring-02/verify-analysis-reuse.mjs
tools/qmap-live-wiring-02/verify-effect-only-recompose.mjs
```

Primary rewires:

```text
app/src/boot/runtime-modules.ts
app/src/boot/stable-error.ts
app/src/runtime/service-token.ts
app/src/runtime/qmap/qmap-final-surface-request-factory-service.ts
app/src/runtime/qmap/qmap-final-surface-coordinator-service.ts
app/src/runtime/qmap/qmap-final-surface-producer-key.ts
app/src/runtime/qmap/qmap-final-surface-warm-validation.ts
app/src/runtime/qmap/final-ewa-product-capability-registry.ts
app/src/runtime/export/export-authority-service.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_product_transaction.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_surface_registration.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_01_r9a_graph_authority.mjs
tools/qmap-streaming-reduction-03g-r14e/verify-runtime-integration.mjs
package.json
```

## 17. Stable failures

```text
E_QMAP_LIVE_WIRING_ADAPTIVE_PARAMETER_INVALID
E_QMAP_LIVE_WIRING_BASE_SOURCE_INVALID
E_QMAP_LIVE_WIRING_BASE_SOURCE_NOT_READY
E_QMAP_LIVE_WIRING_BASE_SOURCE_MISSING
E_QMAP_LIVE_WIRING_BASE_SOURCE_STALE
E_QMAP_LIVE_WIRING_BASE_SOURCE_SUPERSEDED
E_QMAP_LIVE_WIRING_BASE_SOURCE_DEVICE_MISMATCH
E_QMAP_LIVE_WIRING_EFFECT_PARAMETER_INVALID
E_QMAP_LIVE_WIRING_EFFECT_PARAMETER_NOT_READY
E_QMAP_LIVE_WIRING_EFFECT_PARAMETER_RELATION
E_QMAP_LIVE_WIRING_CANCELLATION_NOT_READY
E_QMAP_LIVE_WIRING_SOURCE_STALE
E_QMAP_LIVE_WIRING_SOURCE_SUPERSEDED
E_QMAP_LIVE_WIRING_DEVICE_MISMATCH
E_QMAP_LIVE_WIRING_PRODUCT_RUNTIME_INACTIVE
E_QMAP_LIVE_WIRING_REQUEST_FACTORY_NOT_READY
E_QMAP_LIVE_WIRING_SUPERSEDED
```

Supersession is a normal edit-loop terminal state. It must not be rewritten as an unknown GPU failure.

## 18. Completion scenarios

First Preview:

```text
QMap = 5
QWave = 2
EFC = 1
Pipeline final = 1
```

Effect-only change:

```text
parameter revision = +1
base source replacement = 0
QMap = 0
QWave = 0
EFC = 1
```

Same-turn effect burst:

```text
committed parameter revisions = 1
Preview recomposition requests = 1
```

Preview then Export, unchanged:

```text
additional QMap/QWave/EFC submissions = 0
Preview surface tuple == Export frozen tuple
```

New source:

```text
new base pinned before old release
old operations aborted
old retained analysis generation retired
QMap = 5
QWave = 2
EFC = 1
old-source publication = 0
```

## 19. Completion criteria

```text
surface-evidence effect parameter reads = 0
canonical effect parameter authorities = 1
processing command consumers = 1
base Final-EWA authority pins = 1 per current source
recursive QMap source admissions = 0
always-false cancellation on live path = 0
unkeyed warm returns = 0
retained analysis generations per analysis key = 1
effect-only QMap resubmissions = 0
effect-only QWave resubmissions = 0
effect-only EFC submissions = 1
unchanged Preview/Export submissions = 0
stale final publications = 0
terminal state = QMAP_LIVE_EDIT_LOOP_ACTIVE
```

Verification status must remain honest:

```text
source and fixture execution = VERIFIED
packaged physical WebGPU edit loop = NOT EXECUTED
```

## 20. Non-goals and next boundary

```text
QMap-to-EWA adaptive policy consumption
new QMap or QWave mathematics
new Phase-Gamma, R1C or Bakemono formulas
CPU/WebGL/QRC02 product fallback
GitHub code publication
```

Next:

```text
QMAP-LIVE-WIRING-03

QMap Analysis Field to Adaptive Policy R1D /
Canonical EWA R9A Policy Texture Consumption /
Stage-Local Policy Projection /
QMap-Guided Anisotropy and Footprint /
Preview·Export Lowpass Convergence /
No Neutral Policy on Product Route Seal
```

## 21. Final seal

```text
The first QMap result does not destroy the identity of its base Final-EWA source.
A live effect change has one canonical writer and a monotonic revision.
The desired final key is computed before warm reuse.
Unchanged QMap and QWave fields survive effect-only edits.
Only EFC recomposes for an effect-only change.
Superseded work receives a real abort signal and cannot publish.
Preview refreshes to the newest desired key.
Export freezes and consumes one exact final tuple.
No surface evidence, DOM element, window global or consumer owns parameter truth.
```

Anything weaker remains:

```text
QMAP_FIRST_RUN_LIVE_BUT_EDIT_LOOP_BROKEN
```
