# TDT-RESAMPLE-RUNTIME-01-R1C Applied

## State

`RESAMPLE_RUNTIME_R1C_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

Production Pointer was not modified. No physical GPU or Windows packaged-Electron claim is made by this source bake.

## Parent

`TDT-RESAMPLE-RUNTIME-01-R1B`

## What changed

R1C preserves the existing `runDeltaKStack()`, `createDeltaKStack()`, `pipeEWA`, `GPUTexture` return, R1B multi-stage chain, Gamma-proof ordering, and `downscaleRGBAWithWGSL()` facade.

The admitted Object ABI now defaults to `canonical-stage-local-r1c`. Each R1B stage builds a tensor field from the current stage source before EWA dispatch:

1. alpha-safe luminance and Scharr gradient,
2. per-pixel tensor outer product,
3. 9-tap Gaussian horizontal integration,
4. 9-tap Gaussian vertical integration,
5. symmetric 2x2 eigen decomposition,
6. canonical tangent sign, coherence, and normalized edge strength,
7. scale-projected anisotropic ellipse sampling.

The positional ABI remains admitted as `legacy-external-v1`. It continues to require and consume the predecessor external tensor texture through the preserved v2 shader and 64-byte ABI. Its receipt explicitly sets `tensorTruthClaim: false`.

An Object-ABI caller may still provide the old `tensorTex`. In canonical mode the call shape remains valid, but the field is recorded as present and not consumed. The stage-local R1C field is the product anisotropy authority.

## Tensor field contract

- Schema ID: `tdt.structure-tensor.field.v1`
- Format: `rgba16float`
- Resolution: current stage source width and height
- R: deterministic tangent X
- G: deterministic tangent Y
- B: coherence in `[0,1]`
- A: normalized edge strength in `[0,1]`

Tensor uniform ABI:

- ID: `tdt.structure-tensor.params.v1`
- Version: `0x0001000c`
- Size: 64 bytes
- Kernel radius: 4

## EWA product contract

Canonical product ABI:

- ID: `tdt.delta-k-ewa.params.v3`
- Version: `0x0001000c`
- Size: 80 bytes
- Ellipse kernel: `tdt.ewa.ellipse.radial-v1`
- Physical source lattice: `-6..6` for DeltaK tiled and reference shaders

The product shader projects stage scale onto tangent and normal axes. Coherence and edge strength gate anisotropy. The minor radius has an anti-aliasing coverage floor, the major radius is bounded by physical sample reach, and integer source samples are accepted only when the ellipse quadratic form is within one.

A separate direct-load reference shader uses the same field and ellipse equations without workgroup shared memory. The predecessor v2 tiled shader remains present only for explicit legacy-external compatibility.

## Export integration

Every Export R1B stage now builds the same R1C tensor schema from the current GPU-resident source texture. Both lowpass and residual recompose shaders bind the same eigen field. The old four-neighbor `edgeBasis()` function is no longer the product anisotropy authority.

R1B conservation remains:

- source upload: 1,
- intermediate readback: 0,
- final readback: 1,
- intermediate color surface: `rgba16float`,
- final surface: `rgba8unorm`.

The first uploaded Export stage records `encoded-srgb` as its tensor measurement domain. Later `rgba16float` stages record `declared-linear`. R1C does not claim color-management unification.

## Resource and epoch behavior

For each canonical stage, R1C owns gradient, raw tensor, horizontal integration, integrated tensor, and eigen-field textures. They are released exactly once after the EWA submission fence. The EWA output follows the existing R1B intermediate/final ownership contract.

Tensor and EWA pipeline identities are bound to the current GPU Authority device epoch. Old-epoch tensor bundles are rejected. Export recovery invalidates and disposes the tensor parameter bundle and uniform buffer before rebuilding state.

## Source verification

- R1C Source Contract: 90/90 PASS
- Tensor math fixtures: 15/15 PASS
- Mock runtime: 18/18 PASS
- R1C gate: 90 PASS / 6 DEFERRED / 0 FAIL
- R1B predecessor: 72 PASS / 12 DEFERRED / 0 FAIL
- R1A predecessor: 57 PASS / 11 DEFERRED / 0 FAIL
- Active Graph: 30 PASS / 10 DEFERRED, regression 19/19
- GPU Device SSOT: 30 PASS / 30 DEFERRED / 0 FAIL
- Surface Lifecycle: 52 PASS / 8 DEFERRED / 0 FAIL
- Preview Presenter: 50 PASS / 10 DEFERRED / 0 FAIL
- Runtime R7: PASS
- Export Worker 01 through 07: PASS
- Export Promotion 01: 54/54 PASS
- Export Promotion 02: 60/60 PASS
- Export Promotion 03: 68/68 PASS
- Build Lock: 72/72 PASS
- Build Emit: 84/84 PASS
- MODJPEG: 84/84 PASS
- Native Decoder: 120/120 PASS
- JXL Codec: 108/108 PASS
- PSD Decoder: 112/112 PASS
- Promotion Baseline Source Gate: 66/66 PASS
- TypeScript syntax: 91 files PASS
- WGSL structural balance: 9 files PASS

## Deferred physical and packaged gates

RC91 through RC96 require a physical WebGPU implementation or Windows x64 packaged Electron:

- actual WGSL compiler and bind-group validation,
- physical directional and coherence fixture output,
- tiled/reference pixel parity on the target GPU,
- device-loss interruption and old-epoch tensor invalidation,
- packaged Preview and Export final-surface continuity,
- repeated-run GPU memory plateau and Electron relaunch cleanup.

The full Promotion Baseline packaged pipeline was not rerun in this Linux source-bake environment because canonical packaged input is unavailable. Its source gate remains 66/66 PASS.
