# TDT-RUNTIME-SSOT-01-R1-R4 Applied

## Async Global Reservation / Temporal Ownership Attribution / Legacy Source Digest Closure

- Base patch: `TDT-RUNTIME-SSOT-01-R1-R3`
- Revision: `R4`
- Status: `SOURCE_BAKED_UNPROMOTED`

## Reproduced failure

The runtime reported:

```text
E_LEGACY_GLOBAL_WRITE_UNDECLARED
Legacy module dadum.legacy.patches-icc_default_loader.js published undeclared globals
undeclared: icmsLittle
```

`patches/icc_default_loader.js` does not create `window.icmsLittle`. The property was created by an asynchronous dynamic import started by the previously loaded `main.js`. The import completed while the next root script was inside its before/after global snapshot window, so the temporal audit charged the write to the wrong module.

## Root cause

The previous ICMS binding created the global only after `await import(...)` completed:

```text
main.js starts dynamic import
-> main.js load event completes
-> icc_default_loader.js snapshot starts
-> dynamic import completes
-> window.icmsLittle is created
-> icc_default_loader.js snapshot ends
-> false ownership failure
```

The runtime manifest already assigned `icmsLittle` to `dadum.legacy.main.js`. The defect was late publication, not missing ownership.

A second receipt defect was found during repair: the generated runtime manifest hashed `app/src` but omitted `app/legacy-runtime`. Therefore a legacy engine source change could leave the Build ID unchanged.

## Applied changes

1. `main.js` now reserves `window.icmsLittle` synchronously before any dynamic import.
2. The asynchronous bridge import mutates the reserved runtime shell instead of publishing a new global.
3. The shell exposes stable `status`, `ready`, `get`, `processRGBA`, `processImageData`, and `error` lifecycle fields as they become available.
4. `icc_default_loader.js` remains owner of `formatSel` only. No false `icmsLittle` permission was added.
5. Added `GATE-R1-R4-ASYNC-GLOBAL-RESERVATION`.
6. The gate confirms that reservation occurs before the dynamic import and that ownership remains with `dadum.legacy.main.js`.
7. The runtime source digest now includes both `app/src` and `app/legacy-runtime`.
8. Runtime source traversal now uses deterministic UTF-16 code-unit ordering instead of locale-dependent collation.
9. `verify:renderer` and source-bake verification include the new R4 gate.

## Authority decision

```text
dadum.legacy.main.js
-> owns window.icmsLittle
-> reserves identity synchronously
-> mutates the owned shell after async activation

patches/icc_default_loader.js
-> does not own icmsLittle
-> cannot receive a compatibility exception
```

## Expected runtime result

- `dadum.legacy.patches-icc_default_loader.js` no longer fails on `icmsLittle`.
- `window.icmsLittle` exists before the bridge import settles.
- Consumers may inspect `window.icmsLittle.status` or await `window.icmsLittle.ready`.
- A genuinely undeclared global still fails closed.
- Build ID and source graph digest change when legacy engine source changes.

## Passed source gates

- `GATE-R1-01` Vite entry closure
- `GATE-R1-02` Production source serving closure
- `GATE-R1-06` Capability ownership
- `GATE-R1-07` Service ownership
- `GATE-R1-08` Pinia static serializability
- `GATE-R1-11` Legacy admission and syntax
- `GATE-R1-R3-GLOBAL-OWNERSHIP` Unicode identity and module-local ownership
- `GATE-R1-R4-ASYNC-GLOBAL-RESERVATION` Synchronous identity reservation
- `GATE-R1-R2-DIAG` Diagnostic single-emission
- `GATE-R1-15` Runtime resource isolation
- `GATE-R1-17` Final export authority
- `GATE-R1-20` Deterministic receipt parity 100/100
- TypeScript parser syntax 48 files
- Stable error registry 29/29

## Promotion status

`vue-tsc`, Vite production bundle, and Electron smoke are not promoted in this container because installed npm dependencies are unavailable and the package lock remains inconsistent with the Vue/Vite dependency graph.
