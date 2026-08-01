# TDT-RUNTIME-SSOT-01-R7
## Exact API / Encoder Identity / Final Surface / Receipt Seal

- **Patch ID:** `TDT-RUNTIME-SSOT-01-R7`
- **Status:** Specification
- **Target:** DadumDadum renderer export authority, legacy encoder adoption, final-surface promotion, encoded-output verification, deterministic export evidence
- **Baseline:** `TDT-RUNTIME-SSOT-01-R1-R6`
- **Revises:** `TDT-RUNTIME-SSOT-01-R1` export and codec portions
- **Depends on:** `TDT-RUNTIME-SSOT-01-R1` through `R6`
- **Promotion class:** P0 export truth seal
- **Primary legacy encoder authority:** `window.ExportManager`
- **Primary runtime encoder authority:** `dadum.runtime.encoders`
- **Primary final-surface authority:** `dadum.runtime.pipeline`
- **Primary export authority:** `dadum.runtime.export`
- **Primary export proof:** per-job Export Receipt Truth Seal
- **Mutation policy:** direct source migration; no silent encoder substitution; no source-surface downgrade; no placeholder adoption
- **Compatibility policy:** legacy APIs may remain as compatibility facades, but product readiness and export truth belong only to the Runtime Services

---

# 0. Purpose

Seal a complete and mechanically verifiable export path from the authoritative final surface to the exact encoded bytes written to disk.

R7 must make the following statement true:

> DadumDadum may advertise encode or export capability only after the exact legacy `window.ExportManager` API has been adopted, at least one uniquely identified format encoder has been admitted, an authoritative final surface has been promoted into the Runtime Pipeline with a monotonic revision, the requested encoder has produced bytes whose MIME and signature match the selected format, and an Export Receipt has sealed the surface revision, encoder identity, output identity, and byte digest.

R7 is not an encoder rewrite.

## 0.1 Scope Lock

R7 changes authority contracts only. It does not migrate encoder implementations between the renderer and workers.

In scope:

- exact adoption of `window.ExportManager`,
- per-format Runtime encoder identity,
- zero-eligible-encoder fail-closed,
- final-surface promotion into `PipelineService`,
- exact encoded-output normalization and verification,
- deterministic Export Receipt sealing.

Out of scope and deferred to `TDT-EXPORT-WORKER-*`:

- Worker URL repair,
- unified encoder RPC,
- timeout, cancel, crash restart, and Worker epoch,
- JXL, JPEG, or PNG8 worker migration,
- PSD preprocessing and LCMS worker closure.

The legacy encoder implementations remain operational dependencies. R7 only removes ambiguity about which implementation, surface, options, and bytes became authoritative.

R7 is the authority bridge that prevents five current falsehoods:

1. a nonexistent legacy API being treated as the encoder backend,
2. an empty encoder registry being reported as `ACTIVE`,
3. a legacy filtered surface existing without a Runtime Pipeline binding,
4. a requested format being silently replaced by another format,
5. an export completing without proof of which surface and encoder produced the file.

---

# 1. Baseline Findings

## 1.1 Current Runtime EncoderRegistry adopts the wrong API

Current source:

```text
app/src/runtime/codecs/encoder-registry-service.ts
```

Current lookup:

```ts
legacy.DadumExportManager?.export
legacy.exportImage
```

The active legacy export authority is instead:

```ts
window.ExportManager.exportByFormat(format, payload)
window.ExportManager.listEncoders()
```

Therefore the current Runtime Encoder Registry does not adopt the actual product ExportManager.

## 1.2 Current Runtime registers one synthetic encoder identity

Current identity:

```text
dadum.encoder.legacy-dispatch-v1
```

This identity does not state:

- selected format,
- legacy registry key,
- encoder priority,
- lazy or realized state,
- expected MIME,
- expected extension,
- signature verifier,
- exact implementation revision.

A single generic dispatch identity cannot prove that JXL, PNG16, WebP, JPEG, or PSD is available.

## 1.3 Current encode module can become ACTIVE with zero usable encoders

Current activation publishes capability after `EncoderRegistryService.initialize()` without requiring a nonzero usable format count.

```text
dadum.module.encode-v1
→ ACTIVE
→ dadum.encode.registry published
```

This can occur while the only registered synthetic record reports `available() === false`.

That is a readiness contradiction.

## 1.4 Legacy ExportManager already has a concrete registry

Active legacy source:

```text
app/legacy-runtime/export_manager.js
```

Public API:

```ts
window.ExportManager.register(name, handler, priority)
window.ExportManager.registerLazy(name, loader, priority)
window.ExportManager.exportByFormat(format, payload)
window.ExportManager.listEncoders()
```

`listEncoders()` currently returns display labels:

```text
jxl (10)
webp-lossless (8)
png16 (7)
png (5)
```

The Runtime adoption layer must parse these labels only as a compatibility source. It must produce typed, canonical encoder records before capability publication.

## 1.5 Legacy ExportManager output shapes are heterogeneous

`exportByFormat()` may currently return:

```ts
{ u8: Uint8Array; mime: string; ext: string }
{ blob: Blob; mime: string; ext: string }
```

Its underlying handlers may produce:

```ts
Uint8Array
Blob
{ u8: Uint8Array; mime?: string; ext?: string }
{ blob: Blob; mime?: string; ext?: string }
```

The Runtime boundary must normalize all accepted shapes into one authoritative result type before signature verification.

## 1.6 Legacy ExportManager contains semantic fallback behavior

Current behavior can:

- strip display suffixes,
- reduce a request to a base format,
- choose a prefix-matching encoder,
- force PNG when source alpha is incompatible with the requested format.

These behaviors are useful for old UI compatibility but are forbidden inside the authoritative Runtime export path unless the substitution is explicit in the request and receipt.

A request for JPEG must not silently produce PNG and still be recorded as JPEG.

## 1.7 Legacy final output and Runtime final output are split

Legacy producers publish results into globals including:

```text
window.__DADUM_FILTERED_SURFACE__
window.__DADUM_FILTERED_EXPORT_SOURCE__
window.__DADUM_FILTERED_RGBA8__
```

The authoritative Runtime exporter requires:

```ts
PipelineService.requireFinal(expectedRevision)
```

No mandatory bridge currently promotes the legacy filtered result into `PipelineService.publishFinal()`.

Therefore the engine can finish processing while the Runtime exporter still sees:

```text
E_EXPORT_FINAL_SURFACE_MISSING
```

## 1.8 Legacy export payload resolver can downgrade to source or canvas

Current legacy resolution order includes:

```text
explicit payload
→ payload surface
→ filtered surface
→ filtered cache
→ source surface
→ canvas fallback
```

The authoritative Runtime export path must not use source surface or canvas fallback when a final result is expected.

Those fallback routes may remain only for explicitly named legacy or original-source export commands.

## 1.9 Current export result has no sealed per-job receipt

Current Runtime export returns:

```ts
{
  blobResourceId,
  url,
  mime
}
```

It does not seal:

- requested format,
- applied format,
- encoder ID,
- legacy key,
- final surface ID,
- source revision,
- final revision,
- pipeline receipt ID,
- output byte length,
- output SHA-256,
- signature verdict,
- option digest,
- alpha preservation decision.

R7 must add this proof.

---

# 2. Authority Model

R7 defines five non-overlapping authorities.

## 2.1 Legacy ExportManager Compatibility Authority

`window.ExportManager` owns:

- legacy encoder registration,
- legacy lazy loader realization,
- legacy encoder handler invocation,
- compatibility API for old scripts.

It does not own:

- Runtime module readiness,
- Runtime encoder identity,
- final surface authority,
- export job state,
- export receipt sealing,
- product-level fallback policy.

## 2.2 Runtime Encoder Registry Authority

`dadum.runtime.encoders` owns:

- exact adoption of the legacy ExportManager API,
- canonical format identity,
- one Runtime encoder ID per canonical format,
- encoder availability state,
- expected MIME and extension,
- output normalization,
- output signature verification,
- encoder-set digest.

## 2.3 Runtime Pipeline Authority

`dadum.runtime.pipeline` owns:

- source revision binding,
- final revision allocation,
- final surface Resource ID,
- pipeline receipt binding,
- stale revision rejection,
- placeholder rejection.

Legacy globals may mirror the final surface but cannot become the product authority.

## 2.4 Runtime Export Authority

`dadum.runtime.export` owns:

- export job creation,
- exact encoder selection,
- authoritative final-surface binding,
- encode invocation,
- output verification,
- Blob resource registration,
- object URL lifecycle,
- Export Receipt creation.

## 2.5 Export Receipt Authority

The Export Receipt owns the immutable answer to:

```text
Which final surface revision
was encoded by which exact encoder
with which exact request
into which exact bytes?
```

Telemetry such as wall-clock time and duration must remain outside the deterministic seal payload.

---

# 3. Required Runtime Flow

```text
Legacy encoder scripts
→ window.ExportManager registry complete
→ Runtime EncoderRegistry exact adoption
→ nonzero eligible encoder set
→ encode capability publication

Legacy processing producer
→ Legacy Final Surface Promotion Bridge
→ surface contract validation
→ Runtime Pipeline final revision allocation
→ Resource Registry final-surface registration
→ legacy mirror update
→ processing store projection

Export command
→ expected final revision
→ exact Runtime encoder ID
→ authoritative final surface resolve
→ exact legacy encoder call
→ output envelope normalization
→ MIME verification
→ magic signature verification
→ output SHA-256
→ Export Receipt seal
→ Blob resource and object URL
→ export store projection
```

No edge in this graph may be replaced by a silent downgrade.

---

# 4. Exact Legacy ExportManager Adoption Contract

## 4.1 Required legacy global

At Runtime Encoder Registry initialization, the following object must exist:

```ts
interface LegacyExportManagerV1 {
  register(name: string, handler: LegacyEncoderHandler, priority?: number): void;
  registerLazy(name: string, loader: LegacyEncoderLoader, priority?: number): void;
  exportByFormat(format: string, payload?: Record<string, unknown>): Promise<unknown>;
  listEncoders(): string[];
}
```

The Runtime must reject the following substitutes:

```text
window.DadumExportManager
window.exportImage
window.exportManager.default
window.DadumExport.export
```

Those names may exist for legacy compatibility but are not the R7 adoption authority.

## 4.2 Manager identity proof

The legacy manager must publish a stable identity record.

```ts
interface LegacyExportManagerIdentity {
  apiId: 'dadum.legacy.export-manager';
  apiVersion: 1;
  implementationId: string;
  registryRevision: number;
}
```

Required global field:

```ts
window.ExportManager.identity
```

Example:

```json
{
  "apiId": "dadum.legacy.export-manager",
  "apiVersion": 1,
  "implementationId": "export-manager-js-v1",
  "registryRevision": 12
}
```

The registry revision must increment when any encoder is registered, unregistered, replaced, or reprioritized.

## 4.3 Exact encoder descriptor API

R7 adds a non-breaking descriptor method:

```ts
interface LegacyEncoderDescriptor {
  name: string;
  priority: number;
  state: 'READY' | 'LAZY';
  hasHandler: boolean;
  hasLoader: boolean;
}

interface LegacyExportManagerV1R7 extends LegacyExportManagerV1 {
  listEncoderRecords(): LegacyEncoderDescriptor[];
}
```

`listEncoders()` remains for existing UI.

The Runtime Registry must use `listEncoderRecords()` when present.

Production promotion requires it.

Parsing `"name (priority)"` is allowed only in development compatibility mode and must mark the build non-promotable.

## 4.4 Exact invocation API

R7 adds:

```ts
interface LegacyExactExportEnvelope {
  requestedFormat: string;
  appliedFormat: string;
  legacyEncoderKey: string;
  registryRevision: number;
  mime: string;
  ext: string;
  blob?: Blob;
  u8?: Uint8Array;
  appliedOptions?: Record<string, unknown>;
  encoderEvidence?: Record<string, unknown>;
}

interface LegacyExportManagerV1R7 {
  exportByFormatExact(
    format: string,
    payload?: Record<string, unknown>,
  ): Promise<LegacyExactExportEnvelope>;
}
```

The authoritative Runtime path must call `exportByFormatExact()`.

`exportByFormat()` remains available to legacy UI and may preserve compatibility fallback behavior.

## 4.5 Exact mode rules

`exportByFormatExact()` must:

- normalize casing and trim whitespace,
- reject display labels containing priority suffixes,
- reject unknown keys,
- reject prefix fallback,
- reject base-format fallback,
- reject automatic alpha-driven format substitution,
- realize the selected lazy encoder only,
- return the actual applied format,
- return the actual legacy encoder key,
- return the registry revision used for selection.

The following is forbidden:

```text
request: jpeg
actual: png
receipt: jpeg
```

The following is valid only as an explicit user decision before invocation:

```text
UI detects alpha incompatibility
→ user selects png
→ request: png
→ applied: png
```

---

# 5. Canonical Per-Format Encoder Identity

## 5.1 Runtime encoder record

```ts
export type EncoderAvailability =
  | 'READY'
  | 'LAZY'
  | 'UNAVAILABLE';

export interface RuntimeEncoderRecord {
  id: string;
  canonicalFormat: string;
  legacyEncoderKey: string;
  legacyManagerImplementationId: string;
  registryRevision: number;
  priority: number;
  availability: EncoderAvailability;
  mime: string;
  extension: string;
  supportsAlpha: boolean;
  supportsBitDepths: readonly number[];
  deterministicClass: 'BYTE_DETERMINISTIC' | 'OUTPUT_VERIFIED_ONLY';
  encode(
    input: AuthoritativeExportInput,
    options: Readonly<Record<string, unknown>>,
  ): Promise<NormalizedEncodedOutput>;
}
```

## 5.2 Canonical identities

Minimum mapping:

| Legacy key | Runtime encoder ID | Canonical format | MIME | Extension |
|---|---|---|---|---|
| `jxl` | `dadum.encoder.jxl.v1` | `jxl` | `image/jxl` | `jxl` |
| `webp` | `dadum.encoder.webp.v1` | `webp` | `image/webp` | `webp` |
| `webp-lossless` | `dadum.encoder.webp-lossless.v1` | `webp-lossless` | `image/webp` | `webp` |
| `png` | `dadum.encoder.png.v1` | `png` | `image/png` | `png` |
| `png16` | `dadum.encoder.png16.v1` | `png16` | `image/png` | `png` |
| `jpg` | `dadum.encoder.jpg.v1` | `jpg` | `image/jpeg` | `jpg` |
| `psd` | `dadum.encoder.psd.v1` | `psd` | `image/vnd.adobe.photoshop` | `psd` |

`jpeg` is an input alias resolved before encoder selection.

It must not create a second Runtime encoder record unless a genuinely different encoder implementation exists.

## 5.3 Identity uniqueness

The following must each be unique within one Runtime epoch:

- Runtime encoder ID,
- canonical format,
- exact legacy encoder key.

Duplicate canonical formats are forbidden unless an explicit selection policy exists and the records have different qualified IDs.

Example of allowed qualified identities:

```text
dadum.encoder.webp.libwebp-v3
dadum.encoder.webp.browser-v1
```

In that case one policy-owned active identity must be selected before capability publication.

## 5.4 Encoder-set digest

The Runtime Registry must canonicalize and hash:

```json
{
  "managerImplementationId": "export-manager-js-v1",
  "registryRevision": 12,
  "encoders": [
    {
      "id": "dadum.encoder.jxl.v1",
      "canonicalFormat": "jxl",
      "legacyEncoderKey": "jxl",
      "priority": 10,
      "availability": "LAZY",
      "mime": "image/jxl",
      "extension": "jxl"
    }
  ]
}
```

The digest becomes part of:

```text
dadum.encode.registry capability implementationId
Boot Receipt service evidence
Export Receipt encoder evidence
```

---

# 6. Zero-Encoder Fail-Closed

## 6.1 Eligibility definition

An encoder is eligible when all are true:

- identity is canonical,
- legacy key is unique,
- MIME is known,
- extension is known,
- signature verifier exists,
- manager record is `READY` or `LAZY`,
- exact invocation API is available.

## 6.2 Required activation behavior

```ts
await encoders.initialize();

if (encoders.eligibleCount() === 0) {
  throw new StableRuntimeError(
    'E_CODEC_ZERO_ENCODERS',
    'Legacy ExportManager exposed zero eligible encoders',
  );
}
```

## 6.3 Capability publication rule

The capability:

```text
dadum.encode.registry
```

must not be published until:

```text
manager API verified
AND manager identity verified
AND descriptor set validated
AND eligible encoder count > 0
AND encoder-set digest sealed
```

## 6.4 Module status rule

`dadum.module.encode-v1` may report:

```text
ACTIVE
```

only when at least one eligible encoder exists.

Otherwise the required module fails and terminal state becomes:

```text
SAFE_DIAGNOSTIC
```

The UI may remain visible, but processing-to-export actions must be disabled.

## 6.5 Required UI evidence

The Safe Diagnostic view must show:

- manager API status,
- manager implementation ID,
- registry revision,
- discovered record count,
- eligible record count,
- rejected records and stable reasons.

---

# 7. Legacy Final Surface Promotion Bridge

## 7.1 Purpose

The bridge converts a legacy processing result into an authoritative Runtime Pipeline binding exactly once per final revision.

It does not copy product authority back into legacy globals.

## 7.2 Bridge ownership

New service:

```text
dadum.runtime.legacy-final-surface-bridge
```

Owning module:

```text
dadum.module.pipeline-v1
```

The bridge depends on:

- `ResourceRegistryService`,
- `PipelineService`,
- `DiagnosticsService`,
- current document source revision provider.

## 7.3 Legacy producer API

The Runtime installs one bridge function before legacy processing can publish output.

```ts
interface LegacyFinalSurfacePublishInput {
  surface: unknown;
  producerModuleId: string;
  exportSource: string;
  pipelineReceiptId: string;
  sourceRevision: number;
  evidence?: Record<string, unknown>;
}

interface DadumRuntimeBridge {
  publishLegacyFinalSurface(
    input: LegacyFinalSurfacePublishInput,
  ): Promise<FinalSurfacePromotionResult>;
}
```

Global compatibility exposure:

```ts
window.DadumRuntimeBridge
```

This global is a Runtime-owned facade. It is not stored in Pinia.

## 7.4 Direct-write retirement

After R7, active product paths must not directly assign:

```text
window.__DADUM_FILTERED_SURFACE__
window.__DADUM_FILTERED_EXPORT_SOURCE__
window.__DADUM_FILTERED_RGBA8__
```

Instead they call:

```ts
await window.DadumRuntimeBridge.publishLegacyFinalSurface(...)
```

The bridge updates the old globals only after successful Runtime publication.

Those globals become compatibility mirrors.

## 7.5 Promotion order

```text
candidate received
→ producer identity validated
→ source revision validated
→ surface contract normalized
→ placeholder rejected
→ dimensions validated
→ storage validated
→ data length or resource handle validated
→ final revision allocated by PipelineService
→ final-surface resource registered
→ Pipeline binding committed
→ legacy mirror globals updated
→ processing store projected
→ promotion receipt emitted
```

If any stage fails, legacy mirror globals must not advance to the failed candidate.

## 7.6 Surface contract

Minimum CPU surface:

```ts
interface CpuFinalSurface {
  width: number;
  height: number;
  storage:
    | 'rgba8unorm'
    | 'rgba8unorm-srgb'
    | 'rgba16float'
    | 'rgba16-direct';
  data: Uint8Array | Uint16Array;
  alphaMode: 'straight' | 'premultiplied' | 'opaque';
  resolution?: {
    dpi?: number;
    xDpi?: number;
    yDpi?: number;
    source?: string;
  };
  colorContract?: Record<string, unknown>;
}
```

Minimum GPU surface handle:

```ts
interface GpuFinalSurfaceHandle {
  width: number;
  height: number;
  storage: 'gpu-texture';
  textureResourceId: string;
  format: GPUTextureFormat;
  alphaMode: 'straight' | 'premultiplied' | 'opaque';
  colorContract: Record<string, unknown>;
}
```

Raw `GPUTexture` must not be placed into Pinia or a receipt.

## 7.7 Revision ownership

Legacy producers provide only `sourceRevision`.

They do not provide the authoritative `finalRevision`.

`PipelineService` allocates the next monotonic final revision.

```ts
publishFinalCandidate(input): FinalSurfaceBinding
```

Required invariant:

```text
next.finalRevision > previous.finalRevision
```

A source revision older than the current active document revision must fail.

## 7.8 No source fallback

The bridge must reject candidates that identify themselves as:

```text
source-surface
canvas-2d-fallback
original-input
```

unless the command is explicitly `Export Original` and bypasses the final-surface export authority.

## 7.9 Legacy mirror contract

After successful promotion:

```ts
window.__DADUM_FILTERED_SURFACE__ = promotedCompatibilitySurface;
window.__DADUM_FILTERED_EXPORT_SOURCE__ = promotedCompatibilityPayload;
window.__DADUM_FILTERED_RGBA8__ = optionalRgba8Mirror;
```

Each mirror must carry:

```ts
{
  runtimeSurfaceId: string;
  sourceRevision: number;
  finalRevision: number;
  pipelineReceiptId: string;
}
```

The mirror is never read as authority by the new Runtime exporter.

---

# 8. Authoritative Export Input Contract

```ts
interface AuthoritativeExportInput {
  surfaceId: string;
  sourceRevision: number;
  finalRevision: number;
  pipelineReceiptId: string;
  surface: unknown;
  exportSource: 'runtime-final-surface';
}
```

`ExportAuthorityService` must construct this input only from:

```ts
PipelineService.requireFinal(expectedRevision)
ResourceRegistryService.resolve(surfaceId, 'final-surface')
```

The Runtime encoder adapter must not independently inspect:

```text
window.__DADUM_FILTERED_SURFACE__
window.__DADUM_SOURCE_SURFACE__
canvas elements
```

All compatibility payload construction belongs inside the exact Legacy ExportManager adapter and must begin from the authoritative surface passed by Runtime.

---

# 9. Encoded Output Normalization

## 9.1 Normalized result

```ts
interface NormalizedEncodedOutput {
  requestedFormat: string;
  appliedFormat: string;
  runtimeEncoderId: string;
  legacyEncoderKey: string;
  managerImplementationId: string;
  registryRevision: number;
  blob: Blob;
  mime: string;
  extension: string;
  byteLength: number;
  appliedOptions: Readonly<Record<string, unknown>> | null;
  encoderEvidence: Readonly<Record<string, unknown>> | null;
}
```

## 9.2 Accepted legacy exact envelope

Exactly one of these must exist:

```text
blob
u8
```

Both absent is failure.

Both present is failure unless their bytes are proven identical.

R7 should prefer a single output field.

## 9.3 MIME normalization

The Runtime must not trust `Blob.type` alone.

It compares:

```text
encoder expected MIME
legacy envelope MIME
Blob MIME
magic signature
```

All must agree after canonical MIME alias normalization.

Allowed aliases must be explicitly listed.

Example:

```text
image/jpeg
image/jpg
```

Canonical output remains:

```text
image/jpeg
```

## 9.4 Extension normalization

The extension is derived from the Runtime encoder record.

The legacy envelope extension is evidence only and must match the canonical extension.

## 9.5 Format identity match

Required invariant:

```text
requested canonical format
=
applied canonical format
=
Runtime encoder canonical format
```

Any mismatch fails with no download URL.

---

# 10. Signature Verification

## 10.1 Required signatures

| Format | Required signature |
|---|---|
| PNG / PNG16 | `89 50 4E 47 0D 0A 1A 0A` |
| JPEG | `FF D8 FF` |
| WebP | `RIFF` at 0 and `WEBP` at 8 |
| JXL codestream | `FF 0A` |
| JXL container | `00 00 00 0C 4A 58 4C 20 0D 0A 87 0A` |
| PSD | `38 42 50 53` (`8BPS`) |

## 10.2 PNG16 distinction

PNG16 uses the PNG signature.

Therefore signature verification alone does not prove 16-bit depth.

The PNG verifier for `png16` must parse IHDR and require:

```text
bit depth = 16
color type compatible with requested output
```

If the result is PNG8, export fails as a format-depth mismatch.

## 10.3 JXL distinction

The verifier must support both raw codestream and container signatures.

Receipt records:

```text
jxlContainerKind: codestream | container
```

## 10.4 Verification read limit

The verifier may inspect only the minimum required prefix plus format metadata chunks.

It must not duplicate the entire Blob merely to check a signature.

---

# 11. Export Job State Machine

```text
CREATED
→ FINAL_SURFACE_BOUND
→ ENCODER_BOUND
→ ENCODING
→ OUTPUT_NORMALIZED
→ SIGNATURE_VERIFIED
→ OUTPUT_DIGESTED
→ RECEIPT_SEALED
→ READY
```

Failure from any nonterminal state:

```text
FAILED
```

No transition from `FAILED` to `READY` is allowed.

## 11.1 State requirements

### CREATED

Contains:

- export job ID,
- requested canonical format,
- requested encoder ID,
- expected final revision,
- canonical options digest.

### FINAL_SURFACE_BOUND

Contains:

- final surface ID,
- source revision,
- final revision,
- pipeline receipt ID.

### ENCODER_BOUND

Contains:

- Runtime encoder ID,
- legacy key,
- manager implementation ID,
- registry revision,
- encoder-set digest.

### OUTPUT_NORMALIZED

Contains:

- canonical MIME,
- canonical extension,
- byte length,
- applied format.

### SIGNATURE_VERIFIED

Contains verifier ID and result.

### OUTPUT_DIGESTED

Contains output SHA-256.

### RECEIPT_SEALED

Contains Export Receipt ID and seal SHA-256.

---

# 12. Export Receipt Truth Seal

## 12.1 Deterministic seal payload

```ts
interface ExportReceiptSealPayload {
  schemaVersion: 1;
  patchId: 'TDT-RUNTIME-SSOT-01-R7';
  appId: 'com.dadumdadum.app';
  buildId: string;
  runtimeEpoch: number;

  exportJobId: string;

  sourceRevision: number;
  finalRevision: number;
  finalSurfaceId: string;
  pipelineReceiptId: string;
  surfaceContractDigest: string;

  requestedFormat: string;
  appliedFormat: string;
  runtimeEncoderId: string;
  legacyEncoderKey: string;
  managerImplementationId: string;
  managerRegistryRevision: number;
  encoderSetDigest: string;

  requestedOptionsDigest: string;
  appliedOptionsDigest: string | null;
  appliedOptionsAuthority:
    | 'ENCODER_REPORTED'
    | 'ADAPTER_REPORTED'
    | 'NOT_REPORTED';

  mime: string;
  extension: string;
  byteLength: number;
  outputSha256: string;
  signatureVerifierId: string;
  signatureVerified: true;

  alphaMode: string;
  alphaPreservation: 'PRESERVED' | 'NOT_APPLICABLE' | 'EXPLICITLY_DROPPED';

  exportSource: 'runtime-final-surface';
}
```

## 12.2 Export job ID

The job ID must not be a random UUID inside the deterministic seal.

It is derived from:

```text
buildId
+ runtimeEpoch
+ finalSurfaceId
+ finalRevision
+ runtimeEncoderId
+ requestedOptionsDigest
```

Telemetry may include a random attempt UUID outside the seal.

## 12.3 Surface contract digest

The digest includes only stable surface metadata:

- width,
- height,
- storage,
- alpha mode,
- color contract,
- source revision,
- final revision.

It must not serialize live GPU objects or full pixel data.

The actual output bytes are independently sealed by `outputSha256`.

## 12.4 Requested options digest

Canonical JSON is required.

Undefined fields are removed.

Object keys use deterministic code-unit ordering.

Numbers must reject `NaN`, `Infinity`, and `-Infinity`.

## 12.5 Applied options truth

Production promotion requires active encoder adapters to report applied options for all behavior-changing fields.

Examples:

- quality,
- lossless,
- near-lossless level,
- bit depth,
- chroma mode,
- ICC embedding,
- DPI metadata,
- alpha handling.

If an encoder cannot report applied options:

```text
appliedOptionsAuthority = NOT_REPORTED
```

The export may be allowed in development, but the build is non-promotable for that encoder.

## 12.6 Receipt ID

```text
export-receipt:<first 24 hex of sealSha256>
```

## 12.7 Telemetry envelope

Excluded from the deterministic seal:

- wall-clock start,
- wall-clock end,
- duration,
- memory use,
- user agent,
- raw stack,
- object URL.

---

# 13. Export Receipt Ledger

The current boot `ReceiptService` stores one receipt.

R7 requires a separate or extended ledger capable of storing multiple export receipts per Runtime epoch.

## 13.1 Required API

```ts
interface ExportReceiptLedgerService extends RuntimeService {
  publish(receipt: ExportReceipt): string;
  read(receiptId: string): ExportReceipt | null;
  list(): ExportReceiptSummary[];
  revoke(receiptId: string): void;
}
```

## 13.2 Ownership

Service ID:

```text
dadum.runtime.export-receipts
```

Owning module:

```text
dadum.module.export-v1
```

## 13.3 Store projection

Pinia stores only:

```text
lastReceiptId
lastBlobResourceId
lastErrorCode
```

The full receipt remains in the Runtime ledger.

---

# 14. Runtime Module Changes

## 14.1 Encode module

New activation requirements:

```text
legacy adapter ACTIVE
→ exact ExportManager available
→ manager identity valid
→ exact descriptor API valid
→ eligible encoder count > 0
→ encoder-set digest sealed
→ capability publish
```

Implementation ID:

```text
dadum-encoder-registry-r7:<encoderSetDigest-prefix>
```

## 14.2 Pipeline module

Adds service:

```text
dadum.runtime.legacy-final-surface-bridge
```

Capability evidence includes:

```json
{
  "legacyFinalSurfaceBridge": "ACTIVE",
  "directLegacyFinalWritesAllowed": false,
  "finalRevisionAuthority": "dadum.runtime.pipeline"
}
```

## 14.3 Export module

Depends on:

- pipeline authority,
- encoder registry,
- resource registry,
- export receipt ledger.

Implementation ID:

```text
dadum-final-surface-export-r7
```

It may activate only when encode and pipeline capabilities are already active.

---

# 15. Stable Error Codes

R7 adds:

```ts
| 'E_EXPORT_MANAGER_UNAVAILABLE'
| 'E_EXPORT_MANAGER_API_MISMATCH'
| 'E_EXPORT_MANAGER_IDENTITY_MISSING'
| 'E_CODEC_ZERO_ENCODERS'
| 'E_CODEC_DESCRIPTOR_INVALID'
| 'E_CODEC_IDENTITY_COLLISION'
| 'E_CODEC_FORMAT_MISMATCH'
| 'E_CODEC_RESULT_EMPTY'
| 'E_CODEC_RESULT_AMBIGUOUS'
| 'E_CODEC_EXTENSION_MISMATCH'
| 'E_CODEC_BIT_DEPTH_MISMATCH'
| 'E_EXPORT_ALPHA_UNSUPPORTED'
| 'E_EXPORT_FINAL_SURFACE_PROMOTION_FAILED'
| 'E_EXPORT_FINAL_SURFACE_DIRECT_WRITE'
| 'E_EXPORT_SOURCE_REVISION_STALE'
| 'E_EXPORT_RECEIPT_INCOMPLETE'
| 'E_EXPORT_OUTPUT_DIGEST_FAILED'
```

Existing codes retained:

```text
E_EXPORT_FINAL_SURFACE_MISSING
E_EXPORT_STALE_SURFACE_REVISION
E_CODEC_UNAVAILABLE
E_CODEC_SIGNATURE_MISMATCH
E_RUNTIME_PLACEHOLDER_REJECTED
```

---

# 16. No Silent Fallback Policy

## 16.1 Forbidden Runtime fallback

The authoritative Runtime path must not:

- choose a prefix-matching encoder,
- choose the highest-priority encoder of another key,
- change JPEG to PNG because alpha exists,
- change WebP to PNG because the WebP loader failed,
- export the source surface when final surface is missing,
- use a canvas because the final surface cannot be resolved,
- accept a MIME that differs from the selected encoder,
- accept a file extension that differs from the selected encoder.

## 16.2 Explicit policy decisions

A format change is legal only before the encode job begins.

Example:

```text
requested UI format: jpg
source contains alpha
→ policy returns E_EXPORT_ALPHA_UNSUPPORTED
→ UI asks user to choose png/webp/jxl/psd
→ new export job requests png
```

The original job remains failed.

## 16.3 Legacy compatibility path

Legacy UI may continue using `exportByFormat()` with old fallback behavior during migration.

Such exports must be marked:

```text
authority = LEGACY_COMPATIBILITY
receipt = unavailable
promotable = false
```

The product UI must migrate to Runtime Export Authority before R7 promotion.

---

# 17. Static Gates

## GATE-R7-01 Exact Manager API Gate

Fail if Runtime source references:

```text
DadumExportManager?.export
window.exportImage
exportManager.default
```

for authoritative encoder adoption.

Require references to:

```text
window.ExportManager.identity
window.ExportManager.listEncoderRecords
window.ExportManager.exportByFormatExact
```

## GATE-R7-02 Per-Format Identity Gate

Fail if only a generic legacy-dispatch encoder exists.

Require at least one canonical per-format encoder record.

## GATE-R7-03 Zero-Encoder Fail-Closed Gate

Fixture with zero legacy encoders must produce:

```text
E_CODEC_ZERO_ENCODERS
```

and must not publish `dadum.encode.registry`.

## GATE-R7-04 Duplicate Identity Gate

Duplicate canonical format or Runtime encoder ID must fail.

## GATE-R7-05 Exact Format Gate

Unknown format and prefix-only format must fail.

No prefix fallback is allowed.

## GATE-R7-06 Direct Final Global Write Gate

Active product source must not directly assign filtered final globals outside the bridge implementation.

## GATE-R7-07 Final Surface Promotion Gate

Every final-result producer must invoke the Runtime bridge.

## GATE-R7-08 Source Downgrade Gate

Runtime export source code must not read source surface or canvas fallback globals.

## GATE-R7-09 Output Shape Gate

Zero-output and dual-output envelopes must fail.

## GATE-R7-10 MIME and Signature Gate

Each format fixture must pass both MIME and magic verification.

Cross-format fixtures must fail.

## GATE-R7-11 PNG16 IHDR Gate

PNG8 bytes returned by the PNG16 encoder identity must fail.

## GATE-R7-12 Export Receipt Completeness Gate

Every READY export must include all mandatory receipt fields.

## GATE-R7-13 Export Receipt Digest Gate

Mutating any sealed field must change the seal.

## GATE-R7-14 Export Receipt Determinism Gate

The same stable input fixture must produce the same canonical receipt seal 100/100 times when the encoder is byte-deterministic.

## GATE-R7-15 Boot Receipt Truth Gate

Boot Receipt must contain:

- encoder eligible count,
- encoder-set digest,
- manager implementation ID,
- manager registry revision,
- final-surface bridge state.

`ACTIVE` with eligible count zero is forbidden.

---

# 18. Runtime Test Matrix

| Test ID | Scenario | Expected result |
|---|---|---|
| R7-T01 | ExportManager absent | `E_EXPORT_MANAGER_UNAVAILABLE` |
| R7-T02 | Wrong API shape | `E_EXPORT_MANAGER_API_MISMATCH` |
| R7-T03 | Identity missing | `E_EXPORT_MANAGER_IDENTITY_MISSING` |
| R7-T04 | No encoder records | `E_CODEC_ZERO_ENCODERS` |
| R7-T05 | One ready PNG encoder | encode capability ACTIVE |
| R7-T06 | One lazy JXL encoder | registry ACTIVE, realization deferred |
| R7-T07 | Duplicate PNG identity | `E_CODEC_IDENTITY_COLLISION` |
| R7-T08 | Request unknown `web` | exact format failure |
| R7-T09 | Request `webp`, only `webp-lossless` exists | no prefix fallback; failure |
| R7-T10 | JPEG request with alpha | `E_EXPORT_ALPHA_UNSUPPORTED` |
| R7-T11 | Final surface missing | `E_EXPORT_FINAL_SURFACE_MISSING` |
| R7-T12 | Expected revision stale | `E_EXPORT_STALE_SURFACE_REVISION` |
| R7-T13 | Legacy source revision stale | `E_EXPORT_SOURCE_REVISION_STALE` |
| R7-T14 | Placeholder candidate | `E_RUNTIME_PLACEHOLDER_REJECTED` |
| R7-T15 | Valid rgba8 final surface | promotion succeeds |
| R7-T16 | Valid rgba16float final surface | promotion succeeds |
| R7-T17 | Invalid data length | promotion fails |
| R7-T18 | Direct final global write detected | static gate failure |
| R7-T19 | PNG encoder returns JPEG bytes | `E_CODEC_SIGNATURE_MISMATCH` |
| R7-T20 | PNG16 encoder returns PNG8 | `E_CODEC_BIT_DEPTH_MISMATCH` |
| R7-T21 | JXL raw codestream | verified |
| R7-T22 | JXL container | verified |
| R7-T23 | PSD signature | verified |
| R7-T24 | Envelope has neither blob nor u8 | `E_CODEC_RESULT_EMPTY` |
| R7-T25 | Envelope has both nonidentical outputs | `E_CODEC_RESULT_AMBIGUOUS` |
| R7-T26 | Applied format differs | `E_CODEC_FORMAT_MISMATCH` |
| R7-T27 | Extension differs | `E_CODEC_EXTENSION_MISMATCH` |
| R7-T28 | Receipt output hash changed | seal changes |
| R7-T29 | Same deterministic fixture 100 runs | 100/100 seal parity |
| R7-T30 | Device/runtime epoch changes | old surface resource rejected |
| R7-T31 | Registry revision changes mid-export | export fails or restarts before encode |
| R7-T32 | Object URL dispose | URL revoked |
| R7-T33 | Export store projection | only IDs and stable code stored |
| R7-T34 | Legacy compatibility export | no Runtime truth receipt; non-promotable |

---

# 19. Required File Changes

## 19.1 Runtime encoder adoption

```text
app/src/runtime/codecs/encoder-registry-service.ts
```

Replace synthetic dispatch record with exact ExportManager adoption and per-format records.

## 19.2 Legacy ExportManager exact extensions

```text
app/legacy-runtime/export_manager.js
```

Add:

- stable manager identity,
- registry revision,
- `listEncoderRecords()`,
- `exportByFormatExact()`,
- exact result envelope.

Preserve existing APIs for migration.

## 19.3 Final surface bridge

Add:

```text
app/src/runtime/pipeline/legacy-final-surface-bridge-service.ts
```

## 19.4 Pipeline revision allocation

Modify:

```text
app/src/runtime/pipeline/pipeline-service.ts
```

Add internal monotonic final revision allocation and candidate publication API.

## 19.5 Legacy producer migration

Modify active writers including:

```text
app/legacy-runtime/main.js
app/legacy-runtime/input/offscreen_surface_ssot.js
```

Replace direct filtered final global publication with bridge calls.

Any additional active writer discovered by static scan must also migrate.

## 19.6 Export authority

Modify:

```text
app/src/runtime/export/export-authority-service.ts
```

Add job state, exact encode, normalization, signature verification, SHA-256, receipt seal, and ledger publication.

## 19.7 Export receipt ledger

Add:

```text
app/src/runtime/export/export-receipt-ledger-service.ts
app/src/runtime/export/export-receipt.ts
```

## 19.8 Runtime composition

Modify:

```text
app/src/boot/runtime-modules.ts
app/src/runtime/service-token.ts
app/src/boot/runtime-receipt.ts
app/src/boot/stable-error.ts
```

## 19.9 Pinia projection

Modify only as needed:

```text
app/src/stores/export.store.ts
app/src/stores/processing.store.ts
```

No Blob, File, typed array, surface object, or live receipt object may enter Pinia.

## 19.10 Gates

Add scripts for:

```text
R7 exact manager API
R7 zero-encoder fail-closed
R7 final-surface bridge ownership
R7 signature matrix
R7 export receipt determinism
```

---

# 20. Migration Sequence

## Phase R7-A: Legacy Manager Identity

- add identity,
- add registry revision,
- add typed descriptor output,
- keep old API behavior unchanged.

## Phase R7-B: Exact Export API

- add exact selection,
- forbid fallback in exact mode,
- return exact envelope,
- add manager fixtures.

## Phase R7-C: Runtime Per-Format Adoption

- replace generic dispatch,
- register canonical format identities,
- seal encoder-set digest,
- enforce zero-encoder fail-closed.

## Phase R7-D: Final Surface Bridge

- install bridge before legacy processing,
- migrate direct writers,
- allocate final revisions centrally,
- keep legacy globals as mirrors.

## Phase R7-E: Runtime Export Job

- bind final surface,
- bind encoder,
- normalize bytes,
- verify MIME/signature,
- register Blob.

## Phase R7-F: Export Receipt Seal

- output SHA-256,
- canonical receipt,
- ledger,
- store projection.

## Phase R7-G: Product UI Adoption

- route export button through Runtime Export Authority,
- disable legacy direct download path in product mode,
- retain explicit compatibility mode for diagnosis only.

## Phase R7-H: Promotion

- run all static gates,
- run exact encoder fixtures,
- run real Electron smoke,
- export one fixture per enabled format,
- compare receipt to output file signatures.

---

# 21. Promotion Criteria

R7 is promotable only when all are true:

```text
[ ] window.ExportManager exact API identity verified
[ ] listEncoderRecords() available in production
[ ] exportByFormatExact() available in production
[ ] eligible encoder count > 0
[ ] generic legacy-dispatch identity removed
[ ] per-format Runtime identities sealed
[ ] encoder-set digest present in Boot Receipt
[ ] zero-encoder fixture fails closed
[ ] all active final producers use promotion bridge
[ ] direct filtered-final global writes absent outside bridge
[ ] Pipeline owns final revision allocation
[ ] source and canvas fallback absent from Runtime export path
[ ] requested format equals applied format
[ ] MIME matches selected encoder
[ ] extension matches selected encoder
[ ] magic signature passes
[ ] PNG16 IHDR bit depth verified
[ ] output SHA-256 sealed
[ ] Export Receipt complete
[ ] Export Receipt ledger active
[ ] Pinia stores IDs only
[ ] product export button uses Runtime authority
[ ] Electron smoke exports all enabled formats
[ ] no `ACTIVE` encode module with zero eligible encoders
```

---

# 22. Non-Promotion Conditions

The following force `SOURCE_BAKED_UNPROMOTED` or `RUNTIME_FAILED`:

- exact manager API absent,
- descriptor API parsed only from display labels in production,
- zero eligible encoders,
- generic dispatch remains the only identity,
- direct final global writes remain,
- final surface promotion bridge not called,
- source fallback used by Runtime export,
- applied format differs from requested format,
- MIME or signature mismatch,
- PNG16 not proven 16-bit,
- output digest missing,
- receipt mandatory field missing,
- Electron export smoke not executed.

---

# 23. Rollback Policy

R7 rollback may restore the previous source tree, but it must not:

- preserve an R7 Boot Receipt while using R6 export code,
- preserve R7 encoder-set digest after registry rollback,
- reuse R7 Export Receipts against different output bytes,
- silently route product UI back to legacy compatibility export.

Rollback state must be explicit:

```text
exportAuthority = LEGACY_COMPATIBILITY
promotable = false
```

---

# 24. Required Receipt Artifacts

```text
artifacts/runtime/TDT_RUNTIME_SSOT_01_R7_FIX_RECEIPT.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R7_ENCODER_SET.json
artifacts/runtime/TDT_RUNTIME_SSOT_01_R7_ENCODER_SET.sha256
artifacts/runtime/TDT_RUNTIME_SSOT_01_R7_EXPORT_FIXTURE_RECEIPTS.jsonl
artifacts/runtime/TDT_RUNTIME_SSOT_01_R7_FINAL_VERIFY.txt
artifacts/runtime/TDT_RUNTIME_SSOT_01_R7_FILE_INVENTORY.sha256
```

Each real exported fixture must retain:

```text
encoded file
matching Export Receipt JSON
encoded file SHA-256
receipt SHA-256
```

---

# 25. Final PASS Marker

The following marker may be emitted only after source gates, type checks, Vite production build, Electron boot smoke, final-surface promotion smoke, and real per-format export verification have all passed:

```text
PASS_TDT_RUNTIME_SSOT_01_R7_LEGACY_EXPORT_MANAGER_EXACT_API_ADOPTION_PER_FORMAT_ENCODER_IDENTITY_ZERO_ENCODER_FAIL_CLOSED_LEGACY_FINAL_SURFACE_PROMOTION_BRIDGE_EXPORT_RECEIPT_TRUTH_SEAL
```

No source-only bake may emit this marker.

---

# 26. Final Invariant

```text
No exact ExportManager
→ no encode capability

No eligible encoder
→ no encode capability

No authoritative final surface
→ no export

No exact format match
→ no export

No signature proof
→ no download

No output digest
→ no receipt

No complete receipt
→ no READY export
```

R7 is complete when an exported file is no longer merely “something downloaded by the old manager,” but a sealed product result whose surface lineage, encoder identity, format identity, and byte identity are all independently verifiable.
