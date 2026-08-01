# TDT-BLENDIF-WGPU-06 Split UI Receipt

## Result

`PASS_TDT_BLENDIF_WGPU_06_SPLIT_UI_FOUR_HANDLE`

## Changed Files

- `app/js/blendif/blendif_schema.js`
- `app/blendif_ui.js`

## Checked Files

- `app/js/passes/dk_after_final_color_webgpu.js`
- `app/js/passes/blendif_webgpu_pass.js`
- `app/js/passes/blendif_webgpu_wgsl.js`

## Split UI

| Group | Handle | State |
|---|---|---|
| Underlying | Black Out | `underSplit[0]` |
| Underlying | Black In | `underSplit[1]` |
| Underlying | White In | `underSplit[2]` |
| Underlying | White Out | `underSplit[3]` |
| This Layer | Black Out | `thisSplit[0]` |
| This Layer | Black In | `thisSplit[1]` |
| This Layer | White In | `thisSplit[2]` |
| This Layer | White Out | `thisSplit[3]` |

## Invariants

| Invariant | Status |
|---|---|
| `underSplit` ordered | PASS |
| `thisSplit` ordered | PASS |
| values clamped `0..1` | PASS |
| legacy range/feather compat updated | PASS |
| WebGPU unavailable disables controls | PASS |

## Forbidden Mutation Check

| Item | Expected |
|---|---|
| WGSL splitMask added | false |
| Params struct changed | false |
| Uniform layout changed | false |
| OkLab added | false |
| Preset migration added | false |
| WebGL fallback revived | false |
| QMap feather changed | false |
| Apply script created | false |

## Next

- `TDT-BLENDIF-WGPU-07 Params V2 / Split Pack Rebind`
