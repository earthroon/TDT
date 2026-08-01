# TDT-BLENDIF-WGPU-04
## WebGPU Only Gate / No Silent WebGL Fallback Real Code Patch

PatchId: TDT-BLENDIF-WGPU-04
Scope: real source code patch
DependsOn: TDT-BLENDIF-WGPU-01, TDT-BLENDIF-WGPU-02, TDT-BLENDIF-WGPU-03
Mutation Policy: direct source edit, no apply script

## Goal

Seal Blend If official execution route as WebGPU-only and prevent legacy WebGL `applyBlendingIf.js` from running as a silent fallback.

## Applied Policy

- Official backend: WebGPU
- WebGL fallback: disabled
- WebGPU unavailable: Blend If UI disabled and runtime status reports WebGPU requirement
- Legacy WebGL file: kept, deprecated marker added
- Legacy `window.__BlendIfHook`: no-op passthrough with warning
- `window.__BlendIfHookWGPU`: preserved

## Cumulative Applied

- TDT-BLENDIF-WGPU-02 Range Mapping Hotfix
- TDT-BLENDIF-WGPU-03 Mode Enum Parity
- TDT-BLENDIF-WGPU-04 WebGPU Only Gate

## Non-goals

- No split slider
- No schema v2
- No OkLab
- No preset migration
- No Params struct change
- No uniform layout change
- No qmap-feather change
- No apply script

## PASS Marker

PASS_TDT_BLENDIF_WGPU_04_WEBGPU_ONLY_GATE
