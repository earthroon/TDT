# TDT-PROMOTION-BASELINE-00 Applied

## State

`SOURCE_BAKED_UNPROMOTED`

This bake implements the executable promotion baseline without claiming a production promotion on a non-canonical host.

## Implemented

- Canonical baseline input and source authority digest
- Dependency lock recovery/promotion orchestration
- Persisted canonical package-lock candidate and frozen-cache path evidence
- Dual clean production emit admission and emitted artifact identity verification
- Dual clean Electron win32-x64 unpacked package identity verification
- Packaged-only E2E receipt sink guarded by run token and absolute export root
- Runtime health, stable API, COI, SharedArrayBuffer and legacy-facade retirement evidence
- Deterministic RGBA8/RGBA16 cross-format save smoke for PNG, PNG16, WebP lossless, JPEG 4:4:4, JXL and PSD RGB8/RGB16
- Packaged-only forced Worker crash, generation advance, pending-job closure and deterministic retry output verification
- Packaged relaunch verification
- Isolated test pointer CAS and byte-exact rollback drill
- Final `PACKAGED_BASELINE_VERIFIED` receipt issuer with a hard promotion ceiling and zero production-pointer mutation

## Deliberately not claimed

- The current checked-in dependency lock is still not the canonical promoted lock.
- The bake environment is not canonical `win32-x64`, so dual packaging and packaged Electron E2E were not executed here.
- No production pointer was changed.
- Native decoder production promotion, PSD Rust WASM production promotion and independent pixel round-trip matrices remain outside this baseline.

## Canonical execution

```powershell
$env:TDT_BUILD_LOCK_REGISTRY = "https://registry.npmjs.org/"
npm run verify:promotion-baseline-00
```

The command must run on the sealed Windows x64 toolchain. Any failure leaves the production pointer untouched and emits append-only failure evidence under `artifacts/promotion-baseline-00/failures/`.
