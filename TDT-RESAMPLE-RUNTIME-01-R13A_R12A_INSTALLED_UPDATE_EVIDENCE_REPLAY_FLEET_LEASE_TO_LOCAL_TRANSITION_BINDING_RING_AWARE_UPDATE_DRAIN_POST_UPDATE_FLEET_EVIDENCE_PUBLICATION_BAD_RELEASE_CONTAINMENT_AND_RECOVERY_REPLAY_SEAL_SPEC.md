# TDT-RESAMPLE-RUNTIME-01-R13A

## R12A Installed Update Evidence Replay / Fleet Lease to Local Transition Binding / Ring-Aware Update Drain / Post-Update Fleet Evidence Publication / Bad-Release Containment and Recovery Replay Seal

> 상태: 명세 확정안
>
> 부모 번들: `61_TDT_RESAMPLE_RUNTIME_01_R12A_ATOMIC_UPDATE_MAIN_INTEGRATION_SOURCE_BAKED_AWAITING_R11A_INSTALLED.zip`
>
> 부모 번들 SHA-256: `0954648629b47457f86f4a701a31084940e7b63d0ffee31917fb7153ee1b225a`
>
> 부모 R12A 명세 SHA-256: `5a1ad84df38203f71e59b02969b6f5d940faac35b250743e1969cdb7980ac204`
>
> 부모 R12A Source Final Receipt SHA-256: `b5f3a951820633bdb572435766487aaabd7ddaf51cb24ffd2fdc9511a52fbca4`
>
> 기존 R13 명세 SHA-256: `b74a0ea8c0e5de8a401f9f622414229ee8002ea9ba7c15848474d5149545bfe2`
>
> 기존 R13 Source Final Receipt SHA-256: `0023fbacaae88f442c653787dd2624e88966b0f7f4bc9e27c8cd3ee70814cb3d`
>
> Production Pointer mirror SHA-256: `1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8`

## 0. 판정 라벨

- **확정**: 부모 R12A 코드 또는 기존 R13 코드에서 직접 확인된 사실
- **요구**: R13A 구현이 반드시 만족해야 하는 계약
- **금지**: 구현 또는 운영에서 허용하지 않는 동작
- **판단불가**: 실제 Windows packaged Electron, 물리 GPU, 다중 설치 fleet 증거가 없어서 현재 확정할 수 없는 항목
- **설치 증거 대기**: Source 하네스는 구현할 수 있으나 R9A physical, R10A release, R11A installed, R12A installed가 완료되어야 실행 가능한 항목

## 1. 부모 상태와 실제 결선 공백

### 1.1 부모 R12A 상태

**확정**

```text
RESAMPLE_RUNTIME_R12A_ATOMIC_UPDATE_MAIN_INTEGRATION_SOURCE_SEALED_AWAITING_R11A_INSTALLED_AND_R10A_RELEASE

360 SOURCE PASS
480 INSTALLED PENDING
0 FAIL
```

R12A는 다음을 Source 본선에 결선했다.

- Electron main `R12AMainUpdateCoordinator`
- transaction v2와 append-only journal v2
- R11A source session replay와 pre-activation drain
- Local Activation Pointer-only CAS
- stable launcher handoff
- target R11A re-attestation
- interrupted update recovery matrix

R12A는 Production Pointer를 쓰지 않는다. Production Pointer 권위는 계속 R10A다.

### 1.2 기존 R13에서 확인된 공백

**확정**

기존 R13은 cohort, signed plan, lease, evidence, aggregate, containment primitive를 갖고 있지만 제품 본선과 다음 지점에서 분리되어 있다.

1. `run-fleet.mjs`는 실제 fleet 실행기가 아니라 입력 JSON의 상태 문자열만 검사한다.
2. lease는 `expectedLocalR10Generation`과 `expectedLocalR10RawSha256`에 묶이지만 R12A transaction, journal, drain, launcher, target re-attestation과 직접 결합되지 않는다.
3. `local-chain-handoff.mjs`는 `state === PASS`와 옛 R11 self-hash token만 확인한다.
4. R11A HMAC session과 operation grant를 검증하지 않는다.
5. R12A installed final receipt의 child receipt chain을 재검증하지 않는다.
6. post-update evidence는 durable outbox, signed ingestion acknowledgement, monotonic deletion authority가 없다.
7. fleet finalizer는 파일 존재와 요약 필드만 읽고 하위 signature, self-hash, input-set digest를 재검증하지 않는다.
8. containment directive가 R12A transaction phase별 local recovery action과 결속되지 않는다.
9. ring drain concurrency와 local drain permit이 없다.
10. 기존 R13은 R8A 이후 계보에서 `SUPERSEDED`이며 현재 promotion evidence로 carry-forward할 수 없다.

### 1.3 R13A의 교정 원칙

```text
fleet lease
→ local claim
→ ring drain permit
→ R12A transaction binding sidecar
→ R12A installed update
→ fresh R11A target session
→ local completion receipt
→ durable evidence outbox
→ signed fleet acknowledgement
→ exact aggregate
→ ring decision
```

R13A는 R10A Production Pointer나 R12A Local Activation Pointer를 직접 변경하지 않는다.

## 2. 목표

R13A는 다음 다섯 가지를 한 계보로 봉인한다.

1. 실제 R12A installed update evidence를 fleet predecessor로 다시 검증한다.
2. signed fleet lease를 특정 installation의 R12A local update transaction에 단일 사용으로 결속한다.
3. ring별 drain concurrency를 signed permit으로 통제하되 R12A zero-count drain invariant를 약화하지 않는다.
4. target R11A re-attestation 이후에만 privacy-safe fleet evidence를 durable outbox에서 발행한다.
5. bad release containment가 local R12A phase에 따라 abort, recovery-only, quarantine, R10A rollback recommendation으로 재생되도록 한다.

## 3. 비목표

- R13A가 Production Pointer를 직접 CAS하지 않는다.
- R13A가 Local Activation Pointer를 직접 CAS하지 않는다.
- fleet server가 remote silent rollback을 수행하지 않는다.
- R12A transaction v2를 조용히 다른 schema로 덮어쓰지 않는다.
- 사용자 이미지, 파일 경로, EXIF, 문서 메타데이터를 fleet evidence로 전송하지 않는다.
- missing evidence를 success로 계산하지 않는다.
- source fixture를 installed fleet 실행으로 주장하지 않는다.
- renderer에 plan signing key, lease signing key, evidence signing private key를 노출하지 않는다.
- fleet lease가 R11A session 발급 권위를 갖지 않는다.
- ring policy가 R12A drain zero-count, journal fsync, pointer CAS 조건을 완화하지 않는다.

## 4. 권위와 SSOT

### 4.1 Release SSOT

```text
R10A final release receipt
R10A lineage restoration receipt
Production Pointer
```

R13A는 이를 read-only로 소비한다.

### 4.2 Installed runtime SSOT

```text
R11A main HMAC session authority
R11A quarantine ledger
R11A Preview·Export operation grant registry
```

### 4.3 Local update SSOT

```text
R12A transaction v2
R12A journal v2
R12A Local Activation Pointer
R12A stable launcher handoff
R12A target re-attestation receipt
```

### 4.4 Fleet rollout SSOT

```text
signed rollout plan v2
append-only fleet ledger v2
ring generation
revocation generation
accepted evidence set digest
containment generation
```

### 4.5 R13A local binding SSOT

```text
FLEET_TRANSITION_BINDING.json
```

이 sidecar는 R12A transaction schema를 몰래 변경하지 않고 다음을 결속한다.

- rollout plan
- ring generation
- update lease
- local lease claim
- drain permit
- R12A updateTransactionId
- source·target package identity
- Production Pointer before·after identity
- Local Activation Pointer before identity

## 5. Canonical 상태

### 5.1 Fleet rollout 상태

```text
CREATED
PLAN_SEALED
LAB_ACTIVE
CANARY_ACTIVE
EARLY_ACTIVE
BROAD_ACTIVE
MAJORITY_ACTIVE
FULL_ACTIVE
COMPLETED
```

Side state:

```text
HOLD
PAUSED
CONTAINED
RECOVERY_REPLAY
REJECTED
```

### 5.2 Installation local agent 상태

```text
IDLE
LEASE_RECEIVED
LEASE_VALIDATED
LEASE_CLAIMED
DRAIN_PERMIT_RECEIVED
R12A_BOUND
UPDATE_RUNNING
TARGET_REATTESTED
EVIDENCE_QUEUED
EVIDENCE_ACKED
CONTAINED
RECOVERY_REQUIRED
RECOVERED
```

### 5.3 Lease 상태

```text
ISSUED
CLAIMED
DRAIN_AUTHORIZED
BOUND_TO_R12A
CONSUMED
REVOKED
EXPIRED
```

Lease는 R12A `ACTIVATION_INTENT_WRITTEN` 이전까지 revoke될 수 있다. Local Pointer CAS 이후에는 단순 revoke가 아니라 recovery replay가 필요하다.

## 6. R12A installed evidence replay

R13A fleet admission은 다음 current evidence를 요구한다.

```text
R9A physical final
R10A final release
R10A lineage restoration
R11A installed final
R12A installed final
```

R12A installed final receipt만 보는 것으로 충분하지 않다. Final writer는 다음 child를 각각 재검증해야 한다.

- transition admission
- staging receipt
- drain receipt
- activation intent
- Local Pointer CAS receipt
- relaunch request
- launch acknowledgement
- target R11A re-attestation
- commit receipt
- recovery matrix receipt

검증 규칙:

1. 각 child self-hash가 유효하다.
2. 모든 child의 `updateTransactionId`가 같다.
3. source·target build와 package가 일관된다.
4. Production Pointer mutation은 R12A에서 0이다.
5. Local Activation Pointer CAS count는 정확히 1이다.
6. target R11A session은 source session과 다르다.
7. target session generation이 source보다 크다.
8. cross-generation asset count는 0이다.
9. recovery outcome이 ambiguous가 아니다.
10. package closure와 Active Graph digest가 current lineage에 속한다.

## 7. Fleet predecessor admission

각 installation은 다음 admission receipt를 가진다.

```ts
interface FleetInstallationAdmissionReceiptR13A {
  schemaVersion: 1
  schemaId: 'tdt.rollout.installation-admission.r13a.v1'

  rolloutId: string
  planDigest: string
  installationRolloutPseudonym: string

  sourceBuildId: string
  sourcePackageContentId: string
  targetBuildId: string
  targetPackageContentId: string

  r10aFinalReleaseDigest: string
  r10aLineageRestorationDigest: string
  r11aInstalledFinalDigest: string
  r12aInstalledFinalDigest: string

  productionPointerGeneration: number
  productionPointerRawSha256: string
  localActivationPointerGeneration: number
  localActivationPointerRawSha256: string

  admitted: true
  receiptSha256: string
}
```

Source fixture receipt나 상태 문자열은 installed admission으로 사용할 수 없다.

## 8. Rollout Plan v2

```ts
interface RolloutPlanR13A {
  schemaVersion: 2
  schemaId: 'tdt.rollout.plan.r13a.v2'

  rolloutId: string
  planGeneration: number
  previousPlanDigest: string | null

  targetBuildId: string
  targetPackageContentId: string
  qualifiedPreviousBuildId: string
  qualifiedPreviousPackageContentId: string

  r10aFinalReleaseDigest: string
  r10aLineageRestorationDigest: string
  r9aPhysicalFinalDigest: string

  rings: RingPolicyR13A[]
  leaseKeyGeneration: number
  containmentKeyGeneration: number
  evidenceAckKeyGeneration: number
  revocationGeneration: number

  operatorApprovalDigest: string
  planSha256: string
  signingKeyId: string
  signature: string
}
```

Plan은 raw SHA CAS와 generation monotonicity를 사용한다. 같은 generation의 다른 plan digest는 split-brain이다.

## 9. Ring policy와 drain concurrency

```ts
interface RingPolicyR13A {
  ringId: 'RING-0' | 'RING-1' | 'RING-2' | 'RING-3' | 'RING-4' | 'RING-5'
  targetBasisPoints: number
  minimumInstallations: number
  minimumSessions: number
  minimumDwellSeconds: number
  minimumEvidenceCoverage: number
  maximumConcurrentClaims: number
  maximumConcurrentDrains: number
  drainDeadlineMs: 30000
  evidenceWindowSeconds: number
}
```

`maximumConcurrentDrains`는 fleet admission을 제한할 뿐 R12A drain 규칙을 약화하지 않는다.

```text
active drain permits
≤ ring.maximumConcurrentDrains
```

Ring advancement는 한 단계씩만 허용한다.

## 10. Update Lease v2

```ts
interface FleetUpdateLeaseR13A {
  schemaVersion: 2
  schemaId: 'tdt.rollout.update-lease.r13a.v2'

  rolloutId: string
  planDigest: string
  planGeneration: number
  ringId: string
  ringGeneration: number
  revocationGeneration: number

  installationRolloutPseudonym: string
  cohortBucket: number

  sourceBuildId: string
  sourcePackageContentId: string
  targetBuildId: string
  targetPackageContentId: string

  r10aFinalReleaseDigest: string
  r10aLineageRestorationDigest: string
  r12aSourceContractDigest: string

  expectedProductionPointerGeneration: number
  expectedProductionPointerRawSha256: string
  expectedLocalPointerGeneration: number
  expectedLocalPointerRawSha256: string

  leaseNonce: string
  notBefore: string
  expiresAt: string

  signingKeyId: string
  leaseSha256: string
  signature: string
}
```

Lease는 pointer writer가 아니다. Lease는 R12A local transition을 요청할 자격만 부여한다.

## 11. Lease claim

Installation main process가 lease를 검증한 뒤 claim receipt를 만든다.

```ts
interface LeaseClaimReceiptR13A {
  schemaVersion: 1
  schemaId: 'tdt.rollout.lease-claim.r13a.v1'

  leaseSha256: string
  installationRolloutPseudonym: string
  sourceSessionDigest: string
  sourceBuildId: string
  sourcePackageContentId: string
  productionPointerGeneration: number
  productionPointerRawSha256: string
  localPointerGeneration: number
  localPointerRawSha256: string

  claimNonce: string
  claimedAt: string
  claimSha256: string
  signingKeyId: string
  signature: string
}
```

Claim은 installation evidence key로 서명한다. 동일 lease의 두 claim은 split-brain으로 거부한다.

## 12. Drain Permit

Fleet service는 claim을 승인한 뒤 ring concurrency slot에 결합된 permit을 발급한다.

```ts
interface DrainPermitR13A {
  schemaVersion: 1
  schemaId: 'tdt.rollout.drain-permit.r13a.v1'

  rolloutId: string
  planDigest: string
  ringId: string
  ringGeneration: number
  leaseSha256: string
  claimSha256: string
  installationRolloutPseudonym: string

  drainSlotId: string
  drainSlotGeneration: number
  maximumConcurrentDrains: number
  notBefore: string
  expiresAt: string
  revocationGeneration: number

  permitSha256: string
  signingKeyId: string
  signature: string
}
```

R12A는 유효한 Drain Permit 없이 `DRAIN_INTENT_WRITTEN`으로 넘어갈 수 없다.

## 13. Fleet to Local Transition Binding

```ts
interface FleetTransitionBindingR13A {
  schemaVersion: 1
  schemaId: 'tdt.rollout.local-transition-binding.r13a.v1'

  rolloutId: string
  planDigest: string
  ringId: string
  ringGeneration: number
  installationRolloutPseudonym: string

  leaseSha256: string
  claimSha256: string
  drainPermitSha256: string
  updateTransactionId: string

  sourceBuildId: string
  sourcePackageContentId: string
  targetBuildId: string
  targetPackageContentId: string

  expectedProductionPointerGeneration: number
  expectedProductionPointerRawSha256: string
  expectedLocalPointerGeneration: number
  expectedLocalPointerRawSha256: string

  bindingSha256: string
}
```

Persistence order:

```text
lease validated
→ claim fsync
→ drain permit validated
→ R12A transaction CREATED
→ fleet binding fsync
→ journal FLEET_BINDING intent fsync
→ journal FLEET_BINDING effect fsync
→ R12A staging
```

Binding effect 없이 package staging이나 drain을 시작하면 안 된다.

## 14. R12A coordinator integration

R13A는 R12A에 다음 narrow capability를 추가한다.

```text
beginFleetBoundUpdate
getFleetBindingStatus
cancelFleetBoundUpdateBeforeActivation
acknowledgeFleetContainment
```

Renderer가 lease나 private key를 직접 전달하지 않는다. Electron main의 R13A local agent가 R12A coordinator를 호출한다.

R12A 기존 transaction v2는 유지한다. Fleet binding은 sidecar와 journal phase로 결합한다.

## 15. Ring-aware drain

Ring policy는 update 순서를 조절하지만 local safety invariant는 고정이다.

필수 zero-count:

```text
activeNormalSessions       = 0
openPreviewGrants          = 0
openExportGrants           = 0
openSaveSessions           = 0
pendingEncoderJobs         = 0
pendingWorkerRpc           = 0
pinnedFinalSurfaces        = 0
unsettledSubmissionTickets = 0
visibleNormalWindows       = 0
```

Permit expiry가 drain 도중 발생하면:

- `DRAIN_INTENT_WRITTEN` 이전이면 update를 시작하지 않는다.
- `SESSION_DRAINING`이면 explicit abort 또는 새 permit 재승인이 필요하다.
- `ACTIVATION_INTENT_WRITTEN` 이후에는 permit expiry만으로 pointer 상태를 되돌리지 않는다.
- `POINTER_CAS_COMMITTED` 이후에는 recovery replay를 사용한다.

## 16. Lease consumption과 revocation

Lease lifecycle:

```text
ISSUED
→ CLAIMED
→ DRAIN_AUTHORIZED
→ BOUND_TO_R12A
→ CONSUMED
```

`CONSUMED` 시점은 R12A final installed receipt와 R13A local completion receipt가 모두 봉인된 뒤다.

Revocation:

- unclaimed lease: 즉시 revoke
- claimed but unbound lease: claim 취소
- bound but pre-activation lease: R12A explicit abort
- post-CAS lease: recovery replay
- committed lease: containment와 R10A rollback recommendation

## 17. Local completion receipt

```ts
interface LocalTransitionCompletionReceiptR13A {
  schemaVersion: 1
  schemaId: 'tdt.rollout.local-transition-completion.r13a.v1'

  rolloutId: string
  planDigest: string
  ringId: string
  installationRolloutPseudonym: string

  leaseSha256: string
  claimSha256: string
  drainPermitSha256: string
  bindingSha256: string

  updateTransactionId: string
  r12aInstalledFinalReceiptDigest: string
  r11aTargetSessionAdmissionDigest: string

  sourceBuildId: string
  sourcePackageContentId: string
  targetBuildId: string
  targetPackageContentId: string

  productionPointerMutatedByR13A: false
  localPointerMutatedByR13A: false
  pass: true
  receiptSha256: string
}
```

이 receipt는 R12A child chain을 다시 검증한 뒤에만 생성한다.

## 18. Post-update evidence outbox

Evidence는 renderer memory에서 즉시 전송하지 않는다.

```text
main-process evidence builder
→ canonical envelope
→ installation signature
→ atomic outbox file
→ append-only outbox ledger
→ fleet upload
→ signed acknowledgement
→ ACKED marker fsync
→ payload retention policy 적용
```

Outbox entry는 `PENDING`, `IN_FLIGHT`, `ACKED`, `REJECTED`, `QUARANTINED` 상태를 가진다.

ACK 없이 삭제할 수 없다.

## 19. Evidence Envelope v2

```ts
interface PostUpdateEvidenceEnvelopeR13A {
  schemaVersion: 2
  schemaId: 'tdt.rollout.post-update-evidence.r13a.v2'

  rolloutId: string
  planDigest: string
  ringId: string
  ringGeneration: number
  installationRolloutPseudonym: string

  evidenceSequence: number
  evidenceNonce: string
  coarseWindowStart: string
  coarseWindowEnd: string

  sourceBuildId: string
  sourcePackageContentId: string
  targetBuildId: string
  targetPackageContentId: string

  leaseSha256: string
  claimSha256: string
  drainPermitSha256: string
  bindingSha256: string
  localCompletionReceiptDigest: string
  r12aInstalledFinalReceiptDigest: string

  activationFailure: number
  r11aAdmissionFailure: number
  startupCanaryFailure: number
  validationCounterNonZero: number
  artifactDrift: number
  packageDigestMismatch: number
  crossGenerationAsset: number
  faultSentinelObserved: number
  nonfiniteOutput: number
  r12aRecoveryAmbiguous: number
  unauthorizedPointerMutation: number
  silentCpuCanvasWebglFallback: number

  deviceLoss: number
  rendererCrash: number
  gpuProcessCrash: number
  quarantine: number
  admittedSessions: number

  adapterFamilyBucket: string
  driverMajorBucket: string
  exposureDurationBucket: string

  signingKeyId: string
  evidenceSha256: string
  signature: string
}
```

## 20. Privacy source boundary

금지 필드:

```text
imageBytes
thumbnail
pixelHash
fileName
filePath
absolutePath
relativePath
EXIF
documentMetadata
accountName
email
preciseLocation
hardwareSerial
rawCrashDump
rawApplicationLog
installationEnrollmentId
R11A main secret
local filesystem path
```

Exact private view에는 rollout pseudonym이 존재할 수 있다. Reporting view에서는 pseudonym을 제거하고 small cell을 suppression한다.

## 21. Fleet ingestion acknowledgement

```ts
interface EvidenceAcknowledgementR13A {
  schemaVersion: 1
  schemaId: 'tdt.rollout.evidence-ack.r13a.v1'

  rolloutId: string
  planDigest: string
  ringId: string
  evidenceSha256: string
  installationRolloutPseudonym: string
  ingestionSequence: number
  disposition: 'ACCEPTED' | 'DUPLICATE' | 'LATE' | 'REJECTED' | 'QUARANTINED'
  acceptedInputSetDigest: string
  acknowledgedAt: string

  signingKeyId: string
  acknowledgementSha256: string
  signature: string
}
```

`ACCEPTED` 또는 검증된 `DUPLICATE` acknowledgement만 outbox deletion을 허용한다.

## 22. Evidence integrity

Fleet ingestion은 다음을 검증한다.

1. installation evidence signature
2. key generation과 revocation
3. self-hash
4. rollout·plan·ring binding
5. lease·claim·permit·binding chain
6. R12A installed final digest
7. monotonic evidence sequence
8. nonce replay
9. accepted input-set digest
10. late window 분리
11. unknown installation 거부
12. target package identity

## 23. Exact aggregate와 privacy report

Exact aggregate:

```text
acceptedEvidenceSetDigest
admissionSetDigest
leaseSetDigest
localCompletionSetDigest
admittedInstallations
validEvidenceInstallations
missingEvidenceInstallations
lateEvidenceCount
criticalBreakerCount
operational counts
```

Privacy report:

- minimum k = 5
- pseudonym 제거
- adapter family bucket
- driver major bucket
- day bucket
- small cell suppression
- suppressed cell을 0으로 채우지 않음
- raw envelope 공개 금지

## 24. Ring decision

Decision outcome:

```text
ADVANCE
HOLD
PAUSE
CONTAIN
RECOVERY_REPLAY
REJECT
```

Critical breaker가 하나라도 있으면 operational threshold보다 먼저 `CONTAIN`이다.

Missing evidence는 success가 아니다.

Ring advancement는 다음을 모두 요구한다.

- dwell satisfied
- minimum installations
- minimum sessions
- minimum evidence coverage
- critical breaker 0
- operational threshold pass
- drain permit leak 0
- unknown installation 0
- privacy audit pass

## 25. Critical breaker

```text
artifactDrift
packageDigestMismatch
crossGenerationAsset
validationCounterNonZero
faultSentinelObserved
nonfiniteOutput
startupCanaryFailure
r12RecoveryAmbiguous
unauthorizedPointerMutation
silentCpuCanvasWebglFallback
fleetBindingMismatch
leaseReplay
unacknowledgedEvidenceLoss
containmentBypass
```

Zero tolerance다.

## 26. Containment levels

```text
LEVEL-1 HOLD
  ring advancement 중지

LEVEL-2 PAUSE
  신규 lease와 drain permit 발급 중지

LEVEL-3 CONTAIN
  unclaimed lease revoke
  pre-activation local update abort
  target R11A quarantine 요청

LEVEL-4 RECOVERY_REPLAY
  post-CAS recovery-only
  committed target rollback recommendation
  R10A operator-approved rollback replay
```

## 27. Containment Directive v2

```ts
interface ContainmentDirectiveR13A {
  schemaVersion: 2
  schemaId: 'tdt.rollout.containment-directive.r13a.v2'

  rolloutId: string
  planDigest: string
  ringId: string
  ringGeneration: number
  containmentGeneration: number
  revocationGeneration: number

  targetBuildId: string
  targetPackageContentId: string
  reasonEvidenceSetDigest: string
  level: 'LEVEL-1' | 'LEVEL-2' | 'LEVEL-3' | 'LEVEL-4'

  stopNewLeases: boolean
  stopNewDrainPermits: boolean
  revokeUnclaimedLeases: boolean
  abortPreActivationTransactions: boolean
  quarantineCommittedTargets: boolean
  requireRecoveryReplay: boolean

  notBefore: string
  expiresAt: string
  signingKeyId: string
  directiveSha256: string
  signature: string
}
```

## 28. R12A phase별 containment action

| R12A phase | R13A action |
|---|---|
| lease received, transaction 없음 | lease revoke, source 유지 |
| transaction CREATED부터 STAGED_CANARY_PASSED | explicit discard staging |
| DRAIN_INTENT_WRITTEN부터 SESSION_DRAINING | admission block 유지, drain abort 또는 resume 결정 |
| SESSION_DRAINED부터 PACKAGE_COMMITTED | activation intent 취소 가능 여부를 journal로 판정 |
| POINTER_CAS_COMMITTED | previous package recovery-only 또는 target hidden re-attestation |
| RELAUNCH_REQUESTED | stable launcher recovery replay |
| TARGET_PROCESS_STARTED | hidden R11A re-attestation 재시도 또는 recovery-only |
| R11A_REATTESTED | commit reconstruction 또는 containment quarantine |
| COMMITTED | R11A quarantine, R10A rollback recommendation |

R13A는 phase를 추정하지 않고 R12A transaction과 journal을 읽는다.

## 29. Recovery Replay

Recovery replay receipt는 다음 chain을 검증한다.

```text
containment directive
→ affected installation set
→ R12A phase decision
→ R11A quarantine
→ R10A rollback recommendation
→ operator approval
→ R10A rollback final receipt
→ R12A transition back to qualified previous package
→ fresh R11A re-attestation
→ recovery evidence acknowledgement
```

Rollback target이 current lineage에서 qualified되지 않았으면 `NO_QUALIFIED_TARGET`이다.

## 30. No remote silent rollback

Fleet service는 다음을 할 수 없다.

- Production Pointer 직접 CAS
- Local Activation Pointer 직접 CAS
- hidden package swap
- installer process kill 후 임의 package launch
- previous package normal session 강제 발급

모든 rollback은 R10A와 R12A 권위를 통과한다.

## 31. Fleet ledger v2

Fleet ledger entry:

```ts
interface FleetLedgerEntryR13A {
  schemaVersion: 2
  schemaId: 'tdt.rollout.ledger-entry.r13a.v2'
  sequence: number
  previousEntrySha256: string | null
  planGeneration: number
  ringGeneration: number
  revocationGeneration: number
  containmentGeneration: number
  eventType: string
  inputSetDigest: string
  resultDigest: string
  operatorApprovalDigest: string | null
  createdAt: string
  signingKeyId: string
  entrySha256: string
  signature: string
}
```

Finalizer는 ledger를 처음부터 재생한다.

## 32. Key separation

서로 다른 key authority를 사용한다.

```text
plan signing key
lease signing key
drain permit signing key
containment signing key
evidence acknowledgement signing key
installation evidence signing key
```

한 key를 다른 schema에 재사용할 수 없다. Key registry는 generation, notBefore, expiresAt, revokedAt을 가진다.

## 33. Offline과 local-only mode

Offline installation은 evidence를 outbox에 보존할 수 있다. 그러나 fleet acknowledgement가 없으면 ring coverage에 포함되지 않는다.

Local-only mode는 다음을 명시한다.

```text
fleetParticipation = false
remoteLeaseAccepted = false
remoteEvidencePublished = false
```

Local-only installation을 missing evidence success로 계산하지 않는다.

## 34. Fleet finalizer cryptographic closure

기존 R13 finalizer처럼 파일 존재와 summary field만 읽어서는 안 된다.

R13A final writer는 다음을 전부 재검증한다.

1. plan signature와 generation chain
2. key registry와 revocation
3. installation admission set
4. lease set과 claim set
5. drain permit concurrency
6. transition binding set
7. R12A installed final child chain
8. local completion set
9. evidence signatures와 acknowledgement
10. exact aggregate 재계산
11. privacy report 재계산
12. ring decision sequence
13. fleet ledger hash chain
14. containment directive
15. recovery replay chain
16. pointer mutation count
17. explicit exclusion approval

Final writer는 외부가 제공한 `criticalBreakerCount`, `coveragePass`, `privacyAuditPass`를 그대로 신뢰하지 않는다.

## 35. Terminal outcome

최종 outcome은 둘 중 하나다.

```text
COMPLETED
CONTAINED_RECOVERED
```

`CONTAINED_RECOVERED`는 rollout 성공을 뜻하지 않는다. Bad release가 차단되고 모든 affected installation의 recovery replay가 완결됐다는 뜻이다.

## 36. Required implementation surface

```text
app/features/resample-runtime/r13a/
  r13a-contract.mjs
  key-registry-v2.mjs
  rollout-plan-v2.mjs
  fleet-ledger-v2.mjs
  installation-admission.mjs
  update-lease-v2.mjs
  lease-claim.mjs
  drain-permit.mjs
  local-transition-binding.mjs
  local-rollout-agent.mjs
  r12a-fleet-adapter.mjs
  local-completion-receipt.mjs
  evidence-outbox.mjs
  evidence-publisher.mjs
  evidence-acknowledgement.mjs
  fleet-ingestion.mjs
  exact-aggregator-v2.mjs
  privacy-view-v2.mjs
  ring-controller-v2.mjs
  containment-v2.mjs
  recovery-replay.mjs
  fleet-finalizer-v2.mjs
```

필수 수정 표면:

```text
app/features/resample-runtime/r12a/main-update-coordinator.mjs
app/features/resample-runtime/r12a/update-journal-v2.mjs
app/features/resample-runtime/r11a/electron-admission-controller.mjs
electron.mjs
preload.cjs
app/src/env.d.ts
app/src/boot/runtime-modules.ts
app/src/boot/bootstrap-renderer.ts
app/src/runtime/update/runtime-update-service.ts
Active Graph generator
runtime manifest generator
package.json
```

## 37. Required source artifacts

```text
R13A_PARENT_FREEZE_RECEIPT.json
R13A_R13_SUPERSESSION_RECEIPT.json
R13A_CONTRACT_MANIFEST.json
R13A_SCHEMA_MANIFEST.json
R13A_AUTHORITY_SEPARATION_REPORT.json
R13A_FLEET_BINDING_SOURCE_REPORT.json
R13A_DRAIN_PERMIT_SOURCE_REPORT.json
R13A_EVIDENCE_OUTBOX_SOURCE_REPORT.json
R13A_CONTAINMENT_RECOVERY_SOURCE_REPORT.json
R13A_FINALIZER_REVALIDATION_REPORT.json
R13A_NEGATIVE_CONTROL_REPORT.json
R13A_PREDECESSOR_REGRESSION_REPORT.json
R13A_SOURCE_GATE_REPORT.json
TDT_RESAMPLE_RUNTIME_01_R13A_SOURCE_FINAL_RECEIPT.json
```

## 38. Required fleet artifacts

```text
R13A_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json
R13A_ROLLOUT_PLAN_ADMISSION_RECEIPT.json
R13A_INSTALLATION_ADMISSION_BATCH_RECEIPT.json
R13A_LEASE_ISSUANCE_BATCH_RECEIPT.json
R13A_LEASE_CLAIM_BATCH_RECEIPT.json
R13A_DRAIN_PERMIT_BATCH_RECEIPT.json
R13A_LOCAL_TRANSITION_BINDING_BATCH_RECEIPT.json
R13A_R12A_INSTALLED_REPLAY_BATCH_RECEIPT.json
R13A_LOCAL_COMPLETION_BATCH_RECEIPT.json
R13A_POST_UPDATE_EVIDENCE_WINDOW_RECEIPT.json
R13A_EVIDENCE_ACKNOWLEDGEMENT_BATCH_RECEIPT.json
R13A_EXACT_AGGREGATE_RECEIPT.json
R13A_PRIVACY_REPORT_RECEIPT.json
R13A_RING_DECISION_BATCH_RECEIPT.json
R13A_CONTAINMENT_DIRECTIVE_RECEIPT.json
R13A_RECOVERY_REPLAY_RECEIPT.json
R13A_FLEET_NEGATIVE_CONTROL_RECEIPT.json
R13A_FINAL_FLEET_RECEIPT.json
```

## 39. Stable error taxonomy

```text
E_R13A_PARENT_FREEZE_MISMATCH
E_R13A_SUPERSEDED_R13_EVIDENCE
E_R13A_R12A_INSTALLED_RECEIPT_MISSING
E_R13A_R12A_CHILD_CHAIN_INVALID
E_R13A_R11A_INSTALLED_RECEIPT_MISSING
E_R13A_R10A_RELEASE_MISSING
E_R13A_PLAN_INVALID
E_R13A_PLAN_SPLIT_BRAIN
E_R13A_KEY_REVOKED
E_R13A_INSTALLATION_NOT_ADMITTED
E_R13A_LEASE_INVALID
E_R13A_LEASE_REPLAY
E_R13A_LEASE_REVOKED
E_R13A_LEASE_EXPIRED
E_R13A_LEASE_CLAIM_SPLIT_BRAIN
E_R13A_DRAIN_PERMIT_MISSING
E_R13A_DRAIN_PERMIT_EXPIRED
E_R13A_DRAIN_CONCURRENCY_EXCEEDED
E_R13A_FLEET_BINDING_MISSING
E_R13A_FLEET_BINDING_MISMATCH
E_R13A_R12A_TRANSACTION_MISMATCH
E_R13A_RING_DRAIN_POLICY_WEAKENED
E_R13A_LOCAL_COMPLETION_INCOMPLETE
E_R13A_EVIDENCE_PRIVACY_VIOLATION
E_R13A_EVIDENCE_SIGNATURE_INVALID
E_R13A_EVIDENCE_REPLAY
E_R13A_EVIDENCE_SEQUENCE_REGRESSION
E_R13A_EVIDENCE_ACK_INVALID
E_R13A_EVIDENCE_OUTBOX_LOSS
E_R13A_MISSING_EVIDENCE
E_R13A_UNKNOWN_INSTALLATION
E_R13A_CRITICAL_BREAKER
E_R13A_RING_ADVANCEMENT_REJECTED
E_R13A_CONTAINMENT_INVALID
E_R13A_CONTAINMENT_BYPASS
E_R13A_RECOVERY_REPLAY_INCOMPLETE
E_R13A_NO_QUALIFIED_ROLLBACK_TARGET
E_R13A_REMOTE_POINTER_WRITE
E_R13A_LEDGER_INVALID
E_R13A_FINAL_INPUT_SET_MISMATCH
E_R13A_FINAL_RECOMPUTATION_MISMATCH
E_R13A_FINAL_ROLLOUT_INCOMPLETE
E_R13A_NEGATIVE_CONTROL_NOT_DETECTED
```

## 40. Negative-control families

Source와 fleet에서 최소 다음 실패를 검출한다.

1. superseded R13 receipt 재사용
2. R12A source receipt를 installed receipt로 위장
3. R12A child receipt 하나 교체
4. updateTransactionId split
5. lease signature 위조
6. lease wrong ring
7. lease wrong package
8. lease stale Production Pointer
9. lease stale Local Pointer
10. duplicate lease claim
11. drain permit 없는 drain
12. drain concurrency 초과
13. expired drain permit
14. binding sidecar 없이 staging
15. binding과 R12A transaction mismatch
16. R12A zero-count invariant 약화
17. old R11A session 재사용
18. local completion 전에 evidence 발행
19. evidence sequence rewind
20. evidence nonce replay
21. acknowledgement 위조
22. ACK 전에 outbox 삭제
23. missing evidence를 success로 계산
24. late evidence backdating
25. unknown installation evidence
26. forbidden privacy field
27. small cell disclosure
28. critical breaker 무시
29. containment generation rewind
30. revoked lease로 activation
31. post-CAS 단순 abort
32. unqualified rollback target
33. remote Production Pointer write
34. remote Local Pointer write
35. fleet ledger entry 교체
36. finalizer summary field injection
37. finalizer child signature skip
38. finalizer aggregate 재계산 불일치
39. explicit exclusion approval 누락
40. recovery evidence acknowledgement 누락

## 41. Source acceptance

```text
RESAMPLE_RUNTIME_R13A_FLEET_TO_LOCAL_TRANSITION_BINDING_SOURCE_SEALED_AWAITING_R12A_INSTALLED_AND_QUALIFIED_FLEET

786 SOURCE PASS
744 FLEET PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

productionPointerMutatedByR13A      = false
localActivationPointerMutatedByR13A = false
fleetExecutionPerformed             = false
historicalPassCarryForward          = 0
```

## 42. Final fleet acceptance

```text
RESAMPLE_RUNTIME_R13A_FLEET_LEASE_LOCAL_TRANSITION_EVIDENCE_AND_CONTAINMENT_RECOVERY_SEALED_AWAITING_R14A

786 SOURCE PASS
744 FLEET PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

r12aInstalledEvidenceReplayed       = true
fleetLeaseBoundToLocalTransition    = true
ringAwareDrainEnforced              = true
postUpdateEvidenceAcknowledged      = true
exactAggregateRecomputed            = true
privacyReportRecomputed             = true
containmentRecoveryReplayPassed     = true
unknownInstallationCount            = 0
criticalBreakerCount                = 0
unacknowledgedEvidenceLossCount     = 0
productionPointerMutatedByR13A      = false
localActivationPointerMutatedByR13A = false
historicalPassCarryForward          = 0
```

## 43. Source gate catalog
### 43.1 PARENT_LINEAGE_AND_SUPERSESSION
#### R13A-S001 `PARENT_BUNDLE_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S001` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S002 `PARENT_BUNDLE_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S002` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S003 `PARENT_BUNDLE_SHA256_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S003` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S004 `PARENT_BUNDLE_SHA256_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S004` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S005 `PARENT_R12A_SPEC_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S005` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S006 `PARENT_R12A_SPEC_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S006` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S007 `PARENT_R12A_SPEC_SHA256_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S007` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S008 `PARENT_R12A_SPEC_SHA256_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S008` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S009 `PARENT_R12A_SOURCE_RECEIPT_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S009` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S010 `PARENT_R12A_SOURCE_RECEIPT_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S010` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S011 `PARENT_R12A_SOURCE_RECEIPT_SHA256_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S011` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S012 `PARENT_R12A_SOURCE_RECEIPT_SHA256_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S012` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S013 `PARENT_R12A_SOURCE_STATE_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S013` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S014 `PARENT_R12A_SOURCE_STATE_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S014` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S015 `PARENT_R12A_SOURCE_PASS_360_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S015` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S016 `PARENT_R12A_SOURCE_PASS_360_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S016` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S017 `PARENT_R12A_INSTALLED_PENDING_480_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S017` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S018 `PARENT_R12A_INSTALLED_PENDING_480_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S018` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S019 `PARENT_R12A_FAIL_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S019` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S020 `PARENT_R12A_FAIL_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S020` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S021 `PARENT_PRODUCTION_POINTER_SHA_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S021` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S022 `PARENT_PRODUCTION_POINTER_SHA_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S022` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S023 `PARENT_PRODUCTION_POINTER_MUTATION_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S023` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S024 `PARENT_PRODUCTION_POINTER_MUTATION_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S024` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S025 `PARENT_LOCAL_POINTER_MUTATION_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S025` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S026 `PARENT_LOCAL_POINTER_MUTATION_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S026` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S027 `OLD_R13_SPEC_INVENTORIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S027` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S028 `OLD_R13_SPEC_INVENTORIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S028` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S029 `OLD_R13_RECEIPT_INVENTORIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S029` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S030 `OLD_R13_RECEIPT_INVENTORIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S030` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S031 `OLD_R13_SUPERSEDED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S031` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S032 `OLD_R13_SUPERSEDED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S032` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S033 `OLD_R13_PASS_CARRY_FORWARD_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S033` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S034 `OLD_R13_PASS_CARRY_FORWARD_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S034` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S035 `R10A_RELEASE_PENDING_RECORDED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S035` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S036 `R10A_RELEASE_PENDING_RECORDED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S036` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S037 `R11A_INSTALLED_PENDING_RECORDED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S037` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S038 `R11A_INSTALLED_PENDING_RECORDED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S038` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S039 `R12A_INSTALLED_PENDING_RECORDED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S039` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S040 `R12A_INSTALLED_PENDING_RECORDED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S040` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S041 `SOURCE_MODE_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S041` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S042 `SOURCE_MODE_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S042` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S043 `FLEET_EXECUTION_ABSENT_RECORDED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S043` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S044 `FLEET_EXECUTION_ABSENT_RECORDED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S044` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S045 `PARENT_RECEIPT_REWRITE_FORBIDDEN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S045` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S046 `PARENT_RECEIPT_REWRITE_FORBIDDEN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S046` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S047 `PARENT_POINTER_WRITE_FORBIDDEN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S047` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S048 `PARENT_POINTER_WRITE_FORBIDDEN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S048` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S049 `PREDECESSOR_SNAPSHOT_ISOLATED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S049` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S050 `PREDECESSOR_SNAPSHOT_ISOLATED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S050` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S051 `CURRENT_FACTS_RECEIPT_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S051` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S052 `CURRENT_FACTS_RECEIPT_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S052` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S053 `PARENT_FREEZE_MANIFEST_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S053` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S054 `PARENT_FREEZE_MANIFEST_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S054` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S055 `PARENT_FREEZE_CHILD_DIGESTS_COMPLETE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S055` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S056 `PARENT_FREEZE_CHILD_DIGESTS_COMPLETE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S056` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S057 `SOURCE_GATE_COUNT_PINNED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S057` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S058 `SOURCE_GATE_COUNT_PINNED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S058` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S059 `FLEET_GATE_COUNT_PINNED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S059` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S060 `FLEET_GATE_COUNT_PINNED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S060` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
### 43.2 AUTHORITY_AND_SSOT
#### R13A-S061 `R10A_RELEASE_AUTHORITY_READ_ONLY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S061` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S062 `R10A_RELEASE_AUTHORITY_READ_ONLY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S062` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S063 `R11A_SESSION_AUTHORITY_SEPARATED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S063` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S064 `R11A_SESSION_AUTHORITY_SEPARATED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S064` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S065 `R12A_TRANSACTION_AUTHORITY_SEPARATED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S065` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S066 `R12A_TRANSACTION_AUTHORITY_SEPARATED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S066` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S067 `R13A_FLEET_AUTHORITY_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S067` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S068 `R13A_FLEET_AUTHORITY_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S068` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S069 `R13A_LOCAL_AGENT_AUTHORITY_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S069` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S070 `R13A_LOCAL_AGENT_AUTHORITY_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S070` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S071 `FLEET_PLAN_SSOT_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S071` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S072 `FLEET_PLAN_SSOT_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S072` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S073 `FLEET_LEDGER_SSOT_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S073` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S074 `FLEET_LEDGER_SSOT_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S074` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S075 `REVOCATION_GENERATION_SSOT_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S075` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S076 `REVOCATION_GENERATION_SSOT_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S076` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S077 `CONTAINMENT_GENERATION_SSOT_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S077` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S078 `CONTAINMENT_GENERATION_SSOT_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S078` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S079 `ACCEPTED_EVIDENCE_SET_SSOT_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S079` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S080 `ACCEPTED_EVIDENCE_SET_SSOT_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S080` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S081 `FLEET_BINDING_SIDECAR_SSOT_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S081` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S082 `FLEET_BINDING_SIDECAR_SSOT_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S082` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S083 `R12A_TRANSACTION_V2_PRESERVED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S083` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S084 `R12A_TRANSACTION_V2_PRESERVED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S084` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S085 `R12A_JOURNAL_FLEET_PHASE_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S085` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S086 `R12A_JOURNAL_FLEET_PHASE_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S086` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S087 `PRODUCTION_POINTER_WRITE_FORBIDDEN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S087` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S088 `PRODUCTION_POINTER_WRITE_FORBIDDEN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S088` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S089 `LOCAL_POINTER_WRITE_FORBIDDEN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S089` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S090 `LOCAL_POINTER_WRITE_FORBIDDEN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S090` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S091 `R11A_SESSION_ISSUE_FORBIDDEN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S091` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S092 `R11A_SESSION_ISSUE_FORBIDDEN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S092` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S093 `RENDERER_PRIVATE_KEY_ACCESS_FORBIDDEN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S093` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S094 `RENDERER_PRIVATE_KEY_ACCESS_FORBIDDEN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S094` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S095 `RENDERER_LEASE_VALIDATION_FORBIDDEN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S095` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S096 `RENDERER_LEASE_VALIDATION_FORBIDDEN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S096` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S097 `MAIN_PROCESS_LOCAL_AGENT_SINGLETON_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S097` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S098 `MAIN_PROCESS_LOCAL_AGENT_SINGLETON_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S098` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S099 `FLEET_SERVER_NO_LOCAL_EFFECT_AUTHORITY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S099` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S100 `FLEET_SERVER_NO_LOCAL_EFFECT_AUTHORITY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S100` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S101 `NO_REMOTE_SILENT_ROLLBACK_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S101` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S102 `NO_REMOTE_SILENT_ROLLBACK_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S102` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S103 `NO_HOT_PATCH_AUTHORITY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S103` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S104 `NO_HOT_PATCH_AUTHORITY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S104` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S105 `NO_COMPONENT_SWAP_AUTHORITY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S105` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S106 `NO_COMPONENT_SWAP_AUTHORITY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S106` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S107 `NO_USER_JOB_AUTHORITY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S107` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S108 `NO_USER_JOB_AUTHORITY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S108` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S109 `NO_RELEASE_QUALIFICATION_AUTHORITY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S109` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S110 `NO_RELEASE_QUALIFICATION_AUTHORITY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S110` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S111 `NO_EVIDENCE_SUMMARY_TRUST_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S111` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S112 `NO_EVIDENCE_SUMMARY_TRUST_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S112` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S113 `NO_MTIME_RECOVERY_AUTHORITY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S113` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S114 `NO_MTIME_RECOVERY_AUTHORITY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S114` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S115 `NO_MISSING_AS_SUCCESS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S115` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S116 `NO_MISSING_AS_SUCCESS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S116` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S117 `NO_SMALL_CELL_ZERO_FILL_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S117` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S118 `NO_SMALL_CELL_ZERO_FILL_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S118` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S119 `AUTHORITY_GRAPH_CYCLE_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S119` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S120 `AUTHORITY_GRAPH_CYCLE_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S120` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S121 `NORMAL_WINDOW_FLEET_UPDATE_BARRIER_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S121` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S122 `NORMAL_WINDOW_FLEET_UPDATE_BARRIER_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S122` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S123 `R13A_RUNTIME_MODULE_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S123` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S124 `R13A_RUNTIME_MODULE_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S124` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S125 `ACTIVE_GRAPH_R13A_NODE_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S125` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S126 `ACTIVE_GRAPH_R13A_NODE_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S126` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S127 `RUNTIME_MANIFEST_R13A_MODULE_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S127` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S128 `RUNTIME_MANIFEST_R13A_MODULE_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S128` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S129 `PRELOAD_NARROW_CAPABILITY_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S129` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S130 `PRELOAD_NARROW_CAPABILITY_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S130` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S131 `ELECTRON_MAIN_IMPORT_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S131` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S132 `ELECTRON_MAIN_IMPORT_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S132` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S133 `SOURCE_FINALIZER_NO_POINTER_WRITE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S133` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S134 `SOURCE_FINALIZER_NO_POINTER_WRITE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S134` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S135 `FLEET_FINALIZER_NO_POINTER_WRITE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S135` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S136 `FLEET_FINALIZER_NO_POINTER_WRITE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S136` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S137 `LOCAL_AGENT_NO_PLAN_SIGNING_KEY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S137` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S138 `LOCAL_AGENT_NO_PLAN_SIGNING_KEY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S138` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S139 `LOCAL_AGENT_NO_CONTAINMENT_SIGNING_KEY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S139` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S140 `LOCAL_AGENT_NO_CONTAINMENT_SIGNING_KEY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S140` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
### 43.3 SCHEMA_AND_IDENTITY
#### R13A-S141 `ROLLOUT_PLAN_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S141` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S142 `ROLLOUT_PLAN_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S142` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S143 `FLEET_LEDGER_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S143` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S144 `FLEET_LEDGER_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S144` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S145 `INSTALLATION_ADMISSION_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S145` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S146 `INSTALLATION_ADMISSION_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S146` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S147 `UPDATE_LEASE_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S147` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S148 `UPDATE_LEASE_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S148` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S149 `LEASE_CLAIM_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S149` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S150 `LEASE_CLAIM_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S150` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S151 `DRAIN_PERMIT_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S151` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S152 `DRAIN_PERMIT_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S152` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S153 `FLEET_BINDING_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S153` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S154 `FLEET_BINDING_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S154` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S155 `LOCAL_COMPLETION_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S155` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S156 `LOCAL_COMPLETION_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S156` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S157 `POST_UPDATE_EVIDENCE_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S157` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S158 `POST_UPDATE_EVIDENCE_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S158` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S159 `EVIDENCE_ACK_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S159` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S160 `EVIDENCE_ACK_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S160` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S161 `EXACT_AGGREGATE_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S161` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S162 `EXACT_AGGREGATE_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S162` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S163 `PRIVACY_REPORT_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S163` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S164 `PRIVACY_REPORT_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S164` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S165 `RING_DECISION_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S165` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S166 `RING_DECISION_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S166` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S167 `CONTAINMENT_DIRECTIVE_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S167` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S168 `CONTAINMENT_DIRECTIVE_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S168` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S169 `RECOVERY_REPLAY_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S169` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S170 `RECOVERY_REPLAY_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S170` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S171 `FINAL_FLEET_RECEIPT_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S171` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S172 `FINAL_FLEET_RECEIPT_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S172` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S173 `KEY_REGISTRY_V2_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S173` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S174 `KEY_REGISTRY_V2_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S174` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S175 `OUTBOX_ENTRY_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S175` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S176 `OUTBOX_ENTRY_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S176` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S177 `OUTBOX_LEDGER_ENTRY_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S177` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S178 `OUTBOX_LEDGER_ENTRY_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S178` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S179 `FLEET_INPUT_BUNDLE_SCHEMA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S179` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S180 `FLEET_INPUT_BUNDLE_SCHEMA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S180` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S181 `ROLLOUT_ID_192_BIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S181` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S182 `ROLLOUT_ID_192_BIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S182` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S183 `LEASE_NONCE_192_BIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S183` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S184 `LEASE_NONCE_192_BIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S184` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S185 `CLAIM_NONCE_192_BIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S185` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S186 `CLAIM_NONCE_192_BIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S186` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S187 `DRAIN_SLOT_ID_192_BIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S187` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S188 `DRAIN_SLOT_ID_192_BIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S188` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S189 `EVIDENCE_NONCE_192_BIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S189` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S190 `EVIDENCE_NONCE_192_BIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S190` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S191 `PLAN_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S191` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S192 `PLAN_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S192` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S193 `LEASE_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S193` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S194 `LEASE_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S194` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S195 `CLAIM_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S195` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S196 `CLAIM_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S196` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S197 `PERMIT_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S197` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S198 `PERMIT_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S198` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S199 `BINDING_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S199` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S200 `BINDING_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S200` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S201 `LOCAL_COMPLETION_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S201` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S202 `LOCAL_COMPLETION_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S202` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S203 `EVIDENCE_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S203` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S204 `EVIDENCE_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S204` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S205 `ACK_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S205` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S206 `ACK_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S206` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S207 `LEDGER_ENTRY_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S207` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S208 `LEDGER_ENTRY_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S208` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S209 `DIRECTIVE_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S209` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S210 `DIRECTIVE_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S210` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S211 `RECOVERY_RECEIPT_SELF_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S211` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S212 `RECOVERY_RECEIPT_SELF_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S212` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S213 `CANONICAL_JSON_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S213` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S214 `CANONICAL_JSON_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S214` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S215 `KEY_ID_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S215` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S216 `KEY_ID_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S216` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S217 `SIGNATURE_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S217` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S218 `SIGNATURE_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S218` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S219 `SCHEMA_VERSION_PINNED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S219` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S220 `SCHEMA_VERSION_PINNED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S220` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
### 43.4 R12A_INSTALLED_EVIDENCE_REPLAY
#### R13A-S221 `R9A_PHYSICAL_FINAL_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S221` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S222 `R9A_PHYSICAL_FINAL_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S222` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S223 `R10A_FINAL_RELEASE_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S223` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S224 `R10A_FINAL_RELEASE_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S224` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S225 `R10A_LINEAGE_RESTORATION_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S225` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S226 `R10A_LINEAGE_RESTORATION_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S226` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S227 `R11A_INSTALLED_FINAL_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S227` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S228 `R11A_INSTALLED_FINAL_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S228` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S229 `R12A_INSTALLED_FINAL_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S229` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S230 `R12A_INSTALLED_FINAL_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S230` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S231 `R12A_TRANSITION_ADMISSION_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S231` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S232 `R12A_TRANSITION_ADMISSION_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S232` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S233 `R12A_STAGING_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S233` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S234 `R12A_STAGING_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S234` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S235 `R12A_DRAIN_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S235` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S236 `R12A_DRAIN_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S236` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S237 `R12A_ACTIVATION_INTENT_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S237` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S238 `R12A_ACTIVATION_INTENT_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S238` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S239 `R12A_LOCAL_POINTER_CAS_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S239` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S240 `R12A_LOCAL_POINTER_CAS_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S240` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S241 `R12A_RELAUNCH_REQUEST_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S241` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S242 `R12A_RELAUNCH_REQUEST_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S242` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S243 `R12A_LAUNCH_ACK_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S243` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S244 `R12A_LAUNCH_ACK_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S244` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S245 `R12A_REATTESTATION_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S245` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S246 `R12A_REATTESTATION_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S246` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S247 `R12A_COMMIT_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S247` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S248 `R12A_COMMIT_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S248` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S249 `R12A_RECOVERY_MATRIX_CHILD_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S249` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S250 `R12A_RECOVERY_MATRIX_CHILD_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S250` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S251 `R12A_CHILD_SELF_HASH_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S251` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S252 `R12A_CHILD_SELF_HASH_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S252` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S253 `R12A_TRANSACTION_ID_COHERENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S253` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S254 `R12A_TRANSACTION_ID_COHERENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S254` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S255 `R12A_SOURCE_BUILD_COHERENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S255` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S256 `R12A_SOURCE_BUILD_COHERENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S256` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S257 `R12A_SOURCE_PACKAGE_COHERENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S257` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S258 `R12A_SOURCE_PACKAGE_COHERENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S258` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S259 `R12A_TARGET_BUILD_COHERENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S259` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S260 `R12A_TARGET_BUILD_COHERENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S260` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S261 `R12A_TARGET_PACKAGE_COHERENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S261` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S262 `R12A_TARGET_PACKAGE_COHERENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S262` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S263 `R12A_PRODUCTION_POINTER_MUTATION_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S263` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S264 `R12A_PRODUCTION_POINTER_MUTATION_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S264` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S265 `R12A_LOCAL_POINTER_CAS_EXACT_ONE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S265` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S266 `R12A_LOCAL_POINTER_CAS_EXACT_ONE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S266` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S267 `R12A_TARGET_SESSION_FRESH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S267` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S268 `R12A_TARGET_SESSION_FRESH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S268` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S269 `R12A_TARGET_SESSION_GENERATION_MONOTONIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S269` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S270 `R12A_TARGET_SESSION_GENERATION_MONOTONIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S270` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S271 `R12A_CROSS_GENERATION_ASSET_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S271` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S272 `R12A_CROSS_GENERATION_ASSET_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S272` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S273 `R12A_RECOVERY_AMBIGUITY_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S273` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S274 `R12A_RECOVERY_AMBIGUITY_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S274` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S275 `R12A_ACTIVE_GRAPH_CURRENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S275` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S276 `R12A_ACTIVE_GRAPH_CURRENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S276` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S277 `R12A_R9A_IDENTITY_CURRENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S277` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S278 `R12A_R9A_IDENTITY_CURRENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S278` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S279 `R12A_INSTALLED_RECEIPT_NOT_SOURCE_FIXTURE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S279` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S280 `R12A_INSTALLED_RECEIPT_NOT_SOURCE_FIXTURE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S280` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S281 `R11A_HMAC_SESSION_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S281` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S282 `R11A_HMAC_SESSION_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S282` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S283 `R11A_SESSION_SENDER_BINDING_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S283` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S284 `R11A_SESSION_SENDER_BINDING_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S284` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S285 `R11A_QUARANTINE_STATE_REPLAYED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S285` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S286 `R11A_QUARANTINE_STATE_REPLAYED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S286` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S287 `R10A_PACKAGE_IDENTITY_MATCHED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S287` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S288 `R10A_PACKAGE_IDENTITY_MATCHED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S288` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S289 `R10A_POINTER_GENERATION_MATCHED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S289` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S290 `R10A_POINTER_GENERATION_MATCHED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S290` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S291 `R10A_POINTER_RAW_HASH_MATCHED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S291` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S292 `R10A_POINTER_RAW_HASH_MATCHED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S292` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S293 `LOCAL_POINTER_GENERATION_MATCHED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S293` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S294 `LOCAL_POINTER_GENERATION_MATCHED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S294` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S295 `LOCAL_POINTER_RAW_HASH_MATCHED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S295` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S296 `LOCAL_POINTER_RAW_HASH_MATCHED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S296` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S297 `INSTALLATION_PSEUDONYM_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S297` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S298 `INSTALLATION_PSEUDONYM_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S298` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S299 `INSTALLATION_ADMISSION_RECEIPT_SEALED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S299` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S300 `INSTALLATION_ADMISSION_RECEIPT_SEALED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S300` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S301 `INSTALLATION_ADMISSION_BATCH_DEDUPED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S301` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S302 `INSTALLATION_ADMISSION_BATCH_DEDUPED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S302` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S303 `UNKNOWN_INSTALLATION_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S303` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S304 `UNKNOWN_INSTALLATION_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S304` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S305 `PREDECESSOR_MINIMUM_TWO_INSTALLATIONS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S305` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S306 `PREDECESSOR_MINIMUM_TWO_INSTALLATIONS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S306` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S307 `PREDECESSOR_INPUT_SET_DIGEST_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S307` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S308 `PREDECESSOR_INPUT_SET_DIGEST_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S308` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S309 `PREDECESSOR_SIGNATURE_CHAIN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S309` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S310 `PREDECESSOR_SIGNATURE_CHAIN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S310` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S311 `PREDECESSOR_KEY_REGISTRY_VALID_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S311` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S312 `PREDECESSOR_KEY_REGISTRY_VALID_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S312` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S313 `PREDECESSOR_EXPIRED_KEY_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S313` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S314 `PREDECESSOR_EXPIRED_KEY_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S314` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S315 `PREDECESSOR_REVOKED_KEY_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S315` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S316 `PREDECESSOR_REVOKED_KEY_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S316` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S317 `PREDECESSOR_SPLIT_BRAIN_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S317` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S318 `PREDECESSOR_SPLIT_BRAIN_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S318` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S319 `PREDECESSOR_REPLAY_REPORT_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S319` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S320 `PREDECESSOR_REPLAY_REPORT_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S320` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
### 43.5 LEASE_CLAIM_PERMIT_AND_BINDING
#### R13A-S321 `LEASE_ROLLOUT_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S321` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S322 `LEASE_ROLLOUT_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S322` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S323 `LEASE_PLAN_DIGEST_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S323` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S324 `LEASE_PLAN_DIGEST_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S324` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S325 `LEASE_PLAN_GENERATION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S325` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S326 `LEASE_PLAN_GENERATION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S326` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S327 `LEASE_RING_ID_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S327` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S328 `LEASE_RING_ID_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S328` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S329 `LEASE_RING_GENERATION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S329` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S330 `LEASE_RING_GENERATION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S330` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S331 `LEASE_REVOCATION_GENERATION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S331` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S332 `LEASE_REVOCATION_GENERATION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S332` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S333 `LEASE_INSTALLATION_PSEUDONYM_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S333` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S334 `LEASE_INSTALLATION_PSEUDONYM_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S334` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S335 `LEASE_COHORT_BUCKET_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S335` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S336 `LEASE_COHORT_BUCKET_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S336` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S337 `LEASE_SOURCE_BUILD_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S337` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S338 `LEASE_SOURCE_BUILD_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S338` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S339 `LEASE_SOURCE_PACKAGE_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S339` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S340 `LEASE_SOURCE_PACKAGE_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S340` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S341 `LEASE_TARGET_BUILD_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S341` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S342 `LEASE_TARGET_BUILD_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S342` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S343 `LEASE_TARGET_PACKAGE_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S343` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S344 `LEASE_TARGET_PACKAGE_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S344` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S345 `LEASE_R10A_RELEASE_DIGEST_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S345` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S346 `LEASE_R10A_RELEASE_DIGEST_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S346` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S347 `LEASE_R10A_LINEAGE_DIGEST_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S347` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S348 `LEASE_R10A_LINEAGE_DIGEST_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S348` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S349 `LEASE_R12A_SOURCE_CONTRACT_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S349` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S350 `LEASE_R12A_SOURCE_CONTRACT_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S350` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S351 `LEASE_PRODUCTION_POINTER_GENERATION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S351` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S352 `LEASE_PRODUCTION_POINTER_GENERATION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S352` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S353 `LEASE_PRODUCTION_POINTER_RAW_HASH_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S353` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S354 `LEASE_PRODUCTION_POINTER_RAW_HASH_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S354` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S355 `LEASE_LOCAL_POINTER_GENERATION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S355` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S356 `LEASE_LOCAL_POINTER_GENERATION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S356` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S357 `LEASE_LOCAL_POINTER_RAW_HASH_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S357` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S358 `LEASE_LOCAL_POINTER_RAW_HASH_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S358` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S359 `LEASE_NOT_BEFORE_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S359` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S360 `LEASE_NOT_BEFORE_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S360` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S361 `LEASE_EXPIRY_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S361` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S362 `LEASE_EXPIRY_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S362` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S363 `LEASE_SINGLE_USE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S363` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S364 `LEASE_SINGLE_USE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S364` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S365 `LEASE_SIGNATURE_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S365` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S366 `LEASE_SIGNATURE_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S366` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S367 `LEASE_KEY_GENERATION_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S367` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S368 `LEASE_KEY_GENERATION_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S368` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S369 `LEASE_REVOCATION_CHECKED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S369` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S370 `LEASE_REVOCATION_CHECKED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S370` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S371 `LEASE_REPLAY_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S371` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S372 `LEASE_REPLAY_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S372` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S373 `LEASE_WRONG_RING_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S373` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S374 `LEASE_WRONG_RING_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S374` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S375 `LEASE_WRONG_PACKAGE_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S375` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S376 `LEASE_WRONG_PACKAGE_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S376` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S377 `LEASE_STALE_PRODUCTION_POINTER_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S377` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S378 `LEASE_STALE_PRODUCTION_POINTER_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S378` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S379 `LEASE_STALE_LOCAL_POINTER_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S379` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S380 `LEASE_STALE_LOCAL_POINTER_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S380` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S381 `CLAIM_INSTALLATION_SIGNATURE_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S381` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S382 `CLAIM_INSTALLATION_SIGNATURE_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S382` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S383 `CLAIM_SOURCE_SESSION_DIGEST_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S383` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S384 `CLAIM_SOURCE_SESSION_DIGEST_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S384` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S385 `CLAIM_SOURCE_PACKAGE_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S385` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S386 `CLAIM_SOURCE_PACKAGE_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S386` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S387 `CLAIM_POINTER_BEFORE_IMAGES_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S387` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S388 `CLAIM_POINTER_BEFORE_IMAGES_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S388` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S389 `CLAIM_MONOTONIC_PER_LEASE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S389` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S390 `CLAIM_MONOTONIC_PER_LEASE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S390` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S391 `CLAIM_SPLIT_BRAIN_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S391` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S392 `CLAIM_SPLIT_BRAIN_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S392` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S393 `DRAIN_PERMIT_CLAIM_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S393` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S394 `DRAIN_PERMIT_CLAIM_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S394` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S395 `DRAIN_PERMIT_RING_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S395` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S396 `DRAIN_PERMIT_RING_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S396` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S397 `DRAIN_PERMIT_SLOT_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S397` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S398 `DRAIN_PERMIT_SLOT_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S398` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S399 `DRAIN_PERMIT_CONCURRENCY_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S399` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S400 `DRAIN_PERMIT_CONCURRENCY_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S400` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S401 `DRAIN_PERMIT_EXPIRY_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S401` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S402 `DRAIN_PERMIT_EXPIRY_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S402` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S403 `DRAIN_PERMIT_REVOCATION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S403` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S404 `DRAIN_PERMIT_REVOCATION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S404` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S405 `DRAIN_PERMIT_SIGNATURE_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S405` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S406 `DRAIN_PERMIT_SIGNATURE_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S406` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S407 `DRAIN_WITHOUT_PERMIT_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S407` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S408 `DRAIN_WITHOUT_PERMIT_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S408` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S409 `DRAIN_CONCURRENCY_EXCEEDED_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S409` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S410 `DRAIN_CONCURRENCY_EXCEEDED_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S410` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S411 `BINDING_UPDATE_TRANSACTION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S411` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S412 `BINDING_UPDATE_TRANSACTION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S412` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S413 `BINDING_LEASE_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S413` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S414 `BINDING_LEASE_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S414` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S415 `BINDING_CLAIM_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S415` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S416 `BINDING_CLAIM_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S416` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S417 `BINDING_PERMIT_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S417` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S418 `BINDING_PERMIT_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S418` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S419 `BINDING_SOURCE_TARGET_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S419` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S420 `BINDING_SOURCE_TARGET_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S420` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S421 `BINDING_POINTER_BEFORE_IMAGES_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S421` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S422 `BINDING_POINTER_BEFORE_IMAGES_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S422` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S423 `BINDING_FSYNC_BEFORE_STAGING_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S423` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S424 `BINDING_FSYNC_BEFORE_STAGING_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S424` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S425 `BINDING_JOURNAL_INTENT_BEFORE_EFFECT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S425` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S426 `BINDING_JOURNAL_INTENT_BEFORE_EFFECT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S426` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S427 `BINDING_EFFECT_BEFORE_DRAIN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S427` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S428 `BINDING_EFFECT_BEFORE_DRAIN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S428` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S429 `BINDING_TRANSACTION_MISMATCH_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S429` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S430 `BINDING_TRANSACTION_MISMATCH_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S430` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S431 `R12A_NARROW_FLEET_CAPABILITY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S431` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S432 `R12A_NARROW_FLEET_CAPABILITY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S432` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S433 `R12A_PRIVATE_KEY_ABSENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S433` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S434 `R12A_PRIVATE_KEY_ABSENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S434` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S435 `LOCAL_AGENT_SINGLE_ACTIVE_LEASE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S435` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S436 `LOCAL_AGENT_SINGLE_ACTIVE_LEASE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S436` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S437 `LEASE_STATE_MACHINE_MONOTONIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S437` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S438 `LEASE_STATE_MACHINE_MONOTONIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S438` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S439 `LEASE_CONSUMPTION_AFTER_COMPLETION_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S439` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S440 `LEASE_CONSUMPTION_AFTER_COMPLETION_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S440` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
### 43.6 RING_DRAIN_AND_LOCAL_INTEGRATION
#### R13A-S441 `RING_POLICY_MAX_CONCURRENT_CLAIMS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S441` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S442 `RING_POLICY_MAX_CONCURRENT_CLAIMS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S442` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S443 `RING_POLICY_MAX_CONCURRENT_DRAINS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S443` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S444 `RING_POLICY_MAX_CONCURRENT_DRAINS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S444` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S445 `RING_POLICY_DRAIN_DEADLINE_30000_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S445` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S446 `RING_POLICY_DRAIN_DEADLINE_30000_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S446` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S447 `RING_POLICY_CANNOT_WEAKEN_ZERO_COUNT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S447` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S448 `RING_POLICY_CANNOT_WEAKEN_ZERO_COUNT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S448` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S449 `RING_POLICY_CANNOT_SKIP_JOURNAL_FSYNC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S449` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S450 `RING_POLICY_CANNOT_SKIP_JOURNAL_FSYNC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S450` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S451 `RING_POLICY_CANNOT_WEAKEN_POINTER_CAS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S451` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S452 `RING_POLICY_CANNOT_WEAKEN_POINTER_CAS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S452` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S453 `RING_DRAIN_SLOT_LEDGER_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S453` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S454 `RING_DRAIN_SLOT_LEDGER_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S454` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S455 `RING_DRAIN_SLOT_RELEASE_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S455` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S456 `RING_DRAIN_SLOT_RELEASE_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S456` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S457 `RING_DRAIN_SLOT_LEAK_DETECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S457` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S458 `RING_DRAIN_SLOT_LEAK_DETECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S458` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S459 `R13A_LOCAL_AGENT_ELECTRON_MAIN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S459` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S460 `R13A_LOCAL_AGENT_ELECTRON_MAIN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S460` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S461 `LOCAL_AGENT_CREATED_BEFORE_WINDOW_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S461` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S462 `LOCAL_AGENT_CREATED_BEFORE_WINDOW_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S462` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S463 `LOCAL_AGENT_CREATED_AFTER_R11A_R12A_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S463` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S464 `LOCAL_AGENT_CREATED_AFTER_R11A_R12A_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S464` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S465 `LOCAL_AGENT_BOOT_RECOVERY_PREFLIGHT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S465` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S466 `LOCAL_AGENT_BOOT_RECOVERY_PREFLIGHT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S466` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S467 `LOCAL_AGENT_PLAN_CACHE_ATOMIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S467` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S468 `LOCAL_AGENT_PLAN_CACHE_ATOMIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S468` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S469 `LOCAL_AGENT_LEASE_INBOX_ATOMIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S469` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S470 `LOCAL_AGENT_LEASE_INBOX_ATOMIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S470` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S471 `LOCAL_AGENT_PRIVATE_OUTBOX_ATOMIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S471` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S472 `LOCAL_AGENT_PRIVATE_OUTBOX_ATOMIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S472` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S473 `LOCAL_AGENT_IPC_NARROW_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S473` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S474 `LOCAL_AGENT_IPC_NARROW_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S474` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S475 `PRELOAD_NO_LEASE_SIGNING_KEY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S475` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S476 `PRELOAD_NO_LEASE_SIGNING_KEY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S476` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S477 `PRELOAD_NO_EVIDENCE_PRIVATE_KEY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S477` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S478 `PRELOAD_NO_EVIDENCE_PRIVATE_KEY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S478` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S479 `PRELOAD_NO_POINTER_PATH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S479` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S480 `PRELOAD_NO_POINTER_PATH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S480` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S481 `RENDERER_STATUS_READ_ONLY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S481` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S482 `RENDERER_STATUS_READ_ONLY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S482` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S483 `RENDERER_CANNOT_CLAIM_LEASE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S483` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S484 `RENDERER_CANNOT_CLAIM_LEASE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S484` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S485 `RENDERER_CANNOT_ISSUE_PERMIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S485` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S486 `RENDERER_CANNOT_ISSUE_PERMIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S486` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S487 `RENDERER_CANNOT_PUBLISH_EVIDENCE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S487` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S488 `RENDERER_CANNOT_PUBLISH_EVIDENCE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S488` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S489 `R12A_BEGIN_FLEET_BOUND_UPDATE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S489` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S490 `R12A_BEGIN_FLEET_BOUND_UPDATE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S490` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S491 `R12A_GET_FLEET_BINDING_STATUS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S491` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S492 `R12A_GET_FLEET_BINDING_STATUS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S492` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S493 `R12A_CANCEL_BEFORE_ACTIVATION_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S493` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S494 `R12A_CANCEL_BEFORE_ACTIVATION_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S494` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S495 `R12A_ACK_CONTAINMENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S495` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S496 `R12A_ACK_CONTAINMENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S496` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S497 `R12A_DRAIN_INTENT_REQUIRES_PERMIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S497` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S498 `R12A_DRAIN_INTENT_REQUIRES_PERMIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S498` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S499 `R12A_DRAIN_ZERO_ACTIVE_SESSIONS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S499` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S500 `R12A_DRAIN_ZERO_ACTIVE_SESSIONS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S500` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S501 `R12A_DRAIN_ZERO_PREVIEW_GRANTS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S501` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S502 `R12A_DRAIN_ZERO_PREVIEW_GRANTS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S502` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S503 `R12A_DRAIN_ZERO_EXPORT_GRANTS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S503` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S504 `R12A_DRAIN_ZERO_EXPORT_GRANTS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S504` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S505 `R12A_DRAIN_ZERO_SAVE_SESSIONS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S505` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S506 `R12A_DRAIN_ZERO_SAVE_SESSIONS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S506` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S507 `R12A_DRAIN_ZERO_ENCODER_JOBS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S507` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S508 `R12A_DRAIN_ZERO_ENCODER_JOBS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S508` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S509 `R12A_DRAIN_ZERO_WORKER_RPC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S509` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S510 `R12A_DRAIN_ZERO_WORKER_RPC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S510` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S511 `R12A_DRAIN_ZERO_PINNED_SURFACES_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S511` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S512 `R12A_DRAIN_ZERO_PINNED_SURFACES_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S512` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S513 `R12A_DRAIN_ZERO_GPU_TICKETS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S513` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S514 `R12A_DRAIN_ZERO_GPU_TICKETS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S514` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S515 `R12A_DRAIN_ZERO_VISIBLE_WINDOWS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S515` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S516 `R12A_DRAIN_ZERO_VISIBLE_WINDOWS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S516` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S517 `PERMIT_EXPIRY_PRE_DRAIN_ABORT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S517` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S518 `PERMIT_EXPIRY_PRE_DRAIN_ABORT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S518` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S519 `PERMIT_EXPIRY_DURING_DRAIN_EXPLICIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S519` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S520 `PERMIT_EXPIRY_DURING_DRAIN_EXPLICIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S520` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S521 `PERMIT_EXPIRY_POST_ACTIVATION_NO_BLIND_REVERT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S521` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S522 `PERMIT_EXPIRY_POST_ACTIVATION_NO_BLIND_REVERT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S522` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S523 `POST_CAS_RECOVERY_REPLAY_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S523` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S524 `POST_CAS_RECOVERY_REPLAY_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S524` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S525 `LOCAL_COMPLETION_R12A_FINAL_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S525` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S526 `LOCAL_COMPLETION_R12A_FINAL_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S526` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S527 `LOCAL_COMPLETION_R11A_TARGET_SESSION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S527` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S528 `LOCAL_COMPLETION_R11A_TARGET_SESSION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S528` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S529 `LOCAL_COMPLETION_BINDING_CHAIN_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S529` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S530 `LOCAL_COMPLETION_BINDING_CHAIN_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S530` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S531 `LOCAL_COMPLETION_POINTER_MUTATION_FALSE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S531` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S532 `LOCAL_COMPLETION_POINTER_MUTATION_FALSE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S532` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S533 `LOCAL_COMPLETION_AFTER_COMMIT_ONLY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S533` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S534 `LOCAL_COMPLETION_AFTER_COMMIT_ONLY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S534` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S535 `LOCAL_COMPLETION_BEFORE_EVIDENCE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S535` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S536 `LOCAL_COMPLETION_BEFORE_EVIDENCE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S536` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S537 `OLD_R11_TOKEN_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S537` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S538 `OLD_R11_TOKEN_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S538` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S539 `FRESH_R11A_SESSION_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S539` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S540 `FRESH_R11A_SESSION_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S540` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S541 `TARGET_SESSION_GENERATION_MONOTONIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S541` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S542 `TARGET_SESSION_GENERATION_MONOTONIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S542` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S543 `TARGET_PACKAGE_IDENTITY_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S543` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S544 `TARGET_PACKAGE_IDENTITY_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S544` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S545 `TARGET_ACTIVE_GRAPH_IDENTITY_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S545` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S546 `TARGET_ACTIVE_GRAPH_IDENTITY_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S546` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S547 `TARGET_R9A_IDENTITY_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S547` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S548 `TARGET_R9A_IDENTITY_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S548` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S549 `WINDOW_SHOW_AFTER_COMMIT_ONLY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S549` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S550 `WINDOW_SHOW_AFTER_COMMIT_ONLY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S550` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S551 `ACTIVE_GRAPH_LOCAL_AGENT_NODE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S551` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S552 `ACTIVE_GRAPH_LOCAL_AGENT_NODE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S552` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S553 `ACTIVE_GRAPH_R12A_ADAPTER_EDGE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S553` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S554 `ACTIVE_GRAPH_R12A_ADAPTER_EDGE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S554` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S555 `RUNTIME_MANIFEST_LOCAL_AGENT_MODULE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S555` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S556 `RUNTIME_MANIFEST_LOCAL_AGENT_MODULE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S556` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S557 `SOURCE_PARSE_AND_SYNTAX_CLOSURE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S557` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S558 `SOURCE_PARSE_AND_SYNTAX_CLOSURE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S558` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
### 43.7 EVIDENCE_OUTBOX_INGESTION_AND_PRIVACY
#### R13A-S559 `EVIDENCE_MAIN_PROCESS_BUILDER_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S559` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S560 `EVIDENCE_MAIN_PROCESS_BUILDER_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S560` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S561 `EVIDENCE_AFTER_LOCAL_COMPLETION_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S561` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S562 `EVIDENCE_AFTER_LOCAL_COMPLETION_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S562` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S563 `EVIDENCE_SEQUENCE_PERSISTENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S563` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S564 `EVIDENCE_SEQUENCE_PERSISTENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S564` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S565 `EVIDENCE_NONCE_RANDOM_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S565` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S566 `EVIDENCE_NONCE_RANDOM_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S566` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S567 `EVIDENCE_INSTALLATION_SIGNATURE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S567` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S568 `EVIDENCE_INSTALLATION_SIGNATURE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S568` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S569 `EVIDENCE_ROLLOUT_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S569` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S570 `EVIDENCE_ROLLOUT_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S570` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S571 `EVIDENCE_PLAN_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S571` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S572 `EVIDENCE_PLAN_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S572` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S573 `EVIDENCE_RING_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S573` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S574 `EVIDENCE_RING_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S574` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S575 `EVIDENCE_RING_GENERATION_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S575` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S576 `EVIDENCE_RING_GENERATION_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S576` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S577 `EVIDENCE_LEASE_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S577` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S578 `EVIDENCE_LEASE_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S578` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S579 `EVIDENCE_CLAIM_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S579` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S580 `EVIDENCE_CLAIM_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S580` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S581 `EVIDENCE_PERMIT_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S581` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S582 `EVIDENCE_PERMIT_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S582` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S583 `EVIDENCE_BINDING_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S583` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S584 `EVIDENCE_BINDING_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S584` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S585 `EVIDENCE_R12A_FINAL_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S585` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S586 `EVIDENCE_R12A_FINAL_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S586` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S587 `EVIDENCE_SOURCE_TARGET_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S587` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S588 `EVIDENCE_SOURCE_TARGET_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S588` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S589 `EVIDENCE_CRITICAL_COUNTERS_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S589` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S590 `EVIDENCE_CRITICAL_COUNTERS_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S590` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S591 `EVIDENCE_OPERATIONAL_COUNTERS_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S591` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S592 `EVIDENCE_OPERATIONAL_COUNTERS_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S592` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S593 `EVIDENCE_ADAPTER_FAMILY_BUCKET_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S593` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S594 `EVIDENCE_ADAPTER_FAMILY_BUCKET_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S594` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S595 `EVIDENCE_DRIVER_MAJOR_BUCKET_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S595` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S596 `EVIDENCE_DRIVER_MAJOR_BUCKET_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S596` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S597 `EVIDENCE_TIME_BUCKET_COARSE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S597` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S598 `EVIDENCE_TIME_BUCKET_COARSE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S598` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S599 `OUTBOX_ATOMIC_WRITE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S599` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S600 `OUTBOX_ATOMIC_WRITE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S600` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S601 `OUTBOX_APPEND_ONLY_LEDGER_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S601` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S602 `OUTBOX_APPEND_ONLY_LEDGER_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S602` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S603 `OUTBOX_PENDING_STATE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S603` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S604 `OUTBOX_PENDING_STATE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S604` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S605 `OUTBOX_IN_FLIGHT_STATE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S605` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S606 `OUTBOX_IN_FLIGHT_STATE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S606` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S607 `OUTBOX_ACKED_STATE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S607` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S608 `OUTBOX_ACKED_STATE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S608` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S609 `OUTBOX_REJECTED_STATE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S609` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S610 `OUTBOX_REJECTED_STATE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S610` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S611 `OUTBOX_QUARANTINED_STATE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S611` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S612 `OUTBOX_QUARANTINED_STATE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S612` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S613 `OUTBOX_DELETE_ONLY_AFTER_ACK_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S613` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S614 `OUTBOX_DELETE_ONLY_AFTER_ACK_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S614` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S615 `OUTBOX_CRASH_RECOVERY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S615` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S616 `OUTBOX_CRASH_RECOVERY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S616` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S617 `OUTBOX_DUPLICATE_UPLOAD_IDEMPOTENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S617` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S618 `OUTBOX_DUPLICATE_UPLOAD_IDEMPOTENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S618` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S619 `ACK_SIGNATURE_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S619` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S620 `ACK_SIGNATURE_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S620` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S621 `ACK_EVIDENCE_DIGEST_BOUND_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S621` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S622 `ACK_EVIDENCE_DIGEST_BOUND_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S622` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S623 `ACK_INGESTION_SEQUENCE_MONOTONIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S623` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S624 `ACK_INGESTION_SEQUENCE_MONOTONIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S624` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S625 `ACK_DISPOSITION_ENUM_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S625` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S626 `ACK_DISPOSITION_ENUM_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S626` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S627 `ACK_ACCEPTED_INPUT_SET_DIGEST_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S627` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S628 `ACK_ACCEPTED_INPUT_SET_DIGEST_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S628` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S629 `ACK_REPLAY_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S629` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S630 `ACK_REPLAY_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S630` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S631 `INGESTION_INSTALLATION_ADMISSION_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S631` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S632 `INGESTION_INSTALLATION_ADMISSION_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S632` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S633 `INGESTION_LEASE_CHAIN_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S633` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S634 `INGESTION_LEASE_CHAIN_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S634` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S635 `INGESTION_SEQUENCE_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S635` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S636 `INGESTION_SEQUENCE_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S636` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S637 `INGESTION_NONCE_DEDUPED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S637` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S638 `INGESTION_NONCE_DEDUPED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S638` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S639 `INGESTION_LATE_EVIDENCE_SEPARATED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S639` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S640 `INGESTION_LATE_EVIDENCE_SEPARATED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S640` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S641 `INGESTION_UNKNOWN_INSTALLATION_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S641` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S642 `INGESTION_UNKNOWN_INSTALLATION_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S642` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S643 `MISSING_EVIDENCE_NOT_SUCCESS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S643` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S644 `MISSING_EVIDENCE_NOT_SUCCESS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S644` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S645 `FORBIDDEN_IMAGE_BYTES_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S645` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S646 `FORBIDDEN_IMAGE_BYTES_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S646` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S647 `FORBIDDEN_PIXEL_HASH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S647` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S648 `FORBIDDEN_PIXEL_HASH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S648` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S649 `FORBIDDEN_FILE_NAME_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S649` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S650 `FORBIDDEN_FILE_NAME_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S650` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S651 `FORBIDDEN_USER_PATH_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S651` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S652 `FORBIDDEN_USER_PATH_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S652` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S653 `FORBIDDEN_EXIF_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S653` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S654 `FORBIDDEN_EXIF_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S654` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S655 `FORBIDDEN_DOCUMENT_METADATA_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S655` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S656 `FORBIDDEN_DOCUMENT_METADATA_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S656` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S657 `FORBIDDEN_ACCOUNT_EMAIL_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S657` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S658 `FORBIDDEN_ACCOUNT_EMAIL_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S658` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S659 `FORBIDDEN_PRECISE_LOCATION_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S659` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S660 `FORBIDDEN_PRECISE_LOCATION_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S660` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S661 `FORBIDDEN_HARDWARE_SERIAL_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S661` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S662 `FORBIDDEN_HARDWARE_SERIAL_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S662` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S663 `FORBIDDEN_RAW_CRASH_LOG_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S663` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S664 `FORBIDDEN_RAW_CRASH_LOG_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S664` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S665 `FORBIDDEN_INSTALLATION_ENROLLMENT_ID_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S665` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S666 `FORBIDDEN_INSTALLATION_ENROLLMENT_ID_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S666` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S667 `FORBIDDEN_MAIN_SECRET_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S667` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S668 `FORBIDDEN_MAIN_SECRET_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S668` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
### 43.8 CONTAINMENT_RECOVERY_FINALIZATION_AND_WIRING
#### R13A-S669 `EXACT_AGGREGATE_ACCEPTED_SET_DIGEST_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S669` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S670 `EXACT_AGGREGATE_ACCEPTED_SET_DIGEST_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S670` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S671 `EXACT_AGGREGATE_ADMISSION_SET_DIGEST_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S671` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S672 `EXACT_AGGREGATE_ADMISSION_SET_DIGEST_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S672` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S673 `EXACT_AGGREGATE_LEASE_SET_DIGEST_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S673` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S674 `EXACT_AGGREGATE_LEASE_SET_DIGEST_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S674` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S675 `EXACT_AGGREGATE_COMPLETION_SET_DIGEST_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S675` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S676 `EXACT_AGGREGATE_COMPLETION_SET_DIGEST_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S676` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S677 `EXACT_AGGREGATE_MISSING_COUNT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S677` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S678 `EXACT_AGGREGATE_MISSING_COUNT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S678` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S679 `EXACT_AGGREGATE_LATE_COUNT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S679` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S680 `EXACT_AGGREGATE_LATE_COUNT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S680` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S681 `EXACT_AGGREGATE_BREAKER_COUNT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S681` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S682 `EXACT_AGGREGATE_BREAKER_COUNT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S682` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S683 `PRIVACY_MINIMUM_K_FIVE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S683` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S684 `PRIVACY_MINIMUM_K_FIVE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S684` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S685 `PRIVACY_PSEUDONYM_REMOVED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S685` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S686 `PRIVACY_PSEUDONYM_REMOVED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S686` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S687 `PRIVACY_SMALL_CELL_SUPPRESSED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S687` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S688 `PRIVACY_SMALL_CELL_SUPPRESSED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S688` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S689 `PRIVACY_SUPPRESSED_NOT_ZERO_FILLED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S689` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S690 `PRIVACY_SUPPRESSED_NOT_ZERO_FILLED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S690` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S691 `PRIVACY_RAW_ENVELOPE_NOT_PUBLISHED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S691` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S692 `PRIVACY_RAW_ENVELOPE_NOT_PUBLISHED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S692` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S693 `RING_DECISION_CRITICAL_FIRST_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S693` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S694 `RING_DECISION_CRITICAL_FIRST_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S694` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S695 `RING_DECISION_DWELL_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S695` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S696 `RING_DECISION_DWELL_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S696` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S697 `RING_DECISION_VOLUME_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S697` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S698 `RING_DECISION_VOLUME_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S698` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S699 `RING_DECISION_COVERAGE_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S699` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S700 `RING_DECISION_COVERAGE_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S700` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S701 `RING_DECISION_SINGLE_STEP_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S701` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S702 `RING_DECISION_SINGLE_STEP_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S702` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S703 `RING_DECISION_NO_REGRESSION_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S703` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S704 `RING_DECISION_NO_REGRESSION_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S704` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S705 `CONTAINMENT_LEVELS_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S705` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S706 `CONTAINMENT_LEVELS_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S706` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S707 `CONTAINMENT_GENERATION_MONOTONIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S707` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S708 `CONTAINMENT_GENERATION_MONOTONIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S708` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S709 `CONTAINMENT_REVOCATION_GENERATION_MONOTONIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S709` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S710 `CONTAINMENT_REVOCATION_GENERATION_MONOTONIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S710` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S711 `CONTAINMENT_STOPS_NEW_LEASES_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S711` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S712 `CONTAINMENT_STOPS_NEW_LEASES_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S712` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S713 `CONTAINMENT_STOPS_NEW_PERMITS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S713` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S714 `CONTAINMENT_STOPS_NEW_PERMITS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S714` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S715 `CONTAINMENT_REVOKES_UNCLAIMED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S715` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S716 `CONTAINMENT_REVOKES_UNCLAIMED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S716` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S717 `CONTAINMENT_ABORTS_PRE_ACTIVATION_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S717` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S718 `CONTAINMENT_ABORTS_PRE_ACTIVATION_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S718` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S719 `CONTAINMENT_QUARANTINES_COMMITTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S719` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S720 `CONTAINMENT_QUARANTINES_COMMITTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S720` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S721 `CONTAINMENT_REQUIRES_RECOVERY_REPLAY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S721` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S722 `CONTAINMENT_REQUIRES_RECOVERY_REPLAY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S722` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S723 `CONTAINMENT_PHASE_MATRIX_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S723` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S724 `CONTAINMENT_PHASE_MATRIX_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S724` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S725 `RECOVERY_REPLAY_R10A_RECOMMENDATION_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S725` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S726 `RECOVERY_REPLAY_R10A_RECOMMENDATION_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S726` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S727 `RECOVERY_REPLAY_OPERATOR_APPROVAL_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S727` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S728 `RECOVERY_REPLAY_OPERATOR_APPROVAL_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S728` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S729 `RECOVERY_REPLAY_R10A_ROLLBACK_FINAL_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S729` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S730 `RECOVERY_REPLAY_R10A_ROLLBACK_FINAL_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S730` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S731 `RECOVERY_REPLAY_R12A_TRANSITION_BACK_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S731` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S732 `RECOVERY_REPLAY_R12A_TRANSITION_BACK_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S732` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S733 `RECOVERY_REPLAY_FRESH_R11A_SESSION_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S733` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S734 `RECOVERY_REPLAY_FRESH_R11A_SESSION_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S734` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S735 `RECOVERY_REPLAY_EVIDENCE_ACK_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S735` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S736 `RECOVERY_REPLAY_EVIDENCE_ACK_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S736` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S737 `NO_QUALIFIED_TARGET_EXPLICIT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S737` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S738 `NO_QUALIFIED_TARGET_EXPLICIT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S738` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S739 `FLEET_LEDGER_V2_HASH_CHAIN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S739` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S740 `FLEET_LEDGER_V2_HASH_CHAIN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S740` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S741 `FLEET_LEDGER_SIGNATURE_VERIFIED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S741` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S742 `FLEET_LEDGER_SIGNATURE_VERIFIED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S742` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S743 `FLEET_LEDGER_GENERATION_MONOTONIC_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S743` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S744 `FLEET_LEDGER_GENERATION_MONOTONIC_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S744` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S745 `FLEET_LEDGER_REPLAY_FROM_GENESIS_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S745` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S746 `FLEET_LEDGER_REPLAY_FROM_GENESIS_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S746` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S747 `FINALIZER_REVALIDATES_PLAN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S747` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S748 `FINALIZER_REVALIDATES_PLAN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S748` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S749 `FINALIZER_REVALIDATES_LEASES_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S749` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S750 `FINALIZER_REVALIDATES_LEASES_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S750` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S751 `FINALIZER_REVALIDATES_R12A_CHAIN_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S751` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S752 `FINALIZER_REVALIDATES_R12A_CHAIN_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S752` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S753 `FINALIZER_RECOMPUTES_EXACT_AGGREGATE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S753` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S754 `FINALIZER_RECOMPUTES_EXACT_AGGREGATE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S754` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S755 `FINALIZER_RECOMPUTES_PRIVACY_VIEW_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S755` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S756 `FINALIZER_RECOMPUTES_PRIVACY_VIEW_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S756` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S757 `FINALIZER_REPLAYS_RING_SEQUENCE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S757` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S758 `FINALIZER_REPLAYS_RING_SEQUENCE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S758` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S759 `FINALIZER_REPLAYS_CONTAINMENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S759` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S760 `FINALIZER_REPLAYS_CONTAINMENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S760` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S761 `FINALIZER_REPLAYS_RECOVERY_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S761` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S762 `FINALIZER_REPLAYS_RECOVERY_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S762` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S763 `FINALIZER_SUMMARY_INJECTION_REJECTED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S763` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S764 `FINALIZER_SUMMARY_INJECTION_REJECTED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S764` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S765 `FINALIZER_POINTER_MUTATION_ZERO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S765` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S766 `FINALIZER_POINTER_MUTATION_ZERO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S766` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S767 `FINALIZER_EXCLUSION_APPROVAL_REQUIRED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S767` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S768 `FINALIZER_EXCLUSION_APPROVAL_REQUIRED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S768` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S769 `SOURCE_HARNESS_FAILS_WITHOUT_INSTALLED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S769` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S770 `SOURCE_HARNESS_FAILS_WITHOUT_INSTALLED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S770` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S771 `FLEET_HARNESS_REQUIRES_MINIMUM_TWO_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S771` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S772 `FLEET_HARNESS_REQUIRES_MINIMUM_TWO_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S772` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S773 `NEGATIVE_CONTROL_MATRIX_PRESENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S773` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S774 `NEGATIVE_CONTROL_MATRIX_PRESENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S774` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S775 `PREDECESSOR_REGRESSION_ISOLATED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S775` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S776 `PREDECESSOR_REGRESSION_ISOLATED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S776` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S777 `SOURCE_RECEIPT_PATH_INDEPENDENT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S777` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S778 `SOURCE_RECEIPT_PATH_INDEPENDENT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S778` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S779 `SOURCE_ARTIFACTS_REPRODUCIBLE_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S779` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S780 `SOURCE_ARTIFACTS_REPRODUCIBLE_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S780` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S781 `PACKAGE_SCRIPTS_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S781` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S782 `PACKAGE_SCRIPTS_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S782` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S783 `README_STATE_EXACT_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S783` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S784 `README_STATE_EXACT_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S784` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S785 `NEXT_AUTHORITY_DECLARED_DECLARED`

- **요구**: 계약, schema, wiring 또는 source artifact에 해당 요구가 명시되어야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S785` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
#### R13A-S786 `NEXT_AUTHORITY_DECLARED_FAIL_CLOSED`

- **요구**: 해당 요구를 제거하거나 변조한 negative control이 stable error로 실패해야 한다.
- **증거**: source verifier report와 gate catalog의 `R13A-S786` 항목
- **실패**: 누락, 불일치, silent fallback 또는 verifier 미결속 시 FAIL
## 44. Fleet gate catalog
### 44.1 FLEET_PREDECESSOR_AND_PLAN
#### R13A-P001 `FLEET_INPUT_SCHEMA_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P002 `FLEET_INPUT_SCHEMA_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P003 `QUALIFIED_INSTALLATION_COUNT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P004 `QUALIFIED_INSTALLATION_COUNT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P005 `R9A_PHYSICAL_FINAL_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P006 `R9A_PHYSICAL_FINAL_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P007 `R10A_FINAL_RELEASE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P008 `R10A_FINAL_RELEASE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P009 `R10A_LINEAGE_RESTORATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P010 `R10A_LINEAGE_RESTORATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P011 `R11A_INSTALLED_FINAL_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P012 `R11A_INSTALLED_FINAL_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P013 `R12A_INSTALLED_FINAL_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P014 `R12A_INSTALLED_FINAL_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P015 `R12A_CHILD_CHAIN_COMPLETE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P016 `R12A_CHILD_CHAIN_COMPLETE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P017 `R12A_TRANSACTION_ID_COHERENT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P018 `R12A_TRANSACTION_ID_COHERENT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P019 `R12A_POINTER_CAS_EXACT_ONE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P020 `R12A_POINTER_CAS_EXACT_ONE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P021 `R12A_TARGET_SESSION_FRESH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P022 `R12A_TARGET_SESSION_FRESH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P023 `R12A_CROSS_GENERATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P024 `R12A_CROSS_GENERATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P025 `INSTALLATION_ADMISSION_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P026 `INSTALLATION_ADMISSION_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P027 `INSTALLATION_ADMISSION_DEDUP_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P028 `INSTALLATION_ADMISSION_DEDUP_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P029 `INSTALLATION_ADMISSION_INPUT_SET_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P030 `INSTALLATION_ADMISSION_INPUT_SET_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P031 `UNKNOWN_INSTALLATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P032 `UNKNOWN_INSTALLATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P033 `PLAN_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P034 `PLAN_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P035 `PLAN_SELF_HASH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P036 `PLAN_SELF_HASH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P037 `PLAN_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P038 `PLAN_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P039 `PLAN_PREVIOUS_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P040 `PLAN_PREVIOUS_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P041 `PLAN_RAW_HASH_CAS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P042 `PLAN_RAW_HASH_CAS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P043 `PLAN_OPERATOR_APPROVAL_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P044 `PLAN_OPERATOR_APPROVAL_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P045 `PLAN_TARGET_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P046 `PLAN_TARGET_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P047 `PLAN_TARGET_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P048 `PLAN_TARGET_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P049 `PLAN_QUALIFIED_PREVIOUS_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P050 `PLAN_QUALIFIED_PREVIOUS_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P051 `PLAN_QUALIFIED_PREVIOUS_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P052 `PLAN_QUALIFIED_PREVIOUS_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P053 `PLAN_R10A_RELEASE_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P054 `PLAN_R10A_RELEASE_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P055 `PLAN_R9A_PHYSICAL_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P056 `PLAN_R9A_PHYSICAL_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P057 `PLAN_KEY_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P058 `PLAN_KEY_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P059 `PLAN_SPLIT_BRAIN_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P060 `PLAN_SPLIT_BRAIN_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P061 `RING_LAB_POLICY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P062 `RING_LAB_POLICY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P063 `RING_CANARY_POLICY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P064 `RING_CANARY_POLICY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P065 `RING_EARLY_POLICY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P066 `RING_EARLY_POLICY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P067 `RING_BROAD_POLICY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P068 `RING_BROAD_POLICY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P069 `RING_MAJORITY_POLICY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P070 `RING_MAJORITY_POLICY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P071 `RING_FULL_POLICY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P072 `RING_FULL_POLICY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P073 `RING_BASIS_POINTS_MONOTONIC_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P074 `RING_BASIS_POINTS_MONOTONIC_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P075 `RING_MINIMUM_INSTALLATIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P076 `RING_MINIMUM_INSTALLATIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P077 `RING_MINIMUM_SESSIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P078 `RING_MINIMUM_SESSIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P079 `RING_MINIMUM_DWELL_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P080 `RING_MINIMUM_DWELL_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P081 `RING_MINIMUM_COVERAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P082 `RING_MINIMUM_COVERAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P083 `RING_MAXIMUM_CLAIMS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P084 `RING_MAXIMUM_CLAIMS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P085 `RING_MAXIMUM_DRAINS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P086 `RING_MAXIMUM_DRAINS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P087 `RING_DRAIN_DEADLINE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P088 `RING_DRAIN_DEADLINE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P089 `KEY_REGISTRY_PLAN_KEY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P090 `KEY_REGISTRY_PLAN_KEY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P091 `KEY_REGISTRY_LEASE_KEY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P092 `KEY_REGISTRY_LEASE_KEY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P093 `KEY_REGISTRY_PERMIT_KEY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P094 `KEY_REGISTRY_PERMIT_KEY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P095 `KEY_REGISTRY_CONTAINMENT_KEY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P096 `KEY_REGISTRY_CONTAINMENT_KEY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P097 `KEY_REGISTRY_ACK_KEY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P098 `KEY_REGISTRY_ACK_KEY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P099 `KEY_REGISTRY_INSTALLATION_KEY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P100 `KEY_REGISTRY_INSTALLATION_KEY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P101 `REVOKED_KEY_ZERO_ACCEPTANCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P102 `REVOKED_KEY_ZERO_ACCEPTANCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P103 `EXPIRED_KEY_ZERO_ACCEPTANCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P104 `EXPIRED_KEY_ZERO_ACCEPTANCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P105 `FLEET_LEDGER_GENESIS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P106 `FLEET_LEDGER_GENESIS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P107 `FLEET_LEDGER_PLAN_SEALED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P108 `FLEET_LEDGER_PLAN_SEALED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P109 `FLEET_LEDGER_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P110 `FLEET_LEDGER_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P111 `FLEET_LEDGER_SEQUENCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P112 `FLEET_LEDGER_SEQUENCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P113 `FLEET_LEDGER_PREVIOUS_HASH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P114 `FLEET_LEDGER_PREVIOUS_HASH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P115 `FLEET_LEDGER_GENERATIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P116 `FLEET_LEDGER_GENERATIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P117 `FLEET_PREDECESSOR_ADMISSION_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P118 `FLEET_PREDECESSOR_ADMISSION_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P119 `ROLLOUT_PLAN_ADMISSION_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P120 `ROLLOUT_PLAN_ADMISSION_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
### 44.2 ENROLLMENT_COHORT_LEASE_CLAIM_PERMIT
#### R13A-P121 `ENROLLMENT_ID_RANDOM_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P122 `ENROLLMENT_ID_RANDOM_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P123 `ENROLLMENT_NOT_HARDWARE_DERIVED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P124 `ENROLLMENT_NOT_HARDWARE_DERIVED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P125 `ROLLOUT_PSEUDONYM_HMAC_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P126 `ROLLOUT_PSEUDONYM_HMAC_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P127 `ROLLOUT_PSEUDONYM_SCOPE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P128 `ROLLOUT_PSEUDONYM_SCOPE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P129 `COHORT_ASSIGNMENT_DETERMINISTIC_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P130 `COHORT_ASSIGNMENT_DETERMINISTIC_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P131 `COHORT_BUCKET_DOMAIN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P132 `COHORT_BUCKET_DOMAIN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P133 `COHORT_RING_ELIGIBILITY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P134 `COHORT_RING_ELIGIBILITY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P135 `LAB_ALLOWLIST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P136 `LAB_ALLOWLIST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P137 `LEASE_ISSUANCE_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P138 `LEASE_ISSUANCE_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P139 `LEASE_ROLLOUT_ID_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P140 `LEASE_ROLLOUT_ID_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P141 `LEASE_PLAN_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P142 `LEASE_PLAN_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P143 `LEASE_PLAN_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P144 `LEASE_PLAN_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P145 `LEASE_RING_ID_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P146 `LEASE_RING_ID_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P147 `LEASE_RING_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P148 `LEASE_RING_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P149 `LEASE_REVOCATION_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P150 `LEASE_REVOCATION_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P151 `LEASE_INSTALLATION_PSEUDONYM_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P152 `LEASE_INSTALLATION_PSEUDONYM_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P153 `LEASE_COHORT_BUCKET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P154 `LEASE_COHORT_BUCKET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P155 `LEASE_SOURCE_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P156 `LEASE_SOURCE_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P157 `LEASE_SOURCE_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P158 `LEASE_SOURCE_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P159 `LEASE_TARGET_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P160 `LEASE_TARGET_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P161 `LEASE_TARGET_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P162 `LEASE_TARGET_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P163 `LEASE_R10A_RELEASE_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P164 `LEASE_R10A_RELEASE_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P165 `LEASE_R10A_LINEAGE_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P166 `LEASE_R10A_LINEAGE_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P167 `LEASE_R12A_SOURCE_CONTRACT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P168 `LEASE_R12A_SOURCE_CONTRACT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P169 `LEASE_PRODUCTION_POINTER_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P170 `LEASE_PRODUCTION_POINTER_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P171 `LEASE_PRODUCTION_POINTER_RAW_HASH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P172 `LEASE_PRODUCTION_POINTER_RAW_HASH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P173 `LEASE_LOCAL_POINTER_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P174 `LEASE_LOCAL_POINTER_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P175 `LEASE_LOCAL_POINTER_RAW_HASH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P176 `LEASE_LOCAL_POINTER_RAW_HASH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P177 `LEASE_NOT_BEFORE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P178 `LEASE_NOT_BEFORE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P179 `LEASE_EXPIRES_AT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P180 `LEASE_EXPIRES_AT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P181 `LEASE_NONCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P182 `LEASE_NONCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P183 `LEASE_KEY_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P184 `LEASE_KEY_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P185 `LEASE_REVOKED_ZERO_USE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P186 `LEASE_REVOKED_ZERO_USE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P187 `LEASE_EXPIRED_ZERO_USE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P188 `LEASE_EXPIRED_ZERO_USE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P189 `LEASE_REPLAY_ZERO_USE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P190 `LEASE_REPLAY_ZERO_USE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P191 `LEASE_WRONG_RING_ZERO_USE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P192 `LEASE_WRONG_RING_ZERO_USE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P193 `LEASE_WRONG_PACKAGE_ZERO_USE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P194 `LEASE_WRONG_PACKAGE_ZERO_USE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P195 `LEASE_STALE_PRODUCTION_POINTER_ZERO_USE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P196 `LEASE_STALE_PRODUCTION_POINTER_ZERO_USE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P197 `LEASE_STALE_LOCAL_POINTER_ZERO_USE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P198 `LEASE_STALE_LOCAL_POINTER_ZERO_USE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P199 `CLAIM_INSTALLATION_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P200 `CLAIM_INSTALLATION_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P201 `CLAIM_SOURCE_SESSION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P202 `CLAIM_SOURCE_SESSION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P203 `CLAIM_SOURCE_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P204 `CLAIM_SOURCE_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P205 `CLAIM_SOURCE_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P206 `CLAIM_SOURCE_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P207 `CLAIM_PRODUCTION_POINTER_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P208 `CLAIM_PRODUCTION_POINTER_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P209 `CLAIM_LOCAL_POINTER_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P210 `CLAIM_LOCAL_POINTER_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P211 `CLAIM_NONCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P212 `CLAIM_NONCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P213 `CLAIM_TIMESTAMP_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P214 `CLAIM_TIMESTAMP_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P215 `CLAIM_SINGLE_PER_LEASE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P216 `CLAIM_SINGLE_PER_LEASE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P217 `CLAIM_SPLIT_BRAIN_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P218 `CLAIM_SPLIT_BRAIN_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P219 `CLAIM_ACKNOWLEDGED_BY_FLEET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P220 `CLAIM_ACKNOWLEDGED_BY_FLEET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P221 `DRAIN_PERMIT_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P222 `DRAIN_PERMIT_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P223 `DRAIN_PERMIT_LEASE_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P224 `DRAIN_PERMIT_LEASE_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P225 `DRAIN_PERMIT_CLAIM_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P226 `DRAIN_PERMIT_CLAIM_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P227 `DRAIN_PERMIT_RING_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P228 `DRAIN_PERMIT_RING_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P229 `DRAIN_PERMIT_SLOT_ID_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P230 `DRAIN_PERMIT_SLOT_ID_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P231 `DRAIN_PERMIT_SLOT_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P232 `DRAIN_PERMIT_SLOT_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P233 `DRAIN_PERMIT_CONCURRENCY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P234 `DRAIN_PERMIT_CONCURRENCY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P235 `DRAIN_PERMIT_NOT_BEFORE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P236 `DRAIN_PERMIT_NOT_BEFORE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P237 `DRAIN_PERMIT_EXPIRES_AT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P238 `DRAIN_PERMIT_EXPIRES_AT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P239 `DRAIN_PERMIT_REVOCATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P240 `DRAIN_PERMIT_REVOCATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P241 `DRAIN_SLOT_ACTIVE_COUNT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P242 `DRAIN_SLOT_ACTIVE_COUNT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P243 `DRAIN_SLOT_RELEASE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P244 `DRAIN_SLOT_RELEASE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P245 `DRAIN_SLOT_LEAK_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P246 `DRAIN_SLOT_LEAK_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P247 `DRAIN_WITHOUT_PERMIT_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P248 `DRAIN_WITHOUT_PERMIT_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P249 `DRAIN_CONCURRENCY_OVERFLOW_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P250 `DRAIN_CONCURRENCY_OVERFLOW_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P251 `LEASE_ISSUANCE_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P252 `LEASE_ISSUANCE_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P253 `LEASE_CLAIM_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P254 `LEASE_CLAIM_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P255 `DRAIN_PERMIT_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P256 `DRAIN_PERMIT_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P257 `LEASE_REVOCATION_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P258 `LEASE_REVOCATION_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P259 `PERMIT_REVOCATION_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P260 `PERMIT_REVOCATION_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
### 44.3 LOCAL_BINDING_R12A_UPDATE_AND_REATTESTATION
#### R13A-P261 `LOCAL_AGENT_MAIN_PROCESS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P262 `LOCAL_AGENT_MAIN_PROCESS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P263 `LOCAL_AGENT_PLAN_CACHE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P264 `LOCAL_AGENT_PLAN_CACHE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P265 `LOCAL_AGENT_LEASE_INBOX_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P266 `LOCAL_AGENT_LEASE_INBOX_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P267 `LOCAL_AGENT_SINGLE_ACTIVE_LEASE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P268 `LOCAL_AGENT_SINGLE_ACTIVE_LEASE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P269 `LOCAL_AGENT_STATE_MONOTONIC_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P270 `LOCAL_AGENT_STATE_MONOTONIC_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P271 `FLEET_BINDING_SCHEMA_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P272 `FLEET_BINDING_SCHEMA_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P273 `FLEET_BINDING_ROLLOUT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P274 `FLEET_BINDING_ROLLOUT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P275 `FLEET_BINDING_PLAN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P276 `FLEET_BINDING_PLAN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P277 `FLEET_BINDING_RING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P278 `FLEET_BINDING_RING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P279 `FLEET_BINDING_INSTALLATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P280 `FLEET_BINDING_INSTALLATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P281 `FLEET_BINDING_LEASE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P282 `FLEET_BINDING_LEASE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P283 `FLEET_BINDING_CLAIM_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P284 `FLEET_BINDING_CLAIM_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P285 `FLEET_BINDING_PERMIT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P286 `FLEET_BINDING_PERMIT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P287 `FLEET_BINDING_UPDATE_TRANSACTION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P288 `FLEET_BINDING_UPDATE_TRANSACTION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P289 `FLEET_BINDING_SOURCE_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P290 `FLEET_BINDING_SOURCE_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P291 `FLEET_BINDING_SOURCE_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P292 `FLEET_BINDING_SOURCE_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P293 `FLEET_BINDING_TARGET_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P294 `FLEET_BINDING_TARGET_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P295 `FLEET_BINDING_TARGET_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P296 `FLEET_BINDING_TARGET_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P297 `FLEET_BINDING_PRODUCTION_POINTER_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P298 `FLEET_BINDING_PRODUCTION_POINTER_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P299 `FLEET_BINDING_LOCAL_POINTER_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P300 `FLEET_BINDING_LOCAL_POINTER_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P301 `FLEET_BINDING_SELF_HASH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P302 `FLEET_BINDING_SELF_HASH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P303 `FLEET_BINDING_FSYNC_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P304 `FLEET_BINDING_FSYNC_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P305 `FLEET_BINDING_JOURNAL_INTENT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P306 `FLEET_BINDING_JOURNAL_INTENT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P307 `FLEET_BINDING_JOURNAL_EFFECT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P308 `FLEET_BINDING_JOURNAL_EFFECT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P309 `FLEET_BINDING_BEFORE_STAGING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P310 `FLEET_BINDING_BEFORE_STAGING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P311 `R12A_FLEET_CAPABILITY_MAIN_ONLY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P312 `R12A_FLEET_CAPABILITY_MAIN_ONLY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P313 `R12A_TRANSACTION_CREATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P314 `R12A_TRANSACTION_CREATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P315 `R12A_TARGET_ADMITTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P316 `R12A_TARGET_ADMITTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P317 `R12A_SOURCE_SESSION_ADMITTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P318 `R12A_SOURCE_SESSION_ADMITTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P319 `R12A_PAYLOAD_MATERIALIZED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P320 `R12A_PAYLOAD_MATERIALIZED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P321 `R12A_CLOSURE_VERIFIED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P322 `R12A_CLOSURE_VERIFIED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P323 `R12A_STAGED_CANARY_PASSED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P324 `R12A_STAGED_CANARY_PASSED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P325 `R12A_DRAIN_INTENT_WRITTEN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P326 `R12A_DRAIN_INTENT_WRITTEN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P327 `R12A_SESSION_DRAINING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P328 `R12A_SESSION_DRAINING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P329 `R12A_SESSION_DRAINED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P330 `R12A_SESSION_DRAINED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P331 `R12A_ACTIVATION_INTENT_WRITTEN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P332 `R12A_ACTIVATION_INTENT_WRITTEN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P333 `R12A_PACKAGE_COMMITTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P334 `R12A_PACKAGE_COMMITTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P335 `R12A_POINTER_CAS_COMMITTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P336 `R12A_POINTER_CAS_COMMITTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P337 `R12A_RELAUNCH_REQUESTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P338 `R12A_RELAUNCH_REQUESTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P339 `R12A_TARGET_PROCESS_STARTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P340 `R12A_TARGET_PROCESS_STARTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P341 `R12A_R11A_REATTESTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P342 `R12A_R11A_REATTESTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P343 `R12A_COMMITTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P344 `R12A_COMMITTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P345 `R12A_ZERO_ACTIVE_SESSIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P346 `R12A_ZERO_ACTIVE_SESSIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P347 `R12A_ZERO_PREVIEW_GRANTS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P348 `R12A_ZERO_PREVIEW_GRANTS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P349 `R12A_ZERO_EXPORT_GRANTS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P350 `R12A_ZERO_EXPORT_GRANTS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P351 `R12A_ZERO_SAVE_SESSIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P352 `R12A_ZERO_SAVE_SESSIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P353 `R12A_ZERO_ENCODER_JOBS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P354 `R12A_ZERO_ENCODER_JOBS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P355 `R12A_ZERO_WORKER_RPC_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P356 `R12A_ZERO_WORKER_RPC_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P357 `R12A_ZERO_PINNED_SURFACES_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P358 `R12A_ZERO_PINNED_SURFACES_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P359 `R12A_ZERO_GPU_TICKETS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P360 `R12A_ZERO_GPU_TICKETS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P361 `R12A_ZERO_VISIBLE_WINDOWS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P362 `R12A_ZERO_VISIBLE_WINDOWS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P363 `R12A_LOCAL_POINTER_CAS_COUNT_ONE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P364 `R12A_LOCAL_POINTER_CAS_COUNT_ONE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P365 `R12A_PRODUCTION_POINTER_MUTATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P366 `R12A_PRODUCTION_POINTER_MUTATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P367 `R12A_STABLE_LAUNCHER_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P368 `R12A_STABLE_LAUNCHER_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P369 `R12A_TARGET_IDENTITY_EXACT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P370 `R12A_TARGET_IDENTITY_EXACT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P371 `R12A_TARGET_CLOSURE_VALID_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P372 `R12A_TARGET_CLOSURE_VALID_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P373 `R12A_ACTIVE_GRAPH_CURRENT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P374 `R12A_ACTIVE_GRAPH_CURRENT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P375 `R12A_R9A_IDENTITY_CURRENT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P376 `R12A_R9A_IDENTITY_CURRENT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P377 `R11A_TARGET_SESSION_HMAC_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P378 `R11A_TARGET_SESSION_HMAC_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P379 `R11A_TARGET_SESSION_FRESH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P380 `R11A_TARGET_SESSION_FRESH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P381 `R11A_TARGET_SESSION_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P382 `R11A_TARGET_SESSION_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P383 `R11A_TARGET_SESSION_SENDER_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P384 `R11A_TARGET_SESSION_SENDER_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P385 `R11A_TARGET_NOT_QUARANTINED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P386 `R11A_TARGET_NOT_QUARANTINED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P387 `LOCAL_COMPLETION_LEASE_CHAIN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P388 `LOCAL_COMPLETION_LEASE_CHAIN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P389 `LOCAL_COMPLETION_R12A_FINAL_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P390 `LOCAL_COMPLETION_R12A_FINAL_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P391 `LOCAL_COMPLETION_R11A_SESSION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P392 `LOCAL_COMPLETION_R11A_SESSION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P393 `LOCAL_COMPLETION_SOURCE_TARGET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P394 `LOCAL_COMPLETION_SOURCE_TARGET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P395 `LOCAL_COMPLETION_POINTER_MUTATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P396 `LOCAL_COMPLETION_POINTER_MUTATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P397 `LOCAL_COMPLETION_PASS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P398 `LOCAL_COMPLETION_PASS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P399 `LOCAL_TRANSITION_BINDING_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P400 `LOCAL_TRANSITION_BINDING_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P401 `R12A_INSTALLED_REPLAY_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P402 `R12A_INSTALLED_REPLAY_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P403 `LOCAL_COMPLETION_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P404 `LOCAL_COMPLETION_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
### 44.4 POST_UPDATE_EVIDENCE_INGESTION_AND_AGGREGATION
#### R13A-P405 `EVIDENCE_AFTER_LOCAL_COMPLETION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P406 `EVIDENCE_AFTER_LOCAL_COMPLETION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P407 `EVIDENCE_SEQUENCE_MONOTONIC_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P408 `EVIDENCE_SEQUENCE_MONOTONIC_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P409 `EVIDENCE_NONCE_UNIQUE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P410 `EVIDENCE_NONCE_UNIQUE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P411 `EVIDENCE_INSTALLATION_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P412 `EVIDENCE_INSTALLATION_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P413 `EVIDENCE_KEY_CURRENT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P414 `EVIDENCE_KEY_CURRENT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P415 `EVIDENCE_ROLLOUT_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P416 `EVIDENCE_ROLLOUT_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P417 `EVIDENCE_PLAN_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P418 `EVIDENCE_PLAN_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P419 `EVIDENCE_RING_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P420 `EVIDENCE_RING_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P421 `EVIDENCE_RING_GENERATION_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P422 `EVIDENCE_RING_GENERATION_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P423 `EVIDENCE_INSTALLATION_PSEUDONYM_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P424 `EVIDENCE_INSTALLATION_PSEUDONYM_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P425 `EVIDENCE_SOURCE_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P426 `EVIDENCE_SOURCE_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P427 `EVIDENCE_SOURCE_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P428 `EVIDENCE_SOURCE_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P429 `EVIDENCE_TARGET_BUILD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P430 `EVIDENCE_TARGET_BUILD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P431 `EVIDENCE_TARGET_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P432 `EVIDENCE_TARGET_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P433 `EVIDENCE_LEASE_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P434 `EVIDENCE_LEASE_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P435 `EVIDENCE_CLAIM_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P436 `EVIDENCE_CLAIM_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P437 `EVIDENCE_PERMIT_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P438 `EVIDENCE_PERMIT_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P439 `EVIDENCE_BINDING_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P440 `EVIDENCE_BINDING_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P441 `EVIDENCE_LOCAL_COMPLETION_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P442 `EVIDENCE_LOCAL_COMPLETION_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P443 `EVIDENCE_R12A_FINAL_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P444 `EVIDENCE_R12A_FINAL_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P445 `EVIDENCE_CRITICAL_COUNTERS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P446 `EVIDENCE_CRITICAL_COUNTERS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P447 `EVIDENCE_OPERATIONAL_COUNTERS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P448 `EVIDENCE_OPERATIONAL_COUNTERS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P449 `EVIDENCE_ADMITTED_SESSIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P450 `EVIDENCE_ADMITTED_SESSIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P451 `EVIDENCE_ADAPTER_FAMILY_BUCKET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P452 `EVIDENCE_ADAPTER_FAMILY_BUCKET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P453 `EVIDENCE_DRIVER_MAJOR_BUCKET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P454 `EVIDENCE_DRIVER_MAJOR_BUCKET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P455 `EVIDENCE_EXPOSURE_BUCKET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P456 `EVIDENCE_EXPOSURE_BUCKET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P457 `EVIDENCE_COARSE_WINDOW_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P458 `EVIDENCE_COARSE_WINDOW_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P459 `OUTBOX_ATOMIC_PAYLOAD_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P460 `OUTBOX_ATOMIC_PAYLOAD_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P461 `OUTBOX_LEDGER_HASH_CHAIN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P462 `OUTBOX_LEDGER_HASH_CHAIN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P463 `OUTBOX_PENDING_TO_IN_FLIGHT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P464 `OUTBOX_PENDING_TO_IN_FLIGHT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P465 `OUTBOX_IN_FLIGHT_TO_ACKED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P466 `OUTBOX_IN_FLIGHT_TO_ACKED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P467 `OUTBOX_REJECTED_PRESERVED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P468 `OUTBOX_REJECTED_PRESERVED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P469 `OUTBOX_QUARANTINED_PRESERVED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P470 `OUTBOX_QUARANTINED_PRESERVED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P471 `OUTBOX_CRASH_RECOVERY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P472 `OUTBOX_CRASH_RECOVERY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P473 `OUTBOX_NO_ACK_NO_DELETE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P474 `OUTBOX_NO_ACK_NO_DELETE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P475 `OUTBOX_DUPLICATE_UPLOAD_IDEMPOTENT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P476 `OUTBOX_DUPLICATE_UPLOAD_IDEMPOTENT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P477 `INGESTION_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P478 `INGESTION_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P479 `INGESTION_SELF_HASH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P480 `INGESTION_SELF_HASH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P481 `INGESTION_INSTALLATION_ADMISSION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P482 `INGESTION_INSTALLATION_ADMISSION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P483 `INGESTION_LEASE_CHAIN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P484 `INGESTION_LEASE_CHAIN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P485 `INGESTION_SEQUENCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P486 `INGESTION_SEQUENCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P487 `INGESTION_NONCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P488 `INGESTION_NONCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P489 `INGESTION_TIME_WINDOW_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P490 `INGESTION_TIME_WINDOW_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P491 `INGESTION_TARGET_PACKAGE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P492 `INGESTION_TARGET_PACKAGE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P493 `INGESTION_UNKNOWN_INSTALLATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P494 `INGESTION_UNKNOWN_INSTALLATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P495 `INGESTION_LATE_EVIDENCE_SEPARATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P496 `INGESTION_LATE_EVIDENCE_SEPARATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P497 `ACK_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P498 `ACK_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P499 `ACK_EVIDENCE_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P500 `ACK_EVIDENCE_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P501 `ACK_INSTALLATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P502 `ACK_INSTALLATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P503 `ACK_INGESTION_SEQUENCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P504 `ACK_INGESTION_SEQUENCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P505 `ACK_DISPOSITION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P506 `ACK_DISPOSITION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P507 `ACK_INPUT_SET_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P508 `ACK_INPUT_SET_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P509 `ACK_REPLAY_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P510 `ACK_REPLAY_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P511 `ACK_ACCEPTED_OR_DUPLICATE_DELETE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P512 `ACK_ACCEPTED_OR_DUPLICATE_DELETE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P513 `ACK_REJECTED_NO_DELETE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P514 `ACK_REJECTED_NO_DELETE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P515 `ACCEPTED_EVIDENCE_SET_FROZEN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P516 `ACCEPTED_EVIDENCE_SET_FROZEN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P517 `ACCEPTED_EVIDENCE_SET_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P518 `ACCEPTED_EVIDENCE_SET_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P519 `ADMISSION_SET_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P520 `ADMISSION_SET_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P521 `LEASE_SET_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P522 `LEASE_SET_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P523 `COMPLETION_SET_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P524 `COMPLETION_SET_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P525 `EXACT_ADMITTED_INSTALLATIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P526 `EXACT_ADMITTED_INSTALLATIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P527 `EXACT_VALID_INSTALLATIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P528 `EXACT_VALID_INSTALLATIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P529 `EXACT_MISSING_INSTALLATIONS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P530 `EXACT_MISSING_INSTALLATIONS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P531 `EXACT_LATE_COUNT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P532 `EXACT_LATE_COUNT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P533 `EXACT_SESSION_COUNT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P534 `EXACT_SESSION_COUNT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P535 `EXACT_CRITICAL_BREAKER_COUNT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P536 `EXACT_CRITICAL_BREAKER_COUNT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P537 `EXACT_OPERATIONAL_TOTALS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P538 `EXACT_OPERATIONAL_TOTALS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P539 `EXACT_AGGREGATE_RECOMPUTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P540 `EXACT_AGGREGATE_RECOMPUTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P541 `POST_UPDATE_EVIDENCE_WINDOW_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P542 `POST_UPDATE_EVIDENCE_WINDOW_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P543 `EVIDENCE_ACK_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P544 `EVIDENCE_ACK_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P545 `EXACT_AGGREGATE_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P546 `EXACT_AGGREGATE_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P547 `MISSING_EVIDENCE_ZERO_SUCCESS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P548 `MISSING_EVIDENCE_ZERO_SUCCESS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P549 `LATE_EVIDENCE_NO_BACKDATE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P550 `LATE_EVIDENCE_NO_BACKDATE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P551 `DUPLICATE_EVIDENCE_NO_DOUBLE_COUNT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P552 `DUPLICATE_EVIDENCE_NO_DOUBLE_COUNT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P553 `UNKNOWN_EVIDENCE_NO_COUNT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P554 `UNKNOWN_EVIDENCE_NO_COUNT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P555 `INPUT_SET_MUTATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P556 `INPUT_SET_MUTATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
### 44.5 RING_DECISION_CONTAINMENT_RECOVERY_AND_FINAL
#### R13A-P557 `PRIVACY_MINIMUM_K_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P558 `PRIVACY_MINIMUM_K_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P559 `PRIVACY_PSEUDONYM_REMOVED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P560 `PRIVACY_PSEUDONYM_REMOVED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P561 `PRIVACY_ADAPTER_BUCKET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P562 `PRIVACY_ADAPTER_BUCKET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P563 `PRIVACY_DRIVER_MAJOR_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P564 `PRIVACY_DRIVER_MAJOR_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P565 `PRIVACY_DAY_BUCKET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P566 `PRIVACY_DAY_BUCKET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P567 `PRIVACY_SMALL_CELL_SUPPRESSION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P568 `PRIVACY_SMALL_CELL_SUPPRESSION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P569 `PRIVACY_SUPPRESSED_NOT_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P570 `PRIVACY_SUPPRESSED_NOT_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P571 `PRIVACY_RAW_ENVELOPE_FALSE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P572 `PRIVACY_RAW_ENVELOPE_FALSE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P573 `PRIVACY_FORBIDDEN_FIELD_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P574 `PRIVACY_FORBIDDEN_FIELD_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P575 `PRIVACY_REPORT_RECOMPUTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P576 `PRIVACY_REPORT_RECOMPUTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P577 `RING_DWELL_SATISFIED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P578 `RING_DWELL_SATISFIED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P579 `RING_MIN_INSTALLATIONS_SATISFIED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P580 `RING_MIN_INSTALLATIONS_SATISFIED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P581 `RING_MIN_SESSIONS_SATISFIED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P582 `RING_MIN_SESSIONS_SATISFIED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P583 `RING_COVERAGE_SATISFIED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P584 `RING_COVERAGE_SATISFIED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P585 `RING_CRITICAL_BREAKER_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P586 `RING_CRITICAL_BREAKER_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P587 `RING_OPERATIONAL_THRESHOLD_PASS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P588 `RING_OPERATIONAL_THRESHOLD_PASS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P589 `RING_DRAIN_PERMIT_LEAK_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P590 `RING_DRAIN_PERMIT_LEAK_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P591 `RING_UNKNOWN_INSTALLATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P592 `RING_UNKNOWN_INSTALLATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P593 `RING_PRIVACY_AUDIT_PASS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P594 `RING_PRIVACY_AUDIT_PASS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P595 `RING_SINGLE_STEP_ADVANCE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P596 `RING_SINGLE_STEP_ADVANCE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P597 `RING_NO_REGRESSION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P598 `RING_NO_REGRESSION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P599 `RING_DECISION_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P600 `RING_DECISION_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P601 `RING_DECISION_INPUT_SET_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P602 `RING_DECISION_INPUT_SET_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P603 `RING_HOLD_BEHAVIOR_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P604 `RING_HOLD_BEHAVIOR_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P605 `RING_PAUSE_BEHAVIOR_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P606 `RING_PAUSE_BEHAVIOR_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P607 `RING_CONTAIN_BEHAVIOR_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P608 `RING_CONTAIN_BEHAVIOR_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P609 `RING_RECOVERY_REPLAY_BEHAVIOR_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P610 `RING_RECOVERY_REPLAY_BEHAVIOR_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P611 `RING_DECISION_BATCH_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P612 `RING_DECISION_BATCH_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P613 `CONTAINMENT_DIRECTIVE_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P614 `CONTAINMENT_DIRECTIVE_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P615 `CONTAINMENT_PLAN_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P616 `CONTAINMENT_PLAN_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P617 `CONTAINMENT_RING_BINDING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P618 `CONTAINMENT_RING_BINDING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P619 `CONTAINMENT_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P620 `CONTAINMENT_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P621 `CONTAINMENT_REVOCATION_GENERATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P622 `CONTAINMENT_REVOCATION_GENERATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P623 `CONTAINMENT_REASON_SET_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P624 `CONTAINMENT_REASON_SET_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P625 `CONTAINMENT_EXPIRY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P626 `CONTAINMENT_EXPIRY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P627 `CONTAINMENT_STOPS_LEASES_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P628 `CONTAINMENT_STOPS_LEASES_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P629 `CONTAINMENT_STOPS_PERMITS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P630 `CONTAINMENT_STOPS_PERMITS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P631 `CONTAINMENT_REVOKES_UNCLAIMED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P632 `CONTAINMENT_REVOKES_UNCLAIMED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P633 `CONTAINMENT_ABORTS_PRE_ACTIVATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P634 `CONTAINMENT_ABORTS_PRE_ACTIVATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P635 `CONTAINMENT_QUARANTINES_COMMITTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P636 `CONTAINMENT_QUARANTINES_COMMITTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P637 `CONTAINMENT_REQUIRES_RECOVERY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P638 `CONTAINMENT_REQUIRES_RECOVERY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P639 `CONTAINMENT_PHASE_CREATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P640 `CONTAINMENT_PHASE_CREATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P641 `CONTAINMENT_PHASE_STAGED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P642 `CONTAINMENT_PHASE_STAGED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P643 `CONTAINMENT_PHASE_DRAINING_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P644 `CONTAINMENT_PHASE_DRAINING_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P645 `CONTAINMENT_PHASE_DRAINED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P646 `CONTAINMENT_PHASE_DRAINED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P647 `CONTAINMENT_PHASE_PACKAGE_COMMITTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P648 `CONTAINMENT_PHASE_PACKAGE_COMMITTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P649 `CONTAINMENT_PHASE_POINTER_CAS_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P650 `CONTAINMENT_PHASE_POINTER_CAS_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P651 `CONTAINMENT_PHASE_RELAUNCH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P652 `CONTAINMENT_PHASE_RELAUNCH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P653 `CONTAINMENT_PHASE_TARGET_STARTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P654 `CONTAINMENT_PHASE_TARGET_STARTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P655 `CONTAINMENT_PHASE_REATTESTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P656 `CONTAINMENT_PHASE_REATTESTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P657 `CONTAINMENT_PHASE_COMMITTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P658 `CONTAINMENT_PHASE_COMMITTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P659 `RECOVERY_AFFECTED_SET_DIGEST_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P660 `RECOVERY_AFFECTED_SET_DIGEST_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P661 `RECOVERY_R12A_PHASE_DECISION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P662 `RECOVERY_R12A_PHASE_DECISION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P663 `RECOVERY_R11A_QUARANTINE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P664 `RECOVERY_R11A_QUARANTINE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P665 `RECOVERY_R10A_RECOMMENDATION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P666 `RECOVERY_R10A_RECOMMENDATION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P667 `RECOVERY_OPERATOR_APPROVAL_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P668 `RECOVERY_OPERATOR_APPROVAL_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P669 `RECOVERY_R10A_ROLLBACK_FINAL_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P670 `RECOVERY_R10A_ROLLBACK_FINAL_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P671 `RECOVERY_R12A_TRANSITION_BACK_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P672 `RECOVERY_R12A_TRANSITION_BACK_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P673 `RECOVERY_FRESH_R11A_SESSION_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P674 `RECOVERY_FRESH_R11A_SESSION_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P675 `RECOVERY_EVIDENCE_ENVELOPE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P676 `RECOVERY_EVIDENCE_ENVELOPE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P677 `RECOVERY_EVIDENCE_ACK_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P678 `RECOVERY_EVIDENCE_ACK_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P679 `RECOVERY_NO_QUALIFIED_TARGET_EXPLICIT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P680 `RECOVERY_NO_QUALIFIED_TARGET_EXPLICIT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P681 `RECOVERY_REMOTE_POINTER_WRITE_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P682 `RECOVERY_REMOTE_POINTER_WRITE_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P683 `RECOVERY_LOCAL_POINTER_WRITE_BY_R13A_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P684 `RECOVERY_LOCAL_POINTER_WRITE_BY_R13A_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P685 `CONTAINMENT_DIRECTIVE_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P686 `CONTAINMENT_DIRECTIVE_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P687 `RECOVERY_REPLAY_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P688 `RECOVERY_REPLAY_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P689 `FLEET_NEGATIVE_CONTROL_RECEIPT_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P690 `FLEET_NEGATIVE_CONTROL_RECEIPT_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P691 `FINALIZER_PLAN_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P692 `FINALIZER_PLAN_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P693 `FINALIZER_KEYS_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P694 `FINALIZER_KEYS_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P695 `FINALIZER_INSTALLATIONS_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P696 `FINALIZER_INSTALLATIONS_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P697 `FINALIZER_LEASES_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P698 `FINALIZER_LEASES_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P699 `FINALIZER_PERMITS_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P700 `FINALIZER_PERMITS_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P701 `FINALIZER_BINDINGS_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P702 `FINALIZER_BINDINGS_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P703 `FINALIZER_R12A_CHAINS_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P704 `FINALIZER_R12A_CHAINS_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P705 `FINALIZER_EVIDENCE_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P706 `FINALIZER_EVIDENCE_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P707 `FINALIZER_ACKS_REVALIDATED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P708 `FINALIZER_ACKS_REVALIDATED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P709 `FINALIZER_EXACT_AGGREGATE_RECOMPUTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P710 `FINALIZER_EXACT_AGGREGATE_RECOMPUTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P711 `FINALIZER_PRIVACY_RECOMPUTED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P712 `FINALIZER_PRIVACY_RECOMPUTED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P713 `FINALIZER_RING_SEQUENCE_REPLAYED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P714 `FINALIZER_RING_SEQUENCE_REPLAYED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P715 `FINALIZER_LEDGER_REPLAYED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P716 `FINALIZER_LEDGER_REPLAYED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P717 `FINALIZER_CONTAINMENT_REPLAYED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P718 `FINALIZER_CONTAINMENT_REPLAYED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P719 `FINALIZER_RECOVERY_REPLAYED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P720 `FINALIZER_RECOVERY_REPLAYED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P721 `FINALIZER_EXCLUSIONS_APPROVED_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P722 `FINALIZER_EXCLUSIONS_APPROVED_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P723 `FINALIZER_POINTER_MUTATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P724 `FINALIZER_POINTER_MUTATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P725 `FINALIZER_INPUT_SET_FROZEN_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P726 `FINALIZER_INPUT_SET_FROZEN_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P727 `FINAL_TERMINAL_OUTCOME_VALID_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P728 `FINAL_TERMINAL_OUTCOME_VALID_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P729 `FINAL_UNKNOWN_INSTALLATION_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P730 `FINAL_UNKNOWN_INSTALLATION_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P731 `FINAL_UNACKNOWLEDGED_LOSS_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P732 `FINAL_UNACKNOWLEDGED_LOSS_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P733 `FINAL_CRITICAL_BREAKER_ZERO_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P734 `FINAL_CRITICAL_BREAKER_ZERO_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P735 `FINAL_COUNTS_786_744_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P736 `FINAL_COUNTS_786_744_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P737 `FINAL_FLEET_RECEIPT_SELF_HASH_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P738 `FINAL_FLEET_RECEIPT_SELF_HASH_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P739 `FINAL_FLEET_RECEIPT_SIGNATURE_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P740 `FINAL_FLEET_RECEIPT_SIGNATURE_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P741 `FINAL_LINEAGE_HEAD_R13A_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P742 `FINAL_LINEAGE_HEAD_R13A_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P743 `R14A_NEXT_AUTHORITY_READY_EVIDENCE_PRESENT`

- **요구**: packaged multi-installation fleet 실행에서 해당 evidence가 존재하고 signature 또는 self-hash 검증을 통과해야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
#### R13A-P744 `R14A_NEXT_AUTHORITY_READY_REPLAY_VERIFIED`

- **요구**: final writer가 원본 입력으로 해당 결과를 재계산하거나 state transition을 재생해 동일 결과를 얻어야 한다.
- **증거**: fleet artifact, immutable input-set digest, final replay report
- **실패**: evidence 누락, signature 불일치, replay 결과 불일치, pointer 권위 침범 시 FAIL
## 45. 검증 명령 계약

Source:

```bash
npm run verify:resample-runtime-01-r13a
```

현재 예상 결과:

```text
TDT-RESAMPLE-RUNTIME-01-R13A 786 SOURCE PASS / 744 FLEET PENDING / 0 FAIL
```

Fleet:

```bash
npm run run:resample-runtime-01-r13a:fleet
npm run verify:resample-runtime-01-r13a:fleet
npm run finalize:resample-runtime-01-r13a:fleet
```

R12A installed final evidence가 없을 때 fleet verifier는 반드시 non-zero exit와 다음 오류 중 첫 미충족 조건을 반환한다.

```text
E_R13A_R10A_RELEASE_MISSING
E_R13A_R11A_INSTALLED_RECEIPT_MISSING
E_R13A_R12A_INSTALLED_RECEIPT_MISSING
```

## 46. 구현 완료 판정

### Source 완료

- R13A module과 schema가 Active Graph와 runtime manifest에 입장
- R12A fleet binding sidecar와 journal phase 구현
- local agent와 evidence outbox 구현
- finalizer가 child receipt를 재검증하도록 구현
- 40개 이상 negative control 통과
- 부모 R12A receipt와 pointer 바이트 불변
- 786 source gate PASS

### Fleet 완료

- 최소 2개 qualified installation
- R9A physical, R10A release, R11A installed, R12A installed current
- six-ring plan 또는 명시적 terminal contained-recovered outcome
- 모든 lease·claim·permit·binding·completion chain 검증
- 모든 evidence signed acknowledgement 완료
- exact aggregate와 privacy report 재계산 일치
- containment와 recovery replay 완결
- 744 fleet gate PASS

## 47. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R14A

Signed Release Distribution /
Package Manifest Transparency Log /
Key Rotation and Revocation /
Mirror·CDN Byte Identity /
Supply-Chain Rollback Resistance Seal
```
