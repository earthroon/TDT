# TDT-QMAP-STREAMING-REDUCTION-03F

## Global Compact Field Completion / Final-Chunk QMap Projection / Same-Encoder Final-Chunk Graph / Exact Compact-Record Consumption / Final EWA Coordinate QMap Rasterization / One Covering Submission per Chunk / Multi-Submission Streaming Receipt / Fence-Covered Cursor Advancement / No Partial QMap Publication Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03F
Short ID = QSR03F
Parent = TDT-QMAP-STREAMING-REDUCTION-03E
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Required parent = SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03E_CHUNK_LOCAL_NORMALIZED_POWER_DETERMINISTIC_PARTIAL_REDUCTION_GLOBAL_COMPACT_SCATTER_NO_FULL_POWER_ATLAS_NO_CPU_REDUCTION_NO_ADDITIONAL_SUBMISSION_AWAITING_FINAL_CHUNK_QMAP_PROJECTION_03F
State = SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03F owns the ordered chunk submission loop, authority completion tickets, fence-covered generation/cursor/compact commitment, final-chunk QMap projection, multi-submission execution receipt, and atomic Analysis Field publication eligibility. QRC02 remains the product route until QSR03G physical promotion.

## 1. Mandatory QSR03E ABI closure

QSR03E v1 lacks the angular moments, second peak, confidence, and center-anchored phase needed by canonical QMAP01. QSR03F supersedes the field layout without changing allocation sizes.

```text
partial schema = tdt.qmap.power-partial-record.qsr03e.v2
partial bytes = 48
compact schema = tdt.qmap.compact-record.qsr03e.v2
compact bytes = 56
QSR03B transient buffers = 10
QSR03B transient bytes = 66,758,400
```

Canonical spectral policy:

```text
transform = 64 x 64
radial band = [1/64, 0.5)
DC = excluded
self-conjugate Nyquist = excluded
pair ownership = canonical positive half-plane
candidate count = 1,602
peak tie = lower natural index
orientation = iso-phase feature tangent
phase anchor = window center (31.5, 31.5)
minimum valid band power = 2^-24
finite policy = fail-window-and-report
```

Partial v2 ABI:

```text
0 bandPower f32
4 sumPLogP f32
8 momentCos2 f32
12 momentSin2 f32
16 peakPower f32
20 secondPower f32
24 peakIndex u32
28 secondIndex u32
32 candidateCount u32
36 failureMask u32
40 pad0 u32 = 0
44 pad1 u32 = 0
```

Compact v2 is a flat 14-word `array<f32>`, never an alignment-expanded WGSL struct:

```text
0 normalizedEntropy
1 entropyValidity
2 orientationCos2
3 orientationSin2
4 peakShare
5 orientationConfidence
6 phaseCos
7 phaseSin
8 phaseMagnitude
9 phaseValidity
10 summaryEntropy
11 summaryCos2
12 summarySin2
13 summaryConfidence
```

Global window identity is the array position: `baseWord = globalWindowIndex * 14`.

Canonical confidence:

```text
angularCoherence = clamp(length(momentCos2, momentSin2) / bandPower, 0, 1)
peakShare = clamp(peakPower / bandPower, 0, 1)
dominance = clamp((peakPower-secondPower) / max(peakPower, 1e-30), 0, 1)
orientationConfidence = min(peakShare, dominance, angularCoherence)
```

Failed or zero-support windows write deterministic zero semantic words. Raw failure masks remain private in `failureLocal`.

## 2. Authorities

```text
coordinator = dadum.qmap-streaming-runtime-coordinator.qsr03f
submission authority = dadum.qmap-streaming-submission-authority.qsr03f
fence authority = dadum.qmap-streaming-fence-commit-authority.qsr03f
receipt authority = dadum.qmap-streaming-receipt-authority.qsr03f
QMap target authority = dadum.qmap-streaming-qmap-target-authority.qsr03f
projection recorder = dadum.qmap-final-projection-recorder.qsr03f
streaming receipt = tdt.qmap.streaming-runtime-receipt.qsr03f.v1
chunk record = tdt.qmap.chunk-submission-record.qsr03f.v1
QMap target = tdt.qmap.output-target.qsr03f.v1
```

Existing semantic identity is preserved:

```text
producer = tdt.analysis.producer.qmap.normalized-response
semantic = tdt.analysis.qmap.normalized-response.v1
implementation = tdt-qmap-spectral-response-projection-wgsl-v1
```

## 3. Operation-private QMap target

```text
format = rgba16float
dimension = 2d
width = analysisWidth
height = analysisHeight
layers = 1
mips = 1
samples = 1
usage = STORAGE_BINDING | TEXTURE_BINDING | COPY_SRC
coordinate authority = Final EWA analysis pixel
```

Reference bytes:

```text
1080p = 16,588,800
4K = 66,355,200
8K = 265,420,800
```

It is allocated once before chunk zero, outside the 64 MiB transient arena. State is private until the final fence:

```text
ALLOCATED_PRIVATE -> AVAILABLE_FOR_FINAL_GRAPH -> FINAL_GRAPH_RECORDED -> FINAL_FENCE_PENDING -> FENCE_COMPLETED -> PUBLICATION_ELIGIBLE -> PUBLISHED
```

## 4. Projection parameters and WGSL

QSR03B immutable stage-table record 15, offset 3,840, binds analysis/output geometry, 64 x 64 windows, stride 32, grid dimensions, compact v2 identity, projection policy, and alpha epsilon `1e-8`. No final-chunk parameter upload occurs.

```text
WGSL = app/legacy-runtime/core/compute/qmap_webgpu/shaders/qmap_compact_normalized_response_projection_qsr03.wgsl
shader = tdt.qmap.shader.compact-normalized-response-projection.qsr03f.v1
ABI = tdt.qmap.shader-abi.compact-normalized-response-projection.qsr03f.v1
pipeline = tdt.analysis.pipeline.qmap.compact-response-projection.qsr03f.v1
workgroup = 8 x 8 x 1
```

Bindings are complete compact target, private rgba16float QMap target, and immutable record 15. One pipeline and one bind group are created before chunk zero. No adapter, entropy buffer, orientation buffer, or QMap copy exists.

## 5. Final EWA coordinate rasterization

Output geometry equals Final EWA analysis geometry.

```text
sourceX = x
sourceY = y
gridX = (sourceX - 31.5) / 32
gridY = (sourceY - 31.5) / 32
```

The four adjacent compact records are bilinearly sampled with grid-index clamping. Per record:

```text
validity = clamp(entropyValidity,0,1) * finiteRecord
response = clamp((1-clamp(entropy,0,1)) * clamp(peakShare,0,1),0,1)
confidence = clamp(orientationConfidence,0,1)
```

When weighted support is not greater than `1e-8`, RGBA is zero. Otherwise R is validity-weighted response, G is validity-weighted confidence, B is zero, and A is support. This is direct QMAP01 mapping over compact v2.

## 6. SSOT and chunk graph

```text
slot generation SSOT = QSR03B arena
source cursor SSOT = QSR03C source capability
compact base SSOT = QSR03E compact target
submission sequence SSOT = QSR03F submission authority
publication SSOT = QSR03F QMap target plus Analysis Field Authority
```

Each chunk uses one encoder:

```text
QSR03C extraction
-> QSR03D 64x64 Stockham/transpose
-> QSR03E power/partial/compact scatter
-> QSR03F projection only on final chunk
-> finish once
-> submit once
```

Counters:

```text
non-final = 3 compute passes, 18 dispatches
final = 4 compute passes, 19 dispatches
maximum in-flight chunks = 1
```

The final projection follows the final compact scatter in the same encoder. Separate extraction, FFT, reduction, compact, or projection submissions are forbidden.

## 7. One covering submission and fence commit

Submission count equals chunk count:

```text
1080p = 5
4K = 18
8K = 72
```

One authority ticket binds operation, device epoch, sequence, encoder, slot, generation, chunk range, command-graph digest, compact end, and projection flag. Raw promises and foreign tickets are rejected.

Before submit, an immutable commit bundle binds slot generation, source cursor, compact base, sequence, ticket, encoder, and epoch. After the authoritative fence:

```text
1 verify device epoch
2 verify arena generation advanced exactly once
3 verify no later lease exists
4 commit compact range
5 advance source cursor
6 append chunk record
7 admit next chunk
```

Recording, encoder finish, and submit return never advance the compact base or source cursor. A post-fence logical mismatch terminates the operation without pretending to roll back physical GPU work.

## 8. Chunk records and streaming receipt

Each `tdt.qmap.chunk-submission-record.qsr03f.v1` binds exact chunk range, generation before/after, encoder/graph digest, sequence, ticket/fence digest, pass/dispatch counts, compact identity, projection presence, and zero-fallback counters.

The receipt mode is `ORDERED_MULTI_SUBMISSION_SINGLE_SLOT`. An ordered digest chain covers every completed chunk.

For `N = chunkCount`:

```text
total passes = 3N + 1
total dispatches = 18N + 1
submissions = N
```

Reference totals:

```text
1080p = 16 passes, 91 dispatches, 5 submissions
4K = 55 passes, 325 dispatches, 18 submissions
8K = 217 passes, 1,297 dispatches, 72 submissions
```

The receipt cannot seal before the final projection fence.

## 9. Analysis Field streaming admission

QSR03F adds explicit ordered multi-submission admission:

```text
markStreamingExecutionComplete(leaseId, AnalysisStreamingExecutionRecord)
```

Analysis Field Authority verifies receipt identity, exact count, strict sequence order, contiguous compact ranges, one completed fence per chunk, projection only on the final chunk, current epoch, and zero CPU/WebGL/Canvas/readback counters. Existing single-submit producers remain compatible.

One QMAP01 build lease remains `BUILDING` during intermediate chunks and becomes fence-complete only after this admission.

## 10. Atomic publication and no partial QMap

Publication requires fully completed compact target, streaming-complete source cursor, final arena generation, all chunk/fence records, publication-eligible QMap target, sealed receipt, admitted Analysis build, and current device epoch.

Published field:

```text
semantic = tdt.analysis.qmap.normalized-response.v1
producer = tdt.analysis.producer.qmap.normalized-response
resource = texture-2d rgba16float
geometry = Final EWA analysis geometry
coordinate space = output-pixel
claim = EFFECTIVE_EXECUTION
```

Before final fence, the QMap target cannot enter Analysis Field, Surface Registry, Preview, Export, EFC, warm cache, renderer IPC, project state, or persistent diagnostics. No partial, tiled, chunk, preview, or compatibility QMap texture exists.

After publication, QMap texture ownership transfers once to Analysis Field Authority. Compact and transient private resources are released.

## 11. Cancellation, device loss, and errors

Pre-submit cancellation discards the encoder and commits no range. Post-submit cancellation waits for its ticket or device loss, admits no next chunk, and never publishes. Device loss invalidates arena, source, compact target, QMap target, ticket, commit bundle, receipt builder, build lease, and handoffs. Recovery starts at chunk zero under a fresh epoch.

Stable errors:

```text
E_QMAP03_PARENT_COMPACT_ABI_MISMATCH
E_QMAP03_SPECTRAL_POLICY_MISMATCH
E_QMAP03_QMAP_TARGET_INVALID
E_QMAP03_QMAP_PROJECTION_TOO_EARLY
E_QMAP03_FINAL_CHUNK_GRAPH_MISMATCH
E_QMAP03_COMPACT_FIELD_INCOMPLETE
E_QMAP03_COMPACT_RANGE_NOT_FENCE_COMMITTED
E_QMAP03_SUBMISSION_SEQUENCE_MISMATCH
E_QMAP03_MULTIPLE_SUBMISSIONS_PER_CHUNK
E_QMAP03_COMPLETION_TICKET_MISMATCH
E_QMAP03_FENCE_COMMIT_MISMATCH
E_QMAP03_CURSOR_ADVANCE_BEFORE_FENCE
E_QMAP03_STREAMING_RECEIPT_INVALID
E_QMAP03_ANALYSIS_STREAMING_ADMISSION_FAILED
E_QMAP03_PARTIAL_QMAP_PUBLICATION_FORBIDDEN
E_QMAP03_QMAP_PUBLICATION_FAILED
E_QMAP03_CANCELLED
E_QMAP03_DEVICE_LOST
```

## 12. Implementation surfaces

New TS surfaces: runtime types/coordinator, submission authority, fence commit, streaming receipt, QMap target, final projection, and publication. New legacy surfaces mirror these authorities. New WGSL is `qmap_compact_normalized_response_projection_qsr03.wgsl`.

Mandatory parent edits cover QSR03E partial/compact v2, stage-table record 15, fence-bound compact commitment, QSR03C cursor proof, Analysis Field streaming types/service, stable errors, service tokens, and package scripts. No generated manifest is modified.

## 13. Source and physical gates

QSR03F requires exactly 192 Source Gates:

```text
S001-S016 identity and parent closure
S017-S032 spectral ABI
S033-S048 compact v2
S049-S064 QMap target/parameters
S065-S080 projection mapping
S081-S096 per-chunk graph
S097-S112 submission/ticket
S113-S128 fence commitment
S129-S144 receipt chain
S145-S160 Analysis admission
S161-S176 no partial publication
S177-S192 lifecycle/forbidden paths
```

Exactly 72 mutants cover v1 retention, ABI expansion, wrong candidate/orientation/phase policy, adapter buffers, wrong geometry, early/separate projection, multiple submissions, pre-fence commits, foreign tickets, receipt gaps/overlaps/reordering, synthetic evidence, partial publication, cancellation/device-loss publication, and CPU/WebGL/readback fallback.

Physical qualification requires 72 packaged Windows x64 Electron gates. It may use qualification-only readback for QRC02 parity. Product execution performs no readback. All physical gates remain pending.

## 14. Package and repository policy

```json
{
  "scripts": {
    "verify:qmap-streaming-03f:parent-abi": "node tools/qmap-streaming-reduction-03f/verify-parent-abi-closure.mjs",
    "verify:qmap-streaming-03f:projection": "node tools/qmap-streaming-reduction-03f/verify-projection-mapping.mjs",
    "verify:qmap-streaming-03f:runtime": "node tools/qmap-streaming-reduction-03f/verify-runtime-loop.mjs",
    "verify:qmap-streaming-03f:source": "node tools/qmap-streaming-reduction-03f/verify-source-gates-192.mjs",
    "verify:qmap-streaming-03f:mutants": "node tools/qmap-streaming-reduction-03f/run-mutants.mjs",
    "gate:qmap-streaming-03f": "node tools/qmap-streaming-reduction-03f/gate-source.mjs"
  }
}
```

The GitHub commit contains this specification only. The code ZIP excludes specifications, reports, physical evidence, bake artifacts, generated manifests, patch files, logs, nested ZIPs, temporary files, and Git metadata.

## 15. Completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03F_CANONICAL_COMPACT_V2_ONE_SUBMISSION_PER_CHUNK_ALL_FENCES_COMPLETED_FINAL_CHUNK_QMAP_PROJECTED_MULTI_SUBMISSION_RECEIPT_SEALED_ATOMIC_ANALYSIS_PUBLICATION_BOUND_AWAITING_PRODUCT_PROMOTION_AND_PHYSICAL_03G
```

Required source facts:

```text
Source Gates = 192/192
Mutants = 72/72
partial v2 = 48 bytes
compact v2 = 56 bytes
candidate count = 1,602
4K submissions = 18
4K passes = 55
4K dispatches = 325
max in-flight = 1
QSR03B arena = 10 buffers, 66,758,400 bytes
4K compact target = 439,824 bytes
4K QMap target = 66,355,200 bytes
QRC02 product route = unchanged
physical gates = pending
```

Prohibited claims:

```text
QSR03_PRODUCT_ROUTE_PROMOTED
QSR03_WARM_REUSE_PASS
QSR03_EFC_END_TO_END_PASS
QSR03_4K_PRODUCT_PASS
QSR03_8K_PRODUCT_PASS
PHYSICAL_QMAP_STREAMING_REDUCTION_03_PASS
```

## 16. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G

Cold-Operation FIFO /
Duplicate Request Single-Flight /
Warm Promise Sharing /
QRC02-to-QSR03 Product Route Promotion /
Streaming Receipt Publication Parity /
EFC End-to-End Convergence /
Cancellation Replay /
Device-Loss Recovery /
Packaged 4K-8K Physical Seal
```

## 17. Final seal

```text
Every chunk is encoded once, submitted once, and covered by its own fence.
Generation, compact base, and source cursor advance only through that fence.

The final chunk appends projection after compact scatter in the same encoder.
The complete compact field is consumed directly into one Final EWA-sized
rgba16float QMap target.

There is no compact adapter, separate projection submission, synthetic
single-submission receipt, or partial publication.

Only after all fences, the ordered receipt, and Analysis Field admission agree
may the QMap texture become public.
```
