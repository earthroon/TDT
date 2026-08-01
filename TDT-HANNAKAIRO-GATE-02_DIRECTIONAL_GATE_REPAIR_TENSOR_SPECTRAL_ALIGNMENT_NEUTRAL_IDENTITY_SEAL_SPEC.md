# TDT-HANNAKAIRO-GATE-02
## Directional Gate Repair / Tensor·Spectral Alignment / Neutral Identity Seal

- **Spec ID:** `TDT-HANNAKAIRO-GATE-02`
- **State:** `SPEC_DEFINED_UNBAKED`
- **Parent Artifact:** `58_TDT_HANNAKAIRO_PHASE_01_AXIAL_DOUBLE_ANGLE_FIELD_WRAPPED_CIRCULATION_WINDING_DEFECT_GPU_TRUTH_SOURCE_BAKED_AWAITING_PACKAGED_GPU.zip`
- **Parent Source State:** `HANNAKAIRO_PHASE_01_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Target Source State:** `HANNAKAIRO_GATE_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU`
- **Promotion Policy:** source-baked, unpromoted, Production Pointer immutable
- **Execution Policy:** WebGPU/WGSL product compute only; CPU/WebGL/Canvas pixel fallback forbidden

---

## 0. 목적

본 명세는 기존 `phase_gate_hannakairo.frag`의 방향 게이트 의도를 폐기하지 않고, R1C 구조 텐서와 SQ03 spectral peak orientation을 동일한 axial 표현과 동일한 stage 좌표계에서 비교하는 canonical WebGPU producer로 수리한다.

이 producer는 topology producer가 아니다. Winding, defect charge, phase singularity를 계산하지 않는다. 그 권한은 `TDT-HANNAKAIRO-PHASE-01`에만 있다.

수리된 directional gate는 RGB 또는 Q 값을 직접 덮어쓰지 않는다. 결과는 Analysis Field Authority가 소유하는 stage-aligned policy field로 출판되며, 후속 adaptive policy consumer가 명시적으로 선택할 때만 사용한다.

핵심 목표는 다음과 같다.

1. Tensor tangent와 spectral feature tangent를 axial double-angle 공간에서 비교한다.
2. `window-grid` spectral field를 `stage-pixel` 좌표로 결정론적으로 투영한다.
3. 정렬도와 confidence를 분리해 출판한다.
4. 비활성화, 결측, invalid 입력에서 multiplier가 bit-exact `1.0`인 neutral identity를 보장한다.
5. 기존 GLSL facade 이름은 유지하되 제품 경로는 WebGPU Authority로 이행한다.
6. CPU 계산, WebGL fallback, Canvas 왕복, intermediate readback을 금지한다.

---

## 1. 현재 상태 사실

### 1.1 기존 GLSL

현재 `app/legacy-runtime/shaders/phase_gate_hannakairo.frag`는 다음 입력을 사용한다.

```text
uQ, uIxIy, uTheta, uKmag, uAlpha, uGate
```

기존 식은 gradient 정규화 벡터와 `kmag*(cos(theta),sin(theta))`의 내적을 다시 cosine에 넣은 뒤 `tanh`와 `clamp(0.85,1.0)`를 적용한다. 이 값은 spatial phase, wrapped circulation 또는 topology charge가 아니다.

### 1.2 현재 canonical 입력

- Tensor: `tdt.analysis.tensor.tangent-coherence-edge.r1c.v1`, coordinate `stage-pixel`
- Spectral orientation: `tdt.analysis.spectral.window-peak-orientation.v1`, coordinate `window-grid`
- Topology fields: HP01의 axial/coherence/defect fields

Tensor와 spectral orientation은 좌표계가 다르므로 직접 texture 좌표를 공유해서는 안 된다.

### 1.3 현재 directional producer

`tdt.analysis.producer.hannakairo.directional-compat`는 `future` 상태이며 실제 canonical WGSL asset과 service가 없다. Gate-02는 이 producer를 수리·승격한다.

---

## 2. 비범위

다음은 본 명세 범위가 아니다.

- FFT 실행 및 spectral reduction 재구현
- R1C tensor 수학 변경
- HP01 winding·defect 알고리즘 변경
- Q-wave analytic complex field 구현
- R1D/R2에 최종 fusion 가중치를 적용하는 작업
- Persistent GPU Tile Atlas 구현
- RGB 직접 변조 또는 Final Surface 직접 수정

---

## 3. Canonical semantic

### 3.1 기존 compatibility semantic

```text
tdt.analysis.hannakairo.directional-gate.compat.v1
```

이 ID는 legacy facade와 migration receipt에만 사용한다. 새 canonical publication은 이 ID를 사용하지 않는다.

### 3.2 신규 canonical semantic

```text
tdt.analysis.hannakairo.tensor-spectral-alignment.v1
tdt.analysis.hannakairo.directional-gate.v2
```

#### Tensor·Spectral Alignment Field

- Coordinate: `stage-pixel`
- Format: `rgba16float`
- R: axial alignment `[0,1]`
- G: signed doubled-angle dot `[-1,1]`
- B: combined confidence `[0,1]`
- A: validity `{0,1}`

#### Directional Gate Field

- Coordinate: `stage-pixel`
- Format: `rgba16float`
- R: neutral-safe multiplier `[minMultiplier,1]`
- G: axial alignment `[0,1]`
- B: combined confidence `[0,1]`
- A: validity `{0,1}`

Invalid output은 반드시 `(1,0,0,0)`이다. R channel의 `1`은 neutral identity이며, 나머지는 invalid를 나타낸다.

---

## 4. Axial alignment 수학

Tensor tangent와 spectral feature tangent는 방향 벡터가 아니라 director이므로 `v`와 `-v`가 동일해야 한다.

각 방향을 double-angle order vector로 표현한다.

```text
q_t = (cos(2θ_t), sin(2θ_t))
q_s = (cos(2θ_s), sin(2θ_s))
```

SQ03 peak orientation field는 이미 feature tangent의 double-angle을 R/G에 출판하므로 재회전하지 않는다.

Signed doubled-angle dot:

```text
d = clamp(dot(q_t, q_s), -1, 1)
```

Axial alignment:

```text
alignment = 0.5 * (d + 1)
```

- `alignment = 1`: 동일한 axial 방향
- `alignment = 0`: 서로 직교한 feature tangent
- tangent sign flip은 alignment를 바꾸지 않음

---

## 5. Window-grid → Stage-pixel projection

### 5.1 입력 receipt

SQ03의 `windowLayoutReceiptDigest`와 실제 `tdt.spectral.window-layout.v1` receipt가 필수다.

필수 필드:

```text
sourceSurfaceId, sourceRevision
windowWidth, windowHeight
strideX, strideY
gridWidth, gridHeight
windowCount, windowOrder
windowFunctionDigest, layoutDigest
```

### 5.2 window center

window `(gx,gy)`의 stage-space center는 다음과 같다.

```text
cx = gx * strideX + (windowWidth  - 1) / 2
cy = gy * strideY + (windowHeight - 1) / 2
```

### 5.3 projection kernel

각 stage pixel은 자신을 덮는 최대 4개의 인접 window center를 선택해 bilinear weight로 axial vector와 confidence를 누적한다.

Axial vector는 angle 자체를 선형 보간하지 않고 double-angle vector를 confidence-weighted sum한 뒤 정규화한다.

```text
v = Σ(w_i * confidence_i * q_i)
c = Σ(w_i * confidence_i) / max(Σw_i, epsilon)
q_projected = normalize(v)
```

`|v| < epsilon`, 유효 window 0개, layout mismatch, source revision mismatch인 경우 projected spectral orientation은 invalid다.

### 5.4 경계 정책

- window grid 밖 extrapolation 금지
- 가장자리 stage pixel은 실제 coverage가 있는 window만 사용
- coverage가 없으면 invalid
- nearest fallback 금지
- CPU reconstruction 금지

---

## 6. Confidence 결합

Tensor confidence와 spectral confidence는 서로 다른 증거이므로 곱셈으로 결합한다.

```text
C_t = clamp(tensor.coherence, 0, 1) * tensor.validity
C_s = clamp(projectedSpectral.confidence, 0, 1) * projectedSpectral.validity
C = C_t * C_s
```

옵션으로 HP01 phase coherence를 품질 마스크로 사용할 수 있다.

```text
C_final = C * mix(1, C_phase, phaseCoherenceWeight)
```

`phaseCoherenceWeight = 0`이 기본값이며, Gate-02 자체가 HP01 topology를 필수 입력으로 만들지 않는다.

---

## 7. Directional gate 정책

Gate-02의 목적은 tensor와 spectral 방향이 충돌하는 영역에서 후속 adaptation strength를 보수적으로 줄이는 것이다.

정렬 부족량:

```text
misalignment = 1 - alignment
```

Canonical multiplier:

```text
attenuation = strength * C_final * misalignment
multiplier = clamp(1 - attenuation, minMultiplier, 1)
```

기본 parameter:

```text
strength = 0.15
minMultiplier = 0.85
phaseCoherenceWeight = 0
epsilon = 1e-6
```

기존 GLSL의 `[0.85,1.0]` 범위는 compatibility default로 보존하되, `tanh(cos(dot(k,d)))` 수식은 canonical 경로에서 사용하지 않는다.

---

## 8. Neutral Identity Seal

다음 각 경우에 multiplier는 bit-exact IEEE-754 `1.0f`여야 한다.

1. `enabled = false`
2. `strength = 0`
3. tensor field invalid
4. spectral field invalid
5. layout receipt 없음 또는 mismatch
6. source revision 또는 stage identity mismatch
7. combined confidence 0
8. service가 optional consumer로 호출되지 않음

Invalid neutral texel:

```text
(multiplier, alignment, confidence, validity) = (1,0,0,0)
```

Consumer 적용식은 반드시 다음 형태여야 한다.

```text
effective = base * gate.multiplier
```

따라서 neutral field는 base 값을 bit-exact 보존한다. `mix`, gamma, `tanh`, epsilon subtraction으로 1.0을 변형해서는 안 된다.

Gate-02 OFF 상태에서 R2 output은 기존 baseline과 exact pixel identity를 유지해야 한다.

---

## 9. GPU pass 구성

```text
P0 spectral-window-to-stage projection
P1 tensor-spectral axial alignment
P2 directional gate finalize
```

권장 구현은 P1과 P2를 한 WGSL pass로 융합할 수 있으나, 검증 profile에서는 alignment와 gate를 별도 field로 관찰할 수 있어야 한다.

제품 실행 계약:

- command buffer 1개
- queue submission 1회
- intermediate readback 0회
- stage pixel당 writer 1개
- texture alias 금지
- 입력 field 수정 금지

---

## 10. Analysis Field Authority publication

Producer ID:

```text
tdt.analysis.producer.hannakairo.directional-gate
```

Implementation ID:

```text
tdt-hannakairo-tensor-spectral-directional-gate-v2
```

입력 semantic:

```text
tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
tdt.analysis.spectral.window-peak-orientation.v1
optional: tdt.analysis.hannakairo.phase-coherence.v1
```

출력 두 field는 `publishFieldSet()`으로 원자 출판한다.

- alignment와 gate 모두 출판
- 또는 모두 미출판
- 부분 generation 증가 금지
- 부분 resource ownership transfer 금지

Receipt는 다음을 포함한다.

```text
producerId, implementationId
sourceSurfaceId, sourceRevision, stageIdentity
tensorFieldId, spectralFieldId
windowLayoutReceiptDigest
parameterDigest, shaderAssetDigests
deviceIdentity, deviceEpoch
dispatchCount, submissionCount
intermediateReadbackCount
neutralIdentityProfile
fieldSetDigest
```

---

## 11. Lifecycle

1. 입력 field acquire 및 pin
2. currentness·epoch·source revision 검증
3. build lease 생성
4. output texture 생성
5. dispatch encode
6. queue submit
7. fence completion
8. atomic publication
9. 입력 release
10. arena cleanup

Cancellation, device loss, stale epoch, consumer abort 시 output은 출판되지 않고 즉시 폐기된다.

---

## 12. Legacy facade migration

`phase_gate_hannakairo` 이름은 보존한다.

새 facade는 다음을 수행한다.

- GPU Analysis Field handle 입력만 허용
- CPU typed array, WebGL texture, Canvas source 거부
- canonical Gate-02 service로 요청 전달
- legacy parameter `uAlpha`를 `strength`로 migration
- legacy lower clamp를 `minMultiplier`로 migration
- `uGate`, `uTheta`, `uKmag`, `uIxIy` 직접 uniform 경로 퇴역

기존 GLSL asset은 compatibility evidence로 남지만 product Active Graph의 실행 asset으로 사용하지 않는다.

---

## 13. Fail-closed 오류

- `E_HANNAKAIRO_GATE_INPUT_TENSOR_REQUIRED`
- `E_HANNAKAIRO_GATE_INPUT_SPECTRAL_REQUIRED`
- `E_HANNAKAIRO_GATE_LAYOUT_RECEIPT_REQUIRED`
- `E_HANNAKAIRO_GATE_LAYOUT_DIGEST_MISMATCH`
- `E_HANNAKAIRO_GATE_SOURCE_REVISION_MISMATCH`
- `E_HANNAKAIRO_GATE_STAGE_IDENTITY_MISMATCH`
- `E_HANNAKAIRO_GATE_DEVICE_EPOCH_MISMATCH`
- `E_HANNAKAIRO_GATE_CPU_INPUT_FORBIDDEN`
- `E_HANNAKAIRO_GATE_WEBGL_INPUT_FORBIDDEN`
- `E_HANNAKAIRO_GATE_CANVAS_INPUT_FORBIDDEN`
- `E_HANNAKAIRO_GATE_PARAMETER_INVALID`
- `E_HANNAKAIRO_GATE_PUBLICATION_PARTIAL`
- `E_HANNAKAIRO_GATE_OUTPUT_NONFINITE`
- `E_HANNAKAIRO_GATE_DEVICE_LOST`
- `E_HANNAKAIRO_GATE_CANCELLED`

오류 발생 시 CPU나 기존 GLSL로 fallback하지 않는다.

---

## 14. WGSL 자산

```text
hannakairo-spectral-project-stage.wgsl
hannakairo-tensor-spectral-align.wgsl
hannakairo-directional-gate-finalize.wgsl
hannakairo-gate-fixture-generator.wgsl
hannakairo-gate-reference.wgsl
hannakairo-gate-compare.wgsl
```

Product shader와 validation shader는 asset digest와 entry-point identity를 분리한다.

---

## 15. 독립 GPU reference

Reference shader는 product shader와 다음을 공유하지 않는다.

- projection helper
- alignment helper
- confidence helper
- gate finalize helper

Reference는 window center를 직접 순회하고 scalar angle reconstruction으로 alignment를 계산한다.

Comparator는 다음을 집계한다.

- exact neutral mismatch count
- maximum multiplier absolute error
- maximum alignment error
- maximum confidence error
- NaN count
- Infinity count
- first mismatch coordinate/channel

---

## 16. Fixture

- constant tensor + constant aligned spectral: multiplier 1
- constant tensor + orthogonal spectral: minimum-side attenuation
- tensor sign-flip checkerboard: same alignment
- spectral sign-flip checkerboard: same alignment
- strength 0: bit-exact neutral
- enabled false: bit-exact neutral
- missing spectral coverage: invalid neutral
- zero confidence: invalid neutral
- odd stage dimensions
- even stage dimensions
- stride smaller than window overlap
- stride equal to window size
- single-window full-stage coverage
- boundary partial coverage
- source revision mismatch
- device epoch mismatch
- phase coherence optional weight 0
- phase coherence optional weight 1
- nonfinite input rejection
- cancellation before publication

---

## 17. 성능·메모리

- stage projection texture 1개
- alignment texture 1개
- gate texture 1개
- optional validation buffers는 product mode에서 생성 금지
- pipeline·bind group layout은 GPU Authority cache 소유
- 반복 실행 후 live resource count plateau 요구
- per-frame shader compilation 금지
- CPU-side per-pixel loop 금지

---

## 18. Gate Matrix

| Range | Category | Count |
|---|---:|---:|
| `HG02-001~HG02-012` | Parent·baseline truth | 12 |
| `HG02-013~HG02-032` | Semantic·producer migration | 20 |
| `HG02-033~HG02-056` | Window-grid projection | 24 |
| `HG02-057~HG02-080` | Axial alignment·confidence | 24 |
| `HG02-081~HG02-104` | Directional gate·neutral identity | 24 |
| `HG02-105~HG02-128` | Authority·atomic publication | 24 |
| `HG02-129~HG02-148` | Lifecycle·GPU-only·legacy facade | 20 |
| `HG02-149~HG02-164` | WGSL·mock validation | 16 |
| `HG02-165~HG02-176` | Physical GPU·Packaged Electron | 12 |
| `HG02-177~HG02-184` | Regression·artifact seal | 8 |

총 Gate 수: **184**

### 18.1 개별 Gate

- **HG02-001** — Parent ZIP SHA와 HP01 Source Seal이 명시값과 일치한다.
- **HG02-002** — HP01 상태가 source-baked unpromoted이다.
- **HG02-003** — Truth-00 Authority가 존재한다.
- **HG02-004** — SQ03 peak orientation semantic이 canonical이다.
- **HG02-005** — R1C tensor semantic이 canonical이다.
- **HG02-006** — Production Pointer는 변경되지 않는다.
- **HG02-007** — 기존 HP01 184/12/0 gate 의미를 보존한다.
- **HG02-008** — 기존 SQ03 204/12/0 gate 의미를 보존한다.
- **HG02-009** — 기존 R2 baseline identity 계약을 보존한다.
- **HG02-010** — legacy GLSL 파일 digest를 inventory에 기록한다.
- **HG02-011** — directional gate와 topology producer를 분리한다.
- **HG02-012** — source bake는 물리 GPU 성공을 주장하지 않는다.
- **HG02-013** — canonical alignment semantic을 registry에 등록한다.
- **HG02-014** — canonical gate v2 semantic을 registry에 등록한다.
- **HG02-015** — compat v1 semantic을 alias로만 유지한다.
- **HG02-016** — alignment coordinate는 stage-pixel이다.
- **HG02-017** — gate coordinate는 stage-pixel이다.
- **HG02-018** — alignment format은 rgba16float이다.
- **HG02-019** — gate format은 rgba16float이다.
- **HG02-020** — invalid alignment texel 계약을 고정한다.
- **HG02-021** — invalid gate texel은 정확히 (1,0,0,0)이다.
- **HG02-022** — producer ID를 canonical ID로 승격한다.
- **HG02-023** — implementation ID를 v2로 고정한다.
- **HG02-024** — producer backend는 webgpu이다.
- **HG02-025** — kernel language는 wgsl이다.
- **HG02-026** — productAdmission은 canonical이다.
- **HG02-027** — tensor semantic을 필수 입력으로 등록한다.
- **HG02-028** — spectral peak orientation semantic을 필수 입력으로 등록한다.
- **HG02-029** — phase coherence semantic은 optional 입력이다.
- **HG02-030** — legacy GLSL은 product shader asset이 아니다.
- **HG02-031** — consumer accepted semantic 목록을 갱신한다.
- **HG02-032** — registry digest가 deterministic하다.
- **HG02-033** — window layout receipt가 필수다.
- **HG02-034** — layout digest가 SQ03 metadata와 일치한다.
- **HG02-035** — sourceSurfaceId가 일치한다.
- **HG02-036** — sourceRevision이 일치한다.
- **HG02-037** — windowCount가 gridWidth*gridHeight*planeCount와 일치한다.
- **HG02-038** — windowOrder가 canonical row-major이다.
- **HG02-039** — window center 식을 고정한다.
- **HG02-040** — stage pixel에서 최대 4개 window만 선택한다.
- **HG02-041** — bilinear weight 합을 finite 검증한다.
- **HG02-042** — axial vector를 angle로 선형 보간하지 않는다.
- **HG02-043** — double-angle vector를 confidence-weighted 누적한다.
- **HG02-044** — 누적 벡터를 정규화한다.
- **HG02-045** — 벡터 norm epsilon 미만은 invalid다.
- **HG02-046** — coverage 없는 pixel은 invalid다.
- **HG02-047** — grid 밖 extrapolation을 금지한다.
- **HG02-048** — nearest fallback을 금지한다.
- **HG02-049** — CPU reconstruction을 금지한다.
- **HG02-050** — projection writer는 stage pixel당 1개다.
- **HG02-051** — projection texture 크기는 stage dimensions와 같다.
- **HG02-052** — odd dimensions를 지원한다.
- **HG02-053** — even dimensions를 지원한다.
- **HG02-054** — boundary partial coverage를 지원한다.
- **HG02-055** — projection receipt에 layout digest를 기록한다.
- **HG02-056** — projection pass는 입력 spectral field를 수정하지 않는다.
- **HG02-057** — R1C tangent를 normalized axial order로 변환한다.
- **HG02-058** — spectral R/G를 normalized axial order로 검증한다.
- **HG02-059** — tensor sign flip invariance를 보장한다.
- **HG02-060** — spectral sign flip invariance를 보장한다.
- **HG02-061** — signed dot을 [-1,1]로 clamp한다.
- **HG02-062** — alignment=0.5*(dot+1)을 사용한다.
- **HG02-063** — 동일 방향 alignment는 1이다.
- **HG02-064** — 직교 방향 alignment는 0이다.
- **HG02-065** — tensor confidence를 [0,1]로 clamp한다.
- **HG02-066** — spectral confidence를 [0,1]로 clamp한다.
- **HG02-067** — combined confidence는 곱셈 결합이다.
- **HG02-068** — invalid tensor는 combined confidence 0이다.
- **HG02-069** — invalid spectral은 combined confidence 0이다.
- **HG02-070** — phase coherence weight 기본값은 0이다.
- **HG02-071** — phase coherence weight 범위는 [0,1]이다.
- **HG02-072** — phase coherence optional 결측은 neutral이다.
- **HG02-073** — nonfinite tensor를 invalid 처리한다.
- **HG02-074** — nonfinite spectral을 invalid 처리한다.
- **HG02-075** — nonfinite confidence를 invalid 처리한다.
- **HG02-076** — alignment field R/G/B/A 채널 의미를 고정한다.
- **HG02-077** — alignment 결과를 Authority field로 출판한다.
- **HG02-078** — alignment 계산은 CPU에서 수행하지 않는다.
- **HG02-079** — alignment pass는 deterministic하다.
- **HG02-080** — validation reference와 product helper를 공유하지 않는다.
- **HG02-081** — misalignment=1-alignment을 사용한다.
- **HG02-082** — attenuation=strength*C*misalignment을 사용한다.
- **HG02-083** — multiplier=clamp(1-attenuation,minMultiplier,1)을 사용한다.
- **HG02-084** — strength 기본값은 0.15다.
- **HG02-085** — minMultiplier 기본값은 0.85다.
- **HG02-086** — strength 범위는 [0,1]이다.
- **HG02-087** — minMultiplier 범위는 [0,1]이다.
- **HG02-088** — enabled false는 bit-exact 1.0이다.
- **HG02-089** — strength 0은 bit-exact 1.0이다.
- **HG02-090** — invalid tensor는 bit-exact 1.0이다.
- **HG02-091** — invalid spectral은 bit-exact 1.0이다.
- **HG02-092** — confidence 0은 bit-exact 1.0이다.
- **HG02-093** — layout mismatch는 field 미출판 또는 invalid neutral이다.
- **HG02-094** — neutral path에서 tanh를 호출하지 않는다.
- **HG02-095** — neutral path에서 epsilon subtraction을 하지 않는다.
- **HG02-096** — neutral output R bit pattern은 0x3f800000이다.
- **HG02-097** — gate field channel 의미를 고정한다.
- **HG02-098** — gate는 RGB를 직접 수정하지 않는다.
- **HG02-099** — gate는 Q texture를 직접 수정하지 않는다.
- **HG02-100** — gate는 topology claim을 하지 않는다.
- **HG02-101** — gate OFF 시 R2 baseline exact identity를 요구한다.
- **HG02-102** — aligned high-confidence input은 multiplier 1이다.
- **HG02-103** — orthogonal high-confidence input은 지정 attenuation이다.
- **HG02-104** — multiplier는 항상 finite이고 [minMultiplier,1]이다.
- **HG02-105** — 입력 field를 Authority로 acquire한다.
- **HG02-106** — 입력 field를 dispatch 동안 pin한다.
- **HG02-107** — device identity를 검증한다.
- **HG02-108** — device epoch를 검증한다.
- **HG02-109** — stage identity를 검증한다.
- **HG02-110** — source revision을 검증한다.
- **HG02-111** — build lease를 생성한다.
- **HG02-112** — output texture ownership을 명시한다.
- **HG02-113** — command buffer 하나로 encode한다.
- **HG02-114** — queue submission count는 1이다.
- **HG02-115** — fence 이전 publication을 금지한다.
- **HG02-116** — fence 이후 publishFieldSet을 호출한다.
- **HG02-117** — alignment와 gate를 원자 출판한다.
- **HG02-118** — 부분 semantic publication을 금지한다.
- **HG02-119** — 부분 generation 증가를 금지한다.
- **HG02-120** — commit 실패 시 records를 rollback한다.
- **HG02-121** — 미이전 resource를 호출자가 폐기한다.
- **HG02-122** — receipt에 parameterDigest를 기록한다.
- **HG02-123** — receipt에 shader digests를 기록한다.
- **HG02-124** — receipt에 layout digest를 기록한다.
- **HG02-125** — receipt에 fieldSetDigest를 기록한다.
- **HG02-126** — receipt에 readback count 0을 기록한다.
- **HG02-127** — effectiveExecution claim은 receipt 완료 후에만 허용한다.
- **HG02-128** — claim report가 canonical producer를 반영한다.
- **HG02-129** — cancellation 전 publication을 차단한다.
- **HG02-130** — device loss 시 output을 폐기한다.
- **HG02-131** — stale epoch output을 차단한다.
- **HG02-132** — input release를 finally 경로에서 수행한다.
- **HG02-133** — job arena를 bounded lifecycle로 관리한다.
- **HG02-134** — pipeline cache는 GPU Authority가 소유한다.
- **HG02-135** — per-frame shader compile을 금지한다.
- **HG02-136** — MAP_READ usage를 금지한다.
- **HG02-137** — mapAsync를 금지한다.
- **HG02-138** — getMappedRange를 금지한다.
- **HG02-139** — CPU pixel loop를 금지한다.
- **HG02-140** — WebGL compute fallback을 금지한다.
- **HG02-141** — Canvas pixel extraction을 금지한다.
- **HG02-142** — GPU readback 후 재업로드를 금지한다.
- **HG02-143** — legacy facade 이름을 유지한다.
- **HG02-144** — legacy CPU typed array 입력을 거부한다.
- **HG02-145** — legacy WebGL texture 입력을 거부한다.
- **HG02-146** — legacy uniforms를 canonical parameters로 migration한다.
- **HG02-147** — old GLSL success claim을 제거한다.
- **HG02-148** — stable error registry에 신규 오류를 등록한다.
- **HG02-149** — product WGSL 3종의 structural balance를 검사한다.
- **HG02-150** — validation WGSL 3종의 structural balance를 검사한다.
- **HG02-151** — stage projection fixture를 통과한다.
- **HG02-152** — aligned fixture를 통과한다.
- **HG02-153** — orthogonal fixture를 통과한다.
- **HG02-154** — tensor sign-flip fixture를 통과한다.
- **HG02-155** — spectral sign-flip fixture를 통과한다.
- **HG02-156** — strength-zero neutral fixture를 통과한다.
- **HG02-157** — disabled neutral fixture를 통과한다.
- **HG02-158** — missing coverage neutral fixture를 통과한다.
- **HG02-159** — zero-confidence neutral fixture를 통과한다.
- **HG02-160** — boundary projection fixture를 통과한다.
- **HG02-161** — nonfinite rejection fixture를 통과한다.
- **HG02-162** — single-writer accounting을 통과한다.
- **HG02-163** — mock receipt lifecycle을 통과한다.
- **HG02-164** — source contract가 전체 정적 규칙을 통과한다.
- **HG02-165** — 실제 브라우저에서 product WGSL compile을 통과한다.
- **HG02-166** — 실제 bind group validation을 통과한다.
- **HG02-167** — 실제 projection GPU reference parity를 통과한다.
- **HG02-168** — 실제 alignment GPU reference parity를 통과한다.
- **HG02-169** — 실제 neutral bit identity를 통과한다.
- **HG02-170** — 실제 NaN/Infinity comparator가 0이다.
- **HG02-171** — 실제 intermediate readback count가 0이다.
- **HG02-172** — device loss 중 publication이 차단된다.
- **HG02-173** — 반복 실행 GPU memory가 plateau한다.
- **HG02-174** — Worker·renderer 경계 실행을 통과한다.
- **HG02-175** — Windows x64 Packaged Electron relaunch를 통과한다.
- **HG02-176** — verified-unpromoted receipt를 생성한다.
- **HG02-177** — HP01 gate를 회귀 통과한다.
- **HG02-178** — SQ03 gate를 회귀 통과한다.
- **HG02-179** — Truth-00 gate를 회귀 통과한다.
- **HG02-180** — R1C·R2 gate를 회귀 통과한다.
- **HG02-181** — Active Graph와 GPU SSOT를 회귀 통과한다.
- **HG02-182** — Stable Error와 TypeScript syntax를 통과한다.
- **HG02-183** — changed-file manifest와 Source Seal을 생성한다.
- **HG02-184** — 독립 ZIP 재검증에서 Source Seal이 재현된다.

---

## 19. Source Bake 예상 결과

```text
PASS:     172
DEFERRED:  12
FAIL:       0
```

Physical GPU·Packaged Electron 12개 Gate는 Source Bake에서 DEFERRED여야 하며 PASS로 위장하면 안 된다.

---

## 20. 상태 전이

```text
HANNAKAIRO_PHASE_01_SOURCE_BAKED_AWAITING_PACKAGED_GPU
→ HANNAKAIRO_GATE_02_SOURCE_BAKED_AWAITING_PACKAGED_GPU
→ HANNAKAIRO_GATE_02_VERIFIED_UNPROMOTED
```

Production Pointer는 별도 promotion patch 전까지 변경하지 않는다.

---

## 21. 후속 패치

본 패치 뒤의 다음 순서는 다음과 같다.

1. `TDT-QWAVE-PHASE-03`
2. `TDT-GPU-TILE-ATLAS-01`
3. `TDT-ADAPTIVE-ANALYSIS-FUSION-01`

Gate-02는 R1D/R2에 자동 적용하지 않는다. 후속 Fusion 패치가 명시적으로 소비할 때만 결과에 영향을 준다.

