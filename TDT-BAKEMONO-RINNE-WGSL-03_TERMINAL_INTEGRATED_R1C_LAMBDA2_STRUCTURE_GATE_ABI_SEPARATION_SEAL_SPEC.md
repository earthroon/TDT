# TDT-BAKEMONO-RINNE-WGSL-03

## Terminal Integrated R1C Tensor /
## Final-EWA Resolution Tensor Reconstruction /
## Nonzero Lambda2 Physical Gate /
## Coherence·Edge Structure Gate /
## Compatibility·Canonical ABI Separation /
## No Raw Legacy Tensor Passage Seal

> 상태: 명세 rev.1
>
> 기준 일자: `2026-08-02`
>
> 기준 부모 번들: `66_TDT_BAKEMONO_RINNE_WGSL_02_COMPATIBILITY_COMPUTE_SHADOW_SOURCE_BAKED_AWAITING_PHYSICAL_GPU.zip`
>
> 부모 번들 SHA-256: `823835480cfa4e641fa5a2fe40a15c939f5f650d2f292232076f6db50aef1570`
>
> 부모 명세: `TDT-BAKEMONO-RINNE-WGSL-02_COMPATIBILITY_COMPUTE_EXACT_FORMULA_ABI_CPU_WEBGL_PARITY_SHADOW_DISPATCH_SEAL_SPEC.md`
>
> 부모 명세 SHA-256: `ddee01f03fb3463c4c1922bff2d809da3662dfd0303cc807e3623411ee2a3a84`
>
> WGSL-02 compatibility kernel SHA-256: `a3c851b3188c31a7a2f71d5723e356ff385d9c6fc0372140f5d891dec58f27ff`
>
> R9A runtime source SHA-256: `f0f47bcd2fe23e98b7ed46a3744d75a2e823e0ecf84ed47eb45f51aae1606ccf`
>
> 기존 Tensor admission source SHA-256: `3f442a09ff9ac7593b025c56e94706adc10e5fc4bb49722c9a06652e251480e8`
>
> 패치 역할: Final EWA 결과와 동일한 픽셀 격자에서 integrated R1C tensor를 다시 구성하고, 물리 GPU에서 lambda2가 실제로 0이 아닌 구조 fixture를 증명한 뒤, coherence와 edge로 바케모노·린네 효과량을 게이팅하는 별도 Canonical Shadow ABI를 만든다.
>
> 이번 패치는 R9A 제품 command graph 본선 채택, Canonical Final Texture 교체, Preview·Export 승격을 수행하지 않는다. 해당 범위는 `WGSL-04`, `WGSL-05`, `WGSL-07`에서 닫는다.
>
> 원칙: `per-pixel outer product != integrated structure tensor`, `stage-local tensor != terminal tensor`, `metadata claim != physical lambda2 qualification evidence`, `compatibility ABI != canonical ABI`, `tensor texture handle != raw GPUTexture admission`, `shadow canonical candidate != final texture authority`.

---

# 0. 목적

WGSL-02는 레거시 `rinne_bakemono_fusion_frag.glsl`의 실제 실행 수식을 WebGPU compute kernel로 이식했다.

WGSL-02 kernel은 다음을 증명하기 위한 호환 커널이다.

```text
legacy formula
→ exact WGSL compatibility implementation
→ CPU-f32 / WebGL parity
→ rgba16float shadow candidate
```

그러나 WGSL-02는 의도적으로 Tensor를 소비하지 않는다.

그 이유는 명확하다.

```text
legacy fusion formula
= Tensor gate 없음

WGSL-02 compatibility parity
= legacy formula를 그대로 복제

R1C structure gate
= 현대 다듬다듬 Canonical profile의 의미 추가
```

Tensor를 WGSL-02 ABI에 조용히 추가하면 compatibility parity와 canonical behavior가 섞인다.

그 상태에서는 출력 차이가 다음 중 무엇 때문인지 판정할 수 없다.

- GLSL-to-WGSL 번역 오차
- 색공간 adapter 오차
- scalar profile 차이
- Tensor reconstruction 차이
- coherence·edge gate 차이

WGSL-03의 목적은 이 혼합을 금지하고 두 경로를 명시적으로 분리하는 것이다.

```text
WGSL-02
= LEGACY_FUSION_COMPAT_SHADOW
= Tensor 없음
= 레거시 parity authority

WGSL-03
= R1C_GATED_CANONICAL_SHADOW
= Terminal Integrated R1C 필수
= 현대 구조 게이트 authority
```

WGSL-03 완료는 다음을 의미한다.

1. Final EWA terminal texture와 동일한 width·height에서 R1C Tensor가 재구성된다.
2. Tensor producer는 `gradient → outer → blurH → blurV → eigen → axial` 순서를 보존한다.
3. 바케모노·린네 Canonical kernel은 raw tensor matrix가 아니라 admitted tangent/coherence/edge field만 소비한다.
4. 물리 GPU fixture에서 corner와 junction의 `lambda2 > epsilon`이 증명된다.
5. blur 제거 mutant는 lambda2 gate를 통과하지 못한다.
6. structure gate는 coherence와 edge의 명시된 식으로만 계산된다.
7. Canonical kernel은 WGSL-02와 다른 kernel ID, ABI ID, bind group layout, profile ID를 가진다.
8. Canonical output은 여전히 Shadow Candidate이며 Final Texture가 아니다.

---

# 1. 범위

## 1.1 포함

- Final EWA terminal texture descriptor 계약
- terminal-resolution R1C tensor recorder
- integrated tensor texture 수명주기
- tangent/coherence/edge field packing
- terminal tensor admission token
- lambda2 validation probe WGSL
- bounded physical readback harness
- straight edge, L-corner, cross-junction fixture
- blur 제거 및 fake integration negative controls
- R1C-gated Canonical WGSL kernel generator
- Canonical 9-binding ABI v1
- compatibility ABI와 canonical ABI의 상호 오입장 거절
- coherence·edge structure gate
- gate identity, zero, monotonicity fixture
- Canonical Shadow dispatcher
- Tensor producer, lambda2, admission, kernel, dispatch receipt
- source gate
- physical gate
- negative-control gate

## 1.2 제외

- R9A command graph 본선 import
- `executeCanonicalEwaLowpassR9A()` 내부 pass 기록
- R9A 전체 single encoder·single submit 제품 주장
- Canonical Final Texture 교체
- Surface Registry publish
- Preview Presenter 소비
- Export Authority 소비
- Q-wave Real DeltaK live product binding
- highlight mask canonical derivation
- alpha-depth canonical derivation
- WebGL runtime 퇴역
- corrected color science profile
- CIEDE2000 field 생성
- ICC CMYK profile
- device-loss rebuild participant 등록
- long-run residency plateau

## 1.3 후속 패치 경계

```text
WGSL-04
= terminal R1C recorder와 canonical effect recorder를
  R9A command graph 안에 삽입
= 전체 one encoder / one submit

WGSL-05
= canonical effect output을 terminalTexture 권위로 승격

WGSL-06
= product q-map, Q-wave DeltaK,
  canonical alpha-depth, highlight, mask binding

WGSL-07
= Preview와 Export의 동일 surface convergence
```

---

# 2. 부모 SSOT 상속

## 2.1 WGSL-01 상속

다음 Formula·Color·Phase authority는 변경하지 않는다.

```yaml
formulaId: tdt.effect.bakemono-rinne.formula.legacy-fusion-compat.v1
colorContractId: tdt.effect.bakemono-rinne.color.legacy-encoded-matrix-compat.v1
surfaceAdapterId: tdt.effect.bakemono-rinne.surface-adapter.linear-premul-legacy-straight.v1
phaseContractId: tdt.effect.bakemono-rinne.phase.deterministic.v1
phaseWrapMode: MOD_6_283_COMPAT
```

다음 R1C Tensor authority를 상속한다.

```yaml
tensorSemanticId: tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
tensorPackingId: tdt.tensor.tangent-coherence-edge.rgba.v1
tensorAdmissionId: tdt.effect.bakemono-rinne.tensor-admission.terminal-r1c.v1
tensorMode: canonical-terminal-r1c
coordinateMapping: IDENTITY_OUTPUT_PIXEL
```

## 2.2 WGSL-02 상속

다음 compatibility identity는 그대로 보존한다.

```yaml
compatKernelId: tdt.effect.bakemono-rinne.kernel.wgsl.compat-shadow.v1
compatKernelAbiId: tdt.effect.bakemono-rinne.abi.compat-shadow.v1
compatPipelineFamilyId: tdt.pipeline.bakemono-rinne.compat-shadow.wgsl02.v1
compatOutputSemanticId: tdt.surface.bakemono-rinne.compat-shadow-candidate.linear-premul.v1
compatOutputAuthority: SHADOW_ONLY
compatUniformBytes: 128
compatBindingCount: 8
```

WGSL-03은 WGSL-02 kernel source를 수정하지 않는다.

WGSL-03은 WGSL-02 ABI의 binding을 추가하거나 의미를 바꾸지 않는다.

## 2.3 R1C shader digest set

Terminal R1C producer가 사용할 shader byte identity는 다음과 같다.

```yaml
gradient: 8684b23a8ce508cdc3f924c33d1aa953d9f7f385caf5946f9abde60a0125d523
outer: 9f5efaf050770153aff11f8ac75fc23e58be0dd645bf447bfbb77b5db46acab7
blurH: 3a61bff829b29a8cfee2a6cd034f80c907f9818419a2ff11872f3694827f0dad
blurV: b107acc388179159aa0baf32abba2be445b4d91b34e73d0c40539e785497d038
eigen: c4560743a9d42718e261c2cd2f069289aed6efabd341dc11b89c7c765ff38728
axial: 2f00744b42416f0730682bdf397bca3fc05fce3d5dc10a2d2e27f32563725bca
```

하나라도 다르면 기존 receipt를 재사용할 수 없다.

---

# 3. 문제 정의

## 3.1 평활 없는 Tensor의 rank-1 붕괴

한 픽셀의 gradient 외적은 다음과 같다.

```text
J = grad(I) grad(I)^T
```

성분은 다음과 같다.

```text
Jxx = Ix²
Jxy = IxIy
Jyy = Iy²
```

행렬식은 항상 0이다.

```text
det(J)
= Ix²Iy² - (IxIy)²
= 0
```

따라서 gradient가 0이 아닌 픽셀에서는 다음이 성립한다.

```text
lambda1 = Ix² + Iy²
lambda2 = 0
coherence ≈ 1
```

이 Tensor를 구조 게이트로 사용하면 다음 문제가 발생한다.

- corner와 straight edge가 구분되지 않는다.
- cross-junction이 강한 단일 방향 구조로 오인된다.
- texture 영역에서 coherence gate가 과도하게 열린다.
- 바케모노 효과가 구조 선택 없이 최대 강도로 적용된다.

## 3.2 Stage-local Tensor와 Terminal Tensor의 불일치

현재 R9A EWA stage Tensor는 stage source texture에서 계산된다.

```text
stage source
→ stage-local R1C
→ EWA stage output
```

마지막 stage의 source tensor를 최종 효과에 재사용하면 다음이 발생할 수 있다.

- Tensor width·height와 final output width·height가 다르다.
- Tensor가 final EWA 출력의 새 edge를 반영하지 못한다.
- output pixel과 source pixel 사이 coordinate mapping이 필요하다.
- receipt가 terminal structure가 아니라 source-guided structure가 된다.

WGSL-03은 이 경로를 Canonical profile에서 허용하지 않는다.

## 3.3 Metadata-only lambda2 claim

`tensorTruthClaim: true`만으로 lambda2 생존을 증명할 수 없다.

다음 오류가 있어도 metadata는 true일 수 있다.

- blurH pass 미기록
- blurV pass 미기록
- blur target alias
- raw outer texture를 eigen 입력으로 연결
- 중앙 gradient를 반복하는 fake blur
- eigen shader에서 lambda2를 0으로 강제
- coherence를 1로 고정

따라서 WGSL-03은 physical fixture와 GPU probe를 요구한다.

---

# 4. Authority 모델

## 4.1 Patch identity

```text
patchId:
  TDT-BAKEMONO-RINNE-WGSL-03
```

## 4.2 Terminal Tensor identity

```text
terminalTensorProducerId:
  tdt.effect.bakemono-rinne.tensor-producer.terminal-r1c.wgsl03.v1

terminalTensorHandleSchemaId:
  tdt.effect.bakemono-rinne.terminal-r1c-handle.v3

terminalTensorReceiptSchemaId:
  tdt.effect.bakemono-rinne.terminal-r1c-producer-receipt.v3

lambda2ProbeId:
  tdt.effect.bakemono-rinne.lambda2-probe.wgsl03.v1

lambda2ReceiptSchemaId:
  tdt.effect.bakemono-rinne.lambda2-physical-receipt.v3
```

## 4.3 Canonical kernel identity

```text
canonicalKernelId:
  tdt.effect.bakemono-rinne.kernel.wgsl.r1c-gated-shadow.v1

canonicalKernelAbiId:
  tdt.effect.bakemono-rinne.abi.r1c-gated-shadow.v1

canonicalPipelineFamilyId:
  tdt.pipeline.bakemono-rinne.r1c-gated-shadow.wgsl03.v1

canonicalOutputSemanticId:
  tdt.surface.bakemono-rinne.r1c-gated-shadow-candidate.linear-premul.v1

canonicalOutputAuthority:
  CANONICAL_CANDIDATE_SHADOW_ONLY
```

## 4.4 Structure gate identity

```text
structureGateId:
  tdt.effect.bakemono-rinne.structure-gate.coherence-edge.v1

structureGateFormula:
  pow(clamp(coherence, 0, 1), coherenceExponent)
  * clamp(edgeStrength, 0, 1)
```

## 4.5 권위 분리

```text
WGSL-02 compatibility formula authority
= 레거시 수식 parity

WGSL-03 terminal tensor authority
= final EWA resolution integrated R1C

WGSL-03 canonical kernel authority
= compatibility formula + explicit structure gate

WGSL-03 output authority
= CANONICAL_CANDIDATE_SHADOW_ONLY

Canonical Final Texture authority
= NONE
```

---

# 5. 기존 파이프라인과 WGSL-03 삽입 위치

## 5.1 현재 R9A

```text
Source Prepare
→ stage 0 R1C
→ stage 0 Adaptive
→ stage 0 EWA
→ ...
→ final EWA stage
→ terminalTexture
→ graph.submit()
```

## 5.2 WGSL-03 qualification path

WGSL-03은 제품 R9A graph를 아직 수정하지 않는다.

qualification path는 다음과 같다.

```text
Final-EWA fixture 또는 captured terminal texture
        │
        ▼
Terminal R1C recorder
  gradient
  outer
  blurH
  blurV
  eigen
  axial
        │
        ├─ integrated tensor → validation-only lambda2 probe
        │
        └─ eigen fieldTexture → canonical effect kernel
                                  │
                                  ▼
                         canonical shadow candidate
        │
        ▼
qualification encoder.finish()
→ qualification queue.submit() 1회
→ bounded readback
```

이 submit은 WGSL-03 qualification submit이다.

다음 주장을 하지 않는다.

```text
R9A total submit count = 1
product single-submit authority = true
```

## 5.3 WGSL-04 예정 삽입 위치

```text
R9A final EWA record
→ WGSL-03 terminal R1C recorder
→ WGSL-03 canonical effect recorder
→ R9A graph.submit()
```

WGSL-03 API는 이 후속 결선을 위해 encoder-only recorder를 제공해야 한다.

---

# 6. Terminal R1C producer 계약

## 6.1 입력 surface 계약

Terminal R1C producer는 일반 GPUTexture를 받지 않는다.

입력은 다음 descriptor를 만족해야 한다.

```ts
interface FinalEwaTerminalSurfaceDescriptorWgsl03 {
  schemaId: 'tdt.ewa.terminal-surface-descriptor.wgsl03.v1';

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

## 6.2 입장 조건

다음 조건을 모두 만족해야 한다.

```text
surfaceRole == FINAL_EWA_TERMINAL
format == rgba16float
transfer == linear
alphaMode == premultiplied
coordinateSpace == output-pixel
width > 0
height > 0
runtimeEpoch exact match
deviceEpoch exact match
deviceIdentity exact match
commandGraphId exact match
lowpassReceiptDigest is sha256
lowpassPlanDigest is sha256
```

## 6.3 금지 입력

다음은 Terminal R1C source로 사용할 수 없다.

- stage source texture
- retained final-stage source texture
- retained stage-local axial texture
- WebGL FBO texture
- CPU RGBA8 upload
- legacy offscreen surface
- arbitrary user GPUTexture
- old device epoch texture
- coordinate mapping이 source-pixel인 texture

## 6.4 R1C pass 순서

순서는 고정이다.

```text
1. gradient
2. outer
3. blurH
4. blurV
5. eigen
6. axial
```

다음 재배치는 금지한다.

- outer 전에 blur
- gradient 자체만 blur한 뒤 outer
- blurV 생략
- blurH 생략
- eigen이 raw outer를 직접 소비
- axial이 integrated tensor를 직접 소비

## 6.5 Tensor parameter SSOT

WGSL-03은 기존 `normalizeTensorR1CParameters()`와 동일한 parameter contract를 사용한다.

기본값은 다음과 같다.

```yaml
tensorSigma: 1.15
kernelRadius: 4
sourceDomain: declared-linear
workgroupSize: [8, 8, 1]
textureFormat: rgba16float
```

`edgeLow`, `edgeHigh`, `alphaEpsilon`, `maxAnisotropy`, `minorCoverageFactor`, `coherenceExponent`는 caller가 제공하되 기존 R1C 범위 검사를 통과해야 한다.

## 6.6 Resource set

Terminal R1C producer는 다음 texture를 생성한다.

| Resource | 내용 | 외부 노출 |
|---|---|---:|
| gradient | Ix, Iy, validity | 금지 |
| raw | Jxx, Jxy, Jyy | 금지 |
| blurH | horizontal integrated tensor | 금지 |
| integrated | final Jxx, Jxy, Jyy | validation probe 내부만 |
| eigen | tangent, coherence, edge | admitted handle로 허용 |
| axial | double-angle, coherence, edge | WGSL-03 effect에는 금지 |

## 6.7 Raw resource exposure count

Producer receipt에는 다음이 고정된다.

```json
{
  "rawTensorTextureExposureCount": 0,
  "integratedTensorTextureExposureCount": 0,
  "stageLocalTensorAdoptionCount": 0,
  "legacyTensorAdoptionCount": 0
}
```

validation-only probe는 producer 내부 private capability로 integrated texture를 소비한다.

---

# 7. Terminal Tensor handle

## 7.1 Handle schema

```ts
interface BakemonoRinneTerminalR1CHandleWgsl03 {
  schemaId: 'tdt.effect.bakemono-rinne.terminal-r1c-handle.v3';

  semanticId: 'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1';
  packingId: 'tdt.tensor.tangent-coherence-edge.rgba.v1';
  tensorMode: 'canonical-terminal-r1c';
  textureRole: 'fieldTexture';
  coordinateMapping: 'IDENTITY_OUTPUT_PIXEL';

  width: number;
  height: number;

  sourceSurfaceId: string;
  sourceSurfaceRevision: number;
  sourceLowpassReceiptDigest: string;

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  commandGraphId: string;

  fieldTexture: GPUTexture;

  producerReceipt: BakemonoRinneTerminalR1CProducerReceiptWgsl03;
  lambda2QualificationReceipt: BakemonoRinneLambda2QualificationReceiptWgsl03;

  readonly released: boolean;
  release(): void;
}
```

## 7.2 Packing

`fieldTexture`의 packing은 다음과 같다.

```text
R = tangent.x
G = tangent.y
B = coherence
A = edge strength
```

다음 texture는 같은 semantic으로 주장할 수 없다.

```text
axial texture
R = cos(2 theta)
G = sin(2 theta)
B = coherence
A = edge
```

B와 A가 같더라도 RG 의미가 다르므로 packing ID가 다르다.

WGSL-03 canonical kernel은 `fieldTexture`만 허용한다.

## 7.3 Handle 위조 차단

다음만 맞춘 plain object는 admission을 통과하지 못한다.

```text
semanticId 문자열
width·height
GPUTexture reference
```

Handle은 producer receipt와 lambda2 receipt lineage를 포함해야 한다.

## 7.4 Admission token

Public canonical recorder는 handle을 직접 받지 않는다.

먼저 다음 함수를 통과해야 한다.

```ts
function admitBakemonoRinneTerminalR1CWgsl03(
  handle: BakemonoRinneTerminalR1CHandleWgsl03,
  request: BakemonoRinneCanonicalAdmissionRequestWgsl03,
): BakemonoRinneTerminalR1CAdmissionTokenWgsl03;
```

Admission token은 opaque object다.

```ts
interface BakemonoRinneTerminalR1CAdmissionTokenWgsl03 {
  schemaId: 'tdt.effect.bakemono-rinne.terminal-r1c-admission-token.v3';
  admissionId: 'tdt.effect.bakemono-rinne.tensor-admission.terminal-r1c.v1';

  semanticId: 'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1';
  packingId: 'tdt.tensor.tangent-coherence-edge.rgba.v1';
  tensorMode: 'canonical-terminal-r1c';

  width: number;
  height: number;

  sourceSurfaceId: string;
  sourceSurfaceRevision: number;

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  commandGraphId: string;

  producerReceiptDigest: string;
  lambda2QualificationReceiptDigest: string;
  admissionDigest: string;

  fieldTexture: GPUTexture;
}
```

---

# 8. Nonzero lambda2 physical probe

## 8.1 목적

Source inspection만으로 blur pass의 실제 실행과 resource wiring을 증명할 수 없다.

WGSL-03은 물리 GPU에서 integrated tensor를 직접 검사한다.

## 8.2 Probe 입력

Probe는 producer 내부에서 다음 texture를 소비한다.

```text
integrated texture
R = Jxx
G = Jxy
B = Jyy
A = validity or reserved
```

Probe는 eigen output을 신뢰하지 않고 lambda1·lambda2·coherence를 독립 계산한다.

## 8.3 Probe 식

```wgsl
let jxx = max(j.r, 0.0);
let jxy = j.g;
let jyy = max(j.b, 0.0);

let trace = jxx + jyy;
let discriminant = sqrt(max(
  0.0,
  (jxx - jyy) * (jxx - jyy) + 4.0 * jxy * jxy
));

let lambda1 = 0.5 * (trace + discriminant);
let lambda2 = 0.5 * (trace - discriminant);
let coherence = (lambda1 - lambda2) / (lambda1 + lambda2 + 1e-8);
```

## 8.4 Probe counter layout

64-byte storage buffer를 사용한다.

```ts
interface Lambda2ProbeCountersWgsl03 {
  activePixelCount: number;
  lambda2PositivePixelCount: number;
  lambda2StrongPixelCount: number;
  coherenceBelow095Count: number;

  coherenceBelow075Count: number;
  nonFiniteCount: number;
  negativeLambdaCount: number;
  invalidTensorCount: number;

  coherenceSumQ20: number;
  coherenceMinQ20: number;
  coherenceMaxQ20: number;
  lambda2RatioSumQ20: number;

  roiActiveCount: number;
  roiLambda2PositiveCount: number;
  roiCoherenceSumQ20: number;
  reserved: number;
}
```

## 8.5 Epsilon

```text
active epsilon:
  lambda1 > 1e-8

lambda2 positive epsilon:
  lambda2 > max(1e-8, lambda1 * 1e-5)

lambda2 strong epsilon:
  lambda2 > max(1e-7, lambda1 * 1e-3)
```

Epsilon은 fixture receipt에 기록한다.

## 8.6 Bounded readback

Probe buffer readback은 qualification harness에서만 허용한다.

제품 runtime에서는 다음이 금지된다.

```text
MAP_READ
mapAsync
copyTextureToBuffer for tensor pixels
readPixels
CPU full-surface tensor analysis
```

WGSL-03 physical gate는 64-byte compact counter만 읽는다.

## 8.7 Physical fixture set

### Flat field

기대값:

```text
activePixelCount == 0
lambda2PositivePixelCount == 0
nonFiniteCount == 0
```

### Straight edge

기대값:

```text
activePixelCount > 0
mean coherence >= 0.97
centerline coherence >= 0.98
nonFiniteCount == 0
```

### L-corner

기대값:

```text
roiActiveCount > 0
roiLambda2PositiveCount > 0
roi mean coherence < straight-edge mean coherence - 0.08
center coherence < 0.95
```

### Cross junction

기대값:

```text
roiLambda2PositiveCount > 0
center coherence < 0.90
coherenceBelow075Count > 0
```

### Isotropic checker texture

기대값:

```text
lambda2PositivePixelCount > 0
regional mean coherence < straight-edge mean coherence
```

### Rotated edge matrix

각도:

```text
0°
22.5°
45°
67.5°
90°
```

기대값:

```text
edge energy parity within tolerance
coherence mean spread <= 0.03
orientation packing parity within tolerance
```


## 8.8 Qualification 귀속

Lambda2 probe는 제품 이미지마다 실행하는 runtime gate가 아니다.

물리 결과는 다음 identity 묶음에 귀속한다.

```text
tensor pipeline identity
+ exact R1C shader digest set
+ tensor parameter profile digest
+ device identity
+ adapter identity
+ fixture corpus digest
```

제품 runtime의 Terminal R1C handle은 이 qualification receipt digest를 상속한다.

```text
per-operation lambda2 readback count = 0
```

다음 변경이 발생하면 기존 qualification receipt는 재사용할 수 없다.

- R1C shader byte 변경
- tensorSigma 변경
- kernelRadius 변경
- edge normalization parameter contract 변경
- pipeline layout 변경
- adapter 또는 device qualification scope 변경

---

# 9. Lambda2 qualification receipt

```ts
interface BakemonoRinneLambda2QualificationReceiptWgsl03 {
  schemaVersion: 1;
  schemaId: 'tdt.effect.bakemono-rinne.lambda2-qualification-receipt.v3';
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-03';

  probeId: 'tdt.effect.bakemono-rinne.lambda2-probe.wgsl03.v1';
  probeShaderDigest: string;
  probeAbiDigest: string;

  tensorPipelineIdentity: string;
  tensorShaderSetDigest: string;
  tensorParameterProfileDigest: string;

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  adapterIdentity: string;

  tensorSigma: number;
  kernelRadius: number;
  lambda2RelativeEpsilon: number;
  lambda2AbsoluteEpsilon: number;

  fixtureSetDigest: string;
  flatReceiptDigest: string;
  straightEdgeReceiptDigest: string;
  cornerReceiptDigest: string;
  junctionReceiptDigest: string;
  checkerReceiptDigest: string;
  rotatedEdgeReceiptDigest: string;

  lambda2PositiveFixtureCount: number;
  mutantRejectedCount: number;
  nonFiniteCount: 0;
  negativeLambdaCount: 0;

  qualificationScope:
    'PIPELINE_SHADER_PARAMETER_DEVICE_FIXTURE_SET';
  perOperationReadbackRequired: false;

  pass: true;
  receiptDigest: string;
}
```

Source bake 상태에서는 qualification receipt를 발급하지 않는다.

다음 placeholder를 qualification pass receipt로 사용할 수 없다.

```json
{
  "pass": true,
  "physicalExecution": false
}
```

---

# 10. Compatibility ABI와 Canonical ABI 분리

## 10.1 Compatibility ABI

WGSL-02 ABI는 변경하지 않는다.

| Binding | Role |
|---:|---|
| 0 | base |
| 1 | qmap |
| 2 | scalar |
| 3 | alphaDepth |
| 4 | highlight |
| 5 | maskEdge |
| 6 | output |
| 7 | uniform |

```text
bindingCount = 8
Tensor binding = 없음
outputAuthority = SHADOW_ONLY
```

## 10.2 Canonical ABI

WGSL-03은 별도 bind group layout을 사용한다.

| Binding | Role | Resource |
|---:|---|---|
| 0 | base | texture_2d<f32> |
| 1 | qmap | texture_2d<f32> |
| 2 | scalar | texture_2d<f32> |
| 3 | alphaDepth | texture_2d<f32> |
| 4 | highlight | texture_2d<f32> |
| 5 | maskEdge | texture_2d<f32> |
| 6 | terminalR1C | texture_2d<f32> |
| 7 | output | texture_storage_2d<rgba16float, write> |
| 8 | uniform | uniform buffer 128 bytes |

```text
bindingCount = 9
samplerCount = 0
terminalR1C binding = 1
rawTensor binding = 0
axialTensor binding = 0
```

## 10.3 Canonical uniform ABI

Uniform byte size는 128 byte를 유지하지만 ABI identity는 다르다.

```wgsl
struct BakemonoRinneCanonicalParams {
  width: u32,
  height: u32,
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
  maskProfileEnum: u32,
  phaseWrapEnum: u32,

  inputTransferEnum: u32,
  inputAlphaModeEnum: u32,
  outputAuthorityEnum: u32,
  outputFormatEnum: u32,

  tauCompat: f32,
  labThreshold: f32,
  labLinearCoefficient: f32,
  neonMultiplier: f32,

  tensorProfileEnum: u32,
  tensorPackingEnum: u32,
  structureGateEnum: u32,
  checksumWord: u32,
};
```

## 10.4 ABI enums

```text
abiVersion:
  0x00030001

formulaProfileEnum:
  2 = R1C_GATED_CANONICAL_SHADOW

outputAuthorityEnum:
  2 = CANONICAL_CANDIDATE_SHADOW_ONLY

tensorProfileEnum:
  1 = TERMINAL_INTEGRATED_R1C

tensorPackingEnum:
  1 = TANGENT_COHERENCE_EDGE_RGBA

structureGateEnum:
  1 = POW_COHERENCE_TIMES_EDGE
```

## 10.5 Cross-ABI rejection

다음은 반드시 실패한다.

- WGSL-02 request를 WGSL-03 recorder에 전달
- WGSL-03 request를 WGSL-02 recorder에 전달
- WGSL-02 uniform을 WGSL-03 pipeline에 bind
- WGSL-03 bind group layout을 WGSL-02 kernel에 사용
- compatibility kernel receipt로 canonical dispatch receipt 생성
- canonical kernel receipt로 WebGL parity claim 생성

---

# 11. Canonical structure gate

## 11.1 Tensor sampling

```wgsl
let tensor = textureLoad(terminalR1CTex, pixel, 0);
```

Tensor는 output pixel coordinate로 읽는다.

- normalized UV 사용 금지
- bilinear sampling 금지
- sampler 사용 금지
- source-to-output remap 금지

## 11.2 Finite gate

```wgsl
fn finite4(v: vec4<f32>) -> bool {
  return all(isFinite(v));
}
```

Tensor field가 nonfinite이면 structure gate는 0이다.

## 11.3 Gate formula

```wgsl
let coherence = clamp(tensor.b, 0.0, 1.0);
let structureEdge = clamp(tensor.a, 0.0, 1.0);

let structureGate = select(
  0.0,
  pow(coherence, params.coherenceExponent) * structureEdge,
  finite4(tensor)
);
```

`coherenceExponent` 조건:

```text
finite
> 0
<= 8
```

기본값:

```text
coherenceExponent = 1.0
```

## 11.4 Formula 결합 위치

WGSL-02 compatibility 식은 다음과 같다.

```wgsl
let kCompat = clamp(q * s * params.power, 0.0, 1.0);
let outEncoded = mix(encodedStraight, fused, vec3<f32>(kCompat));
```

WGSL-03 Canonical 식은 다음과 같다.

```wgsl
let kCanonical = clamp(
  q * s * params.power * structureGate,
  0.0,
  1.0
);

let outEncoded = mix(
  encodedStraight,
  fused,
  vec3<f32>(kCanonical)
);
```

다음 위치에는 structure gate를 중복 적용하지 않는다.

- phase
- Lab displacement
- CMYK displacement
- maskMix
- glow
- fusionRatio
- neon candidate

효과 전체의 최종 적용량 `k`에 한 번만 적용한다.

## 11.5 Gate identity fixture

Tensor가 다음 값일 때:

```text
coherence = 1
edge = 1
```

WGSL-03 output은 WGSL-02 compatibility output과 허용 오차 내 동일해야 한다.

```text
max half ULP distance <= 1
alpha half-bit mismatch = 0
```

## 11.6 Gate zero fixture

다음 중 하나이면 output은 base와 동일해야 한다.

```text
coherence = 0
edge = any

or

coherence = any
edge = 0
```

## 11.7 Gate monotonicity

동일 pixel과 동일 다른 입력에서:

```text
coherence 0.2 → 0.5 → 0.9
```

또는:

```text
edge 0.2 → 0.5 → 0.9
```

효과 에너지의 거리는 감소하면 안 된다.

```text
D(base, out0.2)
<= D(base, out0.5)
<= D(base, out0.9)
```

허용 f16 quantization tolerance를 적용한다.

---

# 12. Canonical request contract

```ts
interface BakemonoRinneCanonicalShadowRequestWgsl03 {
  purpose: 'QUALIFICATION_ONLY' | 'DIAGNOSTIC_CANONICAL_SHADOW';
  operationId: string;
  fixtureId?: string | null;

  device: GPUDevice;
  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  commandGraphId: string;

  formulaProfileId:
    'tdt.effect.bakemono-rinne.profile.r1c-gated-canonical-shadow.v1';

  formulaContractReceipt: BakemonoRinneFormulaContractReceipt;
  phaseReceipt: BakemonoRinnePhaseReceipt & { receiptDigest: string };

  base: BakemonoRinneTextureDescriptor;
  qmap: BakemonoRinneTextureDescriptor;
  scalar: BakemonoRinneTextureDescriptor;
  alphaDepth: BakemonoRinneTextureDescriptor;
  highlight: BakemonoRinneTextureDescriptor;
  maskEdge: BakemonoRinneTextureDescriptor;

  terminalR1CAdmission:
    BakemonoRinneTerminalR1CAdmissionTokenWgsl03;

  width: number;
  height: number;

  power: number;
  neonBoost: number;
  coherenceExponent: number;
  alphaEpsilon: number;

  outputAuthority?: 'CANONICAL_CANDIDATE_SHADOW_ONLY';
}
```

Public request에 다음 필드를 둘 수 없다.

```text
tensorTexture
tensorTex
rawTensorTexture
integratedTensorTexture
axialTexture
legacyTensorTexture
lambda1Texture
lambda2Texture
```

---

# 13. Recorder API

## 13.1 Terminal tensor recorder

```ts
async function recordTerminalIntegratedR1CWgsl03(
  recordTarget: BakemonoRinneRecordTargetWgsl03,
  request: RecordTerminalR1CRequestWgsl03,
): Promise<RecordedTerminalR1CWgsl03>;
```

## 13.2 Canonical effect recorder

```ts
async function recordBakemonoRinneCanonicalPassWgsl03(
  encoder: GPUCommandEncoder,
  request: BakemonoRinneCanonicalShadowRequestWgsl03,
): Promise<RecordedBakemonoRinneCanonicalPassWgsl03>;
```

## 13.3 Recorder submit authority

두 recorder 모두 다음을 만족한다.

```text
queue.submit() 호출 = 0
onSubmittedWorkDone() 호출 = 0
mapAsync() 호출 = 0
Surface Registry publish = 0
Preview publish = 0
Export publish = 0
```

## 13.4 Qualification wrapper

```ts
async function executeBakemonoRinneCanonicalShadowWgsl03(
  request: ExecuteBakemonoRinneCanonicalShadowRequestWgsl03,
): Promise<BakemonoRinneCanonicalShadowResultWgsl03>;
```

Qualification wrapper는 다음을 한 encoder에 기록한다.

```text
Terminal R1C 6 pass
lambda2 probe
Canonical effect 1 pass
counter copy 1 operation
```

그리고 submit을 정확히 1회 호출한다.

---

# 14. Resource lifecycle

## 14.1 Producer-owned resources

Terminal R1C producer가 소유한다.

```text
gradient
raw
blurH
integrated
eigen
axial
uniform allocation
probe buffer
```

## 14.2 Effect-owned resources

Canonical effect recorder가 소유한다.

```text
output texture
canonical uniform buffer
```

## 14.3 Release 순서

```text
record tensor
→ create admission token
→ record canonical effect
→ release terminal tensor handle
→ transient retirement after queue fence
```

Handle release 전에 fieldTexture를 destroy하면 안 된다.

Handle release 뒤 새 dispatch에 재사용하면 안 된다.

## 14.4 Alias 금지

다음 resource alias는 금지한다.

- base == output
- terminalR1C == output
- qmap == scalar
- scalar == tensor
- maskEdge == tensor
- highlight == tensor
- integrated == eigen
- raw == integrated
- blurH == blurV

## 14.5 Peak texture accounting

Terminal R1C reconstruction의 temporary texture 수는 다음으로 고정한다.

```text
6 textures
```

Qualification probe가 별도 texture를 만들면 안 된다.

Probe는 integrated texture를 읽고 compact buffer에 쓴다.

---

# 15. Producer receipt

```ts
interface BakemonoRinneTerminalR1CProducerReceiptWgsl03 {
  schemaVersion: 1;
  schemaId: 'tdt.effect.bakemono-rinne.terminal-r1c-producer-receipt.v3';
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-03';

  producerId:
    'tdt.effect.bakemono-rinne.tensor-producer.terminal-r1c.wgsl03.v1';

  sourceSurfaceId: string;
  sourceSurfaceRevision: number;
  sourceLowpassReceiptDigest: string;
  sourceLowpassPlanDigest: string;

  width: number;
  height: number;
  format: 'rgba16float';
  coordinateMapping: 'IDENTITY_OUTPUT_PIXEL';

  tensorMode: 'canonical-terminal-r1c';
  semanticId: 'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1';
  packingId: 'tdt.tensor.tangent-coherence-edge.rgba.v1';

  tensorSigma: number;
  kernelRadius: number;
  tensorParameterDigest: string;
  tensorShaderSetDigest: string;
  shaderDigests: {
    gradient: string;
    outer: string;
    blurH: string;
    blurV: string;
    eigen: string;
    axial: string;
  };

  passOrder: readonly [
    'gradient',
    'outer',
    'blurH',
    'blurV',
    'eigen',
    'axial'
  ];

  dispatchCount: 6;
  queueSubmitCount: 0;
  intermediateReadbackCount: 0;

  rawTensorTextureExposureCount: 0;
  integratedTensorTextureExposureCount: 0;
  stageLocalTensorAdoptionCount: 0;
  legacyTensorAdoptionCount: 0;

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  commandGraphId: string;

  lambda2QualificationReceiptDigest: string;
  perOperationLambda2ReadbackCount: 0;
  tensorTruthClaim: true;
  terminalResolutionClaim: true;

  receiptDigest: string;
}
```

---

# 16. Canonical kernel receipt

```ts
interface BakemonoRinneCanonicalKernelReceiptWgsl03 {
  schemaVersion: 1;
  schemaId: 'tdt.effect.bakemono-rinne.canonical-kernel-receipt.v3';
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-03';

  kernelId:
    'tdt.effect.bakemono-rinne.kernel.wgsl.r1c-gated-shadow.v1';
  kernelAbiId:
    'tdt.effect.bakemono-rinne.abi.r1c-gated-shadow.v1';
  pipelineFamilyId:
    'tdt.pipeline.bakemono-rinne.r1c-gated-shadow.wgsl03.v1';

  generatedWgslDigest: string;
  generatorManifestDigest: string;
  uniformAbiDigest: string;
  bindGroupLayoutDigest: string;

  formulaContractReceiptDigest: string;
  structureGateId:
    'tdt.effect.bakemono-rinne.structure-gate.coherence-edge.v1';
  structureGateSourceDigest: string;

  compatibilityKernelDigest: string;
  compatibilityFormulaBodyDigest: string;
  canonicalDeltaDigest: string;

  compilationInfoDigest: string;
  compilationErrorCount: 0;
  compilationWarningCount: number;

  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;

  outputAuthority: 'CANONICAL_CANDIDATE_SHADOW_ONLY';
  canonicalFinalTextureClaim: false;

  receiptDigest: string;
}
```

`canonicalDeltaDigest`는 compatibility kernel과 canonical kernel의 허용된 차이만 봉인한다.

허용된 의미 차이는 다음뿐이다.

```text
terminalR1C binding 추가
coherenceExponent 활성화
structureGate 계산 추가
final k에 structureGate 1회 곱셈
canonical profile enums
canonical output identity
```

---

# 17. Canonical dispatch receipt

```ts
interface BakemonoRinneCanonicalDispatchReceiptWgsl03 {
  schemaVersion: 1;
  schemaId: 'tdt.effect.bakemono-rinne.canonical-shadow-dispatch-receipt.v3';
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-03';

  purpose: 'QUALIFICATION_ONLY' | 'DIAGNOSTIC_CANONICAL_SHADOW';
  operationId: string;
  fixtureId: string | null;

  kernelReceiptDigest: string;
  terminalTensorProducerReceiptDigest: string;
  lambda2QualificationReceiptDigest: string;
  terminalTensorAdmissionDigest: string;
  parameterDigest: string;
  phaseReceiptDigest: string;
  inputSetDigest: string;

  width: number;
  height: number;
  workgroupsX: number;
  workgroupsY: number;
  dispatchCount: 1;
  queueSubmitCount: 0 | 1;

  structureGateId:
    'tdt.effect.bakemono-rinne.structure-gate.coherence-edge.v1';
  coherenceExponent: number;

  outputFormat: 'rgba16float';
  outputSemanticId:
    'tdt.surface.bakemono-rinne.r1c-gated-shadow-candidate.linear-premul.v1';
  outputAuthority: 'CANONICAL_CANDIDATE_SHADOW_ONLY';

  surfaceRegistryPublishCount: 0;
  previewPublishCount: 0;
  exportPublishCount: 0;
  canonicalFinalTextureClaim: false;
  r9aCommandGraphClaim: false;

  receiptDigest: string;
}
```

---

# 18. 오류 코드

## 18.1 Terminal source

```text
E_BKR03_FINAL_EWA_TERMINAL_REQUIRED
E_BKR03_FINAL_EWA_ROLE_MISMATCH
E_BKR03_FINAL_EWA_FORMAT_MISMATCH
E_BKR03_FINAL_EWA_COLOR_CONTRACT_MISMATCH
E_BKR03_FINAL_EWA_DIMENSION_INVALID
E_BKR03_FINAL_EWA_EPOCH_MISMATCH
E_BKR03_FINAL_EWA_GRAPH_MISMATCH
E_BKR03_FINAL_EWA_RECEIPT_MISSING
```

## 18.2 Tensor producer

```text
E_BKR03_TENSOR_PIPELINE_NOT_READY
E_BKR03_TENSOR_SHADER_DIGEST_MISMATCH
E_BKR03_TENSOR_PARAMETER_INVALID
E_BKR03_TENSOR_PASS_ORDER_INVALID
E_BKR03_TENSOR_RESOURCE_ALIAS
E_BKR03_TENSOR_RAW_EXPOSURE_DENIED
E_BKR03_TENSOR_STAGE_LOCAL_DENIED
E_BKR03_TENSOR_AXIAL_FIELD_DENIED
E_BKR03_TENSOR_LEGACY_SOURCE_DENIED
E_BKR03_TENSOR_RELEASED
```

## 18.3 Lambda2 gate

```text
E_BKR03_LAMBDA2_PROBE_COMPILE_FAILED
E_BKR03_LAMBDA2_PROBE_ABI_MISMATCH
E_BKR03_LAMBDA2_PHYSICAL_RECEIPT_REQUIRED
E_BKR03_LAMBDA2_ZERO_COLLAPSE
E_BKR03_COHERENCE_ALWAYS_ONE
E_BKR03_CORNER_GATE_FAILED
E_BKR03_JUNCTION_GATE_FAILED
E_BKR03_ROTATION_PARITY_FAILED
E_BKR03_TENSOR_NONFINITE
E_BKR03_NEGATIVE_EIGENVALUE
```

## 18.4 ABI

```text
E_BKR03_COMPAT_ABI_NOT_CANONICAL
E_BKR03_CANONICAL_ABI_NOT_COMPAT
E_BKR03_BIND_GROUP_LAYOUT_MISMATCH
E_BKR03_UNIFORM_ABI_MISMATCH
E_BKR03_TENSOR_BINDING_REQUIRED
E_BKR03_TENSOR_ADMISSION_TOKEN_REQUIRED
E_BKR03_CANONICAL_PROFILE_REQUIRED
E_BKR03_OUTPUT_AUTHORITY_ESCALATION_DENIED
```

## 18.5 Structure gate

```text
E_BKR03_COHERENCE_EXPONENT_INVALID
E_BKR03_STRUCTURE_GATE_FORMULA_MUTATED
E_BKR03_STRUCTURE_GATE_DUPLICATED
E_BKR03_STRUCTURE_GATE_BYPASSED
E_BKR03_GATE_IDENTITY_PARITY_FAILED
E_BKR03_GATE_ZERO_FAILED
E_BKR03_GATE_MONOTONICITY_FAILED
```

---

# 19. Source positive verification

## 19.1 Terminal producer source

검사 항목:

- six shader digest exact match
- pass order exact match
- width·height = final EWA terminal dimensions
- source surface role exact match
- `IDENTITY_OUTPUT_PIXEL`
- raw texture return 없음
- integrated texture return 없음
- stage-local handle adoption 없음
- legacy tensor path import 없음

## 19.2 Canonical kernel source

검사 항목:

- generated source header identity
- binding count 9
- sampler count 0
- terminalR1C binding 6
- output binding 7
- uniform binding 8
- `coherenceExponent` active
- structure gate exact AST token sequence
- final k에 1회 적용
- compatibility formula body digest 보존
- output authority constant

## 19.3 ABI separation source

검사 항목:

- compatibility ABI source unchanged
- compatibility manifest digest unchanged
- canonical ABI ID differs
- canonical BGL digest differs
- cross-request assertion 존재
- cross-receipt assertion 존재

## 19.4 No raw tensor source

다음 문자열 또는 public property가 있으면 실패한다.

```text
rawTensorTexture
integratedTensorTexture
legacyTensorTexture
stageLocalTensorTexture
JxxTexture
JxyTexture
JyyTexture
```

private producer scope의 local variable은 허용된다.

---

# 20. Physical qualification matrix

## 20.1 Environment

```text
Electron hidden renderer
WebGPU required
same adapter and device
rgba16float storage texture support
shader compilation info captured
validation error scope enabled
```

## 20.2 Fixture dimensions

기본 fixture는 다음 크기를 사용한다.

```text
33 × 33
65 × 65
127 × 95
```

경계와 비정방형 dispatch를 모두 포함한다.

## 20.3 Tensor truth gate

각 fixture에서 다음을 확인한다.

```text
validation error count = 0
nonFiniteCount = 0
negativeLambdaCount = 0
corner lambda2 positive count > 0
junction lambda2 positive count > 0
straight coherence > corner coherence
straight coherence > junction coherence
```

## 20.4 Canonical output gate

다음 profile을 비교한다.

```text
WGSL-02 compatibility
WGSL-03 canonical with gate=1
WGSL-03 canonical with real R1C
WGSL-03 canonical with gate=0
```

검사:

- gate=1 compatibility parity
- gate=0 base parity
- real R1C corner suppression
- straight edge retention
- alpha bit preservation
- finite output
- repeated execution determinism

## 20.5 Determinism

동일 입력과 동일 receipt set으로 10회 실행한다.

```text
output digest unique count = 1
lambda2 counter digest unique count = 1
producer receipt body unique count = 1
canonical dispatch receipt body unique count = 1
```

receipt의 timestamp·run ID 같은 실행 메타는 digest body에서 제외한다.

---

# 21. Negative controls

## 21.1 Tensor construction mutants

1. blurH 제거
2. blurV 제거
3. blurH만 실행
4. blurV만 실행
5. eigen input을 raw로 변경
6. eigen input을 blurH로 변경
7. center gradient repeated fake blur
8. gradient blur 후 outer
9. Jxy를 0으로 강제
10. Jyy를 0으로 강제
11. lambda2를 0으로 강제
12. coherence를 1로 강제
13. coherence 분모에서 lambda2 제거
14. negative lambda clamp 제거
15. tensorSigma를 0으로 설정
16. kernelRadius를 0으로 설정

## 21.2 Source lineage mutants

17. stage-local source tensor
18. retained final-stage source tensor
19. axial texture를 fieldTexture로 위장
20. legacy `tensor.glsl` texture
21. old device epoch handle
22. 다른 commandGraphId handle
23. 다른 sourceSurfaceId handle
24. 다른 source revision handle
25. dimension mismatch handle
26. producer receipt digest 변조
27. lambda2 receipt digest 변조
28. physical pass false receipt

## 21.3 ABI mutants

29. compatibility request를 canonical recorder에 전달
30. canonical request를 compatibility recorder에 전달
31. terminalR1C binding 제거
32. output과 tensor binding 교환
33. uniform binding 7 사용
34. compatibility ABI version 사용
35. canonical profile enum을 compatibility로 변경
36. output authority를 FINAL로 변경

## 21.4 Structure gate mutants

37. coherence만 사용
38. edge만 사용
39. coherence + edge 사용
40. max(coherence, edge) 사용
41. gate를 glow에도 중복 적용
42. gate를 phase에 적용
43. gate를 final k에 적용하지 않음
44. gate에 hard floor 0.25 추가
45. coherence exponent 무시
46. nonfinite tensor를 gate 1로 처리
47. B 대신 R 채널 사용
48. A 대신 G 채널 사용

모든 mutant는 지정된 canonical error 또는 gate mismatch로 실패해야 한다.

---

# 22. Source Gate

총 Source Gate 수는 `208`개다.

| 범주 | 수량 |
|---|---:|
| Parent lineage | 16 |
| Terminal source contract | 20 |
| R1C producer source | 28 |
| Tensor handle·admission | 24 |
| Lambda2 probe source | 20 |
| Canonical kernel generation | 28 |
| ABI separation | 24 |
| Structure gate formula | 20 |
| Receipt·authority | 16 |
| Negative control harness | 12 |
| **합계** | **208** |

## 22.1 Source completion 조건

```text
208 PASS
0 FAIL
48 negative mutants detected
WGSL-02 parent receipt byte identity preserved
WGSL-02 generated kernel byte identity preserved
WGSL-03 physical gates PENDING allowed
```

---

# 23. Physical Gate

총 Physical Gate 수는 `56`개다.

| 범주 | 수량 |
|---|---:|
| WebGPU compile·ABI | 8 |
| Terminal tensor execution | 10 |
| Lambda2 fixture truth | 12 |
| Structure gate behavior | 10 |
| Compatibility identity parity | 6 |
| Finite·alpha·determinism | 6 |
| Authority non-promotion | 4 |
| **합계** | **56** |

## 23.1 Physical completion 조건

```text
56 PASS
0 FAIL
validation errors = 0
lambda2 qualification receipt pass = true
canonical output authority = CANONICAL_CANDIDATE_SHADOW_ONLY
surface publish count = 0
preview publish count = 0
export publish count = 0
canonical final texture claim = false
```

---

# 24. Source Final Receipt

```ts
interface BakemonoRinneWgsl03SourceFinalReceipt {
  schemaVersion: 1;
  schemaId: 'tdt.effect.bakemono-rinne.wgsl03-source-final-receipt.v1';
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-03';

  parentBundleDigest: string;
  parentSpecDigest: string;
  parentSourceReceiptDigest: string;

  terminalTensorContractDigest: string;
  tensorProducerSourceDigest: string;
  lambda2ProbeSourceDigest: string;
  canonicalKernelSourceDigest: string;
  canonicalGeneratorManifestDigest: string;
  canonicalAbiDigest: string;
  structureGateContractDigest: string;

  sourceGatePassCount: 208;
  sourceGateFailCount: 0;
  negativeControlDetectedCount: 48;

  physicalGatePassCount: 0 | 56;
  physicalGatePendingCount: 56 | 0;

  compatibilityKernelUnchanged: true;
  compatibilityAbiUnchanged: true;

  outputAuthority: 'CANONICAL_CANDIDATE_SHADOW_ONLY';
  canonicalFinalTextureClaim: false;
  r9aCommandGraphClaim: false;

  status:
    | 'SOURCE_BAKED_AWAITING_PHYSICAL_GPU'
    | 'PHYSICAL_TERMINAL_R1C_GATE_PASS_SHADOW_ONLY';

  receiptDigest: string;
}
```

---

# 25. 완료 상태

## 25.1 Source bake

```text
SOURCE_BAKED_AWAITING_PHYSICAL_GPU
```

조건:

- 208 Source Gate PASS
- 48 negative mutant 검출
- generated canonical WGSL 존재
- terminal tensor recorder source 존재
- lambda2 probe source 존재
- physical gate는 PENDING

## 25.2 Physical pass

```text
PHYSICAL_TERMINAL_R1C_GATE_PASS_SHADOW_ONLY
```

조건:

- 56 Physical Gate PASS
- lambda2 qualification receipt PASS
- corner·junction lambda2 positive
- straight edge coherence 우위
- gate identity·zero·monotonicity PASS
- output authority remains shadow only

## 25.3 Fail

```text
FAIL
```

다음 중 하나면 FAIL이다.

- lambda2 positive fixture 0개
- corner coherence가 straight edge보다 낮지 않음
- blur 제거 mutant 통과
- compatibility ABI mutation
- raw tensor public passage
- stage-local tensor admission
- output authority escalation
- Surface Registry publish

---

# 26. 구현 파일 계획

## 26.1 신규 runtime

```text
app/legacy-runtime/core/compute/qmap_webgpu/
  bakemono_rinne_wgsl_03_contract.mjs
  bakemono_rinne_wgsl_03_params.mjs
  bakemono_rinne_wgsl_03_terminal_tensor.mjs
  bakemono_rinne_wgsl_03_tensor_admission.mjs
  bakemono_rinne_wgsl_03_pipeline.mjs
  bakemono_rinne_wgsl_03_shadow_runtime.mjs
  bakemono_rinne_wgsl_03_receipt.mjs
```

## 26.2 신규 shaders

```text
app/legacy-runtime/core/compute/qmap_webgpu/shaders/
  bakemono_rinne_fusion_r1c_gated_v1.generated.wgsl
  bakemono_rinne_terminal_lambda2_probe_v1.generated.wgsl
  generated-bakemono-rinne-wgsl-03-manifest.json
```

## 26.3 TypeScript

```text
app/src/runtime/effects/bakemono-rinne/
  bakemono-rinne-wgsl-03-types.ts
```

## 26.4 Tools

```text
tools/bakemono-rinne-wgsl-03/
  generate-wgsl.mjs
  generate-terminal-fixtures.mjs
  verify-parent-lineage.mjs
  verify-terminal-tensor-contract.mjs
  verify-lambda2-probe-source.mjs
  verify-canonical-abi.mjs
  verify-structure-gate.mjs
  verify-negative-controls.mjs
  gate-source.mjs
  finalize-source.mjs

  electron-qualification-main.mjs
  electron-qualification-preload.mjs
  qualification-renderer.mjs
  qualification-page.html
  gate-physical.mjs
  finalize-physical.mjs
```

## 26.5 Artifacts

```text
artifacts/bakemono-rinne-wgsl-03/source/
  source-gate-report.json
  source-negative-control-report.json
  terminal-tensor-contract-report.json
  canonical-abi-report.json
  structure-gate-report.json
  implementation-manifest.json
  source-final-receipt.json

artifacts/bakemono-rinne-wgsl-03/physical/
  physical-gate-report.json
  lambda2-fixture-report.json
  gate-behavior-report.json
  determinism-report.json
  physical-final-receipt.json
```

---

# 27. 적용 순서

1. WGSL-02 parent identity를 동결한다.
2. WGSL-03 contract identity를 추가한다.
3. Final EWA terminal descriptor를 구현한다.
4. reusable Terminal R1C recorder를 구현한다.
5. integrated tensor private capability를 구현한다.
6. lambda2 probe WGSL을 생성한다.
7. compact counter ABI를 구현한다.
8. terminal tensor handle과 admission token을 구현한다.
9. canonical 9-binding ABI를 구현한다.
10. canonical gated WGSL을 생성한다.
11. compatibility body digest와 canonical delta digest를 검증한다.
12. canonical shadow recorder를 구현한다.
13. one-encoder qualification wrapper를 구현한다.
14. 48 negative controls를 구현한다.
15. 208 Source Gate를 실행한다.
16. Electron physical harness를 실행한다.
17. 56 Physical Gate를 실행한다.
18. Source 또는 Physical receipt를 봉인한다.

---

# 28. 완료 게이트 요약

```text
Terminal source
= Final EWA terminal only

Tensor resolution
= exact final output width × height

Tensor construction
= gradient → outer → blurH → blurV → eigen → axial

Effect tensor input
= admitted eigen fieldTexture only

Raw Jxx/Jxy/Jyy passage
= 0

Stage-local tensor passage
= 0

Legacy tensor passage
= 0

Physical lambda2 qualification
= corner and junction positive

Structure gate
= pow(coherence, exponent) × edge

Gate application count
= final k exactly once

Compatibility ABI mutation
= 0

Canonical ABI
= distinct 9-binding identity

Output authority
= CANONICAL_CANDIDATE_SHADOW_ONLY

Canonical Final Texture
= false

R9A product graph claim
= false
```

---

# 29. 다음 패치

```text
TDT-BAKEMONO-RINNE-WGSL-04

R9A Command-Graph Native Recorder /
Final-EWA Terminal Tensor In-Graph Reconstruction /
Canonical Effect Pass In-Graph Recording /
Shared Uniform Ring Adoption /
Single Encoder·Single Submit Product Observation /
Zero Intermediate Readback Seal
```

WGSL-04는 WGSL-03의 다음 API만 소비한다.

```text
recordTerminalIntegratedR1CWgsl03()
recordBakemonoRinneCanonicalPassWgsl03()
```

WGSL-04는 WGSL-03 수식, Tensor packing, lambda2 gate, ABI를 다시 정의하지 않는다.

---

# 30. 최종 판정 문장

```text
WGSL-03 PASS는 바케모노·린네 Canonical Shadow가
Final EWA 결과와 동일한 픽셀 격자의 integrated R1C를 소비하고,
corner와 junction에서 lambda2가 실제로 살아 있으며,
coherence·edge gate가 호환 수식의 최종 적용량에 정확히 한 번 작동함을 의미한다.

WGSL-03 PASS는 아직 R9A 본선 채택이나 Final Texture 승격을 의미하지 않는다.
```
