# TDT-QMAP-STREAMING-REDUCTION-03E

## Chunk-Local Power Spectrum / Canonical Window-Energy Normalization / Local Power Buffer Write / PartialA-PartialB Deterministic Reduction / Entropy-Peak Orientation-Selected Phase Finalization / Exact Global Compact-Field Scatter / Failure-Mask Propagation / Same-Encoder Frequency Handoff Consumption / No Full Power Atlas / No CPU Reduction / No Additional Queue Submission Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03E
Short ID = QSR03E
Parent = TDT-QMAP-STREAMING-REDUCTION-03D
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Required parent state = SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03D_CHUNK_LOCAL_STOCKHAM64_2D_NATURAL_ROW_MAJOR_FREQUENCY_SCRATCHB_NO_GLOBAL_FREQUENCY_NO_COPY_NO_ADDITIONAL_SUBMISSION_AWAITING_LOCAL_POWER_REDUCTION_03E
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03E consumes the one-shot QSR03D `scratchB` frequency handoff and writes one operation-private 56-byte compact record per global analysis window. It owns local normalized power, deterministic partial reduction, entropy, axial peak orientation, representative-bin phase, exact global scatter, and failure-mask propagation.

QSR03E does not own QMap projection, queue submission, completion-ticket issuance, slot-generation or cursor advancement, Analysis publication, EFC convergence, or product-route promotion.

## 1. Authority

```text
powerRecorderId = dadum.qmap-chunk-power-reduction-recorder.qsr03e
powerAuthorityId = dadum.qmap-chunk-power-reduction-authority.qsr03e
implementationId = tdt-qmap-power-entropy-orientation-phase-chunk-local-webgpu-v1
shaderId = tdt.qmap.shader.chunk-local-power-reduction.qsr03.v1
shaderAbiId = tdt.qmap.shader-abi.chunk-local-power-reduction.qsr03.v1
partialSchemaId = tdt.qmap.power-partial-record.qsr03e.v1
compactSchemaId = tdt.qmap.compact-record.qsr03e.v1
compactTargetSchemaId = tdt.qmap.compact-target.qsr03e.v1
compactHandoffSchemaId = tdt.qmap.compact-chunk-handoff.qsr03e.v1
recordSchemaId = tdt.qmap.power-reduction-record.qsr03e.v1
```

Trusted inputs are the exact QSR03D handoff, same encoder, active QSR03B lease, private arena bindings, exact QSR03A range, immutable stage table, one operation-private compact target, and matching runtime/device epochs. Caller-created buffers, targets, profiles, layouts, or stale handoffs are rejected. QRC02 remains the product route.

## 2. Transactional parent handoff

Accepted parent facts:

```text
schemaId = tdt.qmap.frequency-handoff.qsr03d.v1
finalFrequencyRole = scratchB
frequencyLayoutId = tdt.qmap.frequency-layout.natural-row-major-complex-f32.v1
transform = 64 x 64
fftShiftApplied = false
```

Operation, plan, chunk, range, arena, slot, generation, encoder, runtime epoch, and device epoch must match exactly.

```text
CREATED -> POWER_REDUCTION_RECORDING -> CONSUMED_BY_LOCAL_POWER_REDUCTION
partial failure -> INVALID_REQUIRES_ENCODER_DISCARD
```

The handoff commits only after all three QSR03E dispatches are recorded. Partial recording emits no compact handoff.

## 3. Canonical frequency candidates

```text
linearIndex = ky * 64 + kx
signedFrequency(k) = k when k <= 32, otherwise k - 64
conjugateX = (64 - kx) mod 64
conjugateY = (64 - ky) mod 64
conjugateIndex = conjugateY * 64 + conjugateX
canonical representative = linearIndex <= conjugateIndex
DC index 0 = excluded
```

Self-conjugate bins are `(0,0)`, `(32,0)`, `(0,32)`, `(32,32)`. After excluding DC:

```text
non-self-conjugate bins = 4,092
pairs = 2,046
non-DC self candidates = 3
candidateCount = 2,049
```

Conjugate pairs are counted once and Nyquist self-conjugate bins remain admitted.

## 4. Window-energy normalization

QSR03C uses periodic Hann-64:

```text
hann64(n) = 0.5 - 0.5*cos(2pi*n/64)
sum hann64(n)^2 = 24
2D squared window energy = 24*24 = 576
```

QSR03D is the canonical unnormalized forward transform. Therefore:

```text
rawPower = real^2 + imaginary^2
normalizedPower = rawPower / 576
powerScale = 1/576
```

No `1/64`, `1/4096`, `1/4096^2`, unitary, measured-window, or caller-selected normalization is admitted.

## 5. Immutable parameter table

Existing QSR03B records are formalized without adding a buffer:

```text
record 11, offset 2816: power profile
  version 1, 64x64, candidateCount 2049, DC 0,
  energy1D 24, energy2D 576, scale 1/576, ln(2049)

record 12, offset 3072: first partial
  256 bins, 16 partials, 48 bytes, conjugate fold,
  DC exclusion, lower-index tie, natural logarithm

record 13, offset 3328: merge
  16 inputs, strides 8->4->2->1, failure OR,
  peak power descending then index ascending

record 14, offset 3584: finalizer
  56-byte compact ABI, axial period pi,
  explicit zero-energy and failed-record policies
```

Record 15 remains zero. No per-chunk parameter upload exists.

## 6. Local power and partials

```text
powerLocal bytes = chunkCapacity * 4096 * 4
capacity 448 = 7,340,032 bytes
power index = localWindow * 4096 + linearFrequencyIndex
active range = [0, localWindowCount * 4096)
```

The tail is not cleared, read, reduced, hashed, scattered, or published. DC power is written locally but excluded from semantic reduction.

First dispatch:

```text
dispatchWorkgroups(localWindowCount * 16, 1, 1)
workgroup size = 256
one block = 256 bins
16 blocks per window
```

Pair power:

```text
self-conjugate: p(i)
normal pair: p(i) + p(conjugate(i))
```

Accumulators are `sumPower`, `sumPowerLogPower = sum p*ln(p)`, candidate count, failure OR, and a deterministic peak. Higher pair power wins; exact f32 ties choose the lower representative index. No float atomic peak is admitted.

### Partial record, 48 bytes

```text
0  sumPower f32
4  sumPowerLogPower f32
8  peakPairPower f32
12 peakRepresentativeReal f32
16 peakRepresentativeImag f32
20 peakRepresentativeIndex u32
24 candidateCount u32
28 failureMask u32
32..47 reserved u32 = 0
```

`partialA` index is `localWindow*16 + blockIndex`. After merge only `partialB[localWindow*16]` is authoritative.

Merge dispatch:

```text
dispatchWorkgroups(localWindowCount, 1, 1)
workgroup size = 16
reduction order = 8 -> 4 -> 2 -> 1
```

Every stride has `workgroupBarrier()`. Counts sum, failures OR, and the same peak comparator carries the representative complex value. Final candidate count must equal 2,049.

## 7. Finalization

Let `P = total pair power`, `S = sum p*ln(p)`, and `M = 2049`.

```text
entropyNats = ln(P) - S/P
normalizedEntropy = entropyNats / ln(M)
```

The result is clamped to `[0,1]` only for bounded f32 drift. `P=0` produces an explicit valid zero-energy record with entropy and peak ratio zero.

Peak orientation uses the winning representative bin:

```text
fx = signedFrequency(kx)
fy = signedFrequency(ky)
if fy < 0 or (fy == 0 and fx < 0): negate both
orientation = atan2(fy, fx), range [0, pi)
radius = sqrt(fx^2 + fy^2)
```

Selected phase is `atan2(imaginary, real)` from the canonical representative bin, range `[-pi,pi)`. Positive pi canonicalizes to negative pi. Phase, cosine, and sine are stored. No conjugate averaging, global unwrapping, or CPU phase path exists.

## 8. Compact record ABI

Each record is exactly 56 bytes:

```text
0  globalWindowIndex u32
4  flags u32
8  totalPower f32
12 normalizedEntropy f32
16 peakPairPower f32
20 peakRatio f32
24 peakOrientationRadians f32
28 peakRadius f32
32 selectedPhaseRadians f32
36 selectedPhaseCos f32
40 selectedPhaseSin f32
44 failureMask u32
48 peakRepresentativeIndex u32
52 reservedZero u32
```

Flags:

```text
bit 0 RECORD_WRITTEN
bit 1 ZERO_ENERGY
bit 2 FAILURE_PRESENT
bit 3 PEAK_SELF_CONJUGATE
bit 4 ORIENTATION_DEFINED
bit 5 PHASE_DEFINED
```

Failed records preserve exact global index and failure mask, set `RECORD_WRITTEN|FAILURE_PRESENT`, set peak index to `0xffffffff`, and zero semantic fields.

## 9. Operation-private compact target

```text
resourceClass = QMAP_COMPACT_OPERATION_PRIVATE
recordBytes = 56
targetBytes = windowLayout.windowCount * 56
```

Reference sizes:

```text
1080p: 1,888 records = 105,728 bytes
4K: 7,854 records = 439,824 bytes
8K: 32,026 records = 1,793,456 bytes
```

The target is allocated once before chunk zero, outside the QSR03B transient arena and chunk loop. It binds operation, plan, window count, record size, target size, device identity, and epochs. Before QSR03F completion it is not publication-, Analysis-, Surface-, or warm-cache-eligible.

## 10. Exact global scatter

```text
globalWindowIndex = chunk.windowBase + localWindow
compactByteOffset = globalWindowIndex * 56
```

Bounds are checked against `windowLayout.windowCount` and target bytes. The compact target owns `expectedNextWindowBase`:

```text
AVAILABLE -> RECORDING -> AVAILABLE or FINAL_RECORDED
```

Replay, overlap, gap, foreign plan, or wrong base fails before dispatch. Global indexing is permitted only for compact scatter. `scratchB`, `powerLocal`, `partialA`, `partialB`, and `failureLocal` remain local-offset-only. The finalizer writes directly to the target; no local compact buffer or compact copy exists.

## 11. Failure propagation

Inherited bits `0..5` are QSR03C extraction failures and `6..10` are QSR03D Stockham/layout failures. QSR03E adds:

```text
11 nonfinite frequency input
12 nonfinite or negative normalized power
13 normalization mismatch
14 partial count or merge mismatch
15 compact scatter mismatch
16 entropy invalid
17 orientation invalid
18 selected phase invalid
19 compact ABI mismatch
20..31 reserved
```

QSR03E does not clear `failureLocal`. Every merge uses bitwise OR. Later finite values cannot erase earlier failures.

## 12. Pipeline and command topology

WGSL:

```text
app/legacy-runtime/core/compute/qmap_webgpu/shaders/chunk_local_power_reduction_qsr03.wgsl
```

Entry points:

```text
power_and_first_partial
merge_sixteen_partials
finalize_and_scatter_compact
```

Exactly three pipelines and three bind groups are created outside the chunk loop.

QSR03E adds one compute pass and three dispatches:

```text
1. power_and_first_partial: X = localWindowCount * 16
2. merge_sixteen_partials: X = localWindowCount
3. finalize_and_scatter_compact: X = localWindowCount
```

```text
queue submissions = 0
copies = 0
readbacks = 0
per-chunk buffers/textures/pipelines/bind groups = 0
```

The encoder identity remains the same as QSR03C and QSR03D.

## 13. Compact handoff

The metadata-only one-shot handoff binds operation, plan, chunk range, global end, arena, slot, generation, encoder, QSR03D record, QSR03E record, compact-target identity, compact ABI, epochs, and final-chunk flag. Raw buffers remain private. Only QSR03F may consume it.

## 14. Forbidden paths

QSR03E forbids:

- `windowCount*4096*4` full power allocations;
- global power atlases and compatibility mirrors;
- CPU, WASM, or WebGL power/reduction;
- frequency or power readback and mapping;
- host compact construction or scatter;
- per-chunk compact-target allocation;
- local compact mirrors and copies;
- intermediate submission;
- partial target publication;
- partial-pass resume;
- cross-device-epoch target reuse.

## 15. Stable errors

```text
E_QMAP03_POWER_HANDOFF_INVALID
E_QMAP03_POWER_NORMALIZATION_MISMATCH
E_QMAP03_POWER_REDUCTION_FAILED
E_QMAP03_PARTIAL_REDUCTION_MISMATCH
E_QMAP03_ENTROPY_FINALIZATION_FAILED
E_QMAP03_ORIENTATION_FINALIZATION_FAILED
E_QMAP03_PHASE_FINALIZATION_FAILED
E_QMAP03_COMPACT_TARGET_INVALID
E_QMAP03_COMPACT_SCATTER_MISMATCH
E_QMAP03_COMPACT_RECORD_ABI_MISMATCH
E_QMAP03_FULL_POWER_ATLAS_FORBIDDEN
E_QMAP03_CPU_REDUCTION_FORBIDDEN
E_QMAP03_ADDITIONAL_SUBMISSION_FORBIDDEN
E_QMAP03_TRANSIENT_ALLOCATION_IN_LOOP
E_QMAP03_READBACK_FORBIDDEN
E_QMAP03_CANCELLED
E_QMAP03_DEVICE_LOST
```

## 16. Implementation surfaces

New TypeScript:

```text
qmap-streaming-reduction-03-power-types.ts
qmap-streaming-reduction-03-power-validation.ts
qmap-streaming-reduction-03-power.ts
qmap-streaming-reduction-03-power-record.ts
qmap-streaming-reduction-03-power-private-bindings.ts
qmap-streaming-reduction-03-compact-target.ts
qmap-streaming-reduction-03-compact-handoff.ts
```

New legacy runtime and WGSL:

```text
qmap_streaming_reduction_03_power_contract.mjs
qmap_streaming_reduction_03_power.mjs
qmap_streaming_reduction_03_compact_target.mjs
qmap_streaming_reduction_03_compact_handoff.mjs
shaders/chunk_local_power_reduction_qsr03.wgsl
```

Modified parent surfaces are QSR03D frequency handoff/private payload, QSR03B stage-table records 11..14, stable errors, service tokens, and package scripts. No generated runtime or publication manifest is modified.

## 17. Gates

QSR03E requires exactly 176 Source Gates:

```text
S001-S016 identity and parent admission
S017-S032 transactional same-encoder handoff
S033-S056 normalization, local power, 2,049 candidates
S057-S080 first partial and 48-byte ABI
S081-S100 deterministic merge
S101-S132 entropy, orientation, phase, 56-byte ABI
S133-S152 private target and exact scatter
S153-S176 three-dispatch and forbidden-path closure
```

Exactly 64 negative controls cover handoff replay, wrong normalization, global offsets, full power, conjugate/Nyquist faults, partial ABI and merge faults, entropy/orientation/phase faults, compact ABI/range/copy faults, per-chunk creation, submission, readback, compatibility fallback, and device-loss retention.

Physical qualification requires 64 packaged Windows x64 Electron gates for shader/pipeline admission, exact command topology, power/partial numeric parity, compact byte parity, scatter continuity, cancellation, residency plateau, and device loss. Physical gates remain pending at source bake.

## 18. Package scripts

```json
{
  "scripts": {
    "verify:qmap-streaming-03e:power": "node tools/qmap-streaming-reduction-03e/verify-power-normalization.mjs",
    "verify:qmap-streaming-03e:partials": "node tools/qmap-streaming-reduction-03e/verify-partial-reduction.mjs",
    "verify:qmap-streaming-03e:scatter": "node tools/qmap-streaming-reduction-03e/verify-global-scatter.mjs",
    "verify:qmap-streaming-03e:topology": "node tools/qmap-streaming-reduction-03e/verify-command-topology.mjs",
    "verify:qmap-streaming-03e:source": "node tools/qmap-streaming-reduction-03e/verify-source-gates-176.mjs",
    "verify:qmap-streaming-03e:mutants": "node tools/qmap-streaming-reduction-03e/run-mutants.mjs",
    "gate:qmap-streaming-03e": "node tools/qmap-streaming-reduction-03e/gate-source.mjs"
  }
}
```

## 19. Repository and package policy

The GitHub commit contains this specification file only. Implementation is delivered as a separate code ZIP. The ZIP excludes this specification, generated reports, physical evidence, bake artifacts, generated manifests, patch files, logs, nested ZIPs, temporary typecheck files, fixture output, and Git metadata.

## 20. Completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03E_CHUNK_LOCAL_NORMALIZED_POWER_DETERMINISTIC_PARTIAL_REDUCTION_GLOBAL_COMPACT_SCATTER_NO_FULL_POWER_ATLAS_NO_CPU_REDUCTION_NO_ADDITIONAL_SUBMISSION_AWAITING_FINAL_CHUNK_QMAP_PROJECTION_03F
```

Required facts:

- 176/176 Source Gates PASS;
- 64/64 negative controls detected;
- exact QSR03D handoff consumed transactionally in the same encoder;
- power scale exactly `1/576`;
- 2,049 canonical non-DC conjugate-folded candidates;
- sixteen 48-byte PartialA records per window;
- deterministic `8->4->2->1` merge;
- natural-log entropy, lower-index peak tie, axial `[0,pi)` orientation;
- selected phase from the representative bin;
- exact 56-byte compact ABI;
- failure masks preserved and failed semantic values zeroed;
- exact gap-free `windowBase+localWindow` scatter;
- 4K compact target = 439,824 bytes;
- one compute pass, three dispatches, zero added submissions/copies/readbacks/chunk allocations;
- no full power atlas or CPU/WASM/WebGL reduction;
- compact target private and unpublished;
- QRC02 route unchanged;
- physical gates pending.

Prohibited claims:

```text
QMAP_PROJECTION_PASS
QMAP_COMPACT_FIELD_PUBLICATION_PASS
QMAP_STREAMING_RUNTIME_PASS
QMAP_4K_PRODUCT_PASS
QMAP_8K_PRODUCT_PASS
PHYSICAL_QMAP_STREAMING_REDUCTION_03_PASS
```

## 21. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03F

Global Compact Field Completion /
Final-Chunk QMap Projection /
Same-Encoder Final-Chunk Graph /
Exact Compact-Record Consumption /
Final EWA Coordinate QMap Rasterization /
One Covering Submission per Chunk /
Multi-Submission Streaming Receipt /
Fence-Covered Cursor Advancement /
No Partial QMap Publication Seal
```

## 22. Final seal

```text
QSR03E keeps frequency power local, reduction deterministic, failure lineage
unbroken, and the only global write compact.

It writes normalized power into powerLocal, reduces sixteen fixed partials,
finalizes entropy, axial peak orientation, and representative-bin phase,
then scatters exactly one 56-byte record to the operation-private target.

There is no full power atlas, CPU reduction, local compact mirror, compact
copy, or intermediate submission. Only QSR03F may consume the compact
handoff and attach final QMap projection to the last chunk graph.
```
