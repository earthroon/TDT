# TDT-BLENDIF-WGPU-05
## Schema V2 / Split State Shell Real Code Patch

PatchId: `TDT-BLENDIF-WGPU-05`

This patch adds the Blend If schema v2 shell to the applied 다듬다듬 source tree. It introduces a real source module at `app/js/blendif/blendif_schema.js`, routes UI state normalization through it, and makes the WebGPU mapper consume normalized state while preserving the existing range/feather params shape.

## Scope

Included:

- Add `schemaVersion: 2` normalizer.
- Add `metricSpace: "luma-srgb-v1"` default.
- Add split shell fields `underSplit` and `thisSplit`.
- Preserve legacy `underRange`, `thisRange`, `underFeather`, `thisFeather`.
- Keep current WebGPU params range/feather layout.
- Keep WebGPU-only fallback seal from `04`.

Excluded:

- No split UI.
- No WGSL split mask.
- No Params struct or uniform layout change.
- No OkLab implementation.
- No preset migration.
- No WebGL fallback revival.
- No apply script.

## PASS Marker

`PASS_TDT_BLENDIF_WGPU_05_SCHEMA_V2_SPLIT_STATE_SHELL`
