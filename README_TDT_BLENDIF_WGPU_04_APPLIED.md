# 44.zip patched through TDT-BLENDIF-WGPU-04

This archive is the patched 다듬다듬 source tree, not a separate patch applicator bundle.

## Applied markers

- PASS_TDT_BLENDIF_WGPU_02_RANGE_MAPPING_HOTFIX
- PASS_TDT_BLENDIF_WGPU_03_MODE_ENUM_PARITY
- PASS_TDT_BLENDIF_WGPU_04_WEBGPU_ONLY_GATE

## Changed real source files

- app/js/passes/dk_after_final_color_webgpu.js
- app/js/passes/blendif_webgpu_pass.js
- app/js/passes/blendif_webgpu_wgsl.js
- app/EmotionPipeline_CURVED_DEARTIFACT_PATCH.js
- app/wire_blendif_hook.js
- app/blendif_ui.js
- app/applyBlendingIf.js

## Route policy

Blend If official backend is WebGPU-only. Legacy WebGL fallback is disabled and must not be used silently.
