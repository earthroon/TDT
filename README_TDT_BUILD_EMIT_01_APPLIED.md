# TDT-BUILD-EMIT-01 Applied

## Status

- Source state: `SOURCE_BAKED_UNPROMOTED`
- Evidence state: `BLOCKED_LOCK_NOT_PROMOTED`
- Final production promotion issued: `false`
- Canonical target: `win32-x64`
- Observed host: non-canonical Linux x64
- Build Lock state: `INPUT_PROFILE_SEALED`

The BUILD-EMIT-01 source authority and fail-closed verification tools are applied. A production Vite build, emitted Worker/WASM byte verification, packaged Electron route verification, and Build A/B parity were not executed because BUILD-LOCK-01 has not reached `DEPENDENCY_LOCK_PROMOTED` and this host is not the canonical Windows x64 build host.

## Applied authority chain

```text
DEPENDENCY_LOCK_PROMOTED
→ Canonical Build Input Manifest
→ Clean Build A / Clean Build B
→ Vite Rollup Entry Graph
→ Source-to-Emitted Worker Mapping
→ Worker JS/WASM/ICC/Child-Worker Closure
→ Legacy Static Admission
→ Artifact Ownership and Orphan Gate
→ Static Route Manifest
→ Synthetic and Electron COI Route Parity
→ Build A/B Byte Parity
→ Emitted Artifact Identity Receipt
```

The current execution stops before Clean Build A because the dependency lock promotion precondition is false.

## Key implementation changes

### Vite entry identity

Worker entry identity is derived from Vite/Rollup metadata such as `facadeModuleId`, `moduleIds`, `imports`, `dynamicImports`, and `referencedFiles`. Worker ID string search is not accepted as production entry evidence.

### Worker closure v2

The closure model records these edge classes:

- `static-import`
- `dynamic-import`
- `new-url`
- `locate-file`
- `pthread-child`
- `runtime-fetch`
- `manifest-reference`

Production closure verification is designed to bind emitted JavaScript, shared chunks, WASM, ICC, and child Worker artifacts by emitted SHA-256.

### Legacy static admission

The former whole-directory raw copy policy was replaced with an explicit recursive admission manifest.

- Full legacy file population: 1,170
- Admitted raw static closure: 214
- Non-admitted files are not emitted under `/legacy/**`
- Worker-bundle-owned sources are excluded from raw static ownership unless they are explicit bootstrap seeds

### Artifact ownership

Each executable artifact must have exactly one ownership mode:

- `vite-bundle`
- `vite-emitted-asset`
- `legacy-raw-admitted`

Bundle/raw duplication, orphan executable artifacts, route collisions, and output path escapes fail closed.

### Static COI server

The Electron static server was extracted to `app/electron/static-coi-server.mjs` and is shared by production and verification code. It applies:

- COOP: `same-origin`
- COEP: `require-corp`
- CORP: `same-origin`
- Cache-Control: `no-store`
- WASM MIME: `application/wasm`
- ICC MIME: `application/vnd.iccprofile`

Encoded path traversal is rejected before WHATWG URL normalization. Synthetic and Electron server error responses use byte-identical 403/404 bodies and the same COI headers.

### Build input identity

Build Input Identity includes actual build authority sources only:

- `package.json`
- `package-lock.json`
- Vite, Electron, Preload, and TypeScript configuration
- `app/**`
- `tools/**`
- `native/**`

Generated evidence, README files, patches, distribution outputs, and installed dependencies do not perturb the Build Input Digest.

## Verification performed

- BUILD-EMIT-01 source gates: `84/84 PASS`
- BUILD-EMIT-01 policy and synthetic runtime tests: `120/120 PASS`
- Stable Error Registry: `389/389 PASS`
- TypeScript syntax scan: `72 files PASS`
- Isolated strict TypeScript closure: `PASS`
- R7 and EW01 through EW07 parent gates: `PASS`
- EP01 through EP03 parent gates: `PASS`
- BUILD-LOCK-01 parent gate: `72/72 PASS`
- Runtime and Worker source manifest repeat generation: byte stable
- Source, `package.json`, and `package-lock.json` mutation zero: `PASS`

## Production build attempt

`npm run build:renderer` was invoked once. It stopped before Vite:

```text
Toolchain profile: PASS
Dependency lock root graph: FAIL
BUILD-LOCK-01 promotion receipt: not promoted
Exit code: 1
```

Therefore these claims are deliberately not made:

- Production Vite build completed
- Emitted Worker/WASM/ICC bytes verified
- Electron static routes verified against emitted files
- Build A/B output parity verified
- Emitted Artifact Identity promoted

## Promotion blockers

- `E_BUILD_EMIT_LOCK_NOT_PROMOTED`
- `E_BUILD_EMIT_NONCANONICAL_HOST`

The next executable step is to complete BUILD-LOCK-01 on the canonical Windows x64 host, then rerun `npm run build-emit:run` with the frozen npm cache input.
