# QMAP-LIVE-WIRING-04

## True CIEDE2000 Analysis Field / Same-Resolution Final-EWA-to-Reference-Lowpass Authority / Linear-Premultiplied Alpha-Aware Color Contract / Atomic QMap·QWave·Delta-E Analysis Generation / Adaptive Policy R1E Dual-Texture ABI / Physical Delta-E Soft Gate / qThreshold·deltaEThreshold Product Consumption / Product·Export Composite Guide Parity / No sRGB Double Decode / No QMap-as-Delta-E Substitution Seal

## 0. Identity

```text
Patch ID = QMAP-LIVE-WIRING-04
Parent = QMAP-LIVE-WIRING-03-R1
Repair target = deltaEThreshold has state but no physical color-difference field or EWA policy input
Code delivery = cumulative baked ZIP only
Repository delivery = this specification Markdown only
Terminal state = QMAP_DELTAE_JOINT_ADAPTIVE_POLICY_ACTIVE
```

WIRING-03 connects a retained QMap response field to the canonical EWA R9A Adaptive Policy path.

WIRING-03-R1 reuses that path for requested-size Export through an Export-private EWA and private QMap/QWave/EFC branch.

WIRING-04 adds a real threshold-independent CIEDE2000 Analysis field, retains it atomically with the QMap/QWave generation, and upgrades the Adaptive Policy projection from one QMap texture to a physical QMap plus Delta-E dual-texture contract.

This patch does not promote the legacy `deltaE_webgpu.js` visualization path to product authority. It introduces a separate linear-premultiplied Analysis producer with explicit semantics, field lifetime, GPU ownership and policy ABI.

## 1. Confirmed parent break

The parent stores:

```text
qThreshold
selectiveAA
deltaEThreshold
adaptive input revision
adaptive input digest
```

but the physical adaptive path uses only the QMap texture.

The parent intentionally prevents false Delta-E authority with:

```text
deStrength = 0
trueDeltaEFieldPresent = false
qmapAsDeltaESubstitution = false
```

The existing legacy Delta-E implementation is not admissible because it is a display-oriented `rgba8unorm` heatmap path with sRGB assumptions, reusable global buffers and no Analysis Field Authority publication contract.

Required correction:

```text
non-QMap Final-EWA
→ same-resolution reference lowpass
→ physical CIEDE2000 rgba16float field
→ retained composite QMap + Delta-E guide
→ Adaptive Policy R1E dual-texture projection
→ stage-local EWA policy consumption
```

Forbidden correction:

```text
QMap.r renamed Delta-E
legacy rgba8 heatmap bound as product field
already-linear RGB decoded as sRGB again
premultiplied RGB sent directly to Lab conversion
CPU full-frame color-difference calculation
```

## 2. State ownership and SSOT

```text
canonical non-QMap Final-EWA texture
= WIRING-02 QMap product operation source

Delta-E producer registration and GPU execution
= qmap_live_wiring_04_deltae_analysis.mjs

Delta-E physical resource lifetime
= AnalysisFieldAuthorityService

atomic QMap·QWave·Delta-E generation and retained pins
= createQMapLiveWiring02AnalysisGenerationCache()

current product composite guide
= currentQMapLiveWiring02GuideSnapshot()

composite QMap + Delta-E guide validation and pinning
= QMapAdaptivePolicyGuideAuthorityService

qThreshold and deltaEThreshold state
= QMapProcessingCommandBridgeService

Adaptive Policy R1E normalization and immutable binding
= QMapAdaptivePolicyBindingService

stage-local R1E projection and EWA consumption
= canonical resample executor + R9A runtime

requested-size Export dual-field snapshot
= QMapExportRequestedSizeCoordinatorService

surface publication
= PipelineService for PRODUCT_CURRENT only
```

Forbidden state owners:

```text
DOM slider values
window globals
legacy Delta-E display buffers
QMap channels interpreted as Delta-E
surface evidence mutated after publication
encoder resize options
```

## 3. Canonical comparison authority

The physical color difference compares two textures with identical dimensions and coordinate space.

```text
A = current canonical non-QMap Final-EWA
B = same-resolution fixed reference lowpass of A
metric = CIEDE2000
```

The comparison does not use:

```text
original full-resolution document source against a smaller Final-EWA
previous Preview output against current Preview output
QMap final against non-QMap Final-EWA
effect-field-converged output against source
Export bitmap readback against Preview canvas
```

The same-resolution contract avoids coordinate ambiguity and prevents a color-difference producer from recursively requesting another resample.

## 4. Admitted input color contract

The WIRING-04 producer admits the existing product texture contract:

```text
resource kind = texture-2d
format = rgba16float
transfer = linear
primaries = Rec.709 / sRGB
white point = D65
alpha mode = premultiplied
coordinate space = stage-pixel
```

The producer does not apply an sRGB electro-optical transfer function to the input because the product texture is already linear.

Color conversion sequence:

```text
linear premultiplied RGB
→ alpha-valid straight linear RGB
→ linear Rec.709 RGB to XYZ D65
→ XYZ D65 to CIE Lab D65
→ CIEDE2000
```

WIRING-04 does not claim arbitrary ICC profile support. Non-Rec.709 working-space canonicalization belongs to WIRING-04-R1.

## 5. Alpha-aware comparison

```text
alphaEpsilon = 1 / 1024
```

For source and reference samples:

```text
sourceValid = sourceAlpha > alphaEpsilon
referenceValid = referenceAlpha > alphaEpsilon

straightSourceRGB = sourcePremultipliedRGB / sourceAlpha
straightReferenceRGB = referencePremultipliedRGB / referenceAlpha
```

A pixel is physically valid only when source and reference coverage are admitted and converted values are finite.

Invalid or transparent output:

```text
DeltaE.r = 0
DeltaE.g = 0
DeltaE.b = abs(sourceAlpha - referenceAlpha)
DeltaE.a = 0
```

A zero validity channel is neutral authority. It is not evidence that the true color difference is zero.

## 6. Same-resolution reference lowpass

The reference texture is generated inside the Delta-E graph.

```text
kernel = separable binomial 5-tap
weights = [1, 4, 6, 4, 1] / 16
passes = horizontal + vertical
border = clamp-to-edge
source dimensions = output dimensions
format = rgba16float
```

Physical passes:

```text
reference-lowpass-h
reference-lowpass-v
ciede2000
```

All three passes are encoded into one command encoder and one queue submission.

The two temporary reference textures are Analysis-private resources. They are never published through Pipeline, never retained as product guides and never admitted as QMap sources.

## 7. Delta-E Analysis producer

```text
producer ID
= tdt.analysis.producer.deltae00.source-lowpass.wgsl04

implementation ID
= qmap-live-wiring-04-deltae00-linear-premul-v1

GPU owner
= dadum.gpu.consumer.qmap-deltae-analysis

semantic ID
= tdt.analysis.deltae00.source-vs-reference-lowpass.r1.v1

packing ID
= tdt.deltae00.coverage-alpha-validity.rgba16float.v1
```

Resource descriptor:

```text
resourceKind = texture-2d
format = rgba16float
claimLevel = EFFECTIVE_EXECUTION
owned = true
coordinateSpace = stage-pixel
thresholdIndependent = true
legacyRgba8Heatmap = false
qmapAsDeltaESubstitution = false
```

Channel packing:

```text
R = physical CIEDE2000 value
G = coverage confidence
B = absolute source/reference alpha difference
A = validity
```

Semantic registry range:

```text
physical Delta-E = [0, 65504]
confidence = [0, 1]
alpha difference = [0, 1]
validity = [0, 1]
neutral = [0, 0, 0, 0]
```

## 8. Physical execution and receipts

One cold Delta-E build performs:

```text
compute passes = 3
queue submissions = 1
fences = 1
intermediate pixel readbacks = 0
CPU pixel compute = false
WebGL pixel compute = false
Canvas pixel compute = false
```

The producer records:

```text
pipeline IDs
shader asset digests
three dispatch records
submission sequence
fence completion
parameter digest
request digest
resource descriptor digest
```

The Analysis Field handle is published only after the queue fence completes and the GPU lease remains current.

Cancellation is checked:

```text
before GPU lease work
before queue submit
after fence
```

On failure, the Analysis build is failed and all temporary textures and buffers are destroyed. Once publication succeeds, output ownership transfers to Analysis Field Authority.

## 9. Atomic retained analysis generation

`createQMapLiveWiring02AnalysisGenerationCache()` retains five fields:

```text
QMap normalized response
QWave real component
QWave imaginary component
QWave analytic complex
CIEDE2000 field
```

Cold generation:

```text
QMap submissions = 5
QWave submissions = 2
Delta-E submissions = 1
```

Warm generation:

```text
QMap submissions = 0
QWave submissions = 0
Delta-E submissions = 0
```

The cache computes one `analysisGenerationDigest` over all five exact handles, generations, semantic IDs, execution receipts and field-set digests.

The current product guide snapshot is published only when both are available:

```text
qmapHandle
deltaEHandle
```

No guide snapshot may expose a QMap field without the matching Delta-E field.

On source replacement or analysis cancellation, all retained pins are released and all five fields are requested for disposal as one generation.

## 10. Composite guide authority

```text
consumer ID = tdt.analysis.consumer.qmap-adaptive-resample-r1e
accepted semantics:
  tdt.analysis.qmap.normalized-response.v1
  tdt.analysis.deltae00.source-vs-reference-lowpass.r1.v1
```

`QMapAdaptivePolicyGuideAuthorityService` validates:

```text
QMap and Delta-E sourceSurfaceId equal
QMap and Delta-E sourceRevision equal
QMap and Delta-E dimensions equal
QMap and Delta-E device epoch equal current GPU
QMap and Delta-E device identity equal current GPU
both formats = rgba16float
both resources = texture-2d
both claims admitted
```

A mismatch fails with composite-guide authority error. It is never repaired by pairing fields from different generations.

The guide lease pins both physical textures and exposes:

```text
QMap field ID / generation / receipt / texture / dimensions
Delta-E field ID / generation / receipt / texture / dimensions
analysisGenerationDigest
source lineage and device identity
```

Both pins release together.

## 11. Adaptive Policy R1E ABI

WIRING-04 preserves the old R1D constants for unrelated compatibility paths and adds a product R1E contract.

```text
ABI ID = tdt.adaptive-policy.params.r1e.v1
ABI version = 0x0001000e
uniform bytes = 80
```

Uniform layout:

```text
field dimensions
QMap dimensions
Delta-E dimensions
qThreshold
level2Threshold
level1TensorInfluence
level2TensorInfluence
level0FootprintScale
level1FootprintScale
level2FootprintScale
deltaEThreshold
deltaESoftness
deltaEStrength
stageIndex
ABI version
trueDeltaEFieldPresent
padding
```

WGSL bindings:

```text
binding 0 = QMap texture
binding 1 = Delta-E texture
binding 2 = rgba16float policy output texture
binding 3 = R1E uniform buffer
```

For `PRODUCT_ADAPTIVE` and `EXPORT_PRODUCT_ADAPTIVE`:

```text
QMap texture required = true
Delta-E texture required = true
trueDeltaEFieldPresent = true
neutral QMap fallback = forbidden
neutral Delta-E fallback = forbidden
```

A missing field fails before physical adaptive execution.

## 12. Joint policy projection

QMap channels:

```text
q = clamp(QMap.r, 0, 1)
qAuthority = clamp(QMap.g, 0, 1) × clamp(QMap.a, 0, 1)
```

QMap selects response level, tensor influence and footprint scale.

```text
level 0 = below qThreshold
level 1 = qThreshold to level2Threshold
level 2 = at or above level2Threshold

tensorInfluence *= qAuthority
```

Delta-E channels:

```text
physicalDeltaE = max(DeltaE.r, 0)
deltaEAuthority = clamp(DeltaE.g, 0, 1) × clamp(DeltaE.a, 0, 1)
```

Physical soft gate:

```text
rawColorGate
= smoothstep(
    deltaEThreshold,
    deltaEThreshold + deltaESoftness,
    physicalDeltaE
  )

effectiveStrength
= deltaEStrength
  × deltaEAuthority
  × trueDeltaEFieldPresent

colorGate
= mix(1.0, rawColorGate, effectiveStrength)
```

Policy output:

```text
Policy.r = QMap response level
Policy.g = QMap tensor influence × QMap authority
Policy.b = QMap-selected footprint scale
Policy.a = physical Delta-E color gate
```

The EWA stage consumes the resulting policy texture through the existing policy binding. QMap and Delta-E remain semantically separate inputs.

## 13. Processing command behavior

`QMapProcessingCommandBridgeService` remains the SSOT for normalized adaptive inputs.

When `selectiveAA=true`:

```text
qThreshold change
→ adaptive input revision changes
→ ADAPTIVE_POLICY_CHANGE dispatched

deltaEThreshold change
→ adaptive input revision changes
→ ADAPTIVE_POLICY_CHANGE dispatched
```

When `selectiveAA=false`, threshold state may change but the explicit product baseline route does not claim adaptive execution.

Threshold changes do not mutate an existing Delta-E field because the field is physical and threshold-independent.

A threshold command causes the next adaptive resample to project a new R1E policy from the retained composite guide. The resulting new non-QMap Final-EWA then enters the normal downstream product loop and receives a new QMap/QWave/Delta-E/EFC generation for that new surface.

## 14. Product adaptive path

Current product path:

```text
canonical non-QMap Final-EWA
→ QMap 5
→ QWave 2
→ Delta-E graph 1
→ atomic retained composite generation
→ EFC 1
→ Pipeline QMap final
```

Next guided resample:

```text
canonical replay source
+ retained QMap texture
+ retained Delta-E texture
+ R1E policy parameters
→ stage-local R1E projection per EWA stage
→ canonical EWA
→ new non-QMap Final-EWA
→ new product analysis generation
```

The QMap/Delta-E publication does not automatically trigger another EWA. WIRING-03 no-feedback-recursion rules remain in force.

## 15. Route modes

Baseline routes remain explicit:

```text
BOOTSTRAP_BASELINE
PRODUCT_BASELINE
EXPORT_BOOTSTRAP_BASELINE
EXPORT_PRODUCT_BASELINE
```

These routes:

```text
project no adaptive policy
bind no product QMap/Delta-E authority
claim no adaptive execution
```

Adaptive routes:

```text
PRODUCT_ADAPTIVE
EXPORT_PRODUCT_ADAPTIVE
```

These routes require the complete composite guide and the R1E ABI.

A product-adaptive request cannot silently fall back to R1D, neutral QMap or neutral Delta-E.

## 16. Requested-size Export parity

WIRING-03-R1 requested-size Export freezes:

```text
canonical replay source
QMap guide field and pin
Delta-E guide field and pin
analysisGenerationDigest
R1E policy and policyDigest
adaptive input revision and digest
effect parameter revision and digest
device identity
target dimensions
```

Private adaptive EWA receives both QMap and Delta-E textures and uses the same R1E policy ABI as the product path.

The private EWA output then enters an `EXPORT_PRIVATE` R14D generation:

```text
private QMap = 5
private QWave = 2
private Delta-E = 1
private EFC = 1
Pipeline writers = 0
product guide replacements = 0
```

The private Delta-E field is built to keep the R14D composite analysis contract identical between product and Export-private paths. Because the private branch uses `scope=EXPORT_PRIVATE` and `publishGuide=false`, it never replaces the product-current guide.

Private Analysis fields retire after the private final surface is owner-pinned. No later adaptive resample consumes the private Delta-E field.

## 17. Submission accounting

First or new product generation:

```text
QMap = 5
QWave = 2
Delta-E = 1
EFC = 1
total = 9
normal fences = 9
```

Effect-only recomposition:

```text
QMap = 0
QWave = 0
Delta-E = 0
EFC = 1
total = 1
```

Warm unchanged Preview or same-size Export:

```text
additional submissions = 0
```

Requested-size adaptive Export cold branch:

```text
private EWA graph = 1
private QMap = 5
private QWave = 2
private Delta-E = 1
private EFC = 1
total = 10
Pipeline writers = 0
```

Delta-E itself always remains one queue submission containing three compute passes.

## 18. Final surface and receipt evidence

Product and private R14D receipts carry:

```text
Delta-E field ID
Delta-E generation
Delta-E execution receipt digest
Delta-E semantic ID
trueDeltaEFieldPresent = true
qmapAsDeltaESubstitution = false
queueSubmissions = 9 for the R14D product transaction
normalFences = 9
publicationMode
pipelineWriterCount
```

Final surface evidence includes the exact composite analysis lineage.

`EXPORT_PRIVATE` continues to carry:

```text
pipelinePublished = false
pipelineWriterCount = 0
no fake global finalRevision
no fake Pipeline receipt
```

## 19. Resource lifecycle

Delta-E cold build:

```text
GPU lease acquired
→ Analysis build lease opened
→ temporary horizontal lowpass texture
→ temporary vertical reference texture
→ output field texture
→ uniform buffer
→ one submit and fence
→ output published
→ temporary resources destroyed
→ output owned by Analysis Field Authority
```

Composite generation cache:

```text
pin all five fields
→ expose QMap + Delta-E guide atomically
→ warm reuse while analysis key matches
→ release all pins on replacement/cancellation/dispose
→ request all fields for disposal
```

Guide use:

```text
pin QMap + Delta-E
→ assert both physical fields and device
→ build immutable R1E binding
→ record stage-local policy
→ release both pins
```

No physical field is destroyed while an active guide or EWA graph still owns a pin.

## 20. Generated authority updates

WIRING-04 updates:

```text
Analysis semantic registry
GPU consumer manifest
legacy static admission digest and changed WGSL record
active runtime graph shader node digest and graph digest
```

The Analysis semantic descriptor declares:

```text
domain = spatial
coordinateSpace = stage-pixel
representation = physical CIEDE2000 source versus same-resolution reference lowpass
defaultFormat = rgba16float
mipPolicy = none
claim requirements:
  source-admitted
  linear-transfer
  premultiplied-alpha
  d65-white-point
```

Generated digests must validate against canonical JSON. They are not hand-waved by skipping manifest checks.

## 21. Primary implementation files

New:

```text
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_04_deltae_analysis.mjs
tools/qmap-live-wiring-04/verify-deltae-analysis-fixture.mjs
tools/qmap-live-wiring-04/verify-r1e-policy-abi.mjs
tools/qmap-live-wiring-04/verify-live-wiring.mjs
```

Core analysis and R14D rewires:

```text
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_02_analysis_generation_cache.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_product_transaction.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_surface_registration.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_final_receipt.mjs
app/src/runtime/qmap/qmap-efc-final-surface-producer-service.ts
app/src/runtime/qmap/qmap-efc-final-surface-types.ts
```

Adaptive policy and resample rewires:

```text
app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_params.mjs
app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_runtime.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/adaptive_policy_projection_r1d.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_contract_r8.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r7.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r8.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs
app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs
app/src/runtime/resample/canonical-resample-executor-r8a.ts
```

Guide, command and Export rewires:

```text
app/src/runtime/qmap/qmap-adaptive-policy-guide-authority-service.ts
app/src/runtime/qmap/qmap-adaptive-policy-binding-service.ts
app/src/runtime/qmap/qmap-adaptive-resample-coordinator-service.ts
app/src/runtime/qmap/qmap-processing-command-bridge-service.ts
app/src/runtime/qmap/qmap-export-requested-size-coordinator-service.ts
```

Authority and verification rewires:

```text
app/src/runtime/analysis/generated/generated-analysis-semantic-registry.json
app/src/runtime/gpu/gpu-consumer-manifest.json
app/src/legacy/generated-legacy-static-admission.json
app/src/runtime/active-graph/generated-active-runtime-graph.json
app/src/boot/stable-error.ts
package.json
R14D/R14E/WIRING-02/WIRING-03/WIRING-03-R1 fixtures and source gates
```

## 22. Stable failures

Product and policy failures:

```text
E_QMAP_LIVE_WIRING_DELTAE_FIELD_REQUIRED
E_QMAP_LIVE_WIRING_DELTAE_GUIDE_INVALID
E_QMAP_LIVE_WIRING_COMPOSITE_GUIDE_MISMATCH
E_QMAP_LIVE_WIRING_FALSE_DELTA_E_AUTHORITY
```

Delta-E producer failures:

```text
E_QMAP_LIVE_WIRING_DELTAE_DIMENSION_INVALID
E_QMAP_LIVE_WIRING_DELTAE_SOURCE_MISSING
E_QMAP_LIVE_WIRING_DELTAE_DEVICE_MISMATCH
```

Existing source, guide, cancellation, device and Export-private failures remain authoritative and are not replaced by a generic Delta-E error.

## 23. Completion scenarios

Cold product generation:

```text
physical Delta-E producer calls = 1
Delta-E queue submits = 1
Delta-E passes = 3
Delta-E readbacks = 0
R14D total submissions = 9
composite guide published = 1
```

Effect-only change:

```text
Delta-E rebuilds = 0
QMap rebuilds = 0
QWave rebuilds = 0
EFC submits = 1
```

Threshold-only command with selective AA enabled:

```text
existing Delta-E field mutation = 0
new R1E projection on next adaptive EWA = 1 per EWA stage
QMap-as-Delta-E reads = 0
```

Requested-size adaptive Export:

```text
frozen product QMap and Delta-E pins = 1 pair
private EWA = 1
private Delta-E generation = 1
private product guide publications = 0
Pipeline writers = 0
encoder-local resize = 0
```

Source replacement:

```text
old composite generation retired
old QMap and Delta-E guide unavailable for new source
new QMap/QWave/Delta-E generation required
stale final publication = 0
```

## 24. Completion criteria

```text
physical product Delta-E producers = 1
legacy rgba8 Delta-E product consumers = 0
sRGB double-decode paths = 0
premultiplied RGB direct-Lab paths = 0
QMap-as-Delta-E substitutions = 0
CPU full-image Delta-E readbacks = 0

product composite guide QMap presence = 100%
product composite guide Delta-E presence = 100%
PRODUCT_ADAPTIVE R1E policy presence = 100%
EXPORT_PRODUCT_ADAPTIVE R1E policy presence = 100%
neutral Delta-E adaptive fallbacks = 0

Delta-E queue submissions per cold generation = 1
Delta-E compute passes per cold generation = 3
R14D cold submissions = 9
requested-size adaptive Export total submissions = 10

effect-only Delta-E rebuilds = 0
warm Delta-E rebuilds = 0
threshold-dependent Delta-E field digests = 0
composite generation mismatches = 0
stale Delta-E publications = 0
unreleased Delta-E field pins = 0
private Export guide evictions = 0
private Export Pipeline writers = 0

terminal state
= QMAP_DELTAE_JOINT_ADAPTIVE_POLICY_ACTIVE
```

## 25. Verification boundary

Baked executable verification:

```text
WIRING-04 Delta-E fixture
→ submissions = 1
→ passes = 3
→ readbacks = 0

R1E ABI fixture
→ ABI ID correct
→ ABI version correct
→ bytes = 80
→ dual texture bindings correct

WIRING-04 live wiring verifier
→ TypeScript surfaces checked
→ semantic/GPU/admission/active-graph manifests checked

WIRING-02 regression
→ cold QMap 5 / QWave 2 / Delta-E 1 / EFC 1
→ effect-only QMap 0 / QWave 0 / Delta-E 0 / EFC 1

WIRING-03 regression
→ guided resample wiring PASS
→ dual-texture policy projection PASS

WIRING-03-R1 regression
→ private QMap 5 / QWave 2 / Delta-E 1 / EFC 1
→ Pipeline writers 0
→ product guide evictions 0

R14D source gates = 352/352 PASS
R14D negative controls = 160/160 detected
R14D expected submissions/fences = 9/9

R14E source gates = 384/384 PASS
R14E negative controls = 176/176 detected
R14E producer submissions/fences = 9/9
```

Honest unverified boundary:

```text
packaged physical WebGPU WIRING-04 loop = NOT EXECUTED
physical multi-device matrix = NOT EXECUTED
full repository tsc = NOT CLAIMED by this overlay-only bake
ICC/non-Rec.709 color path = NOT IMPLEMENTED
```

The old R14D-R1 pre-session QMap canary integration requirement remains obsolete after WIRING-01 removed the boot dependency cycle. It must not be restored merely to make an outdated gate pass.

## 26. Non-goals

```text
ICC profile-aware RGB-to-PCS conversion
Bradford D50 chromatic adaptation
non-Rec.709 product primaries
HDR transfer functions
Delta-E CPU fallback
legacy rgba8 heatmap promotion
Delta-E-driven automatic resample recursion
encoder-local resize
QMap-as-Delta-E substitution
```

## 27. Next boundary

```text
QMAP-LIVE-WIRING-04-R1

ICC Working-Space Canonicalization /
Profile-Aware Linear RGB to PCS /
D50 Chromatic Adaptation /
Profile Digest-Bound Delta-E Authority /
Rec.709 Fast Path and Non-Rec.709 Product Path /
Preview·Export Color-Profile Parity /
No Implicit Primaries Seal
```

## 28. Final seal

```text
The product Delta-E field is a physical rgba16float CIEDE2000 Analysis resource.
It compares one non-QMap Final-EWA with its same-resolution fixed reference lowpass.
It consumes linear Rec.709 premultiplied input without a second sRGB decode.
It safely unpremultiplies only valid covered pixels.
It is threshold-independent and owned by Analysis Field Authority.
It is retained atomically with the exact QMap/QWave generation.
The adaptive guide pins QMap and Delta-E as one source/device generation.
Adaptive Policy R1E binds both textures and writes a physical color gate to Policy.a.
qThreshold and deltaEThreshold remain separate controls with separate semantics.
Neither product nor Export can substitute QMap response for Delta-E.
Requested-size Export uses the same dual-field ABI while keeping Pipeline writers at zero.
```

Anything weaker remains:

```text
DELTAE_THRESHOLD_PRESENT_BUT_COLOR_DIFFERENCE_FIELD_NOT_LIVE
```
