# TDT-EXPORT-PROMOTION-01

## Legacy Export Facade Retirement / Canonical Runtime Export Ownership / Production Build and Electron E2E / Cross-format Promotion Receipt / Rollback Closure Seal

- Document ID: `TDT-EXPORT-PROMOTION-01`
- Short ID: `TDT-EP01`
- Parent line:
  - `TDT-RUNTIME-SSOT-01-R7`
  - `TDT-EXPORT-WORKER-01`
  - `TDT-EXPORT-WORKER-02`
  - `TDT-EXPORT-WORKER-03`
  - `TDT-EXPORT-WORKER-04`
  - `TDT-EXPORT-WORKER-05`
  - `TDT-EXPORT-WORKER-06`
  - `TDT-EXPORT-WORKER-07`
- Target state: `PRODUCTION_PROMOTED`
- Initial bake state: `SOURCE_BAKED_UNPROMOTED`
- Promotion authority: generated cross-format promotion receipt plus packaged Electron E2E evidence
- Rollback authority: whole-build promotion pointer only
- In-process codec fallback: forbidden
- Silent Legacy fallback: forbidden

---

# 0. Executive decision

`TDT-EXPORT-PROMOTION-01` is the final ownership transfer for the export subsystem.

EW01 through EW07 established Worker URL ownership, Broker Job ownership, format-specific codec identity, format semantics, output verification, and main-thread isolation for the promoted codec paths.

However, the application is not yet production-promoted because the following authorities remain split:

1. Legacy `window.ExportManager` still owns mutable registration and exact invocation.
2. `resize_export_bind.js` still invokes `ExportManager.exportByFormat()` directly.
3. `main.js` calls Runtime Export but compares a stage-coded authority string.
4. Runtime Export returns an Object URL and the Legacy UI performs the download.
5. The Electron preload has no exact export-save boundary.
6. The packaged output has not been proven with emitted Worker and WASM digests.
7. Cross-format independent decode and on-disk round-trip evidence is incomplete.
8. Rollback is not represented by a single explicit whole-build pointer.
9. The current `package-lock.json` does not contain the declared Vue, Pinia, Vite, TypeScript, or vue-tsc dependency graph.
10. Source-bake receipts are being produced, but no aggregate production promotion receipt can currently become authoritative.

EP01 resolves these splits by enforcing the following final authority line:

```text
Legacy codec registration during controlled boot
  -> one-time sealed adoption snapshot
  -> private Runtime Encoder Host capability
  -> window.ExportManager retired and non-callable
  -> stable Dadum Runtime Export API
  -> authoritative Final Surface
  -> exact Runtime Encoder identity
  -> EW02 Worker Broker
  -> verified encoded bytes
  -> Electron Host atomic save session
  -> host-side output SHA-256
  -> independent decoder round-trip
  -> cross-format promotion receipt
  -> whole-build promotion pointer
```

No UI module, Legacy module, Worker adapter, or browser download helper may own an alternate export path after EP01 promotion.

---

# 1. Source-grounded current-state findings

This section records the exact defects and split authorities observed in the EW07 source tree.

## 1.1 Active Legacy boot still loads export authorities

The active Legacy manifest includes:

```text
./export_manager.js
./resize_export_bind.js
./main.js
```

`export_manager.js` is therefore not dormant or quarantined. It remains an active boot root.

## 1.2 Runtime still adopts a mutable global manager

`EncoderRegistryService.initialize()` currently performs:

```text
window.ExportManager
  -> validateManager()
  -> listEncoderRecords()
  -> capture identity and registryRevision
  -> build RuntimeEncoderRecord closures
```

Each Runtime encoder closure still calls:

```text
manager.exportByFormatExact(...)
```

The Runtime checks registry revision drift, but the invocation authority is still a mutable global object retained in the Renderer realm.

## 1.3 Legacy direct permissive dispatch remains reachable

`export_manager.js` still exposes:

```text
register()
registerLazy()
exportByFormat()
exportByFormatExact()
listEncoderRecords()
listEncoders()
```

`exportByFormat()` still contains Legacy semantics such as:

- display-label normalization
- alpha-driven PNG substitution
- base-format alias lookup
- prefix fallback
- payload SSOT recovery
- Legacy alpha reinjection

These semantics are incompatible with final exact product authority.

## 1.4 Resize export bypasses Runtime authority

`resize_export_bind.js` currently performs:

```text
window.ExportManager.listEncoders()
window.ExportManager.exportByFormat(fmt, params)
Blob construction
URL.createObjectURL(blob)
anchor.download
anchor.click()
```

The same file also reconstructs export pixels, applies overlays, invokes proof conversion, reads global ICC state, and creates format-specific payload variants before calling the Legacy manager.

This is a second export authority outside `PipelineService` and `ExportAuthorityService`.

## 1.5 Main export uses a stage-coded public identity

`main.js` currently requires:

```text
runtime.authority === 'dadum.runtime.export-ew06'
```

The actual EW07 `ExportAuthorityService` exposes:

```text
'dadum.runtime.export-ew07'
```

The public caller and implementation are therefore version-drifted by construction.

Stage numbers must never be used as the stable public API identity.

## 1.6 Runtime and UI split persistence ownership

`ExportAuthorityService` currently:

- verifies encoded output
- creates a Blob Resource
- creates an Object URL
- returns the URL to the caller

`main.js` then:

- creates an anchor
- assigns `result.url`
- sets `download`
- invokes click

Encoding truth belongs to Runtime, while persistence truth belongs to the Legacy UI.

No host-side file SHA, atomic write receipt, final path identity, cancellation receipt, or on-disk byte verification exists.

## 1.7 Electron preload does not expose an export-save API

The preload currently exposes:

```text
nativeDecode
runtime.platform
send(frame-capture)
on(frame-saved)
```

It does not expose an admitted, typed, exact export persistence boundary.

## 1.8 Production manifest truth is incomplete

The Runtime manifest currently uses:

```text
promotable = package-lock consistency
```

This is necessary but insufficient.

Production export promotion also requires:

- clean `npm ci`
- full `vue-tsc`
- Vite production build
- emitted Worker and WASM artifact hashes
- packaged ASAR and unpack inventory
- Electron launch evidence
- Worker control READY evidence
- per-format actual encode evidence
- independent decode evidence
- host atomic save evidence
- on-disk output SHA parity
- no Legacy export reachability

## 1.9 The current lockfile is stale

The root `package.json` declares Vue, Pinia, Vite, TypeScript, vue-tsc, and Vite Vue plugin dependencies.

The current `package-lock.json` root entry only records:

```text
dependencies:
  jszip
  pako
  sharp

devDependencies:
  electron
  electron-builder
```

The current build graph cannot be promoted until the lockfile is regenerated and a clean `npm ci` reproduces the dependency graph.

---

# 2. Normative objectives

EP01 shall satisfy all of the following objectives.

## 2.1 Single export request authority

Only `ExportAuthorityService` may accept product export requests.

## 2.2 Single final surface authority

Only `PipelineService.requireFinal()` and `ResourceRegistryService` may provide export pixels.

## 2.3 Single encoder identity authority

Only `EncoderRegistryService` may resolve a format to a Runtime encoder identity.

## 2.4 Single Worker Job authority

Only `EncoderWorkerBrokerService` may create, queue, cancel, restart, and settle encoder jobs.

## 2.5 Single persistence authority

Only `ExportPersistenceService` through the typed Electron Host boundary may write product export bytes to disk in the packaged application.

## 2.6 Single promotion authority

Only `TDT_EXPORT_PROMOTION_01_CROSS_FORMAT_PROMOTION_RECEIPT.json` may mark a build as production-promoted for export.

## 2.7 Single rollback authority

Only an explicit whole-build promotion pointer may select a previous promoted build.

## 2.8 No stage-coded public API

Public callers shall compare stable API identity and API version, not EW or R stage names.

## 2.9 No in-process fallback

A failed canonical encoder shall fail the export. It shall not invoke a Legacy encoder, alternate format, Canvas path, main-thread path, or prior implementation inside the same Runtime epoch.

## 2.10 No unsupported promotion claims

A format or profile that lacks actual E2E evidence shall remain unpromoted and unavailable in the production capability set.

---

# 3. Scope

## 3.1 In scope

- retirement of product authority from `window.ExportManager`
- one-time Legacy encoder host adoption
- immutable Runtime encoder invocation capability
- stable Runtime Export API
- UI command migration
- removal of active direct Legacy export calls
- Electron atomic save service
- chunked or bounded byte transfer contract
- host-side output digest
- on-disk output verification
- clean dependency lock and production build
- emitted Worker and WASM digest verification
- packaged Electron E2E
- cross-format corpus execution
- independent decoder verification
- aggregate promotion receipt
- whole-build rollback pointer
- export capability disablement when promotion proof is absent

## 3.2 Out of scope

- new image processing algorithms
- new export formats
- lossy WebP promotion
- lossy JXL promotion
- JXL 16-bit promotion without ABI evidence
- progressive JPEG
- JPEG 4:2:0 or 4:2:2
- multilayer PSD beyond the declared EW04 document modes
- streaming encoders that do not already exist
- background update delivery
- automatic network rollback
- per-format live rollback inside one Runtime epoch

---

# 4. Terminology

## 4.1 Legacy Encoder Host

The controlled boot-only registry that receives `register()` and `registerLazy()` calls from Legacy codec modules.

It is not a product export request authority after adoption.

## 4.2 Adoption Snapshot

An immutable one-time snapshot containing exact encoder descriptors and private invocation capabilities.

## 4.3 Runtime Export API

The stable public Renderer API exposed by the canonical Runtime.

## 4.4 Export Persistence Service

The Runtime service that coordinates an atomic host save session and binds the host save receipt to the export receipt.

## 4.5 Production Promotion Receipt

The aggregate receipt proving that the exact packaged build passed all required cross-format and Electron E2E gates.

## 4.6 Promotion Pointer

The atomic whole-build pointer selecting one production-promoted build artifact set.

## 4.7 Product Format Profile

A named exact set of format capabilities that must all pass before that profile is advertised.

---

# 5. Final ownership matrix

| Concern | Final owner | Forbidden owners |
|---|---|---|
| Final Surface revision | `PipelineService` | Legacy globals, Canvas, resize binder |
| Surface resource bytes | `ResourceRegistryService` | UI payload reconstruction |
| Format resolution | `EncoderRegistryService` | UI, Legacy prefix fallback |
| Encoder registration | boot-only `LegacyEncoderHost` | runtime UI modules after seal |
| Encoder exact invocation | private adopted host capability | `window.ExportManager` global |
| Worker creation | `WorkerRegistryService` | Legacy codec modules |
| Worker job lifecycle | `EncoderWorkerBrokerService` | codec-local Pending Maps |
| Output structure verification | Runtime codec verifiers | UI and Legacy helpers |
| Export receipt | `ExportReceiptLedgerService` | console logs, UI state |
| File save session | `ExportPersistenceService` | anchors, arbitrary fs shims |
| Save dialog and atomic write | Electron main process | Renderer direct fs |
| Host save receipt | Electron main process | Renderer estimates |
| Promotion verdict | `ExportPromotionService` | package-lock consistency alone |
| Rollback selection | atomic promotion pointer | runtime automatic fallback |

---

# 6. Legacy facade retirement state machine

The Legacy export registry shall implement this exact state machine.

```text
UNINITIALIZED
  -> REGISTERING
  -> SEALED
  -> ADOPTED
  -> RETIRED
  -> DISPOSED
```

## 6.1 REGISTERING

Allowed operations:

- `register()`
- `registerLazy()`
- `listEncoderRecords()`

Forbidden operations:

- product export requests
- UI downloads
- output persistence

## 6.2 SEALED

Entry conditions:

- Legacy adapter finished controlled boot
- all declared encoder registration modules completed
- registry revision is frozen
- no duplicate canonical keys
- no unsupported mutable aliases

Allowed operations:

- `createAdoptionSnapshot()` exactly once
- diagnostics read

Forbidden operations:

- `register()`
- `registerLazy()`
- registry mutation
- permissive `exportByFormat()`

## 6.3 ADOPTED

The Runtime owns an immutable private `AdoptedEncoderHost` capability.

The capability includes:

```ts
interface AdoptedEncoderHost {
  readonly apiId: 'dadum.adopted-encoder-host';
  readonly apiVersion: 1;
  readonly implementationId: string;
  readonly registryRevision: number;
  readonly encoderSetDigest: string;
  readonly descriptors: readonly AdoptedEncoderDescriptor[];
  invokeExact(
    encoderKey: string,
    payload: ExactEncoderPayload,
  ): Promise<LegacyExactExportEnvelope>;
  dispose(reason: string): Promise<void> | void;
}
```

The Runtime must not retain the mutable original manager object.

## 6.4 RETIRED

After adoption, `window.ExportManager` shall become a frozen tombstone.

Recommended shape:

```ts
interface RetiredExportManagerTombstone {
  readonly state: 'RETIRED';
  readonly apiId: 'dadum.legacy.export-manager-retired';
  readonly adoptedEncoderSetDigest: string;
  readonly registryRevision: number;
  readonly retiredAtRuntimeEpoch: number;
  readonly diagnosticId: string;
}
```

All callable Legacy methods shall be absent.

An attempted late call shall fail through a dedicated compatibility trap with:

```text
E_LEGACY_EXPORT_FACADE_RETIRED
```

The trap may log one diagnostic. It must not dispatch an export.

## 6.5 DISPOSED

On Runtime disposal:

- adopted private invoker is disposed
- all Lazy loader references are released
- no global callable facade is restored
- a new Renderer Runtime epoch requires a full page reload

---

# 7. Exact adoption contract

## 7.1 Adoption snapshot content

```ts
interface AdoptedEncoderDescriptor {
  readonly runtimeEncoderId: string;
  readonly legacyEncoderKey: string;
  readonly canonicalFormat: string;
  readonly priority: number;
  readonly initialState: 'READY' | 'LAZY';
  readonly mime: string;
  readonly extension: string;
  readonly supportsAlpha: boolean;
  readonly supportsBitDepths: readonly number[];
  readonly workerBinding: Readonly<{
    workerId: string;
    codecProtocolVersion: string;
    operation: string;
  }> | null;
  readonly descriptorDigest: string;
}
```

## 7.2 Snapshot invariants

- descriptor order is canonical
- no duplicate Runtime encoder ID
- no duplicate canonical format
- `jpeg` is an input alias only and does not become an independent encoder identity
- registry revision is immutable
- invocation closure identity is private
- snapshot digest includes implementation ID, revision, descriptors, Worker bindings, and exact operation IDs

## 7.3 Invocation invariants

`invokeExact()` shall reject:

- unknown key
- display label
- prefix key
- base-format fallback
- alpha-driven format substitution
- alias-driven output substitution
- registry revision drift
- result with both Blob and Uint8Array
- result with no bytes
- MIME mismatch
- extension mismatch
- requested/applied format mismatch

## 7.4 Legacy permissive path retirement

The active product graph shall contain zero reachable calls to:

```text
ExportManager.exportByFormat()
```

The method may remain only in quarantine or source-history folders that are excluded from the generated Legacy manifest and Vite graph.

---

# 8. Stable Runtime Export API

The public API shall separate stable identity from implementation identity.

```ts
interface DadumRuntimeExportApiV1 {
  readonly apiId: 'dadum.runtime.export';
  readonly apiVersion: 1;
  readonly implementationId: string;
  readonly buildId: string;
  readonly runtimeEpoch: number;
  readonly promotionState: ExportPromotionState;
  listCapabilities(): readonly PublicExportCapability[];
  exportAndSave(request: ExportAndSaveRequest): Promise<ExportAndSaveResult>;
  encodeForTest(request: ExportTestRequest): Promise<EncodedTestResult>;
  getReceipt(receiptId: string): unknown;
  listReceipts(): readonly unknown[];
}
```

## 8.1 Stable identity rule

Callers may check only:

```text
apiId === 'dadum.runtime.export'
apiVersion === 1
```

Callers must not branch on:

```text
ew06
ew07
ep01
implementation suffix
build ID prefix
```

## 8.2 Implementation identity

The implementation ID remains evidence only.

Example:

```text
dadum.runtime.export.ep01:<buildId-prefix>
```

## 8.3 Production capability exposure

`listCapabilities()` shall include only capabilities that belong to a promoted Product Format Profile.

A Source Bake may expose diagnostic capabilities in development mode, but it must mark them:

```text
promotionState = SOURCE_BAKED_UNPROMOTED
productionSelectable = false
```

## 8.4 No public Blob URL

The production API shall not return an Object URL for product export.

`RuntimeExportResult.url` is removed from the production contract.

The production API returns a host save result and receipt identity.

---

# 9. UI command migration

## 9.1 Resize export binder

`resize_export_bind.js` shall not:

- read pixels for final product export
- create RGBA or RGBA16 product payloads
- invoke LCMS proof for product export
- read `window.iccProfileBuffer`
- call `window.ExportManager`
- create Blob URLs
- click download anchors

The binder may:

- update target dimensions in canonical application state
- request a new Final Surface revision through the pipeline command
- call stable Runtime `exportAndSave()`
- display progress and stable errors

## 9.2 Main export handler

`main.js` shall not:

- compare stage-coded authority strings
- construct export payloads from Canvas or Legacy surface globals
- create Blob URLs
- own filename extension rules

It shall call:

```text
DadumRuntimeExport.exportAndSave()
```

using only user intent options and an optional expected Final Revision.

## 9.3 UI event ownership

Exactly one event handler may own each product export button.

Button cloning and hard rebinding are forbidden after UI finalization.

The canonical Vue command layer shall own the action.

Legacy DOM listeners shall be removed from the active manifest or converted to command forwarding only.

## 9.4 UI state

Pinia may store:

- selected format
- selected options
- current export job ID
- progress state
- terminal stable error code
- receipt ID
- saved basename

Pinia shall not store:

- Blob
- ArrayBuffer
- Uint8Array
- Object URL
- Worker
- file path
- host save session object

---

# 10. Export Persistence Service

A new Runtime service shall own persistence coordination.

```ts
interface ExportPersistenceService extends RuntimeService {
  saveEncodedOutput(input: SaveEncodedOutputInput): Promise<HostSaveResult>;
  cancelSave(exportJobId: string): Promise<void>;
}
```

## 10.1 Input

```ts
interface SaveEncodedOutputInput {
  readonly exportJobId: string;
  readonly receiptId: string;
  readonly blobResourceId: string;
  readonly suggestedBaseName: string;
  readonly extension: string;
  readonly mime: string;
  readonly byteLength: number;
  readonly expectedOutputSha256: string;
}
```

## 10.2 Host profiles

```text
electron-production
browser-development
headless-test
```

Only `electron-production` may satisfy final promotion.

Browser anchor download is permitted only in `browser-development` and must force:

```text
promotionEligible = false
persistenceAuthority = browser-development-anchor
```

## 10.3 Resource ownership

The Blob remains in `ResourceRegistryService` until the save session reaches a terminal state.

After terminal settlement:

- Object URLs are absent in production
- Blob Resource is released according to retention policy
- save session resources are released
- cancellation listeners are removed

---

# 11. Electron Host atomic save protocol

The preload shall expose a typed, narrow export persistence surface.

```ts
interface DadumExportHostV1 {
  beginSave(request: BeginSaveRequest): Promise<BeginSaveResult>;
  writeChunk(request: WriteSaveChunkRequest): Promise<WriteSaveChunkResult>;
  commitSave(request: CommitSaveRequest): Promise<CommitSaveResult>;
  abortSave(request: AbortSaveRequest): Promise<AbortSaveResult>;
}
```

## 11.1 IPC channels

Exact admitted channels:

```text
dadum:export-save-begin
dadum:export-save-chunk
dadum:export-save-commit
dadum:export-save-abort
```

No generic file-system IPC is allowed.

## 11.2 Begin save

Main process responsibilities:

1. validate Runtime build ID and export job ID
2. validate suggested basename
3. validate exact extension and MIME pair
4. open `dialog.showSaveDialog`
5. return `CANCELLED` without creating a file when the user cancels
6. create a temp file in the selected directory
7. create a host-side incremental SHA-256 state
8. allocate a save session ID bound to the Runtime epoch and export job ID

## 11.3 Chunk write

The Renderer transfers bounded chunks.

Normative defaults:

```text
chunkBytes = 8 MiB
maxInflightChunks = 2
queueDiscipline = FIFO
```

Each chunk request includes:

```text
sessionId
sequence
byteOffset
byteLength
ArrayBuffer
chunkSha256
```

Main process verifies:

- exact next sequence
- exact byte offset
- chunk length
- chunk digest
- session ownership
- session not aborted or committed

## 11.4 Commit

Main process shall:

1. verify total bytes written
2. finalize host SHA-256
3. compare with Runtime expected SHA-256
4. flush the file
5. close the file handle
6. atomically replace or rename temp file to final path
7. verify final file size
8. reopen or stat final file as required
9. issue a Host Save Receipt

Commit shall fail if the host digest differs.

## 11.5 Atomicity

The save implementation shall use:

```text
write temp
fsync temp
close temp
atomic rename or replace
fsync containing directory where supported
```

A partially written final filename is forbidden.

## 11.6 Path privacy

Receipts shall not store the full user path.

Allowed fields:

```text
basename
extension
parentPathSha256
volumeIdentityHash optional
```

## 11.7 Abort

Abort shall:

- stop accepting chunks
- close the temp file
- remove the temp file
- finalize an ABORTED save receipt
- release session memory

## 11.8 Host restart and crash

A temp file left by a crash must use a recognizable prefix and shall be cleaned by a bounded startup cleanup policy.

Cleanup shall never delete a committed file.

---

# 12. Export and save transaction

The product transaction is one logical operation with two sealed phases.

```text
ENCODED
  -> VERIFIED
  -> SAVE_DIALOG
  -> SAVING
  -> HOST_DIGEST_VERIFIED
  -> ATOMICALLY_COMMITTED
  -> ON_DISK_VERIFIED
  -> COMPLETED
```

Terminal alternatives:

```text
CANCELLED
FAILED
ABORTED
```

## 12.1 Success definition

Export success requires all of:

- exact Final Surface binding
- exact Runtime encoder identity
- Worker Job receipt where required
- output structure verification
- Runtime output SHA-256
- host output SHA-256 parity
- atomic commit
- on-disk byte-length parity
- on-disk SHA-256 parity
- save receipt linked to export receipt

An encoded Blob without a committed file is not a completed product export.

## 12.2 Cancellation definition

User cancellation at the save dialog is not an encode failure.

It produces:

```text
terminalState = CANCELLED
fileCommitted = false
```

The encoded Blob Resource is then released.

## 12.3 Retry definition

A user may retry persistence of the same verified encoded output only while the Blob Resource is retained and the output digest remains unchanged.

Retry creates a new save session receipt but keeps the same export receipt ID.

---

# 13. Product Format Profiles

EP01 defines exact profiles rather than claiming one vague global promotion.

## 13.1 Core Raster Profile

ID:

```text
dadum.export-profile.core-raster-v1
```

Required capabilities:

```text
png-rgba8-lossless
png-rgba16-lossless
webp-vp8l-lossless
jxl-rgba8-lossless
jpeg-baseline-rgb8-444
```

## 13.2 PSD RGB Profile

ID:

```text
dadum.export-profile.psd-rgb-v1
```

Required capabilities:

```text
psd-layered-rgb8
psd-flattened-rgb8
psd-flattened-rgb16
```

## 13.3 PSD CMYK Profile

ID:

```text
dadum.export-profile.psd-cmyk-v1
```

Required capabilities:

```text
psd-flattened-cmyk8
actual-lcms-transform
explicit-source-icc
explicit-destination-icc
independent-color-validation
```

## 13.4 Full Product Export Profile

ID:

```text
dadum.export-profile.full-product-v1
```

It requires all three profiles.

A build must not claim Full Product Export promotion while the PSD CMYK Profile remains unverified.

## 13.5 Capability hiding

A non-promoted profile may not be shown as production-selectable.

Development mode may expose it with a visible unpromoted badge and no production receipt.

---

# 14. Promotion state machine

```text
SOURCE_BAKED_UNPROMOTED
  -> DEPENDENCY_LOCK_VERIFIED
  -> PRODUCTION_BUILD_VERIFIED
  -> PACKAGED_ARTIFACT_VERIFIED
  -> ELECTRON_E2E_VERIFIED
  -> CROSS_FORMAT_VERIFIED
  -> PRODUCTION_PROMOTED
```

No state may be skipped.

## 14.1 SOURCE_BAKED_UNPROMOTED

Required:

- source gates pass
- TypeScript isolated closure pass
- Source manifests deterministic
- no promotion claim

## 14.2 DEPENDENCY_LOCK_VERIFIED

Required:

- regenerated `package-lock.json`
- root dependency graph matches `package.json`
- clean directory `npm ci` pass
- no undeclared dependency resolution
- lockfile SHA-256 recorded

## 14.3 PRODUCTION_BUILD_VERIFIED

Required:

- full `vue-tsc --noEmit`
- Vite production build
- all existing verification scripts
- EP01 gates
- emitted asset manifest
- emitted Worker and WASM hashes
- no source-graph-only Worker verification mode

## 14.4 PACKAGED_ARTIFACT_VERIFIED

Required:

- Electron Builder output
- ASAR inventory
- ASAR unpack inventory
- native module inventory
- Worker and WASM path resolution from packaged app
- packaged artifact SHA-256

## 14.5 ELECTRON_E2E_VERIFIED

Required:

- packaged app launch
- COOP and COEP active
- Runtime Boot Receipt promotable
- all required Workers READY
- host save IPC operational
- actual files committed

## 14.6 CROSS_FORMAT_VERIFIED

Required:

- all fixtures for the selected profile encoded
- saved to disk
- output digests verified
- independent decoders executed
- round-trip and metric gates pass
- repeated-run determinism gate pass

## 14.7 PRODUCTION_PROMOTED

Required:

- aggregate promotion receipt sealed
- promotion pointer atomically updated
- previous promoted build recorded
- rollback target verified

---

# 15. Clean dependency and build closure

## 15.1 Lockfile repair

The authoritative lockfile shall be regenerated from the declared package graph.

Promotion requires:

```text
npm ci
npm run typecheck:renderer
npm run build:renderer
npm run verify:renderer
```

from a clean checkout without pre-existing `node_modules`.

## 15.2 Build environment receipt

Record:

```text
Node version
npm version
OS
architecture
package.json SHA-256
package-lock.json SHA-256
npm ci exit code
npm ls digest
```

## 15.3 Vite emitted artifact manifest

A new emitted manifest shall list:

- Renderer entry JS
- CSS
- each encoder Worker JS
- each Worker child chunk
- each WASM file
- ICC files
- native bridge metadata
- byte length
- SHA-256
- owning Runtime encoder IDs

## 15.4 Source versus emitted identity

Both identities must be retained.

```text
sourceGraphDigest
emittedArtifactSetDigest
```

Production promotion requires non-null emitted digests.

---

# 16. Packaged Electron artifact closure

## 16.1 Package inventory

The package receipt shall include:

```text
app.asar SHA-256
app.asar file inventory digest
app.asar.unpacked inventory digest
native module digest set
renderer dist digest
Worker artifact set digests
WASM artifact set digests
```

## 16.2 Path resolution

Each Worker and WASM shall be fetched successfully from the packaged application server.

No path may resolve from the source tree in packaged E2E.

## 16.3 COI requirements

The packaged application shall prove:

```text
crossOriginIsolated === true
SharedArrayBuffer available where required
COOP = same-origin
COEP = require-corp
CORP = same-origin
```

## 16.4 Native decoder identity

Independent decode receipts shall record the decoder implementation identity and artifact digest.

The decoder path must be independent from the encoder path.

For JXL, a libjxl decoder path is preferred when the Rust native decoder is unavailable due to an unrelated AVIF or dav1d build dependency.

No independent-decode PASS may be emitted from an encoder self-parser alone.

---

# 17. Cross-format promotion corpus

## 17.1 Common fixtures

| ID | Fixture | Purpose |
|---|---|---|
| F01 | 1x1 opaque RGBA8 | minimum dimensions |
| F02 | 2x2 alpha pattern | alpha semantics |
| F03 | transparent pixels with non-zero hidden RGB | hidden RGB preservation |
| F04 | odd 17x19 dimensions | row and stride edges |
| F05 | 257x263 gradient | non-power-of-two dimensions |
| F06 | high entropy noise | compression stress |
| F07 | flat fields and sharp edges | ringing and block structure |
| F08 | RGBA16 endian pattern | 16-bit storage truth |
| F09 | explicit 72 DPI | metadata |
| F10 | explicit 300 DPI | metadata |
| F11 | asymmetric X/Y DPI | metadata asymmetry |
| F12 | explicit sRGB ICC | ICC embedding |
| F13 | explicit CMYK source and destination ICC | LCMS truth |
| F14 | large memory-budget boundary | peak memory |
| F15 | cancellation fixture | cleanup |
| F16 | Worker crash fixture | restart and no replay |

## 17.2 PNG8

Required evidence:

- exact RGBA8 round-trip
- CRC pass
- IHDR 8-bit RGBA
- metadata cardinality
- deterministic bytes across three runs

## 17.3 PNG16

Required evidence:

- exact RGBA16 round-trip
- endian fixture pass
- IHDR 16-bit RGBA
- CRC pass
- deterministic bytes across three runs

## 17.4 WebP Lossless

Required evidence:

- VP8L only
- no animation
- exact RGBA8 round-trip
- hidden RGB exact
- deterministic bytes across three runs

## 17.5 JXL Lossless RGBA8

Required evidence:

- `jxl_encode_qmap_ex()` ABI identity
- distance 0
- quality 100
- exact RGBA8 independent decode
- hidden RGB exact
- container structure pass
- pthread request and execution evidence
- deterministic bytes across three runs

## 17.6 JPEG Baseline 4:4:4

Required evidence:

- SOF0
- 8-bit, 3 components
- exact 4:4:4 sampling
- explicit alpha policy
- JFIF density
- ICC APP2 ordering
- independent decode
- quality metric thresholds
- deterministic bytes for fixed build and options across three runs

## 17.7 PSD RGB

Required evidence:

- Layered RGB8 mode
- Flattened RGB8 mode
- Flattened RGB16 mode
- exact Plane digest round-trip
- Resource 1005 and 1039 cardinality
- RAW and RLE coverage
- hidden RGB and alpha evidence
- deterministic bytes across three runs

## 17.8 PSD CMYK

Required evidence:

- actual LCMS transform executed
- source and destination ICC digests
- rendering intent and BPC
- Native CMYK digest
- PSD Stored CMYK digest
- independent color validation
- memory budget and peak ledger
- terminal live allocations zero

---

# 18. Independent verification rules

## 18.1 Independence

An independent decoder or parser shall not share the encoder's output buffer construction implementation.

## 18.2 Lossless exactness

For lossless formats:

```text
decoded pixel bytes == authoritative input pixel bytes
```

with exact storage and alpha semantics.

## 18.3 JPEG quality metrics

JPEG shall use a fixed metric suite.

Minimum evidence:

```text
PSNR
SSIM or MS-SSIM
OKLab mean error
OKLab P95 error
alpha compositing source digest
```

Thresholds shall be profile-specific and stored in a versioned policy file.

## 18.4 Color validation

CMYK validation shall distinguish:

- transform correctness
- PSD sample storage inversion
- independent rendering comparison

A correct storage inversion does not prove a correct ICC transform.

---

# 19. Promotion receipt schema

Primary artifact:

```text
artifacts/runtime/TDT_EXPORT_PROMOTION_01_CROSS_FORMAT_PROMOTION_RECEIPT.json
```

Required top-level fields:

```ts
interface ExportPromotionReceiptV1 {
  schema: 'tdt-export-promotion-01-cross-format-receipt-v1';
  status: ExportPromotionState;
  promotionEligible: boolean;
  promotedProfiles: readonly string[];
  blockedProfiles: readonly PromotionBlocker[];

  buildId: string;
  runtimeEpoch: number;
  sourceBakeSeal: string;
  packageJsonSha256: string;
  packageLockSha256: string;
  dependencyGraphDigest: string;

  runtimeManifestDigest: string;
  workerSourceManifestDigest: string;
  emittedArtifactManifestDigest: string;
  packagedArtifactDigest: string;

  encoderSetDigest: string;
  adoptedEncoderHostDigest: string;
  legacyFacadeRetirementReceiptId: string;

  electronE2eReceiptId: string;
  crossFormatMatrixDigest: string;
  hostSaveReceiptSetDigest: string;
  independentDecodeReceiptSetDigest: string;

  rollback: {
    currentBuildId: string;
    previousBuildId: string | null;
    pointerDigest: string;
    rollbackTargetVerified: boolean;
  };

  gates: readonly PromotionGateResult[];
  sealSha256: string;
}
```

## 19.1 Seal payload

`sealSha256` is computed over canonical JSON excluding the seal field itself.

## 19.2 No nullable critical evidence in promoted state

When status is `PRODUCTION_PROMOTED`, the following may not be null:

- emitted artifact digest
- packaged artifact digest
- Electron E2E receipt
- host save receipt set digest
- independent decode receipt set digest
- rollback pointer digest

## 19.3 Format result schema

Each format result records:

```text
profileId
capabilityId
runtimeEncoderId
workerId
operation
inputFixtureId
inputSha256
outputSha256
savedFileSha256
byteLength
structureVerifierId
independentDecoderId
independentDecoderArtifactDigest
roundTripState
metricPolicyId
metricResultDigest
determinismRunDigests
mainThreadIsolationVerified
hostAtomicCommitVerified
receiptId
```

---

# 20. Legacy facade retirement receipt

Artifact:

```text
TDT_EXPORT_PROMOTION_01_LEGACY_FACADE_RETIREMENT_RECEIPT.json
```

Required evidence:

```text
activeManifestExportManagerCountBefore
activeManifestExportManagerCountAfter
activeDirectExportByFormatCallCount
activeDirectAnchorDownloadCount
activeObjectUrlProductExportCount
lateRegistrationAttemptRejected
lateInvocationAttemptRejected
adoptionSnapshotDigest
retiredGlobalState
runtimePrivateInvokerOwned
```

Promotion requires:

```text
activeDirectExportByFormatCallCount = 0
activeDirectAnchorDownloadCount = 0
activeObjectUrlProductExportCount = 0
lateRegistrationAttemptRejected = true
lateInvocationAttemptRejected = true
```

---

# 21. Host save receipt

Artifact family:

```text
TDT_EXPORT_PROMOTION_01_HOST_SAVE_RECEIPT_<job>.json
```

Required fields:

```text
exportJobId
exportReceiptId
saveSessionId
hostProfileId
basename
extension
mime
parentPathSha256
expectedByteLength
writtenByteLength
expectedOutputSha256
hostOutputSha256
onDiskOutputSha256
chunkCount
chunkSizePolicyId
atomicCommitVerified
tempFileRemoved
terminalState
startedAt
completedAt
receiptSealSha256
```

---

# 22. Runtime Boot Receipt extension

The Boot Receipt shall add:

```text
exportApiId = dadum.runtime.export
exportApiVersion = 1
exportImplementationId
exportPromotionState
promotedProfiles
adoptedEncoderHostDigest
legacyExportFacadeState = RETIRED
exportPersistenceHostProfile
electronHostSaveAvailable
emittedArtifactVerificationMode
rollbackPointerDigest
```

A production Boot Receipt is not promotable when:

- Legacy facade is callable
- browser anchor persistence is active
- emitted artifact verification remains source-graph-only
- promotion pointer is missing
- required profile evidence is incomplete

---

# 23. Rollback closure

## 23.1 Rollback unit

Rollback unit is the entire packaged build.

Forbidden rollback units:

- one encoder
- one Worker script
- one WASM file
- Legacy ExportManager
- previous runtime module inside the same page

## 23.2 Promotion pointer

Artifact:

```text
release/export-promotion-pointer.json
```

Schema:

```ts
interface ExportPromotionPointerV1 {
  schema: 'tdt-export-promotion-pointer-v1';
  currentBuildId: string;
  currentReceiptSha256: string;
  previousBuildId: string | null;
  previousReceiptSha256: string | null;
  updatedAt: string;
  reason: 'promotion' | 'rollback';
  pointerSha256: string;
}
```

## 23.3 Pointer update

Pointer update shall be atomic.

```text
write temporary pointer
fsync
validate target build receipt
atomic rename
restart required
```

## 23.4 No automatic fallback

If the current promoted build fails boot verification, the application shall disable export and emit a stable error.

It shall not silently boot the previous build.

Rollback requires an explicit operator action that updates the pointer and restarts the application.

## 23.5 Rollback validation

Before pointer update to a previous build:

- previous promotion receipt seal verifies
- packaged artifact digest verifies
- required profiles are promoted
- host save E2E receipt exists
- build is present

## 23.6 Runtime epoch rule

A Runtime epoch may never switch promotion build.

Any rollback requires full Electron process restart.

---

# 24. Stable errors

EP01 shall register at least the following stable errors.

```text
E_LEGACY_EXPORT_FACADE_RETIRED
E_LEGACY_EXPORT_LATE_REGISTRATION
E_ENCODER_HOST_ALREADY_ADOPTED
E_ENCODER_HOST_NOT_SEALED
E_ENCODER_HOST_DIGEST_MISMATCH
E_RUNTIME_EXPORT_API_MISMATCH
E_EXPORT_PROFILE_NOT_PROMOTED
E_EXPORT_PERSISTENCE_UNAVAILABLE
E_EXPORT_SAVE_DIALOG_FAILED
E_EXPORT_SAVE_SESSION_INVALID
E_EXPORT_SAVE_SEQUENCE_MISMATCH
E_EXPORT_SAVE_CHUNK_DIGEST_MISMATCH
E_EXPORT_SAVE_BYTE_LENGTH_MISMATCH
E_EXPORT_SAVE_OUTPUT_DIGEST_MISMATCH
E_EXPORT_SAVE_ATOMIC_COMMIT_FAILED
E_EXPORT_SAVE_ON_DISK_VERIFY_FAILED
E_EXPORT_SAVE_ABORT_FAILED
E_EXPORT_PRODUCT_OBJECT_URL_FORBIDDEN
E_EXPORT_PRODUCTION_ANCHOR_DOWNLOAD_FORBIDDEN
E_EXPORT_EMITTED_ARTIFACT_UNVERIFIED
E_EXPORT_PACKAGED_ARTIFACT_UNVERIFIED
E_EXPORT_ELECTRON_E2E_UNVERIFIED
E_EXPORT_INDEPENDENT_DECODE_UNVERIFIED
E_EXPORT_CROSS_FORMAT_PROFILE_INCOMPLETE
E_EXPORT_PROMOTION_RECEIPT_INVALID
E_EXPORT_PROMOTION_POINTER_INVALID
E_EXPORT_ROLLBACK_TARGET_INVALID
E_EXPORT_IN_PROCESS_FALLBACK_FORBIDDEN
```

---

# 25. Static gates

EP01 defines 54 mandatory static gates.

## GATE-EP01-01

Stable public API exposes `apiId='dadum.runtime.export'` and `apiVersion=1`.

## GATE-EP01-02

No active caller compares `dadum.runtime.export-ew*`.

## GATE-EP01-03

No active caller compares `implementationId` to select behavior.

## GATE-EP01-04

`window.ExportManager` callable methods are unavailable after adoption.

## GATE-EP01-05

Legacy registration is sealed before Runtime encoder adoption.

## GATE-EP01-06

Adoption snapshot is immutable and one-time.

## GATE-EP01-07

Runtime encoder closures do not retain the mutable global manager.

## GATE-EP01-08

Active product graph contains zero `ExportManager.exportByFormat()` calls.

## GATE-EP01-09

Active product graph contains zero permissive format prefix fallback.

## GATE-EP01-10

Active product graph contains zero alpha-driven format substitution.

## GATE-EP01-11

`resize_export_bind.js` does not invoke Legacy encoding.

## GATE-EP01-12

`resize_export_bind.js` does not construct product export pixel buffers.

## GATE-EP01-13

`resize_export_bind.js` does not invoke product LCMS proof.

## GATE-EP01-14

`main.js` does not create product Blob URLs.

## GATE-EP01-15

`main.js` does not click product download anchors.

## GATE-EP01-16

`ExportAuthorityService` production result contains no URL.

## GATE-EP01-17

A dedicated `ExportPersistenceService` exists.

## GATE-EP01-18

Preload exposes only exact admitted export-save methods.

## GATE-EP01-19

Electron main admits only exact save IPC channels.

## GATE-EP01-20

Renderer has no direct Node fs export path.

## GATE-EP01-21

Host save protocol has sequence and offset validation.

## GATE-EP01-22

Host save protocol has per-chunk digest verification.

## GATE-EP01-23

Host commit verifies total byte length.

## GATE-EP01-24

Host commit verifies full output SHA-256.

## GATE-EP01-25

Host save uses temp file plus atomic rename.

## GATE-EP01-26

Receipts do not expose full user paths.

## GATE-EP01-27

Browser anchor persistence is development-only.

## GATE-EP01-28

Production promotion rejects browser anchor persistence.

## GATE-EP01-29

`package-lock.json` root graph matches `package.json`.

## GATE-EP01-30

A clean `npm ci` receipt is required.

## GATE-EP01-31

Full vue-tsc pass is required.

## GATE-EP01-32

Vite production build receipt is required.

## GATE-EP01-33

Emitted Worker JS digests are non-null.

## GATE-EP01-34

Emitted WASM digests are non-null.

## GATE-EP01-35

Production verification mode is not `source-graph-only`.

## GATE-EP01-36

Electron packaged artifact digest is non-null.

## GATE-EP01-37

ASAR inventory digest is non-null.

## GATE-EP01-38

ASAR unpack inventory digest is non-null.

## GATE-EP01-39

Packaged Worker URL reachability is verified.

## GATE-EP01-40

Packaged WASM URL reachability is verified.

## GATE-EP01-41

COOP and COEP evidence is present.

## GATE-EP01-42

Each promoted format has independent decoder identity.

## GATE-EP01-43

Each promoted output has on-disk SHA parity.

## GATE-EP01-44

Each promoted output has atomic commit evidence.

## GATE-EP01-45

Lossless profiles have exact pixel round-trip evidence.

## GATE-EP01-46

JPEG has metric policy and observed metric evidence.

## GATE-EP01-47

PSD CMYK promotion requires actual LCMS execution.

## GATE-EP01-48

Full Product Profile cannot omit PSD CMYK blockers.

## GATE-EP01-49

Aggregate promotion receipt seal verifies.

## GATE-EP01-50

Promotion pointer seal verifies.

## GATE-EP01-51

Rollback target receipt seal verifies.

## GATE-EP01-52

In-process fallback call count is zero.

## GATE-EP01-53

All terminal Worker and save Pending counts are zero.

## GATE-EP01-54

Production Boot Receipt reports Legacy facade state `RETIRED`.

---

# 26. Runtime test matrix

EP01 defines a minimum of 104 runtime tests.

## 26.1 Adoption and retirement tests

1. registration before seal succeeds
2. registration after seal fails
3. second adoption fails
4. snapshot descriptor order deterministic
5. snapshot digest deterministic
6. late global invocation fails
7. global tombstone frozen
8. Runtime private invoker still functions after global retirement
9. Runtime disposal releases invoker
10. new epoch requires page reload

## 26.2 Stable API tests

11. stable API ID accepted
12. wrong API version rejected
13. implementation suffix does not affect caller
14. EW-stage string absent
15. unpromoted capability hidden in production
16. diagnostic capability visible only in development

## 26.3 UI routing tests

17. main export button calls `exportAndSave()` once
18. resize export calls pipeline then `exportAndSave()` once
19. no duplicate DOM listener
20. no button clone ownership
21. no Legacy manager call
22. no anchor click
23. no Object URL
24. cancellation returns UI idle state

## 26.4 Save session tests

25. dialog cancel
26. begin failure
27. ordered chunks
28. duplicate sequence rejection
29. skipped sequence rejection
30. wrong offset rejection
31. wrong chunk digest rejection
32. short final byte length rejection
33. long final byte length rejection
34. full digest mismatch rejection
35. successful atomic commit
36. temp file removed after success
37. temp file removed after abort
38. abort after commit rejected
39. commit twice rejected
40. chunk after abort rejected
41. save session wrong epoch rejected
42. save session wrong job rejected
43. final on-disk SHA parity
44. path privacy receipt

## 26.5 Build and package tests

45. clean `npm ci`
46. full typecheck
47. Vite production build
48. all inherited source gates
49. emitted Worker manifest complete
50. emitted WASM manifest complete
51. ASAR inventory complete
52. ASAR unpack inventory complete
53. packaged app starts
54. packaged Runtime manifest validates
55. packaged Worker READY all required
56. packaged COI active
57. host save IPC available
58. native independent decoder available or exact external decoder identity configured

## 26.6 PNG tests

59. PNG8 F01
60. PNG8 F03 hidden RGB
61. PNG8 F04 odd size
62. PNG8 deterministic three runs
63. PNG16 F08 endian
64. PNG16 F04 odd size
65. PNG16 deterministic three runs
66. PNG CRC tamper rejection

## 26.7 WebP tests

67. VP8L exact opaque
68. VP8L alpha
69. VP8L hidden RGB
70. lossy VP8 rejection
71. animation rejection
72. deterministic three runs

## 26.8 JXL tests

73. JXL container structure
74. JXL exact opaque
75. JXL alpha
76. JXL hidden RGB
77. JXL DPI metadata
78. ABI identity
79. pthread execution evidence
80. deterministic three runs

## 26.9 JPEG tests

81. alpha reject
82. explicit matte
83. quality 1
84. quality 50
85. quality 92
86. quality 100
87. SOF0
88. 4:4:4
89. JFIF DPI
90. ICC APP2
91. progressive rejection
92. deterministic three runs
93. metric threshold pass

## 26.10 PSD tests

94. layered RGB8 RAW
95. layered RGB8 RLE
96. flattened RGB8
97. flattened RGB16
98. RGB alpha and hidden RGB
99. DPI resource
100. ICC resource
101. actual CMYK LCMS transform
102. CMYK Native versus Stored digest
103. memory budget preflight
104. terminal allocation zero

Additional product-specific fixtures may extend this matrix, but no listed test may be omitted for a Full Product Profile promotion.

---

# 27. Required implementation files

At minimum, the bake shall add or modify the following areas.

## 27.1 Runtime

```text
app/src/runtime/export/export-promotion-service.ts
app/src/runtime/export/export-persistence-service.ts
app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
app/src/runtime/export/export-receipt-ledger-service.ts
app/src/runtime/codecs/encoder-registry-service.ts
app/src/runtime/codecs/adopted-encoder-host.ts
app/src/runtime/host-bridge-service.ts
app/src/boot/runtime-modules.ts
app/src/boot/runtime-receipt.ts
app/src/env.d.ts
```

## 27.2 Legacy controlled boot

```text
app/legacy-runtime/export_manager.js
app/legacy-runtime/resize_export_bind.js
app/legacy-runtime/main.js
app/legacy-runtime/SSOT.manifest.json
```

## 27.3 Electron host

```text
electron.mjs
preload.cjs
```

## 27.4 Build and gates

```text
tools/generate-runtime-manifest.mjs
tools/generate-runtime-worker-manifest.mjs
tools/generate-emitted-export-artifact-manifest.mjs
tools/run-export-electron-e2e.mjs
tools/run-export-cross-format-promotion.mjs
tools/gate-export-promotion-01.mjs
tools/promote-export-release.mjs
tools/rollback-export-release.mjs
```

## 27.5 Artifacts

```text
artifacts/runtime/TDT_EXPORT_PROMOTION_01_FIX_RECEIPT.json
artifacts/runtime/TDT_EXPORT_PROMOTION_01_LEGACY_FACADE_RETIREMENT_RECEIPT.json
artifacts/runtime/TDT_EXPORT_PROMOTION_01_DEPENDENCY_LOCK_RECEIPT.json
artifacts/runtime/TDT_EXPORT_PROMOTION_01_EMITTED_ARTIFACT_MANIFEST.json
artifacts/runtime/TDT_EXPORT_PROMOTION_01_ELECTRON_E2E_RECEIPT.json
artifacts/runtime/TDT_EXPORT_PROMOTION_01_CROSS_FORMAT_PROMOTION_RECEIPT.json
artifacts/runtime/TDT_EXPORT_PROMOTION_01_ROLLBACK_RECEIPT.json
```

---

# 28. Migration order

## Step 1. Stable API identity

- add `apiId` and `apiVersion`
- remove EW-stage comparisons
- retain implementation ID as evidence only

## Step 2. Seal and adopt Legacy host

- add registry state machine
- seal after controlled Legacy boot
- create immutable adoption snapshot
- migrate Runtime encoder records to private invoker

## Step 3. Retire global facade

- replace global with frozen tombstone
- reject late registration and invocation
- emit retirement receipt

## Step 4. Migrate UI requests

- convert resize binder to pipeline command plus Runtime export command
- convert main export to stable API
- remove anchors and Object URLs

## Step 5. Add Export Persistence Service

- add typed host save API
- add chunked transfer and atomic commit
- bind save receipt to export receipt

## Step 6. Repair dependency lock

- regenerate lockfile
- prove clean `npm ci`
- run full typecheck and build

## Step 7. Verify emitted artifacts

- hash emitted Worker and WASM files
- bind source and emitted identities
- verify packaged paths

## Step 8. Run packaged Electron E2E

- launch package
- wait for promotable Boot Receipt
- encode and save corpus outputs
- collect host receipts

## Step 9. Run independent cross-format verification

- decode saved files
- compare exact pixels or metrics
- verify determinism
- build matrix digest

## Step 10. Seal promotion and rollback

- create aggregate receipt
- verify previous target
- atomically update promotion pointer
- require restart

---

# 29. Rollback triggers

Any of the following shall block promotion or trigger explicit rollback consideration:

- output SHA mismatch between Runtime and host
- packaged Worker load failure
- packaged WASM digest mismatch
- independent decode mismatch
- main-thread product encode reachability
- Legacy facade callable after boot
- direct anchor product download
- save temp file leakage
- non-zero terminal Pending Jobs
- non-zero terminal save sessions
- cross-format profile regression
- Boot Receipt not promotable
- promotion receipt seal failure
- promotion pointer seal failure
- current artifact digest mismatch

No trigger may silently activate Legacy export.

---

# 30. Final promotion conditions

A build may enter `PRODUCTION_PROMOTED` only when all of the following are true.

```text
Legacy Export Facade state = RETIRED
Direct Legacy product export calls = 0
Product Object URL downloads = 0
Stable Runtime Export API = PASS
Dependency lock = PASS
Clean npm ci = PASS
Full vue-tsc = PASS
Vite production build = PASS
Emitted Worker/WASM digests = PASS
Electron package inventory = PASS
Packaged Worker READY = PASS
Electron atomic save = PASS
On-disk SHA parity = PASS
Independent decode = PASS
Required Product Profiles = PASS
Cross-format determinism = PASS
Terminal Worker Pending = 0
Terminal Save Sessions = 0
Promotion receipt seal = PASS
Rollback target verification = PASS
Promotion pointer atomic update = PASS
```

For Full Product Profile promotion, PSD CMYK actual LCMS execution and independent color validation are mandatory.

---

# 31. Source bake truth policy

An EP01 source bake may implement the ownership transfer and gates while remaining:

```text
SOURCE_BAKED_UNPROMOTED
```

A source bake must not claim:

- production Vite artifacts
- packaged Electron E2E
- actual cross-format independent decode
- actual atomic on-disk save
- full profile promotion
- rollback pointer activation

unless those operations were actually executed and their artifacts are present.

The source bake receipt shall list every missing promotion artifact explicitly.

---

# 32. Completion statement

EP01 is complete only when export authority is no longer a chain of cooperating Legacy globals, Runtime adapters, UI anchors, and unverified package paths.

The final system must be able to answer, for every saved file:

```text
Which Final Surface revision was used?
Which Runtime encoder identity was selected?
Which Worker generation and operation executed?
Which emitted Worker and WASM artifacts ran?
Which exact options were applied?
Which output structure verifier passed?
What was the Runtime output SHA-256?
What was the host-written SHA-256?
Was the file atomically committed?
Which independent decoder verified it?
Which Product Format Profile promoted it?
Which whole-build rollback target is available?
```

If any answer is unavailable, the build is not production-promoted.

