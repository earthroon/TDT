# TDT-NATIVE-DECODER-01 Applied

## Status

- Source status: `SOURCE_BAKED_UNPROMOTED`
- Evidence state: `BLOCKED_RELEASE_ADDON_MISSING`
- Build ID: `9281046f23f6de8dbcd1357f`
- Build authority digest: `67ddd327647e2f481c7ac94a9f5ab02c013758727d7bfaf2f7dd886d6ff5c69c`
- Source bake seal: `26e458ddf24f9e50f89562af4e7adecbd0938d0dbeb684837ea3737cff6a75d6`
- Source worker manifest: `435ac3eac48b6ec05a84df1d687d4c0d36886c633b9d418c2917d1cf11c8e3ab`
- Production promotion issued: **No**

## Canonical native decoder contract

The product native raster decoder is admitted only through the exact Release addon path:

```text
native/decoder-rs/decoder_rs.win32-x64-msvc.node
```

The canonical ABI is:

```text
dadum-native-decoder-abi-v1
```

Required raw N-API exports:

```text
status
self_test
abi_descriptor
decode_buffer
decode_path
```

The JavaScript facade retains `decodePath()` for Electron main-process use, but the renderer preload surface exposes only `status()` and `decodeBuffer()`.

## Exact decoded surfaces

- PNG8, WebP, JPEG: `rgba8unorm-u8-v1`
- PNG16: `rgba16le-unorm-u16-v1`

PNG16 no longer converts exact U16 samples into half float inside the native decoder. Presentation conversion is a separate downstream policy.

Each decoded surface carries source and output evidence:

- source byte length and SHA-256
- pixel byte SHA-256
- sample bit depth
- channel order
- row stride
- ICC SHA-256
- metadata digest

## Metadata authority

Source contracts were added for:

- PNG `iCCP`, `sRGB`, `gAMA`, `cHRM`, `pHYs`
- JPEG JFIF density, Exif resolution, APP2 ICC sequence
- WebP `ICCP`, `EXIF`, `XMP `, `VP8X`

Malformed metadata, metadata-budget overflow, unsupported animation, input-byte limits and pixel-budget overflow fail closed.

## Host attestation and registry admission

The Electron host now verifies:

- exact canonical filename
- artifact SHA-256
- PE machine `0x8664`
- executable-image and DLL characteristics
- ABI version
- N-API feature level
- required raw and facade exports
- native self-test

`dadum.decoder.native-raster-v1` is registered only after the host attestation passes. Preload bridge presence alone no longer advertises native decode capability. Independent validation does not silently fall back to the browser decoder.

## Packaging authority

Electron packaging and package-content verification admit exactly one `.node`:

```text
resources/app.asar.unpacked/native/decoder-rs/decoder_rs.win32-x64-msvc.node
```

Debug addons, arbitrary `.node` discovery, `target/debug`, `target/release`, and first-match loading are not product authorities.

## Verification

```text
PASS TDT-NATIVE-DECODER-01 Source Gates       120/120
PASS TDT-NATIVE-DECODER-01 Runtime Tests      150/150
PASS Stable Error Registry                    441/441
PASS TypeScript Syntax                         73 files
PASS Isolated Strict TypeScript
PASS R7
PASS EW01 through EW07
PASS EP01 through EP03
PASS BUILD-LOCK-01
PASS BUILD-EMIT-01
PASS TDT-MODJPEG-01
```

## Promotion blockers

The current source tree contains no Release addon:

```text
releaseAddonCount = 0
nativeDecoderPromoted = false
```

The current container also lacks `rustc`, `cargo`, installed `@napi-rs/cli`, and a Windows x64 build host. Therefore the following were not executed:

- canonical win32-x64-msvc Release addon build A/B
- exact `.node` byte reproducibility
- native N-API self-test in a real addon
- independent PNG8, PNG16, WebP and JPEG decode round-trip
- packaged Electron native execution
- package-content attestation

No placeholder `.node` was created and no native capability was advertised.
