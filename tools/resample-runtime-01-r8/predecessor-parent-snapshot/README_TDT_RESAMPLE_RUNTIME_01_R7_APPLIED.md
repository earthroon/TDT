# TDT-RESAMPLE-RUNTIME-01-R7 APPLIED

## State

`RESAMPLE_RUNTIME_R7_CANONICAL_LOWPASS_CONVERGENCE_SEALED_AWAITING_R8`

## Applied authority

- Planner: `tdt.ewa.multistage.planner.v2`
- Canonical profile: `tdt.ewa.canonical-r6-support-profile.v1`
- Shared runtime: `tdt.ewa.canonical-lowpass-runtime.r7.v1`
- Lowpass kernel: `tdt.ewa.ellipse.phase-correct-parametric-r6.v1`
- Parameter ABI: `tdt.delta-k-ewa.params.v4`, 96 bytes
- Residual: `tdt.ewa.detail-residual.directional-r7.v1`
- Finalization: `tdt.ewa.export-finalize-rgba8.r7.v1`

Preview and Export now delegate their lowpass stage chain to one role-neutral runtime. Export-only detail reconstruction executes at most once after the terminal `rgba16float` lowpass texture. Residual output and final `rgba8unorm` bytes are not canonical EWA parity surfaces.

## Verification

```bash
npm run verify:resample-runtime-01-r7
```

Expected source-bake state:

```text
172 PASS / 5 DEFERRED / 0 FAIL
```

The five deferred gates require physical WebGPU and packaged Electron evidence. Production Pointer remains unchanged.
