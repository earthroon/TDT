# TDT-BAKEMONO-RINNE-WGSL-04

Canonical Pipeline Family Registration /
R9A Command-Graph Native Effect Recording /
Terminal Tensor Lifetime Binding /
QMap·Scalar Field Direct Binding /
Uniform Ring Allocation /
No Post-Submit Hook /
Single Encoder·Single Submit /
Zero Intermediate Readback Seal

- Patch ID: `TDT-BAKEMONO-RINNE-WGSL-04`
- Spec schema: `tdt.effect.bakemono-rinne.wgsl04.spec.v1`
- Parent source bundle: `67_TDT_BAKEMONO_RINNE_WGSL_03_TERMINAL_R1C_LAMBDA2_CANONICAL_SHADOW_SOURCE_BAKED_AWAITING_PHYSICAL_GPU.zip`
- Parent patch: `TDT-BAKEMONO-RINNE-WGSL-03`
- Target runtime: R9A canonical EWA command graph
- Target output authority in this patch: `R9A_GRAPH_CANDIDATE_SHADOW_ONLY`
- Canonical Final Texture claim in this patch: `false`
- Preview publication claim in this patch: `false`
- Export publication claim in this patch: `false`

---

## 0. 목적

이 패치는 WGSL-03에서 만든 Terminal Integrated R1C producer와 R1C-gated Bakemono·Rinne compute kernel을 별도 shadow encoder에서 꺼내, 기존 R9A canonical EWA command graph 내부에 기록한다.

핵심 목표는 다음 한 줄이다.

```text
R9A Final EWA record
  -> Final EWA lowpass receipt 확정
  -> terminal-resolution integrated R1C 6-pass record
  -> admitted R1C-gated Bakemono/Rinne 1-pass record
  -> R9A graph.submit() 1회
```

이 패치에서 효과 output은 R9A graph 안에서 실제 생성되지만, 아직 canonical `terminalTexture`로 승격하지 않는다. 최종 texture authority 교체는 WGSL-05의 책임이다.

---

## 1. 현재 구현에서 확인된 결선 문제

### 1.1 WGSL-03 recorder가 R9A graph-native recorder가 아님

현재 `recordTerminalIntegratedR1CWgsl03()`은 다음 형태를 요구한다.

```js
const encoder = recordTarget.encoder;
encoder.beginComputePass(...);
```

현재 `recordBakemonoRinneCanonicalPassWgsl03()`도 raw `GPUCommandEncoder`를 직접 받는다.

이 방식은 R9A graph의 다음 권위를 우회한다.

- semantic pass counting
- timestamp pass labels
- uniform ring allocation
- transient ownership ledger
- submitted-state rejection
- graph receipt lineage

WGSL-04에서는 raw encoder가 public recorder 인자로 노출되지 않는다.

### 1.2 독립 uniform buffer 생성

WGSL-03 terminal tensor와 effect recorder는 각각 operation마다 `GPUBuffer`를 만들고 `device.queue.writeBuffer()`를 호출한다.

```text
terminal tensor params buffer
canonical effect params buffer
```

R9A는 이미 submission-scoped uniform ring을 소유한다. WGSL-04에서는 두 recorder 모두 `graph.allocateUniform()`만 사용한다.

### 1.3 별도 shadow runtime이 두 번째 encoder와 submit을 생성

현재 isolated shadow runtime은 다음을 수행한다.

```text
device.createCommandEncoder()
record effect
queue.submit()
```

이 entry는 qualification harness에는 남을 수 있지만 R9A product import graph에 들어오면 안 된다.

### 1.4 pipeline compilation이 operation request에 종속됨

현재 WGSL-03 pipeline compilation 함수는 texture admission token과 operation formula receipt를 먼저 요구한다. 이 구조는 R2-R3 canonical pipeline registry의 eager rebuild와 맞지 않는다.

Pipeline binary identity는 다음에 귀속되어야 한다.

```text
shader bytes
+ ABI
+ bind group layout
+ device epoch / identity
```

개별 operation formula receipt는 dispatch admission과 receipt lineage에 귀속되어야 하며 pipeline build key가 되어서는 안 된다.

### 1.5 canonical pipeline registry가 3-family 상태

현재 registry completeness는 다음 세 family만 요구한다.

```text
EWA
Tensor R1C
Adaptive Policy R1D
```

WGSL-04에서는 다음 네 번째 family를 필수 구성으로 승격한다.

```text
Bakemono/Rinne R1C-gated WGSL command-graph family
```

### 1.6 post-submit `runDeltaKCore` 훅

현재 preview facade는 R9A가 이미 submit한 뒤 `runDeltaKCore()`를 호출할 수 있다.

이 훅은 다음 문제를 가진다.

- second encoder 유도
- second submit 유도
- canonical terminal R1C lifetime 밖에서 실행
- effect 반환값 무시
- 원래 EWA terminal texture 반환

WGSL-04에서는 이 훅을 실행하지 않는다. 전달되면 fail-closed 한다.

### 1.7 private capability가 비결정적 entropy를 사용함

WGSL-03 terminal tensor private probe capability는 `randomUUID`, `Date.now`, `Math.random`을 사용한다.

Capability는 직렬화하거나 해시할 값이 아니다. 객체 identity만으로 충분하다.

WGSL-04에서는 다음으로 교체한다.

```js
const probeCapability = Object.freeze(Object.create(null));
```

내부 clock, UUID, random source를 사용하지 않는다.

---

## 2. 범위

### 2.1 포함

- Bakemono/Rinne WGSL family의 canonical registry 등록
- pipeline family count `3 -> 4`
- registry eager build와 device epoch binding
- WGSL-03 shader와 ABI의 graph-native pipeline family 재사용
- Final EWA terminal descriptor 생성
- device-scoped lambda2 qualification receipt 조회
- terminal R1C 6-pass의 R9A graph-native 기록
- R1C admission token의 내부 생성
- Bakemono/Rinne canonical effect 1-pass의 R9A graph-native 기록
- tensor/effect uniform의 R9A uniform ring allocation
- output candidate handle과 graph recording receipt 생성
- candidate texture lifetime과 release contract
- post-submit hook 거절
- standard owned graph에서 one encoder / one submit 보존
- borrowed graph에서 nested submit 0회 보존
- product image readback 0회 보존

### 2.2 제외

- effect output을 canonical `terminalTexture`로 승격
- original EWA terminal texture의 final authority 박탈
- Surface Registry publish
- PreviewPresenter publish
- ExportAuthority publish
- Q-wave DeltaK 자동 연결
- alpha-depth 자동 파생
- highlight 자동 파생
- legacy mask retirement
- WebGL fallback retirement
- terminal R1C texture pooling 최적화
- device fleet physical matrix

이 제외 항목은 WGSL-05 이후의 책임이다.

---

## 3. SSOT와 상태 귀속

### 3.1 SSOT 표

| 상태 | SSOT |
|---|---|
| GPU device epoch | GPU Device Authority |
| pipeline family set | Canonical Pipeline Registry R2-R3 extended by WGSL-04 |
| command encoder | R9A Command Graph |
| queue submit | R9A Command Graph owner |
| uniform allocation | R9A submission-scoped uniform ring |
| Final EWA texture | R9A lowpass runtime |
| Terminal R1C field | WGSL-04 graph-native terminal tensor producer |
| Lambda2 qualification | device-scoped qualification authority |
| effect formula | WGSL-01 formula contract |
| effect shader and ABI | WGSL-03 generated shader and canonical ABI |
| effect candidate | WGSL-04 candidate handle |
| final published texture | 아직 기존 EWA terminal, WGSL-05 전까지 유지 |

### 3.2 재현성

동일한 다음 입력은 동일한 pass graph와 parameter digest를 생성해야 한다.

```text
pipeline set identity
+ lowpass plan digest
+ Final EWA receipt digest
+ exact input descriptor set
+ formula contract receipt digest
+ phase receipt digest
+ tensor parameter digest
+ effect parameter digest
```

내부 capability object identity는 digest에 포함하지 않는다.

---

## 4. Target graph

### 4.1 Standard owned graph

```text
createEwaCommandGraphR9A()
  |
  +-- source prepare, optional
  |
  +-- stage 0 tensor / policy / EWA
  +-- stage 1 tensor / policy / EWA
  +-- ...
  +-- final EWA stage
  |
  +-- finalize lowpass receipt
  |
  +-- create FINAL_EWA_TERMINAL descriptor
  |
  +-- terminal R1C gradient
  +-- terminal R1C outer
  +-- terminal R1C blurH
  +-- terminal R1C blurV
  +-- terminal R1C eigen
  +-- terminal R1C axial
  |
  +-- R1C-gated Bakemono/Rinne canonical pass
  |
  +-- graph.submit()
        commandEncoderCount = 1
        commandBufferCount = 1
        queueSubmitCount = 1
```

### 4.2 Borrowed graph

```text
outer canonical graph owner
  -> executeCanonicalEwaLowpassR9A({ commandGraph })
       -> EWA + terminal R1C + effect record only
       -> local submit count = 0
  -> outer graph owner submits once
```

Nested submit은 금지한다.

### 4.3 Pass delta

Effect active mode는 lowpass-only graph에 정확히 7개 compute pass를 추가한다.

```text
Terminal R1C = 6
Canonical effect = 1
Total delta = 7
```

Lambda2 probe는 product operation graph에 기록하지 않는다.

---

## 5. Canonical identities

```ts
export const BKR04_PATCH_ID = 'TDT-BAKEMONO-RINNE-WGSL-04' as const;

export const BKR04_GRAPH_INTEGRATION_ID =
  'tdt.effect.bakemono-rinne.r9a-command-graph-integration.wgsl04.v1' as const;

export const BKR04_PIPELINE_FAMILY_ID =
  'tdt.pipeline.bakemono-rinne.r1c-gated-command-graph.wgsl04.v1' as const;

export const BKR04_OWNER_ID =
  'dadum.gpu.consumer.bakemono-rinne-wgsl-04-command-graph' as const;

export const BKR04_CANDIDATE_AUTHORITY =
  'R9A_GRAPH_CANDIDATE_SHADOW_ONLY' as const;

export const BKR04_RECORDING_RECEIPT_SCHEMA_ID =
  'tdt.effect.bakemono-rinne.r9a-recording-receipt.wgsl04.v1' as const;

export const BKR04_SUBMISSION_CLOSURE_SCHEMA_ID =
  'tdt.effect.bakemono-rinne.r9a-submission-closure-receipt.wgsl04.v1' as const;
```

### 5.1 Reused identities

WGSL-04는 수식이나 shader body를 변경하지 않는다.

다음 WGSL-03 identity를 재사용한다.

- `BKR03_KERNEL_ID`
- `BKR03_KERNEL_ABI_ID`
- `BKR03_BIND_GROUP_LAYOUT_CANONICAL`
- `BKR03_UNIFORM_BYTES`
- `BKR03_STRUCTURE_GATE_ID`
- generated WGSL digest
- canonical delta digest

Pipeline family identity와 execution ownership만 WGSL-04 identity로 새로 만든다.

---

## 6. GPU consumer manifest

다음 consumer를 추가한다.

```json
{
  "ownerId": "dadum.gpu.consumer.bakemono-rinne-wgsl-04-command-graph",
  "purpose": "r9a-native-terminal-r1c-bakemono-rinne-recording"
}
```

WGSL-03 shadow owner는 qualification harness용으로 유지한다.

```text
dadum.gpu.consumer.bakemono-rinne-wgsl-03-shadow
```

Product graph는 shadow owner를 사용하지 않는다.

---

## 7. Pipeline family registration

### 7.1 새 family contract

```ts
export interface BakemonoRinneCommandGraphPipelineFamilyWgsl04 {
  schemaVersion: 1;
  schemaId: 'tdt.pipeline.bakemono-rinne.command-graph-family.wgsl04.v1';
  ownerId: typeof BKR04_OWNER_ID;
  pipelineFamilyId: typeof BKR04_PIPELINE_FAMILY_ID;

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;

  kernelId: typeof BKR03_KERNEL_ID;
  kernelAbiId: typeof BKR03_KERNEL_ABI_ID;
  generatedWgslDigest: string;
  generatorManifestDigest: string;
  bindGroupLayoutDigest: string;
  uniformAbiDigest: string;
  canonicalDeltaDigest: string;
  structureGateSourceDigest: string;

  pipelineIdentity: string;
  pipeline: GPUComputePipeline;
  bindGroupLayout: GPUBindGroupLayout;

  readonly disposed: boolean;
  dispose(): void;
}
```

### 7.2 Build key

Pipeline build key는 operation receipt에 종속되지 않는다.

```text
runtimeEpoch
+ deviceEpoch
+ deviceIdentity
+ kernel ID
+ kernel ABI ID
+ generated WGSL digest
+ bind group layout digest
+ uniform ABI digest
```

Formula contract receipt digest와 phase receipt digest는 dispatch receipt에 기록한다.

### 7.3 Eager build

`createDeltaKStack()`은 네 family를 병렬 빌드한다.

```js
const [
  pipeEWA,
  tensorR1C,
  adaptivePolicyR1D,
  bakemonoRinneWgsl04,
] = await Promise.all([
  createEWAAnisoPipeline(device),
  createStructureTensorR1CPipeline(device),
  createAdaptivePolicyR1DPipeline(device),
  createBakemonoRinneCommandGraphPipelineFamilyWgsl04(device),
]);
```

### 7.4 Bundle attachment

```js
pipeEWA.tensorR1C = tensorR1C;
pipeEWA.adaptivePolicyR1D = adaptivePolicyR1D;
pipeEWA.bakemonoRinneWgsl04 = bakemonoRinneWgsl04;
```

### 7.5 Disposal

```text
pipeEWA.dispose()
  -> bakemonoRinneWgsl04.dispose()
  -> adaptivePolicyR1D.dispose()
  -> tensorR1C.dispose()
  -> EWA dispose
```

각 family dispose는 idempotent여야 한다.

### 7.6 Registry completeness

기존:

```text
pipelineFamilyCount = 3
```

변경:

```text
pipelineFamilyCount = 4
```

필수 family:

```text
EWA
Tensor R1C
Adaptive Policy R1D
Bakemono/Rinne WGSL-04
```

하나라도 없거나 disposed면 registry ACTIVE commit을 거절한다.

### 7.7 Pipeline set identity extension

```ts
interface BakemonoRinnePipelineIdentityWgsl04 {
  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  ownerId: typeof BKR04_OWNER_ID;
  pipelineFamilyId: typeof BKR04_PIPELINE_FAMILY_ID;
  kernelId: typeof BKR03_KERNEL_ID;
  kernelAbiId: typeof BKR03_KERNEL_ABI_ID;
  generatedWgslDigest: string;
  generatorManifestDigest: string;
  bindGroupLayoutDigest: string;
  uniformAbiDigest: string;
  canonicalDeltaDigest: string;
  structureGateSourceDigest: string;
  pipelineIdentity: string;
}
```

Canonical pipeline set digest는 네 family 전체를 포함해 다시 계산한다.

---

## 8. Effect mode contract

### 8.1 Modes

```ts
type BakemonoRinneGraphModeWgsl04 =
  | 'DISABLED'
  | 'CANONICAL_SHADOW';
```

기본값은 `DISABLED`다.

### 8.2 Active mode purpose

```ts
type BakemonoRinneGraphPurposeWgsl04 =
  | 'QUALIFICATION_GRAPH_SHADOW'
  | 'DIAGNOSTIC_GRAPH_SHADOW';
```

Product final authority purpose는 아직 허용하지 않는다.

### 8.3 Request envelope

```ts
export interface BakemonoRinneGraphRequestWgsl04 {
  mode: BakemonoRinneGraphModeWgsl04;
  purpose?: BakemonoRinneGraphPurposeWgsl04;
  operationId: string;

  formulaContractReceipt: BakemonoRinneFormulaContractReceipt;
  phaseReceipt: BakemonoRinnePhaseReceipt & { receiptDigest: string };

  qmap: BakemonoRinneTextureDescriptor;
  scalar: BakemonoRinneTextureDescriptor;
  alphaDepth: BakemonoRinneTextureDescriptor;
  highlight: BakemonoRinneTextureDescriptor;
  maskEdge: BakemonoRinneTextureDescriptor;

  power: number;
  neonBoost: number;
  coherenceExponent: number;
  alphaEpsilon: number;

  tensorParameters: {
    tensorSigma: number;
    maxAnisotropy: number;
    minorCoverageFactor: number;
    coherenceExponent: number;
    sourceDomain: 'declared-linear';
  };

  retainCandidate?: boolean;
}
```

### 8.4 Base texture ownership

`base`는 caller request에서 받지 않는다.

R9A가 방금 만든 Final EWA terminal descriptor에서 내부 생성한다.

```text
caller supplied arbitrary base texture = denied
```

### 8.5 Direct input binding only

WGSL-04는 input bridge를 만들지 않는다.

다섯 입력 texture는 다음 조건을 만족해야 한다.

- exact output width and height
- current runtime epoch and device epoch
- current device identity
- declared semantic ID
- declared content receipt or content digest
- no alias with output
- no alias with terminal R1C field

Q-map resampling, scalar field generation, mask derivation은 WGSL-06 책임이다.

### 8.6 Missing input

Active mode에서 required input이 하나라도 없으면 fail-closed 한다.

Implicit zero texture를 만들지 않는다.

---

## 9. Lambda2 qualification resolution

### 9.1 Arbitrary receipt injection 금지

WGSL-03 isolated API는 request에서 qualification receipt를 직접 받았다.

R9A native path에서는 caller가 receipt object를 직접 주입하지 않는다.

### 9.2 Resolver contract

```ts
export interface BakemonoRinneLambda2QualificationResolverWgsl04 {
  resolve(input: {
    shaderSetDigest: string;
    tensorParameterDigest: string;
    tensorPipelineIdentity: string;
    adapterIdentity: string;
    deviceIdentity: string;
    fixtureCorpusDigest: string;
  }): Promise<BakemonoRinneLambda2QualificationReceiptWgsl03>;
}
```

### 9.3 Exact match

다음 필드가 exact match여야 한다.

- `status === PHYSICAL_PASS`
- `physicalExecution === true`
- `pass === true`
- shader set digest
- tensor parameter digest
- pipeline identity
- adapter identity
- device identity
- fixture corpus digest
- receipt self digest

### 9.4 Product operation readback

Qualification receipt를 찾기 위해 operation graph에서 probe를 실행하지 않는다.

```text
per-operation lambda2 readback = 0
per-operation lambda2 probe dispatch = 0
```

Receipt가 없으면 active effect mode는 HOLD 또는 fail-closed다.

---

## 10. Final EWA descriptor

Lowpass receipt가 확정된 뒤 다음 descriptor를 만든다.

```ts
interface FinalEwaTerminalSurfaceDescriptorWgsl04 {
  schemaId: 'tdt.ewa.terminal-surface-descriptor.wgsl04.v1';
  texture: GPUTexture;
  surfaceId: string;
  surfaceRevision: number;
  lowpassReceiptDigest: string;
  lowpassPlanDigest: string;
  surfaceRole: 'FINAL_EWA_TERMINAL';
  semanticId: 'tdt.surface.canonical.linear-premul.rgba16float.v1';
  width: number;
  height: number;
  format: 'rgba16float';
  transfer: 'linear';
  alphaMode: 'premultiplied';
  coordinateSpace: 'output-pixel';
  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  commandGraphId: string;
}
```

Descriptor texture는 `currentTexture`와 동일 객체여야 한다.

Stage-local source나 retained axial texture를 terminal descriptor로 위장할 수 없다.

---

## 11. Graph-native terminal R1C recorder

### 11.1 API

```ts
recordTerminalIntegratedR1CWgsl04(
  graph: EwaCommandGraphR9A,
  pipelineBundle: StructureTensorR1CPipelineBundle,
  request: TerminalR1CGraphRequestWgsl04,
): Promise<TerminalR1CGraphRecordWgsl04>
```

### 11.2 Graph requirements

Recorder는 다음 API만 사용한다.

```text
graph.beginComputePass()
graph.allocateUniform()
graph.trackTransient()
graph.snapshot()
```

다음 접근은 금지한다.

```text
graph.encoder.beginComputePass()
device.createCommandEncoder()
device.queue.submit()
device.queue.onSubmittedWorkDone()
```

### 11.3 Uniform allocation

```js
const allocation = graph.allocateUniform(packedTensorParams, {
  passId: `${operationId}:terminal-r1c`,
  payloadDigest: tensorParameterDigest,
});
```

Standalone params buffer를 만들지 않는다.

### 11.4 Pass order

```text
gradient
outer
blurH
blurV
eigen
axial
```

순서를 바꾸거나 pass를 생략하면 fail한다.

### 11.5 Output exposure

Public handle은 `fieldTexture`만 노출한다.

Integrated tensor, raw outer product, axial texture는 public request로 이동하지 않는다.

### 11.6 Private capability

```js
const probeCapability = Object.freeze(Object.create(null));
```

다음 사용은 0회여야 한다.

- `crypto.randomUUID`
- `Date.now`
- `performance.now`
- `Math.random`

---

## 12. Graph-native effect recorder

### 12.1 API

```ts
recordBakemonoRinneCanonicalPassWgsl04(
  graph: EwaCommandGraphR9A,
  pipelineFamily: BakemonoRinneCommandGraphPipelineFamilyWgsl04,
  request: BakemonoRinneCanonicalGraphPassRequestWgsl04,
): Promise<BakemonoRinneCanonicalGraphPassRecordWgsl04>
```

### 12.2 Pipeline input

Recorder는 pipeline을 compile하지 않는다.

Registry-issued family만 받는다.

### 12.3 Uniform ring

```js
const allocation = graph.allocateUniform(packedEffectParams, {
  passId: `${operationId}:bakemono-rinne`,
  payloadDigest: parameterDigest,
});
```

### 12.4 Bindings

Canonical 9-binding ABI는 WGSL-03과 동일하다.

| Binding | Resource |
|---:|---|
| 0 | Final EWA base texture |
| 1 | Q-map |
| 2 | scalar field |
| 3 | alpha-depth |
| 4 | highlight |
| 5 | mask edge |
| 6 | admitted terminal R1C field |
| 7 | output `rgba16float` storage texture |
| 8 | R9A uniform ring allocation |

### 12.5 Output

```text
format = rgba16float
semantic content = BKR03 R1C-gated candidate
runtime authority = R9A_GRAPH_CANDIDATE_SHADOW_ONLY
```

### 12.6 No submit

Recorder return receipt의 `queueSubmitCount`는 항상 0이다.

---

## 13. Native integration coordinator

### 13.1 API

```ts
recordBakemonoRinneNativeIntegrationWgsl04(
  graph: EwaCommandGraphR9A,
  input: {
    device: GPUDevice;
    identity: ActiveGpuIdentity;
    pipeBundle: CanonicalPipelineBundleR2R3Wgsl04;
    finalEwaSurface: FinalEwaTerminalSurfaceDescriptorWgsl04;
    effect: BakemonoRinneGraphRequestWgsl04;
    lambda2Resolver: BakemonoRinneLambda2QualificationResolverWgsl04;
  },
): Promise<BakemonoRinneNativeCandidateHandleWgsl04 | null>
```

### 13.2 Disabled mode

`mode === DISABLED`이면 다음이 성립한다.

```text
added pass count = 0
candidate = null
pipeline dispatch count = 0
tensor reconstruction count = 0
```

### 13.3 Active mode sequence

```text
1. assert graph open
2. assert pipeline family current
3. assert Final EWA descriptor
4. validate direct input descriptors
5. resolve exact physical lambda2 qualification receipt
6. record terminal R1C 6 passes
7. issue internal opaque admission token
8. record canonical effect 1 pass
9. release terminal R1C handle into graph transient ledger
10. create candidate handle and recording receipt
```

### 13.4 No exception swallowing

한 단계라도 실패하면 candidate를 반환하지 않는다.

생성된 resources는 graph transient ledger에 귀속시킨다.

---

## 14. Candidate handle

```ts
export interface BakemonoRinneNativeCandidateHandleWgsl04 {
  schemaId: 'tdt.effect.bakemono-rinne.r9a-candidate-handle.wgsl04.v1';
  authority: typeof BKR04_CANDIDATE_AUTHORITY;

  texture: GPUTexture;
  semanticId: typeof BKR03_OUTPUT_SEMANTIC_ID;
  width: number;
  height: number;
  format: 'rgba16float';
  transfer: 'linear';
  alphaMode: 'premultiplied';
  coordinateSpace: 'output-pixel';

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  commandGraphId: string;

  baseLowpassReceiptDigest: string;
  terminalTensorProducerReceiptDigest: string;
  effectDispatchReceiptDigest: string;
  graphRecordingReceiptDigest: string;

  canonicalFinalTextureClaim: false;
  surfaceRegistryPublishCount: 0;
  previewPublishCount: 0;
  exportPublishCount: 0;

  readonly released: boolean;
  release(): void;
}
```

### 14.1 Ownership

- `retainCandidate === true`: caller가 handle을 받고 release한다.
- `retainCandidate !== true`: coordinator가 candidate texture를 graph transient로 등록한다.

Release는 idempotent다.

### 14.2 No publication

Candidate handle을 Surface Registry descriptor로 위장할 수 없다.

WGSL-05 전까지 publish API는 이 authority를 거절한다.

---

## 15. Resource lifetime

### 15.1 Final EWA base

WGSL-04에서는 원래 EWA terminal texture가 여전히 public terminal authority다.

따라서 effect pass 기록 후에도 base를 transient로 내리지 않는다.

### 15.2 Terminal R1C resources

Terminal R1C resource 6개는 effect pass가 기록된 직후 release한다.

Release는 GPU 명령 완료 전에 실제 destroy하지 않는다.

```text
handle.release()
  -> graph.trackTransient(resources)
  -> submission completion cleanup에서 destroy
```

### 15.3 Candidate output

Retained candidate는 caller ownership이다.

Unretained candidate는 graph completion cleanup에서 destroy한다.

### 15.4 Uniforms

Tensor/effect uniform은 모두 uniform ring allocation이다.

Submission serial retire 시 reclaim한다.

### 15.5 Failure path

Record 중 실패하면 지금까지 생성된 texture는 graph transient로 귀속한다.

Standalone immediate destroy는 borrowed graph에서 금지한다.

---

## 16. R9A integration point

`executeCanonicalEwaLowpassR9A()`의 순서는 다음으로 변경한다.

```text
final EWA stage record
-> finalizeR8LowpassReceipt()
-> create FinalEwaTerminalSurfaceDescriptorWgsl04
-> recordBakemonoRinneNativeIntegrationWgsl04(), optional
-> graph.submit(), if ownsGraph
```

### 16.1 Lowpass receipt와 final graph receipt 분리

Lowpass receipt는 EWA lowpass 자체의 truth다.

Effect pass가 추가됐다고 lowpass receipt를 다시 쓰지 않는다.

대신 다음 별도 lineage를 만든다.

```text
lowpass receipt digest
-> BKR04 graph recording receipt digest
-> R9A submission receipt
```

### 16.2 Result envelope

```ts
interface CanonicalEwaLowpassResultWgsl04 {
  terminalTexture: GPUTexture; // 기존 EWA terminal, WGSL-05 전까지 유지
  nativeEffectCandidate: BakemonoRinneNativeCandidateHandleWgsl04 | null;
  nativeEffectRecordingReceipt: BakemonoRinneGraphRecordingReceiptWgsl04 | null;
  submission: R9ASubmission | null;
}
```

### 16.3 Stage count 0

Identity resize에서도 effect active mode가 요청되면 source/prepared terminal을 기준으로 terminal-resolution R1C와 effect를 기록할 수 있다.

Final descriptor dimensions는 실제 terminal dimensions와 같아야 한다.

---

## 17. Preview facade integration

`deltaK_stack_autoEWA.mjs`는 effect request를 R9A 호출 안으로 전달한다.

```js
bakemonoRinneEffect: request.bakemonoRinneEffect ?? { mode: 'DISABLED' }
```

### 17.1 Post-submit hook denial

```js
if (typeof request.runDeltaKCore === 'function') {
  throw stableError(
    'E_BKR04_POST_SUBMIT_HOOK_FORBIDDEN',
    'runDeltaKCore post-submit effect hook is forbidden by WGSL-04',
  );
}
```

호출 후 무시하거나 조용히 skip하지 않는다.

### 17.2 Envelope counters

```text
deltaKCoreExecutionCount = 0
nativeEffectRecordCount = 0 or 1
terminalR1CRecordCount = 0 or 1
nativeEffectDispatchCount = 0 or 1
nativeEffectAddedPassCount = 0 or 7
nativeEffectIntermediateReadbackCount = 0
nativeEffectQueueSubmitCount = 0
```

Overall standard execution:

```text
commandEncoderCount = 1
queueSubmitCount = 1
```

---

## 18. Command graph counters

### 18.1 Required receipt fields

R9A command graph submission receipt는 기존 필드를 유지한다.

WGSL-04 closure receipt는 다음을 추가로 증명한다.

```ts
interface BakemonoRinneSubmissionClosureReceiptWgsl04 {
  schemaVersion: 1;
  schemaId: typeof BKR04_SUBMISSION_CLOSURE_SCHEMA_ID;
  patchId: typeof BKR04_PATCH_ID;

  graphRecordingReceiptDigest: string;
  commandGraphId: string;
  encoderIdentity: string;
  submissionSerial: number;

  commandEncoderCount: 1;
  commandBufferCount: 1;
  queueSubmitCount: 1;

  terminalR1CPassCount: 6;
  effectPassCount: 1;
  addedPassCount: 7;

  effectImageReadbackCount: 0;
  effectMapAsyncCount: 0;
  effectCopyTextureToBufferCount: 0;
  nestedEncoderCount: 0;
  nestedSubmitCount: 0;

  canonicalFinalTextureClaim: false;
  receiptDigest: string;
}
```

### 18.2 Existing validation counters

R9A sampled validation counter buffer readback은 image readback이 아니다.

다음 둘을 혼동하지 않는다.

```text
R9A validation counter readback, existing diagnostic
Bakemono/Rinne intermediate texture readback, forbidden
```

WGSL-04의 zero readback claim은 effect image/intermediate texture에 대한 claim이다.

---

## 19. Graph recording receipt

```ts
export interface BakemonoRinneGraphRecordingReceiptWgsl04 {
  schemaVersion: 1;
  schemaId: typeof BKR04_RECORDING_RECEIPT_SCHEMA_ID;
  patchId: typeof BKR04_PATCH_ID;
  integrationId: typeof BKR04_GRAPH_INTEGRATION_ID;

  purpose: BakemonoRinneGraphPurposeWgsl04;
  operationId: string;
  graphOwnership: 'OWNED_BY_R9A' | 'BORROWED_BY_R9A';

  pipelineSetIdentityDigest: string;
  bakemonoRinnePipelineIdentity: string;
  baseLowpassReceiptDigest: string;
  lowpassPlanDigest: string;
  finalEwaSurfaceDigest: string;

  terminalTensorProducerReceiptDigest: string;
  terminalTensorAdmissionDigest: string;
  lambda2QualificationReceiptDigest: string;
  effectKernelReceiptDigest: string;
  effectDispatchReceiptDigest: string;

  formulaContractReceiptDigest: string;
  phaseReceiptDigest: string;
  inputSetDigest: string;
  tensorParameterDigest: string;
  effectParameterDigest: string;

  passCountBefore: number;
  passCountAfter: number;
  terminalR1CPassCount: 6;
  effectPassCount: 1;
  addedPassCount: 7;

  recorderCreateCommandEncoderCount: 0;
  recorderQueueSubmitCount: 0;
  recorderImageReadbackCount: 0;
  recorderMapAsyncCount: 0;
  recorderStandaloneUniformBufferCount: 0;
  uniformRingAllocationCount: 2;

  outputAuthority: typeof BKR04_CANDIDATE_AUTHORITY;
  canonicalFinalTextureClaim: false;
  surfaceRegistryPublishCount: 0;
  previewPublishCount: 0;
  exportPublishCount: 0;

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  commandGraphId: string;
  receiptDigest: string;
}
```

### 19.1 Digest replay

Receipt digest는 canonical JSON으로 재계산 가능해야 한다.

Opaque GPU object와 private capability는 receipt body에 넣지 않는다.

---

## 20. Input alias denial

다음 alias는 모두 금지한다.

```text
base === output
qmap === output
scalar === output
alphaDepth === output
highlight === output
maskEdge === output
terminalR1C === output
terminalR1C === base
```

Input texture끼리의 alias는 semantic role이 동일하다고 명시된 fixture 외에는 금지한다.

Canonical active mode에서는 qmap과 scalar alias를 금지한다.

---

## 21. Deterministic phase

WGSL-04는 WGSL-01 phase contract를 그대로 사용한다.

다음 runtime source를 허용하지 않는다.

- `performance.now()`
- `Date.now()`
- random seed
- implicit frame time

Effect parameter pack에는 receipt-bound phase value만 들어간다.

---

## 22. Stable errors

```text
E_BKR04_PIPELINE_FAMILY_MISSING
E_BKR04_PIPELINE_FAMILY_DISPOSED
E_BKR04_PIPELINE_FAMILY_STALE
E_BKR04_PIPELINE_SET_INCOMPLETE
E_BKR04_PIPELINE_SET_IDENTITY_MISMATCH
E_BKR04_GRAPH_REQUIRED
E_BKR04_GRAPH_ALREADY_SUBMITTED
E_BKR04_RAW_ENCODER_FORBIDDEN
E_BKR04_SECOND_ENCODER_FORBIDDEN
E_BKR04_SECOND_SUBMIT_FORBIDDEN
E_BKR04_BORROWED_GRAPH_SUBMIT_FORBIDDEN
E_BKR04_POST_SUBMIT_HOOK_FORBIDDEN
E_BKR04_UNIFORM_RING_REQUIRED
E_BKR04_STANDALONE_UNIFORM_FORBIDDEN
E_BKR04_FINAL_EWA_DESCRIPTOR_REQUIRED
E_BKR04_FINAL_EWA_LINEAGE_MISMATCH
E_BKR04_INPUT_DESCRIPTOR_REQUIRED
E_BKR04_INPUT_DIMENSION_MISMATCH
E_BKR04_INPUT_EPOCH_MISMATCH
E_BKR04_INPUT_SEMANTIC_MISMATCH
E_BKR04_TEXTURE_ALIAS_FORBIDDEN
E_BKR04_LAMBDA2_QUALIFICATION_NOT_FOUND
E_BKR04_LAMBDA2_RECEIPT_MISMATCH
E_BKR04_TENSOR_ADMISSION_FAILED
E_BKR04_PASS_ORDER_MISMATCH
E_BKR04_CANDIDATE_AUTHORITY_ESCALATION_DENIED
E_BKR04_SURFACE_PUBLISH_FORBIDDEN
E_BKR04_PREVIEW_EXPORT_PUBLISH_FORBIDDEN
E_BKR04_IMAGE_READBACK_FORBIDDEN
E_BKR04_MAP_ASYNC_FORBIDDEN
E_BKR04_NONDETERMINISTIC_CAPABILITY_FORBIDDEN
E_BKR04_RECEIPT_LINEAGE_MISMATCH
E_BKR04_CANDIDATE_RELEASE_REQUIRED
```

---

## 23. 파일 변경 계획

### 23.1 수정

```text
app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs
app/legacy-runtime/modules/dk_resample/canonical_pipeline_registry_r2r3.mjs
app/src/runtime/gpu/gpu-consumer-manifest.json
```

### 23.2 WGSL-03 refactor

```text
app/legacy-runtime/core/compute/qmap_webgpu/
  bakemono_rinne_wgsl_03_terminal_tensor.mjs
  bakemono_rinne_wgsl_03_pipeline.mjs
```

Isolated WGSL-03 qualification API는 유지하되, graph-native core를 공유하도록 분해한다.

### 23.3 신규

```text
app/legacy-runtime/core/compute/qmap_webgpu/
  bakemono_rinne_wgsl_04_contract.mjs
  bakemono_rinne_wgsl_04_pipeline_family.mjs
  bakemono_rinne_wgsl_04_graph_tensor.mjs
  bakemono_rinne_wgsl_04_graph_effect.mjs
  bakemono_rinne_wgsl_04_integration.mjs
  bakemono_rinne_wgsl_04_qualification_authority.mjs
  bakemono_rinne_wgsl_04_receipt.mjs

app/src/runtime/effects/bakemono-rinne/
  bakemono-rinne-wgsl-04-types.ts
```

### 23.4 도구

```text
tools/bakemono-rinne-wgsl-04/
  source-gate-catalog.json
  verify-source.mjs
  verify-negative-controls.mjs
  verify-parent-regression.mjs
  verify-registry-family.mjs
  verify-command-graph-wiring.mjs
  run-electron-physical.mjs
  gate-source.mjs
  gate-physical.mjs
  finalize-source.mjs
  finalize-physical.mjs
```

---

## 24. 구현 순서

1. WGSL-04 constants와 stable error contract 추가
2. WGSL-03 pipeline compilation에서 operation receipt dependency 제거
3. device-epoch-bound command graph pipeline family factory 추가
4. GPU consumer manifest에 WGSL-04 owner 추가
5. `createDeltaKStack()` 4-family build 적용
6. disposal cascade 적용
7. canonical registry completeness와 identity를 4-family로 확장
8. terminal tensor recorder를 graph-native core로 분해
9. effect recorder를 graph-native core로 분해
10. standalone uniform buffer를 uniform ring allocation으로 교체
11. entropy 없는 opaque private capability 적용
12. lambda2 qualification authority 추가
13. R9A effect request normalization 추가
14. Final EWA descriptor 생성
15. terminal R1C + effect pass를 submit 이전에 기록
16. candidate handle과 recording receipt 반환
17. `runDeltaKCore` fail-closed
18. output receipt envelope에 native effect lineage 추가
19. source gate와 negative controls 실행
20. Electron physical matrix 실행

---

## 25. Source Gate

총 Source Gate: **224**

Gate는 소스 존재 확인만 하지 않는다. 실제 production module의 exported contract와 runtime self-test를 호출해야 한다.

### BKR04-BASE-001

- Requirement: Parent WGSL-03 source final receipt digest is exact.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-002

- Requirement: WGSL-03 generated canonical shader digest is unchanged.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-003

- Requirement: WGSL-03 canonical ABI ID is reused exactly.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-004

- Requirement: WGSL-03 bind group layout remains 9 bindings.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-005

- Requirement: WGSL-03 uniform byte length remains 128.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-006

- Requirement: WGSL-03 structure gate formula identity is unchanged.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-007

- Requirement: WGSL-03 lambda2 receipt schema remains accepted.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-008

- Requirement: WGSL-03 terminal R1C pass order remains six passes.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-009

- Requirement: Compatibility WGSL-02 ABI remains tensor-free.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-010

- Requirement: Canonical final texture claim remains false.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-011

- Requirement: Preview publish claim remains false.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-012

- Requirement: Export publish claim remains false.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-013

- Requirement: Surface registry publish count remains zero.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-014

- Requirement: No generated WGSL body mutation is introduced.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-015

- Requirement: No legacy tensor shader becomes authority.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-016

- Requirement: No stage-local tensor becomes terminal tensor.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-017

- Requirement: No axial field becomes effect fieldTexture.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-018

- Requirement: No per-operation lambda2 probe is introduced.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-019

- Requirement: No per-operation lambda2 readback is introduced.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-020

- Requirement: Formula profile remains canonical R1C-gated profile.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-021

- Requirement: Deterministic phase receipt remains required.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-022

- Requirement: Encoded-straight color adapter contract is unchanged.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-023

- Requirement: R1C field semantic ID is unchanged.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-024

- Requirement: R1C packing ID is unchanged.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-025

- Requirement: Output format remains rgba16float.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-026

- Requirement: Output transfer remains linear.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-027

- Requirement: Output alpha remains premultiplied.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-BASE-028

- Requirement: Parent receipt bytes are preserved.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-001

- Requirement: WGSL-04 owner exists in GPU consumer manifest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-002

- Requirement: WGSL-04 pipeline family factory is exported.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-003

- Requirement: Pipeline family build does not require operation texture request.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-004

- Requirement: Pipeline family build does not require terminal tensor token.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-005

- Requirement: Pipeline family build does not require phase receipt.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-006

- Requirement: Pipeline family identity includes runtime epoch.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-007

- Requirement: Pipeline family identity includes device epoch.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-008

- Requirement: Pipeline family identity includes device identity.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-009

- Requirement: Pipeline family identity includes kernel ID.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-010

- Requirement: Pipeline family identity includes kernel ABI ID.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-011

- Requirement: Pipeline family identity includes generated WGSL digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-012

- Requirement: Pipeline family identity includes manifest digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-013

- Requirement: Pipeline family identity includes layout digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-014

- Requirement: Pipeline family identity includes uniform ABI digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-015

- Requirement: Pipeline family identity includes canonical delta digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-016

- Requirement: Pipeline family identity includes structure gate digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-017

- Requirement: Pipeline family exposes disposed state.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-018

- Requirement: Pipeline family dispose is idempotent.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-019

- Requirement: createDeltaKStack builds four families.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-020

- Requirement: EWA bundle attaches bakemonoRinneWgsl04.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-021

- Requirement: EWA disposal cascades to WGSL-04 family.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-022

- Requirement: Registry completeness requires four families.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-023

- Requirement: Registry rejects missing effect family.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-024

- Requirement: Registry rejects disposed effect family.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-025

- Requirement: Pipeline set identity includes effect family.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-026

- Requirement: Pipeline family count is exactly four.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-027

- Requirement: Pipeline set digest changes when effect identity mutates.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REG-028

- Requirement: Stale device epoch effect family is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-001

- Requirement: Graph-native tensor recorder accepts R9A graph.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-002

- Requirement: Graph-native effect recorder accepts R9A graph.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-003

- Requirement: Tensor recorder uses graph.beginComputePass.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-004

- Requirement: Effect recorder uses graph.beginComputePass.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-005

- Requirement: Tensor recorder never calls createCommandEncoder.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-006

- Requirement: Effect recorder never calls createCommandEncoder.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-007

- Requirement: Tensor recorder never calls queue.submit.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-008

- Requirement: Effect recorder never calls queue.submit.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-009

- Requirement: Integration coordinator never calls queue.submit.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-010

- Requirement: Owned R9A path submits exactly once.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-011

- Requirement: Borrowed graph path submits zero times locally.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-012

- Requirement: Nested encoder count remains zero.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-013

- Requirement: Nested submit count remains zero.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-014

- Requirement: Effect active mode adds six tensor passes.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-015

- Requirement: Effect active mode adds one effect pass.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-016

- Requirement: Effect active mode adds exactly seven passes.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-017

- Requirement: Effect disabled mode adds zero passes.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-018

- Requirement: Effect pass is recorded before graph submit.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-019

- Requirement: No record occurs after graph submitted state.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-020

- Requirement: Raw graph.encoder use is absent from new recorders.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-021

- Requirement: Pass labels are deterministic.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-022

- Requirement: Pass order receipt matches actual graph order.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-023

- Requirement: Command graph ID is exact through all receipts.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-024

- Requirement: Runtime epoch is exact through all receipts.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-025

- Requirement: Device epoch is exact through all receipts.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-026

- Requirement: Device identity is exact through all receipts.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-027

- Requirement: Graph snapshot after record includes added passes.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-GRAPH-028

- Requirement: Post-submit runDeltaKCore execution is impossible.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-001

- Requirement: Tensor params use graph.allocateUniform.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-002

- Requirement: Effect params use graph.allocateUniform.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-003

- Requirement: Tensor recorder creates zero standalone uniform buffers.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-004

- Requirement: Effect recorder creates zero standalone uniform buffers.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-005

- Requirement: Tensor recorder performs zero direct queue.writeBuffer calls.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-006

- Requirement: Effect recorder performs zero direct queue.writeBuffer calls.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-007

- Requirement: Recording receipt reports two uniform ring allocations.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-008

- Requirement: Uniform payload digest is recorded for tensor params.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-009

- Requirement: Uniform payload digest is recorded for effect params.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-010

- Requirement: Uniform offsets respect ring alignment.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-011

- Requirement: Uniform binding sizes match ABI.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-012

- Requirement: Uniform allocations bind supplied offset.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-013

- Requirement: Uniform allocations bind supplied size.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-014

- Requirement: Uniform allocations are submission-scoped.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-015

- Requirement: Uniform allocations retire on submission completion.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-016

- Requirement: Terminal R1C textures enter transient ledger after effect record.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-017

- Requirement: Candidate enters transient ledger when not retained.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-018

- Requirement: Retained candidate remains caller-owned.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-019

- Requirement: Candidate release is idempotent.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-020

- Requirement: Tensor handle release is idempotent.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-021

- Requirement: Failure path tracks all created textures.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-022

- Requirement: Failure path leaks zero standalone buffers.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-023

- Requirement: Private capability uses object identity only.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-024

- Requirement: Private capability uses zero UUID calls.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-025

- Requirement: Private capability uses zero Date calls.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-026

- Requirement: Private capability uses zero performance clock calls.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-027

- Requirement: Private capability uses zero random calls.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-UNIF-028

- Requirement: No opaque capability enters receipt digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-001

- Requirement: Effect mode defaults to DISABLED.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-002

- Requirement: Active mode requires explicit purpose.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-003

- Requirement: Base texture is derived from Final EWA descriptor.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-004

- Requirement: Caller supplied arbitrary base is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-005

- Requirement: Q-map descriptor is required.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-006

- Requirement: Scalar descriptor is required.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-007

- Requirement: Alpha-depth descriptor is required.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-008

- Requirement: Highlight descriptor is required.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-009

- Requirement: Mask-edge descriptor is required.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-010

- Requirement: All direct inputs match terminal width.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-011

- Requirement: All direct inputs match terminal height.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-012

- Requirement: All direct inputs match runtime epoch.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-013

- Requirement: All direct inputs match device epoch.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-014

- Requirement: All direct inputs match device identity.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-015

- Requirement: Q-map semantic is admitted explicitly.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-016

- Requirement: Scalar semantic is admitted explicitly.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-017

- Requirement: Input content digest or receipt is required.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-018

- Requirement: Base-output alias is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-019

- Requirement: Qmap-output alias is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-020

- Requirement: Scalar-output alias is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-021

- Requirement: AlphaDepth-output alias is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-022

- Requirement: Highlight-output alias is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-023

- Requirement: MaskEdge-output alias is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-024

- Requirement: TerminalR1C-output alias is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-025

- Requirement: TerminalR1C-base alias is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-026

- Requirement: Qmap-scalar alias is rejected in canonical mode.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-027

- Requirement: Missing active input does not create neutral texture.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-INPUT-028

- Requirement: No input bridge or implicit resample is performed.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-001

- Requirement: Lambda2 qualification resolver is authority-owned.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-002

- Requirement: Caller cannot inject arbitrary receipt object.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-003

- Requirement: Receipt status must be PHYSICAL_PASS.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-004

- Requirement: Receipt physicalExecution must be true.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-005

- Requirement: Receipt pass must be true.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-006

- Requirement: Receipt digest replay must pass.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-007

- Requirement: Shader set digest must match.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-008

- Requirement: Tensor parameter digest must match.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-009

- Requirement: Tensor pipeline identity must match.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-010

- Requirement: Adapter identity must match.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-011

- Requirement: Device identity must match.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-012

- Requirement: Fixture corpus digest must match.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-013

- Requirement: Missing receipt fails closed.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-014

- Requirement: Pending receipt fails closed.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-015

- Requirement: Failed receipt fails closed.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-016

- Requirement: Cross-device receipt is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-017

- Requirement: Cross-adapter receipt is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-018

- Requirement: Cross-shader receipt is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-019

- Requirement: Cross-parameter receipt is rejected.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-020

- Requirement: Per-operation probe dispatch count is zero.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-021

- Requirement: Per-operation lambda2 readback count is zero.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-022

- Requirement: Integrated tensor stays private.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-023

- Requirement: Raw tensor stays private.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-024

- Requirement: Axial tensor stays private.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-025

- Requirement: Public handle exposes fieldTexture only.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-026

- Requirement: Terminal tensor source is Final EWA only.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-027

- Requirement: Terminal tensor coordinate mapping is identity output pixel.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-L2-028

- Requirement: Terminal tensor dimensions equal final output.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-001

- Requirement: Graph recording receipt schema is exact.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-002

- Requirement: Submission closure receipt schema is exact.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-003

- Requirement: Recording receipt binds pipeline set identity.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-004

- Requirement: Recording receipt binds effect pipeline identity.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-005

- Requirement: Recording receipt binds lowpass receipt digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-006

- Requirement: Recording receipt binds lowpass plan digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-007

- Requirement: Recording receipt binds Final EWA descriptor digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-008

- Requirement: Recording receipt binds terminal tensor receipt.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-009

- Requirement: Recording receipt binds tensor admission digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-010

- Requirement: Recording receipt binds lambda2 qualification digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-011

- Requirement: Recording receipt binds kernel receipt digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-012

- Requirement: Recording receipt binds effect dispatch receipt digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-013

- Requirement: Recording receipt binds formula receipt digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-014

- Requirement: Recording receipt binds phase receipt digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-015

- Requirement: Recording receipt binds input set digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-016

- Requirement: Recording receipt binds tensor parameter digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-017

- Requirement: Recording receipt binds effect parameter digest.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-018

- Requirement: Recording receipt binds pass count before.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-019

- Requirement: Recording receipt binds pass count after.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-020

- Requirement: Recording receipt reports added pass count seven.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-021

- Requirement: Recording receipt reports zero recorder submit.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-022

- Requirement: Recording receipt reports zero image readback.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-023

- Requirement: Recording receipt reports zero mapAsync.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-024

- Requirement: Recording receipt reports zero standalone uniform buffer.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-025

- Requirement: Candidate authority is graph shadow only.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-026

- Requirement: Candidate canonical final claim is false.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-027

- Requirement: Candidate publication counts are zero.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-RCPT-028

- Requirement: Receipt canonical JSON replay succeeds.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-001

- Requirement: WGSL-03 source gate remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-002

- Requirement: WGSL-02 source gate remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-003

- Requirement: WGSL-01 source gate remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-004

- Requirement: R2-R3 registry source gate remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-005

- Requirement: R9A source contract remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-006

- Requirement: R1C tensor source contract remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-007

- Requirement: Adaptive policy source contract remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-008

- Requirement: EWA kernel source contract remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-009

- Requirement: Active graph parse closure remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-010

- Requirement: JavaScript parse closure remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-011

- Requirement: TypeScript syntax closure remains passing.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-012

- Requirement: GPU consumer manifest remains sorted and valid.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-013

- Requirement: Effect disabled path returns original terminal texture.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-014

- Requirement: Effect active path still returns original terminal texture in WGSL-04.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-015

- Requirement: Native candidate is returned separately.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-016

- Requirement: Original terminal texture is not demoted.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-017

- Requirement: Surface Registry is not called.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-018

- Requirement: PreviewPresenter is not called.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-019

- Requirement: ExportAuthority is not called.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-020

- Requirement: WebGL effect runtime is not imported into R9A.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-021

- Requirement: WGSL-03 isolated physical harness remains available.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-022

- Requirement: WGSL-03 shadow owner remains qualification-only.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-023

- Requirement: runDeltaKCore hook is fail-closed.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-024

- Requirement: No second encoder source token is present in recorders.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-025

- Requirement: No second submit source token is present in recorders.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-026

- Requirement: No image readback source token is present in recorders.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-027

- Requirement: No nondeterministic capability source token remains.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

### BKR04-REGR-028

- Requirement: WGSL-05 is named as next authority patch.
- Result field: `PASS | FAIL`.
- Evidence: exact file, exported identity, runtime self-test, or digest replay.

---

## 26. Physical Gate

총 Physical Gate: **64**

Physical Gate는 실제 WebGPU device에서 실행해야 한다. Source mock으로 PASS를 만들 수 없다.

### 26.1 Pipeline and registry, 8

1. WGSL-04 pipeline compiles on the physical adapter.
2. Compilation error count is zero.
3. Registry eager build produces four complete families.
4. Effect family identity matches current device epoch.
5. Effect family is rebuilt after a new device epoch.
6. Old effect family is rejected after epoch change.
7. Effect family disposal is observed exactly once.
8. Pipeline set identity digest replays exactly.

### 26.2 Owned graph, 8

1. Active mode records 7 added compute passes.
2. Command encoder count is 1.
3. Command buffer count is 1.
4. Queue submit count is 1.
5. Nested encoder count is 0.
6. Nested submit count is 0.
7. Effect pass occurs before encoder finish.
8. Submission closure receipt matches observed counters.

### 26.3 Borrowed graph, 8

1. Local R9A submit count is 0.
2. Outer graph submit count is 1.
3. Added pass count remains 7.
4. Graph ID remains identical.
5. Encoder identity remains identical.
6. Candidate texture is usable after outer submit.
7. No local fence wait is introduced.
8. Borrowed graph double-submit mutant fails.

### 26.4 Uniform ring and lifetime, 8

1. Tensor uniform uses the ring.
2. Effect uniform uses the ring.
3. Standalone uniform buffer count is 0.
4. Two ring allocations seal under one submission serial.
5. Ring allocations reclaim after completion.
6. Six terminal tensor textures destroy after completion.
7. Unretained candidate destroys after completion.
8. Retained candidate survives until explicit release.

### 26.5 Output parity, 8

1. Graph-native candidate matches isolated WGSL-03 candidate within f16 tolerance.
2. Alpha half bits match isolated candidate.
3. Nonfinite output count is zero.
4. Coherence zero fixture returns base.
5. Edge zero fixture returns base.
6. Coherence one and edge one fixture matches canonical formula oracle.
7. Same inputs repeated 10 times produce identical half bits.
8. Candidate dimensions and format match Final EWA output.

### 26.6 Zero image readback, 8

1. Effect path creates no MAP_READ image buffer.
2. Effect path issues no texture-to-buffer copy.
3. Effect path calls no `mapAsync`.
4. Effect path calls no `readPixels`.
5. Effect path creates no Canvas or ImageData.
6. Existing validation counter sampling remains separately accounted.
7. Qualification lambda2 probe is absent from product operation graph.
8. Zero image readback receipt matches instrumentation.

### 26.7 Fail-closed matrix, 8

1. Missing physical lambda2 receipt fails.
2. Cross-device receipt fails.
3. Stale effect pipeline family fails.
4. Input dimension mismatch fails.
5. Input epoch mismatch fails.
6. Texture alias fails.
7. `runDeltaKCore` callback fails before submit.
8. Authority escalation to final texture fails.

### 26.8 Disabled and regression path, 8

1. Disabled mode adds zero passes.
2. Disabled output texture equals baseline EWA terminal texture.
3. Disabled output receipt equals baseline lowpass receipt.
4. Disabled mode creates zero candidate textures.
5. Preview baseline pixels are unchanged.
6. Export baseline plan remains unchanged.
7. Existing R9A validation counters remain zero.
8. Device completion cleans all tracked transients.

---

## 27. Negative-control mutants

총 mutant: **56**

### 27.1 Registry mutants, 8

- Remove WGSL-04 family from `createDeltaKStack()`.
- Leave registry family count at 3.
- Omit effect identity from pipeline set digest.
- Mark effect family disposed before ACTIVE commit.
- Mutate effect device epoch.
- Mutate effect device identity.
- Remove effect disposal cascade.
- Lazily compile effect pipeline during record.

### 27.2 Graph mutants, 8

- Call `device.createCommandEncoder()` inside tensor recorder.
- Call `device.createCommandEncoder()` inside effect recorder.
- Call `queue.submit()` inside tensor recorder.
- Call `queue.submit()` inside effect recorder.
- Record effect after graph submit.
- Use raw `graph.encoder.beginComputePass()`.
- Omit one terminal tensor pass.
- Swap blurH and blurV receipt order.

### 27.3 Uniform mutants, 8

- Create standalone tensor params buffer.
- Create standalone effect params buffer.
- Directly call queue.writeBuffer in tensor recorder.
- Directly call queue.writeBuffer in effect recorder.
- Bind uniform ring offset as zero unconditionally.
- Bind wrong uniform byte size.
- Allocate only one of two uniform payloads.
- Reclaim ring allocation before submission completion.

### 27.4 Qualification mutants, 8

- Accept PENDING lambda2 receipt.
- Accept physicalExecution false.
- Accept pass false.
- Accept cross-device receipt.
- Accept cross-adapter receipt.
- Accept wrong shader set digest.
- Run per-operation lambda2 probe.
- Read back integrated tensor in product graph.

### 27.5 Input mutants, 8

- Accept arbitrary caller base texture.
- Accept qmap/output alias.
- Accept scalar/output alias.
- Accept terminalR1C/output alias.
- Accept mismatched dimensions.
- Accept stale input epoch.
- Fabricate missing scalar as zero texture.
- Resample input silently inside WGSL-04.

### 27.6 Authority mutants, 8

- Return candidate as `terminalTexture`.
- Publish candidate to Surface Registry.
- Publish candidate to PreviewPresenter.
- Publish candidate to ExportAuthority.
- Change candidate authority to canonical final.
- Destroy original EWA terminal after effect record.
- Execute post-submit `runDeltaKCore`.
- Ignore supplied post-submit hook instead of failing.

### 27.7 Determinism and lifecycle mutants, 8

- Use `crypto.randomUUID` in capability.
- Use `Date.now` in capability.
- Use `performance.now` in capability.
- Use `Math.random` in capability.
- Serialize capability object into receipt.
- Destroy terminal tensor resources before submit completion.
- Leak retained candidate after release.
- Fail to track resources created before an exception.

---

## 28. Completion states

### 28.1 Source baked

```text
SOURCE_BAKED_AWAITING_PHYSICAL_GPU
```

조건:

- Source Gate 224/224 PASS
- Negative mutants 56/56 detected
- Parent source gates PASS
- physical gate PENDING allowed

### 28.2 Physical pass

```text
PHYSICAL_R9A_GRAPH_NATIVE_SHADOW_PASS
```

조건:

- Physical Gate 64/64 PASS
- one encoder / one submit observed
- graph-native candidate parity PASS
- zero effect image readback observed
- candidate authority remains shadow-only

### 28.3 Fail

```text
FAIL
```

다음 중 하나면 FAIL이다.

- second encoder or second submit
- image readback in product effect path
- stale or absent pipeline family accepted
- unqualified lambda2 receipt accepted
- raw/legacy tensor accepted
- candidate published as final
- post-submit hook executed
- receipt replay failure

---

## 29. Acceptance seal

WGSL-04는 다음 식이 모두 참일 때만 닫힌다.

```text
pipelineFamilyCount == 4
AND effectPipelineBuiltBeforeOperation == true
AND effectPipelineEpoch == currentDeviceEpoch
AND effectPipelineIdentityInRegistryDigest == true

AND finalEwaDescriptor.texture == lowpassResult.terminalTexture
AND terminalR1C.source == FINAL_EWA_TERMINAL
AND terminalR1C.passCount == 6
AND effect.passCount == 1
AND addedPassCount == 7

AND recorderCreateCommandEncoderCount == 0
AND recorderQueueSubmitCount == 0
AND standardCommandEncoderCount == 1
AND standardQueueSubmitCount == 1

AND tensorUniformRingAllocationCount == 1
AND effectUniformRingAllocationCount == 1
AND standaloneUniformBufferCount == 0

AND perOperationLambda2ProbeCount == 0
AND perOperationLambda2ReadbackCount == 0
AND effectIntermediateImageReadbackCount == 0

AND runDeltaKCoreExecutionCount == 0
AND surfaceRegistryPublishCount == 0
AND previewPublishCount == 0
AND exportPublishCount == 0
AND canonicalFinalTextureClaim == false
```

---

## 30. 다음 패치

```text
TDT-BAKEMONO-RINNE-WGSL-05

Effect Output Terminal Authority /
Original EWA Texture Demotion /
Final Texture Receipt Lineage /
Surface Registry GPU Adoption /
Preview·Export Exact Surface Convergence /
Ignored Effect Return Elimination Seal
```

WGSL-05에서만 다음 권위 변경을 허용한다.

```text
terminalTexture = nativeEffectCandidate.texture
```

WGSL-04에서는 아직 허용하지 않는다.
