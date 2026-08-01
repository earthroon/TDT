# TDT-EXPORT-PROMOTION-03 Applied

## Status

- Patch: `TDT-EXPORT-PROMOTION-03`
- State: `SOURCE_BAKED_UNPROMOTED`
- Build ID: `1bc226b555eba090152ee2bf`
- Source Bake Seal: `70bfaf6504ddbf7c14153fda0eee36a604cc487a487bf3a34130c34be0357286`
- Production Pointer SHA-256: `02fb8993c08fee3436c6c96bca183c71364d83b3b46279b1f8f5068ccdd2741a`
- Fixture Corpus Digest: `ce6abed114d85241866523700d6430a2b9dbeb0144a334fee5c218b09ac725b7`
- Production promoted: `false`

## Applied authority

```text
Packaged Candidate Identity
→ E2E Run Token / Preauthorized Export Root
→ Stable Runtime Export
→ Electron Atomic Save
→ Independent Decoder Matrix
→ Cross-format Receipt Conservation
→ Production Pointer v2 CAS
→ Promoted Relaunch
→ Whole-build Rollback Drill
```

## Source implementation

### Packaged E2E save admission

`electron.mjs`, `preload.cjs`, and `app/electron/ep03-e2e-guard.mjs` now implement:

- `DADUM_E2E_MODE=1` admission
- 256-bit hexadecimal `DADUM_E2E_RUN_TOKEN`
- absolute `DADUM_E2E_EXPORT_ROOT`
- root-confined target resolution
- `e2e-preauthorized-root-v1` save receipts
- packaged launch identity IPC
- no direct renderer access to the raw run token

The source runtime smoke proves valid admission, bad-token rejection, root-escape rejection, Pointer CAS, stale-CAS rejection, and atomic readback.

### Independent decoder identities

Runtime decoder identities are explicit:

- `dadum.decoder.native-raster-v1`
- `dadum.decoder.jxl-independent-v1`
- `dadum.decoder.psd-independent-v1`

JXL uses `jxl_wgpu_bridge_bg.wasm`, distinct from encoder `jxl_bindings.wasm`.
PSD uses `psd_core.wasm`, distinct from serializer `psd_exporter_wasm_bg.wasm`.

Source identity is wired, but packaged execution is not promoted because the native raster `.node` artifact is absent and no packaged candidate exists.

### Deterministic fixture corpus

`fixtures/promotion/ep03/` contains deterministic raw fixtures for:

- opaque RGBA8
- alpha-zero hidden RGB
- translucent matte composition
- RGBA16LE gradient

Production RGB and CMYK ICC fixtures are intentionally marked absent rather than synthesized.

### MODJPEG artifact truth

The inherited MODJPEG artifact is not promoted:

- Pthread pool size: `8`
- Pthread/shared-memory symbol observations: `87`
- Child Worker references: `2`
- Shared memory: `true`
- Canonical single-thread: `false`

### Production Pointer v2

The pointer now carries:

- active and candidate Build IDs
- active and candidate Package Content IDs
- active and candidate Release Profile IDs
- expected previous Pointer SHA-256
- Promotion Receipt SHA-256
- whole-build rollback policy

The active Build remains `null`. Source generation cannot mutate the production pointer.

## Verification

- R7 inherited gate: PASS
- EW01 through EW07: PASS
- EP01: 54/54 PASS
- EP02: 60/60 PASS
- EP03: 68/68 PASS
- Stable Error Registry: 287/287 PASS
- TypeScript syntax: 70 files PASS
- isolated strict TypeScript: PASS
- JXL container structure smoke: PASS
- JPEG SOF0 / 4:4:4 structure smoke: PASS
- PSD worker closure smoke: PASS
- EP03 E2E guard / Pointer CAS source runtime smoke: PASS
- Receipt reference conservation: PASS for present blocked receipts

## Promotion blockers

- Dependency lock root graph mismatch
- `vue-tsc` unavailable in the current install
- Native raster decoder `.node` missing
- Packaged Electron candidate absent
- Packaged independent decoder execution not run
- Production ICC fixtures absent
- MODJPEG single-thread rebuild not run
- Cross-format Electron E2E not run
- Production Pointer not mutated
- Promoted package relaunch not run
- Whole-build rollback drill not run

No packaged, decoder, color, pointer, or rollback PASS was fabricated.
