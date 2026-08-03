# TDT-QMAP-STREAMING-REDUCTION-03G-R10

## Signed Product Promotion Permit / Pinned Physical Admission Verification / Atomic Global QSR03G Bridge Promotion / QRC02 Qualification-Only Demotion / Normal Packaged Product Boot / Post-Promotion EFC Product Smoke / Admission-Drift Rollback / Single Product Writer Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R10
Short ID = QSR03G-R10
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R9
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

Required parent source state:

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R9_NON_BOOLEAN_P001_P096_PREDICATES_SIX_PHYSICAL_EVIDENCE_PACK_VERIFIERS_PRELIMINARY_88_LEAF_DISK_REBUILD_ROLE_BOUND_PRELIMINARY_SIGNING_SIGNATURE_VERIFIED_ONE_SHOT_TRIAL_PERMIT_ISOLATED_QSR03G_PROMOTED_ROUTE_TRIAL_PRELIMINARY_PREFIX_IMMUTABILITY_FINAL_96_LEAF_DISK_REBUILD_SIGNED_PHYSICAL_ADMISSION_AUTHORITY_PRODUCT_PERMIT_DENIAL_AWAITING_PACKAGED_PHYSICAL_ADMISSION_EXECUTION
```

R10 is the only patch allowed to convert an independently verified R9 physical admission into normal packaged product-route authority.

R10 may load the `PRODUCT_PROMOTION` signing authority and may issue the final product-promotion permit only after rebuilding and verifying the complete P001-P096 evidence closure.

## 1. Authority boundary

```text
R9 evidence root
→ independent 96-leaf rebuild
→ R9 signature and post-write verification
→ pinned physical-admission receipt
→ PRODUCT_PROMOTION signer acquisition
→ signed product permit
→ canonical permit readback verification
→ exclusive product-writer lease
→ QRC02 drain
→ staged QSR03G bridge
→ atomic global bridge compare-and-swap
→ QRC02 QUALIFICATION_ONLY
→ post-promotion EFC product smoke
→ active product-route pointer
→ fresh installed-strict product boot
```

Admission drift after commit follows:

```text
block new work
→ drain QSR03G
→ retire warm fields, pins and final surfaces
→ restore the exact previous QRC02 bridge object and descriptor
→ revoke the installed session
→ roll back the active route pointer
```

## 2. Mandatory corrections

The R9 verification receipt alone is not trusted. R10 independently verifies all 96 P receipts, preliminary and final Merkle roots, the preliminary-prefix proof, trial permit and consumption, R9 physical-admission signature, post-write verification, product-denial receipt, package closures and noncircular artifact manifest.

Product signer acquisition is forbidden before the pinned verification receipt is sealed and read back.

Product permit verification uses canonical JSON, Ed25519, a pinned product public-key digest, `selfSha256` recomputation, `permitDigest` recomputation and exact admission/package/runtime/shader/ABI/device/implementation bindings. Shape-only or `JSON.stringify()` authorization is forbidden.

A raw permit object has no renderer authority. Main issues one renderer-bound, one-use `ProductRouteCommitCapability` tied to process, webContents, package, promotion generation, permit digest, previous bridge descriptor and staged bridge identity.

The old route selector's empty-key installation rule cannot promote over an installed QRC02 bridge. R10 adds one compare-and-swap writer that replaces the exact QRC02 property descriptor with the exact staged QSR03G bridge without a missing-bridge interval.

## 3. State ownership and SSOT

```text
R9 evidence root
= immutable physical-admission evidence

pinned admission
= exact R9 files, roots, signatures and package identity

signed product permit
= product eligibility for one exact package and implementation set

active route pointer
= committed product generation used by normal packaged boot

Main writer
= writer lock, generation, capability, pointer and rollback authority

renderer writer
= one capability-bound global property mutation

QRC02
= drain, quiescence, qualification-only and restore lifecycle

QSR03G
= staged, active-product, draining, quiescent and shutdown lifecycle

installed admission
= authority to begin normal preview/export work
```

## 4. Pinned R9 physical admission

R10 binds:

```text
96 P-gate receipt file hashes
final 96-leaf Merkle root
R9 physical-admission file digest, self hash and signature digest
R9 signing-key ID and public-key digest
post-write verification digest
preliminary-prefix proof digest
trial-consumption digest
product-denial digest
package-after and comparison digests
artifact-manifest digest
R9 execution-plan and gate-registry digests
runtime bridge, composition root, shader, ABI and device-profile digests
12 family evidence digests
```

Required flags:

```text
physicalAdmissionVerified = true
physicalTreeSize = 96
normalProductBootAdmitted = false
productPromotionPermitPresentBeforeR10 = false
```

## 5. Product signing and permit

The product signer uses Ed25519 under the role `PRODUCT_PROMOTION`.

```text
PRODUCT_PROMOTION key != PHYSICAL_ADMISSION key
PRODUCT_PROMOTION key != QUALIFICATION_TRIAL key
```

Private keys remain outside the package, evidence roots, renderer, source ZIP and Git repository.

The signed permit binds the R9 admission, final root, package closure, execution plan, runtime/shader/ABI/device identities, QSR03G implementation digest, QRC02 rollback implementation digest, all family digests, product service and bridge key.

```text
promotedImplementation = QSR03G
qualificationOnlyImplementation = QRC02
normalProductBootAdmitted = true
rollbackAllowed = true
singleProductWriterRequired = true
promotionState = ADMITTED
```

The permit is read from disk and verified before any route mutation.

## 6. Single product writer

```text
maximum active Main writers = 1
maximum active promotion transactions = 1
maximum renderer commit capabilities = 1
maximum active pointer writers = 1
```

The writer lock covers operation blocking, QRC02 drain, QSR03G staging, global replacement, product smoke, pointer commit and rollback.

No ordinary feature, preview, export, boot or route-selection module may write `globalThis.__DADUM_QMAP_RUNTIME_BRIDGE__`.

## 7. QRC02 lifecycle

```text
ACTIVE_PRODUCT
→ DRAINING_PRODUCT
→ QUIESCENT
→ QUALIFICATION_ONLY
```

During drain, new QRC02 product requests and warm deliveries are rejected while existing work terminalizes.

Before promotion:

```text
QRC02 in-flight operations = 0
QRC02 warm fields = 0
QRC02 active pins = 0
QRC02 completion tickets = 0
```

In `QUALIFICATION_ONLY`, stale QRC02 references cannot execute product work. Explicit qualification execution requires a separate bounded qualification capability.

QRC02 remains packaged for qualification and rollback. It is not deleted.

## 8. QSR03G lifecycle

```text
STAGED
→ ACTIVE_PRODUCT
→ DRAINING
→ QUIESCENT
→ SHUTDOWN
```

The staged bridge binds the exact permit digest, package ID, promotion generation and implementation digest. It begins with zero FIFO entries, zero single-flight jobs and zero warm entries. `qrc02Fallback` is always false.

## 9. Atomic global promotion

The writer captures the exact QRC02 object and property descriptor. The renderer capability binds their digests and the staged QSR03G identity.

Promotion requires:

```text
current bridge object = expected QRC02 object
current descriptor digest = capability-bound descriptor digest
QRC02 state = QUIESCENT
QSR03G state = STAGED
```

One synchronous `Object.defineProperty()` performs the replacement:

```text
value = exact QSR03G bridge
writable = false
enumerable = false
configurable = true
```

Required observations:

```text
global bridge writes = 1
missing-bridge observations = 0
dual-product observations = 0
```

After replacement, QSR03G becomes `ACTIVE_PRODUCT` and QRC02 becomes `QUALIFICATION_ONLY`.

## 10. Post-promotion EFC product smoke

The smoke resolves QMap through the global product key, not a candidate dependency.

```text
geometry = 1920 × 1080
QSR03G QMap submissions/fences = 5/5
QWave real = 1/1
QWave analytic = 1/1
EFC graph = 1/1
aggregate = 8/8
```

Required:

```text
one exact QMap pin
one QWave-real pin
one QWave-analytic pin
Bakemono dispatch = 240 × 135 × 1
Surface Registry registrations = 1
Pipeline final publications = 1
final-surface receipts = 1
QRC02 product requests/submissions/publications = 0/0/0
reference comparison = PASS
WebGPU validation and OOM errors = 0
```

The active product-route pointer commits only after smoke PASS.

## 11. Active product-route pointer

The pointer is stored outside the immutable package and binds the promotion generation, transaction, package, permit, R9 admission, final root, pinned admission, QSR03G and QRC02 implementation digests, promoted property descriptor and product-smoke receipt.

```text
state = COMMITTED
write protocol = temporary file + fsync + atomic rename + directory fsync
```

A signed permit without a committed active pointer does not admit normal boot.

## 12. Normal packaged product boot

A fresh process verifies the active pointer, product permit, R9 admission, final root, package closure, runtime/shader/ABI/device identities and both implementation digests before showing its BrowserWindow.

The fresh process initializes QRC02 as an internal qualification-only capability and installs QSR03G as the product bridge through the single writer.

A physical 1080p startup canary executes 8 submissions and 8 fences. Only after PASS may Main issue an installed-strict session with:

```text
qualificationOnly = false
installedAdmissionClaimed = true
normalUserWorkAllowed = true
qmapProductRoute = QSR03G
qrc02Mode = QUALIFICATION_ONLY
```

Preview and Export use the same product-route generation and cannot mutate the route.

## 13. Admission pin and drift

The process pins:

```text
package content and closure
R9 admission and final root
product permit and active pointer
promotion generation
runtime bridge and composition root
shader and ABI sets
device profile
QSR03G implementation
QRC02 rollback implementation
global property descriptor
```

Checks occur before signer acquisition, permit signing/readback, writer acquisition, QRC02 drain, global replacement, smoke, pointer commit, normal boot, session issuance and renderer readiness.

Any mismatch blocks new operations and initiates rollback. Drift cannot be downgraded to a warning or silently routed through QRC02.

## 14. Exact rollback

Rollback order:

```text
block new product work
→ wait for QSR03G operations
→ clear QSR03G warm state
→ retire QSR03G fields, pins and final surfaces
→ set QSR03G QUIESCENT
→ restore exact prior QRC02 object and descriptor
→ set QRC02 ACTIVE_PRODUCT
→ shut down removed QSR03G bridge
→ revoke installed session
→ publish rolled-back route generation
```

Restored QRC02 warm state is empty. Stale warm handles are never resurrected.

## 15. Physical fixture matrix

### PC: clean promotion

```text
initial bridge = QRC02
atomic bridge swaps = 1
product smoke = 8/8
final publications = 1
QRC02 product executions = 0
pointer commits = 1
```

### NB: fresh normal boot

```text
active pointer verification = PASS
installed mode = installed-strict
global product bridge = QSR03G
QRC02 product installs = 0
QRC02 qualification capabilities = 1
startup smoke = 8/8
normalUserWorkAllowed = true
BrowserWindow shown = true
```

### DR: admission-drift rollback

```text
initial promotion = PASS
product smoke = 8/8
drift observations = 1
QSR03G drains = 1
exact QRC02 restorations = 1
installed session revocations = 1
post-drift QSR03G submissions = 0
```

Aggregate expected physical workload:

```text
signed product permits = 1
product smoke runs = 3
submissions/fences = 24/24
converged final surfaces = 3
successful normal boots = 1
completed drift rollbacks = 1
maximum simultaneous product writers = 1
```

## 16. Q001-Q088 evidence boundary

R10 defines 88 product-promotion gates:

```text
Q001-Q008   pinned R9 admission
Q009-Q016   product permit
Q017-Q024   single product writer
Q025-Q032   QRC02 drain and demotion
Q033-Q040   atomic QSR03G promotion
Q041-Q048   post-promotion product smoke
Q049-Q056   active pointer and normal boot
Q057-Q064   installed route coherence
Q065-Q072   admission-drift rollback
Q073-Q080   aggregate workload and validation
Q081-Q088   final authority seal
```

Q receipts form a separate domain-separated 88-leaf promotion Merkle. They do not alter the R9 P001-P096 tree.

## 17. Source gate matrix

```text
Source Gates = 368
Negative Controls = 160
Physical Q-gate definitions = 88
```

Source controls cover complete R9 revalidation, pinned admission, role-separated signing, canonical permit verification, renderer-bound capability, single writer, QRC02 drain/demotion, QSR03G lifecycle, atomic bridge replacement, product smoke, pointer commit, installed boot, session binding, drift detection, exact rollback, product request authority, fixture accounting, resource closure and A-R9 regressions.

Negative controls cover trusted R9 summaries, skipped receipts, forged roots/signatures, early product-key access, cross-role keys, noncanonical verification, raw permit authority, parallel writers, incomplete QRC02 drain, stale QRC02 product calls, nonempty staging, route gaps, direct candidate smoke, premature pointer commit, boot without canary, session drift, incomplete rollback, QRC02 fallback, resource leaks and false physical promotion claims.

## 18. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R10_PINNED_R9_PHYSICAL_ADMISSION_VERIFIER_ROLE_SEPARATED_PRODUCT_SIGNING_AUTHORITY_CANONICAL_PRODUCT_PERMIT_VERIFIER_VERIFIED_RENDERER_CAPABILITY_SINGLE_PRODUCT_WRITER_QRC02_DRAIN_AND_QUALIFICATION_DEMOTION_ATOMIC_QSR03G_GLOBAL_BRIDGE_PROMOTION_NORMAL_INSTALLED_PRODUCT_BOOT_POST_PROMOTION_EFC_PRODUCT_CANARY_ADMISSION_DRIFT_ROLLBACK_AWAITING_PACKAGED_PRODUCT_PROMOTION_EXECUTION
```

Required source facts:

```text
Source Gates = 368/368
Negative Controls = 160/160
Physical promotion gate definitions = 88
R9 physical gates expected = 96
product smoke profile = 8/8
fixture groups = 3
expected aggregate submissions/fences = 24/24
real product signing keys loaded = 0
real product permits issued = 0
actual global bridge mutations = 0
physical Q gates executed = 0/88
product promotion = false
```

Source fixtures use ephemeral in-memory product keys and fake global objects. They are not physical product-promotion evidence.

## 19. Physical completion state

```text
PACKAGED_PRODUCT_PROMOTION_PHYSICAL_BAKED_QMAP_STREAMING_REDUCTION_03G_R10_R9_ADMISSION_PINNED_PRODUCT_PROMOTION_PERMIT_SIGNED_AND_VERIFIED_SINGLE_PRODUCT_WRITER_QRC02_QUALIFICATION_ONLY_ATOMIC_GLOBAL_QSR03G_PROMOTION_NORMAL_INSTALLED_PRODUCT_BOOT_THREE_PRODUCT_EFC_SMOKES_ADMISSION_DRIFT_ROLLBACK_ZERO_PRODUCT_ROUTE_AMBIGUITY_ZERO_PRIVATE_RESOURCE_LEAK_PRODUCT_PROMOTION_COMMITTED
```

Required physical facts later:

```text
Q gates = 88/88
signed and verified product permits = 1/1
clean atomic promotions = 1
successful normal installed boots = 1
product smoke runs = 3
real submissions/fences = 24/24
converged final surfaces = 3
QRC02 product executions during QSR03G smoke = 0
admission-drift observations = 1
completed QRC02 rollbacks = 1
maximum simultaneous product writers = 1
unauthorized global writes = 0
terminal private-resource balance = 0
WebGPU validation errors = 0
active clean product route = QSR03G
clean QRC02 state = QUALIFICATION_ONLY
product promotion = true
```

## 20. Package policy

The R10 code ZIP contains the independent R9 verifier, pinned-admission authority, product signing and canonical permit verification, renderer capability, single writer, QRC02 and QSR03G lifecycle authorities, atomic route transaction, normal boot, startup canary, drift/rollback, Q001-Q088 registry, source validators and physical entry/verifier.

The ZIP excludes this specification, private keys, real Q receipts, real signed product permit, active pointer, promotion Merkle, physical promotion receipt, reports, logs, temporary evidence, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 21. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R11

Post-Promotion Product Soak /
Ten-Boot Permit Persistence /
Mixed 1080p·4K·8K Product Workload /
Product Device-Loss Recovery /
Concurrent Preview·Export Stability /
Installed Update Revalidation /
Automatic QRC02 Rollback /
Sustained Product Stability Seal
```

## 22. Final seal

```text
R10 does not promote QSR03G because a signed admission file exists.

It independently rebuilds and verifies the complete R9 P001-P096 closure,
then pins the exact admission bytes.

Only after that pin is sealed may the PRODUCT_PROMOTION signer be acquired.
The permit is signed once and verified from disk with canonical JSON and a
pinned product public key.

One Main writer and one renderer capability own every product-route mutation.
QRC02 drains to zero before one compare-and-swap replaces it with the exact
staged QSR03G bridge. There is no missing bridge and no dual product authority.

QRC02 remains qualification-only and rollback-capable.

Three 8-submit product smokes cover clean promotion, fresh installed boot and
drift rollback. Normal work begins only after startup-canary PASS.

Any admission, package, shader, ABI, device-profile or implementation drift
blocks new work and restores the exact previous QRC02 authority.

R10 is the single product writer and the sole issuer of the final product
promotion permit.
```
