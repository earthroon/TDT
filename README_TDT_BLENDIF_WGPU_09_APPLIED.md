# TDT-BLENDIF-WGPU-09 Applied

This archive is the cumulative `44.zip` body with TDT-BLENDIF-WGPU-01 through 09 applied.

## Result

PASS_TDT_BLENDIF_WGPU_09_OKLAB_L_METRIC

## Real Code Changes

- WebGPU Blend If metric kind `0` now uses OkLab L.
- sRGB samples are converted to linear RGB before the OkLab LMS transform.
- Blend If metric UI labels now show `OkLab L`.
- Legacy OkLab toggle was removed from the active UI/state path.

## Not Included

- No preset migration. Reserved for TDT-BLENDIF-WGPU-10.
- No Params layout change.
- No split mask/qmap clamp rewrite.
- No WebGL fallback revival.
- No apply script.
- No sha256 sidecar.
