# TDT-ACTIVE-GRAPH-01 Applied

## Seal identity

- Patch ID: `TDT-ACTIVE-GRAPH-01`
- Title: `Admitted Runtime Code Graph / Dead Branch Quarantine / Randomness Zero / Dynamic Asset Closure / Side-Effect Root Identity / Package Baseline Conservation Seal`
- Baked state: `SOURCE_BAKED_AWAITING_PACKAGED_BASELINE`
- Promotion ceiling in this bake: source-authority closure only
- Production pointer mutation: forbidden and observed as `false`

## What this bake changes

1. Introduces an authoritative active runtime graph with explicit roots, nodes, edges, dynamic assets, side-effect roots, and quarantine records.
2. Registers `ActiveGraphService`, `RuntimeAssetAuthority`, `SideEffectRegistry`, and `DeterministicSequenceService` in the canonical runtime module graph.
3. Captures legacy event-listener ownership during script evaluation and callback re-entry, then disposes owned bindings through the runtime lifecycle.
4. Replaces active output-affecting randomness in legacy runtime, UPNG copies, Worker RPC IDs, and Q-wave bitmap IDs with deterministic authorities.
5. Replaces undeclared shader and dynamic asset paths with manifest-bound IDs and digest-bearing runtime asset records.
6. Archives the original legacy `main.js` byte-for-byte under a content-addressed quarantine path while retaining only admitted behavior in the active route.
7. Splits selected legacy responsibilities into explicit helper modules without rewriting the resampling and codec algorithm bodies.
8. Adds source gates, graph generation, asset generation, randomness audit, regression replay, packaged-observation admission, and final source-bake receipts.

## Authoritative source result

- Source gates: `30 PASS / 10 DEFERRED / 0 FAIL`
- Regression replay: `19 / 19 PASS`
- TypeScript changed-surface transpile: `8 / 8 PASS`
- Active roots: `56`
- Active nodes: `270`
- Active edges: `269`
- Declared side-effect roots: `7`
- Dynamic assets: `8`
- Active randomness findings: `0`
- Unresolved dynamic assets: `0`
- Duplicate side-effect IDs: `0`
- Unclassified executable regions: `0`
- Quarantined original bytes: `187246`
- External runtime network requests: `0`

## Deferred gates

The following gates are intentionally deferred because the canonical parent receipt is not yet in state `PACKAGED_BASELINE_VERIFIED`:

- `AG01-01` baseline admission
- `AG01-21` required packaged observation
- `AG01-22` packaged scenario matrix
- `AG01-30` boot parity
- `AG01-31` output parity
- `AG01-32` encoder identity parity
- `AG01-33` final-surface revision parity
- `AG01-34` Worker restart parity
- `AG01-35` Electron relaunch parity
- `AG01-36` stable-error parity

No packaged-runtime, behavioral-parity, or production-promotion PASS is issued by this source bake.

## Preserved regression seals

The source regression suite replays and passes:

- Runtime SSOT legacy admission, global ownership, async reservation, deferred attribution, placeholder quarantine, service ownership, and boot determinism
- R7 exact export API, encoder identity, final surface, and receipt contract
- Export Worker 01 through 07
- Export Promotion 01
- MODJPEG 01
- JXL Codec 01
- PSD Decoder 01

## Validation commands

```powershell
npm run verify:active-graph-01
```

After the parent promotion baseline has produced an authentic `PACKAGED_BASELINE_VERIFIED` receipt on the canonical Windows x64 environment, rerun the same command from that admitted source tree. The runtime observation stage will remain fail-closed until the required receipt and packaged evidence are present.

## Environment boundary

This bake was produced in a Linux host without the canonical Windows Electron package, without installed project `node_modules`, and without a promoted dependency lock receipt. Therefore:

- `vue-tsc` and the full Vite/Electron package build were not claimed.
- Changed TypeScript surfaces were compiler-transpiled independently and passed.
- Existing source gates and codec/worker regressions passed.
- Package-level behavior remains deferred, not inferred.

## Main receipts

- `artifacts/active-graph-01/source-bake/TDT_ACTIVE_GRAPH_01_SOURCE_RECEIPT.json`
- `artifacts/active-graph-01/source-bake/source-gate-report.json`
- `artifacts/active-graph-01/source-bake/regression-suite-receipt.json`
- `artifacts/active-graph-01/source-bake/graph-generation-receipt.json`
- `artifacts/active-graph-01/source-bake/randomness-audit.json`
- `artifacts/active-graph-01/source-bake/typescript-transpile-receipt.json`
- `artifacts/active-graph-01/source-bake/production-pointer-conservation.json`
- `artifacts/active-graph-01/source-bake/runtime-observation-status.json`
