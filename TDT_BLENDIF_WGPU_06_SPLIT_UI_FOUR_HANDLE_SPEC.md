# TDT-BLENDIF-WGPU-06
## Split UI Four Handle / State Clamp Invariant Real Code Patch

PatchId: `TDT-BLENDIF-WGPU-06`

Depends on:

- `TDT-BLENDIF-WGPU-01`
- `TDT-BLENDIF-WGPU-02`
- `TDT-BLENDIF-WGPU-03`
- `TDT-BLENDIF-WGPU-04`
- `TDT-BLENDIF-WGPU-05`

## Goal

Expose Blend If split controls as real UI state without changing WebGPU params or WGSL math yet.

Primary state:

```txt
underSplit = [bLo, bHi, wLo, wHi]
thisSplit  = [bLo, bHi, wLo, wHi]
```

Invariant:

```txt
bLo <= bHi <= wLo <= wHi
```

## Direct source edits

```txt
app/js/blendif/blendif_schema.js
app/blendif_ui.js
```

## Required behavior

- Add Underlying split controls: Black Out, Black In, White In, White Out.
- Add This Layer split controls: Black Out, Black In, White In, White Out.
- Keep split values stored internally as `0..1`.
- Show byte labels as `0..255`.
- Clamp split values to ordered `bLo <= bHi <= wLo <= wHi`.
- Treat split as primary UI state.
- Update legacy `underRange`, `thisRange`, `underFeather`, `thisFeather` as compatibility fields when split changes.
- Keep WebGPU unavailable controls disabled.
- Do not introduce apply scripts.

## Forbidden mutations

```txt
WGSL splitMask added: false
Params struct changed: false
Uniform layout changed: false
OkLab added: false
Preset migration added: false
WebGL fallback revived: false
QMap feather changed: false
Apply script created: false
```

## PASS marker

```txt
PASS_TDT_BLENDIF_WGPU_06_SPLIT_UI_FOUR_HANDLE
```
