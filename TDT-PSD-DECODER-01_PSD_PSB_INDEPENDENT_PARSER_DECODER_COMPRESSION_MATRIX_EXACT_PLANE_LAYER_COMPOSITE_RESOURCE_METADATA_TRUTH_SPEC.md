# TDT-PSD-DECODER-01

## PSD/PSB Independent Parser-Decoder / RAW·RLE·ZIP·ZIP Prediction Compression Matrix / Exact RGB8·RGB16·CMYK8 Plane Surface / Layer·Composite Truth / ICC·Resolution Resource Metadata Seal

- **Patch ID:** `TDT-PSD-DECODER-01`
- **Authority Domain:** PSD/PSB decode admission, parser identity, exact sample surfaces, compression truth, layer/composite ownership, image-resource metadata, independent export validation
- **Parent:** `TDT-JXL-CODEC-01`
- **Target Promotion State:** `PSD_DECODER_PROMOTED`
- **Current Expected Source-Bake State:** `PSD_DECODER_SOURCE_ADOPTED_UNPROMOTED`
- **Current Production Blocker Class:** `BLOCKED_PRODUCTION_RUNTIME_NOT_EXECUTED`

---

# 0. Executive Decision

`TDT-EXPORT-WORKER-04` and `TDT-EXPORT-WORKER-07` established a canonical PSD serializer and Worker-owned plane/color preparation boundary.

They did **not** promote the PSD decoder itself.

The current runtime contains a dedicated PSD decode Worker and an existing `psd_core` Emscripten artifact, but the active decode result mixes three different responsibilities:

1. exact file-format parsing;
2. presentation conversion;
3. visual cleanup.

The current path can:

- parse width, height, depth, color mode, channel count;
- extract ICC bytes;
- expose CMYK, RGB, alpha, and preview payloads;
- return one display-oriented surface.

The current path cannot prove, from its public evidence alone:

- PSD version 1 versus PSB version 2;
- compression kind per composite or layer channel;
- RAW, RLE, ZIP, and ZIP Prediction support matrix;
- layer record count and layer-channel identity;
- merged composite provenance;
- exact RGB16 U16 samples;
- exact CMYK8 stored plane samples;
- image-resource block identity and cardinality;
- ResolutionInfo `1005` provenance from the decoder itself;
- exact hidden RGB under alpha zero before sanitization;
- generation-safe cancel, timeout, and crash closure;
- product capability admission based on executed fixtures rather than source presence.

This specification promotes a separate, exact, independent PSD decode authority.

It SHALL NOT use the presentation surface as validation evidence.

It SHALL NOT infer support from the artifact name, extension, or exported function list.

It SHALL advertise only fixture-proven format/version/compression/mode combinations.

---

# 1. One-Sentence Goal

> Promote one canonical independent PSD decoder Worker that verifies parser-artifact identity, distinguishes PSD and PSB, reports compression and document structure, returns exact RGB8, RGB16 U16, CMYK8, alpha, layer, and composite samples without presentation mutation, preserves ICC and ResolutionInfo resource bytes, closes Worker generations deterministically, and validates canonical PSD exports without browser, canvas, serializer, or silent fallback authority.

---

# 2. Source-Grounded Current State

## 2.1 Confirmed decoder artifacts

The inspected source tree contains:

```text
app/legacy-runtime/vendor/psd/psd_core.mjs
SHA-256 fd40e6650b00225e033ace87a938c6c9fa0cbec3edce7aa448ba79f323df67a7

app/legacy-runtime/vendor/psd/psd_core.wasm
SHA-256 7acf14e838c63d6ede977e756d2ea643c856f14a7a6c4d28175ada1aeb14984b
```

The artifact SHALL remain byte-pinned until an explicitly named replacement patch is approved.

## 2.2 Confirmed current Worker

Current Worker source:

```text
app/legacy-runtime/decoders/psd_decode_worker.js
```

Current bridge:

```text
app/legacy-runtime/decoders/psd_worker_bridge.js
```

Current registry entry:

```text
name: psd-flat-worker
priority: 90
```

Current extension admission recognizes `.psd` but not `.psb`.

## 2.3 Confirmed current parser flags

The current Worker requests:

```text
PSDW_F_EXTRACT_ICC
PSDW_F_DECODE_CMYK8
PSDW_F_BUILD_PREVIEW
PSDW_F_DECODE_RGB_SINGLE
```

The current public result exposes:

```text
width
height
depth
colorMode
channels
ICC
CMYK
RGB
alpha
preview
```

The current public result does not expose authoritative:

```text
file format version
PSD versus PSB
layer count
layer records
layer channel records
composite compression
layer compression
resource inventory
resource byte digests
section offsets
section lengths
exact EOF
```

## 2.4 Confirmed current RGB16 mutation

The current `mergeRgbAlphaToSurface()` converts 16-bit integer samples to normalized float and then to half-float storage.

Current output identity:

```text
storage = rgba16float
```

This is not an exact U16 PSD round-trip surface.

## 2.5 Confirmed current presentation mutation

The current public decode path can apply:

- transparent-pixel sanitization;
- fringe cleanup;
- unmatte behavior;
- transparent-region dilation;
- CMYK ICC conversion to sRGB;
- preview fallback;
- `ImageData` construction;
- `createImageBitmap()`;
- Canvas fallback.

These operations MAY remain in a presentation adapter.

They SHALL NOT be part of independent decoder validation.

## 2.6 Confirmed current resolution split authority

The current public decode path reads source resolution separately through:

```text
readSourceResolutionFromFile(file)
```

The decoder artifact itself does not currently return ResolutionInfo evidence through the inspected JS ABI.

Resolution parsed outside the canonical decoder cannot prove decoder resource fidelity.

## 2.7 Confirmed current Worker lifecycle gaps

The current bridge:

- has no explicit timeout contract;
- has no request digest;
- has no input-size or pixel-budget admission;
- clears pending entries on manual termination without rejecting their Promises;
- does not increment an explicit Worker generation;
- does not bind results to a generation;
- does not mark the Worker unusable after crash before the next call;
- does not expose decoder artifact identity in READY evidence.

## 2.8 Confirmed serializer scope

The canonical serializer currently declares:

```text
PSD version 1
PSB false
Document modes:
- layered-rgb8-single-layer
- flattened-rgb8
- flattened-rgb16
- flattened-cmyk8

Compression:
- raw
- rle
```

This decoder specification MUST first close that serializer matrix.

PSB, ZIP, and ZIP Prediction are capability-gated extensions, not assumed requirements for the first production promotion.

---

# 3. Design Decisions

## 3.1 Exact decode and presentation decode SHALL be separate

Two surfaces SHALL exist:

```text
Exact PSD Decode Surface
Presentation PSD Surface
```

The exact surface is authoritative for:

- round-trip validation;
- hidden RGB;
- alpha;
- U16 samples;
- CMYK stored samples;
- layer/composite parity;
- compression evidence;
- resource evidence.

The presentation surface MAY perform:

- ICC conversion;
- preview conversion;
- half-float conversion;
- transparent-pixel cleanup;
- canvas or bitmap creation.

Presentation output SHALL never overwrite exact evidence.

## 3.2 Capability SHALL be fixture-proven

The decoder SHALL publish a capability only after the corresponding fixture passes.

Examples:

```text
psd-v1-rgb8-raw
psd-v1-rgb8-rle
psd-v1-rgb16-raw
psd-v1-rgb16-rle
psd-v1-cmyk8-raw
psd-v1-cmyk8-rle
```

Optional capabilities:

```text
psd-v1-*-zip
psd-v1-*-zip-prediction
psb-v2-*
```

No optional capability SHALL be advertised from symbol inspection alone.

## 3.3 Independent means serializer-independent

The decoder SHALL NOT call:

- the canonical PSD serializer;
- the serializer structure verifier as a substitute for decode;
- renderer PSD byte writers;
- browser image decoders;
- Canvas;
- ImageBitmap;
- presentation LCMS conversion for exact sample validation.

## 3.4 Exact sample values precede color conversion

For RGB files, exact stored RGB samples SHALL be returned.

For CMYK files, exact decoded CMYK samples SHALL be returned before ICC conversion.

The independent color-validation stage MAY transform CMYK to a comparison space later, but it SHALL bind that transform to:

- source ICC digest;
- destination ICC digest;
- rendering intent;
- black-point compensation;
- transform artifact identity.

## 3.5 Existing artifact adoption is conditional

The current `psd_core` artifact MAY be adopted unchanged.

It SHALL be promoted only if:

- its exact artifact hashes match the manifest;
- its ABI descriptor matches;
- all mandatory fixture combinations pass;
- exact U16 output is available through the promoted ABI;
- structural and resource evidence is available through the promoted ABI;
- no unsupported capability is advertised.

If the existing ABI cannot expose mandatory evidence, a new decoder ABI or wrapper artifact is required.

This specification does not authorize fabricated evidence derived from a second parser while claiming it came from `psd_core`.

---

# 4. Authority Model

## 4.1 Canonical chain

```text
PSD/PSB Input Bytes
→ Input Admission
→ Artifact Attestation
→ Canonical Decoder Worker Generation
→ Parser Header and Section Table
→ Resource Inventory
→ Layer Record Inventory
→ Composite Decode
→ Layer Decode, when requested
→ Exact Plane and Interleaved Surfaces
→ Independent Validation Receipt
→ Optional Presentation Adapter
```

## 4.2 SSOT ownership

| Authority | Owner |
|---|---|
| Decoder artifact identity | PSD decoder artifact manifest |
| Worker generation | PSD decoder broker |
| Input byte identity | decode request digest |
| File version and format | canonical parser |
| Compression identity | canonical parser |
| Resource inventory | canonical parser |
| Layer inventory | canonical parser |
| Exact plane bytes | canonical decoder |
| Exact composite bytes | canonical decoder |
| ICC transform | later color-validation stage |
| Presentation cleanup | presentation adapter |
| Product capability admission | PSD decoder promotion receipt |

## 4.3 Forbidden dual authority

The following are forbidden:

```text
Resolution from external parser + decoder result presented as one decoder receipt
Preview-derived RGB + exact-plane digest presented as the same surface
Sanitized transparent RGB + hidden-RGB exact claim
Presentation LCMS output + raw CMYK exact claim
Structure-verifier compression + decoder compression with no parity check
```

---

# 5. Scope

## 5.1 Mandatory promotion scope

- PSD version 1;
- RGB 8-bit;
- RGB 16-bit integer;
- CMYK 8-bit;
- straight alpha when present;
- RAW compression;
- PackBits RLE compression;
- flattened composite;
- single-layer RGB8 document produced by the canonical serializer;
- exact ICC resource bytes;
- exact ResolutionInfo `1005` resource fields;
- exact EOF and section-bound validation;
- independent export round-trip;
- hidden RGB preservation;
- Worker generation lifecycle.

## 5.2 Capability-gated optional scope

- ZIP compression;
- ZIP with Prediction;
- PSB version 2;
- arbitrary multi-layer documents;
- layer masks;
- vector masks;
- clipping groups;
- adjustment layers;
- spot channels;
- Lab mode;
- grayscale and bitmap modes;
- 32-bit floating-point PSD;
- duotone data;
- embedded smart objects.

Optional support SHALL remain hidden unless every required gate for that capability passes.

## 5.3 Explicit non-goals

- PSD authoring UI;
- arbitrary Photoshop feature fidelity;
- reconstructing unsupported effects;
- editing layer styles;
- browser-native PSD decoding;
- colorimetric proof acceptance without ICC validation;
- silent flattening of unsupported layered files;
- silent conversion of PSB to PSD;
- silent U16 to F16 conversion in exact validation.

---

# 6. Worker Identity

```ts
interface PSDDecoderWorkerIdentityV1 {
  workerId: 'dadum.worker.decoder.psd-independent-v1';
  protocolVersion: 'dadum-psd-independent-decoder-worker-v1';
  operationInspect: 'inspect.psd-structure-v1';
  operationDecodeComposite: 'decode.psd-composite-exact-v1';
  operationDecodeLayer: 'decode.psd-layer-exact-v1';
  operationDispose: 'dispose.psd-decoder-generation-v1';
}
```

The old registry label `psd-flat-worker` SHALL be retired from product receipts.

A compatibility alias MAY exist only outside the authority receipt.

---

# 7. Artifact Identity and ABI

## 7.1 Artifact manifest

```ts
interface PSDDecoderArtifactManifestV1 {
  manifestVersion: 1;
  implementationId: 'dadum.psd-independent-decoder-v1';
  gluePath: string;
  glueSha256: string;
  wasmPath: string;
  wasmSha256: string;
  abiId: string;
  abiVersion: number;
  buildReceiptDigest: string | null;
  adoptedExistingArtifact: boolean;
  sourceRevision: string | null;
  toolchainIdentity: string | null;
}
```

Initial pinned artifact hashes:

```text
glueSha256 = fd40e6650b00225e033ace87a938c6c9fa0cbec3edce7aa448ba79f323df67a7
wasmSha256 = 7acf14e838c63d6ede977e756d2ea643c856f14a7a6c4d28175ada1aeb14984b
```

## 7.2 ABI evidence requirements

The promoted decoder ABI SHALL provide or authoritatively derive inside the same canonical artifact boundary:

```text
abi version
format version
PSD or PSB
width
height
channel count
depth
color mode
layer count
composite presence
resource inventory
compression identity
exact plane lengths
exact decoded bytes
error code
```

## 7.3 Current ABI insufficiency rule

If the existing ABI exposes only display-oriented RGB, preview, alpha, ICC, and CMYK payloads without authoritative structure and compression evidence, promotion SHALL stop at:

```text
ARTIFACT_ATTESTED_ABI_INSUFFICIENT
```

No JS heuristic SHALL invent missing parser evidence.

---

# 8. Input Admission

## 8.1 Request

```ts
interface PSDDecodeRequestV1 {
  type: 'decode';
  requestId: string;
  generation: number;
  operation:
    | 'inspect.psd-structure-v1'
    | 'decode.psd-composite-exact-v1'
    | 'decode.psd-layer-exact-v1';
  inputBytes: ArrayBuffer;
  inputByteLength: number;
  inputSha256: string;
  fileNameHint: string | null;
  mimeHint: string | null;
  expectedFormat: 'auto' | 'psd' | 'psb';
  requestedSurface: PSDRequestedSurfaceV1;
  requestedLayerId: string | null;
  limits: PSDDecodeLimitsV1;
}
```

## 8.2 Limits

```ts
interface PSDDecodeLimitsV1 {
  maxInputBytes: number;
  maxWidth: number;
  maxHeight: number;
  maxPixels: number;
  maxChannels: number;
  maxLayers: number;
  maxResourceBytes: number;
  maxIccBytes: number;
  maxDecodedBytes: number;
  maxSectionCount: number;
  maxCompressionRatio: number;
  timeoutMs: number;
}
```

## 8.3 Admission order

The Worker SHALL validate, in order:

1. generation;
2. request schema;
3. exact input byte length;
4. exact input SHA-256;
5. input byte budget;
6. signature;
7. PSD/PSB version;
8. dimensions;
9. depth;
10. channel count;
11. color mode;
12. pixel budget;
13. section bounds;
14. requested operation support.

No decompression SHALL begin before the static budgets pass.

---

# 9. Format and Header Truth

## 9.1 Required header evidence

```ts
interface PSDHeaderEvidenceV1 {
  signature: '8BPS';
  version: 1 | 2;
  format: 'psd' | 'psb';
  channels: number;
  height: number;
  width: number;
  depth: 1 | 8 | 16 | 32;
  colorMode: number;
  reservedBytesZero: boolean;
}
```

## 9.2 PSD and PSB admission

```text
version 1 → PSD
version 2 → PSB
```

A `.psd` file with version 2 SHALL be reported as PSB with a hint mismatch.

A `.psb` file with version 1 SHALL be reported as PSD with a hint mismatch.

File extension SHALL never override header truth.

## 9.3 Mandatory product versions

Initial product promotion requires:

```text
PSD version 1 = supported
PSB version 2 = capability-gated
```

Registry admission for `.psb` SHALL remain false until PSB fixture gates pass.

---

# 10. Section Table and Bounds

The decoder SHALL expose the exact section map.

```ts
interface PSDSectionEvidenceV1 {
  colorModeData: ByteRangeEvidence;
  imageResources: ByteRangeEvidence;
  layerAndMaskInfo: ByteRangeEvidence;
  imageData: ByteRangeEvidence;
  exactEof: boolean;
  trailingByteCount: number;
}
```

```ts
interface ByteRangeEvidence {
  offset: number;
  byteLength: number;
  sha256: string;
  withinFile: boolean;
}
```

For PSB, 64-bit section lengths SHALL be parsed with checked arithmetic.

Any range overflow, overlap, or out-of-bounds reference SHALL fail before decode.

Trailing bytes are forbidden for canonical serializer round-trip fixtures unless an explicit external-file compatibility policy allows them.

---

# 11. Compression Matrix

## 11.1 Compression identities

```ts
type PSDCompressionKind =
  | 'raw'
  | 'rle-packbits'
  | 'zip'
  | 'zip-prediction';
```

Numeric mapping:

```text
0 = raw
1 = rle-packbits
2 = zip
3 = zip-prediction
```

## 11.2 Mandatory matrix

Initial promotion SHALL pass:

| Format | Mode | Depth | RAW | RLE |
|---|---|---:|---:|---:|
| PSD v1 | RGB | 8 | required | required |
| PSD v1 | RGB | 16 | required | required |
| PSD v1 | CMYK | 8 | required | required |
| PSD v1 | RGB single-layer | 8 | required | required |

## 11.3 Optional matrix

ZIP and ZIP Prediction SHALL be advertised per exact tuple:

```text
format × colorMode × depth × composite/layer
```

Passing RGB8 composite ZIP does not authorize RGB16 layer ZIP Prediction.

## 11.4 RLE truth

The decoder SHALL validate:

- row-count table cardinality;
- PSD versus PSB row-count width;
- row payload bounds;
- PackBits control-byte legality;
- exact decoded row length;
- sum of row payload lengths;
- no over-read;
- no under-filled output.

## 11.5 ZIP truth

ZIP support SHALL validate:

- zlib stream completeness;
- exact decompressed byte length;
- no trailing compressed member accepted silently;
- bounded allocation;
- checksum failure propagation.

## 11.6 ZIP Prediction truth

Prediction reversal SHALL be depth-aware.

It SHALL NOT apply the 8-bit algorithm to 16-bit or 32-bit samples.

For 16-bit integer samples, byte-order restoration and predictor reversal SHALL be separately evidenced.

---

# 12. Exact Surface Model

## 12.1 Requested surface

```ts
type PSDRequestedSurfaceV1 =
  | 'composite-interleaved-exact'
  | 'composite-planar-exact'
  | 'layer-interleaved-exact'
  | 'layer-planar-exact'
  | 'structure-only';
```

## 12.2 Surface descriptor

```ts
interface PSDExactSurfaceV1 {
  surfaceId: 'dadum.psd-exact-surface-v1';
  sourceFormat: 'psd' | 'psb';
  sourceSection: 'composite' | 'layer';
  layerId: string | null;
  width: number;
  height: number;
  colorMode: 'rgb' | 'cmyk';
  depth: 8 | 16;
  channelOrder: readonly number[];
  alphaMode: 'straight' | 'none';
  storage:
    | 'rgba8unorm-u8'
    | 'rgba16le-unorm-u16'
    | 'cmyka8-unorm-u8'
    | 'planar-u8'
    | 'planar-u16le';
  rowStride: number;
  byteLength: number;
  pixelSha256: string;
  hiddenRgbPreserved: boolean | null;
  data: ArrayBuffer;
}
```

## 12.3 RGB8

RGB8 exact output SHALL preserve:

- R;
- G;
- B;
- alpha;
- hidden RGB under alpha zero.

No unmatte, dilation, fringe cleanup, or premultiply operation is allowed.

## 12.4 RGB16

RGB16 exact output SHALL use:

```text
storage = rgba16le-unorm-u16
sampleEncoding = rgba16le-unorm-u16-v1
```

The decoder SHALL preserve all 16 bits.

The following are forbidden before the exact digest:

- normalization to float;
- conversion to F16;
- conversion to U8;
- display gamma conversion;
- truncation by high-byte extraction.

## 12.5 CMYK8

CMYK exact output SHALL identify whether the public bytes are:

```text
logical ink-up samples
or
PSD stored density samples
```

The decoder SHALL expose the declared policy:

```ts
type PSDCMYKSamplePolicy =
  | 'logical-cmyk8-ink-up'
  | 'psd-stored-cmyk8-density';
```

The independent round-trip comparator SHALL compare samples in the same policy domain.

No undocumented inversion is allowed.

## 12.6 Alpha

Alpha SHALL be returned as an exact channel when present.

If no alpha exists:

```text
alphaMode = none
```

A generated all-255 alpha channel SHALL be marked synthetic and SHALL NOT be presented as a decoded file channel.

---

# 13. Hidden RGB Truth

Hidden RGB verification SHALL use fixtures with distinct RGB values under alpha zero.

```text
(255, 0, 0, 0)
(0, 255, 0, 0)
(0, 0, 255, 0)
(17, 33, 65, 0)
```

Comparison SHALL occur before:

- alpha hygiene;
- unmatte;
- fringe collapse;
- preview generation;
- color conversion;
- canvas upload.

Mismatch evidence:

```ts
interface PSDHiddenRgbMismatchV1 {
  byteIndex: number;
  pixelIndex: number;
  x: number;
  y: number;
  channel: 'r' | 'g' | 'b' | 'a';
  expected: number;
  actual: number;
  alpha: number;
  expectedSurfaceSha256: string;
  actualSurfaceSha256: string;
}
```

---

# 14. Layer and Composite Truth

## 14.1 Layer inventory

```ts
interface PSDLayerEvidenceV1 {
  layerId: string;
  index: number;
  name: string;
  top: number;
  left: number;
  bottom: number;
  right: number;
  opacity: number;
  visible: boolean;
  blendModeKey: string;
  clipping: number;
  flags: number;
  channelRecords: readonly PSDLayerChannelEvidenceV1[];
}
```

## 14.2 Channel record

```ts
interface PSDLayerChannelEvidenceV1 {
  channelId: number;
  declaredByteLength: number;
  compression: PSDCompressionKind;
  decodedByteLength: number;
  decodedSha256: string;
}
```

## 14.3 Composite evidence

```ts
interface PSDCompositeEvidenceV1 {
  present: boolean;
  compression: PSDCompressionKind;
  channelCount: number;
  planeDigests: readonly string[];
  interleavedDigest: string | null;
}
```

## 14.4 Canonical serializer parity

For `layered-rgb8-single-layer`:

- layer count SHALL equal 1;
- layer rectangle SHALL match the document bounds;
- layer name SHALL match the encode plan;
- layer planes SHALL match the source planes;
- merged composite SHALL match the source composite;
- hidden RGB SHALL match in both layer and composite channels;
- resource digests SHALL match the encode receipt.

## 14.5 Unsupported layer behavior

Unsupported layer features SHALL NOT be silently flattened and reported as fully supported.

The decoder MAY return:

```text
structure parsed
composite decoded
layer decode unsupported
```

But the capability receipt SHALL distinguish those states.

---

# 15. Image Resource Authority

## 15.1 Inventory

The decoder SHALL return an ordered inventory of image resources.

```ts
interface PSDImageResourceEvidenceV1 {
  index: number;
  signature: '8BIM' | '8B64';
  resourceId: number;
  nameByteLength: number;
  dataByteLength: number;
  dataSha256: string;
  offset: number;
  paddedByteLength: number;
}
```

## 15.2 ICC Profile resource 1039

For resource `1039`, the decoder SHALL return:

- exact ICC bytes;
- exact byte length;
- SHA-256;
- resource cardinality;
- resource ordering index.

Canonical serializer rules:

```text
ICC requested → exactly 1 resource 1039
ICC absent → exactly 0 resource 1039
CMYK product export → exactly 1 destination CMYK ICC resource
```

## 15.3 ResolutionInfo resource 1005

The decoder SHALL parse resource `1005` inside the canonical Worker.

Evidence SHALL include:

```ts
interface PSDResolutionEvidenceV1 {
  resourceId: 1005;
  horizontalFixed16_16: number;
  horizontalDpi: number;
  horizontalUnit: number;
  widthUnit: number;
  verticalFixed16_16: number;
  verticalDpi: number;
  verticalUnit: number;
  heightUnit: number;
  rawSha256: string;
}
```

The production receipt SHALL not use `readSourceResolutionFromFile()` as the decoder's authority.

External parsing MAY be used only as an independent parity oracle.

## 15.4 Duplicate resources

Duplicate ICC or ResolutionInfo resources SHALL be reported explicitly.

Canonical serializer round-trip requires:

```text
ResolutionInfo count = 1
ICC count = requested cardinality
```

---

# 16. Independent CMYK Validation Boundary

The PSD decoder SHALL return exact CMYK and ICC bytes.

It SHALL NOT convert CMYK to sRGB inside the exact decode receipt.

Independent color validation occurs later:

```text
Exact CMYK Surface
+ Embedded ICC
+ Independent LCMS Artifact
+ Declared Destination RGB Profile
→ Comparison RGB Surface
```

The color-validation receipt SHALL bind:

- CMYK sample policy;
- source ICC SHA-256;
- destination ICC SHA-256;
- LCMS artifact SHA-256;
- rendering intent;
- black-point compensation;
- output surface SHA-256;
- comparison metric.

`maybeReplacePreviewDerivedCmyk()` SHALL remain presentation-only and SHALL not satisfy this gate.

---

# 17. Worker Generation and Lifecycle

## 17.1 Generation identity

Each Worker creation SHALL increment a generation number.

Every READY, RESULT, ERROR, CANCELLED, and DISPOSED message SHALL carry that generation.

## 17.2 READY evidence

```ts
interface PSDDecoderReadyEvidenceV1 {
  workerId: 'dadum.worker.decoder.psd-independent-v1';
  protocolVersion: 'dadum-psd-independent-decoder-worker-v1';
  generation: number;
  artifactManifestDigest: string;
  glueSha256: string;
  wasmSha256: string;
  abiId: string;
  abiVersion: number;
  capabilityDigest: string;
  exactSurfaceSupported: boolean;
}
```

## 17.3 Pending-job ownership

Pending jobs SHALL be keyed by:

```text
generation + requestId
```

A result from an old generation SHALL be rejected.

## 17.4 Manual termination

Manual termination SHALL reject every pending Promise with a stable error before clearing the pending map.

It SHALL NOT leave unresolved Promises.

## 17.5 Crash

On Worker crash:

1. reject all pending jobs;
2. mark the generation dead;
3. clear the Worker reference;
4. clear the module reference inside the Worker by process termination;
5. increment generation on next initialization;
6. never replay an active decode automatically.

## 17.6 Timeout and cancel

A decode in a synchronous native/WASM call may require Worker termination.

The receipt SHALL state:

```text
cancelabilityClass = worker-termination-required-during-native-call
```

## 17.7 Memory closure

At terminal settlement:

```text
input ownership transferred or released
parser handle freed
source heap allocation freed
result copied out
old Worker terminated when required
old generation result accepted = 0
```

---

# 18. Presentation Adapter Boundary

The following existing behaviors MAY remain, but only downstream of exact decode:

- RGB16 U16 to F16 conversion;
- CMYK ICC to sRGB conversion;
- transparent-pixel sanitization;
- preview generation;
- `ImageData`;
- `ImageBitmap`;
- Canvas fallback.

Presentation evidence SHALL refer to the exact decode receipt digest.

```ts
interface PSDPresentationReceiptV1 {
  exactDecodeReceiptDigest: string;
  presentationTransformId: string;
  presentationSurfaceSha256: string;
  exactSurfaceMutated: false;
}
```

---

# 19. Registry Admission

## 19.1 Product decoder ID

```text
dadum.decoder.psd-independent-v1
```

## 19.2 Admission receipt

The Runtime Registry SHALL admit the decoder only if:

```text
artifactAttested = true
mandatoryCapabilityMatrixPassed = true
exactSurfaceVerified = true
resourceMetadataVerified = true
generationClosureVerified = true
```

## 19.3 PSD extension

`.psd` may be admitted after PSD v1 promotion.

## 19.4 PSB extension

`.psb` SHALL be admitted only if:

```text
psbV2HeaderVerified = true
psb64BitLengthsVerified = true
psbRleRowCountWidthVerified = true
psbMandatoryFixtureMatrixPassed = true
```

## 19.5 Silent fallback zero

Independent validation SHALL fail if the registry selects:

- browser decoder;
- preview-only decoder;
- native raster decoder;
- serializer self-verifier;
- a non-attested PSD decoder.

---

# 20. Export Round-Trip Matrix

## 20.1 Mandatory fixtures

```text
PSD-RGB8-RAW-OPAQUE
PSD-RGB8-RAW-HIDDEN-RGB
PSD-RGB8-RLE-ALPHA
PSD-RGB8-RLE-SINGLE-LAYER
PSD-RGB16-RAW-GRADIENT
PSD-RGB16-RLE-EXTREME-U16
PSD-CMYK8-RAW-ICC
PSD-CMYK8-RLE-ICC-ALPHA
PSD-RESOURCE-ICC-RESOLUTION
PSD-RLE-WORST-ROW
```

## 20.2 Optional fixtures

```text
PSD-RGB8-ZIP
PSD-RGB16-ZIP
PSD-RGB8-ZIP-PREDICTION
PSD-RGB16-ZIP-PREDICTION
PSB-RGB8-RAW
PSB-RGB8-RLE
PSB-RGB16-ZIP-PREDICTION
```

## 20.3 Round-trip evidence

```ts
interface PSDExportRoundTripReceiptV1 {
  encodeReceiptDigest: string;
  savedFileSha256: string;
  decoderReceiptDigest: string;
  decoderId: 'dadum.decoder.psd-independent-v1';
  decoderIndependent: true;
  documentModeMatched: boolean;
  formatVersionMatched: boolean;
  compressionMatched: boolean;
  layerStructureMatched: boolean;
  compositeMatched: boolean;
  planeDigestsMatched: boolean;
  hiddenRgbMatched: boolean;
  alphaMatched: boolean;
  iccMatched: boolean;
  resolutionMatched: boolean;
  exactEofVerified: boolean;
}
```

---

# 21. Determinism and Repetition

The same decoder artifact and same input SHALL produce the same evidence.

Required repetitions:

```text
same Worker generation      100 decodes
generation replacement       20 decodes
application relaunch           5 decodes
```

The following SHALL remain identical:

- header evidence digest;
- section map digest;
- resource inventory digest;
- layer inventory digest;
- compression evidence digest;
- exact surface SHA-256;
- ICC SHA-256;
- resolution evidence digest.

Timing, absolute paths, and generated timestamps SHALL not enter semantic digests.

---

# 22. Security and Resource Limits

The decoder SHALL fail closed on:

- integer overflow;
- section offset overflow;
- decompression bomb;
- layer count overflow;
- channel count overflow;
- pixel budget overflow;
- resource budget overflow;
- ICC budget overflow;
- malformed PackBits;
- malformed zlib stream;
- unsupported predictor;
- recursive additional-layer-info abuse;
- duplicate mandatory resource conflict;
- invalid Unicode layer name lengths;
- invalid PSB 64-bit lengths;
- unsupported depth or mode.

No parser panic SHALL terminate the Electron main process.

The parser SHALL remain inside the dedicated Worker.

---

# 23. Stable Error Registry

The implementation SHALL add at least the following stable errors.

```text
E_PSD_DECODER_NOT_PROMOTED
E_PSD_DECODER_ARTIFACT_MISSING
E_PSD_DECODER_ARTIFACT_HASH_MISMATCH
E_PSD_DECODER_ABI_MISMATCH
E_PSD_DECODER_ABI_INSUFFICIENT
E_PSD_DECODER_READY_EVIDENCE_MISSING
E_PSD_DECODER_CAPABILITY_UNVERIFIED
E_PSD_DECODER_REQUEST_VERSION_UNSUPPORTED
E_PSD_DECODER_REQUEST_DIGEST_MISMATCH
E_PSD_DECODER_INPUT_LENGTH_MISMATCH
E_PSD_DECODER_INPUT_DIGEST_MISMATCH
E_PSD_DECODER_INPUT_TOO_LARGE
E_PSD_DECODER_SIGNATURE_INVALID
E_PSD_DECODER_VERSION_UNSUPPORTED
E_PSD_DECODER_FORMAT_HINT_MISMATCH
E_PSD_DECODER_HEADER_INVALID
E_PSD_DECODER_RESERVED_BYTES_INVALID
E_PSD_DECODER_DIMENSION_INVALID
E_PSD_DECODER_PIXEL_BUDGET_EXCEEDED
E_PSD_DECODER_CHANNEL_BUDGET_EXCEEDED
E_PSD_DECODER_LAYER_BUDGET_EXCEEDED
E_PSD_DECODER_RESOURCE_BUDGET_EXCEEDED
E_PSD_DECODER_ICC_BUDGET_EXCEEDED
E_PSD_DECODER_SECTION_BOUNDS_INVALID
E_PSD_DECODER_SECTION_OVERLAP
E_PSD_DECODER_TRAILING_BYTES
E_PSD_DECODER_COMPRESSION_UNSUPPORTED
E_PSD_DECODER_RLE_TABLE_INVALID
E_PSD_DECODER_RLE_ROW_INVALID
E_PSD_DECODER_RLE_OUTPUT_LENGTH_MISMATCH
E_PSD_DECODER_ZIP_INVALID
E_PSD_DECODER_ZIP_OUTPUT_LENGTH_MISMATCH
E_PSD_DECODER_ZIP_PREDICTION_INVALID
E_PSD_DECODER_PLANE_LENGTH_MISMATCH
E_PSD_DECODER_PLANE_DIGEST_MISMATCH
E_PSD_DECODER_RGB16_EXACTNESS_FAILED
E_PSD_DECODER_CMYK_POLICY_UNDECLARED
E_PSD_DECODER_ALPHA_CONTRACT_MISMATCH
E_PSD_DECODER_HIDDEN_RGB_MISMATCH
E_PSD_DECODER_LAYER_RECORD_INVALID
E_PSD_DECODER_LAYER_CHANNEL_INVALID
E_PSD_DECODER_COMPOSITE_MISSING
E_PSD_DECODER_LAYER_COMPOSITE_MISMATCH
E_PSD_DECODER_RESOURCE_INVALID
E_PSD_DECODER_RESOURCE_DUPLICATE
E_PSD_DECODER_ICC_RESOURCE_MISMATCH
E_PSD_DECODER_RESOLUTION_RESOURCE_MISMATCH
E_PSD_DECODER_EXACT_SURFACE_MISSING
E_PSD_DECODER_PRESENTATION_SURFACE_FORBIDDEN
E_PSD_DECODER_BROWSER_FALLBACK_FORBIDDEN
E_PSD_DECODER_SERIALIZER_FALLBACK_FORBIDDEN
E_PSD_DECODER_STALE_GENERATION_RESULT
E_PSD_DECODER_PENDING_JOB_LEAK
E_PSD_DECODER_TIMEOUT
E_PSD_DECODER_CANCELLED
E_PSD_DECODER_WORKER_CRASHED
E_PSD_DECODER_GENERATION_CLOSURE_FAILED
E_PSD_DECODER_MEMORY_LEAK
E_PSD_DECODER_ROUNDTRIP_NOT_EXECUTED
E_PSD_DECODER_PACKAGE_ROUTE_MISSING
E_PSD_DECODER_EMITTED_ARTIFACT_MISMATCH
E_PSD_DECODER_PROMOTION_BLOCKED
```

---

# 24. Static Gates

The implementation SHALL include at least 112 static gates.

Mandatory gate groups:

## 24.1 Identity gates

- Worker ID exact;
- protocol exact;
- operation names exact;
- artifact manifest present;
- glue SHA present;
- WASM SHA present;
- ABI ID present;
- capability digest present.

## 24.2 Separation gates

- exact decoder module does not import presentation alpha hygiene;
- exact decoder module does not import CMYK presentation converter;
- exact decoder module does not import Canvas utilities;
- exact decoder module does not call `createImageBitmap`;
- exact decoder module does not call serializer APIs;
- presentation adapter consumes exact receipt digest.

## 24.3 RGB16 gates

- exact surface includes `rgba16le-unorm-u16`;
- no F16 conversion in exact path;
- no U8 truncation in exact path;
- no `>>> 8` alpha truncation in exact path;
- U16 digest field exists.

## 24.4 Structure gates

- version evidence exists;
- section table exists;
- compression evidence exists;
- layer inventory exists;
- composite evidence exists;
- resource inventory exists;
- exact EOF evidence exists.

## 24.5 Registry gates

- old `psd-flat-worker` is not a promoted receipt identity;
- `.psb` admission is capability-gated;
- decoder source presence alone cannot register capability;
- browser fallback is forbidden for independent validation.

## 24.6 Lifecycle gates

- generation included in requests and responses;
- manual termination rejects pending jobs;
- crash clears Worker reference;
- stale generation results rejected;
- timeout reaches the full decode operation.

## 24.7 Parent-lineage gates

- R7 preserved;
- EW01 through EW07 preserved;
- EP01 through EP03 preserved;
- BUILD-LOCK-01 preserved;
- BUILD-EMIT-01 preserved;
- MODJPEG-01 preserved;
- NATIVE-DECODER-01 preserved;
- JXL-CODEC-01 preserved.

---

# 25. Runtime Test Plan

The implementation SHALL include at least 176 runtime and policy tests.

## 25.1 Header tests

- valid PSD v1;
- valid PSB v2 fixture when capability enabled;
- invalid signature;
- unsupported version;
- nonzero reserved bytes;
- hint mismatch;
- zero dimensions;
- overflow dimensions;
- unsupported depth;
- unsupported color mode.

## 25.2 Section tests

- valid section bounds;
- truncated color-mode section;
- truncated resource section;
- truncated layer section;
- truncated image data;
- offset overflow;
- section overlap;
- trailing bytes;
- PSB 64-bit length overflow.

## 25.3 Compression tests

- RAW exact rows;
- RLE literal runs;
- RLE repeated runs;
- RLE no-op control byte;
- RLE truncated row;
- RLE oversized output;
- RLE row-count mismatch;
- ZIP valid;
- ZIP checksum failure;
- ZIP truncated stream;
- ZIP extra member;
- ZIP Prediction RGB8;
- ZIP Prediction RGB16;
- unsupported predictor.

## 25.4 Surface tests

- RGB8 exact opaque;
- RGB8 exact alpha;
- RGB8 hidden RGB;
- RGB16 zero;
- RGB16 max;
- RGB16 nontrivial values;
- RGB16 endian truth;
- CMYK exact policy;
- alpha absent;
- alpha present;
- synthetic alpha distinguished.

## 25.5 Layer/composite tests

- flattened document;
- one-layer document;
- layer rectangle;
- layer name;
- layer channel IDs;
- layer compression;
- composite compression;
- layer/composite parity;
- unsupported layer feature reported without silent flatten claim.

## 25.6 Resource tests

- no ICC;
- one ICC;
- duplicate ICC;
- malformed ICC resource length;
- exact ICC digest;
- one ResolutionInfo;
- duplicate ResolutionInfo;
- exact fixed16.16 DPI;
- malformed Pascal resource name;
- resource padding.

## 25.7 Lifecycle tests

- generation 1 success;
- dispose generation 1;
- generation 2 success;
- stale result rejected;
- manual termination rejects pending job;
- crash rejects all pending jobs;
- timeout kills Worker;
- cancel kills Worker during synchronous decode;
- next generation starts clean;
- no unresolved Promise remains.

## 25.8 Independence tests

- serializer unavailable but decoder still runs;
- Canvas unavailable but exact decode still runs;
- ImageBitmap unavailable but exact decode still runs;
- presentation LCMS unavailable but CMYK exact decode still runs;
- alpha hygiene unavailable but exact decode still runs;
- browser decoder trap not invoked.

## 25.9 Repetition tests

- same generation 100 repetitions;
- 20 generation replacements;
- 5 application relaunch simulations;
- deterministic semantic receipt digest.

---

# 26. Required Artifacts

The bake SHALL produce at least the following artifacts.

```text
TDT_PSD_DECODER_01_SOURCE_INPUT_REPORT.json
TDT_PSD_DECODER_01_ARTIFACT_IDENTITY_REPORT.json
TDT_PSD_DECODER_01_ABI_REPORT.json
TDT_PSD_DECODER_01_CAPABILITY_MATRIX_REPORT.json
TDT_PSD_DECODER_01_HEADER_REPORT.json
TDT_PSD_DECODER_01_SECTION_MAP_REPORT.json
TDT_PSD_DECODER_01_COMPRESSION_REPORT.json
TDT_PSD_DECODER_01_EXACT_SURFACE_REPORT.json
TDT_PSD_DECODER_01_RGB16_REPORT.json
TDT_PSD_DECODER_01_CMYK_REPORT.json
TDT_PSD_DECODER_01_HIDDEN_RGB_REPORT.json
TDT_PSD_DECODER_01_LAYER_COMPOSITE_REPORT.json
TDT_PSD_DECODER_01_RESOURCE_REPORT.json
TDT_PSD_DECODER_01_ICC_REPORT.json
TDT_PSD_DECODER_01_RESOLUTION_REPORT.json
TDT_PSD_DECODER_01_GENERATION_REPORT.json
TDT_PSD_DECODER_01_INDEPENDENCE_REPORT.json
TDT_PSD_DECODER_01_ROUNDTRIP_REPORT.json
TDT_PSD_DECODER_01_REPEATABILITY_REPORT.json
TDT_PSD_DECODER_01_PACKAGING_REPORT.json
TDT_PSD_DECODER_01_PROMOTION_RECEIPT.json
TDT_PSD_DECODER_01_GATE_REPORT.json
TDT_PSD_DECODER_01_RUNTIME_TEST_REPORT.json
TDT_PSD_DECODER_01_FIX_RECEIPT.json
TDT_PSD_DECODER_01_SOURCE_BAKE_SEAL_PAYLOAD.json
SOURCE_BAKE_FINAL_VERIFY_PSD_DECODER_01.txt
```

---

# 27. State Machine

```text
UNASSESSED
→ SOURCE_INPUT_VERIFIED
→ ARTIFACT_IDENTITY_VERIFIED
→ ABI_VERIFIED
→ WORKER_PROTOCOL_VERIFIED
→ PSD_V1_HEADER_VERIFIED
→ SECTION_MAP_VERIFIED
→ RAW_MATRIX_VERIFIED
→ RLE_MATRIX_VERIFIED
→ EXACT_RGB8_VERIFIED
→ EXACT_RGB16_VERIFIED
→ EXACT_CMYK8_VERIFIED
→ HIDDEN_RGB_VERIFIED
→ LAYER_COMPOSITE_VERIFIED
→ RESOURCE_METADATA_VERIFIED
→ GENERATION_CLOSURE_VERIFIED
→ INDEPENDENCE_VERIFIED
→ EXPORT_ROUNDTRIP_VERIFIED
→ REPEATABILITY_VERIFIED
→ PACKAGED_RUNTIME_VERIFIED
→ PSD_DECODER_PROMOTED
```

Optional branches:

```text
ZIP_CAPABILITY_VERIFIED
ZIP_PREDICTION_CAPABILITY_VERIFIED
PSB_V2_CAPABILITY_VERIFIED
```

Optional branches SHALL not block initial PSD v1 RAW/RLE promotion unless explicitly selected as product requirements.

---

# 28. Promotion Receipt

```ts
interface PSDDecoderPromotionReceiptV1 {
  schema: 'tdt-psd-decoder-01-promotion-receipt-v1';
  patchId: 'TDT-PSD-DECODER-01';
  status:
    | 'SOURCE_BAKED_UNPROMOTED'
    | 'BLOCKED'
    | 'PSD_DECODER_PROMOTED';
  promoted: boolean;

  decoderId: 'dadum.decoder.psd-independent-v1';
  workerId: 'dadum.worker.decoder.psd-independent-v1';
  protocolVersion: 'dadum-psd-independent-decoder-worker-v1';

  artifactManifestDigest: string;
  glueSha256: string;
  wasmSha256: string;
  abiId: string;
  abiVersion: number;

  psdV1Verified: boolean;
  psbV2Verified: boolean;
  rawVerified: boolean;
  rleVerified: boolean;
  zipVerified: boolean;
  zipPredictionVerified: boolean;

  rgb8ExactVerified: boolean;
  rgb16ExactVerified: boolean;
  cmyk8ExactVerified: boolean;
  hiddenRgbVerified: boolean;
  alphaVerified: boolean;

  layerStructureVerified: boolean;
  compositeVerified: boolean;
  layerCompositeParityVerified: boolean;

  iccResourceVerified: boolean;
  resolutionResourceVerified: boolean;
  exactEofVerified: boolean;

  generationClosureVerified: boolean;
  independentFallbackUsed: boolean;
  exportRoundTripVerified: boolean;
  repeatabilityVerified: boolean;
  packagedExecutionVerified: boolean;

  capabilityDigest: string;
  fixtureCorpusDigest: string;
  blockers: readonly string[];
}
```

---

# 29. Initial Promotion Conditions

The initial production promotion SHALL require:

```text
artifact hashes exact
ABI evidence sufficient
PSD version 1 verified
RAW verified
RLE verified
RGB8 exact verified
RGB16 U16 exact verified
CMYK8 exact verified
hidden RGB verified
alpha verified
single-layer structure verified
composite verified
ICC resource verified
ResolutionInfo verified
generation closure verified
independent fallback used = false
canonical export round-trip verified
repeatability verified
packaged Electron execution verified
```

It SHALL NOT require, unless product scope changes:

```text
PSB
ZIP
ZIP Prediction
arbitrary multi-layer fidelity
32-bit PSD
Lab PSD
```

---

# 30. Current Expected Bake Truth

On the currently available source tree, the bake MAY truthfully reach:

```text
PSD_DECODER_SOURCE_ADOPTED_UNPROMOTED
```

if it implements:

- exact/presentation path separation;
- Worker generation protocol;
- artifact manifest;
- capability admission;
- source gates;
- policy fixtures;
- blocked production receipts.

It SHALL NOT claim `PSD_DECODER_PROMOTED` until actual decoder execution proves:

- RGB8 exactness;
- RGB16 U16 exactness;
- CMYK8 exactness;
- layer/composite parity;
- resource metadata;
- hidden RGB;
- packaged Electron route and runtime;
- repetition matrix.

If the existing artifact cannot expose exact U16 or required structural evidence, the truthful blocker SHALL be:

```text
E_PSD_DECODER_ABI_INSUFFICIENT
```

not a fabricated PASS.

---

# 31. Bake Deliverable

The next bake SHALL:

1. clone the latest `TDT-JXL-CODEC-01` source tree;
2. add this specification under `specs/`;
3. create a canonical PSD decoder artifact manifest;
4. split exact decoding from presentation conversion;
5. add a generation-aware PSD decoder Worker broker;
6. add exact RGB8, RGB16 U16, CMYK8 surface types;
7. add structure, compression, layer, composite, resource, ICC, and resolution evidence types;
8. capability-gate PSB, ZIP, and ZIP Prediction;
9. reject pending jobs on dispose and crash;
10. add source gates and runtime policy tests;
11. preserve all parent seals;
12. generate blocked production receipts when actual runtime evidence is unavailable;
13. produce a deterministic ZIP and file inventory;
14. never mutate the existing `psd_core` artifact bytes without an explicit replacement authority.

---

# 32. Follow-Up Roadmap

After `TDT-PSD-DECODER-01`, the next specification is:

```text
TDT-COLOR-ICC-01
Canonical ICC Asset Set /
Profile Identity and Provenance /
LCMS Transform ABI /
Rendering Intent·BPC /
Cross-Format Color Validation /
ΔE Truth Seal
```

The subsequent PSD-specific color stage is:

```text
TDT-PSD-CMYK-01
CMYK Encode-Decode Color Round-trip /
Embedded Profile Identity /
Stored-Density Inversion Truth /
Independent LCMS Validation /
ΔE Promotion Seal
```
