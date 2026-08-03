# TDT-QMAP-STREAMING-REDUCTION-03G-R11

## Post-Promotion Product Soak / Ten-Boot Permit Persistence / Mixed 1080p·4K·8K Product Workload / Product Device-Loss Recovery / Concurrent Preview·Export Stability / Installed Update Revalidation / Automatic QRC02 Rollback / Sustained Product Stability Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R11
Short ID = QSR03G-R11
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R10
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

Required parent source state:

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R10_PINNED_R9_PHYSICAL_ADMISSION_VERIFIER_ROLE_SEPARATED_PRODUCT_SIGNING_AUTHORITY_CANONICAL_PRODUCT_PERMIT_VERIFIER_VERIFIED_RENDERER_CAPABILITY_SINGLE_PRODUCT_WRITER_QRC02_DRAIN_AND_QUALIFICATION_DEMOTION_ATOMIC_QSR03G_GLOBAL_BRIDGE_PROMOTION_NORMAL_INSTALLED_PRODUCT_BOOT_POST_PROMOTION_EFC_PRODUCT_CANARY_ADMISSION_DRIFT_ROLLBACK_AWAITING_PACKAGED_PRODUCT_PROMOTION_EXECUTION
```

R11 validates sustained normal-product operation after the R10 product promotion has already been physically admitted and committed.

R11 does not change, rotate or broaden the R10 product-promotion signing authority. It may not issue or rewrite a product-promotion permit or active product-route pointer.

## 1. Required product-authority invariant

The following tuple remains byte- and digest-stable throughout all admitted R11 boots and operations:

```text
R9 physical-admission receipt digest
R9 final P001-P096 Merkle root
R10 product-promotion permit file digest
R10 permit self hash and signature digest
R10 product public-key digest
R10 active product-route pointer digest
R10 promotion generation
package content ID and package closure
runtime bridge, composition root, shader and ABI digests
device-profile digest
QSR03G implementation digest
QRC02 rollback implementation digest
```

Process IDs, renderer IDs, installed-session IDs, operation grants, GPUDevice/GPUQueue identities and device epochs may change according to their own authorities.

A replacement GPU device is not product-admission drift when the admitted device profile remains valid and the post-loss canary passes.

## 2. Ten-boot permit persistence

R11 launches ten fresh packaged processes. Every process independently verifies the R10 active pointer, signed product permit, R9 physical admission, final 96-leaf root, package closure, runtime/shader/ABI identities and implementation digests.

```text
baseline admitted boots = 10
startup canaries = 10
installed-strict sessions = 10
BrowserWindow show events = 10
startup work per boot = 8 submissions / 8 fences
aggregate baseline work = 80 / 80
baseline final surfaces = 10
```

Each boot receipt binds its ordinal, fresh process-start identity, installed session, device epoch, startup-canary digest and previous boot receipt digest.

Required persistence facts:

```text
product permit file writes = 0
product signer acquisitions = 0
active product pointer writes = 0
permit digest changes = 0
pointer digest changes = 0
R9 admission-root changes = 0
promotion-generation changes = 0
```

## 3. Installed-strict startup canary

The prior unconditional installed-strict placeholder rejection is replaced by a fail-closed physical canary hook.

Installed-strict session issuance requires a `DadumQsr03gProductStartupCanary` result with:

```text
hardwareGpu = true
productReferenceExact = true
aggregate submissions / fences = 8 / 8
Pipeline final publications = 1
QRC02 product executions = 0
validationCounterNonzero = 0
faultSentinelCount = 0
pass = true
```

The BrowserWindow remains hidden until canary completion and Main-issued installed-session admission.

## 4. Mixed product workload

R11 executes four deterministic waves. Each wave concurrently admits:

```text
1080p Preview + Export
4K Preview + Export
8K Preview + Export
```

Canonical geometry:

```text
1080p: 1920×1080, 1,888 windows, 5 QMap chunks, complete EFC = 8 submissions
4K:    3840×2160, 7,854 windows, 18 QMap chunks, complete EFC = 21 submissions
8K:    7680×4320, 32,026 windows, 72 QMap chunks, complete EFC = 75 submissions
```

Per wave:

```text
callers = 6
logical cold jobs = 3
submissions / fences = 104 / 104
final surfaces = 3
```

Four-wave aggregate:

```text
callers = 24
shared cold jobs = 12
submissions / fences = 416 / 416
QMap fields = 12
final surfaces = 12
Preview completions = 12
Export completions = 12
```

## 5. Concurrent Preview and Export authority

For each same-resolution pair, Preview and Export share:

```text
one QSR03G cold job
one QMap field generation
one QWave-real execution
one QWave-analytic execution
one EFC graph
one Pipeline final revision
one final-surface resource
```

They retain distinct installed operation grants, consumer identities, completion receipts and final-surface pins.

The first consumer release does not retire the surface. Retirement eligibility begins only after the last consumer pin releases. Consumer-pin underflow is forbidden.

## 6. FIFO, single-flight and plateau

Each wave contains three distinct logical keys.

```text
maximum active cold QSR03G jobs = 1
maximum active QSR03B arenas = 1
maximum FIFO depth = 3
joined-caller GPU submissions = 0
same-key duplicate publications = 0
```

Snapshots are taken before wave 1, after every wave and after final consumer release.

At each wave boundary:

```text
private QSR03G buffers = 0
private QSR03G textures = 0
EFC-private resources = 0
unsettled submission tickets = 0
orphan Analysis pins = 0
orphan final surfaces = 0
open operation grants = 0
```

Root shader, pipeline and readback counts may not grow after warm-up. Monotonic private-byte or working-set growth is not admitted.

## 7. Product device-loss recovery

One 4K Preview/Export pair loses the product device at:

```text
attempt = 0
chunk index = 8
attempt-local submission = 9
hook = AFTER_REAL_SUBMIT_BEFORE_FENCE_WAIT
```

Old attempt:

```text
real submissions = 9
normal fences = 8
device-loss observations = 1
last committed chunk = 7
reusable compact progress = 0
```

Replacement:

```text
adapter acquisitions = 1
new devices / queues = 1 / 1
device-epoch advance = 1
QMap restart chunk = 0
replacement QMap submissions / fences = 18 / 18
Final EWA and QMap physical resources rebuilt = true
```

Post-QMap convergence adds QWave real, QWave analytic and EFC graph work, one submission/fence each.

The product operation itself therefore records:

```text
submissions = 30
normal fences = 29
loss observations = 1
terminal observations = 30
```

A post-loss 1080p startup canary adds 8/8 and one temporary final surface.

Complete device-loss fixture:

```text
submissions = 38
normal fences = 37
device-loss terminal observations = 1
terminal observations = 38
final surfaces = 2
```

## 8. Installed-session revoke and rebind

At device loss:

```text
old installed session = revoked
old Preview grant = revoked
old Export grant = revoked
new normal grants = blocked
```

The internal shared QSR03G job and Preview/Export waiter identities remain retained by the recovery authority.

Recovered delivery waits for:

```text
replacement device ACTIVE
R6 recovery receipt verification
post-loss startup canary PASS
new installed session issuance
continuation grant issuance
```

Required rebound facts:

```text
new session ID != old session ID
new session generation = old + 1
new device epoch = old + 1
product permit digest = unchanged
active pointer digest = unchanged
promotion generation = unchanged
Preview continuation grants = 1
Export continuation grants = 1
old grant replay acceptance = 0
recovered final surfaces = 1
```

R11 injects one controlled device loss and remains below existing quarantine thresholds. It does not weaken the one-restart policy or silently use QRC02 fallback.

## 9. Installed update SSOT separation

R11 distinguishes:

```text
R10 active product-route pointer = product authority for one package identity
local installation pointer = selected install generation
update transaction = transition between installation generations
R11 boot ledger = proof that the selected package revalidated product authority
```

Selecting an installed package does not confer product admission.

### 9.1 Same-content reinstall

A same-content reinstall changes only local install generation and process/session identity.

All admission-bound package, runtime, shader, ABI and implementation digests remain equal.

```text
install generation = previous + 1
product signer acquisitions = 0
new product permits = 0
R10 active pointer writes = 0
target startup canary = 8 / 8
target installed session = active
```

### 9.2 Drifted target

A second target changes package content ID or shader-set digest without a matching R10 permit.

Required rejection:

```text
target QSR03G bridge installations = 0
target installed sessions = 0
target BrowserWindow shows = 0
target product GPU submissions = 0
target Preview/Export grants = 0
normal product work = denied
```

## 10. Automatic QRC02 rollback

Before handing control to the target, the source process blocks new work, drains QSR03G, clears warm entries, retires fields and surfaces, restores its captured QRC02 object and descriptor, and revokes the installed QSR03G session.

If target revalidation fails, the local install pointer is restored to the previous admitted package and the previous package is relaunched.

The previous package independently verifies the unchanged R10 permit and active pointer and runs an 8/8 recovery startup canary before QSR03G returns to the normal product route.

Within one process, exact QRC02 object and descriptor identity is required. Across process relaunch, R11 proves implementation digest and authority continuity, not JavaScript object identity.

Update aggregate:

```text
successful installed boots = 2
failed target admission boots = 1
submissions / fences = 16 / 16
final surfaces = 2
automatic local-pointer rollbacks = 1
```

## 11. Complete workload accounting

```text
Ten baseline boots:
  submissions / fences = 80 / 80
  final surfaces = 10

Mixed workload:
  submissions / fences = 416 / 416
  final surfaces = 12

Product device loss:
  submissions = 38
  normal fences = 37
  loss observations = 1
  final surfaces = 2

Installed updates:
  submissions / fences = 16 / 16
  final surfaces = 2
```

Aggregate:

```text
real queue submissions = 550
normal completed fences = 549
device-loss terminal observations = 1
submission terminal observations = 550
converged final surfaces = 26
successful installed boots = 12
failed target admission boots = 1
process launches = 13
Preview completions = 13
Export completions = 13
product permit writes = 0
product signer acquisitions = 0
active product pointer writes = 0
QRC02 normal product executions = 0
automatic rollback transitions = 1
maximum simultaneous product writers = 1
```

## 12. Product-route stability

Across all admitted work:

```text
normal product route = QSR03G
QRC02 normal requests/submissions/publications = 0/0/0
QRC02 fallback invocations = 0
unauthorized global bridge writes = 0
maximum simultaneous product writers = 1
```

QRC02 may return to `ACTIVE_PRODUCT` only inside the admitted rollback transaction. After the prior admitted package re-establishes QSR03G, QRC02 returns to `QUALIFICATION_ONLY`.

## 13. Product session and operation grants

Every installed session binds the product permit, active pointer, final physical Merkle root, promotion generation, install generation, device epoch and implementation digests under the Main session MAC.

Every operation grant binds the session, session generation, install generation, device epoch, job sequence and operation binding digest.

Grants are process-bound and single-use. Grants from another boot, install generation, device epoch, revoked session or failed target are rejected.

## 14. Validation and quarantine closure

Across the 550 submission terminal observations:

```text
shader compilation errors = 0
WebGPU validation/internal/OOM errors = 0
uncaptured errors = 0
unexpected device losses = 0
controlled device losses = 1
bind-group/encoding/submission errors = 0
nonfinite product outputs = 0
runtime quarantine = false
```

The controlled lost submission is a device-loss terminal observation, not a completed fence.

## 15. Authorities and schemas

```text
tenBootPersistenceAuthorityId = dadum.qmap.ten-boot-permit-persistence-authority.qsr03g-r11
productSoakAuthorityId = dadum.qmap.post-promotion-product-soak-authority.qsr03g-r11
mixedWorkloadAuthorityId = dadum.qmap.mixed-resolution-product-workload-authority.qsr03g-r11
concurrentConsumerAuthorityId = dadum.qmap.concurrent-preview-export-authority.qsr03g-r11
productDeviceLossAuthorityId = dadum.qmap.product-device-loss-recovery-authority.qsr03g-r11
productSessionRebindAuthorityId = dadum.qmap.product-session-rebind-authority.qsr03g-r11
installedUpdateBindingAuthorityId = dadum.qmap.installed-update-admission-binding-authority.qsr03g-r11
automaticRollbackAuthorityId = dadum.qmap.automatic-qrc02-rollback-authority.qsr03g-r11
sustainedResourceAuthorityId = dadum.qmap.sustained-product-resource-authority.qsr03g-r11
```

Canonical schemas include ten-boot ledger, permit persistence, mixed workload, concurrent Preview/Export, product device-loss, session rebind, installed update revalidation, automatic rollback, sustained resource plateau, sustained product stability and sustained product Merkle.

## 16. Named R001-R096 physical gate families

```text
R001-R008   R10 authority persistence
R009-R016   baseline boots 1-5
R017-R024   baseline boots 6-10
R025-R032   mixed workload plan
R033-R040   concurrent consumer stability
R041-R048   FIFO and resource plateau
R049-R056   product device loss
R057-R064   post-loss session rebind
R065-R072   same-content installed update
R073-R080   drifted update and rollback
R081-R088   aggregate product stability
R089-R096   final sustained seal
```

R receipts form a domain-separated 96-leaf sustained-product Merkle. They do not alter the R9 P tree or R10 Q tree.

## 17. Source gates and negative controls

```text
Source Gates = 384
Negative Controls = 168
Physical R-gate definitions = 96
```

Source gates cover R10 authority immutability, ten-boot ledger, physical-canary hook, mixed workloads, shared consumer ownership, FIFO/single-flight, resource plateau, device loss, session rebind, update drain/revalidation, rollback, operation grants, aggregate accounting, route stability, WebGPU integrity, update-pointer separation and A-R10 regressions.

Negative controls cover wrong boot counts, changed permits/pointers, placeholder canaries, incorrect workload geometry, duplicate cold jobs, divergent final revisions, pin underflow, FIFO/plateau violations, wrong loss point or fence accounting, reused old progress, stale sessions/grants, skipped post-loss canary, unauthorized target admission, incomplete rollback, bad aggregate counts, QRC02 fallback, validation errors, pointer conflation, signer mutation and premature sustained-stability claims.

## 18. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R11_TEN_BOOT_PRODUCT_PERMIT_PERSISTENCE_MIXED_1080P_4K_8K_PRODUCT_WORKLOAD_CONCURRENT_PREVIEW_EXPORT_SINGLE_FLIGHT_SUSTAINED_RESOURCE_PLATEAU_PRODUCT_DEVICE_LOSS_RECOVERY_INSTALLED_SESSION_REBIND_SAME_CONTENT_UPDATE_REVALIDATION_DRIFTED_TARGET_REJECTION_AUTOMATIC_QRC02_ROLLBACK_R10_SIGNING_AUTHORITY_UNCHANGED_AWAITING_PACKAGED_PRODUCT_SOAK_EXECUTION
```

Required source facts:

```text
Source Gates = 384/384
Negative Controls = 168/168
Physical soak gate definitions = 96
baseline boot definitions = 10
mixed wave definitions = 4
expected submissions = 550
expected normal fences = 549
expected loss observations = 1
expected final surfaces = 26
real product signer acquisitions = 0
real product permits issued = 0
real active pointer writes = 0
physical R gates executed = 0/96
sustained product stability = false
```

Source fixtures use fake process identities and source-only product authority. They are not packaged soak evidence.

## 19. Physical completion state

```text
PACKAGED_POST_PROMOTION_PRODUCT_SOAK_BAKED_QMAP_STREAMING_REDUCTION_03G_R11_TEN_BOOT_PERMIT_PERSISTENCE_TWELVE_SUCCESSFUL_INSTALLED_BOOTS_MIXED_1080P_4K_8K_PRODUCT_WORKLOAD_FOUR_WAVE_CONCURRENT_PREVIEW_EXPORT_ONE_PRODUCT_DEVICE_LOSS_RECOVERY_POST_LOSS_SESSION_REBIND_SAME_CONTENT_UPDATE_REVALIDATED_DRIFTED_TARGET_REJECTED_AUTOMATIC_QRC02_ROLLBACK_FIVE_HUNDRED_FIFTY_SUBMISSION_TERMINAL_OBSERVATIONS_ZERO_PRODUCT_ROUTE_AMBIGUITY_ZERO_PRIVATE_RESOURCE_LEAK_SUSTAINED_PRODUCT_STABILITY_PASS
```

Required physical facts later:

```text
R gates = 96/96
baseline boots = 10
successful installed boots = 12
failed target admission boots = 1
mixed waves = 4
Preview completions = 13
Export completions = 13
real submissions = 550
normal fences = 549
loss observations = 1
terminal observations = 550
final surfaces = 26
product permit writes = 0
product signer acquisitions = 0
QRC02 normal product executions = 0
automatic rollback transitions = 1
maximum simultaneous product writers = 1
runtime quarantine = false
terminal private-resource balance = 0
WebGPU validation errors = 0
sustained product stability = true
```

## 20. Package policy

The code ZIP contains the boot ledger, permit persistence, installed-strict canary hook, mixed scheduler, shared consumer authority, resource plateau, product device-loss/session-rebind authority, update binding, automatic rollback, R001-R096 registry, source validators and physical launcher/verifier.

The ZIP excludes this specification, private keys, real product permit, real active pointer, generated R receipts, sustained-product Merkle, physical soak receipt, user content, reports, logs, temporary evidence, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 21. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R12

Changed-Package Installed Update Physical Closure /
Target R9 Physical Admission Verification /
Target R10 Product Permit Rotation /
Atomic Package and Product-Route Generation Switch /
Previous-Package Retention /
Cross-Version QRC02 Recovery /
Failed-Target Automatic Reversion /
No Fleet-Wide Promotion Claim Yet Seal
```

R12 may validate a genuinely changed target package carrying its own R9 physical admission and R10 product-promotion permit. R12 may invoke the unchanged R10 product signing authority only for that separately admitted target.

## 22. Final seal

```text
R11 signs no product permit.

It proves that the exact R10 permit, R9 physical root and active product pointer
survive ten independent packaged boots without rewrite.

Every installed boot performs a real 8-submit QSR03G startup canary before
normal user work or window visibility is admitted.

Four mixed waves run Preview and Export concurrently at 1080p, 4K and 8K.
Each same-key pair shares one QMap field, one EFC graph and one final surface,
while retaining separate grants and consumer pins.

One 4K product operation loses its device after the ninth real submission.
The old session and grants revoke, the device epoch rebuilds, QMap restarts from
chunk zero, a post-loss canary passes and new continuation grants deliver one
recovered final revision to both consumers.

A same-content reinstall reuses the unchanged permit. A changed target without
its own R10 permit is rejected before bridge installation, GPU work, session
issuance or window display.

Automatic rollback drains QSR03G, restores QRC02 authority, restores the prior
installed package and independently revalidates the original product permit.

R11 expects 550 submission terminal observations, 26 final surfaces, twelve
successful installed boots, one controlled device loss and one automatic
update rollback.

The R10 product signing authority remains unchanged and unloaded.
```
