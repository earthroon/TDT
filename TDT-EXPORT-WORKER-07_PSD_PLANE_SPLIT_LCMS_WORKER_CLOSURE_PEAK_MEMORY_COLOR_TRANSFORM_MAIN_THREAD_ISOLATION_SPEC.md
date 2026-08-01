# TDT-EXPORT-WORKER-07

## PSD Plane Split / LCMS Worker Closure / Peak Memory / Color Transform / Final Main-thread Isolation Seal

- **Document ID:** `TDT-EXPORT-WORKER-07`
- **Parent:** `TDT-EXPORT-WORKER-06`
- **Status:** `SPECIFICATION`
- **Authority Domain:** PSD export preparation, ICC transform, plane ownership, peak-memory accounting, final renderer isolation
- **Canonical Runtime:** Vite + Vue 3 + Pinia + EW02 Encoder Worker Broker
- **Target Encoder:** `dadum.encoder.psd.v1`
- **Target Worker:** `dadum.worker.encoder.psd-canonical-v2`
- **Target Operation:** `encode.psd-canonical-v2`
- **Control Protocol:** `dadum-worker-control-v1`
- **Job Protocol:** `dadum-worker-rpc-v1`
- **Codec Protocol:** `dadum-psd-canonical-worker-v2`
- **Receipt Revision:** `dadum.psd-export-receipt-ew07-v1`
- **Promotion Rule:** Fail-closed. Source bake, build promotion, and codec promotion remain separate states.

---

# 0. Executive Decision

EW04 moved PSD **byte serialization** into a canonical Worker, but PSD export is not yet fully Worker-owned.
The Renderer still owns the expensive and semantically critical preparation stages:

1. RGBA8/RGBA16 plane splitting.
2. Source and destination ICC selection.
3. LittleCMS module creation.
4. A fixed 512 MiB Shared WebAssembly memory allocation.
5. RGBA8 to CMYK8 conversion.
6. Alpha extraction.
7. CMYK sample inversion for PSD storage.
8. Plane digest calculation.
9. PSD Document Plan v2 serialization.
10. The first half of the memory-accounting story.

EW07 promotes the complete PSD job boundary:

```text
Authoritative Final Surface
  -> PSD Encode Command
  -> EW02 Broker
  -> dadum.worker.encoder.psd-canonical-v2
       -> input validation
       -> ICC resolution and digest
       -> LCMS transform
       -> alpha preservation
       -> plane preparation
       -> PSD sample inversion
       -> Document Plan construction
       -> canonical serialization
       -> structure verification
       -> output digest
       -> allocation-ledger closure
  -> PSD Worker Evidence
  -> R7 Export Receipt
```

The Renderer may select user options and acquire user-supplied ICC bytes. It may not transform pixels, split planes, invert CMYK samples, build PSD plans, allocate LCMS heaps, or write PSD bytes.

---
## 1. Source-grounded Current State

### 1.1 Confirmed renderer-owned preparation

The current `app/legacy-runtime/libs/psd/psd_export_bridge.js` imports both the PSD plan codec and LCMS directly.

- Line 1 imports `encodePsdDocumentPlanV2`.
- Line 2 imports `getLCMS`.
- Lines 16-21 split RGBA8 into R/G/B/A planes in the Renderer.
- Lines 23-28 split RGBA16 and convert each plane to big-endian bytes in the Renderer.
- Line 31 converts interleaved CMYK into inverted PSD C/M/Y/K planes in the Renderer.
- Lines 32-34 allocate LCMS heap buffers, run the transform, copy CMYK and alpha back out, and report `colorTransformRealm:'renderer-main'`.
- Lines 37-47 construct and hash the PSD Document Plan in the Renderer.
- Line 51 sends only the already-prepared `requestBytes` to the Worker.

This means EW04 closed the byte-writer boundary but not the image-preparation boundary.

### 1.2 Confirmed fixed LCMS heap

`app/legacy-runtime/libs/lcms/lcmsLoader.js` creates a fixed shared WebAssembly memory:

```text
INITIAL_MEMORY = 512 * 1024 * 1024
maximum = initial
shared = true
```

The 512 MiB allocation is not represented by the current `temporaryBytePeak` evidence.

### 1.3 Confirmed undercounted peak-memory evidence

Current evidence reports per-pixel estimates such as:

```text
RGBA8 split:       P * 7 or P * 8
RGBA16 split:      P * 14 or P * 16
CMYK adaptation:   P * 13
```

Those values exclude at least:

- the 512 MiB LCMS shared heap;
- source ICC and destination ICC copies in WASM;
- the RGBA source copy in WASM;
- interleaved CMYK output;
- alpha output;
- copied JavaScript CMYK and alpha arrays;
- planar C/M/Y/K/A arrays;
- encoded Document Plan bytes;
- Broker admission snapshots;
- serializer working memory;
- final PSD output bytes.

The current field is therefore not an authoritative peak-memory measurement.

### 1.4 Confirmed out-of-band LCMS Worker

A separate `workers/lcmsWorker.js` and `lcmsWorkerClient.js` exist, but they:

- use the old `workerRpc.js` rather than EW02 Broker;
- create their own Worker and Pending Map;
- expose CMYK-to-RGBA proofing, not the PSD RGBA-to-CMYK production path;
- are outside the current PSD canonical job lineage.

EW07 does not adopt this raw RPC path as product authority.

### 1.5 Confirmed renderer ICC/global coupling

Current PSD ICC resolution may read:

```text
window.iccProfileBuffer
window.EXPORT_LCMS_PROOF
window.__LCMS_PROOF_ICC_URL
window.__DADUM_PROOF_ICC_URL
```

EW07 requires explicit command fields or manifest-owned bundled profile identities. Global state may remain a compatibility input adapter, but it cannot be the Worker contract or Receipt authority.

## 2. Problem Statement

EW04 can truthfully say:

```text
PSD bytes were serialized in a Worker.
```

It cannot yet truthfully say:

```text
PSD encoding was isolated from the Renderer Main Thread.
```

The current boundary permits all of the following:

1. Main-thread stalls during large RGBA plane splitting.
2. Main-thread stalls during LCMS transform creation and application.
3. A 512 MiB shared memory allocation in the Renderer realm.
4. Multiple full-frame copies before the EW02 Broker call.
5. A stale or mutable global ICC source.
6. Incomplete memory receipts.
7. Cancellation that terminates only the serializer Worker after the expensive LCMS work already occurred.
8. A false `mainThreadEncoderUsed:false` claim while color conversion and plane encoding still ran on the Main Thread.
9. Inconsistent restart semantics between LCMS and PSD serializer lifetimes.
10. Two worker authority systems, EW02 and legacy `workerRpc.js`.

EW07 closes these gaps without changing the external `dadum.encoder.psd.v1` identity.

## 3. Goals

EW07 SHALL:

1. Move all PSD pixel preparation into one Broker-owned Worker Generation.
2. Move the production LCMS RGBA8-to-CMYK8 path into that Worker.
3. Move RGBA8 and RGBA16 plane splitting into that Worker.
4. Move CMYK inversion and alpha extraction into that Worker.
5. Move PSD Document Plan construction and hashing into that Worker.
6. Preserve EW04 canonical serializer and structure verification.
7. Remove Renderer access to the production LCMS module for PSD jobs.
8. Replace approximate `temporaryBytePeak` with an owned-allocation ledger.
9. Bind ICC identities, transform parameters, pixel format, plane digests, and memory peak to the Export Receipt.
10. Ensure EW02 timeout, cancel, crash, and generation restart cover the complete PSD job.
11. Prevent the legacy LCMS Worker RPC from becoming a second production authority.
12. Leave non-PSD softproof behavior outside this specification unless shared code changes are required for isolation.

## 4. Non-goals

EW07 SHALL NOT claim or require:

- a new PSD file-format version;
- PSB support;
- multi-layer authoring beyond EW04's declared document modes;
- GPU-based LCMS;
- WebGPU plane splitting;
- 16-bit CMYK conversion;
- DeviceLink profile support;
- spot-color channels;
- Photoshop visual parity without an independent application corpus;
- full retirement of all legacy LCMS preview or softproof modules;
- memory usage derived from browser process heuristics as authoritative truth;
- automatic retry of an active color transform after Worker crash;
- silent fallback to an untransformed RGB PSD when CMYK export was requested.

## 5. Authority Model

### 5.1 Single PSD worker authority

The promoted Worker identity SHALL be:

```text
dadum.worker.encoder.psd-canonical-v2
```

It supersedes the product role of:

```text
dadum.worker.encoder.psd-canonical-v1
```

The v1 Worker may remain in rollback artifacts but SHALL be unreachable from the promoted Runtime graph.

### 5.2 Single product operation

The product operation SHALL be:

```text
encode.psd-canonical-v2
```

The old product operation:

```text
serialize.psd-document
```

SHALL be removed from active ExportManager reachability. It may remain as a test-only serializer fixture.

### 5.3 Ownership table

| Concern | Authority after EW07 |
|---|---|
| Final Surface revision | `PipelineService` |
| Encoder selection | `EncoderRegistryService` |
| Job admission, timeout, cancel, restart | `EncoderWorkerBrokerService` |
| Source pixel validation | PSD canonical v2 Worker |
| ICC resolution and hashing | PSD canonical v2 Worker |
| LCMS module and transform | PSD canonical v2 Worker |
| Alpha extraction | PSD canonical v2 Worker |
| RGB/CMYK plane construction | PSD canonical v2 Worker |
| PSD sample inversion | PSD canonical v2 Worker |
| Document Plan creation | PSD canonical v2 Worker |
| PSD serialization | EW04 canonical serializer inside same Worker |
| PSD structure verification | Worker and Runtime verifier parity |
| Output SHA-256 | Worker plus Runtime parity |
| Download | Host/Export Authority |

### 5.4 Renderer role

The Renderer SHALL only:

1. resolve user-visible settings;
2. acquire custom ICC bytes from explicit user action;
3. bind the authoritative final surface;
4. submit one immutable PSD encode command;
5. receive one encoded result and evidence envelope.

## 6. Worker Manifest Contract

The generated worker manifest SHALL declare:

```ts
{
  workerId: 'dadum.worker.encoder.psd-canonical-v2',
  runtimeEncoderIds: ['dadum.encoder.psd.v1'],
  codecProtocolVersion: 'dadum-psd-canonical-worker-v2',
  operations: ['encode.psd-canonical-v2'],
  entrySourceIdentity: 'vite:app/src/runtime/workers/entries/psd-canonical-v2.worker.ts',
  wasmPolicyId: 'psd-lcms-serializer-worker-closure-v1',
  artifactSet: [
    'psd-canonical-v2.worker.ts',
    'psd-canonical-v2-handler.js',
    'request-codec-v2.js',
    'psd_exporter_wasm.js',
    'psd_exporter_wasm_bg.wasm or source-reference serializer artifact',
    'lcms_icmsA.mjs',
    'lcms_icmsA.wasm',
    'bundled sRGB ICC',
    'manifest-owned proof ICC files'
  ]
}
```

Every emitted artifact SHALL receive a production SHA-256 before promotion.
Source-graph hashes do not satisfy emitted-artifact promotion.

## 7. Canonical PSD Encode Command v2

The Renderer-to-Broker payload SHALL be a command, not a prepared PSD plan.

```ts
interface PsdCanonicalEncodeCommandV2 {
  commandVersion: 2;
  sourceRevision: number;
  finalRevision: number;
  finalSurfaceId: string;

  width: number;
  height: number;
  sourcePixelFormat: 'rgba8' | 'rgba16-u16le';
  sourceBytes: ArrayBuffer;
  sourceByteLength: number;
  sourceSha256: string;

  documentMode:
    | 'layered-rgb8-single-layer'
    | 'flattened-rgb8'
    | 'flattened-rgb16'
    | 'flattened-cmyk8';

  compression: 'raw' | 'rle';
  layerName: string | null;
  dpiX: number;
  dpiY: number;

  colorTransform: {
    mode: 'none' | 'rgba8-to-cmyk8';
    sourceProfile: ProfileReferenceV1 | null;
    destinationProfile: ProfileReferenceV1 | null;
    intent: 'relative-colorimetric' | 'perceptual';
    blackPointCompensation: boolean;
    outputSamplePolicy: 'lcms-native-cmyk8';
    psdStoragePolicy: 'invert-cmyk8-for-psd-v1';
  };

  alphaPolicy: 'preserve-straight-alpha-v1';
  memoryBudgetBytes: number;
  memoryBudgetPolicyId: 'psd-owned-allocation-budget-v1';
}
```

### 7.1 Profile reference

```ts
interface ProfileReferenceV1 {
  source: 'inline-bytes' | 'runtime-artifact';
  profileId: string;
  expectedSha256: string;
  bytes?: ArrayBuffer;
  artifactId?: string;
}
```

Profile filename, UI label, or global variable SHALL NOT be accepted as profile identity.

### 7.2 Command digest

The Runtime SHALL canonicalize the non-byte metadata, bind the source byte digest and profile digests, and produce:

```text
psdEncodeCommandDigest
```

The Worker SHALL independently reconstruct and verify that digest before beginning allocations larger than the command header.

## 8. Input Admission and Ownership

### 8.1 Exact source length

For `rgba8`:

```text
sourceByteLength = width * height * 4
```

For `rgba16-u16le`:

```text
sourceByteLength = width * height * 4 * 2
```

Overflow-safe checked multiplication is mandatory.

### 8.2 Transfer policy

The canonical policy SHALL be:

```text
broker-transfer-snapshot-v1
```

The Broker SHALL transfer one exact source buffer into the Worker. The Renderer SHALL consider the transferred buffer detached after admission.

The Runtime SHALL NOT also send redundant aliases such as:

```text
rgba
rgbaUint8
rgba16
rgbaUint16
canvas
surface
```

Only one source representation may enter the Worker.

### 8.3 No canvas or global fallback

The Worker and bridge SHALL reject commands that rely on:

- Canvas extraction;
- `window.iccProfileBuffer`;
- `window.__DADUM_FILTERED_SURFACE__`;
- `window.EXPORT_LCMS_PROOF`;
- source-surface downgrade;
- inferred profile filenames.

## 9. Worker Stage Machine

Each accepted job SHALL advance through these states:

```text
ADMITTED
  -> SOURCE_VALIDATED
  -> PROFILE_VALIDATED
  -> MEMORY_RESERVED
  -> LCMS_READY
  -> TRANSFORM_READY
  -> PIXELS_PREPARED
  -> PLAN_BUILT
  -> SERIALIZED
  -> STRUCTURE_VERIFIED
  -> OUTPUT_HASHED
  -> MEMORY_CLOSED
  -> COMPLETED
```

Terminal failures:

```text
REJECTED
CANCELLED
TIMED_OUT
CRASHED
MEMORY_BUDGET_EXCEEDED
COLOR_TRANSFORM_FAILED
SERIALIZER_FAILED
VERIFY_FAILED
```

A stage may only be entered once. Stage transitions SHALL be recorded in the Worker Job Receipt.

## 10. Plane Preparation Contract

### 10.1 RGB8

The Worker SHALL split RGBA8 into R, G, B, and optional alpha planes.

- Alpha is omitted only when every alpha sample is 255.
- Hidden RGB under alpha zero SHALL be preserved exactly.
- Plane order SHALL be R, G, B, then alpha channel `-1` when present.

### 10.2 RGB16

The input storage contract is `rgba16-u16le`.

The Worker SHALL:

1. read little-endian 16-bit samples;
2. preserve all 16 bits;
3. produce PSD big-endian plane bytes;
4. preserve alpha 65535 semantics;
5. forbid U8 expansion masquerading as native 16-bit input.

### 10.3 CMYK8

CMYK8 output SHALL be created only by the declared LCMS transform.

The stages SHALL be semantically separated:

```text
LCMS native output sample
  -> lcms-native-cmyk8
  -> PSD storage inversion
  -> psd-inverted-cmyk8
```

The Receipt SHALL record both policies. A single boolean `cmykInversionApplied` is insufficient without source and target sample semantics.

### 10.4 Fused preparation

An implementation MAY fuse alpha extraction, CMYK inversion, and planarization in one row pass.

If fused, the implementation SHALL still produce independent digests for:

- native interleaved CMYK semantic output;
- stored C plane;
- stored M plane;
- stored Y plane;
- stored K plane;
- alpha plane when present.

The native interleaved semantic digest MAY be generated incrementally and does not require a persistent full-frame JavaScript copy.

## 11. LCMS Worker Closure

### 11.1 LCMS realm

For PSD jobs:

```text
colorTransformRealm = dedicated-worker
```

The Renderer SHALL have zero active imports of `getLCMS()` through the PSD export graph.

### 11.2 Module singleton

The PSD canonical v2 Worker MAY retain one LCMS module per Worker Generation.

The module SHALL be destroyed only by Worker termination because Emscripten module teardown is not guaranteed to release all shared-memory and pthread state safely.

### 11.3 Transform cache

Transforms MAY be cached within one Worker Generation using this key:

```text
sourceProfileSha256
+ destinationProfileSha256
+ inputFormat
+ outputFormat
+ intent
+ blackPointCompensation
+ lcmsArtifactSetDigest
```

Rules:

- maximum two live transforms;
- deterministic LRU eviction;
- close evicted transform and profile handles;
- no cache reuse across Worker Generation;
- no cache key based on filename or UI label;
- cache hit/miss SHALL appear in the Receipt.

### 11.4 Exact production ABI

The production CMYK path SHALL use the exact declared ABI:

```text
_icms_xform_create_rgba8_to_cmyk8
_icms_xform_apply_rgba8_to_cmyk8
_icms_xform_destroy
```

Alternative LCMS wrappers, preview LUTs, `proofCmykToRgba8`, and fallback `.cube` transforms are not product-equivalent.

### 11.5 Transform failure

A requested `flattened-cmyk8` export SHALL fail closed when:

- source ICC cannot be resolved;
- destination ICC cannot be resolved;
- profile digest differs from the command;
- transform creation returns zero;
- transform application reports failure;
- LCMS artifact identity differs from the manifest;
- memory budget cannot accommodate the transform.

It SHALL NOT continue as RGB PSD.

## 12. ICC and Color Contract

### 12.1 Source profile

The source profile SHALL be determined as follows:

1. explicit inline profile with verified digest;
2. manifest-owned profile referenced by artifact ID;
3. bundled sRGB only when the Final Surface color contract explicitly states canonical sRGB.

No other inference is allowed.

### 12.2 Destination profile

`flattened-cmyk8` requires one destination CMYK ICC profile.
The exact destination profile bytes transformed against SHALL be the exact profile bytes embedded in the PSD resource.

### 12.3 Rendering intent

Supported product intents:

```text
relative-colorimetric
perceptual
```

Black-point compensation SHALL be explicit.
No hidden default may be applied after command admission.

### 12.4 Alpha

LCMS SHALL transform only color samples. Alpha SHALL be preserved independently and exactly.

### 12.5 Color transform evidence

The Worker SHALL report:

```text
lcmsImplementationId
lcmsArtifactSetDigest
sourceProfileId
sourceProfileSha256
destinationProfileId
destinationProfileSha256
renderingIntent
blackPointCompensation
inputPixelFormat
outputPixelFormat
transformCacheHit
transformCreationSequence
transformApplyCount
nativeCmykDigest
psdStoredCmykPlaneDigests
alphaDigest
```

## 13. Memory Accounting SSOT

### 13.1 Authoritative scope

EW07 defines authoritative **owned allocation accounting**, not whole-process memory measurement.

The authoritative value is:

```text
peakOwnedBytes
```

It includes every buffer or heap region owned by the PSD Worker pipeline that can be deterministically attributed.

Optional browser process measurements SHALL be labeled observational and SHALL NOT replace the owned ledger.

### 13.2 Allocation ledger record

```ts
interface PsdAllocationRecordV1 {
  allocationId: string;
  stage: string;
  owner: 'broker' | 'worker-js' | 'lcms-wasm' | 'serializer-wasm';
  kind: string;
  byteLength: number;
  lifetimeStartSequence: number;
  lifetimeEndSequence: number | null;
  released: boolean;
}
```

### 13.3 Mandatory accounted regions

At minimum:

- transferred source buffer;
- inline source ICC bytes;
- inline destination ICC bytes;
- LCMS WebAssembly memory byte length;
- LCMS profile heap allocations;
- LCMS source image allocation;
- LCMS output CMYK allocation;
- LCMS alpha allocation;
- JavaScript planar outputs;
- Document Plan bytes;
- serializer WASM memory, when separately allocated;
- serializer output staging bytes;
- final returned PSD bytes;
- digest scratch buffers larger than the configured threshold.

### 13.4 Current 512 MiB heap truth

The inherited LCMS module creates a 512 MiB shared memory. Until rebuilt, EW07 SHALL report:

```text
lcmsWasmMemoryBytes = 536870912
lcmsMemoryMode = fixed-shared-512m-inherited
lcmsMemoryPromotionState = unpromoted
```

Moving that heap into a Worker improves Main Thread isolation but does not make the heap small.

### 13.5 Memory budget

The command SHALL include an explicit `memoryBudgetBytes` from the Runtime profile.
Missing budget is a configuration error.

Before transform execution, the Worker SHALL compute a conservative reservation:

```text
predictedPeakOwnedBytes
```

If:

```text
predictedPeakOwnedBytes > memoryBudgetBytes
```

the job SHALL fail with `E_PSD_MEMORY_BUDGET_EXCEEDED` before the transform starts.

### 13.6 Peak conservation

At completion or failure:

```text
liveOwnedBytes = 0
```

except generation-lifetime allocations explicitly listed as retained:

- LCMS module memory;
- cached profile bytes;
- cached transforms;
- serializer module memory.

Those retained allocations SHALL be separately reported as:

```text
generationResidentBytes
```

### 13.7 Peak formulas

For diagnostics, the Receipt SHALL report:

```text
sourceBytes
profileBytes
lcmsFixedHeapBytes
lcmsDynamicBytes
planeBytes
documentPlanBytes
serializerWorkingBytes
outputBytes
peakOwnedBytes
generationResidentBytes
budgetBytes
budgetHeadroomBytes
```

The old `temporaryBytePeak` field SHALL be retired from product receipts.

## 14. Peak-memory Reduction Requirements

EW07 source closure requires correct accounting first. Final promotion additionally requires avoiding gratuitous full-frame duplicates.

The promoted implementation SHALL satisfy:

1. one transferred source buffer;
2. no Renderer copy after Broker admission;
3. no JavaScript copy of the LCMS input when WASM can read the transferred source through one controlled upload;
4. no persistent interleaved CMYK JavaScript copy when fused planarization is available;
5. no Renderer-side Document Plan bytes;
6. no post-Worker output mutation;
7. final PSD bytes transferred once back to the Runtime;
8. all unavoidable copies listed in the allocation ledger.

A source-baked implementation may retain inherited ABI copies, but promotion SHALL be blocked until the peak report reflects actual copies and fits the declared profile budget.

## 15. Broker, Cancel, Timeout, and Crash Semantics

### 15.1 Complete-job coverage

The EW02 execution timeout SHALL begin before ICC load and include:

- profile resolution;
- LCMS initialization;
- transform creation;
- transform application;
- plane preparation;
- plan construction;
- serialization;
- structure verification;
- output hashing.

### 15.2 Active cancel

LCMS transform application may be synchronous and non-cooperative.
If cooperative cancellation is not observed within `cancelGraceMs`, EW02 SHALL terminate the Worker Generation.

Termination SHALL release:

- the 512 MiB LCMS memory;
- transforms;
- profile handles;
- plane buffers;
- serializer memory;
- active output staging.

### 15.3 Crash restart

An active PSD job SHALL never be replayed automatically after crash.
Queued jobs MAY resume after a fresh Generation reaches READY.

### 15.4 Circuit open

The EW02 restart budget remains authoritative. A repeatedly crashing LCMS or serializer artifact SHALL open the Worker circuit and make PSD temporarily unavailable.

## 16. Canonical Worker Result

```ts
interface PsdCanonicalWorkerResultV2 {
  u8: Uint8Array;
  mime: 'image/vnd.adobe.photoshop';
  ext: 'psd';

  psdEvidence: {
    workerId: 'dadum.worker.encoder.psd-canonical-v2';
    codecProtocolVersion: 'dadum-psd-canonical-worker-v2';
    operation: 'encode.psd-canonical-v2';

    sourceSha256: string;
    psdEncodeCommandDigest: string;
    documentPlanDigest: string;
    outputSha256: string;

    documentMode: string;
    colorMode: 'rgb' | 'cmyk';
    depth: 8 | 16;
    compression: 'raw' | 'rle';
    planeDigests: string[];

    planePreparationRealm: 'dedicated-worker';
    colorTransformRealm: 'dedicated-worker' | 'none';
    byteWriterRealm: 'dedicated-worker';
    mainThreadPixelPreparationUsed: false;
    mainThreadColorTransformUsed: false;
    mainThreadByteWriterUsed: false;

    colorTransformEvidence: object;
    memoryEvidence: object;
    serializerEvidence: object;
    structureEvidence: object;
  };
}
```

The Runtime SHALL recompute `outputSha256` and verify parity before producing an Export Receipt.

## 17. Export Receipt Truth Seal

The R7 Export Receipt SHALL add:

```text
psdPromotionId = TDT-EXPORT-WORKER-07
psdWorkerId = dadum.worker.encoder.psd-canonical-v2
psdCodecProtocolVersion = dadum-psd-canonical-worker-v2
psdOperation = encode.psd-canonical-v2

psdSourcePixelFormat
psdSourceByteLength
psdSourceSha256
psdEncodeCommandDigest
psdDocumentPlanDigest

psdPlanePreparationRealm
psdPlanePreparationImplementationId
psdPlaneCount
psdPlaneDigests
psdAlphaPresent
psdAlphaDigest

psdColorTransformApplied
psdColorTransformRealm
psdColorTransformImplementationId
psdLcmsArtifactSetDigest
psdSourceProfileId
psdSourceProfileSha256
psdDestinationProfileId
psdDestinationProfileSha256
psdRenderingIntent
psdBlackPointCompensation
psdNativeCmykDigest
psdCmykStoragePolicyId

psdMemoryPolicyId
psdMemoryBudgetBytes
psdPredictedPeakOwnedBytes
psdPeakOwnedBytes
psdGenerationResidentBytes
psdLcmsWasmMemoryBytes
psdBudgetHeadroomBytes
psdAllocationLedgerDigest
psdLiveOwnedBytesAtSettlement

psdSerializerImplementationId
psdSerializerAbiVersion
psdCanonicalRustWasm
psdStructureVerifierId
psdStructureVerified
psdOutputSha256
psdPostWorkerMutation

psdMainThreadPixelPreparationUsed
psdMainThreadColorTransformUsed
psdMainThreadByteWriterUsed
psdFinalMainThreadIsolationVerified
```

Successful EW07 product receipts require all three Main Thread usage fields to be `false`.

## 18. Stable Errors

EW07 SHALL register at least:

```text
E_PSD_COMMAND_VERSION_UNSUPPORTED
E_PSD_SOURCE_LENGTH_MISMATCH
E_PSD_SOURCE_DIGEST_MISMATCH
E_PSD_SOURCE_FORMAT_UNSUPPORTED
E_PSD_COMMAND_DIGEST_MISMATCH
E_PSD_PROFILE_REFERENCE_INVALID
E_PSD_PROFILE_DIGEST_MISMATCH
E_PSD_SOURCE_PROFILE_REQUIRED
E_PSD_DESTINATION_PROFILE_REQUIRED
E_PSD_LCMS_ARTIFACT_MISMATCH
E_PSD_LCMS_INIT_FAILED
E_PSD_LCMS_TRANSFORM_CREATE_FAILED
E_PSD_LCMS_TRANSFORM_APPLY_FAILED
E_PSD_COLOR_MODE_DOWNGRADE_FORBIDDEN
E_PSD_CMYK_STORAGE_POLICY_MISMATCH
E_PSD_PLANE_PREPARATION_FAILED
E_PSD_PLANE_DIGEST_MISMATCH
E_PSD_DOCUMENT_PLAN_BUILD_FAILED
E_PSD_MEMORY_BUDGET_MISSING
E_PSD_MEMORY_BUDGET_EXCEEDED
E_PSD_ALLOCATION_LEDGER_UNBALANCED
E_PSD_LIVE_ALLOCATION_LEAK
E_PSD_MAIN_THREAD_PREPARATION_FORBIDDEN
E_PSD_LEGACY_LCMS_RPC_FORBIDDEN
E_PSD_WORKER_V1_REACHABILITY_FORBIDDEN
E_PSD_OUTPUT_MUTATED_AFTER_WORKER
E_PSD_STRUCTURE_VERIFY_FAILED
E_PSD_FINAL_ISOLATION_UNVERIFIED
```

## 19. Static Gates

The implementation SHALL include the following static gates.

### GATE-EW07-01: Worker identity
Only `dadum.worker.encoder.psd-canonical-v2` may own the promoted PSD operation.

### GATE-EW07-02: Product operation
`encode.psd-canonical-v2` SHALL be present in Worker manifest and EW02 allowlist.

### GATE-EW07-03: Old serializer-only operation unreachable
`serialize.psd-document` SHALL not be reachable from active ExportManager code.

### GATE-EW07-04: Renderer LCMS import zero
The active PSD bridge SHALL not import `getLCMS`, `lcmsLoader`, `proof_export`, or `lcms_icmsA`.

### GATE-EW07-05: Renderer plane split zero
Active Renderer PSD code SHALL not contain product implementations of RGBA8 split, RGBA16 split, CMYK split, or CMYK inversion.

### GATE-EW07-06: Renderer plan construction zero
Active Renderer PSD code SHALL not call `encodePsdDocumentPlanV2`.

### GATE-EW07-07: One source representation
PSD Broker calls SHALL carry exactly one source buffer.

### GATE-EW07-08: Canvas fallback zero
No active PSD command may carry or read Canvas.

### GATE-EW07-09: Global ICC authority zero
The Worker contract SHALL not read global window ICC variables.

### GATE-EW07-10: Explicit profile digest
Every profile reference SHALL include expected SHA-256.

### GATE-EW07-11: EW02-only Worker creation
Legacy `workerRpc.js` SHALL be unreachable from the PSD product graph.

### GATE-EW07-12: Complete operation timeout
The Broker operation timeout SHALL cover the v2 operation.

### GATE-EW07-13: Memory budget required
The command schema SHALL require `memoryBudgetBytes`.

### GATE-EW07-14: Allocation ledger implemented
The Worker SHALL emit allocation-ledger evidence.

### GATE-EW07-15: Fixed heap reported
Inherited 512 MiB LCMS memory SHALL appear in source-bake evidence.

### GATE-EW07-16: Transform key exactness
Cache key SHALL bind both profile digests, intent, BPC, formats, and artifact digest.

### GATE-EW07-17: Transform cache generation-local
No transform cache may survive Worker Generation restart.

### GATE-EW07-18: Alpha exact policy
Alpha handling SHALL be explicit and independent from LCMS color conversion.

### GATE-EW07-19: CMYK semantics separated
Native LCMS samples and PSD stored inverted samples SHALL have separate policy IDs.

### GATE-EW07-20: RGB16 exact source contract
RGB16 SHALL accept only native U16LE input, not expanded RGBA8.

### GATE-EW07-21: Plan built in Worker
Document Plan digest SHALL originate in the Worker result.

### GATE-EW07-22: Serializer same-generation
Serializer execution SHALL occur in the same Worker Generation as LCMS and plane preparation.

### GATE-EW07-23: Worker structure verification
The Worker SHALL run PSD Structure Verifier v2 before returning.

### GATE-EW07-24: Runtime structure parity
The Runtime SHALL independently verify structure evidence parity.

### GATE-EW07-25: Output mutation zero
Worker SHA and Runtime SHA SHALL match.

### GATE-EW07-26: Main-thread pixel preparation false
A successful receipt SHALL require false.

### GATE-EW07-27: Main-thread color transform false
A successful receipt SHALL require false.

### GATE-EW07-28: Main-thread byte writer false
A successful receipt SHALL require false.

### GATE-EW07-29: Live owned bytes closure
Every terminal job SHALL report zero job-lifetime live bytes.

### GATE-EW07-30: Generation resident bytes explicit
Retained module/cache memory SHALL be separately reported.

### GATE-EW07-31: Budget admission fail-closed
Predicted over-budget jobs SHALL not start LCMS transform.

### GATE-EW07-32: No silent RGB fallback
CMYK failures SHALL not produce RGB PSD.

### GATE-EW07-33: ICC embedded equals transformed destination
Destination profile digest SHALL equal embedded ICC digest.

### GATE-EW07-34: Manifest artifact set
LCMS and serializer artifacts SHALL be in the worker artifact set.

### GATE-EW07-35: Emitted asset digest required for promotion
Source-only digests SHALL block final promotion.

### GATE-EW07-36: Cancel releases generation
Hard cancel SHALL terminate the Worker and close its retained heap.

### GATE-EW07-37: Crash does not replay active job
Active PSD jobs SHALL fail exactly once.

### GATE-EW07-38: Queued resume after READY
Queued jobs may continue only after new Generation READY.

### GATE-EW07-39: Receipt determinism
Identical input, profiles, settings, and artifact set SHALL produce identical command and evidence digests.

### GATE-EW07-40: Legacy v1 worker unreachable
The v1 PSD Worker SHALL be absent from active worker descriptor records.

### GATE-EW07-41: Stable error registry parity
All EW07 errors SHALL be declared and used.

### GATE-EW07-42: R7 receipt parity
Export Receipt schema, ledger, and verification SHALL agree 100%.

### GATE-EW07-43: EW02 pending closure
Terminal pending jobs SHALL equal zero.

### GATE-EW07-44: Parent regression
R7 and EW01 through EW06 gates SHALL remain PASS.

### GATE-EW07-45: Final isolation report
A machine-readable report SHALL show zero Renderer PSD pixel/LCMS/byte-writer reachability.

### GATE-EW07-46: Package and build truth
Missing dependencies, stale lockfiles, or unbuilt artifacts SHALL keep status `SOURCE_BAKED_UNPROMOTED`.

## 20. Runtime Test Matrix

At least the following tests SHALL be implemented.

### Admission and identity

1. Valid RGBA8 layered command.
2. Valid RGBA8 flattened command.
3. Valid RGBA16 flattened command.
4. Valid RGBA8-to-CMYK8 command.
5. Invalid command version.
6. Invalid source byte length.
7. Source digest mismatch.
8. Unsupported source format.
9. Command digest mismatch.
10. Missing memory budget.

### ICC and transform

11. Explicit sRGB source plus CMYK destination.
12. Manifest-owned sRGB fallback with canonical sRGB surface contract.
13. Missing destination ICC.
14. Destination digest mismatch.
15. Relative colorimetric plus BPC.
16. Relative colorimetric without BPC.
17. Perceptual plus BPC.
18. Transform cache miss.
19. Transform cache hit.
20. Transform cache eviction.
21. Transform cache invalidated by Generation restart.
22. LCMS init failure.
23. Transform creation failure.
24. Transform application failure.
25. CMYK failure cannot return RGB PSD.

### Plane preparation

26. Opaque RGBA8 produces three planes.
27. Transparent RGBA8 produces four planes.
28. Hidden RGB under alpha zero preserved.
29. RGBA16 U16LE to PSD U16BE exact fixture.
30. RGBA8 expansion rejected for native RGB16 mode.
31. CMYK inversion exact fixture.
32. Alpha preserved independently through CMYK transform.
33. Plane digest mismatch rejected.
34. Fused CMYK planarization semantic digest parity.

### Memory

35. Budget comfortably above predicted peak.
36. Budget equal to predicted peak.
37. Budget one byte below predicted peak.
38. 512 MiB inherited LCMS heap present in ledger.
39. Profile allocations appear in ledger.
40. Plane buffers appear in ledger.
41. Serializer output appears in ledger.
42. Job-lifetime live bytes zero after success.
43. Job-lifetime live bytes zero after transform failure.
44. Job-lifetime live bytes zero after serializer failure.
45. Generation resident bytes explicit after success.
46. Hard cancel destroys generation resident bytes.
47. Peak accounting deterministic across identical jobs.

### Broker lifecycle

48. Queue timeout before start.
49. Active execution timeout during LCMS.
50. Queued abort.
51. Active abort with cooperative cancel unavailable.
52. Hard cancel terminates generation.
53. Crash during transform.
54. Crash during plane split.
55. Crash during serialization.
56. Active job not replayed.
57. Queued job resumes after new READY.
58. Restart budget opens circuit.
59. Terminal pending equals zero.

### PSD output

60. Layered RGB8 RAW.
61. Layered RGB8 RLE.
62. Flattened RGB8 RAW.
63. Flattened RGB8 RLE.
64. Flattened RGB16 RAW.
65. Flattened RGB16 RLE.
66. Flattened CMYK8 RAW with ICC.
67. Flattened CMYK8 RLE with ICC.
68. DPI X/Y preserved.
69. Destination ICC resource exactly one.
70. Structure boundary corruption rejected.
71. Output post-mutation rejected.
72. Exact EOF.

### Isolation and regression

73. Renderer PSD bridge contains no LCMS import.
74. Renderer PSD bridge contains no plane split implementation.
75. Renderer PSD bridge contains no Plan encoder call.
76. Renderer main-thread frame responsiveness smoke during large PSD export.
77. Legacy LCMS raw Worker RPC unreachable from PSD export.
78. v1 PSD Worker unreachable.
79. R7 receipt parity.
80. EW02 pending closure.
81. EW03 PNG/WebP regression.
82. EW04 serializer regression.
83. EW05 JXL regression.
84. EW06 JPEG regression.

## 21. Independent Color Validation

A PSD CMYK promotion SHALL include a reference corpus generated by a separately executed LCMS reference path.

The reference path SHALL not reuse the same Worker result buffer.
Acceptable evidence includes:

- native LittleCMS command-line/reference harness;
- separately built deterministic LCMS test binary;
- known-answer fixture generated and sealed outside the Renderer.

Required comparisons:

```text
native CMYK channel parity: exact or declared <= 1 LSB tolerance
alpha parity: exact
source profile digest: exact
destination profile digest: exact
intent and BPC: exact
PSD stored inversion: exact
```

A round-trip CMYK-to-RGB comparison may be included as an additional perceptual diagnostic, but it is not a substitute for native CMYK reference parity.

## 22. Main-thread Isolation Report

EW07 SHALL generate:

```text
TDT_EXPORT_WORKER_07_MAIN_THREAD_ISOLATION_REPORT.json
```

Required fields:

```json
{
  "psdBridgeImportsLcms": false,
  "psdBridgeSplitsPlanes": false,
  "psdBridgeBuildsDocumentPlan": false,
  "psdBridgeInvertsCmyk": false,
  "psdBridgeWritesPsdBytes": false,
  "psdBridgeMutatesWorkerOutput": false,
  "legacyLcmsWorkerRpcReachableFromPsd": false,
  "psdCanonicalWorkerV1Reachable": false,
  "psdCanonicalWorkerV2Reachable": true,
  "finalMainThreadIsolationVerified": true
}
```

A report generated only by string absence is insufficient for final promotion. Production bundle reachability SHALL also be verified.

## 23. Memory Report

EW07 SHALL generate:

```text
TDT_EXPORT_WORKER_07_PEAK_MEMORY_REPORT.json
```

It SHALL contain, per corpus case:

- dimensions and pixel count;
- source format;
- document mode;
- source bytes;
- profile bytes;
- LCMS fixed heap bytes;
- LCMS dynamic bytes;
- plane bytes;
- plan bytes;
- serializer working bytes;
- output bytes;
- predicted peak;
- observed owned peak;
- generation resident bytes;
- budget;
- headroom;
- terminal live bytes;
- cancellation cleanup status.

The report SHALL clearly separate:

```text
authoritative owned allocation ledger
observational process memory sample
```

## 24. Promotion Artifacts

Required artifacts:

```text
TDT_EXPORT_WORKER_07_FIX_RECEIPT.json
TDT_EXPORT_WORKER_07_PSD_PIPELINE_PROMOTION_RECEIPT.json
TDT_EXPORT_WORKER_07_MAIN_THREAD_ISOLATION_REPORT.json
TDT_EXPORT_WORKER_07_PEAK_MEMORY_REPORT.json
TDT_EXPORT_WORKER_07_LCMS_ARTIFACT_REPORT.json
TDT_EXPORT_WORKER_07_COLOR_REFERENCE_PARITY_REPORT.json
TDT_EXPORT_WORKER_07_PSD_INDEPENDENT_ROUNDTRIP_REPORT.json
TDT_EXPORT_WORKER_07_WORKER_GENERATION_CLOSURE_REPORT.json
SOURCE_BAKE_FINAL_VERIFY_EXPORT_WORKER_07.txt
TDT_EXPORT_WORKER_07_FILE_INVENTORY.sha256
```

Promotion Receipt SHALL distinguish:

```text
sourceClosurePass
viteWorkerBundlePass
emittedArtifactDigestPass
electronE2ePass
lcmsReferenceParityPass
psdIndependentDecoderPass
peakMemoryBudgetPass
finalMainThreadIsolationPass
```

Final promotion requires all fields true.

## 25. Source Bake versus Promotion

### Source-baked state

EW07 may be source-baked when:

- v2 Worker graph exists;
- Renderer production preparation is removed;
- static gates pass;
- strict TypeScript passes;
- deterministic source manifests exist;
- fixture-level Worker logic tests pass;
- unavailable production tools are reported honestly.

Status:

```text
SOURCE_BAKED_UNPROMOTED
```

### Promoted state

Promotion additionally requires:

- current package lock consistent with package manifest;
- Vite production build;
- emitted Worker and WASM hashes;
- Electron E2E;
- real LCMS transform corpus;
- independent CMYK reference parity;
- real PSD decoder round-trip;
- measured owned peak under declared budget;
- cancellation/restart cleanup under production bundle;
- zero active Renderer PSD pixel preparation.

## 26. Rollback

Rollback SHALL restore the complete parent EW06 artifact set.

Rules:

1. Do not mix v2 command bridge with v1 Worker.
2. Do not mix v1 plan bytes with v2 full-pipeline operation.
3. Do not leave both v1 and v2 Worker descriptors active.
4. Do not retain v2 Receipt fields while routing to renderer preparation.
5. Rollback SHALL invalidate all EW07 Worker Generation and transform caches.
6. Rollback Receipt SHALL record the exact parent Build ID and file inventory digest.

## 27. Implementation Map

Expected primary changes:

```text
app/src/runtime/workers/entries/psd-canonical-v2.worker.ts
app/src/runtime/workers/generated-worker-manifest.ts
app/src/runtime/workers/generated-worker-manifest.json
app/src/runtime/workers/encoder-worker-types.ts
app/src/runtime/workers/encoder-worker-broker-service.ts

app/legacy-runtime/libs/psd/psd_export_bridge.js
app/legacy-runtime/worker-codecs/psd-canonical-v2-handler.js
app/legacy-runtime/libs/psd/request-codec-v2.js
app/legacy-runtime/libs/lcms/lcmsLoader.js or worker-local successor

app/src/runtime/codecs/psd/psd-structure-verifier-v2.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
app/src/boot/stable-error.ts
```

The existing `workers/lcmsWorkerClient.js`, `workers/lcmsWorker.js`, and `workerRpc.js` SHALL NOT be promoted into the PSD product path.

## 28. Acceptance Criteria

EW07 is complete only when all are true:

```text
PSD renderer plane split count = 0
PSD renderer LCMS transform count = 0
PSD renderer plan-build count = 0
PSD renderer byte-writer count = 0
PSD worker v1 product reachability = 0
legacy LCMS RPC product reachability = 0
PSD worker v2 product reachability = 1
CMYK silent downgrade count = 0
profile digest mismatch acceptance = 0
unbudgeted PSD job admission = 0
terminal job liveOwnedBytes = 0
post-worker output mutation count = 0
R7 receipt parity = 100%
EW02 terminal pending = 0
parent gate regression = 0
```

Final Promotion additionally requires:

```text
production worker 404 = 0
emitted artifact digest missing = 0
Electron PSD E2E failures = 0
LCMS reference parity failures = 0
independent PSD decode failures = 0
peak budget violations = 0
final main-thread isolation violations = 0
```

## 29. SSOT Summary

```text
Surface authority       = PipelineService
Encoder authority       = EncoderRegistryService
Job authority           = EW02 Broker
PSD pipeline authority  = psd-canonical-v2 Worker
Color authority         = explicit ICC references + worker-local LCMS
Plane authority         = psd-canonical-v2 Worker
Byte authority          = EW04 serializer in same Worker Generation
Memory authority        = Worker-owned allocation ledger
Receipt authority       = ExportAuthorityService + Receipt Ledger
```

No other component may silently fill a missing authority role.

## 30. Follow-up

After EW07, the next specification SHALL be:

```text
TDT-EXPORT-PROMOTION-01

Legacy Export Facade Retirement /
Canonical Runtime Export Ownership /
Production Build·Electron E2E /
Cross-format Promotion Receipt /
Rollback Closure Seal
```

That stage retires Legacy direct download and direct codec ownership only after WebP, PNG, PSD, JXL, and JPEG promotion evidence is available.

---

# Appendix A. Normative Checklist
- [ ] A-01. The PSD bridge submits source pixels, not prepared planes.
- [ ] A-02. The PSD bridge does not import LCMS.
- [ ] A-03. The PSD bridge does not import the Plan encoder.
- [ ] A-04. The Worker validates source digest before transform.
- [ ] A-05. The Worker validates profile digests before transform.
- [ ] A-06. The Worker reserves memory before transform.
- [ ] A-07. The Worker owns LCMS module lifetime.
- [ ] A-08. The Worker owns transform lifetime.
- [ ] A-09. The Worker owns alpha extraction.
- [ ] A-10. The Worker owns RGB and CMYK plane creation.
- [ ] A-11. The Worker owns CMYK inversion semantics.
- [ ] A-12. The Worker builds the Document Plan.
- [ ] A-13. The Worker invokes the canonical serializer.
- [ ] A-14. The Worker runs structure verification.
- [ ] A-15. The Worker hashes final output.
- [ ] A-16. The Runtime rehashes final output.
- [ ] A-17. The output is not mutated after Worker return.
- [ ] A-18. The allocation ledger closes on every terminal path.
- [ ] A-19. Generation resident bytes are not mislabeled as job leaks.
- [ ] A-20. Hard cancel destroys the generation when LCMS is non-cooperative.
- [ ] A-21. Active jobs are not replayed after crash.
- [ ] A-22. Queued jobs resume only after READY.
- [ ] A-23. The destination ICC transformed against is the ICC embedded.
- [ ] A-24. CMYK failure never returns RGB PSD.
- [ ] A-25. RGB16 is native U16LE input, not U8 expansion.
- [ ] A-26. Hidden RGB is preserved for RGB documents.
- [ ] A-27. Alpha is preserved independently from LCMS.
- [ ] A-28. The 512 MiB inherited heap is reported until rebuilt.
- [ ] A-29. Missing production bundle evidence blocks promotion.
- [ ] A-30. Missing independent color reference evidence blocks promotion.
