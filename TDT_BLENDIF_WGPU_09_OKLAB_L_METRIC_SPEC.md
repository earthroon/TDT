# TDT-BLENDIF-WGPU-09
## OkLab L Metric / sRGB Linearization Seal Real Code Patch

PatchId: TDT-BLENDIF-WGPU-09
Scope: Real source code patch
Target: WebGPU Blend If metric kind 0 replacement from Rec.709 luma to OkLab L
Mutation Policy: Direct source edit, no apply script
DependsOn: TDT-BLENDIF-WGPU-01..08

## Goal

Replace WebGPU Blend If metric kind `0` with OkLab L. Texture samples are treated as sRGB and converted to linear RGB before OkLab LMS conversion.

## Changed Files

- `app/js/passes/blendif_webgpu_wgsl.js`
- `app/blendif_ui.js`
- `app/js/blendif/blendif_schema.js`

## Required Runtime Meaning

```txt
0 = OkLab L
1 = Q
2 = DeltaK
3 = AQ
4 = Phase
```

## WGSL Requirements

- `srgbToLinear1()` exists.
- `srgbToLinear3()` exists.
- `oklabLFromLinearRgb()` exists.
- `oklabLFromSrgb()` exists.
- `metricBy(0u, ...)` calls `oklabLFromSrgb(rgb)`.
- Rec.709 luma is not used by Blend If metric kind 0.

## UI Requirements

- Metric label `L` is replaced with `OkLab L`.
- Legacy OkLab toggle is removed or inactive.
- Metric options may expose Q, DeltaK, AQ, Phase.

## Forbidden Mutations

- No preset migration.
- No forced `metricSpace: oklabL-v2` stamping.
- No Params struct change.
- No uniform layout change.
- No `packParamsV2` rewrite.
- No split UI rewrite.
- No splitMask/qmap clamp rewrite.
- No WebGL fallback revival.
- No apply script.

## Pass Marker

```txt
PASS_TDT_BLENDIF_WGPU_09_OKLAB_L_METRIC
```
