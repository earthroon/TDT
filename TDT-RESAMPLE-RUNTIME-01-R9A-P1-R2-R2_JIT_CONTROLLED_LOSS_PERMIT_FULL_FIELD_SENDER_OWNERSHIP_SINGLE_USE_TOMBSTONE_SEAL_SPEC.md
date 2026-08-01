# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R2

## Just-In-Time Controlled Loss Permit /
## Full-Field Canonical Integrity /
## Qualification Sender Ownership /
## Arm·Consume Sender Continuity /
## Epoch·Device·Closure Exact Binding /
## Single-Use Nonce Tombstone /
## No Renderer Permit Mutation Seal

> 상태: 명세 rev.1
>
> 부모 패치: `TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1`
>
> 부모 번들: `62_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R1_LOST_OPERATION_TERMINAL_EXACT_CYCLE_CORRELATION_SOURCE_BAKED_AWAITING_EXTERNAL_BUILD_AND_THREE_CYCLE_PHYSICAL_GPU.zip`
>
> 부모 번들 SHA-256: `f43decfafbac9fa4a05ca28ed19f3a8dfd2b7bb694b1d3c779696dbdf5c83f85`
>
> 부모 R2-R1 명세 SHA-256: `e5a868ba29cdcdd01b999af6d25c1e70c68987313f505302d288ab20f8a2ea92`
>
> 부모 R2-R1 Bake Report SHA-256: `158f10d65fc1ff7d94502daf0ecb1bbb72a81f144c29bac6ea69d45ad890a358`
>
> 부모 현재 상태: `360 parent SOURCE PASS / 86 R2-R1 SOURCE PASS / packaged physical 0 of 3 / external build HOLD`
>
> 패치 역할: R2-R1의 lost-operation terminal 및 exact-cycle correlation은 유지하고, controlled-loss permit을 Main 발급자·renderer document·GPU identity·시간창·closure에 귀속하는 권위 교정 패치
>
> 후속 분리 항목: explicit canonical pipeline rebuild authority는 `R2-R3`, full raw lifecycle 및 host output directory closure는 `R2-R4`
>
> 원칙: `plan intent != consumable permit`, `renderer mutation != permit adaptation`, `matching digest string != matching permit body`, `same window != same renderer document`, `consumed != reusable`

---

# 0. 목적

부모 R2-R1은 다음 결함을 봉인했다.

```text
scheduler idle != Preview success
encoder dispatch != Export terminal map pending
newer device epoch != matching recovery cycle
recovery completed != lost operation terminal rejected
```

그러나 controlled-loss permit 자체는 여전히 다음 공격과 오염을 허용한다.

1. Main의 `issue(context)`가 sender의 양의 정수 여부만 확인한 뒤 같은 recovery plan을 반환한다.
2. plan을 처음 받은 sender와 permit을 소비하는 sender의 continuity를 비교하지 않는다.
3. consume은 request permit의 `permitDigest`, `nonce`, `cycleOrdinal`만 검사한다.
4. permit의 operation kind, operation ID, runtime epoch, device epoch, closure digest, boot permit digest, time window를 request body에서 전부 재검증하지 않는다.
5. request permit body가 변조되어도 Main은 자신의 expected object를 기준으로 cycle binding을 만들기 때문에 변조가 조용히 소거될 수 있다.
6. renderer runner는 Main이 발급한 permit의 `expectedRuntimeEpoch`와 `expectedDeviceEpoch`를 spread override로 바꾸면서 기존 `permitDigest`를 유지한다.
7. holder `installPlan()`은 plan self-hash와 각 permit의 full-field digest를 replay하지 않는다.
8. holder `armCycle()`은 permit digest, nonce, operation ID만 비교한다.
9. preload document 재생성, renderer process 교체, 다른 BrowserWindow passage를 permit body가 봉인하지 않는다.
10. consumed permit의 nonce·digest에 영구 tombstone이 없어 replay denial 증거가 독립 artifact로 남지 않는다.

P1-R2-R2는 recovery plan을 **cycle intent envelope**로 축소하고, 실제 controlled-loss permit은 각 cycle 직전에 Main이 한 장씩 발급하는 Just-In-Time 구조로 교체한다.

```text
Main-qualified recovery plan intent
→ exact qualification owner binding
→ renderer GPU Authority identity snapshot
→ JIT permit issue request
→ Main canonical full-field permit mint
→ renderer full replay + exact arm
→ exact pending hook
→ Main exact consume + atomic tombstone
→ R2-R1 cycle binding and loss transaction
→ exact terminal rejection + recovery
→ cycle closure acknowledgement
→ next cycle permit admission
```

이 패치는 source wiring을 구현한 뒤에도 실제 packaged Electron에서 Preview / Export / Preview 세 cycle을 수행하기 전까지 physical PASS를 주장하지 않는다.

---

# 1. 현재 코드에서 직접 확인된 사실

## 1.1 Recovery plan은 consumable permit 세 장을 미리 포함한다

현재 Main authority는 생성 시점에 세 permit을 한꺼번에 만든다.

```text
Preview cycle 1
Export cycle 2
Preview cycle 3
```

각 permit은 다음 필드를 가진다.

```text
runId
cycleOrdinal
operationKind
operationId
expectedRuntimeEpoch
expectedDeviceEpoch
packageClosureDigest
r1BootPermitDigest
nonce
notBeforeMs
expiresAtMs
permitDigest
```

## 1.2 issue sender는 plan 소유자로 봉인되지 않는다

현재 `issue(context)`는 다음만 수행한다.

```text
windowId is positive integer
rendererPid is positive integer
return plan
```

다음을 기록하거나 비교하지 않는다.

- sender window ID
- webContents ID
- renderer PID
- session partition
- preload document instance
- qualification session identity
- issue receipt digest

## 1.3 consume sender는 issuance sender와 비교되지 않는다

현재 `consume(context, request)`는 소비 시점 sender의 window ID와 renderer PID를 읽지만, plan을 발급받은 sender와 같은지 비교하지 않는다.

따라서 현재 구조에서는 다음 passage가 permit 자체에 의해 봉인되지 않는다.

```text
Window A issues plan
→ Window B receives copied permit
→ Window B consumes permit
```

## 1.4 consume은 permit full body를 replay하지 않는다

현재 consume admission은 다음 세 필드만 request permit에서 직접 비교한다.

```text
permitDigest
nonce
cycleOrdinal
```

다음 필드는 request permit에서 정확히 비교되지 않는다.

```text
schemaVersion
schemaId
runId
operationKind
operationId
expectedRuntimeEpoch
expectedDeviceEpoch
packageClosureDigest
r1BootPermitDigest
notBeforeMs
expiresAtMs
```

Main은 request body가 아니라 자신의 `expected` permit과 operation detail로 cycle binding을 만든다. 따라서 request body 변조가 reject되지 않고 조용히 무시될 수 있다.

## 1.5 time window는 request permit이 아니라 expected permit만 검사한다

현재 time admission은 Main 내부 expected permit의 `notBeforeMs`, `expiresAtMs`를 사용한다.

따라서 renderer가 request permit의 time field를 바꾸어도 old digest를 유지한 채 consume passage가 가능하다.

## 1.6 renderer가 permit epoch를 직접 덮어쓴다

현재 qualification runner는 Main plan의 permit을 그대로 arm하지 않는다.

```ts
window.DadumR9AP1RecoveryHolder.armCycle({
  ...permit,
  expectedRuntimeEpoch: before.runtimeEpoch,
  expectedDeviceEpoch: before.deviceEpoch,
});
```

즉, digest가 봉인한 permit body와 실제 holder가 arm한 permit body가 다르다.

판정:

```text
Main-issued permit body
!= renderer-armed permit body
```

## 1.7 holder의 plan·permit 검증은 부분 비교다

현재 holder는 plan 설치 시 다음 정도만 검사한다.

- schema ID
- cycle count 3
- max attempts 3
- cycle ordinal 순서
- Preview / Export / Preview operation kind 순서

arm 시에는 다음만 비교한다.

- permit digest
- nonce
- operation ID

plan self-hash, permit canonical digest, unknown key, owner binding, issue receipt, time window는 검증하지 않는다.

## 1.8 R2-R1 cycle binding은 sender context를 포함하지만 parent permit integrity를 대신하지 않는다

R2-R1 cycle binding은 다음을 봉인한다.

- sender window ID
- sender renderer PID
- operation hook
- operation ID
- runtime/device identity
- parent permit digest

그러나 parent permit body가 정확히 발급된 body인지 먼저 검증하지 않으면 `parentPermitDigest`는 문자열 identity 이상의 증거가 되지 못한다.

---

# 2. 목표와 비목표

## 2.1 목표

- recovery plan을 consumable permit container가 아닌 immutable cycle intent envelope로 변경한다.
- plan 최초 issue 시 qualification sender ownership을 Main이 한 번만 봉인한다.
- preload document instance nonce를 도입하여 같은 webContents의 reload·document replacement를 구분한다.
- JIT cycle permit을 각 cycle 직전에 현재 GPU Authority identity와 함께 Main에서 발급한다.
- renderer가 permit의 epoch·device·operation field를 덮어쓰지 못하게 한다.
- permit body의 정확한 key set, canonical digest, self-hash를 Main과 renderer 양쪽에서 replay한다.
- permit issue, arm, consume, closure의 sender continuity를 exact owner binding으로 강제한다.
- package closure와 R1 boot permit digest를 permit마다 재귀 봉인한다.
- permit의 runtime epoch, device epoch, device identity, adapter identity를 holder GPU SSOT와 exact 비교한다.
- not-before, expiry, issue sequence, cycle sequence를 Main authority가 강제한다.
- permit nonce와 digest를 atomic single-use tombstone으로 전환한다.
- concurrent consume, duplicate consume, old-cycle replay, next-cycle preissue를 거절한다.
- R2-R1 cycle binding이 new permit issue receipt와 owner binding을 부모 evidence로 포함하도록 확장한다.
- cycle closure acknowledgement 전에는 다음 cycle permit을 발급하지 않는다.
- source gate가 모든 permit field mutation과 sender substitution을 실행형 negative control로 재현한다.
- packaged physical finalizer가 raw issue·consume·tombstone·closure ledger를 replay한다.

## 2.2 비목표

- Canonical Pipeline Registry의 explicit rebuild API
- EWA·Tensor·Adaptive pipeline의 eager rebuild completion
- recovery participant order 재설계
- GPU Authority의 recovery budget rollback transaction
- Preview·Export update drain 실측
- host export directory full filesystem closure
- R2 전체 artifact finalizer의 전면 재작성
- cryptographic secrecy 또는 MAC 기반 capability token
- network-distributed permit authority
- production user session용 device-loss policy 확장
- controlled loss 이외의 uncontrolled device loss 정책 변경

---

# 3. 위협 모델

R2-R2는 qualification renderer가 permit을 **읽을 수 있고 복사할 수 있으며 임의 필드를 바꿀 수 있다**고 전제한다.

다음 행위를 거절해야 한다.

1. 다른 BrowserWindow에서 plan 요청
2. 다른 BrowserWindow에서 copied permit consume
3. 같은 BrowserWindow지만 renderer PID가 바뀐 뒤 consume
4. 같은 webContents지만 reload된 preload document가 old permit consume
5. permit field를 바꾸고 old digest 유지
6. permit field와 digest를 함께 재계산
7. unknown key를 추가하여 alternate interpretation 유도
8. cycle 2 permit 선발급
9. cycle 1 permit 재발급
10. 동일 permit 동시 consume
11. consumed nonce replay
12. expired permit consume
13. future not-before permit consume
14. operation kind·hook 교차 사용
15. old device epoch permit 재사용
16. adapter identity 교체 후 consume
17. package closure 또는 boot permit lineage 교체
18. plan envelope 일부 cycle reorder
19. plan self-hash 변조
20. permit issue receipt와 permit body의 digest 불일치

R2-R2는 renderer를 악성 보안 경계로 일반화하지 않는다. 그러나 qualification 증거가 renderer의 조용한 변조를 통과하지 못하게 하는 fail-closed integrity boundary를 제공한다.

---

# 4. 권위 모델

```text
Qualification Run Coordinator
= bound BrowserWindow·run·package closure authority

Preload Document Bridge
= renderer document instance continuity token authority

Recovery Permit Authority R2-R2
= owner binding·plan intent·JIT permit mint·consume tombstone·cycle sequence SSOT

Renderer GPU Authority
= current runtime/device/device identity/adapter identity SSOT

Recovery-Aware Runtime Holder
= local plan replay·exact permit arm·pending operation·cycle closure SSOT

R2-R1 Cycle Binding Authority
= exact operation hook·sender·permit parent·loss/recovery correlation SSOT

Qualification Runner
= sequential public invocation and evidence publication coordinator
```

## 4.1 비권위

- renderer가 임의로 spread-clone한 permit
- `permitDigest` 문자열만 일치하는 object
- 같은 window ID만 가진 sender
- 같은 webContents ID만 가진 새 document
- plan cycle index를 보고 추정한 device epoch
- current GPU identity를 Main이 독립적으로 관측했다고 주장하는 receipt
- summary count만 가진 final receipt
- R2-R1 parent PASS carry-forward만으로 R2-R2를 PASS 처리하는 gate

## 4.2 두 권위 합성

Main은 WebGPU device identity를 직접 관측하지 않는다.

따라서 JIT permit 발급은 다음 두 권위의 합성으로 처리한다.

```text
Main authority
= sender owner + cycle sequence + time window + release lineage

Renderer GPU Authority
= current runtime/device/device identity/adapter identity
```

Main은 renderer가 제출한 identity snapshot을 물리적 진실로 단독 승인하지 않는다. 대신 permit에 불변 봉인하고, holder가 arm 및 consume 직전에 local GPU SSOT와 다시 exact 비교한다.

---

# 5. 프로토콜 상태 머신

## 5.1 Main authority state

```ts
type R9AP1R2R2AuthorityState =
  | 'UNBOUND'
  | 'PLAN_ISSUED'
  | 'CYCLE_PERMIT_ISSUED'
  | 'CYCLE_CONSUMED'
  | 'CYCLE_CLOSED'
  | 'COMPLETED'
  | 'REVOKED'
  | 'FAILED';
```

## 5.2 Cycle state

```ts
type R9AP1R2R2CycleState =
  | 'SCHEDULED'
  | 'PERMIT_ISSUED'
  | 'PERMIT_CONSUMED'
  | 'CYCLE_CLOSED'
  | 'TOMBSTONED';
```

## 5.3 합법 전이

```text
UNBOUND
→ PLAN_ISSUED
→ cycle 1 PERMIT_ISSUED
→ cycle 1 PERMIT_CONSUMED
→ cycle 1 CYCLE_CLOSED
→ cycle 2 PERMIT_ISSUED
→ cycle 2 PERMIT_CONSUMED
→ cycle 2 CYCLE_CLOSED
→ cycle 3 PERMIT_ISSUED
→ cycle 3 PERMIT_CONSUMED
→ cycle 3 CYCLE_CLOSED
→ COMPLETED
```

## 5.4 금지 전이

```text
UNBOUND → consume
PLAN_ISSUED → cycle 2 issue
PERMIT_ISSUED → same cycle reissue
PERMIT_ISSUED → next cycle issue
PERMIT_CONSUMED → same permit consume
PERMIT_CONSUMED → next cycle issue before closure
CYCLE_CLOSED → prior cycle issue
COMPLETED → any issue or consume
REVOKED → any issue, consume or close
FAILED → any mutation
```

모든 illegal transition은 stable error와 failed transition receipt를 남기고 authority state를 조용히 보정하지 않는다.

---

# 6. Preload Document Instance Binding

## 6.1 document nonce

preload가 평가될 때 32-byte random nonce를 한 번 생성한다.

```ts
const documentInstanceNonce = crypto.randomBytes(32).toString('hex');
```

조건:

- 정확히 64 lowercase hex
- renderer global에 직접 노출하지 않음
- `r9aP1Recovery` bridge method 내부에서 자동 첨부
- 같은 preload document lifetime 동안 불변
- reload 또는 새로운 renderer document에서는 새 값
- localStorage, sessionStorage, URL, command line에 저장 금지

## 6.2 bridge request envelope

```ts
interface R9AP1R2R2BridgeEnvelope<T> {
  readonly documentInstanceNonce: string;
  readonly payload: T;
}
```

preload public API는 application caller가 nonce를 전달하지 않아도 내부에서 자동으로 감싼다.

```ts
plan: () => ipcRenderer.invoke(CHANNEL_PLAN, {
  documentInstanceNonce,
  payload: {},
})
```

application renderer가 임의 nonce를 주입할 수 있는 raw channel은 노출하지 않는다.

---

# 7. Qualification Owner Binding

## 7.1 Owner binding body

Main은 최초 plan issue에서 다음 context를 봉인한다.

```ts
interface R9AP1R2R2OwnerBindingReceiptV1 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.owner-binding-receipt.v1';

  readonly runId: string;
  readonly senderWindowId: number;
  readonly senderWebContentsId: number;
  readonly senderRendererPid: number;
  readonly senderPartitionId: string;
  readonly documentInstanceNonceDigest: string;

  readonly packageClosureDigest: string;
  readonly r1BootPermitDigest: string;
  readonly qualificationSessionDigest: string;

  readonly boundAtMs: number;
  readonly expiresAtMs: number;

  readonly ownerBindingDigest: string;
  readonly selfSha256: string;
}
```

## 7.2 Owner binding digest

`ownerBindingDigest`는 다음 canonical body의 SHA-256이다.

```text
schemaVersion
schemaId
runId
senderWindowId
senderWebContentsId
senderRendererPid
senderPartitionId
documentInstanceNonceDigest
packageClosureDigest
r1BootPermitDigest
qualificationSessionDigest
boundAtMs
expiresAtMs
```

`selfSha256`는 `ownerBindingDigest`를 포함한 receipt 전체 canonical body의 SHA-256이다.

## 7.3 continuity 비교

다음 IPC는 전부 동일 owner binding을 요구한다.

- plan
- issueCyclePermit
- consumePermit
- acknowledgeCycleClosure
- status

비교 필드:

```text
windowId exact
webContentsId exact
rendererPid exact
partitionId exact
documentInstanceNonceDigest exact
runId exact
qualificationSessionDigest exact
```

하나라도 다르면 current run은 fail-closed 한다. owner rebind는 허용하지 않는다.

## 7.4 lifecycle revoke

다음 시점에 owner binding을 `REVOKED`로 전환한다.

- bound BrowserWindow closed
- bound webContents destroyed
- qualification session revoked
- run coordinator failed
- permit authority expiry
- package closure drift

revoke 이후 old document가 IPC를 보내도 stable revoke error만 반환한다.

---

# 8. Recovery Plan Intent Envelope

## 8.1 plan은 permit을 포함하지 않는다

R2-R2 plan은 세 cycle의 immutable intent만 가진다.

```ts
interface R9AP1R2R2CycleIntentV1 {
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly operationKind: 'preview' | 'export';
  readonly operationId: string;
  readonly hookId:
    | 'R9AP1R2R1_PREVIEW_SUBMISSION_PENDING'
    | 'R9AP1R2R1_EXPORT_TERMINAL_MAP_PENDING';
}

interface R9AP1R2R2RecoveryPlanV2 {
  readonly schemaVersion: 2;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.recovery-plan.v2';

  readonly runId: string;
  readonly ownerBindingDigest: string;
  readonly packageClosureDigest: string;
  readonly r1BootPermitDigest: string;
  readonly qualificationSessionDigest: string;

  readonly issuedAtMs: number;
  readonly expiresAtMs: number;

  readonly cycles: readonly [
    R9AP1R2R2CycleIntentV1,
    R9AP1R2R2CycleIntentV1,
    R9AP1R2R2CycleIntentV1,
  ];

  readonly planDigest: string;
  readonly selfSha256: string;
}
```

## 8.2 고정 sequence

```text
cycle 1 = preview + PREVIEW_SUBMISSION_PENDING
cycle 2 = export + EXPORT_TERMINAL_MAP_PENDING
cycle 3 = preview + PREVIEW_SUBMISSION_PENDING
```

operation ID는 plan issue 시 Main이 생성하고 이후 변경하지 않는다.

## 8.3 plan digest

`planDigest`는 다음 body의 SHA-256이다.

```text
schemaVersion
schemaId
runId
ownerBindingDigest
packageClosureDigest
r1BootPermitDigest
qualificationSessionDigest
issuedAtMs
expiresAtMs
cycles exact tuple
```

## 8.4 legacy v1 denial

다음 schema는 R2-R2 qualification에서 consumable plan으로 인정하지 않는다.

```text
tdt.r9a-p1-r2.recovery-plan.v1
tdt.r9a-p1-r2.controlled-loss-permit.v1
```

자동 변환, silent adapter, field defaulting은 금지한다.

---

# 9. JIT Cycle Permit Issue

## 9.1 issue request

각 cycle 직전에 runner는 GPU Authority SSOT에서 identity snapshot을 읽고 Main에 issue를 요청한다.

```ts
interface R9AP1R2R2IssuePermitRequestV1 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.issue-permit-request.v1';

  readonly runId: string;
  readonly planDigest: string;
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly operationKind: 'preview' | 'export';
  readonly operationId: string;
  readonly hookId: R9AP1R2R1HookId;

  readonly runtimeEpoch: number;
  readonly deviceEpoch: number;
  readonly deviceIdentity: string;
  readonly adapterIdentity: string;

  readonly identitySnapshotDigest: string;
  readonly requestNonce: string;
  readonly requestedAtMs: number;
  readonly requestDigest: string;
  readonly selfSha256: string;
}
```

## 9.2 identity snapshot digest

```text
runtimeEpoch
deviceEpoch
deviceIdentity
adapterIdentity
```

이 네 필드만 canonical object로 구성해 SHA-256 한다.

## 9.3 Main issue admission

Main은 다음을 모두 검증한 뒤 permit을 발급한다.

1. exact owner binding
2. authority state가 plan issued 또는 prior cycle closed
3. requested cycle가 다음 expected ordinal
4. plan intent와 operation kind·ID·hook exact
5. request key set exact
6. request digest replay PASS
7. self-hash replay PASS
8. runtime epoch positive integer
9. device epoch positive integer
10. device identity non-empty canonical string
11. adapter identity non-empty canonical string
12. identity snapshot digest exact
13. request nonce 64 lowercase hex
14. request nonce 미사용
15. requestedAtMs가 Main clock 허용 skew 안
16. package closure unchanged
17. R1 boot permit lineage unchanged
18. qualification session active
19. prior cycle가 Main ledger에서 CYCLE_CLOSED
20. same cycle permit 미발급

Main은 submitted GPU identity가 물리적으로 참이라고 단독 주장하지 않는다. 해당 snapshot을 permit에 봉인하고 renderer holder의 local SSOT replay를 요구한다.

## 9.4 JIT permit body

```ts
interface R9AP1R2R2ControlledLossPermitV2 {
  readonly schemaVersion: 2;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.controlled-loss-permit.v2';

  readonly runId: string;
  readonly planDigest: string;
  readonly ownerBindingDigest: string;

  readonly cycleOrdinal: 1 | 2 | 3;
  readonly issueSequence: 1 | 2 | 3;
  readonly operationKind: 'preview' | 'export';
  readonly operationId: string;
  readonly hookId: R9AP1R2R1HookId;

  readonly expectedRuntimeEpoch: number;
  readonly expectedDeviceEpoch: number;
  readonly expectedDeviceIdentity: string;
  readonly expectedAdapterIdentity: string;
  readonly identitySnapshotDigest: string;

  readonly packageClosureDigest: string;
  readonly r1BootPermitDigest: string;
  readonly qualificationSessionDigest: string;

  readonly nonce: string;
  readonly issuedAtMs: number;
  readonly notBeforeMs: number;
  readonly expiresAtMs: number;

  readonly permitDigest: string;
  readonly selfSha256: string;
}
```

## 9.5 issue receipt

```ts
interface R9AP1R2R2PermitIssueReceiptV1 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.permit-issue-receipt.v1';

  readonly runId: string;
  readonly ownerBindingDigest: string;
  readonly planDigest: string;
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly requestDigest: string;
  readonly permitDigest: string;
  readonly permitSelfSha256: string;
  readonly issuedAtMs: number;
  readonly expiresAtMs: number;
  readonly issueReceiptDigest: string;
  readonly selfSha256: string;
}
```

## 9.6 permit lifetime

기본 policy:

```text
issuedAtMs = Main Date.now()
notBeforeMs = issuedAtMs
expiresAtMs = issuedAtMs + 60 seconds
```

60초는 qualification local operation hook 도달을 위한 짧은 one-shot window다.

- renderer가 TTL을 선택하지 않는다.
- permit expiry 연장은 허용하지 않는다.
- expired permit 재발급은 current run failure다.
- same cycle retry permit은 허용하지 않는다.

---

# 10. Canonical Full-Field Integrity

## 10.1 exact key set

permit은 정의된 key 외의 필드를 포함할 수 없다.

다음은 거절한다.

- missing key
- unknown key
- inherited enumerable key
- symbol key 기반 alternate payload
- array masquerading as object
- null prototype를 이용한 parser divergence
- accessor property
- non-finite number
- `-0`
- uppercase digest
- whitespace-padded identity

IPC structured clone 후 Main은 plain data object로 재구성하고 exact key set을 검사한다.

## 10.2 permit digest

`permitDigest`는 `permitDigest`, `selfSha256`를 제외한 permit canonical body의 SHA-256이다.

## 10.3 permit self-hash

`selfSha256`는 `selfSha256`만 제외하고 `permitDigest`를 포함한 전체 canonical permit의 SHA-256이다.

## 10.4 exact expected equality

Main consume은 digest 재계산만으로 끝내지 않는다.

```text
request permit canonical body
== Main stored issued permit canonical body
```

모든 필드가 exact equal이어야 한다.

renderer가 변경 body에 맞춰 digest를 재계산해도 Main stored permit과 다르면 거절한다.

## 10.5 lineage recursive replay

consume 시 다음 lineage를 재검증한다.

```text
permit.planDigest == stored plan.planDigest
permit.ownerBindingDigest == owner.ownerBindingDigest
permit.packageClosureDigest == current package closure digest
permit.r1BootPermitDigest == active R1 boot permit digest
permit.qualificationSessionDigest == active qualification session digest
```

## 10.6 time replay

consume 시 다음을 전부 확인한다.

```text
stored issuedAtMs == request issuedAtMs
stored notBeforeMs == request notBeforeMs
stored expiresAtMs == request expiresAtMs
notBeforeMs <= Main now <= expiresAtMs
expiresAtMs - issuedAtMs == policy TTL
```

---

# 11. Renderer Plan Adoption and Exact Arm

## 11.1 installPlan replay

holder는 plan 설치 시 다음을 검증한다.

- schema version 2
- schema ID exact
- exact key set
- plan digest replay
- self-hash replay
- run ID active qualification run과 exact
- owner binding digest가 preload bridge owner receipt와 exact
- package closure exact
- boot permit digest exact
- qualification session digest exact
- issue·expiry time valid
- cycles exactly three
- ordinals 1,2,3
- operation sequence Preview, Export, Preview
- hook sequence exact
- operation IDs unique
- deep freeze after replay

## 11.2 runner flow 교체

금지:

```ts
armCycle({ ...permit, expectedDeviceEpoch: before.deviceEpoch })
```

허용:

```text
before = GPU Authority identity snapshot
issue = Main.issueCyclePermit(before + exact plan intent)
holder.armCycle(issue)
```

## 11.3 arm input

```ts
interface R9AP1R2R2ArmEnvelopeV1 {
  readonly permit: R9AP1R2R2ControlledLossPermitV2;
  readonly issueReceipt: R9AP1R2R2PermitIssueReceiptV1;
}
```

holder는 다음을 모두 검증한다.

1. plan installed
2. no armed or active cycle
3. expected next cycle
4. issue receipt digest replay
5. issue receipt self-hash replay
6. permit digest replay
7. permit self-hash replay
8. permit and issue receipt cross-digest exact
9. permit plan digest exact
10. owner binding exact
11. operation intent exact
12. Main time window still active using renderer monotonic observation only as early rejection
13. local GPU Authority runtime epoch exact
14. local GPU Authority device epoch exact
15. local GPU Authority device identity exact
16. local GPU Authority adapter identity exact
17. identity snapshot digest exact
18. closure lineage exact
19. no mutation clone
20. deep freeze after successful arm

renderer clock은 authoritative expiry 판정자가 아니다. Main consume이 최종 time authority다.

---

# 12. Exact Consume and Atomic Tombstone

## 12.1 consume request

```ts
interface R9AP1R2R2ConsumeRequestV1 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.consume-request.v1';
  readonly permit: R9AP1R2R2ControlledLossPermitV2;
  readonly issueReceipt: R9AP1R2R2PermitIssueReceiptV1;
  readonly operationDetail: R9AP1R2R1PendingOperationDetail;
  readonly consumeRequestNonce: string;
  readonly consumeRequestDigest: string;
  readonly selfSha256: string;
}
```

## 12.2 consume admission 순서

순서는 고정한다.

```text
1. sender owner continuity
2. authority state
3. exact expected cycle
4. exact key set
5. request digest + self-hash
6. permit digest + self-hash
7. Main stored permit deep equality
8. issue receipt replay
9. plan lineage replay
10. time window admission
11. operation detail key and digest validation
12. operation hook·ID exact
13. runtime/device/device identity/adapter exact
14. nonce and permit tombstone lookup
15. atomic state compare-and-set
16. tombstone publication
17. R2-R1 cycle binding publication
```

## 12.3 tombstone

consume 성공 순간 permit은 재사용 불가능 상태로 전환한다.

```ts
interface R9AP1R2R2PermitTombstoneV1 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.permit-tombstone.v1';
  readonly runId: string;
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly ownerBindingDigest: string;
  readonly permitDigest: string;
  readonly permitSelfSha256: string;
  readonly nonceDigest: string;
  readonly issueReceiptDigest: string;
  readonly consumeRequestDigest: string;
  readonly cycleBindingDigest: string;
  readonly consumedAtMs: number;
  readonly terminalState: 'CONSUMED_SINGLE_USE';
  readonly tombstoneDigest: string;
  readonly selfSha256: string;
}
```

## 12.4 atomicity

`tombstone` 기록과 cycle state `PERMIT_CONSUMED` 전이는 하나의 synchronous authority critical section에서 수행한다.

다음 사이에 `await`를 두지 않는다.

```text
replay check
→ consumed state compare
→ tombstone insert
→ cycle state update
```

cycle binding 생성 실패 시 run은 `FAILED`로 전환한다. permit을 reusable state로 rollback하지 않는다.

## 12.5 replay denial

다음 키 중 하나라도 tombstone과 충돌하면 replay다.

- permit digest
- permit self-hash
- nonce digest
- issue receipt digest
- cycle ordinal after consumed

stable replay error와 replay attempt receipt를 남긴다.

---

# 13. Cycle Closure Acknowledgement

## 13.1 목적

Main은 permit이 소비되었다는 사실만으로 recovery cycle이 닫혔다고 판단하지 않는다.

다음 cycle permit은 R2-R1 holder가 exact recovery와 lost operation terminal rejection을 모두 완료한 뒤에만 발급한다.

## 13.2 closure receipt

```ts
interface R9AP1R2R2CycleClosureReceiptV1 {
  readonly schemaVersion: 1;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.cycle-closure-receipt.v1';
  readonly runId: string;
  readonly ownerBindingDigest: string;
  readonly planDigest: string;
  readonly cycleOrdinal: 1 | 2 | 3;
  readonly permitDigest: string;
  readonly permitTombstoneDigest: string;
  readonly cycleBindingDigest: string;
  readonly operationTerminalReceiptDigest: string;
  readonly recoveryEventDigest: string;
  readonly expectedOldDeviceEpoch: number;
  readonly observedNewDeviceEpoch: number;
  readonly operationTerminal:
    | 'REJECTED_DEVICE_LOSS'
    | 'REJECTED_RECOVERY_FAILURE';
  readonly closedAtMs: number;
  readonly closureDigest: string;
  readonly selfSha256: string;
}
```

## 13.3 Main closure admission

- exact sender owner
- current cycle state PERMIT_CONSUMED
- receipt canonical replay
- permit digest exact
- tombstone digest exact
- cycle binding digest exact
- terminal receipt digest 64 lowercase hex
- recovery event digest 64 lowercase hex
- new device epoch = old + 1 for recovered path
- duplicate closure denial
- next cycle not already issued

closure admission 후 cycle state를 `CYCLE_CLOSED`로 바꾼다.

cycle 3 closure 후 authority state는 `COMPLETED`가 된다.

---

# 14. R2-R1 Cycle Binding Integration

R2-R1의 terminal rejection, export map hook, recovery event correlation은 유지한다.

cycle binding receipt는 다음 parent fields를 추가한 v2로 승격한다.

```ts
interface R9AP1R2R2CycleBindingReceiptV2
  extends Omit<R9AP1R2R1CycleBindingReceiptV1,
    'schemaVersion' | 'schemaId' | 'parentPermitDigest'> {
  readonly schemaVersion: 2;
  readonly schemaId: 'tdt.r9a-p1-r2-r2.cycle-binding-receipt.v2';
  readonly ownerBindingDigest: string;
  readonly planDigest: string;
  readonly parentPermitDigest: string;
  readonly parentPermitSelfSha256: string;
  readonly permitIssueReceiptDigest: string;
  readonly permitTombstoneDigest: string;
}
```

## 14.1 binding order

cycle binding v2는 permit tombstone이 생성된 뒤 발행한다.

```text
exact consume
→ tombstone
→ cycle binding v2
→ GPU Authority controlled loss
```

`tombstoneDigest`를 cycle binding에 포함해야 replay된 permit이 새 binding을 만들지 못한다.

## 14.2 event propagation

lost, recovered, failed event는 기존 R2-R1 fields에 다음을 포함한다.

- owner binding digest
- permit digest
- permit tombstone digest
- issue receipt digest

모든 waiter는 cycle binding v2 self-hash와 digest를 먼저 replay한다.

---

# 15. IPC 및 Preload 계약

## 15.1 channels

```text
dadum:r9a-p1-r2-r2-plan
dadum:r9a-p1-r2-r2-issue-permit
dadum:r9a-p1-r2-r2-consume
dadum:r9a-p1-r2-r2-close-cycle
dadum:r9a-p1-r2-r2-status
```

legacy channels는 R2-R2 qualification mode에서 호출 시 fail-closed 한다.

```text
dadum:r9a-p1-r2-plan
dadum:r9a-p1-r2-consume
```

## 15.2 preload API

```ts
r9aP1Recovery: Object.freeze({
  plan(): Promise<R9AP1R2R2RecoveryPlanV2>;
  issueCyclePermit(request: R9AP1R2R2IssuePermitRequestV1): Promise<R9AP1R2R2ArmEnvelopeV1>;
  consumePermit(request: R9AP1R2R2ConsumeRequestV1): Promise<R9AP1R2R2ConsumeResultV2>;
  acknowledgeCycleClosure(request: R9AP1R2R2CycleClosureReceiptV1): Promise<{ closed: true }>;
  status(): Promise<R9AP1R2R2AuthoritySnapshotV1>;
})
```

preload는 모든 request를 document instance envelope로 자동 감싼다.

## 15.3 Main sender context

현재 sender context의 다음 필드를 전부 사용한다.

```text
windowId
webContentsId
rendererPid
partitionId
```

`rendererPid === 0`은 R2-R2에서 거절한다.

---

# 16. Qualification Runner 흐름

```text
plan = recovery.plan()
holder.installPlan(plan)

for intent in plan.cycles:
  before = GPU Authority identity snapshot

  issueRequest = seal(
    intent
    + before identity
    + plan digest
    + request nonce
  )

  armEnvelope = recovery.issueCyclePermit(issueRequest)
  holder.armCycle(armEnvelope)

  lostTerminal = execute public Preview or Export
  completed = holder.waitForCycle(exact terminal evidence)

  closureReceipt = holder.buildCycleClosureReceipt(completed)
  recovery.acknowledgeCycleClosure(closureReceipt)

  run post-recovery Preview and Export validation
```

## 16.1 금지 사항

- plan permit array 사용
- permit spread override
- renderer-generated permit digest
- next cycle prefetch
- permit expiry retry
- cycle closure 전 validation 시작
- validation success로 Main closure를 대체

---

# 17. Stable Error Codes

| Code | Condition |
|---|---|
| `E_R9AP1R2R2_OWNER_ALREADY_BOUND` | second owner attempted plan issue |
| `E_R9AP1R2R2_OWNER_MISMATCH` | sender context differs from owner binding |
| `E_R9AP1R2R2_DOCUMENT_MISMATCH` | preload document nonce differs |
| `E_R9AP1R2R2_OWNER_REVOKED` | owner binding was revoked |
| `E_R9AP1R2R2_PLAN_SCHEMA` | plan schema/version mismatch |
| `E_R9AP1R2R2_PLAN_KEYS` | plan exact key set mismatch |
| `E_R9AP1R2R2_PLAN_DIGEST` | plan digest replay failed |
| `E_R9AP1R2R2_PLAN_SELF_HASH` | plan self-hash replay failed |
| `E_R9AP1R2R2_PLAN_LINEAGE` | plan closure/session lineage mismatch |
| `E_R9AP1R2R2_PLAN_SEQUENCE` | plan cycle intent sequence invalid |
| `E_R9AP1R2R2_LEGACY_PERMIT_DENIED` | v1 plan or permit entered R2-R2 path |
| `E_R9AP1R2R2_ISSUE_STATE` | permit issue attempted in illegal state |
| `E_R9AP1R2R2_ISSUE_SEQUENCE` | cycle issue ordinal not next expected |
| `E_R9AP1R2R2_ISSUE_INTENT` | issue request differs from plan intent |
| `E_R9AP1R2R2_ISSUE_REQUEST_DIGEST` | issue request digest invalid |
| `E_R9AP1R2R2_ISSUE_REQUEST_REPLAY` | issue request nonce reused |
| `E_R9AP1R2R2_IDENTITY_SNAPSHOT` | identity snapshot digest invalid |
| `E_R9AP1R2R2_PERMIT_KEYS` | permit exact key set mismatch |
| `E_R9AP1R2R2_PERMIT_DIGEST` | permit digest replay failed |
| `E_R9AP1R2R2_PERMIT_SELF_HASH` | permit self-hash replay failed |
| `E_R9AP1R2R2_PERMIT_BODY_MISMATCH` | request permit differs from Main stored permit |
| `E_R9AP1R2R2_PERMIT_LINEAGE` | permit plan/owner/closure/session lineage mismatch |
| `E_R9AP1R2R2_PERMIT_NOT_ACTIVE` | Main time before not-before |
| `E_R9AP1R2R2_PERMIT_EXPIRED` | Main time after expiry |
| `E_R9AP1R2R2_PERMIT_TTL` | permit TTL differs from policy |
| `E_R9AP1R2R2_PERMIT_ALREADY_ISSUED` | same cycle permit reissue attempted |
| `E_R9AP1R2R2_PERMIT_ALREADY_CONSUMED` | permit digest already tombstoned |
| `E_R9AP1R2R2_NONCE_REPLAY` | nonce digest already tombstoned |
| `E_R9AP1R2R2_CONSUME_STATE` | consume attempted in illegal state |
| `E_R9AP1R2R2_CONSUME_REQUEST_DIGEST` | consume request digest invalid |
| `E_R9AP1R2R2_OPERATION_BINDING` | operation detail differs from permit |
| `E_R9AP1R2R2_GPU_IDENTITY_MISMATCH` | local GPU SSOT differs from permit |
| `E_R9AP1R2R2_TOMBSTONE_COLLISION` | tombstone identity collision |
| `E_R9AP1R2R2_CYCLE_BINDING_V2` | cycle binding v2 replay failed |
| `E_R9AP1R2R2_CLOSURE_STATE` | closure attempted before consume or twice |
| `E_R9AP1R2R2_CLOSURE_DIGEST` | closure receipt digest invalid |
| `E_R9AP1R2R2_CLOSURE_PARENT` | closure parent digests mismatch |
| `E_R9AP1R2R2_NEXT_CYCLE_BEFORE_CLOSE` | next cycle issue attempted before prior closure |
| `E_R9AP1R2R2_AUTHORITY_COMPLETED` | mutation attempted after cycle 3 closure |
| `E_R9AP1R2R2_UNKNOWN_FIELD` | unknown field admitted into canonical object |
| `E_R9AP1R2R2_RENDERER_MUTATION` | armed permit differs from issued permit |

---

# 18. Evidence Artifacts

## 18.1 신규 artifacts

```text
R9AP1R2R2_OWNER_BINDING_RECEIPT.json
R9AP1R2R2_PLAN_INTENT_ENVELOPE.json
R9AP1R2R2_PERMIT_ISSUE_LEDGER.json
R9AP1R2R2_PERMIT_CONSUMPTION_LEDGER.json
R9AP1R2R2_PERMIT_TOMBSTONE_LEDGER.json
R9AP1R2R2_CYCLE_CLOSURE_LEDGER.json
R9AP1R2R2_SENDER_CONTINUITY_LEDGER.json
R9AP1R2R2_MUTATION_NEGATIVE_REPORT.json
R9AP1R2R2_THREE_CYCLE_PERMIT_MATRIX.json
R9AP1R2R2_SOURCE_GATE_REPORT.json
R9AP1R2R2_PACKAGED_FINAL_RECEIPT.json
```

## 18.2 issue ledger row

각 row는 다음을 포함한다.

```text
cycle ordinal
operation kind
operation ID
hook ID
owner binding digest
plan digest
issue request digest
identity snapshot digest
permit digest
permit self-hash
issue receipt digest
issued at
expires at
state = PERMIT_ISSUED
```

## 18.3 consume ledger row

```text
cycle ordinal
sender owner tuple digest
permit digest replay result
permit body exact equality result
issue receipt replay result
operation detail digest
consume request digest
time admission result
tombstone digest
cycle binding digest
state = PERMIT_CONSUMED
```

## 18.4 sender continuity ledger

plan, issue, consume, close 각각의 sender tuple digest를 기록하고 모두 owner binding digest와 exact match였음을 증명한다.

raw PID나 nonce 원문을 public artifact에 넣을 필요는 없다. Main evidence에는 digest와 최소 식별값만 기록한다.

## 18.5 parent evidence preservation

R2-R1 evidence를 수정하거나 새 PASS로 재작성하지 않는다.

R2-R2 artifacts는 별도 child root에 기록하고 parent receipt digest를 lineage로 참조한다.

---

# 19. Negative Controls

## 19.1 permit field mutation matrix

각 필드를 하나씩 변조하고 다음 두 방식 모두 거절해야 한다.

```text
A. body mutate + old digest
B. body mutate + renderer recomputed digest
```

대상 필드:

1. schemaVersion
2. schemaId
3. runId
4. planDigest
5. ownerBindingDigest
6. cycleOrdinal
7. issueSequence
8. operationKind
9. operationId
10. hookId
11. expectedRuntimeEpoch
12. expectedDeviceEpoch
13. expectedDeviceIdentity
14. expectedAdapterIdentity
15. identitySnapshotDigest
16. packageClosureDigest
17. r1BootPermitDigest
18. qualificationSessionDigest
19. nonce
20. issuedAtMs
21. notBeforeMs
22. expiresAtMs
23. permitDigest
24. selfSha256

## 19.2 sender substitution matrix

- different window
- different webContents
- different renderer PID
- different partition
- same webContents after preload reload
- old document nonce
- copied permit from first owner to second owner

## 19.3 sequence matrix

- cycle 2 issue before cycle 1
- cycle 1 duplicate issue
- cycle 1 consume twice
- cycle 2 issue after cycle 1 consume but before closure
- duplicate closure
- prior cycle closure replay
- cycle 4 issue
- issue after COMPLETED

## 19.4 time matrix

- not-before future
- expiry past
- TTL extended
- TTL shortened
- issuedAt after expiresAt
- renderer clock skew only
- Main clock valid path

## 19.5 object-shape matrix

- unknown field
- missing field
- array payload
- accessor field before IPC serialization fixture
- `-0`
- `NaN`
- `Infinity`
- uppercase digest
- padded identity string
- duplicate semantic alias field

## 19.6 concurrency matrix

두 consume call을 같은 event loop turn에 발행한다.

기대:

```text
one consume PASS
one consume E_R9AP1R2R2_PERMIT_ALREADY_CONSUMED
one tombstone only
one cycle binding only
one raw device destroy only
```

---

# 20. Source Gate Catalog

## 20.1 Authority and owner binding

| ID | Requirement |
|---|---|
| `R9AP1R2R2-S001` | R2-R2 authority starts UNBOUND |
| `R9AP1R2R2-S002` | First plan call binds exact owner context |
| `R9AP1R2R2-S003` | Owner receipt has exact schema |
| `R9AP1R2R2-S004` | Owner binding digest replays |
| `R9AP1R2R2-S005` | Owner receipt self-hash replays |
| `R9AP1R2R2-S006` | windowId is included |
| `R9AP1R2R2-S007` | webContentsId is included |
| `R9AP1R2R2-S008` | rendererPid is included and nonzero |
| `R9AP1R2R2-S009` | partitionId is included |
| `R9AP1R2R2-S010` | document nonce digest is included |
| `R9AP1R2R2-S011` | package closure digest is included |
| `R9AP1R2R2-S012` | boot permit digest is included |
| `R9AP1R2R2-S013` | qualification session digest is included |
| `R9AP1R2R2-S014` | second owner plan request is denied |
| `R9AP1R2R2-S015` | owner revoke prevents later calls |

## 20.2 Preload document continuity

| ID | Requirement |
|---|---|
| `R9AP1R2R2-S016` | Preload creates one 32-byte nonce per document |
| `R9AP1R2R2-S017` | nonce is not exposed as public mutable field |
| `R9AP1R2R2-S018` | every recovery IPC carries bridge envelope |
| `R9AP1R2R2-S019` | application caller cannot override nonce |
| `R9AP1R2R2-S020` | reload nonce mismatch negative passes |
| `R9AP1R2R2-S021` | old document consume is denied |

## 20.3 Plan intent

| ID | Requirement |
|---|---|
| `R9AP1R2R2-S022` | Plan schema is v2 |
| `R9AP1R2R2-S023` | Plan contains no consumable permit array |
| `R9AP1R2R2-S024` | Plan exact key set enforced |
| `R9AP1R2R2-S025` | Plan digest replays |
| `R9AP1R2R2-S026` | Plan self-hash replays |
| `R9AP1R2R2-S027` | Owner binding lineage exact |
| `R9AP1R2R2-S028` | Closure lineage exact |
| `R9AP1R2R2-S029` | Qualification session lineage exact |
| `R9AP1R2R2-S030` | Plan has exactly three intents |
| `R9AP1R2R2-S031` | Intent sequence is Preview Export Preview |
| `R9AP1R2R2-S032` | Hook sequence is exact |
| `R9AP1R2R2-S033` | Operation IDs are unique |
| `R9AP1R2R2-S034` | Legacy v1 plan is denied |

## 20.4 JIT issue

| ID | Requirement |
|---|---|
| `R9AP1R2R2-S035` | Issue API exists separately from plan API |
| `R9AP1R2R2-S036` | Issue request exact key set enforced |
| `R9AP1R2R2-S037` | Issue request digest replays |
| `R9AP1R2R2-S038` | Issue request self-hash replays |
| `R9AP1R2R2-S039` | Identity snapshot digest replays |
| `R9AP1R2R2-S040` | Request nonce is one-shot |
| `R9AP1R2R2-S041` | Requested cycle equals next expected cycle |
| `R9AP1R2R2-S042` | Requested intent equals plan intent |
| `R9AP1R2R2-S043` | Prior cycle closure required |
| `R9AP1R2R2-S044` | Same cycle duplicate issue denied |
| `R9AP1R2R2-S045` | Main chooses permit TTL |
| `R9AP1R2R2-S046` | Permit schema is v2 |
| `R9AP1R2R2-S047` | Permit contains owner binding digest |
| `R9AP1R2R2-S048` | Permit contains plan digest |
| `R9AP1R2R2-S049` | Permit contains exact GPU identity tuple |
| `R9AP1R2R2-S050` | Permit contains closure and boot lineage |
| `R9AP1R2R2-S051` | Permit digest replays |
| `R9AP1R2R2-S052` | Permit self-hash replays |
| `R9AP1R2R2-S053` | Issue receipt cross-binds permit |
| `R9AP1R2R2-S054` | Issue receipt digest replays |
| `R9AP1R2R2-S055` | Issue receipt self-hash replays |

## 20.5 Renderer arm

| ID | Requirement |
|---|---|
| `R9AP1R2R2-S056` | Runner no longer spread-overrides permit epochs |
| `R9AP1R2R2-S057` | Holder arm accepts issue envelope |
| `R9AP1R2R2-S058` | Holder replays permit digest |
| `R9AP1R2R2-S059` | Holder replays permit self-hash |
| `R9AP1R2R2-S060` | Holder replays issue receipt |
| `R9AP1R2R2-S061` | Holder compares local runtime epoch |
| `R9AP1R2R2-S062` | Holder compares local device epoch |
| `R9AP1R2R2-S063` | Holder compares local device identity |
| `R9AP1R2R2-S064` | Holder compares local adapter identity |
| `R9AP1R2R2-S065` | Holder compares identity snapshot digest |
| `R9AP1R2R2-S066` | Holder compares plan intent exact |
| `R9AP1R2R2-S067` | Holder compares owner binding exact |
| `R9AP1R2R2-S068` | Holder deep-freezes admitted permit |
| `R9AP1R2R2-S069` | Mutated arm permit is denied |

## 20.6 Consume and tombstone

| ID | Requirement |
|---|---|
| `R9AP1R2R2-S070` | Consume request exact key set enforced |
| `R9AP1R2R2-S071` | Consume request digest replays |
| `R9AP1R2R2-S072` | Consume request self-hash replays |
| `R9AP1R2R2-S073` | Consume sender equals issue owner |
| `R9AP1R2R2-S074` | Request permit equals Main stored permit deep-exact |
| `R9AP1R2R2-S075` | All permit fields are replayed |
| `R9AP1R2R2-S076` | Unknown permit field denied |
| `R9AP1R2R2-S077` | Missing permit field denied |
| `R9AP1R2R2-S078` | Old digest mutation denied |
| `R9AP1R2R2-S079` | Recomputed digest mutation denied |
| `R9AP1R2R2-S080` | Time window exact fields compared |
| `R9AP1R2R2-S081` | Expired permit denied |
| `R9AP1R2R2-S082` | Future permit denied |
| `R9AP1R2R2-S083` | TTL mutation denied |
| `R9AP1R2R2-S084` | Operation hook equals permit |
| `R9AP1R2R2-S085` | Operation ID equals permit |
| `R9AP1R2R2-S086` | Operation GPU identity equals permit |
| `R9AP1R2R2-S087` | Tombstone is inserted atomically |
| `R9AP1R2R2-S088` | Tombstone digest replays |
| `R9AP1R2R2-S089` | Tombstone self-hash replays |
| `R9AP1R2R2-S090` | Permit replay denied |
| `R9AP1R2R2-S091` | Nonce replay denied |
| `R9AP1R2R2-S092` | Concurrent double consume yields one success |
| `R9AP1R2R2-S093` | One consume yields one cycle binding |
| `R9AP1R2R2-S094` | One consume yields one raw-device destroy path |

## 20.7 Cycle closure and integration

| ID | Requirement |
|---|---|
| `R9AP1R2R2-S095` | Cycle binding schema v2 exists |
| `R9AP1R2R2-S096` | Binding contains permit self-hash |
| `R9AP1R2R2-S097` | Binding contains issue receipt digest |
| `R9AP1R2R2-S098` | Binding contains tombstone digest |
| `R9AP1R2R2-S099` | R2-R1 exact event correlation remains active |
| `R9AP1R2R2-S100` | Holder emits cycle closure receipt |
| `R9AP1R2R2-S101` | Closure receipt digest replays |
| `R9AP1R2R2-S102` | Closure receipt self-hash replays |
| `R9AP1R2R2-S103` | Main accepts closure once only |
| `R9AP1R2R2-S104` | Next cycle issue requires prior closure |
| `R9AP1R2R2-S105` | Cycle 3 closure completes authority |
| `R9AP1R2R2-S106` | Mutation after COMPLETED is denied |

## 20.8 Evidence and build closure

| ID | Requirement |
|---|---|
| `R9AP1R2R2-S107` | Owner binding artifact emitted |
| `R9AP1R2R2-S108` | Plan intent artifact emitted |
| `R9AP1R2R2-S109` | Permit issue ledger emitted |
| `R9AP1R2R2-S110` | Consume ledger emitted |
| `R9AP1R2R2-S111` | Tombstone ledger emitted |
| `R9AP1R2R2-S112` | Closure ledger emitted |
| `R9AP1R2R2-S113` | Sender continuity ledger emitted |
| `R9AP1R2R2-S114` | Mutation negative report emitted |
| `R9AP1R2R2-S115` | Parent R2-R1 receipt remains byte-preserved |
| `R9AP1R2R2-S116` | Active graph includes new authority files |
| `R9AP1R2R2-S117` | TypeScript semantic compile passes |
| `R9AP1R2R2-S118` | Main ESM parse passes |
| `R9AP1R2R2-S119` | Preload CJS parse passes |
| `R9AP1R2R2-S120` | Source final receipt does not claim physical PASS |

Source admission target:

```text
120 SOURCE PASS
0 SOURCE FAIL
packaged physical rows remain PENDING
```

---

# 21. Packaged Physical Gate Catalog

| ID | Requirement |
|---|---|
| `R9AP1R2R2-P001` | Packaged Electron only |
| `R9AP1R2R2-P002` | External build admission sidecar valid |
| `R9AP1R2R2-P003` | Package closure unchanged through run |
| `R9AP1R2R2-P004` | One owner binding receipt exists |
| `R9AP1R2R2-P005` | All recovery IPC sender tuples equal owner |
| `R9AP1R2R2-P006` | One preload document nonce digest used |
| `R9AP1R2R2-P007` | Plan has three intents and zero permits |
| `R9AP1R2R2-P008` | Three JIT permits issued sequentially |
| `R9AP1R2R2-P009` | No permit prefetch occurred |
| `R9AP1R2R2-P010` | Each permit identity matches pre-loss GPU SSOT |
| `R9AP1R2R2-P011` | Each permit full digest replays |
| `R9AP1R2R2-P012` | Each issue receipt replays |
| `R9AP1R2R2-P013` | Each consume occurred inside Main time window |
| `R9AP1R2R2-P014` | Exactly three tombstones exist |
| `R9AP1R2R2-P015` | Tombstone permit digests are unique |
| `R9AP1R2R2-P016` | Tombstone nonce digests are unique |
| `R9AP1R2R2-P017` | Exactly three cycle bindings v2 exist |
| `R9AP1R2R2-P018` | Binding parent permit identities exact |
| `R9AP1R2R2-P019` | Preview cycle 1 lost operation rejects |
| `R9AP1R2R2-P020` | Export cycle 2 terminal map operation rejects |
| `R9AP1R2R2-P021` | Preview cycle 3 lost operation rejects |
| `R9AP1R2R2-P022` | Each raw device is destroyed exactly once |
| `R9AP1R2R2-P023` | Each device epoch increments exactly once |
| `R9AP1R2R2-P024` | Adapter identity remains stable each cycle |
| `R9AP1R2R2-P025` | Three cycle closure receipts exist |
| `R9AP1R2R2-P026` | Each next permit follows prior closure |
| `R9AP1R2R2-P027` | Mutation negative matrix executed in isolated child run |
| `R9AP1R2R2-P028` | Cross-window copied permit is denied |
| `R9AP1R2R2-P029` | Reloaded document old permit is denied |
| `R9AP1R2R2-P030` | Concurrent consume produces one tombstone |
| `R9AP1R2R2-P031` | Post-recovery Preview and Export validation pass all cycles |
| `R9AP1R2R2-P032` | No lost Export host output created |
| `R9AP1R2R2-P033` | Parent R2-R1 terminal evidence remains valid |
| `R9AP1R2R2-P034` | Raw ledgers replay without trusting summary counts |
| `R9AP1R2R2-P035` | Authority final state is COMPLETED |
| `R9AP1R2R2-P036` | Final receipt self-hash and artifact lineage pass |

Physical admission target:

```text
36 PACKAGED PHYSICAL PASS
0 FAIL
Preview / Export / Preview exact order
```

---

# 22. 구현 대상 파일

## 22.1 Main

```text
app/electron/resample-runtime-r9a-p1-r2/recovery-permit-authority.mjs
app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs
app/electron/resample-runtime-r9a-p1-r2/lib.mjs
```

권장 분리:

```text
app/electron/resample-runtime-r9a-p1-r2-r2/owner-binding.mjs
app/electron/resample-runtime-r9a-p1-r2-r2/permit-codec.mjs
app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs
app/electron/resample-runtime-r9a-p1-r2-r2/evidence-finalizer.mjs
```

## 22.2 Preload

```text
preload.cjs
```

## 22.3 Renderer

```text
app/src/runtime/recovery/r9a-p1-r2-recovery-types.ts
app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts
app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts
app/src/runtime/gpu/gpu-device-authority-service.ts
app/src/env.d.ts
```

## 22.4 Gate and artifact tooling

```text
tools/verify_tdt_resample_runtime_01_r9a_p1_r2_r2_source.mjs
tools/finalize_tdt_resample_runtime_01_r9a_p1_r2_r2_packaged.mjs
artifacts/resample-runtime-01-r9a-p1-r2-r2/source-bake/
patches/TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R2_jit_permit_integrity.diff
```

---

# 23. 적용 순서

1. R2-R2 canonical codec와 exact key validator 추가
2. preload document instance nonce 및 envelope 추가
3. Main owner binding authority 추가
4. recovery plan v2 intent-only schema 교체
5. JIT issueCyclePermit API 추가
6. permit v2와 issue receipt 추가
7. holder plan replay 강화
8. runner spread override 제거
9. holder arm envelope 및 GPU SSOT exact replay 추가
10. consume request v2 교체
11. atomic tombstone 추가
12. cycle binding v2 parent fields 추가
13. holder cycle closure receipt 추가
14. Main acknowledgeCycleClosure 추가
15. next-cycle issue barrier 추가
16. raw evidence writers 추가
17. mutation·sender·sequence negative tests 추가
18. Source Gate 120개 실행
19. production build admission 재시도
20. packaged Preview / Export / Preview physical replay
21. packaged finalizer 36개 replay

---

# 24. 완료 조건

## 24.1 Source 완료

```text
120 SOURCE PASS
0 SOURCE FAIL
legacy v1 path denied
runner permit mutation removed
all mutation and sender negatives pass
parent R2-R1 regression pass
```

## 24.2 Physical 완료

```text
36 PACKAGED PHYSICAL PASS
3 JIT permits
3 atomic tombstones
3 exact cycle bindings v2
3 cycle closure receipts
0 copied permit passage
0 renderer permit mutation
0 duplicate consume
0 lost Export host output
```

## 24.3 HOLD 조건

다음 중 하나라도 발생하면 final state는 HOLD 또는 FAIL이다.

- external build admission unavailable
- packaged Electron 미실행
- physical cycle count 3 미만
- permit v1 passage
- owner continuity 미증명
- plan에 consumable permit 잔존
- renderer spread override 잔존
- full-field mutation negative 미실행
- tombstone count 3 미만 또는 초과
- next permit issued before prior closure
- summary count만 검사하고 raw ledger replay 없음

---

# 25. 후속 패치 경계

R2-R2가 닫는 것은 **누가, 어떤 GPU identity에, 어떤 한 장의 permit을, 한 번만 소비할 수 있는가**다.

다음 패치는 permit이 아니라 recovery 후 계산 자원 재구축을 닫는다.

```text
TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3

Explicit Canonical Pipeline Rebuild Authority /
Registry Single-Flight Build /
Epoch-Bound Pipeline Set Receipt /
EWA·Tensor·Adaptive Eager Reacquisition /
Old Pipeline Reuse Denial /
Rebuild-Before-Validation Seal
```

R2-R3 전까지 R2-R2는 pipeline rebuild completion을 주장하지 않는다.

---

# 26. 최종 봉인 문장

```text
A controlled-loss permit is not a mutable renderer hint.
It is a Main-issued, owner-bound, GPU-identity-bound, closure-bound,
short-lived, exact-body capability that may cross the loss boundary once.

The plan schedules intent.
The JIT permit authorizes one cycle.
The tombstone ends that authority permanently.
```
