# TDT-SURFACE-LIFECYCLE-01 Applied

## Seal identity

- Patch ID: `TDT-SURFACE-LIFECYCLE-01`
- Title: `Canonical Surface Registry / Ownership Transfer / Typed Disposal / Peak Residency Accounting / Device Epoch Binding / Preview·Export Pinning / Compatibility Mirror Retirement Seal`
- Baked state: `SURFACE_LIFECYCLE_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- Parent: `TDT-GPU-DEVICE-SSOT-01`
- Promotion ceiling: source closure plus isolated execution of the actual Surface Authority class
- Production pointer mutation: forbidden and observed as `false`
- Packaged Electron claim: `false`

## What this bake changes

1. Promotes the previous opaque runtime resource map into `SurfaceRegistryAuthorityService`, the canonical owner of decoded, working, final, preview, export, and compatibility surfaces.
2. Introduces typed descriptors for CPU typed arrays, `ImageBitmap`, `GPUTexture`, `GPUBuffer`, `Blob`, and compatibility handles.
3. Assigns deterministic surface IDs bound to `runtimeEpoch` and, for GPU resources, the active `deviceEpoch` and device identity.
4. Separates short synchronous borrow leases from asynchronous preview and export pins.
5. Defers physical disposal when an invalidated surface is still borrowed or pinned, then disposes exactly once after the final lease releases.
6. Binds preview and export to the same registered final surface ID instead of accepting an untracked opaque payload.
7. Preserves an older final surface while an export pin is active, even after a newer final revision replaces it.
8. Adds typed physical disposal: `GPUTexture.destroy()`, `GPUBuffer.destroy()`, and `ImageBitmap.close()` are invoked by the registry rather than scattered callers.
9. Registers Surface Authority as a GPU recovery participant. Old-device-epoch GPU surfaces are invalidated and pinned GPU work is aborted during loss recovery, while CPU surfaces survive.
10. Adds host, GPU, and compatibility residency ledgers with current and peak byte estimates, active surface counts, active pin and borrow counts, and disposal counters.
11. Retires the mandatory full-frame `__DADUM_FILTERED_RGBA8__` compatibility copy. The compatibility bridge now exposes a frozen surface-handle facade only.
12. Preserves the resampling equations, color policy, encoder ABI, GPU Device Authority contract, and Production Pointer.

## Canonical lifecycle

```text
REGISTERED
   ↓
ACTIVE
   ├─ BORROWED      short synchronous access
   ├─ PINNED        preview or export async ownership
   └─ INVALID       replacement, device loss, cancellation, shutdown
          ↓
   DISPOSE_PENDING  while any borrow or pin remains
          ↓
   DISPOSED         typed physical disposer executed exactly once
```

A logical invalidation is not accepted as proof of physical release. The receipt tracks both state transition and typed disposal.

## Source and isolated-runtime results

```text
TDT-SURFACE-LIFECYCLE-01
52 PASS / 8 DEFERRED / 0 FAIL

Source contract checks
25 / 25 PASS

Surface call-site audit
784 files scanned
filtered RGBA8 assignments: 0

Regression suites
22 / 22 PASS

TypeScript syntax
87 files PASS

Changed source files sealed
22
```

The actual TypeScript `SurfaceRegistryAuthorityService` was transpiled and executed against controlled CPU, `ImageBitmap`, and mock GPU resources. The smoke observed:

```text
final A invalidated while export-pinned       DISPOSE_PENDING
final A payload alive during export pin       PASS
final A disposed after final pin release       PASS
repeated dispose attempts remain single       PASS
ImageBitmap.close() count                      1
GPUTexture.destroy() count                     1
old-epoch GPU pin aborted                      PASS
CPU survivor after device loss                 PASS
stale device binding rejected                  PASS
unknown GPU format rejected                    PASS
active surfaces after shutdown                 0
active pins after shutdown                     0
pending disposals after shutdown               0
current host bytes after shutdown              0
current GPU bytes after shutdown               0
```

This is an isolated execution of the real Surface Authority class. It is not a claim that Windows, Electron, the RTX 3080 driver, or packaged GPU memory behavior has been observed.

## Conserved regression seals

The following gates were rerun after the surface ownership migration:

- Promotion Baseline: `66 / 66 PASS`
- Active Graph: `30 PASS / 10 DEFERRED / 0 FAIL`
- GPU Device SSOT: `30 PASS / 30 DEFERRED / 0 FAIL`
- Runtime R7 exact API, encoder identity, final surface, and receipt gate: PASS
- Export Worker 01 through 07: PASS
- Export Promotion 01: `54 / 54 PASS`
- Export Promotion 02: `60 / 60 PASS`
- Export Promotion 03: `68 / 68 PASS`
- Build Lock: `72 / 72 PASS`
- Build Emit: `84 / 84 PASS`
- MODJPEG: `84 / 84 PASS`
- Native Decoder: `120 / 120 PASS`
- JXL Codec: `108 / 108 PASS`
- PSD Decoder: `112 / 112 PASS`
- TypeScript syntax: `87 files PASS`

## Deferred truth

The remaining `8 DEFERRED` gates are not source failures. They require broader migration or packaged-runtime evidence:

- `SL01-18`, `SL01-19`: exclusive ownership-transfer token and cross-owner transfer observation
- `SL01-34`: worker staging and transfer-copy residency accounting
- `SL01-41`, `SL01-42`: packaged orphan-resource and unaccounted-allocation observation
- `SL01-55`: explicit packaged GPU readback lifecycle accounting
- `SL01-56`: migration of every remaining legacy direct texture disposal site into registered lifecycle ownership
- `SL01-57`: canonical ephemeral-resource exception manifest and packaged enforcement

This bake does not fabricate those observations and does not change the Production Pointer.

## Verification

```powershell
npm run verify:surface-lifecycle-01
```

The command verifies source contracts, audits surface-related call sites, executes the real Surface Authority class in the deterministic smoke harness, writes the source gate, and reports deferred packaged-runtime requirements.

## Source receipt

- Parent artifact SHA-256: `75bbf6c78dc3b41eb85aa2ef88b99018fb74a31c84edfd8c3b2337ea237dc5cf`
- Specification SHA-256: `51c6bfbc45bfdbde5ae759cc537f455cb34f188718b5be29c7fc74954767c3ba`
- Source seal SHA-256: `bafdb5cfc49406f4b27556aa739297eb495f375c007a67234b26ff4839e44ced`
- Production pointer mutated: `false`
- Packaged claims: `false`
