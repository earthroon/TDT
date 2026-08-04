# QMAP-LIVE-WIRING-03

## Canonical Resample Source Replay / Retained QMap Pin-to-Adaptive Policy R1D / Processing Command to Resample Broker / R9A Exact QMap Texture Injection / Stage-Local Policy Projection / QMap-Guided Anisotropy·Footprint / Explicit Product Baseline / Explicit Bootstrap / No Product Neutral-QMap Fallback / No Feedback Recursion Seal

## 0. Identity

```text
Patch ID = QMAP-LIVE-WIRING-03
Parent = QMAP-LIVE-WIRING-02
Repair target = retained QMap field exists but canonical EWA product requests do not consume it
Code delivery = cumulative baked ZIP only
Repository delivery = this specification Markdown only
Terminal state = QMAP_GUIDED_RESAMPLE_LOOP_ACTIVE
```

WIRING-01 connected ordinary Preview and Export to the QMap final-surface path.

WIRING-02 preserved a non-QMap Final-EWA lineage, retained QMap/QWave Analysis fields, split analysis keys from effect-composition keys, and made effect-only changes execute EFC without rebuilding QMap or QWave.

WIRING-03 connects the retained QMap response texture to the existing Adaptive Policy R1D and canonical EWA R9A runtime. It does not introduce replacement QMap, tensor, EWA, Phase-Gamma, R1C or Bakemono formulas.

## 1. Confirmed parent break

The parent already contains the required physical primitives:

```text
QMap normalized-response rgba16float Analysis field
WIRING-02 retained QMap generation cache
Adaptive Policy R1D normalizer and parameter ABI
Adaptive Policy R1D projection WGSL
R9A stage-local policy recording
EWA policy-texture binding
canonical renderer resample executor
renderer-owned resample worker broker
```

The missing product chain is:

```text
processing command
→ canonical source replay
→ current retained QMap pin
→ normalized Adaptive Policy R1D
→ broker request
→ R9A qmapTexture input
→ per-stage policy projection
→ EWA policy texture consumption
→ Pipeline final publication
```

Parent failure state:

```text
qThreshold stored but has no physical EWA consumer
upstream-resample event has no executor listener
ordinary product requests do not inject policy or QMap texture
Adaptive Policy runtime can allocate neutralQmap
selectiveAA changes do not choose a physical product route
QMap response is incorrectly available for use as a fake Delta-E gate
```

## 2. Two distinct source authorities

WIRING-03 intentionally separates two source concepts.

### 2.1 Adaptive replay source

```text
original canonical document-resample source
= QMapAdaptiveResampleSourceAuthorityService
```

This source remains stable across repeated geometry and policy edits within the same source revision. It prevents cumulative downscaling.

Forbidden replay inputs:

```text
previous Final-EWA output
QMap final surface
effect-field-converged surface
Preview canvas
Export bitmap
```

### 2.2 QMap analysis source

```text
latest non-QMap Final-EWA
= WIRING-02 QMapBaseSourceLineageService
```

After an adaptive EWA result is published, WIRING-02 may adopt that new non-QMap Final-EWA and build the next QMap/QWave generation from it.

Therefore:

```text
adaptive replay source != latest QMap analysis source
```

This distinction closes both cumulative-resize drift and feedback recursion.

## 3. Required product loop

### 3.1 Initial document path

The existing normal pipeline may first produce a non-QMap Final-EWA and WIRING-01/02 may produce its QMap final.

When an explicit resample command arrives before a current QMap guide exists:

```text
canonical replay source
→ BOOTSTRAP_BASELINE
→ canonical EWA without Adaptive Policy claim
→ non-QMap Final-EWA
→ WIRING-02 QMap/QWave/EFC
```

`BOOTSTRAP_BASELINE` is not an adaptive execution.

### 3.2 Guided adaptive path

When a current retained QMap guide exists and `selectiveAA=true`:

```text
processing command
→ exact adaptive replay source lease
→ current retained QMap field pin
→ current qThreshold snapshot
→ normalized Adaptive Policy R1D
→ PRODUCT_ADAPTIVE broker request
→ R9A per-stage policy projection
→ EWA consumes policy texture
→ canonical non-QMap Final-EWA publication
→ WIRING-02 QMap/QWave/EFC
→ Preview presents QMap final
→ same-size Export freezes the same final tuple
```

### 3.3 Explicit product baseline

When a guide exists but `selectiveAA=false`:

```text
PRODUCT_BASELINE
→ exact replay source
→ canonical anisotropic EWA
→ no QMap texture binding
→ no policy projection
→ no adaptive claim
```

`PRODUCT_BASELINE` is distinct from `BOOTSTRAP_BASELINE` because a guide exists but the user-selected product policy disables its physical consumption.

### 3.4 Effect-only changes

WIRING-02 behavior remains unchanged:

```text
effect-only patch
→ EWA 0
→ QMap 0
→ QWave 0
→ EFC 1
```

## 4. No feedback recursion

The adaptive coordinator listens only to:

```text
dadum:qmap-upstream-resample-request
```

It does not subscribe to Pipeline final publications, QMap field publications, or WIRING-02 analysis-cache updates.

Therefore:

```text
QMap publication
→ guide becomes available
→ resample count remains unchanged
```

A new adaptive resample starts only from an explicit processing command classification:

```text
UPSTREAM_GEOMETRY_CHANGE
UPSTREAM_RESAMPLE_POLICY_CHANGE
ADAPTIVE_POLICY_CHANGE
```

The following loop is forbidden:

```text
EWA → QMap publication → automatic EWA → QMap publication → ...
```

## 5. State ownership and SSOT

```text
adaptive replay source and long-lived source pin
= QMapAdaptiveResampleSourceAuthorityService

current retained QMap guide pin
= QMapAdaptivePolicyGuideAuthorityService

qThreshold and reserved deltaEThreshold revision
= QMapProcessingCommandBridgeService

normalized Adaptive Policy R1D binding
= QMapAdaptivePolicyBindingService

latest-command batching, broker cancellation and final publication
= QMapAdaptiveResampleCoordinatorService

physical request execution
= ResampleWorkerBrokerService

QMap Analysis field lifetime
= AnalysisFieldAuthorityService

surface lifetime
= SurfaceRegistryAuthorityService

current final publication
= PipelineService

Preview and Export final consumption
= existing WIRING-01/02 consumers
```

Forbidden SSOTs:

```text
DOM slider values
window globals
surface evidence as mutable policy storage
neutralQmap existence
Preview local state
Export encoder options
```

Window facades and DOM events may submit commands but do not own physical policy state.

## 6. Adaptive replay source authority

Required service:

```text
QMapAdaptiveResampleSourceAuthorityService
service ID = dadum.runtime.qmap-adaptive-resample-source
schema = tdt.qmap.adaptive-resample-source.live-wiring-03.v1
```

Required snapshot:

```text
sourceSurfaceId
sourceRevision
sourceWidth / sourceHeight
sourceFormat
sourceTransferId
sourceAlphaMode
contentLineageDigest
runtimeEpoch
deviceEpoch
deviceIdentityDigest
sourcePinGeneration
```

Admission:

```text
GPU texture
positive dimensions
current device binding
not qmapLiveProductFinal
not effectFieldConverged
```

For the same `sourceRevision`, later non-QMap Final-EWA publications do not replace the replay source. A newer source revision pins the new replay source before retiring the old source pin.

Operation leases expose:

```text
snapshot
texture
assertCurrent(stage)
release()
```

A superseded source cannot publish a later result.

## 7. QMap guide authority

Required service:

```text
QMapAdaptivePolicyGuideAuthorityService
service ID = dadum.runtime.qmap-adaptive-policy-guide
consumer ID = tdt.analysis.consumer.qmap-adaptive-resample-r1d
```

The authority reads the current retained WIRING-02 generation and accepts only:

```text
semanticId = tdt.analysis.qmap.normalized-response.v1
resourceKind = texture-2d
format = rgba16float
claimLevel >= EFFECTIVE_EXECUTION
sourceRevision = adaptive replay source revision
current device epoch and identity
```

A missing current guide is not a neutral adaptive guide. It selects `BOOTSTRAP_BASELINE`.

A guide lease contains:

```text
fieldId / generation
analysisGenerationDigest
qmapExecutionReceiptDigest
qmapWidth / qmapHeight
qmapTexture
analysis source surface/revision
device epoch and identity
assertCurrent(stage)
release()
```

Analysis Field Authority remains the physical owner of the QMap texture.

## 8. Adaptive input command classification

`QMapProcessingCommandBridgeService` is the single processing-command classifier.

```text
width / height / lockAspect
→ UPSTREAM_GEOMETRY_CHANGE
→ dispatch upstream resample request

selectiveAA
→ UPSTREAM_RESAMPLE_POLICY_CHANGE
→ dispatch upstream resample request

qThreshold
→ increment adaptive input revision when normalized value changes
→ when selectiveAA=true, dispatch ADAPTIVE_POLICY_CHANGE

deltaEThreshold
→ retain revision and digest only
→ no WIRING-03 physical resample trigger
→ reserved for true Delta-E WIRING-04
```

The internal event is an execution handoff with exactly one product listener. It is not the policy SSOT.

Same-turn command patches are merged before execution.

## 9. Adaptive Policy R1D binding

Required service:

```text
QMapAdaptivePolicyBindingService
service ID = dadum.runtime.qmap-adaptive-policy-binding
schema = tdt.qmap.adaptive-policy-binding.live-wiring-03.v1
```

The service normalizes the existing canonical R1D contract with:

```text
qThreshold = current adaptive input
maxAnisotropy = 3
tensorSigma = 1.15
coherenceExponent = 1.25

deThreshold = 0
deSoftness = 1
deStrength = 0
trueDeltaEFieldPresent = false
```

`deStrength=0` ensures WIRING-03 does not create a physical Delta-E claim from QMap response.

Required binding:

```text
adaptiveInputRevision
adaptiveInputDigest
policy
policyDigest
policyFootprintBound
guideFieldId / guideGeneration
analysisGenerationDigest
qmapExecutionReceiptDigest
qmapTexture / qmapWidth / qmapHeight
trueDeltaEFieldPresent = false
```

## 10. Physical QMap channel contract

The retained QMap texture packing consumed by WIRING-03 is:

```text
QMap.r = normalized response
QMap.g = confidence
QMap.a = validity
```

Adaptive Policy projection writes:

```text
Policy.r = discrete response level
Policy.g = tensor influence × confidence × validity
Policy.b = footprint scale
Policy.a = 1.0 in WIRING-03
```

Required shader behavior:

```text
q = clamp(QMap.r)
confidenceValidity = clamp(QMap.g) × clamp(QMap.a)
tensorInfluence *= confidenceValidity
```

Forbidden semantic substitution:

```text
QMap response != Delta-E
QMap confidence != Delta-E
QMap validity != Delta-E
```

## 11. Product route modes

Canonical executor and R1D facade admit exactly these WIRING-03 route meanings:

```text
BOOTSTRAP_BASELINE
PRODUCT_BASELINE
PRODUCT_ADAPTIVE
```

### BOOTSTRAP_BASELINE

```text
guide required = false
policy required = false
qmapTexture required = false
adaptive claim = false
```

### PRODUCT_BASELINE

```text
guide may exist
policy required = false
qmapTexture required = false
adaptive claim = false
```

### PRODUCT_ADAPTIVE

```text
guide required = true
policy required = true
qmapTexture required = true
neutral QMap fallback = forbidden
```

A `PRODUCT_ADAPTIVE` request missing either policy or exact QMap texture fails closed.

Stable failure:

```text
E_QMAP_LIVE_WIRING_NEUTRAL_POLICY_FORBIDDEN
```

The legacy neutral texture may remain available for unrelated compatibility callers, but it is not admitted on the WIRING-03 product-adaptive route.

## 12. R9A stage-local consumption

For every planned EWA stage in `PRODUCT_ADAPTIVE`:

```text
record stage-local R1C tensor
record Adaptive Policy R1D projection from exact QMap texture
bind projected policy texture to EWA binding 4
record EWA stage
```

Required relation:

```text
policy projection pass count = EWA stageCount
```

Policy projection is recorded in the same R9A command graph. It does not create a separate queue submission per policy pass.

The policy physically affects:

```text
tensor influence
major/minor anisotropy response
footprint scale
support-envelope bound
stage-local EWA sampling behavior
```

## 13. Adaptive resample coordinator

Required service:

```text
QMapAdaptiveResampleCoordinatorService
service ID = dadum.runtime.qmap-adaptive-resample-coordinator
capability = dadum.qmap.adaptive-resample.product
```

Responsibilities:

```text
merge same-turn commands
cancel the currently pending broker request on supersession
serialize command execution
acquire source and optional guide leases
select one route mode
build one canonical broker request
recheck source and guide after broker completion
publish one canonical Pipeline final
invalidate an unadopted produced surface on failure
release all pins on every terminal path
```

Upscaling is not admitted by this downscale path.

The coordinator does not maintain a second QMap publication listener and does not trigger itself from its own output.

## 14. Stale-result and ownership closure

Before execution:

```text
source lease current
guide lease current when adaptive
GPU identity current
```

After broker completion and before Pipeline publication:

```text
source lease current
guide lease current when adaptive
broker result is canonical surface
```

If a broker surface was registered but not adopted by Pipeline because the operation was cancelled, superseded or failed, the coordinator invalidates that surface.

No stale source or guide may become the current final writer.

## 15. Output evidence

The canonical resample surface records:

```text
qmapAdaptiveRouteMode
qmapAdaptivePolicyDigest
guide field and generation
analysisGenerationDigest
adaptive input revision and digest
contentLineageDigest
qmapNeutralFallbackUsed
qmapAsDeltaESubstitution = false
canonical kernel and receipt identities
```

For `PRODUCT_ADAPTIVE`:

```text
qmapNeutralFallbackUsed = false
qmapAsDeltaESubstitution = false
```

For baseline routes, absent adaptive evidence is not rewritten as an adaptive success.

## 16. Preview and Export boundary

Normal Preview receives the newly published non-QMap Final-EWA through the existing WIRING-01 path, obtains the QMap/EFC final and presents it.

Normal same-size Export freezes and consumes that exact current final tuple through WIRING-02.

WIRING-03 does not add an Export-only dimension override. The existing Export authority rejects target dimensions that differ from the authoritative final surface.

Therefore the honest parity claim is:

```text
Preview final tuple = same-size Export frozen tuple
```

Not yet claimed:

```text
Export-specific additional adaptive downscale
```

That boundary belongs to `QMAP-LIVE-WIRING-03-R1`.

## 17. Submission behavior

```text
BOOTSTRAP_BASELINE resample
→ EWA graph submission = 1
→ policy projection passes = 0
→ downstream WIRING-02 QMap/QWave/EFC may run

PRODUCT_BASELINE resample
→ EWA graph submission = 1
→ policy projection passes = 0
→ downstream WIRING-02 QMap/QWave/EFC may run

PRODUCT_ADAPTIVE resample
→ EWA graph submission = 1
→ policy projection passes = stageCount
→ downstream WIRING-02 QMap/QWave/EFC may run

effect-only edit
→ EWA = 0
→ QMap = 0
→ QWave = 0
→ EFC = 1

unchanged Preview or same-size Export
→ EWA = 0
→ QMap = 0
→ QWave = 0
→ EFC = 0
```

## 18. Boot composition

```text
GPU + Surface Registry + Pipeline
→ Analysis Field Authority
→ WIRING-02 retained analysis generation
→ QMap Adaptive Resample Source Authority
→ QMap Adaptive Policy Guide Authority
→ QMap Adaptive Policy Binding
→ Resample Worker Broker
→ QMap Adaptive Resample Coordinator
→ Processing Command Bridge
→ Preview
→ Export
```

Required runtime capabilities:

```text
dadum.qmap.adaptive-resample-source
dadum.qmap.adaptive-resample.product
dadum.qmap.processing-command-bridge
```

## 19. Primary implementation files

New:

```text
app/src/runtime/qmap/qmap-adaptive-resample-source-authority-service.ts
app/src/runtime/qmap/qmap-adaptive-policy-guide-authority-service.ts
app/src/runtime/qmap/qmap-adaptive-policy-binding-service.ts
app/src/runtime/qmap/qmap-adaptive-resample-coordinator-service.ts
tools/qmap-live-wiring-03/verify-guided-resample-wiring.mjs
tools/qmap-live-wiring-03/verify-policy-projection.mjs
```

Modified:

```text
app/src/runtime/qmap/qmap-processing-command-bridge-service.ts
app/src/runtime/resample/canonical-resample-executor-r8a.ts
app/src/runtime/service-token.ts
app/src/boot/runtime-modules.ts
app/src/boot/stable-error.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_02_analysis_generation_cache.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_contract_r8.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/adaptive_policy_projection_r1d.wgsl
app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs
package.json
```

## 20. Stable failures

```text
E_QMAP_LIVE_WIRING_ADAPTIVE_SOURCE_INVALID
E_QMAP_LIVE_WIRING_ADAPTIVE_SOURCE_NOT_READY
E_QMAP_LIVE_WIRING_ADAPTIVE_SOURCE_MISSING
E_QMAP_LIVE_WIRING_ADAPTIVE_SOURCE_STALE
E_QMAP_LIVE_WIRING_ADAPTIVE_SOURCE_SUPERSEDED
E_QMAP_LIVE_WIRING_ADAPTIVE_SOURCE_DEVICE_MISMATCH
E_QMAP_LIVE_WIRING_GUIDE_NOT_READY
E_QMAP_LIVE_WIRING_GUIDE_INVALID
E_QMAP_LIVE_WIRING_GUIDE_LINEAGE_MISMATCH
E_QMAP_LIVE_WIRING_GUIDE_DEVICE_MISMATCH
E_QMAP_LIVE_WIRING_GUIDE_SUPERSEDED
E_QMAP_LIVE_WIRING_POLICY_BINDING_NOT_READY
E_QMAP_LIVE_WIRING_POLICY_DIGEST_INVALID
E_QMAP_LIVE_WIRING_ADAPTIVE_COORDINATOR_NOT_READY
E_QMAP_LIVE_WIRING_ADAPTIVE_TARGET_INVALID
E_QMAP_LIVE_WIRING_ADAPTIVE_UPSCALE_FORBIDDEN
E_QMAP_LIVE_WIRING_ADAPTIVE_DEVICE_MISMATCH
E_QMAP_LIVE_WIRING_ADAPTIVE_RESULT_INVALID
E_QMAP_LIVE_WIRING_ADAPTIVE_ROUTE_INVALID
E_QMAP_LIVE_WIRING_NEUTRAL_POLICY_FORBIDDEN
E_QMAP_LIVE_WIRING_FALSE_DELTA_E_AUTHORITY
```

## 21. Completion criteria

```text
upstream resample event product listeners = 1
QMap-publication resample listeners = 0
adaptive replay sources per source revision = 1
recursive QMap final source admissions = 0
PRODUCT_ADAPTIVE exact QMap texture presence = 100%
PRODUCT_ADAPTIVE exact policy presence = 100%
PRODUCT_ADAPTIVE neutral fallback count = 0
PRODUCT_ADAPTIVE policy projection passes = EWA stageCount
PRODUCT_BASELINE policy projection passes = 0
BOOTSTRAP_BASELINE policy projection passes = 0
qThreshold physical consumer path = 1
deltaEThreshold physical WIRING-03 consumers = 0
QMap-as-Delta-E substitutions = 0
unadopted stale surfaces retained = 0
Preview and same-size Export final tuple mismatch = 0
terminal state = QMAP_GUIDED_RESAMPLE_LOOP_ACTIVE
```

Verification status must remain explicit:

```text
source wiring and executable fixtures = VERIFIED
packaged physical WebGPU product loop = NOT EXECUTED
Export-specific additional resize = NOT IMPLEMENTED
true Delta-E field = NOT IMPLEMENTED
```

## 22. Non-goals and next boundaries

WIRING-03 does not implement:

```text
true Lab/OKLab Delta-E field
QMap-as-Delta-E substitution
Export-only additional downscale
CPU/WebGL/QRC02 product fallback
new QMap or EWA mathematics
```

Immediate follow-up:

```text
QMAP-LIVE-WIRING-03-R1

Export Requested-Size Adaptive Resample /
Frozen Source·Guide·Policy Snapshot /
Canonical Broker Reuse /
Preview·Export Policy ABI Parity /
No Encoder-Local Downscale Seal
```

Then:

```text
QMAP-LIVE-WIRING-04

True Lab Delta-E Analysis Field /
Source-vs-Lowpass Color Difference Authority /
Adaptive Policy Second-Field Binding /
Delta-E Soft Gate /
QMap·Delta-E Joint Policy /
No QMap-as-Delta-E Semantic Substitution Seal
```

## 23. Final seal

```text
Repeated geometry and selective-AA commands replay from one canonical source rather than the previous output.
The current retained QMap texture is pinned through Analysis Field Authority.
PRODUCT_ADAPTIVE cannot execute without that exact texture and a canonical Adaptive Policy R1D.
QMap response, confidence and validity physically modulate stage-local EWA policy.
The policy texture is consumed by each R9A EWA stage in the same command graph.
PRODUCT_BASELINE and BOOTSTRAP_BASELINE do not claim adaptive execution.
QMap publication does not trigger another resample.
A stale operation cannot publish and cannot leave an unadopted surface alive.
The normal Preview and same-size Export continue through the shared QMap final-surface path.
```

Anything weaker remains:

```text
QMAP_ANALYSIS_PRESENT_BUT_EWA_POLICY_NOT_LIVE
```
