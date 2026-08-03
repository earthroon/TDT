# TDT-QMAP-STREAMING-REDUCTION-03G-R14C

## Main-to-Renderer Product Bootstrap Authority / Exact QRC02 Descriptor Capture / QRC02 Drain and Quiescence / Atomic Global Bridge Compare-and-Swap / Real QSR03G Bridge Activation / Installed Session Generation Rebind / Rollback Descriptor Preservation / No Preview·Export Binding Yet Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R14C
Short ID = QSR03G-R14C
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R14B
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

R14C atomically transfers Renderer product-route authority from the current QRC02 bridge to the exact real QSR03G bridge staged by R14B.

R14C consumes the R14B product-runtime service, promotion candidate, exact previous QRC02 object and property descriptor, real staged QSR03G bridge, R10 single-product writer authority and the active installed session.

R14C does not execute QMap GPU work, submit command buffers, publish AFT00 fields, run QWave or EFC, bind Preview or Export, replace the startup canary, publish final surfaces, delete QRC02 code, mutate Package A retention, or claim R14 W001-W096 physical closure.

## 1. Confirmed parent boundary

R14B terminates with one real product root, one real QSR03G bridge in `STAGED`, one exact QRC02 object reference, one exact global-property descriptor and one promotion candidate. It performs zero global writes, zero QRC02 drains and zero QSR03G activation calls.

R14C is the sole patch that may perform the authority switch.

The earlier R10 coordinator is insufficient as the R14C product path because it writes the global property before lifecycle completion and cannot guarantee exact descriptor restoration after a post-write failure. R14C therefore introduces explicit lifecycle prepare, commit and abort phases around one exact compare-and-swap.

## 2. Required terminal state

```text
global product bridge = exact R14B real QSR03G bridge
global bridge writes = 1
global bridge deletes = 0
missing bridge intervals = 0
dual active product authority observations = 0
QSR03G state = ACTIVE_PRODUCT
QRC02 state = QUALIFICATION_ONLY
QRC02 active operations = 0
QRC02 warm entries = 0
QRC02 pins = 0
installed session ID = unchanged
installed session generation = previous + 1
old-generation grant acceptances = 0
rollback capsules = 1
Preview bindings = 0
Export bindings = 0
QMap operations = 0
queue submissions = 0
AFT00 publications = 0
final surfaces = 0
```

Terminal runtime capability:

```text
dadum.qmap.product-runtime.active
```

## 3. State ownership and SSOT

```text
Electron Main
= promotion transaction ID, writer lease, one-shot commit capability,
  consumed nonce set, Renderer identity and installed-session rebind SSOT

QMapProductRuntimeService
= staged/active QSR03G object, exact previous QRC02 object and descriptor,
  local promotion state and private rollback capsule SSOT

globalThis.__DADUM_QMAP_RUNTIME_BRIDGE__
= normal Renderer product-route SSOT after commit

InstalledAdmissionService and Main session authority
= installed session and generation SSOT

QRC02 object
= QRC02 lifecycle-state SSOT

real QSR03G bridge
= QSR03G lifecycle-state SSOT
```

The promotion coordinator requests lifecycle transitions but owns no shadow lifecycle counters.

## 4. Authority components

```text
Main authority = Qsr03gR14CProductBootstrapAuthority
Renderer coordinator = QMapProductPromotionCoordinator
runtime service = dadum.runtime.qmap-product-promotion
runtime module = dadum.module.qmap-product-promotion-r14c
preload namespace = window.dadumHost.runtimeAdmission.qmapPromotion
```

Preload methods:

```text
prepare()
authorizeCommit()
complete()
abort()
status()
```

Every Main handler derives Renderer PID, webContents ID and window identity from the Electron IPC event. Caller-supplied identity fields have no authority.

## 5. Transaction state machines

Main:

```text
IDLE
→ PREPARING
→ WRITER_LEASED
→ CAPABILITY_ISSUED
→ COMMIT_AUTHORIZED
→ RENDERER_COMMITTED
→ SESSION_REBOUND
→ COMPLETE
```

Pre-commit aborts terminate at `ABORTED` and release the writer lease.

Renderer:

```text
PROMOTION_PREPARED
→ ADMISSION_DRAINING
→ QRC02_DRAINING
→ ROUTES_QUIESCENT
→ LIFECYCLES_PREPARED
→ COMMIT_AUTHORIZED
→ GLOBAL_SWAPPED
→ ROUTES_COMMITTED
→ SESSION_REBINDING
→ ACTIVE_PRODUCT
```

Pre-CAS abort restores QRC02 to `ACTIVE_PRODUCT`, QSR03G to `STAGED`, resumes the old installed session and returns to `PROMOTION_PREPARED`.

A failure after CAS must restore the exact captured descriptor before abort completion.

## 6. Main-to-Renderer transaction binding

Every transaction binds:

```text
transaction ID
writer lease ID
promotion generation
Renderer process ID
webContents ID
window ID
installed session ID and generation
package content ID
permit digest
active-pointer digest
R9 physical root
installed bundle digest and generation
product-route generation
R14B promotion-candidate digest
expected QRC02 identity and descriptor digests
expected staged QSR03G bridge digest
runtime epoch
device epoch and identity
nonce
issued-at and expiry times
singleUse = true
```

No raw JavaScript bridge object or property descriptor crosses IPC.

## 7. Main preparation and single-product writer

Renderer invokes `qmapPromotion.prepare()` with serializable authority evidence.

Main verifies the requesting Renderer identity, current installed session, package and permit authority, bundle and route generations, device identity, R14B promotion candidate and absence of another active promotion transaction.

Main reuses the R10 single-product writer SSOT. R14C must not create a second product-writer authority.

Required counts:

```text
maximum active writer leases = 1
promotion-generation advances = 1
commit capabilities issued = 1
commit capabilities consumed = 1
replay acceptances = 0
writer releases = 1
```

## 8. Strengthened QRC02 identity and descriptor

The QRC02 identity digest binds:

```text
global key
bridge schema ID
bridge ID
implementation = QRC02
implementation digest
lifecycle API version
object-identity token
```

The exact local comparison remains:

```text
Object.getOwnPropertyDescriptor(target, key).value
=== promotionCandidate.previousBridge
```

The descriptor digest binds:

```text
global key
value bridge-identity digest
writable
enumerable
configurable
getter presence
setter presence
```

Required previous descriptor:

```text
value = exact captured QRC02 object
writable = false
enumerable = false
configurable = true
getter = absent
setter = absent
```

Accessors, changed flags, changed object identity, changed key and missing descriptors are rejected.

## 9. One-shot commit capability

Schema:

```text
tdt.qmap.product-bootstrap-capability.qsr03g-r14c.v1
```

Maximum validity is 60,000 milliseconds.

The capability binds the entire transaction and may be consumed once by the original Renderer PID and webContents ID. Expired, replayed, cross-Renderer, cross-package, cross-permit and cross-bridge uses fail closed.

## 10. Installed-admission route drain

Before QRC02 drain, Renderer calls:

```text
InstalledAdmissionService.beginQmapRoutePromotionDrain()
```

During the drain:

```text
new Preview grants = blocked
new Export grants = blocked
new unrelated fixture grants = blocked
existing operation completions = allowed
new rendererReady calls = blocked
```

Drain completion requires:

```text
active operation grants = 0
pending grant requests = 0
open product-route transactions = 0
session generation = current generation
```

The current session remains privately available to the promotion transaction.

## 11. Old grant revocation

The transaction captures the old session generation and highest issued job sequence. After rebind, every old-generation grant is invalid with reason `QMAP_PRODUCT_ROUTE_PROMOTION`.

At least one captured old-generation grant must be tested and rejected without GPU work.

## 12. QRC02 drain and quiescence

Required sequence:

```text
qrc02.beginDrain()
→ qrc02.waitForQuiescence()
```

Required pre-CAS snapshot:

```text
state = QUIESCENT
activeOperations = 0
warmEntries = 0
pins = 0
```

QRC02 remains the exact current global object throughout the drain.

## 13. Staged QSR03G verification

Before preparation, the candidate bridge must be the exact R14B service-owned object and report:

```text
state = STAGED
realRuntimeBridge = true
route = QSR03G
qrc02Fallback = false
activeOperations = 0
FIFO entries = 0
single-flight jobs = 0
warm entries = 0
```

Permit, bundle and product-route generations must match the installed authority tuple.

## 14. Two-phase lifecycle

QRC02 adds:

```text
prepareQualificationDemotion()
commitQualificationDemotion()
abortQualificationDemotion()
```

Transitions:

```text
QUIESCENT → DEMOTION_PREPARED
DEMOTION_PREPARED → QUALIFICATION_ONLY on commit
DEMOTION_PREPARED → ACTIVE_PRODUCT on abort
```

QSR03G adds:

```text
prepareProductActivation()
commitProductActivation()
abortProductActivation()
```

Transitions:

```text
STAGED → ACTIVATION_PREPARED
ACTIVATION_PREPARED → ACTIVE_PRODUCT on commit
ACTIVATION_PREPARED → STAGED on abort
```

Both preparations bind one transaction digest. Product execution remains impossible during preparation.

Lifecycle preparation receipt schema:

```text
tdt.qmap.bridge-lifecycle-prepare.qsr03g-r14c.v1
```

## 15. Main commit authorization

After drain and lifecycle preparation, Renderer invokes `authorizeCommit()` with the one-shot capability and the drain, quiescence, lifecycle and descriptor receipt digests.

Main verifies the current transaction and durably consumes the capability nonce.

Schema:

```text
tdt.qmap.product-bootstrap-commit-authorization.qsr03g-r14c.v1
```

A second authorization is rejected.

## 16. Atomic global compare-and-swap

Required function:

```text
promoteQsr03gBridgeAtomicR14C()
```

Preconditions:

```text
current descriptor equals exact captured descriptor
current value equals exact captured QRC02 object
QRC02 state = DEMOTION_PREPARED
QSR03G state = ACTIVATION_PREPARED
Main commit authorization = current and single-use
installed admission drain = active
```

The sole global mutation is:

```js
Object.defineProperty(target, "__DADUM_QMAP_RUNTIME_BRIDGE__", {
  value: qsr03g,
  writable: false,
  enumerable: false,
  configurable: true,
});
```

Required:

```text
global writes = 1
global deletes = 0
missing bridge observations = 0
```

## 17. Post-write verification and lifecycle commit

Immediately after the write, strict identity and the promoted descriptor are verified.

Lifecycle commit order:

```text
QSR03G.commitProductActivation(transactionDigest)
→ QRC02.commitQualificationDemotion(transactionDigest)
```

Terminal states:

```text
QSR03G = ACTIVE_PRODUCT
QRC02 = QUALIFICATION_ONLY
simultaneously active product bridges = 0
normal product bridge references = QSR03G only
QRC02 product execution availability = false
```

Installed admission remains drained until session rebind completes.

## 18. Exact rollback after post-CAS failure

Any failure before session rebind completion performs:

```text
restore exact previous property descriptor
verify exact QRC02 object identity
abort QSR03G activation
abort/restore QRC02 demotion
verify QRC02 ACTIVE_PRODUCT
verify QSR03G STAGED
abort Main transaction
resume old installed session
```

Restoration uses the exact captured descriptor object through `Object.defineProperty`. Reconstructing a descriptor from copied flags is forbidden.

## 19. Promotion receipt

Schema:

```text
tdt.qmap.atomic-global-promotion.qsr03g-r14c.v1
```

The self-hashed receipt binds the transaction, previous and promoted bridge/descriptor digests, R14B candidate, Main authorization, lifecycle preparation, product authority tuple, package, permit, bundle and route generations.

Required counters and states:

```text
global bridge writes = 1
missing bridge observations = 0
dual active observations = 0
QRC02 state = QUALIFICATION_ONLY
QSR03G state = ACTIVE_PRODUCT
QMap operations = 0
queue submissions = 0
AFT00 publications = 0
```

## 20. Installed session generation rebind

After Renderer seals the promotion receipt, Main verifies it and issues a successor installed session.

Required relationship:

```text
new session ID = previous session ID
new generation = previous generation + 1
package content ID = unchanged
device epoch = unchanged
permit digest = unchanged
bundle digest and generation = unchanged
product-route generation = unchanged
```

New fields bind:

```text
qmapGlobalPromotionReceiptDigest
qmapRuntimeServiceReceiptDigest
qmapPromotionCandidateDigest
qmapRollbackDescriptorDigest
qmapBridgeState = ACTIVE_PRODUCT
qmapProductRuntimeActivated = true
qmapPreviewExportBound = false
qmapProductWorkAllowed = false
```

The startup-canary digest remains unchanged. R14C does not claim a real QSR03G startup canary.

`InstalledAdmissionService.completeQmapRoutePromotionRebind()` performs one atomic local session replacement without an intermediate null session.

## 21. Activation binding

Schema:

```text
tdt.qmap.product-activation-binding.qsr03g-r14c.v1
```

The activation binding references the immutable R14B construction tuple and binds old/new session generations, global promotion receipt, active bridge and descriptors, rollback descriptor, device epoch, bundle generation and product-route generation.

Future QMap product requests must bind this successor activation authority rather than relying on the pre-promotion staged tuple alone.

## 22. Product-runtime service extension

R14C extends the R14B service state machine:

```text
PROMOTION_PREPARED
→ PROMOTING
→ GLOBAL_PROMOTED
→ SESSION_REBOUND
→ ACTIVE_PRODUCT
```

Required methods:

```text
beginAtomicPromotion()
completeAtomicPromotion()
abortAtomicPromotion()
activeSessionBindingSnapshot()
rollbackCapsuleSnapshot()
getActiveBridge()
```

After success, staged-authority access is rejected and active-bridge access resolves to the exact promoted bridge.

## 23. Private rollback capsule

The service privately retains:

```text
exact previous QRC02 object
exact previous property descriptor
previous bridge and descriptor digests
promoted QSR03G bridge object
promoted descriptor digest
promotion receipt digest
activation binding digest
old and new session generations
```

Raw objects are never serialized or placed on window globals. Serialized evidence contains digests only.

R14C preserves rollback authority but does not execute a production rollback.

## 24. Runtime module and IPC

Runtime module:

```text
id = dadum.module.qmap-product-promotion-r14c
phase = pipeline
dependsOn = R14B staged runtime, installed admission and GPU authority
provides = dadum.qmap.product-runtime.active
ownsServices = SERVICE_IDS.qmapProductPromotion
```

Runtime order:

```text
installed admission
→ R14B staged runtime
→ R14C atomic promotion
→ Preview
→ Export
```

Preview and Export still do not consume the active capability.

IPC channels:

```text
dadum:qmap-r14c-prepare
dadum:qmap-r14c-authorize-commit
dadum:qmap-r14c-complete
dadum:qmap-r14c-abort
dadum:qmap-r14c-status
```

## 25. No consumer or GPU-work expansion

R14C does not modify PreviewPresenterService, ExportAuthorityService, final-surface consumer ledgers or their runtime dependencies.

Required zeros:

```text
Preview QMap bindings = 0
Export QMap bindings = 0
final-surface producer grants = 0
ensureQMapForConvergence calls = 0
QMap invocations = 0
GPU queue submissions = 0
GPU fence waits = 0
AFT00 product publications = 0
warm QMap entries = 0
EFC transactions = 0
Pipeline final publications = 0
final surfaces = 0
BrowserWindow visibility changes = 0
```

The bridge is authority-ready but workload-unproven.

## 26. Stable error contract

```text
E_QMAP03G_R14C_MAIN_AUTHORITY_REQUIRED
E_QMAP03G_R14C_PROMOTION_TRANSACTION_ACTIVE
E_QMAP03G_R14C_PROMOTION_TRANSACTION_MISSING
E_QMAP03G_R14C_RENDERER_IDENTITY_MISMATCH
E_QMAP03G_R14C_INSTALLED_SESSION_REQUIRED
E_QMAP03G_R14C_INSTALLED_SESSION_STALE
E_QMAP03G_R14C_SESSION_REBIND_FAILED
E_QMAP03G_R14C_OLD_GRANT_STILL_ACTIVE
E_QMAP03G_R14C_ADMISSION_DRAIN_FAILED
E_QMAP03G_R14C_PROMOTION_CANDIDATE_INVALID
E_QMAP03G_R14C_QRC02_OBJECT_MISMATCH
E_QMAP03G_R14C_QRC02_DESCRIPTOR_MISMATCH
E_QMAP03G_R14C_QRC02_DRAIN_FAILED
E_QMAP03G_R14C_QRC02_NOT_QUIESCENT
E_QMAP03G_R14C_QRC02_DEMOTION_PREPARE_FAILED
E_QMAP03G_R14C_QSR03G_BRIDGE_MISMATCH
E_QMAP03G_R14C_QSR03G_NOT_STAGED
E_QMAP03G_R14C_QSR03G_ACTIVATION_PREPARE_FAILED
E_QMAP03G_R14C_WRITER_LEASE_FAILED
E_QMAP03G_R14C_COMMIT_CAPABILITY_INVALID
E_QMAP03G_R14C_COMMIT_CAPABILITY_EXPIRED
E_QMAP03G_R14C_COMMIT_CAPABILITY_REPLAY
E_QMAP03G_R14C_COMMIT_NOT_AUTHORIZED
E_QMAP03G_R14C_GLOBAL_COMPARE_FAILED
E_QMAP03G_R14C_GLOBAL_DESCRIPTOR_WRITE_FAILED
E_QMAP03G_R14C_GLOBAL_POSTWRITE_VERIFY_FAILED
E_QMAP03G_R14C_MISSING_BRIDGE_INTERVAL
E_QMAP03G_R14C_DUAL_PRODUCT_AUTHORITY
E_QMAP03G_R14C_QSR03G_ACTIVATION_COMMIT_FAILED
E_QMAP03G_R14C_QRC02_DEMOTION_COMMIT_FAILED
E_QMAP03G_R14C_EXACT_ROLLBACK_FAILED
E_QMAP03G_R14C_PROMOTION_RECEIPT_INVALID
E_QMAP03G_R14C_ACTIVATION_BINDING_INVALID
E_QMAP03G_R14C_ROLLBACK_CAPSULE_INVALID
E_QMAP03G_R14C_PREVIEW_BINDING_FORBIDDEN
E_QMAP03G_R14C_EXPORT_BINDING_FORBIDDEN
E_QMAP03G_R14C_QMAP_EXECUTION_FORBIDDEN
E_QMAP03G_R14C_STARTUP_CANARY_REPLACEMENT_FORBIDDEN
E_QMAP03G_R14C_PHYSICAL_PROMOTION_REQUIRED
```

## 27. Required implementation surfaces

TypeScript:

```text
app/src/runtime/qmap/qmap-product-promotion-types.ts
app/src/runtime/qmap/qmap-product-promotion-service.ts
app/src/runtime/qmap/qmap-product-promotion-coordinator.ts
app/src/runtime/qmap/qmap-product-activation-binding.ts
app/src/runtime/qmap/qmap-product-rollback-capsule.ts
app/src/runtime/qmap/qmap-product-promotion-receipt.ts
app/src/runtime/admission/qmap-route-promotion-rebind.ts
```

Runtime JavaScript:

```text
qmap_streaming_reduction_03_r14c_contract.mjs
qmap_streaming_reduction_03_r14c_bridge_identity.mjs
qmap_streaming_reduction_03_r14c_descriptor_authority.mjs
qmap_streaming_reduction_03_r14c_lifecycle_prepare.mjs
qmap_streaming_reduction_03_r14c_atomic_promotion.mjs
qmap_streaming_reduction_03_r14c_promotion_candidate.mjs
qmap_streaming_reduction_03_r14c_promotion_receipt.mjs
qmap_streaming_reduction_03_r14c_activation_binding.mjs
qmap_streaming_reduction_03_r14c_rollback_capsule.mjs
```

Electron Main:

```text
app/electron/qmap-streaming-reduction-03g-r14c/product-bootstrap-authority.mjs
app/electron/qmap-streaming-reduction-03g-r14c/promotion-ipc-coordinator.mjs
app/electron/qmap-streaming-reduction-03g-r14c/installed-session-rebind.mjs
app/electron/qmap-streaming-reduction-03g-r14c/transaction-receipt.mjs
```

Required parent modifications include the QRC02 and QSR03G lifecycle methods, R14B service activation state, installed-admission drain/rebind, R11A Main session authority, preload, environment types, runtime tokens/modules and Electron bootstrap.

## 28. Source and physical gates

```text
Source Gates = 320
Negative Controls = 144
Physical C-gate definitions = 80
```

Source gates cover identity and boundary, Main authority, one-shot capability, admission drain, exact QRC02 drain, staged QSR03G verification, two-phase lifecycle, exact CAS, lifecycle commit, promotion receipt, session rebind, activation binding, rollback preservation, abort handling, zero consumer/GPU expansion, A-R14B regressions and completion state.

Physical families:

```text
C001-C008   Main bootstrap authority
C009-C016   exact candidate and descriptor upgrade
C017-C024   installed-admission drain
C025-C032   QRC02 quiescence
C033-C040   two-phase lifecycle preparation
C041-C048   global compare-and-swap
C049-C056   lifecycle commit and promotion receipt
C057-C064   session-generation rebind
C065-C072   rollback preservation
C073-C080   no-consumer/no-GPU final boundary
```

Expected physical accounting:

```text
Main bootstrap authorities = 1
writer leases = 1
promotion transactions = 1
commit capabilities issued/consumed = 1/1
admission drains = 1
QRC02 drains = 1
global bridge writes = 1
global bridge deletes = 0
missing bridge observations = 0
dual active observations = 0
QSR03G activation commits = 1
QRC02 demotion commits = 1
installed session rebinds = 1
session generation delta = +1
old-generation grant rejection tests = 1
rollback capsules = 1
QMap operations = 0
queue submissions = 0
AFT00 publications = 0
final surfaces = 0
```

## 29. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R14C_
MAIN_TO_RENDERER_PRODUCT_BOOTSTRAP_AUTHORITY_
SINGLE_PRODUCT_WRITER_LEASE_
ONE_SHOT_COMMIT_CAPABILITY_
INSTALLED_ADMISSION_ROUTE_DRAIN_
EXACT_QRC02_OBJECT_AND_DESCRIPTOR_CAPTURE_
QRC02_QUIESCENCE_
TWO_PHASE_QRC02_DEMOTION_
TWO_PHASE_QSR03G_ACTIVATION_
ATOMIC_GLOBAL_BRIDGE_COMPARE_AND_SWAP_
INSTALLED_SESSION_GENERATION_REBIND_
PRODUCT_ACTIVATION_BINDING_
PRIVATE_ROLLBACK_DESCRIPTOR_PRESERVATION_
ZERO_PREVIEW_EXPORT_BINDING_
AWAITING_PACKAGED_ATOMIC_PRODUCT_PROMOTION
```

Required source facts:

```text
Source Gates = 320/320
Negative Controls = 144/144
Physical C gates = 80 definitions
planned Main authorities = 1
planned writer leases = 1
planned global bridge writes = 1
planned QSR03G activation commits = 1
planned QRC02 demotion commits = 1
planned session rebinds = 1
QMap operations = 0
queue submissions = 0
AFT00 publications = 0
Preview bindings = 0
Export bindings = 0
physical C gates executed = 0/80
real packaged global promotion = false
```

## 30. Physical completion state

```text
PACKAGED_ATOMIC_PRODUCT_BRIDGE_PROMOTION_BAKED_
QMAP_STREAMING_REDUCTION_03G_R14C_
MAIN_RENDERER_AUTHORITY_BOUND_
INSTALLED_ADMISSION_DRAINED_
QRC02_QUIESCENT_
EXACT_PREVIOUS_OBJECT_AND_DESCRIPTOR_VERIFIED_
ONE_SHOT_COMMIT_CAPABILITY_CONSUMED_
ONE_GLOBAL_COMPARE_AND_SWAP_
REAL_QSR03G_BRIDGE_ACTIVE_PRODUCT_
QRC02_QUALIFICATION_ONLY_
ZERO_MISSING_BRIDGE_INTERVAL_
ZERO_DUAL_PRODUCT_AUTHORITY_
INSTALLED_SESSION_GENERATION_REBOUND_
ROLLBACK_DESCRIPTOR_PRESERVED_
ZERO_QMAP_EXECUTION_
ZERO_PREVIEW_EXPORT_BINDING_
READY_FOR_REAL_EFC_PRODUCT_TRANSACTION
```

## 31. Package policy

The code ZIP contains the Main bootstrap authority, preload/IPC surface, Renderer promotion service/coordinator, two-phase lifecycle support, exact CAS, installed-admission drain and session rebind, activation and promotion receipts, rollback capsule, C001-C080 definitions and source/physical tools.

The ZIP excludes this specification, private keys, real product permits, generated C receipts, physical C Merkle/receipt, real packaged promotion receipts, session and operation-grant MAC values, reports, logs, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 32. Next boundary

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R14D

Real EFC Final-Surface Producer /
Active QSR03G Product Request /
Live Final-EWA Invocation /
Product-Eligible AFT00 Publication /
Exact QMap·QWave Pin Set /
Bakemono Dispatch /
Surface Registry Publication /
Single Pipeline Final Writer /
No Preview·Export Consumer Binding Yet Seal
```

R14D may call the active bridge through an internal product-fixture authority and must produce the first real QMap field and real EFC final surface before Preview or Export consumes the route.

## 33. Final seal

R14C is the authority switch.

R14B's real QSR03G bridge remains private and staged until Main issues one Renderer-bound, session-bound, package-bound and generation-bound one-shot commit capability.

Installed admission blocks new grants. QRC02 drains to zero operations, zero warm entries and zero pins. QRC02 enters `DEMOTION_PREPARED`; QSR03G enters `ACTIVATION_PREPARED`.

The global property must still contain the exact captured QRC02 object under the exact captured descriptor. One `Object.defineProperty` call replaces it with the exact R14B bridge. There is no delete, null interval or second bridge writer.

QSR03G commits `ACTIVE_PRODUCT`; QRC02 commits `QUALIFICATION_ONLY`. Main verifies the promotion receipt and reissues the same installed session at generation `N+1`. Every old-generation grant becomes stale.

The exact QRC02 object and previous descriptor remain in one private rollback capsule. R14C executes no QMap workload, publishes no AFT00 field and binds neither Preview nor Export.

R14C ends when the real QSR03G bridge owns the global product-route slot and the installed session is rebound to that exact promotion.
