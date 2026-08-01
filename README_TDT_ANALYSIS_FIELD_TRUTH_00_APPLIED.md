# TDT-ANALYSIS-FIELD-TRUTH-00 Applied

## Patch identity

- Patch ID: `TDT-ANALYSIS-FIELD-TRUTH-00`
- Title: `Canonical GPU Analysis Field Authority / Semantic Field Identity / Effective Execution Receipt / Zero CPU Compute·Zero Intermediate Readback / Legacy ABI Migration Seal`
- Parent patch: `TDT-RESAMPLE-RUNTIME-01-R2`
- Parent ZIP SHA-256: `89e824847d0c477cffbf7a1f2d807c32f7a41872243d292734f46b01ebe00b5a`
- Parent source seal: `f3af1f740a76ebfc6c07293b0287dfceee18f0202f8929ea88365d24dbc17f3b`
- Applied state: `ANALYSIS_FIELD_TRUTH_00_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- Production Pointer mutation: `false`

## Applied authority

A canonical renderer-side Analysis Field Authority was added under:

```text
app/src/runtime/analysis/
```

The authority now owns:

- semantic descriptor registration and collision rejection
- WebGPU/WGSL producer and consumer registration
- source-surface revision and device-epoch binding
- deterministic build lease, submission, fence and publication transitions
- effective-execution receipt sealing
- field generation, pin, release, disposal and supersession
- device-loss invalidation
- producer request, submission, publication, consumption and failure accounting
- a frozen compatibility bridge at `window.__DADUM_ANALYSIS_FIELD_BRIDGE__`

Runtime boot order is now:

```text
GPU Device Authority
→ Surface Authority
→ Analysis Field Authority
→ Legacy Runtime
```

## Semantic truth registry

The generated registry contains 18 analysis-field descriptors and keeps visual Q-wave outside the analysis namespace.

Important separated semantic families:

- R1C tensor tangent, coherence and axial order
- spectral window, power, summary, complex phase and peak orientation
- Hannakairo directional compatibility, axial order, winding defect and phase coherence
- Q-wave compatibility, analytic complex, spectral phase and Hilbert phase
- stage-aligned analysis policy

Registry identity:

```text
version: tdt.analysis.semantic-registry.aft00.v1
sha256: 66bf9e439c73e14ad98535505f517dd51c2b508b9dd72d57659857124130872b
```

## Producer inventory and current claim truth

Seven producers are registered or reserved:

- canonical R1C tensor producer
- future spectral FFT producer
- future Hannakairo directional producer
- future Hannakairo topology producer
- compatibility Q-wave local-anisotropy producer
- future analytic Q-wave producer
- future analysis-policy fusion producer

Source presence is not treated as effective execution. A producer may claim effective execution only after:

```text
request accepted
→ GPU resources admitted
→ dispatch encoded
→ queue submitted
→ completion fence observed
→ field published
→ receipt sealed
```

The generated implementation audit classifies 47 FFT, phase, Q-wave and Atlas-labelled files without deleting them or falsely promoting them.

## Zero CPU product compute

Product analysis rejects:

- CPU FFT or DFT
- CPU per-pixel Q-map generation
- CPU phase unwrap or winding calculation
- CPU Atlas packing or overlap reconstruction
- Canvas pixel extraction
- WebGL readback
- intermediate GPU pixel readback and GPU re-upload
- hidden WebGPU-to-Canvas-to-WebGL analysis bridges

The historical CPU FFT remains callable only through the explicit diagnostic mode:

```text
executionMode: diagnostic-cpu-reference
```

Default product calls fail with the stable error:

```text
E_ANALYSIS_CPU_PIXEL_COMPUTE_FORBIDDEN
```

Unpromoted FFT, Hannakairo, topology, analytic Q-wave and fusion producers fail closed with `E_ANALYSIS_PRODUCER_NOT_PROMOTED` instead of silently using CPU, WebGL or Canvas fallbacks.

## Compatibility preservation

Existing public facades and legacy files were retained. Compatibility adapters were added under:

```text
app/legacy-runtime/core/analysis/
```

The FFT builder no longer returns a null texture with success-shaped statistics. The FFT peak worker no longer implies completed GPU work. The legacy CPU FFT path requires an explicit diagnostic request.

## Source verification

```text
AFT00 source contract       61 / 61 PASS
AFT00 zero-CPU audit        PASS
AFT00 claim-truth audit     PASS
AFT00 mock runtime          25 / 25 PASS
AFT00 gate                 120 PASS / 8 DEFERRED / 0 FAIL
Stable error registry      660 / 660 PASS
TypeScript syntax          103 files PASS
Active Graph transpile       8 / 8 PASS
```

Active Graph after the bake:

```text
roots: 56
nodes: 304
edges: 311
assets: 27
graph sha256: 87a5af3cd797a413038499dc002d628f7d5e661835627b42abee8cb1ff850dc4
```

## Regression verification

The following predecessor and adjacent source gates were rerun successfully:

- R1A: `57 PASS / 11 DEFERRED / 0 FAIL`
- R1B: `72 PASS / 12 DEFERRED / 0 FAIL`
- R1C: `90 PASS / 6 DEFERRED / 0 FAIL`
- R1D: `100 PASS / 8 DEFERRED / 0 FAIL`
- R2: `81 PASS / 27 DEFERRED / 0 FAIL`
- Active Graph: `30 PASS / 10 DEFERRED`, regression `19/19 PASS`
- GPU Device SSOT: `30 PASS / 30 DEFERRED / 0 FAIL`
- Surface Lifecycle: `52 PASS / 8 DEFERRED / 0 FAIL`
- Preview Presenter: `50 PASS / 10 DEFERRED / 0 FAIL`
- Runtime R7: `PASS`
- Export Worker 01 through 07: `PASS`
- Export Promotion 01: `54/54 PASS`
- Export Promotion 02: `60/60 PASS`
- Export Promotion 03: `68/68 PASS`
- Build Lock: `72/72 PASS`
- Build Emit: `84/84 PASS`
- MODJPEG: `84/84 PASS`
- Native Decoder: `120/120 PASS`
- JXL Codec: `108/108 PASS`
- PSD Decoder: `112/112 PASS`
- Promotion Baseline Source: `66/66 PASS`

## Deferred evidence

`AFT00-117` through `AFT00-124` remain deferred because they require physical WebGPU or Windows x64 Packaged Electron evidence:

- actual WebGPU resource and bind-group validation
- real producer dispatch and completion receipts
- zero intermediate readback confirmation on a physical adapter
- device-loss invalidation during active analysis work
- packaged Worker and renderer bridge behavior
- memory plateau and relaunch cleanup
- Preview and Export coexistence with analysis fields
- final verified-unpromoted promotion receipt

No physical FFT, Hannakairo topology, analytic Q-wave, Atlas residency, pixel parity or performance claim is made by this source bake.
