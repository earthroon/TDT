# TDT-RESAMPLE-RUNTIME-01-R6

## Kernel ABI v4 / Sharpness·Taper·Border SSOT / Generated WGSL Kernel Identity Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R6`
- **Parent:** `TDT-RESAMPLE-RUNTIME-01-R5`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R5_AXIAL_TENSOR_INTERPOLATION_SUBPIXEL_DIRECTION_CONTINUITY_DOUBLE_ANGLE_FIELD_SAMPLING_COHERENCE_EDGE_PHASE_CONTINUITY_BAKED_AWAITING_PHYSICAL_GPU.zip`
- **Parent repository bundle SHA-256:** `6b6d7e403d4d289c43c28956b74df5c272da7138055fd180df671a5a5298fa63`
- **Predecessor source state:** `RESAMPLE_RUNTIME_R5_AXIAL_SUBPIXEL_CONTINUITY_SEALED_AWAITING_R6`
- **Target source state:** `RESAMPLE_RUNTIME_R6_KERNEL_ABI_V4_GENERATED_SOURCE_BAKED_AWAITING_PHYSICAL_GPU`
- **Target source-verified state:** `RESAMPLE_RUNTIME_R6_KERNEL_CONTRACT_SEALED_AWAITING_R7`
- **Physical GPU state:** `RESAMPLE_RUNTIME_R6_PHYSICAL_GPU_EVIDENCE_DEFERRED_TO_R9`
- **Promotion authority:** none
- **Production Pointer mutation:** forbidden
- **Canonical source runtime mutation:** required and versioned
- **Parent R5 shader mutation:** forbidden
- **Parent R5 axial field mutation:** forbidden
- **Parent R4 coordinate and tile proof mutation:** forbidden
- **Parent R3 oracle mutation:** forbidden
- **Public EWA facade replacement:** forbidden
- **Canonical EWA parameter ABI:** `tdt.delta-k-ewa.params.v4`
- **Canonical EWA parameter ABI version:** `0x0001000e`
- **Canonical EWA parameter byte size:** `96`
- **Legacy predecessor ABI:** `tdt.delta-k-ewa.params.v3`
- **Legacy predecessor ABI byte size:** `80`
- **Canonical source coordinate convention:** `tdt.ewa.source-lattice.pixel-center-v2`
- **Canonical phase convention enum:** `2`
- **Canonical border semantic:** `tdt.ewa.border.clamp-extension-logical-distance-v1`
- **Canonical border enum:** `1`
- **Canonical kernel identity:** `tdt.ewa.ellipse.phase-correct-parametric-r6.v1`
- **Canonical kernel contract identity:** `tdt.ewa.kernel-contract.r6.v1`
- **Canonical source generator identity:** `tdt.ewa.wgsl-generator.r6.v1`
- **Canonical generated manifest identity:** `tdt.ewa.generated-shader-manifest.r6.v1`
- **Canonical radial function:** `exp(-kernelSharpness * q)`
- **Canonical taper function:** `pow(max(0, 1 - q), kernelTaperExponent)`
- **Default kernel sharpness:** `1.65`
- **Default kernel taper exponent:** `1.0`
- **Primary runtime:** WebGPU/WGSL
- **Generator runtime:** Node.js build and validation realm only
- **Independent kernel oracle runtime:** Node.js binary64 validation realm only
- **Runtime CPU EWA fallback:** forbidden
- **Runtime generated-source execution:** required
- **Hand-edited canonical WGSL:** forbidden
- **Physical GPU parity claim in source-only bake:** forbidden
- **Packaged Electron claim in source-only bake:** forbidden

---

# 0. Executive Contract

R6 shall turn the EWA kernel from a duplicated literal implementation into a versioned runtime contract.

R5 repaired axial tensor interpolation and preserved the R4 continuous source lattice. The canonical R5 product, validation, and direct-load reference shaders still contain a duplicated radial weight expression:

```text
exp(-1.65 * q) * max(0, 1 - q)
```

The public request normalizer already accepts `kernelSharpness`, but the v3 parameter packer does not serialize it. The WGSL shaders therefore ignore the normalized request value and execute the hard-coded value `1.65`. Taper is fixed implicitly to exponent `1.0`. Border behavior is implemented through repeated clamp helpers, but there is no ABI field that proves which border semantic was packed and consumed.

This is not only a configurability defect. It creates five independent sources of semantic drift:

1. JavaScript request normalization can accept a value that the GPU never receives.
2. Product and reference shaders can be edited independently while still appearing equivalent by name.
3. Validation shaders can validate a different weight function from the product.
4. Border clamping can move from fetch-only behavior into distance calculation without changing an external identity.
5. A shader can be manually patched after generation without invalidating the runtime bundle identity.

R6 shall replace that arrangement with one canonical kernel contract, one ABI v4 schema, one deterministic WGSL generator, one generated-output digest manifest, and one runtime identity chain.

The ABI v4 extension shall preserve all v3 offsets from byte `0` through byte `63`. The new kernel contract occupies bytes `64` through `79`. Stage and dispatch metadata move as one four-word block to bytes `80` through `95`.

The authoritative v4 layout is:

```text
byte  0  inSize                 vec2<u32>
byte  8  outSize                vec2<u32>
byte 16  srcPerDst              vec2<f32>
byte 24  dstPerSrc              vec2<f32>
byte 32  sigmaMain              f32
byte 36  sigmaCross             f32
byte 40  maxAnisotropy          f32
byte 44  maxSampleReach         f32
byte 48  edgeLow                f32
byte 52  edgeHigh               f32
byte 56  minorCoverageFactor    f32
byte 60  coherenceExponent      f32
byte 64  kernelSharpness        f32
byte 68  kernelTaperExponent    f32
byte 72  phaseConvention        u32
byte 76  borderMode             u32
byte 80  stageIndex             u32
byte 84  stageCount             u32
byte 88  flags                  u32
byte 92  abiVersion             u32
byte 96  end
```

The authoritative support rule remains:

```text
if q > 1:
    weight = 0
else:
    radial = exp(-kernelSharpness * q)
    taper  = pow(max(0, 1 - q), kernelTaperExponent)
    weight = radial * taper
```

Changing sharpness or taper shall not change the compact support boundary. The R4 reach selector and shared-tile coverage proof therefore remain authoritative and unchanged.

The authoritative border semantic is `clamp-extension-logical-distance`:

```text
logicalSampleCoord = base + integerOffset
delta              = logicalSampleCoord - p
fetchCoord          = clamp(logicalSampleCoord, 0, sourceSize - 1)
q                   = ellipseDistance(delta)
sample              = textureLoad(source, fetchCoord)
```

The clamped fetch coordinate shall never replace the logical sample coordinate in `delta`. Multiple logical samples may fetch the same edge texel, but they retain distinct distances and weights.

The phase convention field is not a user-selectable resampling mode in R6. It is an in-band ABI assertion that the packer and shader agree on `tdt.ewa.source-lattice.pixel-center-v2`. The only admitted numeric value is `2`. The only admitted border mode is `1`.

R6 shall generate all canonical product, validation, and reference WGSL assets from deterministic templates and canonical fragments. Generated assets shall carry a machine-readable header containing the generator ID, kernel contract ID, parameter ABI ID, role, profile, contract digest, template digest, and output digest placeholder or companion manifest entry. Manual edits shall be detected by regeneration and digest comparison.

R6 shall prove all of the following:

1. The R5 predecessor bundle and frozen assets match their admitted digests.
2. R4 source-lattice and tile-coverage identities remain unchanged.
3. R5 axial field and interpolation identities remain unchanged.
4. ABI v4 is exactly 96 bytes and follows the normative offset table.
5. The first 64 bytes preserve the v3 semantic offsets.
6. Sharpness and taper are finite, range-checked, packed, and consumed by WGSL.
7. Phase and border enums are packed and checked before dispatch.
8. Default v4 parameters reproduce the R5 kernel function.
9. Non-default sharpness and taper alter the intended impulse response.
10. Constant input remains invariant after normalized weighted accumulation.
11. Border clamping affects fetch coordinates only.
12. Product, validation, and reference embed byte-identical generated ABI, weight, and border fragments.
13. Role-specific memory access remains independent.
14. Runtime shader assets are generated outputs, not templates.
15. Templates and generators remain outside the renderer runtime graph.
16. Regeneration is deterministic and byte-identical.
17. A one-byte generated-output mutation is detected.
18. A template mutation without regeneration is detected.
19. A contract mutation without manifest refresh is detected.
20. Runtime cache and pipeline identities include ABI, kernel, phase, border, generator, and output digests.
21. Receipts report effective parameter values and generated shader identities.
22. No CPU, Canvas, WebGL, reference-as-product, or legacy-v3 canonical fallback is introduced.
23. No Production Pointer is moved.
24. Source-only receipts do not claim physical GPU or packaged execution.
25. R7 remains responsible for Preview and Export lowpass convergence.

The intended transition is:

```text
R5 axial subpixel field sealed
    ↓
ABI v4 schema and strict packer
    ↓
kernel and border SSOT contract
    ↓
deterministic WGSL generation
    ↓
generated-output identity manifest
    ↓
canonical runtime binding and receipts
    ↓
source and mock verification
    ↓
physical GPU proof remains deferred to R9
```

R6 is a kernel-contract and source-identity patch. It is not a production promotion patch.

---

# 1. Parent Truth and Frozen Evidence

## 1.1 Parent bundle identity

The only admitted R6 parent is:

```text
61_TDT_RESAMPLE_RUNTIME_01_R5_AXIAL_TENSOR_INTERPOLATION_SUBPIXEL_DIRECTION_CONTINUITY_DOUBLE_ANGLE_FIELD_SAMPLING_COHERENCE_EDGE_PHASE_CONTINUITY_BAKED_AWAITING_PHYSICAL_GPU.zip
```

with SHA-256:

```text
6b6d7e403d4d289c43c28956b74df5c272da7138055fd180df671a5a5298fa63
```

Any other parent shall fail with `E_R6_PARENT_BUNDLE_IDENTITY_MISMATCH`.

## 1.2 Frozen R5 assets

The following predecessor assets shall remain byte-identical:

| Asset | Parent SHA-256 |
|---|---|
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r5.wgsl` | `7e2bc7b8f1daa181bf6bc13754b664d11a71a8cdb564745d8b7d652c5f333e52` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r5.wgsl` | `a40bea61442074b0a19bfad3ab96c8a21b436119c41832243e0049601d5c205d` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r5.wgsl` | `b0aeb90dca2a076d293e2907b91c541000258bb1784a50ce6261ea9e49f68535` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r5.wgsl` | `8c85b53f78e4880f9ad03264478d184b7bab582cc2586b93fdbc9bcafcf7b6fd` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v4_r5.wgsl` | `4f8a4574ff9ad5fb0f5eeaad5e687e8d83d1639698f4d90ba4c146568d2bfd5b` |
| `app/legacy-runtime/core/compute/qmap_webgpu/shaders/structure_tensor_axial_r5.wgsl` | `2f00744b42416f0730682bdf397bca3fc05fce3d5dc10a2d2e27f32563725bca` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params_v3.mjs` | `7a46125442b519bd7b65b98b319260b1b7fcce5b46e98a4632f73d795accdc62` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r4.mjs` | `008c48ed1e326952ec42b0e7f101957759f17942a364b2a6241fa1156aa3536a` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_axial_contract_r5.mjs` | `80d49122501f83157c76107a78365079cab53061a61d0693cadadefe570b2705` |
| `app/legacy-runtime/core/compute/qmap_webgpu/ewa_parity_runtime_r5.mjs` | `582b68cea539e8a9c13811d81d3bbc2c1a6be6c3c8489e7d0fbcb8cc1ca76e3b` |
| `specs/TDT-RESAMPLE-RUNTIME-01-R5_AXIAL_TENSOR_INTERPOLATION_SUBPIXEL_DIRECTION_CONTINUITY_DOUBLE_ANGLE_FIELD_SAMPLING_COHERENCE_EDGE_PHASE_CONTINUITY_SEAL_SPEC.md` | `7d614934b3b688ee327c10eadfad2fc116ebda977d562a2ef939fea3b40a4c22` |
| `README_TDT_RESAMPLE_RUNTIME_01_R5_APPLIED.md` | `1333c1645c3ab8f99fb6907e68ba8db82363ff8a7ef40c0aa82eb8ac79f193fd` |

The R5 shader family remains historical evidence. R6 shall add new versioned generated assets rather than overwrite these files.

## 1.3 Allowed canonical runtime mutations

The following central adapters may change because they must select ABI v4 and R6 generated assets:

- `app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs`
- runtime asset manifests and Active Graph generated files
- `package.json` scripts

Their parent digests shall be recorded before mutation. Their R6 output digests shall be recorded in the changed-file manifest.

## 1.4 Forbidden predecessor rewrites

R6 shall not rewrite:

- R3 binary64 fractional-phase oracle
- R4 coordinate model or tile proof
- R5 axial conversion shader
- R5 axial interpolation oracle
- R5 product, validation, or reference shaders
- v3 packer
- prior source gate receipts
- prior applied README files

Predecessor gate execution shall occur in an isolated snapshot or shall restore all historical evidence byte-for-byte after execution.

---

# 2. Problem Statement

## 2.1 Dead normalized parameter

`normalizeDeltaKStackRequest()` accepts:

```text
kernelSharpness: finiteRange(input.kernelSharpness, 1.65, 0.25, 4.0)
```

The v3 packer allocates only 80 bytes and contains no sharpness slot. All R5 canonical shaders use the literal `1.65`. The normalized value is therefore dead configuration.

R6 shall make a request-level sharpness change observable in the packed byte sequence, parameter digest, runtime receipt, and GPU weight function.

## 2.2 Implicit taper

R5 multiplies by `max(0, 1 - q)`, which is equivalent to taper exponent `1.0`. The exponent is neither named nor versioned. R6 shall make taper explicit and shall preserve `1.0` as the default.

## 2.3 Repeated border semantics

Source color loads and axial-neighbor loads clamp coordinates in separate manually maintained functions. The correct contract is fetch-only clamp with logical-distance preservation. R6 shall give this contract a stable identity and in-band enum.

## 2.4 Duplicated shader kernels

Product R4, product R6, validation R4, validation R6, and reference each contain manually duplicated declarations and kernel functions. Textual similarity is not authority. A later edit can change one role without a generator or manifest failure.

## 2.5 ABI ambiguity

A pipeline can be compiled with one uniform size while a caller writes a different layout. Bind-group size validation is not a semantic ABI proof. R6 shall include exact ABI identity in the bundle, cache key, generated shader manifest, packer, and receipt.

## 2.6 Shared-error risk

Generated product and reference shaders shall share the canonical kernel fragment, but they shall not share memory-access implementation. This deliberately removes kernel-formula drift while preserving an independent direct-load reference path for tile-access validation.

---

# 3. Scope

## 3.1 In scope

- parameter ABI v4 schema and packer
- sharpness and taper normalization
- phase and border enum normalization
- kernel contract SSOT
- deterministic WGSL source generation
- versioned generated R4 and R6 product shaders
- versioned generated R4 and R6 validation shaders
- versioned generated direct-load reference shader
- generated-output manifest and digests
- runtime bundle selection and cache identities
- parameter receipts
- independent binary64 kernel oracle
- generator mutation negative controls
- Active Graph and runtime asset admission
- predecessor regressions

## 3.2 Out of scope

- changing the R4 continuous source lattice
- changing R4 support reach or tile dimensions
- changing R5 axial conversion or interpolation
- adding new border modes
- adding mirror, wrap, transparent, or constant border sampling
- changing adaptive policy semantics
- changing ellipse major/minor construction
- changing Preview presenter
- changing Export lowpass implementation
- physical GPU performance promotion
- packaged Electron promotion
- Production Pointer movement

## 3.3 Deferred authority

Preview and Export lowpass convergence belongs to `TDT-RESAMPLE-RUNTIME-01-R7`.

Support clipping and alpha/DC conservation hardening beyond the R6 kernel contract belongs to `TDT-RESAMPLE-RUNTIME-01-R8`.

Physical GPU proof belongs to `TDT-RESAMPLE-RUNTIME-01-R9`.

---

# 4. Non-Breakage Contract

R6 shall preserve:

1. the public `runDeltaKStack()` facade and return shape;
2. legacy positional call normalization;
3. canonical object call normalization;
4. source and output dimension rules;
5. multistage planning;
6. R4 coordinate convention;
7. R4 tile proof and reach selection;
8. R5 axial texture production and ownership;
9. adaptive policy bindings;
10. `rgba16float` intermediate surfaces;
11. zero intermediate image readback;
12. device epoch and loss recovery;
13. cancellation behavior;
14. legacy v2 noncanonical path isolation;
15. public default visual output under v4 default kernel parameters.

R6 shall not silently map an invalid v4 request to v3. Canonical v3 fallback is forbidden.

---

# 5. Authority and Identity Model

The R6 authority chain is:

```text
kernel contract object
    ↓
ABI schema object
    ↓
generator source plus role templates
    ↓
generated WGSL outputs
    ↓
generated output manifest
    ↓
runtime asset manifest and Active Graph
    ↓
pipeline bundle identity
    ↓
parameter digest and execution receipt
```

No downstream layer may invent a default that is absent from the kernel contract object.

The canonical identities are:

```text
ABI ID                 tdt.delta-k-ewa.params.v4
ABI version            0x0001000e
ABI byte length        96
kernel contract ID     tdt.ewa.kernel-contract.r6.v1
kernel ID              tdt.ewa.ellipse.phase-correct-parametric-r6.v1
generator ID           tdt.ewa.wgsl-generator.r6.v1
manifest ID            tdt.ewa.generated-shader-manifest.r6.v1
phase ID               tdt.ewa.source-lattice.pixel-center-v2
phase enum             2
border ID              tdt.ewa.border.clamp-extension-logical-distance-v1
border enum            1
```

A receipt that omits any one of these identities is incomplete.

---

# 6. Kernel ABI v4 Layout

## 6.1 Normative WGSL structure

```wgsl
struct Params {
  inSize: vec2<u32>,
  outSize: vec2<u32>,
  srcPerDst: vec2<f32>,
  dstPerSrc: vec2<f32>,
  sigmaMain: f32,
  sigmaCross: f32,
  maxAnisotropy: f32,
  maxSampleReach: f32,
  edgeLow: f32,
  edgeHigh: f32,
  minorCoverageFactor: f32,
  coherenceExponent: f32,
  kernelSharpness: f32,
  kernelTaperExponent: f32,
  phaseConvention: u32,
  borderMode: u32,
  stageIndex: u32,
  stageCount: u32,
  flags: u32,
  abiVersion: u32,
};
```

The structure shall occupy exactly 96 bytes under WGSL uniform layout rules.

## 6.2 Normative JavaScript schema

```js
export const EWA_V4_ABI_SCHEMA = Object.freeze({
  abiId: 'tdt.delta-k-ewa.params.v4',
  abiVersion: 0x0001000e,
  byteLength: 96,
  fields: Object.freeze([
    ['inSize', 'vec2<u32>', 0],
    ['outSize', 'vec2<u32>', 8],
    ['srcPerDst', 'vec2<f32>', 16],
    ['dstPerSrc', 'vec2<f32>', 24],
    ['sigmaMain', 'f32', 32],
    ['sigmaCross', 'f32', 36],
    ['maxAnisotropy', 'f32', 40],
    ['maxSampleReach', 'f32', 44],
    ['edgeLow', 'f32', 48],
    ['edgeHigh', 'f32', 52],
    ['minorCoverageFactor', 'f32', 56],
    ['coherenceExponent', 'f32', 60],
    ['kernelSharpness', 'f32', 64],
    ['kernelTaperExponent', 'f32', 68],
    ['phaseConvention', 'u32', 72],
    ['borderMode', 'u32', 76],
    ['stageIndex', 'u32', 80],
    ['stageCount', 'u32', 84],
    ['flags', 'u32', 88],
    ['abiVersion', 'u32', 92],
  ]),
});
```

## 6.3 Prefix preservation

Bytes `0..63` shall preserve the exact semantic offsets of v3. R6 may not reorder, reinterpret, or repack those fields.

## 6.4 Tail relocation

The v3 stage metadata at bytes `64..79` shall move to bytes `80..95`. This is an ABI break and therefore requires a new ID and new pipeline family. A v3 buffer shall never be bound to an R6 canonical pipeline.

## 6.5 No implicit padding contract

The packer shall allocate exactly 96 bytes. It shall not rely on a larger buffer, dynamic-offset padding, or trailing zeros as an ABI compatibility mechanism.

---

# 7. Parameter Normalization and Packing

## 7.1 Sharpness

Canonical request field:

```text
kernelSharpness
```

Default:

```text
1.65
```

Admitted range:

```text
0.25 <= kernelSharpness <= 4.0
```

Nonfinite or out-of-range values shall fail before any GPU resource allocation.

## 7.2 Taper exponent

Canonical request field:

```text
kernelTaperExponent
```

Admitted legacy alias:

```text
taperExponent
```

Default:

```text
1.0
```

Admitted range:

```text
0.25 <= kernelTaperExponent <= 4.0
```

If canonical and alias fields are both present with unequal values, normalization shall fail with `E_R6_AMBIGUOUS_KERNEL_ALIAS`.

## 7.3 Phase convention

The normalized request shall carry:

```text
phaseConventionId = tdt.ewa.source-lattice.pixel-center-v2
phaseConvention   = 2
```

User override is not admitted. A caller-provided mismatching value shall fail rather than be ignored.

## 7.4 Border mode

The only admitted public string is:

```text
clamp-extension-logical-distance
```

It maps to numeric enum `1`.

The following shall fail in R6:

- `wrap`
- `mirror`
- `zero`
- `transparent`
- `clamp-distance`
- unknown numeric values

## 7.5 Packer write order

The v4 packer shall write all 24 words explicitly. It shall not copy a v3 buffer and append fields because stage metadata moved.

## 7.6 Parameter digest

The execution receipt `paramsDigest` shall be the SHA-256 of the exact 96-byte packed buffer written to the GPU.

---

# 8. Kernel Contract SSOT

The canonical kernel contract shall be a frozen JavaScript object in a versioned runtime module.

Recommended path:

```text
app/legacy-runtime/core/compute/qmap_webgpu/ewa_kernel_contract_v4.mjs
```

It shall define:

- ABI identity and version
- ABI field table
- defaults and ranges
- phase enum map
- border enum map
- kernel identity
- support predicate
- radial expression identity
- taper expression identity
- border semantic identity
- deterministic canonical JSON serialization
- contract SHA-256

The contract digest shall be computed from canonical JSON with stable key order. It shall not include timestamps, absolute paths, hostnames, random values, or platform-specific line endings.

The runtime normalizer, v4 packer, generator, verifier, and receipt finalizer shall import or validate against this one contract.

No second file may redefine numeric defaults or ranges.

---

# 9. Canonical Weight Function

The canonical generated WGSL fragment shall contain a function equivalent to:

```wgsl
fn kernelWeight(q: f32) -> f32 {
  if (!isFinite(q) || q < 0.0 || q > 1.0) { return 0.0; }
  let radial = exp(-U.kernelSharpness * q);
  let taperBase = max(0.0, 1.0 - q);
  let taper = pow(taperBase, U.kernelTaperExponent);
  let weight = radial * taper;
  return select(0.0, weight, isFinite(weight) && weight > 0.0);
}
```

The exact generated implementation may avoid a branch or use equivalent finite guards, but the operation order and semantics shall be fixed by the kernel fragment digest.

R6 shall not:

- hard-code `1.65` in canonical generated WGSL;
- hard-code taper exponent `1.0` in canonical generated WGSL;
- remove the `q > 1` compact support rule;
- apply sharpness or taper to ellipse radius;
- normalize weights before accumulation;
- apply taper after division by weight sum;
- use a different function in validation or reference roles.

The default parameters shall produce the same mathematical function as R5:

```text
exp(-1.65 q) * max(0, 1 - q)
```

---

# 10. Border SSOT

## 10.1 Canonical semantic

```text
tdt.ewa.border.clamp-extension-logical-distance-v1
```

## 10.2 Color fetch

```wgsl
fn sourceFetchCoord(logicalCoord: vec2<i32>) -> vec2<i32> {
  return clamp(logicalCoord, vec2<i32>(0), vec2<i32>(U.inSize) - vec2<i32>(1));
}
```

The logical coordinate remains unchanged for distance evaluation.

## 10.3 Axial-neighbor fetch

The four R5 axial interpolation neighbors shall use the same clamp-extension border identity. Bilinear weights continue to derive from unclamped `p` and `floor(p)`.

## 10.4 Policy field exclusion

Adaptive policy coordinates use the policy texture's normalized stage mapping and clamp contract. Policy border behavior is not redefined by R6 and shall not claim the R6 source border ID.

## 10.5 Fallback sample

If `weightSum <= EPS`, the fallback color sample shall use the same logical-to-fetch clamp helper. No unversioned direct clamp helper may remain in canonical R6 generated outputs.

## 10.6 Unknown enum handling

Host normalization and pack verification shall reject unknown border values before dispatch. Validation shaders shall also expose an ABI-contract mismatch counter. Product shaders shall not silently interpret unknown values as clamp.

---

# 11. Phase Convention In-Band Assertion

R4 already owns the continuous source-lattice equation:

```text
p = (destinationCoord + 0.5) * srcPerDst - 0.5
```

R6 shall not change that equation.

The ABI field `phaseConvention` exists to prevent a v4 packer or shader from claiming another convention while reusing the same ABI ID. Its only admitted value is `2`.

The generated shader manifest shall record both:

```text
phaseConventionId   = tdt.ewa.source-lattice.pixel-center-v2
phaseConventionEnum = 2
```

The runtime bundle and receipt shall report the same pair.

---

# 12. Deterministic WGSL Generator

## 12.1 Generator location

Recommended path:

```text
tools/resample-runtime-01-r6/generate-wgsl.mjs
```

The generator is a build and validation tool. It shall not be imported by renderer runtime code.

## 12.2 Canonical templates

Recommended template paths:

```text
tools/resample-runtime-01-r6/templates/product-tiled.wgsl.tmpl
tools/resample-runtime-01-r6/templates/validation-tiled.wgsl.tmpl
tools/resample-runtime-01-r6/templates/reference-direct.wgsl.tmpl
```

Templates shall contain explicit insertion markers for:

- generated header
- ABI struct
- kernel contract constants
- border helper
- axial sampling fragment
- ellipse construction fragment
- kernel weight fragment
- role-specific load implementation

## 12.3 Generated output paths

```text
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r6.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r6.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r6.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r6.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v5_r6.wgsl
```

## 12.4 Generated header

Every output shall start with a generated header equivalent to:

```text
@generated=true
generatorId=tdt.ewa.wgsl-generator.r6.v1
kernelContractId=tdt.ewa.kernel-contract.r6.v1
kernelId=tdt.ewa.ellipse.phase-correct-parametric-r6.v1
parameterAbiId=tdt.delta-k-ewa.params.v4
parameterBytes=96
phaseConventionId=tdt.ewa.source-lattice.pixel-center-v2
borderId=tdt.ewa.border.clamp-extension-logical-distance-v1
role=<role>
profile=<R4|R6|REFERENCE>
contractDigest=<sha256>
templateDigest=<sha256>
```

The final output digest belongs in the companion manifest because embedding the output's own digest inside itself is recursive.

## 12.5 Determinism

The generator shall enforce:

- UTF-8 without BOM
- LF line endings
- one terminal newline
- stable role ordering
- stable key ordering
- no current time
- no random IDs
- no absolute paths
- no platform-dependent separators

Two clean generations from identical inputs shall be byte-identical.

---

# 13. Generated Shader Manifest

Recommended path:

```text
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_generated_manifest_r6.json
```

The manifest shall contain:

```json
{
  "schemaVersion": 1,
  "manifestId": "tdt.ewa.generated-shader-manifest.r6.v1",
  "generatorId": "tdt.ewa.wgsl-generator.r6.v1",
  "generatorDigest": "<sha256>",
  "kernelContractId": "tdt.ewa.kernel-contract.r6.v1",
  "kernelContractDigest": "<sha256>",
  "parameterAbiId": "tdt.delta-k-ewa.params.v4",
  "parameterBytes": 96,
  "phaseConventionId": "tdt.ewa.source-lattice.pixel-center-v2",
  "phaseConventionEnum": 2,
  "borderId": "tdt.ewa.border.clamp-extension-logical-distance-v1",
  "borderEnum": 1,
  "outputs": []
}
```

Each output record shall contain:

- path
- role
- profile
- template path
- template digest
- output digest
- ABI fragment digest
- kernel fragment digest
- border fragment digest
- axial interpolation fragment digest
- coordinate fragment digest

Product R4 and product R6 shall have different full output digests because tile constants differ. Their shared canonical fragment digests shall match.

---

# 14. Generated Fragment Identity

Generated sources shall surround canonical sections with stable markers:

```text
// <TDT:R6:ABI:BEGIN>
// <TDT:R6:ABI:END>
// <TDT:R6:COORDINATE:BEGIN>
// <TDT:R6:COORDINATE:END>
// <TDT:R6:AXIAL:BEGIN>
// <TDT:R6:AXIAL:END>
// <TDT:R6:BORDER:BEGIN>
// <TDT:R6:BORDER:END>
// <TDT:R6:KERNEL:BEGIN>
// <TDT:R6:KERNEL:END>
```

The verifier shall extract and hash normalized bytes between each pair.

The ABI, coordinate, axial, border, and kernel fragment digests shall match across all five generated outputs.

Role-specific tiled load and validation counter fragments are intentionally different and shall carry separate role digests.

---

# 15. Product and Reference Independence

R6 removes formula duplication but shall preserve execution independence.

The product path shall:

- preload a shared workgroup tile;
- execute one workgroup barrier;
- read candidate samples from the shared tile;
- expose no direct source fallback in canonical product;
- use R4 or R6 tile profile selected by the unchanged R4 proof.

The direct reference shall:

- use direct `textureLoad` for every candidate;
- allocate no workgroup source tile;
- contain no shared tile helper;
- contain no product fallback branch;
- use the same generated ABI, coordinate, axial, border, and kernel fragments.

The full source digests shall differ. Shared fragment digests shall match.

---

# 16. Validation Shader Contract

R6 validation shaders shall preserve all R5 counters and add bounded counters for:

```text
16 ABI version mismatch
17 phase convention mismatch
18 border mode mismatch
19 nonfinite kernel parameter
20 kernel parameter range mismatch
21 nonfinite kernel weight
22 negative kernel weight
23 support predicate violation
24 generated contract sentinel mismatch
```

The exact storage array length and counter indices shall be versioned in the R6 validation contract.

Product shaders shall not bind the validation storage buffer.

---

# 17. Runtime Profile and Pipeline Bundle

R4 tile proof remains immutable. R6 shall add a versioned profile adapter that maps the proven R4/R6 geometry to R6 generated shader assets.

Recommended path:

```text
app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r6.mjs
```

The adapter shall import or verify R4 proof identities and expose new profile IDs:

```text
tdt.ewa.tile.r6.r4-8x8-v1
tdt.ewa.tile.r6.r6-8x8-v1
```

The pipeline bundle shall include:

- ABI ID and byte size
- kernel contract ID and digest
- kernel ID
- generator ID and digest
- generated manifest ID and digest
- per-output shader digest
- phase ID and enum
- border ID and enum
- R4 coordinate ID
- R4 tile proof ID
- R5 axial field and interpolation IDs
- device epoch
- runtime epoch

The layout digest shall change when any one of those values changes.

---

# 18. Canonical Dispatch Contract

Canonical R6 dispatch shall:

1. require the R5 axial field metadata;
2. select an R4-proven tile geometry through the R6 adapter;
3. normalize sharpness, taper, phase, and border;
4. pack an exact 96-byte v4 buffer;
5. verify bundle ABI and generated manifest identity;
6. write the buffer once;
7. bind the generated R6 product pipeline;
8. submit without image readback;
9. emit an execution receipt with effective values and digests.

The canonical path shall reject:

- a v3 bundle;
- an 80-byte parameter buffer;
- unknown phase enum;
- unknown border enum;
- stale generated manifest;
- shader digest mismatch;
- tangent field bound instead of axial field;
- stale device epoch.

---

# 19. Compatibility Contract

## 19.1 Public defaults

A request that omits all R6 fields shall normalize to:

```text
kernelSharpness     = 1.65
kernelTaperExponent = 1.0
phaseConvention     = 2
borderMode          = 1
```

## 19.2 Public field preservation

The existing `kernelSharpness` field remains accepted with its existing range.

## 19.3 New taper alias

`taperExponent` may be accepted only as an explicit legacy alias for `kernelTaperExponent`. Conflicting aliases fail.

## 19.4 Legacy v2 path

The existing noncanonical legacy v2 pipeline may remain quarantined for declared compatibility use. It shall not claim R6 kernel identity, ABI, generated source identity, or parity.

## 19.5 Canonical v3 fallback

There shall be no automatic canonical fallback from v4 to v3.

---

# 20. Default Parity Contract

Under the default R6 kernel parameters:

```text
sharpness = 1.65
taper     = 1.0
phase     = 2
border    = 1
```

R6 shall reproduce the R5 mathematical weight function and border behavior.

Source-only proof shall include:

- binary64 oracle equality for weight values over a fixed q lattice;
- identical support membership;
- identical normalized impulse response within binary64 tolerance;
- identical border oracle output;
- generated source evidence that no hard-coded literal path remains.

Physical GPU bitwise output parity remains deferred because shader regeneration and changed uniform loads can alter compiler scheduling even under the same mathematics.

---

# 21. Parameter Sensitivity Contract

The fixture matrix shall prove that parameters are not dead:

- reducing sharpness increases off-center radial weight;
- increasing sharpness decreases off-center radial weight;
- reducing taper exponent increases near-boundary weight;
- increasing taper exponent decreases near-boundary weight;
- `q = 0` yields weight `1` for every admitted sharpness and taper;
- `q = 1` yields weight `0` for every admitted positive taper;
- `q > 1` yields weight `0`;
- source support reach is unchanged;
- constant RGBA input remains constant after normalization;
- impulse response sums to one after output normalization.

A parameter whose packed byte changes but oracle output does not change at any sensitivity fixture shall be treated as dead wiring.

---

# 22. Independent Binary64 Kernel Oracle

Recommended paths:

```text
tools/resample-runtime-01-r6/kernel-oracle.mjs
tools/resample-runtime-01-r6/border-oracle.mjs
tools/resample-runtime-01-r6/verify-kernel-oracle.mjs
```

The oracle shall be independent from generated WGSL text. It may import numeric contract values, but it shall implement the weight and border equations separately.

The oracle shall validate:

- q lattice from 0 through 1 and selected values above 1;
- sharpness minimum, default, and maximum;
- taper minimum, default, and maximum;
- isotropic and anisotropic ellipses;
- fractional source phases;
- corner and edge border positions;
- constant, impulse, checker, alpha-edge, and hidden-RGB fixtures;
- default parity against the historical R5 equation;
- negative controls using clamped-distance semantics;
- negative controls using hard-coded sharpness;
- negative controls ignoring taper.

The oracle and fixtures shall remain outside runtime graphs.

---

# 23. Border Negative Controls

At least one fixture shall distinguish:

```text
correct:   delta = logicalCoord - p
incorrect: delta = clamp(logicalCoord) - p
```

The fixture shall place `p` near a border and use a support radius greater than one so multiple out-of-range logical coordinates map to one edge fetch coordinate.

The correct model shall accumulate repeated edge texel fetches with distinct logical distances. The incorrect model shall collapse those distances and produce a measurably different normalized result.

The gate is invalid if the fixture does not separate both models.

---

# 24. Generator Negative Controls

R6 shall execute negative controls in an isolated temporary tree:

1. mutate one byte of a generated product shader;
2. mutate one byte of a generated reference shader;
3. mutate the kernel template without regenerating;
4. mutate the contract default without regenerating;
5. mutate one manifest output digest;
6. swap product R4 and R6 profile metadata;
7. remove the generated header;
8. alter a shared fragment marker;

Every mutation shall be detected by a stable R6 error code.

Negative controls shall never mutate the working source tree or historical receipts.

---

# 25. Required Receipts

R6 shall emit at least:

```text
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_PARENT_TRUTH_RECEIPT.json
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_ABI_SCHEMA_RECEIPT.json
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_KERNEL_CONTRACT_RECEIPT.json
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_GENERATED_SHADER_MANIFEST_RECEIPT.json
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_ORACLE_RECEIPT.json
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_RUNTIME_SMOKE_RECEIPT.json
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_PREDECESSOR_REGRESSION_RECEIPT.json
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_SOURCE_GATE_RECEIPT.json
artifacts/runtime/TDT_RESAMPLE_RUNTIME_01_R6_FINAL_RECEIPT.json
```

The final receipt shall include:

```json
{
  "patchId": "TDT-RESAMPLE-RUNTIME-01-R6",
  "sourceState": "RESAMPLE_RUNTIME_R6_KERNEL_CONTRACT_SEALED_AWAITING_R7",
  "parameterAbiId": "tdt.delta-k-ewa.params.v4",
  "parameterAbiVersion": 65550,
  "parameterBytes": 96,
  "kernelContractId": "tdt.ewa.kernel-contract.r6.v1",
  "kernelId": "tdt.ewa.ellipse.phase-correct-parametric-r6.v1",
  "generatorId": "tdt.ewa.wgsl-generator.r6.v1",
  "generatedManifestId": "tdt.ewa.generated-shader-manifest.r6.v1",
  "phaseConventionId": "tdt.ewa.source-lattice.pixel-center-v2",
  "phaseConventionEnum": 2,
  "borderId": "tdt.ewa.border.clamp-extension-logical-distance-v1",
  "borderEnum": 1,
  "defaultKernelSharpness": 1.65,
  "defaultKernelTaperExponent": 1.0,
  "generatedOutputCount": 5,
  "productionPointerMutated": false,
  "physicalGpuClaimed": false,
  "packagedElectronClaimed": false
}
```

`65550` is the decimal representation of `0x0001000e`.

---

# 26. Telemetry

R6 telemetry shall distinguish:

- v4 canonical dispatch count
- v3 canonical rejection count
- default sharpness dispatch count
- nondefault sharpness dispatch count
- default taper dispatch count
- nondefault taper dispatch count
- invalid kernel parameter rejection count
- phase mismatch rejection count
- border mismatch rejection count
- generated manifest mismatch rejection count
- generated shader digest mismatch rejection count
- R4 profile selection count
- R6 profile selection count
- physical validation counter readback count

Telemetry shall not claim physical shader execution in source-only mock runs.

---

# 27. Resource and Lifecycle Contract

R6 changes uniform buffer size from 80 to 96 bytes for canonical pipelines.

The pipeline bundle shall allocate one 96-byte uniform buffer per canonical compiled role or use an explicitly proven shared allocation strategy. Every allocated buffer shall be destroyed exactly once.

Device loss shall invalidate:

- generated R6 product pipelines;
- generated validation pipelines;
- generated reference pipeline;
- v4 parameter buffers;
- bundle identities and output digest bindings.

A recovered device shall regenerate or reload verified source assets and compile a new bundle for the new device epoch.

---

# 28. Active Graph and Asset Admission

The five generated WGSL outputs and generated manifest shall be admitted to the runtime asset manifest and Active Graph.

The following shall remain excluded:

- generator source
- templates
- oracle
- fixtures
- negative-control mutations
- source verification tools

Exactly one R6 canonical product family shall be admitted. R5 product shaders remain historical files and shall not remain canonical consumers.

---

# 29. Zero Fallback Contract

R6 shall introduce none of the following:

- CPU resampling fallback
- CPU kernel evaluation in Preview or Export
- Canvas resampling
- WebGL resampling
- direct reference as product fallback
- v3 canonical pipeline fallback
- silent default substitution for invalid values
- silent unknown border-to-clamp mapping
- silent unknown phase-to-v2 mapping
- stale generated output acceptance

Validation and oracle CPU code may execute only in bounded verification tools.

---

# 30. Stable Errors

R6 shall expose stable errors including:

```text
E_R6_PARENT_BUNDLE_IDENTITY_MISMATCH
E_R6_PREDECESSOR_DIGEST_MISMATCH
E_R6_ABI_SCHEMA_INVALID
E_R6_ABI_VERSION_MISMATCH
E_R6_PARAMETER_BUFFER_SIZE_MISMATCH
E_R6_KERNEL_PARAMETER_NONFINITE
E_R6_KERNEL_PARAMETER_RANGE
E_R6_AMBIGUOUS_KERNEL_ALIAS
E_R6_PHASE_CONVENTION_UNSUPPORTED
E_R6_BORDER_MODE_UNSUPPORTED
E_R6_KERNEL_CONTRACT_DIGEST_MISMATCH
E_R6_GENERATOR_DIGEST_MISMATCH
E_R6_GENERATED_HEADER_MISSING
E_R6_GENERATED_OUTPUT_STALE
E_R6_GENERATED_OUTPUT_DIGEST_MISMATCH
E_R6_GENERATED_FRAGMENT_MISMATCH
E_R6_GENERATED_MANIFEST_STALE
E_R6_TEMPLATE_NOT_QUARANTINED
E_R6_GENERATOR_RUNTIME_IMPORT
E_R6_CANONICAL_V3_FALLBACK
E_R6_SHADER_ROLE_IDENTITY_MISMATCH
E_R6_RUNTIME_ASSET_MISSING
E_R6_ACTIVE_GRAPH_MISSING
E_R6_STALE_PIPELINE_EPOCH
E_R6_CPU_FALLBACK_WIRED
E_R6_PREDECESSOR_REGRESSION_FAILED
E_R6_PRODUCTION_POINTER_MUTATION
E_R6_RECEIPT_INCOMPLETE
E_R6_PHYSICAL_GPU_CLAIM_UNSUPPORTED
```

---

# 31. Required Source Layout

```text
app/legacy-runtime/core/compute/qmap_webgpu/
├─ ewa_aniso_params_v3.mjs                         # frozen predecessor
├─ ewa_aniso_params_v4.mjs                         # new canonical packer
├─ ewa_kernel_contract_v4.mjs                      # new SSOT
├─ ewa_tiled_profile_r4.mjs                        # frozen proof
├─ ewa_tiled_profile_r6.mjs                        # generated asset adapter
├─ ewa_parity_runtime_r5.mjs                       # frozen predecessor
├─ ewa_parity_runtime_r6.mjs                       # new physical harness
├─ ewa_aniso_tile.mjs                              # canonical adapter mutation
└─ shaders/
   ├─ ewa_aniso_tile_r4_r5.wgsl                    # frozen predecessor
   ├─ ewa_aniso_tile_r6_r5.wgsl                    # frozen predecessor
   ├─ ewa_aniso_tile_r4_r6.wgsl                    # generated canonical
   ├─ ewa_aniso_tile_r6_r6.wgsl                    # generated canonical
   ├─ ewa_aniso_tile_validation_r4_r6.wgsl         # generated validation
   ├─ ewa_aniso_tile_validation_r6_r6.wgsl         # generated validation
   ├─ ewa_aniso_reference_v5_r6.wgsl               # generated direct reference
   └─ ewa_generated_manifest_r6.json               # generated identity

tools/resample-runtime-01-r6/
├─ templates/
│  ├─ product-tiled.wgsl.tmpl
│  ├─ validation-tiled.wgsl.tmpl
│  └─ reference-direct.wgsl.tmpl
├─ generate-wgsl.mjs
├─ generate-fixtures.mjs
├─ kernel-oracle.mjs
├─ border-oracle.mjs
├─ verify-abi.mjs
├─ verify-generated-sources.mjs
├─ verify-oracle.mjs
├─ verify-runtime-wiring.mjs
├─ verify-predecessor-regression.mjs
├─ runtime-smoke.mjs
├─ gate.mjs
├─ finalize.mjs
├─ run.mjs
└─ gate-requirements.json
```

---

# 32. Package Scripts

Required scripts:

```json
{
  "generate:resample-runtime-01-r6": "node tools/resample-runtime-01-r6/generate-wgsl.mjs && node tools/resample-runtime-01-r6/generate-fixtures.mjs",
  "verify:resample-runtime-01-r6:abi": "node tools/resample-runtime-01-r6/verify-abi.mjs",
  "verify:resample-runtime-01-r6:generated": "node tools/resample-runtime-01-r6/verify-generated-sources.mjs",
  "verify:resample-runtime-01-r6:oracle": "node tools/resample-runtime-01-r6/verify-oracle.mjs",
  "verify:resample-runtime-01-r6:runtime": "node tools/resample-runtime-01-r6/verify-runtime-wiring.mjs",
  "smoke:resample-runtime-01-r6": "node tools/resample-runtime-01-r6/runtime-smoke.mjs",
  "gate:resample-runtime-01-r6": "node tools/resample-runtime-01-r6/gate.mjs",
  "finalize:resample-runtime-01-r6": "node tools/resample-runtime-01-r6/finalize.mjs",
  "verify:resample-runtime-01-r6": "node tools/resample-runtime-01-r6/run.mjs"
}
```

The top-level verification command shall run generation in a temporary or controlled deterministic phase, all source and oracle checks, mock runtime, predecessor regression, gate aggregation, and finalization.

---

# 33. Implementation Sequence

1. Verify the R5 parent ZIP and frozen asset digests.
2. Snapshot all predecessor evidence surfaces.
3. Add the frozen R6 kernel contract object.
4. Add the exact ABI v4 schema and packer.
5. Extend request normalization for taper and border.
6. Add deterministic templates.
7. Add the generator and generated manifest schema.
8. Generate five versioned WGSL outputs.
9. Add generated-fragment verification.
10. Add the R6 profile adapter without changing R4 proof code.
11. Wire canonical pipeline compilation to generated outputs and 96-byte buffers.
12. Wire dispatch to the v4 packer.
13. Add bundle and cache identities.
14. Extend receipts and telemetry.
15. Add independent kernel and border oracles.
16. Add sensitivity and negative-control fixtures.
17. Admit generated runtime assets only.
18. Run R1A through R5 predecessor regressions in isolation.
19. Restore all predecessor evidence surfaces.
20. Emit final source receipts and changed-file manifest.
21. Leave physical and packaged gates deferred.
22. Do not move the Production Pointer.

---

# 34. Source Verification Strategy

Source verification shall inspect semantics, not only filenames.

It shall verify:

- exact ABI offsets and byte length;
- packer word writes;
- request normalization ranges;
- no hard-coded canonical sharpness literal;
- no hard-coded canonical taper exponent;
- generated header completeness;
- generated output digest matches manifest;
- shared fragment digests match across roles;
- product and reference full digests differ;
- product contains shared tile access;
- reference contains direct loads and no shared tile;
- border helper uses logical-distance semantics;
- R4 coordinate equation remains unchanged;
- R5 axial interpolation remains unchanged;
- runtime imports generated outputs and v4 packer;
- runtime does not import templates or generator;
- cache and receipt identities are complete;
- Active Graph contains only runtime outputs;
- Production Pointer remains unchanged.

---

# 35. Mock Runtime Strategy

The mock runtime shall provide deterministic stand-ins for:

- GPU device and limits;
- shader module creation;
- compute pipeline creation;
- uniform buffer allocation;
- queue writeBuffer;
- bind group creation;
- command encoding and submission;
- device loss participant registration;
- texture metadata and axial field identity.

It shall assert:

- canonical pipelines allocate 96-byte buffers;
- exact 96-byte payload is written;
- nondefault sharpness and taper change payload digest;
- phase and border words are exact;
- generated shader digests are bound into the bundle;
- v3 buffer and bundle are rejected;
- unknown border and phase fail before submission;
- no CPU or reference fallback executes;
- resources dispose exactly once.

Mock submission is not physical WGSL execution and shall not be reported as such.

---

# 36. Physical GPU Deferral

The source-only R6 bake shall mark the following as deferred when no physical WebGPU environment is available:

- generated WGSL compilation on a real adapter;
- default R5/R6 pixel parity;
- nondefault sharpness and taper GPU sensitivity;
- product/reference pixel parity;
- validation counter readback;
- device-loss recovery under real queue work;
- packaged Electron generated-asset identity.

These shall not be converted to PASS by static parsing or mock execution.

---

# 37. Promotion and State Rules

The valid source-only target state is:

```text
RESAMPLE_RUNTIME_R6_KERNEL_CONTRACT_SEALED_AWAITING_R7
```

The following are forbidden source-only states:

```text
RESAMPLE_RUNTIME_R6_PHYSICAL_GPU_PASS
RESAMPLE_RUNTIME_R6_PACKAGED_ELECTRON_PASS
RESAMPLE_RUNTIME_R6_PRODUCTION_PROMOTED
```

R6 shall not mutate the Production Pointer.

---

# 38. Non-Claims

R6 does not claim:

- that every sharpness or taper value is perceptually optimal;
- that new border modes are supported;
- that Preview and Export use one lowpass kernel yet;
- that physical GPU outputs are bitwise proven;
- that packaged Electron contains the generated outputs;
- that performance is improved;
- that the Production Pointer has moved;
- that R7, R8, or R9 work is complete.

---

# 39. Required Bake Artifacts

A source bake shall include:

- this specification and SHA-256 file;
- R6 kernel contract module;
- ABI v4 packer;
- templates;
- deterministic generator;
- five generated WGSL outputs;
- generated shader manifest;
- R6 profile adapter;
- R6 parity harness source;
- kernel and border oracles;
- deterministic fixtures;
- gate requirements;
- receipts;
- applied README;
- changed-file manifest;
- unified diff;
- final repository ZIP and SHA-256.

---

# 40. Gate Matrix

## R6-001 `PARENT_BUNDLE_IDENTITY`

- **Requirement:** parent ZIP name and SHA-256 match
- **Evidence:** bundle digest
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PARENT_BUNDLE_IDENTITY_MISMATCH`

## R6-002 `R5_PRODUCT_R4_FROZEN`

- **Requirement:** R5 reach-4 product shader is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-003 `R5_PRODUCT_R6_FROZEN`

- **Requirement:** R5 reach-6 product shader is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-004 `R5_VALIDATION_R4_FROZEN`

- **Requirement:** R5 reach-4 validation shader is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-005 `R5_VALIDATION_R6_FROZEN`

- **Requirement:** R5 reach-6 validation shader is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-006 `R5_REFERENCE_FROZEN`

- **Requirement:** R5 direct reference is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-007 `R5_AXIAL_SHADER_FROZEN`

- **Requirement:** R5 axial conversion shader is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-008 `V3_PACKER_FROZEN`

- **Requirement:** v3 packer is preserved as predecessor evidence
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-009 `R4_TILE_PROOF_FROZEN`

- **Requirement:** R4 tile proof module is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-010 `R5_AXIAL_CONTRACT_FROZEN`

- **Requirement:** R5 axial contract is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-011 `R5_PARITY_FROZEN`

- **Requirement:** R5 parity harness is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-012 `R5_SPEC_FROZEN`

- **Requirement:** R5 specification is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-013 `R5_README_FROZEN`

- **Requirement:** R5 applied README is byte-identical
- **Evidence:** SHA-256
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_DIGEST_MISMATCH`

## R6-014 `R3_ORACLE_REGRESSION`

- **Requirement:** R3 fractional-phase oracle remains accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_REGRESSION_FAILED`

## R6-015 `R4_R5_SEMANTIC_REGRESSION`

- **Requirement:** R4 coordinate and R5 axial identities remain accepted
- **Evidence:** predecessor gate
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_REGRESSION_FAILED`

## R6-016 `ABI_ID`

- **Requirement:** ABI ID is exactly tdt.delta-k-ewa.params.v4
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-017 `ABI_VERSION`

- **Requirement:** ABI version is exactly 0x0001000e
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-018 `ABI_BYTES`

- **Requirement:** ABI byte length is exactly 96
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-019 `ABI_FIELD_COUNT`

- **Requirement:** ABI contains exactly 20 named fields
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-020 `ABI_INSIZES_OFFSET`

- **Requirement:** inSize offset is 0
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-021 `ABI_OUTSIZE_OFFSET`

- **Requirement:** outSize offset is 8
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-022 `ABI_SRCPERDST_OFFSET`

- **Requirement:** srcPerDst offset is 16
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-023 `ABI_DSTPERSRC_OFFSET`

- **Requirement:** dstPerSrc offset is 24
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-024 `ABI_SIGMA_OFFSET`

- **Requirement:** sigma fields occupy 32 and 36
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-025 `ABI_ELLIPSE_OFFSET`

- **Requirement:** maxAnisotropy and maxSampleReach occupy 40 and 44
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-026 `ABI_GATE_OFFSET`

- **Requirement:** edge and coherence fields occupy 48 through 60
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-027 `ABI_SHARPNESS_OFFSET`

- **Requirement:** kernelSharpness offset is 64
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-028 `ABI_TAPER_OFFSET`

- **Requirement:** kernelTaperExponent offset is 68
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-029 `ABI_PHASE_OFFSET`

- **Requirement:** phaseConvention offset is 72
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-030 `ABI_BORDER_OFFSET`

- **Requirement:** borderMode offset is 76
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-031 `ABI_STAGE_OFFSET`

- **Requirement:** stageIndex and stageCount occupy 80 and 84
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-032 `ABI_FLAGS_OFFSET`

- **Requirement:** flags offset is 88
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-033 `ABI_VERSION_OFFSET`

- **Requirement:** abiVersion offset is 92
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-034 `ABI_PREFIX_PRESERVED`

- **Requirement:** bytes 0 through 63 preserve v3 semantic offsets
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-035 `ABI_NO_IMPLICIT_PADDING`

- **Requirement:** packer allocates exactly 96 bytes
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-036 `ABI_WGSL_JS_PARITY`

- **Requirement:** WGSL and JavaScript schemas have identical field order
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-037 `ABI_SCHEMA_FROZEN`

- **Requirement:** ABI schema object is frozen and canonically serializable
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-038 `ABI_SCHEMA_DIGEST`

- **Requirement:** ABI schema digest is emitted and verified
- **Evidence:** ABI verifier
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ABI_SCHEMA_INVALID`

## R6-039 `SHARPNESS_DEFAULT`

- **Requirement:** kernelSharpness default is 1.65
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-040 `SHARPNESS_RANGE`

- **Requirement:** kernelSharpness range is 0.25 through 4.0
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-041 `SHARPNESS_NONFINITE_REJECT`

- **Requirement:** nonfinite sharpness is rejected
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-042 `TAPER_DEFAULT`

- **Requirement:** kernelTaperExponent default is 1.0
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-043 `TAPER_RANGE`

- **Requirement:** kernelTaperExponent range is 0.25 through 4.0
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-044 `TAPER_NONFINITE_REJECT`

- **Requirement:** nonfinite taper is rejected
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-045 `TAPER_ALIAS`

- **Requirement:** taperExponent maps to kernelTaperExponent
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-046 `TAPER_ALIAS_AMBIGUITY`

- **Requirement:** conflicting taper aliases are rejected
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-047 `PHASE_DEFAULT`

- **Requirement:** phase convention defaults to enum 2
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-048 `PHASE_OVERRIDE_REJECT`

- **Requirement:** mismatching phase override is rejected
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-049 `BORDER_DEFAULT`

- **Requirement:** border defaults to clamp-extension-logical-distance enum 1
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-050 `BORDER_UNKNOWN_REJECT`

- **Requirement:** unknown border strings and enums are rejected
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-051 `PACK_ALL_WORDS`

- **Requirement:** packer explicitly writes all 24 words
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-052 `PACK_SHARPNESS`

- **Requirement:** packed word 16 contains sharpness
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-053 `PACK_TAPER`

- **Requirement:** packed word 17 contains taper
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-054 `PACK_PHASE`

- **Requirement:** packed word 18 contains phase enum 2
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-055 `PACK_BORDER`

- **Requirement:** packed word 19 contains border enum 1
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-056 `PACK_STAGE_TAIL`

- **Requirement:** packed words 20 through 23 contain stage flags and version
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-057 `PACK_DIGEST_SENSITIVITY`

- **Requirement:** nondefault sharpness or taper changes parameter digest
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-058 `PACK_REPLAY`

- **Requirement:** same normalized input produces byte-identical buffer
- **Evidence:** normalizer and packer tests
- **Source-state rule:** PASS
- **Failure code:** `E_R6_KERNEL_PARAMETER_RANGE`

## R6-059 `KERNEL_CONTRACT_ID`

- **Requirement:** kernel contract ID is exact
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-060 `KERNEL_ID`

- **Requirement:** kernel identity is exact
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-061 `KERNEL_DEFAULTS_SSOT`

- **Requirement:** defaults exist in one contract object
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-062 `KERNEL_RANGES_SSOT`

- **Requirement:** ranges exist in one contract object
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-063 `KERNEL_SUPPORT_Q`

- **Requirement:** q greater than 1 returns zero
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-064 `KERNEL_Q_ZERO`

- **Requirement:** q zero returns one
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-065 `KERNEL_RADIAL_UNIFORM`

- **Requirement:** radial term reads U.kernelSharpness
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-066 `KERNEL_TAPER_UNIFORM`

- **Requirement:** taper term reads U.kernelTaperExponent
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-067 `KERNEL_OPERATION_ORDER`

- **Requirement:** radial and taper operation order matches contract
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-068 `KERNEL_FINITE_GUARD`

- **Requirement:** nonfinite q or weight is neutralized or rejected
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-069 `KERNEL_NEGATIVE_WEIGHT_ZERO`

- **Requirement:** negative weight cannot enter accumulation
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-070 `KERNEL_NO_LITERAL_SHARPNESS`

- **Requirement:** canonical WGSL has no exp(-1.65*q) literal path
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-071 `KERNEL_NO_LITERAL_TAPER`

- **Requirement:** canonical WGSL has no fixed exponent path
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-072 `KERNEL_SUPPORT_UNCHANGED`

- **Requirement:** sharpness and taper do not alter support reach
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-073 `KERNEL_DEFAULT_R5_ORACLE`

- **Requirement:** default weight matches historical R5 equation
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-074 `KERNEL_SHARPNESS_SENSITIVITY`

- **Requirement:** sharpness sensitivity fixtures separate values
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-075 `KERNEL_TAPER_SENSITIVITY`

- **Requirement:** taper sensitivity fixtures separate values
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-076 `KERNEL_CONSTANT_DC`

- **Requirement:** constant input is invariant after normalization
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-077 `KERNEL_IMPULSE_NORMALIZED`

- **Requirement:** normalized impulse response sums to one
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-078 `KERNEL_FRAGMENT_DIGEST`

- **Requirement:** kernel fragment digest is identical across roles
- **Evidence:** generated source and oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_FRAGMENT_MISMATCH`

## R6-079 `PHASE_ID`

- **Requirement:** phase ID is pixel-center-v2
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-080 `PHASE_ENUM`

- **Requirement:** phase enum is 2
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-081 `PHASE_EQUATION`

- **Requirement:** generated source preserves R4 p equation
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-082 `BORDER_ID`

- **Requirement:** border ID is exact
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-083 `BORDER_ENUM`

- **Requirement:** border enum is 1
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-084 `BORDER_LOGICAL_COORD`

- **Requirement:** delta uses unclamped logical sample coordinate
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-085 `BORDER_FETCH_CLAMP`

- **Requirement:** texture load uses clamped fetch coordinate
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-086 `BORDER_AXIAL_CLAMP`

- **Requirement:** axial neighbors use the same border identity
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-087 `BORDER_WEIGHTS_UNCLAMPED`

- **Requirement:** axial bilinear weights derive from unclamped p
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-088 `BORDER_FALLBACK_HELPER`

- **Requirement:** fallback sample uses generated border helper
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-089 `BORDER_POLICY_EXCLUDED`

- **Requirement:** policy clamp does not claim source border identity
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-090 `BORDER_NEGATIVE_CONTROL`

- **Requirement:** clamped-distance negative control is detected
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-091 `PHASE_RUNTIME_ASSERT`

- **Requirement:** runtime verifies phase enum before dispatch
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-092 `BORDER_RUNTIME_ASSERT`

- **Requirement:** runtime verifies border enum before dispatch
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-093 `PHASE_FRAGMENT_DIGEST`

- **Requirement:** coordinate fragment digest is identical across roles
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-094 `BORDER_FRAGMENT_DIGEST`

- **Requirement:** border fragment digest is identical across roles
- **Evidence:** source and border oracle
- **Source-state rule:** PASS
- **Failure code:** `E_R6_BORDER_MODE_UNSUPPORTED`

## R6-095 `GENERATOR_ID`

- **Requirement:** generator ID is exact
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-096 `GENERATOR_QUARANTINED`

- **Requirement:** generator is outside runtime graph
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-097 `TEMPLATES_PRESENT`

- **Requirement:** three canonical templates exist
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-098 `TEMPLATES_QUARANTINED`

- **Requirement:** templates are outside runtime graph
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-099 `GENERATED_OUTPUT_COUNT`

- **Requirement:** exactly five canonical generated WGSL outputs exist
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-100 `GENERATED_HEADER_PRODUCT_R4`

- **Requirement:** R4 product has complete generated header
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-101 `GENERATED_HEADER_PRODUCT_R6`

- **Requirement:** R6 product has complete generated header
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-102 `GENERATED_HEADER_VALIDATION_R4`

- **Requirement:** R4 validation has complete generated header
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-103 `GENERATED_HEADER_VALIDATION_R6`

- **Requirement:** R6 validation has complete generated header
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-104 `GENERATED_HEADER_REFERENCE`

- **Requirement:** reference has complete generated header
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-105 `GENERATED_MANIFEST_ID`

- **Requirement:** generated manifest ID is exact
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-106 `GENERATED_MANIFEST_OUTPUTS`

- **Requirement:** manifest records all five outputs
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-107 `GENERATED_OUTPUT_DIGESTS`

- **Requirement:** all output digests match files
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-108 `GENERATED_TEMPLATE_DIGESTS`

- **Requirement:** all template digests match files
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-109 `GENERATED_CONTRACT_DIGEST`

- **Requirement:** manifest contract digest matches SSOT
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-110 `GENERATED_REPLAY`

- **Requirement:** two clean generations are byte-identical
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-111 `GENERATED_ONE_TERMINAL_NEWLINE`

- **Requirement:** outputs use LF and one terminal newline
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-112 `GENERATED_NO_VOLATILE_DATA`

- **Requirement:** outputs and manifest contain no time or absolute path
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-113 `GENERATED_MUTATION_DETECTED`

- **Requirement:** one-byte output mutation is detected
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-114 `TEMPLATE_STALE_DETECTED`

- **Requirement:** template mutation without generation is detected
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-115 `CONTRACT_STALE_DETECTED`

- **Requirement:** contract mutation without generation is detected
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-116 `MANIFEST_MUTATION_DETECTED`

- **Requirement:** manifest digest mutation is detected
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-117 `FRAGMENT_MARKER_MUTATION_DETECTED`

- **Requirement:** shared fragment marker mutation is detected
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-118 `PROFILE_SWAP_DETECTED`

- **Requirement:** R4 and R6 profile metadata swap is detected
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-119 `PRODUCT_REFERENCE_FULL_DIGEST_DIFFER`

- **Requirement:** product and reference full digests differ
- **Evidence:** generator verifier and isolated negative controls
- **Source-state rule:** PASS
- **Failure code:** `E_R6_GENERATED_OUTPUT_STALE`

## R6-120 `R6_PROFILE_ADAPTER`

- **Requirement:** versioned R6 profile adapter exists
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-121 `R4_TILE_PROOF_REUSED`

- **Requirement:** R6 adapter reuses unchanged R4 proof
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-122 `R6_PRODUCT_ASSETS_SELECTED`

- **Requirement:** canonical bundle selects generated R6 product assets
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-123 `R6_VALIDATION_ASSETS_SELECTED`

- **Requirement:** validation harness selects generated R6 assets
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-124 `R6_REFERENCE_ASSET_SELECTED`

- **Requirement:** reference harness selects generated R6 reference
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-125 `R6_BUFFER_SIZE`

- **Requirement:** canonical buffers are 96 bytes
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-126 `R6_V4_PACKER_WIRED`

- **Requirement:** canonical dispatch uses v4 packer
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-127 `R6_V3_CANONICAL_REJECT`

- **Requirement:** v3 canonical bundle or buffer is rejected
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-128 `R6_AXIAL_FIELD_REQUIRED`

- **Requirement:** R5 axial field metadata remains required
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-129 `R6_BUNDLE_IDENTITIES`

- **Requirement:** bundle includes all kernel and generated identities
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-130 `R6_LAYOUT_DIGEST`

- **Requirement:** layout digest changes with contract or output identity
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-131 `R6_PARAM_DIGEST`

- **Requirement:** receipt records exact 96-byte digest
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-132 `R6_EFFECTIVE_PARAMS_RECEIPT`

- **Requirement:** receipt records sharpness taper phase and border
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-133 `R6_SHADER_DIGEST_RECEIPT`

- **Requirement:** receipt records selected generated shader digest
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-134 `R6_NO_REFERENCE_PRODUCT_FALLBACK`

- **Requirement:** product cannot fall back to reference
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-135 `R6_DEVICE_EPOCH`

- **Requirement:** stale bundle is rejected
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-136 `R6_DISPOSE_ONCE`

- **Requirement:** R6 parameter buffers dispose exactly once
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-137 `R6_MOCK_SUBMISSION`

- **Requirement:** mock canonical dispatch completes without image readback
- **Evidence:** runtime source and mock
- **Source-state rule:** PASS
- **Failure code:** `E_R6_STALE_PIPELINE_EPOCH`

## R6-138 `ORACLE_QUARANTINED`

- **Requirement:** kernel and border oracles are outside runtime graph
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_CPU_FALLBACK_WIRED`

## R6-139 `FIXTURES_DETERMINISTIC`

- **Requirement:** two clean fixture generations are byte-identical
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_RECEIPT_INCOMPLETE`

## R6-140 `ACTIVE_ASSET_MANIFEST`

- **Requirement:** all five generated WGSL assets and manifest are admitted
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_RUNTIME_ASSET_MISSING`

## R6-141 `STATIC_ADMISSION`

- **Requirement:** static admission contains generated runtime assets only
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_RUNTIME_ASSET_MISSING`

## R6-142 `ACTIVE_GRAPH_SINGLE_CANONICAL`

- **Requirement:** exactly one R6 canonical product family is active
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_ACTIVE_GRAPH_MISSING`

## R6-143 `NO_CPU_FALLBACK`

- **Requirement:** no CPU EWA fallback is wired
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_CPU_FALLBACK_WIRED`

## R6-144 `NO_CANVAS_WEBGL_FALLBACK`

- **Requirement:** no Canvas or WebGL fallback is wired
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_CPU_FALLBACK_WIRED`

## R6-145 `PREDECESSOR_R1A_R5`

- **Requirement:** R1A through R5 predecessor gates remain accepted
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PREDECESSOR_REGRESSION_FAILED`

## R6-146 `PRODUCTION_POINTER_UNCHANGED`

- **Requirement:** Production Pointer content and digest are unchanged
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_PRODUCTION_POINTER_MUTATION`

## R6-147 `DETERMINISTIC_RECEIPTS`

- **Requirement:** two clean source gate runs emit identical receipts
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_RECEIPT_INCOMPLETE`

## R6-148 `SOURCE_RECEIPT_COMPLETE`

- **Requirement:** all required identities counts and statuses are present
- **Evidence:** source gate and receipt
- **Source-state rule:** PASS
- **Failure code:** `E_R6_RECEIPT_INCOMPLETE`

## R6-149 `PHYSICAL_WGSL_COMPILE`

- **Requirement:** generated WGSL compiles on a physical WebGPU adapter
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU_OR_PACKAGE
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R6_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R6-150 `PHYSICAL_DEFAULT_R5_R6_PARITY`

- **Requirement:** default R5 and R6 physical pixels satisfy declared tolerance
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU_OR_PACKAGE
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R6_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R6-151 `PHYSICAL_PARAMETER_SENSITIVITY`

- **Requirement:** nondefault sharpness and taper execute on physical GPU
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU_OR_PACKAGE
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R6_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R6-152 `PHYSICAL_PRODUCT_REFERENCE_PARITY`

- **Requirement:** physical product and reference pixels match
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU_OR_PACKAGE
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R6_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

## R6-153 `PACKAGED_ELECTRON_IDENTITY`

- **Requirement:** packaged Electron contains and executes R6 generated assets
- **Evidence:** DEFERRED_WHEN_NO_PHYSICAL_GPU_OR_PACKAGE
- **Source-state rule:** DEFERRED
- **Failure code:** `E_R6_PHYSICAL_GPU_CLAIM_UNSUPPORTED`

---

# 41. Final Acceptance Contract

R6 is accepted in the source-verified state only when every mandatory gate is `PASS`, every unavailable physical or packaged gate is explicitly `DEFERRED`, and no gate is `FAIL`.

The final summary shall preserve three distinct states:

```text
PASS
DEFERRED
FAIL
```

`DEFERRED` shall never be counted as `PASS`.

The accepted source statement is:

> The canonical stage-local EWA path preserves the R4 continuous source lattice and R5 axial subpixel field while replacing the 80-byte v3 parameter block and duplicated literal weight functions with a 96-byte ABI v4 contract. Sharpness, taper, phase convention, and clamp-extension logical-distance border semantics are normalized, packed, identified, and consumed explicitly. Product, validation, and direct reference shaders are deterministic generated outputs whose shared ABI, coordinate, axial, border, and kernel fragments have exact digests, while tiled product and direct-load reference memory access remain independent. Runtime bundles and receipts bind the generated output identities, no canonical v3 or CPU fallback is introduced, the Production Pointer remains unchanged, and physical GPU and packaged execution claims remain deferred.

The next authority is:

```text
TDT-RESAMPLE-RUNTIME-01-R7

Preview·Export Canonical EWA Lowpass Convergence /
Shared Stage Planner and Kernel Identity /
Residual Identity Separation Seal
```

---

# 42. Compact Implementation Checklist

```text
[ ] Verify R5 parent ZIP SHA-256.
[ ] Freeze R5 product, validation, reference, axial, profile, parity, spec, and README assets.
[ ] Add kernel contract SSOT.
[ ] Add ABI v4 schema with exact 96-byte layout.
[ ] Preserve bytes 0 through 63 semantic offsets.
[ ] Add sharpness at byte 64.
[ ] Add taper exponent at byte 68.
[ ] Add phase enum at byte 72.
[ ] Add border enum at byte 76.
[ ] Move stage metadata to bytes 80 through 95.
[ ] Add strict v4 packer.
[ ] Preserve kernelSharpness public input.
[ ] Add kernelTaperExponent and taperExponent alias.
[ ] Reject alias ambiguity.
[ ] Reject unknown phase and border values.
[ ] Add deterministic product, validation, and reference templates.
[ ] Add deterministic WGSL generator.
[ ] Generate five canonical WGSL outputs.
[ ] Add generated headers and companion output manifest.
[ ] Hash ABI, coordinate, axial, border, and kernel fragments.
[ ] Verify shared fragment identity across all roles.
[ ] Preserve product shared-tile access.
[ ] Preserve direct-load reference independence.
[ ] Add R6 profile adapter over frozen R4 proof.
[ ] Compile canonical pipelines with 96-byte layouts.
[ ] Bind generated R6 outputs in canonical runtime.
[ ] Reject canonical v3 bundle and 80-byte buffers.
[ ] Add effective parameter and generated digest receipts.
[ ] Add binary64 kernel and border oracles.
[ ] Add default parity, sensitivity, DC, impulse, and border fixtures.
[ ] Add output, template, contract, manifest, and marker negative controls.
[ ] Admit generated runtime assets only.
[ ] Keep generator, templates, oracle, and fixtures outside runtime graph.
[ ] Verify zero CPU, Canvas, WebGL, reference, and v3 canonical fallback.
[ ] Run R1A through R5 predecessor regressions in isolation.
[ ] Restore all historical predecessor evidence.
[ ] Emit deterministic source receipts, diff, manifest, and ZIP digest.
[ ] Leave physical GPU and packaged Electron gates deferred.
[ ] Do not move the Production Pointer.
```
