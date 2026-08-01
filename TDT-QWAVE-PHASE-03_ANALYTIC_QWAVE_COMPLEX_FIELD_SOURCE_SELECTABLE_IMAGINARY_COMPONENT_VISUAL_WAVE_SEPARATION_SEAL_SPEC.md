# TDT-QWAVE-PHASE-03

## Analytic Q-wave Complex Field / Source-selectable Imaginary Component / Visual Wave Separation Seal

- **Patch ID:** `TDT-QWAVE-PHASE-03`
- **Document status:** `SPEC_DEFINED_UNBAKED`
- **Parent artifact:** `59_TDT_HANNAKAIRO_GATE_02_DIRECTIONAL_GATE_REPAIR_TENSOR_SPECTRAL_ALIGNMENT_NEUTRAL_IDENTITY_SOURCE_BAKED_AWAITING_PACKAGED_GPU.zip`
- **Parent ZIP SHA-256:** `4f2591268e27525fa6ad7c21397e1ebab2b2d4574588c8659bd83c1156f8f514`
- **Parent Source Seal:** `a9bb251d9b6c47794538aaf524211ab27ab6de1c5face366c01b4291426a544a`
- **Target source state:** `QWAVE_PHASE_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Production Pointer mutation:** forbidden
- **Authoritative backend:** WebGPU + WGSL
- **Product pixel compute on CPU:** forbidden
- **Intermediate GPU readback:** forbidden

---

## 0. 명세 목적

이 패치는 현재의 `qwave_builder_webgpu_compute.js`를 삭제하지 않는다. 기존 public facade와 `qwaveRG` 소비 경로를 보존하면서, 내부 권한을 Analysis Field Authority 소속의 canonical analytic Q-wave producer로 교체한다.

현재 호환 구현은 다음 식을 사용한다.

```text
A = clamp((|∂x ΔK| + |∂y ΔK|) × aScale, 0, 1)
Φ = alpha × A
Z = ΔK + iΦ
Q = sqrt(Z)
```

이 계산 자체는 실제 복소 제곱근이지만, 허수부가 local anisotropy proxy 하나로 고정돼 있고 Analysis Field handle, source semantic identity, lifecycle receipt, visual Q-wave와의 분리가 없다.

본 패치는 다음을 봉인한다.

1. Q-wave 실수부를 GPU Analysis Field handle로 고정한다.
2. 허수부의 source mode를 명시적으로 선택한다.
3. 선택된 허수부를 stage-pixel signed scalar field로 출판한다.
4. principal complex square root를 canonical WGSL로 계산한다.
5. canonical analytic field와 legacy `qwaveRG` texture를 분리한다.
6. 시간 기반 animated visual wave가 Analysis Field를 가장하지 못하게 한다.
7. CPU, Canvas, WebGL readback fallback이 analytic execution으로 진입하지 못하게 한다.
8. 기존 facade는 GPU-only compatibility adapter로 유지한다.

## 1. 현재 기준선의 확정 사실

### 1.1 현재 compatibility Q-wave builder

현재 `app/legacy-runtime/js/passes/qwave_builder_webgpu_compute.js`는 다음 상태다.

- WebGPU compute shader를 사용한다.
- 실수부는 raw `dkViewWGPU` texture의 R 채널이다.
- 허수부는 ΔK gradient 기반 nonnegative anisotropy proxy다.
- 출력은 `rgba16float` texture다.
- R은 `AQ = |Q|`, G는 `phase01`, B는 proxy A, A는 상수 1이다.
- raw texture cache가 pipeline object에 귀속된다.
- Analysis Field Authority publication이 없다.
- explicit field pin, source revision verification, device epoch receipt가 없다.
- uniform buffer가 job마다 생성되며 명시적 disposal ledger가 없다.
- queue fence 완료 전에 cache revision이 갱신된다.

### 1.2 현재 analytic producer inventory

현재 producer `tdt.analysis.producer.qwave.analytic`은 `productAdmission: future`, version `0.0.0`, implementation `tdt-qwave-analytic-unpromoted` 상태다. 실제 source file과 shader asset이 없다.

### 1.3 현재 visual Q-wave

`app/legacy-runtime/qwave/qwave_system.js`는 analytic field가 아니라 다음 입력으로 animated color overlay를 만든다.

- 화면 UV
- time
- user frequency / speed
- image chroma
- Kelvin bias
- cyan-magenta visual palette

또한 현재 visual path에는 Canvas `getImageData()` 기반 Kelvin 추정과 WebGPU→CPU→WebGL fallback이 존재한다. 이는 canonical analytic path에 절대 들어갈 수 없다.

### 1.4 현재 semantic 문제

기존 `tdt.analysis.qwave.analytic-complex.v1`은 아직 출판된 적 없는 future descriptor지만, magnitude 채널 range가 `[-1,1]`로 선언되어 있고 실제 복소 magnitude 의미와 맞지 않는다. 이 ID를 조용히 재정의하지 않는다. canonical output은 `v2`로 발행한다.

## 2. 범위

### 2.1 포함

- Analysis-owned Q-wave real scalar bridge
- source-selectable imaginary component normalizer
- local anisotropy compatibility mode
- SQ03 spectral quadrature mode
- HP01 Hannakairo defect mode
- R1C tensor curvature mode contract
- Hilbert quadrature mode contract
- principal complex square root WGSL
- imaginary component and analytic complex field atomic publication
- legacy `ensureQWaveRGWGPU()` GPU compatibility adapter
- visual animated wave separation
- zero CPU pixel compute and zero intermediate readback
- device-loss and cancellation lifecycle
- independent GPU reference and comparator assets
- Active Graph, Runtime Asset Manifest, semantic registry, producer inventory update

### 2.2 제외

- 새 Hilbert transform kernel 구현
- R1C curvature producer 구현
- R1D analysis policy fusion
- R2 EWA에서 Q-wave field 직접 소비
- Persistent GPU Tile Atlas
- visual palette redesign
- CPU FFT 또는 CPU phase reference의 제품 사용
- 기존 WebGL visual overlay의 완전 WebGPU presenter 전환

## 3. 권한과 상태 귀속

Canonical owner는 다음 서비스다.

```text
service: dadum.qwave-phase-authority.qp03
producer: tdt.analysis.producer.qwave.analytic
implementation: tdt-qwave-analytic-complex-source-select-v3
gpu owner: dadum.gpu.consumer.qwave-analytic
analysis consumer: tdt.analysis.consumer.qwave-analytic
```

서비스는 GPU Device Authority와 Analysis Field Authority 뒤에서 활성화한다.

```text
GPU Device Authority
→ Surface Authority
→ Analysis Field Authority
→ Spectral / Hannakairo producers
→ Q-wave Phase Authority
→ Legacy compatibility facade
```

Q-wave service는 raw global texture, Canvas, WebGLTexture를 canonical input으로 받을 수 없다. 모든 canonical input은 `AnalysisFieldHandle`이어야 한다.

## 4. Semantic Registry 변경

### 4.1 새 real component semantic

```text
tdt.analysis.qwave.real-delta-k-compat.v1
```

| 항목 | 값 |
|---|---|
| domain | `spatial` |
| periodicity | `signed-scalar` |
| coordinateSpace | `stage-pixel` |
| format | `rgba16float` |
| interpolation | `linear` |
| R | ΔK compatibility scalar `[0,1]` |
| G | source confidence `[0,1]` |
| B | reserved, 0 |
| A | validity `{0,1}` |
| neutral | `(0,0,0,0)` |

이 semantic은 기존 `dk_builder_webgpu_compute.js`의 proxy output임을 명시한다. full ΔK theory truth를 주장하지 않는다.

### 4.2 새 imaginary component semantic

```text
tdt.analysis.qwave.imaginary-component.v1
```

| 채널 | 의미 |
|---|---|
| R | signed imaginary scalar `Φ` |
| G | `abs(Φ) / imaginaryClamp` |
| B | selected source confidence |
| A | validity |

neutral은 `(0,0,0,0)`이다. source mode는 픽셀 채널이 아니라 publication metadata와 receipt에 기록한다.

### 4.3 새 canonical analytic semantic

```text
tdt.analysis.qwave.analytic-complex.v2
```

| 채널 | 의미 |
|---|---|
| R | `|Q|` |
| G | `cos(arg Q)` |
| B | `sin(arg Q)` |
| A | combined confidence |

neutral은 `(0,1,0,0)`이다.

### 4.4 기존 semantic 처리

- `tdt.analysis.qwave.analytic-complex.v1`: draft compatibility descriptor로 동결, canonical publication 금지
- `tdt.analysis.qwave.local-anisotropy-compat.v1`: legacy producer evidence로 유지, 새 canonical producer output으로 사용 금지
- `tdt.analysis.qwave.spectral-phase.v1`: draft alias로 유지, SQ03 `window-complex-phase.v1`을 직접 canonical input으로 사용
- `tdt.analysis.qwave.hilbert-phase.v1`: future external input semantic으로 유지
- `tdt.visual.qwave.animated-overlay.v1`: Analysis descriptor 밖에 유지

## 5. Producer 및 Consumer 계약

### 5.1 Canonical producer

```text
producerId: tdt.analysis.producer.qwave.analytic
producerVersion: 3.0.0
implementationId: tdt-qwave-analytic-complex-source-select-v3
productAdmission: canonical
outputs:
  - tdt.analysis.qwave.imaginary-component.v1
  - tdt.analysis.qwave.analytic-complex.v2
```

### 5.2 Accepted real input

초기 canonical allowlist는 다음 하나다.

```text
tdt.analysis.qwave.real-delta-k-compat.v1
```

raw `dkViewWGPU`는 legacy facade에서 bridge publication을 거친 뒤에만 사용 가능하다.

### 5.3 Imaginary source mode enum

```ts
type QWaveImaginarySourceMode =
  | 'local-anisotropy-compat'
  | 'spectral-quadrature'
  | 'hannakairo-defect'
  | 'tensor-curvature'
  | 'hilbert-quadrature';
```

각 request는 source mode 하나만 선택해야 한다. 여러 source를 암묵적으로 혼합하지 않는다.

## 6. Real Scalar Publication Bridge

기존 ΔK compatibility builder의 output texture는 pipeline cache가 소유하고 재사용될 수 있다. Q-wave는 이 texture를 직접 pin하지 않는다.

bridge 흐름:

```text
ensureDeltaKWGPU() completion
→ explicit source revision and parameter digest verification
→ analysis-owned rgba16float texture allocation
→ copyTextureToTexture
→ queue fence
→ tdt.analysis.qwave.real-delta-k-compat.v1 publication
```

필수 metadata:

- `deltaKCompatibilityProfileId`
- `deltaKParameterDigest`
- `sourceSurfaceId`
- `sourceRevision`
- `stageIndex`
- `stageCount`
- `width`
- `height`
- `sourceTextureRevision`
- `bridgeCopyCount`
- `cpuPixelComputeUsed=false`
- `intermediateReadbackCount=0`

source revision이 명시되지 않거나 raw cache revision만 있는 경우 canonical publication을 거부한다.

## 7. Imaginary Source Mode 계약

### 7.1 `local-anisotropy-compat`

legacy beta=0 의미를 보존한다.

```text
gx = 0.5 × (real[x+1,y] - real[x-1,y])
gy = 0.5 × (real[x,y+1] - real[x,y-1])
A = clamp((abs(gx) + abs(gy)) × localAnisotropyScale, 0, 1)
Φ = clamp(imaginaryGain × A, -imaginaryClamp, imaginaryClamp)
```

- boundary fetch는 clamp-to-edge
- source confidence는 five-sample minimum
- nonfinite sample 하나라도 있으면 invalid
- 이 모드만 legacy `alpha`와 `aScale` mapping을 허용

### 7.2 `spectral-quadrature`

input semantic:

```text
tdt.analysis.spectral.window-complex-phase.v1
```

SQ03 field는 `window-grid`이므로 stage pixel로 투영해야 한다. `windowLayoutReceipt`가 필수다.

각 후보 window의 `(cosφ, sinφ)`를 magnitude와 spatial weight로 합산하고 정규화한다.

```text
v = Σ(w_spatial × validity × magnitudeWeight × (cosφ, sinφ))
phaseUnit = normalize(v)
phaseConfidence = clamp(length(v) / Σweights, 0, 1)
amplitude = clamp(weightedMagnitude × spectralMagnitudeScale, 0, 1)
Φ = imaginaryGain × amplitude × phaseUnit.y
```

즉 dominant coefficient의 quadrature 성분 `sinφ`를 signed imaginary source로 사용한다. phase angle 자체를 scalar로 선형 보간하지 않는다.

### 7.3 `hannakairo-defect`

input semantic:

```text
tdt.analysis.hannakairo.winding-defect.v1
```

stage-plaquette field를 stage-pixel로 투영한다. 각 pixel은 인접한 최대 4개 plaquette를 confidence-weighted gather한다.

```text
signedDefect = Σ(weight × signedCharge × defectConfidence) / Σ(weight × defectConfidence)
sourceConfidence = clamp(Σ(weight × defectConfidence) / Σweight, 0, 1)
Φ = imaginaryGain × defectScale × signedDefect × sourceConfidence
```

- plaquette 밖 extrapolation 금지
- 유효 plaquette가 없으면 invalid
- charge sign을 절대값으로 바꾸지 않음

### 7.4 `tensor-curvature`

input semantic:

```text
tdt.analysis.tensor.curvature.r1c.future.v1
```

이 source semantic을 EFFECTIVE_EXECUTION claim으로 가진 field가 존재할 때만 실행한다.

```text
Φ = clamp(imaginaryGain × curvatureScale × curvature, -imaginaryClamp, imaginaryClamp)
```

현재 parent artifact에는 canonical curvature producer가 없으므로 제품 request는 `E_QWAVE_IMAGINARY_SOURCE_NOT_PROMOTED`로 fail-closed한다. Fixture-only GPU source는 validation에서 허용한다.

### 7.5 `hilbert-quadrature`

input semantic:

```text
tdt.analysis.qwave.hilbert-phase.v1
```

입력 channel은 canonicalized phase unit과 magnitude, confidence를 가져야 한다.

```text
Φ = imaginaryGain × clamp(magnitude × hilbertMagnitudeScale, 0, 1) × sinPhase × confidence
```

현재 canonical Hilbert producer가 없으므로 실제 제품 request는 fail-closed한다.

## 8. Source Selection Truth

request에는 다음 digest가 포함돼야 한다.

```text
sourceSelectionDigest = SHA256(canonical-json({
  mode,
  realFieldId, realGeneration, realExecutionReceiptDigest,
  imaginarySourceFieldId, imaginarySourceGeneration,
  imaginarySourceExecutionReceiptDigest,
  windowLayoutReceiptDigest,
  sourceSurfaceId, sourceRevision, stageIndex, stageCount
}))
```

선택하지 않은 source handle은 request에 포함할 수 없다. shader는 선택되지 않은 source texture를 bind하거나 읽지 않는다. universal mega-bindgroup은 금지한다.

mode별 pipeline과 bind-group layout을 분리하거나, 동일 layout을 사용하더라도 선택되지 않은 resource를 neutral dummy로 숨겨 읽는 방식은 금지한다. Source read count가 receipt에 기록돼야 한다.

## 9. Analytic Q-wave 수학

### 9.1 Complex input

```text
Z = a + ib
a = realScale × realScalar
b = selected imaginary component Φ
```

realScalar는 `[0,1]` compatibility input이다. `realScale` 적용 후 finite 여부를 검사한다.

### 9.2 Principal complex square root

product WGSL은 closed-form principal root를 사용한다.

```text
r = sqrt(a² + b²)
u = sqrt(max(0, (r + a) / 2))
vAbs = sqrt(max(0, (r - a) / 2))
v = signNonNegative(b) × vAbs
Q = u + iv
```

`signNonNegative(0) = +1`로 고정한다. 따라서 `sqrt(-x + i0)`은 양의 허수축 principal root를 선택한다.

### 9.3 Output encoding

```text
magnitude = sqrt(r)
phaseUnit = if magnitude > epsilon then normalize((u,v)) else (1,0)
confidence = min(realConfidence, imaginarySourceConfidence)
```

analytic output:

```text
(magnitude, phaseUnit.x, phaseUnit.y, confidence)
```

### 9.4 Invalid output

다음 중 하나라도 만족하면 output은 invalid neutral이다.

- real field invalid
- imaginary source invalid
- source or real nonfinite
- source revision mismatch
- stage mismatch
- device epoch mismatch
- magnitude overflow guard failure
- selected source semantic mismatch

```text
imaginary field = (0,0,0,0)
analytic field  = (0,1,0,0)
```

invalid source를 real-only Q-wave로 자동 강등하지 않는다.

## 10. Parameter ABI

Canonical parameter object:

```ts
interface QWaveAnalyticParameters {
  readonly imaginarySourceMode: QWaveImaginarySourceMode;
  readonly realScale: number;
  readonly imaginaryGain: number;
  readonly imaginaryClamp: number;
  readonly localAnisotropyScale: number;
  readonly spectralMagnitudeScale: number;
  readonly defectScale: number;
  readonly curvatureScale: number;
  readonly hilbertMagnitudeScale: number;
  readonly epsilon: number;
  readonly parameterDigest: string;
}
```

기본값:

```text
realScale               = 1.0
imaginaryGain           = 0.85
imaginaryClamp          = 1.0
localAnisotropyScale    = 12.0
spectralMagnitudeScale  = 1.0
defectScale             = 1.0
curvatureScale          = 1.0
hilbertMagnitudeScale   = 1.0
epsilon                 = 1e-6
```

`time`, `kelvin`, `freq`, `speed`, `phaseBias`, `alphaMax`, color palette는 analytic ABI에 존재할 수 없다.

## 11. GPU Pass 구조

### 11.1 Pass A: imaginary source normalization

mode별 전용 entry point 또는 전용 shader asset을 사용한다.

```text
local-anisotropy-compat → qwave-imag-local-aniso.wgsl
spectral-quadrature     → qwave-imag-spectral-project.wgsl
hannakairo-defect       → qwave-imag-defect-project.wgsl
tensor-curvature        → qwave-imag-curvature.wgsl
hilbert-quadrature      → qwave-imag-hilbert.wgsl
```

Pass A output은 analysis-owned `rgba16float` imaginary texture다.

### 11.2 Pass B: analytic principal square root

```text
qwave-analytic-principal-sqrt.wgsl
```

real field와 Pass A output을 읽고 canonical analytic texture를 쓴다.

### 11.3 Submission

```text
command buffer count = 1
queue submission count = 1
dispatch count = 2
intermediate readback count = 0
```

Pass A와 Pass B 사이에 CPU fence나 JS-visible result extraction을 두지 않는다.

## 12. Atomic Field Publication

imaginary component와 analytic complex field는 같은 build lease에서 `publishFieldSet()`으로 출판한다.

```text
둘 다 published
또는
둘 다 unpublished
```

공통 metadata:

- `sourceSelectionDigest`
- `imaginarySourceMode`
- `realFieldId / generation`
- `imaginarySourceFieldId / generation`
- `windowLayoutReceiptDigest or null`
- `principalBranchId`
- `parameterDigest`
- `executionDetailDigest`
- `queueSubmissionCount=1`
- `intermediateReadbackCount=0`
- `visualInputsConsumed=false`

field-set digest는 output 순서를 semantic ID lexical order로 정규화해 계산한다.

## 13. Legacy `qwaveRG` Compatibility Adapter

기존 소비자는 다음 layout을 기대한다.

```text
R = AQ magnitude
G = phase01
B = legacy source amplitude
A = mask
```

canonical analytic field의 G/B는 cos/sin이므로 raw binding 호환이 아니다. 직접 연결을 금지한다.

별도 adapter shader:

```text
qwave-analytic-to-rg-compat.wgsl
```

adapter mapping:

```text
AQ = clamp(analytic.r, 0, 1)
phase = atan2(analytic.b, analytic.g)
phase01 = fract((phase + π) / 2π)
sourceAmplitude = imaginary.g
mask = analytic.a
```

public facade `ensureQWaveRGWGPU()`는 유지하지만 다음 방식으로 바뀐다.

1. raw `dkView` 입력을 canonical real bridge에 등록한다.
2. `local-anisotropy-compat` analytic request를 실행한다.
3. canonical outputs을 pin한다.
4. compatibility adapter texture를 생성한다.
5. legacy `{tex, view, format, rev}` shape를 반환한다.

compatibility texture는 Analysis Field가 아니며 `tdt.compat.qwave.rg-phase01.v1` resource class로 receipt에 기록한다.

legacy globals mapping:

```text
__QWAVE_ALPHA  → imaginaryGain
__QWAVE_ASCALE → localAnisotropyScale
```

이 mapping은 facade 안에서만 허용되며 canonical service는 window global을 읽지 않는다.

## 14. Visual Wave Separation

### 14.1 Visual semantic

```text
tdt.visual.qwave.animated-overlay.v1
```

이 resource는 Analysis Field Authority에 등록할 수 없다.

### 14.2 Visual-only 입력

- time
- screen UV
- Kelvin
- visual frequency
- visual speed
- visual phase bias
- visual gain
- alphaMax
- cyan-magenta palette

이 값들은 analytic request digest, parameter digest, field receipt에 들어갈 수 없다.

### 14.3 Global namespace 분리

visual globals:

```text
__QWAVE_VISUAL_ENABLED
__QWAVE_VISUAL_GAIN
__QWAVE_VISUAL_FREQ
__QWAVE_VISUAL_SPEED
__QWAVE_VISUAL_PHASE_BIAS
__QWAVE_VISUAL_ALPHA_MAX
__QWAVE_VISUAL_MAX_DIM
__QWAVE_VISUAL_KELVIN
```

analytic globals는 canonical API에 만들지 않는다. 기존 `__QWAVE_*` visual globals는 one-time migration 후 visual namespace로만 이동한다.

### 14.4 CPU path 제거

visual product path에서도 다음을 제거한다.

- Canvas `getImageData()` Kelvin estimation
- WebGPU texture CPU readback fallback
- CPU RGBA upload fallback

Kelvin은 explicit UI value 또는 default 6500K를 사용한다. canvas bridge가 실패하면 `E_QWAVE_VISUAL_BRIDGE_UNAVAILABLE`로 실패한다.

### 14.5 소비 경계

- visual overlay는 Preview visual layer에서만 사용 가능
- visual overlay는 Analysis Field consumer로 등록 금지
- R1D policy와 R2 EWA는 visual texture를 pin할 수 없음
- analytic field는 cyan-magenta overlay shader의 입력으로 직접 사용 금지
- `attach_qwave_bake_pass.js`는 visual compatibility effect로 분류
- 향후 analytic field의 제품 영향은 Analysis Policy Fusion을 통해서만 허용

## 15. Lifecycle

모든 job은 다음 상태를 따른다.

```text
REQUESTED
→ INPUTS_PINNED
→ RESOURCES_ALLOCATED
→ SUBMITTED
→ FENCE_COMPLETED
→ FIELD_SET_PUBLISHED
→ INPUTS_RELEASED
```

실패 또는 취소:

```text
FAILED / SUPERSEDED / INVALIDATED
→ unpublished resources destroyed
→ pins released
→ GPU lease released
```

device-loss participant는 pipeline bundle, active job arena, compatibility adapter cache를 invalidate한다. stale device epoch output은 출판할 수 없다.

## 16. Receipt

Execution detail receipt는 최소 다음을 포함한다.

- `schemaVersion`
- `algorithmId`
- `principalBranchId`
- `jobId`
- `producerId`
- `implementationId`
- `sourceSurfaceId`
- `sourceRevision`
- `stageIndex`
- `stageCount`
- `deviceIdentityDigest`
- `deviceEpoch`
- `realSemanticId`
- `realFieldId`
- `realGeneration`
- `realExecutionReceiptDigest`
- `imaginarySourceMode`
- `imaginarySourceSemanticId`
- `imaginarySourceFieldId`
- `imaginarySourceGeneration`
- `imaginarySourceExecutionReceiptDigest`
- `windowLayoutReceiptDigest`
- `sourceSelectionDigest`
- `parameterDigest`
- `shaderSetDigest`
- `pipelineIds`
- `dispatchCount`
- `queueSubmissionCount`
- `cpuPixelComputeUsed`
- `webglPixelComputeUsed`
- `canvasPixelComputeUsed`
- `intermediateReadbackCount`
- `visualInputsConsumed`
- `atomicFieldSetPublication`
- `outputFieldSetDigest`
- `executionDetailDigest`

## 17. Stable Error Registry

| 코드 | 의미 |
|---|---|
| `E_QWAVE_REAL_FIELD_REQUIRED` | real Analysis Field handle 누락 |
| `E_QWAVE_REAL_SEMANTIC_MISMATCH` | real semantic 불일치 |
| `E_QWAVE_REAL_BRIDGE_REVISION_REQUIRED` | compat bridge source revision 누락 |
| `E_QWAVE_IMAGINARY_SOURCE_REQUIRED` | 선택 mode source handle 누락 |
| `E_QWAVE_IMAGINARY_SOURCE_CONFLICT` | 선택하지 않은 source handle 동시 제공 |
| `E_QWAVE_IMAGINARY_SOURCE_NOT_PROMOTED` | future source producer 미승격 |
| `E_QWAVE_IMAGINARY_SEMANTIC_MISMATCH` | source semantic 불일치 |
| `E_QWAVE_WINDOW_LAYOUT_REQUIRED` | spectral mode layout receipt 누락 |
| `E_QWAVE_WINDOW_LAYOUT_MISMATCH` | layout digest 또는 source mismatch |
| `E_QWAVE_STAGE_MISMATCH` | stage identity 불일치 |
| `E_QWAVE_SOURCE_REVISION_MISMATCH` | source revision 불일치 |
| `E_QWAVE_DEVICE_EPOCH_MISMATCH` | device epoch 불일치 |
| `E_QWAVE_PARAMETER_INVALID` | parameter 범위 오류 |
| `E_QWAVE_RESOURCE_LIMIT` | texture 또는 dispatch limit 초과 |
| `E_QWAVE_SHADER_COMPILE_FAILED` | WGSL compilation error |
| `E_QWAVE_BIND_GROUP_FAILED` | bind-group 생성 실패 |
| `E_QWAVE_CANCELLED` | AbortSignal 또는 cancellation epoch 취소 |
| `E_QWAVE_DEVICE_LOST` | 실행 중 device loss |
| `E_QWAVE_ATOMIC_PUBLICATION_FAILED` | 2-field atomic publication 실패 |
| `E_QWAVE_CPU_PIXEL_COMPUTE_FORBIDDEN` | CPU pixel path 진입 |
| `E_QWAVE_INTERMEDIATE_READBACK_FORBIDDEN` | intermediate readback 시도 |
| `E_QWAVE_VISUAL_RESOURCE_NOT_ANALYSIS` | visual resource를 analysis input으로 전달 |
| `E_QWAVE_VISUAL_BRIDGE_UNAVAILABLE` | visual GPU canvas bridge 실패 |
| `E_QWAVE_COMPAT_ADAPTER_FAILED` | legacy RG adapter 실패 |

## 18. WGSL 및 Source 자산

### 18.1 Product assets

- `qwave-imag-local-aniso.wgsl`
- `qwave-imag-spectral-project.wgsl`
- `qwave-imag-defect-project.wgsl`
- `qwave-imag-curvature.wgsl`
- `qwave-imag-hilbert.wgsl`
- `qwave-analytic-principal-sqrt.wgsl`
- `qwave-analytic-to-rg-compat.wgsl`

### 18.2 Validation assets

- `qwave-analytic-fixture-generator.wgsl`
- `qwave-analytic-reference-polar.wgsl`
- `qwave-analytic-compare.wgsl`
- `qwave-source-selection-counter.wgsl`

### 18.3 TypeScript modules

- `app/src/runtime/analysis/qwave/qwave-phase-types.ts`
- `app/src/runtime/analysis/qwave/qwave-phase-parameters.ts`
- `app/src/runtime/analysis/qwave/qwave-phase-job-arena.ts`
- `app/src/runtime/analysis/qwave/qwave-phase-receipt.ts`
- `app/src/runtime/analysis/qwave/qwave-phase-service.ts`
- `app/src/runtime/analysis/qwave/qwave-real-delta-k-compat-bridge.ts`
- `app/src/runtime/analysis/qwave/qwave-compat-rg-adapter.ts`

## 19. Validation Strategy

### 19.1 Independent reference

Product shader는 closed-form principal square root를 사용한다. Independent GPU reference는 polar form을 사용한다.

```text
r = length((a,b))
theta = atan2(b,a)
Qref = sqrt(r) × (cos(theta/2), sin(theta/2))
```

두 구현이 동일한 algebraic code path를 공유하지 않게 한다.

### 19.2 Required fixtures

- `sqrt(1 + 0i) = 1 + 0i`
- `sqrt(0 + 1i) = √0.5 + i√0.5`
- `sqrt(0 - 1i) = √0.5 - i√0.5`
- `sqrt(-1 + i0) = 0 + i`
- positive and negative imaginary sweep
- negative real-axis near-branch samples
- zero magnitude neutral phase
- local anisotropy constant field
- local anisotropy x-ramp and y-ramp
- spectral phase `0`, `π/2`, `π`, `-π/2`
- spectral window-grid projection boundary
- Hannakairo `+1/2`, `-1/2`, zero defect
- tensor curvature positive, negative, zero fixture
- Hilbert phase positive and negative quadrature fixture
- nonfinite input invalidation
- source mode exclusivity counter
- visual time mutation leaves analytic digest unchanged
- analytic source mutation leaves visual parameter state unchanged
- legacy RG adapter phase01 mapping
- device-loss before fence and after fence

### 19.3 Error tolerances

Source Bake mock은 f64 host math로 identity와 branch policy를 검증한다. Physical GPU에서는 independent reference와 다음을 검사한다.

```text
maxAbsError magnitude ≤ 2e-3
phase unit dot ≥ 0.999
reconstructed square maxAbsError ≤ 4e-3
NaN count = 0
Infinity count = 0
source-selection wrong-read count = 0
```

## 20. GPU-only 및 보안 경계

Canonical analytic path에서 금지:

- `getImageData()`
- `readPixels()`
- `mapAsync()` on product field
- `GPUBufferUsage.MAP_READ` on intermediate resource
- CPU complex sqrt
- CPU phase calculation
- CPU source projection
- WebGL texture input
- Canvas image input
- WebGPU result CPU upload
- visual animated texture as analytic source
- silent real-only fallback

Validation comparator는 compact scalar summary buffer만 제한적으로 readback할 수 있다. Product field, source pixel, full output texture readback은 금지한다.

## 21. Active Graph 및 Asset Closure

다음 node를 Active Graph에 편입한다.

- qwave-phase-service.ts
- qwave-real-delta-k-compat-bridge.ts
- qwave-compat-rg-adapter.ts
- 7 product WGSL assets
- 4 validation WGSL assets

visual nodes는 별도 root 또는 visual compatibility branch로 분류한다. analytic producer edge와 visual producer edge가 동일 execution claim에 합쳐지면 Gate 실패다.

Runtime Asset Manifest는 각 WGSL의 route, source path, SHA-256, asset class, owner consumer ID를 봉인한다.

## 22. Legacy Migration

### 22.1 보존할 public API

- `ensureQWaveRGWGPU()`
- `pipeline.qwaveRGTexWGPU`
- `pipeline.qwaveRGViewWGPU`
- `pipeline.qwaveRGViewWGPU` consumer compatibility
- `ensureQwaveTexture()` visual alias

### 22.2 퇴역할 내부 권한

- legacy builder의 raw pipeline cache ownership
- job마다 미폐기 uniform buffer
- fence 전 revision publication
- raw ΔK texture direct canonical input
- analytic service의 window global 접근
- visual CPU readback fallback
- WebGL→CPU→WebGPU qwave promotion bridge

### 22.3 소비자 migration

- `qwave_warp_webgpu_pass`와 기존 final color pass는 compatibility RG adapter를 통해서만 연결
- 새 R1D policy fusion은 `tdt.analysis.qwave.analytic-complex.v2`를 직접 pin
- visual overlay는 analytic handle을 받지 않음

## 23. Promotion 상태 전이

```text
HANNAKAIRO_GATE_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU
→ QWAVE_PHASE_03_SOURCE_BAKED_AWAITING_PACKAGED_GPU
→ QWAVE_PHASE_03_VERIFIED_UNPROMOTED
```

Source Bake에서 Production Pointer를 갱신하지 않는다. Physical GPU와 Windows packaged evidence 전에는 `PIXEL_VERIFIED`, `PACKAGED_VERIFIED` claim을 발행할 수 없다.

## 24. Gate Matrix

| Gate | Group | Requirement | Source Bake expectation |
|---|---|---|---|
| `QP03-001` | Parent·Baseline | Parent ZIP SHA-256 일치 | PASS |
| `QP03-002` | Parent·Baseline | Parent Source Seal 일치 | PASS |
| `QP03-003` | Parent·Baseline | HG02 source state 확인 | PASS |
| `QP03-004` | Parent·Baseline | Truth-00 Authority 존재 | PASS |
| `QP03-005` | Parent·Baseline | SQ02 producer inventory 존재 | PASS |
| `QP03-006` | Parent·Baseline | SQ03 spectral phase semantic 존재 | PASS |
| `QP03-007` | Parent·Baseline | HP01 defect semantic 존재 | PASS |
| `QP03-008` | Parent·Baseline | R1C tensor semantic 존재 | PASS |
| `QP03-009` | Parent·Baseline | Active Graph baseline digest 기록 | PASS |
| `QP03-010` | Parent·Baseline | Runtime Asset baseline 기록 | PASS |
| `QP03-011` | Parent·Baseline | Production Pointer unpromoted 확인 | PASS |
| `QP03-012` | Parent·Baseline | 기존 Q-wave inventory digest 기록 | PASS |
| `QP03-013` | Inventory·Semantic | legacy analytic builder compatibility 분류 | PASS |
| `QP03-014` | Inventory·Semantic | visual qwave visual-only 분류 | PASS |
| `QP03-015` | Inventory·Semantic | analytic v1 draft 동결 | PASS |
| `QP03-016` | Inventory·Semantic | analytic v2 descriptor 생성 | PASS |
| `QP03-017` | Inventory·Semantic | imaginary-component descriptor 생성 | PASS |
| `QP03-018` | Inventory·Semantic | real-delta-k-compat descriptor 생성 | PASS |
| `QP03-019` | Inventory·Semantic | visual semantic가 analysis descriptor 밖에 존재 | PASS |
| `QP03-020` | Inventory·Semantic | qwave spectral draft alias 비출판 | PASS |
| `QP03-021` | Inventory·Semantic | hilbert source semantic future 유지 | PASS |
| `QP03-022` | Inventory·Semantic | local-aniso v1 compatibility 유지 | PASS |
| `QP03-023` | Inventory·Semantic | channel ranges finite truth | PASS |
| `QP03-024` | Inventory·Semantic | neutral values 정확성 | PASS |
| `QP03-025` | Inventory·Semantic | coordinate spaces 정확성 | PASS |
| `QP03-026` | Inventory·Semantic | interpolation policies 정확성 | PASS |
| `QP03-027` | Inventory·Semantic | semantic digest 결정론 | PASS |
| `QP03-028` | Inventory·Semantic | registry version 승격 | PASS |
| `QP03-029` | Real Input Bridge | real bridge producer 등록 | PASS |
| `QP03-030` | Real Input Bridge | explicit source revision 요구 | PASS |
| `QP03-031` | Real Input Bridge | explicit source surface identity 요구 | PASS |
| `QP03-032` | Real Input Bridge | stage identity 요구 | PASS |
| `QP03-033` | Real Input Bridge | deltaK parameter digest 요구 | PASS |
| `QP03-034` | Real Input Bridge | raw dk texture direct input 거부 | PASS |
| `QP03-035` | Real Input Bridge | analysis-owned texture allocation | PASS |
| `QP03-036` | Real Input Bridge | copyTextureToTexture 사용 | PASS |
| `QP03-037` | Real Input Bridge | CPU copy 0 | PASS |
| `QP03-038` | Real Input Bridge | intermediate readback 0 | PASS |
| `QP03-039` | Real Input Bridge | queue fence 전 publication 금지 | PASS |
| `QP03-040` | Real Input Bridge | source texture와 output ownership 분리 | PASS |
| `QP03-041` | Real Input Bridge | device epoch 결속 | PASS |
| `QP03-042` | Real Input Bridge | copy failure resource disposal | PASS |
| `QP03-043` | Real Input Bridge | publication metadata completeness | PASS |
| `QP03-044` | Real Input Bridge | real field neutral invalid contract | PASS |
| `QP03-045` | Real Input Bridge | real field format rgba16float | PASS |
| `QP03-046` | Real Input Bridge | compatibility truth label | PASS |
| `QP03-047` | Real Input Bridge | bridge execution receipt | PASS |
| `QP03-048` | Real Input Bridge | bridge device-loss invalidation | PASS |
| `QP03-049` | Imaginary Source Selection | source mode enum exact | PASS |
| `QP03-050` | Imaginary Source Selection | exactly one mode required | PASS |
| `QP03-051` | Imaginary Source Selection | unselected handles 거부 | PASS |
| `QP03-052` | Imaginary Source Selection | sourceSelectionDigest 생성 | PASS |
| `QP03-053` | Imaginary Source Selection | local mode semantic validation | PASS |
| `QP03-054` | Imaginary Source Selection | spectral mode semantic validation | PASS |
| `QP03-055` | Imaginary Source Selection | defect mode semantic validation | PASS |
| `QP03-056` | Imaginary Source Selection | curvature mode semantic validation | PASS |
| `QP03-057` | Imaginary Source Selection | hilbert mode semantic validation | PASS |
| `QP03-058` | Imaginary Source Selection | local mode no external source handle | PASS |
| `QP03-059` | Imaginary Source Selection | spectral layout receipt 필수 | PASS |
| `QP03-060` | Imaginary Source Selection | spectral source revision 일치 | PASS |
| `QP03-061` | Imaginary Source Selection | defect stage identity 일치 | PASS |
| `QP03-062` | Imaginary Source Selection | curvature producer claim 요구 | PASS |
| `QP03-063` | Imaginary Source Selection | hilbert producer claim 요구 | PASS |
| `QP03-064` | Imaginary Source Selection | future source fail-closed | PASS |
| `QP03-065` | Imaginary Source Selection | source field device epoch 일치 | PASS |
| `QP03-066` | Imaginary Source Selection | source handle pin currentness | PASS |
| `QP03-067` | Imaginary Source Selection | mode-specific bind-group layout | PASS |
| `QP03-068` | Imaginary Source Selection | unselected resource read 0 | PASS |
| `QP03-069` | Imaginary Source Selection | source selection counter asset | PASS |
| `QP03-070` | Imaginary Source Selection | source confidence contract | PASS |
| `QP03-071` | Imaginary Source Selection | signed scalar preservation | PASS |
| `QP03-072` | Imaginary Source Selection | imaginary clamp 적용 | PASS |
| `QP03-073` | Imaginary Source Selection | nonfinite source invalid | PASS |
| `QP03-074` | Imaginary Source Selection | imaginary output semantic truth | PASS |
| `QP03-075` | Imaginary Source Selection | imaginary metadata source mode | PASS |
| `QP03-076` | Imaginary Source Selection | imaginary receipt source provenance | PASS |
| `QP03-077` | Projection·Normalization | local central difference x | PASS |
| `QP03-078` | Projection·Normalization | local central difference y | PASS |
| `QP03-079` | Projection·Normalization | local boundary clamp | PASS |
| `QP03-080` | Projection·Normalization | local five-sample confidence | PASS |
| `QP03-081` | Projection·Normalization | local legacy alpha mapping | PASS |
| `QP03-082` | Projection·Normalization | local legacy aScale mapping | PASS |
| `QP03-083` | Projection·Normalization | spectral phase vector interpolation | PASS |
| `QP03-084` | Projection·Normalization | spectral scalar angle interpolation 금지 | PASS |
| `QP03-085` | Projection·Normalization | spectral magnitude weighting | PASS |
| `QP03-086` | Projection·Normalization | spectral window coverage 검사 | PASS |
| `QP03-087` | Projection·Normalization | spectral no nearest fallback | PASS |
| `QP03-088` | Projection·Normalization | spectral no extrapolation | PASS |
| `QP03-089` | Projection·Normalization | spectral quadrature sin phase | PASS |
| `QP03-090` | Projection·Normalization | defect plaquette-to-pixel gather | PASS |
| `QP03-091` | Projection·Normalization | defect signed charge 보존 | PASS |
| `QP03-092` | Projection·Normalization | defect confidence weighting | PASS |
| `QP03-093` | Projection·Normalization | defect no valid neighbor invalid | PASS |
| `QP03-094` | Projection·Normalization | curvature signed value 보존 | PASS |
| `QP03-095` | Projection·Normalization | curvature scale 적용 | PASS |
| `QP03-096` | Projection·Normalization | hilbert phase unit 검증 | PASS |
| `QP03-097` | Projection·Normalization | hilbert quadrature sin phase | PASS |
| `QP03-098` | Projection·Normalization | hilbert magnitude scale | PASS |
| `QP03-099` | Projection·Normalization | all modes imaginary clamp | PASS |
| `QP03-100` | Projection·Normalization | all modes validity alpha | PASS |
| `QP03-101` | Projection·Normalization | all modes source confidence B | PASS |
| `QP03-102` | Projection·Normalization | stage output single writer | PASS |
| `QP03-103` | Projection·Normalization | projection deterministic digest | PASS |
| `QP03-104` | Projection·Normalization | projection zero CPU compute | PASS |
| `QP03-105` | Analytic Complex Math | Z real component packing | PASS |
| `QP03-106` | Analytic Complex Math | Z imaginary component packing | PASS |
| `QP03-107` | Analytic Complex Math | principal branch ID 고정 | PASS |
| `QP03-108` | Analytic Complex Math | closed-form radius 계산 | PASS |
| `QP03-109` | Analytic Complex Math | u nonnegative root | PASS |
| `QP03-110` | Analytic Complex Math | v sign policy | PASS |
| `QP03-111` | Analytic Complex Math | signed zero positive policy | PASS |
| `QP03-112` | Analytic Complex Math | negative real axis principal root | PASS |
| `QP03-113` | Analytic Complex Math | magnitude sqrt(radius) | PASS |
| `QP03-114` | Analytic Complex Math | phase unit normalization | PASS |
| `QP03-115` | Analytic Complex Math | zero magnitude phase neutral | PASS |
| `QP03-116` | Analytic Complex Math | confidence minimum fusion | PASS |
| `QP03-117` | Analytic Complex Math | real invalid output neutral | PASS |
| `QP03-118` | Analytic Complex Math | imag invalid output neutral | PASS |
| `QP03-119` | Analytic Complex Math | nonfinite output invalid | PASS |
| `QP03-120` | Analytic Complex Math | overflow guard | PASS |
| `QP03-121` | Analytic Complex Math | analytic format rgba16float | PASS |
| `QP03-122` | Analytic Complex Math | analytic semantic v2 only | PASS |
| `QP03-123` | Analytic Complex Math | v1 canonical publication 금지 | PASS |
| `QP03-124` | Analytic Complex Math | Q squared reconstructs Z fixture | PASS |
| `QP03-125` | Analytic Complex Math | polar independent reference | PASS |
| `QP03-126` | Analytic Complex Math | product-reference code path 분리 | PASS |
| `QP03-127` | Analytic Complex Math | phase dot comparator | PASS |
| `QP03-128` | Analytic Complex Math | magnitude error comparator | PASS |
| `QP03-129` | Analytic Complex Math | NaN counter | PASS |
| `QP03-130` | Analytic Complex Math | Infinity counter | PASS |
| `QP03-131` | Analytic Complex Math | first mismatch record | PASS |
| `QP03-132` | Analytic Complex Math | analytic output single writer | PASS |
| `QP03-133` | Publication·Lifecycle | one build lease two outputs | PASS |
| `QP03-134` | Publication·Lifecycle | one command buffer | PASS |
| `QP03-135` | Publication·Lifecycle | one queue submission | PASS |
| `QP03-136` | Publication·Lifecycle | two product dispatches | PASS |
| `QP03-137` | Publication·Lifecycle | markSubmission exact ledger | PASS |
| `QP03-138` | Publication·Lifecycle | fence completion required | PASS |
| `QP03-139` | Publication·Lifecycle | publishFieldSet atomic | PASS |
| `QP03-140` | Publication·Lifecycle | partial publication rollback | PASS |
| `QP03-141` | Publication·Lifecycle | field-set digest deterministic | PASS |
| `QP03-142` | Publication·Lifecycle | output metadata digest deterministic | PASS |
| `QP03-143` | Publication·Lifecycle | input pins release finally | PASS |
| `QP03-144` | Publication·Lifecycle | GPU lease release finally | PASS |
| `QP03-145` | Publication·Lifecycle | unpublished textures destroyed | PASS |
| `QP03-146` | Publication·Lifecycle | cancel before submit | PASS |
| `QP03-147` | Publication·Lifecycle | cancel after submit before fence | PASS |
| `QP03-148` | Publication·Lifecycle | device-loss invalidation | PASS |
| `QP03-149` | Publication·Lifecycle | stale epoch publication 거부 | PASS |
| `QP03-150` | Publication·Lifecycle | job arena bounded | PASS |
| `QP03-151` | Publication·Lifecycle | pipeline bundle epoch cache | PASS |
| `QP03-152` | Publication·Lifecycle | repeated failure no leak | PASS |
| `QP03-153` | Visual Separation·Legacy | visual semantic analysis rejection | PASS |
| `QP03-154` | Visual Separation·Legacy | visual parameters absent analytic ABI | PASS |
| `QP03-155` | Visual Separation·Legacy | analytic parameters absent visual ABI | PASS |
| `QP03-156` | Visual Separation·Legacy | visual global namespace migration | PASS |
| `QP03-157` | Visual Separation·Legacy | analytic service no window global | PASS |
| `QP03-158` | Visual Separation·Legacy | visual CPU Kelvin estimator inactive | PASS |
| `QP03-159` | Visual Separation·Legacy | visual CPU readback fallback 제거 | PASS |
| `QP03-160` | Visual Separation·Legacy | visual bridge failure fail-closed | PASS |
| `QP03-161` | Visual Separation·Legacy | visual time digest isolation | PASS |
| `QP03-162` | Visual Separation·Legacy | visual Kelvin digest isolation | PASS |
| `QP03-163` | Visual Separation·Legacy | legacy ensureQWaveRGWGPU preserved | PASS |
| `QP03-164` | Visual Separation·Legacy | legacy alpha mapping | PASS |
| `QP03-165` | Visual Separation·Legacy | legacy aScale mapping | PASS |
| `QP03-166` | Visual Separation·Legacy | compat RG adapter required | PASS |
| `QP03-167` | Visual Separation·Legacy | canonical field raw legacy bind 거부 | PASS |
| `QP03-168` | Visual Separation·Legacy | compat resource non-authoritative | PASS |
| `QP03-169` | Visual Separation·Legacy | compat phase01 mapping | PASS |
| `QP03-170` | Visual Separation·Legacy | compat mask confidence mapping | PASS |
| `QP03-171` | Visual Separation·Legacy | attach bake visual compatibility 분류 | PASS |
| `QP03-172` | Visual Separation·Legacy | R1D future consumer accepts analytic v2 | PASS |
| `QP03-173` | Source·Mock Validation | TypeScript syntax | PASS |
| `QP03-174` | Source·Mock Validation | WGSL structural balance | PASS |
| `QP03-175` | Source·Mock Validation | Runtime Asset digest closure | PASS |
| `QP03-176` | Source·Mock Validation | Active Graph node closure | PASS |
| `QP03-177` | Source·Mock Validation | GPU Authority shader ownership | PASS |
| `QP03-178` | Source·Mock Validation | direct GPU authority leak 0 | PASS |
| `QP03-179` | Source·Mock Validation | Stable Error Registry completeness | PASS |
| `QP03-180` | Source·Mock Validation | principal root known fixtures | PASS |
| `QP03-181` | Source·Mock Validation | local anisotropy fixtures | PASS |
| `QP03-182` | Source·Mock Validation | spectral quadrature fixtures | PASS |
| `QP03-183` | Source·Mock Validation | defect source fixtures | PASS |
| `QP03-184` | Source·Mock Validation | curvature fixture contract | PASS |
| `QP03-185` | Source·Mock Validation | hilbert fixture contract | PASS |
| `QP03-186` | Source·Mock Validation | source selection exclusivity smoke | PASS |
| `QP03-187` | Source·Mock Validation | visual isolation smoke | PASS |
| `QP03-188` | Source·Mock Validation | atomic publication mock | PASS |
| `QP03-189` | Physical GPU·Packaged | physical WGSL compilation | DEFERRED |
| `QP03-190` | Physical GPU·Packaged | physical bind-group validation | DEFERRED |
| `QP03-191` | Physical GPU·Packaged | closed-form vs polar GPU parity | DEFERRED |
| `QP03-192` | Physical GPU·Packaged | Q squared reconstruction parity | DEFERRED |
| `QP03-193` | Physical GPU·Packaged | physical source selection read counter | DEFERRED |
| `QP03-194` | Physical GPU·Packaged | physical zero intermediate readback | DEFERRED |
| `QP03-195` | Physical GPU·Packaged | device-loss during Pass A | DEFERRED |
| `QP03-196` | Physical GPU·Packaged | device-loss during Pass B | DEFERRED |
| `QP03-197` | Physical GPU·Packaged | repeated job memory plateau | DEFERRED |
| `QP03-198` | Physical GPU·Packaged | renderer-worker boundary | DEFERRED |
| `QP03-199` | Physical GPU·Packaged | Windows packaged relaunch | DEFERRED |
| `QP03-200` | Physical GPU·Packaged | verified-unpromoted receipt | DEFERRED |
| `QP03-201` | Regression·Artifact Seal | Analysis and spectral predecessor regression | PASS |
| `QP03-202` | Regression·Artifact Seal | R1A through R2 and surface/export regression | PASS |
| `QP03-203` | Regression·Artifact Seal | changed-file manifest and patch completeness | PASS |
| `QP03-204` | Regression·Artifact Seal | independent ZIP Source Seal reproduction | PASS |

## 25. 예상 Source Bake 결과

```text
PASS:     192
DEFERRED:  12
FAIL:       0
TOTAL:    204
```

DEFERRED는 `QP03-189~200`의 실제 WebGPU 및 Windows packaged evidence뿐이다.

## 26. Definition of Done

Source Bake 완료 조건:

- analytic Q-wave service와 real bridge가 실제 source에 존재
- 5개 imaginary source mode contract가 코드와 registry에 반영
- 현재 승격되지 않은 curvature / Hilbert source는 fail-closed
- imaginary + analytic 2-field atomic publication 구현
- legacy qwaveRG facade가 canonical outputs 기반 adapter로 동작
- visual animated wave와 analytic field의 semantic, globals, receipts 분리
- analytic 및 visual product path의 CPU readback fallback 제거
- 192 PASS, 12 DEFERRED, 0 FAIL
- 전임 Analysis, Spectral, Hannakairo, R1A~R2, Runtime, Export, Build, Codec 회귀 유지
- 독립 ZIP에서 동일 Source Seal 재현

Physical promotion은 별도 packaged GPU run에서 수행한다.

## 27. 후속 패치

이 패치 이후 권장 순서:

```text
TDT-QWAVE-PHASE-03
→ TDT-GPU-TILE-ATLAS-01
→ TDT-ADAPTIVE-ANALYSIS-FUSION-01
→ TDT-SPECTRAL-PHASE-PROMOTION-01
```

Q-wave analytic field는 이번 패치에서 출판까지만 닫는다. R2 EWA에 직접 결합하는 것은 `TDT-ADAPTIVE-ANALYSIS-FUSION-01`의 권한이다.
