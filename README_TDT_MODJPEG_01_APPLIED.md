# TDT-MODJPEG-01 Applied

## Status

- Status: `SOURCE_BAKED_UNPROMOTED`
- Evidence state: `CANONICAL_PTHREAD_ARTIFACT_SOURCE_ADOPTED`
- Build ID: `24a051fd97023b761a9ddadc`
- Source bake seal: `e56f1babb1843c8e53d54578b7c8d1cc7bba552a3ddfaa4ca561264af28ca2e5`
- Worker source manifest: `435ac3eac48b6ec05a84df1d687d4c0d36886c633b9d418c2917d1cf11c8e3ab`
- MODJPEG worker artifact set: `1883ff7a565f03ce9c8b2ae6b632fb4030fe08afd325cdfc66c8b1bce86551ff`

## Canonical existing artifact

- `libmodjpeg_wasm.mjs`: `6c951106e5cc2b68b06b8f6290e448a892c2a31da017f3c5946f5fb7903b6166`
- `libmodjpeg_wasm.wasm`: `6f669d33e1d7f47f95ca14c4562bbb55985942f5c43a01521aeb6f01dd2e0a14`
- Artifact bytes changed: `false`
- Canonical pthread pool: `8`
- Shared memory: `256 MiB initial / 2 GiB maximum`

## Applied authority

`Vite Dev/Preview COI -> canonical MODJPEG outer Worker -> emitted pthread bootstrap URL -> 8 child Workers -> encode_mozjpeg_RGB() -> Baseline 4:4:4 verifier -> Export Receipt`

The adapter now tracks all pthread child Workers, exposes READY and DISPOSE evidence, and terminates the tracked generation on dispose or module initialization failure.

## Verification

- MODJPEG gates: `84/84`
- Runtime policy and tracker tests: `124/124`
- Stable errors: `399/399`
- Strict TypeScript: `PASS`
- R7, EW01-EW07, EP01-EP03, BUILD-LOCK-01, BUILD-EMIT-01: `PASS`

## Promotion blockers

- BUILD-LOCK-01 is not promoted.
- Production Vite emitted pthread child-bootstrap closure was not produced.
- Packaged Electron COI and generation-closure E2E were not executed.
- JPEG output identity repetitions were not executed.
