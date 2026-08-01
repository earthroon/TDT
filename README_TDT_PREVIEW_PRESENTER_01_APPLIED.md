# TDT-PREVIEW-PRESENTER-01 Applied

## Seal state

`PREVIEW_PRESENTER_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`

This bake promotes Preview from a registered but uncalled service into the single visible final-surface presentation authority. It does not mutate the Production Pointer and does not claim Windows packaged-Electron or physical-GPU promotion.

## Parent

- Artifact: `48_TDT_SURFACE_LIFECYCLE_01_CANONICAL_SURFACE_REGISTRY_OWNERSHIP_TYPED_DISPOSAL_PEAK_RESIDENCY_DEVICE_EPOCH_PREVIEW_EXPORT_PINNING_COMPATIBILITY_RETIREMENT_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME.zip`
- SHA-256: `ebd30158f98dcaf2862bec6e1f9e5b108c76ac80ceb0fd4ce0317398156f796c`

## Applied authority changes

- Added a typed `FinalSurfacePublication` subscription path to `PipelineService`.
- Connected final-surface commit and invalidation to deterministic Preview publication.
- Added a latest-wins Preview frame scheduler with superseded-frame receipts.
- Added a canonical layout authority separating source pixels, CSS size, backing-store size, DPR, fit mode, and display transform.
- Added a Preview frame receipt ledger and serializable Pinia projection.
- Added canonical GPUTexture direct presentation for RGBA8, sRGB RGBA8, and RGBA16F final surfaces.
- Added CPU RGBA8, CPU binary16 RGBA16, and ImageBitmap upload adapters without treating their copies as authoritative final surfaces.
- Bound every frame to a Surface Authority pin and retained it through `queue.onSubmittedWorkDone()`.
- Registered Preview upload textures as ephemeral Surface Authority resources and disposed them after the frame fence.
- Added GPU Authority-owned canvas configuration, shader-module creation, and render-pipeline creation.
- Added a Preview GPU consumer identity and device-loss recovery participant.
- Added the single visible canvas `canvas#dadumPreviewCanvas`.
- Retired active creation of the legacy WebGPU overlay canvas and legacy Preview canvas-capture paths.
- Converted legacy presenter entry points into delegates to `window.DadumPreviewPresenter`.
- Kept Preview readback and Export-from-Preview-canvas forbidden.

## Source gate

```text
TDT-PREVIEW-PRESENTER-01
50 PASS / 10 DEFERRED / 0 FAIL
```

The actual `PreviewPresenterService` TypeScript class was transpiled and executed against mock Pipeline, Surface Authority, GPU Authority, WebGPU canvas, and Pinia projections.

Observed source/runtime smoke:

```text
pipeline subscription                    PASS
CPU RGBA8 upload presentation            PASS
GPUTexture direct presentation           PASS
latest-wins superseded frame drop        PASS
surface pin held until queue fence       PASS
pin release before fence                 0
ephemeral Preview surface disposal       PASS
visible canvas readback                  0
output mutation                          0
device-loss participant                  PASS
active Preview pins after dispose        0
```

## Honest deferred boundary

The following gates require Windows x64 packaged Electron and a physical WebGPU device:

- PP01-51 physical device-loss suspension
- PP01-52 physical swap-chain neutral clear
- PP01-53 driver-backed old-epoch disposal
- PP01-54 CPU-final recovery presentation
- PP01-55 GPU-final republish after recovery
- PP01-56 packaged DOM/canvas identity
- PP01-57 physical GPU direct-presentation smoke
- PP01-58 Electron relaunch cleanup
- PP01-59 packaged output conservation
- PP01-60 final promotion receipt

## Regression conservation

```text
Runtime R7                         PASS
Promotion Baseline                66 / 66 PASS
Active Graph                      30 PASS / 10 DEFERRED
Active Graph regression           19 / 19 PASS
GPU Device SSOT                   30 PASS / 30 DEFERRED
Surface Lifecycle                 52 PASS / 8 DEFERRED
Export Worker 01..07              PASS
Export Promotion 01               54 / 54 PASS
Export Promotion 02               60 / 60 PASS
Export Promotion 03               68 / 68 PASS
Build Lock                        72 / 72 PASS
Build Emit                        84 / 84 PASS
MODJPEG                           84 / 84 PASS
Native Decoder                    120 / 120 PASS
JXL Codec                         108 / 108 PASS
PSD Decoder                       112 / 112 PASS
TypeScript syntax                 91 files PASS
```

## Surface Lifecycle gate compatibility correction

The previous Surface Lifecycle source gate recognized only one exact `finally { pin.release() }` source spelling. This bake updates that gate to accept semantically equivalent null-aware release forms while still requiring the canonical Preview pin acquisition and a release in the `finally` block. Runtime smoke remains the authoritative disposal proof.

## Promotion ceiling

This artifact may reach only:

`PREVIEW_PRESENTER_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`

It must not be represented as `PREVIEW_PRESENTER_VERIFIED_UNPROMOTED` until all ten physical/package gates pass, and it must not change the Production Pointer.

## Source seal

`eb59ad77afaec261c700629a3f506cad3d84cbce49c31b9a47f2dde50dd772d7`
