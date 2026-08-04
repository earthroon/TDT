# QMAP-LIVE-WIRING-04-R1

## ICC Source Profile Authority / Explicit Raw-Sample Decode / Canonical Linear-sRGB Working Surface / Matrix-TRC and LCMS CLUT Transform Artifacts / ICC PCS D50-to-Working D65 Adaptation / Surface Color Contract V2 / Profile-Bound QMap·Delta-E Lineage / Canonical sRGB Output Authority / No Browser-Managed Product Decode / No Implicit Primaries / No Source-ICC Re-embedding Seal

## 0. Identity

```text
Patch ID = QMAP-LIVE-WIRING-04-R1
Parent = QMAP-LIVE-WIRING-04
Code base = QMAP_LIVE_WIRING_04_CODE_BAKED.zip
Code delivery = cumulative baked ZIP only
Repository delivery = this specification Markdown only
Terminal state = QMAP_ICC_WORKING_SPACE_PATH_ACTIVE
```

Repair target:

```text
WIRING-04 has a physical CIEDE2000 field,
but imported sample values do not yet carry a complete source-profile,
source-to-working-transform and output-profile authority through the product path.
```

R1 closes the admitted SDR product path as:

```text
raw decoded samples
+ embedded/assumed/decoder-canonicalized profile authority
→ explicit source-to-working transform artifact
→ one canonical GPU color-conversion submission
→ linear-sRGB D65 rgba16float premultiplied working surface
→ EWA / QMap / QWave / CIEDE2000 / EFC
→ deterministic sRGB output authority
```

R1 does not implement arbitrary output profiles, monitor soft proofing, HDR transfer functions or an independent LCMS CLUT error oracle.

## 1. Confirmed parent break

Parent decoding and source upload had these gaps:

```text
ICC bytes may exist in decoder output
→ source bridge does not preserve a complete color-transform lineage

common 8-bit input
→ historically uploaded through rgba8unorm-srgb
→ GPU sampling silently performs an sRGB EOTF
→ non-sRGB RGB profiles are misinterpreted before Delta-E

non-QMap Final-EWA
→ carries linear transfer evidence
→ may not carry authoritative source profile, primaries, white point or transform digest

WIRING-04 Delta-E
→ assumes linear Rec.709 / sRGB D65
→ cannot prove that the source texture was actually canonicalized to that space

Export
→ may accept caller ICC options
→ may attach an ICC unrelated to the pixel encoding
```

Required correction:

```text
input profile interpretation authority
!= internal working-space authority
!= output destination-profile authority
```

## 2. Three profile meanings

### 2.1 Source profile

Defines what the imported sample values mean.

Examples:

```text
embedded RGB ICC
explicit decoder-canonicalized sRGB receipt
admitted missing-profile SDR sRGB assumption receipt
```

### 2.2 Working profile

Fixed for R1:

```text
workingProfileId
= tdt.color.working.linear-srgb-d65.v1

primaries = sRGB / Rec.709
white point = D65
transfer = linear
storage = rgba16float
alpha = premultiplied
```

All EWA, QMap, QWave, Delta-E and EFC product work consumes this working contract.

### 2.3 Output profile

Fixed for R1:

```text
outputProfileId
= tdt.color.output.srgb-iec61966-2-1.v1

workingToOutputTransformId
= tdt.color.transform.linear-srgb-to-srgb-oetf.v1
```

The source ICC is not reattached after the pixels have been converted into output sRGB.

## 3. State ownership and SSOT

```text
ICC validation and parsing
= ColorProfileParserService

source profile selection and authority receipt
= ColorProfileAuthorityService

source-to-working transform artifact cache
= ColorTransformArtifactService

canonical working texture production
= CanonicalWorkingSurfaceService

canonical working texture lifetime
= SurfaceRegistryAuthorityService

legacy decoded-source handoff
= DadumRuntimeColorBridge facade

color lineage propagation
= Surface Color Contract V2 + colorLineageDigest

QMap and Delta-E cache invalidation
= analysis/final keys containing colorLineageDigest

canonical output profile bytes and digest
= canonical-srgb-output-profile.ts

output transform and ICC option policy
= ExportAuthorityService
```

Forbidden SSOTs:

```text
DOM profile selectors
window globals as owning resources
browser canvas color conversion
texture format as implicit profile identity
caller-provided Export ICC bytes
surface evidence mutated after publication
legacy rgba8 Delta-E heatmap
```

Compatibility globals may expose borrowed Surface Registry resources only.

## 4. Source profile authority

Required service:

```text
ColorProfileAuthorityService
service ID = dadum.runtime.color-profile-authority
capability = dadum.color.profile-authority
```

Authority classes:

```text
EMBEDDED_ICC
ASSUMED_SRGB_WITH_RECEIPT
DECODER_CANONICALIZED
```

Every resolved profile receives:

```text
profile ID
profile SHA-256
profile authority
profile revision
profile authority receipt digest
```

### 4.1 Embedded ICC

```text
valid ICC bytes
+ optional decoder-provided ICC SHA-256
→ parser validation
→ exact digest comparison
→ EMBEDDED_ICC authority
```

A digest mismatch fails closed.

### 4.2 Missing profile assumption

Only admitted non-HDR common SDR raster sources may use:

```text
ASSUMED_SRGB_WITH_RECEIPT
```

The assumption reason is part of the profile identity.

This is explicit evidence, not a texture-format inference.

### 4.3 Decoder-canonicalized pixels

A decoder that has already transformed source pixels must provide a receipt containing at least:

```text
sourceProfileDigest
destinationProfileDigest
destinationProfileId
destinationTransfer
renderingIntent
blackPointCompensation
engine identity
```

The decoder receipt is hashed and included in the source sample descriptor and final color lineage.

A decoder-canonicalized sRGB-encoded result still receives the explicit sRGB EOTF in the canonical GPU pass.

A decoder-canonicalized linear-sRGB result uses the linear identity transform.

## 5. Browser and unproven decoder boundary

Browser-managed decode is preview-only.

```text
productColorAuthority = false
decoderColorAuthority = BROWSER_MANAGED_PREVIEW_ONLY
```

The product profile authority rejects it with:

```text
E_COLOR_BROWSER_PRODUCT_DECODE_FORBIDDEN
```

The current JXL decoder does not expose embedded ICC bytes or an explicit supported JXL color encoding. Its product result is therefore marked:

```text
productColorAuthority = false
decoderColorAuthority = JXL_COLOR_ENCODING_UNAVAILABLE
```

JXL preview may still exist, but authoritative QMap, Delta-E and Export admission is withheld until the decoder supplies color authority.

## 6. ICC parser

Required service:

```text
ColorProfileParserService
service ID = dadum.runtime.color-profile-parser
parser version = tdt-icc-parser-w04r1-v1
```

Physical validation:

```text
minimum profile size
big-endian declared size
acsp signature
ICC major version 2 or 4
bounded profile class
bounded source color-space signature
bounded PCS signature
tag table count and integer-overflow checks
tag offset and length checks
finite XYZ values
supported curve and parametric-curve types
monotonic sampled curves
```

Admitted parser classes:

```text
scnr
mntr
spac
```

Admitted parser source spaces:

```text
RGB
GRAY
CMYK
```

Admitted PCS:

```text
XYZ
Lab
```

Product transform restriction:

```text
embedded non-RGB profile
→ rejected unless the decoder produced a proven decoder-canonicalized RGB receipt
```

The R1 GPU canonicalizer consumes RGBA samples. It does not reinterpret RGBA samples with a CMYK profile.

## 7. Transform artifact authority

Required service:

```text
ColorTransformArtifactService
service ID = dadum.runtime.color-transform-artifacts
capability = dadum.color.transform-authority
compiler version = tdt-color-transform-compiler-w04r1-v1
```

Artifact cache key:

```text
profileDigest
+ profileAuthority
+ profileKind
```

A digest alone is insufficient because embedded matrix-TRC pixels and decoder-canonicalized sRGB pixels may share a destination-profile digest while requiring different transforms.

All artifacts bind:

```text
source profile digest
working profile ID and digest
rendering intent
black-point compensation
parser version
compiler version
artifact digest
```

R1 policy:

```text
renderingIntent = RELATIVE_COLORIMETRIC
blackPointCompensation = true
```

## 8. Exact sRGB and linear identity artifacts

### 8.1 Exact sRGB

```text
encoded sRGB sample
→ explicit piecewise sRGB EOTF
→ linear sRGB
```

No `rgba8unorm-srgb` source upload is admitted on the canonical path.

### 8.2 Linear sRGB identity

```text
proven linear-sRGB sample
→ finite and alpha validation
→ canonical premultiplication
```

The identity route requires decoder evidence. A numeric float buffer alone is not proof of linear-sRGB meaning.

## 9. Matrix-TRC artifact

For an RGB matrix-TRC ICC profile:

```text
inverse source channel TRCs
→ source RGB to PCS XYZ D50
→ Bradford D50 to D65
→ XYZ D65 to linear sRGB
```

Physical artifact contents:

```text
9-element source-to-working matrix
4096-entry sampled TRC per channel
TRC LUT digest
transform digest
```

The matrix uses the ICC rXYZ/gXYZ/bXYZ column semantics and includes the D50-to-D65 chromatic adaptation.

## 10. LUT ICC artifact

LUT ICC profiles use:

```text
color_transform_compiler.worker.mjs
→ LCMS source profile to sRGB transform
→ deterministic 33 x 33 x 33 RGBA float CLUT
```

Worker output evidence:

```text
validationKind = LCMS_GRID_COMPILATION_RECEIPT
oracleVerified = false
gridSize = 33
sampleCount = 35937
```

The CLUT stores encoded sRGB destination values. The canonical WGSL explicitly applies the sRGB EOTF after CLUT interpolation before writing the linear working texture.

Honest R1 boundary:

```text
independent Delta-E oracle comparison = NOT IMPLEMENTED
33-to-65 cube escalation = NOT IMPLEMED
claimed CLUT interpolation tolerance = NONE
```

The code does not fabricate maximum, p99 or mean Delta-E validation values.

## 11. Raw sample upload contract

Canonical source upload uses explicit non-color-managed GPU formats.

```text
8-bit UNORM RGBA
→ rgba8unorm

16-bit UNORM RGBA
→ rgba16unorm

half-float RGBA
→ rgba16float

float RGBA
→ rgba32float
```

Forbidden:

```text
canonical source upload as rgba8unorm-srgb
implicit GPU EOTF
Uint16 exact samples relabeled as float16
float16 bits relabeled as UNORM16
```

Native 16-bit input remains exact `Uint16Array` UNORM for the canonical GPU upload.

Legacy preview converts the same exact UNORM16 values to 8-bit presentation bytes with:

```text
round(value / 257)
```

The preview conversion does not mutate the product source samples.

## 12. CMYK PSD decoder receipt

The existing CMYK PSD path performs a decoder-owned LCMS conversion before canonical working-surface creation.

After conversion:

```text
pixel encoding = sRGB encoded RGBA8
embedded source CMYK ICC on pixel object = cleared
decoder transform receipt = retained
source CMYK profile digest = retained in receipt
destination profile digest = canonical sRGB profile digest
```

This prevents the already-converted sRGB pixels from being interpreted a second time using the original CMYK profile.

The decoder transform receipt is included in `colorLineageDigest`.

## 13. Canonical working-surface GPU graph

Required service:

```text
CanonicalWorkingSurfaceService
service ID = dadum.runtime.canonical-working-surface
producer ID = tdt.color.canonical-working-surface.w04r1
GPU owner = dadum.gpu.consumer.color-canonicalization
```

One source/profile canonicalization performs:

```text
source texture upload
→ one compute pass*→ one queue submission
→ one queue completion fence
→ rgba16float working surface registration
```

The shader consumes:

```text
source texture
transform mode
TRC LUT storage buffer
CLUT storage buffer
source-to-working matrix
alpha epsilon
input-premultiplied flag
```

Transform modes:

```text
SRGB_EXACT
MATRIX_TRC
LCMS_CLUT_33
LINEAR_SRGB_IDENTITY
```

## 14. Alpha policy

```text
alphaEpsilon = 1 / 1024
```

Input handling:

```text
straight input
→ transform RGB directly
→ premultiply after transform

premultiplied input
→ safe unpremultiply
→ transform straight RGB
→ premultiply after transform

alpha <= epsilon
→ RGB = 0
→ alpha = 0
```

Hidden RGB under transparent pixels is not product authority.

## 15. Surface Color Contract V2

Every canonical working surface carries:

```text
schemaId = tdt.surface-color-contract.v2
colorDomain = WORKING_LINEAR
transferId = linear
primariesId = srgb-rec709
whitePointId = D65
alphaMode = premultiplied

sourceProfileId
sourceProfileDigest
sourceProfileAuthority
originalSourceProfileDigest
decoderColorTransformDigest

workingProfileId
workingProfileDigest
sourceToWorkingTransformId
sourceToWorkingTransformDigest

renderingIntent
blackPointCompensation
sourceSampleDescriptorDigest
profileRevision
colorLineageDigest
```

For ordinary embedded RGB input:

```text
originalSourceProfileDigest = sourceProfileDigest
decoderColorTransformDigest = null
```

For decoder-canonicalized CMYK input:

```text
sourceProfileDigest = current sRGB sample-profile digest
originalSourceProfileDigest = original CMYK profile digest
decoderColorTransformDigest = decoder receipt digest
```

## 16. Color lineage digest

```text
colorLineageDigest = digest(
  current sample profile digest
  + original source profile digest
  + profile authority
  + decoder transform receipt digest
  + working profile digest
  + source-to-working transform digest
  + rendering intent
  + black-point compensation
  + exact source sample descriptor digest
  + profile revision
  + canonicalization shader identity
)
```

The source sample descriptor binds:

```text
storage format
dimensions
sample bit depth
channel order
sample encoding
alpha mode
decoder transform receipt digest
```

A profile or decoder-transform change therefore produces a new lineage even when dimensions and pixel buffer identity appear unchanged.

## 17. Source bridge and resource ownership

Legacy source flow:

```text
decodeAnyToSurface
→ installSourceSurfaceState
→ DadumRuntimeColorBridge.canonicalizeDecodedSource
→ CanonicalWorkingSurfaceService
→ Surface Registry owner pin
→ borrowed compatibility global
```

Removed authority:

```text
legacy qmap adapter priming inside webgpu_source_bridge.js
```

The compatibility global records:

```text
surface ID
borrowed texture/view/sampler
dimensions
working format
Surface Color Contract V2
colorLineageDigest
source and working profile digests
device epoch and identity
ownership = SURFACE_REGISTRY_BORROWED
```

It does not directly destroy the texture.

## 18. Downstream color-lineage binding

`colorLineageDigest` is propagated into:

```text
adaptive replay-source snapshot
QMap base-source snapshot
resample request and output evidence
QMap analysis key
Delta-E request and metadata
R14D product operation
final-surface producer key
requested-size Export key
Export receipt
```

Warm reuse across different color lineages is forbidden.

```text
same pixels + different source profile
→ different colorLineageDigest
→ cold canonicalization and cold product generation
```

## 19. Delta-E authority upgrade

WIRING-04 semantic:

```text
tdt.analysis.deltae00.pcs-d50.source-vs-reference-lowpass.r1.v1
```

Input admission:

```text
Surface Color Contract V2
WORKING_LINEAR
linear transfer
sRGB / Rec.709 primaries
D65 white point
premultiplied alpha
matching colorLineageDigest
```

Color conversion:

```text
linear sRGB D65
→ XYZ D65
→ Bradford D65 to D50
→ Lab D50
→ CIEDE2000
```

Delta-E field metadata binds:

```text
current sample profile digest
original source profile digest
decoder transform receipt digest
working profile digest
source-to-working transform digest
colorLineageDigest
PCS white point = D50
chromatic adaptation = Bradford D65 to D50
```

The same-resolution five-tap reference lowpass remains in the canonical linear working space. It is not profile-converted twice.

## 20. QMap·Delta-E composite guide

Composite guide admission requires equality of:

```text
QMap source surface and revision
Delta-E source surface and revision
QMap and Delta-E dimensions
QMap and Delta-E device epoch and identity
QMap and Delta-E colorLineageDigest
adaptive replay-source colorLineageDigest
```

A mixed-profile QMap/Delta-E pair fails closed.

Adaptive Policy R1E remains:

```text
binding 0 = QMap texture
binding 1 = Delta-E texture
binding 2 = policy output
binding 3 = 80-byte R1E parameters
```

## 21. Output profile authority

Runtime-generated canonical output profile:

```text
profile class = mntr
color space = RGB
PCS = XYZ
ICC major version = 2
matrix tags = wtpt / rXYZ / gXYZ / bXYZ
TRC tags = rTRC / gTRC / bTRC
TRC type = parametric function 4
byte length = 336
SHA-256 = 3a3c6b80178393ac06bb35eed6ab55b1f4d999479a30c0e47a6817fa32ce9f4d
```

The fixture parses these bytes through the actual `ColorProfileParserService` and compiles the resulting matrix-TRC transform artifact.

The output profile and transform digest are runtime-owned constants, not caller options.

## 22. Export color contract

Before encoding, Export requires:

```text
Surface Color Contract V2
WORKING_LINEAR
linear transfer
sRGB / Rec.709 primaries
D65 white point
premultiplied alpha
valid 64-hex color lineage and profile digests
valid original source profile digest
null or valid decoder transform digest
```

Caller ICC override keys are rejected:

```text
iccBytes
icc
customIcc
sourceIcc
profileBytes
```

Stable failure:

```text
E_EXPORT_CALLER_ICC_OVERRIDE_FORBIDDEN
```

The terminal GPU readback applies the sRGB output transfer before encoding.

## 23. Output carrier policy

```text
JPEG
→ canonical sRGB ICC bytes passed to encoder
→ outputProfileCarrierKind = ICC_PROFILE

PSD
→ canonical sRGB ICC bytes passed to encoder
→ outputProfileCarrierKind = ICC_PROFILE

PNG / PNG16 / JXL
→ standard sRGB encoding authority in receipt
→ outputProfileCarrierKind = STANDARD_SRGB_ENCODING

other admitted formats
→ standard sRGB assumption in receipt
→ outputProfileCarrierKind = STANDARD_SRGB_ASSUMPTION
```

Honest verification boundary:

```text
encoder option wiring = VERIFIED
canonical ICC byte generation and parser round trip = VERIFIED
physical encoded-file ICC extraction and digest comparison = NOT EXECUTED
multi-format packaged output inspection = NOT EXECUTED
```

No claim is made that every codec physically embeds an ICC chunk.

## 24. Export receipt lineage

Export receipts include:

```text
sourceColorLineageDigest
sourceProfileDigest
originalSourceProfileDigest
decoderColorTransformDigest
workingProfileDigest
outputProfileId
outputProfileDigest
workingToOutputTransformId
workingToOutputTransformDigest
outputProfileCarrierKind
callerIccOverrideAdmitted = false
```

Same-size and requested-size Export both bind the exact frozen working-color lineage.

Requested-size private Export preserves:

```text
Pipeline writers = 0
product guide replacements = 0
encoder-local resize = 0
```

## 25. Submission accounting

New admitted source/profile revision:

```text
canonical working-surface transform = 1 submission
QMap = 5
QWave = 2
Delta-E = 1
EFC = 1
product total = 10 submissions
```

Effect-only edit:

```text
canonicalization = 0
QMap = 0
QWave = 0
Delta-E = 0
EFC = 1
```

Unchanged Preview or same-size Export:

```text
additional submissions = 0
```

Requested-size adaptive Export after source canonicalization:

```text
private EWA = 1
private QMap = 5
private QWave = 2
private Delta-E = 1
private EFC = 1
private total = 10
Pipeline writers = 0
```

## 26. Boot composition

```text
GPU authority
→ Surface Registry
→ Color Profile Parser
→ Source Profile Authority
→ Color Transform Artifact Authority
→ Canonical Working Surface
→ QMap adaptive source and base-source authorities
→ QMap/QWave/Delta-E retained generation
→ Adaptive Policy R1E
→ Preview and Export
```

Color-management module:

```text
module ID = dadum.module.color-management-w04r1
provides:
  dadum.color.profile-authority
  dadum.color.transform-authority
  dadum.color.working-surface
```

## 27. Primary implementation files

New runtime files:

```text
app/src/runtime/color/color-profile-types.ts
app/src/runtime/color/color-profile-parser-service.ts
app/src/runtime/color/color-profile-authority-service.ts
app/src/runtime/color/color-transform-artifact-service.ts
app/src/runtime/color/canonical-working-surface-service.ts
app/src/runtime/color/canonical-srgb-output-profile.ts
app/legacy-runtime/core/compute/qmap_webgpu/shaders/canonical_color_transform_wgsl04r1.wgsl
app/legacy-runtime/workers/color_transform_compiler.worker.mjs
```

Primary rewires:

```text
app/legacy-runtime/decoders/decoded_surface.js
app/legacy-runtime/decoders/decode_native_surface.js
app/legacy-runtime/decoders/decode_psd_surface.js
app/legacy-runtime/decoders/decode_jxl_surface.js
app/legacy-runtime/decoders/decode_browser_surface.js
app/legacy-runtime/native/native_decode_bridge.js
app/legacy-runtime/input/source_surface_state.js
app/legacy-runtime/input/webgpu_source_bridge.js
app/legacy-runtime/image_input_bind.js

app/src/boot/runtime-modules.ts
app/src/boot/stable-error.ts
app/src/runtime/service-token.ts
app/src/env.d.ts
app/src/runtime/surfaces/surface-registry-authority-service.ts

app/src/runtime/qmap/qmap-adaptive-resample-source-authority-service.ts
app/src/runtime/qmap/qmap-base-source-lineage-service.ts
app/src/runtime/qmap/qmap-adaptive-resample-coordinator-service.ts
app/src/runtime/qmap/qmap-export-requested-size-coordinator-service.ts
app/src/runtime/qmap/qmap-final-surface-request-factory-service.ts
app/src/runtime/qmap/qmap-export-private-final-request-factory-service.ts
app/src/runtime/qmap/qmap-efc-final-surface-types.ts
app/src/runtime/resample/canonical-resample-executor-r8a.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_r14d_surface_registration.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_04_deltae_analysis.mjs

app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
```

Authority and verification files:

```text
app/src/runtime/gpu/gpu-consumer-manifest.json
app/src/runtime/analysis/generated/generated-analysis-semantic-registry.json
app/src/legacy/generated-legacy-static-admission.json
app/src/runtime/active-graph/generated-active-runtime-graph.json

tools/qmap-live-wiring-04-r1/rebind-manifests.mjs
tools/qmap-live-wiring-04-r1/verify-output-profile-fixture.mjs
tools/qmap-live-wiring-04-r1/verify-source-wiring.mjs
tools/qmap-live-wiring-04-r1/verify-manifest-closure.mjs
tools/qmap-live-wiring-04-r1/verify-typescript-surface.mjs
```

## 28. Generated authority closure

Patch-specific rebind verifies and regenerates:

```text
Delta-E semantic descriptor digest
analysis semantic registry digest
legacy static-admission file hashes and digest
active runtime graph source hashes and graph digest
WIRING-04-R1 source-authority extension digest
```

Admitted runtime assets include:

```text
canonical color WGSL
color transform compiler worker
LCMS loader
LCMS module
LCMS WASM
```

No manifest hash is bypassed to make the patch pass.

## 29. Stable failures

Profile authority:

```text
E_COLOR_PROFILE_AUTHORITY_NOT_READY
E_COLOR_PROFILE_HEADER_INVALID
E_COLOR_PROFILE_SIGNATURE_INVALID
E_COLOR_PROFILE_VERSION_UNSUPPORTED
E_COLOR_PROFILE_CLASS_UNSUPPORTED
E_COLOR_PROFILE_SPACE_UNSUPPORTED
E_COLOR_PROFILE_PCS_UNSUPPORTED
E_COLOR_PROFILE_TAG_TABLE_INVALID
E_COLOR_PROFILE_TAG_BOUNDS
E_COLOR_PROFILE_TRC_UNSUPPORTED
E_COLOR_PROFILE_TRC_NON_MONOTONIC
E_COLOR_PROFILE_DIGEST_INVALID
E_COLOR_PROFILE_DIGEST_MISMATCH
E_COLOR_PROFILE_MISSING
E_COLOR_BROWSER_PRODUCT_DECODE_FORBIDDEN
```

Transform authority:

```text
E_COLOR_TRANSFORM_AUTHORITY_NOT_READY
E_COLOR_TRANSFORM_MATRIX_INVALID
E_COLOR_TRANSFORM_TRC_MISSING
E_COLOR_PROFILE_CLUT_COMPILER_UNAVAILABLE
E_COLOR_PROFILE_CLUT_COMPILER_TIMEOUT
E_COLOR_PROFILE_CLUT_VALIDATION_FAILED
```

Canonical surface:

```text
E_COLOR_CANONICALIZATION_NOT_READY
E_COLOR_CANONICALIZATION_INPUT_INVALID
E_COLOR_CANONICALIZATION_DEVICE_MISMATCH
E_COLOR_CANONICALIZATION_UPLOAD_INVALID
E_COLOR_CANONICALIZATION_FAILED
E_COLOR_CONTRACT_INVALID
E_COLOR_LINEAGE_MISMATCH
```

Export:

```text
E_EXPORT_COLOR_CONTRACT_INVALID
E_EXPORT_CALLER_ICC_OVERRIDE_FORBIDDEN
E_EXPORT_OUTPUT_PROFILE_MISMATCH
```

## 30. Executable verification

WIRING-04-R1 fixtures:

```text
canonical output ICC
→ bytes = 336
→ tags = 7
→ actual parser result = MATRIX_TRC
→ actual transform artifact = MATRIX_TRC
→ digest = 3a3c6b80178393ac06bb35eed6ab55b1f4d999479a30c0e47a6817fa32ce9f4d

decoder-canonicalized sRGB receipt
→ profile kind = SRGB
→ artifact kind = SRGB_EXACT

embedded CMYK profile over RGBA samples
→ rejected without decoder-canonicalized receipt

source wiring verifier
→ explicit raw upload
→ no legacy QMap adapter source owner
→ browser/JXL product rejection markers
→ CMYK decoder receipt
→ CLUT explicit EOTF
→ D50 Delta-E lineage
→ Export profile authority

manifest closure
→ semantic registry digest PASS
→ static-admission digest PASS
→ active graph digest PASS

TypeScript local transpilation
→ changed TypeScript surfaces PASS
```

Parent regression:

```text
WIRING-04 Delta-E fixture PASS
Delta-E submissions = 1
Delta-E passes = 3
Delta-E readbacks = 0
R1E ABI bytes = 80

WIRING-03-R1 private transaction PASS
private QMap = 5
private QWave = 2
private Delta-E = 1
private EFC = 1
Pipeline writers = 0
product guide evictions = 0

WIRING-03 guided path PASS
WIRING-02 analysis reuse PASS
WIRING-02 effect-only recomposition PASS

R14D source gates = 352 / 352 PASS
R14D negative controls = 160 / 160 detected
R14E source gates = 384 / 384 PASS
R14E negative controls = 176 / 176 detected
R14E local TypeScript diagnostics = 10 PASS
R14E live edit-loop integration = PASS
```

## 31. Honest unverified boundary

```text
packaged physical WebGPU source canonicalization = NOT EXECUTED
real matrix-TRC image pixel parity against an external CMS = NOT EXECUTED
LCMS CLUT independent Delta-E oracle = NOT IMPLEMENTED
65-cube CLUT escalation = NOT IMPLEMENTED
physical encoded-file ICC extraction = NOT EXECUTED
multi-format packaged Export profile inspection = NOT EXECUTED
JXL authoritative color metadata extraction = NOT IMPLEMENTED
monitor ICC soft proofing = NOT IMPLEMENTED
full project typecheck = NOT CLAIMED by overlay-only bake
```

These states are not rewritten as PASS by source gates.

## 32. Completion criteria

```text
admitted product source profiles with immutable authority = 100%
canonical working surfaces with Color Contract V2 = 100%
canonical working surfaces with colorLineageDigest = 100%

canonical rgba8unorm-srgb source uploads = 0
implicit product primaries = 0
browser-managed product decodes = 0
unproven JXL product decodes = 0
embedded non-RGB profiles over RGBA samples = 0
CMYK PSD double-profile applications = 0
Uint16 UNORM relabeled as float16 = 0

source/profile canonicalization submissions = 1 per admitted source canonicalization
full-frame CPU profile conversions in canonical path = 0
warm QMap/Delta-E reuse across color lineages = 0
mixed-lineage composite guides = 0

Delta-E D65-to-D50 adaptation presence = 100%
Delta-E color-lineage binding presence = 100%
QMap-as-Delta-E substitutions = 0

caller ICC override admissions = 0
source ICC re-embedded after output-sRGB conversion = 0
Export receipts missing output-profile authority = 0

stale color publications = 0
unreleased canonical working surfaces = 0
unreleased profile artifacts = 0

terminal state
= QMAP_ICC_WORKING_SPACE_PATH_ACTIVE
```

## 33. Non-goals

```text
arbitrary destination-profile Export
Display P3 output
CMYK output
monitor-profile soft proofing
perceptual-intent output selection
HDR PQ or HLG working path
independent LCMS CLUT oracle
65-cube automatic escalation
user-facing source-profile reassignment API
historical profile-revision replay
browser-managed authoritative decode
JXL authority without decoder color metadata
```

## 34. Next boundary

```text
QMAP-LIVE-WIRING-04-R2

Destination Profile Transform Authority /
Display P3 and CMYK Output Profiles /
Gamut Boundary Analysis Field /
Relative and Perceptual Intent Separation /
Soft-Proof Preview Surface /
Output-Profile-Bound Requested-Size Export /
Encoded-File Profile Extraction Verification /
No Encoder-Local Color Conversion Seal
```

## 35. Final seal

```text
Imported sample values are not assigned meaning by texture format.
Embedded ICC profiles are parsed, hashed and validated before product use.
Missing-profile SDR sRGB is an explicit assumption receipt, not an invisible fallback.
Browser-managed and color-unproven JXL decodes do not enter the product path.
Decoder-canonicalized pixels carry the original profile and transform receipt in their lineage.
CMYK PSD pixels are not transformed twice.
Exact 16-bit UNORM samples remain exact until the canonical GPU transform.
The canonical GPU pass writes one linear-sRGB D65 rgba16float premultiplied surface.
Every downstream QMap, Delta-E, EWA and Export key binds its colorLineageDigest.
Delta-E converts the canonical D65 working space to PCS Lab D50 exactly once.
Export uses one runtime-owned sRGB destination authority and rejects caller ICC replacement.
Source ICC bytes are not reattached to output-sRGB pixels.
LCMS CLUT compilation is not mislabeled as an independent color-error oracle.
```

Anything weaker remains:

```text
TRUE_DELTAE_PRESENT_BUT_SOURCE_PROFILE_AUTHORITY_UNSEALED
```
