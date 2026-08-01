# TDT-EXPORT-WORKER-07 Applied

## Status

- Patch: `TDT-EXPORT-WORKER-07`
- State: `SOURCE_BAKED_UNPROMOTED`
- Build ID: `a9c880b7c5e674017778f9a5`
- Source Bake Seal: `9efeb4cf8f54d1484282d2d842bd93e1266f15f390ccedcc51729dabb0029218`
- Worker Source Manifest: `5907e0b385aad556076bf82b49276936d61387161145a7fda2aac38e9f1c8a4d`
- PSD Worker Artifact Set: `d92533278e1c652adb02c43f99f636e8e3e53d0e1adba1bfb1be8e744f72a271`
- LCMS module SHA-256: `c387a706008c06f0ae9b6ea48335f9435323836e6c5a22052956a4fd4d257b65`
- LCMS WASM SHA-256: `65eb2ea60f1d61aea14978b4b631bd2bcdf188e3c0a1b25d2af612f5b745699e`
- Artifact verification: `source-graph-only`
- Final Promotion: **not granted**

## Applied authority line

```text
Authoritative Final Surface
→ PSD Encode Command v2
→ EW02 Broker
→ dadum.worker.encoder.psd-canonical-v2
→ Worker-local ICC validation and LCMS transform
→ Worker-local RGB/CMYK Plane preparation
→ PSD Document Plan v2
→ Canonical Serializer ABI v2
→ Worker-local PSD Structure Verifier v2
→ Output SHA-256 and Allocation Ledger closure
→ R7 Export Receipt
```

## Implemented

### Renderer preparation authority removed

`psd_export_bridge.js` now transfers one exact source buffer and explicit policy/profile references. It no longer imports LCMS, splits planes, builds PSD Document Plan bytes, writes PSD resources, or reads `window.iccProfileBuffer`.

### PSD canonical Worker v2

```text
workerId: dadum.worker.encoder.psd-canonical-v2
protocol: dadum-psd-canonical-worker-v2
operation: encode.psd-canonical-v2
```

The Worker owns source validation, profile digest validation, optional LCMS transform, alpha extraction, RGB/CMYK plane construction, CMYK storage inversion, Document Plan generation, serialization, structure verification, output hashing, and allocation settlement.

### Worker-local structure verification

`psd-structure-verifier-v2.js` is part of the Worker artifact graph and validates PSD header, resource boundaries, Layer/Mask section, RAW/RLE merged data, ResolutionInfo/ICC resource cardinality, and exact EOF before a result is returned.

### Memory SSOT

The authoritative memory evidence is:

```text
memoryBudgetBytes
predictedPeakOwnedBytes
peakOwnedBytes
generationResidentBytes
liveOwnedBytesAtSettlement
allocationLedgerDigest
```

The inherited LCMS heap is reported as 536,870,912 bytes. Resident heap bytes are included in peak accounting. CMYK admission fails before LCMS initialization when predicted peak exceeds the explicit budget.

### CMYK semantic separation

```text
LCMS native output: lcms-native-cmyk8
PSD stored samples: invert-cmyk8-for-psd-v1
```

Native CMYK and stored PSD plane digests are separate receipt fields. Transform cache ownership is Worker-generation local and bounded to two entries.

### Final main-thread isolation

Successful PSD evidence requires all three values to be false:

```text
psdMainThreadPixelPreparationUsed
psdMainThreadColorTransformUsed
psdMainThreadByteWriterUsed
```

and requires `psdFinalMainThreadIsolationVerified = true` with terminal `liveOwnedBytesAtSettlement = 0`.

## Verification

### Passed

- inherited R1-R7 gates
- EW01 gates 20/20
- EW02 gates 24/24
- EW03 gates 30/30
- EW04 gates 32/32
- EW05 gates 38/38
- EW06 gates 44/44
- EW07 gates 46/46
- stable error registry 235/235
- TypeScript syntax 69 files
- isolated strict TypeScript closure
- RGB8 layered Worker closure fixture
- RGB8 flattened Worker closure fixture
- RGB16 Worker closure fixture
- Worker-local PSD structure verifier
- CMYK low-budget rejection before LCMS
- source digest and source length tamper rejection
- deterministic Runtime and Worker manifests

### Not executed or not proven

- actual CMYK LCMS transform with production source/destination ICC profiles
- independent CMYK pixel/color validation
- independent PSD decoder plane round-trip
- bundled sRGB ICC asset, which is absent from this source tree
- canonical Rust/WASM serializer v2 build
- Vite production emitted Worker/JS/WASM digests
- Electron PSD export E2E
- full `vue-tsc` and Vite build

`npm run verify:renderer` stops at `vue-tsc: not found`. `package-lock.json` is also inconsistent with declared Vue, Pinia, Vite, TypeScript and related dependencies, so the Runtime Manifest remains non-promotable.

## Promotion closure still required

1. Install the declared Node dependency graph and regenerate `package-lock.json`.
2. Add and digest the authoritative bundled sRGB ICC asset or require explicit source ICC for every CMYK export.
3. Execute real RGBA8→CMYK8 LCMS transforms with production ICC fixtures.
4. Independently validate native CMYK, PSD stored inversion, alpha, rendering intent and BPC results.
5. Build the canonical Rust/WASM PSD serializer and replace the source-reference backend.
6. Run Vite production build and seal emitted Worker, LCMS and serializer artifacts.
7. Run Electron PSD E2E, cancellation, crash restart and memory-budget corpus.
8. Issue Promotion PASS only after independent decode and color evidence are present.
