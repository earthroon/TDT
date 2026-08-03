# TDT-QMAP-STREAMING-REDUCTION-03G-R13

## Changed-Package Post-Update Product Soak / Ten-Boot Target Permit Persistence / Cross-Version Mixed Workload / Target Product Device-Loss Recovery / Previous-Package Rollback Exercise / Retention Release Admission / Multi-Profile Update Qualification / No Fleet-Wide Promotion Claim Yet Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R13
Short ID = QSR03G-R13
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R12
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

R13 validates sustained Package B operation after the R12 changed-package update and validates the evidence required before Package A retention may be released.

R13 does not alter the R10 product signing authority, issue a new primary product permit, delete Package A, or claim fleet-wide promotion.

## 1. Package and profile roles

```text
Package A
= PREVIOUS_PACKAGE
= initial retention state ROLLBACK_READY
= immutable, launchable and independently admitted

Package B
= ACTIVE_TARGET_PACKAGE
= active through the committed R12 installed-product bundle

Profile-0
= PRIMARY_PRODUCT
= normal installed product profile

Profile-1
= SECONDARY_QUALIFICATION
= hidden and qualification-only
= no installed normal session or normal BrowserWindow
```

Required profile relationships:

```text
Profile-0 deviceProfileDigest != Profile-1 deviceProfileDigest
Profile-0 adapterIdentityDigest != Profile-1 adapterIdentityDigest
profile package content IDs = Package B
runtime, composition, shader, ABI and implementation digests = identical
product signing key ID and public-key digest = identical
signing algorithm = Ed25519
```

## 2. Core authority invariant

Package B Profile-0 retains one immutable authority tuple:

```text
R9 physical-admission digest
final P001-P096 root
primary R10 product permit
product public key
package-scoped route pointer
installed-product bundle
package content and closure
runtime, composition, shader and ABI digests
QSR03G implementation digest
QRC02 rollback implementation digest
```

Bundle, product-route, session and device generations may advance only through their owning authorities. The primary permit does not change and the product signer remains unloaded.

## 3. Retention state machine

R13 adds:

```text
ROLLBACK_READY
-> RELEASE_EVALUATING
-> RELEASE_ADMITTED_NOT_DELETED
```

R13 forbids `DELETED`, deletion capabilities, garbage-collection permits and Package A file removal.

Release admission is not deletion authority.

## 4. Ten-boot Package B persistence

Ten fresh Package B Profile-0 processes independently verify Package B closure, R9 admission, final 96-leaf root, primary R10 permit, package-scoped route pointer, installed-product bundle, generations, implementation digests and device profile.

```text
boots = 10
startup canary per boot = 8 submissions / 8 fences
aggregate = 80 / 80
final surfaces = 10
installed sessions = 10
BrowserWindow shows = 10
```

Across all boots:

```text
permit, signature, public key, R9 root, route pointer and bundle changes = 0
product signer acquisitions = 0
permit writes = 0
route-pointer writes = 0
bundle writes = 0
```

Every boot receipt is ordinal- and digest-chain-bound.

## 5. Cross-version mixed workload

Two paired waves execute. Each paired wave contains one isolated Package A qualification shadow wave and one Package B Profile-0 normal-product wave.

Each package wave contains Preview and Export at 1080p, 4K and 8K.

```text
1080p = 1,888 windows, 5 QMap chunks, 8 submissions
4K = 7,854 windows, 18 QMap chunks, 21 submissions
8K = 32,026 windows, 72 QMap chunks, 75 submissions
one package wave = 104 / 104
four package-wave executions = 416 / 416
final surfaces = 12
cross-version comparison pairs = 6
```

Package A physically generates reference surfaces in a qualification-only process. Synthetic Package A references and Package B self-comparison are forbidden.

## 6. Cross-version parity

Every Package A/Package B pair must match descriptor and source lineage.

```text
nonfinite output count = 0
RGB maximum finite f16 ULP <= 2
RGB p99 finite f16 ULP <= 1
alpha classification mismatches = 0
alpha maximum finite f16 ULP <= 1
dimension mismatches = 0
missing final-surface receipts = 0
```

Package B must independently retain its QMAP01 oracle validation.

## 7. Package B concurrency and plateau

Within each same-resolution Preview/Export pair:

```text
cold leaders = 1
joined consumers = 1
QMap fields = 1
QWave-real fields = 1
QWave-analytic fields = 1
EFC graphs = 1
final surfaces = 1
Pipeline final revisions = 1
```

Preview and Export retain distinct operation grants and consumer pins.

```text
maximum active cold jobs = 1
maximum active arenas = 1
maximum FIFO depth = 3
joined-caller GPU submissions = 0
QRC02 product executions = 0
```

Every terminal boundary returns private resources, tickets, pins, surfaces and grants to zero.

## 8. Package B product device loss

One shared 4K operation loses its device at chunk 8, submission 9, after the real submit and before fence wait.

```text
old attempt = 9 submissions, 8 normal fences, 1 loss observation
old compact progress reusable = 0
replacement device/queue acquisitions = 1/1
replacement epoch advance = 1
restart chunk = 0
replacement QMap = 18 / 18
QWave real + analytic + EFC = 3 / 3
product operation = 30 submissions, 29 fences, 1 loss
post-loss canary = 8 / 8
fixture total = 38 submissions, 37 fences, 1 loss observation
final surfaces = 2
```

The old session and grants revoke. A new session binds the replacement epoch and two continuation grants deliver the recovered shared surface. Old grant replay acceptance is zero. QRC02 fallback is forbidden.

## 9. Previous-package rollback exercise

Package B drains to zero and restores its own QRC02 before exit.

A new bundle generation selects retained Package A. Package A independently verifies its unchanged authority, performs an 8/8 startup canary and receives a new installed session.

Package A then completes one shared 4K Preview/Export operation:

```text
submissions / fences = 21 / 21
cold leaders = 1
joined consumers = 1
final surfaces = 1
QRC02 product executions = 0
```

Package A drains. Package B returns using the unchanged primary permit but new route and bundle generations and performs another 8/8 startup canary.

Rollback exercise aggregate:

```text
submissions / fences = 37 / 37
final surfaces = 3
bundle commits = 2
Package B permit writes = 0
product signer acquisitions = 0
final route = Package B QSR03G
```

Old Package A and Package B sessions never reactivate.

## 10. Multi-profile qualification

Exactly two Package B profiles are verified.

Profile-1 must carry its own R9 P001-P096 physical admission, final root, post-write verification and R10 product permit. R13 verifies these read-only and does not issue the Profile-1 permit.

Profile-1 hidden qualification:

```text
startup canary = 8 / 8
mixed 1080p/4K/8K wave = 104 / 104
aggregate = 112 / 112
final surfaces = 4
consumer completions = 6
installed normal sessions = 0
normal BrowserWindow shows = 0
active bundle writes = 0
product signer acquisitions = 0
```

Profile-1 may not become the active product route in R13.

## 11. Aggregate workload

```text
Ten Package B boots = 80 / 80, surfaces 10
Cross-version waves = 416 / 416, surfaces 12
Package B device loss = 38 submissions, 37 fences, 1 loss, surfaces 2
Package A rollback exercise = 37 / 37, surfaces 3
Profile-1 qualification = 112 / 112, surfaces 4
```

Aggregate:

```text
real queue submissions = 683
normal completed fences = 682
device-loss observations = 1
terminal observations = 683
converged final surfaces = 31
successful installed Package B boots = 11
successful installed Package A boots = 1
successful installed boots = 12
Profile-1 qualification boots = 1
cross-version comparisons = 6
rollback transitions = 1
Package B restoration transitions = 1
```

Validation, OOM, internal, encoding and submission error counts are zero. Runtime quarantine remains false.

## 12. Retention prerequisites and Merkle closure

Release evaluation requires Package B ten-boot persistence, six cross-version parity passes, device-loss recovery, Package A rollback and product exercise, Package B restoration, Profile-0 and Profile-1 qualification, zero terminal resource balance, zero validation errors and unchanged launchable Package A retention.

After V104:

```text
receipts = 104
ordered gates = V001-V104
preliminary tree size = 104
```

The release evaluator reads installed receipts and a rebuilt 104-leaf root. Caller booleans such as `releaseEligible`, `allPrerequisitesPassed` and `deletePackageA` have no authority.

Required eligibility output:

```text
releaseEligible = true
deletionEligible = false
deletionCapabilityPresent = false
```

After V112:

```text
receipts = 112
ordered gates = V001-V112
first 104 leaves = exact prerequisite prefix
final tree size = 112
```

## 13. Retention release and deletion denial

The release admission binds Package A authority, active Package B authority, both profile roots, the 104-leaf prerequisite root, aggregate work, parity, device loss, rollback and resource receipts.

```text
retention state = RELEASE_ADMITTED_NOT_DELETED
Package A physically present = true
Package A launchable = true
Package A deletion count = 0
deletion capability count = 0
garbage-collection permit count = 0
```

The deletion-denial receipt records no deletion executor, no deletion capability, no filesystem mutation, no deleted path and no automatic cleanup authority.

## 14. Physical gate families

```text
V001-V008   R12 and Package B authority
V009-V016   Package B boots 1-5
V017-V024   Package B boots 6-10
V025-V032   cross-version workload plan
V033-V040   cross-version parity
V041-V048   Package B concurrency and plateau
V049-V056   target device loss
V057-V064   target session rebind
V065-V072   Package A rollback exercise
V073-V080   Package B restoration
V081-V088   multi-profile authority
V089-V096   Profile-1 qualification
V097-V104   retention prerequisites
V105-V112   retention-release admission
```

V receipts form a separate domain and do not mutate the P, Q, R or U Merkle trees.

## 15. Source gates and negative controls

```text
Source Gates = 416
Negative Controls = 184
Physical V-gate definitions = 112
```

Source validation covers target boot persistence, cross-version physical reference authority and parity, Package B concurrency, device loss/session rebind, Package A rollback exercise, Package B restoration, two-profile verification, Profile-1 isolation, resource plateau, 104-leaf prerequisites, retention release, 112-leaf final closure, deletion denial and A-R12 regressions.

Negative controls cover authority drift, synthetic references, parity threshold relaxation, duplicate jobs/surfaces, wrong loss accounting, stale sessions/grants, generation reuse, profile substitution, Profile-1 product promotion, resource leakage, caller-trusted eligibility, malformed Merkle roots, deletion capabilities and false fleet-wide claims.

## 16. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R13_PACKAGE_B_TEN_BOOT_PERMIT_PERSISTENCE_PACKAGE_A_PACKAGE_B_CROSS_VERSION_MIXED_WORKLOAD_CROSS_VERSION_FINAL_SURFACE_PARITY_PACKAGE_B_DEVICE_LOSS_RECOVERY_PACKAGE_B_SESSION_REBIND_PACKAGE_A_ROLLBACK_EXERCISE_PACKAGE_B_POST_ROLLBACK_RESTORATION_TWO_PROFILE_UPDATE_QUALIFICATION_SUSTAINED_RESOURCE_PLATEAU_RETENTION_RELEASE_PREREQUISITE_MERKLE_RELEASE_ADMITTED_NOT_DELETED_AUTHORITY_PACKAGE_A_DELETION_DENIAL_NO_FLEET_WIDE_PROMOTION_AWAITING_PACKAGED_CHANGED_PACKAGE_SOAK_EXECUTION
```

Required source facts:

```text
Source Gates = 416/416
Negative Controls = 184/184
Physical V gates = 112 definitions
Target boot definitions = 10
Cross-version paired waves = 2
Device-profile definitions = 2
Expected submissions = 683
Expected normal fences = 682
Expected loss observations = 1
Expected final surfaces = 31
Real product signer acquisitions = 0
Real product permits issued = 0
Real Package A deletions = 0
Physical V gates executed = 0/112
Retention release admitted = false
Fleet-wide promotion = false
```

## 17. Physical completion state

```text
PACKAGED_CHANGED_PACKAGE_POST_UPDATE_SOAK_BAKED_QMAP_STREAMING_REDUCTION_03G_R13_PACKAGE_B_TEN_BOOT_PERMIT_PERSISTENCE_PACKAGE_A_PACKAGE_B_CROSS_VERSION_PARITY_PACKAGE_B_MIXED_PRODUCT_STABILITY_PACKAGE_B_DEVICE_LOSS_RECOVERY_PACKAGE_B_SESSION_REBIND_PACKAGE_A_ROLLBACK_AND_PRODUCT_EXERCISE_PACKAGE_B_POST_ROLLBACK_RESTORATION_PACKAGE_B_TWO_PROFILE_QUALIFICATION_SIX_HUNDRED_EIGHTY_THREE_SUBMISSION_TERMINAL_OBSERVATIONS_THIRTY_ONE_FINAL_SURFACES_ZERO_PRODUCT_ROUTE_AMBIGUITY_ZERO_PRIVATE_RESOURCE_LEAK_PACKAGE_A_RELEASE_ADMITTED_NOT_DELETED_NO_FLEET_WIDE_PROMOTION_CLAIM
```

Required physical facts later:

```text
V gates = 112/112
Package B baseline boots = 10
successful installed Package B boots = 11
successful installed Package A boots = 1
cross-version comparisons = 6/6
device profiles verified = 2
real submissions = 683
normal completed fences = 682
device-loss observations = 1
final surfaces = 31
Package A rollback exercises = 1
Package B restoration transitions = 1
retention-release admissions = 1
Package A deletion capabilities = 0
Package A deletions = 0
Package A final state = RELEASE_ADMITTED_NOT_DELETED
product signer acquisitions = 0
new product permits = 0
QRC02 fallback invocations = 0
runtime quarantine = false
terminal private-resource balance = 0
WebGPU validation errors = 0
fleet-wide promotion = false
```

## 18. Package policy

The code ZIP contains the target boot ledger, cross-version workload/parity authorities, target device-loss and session-rebind authorities, Package A rollback exercise, Package B restoration, multi-profile verifier, Profile-1 qualification runner, resource plateau, prerequisite/final Merkle authorities, retention eligibility, release admission, deletion denial, V001-V112 definitions and source/physical validation tooling.

The ZIP excludes this specification, private keys, real permits, real route/bundle pointers, generated V receipts, physical retention-release artifacts, Package A deletion capability or receipt, user data, reports, logs, nested ZIPs and Git metadata.

## 19. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R14

Retention Release Commit /
Package A Quarantine Move /
Delayed Deletion Window /
Rollback Artifact Export /
Deletion Capability One-Shot Consumption /
Post-Deletion Package B Recovery Boot /
Package Store Integrity /
No Fleet-Wide Promotion Claim Yet Seal
```

R14 may consume the R13 retention-release admission. R14 must move Package A into quarantine or deletion-pending state before any physical deletion and must own the one-shot deletion capability.

## 20. Final seal

```text
R13 signs no product permit.

Package B's primary permit, R9 root, route pointer and bundle survive ten fresh
packaged boots without rewrite.

Package A physically generates the cross-version references. Package B never
compares against a synthetic or self-generated reference.

Two paired 1080p, 4K and 8K waves close six Package A versus Package B parity
pairs while Package B independently retains QMAP01 authority.

One Package B 4K operation loses its device after the ninth real submission.
The old session and grants revoke, QMap restarts at chunk zero and continuation
grants deliver the recovered final surface after the post-loss canary.

Package B drains. Package A returns through a new bundle generation, completes
its startup canary and one real shared 4K Preview/Export operation. Package B
returns through another new route and bundle generation without rewriting its
permit.

Profile-0 is the only normal product profile. Profile-1 carries independent R9
and R10 authority but remains qualification-only.

The first 104 V gates prove sustained stability and retention prerequisites.
Only then may Package A enter RELEASE_ADMITTED_NOT_DELETED.

No deletion executor is present. No deletion capability is issued. No Package A
file is removed. No garbage-collection authority exists in R13.

R13 admits retention release. It does not execute deletion and makes no
fleet-wide promotion claim.
```
