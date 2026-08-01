# TDT-BLENDIF-WGPU-06 Applied

This archive contains the DadumDadum source with `TDT-BLENDIF-WGPU-06` directly applied.

This is not an apply-script bundle. Source files have been edited in place.

## PASS

```txt
PASS_TDT_BLENDIF_WGPU_06_SPLIT_UI_FOUR_HANDLE
```

## Changed files

```txt
app/js/blendif/blendif_schema.js
app/blendif_ui.js
```

## Summary

- Added split-to-legacy compatibility helpers.
- Added Underlying split 4-handle UI.
- Added This Layer split 4-handle UI.
- Bound split controls to `underSplit` and `thisSplit`.
- Preserved legacy `range + feather` fields for the current GPU pass.
- Left WGSL and WebGPU Params layout unchanged.

## Not included

```txt
No WGSL splitMask
No Params V2
No OkLab
No preset migration
No WebGL fallback revival
No apply script
No sha256 sidecar
```
