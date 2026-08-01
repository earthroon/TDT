# TDT-RESAMPLE-RUNTIME-01-R8 Applied

State: `RESAMPLE_RUNTIME_R8_CONSERVATION_AND_ZERO_DEGRADATION_SEALED_AWAITING_R9`

## Applied authority

- `tdt.ewa.support-envelope.r8.v1`
- `tdt.ewa.multistage.planner.v3`
- `tdt.ewa.canonical-unclipped-r6-profile.r8.v1`
- `tdt.ewa.source-prepare.r8.v1`
- `tdt.ewa.surface.linear-premultiplied.r8.v1`
- `tdt.ewa.zero-silent-degradation.r8.v1`
- `tdt.ewa.wgsl-generator.r8.v1`
- `tdt.ewa.generated-manifest.r8.v1`
- `tdt.ewa.detail-residual.directional-r8.v1`
- `tdt.ewa.export-finalize-rgba8.r8.v1`

## Sealed behavior

- Major and minor support are proven before dispatch. Runtime radius clipping is forbidden.
- Adaptive policy footprint authority is coupled to its policy digest and anisotropy authority.
- Disabled policy uses one explicitly initialized `rgba16float` tuple `(0, 1, 1, 1)`.
- Product, validation, and direct reference shaders emit a deterministic fault sentinel instead of center fallback.
- Canonical lowpass input is `rgba16float`, linear, premultiplied RGBA.
- sRGB and alpha conversion is GPU-only and uses explicit input and output semantics.
- Border fetch clamping does not alter logical sample distance or deduplicate logical taps.
- Constant fields, alpha, zero-alpha RGB, and residual alpha are covered by deterministic source gates.
- Preview and Export retain the R7 shared lowpass path while using the R8 planner and conservation receipts.
- CPU pixel conversion, Canvas, WebGL, intermediate readback, silent sigma capping, and Production Pointer mutation remain forbidden.

## Source gate

```text
250 PASS
6 DEFERRED
0 FAIL
```

Deferred evidence is limited to physical WebGPU compilation/parity/counters, ULP validation, timestamp-memory-device-loss evidence, and packaged Electron identity.

## Verify

```bash
npm run verify:resample-runtime-01-r8
```

## Next authority

`TDT-RESAMPLE-RUNTIME-01-R9`

Physical GPU Oracle·Parity / Validation Counter Readback / Timestamp·Residency Plateau / Device-Loss Recovery / Packaged Electron Execution Seal
