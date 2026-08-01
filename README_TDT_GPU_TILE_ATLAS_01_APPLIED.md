# TDT-GPU-TILE-ATLAS-01 Applied

## State

`GPU_TILE_ATLAS_01_SOURCE_BAKED_AWAITING_PACKAGED_GPU`

This patch introduces a canonical persistent GPU residency authority for analysis-window tiles. It does not replace Analysis Field Authority, Surface Registry, or GPU Device Authority. It binds them into a single generation-checked residency lifecycle.

No physical WebGPU, Windows packaged Electron, performance, or memory-plateau claim is made by this source bake.

## Parent

- Parent patch: `TDT-QWAVE-PHASE-03`
- Parent ZIP SHA-256: `9b3800e6103fd783584bad673f50145f626544c5ff535178972468fa0b3efa83`
- Parent source seal: `005206125334e903ff3ab9dff5d8bc76010fda6a7e8177ff21515298331e1f58`

## Authority split

- Analysis Field Authority owns semantic identity, source revision, producer execution receipt, and field publication.
- GPU Tile Atlas Authority owns virtual tile identity, page-table mapping, slot generation, pins, fences, eviction, and residency transactions.
- Surface Registry owns physical page buffers, page-table buffers, byte accounting, and typed disposal.
- GPU Device Authority owns adapter/device/queue identity and device epoch.

`AtlasTileHandle` is not an `AnalysisFieldHandle`. Atlas materialization creates a new contiguous GPU buffer and republishes it through Analysis Field Authority.

## Canonical pool

The first promoted pool is intentionally narrow:

- Pool: `tdt.gpu.tile-atlas.pool.complex-f32-window.v1`
- Payload semantic: `tdt.analysis.spectral.window-spatial-complex.v1`
- Payload format: interleaved complex `f32`
- Physical resource: persistent `GPUBuffer` pages
- Atlas resource class: `tdt.gpu.tile-atlas.persistent.v1`

Texture-array atlases, quality LUT atlases, scalar atlases, full-frame caches, and codec metadata atlases remain outside this patch.

## Canonical residency flow

```text
Analysis spatial-complex window batch
  -> Analysis Field pin
  -> canonical tile-key derivation
  -> cache hit or deterministic slot reservation
  -> payload copies into persistent GPU pages
  -> page-table mirror update in the same command buffer
  -> one queue submission
  -> queue fence
  -> CPU shadow page-table commit
  -> immutable Atlas tile handles
```

The CPU shadow page table is the mapping SSOT. The GPU page-table buffer is an execution mirror only. A mapping is never visible as resident before its write fence completes.

## Identity and generations

Tile identity includes semantic digest, source surface and revision, source dimensions and format, stage identity, window-layout digest, window/plane/grid indices, tile dimensions, producer receipt, field-set digest, and derivation parameter digest.

The authority separates:

- device epoch,
- atlas epoch,
- page-table generation,
- virtual-tile generation,
- slot generation,
- page generation.

A stale handle is rejected even if a later tile reuses the same page, slot, or byte offset.

## Page table

Each GPU page-table entry is 48 bytes (`u32 x 12`) and carries virtual, slot, and page generations, physical page/slot identity, byte range, dimensions, pool identity, and flags.

The payload copy and page-table mirror update share one command buffer. CPU shadow commit and handle publication occur only after `queue.onSubmittedWorkDone()`.

## Transaction rollback

A failed ingest transaction restores, in reverse reservation order:

- prior slot state and slot generation,
- prior virtual generation,
- prior virtual ID frontier when the ID was newly allocated,
- prior victim mapping,
- empty pages allocated only for the failed transaction.

Existing resident mappings do not become stale because a replacement transaction failed.

## Read pins and fences

Physical page buffers and byte offsets are exposed only through a current `AtlasReadPin`.

```text
PINNED
  -> READ_SUBMITTED
  -> READ_FENCE_COMPLETED
  -> RELEASED
```

Release while a submitted read fence is incomplete fails closed. Device loss invalidates active pins, removes their in-flight counts, and balances the Atlas pin ledger.

## Materialization

Resident handles are materialized into the exact contiguous buffer contract expected by SQ02:

```text
resident persistent pages
  -> page-grouped GPU gather dispatches
  -> generation validation in WGSL
  -> single writer per output window
  -> contiguous complex-f32 GPUBuffer
  -> Analysis Field publication
```

The materializer validates virtual, slot, and page generation on GPU. It never substitutes a zero tile for a stale or missing mapping.

## Deterministic budget and eviction

The Atlas budget is computed from Atlas-owned resident page bytes, not unrelated Surface Registry allocations.

Eviction order is deterministic:

1. smallest last-use sequence,
2. smallest virtual tile ID,
3. smallest page index,
4. smallest slot index.

Pinned, in-flight, incomplete-write, stale-device, or invalidated slots are not evictable. If the full victim set cannot be planned, the transaction fails without altering existing mappings.

No wall-clock timestamp, `performance.now()`, or randomness participates in residency policy.

## Device loss and rebuild

Recovery order remains:

```text
Surface Registry         -1000
Analysis Field Authority  -900
GPU Tile Atlas Authority  -850
```

Device loss:

- invalidates all active Atlas pins and handles,
- clears the CPU shadow mapping,
- releases Atlas page-byte accounting,
- clears stale page and pipeline references,
- advances Atlas epoch,
- resets virtual/page ID frontiers,
- creates a fresh empty page-table buffer on the recovered device.

Payload restoration is not claimed. The recovered Atlas begins empty.

## Legacy Atlas migration

The legacy Atlas names remain present for compatibility, but placeholder quality-atlas code cannot claim persistent analysis residency.

- `atlas_bridge.js` delegates to the canonical Authority bridge.
- `atlas_defs.js` distinguishes the persistent analysis pool from legacy placeholders.
- `build_quality_atlas.js` fails with `E_TILE_ATLAS_LEGACY_SEMANTIC_UNSUPPORTED`.
- Placeholder quality/LUT shaders remain excluded from canonical product execution.

## GPU-only contract

Canonical ingest and materialization forbid:

- `MAP_READ` and `MAP_WRITE`,
- `mapAsync()` and `getMappedRange()`,
- CPU window reconstruction,
- CPU page packing,
- WebGL Atlas fallback,
- Canvas extraction,
- intermediate GPU pixel readback and re-upload.

Atlas OFF is a cache bypass, not a new algorithm. The canonical producer runs normally when the Atlas is disabled or misses.

## Runtime ownership

- Atlas authority: `dadum.gpu-tile-atlas-authority.gta01`
- Runtime service: `dadum.runtime.gpu-tile-atlas`
- Materializer producer: `tdt.analysis.producer.tile-atlas.materializer`
- GPU consumer: `dadum.gpu.consumer.tile-atlas`
- Ingest Analysis consumer: `tdt.analysis.consumer.tile-atlas-ingest`
- Semantic registry: `tdt.analysis.semantic-registry.gpu-tile-atlas-01.v1`

## Source gates

```text
Source contract  96/96 PASS
WGSL contract    64/64 PASS
Runtime smoke    52/52 PASS
Total           212 PASS / 12 DEFERRED / 0 FAIL
```

The 12 deferred gates require physical WebGPU and packaged Electron evidence.

## Promotion boundary

Production Pointer remains unchanged. Physical WGSL compilation, bind-group validation, real GPU page-table parity, real fence ordering, device-loss interruption, repeated-residency memory plateau, worker/renderer boundary, packaged relaunch, and final verified-unpromoted receipt remain deferred.
