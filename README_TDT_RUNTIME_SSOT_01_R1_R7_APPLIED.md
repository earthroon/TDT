# TDT-RUNTIME-SSOT-01-R1-R7 Applied

## Scope

Legacy ExportManager Exact API Adoption / Per-Format Encoder Identity / Zero-Encoder Fail-Closed / Legacy Final Surface Promotion Bridge / Export Receipt Truth Seal

## Root cause closed by R7

The R1-R6 renderer had two disconnected authority lines:

```text
window.ExportManager.exportByFormat() / listEncoders()
    X
EncoderRegistryService, which searched non-existent legacy APIs

Legacy filtered globals
    X
PipelineService authoritative final surface revision
```

As a result, the new runtime could report encode/export modules as active while no eligible per-format encoder existed, and the legacy pipeline could produce a filtered result without publishing an authoritative final surface to the new runtime.

## Applied authority model

```text
Legacy codec implementations
→ window.ExportManager exact compatibility facade
→ EncoderRegistryService per-format runtime identities
→ ExportAuthorityService
→ authoritative PipelineService final surface
→ byte signature verification
→ output SHA-256
→ deterministic Export Receipt ledger
```

R7 does not migrate or rewrite the underlying Worker/WASM codecs. Worker URL authority, unified RPC, timeout/cancel/restart, and main-thread codec migration remain follow-up work.

## 1. Exact Legacy ExportManager API

The compatibility facade now exposes:

```text
window.ExportManager.identity
window.ExportManager.listEncoderRecords()
window.ExportManager.exportByFormatExact(format, payload)
```

Exact mode:

- accepts only an exact registered format key;
- rejects display labels;
- does not perform prefix fallback;
- does not perform base-format fallback;
- does not silently change alpha-incompatible formats to PNG;
- returns an exact result envelope with one authoritative byte carrier;
- records requested and applied options separately.

Legacy `exportByFormat()` remains only as a compatibility surface for code not yet promoted.

## 2. Per-format Runtime Encoder Identity

The generic `dadum.encoder.legacy-dispatch-v1` authority was removed.

Canonical runtime encoder identities are now assigned by exact format:

```text
dadum.encoder.jxl.v1
dadum.encoder.webp.v1
dadum.encoder.webp-lossless.v1
dadum.encoder.png.v1
dadum.encoder.png16.v1
dadum.encoder.jpg.v1
dadum.encoder.psd.v1
```

The legacy `jpeg` record is treated as an alias owned by the canonical `jpg` runtime identity and is not promoted as a second eligible encoder.

Duplicate runtime ID, canonical format, or legacy key ownership fails closed.

## 3. Zero-encoder Fail-Closed

The encode runtime module no longer becomes active merely because a registry service object exists.

```text
eligible encoder count == 0
→ E_CODEC_ZERO_ENCODERS
→ encode capability not issued
→ export capability not issued
```

Boot receipt evidence includes:

- manager API and implementation identity;
- manager registry revision;
- descriptor count;
- eligible encoder count;
- encoder set digest.

## 4. Legacy Final Surface Promotion Bridge

Legacy filtered result producers no longer write authoritative final globals directly.

They call:

```text
window.DadumRuntimeBridge.publishLegacyFinalSurface(candidate)
```

The bridge:

1. validates the candidate contract;
2. resolves source revision lineage;
3. asks `PipelineService` to allocate the next monotonic final revision;
4. registers the authoritative final-surface resource;
5. updates Pinia with serializable IDs and revisions only;
6. publishes legacy globals only as compatibility mirrors after successful promotion.

`PipelineService` remains the sole final revision allocator.

Runtime export never reads the source surface or a Canvas fallback when an authoritative final surface is absent.

## 5. Export Receipt Truth Seal

A successful runtime export now requires all of the following:

```text
Authoritative final surface binding
Exact runtime encoder selection
Requested format == applied format
Exact MIME and extension contract
Non-empty unambiguous encoded output
Magic signature verification
PNG16 IHDR bit-depth verification
Output byte SHA-256
Deterministic sealed Export Receipt
```

Receipt evidence includes:

- build ID and runtime epoch;
- source and final revisions;
- final surface ID and pipeline receipt ID;
- surface contract digest;
- requested and applied format;
- runtime encoder ID and legacy encoder key;
- ExportManager implementation identity and registry revision;
- encoder set digest;
- requested and applied options digests;
- MIME, extension, byte length, output SHA-256;
- signature verifier identity and result;
- alpha preservation result;
- `runtime-final-surface` export-source identity.

A multi-receipt ledger replaces the earlier single opaque export state.

## Static and contract verification

```text
PASS GATE-R1-01 / R1-02 Vite entry and production source closure
PASS GATE-R1-08 Pinia serializability
PASS GATE-R1-06 / 07 / 15 / 17 runtime ownership and isolation
PASS GATE-R1-11 Legacy admission, 50 roots
PASS GATE-R1-R2-DIAG single diagnostic emission
PASS GATE-R1-R3-GLOBAL-OWNERSHIP
PASS GATE-R1-R4-ASYNC-GLOBAL-RESERVATION
PASS GATE-R1-R5-DEFERRED-GLOBAL-ATTRIBUTION
PASS GATE-R1-R6-PLACEHOLDER-QUARANTINE
PASS GATE-R1-20 Boot receipt determinism 100/100
PASS GATE-R7-01..15 Exact API / Encoder Identity / Final Surface / Receipt
PASS R7 Export Receipt determinism 100/100
PASS TypeScript syntax, 51 units
PASS stable error registry, 46/46
PASS strict targeted TypeScript semantic check with temporary local type stubs
PASS active Legacy ExportManager exact API smoke
```

The active Legacy ExportManager smoke confirmed:

```text
implementationId = export-manager-js-r7
registryRevision = 7
descriptorRecords = 7
canonicalEligibleRuntimeEncoders = 6
exact PNG result envelope = PASS
display-label rejection = PASS
```

The smoke verifies the exact dispatch contract, not the real Worker/WASM encoder binaries.

## Promotion state

```text
SOURCE_BAKED_UNPROMOTED
```

Final promotion is deliberately not issued because:

- `package-lock.json` does not contain the Vue/Pinia/Vite dependency graph declared by `package.json`;
- `vue-tsc` is unavailable in this container;
- Vite is unavailable in this container;
- Electron runtime smoke was not executed;
- real per-format Worker/WASM encode E2E was not executed;
- Worker URL and Worker RPC authority are outside R7 scope.

The failed local tool attempts are retained in:

```text
artifacts/runtime/VUE_TSC_ATTEMPT_R1_R7.log
artifacts/runtime/VITE_BUILD_ATTEMPT_R1_R7.log
```

## Local promotion commands

```powershell
npm install
npm run typecheck:renderer
npm run verify:renderer
npm run start
```

After R7, the next authority patch should address Worker URL ownership and a unified Encoder Worker Broker rather than changing the exact export contract again.
