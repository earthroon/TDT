# TDT-SPECTRAL-QMAP-03 Applied

## State

`SPECTRAL_QMAP_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

## Parent

- Parent patch: `TDT-SPECTRAL-QMAP-02`
- Parent ZIP SHA-256: `ad2802ce38c6fc4c7b5b7797fbd5c7bd583d877209cc880b3a22c62f1e2c12f7`
- Parent source seal: `f53838c2f57f94d6e12437fa42809cfa151acab362f80fb5355b460cf124f633`

## Implemented

- Canonical `SpectralReductionService` under GPU Device Authority and Analysis Field Authority.
- Required `tdt.spectral.window-layout.v1` receipt binding for source tuple, window grid, plane count, signal class, window function, and deterministic layout digest.
- SQ02 frequency-complex output metadata now binds the exact window-layout receipt digest.
- GPU-only power normalization, partial reduction, recursive merge, and five-field finalization.
- Canonical positive half-plane Hermitian-pair ownership with DC and self-conjugate Nyquist exclusion from entropy, orientation, and phase candidates.
- Normalized spectral entropy, selected-peak feature-tangent orientation, center-anchored complex phase, peak share, dominance, angular coherence, and conservative confidence.
- Atomic `publishFieldSet()` transaction for five Analysis Field outputs. The complete semantic set commits or none of it commits.
- Generation, ledger, publication counter, and field records roll back on commit failure while caller-owned candidate GPU resources remain available for deterministic cleanup.
- One command buffer and one queue submission for the reduction chain.
- Zero product CPU pixel compute, WebGL pixel compute, Canvas pixel compute, `MAP_READ`, `mapAsync`, `getMappedRange`, or intermediate result readback.
- Device-epoch binding, source-field pinning, fence-before-publication, cancellation, supersession, and device-loss invalidation.
- Runtime Asset Manifest inclusion for six product and validation WGSL assets.
- Existing `QmapFFTBuilder` facade retained as a fail-closed GPU Analysis Field adapter.
- Production Pointer unchanged.

## Canonical outputs

- `tdt.analysis.spectral.window-power-spectrum.v1`
- `tdt.analysis.spectral.window-entropy.v1`
- `tdt.analysis.spectral.window-peak-orientation.v1`
- `tdt.analysis.spectral.window-complex-phase.v1`
- `tdt.analysis.spectral.window-summary.v1`

## Correctness repairs found during bake

- Propagated non-finite FFT coefficient failure masks into window reduction.
- Preserved both peak and runner-up candidates through recursive merge with deterministic lower-index tie breaking.
- Published selected-peak feature-tangent orientation rather than aggregate moment orientation.
- Separated entropy validity from orientation and phase validity.
- Applied explicit minimum-band-power gating before field validity claims.
- Replaced placeholder validation WGSL with an independent full direct reduction and tolerance-aware five-field comparator.
- Added safe peak-index handling so invalid sentinel indices cannot read outside the frequency buffer.

## Source and mock gate

- Source contract: 82/82 PASS
- WGSL contract: 81/81 PASS
- Deterministic math/runtime smoke: 30/30 PASS
- SQ03 gate: 204 PASS / 12 DEFERRED / 0 FAIL

The 12 deferred gates require physical WebGPU and Windows x64 Packaged Electron evidence. This source bake does not claim browser WGSL compilation, physical GPU reference parity, actual zero-readback tracing, memory plateau, device-loss execution, packaged worker integration, or promotion.

## Environment limitation

The parent artifact intentionally does not contain `node_modules`. Repository TypeScript syntax was checked with the globally installed TypeScript parser across 124 files. Full `vue-tsc` semantic checking could not run because package-local `vite/client` and dependency types are absent. Dependency-lock, Build Lock, Build Emit, Runtime, Export, and codec source gates remained passing.
