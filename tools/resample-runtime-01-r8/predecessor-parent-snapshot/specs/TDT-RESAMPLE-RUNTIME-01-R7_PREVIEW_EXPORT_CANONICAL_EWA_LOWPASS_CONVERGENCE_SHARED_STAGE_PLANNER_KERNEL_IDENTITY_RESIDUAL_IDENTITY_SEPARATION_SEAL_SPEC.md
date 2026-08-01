# TDT-RESAMPLE-RUNTIME-01-R7

## Preview·Export Canonical EWA Lowpass Convergence / Shared Stage Planner and Kernel Identity / Residual Identity Separation Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R7`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R6`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R6_KERNEL_ABI_V4_SHARPNESS_TAPER_BORDER_SSOT_GENERATED_WGSL_KERNEL_IDENTITY_BAKED_AWAITING_PHYSICAL_GPU.zip`
- **Parent repository bundle SHA-256:** `0adaaa54ee02badc5851d86a6633123874b04f05b082d6c2c9d91c3419a0c005`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R6_KERNEL_CONTRACT_SEALED_AWAITING_R7`
- **Target source state:** `RESAMPLE_RUNTIME_R7_PREVIEW_EXPORT_LOWPASS_CONVERGED_SOURCE_BAKED_AWAITING_PHYSICAL_GPU`
- **Target source-verified state:** `RESAMPLE_RUNTIME_R7_CANONICAL_LOWPASS_CONVERGENCE_SEALED_AWAITING_R8`
- **Physical GPU state:** `RESAMPLE_RUNTIME_R7_PHYSICAL_GPU_EVIDENCE_DEFERRED_TO_R9`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Canonical Preview facade replacement:** forbidden
- **Canonical Export facade replacement:** forbidden
- **Shared lowpass runtime identity:** `tdt.ewa.canonical-lowpass-runtime.r7.v1`
- **Shared lowpass stage identity:** `tdt.ewa.canonical-lowpass-stage.r7.v1`
- **Shared stage planner identity:** `tdt.ewa.multistage.planner.v2`
- **Shared planner profile identity:** `tdt.ewa.canonical-r6-support-profile.v1`
- **Canonical lowpass kernel identity:** `tdt.ewa.ellipse.phase-correct-parametric-r6.v1`
- **Canonical lowpass ABI:** `tdt.delta-k-ewa.params.v4`
- **Canonical lowpass ABI bytes:** `96`
- **Canonical axial field identity:** `tdt.structure-tensor.axial-coherence-edge.r5.v1`
- **Canonical coordinate convention:** `tdt.ewa.source-lattice.pixel-center-v2`
- **Canonical border semantic:** `tdt.ewa.border.clamp-extension-logical-distance-v1`
- **Export residual identity:** `tdt.ewa.detail-residual.directional-r7.v1`
- **Export residual ABI identity:** `tdt.ewa.detail-residual.params.r7.v1`
- **Export residual application point:** final canonical lowpass stage only
- **Residual feedback into later lowpass stages:** forbidden
- **Canonical lowpass output format:** `rgba16float`
- **Canonical internal alpha representation:** premultiplied RGBA
- **Final export quantization:** separate boundary after optional residual
- **Preview lowpass readback:** forbidden
- **Export intermediate readback:** forbidden
- **Export terminal readback:** exactly one when byte output is requested
- **Runtime CPU EWA fallback:** forbidden
- **Legacy Export 7×7 lowpass as canonical product:** forbidden
- **Legacy residual kernel claiming canonical EWA identity:** forbidden
- **Source-only physical GPU parity claim:** forbidden
- **Source-only packaged Electron claim:** forbidden

---

# 0. Executive Contract

R7 shall make Preview and Export consume one canonical EWA lowpass chain.

R6 sealed the EWA ABI, phase convention, border semantic, axial field, parameterized weight function, and generated WGSL identity. It did not make the Export downscale path consume that canonical kernel. The parent repository therefore contains two different meanings behind the word “EWA”:

1. Preview and Delta-K use generated R6 product shaders, the v4 96-byte ABI, R4/R6 tiled profiles, continuous source-lattice distance, R5 double-angle axial interpolation, and the R6 weight contract.
2. Export uses a hand-written 7×7 lowpass shader, an unrelated 80-byte Export ABI, hardware linear sampling at every tap, a floor-loaded tangent field, a separate 1.5:1 planner profile, and a hard-coded `1.65` weight.

The parent Export path also applies detail residual after every stage and feeds that recomposed texture into the next stage. Consequently the next stage tensor and lowpass input already contain Export-only detail energy. Even when the final lowpass formula happened to look similar, the complete stage chain could not be equivalent to Preview.

R7 shall split the processing graph into three explicitly identified layers:

```text
canonical EWA lowpass chain
    ↓
optional Export-only detail residual
    ↓
final transfer / unpremultiply / quantization / readback boundary
```

Only the first layer may claim canonical EWA lowpass identity.

The shared lowpass chain shall be role-neutral. Preview and Export may have different source ownership and terminal delivery contracts, but when they provide the same source texture, dimensions, normalized lowpass parameters, device epoch, and analysis policy, they shall receive the same stage plan and execute the same R6 product shaders with the same packed ABI words.

The stage planner shall be upgraded from `tdt.ewa.multistage.planner.v1` to `tdt.ewa.multistage.planner.v2`. Planner v2 shall expose one canonical lowpass support profile. The former `delta-k-tiled-v2` and `export-ewa-7x7-v1` branches shall not remain parallel canonical profiles.

The canonical planner profile shall use the R6 tiled support selector:

```text
maximum admitted axis ratio per stage = 2:1
candidate physical reach              = R4 or R6
maximum lattice reach                 = 6
terminal 2→1 axis                     = normally admitted
special Export 3→1 terminal exception = removed
```

The planner digest shall depend only on lowpass semantics and geometry. It shall not depend on caller role, residual parameters, final file format, readback intent, UI route, or encoder identity. Thus Preview and Export can compare the same plan digest directly.

The shared runtime shall own stage-local tensor generation, axial texture selection, R6 profile selection, v4 parameter packing, product dispatch, intermediate texture lifecycle, device epoch validation, and canonical lowpass receipts. Existing public facades shall delegate to the shared runtime rather than duplicate those responsibilities.

The Export path shall upload its byte source exactly once when no GPU source surface is supplied. It shall run the same shared lowpass chain and retain the terminal `rgba16float` texture. It may then run an optional residual pass with a separate shader, ABI, identity, receipt, telemetry, and parameter digest. The residual pass shall execute only after the complete lowpass chain. It shall never replace a canonical stage output that will be consumed by another canonical stage.

The old Export shaders shall become historical evidence or explicit compatibility quarantine. They shall not remain admitted as canonical runtime assets:

```text
export_ewa_lowpass.wgsl
export_ewa_recompose.wgsl
export_ewa_recompose_linear.wgsl
```

The residual algorithm may preserve its existing visual intent, including its own sharpness and edge-adaptive mix, but its identity shall never equal the R6 lowpass kernel identity. A receipt shall state exactly whether residual was disabled, executed, or skipped by identity conditions.

R7 shall prove all of the following:

1. Parent R6 identities and generated shaders remain byte-identical.
2. One planner v2 produces role-neutral plans for Preview and Export.
3. Residual parameters do not alter the canonical plan digest.
4. File-format and readback options do not alter the canonical plan digest.
5. Both public facades delegate to one shared lowpass executor.
6. Both paths use the same R6 generated product shader selection.
7. Both paths pack the same 96-byte v4 ABI for an equal stage request.
8. Both paths build and consume the R5 axial field.
9. Export no longer consumes a hardware-filtered lowpass sampler.
10. Export no longer uses the 7×7 lowpass as a canonical stage.
11. Export intermediate stage outputs remain pure canonical lowpass textures.
12. Residual is final-stage-only and cannot feed back into the stage chain.
13. Residual has a separate identity, ABI, digest, and receipt.
14. Lowpass parity claims exclude residual and final quantization.
15. Export readback occurs only after the optional residual and finalization boundary.
16. Preview remains GPU-resident and readback-free.
17. Identity resize behavior preserves each facade’s public return contract.
18. No CPU, Canvas, WebGL, legacy Export shader, or reference-as-product fallback is introduced.
19. No Production Pointer is moved.
20. Physical GPU and packaged Electron proof remain deferred.

The intended transition is:

```text
R6 kernel ABI and generated WGSL sealed
    ↓
role-neutral planner v2
    ↓
shared canonical lowpass executor
    ↓
Preview facade delegation
    ↓
Export facade delegation
    ↓
final-stage-only residual branch
    ↓
separate finalization and readback boundary
    ↓
source and mock convergence proof
    ↓
physical GPU proof remains deferred to R9
```

R7 is a semantic convergence patch. It is not a production promotion patch.

---

# 1. Parent Truth and Frozen Evidence

## 1.1 Parent bundle identity

The only admitted parent is:

```text
61_TDT_RESAMPLE_RUNTIME_01_R6_KERNEL_ABI_V4_SHARPNESS_TAPER_BORDER_SSOT_GENERATED_WGSL_KERNEL_IDENTITY_BAKED_AWAITING_PHYSICAL_GPU.zip
```

with SHA-256:

```text
0adaaa54ee02badc5851d86a6633123874b04f05b082d6c2c9d91c3419a0c005
```

Any other parent shall fail with `E_R7_PARENT_BUNDLE_IDENTITY_MISMATCH`.

## 1.2 Frozen parent assets

The following parent files are immutable evidence. R7 shall add versioned planner and orchestration assets rather than rewriting the R6 kernel contract or generated product shaders.

| Asset | Parent SHA-256 |
|---|---|
| `specs/TDT-RESAMPLE-RUNTIME-01-R6_KERNEL_ABI_V4_SHARPNESS_TAPER_BORDER_SSOT_GENERATED_WGSL_KERNEL_IDENTITY_SEAL_SPEC.md` | `4b94274d8d5db8b73c5ea236e6b699481bd14c5640b1b03fabc8415e158ced26` |
| `README_TDT_RESAMPLE_RUNTIME_01_R6_APPLIED.md` | `1a5e0ed9b33a426c4aaebb9c7e42ac84a1d72d35553ed0d90684f8c1d7be4610` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_stage_planner.mjs` | `c4758506b719d763734470b311379f6aac155ae144206504171445d1abcf40f7` |
| `app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs` | `9b1d432a8a095f92c88bf6ecabae2eb834d88738684f59607992ee9ce660fe31` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params_v4.mjs` | `e8880cc46d2eec796e360c44f326e87692db9b25c23d788c6dff30c0e357fcf6` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_kernel_contract_v4.mjs` | `ae644228f72503f8d751a24bcf97ed0eafd446361380fbe572cce5254bf8f56e` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs` | `58ba24e685caa4d40f2ed81b184963b175104f25166d53717bc9b3406ed741ed` |
| `app/legacy-runtime/core/compute/qmap_webgpu/structure_tensor_runtime.mjs` | `097d8a9cc5fc292df53e7db71e7598d05701d16569d8c978aae298ec852e9708` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_axial_contract_r5.mjs` | `80d49122501f83157c76107a78365079cab53061a61d0693cadadefe570b2705` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r6.mjs` | `9cba998b53c84345a34d43f6451968b0d27989ea38998f5c693b7b01e9b67382` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_kernel_receipt_r6.mjs` | `194c56d45cfab5f8e6d126275cd7ce40f564e83f4b40ab72ff2f9b54f1161e4b` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_parity_runtime_r6.mjs` | `f6327f8028a42ba402c1295d4c2cccc49a4d55ec1f3d9a261c7a9c18203d6643` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r6.wgsl` | `c8f1a893b6ea0f3cf7c7b0fab4a4fcfbbf24a77627517f5fb30fd7b0446c65a8` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r6.wgsl` | `4c1229695396f4c11dc14502f99e2c25242924fd83a9fcb52f7169abb3912b71` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v5_r6.wgsl` | `70ae9edc4c5fd221a46ed546e8bbb3935b4176277aad62948078c2270892e81f` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_generated_manifest_r6.json` | `11f3bcca8ee3540a30f48433e1a9f2a5ea2f5bfa04dbf8ac9de14d3bc8669a47` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/structure_tensor_axial_r5.wgsl` | `2f00744b42416f0730682bdf397bca3fc05fce3d5dc10a2d2e27f32563725bca` |
| `app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js` | `2e34a0423f3065d0d9828661f816b63ccbe2c22f0478d2221eabeb0c6b80aa7f` |
| `app/legacy-runtime/modules/dk_resample/shaders/export_ewa_lowpass.wgsl` | `3a4f788db3793ea98de2b4228e9220b15229eb731adc202062e3d3cc369ac029` |
| `app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose.wgsl` | `0ee118825690f13c27539649df0e528f3131488fd3a4ffefd2f6b84163343970` |
| `app/legacy-runtime/modules/dk_resample/shaders/export_ewa_recompose_linear.wgsl` | `941885d39505ed6c830d0d8926509472b95604315a1b5a51562374043f161faf` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_multistage_runtime_receipt.mjs` | `8e06c87fcf4dc3614a3de0483d6f0f373dde00f251c5d567e66950a822706f24` |


## 1.3 Allowed canonical mutations

R7 may modify or replace only the orchestration surfaces required to converge Preview and Export:

- stage planner implementation and planner receipts;
- Preview/Delta-K facade delegation;
- Export downscale facade delegation;
- a new shared canonical lowpass runtime;
- a new Export residual runtime and shader;
- a finalization shader or transfer boundary;
- runtime asset admission and package scripts;
- R7 tools, fixtures, receipts, manifests, README, and patch artifacts.

R7 shall not alter the R6 kernel formula, ABI offsets, generated shader bodies, R5 axial conversion math, R4 coordinate convention, or R4 shared-tile proof.

## 1.4 Forbidden predecessor rewrites

The following actions are forbidden:

- editing an R6 generated WGSL file to make Export “match” it;
- changing R6 ABI defaults to mimic legacy Export output;
- changing the R5 axial field schema;
- changing R4 phase convention or border meaning;
- declaring the old Export lowpass shader equivalent by metadata only;
- retaining two planner profiles while assigning them the same display name;
- applying residual in an intermediate stage;
- hiding residual inside the canonical lowpass receipt;
- moving the Production Pointer.

---

# 2. Problem Statement

## 2.1 Split planner authority

The parent planner exposes:

```text
delta-k-tiled-v2   maximum stage ratio 2:1   lattice reach 6
export-ewa-7x7-v1  maximum stage ratio 3:2   lattice reach 3
```

For identical source and target dimensions, these profiles can generate different stage counts and intermediate dimensions. A final-frame comparison cannot prove stage-chain equivalence when the input to each stage differs.

## 2.2 Split lowpass kernel authority

Preview uses `tdt.ewa.ellipse.phase-correct-parametric-r6.v1`. Export uses a hand-written function with a fixed 7×7 loop, fixed sharpness, unrelated ellipse parameters, and no R6 generated-source identity.

## 2.3 Hardware-filtered Export taps

The parent Export lowpass calls `textureSampleLevel` for every tap. Each logical tap therefore contains a bilinear reconstruction of four texels. The R6 product uses discrete `textureLoad` samples on the canonical source lattice. These are different filters even when the same ellipse and weight values are written around them.

## 2.4 Tangent field regression in Export

The parent Export path binds `tensorHandle.fieldTexture`, not `tensorHandle.axialFieldTexture`, and loads it at `floor(p)`. It therefore bypasses the R5 double-angle interpolation contract.

## 2.5 Residual contamination of multistage input

The parent Export path computes lowpass and recompose for every stage, then assigns the recomposed output to `currentTexture`. Every later tensor field and lowpass stage therefore sees residual-modified input. Preview stages see only lowpass output.

## 2.6 Receipt identity conflation

The parent Export stage receipt labels an ellipse kernel but does not separate lowpass, residual, quantization, and readback identities. A consumer cannot determine which pixels are canonical lowpass and which include Export-only detail reconstruction.

## 2.7 Quantization boundary ambiguity

The final Export stage writes directly to `rgba8unorm` from the recompose pass. Lowpass correctness, residual correctness, unpremultiplication, clamping, and quantization are fused into one observable output. R7 shall establish an inspectable `rgba16float` lowpass boundary before optional residual and final quantization.

---

# 3. Scope

## 3.1 In scope

- planner v2 and one canonical support profile;
- role-neutral stage-plan identity;
- one shared canonical lowpass runtime;
- Preview delegation to that runtime;
- Export delegation to that runtime;
- canonical R6 shader and ABI reuse;
- R5 axial field reuse;
- optional final-stage-only detail residual;
- residual ABI and identity separation;
- separate finalization and terminal readback boundary;
- compatibility mapping for admitted Export options;
- source, mock, negative-control, receipt, and graph gates.

## 3.2 Out of scope

- changing the R6 kernel weight formula;
- changing R6 sharpness or taper ranges;
- changing R5 axial interpolation math;
- changing R4 tile reach proof;
- proving unclipped support for all public parameter combinations;
- complete premultiplied alpha and DC conservation promotion;
- physical GPU pixel parity;
- GPU timestamp performance;
- packaged Electron promotion;
- Production Pointer mutation.

## 3.3 Deferred authority

The following remain assigned to later patches:

```text
R8  Unclipped Support / Alpha·Border·DC Conservation / Zero Silent Degradation
R9  Physical GPU Oracle·Parity / Device Loss / Timestamp / Residency Plateau
R10 Packaged Electron Preview·Export / Artifact Identity / Production Pointer / Rollback
```

---

# 4. Non-Breakage Contract

R7 shall preserve:

1. `runDeltaKStack(...)` public signatures and GPU texture return semantics.
2. Existing Export public entrypoints and final `Uint8Array` byte-return semantics.
3. One upload and one terminal readback for byte-based Export requests.
4. Zero Preview readback.
5. Existing cancellation and device-epoch checks.
6. Existing source ownership rules.
7. Existing output dimensions and no-upscale rejection.
8. Existing R6 lowpass defaults.
9. Existing R6 generated shader identities.
10. Existing R5 stage-local tensor producer.
11. Existing R4/R6 tiled profile selection inside the canonical stage dispatcher.
12. Existing encoder-facing straight-alpha byte output contract.

Behavioral changes shall be explicit:

- Export lowpass becomes the R6 canonical lowpass.
- Export planner becomes planner v2.
- Export residual executes only once after the full lowpass chain.
- legacy Export lowpass options are normalized through an explicit adapter or rejected; they shall never silently select the old shader.

---

# 5. Authority and Identity Model

The following identities are normative:

| Layer | Identity |
|---|---|
| Planner | `tdt.ewa.multistage.planner.v2` |
| Planner profile | `tdt.ewa.canonical-r6-support-profile.v1` |
| Shared runtime | `tdt.ewa.canonical-lowpass-runtime.r7.v1` |
| Canonical stage | `tdt.ewa.canonical-lowpass-stage.r7.v1` |
| Kernel | `tdt.ewa.ellipse.phase-correct-parametric-r6.v1` |
| Kernel ABI | `tdt.delta-k-ewa.params.v4` |
| Axial field | `tdt.structure-tensor.axial-coherence-edge.r5.v1` |
| Phase | `tdt.ewa.source-lattice.pixel-center-v2` |
| Border | `tdt.ewa.border.clamp-extension-logical-distance-v1` |
| Residual | `tdt.ewa.detail-residual.directional-r7.v1` |
| Residual ABI | `tdt.ewa.detail-residual.params.r7.v1` |
| Finalization | `tdt.export.finalize-linear-to-rgba8.r7.v1` |
| Convergence receipt | `tdt.ewa.preview-export-convergence-receipt.r7.v1` |

A canonical lowpass claim is valid only if all lowpass identities above are present and match. Residual and finalization identities shall be reported separately.

---

# 6. Semantic Layer Separation

## 6.1 Canonical lowpass layer

The canonical lowpass layer performs only:

- deterministic stage planning;
- stage-local analysis field production;
- axial field consumption;
- anisotropic EWA accumulation;
- normalized premultiplied `rgba16float` output;
- GPU-resident intermediate chaining.

It shall not perform:

- detail residual;
- unpremultiplication;
- encoder transfer conversion;
- byte quantization;
- readback;
- file-format-specific processing.

## 6.2 Residual layer

The residual layer is Export-only and optional. It may consume:

- the final stage source texture;
- the final canonical lowpass texture;
- the final stage axial field;
- residual-only parameters.

It shall output `rgba16float` and shall not claim canonical EWA lowpass identity.

## 6.3 Finalization layer

The finalization layer may:

- select lowpass-only or residual-composed texture;
- apply the declared unpremultiply rule;
- clamp to the encoder surface domain;
- write `rgba8unorm` when a byte encoder surface is requested;
- trigger the single terminal readback.

The finalization layer shall not alter the lowpass receipt or planner digest.

---

# 7. Shared Stage Planner v2

## 7.1 Planner identity

```text
EWA_STAGE_PLANNER_ID      = tdt.ewa.multistage.planner.v2
EWA_STAGE_PLANNER_VERSION = 2
EWA_STAGE_COUNT_LIMIT     = 32
```

## 7.2 Canonical profile

Planner v2 shall expose one canonical lowpass profile:

```text
profileId              = tdt.ewa.canonical-r6-support-profile.v1
maxRatioNumerator      = 2
maxRatioDenominator    = 1
maximumLatticeReach    = 6
profileSelection       = R4 or R6 through the R6 tiled-profile selector
specialTerminalAxis    = none
```

The old profile names may remain only as rejected legacy identifiers or compatibility input labels that normalize to the one canonical profile. They shall not produce independent stage geometry.

## 7.3 Role-neutral input

Planner input shall contain only:

```text
sourceWidth
sourceHeight
targetWidth
targetHeight
canonicalLowpassParameterDigest
canonicalSupportContractDigest
```

It shall not contain Preview/Export role, residual parameters, output format, encoder ID, readback intent, UI route, or job ID.

## 7.4 Deterministic dimension recurrence

For each axis:

```text
next = max(target, ceil(current / 2))
```

with safe-integer overflow checks. The final stage reaches the exact target dimensions. A `2 → 1` terminal stage is admitted normally. No Export-only `3 → 1` exception exists.

## 7.5 Plan digest

The plan digest shall include:

- planner identity and version;
- canonical profile identity;
- source and target dimensions;
- ordered stage dimensions;
- lowpass parameter digest;
- R6 kernel contract digest;
- R4 coordinate and tile-proof identities;
- R5 axial field identity.

The plan digest shall exclude residual and finalization data.

## 7.6 Equality contract

Given equal normalized lowpass inputs, Preview and Export shall produce byte-identical canonical JSON and the same plan digest.

---

# 8. Canonical Lowpass Request

The shared runtime request shall be normalized into a frozen structure containing:

```text
device
sourceTexture
sourceWidth
sourceHeight
targetWidth
targetHeight
sourceFormat
sourceDomain
sourceSurfaceId
sourceRevision
runtimeEpoch
deviceEpoch
jobId
cancellationEpoch
sigmaMain
sigmaCross
shrinkClamp
maxAnisotropy
edgeLow
edgeHigh
minorCoverageFactor
coherenceExponent
kernelSharpness
kernelTaperExponent
phaseConvention
phaseConventionId
borderMode
flags
adaptivePolicy or null
```

Consumer-specific fields shall be held outside the lowpass request.

The request normalizer shall reject unknown phase or border identities through the R6 contract. It shall reject nonfinite values before planning or resource allocation.

---

# 9. Shared Canonical Lowpass Runtime

## 9.1 Runtime location

The normative runtime shall be versioned, for example:

```text
app/legacy-runtime/core/compute/qmap_webgpu/ewa_canonical_lowpass_runtime_r7.mjs
```

## 9.2 Responsibilities

The shared runtime shall:

1. validate the device lease and epoch;
2. build planner v2 output;
3. create stage-local output textures;
4. build the R1C tensor and R5 axial field for every stage;
5. select R4 or R6 through `selectEwaR6Profile`;
6. pack the 96-byte v4 ABI;
7. dispatch the generated R6 product shader;
8. append role-neutral stage receipts;
9. dispose intermediate textures exactly once;
10. return the terminal `rgba16float` texture and ownership handle.

## 9.3 Shared executor result

The returned object shall include:

```text
texture
width
height
format = rgba16float
ownership
release()
plan
planDigest
lowpassParameterDigest
kernelIdentity
shaderIdentity sequence
stageReceipts
lastStageSourceTexture or retained residual source handle
lastStageAxialTexture or retained residual axial handle
```

Residual support handles shall be retained only when explicitly requested by the Export orchestrator and shall have exact release ownership.

## 9.4 No role branch in pixel math

Preview and Export roles may affect ownership, retention, and terminal delivery. They shall not affect:

- planner dimensions;
- tensor parameters;
- profile selection;
- shader selection;
- ABI words;
- dispatch dimensions;
- weight math;
- border math.

---

# 10. Preview Delegation Contract

The Preview/Delta-K facade shall normalize its existing request, acquire or reuse the canonical R6 pipeline bundle, and call the shared lowpass runtime.

The Preview facade may run a later Delta-K core after lowpass, but that later core shall remain outside the canonical lowpass receipt.

Preview requirements:

- source texture is caller-owned;
- stage intermediates are runtime-owned;
- final lowpass texture ownership transfers to the caller;
- upload count remains zero;
- readback count remains zero;
- intermediate readback count remains zero;
- residual execution count remains zero;
- finalization execution count remains zero;
- facade return type remains a GPU texture.

Identity resize shall preserve the existing source-retained behavior and issue an identity lowpass receipt with zero stages.

---

# 11. Export Delegation Contract

## 11.1 Source acquisition

A byte-based Export request shall upload the source exactly once into a GPU texture. A future GPU-surface Export request may provide a canonical source texture directly, but shall not cause a second upload.

## 11.2 Lowpass execution

Export shall call the same shared lowpass runtime used by Preview. It shall not compile or dispatch `export_ewa_lowpass.wgsl` as a canonical lowpass stage.

## 11.3 Intermediate stages

Every intermediate stage texture shall be the direct output of the canonical lowpass dispatcher. No residual, unpremultiply, quantization, or encoder transform may occur before the next stage tensor is built.

## 11.4 Terminal texture

The shared runtime returns a terminal `rgba16float` lowpass texture. Export shall preserve that texture as an observable semantic boundary in receipts and validation fixtures.

## 11.5 Terminal delivery

After optional residual and finalization, Export may copy one `rgba8unorm` surface to one mapped buffer and return a `Uint8Array`. There shall be no intermediate mapping.

## 11.6 Identity resize

For equal source and target dimensions, Export shall preserve its public copy semantics. It may upload and finalize as needed by the public byte contract, but shall record zero lowpass stages and shall not fabricate a lowpass dispatch.

---

# 12. Canonical Lowpass Kernel Reuse

R7 shall not create a new EWA lowpass formula. It shall reuse:

```text
kernel ID      tdt.ewa.ellipse.phase-correct-parametric-r6.v1
ABI            tdt.delta-k-ewa.params.v4
phase          tdt.ewa.source-lattice.pixel-center-v2
border         tdt.ewa.border.clamp-extension-logical-distance-v1
axial field    tdt.structure-tensor.axial-coherence-edge.r5.v1
product WGSL   ewa_aniso_tile_r4_r6.wgsl or ewa_aniso_tile_r6_r6.wgsl
```

Export lowpass shader selection shall be indistinguishable from Preview shader selection for the same stage support request.

The R6 generated manifest and shader digests shall appear in both convergence receipts.

---

# 13. Legacy Export Lowpass Retirement

The parent assets:

```text
modules/dk_resample/shaders/export_ewa_lowpass.wgsl
modules/dk_resample/shaders/export_ewa_recompose.wgsl
modules/dk_resample/shaders/export_ewa_recompose_linear.wgsl
```

shall be handled by one of these explicit states:

```text
historical-evidence
compatibility-quarantine
retired-not-admitted
```

They shall not be:

- fetched by the canonical Export runtime;
- included as active canonical lowpass assets;
- selected by a silent feature flag;
- used after an R6 shader compilation failure;
- named as a parity reference;
- packaged as an undisclosed fallback.

A static source scan shall prove zero admitted runtime fetches of the legacy lowpass shader.

---

# 14. Export Option Normalization

## 14.1 Canonical lowpass options

Export shall admit the same canonical lowpass option names used by Preview:

```text
sigmaMain
sigmaCross
shrinkClamp
maxAnisotropy
edgeLow
edgeHigh
minorCoverageFactor
coherenceExponent
kernelSharpness
kernelTaperExponent
phaseConvention
borderMode
```

## 14.2 Legacy aliases

Legacy Export aliases may be admitted only through a named compatibility adapter:

```text
radiusMul → sigmaMain
sigma     → sigmaCross
```

The adapter shall:

- reject conflicts between canonical and alias values;
- include the mapping in the receipt;
- apply the same canonical range validation;
- never select the old Export shader.

`majorBoost`, `minorClamp`, `detailMix`, and `edgeBoost` are residual parameters in R7. They shall not enter the lowpass parameter digest.

If a legacy option has no defined mapping, it shall fail with `E_R7_LEGACY_EXPORT_OPTION_UNMAPPABLE` rather than vanish.

---

# 15. Residual Identity Separation

## 15.1 Residual identity

```text
residualId    = tdt.ewa.detail-residual.directional-r7.v1
residualAbiId = tdt.ewa.detail-residual.params.r7.v1
```

## 15.2 Application point

Residual shall execute at most once, after the final canonical lowpass stage. `residualExecutionCount` shall be `0` or `1`.

## 15.3 Inputs

The residual may consume the final stage source texture, final lowpass texture, and final stage axial field. If these handles are not retained by the shared runtime, residual execution shall fail closed rather than rebuild a semantically different field.

## 15.4 Parameters

Residual-only parameters may include:

```text
detailMix
edgeBoost
majorBoost
minorClamp
residualSharpness
residualTaperExponent
```

They shall have a separate normalized parameter digest.

## 15.5 Disabled identity

`detailMix == 0` shall disable the residual pass exactly. The output selected for finalization shall be the canonical lowpass texture. A disabled residual shall not compile, dispatch, or mutate the lowpass texture.

## 15.6 No lowpass claim

The residual receipt shall never expose the R6 lowpass kernel ID as its own algorithm identity. It may reference the lowpass input receipt by digest only.

## 15.7 No feedback

No residual output may become `sourceTexture` for a canonical lowpass stage. A graph or runtime attempt shall fail with `E_R7_RESIDUAL_FEEDBACK_FORBIDDEN`.

---

# 16. Residual ABI and Shader Contract

The residual ABI shall be independent from the 96-byte EWA ABI. It shall include explicit source and destination dimensions, residual parameters, stage source identity, lowpass receipt digest reference, residual ABI version, and flags.

A normative minimum layout is:

```text
byte  0  sourceSize                 vec2<u32>
byte  8  outputSize                 vec2<u32>
byte 16  srcPerDst                  vec2<f32>
byte 24  detailMix                  f32
byte 28  edgeBoost                  f32
byte 32  majorBoost                 f32
byte 36  minorClamp                 f32
byte 40  residualSharpness          f32
byte 44  residualTaperExponent      f32
byte 48  flags                      u32
byte 52  abiVersion                 u32
byte 56  reserved0                  u32
byte 60  reserved1                  u32
byte 64  end
```

Reserved words shall be written as zero. The residual shader shall output `rgba16float`. Final byte conversion belongs to the finalization shader.

The default residual sharpness may preserve the historical value `2.1`, but this value belongs to the residual contract only.

---

# 17. Finalization Contract

Finalization shall consume either:

```text
canonical lowpass texture
or
residual-composed texture
```

It shall record which input was selected.

The finalization receipt shall contain:

- input texture semantic ID;
- input receipt digest;
- alpha mode;
- transfer mode;
- destination format;
- clamp policy;
- quantization identity;
- readback byte layout;
- readback count.

The lowpass receipt shall remain unchanged by finalization.

---

# 18. Convergence Receipt

A Preview/Export convergence receipt shall include:

```json
{
  "schemaId": "tdt.ewa.preview-export-convergence-receipt.r7.v1",
  "plannerId": "tdt.ewa.multistage.planner.v2",
  "plannerProfileId": "tdt.ewa.canonical-r6-support-profile.v1",
  "sharedRuntimeId": "tdt.ewa.canonical-lowpass-runtime.r7.v1",
  "kernelId": "tdt.ewa.ellipse.phase-correct-parametric-r6.v1",
  "abiId": "tdt.delta-k-ewa.params.v4",
  "coordinateConventionId": "tdt.ewa.source-lattice.pixel-center-v2",
  "axialFieldId": "tdt.structure-tensor.axial-coherence-edge.r5.v1",
  "borderId": "tdt.ewa.border.clamp-extension-logical-distance-v1",
  "planDigest": "...",
  "lowpassParameterDigest": "...",
  "stageShaderDigests": ["..."],
  "residual": {
    "enabled": false,
    "identity": null,
    "executionCount": 0
  },
  "finalization": null
}
```

Preview and Export receipts for equal lowpass inputs shall match on all canonical lowpass fields. Consumer-specific ownership and delivery fields may differ and shall be held in separate envelopes.

---

# 19. Stage-by-Stage Parity Boundary

The canonical parity surface is each stage’s `rgba16float` lowpass output before residual or finalization.

Source-only and mock gates shall prove identical:

- planner canonical JSON;
- stage count;
- stage dimensions;
- profile selection;
- 96-byte uniform words;
- product shader digest;
- axial field identity;
- dispatch geometry;
- stage receipt canonical JSON.

Physical GPU gates shall later compare stage textures after the same storage conversion. Final `rgba8unorm` bytes are not the R7 canonical lowpass parity surface.

---

# 20. Negative Controls

R7 verification shall include negative controls that intentionally reintroduce divergence:

1. select `export-ewa-7x7-v1` for Export;
2. change Export maximum stage ratio to 1.5;
3. include `detailMix` in the planner digest;
4. bind `tensorHandle.fieldTexture` instead of `axialFieldTexture`;
5. fetch `export_ewa_lowpass.wgsl`;
6. use `textureSampleLevel` in the canonical Export lowpass;
7. apply residual on every stage;
8. feed a residual texture into the next stage;
9. write the final stage directly to `rgba8unorm` inside lowpass;
10. report the residual ID as the R6 kernel ID;
11. mutate one lowpass ABI word between Preview and Export;
12. use a role-specific branch in stage dimensions.

Each negative control shall produce a deterministic failure.

---

# 21. Telemetry

The R7 telemetry snapshot shall include at minimum:

```text
previewLowpassChainCount
exportLowpassChainCount
sharedRuntimeInvocationCount
plannerV2PlanCount
plannerRoleDivergenceCount
stageDispatchCount
previewReadbackCount
exportUploadCount
exportIntermediateReadbackCount
exportTerminalReadbackCount
legacyExportLowpassDispatchCount
legacyExportLowpassFetchCount
residualExecutionCount
residualDisabledCount
residualIntermediateAttemptCount
residualFeedbackAttemptCount
finalizationCount
lowpassReceiptMismatchCount
resourceDoubleDestroyCount
```

Source and mock acceptance requires all forbidden counters to equal zero.

---

# 22. Resource and Lifecycle Contract

- Every shared-runtime intermediate texture shall be destroyed exactly once.
- The terminal lowpass texture shall transfer through an explicit ownership handle.
- Residual support textures retained from the final stage shall remain alive until residual completion or explicit skip.
- Retained support textures shall then be released exactly once.
- Export upload texture shall be destroyed after the last consumer completes.
- Final readback buffer shall be mapped and destroyed exactly once.
- Device loss shall invalidate planner-independent pipeline resources and stale ownership handles.
- A residual pass shall validate the same device epoch as its lowpass inputs.
- A finalization pass shall reject a stale lowpass or residual texture.

---

# 23. Active Graph and Asset Admission

The active runtime graph shall admit:

- planner v2;
- shared canonical lowpass runtime;
- R6 generated product shaders already admitted;
- R7 residual shader;
- R7 finalization shader;
- R7 runtime identity manifest if introduced.

The graph shall not admit as canonical runtime assets:

- R7 binary64 oracles;
- R7 negative-control shaders;
- R7 fixtures;
- legacy Export 7×7 lowpass shader;
- legacy recompose shaders as hidden fallback;
- Node-only generators or source gates.

---

# 24. Zero Fallback Contract

R7 shall fail closed instead of selecting:

- CPU resampling;
- Canvas2D resampling;
- WebGL resampling;
- old Export WGSL;
- direct-load reference as product;
- tangent-field fallback when axial field is absent;
- role-specific planner profile;
- v3 or Export 80-byte ABI for canonical lowpass;
- residual-disabled-but-still-dispatched behavior;
- unverified shader text after generated manifest failure.

---

# 25. Stable Errors

The following stable errors are required:

| Code | Meaning |
|---|---|
| `E_R7_PARENT_BUNDLE_IDENTITY_MISMATCH` | Wrong parent bundle |
| `E_R7_PLANNER_ID_MISMATCH` | Planner is not v2 |
| `E_R7_PLANNER_PROFILE_DIVERGED` | Preview and Export selected different profiles |
| `E_R7_PLAN_DIGEST_DIVERGED` | Equal lowpass inputs produced different plans |
| `E_R7_ROLE_FIELD_IN_PLAN` | Caller role entered plan identity |
| `E_R7_RESIDUAL_FIELD_IN_PLAN` | Residual option entered plan identity |
| `E_R7_SHARED_RUNTIME_NOT_USED` | A facade bypassed the shared runtime |
| `E_R7_LEGACY_EXPORT_LOWPASS_ACTIVE` | Old 7×7 lowpass was selected |
| `E_R7_HARDWARE_FILTERED_LOWPASS` | Canonical lowpass used a filtering sampler |
| `E_R7_AXIAL_FIELD_REQUIRED` | Canonical stage lacks R5 axial texture |
| `E_R7_LOW_PASS_ABI_MISMATCH` | Canonical stage did not use v4/96 bytes |
| `E_R7_LOW_PASS_SHADER_IDENTITY_MISMATCH` | Stage shader differs by consumer role |
| `E_R7_RESIDUAL_INTERMEDIATE_FORBIDDEN` | Residual attempted before final stage |
| `E_R7_RESIDUAL_FEEDBACK_FORBIDDEN` | Residual output entered a later lowpass stage |
| `E_R7_RESIDUAL_IDENTITY_COLLISION` | Residual claimed lowpass identity |
| `E_R7_RESIDUAL_ABI_MISMATCH` | Residual ABI is wrong |
| `E_R7_LEGACY_EXPORT_OPTION_AMBIGUOUS` | Canonical and legacy aliases conflict |
| `E_R7_LEGACY_EXPORT_OPTION_UNMAPPABLE` | Legacy option has no explicit mapping |
| `E_R7_INTERMEDIATE_READBACK_FORBIDDEN` | Export mapped a nonterminal stage |
| `E_R7_PREVIEW_READBACK_FORBIDDEN` | Preview requested readback |
| `E_R7_LOW_PASS_RECEIPT_MUTATED` | Residual/finalization altered lowpass receipt |
| `E_R7_STALE_RESOURCE_EPOCH` | Cross-epoch texture use |
| `E_R7_RESOURCE_DOUBLE_DESTROY` | Resource released twice |
| `E_R7_PRODUCTION_POINTER_MUTATION_FORBIDDEN` | Source bake attempted promotion |

---

# 26. Required Source Layout

```text
app/legacy-runtime/core/compute/qmap_webgpu/
  ewa_stage_planner_v2.mjs
  ewa_canonical_lowpass_contract_r7.mjs
  ewa_canonical_lowpass_runtime_r7.mjs
  ewa_convergence_receipt_r7.mjs

app/legacy-runtime/modules/dk_resample/
  export_wgsl_downscale.js
  export_residual_runtime_r7.mjs
  export_finalize_runtime_r7.mjs
  shaders/
    export_detail_residual_r7.wgsl
    export_finalize_rgba8_r7.wgsl

fixtures/resample-runtime-01-r7/
  TDT_RESAMPLE_RUNTIME_01_R7_PLAN_FIXTURES.json
  TDT_RESAMPLE_RUNTIME_01_R7_CONVERGENCE_FIXTURES.json
  TDT_RESAMPLE_RUNTIME_01_R7_NEGATIVE_CONTROLS.json

tools/resample-runtime-01-r7/
  lib.mjs
  generate-fixtures.mjs
  verify-parent.mjs
  verify-planner.mjs
  verify-runtime-wiring.mjs
  verify-residual-separation.mjs
  verify-receipts.mjs
  verify-active-graph.mjs
  runtime-smoke.mjs
  gate.mjs
  finalize.mjs
  run.mjs

artifacts/resample-runtime-01-r7/source-bake/
  TDT_RESAMPLE_RUNTIME_01_R7_PARENT_REPORT.json
  TDT_RESAMPLE_RUNTIME_01_R7_PLANNER_REPORT.json
  TDT_RESAMPLE_RUNTIME_01_R7_RUNTIME_WIRING_REPORT.json
  TDT_RESAMPLE_RUNTIME_01_R7_RESIDUAL_SEPARATION_REPORT.json
  TDT_RESAMPLE_RUNTIME_01_R7_CONVERGENCE_REPORT.json
  TDT_RESAMPLE_RUNTIME_01_R7_GATE_RECEIPT.json
  TDT_RESAMPLE_RUNTIME_01_R7_FINAL_RECEIPT.json
```

Equivalent paths are permitted only if identities and graph admission remain explicit.

---

# 27. Package Scripts

```json
{
  "generate:resample-runtime-01-r7": "node tools/resample-runtime-01-r7/generate-fixtures.mjs",
  "verify:resample-runtime-01-r7:parent": "node tools/resample-runtime-01-r7/verify-parent.mjs",
  "verify:resample-runtime-01-r7:planner": "node tools/resample-runtime-01-r7/verify-planner.mjs",
  "verify:resample-runtime-01-r7:runtime": "node tools/resample-runtime-01-r7/verify-runtime-wiring.mjs",
  "verify:resample-runtime-01-r7:residual": "node tools/resample-runtime-01-r7/verify-residual-separation.mjs",
  "verify:resample-runtime-01-r7:receipts": "node tools/resample-runtime-01-r7/verify-receipts.mjs",
  "smoke:resample-runtime-01-r7": "node tools/resample-runtime-01-r7/runtime-smoke.mjs",
  "gate:resample-runtime-01-r7": "node tools/resample-runtime-01-r7/gate.mjs",
  "finalize:resample-runtime-01-r7": "node tools/resample-runtime-01-r7/finalize.mjs",
  "verify:resample-runtime-01-r7": "node tools/resample-runtime-01-r7/run.mjs"
}
```

`verify:renderer` shall include R6 before R7.

---

# 28. Implementation Sequence

1. Freeze R6 parent identities.
2. Introduce planner v2 and canonical profile.
3. Generate deterministic cross-role dimension fixtures.
4. Introduce the shared lowpass contract and runtime.
5. Delegate Preview/Delta-K to the shared runtime.
6. Delegate Export lowpass to the shared runtime.
7. Remove active fetch and dispatch of the old Export lowpass.
8. Add final-stage-only residual runtime and shader.
9. Add separate finalization shader and terminal readback path.
10. Add compatibility option adapter and conflict rejection.
11. Split lowpass, residual, and finalization receipts.
12. Add telemetry and negative controls.
13. Update Active Graph and runtime asset manifests.
14. Run R1A through R6 regressions in isolated predecessor snapshots.
15. Issue source-bake receipt without promotion.

---

# 29. Source Verification Strategy

Source verification shall inspect:

- frozen parent hashes;
- planner identity and profile count;
- absence of role and residual fields from planner canonical JSON;
- shared runtime import and call sites;
- equal shader URL selection;
- v4 packer use in both facades;
- axial field binding in both facades;
- absence of filtering sampler from canonical lowpass;
- absence of legacy Export lowpass fetch;
- residual final-stage guard;
- residual feedback prohibition;
- separate residual and finalization identities;
- receipt field separation;
- zero forbidden fallback imports;
- active runtime graph closure.

---

# 30. Mock Runtime Strategy

The mock GPU runtime shall record:

- created textures and formats;
- created buffers and sizes;
- shader module labels and digests;
- pipeline labels;
- bind-group resource identities;
- uniform bytes;
- dispatch dimensions;
- command-pass order;
- queue submissions;
- texture ownership transfers;
- resource destruction;
- map/readback attempts.

For equal fixture inputs, Preview and Export mock traces shall match through the terminal lowpass dispatch. Export-only residual, finalization, and readback events shall occur strictly after that boundary.

---

# 31. Fixture Matrix

The deterministic fixture matrix shall include:

- identity dimensions;
- exact 2:1 shrink;
- 3:2 shrink;
- noninteger 1.125×, 1.25×, 1.75× shrink;
- multi-stage 4:1, 8:1, and asymmetric shrink;
- odd source and target dimensions;
- one-pixel axes;
- partial 8×8 workgroups;
- R4 and R6 profile selection cases;
- default and nondefault sharpness/taper;
- coherence zero and one;
- axial sign boundary;
- transparent and opaque source metadata;
- residual disabled;
- residual enabled;
- legacy alias mapping;
- alias conflict;
- cancellation between stages;
- stale device epoch.

Fixture generation shall be deterministic and contain no timestamps, randomness, locale-dependent formatting, or absolute paths.

---

# 32. Physical GPU Deferral

Source-only R7 shall not claim:

- physical WGSL compilation of new residual/finalization shaders;
- bit-exact Preview/Export `rgba16float` texture parity;
- physical residual-disabled identity parity;
- physical timestamp performance;
- packaged Electron asset identity.

Those gates remain `DEFERRED`, not `PASS`.

---

# 33. Promotion and State Rules

The source-baked state may be issued when every mandatory source and mock gate passes:

```text
RESAMPLE_RUNTIME_R7_PREVIEW_EXPORT_LOWPASS_CONVERGED_SOURCE_BAKED_AWAITING_PHYSICAL_GPU
```

The source-verified semantic state is:

```text
RESAMPLE_RUNTIME_R7_CANONICAL_LOWPASS_CONVERGENCE_SEALED_AWAITING_R8
```

Neither state authorizes Production Pointer mutation.

---

# 34. Non-Claims

R7 does not claim:

- that residual output equals Preview output;
- that final encoded bytes equal the Preview texture;
- that residual is part of canonical EWA;
- that all alpha edge cases are promoted;
- that all support clipping cases are eliminated;
- that physical GPU parity was run;
- that Electron packaging was run;
- that performance improved;
- that Production Pointer moved.

---

# 35. Required Bake Artifacts

A complete source bake shall provide:

- this specification and SHA-256 sidecar;
- parent identity report;
- planner v2 fixture report;
- shared-runtime wiring report;
- Export legacy-shader retirement report;
- residual separation report;
- option compatibility report;
- convergence receipt report;
- Active Graph report;
- predecessor regression report;
- gate receipt;
- final receipt;
- changed-file manifest;
- unified diff;
- patched full repository ZIP and SHA-256 sidecar.

---

# 36. Gate Matrix
## R7-001 `PARENT_BUNDLE_IDENTITY`

- **Class:** `MANDATORY`
- **Requirement:** Parent ZIP name and SHA-256 match the sole admitted R6 bundle.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-001` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-002 `R6_SPEC_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 specification digest matches the frozen value.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-002` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-003 `R6_README_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 applied README digest matches the frozen value.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-003` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-004 `R6_KERNEL_CONTRACT_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 kernel contract source remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-004` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-005 `R6_ABI_PACKER_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 v4 ABI packer remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-005` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-006 `R6_PRODUCT_R4_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The generated R4 product shader remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-006` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-007 `R6_PRODUCT_R6_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The generated R6 product shader remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-007` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-008 `R6_REFERENCE_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 direct reference shader remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-008` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-009 `R6_GENERATED_MANIFEST_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R6 generated manifest remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-009` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-010 `R5_AXIAL_SHADER_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R5 axial conversion shader remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-010` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-011 `R5_AXIAL_CONTRACT_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The R5 axial contract source remains byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-011` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-012 `R4_COORDINATE_IDENTITY_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The pixel-center-v2 coordinate identity remains unchanged.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-012` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-013 `R4_TILE_PROOF_IDENTITY_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The phase-aware tile proof identity remains unchanged.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-013` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-014 `R6_KERNEL_IDENTITY_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The canonical lowpass kernel ID is still the R6 identity.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-014` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-015 `R6_ABI_IDENTITY_FROZEN`

- **Class:** `MANDATORY`
- **Requirement:** The canonical lowpass ABI remains v4 and 96 bytes.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-015` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-016 `PLANNER_V2_ID`

- **Class:** `MANDATORY`
- **Requirement:** Planner identity equals tdt.ewa.multistage.planner.v2.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-016` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-017 `PLANNER_V2_VERSION`

- **Class:** `MANDATORY`
- **Requirement:** Planner numeric version equals 2.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-017` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-018 `PLANNER_SINGLE_CANONICAL_PROFILE`

- **Class:** `MANDATORY`
- **Requirement:** Exactly one canonical lowpass planner profile is admitted.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-018` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-019 `PLANNER_PROFILE_ID`

- **Class:** `MANDATORY`
- **Requirement:** The canonical profile ID matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-019` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-020 `PLANNER_RATIO_2_TO_1`

- **Class:** `MANDATORY`
- **Requirement:** Maximum stage ratio is exactly 2:1 per axis.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-020` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-021 `PLANNER_REACH_6`

- **Class:** `MANDATORY`
- **Requirement:** The canonical planner admits R6 reach and no smaller Export-only cap.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-021` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-022 `PLANNER_NO_TERMINAL_EXCEPTION`

- **Class:** `MANDATORY`
- **Requirement:** The legacy Export 3-to-1 terminal exception is absent.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-022` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-023 `PLANNER_SAFE_INTEGER_DIMENSIONS`

- **Class:** `MANDATORY`
- **Requirement:** All dimensions are positive safe integers.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-023` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-024 `PLANNER_NO_UPSCALE`

- **Class:** `MANDATORY`
- **Requirement:** Upscaling remains rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-024` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-025 `PLANNER_STAGE_LIMIT`

- **Class:** `MANDATORY`
- **Requirement:** Stage count limit remains 32.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-025` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-026 `PLANNER_EXACT_TARGET`

- **Class:** `MANDATORY`
- **Requirement:** The final stage dimensions equal the requested target exactly.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-026` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-027 `PLANNER_AXIS_RECURRENCE_X`

- **Class:** `MANDATORY`
- **Requirement:** X dimensions follow max(target, ceil(current/2)).
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-027` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-028 `PLANNER_AXIS_RECURRENCE_Y`

- **Class:** `MANDATORY`
- **Requirement:** Y dimensions follow max(target, ceil(current/2)).
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-028` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-029 `PLANNER_ROLE_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Preview or Export role is absent from canonical planner input.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-029` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-030 `PLANNER_RESIDUAL_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Residual parameters are absent from canonical planner input.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-030` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-031 `PLANNER_FORMAT_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Encoder and output format are absent from canonical planner input.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-031` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-032 `PLANNER_READBACK_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Readback intent is absent from canonical planner input.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-032` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-033 `PLANNER_JOB_ID_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Job ID is absent from the plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-033` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-034 `PLANNER_LOW_PASS_PARAMS_INCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** Canonical lowpass parameter digest is included.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-034` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-035 `PLANNER_KERNEL_CONTRACT_INCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** R6 kernel contract digest is included.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-035` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-036 `PLANNER_COORDINATE_INCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** R4 coordinate identity is included.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-036` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-037 `PLANNER_AXIAL_INCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** R5 axial identity is included.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-037` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-038 `PLANNER_PLAN_DIGEST_REPLAY`

- **Class:** `MANDATORY`
- **Requirement:** Repeated plan construction is byte-identical.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-038` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-039 `PLANNER_PREVIEW_EXPORT_EQUAL`

- **Class:** `MANDATORY`
- **Requirement:** Equal Preview and Export inputs produce equal plan digests.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-039` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-040 `PLANNER_RESIDUAL_SENSITIVITY_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Changing detailMix does not change the plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-040` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-041 `PLANNER_ENCODER_SENSITIVITY_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Changing encoder format does not change the plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-041` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-042 `PLANNER_GEOMETRY_SENSITIVITY`

- **Class:** `MANDATORY`
- **Requirement:** Changing target dimensions changes the plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-042` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-043 `PLANNER_KERNEL_SENSITIVITY`

- **Class:** `MANDATORY`
- **Requirement:** Changing a lowpass parameter changes the plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-043` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-044 `PLANNER_LEGACY_PROFILE_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** Direct use of export-ewa-7x7-v1 is rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-044` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-045 `PLANNER_LEGACY_DELTA_PROFILE_NORMALIZED`

- **Class:** `MANDATORY`
- **Requirement:** Legacy delta profile input cannot create distinct geometry.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-045` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-046 `SHARED_RUNTIME_ID`

- **Class:** `MANDATORY`
- **Requirement:** Shared lowpass runtime identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-046` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-047 `SHARED_STAGE_ID`

- **Class:** `MANDATORY`
- **Requirement:** Canonical stage identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-047` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-048 `SHARED_RUNTIME_SINGLE_IMPLEMENTATION`

- **Class:** `MANDATORY`
- **Requirement:** Only one admitted stage loop implements canonical lowpass.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-048` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-049 `SHARED_RUNTIME_PREVIEW_DELEGATION`

- **Class:** `MANDATORY`
- **Requirement:** Preview facade delegates to the shared runtime.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-049` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-050 `SHARED_RUNTIME_EXPORT_DELEGATION`

- **Class:** `MANDATORY`
- **Requirement:** Export facade delegates to the shared runtime.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-050` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-051 `SHARED_RUNTIME_NO_ROLE_PIXEL_BRANCH`

- **Class:** `MANDATORY`
- **Requirement:** No role branch changes pixel math or shader selection.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-051` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-052 `SHARED_RUNTIME_DEVICE_LEASE`

- **Class:** `MANDATORY`
- **Requirement:** The device lease is validated before dispatch.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-052` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-053 `SHARED_RUNTIME_DEVICE_EPOCH`

- **Class:** `MANDATORY`
- **Requirement:** Every stage validates the current device epoch.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-053` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-054 `SHARED_RUNTIME_CANCELLATION`

- **Class:** `MANDATORY`
- **Requirement:** Cancellation is checked before each stage.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-054` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-055 `SHARED_RUNTIME_STAGE_TEXTURE_FORMAT`

- **Class:** `MANDATORY`
- **Requirement:** Every canonical stage output is rgba16float.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-055` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-056 `SHARED_RUNTIME_STAGE_TENSOR`

- **Class:** `MANDATORY`
- **Requirement:** Every nonidentity stage builds a stage-local tensor.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-056` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-057 `SHARED_RUNTIME_AXIAL_FIELD`

- **Class:** `MANDATORY`
- **Requirement:** Every canonical stage binds axialFieldTexture.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-057` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-058 `SHARED_RUNTIME_NO_TANGENT_FALLBACK`

- **Class:** `MANDATORY`
- **Requirement:** Missing axial field fails closed.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-058` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-059 `SHARED_RUNTIME_PROFILE_SELECTOR`

- **Class:** `MANDATORY`
- **Requirement:** Every stage uses the R6 profile selector.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-059` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-060 `SHARED_RUNTIME_V4_PACKER`

- **Class:** `MANDATORY`
- **Requirement:** Every stage uses the R6 v4 parameter packer.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-060` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-061 `SHARED_RUNTIME_BUFFER_96`

- **Class:** `MANDATORY`
- **Requirement:** Every lowpass uniform buffer is exactly 96 bytes.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-061` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-062 `SHARED_RUNTIME_PHASE_ID`

- **Class:** `MANDATORY`
- **Requirement:** Every stage reports pixel-center-v2.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-062` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-063 `SHARED_RUNTIME_BORDER_ID`

- **Class:** `MANDATORY`
- **Requirement:** Every stage reports logical-distance clamp extension.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-063` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-064 `SHARED_RUNTIME_PRODUCT_SHADER`

- **Class:** `MANDATORY`
- **Requirement:** Every stage selects an R6 generated product shader.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-064` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-065 `SHARED_RUNTIME_NO_REFERENCE_PRODUCT`

- **Class:** `MANDATORY`
- **Requirement:** The direct reference shader cannot be selected as product.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-065` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-066 `SHARED_RUNTIME_DISPATCH_GEOMETRY`

- **Class:** `MANDATORY`
- **Requirement:** Dispatch dimensions derive only from stage output size.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-066` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-067 `SHARED_RUNTIME_INTERMEDIATE_GPU_RESIDENT`

- **Class:** `MANDATORY`
- **Requirement:** Intermediate lowpass textures remain GPU-resident.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-067` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-068 `SHARED_RUNTIME_INTERMEDIATE_DESTROY_ONCE`

- **Class:** `MANDATORY`
- **Requirement:** Consumed intermediate textures are destroyed exactly once.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-068` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-069 `SHARED_RUNTIME_TERMINAL_TRANSFER`

- **Class:** `MANDATORY`
- **Requirement:** Terminal lowpass ownership transfers explicitly.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-069` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-070 `SHARED_RUNTIME_RECEIPT_ROLE_NEUTRAL`

- **Class:** `MANDATORY`
- **Requirement:** Canonical stage receipts contain no consumer-role pixel semantics.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-070` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-071 `SHARED_RUNTIME_PLAN_DIGEST_PROPAGATED`

- **Class:** `MANDATORY`
- **Requirement:** The plan digest appears in the terminal lowpass receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-071` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-072 `SHARED_RUNTIME_PARAM_DIGEST_PROPAGATED`

- **Class:** `MANDATORY`
- **Requirement:** The lowpass parameter digest appears in every stage receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-072` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-073 `SHARED_RUNTIME_SHADER_DIGEST_PROPAGATED`

- **Class:** `MANDATORY`
- **Requirement:** The generated shader digest appears in every stage receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-073` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-074 `SHARED_RUNTIME_IDENTITY_ZERO_STAGE`

- **Class:** `MANDATORY`
- **Requirement:** Identity resize creates zero dispatches and an identity receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-074` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-075 `PREVIEW_PUBLIC_SIGNATURE`

- **Class:** `MANDATORY`
- **Requirement:** Existing runDeltaKStack signatures remain admitted.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-075` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-076 `PREVIEW_RETURN_TEXTURE`

- **Class:** `MANDATORY`
- **Requirement:** Preview continues to return a GPU texture.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-076` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-077 `PREVIEW_SOURCE_OWNERSHIP`

- **Class:** `MANDATORY`
- **Requirement:** Caller source ownership remains preserved.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-077` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-078 `PREVIEW_UPLOAD_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Preview upload count remains zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-078` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-079 `PREVIEW_READBACK_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Preview readback count remains zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-079` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-080 `PREVIEW_INTERMEDIATE_READBACK_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Preview intermediate readback count remains zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-080` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-081 `PREVIEW_RESIDUAL_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Preview residual execution count is zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-081` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-082 `PREVIEW_FINALIZATION_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Preview finalization execution count is zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-082` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-083 `PREVIEW_STAGE_RECEIPT_CANONICAL`

- **Class:** `MANDATORY`
- **Requirement:** Preview stage receipts use the shared schema.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-083` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-084 `PREVIEW_DELTAK_OUTSIDE_LOWPASS`

- **Class:** `MANDATORY`
- **Requirement:** A later Delta-K core is outside the lowpass receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-084` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-085 `PREVIEW_IDENTITY_SOURCE_RETAINED`

- **Class:** `MANDATORY`
- **Requirement:** Identity resize preserves source-retained behavior.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-085` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-086 `EXPORT_PUBLIC_ENTRYPOINTS`

- **Class:** `MANDATORY`
- **Requirement:** Existing Export public entrypoints remain available.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-086` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-087 `EXPORT_RETURN_BYTES`

- **Class:** `MANDATORY`
- **Requirement:** Byte-based Export continues to return Uint8Array.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-087` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-088 `EXPORT_UPLOAD_EXACT_ONE`

- **Class:** `MANDATORY`
- **Requirement:** Byte-based nonidentity Export uploads exactly once.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-088` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-089 `EXPORT_SHARED_LOWPASS_CALL`

- **Class:** `MANDATORY`
- **Requirement:** Export invokes the shared lowpass runtime exactly once per job.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-089` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-090 `EXPORT_STAGE_OUTPUT_PURE_LOWPASS`

- **Class:** `MANDATORY`
- **Requirement:** Every intermediate Export stage is pure canonical lowpass.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-090` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-091 `EXPORT_NO_INTERMEDIATE_RECOMPOSE`

- **Class:** `MANDATORY`
- **Requirement:** No recompose or residual pass runs between lowpass stages.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-091` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-092 `EXPORT_NO_INTERMEDIATE_UNPREMULTIPLY`

- **Class:** `MANDATORY`
- **Requirement:** No unpremultiply occurs between lowpass stages.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-092` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-093 `EXPORT_NO_INTERMEDIATE_QUANTIZE`

- **Class:** `MANDATORY`
- **Requirement:** No intermediate stage writes rgba8unorm.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-093` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-094 `EXPORT_TERMINAL_LOWPASS_RGBA16`

- **Class:** `MANDATORY`
- **Requirement:** The terminal lowpass boundary is rgba16float.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-094` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-095 `EXPORT_TERMINAL_READBACK_ONE`

- **Class:** `MANDATORY`
- **Requirement:** Byte output performs exactly one terminal readback.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-095` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-096 `EXPORT_INTERMEDIATE_READBACK_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Export performs no intermediate readback.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-096` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-097 `EXPORT_LOW_PASS_RECEIPT_CANONICAL`

- **Class:** `MANDATORY`
- **Requirement:** Export lowpass receipt uses the shared schema.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-097` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-098 `EXPORT_LOW_PASS_PLAN_EQUAL_PREVIEW`

- **Class:** `MANDATORY`
- **Requirement:** Equal fixture inputs yield the Preview plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-098` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-099 `EXPORT_LOW_PASS_SHADER_EQUAL_PREVIEW`

- **Class:** `MANDATORY`
- **Requirement:** Equal stages select the same generated shader digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-099` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-100 `EXPORT_LOW_PASS_UNIFORM_EQUAL_PREVIEW`

- **Class:** `MANDATORY`
- **Requirement:** Equal stages pack byte-identical v4 uniforms.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-100` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-101 `EXPORT_LOW_PASS_AXIAL_EQUAL_PREVIEW`

- **Class:** `MANDATORY`
- **Requirement:** Equal stages report the same axial field identity.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-101` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-102 `EXPORT_LEGACY_LOWPASS_FETCH_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Canonical Export fetches no old lowpass WGSL.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-102` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-103 `EXPORT_FILTERING_SAMPLER_LOW_PASS_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Canonical Export lowpass binds no filtering sampler.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-103` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-104 `EXPORT_TEXTURE_SAMPLE_LEVEL_LOW_PASS_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Canonical Export lowpass contains no textureSampleLevel path.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-104` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-105 `EXPORT_LEGACY_ABI_LOW_PASS_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Canonical Export lowpass uses no 80-byte Export ABI.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-105` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-106 `EXPORT_IDENTITY_COPY_CONTRACT`

- **Class:** `MANDATORY`
- **Requirement:** Identity resize preserves public byte-copy semantics.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-106` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-107 `EXPORT_SOURCE_TEXTURE_DESTROY_ONCE`

- **Class:** `MANDATORY`
- **Requirement:** Owned upload texture is destroyed exactly once.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-107` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-108 `EXPORT_TERMINAL_TEXTURE_DESTROY_ONCE`

- **Class:** `MANDATORY`
- **Requirement:** Terminal selected texture is destroyed exactly once after readback.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-108` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-109 `LEGACY_ALIAS_RADIUS_MAP`

- **Class:** `MANDATORY`
- **Requirement:** radiusMul maps explicitly to sigmaMain.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-109` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-110 `LEGACY_ALIAS_SIGMA_MAP`

- **Class:** `MANDATORY`
- **Requirement:** sigma maps explicitly to sigmaCross.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-110` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-111 `LEGACY_ALIAS_CONFLICT_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** Conflicting alias and canonical values are rejected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-111` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-112 `LEGACY_ALIAS_RECEIPT`

- **Class:** `MANDATORY`
- **Requirement:** Every applied alias mapping is recorded.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-112` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-113 `LEGACY_UNMAPPABLE_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** Unmappable legacy lowpass options fail closed.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-113` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-114 `RESIDUAL_ID`

- **Class:** `MANDATORY`
- **Requirement:** Residual identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-114` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-115 `RESIDUAL_ABI_ID`

- **Class:** `MANDATORY`
- **Requirement:** Residual ABI identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-115` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-116 `RESIDUAL_ABI_BYTES`

- **Class:** `MANDATORY`
- **Requirement:** Residual ABI is exactly 64 bytes.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-116` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-117 `RESIDUAL_RESERVED_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Residual reserved ABI words are zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-117` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-118 `RESIDUAL_FINAL_STAGE_ONLY`

- **Class:** `MANDATORY`
- **Requirement:** Residual may run only after the complete lowpass chain.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-118` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-119 `RESIDUAL_EXECUTION_COUNT`

- **Class:** `MANDATORY`
- **Requirement:** Residual execution count is zero or one.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-119` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-120 `RESIDUAL_DISABLED_DETAIL_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** detailMix zero skips residual dispatch exactly.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-120` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-121 `RESIDUAL_DISABLED_LOW_PASS_IDENTITY`

- **Class:** `MANDATORY`
- **Requirement:** Disabled residual selects the lowpass texture unchanged.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-121` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-122 `RESIDUAL_NO_INTERMEDIATE_INPUT`

- **Class:** `MANDATORY`
- **Requirement:** No intermediate stage may consume a residual output.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-122` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-123 `RESIDUAL_FEEDBACK_GUARD`

- **Class:** `MANDATORY`
- **Requirement:** Runtime rejects residual feedback into lowpass.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-123` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-124 `RESIDUAL_SEPARATE_PARAM_DIGEST`

- **Class:** `MANDATORY`
- **Requirement:** Residual has a separate parameter digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-124` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-125 `RESIDUAL_SEPARATE_SHADER_DIGEST`

- **Class:** `MANDATORY`
- **Requirement:** Residual has a separate shader digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-125` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-126 `RESIDUAL_SEPARATE_RECEIPT`

- **Class:** `MANDATORY`
- **Requirement:** Residual has a separate receipt object.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-126` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-127 `RESIDUAL_NO_KERNEL_ID_COLLISION`

- **Class:** `MANDATORY`
- **Requirement:** Residual identity differs from the R6 lowpass kernel ID.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-127` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-128 `RESIDUAL_LOW_PASS_RECEIPT_IMMUTABLE`

- **Class:** `MANDATORY`
- **Requirement:** Residual cannot mutate the lowpass receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-128` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-129 `RESIDUAL_OUTPUT_RGBA16`

- **Class:** `MANDATORY`
- **Requirement:** Residual output is rgba16float.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-129` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-130 `RESIDUAL_SOURCE_HANDLE_RETENTION`

- **Class:** `MANDATORY`
- **Requirement:** Final-stage source handle is retained explicitly when needed.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-130` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-131 `RESIDUAL_AXIAL_HANDLE_RETENTION`

- **Class:** `MANDATORY`
- **Requirement:** Final-stage axial handle is retained explicitly when needed.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-131` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-132 `RESIDUAL_STALE_EPOCH_REJECT`

- **Class:** `MANDATORY`
- **Requirement:** Residual rejects stale source or axial resources.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-132` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-133 `RESIDUAL_RESOURCE_RELEASE_ONCE`

- **Class:** `MANDATORY`
- **Requirement:** Residual support resources are released exactly once.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-133` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-134 `RESIDUAL_DEFAULT_SHARPNESS_SCOPED`

- **Class:** `MANDATORY`
- **Requirement:** Historical 2.1 sharpness is scoped to residual only.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-134` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-135 `RESIDUAL_PARAMS_EXCLUDED_PLAN`

- **Class:** `MANDATORY`
- **Requirement:** Residual parameters do not enter the lowpass plan digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-135` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-136 `FINALIZATION_ID`

- **Class:** `MANDATORY`
- **Requirement:** Finalization identity matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-136` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-137 `FINALIZATION_AFTER_RESIDUAL`

- **Class:** `MANDATORY`
- **Requirement:** Finalization runs after residual or explicit residual skip.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-137` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-138 `FINALIZATION_INPUT_RECEIPT`

- **Class:** `MANDATORY`
- **Requirement:** Finalization records its selected input receipt digest.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-138` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-139 `FINALIZATION_OUTPUT_RGBA8`

- **Class:** `MANDATORY`
- **Requirement:** Byte Export finalization writes rgba8unorm.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-139` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-140 `FINALIZATION_LOW_PASS_RECEIPT_IMMUTABLE`

- **Class:** `MANDATORY`
- **Requirement:** Finalization cannot mutate the lowpass receipt.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-140` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-141 `CONVERGENCE_RECEIPT_SCHEMA`

- **Class:** `MANDATORY`
- **Requirement:** Convergence receipt schema ID matches the specification.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-141` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-142 `CONVERGENCE_RECEIPT_LOW_PASS_FIELDS`

- **Class:** `MANDATORY`
- **Requirement:** All canonical lowpass identities are present.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-142` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-143 `CONVERGENCE_RECEIPT_RESIDUAL_SEPARATE`

- **Class:** `MANDATORY`
- **Requirement:** Residual status is nested separately.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-143` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-144 `CONVERGENCE_RECEIPT_FINALIZATION_SEPARATE`

- **Class:** `MANDATORY`
- **Requirement:** Finalization status is nested separately.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-144` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-145 `CONVERGENCE_RECEIPT_PREVIEW_EXPORT_MATCH`

- **Class:** `MANDATORY`
- **Requirement:** Equal fixtures match on all lowpass fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-145` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-146 `CONVERGENCE_RECEIPT_ROLE_ENVELOPE`

- **Class:** `MANDATORY`
- **Requirement:** Ownership and delivery differences remain outside canonical fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-146` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-147 `PARITY_SURFACE_RGBA16`

- **Class:** `MANDATORY`
- **Requirement:** The declared parity surface is pre-residual rgba16float.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-147` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-148 `PARITY_STAGE_BY_STAGE`

- **Class:** `MANDATORY`
- **Requirement:** Parity evidence is stage-by-stage, not final-frame-only.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-148` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-149 `PARITY_EXCLUDES_RESIDUAL`

- **Class:** `MANDATORY`
- **Requirement:** Residual output is excluded from canonical lowpass parity.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-149` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-150 `PARITY_EXCLUDES_QUANTIZATION`

- **Class:** `MANDATORY`
- **Requirement:** Final rgba8 quantization is excluded from lowpass parity.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-150` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-151 `NEGATIVE_LEGACY_PROFILE_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** The legacy Export profile negative control fails.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-151` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-152 `NEGATIVE_FILTERED_TAP_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** A filtering-sampler lowpass negative control fails.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-152` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-153 `NEGATIVE_TANGENT_FIELD_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** A tangent-field binding negative control fails.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-153` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-154 `NEGATIVE_INTERMEDIATE_RESIDUAL_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Intermediate residual negative control fails.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-154` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-155 `NEGATIVE_RESIDUAL_FEEDBACK_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** Residual feedback negative control fails.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-155` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-156 `NEGATIVE_ABI_WORD_DIVERGENCE_DETECTED`

- **Class:** `MANDATORY`
- **Requirement:** One differing ABI word is detected.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-156` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-157 `TELEMETRY_FORBIDDEN_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** All forbidden telemetry counters are zero.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-157` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-158 `ACTIVE_GRAPH_SHARED_RUNTIME`

- **Class:** `MANDATORY`
- **Requirement:** The shared runtime is admitted by Active Graph.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-158` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-159 `ACTIVE_GRAPH_RESIDUAL`

- **Class:** `MANDATORY`
- **Requirement:** The R7 residual shader is admitted.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-159` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-160 `ACTIVE_GRAPH_FINALIZATION`

- **Class:** `MANDATORY`
- **Requirement:** The R7 finalization shader is admitted.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-160` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-161 `ACTIVE_GRAPH_LEGACY_LOWPASS_EXCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** Legacy Export lowpass is not admitted canonically.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-161` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-162 `ACTIVE_GRAPH_TOOLS_EXCLUDED`

- **Class:** `MANDATORY`
- **Requirement:** R7 tools and fixtures are outside runtime graph.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-162` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-163 `NO_CPU_FALLBACK`

- **Class:** `MANDATORY`
- **Requirement:** No CPU resampling fallback is reachable.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-163` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-164 `NO_CANVAS_WEBGL_FALLBACK`

- **Class:** `MANDATORY`
- **Requirement:** No Canvas or WebGL resampling fallback is reachable.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-164` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-165 `NO_REFERENCE_AS_PRODUCT`

- **Class:** `MANDATORY`
- **Requirement:** Reference shader cannot become product.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-165` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-166 `NO_PRODUCTION_POINTER_MUTATION`

- **Class:** `MANDATORY`
- **Requirement:** Production Pointer remains unchanged.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-166` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-167 `RESOURCE_DOUBLE_DESTROY_ZERO`

- **Class:** `MANDATORY`
- **Requirement:** Mock runtime observes zero double destroys.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-167` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-168 `DETERMINISTIC_FIXTURES`

- **Class:** `MANDATORY`
- **Requirement:** Fixture generation is byte-deterministic.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-168` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-169 `DETERMINISTIC_RECEIPTS`

- **Class:** `MANDATORY`
- **Requirement:** Source receipts contain no volatile fields.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-169` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-170 `PREDECESSOR_R1A_R6_REGRESSION`

- **Class:** `MANDATORY`
- **Requirement:** R1A through R6 gates pass in isolated predecessor snapshots.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-170` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-171 `SOURCE_RECEIPT_COMPLETE`

- **Class:** `MANDATORY`
- **Requirement:** The source receipt contains every mandatory gate result.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-171` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-172 `FINAL_STATE_CORRECT`

- **Class:** `MANDATORY`
- **Requirement:** Final source state equals the specified R7 state.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-172` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-173 `PHYSICAL_WGSL_COMPILE`

- **Class:** `DEFERRED`
- **Requirement:** Physical WebGPU compilation of R7 residual and finalization shaders succeeds.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-173` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-174 `PHYSICAL_STAGE_TEXTURE_PARITY`

- **Class:** `DEFERRED`
- **Requirement:** Preview and Export canonical rgba16float stage textures match on physical GPU.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-174` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-175 `PHYSICAL_RESIDUAL_DISABLED_IDENTITY`

- **Class:** `DEFERRED`
- **Requirement:** Residual-disabled Export finalization consumes the exact lowpass texture on physical GPU.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-175` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-176 `PHYSICAL_TIMESTAMP_AND_MEMORY`

- **Class:** `DEFERRED`
- **Requirement:** Timestamp and residency observations satisfy the later physical gate.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-176` shall record status, evidence paths, observed values, and stable error code when applicable.

## R7-177 `PACKAGED_ELECTRON_IDENTITY`

- **Class:** `DEFERRED`
- **Requirement:** Packaged Electron contains and executes the admitted R7 assets.
- **PASS:** Deterministic evidence satisfies the requirement without fallback or undeclared mutation.
- **FAIL:** The requirement is false, missing, ambiguous, or satisfied by a forbidden path.
- **Receipt:** `R7-177` shall record status, evidence paths, observed values, and stable error code when applicable.

---

# 37. Final Acceptance Contract

R7 source acceptance requires:

```text
mandatory gate count = 172
mandatory PASS       = 172
mandatory FAIL       = 0
deferred gate count  = 5
Production Pointer   = unchanged
```

The final receipt shall state:

```text
RESAMPLE_RUNTIME_R7_CANONICAL_LOWPASS_CONVERGENCE_SEALED_AWAITING_R8
```

It shall also state, without euphemism:

```text
physical WebGPU parity not yet promoted
packaged Electron identity not yet promoted
residual output is not canonical EWA lowpass
final rgba8 bytes are not the canonical parity surface
```

Acceptance means that Preview and Export now possess one source-level and mock-runtime canonical lowpass authority. It does not mean that their final visible or encoded outputs are identical when Export residual or finalization is enabled.

---

# 38. Compact Implementation Checklist

```text
[ ] Verify R6 parent ZIP digest.
[ ] Freeze R6 kernel, ABI, axial, coordinate, and generated assets.
[ ] Add planner v2 with one canonical support profile.
[ ] Remove role, residual, encoder, and readback fields from plan identity.
[ ] Add shared canonical lowpass runtime.
[ ] Delegate Preview/Delta-K facade.
[ ] Delegate Export lowpass facade.
[ ] Bind R5 axial texture in Export.
[ ] Use R6 generated product shaders in Export.
[ ] Use 96-byte ABI v4 in Export.
[ ] Retire active legacy 7×7 Export lowpass.
[ ] Keep intermediate Export stages pure lowpass.
[ ] Add final-stage-only residual identity and ABI.
[ ] Add separate rgba16 residual output.
[ ] Add separate finalization and terminal readback boundary.
[ ] Split lowpass, residual, and finalization receipts.
[ ] Add role-neutral convergence receipts.
[ ] Add negative controls for every old divergence.
[ ] Update Active Graph and asset manifests.
[ ] Run R1A through R6 regressions in isolated snapshots.
[ ] Issue 172 PASS / 5 DEFERRED / 0 FAIL source receipt.
[ ] Do not move Production Pointer.
```

---

# 39. Next Authority

The next patch authority is:

```text
TDT-RESAMPLE-RUNTIME-01-R8

Unclipped Support /
Alpha·Border·DC Conservation /
Zero Silent Degradation Seal
```

R8 shall operate on the converged canonical lowpass runtime established by R7. It shall not reopen split Preview and Export lowpass implementations.
