# TDT-QMAP-STREAMING-REDUCTION-03B

## Single Streaming Slot Arena / Capacity-Sized Complex Scratch Quartet / Chunk-Local Power and Partial Buffers / Immutable Parameter Storage / Fence-Bound Slot Generation / No Allocation Inside Chunk Loop / Cancellation-Safe Disposal / Device-Epoch Arena Invalidation / Transient Resource Non-Publication Seal

## 0. Document identity

```text
Patch ID
= TDT-QMAP-STREAMING-REDUCTION-03B

Short ID
= QSR03B

Parent patch
= TDT-QMAP-STREAMING-REDUCTION-03A

Umbrella patch
= TDT-QMAP-STREAMING-REDUCTION-03

Required parent state
= SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03A_FINAL_EWA_GEOMETRY_AUTHORITY_DETERMINISTIC_4K_8K_PLAN_ADMITTED_AWAITING_SINGLE_SLOT_ARENA_03B

Specification state
= SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03B converts the deterministic QSR03A plan into one physically allocated, privately owned, reusable GPU streaming slot. It owns the exact resource ledger, allocation rollback, private binding capability, lease state, completion-ticket lineage, fence-bound generation advancement, cancellation-safe disposal, device-epoch invalidation, and transient non-publication guards.

QSR03B does not execute Final EWA extraction, Stockham FFT, power normalization, reduction, global compact scatter, QMap projection, queue submission creation, product publication, or EFC convergence.

## 1. Authority decision

```text
arenaServiceId
= dadum.runtime.qmap-streaming-slot-arena

arenaAuthorityId
= dadum.qmap-streaming-arena-authority.qsr03b

arenaSchemaId
= tdt.qmap.streaming-slot-arena.qsr03b.v1

slotSchemaId
= tdt.qmap.streaming-slot.qsr03b.v1

leaseSchemaId
= tdt.qmap.streaming-slot-lease.qsr03b.v1

resourceProfileId
= tdt.qmap.streaming-slot-resource-profile.qsr03b.v1

resourceClass
= QMAP_STREAMING_TRANSIENT_PRIVATE
```

The arena is constructed only by runtime-owned code from an exact QSR03A plan, canonical GPU device capability, runtime and device epoch identity, authority-issued completion tickets, cancellation capability, and device-loss capability.

The arena rejects caller-created buffers, caller-selected sizes or usage flags, caller-selected slot count, renderer-owned GPUDevice or GPUQueue handles, arbitrary promises presented as fences, stale plans, and stale device epochs.

One arena owns one slot. Global serialization of all cold QMap jobs remains a later coordinator responsibility, so product promotion remains forbidden after 03B alone.

## 2. Parent-plan admission

Before allocation, QSR03B verifies:

```text
plan.schemaId
= tdt.qmap.streaming-plan.qsr03.v1

plan.patchId
= TDT-QMAP-STREAMING-REDUCTION-03A

plan.planId
= tdt.qmap.streaming-plan.qsr03.v1

plan.implementationId
= tdt-qmap-window-chunk-stockham-reduction-webgpu-v1
```

It also verifies the complete plan digest, byte-model digest, window profile, budget profile, device identity, runtime epoch, device epoch, ring-slot count one, fixed slot bytes 8,192, selected chunk capacity, exact chunk ranges, and peak transient bytes.

QSR03B must use the QSR03A `chunkCapacity` without reinterpretation. It may not decrement capacity on allocation failure, increase budget, remove a scratch buffer, fuse power storage, reduce partial storage, create two smaller slots, spill to host memory, or fall back to QRC02 contiguous storage.

## 3. Canonical resource topology

One arena allocates exactly ten GPUBuffer objects and zero GPUTexture objects:

```text
1. scratchA
2. scratchB
3. transposeA
4. transposeB
5. powerLocal
6. partialA
7. partialB
8. failureLocal
9. stageParameterTable
10. chunkControl
```

The first four are the capacity-sized complex scratch quartet. The fixed 8 KiB region admitted by QSR03A is divided into:

```text
stageParameterTable = 4,096 bytes
chunkControl        = 4,096 bytes
```

This split preserves the QSR03A byte model while separating immutable stage constants from mutable, fence-bound chunk records. No hidden staging, readback, bridge-copy, global-frequency, or per-chunk parameter buffer is admitted.

## 4. Exact byte ledger

For capacity `C`:

```text
complexBufferBytes(C) = C × 32,768
powerBufferBytes(C)   = C × 16,384
partialBufferBytes(C) = C × 768
failureBufferBytes(C) = C × 4
fixedParameterBytes   = 8,192

arenaTransientBytes(C)
= 4 × complexBufferBytes(C)
  + powerBufferBytes(C)
  + 2 × partialBufferBytes(C)
  + failureBufferBytes(C)
  + fixedParameterBytes
= C × 148,996 + 8,192
```

Reference capacity 448:

| Resource | Bytes |
|---|---:|
| scratchA | 14,680,064 |
| scratchB | 14,680,064 |
| transposeA | 14,680,064 |
| transposeB | 14,680,064 |
| powerLocal | 7,340,032 |
| partialA | 344,064 |
| partialB | 344,064 |
| failureLocal | 1,792 |
| stageParameterTable | 4,096 |
| chunkControl | 4,096 |
| **Total** | **66,758,400** |

```text
budget ceiling       = 67,108,864
unallocated headroom = 350,464
```

The headroom is safety margin, not caller-owned capacity. Every descriptor uses the exact admitted size. Any additional physical padding requires a reviewed byte-model revision.

## 5. GPUBuffer descriptor contract

The complex quartet, power, and partial buffers use:

```text
usage = GPUBufferUsage.STORAGE
mappedAtCreation = false
```

The failure buffer, stage table, and chunk-control buffer use:

```text
usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
mappedAtCreation = false
```

Product arena resources do not add `MAP_READ`, `MAP_WRITE`, `COPY_SRC`, `INDIRECT`, `VERTEX`, or `INDEX`. No arena buffer is mapped. `queue.writeBuffer` is admitted only for small parameter and control records, never for pixel or spectral payload transport.

## 6. Immutable parameter storage

The 4,096-byte stage table contains sixteen 256-byte records reserved for ABI identity, window geometry, six row Stockham stages, forward transpose, column stages, transpose-back, power normalization, first partial, partial merge, finalizer, and one zero-reserved record.

It is generated deterministically, uploaded once during allocation, and sealed immutable before arena availability.

The 4,096-byte chunk-control buffer also contains sixteen 256-byte records. QSR03B admits record zero only. It binds:

```text
schemaVersion
chunkIndex
windowBase
localWindowCount
globalGridWidth
globalGridHeight
analysisWidth
analysisHeight
slotGeneration
deviceEpoch
flags
reserved zero words
```

Chunk control may be written only for the active exact QSR03A range and current generation while no previous completion ticket is pending. Records 1 through 15 remain zero.

## 7. Allocation transaction

Allocation order is deterministic:

```text
validate plan
validate authority context
open WebGPU validation scope
allocate scratchA
allocate scratchB
allocate transposeA
allocate transposeB
allocate powerLocal
allocate partialA
allocate partialB
allocate failureLocal
allocate stageParameterTable
allocate chunkControl
upload immutable stage table
seal parameter content
close validation scope
seal arena AVAILABLE
```

Successful construction reports ten buffer creations and zero texture creations.

If any allocation, upload, validation, or cancellation check fails, all prior buffers are destroyed in reverse order. A partially created arena, lease, or private binding capability cannot escape. Cancellation is checked before allocation, between allocations, before and after parameter upload, and before arena seal.

A WebGPU validation failure maps to `E_QMAP03_STREAMING_SLOT_UNAVAILABLE`. Mock construction does not constitute physical GPU pass.

## 8. Arena, slot, and generation states

Arena state:

```text
UNINITIALIZED → ALLOCATING → AVAILABLE → RETIRING → DESTROYED
ALLOCATING → ALLOCATION_FAILED → DESTROYED
AVAILABLE → DEVICE_INVALIDATED → DESTROYED
AVAILABLE → RETIRING_AFTER_FENCE → DESTROYED
```

Slot state:

```text
AVAILABLE → LEASED → RECORDING → SUBMITTED → FENCE_PENDING → AVAILABLE
LEASED or RECORDING → CANCELLED_BEFORE_SUBMIT → DESTROYED
SUBMITTED or FENCE_PENDING → RETIRING_AFTER_FENCE → DESTROYED
any live state → DEVICE_INVALIDATED → DESTROYED
```

Initial generation is zero. Generation advances only after the authority-issued completion ticket resolves successfully. It does not advance on lease acquisition, recording, submission reservation, `queue.submit` return, cancellation request, or unsubmitted lease release. Overflow fails closed and never wraps.

## 9. Lease and private binding contract

A lease request binds operation ID, plan digest, exact chunk index and range, expected generation, runtime epoch, and device epoch.

Admission requires:

```text
arena state = AVAILABLE
slot state = AVAILABLE
no active lease
exact QSR03A chunk range
expected generation = current generation
matching plan, runtime epoch, and device epoch
no cancellation
no device loss
```

Only one live lease is allowed. A second lease fails with `E_QMAP03_STREAMING_SLOT_UNAVAILABLE`.

Raw GPUBuffer handles remain in a private WeakMap or equivalent closure-owned table. Public leases expose no GPUBuffer, GPUDevice, GPUQueue, mutable descriptor, or destroy function. The internal binding capability is branded to the exact arena, slot, lease, generation, plan digest, and device epoch.

An unsubmitted lease may be released from `LEASED` or `RECORDING`; this revokes bindings and returns the slot to `AVAILABLE` without advancing generation or requiring a fence.

## 10. Completion-ticket authority and fence-bound reuse

An accepted completion ticket binds:

```text
operationId
deviceEpoch
submissionSequence
encoderIdentityDigest
slotId
slotGeneration
ticketDigest
```

It must be issued by the canonical completion authority. Raw promises, timers, renderer callbacks, foreign queue promises, another operation's ticket, another epoch's ticket, or another generation's ticket are rejected.

Ticket attachment occurs once. After attachment, the slot is `FENCE_PENDING` and cannot accept a lease, receive chunk-control writes, clear active storage, change parameters, transfer ownership, or be destroyed.

On successful completion:

```text
if retirement not requested:
  generation += 1
  clear lease and ticket
  state = AVAILABLE
else:
  destroy resources
  state = DESTROYED
```

Ticket rejection retires the arena. It never returns the failed generation to `AVAILABLE`.

## 11. No allocation inside the chunk loop

After arena seal:

```text
post-seal createBuffer count = 0
post-seal createTexture count = 0
```

Lease acquisition, control write, submission attachment, fence completion, generation advance, cancellation, and disposal may not allocate GPU resources.

The chunk executor receives private bindings and command authority, not an allocation-capable GPUDevice through the QSR03 arena API. Source gates reject `.createBuffer(` and `.createTexture(` outside the arena allocation module and explicit qualification fixtures.

Forbidden hidden allocations include FFT scratch, copy-only bridge buffers, per-chunk power or partial buffers, per-chunk uniform buffers, failure buffers, staging or readback buffers, host spill buffers, and global frequency targets.

A post-seal allocation attempt maps to `E_QMAP03_TRANSIENT_ALLOCATION_IN_LOOP`.

## 12. Cancellation-safe disposal

`dispose(reason)` is idempotent and returns one terminal disposal promise.

Before submission, disposal revokes the active lease and destroys all buffers immediately in reverse order. After submission, disposal marks `RETIRING_AFTER_FENCE`, waits for the authoritative ticket, then destroys resources. Submitted cancellation never returns the slot to `AVAILABLE`.

The terminal snapshot records cancellation reason and epoch, state at cancellation, active chunk, active generation, submission sequence and ticket digest when present, and destruction state.

No partially used transient resource becomes publication-eligible.

## 13. Device-epoch invalidation

The arena permanently binds `deviceIdentityDigest`, `deviceEpoch`, and `runtimeEpoch`. Any mismatch maps to `E_QMAP03_DEVICE_LOST`.

On `device.lost`, QSR03B revokes private capabilities, rejects new leases and control writes, invalidates the active lease, supersedes unresolved ticket waiting, clears publication eligibility, performs best-effort destruction, clears private references, and enters `DESTROYED`.

The arena is never rebound to a replacement device. Recovery requires a fresh device capability, fresh device-limit snapshot, fresh QSR03A plan, fresh QSR03B arena, and generation zero. Old-epoch leases, tickets, writers, and snapshots remain invalid permanently.

## 14. Transient resource non-publication

Every arena resource carries:

```text
resourceClass        = QMAP_STREAMING_TRANSIENT_PRIVATE
publicationAdmission = FORBIDDEN
surfaceAdmission     = FORBIDDEN
warmCacheAdmission   = FORBIDDEN
structuredCloneAdmission = FORBIDDEN
```

Transient resources may not enter Analysis Field Authority, Surface Registry, retained surface cache, warm QMap cache, Preview or Export registries, renderer bridge payloads, project serialization, or persistent diagnostic stores.

Canonical Analysis and Surface boundaries reject transient resource handles and return `E_QMAP03_DANGLING_PUBLICATION_FORBIDDEN`.

Diagnostics may expose immutable metadata only: label, size, usage, slot ID, generation, descriptor digest, resource class, and destroyed state. They may not expose GPUBuffer handles or closures capturing them.

## 15. Stable error contract

QSR03B uses the umbrella QSR03 stable-error namespace:

```text
E_QMAP03_REQUEST_INVALID
E_QMAP03_STREAMING_SLOT_UNAVAILABLE
E_QMAP03_SLOT_REUSE_BEFORE_FENCE
E_QMAP03_TRANSIENT_ALLOCATION_IN_LOOP
E_QMAP03_DANGLING_PUBLICATION_FORBIDDEN
E_QMAP03_CANCELLED
E_QMAP03_DEVICE_LOST
```

No error path returns a neutral arena, empty buffer set, host-backed resource, previous-generation slot, or QRC02 contiguous fallback.

## 16. Required implementation surfaces

New source files:

```text
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-arena-types.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-arena-validation.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-arena-receipt.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-private-bindings.ts
app/src/runtime/analysis/spectral/qmap-streaming-reduction-03-arena.ts
app/legacy-runtime/core/compute/qmap_webgpu/qmap_streaming_reduction_03_arena.mjs
```

Modified canonical files:

```text
app/src/boot/stable-error.ts
app/src/runtime/service-token.ts
app/src/runtime/analysis/analysis-field-authority-service.ts
app/src/runtime/surfaces/surface-registry-authority-service.ts
package.json
```

Validation tools:

```text
tools/qmap-streaming-reduction-03b/fixture.mjs
tools/qmap-streaming-reduction-03b/verify-source-gates-128.mjs
tools/qmap-streaming-reduction-03b/run-mutants.mjs
tools/qmap-streaming-reduction-03b/gate-source.mjs
```

No generated runtime manifest is modified by QSR03B. QRC02 product routing remains unchanged.

## 17. Source Gates

QSR03B requires exactly 128 Source Gates:

```text
S001-S016  identity and exact parent-plan admission
S017-S040  ten-buffer topology, exact bytes, usage, and no hidden resources
S041-S052  immutable parameter table and fence-bound control ABI
S053-S068  deterministic allocation, validation scope, rollback, and seal
S069-S088  one lease, private bindings, exact ticket, and generation rules
S089-S108  no-loop-allocation and transient non-publication
S109-S128  cancellation, device loss, idempotent disposal, and cleanup balance
```

Required source facts include:

- QSR03A plan and byte model reverified;
- ten buffers, zero textures;
- capacity 448 and 66,758,400 bytes exact;
- stage table uploaded once and then immutable;
- exact range, generation, runtime epoch, and device epoch lease checks;
- generation advances only after ticket success;
- zero post-seal allocations;
- Analysis and Surface publication guards reject transient resources;
- cancellation and device-loss cleanup leaves no live private reference;
- source state makes no physical claim.

Source completion requires 128 of 128 gates PASS.

## 18. Negative-control mutants

Exactly 40 mutants must be detected:

```text
M001 two ring slots
M002 wrong scratchA capacity
M003 omit scratchB
M004 omit transposeA
M005 omit transposeB
M006 omit powerLocal
M007 collapse partial ping-pong
M008 omit failureLocal
M009 hidden staging buffer
M010 hidden readback buffer
M011 exceed fixed 8 KiB
M012 mutate stage table after seal
M013 write control during fence wait
M014 control buffer per chunk
M015 add MAP_READ
M016 add COPY_SRC product readback
M017 allocate before plan verification
M018 skip rollback
M019 publish partial arena
M020 remove validation scope
M021 permit two leases
M022 ignore expected generation
M023 advance generation on acquisition
M024 advance generation on submit return
M025 reuse before ticket completion
M026 accept arbitrary promise as ticket
M027 accept foreign device epoch
M028 accept foreign generation
M029 allocate FFT scratch in lease
M030 allocate power storage in lease
M031 destroy before fence
M032 return submitted cancellation to available
M033 wait forever after device loss
M034 rebind to replacement device
M035 expose raw GPUBuffer
M036 publish scratch through Analysis authority
M037 register power through Surface Registry
M038 insert transient resource into warm cache
M039 non-idempotent disposal
M040 retain private reference after destruction
```

Patch-ID string checks alone do not count as detection.

## 19. Physical Gates

Physical completion requires 40 gates on packaged Windows x64 Electron:

```text
P001-P012 physical adapter/device limits, ten buffers, zero textures,
          exact sizes, budget, validation scope, parameter upload, no mapping
P013-P024 one lease, fence unavailability, generation advance,
          128 sequential generations, constant descriptors and allocations
P025-P034 cancellation before/during/after submit, device-loss invalidation,
          unresolved-ticket closure, fresh-arena recovery, old-epoch rejection
P035-P040 128 create/destroy cycles, resource and JS-reference plateau,
          unchanged Analysis/Surface counts, sealed physical arena receipt
```

All physical gates remain pending at source bake.

## 20. Package scripts

```json
{
  "scripts": {
    "verify:qmap-streaming-03b:source": "node tools/qmap-streaming-reduction-03b/verify-source-gates-128.mjs",
    "verify:qmap-streaming-03b:mutants": "node tools/qmap-streaming-reduction-03b/run-mutants.mjs",
    "gate:qmap-streaming-03b": "node tools/qmap-streaming-reduction-03b/gate-source.mjs"
  }
}
```

## 21. Source-bake and package policy

Source bake executes the resource ledger, allocation rollback, parameter ABI, lease state, completion ticket, generation, no-loop-allocation, cancellation, device loss, non-publication, idempotent disposal, 40-mutant, and 128-gate fixtures.

The GitHub commit contains this specification file only.

The separately delivered code ZIP contains application source, arena implementation, stable-error and publication-guard integration, validation tools, and package scripts. It excludes this specification, generated evidence, reports, receipts, patch files, logs, newly generated manifests, nested ZIP files, temporary typecheck configs, and Git metadata.

## 22. Explicit non-goals

QSR03B does not perform Final EWA binding or extraction, periodic-Hann weighting, weighted DC removal, Stockham execution, transpose, power computation, partial reduction, compact finalization, global scatter, QMap projection, command encoder or queue submission creation, execution receipts, global cold-job admission, warm reuse, Analysis publication, EFC handoff, Preview, Export, semantic correction, publication atomicity, or physical 4K/8K performance claims.

A source-baked arena proves resource ownership and lifecycle structure. It does not prove QMap streaming execution.

## 23. Completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03B_SINGLE_FENCE_BOUND_TRANSIENT_SLOT_NO_LOOP_ALLOCATION_AWAITING_FINAL_EWA_CHUNK_EXTRACTION_03C
```

Required facts:

- 128 of 128 Source Gates PASS;
- 40 of 40 mutants detected;
- exact QSR03A plan and byte model reverified;
- one arena contains one slot;
- exactly ten GPUBuffer descriptors and zero GPUTexture descriptors;
- capacity 448 allocates exactly 66,758,400 bytes;
- fixed parameter storage remains 8,192 bytes;
- stage table is uploaded once and sealed immutable;
- control writes are lease and fence bound;
- generation advances only after authority completion;
- no post-seal allocation path exists;
- cancellation and disposal are safe and idempotent;
- device loss permanently invalidates the arena;
- transient resources cannot publish through Analysis or Surface authority;
- QRC02 product routing remains unchanged;
- physical gates remain pending.

Prohibited claims:

```text
QMAP_STREAMING_EXECUTION_PASS
QMAP_WINDOW_EXTRACTION_PASS
QMAP_STOCKHAM_PASS
QMAP_REDUCTION_PASS
QMAP_PUBLICATION_PASS
QMAP_4K_PRODUCT_PASS
QMAP_8K_PRODUCT_PASS
PHYSICAL_QMAP_STREAMING_REDUCTION_03_PASS
```

## 24. Next patch boundary

```text
TDT-QMAP-STREAMING-REDUCTION-03C

Final EWA Cursor-Bound Streaming Capability /
Chunk-Local Periodic-Hann Window Extraction /
Exact Global Window-to-Grid Mapping /
Weighted DC and Premultiplied Luma Preservation /
Local ScratchA Offset-Zero Write /
Chunk-Control Record Binding /
Monotonic Chunk Order /
No Full Spatial-Complex Atlas /
No Edge Padding /
No CPU Pixel Path Seal
```

QSR03C consumes the arena plan digest, slot ID, slot generation, private `scratchA` binding, immutable stage table, chunk-control binding, exact QSR03A range, runtime epoch, and device epoch without reinterpretation. It may write into `scratchA`, but may not allocate replacement spatial storage, expose raw arena handles, or advance generation.

## 25. Final seal

```text
A reusable GPU slot is not reusable because CPU recording ended.
It is reusable only when queue authority proves that prior submitted work
no longer references its buffers.

QSR03B gives QMap streaming one private transient body:
four complex scratch buffers, one local power field, two partial fields,
one failure field, and one fixed parameter region.

That body is allocated once, privately leased, fenced, generation-bound,
cancelled safely, invalidated with its device epoch, and never published.

No chunk may grow a second body in the shadows.
No caller may borrow the slot before the fence.
No registry may mistake transient organs for product fields.

Only after this ownership loop is closed may QSR03C bind Final EWA windows
to scratchA.
```
