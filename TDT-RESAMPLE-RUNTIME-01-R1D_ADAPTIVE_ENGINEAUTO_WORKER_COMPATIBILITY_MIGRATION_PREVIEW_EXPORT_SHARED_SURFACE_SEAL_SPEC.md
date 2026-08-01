# TDT-RESAMPLE-RUNTIME-01-R1D

## Adaptive·EngineAuto·Worker Compatibility Migration / Preview·Export Shared Surface Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R1D`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R1C`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R1C_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target source state:** `RESAMPLE_RUNTIME_R1D_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target verified state:** `RESAMPLE_RUNTIME_R1D_VERIFIED_UNPROMOTED`
- **Specification status:** `SPEC_DEFINED_UNBAKED`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Primary runtime:** WebGPU
- **Primary kernel language:** WGSL
- **Canonical resample kernel:** `tdt-ewa-aniso-r1c-v3` or its sealed R1D-compatible successor
- **Canonical tensor schema:** `tdt.structure-tensor.field.r1c.v1`
- **Canonical stage planner:** R1B deterministic integer planner
- **CPU image resample fallback:** forbidden
- **WebGL product resample fallback:** forbidden
- **Canvas product resample fallback:** forbidden
- **Implicit source-surface export fallback:** forbidden
- **Compatibility API removal:** forbidden under R1D

---

# 0. Executive Contract

R1D shall preserve the existing public and legacy-facing API surfaces while migrating every admitted Adaptive, EngineAuto, Worker, Preview, and Export caller toward one canonical R1C WebGPU resample result.

R1D shall not freeze the existing pipeline.

R1D shall not introduce a second product resampler.

R1D shall repair the compatibility layers in place so that the current runtime remains operable during migration.

The target product flow is:

```text
existing UI or legacy caller
    ↓
compatibility request normalization
    ↓
R1B deterministic stage plan
    ↓
R1C stage-local tensor + anisotropic EWA
    ↓
registered GPU final surface
    ↓
PipelineService.publishFinalCandidate(...)
    ↓
exact FinalSurfacePublication tuple
    ├─ PreviewPresenterService pin and present
    └─ ExportAuthorityService pin and encode
```

The exact shared tuple is:

```text
surfaceId
sourceRevision
finalRevision
pipelineReceiptId
resampleReceiptId
resampleReceiptDigest
```

Preview and Export shall not independently resize, reconstruct, capture, or reinterpret the final pixels.

R1D shall preserve existing compatibility entrypoints, but it shall distinguish explicitly among:

```text
CANONICAL_WEBGPU_PRODUCT
LEGACY_WEBGL_COMPATIBILITY
LEGACY_WORKER_COMPATIBILITY
NON_PRODUCT_REFERENCE
```

Only `CANONICAL_WEBGPU_PRODUCT` may publish an authoritative final surface or claim R1C anisotropic truth.

---

# 1. Baseline Findings

## 1.1 `engineAuto.js` still mislabels Lanczos as anisotropic

The current `downscaleAuto()` policy chooses:

```text
lanczos
aniso
aniso-stair
```

The admitted implementation then executes `doLanczosPass()` for all three branches.

Current behavior:

```javascript
if (engine === 'lanczos') {
  await doLanczosPass(dstW, dstH);
} else if (engine === 'aniso') {
  await doLanczosPass(dstW, dstH);
} else {
  // stair path
  await doLanczosPass(...);
}
```

This is a compatibility implementation, not R1C anisotropic execution.

R1D shall preserve `downscaleAuto()` and `chooseEngine()`, but shall make requested and executed engine identity explicit.

## 1.2 Adaptive EWA owns an independent anisotropic implementation

The current `createAdaptiveEwaDownscalePass()` performs:

```text
Q-map LOD
→ tile mask
→ box or bilinear fast downscale
→ independent adaptive EWA WGSL
```

It directly reads mutable global policy values from `window.DadumGPUParams` and owns a separate 96-byte parameter ABI.

Its anisotropic parameters include:

```text
radiusMul
sigma
anisoAngle
anisoAspect
ΔE gate parameters
Q-map tile thresholds
```

This path is not derived from the R1C stage-local integrated tensor field.

R1D shall preserve the pass factory and `run(ctx, input, encoder)` shape, but shall migrate the actual image resampling to the R1C kernel.

## 1.3 `pipeline.worker.js` is an incomplete execution stub

The worker currently:

- creates WebGL2 state,
- declares shader programs without compiling them,
- allocates a zero-filled output array,
- leaves upload, execution, and download as TODO,
- never writes processed pixels into the output,
- posts the zero-filled buffer as a successful result.

The legacy caller in `patches/pipeline_bind.js` sends:

```text
cmd: process
id
rgba
w
h
```

The worker listens for:

```text
type: attach
type: run
```

The protocol does not match.

R1D shall preserve both historical envelopes while replacing the worker with a broker that delegates execution to the renderer-owned GPU Authority.

## 1.4 Active Export already delegates, but fallback code remains

The active export button in `resize_export_bind.js` already calls:

```text
window.DadumRuntimeExport.exportFinal(...)
```

This is the correct authority boundary.

The same admitted file still contains dormant or compatibility helpers for:

- WebGL FBO discovery,
- backbuffer copying,
- `readPixels`,
- canvas construction,
- CPU alpha sampling,
- direct WGSL resize and RGBA return.

`input/export_surface_ssot.js` also resolves, in order, explicit payloads, filtered surfaces, filtered caches, source surfaces, and canvas payloads.

R1D shall preserve the compatibility module APIs but make authoritative product export require the Runtime final surface.

## 1.5 Preview and Export already carry most of the same identity

`PreviewPresenterService` consumes `FinalSurfacePublication` and verifies:

```text
surfaceId
sourceRevision
finalRevision
pipelineReceiptId
```

`ExportAuthorityService` obtains the same binding through `PipelineService.requireFinal()` and pins the same surface ID.

R1D shall close the remaining evidence gap by adding resample receipt identity and a cross-consumer shared-surface seal.

## 1.6 Active Graph status differs by component

At the R1C baseline:

- `resize_export_bind.js` is an admitted active root.
- `input/export_surface_ssot.js` is admitted.
- `engineAuto.js` is present but is not an admitted product node.
- `adaptive_ewa_downscale_pass.js` is present but is not an admitted product node.
- `qmap_preprocess_adaptive_ewa_chain.js` is present but is not an admitted product node.
- `pipeline.worker.js` is present but is not an admitted product node.
- `patches/pipeline_bind.js` is present but is not an admitted product node.

R1D shall not falsely claim that non-admitted files are current product execution paths.

They shall be repaired as compatibility surfaces and shall remain non-authoritative until an explicit future admission gate promotes them.

---

# 2. Scope

## 2.1 In scope

R1D shall implement and seal:

1. a canonical compatibility request schema,
2. a compatibility mode discriminator,
3. Adaptive pass migration to R1C EWA,
4. Q-map and ΔE policy projection into explicit adaptation fields,
5. EngineAuto requested-versus-executed identity truth,
6. EngineAuto canonical WebGPU overload,
7. continued WebGL compatibility without canonical claims,
8. Worker protocol normalization,
9. renderer-owned WebGPU execution broker,
10. zero-output Worker removal,
11. final surface publication after canonical resampling,
12. resample receipt identity propagation,
13. Preview consumption evidence,
14. Export consumption evidence,
15. cross-consumer shared-surface verification,
16. product export source restriction,
17. source and canvas fallback compatibility isolation,
18. active graph and call-count evidence,
19. lifecycle, cancellation, device epoch, and fence closure,
20. source, mock-runtime, physical GPU, and packaged Electron gates.

## 2.2 Out of scope

R1D shall not claim completion of:

- R2 shared-memory optimization,
- tiled large-document streaming,
- full Adaptive policy redesign,
- Q-map algorithm redesign,
- ΔE algorithm redesign,
- encoder redesign,
- monitor ICC display transform,
- hidden RGB sidecar redesign,
- legacy WebGL texture zero-copy import into WebGPU,
- production promotion.

## 2.3 Non-goals

R1D shall not:

- delete existing public functions,
- rename existing UI commands,
- silently reinterpret a WebGL texture as a GPUTexture,
- silently download WebGL pixels to migrate into WebGPU,
- return a GPUTexture where an unchanged caller requires a WebGLTexture without an explicit discriminated result,
- run a second resize after final surface publication,
- allow Preview output to become Export input,
- allow Export fallback resolution to replace the authoritative final surface.

---

# 3. Compatibility Migration Principle

R1D uses in-place compatibility migration.

```text
preserve facade
→ normalize request
→ select explicit compatibility mode
→ execute canonical R1C when compatible input exists
→ preserve legacy implementation only for legacy-only callers
→ deny canonical claims for legacy execution
→ measure caller counts
→ remove nothing under R1D
```

The migration shall not be implemented as:

```text
disable old file
→ create unrelated new pipeline
→ hope callers move
```

Every preserved facade shall either:

1. execute the canonical WebGPU product path,
2. execute an explicitly labeled legacy compatibility path,
3. or fail with a stable error before producing output.

No facade may silently select a different algorithm.

---

# 4. Canonical Compatibility Request

## 4.1 Schema

R1D shall define a shared normalized request:

```typescript
interface ResampleCompatibilityRequestV1 {
  readonly schemaId: 'tdt.resample.compatibility.request.v1';
  readonly requestId: string;
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number | null;

  readonly callerId: string;
  readonly callerClass:
    | 'adaptive-pass'
    | 'engine-auto'
    | 'worker-broker'
    | 'resize-export-bind'
    | 'runtime-pipeline';

  readonly requestedMode:
    | 'auto'
    | 'speed'
    | 'quality'
    | 'adaptive'
    | 'ewa-aniso'
    | 'lanczos';

  readonly sourceKind:
    | 'canonical-surface'
    | 'gpu-texture'
    | 'cpu-rgba8'
    | 'cpu-rgba16'
    | 'legacy-webgl-texture'
    | 'canvas';

  readonly sourceSurfaceId: string | null;
  readonly sourceTexture: GPUTexture | null;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly targetWidth: number;
  readonly targetHeight: number;

  readonly sourceRevision: number;
  readonly pipelineReceiptId: string | null;
  readonly qmapSurfaceId: string | null;
  readonly adaptationPolicy: AdaptivePolicyV1 | null;

  readonly compatibilityMode:
    | 'CANONICAL_WEBGPU_PRODUCT'
    | 'LEGACY_WEBGL_COMPATIBILITY'
    | 'LEGACY_WORKER_COMPATIBILITY'
    | 'NON_PRODUCT_REFERENCE';

  readonly publishFinal: boolean;
  readonly expectedFinalRevision: number | null;
}
```

## 4.2 Normalization rules

Normalization shall:

- validate exact dimensions,
- reject upscaling unless explicitly admitted by a future spec,
- reject stale runtime epoch,
- reject stale device epoch for GPU input,
- reject mixed WebGL and WebGPU resource identity,
- make all global-derived parameters explicit,
- record default ownership,
- calculate a canonical request digest.

## 4.3 Compatibility mode selection

The selection shall be deterministic:

```text
canonical surface or canonical GPUTexture
    → CANONICAL_WEBGPU_PRODUCT

legacy WebGLTexture with WebGL caller contract
    → LEGACY_WEBGL_COMPATIBILITY

worker request requiring renderer delegation
    → LEGACY_WORKER_COMPATIBILITY

fixture or comparison-only call
    → NON_PRODUCT_REFERENCE
```

A legacy source kind shall never be promoted automatically into `CANONICAL_WEBGPU_PRODUCT` through hidden readback.

---

# 5. Compatibility Result Schema

R1D shall define a discriminated result:

```typescript
interface CanonicalCompatibilityResultV1 {
  readonly schemaId: 'tdt.resample.compatibility.result.v1';
  readonly requestId: string;
  readonly compatibilityMode: 'CANONICAL_WEBGPU_PRODUCT';
  readonly requestedEngine: string;
  readonly executedKernelId: 'tdt-ewa-aniso-r1c-v3';
  readonly fallbackUsed: false;

  readonly texture: GPUTexture;
  readonly tex: GPUTexture;
  readonly fbo: null;
  readonly width: number;
  readonly height: number;
  readonly w: number;
  readonly h: number;

  readonly surfaceId: string;
  readonly sourceRevision: number;
  readonly finalRevision: number | null;
  readonly pipelineReceiptId: string;
  readonly resampleReceiptId: string;
  readonly resampleReceiptDigest: string;
}
```

Legacy result:

```typescript
interface LegacyWebGLCompatibilityResultV1 {
  readonly schemaId: 'tdt.resample.compatibility.result.v1';
  readonly requestId: string;
  readonly compatibilityMode: 'LEGACY_WEBGL_COMPATIBILITY';
  readonly requestedEngine: string;
  readonly executedKernelId: 'legacy-webgl-lanczos-compat-v1';
  readonly fallbackUsed: false;
  readonly canonicalTensorClaim: false;
  readonly canonicalAnisotropicClaim: false;
  readonly publishFinalAllowed: false;

  readonly tex: WebGLTexture;
  readonly fbo: WebGLFramebuffer;
  readonly w: number;
  readonly h: number;
}
```

No result may report:

```text
requestedEngine = aniso
executedKernelId = lanczos
canonicalAnisotropicClaim = true
```

---

# 6. Adaptive Pass Migration

## 6.1 Facade preservation

The following facade remains:

```javascript
createAdaptiveEwaDownscalePass(opts?)
```

It shall continue returning:

```javascript
{
  name,
  run(ctx, input, encoder)
}
```

Callers shall not be required to change immediately.

## 6.2 Responsibility split

The existing Adaptive flow shall be decomposed into:

```text
Q-map reduction
→ tile/adaptation policy generation
→ canonical R1C resample
```

The Adaptive facade may continue owning:

- Q-map LOD construction,
- Q-map threshold mapping,
- ΔE policy normalization,
- tile policy projection,
- debug policy visualization.

It shall no longer own an independent image resampling algorithm.

## 6.3 Adaptive policy schema

```typescript
interface AdaptivePolicyV1 {
  readonly schemaId: 'tdt.resample.adaptive-policy.v1';
  readonly policyId: string;
  readonly policyDigest: string;

  readonly qThreshold: number;
  readonly qCurveMode: 'scurve' | 'pow';
  readonly qCurveGamma: number;
  readonly qLodMaxMix: number;

  readonly deThreshold: number;
  readonly deSoftness: number;
  readonly deStrength: number;
  readonly level1DeStrength: number;
  readonly level1ThresholdAdd: number;
  readonly level1SoftnessMultiplier: number;

  readonly level0Anisotropy: 1.0;
  readonly level1Anisotropy: number;
  readonly level2Anisotropy: number;
  readonly level1TensorStrength: number;
  readonly level2TensorStrength: number;
}
```

## 6.4 Global compatibility normalization

The facade may read existing values from `window.DadumGPUParams` for compatibility.

It shall read them exactly once before dispatch and normalize them into `AdaptivePolicyV1`.

WGSL wrappers and lower-level runtime functions shall not read mutable global values.

The receipt shall distinguish:

```text
explicit option
legacy global override
sealed default
```

for every policy field.

## 6.5 Adaptation field

R1D shall create a stage-aligned adaptation field.

Recommended schema:

```text
format: rgba8unorm or r8uint if supported by the chosen storage contract
resolution: current stage output resolution or a sealed tile-grid resolution

R or integer level:
0 → isotropic canonical EWA
1 → medium tensor strength and bounded anisotropy
2 → full R1C tensor strength and anisotropy

optional channels:
G → normalized Q-map confidence
B → normalized ΔE gate
A → reserved, deterministic zero or explicit coverage
```

The adaptation field is a policy texture.

It is not a substitute for the R1C tensor field.

## 6.6 Canonical kernel consumption

The canonical EWA kernel shall consume:

```text
R1C tensor field
R1D adaptation policy field
```

The adaptation field may modulate:

- tensor strength,
- maximum anisotropy,
- coherence exponent,
- edge gate thresholds,
- kernel sharpness within admitted bounds.

It shall not replace the tensor tangent with a fixed `anisoAngle`.

It shall not set an arbitrary global `anisoAspect` as the geometric truth.

Legacy `anisoAngle` and `anisoAspect` values may be recorded and mapped into bounded policy bias only in compatibility mode.

They shall not be reported as tensor-derived orientation.

## 6.7 Fast path truth

Adaptive level 0 shall not use box or bilinear output as the product final result.

Allowed level 0 behavior:

```text
canonical isotropic EWA
anisotropy = 1
minimal admitted tensor influence
same stage plan
same color and alpha contract
```

A separate box or bilinear texture may remain as a non-product comparison fixture, but shall not be mixed into the canonical final surface.

## 6.8 Existing WGSL path

The existing file path may remain for compatibility:

```text
core/compute/downscale_webgpu/adaptive_ewa_downscale_rgba16f.wgsl
```

R1D may transform it into one of:

1. adaptation policy projection shader,
2. compatibility forwarding shader,
3. reference-only fixture shader.

It shall not remain an independent product EWA implementation after R1D.

Its receipt role shall state the exact disposition.

---

# 7. EngineAuto Migration

## 7.1 Public API preservation

The following remain:

```javascript
downscaleAuto(gl, opts)
chooseEngine(scale, qualityMode)
gaussianSigma(scale)
```

## 7.2 Requested policy versus executed kernel

`chooseEngine()` may continue returning legacy policy labels:

```text
lanczos
aniso
aniso-stair
```

The runtime result shall separately report:

```text
requestedPolicy
compatibilityMode
executedKernelId
canonicalClaim
```

## 7.3 Canonical overload

`downscaleAuto()` shall accept canonical input without breaking the old signature.

Example:

```javascript
await downscaleAuto(null, {
  sourceSurfaceId,
  sourceRevision,
  dstW,
  dstH,
  qualityMode: 'quality',
  publishFinal: true,
});
```

or:

```javascript
await downscaleAuto(null, {
  sourceTexture,
  sourceWidth,
  sourceHeight,
  dstW,
  dstH,
  qualityMode: 'auto',
});
```

Canonical overload shall execute:

```text
R1B planner
→ R1C tensor and EWA
→ optional final publication
```

## 7.4 Legacy WebGL branch

A caller that supplies only:

```text
WebGLRenderingContext
WebGLTexture
```

may continue receiving the existing WebGL result.

This branch shall be labeled:

```text
LEGACY_WEBGL_COMPATIBILITY
```

It shall:

- preserve the old `tex`, `fbo`, `w`, and `h` shape,
- report `executedKernelId = legacy-webgl-lanczos-compat-v1`,
- report `canonicalAnisotropicClaim = false`,
- report `publishFinalAllowed = false`,
- emit migration telemetry,
- never call `DadumRuntimeBridge.publishLegacyFinalSurface()`.

## 7.5 No hidden cross-backend transfer

R1D forbids:

```text
WebGL readPixels
→ CPU buffer
→ WebGPU upload
```

as an automatic EngineAuto migration.

A future explicit import spec may define such a transfer with receipts, but R1D shall not smuggle it behind `qualityMode: auto`.

## 7.6 Stair policy

`aniso-stair` canonical execution shall map to the existing R1B deterministic stage plan.

It shall not own a second `nextStepSize()` planner.

The legacy WebGL branch may retain its old stair implementation for compatibility, but shall record that it is not R1B canonical.

---

# 8. Worker Compatibility Migration

## 8.1 Worker shall not own the GPU device

`pipeline.worker.js` shall not request:

```text
navigator.gpu.requestAdapter()
requestDevice()
```

It shall not create WebGL2 product processing state.

The renderer GPU Authority remains the sole WebGPU device owner.

## 8.2 Worker role

The Worker becomes a protocol broker and optional CPU payload transport layer.

```text
legacy caller
→ pipeline.worker.js
→ normalized broker request
→ renderer MessagePort
→ canonical R1C execution
→ renderer result
→ worker compatibility result
→ legacy caller
```

## 8.3 Supported input envelopes

R1D shall normalize all currently visible historical envelopes.

### Historical attach/run

```javascript
{ type: 'attach', canvas, size }
{ type: 'run', buf, atlas, tensor }
```

### Historical process

```javascript
{
  cmd: 'process',
  id,
  rgba,
  w,
  h,
  options,
}
```

### Canonical v1

```javascript
{
  type: 'resample.request.v1',
  requestId,
  source,
  target,
  options,
}
```

## 8.4 Renderer broker attachment

The Worker shall require an explicit `MessagePort` attachment:

```javascript
{
  type: 'resample.broker.attach.v1',
  runtimeEpoch,
  port,
}
```

The renderer side shall own a broker registered through the existing Side Effect and service ownership contracts.

The port shall be invalidated on:

- runtime epoch change,
- Worker generation change,
- device loss,
- renderer disposal,
- explicit cancel.

## 8.5 Result modes

Canonical result:

```javascript
{
  type: 'resample.result.v1',
  requestId,
  ok: true,
  surfaceId,
  sourceRevision,
  finalRevision,
  pipelineReceiptId,
  resampleReceiptId,
  resampleReceiptDigest,
  width,
  height,
  compatibilityReadbackUsed: false,
}
```

Legacy byte result may be returned only when an explicit compatibility request requires it:

```javascript
{
  type: 'done',
  id,
  rgba,
  w,
  h,
  stats,
  compatibilityReadbackUsed: true,
  authoritativeFinalSurface: false,
}
```

The compatibility readback result shall not be published as the canonical final surface.

## 8.6 Zero-filled result prohibition

A Worker result is invalid when:

- no renderer execution receipt exists,
- no canonical or explicit compatibility readback source exists,
- output was never written,
- output is returned merely because a zero-initialized array was allocated.

The Worker shall fail with a stable protocol error instead.

## 8.7 Progress semantics

Progress shall be derived from actual canonical stage completion:

```text
request accepted
stage plan built
tensor passes complete
EWA stage complete
final surface published
compatibility readback complete, if requested
```

Synthetic tile-loop progress without image execution is forbidden.

## 8.8 Cancellation

Worker cancellation envelope:

```javascript
{
  type: 'resample.cancel.v1',
  requestId,
  reason,
}
```

Cancellation shall propagate to:

- renderer broker,
- R1B stage chain,
- R1C tensor temporaries,
- final publication eligibility.

A submitted stage may finish its GPU fence, but a cancelled request shall not publish a final surface.

---

# 9. Final Surface Publication Contract

## 9.1 Publication authority

Only `PipelineService.publishFinalCandidate()` may assign:

```text
finalRevision
publicationSequence
```

Compatibility adapters shall not invent them.

## 9.2 Canonical resample registration

The R1D canonical result texture shall be registered with Surface Authority before publication.

Required registration evidence:

```text
producerId
resampleReceiptId
resampleReceiptDigest
stagePlanDigest
tensorPipelineId
kernelId
parameterDigest
sourceSurfaceId
sourceRevision
deviceBinding
compatibilityMode = CANONICAL_WEBGPU_PRODUCT
```

## 9.3 Legacy bridge publication

Existing legacy producers may continue using:

```javascript
window.DadumRuntimeBridge.publishLegacyFinalSurface(...)
```

The R1D adapter shall pass the registered or owned canonical GPU texture and full resample evidence.

It shall publish exactly once per successful request.

## 9.4 Prohibited publication sources

The following shall not become authoritative final surfaces:

```text
legacy WebGL compatibility output
canvas readback
source surface fallback
preview canvas
Preview upload texture
Worker zero output
box or bilinear adaptive fast texture
reference kernel output
cancelled request output
stale device-epoch output
```

---

# 10. Resample Receipt Propagation

## 10.1 Receipt identity

Every canonical final surface shall carry:

```text
resampleReceiptId
resampleReceiptDigest
```

The receipt shall include at least:

```text
request digest
compatibility caller ID
compatibility mode
requested mode
executed kernel ID
R1B stage plan digest
R1C tensor pipeline ID
tensor schema ID
adaptive policy ID or null
adaptive policy digest or null
source surface ID
source revision
output dimensions
device epoch
shader digests
fallbackUsed = false
```

## 10.2 Pipeline publication extension

R1D shall extend the publication evidence without breaking existing fields.

Allowed shape:

```typescript
interface FinalSurfacePublicationR1D extends FinalSurfacePublication {
  readonly resampleReceiptId: string | null;
  readonly resampleReceiptDigest: string | null;
}
```

Existing listeners that read only R1C-era fields shall continue to work.

Canonical R1D final surfaces require non-null resample receipt fields.

Non-resample fixture publication may remain nullable if explicitly classified.

## 10.3 Surface record evidence

The Surface Authority record and Pipeline publication shall agree on both receipt values.

Mismatch shall fail before Preview or Export consumption.

---

# 11. Preview Shared-Surface Contract

## 11.1 Preview remains a consumer

Preview shall not call Adaptive, EngineAuto, or Worker resample APIs.

Preview shall continue to consume only `FinalSurfacePublication`.

## 11.2 Exact tuple verification

Before submission, Preview shall verify:

```text
publication.surfaceId == surfaceRecord.surfaceId
publication.sourceRevision == surfaceRecord.sourceRevision
publication.finalRevision == surfaceRecord.finalRevision
publication.pipelineReceiptId == surfaceRecord pipeline evidence
publication.resampleReceiptId == surfaceRecord resample evidence
publication.resampleReceiptDigest == surfaceRecord resample evidence
```

## 11.3 Preview receipt

`PRESENTED` receipt shall add:

```text
resampleReceiptId
resampleReceiptDigest
sharedSurfaceTupleDigest
```

`PRESENTED` remains valid only after submitted-work completion.

## 11.4 Display transform separation

Preview may perform:

- canvas fit,
- DPR backing-size selection,
- display transform,
- swap-chain presentation.

It shall not mutate:

```text
final surface pixels
final surface dimensions
resample receipt
stage plan
encoder input
```

---

# 12. Export Shared-Surface Contract

## 12.1 Export remains a consumer

Export shall continue using:

```typescript
const binding = pipeline.requireFinal(expectedRevision);
const surfacePin = surfaces.pin(binding.surfaceId, ...);
```

It shall not call `downscaleRGBAWithWGSL()` after final publication.

## 12.2 Exact tuple verification

Before encoding, Export shall verify the same tuple as Preview.

The Export receipt shall include:

```text
resampleReceiptId
resampleReceiptDigest
sharedSurfaceTupleDigest
```

## 12.3 Dimension truth

If export options request dimensions different from the final surface dimensions, Export shall fail:

```text
E_EXPORT_FINAL_DIMENSION_MISMATCH
```

It shall not resize silently.

The UI shall request a new pipeline resample before export when dimensions change.

## 12.4 No Preview source

Export shall never use:

- `dadumPreviewCanvas`,
- swap-chain texture,
- Preview upload texture,
- Preview frame receipt payload,
- canvas screenshot.

---

# 13. Cross-Consumer Shared Surface Seal

## 13.1 Shared tuple digest

R1D shall define:

```text
sharedSurfaceTupleDigest = SHA-256(canonical JSON of {
  surfaceId,
  sourceRevision,
  finalRevision,
  pipelineReceiptId,
  resampleReceiptId,
  resampleReceiptDigest
})
```

## 13.2 Consumption ledger

R1D shall add a serializable ledger or equivalent authority projection.

Recommended service:

```text
FinalSurfaceConsumptionLedgerService
```

It records:

```text
consumerId
surfaceId
sourceRevision
finalRevision
pipelineReceiptId
resampleReceiptId
resampleReceiptDigest
sharedSurfaceTupleDigest
state
startedAt
completedAt
```

Consumer states:

```text
PREVIEW_SUBMITTED
PREVIEW_PRESENTED
EXPORT_PINNED
EXPORT_ENCODED
EXPORT_SAVED
DROPPED_SUPERSEDED
FAILED
```

## 13.3 Parity states

The seal may report:

```text
MATCHED
PREVIEW_NOT_YET_PRESENTED
EXPORT_NOT_YET_REQUESTED
SUPERSEDED_BEFORE_BOTH
MISMATCH
```

`PREVIEW_NOT_YET_PRESENTED` is not a pixel mismatch.

`MISMATCH` is a hard failure.

## 13.4 No consumer ordering deadlock

Pipeline publication shall not wait for Preview.

Export shall not require Preview to complete.

The ledger compares identity without creating a dependency cycle.

---

# 14. Product Export Source Restriction

## 14.1 `resize_export_bind.js`

The active export button shall continue delegating to:

```text
DadumRuntimeExport.exportFinal(...)
```

The UI may update requested dimensions through the canonical processing request before export.

It shall not invoke dormant helper paths that:

- read a WebGL FBO,
- copy the backbuffer,
- create a temporary canvas,
- call direct RGBA resize,
- restore alpha on CPU.

## 14.2 `resolveExportPayload()` modes

`input/export_surface_ssot.js` shall add an explicit mode:

```typescript
mode:
  | 'authoritative-final-required'
  | 'legacy-compatibility'
```

Default in admitted product export:

```text
authoritative-final-required
```

In this mode, only the Runtime final surface is accepted.

## 14.3 Legacy compatibility mode

Legacy payload, source surface, or canvas resolution may remain available only when:

```text
mode = legacy-compatibility
caller ID is explicit
canonical export authority is not invoked
result canonicalFinalClaim = false
```

Canvas fallback shall not be silently reached because higher-priority sources are absent.

## 14.4 Source surface rejection

An unprocessed source surface shall not replace a missing final surface.

Stable error:

```text
E_EXPORT_FINAL_SURFACE_REQUIRED
```

---

# 15. Active Graph and Admission Contract

## 15.1 Admitted product nodes

R1D shall keep the active admitted product path limited to modules that are actually required.

The active graph shall prove:

- canonical R1D compatibility bridge is admitted,
- R1B/R1C runtime remains admitted,
- Preview and Export authorities remain admitted,
- active resize export binding delegates only to Runtime Export.

## 15.2 Non-admitted compatibility modules

The following may remain non-admitted:

```text
engineAuto.js
adaptive_ewa_downscale_pass.js
qmap_preprocess_adaptive_ewa_chain.js
pipeline.worker.js
patches/pipeline_bind.js
```

They shall still pass source contract gates.

Non-admission shall not be described as runtime migration completion.

## 15.3 Future admission

A future build may admit one of these modules only when:

- it routes canonical inputs to R1C,
- it has a declared owner root,
- it has no direct GPU device creation,
- it has no independent EWA kernel,
- it has protocol and receipt coverage,
- it cannot publish legacy output as final.

---

# 16. Stable Error Contract

R1D shall define or reuse stable errors for:

```text
E_RESAMPLE_COMPAT_REQUEST_INVALID
E_RESAMPLE_COMPAT_MODE_AMBIGUOUS
E_RESAMPLE_CROSS_BACKEND_TRANSFER_FORBIDDEN
E_RESAMPLE_ENGINE_IDENTITY_MISMATCH
E_RESAMPLE_ADAPTIVE_POLICY_INVALID
E_RESAMPLE_ADAPTIVE_FIELD_INVALID
E_RESAMPLE_WORKER_BROKER_UNAVAILABLE
E_RESAMPLE_WORKER_PROTOCOL_INVALID
E_RESAMPLE_WORKER_ZERO_OUTPUT_FORBIDDEN
E_RESAMPLE_WORKER_CANCELLED
E_RESAMPLE_FINAL_PUBLICATION_FORBIDDEN
E_RESAMPLE_RECEIPT_MISSING
E_RESAMPLE_RECEIPT_MISMATCH
E_SHARED_SURFACE_TUPLE_MISMATCH
E_EXPORT_FINAL_SURFACE_REQUIRED
E_EXPORT_FINAL_DIMENSION_MISMATCH
E_EXPORT_COMPATIBILITY_SOURCE_FORBIDDEN
```

Stable errors shall include serializable evidence only.

Raw GPU objects, DOM nodes, canvases, and MessagePorts shall not appear in error metadata.

---

# 17. Resource and Lifecycle Contract

## 17.1 Canonical textures

Canonical Adaptive and EngineAuto execution shall register:

- adaptation field textures,
- R1C tensor temporaries,
- R1B stage intermediates,
- final result texture.

## 17.2 Ownership

```text
adaptation field
    → compatibility adapter owns until stage fence

tensor temporaries
    → R1C stage owns until EWA fence

stage output
    → R1B successor stage or final publication

final texture
    → PipelineService ownership through Surface Authority
```

## 17.3 Worker ownership

The Worker owns only:

- protocol state,
- serializable request metadata,
- transferred CPU buffers when explicitly requested,
- MessagePort generation state.

It owns no canonical GPU resources.

## 17.4 Final pinning

Preview and Export each acquire their own Surface pin.

The final texture remains alive until all submitted consumers release their pins.

## 17.5 Supersession

When a newer final surface is published:

- old surface invalidation is requested,
- submitted Preview work completes and releases its old pin,
- active Export encoding completes or cancels according to its job contract,
- disposal occurs after the final pin is released.

---

# 18. Device Loss and Recovery

## 18.1 Compatibility adapters

On device loss:

- canonical compatibility requests stop accepting new GPU work,
- pending unsubmitted requests fail,
- submitted work resolves through the existing fence/loss policy,
- adaptation fields are invalidated,
- renderer Worker broker generation changes,
- old MessagePorts become stale.

## 18.2 Legacy WebGL branch

Legacy WebGL compatibility state is independent of WebGPU device epoch, but it shall not be promoted as canonical during WebGPU loss.

## 18.3 Recovery

After GPU Authority recovery:

- canonical pipelines rebuild under the new device epoch,
- Worker broker reattaches with a new generation,
- CPU-backed canonical input may replay,
- old GPU-only source surfaces may not replay without republishing,
- old resample receipt identity may not be reused for new pixels.

---

# 19. Parameter and Policy Sensitivity

## 19.1 Adaptive parameters

The following exposed parameters shall affect at least one admitted fixture:

```text
qThreshold
qLodCurveGamma
qLodMaxMix
deThreshold
deSoftness
deStrength
level1DeStrength
level1ThresholdAdd
level1SoftnessMultiplier
level1Anisotropy
level2Anisotropy
level1TensorStrength
level2TensorStrength
```

A parameter that does not affect:

- adaptation field digest,
- stage receipt,
- or output digest on any matching fixture

is dead and fails R1D.

## 19.2 EngineAuto policy sensitivity

`qualityMode` shall affect the canonical request policy, but shall not change kernel identity to an unsealed implementation.

Example:

```text
speed
→ canonical EWA with conservative adaptation policy

quality
→ canonical R1C full policy

auto
→ deterministic policy from scale and declared metadata
```

All may still execute the same sealed kernel with different parameter receipts.

---

# 20. Preview·Export Fixture Matrix

## 20.1 Shared identity fixtures

Required final surfaces:

```text
opaque RGBA8
transparent RGBA8
rgba16float
odd dimensions
non-square dimensions
multi-stage 64→8
multi-stage 17→4
adaptive level 0 dominant
adaptive level 1 dominant
adaptive level 2 dominant
```

For each surface:

```text
Preview publication tuple
Preview PRESENTED tuple
Export pinned tuple
Export receipt tuple
```

shall have the same `sharedSurfaceTupleDigest`.

## 20.2 Supersession fixture

```text
publish revision N
Preview submits N
publish revision N+1
Export requests N+1
Preview completes N
Preview presents N+1
```

Required:

- N and N+1 identities never mix,
- N completion does not overwrite N+1 store state,
- Export N+1 consumes only N+1,
- old N surface disposes after final pin release.

## 20.3 Export-before-Preview fixture

```text
publish N
Export pins N
Preview has not yet presented N
```

Result:

```text
shared status = PREVIEW_NOT_YET_PRESENTED
not MISMATCH
```

## 20.4 Dimension mismatch fixture

An Export request for dimensions different from final N shall fail and shall not create a resize dispatch.

## 20.5 Source fallback fixture

No final surface exists, but source surface and canvas exist.

Product Export shall fail with:

```text
E_EXPORT_FINAL_SURFACE_REQUIRED
```

Legacy compatibility resolution may succeed only under an explicit non-product mode.

---

# 21. Worker Fixture Matrix

Required protocol fixtures:

1. canonical v1 success,
2. historical `cmd: process` normalization,
3. historical attach/run normalization,
4. missing broker port,
5. stale runtime epoch,
6. stale broker generation,
7. cancellation before submission,
8. cancellation after submission,
9. renderer error propagation,
10. zero-output prevention,
11. progress ordering,
12. compatibility readback result,
13. canonical surface-only result,
14. Worker termination cleanup.

Required assertions:

```text
GPU adapter requests in Worker = 0
WebGL product context creation = 0
zero-filled successful output = 0
unmatched request terminal states = 0
post-cancel final publications = 0
```

---

# 22. EngineAuto Fixture Matrix

Required:

```text
legacy WebGL + speed
legacy WebGL + quality
legacy WebGL + auto
canonical surface + speed
canonical surface + quality
canonical surface + auto
canonical GPUTexture + quality
ambiguous WebGL and GPU input
missing source
upscale request
large multistage shrink
```

Expected identity examples:

```text
legacy WebGL + quality
requestedPolicy = aniso
executedKernelId = legacy-webgl-lanczos-compat-v1
canonicalAnisotropicClaim = false
publishFinalAllowed = false
```

```text
canonical surface + quality
requestedPolicy = aniso
executedKernelId = tdt-ewa-aniso-r1c-v3
canonicalAnisotropicClaim = true
publishFinalAllowed = true
```

Ambiguous mixed backend input shall fail.

---

# 23. Adaptive Fixture Matrix

Required:

- flat low-Q image,
- high-Q fine detail,
- isolated high-Q tile,
- ΔE gate below threshold,
- ΔE gate above threshold,
- level transition boundary,
- non-square stage,
- odd dimensions,
- transparent edge,
- large multistage shrink.

Required properties:

```text
level 0 output is canonical isotropic EWA
level 1 output uses bounded tensor influence
level 2 output uses full admitted tensor influence
no box/bilinear pixels are mixed into final product
adaptation field aligns with stage coordinates
policy digest changes when meaningful parameters change
```

---

# 24. Telemetry

R1D shall expose at least:

```text
compatibilityRequestCount
canonicalProductRequestCount
legacyWebglCompatibilityCount
legacyWorkerCompatibilityCount
nonProductReferenceCount
adaptiveFacadeCallCount
adaptiveCanonicalDispatchCount
adaptiveIndependentEwaDispatchCount
engineAutoCallCount
engineAutoCanonicalCount
engineAutoLegacyWebglCount
engineIdentityMismatchCount
workerProtocolRequestCount
workerBrokerForwardCount
workerCompatibilityReadbackCount
workerZeroOutputRejectedCount
workerCancelCount
workerStaleGenerationCount
finalPublicationCount
finalPublicationRejectedCount
previewSharedTupleCount
exportSharedTupleCount
sharedTupleMatchCount
sharedTupleMismatchCount
sourceFallbackRejectedCount
canvasFallbackRejectedCount
```

Required source-bake values:

```text
adaptiveIndependentEwaDispatchCount = 0 in canonical smoke
engineIdentityMismatchCount = 0
workerZeroOutputRejectedCount >= 1 in negative fixture
sharedTupleMismatchCount = 0
```

---

# 25. Required Source Changes

At minimum, the R1D bake shall modify or create equivalents of:

```text
app/legacy-runtime/core/compute/downscale_webgpu/adaptive_ewa_downscale_pass.js
app/legacy-runtime/core/compute/downscale_webgpu/adaptive_ewa_downscale_rgba16f.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/qmap_preprocess_adaptive_ewa_chain.js
app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_params.mjs
app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_receipt.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/adaptive_policy_projection_r1d.wgsl
app/legacy-runtime/modules/dk_resample/engineAuto.js
app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs
app/src/workers/pipeline.worker.js
app/legacy-runtime/patches/pipeline_bind.js
app/src/runtime/resample/resample-worker-broker-service.ts
app/src/runtime/resample/resample-compatibility-types.ts
app/src/runtime/pipeline/pipeline-service.ts
app/src/runtime/pipeline/legacy-final-surface-bridge-service.ts
app/src/runtime/pipeline/final-surface-consumption-ledger-service.ts
app/src/runtime/preview/preview-presenter-service.ts
app/src/runtime/preview/preview-presenter-types.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
app/legacy-runtime/input/export_surface_ssot.js
app/legacy-runtime/resize_export_bind.js
app/src/boot/runtime-modules.ts
app/src/runtime/service-token.ts
app/src/env.d.ts
app/src/runtime/assets/runtime-asset-manifest.ts
app/src/runtime/active-graph/generated-active-runtime-graph.json
app/src/legacy/generated-legacy-static-admission.json
```

The exact file organization may follow repository conventions, but the responsibilities shall remain separated.

---

# 26. Source Gates

R1D defines `RD01` through `RD108`.

## 26.1 Compatibility authority gates

### RD01
R1C predecessor state and source seal are declared.

### RD02
R1A Object and Positional ABI remain present.

### RD03
R1B deterministic planner remains the only canonical multistage planner.

### RD04
R1C tensor and ellipse kernel remains the only canonical anisotropic kernel.

### RD05
A shared R1D compatibility request schema exists.

### RD06
Compatibility mode is explicit and enumerable.

### RD07
Mixed WebGL and WebGPU input is rejected.

### RD08
Legacy compatibility cannot publish a final surface.

### RD09
Canonical product result contains resample receipt identity.

### RD10
Production Pointer remains unchanged.

## 26.2 Adaptive migration gates

### RD11
`createAdaptiveEwaDownscalePass()` remains present.

### RD12
The returned `{ name, run }` facade remains compatible.

### RD13
Adaptive policy normalization reads globals only at the facade boundary.

### RD14
Lower-level canonical runtime receives explicit immutable policy values.

### RD15
Adaptive policy schema and digest exist.

### RD16
Stage-aligned adaptation field exists.

### RD17
Adaptation field is not labeled as a tensor field.

### RD18
Canonical Adaptive execution consumes the R1C tensor field.

### RD19
Canonical Adaptive execution consumes the R1D policy field.

### RD20
Level 0 executes canonical isotropic EWA.

### RD21
Level 1 executes bounded canonical anisotropy.

### RD22
Level 2 executes full admitted canonical anisotropy.

### RD23
Box and bilinear fast textures are not mixed into canonical final output.

### RD24
Fixed `anisoAngle` is not tensor orientation authority.

### RD25
Independent Adaptive product EWA dispatch count is zero.

### RD26
All exposed adaptive parameters have provenance evidence.

### RD27
Adaptive parameter sensitivity fixtures are defined.

### RD28
Adaptive final result retains R1B and R1C receipt chain.

## 26.3 EngineAuto gates

### RD29
`downscaleAuto()` remains present.

### RD30
`chooseEngine()` remains present.

### RD31
Legacy WebGL result shape remains admitted.

### RD32
Canonical WebGPU overload exists.

### RD33
Canonical overload routes to R1B/R1C.

### RD34
Canonical `aniso-stair` uses the R1B planner.

### RD35
Legacy `aniso` reports Lanczos compatibility truth.

### RD36
Legacy WebGL result reports no canonical anisotropic claim.

### RD37
Legacy WebGL result cannot publish final.

### RD38
No hidden WebGL readback to WebGPU upload exists.

### RD39
Requested policy and executed kernel are both recorded.

### RD40
Requested/executed identity mismatch cannot claim success.

### RD41
Canonical EngineAuto result may publish exactly one final surface.

### RD42
EngineAuto caller counts are present in receipts.

## 26.4 Worker protocol gates

### RD43
`pipeline.worker.js` contains no product WebGL context creation.

### RD44
`pipeline.worker.js` contains no GPU adapter or device request.

### RD45
Historical `attach/run` envelope is normalized.

### RD46
Historical `cmd: process` envelope is normalized.

### RD47
Canonical v1 envelope is normalized.

### RD48
Renderer MessagePort attachment is required.

### RD49
Broker generation and runtime epoch are validated.

### RD50
Worker forwards canonical requests to renderer authority.

### RD51
Canonical Worker result returns final surface identity.

### RD52
Legacy byte result requires explicit compatibility readback.

### RD53
Legacy byte result has no authoritative final claim.

### RD54
Zero-filled successful result is impossible.

### RD55
Missing renderer execution receipt fails.

### RD56
Progress reflects actual stage completion.

### RD57
Cancellation propagates to renderer request.

### RD58
Cancelled request cannot publish final.

### RD59
Worker termination clears pending requests.

### RD60
Worker bridge errors are stable and serializable.

## 26.5 Final publication gates

### RD61
Canonical result registers with Surface Authority.

### RD62
Surface evidence contains resample receipt ID and digest.

### RD63
Pipeline publication exposes resample receipt ID and digest.

### RD64
Surface and publication receipt identities match.

### RD65
Final revision remains PipelineService-owned.

### RD66
Compatibility adapters do not invent final revisions.

### RD67
Canonical request publishes at most once.

### RD68
Legacy WebGL result publication is rejected.

### RD69
Worker zero or compatibility byte result publication is rejected.

### RD70
Cancelled or stale output publication is rejected.

## 26.6 Preview shared-surface gates

### RD71
Preview consumes only Pipeline final publication.

### RD72
Preview does not call resample compatibility APIs.

### RD73
Preview validates resample receipt identity against Surface evidence.

### RD74
Preview receipt contains shared tuple digest.

### RD75
`PRESENTED` remains fence-complete.

### RD76
Preview display transform cannot mutate final pixels.

### RD77
Preview upload texture is not a final or export surface.

### RD78
Preview supersession keeps revision tuples isolated.

## 26.7 Export shared-surface gates

### RD79
Export uses `PipelineService.requireFinal()`.

### RD80
Export pins the exact binding surface ID.

### RD81
Export validates resample receipt identity.

### RD82
Export receipt contains shared tuple digest.

### RD83
Export performs no resize after final publication.

### RD84
Export dimension mismatch fails closed.

### RD85
Export does not read Preview canvas or swap-chain texture.

### RD86
Export does not use Preview upload texture.

### RD87
Active resize button delegates only to Runtime Export.

### RD88
Product export requires authoritative final surface.

### RD89
Source-surface fallback is rejected in product mode.

### RD90
Canvas fallback is rejected in product mode.

## 26.8 Shared ledger and lifecycle gates

### RD91
Shared surface tuple digest uses canonical JSON.

### RD92
Preview and Export consumption records use the same tuple schema.

### RD93
Identity comparison creates no Preview-to-Export dependency.

### RD94
Export-before-Preview reports a pending parity state, not mismatch.

### RD95
True tuple mismatch is a hard failure.

### RD96
Final surface pins outlive submitted consumer work.

### RD97
Adaptation field allocation and disposal counts match.

### RD98
Worker pending terminal counts close to zero.

### RD99
Device loss invalidates broker ports and canonical requests.

### RD100
Recovery uses a new device epoch and receipt identity.

## 26.9 Physical GPU and packaged gates

### RD101
Canonical Adaptive WGSL and policy WGSL compile on the canonical GPU.

### RD102
Canonical EngineAuto output matches direct R1C output for the same request.

### RD103
Adaptive level fixtures pass physical pixel and parameter-sensitivity tests.

### RD104
Worker broker fixtures pass in Packaged Electron.

### RD105
Preview and Export shared tuple digests match in Packaged Electron.

### RD106
No product source or canvas fallback occurs in packaged export.

### RD107
Device loss and relaunch leave zero stale broker, adaptation, tensor, stage, or final resources.

### RD108
Packaged output conservation and independent decode checks pass without Production Pointer mutation.

---

# 27. Mock and Semantic Runtime Requirements

Source bake shall execute actual module-level smoke tests for:

```text
Adaptive facade normalization
Adaptive policy digest
Adaptive canonical dispatch selection
EngineAuto legacy result identity
EngineAuto canonical result identity
Worker historical protocol normalization
Worker canonical protocol normalization
Worker zero-output rejection
Worker cancellation
Final publication receipt propagation
Preview tuple creation
Export tuple creation
Shared tuple comparison
Product source fallback rejection
Product canvas fallback rejection
```

Mocks may replace GPU execution only when they preserve:

- resource creation order,
- device epoch checks,
- stage receipt identity,
- publication order,
- pin and fence semantics.

Mock success shall not be reported as physical WGSL compilation.

---

# 28. Verification Artifacts

The bake shall generate:

```text
README_TDT_RESAMPLE_RUNTIME_01_R1D_APPLIED.md
specs/TDT-RESAMPLE-RUNTIME-01-R1D_..._SPEC.md
patches/TDT_RESAMPLE_RUNTIME_01_R1D_....diff
patches/TDT_RESAMPLE_RUNTIME_01_R1D_CHANGED_FILE_MANIFEST.json
artifacts/resample-runtime-01-r1d/source-bake/TDT_RESAMPLE_RUNTIME_01_R1D_SOURCE_RECEIPT.json
artifacts/resample-runtime-01-r1d/source-bake/TDT_RESAMPLE_RUNTIME_01_R1D_REGRESSION_SUMMARY.json
artifacts/resample-runtime-01-r1d/source-bake/TDT_RESAMPLE_RUNTIME_01_R1D_COMPATIBILITY_FIXTURE_MANIFEST.json
artifacts/resample-runtime-01-r1d/source-bake/TDT_RESAMPLE_RUNTIME_01_R1D_SHARED_SURFACE_FIXTURE_MANIFEST.json
artifacts/resample-runtime-01-r1d/source-bake/TDT_RESAMPLE_RUNTIME_01_R1D_WORKER_PROTOCOL_FIXTURE_MANIFEST.json
```

Physical verification shall additionally generate:

```text
TDT_RESAMPLE_RUNTIME_01_R1D_GPU_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R1D_ADAPTIVE_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R1D_ENGINEAUTO_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R1D_WORKER_BROKER_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R1D_SHARED_SURFACE_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R1D_PACKAGED_RECEIPT.json
```

---

# 29. Regression Requirements

R1D shall preserve and re-run:

- R1A source and semantic gates,
- R1B planner and multistage gates,
- R1C tensor and ellipse gates,
- Active Graph gate,
- GPU Device SSOT gate,
- Surface Lifecycle gate,
- Preview Presenter gate,
- Runtime R7 gate,
- Export Worker 01 through 07,
- Export Promotion 01 through 03,
- Build Lock,
- Build Emit,
- MODJPEG,
- Native Decoder,
- JXL Codec,
- PSD Decoder,
- Promotion Baseline source gate.

Any predecessor gate update shall be allowed only when R1D replaces a syntax-specific assertion with an equal or stronger semantic assertion.

The APPLIED README shall list every such change.

---

# 30. Success Criteria

R1D source bake succeeds only when:

```text
RD01..RD100 PASS
RD101..RD108 DEFERRED with explicit reason
R1A PASS
R1B PASS
R1C PASS
mock compatibility fixtures PASS
mock shared-surface fixtures PASS
worker protocol fixtures PASS
all changed JS/MJS/TS syntax checks PASS
all new WGSL assets manifested
no Production Pointer mutation
```

R1D full physical verification succeeds only when:

```text
RD101..RD108 PASS
canonical Windows x64 Packaged Electron PASS
canonical physical WebGPU device PASS
Adaptive canonical pixels PASS
EngineAuto direct parity PASS
Worker broker PASS
Preview·Export shared tuple PASS
source/canvas product fallback count = 0
device-loss and relaunch cleanup PASS
```

Source state:

```text
RESAMPLE_RUNTIME_R1D_SOURCE_BAKED_AWAITING_PACKAGED_GPU
```

Full verified unpromoted state:

```text
RESAMPLE_RUNTIME_R1D_VERIFIED_UNPROMOTED
```

Production promotion remains forbidden.

---

# 31. Required Follow-Up

R1D closes compatibility migration and shared-surface identity.

The next implementation stage shall be:

```text
TDT-RESAMPLE-RUNTIME-01-R2
Workgroup Tiled Tensor + EWA Optimization /
Uniform Barrier /
Baseline Pixel Parity /
GPU Timestamp and Memory Plateau Seal
```

R2 may optimize:

- tensor integration tiling,
- EWA source tile caching,
- workgroup shared-memory layout,
- bind-group reuse,
- uniform ring buffers,
- dispatch fusion.

R2 shall use the R1C and R1D direct/reference fixture corpus as its correctness baseline.

R2 shall not change:

- Adaptive compatibility policy semantics,
- EngineAuto requested/executed identity,
- Worker broker protocol,
- shared final surface tuple,
- Preview·Export consumer ownership.

---

# 32. Final Seal Statement

R1D is complete only when every compatibility surface tells the truth about what executed.

```text
Adaptive
→ policy adapter, not a second EWA engine

EngineAuto
→ explicit requested policy and executed kernel

Worker
→ broker, not a zero-output fake processor

Preview
→ exact final surface consumer

Export
→ exact same final surface consumer
```

A legacy WebGL Lanczos result may remain available so the old caller does not break.

It shall not be called canonical anisotropic EWA.

A Worker may return compatibility bytes when explicitly requested.

Those bytes shall not become the authoritative final surface.

An Adaptive policy may decide how strongly R1C responds to detail.

It shall not replace the integrated tensor or own a parallel image resampler.

Preview and Export need not execute at the same time.

They shall consume the same immutable final surface identity and the same resample receipt.

The pipeline remains alive throughout migration.

The compatibility shells become honest adapters around one WebGPU and WGSL product truth.
