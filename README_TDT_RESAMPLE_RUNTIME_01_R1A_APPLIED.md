# TDT-RESAMPLE-RUNTIME-01-R1A APPLIED

## State

```text
RESAMPLE_RUNTIME_R1A_SOURCE_BAKED_AWAITING_PACKAGED_GPU
```

This source bake repairs the admitted DeltaK EWA path in place. It does not freeze or replace the surrounding pipeline.

## Preserved external contracts

- `createDeltaKStack(device, existingPipes)` import path and symbol
- `runDeltaKStack(...)` import path and symbol
- canonical object ABI
- legacy positional ABI
- `pipes.pipeEWA` bundle slot
- WGSL product entry point `main`
- `dispatchEWAAniso(device, pipelineOrBundle, request)` facade
- successful return value remains an `rgba16float` `GPUTexture`
- downstream DeltaK core and optional gamma-proof position

## Applied implementation

### ABI compatibility

`runDeltaKStack()` now accepts both forms and normalizes them into one internal request.

```js
runDeltaKStack({ device, pipes, srcTex, tensorTex, ... })
runDeltaKStack(device, pipes, frameInputs)
```

Legacy aliases are resolved with conflict rejection. Different values supplied through two aliases fail with `E_R1A_AMBIGUOUS_LEGACY_ALIAS`.

The active `runtime.js` caller now uses the object ABI. The positional compatibility branch remains available for other admitted callers.

### Uniform ABI v2

The old nine-float, 36-byte upload was replaced by an exact 64-byte ABI.

```text
0   inSize          vec2<u32>
8   outSize         vec2<u32>
16  srcPerDst       vec2<f32>
24  dstPerSrc       vec2<f32>
32  sigmaMain       f32
36  sigmaCross      f32
40  shrinkClamp     f32
44  maxSampleReach  f32
48  stageIndex      u32
52  stageCount      u32
56  flags           u32
60  abiVersion      u32
```

ABI digest:

```text
658cc15c217f21200d2d6ffd651a0b1b0a58d2c6a76e43036552bc0bfde4c621
```

The bind-group layout declares `minBindingSize: 64`.

### Workgroup and barrier repair

The product kernel now uses:

```text
workgroup            8 x 8
logical radius       2
halo                  6
shared tile          28 x 28
shared bytes         12,544
```

The tile origin is calculated only from `workgroup_id`. All lanes cooperatively load the same tile, every lane reaches `workgroupBarrier()`, and out-of-range lanes return only after the barrier.

The previous invocation-local `baseX/baseY` and double-PAD coordinate correction were removed.

### Product and reference shaders

- `shaders/ewa_aniso_tile_v2.wgsl`: admitted tiled product kernel
- `shaders/ewa_aniso_reference_v1.wgsl`: independent direct-`textureLoad` reference

The reference shader contains no workgroup memory, tile origin, or barrier. Both shader byte streams are included in the runtime asset manifest with independent SHA-256 identities.

### f16 admission

`enable f16;` was removed from the EWA and gamma-proof shaders because the current arithmetic is f32. The `rgba16float` storage contract remains unchanged.

### Submission and resource closure

- pipeline-bundle uniform buffer is reused through a serialized dispatch chain
- raw-pipeline compatibility creates a temporary 64-byte buffer
- temporary buffer is destroyed after the queue fence
- `queue.onSubmittedWorkDone()` is awaited before downstream dispatch
- each dispatch emits a receipt
- stale pipeline device epochs fail closed
- successful output ownership transfers to the caller
- output texture is destroyed by the runner only when the dispatch fails

### Output metadata

The output texture receives canonical weak metadata:

- width and height
- storage format
- runtime epoch
- device epoch and identity
- job ID
- dispatch receipt
- ABI mode used

This adapter preserves the existing GPUTexture return contract without inventing a second output object.

## Odd half-scale clarification

The original spec simultaneously required `floor(source * scale)` and `srcPerDst <= 2.0`. Those conditions conflict for odd dimensions.

```text
17 -> floor(17 * 0.5) = 8
17 / 8 = 2.125
```

The bake keeps the existing floor rule and `scale >= 0.5`. Shared-tile admission is checked using the actual source-center span of an 8-pixel workgroup instead of rejecting a harmless rounding overshoot. `scale < 0.5` remains rejected and belongs to R1B multi-stage planning.

## Verification

```text
R1A source contract                 40 / 40 PASS
R1A mock and semantic gates         17 / 17 PASS
R1A packaged/physical GPU gates     11 DEFERRED
R1A total                           57 PASS / 11 DEFERRED / 0 FAIL

Active Graph source                 30 PASS / 10 DEFERRED
Active Graph regression             19 / 19 PASS
GPU Device SSOT                     30 PASS / 30 DEFERRED
Surface Lifecycle                   52 PASS / 8 DEFERRED
Preview Presenter                   50 PASS / 10 DEFERRED
Runtime R7                          PASS
Export Worker 01-07                 PASS
Export Promotion 01                54 / 54 PASS
Export Promotion 02                60 / 60 PASS
Export Promotion 03                68 / 68 PASS
Build Lock                          72 / 72 PASS
Build Emit                          84 / 84 PASS
MODJPEG                             84 / 84 PASS
Native Decoder                     120 / 120 PASS
JXL Codec                           108 / 108 PASS
PSD Decoder                         112 / 112 PASS
TypeScript syntax                   91 files PASS
Active Graph TypeScript transpile   8 / 8 PASS
```

## Mock runtime evidence

The actual JavaScript facades were imported and run against a deterministic mock WebGPU device.

Verified:

- product shader fetch and digest
- GPU Authority pipeline ownership
- canonical object ABI
- legacy positional ABI
- exact 17x13 to 8x6 output dimensions
- partial-workgroup dispatch
- queue completion fence
- stale pipeline epoch rejection
- raw-pipeline temporary buffer destruction
- successful output ownership transfer
- constant-color conservation
- normalized direction `(3,4) -> (0.6,0.8)`
- zero-weight guard count `0`
- shared-tile fallback count `0` for the admitted fixture
- twenty repeated canonical dispatches

## Deferred without promotion claims

The following remain unclaimed until Windows x64 Packaged Electron and a physical WebGPU adapter are observed:

- native WGSL compilation by the browser implementation
- native pipeline and bind-group validation
- RTX 3080 tiled/reference pixel comparison
- odd-size no-hang soak on physical GPU
- physical device-loss recovery
- packaged gamma-proof continuity
- packaged final-surface continuity
- relaunch identity
- independent output-conservation receipt

Production Pointer was not changed.
