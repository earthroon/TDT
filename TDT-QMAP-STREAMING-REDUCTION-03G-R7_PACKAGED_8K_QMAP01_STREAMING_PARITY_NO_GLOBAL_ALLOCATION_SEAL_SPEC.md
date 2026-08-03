# TDT-QMAP-STREAMING-REDUCTION-03G-R7

## Packaged 8K Core Physical Closure / Seventy-Two-Chunk Submission Parity / Final-Chunk-218 Coverage / Full QMAP01 Output Parity / Three-Cycle Resource Plateau / Sixteen-Way Warm Sharing / No Hidden Global Frequency or Power Allocation / No Product Promotion Yet Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R7
Short ID = QSR03G-R7
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R6
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

Required parent source state:

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R6_MAIN_ONE_SHOT_DEVICE_LOSS_PERMIT_ROOT_DEVICE_LOSS_OBSERVER_OLD_EPOCH_TOTAL_INVALIDATION_REPLACEMENT_ADAPTER_AND_DEVICE_FRESH_ROOT_RESOURCE_REBUILD_FINAL_EWA_DEVICE_REBUILD_CHUNK_ZERO_ONE_RESTART_LIVE_WAITER_PRESERVATION_SECOND_LOSS_TERMINAL_FAILURE_ZERO_STALE_DEVICE_RESOURCE_NO_PRODUCT_PROMOTION_AWAITING_PACKAGED_DEVICE_LOSS_PHYSICAL_EXECUTION
```

R7 physically validates the complete isolated 8K QSR03 candidate composition. It may consume R2 named evidence and R3-R6 qualification authorities. It may not issue a promotion trial permit, final physical admission, product promotion permit, or global QSR03 product route.

## 1. Canonical 8K plan

```text
analysis geometry = 7680 × 4320
window = 64 × 64
stride = 32 × 32
grid = 239 × 134
window count = 32,026
chunk capacity = 448
chunk count = 72
final chunk index = 71
final chunk base = 31,808
final chunk windows = 218
final exclusive end = 32,026
```

Chunks 0-70 contain 448 windows. Chunk 71 contains 218. Coverage must be ordered, gap-free, overlap-free and duplicate-free.

## 2. Mandatory parent corrections

R4 readback sizing is generalized from fixed 4K defaults to plan-derived sizes:

```text
compactBytes = plan.windowCount × 56
qmapBytesPerRow = plan.analysisWidth × 8
qmapBytes = qmapBytesPerRow × plan.analysisHeight
```

Caller-provided byte sizes are not authority.

The 8K oracle may not allocate a full coordinate collection, full expected f64 RGBA frame, full cloned actual QMap, per-texel object graph, or full ULP list. Compact records are decoded into three Float64Array structure-of-arrays buffers. Expected output is produced one scanline at a time. The comparator consumes the mapped QMap directly and derives exact p99 ULP from a fixed 65,537-bin histogram.

All QSR03 candidate GPUBuffer and GPUTexture allocations pass through one tracked allocator. Every allocation binds resource ID, role, class, scope, sizing authority, byte size, logical extent, callsite, operation/cycle and device epoch. Direct operation allocation outside this authority is forbidden.

## 3. Resource geometry

```text
QSR03B buffers = 10
QSR03B transient bytes = 66,758,400
compact bytes = 1,793,456
QMap bytes = 265,420,800
Final EWA logical texture bytes = 265,420,800
compact readback bytes = 1,793,456
QMap readback bytes = 265,420,800
QMap bytesPerRow = 61,440
```

The readback buffers are root-scoped and reused across three cold cycles.

## 4. No hidden global frequency or power allocation

Frequency-domain roles are exactly:

```text
scratchA = 14,680,064 bytes
scratchB = 14,680,064 bytes
transposeA = 14,680,064 bytes
transposeB = 14,680,064 bytes
```

Power roles are exactly:

```text
powerLocal = 7,340,032 bytes
partialA = 344,064 bytes
partialB = 344,064 bytes
```

All use sizing authority `CHUNK_CAPACITY_448`. They are allocated once per arena before chunk zero and reused across all 72 chunks.

Forbidden application-visible resources include any `GLOBAL_FREQUENCY`, `GLOBAL_POWER`, window-count-sized frequency/power buffer, per-chunk scratch allocation, and local compact mirror. A 1,049,427,968-byte full-window complex buffer or 524,713,984-byte global power buffer must never be requested.

This authority covers WebGPU resources visible to the application. It does not claim visibility into driver-internal allocations.

## 5. Seventy-two-chunk command graph

Chunks 0-70 each record three compute passes and eighteen dispatches. Chunk 71 records four passes and nineteen dispatches and carries projection plus compact/QMap qualification copies in the same command buffer.

Per cycle:

```text
compute passes = 217
compute dispatches = 1,297
command encoders = 72
command buffers = 72
queue submissions = 72
completion fences = 72
maximum in-flight submissions = 1
```

A seventy-third command buffer or submission is forbidden.

## 6. Final-chunk-218 closure

Chunk 71 must scatter exactly 218 compact records, project the final QMap, copy the complete compact and QMap targets, submit once and resolve one authoritative fence.

Final state:

```text
compact expectedNextWindowBase = 32,026
compact state = FULLY_COMPLETED
Final EWA cursor = STREAMING_COMPLETE
arena generation = 72
QMap state = PUBLICATION_ELIGIBLE
```

## 7. Streaming CPU-f64 QMAP01 oracle

The oracle profile is `tdt.qmap.streaming-qmap01-cpu-f64-oracle.qsr03g-r7.v1` and is qualification-only.

Compact-v2 records are decoded into validity, response and confidence structure-of-arrays buffers. Output coordinates are generated from the current x/y or linear texel ordinal. Four neighboring compact records are index-clamped to the 239×134 grid and combined with validity-weighted bilinear interpolation.

```text
support <= 1e-8 → RGBA = 0
otherwise:
R = weighted response / support
G = weighted confidence / support
B = 0
A = clamp(support, 0, 1)
```

Expected values use f64 math and IEEE-754 binary16 round-to-nearest-even conversion.

Auxiliary retained host storage, excluding mapped GPU ranges, must remain at or below 2,097,152 bytes.

## 8. Full QMAP01 output parity

Every cycle compares every one of 33,177,600 texels and all 132,710,400 RGBA channels.

```text
nonfinite actual channels = 0
B raw f16 bits = 0x0000 for every texel
zero-support classification = exact
R/G/A maximum absolute error <= 2^-9
R/G/A maximum finite f16 ULP <= 2
R/G/A p99 f16 ULP <= 1
R/G/A mean absolute error <= 2^-13
```

Mapped QMap and compact bytes are hashed incrementally without full clones. Three full parity cycles must produce identical compact digest, QMap digest, support count, nonfinite count, B count and error metrics.

## 9. Publication authenticity

Each cold cycle creates one Analysis build lease, one streaming execution admission, one Analysis field publication, one QMap ownership transfer and one field generation.

The field is canonical QMap semantic/producer, rgba16float, 7680×4320, output-pixel, EFFECTIVE_EXECUTION, candidate qualification only and product-route ineligible.

Publication waits for 72 fences, compact completion, full parity PASS and zero validation error. The publication receipt binds the exact QMap texture resource written by chunk 71.

## 10. Three-cycle plateau

One packaged run executes three serial cold cycles. Cycles 1-2 publish, release their caller pin, evict warm metadata and retire the field. Cycle 3 performs the warm burst before final retirement.

Aggregate:

```text
cold cycles = 3
submissions = 216
fences = 216
compute passes = 651
dispatches = 3,891
publications = 3
```

Per cycle, operation-private maxima are eleven GPUBuffer resources and two GPUTexture resources. After field retirement, operation-private buffers, textures, arenas, compact targets, fields, pins, mapped ranges and raw host output references must all be zero. Root shader modules, seven pipelines and two readback buffers remain constant.

Creation/destruction balance:

```text
arena buffers = 30/30
compact buffers = 3/3
Final EWA textures = 3/3
QMap textures = 3/3
```

## 11. Sixteen-way warm sharing

After cycle 3 publication, sixteen concurrent requests return `WARM_SHARED` and unique caller pins for one field generation.

Warm delta:

```text
new cold jobs = 0
new command encoders = 0
new submissions = 0
new fences = 0
new GPUBuffer/GPUTexture allocations = 0
new Analysis admissions/publications = 0
unused incoming Final EWA capabilities retired = 16
```

The field retires only after all seventeen pins, including the cold leader pin, are released.

## 12. Evidence authority

R7 defines a separate qualification namespace N001-N072:

```text
N001-N008 packaged authority and 8K plan
N009-N016 tracked allocation topology
N017-N024 no hidden frequency/power allocation
N025-N032 command graph
N033-N040 submissions, fences and final coverage
N041-N048 full parity
N049-N056 publication and plateau
N057-N064 warm sharing
N065-N072 aggregate evidence, validation and no-promotion boundary
```

The 72 immutable receipts form a domain-separated 72-leaf Merkle tree. Stored roots are independently rebuilt. N receipts cannot enter the P001-P096 tree and cannot mint a trial permit, admission or promotion permit.

Later R2 executors may independently consume R7 evidence for 8K, parity, submission, resource and warm domains.

## 13. Source gates and negative controls

```text
Source Gates = 320
Negative Controls = 136
Physical N-gate definitions = 72
```

Source controls cover plan geometry, tracked allocation, frequency/power denial, 72-chunk command topology, fence parity, final 218 coverage, geometry-derived readback, streaming oracle/comparator, bounded host working set, three-cycle determinism, publication authenticity, plateau, warm sharing, WebGPU validation, evidence closure, no-promotion boundary and parent A-R6 regressions.

Negative controls cover wrong geometry/chunks, untracked resources, global or per-chunk scratch, wrong command/submission/fence counts, final range errors, fixed 4K readback, full-frame host allocations, sampled parity, relaxed thresholds, retained cycle data, resource leaks, warm GPU work, N/P tree mixing, permit minting and false EFC/product-promotion claims.

## 14. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R7_PACKAGED_8K_CORE_AUTHORITY_32026_WINDOW_PLAN_SEVENTY_TWO_CHUNK_GRAPH_FINAL_CHUNK_218_GEOMETRY_DERIVED_READBACK_STREAMING_QMAP01_ORACLE_FULL_OUTPUT_PARITY_TRACKED_RESOURCE_ALLOCATOR_NO_GLOBAL_FREQUENCY_OR_POWER_RESOURCE_THREE_CYCLE_PLATEAU_SIXTEEN_WAY_WARM_SHARING_NO_PRODUCT_PROMOTION_AWAITING_PACKAGED_8K_PHYSICAL_EXECUTION
```

Required source facts:

```text
Source Gates = 320/320
Negative Controls = 136/136
N-gate definitions = 72
8K windows = 32,026
chunks/submissions/fences = 72/72/72
final chunk windows = 218
passes/dispatches = 217/1,297
three-cycle submissions/fences = 216/216
warm requests/submissions = 16/0
global frequency resources = 0
global power resources = 0
physical N gates executed = 0/72
R2 P gates executed = 0/96
trial permit artifacts = 0
physical admission artifacts = 0
product permit artifacts = 0
product promotion = false
QRC02 product route = unchanged
```

Source WebGPU doubles prove control-flow and authority closure only. They are not physical 8K evidence.

## 15. Physical completion state

```text
PACKAGED_8K_CORE_PHYSICAL_BAKED_QMAP_STREAMING_REDUCTION_03G_R7_FULL_QMAP01_PARITY_SEVENTY_TWO_SUBMISSION_PARITY_FINAL_CHUNK_218_COVERAGE_NO_GLOBAL_FREQUENCY_OR_POWER_ALLOCATION_THREE_CYCLE_RESOURCE_PLATEAU_SIXTEEN_WAY_WARM_SHARING_ZERO_WARM_GPU_WORK_GLOBAL_QRC02_BRIDGE_UNCHANGED_NO_PRODUCT_PROMOTION
```

Required physical facts later:

```text
N gates = 72/72
cold cycles = 3
real submissions/fences = 216/216
QMAP01 parity runs = 3/3 PASS
full compared texels = 99,532,800
cold publications = 3
warm deliveries/submissions = 16/0
global frequency allocations = 0
global power allocations = 0
terminal candidate resource balance = 0
WebGPU validation errors = 0
product promotion = false
```

## 16. Package and repository policy

The code ZIP contains the 8K plan and fixture coordinator, tracked allocator, allocation-topology and global-allocation denial authorities, geometry-derived readback, streaming oracle/comparator/hash, host-working-set guard, three-cycle plateau, sixteen-way warm sharing, N001-N072 evidence, source validators and physical launcher/verifier.

It excludes this specification, raw mapped output, N/P receipts, Merkle artifacts, trial permit, physical admission, product permit, reports, logs, temporary evidence, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 17. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R8

Packaged EFC Convergence Physical Closure /
Canonical QMap Field Pin /
QMap-QWave Device Identity Coherence /
Bakemono Rinne Live Field Consumption /
Converged Final Surface Publication /
One-Publish Final Surface Receipt /
Zero Hidden QRC02 Execution /
No Product Promotion Yet Seal
```

## 18. Final seal

```text
R7 is not merely a larger 4K fixture.

All 32,026 windows are covered by 72 chunks.
The final chunk covers exactly 218 windows.
All command buffers, submissions, fences and receipts agree.

The 8K oracle is streaming and bounded.
It creates no full coordinate array, expected frame, actual clone or ULP list.

Frequency and power buffers belong to one 448-window arena slot.
They never scale with all 32,026 windows and are never allocated per chunk.

Three 8K cycles publish three authentic fields and return operation-private
resources to zero. Sixteen warm callers create no GPU work.

R7 emits qualification evidence only.
It creates no physical admission or product promotion permit.
The global QRC02 bridge remains unchanged.
```
