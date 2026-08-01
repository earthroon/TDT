# TDT-RESAMPLE-RUNTIME-01-R13

## Multi-Installation Cohort Rollout / Canary Ring Admission / Fleet Evidence Aggregation / Bad-Release Containment / Privacy-Preserving Rollout Receipt Seal

- **Patch ID:** `TDT-RESAMPLE-RUNTIME-01-R13`
- **Source parent:** `TDT-RESAMPLE-RUNTIME-01-R12`
- **Parent repository bundle:** `61_TDT_RESAMPLE_RUNTIME_01_R12_ATOMIC_UPDATE_HANDOFF_SOURCE_BAKED_AWAITING_R10_R11.zip`
- **Parent repository bundle SHA-256:** `01d0ea6eba2039a1197469324880b2aa08e570605f9befc1bfa80133ce2f0695`
- **Parent R12 specification SHA-256:** `3aa4a313ad4dc4c7ec9194fd52fd6cf4f14a0483ec12d74e001ca55594c1f917`
- **Parent R12 source final receipt SHA-256:** `4bf9ae0efbd18ba97f996c3ba81032a7707cd9e4cc96076d71400a26eab5889c`
- **Current source predecessor state:** `RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_HARNESS_SOURCE_BAKED_AWAITING_QUALIFIED_RELEASE_AND_R11_ACTIVE_INSTALLATION`
- **Required fleet predecessor state:** `RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_INSTALLATION_AND_ATTESTATION_HANDOFF_SEALED`
- **Required release predecessor state:** `RESAMPLE_RUNTIME_R10_PRODUCTION_RELEASE_SEALED`
- **Required runtime predecessor state:** `RESAMPLE_RUNTIME_R11_INSTALLED_RUNTIME_ATTESTATION_AND_QUARANTINE_SEALED`
- **R13 source-harness state:** `RESAMPLE_RUNTIME_R13_COHORT_ROLLOUT_HARNESS_SOURCE_BAKED_AWAITING_QUALIFIED_MULTI_INSTALLATION_FLEET`
- **R13 plan-ready state:** `RESAMPLE_RUNTIME_R13_ROLLOUT_PLAN_SEALED_AWAITING_RING_ADMISSION`
- **R13 active state:** `RESAMPLE_RUNTIME_R13_CANARY_RING_ROLLOUT_ACTIVE`
- **R13 paused state:** `RESAMPLE_RUNTIME_R13_ROLLOUT_PAUSED_AWAITING_DECISION`
- **R13 containment state:** `RESAMPLE_RUNTIME_R13_BAD_RELEASE_CONTAINED_ROLLBACK_RECOMMENDED`
- **R13 final state:** `RESAMPLE_RUNTIME_R13_MULTI_INSTALLATION_COHORT_ROLLOUT_AND_PRIVACY_RECEIPT_SEALED`
- **Rejected state:** `RESAMPLE_RUNTIME_R13_FLEET_ROLLOUT_REJECTED`
- **Per-installation production selection authority:** local R10 `dadum.export.production-pointer`
- **Per-installation package activation authority:** local R12 `dadum.install.activation-pointer`
- **Per-installation runtime admission authority:** local R11 token and quarantine state
- **Fleet rollout authority:** R13 signed plan, cohort assignment, admission lease, and containment directive
- **R13 pointer mutation:** forbidden
- **Canonical rollout profile:** `tdt.resample-runtime.cohort-rollout.r13.v1`
- **Canonical privacy profile:** `tdt.resample-runtime.rollout-privacy.r13.v1`
- **Source mandatory gates:** `192`
- **Fleet mandatory gates:** `408`
- **Total gates:** `600`

---

# 0. Executive Contract

R13은 하나의 설치본을 안전하게 업데이트하는 R12 위에, 여러 설치본을 순차적으로 release에 노출시키는 fleet rollout authority를 추가한다. R13은 release를 빌드하거나 물리 GPU correctness를 새로 승인하지 않는다. R13은 R9·R10으로 이미 qualified된 whole-build package를 대상으로, 어떤 설치본이 어느 ring에서 local R10 promotion을 시도할 수 있는지 signed admission lease로 제어하고, 각 설치본의 R10·R12·R11 영수증을 privacy-minimized evidence envelope로 집계한다.

Fleet rollout에서 가장 중요한 권위 분리는 다음이다.

```text
R13 signed ring lease
    ↓ authorizes only
installation-local R10 pointer CAS
    ↓
installation-local R12 atomic package activation
    ↓
installation-local R11 attestation and runtime token
    ↓
privacy-minimized signed evidence envelope
    ↓
R13 exact decision aggregate
    ↓
advance | hold | pause | contain
```

R13은 어떤 설치본의 Production Pointer나 Local Activation Pointer도 직접 쓰지 않는다. Rollout control plane이 원격으로 pointer를 바꾸거나 silent rollback을 수행하면 실패다. R13은 lease, containment directive, rollback recommendation을 생성할 수 있지만 실제 pointer mutation은 각 설치본의 R10 또는 R12 authority가 수행한다.

R13은 fleet-wide 단일 mutable Production Pointer를 도입하지 않는다. 각 설치본은 자신의 local R10 pointer를 유지한다. Ring에 입장하지 않은 설치본은 source release A를 정상적으로 계속 실행한다. Ring lease를 받은 설치본만 local R10을 통해 target B로 승격한다. 이 구조가 아니면 canary ring 동안 A 설치본의 R11 token이 전부 무효화되어 cohort rollout 자체가 불가능하다.

R13은 fleet evidence를 두 표면으로 분리한다.

```text
exact decision view
= signed pseudonymous installation evidence를 중복 제거해 계산
= rollout advance/contain 판단에 사용
= 무작위 노이즈 금지

privacy reporting view
= installation pseudonym 제거
= small-cell suppression
= adapter/driver/time coarse bucket
= 운영 보고와 공유에만 사용
```

Correctness와 identity breaker는 통계적 허용률을 갖지 않는다. 다음은 한 건이라도 즉시 rollout을 pause 또는 contain한다.

```text
artifact drift
package digest mismatch
cross-generation asset
validation counter nonzero
fault sentinel
nonfinite output
startup canary failure
R12 recovery ambiguous
unauthorized pointer mutation
silent product fallback
```

# 1. Parent Truth and Current Repository Facts

현재 R12 bundle은 source harness 상태다.

```text
R12 state = RESAMPLE_RUNTIME_R12_ATOMIC_UPDATE_HARNESS_SOURCE_BAKED_AWAITING_QUALIFIED_RELEASE_AND_R11_ACTIVE_INSTALLATION
R12 SOURCE PASS = 168
R12 INSTALLED PENDING = 358
R12 FAIL = 0
R12 productionPointerMutated = false
R12 localActivationPointerMutated = false

R11 SOURCE PASS = 148
R11 INSTALLED PENDING = 228
R10 SOURCE PASS = 129
R10 RELEASE PENDING = 202
R9 SOURCE PASS = 110
R9 PHYSICAL PENDING = 187
```

따라서 R13 source harness와 fleet protocol은 작성할 수 있지만 실제 multi-installation rollout, ring advancement, fleet containment를 실행할 수 없다. Fleet mandatory gate 408개는 최소 두 개 이상의 qualified installed execution과 signed fleet evidence가 존재할 때까지 전부 `PENDING`이다.

# 2. Scope

- qualified R10 release와 R9 physical receipt admission;
- 여러 설치본의 privacy-preserving enrollment와 rollout-scoped pseudonym;
- six-ring rollout plan, basis-point cohort assignment, ring CAS state machine;
- signed single-use admission lease;
- installation-local R10 promotion, R12 activation, R11 admission의 receipt chain;
- signed local evidence envelope, deduplication, replay rejection, late/missing evidence accounting;
- exact decision aggregate와 privacy-filtered reporting aggregate 분리;
- ring dwell, evidence coverage, minimum sessions, Wilson upper-bound threshold;
- zero-tolerance correctness/identity breaker;
- rollout pause, unconsumed lease revocation, signed containment directive;
- R11 quarantine request와 per-installation R10 rollback recommendation;
- small-fleet와 large-fleet profile;
- append-only rollout ledger, operator approval, final rollout receipt.

# 3. Non-Goals

- R9 physical correctness 재실행을 fleet 통계로 대체;
- R10 release qualification 또는 pointer CAS 복제;
- R12 local package activation 직접 수행;
- R11 session token 직접 발급;
- remote silent rollback;
- fleet-wide 단일 mutable package pointer;
- user image, filename, path, pixel hash, EXIF, account identity 수집;
- hardware serial 기반 installation identity;
- noisy public aggregate를 rollout 결정 입력으로 사용;
- missing evidence를 success로 간주;
- semantic version만으로 cohort admission;
- release별 다른 package bytes를 같은 packageContentId로 취급;
- unqualified previous package를 rollback target으로 발명.

# 4. Authority Separation

## 4.1 R10 Per-Installation Production Authority

각 설치본은 자신의 `dadum.export.production-pointer`를 유지한다. R13 lease는 local R10 CAS를 실행할 자격만 부여한다. Lease가 pointer write 자체를 포함하거나 R13 service가 pointer file에 직접 접근하면 실패다.

## 4.2 R12 Per-Installation Activation Authority

Local R10이 target B를 선택한 뒤 R12가 immutable package store와 local activation pointer를 통해 package B를 설치한다. R13은 R12 transaction receipt를 읽을 뿐 local activation pointer를 쓰지 않는다.

## 4.3 R11 Per-Installation Runtime Authority

R11만 installed bytes, startup canary, device epoch, session token, quarantine를 결정한다. R13 aggregate에서 installation을 성공으로 세려면 R11 final admitted receipt가 필요하다.

## 4.4 R13 Fleet Rollout Authority

R13은 다음만 소유한다.

```text
dadum.rollout.plan
dadum.rollout.ledger
dadum.rollout.admission-lease
dadum.rollout.containment-directive
tdt.rollout.fleet-evidence-aggregate.r13.v1
```

R13은 local pointer를 선택하지 않는다. Rollout eligibility와 evidence decision만 소유한다.

# 5. Installation Enrollment and Pseudonymous Identity

Installation enrollment identity는 256-bit CSPRNG 값이다. MAC 주소, disk serial, TPM endorsement key, GPU serial, Windows account SID, email, machine name에서 파생하지 않는다.

Control plane에 올라가는 identifier는 rollout-scoped pseudonym이다.

```text
installationRolloutPseudonym =
  HMAC-SHA256(fleetPseudonymKey,
    rolloutId || installationEnrollmentId)
```

Raw enrollment ID는 evidence envelope에 포함하지 않는다. 새 rolloutId에서는 다른 pseudonym이 생성된다. Fleet 운영자가 장기간 설치본을 추적해야 하는 경우에도 별도 명시적 enrollment registry 권위가 필요하며, public aggregate에는 어떤 stable identifier도 노출하지 않는다.

# 6. Deterministic Cohort Assignment

Cohort bucket은 control-plane secret으로 결정한다.

```text
cohortDigest =
  HMAC-SHA256(fleetCohortSecret,
    rolloutId || installationEnrollmentId || planDigest)

cohortBucket = uint32_be(cohortDigest[0..4]) mod 10000
```

- bucket domain은 `0..9999`다.
- 사용자가 bucket을 선택할 수 없다.
- rollout plan generation이 바뀌면 기존 assignment를 in-place 재해석하지 않는다.
- 같은 rollout에서는 assignment가 안정적이다.
- 다른 rollout에서는 assignment가 재무작위화된다.
- LAB ring은 명시적 operator list이며 random end-user selection을 사용하지 않는다.

# 7. Canonical Six-Ring Model

Canonical ring order:

```text
RING-0 LAB
RING-1 CANARY
RING-2 EARLY
RING-3 BROAD
RING-4 MAJORITY
RING-5 FULL
```

Default target basis points:

```text
LAB       explicit allowlist
CANARY      50 bp   = 0.5%
EARLY      500 bp   = 5%
BROAD     2500 bp   = 25%
MAJORITY  6000 bp   = 60%
FULL     10000 bp   = 100%
```

Basis points는 plan에 봉인되며 rollout 도중 in-place 수정하지 않는다. 다른 비율이 필요하면 새 plan generation과 operator approval을 발급한다.

# 8. Small-Fleet and Large-Fleet Profiles

Large fleet profile은 basis point와 최소 installation 수를 함께 사용한다. Small fleet profile은 percentage가 의미 없을 수 있으므로 고정 count progression을 사용한다.

```text
small fleet example
LAB      1 explicit installation
CANARY   2 installations
EARLY    3 installations
BROAD    5 installations
MAJORITY all but one eligible installation
FULL     all eligible installations
```

Profile은 rollout 시작 전에 고정한다. Fleet 크기가 바뀌었다는 이유로 중간 ring의 denominator를 소급 변경하지 않는다.

# 9. Rollout Plan v1

Canonical schema ID:

```text
tdt.rollout.plan.r13.v1
```

필수 필드:

```text
rolloutId
planGeneration
planId
targetBuildId
targetPackageContentId
sourceReleaseSet
r10FinalReleaseReceiptSha256
r9PhysicalReceiptSha256
privacyProfileDigest
ringDefinitions[]
criticalBreakerPolicy
operationalThresholdPolicy
evidenceWindowPolicy
operatorApprovalDigest
createdAt
expiresAt
planSha256
signature
```

Plan write는 generation과 raw hash CAS를 사용한다. Split-brain plan 두 개가 같은 generation을 주장하면 rollout을 즉시 pause한다.

# 10. Ring Admission Lease v1

Canonical schema ID:

```text
tdt.rollout.admission-lease.r13.v1
```

Lease 필드:

```text
rolloutId
planDigest
planGeneration
ringId
installationRolloutPseudonym
cohortBucket
sourceBuildId
sourcePackageContentId
targetBuildId
targetPackageContentId
expectedLocalR10Generation
expectedLocalR10RawSha256
leaseNonce
notBefore
expiresAt
revocationGeneration
leaseSha256
signature
```

Lease는 single-use다. Local R10 CAS가 성공하거나 lease가 만료되면 재사용할 수 없다. Lease는 R10 CAS inputs를 제공하지만 pointer를 포함하지 않는다.

# 11. Local Execution Chain

Installation success는 다음 receipt chain 전체가 있어야 한다.

```text
R13 lease consumed
→ local R10 promotion receipt
→ local R12 atomic update receipt
→ local R11 installed attestation receipt
→ R11 runtime token issued
→ local R13 evidence envelope signed
```

R10 성공 후 R12 또는 R11이 실패한 installation은 success denominator에 들어가지 않는다. Failure 종류를 숨기지 않고 별도 카운터로 유지한다.

# 12. Rollout State Machine

```text
CREATED
→ PLAN_SEALED
→ LAB_ACTIVE
→ CANARY_ACTIVE
→ EARLY_ACTIVE
→ BROAD_ACTIVE
→ MAJORITY_ACTIVE
→ FULL_ACTIVE
→ COMPLETED
```

Side states:

```text
PAUSED
CONTAINED
REJECTED
```

Ring은 한 단계씩만 전진한다. Ring skip, regression, active ring 두 개는 실패다. `PAUSED`에서 재개하려면 같은 evidence input을 재사용하지 않고 새 decision generation을 발급한다.

# 13. Evidence Envelope

Local evidence envelope는 signed allowlist object다.

허용되는 대표 필드:

```text
rolloutId
planDigest
ringId
installationRolloutPseudonym
evidenceSequence
evidenceNonce
coarseWindowStart
coarseWindowEnd
buildId
packageContentId
R10 transition result
R12 activation result
R11 admission result
startup canary failure count
validation counter nonzero count
artifact drift count
cross-generation count
device-loss count
renderer crash count
GPU process crash count
quarantine count
admitted session count
exposure duration bucket
adapter family bucket
driver version bucket
```

금지 필드:

```text
image bytes
thumbnail
pixel hash
file name
absolute or relative user path
EXIF
user document metadata
account name
email
precise location
hardware serial
raw crash dump
raw application log
```

# 14. Evidence Integrity

- envelope signature 검증;
- self-hash 검증;
- rollout, release, ring binding 검증;
- pseudonym별 monotonic sequence;
- nonce replay rejection;
- duplicate envelope deduplication;
- late evidence 별도 bucket;
- missing evidence를 success로 간주하지 않음;
- decision input set digest freeze.

# 15. Exact Decision View and Privacy Reporting View

Exact decision view는 signed envelope의 exact counts를 사용한다. Rollout safety gate에 differential-privacy noise를 넣지 않는다. Noise 때문에 critical event가 0으로 보일 수 있기 때문이다.

Privacy reporting view는 다음을 적용한다.

```text
installation pseudonym 제거
minimum k = 5
small-cell suppression
suppressed cell을 0으로 표시하지 않음
adapter family coarse bucket
driver version coarse bucket
time bucket coarsening
raw envelope 비공개
```

# 16. Evidence Coverage

```text
coverage = validEvidenceInstallations / admittedInstallations
```

Unknown, offline, late installation을 denominator에서 조용히 제거하지 않는다. Ring plan은 최소 coverage를 선언한다. 기본 minimum은 95%이며 LAB과 CANARY는 100%를 권장한다.

# 17. Critical Breakers

다음은 count가 1 이상이면 즉시 `PAUSED` 또는 `CONTAINED`다.

```text
artifactDrift
packageDigestMismatch
crossGenerationAsset
validationCounterNonZero
faultSentinelObserved
nonfiniteOutput
startupCanaryFailure
R12RecoveryAmbiguous
unauthorizedPointerMutation
silentCpuCanvasWebglFallback
```

Critical breaker에 percentage tolerance를 적용하지 않는다.

# 18. Operational Thresholds

Crash, device loss, quarantine, activation failure는 rate와 one-sided Wilson upper bound로 판단한다.

```text
p_hat = x / n
z = 1.96
upper =
  (p_hat + z^2/(2n) + z*sqrt((p_hat*(1-p_hat)+z^2/(4n))/n))
  / (1 + z^2/n)
```

Canonical default policy:

```text
activation failure upper <= 0.5%
R11 admission failure upper <= 0.5%
renderer crash upper <= max(0.5%, source baseline upper + 0.2%p)
GPU process crash upper <= max(0.3%, source baseline upper + 0.1%p)
device loss upper <= max(0.3%, source baseline upper + 0.1%p)
quarantine upper <= 0.1%
```

LAB과 CANARY에서는 표본이 작으므로 critical failure와 startup failure zero를 우선한다. 통계식은 zero correctness failure 원칙을 대체하지 않는다.

# 19. Ring Dwell and Advancement

각 ring은 최소 설치본 수, admitted session 수, observation dwell, evidence coverage를 모두 충족해야 한다. Clock time만 흘렀다고 advance하지 않는다.

Default minimum dwell:

```text
LAB       2 hours
CANARY    6 hours
EARLY    12 hours
BROAD    24 hours
MAJORITY 48 hours
FULL     72 hours final observation
```

Advance decision은 frozen evidence input set, computed metrics, policy result, operator approval을 포함하는 signed receipt다.

# 20. Missing and Late Evidence

- missing evidence는 success가 아니다;
- late evidence는 원래 window에 소급 삽입하지 않는다;
- corrected window는 새 generation으로 재계산한다;
- offline installation은 explicit state로 기록한다;
- evidence가 부족하면 `HOLD`, not `PASS`다.

# 21. Bad-Release Containment Levels

```text
LEVEL-1 HOLD
= active ring 유지, advance 금지

LEVEL-2 PAUSE
= 신규 lease 발급 중단, unconsumed lease revoke

LEVEL-3 CONTAIN
= signed containment directive 발급
= target B의 R11에 신규 job 차단 요청
= rollback recommendation 생성
```

R13은 pointer를 되돌리지 않는다.

# 22. Containment Directive

Containment directive는 target release, rollout plan, generation, expiry, reason evidence digest에 묶인다. R11은 signature, release match, generation을 검증한 뒤 신규 Preview·Export admission을 차단할 수 있다. User content는 directive나 evidence에 포함하지 않는다.

# 23. Rollback Recommendation Batch

각 affected installation에 다음을 제공한다.

```text
current local R10 generation
current local R10 raw hash
failed build/package
qualified previous build/package
R12 previous package recoverability
expected R10 rollback CAS inputs
operator policy
pointerMutationPerformed = false
```

실제 rollback은 local R10이 수행하고 R12·R11이 복구를 확인한다.

# 24. No Remote Silent Rollback

Control plane은 install root, pointer file, package store에 직접 쓰지 않는다. 자동 복구 정책이 사전 승인되었더라도 각 설치본에서 local R10 명령과 receipt가 발생해야 한다. Receipt 없는 remote rollback은 실패다.

# 25. Fleet Ledger

Rollout ledger는 append-only hash chain이다.

```text
sequence
previousEntrySha256
planGeneration
ringGeneration
eventType
inputDigest
resultDigest
operatorApprovalDigest
entrySha256
signature
```

Plan, ring, lease batch, aggregate, decision, containment, final receipt가 모두 ledger에 귀속된다.

# 26. Split-Brain Prevention

동일 rolloutId와 planGeneration에 서로 다른 plan digest가 존재하거나, 동일 ringGeneration에 서로 다른 active ring이 존재하면 즉시 pause한다. 자동으로 더 최신 timestamp를 선택하지 않는다. Generation과 signed ledger chain으로만 정렬한다.

# 27. Key Rotation and Revocation

- plan signing key;
- lease signing key;
- evidence signing key;
- containment signing key;
- aggregate signing key;

각 key role을 분리한다. Key rotation은 new key ID와 effective generation을 ledger에 기록한다. Revoked key로 생성된 새 evidence는 거부하고, revocation 이전 evidence는 signed timestamp와 policy에 따라 보존한다.

# 28. Offline and Disconnected Installations

Offline installation은 existing source release에서 계속 정상 동작할 수 있다. Lease를 받지 않았거나 lease가 만료된 상태에서 target B를 임의 활성화할 수 없다. 다시 연결되면 current plan generation과 local R10 state를 재검증하고 새 lease를 발급받는다.

# 29. Local-Only Fleet Mode

Network evidence upload가 허용되지 않는 환경에서는 signed envelope를 파일로 export하고 offline aggregator가 동일 schema와 signature 검증을 수행할 수 있다. Local-only installation은 central aggregate의 success나 failure로 조용히 계산하지 않고 explicit exclusion으로 기록한다.

# 30. Privacy Retention

Raw evidence envelope는 rollout decision과 audit에 필요한 최소 기간만 보존한다. 기본 TTL은 plan에 명시한다. Final signed aggregate와 decision receipt는 장기 보존할 수 있지만 installation pseudonym과 raw event timestamps를 제거한 privacy view를 별도로 만든다.

# 31. Fleet Finalization

Final ring은 basis point 10000에 도달했다는 사실만으로 완료되지 않는다. 다음이 필요하다.

```text
all ring receipts present
unknown installation count = 0
critical breaker count = 0
final evidence coverage policy PASS
privacy audit PASS
R13 pointer mutation count = 0
```

Target을 적용하지 않은 installation은 explicit exclusion reason과 operator approval을 가져야 하며 `SKIPPED`로 숨기지 않는다.

# 32. Source State and Fleet State

Source bake state:

```text
RESAMPLE_RUNTIME_R13_COHORT_ROLLOUT_HARNESS_SOURCE_BAKED_AWAITING_QUALIFIED_MULTI_INSTALLATION_FLEET
SOURCE PASS = 192
FLEET PENDING = 408
FAIL = 0
```

Fleet final state:

```text
RESAMPLE_RUNTIME_R13_MULTI_INSTALLATION_COHORT_ROLLOUT_AND_PRIVACY_RECEIPT_SEALED
SOURCE PASS = 192
FLEET PASS = 408
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0
productionPointerMutatedByR13 = false
localActivationPointerMutatedByR13 = false
```

# 33. Required Source Artifacts

```text
R13_CONTRACT_MANIFEST.json
R13_PARENT_FREEZE_RECEIPT.json
R13_ROLLOUT_PLAN_SCHEMA.json
R13_ENROLLMENT_SCHEMA.json
R13_COHORT_ASSIGNMENT_SCHEMA.json
R13_ADMISSION_LEASE_SCHEMA.json
R13_EVIDENCE_ENVELOPE_SCHEMA.json
R13_AGGREGATE_SCHEMA.json
R13_CONTAINMENT_DIRECTIVE_SCHEMA.json
R13_ROLLBACK_RECOMMENDATION_SCHEMA.json
R13_PRIVACY_PROFILE.json
R13_SOURCE_GATE_REPORT.json
R13_PREDECESSOR_REGRESSION_REPORT.json
R13_SOURCE_FINAL_RECEIPT.json
```

# 34. Required Fleet Artifacts

```text
R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json
R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json
R13_LOCAL_CHAIN_BATCH_RECEIPT.json
R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json
R13_RING_ADVANCEMENT_RECEIPT.json
R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json
R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json
R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json
R13_FINAL_FLEET_ROLLOUT_RECEIPT.json
```

# 35. Stable Error Taxonomy

```text
E_R13_PARENT_FREEZE_MISMATCH
E_R13_CONTRACT_IDENTITY_MISMATCH
E_R13_PRIVACY_SOURCE_INVALID
E_R13_ROLLOUT_PLAN_INVALID
E_R13_ADMISSION_LEASE_INVALID
E_R13_EVIDENCE_AGGREGATION_INVALID
E_R13_CONTAINMENT_SOURCE_INVALID
E_R13_FLEET_NOT_QUALIFIED
E_R13_RING_PLAN_ADMISSION_FAILED
E_R13_LOCAL_CHAIN_FAILED
E_R13_FLEET_EVIDENCE_INVALID
E_R13_RING_ADVANCEMENT_REJECTED
E_R13_PRIVACY_AGGREGATION_FAILED
E_R13_BAD_RELEASE_CONTAINMENT_FAILED
E_R13_FINAL_ROLLOUT_INCOMPLETE
E_R13_NEGATIVE_CONTROL_NOT_DETECTED
E_R13_SPLIT_BRAIN
E_R13_UNAUTHORIZED_POINTER_WRITE
E_R13_MISSING_EVIDENCE
E_R13_CRITICAL_BREAKER
```

# 36. Negative-Control Families

- unsigned or stale plan;
- ring skip and ring regression;
- unsigned, replayed, expired, wrong-package lease;
- stale local R10 generation or hash;
- duplicate pseudonym and evidence replay;
- user-content field injection;
- wrong release/ring evidence;
- missing evidence treated as success;
- late evidence backdating;
- critical breaker ignored;
- public small-cell disclosure;
- old containment directive replay;
- R13 pointer write attempt;
- unqualified rollback target;
- split-brain plan;
- aggregate input mutation;
- final unknown installation.

# 37. Source Gate Catalog

## S Group: Parent Freeze and Current State
### R13-S001 `PARENT_BUNDLE_PRESENT`
- **Requirement:** parent bundle present.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S002 `PARENT_BUNDLE_SHA256_EXACT`
- **Requirement:** parent bundle sha256 exact.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S003 `PARENT_R12_SPEC_PRESENT`
- **Requirement:** parent r12 spec present.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S004 `PARENT_R12_SPEC_SHA256_EXACT`
- **Requirement:** parent r12 spec sha256 exact.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S005 `PARENT_R12_SOURCE_RECEIPT_PRESENT`
- **Requirement:** parent r12 source receipt present.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S006 `PARENT_R12_SOURCE_RECEIPT_SHA256_EXACT`
- **Requirement:** parent r12 source receipt sha256 exact.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S007 `PARENT_R12_SOURCE_STATE_EXACT`
- **Requirement:** parent r12 source state exact.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S008 `PARENT_R12_SOURCE_PASS_168`
- **Requirement:** parent r12 source pass 168.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S009 `PARENT_R12_INSTALLED_PENDING_358`
- **Requirement:** parent r12 installed pending 358.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S010 `PARENT_R12_FAIL_ZERO`
- **Requirement:** parent r12 fail zero.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S011 `PARENT_PRODUCTION_POINTER_NOT_MUTATED`
- **Requirement:** parent production pointer not mutated.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S012 `PARENT_LOCAL_POINTER_NOT_MUTATED`
- **Requirement:** parent local pointer not mutated.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S013 `R10_POINTER_AUTHORITY_DECLARED`
- **Requirement:** r10 pointer authority declared.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S014 `R11_ADMISSION_AUTHORITY_DECLARED`
- **Requirement:** r11 admission authority declared.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S015 `R12_INSTALL_AUTHORITY_DECLARED`
- **Requirement:** r12 install authority declared.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S016 `R13_ROLLOUT_AUTHORITY_DECLARED`
- **Requirement:** r13 rollout authority declared.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S017 `R13_PARENT_FREEZE_MANIFEST_PRESENT`
- **Requirement:** r13 parent freeze manifest present.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S018 `R13_PARENT_FREEZE_CHILD_DIGESTS_COMPLETE`
- **Requirement:** r13 parent freeze child digests complete.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S019 `R13_SOURCE_MODE_DECLARED`
- **Requirement:** r13 source mode declared.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S020 `R13_FLEET_EXECUTION_ABSENT_RECORDED`
- **Requirement:** r13 fleet execution absent recorded.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S021 `R13_NO_PARENT_RECEIPT_REWRITE`
- **Requirement:** r13 no parent receipt rewrite.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S022 `R13_NO_PARENT_POINTER_WRITE`
- **Requirement:** r13 no parent pointer write.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S023 `R13_PREDECESSOR_REGRESSION_ENTRY_PRESENT`
- **Requirement:** r13 predecessor regression entry present.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.
### R13-S024 `R13_CURRENT_FACTS_RECEIPT_PRESENT`
- **Requirement:** r13 current facts receipt present.
- **Assertion:** Parent bundle, R12 source receipt, pointer facts, and predecessor authority boundaries are frozen exactly.
- **Evidence:** `R13_PARENT_FREEZE_RECEIPT.json`.
- **Failure:** `E_R13_PARENT_FREEZE_MISMATCH`; the rollout does not advance.

## S Group: Authority and Schema Identities
### R13-S025 `ROLLOUT_PLAN_SCHEMA_ID`
- **Requirement:** rollout plan schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S026 `ROLLOUT_LEDGER_SCHEMA_ID`
- **Requirement:** rollout ledger schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S027 `FLEET_ENROLLMENT_SCHEMA_ID`
- **Requirement:** fleet enrollment schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S028 `COHORT_ASSIGNMENT_SCHEMA_ID`
- **Requirement:** cohort assignment schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S029 `RING_ADMISSION_LEASE_SCHEMA_ID`
- **Requirement:** ring admission lease schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S030 `LOCAL_EVIDENCE_ENVELOPE_SCHEMA_ID`
- **Requirement:** local evidence envelope schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S031 `FLEET_AGGREGATE_SCHEMA_ID`
- **Requirement:** fleet aggregate schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S032 `RING_DECISION_SCHEMA_ID`
- **Requirement:** ring decision schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S033 `CONTAINMENT_DIRECTIVE_SCHEMA_ID`
- **Requirement:** containment directive schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S034 `ROLLBACK_RECOMMENDATION_BATCH_SCHEMA_ID`
- **Requirement:** rollback recommendation batch schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S035 `PRIVACY_PROFILE_SCHEMA_ID`
- **Requirement:** privacy profile schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S036 `FINAL_ROLLOUT_RECEIPT_SCHEMA_ID`
- **Requirement:** final rollout receipt schema id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S037 `ROLLOUT_PLAN_AUTHORITY_ID`
- **Requirement:** rollout plan authority id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S038 `LOCAL_R10_POINTER_AUTHORITY_ID`
- **Requirement:** local r10 pointer authority id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S039 `LOCAL_R12_ACTIVATION_AUTHORITY_ID`
- **Requirement:** local r12 activation authority id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S040 `LOCAL_R11_ADMISSION_AUTHORITY_ID`
- **Requirement:** local r11 admission authority id.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S041 `R13_POINTER_MUTATION_FORBIDDEN`
- **Requirement:** r13 pointer mutation forbidden.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S042 `R13_LOCAL_INSTALL_MUTATION_FORBIDDEN`
- **Requirement:** r13 local install mutation forbidden.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S043 `R13_USER_JOB_AUTHORITY_FORBIDDEN`
- **Requirement:** r13 user job authority forbidden.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S044 `R13_RELEASE_QUALIFICATION_FORBIDDEN`
- **Requirement:** r13 release qualification forbidden.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S045 `R13_CANARY_RING_COUNT_PINNED`
- **Requirement:** r13 canary ring count pinned.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S046 `R13_BASIS_POINT_DOMAIN_PINNED`
- **Requirement:** r13 basis point domain pinned.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S047 `R13_GATE_COUNT_PINNED`
- **Requirement:** r13 gate count pinned.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.
### R13-S048 `R13_STATE_MACHINE_VERSION_PINNED`
- **Requirement:** r13 state machine version pinned.
- **Assertion:** All R13 schemas, authority IDs, forbidden mutations, and versioned state identities are declared from one canonical contract.
- **Evidence:** `R13_CONTRACT_MANIFEST.json`.
- **Failure:** `E_R13_CONTRACT_IDENTITY_MISMATCH`; the rollout does not advance.

## S Group: Enrollment Pseudonym and Privacy Source
### R13-S049 `INSTALLATION_ENROLLMENT_ID_RANDOM`
- **Requirement:** installation enrollment id random.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S050 `INSTALLATION_ENROLLMENT_ID_NOT_HARDWARE_DERIVED`
- **Requirement:** installation enrollment id not hardware derived.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S051 `INSTALLATION_ENROLLMENT_ID_NOT_USER_DERIVED`
- **Requirement:** installation enrollment id not user derived.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S052 `ROLLOUT_PSEUDONYM_HMAC_DEFINED`
- **Requirement:** rollout pseudonym hmac defined.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S053 `ROLLOUT_PSEUDONYM_RELEASE_SCOPED`
- **Requirement:** rollout pseudonym release scoped.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S054 `ROLLOUT_PSEUDONYM_NO_RAW_ENROLLMENT_ID`
- **Requirement:** rollout pseudonym no raw enrollment id.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S055 `COHORT_HMAC_SHA256_DEFINED`
- **Requirement:** cohort hmac sha256 defined.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S056 `COHORT_BUCKET_0_9999_DEFINED`
- **Requirement:** cohort bucket 0 9999 defined.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S057 `COHORT_SECRET_NOT_DISTRIBUTED`
- **Requirement:** cohort secret not distributed.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S058 `ENROLLMENT_KEY_ROTATION_DEFINED`
- **Requirement:** enrollment key rotation defined.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S059 `EVIDENCE_SIGNING_KEY_DEFINED`
- **Requirement:** evidence signing key defined.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S060 `EVIDENCE_REPLAY_NONCE_DEFINED`
- **Requirement:** evidence replay nonce defined.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S061 `EVIDENCE_MONOTONIC_SEQUENCE_DEFINED`
- **Requirement:** evidence monotonic sequence defined.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S062 `NO_IMAGE_BYTES_FIELD`
- **Requirement:** no image bytes field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S063 `NO_PIXEL_HASH_FIELD`
- **Requirement:** no pixel hash field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S064 `NO_FILE_NAME_FIELD`
- **Requirement:** no file name field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S065 `NO_USER_PATH_FIELD`
- **Requirement:** no user path field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S066 `NO_EXIF_FIELD`
- **Requirement:** no exif field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S067 `NO_DOCUMENT_METADATA_FIELD`
- **Requirement:** no document metadata field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S068 `NO_ACCOUNT_NAME_FIELD`
- **Requirement:** no account name field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S069 `NO_EMAIL_FIELD`
- **Requirement:** no email field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S070 `NO_PRECISE_LOCATION_FIELD`
- **Requirement:** no precise location field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S071 `NO_STABLE_HARDWARE_SERIAL_FIELD`
- **Requirement:** no stable hardware serial field.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S072 `ADAPTER_FAMILY_BUCKET_ONLY`
- **Requirement:** adapter family bucket only.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S073 `DRIVER_VERSION_BUCKET_POLICY`
- **Requirement:** driver version bucket policy.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S074 `TIME_BUCKET_COARSENING_POLICY`
- **Requirement:** time bucket coarsening policy.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S075 `RETENTION_TTL_DEFINED`
- **Requirement:** retention ttl defined.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.
### R13-S076 `LOCAL_ONLY_MODE_SUPPORTED`
- **Requirement:** local only mode supported.
- **Assertion:** Enrollment, cohorting, evidence signing, data minimization, and retention are source-defined without user-content or stable hardware identity collection.
- **Evidence:** `R13_PRIVACY_AND_ENROLLMENT_SOURCE_GATE.json`.
- **Failure:** `E_R13_PRIVACY_SOURCE_INVALID`; the rollout does not advance.

## S Group: Rollout Plan and Ring State Machine Source
### R13-S077 `ROLLOUT_ID_192BIT_RANDOM`
- **Requirement:** rollout id 192bit random.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S078 `ROLLOUT_PLAN_CANONICAL_JSON`
- **Requirement:** rollout plan canonical json.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S079 `ROLLOUT_PLAN_SELF_HASH`
- **Requirement:** rollout plan self hash.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S080 `ROLLOUT_PLAN_SIGNATURE_FIELD`
- **Requirement:** rollout plan signature field.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S081 `ROLLOUT_PLAN_GENERATION`
- **Requirement:** rollout plan generation.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S082 `ROLLOUT_PLAN_RAW_HASH_CAS`
- **Requirement:** rollout plan raw hash cas.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S083 `TARGET_BUILD_ID_BOUND`
- **Requirement:** target build id bound.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S084 `TARGET_PACKAGE_ID_BOUND`
- **Requirement:** target package id bound.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S085 `SOURCE_BUILD_SET_BOUND`
- **Requirement:** source build set bound.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S086 `R10_RELEASE_RECEIPT_DIGEST_BOUND`
- **Requirement:** r10 release receipt digest bound.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S087 `R9_PHYSICAL_RECEIPT_DIGEST_BOUND`
- **Requirement:** r9 physical receipt digest bound.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S088 `RING_LAB_DEFINED`
- **Requirement:** ring lab defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S089 `RING_CANARY_DEFINED`
- **Requirement:** ring canary defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S090 `RING_EARLY_DEFINED`
- **Requirement:** ring early defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S091 `RING_BROAD_DEFINED`
- **Requirement:** ring broad defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S092 `RING_MAJORITY_DEFINED`
- **Requirement:** ring majority defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S093 `RING_FULL_DEFINED`
- **Requirement:** ring full defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S094 `RING_TARGET_BASIS_POINTS_MONOTONIC`
- **Requirement:** ring target basis points monotonic.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S095 `RING_MIN_INSTALLATIONS_DEFINED`
- **Requirement:** ring min installations defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S096 `RING_MIN_SESSIONS_DEFINED`
- **Requirement:** ring min sessions defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S097 `RING_MIN_DWELL_DEFINED`
- **Requirement:** ring min dwell defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S098 `RING_EVIDENCE_COVERAGE_DEFINED`
- **Requirement:** ring evidence coverage defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S099 `RING_ADVANCE_SINGLE_STEP`
- **Requirement:** ring advance single step.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S100 `RING_REGRESSION_FORBIDDEN`
- **Requirement:** ring regression forbidden.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S101 `RING_PAUSE_STATE_DEFINED`
- **Requirement:** ring pause state defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S102 `RING_CONTAIN_STATE_DEFINED`
- **Requirement:** ring contain state defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S103 `RING_COMPLETE_STATE_DEFINED`
- **Requirement:** ring complete state defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S104 `RING_REJECT_STATE_DEFINED`
- **Requirement:** ring reject state defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S105 `PLAN_SUPERSESSION_DEFINED`
- **Requirement:** plan supersession defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S106 `PLAN_SPLIT_BRAIN_DETECTION_DEFINED`
- **Requirement:** plan split brain detection defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S107 `PLAN_APPEND_ONLY_LEDGER_DEFINED`
- **Requirement:** plan append only ledger defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.
### R13-S108 `PLAN_OPERATOR_APPROVAL_DEFINED`
- **Requirement:** plan operator approval defined.
- **Assertion:** The rollout plan, six-ring progression, CAS generation, operator approval, pause/contain states, and append-only ledger are source-defined.
- **Evidence:** `R13_ROLLOUT_PLAN_SOURCE_GATE.json`.
- **Failure:** `E_R13_ROLLOUT_PLAN_INVALID`; the rollout does not advance.

## S Group: Admission Lease and Local Authority Integration Source
### R13-S109 `LEASE_ROLLOUT_ID_BOUND`
- **Requirement:** lease rollout id bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S110 `LEASE_PLAN_DIGEST_BOUND`
- **Requirement:** lease plan digest bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S111 `LEASE_RING_ID_BOUND`
- **Requirement:** lease ring id bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S112 `LEASE_COHORT_BUCKET_BOUND`
- **Requirement:** lease cohort bucket bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S113 `LEASE_INSTALLATION_PSEUDONYM_BOUND`
- **Requirement:** lease installation pseudonym bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S114 `LEASE_TARGET_BUILD_BOUND`
- **Requirement:** lease target build bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S115 `LEASE_TARGET_PACKAGE_BOUND`
- **Requirement:** lease target package bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S116 `LEASE_SOURCE_BUILD_BOUND`
- **Requirement:** lease source build bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S117 `LEASE_LOCAL_R10_EXPECTED_GENERATION`
- **Requirement:** lease local r10 expected generation.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S118 `LEASE_LOCAL_R10_EXPECTED_RAW_HASH`
- **Requirement:** lease local r10 expected raw hash.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S119 `LEASE_NOT_BEFORE_BOUND`
- **Requirement:** lease not before bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S120 `LEASE_EXPIRES_AT_BOUND`
- **Requirement:** lease expires at bound.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S121 `LEASE_SINGLE_USE_NONCE`
- **Requirement:** lease single use nonce.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S122 `LEASE_SIGNATURE_REQUIRED`
- **Requirement:** lease signature required.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S123 `LEASE_REVOCATION_ID_DEFINED`
- **Requirement:** lease revocation id defined.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S124 `LEASE_REPLAY_REJECTED_SOURCE`
- **Requirement:** lease replay rejected source.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S125 `LEASE_WRONG_RING_REJECTED_SOURCE`
- **Requirement:** lease wrong ring rejected source.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S126 `LEASE_WRONG_PACKAGE_REJECTED_SOURCE`
- **Requirement:** lease wrong package rejected source.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S127 `LEASE_STALE_R10_REJECTED`
- **Requirement:** lease stale r10 rejected.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S128 `LEASE_OFFLINE_EXPIRY_REJECTED`
- **Requirement:** lease offline expiry rejected.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S129 `LEASE_ONLY_AUTHORIZES_LOCAL_R10`
- **Requirement:** lease only authorizes local r10.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S130 `LEASE_CANNOT_WRITE_LOCAL_R10`
- **Requirement:** lease cannot write local r10.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S131 `LEASE_CANNOT_WRITE_R12_POINTER`
- **Requirement:** lease cannot write r12 pointer.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S132 `LEASE_CANNOT_ISSUE_R11_TOKEN`
- **Requirement:** lease cannot issue r11 token.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S133 `LOCAL_R10_CAS_HANDOFF_DEFINED`
- **Requirement:** local r10 cas handoff defined.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S134 `LOCAL_R12_UPDATE_HANDOFF_DEFINED`
- **Requirement:** local r12 update handoff defined.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S135 `LOCAL_R11_ATTESTATION_HANDOFF_DEFINED`
- **Requirement:** local r11 attestation handoff defined.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.
### R13-S136 `UNADMITTED_INSTALLATION_REMAINS_ON_SOURCE`
- **Requirement:** unadmitted installation remains on source.
- **Assertion:** A signed single-use ring lease authorizes, but never performs, the local R10 to R12 to R11 chain; non-admitted installations remain normally operational on the source release.
- **Evidence:** `R13_ADMISSION_LEASE_SOURCE_GATE.json`.
- **Failure:** `E_R13_ADMISSION_LEASE_INVALID`; the rollout does not advance.

## S Group: Evidence Envelope and Fleet Aggregation Source
### R13-S137 `LOCAL_EVIDENCE_ALLOWLIST_DEFINED`
- **Requirement:** local evidence allowlist defined.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S138 `LOCAL_EVIDENCE_SCHEMA_VERSIONED`
- **Requirement:** local evidence schema versioned.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S139 `LOCAL_EVIDENCE_RELEASE_SCOPED`
- **Requirement:** local evidence release scoped.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S140 `LOCAL_EVIDENCE_RING_SCOPED`
- **Requirement:** local evidence ring scoped.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S141 `LOCAL_EVIDENCE_INSTALLATION_PSEUDONYM`
- **Requirement:** local evidence installation pseudonym.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S142 `LOCAL_EVIDENCE_SEQUENCE`
- **Requirement:** local evidence sequence.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S143 `LOCAL_EVIDENCE_NONCE`
- **Requirement:** local evidence nonce.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S144 `LOCAL_EVIDENCE_SIGNATURE`
- **Requirement:** local evidence signature.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S145 `LOCAL_EVIDENCE_SELF_HASH`
- **Requirement:** local evidence self hash.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S146 `LOCAL_EVIDENCE_R10_RESULT`
- **Requirement:** local evidence r10 result.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S147 `LOCAL_EVIDENCE_R12_RESULT`
- **Requirement:** local evidence r12 result.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S148 `LOCAL_EVIDENCE_R11_RESULT`
- **Requirement:** local evidence r11 result.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S149 `LOCAL_EVIDENCE_CANARY_COUNTS`
- **Requirement:** local evidence canary counts.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S150 `LOCAL_EVIDENCE_CRASH_COUNTS`
- **Requirement:** local evidence crash counts.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S151 `LOCAL_EVIDENCE_DEVICE_LOSS_COUNTS`
- **Requirement:** local evidence device loss counts.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S152 `LOCAL_EVIDENCE_QUARANTINE_COUNTS`
- **Requirement:** local evidence quarantine counts.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S153 `LOCAL_EVIDENCE_SESSION_COUNTS`
- **Requirement:** local evidence session counts.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S154 `LOCAL_EVIDENCE_EXPOSURE_DURATION_BUCKET`
- **Requirement:** local evidence exposure duration bucket.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S155 `LOCAL_EVIDENCE_ADAPTER_FAMILY_BUCKET`
- **Requirement:** local evidence adapter family bucket.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S156 `LOCAL_EVIDENCE_NO_RAW_LOGS`
- **Requirement:** local evidence no raw logs.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S157 `AGGREGATOR_SIGNATURE_VERIFICATION`
- **Requirement:** aggregator signature verification.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S158 `AGGREGATOR_REPLAY_DEDUP`
- **Requirement:** aggregator replay dedup.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S159 `AGGREGATOR_SEQUENCE_MONOTONIC`
- **Requirement:** aggregator sequence monotonic.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S160 `AGGREGATOR_UNIQUE_PSEUDONYM_COUNT`
- **Requirement:** aggregator unique pseudonym count.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S161 `AGGREGATOR_LATE_EVIDENCE_BUCKET`
- **Requirement:** aggregator late evidence bucket.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S162 `AGGREGATOR_MISSING_EVIDENCE_NOT_SUCCESS`
- **Requirement:** aggregator missing evidence not success.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S163 `AGGREGATOR_EXACT_DECISION_VIEW`
- **Requirement:** aggregator exact decision view.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S164 `AGGREGATOR_PUBLIC_PRIVACY_VIEW`
- **Requirement:** aggregator public privacy view.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S165 `AGGREGATE_CHILD_DIGESTS`
- **Requirement:** aggregate child digests.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S166 `AGGREGATE_SELF_HASH`
- **Requirement:** aggregate self hash.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S167 `AGGREGATE_APPEND_ONLY_LEDGER`
- **Requirement:** aggregate append only ledger.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.
### R13-S168 `AGGREGATE_DECISION_INPUT_FREEZE`
- **Requirement:** aggregate decision input freeze.
- **Assertion:** Local allowlisted receipts, signature and replay checks, exact decision aggregates, privacy-filtered reporting aggregates, and immutable decision inputs are source-defined.
- **Evidence:** `R13_EVIDENCE_AGGREGATION_SOURCE_GATE.json`.
- **Failure:** `E_R13_EVIDENCE_AGGREGATION_INVALID`; the rollout does not advance.

## S Group: Containment Rollback and Source Finalization
### R13-S169 `CRITICAL_BREAKER_TABLE_DEFINED`
- **Requirement:** critical breaker table defined.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S170 `NONCRITICAL_THRESHOLD_TABLE_DEFINED`
- **Requirement:** noncritical threshold table defined.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S171 `WILSON_UPPER_BOUND_DEFINED`
- **Requirement:** wilson upper bound defined.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S172 `BASELINE_COMPARISON_DEFINED`
- **Requirement:** baseline comparison defined.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S173 `ZERO_CRITICAL_EVENT_POLICY`
- **Requirement:** zero critical event policy.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S174 `PAUSE_STOPS_NEW_LEASES`
- **Requirement:** pause stops new leases.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S175 `PAUSE_REVOKES_UNCONSUMED_LEASES`
- **Requirement:** pause revokes unconsumed leases.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S176 `CONTAINMENT_DIRECTIVE_SIGNED`
- **Requirement:** containment directive signed.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S177 `CONTAINMENT_DIRECTIVE_RELEASE_BOUND`
- **Requirement:** containment directive release bound.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S178 `CONTAINMENT_DIRECTIVE_GENERATION_BOUND`
- **Requirement:** containment directive generation bound.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S179 `CONTAINMENT_DIRECTIVE_EXPIRY_BOUND`
- **Requirement:** containment directive expiry bound.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S180 `CONTAINMENT_CANNOT_MUTATE_POINTER`
- **Requirement:** containment cannot mutate pointer.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S181 `CONTAINMENT_CAN_REQUEST_R11_QUARANTINE`
- **Requirement:** containment can request r11 quarantine.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S182 `ROLLBACK_RECOMMENDATION_PER_INSTALLATION`
- **Requirement:** rollback recommendation per installation.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S183 `ROLLBACK_RECOMMENDATION_R10_ONLY`
- **Requirement:** rollback recommendation r10 only.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S184 `ROLLBACK_RECOMMENDATION_EXPECTED_CAS`
- **Requirement:** rollback recommendation expected cas.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S185 `NO_ROLLBACK_TARGET_INVENTION`
- **Requirement:** no rollback target invention.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S186 `NO_REMOTE_SILENT_ROLLBACK`
- **Requirement:** no remote silent rollback.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S187 `SMALL_CELL_SUPPRESSION_DEFINED`
- **Requirement:** small cell suppression defined.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S188 `K_ANONYMITY_MINIMUM_DEFINED`
- **Requirement:** k anonymity minimum defined.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S189 `SOURCE_NEGATIVE_CONTROLS_DEFINED`
- **Requirement:** source negative controls defined.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S190 `SOURCE_FINALIZER_PRESENT`
- **Requirement:** source finalizer present.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S191 `SOURCE_GATE_REPORT_PRESENT`
- **Requirement:** source gate report present.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.
### R13-S192 `FLEET_GATES_PENDING_IN_SOURCE_MODE`
- **Requirement:** fleet gates pending in source mode.
- **Assertion:** Thresholds, signed containment, R11 quarantine request, per-installation R10 rollback recommendation, privacy suppression, and source finalization are fail-closed.
- **Evidence:** `R13_CONTAINMENT_AND_FINALIZER_SOURCE_GATE.json`.
- **Failure:** `E_R13_CONTAINMENT_SOURCE_INVALID`; the rollout does not advance.

# 38. Fleet Gate Catalog

## F Group: Qualified Fleet and Predecessor Admission
### R13-F001 `R10_TARGET_RELEASE_RECEIPT_PRESENT`
- **Requirement:** r10 target release receipt present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F002 `R10_TARGET_RELEASE_RECEIPT_SHA256_VALID`
- **Requirement:** r10 target release receipt sha256 valid.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F003 `R10_TARGET_RELEASE_STATE_EXACT`
- **Requirement:** r10 target release state exact.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F004 `R10_TARGET_SOURCE_PASS_129`
- **Requirement:** r10 target source pass 129.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F005 `R10_TARGET_RELEASE_PASS_202`
- **Requirement:** r10 target release pass 202.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F006 `R10_TARGET_PENDING_ZERO`
- **Requirement:** r10 target pending zero.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F007 `R10_TARGET_FAIL_ZERO`
- **Requirement:** r10 target fail zero.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F008 `R9_TARGET_PHYSICAL_RECEIPT_PRESENT`
- **Requirement:** r9 target physical receipt present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F009 `R9_TARGET_PHYSICAL_PASS_187`
- **Requirement:** r9 target physical pass 187.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F010 `R12_SOURCE_RECEIPT_PRESENT`
- **Requirement:** r12 source receipt present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F011 `R12_SOURCE_PASS_168`
- **Requirement:** r12 source pass 168.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F012 `R12_INSTALLED_CAPABILITY_PRESENT`
- **Requirement:** r12 installed capability present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F013 `R11_SOURCE_RECEIPT_PRESENT`
- **Requirement:** r11 source receipt present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F014 `R11_SOURCE_PASS_148`
- **Requirement:** r11 source pass 148.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F015 `FLEET_ENROLLMENT_REGISTRY_PRESENT`
- **Requirement:** fleet enrollment registry present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F016 `FLEET_ENROLLMENT_REGISTRY_SIGNATURE_VALID`
- **Requirement:** fleet enrollment registry signature valid.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F017 `FLEET_ENROLLMENT_REGISTRY_SELF_HASH_VALID`
- **Requirement:** fleet enrollment registry self hash valid.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F018 `FLEET_ENROLLED_COUNT_NONZERO`
- **Requirement:** fleet enrolled count nonzero.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F019 `FLEET_DUPLICATE_ENROLLMENT_ZERO`
- **Requirement:** fleet duplicate enrollment zero.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F020 `FLEET_HARDWARE_SERIAL_FIELDS_ZERO`
- **Requirement:** fleet hardware serial fields zero.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F021 `FLEET_USER_IDENTITY_FIELDS_ZERO`
- **Requirement:** fleet user identity fields zero.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F022 `SOURCE_RELEASE_SET_NONEMPTY`
- **Requirement:** source release set nonempty.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F023 `SOURCE_RELEASES_ALL_R10_QUALIFIED`
- **Requirement:** source releases all r10 qualified.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F024 `TARGET_RELEASE_DISTINCT_FROM_SOURCE`
- **Requirement:** target release distinct from source.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F025 `TARGET_PACKAGE_CONTENT_ID_EXACT`
- **Requirement:** target package content id exact.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F026 `ROLLOUT_OPERATOR_APPROVAL_PRESENT`
- **Requirement:** rollout operator approval present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F027 `ROLLOUT_PLAN_PRESENT`
- **Requirement:** rollout plan present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F028 `ROLLOUT_PLAN_SIGNATURE_VALID`
- **Requirement:** rollout plan signature valid.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F029 `ROLLOUT_PLAN_GENERATION_INITIALIZED`
- **Requirement:** rollout plan generation initialized.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F030 `ROLLOUT_LEDGER_GENESIS_PRESENT`
- **Requirement:** rollout ledger genesis present.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F031 `ROLLOUT_CHILD_DIGESTS_COMPLETE`
- **Requirement:** rollout child digests complete.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.
### R13-F032 `FLEET_PREDECESSOR_ADMISSION_RECEIPT_SEALED`
- **Requirement:** fleet predecessor admission receipt sealed.
- **Assertion:** The target release is R9/R10-qualified, the fleet registry is privacy-safe and signed, and all source installations are explicitly admitted before any cohort lease is issued.
- **Evidence:** `R13_FLEET_PREDECESSOR_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_NOT_QUALIFIED`; the rollout does not advance.

## F Group: Rollout Plan and Canary Ring Admission
### R13-F033 `ROLLOUT_PLAN_ID_EXACT`
- **Requirement:** rollout plan id exact.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F034 `ROLLOUT_PLAN_DIGEST_RECOMPUTED`
- **Requirement:** rollout plan digest recomputed.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F035 `ROLLOUT_PLAN_GENERATION_MATCH`
- **Requirement:** rollout plan generation match.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F036 `ROLLOUT_PLAN_RAW_HASH_MATCH`
- **Requirement:** rollout plan raw hash match.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F037 `ROLLOUT_TARGET_BUILD_MATCH_R10`
- **Requirement:** rollout target build match r10.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F038 `ROLLOUT_TARGET_PACKAGE_MATCH_R10`
- **Requirement:** rollout target package match r10.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F039 `ROLLOUT_SOURCE_SET_MATCH_FLEET`
- **Requirement:** rollout source set match fleet.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F040 `ROLLOUT_RING_ORDER_EXACT`
- **Requirement:** rollout ring order exact.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F041 `LAB_RING_TARGET_VALID`
- **Requirement:** lab ring target valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F042 `CANARY_RING_TARGET_VALID`
- **Requirement:** canary ring target valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F043 `EARLY_RING_TARGET_VALID`
- **Requirement:** early ring target valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F044 `BROAD_RING_TARGET_VALID`
- **Requirement:** broad ring target valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F045 `MAJORITY_RING_TARGET_VALID`
- **Requirement:** majority ring target valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F046 `FULL_RING_TARGET_10000_BPS`
- **Requirement:** full ring target 10000 bps.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F047 `RING_TARGETS_STRICTLY_MONOTONIC`
- **Requirement:** ring targets strictly monotonic.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F048 `RING_MIN_COUNTS_VALID`
- **Requirement:** ring min counts valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F049 `RING_MIN_SESSIONS_VALID`
- **Requirement:** ring min sessions valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F050 `RING_MIN_DWELL_VALID`
- **Requirement:** ring min dwell valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F051 `RING_COVERAGE_THRESHOLDS_VALID`
- **Requirement:** ring coverage thresholds valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F052 `SMALL_FLEET_PROFILE_EXPLICIT`
- **Requirement:** small fleet profile explicit.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F053 `LARGE_FLEET_PROFILE_EXPLICIT`
- **Requirement:** large fleet profile explicit.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F054 `COHORT_BUCKET_ASSIGNMENTS_COMPLETE`
- **Requirement:** cohort bucket assignments complete.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F055 `COHORT_BUCKET_RANGE_VALID`
- **Requirement:** cohort bucket range valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F056 `COHORT_ASSIGNMENT_HMAC_VALID`
- **Requirement:** cohort assignment hmac valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F057 `COHORT_ASSIGNMENT_STABLE_WITHIN_ROLLOUT`
- **Requirement:** cohort assignment stable within rollout.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F058 `COHORT_ASSIGNMENT_CHANGES_ACROSS_ROLLOUTS`
- **Requirement:** cohort assignment changes across rollouts.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F059 `ROLLOUT_PSEUDONYMS_UNIQUE`
- **Requirement:** rollout pseudonyms unique.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F060 `ROLLOUT_PSEUDONYM_RAW_ID_ABSENT`
- **Requirement:** rollout pseudonym raw id absent.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F061 `LAB_RING_OPERATOR_LIST_EXPLICIT`
- **Requirement:** lab ring operator list explicit.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F062 `LAB_RING_NO_RANDOM_USER_SELECTION`
- **Requirement:** lab ring no random user selection.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F063 `CANARY_RING_BASIS_POINT_SELECTION_EXACT`
- **Requirement:** canary ring basis point selection exact.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F064 `EARLY_RING_SUPERSET_CANARY`
- **Requirement:** early ring superset canary.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F065 `BROAD_RING_SUPERSET_EARLY`
- **Requirement:** broad ring superset early.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F066 `MAJORITY_RING_SUPERSET_BROAD`
- **Requirement:** majority ring superset broad.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F067 `FULL_RING_COVERS_ALL_ELIGIBLE`
- **Requirement:** full ring covers all eligible.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F068 `RING_ADMISSION_GENERATION_ZERO`
- **Requirement:** ring admission generation zero.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F069 `RING_STATE_LAB_ACTIVE`
- **Requirement:** ring state lab active.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F070 `UNADMITTED_INSTALLATIONS_RETAIN_SOURCE`
- **Requirement:** unadmitted installations retain source.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F071 `RING_ADMISSION_RECEIPT_SELF_HASH_VALID`
- **Requirement:** ring admission receipt self hash valid.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.
### R13-F072 `ROLLOUT_PLAN_ADMISSION_RECEIPT_SEALED`
- **Requirement:** rollout plan admission receipt sealed.
- **Assertion:** The signed plan deterministically assigns privacy-scoped cohorts, preserves source operation for non-admitted installations, and opens only the first authorized ring.
- **Evidence:** `R13_ROLLOUT_PLAN_ADMISSION_RECEIPT.json`.
- **Failure:** `E_R13_RING_PLAN_ADMISSION_FAILED`; the rollout does not advance.

## F Group: Installation Admission Lease and Local R10/R12/R11 Chain
### R13-F073 `LEASE_BATCH_GENERATION_MATCH_PLAN`
- **Requirement:** lease batch generation match plan.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F074 `LEASE_BATCH_RING_MATCH_ACTIVE`
- **Requirement:** lease batch ring match active.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F075 `LEASE_BATCH_SIGNATURE_VALID`
- **Requirement:** lease batch signature valid.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F076 `LEASE_BATCH_COUNT_MATCH_RING_DELTA`
- **Requirement:** lease batch count match ring delta.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F077 `LEASE_INSTALLATION_PSEUDONYMS_UNIQUE`
- **Requirement:** lease installation pseudonyms unique.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F078 `LEASE_COHORT_BUCKETS_MATCH_ASSIGNMENT`
- **Requirement:** lease cohort buckets match assignment.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F079 `LEASE_TARGET_BUILD_MATCH_PLAN`
- **Requirement:** lease target build match plan.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F080 `LEASE_TARGET_PACKAGE_MATCH_PLAN`
- **Requirement:** lease target package match plan.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F081 `LEASE_SOURCE_BUILD_MATCH_LOCAL_POINTER`
- **Requirement:** lease source build match local pointer.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F082 `LEASE_LOCAL_R10_GENERATION_MATCH`
- **Requirement:** lease local r10 generation match.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F083 `LEASE_LOCAL_R10_RAW_HASH_MATCH`
- **Requirement:** lease local r10 raw hash match.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F084 `LEASE_NOT_BEFORE_VALID`
- **Requirement:** lease not before valid.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F085 `LEASE_EXPIRY_VALID`
- **Requirement:** lease expiry valid.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F086 `LEASE_SINGLE_USE_NONCES_UNIQUE`
- **Requirement:** lease single use nonces unique.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F087 `LEASE_REVOKED_COUNT_ZERO_AT_ISSUE`
- **Requirement:** lease revoked count zero at issue.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F088 `LEASE_REPLAY_COUNT_ZERO`
- **Requirement:** lease replay count zero.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F089 `LEASE_WRONG_INSTALLATION_REJECTED`
- **Requirement:** lease wrong installation rejected.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F090 `LEASE_WRONG_RING_REJECTED`
- **Requirement:** lease wrong ring rejected.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F091 `LEASE_WRONG_PACKAGE_REJECTED`
- **Requirement:** lease wrong package rejected.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F092 `LEASE_STALE_POINTER_REJECTED`
- **Requirement:** lease stale pointer rejected.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F093 `LOCAL_R10_ADMISSION_STARTED`
- **Requirement:** local r10 admission started.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F094 `LOCAL_R10_CAS_INPUTS_MATCH_LEASE`
- **Requirement:** local r10 cas inputs match lease.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F095 `LOCAL_R10_PROMOTION_RECEIPT_PRESENT`
- **Requirement:** local r10 promotion receipt present.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F096 `LOCAL_R10_PROMOTION_STATE_EXACT`
- **Requirement:** local r10 promotion state exact.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F097 `LOCAL_R10_POINTER_GENERATION_INCREMENTED`
- **Requirement:** local r10 pointer generation incremented.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F098 `LOCAL_R10_ACTIVE_PACKAGE_MATCH_TARGET`
- **Requirement:** local r10 active package match target.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F099 `LOCAL_R10_PRODUCTION_POINTER_MUTATED_LOCALLY_ONLY`
- **Requirement:** local r10 production pointer mutated locally only.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F100 `R13_REMOTE_POINTER_MUTATION_ZERO`
- **Requirement:** r13 remote pointer mutation zero.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F101 `R12_UPDATE_TRANSACTION_CREATED`
- **Requirement:** r12 update transaction created.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F102 `R12_TARGET_PACKAGE_STAGED`
- **Requirement:** r12 target package staged.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F103 `R12_CLOSURE_VERIFIED`
- **Requirement:** r12 closure verified.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F104 `R12_STAGED_CANARY_PASS`
- **Requirement:** r12 staged canary pass.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F105 `R12_LOCAL_ACTIVATION_POINTER_CAS_PASS`
- **Requirement:** r12 local activation pointer cas pass.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F106 `R12_CROSS_GENERATION_COUNT_ZERO`
- **Requirement:** r12 cross generation count zero.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F107 `R12_INTERRUPTED_RECOVERY_STATUS_RECORDED`
- **Requirement:** r12 interrupted recovery status recorded.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F108 `R12_PRODUCTION_POINTER_MUTATION_ZERO`
- **Requirement:** r12 production pointer mutation zero.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F109 `R11_INSTALLED_ATTESTATION_PASS`
- **Requirement:** r11 installed attestation pass.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F110 `R11_STARTUP_CANARY_PASS`
- **Requirement:** r11 startup canary pass.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F111 `R11_RUNTIME_TOKEN_ISSUED`
- **Requirement:** r11 runtime token issued.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F112 `R11_QUARANTINED_FALSE`
- **Requirement:** r11 quarantined false.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F113 `R11_PACKAGE_MATCH_TARGET`
- **Requirement:** r11 package match target.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F114 `R11_DEVICE_EPOCH_RECORDED`
- **Requirement:** r11 device epoch recorded.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F115 `R11_VALIDATION_COUNTER_ZERO`
- **Requirement:** r11 validation counter zero.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F116 `R11_FAULT_SENTINEL_ZERO`
- **Requirement:** r11 fault sentinel zero.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F117 `R11_CPU_FALLBACK_ZERO`
- **Requirement:** r11 cpu fallback zero.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F118 `LOCAL_CHAIN_RECEIPT_DIGEST_BOUND`
- **Requirement:** local chain receipt digest bound.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F119 `LEASE_CONSUMED_ONCE`
- **Requirement:** lease consumed once.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F120 `LEASE_CONSUMPTION_LEDGER_APPEND`
- **Requirement:** lease consumption ledger append.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F121 `LEASE_EXPIRED_UNUSED_REJECTED`
- **Requirement:** lease expired unused rejected.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F122 `FAILED_LOCAL_CHAIN_NOT_COUNTED_SUCCESS`
- **Requirement:** failed local chain not counted success.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F123 `UNADMITTED_SOURCE_RUNTIME_REMAINS_VALID`
- **Requirement:** unadmitted source runtime remains valid.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.
### R13-F124 `LOCAL_CHAIN_BATCH_RECEIPT_SEALED`
- **Requirement:** local chain batch receipt sealed.
- **Assertion:** Each consumed lease drives one local R10 CAS, R12 atomic update, and R11 installed admission without any remote pointer mutation or cross-generation asset mix.
- **Evidence:** `R13_LOCAL_CHAIN_BATCH_RECEIPT.json`.
- **Failure:** `E_R13_LOCAL_CHAIN_FAILED`; the rollout does not advance.

## F Group: Fleet Evidence Collection and Integrity
### R13-F125 `EVIDENCE_WINDOW_ID_BOUND`
- **Requirement:** evidence window id bound.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F126 `EVIDENCE_WINDOW_START_COARSE`
- **Requirement:** evidence window start coarse.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F127 `EVIDENCE_WINDOW_END_COARSE`
- **Requirement:** evidence window end coarse.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F128 `EVIDENCE_RELEASE_ID_BOUND`
- **Requirement:** evidence release id bound.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F129 `EVIDENCE_RING_ID_BOUND`
- **Requirement:** evidence ring id bound.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F130 `EVIDENCE_PLAN_DIGEST_BOUND`
- **Requirement:** evidence plan digest bound.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F131 `EVIDENCE_INSTALLATION_PSEUDONYM_PRESENT`
- **Requirement:** evidence installation pseudonym present.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F132 `EVIDENCE_RAW_ENROLLMENT_ID_ABSENT`
- **Requirement:** evidence raw enrollment id absent.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F133 `EVIDENCE_SEQUENCE_MONOTONIC`
- **Requirement:** evidence sequence monotonic.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F134 `EVIDENCE_NONCE_UNIQUE`
- **Requirement:** evidence nonce unique.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F135 `EVIDENCE_SIGNATURE_VALID`
- **Requirement:** evidence signature valid.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F136 `EVIDENCE_SELF_HASH_VALID`
- **Requirement:** evidence self hash valid.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F137 `EVIDENCE_SCHEMA_VALID`
- **Requirement:** evidence schema valid.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F138 `EVIDENCE_ALLOWLIST_ONLY`
- **Requirement:** evidence allowlist only.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F139 `EVIDENCE_USER_IMAGE_BYTES_ZERO`
- **Requirement:** evidence user image bytes zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F140 `EVIDENCE_PIXEL_HASH_ZERO`
- **Requirement:** evidence pixel hash zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F141 `EVIDENCE_FILE_NAME_ZERO`
- **Requirement:** evidence file name zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F142 `EVIDENCE_USER_PATH_ZERO`
- **Requirement:** evidence user path zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F143 `EVIDENCE_EXIF_ZERO`
- **Requirement:** evidence exif zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F144 `EVIDENCE_ACCOUNT_ID_ZERO`
- **Requirement:** evidence account id zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F145 `EVIDENCE_PRECISE_LOCATION_ZERO`
- **Requirement:** evidence precise location zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F146 `EVIDENCE_HARDWARE_SERIAL_ZERO`
- **Requirement:** evidence hardware serial zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F147 `EVIDENCE_ADAPTER_FAMILY_BUCKET_VALID`
- **Requirement:** evidence adapter family bucket valid.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F148 `EVIDENCE_DRIVER_BUCKET_VALID`
- **Requirement:** evidence driver bucket valid.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F149 `EVIDENCE_TIME_BUCKET_VALID`
- **Requirement:** evidence time bucket valid.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F150 `EVIDENCE_R10_PROMOTION_COUNT_RECORDED`
- **Requirement:** evidence r10 promotion count recorded.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F151 `EVIDENCE_R12_ACTIVATION_COUNT_RECORDED`
- **Requirement:** evidence r12 activation count recorded.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F152 `EVIDENCE_R11_ADMISSION_COUNT_RECORDED`
- **Requirement:** evidence r11 admission count recorded.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F153 `EVIDENCE_STARTUP_CANARY_FAILURE_COUNT`
- **Requirement:** evidence startup canary failure count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F154 `EVIDENCE_VALIDATION_NONZERO_COUNT`
- **Requirement:** evidence validation nonzero count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F155 `EVIDENCE_ARTIFACT_DRIFT_COUNT`
- **Requirement:** evidence artifact drift count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F156 `EVIDENCE_CROSS_GENERATION_COUNT`
- **Requirement:** evidence cross generation count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F157 `EVIDENCE_DEVICE_LOSS_COUNT`
- **Requirement:** evidence device loss count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F158 `EVIDENCE_RENDERER_CRASH_COUNT`
- **Requirement:** evidence renderer crash count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F159 `EVIDENCE_GPU_CRASH_COUNT`
- **Requirement:** evidence gpu crash count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F160 `EVIDENCE_QUARANTINE_COUNT`
- **Requirement:** evidence quarantine count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F161 `EVIDENCE_SESSION_COUNT`
- **Requirement:** evidence session count.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F162 `EVIDENCE_EXPOSURE_DURATION_BUCKET`
- **Requirement:** evidence exposure duration bucket.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F163 `AGGREGATOR_DUPLICATE_ENVELOPE_ZERO`
- **Requirement:** aggregator duplicate envelope zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F164 `AGGREGATOR_REPLAY_ENVELOPE_ZERO`
- **Requirement:** aggregator replay envelope zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F165 `AGGREGATOR_STALE_SEQUENCE_ZERO`
- **Requirement:** aggregator stale sequence zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F166 `AGGREGATOR_WRONG_RELEASE_ZERO`
- **Requirement:** aggregator wrong release zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F167 `AGGREGATOR_WRONG_RING_ZERO`
- **Requirement:** aggregator wrong ring zero.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F168 `AGGREGATOR_LATE_EVIDENCE_SEPARATE`
- **Requirement:** aggregator late evidence separate.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F169 `AGGREGATOR_MISSING_EVIDENCE_EXPLICIT`
- **Requirement:** aggregator missing evidence explicit.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F170 `AGGREGATOR_INPUT_SET_DIGEST_SEALED`
- **Requirement:** aggregator input set digest sealed.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F171 `AGGREGATOR_EXACT_VIEW_SEALED`
- **Requirement:** aggregator exact view sealed.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.
### R13-F172 `EVIDENCE_WINDOW_RECEIPT_SEALED`
- **Requirement:** evidence window receipt sealed.
- **Assertion:** Each installation contributes only signed allowlisted release-scoped evidence; replay, duplicate, stale, wrong-ring, missing, and late evidence are separately accounted.
- **Evidence:** `R13_FLEET_EVIDENCE_WINDOW_RECEIPT.json`.
- **Failure:** `E_R13_FLEET_EVIDENCE_INVALID`; the rollout does not advance.

## F Group: Ring Advancement Quality Thresholds
### R13-F173 `ACTIVE_RING_ID_MATCH_PLAN`
- **Requirement:** active ring id match plan.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F174 `ACTIVE_RING_TARGET_COUNT_REACHED`
- **Requirement:** active ring target count reached.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F175 `ACTIVE_RING_MIN_INSTALLATIONS_REACHED`
- **Requirement:** active ring min installations reached.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F176 `ACTIVE_RING_MIN_SESSIONS_REACHED`
- **Requirement:** active ring min sessions reached.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F177 `ACTIVE_RING_MIN_DWELL_REACHED`
- **Requirement:** active ring min dwell reached.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F178 `ACTIVE_RING_EVIDENCE_COVERAGE_REACHED`
- **Requirement:** active ring evidence coverage reached.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F179 `ACTIVE_RING_UNKNOWN_INSTALLATIONS_ZERO`
- **Requirement:** active ring unknown installations zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F180 `ACTIVE_RING_CRITICAL_BREAKER_ZERO`
- **Requirement:** active ring critical breaker zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F181 `ARTIFACT_DRIFT_COUNT_ZERO`
- **Requirement:** artifact drift count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F182 `PACKAGE_DIGEST_MISMATCH_COUNT_ZERO`
- **Requirement:** package digest mismatch count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F183 `CROSS_GENERATION_COUNT_ZERO`
- **Requirement:** cross generation count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F184 `VALIDATION_NONZERO_COUNT_ZERO`
- **Requirement:** validation nonzero count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F185 `FAULT_SENTINEL_COUNT_ZERO`
- **Requirement:** fault sentinel count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F186 `NONFINITE_OUTPUT_COUNT_ZERO`
- **Requirement:** nonfinite output count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F187 `STARTUP_CANARY_FAILURE_COUNT_ZERO`
- **Requirement:** startup canary failure count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F188 `R12_RECOVERY_AMBIGUOUS_COUNT_ZERO`
- **Requirement:** r12 recovery ambiguous count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F189 `R11_SILENT_FALLBACK_COUNT_ZERO`
- **Requirement:** r11 silent fallback count zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F190 `UNAUTHORIZED_POINTER_MUTATION_ZERO`
- **Requirement:** unauthorized pointer mutation zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F191 `LEASE_REPLAY_COUNT_ZERO_ADVANCEMENT`
- **Requirement:** lease replay count zero advancement.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F192 `CONTAINMENT_DIRECTIVE_FOR_OTHER_RELEASE_ZERO`
- **Requirement:** containment directive for other release zero.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F193 `ACTIVATION_FAILURE_RATE_COMPUTED`
- **Requirement:** activation failure rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F194 `R11_ADMISSION_FAILURE_RATE_COMPUTED`
- **Requirement:** r11 admission failure rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F195 `RENDERER_CRASH_RATE_COMPUTED`
- **Requirement:** renderer crash rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F196 `GPU_CRASH_RATE_COMPUTED`
- **Requirement:** gpu crash rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F197 `DEVICE_LOSS_RATE_COMPUTED`
- **Requirement:** device loss rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F198 `QUARANTINE_RATE_COMPUTED`
- **Requirement:** quarantine rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F199 `ACTIVATION_FAILURE_WILSON_UPPER_COMPUTED`
- **Requirement:** activation failure wilson upper computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F200 `R11_FAILURE_WILSON_UPPER_COMPUTED`
- **Requirement:** r11 failure wilson upper computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F201 `RENDERER_CRASH_WILSON_UPPER_COMPUTED`
- **Requirement:** renderer crash wilson upper computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F202 `GPU_CRASH_WILSON_UPPER_COMPUTED`
- **Requirement:** gpu crash wilson upper computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F203 `DEVICE_LOSS_WILSON_UPPER_COMPUTED`
- **Requirement:** device loss wilson upper computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F204 `QUARANTINE_WILSON_UPPER_COMPUTED`
- **Requirement:** quarantine wilson upper computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F205 `SOURCE_BASELINE_WINDOW_PRESENT`
- **Requirement:** source baseline window present.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F206 `SOURCE_BASELINE_DIGEST_SEALED`
- **Requirement:** source baseline digest sealed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F207 `BASELINE_CRASH_RATE_COMPUTED`
- **Requirement:** baseline crash rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F208 `BASELINE_DEVICE_LOSS_RATE_COMPUTED`
- **Requirement:** baseline device loss rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F209 `BASELINE_QUARANTINE_RATE_COMPUTED`
- **Requirement:** baseline quarantine rate computed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F210 `TARGET_CRASH_NOT_ABOVE_POLICY`
- **Requirement:** target crash not above policy.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F211 `TARGET_DEVICE_LOSS_NOT_ABOVE_POLICY`
- **Requirement:** target device loss not above policy.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F212 `TARGET_QUARANTINE_NOT_ABOVE_POLICY`
- **Requirement:** target quarantine not above policy.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F213 `LAB_ZERO_TOLERANCE_POLICY_PASS`
- **Requirement:** lab zero tolerance policy pass.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F214 `CANARY_ZERO_CRITICAL_POLICY_PASS`
- **Requirement:** canary zero critical policy pass.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F215 `EARLY_STATISTICAL_POLICY_PASS`
- **Requirement:** early statistical policy pass.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F216 `BROAD_STATISTICAL_POLICY_PASS`
- **Requirement:** broad statistical policy pass.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F217 `MAJORITY_STATISTICAL_POLICY_PASS`
- **Requirement:** majority statistical policy pass.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F218 `FULL_STATISTICAL_POLICY_PASS`
- **Requirement:** full statistical policy pass.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F219 `EVIDENCE_COVERAGE_NOT_INFERRED`
- **Requirement:** evidence coverage not inferred.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F220 `MISSING_EVIDENCE_NOT_DROPPED`
- **Requirement:** missing evidence not dropped.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F221 `LATE_EVIDENCE_NOT_BACKDATED`
- **Requirement:** late evidence not backdated.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F222 `RING_DECISION_INPUT_SET_FROZEN`
- **Requirement:** ring decision input set frozen.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F223 `RING_ADVANCE_OPERATOR_APPROVAL_PRESENT`
- **Requirement:** ring advance operator approval present.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.
### R13-F224 `RING_ADVANCEMENT_RECEIPT_SEALED`
- **Requirement:** ring advancement receipt sealed.
- **Assertion:** Ring advancement requires zero correctness or identity breakers, sufficient evidence coverage and dwell, bounded operational rates, frozen inputs, and explicit approval.
- **Evidence:** `R13_RING_ADVANCEMENT_RECEIPT.json`.
- **Failure:** `E_R13_RING_ADVANCEMENT_REJECTED`; the rollout does not advance.

## F Group: Privacy-Preserving Fleet Aggregation
### R13-F225 `DECISION_AGGREGATE_EXACT_COUNTS_PRESENT`
- **Requirement:** decision aggregate exact counts present.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F226 `DECISION_AGGREGATE_SIGNED_INPUT_ONLY`
- **Requirement:** decision aggregate signed input only.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F227 `DECISION_AGGREGATE_NO_RANDOM_NOISE`
- **Requirement:** decision aggregate no random noise.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F228 `PUBLIC_AGGREGATE_SEPARATE_FROM_DECISION`
- **Requirement:** public aggregate separate from decision.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F229 `PUBLIC_K_ANONYMITY_MINIMUM_5`
- **Requirement:** public k anonymity minimum 5.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F230 `PUBLIC_SMALL_CELL_SUPPRESSION`
- **Requirement:** public small cell suppression.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F231 `PUBLIC_RING_CELL_SUPPRESSION`
- **Requirement:** public ring cell suppression.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F232 `PUBLIC_ADAPTER_CELL_SUPPRESSION`
- **Requirement:** public adapter cell suppression.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F233 `PUBLIC_DRIVER_CELL_SUPPRESSION`
- **Requirement:** public driver cell suppression.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F234 `PUBLIC_TIME_BUCKET_COARSE`
- **Requirement:** public time bucket coarse.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F235 `PUBLIC_NO_INSTALLATION_PSEUDONYMS`
- **Requirement:** public no installation pseudonyms.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F236 `PUBLIC_NO_RAW_EVIDENCE_ENVELOPES`
- **Requirement:** public no raw evidence envelopes.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F237 `PUBLIC_NO_INSTALLATION_SEQUENCE`
- **Requirement:** public no installation sequence.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F238 `PUBLIC_NO_EXACT_EVENT_TIMESTAMPS`
- **Requirement:** public no exact event timestamps.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F239 `PUBLIC_NO_USER_CONTENT_FIELDS`
- **Requirement:** public no user content fields.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F240 `PUBLIC_NO_HARDWARE_SERIAL_FIELDS`
- **Requirement:** public no hardware serial fields.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F241 `PUBLIC_NO_PRECISE_DRIVER_STRING`
- **Requirement:** public no precise driver string.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F242 `PUBLIC_NO_PRECISE_GPU_NAME`
- **Requirement:** public no precise gpu name.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F243 `PUBLIC_TOTALS_CONSISTENT_AFTER_SUPPRESSION`
- **Requirement:** public totals consistent after suppression.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F244 `SUPPRESSION_MAP_RECORDED`
- **Requirement:** suppression map recorded.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F245 `SUPPRESSED_CELLS_NOT_ZERO_FILLED`
- **Requirement:** suppressed cells not zero filled.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F246 `OPT_IN_ENROLLMENT_RECEIPT_PRESENT`
- **Requirement:** opt in enrollment receipt present.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F247 `LOCAL_ONLY_INSTALLATIONS_EXCLUDED_EXPLICITLY`
- **Requirement:** local only installations excluded explicitly.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F248 `LOCAL_ONLY_NOT_COUNTED_FAILURE`
- **Requirement:** local only not counted failure.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F249 `LOCAL_ONLY_NOT_COUNTED_SUCCESS`
- **Requirement:** local only not counted success.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F250 `DATA_RETENTION_TTL_APPLIED`
- **Requirement:** data retention ttl applied.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F251 `EXPIRED_RAW_ENVELOPES_DELETED`
- **Requirement:** expired raw envelopes deleted.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F252 `AGGREGATE_RECEIPTS_RETAINED`
- **Requirement:** aggregate receipts retained.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F253 `ENROLLMENT_REVOCATION_APPLIED`
- **Requirement:** enrollment revocation applied.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F254 `ROLLOUT_PSEUDONYM_ROTATED_NEXT_ROLLOUT`
- **Requirement:** rollout pseudonym rotated next rollout.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F255 `EVIDENCE_KEY_ROTATION_APPLIED`
- **Requirement:** evidence key rotation applied.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F256 `COMPROMISED_KEY_REVOKED`
- **Requirement:** compromised key revoked.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F257 `REVOKED_KEY_EVIDENCE_REJECTED`
- **Requirement:** revoked key evidence rejected.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F258 `AGGREGATOR_ACCESS_LOG_PRESENT`
- **Requirement:** aggregator access log present.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F259 `AGGREGATOR_EXPORT_LOG_PRESENT`
- **Requirement:** aggregator export log present.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F260 `PRIVACY_POLICY_DIGEST_MATCH_PLAN`
- **Requirement:** privacy policy digest match plan.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F261 `PRIVACY_POLICY_CHANGE_REQUIRES_NEW_GENERATION`
- **Requirement:** privacy policy change requires new generation.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F262 `PRIVACY_NEGATIVE_FIELD_INJECTION_REJECTED`
- **Requirement:** privacy negative field injection rejected.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F263 `PRIVACY_SMALL_CELL_NEGATIVE_CONTROL_PASS`
- **Requirement:** privacy small cell negative control pass.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F264 `PRIVACY_PSEUDONYM_LINKAGE_TEST_PASS`
- **Requirement:** privacy pseudonym linkage test pass.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F265 `PUBLIC_AGGREGATE_SELF_HASH_VALID`
- **Requirement:** public aggregate self hash valid.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F266 `PUBLIC_AGGREGATE_SIGNATURE_VALID`
- **Requirement:** public aggregate signature valid.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F267 `PRIVACY_AUDIT_RECEIPT_SEALED`
- **Requirement:** privacy audit receipt sealed.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.
### R13-F268 `PRIVACY_PRESERVING_AGGREGATE_RECEIPT_SEALED`
- **Requirement:** privacy preserving aggregate receipt sealed.
- **Assertion:** Exact signed counts are used only for rollout decisions, while public or broad reports remove pseudonyms, suppress small cells, coarsen dimensions, and enforce retention and key revocation.
- **Evidence:** `R13_PRIVACY_PRESERVING_AGGREGATE_RECEIPT.json`.
- **Failure:** `E_R13_PRIVACY_AGGREGATION_FAILED`; the rollout does not advance.

## F Group: Bad-Release Containment and Rollback Coordination
### R13-F269 `BREAKER_EVENT_DETECTED_WITHIN_WINDOW`
- **Requirement:** breaker event detected within window.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F270 `BREAKER_DECISION_SEQUENCE_MONOTONIC`
- **Requirement:** breaker decision sequence monotonic.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F271 `ROLLOUT_PAUSE_STATE_ENTERED`
- **Requirement:** rollout pause state entered.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F272 `NEW_LEASE_ISSUANCE_STOPPED`
- **Requirement:** new lease issuance stopped.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F273 `UNCONSUMED_LEASES_REVOKED`
- **Requirement:** unconsumed leases revoked.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F274 `CONSUMED_LEASES_AUDITED`
- **Requirement:** consumed leases audited.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F275 `ACTIVE_RING_NOT_ADVANCED`
- **Requirement:** active ring not advanced.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F276 `LATER_RINGS_NOT_OPENED`
- **Requirement:** later rings not opened.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F277 `CONTAINMENT_DIRECTIVE_CREATED`
- **Requirement:** containment directive created.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F278 `CONTAINMENT_DIRECTIVE_SIGNATURE_VALID`
- **Requirement:** containment directive signature valid.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F279 `CONTAINMENT_DIRECTIVE_PLAN_DIGEST_MATCH`
- **Requirement:** containment directive plan digest match.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F280 `CONTAINMENT_DIRECTIVE_RELEASE_MATCH`
- **Requirement:** containment directive release match.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F281 `CONTAINMENT_DIRECTIVE_GENERATION_INCREMENTED`
- **Requirement:** containment directive generation incremented.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F282 `CONTAINMENT_DIRECTIVE_EXPIRY_VALID`
- **Requirement:** containment directive expiry valid.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F283 `CONTAINMENT_DIRECTIVE_REPLAY_REJECTED`
- **Requirement:** containment directive replay rejected.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F284 `CONTAINMENT_DIRECTIVE_OLDER_GENERATION_REJECTED`
- **Requirement:** containment directive older generation rejected.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F285 `CONTAINMENT_DIRECTIVE_R11_QUARANTINE_REQUEST_EXPLICIT`
- **Requirement:** containment directive r11 quarantine request explicit.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F286 `R11_REMOTE_DIRECTIVE_VALIDATION_PASS`
- **Requirement:** r11 remote directive validation pass.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F287 `R11_TARGET_RELEASE_MATCH_DIRECTIVE`
- **Requirement:** r11 target release match directive.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F288 `R11_NEW_JOB_ADMISSION_BLOCKED`
- **Requirement:** r11 new job admission blocked.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F289 `R11_EXISTING_RESULT_INVALIDATION_POLICY_RECORDED`
- **Requirement:** r11 existing result invalidation policy recorded.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F290 `R11_USER_CONTENT_NOT_UPLOADED`
- **Requirement:** r11 user content not uploaded.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F291 `ROLLBACK_RECOMMENDATION_BATCH_CREATED`
- **Requirement:** rollback recommendation batch created.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F292 `ROLLBACK_RECOMMENDATION_TARGETS_ONLY_AFFECTED_RELEASE`
- **Requirement:** rollback recommendation targets only affected release.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F293 `ROLLBACK_RECOMMENDATION_LOCAL_R10_GENERATION_BOUND`
- **Requirement:** rollback recommendation local r10 generation bound.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F294 `ROLLBACK_RECOMMENDATION_LOCAL_R10_HASH_BOUND`
- **Requirement:** rollback recommendation local r10 hash bound.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F295 `ROLLBACK_RECOMMENDATION_PREVIOUS_PACKAGE_QUALIFIED`
- **Requirement:** rollback recommendation previous package qualified.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F296 `ROLLBACK_RECOMMENDATION_R12_PREVIOUS_RECOVERABLE`
- **Requirement:** rollback recommendation r12 previous recoverable.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F297 `ROLLBACK_RECOMMENDATION_OPERATOR_POLICY_PRESENT`
- **Requirement:** rollback recommendation operator policy present.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F298 `ROLLBACK_RECOMMENDATION_POINTER_MUTATION_FALSE`
- **Requirement:** rollback recommendation pointer mutation false.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F299 `REMOTE_SILENT_ROLLBACK_COUNT_ZERO`
- **Requirement:** remote silent rollback count zero.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F300 `R13_PRODUCTION_POINTER_WRITE_ZERO`
- **Requirement:** r13 production pointer write zero.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F301 `R13_LOCAL_ACTIVATION_POINTER_WRITE_ZERO`
- **Requirement:** r13 local activation pointer write zero.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F302 `LOCAL_R10_ROLLBACK_RECEIPTS_COLLECTED`
- **Requirement:** local r10 rollback receipts collected.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F303 `LOCAL_R12_RECOVERY_RECEIPTS_COLLECTED`
- **Requirement:** local r12 recovery receipts collected.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F304 `LOCAL_R11_PREVIOUS_ADMISSION_RECEIPTS_COLLECTED`
- **Requirement:** local r11 previous admission receipts collected.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F305 `ROLLBACK_FAILED_INSTALLATIONS_EXPLICIT`
- **Requirement:** rollback failed installations explicit.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F306 `ROLLBACK_UNKNOWN_INSTALLATIONS_ZERO`
- **Requirement:** rollback unknown installations zero.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F307 `BAD_RELEASE_FURTHER_DOWNLOAD_BLOCKED`
- **Requirement:** bad release further download blocked.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F308 `BAD_RELEASE_CACHE_PIN_BLOCKED`
- **Requirement:** bad release cache pin blocked.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F309 `BAD_RELEASE_PLAN_STATUS_CONTAINED`
- **Requirement:** bad release plan status contained.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F310 `BAD_RELEASE_REISSUE_REQUIRES_NEW_BUILD`
- **Requirement:** bad release reissue requires new build.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F311 `BAD_RELEASE_REISSUE_REQUIRES_NEW_PACKAGE_ID`
- **Requirement:** bad release reissue requires new package id.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F312 `BAD_RELEASE_REISSUE_REQUIRES_NEW_R10_RECEIPT`
- **Requirement:** bad release reissue requires new r10 receipt.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F313 `CONTAINMENT_INPUT_SET_DIGEST_SEALED`
- **Requirement:** containment input set digest sealed.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F314 `CONTAINMENT_LEDGER_APPEND_ONLY`
- **Requirement:** containment ledger append only.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F315 `CONTAINMENT_OPERATOR_ACK_PRESENT`
- **Requirement:** containment operator ack present.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F316 `CONTAINMENT_PUBLIC_NOTICE_PRIVACY_FILTERED`
- **Requirement:** containment public notice privacy filtered.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F317 `CONTAINMENT_RECOVERY_RATE_COMPUTED`
- **Requirement:** containment recovery rate computed.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F318 `CONTAINMENT_RECOVERY_THRESHOLD_PASS`
- **Requirement:** containment recovery threshold pass.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F319 `CONTAINMENT_FINAL_STATE_EXACT`
- **Requirement:** containment final state exact.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.
### R13-F320 `BAD_RELEASE_CONTAINMENT_RECEIPT_SEALED`
- **Requirement:** bad release containment receipt sealed.
- **Assertion:** A critical release is paused, unconsumed leases are revoked, affected R11 runtimes are quarantined through signed directives, and rollback remains a local R10/R12/R11 chain.
- **Evidence:** `R13_BAD_RELEASE_CONTAINMENT_RECEIPT.json`.
- **Failure:** `E_R13_BAD_RELEASE_CONTAINMENT_FAILED`; the rollout does not advance.

## F Group: Full Rollout Finalization
### R13-F321 `ALL_RING_DECISION_RECEIPTS_PRESENT`
- **Requirement:** all ring decision receipts present.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F322 `LAB_RING_COMPLETED`
- **Requirement:** lab ring completed.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F323 `CANARY_RING_COMPLETED`
- **Requirement:** canary ring completed.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F324 `EARLY_RING_COMPLETED`
- **Requirement:** early ring completed.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F325 `BROAD_RING_COMPLETED`
- **Requirement:** broad ring completed.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F326 `MAJORITY_RING_COMPLETED`
- **Requirement:** majority ring completed.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F327 `FULL_RING_COMPLETED`
- **Requirement:** full ring completed.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F328 `RING_ORDER_NO_SKIP`
- **Requirement:** ring order no skip.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F329 `RING_GENERATIONS_MONOTONIC`
- **Requirement:** ring generations monotonic.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F330 `ROLLOUT_PLAN_NOT_MUTATED_IN_PLACE`
- **Requirement:** rollout plan not mutated in place.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F331 `FINAL_TARGET_ELIGIBLE_COUNT_RECORDED`
- **Requirement:** final target eligible count recorded.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F332 `FINAL_TARGET_ADMITTED_COUNT_RECORDED`
- **Requirement:** final target admitted count recorded.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F333 `FINAL_SOURCE_REMAINING_COUNT_RECORDED`
- **Requirement:** final source remaining count recorded.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F334 `FINAL_EXPLICIT_EXCLUSION_COUNT_RECORDED`
- **Requirement:** final explicit exclusion count recorded.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F335 `FINAL_UNKNOWN_COUNT_ZERO`
- **Requirement:** final unknown count zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F336 `FINAL_DUPLICATE_INSTALLATION_ZERO`
- **Requirement:** final duplicate installation zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F337 `FINAL_CRITICAL_BREAKER_ZERO`
- **Requirement:** final critical breaker zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F338 `FINAL_ARTIFACT_DRIFT_ZERO`
- **Requirement:** final artifact drift zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F339 `FINAL_CROSS_GENERATION_ZERO`
- **Requirement:** final cross generation zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F340 `FINAL_VALIDATION_NONZERO_ZERO`
- **Requirement:** final validation nonzero zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F341 `FINAL_CANARY_FAILURE_ZERO`
- **Requirement:** final canary failure zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F342 `FINAL_RECOVERY_AMBIGUOUS_ZERO`
- **Requirement:** final recovery ambiguous zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F343 `FINAL_UNAUTHORIZED_POINTER_WRITE_ZERO`
- **Requirement:** final unauthorized pointer write zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F344 `FINAL_REMOTE_SILENT_ROLLBACK_ZERO`
- **Requirement:** final remote silent rollback zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F345 `FINAL_EVIDENCE_COVERAGE_POLICY_PASS`
- **Requirement:** final evidence coverage policy pass.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F346 `FINAL_CRASH_RATE_POLICY_PASS`
- **Requirement:** final crash rate policy pass.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F347 `FINAL_DEVICE_LOSS_RATE_POLICY_PASS`
- **Requirement:** final device loss rate policy pass.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F348 `FINAL_QUARANTINE_RATE_POLICY_PASS`
- **Requirement:** final quarantine rate policy pass.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F349 `FINAL_PRIVACY_AUDIT_PASS`
- **Requirement:** final privacy audit pass.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F350 `FINAL_RAW_USER_CONTENT_ZERO`
- **Requirement:** final raw user content zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F351 `FINAL_PUBLIC_SMALL_CELL_SUPPRESSION_PASS`
- **Requirement:** final public small cell suppression pass.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F352 `FINAL_RETENTION_POLICY_APPLIED`
- **Requirement:** final retention policy applied.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F353 `FINAL_ROLLOUT_LEDGER_COMPLETE`
- **Requirement:** final rollout ledger complete.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F354 `FINAL_CHILD_ARTIFACT_DIGESTS_COMPLETE`
- **Requirement:** final child artifact digests complete.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F355 `FINAL_RECEIPT_SELF_HASH_VALID`
- **Requirement:** final receipt self hash valid.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F356 `FINAL_RECEIPT_SIGNATURE_VALID`
- **Requirement:** final receipt signature valid.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F357 `SOURCE_PASS_192`
- **Requirement:** source pass 192.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F358 `FLEET_PASS_408`
- **Requirement:** fleet pass 408.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F359 `PENDING_ZERO`
- **Requirement:** pending zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F360 `DEFERRED_ZERO`
- **Requirement:** deferred zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F361 `SKIPPED_ZERO`
- **Requirement:** skipped zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F362 `FAIL_ZERO`
- **Requirement:** fail zero.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F363 `PRODUCTION_POINTER_MUTATED_BY_R13_FALSE`
- **Requirement:** production pointer mutated by r13 false.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F364 `LOCAL_POINTER_MUTATED_BY_R13_FALSE`
- **Requirement:** local pointer mutated by r13 false.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F365 `ROLLBACK_RECOMMENDATION_AUTHORITY_R10`
- **Requirement:** rollback recommendation authority r10.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F366 `FINAL_STATE_EXACT`
- **Requirement:** final state exact.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F367 `NEXT_AUTHORITY_DECLARED`
- **Requirement:** next authority declared.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.
### R13-F368 `FLEET_ROLLOUT_FINAL_RECEIPT_SEALED`
- **Requirement:** fleet rollout final receipt sealed.
- **Assertion:** All rings complete in order, unresolved installations are zero, critical correctness failures remain zero, privacy controls hold, and the final receipt proves R13 never mutated local pointers.
- **Evidence:** `R13_FINAL_FLEET_ROLLOUT_RECEIPT.json`.
- **Failure:** `E_R13_FINAL_ROLLOUT_INCOMPLETE`; the rollout does not advance.

## F Group: Fleet Negative Controls
### R13-F369 `NEGATIVE_UNSIGNED_PLAN_REJECTED`
- **Requirement:** negative unsigned plan rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F370 `NEGATIVE_STALE_PLAN_GENERATION_REJECTED`
- **Requirement:** negative stale plan generation rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F371 `NEGATIVE_PLAN_HASH_MISMATCH_REJECTED`
- **Requirement:** negative plan hash mismatch rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F372 `NEGATIVE_RING_SKIP_REJECTED`
- **Requirement:** negative ring skip rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F373 `NEGATIVE_RING_REGRESSION_REJECTED`
- **Requirement:** negative ring regression rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F374 `NEGATIVE_UNSIGNED_LEASE_REJECTED`
- **Requirement:** negative unsigned lease rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F375 `NEGATIVE_LEASE_REPLAY_REJECTED`
- **Requirement:** negative lease replay rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F376 `NEGATIVE_LEASE_WRONG_INSTALLATION_REJECTED`
- **Requirement:** negative lease wrong installation rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F377 `NEGATIVE_LEASE_WRONG_PACKAGE_REJECTED`
- **Requirement:** negative lease wrong package rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F378 `NEGATIVE_LEASE_STALE_R10_REJECTED`
- **Requirement:** negative lease stale r10 rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F379 `NEGATIVE_EXPIRED_LEASE_REJECTED`
- **Requirement:** negative expired lease rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F380 `NEGATIVE_DUPLICATE_PSEUDONYM_REJECTED`
- **Requirement:** negative duplicate pseudonym rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F381 `NEGATIVE_EVIDENCE_REPLAY_REJECTED`
- **Requirement:** negative evidence replay rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F382 `NEGATIVE_EVIDENCE_SEQUENCE_ROLLBACK_REJECTED`
- **Requirement:** negative evidence sequence rollback rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F383 `NEGATIVE_EVIDENCE_WRONG_RING_REJECTED`
- **Requirement:** negative evidence wrong ring rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F384 `NEGATIVE_EVIDENCE_WRONG_RELEASE_REJECTED`
- **Requirement:** negative evidence wrong release rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F385 `NEGATIVE_EVIDENCE_USER_IMAGE_FIELD_REJECTED`
- **Requirement:** negative evidence user image field rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F386 `NEGATIVE_EVIDENCE_PIXEL_HASH_FIELD_REJECTED`
- **Requirement:** negative evidence pixel hash field rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F387 `NEGATIVE_EVIDENCE_FILE_PATH_FIELD_REJECTED`
- **Requirement:** negative evidence file path field rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F388 `NEGATIVE_EVIDENCE_HARDWARE_SERIAL_REJECTED`
- **Requirement:** negative evidence hardware serial rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F389 `NEGATIVE_MISSING_EVIDENCE_NOT_SUCCESS`
- **Requirement:** negative missing evidence not success.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F390 `NEGATIVE_LATE_EVIDENCE_NOT_BACKDATED`
- **Requirement:** negative late evidence not backdated.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F391 `NEGATIVE_CRITICAL_BREAKER_BLOCKS_ADVANCE`
- **Requirement:** negative critical breaker blocks advance.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F392 `NEGATIVE_VALIDATION_NONZERO_CONTAINS_RELEASE`
- **Requirement:** negative validation nonzero contains release.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F393 `NEGATIVE_ARTIFACT_DRIFT_CONTAINS_RELEASE`
- **Requirement:** negative artifact drift contains release.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F394 `NEGATIVE_CROSS_GENERATION_CONTAINS_RELEASE`
- **Requirement:** negative cross generation contains release.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F395 `NEGATIVE_R12_RECOVERY_AMBIGUOUS_CONTAINS_RELEASE`
- **Requirement:** negative r12 recovery ambiguous contains release.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F396 `NEGATIVE_PUBLIC_SMALL_CELL_DISCLOSURE_BLOCKED`
- **Requirement:** negative public small cell disclosure blocked.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F397 `NEGATIVE_SUPPRESSED_CELL_ZERO_FILL_BLOCKED`
- **Requirement:** negative suppressed cell zero fill blocked.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F398 `NEGATIVE_REVOKED_EVIDENCE_KEY_REJECTED`
- **Requirement:** negative revoked evidence key rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F399 `NEGATIVE_OLD_CONTAINMENT_DIRECTIVE_REJECTED`
- **Requirement:** negative old containment directive rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F400 `NEGATIVE_CONTAINMENT_WRONG_RELEASE_REJECTED`
- **Requirement:** negative containment wrong release rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F401 `NEGATIVE_R13_PRODUCTION_POINTER_WRITE_REJECTED`
- **Requirement:** negative r13 production pointer write rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F402 `NEGATIVE_R13_LOCAL_POINTER_WRITE_REJECTED`
- **Requirement:** negative r13 local pointer write rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F403 `NEGATIVE_REMOTE_SILENT_ROLLBACK_REJECTED`
- **Requirement:** negative remote silent rollback rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F404 `NEGATIVE_UNQUALIFIED_ROLLBACK_TARGET_REJECTED`
- **Requirement:** negative unqualified rollback target rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F405 `NEGATIVE_SPLIT_BRAIN_PLAN_DETECTED`
- **Requirement:** negative split brain plan detected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F406 `NEGATIVE_AGGREGATE_INPUT_MUTATION_DETECTED`
- **Requirement:** negative aggregate input mutation detected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F407 `NEGATIVE_FINAL_UNKNOWN_INSTALLATION_REJECTED`
- **Requirement:** negative final unknown installation rejected.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.
### R13-F408 `NEGATIVE_CONTROL_RECEIPT_SEALED`
- **Requirement:** negative control receipt sealed.
- **Assertion:** Adversarial plan, lease, evidence, privacy, breaker, split-brain, pointer-write, and rollback cases are rejected deterministically.
- **Evidence:** `R13_FLEET_NEGATIVE_CONTROL_RECEIPT.json`.
- **Failure:** `E_R13_NEGATIVE_CONTROL_NOT_DETECTED`; the rollout does not advance.


# 39. Gate Accounting

```text
R13-S001 .. R13-S192 = 192 SOURCE_MANDATORY
R13-F001 .. R13-F408 = 408 FLEET_MANDATORY
TOTAL = 600
```

Source bake에서 fleet gate는 `PASS`로 위조하지 않는다.

```text
SOURCE PASS = 192
FLEET PENDING = 408
FAIL = 0
```

Fleet final acceptance에서는 다음만 허용된다.

```text
SOURCE PASS = 192
FLEET PASS = 408
PENDING = 0
DEFERRED = 0
SKIPPED = 0
FAIL = 0
```

# 40. Implementation Order

1. R12 parent freeze와 R10·R11·R12 read-only admission adapter를 만든다.
2. Enrollment registry, rollout-scoped pseudonym, cohort HMAC authority를 만든다.
3. Rollout plan, ring state machine, append-only ledger, generation CAS를 만든다.
4. Signed single-use admission lease와 revocation ledger를 만든다.
5. Local R10·R12·R11 receipt-chain collector를 만든다.
6. Privacy allowlist evidence envelope와 signature/replay validator를 만든다.
7. Exact decision aggregator와 public privacy aggregate를 분리한다.
8. Evidence coverage, Wilson upper bound, baseline comparison, zero critical breaker gate를 만든다.
9. Hold, pause, lease revocation, containment directive를 만든다.
10. R11 quarantine request와 per-installation R10 rollback recommendation을 연결한다.
11. Small-fleet, large-fleet, offline export mode를 검증한다.
12. Negative controls와 split-brain drills를 실행한다.
13. Source 192 gate와 fleet 408 gate를 별도 finalizer로 봉인한다.

# 41. Final Seal Rule

R13은 다음 문장을 만족할 때만 완료다.

> 각 설치본은 privacy-scoped signed lease를 받은 경우에만 자신의 R10 authority로 target release에 진입하고, R12와 R11의 local 증거가 없으면 fleet success로 계산되지 않으며, correctness·identity breaker 한 건도 다음 ring으로 통과하지 못하고, bad release containment가 신규 노출을 즉시 멈추되 R13 자체는 어떤 local pointer도 원격으로 변경하지 않으며, 집계 영수증은 사용자 콘텐츠와 stable hardware identity를 포함하지 않는다.

# 42. Next Authority

```text
TDT-RESAMPLE-RUNTIME-01-R14

Signed Release Distribution /
Package Manifest Transparency Log /
Key Rotation and Revocation /
Mirror·CDN Byte Identity /
Supply-Chain Rollback Resistance Seal
```
