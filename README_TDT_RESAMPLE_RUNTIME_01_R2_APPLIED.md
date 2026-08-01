# TDT-RESAMPLE-RUNTIME-01-R2 Applied

## State

`RESAMPLE_RUNTIME_R2_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

Production Pointer was not modified. This source bake does not claim physical same-device pixel parity, measured GPU speedup, Windows x64 packaged-Electron behavior, or promoted production evidence.

## Parent

`TDT-RESAMPLE-RUNTIME-01-R1D`

Parent ZIP SHA-256:

`e931447b7c3863afe60a15ec062d92ecd8bdc1b21d2f718883e329ccd1f0a1f8`

## Optimization scope

R2 preserves the R1A ABI repair, R1B deterministic multistage plan, R1C tensor/eigen/coherence mathematics, and R1D compatibility and shared Final Surface contracts.

R2 changes only the canonical EWA product memory-access and candidate-lattice implementation. The direct-load R1C reference shader remains byte-identical and is the correctness baseline.

## Deterministic product profiles

Canonical dispatch now selects one of two compile-time WGSL product profiles from a host-side footprint proof.

### Compact R4

- profile ID: `tdt.ewa.tile.r2.r4-8x8-v1`
- workgroup: `8x8`
- maximum integer reach: `4`
- candidate lattice: `9x9`, 81 candidates
- shared tile: `24x24`
- workgroup storage: 9,216 bytes

### Full R6

- profile ID: `tdt.ewa.tile.r2.r6-8x8-v1`
- workgroup: `8x8`
- maximum integer reach: `6`
- candidate lattice: `13x13`, 169 candidates
- shared tile: `28x28`
- workgroup storage: 12,544 bytes

The selector uses stage dimensions, sigma values, maximum anisotropy, Adaptive footprint bounds, maximum sample reach, device workgroup-storage limits, and the exact workgroup source span. It does not inspect image content, frame timing, adapter vendor, user agent, or random state.

A request selects R4 only when the proven reach is at most 4. Reach 5 or 6 selects R6. An unproven footprint or tile span fails before dispatch.

## Strict shared-tile product path

The R4 and R6 product shaders use a workgroup-common tile origin derived from `workgroup_id`.

The execution order is:

1. cooperative source-tile load,
2. one unconditional `workgroupBarrier()`,
3. output bounds check,
4. strict shared-tile reads,
5. R1C ellipse accumulation,
6. output store.

No product shader contains a direct source-texture fallback branch. Partial output workgroups still participate in cooperative loading and the barrier before inactive lanes return.

Validation-only R4 and R6 shaders retain an atomic `fallbackRequiredCount`. They may direct-load a missing sample only to produce diagnostic evidence. They are not selectable as product kernels.

## Baseline identity and parity infrastructure

The direct-load reference shader remains byte-identical:

`bfd0e2d94e15467379b92c9c2ed4a3555be1d1b0a9a67b4f0f167eb550dbc4eb`

R2 adds a GPU compute comparator that consumes product and reference `rgba16float` textures and writes a bounded summary containing:

- exact mismatch count,
- NaN count,
- infinity count,
- maximum absolute-error bits,
- first mismatch linear index,
- first mismatch channel,
- compared pixel count,
- comparator schema version.

The comparator uses bitwise float comparison so signed-zero and stored half-float differences are observable. Full image readback is not required for parity evidence.

The shadow parity runtime exists only for an explicit verification harness. The product result remains authoritative. A mismatch blocks performance promotion and cannot silently select the reference as a product fallback.

This Linux source bake verifies comparator wiring and lifecycle only. It does not claim that physical GPU parity has passed.

## Timestamp-query admission

`timestamp-query` is now an optional GPU Authority feature.

When the selected adapter supports it, GPU Authority includes it in the single authoritative device request and records the admitted feature in the device identity snapshot. No R2 module requests another adapter or side device.

Product EWA remains valid without timestamp support. In that case the performance receipt is `DEFERRED`, not fabricated from JavaScript wall-clock timing.

The R2 timestamp harness defines:

- 64 warmup pairs,
- 128 measured pairs,
- alternating product-reference and reference-product order,
- GPUQuerySet timestamp writes,
- query resolve and bounded readback,
- parity receipt as a mandatory predecessor.

Actual performance thresholds remain deferred until physical GPU timestamps exist.

## Device loss and lifecycle

The R2 bundle owns R4, R6, validation, reference, comparator, neutral policy, and parameter resources for one device epoch.

A GPU Authority recovery participant invalidates and disposes the bundle on device loss and increments the R2 device-loss-abort telemetry. Stale bundles remain rejected by the existing runtime and device epoch checks.

Optimization, parity, and performance ledgers are bounded.

## Runtime Asset Authority

Five R2 WGSL assets are sealed in the generated Runtime Asset Manifest:

- `ewa-aniso-tile-r4-r2`
- `ewa-aniso-tile-r6-r2`
- `ewa-aniso-validation-r4-r2`
- `ewa-aniso-validation-r6-r2`
- `ewa-aniso-parity-compare-r2`

The generated asset manifest now contains 27 assets.

## Source verification

- R2 Source Contract: 25/25 PASS
- R2 Mock Runtime: 10/10 PASS
- R2 Gate: 81 PASS / 27 DEFERRED / 0 FAIL
- R1D predecessor: 100 PASS / 8 DEFERRED / 0 FAIL
- R1C predecessor: 90 PASS / 6 DEFERRED / 0 FAIL
- R1B predecessor: 72 PASS / 12 DEFERRED / 0 FAIL
- R1A predecessor: 57 PASS / 11 DEFERRED / 0 FAIL
- Active Graph: 30 PASS / 10 DEFERRED, regression 19/19
- GPU Device SSOT: 30 PASS / 30 DEFERRED / 0 FAIL
- Surface Lifecycle: 52 PASS / 8 DEFERRED / 0 FAIL
- Preview Presenter: 50 PASS / 10 DEFERRED / 0 FAIL
- Runtime R7: PASS
- Export Worker 01 through 07: PASS
- Export Promotion 01: 54/54 PASS
- Export Promotion 02: 60/60 PASS
- Export Promotion 03: 68/68 PASS
- Build Lock: 72/72 PASS
- Build Emit: 84/84 PASS
- MODJPEG: 84/84 PASS
- Native Decoder: 120/120 PASS
- JXL Codec: 108/108 PASS
- PSD Decoder: 112/112 PASS
- Promotion Baseline Source Gate: 66/66 PASS
- Stable error registry: 628/628 referenced codes declared
- TypeScript syntax: 94 files PASS
- R2 WGSL structural balance: 5 files PASS

## Deferred physical and packaged gates

The following evidence remains deferred:

- actual browser WGSL compilation and bind-group validation for all R2 variants,
- validation-shader fallback-required count of zero on physical GPU fixtures,
- exact same-device product/reference pixel parity,
- NaN, infinity, signed-zero, and first-mismatch physical comparator evidence,
- R4 median tiled/reference ratio at or below 0.80,
- R6 median tiled/reference ratio at or below 0.90,
- aggregate geometric-mean and per-fixture regression thresholds,
- physical device-loss interruption of parity and timing batches,
- repeated-run GPU memory plateau,
- Windows x64 packaged-Electron Preview and Export output conservation,
- relaunch cleanup and promotion receipt.

The Promotion Baseline packaged pipeline was not run in this Linux source-bake environment because canonical packaged input is unavailable. Its source gate remains 66/66 PASS.
