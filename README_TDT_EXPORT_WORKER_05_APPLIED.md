# TDT-EXPORT-WORKER-05 Applied

## Status

- Patch: `TDT-EXPORT-WORKER-05`
- State: `SOURCE_BAKED_UNPROMOTED`
- Build ID: `f1f406107dbd882d73738283`
- Source Bake Seal: `98dc19c10abb70b1f3c6cab64d7623889b23251955a8fe0bac36653423df138b`
- Worker Source Manifest: `bd4afde4b9e85c3bf481bf9556bf71cc29d9b8b9a430373ccbf66cdd6c13f43f`
- JXL Worker Artifact Set: `1e63113465767d6efa40304de9e86df9728fef0d1698cff4973c47a0c028380d`
- JXL WASM artifact SHA-256: `2536b058983c2fbc14d37f438a742fa01ed24c2b06951b8552d7f7830c560f31`
- Artifact verification: `source-graph-only`
- Final Promotion: **not granted**

## Applied authority line

```text
Final Surface RGBA8
→ JXL Encode Plan v1
→ EW02 Broker call
→ dadum.worker.encoder.jxl-canonical-v1
→ worker-local Emscripten module singleton
→ preserved jxl_encode_qmap_ex()
→ worker-local Resolution Container Finalizer
→ JXL Structure Verifier v2
→ Worker output SHA-256 / post-worker mutation seal
→ R7 Export Receipt
```

## Implemented

### Dedicated canonical JXL worker

The active JXL product path now uses:

```text
workerId: dadum.worker.encoder.jxl-canonical-v1
operation: encode.jxl-lossless
protocol: dadum-jxl-canonical-worker-v1
```

`ExportManager` no longer imports or executes `export_autotune_jxl.mjs` on the renderer main thread. Dormant legacy JXL workers remain in the repository as non-authoritative files and are not reachable from the active export graph.

### ABI preservation

The worker adapter preserves the existing stable ABI:

```text
jxl_encode_qmap_ex()
jxl_free()
```

It owns input allocation, `HEAPU8` upload, ABI invocation, output copy, free, resolution-container finalization and output digest generation inside the worker realm.

### Product capability truth

EW05 advertises only the capability supported by the current input contract:

```text
RGBA8 lossless JXL
bitDepth = 8
lossless = true
distance = 0
quality = 100
threads = 1..4
```

The following requests fail closed:

- 16-bit JXL before an actual `jxl_encode_qmap_ex()` U16 ABI fixture passes
- lossy JXL
- conflicting lossless parameters
- custom ICC bytes unsupported by the preserved ABI
- thread requests greater than the compiled pool size of 4
- non-RGBA8 input storage

### Pthread and shared-memory contract

The worker requires `SharedArrayBuffer` and cross-origin isolation. The declared thread request is restricted to `1..4`, matching the compiled pool contract. Requested and executed thread counts are sealed into the Worker and Export receipts.

Actual child-worker closure after dispose has not been measured in this source bake and is therefore not marked PASS.

### JXL container truth

Final JXL bytes are normalized inside the worker. The verifier checks:

- JXL signature box
- exactly one `ftyp`
- exclusive `jxlc` or `jxlp` carrier
- at most one `Exif`
- at most one `xml `
- complete box boundaries
- exact EOF
- worker output SHA-256 equals final Runtime output SHA-256

Renderer-side mutation after Worker return is forbidden.

## Verification

### Passed

- inherited R1-R7 gates
- EW01 gates 20/20
- EW02 gates 24/24
- EW03 gates 30/30
- EW04 gates 32/32
- EW05 gates 38/38
- TypeScript syntax 66 files
- stable error registry 144/144
- isolated strict TypeScript closure
- changed JavaScript/MJS syntax
- JXL container source fixture
  - signature, `ftyp`, `Exif`, `xml `, `jxlc`
  - exact EOF
  - truncated box rejection
  - conflicting carrier rejection
- deterministic Runtime and Worker manifests

### Not executed or not proven

- actual `jxl_bindings.wasm` encoding call
- independent JXL decoder RGBA8 exact round-trip
- alpha-zero hidden RGB exact round-trip
- RGBA16/U16LE ABI fixture
- pthread child-worker closure after dispose/restart
- Vite production emitted Worker/WASM digests
- Electron JXL export E2E
- full `vue-tsc` and Vite build

The JXL WASM artifact is present and hashed, but this environment did not execute the encoder. `npm run verify:renderer` stopped at `vue-tsc: not found`. `package-lock.json` is also inconsistent with the declared Vue/Pinia/Vite dependency graph, so the Runtime Manifest remains non-promotable.

## Promotion closure still required

1. Install the declared Node dependency graph and regenerate `package-lock.json`.
2. Run the Vite production build and seal emitted JXL Worker/WASM digests.
3. Run actual RGBA8 lossless encoding through `jxl_encode_qmap_ex()` in Electron.
4. Decode with an independent JXL decoder and compare RGBA plus hidden-RGB fixtures.
5. Measure Pthread child count after normal dispose, hard cancel and crash restart.
6. Run and seal the explicit U16LE ABI fixture before advertising 16-bit JXL.
7. Issue Promotion PASS only when all runtime evidence is present.
