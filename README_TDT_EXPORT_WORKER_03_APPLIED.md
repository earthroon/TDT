# TDT-EXPORT-WORKER-03 Applied

## Status

- Patch: `TDT-EXPORT-WORKER-03`
- Status: `SOURCE_BAKED_UNPROMOTED`
- Final Promotion PASS: **not issued**
- Build ID: `15e5aa3464fd16388af057e6`
- Source bake seal: `e6edd9cb9ed7a5f279d5aa059e8f0dfe8370b14f2c509e460483182835b16277`
- Worker source manifest digest: `5b7284b251bb989230704a9f7f2bcdd96832165df369f07bc0f5c1669f7b2d40`

## Applied authority change

EW02 gave the Runtime Broker ownership of Worker jobs. EW03 promotes the first canonical codec group on top of that authority.

```text
WebP Lossless / PNG8 / PNG16
→ exact Runtime encoder identity
→ Broker-only Worker submission
→ canonical Worker codec operation
→ structural output verification
→ Export Receipt codec evidence
```

## WebP Lossless

The canonical `webp-lossless` path now requires:

- `lossless = true`
- `nearLossless = 100`
- `exactTransparentRgb = true`
- Worker-only WASM execution
- Canvas fallback forbidden
- `VP8L` chunk required
- lossy `VP8 `, `ANIM`, and `ANMF` chunks forbidden
- `mainThreadEncoderUsed = false`
- `fallbackUsed = false`

The source bake verifies RIFF/VP8L structure. Independent decoder pixel round-trip and transparent-RGB exactness remain promotion blockers.

## PNG family promotion

The previous PNG16-only Worker identity was retired from the active product graph.

```text
dadum.worker.encoder.png16-v1
→ retired

dadum.worker.encoder.png-family-v1
├─ dadum.encoder.png.v1   → encode.png8
└─ dadum.encoder.png16.v1 → encode.png16
```

Both operations share one LodePNG Emscripten module instance and one shared-memory authority.

- PNG8 calls `_png_encode_rgba8`
- PNG16 calls `_png_encode_rgba16`
- active `ExportManager` no longer calls `window.UPNG.encode()`
- PNG8 requires IHDR bit depth 8 and color type 6
- PNG16 requires IHDR bit depth 16 and color type 6
- all PNG chunks are CRC checked through `IEND`
- RGBA8→RGBA16 expansion is allowed only under `rgba8-to-rgba16-x257-explicit-v1`

## Receipt truth

EW03 Export Receipts now bind:

- codec promotion state
- codec promotion ID
- structural verifier ID
- main-thread encoder evidence
- fallback evidence
- PNG bit depth and color type
- PNG CRC verification
- WebP VP8L and animation evidence
- pixel-round-trip-at-promotion state

The current source bake writes `codecPromotionState = SOURCE_BAKED_UNPROMOTED` and does not claim pixel round-trip verification.

## Verification

Passed:

- inherited R1-R6 source gates
- R7 gates 01-15
- EW01 gates 01-20
- EW02 gates 01-24
- EW03 gates 01-30
- strict TypeScript closure for changed Runtime/Worker graph
- changed JavaScript/MJS syntax
- generated Worker manifest determinism
- generated Runtime Build ID determinism
- structural runtime smoke:
  - PNG8 IHDR and CRC
  - PNG16 IHDR and CRC
  - VP8L acceptance
  - damaged PNG CRC rejection
  - lossy VP8 rejection

## Promotion blockers

`npm run verify:renderer` stopped at `vue-tsc: not found` with exit code 127 because this environment has no installed project dependency graph.

This bake therefore does not claim:

- Vite production Worker bundles
- emitted Worker JS/WASM SHA-256 verification
- Electron Worker E2E
- real WebP Lossless WASM encode
- real PNG8/PNG16 LodePNG WASM encode
- independent decoder pixel round-trip
- transparent-RGB exact preservation
- production pthread/subworker cleanup behavior

Artifact verification remains `source-graph-only` and the result remains `SOURCE_BAKED_UNPROMOTED`.
