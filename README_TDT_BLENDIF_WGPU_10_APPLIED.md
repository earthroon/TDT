# TDT-BLENDIF-WGPU-10 Applied

This archive is a cumulative patched `44.zip` body through `TDT-BLENDIF-WGPU-10`.

## Applied Marker

`PASS_TDT_BLENDIF_WGPU_10_PRESET_MIGRATION_IDEMPOTENT`

## Changed Files

- `app/js/blendif/blendif_schema.js`
- `app/blendif_ui.js`

## What Changed

- Added JS migration helpers:
  - `srgbToLinear1()`
  - `oklabLFromGraySrgb()`
  - `remapSplitLumaToOkLab()`
  - `migrateBlendIfStateLumaV1ToOkLabV2()`
  - `createDefaultBlendIfStateV2()`
- Connected UI state load/normalization to the migration path.
- New default UI state uses `metricSpace: oklabL-v2`.
- Legacy missing/`luma-srgb-v1` states are migrated once.
- `oklabL-v2` states are no-op and keep their original `migratedAt`.

## Not Changed

- No WGSL changes.
- No Params V2 layout changes.
- No packParamsV2 rewrite.
- No splitMask rewrite.
- No qmap feather clamp rewrite.
- No split UI redesign.
- No WebGL fallback revival.
- No apply script.
- No sha256 sidecar.
