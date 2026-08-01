# TDT-BAKEMONO-RINNE-WGSL-05

Canonical Final Texture Adoption /
Native Effect Candidate Ownership Transfer /
Original EWA Terminal Authority Retirement /
Composite Resample Receipt Lineage /
Surface Registry Final Ownership Adoption /
Preview·Export Shared Final Surface Convergence /
Failure-Atomic Promotion /
No Dual Final Texture Authority Seal

- Patch ID: `TDT-BAKEMONO-RINNE-WGSL-05`
- Spec schema: `tdt.effect.bakemono-rinne.wgsl05.spec.v1`
- Parent source bundle: `68_TDT_BAKEMONO_RINNE_WGSL_04_R9A_GRAPH_NATIVE_SINGLE_SUBMIT_SOURCE_BAKED_AWAITING_PHYSICAL_GPU.zip`
- Parent patch: `TDT-BAKEMONO-RINNE-WGSL-04`
- Target runtime: R9A canonical EWA command graph and Runtime Final Surface authority
- Target output authority in this patch: `CANONICAL_FINAL_TEXTURE`
- Canonical Final Texture claim in this patch: `true` only for admitted `CANONICAL_FINAL` mode
- Preview publication claim in this patch: `true` through existing Pipeline publication
- Export publication claim in this patch: `true` through the same Final Surface tuple
- Product intermediate readback claim: `0`
- Standard owned graph encoder and submit claim: `1 encoder / 1 submit`

---

## 0. 목적

이 패치는 WGSL-04에서 R9A command graph 안에 생성한 `nativeEffectCandidate.texture`를 실제 canonical `terminalTexture`로 채택한다.

핵심 목표는 다음 한 줄이다.

```text
Final EWA texture
  -> terminal-resolution integrated R1C
  -> Bakemono/Rinne canonical effect candidate
  -> failure-atomic final texture adoption
  -> graph.submit() 1회
  -> adopted texture만 canonical resample result로 반환
  -> Surface Registry final ownership adoption
  -> Pipeline publication
  -> Preview와 Export가 동일 surfaceId / finalRevision / receipt digest 소비
```

WGSL-04는 효과 candidate를 graph 안에서 생성했지만 최종 반환과 publication 권위는 기존 EWA texture에 남겨 두었다. WGSL-05는 그 권위를 하나의 트랜잭션으로 이동한다.

이 패치의 완료 조건은 효과 texture가 만들어졌다는 사실이 아니다. 다음 다섯 권위가 모두 같은 texture를 가리켜야 한다.

- `executeCanonicalEwaLowpassR9A()` result의 `terminalTexture`
- `runDeltaKStackCanonical()`이 receipt를 결합하는 texture key
- `executeCanonicalAdaptiveR1D()`이 반환하는 `tex`
- `SurfaceRegistryAuthorityService`에 등록되는 GPU payload
- `PipelineService`가 publish하는 Final Surface

## 1. 현재 구현에서 확인된 권위 단절

### 1.1 `nativeEffectCandidate`가 생성돼도 기존 EWA texture를 반환함

현재 `ewa_single_submit_runtime_r9a.mjs`는 effect를 기록한 뒤에도 다음 값을 반환한다.

```js
return {
  terminalTexture,
  nativeEffectCandidate,
};
```

여기서 `terminalTexture`는 effect 전의 Final EWA texture다. 따라서 효과 pass가 실제로 실행되어도 downstream canonical executor는 원래 EWA texture를 등록한다.

### 1.2 candidate 기본 수명이 graph transient임

WGSL-04 candidate handle은 `retainCandidate`가 false이면 즉시 `release()`되고, output texture가 graph transient ledger에 들어간다.

Final adoption mode에서 caller가 `retainCandidate`를 잊거나 조작할 수 있게 두면, canonical result로 반환할 texture가 submission completion 때 파괴된다. WGSL-05는 `retainCandidate`를 public final-mode 제어값에서 제거한다.

### 1.3 output receipt가 기존 EWA texture에만 결합됨

`deltaK_stack_autoEWA.mjs`는 `outputReceipts.set(result.terminalTexture, envelope)`만 수행한다. Effect candidate에는 final receipt가 결합되지 않는다.

WGSL-05에서는 adopted texture만 final composite receipt를 갖는다. Base EWA texture는 lowpass evidence를 유지할 수 있지만 Final Texture claim을 가질 수 없다.

### 1.4 최종 실행 identity가 저역통과 kernel만 주장함

현재 `deriveActualResampleIdentityR8A()`는 lowpass receipt의 kernel identity를 canonical result identity로 사용한다.

Effect가 픽셀을 변경한 뒤에도 `executedKernelId`가 EWA kernel 하나만 가리키면 실제 실행 그래프와 receipt가 어긋난다. WGSL-05는 EWA, terminal R1C, Bakemono/Rinne effect를 포함하는 composite execution identity를 만든다.

### 1.5 Surface Registry owner와 Pipeline Final owner 조건이 충돌함

Canonical executor는 GPU surface를 `ownerServiceId = ResampleWorkerBroker`로 등록한다. 반면 `SurfaceRegistryAuthorityService.bindFinal()`은 owner가 `PipelineService`일 때만 Final binding을 허용한다.

따라서 실제 Final promotion은 owner mismatch에서 막힐 수 있다. WGSL-05는 Surface Registry에 명시적인 final ownership adoption 트랜잭션을 추가한다.

### 1.6 canonical surface evidence에 Final Effect lineage가 없음

현재 canonical executor 등록 evidence는 lowpass kernel, planner, shader digest set만 기록한다.

WGSL-05에서는 다음을 추가한다.

- canonical final texture authority
- final adoption receipt digest
- effect dispatch receipt digest
- terminal R1C producer receipt digest
- lambda2 qualification receipt digest
- composite execution identity digest

### 1.7 Preview와 Export 하류는 이미 동일 tuple을 소비할 준비가 됨

PreviewPresenter와 ExportAuthority는 Pipeline publication의 동일한 `surfaceId`, `sourceRevision`, `finalRevision`, `resampleReceiptDigest`를 pin하고 FinalSurfaceConsumptionLedger에서 parity를 확인한다.

따라서 하류 렌더러를 별도로 갈아엎을 필요는 없다. WGSL-05의 책임은 올바른 texture와 receipt를 Surface Registry와 Pipeline에 넣는 것이다.

### 1.8 Legacy Final Surface Bridge를 통한 GPU texture 재등록 위험

Canonical broker result는 이미 Surface Registry에 등록된 `surfaceId`를 반환한다. 같은 texture object를 Legacy Final Surface Bridge로 다시 등록하면 두 record가 같은 GPUTexture를 owned payload로 가질 수 있다.

WGSL-05 canonical path는 bridge를 우회하고 existing surface record를 ownership-adopt하여 publish한다. 동일 GPU texture의 이중 owned registration은 거절한다.

## 2. 범위

### 2.1 포함

- WGSL-04 effect mode에 `CANONICAL_FINAL` 추가
- Final mode에서 candidate retention을 caller flag가 아닌 runtime authority가 결정
- Candidate handle의 `AVAILABLE -> ADOPTED | RELEASED` 단일 종결 상태기계
- R9A submit 전에 canonical final texture 선택
- Adopted candidate의 graph transient 해제 방지
- Owned base EWA terminal의 submission-fenced retirement
- Stage count 0 identity path의 caller-owned source 비파괴
- Final texture descriptor와 adoption receipt
- Lowpass + terminal R1C + effect의 composite final receipt
- Composite actual execution identity v2
- Adopted texture에만 output metadata 결합
- Canonical executor가 adopted texture를 Surface Registry에 한 번만 등록
- Surface Registry final ownership adoption API
- PipelineService publication의 ownership adoption 결선
- Preview와 Export shared tuple에 effect final receipt digest 전파
- Publication 실패 시 candidate와 surface의 정확한 rollback
- Device loss 시 adopted Final Surface revoke
- Single encoder, single submit, zero intermediate readback 유지

### 2.2 제외

- Q-map 자동 생성 또는 자동 리샘플
- Q-wave Real DeltaK 자동 연결
- Alpha-depth 자동 파생
- Highlight mask 자동 파생
- Legacy mask 제거
- UI parameter panel 및 preset migration
- WebGL fallback 제거
- Effect texture pool 또는 atlas 최적화
- ICC 기반 canonical color formula 교체
- Device fleet 전체 물리 qualification

위 제외 항목 중 field 자동 결선은 WGSL-06의 책임이다.

## 3. SSOT와 상태 귀속

| 상태 | SSOT |
|---|---|
| GPU device epoch | GPU Device Authority |
| R9A command encoder와 submit | R9A Command Graph |
| Base EWA lowpass result | R9A lowpass runtime |
| Terminal integrated R1C | WGSL-04 terminal tensor producer |
| Effect candidate | WGSL-04 candidate handle |
| Final texture selection | WGSL-05 Final Texture Adoption Authority |
| GPU surface lifecycle | Surface Registry Authority |
| Final revision과 publication | PipelineService |
| Preview·Export shared tuple | FinalSurfaceConsumptionLedgerService |
| Composite execution identity | WGSL-05 composite identity authority |
| Physical lambda2 qualification | WGSL-04 device-scoped qualification authority |

동일 상태를 두 모듈이 동시에 소유하지 않는다. WGSL-05는 candidate texture를 새로 계산하지 않고, 기존 candidate의 권위를 이동한다.

## 4. Target graph

```text
createEwaCommandGraphR9A()
  -> source prepare, optional
  -> canonical EWA stages
  -> finalize lowpass receipt
  -> FINAL_EWA_TERMINAL descriptor
  -> terminal R1C 6 passes
  -> Bakemono/Rinne effect 1 pass
  -> selectCanonicalFinalTextureWgsl05()
       DISABLED          -> Base EWA adopted
       CANONICAL_SHADOW  -> Base EWA adopted, candidate transient
       CANONICAL_FINAL   -> Effect candidate adopted, owned base retired
  -> graph.submit() exactly once
  -> result.terminalTexture = adopted texture
  -> final composite receipt bound to adopted texture
  -> canonical executor registers adopted texture
  -> Pipeline publishes same surface
  -> Preview and Export pin same surface
```

Final texture selection은 반드시 `graph.submit()` 전에 끝나야 한다. 그래야 transient ledger와 caller-transfer ownership이 submission fence와 함께 확정된다.

## 5. Canonical identities

- `BKR05_PATCH_ID = TDT-BAKEMONO-RINNE-WGSL-05`
- `BKR05_FINAL_AUTHORITY = CANONICAL_FINAL_TEXTURE`
- `BKR05_ADOPTION_AUTHORITY_ID = tdt.effect.bakemono-rinne.final-texture-adoption.wgsl05.v1`
- `BKR05_FINAL_DESCRIPTOR_SCHEMA_ID = tdt.surface.canonical-final-texture-descriptor.wgsl05.v1`
- `BKR05_ADOPTION_RECEIPT_SCHEMA_ID = tdt.effect.bakemono-rinne.final-texture-adoption-receipt.wgsl05.v1`
- `BKR05_FINAL_RECEIPT_SCHEMA_ID = tdt.resample.canonical-final-output-receipt.wgsl05.v1`
- `BKR05_COMPOSITE_IDENTITY_SCHEMA_ID = tdt.resample.actual-identity.r8a-bkr05.v2`
- `BKR05_COMPOSITE_KERNEL_ID = tdt.resample.ewa-r1c-bakemono-rinne.composite.wgsl05.v1`
- `BKR05_COMPOSITE_CONTRACT_ID = tdt.resample.composite-contract.bakemono-rinne.wgsl05.v1`
- `BKR05_FINAL_PROFILE_ID = tdt.effect.bakemono-rinne.profile.r1c-gated-canonical-final.v1`

## 6. Effect mode와 publication admission

### 6.1 Modes

```text
DISABLED
CANONICAL_SHADOW
CANONICAL_FINAL
```

### 6.2 Mode 결과

| mode | final texture | candidate publication | canonical final claim |
|---|---|---:|---:|
| `DISABLED` | Base EWA | 0 | true, EWA identity path |
| `CANONICAL_SHADOW` | Base EWA | 0 | true, EWA identity path |
| `CANONICAL_FINAL` | Bakemono/Rinne candidate | 1 | true, effect final path |

### 6.3 Final mode admission

- `allowFinalPublication === true`
- `purpose === FINAL_SURFACE_PUBLICATION` 또는 qualification의 명시적 final purpose
- WGSL-04 graph recording receipt가 유효함
- device-scoped lambda2 qualification receipt가 PASS임
- formula and phase receipts가 유효함
- candidate가 `AVAILABLE` 상태임
- base와 candidate의 dimensions, format, epoch, commandGraphId가 일치함

`retainCandidate`는 final mode public request에서 금지한다. Final retention은 adoption authority가 결정한다.

## 7. Candidate handle 상태기계

```text
AVAILABLE
  | adoptForFinal()
  v
ADOPTED

AVAILABLE
  | release()
  v
RELEASED

ADOPTED -> release() forbidden
RELEASED -> adoptForFinal() forbidden
ADOPTED -> adoptForFinal() replay forbidden
```

### 7.1 Handle contract

```ts
interface BakemonoRinneCandidateHandleWgsl05 {
  readonly schemaId: "tdt.effect.bakemono-rinne.r9a-candidate-handle.wgsl05.v1";
  readonly authority: "R9A_GRAPH_CANDIDATE_TRANSFERABLE";
  readonly texture: GPUTexture;
  readonly state: "AVAILABLE" | "ADOPTED" | "RELEASED";
  readonly commandGraphId: string;
  readonly deviceEpoch: number;
  readonly graphRecordingReceiptDigest: string;
  adoptForFinal(input: FinalAdoptionBinding): AdoptedFinalTextureHandle;
  release(reason?: string): void;
}
```

Candidate의 texture object는 digest에 넣지 않는다. Handle object identity와 sealed receipt lineage로 권위를 검증한다.

## 8. Final Texture Adoption Authority

### 8.1 API

```js
selectCanonicalFinalTextureWgsl05(graph, {
  mode,
  identity,
  baseEwaSurface,
  baseEwaOwned,
  nativeEffectCandidate,
  nativeEffectRecordingReceipt,
  sourceRevision,
  jobId,
})
```

### 8.2 DISABLED path

- candidate는 null이어야 함
- final texture는 base EWA texture
- base texture ownership은 기존 규칙을 유지
- final role은 `EWA_IDENTITY_FINAL`
- effect dispatch count는 0

### 8.3 CANONICAL_SHADOW path

- final texture는 base EWA texture
- candidate는 adoption되지 않음
- candidate는 graph transient로 release
- effect receipt는 diagnostics lineage로만 기록
- Final Surface evidence는 shadow candidate를 최종 결과로 주장하지 않음

### 8.4 CANONICAL_FINAL path

- candidate가 반드시 존재
- candidate state가 `AVAILABLE`
- `adoptForFinal()`이 exactly once 실행
- adopted candidate를 graph transient에서 제외
- base EWA가 runtime-owned이면 graph transient로 retirement 등록
- base EWA가 caller-owned source면 destroy 또는 transient 등록 금지
- result `terminalTexture`는 candidate texture
- result `destroyTerminal()`은 adopted candidate만 dispose 요청

## 9. Original EWA terminal retirement

Base EWA texture는 effect pass의 입력으로 submission completion까지 살아 있어야 한다. 따라서 final selection 시 즉시 `destroy()`하지 않는다.

```js
if (mode === "CANONICAL_FINAL" && baseEwaOwned) {
  graph.trackTransient(baseEwaTexture, {
    resourceKind: "superseded-final-ewa-terminal",
    retireAfter: "submission-completion",
  });
}
```

Stage count 0에서 base가 caller source texture인 경우 `baseEwaOwned = false`다. 이 texture는 WGSL-05가 파괴하지 않는다.

## 10. Final texture descriptor

```js
{
  schemaVersion: 1,
  schemaId: "tdt.surface.canonical-final-texture-descriptor.wgsl05.v1",
  authority: "CANONICAL_FINAL_TEXTURE",
  finalRole: "EWA_IDENTITY_FINAL" | "BAKEMONO_RINNE_R1C_FINAL",
  texture: GPUTexture,
  width,
  height,
  format: "rgba16float",
  semanticId: "tdt.surface.canonical.linear-premul.rgba16float.v1",
  transfer: "linear",
  alphaMode: "premultiplied",
  coordinateSpace: "output-pixel",
  runtimeEpoch,
  deviceEpoch,
  deviceIdentity,
  commandGraphId,
  sourceRevision,
  baseLowpassReceiptDigest,
  adoptionReceiptDigest,
}
```

Descriptor의 `texture`를 제외한 canonical body에 digest를 부여한다. Opaque GPU object 직렬화는 금지한다.

## 11. Final adoption receipt

```js
{
  schemaVersion: 1,
  schemaId: "tdt.effect.bakemono-rinne.final-texture-adoption-receipt.wgsl05.v1",
  authorityId: "tdt.effect.bakemono-rinne.final-texture-adoption.wgsl05.v1",
  operationId,
  mode,
  finalRole,
  commandGraphId,
  runtimeEpoch,
  deviceEpoch,
  deviceIdentity,
  baseLowpassReceiptDigest,
  graphRecordingReceiptDigest,
  terminalTensorProducerReceiptDigest,
  effectDispatchReceiptDigest,
  lambda2QualificationReceiptDigest,
  finalTextureSemanticId,
  finalTextureWidth,
  finalTextureHeight,
  finalTextureFormat,
  baseOwned,
  baseRetirementScheduled,
  candidateStateBefore,
  candidateStateAfter,
  selectedBeforeSubmit: true,
  commandEncoderCount: 1,
  queueSubmitCountAtSelection: 0,
  intermediateReadbackCount: 0,
  canonicalFinalTextureClaim: true,
  receiptDigest,
  selfSha256,
}
```

## 12. Composite canonical final output receipt

Lowpass receipt는 EWA 계산의 진실로 유지한다. Final output truth는 별도 composite receipt가 소유한다.

```js
{
  schemaVersion: 1,
  schemaId: "tdt.resample.canonical-final-output-receipt.wgsl05.v1",
  patchId: "TDT-BAKEMONO-RINNE-WGSL-05",
  finalKernelId: "tdt.resample.ewa-r1c-bakemono-rinne.composite.wgsl05.v1",
  finalRole,
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  outputFormat: "rgba16float",
  outputSemanticId: "tdt.surface.canonical.linear-premul.rgba16float.v1",
  lowpassReceiptId,
  lowpassReceiptDigest,
  lowpassPlanDigest,
  finalAdoptionReceiptDigest,
  graphRecordingReceiptDigest,
  terminalTensorProducerReceiptDigest,
  effectDispatchReceiptDigest,
  formulaContractReceiptDigest,
  phaseReceiptDigest,
  lambda2QualificationReceiptDigest,
  pipelineSetIdentityDigest,
  compositeActualIdentityDigest,
  commandGraphSubmitReceipt,
  queueSubmitCount: 1,
  commandEncoderCount: 1,
  intermediateReadbackCount: 0,
  canonicalFinalTextureClaim: true,
}
```

DISABLED와 SHADOW path에서도 같은 schema를 사용하되 `finalRole = EWA_IDENTITY_FINAL`, effect receipt fields는 null, effect dispatch count는 0으로 기록한다.

## 13. Composite actual execution identity v2

WGSL-05 active final output은 EWA kernel 하나가 아니라 ordered kernel graph다.

```js
actualIdentity = {
  schemaId: "tdt.resample.actual-identity.r8a-bkr05.v2",
  executionKind: "R9A_EWA_TERMINAL_R1C_BAKEMONO_RINNE",
  kernelId: "tdt.resample.ewa-r1c-bakemono-rinne.composite.wgsl05.v1",
  kernelContractId: "tdt.resample.composite-contract.bakemono-rinne.wgsl05.v1",
  kernelContractDigest,
  parameterAbiId: "tdt.resample.composite-abi-set.wgsl05.v1",
  plannerId,
  planDigest,
  generatedManifestId,
  generatedManifestDigest,
  orderedKernelGraph: [
    { role: "LOWPASS", kernelId, contractDigest, shaderDigests },
    { role: "TERMINAL_R1C", pipelineIdentity, shaderDigests },
    { role: "FINAL_EFFECT", pipelineIdentityDigest, shaderDigest },
  ],
  shaderDigestSet,
  orderedKernelGraphDigest,
}
```

`executedKernelId`, `kernelId`, `actualIdentity.kernelId`는 모두 composite kernel ID와 일치해야 한다. Base lowpass kernel ID는 별도 field로 보존한다.

## 14. R9A result envelope

### 14.1 Result shape

```js
{
  terminalTexture: adoptedFinal.texture,
  terminalDescriptor: adoptedFinal.descriptor,
  finalAdoptionReceipt,
  canonicalFinalOutputReceipt,
  baseLowpassTexture: diagnosticsOnlyOpaqueReference,
  nativeEffectCandidate: null,
  terminalWidth,
  terminalHeight,
  terminalFormat: "rgba16float",
  destroyTerminal,
}
```

Public result에 transferable candidate handle을 남기지 않는다. Adoption 뒤 candidate는 Final Texture handle로 변환되고, candidate 권위는 종결된다.

### 14.2 Output metadata binding

- `outputReceipts.set(adoptedTexture, canonicalFinalOutputReceipt)` exactly once
- Base EWA texture에 composite final receipt를 결합하지 않음
- `getDeltaKEwaOutputMetadata(adoptedTexture)`가 composite receipt 반환
- Effect final path에서 `outputSurfaceOwnership = caller-transfer`
- DISABLED identity path에서 source texture와 동일하면 caller-source-retained

## 15. Canonical adaptive facade

`executeCanonicalAdaptiveR1D()`은 WGSL-05 final receipt를 읽어 반환 texture와 actual identity를 구성한다.

- `tex`는 adopted final texture
- `view`는 adopted texture view
- `resampleReceipt`는 composite final output receipt
- `resampleReceiptDigest`는 composite receipt digest
- `resampleReceiptId`는 WGSL-05 namespace
- `executedKernelId`는 composite kernel ID
- lowpass kernel identity는 `baseLowpassIdentity`로 별도 보존

## 16. Canonical executor surface registration

Canonical executor는 adopted texture를 한 번만 Surface Registry에 등록한다.

```ts
surfaces.register({
  kind: "gpu-texture",
  ownerServiceId: SERVICE_IDS.resampleWorkerBroker,
  producerId: "tdt.resample.canonical-executor-registration.wgsl05.v1",
  allocationClass: "working",
  payload: output.tex,
  storage: "gpu-texture",
  dimensions: { width: output.width, height: output.height },
  format: "rgba16float",
  alphaMode: "premultiplied",
  colorContract: {
    semanticId: "tdt.surface.canonical.linear-premul.rgba16float.v1",
    transfer: "linear",
    alphaMode: "premultiplied",
  },
  deviceBinding,
  owned: true,
  evidence: {
    canonicalResampleResult: true,
    canonicalFinalTexture: true,
    finalTextureAuthority: "CANONICAL_FINAL_TEXTURE",
    finalRole,
    resampleReceiptId,
    resampleReceiptDigest,
    finalAdoptionReceiptDigest,
    compositeActualIdentityDigest,
    graphRecordingReceiptDigest,
    effectDispatchReceiptDigest,
    terminalTensorProducerReceiptDigest,
    lambda2QualificationReceiptDigest,
  },
});
```

등록 이전에 output texture를 다른 owned Surface record가 이미 소유하고 있으면 `E_BKR05_DUPLICATE_TEXTURE_OWNERSHIP`으로 거절한다.

## 17. Surface Registry final ownership adoption

### 17.1 새 API

```ts
prepareFinalOwnershipAdoption(surfaceId, {
  expectedOwnerServiceId,
  targetOwnerServiceId: SERVICE_IDS.pipeline,
  sourceRevision,
  finalRevision,
  pipelineReceiptId,
  resampleReceiptId,
  resampleReceiptDigest,
}) -> opaque permit

commitFinalOwnershipAdoption(permit) -> CanonicalSurfaceRecord
abortFinalOwnershipAdoption(permit)
```

### 17.2 Prepare 조건

- surface state가 ACTIVE
- borrowCount와 pinCount가 0
- disposeRequested가 false
- current owner가 expected owner와 일치
- GPU device binding이 현재 ACTIVE epoch와 일치
- evidence의 canonical final claim과 receipt identity가 완전함
- surface dimensions와 final receipt dimensions가 일치
- surface payload가 adopted texture와 같은 object identity

### 17.3 Commit

- ownerServiceId를 PipelineService로 변경
- ownerGeneration 증가
- allocationClass를 `final`로 변경
- sourceRevision과 finalRevision 확정
- permit single-use tombstone 기록

Prepare는 mutation이 없고 Commit은 동기 원자 구간이다. Commit 전 실패는 surface record를 변경하지 않는다.

## 18. Pipeline publication transaction

`PipelineService.publishFinalCandidate()`는 다음 순서를 따른다.

```text
1. publication request와 surface evidence 전체 검증
2. next finalRevision 예약
3. Surface Registry prepareFinalOwnershipAdoption()
4. adoption permit commit
5. Pipeline binding commit
6. previous final surface invalidate
7. publication emit
8. permit tombstone와 publication receipt 기록
```

3 이전 실패는 아무 상태도 변경하지 않는다. 4 이후 내부 예외가 발생하면 Pipeline binding을 이전 값으로 복원하고 새 surface를 invalidate한다. Listener 예외는 기존 규칙대로 transaction 이후 diagnostics로 격리한다.

## 19. Preview·Export shared final surface convergence

PreviewPresenter와 ExportAuthority 코드는 texture selection을 다시 하지 않는다. Pipeline publication만 소비한다.

- 두 consumer의 surfaceId 동일
- sourceRevision 동일
- finalRevision 동일
- pipelineReceiptId 동일
- WGSL-05 resampleReceiptId 동일
- WGSL-05 resampleReceiptDigest 동일
- FinalSurfaceConsumptionLedger state가 MATCHED
- Preview는 GPU texture를 직접 present
- Export는 동일 GPU texture를 encoder 입력으로 사용

Preview canvas나 WebGL FBO를 Export source로 사용하는 경로는 계속 금지한다.

## 20. Failure-atomic promotion

| 실패 위치 | 필수 처리 |
|---|---|
| Effect recording 전 | Base EWA runtime 기존 실패 처리 |
| Effect recording 중 | candidate output graph transient 등록 |
| Candidate adoption 전 | candidate release, base 유지 |
| Candidate adoption 후 submit 전 | candidate final ownership rollback, candidate transient 등록 |
| graph.submit 실패 | adopted candidate destroy, base retirement cleanup, result 미반환 |
| Surface register 실패 | adopted texture destroy exactly once |
| Final ownership prepare 실패 | surface ACTIVE 유지, caller가 dispose 요청 |
| Final ownership commit 실패 | permit abort, Pipeline binding 불변 |
| Pipeline publication 실패 | 새 surface invalidate, 이전 final binding 유지 |
| Device loss | surface pin abort, Pipeline binding revoke, texture dispose |

## 21. Device loss와 epoch binding

- Final descriptor runtimeEpoch/deviceEpoch/deviceIdentity와 Surface deviceBinding 일치
- Adoption receipt와 Pipeline publication이 동일 epoch lineage 사용
- device loss 시 Surface Registry가 adopted texture record를 ABORTED 처리
- Pipeline recovery participant가 Final binding을 null로 revoke
- stale candidate를 새 device epoch에서 재publish 금지
- rebuild 이후 새 pipeline set으로 effect를 재실행해야 함

## 22. No dual final texture authority

Active effect final path에서 다음 불변식을 강제한다.

```text
finalTextureObject === nativeEffectCandidate.texture
finalTextureObject !== baseEwaTexture
compositeReceiptBoundTextureCount === 1
surfaceRegistryOwnedRecordCountForTexture === 1
pipelineCurrentFinalSurfaceCount === 1
baseEwaCanonicalFinalClaim === false
candidateHandleState === "ADOPTED"
legacyBridgePromotionCountForTexture === 0
```

## 23. Single submit와 zero readback 보존

- Final selection은 GPU pass를 추가하지 않음
- WGSL-04의 추가 pass count 7 유지
- commandEncoderCount 1 유지
- queueSubmitCount 1 유지
- terminal R1C per-operation readback 0 유지
- effect intermediate readback 0 유지
- Surface promotion 과정에서 GPU readback 금지
- Preview는 별도 presentation submit을 사용할 수 있으나 resample graph submit count와 혼합하지 않음

## 24. Stable errors

- `E_BKR05_FINAL_MODE_NOT_ADMITTED`
- `E_BKR05_FINAL_CANDIDATE_REQUIRED`
- `E_BKR05_FINAL_CANDIDATE_STATE`
- `E_BKR05_FINAL_CANDIDATE_REPLAY`
- `E_BKR05_FINAL_CANDIDATE_RELEASED`
- `E_BKR05_FINAL_TEXTURE_IDENTITY`
- `E_BKR05_FINAL_TEXTURE_EPOCH`
- `E_BKR05_FINAL_TEXTURE_DIMENSION`
- `E_BKR05_FINAL_TEXTURE_FORMAT`
- `E_BKR05_FINAL_SELECTION_AFTER_SUBMIT`
- `E_BKR05_BASE_OWNERSHIP_INVALID`
- `E_BKR05_BASE_RETIREMENT_INVALID`
- `E_BKR05_COMPOSITE_RECEIPT_MISSING`
- `E_BKR05_COMPOSITE_RECEIPT_MISMATCH`
- `E_BKR05_COMPOSITE_IDENTITY_MISMATCH`
- `E_BKR05_DUPLICATE_TEXTURE_OWNERSHIP`
- `E_BKR05_SURFACE_EVIDENCE_INCOMPLETE`
- `E_BKR05_SURFACE_OWNER_MISMATCH`
- `E_BKR05_FINAL_OWNERSHIP_PERMIT`
- `E_BKR05_FINAL_OWNERSHIP_REPLAY`
- `E_BKR05_FINAL_OWNERSHIP_STALE`
- `E_BKR05_PIPELINE_PUBLICATION_ROLLBACK`
- `E_BKR05_SHARED_SURFACE_TUPLE_MISMATCH`
- `E_BKR05_DUAL_FINAL_AUTHORITY`
- `E_BKR05_LEGACY_BRIDGE_REENTRY`
- `E_BKR05_INTERMEDIATE_READBACK_FORBIDDEN`
- `E_BKR05_SECOND_SUBMIT_FORBIDDEN`

## 25. 파일 변경 계획

### 25.1 수정

- `app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs`
- `app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_04_contract.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_04_integration.mjs`
- `app/src/runtime/resample/canonical-resample-executor-r8a.ts`
- `app/src/runtime/resample/resample-compatibility-types.ts`
- `app/src/runtime/surfaces/surface-registry-authority-service.ts`
- `app/src/runtime/surfaces/surface-types.ts`
- `app/src/runtime/pipeline/pipeline-service.ts`
- `app/src/runtime/pipeline/final-surface-consumption-ledger-service.ts`
- `app/src/runtime/pipeline/legacy-final-surface-bridge-service.ts`
- `app/src/env.d.ts`

### 25.2 신규

- `app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_05_contract.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_05_adoption.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_05_receipt.mjs`
- `app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_05_identity.mjs`
- `app/src/runtime/effects/bakemono-rinne/bakemono-rinne-wgsl-05-types.ts`
- `README_TDT_BAKEMONO_RINNE_WGSL_05_APPLIED.md`

### 25.3 검증 도구

- `tools/bakemono-rinne-wgsl-05/verify-source.mjs`
- `tools/bakemono-rinne-wgsl-05/verify-negative-controls.mjs`
- `tools/bakemono-rinne-wgsl-05/verify-adoption-state-machine.mjs`
- `tools/bakemono-rinne-wgsl-05/verify-surface-ownership.mjs`
- `tools/bakemono-rinne-wgsl-05/verify-shared-consumption.mjs`
- `tools/bakemono-rinne-wgsl-05/gate-source.mjs`
- `tools/bakemono-rinne-wgsl-05/gate-physical.mjs`
- `tools/bakemono-rinne-wgsl-05/finalize-source.mjs`
- `tools/bakemono-rinne-wgsl-05/finalize-physical.mjs`

## 26. 구현 순서

1. WGSL-05 identity와 receipt module 추가
2. WGSL-04 candidate handle을 transferable state machine으로 확장
3. Final Texture Adoption Authority 구현
4. R9A stage-count 0과 multi-stage 양쪽에 final selection 연결
5. Adopted texture만 result terminalTexture로 반환
6. Base EWA retirement와 caller-owned source 보존 처리
7. DeltaK output metadata를 adopted texture로 이동
8. Composite final receipt와 actual identity v2 생성
9. Canonical adaptive facade 반환 identity 교체
10. Canonical executor surface evidence 확장
11. Surface Registry two-phase final ownership adoption 추가
12. PipelineService publication transaction 연결
13. Legacy bridge canonical re-entry 차단
14. Preview·Export shared tuple regression 추가
15. Source, negative, physical gate 구축

## 27. Source Gate

총 Source Gate: **240**

### BKR05-BASE-001

- PASS when: 부모 WGSL-04 spec digest 보존.

### BKR05-BASE-002

- PASS when: 부모 WGSL-04 source receipt 보존.

### BKR05-BASE-003

- PASS when: WGSL-04 graph pass count 7 보존.

### BKR05-BASE-004

- PASS when: WGSL-04 pipeline family count 4 보존.

### BKR05-BASE-005

- PASS when: WGSL-03 canonical ABI 보존.

### BKR05-BASE-006

- PASS when: WGSL-02 compatibility ABI 보존.

### BKR05-BASE-007

- PASS when: Final mode identity 상수 존재.

### BKR05-BASE-008

- PASS when: Final authority ID 존재.

### BKR05-BASE-009

- PASS when: Final descriptor schema 존재.

### BKR05-BASE-010

- PASS when: Adoption receipt schema 존재.

### BKR05-BASE-011

- PASS when: Composite receipt schema 존재.

### BKR05-BASE-012

- PASS when: Composite identity v2 schema 존재.

### BKR05-BASE-013

- PASS when: Composite kernel ID 존재.

### BKR05-BASE-014

- PASS when: Composite contract ID 존재.

### BKR05-BASE-015

- PASS when: Final profile ID 존재.

### BKR05-BASE-016

- PASS when: No legacy tensor admission 보존.

### BKR05-BASE-017

- PASS when: Lambda2 qualification requirement 보존.

### BKR05-BASE-018

- PASS when: No post-submit hook 보존.

### BKR05-BASE-019

- PASS when: No direct submit 보존.

### BKR05-BASE-020

- PASS when: No intermediate readback 보존.

### BKR05-BASE-021

- PASS when: Single encoder claim 존재.

### BKR05-BASE-022

- PASS when: Single submit claim 존재.

### BKR05-BASE-023

- PASS when: Parent active graph required nodes 보존.

### BKR05-BASE-024

- PASS when: Parent generated shader digest 보존.

### BKR05-BASE-025

- PASS when: Parent formula contract digest 보존.

### BKR05-BASE-026

- PASS when: Parent phase contract identity 보존.

### BKR05-BASE-027

- PASS when: Parent scalar profile identity 보존.

### BKR05-BASE-028

- PASS when: Parent terminal R1C identity 보존.

### BKR05-BASE-029

- PASS when: Parent effect pipeline identity 보존.

### BKR05-BASE-030

- PASS when: Parent receipt verifier 보존.

### BKR05-ADOPT-001

- PASS when: CANONICAL_FINAL mode admitted.

### BKR05-ADOPT-002

- PASS when: DISABLED mode identity final path.

### BKR05-ADOPT-003

- PASS when: CANONICAL_SHADOW base final path.

### BKR05-ADOPT-004

- PASS when: Final mode requires candidate.

### BKR05-ADOPT-005

- PASS when: Final mode requires allowFinalPublication.

### BKR05-ADOPT-006

- PASS when: Final purpose allowlist enforced.

### BKR05-ADOPT-007

- PASS when: retainCandidate caller flag denied in final mode.

### BKR05-ADOPT-008

- PASS when: Candidate AVAILABLE initial state.

### BKR05-ADOPT-009

- PASS when: AVAILABLE to ADOPTED transition.

### BKR05-ADOPT-010

- PASS when: AVAILABLE to RELEASED transition.

### BKR05-ADOPT-011

- PASS when: ADOPTED replay denied.

### BKR05-ADOPT-012

- PASS when: RELEASED adoption denied.

### BKR05-ADOPT-013

- PASS when: ADOPTED release denied.

### BKR05-ADOPT-014

- PASS when: Candidate commandGraphId exact match.

### BKR05-ADOPT-015

- PASS when: Candidate runtimeEpoch exact match.

### BKR05-ADOPT-016

- PASS when: Candidate deviceEpoch exact match.

### BKR05-ADOPT-017

- PASS when: Candidate deviceIdentity exact match.

### BKR05-ADOPT-018

- PASS when: Candidate dimensions exact match.

### BKR05-ADOPT-019

- PASS when: Candidate format rgba16float.

### BKR05-ADOPT-020

- PASS when: Candidate semantic identity exact match.

### BKR05-ADOPT-021

- PASS when: Selection occurs before submit.

### BKR05-ADOPT-022

- PASS when: Selection after submit rejected.

### BKR05-ADOPT-023

- PASS when: Adoption receipt generated.

### BKR05-ADOPT-024

- PASS when: Adoption receipt self digest verifies.

### BKR05-ADOPT-025

- PASS when: Adoption receipt tamper rejected.

### BKR05-ADOPT-026

- PASS when: Final descriptor generated.

### BKR05-ADOPT-027

- PASS when: Final descriptor opaque texture excluded from digest.

### BKR05-ADOPT-028

- PASS when: Final descriptor digest deterministic.

### BKR05-ADOPT-029

- PASS when: Final role exact enum.

### BKR05-ADOPT-030

- PASS when: Canonical final claim true exactly once.

### BKR05-LIFE-001

- PASS when: Owned base EWA retirement scheduled.

### BKR05-LIFE-002

- PASS when: Caller-owned base EWA not destroyed.

### BKR05-LIFE-003

- PASS when: Stage-count zero owned prepare output retired.

### BKR05-LIFE-004

- PASS when: Stage-count zero caller source retained.

### BKR05-LIFE-005

- PASS when: Multi-stage base terminal retired.

### BKR05-LIFE-006

- PASS when: Candidate untracked from transient on adoption.

### BKR05-LIFE-007

- PASS when: Shadow candidate remains transient.

### BKR05-LIFE-008

- PASS when: Failure before adoption releases candidate.

### BKR05-LIFE-009

- PASS when: Failure after adoption before submit rolls back.

### BKR05-LIFE-010

- PASS when: Submit failure destroys adopted candidate.

### BKR05-LIFE-011

- PASS when: Submission completion destroys superseded base.

### BKR05-LIFE-012

- PASS when: Submission completion preserves adopted final.

### BKR05-LIFE-013

- PASS when: destroyTerminal targets adopted final only.

### BKR05-LIFE-014

- PASS when: destroyTerminal idempotent.

### BKR05-LIFE-015

- PASS when: Base destroy callback not exposed as final destroy.

### BKR05-LIFE-016

- PASS when: No direct texture.destroy before submission.

### BKR05-LIFE-017

- PASS when: Transient metadata records retirement reason.

### BKR05-LIFE-018

- PASS when: Uniform allocations unaffected.

### BKR05-LIFE-019

- PASS when: Terminal R1C resources remain transient.

### BKR05-LIFE-020

- PASS when: Effect input textures not re-owned.

### BKR05-LIFE-021

- PASS when: Qmap descriptor ownership unchanged.

### BKR05-LIFE-022

- PASS when: Scalar descriptor ownership unchanged.

### BKR05-LIFE-023

- PASS when: Mask descriptors ownership unchanged.

### BKR05-LIFE-024

- PASS when: Device loss adopted surface disposal path exists.

### BKR05-LIFE-025

- PASS when: Stale epoch candidate rejected.

### BKR05-LIFE-026

- PASS when: Candidate handle closure state not serialized.

### BKR05-LIFE-027

- PASS when: No Date.now in adoption authority.

### BKR05-LIFE-028

- PASS when: No Math.random in adoption authority.

### BKR05-LIFE-029

- PASS when: No randomUUID in adoption authority.

### BKR05-LIFE-030

- PASS when: No resource double destroy.

### BKR05-RECEIPT-001

- PASS when: Composite final receipt schema exact.

### BKR05-RECEIPT-002

- PASS when: Composite receipt includes lowpass digest.

### BKR05-RECEIPT-003

- PASS when: Composite receipt includes adoption digest.

### BKR05-RECEIPT-004

- PASS when: Composite receipt includes graph recording digest.

### BKR05-RECEIPT-005

- PASS when: Composite receipt includes tensor producer digest.

### BKR05-RECEIPT-006

- PASS when: Composite receipt includes effect dispatch digest.

### BKR05-RECEIPT-007

- PASS when: Composite receipt includes formula receipt digest.

### BKR05-RECEIPT-008

- PASS when: Composite receipt includes phase receipt digest.

### BKR05-RECEIPT-009

- PASS when: Composite receipt includes lambda2 receipt digest.

### BKR05-RECEIPT-010

- PASS when: Composite receipt includes pipeline set identity.

### BKR05-RECEIPT-011

- PASS when: Composite receipt includes actual identity digest.

### BKR05-RECEIPT-012

- PASS when: Composite receipt includes submit receipt.

### BKR05-RECEIPT-013

- PASS when: Composite receipt encoder count 1.

### BKR05-RECEIPT-014

- PASS when: Composite receipt submit count 1.

### BKR05-RECEIPT-015

- PASS when: Composite receipt readback count 0.

### BKR05-RECEIPT-016

- PASS when: Composite receipt final claim true.

### BKR05-RECEIPT-017

- PASS when: Identity path null effect fields canonicalized.

### BKR05-RECEIPT-018

- PASS when: Final effect path non-null effect fields.

### BKR05-RECEIPT-019

- PASS when: Composite receipt digest deterministic.

### BKR05-RECEIPT-020

- PASS when: Composite receipt tamper rejected.

### BKR05-RECEIPT-021

- PASS when: Actual identity schema v2.

### BKR05-RECEIPT-022

- PASS when: Actual identity composite kernel ID.

### BKR05-RECEIPT-023

- PASS when: Actual identity ordered kernel graph.

### BKR05-RECEIPT-024

- PASS when: Actual identity shader digest union sorted.

### BKR05-RECEIPT-025

- PASS when: Actual identity graph digest deterministic.

### BKR05-RECEIPT-026

- PASS when: executedKernelId equals composite kernel.

### BKR05-RECEIPT-027

- PASS when: kernelId equals composite kernel.

### BKR05-RECEIPT-028

- PASS when: Base lowpass kernel identity retained separately.

### BKR05-RECEIPT-029

- PASS when: Resample receipt ID uses WGSL05 namespace.

### BKR05-RECEIPT-030

- PASS when: Old lowpass receipt not claimed as final receipt.

### BKR05-SURFACE-001

- PASS when: Canonical executor registers adopted texture.

### BKR05-SURFACE-002

- PASS when: Surface registration count exactly 1.

### BKR05-SURFACE-003

- PASS when: Surface payload object equals adopted texture.

### BKR05-SURFACE-004

- PASS when: Surface dimensions equal final descriptor.

### BKR05-SURFACE-005

- PASS when: Surface format rgba16float.

### BKR05-SURFACE-006

- PASS when: Surface alpha premultiplied.

### BKR05-SURFACE-007

- PASS when: Surface color semantic linear premultiplied.

### BKR05-SURFACE-008

- PASS when: Surface device binding exact.

### BKR05-SURFACE-009

- PASS when: Surface canonicalResampleResult true.

### BKR05-SURFACE-010

- PASS when: Surface canonicalFinalTexture true.

### BKR05-SURFACE-011

- PASS when: Surface final authority evidence exact.

### BKR05-SURFACE-012

- PASS when: Surface final role evidence exact.

### BKR05-SURFACE-013

- PASS when: Surface resample receipt identity exact.

### BKR05-SURFACE-014

- PASS when: Surface adoption digest evidence exact.

### BKR05-SURFACE-015

- PASS when: Surface composite identity digest exact.

### BKR05-SURFACE-016

- PASS when: Surface graph recording digest exact.

### BKR05-SURFACE-017

- PASS when: Surface effect dispatch digest exact.

### BKR05-SURFACE-018

- PASS when: Surface tensor producer digest exact.

### BKR05-SURFACE-019

- PASS when: Surface lambda2 digest exact.

### BKR05-SURFACE-020

- PASS when: Duplicate texture owned registration rejected.

### BKR05-SURFACE-021

- PASS when: Prepare final ownership API exists.

### BKR05-SURFACE-022

- PASS when: Prepare does not mutate record.

### BKR05-SURFACE-023

- PASS when: Prepare validates current owner.

### BKR05-SURFACE-024

- PASS when: Prepare validates ACTIVE state.

### BKR05-SURFACE-025

- PASS when: Prepare validates zero pins and borrows.

### BKR05-SURFACE-026

- PASS when: Commit changes owner to Pipeline.

### BKR05-SURFACE-027

- PASS when: Commit changes allocation class to final.

### BKR05-SURFACE-028

- PASS when: Commit sets revisions.

### BKR05-SURFACE-029

- PASS when: Permit replay rejected.

### BKR05-SURFACE-030

- PASS when: Abort leaves record unchanged.

### BKR05-PIPE-001

- PASS when: Pipeline validates evidence before prepare.

### BKR05-PIPE-002

- PASS when: Pipeline reserves monotonic final revision.

### BKR05-PIPE-003

- PASS when: Pipeline prepares owner adoption.

### BKR05-PIPE-004

- PASS when: Pipeline commits owner adoption.

### BKR05-PIPE-005

- PASS when: Pipeline commits binding after surface commit.

### BKR05-PIPE-006

- PASS when: Previous final invalidated after new commit.

### BKR05-PIPE-007

- PASS when: Publication uses adopted surface ID.

### BKR05-PIPE-008

- PASS when: Publication uses WGSL05 receipt ID.

### BKR05-PIPE-009

- PASS when: Publication uses WGSL05 receipt digest.

### BKR05-PIPE-010

- PASS when: Publication pipeline receipt composite.

### BKR05-PIPE-011

- PASS when: Publication rollback preserves prior binding.

### BKR05-PIPE-012

- PASS when: Publication failure invalidates new surface.

### BKR05-PIPE-013

- PASS when: Listener failure isolated after commit.

### BKR05-PIPE-014

- PASS when: Current publication returns effect final tuple.

### BKR05-PIPE-015

- PASS when: requireFinal returns effect final tuple.

### BKR05-PIPE-016

- PASS when: Device loss revokes effect final binding.

### BKR05-PIPE-017

- PASS when: Surface owner mismatch stable error.

### BKR05-PIPE-018

- PASS when: Stale source revision rejected.

### BKR05-PIPE-019

- PASS when: Receipt mismatch rejected.

### BKR05-PIPE-020

- PASS when: Missing final evidence rejected.

### BKR05-PIPE-021

- PASS when: Legacy bridge canonical re-entry rejected.

### BKR05-PIPE-022

- PASS when: Legacy bridge duplicate texture ownership rejected.

### BKR05-PIPE-023

- PASS when: Canonical broker direct path bypasses bridge.

### BKR05-PIPE-024

- PASS when: Pipeline evidence reports final authority.

### BKR05-PIPE-025

- PASS when: Pipeline evidence reports final role.

### BKR05-PIPE-026

- PASS when: Pipeline evidence reports adoption digest.

### BKR05-PIPE-027

- PASS when: Pipeline evidence reports composite identity digest.

### BKR05-PIPE-028

- PASS when: Surface owner generation increments.

### BKR05-PIPE-029

- PASS when: Final revision increments exactly once.

### BKR05-PIPE-030

- PASS when: No dual current final binding.

### BKR05-CONSUME-001

- PASS when: Preview pins adopted final surface.

### BKR05-CONSUME-002

- PASS when: Preview surface tuple validates.

### BKR05-CONSUME-003

- PASS when: Preview final dimensions match descriptor.

### BKR05-CONSUME-004

- PASS when: Preview GPU texture direct path used.

### BKR05-CONSUME-005

- PASS when: Preview readback remains zero.

### BKR05-CONSUME-006

- PASS when: Export pins same surface ID.

### BKR05-CONSUME-007

- PASS when: Export surface tuple validates.

### BKR05-CONSUME-008

- PASS when: Export dimensions match descriptor.

### BKR05-CONSUME-009

- PASS when: Export uses same GPU payload object.

### BKR05-CONSUME-010

- PASS when: Export does not use preview canvas.

### BKR05-CONSUME-011

- PASS when: Preview receipt uses WGSL05 resample digest.

### BKR05-CONSUME-012

- PASS when: Export receipt uses WGSL05 resample digest.

### BKR05-CONSUME-013

- PASS when: Consumption ledger preview tuple recorded.

### BKR05-CONSUME-014

- PASS when: Consumption ledger export tuple recorded.

### BKR05-CONSUME-015

- PASS when: Consumption ledger state MATCHED.

### BKR05-CONSUME-016

- PASS when: Shared tuple digest equal.

### BKR05-CONSUME-017

- PASS when: Different surface ID mismatch rejected.

### BKR05-CONSUME-018

- PASS when: Different final revision mismatch rejected.

### BKR05-CONSUME-019

- PASS when: Different receipt digest mismatch rejected.

### BKR05-CONSUME-020

- PASS when: Stale publication mismatch rejected.

### BKR05-CONSUME-021

- PASS when: Disposed surface pin rejected.

### BKR05-CONSUME-022

- PASS when: Device-lost surface pin rejected.

### BKR05-CONSUME-023

- PASS when: Superseded final surface invalidated.

### BKR05-CONSUME-024

- PASS when: Previous pins delay physical disposal.

### BKR05-CONSUME-025

- PASS when: New final remains ACTIVE or PINNED.

### BKR05-CONSUME-026

- PASS when: Preview and export finalRole evidence visible.

### BKR05-CONSUME-027

- PASS when: Preview and export composite identity evidence visible.

### BKR05-CONSUME-028

- PASS when: No WebGL FBO final source.

### BKR05-CONSUME-029

- PASS when: No CPU RGBA mirror required.

### BKR05-CONSUME-030

- PASS when: No compatibility bytes publication.

### BKR05-REGR-001

- PASS when: WGSL04 source gate passes.

### BKR05-REGR-002

- PASS when: WGSL03 source gate passes.

### BKR05-REGR-003

- PASS when: WGSL02 source gate passes.

### BKR05-REGR-004

- PASS when: WGSL01 source gate passes.

### BKR05-REGR-005

- PASS when: R2-R3 registry source gate passes.

### BKR05-REGR-006

- PASS when: R9A command graph source gate passes.

### BKR05-REGR-007

- PASS when: Active graph source closure passes.

### BKR05-REGR-008

- PASS when: JavaScript parse closure passes.

### BKR05-REGR-009

- PASS when: TypeScript syntax closure passes.

### BKR05-REGR-010

- PASS when: Generated WGSL unchanged.

### BKR05-REGR-011

- PASS when: No new shader pass added.

### BKR05-REGR-012

- PASS when: Pass count delta remains 7.

### BKR05-REGR-013

- PASS when: Uniform allocation delta remains 2.

### BKR05-REGR-014

- PASS when: Recorder submit count remains 0.

### BKR05-REGR-015

- PASS when: R9A submit count remains 1.

### BKR05-REGR-016

- PASS when: Product intermediate readback remains 0.

### BKR05-REGR-017

- PASS when: Validation readback remains sampled-only.

### BKR05-REGR-018

- PASS when: Physical gate pending is not source pass.

### BKR05-REGR-019

- PASS when: Source final receipt includes parent digest.

### BKR05-REGR-020

- PASS when: Changed file manifest complete.

### BKR05-REGR-021

- PASS when: Patch applies to clean parent.

### BKR05-REGR-022

- PASS when: Patch application reruns source gate.

### BKR05-REGR-023

- PASS when: ZIP extraction reruns source gate.

### BKR05-REGR-024

- PASS when: Receipt bytes deterministic across rerun.

### BKR05-REGR-025

- PASS when: Spec digest recorded.

### BKR05-REGR-026

- PASS when: Implementation manifest records no WGSL formula change.

### BKR05-REGR-027

- PASS when: No legacy tensor authority restored.

### BKR05-REGR-028

- PASS when: No runDeltaKCore restored.

### BKR05-REGR-029

- PASS when: No second encoder introduced.

### BKR05-REGR-030

- PASS when: No source fallback publication introduced.

## 28. Physical Qualification Gate

총 Physical Gate: **72**

### BKR05-PHYS-GPU-01

- PASS when: WGSL pipelines compile on physical device.

### BKR05-PHYS-GPU-02

- PASS when: R9A graph creates one command encoder.

### BKR05-PHYS-GPU-03

- PASS when: R9A graph submits one command buffer.

### BKR05-PHYS-GPU-04

- PASS when: R9A queue submit count equals one.

### BKR05-PHYS-GPU-05

- PASS when: Final mode records exactly seven added passes.

### BKR05-PHYS-GPU-06

- PASS when: No WebGPU validation error.

### BKR05-PHYS-GPU-07

- PASS when: No uncaptured GPU error.

### BKR05-PHYS-GPU-08

- PASS when: Submission completion resolves.

### BKR05-PHYS-PIXEL-01

- PASS when: Adopted texture pixel hash differs from base when effect active.

### BKR05-PHYS-PIXEL-02

- PASS when: Adopted texture equals WGSL-04 candidate readback.

### BKR05-PHYS-PIXEL-03

- PASS when: Base EWA readback remains valid until submission completion.

### BKR05-PHYS-PIXEL-04

- PASS when: Alpha channel preserved within tolerance.

### BKR05-PHYS-PIXEL-05

- PASS when: All output channels finite.

### BKR05-PHYS-PIXEL-06

- PASS when: Zero-alpha hidden RGB policy preserved.

### BKR05-PHYS-PIXEL-07

- PASS when: Final dimensions exact.

### BKR05-PHYS-PIXEL-08

- PASS when: Final format rgba16float.

### BKR05-PHYS-LIFE-01

- PASS when: Candidate survives submission completion.

### BKR05-PHYS-LIFE-02

- PASS when: Superseded owned base is destroyed after completion.

### BKR05-PHYS-LIFE-03

- PASS when: Caller-owned source is not destroyed.

### BKR05-PHYS-LIFE-04

- PASS when: Final surface destroy occurs exactly once.

### BKR05-PHYS-LIFE-05

- PASS when: Shadow candidate destroyed after completion.

### BKR05-PHYS-LIFE-06

- PASS when: Failed adoption leaves base usable.

### BKR05-PHYS-LIFE-07

- PASS when: Submit failure destroys candidate.

### BKR05-PHYS-LIFE-08

- PASS when: Device loss releases adopted texture.

### BKR05-PHYS-RECEIPT-01

- PASS when: Physical final texture hash binds adoption receipt.

### BKR05-PHYS-RECEIPT-02

- PASS when: Composite receipt replay verifies.

### BKR05-PHYS-RECEIPT-03

- PASS when: Command graph submit receipt matches observation.

### BKR05-PHYS-RECEIPT-04

- PASS when: Effect dispatch receipt matches observed dispatch.

### BKR05-PHYS-RECEIPT-05

- PASS when: Tensor producer receipt matches observed six passes.

### BKR05-PHYS-RECEIPT-06

- PASS when: Lambda2 receipt matches physical device.

### BKR05-PHYS-RECEIPT-07

- PASS when: Actual identity digest replays independently.

### BKR05-PHYS-RECEIPT-08

- PASS when: Tampered physical receipt fails.

### BKR05-PHYS-SURFACE-01

- PASS when: Adopted texture registered once.

### BKR05-PHYS-SURFACE-02

- PASS when: Surface GPU byte ledger increases by exact final bytes.

### BKR05-PHYS-SURFACE-03

- PASS when: Base transient bytes retire after completion.

### BKR05-PHYS-SURFACE-04

- PASS when: Final owner adoption commits.

### BKR05-PHYS-SURFACE-05

- PASS when: Owner permit replay fails.

### BKR05-PHYS-SURFACE-06

- PASS when: Pipeline publish succeeds.

### BKR05-PHYS-SURFACE-07

- PASS when: Publication failure rollback leaves no leak.

### BKR05-PHYS-SURFACE-08

- PASS when: Device epoch invalidation aborts pin.

### BKR05-PHYS-PREVIEW-01

- PASS when: Preview displays adopted effect output.

### BKR05-PHYS-PREVIEW-02

- PASS when: Preview does not display base EWA in final mode.

### BKR05-PHYS-PREVIEW-03

- PASS when: Preview frame receipt uses effect final revision.

### BKR05-PHYS-PREVIEW-04

- PASS when: Preview visible canvas readback count zero.

### BKR05-PHYS-PREVIEW-05

- PASS when: Superseded frame does not resurrect base texture.

### BKR05-PHYS-PREVIEW-06

- PASS when: Preview device-loss terminal rejection works.

### BKR05-PHYS-PREVIEW-07

- PASS when: Preview after rebuild consumes new effect surface.

### BKR05-PHYS-PREVIEW-08

- PASS when: Preview presentation dimensions exact.

### BKR05-PHYS-EXPORT-01

- PASS when: Export encoder consumes adopted effect texture.

### BKR05-PHYS-EXPORT-02

- PASS when: Export output pixels match adopted surface within encoder tolerance.

### BKR05-PHYS-EXPORT-03

- PASS when: Export does not consume preview canvas.

### BKR05-PHYS-EXPORT-04

- PASS when: Export shared tuple equals preview tuple.

### BKR05-PHYS-EXPORT-05

- PASS when: Export host save starts only after terminal map.

### BKR05-PHYS-EXPORT-06

- PASS when: Export device-loss terminal rejection works.

### BKR05-PHYS-EXPORT-07

- PASS when: Export after rebuild consumes new effect surface.

### BKR05-PHYS-EXPORT-08

- PASS when: Export dimensions exact.

### BKR05-PHYS-PARITY-01

- PASS when: Preview and export tuple state MATCHED.

### BKR05-PHYS-PARITY-02

- PASS when: Preview and export resample receipt digest equal.

### BKR05-PHYS-PARITY-03

- PASS when: Preview and export final role equal.

### BKR05-PHYS-PARITY-04

- PASS when: Preview and export composite identity equal.

### BKR05-PHYS-PARITY-05

- PASS when: Physical surface registry owned record count one.

### BKR05-PHYS-PARITY-06

- PASS when: No duplicate GPU texture ownership.

### BKR05-PHYS-PARITY-07

- PASS when: No legacy bridge promotion in canonical path.

### BKR05-PHYS-PARITY-08

- PASS when: No CPU full-frame compatibility mirror.

### BKR05-PHYS-PERF-01

- PASS when: Peak GPU residency stays within base plus terminal R1C plus one candidate envelope.

### BKR05-PHYS-PERF-02

- PASS when: No per-operation lambda2 readback.

### BKR05-PHYS-PERF-03

- PASS when: No additional submit from adoption.

### BKR05-PHYS-PERF-04

- PASS when: Adoption CPU time below fixed budget.

### BKR05-PHYS-PERF-05

- PASS when: Surface promotion performs no GPU copy.

### BKR05-PHYS-PERF-06

- PASS when: No staging buffer created for promotion.

### BKR05-PHYS-PERF-07

- PASS when: Three repeated runs have stable resource plateau.

### BKR05-PHYS-PERF-08

- PASS when: Three repeated runs have deterministic final digest.

## 29. Negative-control mutants

총 mutant: **64**

### BKR05-MUT-ADOPT-01

- Mutant: Return base texture in CANONICAL_FINAL.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-ADOPT-02

- Mutant: Adopt candidate twice.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-ADOPT-03

- Mutant: Release candidate before adoption.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-ADOPT-04

- Mutant: Release adopted candidate.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-ADOPT-05

- Mutant: Select final after graph submit.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-ADOPT-06

- Mutant: Allow final mode without publication flag.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-ADOPT-07

- Mutant: Honor caller retainCandidate in final mode.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-ADOPT-08

- Mutant: Accept stale candidate epoch.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-LIFE-01

- Mutant: Destroy base before submit.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-LIFE-02

- Mutant: Destroy caller-owned source.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-LIFE-03

- Mutant: Keep owned base alive after completion.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-LIFE-04

- Mutant: Track adopted final as transient.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-LIFE-05

- Mutant: Expose base destroy as destroyTerminal.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-LIFE-06

- Mutant: Double destroy final texture.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-LIFE-07

- Mutant: Leak candidate on submit failure.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-LIFE-08

- Mutant: Leak base on adoption rollback.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-RECEIPT-01

- Mutant: Bind composite receipt to base texture.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-RECEIPT-02

- Mutant: Omit effect dispatch digest.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-RECEIPT-03

- Mutant: Omit tensor producer digest.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-RECEIPT-04

- Mutant: Omit lambda2 digest.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-RECEIPT-05

- Mutant: Use lowpass receipt as final receipt.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-RECEIPT-06

- Mutant: Keep executedKernelId as EWA kernel.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-RECEIPT-07

- Mutant: Unsorted shader digest set.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-RECEIPT-08

- Mutant: Accept tampered adoption receipt.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-SURFACE-01

- Mutant: Register base EWA instead of adopted texture.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-SURFACE-02

- Mutant: Register adopted texture twice.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-SURFACE-03

- Mutant: Omit canonicalFinalTexture evidence.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-SURFACE-04

- Mutant: Use wrong surface dimensions.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-SURFACE-05

- Mutant: Use wrong device binding.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-SURFACE-06

- Mutant: Skip owner adoption.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-SURFACE-07

- Mutant: Replay ownership permit.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-SURFACE-08

- Mutant: Allow owner adoption while pinned.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-PIPE-01

- Mutant: Publish before owner adoption.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-PIPE-02

- Mutant: Mutate binding before evidence validation.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-PIPE-03

- Mutant: Increment final revision twice.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-PIPE-04

- Mutant: Invalidate previous final before new commit.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-PIPE-05

- Mutant: Lose previous binding on rollback.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-PIPE-06

- Mutant: Accept stale source revision.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-PIPE-07

- Mutant: Accept receipt mismatch.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-PIPE-08

- Mutant: Allow two current final bindings.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-CONSUME-01

- Mutant: Preview pin base surface.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-CONSUME-02

- Mutant: Export pin base surface.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-CONSUME-03

- Mutant: Preview and export use different receipt digest.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-CONSUME-04

- Mutant: Preview and export use different surface ID.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-CONSUME-05

- Mutant: Export from preview canvas.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-CONSUME-06

- Mutant: Create CPU RGBA mirror for preview.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-CONSUME-07

- Mutant: Publish compatibility bytes.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-CONSUME-08

- Mutant: Re-enter legacy bridge for canonical texture.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-GRAPH-01

- Mutant: Create second encoder during adoption.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-GRAPH-02

- Mutant: Call queue.submit during adoption.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-GRAPH-03

- Mutant: Add an extra compute pass.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-GRAPH-04

- Mutant: Create promotion staging buffer.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-GRAPH-05

- Mutant: Map candidate texture intermediate.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-GRAPH-06

- Mutant: Run lambda2 probe per operation.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-GRAPH-07

- Mutant: Restore runDeltaKCore hook.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-GRAPH-08

- Mutant: Change WGSL formula bytes.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-EPOCH-01

- Mutant: Publish lost-device candidate.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-EPOCH-02

- Mutant: Keep final binding after device loss.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-EPOCH-03

- Mutant: Reuse old candidate after rebuild.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-EPOCH-04

- Mutant: Register surface with wrong runtime epoch.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-EPOCH-05

- Mutant: Commit ownership permit after epoch change.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-EPOCH-06

- Mutant: Preview pin aborted surface.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-EPOCH-07

- Mutant: Export pin aborted surface.
- Expected: Source or physical gate FAIL.

### BKR05-MUT-EPOCH-08

- Mutant: Skip physical disposer on device loss.
- Expected: Source or physical gate FAIL.

## 30. 완료 상태

```text
SOURCE_BAKED_AWAITING_PHYSICAL_GPU
PHYSICAL_CANONICAL_FINAL_TEXTURE_PASS
FAIL
```

`PHYSICAL_CANONICAL_FINAL_TEXTURE_PASS`는 다음이 모두 물리적으로 확인된 경우에만 발급한다.

- CANONICAL_FINAL mode의 returned texture가 effect output임
- one encoder and one submit
- zero intermediate readback
- Surface Registry owned record exactly one
- Pipeline Final Surface가 adopted texture를 가리킴
- Preview와 Export shared tuple MATCHED
- base EWA final authority가 남아 있지 않음
- device loss and rebuild 이후 stale reuse가 없음

## 31. 다음 경계

WGSL-06은 Final Texture adoption 이후 입력 field를 제품 경로에서 자동으로 공급한다.

```text
TDT-BAKEMONO-RINNE-WGSL-06

Canonical QMap and Scalar Field Binding /
QWave Real DeltaK Profile Selection /
Alpha-Depth Derivation /
Highlight and Edge Input Derivation /
Resolution and Epoch Exact Match /
No Caller-Fabricated Field Descriptor Seal
```

WGSL-05에서는 direct admitted input descriptor가 이미 존재한다고 가정한다. 필드 생성과 파생을 이 패치에 섞지 않는다.

