# TDT-RESAMPLE-RUNTIME-01-R1B Applied

## State

`RESAMPLE_RUNTIME_R1B_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

## Applied Scope

- Preserved `runDeltaKStack()` object and positional facades.
- Preserved `downscaleRGBAWithWGSL()` RGBA8 input/output facade.
- Added one shared deterministic integer stage planner.
- Added `delta-k-tiled-v2` and `export-ewa-7x7-v1` support profiles.
- Replaced the R1A `< 0.5` rejection with deterministic internal stages.
- Kept all DeltaK intermediates GPU-resident as `rgba16float` textures.
- Runs `runDeltaKCore` exactly once after the final DeltaK stage.
- Uploads Export RGBA8 exactly once and reads back only the final stage.
- Added `rgba16float` non-final Export recompose shader.
- Added stage index/count fields to the 64-byte Export uniform ABI.
- Samples the predecessor tensor field in normalized original-image space.
- Added stage receipts, ordered chain receipt, plan and parameter digests.
- Added cancellation and per-stage device-epoch checks.
- Added exact-once intermediate disposal after submission fences.
- Added dynamic-asset digest entries for all three Export WGSL assets.

## Integer Terminal-Axis Correction

The conservative Export profile normally enforces `srcPerDst <= 1.5`. Integer dimensions make `2 -> 1` impossible to refine further. The implementation permits this only when the target axis is `1`, the source axis is at most `3`, and the complete axis fits the physical `±3` lattice. The stage receipt records the exception explicitly. The general ratio ceiling remains unchanged.

## Verification

```text
R1B planner fixtures             75 / 75 PASS
R1B source contract              44 / 44 PASS
R1B mock runtime                 17 / 17 PASS
R1B gate                         72 PASS / 12 DEFERRED / 0 FAIL
R1A predecessor                  57 PASS / 11 DEFERRED / 0 FAIL
Active Graph source              30 PASS / 10 DEFERRED / 0 FAIL
Active Graph regression          19 / 19 PASS
GPU Device SSOT                  30 PASS / 30 DEFERRED / 0 FAIL
Surface Lifecycle                52 PASS / 8 DEFERRED / 0 FAIL
Preview Presenter                50 PASS / 10 DEFERRED / 0 FAIL
Runtime R7                       PASS
Export Worker 01-07              PASS
Export Promotion 01              54 / 54 PASS
Export Promotion 02              60 / 60 PASS
Export Promotion 03              68 / 68 PASS
Build Lock source                PASS
Build Emit source                PASS
MODJPEG                           PASS
Native Decoder                    PASS
JXL Codec                         PASS
PSD Decoder                       112 / 112 PASS
Promotion Baseline source         66 / 66 PASS
TypeScript syntax                 91 files PASS
```

## Deferred Truth Boundary

The following remain deferred to Windows x64 Packaged Electron and a physical WebGPU device:

- actual WGSL compilation and bind-group validation;
- tiled/reference pixel comparison on the target GPU;
- physical device-loss interruption between stages;
- packaged upload/readback counters;
- packaged Final Surface and Export output conservation;
- repeated-run GPU memory plateau and Electron relaunch cleanup.

No Production Pointer was changed.
