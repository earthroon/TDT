# TDT-BLENDIF-WGPU-08 Applied

This archive is the cumulative patched body through TDT-BLENDIF-WGPU-08.

## Result

PASS_TDT_BLENDIF_WGPU_08_SPLIT_MASK_QMAP_CLAMP

## Actual Source Change

- `app/js/passes/blendif_webgpu_wgsl.js`

## Summary

- Replaced TDT-07 legacy bridge final masking with true `splitMask()` math.
- Added `rampUp()`, `rampDown()`, `splitQFeather()`, `expandedSplit4()`, `splitMask()`.
- Preserved qmap feather modulation.
- Added `qFeatherMax` and gap clamp usage through existing `P.blend.z`.
- Removed final-mask dependency on `rangeMask`, `splitRange`, and `splitFeather`.

## Not Changed

- Params V2 layout
- 80-byte uniform layout
- packParamsV2
- Split UI
- OkLab
- Preset migration
- WebGL fallback state
- Apply scripts
- SHA sidecars
