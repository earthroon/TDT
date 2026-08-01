# TDT-BAKEMONO-RINNE-WGSL-06

Canonical Effect Field Set Authority /
Analysis Field Consumer Registration /
QMap Normalized Response Publication /
Q-Wave Real DeltaK Authority Pinning /
Confidence·Validity Scalar Mapping /
Terminal Alpha-Depth Derivation /
Deterministic Linear-Luminance Highlight /
R1C Edge Direct Consumption /
Canonical ABI v2 Input Collapse /
Source Revision·Device Epoch Convergence /
No Caller-Supplied Effect Texture Seal

- Patch ID: `TDT-BAKEMONO-RINNE-WGSL-06`
- Spec schema: `tdt.effect.bakemono-rinne.wgsl06.spec.v1`
- Parent source bundle: `69_TDT_BAKEMONO_RINNE_WGSL_05_CANONICAL_FINAL_TEXTURE_SURFACE_PUBLICATION_SOURCE_BAKED_AWAITING_PHYSICAL_GPU.zip`
- Parent patch: `TDT-BAKEMONO-RINNE-WGSL-05`
- Target runtime: R9A canonical EWA command graph, Analysis Field Authority, Bakemono/Rinne canonical final path
- Target input authority: `CANONICAL_EFFECT_FIELD_SET`
- Target output authority: existing `CANONICAL_FINAL_TEXTURE`
- Product intermediate readback claim: `0`
- Product caller-supplied effect texture claim: `0`
- Standard owned graph encoder and submit claim: `1 encoder / 1 submit`
- Physical claim in source-only bake: `PENDING`

---

## 0. 목적

WGSL-05는 Bakemono/Rinne effect candidate를 canonical `terminalTexture`로 승격하고 Surface Registry, PipelineService, Preview, Export가 동일한 Final Surface를 소비하도록 닫았다.

그러나 effect pass의 입력은 아직 다음 다섯 개 direct texture descriptor를 public request에서 받는다.

```text
qmap
scalar
alphaDepth
highlight
maskEdge
```

이 descriptor는 texture object, semanticId, contentDigest를 담지만, 실제 producer authority와 execution receipt를 강제하지 않는다. 특히 caller가 임의 texture와 임의 digest를 조립할 수 있으며, canonical final path가 그 texture를 직접 bind할 수 있다.

WGSL-06의 목표는 다음 한 줄이다.

```text
Canonical source surface lineage
  -> Analysis Field Authority에서 Q-map과 Q-wave Real DeltaK require + pin
  -> R9A graph 안에서 normalized-coordinate manual bilinear sampling
  -> Q-wave R × confidence G × validity A × scalarGain mapping
  -> alphaDepth는 Final EWA alpha에서 파생
  -> highlight는 Final EWA linear-straight luminance에서 파생
  -> mask edge는 Terminal R1C edge-strength A에서 직접 소비
  -> caller direct effect textures 0개
  -> Bakemono/Rinne canonical ABI v2
  -> 기존 WGSL-05 Final Texture adoption 유지
```

완료 조건은 texture binding 수를 줄였다는 사실이 아니다. 다음 권위가 하나의 field set receipt로 수렴해야 한다.

- Q-map producer authority
- Q-wave producer authority
- Analysis Field Authority generation and pin state
- sourceSurfaceId and sourceRevision
- deviceEpoch and deviceIdentity
- canonical effect dispatch receipt
- WGSL-05 Final Texture adoption receipt
- Surface Registry evidence
- Preview and Export shared final tuple

## 1. 현재 구현에서 확인된 입력 권위 단절

### 1.1 WGSL-04 direct descriptor는 producer authority가 아님

현재 `assertDirectInputDescriptorWgsl04()`는 다음만 검사한다.

- texture가 존재함
- `resourceId`가 존재함
- `contentDigest`가 64-hex임
- `semanticId`가 존재함
- dimensions가 effect output과 같음
- optional epoch가 일치함
- format이 `r16float` 또는 `rgba16float`임

이 검사는 descriptor의 형태를 확인할 뿐, texture가 어떤 producer에서 만들어졌는지 확인하지 않는다.

```text
64-hex 문자열 존재
!=
실제 GPU field execution receipt 검증
```

### 1.2 Q-map semantic은 Effect contract에만 있고 Analysis Field Registry에는 없음

현재 다음 Effect semantic은 존재한다.

```text
tdt.effect.bakemono-rinne.qmap.normalized-response.v1
```

하지만 `generate-semantic-registry.mjs`와 generated Analysis Field semantic registry에는 Q-map semantic이 없다. 따라서 `AnalysisFieldAuthorityService.requireField()`로 Q-map을 획득할 수 없다.

WGSL-06은 없는 authority를 있다고 가정하지 않는다. 다음 canonical analysis semantic을 새로 등록한다.

```text
tdt.analysis.qmap.normalized-response.v1
```

### 1.3 Q-wave Real DeltaK authority는 이미 존재함

현재 Analysis Field Registry와 producer inventory에는 다음이 존재한다.

```text
semanticId:
  tdt.analysis.qwave.real-delta-k-compat.v1

producerId:
  tdt.analysis.producer.qwave.analytic

channels:
  R = real-delta-k
  G = confidence
  B = reserved
  A = validity
```

따라서 Q-wave scalar는 새 direct texture contract를 만들지 않고 기존 Analysis Field Authority에서 require and pin해야 한다.

### 1.4 현재 canonical kernel은 Q-wave confidence와 validity를 버림

현재 `bakemono_rinne_fusion_r1c_gated_v1.generated.wgsl`은 secondary scalar에서 R만 읽는다.

```wgsl
let s = textureLoad(scalarTex, pixel, 0).r * params.scalarGain;
```

하지만 WGSL-01 scalar profile은 Q-wave mapping을 다음으로 정의한다.

```text
mappedScalar
= realDeltaK.R
× confidence.G
× validity.A
× scalarGain
```

현재 canonical final path는 semantic profile과 실제 kernel computation이 어긋난다.

### 1.5 canonical mask profile과 실제 ABI가 어긋남

WGSL-01의 canonical mask profile은 다음을 이미 선언했다.

```text
highlight = deterministic luminance derived
edge      = terminal R1C field A
coherence = terminal R1C field B
alphaDepth = terminal surface alpha
```

그러나 WGSL-05까지의 canonical ABI는 별도 `alphaDepth`, `highlight`, `maskEdge` textures를 요구한다. 즉 선언된 canonical profile이 실제 bind group에 반영되지 않았다.

### 1.6 Legacy DeltaE profile이 canonical final request에 남아 있음

현재 scalar profile은 다음 둘을 구분한다.

```text
LEGACY_DELTA_E_COMPAT
QWAVE_REAL_DELTA_K
```

그러나 public effect request가 direct scalar descriptor를 받기 때문에 canonical final mode에서 legacy DeltaE texture가 들어오는 것을 구조적으로 막지 못한다.

WGSL-06 이후 `CANONICAL_FINAL`은 `QWAVE_REAL_DELTA_K`만 허용한다. Legacy DeltaE는 WGSL-02 compatibility shadow에만 남는다.

### 1.7 source lineage convergence가 descriptor 수준에서 불완전함

현재 direct descriptor의 source surface lineage는 필수 항목이 아니다. Q-map, scalar, Final EWA base가 서로 다른 source revision에서 만들어져도 texture dimensions와 epoch만 맞으면 bind될 수 있다.

WGSL-06은 다음 equality를 강제한다.

```text
qmap.sourceSurfaceId
= qwave.sourceSurfaceId
= request.sourceSurfaceId

qmap.sourceRevision
= qwave.sourceRevision
= request.sourceRevision

qmap.deviceEpoch
= qwave.deviceEpoch
= current deviceEpoch
```

### 1.8 field lifetime이 command graph completion에 귀속되지 않음

Analysis Field Authority field는 pin으로 수명을 보호한다. 현재 Bakemono/Rinne path에는 pin이 없다.

WGSL-06은 두 field pin을 graph recording 전에 획득하고 다음 시점까지 유지한다.

```text
recording success
-> graph.submit()
-> submission completion or device loss cleanup
-> pin release
```

recording 중 오류가 나고 submit되지 않으면 즉시 release한다.

### 1.9 current 9-binding canonical ABI가 legacy mask topology를 유지함

WGSL-03/04 canonical ABI는 9 bindings이다.

```text
0 base
1 qmap
2 scalar
3 alphaDepth
4 highlight
5 maskEdge
6 terminalR1C
7 output
8 uniform
```

WGSL-06 canonical ABI v2는 별도 identity로 축소한다.

```text
0 base
1 qmap analysis field
2 qwave real-delta-k analysis field
3 terminal R1C
4 output
5 uniform
```

Compatibility ABI와 canonical ABI를 합치지 않는다.

## 2. 범위

### 2.1 포함

- Analysis Field Authority에 Bakemono/Rinne consumer 등록
- `tdt.analysis.qmap.normalized-response.v1` semantic 등록
- Q-map producer inventory entry와 publication boundary
- Q-map and Q-wave field requirement normalization
- minimum claim `EFFECTIVE_EXECUTION`
- field handle require, descriptor verification, execution receipt verification, pin lifecycle
- sourceSurfaceId, sourceRevision, deviceEpoch convergence
- arbitrary source field dimensions admitted through manual bilinear sampling
- Q-wave `R × G × A × scalarGain` mapping
- Final EWA alpha based alpha-depth derivation
- linear-straight luminance based deterministic highlight derivation
- Terminal R1C `A` direct edge consumption
- Terminal R1C `B` coherence consumption
- Canonical ABI v2 with six bindings
- WGSL-04 effect family replacement by WGSL-06 field-authority family
- WGSL-05 final adoption receipt extension with field set lineage
- Surface Registry evidence extension with field set lineage
- Preview and Export shared tuple extension with field set receipt digest
- graph completion bound pin release
- device-loss pin invalidation and fail-closed behavior
- zero direct caller effect texture admission in canonical final mode
- single encoder, single submit, zero intermediate readback preservation

### 2.2 제외

- Q-map mathematical formula redesign
- Q-map threshold retuning
- Q-wave producer algorithm changes
- ICC based Bakemono/Rinne color formula replacement
- UI panel and preset migration
- legacy WebGL effect retirement
- compatibility WGSL-02 ABI removal
- GPU field cache pooling optimization
- atlas based field residency optimization
- physical fleet qualification

WGSL-06은 Q-map 계산식을 새로 발명하지 않는다. 기존에 선택된 canonical Q-map producer가 Analysis Field Authority publication contract를 만족하도록 승격한다. 활성 canonical Q-map producer가 선택되지 않으면 final mode는 `HOLD`이며 raw texture fallback은 금지한다.

## 3. SSOT와 상태 귀속

| 상태 | SSOT |
|---|---|
| GPU device and device epoch | GPU Device Authority |
| source surface revision | Surface Registry Authority |
| Q-map semantic and generation | Analysis Field Authority |
| Q-wave semantic and generation | Analysis Field Authority |
| Q-map producer selection | QMap Producer Promotion Authority introduced by WGSL-06 |
| Q-wave producer selection | existing `tdt.analysis.producer.qwave.analytic` |
| field pin lifecycle | Analysis Field Authority |
| graph submission lifecycle | R9A Command Graph |
| terminal R1C field | WGSL-04 terminal R1C producer |
| canonical effect field set receipt | WGSL-06 Effect Field Set Authority |
| canonical effect kernel | WGSL-06 pipeline family |
| Final Texture selection | WGSL-05 Final Texture Adoption Authority |
| Final Surface ownership | Surface Registry Authority and PipelineService |
| Preview and Export convergence | FinalSurfaceConsumptionLedgerService |

Q-map, Q-wave, derived masks의 동일 의미 상태를 caller request와 Effect runtime이 동시에 소유하지 않는다.

## 4. Target graph

```text
R9A owned command graph
  -> canonical EWA stages
  -> Final EWA terminal texture
  -> terminal-resolution integrated R1C 6 passes
  -> Analysis Field Authority
       require qmap handle
       require qwave real-delta-k handle
       pin qmap
       pin qwave
  -> Bakemono/Rinne WGSL-06 effect pass
       normalized UV from final output pixel
       manual bilinear sample qmap field
       manual bilinear sample qwave RGBA field
       q = clamp(qmap.R, 0, 1)
       scalar = clamp(R,0,1) * clamp(G,0,1) * clamp(A,0,1) * scalarGain
       alphaDepth = clamp(base.a, 0, 1)
       linearStraight = base.rgb / alpha
       highlight = clamp(dot(linearStraight, Rec.709 linear luminance), 0, 1)
       edge = clamp(terminalR1C.a, 0, 1)
       coherence = clamp(terminalR1C.b, 0, 1)
       structureGate = pow(coherence, exponent) * edge
       write rgba16float candidate
  -> WGSL-05 Final Texture adoption
  -> graph.submit() exactly once
  -> graph completion callback releases both Analysis Field pins
  -> adopted Final Surface publication
```

Field pin acquisition은 graph submit 전이다. Pin release는 graph completion 또는 pre-submit failure cleanup이다.

## 5. Canonical identities

```text
BKR06_PATCH_ID
= TDT-BAKEMONO-RINNE-WGSL-06

BKR06_CONSUMER_ID
= dadum.gpu.consumer.bakemono-rinne-wgsl-06

BKR06_FIELD_AUTHORITY_ID
= tdt.effect.bakemono-rinne.canonical-field-set-authority.wgsl06.v1

BKR06_FIELD_SET_SCHEMA_ID
= tdt.effect.bakemono-rinne.canonical-field-set-handle.wgsl06.v1

BKR06_FIELD_SET_RECEIPT_SCHEMA_ID
= tdt.effect.bakemono-rinne.canonical-field-set-receipt.wgsl06.v1

BKR06_QMAP_SEMANTIC_ID
= tdt.analysis.qmap.normalized-response.v1

BKR06_QMAP_PRODUCER_ID
= tdt.analysis.producer.qmap.normalized-response

BKR06_QWAVE_SEMANTIC_ID
= tdt.analysis.qwave.real-delta-k-compat.v1

BKR06_QWAVE_PRODUCER_ID
= tdt.analysis.producer.qwave.analytic

BKR06_KERNEL_ID
= tdt.effect.bakemono-rinne.kernel.authority-fields-final.v2

BKR06_KERNEL_ABI_ID
= tdt.effect.bakemono-rinne.abi.authority-fields-final.v2

BKR06_PIPELINE_FAMILY_ID
= tdt.pipeline.bakemono-rinne.authority-fields.wgsl06.v1

BKR06_DERIVED_MASK_PROFILE_ID
= tdt.effect.bakemono-rinne.mask.terminal-derived.wgsl06.v1

BKR06_QWAVE_MAPPING_ID
= tdt.effect.bakemono-rinne.mapping.qwave-real-confidence-validity.wgsl06.v1
```

## 6. Analysis Field consumer registration

### 6.1 Consumer descriptor

```ts
interface BakemonoRinneAnalysisConsumerDescriptor {
  consumerId: 'dadum.gpu.consumer.bakemono-rinne-wgsl-06';
  acceptedSemanticIds: readonly [
    'tdt.analysis.qmap.normalized-response.v1',
    'tdt.analysis.qwave.real-delta-k-compat.v1'
  ];
}
```

Consumer registration은 Runtime boot에서 한 번 수행한다. operation마다 register하지 않는다.

### 6.2 Collision and absence

- consumer가 이미 다른 accepted semantics로 등록돼 있으면 fail
- Analysis Field bridge가 없으면 fail
- consumer가 등록되지 않은 채 require or pin을 호출하면 fail
- final mode에서 bridge absence를 neutral texture로 대체하지 않음

### 6.3 Claim level

Canonical final mode의 minimum claim은 다음이다.

```text
EFFECTIVE_EXECUTION
```

`PRESENT_ONLY`와 `SOURCE_ADMITTED`는 final pixel input authority로 부족하다.

## 7. Q-map semantic and producer publication

### 7.1 Semantic descriptor

```ts
const qmapSemantic = {
  semanticId: 'tdt.analysis.qmap.normalized-response.v1',
  domain: 'spatial',
  periodicity: 'none',
  coordinateSpace: 'stage-pixel',
  representation: 'normalized qmap response',
  defaultFormat: 'rgba16float',
  channelSchema: [
    { index: 0, name: 'normalized-response', range: [0, 1], neutral: 0 },
    { index: 1, name: 'confidence', range: [0, 1], neutral: 1 },
    { index: 2, name: 'reserved', range: null, neutral: 0 },
    { index: 3, name: 'validity', range: [0, 1], neutral: 1 },
  ],
  neutralValue: [0, 1, 0, 1],
  interpolationPolicy: 'linear',
  mipPolicy: 'none',
  claimRequirements: ['effective-execution'],
};
```

Q-map Effect value는 기본적으로 R channel이다. Confidence와 validity가 producer에서 제공되는 경우 다음 mapping을 사용한다.

```text
q = clamp(R, 0, 1) * clamp(G, 0, 1) * clamp(A, 0, 1)
```

기존 single-channel Q-map producer를 승격할 때 G와 A는 정확히 1로 기록한다. 숨은 fallback이 아니라 publication format contract다.

### 7.2 Producer selection gate

현재 source tree에는 Q-map 관련 WGSL과 runtime이 여러 개 있으나 Analysis Field producer inventory에는 canonical Q-map producer가 없다.

WGSL-06 bake는 다음 중 하나를 명시적으로 선택해야 한다.

```text
A. 이미 제품 본선에서 실제 qmapTexture를 작성하는 WebGPU producer를
   BKR06_QMAP_PRODUCER_ID로 승격하고 execution receipt를 발행

B. 별도 canonical Q-map producer를 구현하고 기존 qmapTexture path를 퇴역
```

다음은 금지한다.

- 가장 이름이 비슷한 qmap shader를 자동 선택
- `request.qmapTex`를 producer receipt 없이 publish
- legacy WebGL qmap을 compatibilityMode false로 publish
- CPU qmap array를 GPU field인 척 publish
- contentDigest 문자열만 생성하여 execution receipt 대체

### 7.3 Q-map publication requirements

Q-map producer submission은 Analysis Field Authority의 다음 조건을 만족해야 한다.

- execution backend `webgpu`
- kernel language `wgsl`
- CPU pixel compute false
- WebGL pixel compute false
- canvas pixel compute false
- intermediate readback count 0
- submission and fence completion recorded
- source surface lineage exact
- publication format `r16float` or `rgba16float`
- claim level `EFFECTIVE_EXECUTION` 이상

## 8. Q-wave Real DeltaK acquisition

### 8.1 Required semantic

```text
tdt.analysis.qwave.real-delta-k-compat.v1
```

### 8.2 Required producer

기본 producer는 다음이다.

```text
tdt.analysis.producer.qwave.analytic
```

다른 producer를 허용하려면 동일 semantic, claim level, source lineage, device epoch를 만족하고 explicit allowlist에 있어야 한다.

### 8.3 Exact scalar mapping

Manual bilinear sample 결과를 `sample`이라고 할 때:

```wgsl
let realDeltaK = clamp(sample.r, 0.0, 1.0);
let confidence = clamp(sample.g, 0.0, 1.0);
let validity = clamp(sample.a, 0.0, 1.0);
let scalar = clamp(realDeltaK * confidence * validity * params.scalarGain, 0.0, 1.0);
```

Reserved B channel은 계산에 사용하지 않는다.

### 8.4 Legacy DeltaE exclusion

`CANONICAL_FINAL` mode에서 다음 profile은 거절한다.

```text
tdt.effect.bakemono-rinne.scalar.legacy-delta-e-compat.v1
```

Legacy DeltaE는 WGSL-02 compatibility shadow에서만 사용할 수 있다.

## 9. Field requirement and pin contract

### 9.1 Requirement

```ts
interface BakemonoRinneFieldRequirementWgsl06 {
  sourceSurfaceId: string;
  sourceRevision: number;
  deviceEpoch: number;
  qmapSemanticId: 'tdt.analysis.qmap.normalized-response.v1';
  scalarSemanticId: 'tdt.analysis.qwave.real-delta-k-compat.v1';
  minimumClaimLevel: 'EFFECTIVE_EXECUTION';
}
```

### 9.2 Resolver

```ts
resolveBakemonoRinneCanonicalFieldSetWgsl06({
  analysisBridge,
  requirement,
  operationId,
  purpose,
})
```

Resolver sequence:

```text
requireField(qmap)
-> describeField(qmap)
-> verify qmap execution receipt
-> pinField(qmap)
-> requireField(qwave)
-> describeField(qwave)
-> verify qwave execution receipt
-> pinField(qwave)
-> seal field set receipt
-> return opaque field set handle
```

두 번째 pin 이전에 오류가 나면 첫 번째 pin을 즉시 release한다.

### 9.3 Opaque handle

Public effect request에는 raw `GPUTexture`를 넣지 않는다.

```ts
interface BakemonoRinneCanonicalFieldSetHandleWgsl06 {
  readonly schemaId: 'tdt.effect.bakemono-rinne.canonical-field-set-handle.wgsl06.v1';
  readonly authorityId: 'tdt.effect.bakemono-rinne.canonical-field-set-authority.wgsl06.v1';
  readonly sourceSurfaceId: string;
  readonly sourceRevision: number;
  readonly deviceEpoch: number;
  readonly qmapHandle: AnalysisFieldHandle;
  readonly qwaveHandle: AnalysisFieldHandle;
  readonly fieldSetReceiptDigest: string;
  readonly state: 'ACQUIRED' | 'BOUND' | 'RELEASED';
}
```

GPU resources는 private capability에 보관한다. Public handle에는 field metadata와 receipt digest만 노출한다.

## 10. Source revision and device convergence

다음 조건은 모두 exact equality다.

```text
qmap.sourceSurfaceId == request.sourceSurfaceId
qwave.sourceSurfaceId == request.sourceSurfaceId

qmap.sourceRevision == request.sourceRevision
qwave.sourceRevision == request.sourceRevision

qmap.deviceEpoch == currentDeviceEpoch
qwave.deviceEpoch == currentDeviceEpoch

qmap.executionReceipt.terminalState == PUBLISHED
qwave.executionReceipt.terminalState == PUBLISHED

qmap.executionReceipt.effectiveExecution == true
qwave.executionReceipt.effectiveExecution == true
```

Field dimensions는 Final EWA output dimensions와 같을 필요가 없다. Kernel이 normalized-coordinate manual bilinear sampling을 수행한다.

## 11. Canonical ABI v2

### 11.1 Bind group layout

| Binding | Resource | Required semantic |
|---:|---|---|
| 0 | Final EWA base texture | canonical linear premultiplied rgba16float |
| 1 | Q-map Analysis Field texture | `tdt.analysis.qmap.normalized-response.v1` |
| 2 | Q-wave Analysis Field texture | `tdt.analysis.qwave.real-delta-k-compat.v1` |
| 3 | Terminal R1C field texture | tangent/coherence/edge R1C |
| 4 | Output storage texture | rgba16float |
| 5 | Uniform buffer | WGSL-06 params |

### 11.2 Removed bindings

다음 bindings는 canonical ABI v2에서 존재하지 않는다.

```text
alphaDepth texture
highlight texture
maskEdge texture
legacy DeltaE scalar texture
```

### 11.3 ABI separation

```text
WGSL-02 compatibility ABI
  remains unchanged

WGSL-03/04 canonical shadow ABI v1
  retained for regression and shadow comparison only

WGSL-06 canonical final ABI v2
  sole product final input ABI
```

v1 and v2 pipeline identity를 같은 digest로 취급하지 않는다.

## 12. Uniform ABI

WGSL-06 uniform은 128 bytes를 유지하되 field dimensions와 derived mask identity를 명시한다.

```wgsl
struct BakemonoRinneAuthorityFieldParams {
  outputSize: vec2<u32>,
  qmapSize: vec2<u32>,
  qwaveSize: vec2<u32>,
  abiVersion: u32,
  flags: u32,

  phaseBase: f32,
  phaseQGain: f32,
  phaseScalarGain: f32,
  power: f32,

  neonBoost: f32,
  scalarGain: f32,
  coherenceExponent: f32,
  alphaEpsilon: f32,

  fusionLow: f32,
  fusionHigh: f32,
  maskHighlightWeight: f32,
  maskEdgeWeight: f32,

  formulaProfileEnum: u32,
  scalarProfileEnum: u32,
  derivedMaskProfileEnum: u32,
  fieldAuthorityEnum: u32,

  tauCompat: f32,
  neonMultiplier: f32,
  qmapMappingEnum: u32,
  qwaveMappingEnum: u32,

  tensorPackingEnum: u32,
  structureGateEnum: u32,
  outputAuthorityEnum: u32,
  checksumWord: u32,
};
```

실제 WGSL alignment와 byte offsets는 generated ABI manifest로 검증한다.

## 13. Manual bilinear field sampling

### 13.1 Output UV

```wgsl
let uv = (vec2<f32>(gid.xy) + vec2<f32>(0.5)) / vec2<f32>(params.outputSize);
```

### 13.2 Sampling rule

- sampler object를 사용하지 않음
- `textureLoad()` 4 taps
- half-texel centered coordinates
- clamp-to-edge
- no mip
- finite check
- exact field size from uniform

### 13.3 Q-map mapping

```text
qSample = bilinear(qmap)
q = clamp(qSample.R, 0, 1)
  × clamp(qSample.G, 0, 1)
  × clamp(qSample.A, 0, 1)
```

Single-channel publication profile은 G=1, A=1을 publication 단계에서 기록한다.

### 13.4 Q-wave mapping

```text
sSample = bilinear(qwave)
s = clamp(R,0,1)
  × clamp(G,0,1)
  × clamp(A,0,1)
  × scalarGain
```

### 13.5 Nonfinite behavior

- qmap sample nonfinite -> operation fail in qualification
- product kernel -> corresponding signal becomes 0, validation counter increments
- qwave sample nonfinite -> scalar 0, validation counter increments
- silent NaN propagation 금지

## 14. Derived canonical mask profile

### 14.1 Alpha-depth

```wgsl
let alphaDepth = clamp(basePmLinear.a, 0.0, 1.0);
```

별도 texture를 사용하지 않는다.

### 14.2 Straight linear color

```wgsl
var linearStraight = vec3<f32>(0.0);
if (alphaDepth > params.alphaEpsilon) {
  linearStraight = basePmLinear.rgb / alphaDepth;
}
```

### 14.3 Deterministic highlight

```wgsl
let highlight = clamp(
  dot(max(linearStraight, vec3<f32>(0.0)), vec3<f32>(0.2126, 0.7152, 0.0722)),
  0.0,
  1.0
);
```

- linear-light Rec.709 coefficients
- time dependency 없음
- neighborhood dependency 없음
- hidden threshold 없음
- separate texture 없음

### 14.4 Edge and coherence

```wgsl
let terminalR1C = textureLoad(terminalR1CTex, pixel, 0);
let coherence = clamp(terminalR1C.b, 0.0, 1.0);
let edge = clamp(terminalR1C.a, 0.0, 1.0);
```

### 14.5 Structure gate

```wgsl
let structureGate = pow(coherence, params.coherenceExponent) * edge;
```

### 14.6 Bakemono mask mix

```wgsl
let maskMix = params.maskHighlightWeight * highlight
            + params.maskEdgeWeight * edge;
```

이 profile은 legacy mask parity를 주장하지 않는다.

## 15. Canonical effect request

### 15.1 Public request

```ts
interface BakemonoRinneCanonicalFinalRequestWgsl06 {
  mode: 'CANONICAL_FINAL';
  purpose: 'FINAL_SURFACE_PUBLICATION';
  operationId: string;
  formulaContractReceipt: FormulaContractReceipt;
  phaseReceipt: PhaseReceipt;
  scalarProfileId: 'tdt.effect.bakemono-rinne.scalar.qwave-real-delta-k.v1';
  qmapSemanticId: 'tdt.analysis.qmap.normalized-response.v1';
  qwaveSemanticId: 'tdt.analysis.qwave.real-delta-k-compat.v1';
  power: number;
  neonBoost: number;
  scalarGain: number;
  coherenceExponent: number;
  alphaEpsilon: number;
  maskHighlightWeight: number;
  maskEdgeWeight: number;
  tensorParameters: TensorR1CParameters;
}
```

### 15.2 Forbidden public fields

Canonical final request에서 다음 key가 존재하면 fail한다.

```text
qmap
qmapTexture
qmapTex
scalar
scalarTexture
alphaDepth
alphaDepthTexture
highlight
highlightTexture
maskEdge
edgeTexture
legacyDeltaETexture
retainCandidate
```

Request가 texture object를 갖지 않도록 한다.

## 16. Effect Field Set receipt

```ts
interface BakemonoRinneCanonicalFieldSetReceiptWgsl06 {
  schemaVersion: 1;
  schemaId: 'tdt.effect.bakemono-rinne.canonical-field-set-receipt.wgsl06.v1';
  authorityId: 'tdt.effect.bakemono-rinne.canonical-field-set-authority.wgsl06.v1';
  consumerId: 'dadum.gpu.consumer.bakemono-rinne-wgsl-06';
  operationId: string;
  sourceSurfaceId: string;
  sourceRevision: number;
  deviceEpoch: number;
  deviceIdentityDigest: string;

  qmapFieldId: string;
  qmapGeneration: number;
  qmapSemanticId: 'tdt.analysis.qmap.normalized-response.v1';
  qmapExecutionReceiptDigest: string;
  qmapFieldSetDigest: string;
  qmapDescriptorDigest: string;

  qwaveFieldId: string;
  qwaveGeneration: number;
  qwaveSemanticId: 'tdt.analysis.qwave.real-delta-k-compat.v1';
  qwaveExecutionReceiptDigest: string;
  qwaveFieldSetDigest: string;
  qwaveDescriptorDigest: string;

  minimumClaimLevel: 'EFFECTIVE_EXECUTION';
  pinCount: 2;
  callerSuppliedTextureCount: 0;
  intermediateReadbackCount: 0;
  receiptDigest: string;
}
```

Pin ID는 ephemeral lifecycle token이므로 stable field set digest body에 직접 포함하지 않는다.

## 17. Graph binding and pin lifecycle

### 17.1 Binding sequence

```text
fieldSet = resolve canonical fields
fieldSet.bindToGraph(graph)
record terminal R1C
record WGSL-06 effect
select WGSL-05 Final Texture
submit graph
completion callback releases pins
```

### 17.2 State machine

```text
ACQUIRED
  -> bindToGraph()
BOUND
  -> graph completion
RELEASED

ACQUIRED
  -> pre-submit error cleanup
RELEASED
```

### 17.3 Device loss

Device loss 시 Analysis Field Authority가 fields를 invalidate한다. Graph completion callback은 release를 idempotent하게 수행한다. Stale pin을 다음 operation에서 재사용하지 않는다.

### 17.4 Pin release order

```text
qmap pin release
qwave pin release
field set state = RELEASED
```

순서는 receipt에 기록하되 semantic correctness는 순서에 의존하지 않는다.

## 18. Pipeline family

WGSL-06은 canonical pipeline family count를 늘리지 않는다. 기존 네 번째 Bakemono/Rinne family를 v2로 교체한다.

```text
Canonical pipeline families = 4

1 EWA
2 Tensor R1C
3 Adaptive Policy R1D
4 Bakemono/Rinne WGSL-06 authority-field family
```

Effect family v2 contains:

- bind group layout v2
- generated WGSL-06 effect shader
- uniform ABI manifest
- pipeline identity digest
- qmap semantic digest
- qwave semantic digest
- derived mask profile digest

Operation-specific field handles and receipts는 pipeline build key에 포함하지 않는다. Dispatch receipt에 포함한다.

## 19. Dispatch receipt extension

WGSL-06 effect dispatch receipt는 다음을 추가한다.

```text
canonicalFieldSetReceiptDigest
qmapExecutionReceiptDigest
qwaveExecutionReceiptDigest
qmapSemanticDigest
qwaveSemanticDigest
derivedMaskProfileId
qwaveMappingId
callerSuppliedTextureCount = 0
analysisFieldPinCount = 2
manualBilinearFieldCount = 2
legacyMaskTextureCount = 0
legacyDeltaETextureCount = 0
```

WGSL-04의 direct input `inputSetDigest`는 WGSL-06에서 authority field set digest로 대체한다.

## 20. WGSL-05 Final Texture receipt extension

Canonical final output receipt에 다음 lineage를 추가한다.

```text
canonicalEffectFieldSetReceiptDigest
qmapExecutionReceiptDigest
qwaveExecutionReceiptDigest
derivedMaskProfileId
qwaveMappingId
```

Final Texture adoption logic 자체는 바꾸지 않는다. Adoption candidate의 lineage를 확장한다.

## 21. Surface Registry and shared consumption evidence

Surface Registry GPU surface evidence에 다음을 포함한다.

```text
inputAuthority = CANONICAL_EFFECT_FIELD_SET
canonicalEffectFieldSetReceiptDigest
qmapFieldGeneration
qwaveFieldGeneration
qmapExecutionReceiptDigest
qwaveExecutionReceiptDigest
callerSuppliedEffectTextureCount = 0
```

Preview and Export tuple equality에는 다음 digest도 포함한다.

```text
canonicalEffectFieldSetReceiptDigest
```

Preview와 Export가 동일 final surface를 소비하면서 서로 다른 field set lineage를 주장하는 것을 금지한다.

## 22. Compatibility boundary

### 22.1 WGSL-02 compatibility shadow

다음 direct textures를 유지할 수 있다.

```text
qmap
legacy DeltaE
alphaDepth
highlight
edge
```

단, authority는 `SHADOW_ONLY`다.

### 22.2 WGSL-03/04 canonical ABI v1

Regression and physical comparison에만 유지한다. Product final admission은 false다.

### 22.3 WGSL-06 canonical final

- Analysis Field Authority required
- QMap canonical producer required
- Q-wave analytic producer required
- direct effect textures forbidden
- legacy masks forbidden
- legacy DeltaE forbidden

## 23. Stable error codes

```text
E_BKR06_ANALYSIS_AUTHORITY_UNAVAILABLE
E_BKR06_CONSUMER_REGISTRATION_MISSING
E_BKR06_CONSUMER_REGISTRATION_COLLISION
E_BKR06_QMAP_SEMANTIC_MISSING
E_BKR06_QMAP_PRODUCER_NOT_PROMOTED
E_BKR06_QMAP_FIELD_REQUIRED
E_BKR06_QMAP_FIELD_STALE
E_BKR06_QMAP_FIELD_FORMAT
E_BKR06_QMAP_RANGE_UNPROVEN
E_BKR06_QWAVE_FIELD_REQUIRED
E_BKR06_QWAVE_FIELD_STALE
E_BKR06_QWAVE_FIELD_FORMAT
E_BKR06_QWAVE_MAPPING_MISMATCH
E_BKR06_ANALYSIS_CLAIM_INSUFFICIENT
E_BKR06_SOURCE_SURFACE_MISMATCH
E_BKR06_SOURCE_REVISION_MISMATCH
E_BKR06_DEVICE_EPOCH_MISMATCH
E_BKR06_FIELD_RECEIPT_INVALID
E_BKR06_FIELD_SET_INCOMPLETE
E_BKR06_FIELD_SET_ALIAS
E_BKR06_FIELD_PIN_REQUIRED
E_BKR06_FIELD_PIN_RELEASED
E_BKR06_FIELD_RELEASE_ORDER
E_BKR06_CALLER_TEXTURE_FORBIDDEN
E_BKR06_DUAL_INPUT_AUTHORITY
E_BKR06_LEGACY_DELTAE_FINAL_FORBIDDEN
E_BKR06_LEGACY_MASK_FINAL_FORBIDDEN
E_BKR06_CANONICAL_ABI_MISMATCH
E_BKR06_DERIVED_MASK_PROFILE_MISMATCH
E_BKR06_TERMINAL_R1C_REQUIRED
E_BKR06_TERMINAL_ALPHA_INVALID
E_BKR06_NONFINITE_FIELD_SAMPLE
E_BKR06_GRAPH_ALREADY_SUBMITTED
E_BKR06_INTERMEDIATE_READBACK_FORBIDDEN
E_BKR06_FINAL_LINEAGE_MISSING
```

## 24. Source file targets

### 24.1 New files

```text
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_06_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_06_field_authority.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_06_params.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_06_pipeline_family.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_06_graph_effect.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_06_receipt.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/bakemono_rinne_fusion_authority_fields_v2.generated.wgsl
app/src/runtime/effects/bakemono-rinne/bakemono-rinne-wgsl-06-types.ts
```

### 24.2 Modified files

```text
app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_04_pipeline_family.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_05_adoption.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_05_identity.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_05_receipt.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_scalar_profiles.mjs
app/src/runtime/analysis/analysis-field-authority-service.ts
app/src/runtime/analysis/generated/generated-analysis-semantic-registry.json
app/src/runtime/analysis/generated/generated-analysis-producer-inventory.json
tools/analysis-field-truth-00/generate-semantic-registry.mjs
tools/analysis-field-truth-00/generate-producer-inventory.mjs
app/src/runtime/active-graph/generated-active-runtime-graph.json
```

### 24.3 Tooling and gates

```text
tools/verify_bakemono_rinne_wgsl_06_source.mjs
tools/test_bakemono_rinne_wgsl_06_negative.mjs
tools/test_bakemono_rinne_wgsl_06_field_authority.mjs
tools/test_bakemono_rinne_wgsl_06_sampling_oracle.mjs
tools/run_bakemono_rinne_wgsl_06_physical.mjs
```

## 25. Source gates

Source Gate total: `256`

| Gate group | Count |
|---|---:|
| Parent authority preservation | 24 |
| Analysis semantic and producer registry | 32 |
| Consumer registration and field acquisition | 32 |
| Source revision and device convergence | 32 |
| Canonical ABI v2 and generated WGSL | 40 |
| Derived mask and Q-wave mapping | 32 |
| Pin lifecycle and command graph integration | 32 |
| Receipt, Final Surface, Preview·Export lineage | 32 |
| **Total** | **256** |

### 25.1 Parent preservation gates

- WGSL-01 formula authority digest unchanged
- WGSL-02 compatibility kernel digest unchanged
- WGSL-03 terminal R1C shader digest set unchanged
- WGSL-04 lambda2 qualification authority unchanged
- WGSL-05 Final Texture adoption state machine unchanged
- pipeline family count remains four
- command graph single-submit contract unchanged
- no raw legacy tensor passage remains true

### 25.2 Semantic registry gates

- Q-map semantic present exactly once
- semantic digest reproducible
- interpolation policy is linear
- neutral value exact
- Q-wave semantic unchanged
- Q-wave producer remains canonical
- Q-map producer ID explicit
- no future or compatibility producer admitted as canonical final

### 25.3 Field acquisition gates

- consumer registered once
- accepted semantics exact
- requireField uses exact sourceSurfaceId and revision
- minimum claim exact
- execution receipt terminal state published
- effectiveExecution true
- pin count exactly two
- public request GPUTexture count zero

### 25.4 ABI gates

- six bindings exactly
- removed mask bindings absent
- output binding rgba16float
- manual bilinear functions generated once
- Q-wave mapping uses R, G, A
- B channel unused
- alphaDepth reads base alpha
- highlight uses linear straight luminance
- edge reads terminal R1C A
- coherence reads terminal R1C B

### 25.5 Lifetime gates

- pins live before recording
- pins remain live through submit
- graph onComplete owns release
- pre-submit error releases immediately
- release idempotent
- device loss release safe
- field handle replay rejected
- stale generation rejected

## 26. Physical gates

Physical Gate total: `80`

| Physical group | Count |
|---|---:|
| WebGPU pipeline compilation and ABI | 12 |
| Q-map field acquisition and sampling | 12 |
| Q-wave field acquisition and mapping | 12 |
| Derived mask pixel oracle | 12 |
| Pin lifetime, submit, device loss | 12 |
| Final Surface, Preview, Export convergence | 12 |
| Performance and zero-readback | 8 |
| **Total** | **80** |

### 26.1 Sampling fixtures

- identical field and output size
- qmap smaller than output
- qmap larger than output
- qwave smaller than output
- qwave larger than output
- 1×1 neutral field
- edge-clamped border pixels
- half-texel phase pattern
- checker field
- ramp field
- confidence zero
- validity zero

### 26.2 Derived mask fixtures

- alpha zero hidden RGB
- alpha one white
- alpha half premultiplied color
- black pixel
- neutral gray
- saturated primary colors
- R1C edge zero
- R1C edge one
- coherence zero
- coherence one
- nonfinite R1C sample
- nonfinite qwave sample

### 26.3 Physical completion condition

```text
Q-map and Q-wave are Analysis Field Authority pins
AND
caller-supplied effect texture count = 0
AND
Q-wave mapping matches CPU f32 oracle
AND
derived masks match CPU f32 oracle
AND
returned terminalTexture is WGSL-06 effect output
AND
Preview and Export consume identical field set receipt digest
AND
commandEncoderCount = 1
AND
queueSubmitCount = 1
AND
intermediateReadbackCount = 0
AND
all pins are released after completion
```

## 27. Negative controls

Negative-control mutant total: `72`

| Mutant group | Count |
|---|---:|
| Authority and semantic mutants | 16 |
| Source lineage and epoch mutants | 12 |
| Q-wave mapping mutants | 12 |
| Derived mask mutants | 12 |
| ABI and direct texture mutants | 12 |
| Pin lifetime and receipt mutants | 8 |
| **Total** | **72** |

Required rejected mutants include:

- remove Q-map semantic from registry
- use Effect semantic ID instead of Analysis semantic ID
- admit Q-map `PRESENT_ONLY`
- use compatibility Q-wave producer
- ignore Q-wave confidence
- ignore Q-wave validity
- use reserved B as scalar
- apply scalarGain twice
- bind legacy DeltaE in final mode
- restore alphaDepth texture binding
- restore highlight texture binding
- restore edge texture binding
- derive highlight from encoded RGB
- derive highlight from premultiplied RGB without unpremultiply
- read edge from separate mask texture
- read coherence from wrong channel
- reuse stale field generation
- use different sourceRevision for qmap
- use different sourceSurfaceId for qwave
- release pin before submit
- never release pin
- accept caller qmapTexture and field handle together
- use neutral texture fallback when field missing
- change six-binding ABI back to nine bindings

## 28. Completion states

### 28.1 Source-only completion

```text
SOURCE_BAKED_AWAITING_QMAP_PRODUCER_AND_PHYSICAL_GPU
```

This state is used when:

- source gates pass
- canonical ABI v2 is implemented
- Analysis Field consumer and pin path is implemented
- Q-map semantic is registered
- but no promoted Q-map producer has an effective execution receipt in the current environment

### 28.2 Source complete with promoted producer

```text
SOURCE_BAKED_AWAITING_PHYSICAL_GPU
```

### 28.3 Physical pass

```text
PHYSICAL_CANONICAL_FIELD_AUTHORITY_FINAL_PASS
```

### 28.4 Fail

```text
FAIL
```

## 29. Admission matrix

| Mode | Q-map source | scalar source | masks | Final Texture admission |
|---|---|---|---|---:|
| WGSL-02 compatibility shadow | direct compatibility texture | Legacy DeltaE or fixture | direct legacy textures | no |
| WGSL-03/04 canonical shadow v1 | direct descriptor | direct descriptor | direct descriptor | no |
| WGSL-06 canonical final v2 | Analysis Field Authority | Q-wave Analysis Field Authority | base and R1C derived | yes |
| missing Q-map authority | none | any | any | fail |
| stale Q-wave generation | any | stale | any | fail |
| caller direct texture plus authority field | dual | dual | any | fail |

## 30. Bake order

```text
1. Add Q-map semantic generator entry
2. Add Q-map producer inventory entry with explicit selected implementation
3. Regenerate semantic registry and producer inventory
4. Register WGSL-06 Analysis Field consumer
5. Implement field set resolver and opaque pin handle
6. Implement generated canonical ABI v2 WGSL
7. Implement WGSL-06 pipeline family
8. Replace WGSL-04 canonical final recorder with WGSL-06 recorder
9. Bind pin release to graph.onComplete
10. Extend WGSL-05 candidate and Final Texture receipts
11. Extend Surface Registry evidence and shared consumption tuple
12. Run 256 Source Gates
13. Run 72 negative controls
14. Run parent WGSL-01 to WGSL-05 regressions
15. Run physical 80-gate harness where Electron WebGPU is available
```

## 31. 완료 봉인

WGSL-06 is complete only when the following statement is true.

```text
Bakemono/Rinne canonical final output consumes no caller-provided effect textures.
Its Q-map and Q-wave inputs are pinned Analysis Field Authority resources with exact
source revision and device epoch lineage. Alpha-depth, highlight, edge, and coherence
are derived from the canonical Final EWA base and terminal integrated R1C field inside
the single R9A command graph. The adopted Final Texture, Surface Registry record,
Preview receipt, and Export receipt all carry the same canonical field set digest.
```

No missing field may be replaced by a quiet neutral texture. No legacy DeltaE or mask texture may enter `CANONICAL_FINAL`. No field pin may be released before submission completion.

## Appendix A. Source Gate IDs

### A.PARENT

- `BKR06-SRC-PARENT-001`
- `BKR06-SRC-PARENT-002`
- `BKR06-SRC-PARENT-003`
- `BKR06-SRC-PARENT-004`
- `BKR06-SRC-PARENT-005`
- `BKR06-SRC-PARENT-006`
- `BKR06-SRC-PARENT-007`
- `BKR06-SRC-PARENT-008`
- `BKR06-SRC-PARENT-009`
- `BKR06-SRC-PARENT-010`
- `BKR06-SRC-PARENT-011`
- `BKR06-SRC-PARENT-012`
- `BKR06-SRC-PARENT-013`
- `BKR06-SRC-PARENT-014`
- `BKR06-SRC-PARENT-015`
- `BKR06-SRC-PARENT-016`
- `BKR06-SRC-PARENT-017`
- `BKR06-SRC-PARENT-018`
- `BKR06-SRC-PARENT-019`
- `BKR06-SRC-PARENT-020`
- `BKR06-SRC-PARENT-021`
- `BKR06-SRC-PARENT-022`
- `BKR06-SRC-PARENT-023`
- `BKR06-SRC-PARENT-024`

### A.REGISTRY

- `BKR06-SRC-REGISTRY-001`
- `BKR06-SRC-REGISTRY-002`
- `BKR06-SRC-REGISTRY-003`
- `BKR06-SRC-REGISTRY-004`
- `BKR06-SRC-REGISTRY-005`
- `BKR06-SRC-REGISTRY-006`
- `BKR06-SRC-REGISTRY-007`
- `BKR06-SRC-REGISTRY-008`
- `BKR06-SRC-REGISTRY-009`
- `BKR06-SRC-REGISTRY-010`
- `BKR06-SRC-REGISTRY-011`
- `BKR06-SRC-REGISTRY-012`
- `BKR06-SRC-REGISTRY-013`
- `BKR06-SRC-REGISTRY-014`
- `BKR06-SRC-REGISTRY-015`
- `BKR06-SRC-REGISTRY-016`
- `BKR06-SRC-REGISTRY-017`
- `BKR06-SRC-REGISTRY-018`
- `BKR06-SRC-REGISTRY-019`
- `BKR06-SRC-REGISTRY-020`
- `BKR06-SRC-REGISTRY-021`
- `BKR06-SRC-REGISTRY-022`
- `BKR06-SRC-REGISTRY-023`
- `BKR06-SRC-REGISTRY-024`
- `BKR06-SRC-REGISTRY-025`
- `BKR06-SRC-REGISTRY-026`
- `BKR06-SRC-REGISTRY-027`
- `BKR06-SRC-REGISTRY-028`
- `BKR06-SRC-REGISTRY-029`
- `BKR06-SRC-REGISTRY-030`
- `BKR06-SRC-REGISTRY-031`
- `BKR06-SRC-REGISTRY-032`

### A.ACQUIRE

- `BKR06-SRC-ACQUIRE-001`
- `BKR06-SRC-ACQUIRE-002`
- `BKR06-SRC-ACQUIRE-003`
- `BKR06-SRC-ACQUIRE-004`
- `BKR06-SRC-ACQUIRE-005`
- `BKR06-SRC-ACQUIRE-006`
- `BKR06-SRC-ACQUIRE-007`
- `BKR06-SRC-ACQUIRE-008`
- `BKR06-SRC-ACQUIRE-009`
- `BKR06-SRC-ACQUIRE-010`
- `BKR06-SRC-ACQUIRE-011`
- `BKR06-SRC-ACQUIRE-012`
- `BKR06-SRC-ACQUIRE-013`
- `BKR06-SRC-ACQUIRE-014`
- `BKR06-SRC-ACQUIRE-015`
- `BKR06-SRC-ACQUIRE-016`
- `BKR06-SRC-ACQUIRE-017`
- `BKR06-SRC-ACQUIRE-018`
- `BKR06-SRC-ACQUIRE-019`
- `BKR06-SRC-ACQUIRE-020`
- `BKR06-SRC-ACQUIRE-021`
- `BKR06-SRC-ACQUIRE-022`
- `BKR06-SRC-ACQUIRE-023`
- `BKR06-SRC-ACQUIRE-024`
- `BKR06-SRC-ACQUIRE-025`
- `BKR06-SRC-ACQUIRE-026`
- `BKR06-SRC-ACQUIRE-027`
- `BKR06-SRC-ACQUIRE-028`
- `BKR06-SRC-ACQUIRE-029`
- `BKR06-SRC-ACQUIRE-030`
- `BKR06-SRC-ACQUIRE-031`
- `BKR06-SRC-ACQUIRE-032`

### A.LINEAGE

- `BKR06-SRC-LINEAGE-001`
- `BKR06-SRC-LINEAGE-002`
- `BKR06-SRC-LINEAGE-003`
- `BKR06-SRC-LINEAGE-004`
- `BKR06-SRC-LINEAGE-005`
- `BKR06-SRC-LINEAGE-006`
- `BKR06-SRC-LINEAGE-007`
- `BKR06-SRC-LINEAGE-008`
- `BKR06-SRC-LINEAGE-009`
- `BKR06-SRC-LINEAGE-010`
- `BKR06-SRC-LINEAGE-011`
- `BKR06-SRC-LINEAGE-012`
- `BKR06-SRC-LINEAGE-013`
- `BKR06-SRC-LINEAGE-014`
- `BKR06-SRC-LINEAGE-015`
- `BKR06-SRC-LINEAGE-016`
- `BKR06-SRC-LINEAGE-017`
- `BKR06-SRC-LINEAGE-018`
- `BKR06-SRC-LINEAGE-019`
- `BKR06-SRC-LINEAGE-020`
- `BKR06-SRC-LINEAGE-021`
- `BKR06-SRC-LINEAGE-022`
- `BKR06-SRC-LINEAGE-023`
- `BKR06-SRC-LINEAGE-024`
- `BKR06-SRC-LINEAGE-025`
- `BKR06-SRC-LINEAGE-026`
- `BKR06-SRC-LINEAGE-027`
- `BKR06-SRC-LINEAGE-028`
- `BKR06-SRC-LINEAGE-029`
- `BKR06-SRC-LINEAGE-030`
- `BKR06-SRC-LINEAGE-031`
- `BKR06-SRC-LINEAGE-032`

### A.ABI

- `BKR06-SRC-ABI-001`
- `BKR06-SRC-ABI-002`
- `BKR06-SRC-ABI-003`
- `BKR06-SRC-ABI-004`
- `BKR06-SRC-ABI-005`
- `BKR06-SRC-ABI-006`
- `BKR06-SRC-ABI-007`
- `BKR06-SRC-ABI-008`
- `BKR06-SRC-ABI-009`
- `BKR06-SRC-ABI-010`
- `BKR06-SRC-ABI-011`
- `BKR06-SRC-ABI-012`
- `BKR06-SRC-ABI-013`
- `BKR06-SRC-ABI-014`
- `BKR06-SRC-ABI-015`
- `BKR06-SRC-ABI-016`
- `BKR06-SRC-ABI-017`
- `BKR06-SRC-ABI-018`
- `BKR06-SRC-ABI-019`
- `BKR06-SRC-ABI-020`
- `BKR06-SRC-ABI-021`
- `BKR06-SRC-ABI-022`
- `BKR06-SRC-ABI-023`
- `BKR06-SRC-ABI-024`
- `BKR06-SRC-ABI-025`
- `BKR06-SRC-ABI-026`
- `BKR06-SRC-ABI-027`
- `BKR06-SRC-ABI-028`
- `BKR06-SRC-ABI-029`
- `BKR06-SRC-ABI-030`
- `BKR06-SRC-ABI-031`
- `BKR06-SRC-ABI-032`
- `BKR06-SRC-ABI-033`
- `BKR06-SRC-ABI-034`
- `BKR06-SRC-ABI-035`
- `BKR06-SRC-ABI-036`
- `BKR06-SRC-ABI-037`
- `BKR06-SRC-ABI-038`
- `BKR06-SRC-ABI-039`
- `BKR06-SRC-ABI-040`

### A.DERIVE

- `BKR06-SRC-DERIVE-001`
- `BKR06-SRC-DERIVE-002`
- `BKR06-SRC-DERIVE-003`
- `BKR06-SRC-DERIVE-004`
- `BKR06-SRC-DERIVE-005`
- `BKR06-SRC-DERIVE-006`
- `BKR06-SRC-DERIVE-007`
- `BKR06-SRC-DERIVE-008`
- `BKR06-SRC-DERIVE-009`
- `BKR06-SRC-DERIVE-010`
- `BKR06-SRC-DERIVE-011`
- `BKR06-SRC-DERIVE-012`
- `BKR06-SRC-DERIVE-013`
- `BKR06-SRC-DERIVE-014`
- `BKR06-SRC-DERIVE-015`
- `BKR06-SRC-DERIVE-016`
- `BKR06-SRC-DERIVE-017`
- `BKR06-SRC-DERIVE-018`
- `BKR06-SRC-DERIVE-019`
- `BKR06-SRC-DERIVE-020`
- `BKR06-SRC-DERIVE-021`
- `BKR06-SRC-DERIVE-022`
- `BKR06-SRC-DERIVE-023`
- `BKR06-SRC-DERIVE-024`
- `BKR06-SRC-DERIVE-025`
- `BKR06-SRC-DERIVE-026`
- `BKR06-SRC-DERIVE-027`
- `BKR06-SRC-DERIVE-028`
- `BKR06-SRC-DERIVE-029`
- `BKR06-SRC-DERIVE-030`
- `BKR06-SRC-DERIVE-031`
- `BKR06-SRC-DERIVE-032`

### A.LIFETIME

- `BKR06-SRC-LIFETIME-001`
- `BKR06-SRC-LIFETIME-002`
- `BKR06-SRC-LIFETIME-003`
- `BKR06-SRC-LIFETIME-004`
- `BKR06-SRC-LIFETIME-005`
- `BKR06-SRC-LIFETIME-006`
- `BKR06-SRC-LIFETIME-007`
- `BKR06-SRC-LIFETIME-008`
- `BKR06-SRC-LIFETIME-009`
- `BKR06-SRC-LIFETIME-010`
- `BKR06-SRC-LIFETIME-011`
- `BKR06-SRC-LIFETIME-012`
- `BKR06-SRC-LIFETIME-013`
- `BKR06-SRC-LIFETIME-014`
- `BKR06-SRC-LIFETIME-015`
- `BKR06-SRC-LIFETIME-016`
- `BKR06-SRC-LIFETIME-017`
- `BKR06-SRC-LIFETIME-018`
- `BKR06-SRC-LIFETIME-019`
- `BKR06-SRC-LIFETIME-020`
- `BKR06-SRC-LIFETIME-021`
- `BKR06-SRC-LIFETIME-022`
- `BKR06-SRC-LIFETIME-023`
- `BKR06-SRC-LIFETIME-024`
- `BKR06-SRC-LIFETIME-025`
- `BKR06-SRC-LIFETIME-026`
- `BKR06-SRC-LIFETIME-027`
- `BKR06-SRC-LIFETIME-028`
- `BKR06-SRC-LIFETIME-029`
- `BKR06-SRC-LIFETIME-030`
- `BKR06-SRC-LIFETIME-031`
- `BKR06-SRC-LIFETIME-032`

### A.FINAL

- `BKR06-SRC-FINAL-001`
- `BKR06-SRC-FINAL-002`
- `BKR06-SRC-FINAL-003`
- `BKR06-SRC-FINAL-004`
- `BKR06-SRC-FINAL-005`
- `BKR06-SRC-FINAL-006`
- `BKR06-SRC-FINAL-007`
- `BKR06-SRC-FINAL-008`
- `BKR06-SRC-FINAL-009`
- `BKR06-SRC-FINAL-010`
- `BKR06-SRC-FINAL-011`
- `BKR06-SRC-FINAL-012`
- `BKR06-SRC-FINAL-013`
- `BKR06-SRC-FINAL-014`
- `BKR06-SRC-FINAL-015`
- `BKR06-SRC-FINAL-016`
- `BKR06-SRC-FINAL-017`
- `BKR06-SRC-FINAL-018`
- `BKR06-SRC-FINAL-019`
- `BKR06-SRC-FINAL-020`
- `BKR06-SRC-FINAL-021`
- `BKR06-SRC-FINAL-022`
- `BKR06-SRC-FINAL-023`
- `BKR06-SRC-FINAL-024`
- `BKR06-SRC-FINAL-025`
- `BKR06-SRC-FINAL-026`
- `BKR06-SRC-FINAL-027`
- `BKR06-SRC-FINAL-028`
- `BKR06-SRC-FINAL-029`
- `BKR06-SRC-FINAL-030`
- `BKR06-SRC-FINAL-031`
- `BKR06-SRC-FINAL-032`

## Appendix B. Physical Gate IDs

### B.PIPELINE

- `BKR06-PHY-PIPELINE-001`
- `BKR06-PHY-PIPELINE-002`
- `BKR06-PHY-PIPELINE-003`
- `BKR06-PHY-PIPELINE-004`
- `BKR06-PHY-PIPELINE-005`
- `BKR06-PHY-PIPELINE-006`
- `BKR06-PHY-PIPELINE-007`
- `BKR06-PHY-PIPELINE-008`
- `BKR06-PHY-PIPELINE-009`
- `BKR06-PHY-PIPELINE-010`
- `BKR06-PHY-PIPELINE-011`
- `BKR06-PHY-PIPELINE-012`

### B.QMAP

- `BKR06-PHY-QMAP-001`
- `BKR06-PHY-QMAP-002`
- `BKR06-PHY-QMAP-003`
- `BKR06-PHY-QMAP-004`
- `BKR06-PHY-QMAP-005`
- `BKR06-PHY-QMAP-006`
- `BKR06-PHY-QMAP-007`
- `BKR06-PHY-QMAP-008`
- `BKR06-PHY-QMAP-009`
- `BKR06-PHY-QMAP-010`
- `BKR06-PHY-QMAP-011`
- `BKR06-PHY-QMAP-012`

### B.QWAVE

- `BKR06-PHY-QWAVE-001`
- `BKR06-PHY-QWAVE-002`
- `BKR06-PHY-QWAVE-003`
- `BKR06-PHY-QWAVE-004`
- `BKR06-PHY-QWAVE-005`
- `BKR06-PHY-QWAVE-006`
- `BKR06-PHY-QWAVE-007`
- `BKR06-PHY-QWAVE-008`
- `BKR06-PHY-QWAVE-009`
- `BKR06-PHY-QWAVE-010`
- `BKR06-PHY-QWAVE-011`
- `BKR06-PHY-QWAVE-012`

### B.MASK

- `BKR06-PHY-MASK-001`
- `BKR06-PHY-MASK-002`
- `BKR06-PHY-MASK-003`
- `BKR06-PHY-MASK-004`
- `BKR06-PHY-MASK-005`
- `BKR06-PHY-MASK-006`
- `BKR06-PHY-MASK-007`
- `BKR06-PHY-MASK-008`
- `BKR06-PHY-MASK-009`
- `BKR06-PHY-MASK-010`
- `BKR06-PHY-MASK-011`
- `BKR06-PHY-MASK-012`

### B.PIN

- `BKR06-PHY-PIN-001`
- `BKR06-PHY-PIN-002`
- `BKR06-PHY-PIN-003`
- `BKR06-PHY-PIN-004`
- `BKR06-PHY-PIN-005`
- `BKR06-PHY-PIN-006`
- `BKR06-PHY-PIN-007`
- `BKR06-PHY-PIN-008`
- `BKR06-PHY-PIN-009`
- `BKR06-PHY-PIN-010`
- `BKR06-PHY-PIN-011`
- `BKR06-PHY-PIN-012`

### B.FINAL

- `BKR06-PHY-FINAL-001`
- `BKR06-PHY-FINAL-002`
- `BKR06-PHY-FINAL-003`
- `BKR06-PHY-FINAL-004`
- `BKR06-PHY-FINAL-005`
- `BKR06-PHY-FINAL-006`
- `BKR06-PHY-FINAL-007`
- `BKR06-PHY-FINAL-008`
- `BKR06-PHY-FINAL-009`
- `BKR06-PHY-FINAL-010`
- `BKR06-PHY-FINAL-011`
- `BKR06-PHY-FINAL-012`

### B.PERF

- `BKR06-PHY-PERF-001`
- `BKR06-PHY-PERF-002`
- `BKR06-PHY-PERF-003`
- `BKR06-PHY-PERF-004`
- `BKR06-PHY-PERF-005`
- `BKR06-PHY-PERF-006`
- `BKR06-PHY-PERF-007`
- `BKR06-PHY-PERF-008`

## Appendix C. Negative Control IDs

### C.AUTH

- `BKR06-NEG-AUTH-001`
- `BKR06-NEG-AUTH-002`
- `BKR06-NEG-AUTH-003`
- `BKR06-NEG-AUTH-004`
- `BKR06-NEG-AUTH-005`
- `BKR06-NEG-AUTH-006`
- `BKR06-NEG-AUTH-007`
- `BKR06-NEG-AUTH-008`
- `BKR06-NEG-AUTH-009`
- `BKR06-NEG-AUTH-010`
- `BKR06-NEG-AUTH-011`
- `BKR06-NEG-AUTH-012`
- `BKR06-NEG-AUTH-013`
- `BKR06-NEG-AUTH-014`
- `BKR06-NEG-AUTH-015`
- `BKR06-NEG-AUTH-016`

### C.LINEAGE

- `BKR06-NEG-LINEAGE-001`
- `BKR06-NEG-LINEAGE-002`
- `BKR06-NEG-LINEAGE-003`
- `BKR06-NEG-LINEAGE-004`
- `BKR06-NEG-LINEAGE-005`
- `BKR06-NEG-LINEAGE-006`
- `BKR06-NEG-LINEAGE-007`
- `BKR06-NEG-LINEAGE-008`
- `BKR06-NEG-LINEAGE-009`
- `BKR06-NEG-LINEAGE-010`
- `BKR06-NEG-LINEAGE-011`
- `BKR06-NEG-LINEAGE-012`

### C.QWAVE

- `BKR06-NEG-QWAVE-001`
- `BKR06-NEG-QWAVE-002`
- `BKR06-NEG-QWAVE-003`
- `BKR06-NEG-QWAVE-004`
- `BKR06-NEG-QWAVE-005`
- `BKR06-NEG-QWAVE-006`
- `BKR06-NEG-QWAVE-007`
- `BKR06-NEG-QWAVE-008`
- `BKR06-NEG-QWAVE-009`
- `BKR06-NEG-QWAVE-010`
- `BKR06-NEG-QWAVE-011`
- `BKR06-NEG-QWAVE-012`

### C.MASK

- `BKR06-NEG-MASK-001`
- `BKR06-NEG-MASK-002`
- `BKR06-NEG-MASK-003`
- `BKR06-NEG-MASK-004`
- `BKR06-NEG-MASK-005`
- `BKR06-NEG-MASK-006`
- `BKR06-NEG-MASK-007`
- `BKR06-NEG-MASK-008`
- `BKR06-NEG-MASK-009`
- `BKR06-NEG-MASK-010`
- `BKR06-NEG-MASK-011`
- `BKR06-NEG-MASK-012`

### C.ABI

- `BKR06-NEG-ABI-001`
- `BKR06-NEG-ABI-002`
- `BKR06-NEG-ABI-003`
- `BKR06-NEG-ABI-004`
- `BKR06-NEG-ABI-005`
- `BKR06-NEG-ABI-006`
- `BKR06-NEG-ABI-007`
- `BKR06-NEG-ABI-008`
- `BKR06-NEG-ABI-009`
- `BKR06-NEG-ABI-010`
- `BKR06-NEG-ABI-011`
- `BKR06-NEG-ABI-012`

### C.PIN

- `BKR06-NEG-PIN-001`
- `BKR06-NEG-PIN-002`
- `BKR06-NEG-PIN-003`
- `BKR06-NEG-PIN-004`
- `BKR06-NEG-PIN-005`
- `BKR06-NEG-PIN-006`
- `BKR06-NEG-PIN-007`
- `BKR06-NEG-PIN-008`

