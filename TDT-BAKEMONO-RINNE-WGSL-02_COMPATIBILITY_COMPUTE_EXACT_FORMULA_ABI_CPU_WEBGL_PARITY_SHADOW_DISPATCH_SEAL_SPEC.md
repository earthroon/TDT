# TDT-BAKEMONO-RINNE-WGSL-02

## Compatibility WGSL Compute Kernel /
## Exact Formula ABI /
## Legacy Encoded-Straight Color Adapter /
## CPU-f32 Oracle Parity /
## Headless WebGL Fixture Parity /
## RGBA16Float Candidate Output /
## Finite Output and Alpha Preservation /
## Shadow-Only Dispatch Seal

> 상태: 명세 rev.1
>
> 기준 일자: `2026-08-02`
>
> 기준 부모 번들: `65_TDT_BAKEMONO_RINNE_WGSL_01_FORMULA_COLOR_SCALAR_R1C_PHASE_AUTHORITY_SOURCE_BAKED_AWAITING_WGSL_02.zip`
>
> 부모 번들 SHA-256: `f76d550c1e05d215ac61254c57188de1c7b1e2caebcae0322f72c790627d85df`
>
> 부모 명세: `TDT-BAKEMONO-RINNE-WGSL-01_LEGACY_FORMULA_COLOR_SCALAR_R1C_TENSOR_PHASE_AUTHORITY_SEAL_SPEC.md`
>
> 부모 명세 SHA-256: `f0cd3c4cae942f4e7891adf0373129b604c6a606742a75b84319c402cec385c3`
>
> Formula Authority: `app/legacy-runtime/shaders/rinne_bakemono_fusion_frag.glsl`
>
> Formula Authority SHA-256: `88a33809136a3a3dafd1397e2a017a9c644e866ae9fb29ed54990a554f9601e1`
>
> Color Utility Authority: `app/legacy-runtime/shaders/glsl_util.glsl`
>
> Color Utility SHA-256: `410558cb4697e8e692e0321b1376d690725be582badb99d85e39e3ae830905c1`
>
> 패치 역할: WGSL-01에서 봉인한 레거시 fusion 수식과 색공간 adapter를 실제 WebGPU compute kernel로 구현하고, CPU-f32 oracle과 원본 WebGL fragment fixture를 통해 의미 parity를 검증한다. 이 커널은 실행 가능한 GPU 코드가 되지만 출력 권한은 `SHADOW_ONLY`로 고정한다.
>
> 이 명세는 Terminal R1C Tensor 생성, R9A command graph 본선 기록, Canonical Final Texture 채택, Preview 또는 Export 승격을 수행하지 않는다. 해당 범위는 각각 `WGSL-03`, `WGSL-04`, `WGSL-05`, `WGSL-07`에서 닫는다.
>
> 원칙: `WGSL compile != formula parity`, `legacy name != corrected color science`, `shader output != final texture authority`, `test readback != product readback`, `compatibility ABI != canonical R1C ABI`, `same pixels != same lineage`, `WebGL reference port != original fragment reference`.

---

# 0. 목적

WGSL-01은 바케모노·린네 레거시 수식의 실제 실행 의미를 고정했다.

현재 확정된 Formula Authority는 다음 입력을 소비한다.

```text
base encoded-straight RGB + alpha
q-map red
secondary scalar red
alpha-depth red
highlight mask red
edge mask red
explicit phase
power
neon boost
```

그리고 다음 연산을 수행한다.

```text
legacy RGB → XYZ → Lab
legacy RGB → CMYK
Rinne Lab/CMYK color cycle
Bakemono CMYK neon candidate
q-map smoothstep fusion
q × secondary scalar × power final blend
alpha preservation
```

WGSL-02의 목적은 이 수식을 WebGPU에서 실제 실행 가능하게 만드는 것이다.

단, 이번 단계의 출력은 제품 결과가 아니다.

```text
WGSL-02 output
= executable compatibility candidate
= qualification and diagnostic shadow only
= Canonical Final Texture 아님
```

이번 명세 완료는 다음을 의미한다.

1. 하나의 byte-identified WGSL compatibility kernel이 생성된다.
2. WGSL kernel의 상수, 연산 순서, matrix 실행 방향이 WGSL-01 Formula Contract와 일치한다.
3. Canonical `rgba16float / linear / premultiplied` 입력이 legacy encoded-straight working domain으로 명시적으로 변환된다.
4. 레거시 formula 결과가 다시 canonical linear-premultiplied `rgba16float`로 기록된다.
5. CPU-f32 oracle과 WebGPU 결과가 허용 오차 안에서 일치한다.
6. 원본 WebGL fragment의 observed RGBA8 결과와 WGSL 결과의 동일 양자화 결과가 허용 오차 안에서 일치한다.
7. alpha가 보존되고 NaN과 Inf가 output texture에 기록되지 않는다.
8. dispatch는 실행 가능하지만 Surface Registry, Preview, Export, R9A terminal authority에 진입하지 못한다.

---

# 1. 범위

## 1.1 포함

- WGSL compatibility kernel source generator
- 생성된 WGSL source와 manifest digest
- compatibility-only binding ABI v1
- uniform parameter packing ABI
- canonical surface input adapter
- legacy formula utility 함수의 WGSL 구현
- `rgba16float` storage candidate output
- WebGPU pipeline compile와 shadow execution runtime
- CPU-f32 full-surface oracle
- Electron hidden renderer 기반 WebGPU physical harness
- 원본 GLSL fragment 기반 WebGL reference harness
- test-only bounded readback
- f16 upload와 output quantization-aware parity
- WebGL RGBA8 observed parity
- finite, alpha, zero-alpha hidden-RGB gate
- deterministic repeated execution gate
- shadow-only authority receipt
- source, physical, negative-control gate

## 1.2 제외

- `R1C_GATED_CANONICAL` profile 실행
- Terminal R1C Tensor binding
- coherence와 edge 기반 structure gate
- Q-wave real DeltaK live product binding
- canonical highlight derivation
- R9A command graph recorder 결선
- single encoder and single submit product claim
- Canonical Final Texture 교체
- Surface Registry publish
- Preview Presenter 소비
- Export Authority 소비
- device-loss rebuild participant 등록
- WebGL runtime 퇴역
- corrected D65 color profile
- CIEDE2000 field 구현
- ICC CMYK 변환

## 1.3 후속 패치 경계

```text
WGSL-03
= terminal-resolution integrated R1C tensor + lambda2 physical admission

WGSL-04
= R9A command graph native record + one encoder/one submit

WGSL-05
= effect output terminalTexture authority adoption

WGSL-06
= product q-map, Q-wave DeltaK, highlight and mask field live binding

WGSL-07
= Preview and Export convergence
```

---

# 2. 부모 SSOT 상속

WGSL-02는 WGSL-01의 다음 identity를 변경하지 않는다.

```yaml
formulaId: tdt.effect.bakemono-rinne.formula.legacy-fusion-compat.v1
formulaProfileId: tdt.effect.bakemono-rinne.profile.legacy-fusion-compat-shadow.v1
colorContractId: tdt.effect.bakemono-rinne.color.legacy-encoded-matrix-compat.v1
surfaceAdapterId: tdt.effect.bakemono-rinne.surface-adapter.linear-premul-legacy-straight.v1
scalarProfileId: tdt.effect.bakemono-rinne.scalar.legacy-delta-e-compat.v1
maskProfileId: tdt.effect.bakemono-rinne.mask.legacy-textures.v1
phaseContractId: tdt.effect.bakemono-rinne.phase.deterministic.v1
phaseWrapMode: MOD_6_283_COMPAT
outputAuthority: SHADOW_ONLY
```

다음 상수도 그대로 상속한다.

```text
TAU_COMPAT             = 6.283
Lab threshold          = 0.008856
Lab linear coefficient = 7.787
White point            = [0.9505, 1.0, 1.089]
Lab displacement       = 6.0
CMYK C phase scale     = 0.8
CMYK M phase scale     = 0.9
CMYK displacement      = 0.1
Lab/CMYK mix           = 0.5
Mask weights           = [0.5, 0.5]
Neon exponent          = 0.5
Neon multiplier        = 1.5
Fusion smoothstep      = [0.3, 0.6]
```

다음 교정은 금지한다.

- `6.283`을 정밀한 tau로 교체
- RGB↔XYZ matrix transpose 교정
- legacy `rgb2lab()` 내부에 sRGB decode 추가
- CMYK 값 clamp 추가
- final formula 내부에 R1C gate 추가
- edge mask를 임의 luminance edge로 교체
- alpha-depth를 base alpha로 조용히 대체
- WebGL mediump 수식을 high-precision corrected profile로 재해석

이 중 하나라도 필요하면 새 formula 또는 profile identity를 발급한다.

---

# 3. Authority 모델

## 3.1 WGSL kernel identity

```text
kernelId:
  tdt.effect.bakemono-rinne.kernel.wgsl.compat-shadow.v1

kernelAbiId:
  tdt.effect.bakemono-rinne.abi.compat-shadow.v1

pipelineFamilyId:
  tdt.pipeline.bakemono-rinne.compat-shadow.wgsl02.v1

outputSemanticId:
  tdt.surface.bakemono-rinne.compat-shadow-candidate.linear-premul.v1
```

## 3.2 Authority 분리

```text
Formula Authority
= WGSL-01 formula contract modules

WGSL Source Authority
= deterministic generator + generator inputs + generated source digest

Pipeline Authority
= compiled pipeline bound to kernel ABI digest

Output Authority
= SHADOW_ONLY

Canonical Final Texture Authority
= NONE
```

## 3.3 금지된 권위 주장

WGSL-02 receipt에는 다음이 고정된다.

```json
{
  "wgslKernelAuthorityClaim": true,
  "compatibilityParityClaim": "QUALIFIED_OR_PENDING",
  "outputAuthority": "SHADOW_ONLY",
  "canonicalFinalTextureClaim": false,
  "surfaceRegistryPublishClaim": false,
  "previewAuthorityClaim": false,
  "exportAuthorityClaim": false,
  "r9aCommandGraphClaim": false
}
```

`wgslKernelAuthorityClaim`은 이 kernel byte와 ABI가 compatibility 구현으로 승인되었음을 의미한다.

제품 출력 권한을 의미하지 않는다.

---

# 4. 생성형 WGSL Source Authority

## 4.1 수동 복제 금지

WGSL에는 source include가 없다.

따라서 color utility를 여러 WGSL 파일에 수동 복사하지 않는다.

다음 생성 흐름을 사용한다.

```text
WGSL-01 formula constants
WGSL-01 color contract constants
WGSL-02 ABI constants
WGSL template fragments
        │
        ▼
deterministic generator
        │
        ├─ generated WGSL source
        ├─ generated source manifest
        └─ source digest receipt
```

## 4.2 생성 파일

```text
app/legacy-runtime/core/compute/qmap_webgpu/
  bakemono_rinne_wgsl_02_contract.mjs
  bakemono_rinne_wgsl_02_params.mjs
  bakemono_rinne_wgsl_02_pipeline.mjs
  bakemono_rinne_wgsl_02_shadow_runtime.mjs
  bakemono_rinne_wgsl_02_receipt.mjs
  shaders/
    bakemono_rinne_fusion_compat_v1.generated.wgsl
    generated-bakemono-rinne-wgsl-02-manifest.json

app/src/runtime/effects/bakemono-rinne/
  bakemono-rinne-wgsl-02-types.ts
```

## 4.3 생성 도구

```text
tools/bakemono-rinne-wgsl-02/
  generate-wgsl.mjs
  generate-fixtures.mjs
  verify-generated-source.mjs
  verify-wgsl-contract.mjs
  verify-cpu-f32-parity.mjs
  verify-shadow-authority.mjs
  verify-negative-controls.mjs
  run-electron-physical.mjs
  electron-qualification-main.mjs
  electron-qualification-preload.mjs
  qualification-page.html
  qualification-renderer.mjs
  finalize-source.mjs
  finalize-physical.mjs
  gate-source.mjs
  gate-physical.mjs
```

## 4.4 Generator input closure

Generator manifest는 최소 다음 digest를 포함한다.

```ts
interface BakemonoRinneWgsl02GeneratorManifest {
  schemaVersion: 1;
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-02';
  kernelId: 'tdt.effect.bakemono-rinne.kernel.wgsl.compat-shadow.v1';
  kernelAbiId: 'tdt.effect.bakemono-rinne.abi.compat-shadow.v1';
  formulaId: 'tdt.effect.bakemono-rinne.formula.legacy-fusion-compat.v1';
  formulaContractDigest: string;
  colorContractDigest: string;
  scalarProfileDigest: string;
  phaseContractDigest: string;
  generatorSourceDigest: string;
  templateDigest: string;
  generatedWgslDigest: string;
  generatedByteLength: number;
  generatedLineCount: number;
  generatorRuntime: 'node-22.16.0';
  manifestDigest: string;
}
```

## 4.5 Reproducibility

동일 parent source에서 generator를 두 번 실행한다.

```text
run A WGSL bytes == run B WGSL bytes
manifest A body  == manifest B body
WGSL digest A    == WGSL digest B
```

Timestamp, absolute path, locale, random nonce는 generated source에 포함하지 않는다.

---

# 5. Compatibility Kernel ABI v1

## 5.1 ABI 경계

WGSL-02 ABI는 **legacy compatibility formula 전용**이다.

Tensor binding을 포함하지 않는다.

이유:

```text
legacy formula has no tensor gate
+
R1C gate changes formula meaning
=
compatibility ABI and canonical R1C ABI must have different identities
```

WGSL-03은 기존 ABI v1을 변경하지 않고 별도 canonical ABI를 만든다.

```text
tdt.effect.bakemono-rinne.abi.compat-shadow.v1
!=
tdt.effect.bakemono-rinne.abi.r1c-canonical.future.v1
```

## 5.2 Bind group 0

| Binding | Resource | 계약 |
|---:|---|---|
| 0 | `texture_2d<f32>` base | `rgba16float`, linear, premultiplied |
| 1 | `texture_2d<f32>` q-map | R channel, normalized `[0,1]` |
| 2 | `texture_2d<f32>` secondary scalar | R channel, legacy DeltaE compatibility |
| 3 | `texture_2d<f32>` alpha-depth | R channel, legacy explicit mask |
| 4 | `texture_2d<f32>` highlight | R channel, legacy explicit mask |
| 5 | `texture_2d<f32>` edge | R channel, legacy explicit mask |
| 6 | `texture_storage_2d<rgba16float, write>` output | linear, premultiplied shadow candidate |
| 7 | uniform buffer | exact 128-byte ABI |

Sampler binding은 없다.

모든 texture는 `textureLoad()`로 output pixel 좌표에서 읽는다.

## 5.3 왜 sampler를 쓰지 않는가

Compatibility fixture는 모든 입력 texture를 output과 동일한 dimensions로 만든다.

그리고 WebGL reference도 texel center에서 동일 크기 texture를 샘플한다.

```text
same dimensions
+
texel-center coordinates
=
LINEAR and NEAREST sampling ambiguity 제거
```

WGSL kernel이 sampler filtering에 의존하면 Source Gate에서 실패한다.

## 5.4 Texture dimension contract

```text
base.width  == output.width
base.height == output.height
qmap        == output dimensions
scalar      == output dimensions
alphaDepth  == output dimensions
highlight   == output dimensions
edge        == output dimensions
```

Implicit resampling은 금지한다.

## 5.5 Texture format contract

### Base와 output

```text
base   = rgba16float
output = rgba16float
```

### Scalar inputs

다음 중 하나를 허용한다.

```text
r16float
rgba16float with R-channel authority
```

Texture descriptor receipt가 없으면 raw `GPUTexture`만으로 format을 추정하지 않는다.

## 5.6 Resource alias prohibition

금지:

```text
output === base
output aliases qmap/scalar/mask
qmap === secondary scalar
one texture bound to multiple semantic roles without explicit fixture-only descriptor
```

Fixture harness의 constant textures도 각 semantic role별 독립 handle을 만든다.

---

# 6. Uniform ABI

## 6.1 128-byte structure

```wgsl
struct BakemonoRinneCompatParams {
  // 0..15
  width: u32,
  height: u32,
  abiVersion: u32,
  flags: u32,

  // 16..31
  phaseBase: f32,
  phaseQGain: f32,
  phaseScalarGain: f32,
  power: f32,

  // 32..47
  neonBoost: f32,
  scalarGain: f32,
  coherenceExponentReserved: f32,
  alphaEpsilon: f32,

  // 48..63
  fusionLow: f32,
  fusionHigh: f32,
  maskHighlightWeight: f32,
  maskEdgeWeight: f32,

  // 64..79
  formulaProfileEnum: u32,
  scalarProfileEnum: u32,
  maskProfileEnum: u32,
  phaseWrapEnum: u32,

  // 80..95
  inputTransferEnum: u32,
  inputAlphaModeEnum: u32,
  outputAuthorityEnum: u32,
  outputFormatEnum: u32,

  // 96..111
  tauCompat: f32,
  labThreshold: f32,
  labLinearCoefficient: f32,
  neonMultiplier: f32,

  // 112..127
  reserved0: u32,
  reserved1: u32,
  reserved2: u32,
  checksumWord: u32,
};
```

## 6.2 ABI constants

```text
abiVersion               = 0x00020001
formulaProfileEnum       = 1  // LEGACY_FUSION_COMPAT_SHADOW
scalarProfileEnum        = 1  // LEGACY_DELTA_E_COMPAT
maskProfileEnum          = 1  // LEGACY_TEXTURE_MASKS
phaseWrapEnum            = 1  // MOD_6_283_COMPAT
inputTransferEnum        = 1  // LINEAR
inputAlphaModeEnum       = 1  // PREMULTIPLIED
outputAuthorityEnum      = 1  // SHADOW_ONLY
outputFormatEnum         = 1  // RGBA16FLOAT
```

## 6.3 Compatibility baseline enforcement

다음 값은 exact baseline이어야 한다.

```text
phaseQGain         = 6.283
phaseScalarGain    = 1.0
scalarGain         = 1.0
fusionLow          = 0.3
fusionHigh         = 0.6
maskHighlightWeight= 0.5
maskEdgeWeight     = 0.5
tauCompat          = 6.283
labThreshold       = 0.008856
labLinearCoefficient = 7.787
neonMultiplier     = 1.5
```

다음은 request별 값이다.

```text
phaseBase
power
neonBoost
alphaEpsilon
```

`coherenceExponentReserved`는 `1.0`으로 고정하지만 WGSL-02 formula에서는 읽지 않는다.

## 6.4 Parameter packing

Host는 `ArrayBuffer(128)`에 `DataView` 또는 동일 offset의 typed arrays로 기록한다.

- native endian 가정으로 암묵 기록하지 않는다.
- canonical packer 하나만 사용한다.
- `-0`은 `+0`으로 정규화한다.
- NaN과 Inf는 pack 전에 거절한다.
- reserved word는 0이어야 한다.
- checksumWord는 ABI body의 고정 checksum 규칙으로 생성한다.

## 6.5 Checksum word

`checksumWord`는 보안 hash가 아니다.

Uniform offset 오류와 stale packer를 잡기 위한 32-bit guard다.

```text
checksumWord
= FNV1a32(first 124 bytes with checksum field zero)
```

Shader는 첫 invocation에서 checksum을 재계산하지 않는다.

Host와 qualification verifier가 확인한다.

## 6.6 Unused legacy uniform exclusion

Formula Authority에는 `u_QThreshold` 선언이 있지만 실행 수식에서 참조되지 않는다.

따라서 compatibility ABI v1에는 이 uniform을 넣지 않는다.

```text
declared but unused legacy uniform
!= semantic input
```

향후 `u_QThreshold`를 사용하는 별도 formula가 필요하면 새 formula ID와 ABI ID를 발급한다.

---

# 7. WGSL Formula 구현 계약

## 7.1 Entry point

```wgsl
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>)
```

Bounds guard:

```wgsl
if (gid.x >= params.width || gid.y >= params.height) {
  return;
}
```

## 7.2 Pixel load

```text
pixel = vec2<i32>(gid.xy)
basePmLinear = textureLoad(baseTex, pixel, 0)
q            = textureLoad(qmapTex, pixel, 0).r
s            = textureLoad(scalarTex, pixel, 0).r
alphaDepth   = textureLoad(alphaDepthTex, pixel, 0).r
highlight    = textureLoad(highlightTex, pixel, 0).r
edge         = textureLoad(edgeTex, pixel, 0).r
```

Compatibility input descriptor가 `[0,1]` range를 보증한다.

Shader 내부에서 q, s, mask를 조용히 다른 semantic으로 재해석하지 않는다.

## 7.3 Canonical input adapter

```text
alpha = clamp(base.a, 0, 1)

linearStraight =
  base.rgb / alpha      if alpha > alphaEpsilon
  [0,0,0]               otherwise

encodedStraight = linearToSrgb(max(linearStraight, 0))
```

`linearToSrgb`는 component-wise exact WGSL-01 adapter다.

```text
v <= 0.0031308
  ? 12.92 * v
  : 1.055 * pow(v, 1/2.4) - 0.055
```

## 7.4 Legacy matrix execution

WGSL matrix constructor의 layout에 기대지 않는다.

Actual GLSL column-major 실행식을 scalar dot expression으로 명시한다.

```text
X = 0.4124 R + 0.2126 G + 0.0193 B
Y = 0.3576 R + 0.7152 G + 0.1192 B
Z = 0.1805 R + 0.0722 G + 0.9505 B
```

Inverse도 scalar expression으로 쓴다.

```text
R =  3.2406 X - 0.9689 Y + 0.0557 Z
G = -1.5372 X + 1.8758 Y - 0.2040 Z
B = -0.4986 X + 0.0415 Y + 1.0570 Z
```

`mat3x3` literal 사용은 금지하지 않지만 generator baseline에서는 사용하지 않는다.

## 7.5 Smoothstep

WGSL built-in `smoothstep()`에만 의존하지 않는다.

CPU oracle의 exact order와 맞추기 위해 다음 helper를 사용한다.

```text
t = clamp((q - 0.3) / 0.3, 0, 1)
fusionRatio = t*t*(3 - 2*t)
```

## 7.6 Rinne candidate

연산 순서:

```text
lab0  = rgb2labCompat(encodedStraight)
cmyk0 = rgb2cmykCompat(encodedStraight)

phase = phaseBase + q * 6.283 + s

lab1.a = lab0.a + sin(phase) * s * 6.0
lab1.b = lab0.b + cos(phase) * q * 6.0

cmyk1.c = cmyk0.c + sin(phase * 0.8) * 0.1
cmyk1.m = cmyk0.m + cos(phase * 0.9) * 0.1

rinne = mix(lab2rgbCompat(lab1), cmyk2rgbCompat(cmyk1), 0.5)
```

## 7.7 Bakemono candidate

```text
maskMix = 0.5 * highlight + 0.5 * edge

glow = clamp(q * alphaDepth * maskMix * neonBoost, 0, 1)

neon = [sqrt(C), sqrt(M), sqrt(Y)] * glow * 1.5

bakemono = mix(encodedStraight, neon, glow)
```

## 7.8 Final fusion

```text
fusionRatio = hermiteSmoothstepCompat(q, 0.3, 0.6)
fused       = mix(rinne, bakemono, fusionRatio)
k           = clamp(q * s * power, 0, 1)
outEncoded  = mix(encodedStraight, fused, k)
```

## 7.9 Output adapter

```text
safeEncoded = finite(outEncoded) ? outEncoded : [0,0,0]
clamped     = clamp(safeEncoded, 0, 1)
linear      = srgbToLinear(clamped)
outPm       = linear * alpha
```

```text
output = [outPm, alpha]
```

Alpha 0이면 RGB는 정확히 0을 기록한다.

## 7.10 Finite helper

WGSL은 component마다 다음을 검사한다.

```wgsl
fn finite1(v: f32) -> bool {
  return !(isNan(v) || isInf(v));
}
```

Backend compatibility 때문에 `isNan` 또는 `isInf` 사용이 불가능한 구현체가 있다면 다음 fallback을 generator profile로 별도 봉인한다.

```text
v == v
AND abs(v) <= finiteMax
```

같은 kernel identity에서 검사 방식을 조용히 바꾸지 않는다.

---

# 8. Phase 계약

## 8.1 입력 phase

WGSL uniform에는 `phaseReceipt.wrappedPhaseBase`를 기록한다.

WebGL reference의 `u_time`에도 동일 값을 기록한다.

```text
WGSL phaseBase == WebGL u_time == CPU oracle phaseBase
```

Historical `performance.now()` 값을 복원하는 것이 아니다.

## 8.2 금지 phase source

WGSL runtime과 qualification harness에서 금지:

```text
performance.now()
Date.now()
requestAnimationFrame timestamp
GPU timestamp query
Math.random()
crypto.getRandomValues()
implicit frame counter
```

Fixture ID와 phase receipt가 phase를 완전히 결정한다.

## 8.3 반복 결정성

동일 fixture와 동일 phase receipt를 10회 실행한다.

다음은 매 실행에서 같아야 한다.

```text
parameter digest
input upload digest
WGSL kernel digest
output tolerance summary
alpha bit pattern
finite counters
```

GPU transcendentals 때문에 output bit-exact를 전 장치에 요구하지 않는다.

동일 장치와 동일 driver session에서는 output f16 digest exact equality를 관찰 항목으로 기록한다.

불일치 시 PASS가 아니라 별도 `NONDETERMINISTIC_SAME_DEVICE` 실패다.

---

# 9. Shadow runtime

## 9.1 Public API

```ts
interface BakemonoRinneWgsl02ShadowRequest {
  purpose: 'QUALIFICATION_ONLY' | 'DIAGNOSTIC_SHADOW';
  device: GPUDevice;
  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  formulaContractReceipt: BakemonoRinneFormulaContractReceipt;
  phaseReceipt: BakemonoRinnePhaseReceipt;
  base: BakemonoRinneTextureDescriptor;
  qmap: BakemonoRinneTextureDescriptor;
  scalar: BakemonoRinneTextureDescriptor;
  alphaDepth: BakemonoRinneTextureDescriptor;
  highlight: BakemonoRinneTextureDescriptor;
  edge: BakemonoRinneTextureDescriptor;
  width: number;
  height: number;
  power: number;
  neonBoost: number;
  alphaEpsilon: number;
}
```

Result:

```ts
interface BakemonoRinneWgsl02ShadowResult {
  outputTexture: GPUTexture;
  outputAuthority: 'SHADOW_ONLY';
  kernelReceipt: BakemonoRinneWgsl02KernelReceipt;
  dispatchReceipt: BakemonoRinneWgsl02DispatchReceipt;
  destroy(): void;
}
```

## 9.2 Record API

Core recorder는 queue submit을 수행하지 않는다.

```ts
recordBakemonoRinneCompatPassWgsl02(
  encoder: GPUCommandEncoder,
  request: AdmittedBakemonoRinneWgsl02Request,
): BakemonoRinneWgsl02RecordedPass
```

Shadow executor만 qualification 용도로 encoder를 만들고 한 번 submit한다.

```text
create encoder
→ record compatibility pass
→ copy output to readback buffer when physical test requests it
→ finish
→ submit once
```

## 9.3 Product graph non-admission

금지 import 경계:

```text
ewa_single_submit_runtime_r9a.mjs
canonical resample executor
SurfaceRegistryAuthorityService
PreviewPresenterService
ExportAuthorityService
PipelineService.publishFinalCandidate
```

WGSL-02 runtime을 위 모듈에서 import하면 Source Gate가 실패한다.

## 9.4 Output lifecycle

- output texture는 caller-owned shadow resource다.
- `destroy()` 또는 qualification scope 종료 시 해제한다.
- Surface Registry에 등록하지 않는다.
- final candidate ID를 발급하지 않는다.
- Preview canvas에 표시하지 않는다.
- export encoder에 전달하지 않는다.

---

# 10. Pipeline compile

## 10.1 GPU Authority 사용

Pipeline은 직접 `navigator.gpu.requestAdapter()`를 호출하지 않는다.

Qualification harness가 전달한 admitted device를 사용한다.

제품 runtime integration 전에도 다음 wrapper를 사용한다.

```text
globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createShaderModule

globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__.createComputePipeline
```

Harness가 bridge를 제공하지 않으면 physical qualification은 PENDING이다.

## 10.2 Compilation info

`getCompilationInfo()`가 존재하면 모든 error message를 수집한다.

```text
error count > 0 → FAIL
warning count     → receipt에 기록
```

Warning을 자동 FAIL로 만들지는 않지만 다음 warning은 denylist다.

- unreachable output write
- binding mismatch
- non-uniform resource access
- storage texture access mismatch
- out-of-bounds static diagnostic

## 10.3 Pipeline cache identity

```text
pipelineIdentity =
  pipelineFamilyId
  + kernelId
  + kernelAbiId
  + generatedWgslDigest
  + uniformAbiDigest
  + bindGroupLayoutDigest
  + formulaContractDigest
  + colorContractDigest
```

Device epoch는 pipeline instance receipt에 기록한다.

WGSL-02는 R2-R3 Canonical Pipeline Registry participant로 아직 등록하지 않는다.

---

# 11. Fixture corpus

## 11.1 Formula unit fixtures

최소 64개의 1×1 fixture를 생성한다.

### Base colors

```text
transparent black
opaque black
white
red
green
blue
cyan
magenta
yellow
neutral gray 0.18
neutral gray 0.5
near-black
near-white
```

### Alpha

```text
0
1/255
0.25
0.5
0.75
1
```

### Q-map

```text
0
0.299
0.3
0.45
0.6
0.601
1
```

### Secondary scalar

```text
0
0.125
0.5
1
```

### Phase

```text
0
6.283 / 4
6.283 / 2
3 * 6.283 / 4
6.283 - epsilon
negative explicit origin normalized by parent receipt
```

### Masks

```text
all zero
highlight only
edge only
both one
alphaDepth zero
alphaDepth one
```

## 11.2 Surface fixtures

다음 dimensions를 포함한다.

```text
1×1
2×2
7×5
17×13
33×33
```

목적:

- workgroup boundary
- odd dimensions
- partial final workgroup
- per-pixel independent scalar combinations
- hidden RGB at alpha zero

## 11.3 Ramp fixtures

```text
RGB primary ramps
alpha ramp
q-map smoothstep threshold ramp
secondary scalar ramp
phase quadrant grid
highlight-edge combination grid
```

## 11.4 Stress fixtures

- CMYK K=1 black branch
- Lab reverse threshold 근처
- Rinne candidate out-of-gamut before adapter clamp
- CMYK C/M negative or greater-than-one internal candidate
- high neonBoost admitted maximum
- high power admitted maximum
- tiny alpha above and below alphaEpsilon

## 11.5 Fixture manifest

모든 fixture는 canonical JSON과 binary texture payload digest를 가진다.

```ts
interface BakemonoRinneWgsl02FixtureManifestRow {
  fixtureId: string;
  width: number;
  height: number;
  encodedStraightSourceDigest: string;
  canonicalBaseF16Digest: string;
  qmapF16Digest: string;
  scalarF16Digest: string;
  alphaDepthF16Digest: string;
  highlightF16Digest: string;
  edgeF16Digest: string;
  phaseReceiptDigest: string;
  parameterDigest: string;
  expectedCpuOracleDigest: string;
}
```

---

# 12. CPU-f32 oracle parity

## 12.1 Oracle authority

다음 부모 함수를 기준으로 한다.

```text
evaluateBakemonoRinneLegacyF32()
canonicalToLegacyWorking()
legacyWorkingToCanonical()
```

WGSL-02는 별도 수식을 새로 작성한 CPU oracle을 만들지 않는다.

Surface fixture oracle은 부모 함수를 조합한다.

```text
canonical f16 texture sample
→ decode f16 to f32
→ canonicalToLegacyWorking f32 emulation
→ evaluateBakemonoRinneLegacyF32
→ legacyWorkingToCanonical f32 emulation
→ quantize expected output to f16
```

## 12.2 f16-aware input truth

Upload 전 logical f32 값과 GPU가 실제 읽는 값은 다를 수 있다.

따라서 parity oracle은 반드시 실제 upload half-float bit pattern을 다시 decode한 값을 입력으로 사용한다.

```text
logical fixture value
→ IEEE 754 binary16 round-to-nearest-even
→ uploaded bits
→ f32 decode
→ oracle input
```

## 12.3 Output comparison

GPU output texture copy에서 얻은 binary16 bits를 비교한다.

Transcendental 함수 차이를 고려해 다음을 모두 기록한다.

```text
maxAbsoluteError
meanAbsoluteError
p99AbsoluteError
maxHalfUlpDistance
pixelsOver1Ulp
pixelsOver2Ulp
pixelsOver4Ulp
```

Baseline admission:

```text
nonfinite count             = 0
alpha half bits mismatch    = 0
max RGB absolute error      <= 0.001953125
p99 RGB absolute error      <= 0.0009765625
max RGB half ULP distance   <= 4
pixels over 4 ULP           = 0
```

장치별 transcendental 차이가 이 범위를 넘으면 tolerance를 조용히 넓히지 않는다.

Fixture와 mismatch localization을 보존한 뒤 HOLD한다.

## 12.4 Logical formula comparison

추가로 output canonical 값을 encoded-straight working domain으로 역변환하여 CPU formula output과 비교한다.

이 비교는 adapter와 formula drift를 구분하기 위한 진단값이다.

---

# 13. Headless WebGL reference parity

## 13.1 실행 환경

별도 native `headless-gl` dependency를 추가하지 않는다.

기존 Electron 29 hidden `BrowserWindow`에서 qualification page를 실행한다.

```text
Electron main
→ hidden BrowserWindow
→ local qualification page
→ WebGL reference + WebGPU shadow execution
→ IPC로 compact report 반환
```

Packaged product UI를 열지 않는다.

## 13.2 Original source requirement

WebGL reference shader는 Formula Authority bytes를 사용한다.

허용되는 변환은 하나다.

```text
#include "glsl_util.glsl"
→ exact utility authority bytes substitution
```

다음은 금지한다.

- GLSL 300 ES 수동 포트
- highp로 precision 교체
- matrix 교정
- WebGL2 syntax 재작성
- formula helper 재작성
- CPU oracle을 WebGL reference라고 부르기

Include expansion manifest는 다음을 기록한다.

```text
formula source digest
utility source digest
expanded fragment digest
vertex shader digest
WebGL context version
precision format report
```

## 13.3 Sampling normalization

Formula parity가 목적이므로 sampling 차이는 제거한다.

- 모든 input texture와 output은 같은 dimensions
- UV는 정확한 texel center
- wrap은 `CLAMP_TO_EDGE`
- filters는 fixture manifest에 기록
- `NEAREST`를 baseline으로 사용

동일 크기 texel center에서는 LINEAR reference spot-check도 같은 결과인지 확인한다.

## 13.4 WebGL output format

원본 fragment의 observed output을 검증하기 위해 baseline FBO는 RGBA8을 사용한다.

```text
gl_FragColor
→ framebuffer clamp/quantize
→ readPixels RGBA8
```

WGSL `rgba16float` output은 canonical linear-premultiplied surface이므로 먼저 legacy observed domain으로 변환한 뒤 RGBA8로 양자화한다.

```text
alpha = clamp(wgsl.a, 0, 1)
linearStraight = wgsl.rgb / alpha   if alpha > alphaEpsilon
                 [0,0,0]            otherwise
encodedStraight = linearToSrgb(max(linearStraight, 0))
q8(v) = round(clamp(v,0,1) * 255)
```

Alpha는 `round(alpha * 255)`로 비교한다.

실제 브라우저의 conversion과 다르면 브라우저 observed bytes가 authority다.

## 13.5 WebGL parity tolerance

```text
max channel error     <= 2 LSB
p99 channel error     <= 1 LSB
pixels over 2 LSB     = 0
alpha max error       <= 1 LSB
```

`precision mediump float`와 브라우저 구현 차이 때문에 0 LSB bit-exact를 전 장치에 요구하지 않는다.

## 13.6 WebGL unavailability

다음 중 하나면 physical WebGL parity는 PENDING이다.

- context 생성 실패
- fragment compile 실패가 환경 차단 때문임이 입증됨
- GPU process disabled
- software renderer policy로 qualification 금지

PENDING을 CPU parity PASS로 대체하지 않는다.

---

# 14. Test-only readback

## 14.1 허용 범위

WGSL-02 physical harness에서만 다음 readback을 허용한다.

```text
WGSL output rgba16float → COPY_SRC buffer → MAP_READ
WebGL RGBA8 FBO → readPixels
```

## 14.2 금지 범위

제품 runtime module에는 다음 문자열과 호출이 없어야 한다.

```text
MAP_READ
mapAsync
getMappedRange
readPixels
canvas.toDataURL
createImageBitmap
```

Shadow runtime core는 output texture를 반환할 뿐 readback하지 않는다.

Qualification adapter가 readback을 소유한다.

## 14.3 Bounded readback

Physical corpus는 fixture별 전체 image readback을 허용하지만 다음 제한을 둔다.

```text
maximum fixture dimension = 33×33
maximum total WGSL readback bytes per run <= 8 MiB
maximum total WebGL readback bytes per run <= 4 MiB
```

제품 이미지 readback은 금지한다.

---

# 15. Alpha와 finite invariant

## 15.1 Alpha preservation

WGSL output alpha는 base texture alpha에서만 온다.

```text
output.a = clamp(base.a, 0, 1)
```

q-map, scalar, mask, phase는 alpha를 변경할 수 없다.

## 15.2 Zero-alpha policy

```text
base.a <= alphaEpsilon
→ working RGB = 0
→ output RGB = 0
→ output alpha = base alpha
```

Hidden RGB가 output에 재출현하면 실패한다.

## 15.3 Finite output

모든 fixture에서:

```text
NaN output count = 0
Inf output count = 0
```

Host input parameter에 NaN 또는 Inf가 있으면 dispatch 전에 실패한다.

## 15.4 Finite fallback

Formula candidate가 nonfinite이면 pixel RGB를 0으로 기록하는 것은 최종 안전망이다.

하지만 physical qualification에서 fallback counter가 1 이상이면 PASS하지 않는다.

```text
fallback prevented invalid storage write
!=
formula is healthy
```

Counter 구현은 WGSL-02 kernel에 atomic buffer를 추가하지 않는다.

Qualification shader variant 또는 CPU post-readback으로 nonfinite provenance를 확인한다.

Generated product kernel ABI에는 diagnostic storage buffer를 넣지 않는다.

---

# 16. Receipt schemas

## 16.1 Kernel receipt

```ts
interface BakemonoRinneWgsl02KernelReceipt {
  schemaVersion: 1;
  schemaId: 'tdt.effect.bakemono-rinne.wgsl-kernel-receipt.v2';
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-02';
  kernelId: 'tdt.effect.bakemono-rinne.kernel.wgsl.compat-shadow.v1';
  kernelAbiId: 'tdt.effect.bakemono-rinne.abi.compat-shadow.v1';
  pipelineFamilyId: 'tdt.pipeline.bakemono-rinne.compat-shadow.wgsl02.v1';
  generatorManifestDigest: string;
  generatedWgslDigest: string;
  uniformAbiDigest: string;
  bindGroupLayoutDigest: string;
  formulaContractReceiptDigest: string;
  compilationInfoDigest: string;
  compilationErrorCount: 0;
  compilationWarningCount: number;
  runtimeEpoch: number;
  deviceEpoch: number;
  deviceIdentity: string;
  wgslKernelAuthorityClaim: true;
  outputAuthority: 'SHADOW_ONLY';
  canonicalFinalTextureClaim: false;
  receiptDigest: string;
}
```

## 16.2 Dispatch receipt

```ts
interface BakemonoRinneWgsl02DispatchReceipt {
  schemaVersion: 1;
  schemaId: 'tdt.effect.bakemono-rinne.shadow-dispatch-receipt.v2';
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-02';
  purpose: 'QUALIFICATION_ONLY' | 'DIAGNOSTIC_SHADOW';
  operationId: string;
  fixtureId: string | null;
  kernelReceiptDigest: string;
  parameterDigest: string;
  phaseReceiptDigest: string;
  inputSetDigest: string;
  width: number;
  height: number;
  workgroupsX: number;
  workgroupsY: number;
  dispatchCount: 1;
  queueSubmitCount: 0 | 1;
  outputFormat: 'rgba16float';
  outputSemanticId: 'tdt.surface.bakemono-rinne.compat-shadow-candidate.linear-premul.v1';
  outputAuthority: 'SHADOW_ONLY';
  surfaceRegistryPublishCount: 0;
  previewPublishCount: 0;
  exportPublishCount: 0;
  canonicalFinalTextureClaim: false;
  receiptDigest: string;
}
```

Recorder receipt의 `queueSubmitCount`는 0이다.

Shadow executor wrapper receipt는 1이다.

## 16.3 CPU parity receipt

```ts
interface BakemonoRinneWgsl02CpuParityReceipt {
  schemaVersion: 1;
  fixtureManifestDigest: string;
  kernelReceiptDigest: string;
  fixtureCount: number;
  pixelCount: number;
  nonfiniteCount: number;
  alphaMismatchCount: number;
  maxAbsoluteError: number;
  p99AbsoluteError: number;
  maxHalfUlpDistance: number;
  pixelsOver4Ulp: number;
  pass: boolean;
  firstMismatch: null | Record<string, unknown>;
  receiptDigest: string;
}
```

## 16.4 WebGL parity receipt

```ts
interface BakemonoRinneWgsl02WebglParityReceipt {
  schemaVersion: 1;
  fixtureManifestDigest: string;
  formulaSourceDigest: string;
  utilitySourceDigest: string;
  expandedFragmentDigest: string;
  vertexShaderDigest: string;
  webglVersion: string;
  rendererIdentity: string;
  precisionReportDigest: string;
  fixtureCount: number;
  pixelCount: number;
  maxChannelErrorLsb: number;
  p99ChannelErrorLsb: number;
  pixelsOver2Lsb: number;
  alphaMaxErrorLsb: number;
  pass: boolean;
  firstMismatch: null | Record<string, unknown>;
  receiptDigest: string;
}
```

## 16.5 Qualification receipt

```ts
interface BakemonoRinneWgsl02QualificationReceipt {
  schemaVersion: 1;
  patchId: 'TDT-BAKEMONO-RINNE-WGSL-02';
  parentSourceReceiptDigest: string;
  kernelReceiptDigest: string;
  cpuParityReceiptDigest: string;
  webglParityReceiptDigest: string | null;
  webglParityStatus: 'PASS' | 'PENDING' | 'FAIL';
  deterministicReplayReceiptDigest: string;
  shadowAuthorityReceiptDigest: string;
  sourceGatePassCount: number;
  physicalGatePassCount: number;
  physicalGatePendingCount: number;
  physicalGateFailCount: number;
  finalStatus:
    | 'SOURCE_BAKED_AWAITING_PHYSICAL_GPU'
    | 'PHYSICAL_COMPATIBILITY_PARITY_PASS_SHADOW_ONLY'
    | 'FAIL';
  canonicalFinalTextureClaim: false;
  receiptDigest: string;
}
```

---

# 17. Stable error codes

| Code | 의미 |
|---|---|
| `E_BKR02_PARENT_RECEIPT_MISSING` | WGSL-01 parent receipt 없음 |
| `E_BKR02_PARENT_DIGEST_MISMATCH` | 부모 formula/color/scalar/phase digest 불일치 |
| `E_BKR02_GENERATOR_INPUT_DRIFT` | generator input closure 변경 |
| `E_BKR02_GENERATED_SOURCE_STALE` | generated WGSL bytes와 manifest 불일치 |
| `E_BKR02_GENERATED_SOURCE_NONDETERMINISTIC` | 이중 생성 byte 불일치 |
| `E_BKR02_WGSL_COMPILE_FAILED` | WGSL compilation error |
| `E_BKR02_KERNEL_ABI_MISMATCH` | kernel ABI ID 또는 binding layout 불일치 |
| `E_BKR02_UNIFORM_SIZE_MISMATCH` | uniform이 128 bytes가 아님 |
| `E_BKR02_UNIFORM_CHECKSUM_MISMATCH` | packed uniform checksum 불일치 |
| `E_BKR02_PROFILE_NOT_COMPAT_SHADOW` | WGSL-02에서 canonical profile 요청 |
| `E_BKR02_TENSOR_BINDING_FORBIDDEN` | compatibility ABI에 Tensor binding 추가 |
| `E_BKR02_INPUT_TEXTURE_MISSING` | 필수 texture 없음 |
| `E_BKR02_INPUT_DIMENSION_MISMATCH` | input dimensions 불일치 |
| `E_BKR02_INPUT_FORMAT_MISMATCH` | texture format descriptor 불일치 |
| `E_BKR02_INPUT_SEMANTIC_MISMATCH` | q/scalar/mask semantic 불일치 |
| `E_BKR02_RESOURCE_ALIAS_DENIED` | input 또는 output resource alias |
| `E_BKR02_PARAMETER_NONFINITE` | uniform parameter NaN/Inf |
| `E_BKR02_COMPAT_CONSTANT_MUTATED` | exact baseline constant 변경 |
| `E_BKR02_PHASE_RECEIPT_MISSING` | deterministic phase receipt 없음 |
| `E_BKR02_PHASE_SOURCE_NONDETERMINISTIC` | clock/random phase source |
| `E_BKR02_OUTPUT_FORMAT_MISMATCH` | output이 rgba16float가 아님 |
| `E_BKR02_OUTPUT_NONFINITE` | output NaN/Inf 검출 |
| `E_BKR02_ALPHA_DRIFT` | output alpha 불일치 |
| `E_BKR02_HIDDEN_RGB_LEAK` | alpha-zero RGB가 0이 아님 |
| `E_BKR02_CPU_PARITY_FAILED` | CPU-f32/f16-aware parity 실패 |
| `E_BKR02_WEBGL_CONTEXT_UNAVAILABLE` | WebGL context 사용 불가 |
| `E_BKR02_WEBGL_SHADER_COMPILE_FAILED` | 원본 fragment compile 실패 |
| `E_BKR02_WEBGL_SHADER_LINK_FAILED` | reference program link 실패 |
| `E_BKR02_WEBGL_SOURCE_NOT_AUTHORITY` | WebGL reference가 authority bytes 아님 |
| `E_BKR02_WEBGL_PARITY_FAILED` | observed RGBA8 parity 실패 |
| `E_BKR02_SAME_DEVICE_NONDETERMINISM` | 동일 장치 반복 output digest 불일치 |
| `E_BKR02_PRODUCT_GRAPH_ADMISSION_DENIED` | R9A/Preview/Export에서 WGSL-02 import |
| `E_BKR02_CANONICAL_OUTPUT_AUTHORITY_DENIED` | shadow output을 final candidate로 요청 |
| `E_BKR02_PRODUCT_READBACK_DETECTED` | 제품 runtime에 readback API 존재 |
| `E_BKR02_QUALIFICATION_READBACK_BUDGET` | test readback budget 초과 |

---

# 18. Source Gate Matrix

Source Gate 총계:

```text
Parent and Identity          20
Generated WGSL               28
Exact Formula ABI            28
Color and Alpha Contract     24
Shadow Runtime               24
CPU Oracle Contract          24
WebGL Harness Contract       20
Authority and Receipt        24
--------------------------------
Total                       192
```

## 18.1 Parent and Identity gates, 20

| Gate | 조건 |
|---|---|
| `BKR02-PAR-001` | parent ZIP digest exact |
| `BKR02-PAR-002` | WGSL-01 spec digest exact |
| `BKR02-PAR-003` | formula authority path exact |
| `BKR02-PAR-004` | formula authority digest exact |
| `BKR02-PAR-005` | utility authority path exact |
| `BKR02-PAR-006` | utility authority digest exact |
| `BKR02-PAR-007` | formula ID exact |
| `BKR02-PAR-008` | compatibility profile ID exact |
| `BKR02-PAR-009` | color contract ID exact |
| `BKR02-PAR-010` | surface adapter ID exact |
| `BKR02-PAR-011` | scalar profile exact |
| `BKR02-PAR-012` | mask profile exact |
| `BKR02-PAR-013` | phase contract exact |
| `BKR02-PAR-014` | output authority SHADOW_ONLY |
| `BKR02-PAR-015` | canonical profile denied |
| `BKR02-PAR-016` | no legacy tensor authority imported |
| `BKR02-PAR-017` | parent receipt verified |
| `BKR02-PAR-018` | parent receipt byte preserved |
| `BKR02-PAR-019` | parent mutation negative control |
| `BKR02-PAR-020` | second formula authority negative control |

## 18.2 Generated WGSL gates, 28

| Gate | 조건 |
|---|---|
| `BKR02-GEN-001` | generator exists |
| `BKR02-GEN-002` | generated WGSL exists |
| `BKR02-GEN-003` | generated manifest exists |
| `BKR02-GEN-004` | kernel ID exact |
| `BKR02-GEN-005` | kernel ABI ID exact |
| `BKR02-GEN-006` | pipeline family ID exact |
| `BKR02-GEN-007` | workgroup size 8×8×1 |
| `BKR02-GEN-008` | bounds guard exists |
| `BKR02-GEN-009` | exactly one compute entrypoint |
| `BKR02-GEN-010` | output storage rgba16float |
| `BKR02-GEN-011` | no sampler binding |
| `BKR02-GEN-012` | textureLoad only |
| `BKR02-GEN-013` | no storage read access |
| `BKR02-GEN-014` | no atomics in product kernel |
| `BKR02-GEN-015` | no timestamp or random source |
| `BKR02-GEN-016` | no JavaScript-injected shader patch at runtime |
| `BKR02-GEN-017` | generator inputs recorded |
| `BKR02-GEN-018` | generated digest recorded |
| `BKR02-GEN-019` | line count recorded |
| `BKR02-GEN-020` | byte length recorded |
| `BKR02-GEN-021` | double generation byte exact |
| `BKR02-GEN-022` | manifest digest reproducible |
| `BKR02-GEN-023` | generated source manual edit detected |
| `BKR02-GEN-024` | tau correction mutant rejected |
| `BKR02-GEN-025` | matrix transpose mutant rejected |
| `BKR02-GEN-026` | hidden sRGB decode mutant rejected |
| `BKR02-GEN-027` | smoothstep builtin-order mutant rejected |
| `BKR02-GEN-028` | hidden R1C gate mutant rejected |

## 18.3 Exact Formula ABI gates, 28

| Gate | 조건 |
|---|---|
| `BKR02-ABI-001` | BGL has bindings 0..7 exact |
| `BKR02-ABI-002` | base binding exact |
| `BKR02-ABI-003` | qmap binding exact |
| `BKR02-ABI-004` | scalar binding exact |
| `BKR02-ABI-005` | alphaDepth binding exact |
| `BKR02-ABI-006` | highlight binding exact |
| `BKR02-ABI-007` | edge binding exact |
| `BKR02-ABI-008` | output binding exact |
| `BKR02-ABI-009` | uniform binding exact |
| `BKR02-ABI-010` | uniform size 128 |
| `BKR02-ABI-011` | every offset exact |
| `BKR02-ABI-012` | ABI version exact |
| `BKR02-ABI-013` | profile enum exact |
| `BKR02-ABI-014` | scalar enum exact |
| `BKR02-ABI-015` | mask enum exact |
| `BKR02-ABI-016` | phase wrap enum exact |
| `BKR02-ABI-017` | output authority enum shadow |
| `BKR02-ABI-018` | format enum rgba16float |
| `BKR02-ABI-019` | checksum valid |
| `BKR02-ABI-020` | reserved words zero |
| `BKR02-ABI-021` | q and scalar no alias |
| `BKR02-ABI-022` | output no input alias |
| `BKR02-ABI-023` | dimensions exact |
| `BKR02-ABI-024` | format descriptors required |
| `BKR02-ABI-025` | Tensor binding absent |
| `BKR02-ABI-026` | canonical profile request denied |
| `BKR02-ABI-027` | parameter mutation negative control |
| `BKR02-ABI-028` | offset mutation negative control |

## 18.4 Color and Alpha Contract gates, 24

| Gate | 조건 |
|---|---|
| `BKR02-COL-001` | input rgba16float |
| `BKR02-COL-002` | input linear contract |
| `BKR02-COL-003` | input premultiplied contract |
| `BKR02-COL-004` | safe unpremultiply |
| `BKR02-COL-005` | alphaEpsilon honored |
| `BKR02-COL-006` | linearToSrgb threshold exact |
| `BKR02-COL-007` | linearToSrgb exponent exact |
| `BKR02-COL-008` | no internal rgb2lab decode |
| `BKR02-COL-009` | RGB→XYZ scalar expressions exact |
| `BKR02-COL-010` | XYZ→RGB scalar expressions exact |
| `BKR02-COL-011` | Lab branch exact |
| `BKR02-COL-012` | CMYK black branch exact |
| `BKR02-COL-013` | CMYK output remains internally unclamped |
| `BKR02-COL-014` | final finite guard |
| `BKR02-COL-015` | encoded output clamp adapter |
| `BKR02-COL-016` | srgbToLinear threshold exact |
| `BKR02-COL-017` | output premultiply |
| `BKR02-COL-018` | alpha preserved |
| `BKR02-COL-019` | zero alpha RGB zero |
| `BKR02-COL-020` | output format rgba16float |
| `BKR02-COL-021` | row-major correction mutant rejected |
| `BKR02-COL-022` | straight-alpha output mutant rejected |
| `BKR02-COL-023` | hidden RGB leak mutant rejected |
| `BKR02-COL-024` | nonfinite passthrough mutant rejected |

## 18.5 Shadow Runtime gates, 24

| Gate | 조건 |
|---|---|
| `BKR02-RUN-001` | shadow request purpose required |
| `BKR02-RUN-002` | admitted device required |
| `BKR02-RUN-003` | runtime epoch recorded |
| `BKR02-RUN-004` | device epoch recorded |
| `BKR02-RUN-005` | device identity recorded |
| `BKR02-RUN-006` | formula receipt verified |
| `BKR02-RUN-007` | phase receipt verified |
| `BKR02-RUN-008` | input descriptor verified |
| `BKR02-RUN-009` | recorder performs no submit |
| `BKR02-RUN-010` | shadow wrapper submits exactly once |
| `BKR02-RUN-011` | dispatch count exactly one |
| `BKR02-RUN-012` | workgroup count exact |
| `BKR02-RUN-013` | output texture caller-owned |
| `BKR02-RUN-014` | destroy idempotent |
| `BKR02-RUN-015` | no Surface Registry publish |
| `BKR02-RUN-016` | no Preview publish |
| `BKR02-RUN-017` | no Export publish |
| `BKR02-RUN-018` | no terminalTexture replacement |
| `BKR02-RUN-019` | no R9A import |
| `BKR02-RUN-020` | no direct adapter request |
| `BKR02-RUN-021` | product module has no readback |
| `BKR02-RUN-022` | missing texture fails closed |
| `BKR02-RUN-023` | alias fails closed |
| `BKR02-RUN-024` | canonical authority request fails closed |

## 18.6 CPU Oracle Contract gates, 24

| Gate | 조건 |
|---|---|
| `BKR02-CPU-001` | parent f32 oracle imported |
| `BKR02-CPU-002` | no duplicate formula oracle |
| `BKR02-CPU-003` | f16 encoder deterministic |
| `BKR02-CPU-004` | f16 decoder deterministic |
| `BKR02-CPU-005` | round-to-nearest-even fixture |
| `BKR02-CPU-006` | uploaded bits drive oracle |
| `BKR02-CPU-007` | output f16 quantization modeled |
| `BKR02-CPU-008` | fixture count minimum |
| `BKR02-CPU-009` | 1×1 fixtures present |
| `BKR02-CPU-010` | odd dimension fixtures present |
| `BKR02-CPU-011` | alpha ramp present |
| `BKR02-CPU-012` | q threshold fixtures present |
| `BKR02-CPU-013` | phase quadrants present |
| `BKR02-CPU-014` | mask combinations present |
| `BKR02-CPU-015` | CMYK black branch present |
| `BKR02-CPU-016` | Lab threshold fixture present |
| `BKR02-CPU-017` | out-of-gamut candidate present |
| `BKR02-CPU-018` | tolerance metrics complete |
| `BKR02-CPU-019` | alpha mismatch count field |
| `BKR02-CPU-020` | nonfinite count field |
| `BKR02-CPU-021` | first mismatch localization |
| `BKR02-CPU-022` | tolerance widening mutation rejected |
| `BKR02-CPU-023` | logical f32 instead of f16 truth rejected |
| `BKR02-CPU-024` | fixture digest mutation rejected |

## 18.7 WebGL Harness Contract gates, 20

| Gate | 조건 |
|---|---|
| `BKR02-GL-001` | hidden Electron harness exists |
| `BKR02-GL-002` | authority fragment bytes loaded |
| `BKR02-GL-003` | authority utility bytes loaded |
| `BKR02-GL-004` | only include substitution allowed |
| `BKR02-GL-005` | expanded fragment digest recorded |
| `BKR02-GL-006` | vertex shader digest recorded |
| `BKR02-GL-007` | original mediump preserved |
| `BKR02-GL-008` | no WebGL2 formula port |
| `BKR02-GL-009` | texture dimensions exact |
| `BKR02-GL-010` | texel-center coordinates |
| `BKR02-GL-011` | clamp-to-edge explicit |
| `BKR02-GL-012` | sampling filter recorded |
| `BKR02-GL-013` | RGBA8 observed output |
| `BKR02-GL-014` | readPixels test-only module |
| `BKR02-GL-015` | quantizer contract exact |
| `BKR02-GL-016` | LSB metrics complete |
| `BKR02-GL-017` | precision report recorded |
| `BKR02-GL-018` | reference source mutation rejected |
| `BKR02-GL-019` | CPU oracle impersonation rejected |
| `BKR02-GL-020` | unavailable context remains PENDING |

## 18.8 Authority and Receipt gates, 24

| Gate | 조건 |
|---|---|
| `BKR02-AUT-001` | kernel receipt schema exact |
| `BKR02-AUT-002` | dispatch receipt schema exact |
| `BKR02-AUT-003` | CPU parity receipt schema exact |
| `BKR02-AUT-004` | WebGL parity receipt schema exact |
| `BKR02-AUT-005` | qualification receipt schema exact |
| `BKR02-AUT-006` | generated WGSL digest lineage |
| `BKR02-AUT-007` | ABI digest lineage |
| `BKR02-AUT-008` | formula receipt lineage |
| `BKR02-AUT-009` | phase receipt lineage |
| `BKR02-AUT-010` | input set digest lineage |
| `BKR02-AUT-011` | fixture manifest digest lineage |
| `BKR02-AUT-012` | output semantic exact |
| `BKR02-AUT-013` | output authority shadow exact |
| `BKR02-AUT-014` | canonical final claim false |
| `BKR02-AUT-015` | Surface Registry publish false |
| `BKR02-AUT-016` | Preview authority false |
| `BKR02-AUT-017` | Export authority false |
| `BKR02-AUT-018` | R9A graph claim false |
| `BKR02-AUT-019` | receipt self-hash verified |
| `BKR02-AUT-020` | child receipt mutation detected |
| `BKR02-AUT-021` | missing WebGL physical is PENDING |
| `BKR02-AUT-022` | source-only cannot claim physical pass |
| `BKR02-AUT-023` | physical pass still shadow-only |
| `BKR02-AUT-024` | stable error code set exact |

---

# 19. Physical Qualification Matrix

Physical Gate 총계:

```text
WebGPU Compile and Dispatch    8
CPU-f32/f16 Parity           12
WebGL Observed Parity        12
Finite and Alpha              8
Deterministic Replay          4
Shadow Authority              4
--------------------------------
Total                        48
```

## 19.1 WebGPU compile and dispatch, 8

1. adapter and device admitted
2. generated WGSL compiles
3. compilation errors zero
4. bind group creation succeeds
5. output rgba16float allocation succeeds
6. 1×1 dispatch succeeds
7. 17×13 partial workgroup dispatch succeeds
8. exactly one qualification submit

## 19.2 CPU parity, 12

1. all fixture uploads use recorded f16 bits
2. all outputs finite
3. alpha half bits exact
4. maximum absolute error admitted
5. p99 error admitted
6. maximum half ULP admitted
7. no pixel over 4 ULP
8. q threshold fixtures pass
9. phase quadrant fixtures pass
10. CMYK black branch passes
11. alpha-epsilon fixtures pass
12. first mismatch null

## 19.3 WebGL parity, 12

1. hidden WebGL context created
2. exact authority shader compiled
3. exact expanded digest recorded
4. link succeeds
5. fixture textures complete
6. RGBA8 readback succeeds
7. max RGB LSB <= 2
8. p99 RGB LSB <= 1
9. pixels over 2 LSB = 0
10. alpha LSB <= 1
11. precision report recorded
12. first mismatch null

## 19.4 Finite and alpha, 8

1. WGSL NaN count 0
2. WGSL Inf count 0
3. WebGL nonfinite provenance absent
4. alpha mutation count 0
5. transparent hidden RGB count 0
6. output channel range after adapter valid
7. input NaN rejected before dispatch
8. input Inf rejected before dispatch

## 19.5 Deterministic replay, 4

1. same-device 10-run output digest exact
2. parameter digest exact
3. input upload digest exact
4. phase receipt digest exact

## 19.6 Shadow authority, 4

1. Surface Registry publish count 0
2. Preview publish count 0
3. Export publish count 0
4. Canonical Final Texture claim false

---

# 20. Negative controls

다음 mutant는 최소 한 개 gate를 반드시 실패시켜야 한다.

```text
M01  TAU_COMPAT 6.283185307
M02  RGB→XYZ row-major correction
M03  XYZ→RGB row-major correction
M04  internal sRGB decode insertion
M05  Lab threshold mutation
M06  CMYK clamp insertion
M07  phase C multiplier 0.8 mutation
M08  phase M multiplier 0.9 mutation
M09  mask weights mutation
M10  neon exponent mutation
M11  neon multiplier mutation
M12  smoothstep builtin substitution
M13  fusion thresholds mutation
M14  final q*s*power order mutation
M15  hidden R1C structure gate
M16  output alpha from mask
M17  straight-alpha output storage
M18  rgba8unorm output storage
M19  sampler binding addition
M20  filtered sampling dependency
M21  bounds guard removal
M22  qmap/scalar alias
M23  output/base alias
M24  canonical profile admission
M25  Tensor binding addition to ABI v1
M26  performance.now phase
M27  runtime-generated shader string mutation
M28  product module MAP_READ
M29  product module readPixels
M30  Surface Registry publish
M31  Preview publish
M32  Export publish
M33  canonicalFinalTextureClaim true
M34  WebGL reference source ported instead of exact bytes
M35  WebGL highp precision substitution
M36  tolerance doubled silently
M37  logical f32 input used instead of uploaded f16 truth
M38  parent receipt digest spoof
M39  generated WGSL manual edit
M40  same-device output nondeterminism injection
```

---

# 21. 실행 순서

## 21.1 Source bake

```text
1. verify WGSL-01 parent receipt
2. load formula/color/scalar/phase contracts
3. generate WGSL source twice
4. compare generated bytes
5. write generated source and manifest
6. verify exact ABI
7. generate fixture corpus
8. run CPU-only fixture oracle generation
9. run source negative controls
10. write source gate report
11. write SOURCE_BAKED receipt
```

Source bake는 GPU physical parity를 PASS로 주장하지 않는다.

## 21.2 Physical qualification

```text
1. launch hidden Electron qualification renderer
2. acquire admitted WebGPU device
3. compile generated WGSL
4. upload f16 fixture textures
5. execute WGSL shadow kernel
6. bounded rgba16float readback
7. run f16-aware CPU parity
8. compile exact WebGL authority fragment
9. execute WebGL reference fixtures
10. RGBA8 observed parity
11. deterministic replay 10 cycles
12. verify shadow publish counts zero
13. write physical receipts
14. finalize SHADOW_ONLY qualification
```

---

# 22. 완료 게이트

WGSL-02 Source PASS:

```text
192/192 source gates PASS
AND generated WGSL bytes reproducible
AND exact compatibility ABI frozen
AND CPU oracle fixture corpus generated
AND no Tensor binding in compatibility ABI
AND no R9A/Surface/Preview/Export adoption
AND canonicalFinalTextureClaim = false
```

WGSL-02 Physical PASS:

```text
48/48 physical gates PASS
AND WGSL compile error count = 0
AND CPU parity within admitted tolerance
AND WebGL observed parity within admitted tolerance
AND alpha mismatch count = 0
AND nonfinite output count = 0
AND same-device deterministic replay PASS
AND output authority remains SHADOW_ONLY
```

가능한 최종 상태:

```text
SOURCE_BAKED_AWAITING_PHYSICAL_GPU

PHYSICAL_COMPATIBILITY_PARITY_PASS_SHADOW_ONLY

FAIL
```

다음 상태는 금지한다.

```text
CANONICAL_FINAL_TEXTURE_PASS
PRODUCT_PROMOTED
R9A_SINGLE_SUBMIT_PASS
PREVIEW_EXPORT_AUTHORITY_PASS
```

---

# 23. Required artifacts

## 23.1 Source artifacts

```text
artifacts/bakemono-rinne-wgsl-02/source/
  generated-wgsl-manifest.json
  fixture-manifest.json
  source-gate-report.json
  source-negative-control-report.json
  cpu-oracle-fixture-report.json
  implementation-manifest.json
  source-final-receipt.json
```

## 23.2 Physical artifacts

```text
artifacts/bakemono-rinne-wgsl-02/physical/
  gpu-adapter-receipt.json
  wgsl-compilation-report.json
  kernel-receipt.json
  dispatch-ledger.jsonl
  cpu-parity-report.json
  webgl-include-expansion-manifest.json
  webgl-precision-report.json
  webgl-parity-report.json
  finite-alpha-report.json
  deterministic-replay-report.json
  shadow-authority-report.json
  physical-gate-report.json
  qualification-final-receipt.json
```

## 23.3 Mismatch artifacts

Mismatch가 존재하면 compact report 외에 다음을 남긴다.

```text
first-mismatch.json
fixture-inputs.bin
cpu-expected-f16.bin
wgsl-actual-f16.bin
webgl-actual-rgba8.bin
localized-diff.json
```

전체 제품 이미지 dump는 금지한다.

---

# 24. Non-goals 확인

WGSL-02가 성공해도 다음 문장은 아직 거짓이다.

```text
Bakemono/Rinne is live in the canonical resample path.
Bakemono/Rinne consumes terminal R1C.
Bakemono/Rinne output is the final texture.
Preview and Export use the WGSL effect.
The product path remains one encoder and one submit with this effect.
```

WGSL-02가 증명하는 문장은 이것뿐이다.

```text
The admitted legacy compatibility formula has one executable WGSL compute implementation.
Its canonical surface adapter, formula result, alpha behavior, and deterministic phase match the CPU-f32 oracle and the observed original WebGL fragment within declared tolerances.
The output remains shadow-only.
```

---

# 25. 다음 명세

```text
TDT-BAKEMONO-RINNE-WGSL-03

Post-EWA Terminal Tensor Recording /
Outer-Product Spatial Integration /
Blur-H·Blur-V Preservation /
Eigen Lambda2 Nonzero Physical Fixture /
Terminal Tangent·Coherence·Edge Packing /
Corner and Junction Gate Suppression /
Raw Tensor and Compatibility Tensor Rejection Seal
```

WGSL-03은 compatibility ABI v1을 수정하지 않는다.

별도 canonical R1C ABI를 만들고 다음을 증명한다.

```text
terminal EWA output
→ gradient
→ outer product
→ blur H
→ blur V
→ eigen
→ tangent/coherence/edge field
→ nonzero lambda2 at corners and junctions
```

---

# 26. 최종 봉인문

```text
WGSL-02 creates the first executable WebGPU form of the admitted Bakemono/Rinne legacy fusion formula.
The compatibility kernel preserves the executed GLSL constants, matrix direction, transfer mistakes, CMYK behavior, phase literal, operation ordering, and alpha invariant.
The kernel accepts canonical linear-premultiplied rgba16float surfaces through an explicit adapter and emits a linear-premultiplied rgba16float shadow candidate.
CPU parity is evaluated against uploaded f16 truth, not ideal logical inputs.
WebGL parity uses the exact byte-identified fragment and utility sources with only deterministic include expansion.
Qualification readback is isolated from product execution.
No Tensor gate is inserted into compatibility ABI v1.
No output from WGSL-02 may become a Canonical Final Texture, Preview surface, or Export source.
WGSL-02 proves executable compatibility, not product authority.
```
