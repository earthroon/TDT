# TDT-JXL-CODEC-01 Applied

## Status

- Status: `SOURCE_BAKED_UNPROMOTED`
- Evidence state: `JXL_CODEC_SOURCE_ADOPTED`
- Build ID: `c4a33007055d20625c041f48`
- Build authority digest: `7da86cb21817bc8dd3089bfb791bfb1ed73d6e43f67f6645722e3e3b1939c4dd`
- Source bake seal: `1875efdf6ada325d051d41472e719ea1e132bc8fc87bc051405b0fd566de0ee7`

This source bake preserves the existing JXL encoder ABI and pthread artifact while adding an independent exact RGBA8 decoder generation and the verification surfaces required for later packaged promotion. It does not claim production JXL round-trip execution.

## Canonical artifacts

| Artifact | SHA-256 |
|---|---|
| Encoder WASM `jxl_bindings.wasm` | `2536b058983c2fbc14d37f438a742fa01ed24c2b06951b8552d7f7830c560f31` |
| Encoder glue `jxl_bindings.mjs` | `ed383c356823f11ec272c996b77cde7a5ddaae598cbd3bf8544854fdda91e` |
| Independent decoder WASM `jxl_wgpu_bridge_bg.wasm` | `0f2524ed35343520f3492dea6a12cf50ea3d1d25023b0617ded65beff8bab7b3` |
| Independent decoder glue `jxl_wgpu_bridge.js` | `28e848c7503e29286db47827819402363990f82d3574ba7451b3a62c8b8ca8b2` |

The encoder and decoder WASM artifacts are distinct. The decoder does not export the encoder ABI.

## Applied authority changes

### Encoder generation

- Preserved `jxl_encode_qmap_ex()` and `jxl_free()` ABI.
- Adopted `emscripten-pthread-pool-4-canonical-v1` as the canonical encoder thread contract.
- Added tracked pthread child-worker lifecycle evidence.
- Added COI and shared-memory evidence.
- Kept native-call cancellation truthful: parent worker termination is required during a synchronous native encode.

### Independent decoder generation

- Added worker ID `dadum.worker.decoder.jxl-independent-v1`.
- Added protocol `dadum-jxl-independent-decoder-worker-v1`.
- Added operation `decode.jxl-rgba8-exact`.
- Calls `decode_jxl_ex(..., OutputKind.Rgba8, false)` directly.
- Copies the WASM view into a fresh `Uint8Array` before transfer.
- Calls `DecodedImage.free()` in `finally`.
- Forbids Canvas, ImageBitmap, RGBA16F intermediates, browser color management, premultiply/unpremultiply, and encoder-module sharing.

### Exact surface and Hidden RGB

The decoder returns:

- Surface ID `dadum.jxl-decoded-rgba8-exact-v1`
- Storage `rgba8unorm`
- Sample encoding `rgba8unorm-u8-v1`
- Channel order `rgba`
- Alpha mode `straight`
- Row stride `width * 4`

The round-trip verifier compares every RGBA byte, including RGB bytes whose alpha is zero. Hidden RGB mismatches are classified separately from ordinary pixel mismatches.

### Container metadata

Added an independent container parser for:

- JXL signature
- One `ftyp`
- `jxlc` or ordered `jxlp`
- One `Exif`
- One `xml ` box
- Resolution evidence
- Exact EOF
- `srgb` or `linear-srgb` color-encoding policy

### Build and worker manifests

- Encoder broker manifest remains five encoder workers.
- Independent JXL decoder is recorded in a separate auxiliary source manifest.
- Production emitted-worker tooling combines the two manifests only at emitted-artifact verification time.
- Encoder broker ownership is not widened to include the decoder.

## Verification

- JXL source gates: `108/108`
- JXL runtime and policy tests: `168/168`
- Stable error registry: `466/466`
- TypeScript syntax: `76 files`
- Isolated strict TypeScript: PASS
- R7, EW01-EW07, EP01-EP03, BUILD-LOCK-01, BUILD-EMIT-01, MODJPEG-01, and NATIVE-DECODER-01 regression: PASS
- Runtime manifest, encoder worker manifest, and independent decoder manifest deterministic regeneration: PASS

## Production blocker truth

`npm run build:renderer` was executed. Toolchain verification passed, then dependency-lock verification failed closed with:

```text
rootExact=false
exactDirect=true
promotionReceipt=false
```

Vite did not execute.

The following are deliberately not claimed:

- Actual JXL encode execution in the production Vite build
- Independent JXL RGBA8 decode of an encoder-produced file
- Hidden RGB corpus round-trip
- 100 same-generation output-identity repetitions
- 20 generation-restart repetitions
- 5 packaged-app relaunch repetitions
- Packaged Electron COI route validation
- Production pthread-generation closure measurement

## Promotion blockers

- `dependency-lock-not-promoted`
- `production-vite-emit-not-run`
- `packaged-electron-jxl-e2e-not-run`
- `independent-jxl-roundtrip-corpus-not-run`
- `pthread-generation-closure-not-measured-in-production`
