# TDT-QMAP-STREAMING-REDUCTION-03G-R6

## Packaged One-Restart Device-Loss Physical Closure / Main One-Shot Loss Permit / Middle-Chunk Device Loss / Old-Epoch Resource Invalidation / Replacement Adapter and Device Acquisition / Final EWA Rebuild / Chunk-Zero Restart / Live Waiter Preservation / Second-Loss Terminal Failure / No Product Promotion Yet Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R6
Short ID = QSR03G-R6
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R5
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

Required parent source state:

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R5_WAITER_AND_SHARED_JOB_CANCELLATION_SEPARATED_MONOTONIC_CANCELLATION_EPOCH_PRE_SUBMIT_ABORT_FENCE_DRAIN_TERMINALIZATION_ATOMIC_ANALYSIS_PUBLICATION_SINGLE_INVOCATION_TERMINALIZER_FRESH_CHUNK_ZERO_REPLAY_NO_PARTIAL_PUBLICATION_ZERO_PRIVATE_RESOURCE_LEAK_AUTHORITY_NO_PRODUCT_PROMOTION_AWAITING_PACKAGED_CANCELLATION_PHYSICAL_EXECUTION
```

R6 physically validates one automatic restart after a real packaged 4K device loss. It must invalidate the entire old device epoch, reacquire an adapter and device, rebuild all device-local roots, rebuild Final EWA, restart the same logical job from chunk zero, preserve live waiters, publish once, and terminate without a second restart when the replacement device is lost again.

R6 may consume R2 named-evidence authority and R3-R5 qualification authorities. It may not issue a trial permit, physical admission, product promotion permit, or global QSR03 product route.

## 1. Mandatory parent corrections

The parent live-device `recover()` hard failure is replaced by a root-owned recovery transaction. Recovery reacquires both adapter and device and produces a new acquisition ID, device epoch, device identity, queue identity, validation observer, pipeline epoch and readback epoch.

The root owns one `device.lost` observer per device epoch. A loss observation is the terminal authority for the old epoch. Device loss is not R5 cancellation: a valid-device cancellation drains a fence, while device loss invalidates the queue and all device-local resources. The lost submission must never be represented as a completed fence.

Final EWA semantic and physical identities are separated:

```text
semantic identity = source surface + source revision + geometry + lowpass plan
physical identity = semantic identity + device epoch + device identity + texture resource + producer receipt
```

Recovery retains the semantic request and logical key, but replaces the physical Final EWA texture/view, actual identity, lowpass receipt, producer receipt, replay receipt and device execution key.

A second device loss must terminalize and invalidate the replacement invocation before restart-budget exhaustion is exposed. No cleanup path may be skipped by an early budget check.

Recovered deliveries bind both the requested old-epoch execution key and the delivered replacement-epoch execution key. Warm metadata is admitted only under the delivered replacement key.

## 2. State ownership and SSOT

### Root device authority

Owns the current adapter acquisition, GPUDevice, GPUQueue, device epoch and identity, pipeline/readback epochs, device-loss observer, recovery mutex and root recovery state.

### Shared job authority

Owns the logical job ID, job generation, live waiter set, shared execution promise, recovery count, current invocation attempt, delivered device execution key and terminal state. The first recovery does not create a new job generation or shared promise.

### Invocation authority

An invocation belongs to exactly one device epoch. It never migrates its GPU resources. Recovery creates a new invocation.

### Loss observation authority

Owns loss sequence, device epoch and identity, loss reason/message digest, active job/attempt/chunk/submission, last completed fence, last committed chunk and permit lineage.

### Epoch invalidation authority

Owns the terminal transition of every old-device resource and prevents any old compact, cursor, field or warm state from becoming reusable progress.

### Recovery authority

Owns restart budget, recovery ordinal, replacement acquisition, root rebuild, Final EWA rebuild, chunk-zero restart and recovery receipt.

### Waiter authority

Waiters remain attached to the shared job during the first recovery. They never attach directly to an invocation attempt.

## 3. Authorities and schemas

```text
deviceLossAuthorityId = dadum.qmap.device-loss-observation-authority.qsr03g-r6
lossPermitAuthorityId = dadum.qmap.device-loss-fault-permit-authority.qsr03g-r6
epochInvalidationAuthorityId = dadum.qmap.device-epoch-invalidation-authority.qsr03g-r6
replacementDeviceAuthorityId = dadum.qmap.replacement-device-authority.qsr03g-r6
rootRebuildAuthorityId = dadum.qmap.device-root-rebuild-authority.qsr03g-r6
finalEwaRebuildAuthorityId = dadum.final-ewa.device-rebuild-authority.qsr03g-r6
deviceRecoveryAuthorityId = dadum.qmap.one-restart-recovery-authority.qsr03g-r6
waiterPreservationAuthorityId = dadum.qmap.recovery-waiter-preservation-authority.qsr03g-r6
secondLossTerminalAuthorityId = dadum.qmap.second-loss-terminal-authority.qsr03g-r6
r6EvidenceAuthorityId = dadum.qmap.packaged-device-loss-evidence-authority.qsr03g-r6
```

```text
tdt.qmap.device-loss-fault-permit.qsr03g-r6.v1
tdt.qmap.device-loss-observation.qsr03g-r6.v1
tdt.qmap.device-epoch-invalidation.qsr03g-r6.v1
tdt.qmap.replacement-adapter-device.qsr03g-r6.v1
tdt.qmap.device-root-rebuild.qsr03g-r6.v1
tdt.final-ewa.device-rebuild.qsr03g-r6.v1
tdt.qmap.device-recovery-receipt.qsr03g-r6.v1
tdt.qmap.recovery-waiter-set.qsr03g-r6.v1
tdt.qmap.second-device-loss-terminal.qsr03g-r6.v1
tdt.qmap.packaged-device-loss-physical.qsr03g-r6.v1
tdt.qmap.packaged-device-loss-merkle.qsr03g-r6.v1
```

## 4. Root and job state machines

Root initial state:

```text
UNINITIALIZED → ACQUIRING_ADAPTER → ACQUIRING_DEVICE → BUILDING_ROOT_RESOURCES → ACTIVE
```

First-loss recovery:

```text
ACTIVE
→ LOSS_OBSERVED
→ INVALIDATING_OLD_EPOCH
→ OLD_EPOCH_INVALIDATED
→ RECOVERY_LOCKED
→ ACQUIRING_REPLACEMENT_ADAPTER
→ ACQUIRING_REPLACEMENT_DEVICE
→ REBUILDING_ROOT_RESOURCES
→ REPLACEMENT_ACTIVE
```

Second-loss terminal branch:

```text
REPLACEMENT_ACTIVE
→ SECOND_LOSS_OBSERVED
→ INVALIDATING_REPLACEMENT_EPOCH
→ RECOVERY_BUDGET_EXHAUSTED
→ ROOT_TERMINAL_FOR_RUN
```

Shared job first-loss path:

```text
RUNNING_ATTEMPT_0
→ DEVICE_LOSS_PENDING
→ OLD_ATTEMPT_INVALIDATING
→ RECOVERY_PREPARING
→ RUNNING_ATTEMPT_1
→ PUBLICATION_COMMITTED
→ COMPLETED
```

Second-loss path:

```text
RUNNING_ATTEMPT_1
→ SECOND_DEVICE_LOSS_PENDING
→ SECOND_ATTEMPT_INVALIDATING
→ RECOVERY_BUDGET_EXHAUSTED
→ TERMINAL_DEVICE_LOSS
```

The FIFO entry remains the active head throughout recovery.

## 5. Main one-shot loss permit

Only Main may issue a loss permit. It binds run, fixture, renderer process, job, generation, attempt ordinal, device epoch and identity, expected chunk 8, expected submission 9, hook `R6_AFTER_SUBMIT_BEFORE_FENCE_WAIT`, package content, nonce, sequence and expiry.

The isolated renderer consumes the permit synchronously:

```text
real queue.submit(commandBuffer 9)
→ permit verification and one-shot consumption
→ GPUDevice.destroy()
→ device.lost observation
```

The injector is absent from the product route. A permit cannot be replayed or used for another run, process, job, attempt, epoch, chunk or submission.

## 6. Device-loss and queue terminal authority

The loss observer is installed before the first GPU resource. It seals old adapter/device/queue identities, loss reason, permit, active chunk/submission, last completed fence, last committed chunk and command-graph lineage.

Every queue ticket observes both `onSubmittedWorkDone()` and `device.lost`. Terminal states are:

```text
COMPLETED_BY_FENCE
DEVICE_LOST_BEFORE_FENCE
```

For the injected submission, `DEVICE_LOST_BEFORE_FENCE` wins. It is not counted as a normal fence, and the runtime cannot wait indefinitely on the old queue.

## 7. Canonical middle-chunk loss

The 4K loss target is chunk 8, attempt-local submission 9. Before loss, chunks 0-7 and fences 1-8 complete normally. Submission 9 is real, but its fence is replaced by the device-loss terminal observation.

```text
old-attempt submissions = 9
old-attempt normal fences = 8
loss observations = 1
normal committed chunks = 8
lost submitted chunks = 1
last committed chunk = 7
reusable old progress = 0
```

Chunk 8 creates no reusable compact progress and chunk 9 never starts on the old device.

## 8. Old-epoch total invalidation

The old epoch invalidates the device, queue, observer, four shader modules, seven pipelines, layouts, bind groups, encoder factory, arena buffers, compact target, QMap target, Final EWA texture/view, readback buffers, command objects, completion tickets, Analysis lease, unpublished field state, old pins and old warm metadata.

Best-effort `destroy()` is not completion proof. The loss receipt, epoch identity, invalidation ledger and reference release are authoritative.

Old completed chunks remain historical evidence only. No old compact record, cursor position, arena generation, Analysis field or warm entry may enter the replacement attempt.

## 9. Replacement adapter/device and root rebuild

One recovery mutex ensures one adapter request, one device request, one pipeline rebuild and one Final EWA rebuild. All observers of the same loss join one recovery promise.

The adapter is requested again with high-performance preference and no fallback. The hardware profile may be the same, but the acquisition ID is new.

The replacement device has:

```text
new GPUDevice and GPUQueue objects
new device epoch = old epoch + 1
new device and queue identity digests
new loss and validation observers
```

After admission, R6 rebuilds four shader modules, seven compute pipelines, explicit layouts, bind groups, queue authority, encoder factory and two qualification readback buffers. No old device-local object enters the replacement root.

## 10. Final EWA physical rebuild

The semantic source surface, revision, geometry, lowpass plan and logical job key remain stable. The replacement creates a fresh Final EWA texture/view, physical resource ID, actual identity, producer/lowpass receipt and replay delivery bound to the replacement epoch.

Required inequality:

```text
new texture ID != old texture ID
new physical identity != old physical identity
new producer receipt != old producer receipt
new replay receipt != old replay receipt
```

The recovered request updates device epoch/identity, Final EWA actual identity and capability, lowpass receipt and device execution key.

## 11. Fresh invocation and chunk-zero restart

Recovery creates a fresh QSR03 plan, arena, source capability, bind groups, compact target, QMap target, Analysis lease, readback binding and assembly receipt.

```text
attempt ordinal = 1
restart chunk = 0
restart window base = 0
arena generation = 0
compact expected base = 0
source cursor = 0
```

The recovered attempt executes the complete 18-chunk 4K graph with 18 submissions, 18 fences, 55 passes, 325 dispatches and one atomic Analysis publication.

## 12. Live waiter preservation and delivery identity

The successful fixture has one leader and three joined waiters. Across first loss and recovery:

```text
job ID and generation = unchanged
logical key = unchanged
waiter IDs and live count = unchanged
shared execution promise = unchanged
waiter rejections = 0
```

Successful dispositions are one `RECOVERED_COLD_LEADER` and three `JOINED_RECOVERY`. All callers receive unique pins to one recovered field generation.

Delivery receipts expose:

```text
requestedDeviceExecutionKey = old epoch key
deliveredDeviceExecutionKey = replacement epoch key
```

Warm metadata is inserted only under the delivered replacement key.

## 13. Second-loss terminal failure

The second fixture has one leader and two joined waiters. Attempt 0 loses at chunk 8/submission 9 and recovers once. Attempt 1 loses at the same point under a second one-shot permit bound to attempt 1 and the replacement epoch.

The second lost invocation is invalidated before the budget failure is surfaced.

```text
restart budget = 1
recovery count = 1
third adapter requests = 0
third device requests = 0
attempt ordinal 2 = absent
publication count = 0
```

All waiters reject with `E_QMAP03G_R6_SECOND_DEVICE_LOSS_TERMINAL` caused by `E_QMAP03G_DEVICE_RECOVERY_BUDGET_EXHAUSTED`. No handle, field, pin, delivery or warm entry is exposed.

## 14. Physical fixture matrix

### RS: one-restart success

```text
old attempt submissions = 9
old normal fences = 8
old loss observations = 1
replacement submissions = 18
replacement fences = 18
publications = 1
waiter deliveries = 4
fixture submissions = 27
fixture normal fences = 26
```

### RF: second-loss terminal failure

```text
attempt-zero submissions/fences/loss = 9/8/1
attempt-one submissions/fences/loss = 9/8/1
publications = 0
third acquisitions = 0
fixture submissions = 18
fixture normal fences = 16
```

Aggregate physical workload:

```text
real queue submissions = 45
normal completed fences = 42
device-loss terminal observations = 3
submission terminal observations = 45
successful publications = 1
lost-attempt publications = 0
```

## 15. Evidence and R2 mapping

R6 writes run/package receipts, permit index, loss observation ledger, epoch invalidation ledger, replacement device/root rebuild/Final EWA rebuild ledgers, recovery and waiter ledgers, second-loss terminal ledger, resource balance, RS/RF receipts, M-gate index, 64-leaf Merkle root and physical receipt.

M001-M064 are a separate qualification namespace. Later R2 executors may independently consume R6 evidence for P073-P080:

```text
controlled middle loss
old resource invalidation
new epoch acquisition
Final EWA rebuild
chunk-zero restart
waiter preservation
one recovered publication
second-loss budget exhaustion
```

R6 cannot create P receipts or admission/promotion authority.

## 16. Source gates and negative controls

```text
Source Gates = 304
Negative Controls = 128
Physical M-gate definitions = 64
Physical fixture groups = 2
Restart budget = 1
```

Source gates cover identity and promotion boundary, one-shot permit, loss observer, queue terminal distinction, old-epoch invalidation, recovery mutex, replacement adapter/device, root rebuild, Final EWA rebuild, recovery receipt, fresh invocation, chunk-zero execution, waiter preservation, recovered key/warm binding, second-loss cleanup, resource balance, fixture accounting, R2 evidence mapping and parent regressions.

Negative controls cover hard-fail recovery, forged/replayed permits, missing or late observers, fabricated fences, old progress/resource reuse, parallel recovery, identity/epoch reuse, incomplete root or Final EWA rebuild, nonzero restart, waiter/promise replacement, old-key delivery/warm entries, premature publication, second restart, cleanup bypass, wrong aggregate counts, M/P tree mixing and false promotion.

## 17. Required implementation surfaces

Legacy runtime modules cover R6 contract, permit, loss observer, queue terminal classification, epoch invalidation, replacement device, root rebuild, Final EWA rebuild, recovery transaction, waiter preservation, second-loss terminalization and fixture coordination.

Parent edits bind R6 into live device/queue, root dependencies, candidate root/product bridge, recovery, invocation/terminalizer, Final EWA replay, pipeline/readback, warm metadata and candidate Analysis authority.

Electron/renderer tooling provides the isolated loss BrowserWindow, typed IPC, one-shot permit authority, exact artifact allowlist, M gate registry/evidence/finalizer and RS/RF runners.

## 18. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R6_MAIN_ONE_SHOT_DEVICE_LOSS_PERMIT_ROOT_DEVICE_LOSS_OBSERVER_OLD_EPOCH_TOTAL_INVALIDATION_REPLACEMENT_ADAPTER_AND_DEVICE_FRESH_ROOT_RESOURCE_REBUILD_FINAL_EWA_DEVICE_REBUILD_CHUNK_ZERO_ONE_RESTART_LIVE_WAITER_PRESERVATION_SECOND_LOSS_TERMINAL_FAILURE_ZERO_STALE_DEVICE_RESOURCE_NO_PRODUCT_PROMOTION_AWAITING_PACKAGED_DEVICE_LOSS_PHYSICAL_EXECUTION
```

Required source facts:

```text
Source Gates = 304/304
Negative Controls = 128/128
M-gate definitions = 64
source-simulation submissions = 45
source-simulation normal fences = 42
source-simulation loss observations = 3
successful publications = 1
second-loss publications = 0
physical M gates executed = 0/64
R2 P gates executed = 0/96
trial permit artifacts = 0
physical admission artifacts = 0
product permit artifacts = 0
product promotion = false
QRC02 product route = unchanged
```

Source WebGPU doubles prove control-flow closure only. They are not packaged physical device-loss evidence.

## 19. Physical completion state

```text
PACKAGED_ONE_RESTART_DEVICE_LOSS_PHYSICAL_BAKED_QMAP_STREAMING_REDUCTION_03G_R6_MAIN_ONE_SHOT_LOSS_PERMIT_MIDDLE_CHUNK_DEVICE_LOSS_OLD_EPOCH_RESOURCE_INVALIDATION_REPLACEMENT_ADAPTER_DEVICE_FINAL_EWA_REBUILD_CHUNK_ZERO_RESTART_LIVE_WAITER_PRESERVATION_RECOVERED_4K_PUBLICATION_SECOND_LOSS_TERMINAL_FAILURE_ZERO_STALE_RESOURCE_GLOBAL_QRC02_BRIDGE_UNCHANGED_NO_PRODUCT_PROMOTION
```

Required physical facts later:

```text
M gates = 64/64
queue submissions = 45
normal completed fences = 42
device-loss observations = 3
successful recovered publications = 1
second-loss publications = 0
third device acquisitions = 0
terminal private resource balance = 0
unexpected WebGPU validation errors = 0
product promotion = false
```

## 20. Package and repository policy

The code ZIP contains R6 authorities, parent bindings, two fixture runners, M001-M064 definitions/predicates, source validators and physical launcher/verifier. It excludes this specification, physical M/P receipts, Merkle artifacts, trial permit, physical admission, product permit, reports, logs, temporary evidence, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 21. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R7

Packaged 8K Core Physical Closure /
Seventy-Two-Chunk Submission Parity /
Final-Chunk-218 Coverage /
Full QMAP01 Output Parity /
Three-Cycle Resource Plateau /
Sixteen-Way Warm Sharing /
No Hidden Global Frequency or Power Allocation /
No Product Promotion Yet Seal
```

## 22. Final seal

```text
Device loss is not cancellation.
Cancellation drains a valid-device fence.
Device loss invalidates the entire device epoch.

The lost submission emits no normal fence and no reusable compact progress.
All old buffers, textures, pipelines, bind groups, queue tickets, Analysis state
and warm entries are invalidated.

One recovery transaction reacquires adapter and device, advances epoch once,
rebuilds root resources and physically rebuilds Final EWA.
The same logical job and waiter set continue through a new invocation from
chunk zero.

The recovered 4K attempt completes all eighteen chunks and publishes once.
Delivery receipts bind the replacement execution key.

A second loss is cleaned up before restart-budget failure is exposed.
No third device is acquired and no field or warm state is published.

R6 emits qualification evidence only.
It creates no physical admission or product promotion permit.
The global QRC02 bridge remains unchanged.
```
