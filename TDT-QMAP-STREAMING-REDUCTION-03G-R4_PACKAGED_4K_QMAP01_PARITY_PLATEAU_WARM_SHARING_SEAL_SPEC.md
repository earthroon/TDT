# TDT-QMAP-STREAMING-REDUCTION-03G-R4

## Packaged 4K Core Physical Closure / QMAP01 Output Parity / Eighteen-Chunk Submission Parity / Fence-Covered Compact Completion / Analysis Publication Authenticity / Five-Cycle Resource Plateau / Thirty-Two-Way Warm Sharing / No Product Promotion Yet Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R4
Short ID = QSR03G-R4
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R3
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Required parent = SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R3_PACKAGED_RENDERER_BOOTSTRAP_REAL_WEBGPU_DEVICE_AND_QUEUE_AUTHORITY_PACKAGED_FOUR_WGSL_MODULES_SEVEN_REAL_COMPUTE_PIPELINES_NATIVE_ENCODER_JOURNAL_FIVE_CHUNK_GRAPH_AUTHORITY_CANDIDATE_ANALYSIS_PUBLICATION_PRIVATE_RESOURCE_RETIREMENT_R2_NAMED_SMOKE_EVIDENCE_BOUND_AWAITING_PACKAGED_1080P_SMOKE
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03G-R4 is the first 4K physical-closure patch for the isolated QSR03 candidate route. It extends the R3 live WebGPU path to 3840×2160, proves the 18-chunk command topology, adds qualification-only compact and QMap readback, defines an independent CPU-f64 QMAP01 oracle, binds the published Analysis field to the actual QMap resource, separates the canonical field reference from caller pins, and defines five-cycle plateau plus 32-way warm sharing evidence.

R4 may create qualification-only readbacks. It may not create a promotion trial permit, final physical admission, product promotion permit, or global QSR03 product bridge.

## 1. Mandatory parent corrections

### Field reference and caller pins

The Analysis registry owns one canonical field reference. Cold, joined and warm callers receive separate pin handles. Releasing one pin cannot retire the underlying field or invalidate another pin. Warm metadata contains only the canonical field reference and owns no pin. Field retirement occurs only after retirement has been requested and active pin count reaches zero.

### Qualification readback

An optional candidate-only hook is inserted after final projection and before final encoder finish. The hook records compact and QMap copies in encoder 17. It does not create a nineteenth submission. Mapping begins only after completion fence 18.

### Publication authenticity

The candidate publication receipt binds QMap target identity digest, tracked GPUTexture resource ID, Analysis field ID and generation, field descriptor digest, Analysis execution receipt digest, streaming receipt digest and publication receipt digest. All identities must resolve to one texture.

## 2. Source and physical completion states

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R4_PACKAGED_4K_CORE_AUTHORITY_7854_WINDOW_PLAN_EIGHTEEN_CHUNK_SUBMISSION_GRAPH_QUALIFICATION_READBACK_CPU_F64_QMAP01_ORACLE_FENCE_COVERED_COMPACT_COMPLETION_AUTHENTIC_ANALYSIS_PUBLICATION_REFERENCE_COUNTED_FIELD_PINS_FIVE_CYCLE_RESOURCE_LEDGER_THIRTY_TWO_WAY_WARM_SHARING_NO_PRODUCT_PROMOTION_AWAITING_PACKAGED_4K_PHYSICAL_EXECUTION
```

```text
PACKAGED_4K_CORE_PHYSICAL_BAKED_QMAP_STREAMING_REDUCTION_03G_R4_FULL_QMAP01_PARITY_EIGHTEEN_SUBMISSION_PARITY_FENCE_COVERED_7854_COMPACT_RECORDS_AUTHENTIC_ANALYSIS_PUBLICATION_FIVE_CYCLE_OPERATION_PRIVATE_PLATEAU_THIRTY_TWO_WAY_WARM_PROMISE_SHARING_ZERO_WARM_GPU_WORK_GLOBAL_QRC02_BRIDGE_UNCHANGED_NO_PRODUCT_PROMOTION
```

The source state does not claim K001-K048 physical completion.

## 3. Canonical 4K geometry and resources

```text
analysisWidth = 3840
analysisHeight = 2160
window = 64 × 64
stride = 32 × 32
grid = 119 × 66
windowCount = 7,854
chunkCapacity = 448
chunkCount = 18
finalChunkIndex = 17
finalChunkWindows = 238
```

Chunk 0 begins at record 0. Chunk 16 begins at 7,168. Chunk 17 begins at 7,616 and ends at 7,854. Gaps, overlaps and reordered commitments are forbidden.

```text
QSR03B arena GPUBuffer count = 10
QSR03B arena bytes = 66,758,400
compact records = 7,854
compact record bytes = 56
compact target bytes = 439,824
QMap format = rgba16float
QMap dimensions = 3840 × 2160
QMap bytes = 66,355,200
```

Candidate compact usage is `STORAGE | COPY_SRC`. QMap usage includes `STORAGE_BINDING | TEXTURE_BINDING | COPY_SRC`.

## 4. Eighteen-chunk command and submission graph

Chunks 0 through 16 contain three compute passes and eighteen dispatches. Chunk 17 contains four compute passes and nineteen dispatches. The final encoder records extraction, Stockham and transpose, power and compact scatter, QMap projection, compact copy and QMap copy.

```text
compute passes = 55
compute dispatches = 325
command encoders = 18
command buffers = 18
queue submissions = 18
completion fences = 18
maximum in-flight submissions = 1
```

QSR03A plan count, QSR03F receipt count and live queue observation must agree. Every submit contains one command buffer. Projection and qualification copies remain in submission 18. A nineteenth submit is forbidden.

## 5. Qualification readback authority

One root-scoped compact staging buffer and one root-scoped QMap staging buffer are created before cycle 1 and reused for five cycles.

```text
compact staging bytes = 439,824
QMap bytes per row = 30,720
QMap rows = 2,160
QMap staging bytes = 66,355,200
```

Per cycle:

```text
unmap
→ record final copies
→ submit 18
→ resolve fence 18
→ mapAsync(MAP_READ)
→ hash and compare
→ unmap
```

Qualification readbacks per cycle are one compact and one QMap readback. Product readback count remains zero.

## 6. Independent CPU-f64 QMAP01 oracle

The oracle profile is `tdt.qmap.qmap01-cpu-f64-oracle.qsr03g-r4.v1`. It imports no product projection implementation and is excluded from the promoted product composition.

Each 56-byte compact-v2 record contributes entropy, entropy validity, orientation cos2, orientation sin2, peak share and orientation confidence. The finite record validity is clamped to [0,1]. Response is `(1-clamp(entropy))*clamp(peakShare)`. Confidence is clamped orientation confidence.

Output coordinates use pixel-center mapping to the 64/32 compact grid. Four surrounding records are index-clamped and validity-weighted bilinear projection is applied. Support at or below `1e-8` emits zero RGBA. Otherwise R and G are support-normalized, B is zero and A is clamped support. Computation uses f64 and expected binary16 values use round-to-nearest-even.

## 7. QMAP01 parity profile

Every one of the 8,294,400 output texels is compared. No sampling or crop is admitted.

```text
nonfinite actual channels = 0
B raw binary16 bits = 0x0000
zero-support classification = exact
R/G/A maximum absolute error <= 2^-9
R/G/A maximum finite binary16 ULP <= 2
R/G/A p99 ULP <= 1
R/G/A mean absolute error <= 2^-13
```

Five cold cycles execute full parity. Compact raw digest, QMap raw digest, support count, nonfinite count and metrics must be identical across cycles.

## 8. Fence-covered compact completion

Each chunk receipt binds chunk index, range, submission, command graph, completion ticket, compact handoff and generation before/after. Arena generation, compact range and Final EWA cursor advance only after the authoritative fence.

Final state:

```text
arena generation = 18
compact expectedNextWindowBase = 7,854
compact state = FULLY_COMPLETED
source state = STREAMING_COMPLETE
QMap state before publication = PUBLICATION_ELIGIBLE
```

## 9. Analysis publication authenticity

Per cold cycle:

```text
Analysis build leases = 1
streaming execution admissions = 1
Analysis publications = 1
QMap ownership transfers = 1
field generations = 1
```

The field is canonical QMap semantic and producer, rgba16float, 3840×2160, output-pixel, EFFECTIVE_EXECUTION, candidate qualification only, product route ineligible and product warm-cache ineligible.

The published field resource ID must equal the resource ID of the QMap target written by final projection. Warm delivery binds the existing publication and never mints another publication receipt.

## 10. Field reference and pin SSOT

Publication returns one internal field reference. Every delivery receives a unique pin ID carrying the same field ID, generation and physical resource identity. A pin transitions ACTIVE to RELEASED once. Warm metadata stores no pin. Retirement waits for zero active pins and destroys one Analysis-owned QMap texture.

## 11. Five-cycle plateau

Five cold cycles execute serially. Each has a unique operation, source revision, Final EWA resource, replay receipt and runtime receipt while using identical fixture bytes.

```text
cold cycles = 5
cold submissions = 90
cold fences = 90
cold publications = 5
```

After every field retirement, all operation-private buffers, textures, arenas, compact targets, Final EWA capabilities, Analysis fields, completion tickets and caller pins are zero. Root-scoped shader modules, seven pipelines and two readback buffers remain constant.

Across five cycles:

```text
arena buffers created/destroyed = 50/50
compact buffers created/destroyed = 5/5
Final EWA textures created/destroyed = 5/5
QMap textures created/destroyed = 5/5
```

## 12. Thirty-two-way warm sharing

After cycle 5 publication and before field retirement, thirty-two concurrent requests use the same logical and device key.

```text
warm dispositions = 32 × WARM_SHARED
underlying fields = 1
underlying QMap textures = 1
caller pins = 33 including cold leader
new cold jobs = 0
new command encoders = 0
new submissions = 0
new fences = 0
new GPUBuffer allocations = 0
new GPUTexture allocations = 0
new Analysis admissions = 0
new Analysis publications = 0
unused incoming capability retirements = 32
```

Every warm delivery has a unique request, waiter, delivery receipt and pin. One pin release cannot invalidate another. Retirement occurs after all 33 pins release.

## 13. R2 evidence mapping

R4 defines K001-K048 as qualification evidence. These receipts and the 48-leaf R4 Merkle tree are separate from R2 P001-P096. Later P executors may independently consume R4 evidence for 4K completion, QMAP01 parity, submission parity, publication authenticity, plateau and warm sharing. R4 cannot pre-authorize a P gate or mint any permit.

K families:

```text
K001-K008 packaged route and device
K009-K016 plan and submissions
K017-K024 compact and publication
K025-K032 QMAP01 parity
K033-K040 five-cycle plateau
K041-K048 warm sharing and no-promotion boundary
```

## 14. Source gates and negative controls

```text
Source Gates = 272
Negative controls = 112
4K qualification gates = 48
```

Source gates cover identity, packaged isolation, exact 4K plan, readback authority, independent oracle, parity thresholds, 18-submit topology, fence completion, publication resource identity, field pins, five-cycle ledger, 32-way warm sharing, R2 evidence integration, no promotion and reproducibility.

Negative controls cover bridge mutation, wrong geometry/chunks/resources, readback ordering and extra submit, oracle coupling or relaxed thresholds, parity sampling, wrong submit/fence counts, pre-fence commitment, publication resource substitution, shared destructive handles, premature retirement, cycle overlap and leaks, warm GPU work, K/P Merkle mixing, permit minting and false 8K/EFC/promotion claims.

Source WebGPU doubles validate control flow only and are not physical evidence.

## 15. Required source facts

```text
Source Gates = 272/272
Negative controls = 112/112
K-gate definitions = 48
4K windows = 7,854
chunks/submissions/fences = 18/18/18
passes/dispatches = 55/325
five-cycle expected cold submissions = 90
warm requests = 32
warm submissions = 0
physical K gates executed = 0/48
R2 P gates executed = 0/96
trial permit artifacts = 0
physical admission artifacts = 0
product permit artifacts = 0
product promotion = false
QRC02 product route = unchanged
```

## 16. Required physical facts later

```text
K gates = 48/48
cold cycles = 5
cold submissions/fences = 90/90
QMAP01 parity runs = 5/5 PASS
cold publications = 5
warm deliveries = 32
warm submissions = 0
warm GPU allocations = 0
terminal candidate resource balance = 0
WebGPU validation errors = 0
product promotion = false
```

## 17. Package and repository policy

The code ZIP contains the 4K runner, readback arena, QMAP01 oracle and comparator, field-pin and publication authorities, resource ledger, cycle and warm coordinators, K registry/evidence, source validators and packaged launcher/verifier.

It excludes this specification, readback outputs, K/P gate receipts, Merkle artifacts, trial permit, physical admission, product permit, reports, logs, temporary files, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 18. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R5

Packaged Cancellation and Single-Flight Physical Closure /
Queued Cancellation /
Joined-Waiter Isolation /
All-Waiter Pre-Submit Abort /
Middle-Chunk Fence Drain /
Final-Fence Cancellation /
Fresh Replay Generation /
No Partial Publication /
Zero Private Resource Leak Seal
```

## 19. Final seal

```text
R4 does not merely prove that submission 18 completed.

All 7,854 compact records must be fence-covered.
The plan, command graphs, receipts, submissions and fences must agree.
Qualification copies remain in submission 18.

All 8,294,400 QMap texels are compared with an independent CPU-f64 oracle.
The Analysis field must own the exact GPUTexture written by final projection.

Warm callers receive individual pins rather than one destructive handle.
Thirty-two warm deliveries create no GPU work and no publication.

Five cold cycles return operation-private resources to zero.
R4 emits qualification evidence only.
It does not create admission or promotion authority.
The global QRC02 bridge remains unchanged.
```
