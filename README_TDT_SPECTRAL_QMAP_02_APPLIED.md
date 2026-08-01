# TDT-SPECTRAL-QMAP-02 Applied

## State

`SPECTRAL_QMAP_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

## Parent

- Parent patch: `TDT-ANALYSIS-FIELD-TRUTH-00`
- Parent ZIP SHA-256: `48e544322f0d7a4aed7290deedca75bbada9780dea23e656b4e3f809511a17d2`
- Parent source seal: `465f4ab940f426a581983e4f3ea53d230ead99d5cf907bc3b4e5c4cc548f9128`

## Implemented

- Canonical `SpectralStockhamExecutorService` under Analysis Field Authority.
- GPU-resident spatial-complex input semantic and natural-order frequency-complex output semantic.
- Deterministic power-of-two planner for rectangular 8..256 transforms.
- Batched out-of-place Stockham row FFT, 16x16 padded transpose, column FFT, transpose-back.
- Exactly `N/2` butterfly invocations per transform and two uniquely owned output writes per invocation.
- One command buffer and one queue submission per deterministic chunk.
- Zero product `MAP_READ`, `mapAsync`, `getMappedRange`, CPU FFT, or intermediate result readback.
- Same GPU device identity and epoch through GPU Device Authority.
- Analysis input pinning, output ownership transfer, fence-before-publication, cancellation, and device-loss invalidation.
- Runtime Asset Manifest inclusion for product and validation WGSL assets.
- Legacy `initWebGPU`, `computeQMap_GPU_All`, `QmapFFTBuilder`, and helper export names retained as fail-closed GPU field adapters.
- CPU grayscale arrays and synchronous texture-result claims rejected.
- Production Pointer unchanged.

## Canonical data contract

Input:

`tdt.analysis.spectral.window-spatial-complex.v1`

Output:

`tdt.analysis.spectral.window-frequency-complex.v1`

Layout:

- Interleaved `vec2<f32>` complex elements.
- Window layers contiguous.
- Natural row-major frequency order.
- No implicit FFT shift.

## Source and mock gate

- Source contract: 69/69 PASS
- WGSL contract: 39/39 PASS
- Deterministic math/runtime smoke: 20/20 PASS
- SQ02 gate: 168 PASS / 12 DEFERRED / 0 FAIL

The 12 deferred gates require physical WebGPU and Windows x64 Packaged Electron evidence. The source bake does not claim actual browser WGSL compilation, physical GPU DFT parity, writer atomic counters, roundtrip error, memory plateau, or packaged recovery.

## Environment limitation

The parent artifact intentionally does not contain `node_modules`. Repository TypeScript syntax was checked with the globally installed TypeScript parser. Full `vue-tsc` semantic checking could not run because `vite/client` and package-local dependencies are absent. Existing dependency-lock, Build Lock, Build Emit, and source regression gates remained passing.
