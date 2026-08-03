# TDT-QMAP-STREAMING-REDUCTION-03G-R9

## Named P001-P096 Physical Admission Closure / Preliminary P001-P088 Merkle / Signed Preliminary Admission / One-Shot Qualification Trial Permit / P089-P096 Promoted-Route Trial / Final Ninety-Six-Leaf Merkle / Signed Physical Admission / No Product Promotion Permit Yet Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R9
Short ID = QSR03G-R9
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R8
Base named registry = TDT-QMAP-STREAMING-REDUCTION-03G-R2 P001-P096
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
```

Required parent source state:

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R8_CANONICAL_AFT00_QMAP_FIELD_EXACT_QMAP_GRAPH_PIN_QMAP_QWAVE_DEVICE_IDENTITY_COHERENCE_DEPTH_ALPHA_PHASE_GAMMA_BAKEMONO_EFC_GRAPH_LIVE_PINNED_FIELD_CONSUMPTION_ONE_GRAPH_SUBMISSION_ONE_FINAL_SURFACE_ADOPTION_ONE_PIPELINE_PUBLICATION_ZERO_HIDDEN_QRC02_EXECUTION_NO_PRODUCT_PROMOTION_AWAITING_PACKAGED_EFC_PHYSICAL_EXECUTION
```

R9 executes and closes the complete named P001-P096 physical gate registry. It may create a signed physical-admission receipt. It may not create the final product-promotion permit or install QSR03G as the normal product bridge.

## 1. Admission boundary

R9 produces the following ordered evidence chain:

```text
six verified physical qualification packs
→ P001-P088 evidence artifacts and predicate receipts
→ 88-leaf preliminary Merkle
→ signed preliminary admission
→ signed one-shot qualification trial permit
→ authenticated permit consumption
→ P089-P096 isolated promoted-route trial receipts
→ preliminary-prefix proof
→ 96-leaf final Merkle
→ signed physical-admission receipt
→ post-write admission verification
→ product-promotion denial receipt
```

The permitted terminal claim is:

```text
QSR03_PHYSICAL_ADMISSION_SIGNED_AND_VERIFIED
```

The following claims remain forbidden:

```text
QSR03_PRODUCT_PROMOTION_PERMIT_ISSUED
QSR03_NORMAL_PRODUCT_BOOT_ADMITTED
QSR03_GLOBAL_BRIDGE_PROMOTED
QRC02_PRODUCT_ROUTE_DEMOTED
QSR03_PRODUCT_PROMOTION_COMPLETE
```

## 2. Mandatory parent corrections

### 2.1 No boolean gate authority

The R9 executor must not accept any caller-provided field such as:

```text
admitted
pass
passed
eligible
allGatesPassed
physicalPassCount
allPhysicalGatesPassed
promotionEligible
```

Each P gate reads the canonical installed `evidence/Pxxx.json` artifact and computes its own result from measured values and verified source evidence roots.

### 2.2 Receipt authenticity

Every P receipt binds:

```text
run ID
P gate ID and ordinal
R2 title and family
R9 execution-plan digest
gate-definition digest
predicate digest
evidence-adapter digest
package-before closure digest
adapter and device-profile digests
installed evidence artifact digest
source-pack Merkle roots
ordered prior-prefix digest
measured values
monotonic timing
self hash
```

### 2.3 Disk-rebuilt Merkle roots

Neither preliminary nor final Merkle construction may trust caller-provided leaves or a stored root. Leaves are rebuilt from the installed receipt files and their exact file hashes.

### 2.4 Signature verification before authority expansion

The signed preliminary admission is read back from disk and verified before trial permit issuance. The trial permit signature is verified before its nonce is consumed. The final physical admission is read back and verified after publication.

### 2.5 Role-separated signing

```text
PHYSICAL_ADMISSION key
!= QUALIFICATION_TRIAL key
```

The `PRODUCT_PROMOTION` signing authority is unavailable to R9. Private key bytes may not enter the package, evidence root, renderer, ZIP or Git repository.

### 2.6 Product permit path denial

`QSR03G_PRODUCT_PROMOTION_PERMIT.json` is absent from the R9 artifact allowlist. The promotion finalizer is not imported or called by the R9 coordinator.

## 3. State ownership and SSOT

```text
R2 registry
= P gate IDs, ordinals, families and titles

R9 execution plan
= predicates, evidence adapters and source-pack mappings

source-pack verifier
= R3-R8 qualification-root authenticity

P-gate executor
= one non-boolean predicate per named gate

write-once publisher
= admission evidence filesystem authority

PHYSICAL_ADMISSION signer
= preliminary and final admission signatures

QUALIFICATION_TRIAL signer
= one-shot trial permit signature

isolated trial renderer
= temporary QSR03G global-route simulation

product promotion authority
= absent from R9
```

## 4. Required source evidence packs

R9 requires six physical qualification packs:

```text
R3 C001-C032 = 32 receipts
R4 K001-K048 = 48 receipts
R5 L001-L056 = 56 receipts
R6 M001-M064 = 64 receipts
R7 N001-N072 = 72 receipts
R8 O001-O080 = 80 receipts
```

Total imported qualification receipts:

```text
352
```

Every pack must include its gate index, all named receipts, rebuilt Merkle root, physical closure receipt, package closures, device evidence and artifact manifest. Summary booleans are not admission inputs.

Cross-pack requirements:

```text
package content ID = identical
composition-root digest = identical
runtime bridge digest = identical
shader and ABI set digests = identical
device-profile digest = identical
product permit artifacts = 0
```

## 5. P-gate evidence normalization

Every `evidence/Pxxx.json` uses:

```text
schema = tdt.qmap.p-gate-evidence.qsr03g-r9.v1
run ID
P gate ID
evidence-adapter ID and digest
verified source-pack roots and physical receipt digests
one named measurement
measurement unit
source artifact digests
self hash
```

The executor parses the file from disk. A separate in-memory decision object is forbidden.

## 6. P001-P088 preliminary execution

P001-P088 execute strictly in order. Every gate extends an ordered receipt-prefix digest. Execution stops on the first failed predicate.

Families:

```text
P001-P008   package and candidate
P009-P016   bridge and FIFO
P017-P024   single-flight and warm sharing
P025-P032   4K completion
P033-P040   8K completion
P041-P048   QMAP01 parity
P049-P056   submission and receipt authenticity
P057-P064   resource plateau
P065-P072   cancellation and replay
P073-P080   device-loss recovery
P081-P088   EFC convergence
```

## 7. Preliminary 88-leaf Merkle

After P088:

```text
receipt files = 88
ordered gates = P001-P088
tree size = 88
```

Each leaf binds the gate ID, ordinal, definition digest, executor digest, predicate digest, receipt self hash and exact receipt file hash.

Hash domains:

```text
leaf = SHA-256(0x00 || canonical leaf body)
node = SHA-256(0x01 || left || right)
```

Published physical artifacts later:

```text
QSR03G_PRELIMINARY_GATE_INDEX.json
QSR03G_PRELIMINARY_ADMISSION_MERKLE.json
```

## 8. Signed preliminary admission

The preliminary admission is signed with Ed25519 under the `PHYSICAL_ADMISSION` role and binds:

```text
run and package identity
execution-plan digest
package-before closure
adapter/device/profile identity
88-leaf root
first gate P001
last gate P088
admission phase PRELIMINARY_88
normalProductBootAdmitted = false
productPromotionState = NOT_ISSUED
productPromotionPermitDigest = null
```

The receipt must be verified after disk read.

## 9. One-shot qualification trial permit

Permit issuance requires a verified preliminary signature and exact rebuilt preliminary root.

The `QUALIFICATION_TRIAL` permit binds:

```text
run ID
preliminary receipt digest and root
package content ID
composition root
runtime bridge
shader set
ABI set
device profile and adapter identity
isolated renderer identity
fixture ID
expiry
nonce
singleUse = true
qualificationOnly = true
normalProductBootAdmitted = false
```

Consumption order:

```text
verify Ed25519 signature
→ verify signing role and public-key digest
→ verify run/process/package/device bindings
→ verify expiry
→ atomically consume nonce
→ publish consumption receipt
→ permit isolated trial bridge installation
```

## 10. Isolated promoted-route trial

The host product process remains QRC02.

Inside a fresh isolated trial renderer:

```text
global QMap bridge = QSR03G
QRC02 coordinators = 0
QRC02 route installations = 0
host product bridge mutations = 0
```

The 1920×1080 trial profile executes:

```text
QSR03 QMap = 5 submissions / 5 fences
QWave real = 1 / 1
QWave analytic = 1 / 1
EFC graph = 1 / 1
aggregate = 8 / 8
```

It produces one converged final surface and one Pipeline publication with zero QRC02 execution and zero private-resource leak.

## 11. P089-P096

```text
P089 preliminary P001-P088 Merkle verifies
P090 signed preliminary admission verifies
P091 one-shot trial permit verifies
P092 permit binds exact package content
P093 permit binds runtime, shader, ABI and device
P094 isolated trial installs QSR03G
P095 isolated trial installs no QRC02 route
P096 post-trial EFC smoke completes through QSR03G
```

## 12. Preliminary-prefix immutability

Before finalization, P001-P088 receipt paths, file bytes, self hashes and leaf hashes must be identical to the preliminary tree. Regeneration after preliminary signing is forbidden.

## 13. Final 96-leaf Merkle

After P096:

```text
receipt files = 96
ordered gates = P001-P096
first 88 leaves = exact preliminary prefix
last 8 leaves = P089-P096
```

The final root is independently rebuilt from installed receipt files.

## 14. Signed physical admission

The Ed25519 `PHYSICAL_ADMISSION` signature binds:

```text
R2 registry digest
R9 execution-plan digest
run and package closures
artifact allowlist and manifest
preliminary root and receipt
trial permit signature and consumption
final 96-leaf root
adapter/device/profile identity
12 family evidence digests
runtime bridge, composition root, shader and ABI digests
admissionState = ADMITTED
normalProductBootAdmitted = false
productPromotionState = NOT_ISSUED
productPromotionPermitDigest = null
```

The artifact manifest excludes itself, the physical-admission receipt and the post-write verification receipt to avoid circular trust.

## 15. Post-write admission verification

R9 reads the physical-admission receipt from disk and verifies:

```text
file digest and self hash
Ed25519 signature
signing role and pinned public key
final Merkle root
all family digests
package closures
preliminary-prefix proof
trial permit and consumption
absence of product permit
```

Required result:

```text
physicalAdmissionVerified = true
normalProductBootAdmitted = false
productPromotionPermitPresent = false
```

## 16. Product-promotion denial

The R9 denial receipt records:

```text
product signer loaded = false
promotion finalizer imports = 0
promotion finalizer calls = 0
product permit publication attempts = 0
product permit artifacts = 0
normal product bridge mutations = 0
host QRC02 bridge identity changed = false
physical admission present = true
product promotion state = NOT_ISSUED
```

This receipt applies to the R9 authority. R10 may later load the separate product-promotion authority.

## 17. Source gates and negative controls

```text
Source Gates = 352
Negative Controls = 152
P-gate definitions = 96
P-gate evidence adapters = 96
```

Source gates cover identity, the six evidence packs, all 96 evidence adapters and predicates, ordered receipts, preliminary tree/signature, trial permit/consumption, isolated route, prefix immutability, final tree/signature, post-write verification, product denial and parent A-R8 regressions.

Negative controls cover boolean trust, forged source roots, package/profile mismatch, changed P order or title, relaxed physical measurements, missing receipts, arbitrary Merkle leaves, wrong signing roles, unsigned/replayed permits, trial route contamination, preliminary-prefix mutation, invalid final signatures, private-key exposure, product signer/finalizer access and false promotion claims.

## 18. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R9_NON_BOOLEAN_P001_P096_PREDICATES_SIX_PHYSICAL_EVIDENCE_PACK_VERIFIERS_PRELIMINARY_88_LEAF_DISK_REBUILD_ROLE_BOUND_PRELIMINARY_SIGNING_SIGNATURE_VERIFIED_ONE_SHOT_TRIAL_PERMIT_ISOLATED_QSR03G_PROMOTED_ROUTE_TRIAL_PRELIMINARY_PREFIX_IMMUTABILITY_FINAL_96_LEAF_DISK_REBUILD_SIGNED_PHYSICAL_ADMISSION_AUTHORITY_PRODUCT_PERMIT_DENIAL_AWAITING_PACKAGED_PHYSICAL_ADMISSION_EXECUTION
```

Required source facts:

```text
Source Gates = 352/352
Negative Controls = 152/152
source evidence packs = 6
source qualification receipts = 352
P-gate definitions = 96
P-gate evidence adapters = 96
physical P receipts = 0/96
preliminary leaf definitions = 88
final leaf definitions = 96
real signing keys loaded = 0
real trial permits issued = 0
signed physical admissions = 0
product permit artifacts = 0
product promotion = false
global product route = QRC02 unchanged
```

Source-only tests may create ephemeral in-memory Ed25519 keys and temporary receipts. They are not physical evidence and must not enter the code ZIP.

## 19. Physical completion state

```text
PACKAGED_NAMED_PHYSICAL_ADMISSION_BAKED_QMAP_STREAMING_REDUCTION_03G_R9_P001_P096_PASS_PRELIMINARY_88_LEAF_MERKLE_SIGNED_PRELIMINARY_ADMISSION_ONE_SHOT_QUALIFICATION_TRIAL_PERMIT_ISOLATED_QSR03G_PROMOTED_ROUTE_TRIAL_FINAL_96_LEAF_MERKLE_SIGNED_PHYSICAL_ADMISSION_PHYSICAL_ADMISSION_VERIFIED_NO_PRODUCT_PROMOTION_PERMIT_GLOBAL_QRC02_BRIDGE_UNCHANGED
```

Required physical facts later:

```text
P gates = 96/96
P FAIL receipts = 0
preliminary leaves = 88
signed preliminary admissions = 1
trial permits issued/consumed = 1/1
trial replay count = 0
trial QSR03G installs = 1
trial QRC02 route installs = 0
trial submissions/fences = 8/8
final leaves = 96
signed physical admissions = 1
verified physical admissions = 1
product signers loaded = 0
product permit artifacts = 0
normal product bridge mutations = 0
product promotion = false
global product route = QRC02 unchanged
```

## 20. Package policy

The code ZIP contains the R9 execution plan, six pack verifiers, 96 non-boolean evidence adapters and predicates, hardened receipt path, preliminary/final disk Merkle builders, role-bound signing authorities, one-shot trial integration, isolated trial runner, physical-admission signer/verifier, product-permit denial, source validators and physical entry/verifier.

The ZIP excludes:

```text
this specification
private keys
physical P-gate receipts
preliminary admission artifacts
trial permit artifacts
final Merkle artifacts
physical-admission receipt
product-promotion permit
reports and logs
temporary source evidence
nested ZIPs
Git metadata
```

The GitHub commit contains this specification only.

## 21. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R10

Signed Product Promotion Permit /
Pinned Physical Admission Verification /
Atomic Global QSR03G Bridge Promotion /
QRC02 Qualification-Only Demotion /
Normal Packaged Product Boot /
Post-Promotion EFC Product Smoke /
Admission-Drift Rollback /
Single Product Writer Seal
```

R10 may load the product-promotion signing authority only after independently verifying the R9 signed physical admission and complete P001-P096 evidence root.

## 22. Final seal

```text
R9 does not trust a PASS boolean.

Every P gate reads an installed evidence artifact and evaluates its own measured
predicate against verified physical source-pack roots.

P001-P088 produce an immutable 88-leaf preliminary tree. The preliminary
admission is signed and verified before a separate one-shot trial permit can
be issued.

The isolated trial process temporarily installs QSR03G and contains no QRC02
route. P089-P096 prove the preliminary closure, permit bindings, route
isolation and post-trial EFC smoke.

The final 96-leaf tree preserves the exact preliminary prefix. The signed
physical admission binds both Merkle phases, trial consumption, all family
digests and unchanged package identity.

The physical admission is verified after disk publication.

No product signing authority is loaded. No product permit path is allowlisted.
No normal product bridge is changed.

R9 closes physical admission only. Product promotion remains R10 authority.
```
