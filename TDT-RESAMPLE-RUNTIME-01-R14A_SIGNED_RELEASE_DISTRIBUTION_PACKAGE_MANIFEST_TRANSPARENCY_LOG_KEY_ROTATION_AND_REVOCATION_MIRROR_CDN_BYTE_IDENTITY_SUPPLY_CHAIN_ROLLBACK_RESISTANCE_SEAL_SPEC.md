# TDT-RESAMPLE-RUNTIME-01-R14A

## Signed Release Distribution / Package Manifest Transparency Log / Key Rotation and Revocation / Mirror·CDN Byte Identity / Supply-Chain Rollback Resistance Seal

> 상태: 명세 확정안
>
> 부모 번들: `61_TDT_RESAMPLE_RUNTIME_01_R13A_FLEET_LOCAL_TRANSITION_SOURCE_BAKED_AWAITING_QUALIFIED_FLEET.zip`
>
> 부모 번들 SHA-256: `2fe000460badb12945aafeed44a49ecfba2d41e6bea15055c9d081bab8b852d9`
>
> 부모 R13A 명세 SHA-256: `0147e19035c89096efaf2e2169362fbdfe2b7c8da6b4125d24036bd5e7d405a5`
>
> 부모 R13A Source Final Receipt 파일 SHA-256: `bba464e8d49a37a947ff93912a8e2b06a24c75e21068eb239b67f62b6f99de33`
>
> 부모 R13A Source Final Receipt self SHA-256: `3d68fee92a582efd61f544b36054e41971da748bfa25a360e0cb41cfb5fbbace`
>
> Production Pointer mirror SHA-256: `1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8`

## 0. 판정 라벨

- **확정**: 부모 R13A 코드와 현재 package·launcher·key registry 코드에서 직접 확인된 사실
- **요구**: R14A 구현이 반드시 만족해야 하는 계약
- **금지**: source·distribution·installation 경로에서 허용하지 않는 동작
- **판단불가**: 실제 signed release, 외부 transparency log, witness, mirror·CDN, packaged Electron 배포 증거가 없어서 현재 확정할 수 없는 항목
- **배포 증거 대기**: Source 하네스는 구현할 수 있으나 R9A physical, R10A release, R11A installed, R12A installed, R13A fleet가 완료되어야 실행 가능한 항목

## 1. 부모 상태와 실제 결선 공백

### 1.1 부모 R13A 상태

**확정**

```text
RESAMPLE_RUNTIME_R13A_FLEET_TO_LOCAL_TRANSITION_BINDING_SOURCE_SEALED_AWAITING_R12A_INSTALLED_AND_QUALIFIED_FLEET

786 SOURCE PASS
744 FLEET PENDING
0 FAIL
```

R13A는 signed rollout plan, role-separated fleet keys, lease·claim·permit, R12A transaction binding, durable evidence outbox, signed acknowledgement, containment·recovery replay를 Source 본선에 결선했다.

R13A는 Production Pointer와 Local Activation Pointer를 직접 변경하지 않는다.

### 1.2 현재 release distribution 공백

**확정**

1. `tools/resample-runtime-01-r10a/schemas/signed-package-manifest.schema.json`은 `schemaVersion`, `schemaId`만 필수로 요구한다.
2. `tools/generate-package-content-manifest.mjs`는 package content digest를 만들지만 release signature, key generation, transparency inclusion, mirror provenance를 포함하지 않는다.
3. R12 package closure는 로컬 파일 집합과 `packageContentId`를 검증하지만 distribution origin과 signed release sequence를 검증하지 않는다.
4. R12A staged package orchestrator는 closure와 staged canary를 검증하지만 transparency checkpoint와 revocation generation을 요구하지 않는다.
5. R13A key registry role은 fleet plan·lease·permit·evidence·containment 중심이며 release root, release targets, snapshot, timestamp, transparency log, witness 역할이 분리되지 않았다.
6. stable launcher는 local package closure를 검증하지만 해당 package가 승인된 signed distribution과 transparency checkpoint에서 왔는지 확인하지 않는다.
7. origin, mirror, CDN, local cache가 동일 package bytes를 제공한다는 증거가 없다.
8. mutable `latest` alias, stale CDN cache, replayed manifest, 오래된 root metadata를 이용한 rollback 공격을 막는 local monotonic trust state가 없다.
9. key rotation과 revocation을 fleet generation과 release sequence에 결속하는 계약이 없다.
10. distribution finalizer가 raw manifest, log proof, mirror receipts, local trust floor를 전부 재계산하는 권위가 없다.

### 1.3 R14A 교정 원칙

```text
offline root metadata
→ delegated release roles
→ signed package manifest v2
→ transparency log append
→ signed checkpoint
→ witness quorum
→ untrusted mirror bytes
→ streaming verification
→ local monotonic trust floor
→ R12A staged admission
→ R13A fleet rollout
```

Mirror·CDN·TLS·ETag는 전달 수단일 뿐 package trust authority가 아니다.

## 2. 목표

R14A는 다음 다섯 가지를 하나의 공급망 계보로 봉인한다.

1. R13A가 승인한 release lineage를 role-separated threshold signature가 있는 Signed Package Manifest v2로 발행한다.
2. 모든 release manifest를 append-only transparency log에 기록하고 inclusion·consistency·witness quorum으로 split view를 탐지한다.
3. root·release·snapshot·timestamp·log·witness key의 rotation과 revocation을 monotonic generation으로 관리한다.
4. origin·mirror·CDN·range response·local cache가 동일한 immutable package bytes를 제공하는지 streaming digest로 검증한다.
5. local secure trust state와 explicit R10A rollback permit을 통해 stale metadata, freeze, replay, downgrade, rollback 공격을 차단한다.

## 3. 비목표

- R14A가 Production Pointer를 직접 CAS하지 않는다.
- R14A가 Local Activation Pointer를 직접 CAS하지 않는다.
- CDN 사업자나 mirror 운영자를 signing authority로 승격하지 않는다.
- TLS 인증서만으로 package identity를 인정하지 않는다.
- ETag, Last-Modified, URL pathname, filename을 package identity로 사용하지 않는다.
- transparency log가 package bytes를 대신 검증한다고 주장하지 않는다.
- wall-clock 단독으로 rollback resistance를 구현하지 않는다.
- key revocation을 기존 로그 entry 삭제로 처리하지 않는다.
- root private key를 online release service, Electron, launcher, renderer에 배포하지 않는다.
- renderer가 release manifest, root metadata, local trust floor를 직접 갱신하지 않는다.
- source fixture를 실제 CDN·mirror distribution PASS로 주장하지 않는다.

## 4. 권위와 SSOT

### 4.1 Release lineage SSOT

```text
R10A final release receipt
R10A lineage restoration receipt
R11A installed final receipt
R12A installed final receipt
R13A fleet final receipt
```

R14A는 이 계보를 read-only로 소비한다.

### 4.2 Offline root SSOT

```text
ROOT_METADATA.json
ROOT_METADATA_SIGNATURE_SET.json
```

Root metadata는 다음을 정의한다.

- root version
- trusted key IDs와 public keys
- role별 threshold
- role delegation
- metadata expiry
- revocation generation floor
- transparency log identity
- witness set와 quorum

### 4.3 Online release metadata SSOT

```text
TARGETS_METADATA.json
SNAPSHOT_METADATA.json
TIMESTAMP_METADATA.json
SIGNED_PACKAGE_MANIFEST_V2.json
```

`latest.json` 같은 mutable alias는 discovery 편의만 제공하며 trust input이 아니다.

### 4.4 Transparency SSOT

```text
append-only leaf log
signed tree checkpoint
inclusion proof
consistency proof
witness signatures
```

같은 tree size에서 다른 root hash가 관측되면 split view로 판정한다.

### 4.5 Local trust SSOT

```text
SECURE_DISTRIBUTION_TRUST_STATE.json
SECURE_DISTRIBUTION_TRUST_LEDGER.jsonl
```

저장 항목:

- highest root version
- highest targets version
- highest snapshot version
- highest timestamp version
- highest release sequence
- highest accepted revocation generation
- highest accepted log tree size와 root hash
- currently admitted package content ID
- explicit rollback permit generation

Windows installed 경로에서는 atomic file과 OS-protected integrity key를 사용한다. Source harness는 deterministic fixture key를 사용하되 installed evidence로 승격하지 않는다.

## 5. Threat Model

R14A는 다음 공격을 명시적으로 차단한다.

- old but validly signed manifest replay
- stale timestamp metadata freeze
- root metadata rollback
- targets version rollback
- release sequence downgrade
- revoked signing key 재사용
- role confusion signature
- threshold 미달 signature set
- transparency log omission
- invalid inclusion proof
- inconsistent checkpoint
- witness split view
- origin과 mirror의 byte divergence
- CDN range splice
- transparent recompression 또는 content transformation
- cache poisoning
- partial download 실행
- verification 전 extraction
- local trust state rollback
- cache 삭제를 이용한 trust floor reset
- rollback package를 normal promotion으로 위장
- summary boolean을 이용한 finalizer 우회

## 6. Canonical Identity

### 6.1 Release identity

```text
releaseId
releaseSequence
releaseEpoch
buildId
packageContentId
packageByteLength
platformTuple
releaseProfileId
```

`releaseSequence`는 동일 release channel에서 단조 증가한다.

### 6.2 Package identity

```text
packageContentId = SHA-256(exact package bytes)
```

Package extraction tree digest는 별도 `installedClosureDigest`로 유지한다. Package bytes digest와 extracted closure digest를 혼동하지 않는다.

### 6.3 Metadata identity

모든 metadata object는 canonical JSON bytes에 대해 SHA-256을 계산하고 role key signature set을 결합한다.

```text
metadataDigest
signatureSetDigest
metadataVersion
role
```

### 6.4 Transparency leaf identity

```text
leafHash = SHA-256(0x00 || canonical leaf bytes)
nodeHash = SHA-256(0x01 || left || right)
```

Leaf에는 package bytes가 아니라 signed manifest digest와 release lineage digest가 들어간다.

## 7. Key Roles and Thresholds

필수 역할:

```text
root
targets
snapshot
timestamp
release
transparency-log
witness
revocation
rollback-permit
```

기본 threshold:

| Role | 기본 threshold | 보관 위치 |
|---|---:|---|
| root | 2-of-3 | offline |
| targets | 2-of-3 | controlled release |
| snapshot | 1-of-2 | online |
| timestamp | 1-of-2 | online short-lived |
| release | 2-of-3 | controlled release |
| transparency-log | 1-of-2 | log service |
| witness | quorum 2-of-3 | independent witness |
| revocation | 2-of-3 | offline or break-glass |
| rollback-permit | 2-of-3 | operator-controlled |

한 key ID가 root와 online timestamp 역할을 동시에 가질 수 없다.

## 8. Root Metadata v1

필수 필드:

```text
schemaVersion
schemaId
rootVersion
previousRootVersion
expiresAt
revocationGeneration
keys
roles
transparencyLog
witnessPolicy
consistentSnapshot
rootSha256
signatures
```

새 root는 다음 두 조건을 모두 만족해야 한다.

1. 현재 trusted root threshold signature
2. 새 root 자체 threshold signature

Bootstrap root만 별도 pinned digest로 허용한다.

## 9. Delegated Metadata

### 9.1 Targets metadata

Signed Package Manifest의 digest, length, release sequence, platform tuple을 지정한다.

### 9.2 Snapshot metadata

Targets와 revocation metadata의 exact version·digest·length를 결속한다.

### 9.3 Timestamp metadata

Snapshot의 exact version·digest·length를 짧은 expiry로 결속한다.

Timestamp는 freshness signal이지만 local monotonic floor를 대체하지 않는다.

## 10. Signed Package Manifest v2

필수 schema ID:

```text
tdt.resample.signed-package-manifest.r14a.v2
```

필수 필드:

```text
releaseId
releaseSequence
releaseEpoch
buildId
packageContentId
packageByteLength
platformTuple
releaseProfileId
runtimeClosureDigest
installedClosureDigest
activeGraphDigest
javascriptParseDigest
generatedWgslManifestDigest
r8aSourceReceiptSha256
r9aPhysicalReceiptSha256
r10aFinalReleaseReceiptSha256
r11aInstalledReceiptSha256
r12aInstalledReceiptSha256
r13aFleetReceiptSha256
rootVersion
targetsVersion
snapshotVersion
revocationGeneration
minimumInstallerVersion
minimumLauncherVersion
createdAt
expiresAt
manifestSha256
signatures
```

Manifest는 package URL을 trust identity로 사용하지 않는다. Mirror list는 별도 distribution metadata다.

## 11. Release Envelope

Release envelope는 다음을 결속한다.

```text
signed package manifest
signature set
transparency leaf promise
immutable object key
mirror set digest
operator approval digest
release receipt digest
```

Envelope 자체도 release role threshold signature를 요구한다.

## 12. Transparency Log

### 12.1 Append-only leaf

Leaf type:

```text
PACKAGE_RELEASE
ROOT_ROTATION
KEY_REVOCATION
ROLLBACK_PERMIT
RELEASE_WITHDRAWAL
```

Leaf는 sequence, manifest digest, package content ID, root version, revocation generation을 포함한다.

### 12.2 Inclusion proof

Installer는 release leaf가 checkpoint root에 포함됨을 검증한다.

### 12.3 Consistency proof

기존 local checkpoint에서 새 checkpoint로 append-only 확장되었음을 검증한다.

이 proof가 없으면 새 checkpoint를 수용하지 않는다.

### 12.4 Split-view detection

```text
same treeSize + different rootHash = E_R14A_LOG_SPLIT_VIEW
```

### 12.5 Witness quorum

Checkpoint는 log signature와 independent witness quorum을 모두 요구한다.

## 13. Key Rotation

Rotation ceremony:

```text
rotation intent
→ new key generation
→ role delegation update
→ old root threshold sign
→ new root threshold sign
→ transparency ROOT_ROTATION leaf
→ witnessed checkpoint
→ local trust state advance
```

Rotation 전후 overlap window를 명시한다. Overlap은 old metadata replay 허용 창이 아니다.

## 14. Key Revocation

Revocation metadata는 다음을 포함한다.

```text
keyId
role
revocationGeneration
effectiveLogIndex
reasonCode
compromiseSeverity
replacementKeyId
revocationSha256
signatures
```

Revoked key로 signed된 release는 effective log index 이후 거부한다.

Historical package는 다음을 모두 만족할 때만 forensic verification 대상으로 읽을 수 있다.

- release leaf가 revocation effective index 이전에 존재
- 당시 checkpoint와 consistency proof가 유효
- normal installation이 아니라 explicit forensic mode

## 15. Mirror and CDN Byte Identity

Mirror는 untrusted byte source다.

필수 source classes:

```text
origin
mirror-a
mirror-b
cdn-edge
local-cache
```

각 fetch receipt:

```text
sourceClass
sourceId
immutableObjectKey
httpStatus
contentLength
observedByteLength
streamSha256
packageContentId
rangeSetDigest
contentEncoding
cacheStatus
receiptSha256
```

`Content-Encoding`에 따른 byte transformation이 있으면 exact package bytes identity를 만족할 수 없으므로 package object fetch에서는 `identity`만 허용한다.

## 16. Range Download and Reassembly

Range chunk는 다음을 결속한다.

```text
packageContentId
packageByteLength
rangeStart
rangeEnd
chunkByteLength
chunkSha256
```

Reassembly 후 전체 stream SHA-256이 manifest의 packageContentId와 같아야 한다.

Overlapping range, missing range, reordered untracked range, different object ETag 조합은 거부한다.

## 17. Streaming Verification

Download 순서:

```text
metadata verification
→ checkpoint verification
→ temp file open
→ streaming length + SHA-256
→ package digest exact
→ atomic rename into immutable cache
→ extraction
→ R12 package closure verification
→ staged canary
```

Verification 전 package 실행·import·extraction을 금지한다.

## 18. Local Secure Trust State

Update rule:

```text
read current state
→ verify MAC/integrity seal
→ verify monotonic metadata
→ verify consistency proof
→ append intent to ledger
→ atomic state replace
→ fsync file and directory
→ append effect
```

Local state가 없어진 경우 trust floor를 0으로 리셋하지 않는다. Recovery는 pinned root와 signed backup trust state 또는 operator recovery ceremony를 요구한다.

## 19. Supply-Chain Rollback Resistance

Normal release admission requires:

```text
rootVersion >= local.rootVersion
targetsVersion >= local.targetsVersion
snapshotVersion >= local.snapshotVersion
timestampVersion >= local.timestampVersion
releaseSequence > local.releaseSequence
revocationGeneration >= local.revocationGeneration
checkpoint.treeSize >= local.treeSize
```

동일 release sequence에서 다른 package content ID는 split brain이다.

## 20. Explicit Rollback Permit

R10A rollback drill 또는 운영 rollback은 old package를 normal release처럼 재배포하지 않는다.

Rollback permit 필수 필드:

```text
permitId
permitGeneration
fromReleaseSequence
toReleaseSequence
fromPackageContentId
toPackageContentId
r10aRollbackReceiptSha256
reasonCode
expiresAt
singleUseNonce
permitSha256
signatures
```

Permit는 transparency log에 기록되고 local trust floor는 낮추지 않는다. Local state는 `activeReleaseSequence`만 permit 대상 값으로 바꾸고 `highestSeenReleaseSequence`는 유지한다.

## 21. R12A Integration

R12A `stageAndVerifyPackage()` 앞에 distribution admission을 추가한다.

```text
R14A distribution admission receipt
→ exact package bytes
→ R12 package closure
→ R12A staged canary
```

R12A staging receipt는 다음 digest를 child로 포함해야 한다.

- signed package manifest digest
- transparency checkpoint digest
- inclusion proof digest
- consistency proof digest
- mirror fetch receipt digest
- local trust state before·after digest

## 22. Stable Launcher Integration

Launcher는 Local Activation Pointer가 가리키는 package에 대해 다음을 검증한다.

```text
packageContentId exact
installedClosureDigest exact
R14A distribution admission receipt present
local trust state admits release sequence
revocation generation current
rollback permit required when active release is below highest seen
```

Distribution receipt가 없으면 local closure가 맞아도 normal launch를 거부한다.

## 23. R13A Fleet Integration

R13A rollout plan은 target package에 다음을 추가로 결속한다.

```text
r14aManifestSha256
r14aCheckpointSha256
r14aRootVersion
r14aReleaseSequence
r14aRevocationGeneration
```

Fleet evidence에는 URL이나 mirror hostname이 아니라 source class와 byte identity result만 허용한다.

## 24. Release Withdrawal

Bad release withdrawal은 package bytes나 old log leaf를 삭제하지 않는다.

```text
RELEASE_WITHDRAWAL leaf
→ witnessed checkpoint
→ targets metadata advance
→ timestamp advance
→ containment generation advance
```

이미 installed된 package는 R11A quarantine와 R13A containment 흐름으로 처리한다.

## 25. Cache Policy

Immutable object key:

```text
packages/sha256/<packageContentId>/<packageFileName>
```

금지:

- package bytes를 mutable `latest` path에만 저장
- same object key에 byte overwrite
- digest verification 없이 cached 304 수용
- cache metadata를 trust floor로 사용

## 26. Network Failure Policy

Network failure는 source fallback 또는 unsigned mirror fallback으로 이어지지 않는다.

허용 terminal outcome:

```text
NO_NETWORK
NO_FRESH_TIMESTAMP
NO_CONSISTENT_CHECKPOINT
NO_VALID_MIRROR
REVOKED_RELEASE
ROLLBACK_BLOCKED
```

기존 admitted package는 local trust state와 installed closure가 유효하면 계속 실행할 수 있다. 새 update만 HOLD한다.

## 27. Privacy Boundary

Distribution evidence에 포함할 수 있는 값:

- release ID와 sequence
- package content ID
- source class
- byte length
- digest result
- metadata versions
- checkpoint tree size
- error category

금지:

- user file path
- image bytes
- account identifier
- precise IP address
- full URL query
- CDN request headers의 개인 식별값
- hardware serial
- raw crash dump

## 28. Finalizer Revalidation

R14A final writer는 다음 raw artifacts를 다시 읽는다.

```text
root chain
role metadata
signed package manifest
release envelope
transparency leaves
inclusion proof
consistency proof
checkpoint signatures
witness signatures
rotation record
revocation record
mirror fetch receipts
range receipts
stream digest receipt
local trust ledger
rollback permit
R12A staging receipt
R13A fleet binding
```

외부의 `signatureValid=true`, `mirrorMatch=true`, `rollbackBlocked=true` 같은 summary boolean은 권위가 아니다.

## 29. Required Implementation Surface

```text
app/features/resample-runtime/r14a/
  r14a-contract.mjs
  canonical-metadata.mjs
  root-metadata.mjs
  role-delegation.mjs
  signed-package-manifest-v2.mjs
  release-envelope.mjs
  transparency-leaf.mjs
  merkle-tree.mjs
  inclusion-proof.mjs
  consistency-proof.mjs
  checkpoint.mjs
  witness-quorum.mjs
  key-rotation.mjs
  key-revocation.mjs
  mirror-metadata.mjs
  streaming-download-verifier.mjs
  range-reassembly.mjs
  immutable-cache.mjs
  local-trust-state.mjs
  rollback-floor.mjs
  rollback-permit.mjs
  distribution-admission.mjs
  release-withdrawal.mjs
  r12a-distribution-adapter.mjs
  r13a-distribution-adapter.mjs
  distribution-finalizer.mjs
```

제품 수정 표면:

```text
app/electron/electron.mjs
app/electron/preload.cjs
app/features/resample-runtime/r12a/staged-package-orchestrator.mjs
app/features/resample-runtime/r12a/main-update-coordinator.mjs
app/features/resample-runtime/r13a/rollout-plan-v2.mjs
app/features/resample-runtime/r13a/fleet-finalizer-v2.mjs
launcher/resample-runtime-r12a/verify-package-closure.mjs
app/src/runtime/update/runtime-update-service.ts
app/src/boot/runtime-modules.ts
Active Graph generator
runtime manifest generator
```

Tooling:

```text
tools/resample-runtime-01-r14a/
  generate-source-artifacts.mjs
  verify-parent-lineage.mjs
  verify-root-metadata.mjs
  verify-package-manifest.mjs
  verify-transparency-log.mjs
  verify-key-rotation-revocation.mjs
  verify-mirror-byte-identity.mjs
  verify-rollback-resistance.mjs
  verify-r12a-r13a-integration.mjs
  verify-negative-controls.mjs
  gate-source.mjs
  run-distribution.mjs
  verify-distribution.mjs
  finalize-source.mjs
  finalize-distribution.mjs
```

## 30. Required Source Artifacts

```text
R14A_PARENT_FREEZE_RECEIPT.json
R14A_R13A_PREDECESSOR_REPORT.json
R14A_CONTRACT_MANIFEST.json
R14A_SCHEMA_MANIFEST.json
R14A_AUTHORITY_SEPARATION_REPORT.json
R14A_ROOT_METADATA_SOURCE_REPORT.json
R14A_PACKAGE_MANIFEST_SOURCE_REPORT.json
R14A_TRANSPARENCY_SOURCE_REPORT.json
R14A_KEY_ROTATION_REVOCATION_SOURCE_REPORT.json
R14A_MIRROR_IDENTITY_SOURCE_REPORT.json
R14A_ROLLBACK_RESISTANCE_SOURCE_REPORT.json
R14A_R12A_R13A_INTEGRATION_REPORT.json
R14A_NEGATIVE_CONTROL_REPORT.json
R14A_SOURCE_GATE_REPORT.json
TDT_RESAMPLE_RUNTIME_01_R14A_SOURCE_FINAL_RECEIPT.json
```

## 31. Required Distribution Artifacts

```text
ROOT_METADATA.json
ROOT_METADATA_SIGNATURE_SET.json
TARGETS_METADATA.json
SNAPSHOT_METADATA.json
TIMESTAMP_METADATA.json
SIGNED_PACKAGE_MANIFEST_V2.json
RELEASE_ENVELOPE.json
TRANSPARENCY_LEAF.json
TRANSPARENCY_INCLUSION_PROOF.json
TRANSPARENCY_CONSISTENCY_PROOF.json
TRANSPARENCY_CHECKPOINT.json
WITNESS_SIGNATURE_SET.json
KEY_ROTATION_RECEIPT.json
KEY_REVOCATION_RECEIPT.json
ORIGIN_FETCH_RECEIPT.json
MIRROR_A_FETCH_RECEIPT.json
MIRROR_B_FETCH_RECEIPT.json
CDN_RANGE_REASSEMBLY_RECEIPT.json
STREAMING_PACKAGE_VERIFICATION_RECEIPT.json
LOCAL_TRUST_STATE_TRANSITION_RECEIPT.json
ROLLBACK_ATTACK_MATRIX_RECEIPT.json
R12A_DISTRIBUTION_ADMISSION_RECEIPT.json
R13A_DISTRIBUTION_BINDING_RECEIPT.json
TDT_RESAMPLE_RUNTIME_01_R14A_DISTRIBUTION_FINAL_RECEIPT.json
```

## 32. Stable Error Taxonomy

```text
E_R14A_PARENT_MISMATCH
E_R14A_ROOT_METADATA_INVALID
E_R14A_ROOT_VERSION_ROLLBACK
E_R14A_ROOT_THRESHOLD_NOT_MET
E_R14A_ROLE_CONFUSION
E_R14A_KEY_UNKNOWN
E_R14A_KEY_REVOKED
E_R14A_KEY_EXPIRED
E_R14A_ROTATION_INVALID
E_R14A_MANIFEST_INVALID
E_R14A_PACKAGE_DIGEST_MISMATCH
E_R14A_PACKAGE_LENGTH_MISMATCH
E_R14A_RELEASE_SEQUENCE_ROLLBACK
E_R14A_METADATA_FREEZE
E_R14A_LOG_LEAF_MISSING
E_R14A_INCLUSION_PROOF_INVALID
E_R14A_CONSISTENCY_PROOF_INVALID
E_R14A_CHECKPOINT_INVALID
E_R14A_WITNESS_QUORUM_NOT_MET
E_R14A_LOG_SPLIT_VIEW
E_R14A_MIRROR_BYTE_DIVERGENCE
E_R14A_RANGE_GAP
E_R14A_RANGE_OVERLAP
E_R14A_CONTENT_TRANSFORM_FORBIDDEN
E_R14A_PREVERIFY_EXECUTION
E_R14A_LOCAL_TRUST_STATE_INVALID
E_R14A_LOCAL_TRUST_STATE_ROLLBACK
E_R14A_ROLLBACK_PERMIT_REQUIRED
E_R14A_ROLLBACK_PERMIT_INVALID
E_R14A_RELEASE_WITHDRAWN
E_R14A_R12A_ADMISSION_MISSING
E_R14A_R13A_BINDING_MISSING
E_R14A_FINALIZER_REVALIDATION_FAILED
E_R14A_DISTRIBUTION_RECEIPT_MISSING
```

## 33. Negative-Control Families

최소 다음 실패를 source harness에서 실행한다.

1. root threshold 1-of-3
2. current root signature 누락
3. new root self-signature 누락
4. root version rollback
5. targets role key로 root metadata 서명
6. revoked release key 사용
7. expired timestamp metadata
8. snapshot digest 변조
9. package byte length 변조
10. package content digest 변조
11. 같은 release sequence의 다른 package
12. log leaf omission
13. invalid inclusion sibling
14. consistency proof 중간 node 변조
15. same tree size split root
16. witness quorum 미달
17. origin과 mirror byte 불일치
18. CDN range gap
19. CDN range overlap
20. gzip transformation
21. ETag만 같고 bytes가 다른 응답
22. partial temp file 실행
23. verification 전 extraction
24. local trust state version rollback
25. local state 삭제 후 floor 0 reset
26. stale timestamp freeze
27. release sequence downgrade
28. revoked release를 cached package로 재사용
29. rollback permit 없이 previous package activation
30. rollback permit nonce replay
31. rollback permit package mismatch
32. R12A staging에서 distribution receipt 누락
33. launcher에서 distribution receipt 누락
34. R13A plan에서 manifest digest 누락
35. withdrawal leaf 이후 normal install
36. summary boolean finalizer 우회
37. mirror URL을 identity로 사용
38. Production Pointer write 시도
39. Local Activation Pointer write 시도
40. 부모 R13A receipt mutation

## 34. Source Acceptance

```text
RESAMPLE_RUNTIME_R14A_SIGNED_DISTRIBUTION_AND_ROLLBACK_RESISTANCE_SOURCE_SEALED_AWAITING_R13A_FLEET_AND_EXTERNAL_DISTRIBUTION

640 SOURCE PASS
760 DISTRIBUTION PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

productionPointerMutatedByR14A      = false
localActivationPointerMutatedByR14A = false
externalDistributionPerformed       = false
historicalPassCarryForward          = 0
```

## 35. Final Distribution Acceptance

```text
RESAMPLE_RUNTIME_R14A_SIGNED_DISTRIBUTION_TRANSPARENCY_AND_ROLLBACK_RESISTANCE_SEALED_AWAITING_R15A

640 SOURCE PASS
760 DISTRIBUTION PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

rootThresholdVerified            = true
packageManifestSigned            = true
transparencyInclusionVerified    = true
checkpointConsistencyVerified    = true
witnessQuorumVerified            = true
keyRotationReplayPassed          = true
keyRevocationReplayPassed        = true
mirrorByteIdentityVerified       = true
cdnRangeReassemblyVerified       = true
localRollbackFloorEnforced       = true
explicitRollbackPermitVerified  = true
r12aDistributionAdmissionPassed = true
r13aDistributionBindingPassed   = true
productionPointerMutatedByR14A  = false
localPointerMutatedByR14A       = false
historicalPassCarryForward      = 0
```

## 36. Source Gate Catalog
### 36.1 PARENT_LINEAGE

#### R14A-S001 `PARENT_LINEAGE_CONTRACT_PRESENT`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S002 `PARENT_LINEAGE_SCHEMA_EXACT`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S003 `PARENT_LINEAGE_AUTHORITY_SINGLE_WRITER`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S004 `PARENT_LINEAGE_INPUT_CANONICAL`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S005 `PARENT_LINEAGE_DIGEST_RECOMPUTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S006 `PARENT_LINEAGE_SIGNATURE_VERIFIED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S007 `PARENT_LINEAGE_GENERATION_MONOTONIC`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S008 `PARENT_LINEAGE_REPLAY_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S009 `PARENT_LINEAGE_SPLIT_BRAIN_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S010 `PARENT_LINEAGE_EXPIRED_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S011 `PARENT_LINEAGE_REVOKED_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S012 `PARENT_LINEAGE_UNKNOWN_KEY_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S013 `PARENT_LINEAGE_ROLE_CONFUSION_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S014 `PARENT_LINEAGE_THRESHOLD_ENFORCED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S015 `PARENT_LINEAGE_PATH_ESCAPE_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S016 `PARENT_LINEAGE_SYMLINK_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S017 `PARENT_LINEAGE_MUTATION_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S018 `PARENT_LINEAGE_PARTIAL_STATE_REJECTED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S019 `PARENT_LINEAGE_ATOMIC_WRITE_REQUIRED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S020 `PARENT_LINEAGE_FSYNC_REQUIRED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S021 `PARENT_LINEAGE_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S022 `PARENT_LINEAGE_SUMMARY_TRUST_ZERO`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S023 `PARENT_LINEAGE_NEGATIVE_CONTROL_PRESENT`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S024 `PARENT_LINEAGE_ACTIVE_GRAPH_WIRED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S025 `PARENT_LINEAGE_RUNTIME_MANIFEST_WIRED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S026 `PARENT_LINEAGE_SOURCE_PARSE_PASS`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S027 `PARENT_LINEAGE_POINTER_WRITE_ZERO`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S028 `PARENT_LINEAGE_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S029 `PARENT_LINEAGE_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S030 `PARENT_LINEAGE_ERROR_CODE_STABLE`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S031 `PARENT_LINEAGE_RECEIPT_SELF_HASHED`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S032 `PARENT_LINEAGE_FINALIZER_INPUT_BOUND`

- **요구**: 부모 R13A 번들·명세·receipt·pointer freeze에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.2 DISTRIBUTION_AUTHORITY

#### R14A-S033 `DISTRIBUTION_AUTHORITY_CONTRACT_PRESENT`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S034 `DISTRIBUTION_AUTHORITY_SCHEMA_EXACT`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S035 `DISTRIBUTION_AUTHORITY_AUTHORITY_SINGLE_WRITER`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S036 `DISTRIBUTION_AUTHORITY_INPUT_CANONICAL`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S037 `DISTRIBUTION_AUTHORITY_DIGEST_RECOMPUTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S038 `DISTRIBUTION_AUTHORITY_SIGNATURE_VERIFIED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S039 `DISTRIBUTION_AUTHORITY_GENERATION_MONOTONIC`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S040 `DISTRIBUTION_AUTHORITY_REPLAY_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S041 `DISTRIBUTION_AUTHORITY_SPLIT_BRAIN_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S042 `DISTRIBUTION_AUTHORITY_EXPIRED_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S043 `DISTRIBUTION_AUTHORITY_REVOKED_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S044 `DISTRIBUTION_AUTHORITY_UNKNOWN_KEY_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S045 `DISTRIBUTION_AUTHORITY_ROLE_CONFUSION_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S046 `DISTRIBUTION_AUTHORITY_THRESHOLD_ENFORCED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S047 `DISTRIBUTION_AUTHORITY_PATH_ESCAPE_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S048 `DISTRIBUTION_AUTHORITY_SYMLINK_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S049 `DISTRIBUTION_AUTHORITY_MUTATION_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S050 `DISTRIBUTION_AUTHORITY_PARTIAL_STATE_REJECTED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S051 `DISTRIBUTION_AUTHORITY_ATOMIC_WRITE_REQUIRED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S052 `DISTRIBUTION_AUTHORITY_FSYNC_REQUIRED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S053 `DISTRIBUTION_AUTHORITY_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S054 `DISTRIBUTION_AUTHORITY_SUMMARY_TRUST_ZERO`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S055 `DISTRIBUTION_AUTHORITY_NEGATIVE_CONTROL_PRESENT`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S056 `DISTRIBUTION_AUTHORITY_ACTIVE_GRAPH_WIRED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S057 `DISTRIBUTION_AUTHORITY_RUNTIME_MANIFEST_WIRED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S058 `DISTRIBUTION_AUTHORITY_SOURCE_PARSE_PASS`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S059 `DISTRIBUTION_AUTHORITY_POINTER_WRITE_ZERO`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S060 `DISTRIBUTION_AUTHORITY_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S061 `DISTRIBUTION_AUTHORITY_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S062 `DISTRIBUTION_AUTHORITY_ERROR_CODE_STABLE`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S063 `DISTRIBUTION_AUTHORITY_RECEIPT_SELF_HASHED`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S064 `DISTRIBUTION_AUTHORITY_FINALIZER_INPUT_BOUND`

- **요구**: release distribution single-writer와 pointer authority 분리에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.3 ROOT_METADATA

#### R14A-S065 `ROOT_METADATA_CONTRACT_PRESENT`

- **요구**: offline root metadata와 threshold에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S066 `ROOT_METADATA_SCHEMA_EXACT`

- **요구**: offline root metadata와 threshold에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S067 `ROOT_METADATA_AUTHORITY_SINGLE_WRITER`

- **요구**: offline root metadata와 threshold에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S068 `ROOT_METADATA_INPUT_CANONICAL`

- **요구**: offline root metadata와 threshold에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S069 `ROOT_METADATA_DIGEST_RECOMPUTED`

- **요구**: offline root metadata와 threshold에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S070 `ROOT_METADATA_SIGNATURE_VERIFIED`

- **요구**: offline root metadata와 threshold에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S071 `ROOT_METADATA_GENERATION_MONOTONIC`

- **요구**: offline root metadata와 threshold에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S072 `ROOT_METADATA_REPLAY_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S073 `ROOT_METADATA_SPLIT_BRAIN_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S074 `ROOT_METADATA_EXPIRED_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S075 `ROOT_METADATA_REVOKED_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S076 `ROOT_METADATA_UNKNOWN_KEY_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S077 `ROOT_METADATA_ROLE_CONFUSION_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S078 `ROOT_METADATA_THRESHOLD_ENFORCED`

- **요구**: offline root metadata와 threshold에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S079 `ROOT_METADATA_PATH_ESCAPE_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S080 `ROOT_METADATA_SYMLINK_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S081 `ROOT_METADATA_MUTATION_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S082 `ROOT_METADATA_PARTIAL_STATE_REJECTED`

- **요구**: offline root metadata와 threshold에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S083 `ROOT_METADATA_ATOMIC_WRITE_REQUIRED`

- **요구**: offline root metadata와 threshold에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S084 `ROOT_METADATA_FSYNC_REQUIRED`

- **요구**: offline root metadata와 threshold에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S085 `ROOT_METADATA_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: offline root metadata와 threshold에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S086 `ROOT_METADATA_SUMMARY_TRUST_ZERO`

- **요구**: offline root metadata와 threshold에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S087 `ROOT_METADATA_NEGATIVE_CONTROL_PRESENT`

- **요구**: offline root metadata와 threshold에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S088 `ROOT_METADATA_ACTIVE_GRAPH_WIRED`

- **요구**: offline root metadata와 threshold에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S089 `ROOT_METADATA_RUNTIME_MANIFEST_WIRED`

- **요구**: offline root metadata와 threshold에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S090 `ROOT_METADATA_SOURCE_PARSE_PASS`

- **요구**: offline root metadata와 threshold에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S091 `ROOT_METADATA_POINTER_WRITE_ZERO`

- **요구**: offline root metadata와 threshold에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S092 `ROOT_METADATA_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: offline root metadata와 threshold에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S093 `ROOT_METADATA_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: offline root metadata와 threshold에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S094 `ROOT_METADATA_ERROR_CODE_STABLE`

- **요구**: offline root metadata와 threshold에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S095 `ROOT_METADATA_RECEIPT_SELF_HASHED`

- **요구**: offline root metadata와 threshold에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S096 `ROOT_METADATA_FINALIZER_INPUT_BOUND`

- **요구**: offline root metadata와 threshold에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.4 ROLE_DELEGATION

#### R14A-S097 `ROLE_DELEGATION_CONTRACT_PRESENT`

- **요구**: role-separated key delegation에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S098 `ROLE_DELEGATION_SCHEMA_EXACT`

- **요구**: role-separated key delegation에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S099 `ROLE_DELEGATION_AUTHORITY_SINGLE_WRITER`

- **요구**: role-separated key delegation에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S100 `ROLE_DELEGATION_INPUT_CANONICAL`

- **요구**: role-separated key delegation에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S101 `ROLE_DELEGATION_DIGEST_RECOMPUTED`

- **요구**: role-separated key delegation에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S102 `ROLE_DELEGATION_SIGNATURE_VERIFIED`

- **요구**: role-separated key delegation에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S103 `ROLE_DELEGATION_GENERATION_MONOTONIC`

- **요구**: role-separated key delegation에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S104 `ROLE_DELEGATION_REPLAY_REJECTED`

- **요구**: role-separated key delegation에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S105 `ROLE_DELEGATION_SPLIT_BRAIN_REJECTED`

- **요구**: role-separated key delegation에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S106 `ROLE_DELEGATION_EXPIRED_REJECTED`

- **요구**: role-separated key delegation에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S107 `ROLE_DELEGATION_REVOKED_REJECTED`

- **요구**: role-separated key delegation에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S108 `ROLE_DELEGATION_UNKNOWN_KEY_REJECTED`

- **요구**: role-separated key delegation에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S109 `ROLE_DELEGATION_ROLE_CONFUSION_REJECTED`

- **요구**: role-separated key delegation에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S110 `ROLE_DELEGATION_THRESHOLD_ENFORCED`

- **요구**: role-separated key delegation에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S111 `ROLE_DELEGATION_PATH_ESCAPE_REJECTED`

- **요구**: role-separated key delegation에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S112 `ROLE_DELEGATION_SYMLINK_REJECTED`

- **요구**: role-separated key delegation에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S113 `ROLE_DELEGATION_MUTATION_REJECTED`

- **요구**: role-separated key delegation에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S114 `ROLE_DELEGATION_PARTIAL_STATE_REJECTED`

- **요구**: role-separated key delegation에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S115 `ROLE_DELEGATION_ATOMIC_WRITE_REQUIRED`

- **요구**: role-separated key delegation에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S116 `ROLE_DELEGATION_FSYNC_REQUIRED`

- **요구**: role-separated key delegation에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S117 `ROLE_DELEGATION_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: role-separated key delegation에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S118 `ROLE_DELEGATION_SUMMARY_TRUST_ZERO`

- **요구**: role-separated key delegation에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S119 `ROLE_DELEGATION_NEGATIVE_CONTROL_PRESENT`

- **요구**: role-separated key delegation에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S120 `ROLE_DELEGATION_ACTIVE_GRAPH_WIRED`

- **요구**: role-separated key delegation에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S121 `ROLE_DELEGATION_RUNTIME_MANIFEST_WIRED`

- **요구**: role-separated key delegation에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S122 `ROLE_DELEGATION_SOURCE_PARSE_PASS`

- **요구**: role-separated key delegation에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S123 `ROLE_DELEGATION_POINTER_WRITE_ZERO`

- **요구**: role-separated key delegation에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S124 `ROLE_DELEGATION_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: role-separated key delegation에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S125 `ROLE_DELEGATION_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: role-separated key delegation에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S126 `ROLE_DELEGATION_ERROR_CODE_STABLE`

- **요구**: role-separated key delegation에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S127 `ROLE_DELEGATION_RECEIPT_SELF_HASHED`

- **요구**: role-separated key delegation에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S128 `ROLE_DELEGATION_FINALIZER_INPUT_BOUND`

- **요구**: role-separated key delegation에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.5 PACKAGE_MANIFEST

#### R14A-S129 `PACKAGE_MANIFEST_CONTRACT_PRESENT`

- **요구**: Signed Package Manifest v2에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S130 `PACKAGE_MANIFEST_SCHEMA_EXACT`

- **요구**: Signed Package Manifest v2에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S131 `PACKAGE_MANIFEST_AUTHORITY_SINGLE_WRITER`

- **요구**: Signed Package Manifest v2에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S132 `PACKAGE_MANIFEST_INPUT_CANONICAL`

- **요구**: Signed Package Manifest v2에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S133 `PACKAGE_MANIFEST_DIGEST_RECOMPUTED`

- **요구**: Signed Package Manifest v2에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S134 `PACKAGE_MANIFEST_SIGNATURE_VERIFIED`

- **요구**: Signed Package Manifest v2에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S135 `PACKAGE_MANIFEST_GENERATION_MONOTONIC`

- **요구**: Signed Package Manifest v2에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S136 `PACKAGE_MANIFEST_REPLAY_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S137 `PACKAGE_MANIFEST_SPLIT_BRAIN_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S138 `PACKAGE_MANIFEST_EXPIRED_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S139 `PACKAGE_MANIFEST_REVOKED_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S140 `PACKAGE_MANIFEST_UNKNOWN_KEY_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S141 `PACKAGE_MANIFEST_ROLE_CONFUSION_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S142 `PACKAGE_MANIFEST_THRESHOLD_ENFORCED`

- **요구**: Signed Package Manifest v2에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S143 `PACKAGE_MANIFEST_PATH_ESCAPE_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S144 `PACKAGE_MANIFEST_SYMLINK_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S145 `PACKAGE_MANIFEST_MUTATION_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S146 `PACKAGE_MANIFEST_PARTIAL_STATE_REJECTED`

- **요구**: Signed Package Manifest v2에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S147 `PACKAGE_MANIFEST_ATOMIC_WRITE_REQUIRED`

- **요구**: Signed Package Manifest v2에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S148 `PACKAGE_MANIFEST_FSYNC_REQUIRED`

- **요구**: Signed Package Manifest v2에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S149 `PACKAGE_MANIFEST_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: Signed Package Manifest v2에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S150 `PACKAGE_MANIFEST_SUMMARY_TRUST_ZERO`

- **요구**: Signed Package Manifest v2에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S151 `PACKAGE_MANIFEST_NEGATIVE_CONTROL_PRESENT`

- **요구**: Signed Package Manifest v2에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S152 `PACKAGE_MANIFEST_ACTIVE_GRAPH_WIRED`

- **요구**: Signed Package Manifest v2에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S153 `PACKAGE_MANIFEST_RUNTIME_MANIFEST_WIRED`

- **요구**: Signed Package Manifest v2에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S154 `PACKAGE_MANIFEST_SOURCE_PARSE_PASS`

- **요구**: Signed Package Manifest v2에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S155 `PACKAGE_MANIFEST_POINTER_WRITE_ZERO`

- **요구**: Signed Package Manifest v2에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S156 `PACKAGE_MANIFEST_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: Signed Package Manifest v2에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S157 `PACKAGE_MANIFEST_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: Signed Package Manifest v2에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S158 `PACKAGE_MANIFEST_ERROR_CODE_STABLE`

- **요구**: Signed Package Manifest v2에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S159 `PACKAGE_MANIFEST_RECEIPT_SELF_HASHED`

- **요구**: Signed Package Manifest v2에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S160 `PACKAGE_MANIFEST_FINALIZER_INPUT_BOUND`

- **요구**: Signed Package Manifest v2에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.6 RELEASE_ENVELOPE

#### R14A-S161 `RELEASE_ENVELOPE_CONTRACT_PRESENT`

- **요구**: release envelope와 immutable object binding에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S162 `RELEASE_ENVELOPE_SCHEMA_EXACT`

- **요구**: release envelope와 immutable object binding에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S163 `RELEASE_ENVELOPE_AUTHORITY_SINGLE_WRITER`

- **요구**: release envelope와 immutable object binding에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S164 `RELEASE_ENVELOPE_INPUT_CANONICAL`

- **요구**: release envelope와 immutable object binding에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S165 `RELEASE_ENVELOPE_DIGEST_RECOMPUTED`

- **요구**: release envelope와 immutable object binding에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S166 `RELEASE_ENVELOPE_SIGNATURE_VERIFIED`

- **요구**: release envelope와 immutable object binding에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S167 `RELEASE_ENVELOPE_GENERATION_MONOTONIC`

- **요구**: release envelope와 immutable object binding에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S168 `RELEASE_ENVELOPE_REPLAY_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S169 `RELEASE_ENVELOPE_SPLIT_BRAIN_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S170 `RELEASE_ENVELOPE_EXPIRED_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S171 `RELEASE_ENVELOPE_REVOKED_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S172 `RELEASE_ENVELOPE_UNKNOWN_KEY_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S173 `RELEASE_ENVELOPE_ROLE_CONFUSION_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S174 `RELEASE_ENVELOPE_THRESHOLD_ENFORCED`

- **요구**: release envelope와 immutable object binding에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S175 `RELEASE_ENVELOPE_PATH_ESCAPE_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S176 `RELEASE_ENVELOPE_SYMLINK_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S177 `RELEASE_ENVELOPE_MUTATION_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S178 `RELEASE_ENVELOPE_PARTIAL_STATE_REJECTED`

- **요구**: release envelope와 immutable object binding에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S179 `RELEASE_ENVELOPE_ATOMIC_WRITE_REQUIRED`

- **요구**: release envelope와 immutable object binding에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S180 `RELEASE_ENVELOPE_FSYNC_REQUIRED`

- **요구**: release envelope와 immutable object binding에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S181 `RELEASE_ENVELOPE_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: release envelope와 immutable object binding에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S182 `RELEASE_ENVELOPE_SUMMARY_TRUST_ZERO`

- **요구**: release envelope와 immutable object binding에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S183 `RELEASE_ENVELOPE_NEGATIVE_CONTROL_PRESENT`

- **요구**: release envelope와 immutable object binding에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S184 `RELEASE_ENVELOPE_ACTIVE_GRAPH_WIRED`

- **요구**: release envelope와 immutable object binding에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S185 `RELEASE_ENVELOPE_RUNTIME_MANIFEST_WIRED`

- **요구**: release envelope와 immutable object binding에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S186 `RELEASE_ENVELOPE_SOURCE_PARSE_PASS`

- **요구**: release envelope와 immutable object binding에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S187 `RELEASE_ENVELOPE_POINTER_WRITE_ZERO`

- **요구**: release envelope와 immutable object binding에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S188 `RELEASE_ENVELOPE_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: release envelope와 immutable object binding에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S189 `RELEASE_ENVELOPE_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: release envelope와 immutable object binding에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S190 `RELEASE_ENVELOPE_ERROR_CODE_STABLE`

- **요구**: release envelope와 immutable object binding에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S191 `RELEASE_ENVELOPE_RECEIPT_SELF_HASHED`

- **요구**: release envelope와 immutable object binding에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S192 `RELEASE_ENVELOPE_FINALIZER_INPUT_BOUND`

- **요구**: release envelope와 immutable object binding에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.7 TRANSPARENCY_LEAF

#### R14A-S193 `TRANSPARENCY_LEAF_CONTRACT_PRESENT`

- **요구**: transparency leaf canonicalization에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S194 `TRANSPARENCY_LEAF_SCHEMA_EXACT`

- **요구**: transparency leaf canonicalization에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S195 `TRANSPARENCY_LEAF_AUTHORITY_SINGLE_WRITER`

- **요구**: transparency leaf canonicalization에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S196 `TRANSPARENCY_LEAF_INPUT_CANONICAL`

- **요구**: transparency leaf canonicalization에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S197 `TRANSPARENCY_LEAF_DIGEST_RECOMPUTED`

- **요구**: transparency leaf canonicalization에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S198 `TRANSPARENCY_LEAF_SIGNATURE_VERIFIED`

- **요구**: transparency leaf canonicalization에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S199 `TRANSPARENCY_LEAF_GENERATION_MONOTONIC`

- **요구**: transparency leaf canonicalization에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S200 `TRANSPARENCY_LEAF_REPLAY_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S201 `TRANSPARENCY_LEAF_SPLIT_BRAIN_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S202 `TRANSPARENCY_LEAF_EXPIRED_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S203 `TRANSPARENCY_LEAF_REVOKED_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S204 `TRANSPARENCY_LEAF_UNKNOWN_KEY_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S205 `TRANSPARENCY_LEAF_ROLE_CONFUSION_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S206 `TRANSPARENCY_LEAF_THRESHOLD_ENFORCED`

- **요구**: transparency leaf canonicalization에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S207 `TRANSPARENCY_LEAF_PATH_ESCAPE_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S208 `TRANSPARENCY_LEAF_SYMLINK_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S209 `TRANSPARENCY_LEAF_MUTATION_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S210 `TRANSPARENCY_LEAF_PARTIAL_STATE_REJECTED`

- **요구**: transparency leaf canonicalization에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S211 `TRANSPARENCY_LEAF_ATOMIC_WRITE_REQUIRED`

- **요구**: transparency leaf canonicalization에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S212 `TRANSPARENCY_LEAF_FSYNC_REQUIRED`

- **요구**: transparency leaf canonicalization에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S213 `TRANSPARENCY_LEAF_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: transparency leaf canonicalization에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S214 `TRANSPARENCY_LEAF_SUMMARY_TRUST_ZERO`

- **요구**: transparency leaf canonicalization에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S215 `TRANSPARENCY_LEAF_NEGATIVE_CONTROL_PRESENT`

- **요구**: transparency leaf canonicalization에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S216 `TRANSPARENCY_LEAF_ACTIVE_GRAPH_WIRED`

- **요구**: transparency leaf canonicalization에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S217 `TRANSPARENCY_LEAF_RUNTIME_MANIFEST_WIRED`

- **요구**: transparency leaf canonicalization에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S218 `TRANSPARENCY_LEAF_SOURCE_PARSE_PASS`

- **요구**: transparency leaf canonicalization에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S219 `TRANSPARENCY_LEAF_POINTER_WRITE_ZERO`

- **요구**: transparency leaf canonicalization에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S220 `TRANSPARENCY_LEAF_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: transparency leaf canonicalization에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S221 `TRANSPARENCY_LEAF_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: transparency leaf canonicalization에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S222 `TRANSPARENCY_LEAF_ERROR_CODE_STABLE`

- **요구**: transparency leaf canonicalization에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S223 `TRANSPARENCY_LEAF_RECEIPT_SELF_HASHED`

- **요구**: transparency leaf canonicalization에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S224 `TRANSPARENCY_LEAF_FINALIZER_INPUT_BOUND`

- **요구**: transparency leaf canonicalization에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.8 MERKLE_INCLUSION

#### R14A-S225 `MERKLE_INCLUSION_CONTRACT_PRESENT`

- **요구**: Merkle inclusion proof에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S226 `MERKLE_INCLUSION_SCHEMA_EXACT`

- **요구**: Merkle inclusion proof에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S227 `MERKLE_INCLUSION_AUTHORITY_SINGLE_WRITER`

- **요구**: Merkle inclusion proof에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S228 `MERKLE_INCLUSION_INPUT_CANONICAL`

- **요구**: Merkle inclusion proof에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S229 `MERKLE_INCLUSION_DIGEST_RECOMPUTED`

- **요구**: Merkle inclusion proof에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S230 `MERKLE_INCLUSION_SIGNATURE_VERIFIED`

- **요구**: Merkle inclusion proof에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S231 `MERKLE_INCLUSION_GENERATION_MONOTONIC`

- **요구**: Merkle inclusion proof에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S232 `MERKLE_INCLUSION_REPLAY_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S233 `MERKLE_INCLUSION_SPLIT_BRAIN_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S234 `MERKLE_INCLUSION_EXPIRED_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S235 `MERKLE_INCLUSION_REVOKED_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S236 `MERKLE_INCLUSION_UNKNOWN_KEY_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S237 `MERKLE_INCLUSION_ROLE_CONFUSION_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S238 `MERKLE_INCLUSION_THRESHOLD_ENFORCED`

- **요구**: Merkle inclusion proof에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S239 `MERKLE_INCLUSION_PATH_ESCAPE_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S240 `MERKLE_INCLUSION_SYMLINK_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S241 `MERKLE_INCLUSION_MUTATION_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S242 `MERKLE_INCLUSION_PARTIAL_STATE_REJECTED`

- **요구**: Merkle inclusion proof에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S243 `MERKLE_INCLUSION_ATOMIC_WRITE_REQUIRED`

- **요구**: Merkle inclusion proof에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S244 `MERKLE_INCLUSION_FSYNC_REQUIRED`

- **요구**: Merkle inclusion proof에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S245 `MERKLE_INCLUSION_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: Merkle inclusion proof에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S246 `MERKLE_INCLUSION_SUMMARY_TRUST_ZERO`

- **요구**: Merkle inclusion proof에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S247 `MERKLE_INCLUSION_NEGATIVE_CONTROL_PRESENT`

- **요구**: Merkle inclusion proof에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S248 `MERKLE_INCLUSION_ACTIVE_GRAPH_WIRED`

- **요구**: Merkle inclusion proof에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S249 `MERKLE_INCLUSION_RUNTIME_MANIFEST_WIRED`

- **요구**: Merkle inclusion proof에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S250 `MERKLE_INCLUSION_SOURCE_PARSE_PASS`

- **요구**: Merkle inclusion proof에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S251 `MERKLE_INCLUSION_POINTER_WRITE_ZERO`

- **요구**: Merkle inclusion proof에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S252 `MERKLE_INCLUSION_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: Merkle inclusion proof에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S253 `MERKLE_INCLUSION_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: Merkle inclusion proof에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S254 `MERKLE_INCLUSION_ERROR_CODE_STABLE`

- **요구**: Merkle inclusion proof에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S255 `MERKLE_INCLUSION_RECEIPT_SELF_HASHED`

- **요구**: Merkle inclusion proof에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S256 `MERKLE_INCLUSION_FINALIZER_INPUT_BOUND`

- **요구**: Merkle inclusion proof에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.9 CHECKPOINT_CONSISTENCY

#### R14A-S257 `CHECKPOINT_CONSISTENCY_CONTRACT_PRESENT`

- **요구**: checkpoint consistency proof에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S258 `CHECKPOINT_CONSISTENCY_SCHEMA_EXACT`

- **요구**: checkpoint consistency proof에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S259 `CHECKPOINT_CONSISTENCY_AUTHORITY_SINGLE_WRITER`

- **요구**: checkpoint consistency proof에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S260 `CHECKPOINT_CONSISTENCY_INPUT_CANONICAL`

- **요구**: checkpoint consistency proof에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S261 `CHECKPOINT_CONSISTENCY_DIGEST_RECOMPUTED`

- **요구**: checkpoint consistency proof에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S262 `CHECKPOINT_CONSISTENCY_SIGNATURE_VERIFIED`

- **요구**: checkpoint consistency proof에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S263 `CHECKPOINT_CONSISTENCY_GENERATION_MONOTONIC`

- **요구**: checkpoint consistency proof에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S264 `CHECKPOINT_CONSISTENCY_REPLAY_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S265 `CHECKPOINT_CONSISTENCY_SPLIT_BRAIN_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S266 `CHECKPOINT_CONSISTENCY_EXPIRED_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S267 `CHECKPOINT_CONSISTENCY_REVOKED_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S268 `CHECKPOINT_CONSISTENCY_UNKNOWN_KEY_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S269 `CHECKPOINT_CONSISTENCY_ROLE_CONFUSION_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S270 `CHECKPOINT_CONSISTENCY_THRESHOLD_ENFORCED`

- **요구**: checkpoint consistency proof에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S271 `CHECKPOINT_CONSISTENCY_PATH_ESCAPE_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S272 `CHECKPOINT_CONSISTENCY_SYMLINK_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S273 `CHECKPOINT_CONSISTENCY_MUTATION_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S274 `CHECKPOINT_CONSISTENCY_PARTIAL_STATE_REJECTED`

- **요구**: checkpoint consistency proof에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S275 `CHECKPOINT_CONSISTENCY_ATOMIC_WRITE_REQUIRED`

- **요구**: checkpoint consistency proof에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S276 `CHECKPOINT_CONSISTENCY_FSYNC_REQUIRED`

- **요구**: checkpoint consistency proof에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S277 `CHECKPOINT_CONSISTENCY_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: checkpoint consistency proof에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S278 `CHECKPOINT_CONSISTENCY_SUMMARY_TRUST_ZERO`

- **요구**: checkpoint consistency proof에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S279 `CHECKPOINT_CONSISTENCY_NEGATIVE_CONTROL_PRESENT`

- **요구**: checkpoint consistency proof에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S280 `CHECKPOINT_CONSISTENCY_ACTIVE_GRAPH_WIRED`

- **요구**: checkpoint consistency proof에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S281 `CHECKPOINT_CONSISTENCY_RUNTIME_MANIFEST_WIRED`

- **요구**: checkpoint consistency proof에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S282 `CHECKPOINT_CONSISTENCY_SOURCE_PARSE_PASS`

- **요구**: checkpoint consistency proof에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S283 `CHECKPOINT_CONSISTENCY_POINTER_WRITE_ZERO`

- **요구**: checkpoint consistency proof에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S284 `CHECKPOINT_CONSISTENCY_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: checkpoint consistency proof에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S285 `CHECKPOINT_CONSISTENCY_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: checkpoint consistency proof에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S286 `CHECKPOINT_CONSISTENCY_ERROR_CODE_STABLE`

- **요구**: checkpoint consistency proof에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S287 `CHECKPOINT_CONSISTENCY_RECEIPT_SELF_HASHED`

- **요구**: checkpoint consistency proof에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S288 `CHECKPOINT_CONSISTENCY_FINALIZER_INPUT_BOUND`

- **요구**: checkpoint consistency proof에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.10 WITNESS_QUORUM

#### R14A-S289 `WITNESS_QUORUM_CONTRACT_PRESENT`

- **요구**: independent witness quorum에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S290 `WITNESS_QUORUM_SCHEMA_EXACT`

- **요구**: independent witness quorum에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S291 `WITNESS_QUORUM_AUTHORITY_SINGLE_WRITER`

- **요구**: independent witness quorum에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S292 `WITNESS_QUORUM_INPUT_CANONICAL`

- **요구**: independent witness quorum에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S293 `WITNESS_QUORUM_DIGEST_RECOMPUTED`

- **요구**: independent witness quorum에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S294 `WITNESS_QUORUM_SIGNATURE_VERIFIED`

- **요구**: independent witness quorum에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S295 `WITNESS_QUORUM_GENERATION_MONOTONIC`

- **요구**: independent witness quorum에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S296 `WITNESS_QUORUM_REPLAY_REJECTED`

- **요구**: independent witness quorum에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S297 `WITNESS_QUORUM_SPLIT_BRAIN_REJECTED`

- **요구**: independent witness quorum에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S298 `WITNESS_QUORUM_EXPIRED_REJECTED`

- **요구**: independent witness quorum에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S299 `WITNESS_QUORUM_REVOKED_REJECTED`

- **요구**: independent witness quorum에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S300 `WITNESS_QUORUM_UNKNOWN_KEY_REJECTED`

- **요구**: independent witness quorum에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S301 `WITNESS_QUORUM_ROLE_CONFUSION_REJECTED`

- **요구**: independent witness quorum에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S302 `WITNESS_QUORUM_THRESHOLD_ENFORCED`

- **요구**: independent witness quorum에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S303 `WITNESS_QUORUM_PATH_ESCAPE_REJECTED`

- **요구**: independent witness quorum에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S304 `WITNESS_QUORUM_SYMLINK_REJECTED`

- **요구**: independent witness quorum에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S305 `WITNESS_QUORUM_MUTATION_REJECTED`

- **요구**: independent witness quorum에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S306 `WITNESS_QUORUM_PARTIAL_STATE_REJECTED`

- **요구**: independent witness quorum에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S307 `WITNESS_QUORUM_ATOMIC_WRITE_REQUIRED`

- **요구**: independent witness quorum에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S308 `WITNESS_QUORUM_FSYNC_REQUIRED`

- **요구**: independent witness quorum에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S309 `WITNESS_QUORUM_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: independent witness quorum에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S310 `WITNESS_QUORUM_SUMMARY_TRUST_ZERO`

- **요구**: independent witness quorum에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S311 `WITNESS_QUORUM_NEGATIVE_CONTROL_PRESENT`

- **요구**: independent witness quorum에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S312 `WITNESS_QUORUM_ACTIVE_GRAPH_WIRED`

- **요구**: independent witness quorum에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S313 `WITNESS_QUORUM_RUNTIME_MANIFEST_WIRED`

- **요구**: independent witness quorum에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S314 `WITNESS_QUORUM_SOURCE_PARSE_PASS`

- **요구**: independent witness quorum에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S315 `WITNESS_QUORUM_POINTER_WRITE_ZERO`

- **요구**: independent witness quorum에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S316 `WITNESS_QUORUM_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: independent witness quorum에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S317 `WITNESS_QUORUM_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: independent witness quorum에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S318 `WITNESS_QUORUM_ERROR_CODE_STABLE`

- **요구**: independent witness quorum에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S319 `WITNESS_QUORUM_RECEIPT_SELF_HASHED`

- **요구**: independent witness quorum에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S320 `WITNESS_QUORUM_FINALIZER_INPUT_BOUND`

- **요구**: independent witness quorum에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.11 KEY_ROTATION

#### R14A-S321 `KEY_ROTATION_CONTRACT_PRESENT`

- **요구**: root·role key rotation에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S322 `KEY_ROTATION_SCHEMA_EXACT`

- **요구**: root·role key rotation에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S323 `KEY_ROTATION_AUTHORITY_SINGLE_WRITER`

- **요구**: root·role key rotation에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S324 `KEY_ROTATION_INPUT_CANONICAL`

- **요구**: root·role key rotation에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S325 `KEY_ROTATION_DIGEST_RECOMPUTED`

- **요구**: root·role key rotation에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S326 `KEY_ROTATION_SIGNATURE_VERIFIED`

- **요구**: root·role key rotation에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S327 `KEY_ROTATION_GENERATION_MONOTONIC`

- **요구**: root·role key rotation에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S328 `KEY_ROTATION_REPLAY_REJECTED`

- **요구**: root·role key rotation에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S329 `KEY_ROTATION_SPLIT_BRAIN_REJECTED`

- **요구**: root·role key rotation에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S330 `KEY_ROTATION_EXPIRED_REJECTED`

- **요구**: root·role key rotation에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S331 `KEY_ROTATION_REVOKED_REJECTED`

- **요구**: root·role key rotation에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S332 `KEY_ROTATION_UNKNOWN_KEY_REJECTED`

- **요구**: root·role key rotation에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S333 `KEY_ROTATION_ROLE_CONFUSION_REJECTED`

- **요구**: root·role key rotation에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S334 `KEY_ROTATION_THRESHOLD_ENFORCED`

- **요구**: root·role key rotation에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S335 `KEY_ROTATION_PATH_ESCAPE_REJECTED`

- **요구**: root·role key rotation에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S336 `KEY_ROTATION_SYMLINK_REJECTED`

- **요구**: root·role key rotation에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S337 `KEY_ROTATION_MUTATION_REJECTED`

- **요구**: root·role key rotation에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S338 `KEY_ROTATION_PARTIAL_STATE_REJECTED`

- **요구**: root·role key rotation에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S339 `KEY_ROTATION_ATOMIC_WRITE_REQUIRED`

- **요구**: root·role key rotation에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S340 `KEY_ROTATION_FSYNC_REQUIRED`

- **요구**: root·role key rotation에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S341 `KEY_ROTATION_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: root·role key rotation에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S342 `KEY_ROTATION_SUMMARY_TRUST_ZERO`

- **요구**: root·role key rotation에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S343 `KEY_ROTATION_NEGATIVE_CONTROL_PRESENT`

- **요구**: root·role key rotation에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S344 `KEY_ROTATION_ACTIVE_GRAPH_WIRED`

- **요구**: root·role key rotation에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S345 `KEY_ROTATION_RUNTIME_MANIFEST_WIRED`

- **요구**: root·role key rotation에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S346 `KEY_ROTATION_SOURCE_PARSE_PASS`

- **요구**: root·role key rotation에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S347 `KEY_ROTATION_POINTER_WRITE_ZERO`

- **요구**: root·role key rotation에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S348 `KEY_ROTATION_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: root·role key rotation에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S349 `KEY_ROTATION_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: root·role key rotation에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S350 `KEY_ROTATION_ERROR_CODE_STABLE`

- **요구**: root·role key rotation에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S351 `KEY_ROTATION_RECEIPT_SELF_HASHED`

- **요구**: root·role key rotation에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S352 `KEY_ROTATION_FINALIZER_INPUT_BOUND`

- **요구**: root·role key rotation에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.12 KEY_REVOCATION

#### R14A-S353 `KEY_REVOCATION_CONTRACT_PRESENT`

- **요구**: revocation generation과 effective log index에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S354 `KEY_REVOCATION_SCHEMA_EXACT`

- **요구**: revocation generation과 effective log index에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S355 `KEY_REVOCATION_AUTHORITY_SINGLE_WRITER`

- **요구**: revocation generation과 effective log index에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S356 `KEY_REVOCATION_INPUT_CANONICAL`

- **요구**: revocation generation과 effective log index에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S357 `KEY_REVOCATION_DIGEST_RECOMPUTED`

- **요구**: revocation generation과 effective log index에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S358 `KEY_REVOCATION_SIGNATURE_VERIFIED`

- **요구**: revocation generation과 effective log index에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S359 `KEY_REVOCATION_GENERATION_MONOTONIC`

- **요구**: revocation generation과 effective log index에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S360 `KEY_REVOCATION_REPLAY_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S361 `KEY_REVOCATION_SPLIT_BRAIN_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S362 `KEY_REVOCATION_EXPIRED_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S363 `KEY_REVOCATION_REVOKED_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S364 `KEY_REVOCATION_UNKNOWN_KEY_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S365 `KEY_REVOCATION_ROLE_CONFUSION_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S366 `KEY_REVOCATION_THRESHOLD_ENFORCED`

- **요구**: revocation generation과 effective log index에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S367 `KEY_REVOCATION_PATH_ESCAPE_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S368 `KEY_REVOCATION_SYMLINK_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S369 `KEY_REVOCATION_MUTATION_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S370 `KEY_REVOCATION_PARTIAL_STATE_REJECTED`

- **요구**: revocation generation과 effective log index에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S371 `KEY_REVOCATION_ATOMIC_WRITE_REQUIRED`

- **요구**: revocation generation과 effective log index에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S372 `KEY_REVOCATION_FSYNC_REQUIRED`

- **요구**: revocation generation과 effective log index에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S373 `KEY_REVOCATION_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: revocation generation과 effective log index에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S374 `KEY_REVOCATION_SUMMARY_TRUST_ZERO`

- **요구**: revocation generation과 effective log index에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S375 `KEY_REVOCATION_NEGATIVE_CONTROL_PRESENT`

- **요구**: revocation generation과 effective log index에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S376 `KEY_REVOCATION_ACTIVE_GRAPH_WIRED`

- **요구**: revocation generation과 effective log index에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S377 `KEY_REVOCATION_RUNTIME_MANIFEST_WIRED`

- **요구**: revocation generation과 effective log index에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S378 `KEY_REVOCATION_SOURCE_PARSE_PASS`

- **요구**: revocation generation과 effective log index에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S379 `KEY_REVOCATION_POINTER_WRITE_ZERO`

- **요구**: revocation generation과 effective log index에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S380 `KEY_REVOCATION_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: revocation generation과 effective log index에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S381 `KEY_REVOCATION_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: revocation generation과 effective log index에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S382 `KEY_REVOCATION_ERROR_CODE_STABLE`

- **요구**: revocation generation과 effective log index에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S383 `KEY_REVOCATION_RECEIPT_SELF_HASHED`

- **요구**: revocation generation과 effective log index에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S384 `KEY_REVOCATION_FINALIZER_INPUT_BOUND`

- **요구**: revocation generation과 effective log index에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.13 MIRROR_IDENTITY

#### R14A-S385 `MIRROR_IDENTITY_CONTRACT_PRESENT`

- **요구**: origin·mirror·CDN byte identity에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S386 `MIRROR_IDENTITY_SCHEMA_EXACT`

- **요구**: origin·mirror·CDN byte identity에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S387 `MIRROR_IDENTITY_AUTHORITY_SINGLE_WRITER`

- **요구**: origin·mirror·CDN byte identity에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S388 `MIRROR_IDENTITY_INPUT_CANONICAL`

- **요구**: origin·mirror·CDN byte identity에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S389 `MIRROR_IDENTITY_DIGEST_RECOMPUTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S390 `MIRROR_IDENTITY_SIGNATURE_VERIFIED`

- **요구**: origin·mirror·CDN byte identity에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S391 `MIRROR_IDENTITY_GENERATION_MONOTONIC`

- **요구**: origin·mirror·CDN byte identity에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S392 `MIRROR_IDENTITY_REPLAY_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S393 `MIRROR_IDENTITY_SPLIT_BRAIN_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S394 `MIRROR_IDENTITY_EXPIRED_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S395 `MIRROR_IDENTITY_REVOKED_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S396 `MIRROR_IDENTITY_UNKNOWN_KEY_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S397 `MIRROR_IDENTITY_ROLE_CONFUSION_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S398 `MIRROR_IDENTITY_THRESHOLD_ENFORCED`

- **요구**: origin·mirror·CDN byte identity에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S399 `MIRROR_IDENTITY_PATH_ESCAPE_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S400 `MIRROR_IDENTITY_SYMLINK_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S401 `MIRROR_IDENTITY_MUTATION_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S402 `MIRROR_IDENTITY_PARTIAL_STATE_REJECTED`

- **요구**: origin·mirror·CDN byte identity에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S403 `MIRROR_IDENTITY_ATOMIC_WRITE_REQUIRED`

- **요구**: origin·mirror·CDN byte identity에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S404 `MIRROR_IDENTITY_FSYNC_REQUIRED`

- **요구**: origin·mirror·CDN byte identity에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S405 `MIRROR_IDENTITY_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: origin·mirror·CDN byte identity에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S406 `MIRROR_IDENTITY_SUMMARY_TRUST_ZERO`

- **요구**: origin·mirror·CDN byte identity에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S407 `MIRROR_IDENTITY_NEGATIVE_CONTROL_PRESENT`

- **요구**: origin·mirror·CDN byte identity에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S408 `MIRROR_IDENTITY_ACTIVE_GRAPH_WIRED`

- **요구**: origin·mirror·CDN byte identity에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S409 `MIRROR_IDENTITY_RUNTIME_MANIFEST_WIRED`

- **요구**: origin·mirror·CDN byte identity에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S410 `MIRROR_IDENTITY_SOURCE_PARSE_PASS`

- **요구**: origin·mirror·CDN byte identity에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S411 `MIRROR_IDENTITY_POINTER_WRITE_ZERO`

- **요구**: origin·mirror·CDN byte identity에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S412 `MIRROR_IDENTITY_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: origin·mirror·CDN byte identity에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S413 `MIRROR_IDENTITY_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: origin·mirror·CDN byte identity에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S414 `MIRROR_IDENTITY_ERROR_CODE_STABLE`

- **요구**: origin·mirror·CDN byte identity에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S415 `MIRROR_IDENTITY_RECEIPT_SELF_HASHED`

- **요구**: origin·mirror·CDN byte identity에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S416 `MIRROR_IDENTITY_FINALIZER_INPUT_BOUND`

- **요구**: origin·mirror·CDN byte identity에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.14 STREAMING_DOWNLOAD

#### R14A-S417 `STREAMING_DOWNLOAD_CONTRACT_PRESENT`

- **요구**: streaming digest와 preverify execution 차단에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S418 `STREAMING_DOWNLOAD_SCHEMA_EXACT`

- **요구**: streaming digest와 preverify execution 차단에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S419 `STREAMING_DOWNLOAD_AUTHORITY_SINGLE_WRITER`

- **요구**: streaming digest와 preverify execution 차단에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S420 `STREAMING_DOWNLOAD_INPUT_CANONICAL`

- **요구**: streaming digest와 preverify execution 차단에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S421 `STREAMING_DOWNLOAD_DIGEST_RECOMPUTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S422 `STREAMING_DOWNLOAD_SIGNATURE_VERIFIED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S423 `STREAMING_DOWNLOAD_GENERATION_MONOTONIC`

- **요구**: streaming digest와 preverify execution 차단에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S424 `STREAMING_DOWNLOAD_REPLAY_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S425 `STREAMING_DOWNLOAD_SPLIT_BRAIN_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S426 `STREAMING_DOWNLOAD_EXPIRED_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S427 `STREAMING_DOWNLOAD_REVOKED_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S428 `STREAMING_DOWNLOAD_UNKNOWN_KEY_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S429 `STREAMING_DOWNLOAD_ROLE_CONFUSION_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S430 `STREAMING_DOWNLOAD_THRESHOLD_ENFORCED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S431 `STREAMING_DOWNLOAD_PATH_ESCAPE_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S432 `STREAMING_DOWNLOAD_SYMLINK_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S433 `STREAMING_DOWNLOAD_MUTATION_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S434 `STREAMING_DOWNLOAD_PARTIAL_STATE_REJECTED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S435 `STREAMING_DOWNLOAD_ATOMIC_WRITE_REQUIRED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S436 `STREAMING_DOWNLOAD_FSYNC_REQUIRED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S437 `STREAMING_DOWNLOAD_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: streaming digest와 preverify execution 차단에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S438 `STREAMING_DOWNLOAD_SUMMARY_TRUST_ZERO`

- **요구**: streaming digest와 preverify execution 차단에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S439 `STREAMING_DOWNLOAD_NEGATIVE_CONTROL_PRESENT`

- **요구**: streaming digest와 preverify execution 차단에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S440 `STREAMING_DOWNLOAD_ACTIVE_GRAPH_WIRED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S441 `STREAMING_DOWNLOAD_RUNTIME_MANIFEST_WIRED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S442 `STREAMING_DOWNLOAD_SOURCE_PARSE_PASS`

- **요구**: streaming digest와 preverify execution 차단에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S443 `STREAMING_DOWNLOAD_POINTER_WRITE_ZERO`

- **요구**: streaming digest와 preverify execution 차단에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S444 `STREAMING_DOWNLOAD_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: streaming digest와 preverify execution 차단에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S445 `STREAMING_DOWNLOAD_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S446 `STREAMING_DOWNLOAD_ERROR_CODE_STABLE`

- **요구**: streaming digest와 preverify execution 차단에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S447 `STREAMING_DOWNLOAD_RECEIPT_SELF_HASHED`

- **요구**: streaming digest와 preverify execution 차단에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S448 `STREAMING_DOWNLOAD_FINALIZER_INPUT_BOUND`

- **요구**: streaming digest와 preverify execution 차단에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.15 LOCAL_TRUST_STATE

#### R14A-S449 `LOCAL_TRUST_STATE_CONTRACT_PRESENT`

- **요구**: local monotonic trust state에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S450 `LOCAL_TRUST_STATE_SCHEMA_EXACT`

- **요구**: local monotonic trust state에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S451 `LOCAL_TRUST_STATE_AUTHORITY_SINGLE_WRITER`

- **요구**: local monotonic trust state에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S452 `LOCAL_TRUST_STATE_INPUT_CANONICAL`

- **요구**: local monotonic trust state에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S453 `LOCAL_TRUST_STATE_DIGEST_RECOMPUTED`

- **요구**: local monotonic trust state에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S454 `LOCAL_TRUST_STATE_SIGNATURE_VERIFIED`

- **요구**: local monotonic trust state에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S455 `LOCAL_TRUST_STATE_GENERATION_MONOTONIC`

- **요구**: local monotonic trust state에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S456 `LOCAL_TRUST_STATE_REPLAY_REJECTED`

- **요구**: local monotonic trust state에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S457 `LOCAL_TRUST_STATE_SPLIT_BRAIN_REJECTED`

- **요구**: local monotonic trust state에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S458 `LOCAL_TRUST_STATE_EXPIRED_REJECTED`

- **요구**: local monotonic trust state에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S459 `LOCAL_TRUST_STATE_REVOKED_REJECTED`

- **요구**: local monotonic trust state에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S460 `LOCAL_TRUST_STATE_UNKNOWN_KEY_REJECTED`

- **요구**: local monotonic trust state에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S461 `LOCAL_TRUST_STATE_ROLE_CONFUSION_REJECTED`

- **요구**: local monotonic trust state에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S462 `LOCAL_TRUST_STATE_THRESHOLD_ENFORCED`

- **요구**: local monotonic trust state에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S463 `LOCAL_TRUST_STATE_PATH_ESCAPE_REJECTED`

- **요구**: local monotonic trust state에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S464 `LOCAL_TRUST_STATE_SYMLINK_REJECTED`

- **요구**: local monotonic trust state에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S465 `LOCAL_TRUST_STATE_MUTATION_REJECTED`

- **요구**: local monotonic trust state에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S466 `LOCAL_TRUST_STATE_PARTIAL_STATE_REJECTED`

- **요구**: local monotonic trust state에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S467 `LOCAL_TRUST_STATE_ATOMIC_WRITE_REQUIRED`

- **요구**: local monotonic trust state에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S468 `LOCAL_TRUST_STATE_FSYNC_REQUIRED`

- **요구**: local monotonic trust state에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S469 `LOCAL_TRUST_STATE_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: local monotonic trust state에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S470 `LOCAL_TRUST_STATE_SUMMARY_TRUST_ZERO`

- **요구**: local monotonic trust state에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S471 `LOCAL_TRUST_STATE_NEGATIVE_CONTROL_PRESENT`

- **요구**: local monotonic trust state에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S472 `LOCAL_TRUST_STATE_ACTIVE_GRAPH_WIRED`

- **요구**: local monotonic trust state에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S473 `LOCAL_TRUST_STATE_RUNTIME_MANIFEST_WIRED`

- **요구**: local monotonic trust state에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S474 `LOCAL_TRUST_STATE_SOURCE_PARSE_PASS`

- **요구**: local monotonic trust state에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S475 `LOCAL_TRUST_STATE_POINTER_WRITE_ZERO`

- **요구**: local monotonic trust state에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S476 `LOCAL_TRUST_STATE_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: local monotonic trust state에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S477 `LOCAL_TRUST_STATE_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: local monotonic trust state에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S478 `LOCAL_TRUST_STATE_ERROR_CODE_STABLE`

- **요구**: local monotonic trust state에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S479 `LOCAL_TRUST_STATE_RECEIPT_SELF_HASHED`

- **요구**: local monotonic trust state에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S480 `LOCAL_TRUST_STATE_FINALIZER_INPUT_BOUND`

- **요구**: local monotonic trust state에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.16 ROLLBACK_FLOOR

#### R14A-S481 `ROLLBACK_FLOOR_CONTRACT_PRESENT`

- **요구**: release sequence와 metadata rollback floor에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S482 `ROLLBACK_FLOOR_SCHEMA_EXACT`

- **요구**: release sequence와 metadata rollback floor에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S483 `ROLLBACK_FLOOR_AUTHORITY_SINGLE_WRITER`

- **요구**: release sequence와 metadata rollback floor에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S484 `ROLLBACK_FLOOR_INPUT_CANONICAL`

- **요구**: release sequence와 metadata rollback floor에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S485 `ROLLBACK_FLOOR_DIGEST_RECOMPUTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S486 `ROLLBACK_FLOOR_SIGNATURE_VERIFIED`

- **요구**: release sequence와 metadata rollback floor에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S487 `ROLLBACK_FLOOR_GENERATION_MONOTONIC`

- **요구**: release sequence와 metadata rollback floor에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S488 `ROLLBACK_FLOOR_REPLAY_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S489 `ROLLBACK_FLOOR_SPLIT_BRAIN_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S490 `ROLLBACK_FLOOR_EXPIRED_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S491 `ROLLBACK_FLOOR_REVOKED_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S492 `ROLLBACK_FLOOR_UNKNOWN_KEY_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S493 `ROLLBACK_FLOOR_ROLE_CONFUSION_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S494 `ROLLBACK_FLOOR_THRESHOLD_ENFORCED`

- **요구**: release sequence와 metadata rollback floor에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S495 `ROLLBACK_FLOOR_PATH_ESCAPE_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S496 `ROLLBACK_FLOOR_SYMLINK_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S497 `ROLLBACK_FLOOR_MUTATION_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S498 `ROLLBACK_FLOOR_PARTIAL_STATE_REJECTED`

- **요구**: release sequence와 metadata rollback floor에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S499 `ROLLBACK_FLOOR_ATOMIC_WRITE_REQUIRED`

- **요구**: release sequence와 metadata rollback floor에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S500 `ROLLBACK_FLOOR_FSYNC_REQUIRED`

- **요구**: release sequence와 metadata rollback floor에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S501 `ROLLBACK_FLOOR_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: release sequence와 metadata rollback floor에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S502 `ROLLBACK_FLOOR_SUMMARY_TRUST_ZERO`

- **요구**: release sequence와 metadata rollback floor에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S503 `ROLLBACK_FLOOR_NEGATIVE_CONTROL_PRESENT`

- **요구**: release sequence와 metadata rollback floor에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S504 `ROLLBACK_FLOOR_ACTIVE_GRAPH_WIRED`

- **요구**: release sequence와 metadata rollback floor에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S505 `ROLLBACK_FLOOR_RUNTIME_MANIFEST_WIRED`

- **요구**: release sequence와 metadata rollback floor에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S506 `ROLLBACK_FLOOR_SOURCE_PARSE_PASS`

- **요구**: release sequence와 metadata rollback floor에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S507 `ROLLBACK_FLOOR_POINTER_WRITE_ZERO`

- **요구**: release sequence와 metadata rollback floor에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S508 `ROLLBACK_FLOOR_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: release sequence와 metadata rollback floor에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S509 `ROLLBACK_FLOOR_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: release sequence와 metadata rollback floor에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S510 `ROLLBACK_FLOOR_ERROR_CODE_STABLE`

- **요구**: release sequence와 metadata rollback floor에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S511 `ROLLBACK_FLOOR_RECEIPT_SELF_HASHED`

- **요구**: release sequence와 metadata rollback floor에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S512 `ROLLBACK_FLOOR_FINALIZER_INPUT_BOUND`

- **요구**: release sequence와 metadata rollback floor에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.17 R12A_STAGE_ADMISSION

#### R14A-S513 `R12A_STAGE_ADMISSION_CONTRACT_PRESENT`

- **요구**: R12A staging과 launcher 결선에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S514 `R12A_STAGE_ADMISSION_SCHEMA_EXACT`

- **요구**: R12A staging과 launcher 결선에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S515 `R12A_STAGE_ADMISSION_AUTHORITY_SINGLE_WRITER`

- **요구**: R12A staging과 launcher 결선에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S516 `R12A_STAGE_ADMISSION_INPUT_CANONICAL`

- **요구**: R12A staging과 launcher 결선에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S517 `R12A_STAGE_ADMISSION_DIGEST_RECOMPUTED`

- **요구**: R12A staging과 launcher 결선에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S518 `R12A_STAGE_ADMISSION_SIGNATURE_VERIFIED`

- **요구**: R12A staging과 launcher 결선에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S519 `R12A_STAGE_ADMISSION_GENERATION_MONOTONIC`

- **요구**: R12A staging과 launcher 결선에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S520 `R12A_STAGE_ADMISSION_REPLAY_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S521 `R12A_STAGE_ADMISSION_SPLIT_BRAIN_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S522 `R12A_STAGE_ADMISSION_EXPIRED_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S523 `R12A_STAGE_ADMISSION_REVOKED_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S524 `R12A_STAGE_ADMISSION_UNKNOWN_KEY_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S525 `R12A_STAGE_ADMISSION_ROLE_CONFUSION_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S526 `R12A_STAGE_ADMISSION_THRESHOLD_ENFORCED`

- **요구**: R12A staging과 launcher 결선에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S527 `R12A_STAGE_ADMISSION_PATH_ESCAPE_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S528 `R12A_STAGE_ADMISSION_SYMLINK_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S529 `R12A_STAGE_ADMISSION_MUTATION_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S530 `R12A_STAGE_ADMISSION_PARTIAL_STATE_REJECTED`

- **요구**: R12A staging과 launcher 결선에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S531 `R12A_STAGE_ADMISSION_ATOMIC_WRITE_REQUIRED`

- **요구**: R12A staging과 launcher 결선에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S532 `R12A_STAGE_ADMISSION_FSYNC_REQUIRED`

- **요구**: R12A staging과 launcher 결선에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S533 `R12A_STAGE_ADMISSION_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: R12A staging과 launcher 결선에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S534 `R12A_STAGE_ADMISSION_SUMMARY_TRUST_ZERO`

- **요구**: R12A staging과 launcher 결선에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S535 `R12A_STAGE_ADMISSION_NEGATIVE_CONTROL_PRESENT`

- **요구**: R12A staging과 launcher 결선에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S536 `R12A_STAGE_ADMISSION_ACTIVE_GRAPH_WIRED`

- **요구**: R12A staging과 launcher 결선에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S537 `R12A_STAGE_ADMISSION_RUNTIME_MANIFEST_WIRED`

- **요구**: R12A staging과 launcher 결선에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S538 `R12A_STAGE_ADMISSION_SOURCE_PARSE_PASS`

- **요구**: R12A staging과 launcher 결선에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S539 `R12A_STAGE_ADMISSION_POINTER_WRITE_ZERO`

- **요구**: R12A staging과 launcher 결선에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S540 `R12A_STAGE_ADMISSION_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: R12A staging과 launcher 결선에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S541 `R12A_STAGE_ADMISSION_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: R12A staging과 launcher 결선에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S542 `R12A_STAGE_ADMISSION_ERROR_CODE_STABLE`

- **요구**: R12A staging과 launcher 결선에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S543 `R12A_STAGE_ADMISSION_RECEIPT_SELF_HASHED`

- **요구**: R12A staging과 launcher 결선에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S544 `R12A_STAGE_ADMISSION_FINALIZER_INPUT_BOUND`

- **요구**: R12A staging과 launcher 결선에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.18 R13A_FLEET_BINDING

#### R14A-S545 `R13A_FLEET_BINDING_CONTRACT_PRESENT`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S546 `R13A_FLEET_BINDING_SCHEMA_EXACT`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S547 `R13A_FLEET_BINDING_AUTHORITY_SINGLE_WRITER`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S548 `R13A_FLEET_BINDING_INPUT_CANONICAL`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S549 `R13A_FLEET_BINDING_DIGEST_RECOMPUTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S550 `R13A_FLEET_BINDING_SIGNATURE_VERIFIED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S551 `R13A_FLEET_BINDING_GENERATION_MONOTONIC`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S552 `R13A_FLEET_BINDING_REPLAY_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S553 `R13A_FLEET_BINDING_SPLIT_BRAIN_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S554 `R13A_FLEET_BINDING_EXPIRED_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S555 `R13A_FLEET_BINDING_REVOKED_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S556 `R13A_FLEET_BINDING_UNKNOWN_KEY_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S557 `R13A_FLEET_BINDING_ROLE_CONFUSION_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S558 `R13A_FLEET_BINDING_THRESHOLD_ENFORCED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S559 `R13A_FLEET_BINDING_PATH_ESCAPE_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S560 `R13A_FLEET_BINDING_SYMLINK_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S561 `R13A_FLEET_BINDING_MUTATION_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S562 `R13A_FLEET_BINDING_PARTIAL_STATE_REJECTED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S563 `R13A_FLEET_BINDING_ATOMIC_WRITE_REQUIRED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S564 `R13A_FLEET_BINDING_FSYNC_REQUIRED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S565 `R13A_FLEET_BINDING_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S566 `R13A_FLEET_BINDING_SUMMARY_TRUST_ZERO`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S567 `R13A_FLEET_BINDING_NEGATIVE_CONTROL_PRESENT`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S568 `R13A_FLEET_BINDING_ACTIVE_GRAPH_WIRED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S569 `R13A_FLEET_BINDING_RUNTIME_MANIFEST_WIRED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S570 `R13A_FLEET_BINDING_SOURCE_PARSE_PASS`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S571 `R13A_FLEET_BINDING_POINTER_WRITE_ZERO`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S572 `R13A_FLEET_BINDING_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S573 `R13A_FLEET_BINDING_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S574 `R13A_FLEET_BINDING_ERROR_CODE_STABLE`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S575 `R13A_FLEET_BINDING_RECEIPT_SELF_HASHED`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S576 `R13A_FLEET_BINDING_FINALIZER_INPUT_BOUND`

- **요구**: R13A rollout plan과 distribution digest 결속에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.19 FINALIZER_REVALIDATION

#### R14A-S577 `FINALIZER_REVALIDATION_CONTRACT_PRESENT`

- **요구**: raw artifact finalizer 재검증에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S578 `FINALIZER_REVALIDATION_SCHEMA_EXACT`

- **요구**: raw artifact finalizer 재검증에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S579 `FINALIZER_REVALIDATION_AUTHORITY_SINGLE_WRITER`

- **요구**: raw artifact finalizer 재검증에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S580 `FINALIZER_REVALIDATION_INPUT_CANONICAL`

- **요구**: raw artifact finalizer 재검증에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S581 `FINALIZER_REVALIDATION_DIGEST_RECOMPUTED`

- **요구**: raw artifact finalizer 재검증에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S582 `FINALIZER_REVALIDATION_SIGNATURE_VERIFIED`

- **요구**: raw artifact finalizer 재검증에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S583 `FINALIZER_REVALIDATION_GENERATION_MONOTONIC`

- **요구**: raw artifact finalizer 재검증에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S584 `FINALIZER_REVALIDATION_REPLAY_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S585 `FINALIZER_REVALIDATION_SPLIT_BRAIN_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S586 `FINALIZER_REVALIDATION_EXPIRED_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S587 `FINALIZER_REVALIDATION_REVOKED_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S588 `FINALIZER_REVALIDATION_UNKNOWN_KEY_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S589 `FINALIZER_REVALIDATION_ROLE_CONFUSION_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S590 `FINALIZER_REVALIDATION_THRESHOLD_ENFORCED`

- **요구**: raw artifact finalizer 재검증에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S591 `FINALIZER_REVALIDATION_PATH_ESCAPE_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S592 `FINALIZER_REVALIDATION_SYMLINK_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S593 `FINALIZER_REVALIDATION_MUTATION_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S594 `FINALIZER_REVALIDATION_PARTIAL_STATE_REJECTED`

- **요구**: raw artifact finalizer 재검증에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S595 `FINALIZER_REVALIDATION_ATOMIC_WRITE_REQUIRED`

- **요구**: raw artifact finalizer 재검증에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S596 `FINALIZER_REVALIDATION_FSYNC_REQUIRED`

- **요구**: raw artifact finalizer 재검증에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S597 `FINALIZER_REVALIDATION_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: raw artifact finalizer 재검증에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S598 `FINALIZER_REVALIDATION_SUMMARY_TRUST_ZERO`

- **요구**: raw artifact finalizer 재검증에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S599 `FINALIZER_REVALIDATION_NEGATIVE_CONTROL_PRESENT`

- **요구**: raw artifact finalizer 재검증에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S600 `FINALIZER_REVALIDATION_ACTIVE_GRAPH_WIRED`

- **요구**: raw artifact finalizer 재검증에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S601 `FINALIZER_REVALIDATION_RUNTIME_MANIFEST_WIRED`

- **요구**: raw artifact finalizer 재검증에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S602 `FINALIZER_REVALIDATION_SOURCE_PARSE_PASS`

- **요구**: raw artifact finalizer 재검증에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S603 `FINALIZER_REVALIDATION_POINTER_WRITE_ZERO`

- **요구**: raw artifact finalizer 재검증에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S604 `FINALIZER_REVALIDATION_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: raw artifact finalizer 재검증에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S605 `FINALIZER_REVALIDATION_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: raw artifact finalizer 재검증에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S606 `FINALIZER_REVALIDATION_ERROR_CODE_STABLE`

- **요구**: raw artifact finalizer 재검증에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S607 `FINALIZER_REVALIDATION_RECEIPT_SELF_HASHED`

- **요구**: raw artifact finalizer 재검증에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S608 `FINALIZER_REVALIDATION_FINALIZER_INPUT_BOUND`

- **요구**: raw artifact finalizer 재검증에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

### 36.20 SOURCE_TOOLING

#### R14A-S609 `SOURCE_TOOLING_CONTRACT_PRESENT`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `CONTRACT_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S610 `SOURCE_TOOLING_SCHEMA_EXACT`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `SCHEMA_EXACT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S611 `SOURCE_TOOLING_AUTHORITY_SINGLE_WRITER`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `AUTHORITY_SINGLE_WRITER` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S612 `SOURCE_TOOLING_INPUT_CANONICAL`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `INPUT_CANONICAL` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S613 `SOURCE_TOOLING_DIGEST_RECOMPUTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `DIGEST_RECOMPUTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S614 `SOURCE_TOOLING_SIGNATURE_VERIFIED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `SIGNATURE_VERIFIED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S615 `SOURCE_TOOLING_GENERATION_MONOTONIC`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `GENERATION_MONOTONIC` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S616 `SOURCE_TOOLING_REPLAY_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `REPLAY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S617 `SOURCE_TOOLING_SPLIT_BRAIN_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `SPLIT_BRAIN_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S618 `SOURCE_TOOLING_EXPIRED_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `EXPIRED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S619 `SOURCE_TOOLING_REVOKED_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `REVOKED_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S620 `SOURCE_TOOLING_UNKNOWN_KEY_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `UNKNOWN_KEY_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S621 `SOURCE_TOOLING_ROLE_CONFUSION_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `ROLE_CONFUSION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S622 `SOURCE_TOOLING_THRESHOLD_ENFORCED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `THRESHOLD_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S623 `SOURCE_TOOLING_PATH_ESCAPE_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `PATH_ESCAPE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S624 `SOURCE_TOOLING_SYMLINK_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `SYMLINK_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S625 `SOURCE_TOOLING_MUTATION_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `MUTATION_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S626 `SOURCE_TOOLING_PARTIAL_STATE_REJECTED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `PARTIAL_STATE_REJECTED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S627 `SOURCE_TOOLING_ATOMIC_WRITE_REQUIRED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `ATOMIC_WRITE_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S628 `SOURCE_TOOLING_FSYNC_REQUIRED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `FSYNC_REQUIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S629 `SOURCE_TOOLING_NETWORK_FALLBACK_FORBIDDEN`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `NETWORK_FALLBACK_FORBIDDEN` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S630 `SOURCE_TOOLING_SUMMARY_TRUST_ZERO`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `SUMMARY_TRUST_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S631 `SOURCE_TOOLING_NEGATIVE_CONTROL_PRESENT`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `NEGATIVE_CONTROL_PRESENT` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S632 `SOURCE_TOOLING_ACTIVE_GRAPH_WIRED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `ACTIVE_GRAPH_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S633 `SOURCE_TOOLING_RUNTIME_MANIFEST_WIRED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `RUNTIME_MANIFEST_WIRED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S634 `SOURCE_TOOLING_SOURCE_PARSE_PASS`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `SOURCE_PARSE_PASS` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S635 `SOURCE_TOOLING_POINTER_WRITE_ZERO`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `POINTER_WRITE_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S636 `SOURCE_TOOLING_HISTORICAL_CARRY_FORWARD_ZERO`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `HISTORICAL_CARRY_FORWARD_ZERO` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S637 `SOURCE_TOOLING_PRIVACY_BOUNDARY_ENFORCED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `PRIVACY_BOUNDARY_ENFORCED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S638 `SOURCE_TOOLING_ERROR_CODE_STABLE`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `ERROR_CODE_STABLE` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S639 `SOURCE_TOOLING_RECEIPT_SELF_HASHED`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `RECEIPT_SELF_HASHED` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

#### R14A-S640 `SOURCE_TOOLING_FINALIZER_INPUT_BOUND`

- **요구**: schema·Active Graph·runtime manifest·source harness에 대해 `FINALIZER_INPUT_BOUND` 조건을 source 구현과 deterministic fixture에서 만족해야 한다.
- **증거**: source module, schema, canonical fixture, verifier report, stable error receipt
- **실패**: 조건 누락, signature·digest 불일치, 권위 혼합, fail-open, summary boolean 신뢰 시 FAIL

## 37. Distribution Gate Catalog

### 37.1 ROOT_BOOTSTRAP

#### R14A-P001 `ROOT_BOOTSTRAP_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P002 `ROOT_BOOTSTRAP_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P003 `ROOT_BOOTSTRAP_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P004 `ROOT_BOOTSTRAP_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P005 `ROOT_BOOTSTRAP_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P006 `ROOT_BOOTSTRAP_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P007 `ROOT_BOOTSTRAP_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P008 `ROOT_BOOTSTRAP_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P009 `ROOT_BOOTSTRAP_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P010 `ROOT_BOOTSTRAP_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P011 `ROOT_BOOTSTRAP_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P012 `ROOT_BOOTSTRAP_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P013 `ROOT_BOOTSTRAP_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P014 `ROOT_BOOTSTRAP_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P015 `ROOT_BOOTSTRAP_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P016 `ROOT_BOOTSTRAP_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P017 `ROOT_BOOTSTRAP_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P018 `ROOT_BOOTSTRAP_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P019 `ROOT_BOOTSTRAP_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P020 `ROOT_BOOTSTRAP_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P021 `ROOT_BOOTSTRAP_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P022 `ROOT_BOOTSTRAP_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P023 `ROOT_BOOTSTRAP_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P024 `ROOT_BOOTSTRAP_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P025 `ROOT_BOOTSTRAP_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P026 `ROOT_BOOTSTRAP_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P027 `ROOT_BOOTSTRAP_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P028 `ROOT_BOOTSTRAP_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P029 `ROOT_BOOTSTRAP_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P030 `ROOT_BOOTSTRAP_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P031 `ROOT_BOOTSTRAP_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P032 `ROOT_BOOTSTRAP_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P033 `ROOT_BOOTSTRAP_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P034 `ROOT_BOOTSTRAP_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P035 `ROOT_BOOTSTRAP_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P036 `ROOT_BOOTSTRAP_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P037 `ROOT_BOOTSTRAP_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P038 `ROOT_BOOTSTRAP_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 pinned bootstrap root와 current root chain에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.2 RELEASE_SIGNING

#### R14A-P039 `RELEASE_SIGNING_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P040 `RELEASE_SIGNING_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P041 `RELEASE_SIGNING_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P042 `RELEASE_SIGNING_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P043 `RELEASE_SIGNING_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P044 `RELEASE_SIGNING_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P045 `RELEASE_SIGNING_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P046 `RELEASE_SIGNING_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P047 `RELEASE_SIGNING_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P048 `RELEASE_SIGNING_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P049 `RELEASE_SIGNING_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P050 `RELEASE_SIGNING_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P051 `RELEASE_SIGNING_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P052 `RELEASE_SIGNING_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P053 `RELEASE_SIGNING_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P054 `RELEASE_SIGNING_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P055 `RELEASE_SIGNING_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P056 `RELEASE_SIGNING_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P057 `RELEASE_SIGNING_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P058 `RELEASE_SIGNING_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P059 `RELEASE_SIGNING_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P060 `RELEASE_SIGNING_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P061 `RELEASE_SIGNING_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P062 `RELEASE_SIGNING_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P063 `RELEASE_SIGNING_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P064 `RELEASE_SIGNING_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P065 `RELEASE_SIGNING_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P066 `RELEASE_SIGNING_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P067 `RELEASE_SIGNING_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P068 `RELEASE_SIGNING_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P069 `RELEASE_SIGNING_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P070 `RELEASE_SIGNING_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P071 `RELEASE_SIGNING_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P072 `RELEASE_SIGNING_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P073 `RELEASE_SIGNING_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P074 `RELEASE_SIGNING_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P075 `RELEASE_SIGNING_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P076 `RELEASE_SIGNING_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 threshold release signing ceremony에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.3 PACKAGE_PUBLICATION

#### R14A-P077 `PACKAGE_PUBLICATION_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P078 `PACKAGE_PUBLICATION_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P079 `PACKAGE_PUBLICATION_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P080 `PACKAGE_PUBLICATION_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P081 `PACKAGE_PUBLICATION_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P082 `PACKAGE_PUBLICATION_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P083 `PACKAGE_PUBLICATION_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P084 `PACKAGE_PUBLICATION_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P085 `PACKAGE_PUBLICATION_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P086 `PACKAGE_PUBLICATION_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P087 `PACKAGE_PUBLICATION_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P088 `PACKAGE_PUBLICATION_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P089 `PACKAGE_PUBLICATION_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P090 `PACKAGE_PUBLICATION_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P091 `PACKAGE_PUBLICATION_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P092 `PACKAGE_PUBLICATION_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P093 `PACKAGE_PUBLICATION_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P094 `PACKAGE_PUBLICATION_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P095 `PACKAGE_PUBLICATION_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P096 `PACKAGE_PUBLICATION_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P097 `PACKAGE_PUBLICATION_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P098 `PACKAGE_PUBLICATION_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P099 `PACKAGE_PUBLICATION_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P100 `PACKAGE_PUBLICATION_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P101 `PACKAGE_PUBLICATION_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P102 `PACKAGE_PUBLICATION_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P103 `PACKAGE_PUBLICATION_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P104 `PACKAGE_PUBLICATION_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P105 `PACKAGE_PUBLICATION_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P106 `PACKAGE_PUBLICATION_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P107 `PACKAGE_PUBLICATION_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P108 `PACKAGE_PUBLICATION_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P109 `PACKAGE_PUBLICATION_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P110 `PACKAGE_PUBLICATION_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P111 `PACKAGE_PUBLICATION_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P112 `PACKAGE_PUBLICATION_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P113 `PACKAGE_PUBLICATION_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P114 `PACKAGE_PUBLICATION_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 immutable package object publication에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.4 LOG_APPEND

#### R14A-P115 `LOG_APPEND_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P116 `LOG_APPEND_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P117 `LOG_APPEND_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P118 `LOG_APPEND_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P119 `LOG_APPEND_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P120 `LOG_APPEND_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P121 `LOG_APPEND_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P122 `LOG_APPEND_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P123 `LOG_APPEND_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P124 `LOG_APPEND_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P125 `LOG_APPEND_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P126 `LOG_APPEND_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P127 `LOG_APPEND_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P128 `LOG_APPEND_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P129 `LOG_APPEND_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P130 `LOG_APPEND_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P131 `LOG_APPEND_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P132 `LOG_APPEND_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P133 `LOG_APPEND_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P134 `LOG_APPEND_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P135 `LOG_APPEND_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P136 `LOG_APPEND_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P137 `LOG_APPEND_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P138 `LOG_APPEND_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P139 `LOG_APPEND_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P140 `LOG_APPEND_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P141 `LOG_APPEND_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P142 `LOG_APPEND_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P143 `LOG_APPEND_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P144 `LOG_APPEND_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P145 `LOG_APPEND_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P146 `LOG_APPEND_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P147 `LOG_APPEND_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P148 `LOG_APPEND_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P149 `LOG_APPEND_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P150 `LOG_APPEND_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P151 `LOG_APPEND_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P152 `LOG_APPEND_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 transparency log append에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.5 LOG_INCLUSION

#### R14A-P153 `LOG_INCLUSION_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P154 `LOG_INCLUSION_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P155 `LOG_INCLUSION_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P156 `LOG_INCLUSION_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P157 `LOG_INCLUSION_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P158 `LOG_INCLUSION_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P159 `LOG_INCLUSION_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P160 `LOG_INCLUSION_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P161 `LOG_INCLUSION_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P162 `LOG_INCLUSION_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P163 `LOG_INCLUSION_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P164 `LOG_INCLUSION_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P165 `LOG_INCLUSION_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P166 `LOG_INCLUSION_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P167 `LOG_INCLUSION_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P168 `LOG_INCLUSION_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P169 `LOG_INCLUSION_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P170 `LOG_INCLUSION_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P171 `LOG_INCLUSION_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P172 `LOG_INCLUSION_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P173 `LOG_INCLUSION_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P174 `LOG_INCLUSION_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P175 `LOG_INCLUSION_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P176 `LOG_INCLUSION_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P177 `LOG_INCLUSION_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P178 `LOG_INCLUSION_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P179 `LOG_INCLUSION_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P180 `LOG_INCLUSION_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P181 `LOG_INCLUSION_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P182 `LOG_INCLUSION_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P183 `LOG_INCLUSION_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P184 `LOG_INCLUSION_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P185 `LOG_INCLUSION_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P186 `LOG_INCLUSION_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P187 `LOG_INCLUSION_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P188 `LOG_INCLUSION_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P189 `LOG_INCLUSION_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P190 `LOG_INCLUSION_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 release leaf inclusion proof에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.6 LOG_CONSISTENCY

#### R14A-P191 `LOG_CONSISTENCY_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P192 `LOG_CONSISTENCY_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P193 `LOG_CONSISTENCY_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P194 `LOG_CONSISTENCY_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P195 `LOG_CONSISTENCY_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P196 `LOG_CONSISTENCY_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P197 `LOG_CONSISTENCY_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P198 `LOG_CONSISTENCY_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P199 `LOG_CONSISTENCY_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P200 `LOG_CONSISTENCY_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P201 `LOG_CONSISTENCY_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P202 `LOG_CONSISTENCY_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P203 `LOG_CONSISTENCY_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P204 `LOG_CONSISTENCY_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P205 `LOG_CONSISTENCY_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P206 `LOG_CONSISTENCY_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P207 `LOG_CONSISTENCY_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P208 `LOG_CONSISTENCY_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P209 `LOG_CONSISTENCY_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P210 `LOG_CONSISTENCY_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P211 `LOG_CONSISTENCY_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P212 `LOG_CONSISTENCY_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P213 `LOG_CONSISTENCY_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P214 `LOG_CONSISTENCY_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P215 `LOG_CONSISTENCY_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P216 `LOG_CONSISTENCY_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P217 `LOG_CONSISTENCY_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P218 `LOG_CONSISTENCY_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P219 `LOG_CONSISTENCY_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P220 `LOG_CONSISTENCY_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P221 `LOG_CONSISTENCY_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P222 `LOG_CONSISTENCY_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P223 `LOG_CONSISTENCY_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P224 `LOG_CONSISTENCY_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P225 `LOG_CONSISTENCY_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P226 `LOG_CONSISTENCY_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P227 `LOG_CONSISTENCY_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P228 `LOG_CONSISTENCY_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 checkpoint consistency proof에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.7 WITNESS_QUORUM

#### R14A-P229 `WITNESS_QUORUM_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P230 `WITNESS_QUORUM_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P231 `WITNESS_QUORUM_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P232 `WITNESS_QUORUM_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P233 `WITNESS_QUORUM_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P234 `WITNESS_QUORUM_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P235 `WITNESS_QUORUM_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P236 `WITNESS_QUORUM_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P237 `WITNESS_QUORUM_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P238 `WITNESS_QUORUM_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P239 `WITNESS_QUORUM_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P240 `WITNESS_QUORUM_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P241 `WITNESS_QUORUM_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P242 `WITNESS_QUORUM_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P243 `WITNESS_QUORUM_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P244 `WITNESS_QUORUM_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P245 `WITNESS_QUORUM_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P246 `WITNESS_QUORUM_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P247 `WITNESS_QUORUM_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P248 `WITNESS_QUORUM_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P249 `WITNESS_QUORUM_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P250 `WITNESS_QUORUM_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P251 `WITNESS_QUORUM_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P252 `WITNESS_QUORUM_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P253 `WITNESS_QUORUM_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P254 `WITNESS_QUORUM_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P255 `WITNESS_QUORUM_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P256 `WITNESS_QUORUM_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P257 `WITNESS_QUORUM_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P258 `WITNESS_QUORUM_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P259 `WITNESS_QUORUM_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P260 `WITNESS_QUORUM_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P261 `WITNESS_QUORUM_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P262 `WITNESS_QUORUM_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P263 `WITNESS_QUORUM_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P264 `WITNESS_QUORUM_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P265 `WITNESS_QUORUM_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P266 `WITNESS_QUORUM_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 independent witness signatures에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.8 ROTATION_CEREMONY

#### R14A-P267 `ROTATION_CEREMONY_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P268 `ROTATION_CEREMONY_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P269 `ROTATION_CEREMONY_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P270 `ROTATION_CEREMONY_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P271 `ROTATION_CEREMONY_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P272 `ROTATION_CEREMONY_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P273 `ROTATION_CEREMONY_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P274 `ROTATION_CEREMONY_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P275 `ROTATION_CEREMONY_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P276 `ROTATION_CEREMONY_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P277 `ROTATION_CEREMONY_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P278 `ROTATION_CEREMONY_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P279 `ROTATION_CEREMONY_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P280 `ROTATION_CEREMONY_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P281 `ROTATION_CEREMONY_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P282 `ROTATION_CEREMONY_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P283 `ROTATION_CEREMONY_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P284 `ROTATION_CEREMONY_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P285 `ROTATION_CEREMONY_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P286 `ROTATION_CEREMONY_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P287 `ROTATION_CEREMONY_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P288 `ROTATION_CEREMONY_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P289 `ROTATION_CEREMONY_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P290 `ROTATION_CEREMONY_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P291 `ROTATION_CEREMONY_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P292 `ROTATION_CEREMONY_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P293 `ROTATION_CEREMONY_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P294 `ROTATION_CEREMONY_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P295 `ROTATION_CEREMONY_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P296 `ROTATION_CEREMONY_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P297 `ROTATION_CEREMONY_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P298 `ROTATION_CEREMONY_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P299 `ROTATION_CEREMONY_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P300 `ROTATION_CEREMONY_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P301 `ROTATION_CEREMONY_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P302 `ROTATION_CEREMONY_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P303 `ROTATION_CEREMONY_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P304 `ROTATION_CEREMONY_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 root·role key rotation ceremony에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.9 REVOCATION_PROPAGATION

#### R14A-P305 `REVOCATION_PROPAGATION_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P306 `REVOCATION_PROPAGATION_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P307 `REVOCATION_PROPAGATION_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P308 `REVOCATION_PROPAGATION_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P309 `REVOCATION_PROPAGATION_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P310 `REVOCATION_PROPAGATION_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P311 `REVOCATION_PROPAGATION_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P312 `REVOCATION_PROPAGATION_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P313 `REVOCATION_PROPAGATION_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P314 `REVOCATION_PROPAGATION_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P315 `REVOCATION_PROPAGATION_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P316 `REVOCATION_PROPAGATION_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P317 `REVOCATION_PROPAGATION_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P318 `REVOCATION_PROPAGATION_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P319 `REVOCATION_PROPAGATION_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P320 `REVOCATION_PROPAGATION_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P321 `REVOCATION_PROPAGATION_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P322 `REVOCATION_PROPAGATION_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P323 `REVOCATION_PROPAGATION_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P324 `REVOCATION_PROPAGATION_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P325 `REVOCATION_PROPAGATION_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P326 `REVOCATION_PROPAGATION_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P327 `REVOCATION_PROPAGATION_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P328 `REVOCATION_PROPAGATION_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P329 `REVOCATION_PROPAGATION_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P330 `REVOCATION_PROPAGATION_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P331 `REVOCATION_PROPAGATION_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P332 `REVOCATION_PROPAGATION_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P333 `REVOCATION_PROPAGATION_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P334 `REVOCATION_PROPAGATION_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P335 `REVOCATION_PROPAGATION_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P336 `REVOCATION_PROPAGATION_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P337 `REVOCATION_PROPAGATION_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P338 `REVOCATION_PROPAGATION_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P339 `REVOCATION_PROPAGATION_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P340 `REVOCATION_PROPAGATION_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P341 `REVOCATION_PROPAGATION_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P342 `REVOCATION_PROPAGATION_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 revocation metadata propagation에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.10 ORIGIN_BYTE_IDENTITY

#### R14A-P343 `ORIGIN_BYTE_IDENTITY_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P344 `ORIGIN_BYTE_IDENTITY_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P345 `ORIGIN_BYTE_IDENTITY_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P346 `ORIGIN_BYTE_IDENTITY_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P347 `ORIGIN_BYTE_IDENTITY_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P348 `ORIGIN_BYTE_IDENTITY_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P349 `ORIGIN_BYTE_IDENTITY_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P350 `ORIGIN_BYTE_IDENTITY_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P351 `ORIGIN_BYTE_IDENTITY_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P352 `ORIGIN_BYTE_IDENTITY_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P353 `ORIGIN_BYTE_IDENTITY_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P354 `ORIGIN_BYTE_IDENTITY_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P355 `ORIGIN_BYTE_IDENTITY_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P356 `ORIGIN_BYTE_IDENTITY_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P357 `ORIGIN_BYTE_IDENTITY_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P358 `ORIGIN_BYTE_IDENTITY_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P359 `ORIGIN_BYTE_IDENTITY_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P360 `ORIGIN_BYTE_IDENTITY_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P361 `ORIGIN_BYTE_IDENTITY_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P362 `ORIGIN_BYTE_IDENTITY_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P363 `ORIGIN_BYTE_IDENTITY_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P364 `ORIGIN_BYTE_IDENTITY_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P365 `ORIGIN_BYTE_IDENTITY_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P366 `ORIGIN_BYTE_IDENTITY_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P367 `ORIGIN_BYTE_IDENTITY_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P368 `ORIGIN_BYTE_IDENTITY_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P369 `ORIGIN_BYTE_IDENTITY_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P370 `ORIGIN_BYTE_IDENTITY_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P371 `ORIGIN_BYTE_IDENTITY_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P372 `ORIGIN_BYTE_IDENTITY_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P373 `ORIGIN_BYTE_IDENTITY_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P374 `ORIGIN_BYTE_IDENTITY_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P375 `ORIGIN_BYTE_IDENTITY_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P376 `ORIGIN_BYTE_IDENTITY_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P377 `ORIGIN_BYTE_IDENTITY_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P378 `ORIGIN_BYTE_IDENTITY_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P379 `ORIGIN_BYTE_IDENTITY_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P380 `ORIGIN_BYTE_IDENTITY_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 origin exact package bytes에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.11 MIRROR_A_BYTE_IDENTITY

#### R14A-P381 `MIRROR_A_BYTE_IDENTITY_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P382 `MIRROR_A_BYTE_IDENTITY_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P383 `MIRROR_A_BYTE_IDENTITY_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P384 `MIRROR_A_BYTE_IDENTITY_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P385 `MIRROR_A_BYTE_IDENTITY_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P386 `MIRROR_A_BYTE_IDENTITY_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P387 `MIRROR_A_BYTE_IDENTITY_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P388 `MIRROR_A_BYTE_IDENTITY_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P389 `MIRROR_A_BYTE_IDENTITY_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P390 `MIRROR_A_BYTE_IDENTITY_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P391 `MIRROR_A_BYTE_IDENTITY_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P392 `MIRROR_A_BYTE_IDENTITY_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P393 `MIRROR_A_BYTE_IDENTITY_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P394 `MIRROR_A_BYTE_IDENTITY_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P395 `MIRROR_A_BYTE_IDENTITY_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P396 `MIRROR_A_BYTE_IDENTITY_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P397 `MIRROR_A_BYTE_IDENTITY_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P398 `MIRROR_A_BYTE_IDENTITY_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P399 `MIRROR_A_BYTE_IDENTITY_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P400 `MIRROR_A_BYTE_IDENTITY_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P401 `MIRROR_A_BYTE_IDENTITY_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P402 `MIRROR_A_BYTE_IDENTITY_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P403 `MIRROR_A_BYTE_IDENTITY_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P404 `MIRROR_A_BYTE_IDENTITY_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P405 `MIRROR_A_BYTE_IDENTITY_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P406 `MIRROR_A_BYTE_IDENTITY_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P407 `MIRROR_A_BYTE_IDENTITY_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P408 `MIRROR_A_BYTE_IDENTITY_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P409 `MIRROR_A_BYTE_IDENTITY_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P410 `MIRROR_A_BYTE_IDENTITY_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P411 `MIRROR_A_BYTE_IDENTITY_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P412 `MIRROR_A_BYTE_IDENTITY_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P413 `MIRROR_A_BYTE_IDENTITY_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P414 `MIRROR_A_BYTE_IDENTITY_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P415 `MIRROR_A_BYTE_IDENTITY_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P416 `MIRROR_A_BYTE_IDENTITY_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P417 `MIRROR_A_BYTE_IDENTITY_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P418 `MIRROR_A_BYTE_IDENTITY_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 mirror A exact package bytes에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.12 MIRROR_B_BYTE_IDENTITY

#### R14A-P419 `MIRROR_B_BYTE_IDENTITY_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P420 `MIRROR_B_BYTE_IDENTITY_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P421 `MIRROR_B_BYTE_IDENTITY_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P422 `MIRROR_B_BYTE_IDENTITY_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P423 `MIRROR_B_BYTE_IDENTITY_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P424 `MIRROR_B_BYTE_IDENTITY_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P425 `MIRROR_B_BYTE_IDENTITY_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P426 `MIRROR_B_BYTE_IDENTITY_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P427 `MIRROR_B_BYTE_IDENTITY_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P428 `MIRROR_B_BYTE_IDENTITY_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P429 `MIRROR_B_BYTE_IDENTITY_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P430 `MIRROR_B_BYTE_IDENTITY_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P431 `MIRROR_B_BYTE_IDENTITY_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P432 `MIRROR_B_BYTE_IDENTITY_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P433 `MIRROR_B_BYTE_IDENTITY_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P434 `MIRROR_B_BYTE_IDENTITY_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P435 `MIRROR_B_BYTE_IDENTITY_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P436 `MIRROR_B_BYTE_IDENTITY_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P437 `MIRROR_B_BYTE_IDENTITY_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P438 `MIRROR_B_BYTE_IDENTITY_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P439 `MIRROR_B_BYTE_IDENTITY_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P440 `MIRROR_B_BYTE_IDENTITY_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P441 `MIRROR_B_BYTE_IDENTITY_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P442 `MIRROR_B_BYTE_IDENTITY_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P443 `MIRROR_B_BYTE_IDENTITY_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P444 `MIRROR_B_BYTE_IDENTITY_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P445 `MIRROR_B_BYTE_IDENTITY_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P446 `MIRROR_B_BYTE_IDENTITY_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P447 `MIRROR_B_BYTE_IDENTITY_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P448 `MIRROR_B_BYTE_IDENTITY_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P449 `MIRROR_B_BYTE_IDENTITY_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P450 `MIRROR_B_BYTE_IDENTITY_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P451 `MIRROR_B_BYTE_IDENTITY_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P452 `MIRROR_B_BYTE_IDENTITY_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P453 `MIRROR_B_BYTE_IDENTITY_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P454 `MIRROR_B_BYTE_IDENTITY_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P455 `MIRROR_B_BYTE_IDENTITY_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P456 `MIRROR_B_BYTE_IDENTITY_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 mirror B exact package bytes에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.13 CDN_RANGE_REASSEMBLY

#### R14A-P457 `CDN_RANGE_REASSEMBLY_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P458 `CDN_RANGE_REASSEMBLY_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P459 `CDN_RANGE_REASSEMBLY_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P460 `CDN_RANGE_REASSEMBLY_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P461 `CDN_RANGE_REASSEMBLY_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P462 `CDN_RANGE_REASSEMBLY_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P463 `CDN_RANGE_REASSEMBLY_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P464 `CDN_RANGE_REASSEMBLY_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P465 `CDN_RANGE_REASSEMBLY_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P466 `CDN_RANGE_REASSEMBLY_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P467 `CDN_RANGE_REASSEMBLY_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P468 `CDN_RANGE_REASSEMBLY_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P469 `CDN_RANGE_REASSEMBLY_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P470 `CDN_RANGE_REASSEMBLY_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P471 `CDN_RANGE_REASSEMBLY_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P472 `CDN_RANGE_REASSEMBLY_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P473 `CDN_RANGE_REASSEMBLY_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P474 `CDN_RANGE_REASSEMBLY_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P475 `CDN_RANGE_REASSEMBLY_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P476 `CDN_RANGE_REASSEMBLY_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P477 `CDN_RANGE_REASSEMBLY_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P478 `CDN_RANGE_REASSEMBLY_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P479 `CDN_RANGE_REASSEMBLY_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P480 `CDN_RANGE_REASSEMBLY_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P481 `CDN_RANGE_REASSEMBLY_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P482 `CDN_RANGE_REASSEMBLY_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P483 `CDN_RANGE_REASSEMBLY_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P484 `CDN_RANGE_REASSEMBLY_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P485 `CDN_RANGE_REASSEMBLY_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P486 `CDN_RANGE_REASSEMBLY_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P487 `CDN_RANGE_REASSEMBLY_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P488 `CDN_RANGE_REASSEMBLY_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P489 `CDN_RANGE_REASSEMBLY_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P490 `CDN_RANGE_REASSEMBLY_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P491 `CDN_RANGE_REASSEMBLY_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P492 `CDN_RANGE_REASSEMBLY_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P493 `CDN_RANGE_REASSEMBLY_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P494 `CDN_RANGE_REASSEMBLY_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 CDN range download and reassembly에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.14 CACHE_REVALIDATION

#### R14A-P495 `CACHE_REVALIDATION_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P496 `CACHE_REVALIDATION_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P497 `CACHE_REVALIDATION_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P498 `CACHE_REVALIDATION_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P499 `CACHE_REVALIDATION_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P500 `CACHE_REVALIDATION_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P501 `CACHE_REVALIDATION_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P502 `CACHE_REVALIDATION_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P503 `CACHE_REVALIDATION_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P504 `CACHE_REVALIDATION_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P505 `CACHE_REVALIDATION_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P506 `CACHE_REVALIDATION_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P507 `CACHE_REVALIDATION_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P508 `CACHE_REVALIDATION_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P509 `CACHE_REVALIDATION_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P510 `CACHE_REVALIDATION_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P511 `CACHE_REVALIDATION_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P512 `CACHE_REVALIDATION_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P513 `CACHE_REVALIDATION_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P514 `CACHE_REVALIDATION_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P515 `CACHE_REVALIDATION_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P516 `CACHE_REVALIDATION_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P517 `CACHE_REVALIDATION_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P518 `CACHE_REVALIDATION_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P519 `CACHE_REVALIDATION_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P520 `CACHE_REVALIDATION_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P521 `CACHE_REVALIDATION_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P522 `CACHE_REVALIDATION_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P523 `CACHE_REVALIDATION_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P524 `CACHE_REVALIDATION_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P525 `CACHE_REVALIDATION_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P526 `CACHE_REVALIDATION_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P527 `CACHE_REVALIDATION_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P528 `CACHE_REVALIDATION_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P529 `CACHE_REVALIDATION_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P530 `CACHE_REVALIDATION_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P531 `CACHE_REVALIDATION_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P532 `CACHE_REVALIDATION_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 immutable cache revalidation에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.15 INSTALLER_DOWNLOAD

#### R14A-P533 `INSTALLER_DOWNLOAD_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P534 `INSTALLER_DOWNLOAD_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P535 `INSTALLER_DOWNLOAD_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P536 `INSTALLER_DOWNLOAD_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P537 `INSTALLER_DOWNLOAD_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P538 `INSTALLER_DOWNLOAD_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P539 `INSTALLER_DOWNLOAD_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P540 `INSTALLER_DOWNLOAD_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P541 `INSTALLER_DOWNLOAD_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P542 `INSTALLER_DOWNLOAD_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P543 `INSTALLER_DOWNLOAD_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P544 `INSTALLER_DOWNLOAD_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P545 `INSTALLER_DOWNLOAD_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P546 `INSTALLER_DOWNLOAD_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P547 `INSTALLER_DOWNLOAD_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P548 `INSTALLER_DOWNLOAD_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P549 `INSTALLER_DOWNLOAD_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P550 `INSTALLER_DOWNLOAD_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P551 `INSTALLER_DOWNLOAD_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P552 `INSTALLER_DOWNLOAD_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P553 `INSTALLER_DOWNLOAD_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P554 `INSTALLER_DOWNLOAD_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P555 `INSTALLER_DOWNLOAD_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P556 `INSTALLER_DOWNLOAD_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P557 `INSTALLER_DOWNLOAD_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P558 `INSTALLER_DOWNLOAD_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P559 `INSTALLER_DOWNLOAD_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P560 `INSTALLER_DOWNLOAD_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P561 `INSTALLER_DOWNLOAD_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P562 `INSTALLER_DOWNLOAD_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P563 `INSTALLER_DOWNLOAD_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P564 `INSTALLER_DOWNLOAD_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P565 `INSTALLER_DOWNLOAD_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P566 `INSTALLER_DOWNLOAD_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P567 `INSTALLER_DOWNLOAD_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P568 `INSTALLER_DOWNLOAD_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P569 `INSTALLER_DOWNLOAD_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P570 `INSTALLER_DOWNLOAD_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 packaged Electron installer download에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.16 LOCAL_TRUST_PERSISTENCE

#### R14A-P571 `LOCAL_TRUST_PERSISTENCE_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P572 `LOCAL_TRUST_PERSISTENCE_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P573 `LOCAL_TRUST_PERSISTENCE_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P574 `LOCAL_TRUST_PERSISTENCE_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P575 `LOCAL_TRUST_PERSISTENCE_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P576 `LOCAL_TRUST_PERSISTENCE_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P577 `LOCAL_TRUST_PERSISTENCE_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P578 `LOCAL_TRUST_PERSISTENCE_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P579 `LOCAL_TRUST_PERSISTENCE_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P580 `LOCAL_TRUST_PERSISTENCE_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P581 `LOCAL_TRUST_PERSISTENCE_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P582 `LOCAL_TRUST_PERSISTENCE_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P583 `LOCAL_TRUST_PERSISTENCE_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P584 `LOCAL_TRUST_PERSISTENCE_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P585 `LOCAL_TRUST_PERSISTENCE_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P586 `LOCAL_TRUST_PERSISTENCE_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P587 `LOCAL_TRUST_PERSISTENCE_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P588 `LOCAL_TRUST_PERSISTENCE_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P589 `LOCAL_TRUST_PERSISTENCE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P590 `LOCAL_TRUST_PERSISTENCE_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P591 `LOCAL_TRUST_PERSISTENCE_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P592 `LOCAL_TRUST_PERSISTENCE_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P593 `LOCAL_TRUST_PERSISTENCE_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P594 `LOCAL_TRUST_PERSISTENCE_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P595 `LOCAL_TRUST_PERSISTENCE_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P596 `LOCAL_TRUST_PERSISTENCE_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P597 `LOCAL_TRUST_PERSISTENCE_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P598 `LOCAL_TRUST_PERSISTENCE_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P599 `LOCAL_TRUST_PERSISTENCE_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P600 `LOCAL_TRUST_PERSISTENCE_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P601 `LOCAL_TRUST_PERSISTENCE_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P602 `LOCAL_TRUST_PERSISTENCE_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P603 `LOCAL_TRUST_PERSISTENCE_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P604 `LOCAL_TRUST_PERSISTENCE_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P605 `LOCAL_TRUST_PERSISTENCE_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P606 `LOCAL_TRUST_PERSISTENCE_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P607 `LOCAL_TRUST_PERSISTENCE_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P608 `LOCAL_TRUST_PERSISTENCE_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 installed local trust state persistence에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.17 ROLLBACK_ATTACK_REJECTION

#### R14A-P609 `ROLLBACK_ATTACK_REJECTION_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P610 `ROLLBACK_ATTACK_REJECTION_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P611 `ROLLBACK_ATTACK_REJECTION_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P612 `ROLLBACK_ATTACK_REJECTION_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P613 `ROLLBACK_ATTACK_REJECTION_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P614 `ROLLBACK_ATTACK_REJECTION_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P615 `ROLLBACK_ATTACK_REJECTION_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P616 `ROLLBACK_ATTACK_REJECTION_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P617 `ROLLBACK_ATTACK_REJECTION_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P618 `ROLLBACK_ATTACK_REJECTION_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P619 `ROLLBACK_ATTACK_REJECTION_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P620 `ROLLBACK_ATTACK_REJECTION_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P621 `ROLLBACK_ATTACK_REJECTION_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P622 `ROLLBACK_ATTACK_REJECTION_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P623 `ROLLBACK_ATTACK_REJECTION_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P624 `ROLLBACK_ATTACK_REJECTION_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P625 `ROLLBACK_ATTACK_REJECTION_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P626 `ROLLBACK_ATTACK_REJECTION_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P627 `ROLLBACK_ATTACK_REJECTION_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P628 `ROLLBACK_ATTACK_REJECTION_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P629 `ROLLBACK_ATTACK_REJECTION_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P630 `ROLLBACK_ATTACK_REJECTION_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P631 `ROLLBACK_ATTACK_REJECTION_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P632 `ROLLBACK_ATTACK_REJECTION_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P633 `ROLLBACK_ATTACK_REJECTION_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P634 `ROLLBACK_ATTACK_REJECTION_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P635 `ROLLBACK_ATTACK_REJECTION_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P636 `ROLLBACK_ATTACK_REJECTION_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P637 `ROLLBACK_ATTACK_REJECTION_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P638 `ROLLBACK_ATTACK_REJECTION_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P639 `ROLLBACK_ATTACK_REJECTION_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P640 `ROLLBACK_ATTACK_REJECTION_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P641 `ROLLBACK_ATTACK_REJECTION_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P642 `ROLLBACK_ATTACK_REJECTION_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P643 `ROLLBACK_ATTACK_REJECTION_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P644 `ROLLBACK_ATTACK_REJECTION_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P645 `ROLLBACK_ATTACK_REJECTION_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P646 `ROLLBACK_ATTACK_REJECTION_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 rollback·freeze·replay attack matrix에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.18 R10A_ROLLBACK_PERMIT

#### R14A-P647 `R10A_ROLLBACK_PERMIT_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P648 `R10A_ROLLBACK_PERMIT_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P649 `R10A_ROLLBACK_PERMIT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P650 `R10A_ROLLBACK_PERMIT_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P651 `R10A_ROLLBACK_PERMIT_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P652 `R10A_ROLLBACK_PERMIT_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P653 `R10A_ROLLBACK_PERMIT_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P654 `R10A_ROLLBACK_PERMIT_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P655 `R10A_ROLLBACK_PERMIT_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P656 `R10A_ROLLBACK_PERMIT_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P657 `R10A_ROLLBACK_PERMIT_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P658 `R10A_ROLLBACK_PERMIT_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P659 `R10A_ROLLBACK_PERMIT_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P660 `R10A_ROLLBACK_PERMIT_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P661 `R10A_ROLLBACK_PERMIT_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P662 `R10A_ROLLBACK_PERMIT_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P663 `R10A_ROLLBACK_PERMIT_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P664 `R10A_ROLLBACK_PERMIT_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P665 `R10A_ROLLBACK_PERMIT_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P666 `R10A_ROLLBACK_PERMIT_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P667 `R10A_ROLLBACK_PERMIT_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P668 `R10A_ROLLBACK_PERMIT_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P669 `R10A_ROLLBACK_PERMIT_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P670 `R10A_ROLLBACK_PERMIT_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P671 `R10A_ROLLBACK_PERMIT_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P672 `R10A_ROLLBACK_PERMIT_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P673 `R10A_ROLLBACK_PERMIT_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P674 `R10A_ROLLBACK_PERMIT_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P675 `R10A_ROLLBACK_PERMIT_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P676 `R10A_ROLLBACK_PERMIT_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P677 `R10A_ROLLBACK_PERMIT_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P678 `R10A_ROLLBACK_PERMIT_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P679 `R10A_ROLLBACK_PERMIT_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P680 `R10A_ROLLBACK_PERMIT_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P681 `R10A_ROLLBACK_PERMIT_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P682 `R10A_ROLLBACK_PERMIT_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P683 `R10A_ROLLBACK_PERMIT_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P684 `R10A_ROLLBACK_PERMIT_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 explicit R10A rollback permit에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.19 R12A_STAGE_HANDOFF

#### R14A-P685 `R12A_STAGE_HANDOFF_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P686 `R12A_STAGE_HANDOFF_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P687 `R12A_STAGE_HANDOFF_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P688 `R12A_STAGE_HANDOFF_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P689 `R12A_STAGE_HANDOFF_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P690 `R12A_STAGE_HANDOFF_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P691 `R12A_STAGE_HANDOFF_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P692 `R12A_STAGE_HANDOFF_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P693 `R12A_STAGE_HANDOFF_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P694 `R12A_STAGE_HANDOFF_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P695 `R12A_STAGE_HANDOFF_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P696 `R12A_STAGE_HANDOFF_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P697 `R12A_STAGE_HANDOFF_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P698 `R12A_STAGE_HANDOFF_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P699 `R12A_STAGE_HANDOFF_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P700 `R12A_STAGE_HANDOFF_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P701 `R12A_STAGE_HANDOFF_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P702 `R12A_STAGE_HANDOFF_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P703 `R12A_STAGE_HANDOFF_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P704 `R12A_STAGE_HANDOFF_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P705 `R12A_STAGE_HANDOFF_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P706 `R12A_STAGE_HANDOFF_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P707 `R12A_STAGE_HANDOFF_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P708 `R12A_STAGE_HANDOFF_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P709 `R12A_STAGE_HANDOFF_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P710 `R12A_STAGE_HANDOFF_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P711 `R12A_STAGE_HANDOFF_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P712 `R12A_STAGE_HANDOFF_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P713 `R12A_STAGE_HANDOFF_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P714 `R12A_STAGE_HANDOFF_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P715 `R12A_STAGE_HANDOFF_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P716 `R12A_STAGE_HANDOFF_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P717 `R12A_STAGE_HANDOFF_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P718 `R12A_STAGE_HANDOFF_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P719 `R12A_STAGE_HANDOFF_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P720 `R12A_STAGE_HANDOFF_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P721 `R12A_STAGE_HANDOFF_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P722 `R12A_STAGE_HANDOFF_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 R12A staged package admission에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

### 37.20 R13A_FLEET_DISTRIBUTION

#### R14A-P723 `R13A_FLEET_DISTRIBUTION_ARTIFACT_PRESENT`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `ARTIFACT_PRESENT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P724 `R13A_FLEET_DISTRIBUTION_SCHEMA_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `SCHEMA_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P725 `R13A_FLEET_DISTRIBUTION_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P726 `R13A_FLEET_DISTRIBUTION_KEY_ROLE_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `KEY_ROLE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P727 `R13A_FLEET_DISTRIBUTION_KEY_NOT_REVOKED`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `KEY_NOT_REVOKED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P728 `R13A_FLEET_DISTRIBUTION_KEY_NOT_EXPIRED`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `KEY_NOT_EXPIRED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P729 `R13A_FLEET_DISTRIBUTION_VERSION_MONOTONIC`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `VERSION_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P730 `R13A_FLEET_DISTRIBUTION_SEQUENCE_MONOTONIC`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `SEQUENCE_MONOTONIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P731 `R13A_FLEET_DISTRIBUTION_DIGEST_EXACT`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `DIGEST_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P732 `R13A_FLEET_DISTRIBUTION_BYTE_LENGTH_EXACT`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `BYTE_LENGTH_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P733 `R13A_FLEET_DISTRIBUTION_CONTENT_ID_EXACT`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `CONTENT_ID_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P734 `R13A_FLEET_DISTRIBUTION_INCLUSION_PROOF_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `INCLUSION_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P735 `R13A_FLEET_DISTRIBUTION_CONSISTENCY_PROOF_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `CONSISTENCY_PROOF_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P736 `R13A_FLEET_DISTRIBUTION_CHECKPOINT_SIGNATURE_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `CHECKPOINT_SIGNATURE_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P737 `R13A_FLEET_DISTRIBUTION_WITNESS_QUORUM_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `WITNESS_QUORUM_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P738 `R13A_FLEET_DISTRIBUTION_EQUIVOCATION_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `EQUIVOCATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P739 `R13A_FLEET_DISTRIBUTION_SPLIT_VIEW_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `SPLIT_VIEW_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P740 `R13A_FLEET_DISTRIBUTION_REPLAY_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `REPLAY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P741 `R13A_FLEET_DISTRIBUTION_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P742 `R13A_FLEET_DISTRIBUTION_FREEZE_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `FREEZE_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P743 `R13A_FLEET_DISTRIBUTION_MUTABLE_ALIAS_NOT_TRUSTED`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `MUTABLE_ALIAS_NOT_TRUSTED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P744 `R13A_FLEET_DISTRIBUTION_RANGE_ASSEMBLY_EXACT`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `RANGE_ASSEMBLY_EXACT` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P745 `R13A_FLEET_DISTRIBUTION_COMPRESSION_TRANSFORM_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `COMPRESSION_TRANSFORM_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P746 `R13A_FLEET_DISTRIBUTION_ETAG_NOT_AUTHORITY`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `ETAG_NOT_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P747 `R13A_FLEET_DISTRIBUTION_TLS_NOT_SOLE_AUTHORITY`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `TLS_NOT_SOLE_AUTHORITY` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P748 `R13A_FLEET_DISTRIBUTION_TEMP_FILE_ATOMIC`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `TEMP_FILE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P749 `R13A_FLEET_DISTRIBUTION_PREVERIFY_EXECUTION_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `PREVERIFY_EXECUTION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P750 `R13A_FLEET_DISTRIBUTION_EXTRACTION_BEFORE_VERIFY_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `EXTRACTION_BEFORE_VERIFY_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P751 `R13A_FLEET_DISTRIBUTION_LOCAL_STATE_ATOMIC`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `LOCAL_STATE_ATOMIC` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P752 `R13A_FLEET_DISTRIBUTION_LOCAL_STATE_ROLLBACK_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `LOCAL_STATE_ROLLBACK_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P753 `R13A_FLEET_DISTRIBUTION_REVOCATION_PROPAGATED`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `REVOCATION_PROPAGATED` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P754 `R13A_FLEET_DISTRIBUTION_ROTATION_CROSS_SIGN_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `ROTATION_CROSS_SIGN_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P755 `R13A_FLEET_DISTRIBUTION_PREVIOUS_KEY_OVERLAP_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `PREVIOUS_KEY_OVERLAP_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P756 `R13A_FLEET_DISTRIBUTION_SUMMARY_TRUST_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `SUMMARY_TRUST_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P757 `R13A_FLEET_DISTRIBUTION_RAW_ARTIFACT_REPLAY_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `RAW_ARTIFACT_REPLAY_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P758 `R13A_FLEET_DISTRIBUTION_POINTER_MUTATION_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `POINTER_MUTATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P759 `R13A_FLEET_DISTRIBUTION_PRIVACY_VIOLATION_ZERO`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `PRIVACY_VIOLATION_ZERO` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

#### R14A-P760 `R13A_FLEET_DISTRIBUTION_TERMINAL_RECEIPT_VALID`

- **요구**: 실제 signed distribution에서 R13A fleet plan and evidence binding에 대해 `TERMINAL_RECEIPT_VALID` 조건을 raw artifact와 installed observation으로 증명해야 한다.
- **증거**: immutable metadata bytes, signature set, log proof, fetch receipt, local trust ledger, final replay report
- **실패**: artifact 누락, stale metadata, mirror byte divergence, proof 불일치, rollback floor 약화, pointer 권위 침범 시 FAIL

## 38. 검증 명령 계약

Source:

```bash
npm run verify:resample-runtime-01-r14a
```

현재 예상 결과:

```text
TDT-RESAMPLE-RUNTIME-01-R14A 640 SOURCE PASS / 760 DISTRIBUTION PENDING / 0 FAIL
```

Distribution:

```bash
npm run run:resample-runtime-01-r14a:distribution
npm run verify:resample-runtime-01-r14a:distribution
npm run finalize:resample-runtime-01-r14a:distribution
```

R13A fleet final evidence 또는 signed distribution artifact가 없을 때 distribution verifier는 non-zero exit와 첫 미충족 조건을 반환한다.

```text
E_R14A_R13A_FLEET_RECEIPT_MISSING
E_R14A_ROOT_METADATA_MISSING
E_R14A_SIGNED_PACKAGE_MANIFEST_MISSING
E_R14A_TRANSPARENCY_CHECKPOINT_MISSING
E_R14A_DISTRIBUTION_RECEIPT_MISSING
```

## 39. 구현 완료 판정

### Source 완료

- R14A module과 schema가 Active Graph와 runtime manifest에 입장
- Signed Package Manifest v2와 root·role metadata 구현
- transparency leaf·Merkle proof·checkpoint·witness 구현
- key rotation·revocation source replay 구현
- mirror·range·streaming verification 구현
- local trust state와 rollback floor 구현
- R12A staging과 launcher adapter 구현
- R13A plan·finalizer binding 구현
- 40개 이상 negative control 통과
- 부모 R13A receipt와 두 pointer 바이트 불변
- 640 source gate PASS

### Distribution 완료

- R13A fleet final current
- threshold-signed root와 release metadata
- package manifest transparency inclusion
- previous checkpoint consistency proof
- witness quorum
- origin·mirror A·mirror B·CDN reassembly exact byte identity
- key rotation과 revocation replay
- rollback·freeze·replay attack matrix 완결
- R12A staged admission과 launcher admission
- R13A fleet distribution binding
- 760 distribution gate PASS

## 40. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R15A

Offline and Air-Gapped Distribution /
Trust-State Backup and Recovery /
Compromise Recovery Root Ceremony /
Long-Term Reproducible Archive Verification /
Release End-of-Life and Decommission Seal
```
