# TDT-BUILD-LOCK-01-R2 Applied

## State

```text
BUILD_LOCK_R2_EXACT_ROOT_GRAPH_AND_PRODUCTION_ADMISSION_HARNESS_SOURCE_SEALED_AWAITING_CANONICAL_WIN32_X64

420 SOURCE PASS
580 WIN32 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL
```

## Source bake truth

- `package-lock.json` was preserved byte-for-byte.
- The current 12 root graph mismatches remain visible and fail-closed.
- Candidate lock generation was not executed.
- Offline npm ci A/B was not executed.
- Native MSVC/Rust/WASM builds were not executed.
- Production Electron build admission was not issued.
- Production and Local Activation pointers were not mutated.

## Implemented authority

- exact root dependency graph audit
- isolated candidate lock recovery command
- canonical npm config and environment projection
- frozen registry cache closure contract
- Win32-x64 offline npm ci A/B runner
- explicit lifecycle replay plan and runner
- install graph and content digest comparison
- MSVC, Windows SDK, Rust, WASM toolchain closure
- native addon and WASM A/B byte parity
- typecheck, Vite, worker, ASAR, win-unpacked parity contract
- package-lock expected-old SHA CAS writer
- post-promotion replay verifier
- raw-child production admission finalizer

## Product wiring

- `verify-dependency-lock.mjs` consumes the R2 final admission receipt.
- `verify-toolchain-profile.mjs` records the R2 native toolchain child receipt.
- R9A physical execution requires R2 final production admission.
- R10A rebuild input requires the R2 final receipt digest.
- R14A signed package manifest includes the R2 build admission digest.
- General renderer and unpacked production builds remain blocked until R2 Win32 admission exists.
- The R2 A/B runner uses lower-level build commands and does not call the admission-blocked general build wrapper.

## Replay requirement

The historical Build Lock 01 evidence is superseded. R9A physical through R14A distribution evidence must be replayed after R2 final Win32 admission. R1A through R8A algorithm source is not claimed as changed by this patch.

## Verification

```text
BLR2 source gates            420 PASS / 0 FAIL
BLR2 Win32 gates             580 PENDING
Negative controls             40 PASS
JavaScript parse              37 / 37 PASS
Active Graph                  30 PASS / 10 DEFERRED
Active Required JavaScript   243 / 243 PASS
```

Fail-closed commands:

```text
verify:build-lock-01-r2:win32
→ E_BUILD_LOCK_R2_WIN32_RECEIPT_MISSING

verify:dependency-lock
→ rootExact=false, r2Admission=false
```

## Change surface

```text
97 changed files
81 added
16 modified
0 deleted
```
