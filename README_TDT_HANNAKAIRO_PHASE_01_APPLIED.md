# TDT-HANNAKAIRO-PHASE-01 Applied

## State

`HANNAKAIRO_PHASE_01_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

## Parent

- Parent patch: `TDT-SPECTRAL-QMAP-03`
- Parent ZIP SHA-256: `bd25cd7093cbb38100b297d449b9db3bd51882126e23418199b1a6e7377b9c81`
- Parent source seal: `af0227a5858ba14f13e1a56d68909299cd029b8636970817f3d32627b2f268fd`

## Implemented

- Canonical `HannakairoPhaseService` under GPU Device Authority and Analysis Field Authority.
- R1C tensor publication bridge that copies the already computed eigen/coherence texture into an analysis-owned `rgba16float` texture inside the same GPU command stream.
- Existing R1C EWA texture ownership, ABI, dispatch order, and release behavior remain unchanged.
- Exact R1C tensor semantic, source revision, stage index, stage count, device identity, and device epoch validation before topology execution.
- GPU-only axial double-angle conversion using `q = (tx² - ty², 2 tx ty)` so `t` and `-t` publish the same director order.
- Confidence and validity propagation from the R1C tensor field.
- GPU-only 3×3 confidence-weighted local phase coherence.
- GPU-only plaquette circulation with the image-coordinate loop `q00 → q01 → q11 → q10 → q00`.
- Explicit half-away-from-zero winding snap and half-integer axial defect charge.
- Exact invalid output `(0,0,0,0)` rather than guessed valid zero charge.
- One Hannakairo command buffer and one queue submission for axial conversion, coherence, and circulation.
- Atomic `publishFieldSet()` publication of axial, coherence, and defect outputs after the completion fence.
- Cancellation, supersession, stale epoch rejection, device-loss invalidation, field pinning, and owned-resource cleanup.
- Zero product CPU phase processing, WebGL fallback, Canvas extraction, `MAP_READ`, `mapAsync`, `getMappedRange`, or intermediate field readback.
- Six product and validation WGSL assets included in the Runtime Asset Manifest.
- Existing `phase_gate_hannakairo.frag` retained only as the directional compatibility gate. It is not relabeled as a topology producer.
- Existing CPU `phase_field.js` retained as compatibility/reference code and excluded from the canonical product producer.
- Production Pointer unchanged.

## Canonical outputs

- `tdt.analysis.hannakairo.axial-order.v1`
- `tdt.analysis.hannakairo.phase-coherence.v1`
- `tdt.analysis.hannakairo.winding-defect.v1`

## Coordinate and charge truth

- Axial and coherence fields use `stage-pixel` coordinates and preserve the R1C stage dimensions.
- Defect output uses `stage-plaquette` coordinates and dimensions `(width - 1) × (height - 1)`.
- Positive and negative half defects map to doubled winding `±1` and axial charge `±1/2`.
- A unit axial defect is validated as connected-component integrated charge `+1` around an off-grid singularity. The canonical fixture produces two local `+1/2` plaquettes instead of manufacturing a branch-cut-dependent single `+1` plaquette.

## Source and mock gate

- Source contract: 46/46 PASS
- WGSL contract: 50/50 PASS
- Deterministic math/runtime smoke: 16/16 PASS
- HP01 gate: 184 PASS / 12 DEFERRED / 0 FAIL

The 12 deferred gates require physical WebGPU and Windows x64 Packaged Electron evidence. This source bake does not claim browser WGSL compilation, physical GPU reference parity, actual zero-readback tracing, device-loss interruption, memory plateau, packaged worker integration, or promotion.

## Environment limitation

The parent artifact intentionally does not contain `node_modules`. Repository TypeScript syntax was checked with the globally installed TypeScript parser. Full `vue-tsc` semantic checking could not run because package-local `vite/client` and dependency types are absent. Dependency-lock, Runtime, Export, Build, codec, Analysis Field, Spectral Q-map, and resample source gates remained passing.
