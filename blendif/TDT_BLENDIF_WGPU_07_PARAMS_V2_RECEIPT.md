# TDT-BLENDIF-WGPU-07 Params V2 Receipt

## Result

`PASS_TDT_BLENDIF_WGPU_07_PARAMS_V2_SPLIT_PACK_REBIND`

## Changed Files

- `app/js/passes/blendif_webgpu_wgsl.js`
- `app/js/passes/blendif_webgpu_pass.js`
- `app/js/passes/dk_after_final_color_webgpu.js`

## Params V2 Layout

| Field | Type | Meaning |
|---|---|---|
| `underSplit` | `vec4f` | Underlying `bLo,bHi,wLo,wHi` |
| `thisSplit` | `vec4f` | This `bLo,bHi,wLo,wHi` |
| `blend` | `vec4f` | `opacity,qmapSigma,qFeatherMax,deltaKThreshold` |
| `gates` | `vec4f` | `deltaKFeather,phaseMin,phaseMax,phaseFeather` |
| `modes` | `vec4u` | `mode,metricUnder,metricThis,flags` |

## Flags

| Bit | Meaning |
|---:|---|
| 0 | `phaseGateOn` |
| 1 | `phaseWrap` |

## Bridge Policy

| Item | Status |
|---|---|
| True `splitMask` added | false |
| Split to legacy range/feather bridge | true |
| QMap feather formula changed | false |
| `qFeatherMax` packed | true |
| `qFeatherMax` used | false, reserved for `08` |

## Static Checks

| Check | Status |
|---|---|
| Params V2 struct present | PASS |
| JS `packParamsV2` present | PASS |
| Mapper returns `underSplit` / `thisSplit` | PASS |
| `modes` packed through uint slots | PASS |
| WGSL legacy uniform refs removed | PASS |
| `splitMask` absent | PASS |
| Apply script absent | PASS |

## Next

- `TDT-BLENDIF-WGPU-08 WGSL Split Mask / QMap Feather Clamp Seal`
