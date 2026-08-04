# QMAP-LIVE-WIRING-04-R1

## ICC Source Profile Authority / Explicit Raw Sample Decode / Canonical Linear sRGB Working Surface / Matrix-TRC and LCMS CLUT Artifacts / Surface Color Contract V2 / Color-Lineage-Bound QMap and Delta-E / Canonical sRGB Output Authority / No Browser-Managed Product Decode / No Implicit Primaries / No Source ICC Re-embedding Seal

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
but imported samples do not yet carry a complete source-profile,
source-to-working-transform and output-profile authority through the product path.
```

Required admitted SDR product path:

```text
raw decoded samples
+ embedded, assumed or decoder-canonicalized profile authority
-> explicit source-to-working transform artifact
-> one canonical GPU color conversion submission
-> linear sRGB D65 rgba16float premultiplied working surface
-> EWA / QMap / QWave / CIEDE2000 / EFC
-> deterministic sRGB output authority
```

R1 does not implement arbitrary output profiles, monitor soft proofing, HDR transfer functions, an independent LCMS CLUT error oracle or authoritative JXL color metadata extraction.

## 1. Parent breaks

```text
ICC bytes may exist in decoder output
-> source bridge does not preserve complete color-transform lineage

common 8-bit input
-> historically uploaded as rgba8unorm-srgb
-> GPU sampling silently performs sRGB EOTF
-> non-sRGB RGB profiles are misinterpreted before Delta-E

non-QMap Final-EWA
-> may carry linear transfer evidence
-> may not carry authoritative source profile, primaries, white point or transform digest

WIRING-04 Delta-E
-> assumes linear Rec.709 / sRGB D65
-> cannot prove the input was canonicalized to that space

Export
-> may accept caller ICC options
-> may attach a profile unrelated to the encoded pixels
```

Required separation:

```text
input profile interpretation authority
!= internal working-space authority
!= output destination-profile authority
```

## 2. State ownership

```text
ICC validation and parsing
= ColorProfileParserService

source profile selection and authority receipt
= ColorProfileAuthorityService

source-to-working artifact cache
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
surface evidence mutation after publication
legacy rgba8 Delta-E heatmap
```

## 3. Three profile meanings

### Source profile

Defines what imported sample values mean.

```text
EMBEDDED_ICC
ASSUMED_SRGB_WITH_RECEIPT
DECODER_CANONICALIZED
```

### Working profile

```text
workingProfileId = tdt.color.working.linear-srgb-d65.v1
primaries = sRGB / Rec.709
white point = D65
transfer = linear
storage = rgba16float
alpha = premultiplied
```

All EWA, QMap, QWave, Delta-E and EFC product work consumes this contract.

### Output profile

```text
outputProfileId = tdt.color.output.srgb-iec61966-2-1.v1
workingToOutputTransformId = tdt.color.transform.linear-srgb-to-srgb-oetf.v1
```

The original source ICC is never attached to pixels already converted to output sRGB.

## 4. Source profile authority

Required service:

```text
ColorProfileAuthorityService
service ID = dadum.runtime.color-profile-authority
capability = dadum.color.profile-authority
```

Each resolved profile receives:

```text
profile ID
profile SHA-256
profile authority
profile revision
profile authority receipt digest
```

### Embedded ICC

```text
valid ICC bytes
+ optional decoder ICC SHA-256
-> parser validation
-> exact digest comparison
-> EMBEDDED_ICC authority
```

Digest mismatch fails closed.

### Missing profile

Only admitted non-HDR common SDR raster sources may use:

```text
ASSUMED_SRGB_WITH_RECEIPT
```

The assumption reason is part of the profile identity. This is not texture-format inference.

### Decoder-canonicalized pixels

A decoder-owned transform receipt binds:

```text
sourceProfileDigest
destinationProfileDigest
destinationProfileId
destinationTransfer
renderingIntent
blackPointCompensation
engine identity
```

The receipt digest becomes part of the exact source sample descriptor and color lineage.

## 5. Browser and JXL boundary

Browser-managed decode is preview-only:

```text
productColorAuthority = false
decoderColorAuthority = BROWSER_MANAGED_PREVIEW_ONLY
```

Stable rejection:

```text
E_COLOR_BROWSER_PRODUCT_DECODE_FORBIDDEN
```

The current JXL decoder does not expose embedded ICC bytes or a proven JXL color encoding. It therefore marks:

```text
productColorAuthority = false
decoderColorAuthority = JXL_COLOR_ENCODING_UNAVAILABLE
```

Authoritative QMap, Delta-E and Export admission remains blocked until decoder color authority exists.

## 6. ICC parser

Required service:

```text
ColorProfileParserService
service ID = dadum.runtime.color-profile-parser
parser version = tdt-icc-parser-w04r1-v1
```

Validation includes:

```text
minimum profile size
big-endian declared size
acsp signature
ICC v2 or v4
bounded profile class
bounded source color-space signature
bounded PCS signature
tag count and integer-overflow checks
tag offset and length checks
finite XYZ values
supported curve and parametric-curve types
monotonic sampled curves
```

Parser-admitted source signatures:

```text
RGB
GRAY
CMYK
```

Product transform restriction:

```text
embedded non-RGB profile over RGBA samples
-> rejected unless a proven decoder-canonicalized RGB receipt exists
```

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

A digest alone is insufficient because embedded matrix-TRC pixels and decoder-canonicalized sRGB pixels can share a destination-profile digest while requiring different transforms.

R1 policy:

```text
renderingIntent = RELATIVE_COLORIMETRIC
blackPointCompensation = true
```

## 8. Transform classes

### Exact sRGB

```text
encoded sRGB samples
-> explicit piecewise sRGB EOTF
-> linear sRGB
```

Canonical source upload as `rgba8unorm-srgb` is forbidden.

### Linear sRGB identity

```text
proven linear-sRGB samples
-> finite and alpha validation
-> canonical premultiplication
```

A numeric float buffer alone is not proof of linear-sRGB meaning.

### Matrix-TRC ICC

```text
inverse source channel TRCs
-> source RGB to PCS XYZ D50
-> Bradford D50 to D65
-> XYZ D65 to linear sRGB
```

Artifact contents:

```text
9-element source-to-working matrix
4096-entry sampled TRC per channel
TRC LUT digest
transform digest
```

### LUT ICC

```text
color_transform_compiler.worker.mjs
-> LCMS source profile to sRGB transform
-> deterministic 33 x 33 x 33 RGBA float CLUT
```

Worker receipt:

```text
validationKind = LCMS_GRID_COMPILATION_RECEIPT
oracleVerified = false
gridSize = 33
sampleCount = 35937
```

The CLUT stores encoded sRGB values. WGSL explicitly applies the sRGB EOTF after interpolation.

Honest boundary:

```text
independent Delta-E oracle = NOT IMPLEMENTED
33-to-65 cube escalation = NOT IMPLEMENTED
claimed CLUT interpolation tolerance = NONE
```

## 9. Raw sample upload contract

```text
8-bit UNORM RGBA -> rgba8unorm
16-bit UNORM RGBA -> rgba16unorm
half-float RGBA -> rgba16float
float RGBA -> rgba32float
```

Forbidden:

```text
implicit GPU EOTF
Uint16 UNORM relabeled as float16
float16 bits relabeled as UNORM16
```

Native 16-bit samples remain exact `Uint16Array` UNORM until the canonical GPU transform.

Legacy preview uses:

```text
round(value / 257)
```

and does not mutate product samples.

## 10. CMYK PSD decoder receipt

CMYK PSD uses a decoder-owned LCMS transform before canonical working-surface creation.

After conversion:

```text
pixels = sRGB encoded RGBA8
source CMYK ICC on pixel object = cleared
original CMYK profile digest = retained in receipt
destination profile digest = canonical sRGB digest
decoder transform receipt = retained
```

This prevents the converted pixels from being interpreted again with the original CMYK profile.

## 11. Canonical working-surface graph

Required service:

```text
CanonicalWorkingSurfaceService
service ID = dadum.runtime.canonical-working-surface
producer ID = tdt.color.canonical-working-surface.w04r1
GPU owner = dadum.gpu.consumer.color-canonicalization
```

One source/profile canonicalization:

```text
raw texture upload
-> one compute pass
-> one queue submission
-> one completion fence
-> rgba16float working surface registration
```

Transform modes:

```text
SRGB_EXACT
MATRIX_TRC
LCMS_CLUT_33
LINEAR_SRGB_IDENTITY
```

Alpha policy:

```text
alphaEpsilon = 1 / 1024
straight input -> transform -> premultiply
premultiplied input -> safe unpremultiply -> transform -> premultiply
alpha <= epsilon -> RGB = 0 and alpha = 0
```

## 12. Surface Color Contract V2

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

Color lineage binds:

```text
current sample profile digest
original source profile digest
profile authority
decoder transform receipt digest
working profile digest
source-to-working transform digest
rendering intent
black-point compensation
exact source sample descriptor digest
profile revision
canonicalization shader identity
```

## 13. Resource ownership

Legacy source flow:

```text
decodeAnyToSurface
-> installSourceSurfaceState
-> DadumRuntimeColorBridge.canonicalizeDecodedSource
-> CanonicalWorkingSurfaceService
-> Surface Registry owner pin
-> borrowed compatibility global
```

Removed authority:

```text
legacy QMap adapter priming inside webgpu_source_bridge.js
```

Compatibility globals never directly destroy the texture.

## 14. Downstream color-lineage binding

`colorLineageDigest` enters:

```text
adaptive replay-source snapshot
QMap base-source snapshot
resample request and output evidence
QMap analysis key
Delta-E request and metadata
R14D operation
final-surface producer key
requested-size Export key
Export receipt
```

Warm reuse across different color lineages is forbidden.

## 15. Delta-E authority upgrade

Semantic:

```text
tdt.analysis.deltae00.pcs-d50.source-vs-reference-lowpass.r1.v1
```

Input admission requires Color Contract V2 with:

```text
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
-> XYZ D65
-> Bradford D65 to D50
-> Lab D50
-> CIEDE2000
```

The same-resolution reference lowpass remains in canonical linear working space and is not converted twice.

## 16. Composite guide admission

Required equality:

```text
QMap source surface and revision
Delta-E source surface and revision
QMap and Delta-E dimensions
QMap and Delta-E device epoch and identity
QMap colorLineageDigest
Delta-E colorLineageDigest
adaptive replay-source colorLineageDigest
```

Mixed-lineage QMap and Delta-E fields fail closed.

Adaptive Policy R1E remains:

```text
binding 0 = QMap
binding 1 = Delta-E
binding 2 = policy output
binding 3 = 80-byte parameters
```

## 17. Output profile authority

Runtime-generated canonical sRGB profile:

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

The fixture parses these bytes through the actual parser and compiles a matrix-TRC artifact.

## 18. Export color contract

Export requires the frozen final to carry valid Color Contract V2 and valid lineage/profile digests.

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

Output carrier policy:

```text
JPEG -> canonical sRGB ICC bytes passed to encoder
PSD -> canonical sRGB ICC bytes passed to encoder
PNG / PNG16 / JXL -> standard sRGB encoding authority in receipt
other admitted formats -> standard sRGB assumption in receipt
```

No claim is made that every codec physically embeds an ICC chunk.

Export receipts bind:

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

## 19. Submission accounting

New admitted source/profile revision:

```text
canonicalization = 1
QMap = 5
QWave = 2
Delta-E = 1
EFC = 1
product total = 10
```

Effect-only edit:

```text
canonicalization = 0
QMap = 0
QWave = 0
Delta-E = 0
EFC = 1
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

## 20. Primary implementation files

New:

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
app/legacy-runtime/input/webgpu_source_bridge.js
app/src/boot/runtime-modules.ts
app/src/boot/stable-error.ts
app/src/runtime/service-token.ts
app/src/runtime/surfaces/surface-registry-authority-service.ts
app/src/runtime/qmap/* source, request, coordinator and receipt paths
app/src/runtime/resample/canonical-resample-executor-r8a.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_live_wiring_04_deltae_analysis.mjs
app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
```

## 21. Verification

```text
WIRING-04-R1 output profile fixture PASS
bytes = 336
tags = 7
parsed profile = MATRIX_TRC
compiled artifact = MATRIX_TRC

source wiring PASS files = 18
manifest closure PASS
TypeScript local surfaces PASS files = 19
changed JS/MJS syntax PASS files = 24

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

WIRING-03 PASS
WIRING-02 PASS
R14D source gates = 352 / 352 PASS
R14D negative controls = 160 / 160
R14E source gates = 384 / 384 PASS
R14E negative controls = 176 / 176
R14E TypeScript diagnostics = 10 PASS
R14E integration PASS
fresh ZIP verification PASS
```

## 22. Honest unverified boundary

```text
packaged physical WebGPU source canonicalization = NOT EXECUTED
real matrix-TRC pixel parity against external CMS = NOT EXECUTED
LCMS CLUT independent Delta-E oracle = NOT IMPLEMENTED
65-cube CLUT escalation = NOT IMPLEMENTED
physical encoded-file ICC extraction = NOT EXECUTED
multi-format packaged Export profile inspection = NOT EXECUTED
JXL authoritative color metadata extraction = NOT IMPLEMENTED
monitor ICC soft proofing = NOT IMPLEMENTED
full project typecheck = NOT CLAIMED by overlay-only bake
```

## 23. Completion criteria

```text
admitted product sources with immutable profile authority = 100%
canonical surfaces with Color Contract V2 = 100%
canonical surfaces with colorLineageDigest = 100%
canonical rgba8unorm-srgb source uploads = 0
implicit product primaries = 0
browser-managed product decodes = 0
unproven JXL product decodes = 0
embedded non-RGB profiles over RGBA samples = 0
CMYK PSD double-profile applications = 0
Uint16 UNORM relabeled as float16 = 0
warm QMap/Delta-E reuse across color lineages = 0
mixed-lineage composite guides = 0
Delta-E D65-to-D50 adaptation presence = 100%
caller ICC override admissions = 0
source ICC re-embedded after output-sRGB conversion = 0
stale color publications = 0
unreleased canonical working surfaces = 0

terminal state
= QMAP_ICC_WORKING_SPACE_PATH_ACTIVE
```

## 24. Next boundary

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

## 25. Final seal

```text
Imported sample meaning is never inferred from texture format.
Embedded ICC profiles are parsed, hashed and validated before product use.
Missing-profile SDR sRGB is an explicit receipt, not an invisible fallback.
Browser-managed and color-unproven JXL decodes do not enter the product path.
Decoder-canonicalized pixels retain original profile and transform lineage.
CMYK PSD pixels are not transformed twice.
Exact 16-bit UNORM samples remain exact until the canonical GPU transform.
One canonical GPU pass writes linear-sRGB D65 rgba16float premultiplied output.
Every downstream QMap, Delta-E, EWA and Export key binds colorLineageDigest.
Delta-E converts D65 working data to PCS Lab D50 exactly once.
Export uses one runtime-owned sRGB destination authority and rejects caller ICC replacement.
Source ICC bytes are not reattached to output-sRGB pixels.
LCMS CLUT compilation is not mislabeled as an independent color-error oracle.
```

Anything weaker remains:

```text
TRUE_DELTAE_PRESENT_BUT_SOURCE_PROFILE_AUTHORITY_UNSEALED
```
