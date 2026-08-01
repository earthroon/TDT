# TDT-RUNTIME-SSOT-01-R1-R6 Applied

## Scope

Legacy Pipeline Placeholder Quarantine / Runtime Service Authority Separation / Service Receipt Evidence Seal

## Reproduced failure

```text
E_RUNTIME_PLACEHOLDER_REJECTED
Legacy placeholder pipeline cannot become authoritative
```

`pipeline_bind_guard.js` intentionally creates `window.pipeline.__dk_placeholder = true` so legacy scripts can read a stable namespace before a real pipeline exists. The R1 PipelineService incorrectly treated the mere presence of that compatibility namespace as an attempt to adopt it as the new authority.

## Applied correction

- The Vue/Vite Runtime PipelineService remains the sole authoritative pipeline service.
- A legacy placeholder present at boot is classified as `PLACEHOLDER_QUARANTINED`, not adopted and not promoted.
- A non-placeholder legacy pipeline object is classified as `LEGACY_NAMESPACE_QUARANTINED` and remains outside the new authority.
- `publishFinal()` still rejects a placeholder object, preserving the original fail-closed rule at the actual authority boundary.
- Runtime services may publish deterministic `receiptEvidence()`.
- The Boot Receipt now records `placeholderAdopted: false` and the legacy namespace disposition.

## Expected diagnostic

```text
I_RUNTIME_LEGACY_PLACEHOLDER_QUARANTINED
Legacy placeholder pipeline was retained as a non-authoritative compatibility namespace
```

The prior boot-fatal `E_RUNTIME_PLACEHOLDER_REJECTED` must not occur merely because the compatibility guard exists.

## Gate

```text
PASS GATE-R1-R6-PLACEHOLDER-QUARANTINE
```

## Promotion state

Source-baked only. Vue semantic typecheck, Vite production build and Electron smoke remain local promotion gates.

## Static verification result

```text
PASS GATE-R1-R6-PLACEHOLDER-QUARANTINE
PASS GATE-R1-20 deterministic receipt parity 100/100
PASS TypeScript syntax 48 files
PASS stable error registry 29/29
```

Final promotion remains unissued until local `vue-tsc`, Vite build, and Electron smoke pass.
