# TDT-RESAMPLE-RUNTIME-01-R1A

## Legacy ABI Preservation / DeltaK EWA Execution Repair / Uniform ABI Exactness / Uniform Barrier / Workgroup-Common Shared Tile / Submission and Resource Closure Seal

- **Spec ID:** `TDT-RESAMPLE-RUNTIME-01-R1A`
- **Revision:** `R1A`
- **Status:** `SPEC_DEFINED_UNBAKED`
- **Date:** `2026-07-25`
- **Parent patch:** `TDT-PREVIEW-PRESENTER-01`
- **Parent source state:** `PREVIEW_PRESENTER_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- **Parent ZIP SHA-256:** `493530e60d649aefd8269fe313233a29d2b722a36bb2609a6f717e5f3fa7adf8`
- **Parent GPU authority:** `TDT-GPU-DEVICE-SSOT-01`
- **Parent surface authority:** `TDT-SURFACE-LIFECYCLE-01`
- **Parent preview authority:** `TDT-PREVIEW-PRESENTER-01`
- **Superseding umbrella spec:** `TDT-RESAMPLE-RUNTIME-01`
- **Target source state:** `RESAMPLE_RUNTIME_R1A_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME`
- **Maximum promotable state:** `RESAMPLE_RUNTIME_R1A_VERIFIED_UNPROMOTED`
- **Production pointer mutation:** forbidden
- **Existing external entrypoint removal:** forbidden
- **Existing return-shape mutation:** forbidden
- **Existing Pipeline stage removal:** forbidden
- **Silent CPU, Canvas, WebGL or Lanczos fallback:** forbidden
- **Tensor semantic redesign in this revision:** forbidden
- **Deterministic multi-stage downscale in this revision:** deferred to `R1B`
- **Integrated structure tensor and eigen/coherence truth:** deferred to `R1C`
- **Workgroup optimization beyond correctness baseline:** deferred to `R2`

---

# 0. Executive decision

현재 활성 Q-map WebGPU 경로에는 다음 외부 계약이 이미 존재한다.

```text
createDeltaKStack(device, existingPipes?)
runDeltaKStack(...)
pipeEWA
runDeltaK(ctx, frameInputs)
GPUTexture return value
Gamma-proof downstream consumer
```

이 계약은 실제 Pipeline에 결선되어 있으므로, EWA 구현 결함을 이유로 기존 경로를 먼저 제거하거나 quarantine하면 Q-map, DeltaK gamma-proof, final surface publication과 downstream Preview/Export가 연쇄적으로 끊길 수 있다.

따라서 본 명세는 다음 결정을 채택한다.

> 기존 함수명, import path, Pipeline 호출 순서, `pipeEWA` slot, `GPUTexture` 반환형을 유지한다.  
> 기존 `runDeltaKStack(device, deltaKPipes, frameInputs)` 위치 인자 호출과 객체 인자 호출을 모두 수용하는 ABI 정규화 계층을 같은 entrypoint 내부에 둔다.  
> 현재 `ewa_aniso_tile.mjs`의 제품 entrypoint `main`을 유지하면서 uniform ABI, workgroup barrier, shared tile 기준점, source tile extent, submission closure와 temporary resource 생명주기를 내부 수리한다.  
> 기존 Pipeline을 우회하는 새 제품 리샘플러를 옆에 세우지 않는다.  
> caller가 canonical object ABI로 모두 이동한 뒤에만 legacy normalization branch를 제거할 수 있다.

본 명세는 EWA와 anisotropy의 최종 품질 완성을 주장하지 않는다.

본 명세의 목적은 다음 다섯 가지다.

1. 현재 활성 EWA prepass가 실제로 호출 가능한 상태가 되게 한다.
2. WebGPU validation과 WGSL synchronization 규칙을 위반하지 않게 한다.
3. 같은 workgroup의 모든 invocation이 같은 source tile을 공유하게 한다.
4. 기존 caller와 downstream Pipeline을 깨지 않고 canonical request ABI로 이동할 발판을 만든다.
5. 이후 `R1B`, `R1C`, `R1D`가 정확한 실행 기준 위에 올라가게 한다.

---

# 1. 문제 정의

## 1.1 현재 호출 ABI 불일치

활성 정의는 객체 하나를 받는다.

```js
export async function runDeltaKStack({
  device,
  pipes,
  srcTex,
  tensorTex,
  runDeltaKCore,
  scale,
  sigmaMain,
  sigmaCross,
  shrinkClamp
})
```

활성 호출부는 위치 인자를 사용한다.

```js
const resultTex = await runDeltaKStack(device, deltaKPipes, frameInputs);
```

JavaScript에서 이 호출은 첫 번째 인자인 `GPUDevice`를 구조 분해 대상으로 사용한다.

그 결과 다음 필드가 모두 `undefined`가 된다.

```text
device
pipes
srcTex
tensorTex
runDeltaKCore
```

현재 함수의 첫 검사는 다음 오류로 닫힐 가능성이 높다.

```text
DeltaK stack not initialized
```

이 결함은 품질 저하가 아니라 활성 entrypoint 실행 불능 결함이다.

## 1.2 현재 uniform byte-size 불일치

현재 WGSL Params는 다음 필드를 가진다.

```wgsl
struct Params {
  inSize        : vec2<f32>;
  outSize       : vec2<f32>;
  scale         : vec2<f32>;
  sigmaMain     : f32;
  sigmaCross    : f32;
  shrinkClamp   : f32;
};
```

WGSL uniform address-space 정렬 규칙에 따라 해당 구조체의 최소 바인딩 크기는 16바이트 배수로 반올림된 48바이트다.

현재 JavaScript는 float 9개만 업로드한다.

```js
new Float32Array([
  inW, inH,
  outW, outH,
  outW / inW, outH / inH,
  sigmaMain, sigmaCross,
  shrinkClamp
])
```

현재 업로드 크기는 36바이트다.

따라서 현재 bind group은 구현체에 따라 다음 validation 오류를 낼 수 있다.

```text
buffer binding size is smaller than minimum uniform binding size
```

## 1.3 현재 barrier가 비균일 제어 흐름 뒤에 존재

현재 shader는 다음 순서를 사용한다.

```wgsl
if (gid.x >= outW || gid.y >= outH) {
  return;
}

// cooperative tile load
workgroupBarrier();
```

마지막 workgroup에서 일부 invocation은 `return`하고, 나머지는 `workgroupBarrier()`에 도달한다.

Workgroup synchronization barrier는 같은 workgroup의 모든 invocation이 균일하게 실행해야 한다.

따라서 현재 구조는 odd dimension, non-multiple dimension과 부분 workgroup에서 올바른 실행 계약이 아니다.

## 1.4 현재 shared tile 원점이 invocation마다 다름

현재 shader는 각 output invocation의 `gid`에서 source center와 `baseX`, `baseY`를 계산한다.

```wgsl
let pSrc  = uvOut * U.inSize;
let pBase = vec2<i32>(floor(pSrc));
let baseX = pBase.x - PAD;
let baseY = pBase.y - PAD;
```

그 뒤 모든 invocation이 같은 `var<workgroup> tile`에 값을 쓴다.

같은 workgroup 내부에서도 각 invocation의 `gid`가 다르므로 `baseX`, `baseY`도 다르다.

즉 각 invocation은 서로 다른 source rectangle을 같은 shared array index에 기록한다.

Barrier가 존재하더라도 tile의 index와 source coordinate 관계가 단일하지 않다.

이는 단순 race 가능성이 아니라 shared-memory coordinate system 부재다.

## 1.5 현재 tile extent가 output-to-source footprint를 반영하지 않음

현재 tile 크기는 다음과 같다.

```text
WG_W = 16
WG_H = 16
R = 2
TILE_W = 20
TILE_H = 20
```

그러나 0.5배 output scale은 source texel 기준으로 2배 간격의 output center를 만든다.

16개 output pixel이 담당하는 source span은 약 32 texel이다.

여기에 anisotropic sample halo가 추가된다.

현재 20x20 tile은 해당 span을 모두 포함할 수 없다.

현재 `sample_from_tile()`이 범위를 벗어나면 direct texture load로 돌아가므로 결과 자체가 항상 틀린다고 단정할 수는 없지만, shared tile hit 의미와 성능 회계는 깨진다.

## 1.6 현재 `enable f16` 요구가 실제 코드와 불일치

현재 WGSL은 다음 directive를 포함한다.

```wgsl
enable f16;
```

그러나 shader 내부에는 `f16`, `vec2<f16>`, `vec4<f16>` scalar/vector 연산이 없다.

`rgba16float` texture format 사용과 WGSL `shader-f16` language extension은 동일한 요구가 아니다.

현재 경로는 실제 필요가 없는 `shader-f16` feature admission을 요구할 수 있다.

본 리비전에서는 directive를 제거한다.

향후 실제 f16 arithmetic을 도입할 때는 GPU Device Authority가 `shader-f16` feature를 명시적으로 요청하고 receipt에 기록해야 한다.

## 1.7 현재 dispatch resource가 닫히지 않음

현재 `dispatchEWAAniso()`는 호출마다 uniform buffer를 생성한다.

```js
const paramBuf = device.createBuffer(...)
```

그러나 다음이 없다.

- reusable buffer ownership
- Surface/Resource Authority 등록
- submit completion 이후 destroy
- submission receipt
- dispatch completion promise

또한 함수는 command submission 직후 동기적으로 반환한다.

따라서 downstream이 output texture를 같은 queue ordering 안에서 사용하는 경우에는 동작할 수 있지만, temporary buffer 생명주기와 제출 완료 증거는 없다.

## 1.8 현재 output dimension validation이 부족

현재 output dimensions는 다음과 같이 계산한다.

```js
Math.floor(inW * scale)
Math.floor(inH * scale)
```

다음 입력이 명시적으로 차단되지 않는다.

- `scale <= 0`
- `scale > 1`인데 downscale path로 진입
- `NaN`
- `Infinity`
- output width 또는 height 0
- GPU maximum texture dimension 초과
- source texture dimension 추출 실패

본 리비전은 output semantic redesign을 하지 않지만, invalid dimension이 GPU validation 단계까지 흘러가지 않도록 fail-closed한다.

---

# 2. 범위

## 2.1 In scope

- 기존 `runDeltaKStack` 함수명과 import path 유지
- legacy positional ABI와 canonical object ABI 동시 수용
- canonical request normalization
- legacy alias mapping과 telemetry
- `createDeltaKStack` 외부 함수명과 반환 slot 유지
- `pipeEWA` slot 유지
- `runDeltaK(ctx, frameInputs)` 호출 순서 유지
- 기존 `GPUTexture` return value 유지
- current gamma-proof downstream contract 유지
- `ewa_aniso_tile.mjs` 제품 entrypoint `main` 유지
- unnecessary `enable f16` 제거
- uniform struct 64-byte exact ABI 도입
- TypeScript/JavaScript packer exact offset 정의
- workgroup-common source tile origin
- source tile extent의 conservative calculation
- all-lane uniform barrier participation
- out-of-bounds lane의 post-barrier write suppression
- direct-load independent reference entrypoint 또는 test shader 도입
- tiled result와 direct reference parity gate
- tile fallback telemetry
- submission sequence receipt
- reusable uniform buffer 또는 fence-delayed destroy
- output texture registration adapter
- error scope와 compilation-info validation
- active graph asset digest 갱신
- source gate, mock gate, packaged-runtime gate 정의
- caller migration counter
- legacy branch removal 조건 정의

## 2.2 Out of scope

다음은 본 리비전에서 구현 완료를 주장하지 않는다.

- 큰 축소비에 대한 deterministic multi-stage planner
- scale ratio가 2.0을 넘는 단일 pass 지원
- 실제 공간 적분 structure tensor
- Gaussian tensor integration
- eigenvalue/eigenvector truth
- coherence-based anisotropy truth
- linear working surface 전체 통합
- ICC profile transform
- hidden RGB sidecar 최종 정책
- EWA radial kernel 최종 선택
- radius/sigma UI 전체 재설계
- Adaptive EWA caller 전체 migration
- `engineAuto` 전체 migration
- Worker broker migration
- Export WGSL path 전체 통합
- Preview/Export final-surface 완전 parity 승격
- tiled large-image execution
- Production Pointer 변경

위 항목은 각각 `R1B`, `R1C`, `R1D`, `R2`로 인계한다.

---

# 3. 비협상 호환 계약

## 3.1 외부 symbol 보존

다음 symbol은 삭제, rename, stub화할 수 없다.

```text
createDeltaKStack
runDeltaKStack
createEWAAnisoPipeline
dispatchEWAAniso
runDeltaK
pipeEWA
```

## 3.2 import path 보존

다음 import path는 유지한다.

```text
./deltaK_stack_autoEWA.mjs
./ewa_aniso_tile.mjs
```

내부 구현 파일을 추가할 수는 있지만 위 facade path는 계속 유효해야 한다.

## 3.3 반환형 보존

`runDeltaKStack()`은 성공 시 기존과 같이 downstream이 사용할 수 있는 `GPUTexture`를 반환한다.

다음과 같이 객체 반환형으로 바꾸는 것은 금지한다.

```js
return {
  texture,
  receipt,
  surfaceId
}
```

receipt와 surface metadata는 다음 중 하나로 분리한다.

- WeakMap metadata registry
- Surface Authority lookup
- event/receipt ledger
- diagnostic callback

기존 return shape는 변경하지 않는다.

## 3.4 Pipeline 순서 보존

본 리비전은 다음 순서를 유지한다.

```text
Q-map source/tensor ready
→ EWA prepass
→ DeltaK core 또는 gamma-proof
→ existing downstream
```

EWA를 Pipeline 밖 별도 후처리로 옮기지 않는다.

## 3.5 실패 의미

실패 시 다음 silent fallback은 금지한다.

- source texture 원본 반환
- zero-filled output 반환
- Canvas resize
- WebGL resize
- Lanczos 실행
- bilinear 실행
- tensor를 무시한 다른 제품 경로 실행

실패는 structured error와 receipt를 남기고 기존 Pipeline job을 fail-closed한다.

---

# 4. 대상 모듈 구조

본 리비전은 기존 facade 파일을 유지하면서 다음 책임을 분리한다.

```text
app/legacy-runtime/core/compute/qmap_webgpu/
├─ deltaK_stack_autoEWA.mjs              # 기존 facade, ABI normalization
├─ ewa_aniso_tile.mjs                    # 기존 facade, pipeline/dispatch compatibility
├─ ewa_aniso_contract.mjs                # request/params validation
├─ ewa_aniso_params.mjs                  # exact 64-byte packer
├─ ewa_aniso_runtime_receipt.mjs         # receipt ledger
├─ shaders/
│  ├─ ewa_aniso_tile_v2.wgsl             # product tiled entrypoint main
│  └─ ewa_aniso_reference_v1.wgsl        # independent direct-load test reference
└─ runtime.js                            # caller remains, canonical object call migration
```

기존 `ewa_aniso_tile.mjs` 안에 WGSL string을 유지해도 되지만, 다음 조건을 만족해야 한다.

1. WGSL bytes가 Runtime Asset Manifest 또는 source receipt에 digest로 봉인된다.
2. product shader와 independent reference shader의 digest가 다르다.
3. production entrypoint는 기존 `main`을 유지한다.
4. test-only reference는 product Active Graph 실행 root가 아니다.

---

# 5. ABI 정규화 설계

## 5.1 지원 ABI

본 리비전 동안 `runDeltaKStack()`은 두 ABI를 지원한다.

### Canonical object ABI

```js
await runDeltaKStack({
  device,
  pipes,
  srcTex,
  tensorTex,
  runDeltaKCore,
  scale,
  sigmaMain,
  sigmaCross,
  shrinkClamp,
  runtimeEpoch,
  deviceEpoch,
  jobId
});
```

### Legacy positional ABI

```js
await runDeltaKStack(device, deltaKPipes, frameInputs);
```

## 5.2 facade 구현 계약

```js
export async function runDeltaKStack(arg0, arg1, arg2) {
  const normalized = normalizeDeltaKStackRequest(arg0, arg1, arg2);
  return runDeltaKStackCanonical(normalized);
}
```

`runDeltaKStackCanonical()`은 export하지 않거나 internal-only symbol로 유지한다.

외부 caller가 internal implementation을 직접 import하지 못하게 한다.

## 5.3 legacy frameInputs alias table

legacy positional ABI의 `frameInputs`는 다음 alias를 정규화한다.

| Canonical field | Accepted legacy aliases |
|---|---|
| `srcTex` | `srcTex`, `qmapTex`, `inputTex`, `sourceTex`, `texQmap` |
| `tensorTex` | `tensorTex`, `texTensor`, `structureTensorTex` |
| `runDeltaKCore` | `runDeltaKCore`, `deltaKCore`, `runCore` |
| `scale` | `scale`, `downscale`, `downscaleScale` |
| `sigmaMain` | `sigmaMain`, `sigmaPara`, `majorSigma` |
| `sigmaCross` | `sigmaCross`, `sigmaPerp`, `minorSigma` |
| `shrinkClamp` | `shrinkClamp`, `sigmaClamp`, `maxSigma` |
| `runtimeEpoch` | `runtimeEpoch` |
| `deviceEpoch` | `deviceEpoch` |
| `jobId` | `jobId`, `requestId` |

Alias가 둘 이상 동시에 존재하고 값이 다르면 fail-closed한다.

```text
E_R1A_AMBIGUOUS_LEGACY_ALIAS
```

## 5.4 device ownership validation

legacy caller가 raw `device`를 전달하더라도 다음을 검증한다.

- 현재 GPU Authority active device와 object identity가 같음
- device epoch가 current epoch와 같음
- device lost/recovering state가 아님

GPU Authority bridge가 제공하는 inspection API를 사용한다.

raw device를 전역에서 다시 조회하지 않는다.

## 5.5 canonical caller migration

`runtime.js`의 활성 호출은 R1A bake에서 canonical object ABI로 수정한다.

```js
const resultTex = await runDeltaKStack({
  device,
  pipes: deltaKPipes,
  ...frameInputs
});
```

그러나 legacy positional branch는 다른 admitted caller가 0임이 증명될 때까지 유지한다.

## 5.6 legacy ABI telemetry

각 호출은 다음 counter 중 하나를 증가시킨다.

```text
canonicalObjectCallCount
legacyPositionalCallCount
legacyAliasNormalizationCount
legacyAmbiguityRejectCount
```

성공적인 최종 R1D migration 이전에는 `legacyPositionalCallCount > 0`이어도 R1A 실패가 아니다.

다만 receipt에 정확히 기록해야 한다.

---

# 6. Canonical request schema

```ts
interface DeltaKEwaR1ARequest {
  runtimeEpoch: number;
  deviceEpoch: number;
  jobId: string;

  device: GPUDevice;
  pipes: DeltaKStackPipesR1A;

  srcTex: GPUTexture;
  tensorTex: GPUTexture;

  runDeltaKCore?: ((request: DeltaKCoreRequest) => Promise<void>) | null;

  scale: number;
  sigmaMain: number;
  sigmaCross: number;
  shrinkClamp: number;

  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;

  executionMode: "tiled-v2";
  tensorMode: "legacy-field-v1";
}
```

## 6.1 Required fields

다음은 필수다.

- current GPU device
- initialized `pipes.pipeEWA`
- source texture
- tensor texture
- positive source dimensions
- finite scale
- finite sigma values
- finite shrink clamp

## 6.2 Dimension extraction

GPUTexture의 implementation-specific `.width` 또는 `.size` property에만 의존하지 않는다.

`createDeltaKStack` 또는 texture registration 시 canonical metadata registry를 사용한다.

Compatibility 기간에는 다음 순서로 resolution을 얻는다.

1. Surface Authority metadata
2. EWA WeakMap texture metadata
3. explicit `sourceWidth`, `sourceHeight`
4. legacy `.width`, `.height`
5. legacy `.size[0]`, `.size[1]`

모두 없으면 fail-closed한다.

```text
E_R1A_SOURCE_DIMENSION_UNKNOWN
```

## 6.3 Scale admission

R1A는 단일 pass 안정화 리비전이므로 다음 범위만 승인한다.

```text
0.5 <= scale <= 1.0
```

`scale < 0.5`는 R1B deterministic multi-stage planner가 소유한다.

`scale > 1.0`은 downscale path에서 거부한다.

```text
E_R1A_SCALE_REQUIRES_MULTISTAGE
E_R1A_UPSCALE_NOT_ADMITTED
```

기존 caller의 default `0.5`는 유지한다.

## 6.4 Output dimension rule

```text
outputWidth  = max(1, floor(sourceWidth  * scale))
outputHeight = max(1, floor(sourceHeight * scale))
```

caller가 explicit output dimensions를 제공하는 경우 위 계산과 다르면 거부한다.

R1B부터 exact target dimensions와 stage plan을 별도 규칙으로 확장한다.


### 6.4.1 Source-bake clarification: odd half-scale dimensions

`floor(source * 0.5)` 규칙 때문에 홀수 축은 계산된 `srcPerDst`가 2.0을 조금 초과할 수 있다.

```text
17 -> floor(17 * 0.5) = 8
srcPerDst = 17 / 8 = 2.125
```

따라서 R1A bake는 `scale >= 0.5` 계약을 유지하면서, rounded `srcPerDst <= 2.0`만을 별도 절대 조건으로 사용하지 않는다. Shared-tile admission은 한 workgroup의 실제 source-center span으로 검증한다.

```text
centerSpan = (min(outputExtent, WG_EXTENT) - 1) * srcPerDst
centerSpan <= WG_EXTENT * MAX_SRC_PER_DST
```

이 보정은 홀수 dimension rounding을 허용하기 위한 것이며, `scale < 0.5` 단일-pass 실행을 허용하지 않는다. 해당 범위는 여전히 R1B multi-stage planner 소유다.

## 6.5 Parameter admission

```text
0.0001 <= sigmaMain   <= MAX_SIGMA
0.0001 <= sigmaCross  <= MAX_SIGMA
1.0    <= shrinkClamp <= MAX_SHRINK_CLAMP
```

R1A canonical constants:

```text
MAX_SIGMA = 2.5
MAX_SHRINK_CLAMP = 2.5
```

위 상한은 shared tile extent 계산과 일치해야 한다.

---

# 7. Pipeline bundle compatibility

## 7.1 `createDeltaKStack` return shape

기존 caller는 `ctx.deltaKPipes`와 `pipes.pipeEWA`를 사용한다.

따라서 다음 shape를 유지한다.

```js
{
  ...existingPipes,
  pipeEWA
}
```

`pipeEWA`는 내부적으로 bundle object가 될 수 있다.

```ts
interface EwaPipelineBundleR1A {
  pipeline: GPUComputePipeline;
  bindGroupLayout: GPUBindGroupLayout;
  paramsBuffer: GPUBuffer;
  pipelineIdentity: string;
  shaderDigest: string;
  layoutDigest: string;
  deviceEpoch: number;
  workgroupSize: { x: 8; y: 8 };
  tileExtent: { width: number; height: number; halo: number };
}
```

`dispatchEWAAniso()`는 다음 둘을 모두 수용할 수 있다.

- old raw `GPUComputePipeline`
- new `EwaPipelineBundleR1A`

그러나 R1A bake 이후 `createEWAAnisoPipeline()`은 bundle을 반환한다.

raw pipeline compatibility는 caller count가 0인 것이 증명될 때 제거한다.

## 7.2 Pipeline cache ownership

shader module과 pipeline은 반드시 GPU Authority bridge를 통해 생성한다.

Cache key는 최소 다음을 포함한다.

```text
runtimeEpoch
deviceEpoch
shaderDigest
entryPoint=main
layoutDigest
workgroupSize
MAX_SRC_PER_DST
MAX_SHRINK_CLAMP
```

## 7.3 Device epoch mismatch

bundle의 `deviceEpoch`가 current epoch와 다르면 dispatch 전에 거부한다.

```text
E_R1A_STALE_PIPELINE_EPOCH
```

자동으로 old pipeline을 재사용하지 않는다.

Recovery participant가 새 epoch에서 bundle을 다시 생성한다.

---

# 8. Uniform ABI v2

## 8.1 WGSL layout

R1A는 다음 64-byte layout을 사용한다.

```wgsl
struct Params {
  inSize         : vec2<u32>,   // offset 0,  size 8
  outSize        : vec2<u32>,   // offset 8,  size 8

  srcPerDst      : vec2<f32>,   // offset 16, size 8
  dstPerSrc      : vec2<f32>,   // offset 24, size 8

  sigmaMain      : f32,         // offset 32
  sigmaCross     : f32,         // offset 36
  shrinkClamp    : f32,         // offset 40
  maxSampleReach : f32,         // offset 44

  stageIndex     : u32,         // offset 48
  stageCount     : u32,         // offset 52
  flags          : u32,         // offset 56
  abiVersion     : u32,         // offset 60
};
```

Canonical values:

```text
abiVersion = 0x0001_000A
stageIndex = 0
stageCount = 1
```

## 8.2 JavaScript packer

JavaScript는 정확히 64바이트 `ArrayBuffer`를 생성한다.

```js
const PARAM_BYTES = 64;
const buffer = new ArrayBuffer(PARAM_BYTES);
const u32 = new Uint32Array(buffer);
const f32 = new Float32Array(buffer);
```

Offsets:

| Byte offset | View index | Type | Field |
|---:|---:|---|---|
| 0 | `u32[0]` | u32 | inWidth |
| 4 | `u32[1]` | u32 | inHeight |
| 8 | `u32[2]` | u32 | outWidth |
| 12 | `u32[3]` | u32 | outHeight |
| 16 | `f32[4]` | f32 | srcPerDstX |
| 20 | `f32[5]` | f32 | srcPerDstY |
| 24 | `f32[6]` | f32 | dstPerSrcX |
| 28 | `f32[7]` | f32 | dstPerSrcY |
| 32 | `f32[8]` | f32 | sigmaMain |
| 36 | `f32[9]` | f32 | sigmaCross |
| 40 | `f32[10]` | f32 | shrinkClamp |
| 44 | `f32[11]` | f32 | maxSampleReach |
| 48 | `u32[12]` | u32 | stageIndex |
| 52 | `u32[13]` | u32 | stageCount |
| 56 | `u32[14]` | u32 | flags |
| 60 | `u32[15]` | u32 | abiVersion |

## 8.3 Minimum binding size

Bind group layout의 uniform entry는 다음을 명시한다.

```js
buffer: {
  type: "uniform",
  minBindingSize: 64
}
```

## 8.4 ABI digest

다음 canonical JSON을 SHA-256으로 봉인한다.

```json
{
  "abiId": "tdt.delta-k-ewa.params.v2",
  "byteLength": 64,
  "fields": [
    ["inSize", "vec2<u32>", 0],
    ["outSize", "vec2<u32>", 8],
    ["srcPerDst", "vec2<f32>", 16],
    ["dstPerSrc", "vec2<f32>", 24],
    ["sigmaMain", "f32", 32],
    ["sigmaCross", "f32", 36],
    ["shrinkClamp", "f32", 40],
    ["maxSampleReach", "f32", 44],
    ["stageIndex", "u32", 48],
    ["stageCount", "u32", 52],
    ["flags", "u32", 56],
    ["abiVersion", "u32", 60]
  ]
}
```

WGSL struct, packer, bind-group `minBindingSize`와 receipt의 digest가 모두 일치해야 한다.

---

# 9. `shader-f16` admission

## 9.1 R1A rule

`ewa_aniso_tile_v2.wgsl`에서 다음 directive를 제거한다.

```wgsl
enable f16;
```

R1A shader는 f32 arithmetic을 사용한다.

Output storage format은 기존과 같이 `rgba16float`를 유지한다.

## 9.2 Future rule

후속 최적화에서 실제 f16 arithmetic을 사용하려면 다음이 모두 필요하다.

- adapter feature `shader-f16`
- device requested feature `shader-f16`
- GPU Authority receipt
- f32 baseline parity
- separate pipeline identity

Feature가 없을 때 f16 shader compile을 시도하고 f32로 조용히 fallback하는 행위는 금지한다.

---

# 10. Workgroup geometry

## 10.1 Canonical workgroup size

R1A의 canonical workgroup size는 다음이다.

```text
WG_W = 8
WG_H = 8
WORKGROUP_INVOCATIONS = 64
```

기존 16x16은 0.5 scale에서 conservative source tile extent와 halo를 포함할 때 shared-memory pressure가 증가한다.

R1A는 정확성과 보수적 tile coverage를 위해 8x8을 채택한다.

16x16 재도입은 R2 performance evidence 이후만 허용한다.

## 10.2 Single-pass admitted source ratio

R1A는 다음을 보장한다.

```text
1.0 <= srcPerDstX <= 2.0
1.0 <= srcPerDstY <= 2.0
```

Scale 0.5가 최대 2.0 source texel per destination pixel에 해당한다.

## 10.3 Maximum sample reach

현재 loop radius는 `R = 2`다.

Current formula에서 최대 offset magnitude는 대략 다음으로 제한된다.

```text
R * shrinkClamp
```

R1A canonical halo는 다음이다.

```text
MAX_SAMPLE_REACH = ceil(R * MAX_SHRINK_CLAMP) + 1
                 = ceil(2 * 2.5) + 1
                 = 6
```

추가 1 texel은 round와 boundary 보수 여유다.

## 10.4 Conservative tile extent

8 output pixels가 source에서 담당하는 최대 center span:

```text
ceil(WG_W * MAX_SRC_PER_DST) = 16
```

Canonical tile extent:

```text
TILE_W = 16 + 2 * 6 = 28
TILE_H = 16 + 2 * 6 = 28
```

Shared storage:

```text
28 * 28 * sizeof(vec4<f32>)
= 784 * 16
= 12,544 bytes
```

이는 일반적인 WebGPU workgroup storage limit 16KB 이하이지만, Runtime은 실제 device limit를 확인한다.

```text
requiredWorkgroupStorageBytes <= device.limits.maxComputeWorkgroupStorageSize
```

미달하면 silent direct-load fallback을 하지 않고 fail-closed한다.

```text
E_R1A_WORKGROUP_STORAGE_LIMIT
```

---

# 11. Workgroup-common source tile origin

## 11.1 Required builtins

Product shader는 다음 builtin을 사용한다.

```wgsl
@builtin(workgroup_id) wid: vec3<u32>
@builtin(local_invocation_index) localIndex: u32
@builtin(global_invocation_id) gid: vec3<u32>
```

Tile origin은 `wid`에서만 계산한다.

`gid` 또는 `lid`별 source center에서 tile origin을 계산하면 안 된다.

## 11.2 Output workgroup origin

```wgsl
let outGroupOrigin = wid.xy * vec2<u32>(WG_W, WG_H);
```

## 11.3 Source-space center range

첫 output pixel center:

```wgsl
let firstCenter = (vec2<f32>(outGroupOrigin) + vec2<f32>(0.5)) * U.srcPerDst;
```

마지막 potential output pixel center:

```wgsl
let lastOffset = vec2<f32>(f32(WG_W - 1u), f32(WG_H - 1u));
let lastCenter = (vec2<f32>(outGroupOrigin) + lastOffset + vec2<f32>(0.5)) * U.srcPerDst;
```

## 11.4 Shared origin

```wgsl
let minCenter = min(firstCenter, lastCenter);
let tileOrigin = vec2<i32>(floor(minCenter)) - vec2<i32>(HALO);
```

같은 workgroup의 모든 invocation은 동일한 `tileOrigin`을 계산해야 한다.

## 11.5 Tile coordinate contract

Shared tile index `(tx, ty)`는 항상 다음 source texel을 의미한다.

```text
sourceX = tileOrigin.x + tx
sourceY = tileOrigin.y + ty
```

반대 변환:

```text
tx = sourceX - tileOrigin.x
ty = sourceY - tileOrigin.y
```

기존처럼 `baseX`에 PAD를 넣고 load 시 다시 PAD를 빼는 이중 보정은 금지한다.

---

# 12. Cooperative tile load

## 12.1 Flattened load loop

모든 64 invocation이 tile element를 선형 분할한다.

```wgsl
const TILE_ELEMENTS: u32 = TILE_W * TILE_H;

var index = localIndex;
loop {
  if (index >= TILE_ELEMENTS) {
    break;
  }

  let tx = index % TILE_W;
  let ty = index / TILE_W;

  let sx = tileOrigin.x + i32(tx);
  let sy = tileOrigin.y + i32(ty);

  tile[index] = load_src_clamped(sx, sy);
  index += WG_W * WG_H;
}
```

## 12.2 Uniform barrier

Barrier는 다음 조건을 만족해야 한다.

- output bounds branch 이전 또는 branch와 무관한 공통 경로
- 모든 invocation이 정확히 한 번 도달
- barrier 이전 `return`, `break` from function, `discard` 없음

Canonical order:

```text
compute workgroup-common origin
→ cooperative tile load
→ workgroupBarrier
→ compute inBounds
→ if !inBounds return
→ sample and write
```

## 12.3 Out-of-range lanes

마지막 workgroup의 out-of-range lane도 tile load와 barrier에 참여한다.

Barrier 이후 output write만 생략한다.

## 12.4 Boundary handling

Source texture boundary는 clamp-to-edge를 명시한다.

```wgsl
fn load_src_clamped(ix: i32, iy: i32) -> vec4<f32>
```

Negative coordinate를 u32로 변환한 뒤 clamp하는 패턴은 금지한다.

---

# 13. Shared tile sampling

## 13.1 Tile-first sampling

각 EWA sample은 source integer coordinate를 계산한 뒤 shared tile coordinate로 변환한다.

```wgsl
let local = sampleCoord - tileOrigin;
```

## 13.2 Admitted path invariant

R1A admitted parameter 범위에서는 모든 sample이 shared tile 안에 있어야 한다.

Product shader는 안전을 위해 direct load fallback을 가질 수 있지만, 다음 counter를 기록한다.

```text
tileSampleCount
outsideTileFallbackCount
```

R1A fixture와 packaged smoke에서:

```text
outsideTileFallbackCount = 0
```

이어야 한다.

Fallback이 발생하면 결과는 보존할 수 있지만 R1A Gate는 실패한다.

## 13.3 Debug counter

Validation build에서는 atomic storage buffer를 사용해 다음을 기록한다.

```text
tileLoads
tileHits
tileMisses
outsideTileFallbacks
outputWrites
outOfBoundsLanes
```

Production build에서는 counter buffer를 제거할 수 있지만 shader specialization identity가 달라야 한다.

---

# 14. EWA arithmetic preservation

R1A는 현재 EWA parameter semantic을 최종 재설계하지 않는다.

다음 의미를 보존한다.

```text
sigmaMain
sigmaCross
shrinkClamp
legacy tensor channels: cosTheta, sinTheta, lambda1, lambda2
5x5 logical sample grid
Gaussian-like Mahalanobis weight
```

그러나 다음 안전 보정은 수행한다.

## 14.1 Direction normalization

Tensor texture의 `c`, `s`가 정확한 unit vector라는 가정을 하지 않는다.

```wgsl
let dirLen = length(vec2<f32>(T.r, T.g));
let direction = select(
  vec2<f32>(1.0, 0.0),
  vec2<f32>(T.r, T.g) / dirLen,
  dirLen > 1e-6
);
```

## 14.2 Finite guard

NaN/Infinity가 downstream output으로 전파되지 않도록 다음을 검증한다.

- sigma finite
- tensor channel finite
- accumulated weight finite
- accumulated color finite

WGSL에 `isFinite`가 없으므로 robust range clamp와 host-side input admission을 사용한다.

## 14.3 Zero-weight guard

```wgsl
if (weightSum <= EPSILON) {
  output = nearest center sample;
} else {
  output = colorSum / weightSum;
}
```

이 nearest center path는 algorithm fallback이 아니라 수치적 guard다.

Receipt에 `zeroWeightGuardCount`를 기록하고 정상 fixture에서는 0이어야 한다.

## 14.4 Alpha semantic

R1A는 기존 source texture의 alpha channel을 동일 weight로 누적한다.

Premultiplied linear alpha truth는 후속 color/alpha 명세로 인계한다.

R1A에서 RGB와 alpha를 서로 다른 kernel로 처리하지 않는다.

---

# 15. Independent direct-load reference

## 15.1 목적

Shared tile 수리가 정확한지 증명하려면 같은 shared tile 코드를 복제한 reference를 사용하면 안 된다.

R1A는 independent direct-load shader를 둔다.

```text
ewa_aniso_reference_v1.wgsl
```

## 15.2 Reference constraints

Reference shader는 다음을 사용하지 않는다.

- `var<workgroup>`
- `workgroupBarrier()`
- tile origin
- shared-memory fallback

각 sample을 `textureLoad()`로 직접 읽는다.

## 15.3 Semantic parity

Product tiled shader와 reference는 다음을 공유한다.

- Params ABI
- tensor field interpretation
- sample loop bounds
- weight equation
- source boundary clamp

하지만 source loading implementation은 공유하지 않는다.

## 15.4 Tolerance

동일 f32 arithmetic과 integer sample coordinate를 사용할 경우 exact 또는 near-exact 결과를 기대한다.

Canonical tolerance:

```text
RGBA absolute error <= 1e-5 per channel
NaN mismatch = immediate failure
Dimension mismatch = immediate failure
```

Packaged GPU implementation에서 operation ordering 차이가 확인되면 tolerance 변경은 별도 receipt와 fixture 근거가 필요하다.

---

# 16. Dispatch and submission contract

## 16.1 Function signature preservation

기존 signature를 유지한다.

```js
export function dispatchEWAAniso(device, pipelineOrBundle, request)
```

R1A에서 함수는 Promise를 반환하도록 바꿀 수 있다.

기존 caller가 반환값을 무시해도 동작해야 한다.

```js
const dispatchReceiptPromise = dispatchEWAAniso(...)
```

`runDeltaKStackCanonical()`은 반드시 await한다.

## 16.2 Reusable uniform buffer

Pipeline bundle당 64-byte uniform buffer를 재사용한다.

동시 dispatch가 가능한 경우 다음 중 하나를 사용한다.

- per-job uniform ring
- dynamic-offset uniform arena
- serial queue with one reusable buffer

R1A 기본 구현은 job serialization을 사용해도 된다.

같은 buffer를 이전 submission 완료 전에 덮어쓰면 안 된다.

## 16.3 Command encoder ownership

R1A는 현재 own-encoder 방식을 유지한다.

```text
dispatchEWAAniso
→ createCommandEncoder
→ beginComputePass
→ submit
```

후속 통합에서 caller encoder를 받을 수 있지만, R1A에서는 ambiguous mixed ownership을 도입하지 않는다.

## 16.4 Queue fence

Submission 이후 다음을 생성한다.

```js
const completion = device.queue.onSubmittedWorkDone();
```

Completion은 다음에 사용한다.

- uniform ring slot release
- debug counter readback admission
- temporary bind-group/resource cleanup
- receipt completion state

## 16.5 Return receipt

`dispatchEWAAniso()` Promise는 internal receipt를 반환한다.

```ts
interface EwaDispatchReceiptR1A {
  jobId: string;
  runtimeEpoch: number;
  deviceEpoch: number;
  pipelineIdentity: string;
  paramsDigest: string;
  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;
  workgroupsX: number;
  workgroupsY: number;
  submitted: true;
  completed: true;
  tileFallbackCount?: number;
}
```

`runDeltaKStack()`의 외부 return은 계속 GPUTexture다.

## 16.6 Dispatch ordering

`runDeltaKCore` 또는 gamma-proof가 같은 queue에 제출되더라도 EWA output dependency가 명확해야 한다.

R1A는 다음 둘 중 하나만 허용한다.

1. EWA submission completion await 후 downstream dispatch
2. 같은 command encoder 내 명시적 pass ordering

현재 own-encoder 구현에서는 1번을 사용한다.

성능 최적화는 후속 리비전에서 same-encoder ordering으로 바꿀 수 있다.

---

# 17. Output texture and Surface Authority

## 17.1 Existing return contract

Output은 계속 `rgba16float` GPUTexture다.

Required usage:

```text
STORAGE_BINDING
TEXTURE_BINDING
COPY_SRC
```

후속 pass가 필요하면 `COPY_DST` 추가 여부는 명시적으로 결정한다.

## 17.2 Surface registration

Texture 생성 직후 Surface Authority adapter를 통해 등록한다.

```text
kind = GPU_TEXTURE
format = rgba16float
owner = dadum.resample.delta-k-ewa.r1a
runtimeEpoch
current deviceEpoch
width
height
parentSurfaceId or legacySourceIdentity
```

현재 caller가 raw texture만 제공해 source surface ID가 없다면 compatibility source identity를 receipt에 남긴다.

## 17.3 Output metadata WeakMap

기존 raw GPUTexture return을 유지하기 위해 다음 metadata를 WeakMap에 연결할 수 있다.

```text
surfaceId
width
height
format
runtimeEpoch
deviceEpoch
jobId
paramsDigest
```

## 17.4 Disposal ownership

`runDeltaKStack()`이 output texture를 생성한 뒤 downstream에 반환하면 output ownership은 Pipeline downstream으로 이동한다.

EWA module이 즉시 destroy하면 안 된다.

다음은 EWA module이 소유한다.

- params buffer slot
- debug counter buffer
- temporary readback buffer
- temporary bind group wrapper

Output texture의 최종 disposer는 Surface Authority가 소유한다.

## 17.5 Error cleanup

Pipeline creation 이후 dispatch 실패 시 아직 downstream에 발행되지 않은 output texture는 exactly once 폐기한다.

---

# 18. Pipeline creation validation

## 18.1 Error scope

Pipeline creation은 validation error scope 안에서 실행한다.

```js
device.pushErrorScope("validation")
```

Pipeline 생성 후 `popErrorScope()` 결과가 null이어야 한다.

## 18.2 Compilation info

`GPUShaderModule.getCompilationInfo()`를 지원하면 다음을 검사한다.

```text
severity=error count = 0
```

Warning은 receipt에 기록한다.

## 18.3 Entry point identity

제품 entrypoint는 기존과 같이 다음이다.

```text
main
```

Reference entrypoint 또는 shader는 별도 identity를 가진다.

## 18.4 Bind group layout

R1A canonical binding:

| Binding | Resource |
|---:|---|
| 0 | source `texture_2d<f32>` |
| 1 | legacy tensor `texture_2d<f32>` |
| 2 | output `texture_storage_2d<rgba16float, write>` |
| 3 | 64-byte uniform buffer |
| 4 | optional debug counters, validation build only |

Production shader에 binding 4가 없으면 pipeline identity를 별도로 둔다.

---

# 19. Runtime caller migration

## 19.1 `runtime.js`

기존 코드:

```js
const resultTex = await runDeltaKStack(device, deltaKPipes, frameInputs);
```

R1A bake target:

```js
const resultTex = await runDeltaKStack({
  device,
  pipes: deltaKPipes,
  ...frameInputs,
  runtimeEpoch: ctx.runtimeEpoch,
  deviceEpoch: ctx.deviceEpoch,
  jobId: frameInputs.jobId
});
```

## 19.2 Compatibility branch conservation

호출부를 canonical ABI로 바꿔도 `runDeltaKStack(device, pipes, frameInputs)` branch는 남긴다.

Active Graph 전체 스캔과 packaged trace에서 positional call count가 0인 것이 확인될 때만 R1D에서 제거한다.

## 19.3 `runtime_patch.diff`

현재 patch 문서는 object ABI 예시와 실제 runtime positional ABI가 불일치한다.

R1A bake에서는 다음 중 하나를 수행한다.

- patch 문서를 current source와 일치하게 갱신
- obsolete patch documentation으로 archive 표시

Patch 문서를 runtime source로 실행하지는 않지만, 잘못된 handoff 문서가 다시 positional/object mismatch를 재도입하지 않게 한다.

---

# 20. State machine

```text
UNINITIALIZED
  ↓ createDeltaKStack
PIPELINE_CREATING
  ↓ compile and validation PASS
READY
  ↓ normalized request admitted
DISPATCH_PREPARING
  ↓ bind group and output registered
SUBMITTING
  ↓ queue.submit
SUBMITTED
  ↓ queue fence resolved
COMPLETED
  ↓ output ownership transferred
READY
```

Failure states:

```text
PIPELINE_FAILED
REQUEST_REJECTED
DISPATCH_FAILED
DEVICE_LOST
DISPOSED
```

## 20.1 Device loss

Device loss가 감지되면:

1. new request admission 중단
2. pending request structured failure
3. old pipeline bundle invalidation
4. temporary resource cleanup
5. output surface invalidation
6. GPU Authority recovery participant가 새 epoch bundle 재생성

R1A module이 독립 device를 생성하면 안 된다.

---

# 21. Error taxonomy

| Code | Meaning |
|---|---|
| `E_R1A_ABI_UNSUPPORTED` | object/positional 어느 ABI에도 해당하지 않음 |
| `E_R1A_AMBIGUOUS_LEGACY_ALIAS` | legacy aliases가 서로 다른 값으로 중복 |
| `E_R1A_DEVICE_NOT_CURRENT` | 전달 device가 GPU Authority current device가 아님 |
| `E_R1A_DEVICE_EPOCH_STALE` | request epoch가 current epoch와 다름 |
| `E_R1A_PIPELINE_NOT_INITIALIZED` | `pipeEWA` 없음 |
| `E_R1A_STALE_PIPELINE_EPOCH` | pipeline bundle epoch mismatch |
| `E_R1A_SOURCE_TEXTURE_MISSING` | source texture 없음 |
| `E_R1A_TENSOR_TEXTURE_MISSING` | legacy tensor texture 없음 |
| `E_R1A_SOURCE_DIMENSION_UNKNOWN` | source dimensions 결정 불가 |
| `E_R1A_SCALE_INVALID` | scale NaN, Infinity, non-positive |
| `E_R1A_SCALE_REQUIRES_MULTISTAGE` | scale < 0.5 |
| `E_R1A_UPSCALE_NOT_ADMITTED` | scale > 1.0 |
| `E_R1A_OUTPUT_DIMENSION_INVALID` | output width/height invalid |
| `E_R1A_PARAMETER_NONFINITE` | sigma/clamp non-finite |
| `E_R1A_PARAMETER_OUT_OF_RANGE` | admitted bound 초과 |
| `E_R1A_WORKGROUP_STORAGE_LIMIT` | device shared-memory limit 부족 |
| `E_R1A_UNIFORM_ABI_MISMATCH` | struct/packer/minBindingSize 불일치 |
| `E_R1A_SHADER_COMPILE` | WGSL compile error |
| `E_R1A_PIPELINE_VALIDATION` | compute pipeline validation error |
| `E_R1A_BIND_GROUP_VALIDATION` | bind group validation error |
| `E_R1A_TILE_FALLBACK_NONZERO` | admitted fixture에서 tile miss 발생 |
| `E_R1A_REFERENCE_MISMATCH` | tiled/reference parity 실패 |
| `E_R1A_ZERO_WEIGHT_GUARD` | 정상 fixture에서 zero weight guard 발생 |
| `E_R1A_DEVICE_LOST` | dispatch 중 device lost |
| `E_R1A_SUBMISSION_FAILED` | queue submit/fence failure |
| `E_R1A_OUTPUT_NOT_REGISTERED` | output Surface registration 실패 |
| `E_R1A_DISPOSAL_LEAK` | temporary resource leak |

Error는 `name`, `code`, `jobId`, `runtimeEpoch`, `deviceEpoch`, `cause`를 가져야 한다.

---

# 22. Receipt schema

## 22.1 Source bake receipt

```json
{
  "specId": "TDT-RESAMPLE-RUNTIME-01-R1A",
  "state": "RESAMPLE_RUNTIME_R1A_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME",
  "parentSourceSeal": "...",
  "sourceSeal": "...",
  "files": [],
  "shaderDigests": {
    "productTiled": "...",
    "directReference": "..."
  },
  "uniformAbiDigest": "...",
  "activeEntrypoint": "runDeltaKStack",
  "wgslEntrypoint": "main",
  "externalAbiPreserved": true,
  "returnShapePreserved": true,
  "productionPointerMutated": false
}
```

## 22.2 Runtime dispatch receipt

```json
{
  "specId": "TDT-RESAMPLE-RUNTIME-01-R1A",
  "jobId": "...",
  "runtimeEpoch": 1,
  "deviceEpoch": 2,
  "callAbi": "canonical-object",
  "legacyAliasesUsed": [],
  "pipelineIdentity": "...",
  "shaderDigest": "...",
  "uniformAbiDigest": "...",
  "paramsDigest": "...",
  "source": {
    "width": 4096,
    "height": 4096,
    "surfaceId": "..."
  },
  "output": {
    "width": 2048,
    "height": 2048,
    "surfaceId": "...",
    "format": "rgba16float"
  },
  "workgroup": {
    "x": 8,
    "y": 8,
    "tileWidth": 28,
    "tileHeight": 28,
    "halo": 6
  },
  "counters": {
    "tileHits": 0,
    "tileMisses": 0,
    "outsideTileFallbacks": 0,
    "zeroWeightGuards": 0
  },
  "submitted": true,
  "completed": true
}
```

## 22.3 Migration receipt

```json
{
  "canonicalObjectCallCount": 0,
  "legacyPositionalCallCount": 0,
  "legacyAliasNormalizationCount": 0,
  "legacyAmbiguityRejectCount": 0,
  "rawPipelineCompatibilityCount": 0
}
```

---

# 23. Test fixture matrix

## 23.1 Dimension fixtures

다음 output dimensions는 partial workgroup과 boundary lane을 검증한다.

```text
1x1
7x7
8x8
9x9
15x15
16x16
17x17
31x19
63x65
257x129
```

Source dimensions는 scale 0.5, 0.75, 1.0에 맞춰 구성한다.

## 23.2 Color fixtures

- constant black
- constant white
- constant mid-gray
- constant arbitrary RGBA
- horizontal linear ramp
- vertical linear ramp
- checkerboard
- single impulse
- diagonal line
- alpha gradient

## 23.3 Tensor fixtures

R1A는 legacy tensor semantic을 검증한다.

- direction `(1, 0)`
- direction `(0, 1)`
- normalized 45-degree direction
- non-normalized direction `(2, 0)`
- zero direction
- positive eigen channels
- zero eigen channels
- clamp-bound eigen channels

## 23.4 ABI fixtures

- canonical object ABI
- legacy positional ABI
- every alias independently
- two equivalent aliases with same object
- conflicting aliases
- missing device
- missing pipes
- missing source
- missing tensor
- unknown dimensions
- scale below 0.5
- scale above 1.0
- NaN parameter
- stale device epoch

## 23.5 Synchronization fixtures

- output dimension exact multiple of 8
- output dimension 8n+1
- output dimension 8n-1
- one-pixel width/height
- last workgroup with one valid lane

모든 fixture에서 validation error와 GPU hang이 없어야 한다.

---

# 24. Source gates

## RA1A-01: Spec identity

- Spec ID exact
- parent source state exact
- target source state exact

## RA1A-02: Existing facade paths preserved

- `deltaK_stack_autoEWA.mjs` 존재
- `ewa_aniso_tile.mjs` 존재

## RA1A-03: Existing exports preserved

- `createDeltaKStack`
- `runDeltaKStack`
- `createEWAAnisoPipeline`
- `dispatchEWAAniso`

## RA1A-04: Return-shape preservation

- `runDeltaKStack` success return is GPUTexture-compatible
- wrapper object return 없음

## RA1A-05: Positional ABI branch present

- three-argument legacy normalization path 존재

## RA1A-06: Canonical object ABI branch present

- one-object request path 존재

## RA1A-07: Ambiguous alias fail-closed

- conflicting aliases structured error

## RA1A-08: Active runtime caller migrated

- `runtime.js` canonical object ABI 사용

## RA1A-09: Legacy counter present

- positional/canonical call counters 존재

## RA1A-10: No external API removal

- imported symbols unresolved 0

## RA1A-11: Uniform ABI byte length

- packer allocation exact 64 bytes

## RA1A-12: Uniform field offsets

- canonical offset table exact

## RA1A-13: WGSL uniform layout

- canonical struct field order exact

## RA1A-14: `minBindingSize`

- exact 64

## RA1A-15: ABI digest

- source receipt에 uniform ABI digest 존재

## RA1A-16: Unnecessary f16 directive removed

- product shader에 `enable f16` 없음

## RA1A-17: No direct adapter/device request

- R1A files에서 `requestAdapter`, `requestDevice` 0

## RA1A-18: GPU Authority pipeline ownership

- module/pipeline direct creation authority 우회 0

## RA1A-19: Workgroup size exact

- product shader 8x8x1

## RA1A-20: Workgroup-common origin

- tile origin이 `workgroup_id` 기반

## RA1A-21: No invocation-local tile base

- `gid` 기반 baseX/baseY로 shared tile indexing하지 않음

## RA1A-22: Uniform barrier control flow

- barrier 이전 function return 없음

## RA1A-23: Post-barrier bounds return

- out-of-bounds lane은 barrier 이후 종료

## RA1A-24: Tile extent exact

- 28x28 or generated equivalent

## RA1A-25: Tile storage budget assertion

- required bytes와 device limit 비교 코드 존재

## RA1A-26: Flattened cooperative load

- local invocation index 기반 load partition

## RA1A-27: Single coordinate mapping

- tile index와 source coordinate one-to-one

## RA1A-28: Double PAD correction absent

- base/pad 중복 보정 패턴 없음

## RA1A-29: Direct reference shader present

- product shader와 별도 digest

## RA1A-30: Reference has no shared memory

- `var<workgroup>` 0
- `workgroupBarrier` 0

## RA1A-31: Product/reference parameter schema shared

- same ABI digest

## RA1A-32: Output registration adapter

- output texture metadata or surface registration 존재

## RA1A-33: Temporary resource ownership

- params/debug/readback disposer 존재

## RA1A-34: Queue fence present

- submitted-work completion tracking

## RA1A-35: Dispatch receipt present

- job/epoch/pipeline/params/dimensions 포함

## RA1A-36: Device epoch validation

- stale bundle reject

## RA1A-37: Scale admission

- below 0.5, above 1.0 reject

## RA1A-38: Dimension admission

- zero/unknown/overflow reject

## RA1A-39: Parameter finite validation

- NaN/Infinity reject

## RA1A-40: Silent fallback absence

- Canvas, WebGL, Lanczos, source-return fallback 없음

---

# 25. Runtime and GPU gates

## RA1A-41: WGSL compilation

- product shader compile error 0
- reference shader compile error 0

## RA1A-42: Pipeline validation

- validation error scope result null

## RA1A-43: Bind group validation

- 64-byte buffer admission PASS
- 36-byte negative fixture FAIL

## RA1A-44: Canonical ABI smoke

- canonical object call completes

## RA1A-45: Legacy ABI smoke

- positional call normalizes and completes

## RA1A-46: Return texture compatibility

- downstream gamma-proof receives GPUTexture

## RA1A-47: Exact dimensions

- output dimensions match admitted rule

## RA1A-48: Partial workgroup completion

- 8n+1 and 8n-1 dimensions complete without hang

## RA1A-49: Barrier uniformity

- validation fixture and GPU execution pass

## RA1A-50: Shared tile/reference parity

- all fixture channels within tolerance

## RA1A-51: Tile fallback zero

- admitted fixtures outsideTileFallbackCount 0

## RA1A-52: Zero weight guard zero

- normal fixtures count 0

## RA1A-53: Constant-color conservation

- constant fixture output drift within tolerance

## RA1A-54: Direction normalization

- `(2,0)` and `(1,0)` tensor directions produce equivalent output

## RA1A-55: Device loss fail-closed

- stale dispatch rejected
- no independent recreation

## RA1A-56: Submission completion

- receipt transitions submitted to completed

## RA1A-57: Temporary resource closure

- params/debug/readback resources after completion 0 leaked

## RA1A-58: Output ownership transfer

- output remains valid for downstream
- EWA module does not destroy after return

## RA1A-59: Repeated dispatch stability

- 100 sequential dispatches
- resident temporary resource plateau
- pipeline compile count stable

## RA1A-60: Existing regression conservation

- GPU Device SSOT gate unchanged
- Surface Lifecycle gate unchanged
- Preview Presenter gate unchanged
- Runtime R7 unchanged
- Worker/codec gates unchanged

---

# 26. Packaged-runtime deferred gates

다음은 Linux source-bake 또는 mock GPU만으로 PASS 처리할 수 없다.

## RA1A-61: Windows x64 packaged shader compile

실제 packaged Electron에서 product/reference WGSL compile.

## RA1A-62: RTX 3080 validation smoke

실제 device limits, workgroup storage, bind-group validation.

## RA1A-63: Odd-size no-hang soak

부분 workgroup fixture 반복 실행.

## RA1A-64: Device loss recovery

물리 device loss 또는 test hook 이후 새 epoch pipeline recreation.

## RA1A-65: Packaged gamma-proof continuity

EWA output이 기존 downstream gamma-proof에 전달됨.

## RA1A-66: Packaged final-surface continuity

Pipeline final candidate publication까지 연결됨.

## RA1A-67: Relaunch identity

Electron relaunch 후 동일 shader/ABI digest.

## RA1A-68: Output conservation receipt

R1A tiled product와 reference parity receipt.

Packaged evidence가 없으면 위 Gate는 `DEFERRED`로 남겨야 한다.

---

# 27. Negative tests

다음 fixture는 반드시 실패해야 한다.

| Fixture | Expected error |
|---|---|
| positional ABI with missing frameInputs | `E_R1A_ABI_UNSUPPORTED` |
| source and qmap aliases conflict | `E_R1A_AMBIGUOUS_LEGACY_ALIAS` |
| non-current device | `E_R1A_DEVICE_NOT_CURRENT` |
| stale device epoch | `E_R1A_DEVICE_EPOCH_STALE` |
| 36-byte uniform buffer | WebGPU validation or `E_R1A_UNIFORM_ABI_MISMATCH` |
| scale 0.25 | `E_R1A_SCALE_REQUIRES_MULTISTAGE` |
| scale 1.25 | `E_R1A_UPSCALE_NOT_ADMITTED` |
| sigma NaN | `E_R1A_PARAMETER_NONFINITE` |
| shrinkClamp 8.0 | `E_R1A_PARAMETER_OUT_OF_RANGE` |
| missing tensor | `E_R1A_TENSOR_TEXTURE_MISSING` |
| stale pipeline bundle | `E_R1A_STALE_PIPELINE_EPOCH` |
| insufficient workgroup storage | `E_R1A_WORKGROUP_STORAGE_LIMIT` |
| intentional tile extent reduction | `E_R1A_TILE_FALLBACK_NONZERO` |
| mutated product shader | shader digest mismatch |

Negative fixture를 다른 engine으로 처리해 성공시키면 Gate 실패다.

---

# 28. Implementation phases

## Phase A: Baseline capture

1. Parent artifact source seal 확인
2. current active call sites 목록 생성
3. `runDeltaKStack` positional/object call inventory
4. shader source digest 기록
5. current WGSL compile result 기록
6. existing regression suite baseline 기록

산출물:

```text
artifacts/resample-runtime-01-r1a/baseline/
```

## Phase B: ABI compatibility repair

1. `normalizeDeltaKStackRequest()` 구현
2. canonical schema validator 구현
3. positional alias table 구현
4. ambiguity rejection 구현
5. `runtime.js` canonical call migration
6. migration counters 구현
7. existing return shape 보존 smoke

## Phase C: Uniform and pipeline repair

1. Params v2 WGSL struct 적용
2. 64-byte packer 구현
3. `minBindingSize=64`
4. ABI digest 생성
5. `enable f16` 제거
6. compilation-info gate
7. pipeline error-scope gate

## Phase D: Shared tile correctness repair

1. workgroup size 8x8 적용
2. tile extent 28x28 적용
3. workgroup ID 기반 tile origin
4. flattened cooperative load
5. uniform barrier ordering
6. post-barrier bounds return
7. tile hit/miss debug counters
8. direct reference shader 구현
9. fixture parity

## Phase E: Submission and resource closure

1. reusable uniform slot
2. queue fence
3. output Surface registration
4. temporary disposer
5. error cleanup
6. dispatch receipt
7. device loss participant

## Phase F: Integration and regression

1. Q-map runtime integration
2. gamma-proof continuity
3. Surface Lifecycle regression
4. Preview Presenter regression
5. GPU Device SSOT regression
6. Active Graph digest update
7. packaged gates DEFERRED 처리

---

# 29. File-level patch map

## 29.1 Mandatory modified files

```text
app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs
app/legacy-runtime/core/compute/qmap_webgpu/runtime.js
```

## 29.2 Expected new files

```text
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params.mjs
app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_runtime_receipt.mjs
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_v2.wgsl
app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v1.wgsl
```

## 29.3 Generated authority artifacts

```text
app/src/runtime/active-graph/generated-active-runtime-graph.json
app/src/legacy/generated-legacy-static-admission.json
app/src/runtime/active-graph/generated-runtime-asset-manifest.json
```

실제 repository의 authority filename이 다르면 기존 SSOT 생성기를 사용한다.

Generated JSON을 손으로 수정하는 것은 금지한다.

## 29.4 Tooling

```text
tools/verify_tdt_resample_runtime_01_r1a.mjs
tools/smoke_tdt_resample_runtime_01_r1a.mjs
tools/audit_tdt_resample_runtime_01_r1a_calls.mjs
tools/emit_tdt_resample_runtime_01_r1a_receipt.mjs
```

## 29.5 Package scripts

```json
{
  "verify:resample-runtime-01-r1a": "node tools/verify_tdt_resample_runtime_01_r1a.mjs",
  "smoke:resample-runtime-01-r1a": "node tools/smoke_tdt_resample_runtime_01_r1a.mjs",
  "audit:resample-runtime-01-r1a": "node tools/audit_tdt_resample_runtime_01_r1a_calls.mjs"
}
```

---

# 30. Source seal inputs

Source seal은 최소 다음을 포함한다.

- all mandatory modified files
- all new contract/params/receipt files
- product shader bytes
- reference shader bytes
- active graph generated output
- runtime asset manifest
- verifier/smoke/audit tools
- package scripts
- spec document
- parent source seal

다음은 source seal에서 제외하거나 별도 runtime receipt로 둔다.

- wall-clock timestamp
- local absolute path
- GPU driver-generated cache
- temporary debug readback
- non-deterministic console ordering

---

# 31. Promotion state

## 31.1 Source bake success

```text
PREVIEW_PRESENTER_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME
→ RESAMPLE_RUNTIME_R1A_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME
```

Source bake success는 다음을 의미한다.

- ABI repair code 적용
- WGSL source gate PASS
- exact 64-byte uniform contract PASS
- shared tile/reference mock or software validation PASS
- existing regression PASS
- packaged-only Gate는 정직하게 DEFERRED

## 31.2 Runtime verification success

```text
RESAMPLE_RUNTIME_R1A_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME
→ RESAMPLE_RUNTIME_R1A_VERIFIED_UNPROMOTED
```

필요 증거:

- Windows x64 packaged Electron
- actual WebGPU adapter/device
- product/reference compile PASS
- partial workgroup no-hang
- tile fallback zero
- gamma-proof continuity
- final-surface continuity
- relaunch identity

## 31.3 Production promotion

본 명세는 Production Pointer를 변경하지 않는다.

R1A PASS만으로 `TDT-RESAMPLE-RUNTIME-01` 전체 또는 제품 리샘플러 완성을 주장할 수 없다.

---

# 32. Handoff to R1B

`TDT-RESAMPLE-RUNTIME-01-R1B`는 다음을 소유한다.

```text
Deterministic Multi-Stage Downscale
Stage Ratio Cap
Exact Target Dimensions
Scale-Correct Footprint Coverage
Intermediate Surface Chain
Preview/Export Shared Final Dimension
```

R1A는 scale 0.5 미만을 거부함으로써 고정 footprint를 과도한 축소비에 사용하지 않는다.

R1B가 stage planner를 제공하면 R1A의 corrected EWA pass를 stage executor로 재사용한다.

---

# 33. Handoff to R1C

`TDT-RESAMPLE-RUNTIME-01-R1C`는 다음을 소유한다.

```text
Spatial Gradient
Integrated Structure Tensor
Gaussian Integration
Eigenvalue/Eigenvector
Coherence
Tensor-Gated Ellipse
Anisotropic Direction Truth
```

R1A는 legacy tensor texture channel contract를 보존한다.

R1C는 같은 binding slot에 canonical tensor field를 공급하거나 ABI-versioned binding으로 이행한다.

---

# 34. Handoff to R1D

`TDT-RESAMPLE-RUNTIME-01-R1D`는 다음 caller migration을 소유한다.

```text
Adaptive EWA facade
engineAuto aniso branch
Export WGSL path
Worker broker
remaining positional ABI callers
legacy raw pipeline compatibility
```

R1D에서 다음이 모두 0이 된 뒤에만 compatibility branch를 제거한다.

```text
legacyPositionalCallCount
legacyAliasNormalizationCount
rawPipelineCompatibilityCount
nonCanonicalAnisoDispatchCount
```

---

# 35. Handoff to R2

`TDT-RESAMPLE-RUNTIME-01-R2`는 performance optimization을 소유한다.

R2는 R1A direct reference와 corrected tiled result를 golden baseline으로 사용한다.

허용되는 최적화:

- vectorized shared loads
- subgroup-assisted load where portable
- larger workgroup size
- bind-group reuse
- same-encoder pass chaining
- uniform ring expansion
- timestamp-driven tuning

다음은 금지한다.

- barrier uniformity 파괴
- workgroup-common origin 파괴
- tile miss 증가
- reference parity 상실
- hidden CPU fallback

---

# 36. Completion checklist

## Source

- [ ] Existing facade files preserved
- [ ] Existing exports preserved
- [ ] Runtime caller canonicalized
- [ ] Legacy positional ABI retained
- [ ] Alias ambiguity rejection implemented
- [ ] Params ABI 64 bytes
- [ ] WGSL/packer/minBindingSize exact
- [ ] `enable f16` removed
- [ ] Product entrypoint `main` preserved
- [ ] Workgroup size 8x8
- [ ] Tile extent conservative
- [ ] Tile origin workgroup-common
- [ ] Barrier uniform
- [ ] Bounds return after barrier
- [ ] Independent direct reference present
- [ ] Queue fence present
- [ ] Temporary resources closed
- [ ] Output Surface registered
- [ ] Active Graph assets regenerated
- [ ] Source receipt emitted

## Runtime

- [ ] Canonical ABI smoke
- [ ] Legacy ABI smoke
- [ ] Odd dimensions no hang
- [ ] Product/reference parity
- [ ] Tile fallback zero
- [ ] Constant preservation
- [ ] 100-run plateau
- [ ] Device loss fail-closed
- [ ] Gamma-proof continuity
- [ ] Final-surface continuity

## Honesty

- [ ] R1B features not claimed
- [ ] R1C tensor truth not claimed
- [ ] R1D caller retirement not claimed
- [ ] R2 optimization not claimed
- [ ] Windows packaged evidence not fabricated
- [ ] Production Pointer unchanged

---

# 37. Final acceptance statement

`TDT-RESAMPLE-RUNTIME-01-R1A`는 다음 문장이 모두 참일 때만 PASS다.

> 기존 `runDeltaKStack`, `pipeEWA`, Pipeline ordering과 GPUTexture return contract가 보존됐다.  
> 기존 positional caller와 canonical object caller가 같은 normalized request를 만든다.  
> WGSL uniform binding은 정확히 64바이트 ABI를 사용한다.  
> 모든 invocation은 shared tile load 이후 동일 barrier에 참여한다.  
> shared tile origin과 coordinate mapping은 workgroup 전체에서 하나다.  
> admitted single-stage scale 범위에서 tile miss는 0이다.  
> corrected tiled shader는 independent direct-load reference와 허용 오차 내에서 일치한다.  
> temporary GPU resources는 queue completion 뒤 닫히고 output texture만 downstream으로 소유권이 이동한다.  
> 실패 시 다른 리샘플러나 원본 반환으로 조용히 빠지지 않는다.  
> 본 리비전은 멀티스테이지와 structure tensor 완성을 주장하지 않는다.

이 조건이 닫히면 기존 파이프라인을 끊지 않은 상태에서 EWA 실행 기반이 정상화된다.

다음 구현 단계는 `TDT-RESAMPLE-RUNTIME-01-R1B`의 deterministic multi-stage coverage다.
