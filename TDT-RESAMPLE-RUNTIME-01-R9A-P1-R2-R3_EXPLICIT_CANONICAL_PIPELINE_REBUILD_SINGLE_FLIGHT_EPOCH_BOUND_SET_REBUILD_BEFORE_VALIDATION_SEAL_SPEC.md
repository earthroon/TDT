# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3

## Explicit Canonical Pipeline Rebuild Authority /
## Registry Single-Flight Build /
## Epoch-Bound Pipeline Set Receipt /
## EWA·Tensor·Adaptive Eager Reacquisition /
## Old Pipeline Reuse Denial /
## Rebuild-Before-Validation Seal

> 상태: 명세 rev.1
>
> 부모 패치: `TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2`
>
> 부모 번들: `63_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R2_JIT_PERMIT_FULL_FIELD_SENDER_TOMBSTONE_SOURCE_BAKED_AWAITING_EXTERNAL_BUILD_AND_THREE_CYCLE_PHYSICAL_GPU.zip`
>
> 부모 번들 SHA-256: `334591314e9bbc392eb0b6274912112de9e4344846d0f544178fa3abcb827b97`
>
> 부모 R2-R2 명세 SHA-256: `81abf90aecd2f1c814b9a9a94eb6fc98ded4cea4490c77655f76bdb17707162b`
>
> 부모 R2-R2 Bake Report SHA-256: `a578d119e45574ef0a5e1679aba43ce695a16e3406673332ae86109cef72237e`
>
> 부모 현재 상태: `360 ancestor SOURCE PASS / 86 R2-R1 SOURCE PASS / 120 R2-R2 SOURCE PASS / packaged physical 0 of 3 / external build HOLD`
>
> 패치 역할: R2-R2의 JIT permit·sender continuity·single-use tombstone을 유지하고, 새 device epoch가 ACTIVE가 된 뒤 canonical EWA·Structure Tensor·Adaptive Policy pipeline set을 명시적으로 단일 재빌드하여 recovery success와 validation admission 사이의 빈 공간을 폐쇄한다.
>
> 후속 분리 항목: full raw lifecycle finalizer·host output directory closure·cycle child artifact recursive replay는 `R2-R4`, recovery budget transactional rollback은 별도 후속 패치로 분리한다.
>
> 원칙: `new device != rebuilt pipeline`, `registry entry != ready pipeline set`, `BUILDING duplication != single-flight`, `recovered event != rebuild proof`, `lazy validation build != recovery rebuild`, `same epoch number != same device identity`.

---

# 0. 목적

부모 R2-R1과 R2-R2는 다음을 닫았다.

```text
scheduler idle != Preview success
encoder dispatch != Export terminal map pending
newer device epoch != matching recovery cycle
recovery completed != lost operation terminal rejected
plan intent != consumable permit
matching digest string != matching permit body
same window != same renderer document
consumed permit != reusable permit
```

그러나 현재 recovery holder의 `rebuild(identity)`는 실제 pipeline 재빌드를 수행하지 않는다.

현재 경로는 다음과 같다.

```text
old device loss
→ GPU Authority participant invalidate
→ canonical registry old entry invalidate
→ new device request and ACTIVE commit
→ holder rebuild callback
→ holder state REBUILDING
→ holder-rebuild ledger row 기록
→ holder state VALIDATING
→ GPU recovered event
→ 이후 validation fixture가 canonical resample을 호출할 때 lazy pipeline build
```

즉 현재 `REBUILDING`은 계산 자원의 물리적 재취득이 아니라 상태 문자열과 identity 기록이다.

이 구조에서는 다음 오염이 가능하다.

1. recovery success event가 canonical pipeline set 생성 전에 발행된다.
2. 첫 validation operation이 pipeline build 비용과 build failure를 대신 떠안는다.
3. 같은 epoch에 concurrent `pipesFor()`가 들어오면 BUILDING entry가 교체되어 중복 build와 orphan bundle이 생길 수 있다.
4. invalidation 중인 build Promise가 뒤늦게 resolve하면 registry 밖의 pipeline set이 살아남을 수 있다.
5. registry snapshot은 entry state만 노출하고 EWA·Tensor·Adaptive 구성 identity를 증명하지 않는다.
6. Adaptive pipeline bundle은 현재 runtime epoch, device epoch, device identity, pipeline identity를 직접 보유하지 않는다.
7. cycle closure receipt가 pipeline rebuild receipt를 부모 증거로 포함하지 않는다.
8. post-recovery Preview·Export validation이 exact rebuild receipt 없이 시작될 수 있다.

P1-R2-R3는 canonical pipeline registry를 **epoch-bound single-writer authority**로 승격하고, recovery participant rebuild 단계에서 EWA·Tensor·Adaptive 전체 set을 eager reacquire한다.

```text
R2-R2 exact permit consume
→ old epoch invalidation fence
→ new GPU identity ACTIVE
→ canonical pipeline rebuild request
→ one registry generation reservation
→ one single-flight build Promise
→ EWA + Tensor + Adaptive build
→ exact pipeline set identity extraction
→ rebuild receipt publication
→ participant rebuild set digest
→ GPU recovered event
→ lost operation terminal rejection
→ cycle closure
→ post-recovery validation admission
```

이 패치는 source wiring을 구현한 뒤에도 packaged Electron에서 Preview / Export / Preview 세 cycle을 수행하기 전까지 physical PASS를 주장하지 않는다.

---

# 1. 현재 코드에서 직접 확인된 사실

## 1.1 Holder rebuild callback은 pipeline을 만들지 않는다

현재 holder recovery participant는 다음 순서만 수행한다.

```text
state = REBUILDING
lastRecovered = identity
holder-rebuild ledger append
state = VALIDATING
```

다음 함수는 호출되지 않는다.

```text
createDeltaKStack(device)
rebuildCanonicalPipelineRegistry(...)
requireCanonicalPipelineReady(...)
```

따라서 현재 `holder-rebuild` row는 pipeline rebuild completion receipt가 아니다.

## 1.2 Canonical pipeline registry는 실행 요청 시 lazy build한다

현재 `executeCanonicalAdaptiveR1D()`는 `pipesFor(device, runtimeEpoch, deviceEpoch)`를 호출한다.

`pipesFor()`는 ACTIVE entry가 없을 때 `createDeltaKStack(device)`를 호출한다.

Recovery callback에서는 `pipesFor()`를 호출하지 않는다.

판정:

```text
pipeline rebuild authority = first post-recovery canonical execution
holder rebuild authority   = 없음
```

## 1.3 BUILDING entry는 single-flight가 아니다

현재 `pipesFor()`는 entry state가 ACTIVE가 아니면 기존 entry를 dispose하고 새 BUILDING entry를 만든다.

```text
call A → entry A BUILDING
call B → entry A replacement dispose
call B → entry B BUILDING
call A → createDeltaKStack resolve
call A → orphan entry A ACTIVE
call B → createDeltaKStack resolve
call B → registry entry B ACTIVE
```

두 caller가 하나의 Promise를 공유하지 않는다.

## 1.4 Build 완료와 registry ownership이 재검증되지 않는다

현재 build Promise가 resolve한 뒤 다음을 검사하지 않는다.

- entry가 여전히 registry의 current entry인지
- entry generation이 invalidation 이후에도 유효한지
- build 중 device epoch이 바뀌지 않았는지
- build 대상 device identity가 현재 GPU SSOT와 같은지
- entry가 INVALIDATED 또는 DISPOSED로 전이되지 않았는지

따라서 invalidation과 build resolve가 교차하면 late-completion bundle이 남을 수 있다.

## 1.5 Registry key는 device object WeakMap key를 포함하지만 receipt identity가 아니다

현재 key는 다음 형태다.

```text
runtimeEpoch:deviceEpoch:deviceKey(device)
```

`deviceKey(device)`는 renderer process 내부 WeakMap sequence다.

이 값은 runtime debugging에는 사용할 수 있지만 다음을 대신하지 못한다.

- canonical device identity
- adapter identity
- package closure identity
- recovery cycle identity
- cross-artifact replay identity

## 1.6 `createDeltaKStack()`은 세 pipeline family를 함께 만든다

현재 `createDeltaKStack(device)`는 `Promise.all()`로 다음을 생성한다.

```text
createEWAAnisoPipeline(device)
createStructureTensorR1CPipeline(device)
createAdaptivePolicyR1DPipeline(device)
```

그 뒤 Tensor와 Adaptive bundle을 `pipeEWA`에 부착한다.

```text
pipeEWA.tensorR1C = tensorR1C
pipeEWA.adaptivePolicyR1D = adaptivePolicyR1D
```

`pipeEWA.dispose()`는 세 family를 연쇄 dispose한다.

따라서 R2-R3의 canonical pipeline set authority는 EWA만 검사하면 안 된다.

## 1.7 EWA와 Tensor는 epoch identity를 보유한다

EWA bundle은 다음을 가진다.

```text
runtimeEpoch
deviceEpoch
deviceIdentity
layoutDigest
kernelContractDigest
generatedManifestDigest
pipelineIdentity set
```

Tensor bundle은 다음을 가진다.

```text
runtimeEpoch
deviceEpoch
deviceIdentity
pipelineIdentity
axialPipelineIdentity
shaderDigests
```

## 1.8 Adaptive bundle은 epoch identity가 부족하다

현재 Adaptive bundle은 다음만 반환한다.

```text
pipeline
shaderDigest
neutralQmap
dispose()
```

다음이 없다.

```text
runtimeEpoch
deviceEpoch
deviceIdentity
pipelineIdentity
abiId
fieldSchemaId
disposed
```

따라서 현재 상태로는 Adaptive pipeline이 새 epoch에 다시 만들어졌음을 bundle 자체로 증명할 수 없다.

## 1.9 GPU Authority는 new device를 ACTIVE로 commit한 뒤 participant rebuild를 호출한다

현재 GPU Authority recovery 순서는 다음이다.

```text
participant invalidate all
old raw device reference clear
requestAndCommitDevice('recovery')
new device state ACTIVE
queue onSubmittedWorkDone
participant rebuild all
device-recovered event
```

따라서 holder rebuild callback은 admitted GPU lease를 취득하여 새 guarded device를 사용할 수 있다.

## 1.10 GPU recovered event는 participant rebuild receipt set을 포함하지 않는다

현재 `RecoveryParticipant.rebuild()` 반환값은 `void`다.

GPU Authority는 rebuild callback을 await하지만 각 participant가 무엇을 재구성했는지 receipt를 수집하지 않는다.

따라서 현재 recovered event는 다음만 증명한다.

```text
all rebuild callbacks returned without throw
```

다음을 증명하지 않는다.

```text
canonical pipeline set identity
canonical pipeline rebuild receipt digest
registry generation
single-flight build count
old epoch active entry count = 0
```

## 1.11 Qualification runner는 recovery 뒤 validation operation을 실행한다

현재 runner는 cycle 완료와 closure acknowledgement 뒤 validation fixture를 publish하고 Preview와 Export를 실행한다.

그러나 validation admission 조건에 pipeline rebuild receipt digest가 없다.

## 1.12 Holder state transition은 전이표를 강제하지 않는다

현재 `#transition(next)`는 DISPOSED와 FAILED terminal만 검사한 뒤 임의 next state를 대입한다.

따라서 `REBUILDING → VALIDATING` 사이의 pipeline receipt 존재가 상태 전이 자체로 강제되지 않는다.

---

# 2. 목표와 비목표

## 2.1 목표

- canonical pipeline registry를 explicit authority API로 승격한다.
- registry key를 runtime epoch, device epoch, device identity 기반 canonical identity로 구성한다.
- 같은 key의 concurrent build가 하나의 Promise만 공유하도록 single-flight를 강제한다.
- BUILDING entry에 registry generation과 build token을 부여한다.
- invalidation 이후 late build completion을 자동 dispose하고 reject한다.
- recovery holder가 new device ACTIVE 직후 canonical pipeline set을 eager rebuild한다.
- rebuild 시 existing admitted owner `dadum.gpu.consumer.legacy-pipeline`의 lease를 사용한다.
- 새로운 GPU consumer authority를 추가하지 않는다.
- EWA·Tensor·Adaptive 전체 bundle identity를 추출한다.
- Adaptive bundle에 epoch·device·pipeline identity를 추가한다.
- pipeline set identity와 rebuild receipt를 canonical digest로 봉인한다.
- holder의 `REBUILDING → VALIDATING` 전이를 rebuild receipt 존재 조건으로 제한한다.
- GPU Authority가 participant rebuild receipt set을 정렬·digest하여 recovered event에 포함한다.
- holder recovery event digest와 cycle closure receipt가 pipeline rebuild receipt를 포함한다.
- post-recovery validation은 exact rebuild receipt 없이는 시작하지 못한다.
- old epoch entry, old bundle, stale lease, stale device object의 재사용을 거절한다.
- source gate가 concurrency, invalidation race, late completion, stale reuse를 실행형 negative control로 재현한다.
- packaged physical gate가 각 cycle마다 정확히 한 새 pipeline set을 관측한다.

## 2.2 비목표

- EWA shader 수학 또는 kernel contract 변경
- Tensor 알고리즘 또는 field schema 변경
- Adaptive policy 수학 변경
- GPU Authority adapter selection 정책 변경
- controlled-loss permit format 변경
- Preview terminal deferred 계약 변경
- Export terminal map hook 위치 변경
- recovery budget rollback transaction
- pipeline cache의 장기 LRU 또는 memory budget 정책
- analysis atlas, Q-wave, spectral, Hannakairo pipeline 전체 eager rebuild
- production uncontrolled device loss에 대한 사용자 UI 정책
- R2 전체 artifact finalizer의 전면 raw filesystem replay
- host export directory closure
- cryptographic signature 또는 remote attestation

---

# 3. 불변식

## 3.1 Registry single-writer

동일 canonical key에 대해 동시에 존재할 수 있는 build owner는 정확히 하나다.

```text
activeBuildOwnerCount(key) <= 1
```

## 3.2 Single-flight

동일 key의 concurrent caller는 동일 build Promise와 동일 final receipt를 공유한다.

```text
callerA.promise === callerB.promise
callerA.receiptDigest === callerB.receiptDigest
physicalBuildCount(key) === 1
```

## 3.3 Epoch exactness

ACTIVE entry는 GPU SSOT와 정확히 일치해야 한다.

```text
entry.runtimeEpoch === gpu.runtimeEpoch
entry.deviceEpoch === gpu.deviceEpoch
entry.deviceIdentity === gpu.deviceIdentity
entry.adapterIdentity === gpu.adapterIdentity
```

## 3.4 Full pipeline family closure

ACTIVE pipeline set은 다음 세 family를 모두 포함한다.

```text
EWA present
Tensor present
Adaptive present
```

하나라도 없으면 ACTIVE가 아니다.

## 3.5 Recovery eager build

controlled recovery에서 recovered event가 발행되기 전에 rebuild receipt가 존재해야 한다.

```text
pipelineRebuildReceipt.completedAtMs
< gpuRecoveredEvent.emittedAtMs
```

## 3.6 Old entry zero

새 epoch rebuild 완료 시 old epoch의 non-terminal entry는 0개여야 한다.

```text
oldEpochActiveCount = 0
oldEpochBuildingCount = 0
oldEpochInvalidatingCount = 0
```

## 3.7 Validation admission

post-recovery validation은 다음 receipt가 모두 exact match할 때만 시작한다.

```text
cycleBindingDigest
permitTombstoneDigest
pipelineRebuildReceiptDigest
pipelineSetIdentityDigest
participantRebuildSetDigest
new device identity
```

## 3.8 No silent lazy substitution

recovery rebuild가 실패한 뒤 첫 validation execution이 조용히 새 bundle을 lazy build해서 성공하면 안 된다.

```text
recovery rebuild failure
→ recovery failure event
→ holder FAILED
→ validation admission denied
```

## 3.9 Late completion disposal

invalidated BUILDING entry가 resolve하면 결과 bundle은 즉시 dispose되고 ACTIVE로 전이하지 않는다.

## 3.10 Receipt before state

Holder가 VALIDATING 상태로 들어가기 전에 rebuild receipt replay가 완료되어야 한다.

---

# 4. 권위 모델

## 4.1 GPU Device Authority

권위:

- current runtime epoch
- current device epoch
- current device identity
- adapter identity
- admitted GPU lease
- shader and pipeline factory cache
- recovery participant order
- participant rebuild set digest

비권위:

- canonical EWA·Tensor·Adaptive set completeness 판정
- compatibility registry generation
- pipeline set receipt body

## 4.2 Canonical Pipeline Registry Authority

신규 authority ID:

```text
tdt.resample.canonical-pipeline-registry.r2-r3.v1
```

권위:

- canonical registry key
- registry generation
- build sequence
- entry state
- single-flight Promise ownership
- EWA·Tensor·Adaptive set completeness
- pipeline set identity digest
- rebuild receipt digest
- invalidation fence token
- late completion disposal

## 4.3 Recovery Holder Authority

권위:

- cycle binding과 rebuild request 결합
- recovery rebuild 시작 시점
- rebuild receipt adoption
- holder state transition
- rebuild-before-validation admission
- cycle closure parent lineage

## 4.4 Qualification Runner

권위 아님:

- pipeline을 직접 생성하지 않는다.
- registry entry를 직접 mutate하지 않는다.
- rebuild receipt를 합성하지 않는다.
- missing rebuild를 validation call로 보충하지 않는다.

Runner는 exact receipt를 조회하고 검증만 한다.

## 4.5 Existing consumer owner 유지

Pipeline creation과 lease owner는 기존 manifest owner를 유지한다.

```text
dadum.gpu.consumer.legacy-pipeline
```

R2-R3 때문에 신규 owner ID를 추가하지 않는다.

---

# 5. Registry 상태 머신

## 5.1 Entry state

```ts
export type CanonicalPipelineRegistryEntryStateR2R3 =
  | 'BUILDING'
  | 'ACTIVE'
  | 'INVALIDATING'
  | 'INVALIDATED'
  | 'FAILED'
  | 'DISPOSED';
```

## 5.2 합법 전이

```text
ABSENT       → BUILDING
BUILDING     → ACTIVE
BUILDING     → INVALIDATING
BUILDING     → FAILED
INVALIDATING → INVALIDATED
INVALIDATED  → DISPOSED
ACTIVE       → INVALIDATING
FAILED       → DISPOSED
ACTIVE       → DISPOSED
```

## 5.3 금지 전이

```text
BUILDING → BUILDING replacement
INVALIDATED → ACTIVE
DISPOSED → ACTIVE
FAILED → ACTIVE
ACTIVE(old epoch) → ACTIVE(new epoch) in-place mutation
```

## 5.4 Registry generation

Registry mutation마다 단조 증가한다.

```text
registryGeneration += 1
```

generation은 다음 시점에 증가한다.

- BUILDING entry reservation
- invalidation start
- invalidation completion
- ACTIVE commit
- FAILED commit
- DISPOSED commit

## 5.5 Build token

각 physical build는 unique build token을 가진다.

```ts
interface CanonicalPipelineBuildTokenR2R3 {
  readonly registryGenerationAtReservation: number;
  readonly buildSequence: number;
  readonly entryKeyDigest: string;
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
}
```

build resolve 시 token이 current entry와 exact match하지 않으면 commit하지 않는다.

---

# 6. Canonical Registry Key

## 6.1 Key body

```ts
export interface CanonicalPipelineRegistryKeyR2R3 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.pipeline-registry-key.v1';
  readonly authorityId: 'tdt.resample.canonical-pipeline-registry.r2-r3.v1';
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly adapterIdentity: string;
  readonly ownerId: 'dadum.gpu.consumer.legacy-pipeline';
}
```

## 6.2 Key digest

```text
entryKeyDigest = SHA-256(canonicalJson(keyBody))
```

Map key는 `entryKeyDigest`를 사용한다.

WeakMap device sequence는 diagnostic field로만 유지할 수 있고 authority key에는 사용하지 않는다.

## 6.3 Object identity guard

동일 key digest라도 전달된 guarded device object가 entry의 build device와 다르면 거절한다.

이 guard는 canonical identity를 대체하지 않고 process-local alias 방지용이다.

---

# 7. Single-Flight Build 계약

## 7.1 Entry shape

```ts
interface CanonicalPipelineRegistryEntryR2R3 {
  readonly key: CanonicalPipelineRegistryKeyR2R3;
  readonly entryKeyDigest: string;
  readonly buildSequence: number;
  readonly reservationGeneration: number;
  readonly deviceObject: GPUDevice;
  state: CanonicalPipelineRegistryEntryStateR2R3;
  buildPromise: Promise<CanonicalPipelineBuildResultR2R3>;
  pipes: DeltaKPipelineSet | null;
  pipelineSetIdentity: CanonicalPipelineSetIdentityR2R3 | null;
  rebuildReceipt: CanonicalPipelineRebuildReceiptR2R3 | null;
  joinCount: number;
  invalidationReason: string | null;
  failureCode: string | null;
}
```

## 7.2 Existing BUILDING admission

동일 key의 BUILDING entry가 있으면 다음만 수행한다.

```text
entry.joinCount += 1
return entry.buildPromise
```

기존 entry를 dispose하거나 교체하지 않는다.

## 7.3 Existing ACTIVE admission

동일 key의 ACTIVE entry가 있고 exact identity와 completeness가 유효하면 기존 set을 반환한다.

Recovery eager mode에서는 cache hit을 성공으로 인정하지 않는다.

```text
mode = RECOVERY_EAGER
→ expected old epoch invalidated
→ current epoch buildSequence must be newly reserved for this cycle
```

동일 cycle의 duplicate caller만 same build Promise join을 허용한다.

## 7.4 Promise assignment order

`buildPromise`는 entry를 Map에 publish하기 전에 완성된 Promise reference로 설정한다.

금지:

```text
Map.set(entry with null promise)
→ await gap
→ promise assign
```

허용:

```text
entry shell create
→ buildPromise create
→ entry.buildPromise = buildPromise
→ Map.set(entry)
```

## 7.5 Build completion commit

resolve 뒤 다음을 모두 재검증한다.

- Map current entry object identity
- build token exact match
- entry state BUILDING
- registry generation not invalidated for token
- GPU identity exact match
- lease still current
- EWA·Tensor·Adaptive completeness
- pipeline set identity digest replay

하나라도 실패하면 result bundle을 dispose하고 reject한다.

## 7.6 Build failure

실패 시:

```text
entry.state = FAILED
failure code record
partial bundle dispose
Map current entry 확인
terminal snapshot publication
throw canonical StableRuntimeError
```

다음 caller가 같은 failed entry를 조용히 재사용하지 않는다.

---

# 8. Invalidation Fence

## 8.1 Invalidate request

```ts
export interface CanonicalPipelineInvalidationRequestR2R3 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.pipeline-invalidation-request.v1';
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly reason: string;
  readonly cycleBindingDigest: string | null;
}
```

## 8.2 Target selection

다음 세 값이 exact match하는 entry만 invalidation target이다.

```text
runtimeEpoch
deviceEpoch
deviceIdentity
```

Epoch 숫자만 같은 다른 device identity를 invalidate하면 안 된다.

## 8.3 BUILDING invalidation

BUILDING entry는 즉시 `INVALIDATING`으로 전이한다.

build Promise 자체를 강제 cancel할 수 없더라도 token은 revoke한다.

late resolve 시:

```text
built pipes dispose
entry INVALIDATED
entry DISPOSED
E_R9AP1R2R3_BUILD_INVALIDATED
```

## 8.4 ACTIVE invalidation

ACTIVE entry는 EWA root dispose를 한 번만 호출한다.

EWA dispose wrapper가 Tensor와 Adaptive를 연쇄 해제한다.

각 family의 disposal evidence를 snapshot에 기록한다.

## 8.5 Invalidation receipt

```ts
export interface CanonicalPipelineInvalidationReceiptR2R3 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.pipeline-invalidation-receipt.v1';
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly targetEntryCount: number;
  readonly buildingEntryCount: number;
  readonly activeEntryCount: number;
  readonly disposedEntryCount: number;
  readonly lateCompletionPendingCount: number;
  readonly cycleBindingDigest: string | null;
  readonly invalidationDigest: string;
  readonly selfSha256: string;
}
```

---

# 9. Adaptive Pipeline Identity 보강

## 9.1 신규 bundle fields

`createAdaptivePolicyR1DPipeline()` 반환값에 다음을 추가한다.

```ts
interface AdaptivePolicyPipelineBundleR2R3 {
  readonly schemaVersion: 2;
  readonly pipeline: GPUComputePipeline;
  readonly pipelineIdentity: string;
  readonly abiId: string;
  readonly fieldSchemaId: string;
  readonly shaderDigest: string;
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly neutralQmap: GPUTexture;
  readonly neutralQmapIdentity: string;
  readonly disposed: boolean;
  dispose(): void;
}
```

## 9.2 Identity source

identity는 pipeline 생성 직전 GPU Authority bridge의 `getCurrentIdentity()`에서 읽는다.

pipeline 생성 뒤 같은 identity를 다시 읽어 변경 여부를 확인한다.

중간에 epoch가 바뀌면 bundle을 dispose하고 실패한다.

## 9.3 Pipeline identity

```text
pipelineIdentity =
  tdt.adaptive-policy.r1d:
  + abiId:
  + fieldSchemaId:
  + shaderDigest:
  + runtimeEpoch:
  + deviceEpoch:
  + deviceIdentity
```

## 9.4 Idempotent dispose

Adaptive bundle dispose는 `disposed` flag를 검사하여 neutral texture를 한 번만 destroy한다.

---

# 10. Canonical Pipeline Set Identity

## 10.1 Set identity body

```ts
export interface CanonicalPipelineSetIdentityR2R3 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.pipeline-set-identity.v1';
  readonly authorityId: 'tdt.resample.canonical-pipeline-registry.r2-r3.v1';
  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly adapterIdentity: string;
  readonly ownerId: 'dadum.gpu.consumer.legacy-pipeline';
  readonly ewa: CanonicalEwaPipelineIdentityR2R3;
  readonly tensor: CanonicalTensorPipelineIdentityR2R3;
  readonly adaptive: CanonicalAdaptivePipelineIdentityR2R3;
  readonly pipelineFamilyCount: 3;
  readonly pipelineSetIdentityDigest: string;
  readonly selfSha256: string;
}
```

## 10.2 EWA identity

필수 fields:

```text
schemaVersion = 8
runtimeEpoch
deviceEpoch
deviceIdentity
layoutDigest
parameterAbiId
kernelContractId
kernelContractDigest
kernelId
generatorId
generatedManifestId
generatedManifestDigest
phaseConventionId
borderId
axialFieldSchemaId
axialInterpolationId
canonical.pipelineIdentity
tiledR4.pipelineIdentity
tiledR6.pipelineIdentity
validationR4.pipelineIdentity
validationR6.pipelineIdentity
reference.pipelineIdentity
comparator.pipelineIdentity
```

모든 required pipeline identity가 non-empty여야 한다.

## 10.3 Tensor identity

필수 fields:

```text
runtimeEpoch
deviceEpoch
deviceIdentity
abiId
fieldSchemaId
axialFieldSchemaId
pipelineIdentity
axialPipelineIdentity
shaderDigests sorted map
```

## 10.4 Adaptive identity

필수 fields:

```text
runtimeEpoch
deviceEpoch
deviceIdentity
abiId
fieldSchemaId
pipelineIdentity
shaderDigest
neutralQmapIdentity
disposed = false
```

## 10.5 Set digest

각 family identity를 canonical key order로 정렬한 뒤 전체 set digest를 계산한다.

```text
pipelineSetIdentityDigest = SHA-256(canonicalJson(bodyWithoutDigestAndSelf))
selfSha256 = SHA-256(canonicalJson(bodyWithDigest))
```

## 10.6 No object serialization

GPU object, Promise, function, WeakMap key는 identity body에 들어가지 않는다.

---

# 11. Explicit Eager Rebuild API

## 11.1 Exported API

`resample_compatibility_r1d.mjs`는 다음 API를 제공한다.

```ts
export async function rebuildCanonicalPipelineRegistryR9AP1R2R3(
  request: CanonicalPipelineRebuildRequestR2R3,
): Promise<CanonicalPipelineRebuildResultR2R3>;

export function requireCanonicalPipelineRegistryReadyR9AP1R2R3(
  request: CanonicalPipelineReadyRequestR2R3,
): CanonicalPipelineRebuildReceiptR2R3;

export function invalidateCanonicalPipelineRegistryR9AP1R2R3(
  request: CanonicalPipelineInvalidationRequestR2R3,
): CanonicalPipelineInvalidationReceiptR2R3;

export function canonicalPipelineRegistrySnapshotR9AP1R2R3():
  CanonicalPipelineRegistrySnapshotR2R3;
```

기존 R2 API는 compatibility wrapper로 유지할 수 있으나 R2-R3 holder는 신규 API만 사용한다.

## 11.2 Rebuild request

```ts
export interface CanonicalPipelineRebuildRequestR2R3 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.pipeline-rebuild-request.v1';
  readonly mode: 'RECOVERY_EAGER';
  readonly runId: string;
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly cycleBindingDigest: string;
  readonly permitTombstoneDigest: string;
  readonly ownerBindingDigest: string;
  readonly packageClosureDigest: string;
  readonly expectedRuntimeEpoch: number;
  readonly expectedOldDeviceEpoch: number;
  readonly expectedNewDeviceEpoch: number;
  readonly expectedDeviceIdentity: string;
  readonly expectedAdapterIdentity: string;
  readonly leaseIdDigest: string;
  readonly requestedAtMs: number;
  readonly requestDigest: string;
  readonly selfSha256: string;
  readonly device: GPUDevice;
}
```

`device`는 digest body에서 제외하고 process-local guarded reference로만 전달한다.

Serializable request body와 device reference는 별도 인자로 나누어도 된다.

## 11.3 Admission

다음 순서로 검사한다.

1. exact key set
2. request digest replay
3. request self-hash replay
4. mode exact
5. cycle ordinal range
6. 64-hex lineage fields
7. GPU bridge current identity
8. runtime epoch exact
9. device epoch exact
10. device identity exact
11. adapter identity exact
12. expected new epoch = expected old epoch + 1
13. guarded device access 가능
14. old epoch non-terminal entry zero 또는 invalidation terminal
15. same cycle existing build admission

## 11.4 Lease

Holder는 다음 owner로 lease를 취득한다.

```text
ownerId = dadum.gpu.consumer.legacy-pipeline
purpose = r9a-p1-r2-r3-explicit-rebuild
```

Lease는 rebuild 완료와 receipt replay 뒤 release한다.

raw device alias를 global에 보관하지 않는다.

## 11.5 Rebuild result

```ts
export interface CanonicalPipelineRebuildResultR2R3 {
  readonly pipes: DeltaKPipelineSet;
  readonly pipelineSetIdentity: CanonicalPipelineSetIdentityR2R3;
  readonly rebuildReceipt: CanonicalPipelineRebuildReceiptR2R3;
}
```

---

# 12. Pipeline Rebuild Receipt

## 12.1 Receipt body

```ts
export interface CanonicalPipelineRebuildReceiptR2R3 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.pipeline-rebuild-receipt.v1';
  readonly patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3';
  readonly authorityId: 'tdt.resample.canonical-pipeline-registry.r2-r3.v1';
  readonly mode: 'RECOVERY_EAGER';
  readonly runId: string;
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly cycleBindingDigest: string;
  readonly permitTombstoneDigest: string;
  readonly ownerBindingDigest: string;
  readonly packageClosureDigest: string;
  readonly runtimeEpoch: number;
  readonly oldDeviceEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly adapterIdentity: string;
  readonly entryKeyDigest: string;
  readonly registryGeneration: number;
  readonly buildSequence: number;
  readonly physicalBuildCount: 1;
  readonly singleFlightJoinCount: number;
  readonly oldEpochActiveCount: 0;
  readonly oldEpochBuildingCount: 0;
  readonly currentEpochActiveCount: 1;
  readonly pipelineFamilyCount: 3;
  readonly pipelineSetIdentityDigest: string;
  readonly invalidationReceiptDigest: string;
  readonly startedAtMs: number;
  readonly completedAtMs: number;
  readonly durationMs: number;
  readonly rebuildDigest: string;
  readonly selfSha256: string;
}
```

## 12.2 Physical build count

Recovery eager cycle에서 physical build count는 정확히 1이어야 한다.

동일 cycle의 duplicate observer join은 `singleFlightJoinCount`만 증가시킨다.

## 12.3 Current epoch active count

Canonical registry authority 범위에서 current epoch ACTIVE set은 정확히 하나다.

## 12.4 Receipt publication

Receipt는 ACTIVE commit 이후에만 publish한다.

BUILDING 또는 partially compiled set은 receipt를 가질 수 없다.

---

# 13. Recovery Participant Receipt Set

## 13.1 Interface 확장

GPU recovery participant의 rebuild 반환값을 optional receipt reference로 확장한다.

```ts
export interface RecoveryParticipantRebuildEvidence {
  readonly participantId: string;
  readonly receiptSchemaId: string;
  readonly receiptDigest: string;
}

interface RecoveryParticipant {
  readonly participantId: string;
  readonly order?: number;
  invalidate(reason: ...): Promise<void> | void;
  rebuild?(identity: GpuAuthorityIdentitySnapshot):
    | Promise<RecoveryParticipantRebuildEvidence | void>
    | RecoveryParticipantRebuildEvidence
    | void;
}
```

## 13.2 GPU Authority collection

GPU Authority는 participant order 순으로 rebuild를 await한다.

non-void evidence를 수집하여 `participantId` 기준 canonical sort한다.

```text
participantRebuildSetDigest = SHA-256(canonicalJson(sortedEvidenceRows))
```

## 13.3 Recovered event extension

Recovered event에 다음을 추가한다.

```text
participantRebuildReceiptCount
participantRebuildReceipts
participantRebuildSetDigest
```

R2-R3 controlled cycle에서는 holder participant receipt가 반드시 포함되어야 한다.

## 13.4 Holder participant evidence

Holder rebuild callback은 다음을 반환한다.

```ts
{
  participantId: 'dadum.runtime.r9a-p1-r2-recovery-holder',
  receiptSchemaId: 'tdt.r9a-p1-r2-r3.pipeline-rebuild-receipt.v1',
  receiptDigest: rebuildReceipt.rebuildDigest,
}
```

---

# 14. Holder 통합

## 14.1 Active cycle 확장

```ts
interface ActiveCycleR2R3 extends ActiveCycleR2R2 {
  pipelineInvalidationReceipt: CanonicalPipelineInvalidationReceiptR2R3 | null;
  pipelineRebuildReceipt: CanonicalPipelineRebuildReceiptR2R3 | null;
  pipelineSetIdentity: CanonicalPipelineSetIdentityR2R3 | null;
  participantRebuildSetDigest: string | null;
}
```

## 14.2 Invalidate callback

Holder invalidate는 다음을 수행한다.

```text
assert active cycle exists
assert reason identity = active binding old identity
transition INVALIDATING
invalidateCanonicalPipelineRegistryR9AP1R2R3(exact request)
replay invalidation receipt
store invalidation receipt
record ledger
transition REACQUIRING
```

## 14.3 Rebuild callback

Holder rebuild는 다음 순서를 강제한다.

```text
assert state REACQUIRING
assert active cycle exists
assert new identity exact binding
transition REBUILDING
acquire admitted legacy-pipeline lease
seal rebuild request
call explicit rebuild API
lease.assertCurrent()
replay pipeline set identity
replay rebuild receipt
store receipt and identity
release lease
transition VALIDATING
return participant evidence
```

## 14.4 Rebuild failure

어느 단계든 실패하면:

```text
record holder-rebuild-failed
store canonical StableRuntimeError
transition FAILED
release lease
throw
```

GPU Authority는 recovered event를 발행하지 않고 recovery-failed event를 발행한다.

## 14.5 Holder legal transition table

```text
READY → ARMING
ARMING → OPERATION_PENDING
OPERATION_PENDING → LOSS_INJECTED
LOSS_INJECTED → INVALIDATING
INVALIDATING → REACQUIRING
REACQUIRING → REBUILDING
REBUILDING → VALIDATING only with valid rebuild receipt
VALIDATING → READY only after recovery + operation terminal
any non-terminal → FAILED on canonical failure
FAILED → DISPOSED
READY → DISPOSED
```

다른 전이는 `E_R9AP1R2R3_HOLDER_STATE_TRANSITION`으로 거절한다.

## 14.6 `holder-rebuild` row 교체

기존 identity-only `holder-rebuild` row를 폐기한다.

신규 row:

```text
holder-pipeline-rebuild-completed-r2-r3
```

필수 fields:

```text
cycleOrdinal
cycleBindingDigest
oldDeviceEpoch
newDeviceEpoch
deviceIdentity
adapterIdentity
registryGeneration
buildSequence
pipelineSetIdentityDigest
pipelineRebuildReceiptDigest
invalidationReceiptDigest
```

---

# 15. Recovery Event Correlation 확장

## 15.1 Holder recovery event digest

기존 digest body에 다음을 추가한다.

```text
pipelineRebuildReceiptDigest
pipelineSetIdentityDigest
participantRebuildSetDigest
registryGeneration
buildSequence
```

## 15.2 Exact event admission

Holder가 recovered event를 받을 때 다음을 확인한다.

- event cycle binding digest exact
- owner binding digest exact
- permit digest exact
- tombstone digest exact
- new device identity exact
- holder rebuild receipt digest가 participant set에 포함
- event participant rebuild set digest replay
- holder stored pipeline set identity exact

## 15.3 Event omission denial

다음 중 하나가 null이면 recovery 성공으로 채택하지 않는다.

```text
pipelineRebuildReceiptDigest
pipelineSetIdentityDigest
participantRebuildSetDigest
```

---

# 16. Cycle Closure 확장

## 16.1 Closure receipt v2

```ts
export interface R9AP1R2R3CycleClosureReceiptV2 {
  readonly schemaVersion: 2;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.cycle-closure-receipt.v2';
  readonly runId: string;
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly cycleBindingDigest: string;
  readonly permitTombstoneDigest: string;
  readonly operationTerminalReceiptDigest: string;
  readonly recoveryEventDigest: string;
  readonly pipelineInvalidationReceiptDigest: string;
  readonly pipelineRebuildReceiptDigest: string;
  readonly pipelineSetIdentityDigest: string;
  readonly participantRebuildSetDigest: string;
  readonly expectedOldDeviceEpoch: number;
  readonly observedNewDeviceEpoch: number;
  readonly operationTerminal: string;
  readonly closedAtMs: number;
  readonly closureDigest: string;
  readonly selfSha256: string;
}
```

## 16.2 Main closure acknowledgement

R2-R2 Main authority는 R2-R3 closure schema를 채택한다.

다음 lineage가 없거나 mismatch면 closure를 인정하지 않는다.

```text
pipelineInvalidationReceiptDigest
pipelineRebuildReceiptDigest
pipelineSetIdentityDigest
participantRebuildSetDigest
```

## 16.3 Next permit admission

Main은 R2-R3 closure acknowledgement 전에는 next cycle permit을 발급하지 않는다.

---

# 17. Rebuild-Before-Validation Admission

## 17.1 Validation token

Holder는 cycle 완료 뒤 validation admission token을 제공한다.

```ts
export interface R9AP1R2R3ValidationAdmissionTokenV1 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.validation-admission-token.v1';
  readonly runId: string;
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly cycleBindingDigest: string;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly pipelineRebuildReceiptDigest: string;
  readonly pipelineSetIdentityDigest: string;
  readonly participantRebuildSetDigest: string;
  readonly closureDigest: string;
  readonly tokenDigest: string;
  readonly selfSha256: string;
}
```

## 17.2 Runner flow

```text
lost operation rejection
→ waitForCycle
→ build R2-R3 closure receipt
→ Main closure acknowledgement
→ holder issue validation admission token
→ runner replay token
→ requireCanonicalPipelineRegistryReadyR9AP1R2R3
→ validation fixture publish
→ Preview validation
→ Export validation
```

## 17.3 Validation refusal

다음 상태에서는 validation fixture publish 자체를 시작하지 않는다.

- holder state not READY
- closure not acknowledged
- missing rebuild receipt
- registry current entry not ACTIVE
- pipeline set identity mismatch
- current GPU identity mismatch
- old epoch non-terminal entry exists

## 17.4 Lazy build counter

Validation operation 전에 registry physical build counter가 증가하면 실패한다.

```text
postRecoveryValidationLazyBuildCount = 0
```

---

# 18. Old Pipeline Reuse Denial

## 18.1 Stale bundle retention negative control

Test harness는 old epoch `pipes` reference를 의도적으로 보존한다.

Recovery 뒤 old reference로 `runDeltaKStack()`을 호출하면 canonical stale error가 발생해야 한다.

허용 error family:

```text
E_R1A_PIPELINE_DISPOSED
E_R6_STALE_PIPELINE_EPOCH
E_R8_STALE_RESOURCE_EPOCH
E_R9AP1R2R3_STALE_PIPELINE_SET
```

성공 dispatch는 금지한다.

## 18.2 Old entry lookup denial

old epoch key로 `requireCanonicalPipelineRegistryReadyR9AP1R2R3()`를 호출하면 실패한다.

## 18.3 Stale lease denial

old device lease는 new epoch commit 뒤 `.device`, `.queue`, `assertCurrent()` 모두 실패해야 한다.

## 18.4 Direct object equality

old EWA root bundle과 new EWA root bundle은 같은 object일 수 없다.

Tensor와 Adaptive도 각각 object identity가 달라야 한다.

## 18.5 Identity continuity and difference

같아야 하는 것:

```text
kernel contract
shader digests
generated manifest digest
ABI IDs
field schema IDs
adapter identity
```

달라야 하는 것:

```text
device epoch
device identity
registry generation
build sequence
pipeline object identity
neutral texture object identity
```

---

# 19. Snapshot 계약

## 19.1 Registry snapshot

```ts
export interface CanonicalPipelineRegistrySnapshotR2R3 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r3.pipeline-registry-snapshot.v1';
  readonly authorityId: string;
  readonly registryGeneration: number;
  readonly buildSequence: number;
  readonly physicalBuildCount: number;
  readonly singleFlightJoinCount: number;
  readonly lateCompletionDisposeCount: number;
  readonly invalidationCount: number;
  readonly entries: readonly CanonicalPipelineRegistryEntrySnapshotR2R3[];
  readonly lifecycle: readonly CanonicalPipelineLifecycleRowR2R3[];
  readonly snapshotDigest: string;
  readonly selfSha256: string;
}
```

## 19.2 Entry snapshot

GPU objects와 Promise는 제외한다.

필수 fields:

```text
entryKeyDigest
state
runtimeEpoch
deviceEpoch
deviceIdentity
adapterIdentity
buildSequence
reservationGeneration
joinCount
pipelineSetIdentityDigest
rebuildReceiptDigest
invalidationReason
failureCode
```

## 19.3 Lifecycle rows

최소 event set:

```text
BUILD_RESERVED
BUILD_JOINED
BUILD_STARTED
BUILD_RESOLVED
BUILD_COMMIT_REJECTED
ACTIVE_COMMITTED
INVALIDATION_STARTED
LATE_BUILD_DISPOSED
INVALIDATED
FAILED
DISPOSED
```

---

# 20. Stable Error Codes

다음을 `StableErrorCode`에 추가한다.

```text
E_R9AP1R2R3_ADAPTIVE_IDENTITY_MISSING
E_R9AP1R2R3_BUILD_ALREADY_TERMINAL
E_R9AP1R2R3_BUILD_COMMIT_STALE
E_R9AP1R2R3_BUILD_FAILED
E_R9AP1R2R3_BUILD_INVALIDATED
E_R9AP1R2R3_BUILD_TOKEN_MISMATCH
E_R9AP1R2R3_ENTRY_KEY_MISMATCH
E_R9AP1R2R3_HOLDER_STATE_TRANSITION
E_R9AP1R2R3_INVALIDATION_DIGEST
E_R9AP1R2R3_INVALIDATION_IDENTITY
E_R9AP1R2R3_LAZY_BUILD_AFTER_RECOVERY
E_R9AP1R2R3_OLD_EPOCH_ENTRY_RETAINED
E_R9AP1R2R3_PARTICIPANT_RECEIPT_MISSING
E_R9AP1R2R3_PIPELINE_FAMILY_INCOMPLETE
E_R9AP1R2R3_PIPELINE_REBUILD_DIGEST
E_R9AP1R2R3_PIPELINE_REBUILD_MISSING
E_R9AP1R2R3_PIPELINE_SET_DIGEST
E_R9AP1R2R3_PIPELINE_SET_IDENTITY
E_R9AP1R2R3_REBUILD_REQUEST_DIGEST
E_R9AP1R2R3_REBUILD_REQUEST_IDENTITY
E_R9AP1R2R3_REGISTRY_NOT_READY
E_R9AP1R2R3_SINGLE_FLIGHT_VIOLATION
E_R9AP1R2R3_STALE_PIPELINE_SET
E_R9AP1R2R3_VALIDATION_ADMISSION
E_R9AP1R2R3_VALIDATION_BEFORE_REBUILD
```

오류는 문자열 dump가 아니라 code와 structured detail을 유지한다.

---

# 21. Evidence Artifacts

## 21.1 신규 child artifacts

```text
R9AP1R2R3_PIPELINE_INVALIDATION_LEDGER.json
R9AP1R2R3_PIPELINE_BUILD_LEDGER.json
R9AP1R2R3_PIPELINE_SET_IDENTITY_LEDGER.json
R9AP1R2R3_PIPELINE_REBUILD_RECEIPT_LEDGER.json
R9AP1R2R3_PARTICIPANT_REBUILD_SET_LEDGER.json
R9AP1R2R3_OLD_PIPELINE_REUSE_NEGATIVE_LEDGER.json
R9AP1R2R3_SINGLE_FLIGHT_NEGATIVE_LEDGER.json
R9AP1R2R3_LATE_COMPLETION_NEGATIVE_LEDGER.json
R9AP1R2R3_REBUILD_BEFORE_VALIDATION_LEDGER.json
R9AP1R2R3_THREE_CYCLE_PIPELINE_MATRIX.json
```

## 21.2 Three-cycle matrix row

각 cycle row는 다음을 포함한다.

```text
cycleOrdinal
operationKind
cycleBindingDigest
oldDeviceEpoch
newDeviceEpoch
oldDeviceIdentity
newDeviceIdentity
adapterIdentity
invalidationReceiptDigest
pipelineRebuildReceiptDigest
pipelineSetIdentityDigest
participantRebuildSetDigest
registryGeneration
buildSequence
physicalBuildCount
singleFlightJoinCount
oldEpochActiveCount
oldEpochBuildingCount
validationLazyBuildCount
oldPipelineReuseAcceptedCount
validationPreviewOperationId
validationExportOperationId
```

## 21.3 Expected totals

세 cycle physical PASS에서:

```text
controlledLossCount = 3
pipelineInvalidationReceiptCount = 3
pipelineRebuildReceiptCount = 3
pipelineSetIdentityCount = 3
participantRebuildSetCount = 3
physicalPipelineBuildCount = 3
postRecoveryValidationLazyBuildCount = 0
oldPipelineReuseAcceptedCount = 0
lateCompletionAcceptedCount = 0
```

## 21.4 Parent evidence preservation

R2-R1, R2-R2 child artifacts는 원본 바이트를 보존한다.

R2-R3는 신규 artifact root를 추가하되 부모 receipt를 다시 생성하여 덮어쓰지 않는다.

---

# 22. Negative Controls

## 22.1 Single-flight concurrency

동일 key에 2, 4, 8 caller를 동시에 투입한다.

기대:

```text
physicalBuildCount = 1
all caller receiptDigest equal
joinCount = callerCount - 1
```

## 22.2 Different key concurrency

서로 다른 device identity key는 Promise를 공유하면 안 된다.

## 22.3 Invalidate while building

build delay를 주입하고 invalidation을 먼저 수행한다.

기대:

```text
late result disposed
ACTIVE commit 0
E_R9AP1R2R3_BUILD_INVALIDATED
```

## 22.4 Entry replacement attack

BUILDING entry가 있는 동안 같은 key로 새 entry를 강제 생성하려 한다.

기대:

```text
entry replacement 0
single-flight join 1
```

## 22.5 Build token mutation

다음 필드를 하나씩 변경한다.

```text
registryGenerationAtReservation
buildSequence
entryKeyDigest
runtimeEpoch
deviceEpoch
deviceIdentity
```

모두 reject한다.

## 22.6 Pipeline family omission

EWA, Tensor, Adaptive를 각각 하나씩 누락한 fake set을 commit한다.

모두 reject한다.

## 22.7 Adaptive identity omission

Adaptive bundle identity fields를 하나씩 누락한다.

모두 reject한다.

## 22.8 Old bundle reuse

old EWA, Tensor, Adaptive reference를 각각 재사용한다.

모두 stale 또는 disposed error로 끝나야 한다.

## 22.9 Wrong recovered event receipt

다른 cycle의 rebuild receipt digest를 recovered event에 넣는다.

Holder가 reject해야 한다.

## 22.10 Validation before receipt

Holder `REBUILDING` 상태에서 validation token을 요청한다.

`E_R9AP1R2R3_VALIDATION_BEFORE_REBUILD`가 발생해야 한다.

## 22.11 Lazy substitution

Explicit rebuild를 강제로 실패시킨 뒤 validation canonical execution을 호출한다.

Validation은 시작되지 않아야 하며 lazy build count는 0이어야 한다.

## 22.12 Duplicate rebuild callback

동일 cycle에서 holder rebuild callback을 두 번 호출한다.

두 번째는 새 physical build가 아니라 exact existing receipt replay 또는 canonical duplicate rejection이어야 한다.

---

# 23. Source Gate Catalog

Source Gate 목표: `120 PASS / 0 FAIL`

## 23.1 Registry authority 10

```text
R2R3-S001 authority ID exact
R2R3-S002 canonical key schema exact
R2R3-S003 device identity included
R2R3-S004 adapter identity included
R2R3-S005 WeakMap key non-authoritative
R2R3-S006 registry generation monotonic
R2R3-S007 build sequence monotonic
R2R3-S008 exact key set validation
R2R3-S009 snapshot digest replay
R2R3-S010 no GPU object serialization
```

## 23.2 Single-flight 10

```text
R2R3-S011 BUILDING caller joins
R2R3-S012 build Promise stable reference
R2R3-S013 physical build count one
R2R3-S014 join count exact
R2R3-S015 no BUILDING replacement
R2R3-S016 ACTIVE exact reuse
R2R3-S017 different key no join
R2R3-S018 failed entry no silent reuse
R2R3-S019 duplicate callback bounded
R2R3-S020 single-flight negative matrix pass
```

## 23.3 Build token and commit 10

```text
R2R3-S021 build token all fields
R2R3-S022 current entry object check
R2R3-S023 reservation generation check
R2R3-S024 build sequence check
R2R3-S025 entry key digest check
R2R3-S026 runtime epoch check
R2R3-S027 device epoch check
R2R3-S028 device identity check
R2R3-S029 lease current check
R2R3-S030 stale commit rejected
```

## 23.4 Invalidation 10

```text
R2R3-S031 exact old identity selection
R2R3-S032 BUILDING invalidation token revoke
R2R3-S033 ACTIVE root dispose once
R2R3-S034 Tensor chained dispose
R2R3-S035 Adaptive chained dispose
R2R3-S036 late completion dispose
R2R3-S037 old active count zero
R2R3-S038 old building count zero
R2R3-S039 invalidation receipt replay
R2R3-S040 invalidation lifecycle order
```

## 23.5 EWA identity 10

```text
R2R3-S041 EWA runtime epoch exact
R2R3-S042 EWA device epoch exact
R2R3-S043 EWA device identity exact
R2R3-S044 layout digest present
R2R3-S045 kernel contract digest present
R2R3-S046 generated manifest digest present
R2R3-S047 canonical pipeline identity present
R2R3-S048 validation pipeline identities present
R2R3-S049 comparator identity present
R2R3-S050 EWA identity digest replay
```

## 23.6 Tensor identity 10

```text
R2R3-S051 Tensor runtime epoch exact
R2R3-S052 Tensor device epoch exact
R2R3-S053 Tensor device identity exact
R2R3-S054 ABI present
R2R3-S055 field schema present
R2R3-S056 axial schema present
R2R3-S057 chain identity present
R2R3-S058 axial identity present
R2R3-S059 shader digest map sorted
R2R3-S060 Tensor identity digest replay
```

## 23.7 Adaptive identity 10

```text
R2R3-S061 Adaptive schema v2
R2R3-S062 runtime epoch exact
R2R3-S063 device epoch exact
R2R3-S064 device identity exact
R2R3-S065 ABI present
R2R3-S066 field schema present
R2R3-S067 pipeline identity present
R2R3-S068 shader digest present
R2R3-S069 dispose idempotent
R2R3-S070 Adaptive omission matrix pass
```

## 23.8 Rebuild receipt 10

```text
R2R3-S071 request digest replay
R2R3-S072 request identity exact
R2R3-S073 lease owner unchanged
R2R3-S074 pipeline family count three
R2R3-S075 physical build count one
R2R3-S076 current active count one
R2R3-S077 old counts zero
R2R3-S078 pipeline set digest replay
R2R3-S079 rebuild digest replay
R2R3-S080 receipt after ACTIVE only
```

## 23.9 Participant evidence 10

```text
R2R3-S081 rebuild return evidence supported
R2R3-S082 participant IDs sorted
R2R3-S083 set digest replay
R2R3-S084 holder receipt included
R2R3-S085 missing holder receipt denied
R2R3-S086 recovered event count exact
R2R3-S087 recovered event set digest present
R2R3-S088 recovery failure omits recovered event
R2R3-S089 participant evidence no raw object
R2R3-S090 event correlation exact
```

## 23.10 Holder integration 10

```text
R2R3-S091 legal transition table present
R2R3-S092 REACQUIRING before REBUILDING
R2R3-S093 lease acquired in rebuild
R2R3-S094 explicit rebuild API called
R2R3-S095 receipt replay before VALIDATING
R2R3-S096 failure transitions FAILED
R2R3-S097 lease release finally
R2R3-S098 active cycle stores receipt
R2R3-S099 completed cycle stores receipt
R2R3-S100 holder ledger full lineage
```

## 23.11 Closure and validation 10

```text
R2R3-S101 closure schema v2
R2R3-S102 invalidation digest included
R2R3-S103 rebuild digest included
R2R3-S104 pipeline set digest included
R2R3-S105 participant set digest included
R2R3-S106 Main acknowledgement exact
R2R3-S107 validation token exact
R2R3-S108 require-ready before fixture
R2R3-S109 lazy build count zero
R2R3-S110 validation-before-rebuild denied
```

## 23.12 Evidence and parent preservation 10

```text
R2R3-S111 ten child artifacts declared
R2R3-S112 child self-hashes replay
R2R3-S113 three-cycle matrix schema exact
R2R3-S114 parent R2-R1 bytes preserved
R2R3-S115 parent R2-R2 bytes preserved
R2R3-S116 no parent receipt overwrite
R2R3-S117 implementation manifest complete
R2R3-S118 changed file manifest complete
R2R3-S119 active graph no new randomness
R2R3-S120 source final receipt sealed
```

---

# 24. Packaged Physical Gate Catalog

Packaged Physical Gate 목표: `36 PASS / 0 FAIL`

## Cycle 1 Preview loss

```text
R2R3-P001 old epoch invalidation receipt exists
R2R3-P002 one physical pipeline build
R2R3-P003 EWA new identity exact
R2R3-P004 Tensor new identity exact
R2R3-P005 Adaptive new identity exact
R2R3-P006 old active count zero
R2R3-P007 recovered event includes rebuild set
R2R3-P008 Preview lost operation rejects
R2R3-P009 closure includes rebuild lineage
R2R3-P010 validation Preview no lazy build
R2R3-P011 validation Export no lazy build
R2R3-P012 old pipeline reuse denied
```

## Cycle 2 Export loss

```text
R2R3-P013 old epoch invalidation receipt exists
R2R3-P014 one physical pipeline build
R2R3-P015 EWA new identity exact
R2R3-P016 Tensor new identity exact
R2R3-P017 Adaptive new identity exact
R2R3-P018 old active count zero
R2R3-P019 recovered event includes rebuild set
R2R3-P020 Export terminal map rejects
R2R3-P021 host save contamination zero
R2R3-P022 closure includes rebuild lineage
R2R3-P023 validation operations no lazy build
R2R3-P024 old pipeline reuse denied
```

## Cycle 3 Preview loss

```text
R2R3-P025 old epoch invalidation receipt exists
R2R3-P026 one physical pipeline build
R2R3-P027 EWA new identity exact
R2R3-P028 Tensor new identity exact
R2R3-P029 Adaptive new identity exact
R2R3-P030 old active count zero
R2R3-P031 recovered event includes rebuild set
R2R3-P032 Preview lost operation rejects
R2R3-P033 closure includes rebuild lineage
R2R3-P034 validation operations no lazy build
R2R3-P035 old pipeline reuse denied
R2R3-P036 total physical build count exactly three
```

---

# 25. 구현 대상 파일

## 25.1 Canonical registry

```text
app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs
app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs
app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_runtime.mjs
```

## 25.2 Recovery holder and types

```text
app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts
app/src/runtime/recovery/r9a-p1-r2-recovery-types.ts
app/src/env.d.ts
```

## 25.3 GPU Authority participant evidence

```text
app/src/runtime/gpu/gpu-device-authority-service.ts
app/src/runtime/gpu/gpu-service.ts
```

`gpu-consumer-manifest.json`에는 신규 owner를 추가하지 않는다.

## 25.4 Qualification

```text
app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts
app/src/boot/stable-error.ts
```

## 25.5 Tooling

```text
tools/resample-runtime-01-r9a-p1-r2-r3/verify-source.mjs
tools/resample-runtime-01-r9a-p1-r2-r3/finalize-packaged.mjs
tools/resample-runtime-01-r9a-p1-r2-r3/run-source-negative-controls.mjs
tools/resample-runtime-01-r9a-p1-r2-r3/run-single-flight-unit.mjs
tools/resample-runtime-01-r9a-p1-r2-r3/run-late-completion-unit.mjs
tools/resample-runtime-01-r9a-p1-r2-r3/source-gate-catalog.json
tools/resample-runtime-01-r9a-p1-r2-r3/packaged-gate-catalog.json
```

## 25.6 Documentation and manifests

```text
specs/TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3_..._SPEC.md
README_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_APPLIED.md
patches/TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_...diff
patches/TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_CHANGED_FILE_MANIFEST.json
```

---

# 26. 적용 순서

```text
1. Stable error codes 추가
2. Adaptive bundle identity와 idempotent dispose 추가
3. Canonical pipeline set identity extractor 작성
4. Registry key를 device identity 기반 digest로 교체
5. Entry state와 generation 도입
6. Single-flight Promise admission 구현
7. Build token commit guard 구현
8. Invalidation fence와 late completion disposal 구현
9. Explicit rebuild API 구현
10. require-ready API 구현
11. Registry snapshot v3 구현
12. Holder active/completed cycle type 확장
13. Holder invalidation exact request 결선
14. Holder rebuild에서 admitted lease 취득
15. Explicit eager rebuild 결선
16. Holder legal transition table 적용
17. Recovery participant optional evidence 계약 추가
18. GPU Authority participant rebuild set digest 구현
19. Recovered event에 set digest 결선
20. Holder recovery event exact admission 확장
21. Cycle closure v2 결선
22. Main closure acknowledgement 확장
23. Validation admission token 구현
24. Qualification runner require-ready 결선
25. Old pipeline reuse negative control 구현
26. Single-flight concurrency unit 구현
27. Invalidation late-completion unit 구현
28. Source Gate 120개 실행
29. 부모 Source Gate 회귀 실행
30. production build
31. packaged Electron Preview / Export / Preview 3-cycle 실행
32. Physical Gate 36개 finalization
33. child artifact manifest와 final receipt 봉인
```

---

# 27. 완료 조건

## 27.1 Source 완료

다음을 모두 만족해야 SOURCE PASS다.

- Source Gate `120 / 120 PASS`
- single-flight caller matrix PASS
- physical build count unit `1`
- late completion ACTIVE commit `0`
- old pipeline reuse accepted `0`
- Adaptive identity omission accepted `0`
- holder illegal transition accepted `0`
- TypeScript 신규 진단 `0`
- JavaScript parse PASS
- Active Graph 신규 randomness `0`
- 부모 R2-R1 gate 회귀 PASS
- 부모 R2-R2 gate 회귀 PASS
- patch dry-run PASS
- ZIP 재해제 후 Source Gate 재실행 PASS

## 27.2 Physical 완료

다음을 모두 만족해야 PHYSICAL PASS다.

- packaged Electron 정상 부팅
- controlled loss `3 / 3`
- device epoch exact `+1 / +1 / +1`
- pipeline invalidation receipt `3`
- pipeline rebuild receipt `3`
- pipeline set identity `3`
- participant rebuild set `3`
- physical pipeline build total `3`
- validation lazy build total `0`
- old pipeline reuse accepted `0`
- old epoch non-terminal entry `0`
- Preview lost operation rejection `2`
- Export terminal map rejection `1`
- post-recovery Preview validation `3`
- post-recovery Export validation `3`
- Physical Gate `36 / 36 PASS`

## 27.3 HOLD 조건

다음 중 하나라도 발생하면 HOLD다.

- external dependency install failure
- production emit 미실행
- packaged Electron 미실행
- physical GPU cycle 0 또는 일부만 실행
- recovered event에 rebuild receipt 없음
- validation에서 lazy build 발생
- old epoch BUILDING 또는 ACTIVE entry 잔존
- pipeline family 하나라도 identity 없음
- source receipt만 있고 physical child artifacts 없음

HOLD를 PASS로 표기하지 않는다.

---

# 28. 후속 패치 경계

다음 패치는 R2-R4로 분리한다.

```text
TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R4

Raw Recovery Lifecycle Finalizer /
Child Artifact Recursive Digest Replay /
Host Output Directory Zero-Contamination Proof /
Lease·Surface·Pipeline Cross-Ledger Reconciliation /
Three-Cycle Final Matrix Independent Reconstruction Seal
```

R2-R3는 pipeline rebuild authority까지만 닫는다.

다음을 조용히 완료했다고 주장하지 않는다.

- host filesystem 전체 오염 검사
- 모든 child artifact 독립 재계산 finalizer
- recovery budget failure rollback
- uncontrolled loss production UX
- fleet 또는 release promotion

---

# 29. 최종 봉인 문장

```text
A new GPU device is not a recovered resample runtime.
A registry row is not a rebuilt pipeline set.
A BUILDING entry is not allowed to fork into competing owners.
A late build completion is not allowed to survive invalidation.
Recovery is admitted only after one epoch-bound EWA·Tensor·Adaptive set is rebuilt,
its identity is sealed,
its participant receipt is included in the recovered event,
and validation begins without any lazy pipeline substitution.
```
