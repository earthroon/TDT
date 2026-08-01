# TDT-BLENDIF-WGPU-10 Preset Migration Receipt

## Result

PASS_TDT_BLENDIF_WGPU_10_PRESET_MIGRATION_IDEMPOTENT

## Changed Files

- app/js/blendif/blendif_schema.js
- app/blendif_ui.js

## Migration Policy

| Item | Value |
|---|---|
| From | luma-srgb-v1 |
| To | oklabL-v2 |
| Remap space | gray-axis |
| Remap function | oklabLFromGraySrgb |
| Idempotent | true |

## Metric Scope

| Metric | Remap |
|---|---|
| OkLab L / kind 0 | true |
| Q | false |
| DeltaK | false |
| AQ | false |
| Phase | false |

## Preserved Fields

- opacity
- mode
- qmapSigma
- qFeatherMax
- deltaKThreshold
- deltaKFeather
- phaseGateOn
- phaseMin01
- phaseMax01
- phaseWrap
- phaseFeather01
- enable
- order

## Idempotency

| Check | Status |
|---|---|
| migrate once | PASS |
| migrate twice | PASS |
| oklabL-v2 input no-op | PASS |
| migratedAt not updated twice | PASS |

## Forbidden Mutation Check

| Item | Expected |
|---|---|
| WGSL changed | false |
| Params struct changed | false |
| Uniform layout changed | false |
| packParams rewritten | false |
| Split mask changed again | false |
| QMap feather clamp changed | false |
| Split UI changed again | false |
| WebGL fallback revived | false |
| Apply script created | false |

## Next

- TDT-BLENDIF-WGPU-11 Preview Export Route Parity / Full-Res WGPU Seal
