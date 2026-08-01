# TDT-EXPORT-PROMOTION-02 Applied

## Status

- Patch: `TDT-EXPORT-PROMOTION-02`
- State: `SOURCE_BAKED_UNPROMOTED`
- Promotion ceiling implemented: `PACKAGED_ARTIFACT_VERIFIED`
- Actual candidate state: `SOURCE_BAKED_UNPROMOTED`
- Production pointer mutation: `false`

EP02 adds the build and package authority required to turn the EP01 source candidate into a reproducible Electron package. It does not claim that the current container produced or promoted that package.

## Source candidate identity

- Build ID: `9589f94c2952ceaf55425a60`
- Build Authority Digest: `c0a57d3fc93e19921e52b15116b94180113bf0e9c491f9a035e8f3423b8dac1b`
- Source Worker Manifest Digest: `5907e0b385aad556076bf82b49276936d61387161145a7fda2aac38e9f1c8a4d`
- Toolchain Profile Digest: `267e6960598f8141f3b5c896528c6ae89d2fbb7356678d958ad1c63fd76e26dd`
- Source Bake Seal: see `artifacts/runtime/TDT_EXPORT_PROMOTION_02_FIX_RECEIPT.json`

The Build ID now includes application source, legacy runtime source, `package.json`, `package-lock.json`, Vite and Electron entry files, the Toolchain Profile, and the EP02 build-authority tools. Build-rule changes can no longer preserve the same Build ID.

## Implemented authority

### Canonical toolchain profile

Added:

- `tools/toolchain-profile.json`
- `tools/dependency-policy-exceptions.json`
- `tools/verify-toolchain-profile.mjs`

The selected production profile is:

- Node `22.16.0`
- npm `10.9.2`
- target `win32-x64`
- Electron `29.0.0`
- electron-builder `24.13.3`
- Vite `8.1.5`
- TypeScript `5.9.3`
- vue-tsc `3.2.2`
- build-network policy: disabled

### Exact direct dependency policy

All direct dependency declarations in `package.json` now use exact versions. The package declares:

- `packageManager: npm@10.9.2`
- exact Node and npm engines
- `exact-direct-version-v1`

The lock verifier checks both dependency groups, exact root equality, resolved URLs, and integrity metadata. It fails before Vite is started when the Lock Root is inconsistent.

### Reproducible renderer build authority

The production renderer sequence is now:

```text
Toolchain verification
→ Dependency Lock verification
→ Source Worker Manifest
→ Source Runtime Manifest
→ Vite production build
→ Emitted Worker/WASM Manifest
→ Production Runtime Manifest
→ Emitted Artifact verification
→ Static COI Route probe
```

The source Runtime Manifest remains:

```text
artifactVerificationMode = source-graph-only
promotable = false
```

Only the post-build manifest generator may issue:

```text
artifactVerificationMode = emitted-artifact-sha256
```

### Emitted Worker and WASM identity

Added:

- `tools/generate-emitted-artifact-manifest.mjs`
- `tools/verify-emitted-artifact-manifest.mjs`
- `tools/generate-production-runtime-manifest.mjs`

The generator maps each of the five canonical workers to its emitted entry, imported chunks, WASM, ICC, and binary assets. Each worker receives an emitted artifact-set digest, and the production Runtime Manifest binds both the emitted Worker Manifest and the Vite Entry Manifest.

### Static COI route probe

Added `tools/verify-static-coi-routes.mjs`.

It probes the built renderer over an actual HTTP server and requires:

- COOP `same-origin`
- COEP `require-corp`
- CORP `same-origin`
- correct Worker JavaScript MIME
- `application/wasm`
- `application/vnd.iccprofile`
- all emitted Worker closure URLs to return 200

### Electron package-content authority

The electron-builder package allowlist is narrowed to:

- `dist/renderer/**/*`
- `electron.mjs`
- `preload.cjs`
- `package.json`
- native decoder entry declarations
- one release `.node` addon

Removed:

- broad `native/**/*`
- broad Legacy WASM, vendor, encoder, and worker `asarUnpack`
- implicit native dependency rebuild during packaging

Only the release `.node` addon is unpacked.

Added:

- `tools/verify-native-addon-package.mjs`
- `tools/generate-package-content-manifest.mjs`
- `tools/verify-package-content-manifest.mjs`

The Native Addon gate requires exactly one non-debug PE x64 `.node` file. The Package Content Manifest binds `app.asar` and `app.asar.unpacked` to a Package Content ID and rejects Rust source, target trees, tests, maps, patches, and build intermediates.

## Source gates

- EP02 static gates: `60/60 PASS`
- EP01 parent gates: `54/54 PASS`
- EW01 through EW07 parent gates: PASS
- R7 Export Truth gates: PASS
- Stable error registry: `266/266`
- TypeScript syntax: PASS
- Isolated strict TypeScript closure: PASS
- Build ID repeated generation: deterministic
- Worker Source Manifest repeated generation: deterministic

## Current blockers

### Dependency Lock

`package-lock.json` still reflects the pre-Vue/Vite root graph. A canonical refresh was attempted with scripts disabled and bounded fetch retries. The registry returned:

```text
HTTP 503 Service Temporarily Unavailable
```

The Lock was not hand-edited. Current lock status is correctly reported as:

```text
rootGraphExact = false
directVersionsExact = true
status = BLOCKED
```

### Production renderer build

`npm run build:renderer` stops at `verify:dependency-lock` before Vite. This is the intended Fail-Closed behavior. No source-only manifest can masquerade as a production emitted-artifact manifest.

### Native addon and Electron package

No release `.node` decoder addon exists in this source candidate. Consequently:

- Native Addon verification is blocked.
- Electron unpacked package verification is blocked.
- Package Content ID is not issued.
- `PACKAGED_ARTIFACT_VERIFIED` is not issued.

The earlier dav1d/native decoder build problem remains separate from EP02's package authority.

## Local closure sequence

Run from the project root on the selected Windows x64 toolchain:

```powershell
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:dependency-lock
npm run build:native
npm run native:status
npm run build:renderer
npm run build:app:unpacked
```

The candidate must remain unpromoted if any command changes `package-lock.json`, produces more than one `.node` addon, emits a debug addon, lacks a Worker/WASM asset, or produces different Renderer Build IDs across two clean runs.

## Promotion truth

EP02 source authority is implemented. The current candidate has not passed Dependency Lock, production Vite output, Native Addon, Electron package-content, or reproducible two-build verification. The Production Pointer remains unchanged and `PRODUCTION_PROMOTED` is not issued.
