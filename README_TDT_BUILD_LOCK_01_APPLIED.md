# TDT-BUILD-LOCK-01 Applied

## Status

- Source status: `SOURCE_BAKED_UNPROMOTED`
- Evidence state: `INPUT_PROFILE_SEALED`
- Final target: `DEPENDENCY_LOCK_PROMOTED`
- Canonical target: `win32-x64`
- Observed host: `linux-x64`
- Original `package-lock.json` promoted: `false`
- Production Pointer mutation: `false`

## Applied authority

The source tree now contains an executable dependency-lock recovery authority:

1. Canonical dependency and registry input profiles
2. Isolated npm configuration and workspace ownership
3. Registry identity probe with public origin redaction
4. `npm install --package-lock-only` candidate generation
5. Lock v3 root, integrity, resolved, source-protocol, and direct-version verification
6. npm content-addressed cache closure and SRI verification
7. Canonical `win32-x64` offline `npm ci` A/B admission
8. Package-instance, package-content, symlink, and `.bin` graph comparison
9. Lifecycle execution zero and network-attempt evidence
10. Raw `package.json` and `package-lock.json` mutation-zero timeline
11. Expected-old-SHA atomic lock promotion with fsync and readback
12. Build ID and dependency-lock receipt binding

## Observed recovery result

The isolated registry probe returned `HTTP 503 Service Temporarily Unavailable` from the single declared transport registry. No fallback registry was used.

Therefore:

- Candidate Lock: not generated
- Cache Closure: not acquired
- Offline CI A/B: not run
- Atomic Lock Promotion: not run
- Current Root Graph mismatches: 12
- Original package and Lock byte mutation: zero

The public evidence records only a registry-origin digest. Credentials, raw registry URLs, user HOME paths, and isolated workspace paths are not persisted.

## Validation

- BUILD-LOCK-01 static gates: `72/72 PASS`
- BUILD-LOCK-01 policy/runtime tests: `96/96 PASS`
- R7, EW01 through EW07, EP01 through EP03: `PASS`
- Stable Error Registry: `331/331 PASS`
- TypeScript syntax: `71 files PASS`
- Isolated strict TypeScript: `PASS`
- Runtime Manifest determinism: `PASS`
- Worker Manifest determinism: `PASS`

## Production build admission

`npm run build:renderer` stops before Vite execution:

1. Toolchain profile verification passes.
2. Dependency Lock verification fails because the Root Graph is not exact and no promoted BUILD-LOCK-01 receipt exists.

This is the intended fail-closed behavior.

## Canonical next execution

Run the recovery command on an actual Windows x64 host after the declared registry becomes available:

```powershell
$env:TDT_BUILD_LOCK_REGISTRY = '<declared registry origin>'
npm run build-lock:recover
```

Only after Candidate Graph, frozen Cache Closure, offline CI A/B, reproducibility, and mutation-zero evidence pass may the explicit CAS command be executed with `TDT_BUILD_LOCK_CANDIDATE`.
