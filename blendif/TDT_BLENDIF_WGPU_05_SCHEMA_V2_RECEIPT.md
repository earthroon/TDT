# TDT-BLENDIF-WGPU-05 Schema V2 Receipt

## Result

`PASS_TDT_BLENDIF_WGPU_05_SCHEMA_V2_SPLIT_STATE_SHELL`

## Changed Files

- `app/js/blendif/blendif_schema.js`
- `app/blendif_ui.js`
- `app/js/passes/dk_after_final_color_webgpu.js`

## Schema

| Field | Status |
|---|---|
| schemaVersion | 2 |
| metricSpace default | luma-srgb-v1 |
| underSplit | present |
| thisSplit | present |
| underRange | preserved |
| thisRange | preserved |
| underFeather | preserved |
| thisFeather | preserved |

## Invariants

| Invariant | Status |
|---|---|
| underSplit ordered | PASS |
| thisSplit ordered | PASS |
| range mapping policy preserved | PASS |
| runtime status not persisted as preset | PASS |

## Forbidden Mutation Check

| Item | Expected |
|---|---|
| Split slider UI added | false |
| WGSL splitMask added | false |
| Params struct changed | false |
| Uniform layout changed | false |
| OkLab added | false |
| Preset migration added | false |
| WebGL fallback revived | false |
| QMap feather changed | false |
| Apply script created | false |

## Next

- `TDT-BLENDIF-WGPU-06 Split UI Four Handle`
