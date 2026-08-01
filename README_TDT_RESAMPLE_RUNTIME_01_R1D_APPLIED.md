# TDT-RESAMPLE-RUNTIME-01-R1D Applied

## State

`RESAMPLE_RUNTIME_R1D_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

Production Pointer was not modified. This source bake does not claim physical WebGPU, Windows x64 packaged-Electron, or promoted production evidence.

## Parent

`TDT-RESAMPLE-RUNTIME-01-R1C`

Parent ZIP SHA-256:

`bad63bb7e252d468f4d4834673dfd708b9f4cfce0b27c318a5ac54106bf45fad`

## Compatibility migration

R1D preserves the existing Adaptive, EngineAuto, Worker, Pipeline, Preview, and Export facades while moving product authority onto the R1B/R1C WebGPU and WGSL runtime.

No compatibility entry point is silently removed. Compatibility paths may continue to execute only with explicit identity and claim limits. They cannot publish a canonical Final Surface unless they produce the required R1C resample receipt identity.

### Adaptive

`createAdaptiveEwaDownscalePass()` and the Q-map preprocessing chain remain callable.

The canonical mode now builds a stage-aligned adaptation policy field and supplies it to the existing R1C tensor and EWA chain. The field schema is:

- R: adaptive level,
- G: tensor influence,
- B: footprint scale,
- A: DeltaE gate.

Q-map and DeltaE remain policy inputs. Orientation remains owned by the R1C integrated structure tensor. Fixed anisotropy angle, texture-mix substitution, and independent bilinear fast paths are not canonical tensor evidence.

The adaptation policy shader is included in Runtime Asset Authority with a SHA-256 identity. The R1C product and direct-load reference EWA shaders consume the same policy binding. A missing policy binding is explicitly neutral and cannot be reported as Adaptive execution.

### EngineAuto

`downscaleAuto()` and `chooseEngine()` remain available.

Engine selection now separates requested policy from executed implementation:

- a canonical WebGPU request executes `tdt-ewa-aniso-r1c-v3`,
- a legacy WebGL compatibility request may execute `legacy-webgl-lanczos-compat-v1`,
- a legacy Lanczos execution sets `canonicalAnisotropicClaim: false`,
- compatibility output cannot become a canonical Final Surface.

The former state where `aniso` could name a Lanczos execution without recording that substitution is removed.

### Worker compatibility

`pipeline.worker.js` retains legacy and canonical request envelope support, but it no longer pretends to own a GPU implementation or returns an untouched zero-filled result.

The Worker is a protocol adapter. It forwards normalized work through a renderer-owned `MessagePort` to `ResampleWorkerBrokerService`. The renderer broker owns runtime-epoch, generation, cancellation, request-collision, executor, receipt, and zero-output gates.

An exact-size RGBA8 compatibility payload may be passed through only as an explicit noncanonical result:

- executed kernel: `renderer-rgba8-compatibility-passthrough-r1d`,
- canonical anisotropic claim: false,
- Final Surface publication: forbidden.

A size-changing request requires a registered canonical renderer executor.

## Shared Final Surface authority

Pipeline Final Surface publication now carries the resample receipt identity:

- `resampleReceiptId`,
- `resampleReceiptDigest`.

Preview and Export consume the same canonical tuple:

- `surfaceId`,
- `sourceRevision`,
- `finalRevision`,
- `pipelineReceiptId`,
- `resampleReceiptId`,
- `resampleReceiptDigest`.

`FinalSurfaceConsumptionLedgerService` canonicalizes this tuple and computes `sharedSurfaceTupleDigest`. Preview records consumption after its submitted-work fence. Export records consumption after validating and pinning the same Pipeline Final binding.

A tuple or receipt mismatch fails closed. Canonical R1C results require real receipt evidence. Older noncanonical Final Surfaces remain representable with the explicit `compatibility-untracked-v1` identity so that the predecessor pipeline contract is not broken, but that identity makes no canonical resample truth claim.

## Preview and Export

Preview remains a Pipeline publication subscriber. It does not call Adaptive, EngineAuto, or Worker compatibility adapters directly.

Export continues to call `PipelineService.requireFinal()` and pin the authoritative surface. The requested dimensions must exactly match the Final Surface. Export does not perform a second resize and does not use the Preview canvas, swap chain, compatibility bytes, source fallback, filtered cache, Canvas readback, or WebGL FBO as product pixel truth.

The active `resize_export_bind.js` still delegates to `DadumRuntimeExport.exportFinal(...)`. Runtime exact export defaults to `authoritative-final-required`. Legacy fallback behavior is available only through the explicit `legacy-compatibility` mode and is not product authority.

## Stable errors

R1D error codes are registered in the runtime StableErrorCode union. The stable error registry verifies all 614 referenced codes as declared.

## Source verification

- R1D Source Contract: 91/91 PASS
- R1D Mock Runtime: 13/13 PASS
- R1D Gate: 100 PASS / 8 DEFERRED / 0 FAIL
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
- Stable error registry: 614/614 referenced codes declared
- TypeScript syntax: 94 files PASS

## Deferred physical and packaged gates

RD101 through RD108 require a physical WebGPU implementation or Windows x64 packaged Electron:

- actual WGSL compiler and bind-group validation for Adaptive policy and R1C EWA integration,
- physical Adaptive parameter-sensitivity output,
- renderer Worker broker and MessagePort behavior in packaged Electron,
- device-loss and stale-generation interruption across broker and Final Surface ledger,
- Preview and Export shared tuple parity in a packaged renderer,
- physical Final Surface output conservation across codecs,
- repeated-run GPU memory and pending-job plateau,
- Electron relaunch cleanup and promotion receipt.

The full Promotion Baseline packaged pipeline was not run in this Linux source-bake environment because canonical packaged input is unavailable. Its source gate remains 66/66 PASS.
