# TDT-RUNTIME-SSOT-01-R1-R2 Applied

## Legacy Transitive Global Ownership / Diagnostic Single-Emission Fix

- Base patch: `TDT-RUNTIME-SSOT-01-R1`
- Revision: `R2`
- Status: `SOURCE_BAKED_UNPROMOTED`

## Reproduced failure

`dadum.legacy.main.js` statically imports `/legacy/core/index.js`. The imported module publishes `window.ΔKCore`, but the root legacy manifest entry did not declare that transitive global write. The runtime therefore failed closed with `E_LEGACY_GLOBAL_WRITE_UNDECLARED`.

The same `StableRuntimeError` was recorded independently by the legacy adapter, runtime module activation boundary, and outer bootstrap boundary, producing three visually identical diagnostics.

## Applied changes

1. Added `ΔKCore` to `dadum.legacy.main.js.declaredGlobalWrites`.
2. Marked the entry source as `boot-manifest-v1+static-import-graph`.
3. Added `DiagnosticsService.errorOnce()` with a stable code/message/detail fingerprint.
4. Routed legacy, module, and outer bootstrap propagated errors through `errorOnce()`.
5. Added regression gates for the `ΔKCore` declaration and diagnostic single emission.

## Authority decision

`ΔKCore` is charged to the `main.js` root module because it is created during evaluation of the root's static ES module graph. It is not added to the process-wide global registry, because that would erase module ownership.

## Expected runtime result

- `dadum.legacy.main.js` no longer fails on `ΔKCore`.
- A genuinely undeclared global still fails closed.
- One propagated stable error produces one diagnostic record.
- Boot may continue to reveal the next real undeclared global, if one exists; no wildcard admission was introduced.

## Passed source gates

- `GATE-R1-11` Legacy admission and syntax
- `GATE-R1-R2-DIAG` Diagnostic error single-emission
- `GATE-R1-01/02` Vite entry and production serving closure
- `GATE-R1-06/07/15/17` Runtime ownership and export authority
- `GATE-R1-20` Deterministic receipt parity 100/100
- TypeScript parser syntax
- Stable error registry

## Promotion status

This container does not contain the installed Vue/Vite dependency graph. `vue-tsc`, Vite production build, and Electron smoke remain local promotion gates.
