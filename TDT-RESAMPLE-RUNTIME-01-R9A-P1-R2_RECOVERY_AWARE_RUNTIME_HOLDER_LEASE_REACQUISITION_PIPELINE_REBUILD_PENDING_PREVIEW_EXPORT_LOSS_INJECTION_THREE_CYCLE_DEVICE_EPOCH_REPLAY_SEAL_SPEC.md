# TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2

## Recovery-Aware Runtime Holder /
## Lease Reacquisition /
## Pipeline Rebuild /
## Pending Preview·Export Loss Injection /
## Three-Cycle Device Epoch Replay Seal

> 상태: 명세 rev.1
> 기준 부모: `61_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R1_NORMAL_RUNTIME_PUBLIC_ENTRY_SOURCE_BAKED_AWAITING_PACKAGED_QUALIFICATION.zip`
> 부모 번들 SHA-256: `32b9f04c369122273359c3c35027cf3a7ed6561c9042700160b5596724142382`
> 부모 R1 명세 SHA-256: `cd21fbbf71c06fc8766967c3c12bd8c46758310ec6ba0ef7f0643fff155fb1c9`
> 부모 R1 Source Final Receipt SHA-256: `50f9bbaa8786fd90d4fbb182c37760b3464f4bc1a0445eaec4ddafd4c8c022db`
> 부모 R1 receipt self SHA-256: `b724304c2206a96043ab5f8be08c43b17ad83f616c11e0dce6205398cd0e2959`
> 부모 R1 implementation digest: `66672a77bc1c3fe2afa12c1e74e274a10176ed35eabc871875a16801e6057a79`
> 선행 physical 필수: Build Lock R2 Win32 final 580 PASS + R9A-P1-R1 packaged final 360 PASS
> 후속 필수: P1-R3 common raw evidence envelope, P1-R4 performance·residency threshold, P1-R5 adapter matrix
> 원칙: 동일 Runtime Composition 유지, GPU Authority 단일 writer, old epoch 즉시 무효화, pipeline 명시적 dispose·rebuild, public Preview·Export entry 유지, controlled loss 3회, historical pass carry-forward 0

---

# 0. 목적

P1-R1은 qualification을 정상 `bootstrapRenderer()`와 `createRuntimeComposition()`에 연결하고 Preview와 Export를 공개 제품 진입점으로 통과시켰다. 그러나 현재 device-loss 경로는 정상 composition에 연결되지 않았다. 과거 `device-loss-driver.mjs`는 cycle마다 별도 runtime을 만들고 `runtime.device.destroy()`를 직접 호출하며, P1-R1 qualification runner에서는 호출되지 않는다.

또한 GPU Authority는 recovery participant orchestration과 stale lease rejection을 이미 갖지만, 현재 profile의 `maxAttemptsPerRuntimeEpoch`가 1이다. 같은 runtime epoch에서 요구하는 3회 연속 device-loss replay는 현 상태로는 두 번째 loss에서 `E_GPU_RECOVERY_EXHAUSTED`로 종료된다. canonical resample pipeline은 legacy compatibility module의 `WeakMap<GPUDevice, PipelineBundle>`에 귀속되어 있어 old bundle의 명시적 disposal과 새 epoch rebuild 증거가 없다. `PipelineService`도 lost GPU final surface를 가리키는 binding과 publication을 직접 무효화하는 recovery participant가 아니다.

P1-R2는 다음 경로를 닫는다.

```text
R1 verified normal Runtime Composition
→ main-issued exact three-cycle recovery budget
→ Recovery-Aware Runtime Holder
→ public Preview / Export operation pending hook
→ GPU Authority owned one-shot controlled loss
→ lost lease·ticket·uniform·surface invalidation
→ replacement device acquisition
→ explicit canonical pipeline disposal and rebuild
→ new lease acquisition
→ fixture republish on new device epoch
→ Preview and Export public-entry validation
→ three monotonic device epoch cycle receipts
```

P1-R2는 성능 threshold, 장시간 residency plateau, RTX 3080·GTX 950M 최종 matrix를 봉인하지 않는다. 해당 권위는 P1-R4와 P1-R5에 남긴다.

# 1. 현재 코드에서 직접 확인된 사실

## 1.1 GPU Authority recovery 골격은 존재한다

- `GpuDeviceAuthorityService`는 device loss 시 active lease를 stale로 만들고 shader·pipeline cache를 비운다.
- recovery participant를 order 기준으로 `invalidate`한 뒤 replacement device를 요청하고 `rebuild`를 실행한다.
- lease는 `deviceEpoch`와 `deviceIdentity`에 귀속되며 old epoch에서 `assertCurrent()`가 실패한다.
- command graph는 `dadum:runtime-device-lost` 이벤트를 받아 submission ticket과 uniform ring slot을 lost epoch 단위로 무효화한다.

판정: 기반 recovery authority는 실제 구현되어 있다. P1-R2는 새 device authority를 만들지 않는다.

## 1.2 현재 recovery budget은 1회다

`gpu-authority-profile.json`의 현재 값:

```json
{ "recovery": { "enabled": true, "maxAttemptsPerRuntimeEpoch": 1, "reuseSelectedAdapterFirst": true, "allowAdapterReselection": false } }
```

판정: 3-cycle replay와 직접 충돌한다. normal runtime 기본 정책을 환경변수로 느슨하게 늘리지 않고, R1 qualification permit에 묶인 정확히 3회짜리 예산을 GPU Authority가 소비해야 한다.

## 1.3 기존 device-loss driver는 정상 제품 경로가 아니다

`app/renderer/physical-r9a-p1/device-loss-driver.mjs`는 cycle마다 `createRuntime(cycle)`을 호출하고 외부에서 전달된 `runtime.device.destroy()`를 실행한다. P1-R1 normal-composition runner는 이 모듈을 호출하지 않는다.

판정: P1-R2는 이 파일을 본선에 재채택하지 않는다. 동일 composition과 동일 RuntimeServiceContainer를 유지한 채 GPU Authority 내부 controlled-loss API를 사용한다.

## 1.4 canonical resample pipeline 수명이 WeakMap에 숨겨져 있다

`resample_compatibility_r1d.mjs`는 `WeakMap<device, pipes>`를 사용해 `createDeltaKStack(device)` 결과를 캐시한다. 새 device에서는 새 bundle이 만들어지지만 old bundle이 언제 dispose됐는지, R4·R6 pipeline이 새 epoch에서 실제 rebuild됐는지 finalizer가 증명할 수 없다.

판정: P1-R2는 explicit pipeline registry와 lifecycle receipt를 추가한다. GC는 disposal 증거가 아니다.

## 1.5 Pipeline final binding은 device loss 뒤 stale할 수 있다

Surface Registry는 lost device epoch의 GPU surface를 invalidation한다. 그러나 `PipelineService`는 현재 recovery participant가 아니며 `#binding`과 `#publication`을 유지한다. PreviewPresenter는 rebuild 시 GPU texture publication을 재enqueue하지 않지만 `requireFinal()` 자체는 stale binding을 계속 반환할 수 있다.

판정: PipelineService가 lost GPU final tuple을 명시적으로 철회하고 final invalidation receipt를 발행해야 한다. recovery 뒤에는 fixture를 새 device에서 다시 publish해야 한다.

# 2. 목표와 비목표

## 2.1 목표
- R1 normal Runtime Composition을 세 cycle 동안 유지한다.
- GPU Authority가 controlled loss를 직접 소유한다.
- main-issued one-shot permit 없이는 device destruction을 허용하지 않는다.
- Preview pending 2회와 Export pending 1회에 loss를 주입한다.
- 각 pending operation이 성공으로 오염되지 않고 stable device-loss terminal state로 끝난다.
- old lease·submission ticket·uniform slot·GPU surface를 lost epoch에서 즉시 무효화한다.
- canonical resample pipeline bundle을 명시적으로 dispose하고 replacement device에서 rebuild한다.
- PipelineService의 stale final binding과 publication을 철회한다.
- 각 recovery 뒤 동일 fixture semantics를 새 device epoch에서 republish한다.
- post-recovery Preview와 Export가 공개 제품 entry로 성공한다.
- initial + 3 replacement device epoch의 단조 체인을 raw evidence로 봉인한다.

## 2.2 비목표
- R4·R6 EWA 수학 변경
- GPU Device Authority 다중 adapter 설계
- production normal mode에서 무제한 recovery 허용
- R9A performance ratio 최종 판정
- 1,024-job residency plateau 최종 판정
- RTX 3080·GTX 950M dual-device matrix 최종 판정
- R10A Production Pointer promotion
- R11A installed PASS
- R13A fleet PASS
- R14A distribution PASS

# 3. 권위 모델

```text
GPU Device Authority
= device loss 감지, recovery budget, device destruction, replacement device commit SSOT

Recovery-Aware Runtime Holder
= 동일 composition의 recovery cycle state, current epoch, operation pending, validation sequence SSOT

Canonical Pipeline Registry
= device identity별 EWA·tensor·adaptive pipeline bundle lifecycle SSOT

PipelineService
= final surface binding·revision·publication SSOT

Main Recovery Coordinator
= cycle plan과 one-shot loss permit 발행 SSOT

Preview public entry
= DadumPreviewPresenter.requestPresent()

Export public entry
= DadumRuntimeExport.exportFinal()
```

## 3.1 비권위
- qualification runner가 직접 호출한 `device.destroy()`
- 새 runtime을 cycle마다 다시 만드는 driver
- 환경변수의 `cycles=3` 문자열
- WeakMap entry가 GC됐을 것이라는 추정
- `deviceLossRecoveryCycleCount: 3` 상수
- old final surface를 CPU bytes로 조용히 대체한 결과
- Preview·Export summary boolean
- 과거 R9A physical receipt carry-forward

# 4. Recovery-Aware Runtime Holder

새 RuntimeService:

```ts
SERVICE_IDS.recoveryAwareRuntimeHolder = 'dadum.runtime.r9a-p1-r2-recovery-holder'

type RecoveryHolderState =
  | 'READY' | 'ARMING' | 'OPERATION_PENDING' | 'LOSS_INJECTED'
  | 'INVALIDATING' | 'REACQUIRING' | 'REBUILDING' | 'VALIDATING'
  | 'FAILED' | 'DISPOSED'

interface RecoveryHolderSnapshot {
  runtimeEpoch: number
  recoveryGeneration: number
  state: RecoveryHolderState
  currentDeviceEpoch: number
  currentDeviceIdentity: string
  activeCycle: null | 1 | 2 | 3
  activeOperationKind: null | 'preview' | 'export'
  activeOperationId: string | null
  currentPublication: FinalSurfacePublication | null
}
```

Holder는 `GPUDevice`와 `GPUQueue`를 영구 필드에 저장하지 않는다. GPU object 접근은 operation-scoped lease 안에서만 허용한다. Holder는 normal RuntimeServiceContainer에서 생성되며 qualification runner는 public facade만 호출한다.

# 5. Qualification Recovery Budget

normal profile의 기본 recovery 정책과 qualification 3-cycle 정책을 분리한다.

```ts
interface QualificationRecoveryBudgetV1 {
  schemaId: 'tdt.r9a-p1-r2.qualification-recovery-budget.v1'
  runId: string
  packageClosureDigest: string
  r1BootPermitDigest: string
  rendererPid: number
  windowId: number
  runtimeEpoch: number
  startingDeviceEpoch: number
  allowedCycles: 3
  consumedCycles: number
  expiresAt: string
  selfSha256: string
}
```

정상 앱에서 qualification permit가 없으면 기존 recovery budget을 유지한다. qualification session에서만 exact 3-cycle budget을 설치한다. 4번째 loss는 `E_R9AP1R2_RECOVERY_BUDGET_EXHAUSTED`로 거부한다.

# 6. Controlled Loss Permit

```ts
interface ControlledLossPermitV1 {
  schemaId: 'tdt.r9a-p1-r2.controlled-loss-permit.v1'
  runId: string
  cycleOrdinal: 1 | 2 | 3
  operationKind: 'preview' | 'export'
  operationId: string
  hookId: string
  expectedRuntimeEpoch: number
  expectedDeviceEpoch: number
  expectedDeviceIdentity: string
  packageClosureDigest: string
  r1BootPermitDigest: string
  notBefore: string
  expiresAt: string
  nonce: string
  consumed: false
  selfSha256: string
}
```

loss injection은 GPU Authority 내부 API가 permit을 소비한 다음 현재 raw device를 정확히 한 번 destroy하는 방식이다. renderer runner는 raw device를 받지 않는다.

# 7. Pending Injection Points

## 7.1 Preview pending hook

```text
DadumPreviewPresenter.requestPresent()
→ operation grant ACTIVE
→ final surface pin ACTIVE
→ preview GPU lease ACTIVE
→ render command submitted
→ submission ticket IN_FLIGHT
→ completion unresolved
→ R9AP1R2_PREVIEW_SUBMISSION_PENDING
→ controlled device loss
```

## 7.2 Export pending hook

```text
DadumRuntimeExport.exportFinal()
→ operation grant ACTIVE
→ final surface pin ACTIVE
→ canonical encoder job ACTIVE
→ terminal GPU readback submitted
→ mapAsync unresolved
→ host save not started
→ R9AP1R2_EXPORT_TERMINAL_MAP_PENDING
→ controlled device loss
```

cycle pattern은 고정한다.

```text
cycle 1 = Preview pending loss
cycle 2 = Export pending loss
cycle 3 = Preview pending loss
```

# 8. Operation Terminal Semantics

lost operation은 성공 receipt를 만들 수 없다.

```text
pending operation
→ device loss
→ promise reject
→ operation grant ABORTED
→ surface pin release
→ ticket LOST
→ late callback ignored
```

Export lost cycle에서는 `exportSave.begin` 이전이어야 하며 output file과 host save receipt는 0개여야 한다.

# 9. Explicit Pipeline Registry

legacy `WeakMap<GPUDevice, pipes>`만으로 pipeline lifetime을 관리하지 않는다.

```ts
interface CanonicalPipelineEntryV1 {
  state: 'BUILDING' | 'ACTIVE' | 'INVALIDATED' | 'DISPOSED'
  runtimeEpoch: number
  deviceEpoch: number
  deviceIdentity: string
  bundleDigest: string
  r4PipelineDigest: string
  r6PipelineDigest: string
  tensorPipelineDigest: string
  adaptivePolicyPipelineDigest: string
  generatedShaderManifestDigest: string
}
```

loss invalidate에서 old bundle의 EWA·tensor·adaptive pipeline disposer를 명시적으로 호출한다. replacement device commit 뒤 holder의 rebuild 단계에서 canonical internal registry API로 새 bundle을 만든다. qualification runner가 `createDeltaKStack()`을 직접 import하는 것은 계속 금지한다.

# 10. Pipeline Final Binding Invalidation

PipelineService를 GPU recovery participant로 만든다.

```text
Surface Registry invalidate order -1000
→ Analysis authorities
→ Pipeline final-binding invalidate order -700
→ Resample broker invalidate order 80
→ Recovery holder reconcile order 900
→ Preview presenter rebuild order 1000
```

lost GPU surface를 가리키는 `#binding`과 `#publication`은 철회한다. final revision과 publication sequence counter는 감소하지 않는다. post-recovery fixture publication은 새 surface ID와 더 큰 final revision을 만든다.

# 11. Lease Reacquisition

각 recovery 뒤 다음 lease를 새로 관측한다.

- canonical runtime-pipeline lease
- PreviewPresenter lease
- Export readback 또는 encoder path lease

old lease는 `assertCurrent`, `device`, `queue` 접근에서 모두 `E_GPU_STALE_LEASE`를 내야 한다. old lease를 new epoch로 업데이트하는 방식은 금지한다.

# 12. Three-Cycle Replay

각 cycle은 같은 RuntimeServiceContainer와 runtime epoch를 유지한다.

```text
initial device epoch E0
cycle 1 Preview loss: E0 → E1
cycle 2 Export loss:  E1 → E2
cycle 3 Preview loss: E2 → E3
```

매 cycle 후 mandatory validation:

- canonical fixture republish
- new surface ID
- monotonic final revision
- R4 pipeline identity
- R6 pipeline identity
- 32 validation counters zero
- Preview public entry success
- Export public entry success
- shared final-surface tuple exact
- active lease count zero after completion

# 13. Raw Evidence

필수 child artifacts:

- `R9AP1R2_RECOVERY_PLAN.json`
- `R9AP1R2_RECOVERY_BUDGET_RECEIPT.json`
- `R9AP1R2_LOSS_PERMIT_LEDGER.json`
- `R9AP1R2_RUNTIME_HOLDER_LEDGER.json`
- `R9AP1R2_DEVICE_EPOCH_LEDGER.json`
- `R9AP1R2_LEASE_LEDGER.json`
- `R9AP1R2_PIPELINE_REGISTRY_LEDGER.json`
- `R9AP1R2_FINAL_SURFACE_INVALIDATION_LEDGER.json`
- `R9AP1R2_OPERATION_LOSS_LEDGER.json`
- `R9AP1R2_POST_RECOVERY_VALIDATION_LEDGER.json`
- `R9AP1R2_THREE_CYCLE_MATRIX_RECEIPT.json`
- `R9AP1R2_ARTIFACT_MANIFEST.json`

각 artifact는 `runId`, package closure digest, sidecar digest, R1 boot permit digest, cycle ordinal, old/new device epoch, self hash를 포함한다.

# 14. Finalizer

finalizer는 다음 raw evidence를 직접 replay한다.

- GPU Authority state events
- device-lost·recovered events
- loss permit consumption
- operation pending hook
- operation reject terminal state
- lease acquisition·stale rejection
- submission ticket state
- uniform ring state
- pipeline entry lifecycle
- surface invalidation and republish
- Preview and Export receipts
- resource cleanup counts

다음 상수형 최종 필드는 금지한다.

```text
deviceLossRecoveryCycleCount = 3
pipelineRebuildCount = 3
staleLeaseAcceptCount = 0
```

모든 값은 raw ledger에서 재계산한다. child evidence가 없으면 `E_R9AP1R2_CHILD_EVIDENCE_MISSING`으로 실패한다.

# 15. 오류 코드

| Code | Meaning |
|---|---|
| `E_R9AP1R2_RECOVERY_BUDGET_MISSING` | qualification recovery budget missing |
| `E_R9AP1R2_RECOVERY_BUDGET_EXHAUSTED` | more than three recovery cycles |
| `E_R9AP1R2_LOSS_PERMIT_INVALID` | loss permit identity mismatch |
| `E_R9AP1R2_LOSS_PERMIT_REPLAY` | one-shot permit reused |
| `E_R9AP1R2_OPERATION_NOT_PENDING` | loss hook has no pending product operation |
| `E_R9AP1R2_DIRECT_DEVICE_DESTROY_FORBIDDEN` | runner attempted raw device destruction |
| `E_R9AP1R2_RUNTIME_RECREATED` | runtime composition changed between cycles |
| `E_R9AP1R2_STALE_LEASE_ACCEPTED` | lost-epoch lease remained usable |
| `E_R9AP1R2_PIPELINE_DISPOSAL_MISSING` | old pipeline bundle was not disposed |
| `E_R9AP1R2_PIPELINE_REBUILD_MISSING` | replacement pipeline bundle missing |
| `E_R9AP1R2_STALE_FINAL_BINDING` | pipeline retained lost final surface |
| `E_R9AP1R2_OPERATION_RESOLVED_AFTER_LOSS` | lost operation resolved successfully |
| `E_R9AP1R2_EXPORT_SAVE_AFTER_LOSS` | lost export committed output |
| `E_R9AP1R2_DEVICE_EPOCH_NON_MONOTONIC` | device epoch chain is not monotonic |
| `E_R9AP1R2_CHILD_EVIDENCE_MISSING` | raw child evidence missing |
| `E_R9AP1R2_SUMMARY_ONLY_EVIDENCE` | summary boolean used instead of raw replay |

# 16. Negative Controls

- budget absent
- budget four cycles
- cycle permit reuse
- cycle order swap
- wrong renderer PID
- wrong device epoch
- loss before pending hook
- loss after completion
- runner direct device destroy
- runtime recreated per cycle
- old lease accepted
- old pipeline bundle reused
- old final surface reused
- Preview lost operation resolves
- Export lost operation saves file
- pipeline rebuild receipt removed
- device epoch decremented
- adapter identity switched
- constant final cycle count injected
- summary-only finalization

# 17. Gate Catalog

## SOURCE: PARENT_LINEAGE_AND_FREEZE

| Gate | Requirement |
|---|---|
| `R9AP1R2-S001` | Parent R9A-P1-R1 bundle digest is exact |
| `R9AP1R2-S002` | Parent R9A-P1-R1 specification digest is exact |
| `R9AP1R2-S003` | Parent R9A-P1-R1 source receipt file digest is exact |
| `R9AP1R2-S004` | Parent R9A-P1-R1 receipt self-hash is exact |
| `R9AP1R2-S005` | Parent R9A-P1-R1 implementation digest is exact |
| `R9AP1R2-S006` | Build Lock R2 source receipt lineage is preserved |
| `R9AP1R2-S007` | R9A-P1 source receipt lineage is preserved |
| `R9AP1R2-S008` | Production Pointer first mirror is frozen |
| `R9AP1R2-S009` | Production Pointer second mirror is frozen |
| `R9AP1R2-S010` | Local Activation Pointer is frozen |
| `R9AP1R2-S011` | Package lock bytes are frozen during source bake |
| `R9AP1R2-S012` | R1 external sidecar contract remains authoritative |
| `R9AP1R2-S013` | R1 packaged closure binding contract remains authoritative |
| `R9AP1R2-S014` | R1 normal composition boot contract remains authoritative |
| `R9AP1R2-S015` | R1 Preview public entry remains authoritative |
| `R9AP1R2-S016` | R1 Export public entry remains authoritative |
| `R9AP1R2-S017` | R1 no-direct-driver seal remains authoritative |
| `R9AP1R2-S018` | Historical physical PASS carry-forward is zero |
| `R9AP1R2-S019` | Historical packaged PASS carry-forward is zero |
| `R9AP1R2-S020` | Parent source tree mutation count is zero |
| `R9AP1R2-S021` | Parent receipt rewrite count is zero |
| `R9AP1R2-S022` | Parent pointer CAS count is zero |
| `R9AP1R2-S023` | Parent package closure claim is not fabricated |
| `R9AP1R2-S024` | Parent Build Lock Win32 claim is not fabricated |
| `R9AP1R2-S025` | Parent R1 packaged claim is not fabricated |
| `R9AP1R2-S026` | R2 patch identity is exact |
| `R9AP1R2-S027` | R2 specification is installed under specs |
| `R9AP1R2-S028` | R2 source gate catalog is generated deterministically |
| `R9AP1R2-S029` | R2 packaged gate catalog is generated deterministically |
| `R9AP1R2-S030` | Parent freeze receipt is self-hashed |

## SOURCE: RECOVERY_AUTHORITY_CONTRACT

| Gate | Requirement |
|---|---|
| `R9AP1R2-S031` | GPU Authority remains the sole adapter authority |
| `R9AP1R2-S032` | GPU Authority remains the sole device authority |
| `R9AP1R2-S033` | Recovery is initiated only by GPU Authority |
| `R9AP1R2-S034` | Raw GPUDevice destroy is not exposed to qualification runner |
| `R9AP1R2-S035` | Recovery participant order is deterministic |
| `R9AP1R2-S036` | Recovery invalidate phase completes before device reacquisition |
| `R9AP1R2-S037` | Device identity is cleared before replacement device commit |
| `R9AP1R2-S038` | Replacement device epoch increases exactly once per cycle |
| `R9AP1R2-S039` | Replacement device identity differs from lost identity |
| `R9AP1R2-S040` | Shader cache never crosses device epoch |
| `R9AP1R2-S041` | Pipeline cache never crosses device epoch |
| `R9AP1R2-S042` | All old leases are marked stale on loss |
| `R9AP1R2-S043` | Stale lease assertCurrent fails closed |
| `R9AP1R2-S044` | Old queue access through stale lease fails closed |
| `R9AP1R2-S045` | Old device access through stale lease fails closed |
| `R9AP1R2-S046` | Recovery failure enters terminal FATAL state |
| `R9AP1R2-S047` | Recovery success emits one recovered event |
| `R9AP1R2-S048` | Loss emits one device-lost event |
| `R9AP1R2-S049` | Recovery event binds runtime epoch |
| `R9AP1R2-S050` | Recovery event binds old device epoch |
| `R9AP1R2-S051` | Recovery event binds new device epoch |
| `R9AP1R2-S052` | Recovery event binds old device identity |
| `R9AP1R2-S053` | Recovery event binds new device identity |
| `R9AP1R2-S054` | Recovery receipt binds adapter identity |
| `R9AP1R2-S055` | Recovery receipt binds admitted feature set |
| `R9AP1R2-S056` | Recovery participant collision is rejected |
| `R9AP1R2-S057` | Recovery participant unregister is idempotent |
| `R9AP1R2-S058` | No global raw device alias is created |
| `R9AP1R2-S059` | No fallback adapter retry is introduced |
| `R9AP1R2-S060` | Recovery authority contract receipt is self-hashed |

## SOURCE: QUALIFICATION_RECOVERY_BUDGET

| Gate | Requirement |
|---|---|
| `R9AP1R2-S061` | Normal runtime default recovery budget remains explicit |
| `R9AP1R2-S062` | Qualification recovery budget is exactly three |
| `R9AP1R2-S063` | Qualification budget requires R1 qualification permit |
| `R9AP1R2-S064` | Qualification budget binds run ID |
| `R9AP1R2-S065` | Qualification budget binds package closure digest |
| `R9AP1R2-S066` | Qualification budget binds external sidecar digest |
| `R9AP1R2-S067` | Qualification budget binds renderer process ID |
| `R9AP1R2-S068` | Qualification budget binds window ID |
| `R9AP1R2-S069` | Qualification budget binds runtime epoch |
| `R9AP1R2-S070` | Qualification budget binds starting device epoch |
| `R9AP1R2-S071` | Qualification budget permits cycle ordinals one through three only |
| `R9AP1R2-S072` | Qualification budget cannot be installed twice |
| `R9AP1R2-S073` | Qualification budget cannot be extended by renderer input |
| `R9AP1R2-S074` | Qualification budget cannot be extended by environment variable alone |
| `R9AP1R2-S075` | Qualification budget cannot exceed three |
| `R9AP1R2-S076` | Fourth loss attempt is rejected |
| `R9AP1R2-S077` | Consumed cycle permit cannot be replayed |
| `R9AP1R2-S078` | Cycle permits are issued sequentially |
| `R9AP1R2-S079` | Cycle two requires cycle one terminal receipt |
| `R9AP1R2-S080` | Cycle three requires cycle two terminal receipt |
| `R9AP1R2-S081` | Expired loss permit is rejected |
| `R9AP1R2-S082` | Wrong operation-kind permit is rejected |
| `R9AP1R2-S083` | Wrong hook permit is rejected |
| `R9AP1R2-S084` | Wrong device epoch permit is rejected |
| `R9AP1R2-S085` | Wrong device identity permit is rejected |
| `R9AP1R2-S086` | Wrong package closure permit is rejected |
| `R9AP1R2-S087` | Budget removal occurs on finalization |
| `R9AP1R2-S088` | Budget removal occurs on failure |
| `R9AP1R2-S089` | Budget removal occurs on window close |
| `R9AP1R2-S090` | Qualification recovery budget receipt is self-hashed |

## SOURCE: RUNTIME_HOLDER_STATE_MACHINE

| Gate | Requirement |
|---|---|
| `R9AP1R2-S091` | Recovery-aware runtime holder is a registered RuntimeService |
| `R9AP1R2-S092` | Runtime holder uses the existing RuntimeServiceContainer |
| `R9AP1R2-S093` | Runtime holder is created by normal runtime composition |
| `R9AP1R2-S094` | Runtime holder is not constructed by qualification runner |
| `R9AP1R2-S095` | Runtime holder stores no permanent raw GPUDevice alias |
| `R9AP1R2-S096` | Runtime holder stores no permanent raw GPUQueue alias |
| `R9AP1R2-S097` | Runtime holder state starts READY |
| `R9AP1R2-S098` | Runtime holder allows one active recovery cycle |
| `R9AP1R2-S099` | Runtime holder state transition table is explicit |
| `R9AP1R2-S100` | READY transitions to ARMING only |
| `R9AP1R2-S101` | ARMING transitions to OPERATION_PENDING only |
| `R9AP1R2-S102` | OPERATION_PENDING transitions to LOSS_INJECTED only |
| `R9AP1R2-S103` | LOSS_INJECTED transitions to INVALIDATING only |
| `R9AP1R2-S104` | INVALIDATING transitions to REACQUIRING only |
| `R9AP1R2-S105` | REACQUIRING transitions to REBUILDING only |
| `R9AP1R2-S106` | REBUILDING transitions to VALIDATING only |
| `R9AP1R2-S107` | VALIDATING transitions to READY only |
| `R9AP1R2-S108` | Any illegal state transition fails closed |
| `R9AP1R2-S109` | Any recovery phase failure transitions to FAILED |
| `R9AP1R2-S110` | FAILED cannot return to READY silently |
| `R9AP1R2-S111` | DISPOSED cannot accept a cycle |
| `R9AP1R2-S112` | Holder recovery generation is monotonic |
| `R9AP1R2-S113` | Holder device epoch snapshot is monotonic |
| `R9AP1R2-S114` | Holder operation kind is immutable per cycle |
| `R9AP1R2-S115` | Holder cycle ordinal is immutable per cycle |
| `R9AP1R2-S116` | Holder stores current publication tuple only after validation |
| `R9AP1R2-S117` | Holder clears stale publication tuple on loss |
| `R9AP1R2-S118` | Holder emits phase receipts for every transition |
| `R9AP1R2-S119` | Holder receipt snapshot excludes raw device objects |
| `R9AP1R2-S120` | Runtime holder source contract receipt is self-hashed |

## SOURCE: CONTROLLED_LOSS_INJECTION_API

| Gate | Requirement |
|---|---|
| `R9AP1R2-S121` | Controlled loss injection is qualification-only |
| `R9AP1R2-S122` | Controlled loss injection is owned by GPU Authority |
| `R9AP1R2-S123` | Loss injection requires a one-shot main-issued permit |
| `R9AP1R2-S124` | Loss injection requires matching pending operation event |
| `R9AP1R2-S125` | Loss injection point is represented by a stable hook ID |
| `R9AP1R2-S126` | Loss injection permit includes expected device epoch |
| `R9AP1R2-S127` | Loss injection permit includes expected device identity |
| `R9AP1R2-S128` | Loss injection permit includes operation ID |
| `R9AP1R2-S129` | Loss injection permit includes operation kind |
| `R9AP1R2-S130` | Loss injection permit includes cycle ordinal |
| `R9AP1R2-S131` | Loss injection permit includes not-before time |
| `R9AP1R2-S132` | Loss injection permit includes expiry time |
| `R9AP1R2-S133` | Loss injection permit includes package closure digest |
| `R9AP1R2-S134` | Loss injection permit includes R1 boot permit digest |
| `R9AP1R2-S135` | Loss injection request cannot name arbitrary device |
| `R9AP1R2-S136` | Loss injection request cannot name arbitrary queue |
| `R9AP1R2-S137` | Loss injection request cannot call device destroy directly |
| `R9AP1R2-S138` | Loss injection consumes permit before destruction |
| `R9AP1R2-S139` | Loss injection records pre-destroy authority snapshot |
| `R9AP1R2-S140` | Loss injection records pending operation snapshot |
| `R9AP1R2-S141` | Loss injection records exact hook evidence |
| `R9AP1R2-S142` | Loss injection invokes device destruction exactly once |
| `R9AP1R2-S143` | Duplicate destruction is rejected |
| `R9AP1R2-S144` | Loss without pending operation is rejected |
| `R9AP1R2-S145` | Loss after operation completion is rejected |
| `R9AP1R2-S146` | Loss before queue submission is rejected for preview cycle |
| `R9AP1R2-S147` | Loss before export readback submission is rejected for export cycle |
| `R9AP1R2-S148` | Loss injection receipt is main-authority bound |
| `R9AP1R2-S149` | Loss injection receipt includes self-hash |
| `R9AP1R2-S150` | Loss injection API has no normal-user entry |

## SOURCE: LEASE_REACQUISITION_CONTRACT

| Gate | Requirement |
|---|---|
| `R9AP1R2-S151` | Every post-recovery GPU operation acquires a new lease |
| `R9AP1R2-S152` | New lease device epoch equals recovered authority epoch |
| `R9AP1R2-S153` | New lease device identity equals recovered authority identity |
| `R9AP1R2-S154` | New lease ID differs from every lost-epoch lease ID |
| `R9AP1R2-S155` | Lost-epoch lease release is idempotent |
| `R9AP1R2-S156` | Lost-epoch lease assertCurrent fails |
| `R9AP1R2-S157` | Lost-epoch lease device getter fails |
| `R9AP1R2-S158` | Lost-epoch lease queue getter fails |
| `R9AP1R2-S159` | Old lease cannot configure canvas |
| `R9AP1R2-S160` | Old lease cannot create pipeline |
| `R9AP1R2-S161` | Old lease cannot create shader module |
| `R9AP1R2-S162` | Old lease cannot publish a GPU surface |
| `R9AP1R2-S163` | Old lease cannot complete a Preview frame |
| `R9AP1R2-S164` | Old lease cannot complete an Export job |
| `R9AP1R2-S165` | Pending lease ownership is recorded at injection |
| `R9AP1R2-S166` | Pending lease ownership is recorded at invalidation |
| `R9AP1R2-S167` | Pending lease count returns to zero after invalidation |
| `R9AP1R2-S168` | Reacquired lease owner is admitted by consumer manifest |
| `R9AP1R2-S169` | Reacquired runtime-pipeline lease is observed |
| `R9AP1R2-S170` | Reacquired preview-presenter lease is observed |
| `R9AP1R2-S171` | Reacquired export path lease is observed when applicable |
| `R9AP1R2-S172` | Lease purpose string is stable and nonempty |
| `R9AP1R2-S173` | Lease receipt binds runtime epoch |
| `R9AP1R2-S174` | Lease receipt binds recovery generation |
| `R9AP1R2-S175` | Lease receipt binds operation ID |
| `R9AP1R2-S176` | Lease receipt binds cycle ordinal |
| `R9AP1R2-S177` | Lease reacquisition happens after recovered event |
| `R9AP1R2-S178` | No lease is acquired during INVALIDATING phase |
| `R9AP1R2-S179` | No old lease is silently upgraded to new epoch |
| `R9AP1R2-S180` | Lease reacquisition receipt is self-hashed |

## SOURCE: PIPELINE_REGISTRY_AND_REBUILD

| Gate | Requirement |
|---|---|
| `R9AP1R2-S181` | Canonical resample pipeline registry has explicit authority ID |
| `R9AP1R2-S182` | Pipeline registry is keyed by device identity |
| `R9AP1R2-S183` | Pipeline registry records device epoch |
| `R9AP1R2-S184` | Pipeline registry records runtime epoch |
| `R9AP1R2-S185` | Pipeline registry state machine is explicit |
| `R9AP1R2-S186` | Pipeline registry entry starts BUILDING |
| `R9AP1R2-S187` | Pipeline registry entry becomes ACTIVE after complete build |
| `R9AP1R2-S188` | Lost-epoch entry becomes INVALIDATED |
| `R9AP1R2-S189` | Invalidated entry becomes DISPOSED |
| `R9AP1R2-S190` | Lost-epoch pipeline bundle dispose is invoked |
| `R9AP1R2-S191` | Tensor pipeline dispose is invoked |
| `R9AP1R2-S192` | Adaptive policy pipeline dispose is invoked |
| `R9AP1R2-S193` | EWA pipeline dispose is invoked |
| `R9AP1R2-S194` | WeakMap-only lifetime is not accepted as disposal evidence |
| `R9AP1R2-S195` | Cross-epoch bundle lookup is rejected |
| `R9AP1R2-S196` | Cross-device bundle lookup is rejected |
| `R9AP1R2-S197` | New device receives a new pipeline bundle |
| `R9AP1R2-S198` | New pipeline bundle device epoch is exact |
| `R9AP1R2-S199` | New pipeline bundle device identity is exact |
| `R9AP1R2-S200` | New pipeline bundle kernel contract is revalidated |
| `R9AP1R2-S201` | Generated shader manifest digest is revalidated |
| `R9AP1R2-S202` | R4 pipeline profile is rebuilt |
| `R9AP1R2-S203` | R6 pipeline profile is rebuilt |
| `R9AP1R2-S204` | Pipeline rebuild occurs before validation job |
| `R9AP1R2-S205` | Pipeline rebuild cannot use qualification direct driver |
| `R9AP1R2-S206` | Pipeline rebuild uses canonical internal registry API |
| `R9AP1R2-S207` | Pipeline rebuild failure aborts recovery cycle |
| `R9AP1R2-S208` | Pipeline rebuild receipt binds old bundle digest |
| `R9AP1R2-S209` | Pipeline rebuild receipt binds new bundle digest |
| `R9AP1R2-S210` | Pipeline rebuild receipt is self-hashed |

## SOURCE: FINAL_SURFACE_INVALIDATION

| Gate | Requirement |
|---|---|
| `R9AP1R2-S211` | PipelineService participates in GPU recovery |
| `R9AP1R2-S212` | Pipeline recovery participant order precedes Preview rebuild |
| `R9AP1R2-S213` | Lost GPU final surface is invalidated by Surface Registry |
| `R9AP1R2-S214` | Pipeline binding to lost surface is cleared |
| `R9AP1R2-S215` | Pipeline publication to lost surface is cleared |
| `R9AP1R2-S216` | Pipeline final revision counter never decreases |
| `R9AP1R2-S217` | Publication sequence never decreases |
| `R9AP1R2-S218` | Lost surface cannot satisfy requireFinal |
| `R9AP1R2-S219` | Lost final revision cannot be previewed |
| `R9AP1R2-S220` | Lost final revision cannot be exported |
| `R9AP1R2-S221` | Final invalidation emits a dedicated receipt |
| `R9AP1R2-S222` | Final invalidation receipt binds lost surface ID |
| `R9AP1R2-S223` | Final invalidation receipt binds lost final revision |
| `R9AP1R2-S224` | Final invalidation receipt binds lost device epoch |
| `R9AP1R2-S225` | Final invalidation receipt binds lost device identity |
| `R9AP1R2-S226` | Final invalidation does not publish a replacement surface |
| `R9AP1R2-S227` | Final invalidation notifies subscribers distinctly |
| `R9AP1R2-S228` | Preview scheduler drops lost publication |
| `R9AP1R2-S229` | Export operation cannot pin lost publication |
| `R9AP1R2-S230` | Consumption ledger records lost tuple rejection |
| `R9AP1R2-S231` | Surface pin count for lost surface returns to zero |
| `R9AP1R2-S232` | Lost surface physical disposer executes |
| `R9AP1R2-S233` | Lost surface cannot survive as ACTIVE |
| `R9AP1R2-S234` | CPU compatibility surface is not substituted silently |
| `R9AP1R2-S235` | Legacy final-surface bridge is not invoked |
| `R9AP1R2-S236` | Pipeline rebuild does not reuse lost publication tuple |
| `R9AP1R2-S237` | Post-recovery fixture creates a new surface ID |
| `R9AP1R2-S238` | Post-recovery final revision is greater than lost revision |
| `R9AP1R2-S239` | Post-recovery publication sequence is greater than lost sequence |
| `R9AP1R2-S240` | Final surface invalidation receipt is self-hashed |

## SOURCE: PREVIEW_PENDING_LOSS_WIRING

| Gate | Requirement |
|---|---|
| `R9AP1R2-S241` | Preview pending injection uses DadumPreviewPresenter public entry |
| `R9AP1R2-S242` | Preview cycle does not import private presenter service |
| `R9AP1R2-S243` | Preview cycle does not import private kernel driver |
| `R9AP1R2-S244` | Preview operation grant is issued before injection |
| `R9AP1R2-S245` | Preview final surface pin is held at injection |
| `R9AP1R2-S246` | Preview scheduler request is active at injection |
| `R9AP1R2-S247` | Preview GPU lease is active at injection |
| `R9AP1R2-S248` | Preview command graph has submitted at injection |
| `R9AP1R2-S249` | Preview completion has not settled at injection |
| `R9AP1R2-S250` | Preview injection hook ID is canonical |
| `R9AP1R2-S251` | Preview pending job ID binds fixture ID |
| `R9AP1R2-S252` | Preview pending job ID binds final revision |
| `R9AP1R2-S253` | Preview pending job ID binds cycle ordinal |
| `R9AP1R2-S254` | Lost Preview operation rejects with stable device-loss code |
| `R9AP1R2-S255` | Lost Preview operation cannot resolve successfully |
| `R9AP1R2-S256` | Lost Preview receipt is terminal ABORTED |
| `R9AP1R2-S257` | Preview operation grant completes aborted |
| `R9AP1R2-S258` | Preview surface pin releases after loss |
| `R9AP1R2-S259` | Preview scheduler pending count returns to zero |
| `R9AP1R2-S260` | Preview canvas is marked device-lost |
| `R9AP1R2-S261` | Preview canvas is unconfigured before recovery completion |
| `R9AP1R2-S262` | Preview configured device epoch resets to zero |
| `R9AP1R2-S263` | Preview configured device identity resets to null |
| `R9AP1R2-S264` | Preview presenter generation increases after recovery |
| `R9AP1R2-S265` | Preview scheduler resumes only after rebuild |
| `R9AP1R2-S266` | Old Preview callback cannot present on new epoch |
| `R9AP1R2-S267` | Old Preview completion cannot create PRESENTED receipt |
| `R9AP1R2-S268` | Post-recovery Preview uses new publication tuple |
| `R9AP1R2-S269` | Post-recovery Preview receipt binds new device epoch |
| `R9AP1R2-S270` | Preview loss wiring source receipt is self-hashed |

## SOURCE: EXPORT_PENDING_LOSS_WIRING

| Gate | Requirement |
|---|---|
| `R9AP1R2-S271` | Export pending injection uses DadumRuntimeExport public entry |
| `R9AP1R2-S272` | Export cycle does not import private ExportAuthority service |
| `R9AP1R2-S273` | Export cycle does not import private downscale driver |
| `R9AP1R2-S274` | Export operation grant is issued before injection |
| `R9AP1R2-S275` | Export final surface pin is held at injection |
| `R9AP1R2-S276` | Export job ID is established before injection |
| `R9AP1R2-S277` | Export terminal GPU readback submission exists at injection |
| `R9AP1R2-S278` | Export terminal map completion is pending at injection |
| `R9AP1R2-S279` | Host save begin has not occurred at injection |
| `R9AP1R2-S280` | Export injection hook ID is canonical |
| `R9AP1R2-S281` | Export pending job binds fixture ID |
| `R9AP1R2-S282` | Export pending job binds final revision |
| `R9AP1R2-S283` | Export pending job binds encoder ID |
| `R9AP1R2-S284` | Export pending job binds cycle ordinal |
| `R9AP1R2-S285` | Lost Export operation rejects with stable device-loss code |
| `R9AP1R2-S286` | Lost Export operation cannot resolve successfully |
| `R9AP1R2-S287` | Lost Export receipt is terminal ABORTED |
| `R9AP1R2-S288` | Export operation grant completes aborted |
| `R9AP1R2-S289` | Export surface pin releases after loss |
| `R9AP1R2-S290` | Encoder worker pending job is cancelled or rejected |
| `R9AP1R2-S291` | Terminal map buffer is unmapped or destroyed |
| `R9AP1R2-S292` | Host save session count remains zero for lost export |
| `R9AP1R2-S293` | Evidence output file count remains zero for lost export |
| `R9AP1R2-S294` | Old Export callback cannot commit after recovery |
| `R9AP1R2-S295` | Old Export result cannot produce output SHA |
| `R9AP1R2-S296` | Post-recovery Export uses new publication tuple |
| `R9AP1R2-S297` | Post-recovery Export save commits exactly once |
| `R9AP1R2-S298` | Post-recovery Export output SHA verifies |
| `R9AP1R2-S299` | Post-recovery Export receipt binds new device epoch |
| `R9AP1R2-S300` | Export loss wiring source receipt is self-hashed |

## SOURCE: EVIDENCE_AND_FINALIZER_SOURCE

| Gate | Requirement |
|---|---|
| `R9AP1R2-S301` | R2 recovery plan schema exists |
| `R9AP1R2-S302` | R2 controlled loss permit schema exists |
| `R9AP1R2-S303` | R2 runtime holder receipt schema exists |
| `R9AP1R2-S304` | R2 recovery phase receipt schema exists |
| `R9AP1R2-S305` | R2 lease reacquisition receipt schema exists |
| `R9AP1R2-S306` | R2 pipeline invalidation receipt schema exists |
| `R9AP1R2-S307` | R2 pipeline rebuild receipt schema exists |
| `R9AP1R2-S308` | R2 operation loss receipt schema exists |
| `R9AP1R2-S309` | R2 device epoch cycle receipt schema exists |
| `R9AP1R2-S310` | R2 three-cycle matrix receipt schema exists |
| `R9AP1R2-S311` | Every schema requires run ID |
| `R9AP1R2-S312` | Every schema requires package closure digest |
| `R9AP1R2-S313` | Every schema requires R1 boot permit digest |
| `R9AP1R2-S314` | Every cycle schema requires cycle ordinal |
| `R9AP1R2-S315` | Every cycle schema requires old device epoch |
| `R9AP1R2-S316` | Every cycle schema requires new device epoch |
| `R9AP1R2-S317` | Every cycle schema requires old device identity |
| `R9AP1R2-S318` | Every cycle schema requires new device identity |
| `R9AP1R2-S319` | Every evidence artifact requires self-hash |
| `R9AP1R2-S320` | Artifact manifest includes all R2 child artifacts |
| `R9AP1R2-S321` | Finalizer reads raw event ledger |
| `R9AP1R2-S322` | Finalizer reads raw device epoch ledger |
| `R9AP1R2-S323` | Finalizer reads raw lease ledger |
| `R9AP1R2-S324` | Finalizer reads raw pipeline registry ledger |
| `R9AP1R2-S325` | Finalizer reads raw operation ledger |
| `R9AP1R2-S326` | Finalizer does not trust cyclePass booleans |
| `R9AP1R2-S327` | Finalizer recomputes epoch monotonicity |
| `R9AP1R2-S328` | Finalizer recomputes operation terminal states |
| `R9AP1R2-S329` | Finalizer recomputes zero-leak counts |
| `R9AP1R2-S330` | Evidence and finalizer source receipt is self-hashed |

## SOURCE: PRODUCT_GRAPH_AND_SOURCE_FINAL

| Gate | Requirement |
|---|---|
| `R9AP1R2-S331` | R2 runtime holder is wired into runtime modules |
| `R9AP1R2-S332` | R2 holder depends on GPU Authority |
| `R9AP1R2-S333` | R2 holder depends on Surface Registry |
| `R9AP1R2-S334` | R2 holder depends on PipelineService |
| `R9AP1R2-S335` | R2 holder depends on ResampleWorkerBroker |
| `R9AP1R2-S336` | R2 holder depends on PreviewPresenter |
| `R9AP1R2-S337` | R2 holder depends on ExportAuthority |
| `R9AP1R2-S338` | R2 module activates after Export and Preview modules |
| `R9AP1R2-S339` | R2 qualification runner uses only public R2 facade |
| `R9AP1R2-S340` | R2 preload bridge exposes no raw GPU object |
| `R9AP1R2-S341` | R2 main coordinator issues cycle permits |
| `R9AP1R2-S342` | R2 main coordinator verifies sequential cycle receipts |
| `R9AP1R2-S343` | R2 Active Graph includes holder node |
| `R9AP1R2-S344` | R2 Active Graph includes recovery edges |
| `R9AP1R2-S345` | R2 emitted build contains no old device-loss driver entry |
| `R9AP1R2-S346` | Old device-loss-driver remains quarantined |
| `R9AP1R2-S347` | R1 no-direct-driver seal remains zero |
| `R9AP1R2-S348` | Production Pointer mutation path is absent |
| `R9AP1R2-S349` | Local Activation Pointer mutation path is absent |
| `R9AP1R2-S350` | R10A promotion path is not invoked |
| `R9AP1R2-S351` | R11A installed PASS is not claimed |
| `R9AP1R2-S352` | R12A update PASS is not claimed |
| `R9AP1R2-S353` | R13A fleet PASS is not claimed |
| `R9AP1R2-S354` | R14A distribution PASS is not claimed |
| `R9AP1R2-S355` | Source negative controls cover at least forty cases |
| `R9AP1R2-S356` | Source JavaScript parse closure passes |
| `R9AP1R2-S357` | Source TypeScript syntax closure passes |
| `R9AP1R2-S358` | Source final counts are exact |
| `R9AP1R2-S359` | Source final receipt self-hash verifies |
| `R9AP1R2-S360` | Source final state awaits packaged three-cycle replay |

## PACKAGED: PACKAGED_PREREQUISITES

| Gate | Requirement |
|---|---|
| `R9AP1R2-P001` | Build Lock R2 Win32 final admission exists |
| `R9AP1R2-P002` | Build Lock R2 final receipt self-hash verifies |
| `R9AP1R2-P003` | Build Lock R2 child chain replays |
| `R9AP1R2-P004` | R1 packaged final receipt exists |
| `R9AP1R2-P005` | R1 packaged final receipt self-hash verifies |
| `R9AP1R2-P006` | R1 external sidecar remains unchanged |
| `R9AP1R2-P007` | R1 package closure digest remains exact |
| `R9AP1R2-P008` | R1 normal runtime boot receipt verifies |
| `R9AP1R2-P009` | R1 runtime composition receipt verifies |
| `R9AP1R2-P010` | R1 qualification session receipt verifies |
| `R9AP1R2-P011` | R1 fixture publication receipt verifies |
| `R9AP1R2-P012` | R1 Preview public-entry receipt verifies |
| `R9AP1R2-P013` | R1 Export public-entry receipt verifies |
| `R9AP1R2-P014` | R1 no-direct-driver receipt verifies |
| `R9AP1R2-P015` | Current executable digest equals R1 closure binding |
| `R9AP1R2-P016` | Current app.asar digest equals R1 closure binding |
| `R9AP1R2-P017` | Current native addon digest equals R1 closure binding |
| `R9AP1R2-P018` | Current runtime manifest digest equals R1 closure binding |
| `R9AP1R2-P019` | Current package content manifest digest equals R1 closure binding |
| `R9AP1R2-P020` | Package mutation count is zero |
| `R9AP1R2-P021` | Sidecar mutation count is zero |
| `R9AP1R2-P022` | Production Pointer is unchanged |
| `R9AP1R2-P023` | Local Activation Pointer is unchanged |
| `R9AP1R2-P024` | Hardware D3D12 adapter is present |
| `R9AP1R2-P025` | Fallback adapter is false |
| `R9AP1R2-P026` | Qualification renderer PID matches permit |
| `R9AP1R2-P027` | Qualification window ID matches permit |
| `R9AP1R2-P028` | Runtime epoch matches R1 boot receipt |
| `R9AP1R2-P029` | Starting device epoch is positive |
| `R9AP1R2-P030` | Packaged prerequisites receipt is self-hashed |

## PACKAGED: NORMAL_COMPOSITION_AND_HOLDER

| Gate | Requirement |
|---|---|
| `R9AP1R2-P031` | Normal renderer entry is used |
| `R9AP1R2-P032` | bootstrapRenderer completes |
| `R9AP1R2-P033` | createRuntimeComposition is used |
| `R9AP1R2-P034` | RuntimeServiceContainer instance is singular |
| `R9AP1R2-P035` | GPU Authority service instance is singular |
| `R9AP1R2-P036` | Surface Registry service instance is singular |
| `R9AP1R2-P037` | Pipeline service instance is singular |
| `R9AP1R2-P038` | Resample broker service instance is singular |
| `R9AP1R2-P039` | PreviewPresenter service instance is singular |
| `R9AP1R2-P040` | ExportAuthority service instance is singular |
| `R9AP1R2-P041` | Recovery holder service instance is singular |
| `R9AP1R2-P042` | Recovery holder is initialized by module plan |
| `R9AP1R2-P043` | Recovery holder reports READY |
| `R9AP1R2-P044` | Recovery holder runtime epoch matches composition |
| `R9AP1R2-P045` | Recovery holder device epoch matches GPU Authority |
| `R9AP1R2-P046` | Recovery holder device identity matches GPU Authority |
| `R9AP1R2-P047` | Recovery holder recovery generation starts at zero |
| `R9AP1R2-P048` | Recovery holder active cycle is null |
| `R9AP1R2-P049` | Recovery holder raw device alias count is zero |
| `R9AP1R2-P050` | Recovery holder raw queue alias count is zero |
| `R9AP1R2-P051` | Qualification public facade authority is exact |
| `R9AP1R2-P052` | Qualification public facade API version is exact |
| `R9AP1R2-P053` | Old physical HTML is not loaded |
| `R9AP1R2-P054` | Old product-runtime module is not loaded |
| `R9AP1R2-P055` | Old preview-product-driver module is not loaded |
| `R9AP1R2-P056` | Old export-product-driver module is not loaded |
| `R9AP1R2-P057` | Old device-loss-driver module is not loaded |
| `R9AP1R2-P058` | Direct kernel invocation count is zero |
| `R9AP1R2-P059` | Legacy final surface invocation count is zero |
| `R9AP1R2-P060` | Normal composition and holder receipt is self-hashed |

## PACKAGED: CYCLE_PLAN_AND_PERMITS

| Gate | Requirement |
|---|---|
| `R9AP1R2-P061` | Three-cycle plan exists |
| `R9AP1R2-P062` | Cycle plan self-hash verifies |
| `R9AP1R2-P063` | Cycle count equals three |
| `R9AP1R2-P064` | Cycle one operation kind is preview |
| `R9AP1R2-P065` | Cycle two operation kind is export |
| `R9AP1R2-P066` | Cycle three operation kind is preview |
| `R9AP1R2-P067` | Cycle ordinals are contiguous |
| `R9AP1R2-P068` | Every cycle has one loss hook |
| `R9AP1R2-P069` | Every cycle has one one-shot permit |
| `R9AP1R2-P070` | Cycle one permit binds starting epoch |
| `R9AP1R2-P071` | Cycle two permit binds cycle one recovered epoch |
| `R9AP1R2-P072` | Cycle three permit binds cycle two recovered epoch |
| `R9AP1R2-P073` | Every permit binds package closure digest |
| `R9AP1R2-P074` | Every permit binds sidecar digest |
| `R9AP1R2-P075` | Every permit binds R1 boot permit digest |
| `R9AP1R2-P076` | Every permit binds run ID |
| `R9AP1R2-P077` | Every permit binds renderer PID |
| `R9AP1R2-P078` | Every permit binds window ID |
| `R9AP1R2-P079` | Every permit binds fixture schedule digest |
| `R9AP1R2-P080` | Every permit expiry is valid |
| `R9AP1R2-P081` | Every permit is consumed exactly once |
| `R9AP1R2-P082` | No permit is consumed out of order |
| `R9AP1R2-P083` | No permit is reused |
| `R9AP1R2-P084` | No fourth permit exists |
| `R9AP1R2-P085` | Cycle two starts after cycle one finalization |
| `R9AP1R2-P086` | Cycle three starts after cycle two finalization |
| `R9AP1R2-P087` | Recovery budget consumed count starts zero |
| `R9AP1R2-P088` | Recovery budget limit equals three |
| `R9AP1R2-P089` | Recovery budget final consumed count equals three |
| `R9AP1R2-P090` | Cycle plan and permit receipt is self-hashed |

## PACKAGED: CYCLE1_PREVIEW_PENDING_LOSS

| Gate | Requirement |
|---|---|
| `R9AP1R2-P091` | Cycle one fixture publication succeeds |
| `R9AP1R2-P092` | Cycle one fixture publication uses canonical broker |
| `R9AP1R2-P093` | Cycle one final surface is GPU texture |
| `R9AP1R2-P094` | Cycle one Preview public entry starts |
| `R9AP1R2-P095` | Cycle one Preview operation grant is active |
| `R9AP1R2-P096` | Cycle one Preview surface pin is active |
| `R9AP1R2-P097` | Cycle one Preview scheduler request is active |
| `R9AP1R2-P098` | Cycle one Preview lease belongs to starting epoch |
| `R9AP1R2-P099` | Cycle one Preview command encoder is created |
| `R9AP1R2-P100` | Cycle one Preview queue submit occurs |
| `R9AP1R2-P101` | Cycle one Preview completion is pending |
| `R9AP1R2-P102` | Cycle one injection hook matches permit |
| `R9AP1R2-P103` | Cycle one loss permit is consumed |
| `R9AP1R2-P104` | Cycle one GPU device destroy count equals one |
| `R9AP1R2-P105` | Cycle one device-lost event occurs |
| `R9AP1R2-P106` | Cycle one lost epoch equals starting epoch |
| `R9AP1R2-P107` | Cycle one Preview promise rejects |
| `R9AP1R2-P108` | Cycle one Preview does not resolve |
| `R9AP1R2-P109` | Cycle one Preview receipt is not PRESENTED |
| `R9AP1R2-P110` | Cycle one Preview operation is ABORTED |
| `R9AP1R2-P111` | Cycle one surface pin releases |
| `R9AP1R2-P112` | Cycle one scheduler pending count returns zero |
| `R9AP1R2-P113` | Cycle one old completion callback is ignored |
| `R9AP1R2-P114` | Cycle one old submission ticket becomes LOST |
| `R9AP1R2-P115` | Cycle one old uniform slots are invalidated |
| `R9AP1R2-P116` | Cycle one host save count remains zero |
| `R9AP1R2-P117` | Cycle one export is not started before recovery |
| `R9AP1R2-P118` | Cycle one raw loss receipt self-hash verifies |
| `R9AP1R2-P119` | Cycle one operation loss receipt self-hash verifies |
| `R9AP1R2-P120` | Cycle one pending loss gates all pass |

## PACKAGED: CYCLE1_RECOVERY_REBUILD_VALIDATE

| Gate | Requirement |
|---|---|
| `R9AP1R2-P121` | Cycle one authority enters INVALIDATING |
| `R9AP1R2-P122` | Cycle one surface registry invalidates lost epoch |
| `R9AP1R2-P123` | Cycle one pipeline clears lost binding |
| `R9AP1R2-P124` | Cycle one resample broker cancels pending requests |
| `R9AP1R2-P125` | Cycle one pipeline registry invalidates old bundle |
| `R9AP1R2-P126` | Cycle one old pipeline bundle is disposed |
| `R9AP1R2-P127` | Cycle one old leases are stale |
| `R9AP1R2-P128` | Cycle one replacement device is requested once |
| `R9AP1R2-P129` | Cycle one new device epoch equals old plus one |
| `R9AP1R2-P130` | Cycle one new device identity differs |
| `R9AP1R2-P131` | Cycle one authority returns ACTIVE |
| `R9AP1R2-P132` | Cycle one recovery participant rebuild order is exact |
| `R9AP1R2-P133` | Cycle one canonical pipeline rebuild starts |
| `R9AP1R2-P134` | Cycle one R4 pipeline rebuild succeeds |
| `R9AP1R2-P135` | Cycle one R6 pipeline rebuild succeeds |
| `R9AP1R2-P136` | Cycle one generated shader digest set verifies |
| `R9AP1R2-P137` | Cycle one new runtime-pipeline lease is acquired |
| `R9AP1R2-P138` | Cycle one fixture is republished |
| `R9AP1R2-P139` | Cycle one new surface ID differs |
| `R9AP1R2-P140` | Cycle one new final revision is greater |
| `R9AP1R2-P141` | Cycle one Preview post-recovery succeeds |
| `R9AP1R2-P142` | Cycle one Export post-recovery succeeds |
| `R9AP1R2-P143` | Cycle one Preview and Export share tuple |
| `R9AP1R2-P144` | Cycle one validation counters are zero |
| `R9AP1R2-P145` | Cycle one stale lease rejection is observed |
| `R9AP1R2-P146` | Cycle one active lease count returns zero |
| `R9AP1R2-P147` | Cycle one pipeline entry count is bounded |
| `R9AP1R2-P148` | Cycle one recovery duration is recorded |
| `R9AP1R2-P149` | Cycle one cycle receipt self-hash verifies |
| `R9AP1R2-P150` | Cycle one recovery and validation gates all pass |

## PACKAGED: CYCLE2_EXPORT_PENDING_LOSS

| Gate | Requirement |
|---|---|
| `R9AP1R2-P151` | Cycle two fixture publication succeeds |
| `R9AP1R2-P152` | Cycle two fixture publication uses recovered epoch |
| `R9AP1R2-P153` | Cycle two final surface is GPU texture |
| `R9AP1R2-P154` | Cycle two Export public entry starts |
| `R9AP1R2-P155` | Cycle two Export operation grant is active |
| `R9AP1R2-P156` | Cycle two Export surface pin is active |
| `R9AP1R2-P157` | Cycle two Export job ID is established |
| `R9AP1R2-P158` | Cycle two encoder identity is canonical |
| `R9AP1R2-P159` | Cycle two GPU readback command is submitted |
| `R9AP1R2-P160` | Cycle two terminal map is pending |
| `R9AP1R2-P161` | Cycle two host save has not begun |
| `R9AP1R2-P162` | Cycle two injection hook matches permit |
| `R9AP1R2-P163` | Cycle two loss permit is consumed |
| `R9AP1R2-P164` | Cycle two GPU device destroy count equals one |
| `R9AP1R2-P165` | Cycle two device-lost event occurs |
| `R9AP1R2-P166` | Cycle two lost epoch equals cycle one recovered epoch |
| `R9AP1R2-P167` | Cycle two Export promise rejects |
| `R9AP1R2-P168` | Cycle two Export does not resolve |
| `R9AP1R2-P169` | Cycle two Export receipt is ABORTED |
| `R9AP1R2-P170` | Cycle two operation grant is ABORTED |
| `R9AP1R2-P171` | Cycle two surface pin releases |
| `R9AP1R2-P172` | Cycle two worker pending job terminates |
| `R9AP1R2-P173` | Cycle two terminal map buffer is cleaned |
| `R9AP1R2-P174` | Cycle two host save session count stays zero |
| `R9AP1R2-P175` | Cycle two output file count stays zero |
| `R9AP1R2-P176` | Cycle two old callback cannot commit |
| `R9AP1R2-P177` | Cycle two old submission ticket becomes LOST |
| `R9AP1R2-P178` | Cycle two raw loss receipt self-hash verifies |
| `R9AP1R2-P179` | Cycle two operation loss receipt self-hash verifies |
| `R9AP1R2-P180` | Cycle two pending loss gates all pass |

## PACKAGED: CYCLE2_RECOVERY_REBUILD_VALIDATE

| Gate | Requirement |
|---|---|
| `R9AP1R2-P181` | Cycle two authority enters INVALIDATING |
| `R9AP1R2-P182` | Cycle two surface registry invalidates lost epoch |
| `R9AP1R2-P183` | Cycle two pipeline clears lost binding |
| `R9AP1R2-P184` | Cycle two resample broker cancels pending requests |
| `R9AP1R2-P185` | Cycle two pipeline registry invalidates old bundle |
| `R9AP1R2-P186` | Cycle two old pipeline bundle is disposed |
| `R9AP1R2-P187` | Cycle two old leases are stale |
| `R9AP1R2-P188` | Cycle two replacement device is requested once |
| `R9AP1R2-P189` | Cycle two new device epoch equals old plus one |
| `R9AP1R2-P190` | Cycle two new device identity differs |
| `R9AP1R2-P191` | Cycle two authority returns ACTIVE |
| `R9AP1R2-P192` | Cycle two recovery participant rebuild order is exact |
| `R9AP1R2-P193` | Cycle two canonical pipeline rebuild starts |
| `R9AP1R2-P194` | Cycle two R4 pipeline rebuild succeeds |
| `R9AP1R2-P195` | Cycle two R6 pipeline rebuild succeeds |
| `R9AP1R2-P196` | Cycle two generated shader digest set verifies |
| `R9AP1R2-P197` | Cycle two new runtime-pipeline lease is acquired |
| `R9AP1R2-P198` | Cycle two fixture is republished |
| `R9AP1R2-P199` | Cycle two new surface ID differs |
| `R9AP1R2-P200` | Cycle two new final revision is greater |
| `R9AP1R2-P201` | Cycle two Preview post-recovery succeeds |
| `R9AP1R2-P202` | Cycle two Export post-recovery succeeds |
| `R9AP1R2-P203` | Cycle two evidence save commits once |
| `R9AP1R2-P204` | Cycle two Preview and Export share tuple |
| `R9AP1R2-P205` | Cycle two validation counters are zero |
| `R9AP1R2-P206` | Cycle two stale lease rejection is observed |
| `R9AP1R2-P207` | Cycle two active lease count returns zero |
| `R9AP1R2-P208` | Cycle two recovery duration is recorded |
| `R9AP1R2-P209` | Cycle two cycle receipt self-hash verifies |
| `R9AP1R2-P210` | Cycle two recovery and validation gates all pass |

## PACKAGED: CYCLE3_PREVIEW_PENDING_LOSS

| Gate | Requirement |
|---|---|
| `R9AP1R2-P211` | Cycle three fixture publication succeeds |
| `R9AP1R2-P212` | Cycle three fixture publication uses second recovered epoch |
| `R9AP1R2-P213` | Cycle three final surface is GPU texture |
| `R9AP1R2-P214` | Cycle three Preview public entry starts |
| `R9AP1R2-P215` | Cycle three Preview operation grant is active |
| `R9AP1R2-P216` | Cycle three Preview surface pin is active |
| `R9AP1R2-P217` | Cycle three Preview scheduler request is active |
| `R9AP1R2-P218` | Cycle three Preview lease belongs to second recovered epoch |
| `R9AP1R2-P219` | Cycle three Preview command encoder is created |
| `R9AP1R2-P220` | Cycle three Preview queue submit occurs |
| `R9AP1R2-P221` | Cycle three Preview completion is pending |
| `R9AP1R2-P222` | Cycle three injection hook matches permit |
| `R9AP1R2-P223` | Cycle three loss permit is consumed |
| `R9AP1R2-P224` | Cycle three GPU device destroy count equals one |
| `R9AP1R2-P225` | Cycle three device-lost event occurs |
| `R9AP1R2-P226` | Cycle three lost epoch equals cycle two recovered epoch |
| `R9AP1R2-P227` | Cycle three Preview promise rejects |
| `R9AP1R2-P228` | Cycle three Preview does not resolve |
| `R9AP1R2-P229` | Cycle three Preview receipt is not PRESENTED |
| `R9AP1R2-P230` | Cycle three Preview operation is ABORTED |
| `R9AP1R2-P231` | Cycle three surface pin releases |
| `R9AP1R2-P232` | Cycle three scheduler pending count returns zero |
| `R9AP1R2-P233` | Cycle three old completion callback is ignored |
| `R9AP1R2-P234` | Cycle three old submission ticket becomes LOST |
| `R9AP1R2-P235` | Cycle three old uniform slots are invalidated |
| `R9AP1R2-P236` | Cycle three host save count remains zero before recovery |
| `R9AP1R2-P237` | Cycle three raw loss receipt self-hash verifies |
| `R9AP1R2-P238` | Cycle three operation loss receipt self-hash verifies |
| `R9AP1R2-P239` | Cycle three permit consumption count equals one |
| `R9AP1R2-P240` | Cycle three pending loss gates all pass |

## PACKAGED: CYCLE3_RECOVERY_REBUILD_VALIDATE

| Gate | Requirement |
|---|---|
| `R9AP1R2-P241` | Cycle three authority enters INVALIDATING |
| `R9AP1R2-P242` | Cycle three surface registry invalidates lost epoch |
| `R9AP1R2-P243` | Cycle three pipeline clears lost binding |
| `R9AP1R2-P244` | Cycle three resample broker cancels pending requests |
| `R9AP1R2-P245` | Cycle three pipeline registry invalidates old bundle |
| `R9AP1R2-P246` | Cycle three old pipeline bundle is disposed |
| `R9AP1R2-P247` | Cycle three old leases are stale |
| `R9AP1R2-P248` | Cycle three replacement device is requested once |
| `R9AP1R2-P249` | Cycle three new device epoch equals old plus one |
| `R9AP1R2-P250` | Cycle three new device identity differs |
| `R9AP1R2-P251` | Cycle three authority returns ACTIVE |
| `R9AP1R2-P252` | Cycle three recovery participant rebuild order is exact |
| `R9AP1R2-P253` | Cycle three canonical pipeline rebuild starts |
| `R9AP1R2-P254` | Cycle three R4 pipeline rebuild succeeds |
| `R9AP1R2-P255` | Cycle three R6 pipeline rebuild succeeds |
| `R9AP1R2-P256` | Cycle three generated shader digest set verifies |
| `R9AP1R2-P257` | Cycle three new runtime-pipeline lease is acquired |
| `R9AP1R2-P258` | Cycle three fixture is republished |
| `R9AP1R2-P259` | Cycle three new surface ID differs |
| `R9AP1R2-P260` | Cycle three new final revision is greater |
| `R9AP1R2-P261` | Cycle three Preview post-recovery succeeds |
| `R9AP1R2-P262` | Cycle three Export post-recovery succeeds |
| `R9AP1R2-P263` | Cycle three evidence save commits once |
| `R9AP1R2-P264` | Cycle three Preview and Export share tuple |
| `R9AP1R2-P265` | Cycle three validation counters are zero |
| `R9AP1R2-P266` | Cycle three stale lease rejection is observed |
| `R9AP1R2-P267` | Cycle three active lease count returns zero |
| `R9AP1R2-P268` | Cycle three recovery duration is recorded |
| `R9AP1R2-P269` | Cycle three cycle receipt self-hash verifies |
| `R9AP1R2-P270` | Cycle three recovery and validation gates all pass |

## PACKAGED: DEVICE_EPOCH_CHAIN

| Gate | Requirement |
|---|---|
| `R9AP1R2-P271` | Four device epochs are observed including initial epoch |
| `R9AP1R2-P272` | Three lost epochs are observed |
| `R9AP1R2-P273` | Three recovered epochs are observed |
| `R9AP1R2-P274` | Epoch sequence is strictly increasing |
| `R9AP1R2-P275` | Each recovered epoch equals prior lost epoch plus one |
| `R9AP1R2-P276` | No epoch is skipped |
| `R9AP1R2-P277` | No epoch is reused |
| `R9AP1R2-P278` | Every epoch has one device identity |
| `R9AP1R2-P279` | Every device identity is nonempty |
| `R9AP1R2-P280` | Consecutive device identities differ |
| `R9AP1R2-P281` | Runtime epoch remains constant across cycles |
| `R9AP1R2-P282` | Adapter identity remains constant across cycles |
| `R9AP1R2-P283` | Package closure digest remains constant across cycles |
| `R9AP1R2-P284` | R1 boot permit digest remains constant across cycles |
| `R9AP1R2-P285` | Fixture schedule digest remains constant across cycles |
| `R9AP1R2-P286` | Recovery generation sequence is one two three |
| `R9AP1R2-P287` | Recovery attempt count equals three |
| `R9AP1R2-P288` | Recovery success count equals three |
| `R9AP1R2-P289` | Recovery failure count equals zero |
| `R9AP1R2-P290` | Device loss count equals three |
| `R9AP1R2-P291` | Fourth loss is not attempted |
| `R9AP1R2-P292` | Old epoch callback settlement count is zero |
| `R9AP1R2-P293` | Late completion count is recorded and bounded |
| `R9AP1R2-P294` | Every cycle has one invalidation phase |
| `R9AP1R2-P295` | Every cycle has one reacquisition phase |
| `R9AP1R2-P296` | Every cycle has one rebuild phase |
| `R9AP1R2-P297` | Every cycle has one validation phase |
| `R9AP1R2-P298` | Device epoch ledger self-hash verifies |
| `R9AP1R2-P299` | Three-cycle matrix self-hash verifies |
| `R9AP1R2-P300` | Device epoch chain gates all pass |

## PACKAGED: LEASE_PIPELINE_RESOURCE_CLOSURE

| Gate | Requirement |
|---|---|
| `R9AP1R2-P301` | Lost-epoch active lease count returns zero after each cycle |
| `R9AP1R2-P302` | Final active lease count returns zero |
| `R9AP1R2-P303` | Stale lease reject count is at least three |
| `R9AP1R2-P304` | Uniform in-flight overwrite count is zero |
| `R9AP1R2-P305` | Lost uniform slot count matches pending graph evidence |
| `R9AP1R2-P306` | Submission ticket leak count is zero |
| `R9AP1R2-P307` | Mapped buffer leak count is zero |
| `R9AP1R2-P308` | Completion callback leak count is zero |
| `R9AP1R2-P309` | Preview scheduler pending count is zero |
| `R9AP1R2-P310` | Export operation grant count is zero |
| `R9AP1R2-P311` | Qualification operation grant count is zero |
| `R9AP1R2-P312` | Surface pin count is zero |
| `R9AP1R2-P313` | Lost GPU surface active count is zero |
| `R9AP1R2-P314` | Pipeline registry has no lost-epoch ACTIVE entry |
| `R9AP1R2-P315` | Pipeline registry has one current ACTIVE entry at most |
| `R9AP1R2-P316` | Old pipeline bundle disposal count equals three |
| `R9AP1R2-P317` | New pipeline bundle build count equals three |
| `R9AP1R2-P318` | Cross-epoch pipeline reuse count is zero |
| `R9AP1R2-P319` | Cross-device pipeline reuse count is zero |
| `R9AP1R2-P320` | Shader cache old-epoch entry count is zero |
| `R9AP1R2-P321` | GPU Authority pipeline cache is current-epoch only |
| `R9AP1R2-P322` | GPU Authority shader cache is current-epoch only |
| `R9AP1R2-P323` | Resample broker pending count is zero |
| `R9AP1R2-P324` | Encoder worker pending count is zero |
| `R9AP1R2-P325` | Host save temporary file count is zero |
| `R9AP1R2-P326` | Host save open session count is zero |
| `R9AP1R2-P327` | Evidence publisher open handle count is zero |
| `R9AP1R2-P328` | Package writable handle count is zero |
| `R9AP1R2-P329` | Sidecar writable handle count is zero |
| `R9AP1R2-P330` | Lease pipeline resource closure gates all pass |

## PACKAGED: RAW_EVIDENCE_LINEAGE

| Gate | Requirement |
|---|---|
| `R9AP1R2-P331` | Raw event ledger exists |
| `R9AP1R2-P332` | Raw device epoch ledger exists |
| `R9AP1R2-P333` | Raw lease ledger exists |
| `R9AP1R2-P334` | Raw pipeline registry ledger exists |
| `R9AP1R2-P335` | Raw operation ledger exists |
| `R9AP1R2-P336` | Raw loss permit ledger exists |
| `R9AP1R2-P337` | Raw fixture publication ledger exists |
| `R9AP1R2-P338` | Raw Preview receipt ledger exists |
| `R9AP1R2-P339` | Raw Export receipt ledger exists |
| `R9AP1R2-P340` | Raw validation counter artifact exists |
| `R9AP1R2-P341` | Raw artifact manifest exists |
| `R9AP1R2-P342` | Every artifact run ID matches |
| `R9AP1R2-P343` | Every artifact package closure digest matches |
| `R9AP1R2-P344` | Every artifact sidecar digest matches |
| `R9AP1R2-P345` | Every artifact R1 boot permit digest matches |
| `R9AP1R2-P346` | Every artifact fixture schedule digest matches |
| `R9AP1R2-P347` | Every artifact cycle ordinal is valid |
| `R9AP1R2-P348` | Every artifact operation ID is bound |
| `R9AP1R2-P349` | Every artifact old epoch matches cycle ledger |
| `R9AP1R2-P350` | Every artifact new epoch matches cycle ledger |
| `R9AP1R2-P351` | Every artifact self-hash verifies |
| `R9AP1R2-P352` | Artifact digest chain is continuous |
| `R9AP1R2-P353` | Artifact file byte length verifies |
| `R9AP1R2-P354` | No unknown artifact is admitted |
| `R9AP1R2-P355` | No artifact from another run is admitted |
| `R9AP1R2-P356` | No summary-only artifact is admitted |
| `R9AP1R2-P357` | Finalizer replays all raw ledgers |
| `R9AP1R2-P358` | Finalizer recomputes all cycle results |
| `R9AP1R2-P359` | Finalizer summary trust count is zero |
| `R9AP1R2-P360` | Raw evidence lineage gates all pass |

## PACKAGED: NEGATIVE_CONTROL_MATRIX

| Gate | Requirement |
|---|---|
| `R9AP1R2-P361` | Missing recovery budget is rejected |
| `R9AP1R2-P362` | Recovery budget greater than three is rejected |
| `R9AP1R2-P363` | Fourth cycle permit is rejected |
| `R9AP1R2-P364` | Reused loss permit is rejected |
| `R9AP1R2-P365` | Out-of-order cycle permit is rejected |
| `R9AP1R2-P366` | Wrong run ID is rejected |
| `R9AP1R2-P367` | Wrong renderer PID is rejected |
| `R9AP1R2-P368` | Wrong window ID is rejected |
| `R9AP1R2-P369` | Wrong package closure digest is rejected |
| `R9AP1R2-P370` | Wrong R1 boot permit digest is rejected |
| `R9AP1R2-P371` | Wrong device epoch is rejected |
| `R9AP1R2-P372` | Wrong device identity is rejected |
| `R9AP1R2-P373` | Loss before pending hook is rejected |
| `R9AP1R2-P374` | Loss after operation settlement is rejected |
| `R9AP1R2-P375` | Direct device destroy from runner is rejected |
| `R9AP1R2-P376` | Private Preview driver import is rejected |
| `R9AP1R2-P377` | Private Export driver import is rejected |
| `R9AP1R2-P378` | Private kernel driver import is rejected |
| `R9AP1R2-P379` | Old runtime recreation per cycle is rejected |
| `R9AP1R2-P380` | Runtime epoch change between cycles is rejected |
| `R9AP1R2-P381` | Adapter identity change is rejected |
| `R9AP1R2-P382` | Old lease successful use is rejected |
| `R9AP1R2-P383` | Old pipeline bundle reuse is rejected |
| `R9AP1R2-P384` | Lost final surface reuse is rejected |
| `R9AP1R2-P385` | Preview loss resolving successfully is rejected |
| `R9AP1R2-P386` | Export loss committing file is rejected |
| `R9AP1R2-P387` | Missing pipeline rebuild receipt is rejected |
| `R9AP1R2-P388` | Missing post-recovery validation is rejected |
| `R9AP1R2-P389` | Constant deviceLossRecoveryCycleCount is rejected |
| `R9AP1R2-P390` | Negative control matrix gates all pass |

## PACKAGED: FINAL_PACKAGED_RECOVERY_SEAL

| Gate | Requirement |
|---|---|
| `R9AP1R2-P391` | All packaged prerequisite gates pass |
| `R9AP1R2-P392` | All normal composition holder gates pass |
| `R9AP1R2-P393` | All cycle plan gates pass |
| `R9AP1R2-P394` | All cycle one pending loss gates pass |
| `R9AP1R2-P395` | All cycle one recovery gates pass |
| `R9AP1R2-P396` | All cycle two pending loss gates pass |
| `R9AP1R2-P397` | All cycle two recovery gates pass |
| `R9AP1R2-P398` | All cycle three pending loss gates pass |
| `R9AP1R2-P399` | All cycle three recovery gates pass |
| `R9AP1R2-P400` | All device epoch chain gates pass |
| `R9AP1R2-P401` | All resource closure gates pass |
| `R9AP1R2-P402` | All raw evidence gates pass |
| `R9AP1R2-P403` | All negative control gates pass |
| `R9AP1R2-P404` | Preview pending loss cycle count equals two |
| `R9AP1R2-P405` | Export pending loss cycle count equals one |
| `R9AP1R2-P406` | Total controlled loss count equals three |
| `R9AP1R2-P407` | Total successful recovery count equals three |
| `R9AP1R2-P408` | Total pipeline rebuild count equals three |
| `R9AP1R2-P409` | Total stale lease acceptance count equals zero |
| `R9AP1R2-P410` | Total old surface reuse count equals zero |
| `R9AP1R2-P411` | Total direct kernel driver invocation count equals zero |
| `R9AP1R2-P412` | Total legacy final bridge invocation count equals zero |
| `R9AP1R2-P413` | Total production pointer mutation count equals zero |
| `R9AP1R2-P414` | Total local pointer mutation count equals zero |
| `R9AP1R2-P415` | Historical pass carry-forward equals zero |
| `R9AP1R2-P416` | Packaged final pending count equals zero |
| `R9AP1R2-P417` | Packaged final fail count equals zero |
| `R9AP1R2-P418` | Packaged final receipt counts are exact |
| `R9AP1R2-P419` | Packaged final receipt self-hash verifies |
| `R9AP1R2-P420` | Final state awaits R9A-P1-R3 evidence lineage closure |

# 18. Source 목표 상태

```text
RESAMPLE_RUNTIME_R9A_P1_R2_RECOVERY_HOLDER_AND_THREE_CYCLE_REPLAY_SOURCE_SEALED_AWAITING_R1_PACKAGED_AND_PHYSICAL_RECOVERY

360 SOURCE PASS
420 PACKAGED PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

qualificationRecoveryBudgetInstalled = false
controlledLossExecuted             = false
deviceLossRecoveryCycleCount       = 0
pipelineRebuildCount               = 0
historicalPassCarryForward         = 0
productionPointerMutated           = false
localActivationPointerMutated      = false
```

# 19. Final Packaged 목표 상태

```text
RESAMPLE_RUNTIME_R9A_P1_R2_THREE_CYCLE_DEVICE_EPOCH_REPLAY_VALIDATED_AWAITING_R9A_P1_R3_EVIDENCE_LINEAGE

360 SOURCE PASS
420 PACKAGED PASS
0 PENDING
0 DEFERRED
0 SKIPPED
0 FAIL

sameRuntimeCompositionPreserved     = true
qualificationRecoveryBudgetConsumed = 3
controlledLossCount                 = 3
previewPendingLossCount             = 2
exportPendingLossCount              = 1
deviceLossRecoveryCycleCount        = 3
pipelineRebuildCount                = 3
staleLeaseAcceptCount               = 0
oldPipelineReuseCount               = 0
oldFinalSurfaceReuseCount           = 0
directKernelDriverInvocationCount   = 0
historicalPassCarryForward          = 0
productionPointerMutated            = false
localActivationPointerMutated       = false
```

# 20. 완료 조건

- R1 packaged qualification과 Build Lock R2 Win32 admission이 먼저 닫힌다.
- 동일 Runtime Composition에서 정확히 3회 device loss를 수행한다.
- cycle pattern은 Preview, Export, Preview 순서다.
- 각 loss는 실제 pending operation hook에서만 발생한다.
- old lease·ticket·uniform·surface·pipeline이 lost epoch에서 무효화된다.
- replacement device마다 canonical pipeline bundle이 명시적으로 rebuild된다.
- 각 recovery 뒤 fixture republish, Preview, Export가 모두 성공한다.
- device epoch는 E0<E1<E2<E3으로 단조 증가한다.
- raw evidence finalizer가 420 packaged gates를 재계산한다.
- 두 pointer mutation count와 historical carry-forward가 0이다.

# 21. 다음 권위

```text
TDT-RESAMPLE-RUNTIME-01-R9A-P1-R3

Common Raw Evidence Envelope /
Artifact Manifest Replay /
Fixture Completion Binding /
Dual-Layer Encoder·Submit Correlation /
Fault Counter Exact Mapping Seal
```

P1-R2는 recovery loop 자체를 닫는다. P1-R3는 이 loop와 기존 P1 observation artifacts를 하나의 cross-run·cross-artifact lineage로 다시 묶어, 서로 다른 run의 ledger를 조합하는 경로를 제거한다.
