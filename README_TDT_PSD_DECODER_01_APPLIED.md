# TDT-PSD-DECODER-01 Applied

## Status

- Source status: `SOURCE_BAKED_UNPROMOTED`
- Evidence state: `PSD_DECODER_SOURCE_ADOPTED`
- Production promotion: `false`
- Build ID: `9bc37628e4ca74697610f8ab`
- Build authority digest: `ec8fc5a616376082dc76c4c6007233813de083f19e225079033431445ea49ec0`
- PSD auxiliary worker manifest digest: `56354a68b73983461963a148736d830cbca289e1d9e08c3bc2eba062cf84f662`
- Source bake seal: `e634d5248b17ed751164fc1a274fb84cffcf5ec56124535d9de68d72db6ead6d`

## What was applied

TDT-PSD-DECODER-01 adds an independent PSD validation path that does not reuse the presentation decoder result.

```text
PSD bytes
→ dedicated PSD decoder Worker
→ direct PSD v1 parser
→ RAW / PackBits RLE plane decode
→ exact composite and layer planes
→ exact RGB8 / RGB16 U16 / CMYK8 surfaces
→ ICC and ResolutionInfo resource evidence
→ generation-owned result
```

### Independent parser scope

The promoted source contract is intentionally narrow and explicit:

| Tuple | Source fixture status |
|---|---:|
| PSD v1 RGB8 RAW | PASS |
| PSD v1 RGB8 RLE | PASS |
| PSD v1 RGB16 RAW | PASS |
| PSD v1 RGB16 RLE | PASS |
| PSD v1 CMYK8 RAW | PASS |
| PSD v1 CMYK8 RLE | PASS |
| PSD v1 single-layer RGB8 RLE | PASS |
| PSB v2 | NOT PROMOTED |
| ZIP | NOT PROMOTED |
| ZIP Prediction | NOT PROMOTED |
| Multiple arbitrary layers | NOT PROMOTED |

### Exact surfaces

- RGB8: `rgba8unorm-u8-v1`
- RGB16: `rgba16le-unorm-u16-v1`
- CMYK8: `psd-stored-cmyk8-density-v1`
- Alpha: straight, with hidden RGB retained

The exact path does not use Canvas, ImageBitmap, LCMS, transparent-pixel repair, premultiplication, RGBA16F, or preview generation. Those remain presentation concerns and cannot replace exact evidence.

### Layer and resource truth

The direct parser records:

- PSD version, dimensions, channels, depth and color mode
- section offsets and lengths
- composite and layer compression
- single layer bounds, name, channel IDs and channel payloads
- Image Resource inventory
- ICC resource `1039` exact bytes and SHA-256
- ResolutionInfo resource `1005`, Fixed 16.16 DPI fields and SHA-256
- exact EOF

### Worker lifecycle

- Worker ID: `dadum.worker.decoder.psd-independent-v1`
- Protocol: `dadum-psd-independent-decoder-worker-v1`
- Pending ownership: `generation + requestId`
- Dispose rejects all pending requests and terminates the generation
- stale generation results are not admitted
- JXL and PSD independent decoders are closed together by the decoder registry

## Validation

- PSD source gates: `112/112`
- PSD runtime fixture tests: `176/176`
- Stable error registry: `529/529`
- TypeScript syntax: `77 files`
- Isolated strict TypeScript: PASS
- R7, EW01-EW07, EP01-EP03, BUILD-LOCK-01, BUILD-EMIT-01, MODJPEG-01, NATIVE-DECODER-01 and JXL-CODEC-01 regression: PASS

## Production blocker truth

The current dependency lock is not promoted. `npm run build:renderer` stops before Vite:

```text
Toolchain verification: PASS
Dependency lock: rootExact=false, promotionReceipt=false
Vite production emit: NOT RUN
Exit code: 1
```

The following are therefore not claimed:

- serializer-to-independent-decoder production round-trip
- packaged Electron PSD worker execution
- emitted route and body SHA verification
- 100 same-generation repetitions
- 20 generation-restart repetitions
- 5 application relaunch repetitions
- PSB, ZIP or ZIP Prediction capability
- final `PSD_DECODER_PROMOTED` status
