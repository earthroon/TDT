# TDT-QMAP-STREAMING-REDUCTION-03G-R14D-R2A

## Exact Overlay Adoption / Base-SHA CAS / Changed-File Digest Manifest / Source-Tree Merkle Root / Generated Runtime Manifest Rebind / Source Gate Preservation / No Orphan Local Overlay Seal

## 0. Identity

```text
Patch ID = TDT-QMAP-STREAMING-REDUCTION-03G-R14D-R2A
Short ID = QSR03G-R14D-R2A
Parent = TDT-QMAP-STREAMING-REDUCTION-03G-R14D-R1
Repair target = R14D-R1 local source overlay outside GitHub SSOT
Umbrella = TDT-QMAP-STREAMING-REDUCTION-03
Repository SSOT = earthroon/TDT
Target branch base = main
Expected base SHA = 737707eb4cda8eec56b32761af68ca2e7db3315d
Specification state = SPEC_READY_AWAITING_SOURCE_BAKE
Required terminal state = SOURCE_BAKED_UNPROMOTED
```

R2A adopts the already baked R14D-R1 local source overlay as one reproducible, content-addressed source-bake transaction. It is not a functional promotion patch and does not claim physical QMap completion.

## 1. Admitted archive identity

```text
archiveFileName = TDT_QMAP_STREAMING_REDUCTION_03G_R14D_R1_LIVE_PRODUCT_DEPENDENCY_CLOSURE_CODE_BAKED(1).zip
archiveSha256 = 09bf121100b5c056df8da48c21437c8b7af60374cc599aa2e62f91208d31c9d6
archiveBytes = 7318376
regularFileCount = 2997
uncompressedRegularFileBytes = 19528444
canonicalArchiveFileManifestSha256 = 46774c7faac17827ebe6a2d79e95879d2c4d0a071e57851b237d56d035904e7e
overlaySourceTreeMerkleRoot = 9f684719a56c53467a1a078143425263edfcad4d9a441ee6855b1425de93f1c0
unsafePathCount = 0
duplicatePathCount = 0
caseFoldCollisionCount = 0
explicitTombstoneCount = 0
```

The ZIP is an overlay input, not a repository replacement image. Paths absent from the archive are not deletions. Deletion requires an explicit tombstone, and R2A admits zero tombstones.

## 2. State ownership

```text
repository base identity
= earthroon/TDT Git commit object

archive transport identity
= SHA-256 of raw ZIP bytes

overlay content identity
= canonical archive file manifest

overlay tree identity
= QSR03G-R2A source-tree Merkle root

base-to-overlay classification
= R2A changed-file manifest generator

generated runtime outputs
= existing canonical repository generators

transaction state
= isolated Git worktree

final adopted source identity
= final Git commit tree
```

## 3. Base-SHA CAS

Before extraction, before applying files, before receipt sealing, and immediately before commit:

```text
git rev-parse HEAD == 737707eb4cda8eec56b32761af68ca2e7db3315d
git cat-file -t expectedBaseSha == commit
tracked changes == 0
untracked paths == 0
index changes == 0
merge state == absent
rebase state == absent
cherry-pick state == absent
```

If `origin/main` is available, it must equal the same SHA. Remote drift, automatic rebase, substituted parent SHA, merge parent, and direct arbitrary-checkout application fail closed.

## 4. Archive safety

Allowed entries:

```text
regular file
directory marker
```

Forbidden entries:

```text
symbolic link
hard link
FIFO
socket
device node
sparse external reference
path outside repository root
encrypted entry
multi-disk or ZIP64 entry
```

Every path is normalized to NFC with `/` separators. Leading slash, empty component, `.`, `..`, NUL, drive prefix, alternate data stream colon, trailing space/dot, Windows reserved device names, duplicate normalized path, case-fold collision, and Unicode-normalized collision are forbidden.

No extraction occurs until the complete central directory passes admission.

## 5. Canonical hashing

```text
contentSha256 = SHA256(raw file bytes)

leafInput =
  UTF8("TDT-R2A-FILE\0")
  + UTF8(normalizedPath)
  + NUL
  + ASCII(decimalByteLength)
  + NUL
  + ASCII(contentSha256)

leafSha256 = SHA256(leafInput)
```

Leaves are sorted by raw UTF-8 path bytes.

```text
overlayTreeInput =
  UTF8("TDT-R2A-TREE\0")
  + ASCII(each leafSha256 + LF)

overlaySourceTreeMerkleRoot = SHA256(overlayTreeInput)
```

The archive manifest stream is:

```text
normalizedPath + NUL + decimalByteLength + NUL + contentSha256 + LF
```

prefixed by `TDT-R2A-MANIFEST\0` and hashed with SHA-256.

## 6. Exact overlay classification

Each admitted archive file terminates in exactly one state:

```text
UNCHANGED
ADD
MODIFY
```

```text
UNCHANGED = base bytes equal archive bytes
ADD = base path absent and archive path present
MODIFY = base path present and content digest differs
DELETE = forbidden without explicit tombstone
```

Rename inference, modification time, text normalization, generated-file hand editing, and archive absence as deletion authority are forbidden.

Each changed entry records:

```text
path
changeKind
baseGitMode
adoptedGitMode
baseByteLength
adoptedByteLength
baseSha256
archiveSha256
adoptedSha256
generatorId
sourcePaths
gitBlobSha
```

## 7. Atomic source-bake transaction

Required order:

```text
verify base CAS
verify raw archive pin
validate all archive entries
extract into private staging root
classify base-to-overlay delta
apply ADD/MODIFY into isolated worktree
run canonical generators
run generators a second time
assert generated output byte stability
run parent source gates
run R2A source gates and mutants
seal changed-file manifest
seal in-commit source-bake payload
compare declared delta with staged delta
commit once with exact parent
emit post-commit attestation outside the commit
```

Failure at any step discards the isolated worktree. The caller checkout is never partially mutated.

## 8. Generated runtime manifest rebind

Required canonical generators:

```text
generate:gpu-device-ssot-01
generate:active-graph-01
generate:production-runtime-manifest
```

Required generated outputs include:

```text
app/src/runtime/active-graph/generated-active-runtime-graph.json
app/src/runtime/active-graph/generated-active-runtime-graph.ts
app/src/runtime/assets/generated-runtime-asset-manifest.json
app/src/runtime/gpu/gpu-consumer-manifest.json
app/src/legacy/generated-legacy-static-admission.json
```

The second generator run must produce identical byte lengths and SHA-256 digests. Timestamp, random UUID, hostname, absolute path, and environment-dependent ordering are forbidden inputs.

## 9. No orphan local overlay

After provisional application:

```text
unchanged + added + modified == 2997
deleted == 0
actual Git delta paths == manifest entries + seal artifacts
package script target missing count == 0
changed-source unresolved local import count == 0
orphan overlay count == 0
undeclared delta count == 0
```

`git add -A` without exact manifest comparison is forbidden. Staging is performed only with the declared path set.

## 10. Source gates

Required terminal source evidence:

```text
R14A source gates = PASS
R14B source gates = PASS
R14C source gates = PASS
R14D source gates = PASS
R14E source gates = PASS
R14D-R1 source gates = 304/304 PASS
R14D-R1 negative controls = 136/136 PASS
R2A source gates = 192/192 PASS
R2A negative controls = 72/72 PASS
R14D-R1 physical gates = 0/80 PENDING
```

R2A may not convert physical pending state into PASS.

## 11. Source-bake payload

Committed payload schema:

```text
tdt.qmap.source-bake.payload.qsr03g-r14d-r2a.v1
```

Required state:

```text
status = SOURCE_CONTENT_VERIFIED
sourceState = SOURCE_BAKED_UNPROMOTED
expectedParentSha = 737707eb4cda8eec56b32761af68ca2e7db3315d
deletedFileCount = 0
orphanOverlayCount = 0
undeclaredDeltaCount = 0
sourceGates = 192/192
negativeControls = 72/72
physicalState = PENDING_NOT_CLAIMED
queueSubmissions = 0
qmapPublications = 0
```

The in-commit payload must not contain its own blob SHA, final commit SHA, or final tree SHA.

## 12. Post-commit attestation

Post-commit attestation schema:

```text
tdt.qmap.source-bake.commit-attestation.qsr03g-r14d-r2a.v1
```

It binds:

```text
commitSha
commitTreeSha
parentShas
changedFileManifestBlobSha
changedFileManifestDigest
sourceBakePayloadBlobSha
sourceBakePayloadDigest
finalCommitChangedFileCount
postCommitDirtyPathCount
attestationDigest
```

The attestation is generated only after the commit exists and is stored as CI evidence, signed Git note, or release evidence. It is not inserted back into the same commit because that would create a commit self-reference cycle.

## 13. Stable failures

```text
E_QMAP03G_R14D_R2A_BASE_SHA_MISMATCH
E_QMAP03G_R14D_R2A_REMOTE_BASE_DRIFT
E_QMAP03G_R14D_R2A_DIRTY_WORKTREE
E_QMAP03G_R14D_R2A_ARCHIVE_DIGEST_MISMATCH
E_QMAP03G_R14D_R2A_ARCHIVE_SIZE_MISMATCH
E_QMAP03G_R14D_R2A_ARCHIVE_ENTRY_UNSAFE
E_QMAP03G_R14D_R2A_ARCHIVE_PATH_COLLISION
E_QMAP03G_R14D_R2A_ARCHIVE_INVENTORY_MISMATCH
E_QMAP03G_R14D_R2A_OVERLAY_TREE_MISMATCH
E_QMAP03G_R14D_R2A_UNDECLARED_DELETE
E_QMAP03G_R14D_R2A_UNDECLARED_DELTA
E_QMAP03G_R14D_R2A_MODE_CHANGE_FORBIDDEN
E_QMAP03G_R14D_R2A_GENERATOR_MISSING
E_QMAP03G_R14D_R2A_GENERATED_OUTPUT_DRIFT
E_QMAP03G_R14D_R2A_GENERATED_OUTPUT_UNDECLARED
E_QMAP03G_R14D_R2A_CHANGED_MANIFEST_INVALID
E_QMAP03G_R14D_R2A_SOURCE_GATE_REGRESSION
E_QMAP03G_R14D_R2A_ORPHAN_OVERLAY
E_QMAP03G_R14D_R2A_COMMIT_PARENT_MISMATCH
E_QMAP03G_R14D_R2A_POST_COMMIT_DIRTY
E_QMAP03G_R14D_R2A_PAYLOAD_DIGEST_MISMATCH
E_QMAP03G_R14D_R2A_ATTESTATION_DIGEST_MISMATCH
```

## 14. Explicit non-goals

```text
physical pre-session canary execution = pending
physical canary executor implementation = absent
queue submissions introduced by R2A = 0
QMap publications introduced by R2A = 0
R9A EFC command graph wiring = pending
Final-EWA source truth repair = pending
placeholder digest repair = pending
Preview binding = pending
Export binding = pending
qmapProductWorkAllowed promotion = false
installed physical startup-canary pass = false
```

Functional corrections belong to R2B or later and require independent patch identities.

## 15. Required terminal state

```text
expected base SHA verified = true
raw archive digest verified = true
archive safety violations = 0
archive regular files accounted = 2997/2997
overlay tree root verified = true
explicit tombstones = 0
deleted files = 0
changed-file manifest sealed = true
generated runtime manifests rebound = true
generator second-run drift = 0
undeclared changed paths = 0
orphan overlay paths = 0
source-bake commit parent = expectedBaseSha
post-commit dirty paths = 0
source state = SOURCE_BAKED_UNPROMOTED
```

## 16. Handoff to R2B

R2A hands R2B these immutable identities:

```text
sourceBakeCommitSha
sourceBakeCommitTreeSha
expectedBaseSha
archiveSha256
archiveFileManifestSha256
overlaySourceTreeMerkleRoot
changedFileManifestDigest
generatedOutputDigestSet
R14D-R1 source gate receipt digest
R2A source gate receipt digest
```

R2B must refuse any worktree or commit that does not reproduce them.

The first R2B boundary remains:

```text
Canonical Digest and Lineage Truth /
Placeholder Digest Elimination /
Compilation Evidence Authority /
Dependency Inventory Derivation /
No Fabricated Receipt Field Seal
```

## 17. Final seal

R2A passes only when the repository can prove:

```text
The admitted R14D-R1 archive was applied as an additive and modifying overlay
onto earthroon/TDT@737707eb4cda8eec56b32761af68ca2e7db3315d.

Every archive file was accounted for.
No deletion was inferred.
Every repository delta was declared.
Every generated runtime manifest was rebuilt by its canonical generator.
All parent source gates remained valid.
No physical product completion was claimed.
The resulting Git tree is the sole source authority for R2B and later work.
```

Anything weaker remains `LOCAL_OVERLAY_UNSEALED`.
