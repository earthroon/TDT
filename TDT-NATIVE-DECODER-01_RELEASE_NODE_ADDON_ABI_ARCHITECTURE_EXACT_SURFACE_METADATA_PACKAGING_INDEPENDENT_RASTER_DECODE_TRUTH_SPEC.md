# TDT-NATIVE-DECODER-01

## Release `.node` Addon / ABI·Architecture / Exact Decode Surface / ICC·Resolution Metadata / Packaged Independent Raster Decode Truth Seal

- Spec ID: `TDT-NATIVE-DECODER-01`
- Spec version: `1.0.0`
- Status: `NORMATIVE_SPEC`
- Parent lineage:
  - `TDT-RUNTIME-SSOT-01-R7`
  - `TDT-EXPORT-WORKER-01` through `TDT-EXPORT-WORKER-07`
  - `TDT-EXPORT-PROMOTION-01` through `TDT-EXPORT-PROMOTION-03`
  - `TDT-BUILD-LOCK-01`
  - `TDT-BUILD-EMIT-01`
  - `TDT-MODJPEG-01`
- Target platform profile: `win32-x64-msvc`
- Product decoder identity: `dadum.decoder.native-raster-v1`
- Canonical native addon file: `decoder_rs.win32-x64-msvc.node`
- Canonical N-API surface: `dadum-native-decoder-abi-v1`
- Canonical validation profile: `core-export-raster-v1`

---

# 1. Purpose

This specification promotes the existing Rust `napi-rs` raster decoder source into one exact, independently verifiable, packaged Windows x64 native addon.

The task is not to add another browser decode fallback.

The task is to establish one authoritative chain:

```text
Canonical Rust source and locks
→ reproducible win32-x64-msvc Release build
→ exact .node artifact identity
→ PE / N-API / export ABI verification
→ exact PNG / JPEG / WebP decode surfaces
→ ICC / resolution metadata extraction
→ Electron Host attestation
→ Runtime Decoder Registry admission
→ packaged independent decoder execution
→ cross-format verification receipt
```

The native decoder is an independent verifier for exported PNG, JPEG, and WebP bytes.

It is not allowed to become an unverified presentation convenience that silently falls back to `createImageBitmap`.

---

# 2. Scope

## 2.1 Product promotion scope

The following formats are in the mandatory `core-export-raster-v1` profile:

| Format | Required decode output | Required role |
|---|---|---|
| PNG8 | exact RGBA8 | lossless independent round-trip |
| PNG16 | exact RGBA16LE UNORM | lossless independent round-trip |
| JPEG | RGBA8 / RGB-derived decode | lossy metric and structure verification |
| WebP Lossless | exact RGBA8 | lossless independent round-trip |

## 2.2 Secondary source-wired formats

The following formats may remain compiled or source-wired, but they do not receive product promotion from this specification:

- AVIF
- GIF
- BMP
- TIFF

They must not be advertised by the promoted product capability unless their own fixture and package execution rows pass.

## 2.3 Explicit exclusions

This specification does not promote:

- JXL decoding
- PSD decoding
- browser `createImageBitmap` as an independent decoder
- native image encoding
- implicit color conversion
- arbitrary renderer filesystem path decoding
- debug `.node` artifacts
- non-Windows package targets

JXL and PSD retain their separate independent decoder identities.

---

# 3. Current source audit

## 3.1 Existing Rust source

The repository contains:

```text
native/decoder-rs/Cargo.toml
native/decoder-rs/Cargo.lock
native/decoder-rs/build.rs
native/decoder-rs/src/lib.rs
native/decoder-rs/index.cjs
native/decoder-rs/index.js
native/decoder-rs/index.d.ts
native/decoder-rs/package.json
native/decoder-rs/package-lock.json
```

No `.node` file is currently present.

```text
currentReleaseNodeCount = 0
```

## 3.2 Current source identities

At the time of this specification, the audited source digests are:

| File | SHA-256 |
|---|---|
| `Cargo.toml` | `4867ce66440de1951d56884d4f3449ff4b9da7e6a11f3a680f2bc93bb2278ff4` |
| `Cargo.lock` | `da4fb3a62ad81bf6c812d6794581f4b9758cb37a3dde77655c0e22a6bba802a7` |
| `package.json` | `879f340d9fb1083250151017eb18a0155aa634f7f29ef75cb03a5c798f4f33f8` |
| `package-lock.json` | `6d000798e57168dfac51568cbf68c1f275daf04de5213a57715481bf9dd7cfab` |
| `src/lib.rs` | `2367fb0a91e583e5e25c61eeb3a703633080659ac5309e2ba645f29373c7022a` |
| `index.cjs` | `dfc7b571a9b7cfe137184d04828fd4f807efa0f882c2d7c493a0e848420fbf74` |
| `index.js` | `55ed0c15e8c6f154f39d7e4062402fde3f8cb2002a06bf5a1875a17fca6358dc` |
| `index.d.ts` | `ae032b8964f080219a080aaf5f7620c4b4a66c7e277aec9d67ee841de45a03f8` |

These digests are audit inputs, not permanent future constants.

The build receipt must seal the actual source digests used for the candidate artifact.

## 3.3 Current dependency facts

Current Cargo graph includes:

```text
image = 0.25.10
napi = 2.16.17
png = 0.18.1
tiff = 0.11.3
```

Current package toolchain is split:

```text
root @napi-rs/cli      = 2.18.4
native package request = ^3.2.0
native lock resolved   = 3.6.1
```

This split is not a canonical build input.

The promoted build must use one exact `@napi-rs/cli` identity and must not allow `npm exec` to fetch an undeclared version.

## 3.4 Current package version mismatch

Current identities are inconsistent:

```text
Cargo package version  = 0.2.0
npm package version    = 0.0.0
N-API binary stem      = decoder_rs
product decoder ID     = dadum.decoder.native-raster-v1
```

A promoted receipt must bind these to one explicit ABI identity without inferring compatibility from filenames.

## 3.5 Current availability truth defect

The Rust `status()` implementation returns:

```text
available = true
```

whenever the native function itself has been called.

The CommonJS loader correctly reports `available=false` when no binding is loaded, but the Runtime Decoder Registry currently registers `dadum.decoder.native-raster-v1` merely because the preload bridge exists.

Current flow:

```text
preload bridge exists
→ HostBridgeService.nativeDecode is non-null
→ Runtime Decoder Registry advertises native-raster-v1
```

This can advertise a decoder when no `.node` file exists.

The promoted flow must be:

```text
.node located
→ exact artifact identity verified
→ PE / N-API / ABI verified
→ native self-test passed
→ Electron Host attestation issued
→ Runtime Decoder Registry admits capability
```

## 3.6 Current loader ambiguity

`index.cjs` searches:

- package root
- `dist`
- `target/release`
- `target/debug`
- multiple possible names
- first arbitrary `.node` fallback

This is useful during development but unacceptable for a packaged product.

A packaged runtime must load exactly one canonical path and must never:

- search `target/debug`
- select the first `.node`
- accept a mismatched binary stem
- accept an unexpected architecture
- continue after the canonical candidate failed to load

## 3.7 Current precision defect

The current `prefer16Bit` path converts source U16 samples to IEEE half float bytes:

```text
source RGBA16 UNORM
→ normalize f32
→ convert f16
→ output storage rgba16float
```

This destroys exact U16 identity and cannot verify a PNG16 lossless round-trip.

The independent validation output must preserve:

```text
rgba16le-unorm-u16-v1
```

without floating-point conversion.

A presentation conversion to `rgba16float` may happen later, but only after the exact U16 digest has been recorded.

## 3.8 Current metadata defect

The Rust source currently returns:

```text
icc = None
resolution = None
color_space = "srgb"
```

for all decoded files.

This silently discards or invents metadata semantics.

The promoted decoder must extract and report format-native metadata without applying a color transform.

## 3.9 Current format-hint authority defect

The current decoder can use `format_hint` to force `load_from_memory_with_format`.

The format hint must not override byte truth.

The promoted decoder must compare:

- magic / container signature
- independent format sniff result
- requested format hint
- MIME hint
- filename extension

A material disagreement must fail closed.

## 3.10 Current decode budget defect

The current source has no explicit product limit for:

- input byte length
- width
- height
- pixel count
- decoded output bytes
- metadata bytes

The promoted decoder must reject decompression-bomb inputs before unbounded allocation.

---

# 4. Canonical identities

## 4.1 Product decoder identity

```text
decoderId = dadum.decoder.native-raster-v1
```

## 4.2 Native ABI identity

```text
nativeAbiId = dadum-native-decoder-abi-v1
```

## 4.3 Build profile identity

```text
nativeBuildProfileId = dadum-native-decoder-win32-x64-msvc-release-v1
```

## 4.4 Package artifact identity

```text
canonicalAddonFilename = decoder_rs.win32-x64-msvc.node
canonicalAddonPackagePath = native/decoder-rs/decoder_rs.win32-x64-msvc.node
canonicalUnpackedPath = app.asar.unpacked/native/decoder-rs/decoder_rs.win32-x64-msvc.node
```

## 4.5 Validation profile identity

```text
validationProfileId = core-export-raster-v1
```

## 4.6 Decode surface ABI

```text
decodeSurfaceAbiId = dadum-native-decoded-surface-v2
```

---

# 5. Canonical native toolchain

## 5.1 Required toolchain inputs

The native build profile must explicitly seal:

- Rust toolchain version
- Cargo version
- target triple
- MSVC linker identity
- Windows SDK version
- N-API version
- `@napi-rs/cli` exact version
- Cargo config
- environment variables affecting code generation
- source and lock digests

No value may be inherited silently from a developer shell.

## 5.2 Target triple

```text
targetTriple = x86_64-pc-windows-msvc
```

## 5.3 Build mode

```text
profile = release
panic = unwind-or-catch-at-NAPI-boundary
incremental = false
debug = 0
strip = symbols
```

The exact panic policy must be recorded.

A Rust panic must never terminate the Electron main process without a structured error receipt.

## 5.4 Reproducibility flags

The candidate build must enable deterministic PE output where supported.

Required controls include:

- clean workspace
- fixed source path mapping
- fixed target directory shape
- disabled incremental compilation
- `/Brepro` or equivalent deterministic linker mode
- no embedded absolute workspace path
- no debug PDB path in the shipped addon
- fixed environment input manifest

## 5.5 Native npm toolchain single source

The root and nested native package must not resolve different `@napi-rs/cli` versions.

One of the following exact policies must be selected and sealed:

```text
root-owned-cli-v1
native-package-owned-cli-v1
```

Silent `npm exec` network acquisition is forbidden.

The current mixed `2.18.4` / `3.6.1` state is a blocker.

## 5.6 Cargo lock immutability

Native builds must execute with:

```text
cargo build --locked --frozen
```

or the exact equivalent issued by the pinned `napi` CLI.

`Cargo.lock` mutation during Build A or B is forbidden.

## 5.7 Native package-lock immutability

If the nested npm package remains authoritative, its lock must pass the same principles as `TDT-BUILD-LOCK-01`:

- exact root graph
- offline cache closure
- immutable install
- lock mutation zero

---

# 6. Canonical build A/B

## 6.1 Clean Build A

Build A must start from:

- clean source checkout
- empty Cargo target directory
- empty native package `node_modules`
- frozen Cargo registry/cache snapshot
- frozen npm cache snapshot
- canonical Windows x64 host profile

## 6.2 Clean Build B

Build B must use a different absolute workspace path and a clean output directory.

## 6.3 Required parity

The following must be byte-identical between A and B:

- `.node` byte length
- `.node` SHA-256
- PE section layout digest
- export table digest
- import table digest
- native ABI descriptor
- generated TypeScript declaration
- generated CommonJS loader, if regenerated

## 6.4 Non-deterministic build handling

A non-identical `.node` may not be normalized away and declared equal without a separate approved binary-normalization specification.

Default policy is exact-byte reproducibility.

---

# 7. PE and binary architecture seal

## 7.1 Required PE properties

```text
DOS magic       = MZ
PE signature    = PE\0\0
Machine         = 0x8664
Architecture    = x86_64
Artifact class  = Release
```

## 7.2 Forbidden runtime dependencies

The addon must not import debug CRT libraries, including:

- `VCRUNTIME140D.dll`
- `ucrtbased.dll`

## 7.3 Required binary inspection

The report must record:

- PE machine
- timestamp field
- section names and digests
- imported DLL names
- exported N-API initialization symbol
- code signature state, if any
- byte length
- SHA-256

## 7.4 Addon count

The unpacked app must contain exactly one `.node` file for this profile.

```text
releaseAddonCount = 1
debugAddonCount = 0
unexpectedAddonCount = 0
```

---

# 8. N-API and native ABI preservation

## 8.1 Required JavaScript exports

The loaded module must expose:

```text
status
decodeBuffer
decodePath
```

The raw snake_case aliases may exist, but the product host must use the canonical camelCase facade.

## 8.2 Required N-API compatibility

The addon must declare and report:

```text
napiFeatureLevel = napi6
```

The packaged Electron runtime must load it without an ABI mismatch.

## 8.3 Native status v2

`status()` must return an attested structure:

```text
schemaVersion
available
decoderId
nativeAbiId
buildProfileId
backend
artifactFilename
artifactSha256
artifactByteLength
peMachine
napiFeatureLevel
targetTriple
buildProfile
capabilities
selfTestStatus
selfTestDigest
```

`available=true` is legal only after the host loader verifies the artifact and the native self-test passes.

## 8.4 No source-slot language in product status

Messages such as:

```text
Rust native raster decoder slot wired
Run npm run build:native to produce .node binding
```

must not appear in a promoted product status.

## 8.5 Structured errors

All native failures must return stable codes and must not rely on parsing human strings.

---

# 9. Exact decoded surface v2

## 9.1 Required fields

```text
schemaVersion
decodeSurfaceAbiId
width
height
pixelCount
storage
sampleBitDepth
channelOrder
rowStrideBytes
data
sourceFormat
sourceByteLength
sourceSha256
pixelDataSha256
hasAlpha
hasTransparency
premultiplied
hdr
colorEncoding
icc
iccSha256
resolution
metadataDigest
```

## 9.2 RGBA8 storage

```text
storage = rgba8unorm
sampleBitDepth = 8
channelOrder = rgba
rowStrideBytes = width * 4
```

The runtime may label the presentation texture as `rgba8unorm-srgb`, but the decoder ABI must describe the byte samples independently from GPU texture interpretation.

## 9.3 RGBA16 storage

```text
storage = rgba16le-unorm
sampleBitDepth = 16
channelOrder = rgba
endianness = little
rowStrideBytes = width * 8
```

U16 samples must be copied exactly.

No f16 conversion is permitted inside the independent validation ABI.

## 9.4 Presentation adaptation

A separate adapter may convert exact U16 UNORM samples to half float for WebGPU presentation.

That adapter must record:

- source exact digest
- adapted digest
- conversion policy ID

The adapted bytes are not the independent PNG16 round-trip authority.

## 9.5 Output length invariant

```text
RGBA8  data.byteLength = width * height * 4
RGBA16 data.byteLength = width * height * 8
```

All multiplication must use checked arithmetic.

## 9.6 Alpha semantics

```text
premultiplied = false
```

must remain true unless a format-specific decoder proves otherwise and declares a separate ABI.

`hasAlpha` means an alpha channel exists.

`hasTransparency` means at least one decoded alpha sample is not fully opaque.

These fields must not be conflated.

---

# 10. Format truth and sniffing

## 10.1 Byte truth precedence

Canonical precedence:

```text
container signature / magic
→ decoder sniff result
→ explicit format hint
→ MIME hint
→ filename extension
```

The lower-priority fields may narrow selection but may not override a contradictory signature.

## 10.2 Required mismatch errors

Examples:

- PNG bytes with `formatHint=jpeg`
- JPEG bytes named `.png`
- WebP bytes with `mimeType=image/jpeg`

must produce a structured mismatch receipt.

## 10.3 Unknown input

Unknown or truncated input must fail without registering a decoded surface resource.

---

# 11. PNG requirements

## 11.1 PNG8

Required support:

- RGB8
- RGBA8
- grayscale8
- grayscale-alpha8
- indexed PNG with transparency

All outputs normalize to exact RGBA8.

## 11.2 PNG16

Required support:

- RGB16
- RGBA16
- grayscale16
- grayscale-alpha16

All outputs normalize to exact RGBA16LE UNORM.

## 11.3 PNG hidden RGB

For alpha-zero fixtures, the decoder must report the actual decoded RGB samples.

If the underlying library normalizes or destroys hidden RGB, the fixture must fail and the decoder cannot claim exact hidden-RGB validation.

## 11.4 PNG metadata

The metadata parser must extract, when present:

- `iCCP`
- `sRGB`
- `gAMA`
- `cHRM`
- `pHYs`
- Exif chunk

No color transform is applied.

## 11.5 PNG resolution

`pHYs` must be reported as exact integer pixels-per-unit values and a derived DPI only when the unit is meter.

The original integer values remain authoritative.

---

# 12. JPEG requirements

## 12.1 Decode output

JPEG decode output is RGBA8 with alpha fixed to 255.

```text
hasAlpha = false
hasTransparency = false
```

## 12.2 JPEG color components

The promoted profile must support the product JPEG output:

- Baseline sequential
- 8-bit
- 3 components
- YCbCr 4:4:4

Other JPEG variants may decode, but they do not receive product validation unless separately tested.

## 12.3 JPEG metadata

The metadata parser must extract:

- APP0 JFIF density
- APP1 Exif resolution
- APP2 ICC_PROFILE sequence
- SOF dimensions and precision
- component sampling factors

## 12.4 ICC sequence

APP2 ICC segments must be:

- complete
- unique by sequence number
- contiguous
- assembled in sequence order

Duplicate, missing, or conflicting segments fail metadata verification.

## 12.5 Resolution precedence

The receipt must report JFIF and Exif resolution separately.

It may also report one resolved presentation value using an explicit precedence policy ID.

It must not overwrite one source with the other silently.

## 12.6 JPEG independent quality validation

JPEG is lossy, so exact pixel equality is not required.

The decoder must provide the exact decoded RGBA8 bytes used by the independent metric layer.

The metric layer remains outside the native decoder and records its own policy ID.

---

# 13. WebP requirements

## 13.1 Product profile

Mandatory product support is WebP Lossless.

## 13.2 Decode output

Output is exact RGBA8.

## 13.3 WebP hidden RGB

The transparent-pixel fixture must determine whether the chosen decoder preserves encoded hidden RGB.

Promotion requires exact parity with the canonical expected fixture.

No post-decode zeroing or matte fill is allowed.

## 13.4 WebP metadata

The parser must extract, when present:

- ICCP
- EXIF
- XMP
- VP8X feature flags
- canvas dimensions

## 13.5 Animated WebP

Animated WebP is outside `core-export-raster-v1`.

If detected, it must fail with an explicit unsupported-animation error rather than silently returning only the first frame.

---

# 14. Color encoding truth

## 14.1 No implicit transform

The native decoder returns encoded sample values.

It must not apply ICC conversion, gamma correction, or sRGB conversion as part of independent decoding.

## 14.2 Color encoding values

Allowed values include:

```text
embedded-icc
explicit-srgb-chunk
format-default-srgb-assumption
unknown-unmanaged
```

## 14.3 Current hard-coded sRGB removal

The current unconditional:

```text
colorSpace = srgb
```

must be replaced by metadata-derived truth.

## 14.4 ICC byte preservation

Embedded ICC bytes must be returned exactly, with:

- byte length
- SHA-256
- source container location

The native decoder does not rewrite the profile.

---

# 15. Resolution metadata truth

## 15.1 Resolution structure

Resolution must not be a free-form string.

Required structure:

```text
source
xNumerator
yNumerator
unit
rawX
rawY
derivedDpiX
derivedDpiY
policyId
```

## 15.2 Exact source preservation

Raw source values remain authoritative.

Derived floating-point DPI is informational.

---

# 16. Decode limits and hostile input policy

## 16.1 Required limits

The product profile must declare:

```text
maxInputBytes
maxWidth
maxHeight
maxPixels
maxDecodedBytes
maxMetadataBytes
maxIccBytes
```

## 16.2 Checked arithmetic

All dimension and buffer calculations must use checked operations.

## 16.3 Early rejection

Where the container header exposes dimensions, budget rejection should occur before full pixel allocation.

## 16.4 Panic containment

Malformed input must produce a structured error.

It must not:

- abort Electron
- unwind across an unsafe N-API boundary
- leave a partially registered Resource Registry object

## 16.5 Timeout ownership

Electron Host owns the decode timeout.

A timed-out decode must not later publish a successful result into the abandoned request.

---

# 17. Electron Host attestation

## 17.1 Attestation identity

```text
attestationId = dadum.native-decoder-attestation-v1
```

## 17.2 Attestation sequence

```text
canonical path resolve
→ file exists
→ SHA-256
→ PE x64 inspection
→ exact loader admission
→ module load
→ ABI export inspection
→ native status v2
→ embedded fixture self-test
→ capability seal
```

## 17.3 Required attestation fields

```text
attestationId
status
artifactPathClass
artifactFilename
artifactSha256
artifactByteLength
peMachine
nativeAbiId
napiFeatureLevel
buildProfileId
capabilities
selfTestDigest
packagedProcess
```

Full user filesystem paths must not be exposed to the Renderer receipt.

## 17.4 Loader behavior

Packaged mode must load exactly:

```text
app.asar.unpacked/native/decoder-rs/decoder_rs.win32-x64-msvc.node
```

Development mode may use a separate explicit path supplied by configuration.

Development fallback logic must never be active in packaged mode.

## 17.5 Load failure caching

A failed load may be cached for the current Electron process, but the error must include a stable code and attested candidate class.

It must not continue searching arbitrary `.node` files.

---

# 18. Runtime Decoder Registry admission

## 18.1 Current bridge-presence check retirement

This condition is forbidden:

```text
if HostBridge.nativeDecode exists
→ register native decoder
```

## 18.2 Required admission

```text
HostBridge.nativeDecode.status()
→ Native Decoder Attestation PASS
→ artifact identity matches package manifest
→ required capabilities present
→ register dadum.decoder.native-raster-v1
```

## 18.3 Capability-specific formats

The Registry must advertise only attested formats.

For `core-export-raster-v1`:

```text
png
jpeg
webp
```

AVIF, GIF, BMP, and TIFF may be added only if their attested capability rows pass.

## 18.4 Independent decode no-fallback policy

An independent validation request names the exact decoder ID.

If unavailable:

```text
E_NATIVE_DECODER_UNAVAILABLE
```

must be returned.

It may not silently invoke:

- `dadum.decoder.browser-image-v1`
- Canvas
- `createImageBitmap`
- Sharp
- the encoder library

## 18.5 Resource registration

The Resource Registry receives a decoded surface only after:

- output schema validation
- length invariant validation
- digest verification
- request epoch validation

---

# 19. Renderer bridge contract

## 19.1 Buffer-only product decode

The product validation API uses:

```text
decodeBuffer
```

## 19.2 Path API containment

`decodePath` must not accept an arbitrary Renderer-provided filesystem path.

Allowed options:

- remove it from Renderer exposure
- require a Host-issued file token
- retain it for Main-process-only tooling

Direct arbitrary path IPC is forbidden for promoted product use.

## 19.3 Structured clone and digest

The Host must compute the source SHA-256 over the exact bytes passed to the native function.

The returned receipt must prove the same source length and digest.

---

# 20. Native self-test corpus

## 20.1 Embedded minimal fixtures

The addon or Host attestation package must include minimal fixtures for:

- PNG8 opaque
- PNG8 alpha and hidden RGB
- PNG16 endian gradient
- JPEG baseline 4:4:4
- WebP lossless alpha and hidden RGB

## 20.2 Self-test purpose

The self-test verifies:

- module is loadable
- required ABI exports exist
- each mandatory decoder path executes
- output dimensions and storage are correct
- output digest matches the sealed fixture expectation

## 20.3 Self-test independence

Fixtures must not be generated at runtime by the same decoder being tested.

Expected outputs are precomputed and sealed.

---

# 21. Independent round-trip matrix

## 21.1 PNG8

```text
canonical PNG8 encoder output
→ disk bytes
→ native decoder
→ exact RGBA8 equality
```

## 21.2 PNG16

```text
canonical PNG16 encoder output
→ disk bytes
→ native decoder
→ exact RGBA16LE U16 equality
```

## 21.3 WebP Lossless

```text
canonical WebP lossless output
→ disk bytes
→ native decoder
→ exact RGBA8 equality
```

## 21.4 JPEG

```text
canonical MODJPEG output
→ disk bytes
→ native decoder
→ exact decoder byte digest
→ independent lossy metric envelope
```

## 21.5 Receipt conservation

For every row:

```text
encoderOutputSha256
= rendererBlobSha256
= hostStreamSha256
= finalDiskSha256
= nativeDecoderInputSha256
```

---

# 22. Package identity

## 22.1 Electron package allowlist

Required packaged files:

```text
native/decoder-rs/index.cjs
native/decoder-rs/index.d.ts
native/decoder-rs/decoder_rs.win32-x64-msvc.node
```

`index.js` may be included only if it is part of the declared product loader contract.

## 22.2 Forbidden package content

- `target/debug/**`
- `target/release/**`
- Rust source
- Cargo registry cache
- nested `node_modules`
- multiple platform `.node` files
- debug addon
- arbitrary native source tree

## 22.3 ASAR rule

The `.node` must be unpacked.

The JavaScript loader may remain in ASAR.

The resolved native artifact must match the Package Content Manifest SHA.

## 22.4 Package content identity

The native addon SHA is an input to:

- Package Content ID
- Independent Decoder Matrix Receipt
- Cross-format E2E Receipt
- Production Promotion Receipt

---

# 23. Native artifact provenance receipt

Required fields:

```text
schemaVersion
patchId
status
decoderId
nativeAbiId
buildProfileId
targetTriple
rustcVersion
cargoVersion
napiCliVersion
napiFeatureLevel
windowsSdkVersion
msvcLinkerVersion
cargoTomlSha256
cargoLockSha256
nativePackageJsonSha256
nativePackageLockSha256
sourceTreeDigest
buildEnvironmentDigest
buildAArtifactSha256
buildBArtifactSha256
byteReproducible
```

---

# 24. Decode truth receipt

Each decode receipt must include:

```text
decoderId
nativeAbiId
artifactSha256
attestationSha256
requestId
sourceFormat
sourceByteLength
sourceSha256
width
height
storage
sampleBitDepth
pixelDataSha256
hasAlpha
hasTransparency
colorEncoding
iccSha256
resolutionDigest
metadataDigest
decodeDurationMs
fallbackUsed
```

`fallbackUsed` must be `false` for independent validation.

---

# 25. Stable error registry

The implementation must register at least the following stable errors.

## 25.1 Toolchain and build

```text
E_NATIVE_TOOLCHAIN_PROFILE_MISSING
E_NATIVE_RUST_TOOLCHAIN_MISMATCH
E_NATIVE_NAPI_CLI_IDENTITY_MISMATCH
E_NATIVE_CARGO_LOCK_MUTATED
E_NATIVE_NPM_LOCK_MUTATED
E_NATIVE_BUILD_A_FAILED
E_NATIVE_BUILD_B_FAILED
E_NATIVE_BUILD_NONDETERMINISTIC
```

## 25.2 Binary identity

```text
E_NATIVE_ADDON_MISSING
E_NATIVE_ADDON_MULTIPLE
E_NATIVE_ADDON_UNEXPECTED_NAME
E_NATIVE_ADDON_ARCH_MISMATCH
E_NATIVE_ADDON_DEBUG_BUILD
E_NATIVE_ADDON_SHA_MISMATCH
E_NATIVE_ADDON_IMPORT_POLICY_FAILED
```

## 25.3 ABI and load

```text
E_NATIVE_ADDON_LOAD_FAILED
E_NATIVE_ABI_EXPORT_MISSING
E_NATIVE_ABI_VERSION_MISMATCH
E_NATIVE_NAPI_FEATURE_MISMATCH
E_NATIVE_SELF_TEST_FAILED
E_NATIVE_ATTESTATION_FAILED
```

## 25.4 Input truth

```text
E_NATIVE_INPUT_EMPTY
E_NATIVE_INPUT_TOO_LARGE
E_NATIVE_FORMAT_UNKNOWN
E_NATIVE_FORMAT_HINT_MISMATCH
E_NATIVE_DIMENSION_LIMIT
E_NATIVE_PIXEL_BUDGET_EXCEEDED
E_NATIVE_METADATA_BUDGET_EXCEEDED
E_NATIVE_ANIMATION_UNSUPPORTED
```

## 25.5 Decode output

```text
E_NATIVE_DECODE_FAILED
E_NATIVE_OUTPUT_SCHEMA_INVALID
E_NATIVE_OUTPUT_LENGTH_MISMATCH
E_NATIVE_OUTPUT_STORAGE_UNSUPPORTED
E_NATIVE_OUTPUT_DIGEST_MISMATCH
E_NATIVE_PNG16_EXACTNESS_FAILED
E_NATIVE_HIDDEN_RGB_FAILED
E_NATIVE_METADATA_PARSE_FAILED
```

## 25.6 Runtime and package

```text
E_NATIVE_DECODER_UNAVAILABLE
E_NATIVE_DECODER_NOT_ATTESTED
E_NATIVE_DECODER_FALLBACK_FORBIDDEN
E_NATIVE_DECODE_TIMEOUT
E_NATIVE_DECODE_STALE_RESULT
E_NATIVE_PATH_API_FORBIDDEN
E_NATIVE_PACKAGE_CONTENT_MISMATCH
E_NATIVE_PACKAGED_EXECUTION_FAILED
```

---

# 26. State machine

```text
BLOCKED_RELEASE_ADDON_MISSING
→ SOURCE_PROFILE_SEALED
→ NATIVE_TOOLCHAIN_VERIFIED
→ NATIVE_LOCKS_VERIFIED
→ RELEASE_ADDON_BUILD_A_COMPLETED
→ RELEASE_ADDON_BUILD_B_COMPLETED
→ RELEASE_ADDON_REPRODUCIBLE
→ PE_ABI_VERIFIED
→ NATIVE_SELF_TEST_VERIFIED
→ EXACT_SURFACE_VERIFIED
→ METADATA_VERIFIED
→ PACKAGE_IDENTITY_VERIFIED
→ PACKAGED_NATIVE_EXECUTION_VERIFIED
→ INDEPENDENT_RASTER_MATRIX_VERIFIED
→ NATIVE_DECODER_PROMOTED
```

No state may be skipped.

Current source state at specification time:

```text
BLOCKED_RELEASE_ADDON_MISSING
```

---

# 27. Static gates

The implementation must provide at least 92 static gates.

Minimum gate groups:

## 27.1 Identity gates

1. Product decoder ID exact
2. Native ABI ID exact
3. Build profile ID exact
4. Canonical filename exact
5. Canonical package path exact
6. Validation profile exact

## 27.2 Toolchain gates

7. Rust version pinned
8. Cargo version pinned
9. Target triple exact
10. MSVC linker recorded
11. Windows SDK recorded
12. N-API CLI exact
13. Root/native CLI split absent
14. Cargo frozen policy present
15. Native npm lock policy present

## 27.3 Source gates

16. Cargo source present
17. Cargo lock present
18. N-API build script present
19. Decode Buffer ABI present
20. Status v2 ABI present
21. Exact surface v2 present
22. PNG16 U16 path present
23. No f16 authority path
24. ICC metadata parser present
25. Resolution parser present
26. checked arithmetic present
27. decode budget present

## 27.4 Loader gates

28. Packaged exact path present
29. No target/debug packaged fallback
30. No first arbitrary `.node` fallback
31. Exact filename enforced
32. artifact SHA checked
33. PE machine checked
34. attestation required
35. self-test required

## 27.5 Registry gates

36. Bridge existence alone insufficient
37. status attestation awaited
38. exact capability admission
39. browser fallback forbidden for validation
40. Resource registration after schema validation

## 27.6 Format gates

41. PNG8 exact path
42. PNG16 exact path
43. JPEG decode path
44. WebP lossless path
45. signature/hint mismatch check
46. animated WebP rejection
47. hidden RGB fixture
48. ICC extraction
49. resolution extraction

## 27.7 Package gates

50. exact one Release `.node`
51. zero Debug `.node`
52. PE x64
53. unpacked addon
54. no target tree
55. no Rust source in package
56. package manifest digest binding

## 27.8 Receipt gates

57. provenance receipt
58. attestation receipt
59. self-test receipt
60. exact surface receipt
61. metadata receipt
62. package receipt
63. independent matrix receipt
64. promotion receipt

Additional gates must cover all normative sections and bring the total to at least 92.

---

# 28. Runtime test matrix

The implementation must provide at least 148 runtime tests.

## 28.1 Native load tests

- canonical artifact present
- missing artifact
- two artifacts
- wrong filename
- wrong PE machine
- corrupt PE
- load exception
- missing ABI export
- N-API mismatch
- self-test mismatch

## 28.2 PNG tests

- RGB8
- RGBA8
- grayscale8
- grayscale-alpha8
- indexed transparency
- hidden RGB alpha zero
- RGB16
- RGBA16
- grayscale16
- endian gradient
- iCCP
- sRGB chunk
- pHYs
- malformed chunk length
- truncated IDAT

## 28.3 JPEG tests

- baseline 4:4:4
- quality fixture low
- quality fixture medium
- quality fixture high
- JFIF density
- Exif density
- ICC one segment
- ICC multiple segments
- ICC missing sequence
- ICC duplicate sequence
- truncated scan
- progressive detection

## 28.4 WebP tests

- lossless opaque
- lossless alpha
- hidden RGB
- ICCP
- EXIF
- XMP
- animated rejection
- truncated RIFF
- wrong RIFF size

## 28.5 Limit tests

- zero bytes
- input over limit
- width over limit
- height over limit
- pixels over limit
- decoded byte overflow
- ICC over limit
- metadata over limit
- timeout
- stale completion

## 28.6 Package tests

- exact unpacked path
- loader from ASAR
- Package Content Manifest SHA
- one Release addon
- no Debug addon
- no source leakage
- packaged status attestation
- packaged PNG decode
- packaged JPEG decode
- packaged WebP decode

## 28.7 Reproducibility tests

- Build A/B byte equality
- path relocation equality
- repeated build equality
- Cargo lock mutation zero
- native npm lock mutation zero
- generated declaration equality
- export table equality
- import table equality

Additional tests must bring the total to at least 148.

---

# 29. Required artifacts

The implementation must emit at least these artifacts:

```text
TDT_NATIVE_DECODER_01_SOURCE_PROFILE_REPORT.json
TDT_NATIVE_DECODER_01_TOOLCHAIN_REPORT.json
TDT_NATIVE_DECODER_01_NATIVE_LOCK_REPORT.json
TDT_NATIVE_DECODER_01_BUILD_A_REPORT.json
TDT_NATIVE_DECODER_01_BUILD_B_REPORT.json
TDT_NATIVE_DECODER_01_REPRODUCIBILITY_REPORT.json
TDT_NATIVE_DECODER_01_PE_ARCHITECTURE_REPORT.json
TDT_NATIVE_DECODER_01_ABI_REPORT.json
TDT_NATIVE_DECODER_01_ATTESTATION_REPORT.json
TDT_NATIVE_DECODER_01_SELF_TEST_REPORT.json
TDT_NATIVE_DECODER_01_EXACT_SURFACE_REPORT.json
TDT_NATIVE_DECODER_01_METADATA_REPORT.json
TDT_NATIVE_DECODER_01_LIMIT_POLICY_REPORT.json
TDT_NATIVE_DECODER_01_PACKAGE_IDENTITY_REPORT.json
TDT_NATIVE_DECODER_01_PACKAGED_EXECUTION_REPORT.json
TDT_NATIVE_DECODER_01_INDEPENDENT_MATRIX_REPORT.json
TDT_NATIVE_DECODER_01_PROMOTION_RECEIPT.json
TDT_NATIVE_DECODER_01_GATE_REPORT.json
TDT_NATIVE_DECODER_01_RUNTIME_TEST_REPORT.json
TDT_NATIVE_DECODER_01_FIX_RECEIPT.json
```

---

# 30. Promotion receipt

A PASS receipt requires all of the following:

```text
releaseAddonPresent = true
releaseAddonCount = 1
debugAddonCount = 0
peMachine = 0x8664
nativeAbiVerified = true
nativeSelfTestVerified = true
buildAArtifactSha256 = buildBArtifactSha256
byteReproducible = true
png8ExactVerified = true
png16ExactVerified = true
webpLosslessExactVerified = true
jpegDecodeVerified = true
iccMetadataVerified = true
resolutionMetadataVerified = true
packagedExecutionVerified = true
independentFallbackUsed = false
```

The final status is:

```text
NATIVE_DECODER_PROMOTED
```

Anything less remains blocked or source-baked.

---

# 31. Fail-closed rules

The following are forbidden:

- advertise native decoder because preload exists
- report `available=true` without artifact attestation
- load the first `.node` found
- package a Debug addon
- accept a non-x64 PE
- convert PNG16 U16 to f16 before validation digest
- hard-code sRGB when metadata is unknown
- discard ICC or resolution silently
- use format hint to override byte signature
- fall back to browser decoder during independent validation
- expose arbitrary filesystem decode path to Renderer
- mutate Cargo or npm locks during canonical build
- promote from source-only fixture tests
- claim packaged execution without launching the packaged Electron process

---

# 32. Rollback and compatibility

## 32.1 Runtime compatibility

If the native addon is unavailable, normal import UI may expose a reduced capability state if explicitly designed.

Independent export validation must fail closed.

## 32.2 Promotion rollback

Rollback unit is the whole packaged build.

A `.node` artifact cannot be replaced independently under an active Package Content ID.

## 32.3 ABI evolution

Breaking output changes require:

```text
dadum-native-decoder-abi-v2
```

The existing v1 identity must not be silently rebound to a new storage or metadata meaning.

---

# 33. Implementation order

```text
NATIVE-01A Source / Toolchain Profile Seal
→ NATIVE-01B Exact Surface v2 and Metadata Parser
→ NATIVE-01C Canonical Loader and Host Attestation
→ NATIVE-01D Registry Admission and No-fallback Policy
→ NATIVE-01E Clean Windows Build A/B
→ NATIVE-01F PE / ABI / Self-test Verification
→ NATIVE-01G Electron Package Identity
→ NATIVE-01H Packaged Independent Decode Matrix
→ NATIVE-01I Promotion Receipt
```

---

# 34. Next specification

After this specification is baked and the Release addon is promoted, the next codec specification is:

```text
TDT-JXL-CODEC-01

JXL Encode-Decode Runtime Closure /
jxl_encode_qmap_ex() ABI Preservation /
Independent Decoder Exact RGBA8·Hidden RGB Round-trip /
Container Metadata /
Pthread Generation Closure Seal
```

---

# 35. Final normative summary

The native decoder is promoted only when the packaged Electron application can prove:

```text
one exact win32-x64-msvc Release .node
+ one exact ABI
+ one attested loader path
+ exact PNG8 / PNG16 / WebP surfaces
+ verified JPEG decode bytes
+ preserved ICC / resolution metadata
+ no independent-validation fallback
+ byte-reproducible native builds
+ packaged execution evidence
```

Source presence is not addon presence.

Bridge presence is not decoder availability.

A decoded image is not an exact validation surface unless storage, byte length, metadata, and digest semantics are explicit.
