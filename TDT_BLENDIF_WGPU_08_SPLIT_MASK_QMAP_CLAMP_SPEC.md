# TDT-BLENDIF-WGPU-08
## WGSL Split Mask / QMap Feather Clamp Seal Real Code Patch

PatchId: TDT-BLENDIF-WGPU-08
Status: Applied
Mutation Policy: Direct source edit, no apply script

## Goal

Replace the temporary TDT-07 split-to-legacy range/feather bridge with true WebGPU split-mask math.

## Changed File

- `app/js/passes/blendif_webgpu_wgsl.js`

## Applied Math

```txt
mask = rampUp(v, bLo, bHi) * rampDown(v, wLo, wHi)
qf = min(q * qmapSigma, qFeatherMax, (wLo - bHi) / 2 - eps)
```

## Guarded Invariants

```txt
bLo <= bHi <= wLo <= wHi
qf <= qFeatherMax
qf <= (wLo - bHi) / 2
```

## Forbidden Mutations

```txt
Params struct changed: false
uniform layout changed: false
packParamsV2 changed: false
OkLab added: false
preset migration added: false
WebGL fallback revived: false
apply script created: false
```

## Result

PASS_TDT_BLENDIF_WGPU_08_SPLIT_MASK_QMAP_CLAMP
