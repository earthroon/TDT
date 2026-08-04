# QMAP-LIVE-WIRING-01

## Remove Pre-Session QMap Boot Block / Real R9A EFC Graph Authority Injection / Canonical Product Request Factory / Normal Preview Path QMap Adoption / Normal Export Path QMap Adoption / Single Cold Producer / Shared Warm Final Surface / No Uncalled presentProduct·exportProduct Path

## 0. Identity

```text
Patch ID = QMAP-LIVE-WIRING-01
Repository = earthroon/TDT
Parent runtime line = TDT-QMAP-STREAMING-REDUCTION-03G-R14D-R2A
Repair target = QMap product runtime reachability
Code delivery = baked ZIP only
Repository delivery = this specification only
Terminal state = QMAP_LIVE_PRODUCT_PATH_ACTIVE
```

This patch connects QMap to the ordinary product loop. It is not another overlay-adoption or gate-count patch.

## 1. Required live path

```text
normal Preview or Export request
→ current Pipeline Final-EWA publication
→ canonical internal product request
→ one cold producer per producer key
→ QMap 5 submissions
→ QWave 2 submissions
→ canonical R9A EFC graph 1 submission
→ one effect-field-converged Pipeline publication
→ Preview and Export consume the same final surface
```

Confirmed parent breaks:

```text
QMapEfcFinalSurfaceProducerService.graphAuthority defaulted to null
normal Preview and Export never entered QMapFinalSurfaceCoordinatorService
presentProduct()/exportProduct() required externally assembled GPU requests
installed admission required QMap execution before QMap runtime initialization
R14D grant and transaction authorities allowed only one process-lifetime run
R14D imported a non-existent qmap_admission module path
fixed 1920×1080 assumptions remained in product execution
```

## 2. State ownership

```text
current Final-EWA publication = PipelineService
source texture and lifetime = SurfaceRegistryAuthorityService
current GPU identity = GpuService
installed session = InstalledAdmissionService
active QMap route = QMapProductRuntimeService + QMapProductPromotionService
product request construction = QMapFinalSurfaceRequestFactoryService
single-flight and warm cache = QMapFinalSurfaceCoordinatorService
R9A EFC recording = QMapR9AEfcGraphAuthorityService
final surface registration = SurfaceRegistryAuthorityService
single current final writer = PipelineService
Preview consumption = PreviewPresenterService
Export consumption = ExportAuthorityService
```

Preview and Export do not own QMap capabilities, field handles, activation bindings, shader identities, or GPU resources.

## 3. Remove pre-session QMap boot block

Installed startup admission verifies an active GPU identity and zero validation/fault counters. It does not run the product QMap graph.

Required startup state:

```text
hardwareGpu = installedStrict
productReferenceExact = false
qmapProductWorkExecuted = false
validationCounterNonzero = 0
faultSentinelCount = 0
pass = active GPU identity exists
```

Forbidden startup call:

```text
window.DadumQsr03gProductStartupCanary.run()
```

QMap product execution begins after installed admission, QMap runtime activation, and product-route promotion.

## 4. Canonical product request factory

Required service:

```text
QMapFinalSurfaceRequestFactoryService
service ID = dadum.runtime.qmap-final-surface-request-factory
```

Its only public input is consumer intent:

```ts
interface QMapFinalSurfaceConsumerIntent {
  consumerKind: 'PREVIEW' | 'EXPORT';
  consumerOperationId: string;
  expectedSourceRevision?: number;
}
```

The factory derives internally:

```text
current Pipeline publication and Surface Registry record
source GPU texture pin and dynamic dimensions
runtime/device epoch and identity
installed session and QMap activation binding
Final-EWA capability and low-pass lineage
canonical effect parameter digest and shader-set digest
GPU buffer limits
R14D operation and grant input
```

Required source admission:

```text
kind = gpu-texture
storage = gpu-texture
format = rgba16float
positive dimensions
source revision = current Pipeline revision
device binding = current GPU identity
qmapLiveProductFinal != true
```

A QMap final surface cannot recursively become its own source. `releaseSource()` is idempotent and releases the Surface Registry pin plus temporary Final-EWA reservation on every terminal path.

## 5. Producer key and concurrency

The producer key binds all output-changing state:

```text
source surface/revision/dimensions
activation binding
Final-EWA identity and descriptor
low-pass receipt and plan
Delta-K, alpha, terminal R1C and coherence authorities
effect parameters and canonical shader set
runtime/device epoch and identity
```

Consumer kind and consumer operation ID are excluded. Therefore Preview and Export for the same source join one producer.

`QMapFinalSurfaceCoordinatorService` owns:

```text
per-key in-flight map = same-key join
global producer tail = different-key cold runs serialized
warm map = current Pipeline final only
```

Dispositions:

```text
COLD_PRODUCER
JOINED_IN_FLIGHT
WARM_FINAL_SURFACE
```

Source CAS is checked before cold execution and again before final publication. A stale producer fails with `E_QMAP_LIVE_WIRING_SOURCE_SUPERSEDED` and cannot overwrite a newer image.

## 6. Normal Preview path

Pipeline subscription behavior:

```text
non-QMap Final-EWA publication
→ coordinator.ensureFinalSurface(PREVIEW intent)
→ QMap final publication
→ normal Preview scheduler enqueue
```

Public Preview behavior:

```text
present(undefined)
→ coordinator.ensureFinalSurface(PREVIEW intent)
→ present returned finalRevision
```

`present(expectedRevision)` remains the exact-revision internal presentation path.

Removed dead API:

```text
presentProduct(QMapFinalSurfaceProductRequest)
```

## 7. Normal Export path

Ordinary export behavior:

```text
exportFinalByFormat(format, undefined, options)
→ coordinator.ensureFinalSurface(EXPORT intent)
→ exportFinal(encoder, returned finalRevision, options)
```

An explicit revision remains an exact-revision replay/internal path.

Removed dead API:

```text
exportProduct(encoder, QMapFinalSurfaceProductRequest, options)
```

When the producer key is unchanged, Export reuses the same surface tuple already produced for Preview.

## 8. Real R9A EFC graph authority

Required service:

```text
QMapR9AEfcGraphAuthorityService
service ID = dadum.runtime.qmap-r9a-efc-graph-authority
authority ID = dadum.qmap.live-r9a-efc-graph-authority.qmap-live-wiring-01
```

It acquires the current GPU lease and Final-EWA surface pin, verifies operation/device identity, creates one operation-bound R9A graph, and releases both resources after completion or failure.

`QMapEfcFinalSurfaceProducerService` has no nullable graph-authority default. Missing `create()` fails initialization.

## 9. Canonical EFC graph

The graph reuses existing canonical kernels. Embedded replacement Phase-Gamma or Bakemono WGSL is forbidden.

Required runtime components:

```text
createEwaCommandGraphR9A
Alpha Sensitivity WGSL-01
Phase-Gamma Proof WGSL-01
Structure Tensor R1C pipeline
Bakemono Authority Field WGSL-06
Final Texture Authority WGSL-05
```

One EFC graph records:

```text
Alpha Sensitivity WGSL-01        1 compute pass
Phase-Gamma WGSL-01              1 compute pass
Terminal Integrated R1C          6 compute passes
Bakemono WGSL-06                 1 compute pass
-----------------------------------------------
EFC total                         9 compute passes
EFC queue submissions             1
EFC fences                        1
```

Full product transaction:

```text
QMap streaming reduction          5 submissions / 5 fences
QWave real + analytic             2 submissions / 2 fences
R9A EFC graph                     1 submission  / 1 fence
-------------------------------------------------------
aggregate                         8 submissions / 8 fences
```

## 10. Live terminal R1C and QMap participation

The same R9A graph records the six-pass terminal tensor chain:

```text
gradient → outer → blurH → blurV → eigen → axial
```

Live lineage:

```text
admissionBasis = LIVE_SAME_GRAPH_EXECUTION
terminalR1cExecutionReceiptDigest = recorded chain receipt
lambda2QualificationReceiptDigest = null
```

This does not forge an offline Lambda2 qualification receipt. Final adoption accepts either prequalified tensor lineage or real same-graph R1C execution lineage.

WGSL-06 receives pinned canonical Analysis fields:

```text
QMap normalized response
QWave real delta-K compatibility field
```

QMap packing used by the effect path:

```text
x = response
y = confidence
w = validity
```

Reading response from unused `z` is forbidden.

## 11. Final writer and dynamic geometry

Only the canonical WGSL-06 candidate recorded in the current graph may pass WGSL-05 selection.

Required final identity:

```text
finalRole = BAKEMONO_RINNE_PHASE_GAMMA_R1C_FINAL
finalSemanticId = tdt.surface.effect-field-converged.linear-premul.rgba16float.v1
effectFieldConverged = true
```

The result is registered in Surface Registry with `producerKeyDigest` and published once through Pipeline.

Dimensions come from the current Final-EWA record and propagate through QMap, QWave, Alpha, Phase-Gamma, R1C, Bakemono, Surface Registry and Pipeline. Fixed 1920×1080 product assertions are forbidden.

## 12. Sequential editing and cleanup

Required lifecycle:

```text
one internal producer grant per operation
R14D transaction returns to READY after success or failure
second sequential edit is allowed
concurrent cold work is serialized by coordinator
```

Failure before submit aborts Alpha/Phase-Gamma records, releases Analysis pins, tracks transient textures, and releases Final-EWA/GPU leases.

Validation-counter failure destroys the unadopted candidate and publishes no final surface.

Final-EWA capability retirement remains legal after TTL expiration so long-running work cannot leak reservations.

## 13. Boot composition

Required order:

```text
installed admission
→ QMap live dependencies
→ QMap product runtime
→ QMap product promotion
→ QMap R9A EFC graph authority
→ QMap EFC producer
→ QMap request factory
→ QMap coordinator
→ Preview
→ Export
```

Preview and Export depend on `dadum.qmap.final-surface.product`.

## 14. Primary implementation files

New:

```text
app/src/runtime/qmap/qmap-final-surface-request-factory-service.ts
app/src/runtime/qmap/qmap-r9a-efc-graph-authority-service.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_01_r9a_graph_authority.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_01_canonical_effect_contract.mjs
```

Rewired:

```text
app/src/boot/runtime-modules.ts
app/src/runtime/admission/installed-admission-service.ts
app/features/resample-runtime/r11a/main-session-authority.mjs
app/src/runtime/preview/preview-presenter-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/qmap/qmap-final-surface-coordinator-service.ts
app/src/runtime/qmap/qmap-efc-final-surface-producer-service.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_product_transaction.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_efc_graph_coordinator.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_04_graph_tensor.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_05_adoption.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_06_graph_effect.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_06_integration.mjs
```

## 15. Completion criteria

Static:

```text
pre-session QMap product boot calls = 0
nullable graph authority defaults = 0
normal Preview coordinator calls >= 1
normal Export coordinator calls >= 1
public presentProduct methods = 0
public exportProduct methods = 0
embedded replacement effect WGSL = 0
R14D missing imports = 0
```

Runtime:

```text
concurrent Preview + Export, same producer key
→ one cold leader
→ one joiner
→ 5 QMap + 2 QWave + 1 EFC submissions
→ one final Pipeline publication
→ Preview tuple == Export tuple
```

Unchanged subsequent request:

```text
cold producer calls = 0
warm reuse = 1
```

Changed source revision:

```text
old warm authority invalid
new cold producer allowed
stale producer publication denied by source CAS
```

## 16. Verification boundary

Source and fixture checks may verify imports, TypeScript syntax, call-site wiring, transaction accounting, single-flight behavior and cleanup paths.

Without a packaged renderer running on a physical WebGPU device, the honest status is:

```text
source and fixture path = VERIFIED
physical packaged WebGPU path = NOT EXECUTED
```

## 17. Non-goals

```text
new QMap or QWave mathematics
replacement Phase-Gamma or Bakemono formulas
CPU/WebGL/QRC02 product fallback
pre-session QMap qualification
source-gate count expansion
GitHub code publication
```

## 18. Final seal

```text
The ordinary Preview request causes the runtime to build and execute QMap internally.
QMap and QWave participate in the canonical R9A effect graph.
The converged texture becomes the sole Pipeline final surface.
Preview presents it and Export reuses it when the producer key is unchanged.
Later edits can run another cold producer.
No caller constructs QMap internals and no dead product-only Preview/Export API remains.
```

Anything weaker remains `QMAP_CODE_PRESENT_BUT_NOT_LIVE`.
