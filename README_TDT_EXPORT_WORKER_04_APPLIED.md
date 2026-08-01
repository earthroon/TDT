# TDT-EXPORT-WORKER-04 Applied

## Status

- Patch: `TDT-EXPORT-WORKER-04`
- State: `SOURCE_BAKED_UNPROMOTED`
- Build ID: `22997b711a2f00ce5912c49e`
- Source Bake Seal: `2461fc6bd9b7d8035a12df3ffa25123ac87457190a570f69b7c3f56b6d37270e`
- Worker Source Manifest: `230bd177fa54495b276913d1eb5702fa3b022b1420bed9bd396fdda468dae0f7`
- Artifact verification: `source-graph-only`
- Final Promotion: **not granted**

## Applied authority line

```text
Final Surface
→ renderer-main plane preparation / optional LCMS
→ PSD Document Plan v2
→ EW02 Broker call
→ dadum.worker.encoder.psd-canonical-v1
→ PSD Serializer ABI v2
→ PSD Structure Verifier v2
→ output SHA-256 / post-mutation seal
→ R7 Export Receipt
```

## Implemented

### PSD Document Plan v2

Added a binary request codec that represents:

- `layered-rgb8-single-layer`
- `flattened-rgb8`
- `flattened-rgb16`
- `flattened-cmyk8`
- RAW or PackBits RLE compression
- layer name and channel identity
- merged composite planes
- X/Y DPI
- ICC profile bytes
- alpha and plane ownership evidence

### Canonical PSD worker

The active PSD serializer worker is now:

```text
dadum.worker.encoder.psd-canonical-v1
operation: serialize.psd-document
protocol: dadum-psd-canonical-worker-v1
```

Layered RGB8 no longer succeeds through a renderer-main JavaScript PSD writer. All four supported document modes traverse the EW02 broker and the canonical PSD worker.

### Main-thread byte writer removal

The active export path no longer owns or calls:

- `buildLayeredPSD8()`
- `injectResolutionResourceIntoPSD()`
- renderer-side PSD header/resource/layer writers
- post-worker DPI resource mutation

Renderer-main still prepares planes and performs LCMS RGB-to-CMYK conversion. EW04 deliberately does not claim those steps were moved to the worker.

### Structure and resource truth

The runtime verifier checks:

- `8BPS`, PSD version 1 and reserved bytes
- dimensions, channels, bit depth and color mode
- color-mode/resource/layer/image-data section boundaries
- ResolutionInfo resource `1005`
- ICC resource `1039`
- layer count and channel records
- RAW/RLE merged compression layout
- exact EOF
- expected document-plan evidence

The worker output digest is compared with the final export output digest. Any mutation after serialization fails with `E_PSD_OUTPUT_MUTATED_AFTER_SERIALIZE`.

## Rust/WASM truth boundary

The canonical Rust v2 source crate is included at:

```text
native/psd-exporter-wasm-v2
```

This container had no `rustc`, `cargo`, or `wasm-pack`, so a new Rust/WASM binary was **not compiled or published**. The runnable source bake therefore uses an explicitly identified worker-side reference serializer:

```text
implementationId: dadum.psd-source-reference-serializer-v2
backendKind: source-reference-js
canonicalRustWasm: false
```

This backend exists to exercise the Document Plan, Worker Broker, PSD byte structure, verifier and receipt contracts. It is not represented as the final Rust/WASM promotion artifact.

## Verification

### Passed

- inherited R1-R7 gates
- EW01 gates 20/20
- EW02 gates 24/24
- EW03 gates 30/30
- EW04 gates 32/32
- TypeScript syntax 62 files
- stable error registry 117/117
- isolated strict TypeScript closure
- source-reference PSD runtime smoke 4/4
  - layered RGB8 RAW
  - flattened RGB8 RLE
  - flattened RGB16 RAW
  - flattened CMYK8 RLE with ICC
- PNG/WebP and worker authority regressions
- deterministic receipts and manifests

### Not executed or not proven

- compiled canonical Rust/WASM v2
- Vite production emitted worker/WASM digest
- Electron worker E2E
- independent PSD decoder plane round-trip
- hidden-RGB round-trip through an independent decoder
- Photoshop interoperability/open test
- full `vue-tsc` and Vite build

`npm run verify:renderer` stopped at `vue-tsc: not found`. The package lock is also not consistent with the declared Vue/Pinia/Vite toolchain, so the runtime manifest is not promotable.

## Promotion closure still required

1. Install the declared Node dependency graph and regenerate `package-lock.json`.
2. Install Rust plus `wasm-pack` and run `npm run build:psd-wasm-v2`.
3. Replace the source-reference package with the generated wasm-bindgen package.
4. Run Vite production build and seal emitted worker/WASM digests.
5. Run Electron E2E for all four PSD modes.
6. Decode outputs with an independent PSD decoder and compare channel-plane digests.
7. Issue a promoted serializer receipt only when `canonicalRustWasm=true` and all evidence is present.
