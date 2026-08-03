# TDT-QMAP-STREAMING-REDUCTION-03G-R12

## Changed-Package Installed Update Physical Closure / Target R9 Physical Admission Verification / Target R10 Product Permit Rotation / Atomic Package and Product-Route Generation Switch / Previous-Package Retention / Cross-Version QRC02 Recovery / Failed-Target Automatic Reversion / No Fleet-Wide Promotion Claim Yet Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R12
Short ID = QSR03G-R12
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R11
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

Required parent source state:

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R11_TEN_BOOT_PRODUCT_PERMIT_PERSISTENCE_MIXED_1080P_4K_8K_PRODUCT_WORKLOAD_CONCURRENT_PREVIEW_EXPORT_SINGLE_FLIGHT_SUSTAINED_RESOURCE_PLATEAU_PRODUCT_DEVICE_LOSS_RECOVERY_INSTALLED_SESSION_REBIND_SAME_CONTENT_UPDATE_REVALIDATION_DRIFTED_TARGET_REJECTION_AUTOMATIC_QRC02_ROLLBACK_R10_SIGNING_AUTHORITY_UNCHANGED_AWAITING_PACKAGED_PRODUCT_SOAK_EXECUTION
```

R12 validates one local installed update from admitted **Package A** to a genuinely changed **Package B**.

```text
Package B content ID != Package A content ID
```

Package B must carry its own complete R9 P001-P096 physical-admission evidence and its own R10 product-promotion permit. R12 may invoke the unchanged R10 `PRODUCT_PROMOTION` signing authority only after independently verifying Package B's R9 evidence root.

R12 does not rotate the product key, rewrite Package A authority, delete Package A, or claim fleet-wide rollout.

## 1. Update lineage

```text
Package A R9 admission
→ Package A R10 permit and route pointer
→ Package B immutable staging
→ Package B R9 P001-P096 verification
→ Package B admission pin
→ unchanged R10 product signer acquisition
→ Package B permit signing and readback verification
→ Package A retention seal
→ Package A QSR03G drain
→ Package B hidden activation
→ Package B 8/8 EFC canary
→ Package B package-scoped route pointer
→ atomic installed-product bundle commit
→ Package B installed session
→ fresh Package B boot
```

Failed-target lineage:

```text
Package B canary PASS
→ Package B bundle commit
→ injected session failure before normal work
→ Package B QSR03G drain
→ exact Package B QRC02 restoration
→ rollback bundle generation
→ retained Package A relaunch
→ Package A 8/8 recovery canary
→ new Package A session
→ Package B retry with same permit and new generations
```

## 2. State ownership and SSOT

```text
Package A authority
= immutable source package, R9 admission, R10 permit and A route pointer

Package B authority
= target package, target R9 admission, target permit and B route pointer

R10 product signing authority
= unchanged Ed25519 PRODUCT_PROMOTION key and public-key digest

installed-product bundle pointer
= launcher-visible atomic package + product-route selection SSOT

durable generation ledger
= cross-process install, product-route and bundle generation authority

previous-package retention
= Package A rollback-ready content and authority seal

update writer
= one durable package/route transition writer
```

Package-scoped route pointers remain separate. The launcher does not choose a package and product route independently.

## 3. Mandatory parent corrections

### 3.1 Target verification is physical, not summary-based

R11's changed-target summary is replaced by direct verification of:

```text
Package B P001-P096 receipt files
preliminary 88-leaf Merkle
signed preliminary admission
trial permit and consumption
preliminary-prefix proof
final 96-leaf Merkle
signed physical admission
post-write verification
product-denial receipt
package closure and artifact manifest
```

No target `admitted`, `pass`, or aggregate summary boolean has authority.

### 3.2 Durable generations

R10 process-local promotion counters cannot govern cross-process package updates. R12 adds a durable generation ledger.

```text
failed target route generation > source route generation
failed target bundle generation > source bundle generation
rollback bundle generation > failed target bundle generation
successful retry route generation > failed target route generation
successful retry bundle generation > rollback bundle generation
```

A process restart may not reset these values.

### 3.3 Package and route commit together

The atomic bundle binds:

```text
active package content ID and path
active install generation
active R9 admission and 96-leaf root
active R10 product permit
active package-scoped route pointer
active product-route generation
QSR03G implementation digest
QRC02 rollback implementation digest
previous bundle digest
previous-package retention digest
transition transaction ID
```

No state may expose Package B with Package A's route or Package A with Package B's route.

### 3.4 Permit rotation is not key rotation

```text
source product signing key ID = target product signing key ID
source public-key digest = target public-key digest
algorithm = Ed25519
source permit digest != target permit digest
source permit writes = 0
target permit writes = 1
```

### 3.5 Cross-version QRC02 boundaries

Package A and Package B each own their package-bound QRC02 implementation.

```text
Package A QRC02 object never enters Package B
Package B QRC02 object never enters Package A
cross-process object identity claim = false
warm state sharing across versions = false
```

Within one process, rollback restores that process's exact QRC02 object and descriptor. Across relaunch, continuity is proved by package and implementation digests.

## 4. Target package staging

Package B is staged outside the active Package A directory.

Required:

```text
absolute canonical path
content-addressed directory
symlinks = 0
junctions = 0
reparse redirections = 0
package closure sealed
target evidence root read-only
target inactive during staging
```

Package B files may not change between target admission verification and bundle commit.

## 5. Target R9 physical-admission verification

R12 independently verifies:

```text
P receipt count = 96
P order = P001-P096
preliminary tree size = 88
final tree size = 96
preliminary and final roots rebuilt from installed receipt files
preliminary and physical signatures valid
trial permit and consumption valid
preliminary prefix unchanged
post-write verification valid
product-denial receipt valid
package closure and manifest valid
```

The resulting target admission pin binds Package B's package identity, R9 run, final root, physical-admission bytes/signature, post-write verification, runtime/shader/ABI/device profile and both target implementation digests.

Before the target R10 permit:

```text
target normal product boot admitted = false
target product permit present = false
```

## 6. Target R10 product permit rotation

The unchanged R10 finalizer signs one Package B permit.

The target permit binds:

```text
Package B R9 physical admission
Package B final 96-leaf root
Package B package closure
Package B runtime bridge, composition root, shader and ABI digests
device profile
Package B QSR03G implementation
Package B QRC02 rollback implementation
normalProductBootAdmitted = true
rollbackAllowed = true
singleProductWriterRequired = true
```

Required counts:

```text
target permit signatures = 1
target permit readback verifications = 1
source permit writes = 0
product key rotations = 0
```

## 7. Previous-package retention

Before source drain, R12 seals Package A as `ROLLBACK_READY`.

Retention binds:

```text
Package A canonical path and content ID
Package A closure
Package A R9 admission
Package A R10 permit
Package A route pointer
Package A QSR03G and QRC02 digests
Package A launch envelope
```

Required:

```text
retained previous packages = 1
Package A mutations = 0
Package A deletions = 0
Package A permit rewrites = 0
Package A pointer rewrites = 0
Package A launchable = true
```

R12 does not authorize Package A garbage collection.

## 8. Single changed-package writer

One durable writer lock spans:

```text
target staging
R9 verification
permit signing
retention
source drain
target launch and canary
bundle commit
session issuance
reversion and retry
```

Required maxima:

```text
active update writers <= 1
active bundle writers <= 1
active target activation capabilities <= 1
```

Target activation capabilities are process-bound, webContents-bound, expiry-bound and single-use. They bind the expected current bundle digest and assigned target route/bundle generations.

## 9. Source Package A drain

Before Package B launch:

```text
new sessions and operation grants blocked
active Package A operations = 0
FIFO and single-flight jobs = 0
warm entries = 0
Analysis pins = 0
final surfaces = 0
completion tickets = 0
```

Package A QSR03G ends `QUIESCENT`. Its exact QRC02 object and descriptor are restored to `ACTIVE_PRODUCT`. The source installed session is revoked.

## 10. Hidden Package B activation

Package B starts hidden.

```text
Package B QRC02 = QUALIFICATION_ONLY
Package B QSR03G = STAGED
normal user work = false
BrowserWindow visible = false
```

Target canary:

```text
geometry = 1920 × 1080
QSR03G QMap = 5 submissions / 5 fences
QWave real = 1 / 1
QWave analytic = 1 / 1
EFC graph = 1 / 1
aggregate = 8 / 8
final surfaces = 1
QRC02 product executions = 0
WebGPU validation errors = 0
```

Canary PASS creates a package-scoped Package B route pointer. It does not become launcher-active until the bundle pointer commits.

## 11. Atomic installed-product bundle commit

Before commit:

```text
active bundle = Package A
target route pointer = Package B commit-ready
target installed session = absent
```

After one compare-and-swap bundle commit:

```text
active package = Package B
active product route = Package B QSR03G
active permit = Package B permit
active route pointer = Package B package-scoped pointer
Package B QRC02 = QUALIFICATION_ONLY
Package A = retained rollback package
```

Bundle publication uses temporary file, file fsync, atomic rename and parent-directory fsync.

## 12. Failed-target post-commit fixture

The first Package B activation completes its 8/8 canary and bundle commit. A fault is then injected:

```text
AFTER_BUNDLE_COMMIT
AFTER_QSR03G_ACTIVATION
BEFORE_INSTALLED_SESSION_ISSUANCE
BEFORE_BROWSER_WINDOW_SHOW
```

Required failed-target facts:

```text
installed sessions = 0
normal user operations = 0
Preview grants = 0
Export grants = 0
BrowserWindow shows = 0
```

Package B QSR03G drains and shuts down. Temporary fields and surfaces retire. The exact Package B QRC02 object and descriptor restore to `ACTIVE_PRODUCT`, and the Package B process exits.

## 13. Automatic Package A reversion

A new rollback bundle generation selects retained Package A.

```text
active package = Package A
active permit = unchanged Package A permit
active route pointer = unchanged Package A pointer
bundle generation > failed Package B bundle generation
rollback reason = TARGET_INSTALLED_SESSION_FAILURE
```

Package A is relaunched and independently verifies its authority. Its recovery canary executes 8/8 and a new installed session is issued. Old Package A sessions and operation grants remain invalid.

## 14. Successful Package B retry

The retry uses:

```text
same verified Package B permit
new activation capability and nonce
new target process identity
new target product-route generation
new target bundle generation
```

The retry canary executes 8/8. The Package B bundle commits and a Package B installed session becomes active.

A fresh Package B process then independently verifies the committed bundle and runs another 8/8 startup canary before showing its BrowserWindow.

## 15. Session and grant invalidation

Every installed session binds:

```text
package content ID
install generation
R10 product-route generation
R12 bundle generation
product permit and route pointer digests
final physical Merkle root
device epoch
implementation digests
```

Sessions and grants are rejected if their package, process, install generation, bundle generation, route generation, device epoch or session generation is stale.

Rollback never reactivates an old Package A session.

## 16. TOCTOU checkpoints

Target closure is checked at DP00-DP12:

```text
before and after target R9 verification
before signer acquisition and permit signing
after permit readback
before source drain and target launch
before target bridge install
after target canary
before and after bundle commit
before target session issuance
during fresh target boot
```

Any mismatch fails the transition.

## 17. Physical fixture matrix

### FT: failed Package B then automatic reversion

```text
Package B canary = 8/8
Package B temporary surfaces = 1
Package B bundle commits = 1
injected session failures = 1
Package B normal window shows = 0
Package B QRC02 restorations = 1
Package A rollback bundle commits = 1
Package A recovery canary = 8/8
Package A recovery surfaces = 1
```

### ST: successful Package B retry

```text
Package B retry canary = 8/8
Package B successful bundle commits = 1
Package B installed sessions = 1
Package B BrowserWindow shows = 1
final surfaces = 1
```

### FB: fresh Package B boot

```text
bundle, permit and target R9 root verification = PASS
startup canary = 8/8
installed sessions = 1
BrowserWindow shows = 1
final surfaces = 1
```

Aggregate:

```text
target permit signatures = 1
target candidate canaries = 2
Package A recovery canaries = 1
fresh Package B boot canaries = 1
submissions / fences = 32 / 32
converged canary surfaces = 4
failed target activations = 1
automatic package reversions = 1
successful Package B activations = 1
fresh Package B boots = 1
successful installed sessions = 3
active bundle commits = 3
```

The three bundle commits are the failed Package B commit, Package A rollback commit and successful Package B retry commit.

## 18. Resource and WebGPU closure

After every canary and failed process exit:

```text
private QSR03G buffers and textures = 0
EFC-private resources = 0
temporary final-surface pins = 0
unsettled submission tickets = 0
open operation grants = 0
```

Across 32 submissions:

```text
shader compilation errors = 0
validation/internal/OOM errors = 0
uncaptured errors = 0
unexpected device losses = 0
bind-group/encoding/submission errors = 0
nonfinite output = 0
```

The failed-target fault is a session-authority injection after a successful GPU canary, not a GPU failure.

## 19. Final package state

After successful Package B activation:

```text
active package = Package B
active product route = Package B QSR03G
Package B QRC02 = QUALIFICATION_ONLY
retained previous package = Package A
Package A retention state = ROLLBACK_READY
Package A mutations = 0
Package A deleted = false
active normal packages = 1
active product bridges = 1
retained rollback packages = 1
```

## 20. U001-U104 physical gate families

```text
U001-U008   source Package A authority
U009-U016   target package and R9 admission
U017-U024   target R10 permit rotation
U025-U032   durable generations and retention
U033-U040   source drain and handoff
U041-U048   failed target activation
U049-U056   failed-target automatic reversion
U057-U064   successful target retry
U065-U072   atomic package and route switch
U073-U080   fresh Package B boot
U081-U088   cross-version QRC02 and session isolation
U089-U096   aggregate workload and validation
U097-U104   final changed-package seal
```

U receipts form a separate domain-separated 104-leaf changed-package Merkle. They do not modify the R9 P, R10 Q or R11 R trees.

## 21. Source gate and mutant contract

```text
Source Gates = 400
Negative Controls = 176
Physical update gate definitions = 104
```

Source gates cover Package A/B separation, target R9 verification, target pin and permit, signer invariance, durable generations, retention, one writer, source drain, hidden target activation, target canary, package-scoped route pointer, bundle CAS, failed-target reversion, successful retry, fresh boot, TOCTOU, aggregate accounting, evidence authority and A-R11 regressions.

Negative controls cover unchanged target identity, redirected paths, forged target R9 roots/signatures, early or rotated signer access, source permit mutation, generation reuse/reset, missing retention, parallel writers, incomplete source drain, early target work/window/session, wrong canary counts, split package/route commits, stale sessions/grants, target QRC02 mix-ups, failed reversion, incorrect aggregate counts, private-key leakage and false fleet-wide claims.

## 22. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R12_CHANGED_PACKAGE_TARGET_STAGING_TARGET_R9_PHYSICAL_ADMISSION_VERIFIER_UNCHANGED_R10_PRODUCT_SIGNER_TARGET_PRODUCT_PERMIT_ROTATION_DURABLE_CROSS_PROCESS_GENERATIONS_PACKAGE_SCOPED_PRODUCT_ROUTE_POINTERS_ATOMIC_INSTALLED_PRODUCT_BUNDLE_PREVIOUS_PACKAGE_RETENTION_POST_COMMIT_FAILED_TARGET_INJECTION_CROSS_VERSION_QRC02_RECOVERY_AUTOMATIC_PACKAGE_A_REVERSION_SUCCESSFUL_PACKAGE_B_RETRY_NO_FLEET_WIDE_PROMOTION_AWAITING_PACKAGED_CHANGED_PACKAGE_EXECUTION
```

Required source facts:

```text
Source Gates = 400/400
Negative Controls = 176/176
Physical U-gate definitions = 104
Changed package pairs = 1
Target R9 physical tree size = 96 expected
Target product permit definitions = 1
Target candidate canaries = 2
Source recovery canaries = 1
Fresh target boot canaries = 1
Expected submissions / fences = 32/32
Expected final surfaces = 4
Real product signer acquisitions = 0
Real target product permits = 0
Real installed-product bundle writes = 0
Physical U gates executed = 0/104
Fleet-wide promotion = false
```

Source fixtures use ephemeral in-memory signing keys, temporary package roots and fake process/global objects. They are not physical changed-package evidence.

## 23. Physical completion state

```text
PACKAGED_CHANGED_PACKAGE_UPDATE_PHYSICAL_BAKED_QMAP_STREAMING_REDUCTION_03G_R12_PACKAGE_A_AUTHORITY_VERIFIED_PACKAGE_B_R9_ADMISSION_VERIFIED_PACKAGE_B_R10_PERMIT_SIGNED_AND_VERIFIED_UNCHANGED_PRODUCT_SIGNING_KEY_DURABLE_GENERATION_SWITCH_PREVIOUS_PACKAGE_A_RETAINED_FAILED_PACKAGE_B_POST_COMMIT_REVERTED_CROSS_VERSION_QRC02_RECOVERY_PACKAGE_A_RECOVERY_BOOT_SUCCESSFUL_PACKAGE_B_RETRY_FRESH_PACKAGE_B_BOOT_ATOMIC_PACKAGE_AND_PRODUCT_ROUTE_SWITCH_ZERO_PACKAGE_ROUTE_SPLIT_ZERO_PRIVATE_RESOURCE_LEAK_NO_FLEET_WIDE_PROMOTION_CLAIM
```

Required physical facts later:

```text
U gates = 104/104
target P receipts verified = 96/96
target permits signed / verified = 1/1
product key rotations = 0
target candidate canaries = 2
source recovery canaries = 1
fresh target boot canaries = 1
real submissions / fences = 32/32
converged surfaces = 4
failed target activations = 1
automatic package reversions = 1
successful target activations = 1
fresh target boots = 1
successful installed sessions = 3
source permit writes = 0
target permit writes = 1
active bundle commits = 3
retained previous packages = 1
final active package = Package B
final active route = Package B QSR03G
final Package B QRC02 = QUALIFICATION_ONLY
Package A = ROLLBACK_READY
terminal private-resource balance = 0
WebGPU validation errors = 0
fleet-wide promotion = false
```

## 24. Package policy

The code ZIP contains source/target package authorities, target R9 verifier, target pin and permit rotation, durable generation ledger, package-scoped route pointers, installed-product bundle pointer, previous-package retention, single writer, target capability/canary/session, failed-target recovery, cross-version QRC02 authority, U001-U104 definitions, source validators and physical launcher/verifier.

The code ZIP excludes this specification, private keys, real source/target permits, real bundle pointers, generated U receipts, changed-package Merkle, physical update receipt, logs, reports, temporary package roots, user data, nested ZIPs and Git metadata.

The GitHub commit contains this specification only.

## 25. No fleet-wide promotion boundary

R12 validates:

```text
one machine
one Package A
one changed Package B
one R10 product signing authority
one admitted device profile
one local installation lineage
```

It does not validate rollout cohorts, multiple machines, multiple GPU profiles, remote attestation distribution, CDN propagation or automatic old-package cleanup.

## 26. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R13

Changed-Package Post-Update Product Soak /
Ten-Boot Target Permit Persistence /
Cross-Version Mixed Workload /
Target Product Device-Loss Recovery /
Previous-Package Rollback Exercise /
Retention Release Admission /
Multi-Profile Update Qualification /
No Fleet-Wide Promotion Claim Yet Seal
```

R13 may validate sustained Package B operation and the conditions required before Package A retention can be released. It may not delete Package A until retention-release gates physically pass.

## 27. Final seal

```text
R12 does not treat installation selection as product admission.

Package B carries and proves its own R9 P001-P096 physical closure before the
unchanged R10 product signer is available.

The signing key does not rotate. The permit changes because the package,
admission and implementation digests change.

Package and product-route selection commit together through one durable bundle.
The first Package B activation passes its GPU canary and commits, then fails
before session issuance or window visibility. Package B drains and restores its
own QRC02 authority.

A new bundle generation relaunches retained Package A. Its unchanged permit is
reverified, its recovery canary passes and a new session is issued. Old sessions
never reactivate.

Package B retries with the same permit but new route and bundle generations.
The retry succeeds and a fresh Package B process verifies the committed state.

Package A remains immutable, launchable and rollback-ready.
Package A and Package B never share QRC02 objects.

R12 closes one local changed-package update lineage. It makes no fleet-wide
promotion claim.
```
