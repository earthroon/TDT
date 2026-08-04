# QMAP-LIVE-WIRING-04-R2

## Existing LCMS Destination Authority Promotion / Verified Destination Profile Registry / Shared Output·Proof·Gamut Artifact Set / WebGPU Output Raster / Private Soft-Proof Surface / Sampled Gamut Membership Field / Preconverted CMYK PSD Serialization / Encoded ICC Digest Verification / No Encoder-Local Color Conversion Seal

## 0. Identity

```text
Patch ID = QMAP-LIVE-WIRING-04-R2
Parent = QMAP-LIVE-WIRING-04-R1
Code base = QMAP_LIVE_WIRING_04_R1_CODE_BAKED.zip
Code delivery = cumulative baked ZIP only
Repository delivery = this specification Markdown only
Terminal implementation state = QMAP_DESTINATION_PROFILE_PATH_ACTIVE
```

Repair target:

```text
LCMS logic already exists in input CMYK decode,
legacy soft proof and PSD RGB-to-CMYK output paths,
but destination profile identity, transform lifetime,
Preview proof and Export conversion are not owned by one authority.
```

R2 does not implement a new color-management engine.

R2 promotes the existing LCMS WASM ABI into one destination-profile and destination-transform authority and makes Preview proof and Export consume immutable artifacts from that authority.

## 1. Confirmed parent break

The parent contains:

```text
canonical linear-sRGB working surfaces
source-profile and source-to-working authority
physical CIEDE2000 Analysis
sRGB output profile authority
existing LCMS loader and WASM
legacy soft-proof paths
PSD worker-local RGBA8-to-CMYK8 LCMS conversion
```

The missing destination chain is:

```text
verified destination ICC bytes
→ immutable destination-profile snapshot
→ one destination transform key
→ output-device LUT
→ proof-display LUT
→ gamut-membership LUT
→ Preview-private proof surface and Export destination raster
```

Parent fragmentation:

```text
legacy proof_export.js
→ mutable global proof state and singleton transforms

legacy print_pipeline_bridge.js
→ separate WebGL proof LUT and optional cube fallback

PSD canonical worker
→ owns RGB-to-CMYK LCMS conversion inside encoder

WIRING-04-R1 transform authority
→ source-to-working direction only
```

Forbidden R2 interpretation:

```text
LCMS absent
CMYK output formula must be reimplemented
soft proof must become a product final
sampled gamut membership equals physical gamut distance
```

## 2. Required product topology

```text
canonical linear-sRGB working final
+ Destination Profile Authority snapshot
+ Destination Transform Artifact Set
├─ Export
│  → WebGPU output-device LUT
│  → preconverted destination raster
│  → encoder packages bytes and destination ICC
│  → encoded-file ICC extraction and digest verification
└─ Preview soft proof
   → WebGPU proof-display LUT
   → Preview-private proof surface
   → sampled destination gamut-membership Analysis field
```

The product final remains unchanged.

```text
soft-proof Pipeline writers = 0
soft-proof product-guide replacements = 0
soft-proof QMap source admissions = 0
soft-proof Delta-E product-source admissions = 0
```

## 3. State ownership and SSOT

```text
destination ICC bytes, digest, class, color space and format admission
= DestinationProfileAuthorityService

LCMS output/proof/gamut artifact-set key and cache
= DestinationTransformArtifactService

soft-proof user parameters and parameter revision
= SoftProofParameterAuthorityService

Preview-private proof surface and gamut field lifetime
= SoftProofPreviewCoordinatorService

physical destination-raster conversion
= DestinationRasterAuthorityService

physical proof and gamut field ownership
= SurfaceRegistryAuthorityService + AnalysisFieldAuthorityService

encoded JPEG/PSD ICC extraction and digest comparison
= EncodedProfileVerifierService

encoder and host-save orchestration
= ExportAuthorityService

LCMS implementation
= existing lcms_icmsA WASM and direct helper ABI
```

Forbidden SSOTs:

```text
DOM proof controls
window globals
profile URL strings
locale-derived CMYK profile names
encoder-local RGB-to-CMYK transforms
legacy proof singleton as product authority
ICC marker presence without digest comparison
```

## 4. Runtime services

```text
DestinationProfileAuthorityService
service ID = dadum.runtime.destination-profile-authority
capability = dadum.color.destination-profile-authority

DestinationTransformArtifactService
service ID = dadum.runtime.destination-transform-artifacts
capability = dadum.color.destination-transform-authority

DestinationRasterAuthorityService
service ID = dadum.runtime.destination-raster-authority
capability = dadum.color.destination-raster-authority

SoftProofParameterAuthorityService
service ID = dadum.runtime.soft-proof-parameters

SoftProofPreviewCoordinatorService
service ID = dadum.runtime.soft-proof-preview
capability = dadum.preview.soft-proof

EncodedProfileVerifierService
service ID = dadum.runtime.encoded-profile-verifier
capability = dadum.color.encoded-profile-verifier
```

Boot modules:

```text
dadum.module.color-management-w04r1
→ upgraded implementation identity tdt-color-management-w04r2-v1

dadum.module.color-soft-proof-w04r2
→ Preview proof and destination gamut Analysis ownership
```

## 5. Destination profile snapshot

Schema:

```text
tdt.color.destination-profile-snapshot.w04r2.v1
```

Required fields:

```text
destinationProfileId
destinationProfileDigest
destinationProfileByteLength
destinationProfileClass
destinationColorSpace
destinationPCS
destinationProfileSource
profileRevision
admittedOutputFormats
admittedRenderingIntents
profileAuthorityReceiptDigest
exact ICC bytes
```

Profile sources:

```text
RUNTIME_GENERATED_CANONICAL
BUNDLED_VERIFIED
USER_IMPORTED_VERIFIED
```

All ICC bytes pass the existing W04-R1 parser before registration.

Admitted destination classes:

```text
mntr
prtr
spac
```

Admitted destination color spaces:

```text
RGB
CMYK
```

A CMYK destination requires:

```text
deviceClass = prtr
output format = PSD
actual registered ICC bytes
```

R2 does not infer a CMYK profile from:

```text
JapanColor filename
locale
country
printer name
PSD mode alone
```

## 6. Built-in destination profiles

### 6.1 Canonical sRGB

```text
profile ID = tdt.color.output.srgb-iec61966-2-1.v1
profile digest = 3a3c6b80178393ac06bb35eed6ab55b1f4d999479a30c0e47a6817fa32ce9f4d
profile class = mntr
color space = RGB
PCS = XYZ
```

Admitted formats:

```text
jpg
jpeg
psd
png
png16
webp-lossless
jxl
```

### 6.2 Canonical Display P3

```text
profile ID = tdt.color.output.display-p3-d65.v1
profile class = mntr
color space = RGB
PCS = XYZ
```

Admitted formats:

```text
jpg
jpeg
psd
```

The deterministic generated profile is parsed and hashed before registration.

### 6.3 CMYK destination

No actual CMYK destination ICC is bundled in this baked ZIP.

```text
CMYK registry count at boot = 0
CMYK request without explicit registration = fail closed
```

R2 contains the authority and physical route but does not claim a production CMYK profile asset.

## 7. Rendering intents

Admitted intent IDs:

```text
RELATIVE_COLORIMETRIC_BPC
RELATIVE_COLORIMETRIC_NO_BPC
PERCEPTUAL_BPC
PERCEPTUAL_NO_BPC
```

Black-point compensation is derived from the intent suffix.

Conflicting caller options fail:

```text
intent says NO_BPC
+ blackPointCompensation=true
→ E_DESTINATION_RENDERING_INTENT_CONFLICT
```

Output intent and proof intent are independently recorded in the artifact key.

## 8. Destination transform key

```text
destinationTransformKeyDigest = digest(
  workingProfileDigest
  + destinationProfileDigest
  + displayProfileDigest
  + destinationColorSpace
  + outputRenderingIntent
  + proofRenderingIntent
  + blackPointCompensation
  + LCMS implementation identity
  + direct helper ABI version
  + grid size
  + interpolation policy
  + compiler version
)
```

Constants:

```text
compiler ID = tdt-color-destination-transform-compiler-w04r2-v1
LCMS identity = dadum.lcms.icmsA-existing-wasm-w04r2
grid size = 33
interpolation = trilinear-clamp-v1
```

The cache stores one promise per exact key.

Failed compilation evicts its key.

## 9. One immutable LCMS artifact set

Schema:

```text
tdt.color.destination-transform-artifact-set.w04r2.v1
```

Artifacts:

```text
outputDeviceLut
softProofDisplayLut
gamutMembershipLut
```

Each LUT is:

```text
33 × 33 × 33
RGBA float
immutable after publication
independently digested
```

Artifact-set evidence:

```text
artifactSetDigest
destinationTransformKeyDigest
workingProfileDigest
destinationProfileDigest
displayProfileDigest
destinationColorSpace
outputRenderingIntent
proofRenderingIntent
blackPointCompensation
outputDeviceLutDigest
softProofDisplayLutDigest
gamutMembershipLutDigest
compilerId
lcmsImplementationDigest
validation receipt
```

Preview and Export do not separately create transforms for the same key.

## 10. Existing LCMS worker promotion

Worker:

```text
app/legacy-runtime/workers/destination_color_transform_compiler.worker.mjs
```

The worker imports the existing:

```text
getLCMS()
lcms_icmsA module
```

RGB output LUT:

```text
cmsOpenProfileFromMem
cmsCreateTransform
cmsDoTransform
cmsDeleteTransform
```

CMYK output LUT:

```text
icms_xform_create_rgba8_to_cmyk8
icms_xform_apply_rgba8_to_cmyk8
icms_xform_destroy
```

Proof and gamut LUTs:

```text
cmsCreateProofingTransform
cmsFLAGS_SOFTPROOFING
cmsFLAGS_GAMUTCHECK
```

R2 does not duplicate LCMS conversion equations in TypeScript or WGSL.

WGSL performs only deterministic LUT interpolation and the explicit working/output transfer steps required by the artifact contract.

## 11. Artifact validation

Validation schema:

```text
validationKind = LCMS_DIRECT_VS_LUT_PARITY
oracleKind = LCMS_SHARED_ENGINE_NOT_INDEPENDENT
```

The fixture evaluates:

```text
512 held-out RGB samples
LCMS direct transform
vs
trilinear 33³ LUT interpolation
```

Admission thresholds in implementation:

```text
maximum channel error <= 3 / 255
mean channel error <= 0.75 / 255
```

Current deterministic fixture result:

```text
heldOutSampleCount = 512
maxChannelError = 0.0019531251168718455
admitted = true
```

Honest limitation:

```text
same LCMS engine generates direct and LUT results
independent CMS oracle = absent
proofDeltaE00Max = null
```

This verifies sampling and interpolation wiring. It does not prove parity against another CMS implementation.

## 12. Gamut field semantics

Semantic ID:

```text
tdt.analysis.gamut.destination-membership.w04r2.v1
```

Producer:

```text
tdt.analysis.producer.destination-gamut.w04r2
```

Packing:

```text
R = sampled LCMS destination out-of-gamut membership confidence
G = 0
B = 0
A = validity
```

Format:

```text
rgba16float
coordinate space = stage-pixel
claim level = EFFECTIVE_EXECUTION
```

The field is explicitly not:

```text
physical gamut boundary distance
Delta-E to gamut boundary
signed distance field
gamut-volume metric
```

Metadata includes:

```text
membershipKind = LCMS_GAMUT_CHECK_SAMPLED_CONFIDENCE
physicalDistance = false
destinationProfileDigest
artifactSetDigest
parameterDigest
colorLineageDigest
```

## 13. Soft-proof parameters

Schema:

```text
tdt.color.soft-proof-parameters.w04r2.v1
```

Snapshot:

```text
enabled
destinationProfileId
destinationProfileDigest
outputRenderingIntent
proofRenderingIntent
blackPointCompensation
gamutWarningEnabled
gamutWarningOpacity
parameterRevision
parameterDigest
```

Default:

```text
enabled = false
destination = canonical sRGB
gamut warning opacity = 0.45
```

Parameter changes do not mutate Pipeline final evidence.

## 14. Preview-private soft proof

Input:

```text
current Pipeline final pin
rgba16float
premultiplied linear-sRGB working contract
current destination profile snapshot
current artifact set
current soft-proof parameter snapshot
```

Physical graph:

```text
working final
→ explicit sRGB OETF for LUT domain
→ proof-display LUT
→ explicit sRGB EOTF
→ rgba16float premultiplied proof surface

working final
→ gamut-membership LUT
→ rgba16float gamut Analysis field
```

Both outputs are written in one compute pass and one queue submission.

Proof surface evidence:

```text
softProofPrivate = true
pipelinePublished = false
pipelineWriterCount = 0
productGuideReplacementCount = 0
destinationProfileDigest
artifactSetDigest
softProofParameterDigest
gamutFieldId and generation
```

Lifetime:

```text
owner pin held by SoftProofPreviewCoordinatorService
Preview acquires a consumer pin
parameter/final supersession retires old proof surface and gamut field
```

Forbidden consumers:

```text
QMap base source
Delta-E product source
adaptive replay source
Export product source
Pipeline final writer
```

## 15. Soft-proof submission accounting

A new proof key performs:

```text
soft-proof GPU submissions = 1
proof passes = 1
gamut field passes = same pass
intermediate readbacks = 0
Pipeline writers = 0
```

Soft-proof-only parameter change performs:

```text
EWA = 0
QMap = 0
QWave = 0
product Delta-E = 0
EFC = 0
Pipeline final revision increment = 0
```

Repeated presentation of an unchanged proof key reuses the existing proof surface.

## 16. Destination raster authority

Service:

```text
DestinationRasterAuthorityService
GPU consumer = dadum.gpu.consumer.destination-color-transform
```

Input:

```text
frozen authoritative working final texture
DestinationProfileSnapshot
DestinationTransformArtifactSet
Export operation ID
```

WGSL:

```text
destination_color_apply_w04r2.wgsl
```

Physical route:

```text
safe unpremultiply working RGB
→ explicit sRGB OETF for LCMS LUT domain
→ output-device LUT trilinear interpolation
→ destination RGB8 or native CMYK8
→ separate alpha8
```

Submission accounting:

```text
queue submissions = 1
compute passes = 1
intermediate pixel readbacks = 0
terminal device readbacks = 2
encoder-local color conversion = false
```

RGB result:

```text
storage = rgba8unorm
```

CMYK result:

```text
storage = cmyk8-preconverted
C/M/Y/K native bytes + separate alpha8
```

## 17. Export route

```text
shared or requested-size frozen working final
→ destination profile admission
→ destination artifact set acquisition
→ DestinationRasterAuthorityService
→ encoder receives already converted raster
→ encoder serializes file structure and profile carrier
→ EncodedProfileVerifierService
→ host save
```

Export no longer gives the encoder a working-linear GPU texture as color-conversion authority.

Encoder input source labels:

```text
runtime-final-destination-raster
qmap-export-private-destination-raster
```

Requested-size Export preserves:

```text
private EWA/QMap/QWave/Delta-E/EFC path
Pipeline writers = 0
product guide replacements = 0
encoder-local resize = 0
encoder-local color conversion = 0
```

## 18. CMYK PSD encoder retirement

Legacy mode remains for unrelated compatibility callers:

```text
flattened-cmyk8
RGBA8 → worker-local LCMS → CMYK8
```

The R2 Runtime Export route uses only:

```text
flattened-cmyk8-preconverted
sourcePixelFormat = cmyk8-alpha8-preconverted
colorTransform.mode = preconverted-cmyk8
```

Worker behavior:

```text
receive native C/M/Y/K bytes + alpha
invert native CMYK bytes for PSD storage
split five planes
serialize PSD
embed exact destination ICC
```

Receipt:

```text
colorTransformApplied = false
colorTransformRealm = none
colorTransformImplementationId = dadum.destination-raster-authority-w04r2
transformApplyCount = 0
outputSamplePolicy = destination-authority-native-cmyk8
psdStoragePolicy = invert-cmyk8-for-psd-v1
```

The Runtime R2 route may not select worker-local `rgba8-to-cmyk8`.

## 19. RGB encoder behavior

RGB encoders receive an already destination-transformed RGBA8 raster.

The encoder may:

```text
compress
serialize metadata
write format structure
write exact ICC carrier when required
```

The encoder may not:

```text
apply destination profile conversion
apply proof transform
apply gamut mapping outside the chosen LCMS artifact
replace destination ICC bytes
```

## 20. Profile carrier policy

Carrier-required formats:

```text
JPEG
PSD
```

Other admitted sRGB formats use their standard color-encoding authority and do not claim an extracted ICC carrier.

Display P3 admission is limited to carrier-capable formats in R2.

CMYK admission is limited to PSD.

## 21. Encoded ICC verification

### JPEG

```text
scan APP2 segments
select ICC_PROFILE\0 chunks
validate sequence and total counts
sort chunks by sequence
reassemble exact ICC bytes
SHA-256 compare to destinationProfileDigest
```

### PSD

```text
parse image resources section
locate resource signature 8BIM
locate resource ID 1039
extract exact ICC bytes
SHA-256 compare to destinationProfileDigest
```

Stable outcomes:

```text
required carrier missing → fail
extracted digest mismatch → fail
exact digest match → pass
```

A file containing any ICC marker does not pass unless the reconstructed bytes match the destination profile digest.

## 22. Export receipt evidence

R2 receipts include:

```text
outputProfileId
outputProfileDigest
destinationProfileClass
destinationColorSpace
outputRenderingIntent
proofRenderingIntent
blackPointCompensation
destinationTransformArtifactSetDigest
outputDeviceLutDigest
workingToOutputTransformId
workingToOutputTransformDigest
encodedProfileCarrierKind
encodedProfileDigest
encodedProfileDigestMatch
encoderLocalColorConversion = false
destinationRasterReceiptDigest
```

For preconverted CMYK PSD:

```text
psdColorTransformApplied = false
psdColorTransformRealm = none
psdLcmsArtifactSetDigest = destination artifact-set digest
psdDestinationProfileSha256 = exact destination profile digest
psdNativeCmykDigest
psdStoredCmykPlaneDigests
```

## 23. Submission matrix

New source/profile product generation from W04-R1 remains:

```text
source-to-working canonicalization = 1
QMap = 5
QWave = 2
Delta-E = 1
EFC = 1
product total = 10
```

Soft-proof build:

```text
proof + gamut = 1
product recomputation = 0
```

Same-size destination Export:

```text
destination raster = 1
encoder serialization = CPU/worker format operation
Pipeline writers = 0
```

Requested-size adaptive destination Export:

```text
private EWA = 1
private QMap = 5
private QWave = 2
private Delta-E = 1
private EFC = 1
destination raster = 1
GPU total after canonical source exists = 11
Pipeline writers = 0
```

## 24. Primary implementation files

New runtime files:

```text
app/src/runtime/color/destination-transform-types.ts
app/src/runtime/color/canonical-display-p3-output-profile.ts
app/src/runtime/color/destination-profile-authority-service.ts
app/src/runtime/color/destination-transform-artifact-service.ts
app/src/runtime/color/destination-raster-authority-service.ts
app/src/runtime/color/encoded-profile-verifier-service.ts
app/src/runtime/color/soft-proof-parameter-authority-service.ts
app/src/runtime/color/soft-proof-preview-coordinator-service.ts
```

New GPU and worker files:

```text
app/legacy-runtime/workers/destination_color_transform_compiler.worker.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/destination_color_apply_w04r2.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/softproof_gamut_w04r2.wgsl
```

Encoder and Export rewires:

```text
app/src/runtime/export/export-authority-service.ts
app/src/runtime/export/export-receipt.ts
app/src/runtime/codecs/encoder-registry-service.ts
app/src/runtime/codecs/jpeg/jpeg-structure-verifier-v2.ts
app/src/runtime/codecs/psd/psd-structure-verifier-v2.ts
app/legacy-runtime/export_manager.js
app/legacy-runtime/libs/psd/psd_export_bridge.js
app/legacy-runtime/worker-codecs/psd-canonical-handler.js
```

Boot and authority rewires:

```text
app/src/boot/runtime-modules.ts
app/src/boot/stable-error.ts
app/src/runtime/service-token.ts
app/src/runtime/preview/preview-presenter-service.ts
app/src/runtime/color/color-profile-parser-service.ts
```

Generated authority files:

```text
app/src/runtime/analysis/generated/generated-analysis-semantic-registry.json
app/src/runtime/gpu/gpu-consumer-manifest.json
app/src/legacy/generated-legacy-static-admission.json
app/src/runtime/active-graph/generated-active-runtime-graph.json
```

Verification tools:

```text
tools/qmap-live-wiring-04-r2/verify-lcms-artifact-set.mjs
tools/qmap-live-wiring-04-r2/verify-encoded-profile-extraction.mjs
tools/qmap-live-wiring-04-r2/verify-preconverted-cmyk-fixture.mjs
tools/qmap-live-wiring-04-r2/verify-source-wiring.mjs
tools/qmap-live-wiring-04-r2/verify-typescript-surface.mjs
tools/qmap-live-wiring-04-r2/rebind-manifests.mjs
tools/qmap-live-wiring-04-r2/verify-manifest-closure.mjs
```

## 25. Generated authority closure

R2 regenerates and verifies:

```text
Analysis semantic registry
GPU consumer manifest
legacy static-admission manifest
active runtime graph
W04-R2 source-authority extension digest
```

Stable generated identities at bake:

```text
semantic registry digest
= a947e2f0030d7408e6993d756d607324e550f22f11300cb0ec588fd8f2a3d0eb

legacy admission digest
= 1513afa85eb2367260349556eea6991d13e9b471b8d766b69ac13063c7552482

active graph digest
= 0adf59a75cafe3cbed476868005e1191d9fbde924ac6848e4d62df43f2cbf0d6

W04-R2 extension digest
= 736aa8a665c64f3b857acede4ba77f085627518203fb474973248b9d212d931b
```

Two consecutive rebind runs must produce identical digests.

## 26. Stable failures

Destination profile:

```text
E_DESTINATION_PROFILE_AUTHORITY_NOT_READY
E_DESTINATION_PROFILE_ID_INVALID
E_DESTINATION_PROFILE_CLASS_UNSUPPORTED
E_DESTINATION_PROFILE_SPACE_UNSUPPORTED
E_DESTINATION_PROFILE_NOT_REGISTERED
E_DESTINATION_PROFILE_FORMAT_UNSUPPORTED
```

Destination transform:

```text
E_DESTINATION_TRANSFORM_AUTHORITY_NOT_READY
E_DESTINATION_TRANSFORM_COMPILER_UNAVAILABLE
E_DESTINATION_ARTIFACT_COMPILE_FAILED
E_DESTINATION_ARTIFACT_PARITY_FAILED
E_DESTINATION_RENDERING_INTENT_UNSUPPORTED
E_DESTINATION_RENDERING_INTENT_CONFLICT
```

Destination raster:

```text
E_DESTINATION_RASTER_AUTHORITY_NOT_READY
E_DESTINATION_RASTER_INPUT_INVALID
E_DESTINATION_RASTER_SHADER_LOAD_FAILED
```

Soft proof:

```text
E_SOFT_PROOF_PARAMETERS_NOT_READY
E_SOFT_PROOF_AUTHORITY_NOT_READY
E_SOFT_PROOF_SOURCE_CONTRACT_INVALID
E_SOFT_PROOF_SHADER_LOAD_FAILED
```

Encoded profile:

```text
E_ENCODED_PROFILE_VERIFIER_NOT_READY
E_ENCODED_PROFILE_MISSING
E_ENCODED_PROFILE_DIGEST_MISMATCH
E_EXPORT_OUTPUT_PROFILE_MISMATCH
```

PSD preconverted route retains its dedicated source-format and profile failures.

## 27. Executable verification

R2 LCMS artifact fixture:

```text
existing LCMS ABI exercised through deterministic fake engine
RGB output LUT length = 33³ × 4
proof LUT length = 33³ × 4
gamut LUT length = 33³ × 4
held-out samples = 512
max channel error = 0.0019531251168718455
CMYK helper route = admitted
```

Destination profile authority fixture:

```text
actual ColorProfileParserService used
canonical sRGB registered
canonical Display P3 registered
registered profiles = 2
unregistered CMYK = rejected
```

Encoded profile extraction fixture:

```text
JPEG APP2 ICC chunks = 2, reconstructed exactly
PSD resource ID = 1039, extracted exactly
```

Preconverted CMYK fixture:

```text
pixels = 2
planes = C/M/Y/K/Alpha
PSD inversion verified
transformApplyCount = 0
```

Source and authority checks:

```text
R2 source wiring = PASS
manifest closure = PASS
TypeScript local surfaces = PASS, 17 files
changed JavaScript syntax = PASS, 13 files
```

Parent regression:

```text
WIRING-04-R1 = PASS
WIRING-04 Delta-E = PASS
WIRING-03-R1 private Export = PASS
WIRING-03 = PASS
WIRING-02 = PASS
R14D source gates = 352/352 PASS
R14D negative controls = 160/160 detected
R14E source gates = 384/384 PASS
R14E negative controls = 176/176 detected
R14E integration = PASS
R14E TypeScript diagnostics = 10 PASS
```

## 28. Honest unverified boundary

```text
packaged physical WebGPU destination-raster execution = NOT EXECUTED
packaged physical WebGPU soft-proof execution = NOT EXECUTED
real LCMS WASM artifact compilation in this Node fixture = NOT EXECUTED
independent CMS parity oracle = NOT IMPLEMENTED
independent Delta-E proof parity = NOT IMPLEMENTED
production CMYK destination ICC asset = NOT BUNDLED
physical CMYK PSD generated by the packaged runtime = NOT EXECUTED
physical Display P3 JPEG/PSD generated by the packaged runtime = NOT EXECUTED
physical encoded-file ICC extraction from full runtime output = NOT EXECUTED
monitor ICC soft proof = NOT IMPLEMENTED
physical gamut boundary distance = NOT IMPLEMENTED
```

The source fixtures and deterministic fake-LCMS ABI verify routing, artifact shape, held-out interpolation behavior and ownership contracts. They do not replace packaged GPU and real-profile qualification.

## 29. Completion criteria

```text
destination profile snapshots with exact ICC digest = 100%
destination artifact keys binding output and proof intent = 100%
Preview and Export separate destination transform creation = 0
soft-proof Pipeline writers = 0
soft-proof product-guide replacements = 0
soft-proof QMap source admissions = 0
soft-proof Delta-E product-source admissions = 0

Runtime Export encoder-local destination transforms = 0
Runtime CMYK PSD worker transformApplyCount = 0
caller-provided ICC replacement authority = 0
required JPEG/PSD carrier digest mismatches admitted = 0
unregistered CMYK destination fallbacks = 0
locale-derived CMYK profile assumptions = 0

sampled gamut field represented as physical distance = 0
independent CMS parity claims without oracle = 0
LCMS reimplementation claims = 0

terminal implementation state
= QMAP_DESTINATION_PROFILE_PATH_ACTIVE
```

## 30. Next boundary

```text
QMAP-LIVE-WIRING-04-R2-R1

Production CMYK Destination Profile Enrollment /
Real LCMS WASM Artifact Qualification /
Independent CMS Held-Out Oracle /
33³-to-65³ Escalation Policy /
Packaged WebGPU Destination Raster Execution /
Packaged Soft-Proof Device Matrix /
Physical JPEG·PSD ICC Carrier Extraction /
Display P3 and CMYK Output Pixel Parity /
No Fixture-Only Destination Promotion Seal
```

## 31. Final seal

```text
R2 does not invent a replacement CMS.
It promotes the existing LCMS implementation into one destination authority.
Destination ICC bytes are parsed, hashed, registered and format-gated before use.
Output, proof and gamut artifacts share one immutable transform key.
Soft proof is Preview-private and never replaces the product final.
The gamut field is sampled membership confidence, not physical distance.
Export receives an already destination-transformed raster.
The Runtime CMYK PSD route serializes preconverted CMYK and performs no worker-local color transform.
JPEG and PSD ICC carriers are extracted and compared by exact digest.
No CMYK profile is guessed when no actual registered profile exists.
Packaged GPU and real-profile qualification remain explicitly unverified.
```

Anything weaker remains:

```text
LCMS_LOGIC_PRESENT_BUT_DESTINATION_TRANSFORM_AUTHORITY_FRAGMENTED
```
