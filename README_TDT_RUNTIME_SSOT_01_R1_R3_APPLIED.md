# TDT-RUNTIME-SSOT-01-R1-R3 Applied

## Unicode Global Identity / Static Module Graph Ownership / Inventory-Only Global Registry Fix

- Base patch: `TDT-RUNTIME-SSOT-01-R1-R2`
- Revision: `R3`
- Status: `SOURCE_BAKED_UNPROMOTED`

## Reproduced failure

`dadum.legacy.index-inline-01.mjs` publishes:

```js
window.__ΔK_webpLazyInit = ...
```

The legacy audit generator used an ASCII-only JavaScript identifier pattern. It truncated the Unicode identifier at the Greek delta character and generated the false declaration `__`. Runtime evaluation therefore observed the exact global `__ΔK_webpLazyInit` and failed closed with `E_LEGACY_GLOBAL_WRITE_UNDECLARED`.

## Root cause

The old generator recognized only:

```text
[A-Za-z_$][\w$]*
```

That is not the ECMAScript identifier grammar. It cannot represent identifiers containing `Δ`, Korean letters, or other valid Unicode identifier characters.

A second ownership defect was confirmed during the repair: `legacyRuntimeManifest.globalRegistry` was passed into every module's admission list. The registry was intended as migration inventory, but this made every inventoried global effectively writable by every module.

## Applied changes

1. Replaced ASCII-only identifier matching with Unicode property escapes using `\p{ID_Start}` and `\p{ID_Continue}`.
2. Added exact ownership for `__ΔK_webpLazyInit` to `dadum.legacy.index-inline-01.mjs`.
3. Removed the truncated false declaration `__` from that module.
4. Added recursive static ES module graph collection so globals emitted by static imports are charged to the root module that activates the graph.
5. Preserved `ΔKCore` ownership through automatic static graph analysis instead of a manual one-off exception.
6. Marked `globalRegistryPolicy` as `inventory-only`.
7. Removed `globalRegistry` from runtime admission. `assertDeclaredNewGlobals()` now receives only `record.declaredGlobalWrites`.
8. Added `globalWriteScope` metadata: `root-script` or `static-module-graph`.
9. Added `GATE-R1-R3-GLOBAL-OWNERSHIP` regression verification.
10. Replaced locale-dependent collation with deterministic default UTF-16 sorting for manifest and receipt stability.

## Authority decision

```text
globalRegistry
→ diagnostic inventory only
→ never grants write permission

record.declaredGlobalWrites
→ sole module admission authority

module static import graph
→ charged to the activating root module
```

## Expected runtime result

- `dadum.legacy.index-inline-01.mjs` no longer fails on `__ΔK_webpLazyInit`.
- The exact Unicode name is shown in the module declaration.
- The false prefix `__` is absent from the module declaration.
- A module cannot publish another module's global merely because the name exists in the repository-wide inventory.
- A genuinely undeclared global still fails closed.
- Boot may continue to reveal the next real ownership defect. No wildcard admission was introduced.

## Passed source gates

- `GATE-R1-01` Vite entry closure
- `GATE-R1-02` Production source serving closure
- `GATE-R1-06` Capability ownership
- `GATE-R1-07` Service ownership
- `GATE-R1-08` Pinia static serializability
- `GATE-R1-11` Legacy admission, Unicode exactness, static graph ownership
- `GATE-R1-R3-GLOBAL-OWNERSHIP` Inventory-only registry and module-local admission
- `GATE-R1-R2-DIAG` Diagnostic single-emission
- `GATE-R1-15` Runtime resource isolation
- `GATE-R1-17` Final export authority
- `GATE-R1-20` Deterministic receipt parity 100/100
- TypeScript parser syntax 48 files
- Stable error registry 29/29

## Promotion status

`vue-tsc`, Vite production bundle, and Electron smoke are not promoted in this container because installed npm dependencies are unavailable and the lock file does not yet contain the Vue/Vite dependency graph.
