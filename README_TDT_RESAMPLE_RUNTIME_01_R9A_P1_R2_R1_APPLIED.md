# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1 Applied

## Patch identity

```text
TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1

Lost Operation Terminal Rejection /
Preview Frame Deferred Failure Propagation /
Export Terminal Map Hook Binding /
Recovery Failure Event Before Fatal Throw /
Exact Cycle Event Correlation Seal
```

## Applied implementation

- Preview public requests receive an exact frame ticket and await that ticket's terminal state.
- Awaited public Preview failures reject. Detached subscription failures settle into receipt evidence without an unhandled rejection.
- Preview DEVICE_LOST receipt publication precedes public rejection and holder terminal notification.
- Export controlled loss is injected by the actual `GPUBuffer.mapAsync(READ)` owner while the map promise is unresolved.
- The Export loss barrier executes before host save begin, success receipt publication, or blob registration.
- Main creates a canonical cycle binding from its expected cycle, sender identity, operation identity, hook identity, exact device epoch, device identity, adapter identity, and lineage digests.
- GPU recovery lost, recovered, and failed events carry the exact active cycle binding.
- Recovery failure dispatch occurs synchronously before the fatal transition.
- The recovery holder completes a cycle only after both exact recovery correlation and lost-operation terminal rejection are present.
- Qualification requires Preview, Export, Preview rejection and writes raw terminal and correlation child evidence.
- The R2-R1 packaged finalizer replays raw rows and rejects summary-only evidence.

## Source verification

```text
Parent R2 regression gate: 360 SOURCE PASS / 420 PACKAGED PENDING / 0 FAIL
R2-R1 child source catalog: 86 SOURCE gates
R2-R1 packaged physical catalog: 26 gates, pending
Focused TypeScript semantic compile: PASS
R2 TypeScript syntax parser: PASS
JavaScript module syntax: PASS
```

A full Vite/Electron production build was not executed in this bake environment because the configured dependency registry did not provide required packages including `@napi-rs/cli`. This source bake therefore does not claim the Vite production-build completion condition.

## Physical status

```text
controlled device-loss cycles executed: 0
packaged physical PASS carried forward: 0
state: AWAITING_THREE_CYCLE_PACKAGED_PHYSICAL_REPLAY
```

No physical GPU result is inferred from source gates.

## Deliberate scope boundary

The following remain separate HOLD patches and are not claimed by this bake:

- P1-R2-R2 Controlled Loss Permit Full-Field Integrity
- P1-R2-R3 Explicit Canonical Pipeline Rebuild
- P1-R2-R4 Raw Lifecycle Finalizer and host output directory closure
