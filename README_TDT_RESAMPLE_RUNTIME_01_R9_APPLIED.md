# TDT-RESAMPLE-RUNTIME-01-R9 Applied

## State

```text
RESAMPLE_RUNTIME_R9_PHYSICAL_HARNESS_SOURCE_BAKED_AWAITING_WINDOWS_EXECUTION

110 SOURCE PASS
187 PHYSICAL PENDING
0 FAIL
```

R9 adds the physical qualification harness and its fail-closed evidence state machine. It does **not** claim that a physical GPU, Windows package, or packaged Electron execution was completed in this source bake.

## Frozen predecessor

- Parent: `TDT-RESAMPLE-RUNTIME-01-R8`
- R8 generated R4 product shader remains frozen.
- R8 generated R6 product shader remains frozen.
- R8 direct reference shader remains frozen.
- R8 planner v3, ABI v4, axial field, alpha, border, residual ordering, and Production Pointer remain unchanged.
- Isolated predecessor regression: R1A through R8 PASS.

## Added qualification surfaces

- Windows x64 packaged-Electron qualification partition
- packaged-only Electron guard and source-tree rejection
- external evidence root, exclusive run lock, interruption marker, and cleanup ledger
- package digest before/after execution
- hardware WebGPU adapter and timestamp-query admission checks
- R8 product R4/R6, direct reference, validation, source-prepare, residual, and finalization compile reports
- raw `rgba16float` binary16 product/reference comparison
- independent binary64 oracle with binary16 ULP comparison
- 32-word validation counter readback contract
- R4 and R6 paired GPU timestamp suites
- resource ledger and renderer/GPU-process memory plateau capture
- three-cycle controlled device-loss and stale-epoch rejection suite
- packaged Preview/Export shared lowpass identity execution
- physical evidence schemas, child artifact digests, finalizer, and R10 handoff boundary

## Deterministic fixtures

```text
fixture count  24
fixture digest 310aa66bb645d67f9379602d7ce1ecabfbabbd474b0b7d303d4c0546f207392a
```

## Source verification

```bash
npm run verify:resample-runtime-01-r9
```

Expected source-bake result:

```text
R9 parent freeze 17/17
R9 source gates 110 PASS / 0 FAIL
PASS R9 isolated R8 predecessor regression including R1A-R7 1/1
TDT-RESAMPLE-RUNTIME-01-R9 110 SOURCE PASS / 187 PHYSICAL PENDING / 0 FAIL
```

## Windows physical execution

The following sequence must be run on the intended Windows x64 hardware package. The same run ID must be retained for package build and launch.

```powershell
$env:DADUM_R9_RUN_ID = "r9-physical-001"
npm run build:resample-runtime-01-r9:package
npm run run:resample-runtime-01-r9:physical
npm run verify:resample-runtime-01-r9:physical
npm run finalize:resample-runtime-01-r9:physical
```

The physical finalizer must reject any run containing `PENDING`, `DEFERRED`, `SKIPPED`, or `FAIL` physical gates. R9 never moves the Production Pointer.

## Physical acceptance state

Only the packaged Windows execution may produce:

```text
RESAMPLE_RUNTIME_R9_PHYSICAL_GPU_AND_PACKAGED_EXECUTION_SEALED_AWAITING_R10
```

Required final counts:

```text
110 SOURCE PASS
187 PHYSICAL PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL
```

## Next authority

```text
TDT-RESAMPLE-RUNTIME-01-R10

Production Candidate Promotion /
Production Pointer Compare-and-Swap /
Rollback Drill /
Release Receipt Seal
```
