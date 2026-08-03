# TDT-QMAP-STREAMING-REDUCTION-03G-R2

## Named Physical Gate Executor / Evidence Artifact Allowlist / Per-Gate Receipt Digest / Admission Merkle Closure / Package Before-After Closure / Non-Forgeable Promotion Permit / No Boolean Receipt Trust Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R2
Short ID = QSR03G-R2
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R1
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Required parent = SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R1_CANONICAL_COMPOSITION_ROOT_CONCRETE_INVOCATION_FACTORY_FINAL_EWA_REPLAY_BOUND_QSR03A_TO_QSR03F_ASSEMBLY_BOUND_ANALYSIS_BUILD_LEASE_BOUND_PACKAGED_CANDIDATE_ROUTE_ISOLATED_GLOBAL_QRC02_BRIDGE_UNCHANGED_AWAITING_PACKAGED_1080P_CANDIDATE_SMOKE
State = SPEC_READY_AWAITING_SOURCE_BAKE
```

QSR03G-R2 removes authority from legacy physical summary fields:

```text
physicalGateCount = 96
physicalPassCount = 96
allPhysicalGatesPassed = true
promotionEligible = true
```

No finalizer may accept, synthesize, overwrite, or trust those values. The canonical authority chain is:

```text
physical observation
→ exact allowlisted evidence artifact
→ named packaged gate executor
→ versioned predicate
→ write-once per-gate receipt
→ domain-separated Merkle leaf
→ canonical ordered Merkle root
→ signed physical admission
→ independently signed product promotion permit
```

## 1. Mandatory parent correction

The old packaged verifier that opened one admission JSON and trusted three summary fields is removed from promotion authority.

The old finalizer must not assign:

```text
physicalGateCount: 96
physicalPassCount: 96
allPhysicalGatesPassed: true
```

The R2 promotion finalizer receives only an evidence root, package root, run ID, expected runtime identities, a pinned physical-admission verifier, and an external promotion signing-key handle.

The legacy permit schema is rejected:

```text
tdt.qmap.product-promotion-permit.qsr03g.v1
```

The only admitted product permit schema is:

```text
tdt.qmap.product-promotion-permit.qsr03g-r2.v2
```

## 2. Two-phase physical closure

The original P089-P096 terminal family is circular when the final product permit is expected before all 96 gates have passed. R2 splits trial authority from product authority.

### Phase A

```text
gates = P001-P088
leaf count = 88
output = signed preliminary physical admission
```

### Qualification trial permit

After P001-P088 verify, a run-bound, package-bound, process-bound, device-bound, single-use, expiring, qualification-only trial permit may be issued.

```text
schema = tdt.qmap.promotion-trial-permit.qsr03g-r2.v1
normal product boot admitted = false
qualification only = true
single use = true
```

### Phase B

```text
P089 preliminary 88-leaf root verifies
P090 signed preliminary admission verifies
P091 one-shot trial permit verifies
P092 exact package binding verifies
P093 runtime, shader, ABI and device bindings verify
P094 isolated trial boot installs QSR03G
P095 isolated trial boot installs no QRC02 product route
P096 post-trial EFC smoke converges through QSR03G
```

### Final admission

```text
final leaf set = P001-P096
final tree size = 96
finalPhysicalMerkleRoot = Merkle(P001 ... P096)
```

The actual product promotion permit is issued only after the final signed 96-leaf physical admission verifies. The final permit is not itself a physical-gate input.

## 3. Authorities and schemas

```text
gateRegistryAuthorityId = dadum.qmap.physical-gate-registry.qsr03g-r2
gateExecutorAuthorityId = dadum.qmap.named-physical-gate-executor.qsr03g-r2
evidenceAuthorityId = dadum.qmap.physical-evidence-authority.qsr03g-r2
artifactAllowlistAuthorityId = dadum.qmap.physical-artifact-allowlist.qsr03g-r2
artifactPublisherAuthorityId = dadum.qmap.immutable-artifact-publisher.qsr03g-r2
packageClosureAuthorityId = dadum.qmap.package-before-after-closure.qsr03g-r2
gateReceiptAuthorityId = dadum.qmap.physical-gate-receipt-authority.qsr03g-r2
merkleAuthorityId = dadum.qmap.physical-admission-merkle-authority.qsr03g-r2
preliminaryAdmissionAuthorityId = dadum.qmap.preliminary-physical-admission-authority.qsr03g-r2
trialPermitAuthorityId = dadum.qmap.promotion-trial-permit-authority.qsr03g-r2
physicalAdmissionAuthorityId = dadum.qmap.physical-admission-authority.qsr03g-r2
promotionPermitAuthorityId = dadum.qmap.product-promotion-authority.qsr03g-r2
```

Canonical schemas:

```text
tdt.qmap.physical-gate-definition.qsr03g-r2.v1
tdt.qmap.physical-gate-registry.qsr03g-r2.v1
tdt.qmap.physical-evidence-artifact.qsr03g-r2.v1
tdt.qmap.physical-gate-receipt.qsr03g-r2.v1
tdt.qmap.physical-gate-leaf.qsr03g-r2.v1
tdt.qmap.preliminary-admission.qsr03g-r2.v1
tdt.qmap.promotion-trial-permit.qsr03g-r2.v1
tdt.qmap.physical-admission-merkle.qsr03g-r2.v1
tdt.qmap.physical-admission-receipt.qsr03g-r2.v1
tdt.qmap.product-promotion-permit.qsr03g-r2.v2
tdt.qmap.physical-artifact-manifest.qsr03g-r2.v1
```

## 4. Exact 96-gate registry

The registry contains exactly P001 through P096 in ascending numeric order. Missing, duplicate, unknown, reordered, or invented gates are rejected.

Every gate definition binds:

```text
gate ID and ordinal
family and title
executor ID and packaged module path
executor module SHA-256
required earlier gate IDs
required exact artifact paths and schema IDs
fixture IDs and admitted adapter roles
predicate ID, version and digest
exact output receipt path
gate-definition digest
```

Exactly 96 packaged executor files exist. Registry, executor and predicate identities become immutable after package-before closure.

Gate families:

```text
P001-P008   package and candidate admission
P009-P016   candidate bridge and FIFO
P017-P024   duplicate single-flight and warm sharing
P025-P032   4K completion
P033-P040   8K completion
P041-P048   QMAP01 output parity
P049-P056   submission and receipt authenticity
P057-P064   resource plateau
P065-P072   cancellation replay
P073-P080   device-loss recovery
P081-P088   EFC convergence
P089-P096   isolated promotion trial
```

Reference physical values remain:

```text
4K windows/chunks/submissions/final = 7,854 / 18 / 18 / 238
4K compact/QMap bytes = 439,824 / 66,355,200
8K windows/chunks/submissions/final = 32,026 / 72 / 72 / 218
8K compact/QMap bytes = 1,793,456 / 265,420,800
```

## 5. Exact artifact allowlist

Every run uses a fresh absolute root:

```text
<evidence root>/<64-lowercase-hex run ID>
```

Every path must be explicitly enumerated, relative, canonical, inside the run root, symlink-free, and write-once. `..`, absolute child paths, NUL, backslash variants, wildcard names, renderer-selected names, replacement, rewrite and retry under one run ID are forbidden.

Exactly 96 receipt paths are admitted:

```text
gates/QSR03G_P001_GATE_RECEIPT.json
...
gates/QSR03G_P096_GATE_RECEIPT.json
```

Root artifacts include run context, registry and allowlist snapshots, package closures and comparison, adapter identity, candidate and composition snapshots, preliminary index/root/admission, trial permit and consumption, final index/root/admission, and artifact manifest.

The product promotion permit is written only after independent finalization.

## 6. Immutable publisher and canonical digests

Only Main-process evidence authority selects paths and writes evidence. Renderer IPC can provide typed observations only.

Publication sequence:

```text
validate canonical path
verify exact allowlist membership
canonicalize payload
exclusive temporary creation
write and fsync file
install without replacement
fsync directory
reopen installed bytes
recompute file digest
append immutable publisher sequence entry
```

Canonical JSON profile:

```text
tdt.canonical-json.qsr03g-r2.v1
```

It sorts object keys, preserves array order, rejects undefined and nonfinite numbers, uses UTF-8, and emits no insignificant whitespace.

Every artifact records:

```text
file SHA-256 = SHA-256(raw installed bytes)
self SHA-256 = SHA-256(canonical object without selfSha256)
```

Every executor digest is SHA-256 of packaged module bytes and must match the gate definition and package closure.

## 7. Per-gate execution and receipt

Gate lifecycle:

```text
REGISTERED
→ DEPENDENCIES_VERIFIED
→ EXECUTOR_VERIFIED
→ RUNNING
→ EVIDENCE_COLLECTED
→ PREDICATE_EVALUATED
→ RECEIPT_SEALED
```

A gate executes once per run. A failed gate produces one immutable FAIL receipt and cannot be replaced by a later PASS receipt.

Before execution, authority verifies run, registry, definition, executor, predicate, package-before closure, adapter, fixture, earlier receipt dependencies, evidence artifacts, and any fault permit.

The predicate computes PASS or FAIL. Caller `passed`, `success`, count, and summary booleans are ignored.

Each receipt binds:

```text
run and gate identity
registry and definition digests
executor and predicate identities/digests
package-before closure
adapter and fixtures
dependency receipt digests
input and output evidence digests
canonical observations
finite measured values
PASS or FAIL
stable failure code
monotonic sequence and timestamps
self SHA-256
```

PASS requires all independent validations and `predicate.admitted = true`. Any FAIL receipt blocks admission.

## 8. Merkle closure

Leaf body binds run ID, gate ID, ordinal, gate-definition digest, executor digest, predicate digest, receipt self digest, and receipt file digest.

```text
leafHash = SHA-256(0x00 || UTF8(canonical leaf body))
nodeHash = SHA-256(0x01 || leftHashBytes || rightHashBytes)
```

Leaves are ordered P001 through P096. Filesystem order, write time and completion order are ignored. Odd final nodes are promoted unchanged and are not duplicated.

Stored roots are evidence only. Preliminary admission, final admission, and product promotion finalizers independently rebuild their trees from receipt files.

## 9. Package before-after closure

The closure includes Electron Main and preload, QSR03 runtime, WGSL assets, gate registry, all executors and predicates, composition root, route selector, Analysis/EFC integration and package metadata.

It excludes the evidence root, user data, mutable GPU caches and OS temporary files.

Each entry binds canonical relative path, byte length and raw SHA-256. Package content identity is derived from the ordered stream:

```text
path NUL byteLength NUL fileSha256 LF
```

Before and after closures must match exactly in count, ordered paths, lengths, digests and package content ID. Symlinked executors, shaders, registry or route selector are rejected. Timestamp-only changes have no authority; content/path changes fail admission.

## 10. Signed preliminary and final admission

P001-P088 are independently loaded and verified before preliminary admission signing. The Ed25519 preliminary receipt binds run, package, package-before closure, registry, adapter, device/profile, 88-leaf root and `PRELIMINARY_88` state.

The trial permit is bound to that signed admission and is run/package/runtime/shader/ABI/device/process/fixture bound, expiring and one-shot. P094 consumes it once and emits a consumption receipt.

After P096, final admission independently reloads all 96 receipts, verifies schema, file/self digests, executor/predicate identities, dependencies, package closure and manifest, then rebuilds the final tree.

The signed physical admission binds all major evidence domains:

```text
QMAP01 parity
submission parity
receipt authenticity
resource plateau
cancellation safety
device-loss recovery
4K completion
8K completion
EFC convergence
runtime bridge
composition root
shader set
ABI set
```

Admission and promotion keys are external Main-process key handles, outside package/evidence root and unavailable to renderer IPC. A self hash alone is not authority.

## 11. Non-forgeable product permit v2

The promotion finalizer receives no pass count, all-pass boolean, caller root or caller artifact list.

It reloads and verifies all 96 receipts, definition/executor/predicate digests, dependencies, preliminary root and signature, trial permit and consumption, final root, manifest, package closure, signed physical admission and expected runtime identities.

The v2 permit binds package, closure, manifest, registry, physical admission and its signature, final 96-leaf root, all major evidence digests, runtime bridge, composition root, shader/ABI/device profile, service ID, global bridge key, QSR03G promotion state and QRC02 qualification-only role.

It is Ed25519-signed by a distinct promotion authority. Product boot verifies schema v2, self digest, signature, pinned public key, package content, runtime/composition/shader/ABI/device bindings, service/bridge identity, physical root and admission-signature binding.

Source bake emits no trial, admission or product permit.

## 12. Implementation and validation surfaces

New runtime surfaces include physical gate types/registry/receipts, artifact types, Merkle types, physical admission, trial permit and permit-v2 verification.

New Electron Main surfaces include canonical JSON, registry, 96 executors, executor coordinator, receipts, allowlist, write-once publisher, package closure, Merkle tree, preliminary finalizer, trial authority, physical finalizer, promotion finalizer, signing authority and evidence-root verifier.

The old boolean-based finalizer is removed from authority use. Existing QSR03 product permit types and validators use schema v2.

QSR03G-R2 requires:

```text
Source Gates = 240/240
Negative controls = 96/96
named physical gates = 96
unique receipt paths = 96
preliminary leaves = 88
final leaves = 96
legacy boolean trust sites = 0
forced-true assignments = 0
```

Negative controls cover legacy count/boolean trust, forced assignments, caller roots/lists, v1 permit, source permit issuance, gate registry mutation, executor/predicate substitution, artifact path and write-once failures, receipt forgery/replacement, nonfinite values, Merkle domain/order faults, foreign run/package/adapter mixing, package mutation/symlinks, premature/replayed trial permit, forged signatures, renderer key access, incomplete evidence and source-time global promotion.

## 13. Source completion state

```text
SOURCE_BAKED_QMAP_STREAMING_REDUCTION_03G_R2_NAMED_96_GATE_REGISTRY_EXACT_ARTIFACT_ALLOWLIST_WRITE_ONCE_EVIDENCE_PUBLICATION_PER_GATE_RECEIPT_DIGEST_PRELIMINARY_88_LEAF_CLOSURE_RUN_BOUND_TRIAL_PERMIT_FINAL_96_LEAF_MERKLE_CLOSURE_SIGNED_ADMISSION_AND_PROMOTION_AUTHORITIES_NO_BOOLEAN_RECEIPT_TRUST_GLOBAL_QRC02_BRIDGE_UNCHANGED_AWAITING_PACKAGED_CANDIDATE_AND_PHYSICAL_EXECUTION
```

Required source facts:

```text
Source Gates = 240/240
Negative controls = 96/96
named gate definitions = 96
unique receipt paths = 96
preliminary/final Merkle leaves = 88/96
legacy boolean trust sites = 0
legacy forced-true assignments = 0
legacy permit v1 admitted = false
physical receipts emitted = 0
trial permits emitted = 0
physical admissions emitted = 0
product permits emitted = 0
physical gates executed = 0/96
global route promoted = false
QRC02 product route = unchanged
```

## 14. Next patch

```text
TDT-QMAP-STREAMING-REDUCTION-03G-R3

Packaged 1080p Candidate Bring-Up /
Real WebGPU Device and Queue Binding /
WGSL Module and Pipeline Admission /
Five-Chunk Command Graph /
Five Covering Submissions /
Final-Chunk Projection /
Candidate Analysis Publication /
Private Resource Retirement /
Zero Validation Error Smoke Seal
```

R3 may use the R2 evidence authority but may not mint the final product promotion permit.

## 15. Final seal

```text
A physical admission is not true because one JSON says 96 of 96.

Every gate has one name, one immutable definition, one packaged executor,
one predicate, exact allowlisted evidence and one write-once receipt.
Every receipt becomes one domain-separated leaf.

P001-P088 may issue only a one-shot qualification trial permit.
P089-P096 complete the isolated promoted-route trial.
The final admission is rebuilt from all 96 receipts.

Package bytes before and after the run must match.
Admission and promotion are separately signed by external authorities.

No pass count is trusted.
No all-pass boolean is trusted.
No caller root is trusted.
No caller artifact list is trusted.
No self hash alone is non-forgeable authority.
```
