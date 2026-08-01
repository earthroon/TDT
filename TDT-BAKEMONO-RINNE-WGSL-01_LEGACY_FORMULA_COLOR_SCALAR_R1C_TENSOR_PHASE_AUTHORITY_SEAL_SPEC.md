# TDT-BAKEMONO-RINNE-WGSL-01

## Legacy Fragment Formula Inventory /
## Canonicalized Compatibility Formula /
## Color Utility Contract /
## Explicit Scalar-Field Profiles /
## Integrated R1C Tensor-Only Admission /
## Nonzero Lambda2 Gate Preservation /
## Deterministic Rinne Phase /
## No Legacy Tensor Authority Seal

> 상태: 명세 rev.1
>
> 기준 일자: `2026-08-02`
>
> 기준 부모 번들: `64_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_EXPLICIT_PIPELINE_REBUILD_SINGLE_FLIGHT_SOURCE_BAKED_AWAITING_EXTERNAL_BUILD_AND_THREE_CYCLE_PHYSICAL_GPU.zip`
>
> 부모 번들 SHA-256: `fce5bfa56823d223a36faecedcf2b552b82a4452ecb599b6ae894a92ada76d50`
>
> 연결 리뷰: `TDT_BAKEMONO_RINNE_EXISTING_PIPELINE_CONNECTION_REVIEW_2026-08-02.md`
>
> 연결 리뷰 SHA-256: `2ffa40aba4124e79cf4ef94d2eda17f000da4f224384321f3225e5eefe9372dc`
>
> 마이그레이션 로드맵: `TDT_BAKEMONO_RINNE_WGSL_MIGRATION_ROADMAP_2026-08-02.md`
>
> 로드맵 SHA-256: `0c88230313394519307f497dbe60148cf1bddd6c0d38ba0afae93233f440b843`
>
> 패치 역할: 바케모노·린네 WebGPU 마이그레이션 전에 레거시 수식의 실제 실행 의미, 색공간 오차까지 포함한 호환 계약, 스칼라 필드 의미, R1C Tensor 입장 조건, 결정론적 phase, 레거시 Tensor 퇴역 경계를 SSOT로 봉인한다.
>
> 이 명세는 WGSL 커널 구현이나 R9A command graph 결선을 아직 수행하지 않는다. 실제 WGSL 호환 커널은 `TDT-BAKEMONO-RINNE-WGSL-02`, terminal-resolution R1C와 λ2 물리 검증은 `WGSL-03`, command graph 본선 결선은 `WGSL-04`에서 수행한다.
>
> 원칙: `source filename != formula authority`, `intended matrix != executed GLSL matrix`, `deltaE label != proven ΔE semantic`, `Q-map != Q-wave real ΔK`, `per-pixel outer product != integrated structure tensor`, `temporal hysteresis != spatial integration`, `device texture != admitted analysis field`, `performance.now() != deterministic phase`, `shader execution != canonical output authority`.

---

# 0. 목적

다듬다듬에는 바케모노와 린네로 불리는 여러 GLSL 조각이 공존한다.

이 조각들은 같은 이름을 사용하지만 다음이 서로 다르다.

- 입력 texture 이름
- RGB와 Lab 변환 방식
- CMYK 변환 domain
- Q-map 사용 방식
- ΔE라고 이름 붙은 scalar의 실제 의미
- mask 구성
- tensor 사용 여부
- phase 생성 방식
- 최종 mix 순서
- 출력 clamp 위치
- 실행 가능 여부

파일명을 그대로 WGSL로 번역하면 다음 두 종류의 실패가 생긴다.

```text
문법 parity
= GLSL과 WGSL이 비슷한 줄을 가짐

의미 parity
= 동일 입력에서 실제 실행 결과가 허용 오차 안에서 같음
```

이번 명세는 문법 parity가 아니라 **의미 parity의 기준점**을 만든다.

또한 레거시 Tensor 셰이더를 그대로 이식하면 한 픽셀 gradient 외적이 rank-1이 되어 `lambda2 = 0`, `coherence ≈ 1`로 붕괴한다. 바케모노가 이 값을 구조 게이트로 소비하면 게이트가 사실상 항상 열린다.

따라서 마이그레이션 기준은 다음으로 고정한다.

```text
Legacy fusion formula
→ 실제 실행 수식 inventory
→ compatibility formula SSOT
→ exact color utility contract
→ explicit scalar profile
→ terminal integrated R1C tensor admission
→ deterministic phase
→ WGSL implementation
```

이 명세의 완료는 다음을 의미한다.

1. 어떤 GLSL 파일이 호환 기준인지 하나로 확정된다.
2. 다른 바케모노·린네 조각은 reference, future profile, quarantine 중 하나로 분류된다.
3. GLSL column-major 행렬을 포함한 실제 실행 수식이 수학식으로 고정된다.
4. Canonical linear-premultiplied surface와 legacy encoded-straight formula 사이의 변환 경계가 명시된다.
5. `u_deltaE`와 Q-wave real ΔK가 서로 다른 profile로 분리된다.
6. 제품 authority는 integrated R1C tensor 없이는 열리지 않는다.
7. 평활 없는 legacy tensor는 texture가 존재해도 입장하지 못한다.
8. phase는 시계가 아니라 명시적 입력과 receipt로 결정된다.

---

# 1. 범위

## 1.1 포함

- 레거시 바케모노·린네 fragment 목록과 digest
- 호환 수식 기준 파일 선택
- 실제 GLSL 실행 행렬과 함수 순서
- 입력 texture와 scalar의 의미 계약
- legacy formula shadow profile
- R1C-gated canonical profile
- Canonical surface color adapter 계약
- R1C Tensor producer와 consumer admission 계약
- λ2 nonzero fixture와 coherence distribution gate
- deterministic phase 계약
- receipt schema
- stable error code
- source gate와 negative control
- 후속 WGSL 구현의 파일 및 ABI 경계

## 1.2 제외

- WGSL shader 본문 구현
- WebGL 실행 결과 캡처
- headless GL oracle 구축
- R9A command graph pass 기록
- terminal texture authority 교체
- Preview와 Export 본선 승격
- device-loss rebuild participant 추가
- ΔE2000 신규 canonical field 생성
- ICC 기반 CMYK 변환
- LUT Bakemono profile 구현
- temporal Q-map EMA 구현

## 1.3 후속 패치

```text
WGSL-02
= compatibility shader + CPU oracle + WebGL oracle parity

WGSL-03
= terminal R1C record + lambda2/coherence physical gate

WGSL-04
= R9A command graph native pass + single encoder/single submit

WGSL-05
= canonical final texture adoption

WGSL-06
= analysis field and derived mask live binding
```

---

# 2. 현재 코드에서 직접 확인된 사실

## 2.1 실제 legacy batch path는 fusion shader를 선택한다

`app/legacy-runtime/batchLoader.js`는 다음을 수행한다.

```text
shaderName = rinne_bakemono_fusion
u_image
u_qmap
u_deltaE
u_alphaDepth
u_highlightMask
u_edgeMask
u_time = performance.now() * 0.001
u_power = 1.0
u_neonBoost = 1.0
```

판정:

```text
legacy active formula family
= rinne_bakemono_fusion

phase authority
= wall-clock derived, non-deterministic
```

## 2.2 같은 이름의 fusion 파일이 서로 다른 바이트를 가진다

다음 파일은 이름은 유사하지만 동일 source가 아니다.

- `app/legacy-runtime/rinne_bakemono_fusion_frag.glsl`
- `app/legacy-runtime/shaders/rinne_bakemono_fusion_frag.glsl`
- `app/legacy-runtime/asar-unpack/shaders/rinne_bakemono_fusion_frag.glsl`
- `app/legacy-runtime/rinne_bakemono_fusion.patched.frag`
- `app/legacy-runtime/shaders/rinne_bakemono_fusion.patched.frag`

루트의 `rinne_bakemono_fusion_frag.glsl`은 GLSL 300 ES 선언, multiple render target 출력 선언, legacy `varying`, `texture2D`, `gl_FragColor`가 한 파일에 섞여 있다.

따라서 파일명만으로 authority를 정할 수 없다.

## 2.3 실행 가능한 최소 fusion source는 shaders 사본이다

호환 기준 후보:

```text
app/legacy-runtime/shaders/rinne_bakemono_fusion_frag.glsl
SHA-256 88a33809136a3a3dafd1397e2a017a9c644e866ae9fb29ed54990a554f9601e1
```

이 파일은 `glsl_util.glsl`을 포함하고 단일 fragment output 수식을 완결한다.

Color utility 기준 후보:

```text
app/legacy-runtime/shaders/glsl_util.glsl
SHA-256 410558cb4697e8e692e0321b1376d690725be582badb99d85e39e3ae830905c1
```

## 2.4 utility의 RGB↔XYZ 행렬은 작성 순서와 실제 GLSL 실행 행렬이 다르다

GLSL `mat3(a,b,c,...)` scalar constructor는 column-major로 채운다.

소스가 적은 literal을 행렬의 행으로 해석해 교정하면 실제 레거시 출력과 달라진다.

따라서 호환 profile은 **실제 GLSL column-major 실행식**을 보존해야 한다.

## 2.5 legacy rgb2lab은 sRGB transfer decode를 하지 않는다

`rgb2lab(rgb)`는 입력 RGB에 바로 XYZ matrix를 곱한다.

```text
encoded RGB
→ matrix multiply
→ white normalization
→ Lab nonlinear function
```

표준 CIE Lab 변환은 아니지만 호환 profile에서는 이 오차까지 수식 일부다.

## 2.6 legacy fusion은 tensor를 직접 소비하지 않는다

기준 fusion source의 입력은 다음이다.

```text
base image
qmap
scalar named deltaE
alphaDepth
highlightMask
edgeMask
phase time
power
neonBoost
```

Tensor gate는 legacy formula에 없으므로, R1C gate를 추가하면 의미 변경이다.

따라서 legacy parity profile과 canonical R1C-gated profile을 같은 profile ID로 묶을 수 없다.

## 2.7 legacy tensor files는 integrated tensor authority가 아니다

확인된 legacy tensor 계열:

```text
app/legacy-runtime/gl/tensor.glsl
app/legacy-runtime/gl/passes/tensorPass.glsl
app/legacy-runtime/shaders/grad_and_tensor.glsl
app/legacy-runtime/ash_qtensor_icc/shaders/tensor_update_pass.frag
```

첫 세 파일은 공간 integration이 없거나, 중앙 gradient를 반복 가산해 평활처럼 보이게 한다.

`tensor_update_pass.frag`는 이전 프레임과의 temporal mix를 수행하지만 spatial integration은 하지 않는다.

## 2.8 modern R1C에는 실제 spatial integration이 있다

Canonical R1C 순서:

```text
gradient
→ outer product
→ blur H
→ blur V
→ eigen
→ axial conversion
```

해당 shader digest:

```text
Gradient  8684b23a8ce508cdc3f924c33d1aa953d9f7f385caf5946f9abde60a0125d523
Outer     9f5efaf050770153aff11f8ac75fc23e58be0dd645bf447bfbb77b5db46acab7
Blur H    3a61bff829b29a8cfee2a6cd034f80c907f9818419a2ff11872f3694827f0dad
Blur V    b107acc388179159aa0baf32abba2be445b4d91b34e73d0c40539e785497d038
Eigen     c4560743a9d42718e261c2cd2f069289aed6efabd341dc11b89c7c765ff38728
Axial     2f00744b42416f0730682bdf397bca3fc05fce3d5dc10a2d2e27f32563725bca
```

## 2.9 R1C에는 두 가지 후단 texture가 있다

```text
fieldTexture
= tangent.x, tangent.y, coherence, edge

axialFieldTexture
= cos(2theta), sin(2theta), coherence, edge
```

Semantic Registry의 다음 ID는 tangent texture 의미다.

```text
tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
```

Bakemono 방향 샘플링은 기본적으로 `fieldTexture`를 소비한다.

EWA ellipse 보간은 `axialFieldTexture`를 소비한다.

두 texture를 같은 packing으로 취급하면 안 된다.

## 2.10 Canonical EWA terminal surface는 linear-premultiplied rgba16float다

Legacy formula는 encoded RGB와 straight color를 전제로 작성돼 있다.

따라서 WGSL migration에는 다음 adapter가 필요하다.

```text
linear-premultiplied base
→ safe unpremultiply
→ linear-to-sRGB encode
→ legacy formula
→ sRGB-to-linear decode
→ premultiply alpha
→ rgba16float output
```

이 adapter 없이 legacy formula를 terminal texture에 바로 적용하면 색공간도 alpha 의미도 달라진다.

---

# 3. Legacy Fragment Formula Inventory

## 3.1 Inventory 상태 분류

각 source는 다음 중 하나를 가져야 한다.

```text
FORMULA_AUTHORITY
REFERENCE_COMPONENT
FUTURE_PROFILE
QUARANTINED_INVALID
DUPLICATE_ALIAS
DOCUMENT_ONLY
```

## 3.2 Formula Authority

```yaml
formulaAuthority:
  source: app/legacy-runtime/shaders/rinne_bakemono_fusion_frag.glsl
  sha256: 88a33809136a3a3dafd1397e2a017a9c644e866ae9fb29ed54990a554f9601e1
  utilitySource: app/legacy-runtime/shaders/glsl_util.glsl
  utilitySha256: 410558cb4697e8e692e0321b1376d690725be582badb99d85e39e3ae830905c1
  formulaId: tdt.effect.bakemono-rinne.formula.legacy-fusion-compat.v1
  status: FORMULA_AUTHORITY
```

## 3.3 Inventory 표

| Source | SHA-256 | 분류 | 입장 판단 |
|---|---|---|---|
| `shaders/rinne_bakemono_fusion_frag.glsl` | `88a338...601e1` | FORMULA_AUTHORITY | WGSL-02 parity 기준 |
| `asar-unpack/shaders/rinne_bakemono_fusion_frag.glsl` | `88a338...601e1` | DUPLICATE_ALIAS | authority source와 byte-identical일 때만 alias |
| `shaders/rinne_colorcycle_frag.glsl` | `20e7f6...9dae` | REFERENCE_COMPONENT | Rinne candidate 독립 fixture |
| `shaders/bakemono_neon_frag.glsl` | `b21644...c28` | REFERENCE_COMPONENT | Bakemono candidate 독립 fixture |
| `rinne_bakemono_fusion_frag.glsl` | `b783fa...f40` | QUARANTINED_INVALID | GLSL dialect와 output declaration 충돌 |
| `rinne_bakemono_fusion.patched.frag` | `74e0ba...09` | FUTURE_PROFILE | linear CMYK intent, include 미완 |
| `shaders/rinne_bakemono_fusion.patched.frag` | `5281e4...7f1` | QUARANTINED_INVALID | undefined symbol과 self-shadowing 존재 |
| `bakemono.frag` | `a22d62...37a` | DOCUMENT_ONLY | 실행 수식 없음 |
| `bakemono_PATCHED.frag` | `9c4d0a...7ad` | QUARANTINED_INVALID | undefined symbols, conflicting varyings |
| `bakemono_PATCHED_falloff_applied.frag` | `0dd1e2...480` | DOCUMENT_ONLY | code fragment, 완결 shader 아님 |
| `ash_qtensor_icc/shaders/bakemono_pass.frag` | `cf455c...711f` | FUTURE_PROFILE | tensor-guided spatial Bakemono 별도 profile |
| `rinne_de_gamma_attenuation.patched.frag` | `278e46...ac` | FUTURE_PROFILE | ΔE2000 guard 후속 pass |
| `rinne_and_dE_with_gamma.frag` | `b72fbe...a33c` | FUTURE_PROFILE | sharpen/ΔE correction family |

## 3.4 Inventory manifest

구현 시 다음 파일을 생성한다.

```text
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_legacy_formula_inventory.mjs
app/src/runtime/effects/bakemono-rinne/generated-bakemono-rinne-formula-inventory.json
```

Manifest row:

```ts
interface LegacyFormulaInventoryRow {
  sourceRelative: string;
  sha256: string;
  classification:
    | 'FORMULA_AUTHORITY'
    | 'REFERENCE_COMPONENT'
    | 'FUTURE_PROFILE'
    | 'QUARANTINED_INVALID'
    | 'DUPLICATE_ALIAS'
    | 'DOCUMENT_ONLY';
  formulaFamily: string;
  compileClaim: 'COMPILABLE' | 'NOT_CLAIMED' | 'KNOWN_INVALID';
  authorityEligible: boolean;
  reasonCode: string;
}
```

## 3.5 Fail-closed 규칙

- authority source digest가 바뀌면 build gate 실패
- duplicate alias가 authority source와 달라지면 alias 해제 후 실패
- QUARANTINED_INVALID source가 WGSL generator input에 들어오면 실패
- 여러 formula authority가 동시에 선언되면 실패
- source path만 맞고 digest가 다르면 실패
- generated WGSL이 inventory manifest 없이 존재하면 실패

---

# 4. Canonicalized Compatibility Formula

## 4.1 기호

픽셀 `x`에서 다음을 정의한다.

```text
B = base encoded-straight RGB in [0,1]^3
A = base alpha in [0,1]
q = qmap red scalar
s = profile-selected secondary scalar
ad = alphaDepth scalar
h = highlight mask scalar
e = edge mask scalar
phi0 = explicit phase base
p = power
n = neon boost
```

Legacy compatibility profile에서는 `s = legacy deltaE texture red`다.

## 4.2 Legacy constant

소스는 `2π`가 아니라 literal `6.283`을 사용한다.

```text
TAU_COMPAT = 6.283
```

호환 profile은 `6.283185...`로 교정하지 않는다.

## 4.3 RGB → XYZ effective GLSL matrix

소스 literal의 actual column-major 실행식:

```text
X = 0.4124 R + 0.2126 G + 0.0193 B
Y = 0.3576 R + 0.7152 G + 0.1192 B
Z = 0.1805 R + 0.0722 G + 0.9505 B
```

그 뒤:

```text
Xn = X / 0.9505
Yn = Y / 1.0
Zn = Z / 1.089
```

## 4.4 Lab forward nonlinearity

각 component `t`:

```text
f(t) = t^(1/3)                  if t > 0.008856
     = 7.787 t + 16/116         otherwise
```

```text
L = 116 f(Yn) - 16
a = 500 [f(Xn) - f(Yn)]
b = 200 [f(Yn) - f(Zn)]
```

이 수식은 encoded RGB를 직접 사용한다.

## 4.5 Lab → XYZ

```text
y = (L + 16) / 116
x = y + a / 500
z = y - b / 200
```

각 component `u`:

```text
g(u) = u^3                             if u^3 > 0.008856
     = (u - 16/116) / 7.787             otherwise
```

```text
X = 0.9505 g(x)
Y = 1.0    g(y)
Z = 1.089  g(z)
```

## 4.6 XYZ → RGB effective GLSL matrix

실제 column-major 실행식:

```text
R =  3.2406 X - 0.9689 Y + 0.0557 Z
G = -1.5372 X + 1.8758 Y - 0.2040 Z
B = -0.4986 X + 0.0415 Y + 1.0570 Z
```

Lab path RGB는 함수 내부에서 `[0,1]` clamp한다.

## 4.7 RGB → CMYK

```text
K = 1 - max(R,G,B)
```

`K >= 1`이면:

```text
C = 0
M = 0
Y = 0
K = 1
```

그 외:

```text
C = (1 - R - K) / (1 - K)
M = (1 - G - K) / (1 - K)
Y = (1 - B - K) / (1 - K)
```

## 4.8 CMYK → RGB

```text
R = (1-C)(1-K)
G = (1-M)(1-K)
B = (1-Y)(1-K)
```

Legacy utility는 이 결과를 clamp하지 않는다.

## 4.9 Rinne candidate

```text
Lab0  = rgb2lab_compat(B)
CMYK0 = rgb2cmyk_compat(B)

phi = phi0 + q * TAU_COMPAT + s

Lab1.L = Lab0.L
Lab1.a = Lab0.a + sin(phi) * s * 6.0
Lab1.b = Lab0.b + cos(phi) * q * 6.0

CMYK1.C = CMYK0.C + sin(phi * 0.8) * 0.1
CMYK1.M = CMYK0.M + cos(phi * 0.9) * 0.1
CMYK1.Y = CMYK0.Y
CMYK1.K = CMYK0.K

R_lab  = lab2rgb_compat(Lab1)
R_cmyk = cmyk2rgb_compat(CMYK1)

R_rinne = mix(R_lab, R_cmyk, 0.5)
```

## 4.10 Bakemono candidate

```text
CMYK0 = rgb2cmyk_compat(B)
maskMix = 0.5 h + 0.5 e

glow = clamp(q * ad * maskMix * n, 0, 1)

Neon = [sqrt(C), sqrt(M), sqrt(Y)] * glow * 1.5

R_bakemono = mix(B, Neon, glow)
```

`C`, `M`, `Y`는 base에서 계산되어 `[0,1]` 범위여야 한다.

## 4.11 Fusion

```text
fusionRatio = smoothstep(0.3, 0.6, q)
F = mix(R_rinne, R_bakemono, fusionRatio)
```

## 4.12 Final compatibility blend

```text
k = clamp(q * s * p, 0, 1)
RGB_out_compat = mix(B, F, k)
A_out = A
```

Legacy source는 최종 RGB를 명시적으로 clamp하지 않는다.

Canonical storage adapter는 linear conversion 전에 finite check와 profile별 clamp 정책을 적용한다.

## 4.13 Compatibility formula ID

```text
tdt.effect.bakemono-rinne.formula.legacy-fusion-compat.v1
```

## 4.14 Formula invariant

- 연산 순서 변경 금지
- `6.283` literal 교정 금지
- Lab path와 CMYK path mix 0.5 변경 금지
- `phi*0.8`, `phi*0.9` 변경 금지
- mask 평균 0.5/0.5 변경 금지
- neon multiplier 1.5 변경 금지
- smoothstep edge 0.3/0.6 변경 금지
- 최종 `q*s*p` 순서와 clamp 의미 변경 금지
- RGB↔XYZ 행렬 transpose 교정 금지
- sRGB decode를 함수 내부에 몰래 추가 금지

이 중 하나라도 바꾸면 새 formula ID가 필요하다.

---

# 5. Formula Profiles

## 5.1 LEGACY_FUSION_COMPAT_SHADOW

```yaml
profileId: tdt.effect.bakemono-rinne.profile.legacy-fusion-compat-shadow.v1
formulaId: tdt.effect.bakemono-rinne.formula.legacy-fusion-compat.v1
tensorGateMode: IDENTITY_ONE
outputAuthority: SHADOW_ONLY
parityClaim: LEGACY_GLSL
```

목적:

- WGSL-02에서 GLSL 결과와 비교
- formula migration drift 검출
- 제품 canonical output authority 금지

이 profile은 R1C를 사용하지 않으므로 제품 승격할 수 없다.

## 5.2 R1C_GATED_CANONICAL

```yaml
profileId: tdt.effect.bakemono-rinne.profile.r1c-gated-canonical.v1
baseFormulaId: tdt.effect.bakemono-rinne.formula.legacy-fusion-compat.v1
tensorAdmissionId: tdt.effect.bakemono-rinne.tensor-admission.terminal-r1c.v1
outputAuthority: CANONICAL_CANDIDATE
parityClaim: NO_DIRECT_LEGACY_PARITY
```

R1C structure gate:

```text
c = clamp(coherence, 0, 1)
e_r1c = clamp(edgeStrength, 0, 1)

g_struct = pow(c, coherenceExponent) * e_r1c
```

Canonical profile은 legacy `edgeMask` 대신 `e_r1c`를 사용한다.

```text
maskMix_canonical = 0.5 h + 0.5 e_r1c

glow_canonical = clamp(q * ad * maskMix_canonical * n * g_struct, 0, 1)

k_canonical = clamp(q * s * p * g_struct, 0, 1)
```

`g_struct` 추가는 의미 변경이므로 legacy parity를 주장하지 않는다.

## 5.3 금지 profile 혼합

- compatibility output에 R1C gate를 몰래 곱하지 않는다.
- canonical output에서 tensor gate를 1로 fallback하지 않는다.
- 하나의 receipt에 두 profile ID를 동시에 기록하지 않는다.
- profile ID 없이 default branch를 선택하지 않는다.

---

# 6. Color Utility Contract

## 6.1 Surface boundary

Canonical input surface:

```yaml
format: rgba16float
transfer: linear
alphaMode: premultiplied
```

Legacy formula working surface:

```yaml
format: logical-f32-rgb
transfer: srgb-encoded-compat
alphaMode: straight
```

Canonical output surface:

```yaml
format: rgba16float
transfer: linear
alphaMode: premultiplied
```

## 6.2 Input adapter

픽셀 `P_lin_pm = [rgb_pm, alpha]`:

```text
alphaSafe = max(alpha, alphaEpsilon)

rgbLinearStraight =
  rgb_pm / alphaSafe   if alpha > alphaEpsilon
  [0,0,0]              otherwise

B = linearToSrgb(clamp(rgbLinearStraight, 0, +finiteMax))
```

`linearToSrgb`는 Canonical surface adapter 함수다. legacy `rgb2lab` 내부 함수가 아니다.

## 6.3 Output adapter

Compatibility formula output `RGB_out_encoded`:

```text
RGB_safe = finiteOrNeutral(RGB_out_encoded)
RGB_encoded_clamped = clamp(RGB_safe, 0, 1)
RGB_linear = srgbToLinear(RGB_encoded_clamped)
RGB_pm_out = RGB_linear * alpha
```

```text
P_out = [RGB_pm_out, alpha]
```

## 6.4 Color contract IDs

```text
tdt.effect.bakemono-rinne.color.legacy-encoded-matrix-compat.v1
tdt.effect.bakemono-rinne.surface-adapter.linear-premul-legacy-straight.v1
```

## 6.5 Future corrected color profile

다음은 이번 profile에 포함하지 않는다.

```text
proper sRGB decode before XYZ
standard row-major D65 matrix
chromatic adaptation
ICC CMYK conversion
wide-gamut working space
```

해당 구현은 별도 ID를 사용해야 한다.

```text
tdt.effect.bakemono-rinne.color.linear-d65-corrected.future.v1
```

## 6.6 Alpha invariant

- alpha는 legacy formula에서 변경하지 않는다.
- alpha 0 픽셀의 hidden RGB는 canonical output에서 0으로 정규화한다.
- unpremultiply는 `alphaEpsilon` 아래에서 수행하지 않는다.
- NaN 또는 Inf RGB는 canonical output에 기록하지 않는다.
- formula parity fixture는 encoded-straight domain에서 비교한다.
- product surface fixture는 linear-premultiplied domain에서 비교한다.

---

# 7. Explicit Scalar-Field Profiles

## 7.1 두 scalar 역할

Legacy fusion에는 독립적인 두 scalar가 있다.

```text
q
= Q-map, fusion branch와 strength driver

s
= u_deltaE red, phase offset와 Lab a shift와 final blend driver
```

`q`와 `s`를 같은 texture로 alias하지 않는다.

## 7.2 Q-map input contract

```yaml
inputRole: qmap
semanticId: tdt.effect.bakemono-rinne.qmap.normalized-response.v1
format: r16float-or-rgba16float
channel: R
range: [0,1]
neutral: 0
coordinateSpace: output-pixel
interpolation: linear
```

기존 adaptive policy qmap을 재사용할 경우 exact producer receipt를 포함해야 한다.

## 7.3 LEGACY_DELTA_E_COMPAT

```yaml
scalarProfileId: tdt.effect.bakemono-rinne.scalar.legacy-delta-e-compat.v1
inputRole: secondary-scalar
legacyUniform: u_deltaE
channel: R
semanticMeaning: legacy-normalized-delta-e-driver
range: [0,1]
neutral: 0
phaseContribution: +s
labAContribution: sin(phi)*s*6
finalMixContribution: q*s*power
```

중요:

이 profile 이름의 `delta-e`는 **CIEDE2000 정확도 claim이 아니다.**

다음 증거가 없으면 `CIE ΔE`라고 표시하지 않는다.

- 기준 color space
- reference white
- ΔE formula version
- source and comparison surfaces
- normalization mapping

## 7.4 QWAVE_REAL_DELTA_K

```yaml
scalarProfileId: tdt.effect.bakemono-rinne.scalar.qwave-real-delta-k.v1
sourceSemanticId: tdt.analysis.qwave.real-delta-k-compat.v1
channel: R
confidenceChannel: G
validityChannel: A
range: [0,1]
neutral: 0
```

이 profile은 legacy deltaE와 의미가 다르다.

따라서 다음 별도 formula mapping을 사용한다.

```text
s = realDeltaK
s_valid = s * confidence * validity
```

Rinne phase와 Lab displacement에서 사용할 값:

```text
s_effective = clamp(s_valid * scalarGain, 0, 1)
```

Profile ID:

```text
tdt.effect.bakemono-rinne.mapping.qwave-real-delta-k.v1
```

이 mapping은 legacy GLSL parity를 주장하지 않는다.

## 7.5 Scalar profile fail-closed

- scalar texture가 null이면 neutral fallback으로 제품 authority를 열지 않는다.
- semantic ID가 다르면 실패한다.
- range metadata가 없으면 실패한다.
- coordinate mapping이 identity가 아니고 mapping receipt가 없으면 실패한다.
- Q-wave validity가 0인 픽셀은 `s_effective=0`이다.
- profile ID와 texture semantic ID가 불일치하면 실패한다.
- `u_deltaE` 이름만 보고 Q-wave texture를 연결하지 않는다.

## 7.6 Mask profiles

### LEGACY_TEXTURE_MASKS

```yaml
maskProfileId: tdt.effect.bakemono-rinne.mask.legacy-textures.v1
alphaDepth: explicit texture R
highlight: explicit texture R
edge: explicit texture R
outputAuthority: SHADOW_ONLY_UNTIL_PROVEN
```

### CANONICAL_R1C_MASKS

```yaml
maskProfileId: tdt.effect.bakemono-rinne.mask.r1c-derived.v1
alphaDepth: base alpha
edge: R1C edge-strength
highlight: explicit canonical highlight field required
outputAuthority: CANONICAL_CANDIDATE
```

Highlight canonical field가 없으면 제품 profile은 실패한다. luminance에서 조용히 파생하지 않는다.

후속 WGSL-06에서 별도 highlight semantic 또는 명시적 derivation profile을 확정한다.

---

# 8. Integrated R1C Tensor-Only Admission

## 8.1 Required semantic

```text
tdt.analysis.tensor.tangent-coherence-edge.r1c.v1
```

Packing:

```text
R = tangent.x
G = tangent.y
B = coherence
A = edge-strength
```

이 semantic은 `fieldTexture`를 의미한다.

`axialFieldTexture`의 RG는 tangent가 아니라 `cos(2theta), sin(2theta)`다.

## 8.2 Terminal tensor requirement

제품 canonical profile은 final EWA output에서 다시 계산한 terminal R1C를 소비한다.

```text
EWA terminal rgba16float
→ R1C gradient
→ outer
→ blur H
→ blur V
→ eigen tangent/coherence/edge
→ Bakemono/Rinne
```

Admission condition:

```text
tensor.width == output.width
tensor.height == output.height
tensor.sourceSurfaceId == EWA terminal surface ID
tensor.sourceRevision == EWA terminal revision
tensor.runtimeEpoch == current runtime epoch
tensor.deviceEpoch == current device epoch
tensor.deviceIdentity == current device identity
tensor.coordinateMapping == IDENTITY
```

## 8.3 Producer receipt requirement

```ts
interface BakemonoRinneTensorAdmission {
  schemaVersion: 1;
  admissionId: 'tdt.effect.bakemono-rinne.tensor-admission.terminal-r1c.v1';
  semanticId: 'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1';
  tensorMode: 'canonical-terminal-r1c';
  tensorTruthClaim: true;
  sourceSurfaceId: string;
  sourceRevision: number;
  width: number;
  height: number;
  format: 'rgba16float';
  coordinateSpace: 'stage-pixel';
  coordinateMapping: 'IDENTITY_OUTPUT_PIXEL';
  tensorSigma: number;
  tensorParameterDigest: string;
  tensorPipelineIdentity: string;
  tensorShaderDigests: {
    gradient: string;
    outer: string;
    blurH: string;
    blurV: string;
    eigen: string;
  };
  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  lambda2GateReceiptDigest: string;
  digest: string;
}
```

## 8.4 Accepted shader digests

WGSL-01 기준 R1C source set:

```yaml
gradient: 8684b23a8ce508cdc3f924c33d1aa953d9f7f385caf5946f9abde60a0125d523
outer: 9f5efaf050770153aff11f8ac75fc23e58be0dd645bf447bfbb77b5db46acab7
blurH: 3a61bff829b29a8cfee2a6cd034f80c907f9818419a2ff11872f3694827f0dad
blurV: b107acc388179159aa0baf32abba2be445b4d91b34e73d0c40539e785497d038
eigen: c4560743a9d42718e261c2cd2f069289aed6efabd341dc11b89c7c765ff38728
```

Digest가 변경되면 자동 거절이 아니라 requalification이 필요하다.

## 8.5 Tensor parameter range

```text
tensorSigma > 0
kernelRadius >= 1
blurH present
blurV present
alphaEpsilon > 0
edgeHigh > edgeLow
```

WGSL-01 baseline:

```text
tensorSigma = 1.15
kernelRadius = 4
```

값 변경은 parameter digest와 fixture replay가 필요하다.

## 8.6 Same-command-graph ownership

Terminal Tensor와 effect pass는 같은 command graph 안에서 연결한다.

```text
record terminal tensor
→ record effect
→ tensor transient registration
→ one graph submit
```

다음은 금지한다.

- tensor texture intermediate readback
- CPU upload로 tensor 재생성
- WebGL tensor FBO import
- prior frame tensor 재사용
- stale device epoch texture 재사용
- caller가 임의 texture를 `tensorTex` 이름으로 전달

## 8.7 Tensor admission handle

Raw `GPUTexture`만으로 입장하지 않는다.

```ts
interface AdmittedR1CTensorHandle {
  texture: GPUTexture;
  semanticId: 'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1';
  receipt: BakemonoRinneTensorAdmission;
  releaseAfterRecord(): void;
}
```

---

# 9. Nonzero Lambda2 Gate Preservation

## 9.1 문제 정의

한 픽셀 gradient outer product:

```text
J = [Ix², IxIy; IxIy, Iy²]
```

```text
det(J) = Ix²Iy² - (IxIy)² = 0
```

따라서 non-flat pixel에서:

```text
lambda1 > 0
lambda2 = 0
coherence ≈ 1
```

공간 integration 없는 tensor는 corner와 junction을 구분하지 못한다.

## 9.2 Required integrated tensor

```text
J_integrated(x)
= G_sigma * [gradient(x) gradient(x)^T]
```

component form:

```text
Jxx = G_sigma * Ix²
Jxy = G_sigma * IxIy
Jyy = G_sigma * Iy²
```

Eigenvalues:

```text
trace = Jxx + Jyy
delta = sqrt((Jxx-Jyy)² + 4Jxy²)
lambda1 = 0.5(trace + delta)
lambda2 = 0.5(trace - delta)
coherence = (lambda1-lambda2)/(lambda1+lambda2+epsilon)
```

## 9.3 Gate fixture set

필수 fixture:

```text
FLAT
STRAIGHT_EDGE_0
STRAIGHT_EDGE_45
STRAIGHT_EDGE_90
L_CORNER
T_JUNCTION
CROSS_JUNCTION
CHECKER_ISOTROPIC
NOISE_ISOTROPIC_SEEDED
```

## 9.4 Compact validation metrics

```ts
interface Lambda2GateMetrics {
  activePixelCount: number;
  lambda2PositivePixelCount: number;
  lambda2PositiveRatio: number;
  minActiveCoherence: number;
  maxActiveCoherence: number;
  meanActiveCoherence: number;
  straightEdgeMeanCoherence: number;
  cornerMeanCoherence: number;
  junctionMeanCoherence: number;
  flatEnergyMax: number;
  nonFiniteCount: number;
}
```

## 9.5 Admission predicates

```text
activePixelCount > 0
nonFiniteCount == 0
flatEnergyMax <= flatEnergyEpsilon
lambda2PositivePixelCount > 0 for corner/junction fixtures
cornerMeanCoherence + 0.10 <= straightEdgeMeanCoherence
junctionMeanCoherence + 0.10 <= straightEdgeMeanCoherence
straightEdgeMeanCoherence >= 0.90
minActiveCoherence < 0.95 on mixed-direction fixtures
```

## 9.6 Blur-removed mutant

Negative control shader graph:

```text
gradient
→ outer
→ eigen
```

Expected:

```text
lambda2PositivePixelCount == 0 or below admitted minimum
corner coherence separation fails
mutant gate = FAIL
```

Source gate는 blur function 이름 존재만 검사하지 않는다.

실제 command graph order와 shader digest set을 검사한다.

## 9.7 Fake blur mutant

다음도 실패해야 한다.

```text
for each kernel tap:
  accumulate center Ix², center IxIy, center Iy²
```

주변 좌표에서 tensor component를 읽지 않으면 integration이 아니다.

## 9.8 Runtime policy

제품 실행에서 pixel별 lambda2 readback은 수행하지 않는다.

λ2 gate는 다음 시점에 compact counter readback만 허용한다.

- fixture qualification
- sampled validation
- packaged physical gate

제품 effect pass에는 intermediate readback이 없다.

---

# 10. Deterministic Rinne Phase

## 10.1 금지 authority

다음은 phase source로 사용할 수 없다.

```text
performance.now()
Date.now()
requestAnimationFrame timestamp
Math.random()
crypto.getRandomValues()
implicit frame arrival time
GPU timestamp query result
```

## 10.2 Phase formula

Compatibility profile:

```text
phi = phaseBase + q * 6.283 + s
```

Canonical scalar mapping profile:

```text
phi = phaseBase
    + q * phaseQGain
    + s_effective * phaseScalarGain
```

Compatibility baseline:

```text
phaseQGain = 6.283
phaseScalarGain = 1.0
```

## 10.3 Phase source modes

```text
STILL_EXPLICIT
PREVIEW_FRAME_INDEXED
TIMELINE_EXPLICIT
```

### STILL_EXPLICIT

```text
phaseBase = request.phaseBase
```

동일 입력과 동일 parameter에서 bit-stable 또는 admitted floating tolerance 결과를 요구한다.

### PREVIEW_FRAME_INDEXED

```text
phaseBase(frameIndex)
= phaseOrigin + frameIndex * phaseStep
```

`frameIndex`, `phaseOrigin`, `phaseStep`은 receipt에 기록한다.

### TIMELINE_EXPLICIT

```text
phaseBase = timelinePhase supplied by caller
```

Timeline time unit과 mapping digest를 요구한다.

## 10.4 Phase normalization

호환 계산 직전 다음 정규화를 수행할 수 있다.

```text
phaseWrapped = phaseBase - floor(phaseBase / TAU_COMPAT) * TAU_COMPAT
```

단, normalization on/off는 profile field로 봉인한다.

Legacy parity oracle가 unwrapped f32 rounding을 요구하면 `phaseWrapMode=NONE`을 사용한다.

## 10.5 Phase receipt

```ts
interface RinnePhaseReceipt {
  schemaVersion: 1;
  phaseContractId: 'tdt.effect.bakemono-rinne.phase.explicit-base.v1';
  mode: 'STILL_EXPLICIT' | 'PREVIEW_FRAME_INDEXED' | 'TIMELINE_EXPLICIT';
  phaseBase: number;
  phaseOrigin: number | null;
  phaseStep: number | null;
  frameIndex: number | null;
  phaseQGain: number;
  phaseScalarGain: number;
  phaseWrapMode: 'NONE' | 'COMPAT_TAU';
  parameterDigest: string;
  digest: string;
}
```

## 10.6 Determinism gate

동일 fixture를 10회 실행한다.

```text
same input digests
same formula profile
same scalar profile
same tensor receipt
same phase receipt
→ same output digest or exact admitted tolerance summary
```

Phase receipt가 다르면 output 차이는 허용되지만 lineage가 달라야 한다.

---

# 11. Parameter Contract

## 11.1 Logical parameter model

```ts
interface BakemonoRinneFormulaParameters {
  formulaProfileId:
    | 'tdt.effect.bakemono-rinne.profile.legacy-fusion-compat-shadow.v1'
    | 'tdt.effect.bakemono-rinne.profile.r1c-gated-canonical.v1';
  scalarProfileId:
    | 'tdt.effect.bakemono-rinne.scalar.legacy-delta-e-compat.v1'
    | 'tdt.effect.bakemono-rinne.scalar.qwave-real-delta-k.v1';
  maskProfileId:
    | 'tdt.effect.bakemono-rinne.mask.legacy-textures.v1'
    | 'tdt.effect.bakemono-rinne.mask.r1c-derived.v1';
  phaseContractId: 'tdt.effect.bakemono-rinne.phase.explicit-base.v1';
  phaseBase: number;
  phaseQGain: number;
  phaseScalarGain: number;
  power: number;
  neonBoost: number;
  scalarGain: number;
  coherenceExponent: number;
  alphaEpsilon: number;
  fusionLow: number;
  fusionHigh: number;
}
```

## 11.2 Admitted baseline

```yaml
phaseQGain: 6.283
phaseScalarGain: 1.0
power: 1.0
neonBoost: 1.0
scalarGain: 1.0
coherenceExponent: 1.0
alphaEpsilon: 0.000001
fusionLow: 0.3
fusionHigh: 0.6
```

## 11.3 Range checks

```text
finite(phaseBase)
0 <= phaseQGain <= 64
0 <= phaseScalarGain <= 64
0 <= power <= 8
0 <= neonBoost <= 8
0 <= scalarGain <= 8
0.1 <= coherenceExponent <= 8
1e-9 <= alphaEpsilon <= 0.1
0 <= fusionLow < fusionHigh <= 1
```

## 11.4 Parameter digest

Canonical JSON key order를 고정한다.

```text
formulaProfileId
scalarProfileId
maskProfileId
phaseContractId
phaseBase
phaseQGain
phaseScalarGain
power
neonBoost
scalarGain
coherenceExponent
alphaEpsilon
fusionLow
fusionHigh
```

NaN, Infinity, `-0`, locale number formatting은 거절한다.

---

# 12. Input Set Contract

## 12.1 Required inputs by profile

### Legacy shadow

```text
baseSurface
qmapTexture
secondaryScalarTexture
alphaDepthTexture
highlightTexture
edgeTexture
phaseReceipt
```

Tensor는 요구하지 않지만 output authority는 SHADOW_ONLY다.

### R1C canonical

```text
baseSurface
qmapTexture
secondaryScalarHandle
terminalR1CTensorHandle
highlightFieldHandle
phaseReceipt
```

Derived:

```text
alphaDepth = base alpha
edge = R1C edge-strength
coherence = R1C coherence
```

## 12.2 Exact dimensions

첫 canonical 구현은 모든 texture가 output dimensions와 같아야 한다.

```text
base width/height
== qmap width/height
== scalar width/height
== tensor width/height
== highlight width/height
== output width/height
```

Implicit resampling은 금지한다.

후속 profile에서 coordinate mapping을 추가한다.

## 12.3 Device and epoch

모든 GPU resource:

```text
same GPUDevice
same runtimeEpoch
same deviceEpoch
same deviceIdentity
```

Stale field는 neutral fallback하지 않고 실패한다.

---

# 13. Formula Contract Receipt

```ts
interface BakemonoRinneFormulaContractReceipt {
  schemaVersion: 1;
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-01';
  formulaAuthoritySource: string;
  formulaAuthoritySha256: string;
  utilityAuthoritySource: string;
  utilityAuthoritySha256: string;
  formulaId: string;
  formulaProfileId: string;
  colorContractId: string;
  surfaceAdapterId: string;
  scalarProfileId: string;
  maskProfileId: string;
  tensorAdmissionId: string | null;
  phaseContractId: string;
  parameterDigest: string;
  formulaInventoryDigest: string;
  legacyMatrixExecutionMode: 'GLSL_COLUMN_MAJOR_EFFECTIVE';
  outputAuthority: 'SHADOW_ONLY' | 'CANONICAL_CANDIDATE';
  digest: string;
}
```

Digest parent set:

```text
formula inventory digest
formula source digest
utility source digest
parameter digest
scalar profile digest
tensor admission digest or null
phase receipt digest
color contract digest
```

---

# 14. No Legacy Tensor Authority Seal

## 14.1 Denied source set

다음 source는 제품 tensor authority가 될 수 없다.

```yaml
- path: app/legacy-runtime/gl/tensor.glsl
  sha256: c67f0d9f9746058a099529fec9d3fc364244c81d2fd8a45d3fb71acce86cde68
  reason: PER_PIXEL_OUTER_NO_SPATIAL_INTEGRATION

- path: app/legacy-runtime/gl/passes/tensorPass.glsl
  sha256: 34e7818fbe1151bd0077beb39aa1cc27ca66af7184b65a856d3374cdfcd6ecfa
  reason: PER_PIXEL_OUTER_NO_SPATIAL_INTEGRATION

- path: app/legacy-runtime/shaders/grad_and_tensor.glsl
  sha256: 9d149cfcc1c976ae4df6f387fa3b0985b0e09cb61dc027517d757373fb59b00d
  reason: CENTER_GRADIENT_REPEATED_FAKE_INTEGRATION

- path: app/legacy-runtime/ash_qtensor_icc/shaders/tensor_update_pass.frag
  sha256: 63c3b5cd901dd99b1e7653c7cb5cd293a842010c329d937f6e478421fdf836f8
  reason: TEMPORAL_HYSTERESIS_NOT_SPATIAL_INTEGRATION
```

## 14.2 Denied runtime forms

- WebGL texture carrying unnamed tensor matrix
- raw RGBA texture with no semantic ID
- caller supplied `tensorTex` without receipt
- prior frame tensor
- CPU-calculated tangent map
- canvas-derived edge map presented as tensor
- coherence hardcoded to 1
- missing tensor replaced by neutral direction with open gate

## 14.3 Fail closed behavior

Canonical profile에서 R1C admission이 실패하면:

```text
throw stable error
no effect output texture commit
no terminal texture authority change
no Preview publication
no Export publication
```

Legacy shadow profile은 별도 diagnostic output만 만들 수 있다.

---

# 15. Stable Error Codes

| Code | 의미 |
|---|---|
| `E_BKR01_FORMULA_AUTHORITY_MISSING` | authority source 없음 |
| `E_BKR01_FORMULA_AUTHORITY_DIGEST_MISMATCH` | source digest 불일치 |
| `E_BKR01_MULTIPLE_FORMULA_AUTHORITIES` | authority가 둘 이상 |
| `E_BKR01_QUARANTINED_SOURCE_ADMITTED` | 금지 source가 generator 입력에 포함 |
| `E_BKR01_COLOR_CONTRACT_MISSING` | color contract 없음 |
| `E_BKR01_COLOR_MATRIX_MODE_MISMATCH` | 실제 GLSL 행렬 mode 불일치 |
| `E_BKR01_SURFACE_TRANSFER_MISMATCH` | linear/encoded 경계 불일치 |
| `E_BKR01_ALPHA_MODE_MISMATCH` | premultiplied/straight 불일치 |
| `E_BKR01_SCALAR_PROFILE_MISSING` | scalar profile 없음 |
| `E_BKR01_SCALAR_SEMANTIC_MISMATCH` | scalar semantic 불일치 |
| `E_BKR01_QMAP_RANGE_UNPROVEN` | Q-map range 증거 없음 |
| `E_BKR01_SCALAR_RANGE_UNPROVEN` | scalar range 증거 없음 |
| `E_BKR01_TENSOR_REQUIRED` | canonical profile에 tensor 없음 |
| `E_BKR01_TENSOR_SEMANTIC_MISMATCH` | R1C semantic 불일치 |
| `E_BKR01_TENSOR_PACKING_MISMATCH` | tangent texture와 axial texture 혼동 |
| `E_BKR01_TENSOR_SOURCE_MISMATCH` | terminal surface lineage 불일치 |
| `E_BKR01_TENSOR_DIMENSION_MISMATCH` | output dimensions 불일치 |
| `E_BKR01_TENSOR_EPOCH_MISMATCH` | stale tensor |
| `E_BKR01_TENSOR_NOT_INTEGRATED` | blur H/V 증거 없음 |
| `E_BKR01_LAMBDA2_GATE_FAILED` | λ2/coherence fixture 실패 |
| `E_BKR01_LEGACY_TENSOR_DENIED` | legacy tensor authority 요청 |
| `E_BKR01_PHASE_SOURCE_NONDETERMINISTIC` | clock/random phase 사용 |
| `E_BKR01_PHASE_RECEIPT_MISSING` | phase receipt 없음 |
| `E_BKR01_PARAMETER_NONFINITE` | parameter NaN/Inf |
| `E_BKR01_PROFILE_AUTHORITY_DENIED` | shadow profile이 canonical output 요청 |

---

# 16. Required Source Artifacts

WGSL-01 베이크 시 생성할 파일:

```text
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_legacy_formula_inventory.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_formula_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_color_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_scalar_profiles.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_tensor_admission.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_phase_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_contract_receipt.mjs
app/src/runtime/effects/bakemono-rinne/bakemono-rinne-types.ts
app/src/runtime/effects/bakemono-rinne/generated-bakemono-rinne-formula-inventory.json
tools/bakemono-rinne-wgsl-01/verify-source.mjs
tools/bakemono-rinne-wgsl-01/verify-formula-oracle.mjs
tools/bakemono-rinne-wgsl-01/verify-tensor-negative-controls.mjs
```

WGSL shader 파일은 WGSL-02 전까지 생성하지 않는다.

---

# 17. Source Gate Matrix

Source Gate 총계:

```text
Formula Inventory          24
Formula Contract           28
Color Contract             20
Scalar Profiles            20
Tensor Admission           28
Lambda2 Negative Controls  20
Phase Determinism          16
Authority and Receipt      20
--------------------------------
Total                     176
```


## 17.1 Formula Inventory gates

| Gate | 조건 | 기대 |
|---|---|---|
| `BKR01-INV-001` | authority source path exact | PASS |
| `BKR01-INV-002` | authority source SHA-256 exact | PASS |
| `BKR01-INV-003` | utility source path exact | PASS |
| `BKR01-INV-004` | utility source SHA-256 exact | PASS |
| `BKR01-INV-005` | exactly one FORMULA_AUTHORITY | PASS |
| `BKR01-INV-006` | duplicate alias byte identity | PASS |
| `BKR01-INV-007` | root mixed-dialect fusion quarantined | PASS |
| `BKR01-INV-008` | patched root fusion future-only | PASS |
| `BKR01-INV-009` | patched shaders fusion quarantined | PASS |
| `BKR01-INV-010` | standalone Rinne reference-only | PASS |
| `BKR01-INV-011` | standalone Bakemono reference-only | PASS |
| `BKR01-INV-012` | tensor Bakemono future-only | PASS |
| `BKR01-INV-013` | deltaE attenuation future-only | PASS |
| `BKR01-INV-014` | gamma Rinne future-only | PASS |
| `BKR01-INV-015` | empty Bakemono document-only | PASS |
| `BKR01-INV-016` | falloff fragment document-only | PASS |
| `BKR01-INV-017` | inventory canonical JSON order | PASS |
| `BKR01-INV-018` | inventory digest reproducible | PASS |
| `BKR01-INV-019` | unknown fragment fail-closed | PASS |
| `BKR01-INV-020` | source rename without manifest fails | PASS |
| `BKR01-INV-021` | digest mutation negative control | PASS |
| `BKR01-INV-022` | classification mutation negative control | PASS |
| `BKR01-INV-023` | second authority negative control | PASS |
| `BKR01-INV-024` | quarantined generator input negative control | PASS |

## 17.2 Formula Contract gates

| Gate | 조건 | 기대 |
|---|---|---|
| `BKR01-FOR-001` | TAU_COMPAT equals 6.283 | PASS |
| `BKR01-FOR-002` | effective RGB-to-XYZ matrix exact | PASS |
| `BKR01-FOR-003` | effective XYZ-to-RGB matrix exact | PASS |
| `BKR01-FOR-004` | Lab threshold 0.008856 exact | PASS |
| `BKR01-FOR-005` | Lab linear coefficient 7.787 exact | PASS |
| `BKR01-FOR-006` | white point 0.9505/1/1.089 exact | PASS |
| `BKR01-FOR-007` | Rinne phase order exact | PASS |
| `BKR01-FOR-008` | Lab a displacement exact | PASS |
| `BKR01-FOR-009` | Lab b displacement exact | PASS |
| `BKR01-FOR-010` | CMYK C phase multiplier 0.8 exact | PASS |
| `BKR01-FOR-011` | CMYK M phase multiplier 0.9 exact | PASS |
| `BKR01-FOR-012` | CMYK displacement 0.1 exact | PASS |
| `BKR01-FOR-013` | Lab/CMYK mix 0.5 exact | PASS |
| `BKR01-FOR-014` | mask average 0.5/0.5 exact | PASS |
| `BKR01-FOR-015` | neon sqrt exponent 0.5 exact | PASS |
| `BKR01-FOR-016` | neon multiplier 1.5 exact | PASS |
| `BKR01-FOR-017` | fusion smoothstep 0.3/0.6 exact | PASS |
| `BKR01-FOR-018` | final k q*s*power exact | PASS |
| `BKR01-FOR-019` | final alpha preserved | PASS |
| `BKR01-FOR-020` | Lab output clamp preserved | PASS |
| `BKR01-FOR-021` | CMYK output unclamped internally | PASS |
| `BKR01-FOR-022` | operation ordering canonical | PASS |
| `BKR01-FOR-023` | profile ID required | PASS |
| `BKR01-FOR-024` | compat profile shadow-only | PASS |
| `BKR01-FOR-025` | R1C profile distinct ID | PASS |
| `BKR01-FOR-026` | constant mutation negative control | PASS |
| `BKR01-FOR-027` | matrix transpose negative control | PASS |
| `BKR01-FOR-028` | hidden sRGB decode negative control | PASS |

## 17.3 Color Contract gates

| Gate | 조건 | 기대 |
|---|---|---|
| `BKR01-COL-001` | canonical input rgba16float | PASS |
| `BKR01-COL-002` | canonical input linear | PASS |
| `BKR01-COL-003` | canonical input premultiplied | PASS |
| `BKR01-COL-004` | legacy working encoded RGB | PASS |
| `BKR01-COL-005` | legacy working straight alpha | PASS |
| `BKR01-COL-006` | safe unpremultiply | PASS |
| `BKR01-COL-007` | alpha epsilon range | PASS |
| `BKR01-COL-008` | linear-to-sRGB adapter explicit | PASS |
| `BKR01-COL-009` | legacy rgb2lab no internal transfer decode | PASS |
| `BKR01-COL-010` | legacy output finite check | PASS |
| `BKR01-COL-011` | encoded output clamp at adapter | PASS |
| `BKR01-COL-012` | sRGB-to-linear adapter explicit | PASS |
| `BKR01-COL-013` | output premultiply | PASS |
| `BKR01-COL-014` | output alpha preserved | PASS |
| `BKR01-COL-015` | hidden RGB zero at alpha zero | PASS |
| `BKR01-COL-016` | color contract ID receipt | PASS |
| `BKR01-COL-017` | surface adapter ID receipt | PASS |
| `BKR01-COL-018` | row-major corrected profile not aliased | PASS |
| `BKR01-COL-019` | alpha-mode mutation negative control | PASS |
| `BKR01-COL-020` | transfer-mode mutation negative control | PASS |

## 17.4 Scalar Profiles gates

| Gate | 조건 | 기대 |
|---|---|---|
| `BKR01-SCL-001` | qmap role explicit | PASS |
| `BKR01-SCL-002` | qmap range [0,1] | PASS |
| `BKR01-SCL-003` | qmap neutral 0 | PASS |
| `BKR01-SCL-004` | qmap output-pixel coordinates | PASS |
| `BKR01-SCL-005` | legacy deltaE profile explicit | PASS |
| `BKR01-SCL-006` | legacy deltaE not CIEDE2000 claim | PASS |
| `BKR01-SCL-007` | Q-wave real deltaK profile explicit | PASS |
| `BKR01-SCL-008` | Q-wave confidence channel G | PASS |
| `BKR01-SCL-009` | Q-wave validity channel A | PASS |
| `BKR01-SCL-010` | Q-wave mapping distinct formula ID | PASS |
| `BKR01-SCL-011` | q and s no texture alias | PASS |
| `BKR01-SCL-012` | scalar gain explicit | PASS |
| `BKR01-SCL-013` | missing scalar fail-closed | PASS |
| `BKR01-SCL-014` | semantic mismatch fail-closed | PASS |
| `BKR01-SCL-015` | range metadata required | PASS |
| `BKR01-SCL-016` | coordinate mapping required | PASS |
| `BKR01-SCL-017` | validity zero makes scalar zero | PASS |
| `BKR01-SCL-018` | profile ID in receipt | PASS |
| `BKR01-SCL-019` | deltaE label spoof negative control | PASS |
| `BKR01-SCL-020` | Q-wave alias negative control | PASS |

## 17.5 Tensor Admission gates

| Gate | 조건 | 기대 |
|---|---|---|
| `BKR01-TEN-001` | required semantic ID exact | PASS |
| `BKR01-TEN-002` | fieldTexture tangent packing exact | PASS |
| `BKR01-TEN-003` | axial texture packing distinguished | PASS |
| `BKR01-TEN-004` | terminal source surface lineage | PASS |
| `BKR01-TEN-005` | terminal source revision lineage | PASS |
| `BKR01-TEN-006` | tensor dimensions exact | PASS |
| `BKR01-TEN-007` | identity coordinate mapping | PASS |
| `BKR01-TEN-008` | runtime epoch exact | PASS |
| `BKR01-TEN-009` | device epoch exact | PASS |
| `BKR01-TEN-010` | device identity exact | PASS |
| `BKR01-TEN-011` | tensor truth claim true | PASS |
| `BKR01-TEN-012` | tensor mode canonical-terminal-r1c | PASS |
| `BKR01-TEN-013` | tensor sigma positive | PASS |
| `BKR01-TEN-014` | kernel radius positive | PASS |
| `BKR01-TEN-015` | gradient digest recorded | PASS |
| `BKR01-TEN-016` | outer digest recorded | PASS |
| `BKR01-TEN-017` | blurH digest recorded | PASS |
| `BKR01-TEN-018` | blurV digest recorded | PASS |
| `BKR01-TEN-019` | eigen digest recorded | PASS |
| `BKR01-TEN-020` | lambda2 receipt digest recorded | PASS |
| `BKR01-TEN-021` | same command graph ownership | PASS |
| `BKR01-TEN-022` | raw GPUTexture denied | PASS |
| `BKR01-TEN-023` | stale tensor denied | PASS |
| `BKR01-TEN-024` | prior frame tensor denied | PASS |
| `BKR01-TEN-025` | CPU tensor denied | PASS |
| `BKR01-TEN-026` | WebGL tensor denied | PASS |
| `BKR01-TEN-027` | axial-as-tangent negative control | PASS |
| `BKR01-TEN-028` | missing tensor no open-gate fallback | PASS |

## 17.6 Lambda2 Negative Controls gates

| Gate | 조건 | 기대 |
|---|---|---|
| `BKR01-L2-001` | flat field energy neutral | PASS |
| `BKR01-L2-002` | straight edge active | PASS |
| `BKR01-L2-003` | straight edge coherence >=0.90 | PASS |
| `BKR01-L2-004` | corner lambda2 positive | PASS |
| `BKR01-L2-005` | junction lambda2 positive | PASS |
| `BKR01-L2-006` | corner coherence separated | PASS |
| `BKR01-L2-007` | junction coherence separated | PASS |
| `BKR01-L2-008` | mixed fixture min coherence <0.95 | PASS |
| `BKR01-L2-009` | nonfinite count zero | PASS |
| `BKR01-L2-010` | blur-removed mutant fails | PASS |
| `BKR01-L2-011` | blurH-only mutant fails | PASS |
| `BKR01-L2-012` | blurV-only mutant fails | PASS |
| `BKR01-L2-013` | center-repeat fake blur fails | PASS |
| `BKR01-L2-014` | temporal hysteresis tensor fails | PASS |
| `BKR01-L2-015` | hardcoded coherence one fails | PASS |
| `BKR01-L2-016` | zero lambda2 receipt fails | PASS |
| `BKR01-L2-017` | command graph order exact | PASS |
| `BKR01-L2-018` | compact counter schema exact | PASS |
| `BKR01-L2-019` | product readback remains zero | PASS |
| `BKR01-L2-020` | sampled qualification readback bounded | PASS |

## 17.7 Phase Determinism gates

| Gate | 조건 | 기대 |
|---|---|---|
| `BKR01-PHS-001` | phase contract ID exact | PASS |
| `BKR01-PHS-002` | phaseBase finite | PASS |
| `BKR01-PHS-003` | STILL_EXPLICIT mode | PASS |
| `BKR01-PHS-004` | PREVIEW_FRAME_INDEXED mode | PASS |
| `BKR01-PHS-005` | TIMELINE_EXPLICIT mode | PASS |
| `BKR01-PHS-006` | frame index integer | PASS |
| `BKR01-PHS-007` | phase step finite | PASS |
| `BKR01-PHS-008` | phase origin finite | PASS |
| `BKR01-PHS-009` | phase wrap mode explicit | PASS |
| `BKR01-PHS-010` | performance.now denied | PASS |
| `BKR01-PHS-011` | Date.now denied | PASS |
| `BKR01-PHS-012` | Math.random denied | PASS |
| `BKR01-PHS-013` | crypto randomness denied | PASS |
| `BKR01-PHS-014` | same input ten-run deterministic | PASS |
| `BKR01-PHS-015` | phase receipt digest lineage | PASS |
| `BKR01-PHS-016` | missing phase receipt fails | PASS |

## 17.8 Authority and Receipt gates

| Gate | 조건 | 기대 |
|---|---|---|
| `BKR01-AUT-001` | formula receipt schema exact | PASS |
| `BKR01-AUT-002` | formula inventory digest parent | PASS |
| `BKR01-AUT-003` | source digest parent | PASS |
| `BKR01-AUT-004` | utility digest parent | PASS |
| `BKR01-AUT-005` | parameter digest parent | PASS |
| `BKR01-AUT-006` | scalar profile digest parent | PASS |
| `BKR01-AUT-007` | tensor admission digest parent | PASS |
| `BKR01-AUT-008` | phase receipt digest parent | PASS |
| `BKR01-AUT-009` | color contract digest parent | PASS |
| `BKR01-AUT-010` | output authority explicit | PASS |
| `BKR01-AUT-011` | shadow profile canonical commit denied | PASS |
| `BKR01-AUT-012` | canonical profile tensor required | PASS |
| `BKR01-AUT-013` | no silent profile default | PASS |
| `BKR01-AUT-014` | no unknown profile | PASS |
| `BKR01-AUT-015` | stable error code preserved | PASS |
| `BKR01-AUT-016` | canonical JSON reproducible | PASS |
| `BKR01-AUT-017` | receipt tamper negative control | PASS |
| `BKR01-AUT-018` | parent digest omission negative control | PASS |
| `BKR01-AUT-019` | multiple profile negative control | PASS |
| `BKR01-AUT-020` | unknown authority negative control | PASS |


---

# 18. Formula Oracle Fixture

WGSL-01은 shader를 만들지 않지만 CPU formula oracle을 고정한다.

## 18.1 Fixture categories

```text
black opaque
white opaque
middle gray opaque
red/green/blue primaries
cyan/magenta/yellow
alpha 0
alpha near epsilon
q = 0
q = 0.3
q = 0.6
q = 1
s = 0
s = 0.5
s = 1
phase = 0
phase = pi/2 approximate
phase = 6.283 boundary
mask all zero
mask highlight only
mask edge only
mask both one
```

## 18.2 Oracle output

```ts
interface FormulaOracleRow {
  fixtureId: string;
  input: Record<string, number | number[]>;
  effectiveXyz: [number, number, number];
  lab0: [number, number, number];
  cmyk0: [number, number, number, number];
  phase: number;
  rinneRgb: [number, number, number];
  bakemonoRgb: [number, number, number];
  fusionRatio: number;
  finalMix: number;
  outputEncodedStraight: [number, number, number, number];
  rowDigest: string;
}
```

## 18.3 Numeric behavior

CPU oracle는 f64 reference와 f32 emulation 결과를 모두 저장한다.

WGSL-02 parity는 f32 emulation을 기준으로 한다.

```text
absolute channel tolerance <= 2e-4
or
ULP policy defined by WGSL-02 physical adapter matrix
```

행렬 transpose, standard sRGB Lab 교정, true tau 교정은 negative control에서 차이를 검출해야 한다.

---

# 19. Negative Control Scenarios

## NC-01 Matrix transpose correction

호환 matrix를 standard row-major 의도식으로 교체한다.

기대:

```text
formula oracle mismatch
source gate fail
```

## NC-02 Hidden sRGB decode

`rgb2lab` 내부에 sRGB decode를 추가한다.

기대:

```text
legacy parity fail
new color profile ID required
```

## NC-03 True tau replacement

`6.283`을 full precision tau로 교체한다.

기대:

```text
phase boundary fixture mismatch
formula ID mutation required
```

## NC-04 Raw tensor admission

`gl/tensor.glsl` output을 R1C semantic 이름으로 포장한다.

기대:

```text
shader digest mismatch
lambda2 gate fail
legacy tensor denied
```

## NC-05 Axial/tangent packing confusion

`axialFieldTexture.rg`를 tangent vector로 직접 사용한다.

기대:

```text
packing contract fail
rotated edge fixture direction mismatch
```

## NC-06 Missing tensor fallback

Canonical profile에서 tensor가 없을 때 `coherence=1`, `edge=1`을 사용한다.

기대:

```text
E_BKR01_TENSOR_REQUIRED
no output authority
```

## NC-07 Clock phase

phaseBase를 `performance.now()`에서 생성한다.

기대:

```text
active source scan fail
10-run determinism fail
```

## NC-08 Scalar semantic alias

Q-wave real ΔK texture를 legacy deltaE profile ID로 제출한다.

기대:

```text
E_BKR01_SCALAR_SEMANTIC_MISMATCH
```

## NC-09 Shadow promotion

Legacy compatibility shadow profile output을 terminal texture로 채택한다.

기대:

```text
E_BKR01_PROFILE_AUTHORITY_DENIED
```

## NC-10 Color adapter omission

linear-premultiplied EWA output을 encoded-straight로 간주한다.

기대:

```text
surface contract fail
alpha fixture mismatch
```

---

# 20. Implementation Order

## Phase 1. Inventory Authority

```text
source scan
→ digest inventory
→ one authority selection
→ quarantine set
→ generated manifest
```

완료 조건:

```text
24/24 Inventory gates PASS
```

## Phase 2. Formula and Color Contract

```text
actual GLSL matrix math
→ CPU f64 oracle
→ CPU f32 oracle
→ color surface adapter contract
```

완료 조건:

```text
28/28 Formula gates PASS
20/20 Color gates PASS
```

## Phase 3. Scalar Profiles

```text
Q-map contract
→ legacy deltaE profile
→ Q-wave real ΔK profile
→ no implicit alias
```

완료 조건:

```text
20/20 Scalar gates PASS
```

## Phase 4. Tensor Admission

```text
R1C semantic
→ terminal surface lineage
→ shader digest set
→ same graph handle
→ legacy tensor denylist
```

완료 조건:

```text
28/28 Tensor gates PASS
```

## Phase 5. Lambda2 Gate

```text
CPU fixture
→ integrated tensor oracle
→ blur-removed mutant
→ compact metrics receipt
```

완료 조건:

```text
20/20 Lambda2 gates PASS
```

## Phase 6. Phase and Receipt

```text
explicit phase modes
→ parameter digest
→ formula receipt
→ deterministic replay
```

완료 조건:

```text
16/16 Phase gates PASS
20/20 Authority gates PASS
```

---

# 21. Completion Gate

WGSL-01 SOURCE PASS 조건:

```text
176/176 source gates PASS
formula authority exactly one
formula oracle generated and reproducible
legacy matrix execution mode fixed
scalar profiles separate
terminal R1C admission contract complete
lambda2 negative controls reject mutants
deterministic phase contract complete
legacy tensor denylist active
no WGSL kernel authority claim
no canonical final texture claim
```

WGSL-01은 다음을 PASS로 주장하지 않는다.

```text
WGSL compile
WebGL-to-WGSL pixel parity
physical GPU execution
single encoder/single submit
canonical terminal texture adoption
Preview/Export convergence
```

그 항목은 후속 패치의 물리 게이트다.

---

# 22. Next Specification

```text
TDT-BAKEMONO-RINNE-WGSL-02

Compatibility WGSL Compute Kernel /
Exact Formula ABI /
Legacy Encoded-Straight Color Adapter /
CPU-f32 Oracle Parity /
Headless WebGL Fixture Parity /
Finite Output and Alpha Preservation /
Shadow-Only Dispatch Seal
```

WGSL-02 완료 전에는 바케모노·린네 output을 Canonical Final Texture로 채택하지 않는다.

---

# 23. 최종 봉인문

```text
The Bakemono/Rinne migration begins from one byte-identified formula authority.
Compatibility preserves executed legacy math, including its matrix and transfer mistakes.
Corrected color science requires a different profile identity.
Legacy deltaE and Q-wave real DeltaK are not aliases.
Canonical output requires a terminal integrated R1C tensor from the same device epoch and command graph.
Per-pixel outer-product tensors, fake blur tensors, and temporal-only tensor updates have no authority.
Rinne phase is explicit, receipt-bound, and independent of wall-clock timing.
WGSL-01 seals meaning before WGSL-02 writes code.
```
