# TDT-BLENDIF-WGPU-10
## Legacy Preset Migration V1 To V2 / Idempotent Remap Real Code Patch

PatchId: TDT-BLENDIF-WGPU-10
Status: Applied
Mutation Policy: Direct source edit, no apply script

## Purpose
Migrate legacy `luma-srgb-v1` Blend If state/preset values into `oklabL-v2` exactly once.

## Scope
Changed files:

- `app/js/blendif/blendif_schema.js`
- `app/blendif_ui.js`

Checked unchanged routes:

- WGSL runtime math is not changed by this patch.
- Params V2 layout is not changed by this patch.
- Split mask and qmap feather clamp are not changed by this patch.

## Rules

- `metricSpace` missing or `luma-srgb-v1` is treated as legacy.
- `metricSpace: oklabL-v2` is no-op.
- `metricUnder === 0` remaps `underSplit` only.
- `metricThis === 0` remaps `thisSplit` only.
- Q / DeltaK / AQ / Phase split values are not remapped.
- `opacity`, `mode`, `qmapSigma`, `qFeatherMax`, deltaK, phase, `enable`, and `order` are preserved.
- `migratedAt` is not updated by a second migration.

## Result Marker

`PASS_TDT_BLENDIF_WGPU_10_PRESET_MIGRATION_IDEMPOTENT`
