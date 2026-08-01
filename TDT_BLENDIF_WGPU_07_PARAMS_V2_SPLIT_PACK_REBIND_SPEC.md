# TDT-BLENDIF-WGPU-07
## Uniform Params V2 / Split Pack Rebind Real Code Patch

PatchId: `TDT-BLENDIF-WGPU-07`

Status: Applied to project body zip.

## Purpose

Rebind WebGPU Blend If uniform params from legacy `range + feather` fields to split-first Params V2.

`07` changes GPU uniform plumbing only. It intentionally keeps legacy `rangeMask` math by bridging `underSplit` / `thisSplit` to temporary `range + feather` values in WGSL. True split mask and qmap feather clamp remain reserved for `TDT-BLENDIF-WGPU-08`.

## Changed Files

- `app/js/passes/blendif_webgpu_wgsl.js`
- `app/js/passes/blendif_webgpu_pass.js`
- `app/js/passes/dk_after_final_color_webgpu.js`

## Params V2 Layout

```wgsl
struct Params {
  underSplit: vec4f,
  thisSplit: vec4f,
  blend: vec4f,
  gates: vec4f,
  modes: vec4u,
};
```

## Layout Meaning

| Field | Type | Meaning |
|---|---|---|
| `underSplit` | `vec4f` | Underlying `bLo,bHi,wLo,wHi` |
| `thisSplit` | `vec4f` | This layer `bLo,bHi,wLo,wHi` |
| `blend.x` | `f32` | opacity |
| `blend.y` | `f32` | qmapSigma |
| `blend.z` | `f32` | qFeatherMax, packed only, used in 08 |
| `blend.w` | `f32` | deltaKThreshold |
| `gates.x` | `f32` | deltaKFeather |
| `gates.y` | `f32` | phaseMin01 |
| `gates.z` | `f32` | phaseMax01 |
| `gates.w` | `f32` | phaseFeather01 |
| `modes.x` | `u32` | mode |
| `modes.y` | `u32` | metricUnder |
| `modes.z` | `u32` | metricThis |
| `modes.w` | `u32` | flags |

## Flags

| Bit | Meaning |
|---:|---|
| 0 | `phaseGateOn` |
| 1 | `phaseWrap` |

## Bridge Policy

- `orderedSplit4()` clamps and orders split values.
- `splitRange()` derives temporary range from split midpoint pairs.
- `splitFeather()` derives temporary feather from the wider black/white ramp.
- Existing `rangeMask()` remains active.
- `qmapSigma` formula remains unchanged.
- `qFeatherMax` is packed but not used until `08`.

## Explicit Non-Goals

- No `splitMask` implementation.
- No qmap feather clamp change.
- No OkLab implementation.
- No preset migration.
- No WebGL fallback revival.
- No apply script.
