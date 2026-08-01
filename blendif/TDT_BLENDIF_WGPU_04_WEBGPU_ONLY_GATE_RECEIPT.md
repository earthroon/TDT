# TDT-BLENDIF-WGPU-04 WebGPU Only Gate Receipt

## Result

PASS_TDT_BLENDIF_WGPU_04_WEBGPU_ONLY_GATE

## Cumulative Applied Markers

- PASS_TDT_BLENDIF_WGPU_02_RANGE_MAPPING_HOTFIX
- PASS_TDT_BLENDIF_WGPU_03_MODE_ENUM_PARITY
- PASS_TDT_BLENDIF_WGPU_04_WEBGPU_ONLY_GATE

## Changed Files

- app/EmotionPipeline_CURVED_DEARTIFACT_PATCH.js
- app/wire_blendif_hook.js
- app/blendif_ui.js
- app/applyBlendingIf.js
- app/js/passes/dk_after_final_color_webgpu.js
- app/js/passes/blendif_webgpu_pass.js
- app/js/passes/blendif_webgpu_wgsl.js

## Route Policy

| Item | Value |
|---|---|
| Official backend | WebGPU |
| WebGL fallback allowed | false |
| WebGPU unavailable behavior | Blend If disabled |
| Legacy WebGL file deleted | false |

## Runtime Behavior

| Condition | Behavior |
|---|---|
| WebGPU available | WebGPU Blend If route |
| WebGPU unavailable | UI disabled, no WebGL fallback |
| Legacy WebGL hook called | No-op passthrough + warning |
| EmotionPipeline WebGL route | Does not import applyBlendingIf.js |

## Forbidden Mutation Check

| Item | Expected |
|---|---|
| Split slider added | false |
| Schema v2 added | false |
| Params struct changed | false |
| Uniform layout changed | false |
| OkLab added | false |
| Preset migration added | false |
| QMap feather changed | false |
| Apply script created | false |

## Next

- TDT-BLENDIF-WGPU-05 Schema V2 / Split State Shell
