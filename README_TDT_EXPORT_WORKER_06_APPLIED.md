# TDT-EXPORT-WORKER-06 Applied

## Status

- Patch: `TDT-EXPORT-WORKER-06`
- State: `SOURCE_BAKED_UNPROMOTED`
- Build ID: `8e69f8d57a78a504b0a2ef22`
- Source Bake Seal: `d4d62f7509279b086ba56f0297d3286af7dd85847368d9ebf0fabff1cb556d9e`
- Worker Source Manifest: `1c6a110140a587c01fda30ce929924750a5dc186d6982fc47e67eb4bd90363e9`
- JPEG Worker Artifact Set: `cd0bca5d6c4406497c2f85ce5515a17d9d8e19dc722b38cfb0fd748df0cef395`
- MODJPEG module SHA-256: `6c951106e5cc2b68b06b8f6290e448a892c2a31da017f3c5946f5fb7903b6166`
- MODJPEG WASM SHA-256: `6f669d33e1d7f47f95ca14c4562bbb55985942f5c43a01521aeb6f01dd2e0a14`
- Artifact verification: `source-graph-only`
- Final Promotion: **not granted**

## Applied authority line

```text
Final Surface RGBA8
→ JPEG Encode Plan v1
→ EW02 Broker call
→ dadum.worker.encoder.modjpeg-canonical-v1
→ worker-local RGBA8→RGB8 and explicit Alpha policy
→ inherited MODJPEG Emscripten artifact
→ encode_mozjpeg_RGB()
→ worker-local JFIF/ICC marker finalizer
→ JPEG Structure Verifier v2
→ Worker output SHA-256 / post-worker mutation seal
→ R7 Export Receipt
```

## Implemented

### Dedicated canonical JPEG worker

The active JPEG product path now uses:

```text
workerId: dadum.worker.encoder.modjpeg-canonical-v1
operation: encode.jpeg-baseline-444
protocol: dadum-modjpeg-canonical-worker-v1
```

`ExportManager` no longer imports or executes `modjpeg_bind_bootstrap.mjs` on the renderer main thread. Worker admission, timeout, cancellation, crash restart and pending closure remain owned by the EW02 Broker.

### ABI preservation

The Worker adapter preserves the existing MODJPEG ABI:

```text
encode_mozjpeg_RGB()
jpgbuffer_ptr()
jpgbuffer_len()
jpgbuffer_free()
```

Input allocation, RGBA-to-RGB conversion, ABI invocation, output copy, marker finalization and output digest generation occur in the Worker realm.

### Alpha policy

JPEG cannot preserve alpha. Silent alpha loss is forbidden.

```text
reject-nonopaque-v1
composite-over-matte-srgb8-v1
```

The reject policy fails on the first non-opaque pixel. The composite policy requires an explicit RGB matte and applies deterministic integer sRGB8 compositing in the Worker.

### Quality contract

The canonical value is an integer percentage from 1 through 100.

```text
qualityPercent = 1..100
```

Legacy ratio input is accepted only when `qualityUnit: 'ratio'` is explicit. The Worker and Export receipts seal requested value, requested unit, applied percentage and whether adaptation occurred.

### JPEG structure truth

The Worker requests baseline 8-bit 3-component 4:4:4 output. The Runtime verifier independently checks:

- SOI and exact EOI
- SOF0 baseline sequential frame
- 8-bit precision
- three components
- Y, Cb and Cr sampling factors all `1x1`
- exactly one JFIF APP0 marker
- complete ICC APP2 sequence
- exact EOF
- worker output SHA-256 equals final Runtime output SHA-256

Progressive, 4:2:0, 4:2:2, grayscale and CMYK JPEG are not promoted.

### Receipt evidence

EW06 adds Worker and protocol identity, Encode Plan digest, ABI output digest, input digests, quality provenance, alpha evidence, observed JPEG structure, marker evidence, thread policy and post-worker mutation evidence to the final Export Receipt.

## Pthread truth boundary

The current binary is not a rebuilt canonical single-thread artifact. The included Emscripten module still declares:

```text
PTHREAD_POOL_SIZE = 8
SharedArrayBuffer required = true
canonicalSingleThread = false
pthreadRetirementVerified = false
```

The outer JPEG encode is isolated in a Dedicated Worker, but the inherited Emscripten artifact can create child pthread workers. EW06 does not label this state as single-thread or fully promoted.

## Verification

### Passed

- inherited R1-R7 gates
- EW01 gates 20/20
- EW02 gates 24/24
- EW03 gates 30/30
- EW04 gates 32/32
- EW05 gates 38/38
- EW06 gates 44/44
- stable error registry 202/202 referenced codes
- TypeScript syntax 69 files
- isolated strict TypeScript closure
- changed JavaScript/MJS syntax
- JPEG structure fixture
  - SOF0 baseline
  - 4:4:4 sampling
  - JFIF cardinality
  - exact EOF
  - 4:2:0 rejection
  - progressive rejection
  - trailing-byte rejection
- deterministic Runtime and Worker manifests

### Not executed or not proven

- actual MODJPEG WASM encode call
- rebuilt single-thread MODJPEG artifact
- independent JPEG decoder round-trip
- quality corpus and lossy metric thresholds
- pthread child-worker closure after dispose, hard cancel and crash restart
- Vite production emitted Worker/WASM digests
- Electron JPEG export E2E
- full `vue-tsc` and Vite build

`npm run verify:renderer` stopped at `vue-tsc: not found`. `package-lock.json` is also inconsistent with the declared Vue, Pinia and Vite dependency graph, so the Runtime Manifest remains non-promotable.

## Promotion closure still required

1. Install the declared Node dependency graph and regenerate `package-lock.json`.
2. Rebuild MODJPEG as a canonical single-thread Emscripten artifact with no SharedArrayBuffer and no pthread child pool.
3. Run Vite production build and seal emitted JPEG Worker, JS and WASM digests.
4. Run actual opaque and matte-composited JPEG encoding through `encode_mozjpeg_RGB()` in Electron.
5. Decode with an independent JPEG decoder and verify dimensions, component layout and alpha-composite fixtures.
6. Run the quality corpus and seal the lossy metric policy and thresholds.
7. Measure child-worker count after normal dispose, hard cancel and crash restart.
8. Issue Promotion PASS only when all runtime evidence is present.
