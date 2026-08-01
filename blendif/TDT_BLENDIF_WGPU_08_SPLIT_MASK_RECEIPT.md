# TDT-BLENDIF-WGPU-08 Split Mask Receipt

## Result

PASS_TDT_BLENDIF_WGPU_08_SPLIT_MASK_QMAP_CLAMP

## Changed Files

- app/js/passes/blendif_webgpu_wgsl.js

## Split Mask

| Function | Status |
|---|---|
| orderedSplit4 | PASS |
| rampUp | PASS |
| rampDown | PASS |
| splitQFeather | PASS |
| expandedSplit4 | PASS |
| splitMask | PASS |

## QMap Feather Clamp

| Rule | Status |
|---|---|
| qf = q * qmapSigma | PASS |
| qf <= qFeatherMax | PASS |
| qf <= (wLo - bHi) / 2 | PASS |
| bHi <= wLo after qf | PASS |

## Legacy Bridge Removal

| Item | Status |
|---|---|
| splitRange bridge used | false |
| splitFeather bridge used | false |
| rangeMask used for final mask | false |

## Forbidden Mutation Check

| Item | Expected |
|---|---|
| Params struct changed | false |
| Uniform layout changed | false |
| packParams rewritten | false |
| Split UI changed again | false |
| OkLab added | false |
| Preset migration added | false |
| WebGL fallback revived | false |
| Apply script created | false |

## Next

- TDT-BLENDIF-WGPU-09 OkLab L Metric / sRGB Linearization Seal
