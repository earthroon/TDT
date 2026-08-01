# TDT-QWAVE-PHASE-03 Applied

## State

`QWAVE_PHASE_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

This patch promotes the existing analytic Q-wave idea into a canonical WebGPU/WGSL Analysis Field producer. It preserves the legacy `ensureQWaveRGWGPU()` facade while separating analytic phase from the animated visual-wave system.

No physical WebGPU, Windows packaged Electron, performance, or memory-plateau claim is made by this source bake.

## Parent

- Parent patch: `TDT-HANNAKAIRO-GATE-02`
- Parent ZIP SHA-256: `4f2591268e27525fa6ad7c21397e1ebab2b2d4574588c8659bd83c1156f8f514`
- Parent source seal: `a9bb251d9b6c47794538aaf524211ab27ab6de1c5face366c01b4291426a544a`

## Canonical execution

```text
Delta-K rgba16float GPU texture
  -> analysis-owned real field publication
  -> one selected imaginary source
  -> signed imaginary-component field
  -> principal complex square root
  -> analytic-complex field
  -> atomic two-field publication
  -> optional legacy RG compatibility adapter
```

The analytic product path performs two compute dispatches in one command buffer and one queue submission. Intermediate pixel readback, CPU pixel computation, Canvas computation, and WebGL computation are forbidden.

## Analysis semantics

- `tdt.analysis.qwave.real-delta-k-compat.v1`
- `tdt.analysis.qwave.imaginary-component.v1`
- `tdt.analysis.qwave.analytic-complex.v2`

The visual wave remains outside Analysis Field Authority:

- `tdt.visual.qwave.animated-overlay.v1`

## Real-field bridge

The previous draft contained a publisher but no active caller. This bake connects `ensureDeltaKWGPU()` to `publishRealDeltaKCompatibility()` after the Delta-K compute submission.

The bridge requires:

- an exact `rgba16float` Delta-K texture,
- an existing canonical source-surface identity,
- source revision and source format,
- stage index and stage count.

No synthetic surface ID, timestamp-derived job identity, or CPU conversion is used. Missing source identity fails closed.

## Imaginary source modes

Immediately executable:

1. `local-anisotropy-compat`
2. `spectral-quadrature`
3. `hannakairo-defect`

Reserved but fail-closed until their producers are promoted:

4. `tensor-curvature`
5. `hilbert-quadrature`

Exactly one source mode is admitted per request. Local-anisotropy mode rejects an unrelated external source handle rather than silently ignoring it.

## Principal square root

For `Z = a + ib`:

```text
r = sqrt(a*a + b*b)
u = sqrt(max(0, (r+a)/2))
v = signNonNegative(b) * sqrt(max(0, (r-a)/2))
Q = u + iv
```

`signNonNegative(0) = +1`, so the negative real axis selects the positive-imaginary principal branch.

The analytic output stores:

```text
R = |Q|
G = cos(arg Q)
B = sin(arg Q)
A = combined confidence
```

Invalid input stores the exact neutral value `(0,1,0,0)`.

## Legacy RG compatibility

The old RG contract is produced by a dedicated WGSL adapter:

```text
R = clamped analytic magnitude
G = phase mapped to [0,1)
B = normalized imaginary amplitude
A = analytic confidence
```

The compatibility texture is not registered as a canonical Analysis Field. It has explicit disposal and verifies current GPU epoch and current field pins after the queue fence.

## Visual-wave separation

Visual-only controls use the `__QWAVE_VISUAL_*` namespace. Analysis parameters contain no time, screen-space animation frequency, speed, Kelvin estimate, or palette state.

Canvas `getImageData()` Kelvin estimation was removed from the visual system and overlay. Visual Kelvin is explicit or defaults to 6500 K. The visual overlay cannot be published through Analysis Field Authority.

## Runtime ownership

- Q-wave authority: `dadum.qwave-phase-authority.qp03`
- Producer: `tdt.analysis.producer.qwave.analytic`
- GPU owner: `dadum.gpu.consumer.qwave-analytic`
- Analysis consumer: `tdt.analysis.consumer.qwave-analytic`
- Semantic registry: `tdt.analysis.semantic-registry.qwave-phase-03.v1`

Pipeline creation passes through GPU Authority. Device loss invalidates the Q-wave pipeline bundle. Input fields are pinned through Analysis Field Authority and rechecked after the GPU fence.

## Assets

Seven product WGSL assets:

- local anisotropy imaginary source
- spectral phase projection
- Hannakairo defect projection
- curvature source adapter
- Hilbert source adapter
- principal complex square root
- legacy RG adapter

Four validation WGSL assets:

- fixture generator
- independent polar reference
- comparator
- source-selection counter

## Source gates

```text
Source contract  88/88 PASS
WGSL contract    72/72 PASS
Runtime smoke    32/32 PASS
Total           192 PASS / 12 DEFERRED / 0 FAIL
```

The 12 deferred gates require physical WebGPU and packaged Electron evidence.

## Important source-bake repairs

- Fixed an unbalanced and type-invalid spectral projection WGSL loop.
- Corrected window-center parameter packing from `width/2` to `(width-1)/2`.
- Connected the Delta-K builder to the real-field publisher.
- Removed timestamp-derived legacy Q-wave job IDs.
- Added exact raw-texture format admission.
- Added strict rejection of external sources in local-anisotropy mode.
- Added cleanup and epoch/pin revalidation to the legacy RG adapter.
- Removed non-null assertion syntax that defeated the GPU pipeline-ownership scanner.

## Promotion boundary

Production Pointer remains unchanged. Physical compile, bind-group validation, source-selection counters, GPU parity, device-loss interruption, memory plateau, worker boundary, packaged relaunch, and final verified-unpromoted receipt remain deferred.
