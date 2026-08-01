# TDT-BLENDIF-WGPU-07 Applied

This zip is a cumulative patched body of `44.zip` through `TDT-BLENDIF-WGPU-07`.

## Result

`PASS_TDT_BLENDIF_WGPU_07_PARAMS_V2_SPLIT_PACK_REBIND`

## Applied

- WebGPU Blend If `Params` changed to V2 layout.
- JS packing changed to `packParamsV2`.
- Mapper now returns `underSplit` / `thisSplit` instead of legacy range/feather params.
- WGSL bridges split to temporary range/feather and keeps existing `rangeMask` math.
- `qFeatherMax` is packed but intentionally unused until `08`.

## Not Applied Yet

- No true `splitMask`.
- No qmap feather clamp.
- No OkLab.
- No preset migration.
- No WebGL fallback revival.
- No apply script.
