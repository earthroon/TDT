# TDT-QMAP-STREAMING-REDUCTION-03D

## Chunk-Local Stockham Row Stages / Forward Transpose / Column Stockham Stages / Transpose-Back / Explicit Final Natural-Row-Major Frequency Slot / Same-Encoder Extraction Handoff Consumption / Local Window Offset-Zero Frequency Layout / No Global Frequency Buffer / No Frequency Copy / No Additional Queue Submission Seal

## 0. Document identity

```text
Patch ID
= TDT-QMAP-STREAMING-REDUCTION-03D

Short ID
= QSR03D

Parent patch
= TDT-QMAP-STREAMING-REDUCTION-03C

Umbrella patch
= TDT-QMAP-STREAMING-REDUCTION-03

Required parent state
= SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03C_FINAL_EWA_CURSOR_BOUND_CHUNK_EXTRACTION_LOCAL_SCRATCHA_OFFSET_ZERO_NO_FULL_SPATIAL_ATLAS_AWAITING_LOCAL_STOCKHAM_03D

Specification state
= SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03D consumes the one-shot QSR03C extraction handoff and records a complete chunk-local 64 × 64 forward complex transform into the same command encoder. The authoritative output is written directly to QSR03B `scratchB` in natural row-major frequency order.

QSR03D does not execute power-spectrum generation, power normalization, partial reduction, compact-field scatter, QMap projection, queue submission, completion-ticket issuance, slot-generation advancement, publication, EFC convergence, or product-route promotion.

## 1. Authority identities

```text
stockhamRecorderId
= dadum.qmap-chunk-stockham-recorder.qsr03d

stockhamAuthorityId
= dadum.qmap-chunk-stockham-authority.qsr03d

stockhamImplementationId
= tdt-qmap-stockham64-2d-chunk-local-webgpu-v1

stockhamShaderId
= tdt.qmap.shader.chunk-local-stockham64.qsr03.v1

stockhamShaderAbiId
= tdt.qmap.shader-abi.chunk-local-stockham64.qsr03.v1

frequencyHandoffSchemaId
= tdt.qmap.frequency-handoff.qsr03d.v1

stockhamRecordSchemaId
= tdt.qmap.stockham-record.qsr03d.v1

frequencyLayoutId
= tdt.qmap.frequency-layout.natural-row-major-complex-f32.v1
```

Trusted inputs are one unconsumed QSR03C extraction handoff, the same encoder capability, the exact active QSR03B lease and generation, private scratch bindings, immutable QSR03B stage parameters, the QSR03A plan, canonical Stockham pipelines, and matching runtime/device epochs.

Caller-created buffers, encoders, pipelines, bind groups, stage order, twiddle convention, normalization, final slot, frequency layout, or stale handoffs are rejected.

QRC02 remains the product route.

## 2. Transactional extraction-handoff consumption

The accepted handoff must bind:

```text
schemaId      = tdt.qmap.window-extraction-handoff.qsr03c.v1
scratchRole   = scratchA
scratchLayout = local-window-major-complex-f32-interleaved
```

Operation, plan, chunk, exact range, arena, slot, generation, encoder, runtime epoch, and device epoch must match.

Handoff state:

```text
CREATED
→ STOCKHAM_RECORDING
→ CONSUMED_BY_STOCKHAM
```

The handoff is committed consumed only after all fourteen QSR03D dispatches are recorded successfully. A partial recording failure invalidates the handoff and requires complete encoder discard. No frequency handoff is emitted from a partial command graph.

## 3. Canonical transform contract

```text
window width              = 64
window height             = 64
horizontal transform      = 64
vertical transform        = 64
radix                     = 2
Stockham stages per axis  = 6
complex representation    = vec2<f32>
bytes per complex element = 8
forward sign              = exp(-i × 2πk / 64)
fftshift                  = false
bit reversal              = false
```

Stockham butterfly arithmetic, stage indexing, twiddle convention, and forward scaling are imported from the QRC02 canonical Stockham authority. QSR03D changes only local window scope, QSR03B buffer ownership, explicit final slot, and command/handoff lineage.

QSR03D introduces no independent normalization. Power/window-energy normalization remains QSR03E authority.

## 4. Immutable stage-table ABI

QSR03D consumes QSR03B stage-table records 2 through 7. Each record is 256 bytes and binds:

```text
stageIndex
transformLength = 64
radix = 2
radixSpan = 1 << (stageIndex + 1)
halfSpan = radixSpan / 2
twiddleStride = 64 / radixSpan
forwardSign = -1
sourceElementStride = 1
destinationElementStride = 1
stageAbiVersion = 1
```

Dynamic offsets:

```text
stage 0 = 512
stage 1 = 768
stage 2 = 1024
stage 3 = 1280
stage 4 = 1536
stage 5 = 1792
```

The existing 4 KiB immutable parameter allocation is retained. No new buffer or per-stage upload is admitted.

## 5. Explicit scratch schedule

After QSR03C:

```text
scratchA = local spatial-complex input
```

Horizontal stages:

| Stage | Source | Destination |
|---:|---|---|
| 0 | scratchA | scratchB |
| 1 | scratchB | scratchA |
| 2 | scratchA | scratchB |
| 3 | scratchB | scratchA |
| 4 | scratchA | scratchB |
| 5 | scratchB | scratchA |

```text
horizontal final slot = scratchA
```

Forward transpose:

```text
scratchA → transposeA
```

Vertical stages over transposed rows:

| Stage | Source | Destination |
|---:|---|---|
| 0 | transposeA | transposeB |
| 1 | transposeB | transposeA |
| 2 | transposeA | transposeB |
| 3 | transposeB | transposeA |
| 4 | transposeA | transposeB |
| 5 | transposeB | transposeA |

```text
vertical-transposed final slot = transposeA
```

Transpose-back:

```text
transposeA → scratchB
```

Final authority:

```text
scratchB = authoritative local natural-row-major frequency field
scratchA, transposeA, transposeB = stale non-authoritative intermediates
```

No final copy is required or admitted.

## 6. Stockham dispatch mapping

Stockham entry point:

```text
stockham64_stage
workgroup size = 64 × 1 × 1
```

Each stage dispatches:

```text
dispatchWorkgroups(localWindowCount × 64, 1, 1)
```

Mapping:

```text
transformIndex = workgroup_id.x
localWindow    = floor(transformIndex / 64)
rowIndex       = transformIndex mod 64
windowBase     = localWindow × 4096
rowBase        = windowBase + rowIndex × 64
```

Offsets use local-window indexes only. `globalWindow` and `chunk.windowBase` never contribute to scratch addresses.

The canonical out-of-place Stockham autosort stage uses the immutable stage record and writes one natural-order output element per lane. Stages execute exactly `0 → 1 → 2 → 3 → 4 → 5` with no replay, skip, reorder, aliasing, stage fusion, or bit-reversal repair.

## 7. Forward transpose and transpose-back

Transpose entry point:

```text
transpose64
workgroup size = 8 × 8 × 1
dispatch = 8 × 8 × localWindowCount
```

Mapping:

```text
source      = localWindow × 4096 + y × 64 + x
destination = localWindow × 4096 + x × 64 + y
```

Forward transpose writes `transposeA`. Transpose-back reads `transposeA` and writes `scratchB`.

The transpose kernel may use fixed shader-local tile padding. It may not change GPUBuffer descriptors or QSR03A byte accounting.

## 8. Final frequency layout

```text
layout = local-window-major / ky-major / kx-minor / real-imaginary

frequencyElementIndex
= localWindow × 4096 + ky × 64 + kx
```

Coordinate convention:

```text
DC                         = index 0
positive frequencies       = 1..31
Nyquist                    = 32
wrapped negative frequency = 33..63
fftshift                   = not applied
```

The first frequency window of every chunk begins at offset zero. The final short-chunk tail is not transformed, cleared, copied, hashed, read, or published.

## 9. Pipeline and bind-group topology

WGSL asset:

```text
app/legacy-runtime/core/compute/qmap_webgpu/shaders/chunk_local_stockham64_qsr03.wgsl
```

Exactly two pipelines are cached outside the chunk loop:

```text
1. stockham64 stage pipeline
2. transpose64 pipeline
```

Exactly six bind groups are cached outside the chunk loop:

```text
scratchA → scratchB
scratchB → scratchA
scratchA → transposeA
transposeA → transposeB
transposeB → transposeA
transposeA → scratchB
```

Per chunk:

```text
GPUBuffer creation          = 0
GPUTexture creation         = 0
shader-module creation      = 0
pipeline creation           = 0
bind-group-layout creation  = 0
bind-group creation         = 0
stage parameter upload      = 0
```

## 10. Exact command topology

QSR03D records one compute pass with fourteen dispatches:

```text
1..6   six row Stockham stages
7      forward transpose
8..13  six column Stockham stages
14     transpose-back to scratchB
```

```text
compute passes added  = 1
dispatches added      = 14
queue submissions     = 0
buffer copies         = 0
texture copies        = 0
readbacks             = 0
resource allocations  = 0
```

All commands remain in the encoder originally used by QSR03C. QSR03D has no direct queue authority and performs no intermediate submission.

## 11. Failure-mask extension

QSR03C owns failure bits 0 through 5. QSR03D adds:

```text
bit 6  = nonfinite Stockham source
bit 7  = nonfinite butterfly output
bit 8  = stage or stage-table mismatch
bit 9  = transpose coordinate invariant failure
bit 10 = final slot or frequency-layout mismatch
bits 11..31 = reserved zero
```

QSR03D does not clear `failureLocal` again. Invalid output writes deterministic complex positive zero and atomically sets the relevant bit. No CPU failure inspection or product readback is admitted.

## 12. Frequency handoff

The metadata-only handoff binds operation, plan, exact chunk, arena, slot, generation, encoder, extraction record, Stockham record, final role `scratchB`, natural row-major frequency layout, transform dimensions 64 × 64, runtime epoch, and device epoch.

Raw `GPUBuffer`, `GPUDevice`, `GPUQueue`, and mutable descriptors remain private.

Only QSR03E may consume the handoff, once, with exact equality of operation, plan, chunk, arena, slot, generation, encoder, epoch, final role, and layout.

State:

```text
CREATED → CONSUMED_BY_LOCAL_POWER_REDUCTION
CREATED → ABORTED → INVALID
CREATED → DEVICE_INVALIDATED → INVALID
```

## 13. Recording evidence

The QSR03D record binds:

- QSR03C extraction record and handoff digests;
- exact chunk range and slot generation;
- shader, ABI, arithmetic, twiddle, stage-table, pipeline, and bind-group digests;
- horizontal and vertical stage order;
- transpose mappings;
- final `scratchB` authority;
- natural frequency layout;
- one-pass/fourteen-dispatch topology;
- zero submission, copy, allocation, mapping, and readback counters.

Initial state:

```text
RECORDED_NOT_YET_PHYSICALLY_COMPLETED
```

The covering completion ticket may later promote it to:

```text
COVERED_BY_COMPLETED_SUBMISSION
```

QSR03D does not issue or resolve that ticket.

## 14. Forbidden paths

QSR03D forbids:

- `windowCount × 64 × 64 × 8` global frequency allocations;
- full-frequency atlases and compatibility mirrors;
- post-transform frequency copies;
- final-output relocation buffers;
- `fftshift` and bit-reversal passes;
- per-chunk pipelines, bind groups, buffers, textures, or stage parameters;
- separate Stockham encoders or submissions;
- CPU, WASM, WebGL, Canvas, mapped-buffer, host-transpose, host-bit-reversal, or readback FFT paths;
- Analysis, Surface, warm-cache, Preview, Export, IPC, project, or diagnostic publication of `scratchB`.

## 15. Stable errors

```text
E_QMAP03_STOCKHAM_HANDOFF_INVALID
E_QMAP03_STOCKHAM_STAGE_FAILED
E_QMAP03_STOCKHAM_STAGE_ORDER_MISMATCH
E_QMAP03_FREQUENCY_LAYOUT_MISMATCH
E_QMAP03_GLOBAL_FREQUENCY_BUFFER_FORBIDDEN
E_QMAP03_FREQUENCY_COPY_FORBIDDEN
E_QMAP03_ADDITIONAL_SUBMISSION_FORBIDDEN
E_QMAP03_TRANSIENT_ALLOCATION_IN_LOOP
E_QMAP03_CPU_FALLBACK_FORBIDDEN
E_QMAP03_WEBGL_FALLBACK_FORBIDDEN
E_QMAP03_READBACK_FORBIDDEN
E_QMAP03_CANCELLED
E_QMAP03_DEVICE_LOST
```

No failure path may allocate a global field, copy a partial output, resume from a later stage, substitute another final slot, fall back to another FFT backend, or emit a frequency handoff after partial recording failure.

## 16. Required implementation surfaces

New TypeScript:

```text
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-stockham-types.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-stockham-validation.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-stockham.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-stockham-record.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-frequency-handoff.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-stockham-private-bindings.ts
```

New legacy runtime and shader:

```text
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_stockham_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_stockham.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_frequency_handoff.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/chunk_local_stockham64_qsr03.wgsl
```

Modified canonical files:

```text
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-arena-validation.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-final-ewa-types.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-window-extraction-handoff.ts
app/src/boot/stable-error.ts
app/src/runtime/service-token.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_arena.mjs
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_window_extraction.mjs
package.json
```

No generated runtime or publication manifest is modified.

## 17. Source Gates

QSR03D requires exactly 160 Source Gates:

```text
S001-S016   identity, exact parent admission, product-route preservation
S017-S032   same-encoder transactional extraction-handoff consumption
S033-S052   64-point radix-2 authority and immutable stage-table ABI
S053-S072   six exact horizontal stages and scratchA parity
S073-S100   forward transpose, six vertical stages, transpose-back parity
S101-S120   natural row-major scratchB authority and one-shot handoff
S121-S140   one pass, fourteen dispatches, zero submission/copy/allocation churn
S141-S160   no global field or compatibility backend, failure and lifecycle closure
```

Source completion requires 160 of 160 gates PASS.

## 18. Negative-control mutants

Exactly 56 mutants must be detected. They cover:

```text
M001-M005   consumed, foreign, prematurely committed, or replayed handoffs
M006-M014   wrong transform size/radix/stage count/twiddle/normalization/table ABI
M015-M021   horizontal source/destination, skip/duplicate/reorder/alias/offset faults
M022-M032   missing/wrong transpose, column-order faults, wrong final slot, fftshift
M033-M038   wrong frequency layout, copy/global mirror, final-tail consumption
M039-M048   per-chunk pipeline/bind-group/uniform/encoder/submission/copy/readback/map
M049-M052   CPU/WASM/WebGL fallback and duplicate failure clearing
M053-M056   raw scratch exposure, handoff reuse, partial resume, cross-epoch resume
```

Patch-ID string checks alone do not count as detection.

## 19. Physical Gates

Physical QSR03D qualification requires 56 gates on packaged Windows x64 Electron:

```text
P001-P010   packaged WGSL, pipelines, layouts, dynamic offsets, validation
P011-P022   same encoder, exact fourteen-dispatch topology, zero churn
P023-P032   scratch and transpose parity, scratchB final authority, natural layout
P033-P046   qualification-only CPU-f64 numeric parity and failure-mask injection
P047-P056   one-shot handoffs, cancellation, encoder discard, device loss, recovery
```

All physical gates remain pending at source bake.

## 20. Package scripts

```json
{
  "scripts": {
    "verify:qmap-streaming-03d:parity": "node tools/qmap-streaming-reduction-03d/verify-stage-parity.mjs",
    "verify:qmap-streaming-03d:topology": "node tools/qmap-streaming-reduction-03d/verify-command-topology.mjs",
    "verify:qmap-streaming-03d:source": "node tools/qmap-streaming-reduction-03d/verify-source-gates-160.mjs",
    "verify:qmap-streaming-03d:mutants": "node tools/qmap-streaming-reduction-03d/run-mutants.mjs",
    "gate:qmap-streaming-03d": "node tools/qmap-streaming-reduction-03d/gate-source.mjs"
  }
}
```

## 21. Bake and repository policy

The GitHub commit contains this specification file only.

The separately delivered code ZIP contains application source, Stockham and transpose WGSL, frequency handoff, stable-error and service-token integration, validation tools, and package scripts.

The ZIP excludes this specification, generated reports, receipts, artifacts, manifests, patch evidence, logs, nested ZIPs, temporary typecheck files, fixture output, and Git metadata.

## 22. Completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03D_CHUNK_LOCAL_STOCKHAM64_2D_NATURAL_ROW_MAJOR_FREQUENCY_SCRATCHB_NO_GLOBAL_FREQUENCY_NO_COPY_NO_ADDITIONAL_SUBMISSION_AWAITING_LOCAL_POWER_REDUCTION_03E
```

Required facts:

- 160 of 160 Source Gates PASS;
- 56 of 56 mutants detected;
- QSR03C extraction and QSR03D Stockham share one encoder;
- 64 × 64 radix-2 transform and six stages per axis remain canonical;
- immutable records 2 through 7 carry the exact stage ABI;
- horizontal final slot is `scratchA`;
- forward transpose writes `transposeA`;
- vertical-transposed final slot is `transposeA`;
- transpose-back writes directly to `scratchB`;
- `scratchB` is the only frequency authority;
- layout is local-window-major, ky-major, kx-minor, complex f32;
- DC remains at index zero;
- no fftshift or bit reversal exists;
- active data begins at local offset zero;
- final short tail is non-authoritative and unread;
- exactly one compute pass and fourteen dispatches are added;
- zero queue submissions, copies, buffer allocations, pipelines, or bind groups are added per chunk;
- no global frequency field or compatibility FFT path exists;
- frequency handoff is private, same-encoder, and one-shot;
- QRC02 product routing remains unchanged;
- physical gates remain pending.

Prohibited claims:

```text
QMAP_POWER_REDUCTION_PASS
QMAP_COMPACT_FIELD_PASS
QMAP_PUBLICATION_PASS
QMAP_STREAMING_RUNTIME_PASS
QMAP_4K_PRODUCT_PASS
QMAP_8K_PRODUCT_PASS
PHYSICAL_QMAP_STREAMING_REDUCTION_03_PASS
```

## 23. Next patch boundary

```text
TDT-QMAP-STREAMING-REDUCTION-03E

Chunk-Local Power Spectrum /
Canonical Window-Energy Normalization /
Local Power Buffer Write /
PartialA·PartialB Deterministic Reduction /
Entropy·Peak Orientation·Selected Phase Finalization /
Exact Global Compact-Field Scatter /
Failure-Mask Propagation /
Same-Encoder Frequency Handoff Consumption /
No Full Power Atlas /
No CPU Reduction /
No Additional Queue Submission Seal
```

QSR03E consumes the one-shot QSR03D frequency handoff, same encoder, active lease, `scratchB`, `powerLocal`, `partialA`, `partialB`, `failureLocal`, exact local window count, global window base for compact scatter only, generation, plan, and epochs.

## 24. Final seal

```text
A chunk-local FFT is not complete merely because its butterflies ran.
Its stage order, ping-pong parity, transpose direction, final slot,
frequency coordinate system, encoder lineage, and memory scope must resolve
into one unambiguous result.

QSR03D begins with QSR03C scratchA spatial data.
Six row stages return to scratchA.
Forward transpose moves the matrix to transposeA.
Six column stages return to transposeA.
Transpose-back writes the final natural-row-major frequency field directly
to scratchB.

There is no global frequency atlas.
There is no final copy.
There is no bit-reversal repair.
There is no fftshift.
There is no intermediate queue submission.

The only valid next consumer receives a one-shot same-encoder capability
whose final authority is scratchB.
```
