# TDT-RUNTIME-SSOT-01-R1-R5 Applied

## Deferred Global Publication Attribution / Pending Ownership Claim / Boot Receipt Evidence Seal

- Base patch: `TDT-RUNTIME-SSOT-01-R1-R4`
- Revision: `R5`
- Status: `SOURCE_BAKED_UNPROMOTED`

## Reproduced failure

```text
E_LEGACY_GLOBAL_WRITE_UNDECLARED
Legacy module dadum.legacy.engine-passes-brushedMetalPass.js published undeclared globals
```

Observed globals:

```text
Buffer
PureRenderer
deltaEGain
emotionCanvases
falloffRadius
generateDeltaKQMap
getDeltaKThreshold
initWebP
initWebP_initialized
toBuffer
```

The `brushedMetalPass.js` source publishes only its own pass API. All ten observed names are uniquely declared by `dadum.legacy.main.js`, which is loaded ten entries earlier.

## Root cause

The previous audit used a before/after `window` key snapshot for each root script. `main.js` registered DOM-ready work and asynchronous initialization, then completed root-script activation. Those delayed tasks published globals while `brushedMetalPass.js` occupied the next audit window. The snapshot therefore reported the observer interval instead of the actual manifest owner.

Adding the ten names to `brushedMetalPass.js` would hide the symptom while corrupting ownership truth.

## Applied authority rule

A new global observed during another module may be attributed to an earlier module only when all conditions hold:

1. The manifest assigns the global to exactly one root owner.
2. That owner completed activation earlier in the deterministic load order.
3. The global was still absent when the owner completed activation.
4. The adapter recorded a pending deferred-publication claim at that exact moment.
5. The pending claim matches the unique owner identity and load index.
6. The claim is consumed once when the global appears.

Any missing owner, multiple owners, future owner, absent claim, mismatched claim, or reused claim still raises `E_LEGACY_GLOBAL_WRITE_UNDECLARED`.

## Applied changes

1. Added deterministic global ownership index construction from per-module `declaredGlobalWrites`.
2. Added pending deferred-publication claims for uniquely owned globals absent when their owner finishes activation.
3. Added one-shot claim consumption when delayed globals appear in a later audit window.
4. Added `I_LEGACY_DEFERRED_GLOBAL_ATTRIBUTED` diagnostic evidence.
5. Extended `LegacyActivationResult` with deferred publication records.
6. Added deferred publication evidence to the deterministic Boot Receipt.
7. Added `GATE-R1-R5-DEFERRED-GLOBAL-ATTRIBUTION`.
8. Added the R5 gate to `verify:renderer` and the source-bake gate chain.
9. Kept the global registry diagnostic-only. It does not grant admission.
10. Kept `brushedMetalPass.js` ownership narrow. None of the ten `main.js` globals were added to it.

## Expected runtime result

Instead of failing the brushed-metal module, diagnostics may record:

```text
I_LEGACY_DEFERRED_GLOBAL_ATTRIBUTED
Deferred legacy globals observed during dadum.legacy.engine-passes-brushedMetalPass.js were attributed to their unique prior owners
```

The Boot Receipt records each item with:

```text
globalName
ownerModuleId
observedDuringModuleId
```

A genuinely undeclared write remains fail-closed.

## Passed source gates

- `GATE-R1-01` Vite entry closure
- `GATE-R1-02` Production source serving closure
- `GATE-R1-06` Capability ownership
- `GATE-R1-07` Service ownership
- `GATE-R1-08` Pinia static serializability
- `GATE-R1-11` Legacy admission and syntax
- `GATE-R1-R3-GLOBAL-OWNERSHIP` Unicode identity and module-local ownership
- `GATE-R1-R4-ASYNC-GLOBAL-RESERVATION` ICMS synchronous identity reservation
- `GATE-R1-R5-DEFERRED-GLOBAL-ATTRIBUTION` Pending ownership claim and one-shot attribution
- `GATE-R1-R2-DIAG` Diagnostic single-emission
- `GATE-R1-15` Runtime resource isolation
- `GATE-R1-17` Final export authority
- `GATE-R1-20` Deterministic receipt parity 100/100
- TypeScript parser syntax 48 files
- Stable error registry 29/29

## Source verification identity

```text
Build ID: 07c7504ffcabc785727e8474
Receipt parity: 975e0d29652991182add98ae17ccf9d10cf1445b5d407e9a96c55a15c06c8620
```

## Promotion status

The source patch is not promoted as a final production build in this container. `package-lock.json` still lacks the Vue, Pinia, Vite and typecheck dependency graph, and the attempted lock refresh could not complete in the available environment. Run the following in the local repository:

```powershell
npm install
npm run typecheck:renderer
npm run verify:renderer
npm run start
```
