# TDT-HANNAKAIRO-GATE-02 Applied

## State

`HANNAKAIRO_GATE_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

## Parent

- Parent patch: `TDT-HANNAKAIRO-PHASE-01`
- Parent ZIP SHA-256: `41f4cdc1feb6cace2e3390b8d5df1f8ebec8d3a30cfeaf6f4694a6dbb493bb91`
- Parent source seal: `d0538fcd7df0c25aad45bead9ff28df00793a690cda8801523939cb8c9a99b86`

## Implemented

- Canonical `HannakairoGateService` under GPU Device Authority and Analysis Field Authority.
- GPU-only projection of SQ03 `window-grid` peak-orientation records into the R1C `stage-pixel` coordinate space.
- Projection uses the bound `tdt.spectral.window-layout.v1` receipt, verifies its digest against the SQ03 publication metadata, and considers only the local 2×2 center neighborhood with explicit window coverage checks.
- Double-angle vectors are confidence-weighted and normalized. Angles are never interpolated as scalar degrees or radians.
- Tensor tangent sign is removed through `q_t=(tx²-ty²,2tx·ty)` before alignment.
- Tensor and spectral direction alignment is `0.5*(dot(q_t,q_s)+1)` with the signed doubled-angle dot retained as evidence.
- Optional HP01 phase coherence affects confidence only when explicitly weighted. Missing optional phase input does not trigger CPU, WebGL, or Canvas fallback.
- Neutral-safe directional multiplier `clamp(1-strength*confidence*(1-alignment),minMultiplier,1)`.
- Disabled, zero-strength, invalid, uncovered, or zero-confidence pixels write exact neutral `(1,0,0,0)`; the loaded R value is exactly f32 `0x3f800000`.
- One command buffer and one queue submission for projection, alignment, and gate finalization.
- Atomic `publishFieldSet()` publication of alignment and directional-gate fields after the completion fence.
- Cancellation, stale-field checks, device-epoch checks, field pins, owned-resource transfer, and device-loss invalidation.
- Zero product CPU pixel compute, WebGL compute, Canvas extraction, `MAP_READ`, `mapAsync`, `getMappedRange`, or intermediate readback.
- Existing `phase_gate_hannakairo.frag` is preserved only as compatibility evidence and is not imported by the product service.
- Legacy facade names remain available through a GPU-field-handle-only bridge; CPU arrays, WebGL textures, and Canvas sources fail closed.
- Six product and validation WGSL assets are admitted through Runtime Asset Authority.
- Production Pointer unchanged.

## Canonical inputs

- `tdt.analysis.tensor.tangent-coherence-edge.r1c.v1`
- `tdt.analysis.spectral.window-peak-orientation.v1`
- Optional: `tdt.analysis.hannakairo.phase-coherence.v1`

## Canonical outputs

- `tdt.analysis.hannakairo.tensor-spectral-alignment.v1`
- `tdt.analysis.hannakairo.directional-gate.v2`

## Coordinate and identity truth

- Tensor input and both outputs use `stage-pixel` coordinates.
- SQ03 orientation remains a `window-grid` storage buffer until the projection pass.
- The projection pass selects at most four neighboring window centers and rejects candidates that do not actually cover the target stage pixel.
- A tangent sign flip occurs before double-angle construction and therefore produces the same axial vector. Negating an already constructed double-angle vector represents an orthogonal director and is intentionally not treated as a sign flip.
- Layout, source revision, stage identity, semantic, resource kind, format, device epoch, and publication metadata digest are checked before submission.

## Source and mock gate

- Source contract: 80/80 PASS
- WGSL contract: 60/60 PASS
- Deterministic math/runtime smoke: 32/32 PASS
- HG02 gate: 172 PASS / 12 DEFERRED / 0 FAIL

The 12 deferred gates require physical WebGPU and Windows x64 Packaged Electron evidence. This source bake does not claim browser WGSL compilation, physical projection parity, physical neutral-bit comparison, actual command tracing, device-loss interruption, memory plateau, packaged worker integration, or promotion.

## Current generated identities

- Semantic registry version: `tdt.analysis.semantic-registry.hannakairo-gate-02.v1`
- Semantic descriptor count: 27
- Semantic registry digest: `6446f29ee4be3cc212a9049cdf1e77639f1cd962e2c135308e48674426ff9051`
- Producer count: 8
- Producer inventory digest: `dfb916fb3714827501b4f7c12e1850942e43f001013d6ac1e5b43a30e5a1c7f3`
- Runtime asset count: 51
- Runtime asset manifest digest: `240be37d035ddfb88f7fb5859d2a2b4b3391967769f280e2135b70416c58eafd`
- Active Graph roots/nodes/edges: 56/328/335
- Active Graph digest: `7da74ac253edc095c3ab2c1b92d7c3273c0445878dd7baaf9ee542d2970cee76`

## Environment limitation

The parent source artifact does not contain `node_modules`. Repository TypeScript syntax was checked with the globally installed TypeScript parser. Full `vue-tsc` semantic checking cannot run without package-local dependency types such as `vite/client`. Dependency-lock, Runtime, Export, Build, codec, Analysis Field, Spectral Q-map, Hannakairo Phase, resample, Surface, and Preview source gates remained passing.
