# TDT-ANALYSIS-FIELD-TRUTH-00

## Canonical GPU Analysis Field Authority / Semantic Field Identity / Effective Execution Receipt / Zero CPU Compute·Zero Intermediate Readback / Legacy ABI Migration Seal

- **Patch ID:** `TDT-ANALYSIS-FIELD-TRUTH-00`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R2`
- **Parent ZIP:** `54_TDT_RESAMPLE_RUNTIME_01_R2_WORKGROUP_TILED_EWA_OPTIMIZATION_UNIFORM_BARRIER_BASELINE_PIXEL_PARITY_SOURCE_BAKED_AWAITING_PACKAGED_GPU.zip`
- **Parent ZIP SHA-256:** `89e824847d0c477cffbf7a1f2d807c32f7a41872243d292734f46b01ebe00b5a`
- **Parent source seal:** `f3af1f740a76ebfc6c07293b0287dfceee18f0202f8929ea88365d24dbc17f3b`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R2_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target source state:** `ANALYSIS_FIELD_TRUTH_00_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target verified state:** `ANALYSIS_FIELD_TRUTH_00_VERIFIED_UNPROMOTED`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Primary execution backend:** WebGPU
- **Primary kernel language:** WGSL
- **Product image-analysis compute on CPU:** forbidden
- **Product image-analysis compute on WebGL:** forbidden
- **Canvas pixel-analysis fallback:** forbidden
- **Intermediate pixel readback:** forbidden
- **JavaScript/TypeScript role:** orchestration, ABI packing, resource requests, receipts, error propagation
- **Canonical GPU owner:** existing GPU Device Authority and its current device epoch
- **Canonical field owner:** new Analysis Field Authority
- **Final image owner:** existing Surface Authority
- **Status at specification issue:** `SPEC_DEFINED_UNBAKED`

---

# 0. Executive Contract

`TDT-ANALYSIS-FIELD-TRUTH-00` establishes the semantic and runtime SSOT required to repair and retain every important analysis subsystem already present in the repository:

```text
R1C integrated structure tensor
WebGPU spectral / FFT experiments
CPU FFT compatibility code
Hannakairo directional gate
future Hannakairo topological phase field
analytic Q-wave complex field
visual animated Q-wave
quality LUT and atlas-labelled compatibility code
future persistent GPU tile atlas
R1D adaptation policy
R2 tiled EWA consumer
```

This patch shall not discard those systems merely because their current implementations are incomplete, disconnected, mislabeled, or stubbed.

It shall instead separate their meanings, assign authoritative owners, preserve public compatibility surfaces, and prohibit unverified implementations from making stronger claims than their evidence supports.

The canonical target architecture is:

```text
Canonical Final or Stage Source Surface
        │
        ├─ R1C Tensor producer
        ├─ Spectral FFT producer family
        ├─ Hannakairo producer family
        ├─ Analytic Q-wave producer family
        └─ Additional admitted GPU analysis producers
                    │
                    ▼
          Analysis Field Authority
                    │
          semantic identity + lifecycle
          execution receipts + digests
          device epoch + source revision
                    │
                    ▼
          R1D Analysis Policy Fusion
                    │
                    ▼
               R2 EWA
                    │
                    ▼
       Shared Final Surface Publication
```

`Truth-00` is an authority and migration patch.

It shall not falsely claim that the current FFT, Hannakairo topology solver, Q-wave analytic source, or persistent GPU atlas are already complete.

It shall create the only legal route through which their repaired implementations may later become effective product producers.

The source-baked state requires:

1. a canonical Analysis Field Authority,
2. a frozen semantic registry,
3. a producer and consumer ledger,
4. effective-execution receipts,
5. source-surface and device-epoch binding,
6. GPU-only product policy,
7. explicit compatibility adapters,
8. corrected claim levels for current files,
9. stable errors for prohibited fallback and false claims,
10. predecessor regression closure.

---

# 1. Parent Truth and Re-Audit Baseline

## 1.1 Parent runtime already available

The parent R2 source provides the following stable foundations:

- one GPU Device Authority,
- device lease and device-epoch identity,
- shader and pipeline creation through the GPU bridge,
- Surface Authority and source revision identity,
- R1C integrated structure tensor,
- R1D adaptation policy,
- R2 tiled EWA,
- Preview and Export shared Final Surface consumption,
- Stable Error Code registry,
- Active Graph source inventory,
- receipt and source-seal conventions.

`Truth-00` shall reuse these authorities rather than create a second adapter, device, queue, surface registry, or final-surface publication path.

## 1.2 Current Active Graph presence is not execution proof

The latest parent Active Graph lists these files as `ACTIVE_REQUIRED`:

```text
app/legacy-runtime/ASH_QMAP_PostPatch_kit/js/qmap_fft.js
app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js
app/legacy-runtime/js/passes/qwave_builder_webgpu_compute.js
app/legacy-runtime/qwave/qwave_system.js
```

Their parent source digests are:

```text
qmap_fft.js                         8adb834e974cecb13646931275594203cfb9ef6b500a14373a56f8b22842962b
dk_fft_qmap_webgpu_v2.js           58f169a81b4f80aa9efcfdee483bc5b862956aa4d27c4e3c55fd3bc760545f8b
qwave_builder_webgpu_compute.js     7b5cda2d9a5fcc51d5657da7963b695e70bdc63c2a7616657cc9bf28b1f082b7
qwave_system.js                     8efcca1f52af9e73c505c9584022aec04b55d9e6fc12a796c23b575275a40eca
```

The presence of a file in the Active Graph proves only that the file is admitted to the source graph.

It does not prove:

- that the producer was requested,
- that a GPU dispatch occurred,
- that a fence completed,
- that a field was published,
- that a consumer used the field,
- that no fallback occurred,
- or that the file's comments describe the executed algorithm truthfully.

## 1.3 Current CPU FFT compatibility implementation

`ASH_QMAP_PostPatch_kit/js/qmap_fft.js` contains a real radix-2 CPU FFT, but it also performs product pixel analysis through:

```text
CanvasRenderingContext2D.getImageData
JavaScript Float32Array pixel loops
CPU row and column FFT
CPU tile reconstruction
nearest-neighbour output expansion
```

That path may remain available only as an explicitly labelled development or archival compatibility implementation.

It shall not be invoked by the canonical product analysis path after `Truth-00`.

## 1.4 Current WebGPU FFT implementation

`core/qmap/dk_fft_qmap_webgpu_v2.js` contains non-trivial FFT, transpose, power, reduction, entropy, and tensor code.

However, the re-audit found that the file cannot presently support a canonical effective-execution claim because the current source includes or permits:

- invalid WGSL helper placement inside a compute entry point,
- ambiguous or duplicate butterfly writer ownership,
- per-call and per-window resource recreation,
- intermediate CPU readback and upload,
- resource lifetime gaps,
- no Analysis Field publication identity,
- no execution receipt joining request, dispatch, fence, and consumer,
- and no product-visible proof that the path completed.

The file shall be preserved as a compatibility facade and migration source, not accepted as a verified producer merely because it contains substantial code.

## 1.5 Current Hannakairo shader

`shaders/phase_gate_hannakairo.frag` computes a bounded directional gate of the form:

```text
gradient direction d
wave vector k
phaseTerm = cos(dot(k, d))
Qout = Q × bounded gate
```

This is an orientation-alignment gate.

It is not a demonstrated topological phase solver because it does not compute wrapped circulation, plaquette winding, defect charge, singularity identity, or phase-unwrapping closure.

`Truth-00` shall preserve it under a compatibility semantic ID while reserving a separate semantic ID for a future true Hannakairo axial-defect field.

## 1.6 Current phase helper

`phase/phase_field.js` contains scalar and collection helpers such as:

- phase unwrapping,
- representative phase,
- a clipped phase term,
- tangent-based scalar weighting,
- tensor blending.

These helpers operate in JavaScript and do not constitute a canonical GPU field producer.

They may remain as non-product orchestration or compatibility references, but product pixel-field generation shall move to WGSL producers.

## 1.7 Current analytic Q-wave builder

`js/passes/qwave_builder_webgpu_compute.js` computes a real complex square-root field:

```text
A = local gradient-magnitude compatibility proxy
phi = alpha × A
Z = deltaK + i phi
Q = sqrt(Z)
```

The current source explicitly labels itself as a `beta=0` fast path and excludes Hilbert, percentile, and histogram components.

It is therefore admitted as a useful compatibility analytic field, but it shall not claim spectral phase, Hilbert phase, or Hannakairo topology.

## 1.8 Current visual Q-wave

`qwave/qwave_system.js` creates a time-dependent animated colour overlay using screen coordinates, time, chroma, Kelvin bias, and a sinusoid.

It is a visual effect.

It shall not publish an Analysis Field handle and shall not be consumed by R1D analysis policy unless a future patch explicitly introduces a separate analytic producer.

Its current WebGPU-to-WebGL canvas bridge and CPU readback fallback are outside the canonical GPU-only analysis path.

## 1.9 Current Atlas-labelled implementations

The repository currently uses the word `atlas` for multiple unrelated structures:

1. `gl/atlas/textureAtlas.js`: fixed-grid WebGL texture prototype,
2. `libs/atlas/atlasQmapRuntime.js`: CPU spatial quality LUT and Lab transform,
3. `gl_atlas_cache.js`: full-frame WebGL analysis texture cache,
4. `atlas/build_quality_atlas.js`: empty stub,
5. `atlas/sample_quality_atlas.frag`: literal placeholder,
6. `atlas/lut_atlas_sampler.frag`: literal placeholder,
7. encoder `atlas` metadata: compression statistics,
8. future FFT analysis-window packing,
9. future persistent GPU tile residency.

These structures shall not share one semantic identity.

---

# 2. Goals

`Truth-00` shall:

1. preserve every important algorithm family for repair,
2. create one Analysis Field Authority,
3. create one semantic-field registry,
4. distinguish source presence from effective execution,
5. distinguish visual effects from analysis fields,
6. distinguish directional alignment from topological phase,
7. distinguish tensor axial orientation from complex spectral phase,
8. distinguish analysis-window packing from persistent texture residency,
9. bind every canonical field to source surface and device epoch,
10. prohibit CPU, WebGL, and Canvas pixel-analysis fallback in product mode,
11. preserve existing external function names through adapters,
12. fail closed when a requested canonical producer is not promoted,
13. support independent producer promotion,
14. provide receipts that future FFT, Hannakairo, Q-wave, and Atlas patches can extend,
15. preserve R1A through R2 and Preview/Export behavior when optional analysis fields are disabled.

---

# 3. Non-Goals

`Truth-00` shall not yet claim completion of:

- batched Stockham 2D FFT,
- spectral power/entropy/orientation production,
- spectral complex-phase production,
- Hannakairo winding or defect-charge production,
- Hilbert-transform Q-wave production,
- persistent GPU tile atlas residency,
- page-table packing,
- fence-aware atlas eviction,
- full analysis-policy fusion,
- physical GPU parity for those future producers,
- or performance promotion of those future producers.

Those are follow-up implementation patches.

`Truth-00` does not remove or rewrite R1C Tensor or R2 EWA mathematics.

---

# 4. Normative Terms

## 4.1 Analysis Field

An Analysis Field is a GPU-resident typed resource whose channel semantics, coordinate space, source identity, producer identity, and lifecycle are registered with the Analysis Field Authority.

A raw `GPUTexture`, `GPUBuffer`, WebGL texture, Canvas, ImageData object, or typed array is not an Analysis Field merely because a caller treats it as one.

## 4.2 Producer

A Producer is a registered GPU execution component that transforms a canonical source surface or another admitted Analysis Field into a new Analysis Field.

## 4.3 Consumer

A Consumer is a registered runtime component that acquires an Analysis Field handle, validates its semantic and source identity, pins it for an execution interval, and records consumption.

## 4.4 Effective execution

A producer is effectively executed only when the chain below is complete:

```text
request accepted
→ GPU resources admitted
→ dispatch encoded
→ queue submission recorded
→ completion fence satisfied
→ output field published
→ publication receipt sealed
```

A consumer claim additionally requires:

```text
published field acquired
→ semantic/source/device validation passed
→ field pinned
→ consumer dispatch recorded
→ pin released
```

## 4.5 Product mode

Product mode is the admitted runtime mode used by the canonical Preview/Export pipeline.

Product mode shall not silently enter compatibility computation.

## 4.6 Compatibility mode

Compatibility mode preserves public APIs or explicit diagnostic workflows.

It must declare its backend and claim level and shall not publish a canonical product field unless it satisfies all Authority contracts.

---

# 5. Semantic Field Registry

## 5.1 Registry authority

The registry shall be a versioned, immutable-at-runtime table owned by the Analysis Field Authority.

Recommended source location:

```text
app/src/runtime/analysis/analysis-field-semantic-registry.ts
```

The runtime table shall be generated or imported from a canonical source document, not assembled from ad hoc strings in producers.

## 5.2 Required semantic IDs

The initial registry shall contain at least the following IDs.

### Existing canonical tensor family

```text
tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
tdt.analysis.tensor.axial-order.r1c.v1
tdt.analysis.tensor.curvature.r1c.future.v1
```

### Spectral family

```text
tdt.analysis.spectral.window-complex.v1
tdt.analysis.spectral.power.v1
tdt.analysis.spectral.summary.v1
tdt.analysis.spectral.complex-phase.v1
tdt.analysis.spectral.peak-orientation.v1
```

### Hannakairo family

```text
tdt.analysis.hannakairo.directional-gate.compat.v1
tdt.analysis.hannakairo.axial-order.v1
tdt.analysis.hannakairo.winding-defect.v1
tdt.analysis.hannakairo.phase-coherence.v1
```

### Q-wave family

```text
tdt.analysis.qwave.local-anisotropy-compat.v1
tdt.analysis.qwave.analytic-complex.v1
tdt.analysis.qwave.spectral-phase.v1
tdt.analysis.qwave.hilbert-phase.v1
```

### Policy family

```text
tdt.analysis.policy.adaptive-r1d.v1
tdt.analysis.policy.fused-analysis.v1
```

### Explicit non-analysis visual identity

```text
tdt.visual.qwave.animated-overlay.v1
```

The visual semantic shall be stored in a separate visual registry namespace and shall be rejected by Analysis Field consumers.

## 5.3 Semantic descriptor

Each semantic descriptor shall define:

```typescript
interface AnalysisSemanticDescriptor {
  semanticId: string;
  registryVersion: string;
  domain: 'spatial' | 'spectral' | 'topological' | 'policy';
  periodicity: 'none' | 'two-pi' | 'pi-axial' | 'signed-scalar';
  coordinateSpace: 'source-pixel' | 'stage-pixel' | 'normalized-source' | 'frequency-bin' | 'atlas-local';
  representation: string;
  defaultFormat: string;
  channelSchema: readonly AnalysisChannelDescriptor[];
  validRange: readonly [number, number] | null;
  neutralValue: readonly number[];
  interpolationPolicy: 'nearest' | 'linear' | 'vector-renormalize' | 'forbidden';
  mipPolicy: 'none' | 'producer-defined' | 'authority-generated';
  claimRequirements: readonly string[];
}
```

## 5.4 Channel semantics

Channel meanings shall never be inferred from variable names such as `q`, `phase`, `theta`, `atlas`, `A`, or `G`.

A producer and consumer must bind the same semantic descriptor digest.

## 5.5 Periodicity separation

The registry shall distinguish:

```text
tensor axial orientation: θ ≡ θ + π
complex phase:             φ ≡ φ + 2π
signed defect charge:      scalar with sign
visual wave phase:         time-dependent, non-analysis
```

A `pi-axial` field shall not be consumed as `two-pi` phase without an explicit transformation producer.

## 5.6 Neutral identity

Every optional field shall define an exact neutral value.

Disabling a producer shall not require a CPU-generated replacement field.

The Authority may provide immutable GPU neutral resources by semantic ID and device epoch.

---

# 6. Atlas Taxonomy Registry

The word `atlas` shall be replaced by explicit resource classes.

## 6.1 Analysis Window Batch

```text
Resource class: tdt.analysis.window-batch.v1
Lifetime: one analysis job or one bounded batch
Purpose: FFT or neighbourhood analysis staging
Persistent residency: no
Eviction: not applicable
```

## 6.2 Persistent GPU Tile Atlas

```text
Resource class: tdt.gpu.tile-atlas.persistent.v1
Lifetime: multiple jobs within one device epoch
Purpose: long-lived tiled GPU residency
Required: page table, generation, pin, fence-aware eviction
```

## 6.3 Spatial Quality LUT

```text
Resource class: tdt.analysis.spatial-quality-lut.compat.v1
Current source: atlasQmapRuntime compatibility data
Canonical GPU implementation: future
Persistent tile residency claim: forbidden
```

## 6.4 Full-frame Analysis Texture Cache

```text
Resource class: tdt.analysis.full-frame-cache.compat.v1
Current source: gl_atlas_cache.js
Tile packing claim: forbidden
Content digest requirement: mandatory before any future admission
```

## 6.5 Compression Flatness Metadata

```text
Resource class: tdt.codec.flatness-metadata.v1
GPU atlas claim: forbidden
```

---

# 7. Analysis Field Authority

## 7.1 Service location

Recommended canonical source:

```text
app/src/runtime/analysis/analysis-field-authority-service.ts
```

The service shall be instantiated by Runtime Composition after GPU Authority and Surface Authority and before analysis producers or R1D policy consumers.

## 7.2 Single authority

There shall be exactly one Analysis Field Authority per renderer runtime.

Creating a second authority shall fail with a stable error.

## 7.3 Bridge

The service shall expose a frozen compatibility bridge:

```text
window.__DADUM_ANALYSIS_FIELD_BRIDGE__
```

The bridge shall not expose the raw internal registry maps.

## 7.4 Required API

```typescript
interface AnalysisFieldAuthorityBridge {
  readonly authorityId: string;
  readonly registryVersion: string;

  registerProducer(descriptor: AnalysisProducerDescriptor): AnalysisProducerRegistration;
  registerConsumer(descriptor: AnalysisConsumerDescriptor): AnalysisConsumerRegistration;

  beginBuild(request: AnalysisBuildRequest): AnalysisBuildLease;
  markSubmission(leaseId: string, submission: AnalysisSubmissionRecord): void;
  publishField(leaseId: string, publication: AnalysisFieldPublication): AnalysisFieldHandle;
  failBuild(leaseId: string, error: unknown): void;

  requireField(request: AnalysisFieldRequirement): AnalysisFieldHandle;
  pinField(handle: AnalysisFieldHandle, consumerId: string, purpose: string): AnalysisFieldPin;
  releasePin(pinId: string): void;

  getExecutionReceipt(receiptId: string): AnalysisExecutionReceipt | null;
  getProducerState(producerId: string): AnalysisProducerRuntimeState | null;
  invalidateDeviceEpoch(deviceEpoch: number, reason: string): void;
  disposeField(fieldId: string, generation: number, reason: string): void;
}
```

## 7.5 No raw-device creation

The Authority shall not request an adapter or device.

It shall bind to the existing GPU Authority device identity and epoch.

## 7.6 No Final Surface authority

Analysis fields do not become Final Surfaces.

Surface Authority remains the only owner of source, intermediate image, Preview, and Export surface identity.

Analysis Field Authority stores a source-surface binding but does not publish displayable output.

---

# 8. Producer Registration

## 8.1 Producer descriptor

```typescript
interface AnalysisProducerDescriptor {
  producerId: string;
  producerVersion: string;
  implementationId: string;
  outputSemanticIds: readonly string[];
  acceptedInputSemanticIds: readonly string[];
  acceptedSourceFormats: readonly string[];
  executionBackend: 'webgpu';
  kernelLanguage: 'wgsl';
  productAdmission: 'canonical' | 'compatibility' | 'future';
  sourceFiles: readonly string[];
  shaderAssets: readonly string[];
  publicFacadeIds: readonly string[];
}
```

## 8.2 Producer identity

A producer ID shall identify algorithm ownership, not a source filename.

Examples:

```text
tdt.analysis.producer.tensor.r1c
tdt.analysis.producer.spectral.fft
tdt.analysis.producer.hannakairo.directional-compat
tdt.analysis.producer.hannakairo.topology
tdt.analysis.producer.qwave.local-aniso-compat
tdt.analysis.producer.qwave.analytic
tdt.analysis.producer.policy.fusion
```

## 8.3 Producer states

```text
UNREGISTERED
REGISTERED
SOURCE_ADMITTED
REQUESTED
BUILDING
SUBMITTED
FENCE_COMPLETED
PUBLISHED
CONSUMED
FAILED
INVALIDATED
RETIRED
```

State transitions shall be monotonic per execution lease.

## 8.4 Producer claim level

```text
PRESENT_ONLY
SOURCE_ADMITTED
EFFECTIVE_EXECUTION
PIXEL_VERIFIED
PERFORMANCE_VERIFIED
PACKAGED_VERIFIED
```

A producer may not self-assign a higher claim level.

The Authority derives the maximum claim level from sealed evidence.

---

# 9. Analysis Field Descriptor ABI

## 9.1 Descriptor

```typescript
interface AnalysisFieldDescriptor {
  fieldId: string;
  generation: number;
  semanticId: string;
  semanticDigest: string;
  producerId: string;
  producerVersion: string;
  implementationId: string;

  resourceKind: 'texture-2d' | 'texture-2d-array' | 'storage-buffer';
  format: string;
  width: number;
  height: number;
  layers: number;
  mipLevelCount: number;
  usageMask: number;

  coordinateSpace: string;
  sourceSurfaceId: string;
  sourceRevision: number;
  sourceWidth: number;
  sourceHeight: number;
  stageIndex: number | null;
  stageCount: number | null;

  gpuAuthorityId: string;
  adapterIdentityDigest: string;
  deviceIdentityDigest: string;
  deviceEpoch: number;

  requestDigest: string;
  parameterDigest: string;
  shaderSetDigest: string;
  resourceDescriptorDigest: string;
  executionReceiptId: string;
  executionReceiptDigest: string;

  lifecycleState: 'BUILDING' | 'READY' | 'PINNED' | 'RETIRED' | 'DISPOSED' | 'INVALIDATED';
  claimLevel: string;
  compatibilityMode: boolean;
}
```

## 9.2 GPU resource privacy

The public serializable descriptor shall not contain a GPU resource object.

An opaque runtime handle may reference the resource inside the Authority.

## 9.3 Field handle

```typescript
interface AnalysisFieldHandle {
  authorityId: string;
  fieldId: string;
  generation: number;
  semanticId: string;
  sourceSurfaceId: string;
  sourceRevision: number;
  deviceEpoch: number;
  executionReceiptId: string;
  executionReceiptDigest: string;
}
```

## 9.4 Stale handle rejection

Any mismatch in field generation, source revision, or device epoch shall reject the handle before a consumer creates a bind group.

---

# 10. Source Surface Binding

Every field shall bind to exactly one canonical source tuple:

```text
sourceSurfaceId
sourceRevision
sourceWidth
sourceHeight
sourceFormat
sourceColorDomain
sourceAlphaMode
sourceHiddenRgbPolicy
```

A field derived from a stage-local texture shall additionally bind:

```text
pipelineReceiptId
resampleReceiptId
stageIndex
stageCount
```

No producer may reuse a field solely because dimensions match.

Dimension-only cache keys are forbidden.

---

# 11. Field Lifecycle and Ownership

## 11.1 Lifecycle

```text
ALLOCATED
→ BUILDING
→ READY
→ PINNED zero or more times
→ RETIRED
→ DISPOSED
```

Failure paths:

```text
BUILDING → FAILED → DISPOSED
any live state + device loss → INVALIDATED → DISPOSED
```

## 11.2 Ownership transfer

The producer owns all temporary resources until successful publication.

On publication, the Authority owns the field resource.

Consumers receive pins, not ownership.

## 11.3 Exact disposal

Every temporary and published field resource shall have exactly one terminal disposal event.

Destroying the resource outside the Authority after publication is forbidden.

## 11.4 Pinning

A field may not be evicted or disposed while any consumer pin is live.

## 11.5 Peak residency

The Authority shall expose deterministic counters:

```text
liveFieldCount
liveFieldBytes
pinnedFieldCount
retiredFieldCount
disposedFieldCount
invalidatedFieldCount
peakLiveFieldBytes
```

These counters are resource-accounting evidence, not vendor occupancy evidence.

---

# 12. Effective Execution Receipt

## 12.1 Canonical receipt

```typescript
interface AnalysisExecutionReceipt {
  receiptVersion: 'tdt.analysis.execution-receipt.v1';
  receiptId: string;
  receiptDigest: string;
  jobId: string;
  producerId: string;
  producerVersion: string;
  implementationId: string;
  semanticIds: readonly string[];

  sourceTuple: AnalysisSourceTuple;
  deviceTuple: AnalysisDeviceTuple;

  requestDigest: string;
  parameterDigest: string;
  shaderDigests: readonly string[];
  pipelineIdentityDigests: readonly string[];
  resourceDescriptorDigest: string;

  dispatches: readonly AnalysisDispatchReceipt[];
  submissionSerials: readonly number[];
  completionFenceSerial: number;

  outputFieldHandles: readonly AnalysisFieldHandle[];
  outputDescriptorDigests: readonly string[];

  cpuPixelComputeUsed: false;
  webglPixelComputeUsed: false;
  canvasPixelComputeUsed: false;
  intermediatePixelReadbackCount: 0;
  fallbackEvents: readonly [];

  claimLevel: string;
  effectiveExecution: boolean;
}
```

## 12.2 Canonical digest excludes wall clock

Wall-clock timestamps, performance clocks, random UUIDs, and object addresses shall not participate in the canonical receipt digest.

Deterministic sequence IDs may be used.

## 12.3 Dispatch receipt

A dispatch receipt shall record:

```text
pipeline identity
entry point
workgroup counts
input semantic handles
output resource descriptors
uniform ABI identity
stage index
submission serial
```

It shall not claim pixel correctness unless joined to a dedicated verifier receipt.

## 12.4 Effective execution flag

`effectiveExecution` shall be `true` only after the completion fence and successful publication.

Importing a file or creating a pipeline is insufficient.

---

# 13. Consumer Ledger

Each consumer shall register:

```typescript
interface AnalysisConsumerDescriptor {
  consumerId: string;
  acceptedSemanticIds: readonly string[];
  acceptedClaimLevels: readonly string[];
  sourceBindingPolicy: 'exact-source-revision' | 'exact-stage' | 'normalized-source';
  optional: boolean;
}
```

Initial consumers include:

```text
tdt.analysis.consumer.adaptive-policy-r1d
tdt.analysis.consumer.resample-r2
tdt.analysis.consumer.preview-diagnostics
tdt.analysis.consumer.export-diagnostics
```

Preview and Export product pixels shall continue to consume the Final Surface, not raw analysis fields.

Analysis fields may influence upstream policy only through registered consumers.

---

# 14. GPU-Only Product Policy

## 14.1 Forbidden product operations

The canonical product analysis path shall reject:

```text
CanvasRenderingContext2D.getImageData
CanvasRenderingContext2D.putImageData
WebGL readPixels
CPU per-pixel typed-array transforms
CPU FFT or DFT
CPU phase unwrap over image fields
CPU winding or defect calculation
CPU Atlas packing
CPU overlap-add reconstruction
GPU texture → full pixel readback → CPU transform → GPU upload
WebGPU canvas → WebGL texture bridge for analysis
silent WebGL compute fallback
silent Canvas fallback
silent source-surface substitution
```

## 14.2 Permitted host work

JavaScript and TypeScript may perform:

- integer dispatch planning,
- bounds and capability checks,
- ABI packing,
- descriptor construction,
- digesting source text and serialized descriptors,
- Worker RPC,
- lifecycle bookkeeping,
- receipt assembly,
- stable error propagation.

Host code may not inspect or transform image pixels in the canonical product path.

## 14.3 Verification scalar readback

A physical verification tool may read back a bounded scalar or small fixed summary buffer produced by a GPU comparator.

It shall not read back full image fields for product execution.

The receipt shall mark verification readback separately from product readback.

## 14.4 No fallback success

If the canonical producer is unavailable, the request fails.

The system shall not return a neutral field and claim that analysis succeeded.

Optional consumers may explicitly proceed without the field only when their neutral-identity contract permits it and the final receipt records `fieldStatus: unavailable-not-consumed`.

---

# 15. GPU Authority Integration

Every canonical producer shall:

1. acquire the declared GPU consumer lease,
2. use the lease device and queue,
3. create shaders and pipelines through the GPU Authority bridge,
4. include the device epoch in every field descriptor,
5. reject stale pipeline or field epochs,
6. register loss cleanup,
7. avoid direct `navigator.gpu.requestAdapter()` and `requestDevice()`.

Recommended consumer IDs:

```text
dadum.gpu.consumer.analysis-field-authority
dadum.gpu.consumer.spectral-analysis
dadum.gpu.consumer.hannakairo-analysis
dadum.gpu.consumer.qwave-analysis
dadum.gpu.consumer.analysis-atlas
```

Existing compatibility consumer IDs may be mapped but not silently reused for a different semantic family.

---

# 16. Active Graph and Runtime Claim Separation

## 16.1 Source status

Active Graph continues to classify source reachability.

## 16.2 Runtime execution status

Analysis Field Authority shall maintain a separate effective-execution ledger.

## 16.3 Combined claim

A product claim requires both:

```text
source node admitted
AND
runtime execution receipt published
```

## 16.4 Generated report

A generated report shall list, per producer:

```text
source status
registration status
request count
submission count
publication count
consumption count
failure count
current claim level
last sealed receipt digest
```

No counter may be inferred from console text.

---

# 17. Current Implementation Reclassification

`Truth-00` shall generate a current-state classification manifest.

## 17.1 CPU FFT

```text
File: ASH_QMAP_PostPatch_kit/js/qmap_fft.js
Classification: COMPATIBILITY_CPU_REFERENCE
Product admission: forbidden
Future role: diagnostic algorithm reference only
Public facade preservation: permitted through GPU adapter
```

## 17.2 WebGPU FFT prototype

```text
File: core/qmap/dk_fft_qmap_webgpu_v2.js
Classification: GPU_PROTOTYPE_UNVERIFIED
Product field publication: forbidden until Spectral-QMap patches
Facade preservation: required
```

## 17.3 FFT builder stub

```text
File: js/modules/qmapFFTBuilder.js
Classification: STUB_COMPAT_FACADE
Null texture success: forbidden
Future route: Analysis Field bridge adapter
```

## 17.4 FFT peak Worker

```text
File: workers/fft_peak_worker.js
Classification: STUB_WORKER
Future route: renderer-owned GPU broker
Worker GPU device ownership: forbidden
```

## 17.5 Hannakairo gate

```text
File: shaders/phase_gate_hannakairo.frag
Classification: DIRECTIONAL_GATE_COMPATIBILITY_SHADER
Topological claim: forbidden
Future route: WGSL compatibility producer
```

## 17.6 Phase helper

```text
File: phase/phase_field.js
Classification: CPU_SCALAR_COMPATIBILITY_HELPER
Product pixel-field compute: forbidden
```

## 17.7 Q-wave analytic compatibility producer

```text
File: js/passes/qwave_builder_webgpu_compute.js
Classification: GPU_EFFECTIVE_COMPATIBILITY_PRODUCER
Semantic: tdt.analysis.qwave.local-anisotropy-compat.v1
Spectral/Hilbert/topological claim: forbidden
```

## 17.8 Q-wave visual system

```text
File: qwave/qwave_system.js
Classification: VISUAL_EFFECT_ONLY
Analysis publication: forbidden
Product analysis fallback: forbidden
```

## 17.9 TextureAtlas prototype

```text
File: gl/atlas/textureAtlas.js
Classification: LEGACY_WEBGL_FIXED_GRID_PROTOTYPE
Persistent GPU Atlas claim: forbidden
```

## 17.10 Atlas Q-map runtime

```text
File: libs/atlas/atlasQmapRuntime.js
Classification: CPU_SPATIAL_QUALITY_LUT_COMPATIBILITY
Product pixel compute: forbidden
```

## 17.11 Full-frame cache

```text
File: gl_atlas_cache.js
Classification: LEGACY_WEBGL_FULL_FRAME_CACHE
Tile Atlas claim: forbidden
Dimension-only cache reuse: forbidden in any future admission
```

## 17.12 Literal Atlas stubs

```text
atlas/build_quality_atlas.js
atlas/sample_quality_atlas.frag
atlas/lut_atlas_sampler.frag
```

shall be classified as literal stubs and shall never be interpreted as product features.

---

# 18. Legacy ABI Preservation and Migration

## 18.1 General rule

Existing public names and import paths shall remain resolvable when practical.

Their implementation may become an adapter to the Analysis Field Authority.

## 18.2 No fake success

Compatibility facades shall not return:

```text
null texture with success stats
zero-filled field with success status
placeholder shader output
identity output labelled as computed analysis
```

## 18.3 FFT facade

Existing FFT facade calls shall normalize to a future request shape:

```typescript
interface SpectralAnalysisRequest {
  sourceSurface: AnalysisSourceSurfaceRef;
  windowProfileId: string;
  outputSemanticIds: readonly string[];
  jobId: string;
  cancellationEpoch: number;
  compatibilityCallerId: string | null;
}
```

Until the spectral producer is promoted, product mode shall fail with:

```text
E_ANALYSIS_PRODUCER_NOT_PROMOTED
```

It shall not call the CPU FFT.

## 18.4 Hannakairo facade

The existing directional gate may be exposed as a compatibility producer only after a WGSL implementation and semantic descriptor exist.

Requests for winding or defect fields shall route only to the future topology producer.

## 18.5 Q-wave facade

The existing `ensureQWaveRGWGPU` style facade may continue to return its current texture-compatible object while also attaching an Analysis Field handle for the compatibility semantic.

It shall not label the field as spectral or Hilbert phase.

## 18.6 Visual Q-wave

Visual Q-wave APIs remain visual APIs.

Analysis consumers shall reject their resources even if dimensions and formats match.

## 18.7 Atlas facade

Legacy Atlas constructors may remain importable but shall carry compatibility classification.

Persistent Atlas claims require the future Atlas Authority patch.

---

# 19. Worker Migration Contract

Workers may plan, request, cancel, and receive Analysis Field handles.

Workers shall not create adapters, devices, or WebGL contexts for canonical analysis.

Recommended flow:

```text
legacy caller
→ Worker request adapter
→ renderer MessagePort broker
→ Analysis Field Authority
→ registered GPU producer
→ field handle / explicit error
```

Worker responses shall not transfer raw GPU objects.

A serializable field handle and receipt digest are sufficient.

---

# 20. Runtime Asset Closure

Every canonical WGSL asset shall be present in the Runtime Asset Manifest with:

```text
asset route
source-relative path
SHA-256
producer ID
semantic outputs
entry point
uniform ABI identity
```

Embedded WGSL strings shall either:

1. be extracted into canonical asset files, or
2. be independently digested and included in a generated embedded-shader manifest.

A producer may not publish a field when its executed shader digest is absent from its receipt.

---

# 21. Determinism

## 21.1 Deterministic identities

The following shall be deterministic for identical input and runtime profile:

- request digest,
- semantic descriptor digest,
- parameter digest,
- shader set digest,
- resource descriptor digest,
- field ID sequence,
- field generation,
- execution receipt digest.

## 21.2 Forbidden identity inputs

Canonical identity shall not depend on:

- wall-clock time,
- `performance.now()`,
- random values,
- object addresses,
- User-Agent,
- GPU vendor strings except through the sealed device identity,
- console ordering.

## 21.3 Content digest boundary

A source surface content digest may be used only when produced by an existing canonical receipt.

The Authority shall not trigger a full CPU pixel readback to compute a digest.

---

# 22. Cache Identity

Analysis field reuse shall require an exact key containing at least:

```text
semantic ID and digest
producer implementation ID
source surface ID and revision
source format and dimensions
stage identity
parameter digest
shader set digest
device identity digest
device epoch
```

Dimension-only keys are forbidden.

A cache hit shall still produce a consumption receipt linked to the original publication receipt.

---

# 23. Device Loss and Epoch Recovery

On device loss:

1. all BUILDING leases fail,
2. all submitted but incomplete receipts remain non-effective,
3. all live fields from the lost epoch become INVALIDATED,
4. all pins are force-released with invalidation reason,
5. all producer pipeline caches for the epoch are discarded,
6. all future handles from that epoch are rejected,
7. no old field is rebound to a new device,
8. neutral resources are recreated under the new epoch,
9. consumers must request fields again.

Device-loss recovery shall not enter CPU compatibility compute.

---

# 24. Cancellation and Supersession

Every build request shall carry:

```text
jobId
sourceRevision
cancellationEpoch
producerRequestSequence
```

A superseded request shall not publish even if its GPU work completes later.

Its temporary resources shall be disposed after the completion fence.

A superseded receipt shall record `effectiveExecution: false` and `terminalState: SUPERSEDED`.

---

# 25. Error Taxonomy

The following stable errors shall be added or reserved:

```text
E_ANALYSIS_AUTHORITY_COLLISION
E_ANALYSIS_AUTHORITY_UNAVAILABLE
E_ANALYSIS_SEMANTIC_UNKNOWN
E_ANALYSIS_SEMANTIC_MISMATCH
E_ANALYSIS_PERIODICITY_MISMATCH
E_ANALYSIS_PRODUCER_UNKNOWN
E_ANALYSIS_PRODUCER_NOT_PROMOTED
E_ANALYSIS_PRODUCER_ALREADY_REGISTERED
E_ANALYSIS_CONSUMER_UNKNOWN
E_ANALYSIS_FIELD_NOT_FOUND
E_ANALYSIS_FIELD_NOT_READY
E_ANALYSIS_FIELD_STALE_GENERATION
E_ANALYSIS_FIELD_STALE_SOURCE_REVISION
E_ANALYSIS_FIELD_STALE_DEVICE_EPOCH
E_ANALYSIS_FIELD_ALREADY_DISPOSED
E_ANALYSIS_FIELD_PIN_REQUIRED
E_ANALYSIS_FIELD_PIN_LEAK
E_ANALYSIS_PUBLICATION_WITHOUT_SUBMISSION
E_ANALYSIS_PUBLICATION_WITHOUT_FENCE
E_ANALYSIS_RECEIPT_DIGEST_MISMATCH
E_ANALYSIS_CPU_PIXEL_COMPUTE_FORBIDDEN
E_ANALYSIS_WEBGL_COMPUTE_FORBIDDEN
E_ANALYSIS_CANVAS_COMPUTE_FORBIDDEN
E_ANALYSIS_INTERMEDIATE_READBACK_FORBIDDEN
E_ANALYSIS_SILENT_FALLBACK_FORBIDDEN
E_ANALYSIS_VISUAL_RESOURCE_NOT_FIELD
E_ANALYSIS_TOPOLOGY_CLAIM_UNPROVEN
E_ANALYSIS_SPECTRAL_CLAIM_UNPROVEN
E_ANALYSIS_ATLAS_CLASS_AMBIGUOUS
E_ANALYSIS_CACHE_IDENTITY_INCOMPLETE
E_ANALYSIS_DEVICE_LOST
E_ANALYSIS_REQUEST_SUPERSEDED
```

Errors shall preserve cause and producer ID without exposing raw GPU object data.

---

# 26. Source Layout

The bake should introduce or reserve:

```text
app/src/runtime/analysis/
  analysis-field-authority-service.ts
  analysis-field-semantic-registry.ts
  analysis-field-types.ts
  analysis-field-receipt.ts
  analysis-field-execution-ledger-service.ts
  analysis-field-neutral-resource-service.ts
  analysis-field-compatibility-bridge.ts
  analysis-field-errors.ts

app/legacy-runtime/core/analysis/
  analysis_field_bridge.mjs
  analysis_field_request_normalizer.mjs
  analysis_field_receipt_compat.mjs

app/src/runtime/analysis/generated/
  generated-analysis-semantic-registry.json
  generated-analysis-producer-inventory.json
  generated-analysis-compatibility-classification.json
```

Tooling:

```text
tools/analysis-field-truth-00/
  audit-current-implementations.mjs
  generate-semantic-registry.mjs
  verify-source-contract.mjs
  verify-no-cpu-product-compute.mjs
  verify-claim-truth.mjs
  runtime-smoke.mjs
  gate.mjs
  finalize.mjs
```

---

# 27. Source Audit Rules

The source audit shall detect at least:

- direct adapter/device requests in analysis producers,
- product use of `getImageData`, `readPixels`, or pixel `mapAsync`,
- product calls into CPU FFT,
- product CPU per-pixel loops in registered producers,
- product WebGL or Canvas fallback,
- literal stub returns,
- `null` or zero-filled success payloads,
- ambiguous semantic strings,
- unregistered channel schemas,
- analysis publication without source binding,
- dimension-only caches,
- visual resources passed to analysis consumers,
- producer files in Active Graph without a claim classification,
- claim levels higher than evidence permits.

The audit shall support explicit compatibility allowlists by exact file, exact symbol, and exact non-product mode.

Broad directory allowlists are forbidden.

---

# 28. Mock Runtime Requirements

The mock runtime shall demonstrate:

1. Authority singleton enforcement,
2. semantic registration,
3. producer registration,
4. source tuple binding,
5. begin-build to publish transition,
6. publish-before-fence rejection,
7. exact handle generation,
8. pin and release,
9. stale generation rejection,
10. stale source revision rejection,
11. stale device epoch rejection,
12. device-loss invalidation,
13. superseded request rejection,
14. visual resource rejection,
15. missing producer fail-closed,
16. optional neutral field handling,
17. no fallback receipt truth,
18. deterministic receipt digest,
19. exact disposal accounting,
20. compatibility facade preservation.

The mock shall not claim physical GPU execution.

---

# 29. Physical GPU Verification Boundary

The verified-unpromoted state shall eventually require:

- actual WGSL compilation for each promoted producer,
- same-device field publication,
- no validation errors,
- no intermediate pixel readback,
- GPU comparator results for producer-specific fixtures,
- device-loss cancellation,
- memory plateau,
- packaged Preview/Export continuity,
- independent source-seal reproduction.

`Truth-00` may defer producer-specific pixel parity because the producer algorithms are implemented in follow-up patches.

It may not defer authority, semantic, lifecycle, fallback, or claim-truth source requirements.

---

# 30. Regression Contract

The bake shall preserve:

```text
TDT-RESAMPLE-RUNTIME-01-R1A
TDT-RESAMPLE-RUNTIME-01-R1B
TDT-RESAMPLE-RUNTIME-01-R1C
TDT-RESAMPLE-RUNTIME-01-R1D
TDT-RESAMPLE-RUNTIME-01-R2
TDT-ACTIVE-GRAPH-01
TDT-GPU-DEVICE-SSOT-01
TDT-SURFACE-LIFECYCLE-01
TDT-PREVIEW-PRESENTER-01
TDT-EXPORT-WORKER-01 through 07
TDT-EXPORT-PROMOTION-01 through 03
TDT-BUILD-LOCK-01
TDT-BUILD-EMIT-01
MODJPEG, Native Decoder, JXL, PSD
Stable Error Registry
TypeScript syntax
```

Optional analysis fields disabled shall preserve the current R2 product result and shared Final Surface tuple.

---

# 31. Follow-Up Producer Sequence

The intended implementation sequence after `Truth-00` is:

```text
TDT-SPECTRAL-QMAP-01
GPU Window Planner / Hann Extraction / Boundary Coverage / Complex Window Batch Seal

TDT-SPECTRAL-QMAP-02
Batched Stockham 2D WebGPU FFT / Single-Writer Butterfly / Transpose / Zero Intermediate Readback Seal

TDT-SPECTRAL-QMAP-03
Power·Entropy·Peak Orientation·Complex Phase Reduction / Spectral Field Publication Seal

TDT-HANNAKAIRO-PHASE-01
Axial Double-Angle Field / Wrapped Circulation / Winding·Defect GPU Truth Seal

TDT-HANNAKAIRO-GATE-02
Directional Gate Repair / Tensor·Spectral Alignment / Neutral Identity Seal

TDT-QWAVE-PHASE-03
Analytic Q-wave Complex Field / Source-selectable Imaginary Component / Visual Wave Separation Seal

TDT-GPU-TILE-ATLAS-01
Analysis Window Batch / Persistent Tile Atlas Authority / Page Table·Generation·Fence-aware Residency Seal

TDT-ADAPTIVE-ANALYSIS-FUSION-01
Tensor·Spectral·Hannakairo·Q-wave Policy Fusion / R2 Optional Identity Seal
```

Each producer patch shall extend the same Authority rather than introduce its own registry or lifecycle system.

---

# 32. Acceptance States

## 32.1 Source-baked

`ANALYSIS_FIELD_TRUTH_00_SOURCE_BAKED_AWAITING_PACKAGED_GPU` requires:

```text
Authority source contract PASS
Semantic registry PASS
Current implementation classification PASS
GPU-only product audit PASS
Legacy ABI adapter audit PASS
Mock lifecycle PASS
Claim-truth audit PASS
Predecessor regressions PASS
Production Pointer unchanged
Independent ZIP source seal reproduced
```

## 32.2 Verified-unpromoted

`ANALYSIS_FIELD_TRUTH_00_VERIFIED_UNPROMOTED` additionally requires:

```text
Packaged Authority boot PASS
Physical device-loss lifecycle PASS
Physical field pin/disposal plateau PASS
Promoted producer execution receipts PASS
Preview/Export shared-surface continuity PASS
No product CPU/WebGL/Canvas analysis fallback observed
```

---

# 33. Bake Artifacts

The bake shall emit:

```text
README_TDT_ANALYSIS_FIELD_TRUTH_00_APPLIED.md
specs/TDT-ANALYSIS-FIELD-TRUTH-00_..._SPEC.md
patches/TDT_ANALYSIS_FIELD_TRUTH_00_....diff
patches/TDT_ANALYSIS_FIELD_TRUTH_00_CHANGED_FILE_MANIFEST.json
artifacts/analysis-field-truth-00/source-bake/TDT_ANALYSIS_FIELD_TRUTH_00_SOURCE_RECEIPT.json
artifacts/analysis-field-truth-00/source-bake/TDT_ANALYSIS_FIELD_TRUTH_00_REGRESSION_SUMMARY.json
artifacts/analysis-field-truth-00/source-bake/TDT_ANALYSIS_FIELD_TRUTH_00_IMPLEMENTATION_CLASSIFICATION.json
artifacts/analysis-field-truth-00/source-bake/TDT_ANALYSIS_FIELD_TRUTH_00_SEMANTIC_REGISTRY.json
```

---
# 34. Normative Gates

## AFT00-001

**Requirement:** Parent ZIP SHA-256 and parent source seal match the declared R2 baseline.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-002

**Requirement:** Production Pointer is not modified.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-003

**Requirement:** R1C Tensor and R2 EWA public contracts remain unchanged.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-004

**Requirement:** GPU Device Authority remains the only adapter/device owner.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-005

**Requirement:** Surface Authority remains the only image-surface owner.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-006

**Requirement:** All FFT, Hannakairo, Q-wave, and Atlas-labelled files receive an explicit implementation classification.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-007

**Requirement:** Active Graph source presence is not treated as effective execution evidence.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-008

**Requirement:** Current Active Graph nodes for CPU FFT, WebGPU FFT, analytic Q-wave, and visual Q-wave are inventoried by digest.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-009

**Requirement:** Literal placeholder files are identified and cannot satisfy product feature gates.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-010

**Requirement:** Current CPU pixel-analysis entry points are enumerated.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-011

**Requirement:** Current WebGL and Canvas analysis bridges are enumerated.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-012

**Requirement:** Current producer/consumer call sites are enumerated without inventing missing callers.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-013

**Requirement:** A versioned semantic registry exists as SSOT.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-014

**Requirement:** Every semantic ID is globally unique.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-015

**Requirement:** Every semantic descriptor has a canonical digest.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-016

**Requirement:** Channel meanings are explicit and ordered.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-017

**Requirement:** Coordinate space is explicit.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-018

**Requirement:** Periodicity is explicit.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-019

**Requirement:** Neutral value is explicit.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-020

**Requirement:** Interpolation policy is explicit.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-021

**Requirement:** Mip policy is explicit.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-022

**Requirement:** Tensor tangent/coherence/edge semantic is registered.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-023

**Requirement:** Spectral summary semantic is registered.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-024

**Requirement:** Spectral complex-phase semantic is registered.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-025

**Requirement:** Hannakairo directional compatibility semantic is registered.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-026

**Requirement:** Hannakairo winding/defect semantic is reserved separately.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-027

**Requirement:** Q-wave local-anisotropy compatibility semantic is registered.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-028

**Requirement:** Q-wave analytic, spectral, and Hilbert phase semantics are distinct.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-029

**Requirement:** Visual Q-wave identity is outside the Analysis Field namespace.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-030

**Requirement:** Atlas resource classes are split into window batch, persistent tile atlas, spatial LUT, full-frame cache, and codec metadata.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-031

**Requirement:** Exactly one Analysis Field Authority is instantiated.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-032

**Requirement:** Authority boot occurs after GPU and Surface authorities.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-033

**Requirement:** Authority bridge is frozen and collision-protected.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-034

**Requirement:** Producer registration uses stable producer IDs.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-035

**Requirement:** Consumer registration uses accepted semantic IDs.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-036

**Requirement:** Unknown producers are rejected.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-037

**Requirement:** Unknown consumers are rejected.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-038

**Requirement:** Unknown semantics are rejected.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-039

**Requirement:** Field descriptors bind source surface ID and revision.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-040

**Requirement:** Field descriptors bind device identity and epoch.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-041

**Requirement:** Field descriptors bind producer implementation identity.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-042

**Requirement:** Field descriptors bind shader and parameter digests.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-043

**Requirement:** Public field handles are serializable and contain no raw GPU object.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-044

**Requirement:** Field generations increase deterministically.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-045

**Requirement:** Stale generations are rejected before bind-group creation.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-046

**Requirement:** Stale source revisions are rejected.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-047

**Requirement:** Stale device epochs are rejected.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-048

**Requirement:** Producer owns temporaries until publication.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-049

**Requirement:** Authority owns resources after publication.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-050

**Requirement:** Consumers receive pins rather than ownership.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-051

**Requirement:** Pinned fields cannot be disposed or evicted.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-052

**Requirement:** Every field has exactly one terminal disposal event.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-053

**Requirement:** Device loss invalidates all fields from the lost epoch.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-054

**Requirement:** Superseded jobs cannot publish fields.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-055

**Requirement:** Begin-build returns a unique deterministic execution lease.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-056

**Requirement:** Publication before a recorded queue submission is rejected.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-057

**Requirement:** Publication before a completion fence is rejected.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-058

**Requirement:** Effective execution is false until fence completion and publication.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-059

**Requirement:** Execution receipt includes source tuple.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-060

**Requirement:** Execution receipt includes device tuple.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-061

**Requirement:** Execution receipt includes semantic outputs.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-062

**Requirement:** Execution receipt includes shader and pipeline identities.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-063

**Requirement:** Execution receipt includes dispatch geometry.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-064

**Requirement:** Execution receipt includes output field handles.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-065

**Requirement:** Execution receipt reports CPU pixel compute usage explicitly.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-066

**Requirement:** Execution receipt reports WebGL pixel compute usage explicitly.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-067

**Requirement:** Execution receipt reports Canvas pixel compute usage explicitly.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-068

**Requirement:** Execution receipt reports intermediate pixel readback count.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-069

**Requirement:** Canonical product receipt requires all forbidden-use fields to be zero or false.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-070

**Requirement:** Canonical receipt digest excludes wall clock and randomness.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-071

**Requirement:** Cache-hit consumption links to the original publication receipt.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-072

**Requirement:** Consumer pin/release events are recorded in a ledger.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-073

**Requirement:** Canonical product producers do not call Canvas getImageData or putImageData.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-074

**Requirement:** Canonical product producers do not call WebGL readPixels.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-075

**Requirement:** Canonical product producers do not execute CPU FFT/DFT.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-076

**Requirement:** Canonical product producers do not perform CPU per-pixel field transforms.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-077

**Requirement:** Canonical product producers do not perform CPU overlap-add reconstruction.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-078

**Requirement:** Canonical product producers do not perform CPU phase unwrap over image fields.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-079

**Requirement:** Canonical product producers do not perform CPU winding/defect calculation.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-080

**Requirement:** Canonical product producers do not perform CPU Atlas packing.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-081

**Requirement:** Canonical product producers do not use WebGPU-canvas-to-WebGL as an analysis transport.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-082

**Requirement:** Canonical product producers do not use intermediate full-pixel readback.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-083

**Requirement:** No unavailable producer silently falls back to CPU.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-084

**Requirement:** No unavailable producer silently falls back to WebGL.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-085

**Requirement:** No unavailable producer silently falls back to Canvas.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-086

**Requirement:** No unavailable producer returns zero-filled or null success output.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-087

**Requirement:** Optional missing fields use explicit not-consumed neutral policy rather than fake execution.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-088

**Requirement:** Verification-only scalar readback is separated from product readback.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-089

**Requirement:** CPU FFT is classified as compatibility reference and product-forbidden.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-090

**Requirement:** WebGPU FFT prototype is preserved but cannot publish canonical fields before promotion.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-091

**Requirement:** FFT public facades normalize to Analysis Field requests.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-092

**Requirement:** FFT missing canonical producer fails with E_ANALYSIS_PRODUCER_NOT_PROMOTED.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-093

**Requirement:** FFT peak Worker becomes or is reserved as renderer broker rather than compute owner.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-094

**Requirement:** FFT builder cannot return null texture with success stats.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-095

**Requirement:** Hannakairo directional gate is not labelled as topology.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-096

**Requirement:** Hannakairo topology semantic cannot be published by the compatibility gate.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-097

**Requirement:** JavaScript phase helper is excluded from product pixel-field generation.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-098

**Requirement:** Analytic Q-wave compatibility builder publishes only local-anisotropy-compat semantic.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-099

**Requirement:** Analytic Q-wave compatibility builder cannot claim spectral or Hilbert phase.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-100

**Requirement:** Visual Q-wave cannot publish an Analysis Field.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-101

**Requirement:** Visual Q-wave CPU readback fallback is excluded from product analysis.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-102

**Requirement:** Legacy TextureAtlas is classified as WebGL prototype.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-103

**Requirement:** AtlasQmapRuntime is classified as CPU spatial LUT compatibility.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-104

**Requirement:** gl_atlas_cache is classified as full-frame cache and dimension-only reuse is not canonical.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-105

**Requirement:** Quality Atlas literal stubs cannot be admitted.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-106

**Requirement:** Legacy public import paths remain resolvable through explicit adapters where required.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-107

**Requirement:** Runtime Asset Manifest records every canonical analysis WGSL digest.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-108

**Requirement:** Embedded WGSL is covered by an embedded shader manifest or extracted asset.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-109

**Requirement:** Source audit supports exact compatibility allowlists only.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-110

**Requirement:** Mock runtime proves Authority singleton behavior.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-111

**Requirement:** Mock runtime proves publish-before-fence rejection.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-112

**Requirement:** Mock runtime proves pin, release, and exact disposal.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-113

**Requirement:** Mock runtime proves stale generation/source/device rejection.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-114

**Requirement:** Mock runtime proves device-loss invalidation.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-115

**Requirement:** Mock runtime proves deterministic receipt digest.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-116

**Requirement:** Stable Error Registry includes the Analysis Field error taxonomy.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-117

**Requirement:** Packaged Electron boots exactly one Analysis Field Authority.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** physical WebGPU or packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## AFT00-118

**Requirement:** Physical GPU promoted producer publishes a same-device field.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** physical WebGPU or packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## AFT00-119

**Requirement:** Physical GPU validation reports no WebGPU validation errors.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** physical WebGPU or packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## AFT00-120

**Requirement:** Physical device loss invalidates and recreates analysis resources without CPU fallback.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** physical WebGPU or packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## AFT00-121

**Requirement:** Physical repeated execution reaches a bounded memory plateau.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** physical WebGPU or packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## AFT00-122

**Requirement:** Packaged Preview and Export retain the same Final Surface tuple when optional fields are disabled.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** physical WebGPU or packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## AFT00-123

**Requirement:** Packaged execution observes zero product intermediate pixel readbacks.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** physical WebGPU or packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## AFT00-124

**Requirement:** Physical producer-specific pixel and performance claims remain deferred until follow-up evidence exists.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** physical WebGPU or packaged Electron evidence.

**Failure policy:** defer only when physical or packaged evidence is unavailable; otherwise fail closed.

## AFT00-125

**Requirement:** R1A through R2, Active Graph, GPU, Surface, Preview, Export, Build, and codec regressions remain passing.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-126

**Requirement:** Optional analysis fields disabled preserve current R2 pixel identity and shared Final Surface tuple.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-127

**Requirement:** Independent final ZIP extraction reproduces the Truth-00 source seal.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

## AFT00-128

**Requirement:** Production promotion remains forbidden until verified-unpromoted evidence exists.

**Source evidence:** source scanner or generated canonical manifest.

**Runtime evidence:** source or mock runtime evidence.

**Failure policy:** fail closed.

---

# 35. Gate Classification

## 35.1 Source mandatory

`AFT00-001` through `AFT00-116` and `AFT00-125` through `AFT00-128` are mandatory for the source-baked state, except that any clause explicitly requiring physical execution is represented structurally and remains deferred.

## 35.2 Physical and packaged mandatory

`AFT00-117` through `AFT00-124` require physical WebGPU or Windows x64 Packaged Electron evidence.

They shall remain `DEFERRED`, not `PASS`, in a source-only environment.

## 35.3 No blanket defer

Authority, semantic identity, lifecycle, fallback prohibition, compatibility classification, and claim-truth gates may not be deferred merely because a physical GPU is unavailable.

---

# 36. Source-Bake Acceptance Summary

The source bake is acceptable only when:

```text
Source gate FAIL: 0
Mock runtime FAIL: 0
Claim-truth mismatches: 0
Canonical CPU pixel-compute paths: 0
Canonical WebGL pixel-compute paths: 0
Canonical Canvas pixel-compute paths: 0
Silent analysis fallbacks: 0
Unknown semantic publications: 0
Stale field acceptance: 0
Pin/disposal mismatches: 0
Predecessor regression failures: 0
Production Pointer mutation: false
Independent ZIP source-seal reproduction: exact
```

---

# 37. Final Seal Statement

`TDT-ANALYSIS-FIELD-TRUTH-00` is complete only when FFT, Hannakairo, Q-wave, Tensor, policy, and Atlas-labelled systems no longer rely on ambiguous names or source presence as proof of execution.

The patch shall preserve them for repair, but it shall not allow them to overstate what they currently do.

A canonical Analysis Field exists only when its semantic identity is registered, its GPU producer is admitted, its source and device identities are exact, its queue work completes, its output is published, its lifecycle is owned, and its receipt proves that no prohibited CPU, WebGL, Canvas, or readback fallback replaced the requested computation.

Code presence is not execution.

A texture is not a field without semantics.

A phase is not a topology without periodicity and circulation truth.

An atlas is not residency without pages, generations, pins, fences, and ownership.

`Truth-00` is the bridge that lets every existing idea survive while forcing every future implementation to become verifiable.
